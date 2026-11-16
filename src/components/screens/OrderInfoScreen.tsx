import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Plus,
  Check,
  Truck,
  Zap,
  Clock,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  Tag,
  CheckCircle2,
  Trash2,
  Package,
  FileText,
  DollarSign,
  QrCode,
  CreditCard,
  Building,
  Home as HomeIcon,
  Sparkles,
  Info,
  Copy,
  ChevronDown,
} from 'lucide-react';
import { ShippingAddress, CartItem, UserProfile, OrderInfo } from '../../types';
import { VIETNAM_PROVINCES } from '../../data/mockData';
import { BANK_TRANSFER_CONFIG } from '../../data/bankTransferConfig';
import { apiService } from '../../services/apiService';
import { NovaImage } from '../NovaBrandMark';
import confetti from 'canvas-confetti';

interface OrderInfoScreenProps {
  user: UserProfile;
  cartItems: CartItem[];
  onBack: () => void;
  onNavigateToPayment?: (order: OrderInfo) => void;
  onOrderSuccess?: (order: OrderInfo) => void;
  onUpdateUserAddresses?: (addresses: ShippingAddress[]) => void;
  onUpdateCart?: (items: CartItem[]) => void;
}

export const OrderInfoScreen: React.FC<OrderInfoScreenProps> = ({
  user,
  cartItems: initialCartItems,
  onBack,
  onOrderSuccess,
  onUpdateUserAddresses,
  onUpdateCart,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems || []);

  // Address state
  const [addresses, setAddresses] = useState<ShippingAddress[]>(
    user.shippingAddresses && user.shippingAddresses.length > 0
      ? user.shippingAddresses
      : [
          {
            id: 'addr-default',
            fullName: user.name || 'Khánh Băng',
            phone: user.phone || '0987 654 321',
            province: 'TP. Hồ Chí Minh',
            district: 'Quận 3',
            ward: 'Phường Võ Thị Sáu',
            streetAddress: '142 Nguyễn Thị Minh Khai, Tòa nhà Rosana, Căn hộ 502',
            isDefault: true,
            label: 'Nhà riêng',
            deliveryNote: 'Nhà có mẹ bầu & trẻ sơ sinh, xin gọi trước khi đến, không bấm chuông to',
          },
        ]
  );

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || 'addr-default'
  );

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [formName, setFormName] = useState(user.name || '');
  const [formPhone, setFormPhone] = useState(user.phone || '');
  const [formProvince, setFormProvince] = useState('TP. Hồ Chí Minh');
  const [formDistrict, setFormDistrict] = useState('Quận 3');
  const [formWard, setFormWard] = useState('Phường Võ Thị Sáu');
  const [formStreet, setFormStreet] = useState('');
  const [formLabel, setFormLabel] = useState<'Nhà riêng' | 'Văn phòng' | 'Nhà người thân' | 'Khác'>('Nhà riêng');
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formPhoneError, setFormPhoneError] = useState('');

  const [shippingMethod, setShippingMethod] = useState<'express' | 'standard' | 'economy'>('standard');
  const [deliveryNote, setDeliveryNote] = useState('');
  const quickNotes = [
    'Gọi trước 15p, không bấm chuông bé ngủ',
    'Gửi bảo vệ / lễ tân nếu mẹ vắng',
    'Cho xem hàng trước khi nhận',
    'Giao vào giờ hành chính',
  ];

  // Voucher (validated against server coupon rules)
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState('');

  // Payment Method (Only COD & VietQR available without PAYMENT_GATEWAY_SECRET_KEY)
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vietqr' | 'momo' | 'card'>('cod');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<OrderInfo | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  const rawSubtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const vipDiscount = user.isVip ? Math.round(rawSubtotal * 0.1) : 0;

  const shippingFees = {
    express: user.isVip ? 15000 : 40000,
    standard: rawSubtotal >= 300000 ? 0 : 25000,
    economy: 0,
  };

  const currentShippingFee = cartItems.length > 0 ? shippingFees[shippingMethod] : 0;
  const totalDiscount = (voucherApplied ? voucherDiscount : 0) + vipDiscount;
  const totalAmount = Math.max(0, rawSubtotal + currentShippingFee - totalDiscount);

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + ' đ';

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setFormName(user.name);
    setFormPhone(user.phone);
    setFormProvince('TP. Hồ Chí Minh');
    setFormDistrict('Quận 1');
    setFormWard('Phường Bến Nghé');
    setFormStreet('');
    setFormLabel('Nhà riêng');
    setFormIsDefault(addresses.length === 0);
    setFormPhoneError('');
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: ShippingAddress) => {
    setEditingAddressId(addr.id);
    setFormName(addr.fullName);
    setFormPhone(addr.phone);
    setFormProvince(addr.province);
    setFormDistrict(addr.district);
    setFormWard(addr.ward);
    setFormStreet(addr.streetAddress);
    setFormLabel(addr.label || 'Nhà riêng');
    setFormIsDefault(Boolean(addr.isDefault));
    setFormPhoneError('');
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = () => {
    const cleanPhone = formPhone.replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setFormPhoneError('Vui lòng nhập số điện thoại hợp lệ (10 số).');
      return;
    }
    if (!formName.trim()) {
      setFormPhoneError('Vui lòng nhập họ tên người nhận.');
      return;
    }
    if (!formStreet.trim()) {
      setFormPhoneError('Vui lòng nhập địa chỉ cụ thể (số nhà, tên đường).');
      return;
    }

    if (editingAddressId) {
      const updated = addresses.map((a) => {
        if (a.id === editingAddressId) {
          return {
            ...a,
            fullName: formName.trim(),
            phone: formPhone.trim(),
            province: formProvince,
            district: formDistrict,
            ward: formWard,
            streetAddress: formStreet.trim(),
            label: formLabel,
            isDefault: formIsDefault,
          };
        }
        return formIsDefault ? { ...a, isDefault: false } : a;
      });
      setAddresses(updated);
      onUpdateUserAddresses?.(updated);
      showToast('Đã cập nhật địa chỉ thành công!');
    } else {
      const newAddr: ShippingAddress = {
        id: `addr-${Date.now()}`,
        fullName: formName.trim(),
        phone: formPhone.trim(),
        province: formProvince,
        district: formDistrict,
        ward: formWard,
        streetAddress: formStreet.trim(),
        label: formLabel,
        isDefault: formIsDefault || addresses.length === 0,
      };

      let nextAddresses = addresses;
      if (formIsDefault) {
        nextAddresses = nextAddresses.map((a) => ({ ...a, isDefault: false }));
      }
      const finalAddresses = [newAddr, ...nextAddresses];
      setAddresses(finalAddresses);
      setSelectedAddressId(newAddr.id);
      onUpdateUserAddresses?.(finalAddresses);
      showToast('Đã thêm địa chỉ giao hàng mới!');
    }

    setIsAddressModalOpen(false);
  };

  const handleDeleteAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (addresses.length <= 1) {
      showToast('Cần ít nhất một địa chỉ để nhận hàng.');
      return;
    }
    const filtered = addresses.filter((a) => a.id !== id);
    setAddresses(filtered);
    if (selectedAddressId === id) {
      setSelectedAddressId(filtered[0]?.id || '');
    }
    onUpdateUserAddresses?.(filtered);
    showToast('Đã xóa địa chỉ.');
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    const updated = cartItems
      .map((item) => {
        if (item.product.id === productId) {
          const newQ = item.quantity + delta;
          return newQ > 0 ? { ...item, quantity: newQ } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    setCartItems(updated);
    onUpdateCart?.(updated);
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    try {
      const res = await apiService.validateCoupon(voucherCode, rawSubtotal);
      if (res.valid) {
        setVoucherDiscount(res.discount);
        setVoucherApplied(true);
        setVoucherMessage(res.message);
        showToast(res.message);
      } else {
        setVoucherApplied(false);
        setVoucherDiscount(0);
        setVoucherMessage(res.message);
        showToast(res.message);
      }
    } catch {
      setVoucherApplied(false);
      setVoucherDiscount(0);
      setVoucherMessage('Không kiểm tra được mã giảm giá.');
    }
  };

  const handleConfirmOrder = async () => {
    setSubmitError(null);
    if (!activeAddress) {
      showToast('Vui lòng chọn hoặc thêm địa chỉ nhận hàng!');
      return;
    }
    if (cartItems.length === 0) {
      showToast('Giỏ hàng chưa có sản phẩm nào!');
      return;
    }
    if (paymentMethod === 'momo' || paymentMethod === 'card') {
      setSubmitError('Cổng thanh toán trực tuyến chưa được kích hoạt (thiếu PAYMENT_GATEWAY_SECRET_KEY). Vui lòng chọn COD hoặc VietQR.');
      return;
    }

    const orderId = `NOVA-${Math.floor(10000 + Math.random() * 90000)}`;
    const payload: Omit<OrderInfo, 'userId' | 'createdAt' | 'trackingHistory'> = {
      orderId,
      items: cartItems,
      shippingAddress: activeAddress,
      shippingMethod,
      shippingFee: currentShippingFee,
      subtotal: rawSubtotal,
      discountAmount: totalDiscount,
      voucherCode: voucherApplied ? voucherCode.trim().toUpperCase() : undefined,
      totalAmount,
      paymentMethod,
      deliveryNote: deliveryNote || activeAddress.deliveryNote,
      status: paymentMethod === 'vietqr' ? 'awaiting_verification' : 'pending',
      estimatedDeliveryDate: shippingMethod === 'express' ? 'Hôm nay trong 2-4 giờ' : 'Dự kiến 1 - 2 ngày',
    };

    setIsSubmitting(true);
    try {
      const created = await apiService.createOrder(payload, user);
      setCompletedOrder(created);
      onOrderSuccess?.(created);
      window.dispatchEvent(new CustomEvent('nova_orders_updated'));
      try {
        confetti({
          particleCount: 65,
          spread: 65,
          origin: { y: 0.6 },
          colors: ['#B55841', '#C4A46B', '#6D8572', '#F2ECE3'],
        });
      } catch {}
    } catch (err: any) {
      setSubmitError(err?.message || 'Không thể tạo đơn hàng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render completed order screen honestly
  if (completedOrder) {
    const isVietQR = completedOrder.paymentMethod === 'vietqr';
    return (
      <div className="flex-1 flex flex-col bg-[#FAF6F0] dark:bg-[#161311] overflow-y-auto no-scrollbar select-none">
        <div className="px-5 pt-3 pb-2.5 flex items-center justify-between border-b border-[#E6DDD1] dark:border-[#362E2A] sticky top-0 bg-[#FAF6F0]/95 dark:bg-[#161311]/95 backdrop-blur-md z-20">
          <button
            onClick={onBack}
            aria-label="Quay lại"
            className="w-9 h-9 rounded-full bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] shadow-xs flex items-center justify-center text-[#6B5D56] dark:text-[#C5B9B0] cursor-pointer hover:border-[#B55841] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-editorial text-[16px] font-semibold text-[#322622] dark:text-[#F4EDE6]">
            Ghi nhận đơn hàng
          </span>
          <div className="w-9" />
        </div>

        <div className="px-5 pt-5 pb-10 space-y-4 max-w-2xl mx-auto w-full">
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-5 bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] nova-card-shadow text-center flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#EBF1EC] dark:bg-[#1E2922] border border-[#C8D9CB] dark:border-[#33483A] flex items-center justify-center text-[#4F6B56] dark:text-[#8DA892] mb-3">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <span className="text-[11px] font-semibold tracking-wide text-[#B55841] dark:text-[#D47A63] bg-[#F7EAE5] dark:bg-[#35231E] border border-[#EBCDC2] dark:border-[#52352D] px-3 py-0.5 rounded-full mb-2">
              {isVietQR
                ? 'Đã ghi nhận · Chờ xác minh chuyển khoản'
                : 'Đã ghi nhận đơn COD · Chờ xác nhận'}
            </span>
            <h2 className="font-editorial text-[20px] font-semibold text-[#322622] dark:text-[#F4EDE6]">
              Cảm ơn mẹ {completedOrder.shippingAddress.fullName}!
            </h2>
            <p className="text-[12px] text-[#786962] dark:text-[#B5A89F] mt-1.5 max-w-[340px] leading-relaxed">
              {isVietQR
                ? 'Mẹ vui lòng chuyển khoản đúng nội dung bên dưới. Trạng thái sẽ chuyển sang Đã xác nhận sau khi bộ phận quản trị đối soát giao dịch.'
                : 'Đơn hàng COD đã được lưu trên hệ thống và chờ xác nhận giao hàng.'}
            </p>

            <div className="mt-4 px-4 py-2 bg-[#FAF6F0] dark:bg-[#231E1B] rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] flex items-center gap-2">
              <span className="text-[11.5px] text-[#786962] dark:text-[#B5A89F]">Mã đơn hàng:</span>
              <span className="text-[14px] font-mono font-bold text-[#B55841] dark:text-[#D47A63]">
                {completedOrder.orderId}
              </span>
              <button
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(completedOrder.orderId);
                  } catch {}
                  showToast('Đã sao chép mã đơn hàng!');
                }}
                aria-label="Sao chép mã đơn hàng"
                className="text-[#786962] dark:text-[#B5A89F] hover:text-[#B55841] dark:hover:text-[#D47A63] p-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* Tracking History */}
          <div className="p-4 bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-2 text-[12px]">
            <div className="flex items-center justify-between font-semibold text-[#322622] dark:text-[#F4EDE6]">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#B55841] dark:text-[#D47A63]" /> Lịch sử trạng thái thực tế
              </span>
              <span className="text-[11px] text-[#4F6B56] dark:text-[#8DA892]">
                {completedOrder.estimatedDeliveryDate}
              </span>
            </div>
            {(completedOrder.trackingHistory || []).map((ev, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-[11.5px]"
              >
                <p className="font-semibold text-[#322622] dark:text-[#F4EDE6]">{ev.label}</p>
                <p className="text-[10px] text-[#786962] dark:text-[#B5A89F] tabular-nums mt-0.5">
                  {new Date(ev.timestamp).toLocaleString('vi-VN')}
                </p>
              </div>
            ))}
          </div>

          {isVietQR && (
            <div className="p-4 bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#E6DDD1] dark:border-[#362E2A] pb-2.5">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#B55841] dark:text-[#D47A63]" />
                  <span className="font-editorial text-[14px] font-semibold text-[#322622] dark:text-[#F4EDE6]">
                    Thông tin chuyển khoản VietQR
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-[#9E5B3B] dark:text-[#D7BA86] bg-[#F6EFE2] dark:bg-[#2F281C] px-2.5 py-0.5 rounded-full">
                  Chờ đối soát
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="p-2 bg-white border border-[#E6DDD1] rounded-2xl shadow-xs max-w-[240px]">
                  <NovaImage
                    src={BANK_TRANSFER_CONFIG.qrImageUrl}
                    alt="Mã VietQR Agribank"
                    fallbackTitle="Mã VietQR Agribank"
                    className="w-52 h-auto object-contain rounded-xl"
                  />
                </div>
                <span className="text-[11px] text-[#786962] dark:text-[#B5A89F] mt-1.5 text-center">
                  {BANK_TRANSFER_CONFIG.supportApps}
                </span>
              </div>

              <div className="space-y-2 bg-[#FAF6F0] dark:bg-[#231E1B] p-3.5 rounded-2xl text-[12px] border border-[#E6DDD1] dark:border-[#362E2A]">
                <div className="flex justify-between">
                  <span className="text-[#786962] dark:text-[#B5A89F]">Ngân hàng:</span>
                  <span className="font-semibold text-[#322622] dark:text-[#F4EDE6]">
                    {BANK_TRANSFER_CONFIG.bankShortName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#786962] dark:text-[#B5A89F]">Chủ TK:</span>
                  <span className="font-semibold text-[#322622] dark:text-[#F4EDE6]">
                    {BANK_TRANSFER_CONFIG.accountHolder}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#786962] dark:text-[#B5A89F]">Số TK:</span>
                  <span className="font-mono font-bold text-[#B55841] dark:text-[#D47A63] tabular-nums">
                    {BANK_TRANSFER_CONFIG.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#786962] dark:text-[#B5A89F]">Nội dung CK:</span>
                  <span className="font-mono font-bold text-[#322622] dark:text-[#F4EDE6]">
                    {completedOrder.orderId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#786962] dark:text-[#B5A89F]">Số tiền:</span>
                  <span className="font-bold text-[#B55841] dark:text-[#D47A63] tabular-nums">
                    {formatCurrency(completedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onBack}
            className="w-full min-h-[48px] py-3.5 bg-[#B55841] hover:bg-[#9E4A35] text-white rounded-2xl font-semibold text-[14px] shadow-sm cursor-pointer transition-colors"
          >
            Quay lại cửa hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#FAF6F0] dark:bg-[#161311] overflow-y-auto no-scrollbar select-none">
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#322622] dark:bg-[#F4EDE6] text-white dark:text-[#161311] text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#8DA892] dark:text-[#4F6B56]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <div className="px-5 pt-3 pb-2.5 flex items-center justify-between border-b border-[#E6DDD1] dark:border-[#362E2A] sticky top-0 bg-[#FAF6F0]/95 dark:bg-[#161311]/95 backdrop-blur-md z-20">
        <button
          onClick={onBack}
          aria-label="Quay lại"
          className="w-9 h-9 rounded-full bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] shadow-xs flex items-center justify-center text-[#6B5D56] dark:text-[#C5B9B0] cursor-pointer hover:border-[#B55841] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <span className="font-editorial text-[16px] font-semibold text-[#322622] dark:text-[#F4EDE6] block leading-tight">
            Thông tin đặt hàng
          </span>
          <span className="text-[10.5px] text-[#786962] dark:text-[#B5A89F]">Địa chỉ & Xác nhận đơn</span>
        </div>
        <button
          onClick={handleOpenAddAddress}
          className="w-9 h-9 rounded-full bg-[#F7EAE5] dark:bg-[#35231E] border border-[#EBCDC2] dark:border-[#52352D] text-[#B55841] dark:text-[#D47A63] flex items-center justify-center cursor-pointer"
          title="Thêm địa chỉ mới"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="px-5 pt-4 pb-12 space-y-4 max-w-3xl mx-auto w-full">
        {/* SECTION 1: SHIPPING ADDRESS */}
        <div className="p-4 bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] nova-card-shadow space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#F7EAE5] dark:bg-[#35231E] flex items-center justify-center text-[#B55841] dark:text-[#D47A63]">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="font-editorial text-[14.5px] font-semibold text-[#322622] dark:text-[#F4EDE6]">
                Địa chỉ nhận hàng & Số điện thoại
              </span>
            </div>
            <button
              onClick={handleOpenAddAddress}
              className="text-[11.5px] font-semibold text-[#B55841] dark:text-[#D47A63] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Thêm mới</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {addresses.map((addr) => {
              const isSelected = addr.id === selectedAddressId;
              return (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-[#B55841] bg-[#F7EAE5]/50 dark:bg-[#35231E]'
                      : 'border-[#E6DDD1] dark:border-[#362E2A] bg-[#FAF6F0]/60 dark:bg-[#231E1B]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[13px] font-semibold text-[#322622] dark:text-[#F4EDE6]">
                          {addr.fullName}
                        </span>
                        <span className="text-[11.5px] font-mono text-[#786962] dark:text-[#B5A89F] flex items-center gap-1 tabular-nums">
                          <Phone className="w-3 h-3 text-[#B55841] dark:text-[#D47A63]" />
                          {addr.phone}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF1EC] dark:bg-[#1E2922] text-[#263E35] dark:text-[#8DA892] border border-[#C8D9CB] dark:border-[#33483A]">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-[11.5px] text-[#6B5D56] dark:text-[#C5B9B0] leading-relaxed">
                        {addr.streetAddress}, {addr.ward}, {addr.district}, {addr.province}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-[#B55841] border-[#B55841] text-white'
                            : 'border-[#D6CBC4] dark:border-[#493E38]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditAddress(addr);
                          }}
                          className="text-[10.5px] text-[#786962] dark:text-[#B5A89F] hover:text-[#B55841] dark:hover:text-[#D47A63] font-semibold cursor-pointer"
                        >
                          Sửa
                        </button>
                        {addresses.length > 1 && (
                          <button
                            onClick={(e) => handleDeleteAddress(addr.id, e)}
                            className="text-[#786962] dark:text-[#B5A89F] hover:text-[#B55841] p-0.5 cursor-pointer"
                            aria-label="Xóa địa chỉ"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="p-6 bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] text-center space-y-2.5">
            <Package className="w-9 h-9 mx-auto text-[#B55841] dark:text-[#D47A63] opacity-80" />
            <p className="font-editorial text-base font-semibold text-[#322622] dark:text-[#F4EDE6]">
              Giỏ hàng hiện đang trống
            </p>
            <p className="text-xs text-[#786962] dark:text-[#B5A89F]">
              Mẹ đã có thể lưu sẵn địa chỉ giao hàng ở trên, hoặc quay lại Cửa hàng để chọn sản phẩm.
            </p>
            <button
              onClick={onBack}
              className="mt-2 px-5 min-h-[44px] py-2 rounded-xl bg-[#B55841] hover:bg-[#9E4A35] text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              Về Cửa hàng Mẹ & Bé
            </button>
          </div>
        ) : (
          <>
            {/* SECTION 2: SHIPPING */}
            <div className="p-4 bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-2.5">
              <span className="font-editorial text-[14.5px] font-semibold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#4F6B56] dark:text-[#8DA892]" /> Phương thức giao hàng
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div
                  onClick={() => setShippingMethod('express')}
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-colors ${
                    shippingMethod === 'express'
                      ? 'border-[#B55841] bg-[#F7EAE5]/50 dark:bg-[#35231E]'
                      : 'border-[#E6DDD1] dark:border-[#362E2A] bg-[#FAF6F0]/60 dark:bg-[#231E1B]'
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6]">Hỏa tốc 2–4 giờ</p>
                    <p className="text-[10.5px] text-[#786962] dark:text-[#B5A89F]">Giao trong ngày</p>
                  </div>
                  <span className="text-xs font-bold text-[#B55841] dark:text-[#D47A63] tabular-nums">
                    {formatCurrency(shippingFees.express)}
                  </span>
                </div>
                <div
                  onClick={() => setShippingMethod('standard')}
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-colors ${
                    shippingMethod === 'standard'
                      ? 'border-[#B55841] bg-[#F7EAE5]/50 dark:bg-[#35231E]'
                      : 'border-[#E6DDD1] dark:border-[#362E2A] bg-[#FAF6F0]/60 dark:bg-[#231E1B]'
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6]">Tiêu chuẩn (1–2 ngày)</p>
                    <p className="text-[10.5px] text-[#786962] dark:text-[#B5A89F]">Freeship đơn từ 300k</p>
                  </div>
                  <span className="text-xs font-semibold text-[#4F6B56] dark:text-[#8DA892] tabular-nums">
                    {shippingFees.standard === 0 ? 'Miễn phí' : formatCurrency(shippingFees.standard)}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 3: NOTES */}
            <div className="p-4 bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-2.5">
              <span className="font-editorial text-[14.5px] font-semibold text-[#322622] dark:text-[#F4EDE6] block">
                Lời nhắn giao hàng
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickNotes.map((note) => (
                  <button
                    key={note}
                    type="button"
                    onClick={() => setDeliveryNote((prev) => (prev ? `${prev}, ${note}` : note))}
                    className="text-[10.5px] px-2.5 py-1 rounded-full bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-[#6B5D56] dark:text-[#C5B9B0] hover:border-[#B55841] transition-colors cursor-pointer"
                  >
                    {note}
                  </button>
                ))}
              </div>
              <textarea
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                rows={2}
                placeholder="Ghi chú cho người giao hàng..."
                className="w-full px-3 py-2.5 bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-[12px] text-[#322622] dark:text-[#F4EDE6] placeholder:text-[#786962] resize-none focus:outline-none focus:ring-2 focus:ring-[#B55841]/25"
              />
            </div>

            {/* SECTION 4: PRODUCTS */}
            <div className="p-4 bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-2.5">
              <span className="font-editorial text-[14.5px] font-semibold text-[#322622] dark:text-[#F4EDE6] block tabular-nums">
                Sản phẩm đặt mua ({cartItems.length})
              </span>
              <div className="space-y-2.5 divide-y divide-[#E6DDD1] dark:divide-[#362E2A]">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="pt-2.5 first:pt-0 flex items-center gap-3">
                    <NovaImage
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 bg-[#F2ECE3] dark:bg-[#231E1B]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[12.5px] font-semibold text-[#322622] dark:text-[#F4EDE6] truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[12px] font-bold text-[#B55841] dark:text-[#D47A63] tabular-nums">
                        {item.product.formattedPrice}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl px-2.5 py-1.5 text-[#322622] dark:text-[#F4EDE6]">
                      <button
                        onClick={() => handleQuantityChange(item.product.id, -1)}
                        className="px-1 font-bold text-xs cursor-pointer hover:text-[#B55841]"
                        aria-label="Giảm số lượng"
                      >
                        -
                      </button>
                      <span className="text-xs font-semibold tabular-nums">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.product.id, 1)}
                        className="px-1 font-bold text-xs cursor-pointer hover:text-[#B55841]"
                        aria-label="Tăng số lượng"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 5: COUPON */}
            <div className="p-4 bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-2.5">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#B55841] dark:text-[#D47A63]" />
                <span className="font-editorial text-[14px] font-semibold text-[#322622] dark:text-[#F4EDE6]">
                  Mã giảm giá (MEBAU2026 / NOVAVIP / BESOSINH)
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã giảm giá..."
                  className="flex-1 min-h-[44px] px-3 py-2 bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-[12px] font-mono text-[#322622] dark:text-[#F4EDE6] placeholder:text-[#786962] focus:outline-none focus:ring-2 focus:ring-[#B55841]/25"
                />
                <button
                  onClick={handleApplyVoucher}
                  className="px-4 min-h-[44px] py-2 bg-[#322622] dark:bg-[#B55841] hover:opacity-90 text-white text-[12px] font-semibold rounded-xl cursor-pointer transition-opacity whitespace-nowrap"
                >
                  Áp dụng
                </button>
              </div>
              {voucherMessage && (
                <p
                  className={`text-[11px] font-medium ${
                    voucherApplied ? 'text-[#4F6B56] dark:text-[#8DA892]' : 'text-[#B55841] dark:text-[#D47A63]'
                  }`}
                >
                  {voucherMessage}
                </p>
              )}
            </div>

            {/* SECTION 6: PAYMENT METHOD */}
            <div className="p-4 bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-2.5">
              <span className="font-editorial text-[14.5px] font-semibold text-[#322622] dark:text-[#F4EDE6] block">
                Phương thức thanh toán
              </span>

              <div className="space-y-2">
                {/* COD */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-colors ${
                    paymentMethod === 'cod'
                      ? 'border-[#B55841] bg-[#F7EAE5]/50 dark:bg-[#35231E]'
                      : 'border-[#E6DDD1] dark:border-[#362E2A] bg-[#FAF6F0]/60 dark:bg-[#231E1B]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#EBF1EC] dark:bg-[#1E2922] flex items-center justify-center text-[#4F6B56] dark:text-[#8DA892] shrink-0">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[12.5px] font-semibold text-[#322622] dark:text-[#F4EDE6] block">
                        Thanh toán khi nhận hàng (COD)
                      </span>
                      <p className="text-[10.5px] text-[#786962] dark:text-[#B5A89F]">
                        Trạng thái: Chờ xác nhận · Trả tiền khi nhận hàng
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border shrink-0 ${
                      paymentMethod === 'cod'
                        ? 'border-[#B55841] bg-[#B55841]'
                        : 'border-[#D6CBC4] dark:border-[#493E38]'
                    }`}
                  />
                </div>

                {/* VietQR */}
                <div
                  onClick={() => setPaymentMethod('vietqr')}
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-colors ${
                    paymentMethod === 'vietqr'
                      ? 'border-[#B55841] bg-[#F7EAE5]/50 dark:bg-[#35231E]'
                      : 'border-[#E6DDD1] dark:border-[#362E2A] bg-[#FAF6F0]/60 dark:bg-[#231E1B]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#F6EFE2] dark:bg-[#2F281C] flex items-center justify-center text-[#9E5B3B] dark:text-[#D7BA86] shrink-0">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[12.5px] font-semibold text-[#322622] dark:text-[#F4EDE6] block">
                        Chuyển khoản VietQR (Chờ đối soát)
                      </span>
                      <p className="text-[10.5px] text-[#786962] dark:text-[#B5A89F]">
                        Hiển thị QR chuyển khoản; đơn chuyển xác nhận sau khi đối soát
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border shrink-0 ${
                      paymentMethod === 'vietqr'
                        ? 'border-[#B55841] bg-[#B55841]'
                        : 'border-[#D6CBC4] dark:border-[#493E38]'
                    }`}
                  />
                </div>

                {/* Unconfigured Online Gateways (MoMo / Card) */}
                <div className="p-3 rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] bg-[#F2ECE3]/70 dark:bg-[#231E1B] opacity-70 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#F7EAE5] dark:bg-[#35231E] flex items-center justify-center text-[#B55841] dark:text-[#D47A63] font-semibold text-[10px] shrink-0">
                      Online
                    </div>
                    <div className="min-w-0">
                      <span className="text-[12px] font-semibold text-[#322622] dark:text-[#F4EDE6] block">
                        Ví MoMo / Thẻ Quốc tế
                      </span>
                      <p className="text-[10.5px] text-[#B55841] dark:text-[#D47A63] truncate">
                        Chưa kích hoạt (thiếu PAYMENT_GATEWAY_SECRET_KEY trên máy chủ)
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] text-[#786962] dark:text-[#B5A89F] shrink-0">
                    Chưa bật
                  </span>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="p-3 rounded-2xl bg-[#F7EAE5] dark:bg-[#35231E] border border-[#EBCDC2] dark:border-[#52352D] text-xs text-[#B55841] dark:text-[#D47A63] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* SECTION 7: SUMMARY */}
            <div className="p-4 bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] nova-card-shadow space-y-2 text-[12px]">
              <div className="flex justify-between text-[#786962] dark:text-[#B5A89F]">
                <span>Tổng tiền hàng:</span>
                <span className="font-semibold text-[#322622] dark:text-[#F4EDE6] tabular-nums">
                  {formatCurrency(rawSubtotal)}
                </span>
              </div>
              <div className="flex justify-between text-[#786962] dark:text-[#B5A89F]">
                <span>Phí vận chuyển:</span>
                <span className="font-semibold text-[#322622] dark:text-[#F4EDE6] tabular-nums">
                  {currentShippingFee === 0 ? 'Miễn phí' : formatCurrency(currentShippingFee)}
                </span>
              </div>
              {vipDiscount > 0 && (
                <div className="flex justify-between text-[#9E5B3B] dark:text-[#D7BA86] font-semibold tabular-nums">
                  <span>Đặc quyền VIP (-10%):</span>
                  <span>-{formatCurrency(vipDiscount)}</span>
                </div>
              )}
              {voucherApplied && (
                <div className="flex justify-between text-[#4F6B56] dark:text-[#8DA892] font-semibold tabular-nums">
                  <span>Mã giảm giá ({voucherCode}):</span>
                  <span>-{formatCurrency(voucherDiscount)}</span>
                </div>
              )}
              <div className="pt-2.5 border-t border-[#E6DDD1] dark:border-[#362E2A] flex justify-between items-baseline">
                <span className="text-[13.5px] font-semibold text-[#322622] dark:text-[#F4EDE6]">
                  Tổng thanh toán:
                </span>
                <span className="text-[18px] font-bold text-[#B55841] dark:text-[#D47A63] tabular-nums">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmOrder}
                disabled={isSubmitting}
                className="w-full min-h-[50px] py-4 bg-[#B55841] hover:bg-[#9E4A35] text-white rounded-2xl text-[15px] font-semibold shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {isSubmitting ? (
                  <span>Đang gửi đơn hàng...</span>
                ) : (
                  <>
                    <span className="tabular-nums">Xác nhận đặt hàng · {formatCurrency(totalAmount)}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          </>
        )}
      </div>

      {/* MODAL: ADD / EDIT SHIPPING ADDRESS */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-full max-w-[430px] bg-[#FAF6F0] dark:bg-[#161311] rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-[#E6DDD1] dark:border-[#362E2A]"
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-between">
                <div>
                  <h3 className="font-editorial text-[16px] font-semibold text-[#322622] dark:text-[#F4EDE6]">
                    {editingAddressId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ giao hàng'}
                  </h3>
                  <p className="text-[11px] text-[#786962] dark:text-[#B5A89F]">Thông tin nhận hàng của mẹ</p>
                </div>
                <button
                  onClick={() => setIsAddressModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-center text-[#786962] dark:text-[#B5A89F] hover:text-[#322622] dark:hover:text-[#F4EDE6] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form Body */}
              <div className="p-5 overflow-y-auto space-y-3.5 text-[12.5px]">
                {formPhoneError && (
                  <div className="p-3 bg-[#F7EAE5] dark:bg-[#35231E] border border-[#EBCDC2] dark:border-[#52352D] rounded-xl text-[#B55841] dark:text-[#D47A63] text-[11.5px] flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formPhoneError}</span>
                  </div>
                )}

                {/* Recipient Full Name */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#6B5D56] dark:text-[#C5B9B0] mb-1">
                    Họ và tên người nhận <span className="text-[#B55841] dark:text-[#D47A63]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#786962] dark:text-[#B5A89F] absolute left-3 top-3" />
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Khánh Băng"
                      className="w-full min-h-[42px] pl-9 pr-3 py-2.5 bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-[13px] text-[#322622] dark:text-[#F4EDE6] placeholder:text-[#786962] focus:outline-none focus:border-[#B55841]"
                    />
                  </div>
                </div>

                {/* Recipient Phone Number */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#6B5D56] dark:text-[#C5B9B0] mb-1">
                    Số điện thoại nhận hàng <span className="text-[#B55841] dark:text-[#D47A63]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#786962] dark:text-[#B5A89F] absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="0987 654 321"
                      className="w-full min-h-[42px] pl-9 pr-3 py-2.5 bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-[13px] font-mono text-[#322622] dark:text-[#F4EDE6] placeholder:text-[#786962] focus:outline-none focus:border-[#B55841]"
                    />
                  </div>
                </div>

                {/* Province / City */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#6B5D56] dark:text-[#C5B9B0] mb-1">
                    Tỉnh / Thành phố <span className="text-[#B55841] dark:text-[#D47A63]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formProvince}
                      onChange={(e) => {
                        const newProv = e.target.value;
                        setFormProvince(newProv);
                        const provObj = VIETNAM_PROVINCES.find((p) => p.name === newProv);
                        if (provObj && provObj.districts.length > 0) {
                          setFormDistrict(provObj.districts[0].name);
                          setFormWard(provObj.districts[0].wards[0] || '');
                        }
                      }}
                      className="w-full min-h-[42px] px-3 py-2.5 bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-[13px] text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841] appearance-none"
                    >
                      {VIETNAM_PROVINCES.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#786962] dark:text-[#B5A89F] absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* District & Ward Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#6B5D56] dark:text-[#C5B9B0] mb-1">
                      Quận / Huyện <span className="text-[#B55841] dark:text-[#D47A63]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formDistrict}
                        onChange={(e) => {
                          const newDist = e.target.value;
                          setFormDistrict(newDist);
                          const provObj = VIETNAM_PROVINCES.find((p) => p.name === formProvince);
                          const distObj = provObj?.districts.find((d) => d.name === newDist);
                          if (distObj && distObj.wards.length > 0) {
                            setFormWard(distObj.wards[0]);
                          }
                        }}
                        className="w-full min-h-[42px] px-3 py-2.5 bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-[12.5px] text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841] appearance-none"
                      >
                        {VIETNAM_PROVINCES.find((p) => p.name === formProvince)?.districts.map((d) => (
                          <option key={d.name} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#786962] dark:text-[#B5A89F] absolute right-2.5 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#6B5D56] dark:text-[#C5B9B0] mb-1">
                      Phường / Xã <span className="text-[#B55841] dark:text-[#D47A63]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formWard}
                        onChange={(e) => setFormWard(e.target.value)}
                        className="w-full min-h-[42px] px-3 py-2.5 bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-[12.5px] text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841] appearance-none"
                      >
                        {VIETNAM_PROVINCES.find((p) => p.name === formProvince)
                          ?.districts.find((d) => d.name === formDistrict)
                          ?.wards.map((w) => (
                            <option key={w} value={w}>
                              {w}
                            </option>
                          ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#786962] dark:text-[#B5A89F] absolute right-2.5 top-3.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Street Address Details */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#6B5D56] dark:text-[#C5B9B0] mb-1">
                    Địa chỉ chi tiết (Số nhà, tên tòa nhà, tên đường) <span className="text-[#B55841] dark:text-[#D47A63]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formStreet}
                    onChange={(e) => setFormStreet(e.target.value)}
                    placeholder="Ví dụ: 142 Nguyễn Thị Minh Khai, Tòa nhà Rosana, Căn hộ 502"
                    className="w-full min-h-[42px] px-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-[13px] text-[#322622] dark:text-[#F4EDE6] placeholder:text-[#786962] focus:outline-none focus:border-[#B55841]"
                  />
                </div>

                {/* Address Label Tags */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#6B5D56] dark:text-[#C5B9B0] mb-1.5">
                    Loại địa chỉ
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Nhà riêng', icon: HomeIcon },
                      { label: 'Văn phòng', icon: Building },
                      { label: 'Nhà người thân', icon: User },
                    ].map(({ label, icon: Icon }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setFormLabel(label as any)}
                        className={`py-2.5 px-2 rounded-xl border flex items-center justify-center gap-1.5 text-[11.5px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                          formLabel === label
                            ? 'bg-[#B55841] text-white border-[#B55841]'
                            : 'bg-[#FFFFFF] dark:bg-[#1E1A17] text-[#6B5D56] dark:text-[#C5B9B0] border-[#E6DDD1] dark:border-[#362E2A] hover:bg-[#F2ECE3] dark:hover:bg-[#231E1B]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Set Default Address Toggle */}
                <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formIsDefault}
                    onChange={(e) => setFormIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded text-[#B55841] accent-[#B55841] cursor-pointer"
                  />
                  <span className="text-[12px] font-medium text-[#322622] dark:text-[#F4EDE6]">
                    Đặt làm địa chỉ nhận hàng mặc định
                  </span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[#E6DDD1] dark:border-[#362E2A] flex gap-2.5 bg-[#FFFFFF] dark:bg-[#1E1A17]">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 min-h-[44px] py-3 border border-[#E6DDD1] dark:border-[#362E2A] text-[#6B5D56] dark:text-[#C5B9B0] rounded-2xl text-[13px] font-semibold hover:bg-[#F2ECE3] dark:hover:bg-[#231E1B] transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSaveAddress}
                  className="flex-1 min-h-[44px] py-3 bg-[#B55841] hover:bg-[#9E4A35] text-white rounded-2xl text-[13px] font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  Lưu địa chỉ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
