import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  CreditCard,
  Tag,
  Clock,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { CartItem, UserProfile } from '../../types';
import { BANK_TRANSFER_CONFIG } from '../../data/bankTransferConfig';
import { apiService } from '../../services/apiService';
import { NovaImage } from '../NovaBrandMark';

interface PaymentScreenProps {
  onBack: () => void;
  onPaymentSuccess?: () => void;
  onNavigateToOrderInfo?: () => void;
  user?: UserProfile;
  cartItems?: CartItem[];
  defaultPlan?: 'yearly' | 'monthly' | 'lifetime';
}

type PaymentMethod = 'vietqr' | 'momo' | 'applepay' | 'card';

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  onBack,
  onNavigateToOrderInfo,
  user,
  cartItems = [],
  defaultPlan = 'yearly',
}) => {
  const isCartCheckout = cartItems.length > 0;
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly' | 'lifetime'>(defaultPlan);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vietqr');

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [voucherError, setVoucherError] = useState('');

  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [isAwaitingVerification, setIsAwaitingVerification] = useState(false);
  const [referenceCode] = useState(
    () => `${isCartCheckout ? 'NOVA DH' : 'NOVA VIP'} ${(user?.id || 'USER').slice(-4).toUpperCase()}`
  );

  const [timeLeft, setTimeLeft] = useState(899);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const planPrices = {
    monthly: { price: 99000, label: 'Gói 1 tháng', desc: 'Thanh toán linh hoạt theo tháng' },
    yearly: { price: 699000, label: 'Gói 1 năm VIP (Khuyên dùng)', desc: 'Tiết kiệm 40% và tặng trọn bộ cẩm nang' },
    lifetime: { price: 1490000, label: 'Gói trọn đời', desc: 'Đồng hành suốt thai kỳ và hành trình nuôi con' },
  };

  const rawSubtotal = isCartCheckout
    ? cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
    : planPrices[selectedPlan].price;

  const totalAmount = Math.max(0, rawSubtotal - (voucherApplied ? discountAmount : 0));

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + ' đ';

  const triggerToast = (msg: string) => {
    setCopyToast(msg);
    setTimeout(() => setCopyToast(null), 2800);
  };

  const handleApplyVoucher = async () => {
    setVoucherError('');
    if (!voucherCode.trim()) return;
    try {
      const res = await apiService.validateCoupon(voucherCode, rawSubtotal);
      if (res.valid) {
        setDiscountAmount(res.discount);
        setVoucherApplied(true);
        triggerToast(res.message);
      } else {
        setVoucherApplied(false);
        setDiscountAmount(0);
        setVoucherError(res.message);
      }
    } catch {
      setVoucherError('Không kiểm tra được mã ưu đãi.');
    }
  };

  const handleCopy = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
    } catch {}
    triggerToast(`Đã sao chép ${label}!`);
  };

  if (isAwaitingVerification) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-nova-bg text-center select-none">
        <div className="w-20 h-20 rounded-full bg-nova-warning-soft border border-nova-warning-border text-nova-warning flex items-center justify-center mb-4">
          <Clock className="w-10 h-10 stroke-[2]" />
        </div>
        <h2 className="font-editorial text-[22px] font-semibold text-nova-text mb-1.5">
          Đã ghi nhận thông báo chuyển khoản
        </h2>
        <p className="text-[12.5px] text-nova-text-muted mb-5 max-w-[340px] leading-relaxed">
          Giao dịch VietQR với mã <strong>{referenceCode}</strong> đang ở trạng thái{' '}
          <strong>Chờ xác minh đối soát</strong>. Gói VIP sẽ được kích hoạt ngay sau khi giao dịch được xác nhận.
        </p>

        <div className="w-full max-w-[340px] bg-nova-surface rounded-2xl border border-nova-border p-4 text-left nova-card-shadow mb-6 space-y-2 text-xs">
          <div className="flex justify-between text-nova-text-muted">
            <span>Mã tham chiếu chuyển khoản:</span>
            <span className="font-mono font-bold text-nova-text">{referenceCode}</span>
          </div>
          <div className="flex justify-between text-nova-text-muted">
            <span>Trạng thái:</span>
            <span className="font-semibold text-nova-warning">
              Đang chờ đối soát giao dịch
            </span>
          </div>
          <div className="pt-2 border-t border-nova-border flex justify-between font-semibold text-nova-text">
            <span>Số tiền cần chuyển:</span>
            <span className="text-nova-accent font-bold tabular-nums">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        <button
          onClick={onBack}
          className="w-full max-w-[340px] min-h-[48px] py-3.5 bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast rounded-2xl text-[14px] font-semibold shadow-sm cursor-pointer transition-colors"
        >
          Quay lại ứng dụng
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-nova-bg overflow-y-auto no-scrollbar select-none">
      {copyToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-nova-accent text-nova-accent-contrast text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-nova-sage" />
          <span>{copyToast}</span>
        </div>
      )}

      <div className="px-5 pt-3 pb-2.5 flex items-center justify-between border-b border-nova-border sticky top-0 bg-nova-bg/92 backdrop-blur-md z-20">
        <button
          onClick={onBack}
          aria-label="Quay lại"
          className="w-9 h-9 rounded-full bg-nova-surface border border-nova-border shadow-xs flex items-center justify-center text-nova-text-muted cursor-pointer hover:border-nova-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="font-editorial text-[16px] font-semibold text-nova-text">
          Chuyển khoản và thanh toán
        </span>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-nova-sage-text">
          <ShieldCheck className="w-4 h-4" />
          <span>Minh bạch</span>
        </div>
      </div>

      <div className="px-5 pt-4 pb-10 space-y-4 max-w-2xl mx-auto w-full">
        {isCartCheckout && onNavigateToOrderInfo && (
          <div className="p-3.5 rounded-2xl bg-nova-accent-soft border border-nova-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-nova-text">
            <span>Để ghi nhận đơn hàng giao tận nhà kèm kiểm tra tồn kho, vui lòng xác nhận tại trang Đặt hàng.</span>
            <button
              onClick={onNavigateToOrderInfo}
              className="px-3.5 min-h-[40px] py-2 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast font-semibold whitespace-nowrap cursor-pointer shrink-0 transition-colors"
            >
              Mở trang Đặt hàng
            </button>
          </div>
        )}

        {!isCartCheckout && (
          <div>
            <span className="font-editorial text-[14px] font-semibold text-nova-text block mb-2.5">
              Chọn gói hội viên Nova Care VIP
            </span>
            <div className="space-y-2.5">
              {(['yearly', 'monthly', 'lifetime'] as const).map((planKey) => {
                const info = planPrices[planKey];
                const isSelected = selectedPlan === planKey;
                return (
                  <motion.div
                    key={planKey}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPlan(planKey)}
                    className={`p-3.5 rounded-2xl border cursor-pointer relative transition-colors ${
                      isSelected
                        ? 'border-nova-accent bg-nova-accent-soft ring-1 ring-nova-accent'
                        : 'border-nova-border bg-nova-surface hover:border-nova-taupe'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h4 className="text-[13px] font-semibold text-nova-text">
                          {info.label}
                        </h4>
                        <p className="text-[11px] text-nova-text-muted">{info.desc}</p>
                      </div>
                      <span className="text-[14px] font-bold text-nova-accent tabular-nums shrink-0">
                        {formatCurrency(info.price)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Voucher Code */}
        <div className="p-4 bg-nova-surface rounded-2xl border border-nova-border">
          <div className="flex items-center gap-2 mb-2.5">
            <Tag className="w-4 h-4 text-nova-accent" />
            <span className="text-[12.5px] font-semibold text-nova-text">
              Mã giảm giá (MEBAU2026 / NOVAVIP)
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã ưu đãi..."
              className="flex-1 min-h-[44px] px-3 py-2 bg-nova-bg-subtle border border-nova-border rounded-xl text-[12.5px] font-semibold uppercase text-nova-text placeholder:text-nova-text-muted focus:outline-none focus:ring-2 focus:ring-nova-accent/25"
            />
            <button
              onClick={handleApplyVoucher}
              className="px-4 min-h-[44px] py-2 bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-[12px] font-semibold rounded-xl cursor-pointer transition-colors whitespace-nowrap"
            >
              Áp dụng
            </button>
          </div>
          {voucherApplied && (
            <p className="mt-2 text-[11px] font-semibold text-nova-success tabular-nums">
              Đã giảm {formatCurrency(discountAmount)}!
            </p>
          )}
          {voucherError && (
            <p className="text-[11px] text-nova-danger mt-1.5">{voucherError}</p>
          )}
        </div>

        {/* Payment Methods */}
        <div>
          <span className="font-editorial text-[14px] font-semibold text-nova-text block mb-2.5">
            Phương thức thanh toán
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setPaymentMethod('vietqr')}
              className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-colors ${
                paymentMethod === 'vietqr'
                  ? 'border-nova-accent bg-nova-accent-soft ring-1 ring-nova-accent'
                  : 'border-nova-border bg-nova-surface'
              }`}
            >
              <span className="font-semibold text-[11.5px] text-nova-sage-text bg-nova-sage-soft px-2 py-0.5 rounded-md inline-block mb-1.5">
                VietQR
              </span>
              <span className="text-[12.5px] font-semibold text-nova-text block">
                Chuyển khoản 24/7
              </span>
              <span className="text-[10px] text-nova-text-muted">
                Đối soát bởi quản trị viên
              </span>
            </button>

            {[
              { id: 'momo', label: 'Ví MoMo' },
              { id: 'applepay', label: 'Ví ZaloPay' },
              { id: 'card', label: 'Thẻ thanh toán quốc tế' },
            ].map((gw) => (
              <div
                key={gw.id}
                className="p-3.5 rounded-2xl border border-nova-border bg-nova-bg-subtle opacity-75 text-left"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <CreditCard className="w-4 h-4 text-nova-text-muted" />
                  <span className="text-[9.5px] font-semibold text-nova-text-muted">
                    Tạm ngưng
                  </span>
                </div>
                <span className="text-[12px] font-semibold text-nova-text block">
                  {gw.label}
                </span>
                <span className="text-[9.5px] text-nova-text-muted">
                  Hiện chưa mở thanh toán trực tuyến
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* VietQR Details */}
        {paymentMethod === 'vietqr' && (
          <div className="p-4 bg-nova-surface rounded-3xl border border-nova-border space-y-3.5 nova-card-shadow">
            <div className="flex items-center justify-between border-b border-nova-border pb-2.5">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-nova-accent" />
                <span className="font-editorial text-[14px] font-semibold text-nova-text">
                  Mã VietQR chuyển khoản
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11.5px] font-semibold text-nova-accent tabular-nums">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-2.5 bg-[#FAF9F6] border border-nova-border rounded-2xl shadow-xs max-w-[260px]">
                <NovaImage
                  src={BANK_TRANSFER_CONFIG.qrImageUrl}
                  alt="Mã VietQR Agribank"
                  fallbackTitle="Mã VietQR Agribank"
                  className="w-56 h-auto object-contain rounded-xl"
                />
              </div>
              <span className="text-[11px] text-nova-text-muted mt-2 text-center">
                {BANK_TRANSFER_CONFIG.supportApps}
              </span>
            </div>

            <div className="space-y-2 bg-nova-bg-subtle p-3.5 rounded-2xl text-[12px] border border-nova-border">
              <div className="flex items-center justify-between">
                <span className="text-nova-text-muted">Ngân hàng:</span>
                <span className="font-semibold text-nova-text">
                  {BANK_TRANSFER_CONFIG.bankShortName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-nova-text-muted">Chủ tài khoản:</span>
                <span className="font-semibold text-nova-text">
                  {BANK_TRANSFER_CONFIG.accountHolder}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-nova-text-muted">Số tài khoản:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-nova-accent text-[15px] tabular-nums">
                    {BANK_TRANSFER_CONFIG.accountNumber}
                  </span>
                  <button
                    onClick={() => handleCopy(BANK_TRANSFER_CONFIG.accountNumber, 'Số tài khoản')}
                    className="p-1.5 rounded-lg bg-nova-surface border border-nova-border cursor-pointer"
                    aria-label="Sao chép số tài khoản"
                  >
                    <Copy className="w-3.5 h-3.5 text-nova-accent" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-nova-text-muted">Nội dung chuyển khoản:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-nova-text">
                    {referenceCode}
                  </span>
                  <button
                    onClick={() => handleCopy(referenceCode, 'Nội dung chuyển khoản')}
                    className="p-1.5 rounded-lg bg-nova-surface border border-nova-border cursor-pointer text-nova-text-muted"
                    aria-label="Sao chép nội dung chuyển khoản"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-nova-border pt-2">
                <span className="text-nova-text-muted">Số tiền:</span>
                <span className="font-bold text-nova-accent text-[15px] tabular-nums">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="p-3.5 rounded-2xl bg-nova-bg-subtle border border-nova-border flex items-start gap-2 text-[11px] text-nova-text-muted">
          <AlertCircle className="w-4 h-4 text-nova-accent shrink-0 mt-0.5" />
          <span>
            Mọi giao dịch chuyển khoản VietQR sẽ được đối soát minh bạch bởi quản trị viên trước khi kích hoạt gói hội viên.
          </span>
        </div>

        <button
          onClick={() => {
            if (isCartCheckout && onNavigateToOrderInfo) {
              onNavigateToOrderInfo();
            } else {
              setIsAwaitingVerification(true);
            }
          }}
          className="w-full min-h-[48px] py-3.5 bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast rounded-2xl text-[14.5px] font-semibold shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Lock className="w-4 h-4" />
          <span className="tabular-nums">
            {isCartCheckout
              ? 'Tiếp tục tạo đơn tại trang Đặt hàng'
              : `Gửi thông báo đã chuyển khoản (${formatCurrency(totalAmount)})`}
          </span>
        </button>
      </div>
    </div>
  );
};
