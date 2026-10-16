import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  CreditCard,
  Crown,
  Tag,
  Clock,
  Sparkles,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { CartItem } from '../../types';
import confetti from 'canvas-confetti';

interface PaymentScreenProps {
  onBack: () => void;
  onPaymentSuccess: () => void;
  cartItems?: CartItem[];
  defaultPlan?: 'yearly' | 'monthly' | 'lifetime';
}

type PaymentMethod = 'vietqr' | 'momo' | 'applepay' | 'card';

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  onBack,
  onPaymentSuccess,
  cartItems = [],
  defaultPlan = 'yearly',
}) => {
  const isCartCheckout = cartItems.length > 0;
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly' | 'lifetime'>(defaultPlan);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vietqr');

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('MEBAU2026');
  const [voucherApplied, setVoucherApplied] = useState(true);
  const [discountAmount, setDiscountAmount] = useState(50000);
  const [voucherError, setVoucherError] = useState('');

  // Copy notification toast
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // Payment processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Countdown timer for QR
  const [timeLeft, setTimeLeft] = useState(899); // 14:59

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

  // Pricing calculations
  const planPrices = {
    monthly: { price: 99000, label: 'Gói 1 Tháng', desc: 'Thanh toán theo tháng' },
    yearly: { price: 699000, label: 'Gói 1 Năm VIP (Khuyên dùng)', desc: 'Tiết kiệm 40% + Tặng trọn bộ cẩm nang' },
    lifetime: { price: 1490000, label: 'Gói Trọn Đời', desc: 'Sử dụng vĩnh viễn suốt thai kỳ & nuôi con' },
  };

  const rawSubtotal = isCartCheckout
    ? cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
    : planPrices[selectedPlan].price;

  const totalAmount = Math.max(0, rawSubtotal - (voucherApplied ? discountAmount : 0));

  const formatCurrency = (val: number) => {
    return val.toLocaleString('vi-VN') + ' đ';
  };

  const handleApplyVoucher = () => {
    setVoucherError('');
    if (voucherCode.trim().toUpperCase() === 'MEBAU2026') {
      setDiscountAmount(50000);
      setVoucherApplied(true);
      triggerToast('Đã áp dụng mã MEBAU2026: Giảm 50.000đ!');
    } else if (voucherCode.trim().toUpperCase() === 'NOVAVIP') {
      const discount = Math.round(rawSubtotal * 0.2);
      setDiscountAmount(discount);
      setVoucherApplied(true);
      triggerToast('Đã áp dụng mã NOVAVIP: Giảm 20%!');
    } else {
      setVoucherError('Mã không hợp lệ hoặc đã hết hạn.');
    }
  };

  const triggerToast = (msg: string) => {
    setCopyToast(msg);
    setTimeout(() => setCopyToast(null), 3000);
  };

  const handleCopy = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      triggerToast(`Đã sao chép ${label}!`);
    } catch {
      triggerToast(`Đã sao chép ${label}!`);
    }
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#C84B4B', '#2ECC71', '#D4AF37', '#FFFBF7'],
        });
      } catch {
        // ignore
      }
    }, 1800);
  };

  if (isSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#FFFBF7] text-center select-none">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-full bg-[#E8F8F0] text-[#2ECC71] flex items-center justify-center mb-4 ring-8 ring-[#E8F8F0]/50"
        >
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </motion.div>

        <h2 className="text-[22px] font-black text-[#3A2E2B] mb-1">
          Thanh toán thành công!
        </h2>
        <p className="text-[13px] text-[#8C7B75] mb-6 max-w-[280px]">
          {isCartCheckout
            ? 'Đơn hàng của mẹ đã được chuyển sang bộ phận đóng gói và giao hàng hỏa tốc.'
            : 'Đặc quyền Hội viên Nova Care VIP đã được kích hoạt ngay vào tài khoản của mẹ.'}
        </p>

        {/* Receipt card */}
        <div className="w-full max-w-[340px] bg-white rounded-2xl border border-[#EFEAE5] p-4 text-left shadow-xs mb-6 space-y-2">
          <div className="flex justify-between text-[11.5px] text-[#8C7B75]">
            <span>Mã giao dịch:</span>
            <span className="font-mono font-bold text-[#3A2E2B]">NOVA-2026-98124</span>
          </div>
          <div className="flex justify-between text-[11.5px] text-[#8C7B75]">
            <span>Thời gian:</span>
            <span className="font-medium text-[#3A2E2B]">Vừa xong</span>
          </div>
          <div className="flex justify-between text-[11.5px] text-[#8C7B75]">
            <span>Phương thức:</span>
            <span className="font-medium text-[#3A2E2B]">
              {paymentMethod === 'vietqr' ? 'Chuyển khoản VietQR' : paymentMethod === 'momo' ? 'Ví MoMo' : 'Thẻ / Apple Pay'}
            </span>
          </div>
          <div className="pt-2 border-t border-[#F5EFEB] flex justify-between text-[13px] font-bold text-[#3A2E2B]">
            <span>Tổng số tiền:</span>
            <span className="text-[#C84B4B] font-extrabold">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        <button
          onClick={onPaymentSuccess}
          className="w-full max-w-[340px] py-3.5 bg-[#C84B4B] text-white rounded-2xl text-[14px] font-bold shadow-md hover:bg-[#B84040] transition-colors cursor-pointer"
        >
          Hoàn tất & Về ứng dụng
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#FFFBF7] overflow-y-auto no-scrollbar select-none">
      {/* Toast */}
      {copyToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#3A2E2B] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-[#2ECC71]" />
          <span>{copyToast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-[#F0ECE6]/60 sticky top-0 bg-[#FFFBF7]/90 backdrop-blur-md z-20">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white border border-[#EFEAE5] shadow-xs flex items-center justify-center text-[#5E4E49] hover:bg-[#F5EFEB] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-[14px] font-bold text-[#3A2E2B]">Thanh toán an toàn</span>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#2ECC71]">
          <ShieldCheck className="w-4 h-4" />
          <span>SSL 256-bit</span>
        </div>
      </div>

      <div className="px-5 pt-3 pb-8 space-y-4">
        {/* Order or VIP Plan selection */}
        {!isCartCheckout ? (
          <div>
            <span className="text-[12.5px] font-extrabold text-[#3A2E2B] block mb-2">
              Chọn gói Hội viên Nova Care VIP:
            </span>
            <div className="space-y-2">
              {(['yearly', 'monthly', 'lifetime'] as const).map((planKey) => {
                const info = planPrices[planKey];
                const isSelected = selectedPlan === planKey;
                return (
                  <motion.div
                    key={planKey}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPlan(planKey)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-[#C84B4B] bg-gradient-to-r from-[#FFF5F2] to-white shadow-xs ring-1 ring-[#C84B4B]'
                        : 'border-[#EAE3DC] bg-white hover:border-[#D1C7BD]'
                    }`}
                  >
                    {planKey === 'yearly' && (
                      <span className="absolute -top-2 right-4 bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-white text-[9.5px] font-extrabold px-2 py-0.2 rounded-full uppercase shadow-xs">
                        Ưu đãi hot 40%
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-[#C84B4B] bg-[#C84B4B]' : 'border-[#C5BCB6]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>
                        <div>
                          <h4 className="text-[13px] font-bold text-[#3A2E2B]">{info.label}</h4>
                          <p className="text-[11px] text-[#8C7B75]">{info.desc}</p>
                        </div>
                      </div>
                      <span className="text-[14px] font-extrabold text-[#C84B4B]">
                        {formatCurrency(info.price)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Cart items summary */
          <div className="p-4 bg-white rounded-2xl border border-[#EFEAE5] shadow-xs">
            <span className="text-[12.5px] font-extrabold text-[#3A2E2B] block mb-2">
              Sản phẩm thanh toán ({cartItems.length}):
            </span>
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between py-1 border-b border-[#F5EFEB] last:border-0">
                  <div className="flex items-center gap-2">
                    <img src={item.product.image} alt={item.product.name} className="w-9 h-9 rounded-lg object-cover" />
                    <div>
                      <h4 className="text-[12px] font-bold text-[#3A2E2B] truncate max-w-[170px]">{item.product.name}</h4>
                      <p className="text-[10.5px] text-[#8C7B75]">SL: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-[12px] font-extrabold text-[#3A2E2B]">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voucher Code input */}
        <div className="p-3.5 bg-white rounded-2xl border border-[#EFEAE5] shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-[#C84B4B]" />
            <span className="text-[12px] font-bold text-[#3A2E2B]">Mã giảm giá / Voucher</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              placeholder="VD: MEBAU2026 hoặc NOVAVIP"
              className="flex-1 px-3 py-2 bg-[#F9F6F2] border border-[#E8DFD5] rounded-xl text-[12.5px] font-bold text-[#3A2E2B] uppercase tracking-wider focus:outline-none focus:border-[#C84B4B]"
            />
            <button
              onClick={handleApplyVoucher}
              className="px-4 py-2 bg-[#3A2E2B] text-white text-[12px] font-bold rounded-xl hover:bg-[#2A211E] cursor-pointer"
            >
              Áp dụng
            </button>
          </div>
          {voucherApplied && (
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-[#2ECC71]">
              <Check className="w-3.5 h-3.5" />
              <span>Đã giảm {formatCurrency(discountAmount)} từ mã ưu đãi!</span>
            </div>
          )}
          {voucherError && (
            <p className="text-[11px] text-[#E74C3C] mt-1.5">{voucherError}</p>
          )}
        </div>

        {/* Payment Methods */}
        <div>
          <span className="text-[12.5px] font-extrabold text-[#3A2E2B] block mb-2">
            Phương thức thanh toán:
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {/* VietQR */}
            <button
              type="button"
              onClick={() => setPaymentMethod('vietqr')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                paymentMethod === 'vietqr'
                  ? 'border-[#C84B4B] bg-[#FFF5F2] ring-1 ring-[#C84B4B]'
                  : 'border-[#EAE3DC] bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-extrabold text-[12px] text-[#0054A6] bg-blue-50 px-2 py-0.5 rounded-md">
                  VietQR
                </span>
                {paymentMethod === 'vietqr' && <Check className="w-3.5 h-3.5 text-[#C84B4B]" />}
              </div>
              <span className="text-[12px] font-bold text-[#3A2E2B]">Chuyển khoản 24/7</span>
              <span className="text-[9.5px] text-[#8C7B75]">Quét mã ngân hàng</span>
            </button>

            {/* MoMo */}
            <button
              type="button"
              onClick={() => setPaymentMethod('momo')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                paymentMethod === 'momo'
                  ? 'border-[#C84B4B] bg-[#FFF5F2] ring-1 ring-[#C84B4B]'
                  : 'border-[#EAE3DC] bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-extrabold text-[12px] text-[#A50064] bg-pink-50 px-2 py-0.5 rounded-md">
                  MoMo
                </span>
                {paymentMethod === 'momo' && <Check className="w-3.5 h-3.5 text-[#C84B4B]" />}
              </div>
              <span className="text-[12px] font-bold text-[#3A2E2B]">Ví điện tử MoMo</span>
              <span className="text-[9.5px] text-[#8C7B75]">Thanh toán 1-chạm</span>
            </button>

            {/* Apple Pay / ZaloPay */}
            <button
              type="button"
              onClick={() => setPaymentMethod('applepay')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                paymentMethod === 'applepay'
                  ? 'border-[#C84B4B] bg-[#FFF5F2] ring-1 ring-[#C84B4B]'
                  : 'border-[#EAE3DC] bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-extrabold text-[12px] text-black"> Pay / ZaloPay</span>
                {paymentMethod === 'applepay' && <Check className="w-3.5 h-3.5 text-[#C84B4B]" />}
              </div>
              <span className="text-[12px] font-bold text-[#3A2E2B]">Apple / ZaloPay</span>
              <span className="text-[9.5px] text-[#8C7B75]">Nhanh chóng & An toàn</span>
            </button>

            {/* Visa / Master */}
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                paymentMethod === 'card'
                  ? 'border-[#C84B4B] bg-[#FFF5F2] ring-1 ring-[#C84B4B]'
                  : 'border-[#EAE3DC] bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <CreditCard className="w-4 h-4 text-[#5E4E49]" />
                {paymentMethod === 'card' && <Check className="w-3.5 h-3.5 text-[#C84B4B]" />}
              </div>
              <span className="text-[12px] font-bold text-[#3A2E2B]">Thẻ Visa / Master</span>
              <span className="text-[9.5px] text-[#8C7B75]">Thẻ Quốc tế</span>
            </button>
          </div>
        </div>

        {/* VietQR Detail View if selected */}
        {paymentMethod === 'vietqr' && (
          <div className="p-4 bg-white rounded-3xl border border-[#E8DFD5] shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#F5EFEB] pb-2.5">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#C84B4B]" />
                <span className="text-[13px] font-extrabold text-[#3A2E2B]">Mã VietQR Chuyển khoản</span>
              </div>
              <div className="flex items-center gap-1 text-[11.5px] font-bold text-[#C84B4B]">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            </div>

            {/* QR Mock Image */}
            <div className="flex flex-col items-center">
              <div className="p-3 bg-white border-2 border-[#EAE3DC] rounded-2xl shadow-xs">
                <svg
                  className="w-40 h-40"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer Frame */}
                  <rect width="100" height="100" fill="white" />
                  {/* Position detection corners */}
                  <rect x="5" y="5" width="26" height="26" fill="#1A1817" rx="3" />
                  <rect x="9" y="9" width="18" height="18" fill="white" rx="2" />
                  <rect x="13" y="13" width="10" height="10" fill="#C84B4B" rx="1" />

                  <rect x="69" y="5" width="26" height="26" fill="#1A1817" rx="3" />
                  <rect x="73" y="9" width="18" height="18" fill="white" rx="2" />
                  <rect x="77" y="13" width="10" height="10" fill="#C84B4B" rx="1" />

                  <rect x="5" y="69" width="26" height="26" fill="#1A1817" rx="3" />
                  <rect x="9" y="73" width="18" height="18" fill="white" rx="2" />
                  <rect x="13" y="77" width="10" height="10" fill="#C84B4B" rx="1" />

                  {/* QR Data modules pattern */}
                  <rect x="36" y="8" width="6" height="6" fill="#1A1817" />
                  <rect x="46" y="8" width="6" height="6" fill="#1A1817" />
                  <rect x="56" y="8" width="6" height="6" fill="#1A1817" />

                  <rect x="36" y="18" width="8" height="6" fill="#1A1817" />
                  <rect x="48" y="18" width="6" height="6" fill="#1A1817" />
                  <rect x="58" y="18" width="6" height="6" fill="#1A1817" />

                  <rect x="8" y="36" width="6" height="6" fill="#1A1817" />
                  <rect x="18" y="36" width="6" height="6" fill="#1A1817" />
                  <rect x="28" y="36" width="6" height="6" fill="#1A1817" />

                  <rect x="8" y="46" width="8" height="6" fill="#1A1817" />
                  <rect x="20" y="46" width="6" height="6" fill="#1A1817" />

                  {/* Center Brand Icon */}
                  <circle cx="50" cy="50" r="13" fill="#C84B4B" />
                  <path d="M46 47C46 45 48 43 50 43C52 43 54 45 54 47C54 50 50 53 50 53C50 53 46 50 46 47Z" fill="white" />
                  <circle cx="50" cy="56" r="1.5" fill="white" />

                  {/* Lower data pixels */}
                  <rect x="36" y="68" width="6" height="6" fill="#1A1817" />
                  <rect x="46" y="68" width="8" height="6" fill="#1A1817" />
                  <rect x="58" y="68" width="6" height="6" fill="#1A1817" />

                  <rect x="36" y="78" width="6" height="6" fill="#1A1817" />
                  <rect x="46" y="78" width="6" height="6" fill="#1A1817" />
                  <rect x="56" y="78" width="6" height="6" fill="#1A1817" />
                  <rect x="68" y="78" width="6" height="6" fill="#1A1817" />

                  <rect x="68" y="36" width="8" height="6" fill="#1A1817" />
                  <rect x="80" y="36" width="6" height="6" fill="#1A1817" />
                  <rect x="68" y="46" width="6" height="6" fill="#1A1817" />
                  <rect x="78" y="46" width="8" height="6" fill="#1A1817" />
                  <rect x="68" y="58" width="6" height="6" fill="#1A1817" />
                  <rect x="78" y="58" width="6" height="6" fill="#1A1817" />
                </svg>
              </div>
              <span className="text-[11px] text-[#8C7B75] mt-1.5 font-medium">
                Quét bằng app MBBank, Vietcombank, Techcombank, MoMo
              </span>
            </div>

            {/* Bank details table */}
            <div className="space-y-2 bg-[#FBF8F5] p-3 rounded-2xl text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-[#8C7B75]">Ngân hàng:</span>
                <span className="font-extrabold text-[#3A2E2B]">MBBank (Quân Đội)</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#8C7B75]">Chủ tài khoản:</span>
                <span className="font-extrabold text-[#3A2E2B]">CONG TY CP Y TE NOVA CARE</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#8C7B75]">Số tài khoản:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-[#C84B4B] text-[13px]">
                    0388 999 8888
                  </span>
                  <button
                    onClick={() => handleCopy('03889998888', 'Số tài khoản')}
                    className="p-1 hover:bg-white rounded-md text-[#5E4E49] transition-colors cursor-pointer"
                    title="Sao chép STK"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#8C7B75]">Nội dung CK:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-[#3A2E2B]">
                    NOVA 8899 KHANHBANG
                  </span>
                  <button
                    onClick={() => handleCopy('NOVA 8899 KHANHBANG', 'Nội dung chuyển khoản')}
                    className="p-1 hover:bg-white rounded-md text-[#5E4E49] transition-colors cursor-pointer"
                    title="Sao chép nội dung"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#EFEAE5] pt-1.5">
                <span className="text-[#8C7B75]">Số tiền chính xác:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-[#C84B4B] text-[14px]">
                    {formatCurrency(totalAmount)}
                  </span>
                  <button
                    onClick={() => handleCopy(totalAmount.toString(), 'Số tiền')}
                    className="p-1 hover:bg-white rounded-md text-[#5E4E49] transition-colors cursor-pointer"
                    title="Sao chép số tiền"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Card Input Mock if Card is selected */}
        {paymentMethod === 'card' && (
          <div className="p-4 bg-white rounded-2xl border border-[#E8DFD5] space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-[#8C7B75] mb-1">Số thẻ tín dụng / ghi nợ</label>
              <input
                type="text"
                placeholder="4123 •••• •••• 9821"
                className="w-full px-3.5 py-2.5 bg-[#F9F6F2] border border-[#E8DFD5] rounded-xl text-[13px] font-mono text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#8C7B75] mb-1">Hạn dùng (MM/YY)</label>
                <input
                  type="text"
                  placeholder="12/28"
                  className="w-full px-3.5 py-2 bg-[#F9F6F2] border border-[#E8DFD5] rounded-xl text-[13px] font-mono text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#8C7B75] mb-1">Mã bảo mật CVV</label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="•••"
                  className="w-full px-3.5 py-2 bg-[#F9F6F2] border border-[#E8DFD5] rounded-xl text-[13px] font-mono text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Total Summary */}
        <div className="p-4 bg-white rounded-2xl border border-[#EFEAE5] shadow-xs space-y-1.5">
          <div className="flex justify-between text-[12px] text-[#8C7B75]">
            <span>Tạm tính:</span>
            <span>{formatCurrency(rawSubtotal)}</span>
          </div>
          {voucherApplied && (
            <div className="flex justify-between text-[12px] text-[#2ECC71] font-semibold">
              <span>Khuyến mãi ({voucherCode}):</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-[#F5EFEB] flex justify-between text-[14px] font-extrabold text-[#3A2E2B]">
            <span>Tổng thanh toán:</span>
            <span className="text-[#C84B4B] text-[16px]">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {/* Confirm Payment Action Button */}
        <button
          onClick={handleConfirmPayment}
          disabled={isProcessing}
          className="w-full py-3.5 bg-[#C84B4B] text-white rounded-2xl text-[14.5px] font-bold shadow-md hover:bg-[#B84040] disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Đang xác nhận với ngân hàng...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Xác nhận đã thanh toán {formatCurrency(totalAmount)}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
