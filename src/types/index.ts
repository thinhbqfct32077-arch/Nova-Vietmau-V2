export type ScreenType =
  | 'onboarding'
  | 'home'
  | 'video'
  | 'care'
  | 'community'
  | 'shop'
  | 'chat'
  | 'profile'
  | 'login'
  | 'payment'
  | 'emergency'
  | 'order_info'
  | 'journey'
  | 'memories'
  | 'checklist'
  | 'weekly'
  | 'library'
  | 'family'
  | 'birth_plan'
  | 'postpartum'
  | 'report'
  | 'rewards'
  | 'admin';

export type UserRole = 'user' | 'moderator' | 'admin';

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary?: boolean;
  notes?: string;
}

export interface ShippingAddress {
  id: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  isDefault?: boolean;
  label?: 'Nhà riêng' | 'Văn phòng' | 'Nhà người thân' | 'Khác';
  deliveryNote?: string;
}

export interface OrderTrackingEvent {
  status: string;
  label: string;
  timestamp: string;
  note?: string;
}

export interface OrderInfo {
  orderId: string;
  userId?: string;
  createdAt: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  shippingMethod: 'standard' | 'express' | 'economy';
  shippingFee: number;
  subtotal: number;
  discountAmount: number;
  voucherCode?: string;
  totalAmount: number;
  paymentMethod: 'cod' | 'vietqr' | 'momo' | 'card';
  paymentStatus?: 'unpaid' | 'awaiting_verification' | 'verified';
  deliveryNote?: string;
  status: 'pending' | 'awaiting_verification' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  estimatedDeliveryDate: string;
  trackingHistory?: OrderTrackingEvent[];
}

export type PregnancyStatus = 'pregnant' | 'planning' | 'learning' | 'postpartum';
export type PregnancyCalculationMethod = 'lmp' | 'edd' | 'ultrasound' | 'manual';

export interface PregnancyCalculationResult {
  weeks: number;
  days: number;
  totalDays: number;
  dueDate: string;
  daysRemaining: number;
  progressPercent: number;
  trimester: 1 | 2 | 3;
  fruitComparison: {
    fruitName: string;
    fruitEmoji: string;
    sizeDescription: string;
    weightDescription: string;
    lengthDescription: string;
  };
  isValid: boolean;
  warningMessage?: string;
}

export interface UserPrivacySettings {
  allowFamilyDiscovery: boolean;
  hideSensitiveDiaryInReportsByDefault: boolean;
  analyticsOptIn: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role?: UserRole;
  pregnancyStatus?: PregnancyStatus;
  calculationMethod?: PregnancyCalculationMethod;
  lmpDate?: string;
  ultrasoundDate?: string;
  ultrasoundWeeks?: number;
  ultrasoundDays?: number;
  pregnancyWeek: number;
  pregnancyDay?: number;
  dueDate: string;
  babyNickname?: string;
  babyGender?: 'boy' | 'girl' | 'surprise';
  bloodType?: string;
  weightKg?: number;
  heightCm?: number;
  isVip: boolean;
  vipPlan?: 'monthly' | 'yearly' | 'lifetime';
  vipExpiry?: string;
  streakDays: number;
  completedExercises: number;
  novaPoints: number;
  hasCompletedOnboarding?: boolean;
  drinkReminderTime?: string;
  timezone?: string;
  rewardsEnabled?: boolean;
  blockedUserIds?: string[];
  followingUserIds?: string[];
  privacySettings?: UserPrivacySettings;
  emergencyContacts: EmergencyContact[];
  shippingAddresses?: ShippingAddress[];
  orders?: OrderInfo[];
}

export interface PaymentItem {
  type: 'vip' | 'order';
  title: string;
  subtitle: string;
  price: number;
  formattedPrice: string;
  cartItems?: CartItem[];
  vipPlan?: 'monthly' | 'yearly' | 'lifetime';
}

export interface VideoComment {
  id: string;
  authorId?: string;
  author: string;
  avatar: string;
  content: string;
  timeAgo: string;
  likes: number;
}

export type VideoCategory =
  | 'all'
  | 'thai_giao_nhac'
  | 'yoga_van_dong'
  | 'dinh_duong'
  | 'cham_soc_be'
  | 'tam_ly_sinh';

export type VideoModerationStatus = 'pending' | 'approved' | 'rejected' | 'hidden';

