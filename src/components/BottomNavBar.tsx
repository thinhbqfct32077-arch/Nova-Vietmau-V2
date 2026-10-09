import React from 'react';
import { motion } from 'framer-motion';
import { Home, PlayCircle, Heart, Users, ShoppingBag } from 'lucide-react';
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
    {
      id: 'home' as ScreenType,
      label: 'Trang chủ',
      icon: Home,
    },
    {
      id: 'video' as ScreenType,
      label: 'Video',
      icon: PlayCircle,
    },
    {
      id: 'care' as ScreenType,
      label: 'Chăm sóc',
      icon: Heart,
    },
    {
      id: 'community' as ScreenType,
      label: 'Cộng đồng',
      icon: Users,
    },
    {
      id: 'shop' as ScreenType,
      label: 'Cửa hàng',
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : undefined,
    },
  ];

  return (
    <nav
      aria-label="Điều hướng chính"
      className={`shrink-0 w-full px-2 py-1.5 z-40 select-none transition-colors duration-200 relative ${
        isVideoScreen
          ? 'bg-black/90 backdrop-blur-xl border-t border-white/10 shadow-2xl text-white'
          : 'bg-white/90 backdrop-blur-xl border-t border-[#EFEAE5] ios-nav-shadow text-[#3A2E2B]'
      }`}
    >
      <div className="grid grid-cols-5 items-center relative">
        {tabs.map((tab) => {
          const isActive = activeScreen === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="relative flex flex-col items-center justify-center py-1 cursor-pointer focus:outline-none group min-h-[48px]"
              aria-label={tab.label}
            >
              {/* Tab Icon with Tactile iOS Physics */}
              <motion.div
                whileTap={{ scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                className="relative flex items-center justify-center"
              >
                <Icon
                  className={`w-6 h-6 transition-colors duration-200 ${
                    isActive
                      ? isVideoScreen
                        ? 'text-white stroke-[2.3]'
                        : 'text-[#C84B4B] stroke-[2.3]'
                      : isVideoScreen
                      ? 'text-white/45 stroke-[1.8] group-hover:text-white/80'
                      : 'text-[#8C7B75] stroke-[1.8] group-hover:text-[#5E4E49]'
                  }`}
                  fill={isActive ? 'currentColor' : 'none'}
                />

                {/* Cart Badge with Pulse */}
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-[#C84B4B] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </motion.div>

              {/* Tab Label */}
              <span
                className={`text-[10px] mt-1 transition-colors duration-200 tracking-tight leading-none ${
                  isActive
                    ? isVideoScreen
                      ? 'text-white font-bold'
                      : 'text-[#C84B4B] font-bold'
                    : isVideoScreen
                    ? 'text-white/50 font-medium'
                    : 'text-[#8C7B75] font-medium'
                }`}
              >
                {tab.label}
              </span>

              {/* Clean Active Indicator Pill */}
              {isActive && (
                <motion.div
                  layoutId="activeBottomTabPill"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  className={`absolute -bottom-0.5 w-5 h-1 rounded-full ${
                    isVideoScreen ? 'bg-white' : 'bg-[#C84B4B]'
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
