import React from 'react';
import {
  Home,
  Heart,
  PlayCircle,
  Users,
  ShoppingBag,
  User,
  Mic,
  Crown,
  PhoneCall,
  ChevronRight,
  Search,
  Sun,
  Moon,
  Bell,
  Compass,
  Calendar,
  CheckSquare,
  Camera,
  FileBarChart2,
  BookOpen,
  HeartHandshake,
  ClipboardList,
  Baby,
  Award,
  ShieldCheck,
  WifiOff,
} from 'lucide-react';
import { ScreenType, UserProfile } from '../types';
import { ASSETS } from '../data/mockData';
import { ThemeMode } from '../services/storageService';
import { NovaBrandMark, NovaImage } from './NovaBrandMark';

interface PhoneFrameProps {
  children: React.ReactNode;
  activeScreen?: ScreenType;
  isVoiceListening?: boolean;
  onResetOnboarding?: () => void;
  onOpenVoiceChat?: () => void;
  onNavigateToScreen?: (screen: ScreenType) => void;
  user?: UserProfile;
  isVip?: boolean;
  cartCount?: number;
  unreadNotificationsCount?: number;
  themeMode?: ThemeMode;
  onToggleTheme?: () => void;
  onOpenGlobalSearch?: () => void;
  onOpenNotifications?: () => void;
  isOnline?: boolean;
  onOpenEmergency?: () => void;
  onOpenVipModal?: () => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  activeScreen = 'home',
  onOpenVoiceChat,
  onNavigateToScreen,
  user,
  isVip = false,
  cartCount = 0,
  unreadNotificationsCount = 0,
  themeMode = 'light',
  onToggleTheme,
  onOpenGlobalSearch,
  onOpenNotifications,
  isOnline = true,
  onOpenEmergency,
  onOpenVipModal,
}) => {
  const showNav =
    activeScreen !== 'onboarding' &&
    activeScreen !== 'chat' &&
    activeScreen !== 'login' &&
    activeScreen !== 'payment' &&
    activeScreen !== 'order_info';

  const navItems = [
    { id: 'home' as ScreenType, label: 'Trang chủ', icon: Home },
    { id: 'care' as ScreenType, label: 'Chăm sóc & Nhật ký', icon: Heart },
    { id: 'video' as ScreenType, label: 'Video thai giáo', icon: PlayCircle },
    { id: 'community' as ScreenType, label: 'Cộng đồng mẹ bầu', icon: Users },
    {
      id: 'shop' as ScreenType,
      label: 'Cửa hàng mẹ & bé',
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    { id: 'profile' as ScreenType, label: 'Hồ sơ thai kỳ', icon: User },
  ];

  const isStaff = user?.role === 'admin' || user?.role === 'moderator';

  const ecosystemLinks: { id: ScreenType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'journey', label: 'Hành trình 40 tuần', icon: Compass },
    { id: 'weekly', label: 'Thai kỳ theo tuần', icon: Calendar },
    { id: 'checklist', label: 'Checklist mẹ bầu', icon: CheckSquare },
    { id: 'memories', label: 'Kỷ niệm & Siêu âm', icon: Camera },
    { id: 'report', label: 'Báo cáo sức khỏe', icon: FileBarChart2 },
    { id: 'library', label: 'Thư viện y khoa', icon: BookOpen },
    { id: 'family', label: 'Nova Family', icon: HeartHandshake },
    { id: 'birth_plan', label: 'Kế hoạch đi sinh', icon: ClipboardList },
    { id: 'postpartum', label: 'Sau sinh & Em bé', icon: Baby },
    ...(user?.rewardsEnabled !== false
      ? [{ id: 'rewards' as ScreenType, label: 'Ghi nhận nhẹ nhàng', icon: Award }]
      : []),
    ...(isStaff ? [{ id: 'admin' as ScreenType, label: 'Quản trị & Kiểm duyệt', icon: ShieldCheck }] : []),
  ];

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] dark:bg-[#161311] text-[#322622] dark:text-[#F4EDE6] flex flex-row overflow-hidden font-sans print:block print:overflow-visible print:bg-white">
      {showNav && (
        <aside
          aria-label="Thanh điều hướng ứng dụng máy tính"
          className="hidden lg:flex w-72 shrink-0 h-screen bg-[#FFFFFF] dark:bg-[#1E1A17] border-r border-[#E6DDD1] dark:border-[#362E2A] flex-col justify-between p-4 z-30 select-none print:hidden"
        >
          <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar pr-0.5">
            {/* Editorial Logo & Utility Actions */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onNavigateToScreen?.('home')}
                className="flex items-center gap-2.5 cursor-pointer group min-w-0 text-left focus:outline-none"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#F7EAE5] dark:bg-[#35231E] border border-[#E6DDD1] dark:border-[#4A3630] flex items-center justify-center text-[#B55841] dark:text-[#D47A63] shrink-0 transition-colors group-hover:bg-[#B55841] group-hover:text-white">
                  <NovaBrandMark className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-editorial font-semibold text-[16px] text-[#322622] dark:text-[#F4EDE6] tracking-tight block leading-none truncate">
                    Nova Việt Mẫu
                  </span>
                  <span className="text-[11px] font-medium text-[#786962] dark:text-[#B5A89F] mt-1 block truncate">
                    Đồng hành cùng mẹ
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-1 shrink-0">
                {onToggleTheme && (
                  <button
                    type="button"
                    onClick={onToggleTheme}
                    aria-label="Chuyển giao diện Sáng/Tối"
                    title="Chuyển giao diện Sáng/Tối"
                    className="w-9 h-9 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-[#786962] dark:text-[#B5A89F] flex items-center justify-center hover:border-[#B55841]/40 hover:text-[#322622] dark:hover:text-[#F4EDE6] transition-colors cursor-pointer"
                  >
                    {themeMode === 'dark' ? (
                      <Sun className="w-4 h-4 text-[#D7BA86]" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                  </button>
                )}
                {onOpenNotifications && (
                  <button
                    type="button"
                    onClick={onOpenNotifications}
                    aria-label="Thông báo"
                    title="Thông báo"
                    className="relative w-9 h-9 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-[#786962] dark:text-[#B5A89F] flex items-center justify-center hover:border-[#B55841]/40 hover:text-[#322622] dark:hover:text-[#F4EDE6] transition-colors cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[#B55841] text-white text-[9px] font-bold rounded-full flex items-center justify-center tabular-nums">
                        {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Global Search Trigger */}
            {onOpenGlobalSearch && (
              <button
                type="button"
                onClick={onOpenGlobalSearch}
                className="w-full px-3 py-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#786962] dark:text-[#B5A89F] flex items-center gap-2 hover:border-[#B55841]/50 cursor-pointer transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-[#B55841] dark:text-[#D47A63] shrink-0" />
                <span className="truncate">Tìm tuần thai, bài viết, video...</span>
              </button>
            )}

            {/* User Profile Card */}
            <button
              type="button"
              onClick={() => onNavigateToScreen?.('profile')}
              className="w-full bg-[#F2ECE3] dark:bg-[#231E1B] p-3 rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] flex items-center gap-3 cursor-pointer hover:border-[#B55841]/40 transition-colors text-left"
            >
              <div className="relative shrink-0">
                <NovaImage
                  src={user?.avatar || ASSETS.motherAvatar}
                  alt={user?.name || 'Mẹ Bầu'}
                  className="w-10 h-10 rounded-full object-cover border border-[#FFFFFF] dark:border-[#362E2A]"
                />
                {isVip && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C4A46B] rounded-full text-white flex items-center justify-center">
                    <Crown className="w-2.5 h-2.5 fill-current" />
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] truncate">
                    {user?.name || 'Khánh Băng'}
                  </h4>
                  {user?.role === 'admin' && (
                    <span className="text-[9px] font-bold text-[#B55841] dark:text-[#D47A63] uppercase shrink-0">
                      · Admin
                    </span>
                  )}
                  {user?.role === 'moderator' && (
                    <span className="text-[9px] font-bold text-[#6D8572] dark:text-[#8DA892] uppercase shrink-0">
                      · Điều phối
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] truncate mt-0.5 tabular-nums">
                  {user?.pregnancyStatus === 'postpartum'
                    ? 'Chế độ Sau sinh & Bé'
                    : `Tuần ${user?.pregnancyWeek || 24} · ${user?.babyNickname || 'Bé Bơ'}`}
                </p>
              </div>
            </button>

            {/* Primary Navigation Links */}
            <div className="pt-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#786962] dark:text-[#B5A89F] px-2 mb-1.5">
                Không gian mỗi ngày
              </p>
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = activeScreen === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigateToScreen?.(item.id)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap min-h-[40px] ${
                        isActive
                          ? 'bg-[#B55841] dark:bg-[#D47A63] text-white'
                          : 'text-[#5A4C46] dark:text-[#CFC4BC] hover:bg-[#FAF6F0] dark:hover:bg-[#231E1B] hover:text-[#322622] dark:hover:text-[#F4EDE6]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
                            isActive
                              ? 'bg-white text-[#B55841]'
                              : 'bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Ecosystem Hub Sub-links */}
            <div className="pt-3 border-t border-[#E6DDD1] dark:border-[#362E2A]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#786962] dark:text-[#B5A89F] px-2 mb-1.5">
                Hành trình & Gia đình
              </p>
              <div className="flex flex-col gap-0.5">
                {ecosystemLinks.map((item) => {
                  const isActive = activeScreen === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigateToScreen?.(item.id)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-colors cursor-pointer text-left whitespace-nowrap ${
                        isActive
                          ? 'bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63] font-semibold'
                          : 'text-[#5A4C46] dark:text-[#CFC4BC] hover:bg-[#FAF6F0] dark:hover:bg-[#231E1B]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col gap-2 pt-3 border-t border-[#E6DDD1] dark:border-[#362E2A]">
            {!isVip && onOpenVipModal && (
              <button
                type="button"
                onClick={onOpenVipModal}
                className="w-full p-2.5 rounded-xl bg-[#263E35] hover:bg-[#1E312A] text-[#FAF6F0] flex items-center justify-between cursor-pointer border border-[#C4A46B]/35 transition-colors"
              >
                <div className="flex items-center gap-2 text-left min-w-0">
                  <Crown className="w-4 h-4 text-[#D7BA86] fill-current shrink-0" />
                  <span className="text-[11.5px] font-semibold truncate">Đặc quyền Nova VIP</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#D7BA86] shrink-0" />
              </button>
            )}

            {onOpenVoiceChat && (
              <button
                type="button"
                onClick={onOpenVoiceChat}
                className="w-full py-2.5 px-3 rounded-xl bg-[#F7EAE5] dark:bg-[#35231E] hover:bg-[#EFE0D9] dark:hover:bg-[#422C26] text-[#B55841] dark:text-[#D47A63] border border-[#E6DDD1] dark:border-[#4A3630] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Mic className="w-4 h-4 shrink-0" />
                <span>Tâm sự cùng Nova AI</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => (onOpenEmergency ? onOpenEmergency() : onNavigateToScreen?.('emergency'))}
              className="w-full py-2 px-3 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] hover:bg-[#F7EAE5] dark:hover:bg-[#35231E] text-[#A2402E] dark:text-[#E08975] border border-[#E6DDD1] dark:border-[#362E2A] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <PhoneCall className="w-3.5 h-3.5 shrink-0" />
              <span>Hỗ trợ khẩn cấp (115)</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Viewport Canvas */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col bg-[#FAF6F0] dark:bg-[#161311] relative print:h-auto print:overflow-visible print:bg-white">
        {!isOnline && (
          <div className="bg-[#F2ECE3] dark:bg-[#231E1B] border-b border-[#E6DDD1] dark:border-[#362E2A] px-4 py-1.5 text-[11px] font-medium text-[#786962] dark:text-[#D7BA86] flex items-center justify-center gap-2 shrink-0 print:hidden">
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
            <span>Đang ngoại tuyến — hiển thị dữ liệu đã lưu gần nhất trên thiết bị.</span>
          </div>
        )}
        <div
          className={`flex-1 w-full h-full flex flex-col overflow-hidden print:h-auto print:overflow-visible ${
            activeScreen === 'video'
              ? 'bg-[#120F0E] text-white'
              : 'bg-[#FAF6F0] dark:bg-[#161311] text-[#322622] dark:text-[#F4EDE6]'
          }`}
          style={{
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          <div className="flex-1 w-full h-full flex flex-col overflow-hidden mx-auto max-w-none lg:max-w-5xl xl:max-w-6xl print:max-w-none print:h-auto print:overflow-visible">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
