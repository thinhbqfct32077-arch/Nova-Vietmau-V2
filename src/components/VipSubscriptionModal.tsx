import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Crown,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  HeartHandshake,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VipSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isVip: boolean;
  onSubscribe: () => void;
}

export const VipSubscriptionModal: React.FC<VipSubscriptionModalProps> = ({
  isOpen,
  onClose,
  isVip,
  onSubscribe,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubscribeClick = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#C84B4B', '#FCEEEB', '#FFD700'],
        });
      } catch {
        // ignore
      }
      onSubscribe();
      onClose();
    }, 900);
  };

  const perks = [
    {
      title: 'Trợ lý AI hỏi đáp y khoa không giới hạn 24/7',
      desc: 'Giải đáp tức thì mọi băn khoăn về triệu chứng thai kỳ và chăm sóc bé.',
    },
    {
      title: 'Kế hoạch dinh dưỡng & Yoga cá nhân hóa theo tuần',
      desc: 'Thực đơn từng ngày và bài tập an toàn tương thích với thể trạng mẹ.',
    },
    {
      title: 'Giảm thêm 10% tất cả sản phẩm tại Cửa hàng Nova',
      desc: 'Áp dụng tự động cho sổ tay, gối bầu, tinh dầu và đồ sơ sinh.',
    },
    {
      title: 'Tắt toàn bộ quảng cáo & Độc quyền kết nối Bác sĩ y tế',
      desc: 'Ưu tiên kết nối phòng khám và nhận tư vấn chuyên môn khi cần.',
    },
  ];

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-end justify-center select-none overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Slide-Up Sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-h-[92%] bg-[#FFFBF7] rounded-t-[36px] p-6 shadow-2xl flex flex-col z-10 border-t border-[#F0ECE9] overflow-y-auto no-scrollbar"
        >
          {/* Drag Handle */}
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-5 w-8 h-8 rounded-full bg-white/80 border border-gray-200 text-[#8C7B75] flex items-center justify-center hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Top VIP Banner Header */}
          <div className="text-center pt-2 pb-4">
            {/* Gold Crown Badge with Shimmer & Rotating Halo */}
            <div className="relative inline-flex items-center justify-center mb-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full blur-xl pointer-events-none"
                style={{
                  background:
                    'conic-gradient(from 0deg, rgba(212,175,55,0.4), rgba(245,215,127,0.8), rgba(212,175,55,0.4))',
                }}
              />
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#B38728] via-[#FBF5B7] to-[#DAA520] p-0.5 shadow-lg relative"
              >
                <div className="w-full h-full rounded-[14px] bg-[#2A2321] flex items-center justify-center text-[#F5D77F]">
                  <Crown className="w-8 h-8 stroke-[2.2] drop-shadow-md" />
                </div>
              </motion.div>
            </div>

            <div className="inline-block bg-[#FCEEEB] text-[#C84B4B] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-1.5 shadow-2xs">
              ĐẶC QUYỀN CAO CẤP
            </div>

            <h2 className="text-[22px] font-extrabold text-[#3A2E2B] tracking-tight leading-snug">
              Nâng cấp Nova VIP
            </h2>
            <p className="text-[13px] text-[#8C7B75] mt-1">
              Đồng hành không giới hạn cùng Trợ lý AI và Chuyên gia
            </p>
          </div>

          {/* Plan Switcher (Monthly vs Yearly) */}
          <div className="bg-[#EFEAE5] p-1 rounded-2xl flex items-center mb-5">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white text-[#3A2E2B] shadow-sm'
                  : 'text-[#8C7B75] hover:text-[#3A2E2B]'
              }`}
            >
              Gói tháng: 99.000đ
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                billingCycle === 'yearly'
                  ? 'bg-[#C84B4B] text-white shadow-sm'
                  : 'text-[#8C7B75] hover:text-[#3A2E2B]'
              }`}
            >
              <span>Gói năm: 890.000đ</span>
              <span className="absolute -top-2 -right-1 bg-[#D4AF37] text-[#2C2416] text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                Tiết kiệm 25%
              </span>
            </button>
          </div>

          {/* VIP Perks List */}
          <div className="bg-white rounded-3xl p-4 ios-card-shadow border border-[#F2ECE7] mb-5 space-y-3.5">
            {perks.map((perk, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#FCEEEB] text-[#C84B4B] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-[#3A2E2B] leading-tight">
                    {perk.title}
                  </h4>
                  <p className="text-[11px] text-[#8C7B75] leading-normal mt-0.5">
                    {perk.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col gap-2.5">
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              onClick={handleSubscribeClick}
              disabled={isProcessing || isVip}
              className={`w-full py-4 rounded-2xl font-bold text-[15px] shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all animate-shimmer-sweep ${
                isVip
                  ? 'bg-[#2ECC71] text-white shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-[#C84B4B] via-[#D15545] to-[#B38728] text-white shadow-[#C84B4B]/35'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang kích hoạt gói VIP...</span>
                </div>
              ) : isVip ? (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Mẹ đang là Hội viên VIP Nova!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FDF5E6]" />
                  <span>
                    {billingCycle === 'monthly'
                      ? 'Đăng ký ngay - 99k/tháng'
                      : 'Đăng ký ngay - 890k/năm'}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}
            </motion.button>

            {/* Apple Guarantee Footnote */}
            <p className="text-[11px] text-[#8C7B75] text-center leading-relaxed">
              Dùng thử miễn phí 7 ngày. Hủy bất kỳ lúc nào trong Cài đặt App Store.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
