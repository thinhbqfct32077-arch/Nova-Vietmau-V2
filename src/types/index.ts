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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  pregnancyWeek: number;
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
  emergencyContacts: EmergencyContact[];
  shippingAddresses?: ShippingAddress[];
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

export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'water' | 'yoga' | 'music' | 'checkup';
  completed: boolean;
  timeTarget: string;
  iconBg: string;
  iconColor: string;
}

export interface DayProgress {
  dayName: string;
  shortDay: string;
  percent: number;
  isPeak?: boolean;
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

export interface ChatMessage {
  id: string;
  sender: 'nova' | 'user';
  text: string;
  timestamp: string;
  audioDuration?: string;
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
