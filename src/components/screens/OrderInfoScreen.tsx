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
import { VIETNAM_PROVINCES, PRODUCTS_DATA } from '../../data/mockData';
import { BANK_TRANSFER_CONFIG } from '../../data/bankTransferConfig';
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
  onNavigateToPayment,
  onOrderSuccess,
  onUpdateUserAddresses,
  onUpdateCart,
}) => {
  // If cart is empty, provide default test products so user can preview and test ordering immediately
  const fallbackProducts: CartItem[] = [
    { product: PRODUCTS_DATA[0], quantity: 1 },
    { product: PRODUCTS_DATA[2], quantity: 1 },
  ];

  const [cartItems, setCartItems] = useState<CartItem[]>(
    initialCartItems && initialCartItems.length > 0 ? initialCartItems : fallbackProducts
  );

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

  // Modal to add or edit address
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Address form inputs
  const [formName, setFormName] = useState(user.name || '');
  const [formPhone, setFormPhone] = useState(user.phone || '');
  const [formProvince, setFormProvince] = useState('TP. Hồ Chí Minh');
  const [formDistrict, setFormDistrict] = useState('Quận 3');
  const [formWard, setFormWard] = useState('Phường Võ Thị Sáu');
  const [formStreet, setFormStreet] = useState('');
  const [formLabel, setFormLabel] = useState<'Nhà riêng' | 'Văn phòng' | 'Nhà người thân' | 'Khác'>('Nhà riêng');
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formPhoneError, setFormPhoneError] = useState('');

  // Shipping Method: 'express' | 'standard' | 'economy'
  const [shippingMethod, setShippingMethod] = useState<'express' | 'standard' | 'economy'>('standard');

  // Delivery Notes
  const [deliveryNote, setDeliveryNote] = useState('');
  const quickNotes = [
    '🔔 Gọi trước 15p, không bấm chuông bé ngủ',
    '🏢 Gửi bảo vệ / lễ tân nếu mẹ vắng',
    '📦 Cho xem hàng trước khi nhận',
    '⏰ Giao vào giờ hành chính',
  ];

  // Voucher
  const [voucherCode, setVoucherCode] = useState('MEBAU2026');
  const [voucherApplied, setVoucherApplied] = useState(true);
  const [voucherDiscount, setVoucherDiscount] = useState(50000);
  const [voucherMessage, setVoucherMessage] = useState('Đã áp dụng mã MEBAU2026 (-50.000đ)');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vietqr' | 'momo' | 'card'>('cod');

  // Order Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderInfo | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Selected address object
  const activeAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  // Calculations
  const rawSubtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  // VIP discount on products (10%)
  const vipDiscount = user.isVip ? Math.round(rawSubtotal * 0.1) : 0;

  // Shipping fees
  const shippingFees = {
    express: user.isVip ? 15000 : 40000,
    standard: rawSubtotal >= 300000 ? 0 : 25000,
    economy: 0,
  };

  const currentShippingFee = shippingFees[shippingMethod];
  const totalDiscount = (voucherApplied ? voucherDiscount : 0) + vipDiscount;
  const totalAmount = Math.max(0, rawSubtotal + currentShippingFee - totalDiscount);

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + ' đ';

  // Handle open address modal for create or edit
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

  // Validate and save address
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
      // Edit existing
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
      // Create new
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

  // Delete address
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

  // Quantity updates
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

  // Voucher apply
  const handleApplyVoucher = () => {
    const code = voucherCode.trim().toUpperCase();
    if (code === 'MEBAU2026') {
      setVoucherDiscount(50000);
      setVoucherApplied(true);
      setVoucherMessage('Đã áp dụng mã MEBAU2026: Giảm 50.000đ!');
      showToast('Đã áp dụng mã giảm giá 50.000đ!');
    } else if (code === 'FREESHIP') {
      setVoucherDiscount(currentShippingFee);
      setVoucherApplied(true);
      setVoucherMessage('Đã áp dụng mã FREESHIP: Miễn phí vận chuyển!');
      showToast('Đã miễn phí vận chuyển!');
    } else if (code === 'NOVAVIP') {
      const discount = Math.round(rawSubtotal * 0.15);
      setVoucherDiscount(discount);
      setVoucherApplied(true);
      setVoucherMessage('Đã áp dụng mã NOVAVIP: Giảm 15% đơn hàng!');
      showToast('Đã áp dụng mã NOVAVIP: Giảm 15%!');
    } else {
      setVoucherApplied(false);
      setVoucherDiscount(0);
      setVoucherMessage('Mã giảm giá không hợp lệ hoặc đã hết hạn');
      showToast('Mã không hợp lệ');
    }
  };

  // Order submission
  const handleConfirmOrder = () => {
    if (!activeAddress) {
      showToast('Vui lòng chọn hoặc thêm địa chỉ nhận hàng!');
      return;
    }
    if (cartItems.length === 0) {
      showToast('Giỏ hàng chưa có sản phẩm nào!');
      return;
    }

    const orderId = `NOVA-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: OrderInfo = {
      orderId,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' · ' + new Date().toLocaleDateString('vi-VN'),
      items: cartItems,
      shippingAddress: activeAddress,
      shippingMethod,
      shippingFee: currentShippingFee,
      subtotal: rawSubtotal,
      discountAmount: totalDiscount,
      voucherCode: voucherApplied ? voucherCode : undefined,
      totalAmount,
      paymentMethod,
      deliveryNote: deliveryNote || activeAddress.deliveryNote,
      status: 'confirmed',
      estimatedDeliveryDate: shippingMethod === 'express' ? 'Hôm nay trong 2-4 giờ' : '17 - 18 Tháng 10, 2026',
    };

    // If online payment, user can jump to VietQR / Payment screen
    if (paymentMethod === 'vietqr' || paymentMethod === 'momo' || paymentMethod === 'card') {
      if (onNavigateToPayment) {
        onNavigateToPayment(newOrder);
        return;
      }
    }

    // COD or direct confirmation
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setCompletedOrder(newOrder);
      onOrderSuccess?.(newOrder);

      // Trigger pleasant celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C84B4B', '#F39C12', '#2ECC71', '#D4AF37'],
        });
      } catch {
        // Safe fallback
      }
    }, 1200);
  };

  // Render completed order screen
  if (completedOrder) {
    return (
      <div className="flex-1 flex flex-col bg-[#FFFBF7] overflow-y-auto no-scrollbar select-none">
        {/* Top Header */}
        <div className="px-5 pt-3 pb-2.5 flex items-center justify-between border-b border-[#F0ECE6]/60 sticky top-0 bg-[#FFFBF7]/95 backdrop-blur-md z-20">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white border border-[#EFEAE5] shadow-xs flex items-center justify-center text-[#5E4E49] hover:bg-[#F5EFEB] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-[14px] font-bold text-[#3A2E2B]">Đặt hàng thành công</span>
          <div className="w-9" />
        </div>

        <div className="px-5 pt-5 pb-10 space-y-4">
          {/* Success Hero Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-5 bg-gradient-to-b from-[#FAF4ED] to-white rounded-3xl border border-[#EFEAE5] shadow-sm text-center flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#E8F8F0] border-2 border-[#2ECC71]/30 flex items-center justify-center text-[#2ECC71] shadow-inner mb-3">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <span className="text-[11px] font-black tracking-wider text-[#2ECC71] bg-[#E8F8F0] px-3 py-0.5 rounded-full uppercase mb-1">
              Đơn hàng đã được xác nhận
            </span>
            <h2 className="text-[18px] font-extrabold text-[#3A2E2B]">
              Cảm ơn mẹ {completedOrder.shippingAddress.fullName}!
            </h2>
            <p className="text-[12px] text-[#8C7B75] mt-1 max-w-[280px]">
              Nova Care đang chuẩn bị những sản phẩm tinh tế, an toàn nhất gửi đến mẹ và bé yêu.
            </p>

            {/* Order Tracking Code Chip */}
            <div className="mt-4 px-4 py-2 bg-white rounded-2xl border border-[#E8DFD5] flex items-center gap-2 shadow-xs">
              <span className="text-[11.5px] text-[#8C7B75]">Mã vận đơn:</span>
              <span className="text-[14px] font-mono font-black text-[#C84B4B]">{completedOrder.orderId}</span>
              <button
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(completedOrder.orderId);
                    showToast('Đã sao chép mã đơn hàng!');
                  } catch {
                    showToast('Đã sao chép mã đơn hàng!');
                  }
                }}
                className="text-[#8C7B75] hover:text-[#C84B4B] p-1 cursor-pointer"
                title="Sao chép"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* Delivery Timeline Status */}
          <div className="p-4 bg-white rounded-2xl border border-[#EFEAE5] shadow-xs space-y-3">
            <div className="flex items-center justify-between text-[12.5px] font-bold text-[#3A2E2B]">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#C84B4B]" />
                Trạng thái vận chuyển
              </span>
              <span className="text-[11px] font-semibold text-[#2ECC71]">
                {completedOrder.estimatedDeliveryDate}
              </span>
            </div>

            <div className="relative pl-6 space-y-3.5 text-[12px] before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EFEAE5]">
              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-[#2ECC71] ring-4 ring-[#E8F8F0]" />
                <p className="font-bold text-[#3A2E2B]">Đặt hàng thành công</p>
                <p className="text-[10.5px] text-[#8C7B75]">{completedOrder.createdAt}</p>
              </div>
              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-[#F39C12] ring-4 ring-[#FEF5E7]" />
                <p className="font-bold text-[#3A2E2B]">Đang đóng gói khử khuẩn & chuẩn bị hàng</p>
                <p className="text-[10.5px] text-[#8C7B75]">Đội ngũ dược sĩ Nova kiểm duyệt chất lượng</p>
              </div>
              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-[#D5CDC5]" />
                <p className="font-medium text-[#8C7B75]">Bàn giao cho tài xế {completedOrder.shippingMethod === 'express' ? 'Hỏa Tốc' : 'Nhanh'}</p>
              </div>
              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-[#D5CDC5]" />
                <p className="font-medium text-[#8C7B75]">Giao tận tay mẹ bầu an toàn</p>
              </div>
            </div>
          </div>

          {/* Recipient & Address Details */}
          <div className="p-4 bg-white rounded-2xl border border-[#EFEAE5] shadow-xs space-y-2 text-[12px]">
            <h4 className="font-extrabold text-[#3A2E2B] text-[13px] flex items-center gap-1.5 pb-1 border-b border-[#F5EFEB]">
              <MapPin className="w-4 h-4 text-[#C84B4B]" />
              Địa chỉ nhận hàng chi tiết
            </h4>
            <div className="space-y-1 text-[#5E4E49]">
              <div className="flex items-center justify-between">
                <span className="text-[#8C7B75]">Người nhận:</span>
                <span className="font-bold text-[#3A2E2B]">{completedOrder.shippingAddress.fullName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8C7B75]">Số điện thoại:</span>
                <span className="font-mono font-bold text-[#3A2E2B]">{completedOrder.shippingAddress.phone}</span>
              </div>
              <div className="pt-1 text-[#3A2E2B] font-medium leading-relaxed">
                {completedOrder.shippingAddress.streetAddress}, {completedOrder.shippingAddress.ward}, {completedOrder.shippingAddress.district}, {completedOrder.shippingAddress.province}
              </div>
              {completedOrder.deliveryNote && (
                <div className="mt-2 p-2.5 bg-[#FFF9F5] border border-[#F5DFD5] rounded-xl text-[11px] text-[#A0522D] flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#C84B4B]" />
                  <span><strong>Ghi chú tài xế:</strong> {completedOrder.deliveryNote}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method & Total */}
          <div className="p-4 bg-white rounded-2xl border border-[#EFEAE5] shadow-xs space-y-2 text-[12px]">
            <div className="flex justify-between items-center">
              <span className="text-[#8C7B75]">Phương thức thanh toán:</span>
              <span className="font-bold text-[#3A2E2B] uppercase">
                {completedOrder.paymentMethod === 'cod'
                  ? 'Thanh toán tiền mặt khi nhận hàng (COD)'
                  : completedOrder.paymentMethod === 'vietqr'
                  ? 'Chuyển khoản VietQR'
                  : completedOrder.paymentMethod === 'momo'
                  ? 'Ví MoMo'
                  : 'Thẻ Quốc tế'}
              </span>
            </div>
            <div className="flex justify-between items-center text-[13px] pt-1 border-t border-[#F5EFEB]">
              <span className="font-bold text-[#3A2E2B]">Tổng thanh toán:</span>
              <span className="font-black text-[#C84B4B] text-[16px]">
                {formatCurrency(completedOrder.totalAmount)}
              </span>
            </div>
          </div>

          {/* VietQR Agribank transfer instructions if VietQR selected */}
          {completedOrder.paymentMethod === 'vietqr' && (
            <div className="p-4 bg-white rounded-3xl border border-[#E8DFD5] shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#F5EFEB] pb-2">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#C84B4B]" />
                  <span className="text-[13px] font-bold text-[#3A2E2B]">Mã VietQR thanh toán</span>
                </div>
                <span className="text-[11px] font-bold text-[#2ECC71] bg-[#E8F8F0] px-2 py-0.5 rounded-full">
                  Napas 247
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="p-2 bg-white border border-[#EAE3DC] rounded-2xl shadow-xs max-w-[240px]">
                  <img
                    src={BANK_TRANSFER_CONFIG.qrImageUrl}
                    alt="Mã VietQR Agribank Bùi Quốc Thịnh"
                    className="w-52 h-auto object-contain rounded-xl"
                  />
                </div>
                <span className="text-[11px] text-[#8C7B75] mt-1.5 font-medium text-center">
                  {BANK_TRANSFER_CONFIG.supportApps}
                </span>
              </div>

              <div className="space-y-2 bg-[#FBF8F5] p-3 rounded-2xl text-[12px] border border-[#F0EAE5]">
                <div className="flex items-center justify-between">
                  <span className="text-[#8C7B75]">Ngân hàng:</span>
                  <span className="font-extrabold text-[#3A2E2B] text-right">
                    {BANK_TRANSFER_CONFIG.bankShortName} ({BANK_TRANSFER_CONFIG.branch})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8C7B75]">Chủ tài khoản:</span>
                  <span className="font-extrabold text-[#3A2E2B]">{BANK_TRANSFER_CONFIG.accountHolder}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8C7B75]">Số tài khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-[#C84B4B] text-[14px]">
                      {BANK_TRANSFER_CONFIG.accountNumber}
                    </span>
                    <button
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(BANK_TRANSFER_CONFIG.accountNumber);
                          showToast('Đã sao chép số tài khoản!');
                        } catch {
                          showToast('Đã sao chép số tài khoản!');
                        }
                      }}
                      className="p-1 hover:bg-white rounded-md text-[#5E4E49] transition-colors cursor-pointer"
                      title="Sao chép STK"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#C84B4B]" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8C7B75]">Nội dung CK:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-[#3A2E2B]">
                      {completedOrder.orderId}
                    </span>
                    <button
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(completedOrder.orderId);
                          showToast('Đã sao chép nội dung chuyển khoản!');
                        } catch {
                          showToast('Đã sao chép nội dung chuyển khoản!');
                        }
                      }}
                      className="p-1 hover:bg-white rounded-md text-[#5E4E49] transition-colors cursor-pointer"
                      title="Sao chép nội dung"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={onBack}
              className="w-full py-3.5 bg-[#C84B4B] hover:bg-[#B84040] text-white rounded-2xl font-bold text-[14px] shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Về màn hình chính</span>
            </button>
            <div className="text-center text-[11px] text-[#8C7B75] flex items-center justify-center gap-1">
              <Phone className="w-3 h-3 text-[#C84B4B]" />
              <span>Cần trợ giúp đơn hàng? Hotline Nova: <strong>1900 8899</strong></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#FFFBF7] overflow-y-auto no-scrollbar select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#3A2E2B] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#2ECC71]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <div className="px-5 pt-3 pb-2.5 flex items-center justify-between border-b border-[#F0ECE6]/60 sticky top-0 bg-[#FFFBF7]/95 backdrop-blur-md z-20">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white border border-[#EFEAE5] shadow-xs flex items-center justify-center text-[#5E4E49] hover:bg-[#F5EFEB] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <span className="text-[14px] font-bold text-[#3A2E2B] block">Thông tin đặt hàng</span>
          <span className="text-[10px] text-[#8C7B75]">Địa chỉ & Vận chuyển</span>
        </div>
        <button
          onClick={handleOpenAddAddress}
          className="w-9 h-9 rounded-full bg-[#FFF2EE] text-[#C84B4B] flex items-center justify-center hover:bg-[#FFE4DD] transition-colors cursor-pointer"
          title="Thêm địa chỉ mới"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="px-5 pt-4 pb-12 space-y-4">
        {/* SECTION 1: SHIPPING ADDRESS & PHONE NUMBER (Core requirement) */}
        <div className="p-4 bg-white rounded-3xl border border-[#EFEAE5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FCEEEB] flex items-center justify-center text-[#C84B4B]">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-[13.5px] font-extrabold text-[#3A2E2B]">
                Địa chỉ nhận hàng & Số điện thoại
              </span>
            </div>
            <button
              onClick={handleOpenAddAddress}
              className="text-[11.5px] font-bold text-[#C84B4B] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Thêm mới</span>
            </button>
          </div>

          {/* Saved Addresses List / Selector */}
          <div className="space-y-2.5">
            {addresses.map((addr) => {
              const isSelected = addr.id === selectedAddressId;
              return (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-[#C84B4B] bg-[#FFFBF9] shadow-xs'
                      : 'border-[#EFEAE5] bg-white hover:border-[#D5CDC5]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[13px] font-bold text-[#3A2E2B]">{addr.fullName}</span>
                        <span className="text-[11.5px] font-mono text-[#8C7B75] flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#C84B4B]" />
                          {addr.phone}
                        </span>
                        {addr.label && (
                          <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[#F5EFEB] text-[#5E4E49]">
                            {addr.label === 'Nhà riêng' ? '🏠 Nhà riêng' : addr.label === 'Văn phòng' ? '🏢 Văn phòng' : '📍 ' + addr.label}
                          </span>
                        )}
                        {addr.isDefault && (
                          <span className="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#E8F8F0] text-[#2ECC71]">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-[11.5px] text-[#5E4E49] leading-relaxed">
                        {addr.streetAddress}, {addr.ward}, {addr.district}, {addr.province}
                      </p>
                      {addr.deliveryNote && (
                        <p className="text-[10.5px] text-[#8C7B75] italic mt-1 flex items-center gap-1">
                          <Info className="w-3 h-3 text-[#C84B4B] shrink-0" />
                          <span>{addr.deliveryNote}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-[#C84B4B] border-[#C84B4B] text-white'
                            : 'border-[#D5CDC5] bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditAddress(addr);
                          }}
                          className="text-[10.5px] text-[#8C7B75] hover:text-[#C84B4B] px-1 py-0.5 font-semibold cursor-pointer"
                        >
                          Sửa
                        </button>
                        {addresses.length > 1 && (
                          <button
                            onClick={(e) => handleDeleteAddress(addr.id, e)}
                            className="text-[10.5px] text-[#A89A93] hover:text-red-500 p-0.5 cursor-pointer"
                            title="Xóa địa chỉ"
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

        {/* SECTION 2: SHIPPING CARRIER & TIME */}
        <div className="p-4 bg-white rounded-3xl border border-[#EFEAE5] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#EBF5FB] flex items-center justify-center text-[#2980B9]">
              <Truck className="w-4 h-4" />
            </div>
            <span className="text-[13.5px] font-extrabold text-[#3A2E2B]">
              Phương thức giao hàng
            </span>
          </div>

          <div className="space-y-2">
            {/* Express */}
            <div
              onClick={() => setShippingMethod('express')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                shippingMethod === 'express'
                  ? 'border-[#C84B4B] bg-[#FFFBF9]'
                  : 'border-[#EFEAE5] bg-white hover:border-[#D5CDC5]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FEF5E7] flex items-center justify-center text-[#D35400]">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12.5px] font-bold text-[#3A2E2B]">Hỏa Tốc 2 - 4 Giờ</span>
                    <span className="text-[9.5px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#FCEEEB] text-[#C84B4B]">
                      Cần gấp
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8C7B75]">Nhận ngay hôm nay · Tài xế bảo quản chuẩn y tế</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[13px] font-bold text-[#C84B4B]">
                  {formatCurrency(shippingFees.express)}
                </span>
                {user.isVip && (
                  <span className="text-[9.5px] text-[#8C7B75] line-through block">40.000 đ</span>
                )}
              </div>
            </div>

            {/* Standard */}
            <div
              onClick={() => setShippingMethod('standard')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                shippingMethod === 'standard'
                  ? 'border-[#C84B4B] bg-[#FFFBF9]'
                  : 'border-[#EFEAE5] bg-white hover:border-[#D5CDC5]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E8F8F0] flex items-center justify-center text-[#2ECC71]">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12.5px] font-bold text-[#3A2E2B]">Nhanh Tiêu Chuẩn (1 - 2 ngày)</span>
                    {rawSubtotal >= 300000 && (
                      <span className="text-[9.5px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#E8F8F0] text-[#2ECC71]">
                        Freeship
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#8C7B75]">Dự kiến nhận 17 - 18 Tháng 10</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[13px] font-bold text-[#3A2E2B]">
                  {shippingFees.standard === 0 ? 'Miễn phí' : formatCurrency(shippingFees.standard)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: DRIVER & SHOP DELIVERY NOTES */}
        <div className="p-4 bg-white rounded-3xl border border-[#EFEAE5] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FEF9E7] flex items-center justify-center text-[#F39C12]">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[13.5px] font-extrabold text-[#3A2E2B]">
                Lời nhắn cho Shipper & Shop
              </span>
            </div>
            <span className="text-[10px] text-[#8C7B75]">Tùy chọn</span>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5">
            {quickNotes.map((note) => (
              <button
                key={note}
                type="button"
                onClick={() => setDeliveryNote((prev) => (prev ? `${prev}, ${note}` : note))}
                className="text-[10.5px] font-medium px-2.5 py-1 rounded-full bg-[#F9F6F2] hover:bg-[#F2ECE4] text-[#5E4E49] border border-[#E8DFD5] transition-colors cursor-pointer"
              >
                {note}
              </button>
            ))}
          </div>

          <textarea
            value={deliveryNote}
            onChange={(e) => setDeliveryNote(e.target.value)}
            rows={2}
            placeholder="Ví dụ: Gọi trước 15 phút, gửi lễ tân nếu mẹ đang nghỉ ngơi..."
            className="w-full px-3 py-2 bg-[#F9F6F2] border border-[#E8DFD5] rounded-xl text-[12px] text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B] resize-none"
          />
        </div>

        {/* SECTION 4: ORDER PRODUCTS REVIEW */}
        <div className="p-4 bg-white rounded-3xl border border-[#EFEAE5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#F5EEF8] flex items-center justify-center text-[#8E44AD]">
                <Package className="w-4 h-4" />
              </div>
              <span className="text-[13.5px] font-extrabold text-[#3A2E2B]">
                Sản phẩm đặt mua ({cartItems.length})
              </span>
            </div>
          </div>

          <div className="space-y-2.5 divide-y divide-[#F5EFEB]">
            {cartItems.map((item) => (
              <div key={item.product.id} className="pt-2.5 first:pt-0 flex items-center gap-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-14 h-14 rounded-xl object-cover border border-[#E8DFD5] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-[12.5px] font-bold text-[#3A2E2B] line-clamp-1">
                    {item.product.name}
                  </h4>
                  <p className="text-[12px] font-extrabold text-[#C84B4B] mt-0.5">
                    {item.product.formattedPrice}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 bg-[#F9F6F2] border border-[#E8DFD5] rounded-lg px-2 py-1">
                  <button
                    onClick={() => handleQuantityChange(item.product.id, -1)}
                    className="text-[#8C7B75] hover:text-[#C84B4B] font-bold text-xs px-1 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-[12px] font-bold text-[#3A2E2B] min-w-3 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.product.id, 1)}
                    className="text-[#8C7B75] hover:text-[#C84B4B] font-bold text-xs px-1 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5: VOUCHER & DISCOUNT */}
        <div className="p-4 bg-white rounded-3xl border border-[#EFEAE5] shadow-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#C84B4B]" />
            <span className="text-[13px] font-extrabold text-[#3A2E2B]">Mã giảm giá Nova Care</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              placeholder="Nhập MEBAU2026, FREESHIP..."
              className="flex-1 px-3 py-2 bg-[#F9F6F2] border border-[#E8DFD5] rounded-xl text-[12px] font-mono text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
            />
            <button
              onClick={handleApplyVoucher}
              className="px-4 py-2 bg-[#3A2E2B] hover:bg-[#2C2725] text-white text-[12px] font-bold rounded-xl transition-colors cursor-pointer"
            >
              Áp dụng
            </button>
          </div>

          {voucherMessage && (
            <p className={`text-[11px] font-medium ${voucherApplied ? 'text-[#2ECC71]' : 'text-red-500'}`}>
              {voucherMessage}
            </p>
          )}
        </div>

        {/* SECTION 6: PAYMENT METHOD CHOICE */}
        <div className="p-4 bg-white rounded-3xl border border-[#EFEAE5] shadow-xs space-y-2.5">
          <span className="text-[13px] font-extrabold text-[#3A2E2B] block">
            Phương thức thanh toán
          </span>

          <div className="space-y-2">
            {/* COD */}
            <div
              onClick={() => setPaymentMethod('cod')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                paymentMethod === 'cod'
                  ? 'border-[#C84B4B] bg-[#FFFBF9]'
                  : 'border-[#EFEAE5] bg-white hover:border-[#D5CDC5]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E8F8F0] flex items-center justify-center text-[#2ECC71]">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12.5px] font-bold text-[#3A2E2B]">Thanh toán khi nhận hàng (COD)</span>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-[#E8F8F0] text-[#2ECC71]">
                      Khuyên dùng
                    </span>
                  </div>
                  <p className="text-[10.5px] text-[#8C7B75]">Nhận hàng, kiểm tra cẩn thận rồi thanh toán</p>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'cod' ? 'border-[#C84B4B] bg-[#C84B4B]' : 'border-[#D5CDC5]'
                }`}
              >
                {paymentMethod === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>

            {/* VietQR */}
            <div
              onClick={() => setPaymentMethod('vietqr')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                paymentMethod === 'vietqr'
                  ? 'border-[#C84B4B] bg-[#FFFBF9]'
                  : 'border-[#EFEAE5] bg-white hover:border-[#D5CDC5]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EBF5FB] flex items-center justify-center text-[#2980B9]">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[12.5px] font-bold text-[#3A2E2B] block">Chuyển khoản VietQR 24/7</span>
                  <p className="text-[10.5px] text-[#8C7B75]">Quét mã tự động qua mọi ứng dụng ngân hàng</p>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'vietqr' ? 'border-[#C84B4B] bg-[#C84B4B]' : 'border-[#D5CDC5]'
                }`}
              >
                {paymentMethod === 'vietqr' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>

            {/* MoMo */}
            <div
              onClick={() => setPaymentMethod('momo')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                paymentMethod === 'momo'
                  ? 'border-[#C84B4B] bg-[#FFFBF9]'
                  : 'border-[#EFEAE5] bg-white hover:border-[#D5CDC5]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FDEDEC] flex items-center justify-center text-[#A21B65] font-black text-xs">
                  MoMo
                </div>
                <div>
                  <span className="text-[12.5px] font-bold text-[#3A2E2B] block">Ví điện tử MoMo</span>
                  <p className="text-[10.5px] text-[#8C7B75]">Thanh toán 1 chạm</p>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'momo' ? 'border-[#C84B4B] bg-[#C84B4B]' : 'border-[#D5CDC5]'
                }`}
              >
                {paymentMethod === 'momo' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 7: ORDER BILL SUMMARY */}
        <div className="p-4 bg-white rounded-3xl border border-[#EFEAE5] shadow-xs space-y-2 text-[12px]">
          <div className="flex justify-between text-[#8C7B75]">
            <span>Tổng tiền hàng:</span>
            <span className="font-semibold text-[#3A2E2B]">{formatCurrency(rawSubtotal)}</span>
          </div>
          <div className="flex justify-between text-[#8C7B75]">
            <span>Phí vận chuyển:</span>
            <span className="font-semibold text-[#3A2E2B]">
              {currentShippingFee === 0 ? 'Miễn phí' : formatCurrency(currentShippingFee)}
            </span>
          </div>
          {vipDiscount > 0 && (
            <div className="flex justify-between text-[#B38728] font-bold">
              <span>Đặc quyền VIP (-10%):</span>
              <span>-{formatCurrency(vipDiscount)}</span>
            </div>
          )}
          {voucherApplied && (
            <div className="flex justify-between text-[#2ECC71] font-bold">
              <span>Mã giảm giá ({voucherCode}):</span>
              <span>-{formatCurrency(voucherDiscount)}</span>
            </div>
          )}
          <div className="pt-2.5 border-t border-[#F5EFEB] flex justify-between items-baseline">
            <span className="text-[13.5px] font-extrabold text-[#3A2E2B]">Tổng thanh toán:</span>
            <span className="text-[18px] font-black text-[#C84B4B]">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* CONFIRM ORDER ACTION BUTTON */}
        <div className="space-y-2 pt-1">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirmOrder}
            disabled={isSubmitting}
            className="w-full py-4 bg-[#C84B4B] hover:bg-[#B84040] text-white rounded-2xl text-[15px] font-bold shadow-md disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang xử lý đặt hàng...</span>
              </>
            ) : (
              <>
                <span>Xác nhận đặt hàng · {formatCurrency(totalAmount)}</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8C7B75]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2ECC71]" />
            <span>Cam kết hàng chính hãng 100% · Đổi trả trong 7 ngày</span>
          </div>
        </div>
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
              className="w-full max-w-[430px] bg-[#FFFBF7] rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-[#EFEAE5]"
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-[#F0ECE6] flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-bold text-[#3A2E2B]">
                    {editingAddressId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ giao hàng'}
                  </h3>
                  <p className="text-[11px] text-[#8C7B75]">Thông tin nhận hàng của mẹ</p>
                </div>
                <button
                  onClick={() => setIsAddressModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white border border-[#EFEAE5] flex items-center justify-center text-[#8C7B75] hover:text-[#3A2E2B] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form Body */}
              <div className="p-5 overflow-y-auto space-y-3.5 text-[12.5px]">
                {formPhoneError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[11.5px] flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formPhoneError}</span>
                  </div>
                )}

                {/* Recipient Full Name */}
                <div>
                  <label className="block text-[11.5px] font-bold text-[#5E4E49] mb-1">
                    Họ và tên người nhận <span className="text-[#C84B4B]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8C7B75] absolute left-3 top-3" />
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Khánh Băng"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E8DFD5] rounded-xl text-[13px] text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                    />
                  </div>
                </div>

                {/* Recipient Phone Number */}
                <div>
                  <label className="block text-[11.5px] font-bold text-[#5E4E49] mb-1">
                    Số điện thoại nhận hàng <span className="text-[#C84B4B]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#8C7B75] absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="0987 654 321"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E8DFD5] rounded-xl text-[13px] font-mono text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                    />
                  </div>
                </div>

                {/* Province / City */}
                <div>
                  <label className="block text-[11.5px] font-bold text-[#5E4E49] mb-1">
                    Tỉnh / Thành phố <span className="text-[#C84B4B]">*</span>
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
                      className="w-full px-3 py-2.5 bg-white border border-[#E8DFD5] rounded-xl text-[13px] text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B] appearance-none"
                    >
                      {VIETNAM_PROVINCES.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#8C7B75] absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* District & Ward Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11.5px] font-bold text-[#5E4E49] mb-1">
                      Quận / Huyện <span className="text-[#C84B4B]">*</span>
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
                        className="w-full px-3 py-2.5 bg-white border border-[#E8DFD5] rounded-xl text-[12.5px] text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B] appearance-none"
                      >
                        {VIETNAM_PROVINCES.find((p) => p.name === formProvince)?.districts.map((d) => (
                          <option key={d.name} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#8C7B75] absolute right-2.5 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-bold text-[#5E4E49] mb-1">
                      Phường / Xã <span className="text-[#C84B4B]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formWard}
                        onChange={(e) => setFormWard(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-[#E8DFD5] rounded-xl text-[12.5px] text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B] appearance-none"
                      >
                        {VIETNAM_PROVINCES.find((p) => p.name === formProvince)
                          ?.districts.find((d) => d.name === formDistrict)
                          ?.wards.map((w) => (
                            <option key={w} value={w}>
                              {w}
                            </option>
                          ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#8C7B75] absolute right-2.5 top-3.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Street Address Details */}
                <div>
                  <label className="block text-[11.5px] font-bold text-[#5E4E49] mb-1">
                    Địa chỉ chi tiết (Số nhà, tên tòa nhà, tên đường) <span className="text-[#C84B4B]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formStreet}
                    onChange={(e) => setFormStreet(e.target.value)}
                    placeholder="Ví dụ: 142 Nguyễn Thị Minh Khai, Tòa nhà Rosana, Căn hộ 502"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD5] rounded-xl text-[13px] text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                  />
                </div>

                {/* Address Label Tags */}
                <div>
                  <label className="block text-[11.5px] font-bold text-[#5E4E49] mb-1.5">
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
                        className={`py-2 px-2 rounded-xl border flex items-center justify-center gap-1.5 text-[11.5px] font-bold transition-all cursor-pointer ${
                          formLabel === label
                            ? 'bg-[#C84B4B] text-white border-[#C84B4B]'
                            : 'bg-white text-[#5E4E49] border-[#E8DFD5] hover:bg-[#F9F6F2]'
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
                    className="w-4 h-4 rounded text-[#C84B4B] accent-[#C84B4B] cursor-pointer"
                  />
                  <span className="text-[12px] font-medium text-[#3A2E2B]">
                    Đặt làm địa chỉ nhận hàng mặc định
                  </span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[#F0ECE6] flex gap-2.5 bg-white">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 py-3 border border-[#E8DFD5] text-[#5E4E49] rounded-2xl text-[13px] font-bold hover:bg-[#F5EFEB] transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSaveAddress}
                  className="flex-1 py-3 bg-[#C84B4B] text-white rounded-2xl text-[13px] font-bold shadow-md hover:bg-[#B84040] transition-colors cursor-pointer"
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
