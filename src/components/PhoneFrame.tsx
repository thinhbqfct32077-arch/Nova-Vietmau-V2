import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Battery, Signal, Sparkles, Smartphone, Maximize2, RotateCcw } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  activeScreen: string;
  isVoiceListening?: boolean;
  onResetOnboarding: () => void;
  onOpenVoiceChat?: () => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  activeScreen,
  isVoiceListening = false,
  onResetOnboarding,
  onOpenVoiceChat,
}) => {
  const [isDynamicIslandExpanded, setIsDynamicIslandExpanded] = useState(false);
  const [isDesktopFullScreen, setIsDesktopFullScreen] = useState(false);

  // Dynamic Island status info
  const currentTime = '09:41';

  return (
    <div className="min-h-screen bg-[#1A1817] flex flex-col items-center justify-center p-0 md:p-6 overflow-x-hidden font-sans">
      {/* Desktop helper bar */}
      <aside aria-label="Desktop Controls" className="hidden md:flex items-center gap-4 mb-4 px-5 py-2.5 bg-[#2B2625]/90 backdrop-blur-md rounded-full border border-white/10 shadow-lg text-white/90 text-xs font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C84B4B] animate-pulse" />
          <span className="font-semibold text-white">Nova App</span>
          <span className="text-white/40">|</span>
          <span className="text-white/70">Mẹ & Bé iOS 18 Design</span>
        </div>

        <div className="h-3 w-px bg-white/15" />

        <button
          onClick={() => setIsDesktopFullScreen(!isDesktopFullScreen)}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-white/10"
          title="Chuyển chế độ xem"
        >
          {isDesktopFullScreen ? (
            <>
              <Smartphone className="w-3.5 h-3.5 text-[#C84B4B]" />
              <span>Khung iPhone</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-[#C84B4B]" />
              <span>Toàn màn hình</span>
            </>
          )}
        </button>

        <button
          onClick={onResetOnboarding}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-white/10 text-white/70"
          title="Xem lại màn hình Chào mừng"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Về Onboarding</span>
        </button>
      </aside>

      {/* iPhone 15 Pro Max Mockup Container */}
      <div
        className={`relative transition-all duration-500 ease-out ${
          isDesktopFullScreen
            ? 'w-full max-w-[500px] h-[100dvh] md:h-[932px] rounded-none md:rounded-[48px]'
            : 'w-full max-w-[430px] h-[100dvh] md:h-[932px] rounded-none md:rounded-[48px]'
        } bg-[#FFFBF7] text-[#3A2E2B] shadow-2xl flex flex-col overflow-hidden border-0 md:border-[10px] md:border-[#2C2725] md:ring-1 md:ring-white/20`}
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* iOS Top Status Bar & Dynamic Island */}
        <header className="relative z-50 pt-2 px-7 flex items-center justify-between h-12 shrink-0 select-none bg-transparent">
          {/* Time */}
          <div className="w-14 text-center">
            <span
              className={`text-[14px] font-semibold tracking-tight transition-colors duration-300 ${
                activeScreen === 'video' ? 'text-white drop-shadow-sm' : 'text-[#3A2E2B]'
              }`}
            >
              {currentTime}
            </span>
          </div>

          {/* Dynamic Island with Apple Fluid Morphing Physics */}
          <motion.div
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsDynamicIslandExpanded(!isDynamicIslandExpanded)}
            animate={{
              width: isDynamicIslandExpanded ? 236 : isVoiceListening ? 154 : 124,
              height: isDynamicIslandExpanded ? 38 : 30,
              borderRadius: 20,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.6 }}
            className="bg-black text-white flex items-center justify-between px-3 cursor-pointer shadow-lg select-none group border border-white/15 relative overflow-hidden ring-1 ring-white/5"
            title="Dynamic Island"
          >
            {/* Top Gloss Edge Specular Reflection */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            {isVoiceListening ? (
              <div className="flex items-center justify-between w-full text-[11px] font-medium text-white/95">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C84B4B] animate-ping" />
                  <span className="font-bold tracking-tight">Nova AI</span>
                </div>
                {/* Live Fluid Equalizer Bars */}
                <div className="flex items-center gap-0.5 h-3.5">
                  <motion.span
                    animate={{ height: ['4px', '14px', '4px'] }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-0.5 bg-gradient-to-t from-[#C84B4B] to-[#F59E0B] rounded-full"
                  />
                  <motion.span
                    animate={{ height: ['6px', '16px', '6px'] }}
                    transition={{ duration: 0.45, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
                    className="w-0.5 bg-gradient-to-t from-[#C84B4B] to-[#EC4899] rounded-full"
                  />
                  <motion.span
                    animate={{ height: ['8px', '18px', '8px'] }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                    className="w-0.5 bg-[#C84B4B] rounded-full"
                  />
                  <motion.span
                    animate={{ height: ['5px', '13px', '5px'] }}
                    transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
                    className="w-0.5 bg-gradient-to-t from-[#F59E0B] to-[#C84B4B] rounded-full"
                  />
                </div>
              </div>
            ) : isDynamicIslandExpanded ? (
              <div className="flex items-center justify-between w-full text-[11px] font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-tr from-[#C84B4B] to-[#F59E0B] flex items-center justify-center shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="font-extrabold text-white text-[11px] leading-tight">Tuần 12 · Bé phát triển tốt</p>
                    <p className="text-[9px] text-white/60">Bằng quả chanh nhỏ · 5.4cm</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A] border border-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#0D2818]/80 border border-[#00FF66]/40 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-[#00FF66] shadow-[0_0_6px_#00FF66]"
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Status Icons */}
          <div
            className={`w-14 flex items-center justify-end gap-1.5 transition-colors duration-300 ${
              activeScreen === 'video' ? 'text-white drop-shadow-sm' : 'text-[#3A2E2B]'
            }`}
          >
            <Signal className="w-3.5 h-3.5 stroke-[2.2]" />
            <Wifi className="w-3.5 h-3.5 stroke-[2.2]" />
            <div className="flex items-center">
              <Battery className="w-5 h-5 stroke-[1.8] fill-current" />
            </div>
          </div>
        </header>

        {/* Dynamic Island Quick Popover when clicked */}
        <AnimatePresence>
          {isDynamicIslandExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="absolute top-14 left-6 right-6 z-50 bg-[#2C2725]/95 backdrop-blur-xl rounded-2xl p-3.5 text-white shadow-xl border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#FCEEEB]">Nhắc nhở thai kỳ hôm nay</span>
                <span className="text-[10px] text-white/60">10:00 AM</span>
              </div>
              <p className="text-xs text-white/90 leading-relaxed">
                Đừng quên uống đủ 2.5 lít nước và thực hiện bài tập giãn cơ 15 phút mẹ nhé!
              </p>
              <div className="mt-2.5 flex justify-end gap-2">
                <button
                  onClick={() => setIsDynamicIslandExpanded(false)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-medium transition-colors"
                >
                  Đóng
                </button>
                {onOpenVoiceChat && (
                  <button
                    onClick={() => {
                      setIsDynamicIslandExpanded(false);
                      onOpenVoiceChat();
                    }}
                    className="px-3 py-1 bg-[#C84B4B] hover:bg-[#b53e3e] text-white rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1"
                  >
                    Hỏi Nova AI
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 relative flex flex-col overflow-hidden bg-[#FFFBF7]">
          {children}
        </main>

        {/* iOS Bottom Home Bar */}
        <footer className="h-6 shrink-0 flex items-center justify-center bg-transparent pointer-events-none select-none">
          <div
            className={`w-34 h-1 rounded-full transition-colors duration-300 ${
              activeScreen === 'video' ? 'bg-white/40' : 'bg-[#3A2E2B]/25'
            }`}
          />
        </footer>
      </div>
    </div>
  );
};
