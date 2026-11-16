import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Crown,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VipSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isVip: boolean;
  onSubscribe: () => void;
  onNavigateToPayment?: () => void;
}

export const VipSubscriptionModal: React.FC<VipSubscriptionModalProps> = ({
  isOpen,
  onClose,
  isVip,
  onSubscribe,
  onNavigateToPayment,
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
          colors: ['#C4A46B', '#B55841', '#6D8572', '#F2ECE3'],
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
      title: 'Trải nghiệm tinh gọn & Kết nối chuyên gia ưu tiên',
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
          className="absolute inset-0 bg-[#161311]/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Slide-Up Sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-h-[92%] bg-[#FAF6F0] dark:bg-[#1E1A17] rounded-t-[36px] p-6 shadow-2xl flex flex-col z-10 border-t border-[#E6DDD1] dark:border-[#362E2A] overflow-y-auto no-scrollbar"
        >
          {/* Drag Handle */}
          <div className="w-10 h-1 bg-[#D6CCC0] dark:bg-[#4A403B] rounded-full mx-auto mb-3" />

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="absolute top-4 right-5 w-9 h-9 rounded-full bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-[#786962] dark:text-[#B5A89F] flex items-center justify-center hover:bg-[#F2ECE3] dark:hover:bg-[#2F2824] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Top VIP Banner Header */}
          <div className="text-center pt-2 pb-4">
            {/* Warm Champagne Crown Badge */}
            <div className="relative inline-flex items-center justify-center mb-3">
              <div className="w-16 h-16 rounded-2xl bg-[#F6EFE2] dark:bg-[#2F281C] border border-[#E5D4B3] dark:border-[#4A3F2B] p-1 shadow-sm flex items-center justify-center">
                <div className="w-full h-full rounded-[12px] bg-[#322622] dark:bg-[#161311] flex items-center justify-center text-[#D7BA86]">
                  <Crown className="w-7 h-7 stroke-[2]" />
                </div>
              </div>
            </div>

            <div className="inline-block bg-[#F6EFE2] dark:bg-[#2F281C] border border-[#E5D4B3] dark:border-[#4A3F2B] text-[#9E5B3B] dark:text-[#D7BA86] text-[10.5px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              Đặc quyền đồng hành
            </div>

            <h2 className="font-editorial text-[24px] font-bold text-[#322622] dark:text-[#F4EDE6] tracking-tight leading-snug">
              Nâng cấp Nova VIP
            </h2>
            <p className="text-[13px] text-[#6B5D56] dark:text-[#C5B9B0] mt-1">
              Đồng hành không giới hạn cùng Trợ lý AI và Chuyên gia
            </p>
          </div>

          {/* Plan Switcher (Monthly vs Yearly) */}
          <div className="bg-[#F2ECE3] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] p-1 rounded-2xl flex items-center mb-5">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 min-h-[40px] py-2 rounded-xl text-xs font-bold transition-all cursor-pointer tabular-nums whitespace-nowrap ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-[#1E1A17] text-[#322622] dark:text-[#F4EDE6] shadow-xs'
                  : 'text-[#786962] dark:text-[#B5A89F] hover:text-[#322622] dark:hover:text-[#F4EDE6]'
              }`}
            >
              Gói tháng · 99.000đ
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`flex-1 min-h-[40px] py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative tabular-nums whitespace-nowrap ${
                billingCycle === 'yearly'
                  ? 'bg-[#B55841] text-white shadow-xs'
                  : 'text-[#786962] dark:text-[#B5A89F] hover:text-[#322622] dark:hover:text-[#F4EDE6]'
              }`}
            >
              <span>Gói năm · 890.000đ</span>
              <span className="absolute -top-2 -right-1 bg-[#C4A46B] text-[#261D19] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                -25%
              </span>
            </button>
          </div>

          {/* VIP Perks List */}
          <div className="bg-white dark:bg-[#231E1B] rounded-3xl p-4 border border-[#E6DDD1] dark:border-[#362E2A] mb-5 space-y-3.5">
            {perks.map((perk, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-[#322622] dark:text-[#F4EDE6] leading-snug">
                    {perk.title}
                  </h4>
                  <p className="text-[11.5px] text-[#6B5D56] dark:text-[#C5B9B0] leading-normal mt-0.5">
                    {perk.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col gap-2.5">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 450, damping: 22 }}
              onClick={handleSubscribeClick}
              disabled={isProcessing || isVip}
              className={`w-full min-h-[48px] py-3.5 rounded-2xl font-bold text-[15px] shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap tabular-nums ${
                isVip
                  ? 'bg-[#4F6B56] text-white'
                  : 'bg-[#B55841] hover:bg-[#9E4A35] text-white'
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
                  <span>Mẹ đang là Hội viên VIP Nova</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#F6EFE2]" />
                  <span>
                    {billingCycle === 'monthly'
                      ? 'Đăng ký ngay · 99k/tháng'
                      : 'Đăng ký ngay · 890k/năm'}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                </div>
              )}
            </motion.button>

            {onNavigateToPayment && !isVip && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToPayment();
                }}
                className="w-full min-h-[44px] py-2.5 text-[12.5px] font-bold text-[#322622] dark:text-[#F4EDE6] bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] hover:bg-[#F2ECE3] dark:hover:bg-[#2F2824] rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Thanh toán qua VietQR, MoMo, Thẻ ngân hàng</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B55841] dark:text-[#D47A63]" />
              </button>
            )}

            {/* Free Forever Transparency */}
            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[40px] py-2 text-[13px] font-semibold text-[#786962] dark:text-[#B5A89F] hover:text-[#322622] dark:hover:text-[#F4EDE6] transition-colors cursor-pointer text-center"
            >
              Tiếp tục sử dụng bản Miễn phí
            </button>

            <div className="p-3 rounded-xl bg-[#F2ECE3] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-center text-[11px] text-[#6B5D56] dark:text-[#C5B9B0] leading-relaxed">
              Tính tuổi thai, theo dõi nước uống, nhắc nhở và cẩm nang 40 tuần luôn miễn phí 100% trọn đời. Gói VIP là tiện ích mở rộng tùy chọn.
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

