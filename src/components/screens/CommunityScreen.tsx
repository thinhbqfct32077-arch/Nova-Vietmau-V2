import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INITIAL_DETAILED_POSTS } from '../../data/mockData';
import { COMMUNITY_GROUPS, COMMUNITY_GUIDELINES } from '../../data/ecosystemData';
import { NovaImage } from '../NovaBrandMark';
import {
  DetailedPost,
  UserProfile,
  AppNotification,
  PostComment,
  CommunityGroupType,
} from '../../types';
import { apiService } from '../../services/apiService';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Search,
  PlusCircle,
  CheckCircle2,
  X,
  Send,
  Bell,
  Reply,
  AtSign,
  CheckCheck,
  RefreshCw,
  Flag,
  EyeOff,
  ShieldCheck,
  ImagePlus,
  UserPlus,
  UserCheck,
  Pin,
  Trash2,
  Ban,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CommunityScreenProps {
  user?: UserProfile;
  focusPostId?: string | null;
  focusCommentId?: string | null;
  onClearFocusTarget?: () => void;
  onUpdateUser?: (user: UserProfile) => void;
}

export const CommunityScreen: React.FC<CommunityScreenProps> = ({
  user,
  focusPostId,
  focusCommentId,
  onClearFocusTarget,
  onUpdateUser,
}) => {
  const [posts, setPosts] = useState<DetailedPost[]>(INITIAL_DETAILED_POSTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<CommunityGroupType>('all');
  const [sortTab, setSortTab] = useState<'latest' | 'featured' | 'saved'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [activeCommentPost, setActiveCommentPost] = useState<DetailedPost | null>(null);
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<PostComment | null>(null);
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);

  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<DetailedPost['category']>('experience');
  const [newGroupType, setNewGroupType] = useState<Exclude<CommunityGroupType, 'all'>>('weekly_group');
  const [newPostImage, setNewPostImage] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [poppingHeartId, setPoppingHeartId] = useState<string | null>(null);

  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    type: 'post' | 'comment';
    id: string;
    title: string;
  } | null>(null);
  const [reportReason, setReportReason] = useState('');

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [communityNotifs, setCommunityNotifs] = useState<AppNotification[]>([]);
  const [communityNotifEnabled, setCommunityNotifEnabled] = useState(true);

  const postRefs = useRef<Record<string, HTMLElement | null>>({});
  const commentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const canModerate = user?.role === 'admin' || user?.role === 'moderator';
  const followingIds = user?.followingUserIds || [];

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'experience', label: 'Kinh nghiệm mang thai' },
    { id: 'nutrition', label: 'Dinh dưỡng' },
    { id: 'birth_prep', label: 'Sắm đồ đi sinh' },
    { id: 'confession', label: 'Góc tâm sự' },
  ];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  const syncCommunityData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setErrorMsg(null);
    try {
      const [fetchedPosts, fetchedNotifs, prefs] = await Promise.all([
        apiService.fetchCommunityPosts(user),
        apiService.fetchNotifications('community', user),
        apiService.fetchNotificationPrefs(user),
      ]);
      setPosts(fetchedPosts);
      setCommunityNotifs(fetchedNotifs);
      setCommunityNotifEnabled(prefs.communityEnabled);

      setActiveCommentPost((curr) =>
        curr ? fetchedPosts.find((p) => p.id === curr.id) || curr : null
      );
    } catch (err: any) {
      if (!silent) {
        setErrorMsg(err?.message || 'Không thể đồng bộ dữ liệu cộng đồng.');
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    syncCommunityData(false);
    const timer = window.setInterval(() => syncCommunityData(true), 15000);
    const onFocus = () => syncCommunityData(true);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [user?.id]);

  useEffect(() => {
    if (focusPostId && posts.length > 0) {
      jumpToPostAndComment(focusPostId, focusCommentId || undefined);
      onClearFocusTarget?.();
    }
  }, [focusPostId, focusCommentId, posts.length]);

  const jumpToPostAndComment = (postId: string, commentId?: string) => {
    setSelectedCategory('all');
    setSelectedGroup('all');
    setSortTab('latest');
    setSearchQuery('');
    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) {
      showToast('Bài viết không còn tồn tại.');
      return;
    }

    setHighlightedPostId(postId);
    setTimeout(() => {
      postRefs.current[postId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    if (commentId) {
      setActiveCommentPost(targetPost);
      setHighlightedCommentId(commentId);
      setTimeout(() => {
        commentRefs.current[commentId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 280);
    }

    setTimeout(() => {
      setHighlightedPostId(null);
      setHighlightedCommentId(null);
    }, 3500);
  };

  const handleToggleLike = async (postId: string) => {
    setPoppingHeartId(postId);
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const isLiked = !p.isLiked;
        if (isLiked) {
          try {
            confetti({
              particleCount: 16,
              spread: 38,
              origin: { y: 0.6 },
              colors: ['#B55841', '#F2ECE3', '#C4A46B'],
              disableForReducedMotion: true,
            });
          } catch {}
        }
        return { ...p, isLiked, likes: isLiked ? p.likes + 1 : Math.max(0, p.likes - 1) };
      })
    );
    setTimeout(() => setPoppingHeartId(null), 400);

    try {
      const updated = await apiService.toggleCommunityPostLike(postId, user);
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
    } catch {}
  };

  const handleToggleBookmark = async (postId: string) => {
    try {
      const updated = await apiService.toggleCommunityBookmark(postId, user);
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
      showToast(updated.isBookmarked ? 'Đã lưu bài viết!' : 'Đã bỏ lưu bài viết');
    } catch {}
  };

  const handleHidePost = async (postId: string) => {
    try {
      await apiService.hideCommunityPost(postId, user);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showToast('Đã ẩn bài viết khỏi bảng tin của bạn');
    } catch {}
  };

  const handleToggleFollowAuthor = async (authorId: string, authorName: string) => {
    if (!user || authorId === user.id) return;
    const isFollowing = followingIds.includes(authorId);
    const nextFollowing = isFollowing
      ? followingIds.filter((id) => id !== authorId)
      : [...followingIds, authorId];
    try {
      const updatedUser = await apiService.updatePrivacySettings(
        { followingUserIds: nextFollowing },
        user
      );
      onUpdateUser?.(updatedUser);
      showToast(isFollowing ? `Đã bỏ theo dõi ${authorName}` : `Đang theo dõi ${authorName}`);
    } catch {}
  };

  const handleBlockAuthor = async (authorId: string, authorName: string) => {
    if (!user || authorId === user.id) return;
    const blocked = Array.from(new Set([...(user.blockedUserIds || []), authorId]));
    try {
      const updatedUser = await apiService.updatePrivacySettings(
        { blockedUserIds: blocked },
        user
      );
      onUpdateUser?.(updatedUser);
      await syncCommunityData(true);
      showToast(`Đã chặn hiển thị từ ${authorName}`);
    } catch {}
  };

  const handleModeratePost = async (
    postId: string,
    status: 'approved' | 'hidden' | 'removed',
    isFeatured?: boolean
  ) => {
    try {
      await apiService.moderateCommunityPost(postId, status, isFeatured, user);
      await syncCommunityData(true);
      showToast(
        isFeatured !== undefined
          ? isFeatured
            ? 'Đã ghim bài viết nổi bật'
            : 'Đã bỏ ghim bài viết'
          : status === 'removed'
          ? 'Đã gỡ bài viết vi phạm'
          : 'Đã cập nhật trạng thái kiểm duyệt'
      );
    } catch (err: any) {
      showToast(err?.message || 'Thao tác kiểm duyệt thất bại');
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTarget || !reportReason.trim()) return;
    try {
      await apiService.createContentReport(
        {
          targetType: reportTarget.type,
          targetId: reportTarget.id,
          targetTitle: reportTarget.title,
          reason: reportReason.trim(),
        },
        user
      );
      setReportTarget(null);
      setReportReason('');
      showToast('Đã gửi báo cáo để điều phối viên kiểm tra.');
    } catch (err: any) {
      showToast(err?.message || 'Không gửi được báo cáo');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !activeCommentPost) return;
    const text = commentText.trim();
    const parentId = replyTarget?.id;
    setCommentText('');
    setReplyTarget(null);

    try {
      const res = await apiService.addCommunityComment(
        activeCommentPost.id,
        text,
        parentId,
        user
      );
      setPosts((prev) => prev.map((p) => (p.id === res.post.id ? res.post : p)));
      setActiveCommentPost(res.post);
    } catch (err: any) {
      showToast(err?.message || 'Không gửi được bình luận');
    }
  };

  const handleStartReply = (comment: PostComment) => {
    setReplyTarget(comment);
    const prefix = `@${comment.author} `;
    if (!commentText.startsWith(prefix)) {
      setCommentText(prefix + commentText);
    }
  };

  const handleUploadPostImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const res = await apiService.uploadImageFile(file, user);
      setNewPostImage(res.url);
      showToast('Đã tải ảnh bài viết lên!');
    } catch (err: any) {
      showToast(err?.message || 'Tải ảnh thất bại');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      const created = await apiService.createCommunityPost(
        {
          title: newTitle.trim(),
          content: newContent.trim(),
          category: newCategory,
          groupType: newGroupType,
          weekTag: user?.pregnancyWeek ? `Tuần ${user.pregnancyWeek}` : 'Mẹ bầu Nova',
          image: newPostImage || undefined,
        },
        user
      );
      setPosts((prev) => [created, ...prev]);
      setNewTitle('');
      setNewContent('');
      setNewPostImage('');
      setIsNewPostOpen(false);
      showToast('Đã đăng bài viết mới!');
    } catch (err: any) {
      showToast(err?.message || 'Đăng bài thất bại.');
    }
  };

  const handleClickNotif = async (notif: AppNotification) => {
    try {
      const updated = await apiService.markNotificationRead(notif.id, user);
      setCommunityNotifs(updated);
    } catch {}
    setIsNotifOpen(false);
    if (notif.targetId) {
      jumpToPostAndComment(notif.targetId, notif.commentId);
    }
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      const updated = await apiService.markAllNotificationsRead('community', user);
      setCommunityNotifs(updated);
    } catch {}
  };

  const handleToggleNotifEnabled = async () => {
    const nextVal = !communityNotifEnabled;
    setCommunityNotifEnabled(nextVal);
    try {
      await apiService.updateNotificationPrefs({ communityEnabled: nextVal }, user);
      showToast(
        nextVal ? 'Đã bật thông báo tương tác cộng đồng' : 'Đã tắt thông báo tương tác'
      );
    } catch {}
  };

  const filteredPosts = posts
    .filter((post) => {
      const matchCategory = selectedCategory === 'all' || post.category === selectedCategory;
      const matchGroup = selectedGroup === 'all' || post.groupType === selectedGroup;
      const matchSort =
        sortTab === 'featured'
          ? Boolean(post.isFeatured)
          : sortTab === 'saved'
          ? Boolean(post.isBookmarked)
          : true;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        q === '' ||
        post.title.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q) ||
        post.author.toLowerCase().includes(q);
      return matchCategory && matchGroup && matchSort && matchQuery;
    })
    .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

  const unreadNotifCount = communityNotifs.filter((n) => !n.isRead).length;

  const mentionCandidates = activeCommentPost
    ? Array.from(
        new Set([
          activeCommentPost.author,
          ...activeCommentPost.comments.map((c) => c.author),
        ])
      ).filter((name) => name !== user?.name)
    : [];

  return (
    <div className="flex-1 flex flex-col px-4 sm:px-6 pt-3 pb-6 overflow-y-auto no-scrollbar select-none bg-[#FAF6F0] dark:bg-[#161311] text-[#322622] dark:text-[#F4EDE6] relative">
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#322622] dark:bg-[#F4EDE6] text-white dark:text-[#322622] text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#6D8572]" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <header className="flex items-center justify-between py-1 mb-3.5 gap-2">
        <div>
          <h1 className="font-editorial text-[24px] font-semibold tracking-tight leading-tight text-[#322622] dark:text-[#F4EDE6]">
            Cộng đồng Mẹ & Bé Nova
          </h1>
          <p className="text-[12px] font-medium text-[#786962] dark:text-[#B5A89F] mt-0.5">
            Chia sẻ kinh nghiệm, hỏi đáp theo nhóm & kết nối các mẹ bầu
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsGuidelinesOpen(true)}
            className="w-9 h-9 rounded-full bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] text-[#4F6B56] dark:text-[#8DA892] flex items-center justify-center cursor-pointer"
            title="Nguyên tắc cộng đồng an toàn"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative w-9 h-9 rounded-full bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#B55841] flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Thông báo tương tác cộng đồng"
          >
            <Bell className="w-4 h-4 stroke-[2]" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#B55841] text-white text-[9px] font-bold flex items-center justify-center">
                {unreadNotifCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowSearchInput(!showSearchInput)}
            className="w-9 h-9 rounded-full bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] text-[#786962] dark:text-[#B5A89F] flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Tìm kiếm bài viết"
          >
            <Search className="w-4 h-4 stroke-[2]" />
          </button>

          <button
            onClick={() => setIsNewPostOpen(true)}
            className="px-3.5 h-9 rounded-full bg-[#B55841] text-white flex items-center justify-center gap-1.5 hover:bg-[#9E4A35] cursor-pointer transition-colors text-xs font-semibold whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4 stroke-[2]" />
            <span className="hidden sm:inline">Đăng bài</span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showSearchInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bài viết, tác giả, mẹo thai kỳ..."
                className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B55841]/30"
              />
              <Search className="w-4 h-4 text-[#786962] absolute left-3 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-[#786962] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {errorMsg && (
        <div className="mb-3 p-3 rounded-2xl bg-[#F7EAE5] dark:bg-[#35231E] border border-[#EBCDC2] flex items-center justify-between text-xs text-[#9E4A35] dark:text-[#E29A86]">
          <span>{errorMsg}</span>
          <button
            onClick={() => syncCommunityData(false)}
            className="font-semibold inline-flex items-center gap-1 cursor-pointer underline"
          >
            <RefreshCw className="w-3 h-3" /> Thử lại
          </button>
        </div>
      )}

      {/* Groups & Sort Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {COMMUNITY_GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGroup(g.id)}
            className={`px-3.5 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap shrink-0 cursor-pointer border min-h-[36px] ${
              selectedGroup === g.id
                ? 'bg-[#263E35] text-[#FAF6F0] border-transparent'
                : 'bg-white dark:bg-[#1E1A17] text-[#6B5D56] dark:text-[#C5B9B0] border-[#E6DDD1] dark:border-[#362E2A]'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Categories & Sort Filter Strip */}
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`h-8 px-3 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors shrink-0 ${
                  isActive
                    ? 'bg-[#B55841] text-white'
                    : 'bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] text-[#6B5D56] dark:text-[#C5B9B0]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 bg-[#F2ECE3] dark:bg-[#231E1B] p-1 rounded-xl shrink-0">
          {[
            { id: 'latest', label: 'Mới nhất' },
            { id: 'featured', label: 'Nổi bật' },
            { id: 'saved', label: 'Đã lưu' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSortTab(s.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer whitespace-nowrap ${
                sortTab === s.id
                  ? 'bg-white dark:bg-[#1E1A17] text-[#B55841] dark:text-[#D47A63]'
                  : 'text-[#786962] dark:text-[#B5A89F]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      {isLoading && posts.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#786962]">Đang tải bài viết cộng đồng...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="p-8 bg-white dark:bg-[#1E1A17] rounded-3xl border border-dashed border-[#E6DDD1] dark:border-[#362E2A] text-center text-xs text-[#786962]">
          Không tìm thấy bài viết nào phù hợp bộ lọc.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPosts.map((post) => {
            const isPopping = poppingHeartId === post.id;
            const isHighlighted = highlightedPostId === post.id;
            const isFollowingAuthor = followingIds.includes(post.authorId);

            return (
              <motion.article
                key={post.id}
                ref={(el) => {
                  postRefs.current[post.id] = el;
                }}
                whileHover={{ y: -2 }}
                className={`bg-white dark:bg-[#1E1A17] rounded-[24px] p-5 nova-card-shadow border flex flex-col justify-between transition-all ${
                  isHighlighted
                    ? 'border-[#B55841] ring-2 ring-[#B55841]/25'
                    : 'border-[#E6DDD1] dark:border-[#362E2A]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs border shrink-0 ${
                          post.isVerified
                            ? 'bg-[#EBF1EC] dark:bg-[#1E2922] text-[#263E35] dark:text-[#A7C2AC] border-[#CFE0D3] dark:border-[#2C3F33]'
                            : 'bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63] border-[#EBCDC2] dark:border-[#4D342D]'
                        }`}
                      >
                        {post.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h2 className="text-[13px] font-semibold leading-tight truncate">{post.author}</h2>
                          {post.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-[#4F6B56] dark:text-[#8DA892] shrink-0" />}
                          {post.authorId !== user?.id && (
                            <button
                              type="button"
                              onClick={() => handleToggleFollowAuthor(post.authorId, post.author)}
                              className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 cursor-pointer ${
                                isFollowingAuthor
                                  ? 'bg-[#EBF1EC] dark:bg-[#1E2922] text-[#263E35] dark:text-[#8DA892]'
                                  : 'bg-[#FAF6F0] dark:bg-[#231E1B] text-[#786962] hover:text-[#B55841]'
                              }`}
                            >
                              {isFollowingAuthor ? <UserCheck className="w-2.5 h-2.5" /> : <UserPlus className="w-2.5 h-2.5" />}
                              {isFollowingAuthor ? 'Đang theo dõi' : 'Theo dõi'}
                            </button>
                          )}
                        </div>
                        <span className="text-[10.5px] text-[#786962] dark:text-[#B5A89F]">
                          {post.timeAgo} · {post.weekTag}
                        </span>
                      </div>
                    </div>

                    {post.isFeatured && (
                      <span className="text-[10.5px] font-semibold text-[#9E5B3B] dark:text-[#D7BA86] inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
                        <Pin className="w-3 h-3" /> Nổi bật
                      </span>
                    )}
                  </div>

                  <h3 className="font-editorial text-[16px] font-semibold leading-snug mb-1.5 text-[#322622] dark:text-[#F4EDE6]">
                    {post.title}
                  </h3>
                  <p className="text-[12.5px] text-[#6B5D56] dark:text-[#C5B9B0] leading-relaxed mb-3">
                    {post.content}
                  </p>

                  {post.image && (
                    <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden bg-[#F2ECE3] dark:bg-[#231E1B] mb-3">
                      <NovaImage src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Moderator quick controls */}
                {canModerate && (
                  <div className="flex items-center gap-1.5 pb-2.5 mb-2 border-b border-[#E6DDD1]/70 dark:border-[#362E2A] flex-wrap">
                    <button
                      onClick={() => handleModeratePost(post.id, 'approved', !post.isFeatured)}
                      className="px-2.5 py-1 rounded-lg bg-[#F6EFE2] dark:bg-[#2F281C] text-[#9E5B3B] dark:text-[#D7BA86] text-[10.5px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Pin className="w-3 h-3" /> {post.isFeatured ? 'Bỏ ghim' : 'Ghim nổi bật'}
                    </button>
                    <button
                      onClick={() => handleModeratePost(post.id, 'removed')}
                      className="px-2.5 py-1 rounded-lg bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63] text-[10.5px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Gỡ bài
                    </button>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-2.5 border-t border-[#E6DDD1]/70 dark:border-[#362E2A] text-[#786962] dark:text-[#B5A89F]">
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => handleToggleLike(post.id)}
                      animate={isPopping ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                      className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                        post.isLiked ? 'text-[#B55841] dark:text-[#D47A63]' : 'hover:text-[#B55841]'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-[#B55841] text-[#B55841]' : 'stroke-[2]'}`} />
                      <span className="tabular-nums">{post.likes}</span>
                    </motion.button>

                    <button
                      onClick={() => {
                        setReplyTarget(null);
                        setActiveCommentPost(post);
                      }}
                      className="flex items-center gap-1.5 text-xs font-medium hover:text-[#322622] dark:hover:text-[#F4EDE6] cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 stroke-[1.8]" />
                      <span className="tabular-nums">{post.commentsCount}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleToggleBookmark(post.id)}
                      className={`cursor-pointer ${post.isBookmarked ? 'text-[#B55841]' : 'hover:text-[#322622]'}`}
                      title="Lưu bài viết"
                    >
                      <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : 'stroke-[1.8]'}`} />
                    </button>
                    <button
                      onClick={() =>
                        setReportTarget({ type: 'post', id: post.id, title: post.title })
                      }
                      className="hover:text-[#B55841] cursor-pointer"
                      title="Báo cáo vi phạm"
                    >
                      <Flag className="w-4 h-4 stroke-[1.8]" />
                    </button>
                    {post.authorId !== user?.id && (
                      <>
                        <button
                          onClick={() => handleHidePost(post.id)}
                          className="hover:text-[#322622] cursor-pointer"
                          title="Ẩn bài viết này"
                        >
                          <EyeOff className="w-4 h-4 stroke-[1.8]" />
                        </button>
                        <button
                          onClick={() => handleBlockAuthor(post.authorId, post.author)}
                          className="hover:text-[#B55841] cursor-pointer"
                          title="Chặn người dùng này"
                        >
                          <Ban className="w-3.5 h-3.5 stroke-[1.8]" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => showToast('Đã sao chép liên kết bài viết')}
                      className="hover:text-[#322622] cursor-pointer"
                      title="Chia sẻ"
                    >
                      <Share2 className="w-4 h-4 stroke-[1.8]" />
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Community Guidelines Modal */}
      <AnimatePresence>
        {isGuidelinesOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
            <div className="w-full max-w-md bg-[#FAF6F0] dark:bg-[#161311] rounded-3xl p-5 shadow-2xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="font-editorial text-lg font-semibold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#4F6B56] dark:text-[#8DA892]" /> Nguyên tắc Cộng đồng Nova
                </h3>
                <button
                  onClick={() => setIsGuidelinesOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F2ECE3] dark:bg-[#231E1B] text-[#786962] dark:text-[#B5A89F] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ul className="space-y-2 text-xs text-[#6B5D56] dark:text-[#C5B9B0] leading-relaxed list-disc list-inside bg-[#FFFFFF] dark:bg-[#1E1A17] p-4 rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A]">
                {COMMUNITY_GUIDELINES.map((g, idx) => (
                  <li key={idx}>{g}</li>
                ))}
              </ul>
              <button
                onClick={() => setIsGuidelinesOpen(false)}
                className="w-full min-h-[44px] py-2.5 rounded-xl bg-[#B55841] hover:bg-[#9E4A35] text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {reportTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
            <form
              onSubmit={handleSubmitReport}
              className="w-full max-w-sm bg-[#FAF6F0] dark:bg-[#161311] rounded-3xl p-5 shadow-2xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-3.5"
            >
              <h3 className="font-editorial text-base font-semibold text-[#322622] dark:text-[#F4EDE6]">
                Báo cáo vi phạm cộng đồng
              </h3>
              <p className="text-xs text-[#786962] dark:text-[#B5A89F] truncate">{reportTarget.title}</p>
              <textarea
                rows={3}
                required
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Nhập lý do (tin giả y tế, quảng cáo trái phép, ngôn từ không phù hợp...)"
                className="w-full p-3 rounded-xl bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#322622] dark:text-[#F4EDE6] placeholder:text-[#786962] focus:outline-none focus:ring-2 focus:ring-[#B55841]/25"
              />
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setReportTarget(null)}
                  className="px-4 min-h-[44px] rounded-xl text-xs font-semibold text-[#786962] dark:text-[#B5A89F] hover:bg-[#F2ECE3] dark:hover:bg-[#231E1B] cursor-pointer whitespace-nowrap"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 min-h-[44px] rounded-xl bg-[#B55841] hover:bg-[#9E4A35] text-white text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
                >
                  Gửi báo cáo
                </button>
              </div>
            </form>
          </div>
        )}
      </AnimatePresence>

      {/* Comments Drawer */}
      <AnimatePresence>
        {activeCommentPost && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setActiveCommentPost(null);
                setReplyTarget(null);
              }}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full max-w-[480px] max-h-[85vh] bg-[#FAF6F0] dark:bg-[#161311] rounded-t-[28px] md:rounded-[28px] p-5 shadow-2xl flex flex-col z-10 border border-[#E6DDD1] dark:border-[#362E2A]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E6DDD1] dark:border-[#362E2A]">
                <div>
                  <h3 className="font-editorial text-base font-semibold text-[#322622] dark:text-[#F4EDE6] tabular-nums">
                    Bình luận ({activeCommentPost.commentsCount})
                  </h3>
                  <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] truncate max-w-[320px]">
                    {activeCommentPost.title}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveCommentPost(null);
                    setReplyTarget(null);
                  }}
                  className="w-8 h-8 rounded-full bg-[#F2ECE3] dark:bg-[#231E1B] flex items-center justify-center text-[#786962] dark:text-[#B5A89F] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-2.5 no-scrollbar min-h-[200px] max-h-[340px]">
                {activeCommentPost.comments.length === 0 ? (
                  <div className="py-8 text-center text-[#786962] dark:text-[#B5A89F] text-xs">
                    Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cùng mẹ nhé!
                  </div>
                ) : (
                  activeCommentPost.comments.map((c) => {
                    const isReply = Boolean(c.parentId);
                    const isCommentHighlighted = highlightedCommentId === c.id;
                    return (
                      <div
                        key={c.id}
                        ref={(el) => {
                          commentRefs.current[c.id] = el;
                        }}
                        className={`p-3 rounded-2xl border transition-all ${
                          isReply
                            ? 'ml-6 bg-[#F2ECE3]/65 dark:bg-[#231E1B]'
                            : 'bg-[#FFFFFF] dark:bg-[#1E1A17]'
                        } ${
                          isCommentHighlighted
                            ? 'border-[#B55841] ring-2 ring-[#B55841]/20'
                            : 'border-[#E6DDD1] dark:border-[#362E2A]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6]">
                              {c.author}
                            </span>
                            {c.replyToAuthor && (
                              <span className="text-[10.5px] text-[#B55841] dark:text-[#D47A63] font-medium">
                                trả lời {c.replyToAuthor}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#786962] dark:text-[#B5A89F]">{c.timeAgo}</span>
                        </div>
                        <p className="text-xs text-[#6B5D56] dark:text-[#C5B9B0] leading-relaxed">{c.content}</p>
                        <div className="mt-1.5 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleStartReply(c)}
                            className="text-[11px] font-semibold text-[#786962] dark:text-[#B5A89F] hover:text-[#B55841] dark:hover:text-[#D47A63] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Reply className="w-3 h-3" />
                            <span>Trả lời</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setReportTarget({ type: 'comment', id: c.id, title: c.content.slice(0, 60) })
                            }
                            className="text-[11px] font-semibold text-[#786962] dark:text-[#B5A89F] hover:text-[#B55841] dark:hover:text-[#D47A63] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Flag className="w-3 h-3" />
                            <span>Báo cáo</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {replyTarget && (
                <div className="px-3 py-1.5 mb-2 rounded-xl bg-[#F7EAE5] dark:bg-[#35231E] border border-[#EBCDC2] dark:border-[#52352D] text-[11px] text-[#B55841] dark:text-[#D47A63] flex items-center justify-between">
                  <span>
                    Đang trả lời bình luận của <strong>{replyTarget.author}</strong>
                  </span>
                  <button onClick={() => setReplyTarget(null)} className="font-semibold cursor-pointer">
                    Hủy
                  </button>
                </div>
              )}

              {mentionCandidates.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
                  <span className="text-[10.5px] text-[#786962] dark:text-[#B5A89F] flex items-center gap-0.5 shrink-0">
                    <AtSign className="w-3 h-3" /> Nhắc tên:
                  </span>
                  {mentionCandidates.slice(0, 4).map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() =>
                        setCommentText((prev) =>
                          prev.includes(`@${name}`) ? prev : `${prev}${prev ? ' ' : ''}@${name} `
                        )
                      }
                      className="px-2 py-0.5 rounded-lg bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] text-[10.5px] font-semibold text-[#322622] dark:text-[#F4EDE6] hover:border-[#B55841] whitespace-nowrap cursor-pointer"
                    >
                      @{name}
                    </button>
                  ))}
                </div>
              )}

              <div className="pt-2.5 border-t border-[#E6DDD1] dark:border-[#362E2A] flex items-center gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder={
                    replyTarget ? `Trả lời ${replyTarget.author}...` : 'Gửi bình luận hoặc dùng @Tên để nhắc...'
                  }
                  className="flex-1 min-h-[44px] px-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-xs text-[#322622] dark:text-[#F4EDE6] placeholder:text-[#786962] focus:outline-none focus:ring-2 focus:ring-[#B55841]/25"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="w-11 h-11 rounded-xl bg-[#B55841] hover:bg-[#9E4A35] disabled:opacity-40 text-white flex items-center justify-center cursor-pointer shadow-xs transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Community Notifications Drawer */}
      <AnimatePresence>
        {isNotifOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="w-full max-w-[480px] max-h-[85vh] bg-[#FAF6F0] dark:bg-[#161311] rounded-t-[28px] md:rounded-[28px] p-5 shadow-2xl flex flex-col border border-[#E6DDD1] dark:border-[#362E2A] overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E6DDD1] dark:border-[#362E2A] mb-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63] flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-editorial text-base font-semibold text-[#322622] dark:text-[#F4EDE6] tabular-nums">
                      Thông báo tương tác ({unreadNotifCount} mới)
                    </h3>
                    <p className="text-[11px] text-[#786962] dark:text-[#B5A89F]">
                      Thích bài viết, bình luận, trả lời và @nhắc tên
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F2ECE3] dark:bg-[#231E1B] text-[#786962] dark:text-[#B5A89F] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-between mb-3 shrink-0">
                <div>
                  <p className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6]">
                    Nhận thông báo tương tác bài viết
                  </p>
                  <p className="text-[10.5px] text-[#786962] dark:text-[#B5A89F]">
                    Tắt nếu bạn không muốn nhận báo tương tác
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleNotifEnabled}
                  className={`w-10 h-5.5 rounded-full transition-colors p-0.5 cursor-pointer shrink-0 ${
                    communityNotifEnabled
                      ? 'bg-[#6D8572] dark:bg-[#8DA892]'
                      : 'bg-[#D6CBC4] dark:bg-[#362E2A]'
                  }`}
                >
                  <motion.div
                    animate={{ x: communityNotifEnabled ? 18 : 0 }}
                    className="w-4.5 h-4.5 rounded-full bg-white shadow-xs"
                  />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar min-h-[200px]">
                {communityNotifs.length === 0 ? (
                  <div className="py-10 text-center text-xs text-[#786962] dark:text-[#B5A89F]">
                    Chưa có thông báo tương tác nào cho tài khoản {user?.name || 'của bạn'}.
                  </div>
                ) : (
                  communityNotifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleClickNotif(n)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-colors ${
                        n.isRead
                          ? 'bg-[#FFFFFF] dark:bg-[#1E1A17] border-[#E6DDD1] dark:border-[#362E2A]'
                          : 'bg-[#F7EAE5] dark:bg-[#35231E] border-[#EBCDC2] dark:border-[#52352D]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs ${
                            n.isRead
                              ? 'font-semibold text-[#322622] dark:text-[#F4EDE6]'
                              : 'font-semibold text-[#B55841] dark:text-[#D47A63]'
                          }`}
                        >
                          {n.title}
                        </span>
                        <span className="text-[10px] text-[#786962] dark:text-[#B5A89F] shrink-0">
                          {n.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B5D56] dark:text-[#C5B9B0] mt-1 line-clamp-2">
                        {n.description}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {unreadNotifCount > 0 && (
                <button
                  onClick={handleMarkAllNotifsRead}
                  className="mt-3 w-full min-h-[44px] py-2.5 bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#6D8572] rounded-xl text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <CheckCheck className="w-4 h-4 text-[#4F6B56] dark:text-[#8DA892]" />
                  <span>Đánh dấu tất cả đã đọc</span>
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Post Modal */}
      <AnimatePresence>
        {isNewPostOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewPostOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-[460px] bg-[#FAF6F0] dark:bg-[#161311] rounded-t-[28px] md:rounded-[28px] p-5 shadow-2xl flex flex-col z-10 border border-[#E6DDD1] dark:border-[#362E2A] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E6DDD1] dark:border-[#362E2A] mb-3.5">
                <h3 className="font-editorial text-base font-semibold text-[#322622] dark:text-[#F4EDE6]">
                  Viết bài chia sẻ cùng cộng đồng
                </h3>
                <button
                  onClick={() => setIsNewPostOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F2ECE3] dark:bg-[#231E1B] flex items-center justify-center text-[#786962] dark:text-[#B5A89F] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="px-3 py-2.5 bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] focus:outline-none"
                >
                  {categories
                    .filter((c) => c.id !== 'all')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                </select>
                <select
                  value={newGroupType}
                  onChange={(e) => setNewGroupType(e.target.value as any)}
                  className="px-3 py-2.5 bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] focus:outline-none"
                >
                  {COMMUNITY_GROUPS.filter((g) => g.id !== 'all').map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Tiêu đề bài viết..."
                className="w-full px-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] placeholder:text-[#786962] mb-2.5 focus:outline-none focus:ring-2 focus:ring-[#B55841]/25"
              />

              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Nội dung chia sẻ, tâm sự hoặc hỏi đáp..."
                className="w-full h-28 p-3.5 bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-xs text-[#322622] dark:text-[#F4EDE6] placeholder:text-[#786962] focus:outline-none focus:ring-2 focus:ring-[#B55841]/25 resize-none mb-2.5"
              />

              <div className="mb-3.5">
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFFFFF] dark:bg-[#1E1A17] border border-dashed border-[#D6CBC4] dark:border-[#493E38] text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] cursor-pointer">
                  <ImagePlus className="w-4 h-4 text-[#B55841] dark:text-[#D47A63]" />
                  <span>{isUploadingImage ? 'Đang tải ảnh...' : 'Đính kèm ảnh (tối đa 5MB)'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleUploadPostImage}
                    className="hidden"
                  />
                </label>
                {newPostImage && (
                  <div className="mt-2.5 relative w-28 h-20 rounded-xl overflow-hidden border border-[#E6DDD1] dark:border-[#362E2A]">
                    <NovaImage src={newPostImage} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewPostImage('')}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-[10px] flex items-center justify-center cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsNewPostOpen(false)}
                  className="px-4 min-h-[44px] rounded-xl text-xs font-semibold text-[#786962] dark:text-[#B5A89F] hover:bg-[#F2ECE3] dark:hover:bg-[#231E1B] cursor-pointer whitespace-nowrap"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={!newTitle.trim() || !newContent.trim() || isUploadingImage}
                  className="px-5 min-h-[44px] bg-[#B55841] hover:bg-[#9E4A35] disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-colors whitespace-nowrap"
                >
                  Đăng bài ngay
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
