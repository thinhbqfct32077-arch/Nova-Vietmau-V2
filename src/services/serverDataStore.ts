import fs from 'fs';
import path from 'path';
import {
  HealthReminder,
  NovaVideoItem,
  DetailedPost,
  PostComment,
  AppNotification,
  NotificationPreferences,
  ProductReview,
  UserRole,
  VideoModerationStatus,
  VideoCategory,
} from '../types';
import { NOVA_VIDEOS_DATA, INITIAL_DETAILED_POSTS } from '../data/mockData';

export interface RequestActor {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
}

export class ForbiddenError extends Error {
  status = 403;
}
export class NotFoundError extends Error {
  status = 404;
}
export class ValidationError extends Error {
  status = 400;
}

const KNOWN_USER_DIRECTORY: { id: string; name: string; aliases: string[] }[] = [
  { id: 'usr-1', name: 'Khánh Băng', aliases: ['khanh bang', 'khánh băng'] },
  { id: 'usr-2', name: 'Mẹ Lan Hương', aliases: ['lan huong', 'lan hương', 'mẹ lan hương'] },
  { id: 'usr-admin', name: 'Quản trị viên Nova', aliases: ['admin', 'quan tri vien nova', 'quản trị viên nova'] },
  { id: 'usr-expert-ha', name: 'Bác sĩ Thu Hà', aliases: ['thu ha', 'thu hà', 'bác sĩ thu hà'] },
  { id: 'usr-expert-lan', name: 'Mẹ Nguyễn Lan', aliases: ['nguyen lan', 'nguyễn lan', 'mẹ nguyễn lan'] },
  { id: 'usr-mom-ngoc', name: 'Mẹ Bích Ngọc', aliases: ['bich ngoc', 'bích ngọc', 'mẹ bích ngọc'] },
  { id: 'usr-mom-chi', name: 'Mẹ Thùy Chi', aliases: ['thuy chi', 'thùy chi', 'mẹ thùy chi'] },
  { id: 'usr-mom-tra', name: 'Mẹ Hương Trà', aliases: ['huong tra', 'hương trà', 'mẹ hương trà'] },
  { id: 'usr-mom-vy', name: 'Mẹ Phương Vy', aliases: ['phuong vy', 'phương vy', 'mẹ phương vy'] },
];

export function extractMentions(content: string, extraUsers: { id: string; name: string }[] = []): { id: string; name: string }[] {
  const lower = content.toLowerCase();
  if (!lower.includes('@')) return [];

  const matched = new Map<string, string>();

  for (const u of extraUsers) {
    if (!u.id || !u.name) continue;
    const token = `@${u.name.toLowerCase()}`;
    if (lower.includes(token)) {
      matched.set(u.id, u.name);
    }
  }

  for (const u of KNOWN_USER_DIRECTORY) {
    for (const alias of u.aliases) {
      if (lower.includes(`@${alias}`)) {
        matched.set(u.id, u.name);
        break;
      }
    }
  }

  return Array.from(matched.entries()).map(([id, name]) => ({ id, name }));
}

export class ServerDataStore {
  private dataDir: string;

