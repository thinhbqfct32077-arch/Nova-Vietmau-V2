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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
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
          colors: ['#51483F', '#A3A795', '#B8AA98', '#EDE7DE'],
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
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#1C1B18]/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Slide-Up Sheet / Dialog */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-lg max-h-[92vh] bg-nova-bg rounded-t-[36px] sm:rounded-[32px] p-6 shadow-2xl flex flex-col z-10 border border-nova-border overflow-y-auto no-scrollbar"
        >
          {/* Drag Handle */}
          <div className="w-10 h-1 bg-nova-taupe/40 rounded-full mx-auto mb-3 sm:hidden" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute top-4 right-5 w-9 h-9 rounded-full bg-nova-surface border border-nova-border text-nova-text-muted flex items-center justify-center hover:bg-nova-bg-subtle transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Top VIP Banner Header */}
          <div className="text-center pt-2 pb-4">
            <div className="relative inline-flex items-center justify-center mb-3">
              <div className="w-16 h-16 rounded-2xl bg-nova-accent-soft border border-nova-border p-1 shadow-sm flex items-center justify-center">
                <div className="w-full h-full rounded-[12px] bg-nova-accent flex items-center justify-center text-nova-accent-contrast">
                  <Crown className="w-7 h-7 stroke-[2]" />
                </div>
              </div>
            </div>

            <div className="inline-block bg-nova-accent-soft border border-nova-border text-nova-accent text-[10.5px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              Đặc quyền đồng hành
            </div>

            <h2 className="font-editorial text-[24px] font-bold text-nova-text tracking-tight leading-snug">
              Nâng cấp Nova VIP
            </h2>
            <p className="text-[13px] text-nova-text-muted mt-1">
              Đồng hành không giới hạn cùng Trợ lý AI và Chuyên gia
            </p>
          </div>

          {/* Plan Switcher (Monthly vs Yearly) - Unified 699.000đ/năm (-40%) matching PaymentScreen */}
          <div className="bg-nova-bg-subtle border border-nova-border p-1 rounded-2xl flex items-center mb-5">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 min-h-[40px] py-2 rounded-xl text-xs font-bold transition-all cursor-pointer tabular-nums whitespace-nowrap ${
                billingCycle === 'monthly'
                  ? 'bg-nova-surface text-nova-text shadow-xs'
                  : 'text-nova-text-muted hover:text-nova-text'
              }`}
            >
              Gói tháng · 99.000đ
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`flex-1 min-h-[40px] py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative tabular-nums whitespace-nowrap ${
                billingCycle === 'yearly'
                  ? 'bg-nova-accent text-nova-accent-contrast shadow-xs'
                  : 'text-nova-text-muted hover:text-nova-text'
              }`}
            >
              <span>Gói năm · 699.000đ</span>
              <span className="ml-1.5 bg-nova-sage-soft text-nova-sage-text border border-nova-success-border text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                -40%
              </span>
            </button>
          </div>

          {/* VIP Perks List */}
          <div className="bg-nova-surface rounded-3xl p-4 border border-nova-border mb-5 space-y-3.5">
            {perks.map((perk, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-nova-accent-soft text-nova-accent flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-nova-text leading-snug">
                    {perk.title}
                  </h4>
                  <p className="text-[11.5px] text-nova-text-muted leading-normal mt-0.5">
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
              type="button"
              onClick={handleSubscribeClick}
              disabled={isProcessing || isVip}
              className={`w-full min-h-[48px] py-3.5 rounded-2xl font-bold text-[15px] shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap tabular-nums ${
                isVip
                  ? 'bg-nova-sage-soft text-nova-sage-text border border-nova-success-border'
                  : 'bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Đang kích hoạt gói VIP...</span>
                </div>
              ) : isVip ? (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Mẹ đang là Hội viên VIP Nova</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {billingCycle === 'monthly'
                      ? 'Đăng ký ngay · 99.000đ/tháng'
                      : 'Đăng ký ngay · 699.000đ/năm'}
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
                className="w-full min-h-[44px] py-2.5 text-[12.5px] font-bold text-nova-text bg-nova-surface border border-nova-border hover:bg-nova-bg-subtle rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Thanh toán chuyển khoản qua VietQR</span>
                <ArrowRight className="w-3.5 h-3.5 text-nova-accent" />
              </button>
            )}

            {/* Free Forever Transparency */}
            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[40px] py-2 text-[13px] font-semibold text-nova-text-muted hover:text-nova-text transition-colors cursor-pointer text-center"
            >
              Tiếp tục sử dụng bản Miễn phí
            </button>

            <div className="p-3 rounded-xl bg-nova-bg-subtle border border-nova-border text-center text-[11px] text-nova-text-muted leading-relaxed">
              Tính tuổi thai, theo dõi nước uống, nhắc nhở và cẩm nang 40 tuần luôn miễn phí 100% trọn đời. Gói VIP là tiện ích mở rộng tùy chọn.
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
