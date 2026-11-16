import {
  UserProfile,
  UserRole,
  UserPrivacySettings,
  HealthReminder,
  NovaVideoItem,
  VideoCategory,
  VideoModerationStatus,
  DetailedPost,
  PostComment,
  AppNotification,
  NotificationPreferences,
  ProductReview,
  JourneyState,
  MemoryEntry,
  ChecklistItem,
  ChecklistCategory,
  HealthDiaryEntry,
  ReminderHistoryEntry,
  LibraryArticle,
  UserKnowledgeState,
  VideoWatchEntry,
  VideoPlaylist,
  ContentReport,
  FamilyConnection,
  FamilySharePermissions,
  BirthPlanData,
  PostpartumState,
  PostpartumDiaryEntry,
  BabyCareLog,
  BabyAlbumPhoto,
  ProductItem,
  OrderInfo,
  RewardBadge,
  AuditLogEntry,
} from '../types';

const SESSION_STORAGE_KEY = 'nova_mom_session_token_v1';

interface StoredSession {
  userId: string;
  token: string;
}

function readStoredSession(): StoredSession | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function writeStoredSession(session: StoredSession | null): void {
  try {
    if (typeof localStorage === 'undefined') return;
    if (!session) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
  } catch {}
}

function getActorHeaders(user?: Partial<UserProfile>): Record<string, string> {
  const id = user?.id || 'usr-1';
  const name = encodeURIComponent(user?.name || 'Khánh Băng');
  const role = user?.role || 'user';
  const headers: Record<string, string> = {
    'x-user-id': id,
    'x-user-name': name,
    'x-user-role': role,
  };
  const stored = readStoredSession();
  if (stored?.token && (!user?.id || stored.userId === user.id)) {
    headers['Authorization'] = `Bearer ${stored.token}`;
  }
  return headers;
}