export interface NovaVideoItem {
  id: string;
  videoUrl: string;
  poster?: string;
  title: string;
  description: string;
  category: Exclude<VideoCategory, 'all'>;
  weekMin?: number;
  weekMax?: number;
  durationSec?: number;
  hashtags: string[];
  authorId: string;
  channelName: string;
  channelAvatar: string;
  isVerified?: boolean;
  isFollowing?: boolean;
  musicTitle: string;
  likes: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  likedBy?: string[];
  status: VideoModerationStatus;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  comments: VideoComment[];
}

export interface VideoPlaylist {
  id: string;
  userId: string;
  name: string;
  videoIds: string[];
  createdAt: string;
}

export interface VideoWatchEntry {
  videoId: string;
  watchedAt: string;
  progressSec: number;
  durationSec: number;
}

export type ActivityCategory =
  | 'water'
  | 'yoga'
  | 'music'
  | 'checkup'
  | 'walk'
  | 'pill'
  | 'rest'
  | 'custom';

export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  category: ActivityCategory;
  completed: boolean;
  timeTarget: string;
  iconBg: string;
  iconColor: string;
  isFavorite?: boolean;
  notes?: string;
  reminderTime?: string;
  reminderEnabled?: boolean;
  lastCompletedAt?: string;
}

export interface WaterLogEntry {
  id: string;
  timestamp: string;
  amountMl: number;
  note?: string;
}

export interface DailyWaterRecord {
  date: string;
  targetMl: number;
  currentMl: number;
  logs: WaterLogEntry[];
  isCompleted: boolean;
}

export type ReminderFrequency = 'once' | 'daily' | 'weekly' | 'custom_days';

export interface HealthReminder {
  id: string;
  userId?: string;
  title: string;
  category: ActivityCategory;
  activityId?: string;
  time: string;
  date?: string;
  frequency: ReminderFrequency;
  daysOfWeek?: number[];
  isEnabled: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  lastTriggeredAt?: string;
}

export interface ReminderHistoryEntry {
  id: string;
  reminderId: string;
  title: string;
  category: ActivityCategory;
  triggeredAt: string;
  status: 'triggered' | 'completed' | 'snoozed';
}

export interface DayProgress {
  dayName: string;
  shortDay: string;
  percent: number;
  isPeak?: boolean;
  dateStr?: string;
  completedCount?: number;
  totalCount?: number;
}

export type ProductCategory =
  | 'all'
  | 'maternal_care'
  | 'maternal_nutrition'
  | 'pregnancy_gear'
  | 'newborn_essentials'
  | 'apparel'
  | 'baby_hygiene'
  | 'toys_development'
  | 'postpartum';

export interface ProductReview {
  id: string;
  userId: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  formattedPrice: string;
  originalPrice?: number;
  formattedOriginalPrice?: string;
  rating?: number;
  reviewsCount: number;
  category: Exclude<ProductCategory, 'all'>;
  image: string;
  description: string;
  benefits: string[];
  inStock: boolean;
  stockCount?: number;
  isDemo?: boolean;
}

export interface ProductCombo {
  id: string;
  title: string;
  subtitle: string;
  productIds: string[];
  comboPrice: number;
  savingsAmount: number;
  badgeText: string;
}

