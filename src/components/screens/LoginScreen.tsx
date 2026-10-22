import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  User,
  Heart,
  Baby,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { INITIAL_USER_PROFILE } from '../../data/mockData';
import { storageService } from '../../services/storageService';
import confetti from 'canvas-confetti';

interface LoginScreenProps {
  onBack: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onBack, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form states
  const [accountInput, setAccountInput] = useState('0987 654 321');
  const [password, setPassword] = useState('••••••••');
  const [fullName, setFullName] = useState('Khánh Băng');
  const [pregnancyWeek, setPregnancyWeek] = useState(24);
  const [babyNickname, setBabyNickname] = useState('Bé Bơ');

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('0987 654 321');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountInput.trim()) {
      triggerToast('Vui lòng nhập số điện thoại hoặc email');
      return;
    }

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C84B4B', '#FCEEEB', '#F39C12'],
      });
    } catch {
      // ignore
    }

    // Return logged-in user profile, migrating any guest pregnancy records safely
    const user: UserProfile = {
      ...INITIAL_USER_PROFILE,
      name: mode === 'register' ? fullName : (INITIAL_USER_PROFILE.name || 'Khánh Băng'),
      phone: accountInput.includes('@') ? INITIAL_USER_PROFILE.phone : accountInput,
      email: accountInput.includes('@') ? accountInput : INITIAL_USER_PROFILE.email,
      pregnancyWeek: mode === 'register' ? Number(pregnancyWeek) : INITIAL_USER_PROFILE.pregnancyWeek,
      babyNickname: mode === 'register' ? babyNickname : INITIAL_USER_PROFILE.babyNickname,
    };

    const finalUser = storageService.migrateGuestDataToAccount(user);
    onLoginSuccess(finalUser);
  };

  // Quick preset login handler
  const handleQuickLogin = (type: 'khanhbang' | 'lanhuong' | 'guest') => {
    let user: UserProfile;
    if (type === 'khanhbang') {
      user = { ...INITIAL_USER_PROFILE };
    } else if (type === 'lanhuong') {
      user = {
        ...INITIAL_USER_PROFILE,
        id: 'usr-2',
        name: 'Mẹ Lan Hương',
        email: 'lanhuong.mom@gmail.com',
        phone: '0912 888 777',
        pregnancyWeek: 12,
        babyNickname: 'Bé Đậu',
        isVip: false,
      };
    } else {
      user = {
        ...INITIAL_USER_PROFILE,
        id: 'usr-guest',
        name: 'Mẹ Bầu Khách',
        email: 'guest@novacare.vn',
        phone: '0900 000 000',
        pregnancyWeek: 20,
        babyNickname: 'Bé Yêu',
        isVip: false,
      };
    }

    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#C84B4B', '#FCEEEB', '#2ECC71'],
      });
    } catch {
      // ignore
    }
    const finalUser = storageService.migrateGuestDataToAccount(user);
    onLoginSuccess(finalUser);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FFFBF7] overflow-y-auto no-scrollbar select-none">
      {/* Toast notification */}
      {notificationMsg && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#3A2E2B] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#C84B4B]" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white border border-[#EFEAE5] shadow-xs flex items-center justify-center text-[#5E4E49] hover:bg-[#F5EFEB] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-[13px] font-bold text-[#8C7B75] tracking-wide uppercase">
          Tài khoản Nova Care
        </span>
        <button
          onClick={() => handleQuickLogin('guest')}
          className="text-[12px] font-semibold text-[#C84B4B] hover:underline cursor-pointer"
        >
          Dùng thử
        </button>
      </div>

      <div className="px-6 pt-2 pb-8 flex flex-col">
        {/* Brand Hero */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#C84B4B] to-[#F18B8B] flex items-center justify-center text-white shadow-lg shadow-[#C84B4B]/20 mb-3"
          >
            <Baby className="w-8 h-8" />
          </motion.div>
          <h2 className="text-[22px] font-extrabold text-[#3A2E2B] tracking-tight">
            Chào mừng mẹ đến với Nova
          </h2>
          <p className="text-[12.5px] text-[#8C7B75] mt-1 max-w-[280px]">
            Đồng hành chăm sóc sức khỏe toàn diện cho mẹ bầu và thai nhi từng ngày
          </p>
        </div>

        {/* Tab Toggle (Đăng nhập / Đăng ký) */}
        <div className="flex p-1 bg-[#EFEAE5] rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-[13px] font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-[#3A2E2B] shadow-xs'
                : 'text-[#8C7B75] hover:text-[#3A2E2B]'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-[13px] font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-[#3A2E2B] shadow-xs'
                : 'text-[#8C7B75] hover:text-[#3A2E2B]'
            }`}
          >
            Đăng ký mới
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              {/* Họ tên */}
              <div>
                <label className="block text-[11.5px] font-bold text-[#5E4E49] mb-1">
                  Họ và tên của mẹ
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#A89A93] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="VD: Nguyễn Khánh Băng"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8DFD5] rounded-xl text-[13.5px] text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B] transition-colors"
                  />
                </div>
              </div>

              {/* Tuần thai & Biệt danh bé */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] font-bold text-[#5E4E49] mb-1">
                    Tuần thai (1 - 40)
                  </label>
                  <div className="relative">
                    <Heart className="w-4 h-4 text-[#A89A93] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="1"
                      max="42"
                      value={pregnancyWeek}
                      onChange={(e) => setPregnancyWeek(Number(e.target.value))}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#E8DFD5] rounded-xl text-[13.5px] text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11.5px] font-bold text-[#5E4E49] mb-1">
                    Biệt danh của bé
                  </label>
                  <div className="relative">
                    <Baby className="w-4 h-4 text-[#A89A93] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={babyNickname}
                      onChange={(e) => setBabyNickname(e.target.value)}
                      placeholder="Bé Bơ, Bé Đậu..."
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#E8DFD5] rounded-xl text-[13.5px] text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* SĐT / Email */}
          <div>
            <label className="block text-[11.5px] font-bold text-[#5E4E49] mb-1">
              Số điện thoại hoặc Email
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#A89A93] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={accountInput}
                onChange={(e) => setAccountInput(e.target.value)}
                placeholder="0987 654 321 hoặc email@..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8DFD5] rounded-xl text-[13.5px] text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B] transition-colors"
              />
            </div>
          </div>

          {/* Mật khẩu */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11.5px] font-bold text-[#5E4E49]">Mật khẩu</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-semibold text-[#C84B4B] hover:underline cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A89A93] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E8DFD5] rounded-xl text-[13.5px] text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89A93] hover:text-[#5E4E49] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          {mode === 'login' && (
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#C84B4B] rounded accent-[#C84B4B]"
                />
                <span className="text-[12px] text-[#6E5D57]">Ghi nhớ đăng nhập</span>
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-[#C84B4B] text-white rounded-xl text-[14px] font-bold shadow-md hover:bg-[#B84040] transition-colors cursor-pointer active:scale-98 mt-2"
          >
            {mode === 'login' ? 'Đăng nhập ngay' : 'Tạo tài khoản Nova Care'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#EAE3DC]" />
          <span className="text-[11px] font-medium text-[#A89A93]">HOẶC TIẾP TỤC VỚI</span>
          <div className="flex-1 h-px bg-[#EAE3DC]" />
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => handleQuickLogin('khanhbang')}
            className="py-2.5 px-3 bg-white border border-[#E8DFD5] hover:bg-[#FDF9F6] rounded-xl flex items-center justify-center gap-2 text-[12.5px] font-bold text-[#3A2E2B] shadow-xs transition-colors cursor-pointer"
          >
            <span className="font-bold text-black text-base"></span>
            <span>Apple ID</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('khanhbang')}
            className="py-2.5 px-3 bg-white border border-[#E8DFD5] hover:bg-[#FDF9F6] rounded-xl flex items-center justify-center gap-2 text-[12.5px] font-bold text-[#3A2E2B] shadow-xs transition-colors cursor-pointer"
          >
            <span className="font-bold text-[#EA4335] text-sm">G</span>
            <span>Google</span>
          </button>
        </div>

        {/* Quick Demo Accounts Helper */}
        <div className="p-3.5 bg-gradient-to-br from-[#FFF5F2] to-[#FFFBF7] rounded-2xl border border-[#F2DDD7]">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C84B4B]" />
            <span className="text-[11.5px] font-bold text-[#3A2E2B]">
              Đăng nhập nhanh (Tài khoản mẫu):
            </span>
          </div>
          <div className="space-y-1.5">
            <button
              onClick={() => handleQuickLogin('khanhbang')}
              className="w-full p-2 bg-white rounded-xl border border-[#EADBD5] hover:border-[#C84B4B] flex items-center justify-between text-left cursor-pointer transition-colors"
            >
              <div>
                <p className="text-[12px] font-bold text-[#3A2E2B]">Khánh Băng (VIP · Tuần 24)</p>
                <p className="text-[10px] text-[#8C7B75]">khanhbang.mom@gmail.com</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#C84B4B]" />
            </button>
            <button
              onClick={() => handleQuickLogin('lanhuong')}
              className="w-full p-2 bg-white rounded-xl border border-[#EADBD5] hover:border-[#C84B4B] flex items-center justify-between text-left cursor-pointer transition-colors"
            >
              <div>
                <p className="text-[12px] font-bold text-[#3A2E2B]">Lan Hương (Tuần 12 · Chuẩn)</p>
                <p className="text-[10px] text-[#8C7B75]">lanhuong.mom@gmail.com</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8C7B75]" />
            </button>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 mt-4 text-[11px] text-[#8C7B75]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2ECC71]" />
          <span>Dữ liệu y tế và thai kỳ được bảo mật chuẩn HIPAA</span>
        </div>
      </div>

      {/* Forgot Password OTP Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFFBF7] rounded-3xl p-5 w-full max-w-[340px] shadow-2xl border border-[#EFEAE5]">
            <h3 className="text-[16px] font-bold text-[#3A2E2B] mb-1">Khôi phục mật khẩu</h3>
            <p className="text-[12px] text-[#8C7B75] mb-3">
              Nhập số điện thoại để nhận mã xác thực OTP 6 số qua SMS.
            </p>
            {!otpSent ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={forgotPhone}
                  onChange={(e) => setForgotPhone(e.target.value)}
                  placeholder="Nhập số điện thoại..."
                  className="w-full px-3.5 py-2 bg-white border border-[#E8DFD5] rounded-xl text-[13px] text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 rounded-xl border border-[#E8DFD5] text-[12px] font-semibold text-[#5E4E49]"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      setOtpSent(true);
                      triggerToast('Đã gửi mã OTP: 886622 tới số ' + forgotPhone);
                    }}
                    className="flex-1 py-2 rounded-xl bg-[#C84B4B] text-white text-[12px] font-bold"
                  >
                    Gửi mã OTP
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-2.5 bg-[#FFF2EE] rounded-xl border border-[#F2DDD7] text-center">
                  <span className="text-[11px] text-[#C84B4B] font-bold">Mã OTP mẫu thử nghiệm: 886622</span>
                </div>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Nhập mã 6 số (VD: 886622)"
                  maxLength={6}
                  className="w-full text-center tracking-widest px-3.5 py-2 bg-white border border-[#E8DFD5] rounded-xl text-[16px] font-bold text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                />
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    triggerToast('Xác thực thành công! Đã đăng nhập tự động.');
                    handleQuickLogin('khanhbang');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#2ECC71] text-white text-[13px] font-bold"
                >
                  Xác nhận & Đăng nhập
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
