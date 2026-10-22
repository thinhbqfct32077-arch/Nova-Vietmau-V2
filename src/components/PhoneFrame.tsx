import React from 'react';
import { motion } from 'framer-motion';
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
  Sparkles,
  Stethoscope,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { ScreenType, UserProfile } from '../types';
import { ASSETS } from '../data/mockData';

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
  onOpenEmergency,
  onOpenVipModal,
}) => {
  const isVideoScreen = activeScreen === 'video';
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
    { id: 'shop' as ScreenType, label: 'Cửa hàng mẹ & bé', icon: ShoppingBag, badge: cartCount > 0 ? cartCount : undefined },
    { id: 'profile' as ScreenType, label: 'Hồ sơ thai kỳ', icon: User },
  ];

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#3A2E2B] flex flex-row overflow-hidden font-sans">
      {/* 
        DESKTOP NAVIGATION SIDEBAR (Visible on Windows / macOS / iPad screens: lg and above) 
        Takes advantage of the full desktop monitor width!
      */}
      {showNav && (
        <aside
          aria-label="Thanh điều hướng ứng dụng máy tính"
          className="hidden lg:flex w-72 shrink-0 h-screen bg-white border-r border-[#EFEAE5] flex-col justify-between p-5 z-30 select-none shadow-xs"
        >
          {/* Top Brand & User profile */}
          <div className="flex flex-col gap-5">
            {/* Logo */}
            <div
              onClick={() => onNavigateToScreen && onNavigateToScreen('home')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#C84B4B] to-[#E26D6D] flex items-center justify-center text-white shadow-md shadow-[#C84B4B]/25 group-hover:scale-105 transition-transform">
                <Heart className="w-6 h-6 fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[18px] text-[#3A2E2B] tracking-tight leading-none">
                  Nova Việt Mẫu
                </span>
                <span className="text-[11px] font-medium text-[#8C7B75] mt-1">
                  Đồng hành thai kỳ thông minh
                </span>
              </div>
            </div>

            {/* User Profile Card */}
            <div
              onClick={() => onNavigateToScreen && onNavigateToScreen('profile')}
              className="bg-[#FFFBF7] p-3.5 rounded-2xl border border-[#F2ECE7] flex items-center gap-3 cursor-pointer hover:border-[#E8DFD8] transition-colors"
            >
              <div className="relative">
                <img
                  src={user?.avatar || ASSETS.motherAvatar}
                  alt={user?.name || 'Mẹ Bầu'}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
                />
                {isVip ? (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-[#D4AF37] rounded-full text-white flex items-center justify-center shadow-xs">
                    <Crown className="w-2.5 h-2.5 fill-current" />
                  </span>
                ) : (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#2ECC71] rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-[#3A2E2B] truncate">
                    {user?.name || 'Khánh Băng'}
                  </h4>
                  {isVip && (
                    <span className="text-[9px] font-black bg-[#D4AF37] text-white px-1 rounded-sm">
                      VIP
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#8C7B75] truncate mt-0.5">
                  Tuần {user?.pregnancyWeek || 24} · {user?.babyNickname || 'Bé Bơ'}
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const isActive = activeScreen === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigateToScreen && onNavigateToScreen(item.id)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#C84B4B] text-white shadow-sm shadow-[#C84B4B]/25'
                        : 'text-[#6E5D57] hover:bg-[#FAF6F3] hover:text-[#3A2E2B]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4.5 h-4.5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white text-[#C84B4B]'
                            : 'bg-[#C84B4B] text-white'
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

          {/* Bottom Actions: VIP & Emergency SOS */}
          <div className="flex flex-col gap-2.5 pt-4 border-t border-[#F0ECE9]">
            {/* VIP Upgrade Banner / Status */}
            {!isVip && onOpenVipModal && (
              <button
                onClick={onOpenVipModal}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-[#2F2725] to-[#3A2E2B] text-white flex items-center justify-between hover:scale-[1.01] transition-transform cursor-pointer shadow-xs border border-[#D4AF37]/30"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-7 h-7 rounded-lg bg-[#D4AF37] text-[#2A2321] flex items-center justify-center shrink-0">
                    <Crown className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold block text-[#FDF5E6]">
                      Nâng cấp Nova VIP
                    </span>
                    <span className="text-[9.5px] text-white/70">
                      Hỏi đáp AI không giới hạn
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
              </button>
            )}

            {/* Quick Nova AI Voice Assistant Button */}
            {onOpenVoiceChat && (
              <button
                onClick={onOpenVoiceChat}
                className="w-full py-2.5 px-3 rounded-2xl bg-[#FFF5F2] hover:bg-[#FFEAE4] text-[#C84B4B] border border-[#FADCD5] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Mic className="w-4 h-4 text-[#C84B4B]" />
                <span>Trò chuyện với Nova AI</span>
              </button>
            )}

            {/* Emergency Hotline 115 */}
            <button
              onClick={() => {
                if (onOpenEmergency) {
                  onOpenEmergency();
                } else if (onNavigateToScreen) {
                  onNavigateToScreen('emergency');
                }
              }}
              className="w-full py-2.5 px-3 rounded-2xl bg-[#E74C3C] hover:bg-[#C0392B] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Cấp cứu sản khoa (115)</span>
            </button>
          </div>
        </aside>
      )}

      {/* 
        MAIN VIEWPORT CANVAS
        - On Mobile Portrait & Landscape: Full width/height 100dvh
        - On Desktop (Windows): Occupies the remaining full window with a generous max-w-5xl/6xl centered content width!
      */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col bg-[#FFFBF7] relative">
        <div
          className={`flex-1 w-full h-full flex flex-col overflow-hidden ${
            activeScreen === 'video'
              ? 'bg-black text-white'
              : 'bg-[#FFFBF7] text-[#3A2E2B]'
          }`}
          style={{
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          {/* Centered responsive shell on Desktop/Landscape */}
          <div className="flex-1 w-full h-full flex flex-col overflow-hidden mx-auto max-w-none lg:max-w-5xl xl:max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