  constructor(dataDir: string) {
    this.dataDir = dataDir;
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private readJson<T>(filename: string, fallback: T): T {
    const filePath = path.join(this.dataDir, filename);
    try {
      if (!fs.existsSync(filePath)) {
        this.writeJson(filename, fallback);
        return fallback;
      }
      const raw = fs.readFileSync(filePath, 'utf-8');
      if (!raw.trim()) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  private writeJson<T>(filename: string, data: T): void {
    const filePath = path.join(this.dataDir, filename);
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  private formatNowTime(): string {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm} · Hôm nay`;
  }

  // =========================================================================
  // 1. REMINDERS (Per-account isolation, NO fake pre-seeded data)
  // =========================================================================
  getReminders(userId: string): HealthReminder[] {
    if (!userId) throw new ValidationError('Thiếu thông tin tài khoản');
    const all = this.readJson<Record<string, HealthReminder[]>>('reminders.json', {});
    return Array.isArray(all[userId]) ? all[userId] : [];
  }

  saveReminders(userId: string, reminders: HealthReminder[]): HealthReminder[] {
    if (!userId) throw new ValidationError('Thiếu thông tin tài khoản');
    const all = this.readJson<Record<string, HealthReminder[]>>('reminders.json', {});
    const sanitized = reminders.map((r) => ({ ...r, userId }));
    all[userId] = sanitized;
    this.writeJson('reminders.json', all);
    return sanitized;
  }

  // =========================================================================
  // 2. NOTIFICATION PREFERENCES & NOTIFICATIONS (Real, Deduplicated, Opt-in)
  // =========================================================================
  getPreferences(userId: string): NotificationPreferences {
    const all = this.readJson<Record<string, NotificationPreferences>>('prefs.json', {});
    return (
      all[userId] || {
        videoEnabled: true,
        communityEnabled: true,
        reminderSoundEnabled: true,
      }
    );
  }

  updatePreferences(
    userId: string,
    partial: Partial<NotificationPreferences>
  ): NotificationPreferences {
    const all = this.readJson<Record<string, NotificationPreferences>>('prefs.json', {});
    const current = this.getPreferences(userId);
    const updated = { ...current, ...partial };
    all[userId] = updated;
    this.writeJson('prefs.json', all);
    return updated;
  }

  private dispatchNotification(
    notif: Omit<AppNotification, 'id' | 'timestamp' | 'createdAt'>
  ): AppNotification | null {
    const recipientId = notif.recipientId;
    if (!recipientId) return null;

    // Rule: NEVER notify actor of their own action
    if (notif.actorId && notif.actorId === recipientId) {
      return null;
    }

    // Rule: Respect user notification preference toggles
    const prefs = this.getPreferences(recipientId);
    if (notif.category === 'video' && !prefs.videoEnabled) return null;
    if (notif.category === 'community' && !prefs.communityEnabled) return null;
    if (notif.category === 'shop' && prefs.shopEnabled === false) return null;
    if (notif.category === 'family' && prefs.familyEnabled === false) return null;

    const all = this.readJson<AppNotification[]>('notifications.json', []);

    // Rule: Coalesce / Deduplicate if dedupeKey matches an existing notification
    if (notif.dedupeKey) {
      const existingIdx = all.findIndex(
        (n) => n.recipientId === recipientId && n.dedupeKey === notif.dedupeKey
      );
      if (existingIdx !== -1) {
        const existing = all[existingIdx];
        const updated: AppNotification = {
          ...existing,
          title: notif.title,
          description: notif.description,
          timestamp: this.formatNowTime(),
          createdAt: new Date().toISOString(),
          isRead: false,
          aggregateCount: (existing.aggregateCount || 1) + 1,
        };
        all.splice(existingIdx, 1);
        all.unshift(updated);
        this.writeJson('notifications.json', all);
        return updated;
      }
    }

    const created: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: this.formatNowTime(),
      createdAt: new Date().toISOString(),
      aggregateCount: 1,
    };

    all.unshift(created);
    this.writeJson('notifications.json', all);
    return created;
  }

  public sendExternalNotification(
    notif: Omit<AppNotification, 'id' | 'timestamp' | 'createdAt'>
  ): AppNotification | null {
    return this.dispatchNotification(notif);
  }

  getNotifications(userId: string, category?: string): AppNotification[] {
    const all = this.readJson<AppNotification[]>('notifications.json', []);
    return all.filter((n) => {
      if (n.recipientId !== userId) return false;
      if (category && category !== 'all' && n.category !== category) return false;
      return true;
    });
  }

  markNotificationRead(userId: string, notifId: string): AppNotification[] {
    const all = this.readJson<AppNotification[]>('notifications.json', []);
    const updated = all.map((n) =>
      n.id === notifId && n.recipientId === userId ? { ...n, isRead: true } : n
    );
    this.writeJson('notifications.json', updated);
    return updated.filter((n) => n.recipientId === userId);
  }

  markAllNotificationsRead(userId: string, category?: string): AppNotification[] {
    const all = this.readJson<AppNotification[]>('notifications.json', []);
    const updated = all.map((n) => {
      if (n.recipientId !== userId) return n;
      if (category && category !== 'all' && n.category !== category) return n;
      return { ...n, isRead: true };
    });
    this.writeJson('notifications.json', updated);
    return updated.filter((n) => n.recipientId === userId);
  }

  deleteNotification(userId: string, notifId: string): AppNotification[] {
    const all = this.readJson<AppNotification[]>('notifications.json', []);
    const updated = all.filter((n) => !(n.id === notifId && n.recipientId === userId));
    this.writeJson('notifications.json', updated);
    return updated.filter((n) => n.recipientId === userId);
  }

  // =========================================================================
  // 3. VIDEOS (Upload, Edit, Delete, Admin Moderation, Notifications)
  // =========================================================================
  getVideos(
    requesterId: string,
    requesterRole: UserRole = 'user',
    scope: 'feed' | 'mine' | 'moderation' = 'feed'
  ): NovaVideoItem[] {
    const all = this.readJson<NovaVideoItem[]>('videos.json', NOVA_VIDEOS_DATA);
    const filtered = all.filter((v) => {
      if (scope === 'moderation') {
        return requesterRole === 'admin' || requesterRole === 'moderator';
      }
      if (scope === 'mine') {
        return v.authorId === requesterId;
      }
      // Feed shows approved videos; admins can optionally filter in moderation tab
      return v.status === 'approved';
    });

    return filtered.map((v) => ({
      ...v,
      isLiked: Array.isArray(v.likedBy) ? v.likedBy.includes(requesterId) : false,
    }));
  }

  createVideo(
    input: {
      title: string;
      description: string;
      videoUrl: string;
      poster?: string;
      category: Exclude<VideoCategory, 'all'>;
      hashtags?: string[];
      musicTitle?: string;
    },
    actor: RequestActor
  ): NovaVideoItem {
    if (!input.title || !input.title.trim()) {
      throw new ValidationError('Vui lòng nhập tiêu đề video.');
    }
    if (!input.videoUrl || !input.videoUrl.trim()) {
      throw new ValidationError('Vui lòng tải lên tệp video hoặc nhập đường dẫn hợp lệ.');
    }
    if (actor.id === 'usr-guest') {
      throw new ForbiddenError('Tài khoản khách cần đăng nhập tài khoản thành viên để đăng video.');
    }

    const all = this.readJson<NovaVideoItem[]>('videos.json', NOVA_VIDEOS_DATA);
    const initialStatus: VideoModerationStatus = actor.role === 'admin' ? 'approved' : 'pending';
    const initials = actor.name
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'NV';

    const newVideo: NovaVideoItem = {
      id: `vid-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      videoUrl: input.videoUrl.trim(),
      poster: input.poster?.trim() || '/posters/yoga.jpg',
      title: input.title.trim(),
      description: (input.description || '').trim() || 'Video chia sẻ từ cộng đồng Nova Việt Mẫu.',
      category: input.category || 'thai_giao_nhac',
      hashtags:
        Array.isArray(input.hashtags) && input.hashtags.length > 0
          ? input.hashtags
          : ['#NovaThaiGiao', '#MeVaBe'],
      authorId: actor.id,
      channelName: actor.name,
      channelAvatar: initials,
      isVerified: actor.role === 'admin',
      isFollowing: false,
      musicTitle: input.musicTitle?.trim() || `♫ Âm thanh gốc · ${actor.name}`,
      likes: 0,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: false,
      likedBy: [],
      status: initialStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
    };

    all.unshift(newVideo);
    this.writeJson('videos.json', all);

    // If admin published directly as approved, notify opted-in subscribers
    if (initialStatus === 'approved') {
      this.notifyNewApprovedVideo(newVideo, actor.id);
    }

    return newVideo;
  }

  private notifyNewApprovedVideo(video: NovaVideoItem, approverId: string): void {
    const knownRecipients = ['usr-1', 'usr-2'];
    for (const recipientId of knownRecipients) {
      if (recipientId === video.authorId || recipientId === approverId) continue;
      this.dispatchNotification({
        recipientId,
        title: `Video thai giáo mới: ${video.title}`,
        description: `${video.channelName} vừa chia sẻ video mới trong chuyên mục thai giáo.`,
        category: 'video',
        subType: 'video_new',
        actorId: video.authorId,
        actorName: video.channelName,
        targetId: video.id,
        dedupeKey: `video_new_${video.id}`,
        isRead: false,
        actionScreen: 'video',
      });
    }
  }

  updateVideo(
    videoId: string,
    partial: Partial<Pick<NovaVideoItem, 'title' | 'description' | 'category' | 'poster' | 'hashtags' | 'status'>>,
    actor: RequestActor
  ): NovaVideoItem {
    const all = this.readJson<NovaVideoItem[]>('videos.json', NOVA_VIDEOS_DATA);
    const idx = all.findIndex((v) => v.id === videoId);
    if (idx === -1) throw new NotFoundError('Không tìm thấy video.');

    const existing = all[idx];
    if (existing.authorId !== actor.id && actor.role !== 'admin') {
      throw new ForbiddenError('Bạn không có quyền chỉnh sửa video này.');
    }

    // Non-admin cannot change moderation status directly to 'approved'
    const nextStatus =
      actor.role === 'admin' && partial.status
        ? partial.status
        : partial.status === 'hidden' && existing.authorId === actor.id
        ? 'hidden'
        : existing.status;

    const updated: NovaVideoItem = {
      ...existing,
      title: partial.title !== undefined ? partial.title.trim() : existing.title,
      description: partial.description !== undefined ? partial.description.trim() : existing.description,
      category: partial.category !== undefined ? partial.category : existing.category,
      poster: partial.poster !== undefined ? partial.poster : existing.poster,
      hashtags: partial.hashtags !== undefined ? partial.hashtags : existing.hashtags,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    };

    all[idx] = updated;
    this.writeJson('videos.json', all);
    return updated;
  }

  moderateVideo(
    videoId: string,
    status: VideoModerationStatus,
    rejectionReason: string | undefined,
    actor: RequestActor
  ): NovaVideoItem {
    if (actor.role !== 'admin' && actor.role !== 'moderator') {
      throw new ForbiddenError('Chỉ quản trị viên hoặc điều phối viên mới có quyền kiểm duyệt video.');
    }

    const all = this.readJson<NovaVideoItem[]>('videos.json', NOVA_VIDEOS_DATA);
    const idx = all.findIndex((v) => v.id === videoId);
    if (idx === -1) throw new NotFoundError('Không tìm thấy video.');

    const prevStatus = all[idx].status;
    const updated: NovaVideoItem = {
      ...all[idx],
      status,
      rejectionReason: status === 'rejected' ? rejectionReason?.trim() || 'Nội dung chưa phù hợp tiêu chuẩn cộng đồng.' : undefined,
      updatedAt: new Date().toISOString(),
    };
    all[idx] = updated;
    this.writeJson('videos.json', all);

    // Trigger real notifications when moderation status changes
    if (status === 'approved' && prevStatus !== 'approved') {
      this.dispatchNotification({
        recipientId: updated.authorId,
        title: 'Video của bạn đã được duyệt!',
        description: `Video "${updated.title}" đã được hiển thị trên kênh Video Thai Giáo.`,
        category: 'video',
        subType: 'video_approved',
        actorId: actor.id,
        actorName: actor.name,
        targetId: updated.id,
        dedupeKey: `video_approved_${updated.id}`,
        isRead: false,
        actionScreen: 'video',
      });
      this.notifyNewApprovedVideo(updated, actor.id);
    } else if (status === 'rejected') {
      this.dispatchNotification({
        recipientId: updated.authorId,
        title: 'Video chưa được phê duyệt',
        description: `Video "${updated.title}" bị từ chối. Lý do: ${updated.rejectionReason}`,
        category: 'video',
        subType: 'video_rejected',
        actorId: actor.id,
        actorName: actor.name,
        targetId: updated.id,
        dedupeKey: `video_rejected_${updated.id}_${Date.now()}`,
        isRead: false,
        actionScreen: 'video',
      });
    }

    return updated;
  }

  deleteVideo(videoId: string, actor: RequestActor): { deletedId: string; videoUrl: string } {
    const all = this.readJson<NovaVideoItem[]>('videos.json', NOVA_VIDEOS_DATA);
    const idx = all.findIndex((v) => v.id === videoId);
    if (idx === -1) throw new NotFoundError('Không tìm thấy video.');

    const target = all[idx];
    if (target.authorId !== actor.id && actor.role !== 'admin') {
      throw new ForbiddenError('Bạn không có quyền xóa video này.');
    }

    all.splice(idx, 1);
    this.writeJson('videos.json', all);
    return { deletedId: videoId, videoUrl: target.videoUrl };
  }

  toggleVideoLike(videoId: string, actorId: string): NovaVideoItem {
    const all = this.readJson<NovaVideoItem[]>('videos.json', NOVA_VIDEOS_DATA);
    const idx = all.findIndex((v) => v.id === videoId);
    if (idx === -1) throw new NotFoundError('Không tìm thấy video.');

    const video = all[idx];
    const likedBy = Array.isArray(video.likedBy) ? [...video.likedBy] : [];
    const existingIdx = likedBy.indexOf(actorId);
    let isLiked = false;

    if (existingIdx !== -1) {
      likedBy.splice(existingIdx, 1);
      video.likes = Math.max(0, video.likes - 1);
      isLiked = false;
    } else {
      likedBy.push(actorId);
      video.likes += 1;
      isLiked = true;
    }

    video.likedBy = likedBy;
    video.isLiked = isLiked;
    all[idx] = video;
    this.writeJson('videos.json', all);
    return video;
  }

  addVideoComment(videoId: string, actor: RequestActor, content: string): NovaVideoItem {
    if (!content || !content.trim()) throw new ValidationError('Nội dung bình luận trống.');
    const all = this.readJson<NovaVideoItem[]>('videos.json', NOVA_VIDEOS_DATA);
    const idx = all.findIndex((v) => v.id === videoId);
    if (idx === -1) throw new NotFoundError('Không tìm thấy video.');

    const initials = actor.name
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'MB';

    const video = all[idx];
    video.comments.unshift({
      id: `vc-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      authorId: actor.id,
      author: actor.name,
      avatar: initials,
      content: content.trim(),
      timeAgo: 'Vừa xong',
      likes: 0,
    });
    video.commentsCount = video.comments.length;
    all[idx] = video;
    this.writeJson('videos.json', all);
    return { ...video, isLiked: video.likedBy?.includes(actor.id) || false };
  }

  // =========================================================================
  // 4. COMMUNITY POSTS, REPLIES, @MENTIONS & INTERACTION NOTIFICATIONS
  // =========================================================================
  getPosts(requesterId: string, blockedUserIds: string[] = []): DetailedPost[] {
    const all = this.readJson<DetailedPost[]>('community.json', INITIAL_DETAILED_POSTS);
    return all
      .filter((p) => {
        if (p.status === 'removed' || p.status === 'hidden') return false;
        if (Array.isArray(p.hiddenBy) && p.hiddenBy.includes(requesterId)) return false;
        if (blockedUserIds.includes(p.authorId)) return false;
        return true;
      })
      .map((p) => ({
        ...p,
        isLiked: Array.isArray(p.likedBy) ? p.likedBy.includes(requesterId) : false,
        isBookmarked: Array.isArray(p.bookmarkedBy) ? p.bookmarkedBy.includes(requesterId) : false,
        commentsCount: Array.isArray(p.comments) ? p.comments.length : p.commentsCount,
      }));
  }

  createPost(
    input: {
      title: string;
      content: string;
      category: DetailedPost['category'];
      groupType?: DetailedPost['groupType'];
      image?: string;
      weekTag?: string;
    },
    actor: RequestActor
  ): DetailedPost {
    if (!input.title.trim() || !input.content.trim()) {
      throw new ValidationError('Vui lòng nhập tiêu đề và nội dung bài viết.');
    }
    const all = this.readJson<DetailedPost[]>('community.json', INITIAL_DETAILED_POSTS);
    const initials = actor.name
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'MB';

    const newPost: DetailedPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      authorId: actor.id,
      author: actor.name,
      avatar: initials,
      isVerified: actor.role === 'admin' || actor.role === 'moderator',
      category: input.category || 'experience',
      groupType: input.groupType || 'weekly_group',
      weekTag: input.weekTag || 'Mẹ bầu Nova',
      title: input.title.trim(),
      content: input.content.trim(),
      image: input.image?.trim() || undefined,
      likes: 0,
      likedBy: [],
      bookmarkedBy: [],
      hiddenBy: [],
      status: 'approved',
      commentsCount: 0,
      timeAgo: 'Vừa xong',
      createdAt: new Date().toISOString(),
      isLiked: false,
      isBookmarked: false,
      comments: [],
    };

    all.unshift(newPost);
    this.writeJson('community.json', all);
    return newPost;
  }

  togglePostLike(postId: string, actor: RequestActor): DetailedPost {
    const all = this.readJson<DetailedPost[]>('community.json', INITIAL_DETAILED_POSTS);
    const idx = all.findIndex((p) => p.id === postId);
    if (idx === -1) throw new NotFoundError('Không tìm thấy bài viết.');

    const post = all[idx];
    const likedBy = Array.isArray(post.likedBy) ? [...post.likedBy] : [];
    const existingIdx = likedBy.indexOf(actor.id);
    let isLiked = false;

    if (existingIdx !== -1) {
      likedBy.splice(existingIdx, 1);
      post.likes = Math.max(0, post.likes - 1);
      isLiked = false;
    } else {
      likedBy.push(actor.id);
      post.likes += 1;
      isLiked = true;

      // Dispatch coalesced/deduplicated like notification to post author (never self)
      if (post.authorId !== actor.id) {
        this.dispatchNotification({
          recipientId: post.authorId,
          title: `${actor.name} đã thích bài viết của bạn`,
          description: `"${post.title}"`,
          category: 'community',
          subType: 'community_like',
          actorId: actor.id,
          actorName: actor.name,
          targetId: post.id,
          dedupeKey: `community_like_${post.id}_${actor.id}`,
          isRead: false,
          actionScreen: 'community',
        });
      }
    }

    post.likedBy = likedBy;
    post.isLiked = isLiked;
    all[idx] = post;
    this.writeJson('community.json', all);
    return post;
  }

  addPostComment(
    postId: string,
    actor: RequestActor,
    content: string,
    parentId?: string
  ): { post: DetailedPost; comment: PostComment } {
    if (!content || !content.trim()) {
      throw new ValidationError('Vui lòng nhập nội dung bình luận.');
    }

    const all = this.readJson<DetailedPost[]>('community.json', INITIAL_DETAILED_POSTS);
    const idx = all.findIndex((p) => p.id === postId);
    if (idx === -1) throw new NotFoundError('Không tìm thấy bài viết.');

    const post = all[idx];
    const parentComment = parentId ? post.comments.find((c) => c.id === parentId) : undefined;

    const extraUsers = [
      { id: post.authorId, name: post.author },
      ...post.comments.map((c) => ({ id: c.authorId, name: c.author })),
    ];
    const mentions = extractMentions(content, extraUsers);

    const initials = actor.name
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'MB';

    const newComment: PostComment = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      authorId: actor.id,
      author: actor.name,
      avatar: initials,
      content: content.trim(),
      timeAgo: 'Vừa xong',
      createdAt: new Date().toISOString(),
      parentId: parentComment?.id,
      replyToAuthor: parentComment?.author,
      mentions: mentions.map((m) => m.name),
    };

    post.comments.push(newComment);
    post.commentsCount = post.comments.length;
    all[idx] = post;
    this.writeJson('community.json', all);

    // Track already-notified recipients so we don't duplicate notifications for same comment
    const notifiedRecipients = new Set<string>();

    // 1. Reply notification
    if (parentComment && parentComment.authorId !== actor.id) {
      notifiedRecipients.add(parentComment.authorId);
      this.dispatchNotification({
        recipientId: parentComment.authorId,
        title: `${actor.name} đã trả lời bình luận của bạn`,
        description: `"${newComment.content.slice(0, 80)}" trong bài "${post.title}"`,
        category: 'community',
        subType: 'community_reply',
        actorId: actor.id,
        actorName: actor.name,
        targetId: post.id,
        commentId: newComment.id,
        dedupeKey: `community_reply_${newComment.id}_${parentComment.authorId}`,
        isRead: false,
        actionScreen: 'community',
      });
    }

    // 2. @Mention notifications
    for (const mentioned of mentions) {
      if (mentioned.id === actor.id || notifiedRecipients.has(mentioned.id)) continue;
      notifiedRecipients.add(mentioned.id);
      this.dispatchNotification({
        recipientId: mentioned.id,
        title: `${actor.name} đã nhắc đến bạn`,
        description: `"${newComment.content.slice(0, 80)}" trong bài "${post.title}"`,
        category: 'community',
        subType: 'community_mention',
        actorId: actor.id,
        actorName: actor.name,
        targetId: post.id,
        commentId: newComment.id,
        dedupeKey: `community_mention_${newComment.id}_${mentioned.id}`,
        isRead: false,
        actionScreen: 'community',
      });
    }

    // 3. Post comment notification to post author (if not self and not already notified above)
    if (post.authorId !== actor.id && !notifiedRecipients.has(post.authorId)) {
      this.dispatchNotification({
        recipientId: post.authorId,
        title: `${actor.name} đã bình luận bài viết của bạn`,
        description: `"${newComment.content.slice(0, 80)}" trong "${post.title}"`,
        category: 'community',
        subType: 'community_comment',
        actorId: actor.id,
        actorName: actor.name,
        targetId: post.id,
        commentId: newComment.id,
        dedupeKey: `community_comment_${post.id}_${actor.id}_${Math.floor(Date.now() / 60000)}`,
        isRead: false,
        actionScreen: 'community',
      });
    }

    return {
      post: { ...post, isLiked: post.likedBy?.includes(actor.id) || false },
      comment: newComment,
    };
  }

  // =========================================================================
  // 5. SHOP PRODUCT REVIEWS (Real User Reviews Only)
  // =========================================================================
  getAllReviews(): Record<string, ProductReview[]> {
    return this.readJson<Record<string, ProductReview[]>>('reviews.json', {});
  }

  getProductReviews(productId: string): {
    reviews: ProductReview[];
    rating: number | undefined;
    reviewsCount: number;
  } {
    const all = this.getAllReviews();
    const list = Array.isArray(all[productId]) ? all[productId] : [];
    if (list.length === 0) {
      return { reviews: [], rating: undefined, reviewsCount: 0 };
    }
    const avg = list.reduce((sum, r) => sum + r.rating, 0) / list.length;
    return {
      reviews: list,
      rating: Math.round(avg * 10) / 10,
      reviewsCount: list.length,
    };
  }

  addProductReview(
    productId: string,
    actor: RequestActor,
    rating: number,
    comment: string
  ): { reviews: ProductReview[]; rating: number; reviewsCount: number } {
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      throw new ValidationError('Số sao đánh giá phải từ 1 đến 5.');
    }
    if (!comment || !comment.trim()) {
      throw new ValidationError('Vui lòng nhập nội dung nhận xét sản phẩm.');
    }
    const all = this.getAllReviews();
    const list = Array.isArray(all[productId]) ? all[productId] : [];
    const newReview: ProductReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      userId: actor.id,
      authorName: actor.name,
      rating: Math.round(rating),
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };
    const nextList = [newReview, ...list];
    all[productId] = nextList;
    this.writeJson('reviews.json', all);
    const avg = nextList.reduce((sum, r) => sum + r.rating, 0) / nextList.length;
    return {
      reviews: nextList,
      rating: Math.round(avg * 10) / 10,
      reviewsCount: nextList.length,
    };
  }
}
