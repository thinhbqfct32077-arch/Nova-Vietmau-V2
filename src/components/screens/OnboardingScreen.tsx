import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSETS } from '../../data/mockData';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Heart,
  Baby,
  BookOpen,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Edit3,
} from 'lucide-react';
import { UserProfile, PregnancyStatus, PregnancyCalculationMethod } from '../../types';
import { storageService } from '../../services/storageService';
import {
  calculateFromLmp,
  calculateFromEdd,
  calculateFromUltrasound,
  formatDateVietnamese,
  toISODateString,
} from '../../services/pregnancyCalculator';
import { NovaBrandMark, NovaImage, NovaLotusDivider } from '../NovaBrandMark';
import confetti from 'canvas-confetti';

interface OnboardingScreenProps {
  onComplete: (user: UserProfile) => void;
  onExploreGuest: () => void;
  onOpenLogin: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  onExploreGuest,
  onOpenLogin,
}) => {
  const lmpInputId = useId();
  const eddInputId = useId();
  const scanDateInputId = useId();
  const scanWeeksInputId = useId();
  const scanDaysInputId = useId();
  const momNameInputId = useId();
  const babyNicknameInputId = useId();
  const reminderTimeInputId = useId();

  // Mode: 'welcome' (emotional greeting + entry options) or 'wizard' (4-step onboarding)
  const [mode, setMode] = useState<'welcome' | 'wizard'>('welcome');
  const [activeSlide, setActiveSlide] = useState(0);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [status, setStatus] = useState<PregnancyStatus>('pregnant');
  const [calcMethod, setCalcMethod] = useState<PregnancyCalculationMethod>('lmp');

  // Dates (defaults: LMP ~ 8 weeks ago)
  const defaultLmp = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 56);
    return toISODateString(d);
  })();

  const defaultEdd = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 224);
    return toISODateString(d);
  })();

  const [lmpDate, setLmpDate] = useState<string>(defaultLmp);
  const [eddDate, setEddDate] = useState<string>(defaultEdd);
  const [scanDate, setScanDate] = useState<string>(toISODateString(new Date()));
  const [scanWeeks, setScanWeeks] = useState<number>(8);
  const [scanDays, setScanDays] = useState<number>(0);

  // Profile fields
  const [momName, setMomName] = useState<string>('Khánh Băng');
  const [babyNickname, setBabyNickname] = useState<string>('Bé Bơ');
  const [babyGender, setBabyGender] = useState<'boy' | 'girl' | 'surprise'>('girl');
  const [drinkReminderTime, setDrinkReminderTime] = useState<string>('07:30');

  const slides = [
    {
      title: 'Hành trình nhỏ, yêu thương lớn',
      desc: 'Từ những nhịp tim đầu tiên đến ngày con cất tiếng khóc chào đời, Nova luôn ở đây dịu dàng lắng nghe và đồng hành cùng mẹ.',
      image: ASSETS.familyMorningImg,
      caption: 'Ấm áp bên gia đình mỗi sớm mai',
    },
    {
      title: 'Từng ngày bình yên cùng con',
      desc: 'Theo dõi tuổi thai theo tuần, ghi lại cảm xúc và lưu giữ những tấm ảnh siêu âm đầu đời trong một không gian riêng tư.',
      image: ASSETS.homeHeroImg,
      caption: 'Chăm sóc thân — tâm dịu nhẹ',
    },
    {
      title: 'An tâm với tri thức chuẩn y khoa',
      desc: 'Thông tin được chắt lọc theo khuyến cáo Bộ Y tế & WHO, giải thích nhẹ nhàng để mẹ không lo âu giữa muôn vàn tin đồn.',
      image: ASSETS.wellnessRitualImg,
      caption: 'Đáng tin cậy, rõ ràng và không áp lực',
    },
  ];

  // Real-time calculation based on selected method
  const currentCalc = (() => {
    if (status !== 'pregnant') {
      return {
        weeks: status === 'planning' ? 0 : 12,
        days: 0,
        totalDays: 0,
        dueDate: 'Theo dõi chu kỳ',
        daysRemaining: 280,
        progressPercent: 0,
        trimester: 1 as const,
        fruitComparison: {
          fruitName: status === 'planning' ? 'Chuẩn bị làm tổ' : 'Cẩm nang thai sản',
          fruitEmoji: status === 'planning' ? '🌱' : '📖',
          sizeDescription: 'Chăm sóc tiền thai kỳ',
          weightDescription: '--',
          lengthDescription: '--',
        },
        isValid: true,
      };
    }

    if (calcMethod === 'lmp') {
      return calculateFromLmp(lmpDate);
    } else if (calcMethod === 'edd') {
      return calculateFromEdd(eddDate);
    } else {
      return calculateFromUltrasound(scanDate, scanWeeks, scanDays);
    }
  })();

  const handleNextStep = () => {
    if (step === 1) {
      if (status === 'pregnant') {
        setStep(2);
      } else {
        setStep(3);
      }
    } else if (step === 2) {
      if (!currentCalc.isValid) return;
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBackStep = () => {
    if (step === 4) {
      setStep(3);
    } else if (step === 3) {
      setStep(status === 'pregnant' ? 2 : 1);
    } else if (step === 2) {
      setStep(1);
    } else if (step === 1) {
      setMode('welcome');
    }
  };

  const handleComplete = () => {
    try {
      confetti({
        particleCount: 65,
        spread: 55,
        origin: { y: 0.72 },
        colors: ['#B55841', '#C4A46B', '#6D8572', '#F2ECE3'],
      });
    } catch {}

    const updated = storageService.completeOnboarding({
      name: momName.trim() || 'Mẹ Bầu Nova',
      babyNickname: babyNickname.trim() || 'Bé Yêu',
      babyGender,
      pregnancyStatus: status,
      calculationMethod: calcMethod,
      lmpDate: calcMethod === 'lmp' ? lmpDate : undefined,
      dueDate: currentCalc.dueDate,
      ultrasoundDate: calcMethod === 'ultrasound' ? scanDate : undefined,
      ultrasoundWeeks: calcMethod === 'ultrasound' ? scanWeeks : undefined,
      ultrasoundDays: calcMethod === 'ultrasound' ? scanDays : undefined,
      pregnancyWeek: currentCalc.weeks,
      pregnancyDay: currentCalc.days,
      drinkReminderTime,
      hasCompletedOnboarding: true,
    });

    onComplete(updated);
  };

  // -------------------------------------------------------------
  // RENDER: WELCOME EDITORIAL EXPERIENCE
  // -------------------------------------------------------------
  if (mode === 'welcome') {
    const activeItem = slides[activeSlide];
    return (
      <div className="flex-1 flex flex-col justify-between px-5 sm:px-8 py-5 sm:py-8 bg-[#FAF6F0] dark:bg-[#161311] text-[#322622] dark:text-[#F4EDE6] select-none overflow-y-auto no-scrollbar">
        <div className="max-w-xl w-full mx-auto flex-1 flex flex-col justify-between gap-5">
          {/* Brand Signature Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F7EAE5] dark:bg-[#35231E] border border-[#E6DDD1] dark:border-[#4A3630] flex items-center justify-center text-[#B55841] dark:text-[#D47A63]">
                <NovaBrandMark className="w-5 h-5" />
              </div>
              <div>
                <span className="font-editorial font-semibold text-base text-[#322622] dark:text-[#F4EDE6] block leading-none">
                  Nova Việt Mẫu
                </span>
                <span className="text-[11px] text-[#786962] dark:text-[#B5A89F]">
                  Người bạn đồng hành cùng mẹ bầu
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onExploreGuest}
              className="text-xs font-medium text-[#786962] dark:text-[#B5A89F] hover:text-[#B55841] dark:hover:text-[#D47A63] transition-colors cursor-pointer py-2 px-1 whitespace-nowrap"
            >
              Xem thử trước
            </button>
          </div>

          {/* Framed Warm Morning Photography */}
          <div className="flex flex-col gap-4">
            <div className="rounded-[24px] overflow-hidden bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] p-2.5 nova-card-shadow">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.7 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-[18px] overflow-hidden bg-[#F2ECE3] dark:bg-[#231E1B]"
                >
                  <NovaImage
                    src={activeItem.image}
                    alt={activeItem.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#322622]/55 via-[#322622]/15 to-transparent pointer-events-none" />
                  <p className="absolute bottom-3 left-3.5 right-3.5 text-[11.5px] font-medium text-[#FAF6F0]/95">
                    {activeItem.caption}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Editorial Copy & Indicators */}
            <div className="text-center px-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  <h1 className="font-editorial text-[26px] sm:text-[30px] font-semibold text-[#322622] dark:text-[#F4EDE6] leading-tight">
                    {activeItem.title}
                  </h1>
                  <p className="text-[13.5px] text-[#786962] dark:text-[#B5A89F] mt-2 leading-relaxed max-w-md mx-auto">
                    {activeItem.desc}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-center gap-2 mt-4">
                {slides.map((_, idx) => {
                  const isActive = activeSlide === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSlide(idx)}
                      className={`transition-all duration-300 rounded-full cursor-pointer min-h-[16px] flex items-center justify-center px-0.5 ${
                        isActive ? 'w-7' : 'w-2.5'
                      }`}
                      aria-label={`Trang giới thiệu ${idx + 1}`}
                    >
                      <span
                        className={`block h-2 rounded-full transition-all duration-300 ${
                          isActive
                            ? 'w-7 bg-[#B55841] dark:bg-[#D47A63]'
                            : 'w-2 bg-[#E6DDD1] dark:bg-[#362E2A] hover:bg-[#C4A46B]'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Calm Action Stack */}
          <div className="flex flex-col gap-2.5 w-full">
            <motion.button
              whileTap={{ scale: 0.985 }}
              type="button"
              onClick={() => {
                setMode('wizard');
                setStep(1);
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#B55841] hover:bg-[#9E4A35] dark:bg-[#D47A63] dark:hover:bg-[#C36A53] text-white font-semibold text-[15px] transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[48px] whitespace-nowrap"
            >
              <span>Bắt đầu hành trình cùng Nova</span>
              <ArrowRight className="w-4 h-4 stroke-[2.2]" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.985 }}
              type="button"
              onClick={onOpenLogin}
              className="w-full py-3 px-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1A17] hover:bg-[#F2ECE3] dark:hover:bg-[#231E1B] text-[#322622] dark:text-[#F4EDE6] font-semibold text-[14px] border border-[#E6DDD1] dark:border-[#362E2A] transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[46px] whitespace-nowrap"
            >
              <span>Tôi đã có tài khoản</span>
            </motion.button>

            <NovaLotusDivider label="Riêng tư · An toàn trên thiết bị" className="mt-1" />
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: 4-STEP ONBOARDING WIZARD
  // -------------------------------------------------------------
  return (
    <div className="flex-1 flex flex-col justify-between px-5 sm:px-8 pt-4 pb-6 bg-[#FAF6F0] dark:bg-[#161311] text-[#322622] dark:text-[#F4EDE6] select-none overflow-y-auto no-scrollbar">
      <div className="max-w-lg w-full mx-auto flex-1 flex flex-col justify-between">
        {/* Top Header with Gentle Progress */}
        <div className="w-full mb-4">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handleBackStep}
              className="w-10 h-10 rounded-full bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-center text-[#322622] dark:text-[#F4EDE6] hover:bg-[#F2ECE3] dark:hover:bg-[#231E1B] transition-colors cursor-pointer"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="text-center">
              <span className="text-[11px] font-semibold tracking-wider text-[#B55841] dark:text-[#D47A63] uppercase">
                Làm quen nhẹ nhàng
              </span>
              <h3 className="text-[14px] font-semibold text-[#322622] dark:text-[#F4EDE6] tabular-nums">
                Bước {step} / 4
              </h3>
            </div>
            <button
              type="button"
              onClick={onExploreGuest}
              className="text-xs text-[#786962] dark:text-[#B5A89F] hover:text-[#B55841] font-medium cursor-pointer py-2 px-1 whitespace-nowrap"
            >
              Bỏ qua
            </button>
          </div>

          <div className="w-full h-1.5 bg-[#E6DDD1] dark:bg-[#362E2A] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#B55841] dark:bg-[#D47A63] rounded-full"
              initial={{ width: '25%' }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Main Step Content */}
        <div className="flex-1 flex flex-col justify-center my-auto">
          <AnimatePresence mode="wait">
            {/* BƯỚC 1: XÁC ĐỊNH TÌNH TRẠNG */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="flex flex-col gap-4"
              >
                <div className="text-center mb-1">
                  <h2 className="font-editorial text-[24px] font-semibold text-[#322622] dark:text-[#F4EDE6] leading-tight">
                    Hiện tại bạn đang ở giai đoạn nào?
                  </h2>
                  <p className="text-[13px] text-[#786962] dark:text-[#B5A89F] mt-1.5 leading-relaxed">
                    Nova sẽ điều chỉnh cẩm nang, thực đơn và gợi ý chăm sóc vừa vặn với nhịp sống của bạn.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('pregnant')}
                    className={`p-4 rounded-2xl border text-left transition-colors flex items-start gap-3.5 cursor-pointer ${
                      status === 'pregnant'
                        ? 'bg-[#FFFFFF] dark:bg-[#1E1A17] border-[#B55841] dark:border-[#D47A63] ring-1 ring-[#B55841] dark:ring-[#D47A63]'
                        : 'bg-[#FFFFFF]/80 dark:bg-[#1E1A17] border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#C4A46B]'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63] flex items-center justify-center shrink-0">
                      <Baby className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[15px] font-semibold text-[#322622] dark:text-[#F4EDE6]">
                          Tôi đang mang thai
                        </h4>
                        {status === 'pregnant' && (
                          <CheckCircle2 className="w-5 h-5 text-[#B55841] dark:text-[#D47A63]" />
                        )}
                      </div>
                      <p className="text-[12.5px] text-[#786962] dark:text-[#B5A89F] mt-0.5 leading-snug">
                        Theo dõi từng tuần tuổi thai, ngày dự sinh và nhắc lịch khám nhẹ nhàng.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('planning')}
                    className={`p-4 rounded-2xl border text-left transition-colors flex items-start gap-3.5 cursor-pointer ${
                      status === 'planning'
                        ? 'bg-[#FFFFFF] dark:bg-[#1E1A17] border-[#B55841] dark:border-[#D47A63] ring-1 ring-[#B55841] dark:ring-[#D47A63]'
                        : 'bg-[#FFFFFF]/80 dark:bg-[#1E1A17] border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#C4A46B]'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#F2ECE3] dark:bg-[#231E1B] text-[#9E5B3B] dark:text-[#D7BA86] flex items-center justify-center shrink-0">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[15px] font-semibold text-[#322622] dark:text-[#F4EDE6]">
                          Tôi đang chuẩn bị đón bé
                        </h4>
                        {status === 'planning' && (
                          <CheckCircle2 className="w-5 h-5 text-[#B55841] dark:text-[#D47A63]" />
                        )}
                      </div>
                      <p className="text-[12.5px] text-[#786962] dark:text-[#B5A89F] mt-0.5 leading-snug">
                        Chuẩn bị sức khỏe tiền thai kỳ, axit folic và nhịp sinh hoạt thư thái.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('learning')}
                    className={`p-4 rounded-2xl border text-left transition-colors flex items-start gap-3.5 cursor-pointer ${
                      status === 'learning'
                        ? 'bg-[#FFFFFF] dark:bg-[#1E1A17] border-[#B55841] dark:border-[#D47A63] ring-1 ring-[#B55841] dark:ring-[#D47A63]'
                        : 'bg-[#FFFFFF]/80 dark:bg-[#1E1A17] border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#C4A46B]'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#EBF1EC] dark:bg-[#1E2922] text-[#263E35] dark:text-[#8DA892] flex items-center justify-center shrink-0">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[15px] font-semibold text-[#322622] dark:text-[#F4EDE6]">
                          Tôi muốn đọc cẩm nang & tìm hiểu
                        </h4>
                        {status === 'learning' && (
                          <CheckCircle2 className="w-5 h-5 text-[#B55841] dark:text-[#D47A63]" />
                        )}
                      </div>
                      <p className="text-[12.5px] text-[#786962] dark:text-[#B5A89F] mt-0.5 leading-snug">
                        Tra cứu kiến thức 40 tuần thai kỳ và kinh nghiệm chăm sóc mẹ & bé.
                      </p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* BƯỚC 2: THÔNG TIN THAI KỲ */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="flex flex-col gap-3.5"
              >
                <div className="text-center">
                  <h2 className="font-editorial text-[23px] font-semibold text-[#322622] dark:text-[#F4EDE6] leading-tight">
                    Tuổi thai của mẹ hôm nay
                  </h2>
                  <p className="text-[12.5px] text-[#786962] dark:text-[#B5A89F] mt-1">
                    Chọn cách tính thuận tiện nhất với giấy khám thai của mẹ.
                  </p>
                </div>

                {/* 3 Calculation Method Tabs */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F2ECE3] dark:bg-[#231E1B] rounded-xl text-[12px] font-medium border border-[#E6DDD1] dark:border-[#362E2A]">
                  {[
                    { id: 'lmp' as const, label: 'Kỳ kinh cuối' },
                    { id: 'edd' as const, label: 'Ngày dự sinh' },
                    { id: 'ultrasound' as const, label: 'Theo siêu âm' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setCalcMethod(m.id)}
                      className={`py-2 px-1 rounded-lg transition-all text-center cursor-pointer whitespace-nowrap ${
                        calcMethod === m.id
                          ? 'bg-[#FFFFFF] dark:bg-[#1E1A17] text-[#B55841] dark:text-[#D47A63] font-semibold'
                          : 'text-[#786962] dark:text-[#B5A89F] hover:text-[#322622] dark:hover:text-[#F4EDE6]'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {calcMethod === 'lmp' && (
                  <div className="p-4 bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] flex flex-col gap-2.5">
                    <label htmlFor={lmpInputId} className="text-[13px] font-semibold text-[#322622] dark:text-[#F4EDE6]">
                      Ngày đầu tiên của kỳ kinh cuối (LMP)
                    </label>
                    <input
                      id={lmpInputId}
                      type="date"
                      value={lmpDate}
                      max={toISODateString(new Date())}
                      onChange={(e) => setLmpDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDD1] dark:border-[#362E2A] bg-[#FAF6F0] dark:bg-[#231E1B] text-[#322622] dark:text-[#F4EDE6] text-[15px] font-medium"
                    />
                    <p className="text-[11.5px] text-[#786962] dark:text-[#B5A89F] leading-relaxed">
                      Áp dụng quy tắc Naegele (280 ngày) theo hướng dẫn của Bộ Y tế & ACOG.
                    </p>
                  </div>
                )}

                {calcMethod === 'edd' && (
                  <div className="p-4 bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] flex flex-col gap-2.5">
                    <label htmlFor={eddInputId} className="text-[13px] font-semibold text-[#322622] dark:text-[#F4EDE6]">
                      Ngày dự sinh do bác sĩ xác định
                    </label>
                    <input
                      id={eddInputId}
                      type="date"
                      value={eddDate}
                      onChange={(e) => setEddDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDD1] dark:border-[#362E2A] bg-[#FAF6F0] dark:bg-[#231E1B] text-[#322622] dark:text-[#F4EDE6] text-[15px] font-medium"
                    />
                    <p className="text-[11.5px] text-[#786962] dark:text-[#B5A89F] leading-relaxed">
                      Ưu tiên ngày dự sinh trên phiếu khám thai hoặc siêu âm 3 tháng đầu.
                    </p>
                  </div>
                )}

                {calcMethod === 'ultrasound' && (
                  <div className="p-4 bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] flex flex-col gap-2.5">
                    <div className="flex flex-col gap-1">
                      <label htmlFor={scanDateInputId} className="text-[12px] font-semibold text-[#322622] dark:text-[#F4EDE6]">
                        Ngày siêu âm gần nhất
                      </label>
                      <input
                        id={scanDateInputId}
                        type="date"
                        value={scanDate}
                        max={toISODateString(new Date())}
                        onChange={(e) => setScanDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E6DDD1] dark:border-[#362E2A] bg-[#FAF6F0] dark:bg-[#231E1B] text-[#322622] dark:text-[#F4EDE6] text-[14px] font-medium"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label htmlFor={scanWeeksInputId} className="text-[11.5px] font-semibold text-[#322622] dark:text-[#F4EDE6]">
                          Tuần thai lúc khám
                        </label>
                        <input
                          id={scanWeeksInputId}
                          type="number"
                          min={1}
                          max={42}
                          value={scanWeeks}
                          onChange={(e) => setScanWeeks(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-[#E6DDD1] dark:border-[#362E2A] bg-[#FAF6F0] dark:bg-[#231E1B] text-[#322622] dark:text-[#F4EDE6] text-[14px] font-medium mt-1"
                        />
                      </div>
                      <div>
                        <label htmlFor={scanDaysInputId} className="text-[11.5px] font-semibold text-[#322622] dark:text-[#F4EDE6]">
                          Số ngày lẻ (0–6)
                        </label>
                        <input
                          id={scanDaysInputId}
                          type="number"
                          min={0}
                          max={6}
                          value={scanDays}
                          onChange={(e) => setScanDays(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-[#E6DDD1] dark:border-[#362E2A] bg-[#FAF6F0] dark:bg-[#231E1B] text-[#322622] dark:text-[#F4EDE6] text-[14px] font-medium mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Calculation Preview Card */}
                <div className="p-4 rounded-2xl bg-[#F2ECE3] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A]">
                  <p className="text-[11px] font-semibold text-[#786962] dark:text-[#B5A89F] uppercase tracking-wider mb-2">
                    Ước tính hiện tại · Tam cá nguyệt {currentCalc.trimester}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-center text-2xl shrink-0">
                      {currentCalc.fruitComparison.fruitEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-editorial text-[20px] font-semibold text-[#322622] dark:text-[#F4EDE6] tabular-nums">
                        Tuần {currentCalc.weeks} ngày {currentCalc.days}
                      </h3>
                      <p className="text-[12px] text-[#786962] dark:text-[#B5A89F]">
                        Bé bằng{' '}
                        <span className="font-semibold text-[#B55841] dark:text-[#D47A63]">
                          {currentCalc.fruitComparison.fruitName}
                        </span>{' '}
                        · Dự sinh {formatDateVietnamese(currentCalc.dueDate)}
                      </p>
                    </div>
                  </div>

                  {currentCalc.warningMessage && (
                    <p className="mt-2.5 text-[11.5px] text-[#A2402E] dark:text-[#E08975] font-medium bg-[#FFFFFF] dark:bg-[#1E1A17] p-2.5 rounded-xl border border-[#E6DDD1] dark:border-[#362E2A]">
                      {currentCalc.warningMessage}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* BƯỚC 3: THÔNG TIN CÁ NHÂN */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="flex flex-col gap-3.5"
              >
                <div className="text-center">
                  <h2 className="font-editorial text-[23px] font-semibold text-[#322622] dark:text-[#F4EDE6] leading-tight">
                    Để Nova gọi tên thân thương
                  </h2>
                  <p className="text-[12.5px] text-[#786962] dark:text-[#B5A89F] mt-1">
                    Giúp lời chào mỗi sáng và các gợi ý thêm phần gần gũi.
                  </p>
                </div>

                <div className="flex flex-col gap-3 bg-[#FFFFFF] dark:bg-[#1E1A17] p-4 rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A]">
                  <div>
                    <label htmlFor={momNameInputId} className="block text-[12px] font-semibold text-[#322622] dark:text-[#F4EDE6] mb-1">
                      Tên gọi hoặc biệt danh của mẹ
                    </label>
                    <input
                      id={momNameInputId}
                      type="text"
                      value={momName}
                      onChange={(e) => setMomName(e.target.value)}
                      placeholder="Ví dụ: Khánh Băng, Mẹ Thảo..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDD1] dark:border-[#362E2A] bg-[#FAF6F0] dark:bg-[#231E1B] text-[#322622] dark:text-[#F4EDE6] text-[14px] font-medium"
                    />
                  </div>

                  {status === 'pregnant' && (
                    <div>
                      <label htmlFor={babyNicknameInputId} className="block text-[12px] font-semibold text-[#322622] dark:text-[#F4EDE6] mb-1">
                        Tên thân mật ở nhà của bé
                      </label>
                      <input
                        id={babyNicknameInputId}
                        type="text"
                        value={babyNickname}
                        onChange={(e) => setBabyNickname(e.target.value)}
                        placeholder="Ví dụ: Bé Bơ, Bé Gạo, Bé Dâu..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDD1] dark:border-[#362E2A] bg-[#FAF6F0] dark:bg-[#231E1B] text-[#322622] dark:text-[#F4EDE6] text-[14px] font-medium"
                      />
                    </div>
                  )}

                  {status === 'pregnant' && (
                    <div>
                      <span className="block text-[12px] font-semibold text-[#322622] dark:text-[#F4EDE6] mb-1.5">
                        Giới tính dự kiến của bé
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'boy' as const, label: 'Bé trai' },
                          { id: 'girl' as const, label: 'Bé gái' },
                          { id: 'surprise' as const, label: 'Giữ bất ngờ' },
                        ].map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => setBabyGender(g.id)}
                            className={`py-2.5 px-2 rounded-xl text-[12px] font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                              babyGender === g.id
                                ? 'bg-[#F7EAE5] dark:bg-[#35231E] border-[#B55841] dark:border-[#D47A63] text-[#B55841] dark:text-[#D47A63]'
                                : 'bg-[#FAF6F0] dark:bg-[#231E1B] border-[#E6DDD1] dark:border-[#362E2A] text-[#786962] dark:text-[#B5A89F]'
                            }`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor={reminderTimeInputId} className="block text-[12px] font-semibold text-[#322622] dark:text-[#F4EDE6] mb-1">
                      Giờ gợi ý ly nước ấm đầu ngày
                    </label>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#786962] dark:text-[#B5A89F]" />
                      <input
                        id={reminderTimeInputId}
                        type="time"
                        value={drinkReminderTime}
                        onChange={(e) => setDrinkReminderTime(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-[#E6DDD1] dark:border-[#362E2A] bg-[#FAF6F0] dark:bg-[#231E1B] text-[#322622] dark:text-[#F4EDE6] text-[13px] font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#EBF1EC] dark:bg-[#1E2922] border border-[#D4E2D7] dark:border-[#2E3F34] text-[#263E35] dark:text-[#A7C2AC] text-[11.5px] leading-relaxed">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span>
                    Thông tin của mẹ được lưu giữ an toàn trên thiết bị và chỉ phục vụ cá nhân hóa nội dung thai kỳ.
                  </span>
                </div>
              </motion.div>
            )}

            {/* BƯỚC 4: XÁC NHẬN HỒ SƠ */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="flex flex-col gap-3.5"
              >
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63] mx-auto flex items-center justify-center mb-2">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h2 className="font-editorial text-[24px] font-semibold text-[#322622] dark:text-[#F4EDE6] leading-tight">
                    Góc bình yên của mẹ đã sẵn sàng
                  </h2>
                  <p className="text-[12.5px] text-[#786962] dark:text-[#B5A89F] mt-1">
                    Xem nhanh thông tin trước khi vào trang chủ nhé.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] flex flex-col gap-3">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E6DDD1] dark:border-[#362E2A]">
                    <div>
                      <h4 className="font-editorial text-[17px] font-semibold text-[#322622] dark:text-[#F4EDE6]">
                        {momName || 'Mẹ bầu Nova'}
                      </h4>
                      <p className="text-[12px] text-[#786962] dark:text-[#B5A89F]">
                        {status === 'pregnant' ? `Đồng hành cùng ${babyNickname || 'Bé Yêu'}` : 'Hành trình chăm sóc sức khỏe'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(status === 'pregnant' ? 2 : 1)}
                      className="px-2.5 py-1.5 rounded-xl text-[#B55841] dark:text-[#D47A63] hover:bg-[#F7EAE5] dark:hover:bg-[#35231E] transition-colors cursor-pointer flex items-center gap-1 text-[12px] font-semibold"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Chỉnh lại</span>
                    </button>
                  </div>

                  {status === 'pregnant' ? (
                    <div className="grid grid-cols-2 gap-2.5 text-left">
                      <div className="p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A]">
                        <span className="text-[10.5px] text-[#786962] dark:text-[#B5A89F] block">Tuổi thai hôm nay</span>
                        <span className="text-[14px] font-semibold text-[#B55841] dark:text-[#D47A63] tabular-nums">
                          Tuần {currentCalc.weeks} ngày {currentCalc.days}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A]">
                        <span className="text-[10.5px] text-[#786962] dark:text-[#B5A89F] block">Ngày dự sinh</span>
                        <span className="text-[14px] font-semibold text-[#322622] dark:text-[#F4EDE6] tabular-nums">
                          {formatDateVietnamese(currentCalc.dueDate)}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A]">
                        <span className="text-[10.5px] text-[#786962] dark:text-[#B5A89F] block">Giai đoạn</span>
                        <span className="text-[13px] font-semibold text-[#322622] dark:text-[#F4EDE6]">
                          Tam cá nguyệt {currentCalc.trimester}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A]">
                        <span className="text-[10.5px] text-[#786962] dark:text-[#B5A89F] block">Kích thước bé</span>
                        <span className="text-[13px] font-semibold text-[#322622] dark:text-[#F4EDE6]">
                          {currentCalc.fruitComparison.fruitEmoji} {currentCalc.fruitComparison.fruitName}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-[13px] text-[#322622] dark:text-[#F4EDE6]">
                      Chế độ {status === 'planning' ? 'Chuẩn bị mang thai' : 'Tìm hiểu cẩm nang'} đã sẵn sàng.
                    </div>
                  )}
                </div>

                <p className="text-[12px] text-[#786962] dark:text-[#B5A89F] text-center leading-relaxed px-2">
                  Nhật ký chăm sóc, theo dõi nước ấm và cẩm nang 40 tuần đều miễn phí để mẹ an tâm sử dụng mỗi ngày.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Primary CTA */}
        <div className="w-full mt-5">
          {step < 4 ? (
            <motion.button
              whileTap={{ scale: 0.985 }}
              type="button"
              onClick={handleNextStep}
              disabled={step === 2 && !currentCalc.isValid}
              className={`w-full py-3.5 px-6 rounded-2xl font-semibold text-[15px] transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[48px] ${
                step === 2 && !currentCalc.isValid
                  ? 'bg-[#E6DDD1] dark:bg-[#362E2A] text-[#786962] cursor-not-allowed'
                  : 'bg-[#B55841] hover:bg-[#9E4A35] dark:bg-[#D47A63] dark:hover:bg-[#C36A53] text-white'
              }`}
            >
              <span>Tiếp tục</span>
              <ArrowRight className="w-4 h-4 stroke-[2.2]" />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.985 }}
              type="button"
              onClick={handleComplete}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#B55841] hover:bg-[#9E4A35] dark:bg-[#D47A63] dark:hover:bg-[#C36A53] text-white font-semibold text-[15px] transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
            >
              <span>Mở không gian của mẹ</span>
              <ArrowRight className="w-4 h-4 stroke-[2.2]" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};
