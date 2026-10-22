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
  | 'order_info';

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

export interface OrderInfo {
  orderId: string;
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
  deliveryNote?: string;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered';
  estimatedDeliveryDate: string;
}

export type PregnancyStatus = 'pregnant' | 'planning' | 'learning';
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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
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
  author: string;
  avatar: string;
  content: string;
  timeAgo: string;
  likes: number;
}

export interface NovaVideoItem {
  id: string;
  videoUrl: string;
  poster?: string;
  title: string;
  description: string;
  hashtags: string[];
  channelName: string;
  channelAvatar: string;
  isVerified?: boolean;
  isFollowing?: boolean;
  musicTitle: string;
  likes: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  comments: VideoComment[];
}

export type ActivityCategory =
  | 'water'
  | 'yoga'
  | 'music'
  | 'checkup'
  | 'walk'
  | 'pill'
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
  timestamp: string; // e.g. "09:30"
  amountMl: number;
  note?: string;
}

export interface DailyWaterRecord {
  date: string; // YYYY-MM-DD
  targetMl: number;
  currentMl: number;
  logs: WaterLogEntry[];
  isCompleted: boolean;
}

export type ReminderFrequency = 'once' | 'daily' | 'custom_days';

export interface HealthReminder {
  id: string;
  title: string;
  category: ActivityCategory;
  activityId?: string;
  time: string; // "HH:mm"
  date?: string; // "YYYY-MM-DD" for 'once'
  frequency: ReminderFrequency;
  daysOfWeek?: number[]; // [1, 2, 3, 4, 5, 6, 0] (0 = Chủ nhật, 1 = Thứ 2)
  isEnabled: boolean;
  notes?: string;
  createdAt: string;
  lastTriggeredAt?: string;
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

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  formattedPrice: string;
  rating: number;
  reviewsCount: number;
  category: 'all' | 'books' | 'jewelry' | 'skincare' | 'bedding';
  image: string;
  description: string;
  benefits: string[];
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

export interface WeightLog {
  id: string;
  date: string;
  weightKg: number;
  week?: number;
  notes?: string;
}

export interface HealthDiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mood?: MoodType;
  moodNote?: string;
  symptoms: SymptomLog[];
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
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  hospitalOrClinic: string;
  doctorName?: string;
  status: 'upcoming' | 'completed' | 'missed';
  notes?: string;
  resultsSummary?: string;
  questions: DoctorQuestion[];
  reminderEnabled: boolean;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  category: 'water' | 'appointment' | 'milestone' | 'health' | 'system';
  timestamp: string;
  isRead: boolean;
  actionScreen?: ScreenType;
}
