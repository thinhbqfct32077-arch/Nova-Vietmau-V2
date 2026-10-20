import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSETS } from '../../data/mockData';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
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

  // Mode: 'welcome' (slider + entry options) or 'wizard' (4-step onboarding)
  const [mode, setMode] = useState<'welcome' | 'wizard'>('welcome');
  const [activeSlide, setActiveSlide] = useState(1);
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
      title: 'Hành trình diệu kỳ',
      desc: 'Theo dõi sự phát triển từng ngày của thiên thần nhỏ trong bụng mẹ bằng khoa học sản khoa chuẩn mực.',
    },
    {
      title: 'Chào mừng tới Nova',
      desc: 'Người bạn đồng hành ân cần, giúp mẹ an tâm chăm sóc sức khỏe thai kỳ và đón bé yêu chào đời.',
    },
    {
      title: 'Kiến thức y khoa chuẩn',
      desc: 'Được cố vấn bởi các chuyên gia sản nhi hàng đầu với lời khuyên khoa học và hoàn toàn miễn phí.',
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
        // Skip pregnancy calculation for planning or learning
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
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#C84B4B', '#F3A4B5', '#8C7B75', '#FADBD8'],
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
  // RENDER: WELCOME SLIDES
  // -------------------------------------------------------------
  if (mode === 'welcome') {
    return (
      <div className="flex-1 flex flex-col justify-between px-6 pt-3 pb-6 bg-[#FFFBF7] select-none overflow-y-auto no-scrollbar">
        {/* Top Floating Art Card */}
        <motion.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
          className="relative w-full rounded-[28px] overflow-hidden bg-[#E2E8E6] border border-[#D5DDD9]/60 flex flex-col items-center pt-5 pb-4 px-4 shadow-sm"
        >
          <div className="absolute top-0 right-0 w-44 h-44 bg-white/40 rounded-full blur-2xl pointer-events-none" />

          {/* Hand & Baby Foot Illustration */}
          <div className="relative w-full aspect-[4/3] rounded-[22px] overflow-hidden mb-3 bg-[#D9E3DF] flex items-center justify-center shadow-inner">
            <img
              src={ASSETS.onboardingArt}
              alt="Mẹ và bé Nova"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>

          <div className="text-center z-10">
            <h1 className="font-handwriting text-[36px] leading-tight text-[#3A2E2B] font-bold tracking-wide">
              Nova Việt Mẫu
            </h1>
            <p className="text-[12px] font-medium text-[#6B7280] tracking-tight mt-0.5">
              Mãi mãi bên nhau, bạn nhé!
            </p>
          </div>
        </motion.div>

        {/* Middle Text & Slide Indicators */}
        <div className="flex flex-col items-center text-center mt-5 mb-4 px-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center"
            >
              <h2 className="text-[23px] font-bold text-[#3A2E2B] tracking-tight leading-snug">
                {slides[activeSlide].title}
              </h2>
              <p className="text-[13px] text-[#8C7B75] mt-2 leading-relaxed max-w-[320px]">
                {slides[activeSlide].desc}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-2 mt-4">
            {slides.map((_, idx) => {
              const isActive = activeSlide === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    isActive ? 'w-6 h-2 bg-[#C84B4B]' : 'w-2 h-2 bg-[#D1C7C2] hover:bg-[#B5A8A2]'
                  }`}
                  aria-label={`Trang ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* 3 Explicit Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          {/* 1. Bắt đầu hành trình thai kỳ */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setMode('wizard');
              setStep(1);
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#C84B4B] hover:bg-[#B84040] text-white font-semibold text-[15px] shadow-md shadow-[#C84B4B]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Bắt đầu hành trình thai kỳ</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </motion.button>

          {/* 2. Tôi đã có tài khoản */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onOpenLogin}
            className="w-full py-3 px-6 rounded-2xl bg-white hover:bg-[#FAF6F3] text-[#3A2E2B] font-semibold text-[14px] border border-[#E5DFDB] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Tôi đã có tài khoản</span>
          </motion.button>

          {/* 3. Khám phá ứng dụng trước */}
          <button
            onClick={onExploreGuest}
            className="w-full py-2 text-center text-[13px] font-medium text-[#8C7B75] hover:text-[#C84B4B] transition-colors cursor-pointer"
          >
            Khám phá ứng dụng trước (Dùng thử ngay)
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: 4-STEP ONBOARDING WIZARD
  // -------------------------------------------------------------
  return (
    <div className="flex-1 flex flex-col justify-between px-5 pt-3 pb-6 bg-[#FFFBF7] select-none overflow-y-auto no-scrollbar">
      {/* Top Header with Progress */}
      <div className="w-full mb-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handleBackStep}
            className="w-9 h-9 rounded-full bg-white border border-[#EBE4DF] flex items-center justify-center text-[#5C4A42] hover:bg-[#F7F2EE] active:scale-95 transition-all cursor-pointer shadow-xs"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <span className="text-[11px] font-semibold tracking-wider text-[#C84B4B] uppercase">
              Hành Trình Mẹ Bầu
            </span>
            <h3 className="text-[14px] font-bold text-[#3A2E2B]">Bước {step} / 4</h3>
          </div>
          <button
            onClick={onExploreGuest}
            className="text-[12px] text-[#8C7B75] hover:text-[#C84B4B] font-medium cursor-pointer"
          >
            Bỏ qua
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#EFE8E2] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#C84B4B] rounded-full"
            initial={{ width: '25%' }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Step Content */}
      <div className="flex-1 flex flex-col justify-center my-auto">
        <AnimatePresence mode="wait">
          {/* ========================================================= */}
          {/* BƯỚC 1: XÁC ĐỊNH TÌNH TRẠNG */}
          {/* ========================================================= */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4"
            >
              <div className="text-center mb-1">
                <h2 className="text-[22px] font-bold text-[#3A2E2B] leading-tight">
                  Tình trạng hiện tại của bạn
                </h2>
                <p className="text-[13px] text-[#8C7B75] mt-1.5 leading-relaxed">
                  Nova sẽ điều chỉnh cẩm nang, chế độ dinh dưỡng và bài tập phù hợp nhất.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {/* Option 1: Đang mang thai */}
                <button
                  onClick={() => setStatus('pregnant')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                    status === 'pregnant'
                      ? 'bg-white border-[#C84B4B] shadow-sm ring-1 ring-[#C84B4B]'
                      : 'bg-white/80 border-[#E8E1DC] hover:border-[#D1C7C2]'
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-[#FCEEEB] text-[#C84B4B] flex items-center justify-center shrink-0">
                    <Baby className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[15px] font-bold text-[#3A2E2B]">Tôi đang mang thai</h4>
                      {status === 'pregnant' && (
                        <CheckCircle2 className="w-5 h-5 text-[#C84B4B]" />
                      )}
                    </div>
                    <p className="text-[12px] text-[#8C7B75] mt-0.5 leading-snug">
                      Tính tuổi thai tự động, theo dõi từng tuần và nhắc lịch khám chuẩn sản khoa.
                    </p>
                  </div>
                </button>

                {/* Option 2: Chuẩn bị mang thai */}
                <button
                  onClick={() => setStatus('planning')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                    status === 'planning'
                      ? 'bg-white border-[#C84B4B] shadow-sm ring-1 ring-[#C84B4B]'
                      : 'bg-white/80 border-[#E8E1DC] hover:border-[#D1C7C2]'
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-[#FEF5E7] text-[#D35400] flex items-center justify-center shrink-0">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[15px] font-bold text-[#3A2E2B]">
                        Tôi đang chuẩn bị mang thai
                      </h4>
                      {status === 'planning' && (
                        <CheckCircle2 className="w-5 h-5 text-[#C84B4B]" />
                      )}
                    </div>
                    <p className="text-[12px] text-[#8C7B75] mt-0.5 leading-snug">
                      Dinh dưỡng tiền sản, bổ sung axit folic và canh ngày rụng trứng chuẩn y khoa.
                    </p>
                  </div>
                </button>

                {/* Option 3: Tìm hiểu kiến thức */}
                <button
                  onClick={() => setStatus('learning')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                    status === 'learning'
                      ? 'bg-white border-[#C84B4B] shadow-sm ring-1 ring-[#C84B4B]'
                      : 'bg-white/80 border-[#E8E1DC] hover:border-[#D1C7C2]'
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-[#EBF5FB] text-[#2980B9] flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[15px] font-bold text-[#3A2E2B]">
                        Tôi muốn tìm hiểu kiến thức
                      </h4>
                      {status === 'learning' && (
                        <CheckCircle2 className="w-5 h-5 text-[#C84B4B]" />
                      )}
                    </div>
                    <p className="text-[12px] text-[#8C7B75] mt-0.5 leading-snug">
                      Tra cứu cẩm nang 40 tuần phát triển và kinh nghiệm chăm sóc mẹ & bé.
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* BƯỚC 2: NHẬP THÔNG TIN THAI KỲ (CHỈ KHI ĐANG MANG THAI) */}
          {/* ========================================================= */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-3.5"
            >
              <div className="text-center">
                <h2 className="text-[21px] font-bold text-[#3A2E2B] leading-tight">
                  Thông tin thai kỳ của mẹ
                </h2>
                <p className="text-[12px] text-[#8C7B75] mt-1">
                  Chọn phương pháp tính tuổi thai phù hợp và thuận tiện nhất với mẹ.
                </p>
              </div>

              {/* 3 Calculation Method Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#EFE9E4] rounded-xl text-[12px] font-medium">
                <button
                  onClick={() => setCalcMethod('lmp')}
                  className={`py-2 px-1 rounded-lg transition-all text-center cursor-pointer ${
                    calcMethod === 'lmp'
                      ? 'bg-white text-[#C84B4B] font-bold shadow-xs'
                      : 'text-[#6B7280] hover:text-[#3A2E2B]'
                  }`}
                >
                  Kỳ kinh cuối
                </button>
                <button
                  onClick={() => setCalcMethod('edd')}
                  className={`py-2 px-1 rounded-lg transition-all text-center cursor-pointer ${
                    calcMethod === 'edd'
                      ? 'bg-white text-[#C84B4B] font-bold shadow-xs'
                      : 'text-[#6B7280] hover:text-[#3A2E2B]'
                  }`}
                >
                  Ngày dự sinh
                </button>
                <button
                  onClick={() => setCalcMethod('ultrasound')}
                  className={`py-2 px-1 rounded-lg transition-all text-center cursor-pointer ${
                    calcMethod === 'ultrasound'
                      ? 'bg-white text-[#C84B4B] font-bold shadow-xs'
                      : 'text-[#6B7280] hover:text-[#3A2E2B]'
                  }`}
                >
                  Siêu âm
                </button>
              </div>

              {/* Method 1: LMP (Kỳ kinh cuối) */}
              {calcMethod === 'lmp' && (
                <div className="p-3.5 bg-white rounded-2xl border border-[#E8E1DC] shadow-xs flex flex-col gap-2.5">
                  <label htmlFor={lmpInputId} className="text-[13px] font-semibold text-[#3A2E2B]">
                    Ngày đầu tiên của kỳ kinh cuối (LMP):
                  </label>
                  <div className="relative">
                    <input
                      id={lmpInputId}
                      type="date"
                      value={lmpDate}
                      max={toISODateString(new Date())}
                      onChange={(e) => setLmpDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDC7] bg-[#FFFBF7] text-[#3A2E2B] text-[14px] font-medium focus:outline-hidden focus:ring-2 focus:ring-[#C84B4B]/30"
                    />
                  </div>
                  <p className="text-[11px] text-[#8C7B75] leading-relaxed">
                    💡 Quy tắc Naegele (280 ngày): Chu kỳ 28 ngày chuẩn y khoa theo khuyến cáo của Bộ
                    Y tế & ACOG.
                  </p>
                </div>
              )}

              {/* Method 2: EDD (Ngày dự sinh do bác sĩ xác định) */}
              {calcMethod === 'edd' && (
                <div className="p-3.5 bg-white rounded-2xl border border-[#E8E1DC] shadow-xs flex flex-col gap-2.5">
                  <label htmlFor={eddInputId} className="text-[13px] font-semibold text-[#3A2E2B]">
                    Ngày dự sinh do bác sĩ xác định:
                  </label>
                  <div className="relative">
                    <input
                      id={eddInputId}
                      type="date"
                      value={eddDate}
                      onChange={(e) => setEddDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDC7] bg-[#FFFBF7] text-[#3A2E2B] text-[14px] font-medium focus:outline-hidden focus:ring-2 focus:ring-[#C84B4B]/30"
                    />
                  </div>
                  <p className="text-[11px] text-[#8C7B75] leading-relaxed">
                    💡 Ưu tiên ngày dự sinh lâm sàng trên phiếu khám thai hoặc kết quả siêu âm 3 tháng
                    đầu.
                  </p>
                </div>
              )}

              {/* Method 3: Siêu âm */}
              {calcMethod === 'ultrasound' && (
                <div className="p-3.5 bg-white rounded-2xl border border-[#E8E1DC] shadow-xs flex flex-col gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label htmlFor={scanDateInputId} className="text-[12px] font-semibold text-[#3A2E2B]">
                      Ngày siêu âm gần nhất:
                    </label>
                    <input
                      id={scanDateInputId}
                      type="date"
                      value={scanDate}
                      max={toISODateString(new Date())}
                      onChange={(e) => setScanDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5CDC7] bg-[#FFFBF7] text-[#3A2E2B] text-[13px] font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor={scanWeeksInputId} className="text-[11px] font-semibold text-[#3A2E2B]">
                        Tuần thai lúc khám:
                      </label>
                      <input
                        id={scanWeeksInputId}
                        type="number"
                        min={1}
                        max={42}
                        value={scanWeeks}
                        onChange={(e) => setScanWeeks(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-[#D5CDC7] bg-[#FFFBF7] text-[#3A2E2B] text-[13px] font-medium"
                      />
                    </div>
                    <div>
                      <label htmlFor={scanDaysInputId} className="text-[11px] font-semibold text-[#3A2E2B]">
                        Số ngày lẻ (0-6):
                      </label>
                      <input
                        id={scanDaysInputId}
                        type="number"
                        min={0}
                        max={6}
                        value={scanDays}
                        onChange={(e) => setScanDays(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-[#D5CDC7] bg-[#FFFBF7] text-[#3A2E2B] text-[13px] font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Live Calculation Preview Card */}
              <div className="p-3.5 rounded-2xl bg-linear-to-br from-[#FFF5F5] to-[#FFF0F2] border border-[#FADBD8] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[#C84B4B] uppercase tracking-wider">
                    Kết quả tính toán lâm sàng
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#C84B4B] border border-[#FADBD8]">
                    Tam cá nguyệt {currentCalc.trimester}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-[32px] leading-none">
                    {currentCalc.fruitComparison.fruitEmoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[18px] font-bold text-[#3A2E2B]">
                      Tuần {currentCalc.weeks} ngày {currentCalc.days}
                    </h3>
                    <p className="text-[12px] text-[#8C7B75]">
                      Bé to bằng{' '}
                      <span className="font-semibold text-[#C84B4B]">
                        {currentCalc.fruitComparison.fruitName}
                      </span>{' '}
                      · Dự sinh: {formatDateVietnamese(currentCalc.dueDate)}
                    </p>
                  </div>
                </div>

                {currentCalc.warningMessage && (
                  <p className="mt-2 text-[11px] text-[#C0392B] font-medium bg-white/80 p-2 rounded-lg border border-[#FADBD8]">
                    ⚠️ {currentCalc.warningMessage}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* BƯỚC 3: THÔNG TIN CÁ NHÂN TÙY CHỌN */}
          {/* ========================================================= */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-3.5"
            >
              <div className="text-center">
                <h2 className="text-[21px] font-bold text-[#3A2E2B] leading-tight">
                  Để Nova đồng hành cùng mẹ
                </h2>
                <p className="text-[12px] text-[#8C7B75] mt-1">
                  Thông tin thân thương giúp bác sĩ Nova xưng hô và chăm sóc chu đáo hơn.
                </p>
              </div>

              <div className="flex flex-col gap-3 bg-white p-4 rounded-2xl border border-[#E8E1DC] shadow-xs">
                {/* Tên mẹ */}
                <div>
                  <label htmlFor={momNameInputId} className="block text-[12px] font-semibold text-[#3A2E2B] mb-1">
                    Tên gọi hoặc biệt danh của mẹ:
                  </label>
                  <input
                    id={momNameInputId}
                    type="text"
                    value={momName}
                    onChange={(e) => setMomName(e.target.value)}
                    placeholder="Ví dụ: Khánh Băng, Mẹ Thảo..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDC7] bg-[#FFFBF7] text-[#3A2E2B] text-[14px] font-medium focus:ring-2 focus:ring-[#C84B4B]/30"
                  />
                </div>

                {/* Tên bé */}
                {status === 'pregnant' && (
                  <div>
                    <label htmlFor={babyNicknameInputId} className="block text-[12px] font-semibold text-[#3A2E2B] mb-1">
                      Biệt danh con yêu:
                    </label>
                    <input
                      id={babyNicknameInputId}
                      type="text"
                      value={babyNickname}
                      onChange={(e) => setBabyNickname(e.target.value)}
                      placeholder="Ví dụ: Bé Bơ, Bé Dâu, Cún Yêu..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDC7] bg-[#FFFBF7] text-[#3A2E2B] text-[14px] font-medium focus:ring-2 focus:ring-[#C84B4B]/30"
                    />
                  </div>
                )}

                {/* Giới tính bé */}
                {status === 'pregnant' && (
                  <div>
                    <span className="block text-[12px] font-semibold text-[#3A2E2B] mb-1.5">
                      Giới tính dự kiến của con:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setBabyGender('boy')}
                        className={`py-2 rounded-xl text-[12px] font-semibold border transition-all cursor-pointer ${
                          babyGender === 'boy'
                            ? 'bg-[#EBF5FB] border-[#2980B9] text-[#2980B9]'
                            : 'bg-white border-[#E8E1DC] text-[#6B7280]'
                        }`}
                      >
                        👦 Bé trai
                      </button>
                      <button
                        type="button"
                        onClick={() => setBabyGender('girl')}
                        className={`py-2 rounded-xl text-[12px] font-semibold border transition-all cursor-pointer ${
                          babyGender === 'girl'
                            ? 'bg-[#FCEEEB] border-[#C84B4B] text-[#C84B4B]'
                            : 'bg-white border-[#E8E1DC] text-[#6B7280]'
                        }`}
                      >
                        👧 Bé gái
                      </button>
                      <button
                        type="button"
                        onClick={() => setBabyGender('surprise')}
                        className={`py-2 rounded-xl text-[12px] font-semibold border transition-all cursor-pointer ${
                          babyGender === 'surprise'
                            ? 'bg-[#FEF5E7] border-[#D35400] text-[#D35400]'
                            : 'bg-white border-[#E8E1DC] text-[#6B7280]'
                        }`}
                      >
                        🎁 Giữ bí mật
                      </button>
                    </div>
                  </div>
                )}

                {/* Giờ nhắc uống nước đầu ngày */}
                <div>
                  <label htmlFor={reminderTimeInputId} className="block text-[12px] font-semibold text-[#3A2E2B] mb-1">
                    Giờ nhắc cốc nước ấm đầu ngày:
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#8C7B75]" />
                    <input
                      id={reminderTimeInputId}
                      type="time"
                      value={drinkReminderTime}
                      onChange={(e) => setDrinkReminderTime(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-[#D5CDC7] bg-[#FFFBF7] text-[#3A2E2B] text-[13px] font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Shield Note */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F0F7F4] border border-[#D0E7DC] text-[#2D6A4F] text-[11px] leading-relaxed">
                <ShieldCheck className="w-5 h-5 shrink-0 text-[#2D6A4F]" />
                <span>
                  Nova không thu thập số CCCD hay định vị nhạy cảm. Dữ liệu của mẹ được lưu trữ an
                  toàn trực tiếp trên thiết bị.
                </span>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* BƯỚC 4: XÁC NHẬN HỒ SƠ */}
          {/* ========================================================= */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-3.5"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#FCEEEB] text-[#C84B4B] mx-auto flex items-center justify-center mb-2 shadow-xs">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-[22px] font-bold text-[#3A2E2B] leading-tight">
                  Hồ sơ thai kỳ đã sẵn sàng!
                </h2>
                <p className="text-[12px] text-[#8C7B75] mt-1">
                  Mẹ kiểm tra lại thông tin trước khi bắt đầu nhé.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-white border border-[#E8E1DC] shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE5]">
                  <div>
                    <h4 className="text-[16px] font-bold text-[#3A2E2B]">{momName}</h4>
                    <p className="text-[12px] text-[#8C7B75]">
                      {status === 'pregnant' ? `Bé ${babyNickname}` : 'Hành trình tiền thai kỳ'}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(status === 'pregnant' ? 2 : 1)}
                    className="p-1.5 rounded-lg text-[#C84B4B] hover:bg-[#FCEEEB] transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sửa</span>
                  </button>
                </div>

                {status === 'pregnant' ? (
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="p-2.5 rounded-xl bg-[#FFFBF7] border border-[#F0EAE5]">
                      <span className="text-[10px] text-[#8C7B75] uppercase tracking-wider block font-semibold">
                        Tuổi thai hôm nay
                      </span>
                      <span className="text-[15px] font-bold text-[#C84B4B]">
                        Tuần {currentCalc.weeks} ngày {currentCalc.days}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FFFBF7] border border-[#F0EAE5]">
                      <span className="text-[10px] text-[#8C7B75] uppercase tracking-wider block font-semibold">
                        Ngày dự sinh (EDD)
                      </span>
                      <span className="text-[15px] font-bold text-[#3A2E2B]">
                        {formatDateVietnamese(currentCalc.dueDate)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FFFBF7] border border-[#F0EAE5]">
                      <span className="text-[10px] text-[#8C7B75] uppercase tracking-wider block font-semibold">
                        Giai đoạn thai kỳ
                      </span>
                      <span className="text-[13px] font-semibold text-[#3A2E2B]">
                        Tam cá nguyệt {currentCalc.trimester}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FFFBF7] border border-[#F0EAE5]">
                      <span className="text-[10px] text-[#8C7B75] uppercase tracking-wider block font-semibold">
                        Kích thước bé
                      </span>
                      <span className="text-[13px] font-semibold text-[#3A2E2B]">
                        {currentCalc.fruitComparison.fruitEmoji} {currentCalc.fruitComparison.fruitName}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#FFFBF7] border border-[#F0EAE5] text-[13px] text-[#5C4A42]">
                    Chế độ {status === 'planning' ? 'Tiền thai kỳ' : 'Tra cứu cẩm nang'} sẵn sàng.
                  </div>
                )}
              </div>

              {/* Free Forever Banner */}
              <div className="p-3 rounded-xl bg-[#FEF9E7] border border-[#F7DC6F] text-[#7D6608] text-[11px] leading-relaxed text-center">
                ✨ Toàn bộ theo dõi nước uống, hoạt động chăm sóc và cẩm nang 40 tuần đều hoàn toàn
                miễn phí trọn đời!
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action Button */}
      <div className="w-full mt-4">
        {step < 4 ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleNextStep}
            disabled={step === 2 && !currentCalc.isValid}
            className={`w-full py-3.5 px-6 rounded-2xl font-semibold text-[15px] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              step === 2 && !currentCalc.isValid
                ? 'bg-[#E0D7D1] text-[#9E9089] cursor-not-allowed shadow-none'
                : 'bg-[#C84B4B] hover:bg-[#B84040] text-white shadow-[#C84B4B]/20'
            }`}
          >
            <span>Tiếp tục</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleComplete}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#C84B4B] hover:bg-[#B84040] text-white font-bold text-[15px] shadow-md shadow-[#C84B4B]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Hoàn tất và vào ứng dụng</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </motion.button>
        )}
      </div>
    </div>
  );
};