export interface CouponRule {
  code: string;
  label: string;
  type: 'fixed' | 'percent';
  value: number;
  minOrder: number;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

export interface ChatSourceReference {
  id: string;
  title: string;
  source: string;
  updatedDate: string;
  lastUpdated?: string;
  excerpt?: string;
}

export type ToolActionType = 'log_water' | 'create_appointment' | 'add_symptom' | 'create_reminder';

export interface ChatToolAction {
  id: string;
  tool: ToolActionType;
  title: string;
  description: string;
  data: Record<string, any>;
  status: 'pending_confirmation' | 'executed' | 'cancelled' | 'failed';
  resultMessage?: string;
}

export interface AIMemoryItem {
  id: string;
  key: string;
  category: 'preference' | 'health_note' | 'family' | 'custom';
  content: string;
  createdAt: string;
  lastUpdatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'nova' | 'user';
  text: string;
  timestamp: string;
  audioDuration?: string;
  sources?: ChatSourceReference[];
  toolAction?: ChatToolAction;
  isEmergencyAlert?: boolean;
  status?: 'sending' | 'sent' | 'error';
  errorMessage?: string;
}

export interface PostComment {
  id: string;
  authorId: string;
  author: string;
  avatar: string;
  content: string;
  timeAgo: string;
  createdAt?: string;
  parentId?: string;
  replyToAuthor?: string;
  mentions?: string[];
}

export type CommunityGroupType =
  | 'all'
  | 'weekly_group'
  | 'first_time'
  | 'birth_prep_group'
  | 'postpartum_group';

export interface DetailedPost {
  id: string;
  authorId: string;
  author: string;
  avatar: string;
  isVerified?: boolean;
  category: 'all' | 'experience' | 'nutrition' | 'birth_prep' | 'confession';
  groupType?: Exclude<CommunityGroupType, 'all'>;
  weekTag: string;
  title: string;
  content: string;
  image?: string;
  likes: number;
  likedBy?: string[];
  bookmarkedBy?: string[];
  hiddenBy?: string[];
  isFeatured?: boolean;
  status?: 'approved' | 'hidden' | 'removed';
  commentsCount: number;
  timeAgo: string;
  createdAt?: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  comments: PostComment[];
}

export interface CommunityPost {
  id: string;
  author: string;
  avatar: string;
  weekTag: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked?: boolean;
}

export interface UserAIContext {
  name: string;
  pregnancyWeek: number;
  babyNickname?: string;
  babyGender?: 'boy' | 'girl' | 'surprise';
  dueDate?: string;
}

export type SymptomSeverity = 'mild' | 'moderate' | 'severe';

export interface SymptomLog {
  id: string;
  name: string;
  severity: SymptomSeverity;
  notes?: string;
}

export type MoodType = 'happy' | 'calm' | 'tired' | 'excited' | 'anxious' | 'nauseous';
export type SleepQuality = 'good' | 'fair' | 'poor';

export interface WeightLog {
  id: string;
  date: string;
  weightKg: number;
  week?: number;
  notes?: string;
}

export interface NutritionLog {
  id: string;
  mealType: 'morning' | 'lunch' | 'dinner' | 'snack' | 'supplement';
  description: string;
  time: string;
}

export interface HealthDiaryEntry {
  id: string;
  date: string;
  mood?: MoodType;
  moodNote?: string;
  symptoms: SymptomLog[];
  sleepHours?: number;
  sleepQuality?: SleepQuality;
  sleepNote?: string;
  nutritionLogs?: NutritionLog[];
  activityNotes?: string;
  personalNotes?: string;
  weightKg?: number;
  fetalKickCount?: number;
  doctorAdviceNotes?: string;
  updatedAt: string;
}

export interface DoctorQuestion {
  id: string;
  question: string;
  isAnswered: boolean;
  answerNotes?: string;
}

export interface PrenatalAppointment {
  id: string;
  title: string;
  weekRecommended?: number;
  date: string;
  time: string;
  hospitalOrClinic: string;
  doctorName?: string;
  status: 'upcoming' | 'completed' | 'missed';
  notes?: string;
  resultsSummary?: string;
  questions: DoctorQuestion[];
  reminderEnabled: boolean;
  createdAt: string;
}

export type NotificationCategory =
  | 'water'
  | 'appointment'
  | 'milestone'
  | 'health'
  | 'system'
  | 'video'
  | 'community'
  | 'shop'
  | 'family';

export type NotificationSubType =
  | 'reminder'
  | 'video_approved'
  | 'video_rejected'
  | 'video_new'
  | 'community_like'
  | 'community_comment'
  | 'community_reply'
  | 'community_mention'
  | 'order_created'
  | 'order_updated'
  | 'family_invite'
  | 'family_update'
  | 'admin_broadcast'
  | 'general';

export interface AppNotification {
  id: string;
  recipientId?: string;
  title: string;
  description: string;
  category: NotificationCategory;
  subType?: NotificationSubType;
  actorId?: string;
  actorName?: string;
  targetId?: string;
  commentId?: string;
  dedupeKey?: string;
  aggregateCount?: number;
  timestamp: string;
  createdAt?: string;
  isRead: boolean;
  actionScreen?: ScreenType;
}

export interface NotificationPreferences {
  videoEnabled: boolean;
  communityEnabled: boolean;
  reminderSoundEnabled: boolean;
  shopEnabled?: boolean;
  familyEnabled?: boolean;
}

// =========================================================================
// NEW ECOSYSTEM MODULE TYPES (Modules 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 13, 15, 18)
// =========================================================================

// Module 1: Journey & Due Date History
export interface DueDateChangeEntry {
  id: string;
  previousDueDate: string;
  newDueDate: string;
  previousWeek: number;
  newWeek: number;
  reason: string;
  changedAt: string;
}

export interface JourneyState {
  userId: string;
  completedMilestoneWeeks: number[];
  dueDateHistory: DueDateChangeEntry[];
  updatedAt: string;
}

// Module 2: Memories
export type MemoryType = 'ultrasound' | 'bump_photo' | 'moment' | 'letter';
export type MemoryPrivacy = 'private' | 'family' | 'public';

export interface MemoryEntry {
  id: string;
  userId: string;
  type: MemoryType;
  title: string;
  content: string;
  imageUrl?: string;
  monthNumber: number; // 1..9
  pregnancyWeek?: number;
  memoryDate: string;
  privacy: MemoryPrivacy;
  createdAt: string;
  updatedAt: string;
}

// Module 3: Checklist
export type ChecklistCategory =
  | 'checkup_prep'
  | 'birth_bag'
  | 'nursery'
  | 'postpartum_care'
  | 'newborn_essentials'
  | 'weekly'
  | 'stage'
  | 'custom';

export interface ChecklistItem {
  id: string;
  userId: string;
  category: ChecklistCategory;
  title: string;
  notes?: string;
  weekNumber?: number;
  trimester?: 1 | 2 | 3;
  completed: boolean;
  reminderId?: string;
  isCustom?: boolean;
  createdAt: string;
  completedAt?: string;
}

// Module 5 & 11: Weekly & Knowledge Library
export type LibraryCategory =
  | 'pregnancy'
  | 'nutrition'
  | 'maternal_care'
  | 'birth_prep'
  | 'postpartum'
  | 'newborn_care';

export interface LibraryArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: LibraryCategory;
  weekMin?: number;
  weekMax?: number;
  medicalSource: string;
  updatedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  authorName: string;
  readTimeMinutes: number;
}

