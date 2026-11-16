import React from 'react';
import { motion } from 'framer-motion';
import { Home, PlayCircle, Heart, Users, ShoppingBag, User } from 'lucide-react';
import { ScreenType } from '../types';

interface BottomNavBarProps {
  activeScreen: ScreenType;
  onSelectTab: (tab: ScreenType) => void;
  cartCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeScreen,
  onSelectTab,
  cartCount = 0,
}) => {
  const isVideoScreen = activeScreen === 'video';

  const tabs = [
    { id: 'home' as ScreenType, label: 'Trang chủ', icon: Home },
    { id: 'video' as ScreenType, label: 'Video', icon: PlayCircle },
    { id: 'care' as ScreenType, label: 'Chăm sóc', icon: Heart },
    { id: 'community' as ScreenType, label: 'Cộng đồng', icon: Users },
    {
      id: 'shop' as ScreenType,
      label: 'Cửa hàng',
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    { id: 'profile' as ScreenType, label: 'Hồ sơ', icon: User },
  ];

  return (
    <nav
      aria-label="Điều hướng chính"
      className={`lg:hidden shrink-0 w-full px-1.5 pt-1 pb-[calc(0.35rem+env(safe-area-inset-bottom,0px))] z-40 select-none transition-colors duration-200 relative print:hidden ${
        isVideoScreen
          ? 'bg-[#1C1B18]/92 backdrop-blur-xl border-t border-[#3D3932] text-[#F0EBE0]'
          : 'bg-nova-surface/95 backdrop-blur-xl border-t border-nova-border ios-nav-shadow text-nova-text'
      }`}
    >
      <div className="grid grid-cols-6 items-center relative">
        {tabs.map((tab) => {
          const isActive = activeScreen === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className="relative flex flex-col items-center justify-center py-1 cursor-pointer focus:outline-none group min-h-[46px]"
              aria-label={tab.label}
            >
              <motion.div
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                className="relative flex items-center justify-center"
              >
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive
                      ? isVideoScreen
                        ? 'text-[#F0EBE0] stroke-[2.2]'
                        : 'text-nova-accent stroke-[2.2]'
                      : isVideoScreen
                      ? 'text-[#A39D93] stroke-[1.75] group-hover:text-[#F0EBE0]'
                      : 'text-nova-icon stroke-[1.75] group-hover:text-nova-text'
                  }`}
                  fill={isActive ? 'currentColor' : 'none'}
                />

                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-nova-accent text-nova-accent-contrast text-[9.5px] font-bold min-w-[15px] h-[15px] px-0.5 rounded-full flex items-center justify-center tabular-nums">
                    {tab.badge}
                  </span>
                )}
              </motion.div>

              <span
                className={`text-[10px] mt-0.5 transition-colors duration-200 tracking-tight leading-none whitespace-nowrap ${
                  isActive
                    ? isVideoScreen
                      ? 'text-[#F0EBE0] font-semibold'
                      : 'text-nova-accent font-semibold'
                    : isVideoScreen
                    ? 'text-[#A39D93] font-medium'
                    : 'text-nova-text-muted font-medium'
                }`}
              >
                {tab.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeBottomTabHairline"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  className={`absolute -bottom-0.5 w-5 h-[2px] rounded-full ${
                    isVideoScreen ? 'bg-[#F0EBE0]' : 'bg-nova-accent'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
