import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Camera,
  Crown,
  PhoneCall,
  CreditCard,
  ShieldAlert,
  Heart,
  Baby,
  Edit3,
  Calendar,
  Award,
  CheckCircle2,
  ChevronRight,
  LogOut,
  Bell,
  Sparkles,
  Save,
  X,
  Scale,
  Ruler,
  Droplet,
  Package,
  MapPin,
} from 'lucide-react';
import { UserProfile } from '../../types';
import confetti from 'canvas-confetti';

interface ProfileScreenProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: Partial<UserProfile>) => void;
  onBack: () => void;
  onOpenAvatarModal: () => void;
  onNavigateToEmergency: () => void;
  onNavigateToPayment: () => void;
  onNavigateToOrderInfo?: () => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onUpdateUser,
  onBack,
  onOpenAvatarModal,
  onNavigateToEmergency,
  onNavigateToPayment,
  onNavigateToOrderInfo,
  onLogout,
}) => {
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit fields state
  const [editName, setEditName] = useState(user.name);
  const [editPhone, setEditPhone] = useState(user.phone);
  const [editWeek, setEditWeek] = useState(user.pregnancyWeek);
  const [editDueDate, setEditDueDate] = useState(user.dueDate);
  const [editNickname, setEditNickname] = useState(user.babyNickname || 'Bé Bơ');
  const [editWeight, setEditWeight] = useState(user.weightKg || 58.5);
  const [editHeight, setEditHeight] = useState(user.heightCm || 162);
  const [editBloodType, setEditBloodType] = useState(user.bloodType || 'O+');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveInfo = () => {
    onUpdateUser({
      name: editName,
      phone: editPhone,
      pregnancyWeek: Number(editWeek),
      dueDate: editDueDate,
      babyNickname: editNickname,
      weightKg: Number(editWeight),
      heightCm: Number(editHeight),
      bloodType: editBloodType,
    });
    setIsEditingInfo(false);
    triggerToast('Đã lưu thông tin hồ sơ thành công!');
    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.5 },
        colors: ['#C84B4B', '#2ECC71', '#FCEEEB'],
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FFFBF7] overflow-y-auto no-scrollbar select-none">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#3A2E2B] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#2ECC71]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-[#F0ECE6]/60 sticky top-0 bg-[#FFFBF7]/90 backdrop-blur-md z-20">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white border border-[#EFEAE5] shadow-xs flex items-center justify-center text-[#5E4E49] hover:bg-[#F5EFEB] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-[14px] font-bold text-[#3A2E2B]">Hồ sơ Mẹ & Bé</span>
        <button
          onClick={() => setIsEditingInfo(true)}
          className="flex items-center gap-1 text-[12px] font-bold text-[#C84B4B] bg-[#FFF2EE] px-2.5 py-1.5 rounded-full hover:bg-[#FFE5DF] transition-colors cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Sửa</span>
        </button>
      </div>

      <div className="px-5 pt-4 pb-8 space-y-4">
        {/* User Hero Card */}
        <div className="relative p-5 bg-gradient-to-br from-white to-[#FDF8F5] rounded-3xl border border-[#EFEAE5] shadow-sm flex flex-col items-center text-center">
          {/* Avatar with Camera badge */}
          <div className="relative mb-3">
            <div className="w-22 h-22 rounded-full overflow-hidden border-3 border-white shadow-md ring-2 ring-[#C84B4B]/20 bg-[#F5EFEB]">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={onOpenAvatarModal}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#C84B4B] text-white flex items-center justify-center shadow-md hover:bg-[#B84040] transition-colors ring-2 ring-white cursor-pointer"
              title="Đổi ảnh đại diện"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Name & Badges */}
          <div className="flex items-center gap-1.5 mb-1">
            <h2 className="text-[18px] font-extrabold text-[#3A2E2B] tracking-tight">
              {user.name}
            </h2>
            {user.isVip && (
              <span className="flex items-center gap-1 bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase">
                <Crown className="w-2.5 h-2.5 fill-current" />
                VIP
              </span>
            )}
          </div>

          <p className="text-[12px] text-[#8C7B75] mb-2">{user.phone} · {user.email}</p>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FCEEEB] text-[#C84B4B] text-[11.5px] font-bold rounded-full">
              <Baby className="w-3.5 h-3.5" />
              Tuần {user.pregnancyWeek} · Tam cá nguyệt 2
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#F5F1EC] text-[#5E4E49] text-[11.5px] font-bold rounded-full">
              <Heart className="w-3 h-3 text-[#E74C3C]" />
              {user.babyNickname || 'Bé Bơ'}
            </span>
          </div>

          {/* Due date countdown banner */}
          <div className="w-full mt-4 p-3 bg-gradient-to-r from-[#FFF5F2] to-[#FFF0EC] rounded-2xl border border-[#F2DDD7] flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#C84B4B]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#8C7B75] block uppercase">Dự sinh</span>
                <span className="text-[12.5px] font-extrabold text-[#3A2E2B]">{user.dueDate}</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#C84B4B] bg-white px-2.5 py-1 rounded-full shadow-xs">
              Còn ~112 ngày
            </span>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 bg-white rounded-2xl border border-[#EFEAE5] shadow-xs text-center">
            <span className="text-[18px] font-black text-[#C84B4B] block leading-tight">
              {user.streakDays}
            </span>
            <span className="text-[10.5px] font-medium text-[#8C7B75]">Ngày liên tục</span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-[#EFEAE5] shadow-xs text-center">
            <span className="text-[18px] font-black text-[#2ECC71] block leading-tight">
              {user.completedExercises}
            </span>
            <span className="text-[10.5px] font-medium text-[#8C7B75]">Bài tập xong</span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-[#EFEAE5] shadow-xs text-center">
            <span className="text-[18px] font-black text-[#F39C12] block leading-tight">
              {user.novaPoints}
            </span>
            <span className="text-[10.5px] font-medium text-[#8C7B75]">Nova Xu</span>
          </div>
        </div>

        {/* 4 Essential Quick Actions Required by User */}
        <div className="space-y-2.5">
          <span className="text-[12.5px] font-extrabold text-[#3A2E2B] px-1 block">
            Tiện ích quan trọng
          </span>

          {/* SOS EMERGENCY BUTTON */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={onNavigateToEmergency}
            className="p-3.5 bg-gradient-to-r from-[#FF4D4D] to-[#E74C3C] text-white rounded-2xl shadow-md flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center animate-pulse">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-[14px] font-extrabold text-white">Số khẩn cấp SOS & Y Tế</h4>
                  <span className="bg-white text-[#E74C3C] text-[9.5px] font-black px-1.5 py-0.2 rounded-full uppercase">
                    24/7
                  </span>
                </div>
                <p className="text-[11px] text-white/85">
                  Cấp cứu 115, BV Từ Dũ, Phụ Sản TW & Người thân
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
          </motion.div>

          {/* PAYMENT & VIP UPGRADE BUTTON */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={onNavigateToPayment}
            className="p-3.5 bg-gradient-to-r from-[#2C2725] to-[#423A37] text-white rounded-2xl shadow-sm flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#F5D77F]">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-[14px] font-extrabold text-white">Trang thanh toán & Gói VIP</h4>
                  <Crown className="w-3.5 h-3.5 text-[#F5D77F] fill-current" />
                </div>
                <p className="text-[11px] text-white/70">
                  Chuyển khoản VietQR, MoMo, Ví điện tử, Ưu đãi 40%
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
          </motion.div>

          {/* ORDER INFO & SHIPPING ADDRESS BUTTON */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={onNavigateToOrderInfo}
            className="p-3.5 bg-white border border-[#EFEAE5] rounded-2xl shadow-xs flex items-center justify-between cursor-pointer hover:border-[#C84B4B]/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF5FB] flex items-center justify-center text-[#2980B9]">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-[13.5px] font-bold text-[#3A2E2B]">Thông tin đặt hàng & Địa chỉ</h4>
                  <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-[#EBF5FB] text-[#2980B9]">
                    Sổ địa chỉ
                  </span>
                </div>
                <p className="text-[11px] text-[#8C7B75] line-clamp-1">
                  {user.shippingAddresses?.[0]
                    ? `${user.shippingAddresses[0].streetAddress}, ${user.shippingAddresses[0].district}`
                    : '142 Nguyễn Thị Minh Khai, Q.3, TP.HCM · SĐT: ' + user.phone}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A89A93]" />
          </motion.div>

          {/* CHANGE AVATAR SHORTCUT */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={onOpenAvatarModal}
            className="p-3.5 bg-white border border-[#EFEAE5] rounded-2xl shadow-xs flex items-center justify-between cursor-pointer hover:border-[#C84B4B]/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FCEEEB] flex items-center justify-center text-[#C84B4B]">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[13.5px] font-bold text-[#3A2E2B]">Đổi ảnh đại diện</h4>
                <p className="text-[11px] text-[#8C7B75]">
                  Tải ảnh từ điện thoại hoặc chọn trong bộ sưu tập
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A89A93]" />
          </motion.div>
        </div>

        {/* Health Metrics Card */}
        <div className="p-4 bg-white rounded-2xl border border-[#EFEAE5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-extrabold text-[#3A2E2B]">
              Chỉ số sức khỏe hiện tại
            </span>
            <button
              onClick={() => setIsEditingInfo(true)}
              className="text-[11px] font-bold text-[#C84B4B] hover:underline cursor-pointer"
            >
              Cập nhật
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 bg-[#F9F6F2] rounded-xl flex flex-col items-center text-center">
              <Scale className="w-4 h-4 text-[#8C7B75] mb-1" />
              <span className="text-[9.5px] text-[#8C7B75]">Cân nặng</span>
              <span className="text-[12.5px] font-bold text-[#3A2E2B]">{user.weightKg} kg</span>
            </div>
            <div className="p-2.5 bg-[#F9F6F2] rounded-xl flex flex-col items-center text-center">
              <Ruler className="w-4 h-4 text-[#8C7B75] mb-1" />
              <span className="text-[9.5px] text-[#8C7B75]">Chiều cao</span>
              <span className="text-[12.5px] font-bold text-[#3A2E2B]">{user.heightCm} cm</span>
            </div>
            <div className="p-2.5 bg-[#F9F6F2] rounded-xl flex flex-col items-center text-center">
              <Droplet className="w-4 h-4 text-[#C84B4B] mb-1" />
              <span className="text-[9.5px] text-[#8C7B75]">Nhóm máu</span>
              <span className="text-[12.5px] font-bold text-[#C84B4B]">{user.bloodType}</span>
            </div>
          </div>
        </div>

        {/* Account & App Settings */}
        <div className="p-4 bg-white rounded-2xl border border-[#EFEAE5] shadow-xs space-y-2">
          <span className="text-[13px] font-extrabold text-[#3A2E2B] block mb-1">
            Cài đặt tài khoản
          </span>

          <div
            onClick={onNavigateToEmergency}
            className="flex items-center justify-between py-2 border-b border-[#F5EFEB] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <PhoneCall className="w-4 h-4 text-[#C84B4B]" />
              <span className="text-[12.5px] font-medium text-[#3A2E2B]">Danh bạ cấp cứu sản khoa</span>
            </div>
            <span className="text-[11px] font-bold text-[#C84B4B]">5 số</span>
          </div>

          <div
            onClick={onNavigateToPayment}
            className="flex items-center justify-between py-2 border-b border-[#F5EFEB] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 text-[#8C7B75]" />
              <span className="text-[12.5px] font-medium text-[#3A2E2B]">Quản lý gói hội viên</span>
            </div>
            <span className="text-[11px] font-bold text-[#D4AF37]">Gói Năm</span>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 mt-2 text-[#E74C3C] text-[13px] font-bold rounded-xl hover:bg-[#FDF2F0] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất tài khoản</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Info Sheet */}
      {isEditingInfo && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-[420px] bg-[#FFFBF7] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#EFEAE5] max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EFEAE5]">
              <h3 className="text-[16px] font-bold text-[#3A2E2B]">Chỉnh sửa hồ sơ mẹ & bé</h3>
              <button
                onClick={() => setIsEditingInfo(false)}
                className="w-8 h-8 rounded-full bg-[#EFEAE5] flex items-center justify-center text-[#5E4E49]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#8C7B75] mb-1">Họ tên của mẹ</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD5] rounded-xl text-[13px] text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#8C7B75] mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD5] rounded-xl text-[13px] text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#8C7B75] mb-1">Biệt danh bé</label>
                  <input
                    type="text"
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD5] rounded-xl text-[13px] text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#8C7B75] mb-1">Tuần thai (1 - 40)</label>
                  <input
                    type="number"
                    min="1"
                    max="42"
                    value={editWeek}
                    onChange={(e) => setEditWeek(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD5] rounded-xl text-[13px] text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#8C7B75] mb-1">Ngày dự sinh</label>
                  <input
                    type="text"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    placeholder="15/11/2026"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD5] rounded-xl text-[13px] text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10.5px] font-bold text-[#8C7B75] mb-1">Cân nặng (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editWeight}
                    onChange={(e) => setEditWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#E8DFD5] rounded-xl text-[13px] text-[#3A2E2B] text-center focus:outline-none focus:border-[#C84B4B]"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-[#8C7B75] mb-1">Chiều cao (cm)</label>
                  <input
                    type="number"
                    value={editHeight}
                    onChange={(e) => setEditHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#E8DFD5] rounded-xl text-[13px] text-[#3A2E2B] text-center focus:outline-none focus:border-[#C84B4B]"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-[#8C7B75] mb-1">Nhóm máu</label>
                  <select
                    value={editBloodType}
                    onChange={(e) => setEditBloodType(e.target.value)}
                    className="w-full px-2 py-2 bg-white border border-[#E8DFD5] rounded-xl text-[13px] text-[#3A2E2B] text-center focus:outline-none focus:border-[#C84B4B]"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="Rh-">Rh- (Hiếm)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditingInfo(false)}
                  className="flex-1 py-3 rounded-xl border border-[#E2DAD0] text-[#5E4E49] text-[13px] font-bold hover:bg-[#F8F5F2]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveInfo}
                  className="flex-1 py-3 rounded-xl bg-[#C84B4B] text-white text-[13px] font-bold hover:bg-[#B84040] shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