export interface UserKnowledgeState {
  userId: string;
  readArticleIds: string[];
  savedArticleIds: string[];
  readWeeks: number[];
  favoriteWeeks: number[];
}

// Module 7 & 6: Content Reports
export interface ContentReport {
  id: string;
  targetType: 'post' | 'comment' | 'video';
  targetId: string;
  targetTitle: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  status: 'open' | 'resolved_removed' | 'dismissed';
  resolvedBy?: string;
  resolutionNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

// Module 8: Nova Family
export interface FamilySharePermissions {
  shareAppointments: boolean;
  shareChecklist: boolean;
  shareMilestones: boolean;
  shareMemories: boolean;
  shareSensitiveHealth: boolean; // Always false by default; explicit opt-in required
}

export interface FamilyConnection {
  id: string;
  ownerId: string;
  ownerName: string;
  memberId?: string;
  memberName: string;
  relationship: string;
  inviteCode: string;
  role: 'viewer';
  status: 'pending' | 'active' | 'revoked';
  permissions: FamilySharePermissions;
  createdAt: string;
}

// Module 9: Nova Birth Plan
export interface BirthPlanData {
  userId: string;
  expectedDueDate: string;
  preferredHospital: string;
  hospitalAddress?: string;
  obgynName?: string;
  supportContacts: { id: string; name: string; role: string; phone: string }[];
  birthPreferences: string[];
  personalNotes: string;
  postpartumSupportPlan: string;
  prepItems: { id: string; label: string; checked: boolean }[];
  hospitalBagItems: { id: string; label: string; checked: boolean }[];
  updatedAt: string;
}

// Module 10: Postpartum & Baby
export interface BabyProfile {
  id: string;
  name: string;
  birthDate: string;
  gender: 'boy' | 'girl' | 'unspecified';
  birthWeightKg?: number;
  birthLengthCm?: number;
  bloodType?: string;
  notes?: string;
}

export interface PostpartumDiaryEntry {
  id: string;
  date: string;
  mood: MoodType;
  recoveryNote: string;
  sleepHours?: number;
  supportNeeded?: string;
  createdAt: string;
}

export interface BabyCareLog {
  id: string;
  type: 'feeding' | 'diaper' | 'sleep' | 'bath' | 'tummy_time' | 'note';
  title: string;
  details: string;
  loggedAt: string;
  reminderTime?: string;
}

export interface BabyAlbumPhoto {
  id: string;
  monthAge: number;
  title: string;
  caption: string;
  imageUrl: string;
  takenDate: string;
  createdAt: string;
}

export interface PostpartumState {
  userId: string;
  isPostpartumMode: boolean;
  transitionedAt?: string;
  babyProfile?: BabyProfile;
  postpartumDiary: PostpartumDiaryEntry[];
  careLogs: BabyCareLog[];
  completedMomChecklistIds: string[];
  completedBabyChecklistIds: string[];
  achievedBabyMilestoneIds: string[];
  albumPhotos: BabyAlbumPhoto[];
}

// Module 15: Rewards
export interface RewardBadge {
  id: string;
  title: string;
  description: string;
  category: 'journey' | 'checklist' | 'memories' | 'community' | 'care';
  unlocked: boolean;
  unlockedAt?: string;
}

// Module 18: Audit Logs
export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}
