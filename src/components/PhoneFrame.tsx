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
  Monitor,
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
  themeMode = 'system',
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
    { id: 'checklist', label: 'Sổ chuẩn bị mẹ bầu', icon: CheckSquare },
    { id: 'memories', label: 'Kỷ niệm & Siêu âm', icon: Camera },
    { id: 'report', label: 'Báo cáo sức khỏe', icon: FileBarChart2 },
    { id: 'library', label: 'Thư viện y khoa', icon: BookOpen },
    { id: 'family', label: 'Gia đình Nova', icon: HeartHandshake },
    { id: 'birth_plan', label: 'Kế hoạch đi sinh', icon: ClipboardList },
    { id: 'postpartum', label: 'Sau sinh & Em bé', icon: Baby },
    ...(user?.rewardsEnabled !== false
      ? [{ id: 'rewards' as ScreenType, label: 'Ghi nhận nhẹ nhàng', icon: Award }]
      : []),
    ...(isStaff ? [{ id: 'admin' as ScreenType, label: 'Quản trị & Kiểm duyệt', icon: ShieldCheck }] : []),
  ];

  const themeLabel =
    themeMode === 'dark'
      ? 'Giao diện Tối (nhấn để chuyển)'
      : themeMode === 'light'
      ? 'Giao diện Sáng (nhấn để chuyển)'
      : 'Giao diện Theo hệ thống (nhấn để chuyển)';

  return (
    <div className="min-h-screen w-full bg-nova-bg text-nova-text flex flex-row overflow-hidden font-sans print:block print:overflow-visible print:bg-white">
      {showNav && (
        <aside
          aria-label="Thanh điều hướng ứng dụng"
          className="hidden lg:flex w-72 shrink-0 h-screen bg-nova-surface border-r border-nova-border flex-col justify-between p-4 z-30 select-none print:hidden"
        >
          <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar pr-0.5">
            {/* Editorial Logo & Utility Actions */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onNavigateToScreen?.('home')}
                className="flex items-center gap-2.5 cursor-pointer group min-w-0 text-left focus:outline-none"
              >
                <div className="w-10 h-10 rounded-2xl bg-nova-accent-soft border border-nova-border flex items-center justify-center text-nova-accent shrink-0 transition-colors group-hover:bg-nova-accent group-hover:text-nova-accent-contrast">
                  <NovaBrandMark className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-editorial font-semibold text-[16px] text-nova-text tracking-tight block leading-none truncate">
                    Nova Việt Mẫu
                  </span>
                  <span className="text-[11px] font-medium text-nova-text-muted mt-1 block truncate">
                    Đồng hành cùng mẹ
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-1 shrink-0">
                {onToggleTheme && (
                  <button
                    type="button"
                    onClick={onToggleTheme}
                    aria-label={themeLabel}
                    title={themeLabel}
                    className="w-9 h-9 rounded-xl bg-nova-bg border border-nova-border text-nova-text-muted flex items-center justify-center hover:border-nova-taupe hover:text-nova-text transition-colors cursor-pointer"
                  >
                    {themeMode === 'dark' ? (
                      <Moon className="w-4 h-4 text-nova-accent" />
                    ) : themeMode === 'light' ? (
                      <Sun className="w-4 h-4 text-nova-accent" />
                    ) : (
                      <Monitor className="w-4 h-4 text-nova-icon" />
                    )}
                  </button>
                )}
                {onOpenNotifications && (
                  <button
                    type="button"
                    onClick={onOpenNotifications}
                    aria-label="Thông báo"
                    title="Thông báo"
                    className="relative w-9 h-9 rounded-xl bg-nova-bg border border-nova-border text-nova-text-muted flex items-center justify-center hover:border-nova-taupe hover:text-nova-text transition-colors cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-nova-accent text-nova-accent-contrast text-[9px] font-bold rounded-full flex items-center justify-center tabular-nums">
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
                className="w-full px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text-muted flex items-center gap-2 hover:border-nova-taupe cursor-pointer transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-nova-icon shrink-0" />
                <span className="truncate">Tìm tuần thai, bài viết, video...</span>
              </button>
            )}

            {/* User Profile Card */}
            <button
              type="button"
              onClick={() => onNavigateToScreen?.('profile')}
              className="w-full bg-nova-bg-subtle p-3 rounded-2xl border border-nova-border flex items-center gap-3 cursor-pointer hover:border-nova-taupe transition-colors text-left"
            >
              <div className="relative shrink-0">
                <NovaImage
                  src={user?.avatar || ASSETS.motherAvatar}
                  alt={user?.name || 'Mẹ bầu'}
                  className="w-10 h-10 rounded-full object-cover border border-nova-border"
                />
                {isVip && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-nova-accent rounded-full text-nova-accent-contrast flex items-center justify-center">
                    <Crown className="w-2.5 h-2.5 fill-current" />
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-semibold text-nova-text truncate">
                    {user?.name || 'Khánh Băng'}
                  </h4>
                  {user?.role === 'admin' && (
                    <span className="text-[9px] font-semibold text-nova-accent uppercase shrink-0">
                      · Quản trị
                    </span>
                  )}
                  {user?.role === 'moderator' && (
                    <span className="text-[9px] font-semibold text-nova-sage-text uppercase shrink-0">
                      · Điều phối
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-nova-text-muted truncate mt-0.5 tabular-nums">
                  {user?.pregnancyStatus === 'postpartum'
                    ? 'Chế độ Sau sinh & Em bé'
                    : `Tuần ${user?.pregnancyWeek || 24} · ${user?.babyNickname || 'Bé Bơ'}`}
                </p>
              </div>
            </button>

            {/* Primary Navigation Links */}
            <div className="pt-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-nova-text-muted px-2 mb-1.5">
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
                          ? 'bg-nova-accent text-nova-accent-contrast'
                          : 'text-nova-text-muted hover:bg-nova-bg hover:text-nova-text'
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
                              ? 'bg-nova-surface text-nova-text'
                              : 'bg-nova-accent-soft text-nova-accent'
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
            <div className="pt-3 border-t border-nova-border">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-nova-text-muted px-2 mb-1.5">
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
                          ? 'bg-nova-accent-soft text-nova-accent font-semibold'
                          : 'text-nova-text-muted hover:bg-nova-bg hover:text-nova-text'
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
          <div className="flex flex-col gap-2 pt-3 border-t border-nova-border">
            {!isVip && onOpenVipModal && (
              <button
                type="button"
                onClick={onOpenVipModal}
                className="w-full p-2.5 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast flex items-center justify-between cursor-pointer border border-nova-border transition-colors"
              >
                <div className="flex items-center gap-2 text-left min-w-0">
                  <Crown className="w-4 h-4 fill-current shrink-0" />
                  <span className="text-[11.5px] font-semibold truncate">Đặc quyền Nova VIP</span>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>
            )}

            {onOpenVoiceChat && (
              <button
                type="button"
                onClick={onOpenVoiceChat}
                className="w-full py-2.5 px-3 rounded-xl bg-nova-accent-soft hover:bg-nova-bg-subtle text-nova-accent border border-nova-border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Mic className="w-4 h-4 shrink-0" />
                <span>Tâm sự cùng Nova AI</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => (onOpenEmergency ? onOpenEmergency() : onNavigateToScreen?.('emergency'))}
              className="w-full py-2 px-3 rounded-xl bg-nova-danger-soft hover:opacity-90 text-nova-danger border border-nova-danger-border text-xs font-semibold flex items-center justify-center gap-2 transition-opacity cursor-pointer whitespace-nowrap"
            >
              <PhoneCall className="w-3.5 h-3.5 shrink-0" />
              <span>Hỗ trợ khẩn cấp (115)</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Viewport Canvas */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col bg-nova-bg relative print:h-auto print:overflow-visible print:bg-white">
        {!isOnline && (
          <div className="bg-nova-bg-subtle border-b border-nova-border px-4 py-1.5 text-[11px] font-medium text-nova-text-muted flex items-center justify-center gap-2 shrink-0 print:hidden">
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
            <span>Đang ngoại tuyến — hiển thị dữ liệu đã lưu gần nhất trên thiết bị.</span>
          </div>
        )}
        <div
          className={`flex-1 w-full h-full flex flex-col overflow-hidden print:h-auto print:overflow-visible ${
            activeScreen === 'video'
              ? 'bg-[#1C1B18] text-[#F0EBE0]'
              : 'bg-nova-bg text-nova-text'
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
