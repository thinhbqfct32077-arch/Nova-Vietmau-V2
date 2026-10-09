export type ScreenType = 'onboarding' | 'home' | 'video' | 'care' | 'community' | 'shop' | 'chat';

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
