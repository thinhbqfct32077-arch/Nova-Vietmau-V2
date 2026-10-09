import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSETS } from '../../data/mockData';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OnboardingScreenProps {
  onStart: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onStart }) => {
  const [activeSlide, setActiveSlide] = useState(1); // 0, 1 (default active according to image), 2
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authModal, setAuthModal] = useState<'register' | 'login' | null>(null);

  const slides = [
    {
      title: 'Hành trình diệu kỳ',
      desc: 'Theo dõi sự phát triển từng ngày của thiên thần nhỏ trong bụng mẹ.',
    },
    {
      title: 'Chào mừng tới Nova',
      desc: 'Người bạn đồng hành ân cần, giúp mẹ an tâm chăm sóc sức khỏe thai kỳ và đón bé yêu chào đời.',
    },
    {
      title: 'Kiến thức y khoa chuẩn',
      desc: 'Được cố vấn bởi các chuyên gia sản nhi hàng đầu với lời khuyên khoa học.',
    },
  ];

  const handleAction = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onStart();
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-6 pt-2 pb-6 bg-[#FFFBF7] select-none overflow-y-auto no-scrollbar">
      {/* Top Floating Art Card */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
        className="relative w-full rounded-[28px] overflow-hidden bg-[#E2E8E6] ios-card-shadow border border-[#D5DDD9]/60 flex flex-col items-center pt-6 pb-5 px-4 shadow-sm"
      >
        {/* Soft Decorative Gradient Light */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/40 rounded-full blur-2xl pointer-events-none" />

        {/* Hand & Baby Foot Illustration with Fallback */}
        <div className="relative w-full aspect-[4/3] rounded-[22px] overflow-hidden mb-3 bg-[#D9E3DF] flex items-center justify-center shadow-inner">
          <img
            src={ASSETS.onboardingArt}
            alt="Mẹ và bé Nova"
            className="w-full h-full object-cover"
            loading="eager"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Handwritten Logo & Motto */}
        <div className="text-center z-10">
          <h1 className="font-handwriting text-[38px] leading-tight text-[#3A2E2B] font-bold tracking-wide">
            Nova
          </h1>
          <p className="text-[12px] font-medium text-[#6B7280] tracking-tight mt-0.5">
            Mãi mãi bên nhau, bạn nhé!
          </p>
        </div>
      </motion.div>

      {/* Middle Text & Slide Indicators */}
      <div className="flex flex-col items-center text-center mt-6 mb-4 px-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="flex flex-col items-center"
          >
            <h2 className="text-[24px] font-bold text-[#3A2E2B] tracking-tight leading-snug">
              {slides[activeSlide].title}
            </h2>
            <p className="text-[13px] text-[#8C7B75] mt-2 leading-relaxed max-w-[320px]">
              {slides[activeSlide].desc}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* 3 Slide Dots (Middle dot is elongated red-accent as in Hình 3) */}
        <div className="flex items-center gap-2 mt-5">
          {slides.map((_, idx) => {
            const isActive = activeSlide === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive
                    ? 'w-6 h-2 bg-[#C84B4B]'
                    : 'w-2 h-2 bg-[#D1C7C2] hover:bg-[#B5A8A2]'
                }`}
                aria-label={`Trang ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 w-full">
        {/* Register Button */}
        <motion.button
          whileTap={{ scale: 0.96, y: 2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onClick={() => handleAction()}
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#C84B4B] hover:bg-[#B84040] text-white font-semibold text-[15px] shadow-md shadow-[#C84B4B]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Đăng ký tài khoản</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </motion.button>

        {/* Login Button */}
        <motion.button
          whileTap={{ scale: 0.96, y: 2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onClick={() => handleAction()}
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-[#FAF6F3] text-[#3A2E2B] font-semibold text-[15px] border border-[#E5DFDB] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Đăng nhập bằng email</span>
        </motion.button>
      </div>
    </div>
  );
};