async function requestJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Yêu cầu thất bại (${res.status})`);
  }
  return data as T;
}

export const apiService = {
  // 0. Session Auth & Privacy
  getSessionToken(userId?: string): string | null {
    const stored = readStoredSession();
    if (!stored?.token) return null;
    if (userId && stored.userId !== userId) return null;
    return stored.token;
  },

  clearSession(): void {
    writeStoredSession(null);
  },

  async ensureSession(profile: Partial<UserProfile> & { id: string }): Promise<{
    user: UserProfile;
    token: string;
  }> {
    const res = await requestJson<{ user: UserProfile; token: string }>('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile }),
    });
    if (res.token && res.user?.id) {
      writeStoredSession({ userId: res.user.id, token: res.token });
    }
    return res;
  },

  async updatePrivacySettings(
    payload: {
      privacySettings?: Partial<UserPrivacySettings>;
      rewardsEnabled?: boolean;
      blockedUserIds?: string[];
      followingUserIds?: string[];
    },
    user?: Partial<UserProfile>
  ): Promise<UserProfile> {
    const res = await requestJson<{ user: UserProfile }>('/api/privacy/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify(payload),
    });
    return res.user;
  },

  async exportServerData(user?: Partial<UserProfile>): Promise<Record<string, unknown>> {
    const res = await requestJson<{ exportData: Record<string, unknown> }>('/api/privacy/export', {
      headers: getActorHeaders(user),
    });
    return res.exportData;
  },

  async deleteServerAccount(user?: Partial<UserProfile>): Promise<{ deleted: boolean }> {
    const res = await requestJson<{ deleted: boolean }>('/api/privacy/account', {
      method: 'DELETE',
      headers: getActorHeaders(user),
    });
    this.clearSession();
    return res;
  },

  // 1. Reminders
  async fetchReminders(user?: Partial<UserProfile>): Promise<HealthReminder[]> {
    const res = await requestJson<{ reminders: HealthReminder[] }>('/api/reminders', {
      headers: getActorHeaders(user),
    });
    return res.reminders || [];
  },

  async syncReminders(reminders: HealthReminder[], user?: Partial<UserProfile>): Promise<HealthReminder[]> {
    const res = await requestJson<{ reminders: HealthReminder[] }>('/api/reminders', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getActorHeaders(user),
      },
      body: JSON.stringify({ reminders }),
    });
    return res.reminders || [];
  },

  async appendReminderHistory(
    entry: Omit<ReminderHistoryEntry, 'id'>,
    user?: Partial<UserProfile>
  ): Promise<ReminderHistoryEntry[]> {
    const res = await requestJson<{ history: ReminderHistoryEntry[] }>('/api/reminders/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getActorHeaders(user),
      },
      body: JSON.stringify(entry),
    });
    return res.history || [];
  },

  // 2. Uploads & Videos
  async uploadVideoFile(file: File, user?: Partial<UserProfile>): Promise<{ url: string; size: number }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload/video', {
      method: 'POST',
      headers: getActorHeaders(user),
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Tải lên video thất bại.');
    }
    return data;
  },

  async uploadPosterFile(file: File, user?: Partial<UserProfile>): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload/poster', {
      method: 'POST',
      headers: getActorHeaders(user),
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Tải lên ảnh bìa thất bại.');
    }
    return data;
  },

  async uploadImageFile(file: File, user?: Partial<UserProfile>): Promise<{ url: string; size: number }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload/image', {
      method: 'POST',
      headers: getActorHeaders(user),
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Tải lên hình ảnh thất bại.');
    }
    return data;
  },

  async fetchVideos(
    scope: 'feed' | 'mine' | 'moderation' = 'feed',
    user?: Partial<UserProfile>
  ): Promise<NovaVideoItem[]> {
    const res = await requestJson<{ videos: NovaVideoItem[] }>(`/api/videos?scope=${scope}`, {
      headers: getActorHeaders(user),
    });
    return res.videos || [];
  },

  async createVideo(
    payload: {
      title: string;
      description: string;
      videoUrl: string;
      poster?: string;
      category: Exclude<VideoCategory, 'all'>;
      hashtags?: string[];
      musicTitle?: string;
      weekMin?: number;
      weekMax?: number;
    },
    user?: Partial<UserProfile>
  ): Promise<NovaVideoItem> {
    const res = await requestJson<{ video: NovaVideoItem }>('/api/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getActorHeaders(user),
      },
      body: JSON.stringify(payload),
    });
    return res.video;
  },

  async updateVideo(
    videoId: string,
    partial: Partial<NovaVideoItem>,
    user?: Partial<UserProfile>
  ): Promise<NovaVideoItem> {
    const res = await requestJson<{ video: NovaVideoItem }>(`/api/videos/${videoId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getActorHeaders(user),
      },
      body: JSON.stringify(partial),
    });
    return res.video;
  },

  async moderateVideo(
    videoId: string,
    status: VideoModerationStatus,
    rejectionReason?: string,
    user?: Partial<UserProfile>
  ): Promise<NovaVideoItem> {
    const res = await requestJson<{ video: NovaVideoItem }>(`/api/videos/${videoId}/moderate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getActorHeaders(user),
      },
      body: JSON.stringify({ status, rejectionReason }),
    });
    return res.video;
  },

  async deleteVideo(videoId: string, user?: Partial<UserProfile>): Promise<void> {
    await requestJson(`/api/videos/${videoId}`, {
      method: 'DELETE',
      headers: getActorHeaders(user),
    });
  },

  async toggleVideoLike(videoId: string, user?: Partial<UserProfile>): Promise<NovaVideoItem> {
    const res = await requestJson<{ video: NovaVideoItem }>(`/api/videos/${videoId}/like`, {
      method: 'POST',
      headers: getActorHeaders(user),
    });
    return res.video;
  },

  async addVideoComment(
    videoId: string,
    content: string,
    user?: Partial<UserProfile>
  ): Promise<NovaVideoItem> {
    const res = await requestJson<{ video: NovaVideoItem }>(`/api/videos/${videoId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getActorHeaders(user),
      },
      body: JSON.stringify({ content }),
    });
    return res.video;
  },

  async fetchVideoLibraryState(user?: Partial<UserProfile>): Promise<{
    favoriteVideoIds: string[];
    watchHistory: VideoWatchEntry[];
    playlists: VideoPlaylist[];
  }> {
    return requestJson('/api/videos/library', { headers: getActorHeaders(user) });
  },

  async toggleVideoFavorite(videoId: string, user?: Partial<UserProfile>): Promise<string[]> {
    const res = await requestJson<{ favoriteVideoIds: string[] }>(`/api/videos/${videoId}/favorite`, {
      method: 'POST',
      headers: getActorHeaders(user),
    });
    return res.favoriteVideoIds;
  },

  async recordVideoProgress(
    videoId: string,
    progressSec: number,
    durationSec: number,
    user?: Partial<UserProfile>
  ): Promise<VideoWatchEntry[]> {
    const res = await requestJson<{ watchHistory: VideoWatchEntry[] }>(`/api/videos/${videoId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify({ progressSec, durationSec }),
    });
    return res.watchHistory;
  },

  async createVideoPlaylist(
    name: string,
    videoId?: string,
    user?: Partial<UserProfile>
  ): Promise<VideoPlaylist[]> {
    const res = await requestJson<{ playlists: VideoPlaylist[] }>('/api/videos/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify({ name, videoId }),
    });
    return res.playlists;
  },

  async toggleVideoInPlaylist(
    playlistId: string,
    videoId: string,
    user?: Partial<UserProfile>
  ): Promise<VideoPlaylist[]> {
    const res = await requestJson<{ playlists: VideoPlaylist[] }>(`/api/videos/playlists/${playlistId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify({ videoId }),
    });
    return res.playlists;
  },

  // 3. Community Posts, Comments, Moderation & Reports
  async fetchCommunityPosts(user?: Partial<UserProfile>): Promise<DetailedPost[]> {
    const res = await requestJson<{ posts: DetailedPost[] }>('/api/community/posts', {
      headers: getActorHeaders(user),
    });
    return res.posts || [];
  },

  async createCommunityPost(
    payload: {
      title: string;
      content: string;
      category: DetailedPost['category'];
      groupType?: DetailedPost['groupType'];
      weekTag?: string;
      image?: string;
    },
    user?: Partial<UserProfile>
  ): Promise<DetailedPost> {
    const res = await requestJson<{ post: DetailedPost }>('/api/community/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getActorHeaders(user),
      },
      body: JSON.stringify(payload),
    });
    return res.post;
  },

  async toggleCommunityPostLike(
    postId: string,
    user?: Partial<UserProfile>
  ): Promise<DetailedPost> {
    const res = await requestJson<{ post: DetailedPost }>(`/api/community/posts/${postId}/like`, {
      method: 'POST',
      headers: getActorHeaders(user),
    });
    return res.post;
  },

  async addCommunityComment(
    postId: string,
    content: string,
    parentId?: string,
    user?: Partial<UserProfile>
  ): Promise<{ post: DetailedPost; comment: PostComment }> {
    return requestJson<{ post: DetailedPost; comment: PostComment }>(
      `/api/community/posts/${postId}/comments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getActorHeaders(user),
        },
        body: JSON.stringify({ content, parentId }),
      }
    );
  },

  async toggleCommunityBookmark(postId: string, user?: Partial<UserProfile>): Promise<DetailedPost> {
    const res = await requestJson<{ post: DetailedPost }>(`/api/community/posts/${postId}/bookmark`, {
      method: 'POST',
      headers: getActorHeaders(user),
    });
    return res.post;
  },

  async hideCommunityPost(postId: string, user?: Partial<UserProfile>): Promise<{ postId: string }> {
    return requestJson<{ postId: string }>(`/api/community/posts/${postId}/hide`, {
      method: 'POST',
      headers: getActorHeaders(user),
    });
  },

  async moderateCommunityPost(
    postId: string,
    status: 'approved' | 'hidden' | 'removed',
    isFeatured?: boolean,
    user?: Partial<UserProfile>
  ): Promise<DetailedPost> {
    const res = await requestJson<{ post: DetailedPost }>(`/api/community/posts/${postId}/moderate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify({ status, isFeatured }),
    });
    return res.post;
  },

  async createContentReport(
    payload: {
      targetType: 'post' | 'comment' | 'video';
      targetId: string;
      targetTitle: string;
      reason: string;
    },
    user?: Partial<UserProfile>
  ): Promise<ContentReport> {
    const res = await requestJson<{ report: ContentReport }>('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify(payload),
    });
    return res.report;
  },

  // 4. Notifications & Preferences
  async fetchNotifications(
    category?: string,
    user?: Partial<UserProfile>
  ): Promise<AppNotification[]> {
    const q = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
    const res = await requestJson<{ notifications: AppNotification[] }>(`/api/notifications${q}`, {
      headers: getActorHeaders(user),
    });
    return res.notifications || [];
  },

  async markNotificationRead(
    notifId: string,
    user?: Partial<UserProfile>
  ): Promise<AppNotification[]> {
    const res = await requestJson<{ notifications: AppNotification[] }>(
      `/api/notifications/${notifId}/read`,
      {
        method: 'PATCH',
        headers: getActorHeaders(user),
      }
    );
    return res.notifications || [];
  },

  async markAllNotificationsRead(
    category?: string,
    user?: Partial<UserProfile>
  ): Promise<AppNotification[]> {
    const res = await requestJson<{ notifications: AppNotification[] }>(
      '/api/notifications/read-all',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getActorHeaders(user),
        },
        body: JSON.stringify({ category }),
      }
    );
    return res.notifications || [];
  },

  async deleteNotification(
    notifId: string,
    user?: Partial<UserProfile>
  ): Promise<AppNotification[]> {
    const res = await requestJson<{ notifications: AppNotification[] }>(
      `/api/notifications/${notifId}`,
      {
        method: 'DELETE',
        headers: getActorHeaders(user),
      }
    );
    return res.notifications || [];
  },

  async fetchNotificationPrefs(user?: Partial<UserProfile>): Promise<NotificationPreferences> {
    const res = await requestJson<{ preferences: NotificationPreferences }>(
      '/api/notifications/preferences',
      { headers: getActorHeaders(user) }
    );
    return res.preferences;
  },

  async updateNotificationPrefs(
    partial: Partial<NotificationPreferences>,
    user?: Partial<UserProfile>
  ): Promise<NotificationPreferences> {
    const res = await requestJson<{ preferences: NotificationPreferences }>(
      '/api/notifications/preferences',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getActorHeaders(user),
        },
        body: JSON.stringify(partial),
      }
    );
    return res.preferences;
  },

  // 5. Shop Catalog, Reviews, Wishlist, Coupons & Orders
  async fetchProducts(): Promise<ProductItem[]> {
    const res = await requestJson<{ products: ProductItem[] }>('/api/shop/products');
    return res.products || [];
  },

  async upsertProduct(
    product: Partial<ProductItem> & { id?: string },
    user?: Partial<UserProfile>
  ): Promise<ProductItem> {
    const res = await requestJson<{ product: ProductItem }>('/api/shop/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify(product),
    });
    return res.product;
  },

  async fetchWishlist(user?: Partial<UserProfile>): Promise<string[]> {
    const res = await requestJson<{ wishlist: string[] }>('/api/shop/wishlist', {
      headers: getActorHeaders(user),
    });
    return res.wishlist || [];
  },

  async toggleWishlist(productId: string, user?: Partial<UserProfile>): Promise<string[]> {
    const res = await requestJson<{ wishlist: string[] }>(`/api/shop/wishlist/${productId}`, {
      method: 'POST',
      headers: getActorHeaders(user),
    });
    return res.wishlist || [];
  },

  async validateCoupon(
    code: string,
    subtotal: number
  ): Promise<{ valid: boolean; discount: number; message: string }> {
    return requestJson('/api/shop/coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    });
  },

  async fetchOrders(all = false, user?: Partial<UserProfile>): Promise<OrderInfo[]> {
    const res = await requestJson<{ orders: OrderInfo[] }>(`/api/shop/orders${all ? '?all=true' : ''}`, {
      headers: getActorHeaders(user),
    });
    return res.orders || [];
  },

  async createOrder(
    order: Omit<OrderInfo, 'userId' | 'createdAt' | 'trackingHistory'>,
    user?: Partial<UserProfile>
  ): Promise<OrderInfo> {
    const res = await requestJson<{ order: OrderInfo }>('/api/shop/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify(order),
    });
    return res.order;
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderInfo['status'],
    paymentStatus?: OrderInfo['paymentStatus'],
    user?: Partial<UserProfile>
  ): Promise<OrderInfo> {
    const res = await requestJson<{ order: OrderInfo }>(`/api/shop/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify({ status, paymentStatus }),
    });
    return res.order;
  },

  async fetchAllReviewsSummary(): Promise<{
    reviewsMap: Record<string, ProductReview[]>;
    summary: Record<string, { rating?: number; reviewsCount: number }>;
  }> {
    return requestJson('/api/shop/reviews');
  },

  async fetchProductReviews(productId: string): Promise<{
    reviews: ProductReview[];
    rating?: number;
    reviewsCount: number;
  }> {
    return requestJson(`/api/shop/reviews?productId=${encodeURIComponent(productId)}`);
  },

  async addProductReview(
    productId: string,
    rating: number,
    comment: string,
    user?: Partial<UserProfile>
  ): Promise<{ reviews: ProductReview[]; rating: number; reviewsCount: number }> {
    return requestJson('/api/shop/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getActorHeaders(user),
      },
      body: JSON.stringify({ productId, rating, comment }),
    });
  },

  // 6. Journey, Memories, Checklists & Server Diary
  async fetchJourney(user?: Partial<UserProfile>): Promise<JourneyState> {
    const res = await requestJson<{ journey: JourneyState }>('/api/journey', {
      headers: getActorHeaders(user),
    });
    return res.journey;
  },

  async toggleMilestone(week: number, user?: Partial<UserProfile>): Promise<JourneyState> {
    const res = await requestJson<{ journey: JourneyState }>('/api/journey/milestone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify({ week }),
    });
    return res.journey;
  },

  async recordDueDateAdjustment(
    payload: {
      previousDueDate: string;
      newDueDate: string;
      previousWeek: number;
      newWeek: number;
      reason: string;
    },
    user?: Partial<UserProfile>
  ): Promise<JourneyState> {
    const res = await requestJson<{ journey: JourneyState }>('/api/journey/due-date', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify(payload),
    });
    return res.journey;
  },

  async fetchMemories(user?: Partial<UserProfile>): Promise<MemoryEntry[]> {
    const res = await requestJson<{ memories: MemoryEntry[] }>('/api/memories', {
      headers: getActorHeaders(user),
    });
    return res.memories || [];
  },

  async createMemory(
    payload: Omit<MemoryEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
    user?: Partial<UserProfile>
  ): Promise<MemoryEntry> {
    const res = await requestJson<{ memory: MemoryEntry }>('/api/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify(payload),
    });
    return res.memory;
  },

  async updateMemory(
    memoryId: string,
    partial: Partial<MemoryEntry>,
    user?: Partial<UserProfile>
  ): Promise<MemoryEntry> {
    const res = await requestJson<{ memory: MemoryEntry }>(`/api/memories/${memoryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify(partial),
    });
    return res.memory;
  },

  async deleteMemory(memoryId: string, user?: Partial<UserProfile>): Promise<void> {
    await requestJson(`/api/memories/${memoryId}`, {
      method: 'DELETE',
      headers: getActorHeaders(user),
    });
  },

  async fetchChecklists(user?: Partial<UserProfile>): Promise<ChecklistItem[]> {
    const res = await requestJson<{ items: ChecklistItem[] }>('/api/checklists', {
      headers: getActorHeaders(user),
    });
    return res.items || [];
  },

  async createChecklistItem(
    payload: {
      category: ChecklistCategory;
      title: string;
      notes?: string;
      weekNumber?: number;
      trimester?: 1 | 2 | 3;
    },
    user?: Partial<UserProfile>
  ): Promise<ChecklistItem> {
    const res = await requestJson<{ item: ChecklistItem }>('/api/checklists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify(payload),
    });
    return res.item;
  },

  async updateChecklistItem(
    itemId: string,
    partial: Partial<ChecklistItem>,
    user?: Partial<UserProfile>
  ): Promise<ChecklistItem> {
    const res = await requestJson<{ item: ChecklistItem }>(`/api/checklists/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify(partial),
    });
    return res.item;
  },

  async deleteChecklistItem(itemId: string, user?: Partial<UserProfile>): Promise<void> {
    await requestJson(`/api/checklists/${itemId}`, {
      method: 'DELETE',
      headers: getActorHeaders(user),
    });
  },

  async fetchDiary(user?: Partial<UserProfile>): Promise<{
    entries: Record<string, HealthDiaryEntry>;
    reminderHistory: ReminderHistoryEntry[];
  }> {
    return requestJson('/api/diary', { headers: getActorHeaders(user) });
  },

  async upsertDiaryEntry(
    date: string,
    entry: HealthDiaryEntry,
    user?: Partial<UserProfile>
  ): Promise<HealthDiaryEntry> {
    const res = await requestJson<{ entry: HealthDiaryEntry }>(`/api/diary/${date}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify({ entry }),
    });
    return res.entry;
  },

  async deleteDiaryDate(date: string, user?: Partial<UserProfile>): Promise<void> {
    await requestJson(`/api/diary/${date}`, {
      method: 'DELETE',
      headers: getActorHeaders(user),
    });
  },

  // 7. Weekly & Knowledge Library
  async fetchLibrary(
    includeAll = false,
    user?: Partial<UserProfile>
  ): Promise<{ articles: LibraryArticle[]; state: UserKnowledgeState }> {
    return requestJson(`/api/library${includeAll ? '?includeAll=true' : ''}`, {
      headers: getActorHeaders(user),
    });
  },

  async createLibraryArticle(
    payload: Omit<LibraryArticle, 'id' | 'updatedDate' | 'status' | 'authorName'>,
    user?: Partial<UserProfile>
  ): Promise<LibraryArticle> {
    const res = await requestJson<{ article: LibraryArticle }>('/api/library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify(payload),
    });
    return res.article;
  },

  async moderateLibraryArticle(
    articleId: string,
    status: 'approved' | 'rejected' | 'pending',
    user?: Partial<UserProfile>
  ): Promise<LibraryArticle> {
    const res = await requestJson<{ article: LibraryArticle }>(`/api/library/${articleId}/moderate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify({ status }),
    });
    return res.article;
  },

  async updateLibraryState(
    action:
      | { type: 'mark_article_read'; articleId: string }
      | { type: 'toggle_article_save'; articleId: string }
      | { type: 'mark_week_read'; week: number }
      | { type: 'toggle_week_favorite'; week: number },
    user?: Partial<UserProfile>
  ): Promise<UserKnowledgeState> {
    const res = await requestJson<{ state: UserKnowledgeState }>('/api/library/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify(action),
    });
    return res.state;
  },

  // 8. Family Sharing, Birth Plan, Postpartum & Baby
  async fetchFamilyConnections(user?: Partial<UserProfile>): Promise<FamilyConnection[]> {
    const res = await requestJson<{ connections: FamilyConnection[] }>('/api/family', {
      headers: getActorHeaders(user),
    });
    return res.connections || [];
  },

  async createFamilyInvite(
    payload: {
      memberName: string;
      relationship: string;
      permissions?: Partial<FamilySharePermissions>;
    },
    user?: Partial<UserProfile>
  ): Promise<FamilyConnection> {
    const res = await requestJson<{ connection: FamilyConnection }>('/api/family/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify(payload),
    });
    return res.connection;
  },

  async joinFamilyByCode(inviteCode: string, user?: Partial<UserProfile>): Promise<FamilyConnection> {
    const res = await requestJson<{ connection: FamilyConnection }>('/api/family/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify({ inviteCode }),
    });
    return res.connection;
  },

  async updateFamilyPermissions(
    connectionId: string,
    permissions: Partial<FamilySharePermissions>,
    user?: Partial<UserProfile>
  ): Promise<FamilyConnection> {
    const res = await requestJson<{ connection: FamilyConnection }>(`/api/family/${connectionId}/permissions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify({ permissions }),
    });
    return res.connection;
  },

  async revokeFamilyConnection(
    connectionId: string,
    user?: Partial<UserProfile>
  ): Promise<FamilyConnection> {
    const res = await requestJson<{ connection: FamilyConnection }>(`/api/family/${connectionId}`, {
      method: 'DELETE',
      headers: getActorHeaders(user),
    });
    return res.connection;
  },

  async fetchSharedFamilySnapshot(
    connectionId: string,
    user?: Partial<UserProfile>
  ): Promise<{
    connection: FamilyConnection;
    ownerProfile: Partial<UserProfile>;
    milestones?: number[];
    checklists?: ChecklistItem[];
    memories?: MemoryEntry[];
    sensitiveDiary?: Record<string, HealthDiaryEntry>;
  }> {
    const res = await requestJson<{ snapshot: any }>(`/api/family/${connectionId}/snapshot`, {
      headers: getActorHeaders(user),
    });
    return res.snapshot;
  },

  async fetchBirthPlan(user?: Partial<UserProfile>): Promise<BirthPlanData> {
    const res = await requestJson<{ plan: BirthPlanData }>('/api/birth-plan', {
      headers: getActorHeaders(user),
    });
    return res.plan;
  },

  async saveBirthPlan(plan: BirthPlanData, user?: Partial<UserProfile>): Promise<BirthPlanData> {
    const res = await requestJson<{ plan: BirthPlanData }>('/api/birth-plan', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify({ plan }),
    });
    return res.plan;
  },

  async fetchPostpartumState(user?: Partial<UserProfile>): Promise<PostpartumState> {
    const res = await requestJson<{ state: PostpartumState }>('/api/postpartum', {
      headers: getActorHeaders(user),
    });
    return res.state;
  },

  async updatePostpartumState(
    state: Partial<PostpartumState>,
    user?: Partial<UserProfile>
  ): Promise<PostpartumState> {
    const res = await requestJson<{ state: PostpartumState }>('/api/postpartum', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify({ state }),
    });
    return res.state;
  },

  async addPostpartumDiary(
    entry: Omit<PostpartumDiaryEntry, 'id' | 'createdAt'>,
    user?: Partial<UserProfile>
  ): Promise<PostpartumState> {
    const res = await requestJson<{ state: PostpartumState }>('/api/postpartum/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify(entry),
    });
    return res.state;
  },

  async addBabyCareLog(
    log: Omit<BabyCareLog, 'id'>,
    user?: Partial<UserProfile>
  ): Promise<PostpartumState> {
    const res = await requestJson<{ state: PostpartumState }>('/api/postpartum/care-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify(log),
    });
    return res.state;
  },

  async addBabyAlbumPhoto(
    photo: Omit<BabyAlbumPhoto, 'id' | 'createdAt'>,
    user?: Partial<UserProfile>
  ): Promise<PostpartumState> {
    const res = await requestJson<{ state: PostpartumState }>('/api/postpartum/album', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify(photo),
    });
    return res.state;
  },

  // 9. Rewards & Admin Dashboard
  async fetchRewards(user?: Partial<UserProfile>): Promise<RewardBadge[]> {
    const res = await requestJson<{ badges: RewardBadge[] }>('/api/rewards', {
      headers: getActorHeaders(user),
    });
    return res.badges || [];
  },

  async fetchAdminOverview(user?: Partial<UserProfile>): Promise<{
    stats: {
      usersCount: number;
      pendingVideosCount: number;
      totalVideosCount: number;
      postsCount: number;
      openReportsCount: number;
      ordersCount: number;
      pendingOrdersCount: number;
      outOfStockProductsCount: number;
    };
    users: UserProfile[];
    videos: NovaVideoItem[];
    posts: DetailedPost[];
    articles: LibraryArticle[];
    orders: OrderInfo[];
    reports: ContentReport[];
    products: ProductItem[];
    auditLogs: AuditLogEntry[];
  }> {
    return requestJson('/api/admin/overview', { headers: getActorHeaders(user) });
  },

  async updateUserRole(
    targetUserId: string,
    role: UserRole,
    user?: Partial<UserProfile>
  ): Promise<UserProfile> {
    const res = await requestJson<{ user: UserProfile }>(`/api/admin/users/${targetUserId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify({ role }),
    });
    return res.user;
  },

  async resolveContentReport(
    reportId: string,
    status: 'resolved_removed' | 'dismissed',
    resolutionNote: string,
    user?: Partial<UserProfile>
  ): Promise<ContentReport> {
    const res = await requestJson<{ report: ContentReport }>(`/api/admin/reports/${reportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify({ status, resolutionNote }),
    });
    return res.report;
  },

  async sendAdminBroadcast(
    title: string,
    description: string,
    user?: Partial<UserProfile>
  ): Promise<{ sentCount: number }> {
    return requestJson('/api/admin/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getActorHeaders(user) },
      body: JSON.stringify({ title, description }),
    });
  },
};
