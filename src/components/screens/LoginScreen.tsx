import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Lock,
  Phone,
  Eye,
  EyeOff,
  User,
  Heart,
  Baby,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { INITIAL_USER_PROFILE, ADMIN_USER_PROFILE, MODERATOR_USER_PROFILE } from '../../data/mockData';
import { storageService } from '../../services/storageService';
import { apiService } from '../../services/apiService';
import confetti from 'canvas-confetti';
import { NovaBrandMark } from '../NovaBrandMark';

interface LoginScreenProps {
  onBack: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onBack, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [accountInput, setAccountInput] = useState('0987 654 321');
  const [password, setPassword] = useState('••••••••');
  const [fullName, setFullName] = useState('Khánh Băng');
  const [pregnancyWeek, setPregnancyWeek] = useState(24);
  const [babyNickname, setBabyNickname] = useState('Bé Bơ');

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('0987 654 321');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const finalizeSessionAndLogin = async (candidateUser: UserProfile) => {
    setIsSubmitting(true);
    try {
      const finalUser = storageService.migrateGuestDataToAccount(candidateUser);
      try {
        const session = await apiService.ensureSession(finalUser);
        storageService.saveUserProfile(session.user);
        onLoginSuccess(session.user);
      } catch {
        onLoginSuccess(finalUser);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        colors: ['#B55841', '#C4A46B', '#6D8572', '#F2ECE3'],
      });
    } catch {}

    const user: UserProfile = {
      ...INITIAL_USER_PROFILE,
      name: mode === 'register' ? fullName : (INITIAL_USER_PROFILE.name || 'Khánh Băng'),
      phone: accountInput.includes('@') ? INITIAL_USER_PROFILE.phone : accountInput,
      email: accountInput.includes('@') ? accountInput : INITIAL_USER_PROFILE.email,
      pregnancyWeek: mode === 'register' ? Number(pregnancyWeek) : INITIAL_USER_PROFILE.pregnancyWeek,
      babyNickname: mode === 'register' ? babyNickname : INITIAL_USER_PROFILE.babyNickname,
    };

    await finalizeSessionAndLogin(user);
  };

  const handleQuickLogin = async (
    type: 'khanhbang' | 'lanhuong' | 'moderator' | 'admin' | 'guest'
  ) => {
    let user: UserProfile;
    if (type === 'khanhbang') {
      user = { ...INITIAL_USER_PROFILE, role: 'user' };
    } else if (type === 'lanhuong') {
      user = {
        ...INITIAL_USER_PROFILE,
        id: 'usr-2',
        name: 'Mẹ Lan Hương',
        email: 'lanhuong.mom@gmail.com',
        phone: '0912 888 777',
        role: 'user',
        pregnancyWeek: 12,
        babyNickname: 'Bé Đậu',
        isVip: false,
      };
    } else if (type === 'moderator') {
      user = { ...MODERATOR_USER_PROFILE, role: 'moderator' };
    } else if (type === 'admin') {
      user = { ...ADMIN_USER_PROFILE, role: 'admin' };
    } else {
      user = {
        ...INITIAL_USER_PROFILE,
        id: 'usr-guest',
        name: 'Mẹ Bầu Khách',
        email: 'guest@novacare.vn',
        phone: '0900 000 000',
        role: 'user',
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
        colors: ['#B55841', '#C4A46B', '#6D8572', '#F2ECE3'],
      });
    } catch {}

    await finalizeSessionAndLogin(user);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FAF6F0] dark:bg-[#161311] overflow-y-auto no-scrollbar select-none">
      {notificationMsg && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#322622] dark:bg-[#231E1B] text-[#FAF6F0] border border-[#E6DDD1]/20 text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#D7BA86]" />
          <span>{notificationMsg}</span>
        </div>
      )}

      <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-[#E6DDD1]/70 dark:border-[#362E2A]/70">
        <button
          onClick={onBack}
          aria-label="Quay lại"
          className="w-9 h-9 rounded-full bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] shadow-2xs flex items-center justify-center text-[#6B5D56] dark:text-[#C5B9B0] hover:bg-[#F2ECE3] dark:hover:bg-[#231E1B] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-[12px] font-bold text-[#786962] dark:text-[#B5A89F] tracking-wider uppercase">
          Tài khoản Nova Việt Mẫu
        </span>
        <button
          onClick={() => handleQuickLogin('guest')}
          disabled={isSubmitting}
          className="text-[12px] font-bold text-[#B55841] dark:text-[#D47A63] hover:underline cursor-pointer whitespace-nowrap"
        >
          Dùng thử
        </button>
      </div>

      <div className="px-6 pt-3 pb-10 flex flex-col max-w-md w-full mx-auto">
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-3 w-14 h-14 rounded-2xl bg-[#F7EAE5] dark:bg-[#35231E] border border-[#EBCDC2] dark:border-[#52352D] flex items-center justify-center text-[#B55841] dark:text-[#D47A63] shadow-xs"
          >
            <NovaBrandMark className="w-8 h-8" />
          </motion.div>
          <h2 className="font-editorial text-[24px] font-bold text-[#322622] dark:text-[#F4EDE6] tracking-tight leading-snug">
            Chào mừng mẹ đến với Nova
          </h2>
          <p className="text-[13px] text-[#6B5D56] dark:text-[#C5B9B0] mt-1 max-w-[290px] leading-relaxed">
            Đồng hành chăm sóc sức khỏe dịu dàng cho mẹ bầu và em bé từng ngày
          </p>
        </div>

        <div className="flex p-1 bg-[#F2ECE3] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 min-h-[40px] py-2 text-[13px] font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              mode === 'login'
                ? 'bg-white dark:bg-[#1E1A17] text-[#322622] dark:text-[#F4EDE6] shadow-2xs'
                : 'text-[#786962] dark:text-[#B5A89F] hover:text-[#322622] dark:hover:text-[#F4EDE6]'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 min-h-[40px] py-2 text-[13px] font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              mode === 'register'
                ? 'bg-white dark:bg-[#1E1A17] text-[#322622] dark:text-[#F4EDE6] shadow-2xs'
                : 'text-[#786962] dark:text-[#B5A89F] hover:text-[#322622] dark:hover:text-[#F4EDE6]'
            }`}
          >
            Đăng ký mới
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[11.5px] font-bold text-[#6B5D56] dark:text-[#C5B9B0] mb-1">
                  Họ và tên của mẹ
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#786962] dark:text-[#B5A89F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="VD: Nguyễn Khánh Băng"
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-[13.5px] text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] font-bold text-[#6B5D56] dark:text-[#C5B9B0] mb-1">
                    Tuần thai (1 - 40)
                  </label>
                  <div className="relative">
                    <Heart className="w-4 h-4 text-[#786962] dark:text-[#B5A89F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="1"
                      max="42"
                      value={pregnancyWeek}
                      onChange={(e) => setPregnancyWeek(Number(e.target.value))}
                      className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-[13.5px] text-[#322622] dark:text-[#F4EDE6] tabular-nums focus:outline-none focus:border-[#B55841]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11.5px] font-bold text-[#6B5D56] dark:text-[#C5B9B0] mb-1">
                    Biệt danh của bé
                  </label>
                  <div className="relative">
                    <Baby className="w-4 h-4 text-[#786962] dark:text-[#B5A89F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={babyNickname}
                      onChange={(e) => setBabyNickname(e.target.value)}
                      placeholder="Bé Bơ, Bé Đậu..."
                      className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-[13.5px] text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841]"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11.5px] font-bold text-[#6B5D56] dark:text-[#C5B9B0] mb-1">
              Số điện thoại hoặc Email
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#786962] dark:text-[#B5A89F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={accountInput}
                onChange={(e) => setAccountInput(e.target.value)}
                placeholder="0987 654 321 hoặc email@..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-[13.5px] text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11.5px] font-bold text-[#6B5D56] dark:text-[#C5B9B0]">Mật khẩu</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-semibold text-[#B55841] dark:text-[#D47A63] hover:underline cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#786962] dark:text-[#B5A89F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-[13.5px] text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#786962] dark:text-[#B5A89F] hover:text-[#322622] dark:hover:text-[#F4EDE6] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'login' && (
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#B55841] rounded accent-[#B55841]"
                />
                <span className="text-[12px] text-[#6B5D56] dark:text-[#C5B9B0]">Ghi nhớ đăng nhập</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[46px] py-3 bg-[#B55841] text-white rounded-2xl text-[14px] font-bold shadow-sm hover:bg-[#9E4A35] transition-colors cursor-pointer disabled:opacity-60 mt-2 whitespace-nowrap"
          >
            {isSubmitting ? 'Đang xác thực phiên...' : mode === 'login' ? 'Đăng nhập ngay' : 'Tạo tài khoản Nova'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#E6DDD1] dark:bg-[#362E2A]" />
          <span className="text-[10.5px] font-bold text-[#786962] dark:text-[#B5A89F] tracking-wider">
            HOẶC TIẾP TỤC VỚI
          </span>
          <div className="flex-1 h-px bg-[#E6DDD1] dark:bg-[#362E2A]" />
        </div>

        <div className="p-4 bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A]">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C4A46B]" />
            <span className="text-[12px] font-bold text-[#322622] dark:text-[#F4EDE6]">
              Đăng nhập nhanh theo vai trò (Phiên ký HMAC)
            </span>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => handleQuickLogin('khanhbang')}
              disabled={isSubmitting}
              className="w-full min-h-[48px] p-2.5 bg-[#FAF6F0] dark:bg-[#231E1B] rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#B55841] flex items-center justify-between text-left cursor-pointer transition-colors"
            >
              <div>
                <p className="text-[12px] font-bold text-[#322622] dark:text-[#F4EDE6]">Khánh Băng (VIP · Tuần 24)</p>
                <p className="text-[10.5px] text-[#786962] dark:text-[#B5A89F]">khanhbang.mom@gmail.com · Thành viên</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#B55841] dark:text-[#D47A63]" />
            </button>

            <button
              onClick={() => handleQuickLogin('lanhuong')}
              disabled={isSubmitting}
              className="w-full min-h-[48px] p-2.5 bg-[#FAF6F0] dark:bg-[#231E1B] rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#6D8572] flex items-center justify-between text-left cursor-pointer transition-colors"
            >
              <div>
                <p className="text-[12px] font-bold text-[#322622] dark:text-[#F4EDE6]">Mẹ Lan Hương (Tuần 12)</p>
                <p className="text-[10.5px] text-[#786962] dark:text-[#B5A89F]">lanhuong.mom@gmail.com · Thành viên</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#4F6B56] dark:text-[#8DA892]" />
            </button>

            <button
              onClick={() => handleQuickLogin('moderator')}
              disabled={isSubmitting}
              className="w-full min-h-[48px] p-2.5 bg-[#FAF6F0] dark:bg-[#231E1B] rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#C4A46B] flex items-center justify-between text-left cursor-pointer transition-colors"
            >
              <div>
                <p className="text-[12px] font-bold text-[#9E5B3B] dark:text-[#D7BA86]">Điều phối viên Thu Hà (Moderator)</p>
                <p className="text-[10.5px] text-[#786962] dark:text-[#B5A89F]">moderator@novacare.vn · Kiểm duyệt nội dung & báo cáo</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#9E5B3B] dark:text-[#D7BA86]" />
            </button>

            <button
              onClick={() => handleQuickLogin('admin')}
              disabled={isSubmitting}
              className="w-full min-h-[48px] p-2.5 bg-[#FAF6F0] dark:bg-[#231E1B] rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#B55841] flex items-center justify-between text-left cursor-pointer transition-colors"
            >
              <div>
                <p className="text-[12px] font-bold text-[#B55841] dark:text-[#D47A63]">Quản trị viên Nova (Admin)</p>
                <p className="text-[10.5px] text-[#786962] dark:text-[#B5A89F]">admin@novacare.vn · Toàn quyền hệ thống & cửa hàng</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#B55841] dark:text-[#D47A63]" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-4 text-[11px] text-[#786962] dark:text-[#B5A89F]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#4F6B56] dark:text-[#8DA892]" />
          <span>Phiên làm việc được ký xác thực HMAC-SHA256</span>
        </div>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161311]/60 backdrop-blur-xs">
          <div className="bg-[#FAF6F0] dark:bg-[#1E1A17] rounded-3xl p-5 w-full max-w-[340px] shadow-2xl border border-[#E6DDD1] dark:border-[#362E2A]">
            <h3 className="font-editorial text-[18px] font-bold text-[#322622] dark:text-[#F4EDE6] mb-1">
              Khôi phục mật khẩu
            </h3>
            <p className="text-[12px] text-[#6B5D56] dark:text-[#C5B9B0] mb-3">
              Nhập số điện thoại để nhận mã xác thực OTP 6 số.
            </p>
            {!otpSent ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={forgotPhone}
                  onChange={(e) => setForgotPhone(e.target.value)}
                  placeholder="Nhập số điện thoại..."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-[13px] text-[#322622] dark:text-[#F4EDE6]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 min-h-[44px] py-2 rounded-xl border border-[#E6DDD1] dark:border-[#362E2A] text-[12px] font-semibold text-[#6B5D56] dark:text-[#C5B9B0] cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      setOtpSent(true);
                      triggerToast('Mã xác thực thử nghiệm: 886622');
                    }}
                    className="flex-1 min-h-[44px] py-2 rounded-xl bg-[#B55841] hover:bg-[#9E4A35] text-white text-[12px] font-bold cursor-pointer"
                  >
                    Gửi mã OTP
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-2.5 bg-[#F7EAE5] dark:bg-[#35231E] rounded-xl border border-[#EBCDC2] dark:border-[#52352D] text-center">
                  <span className="text-[11px] text-[#B55841] dark:text-[#D47A63] font-bold tabular-nums">
                    Mã OTP thử nghiệm: 886622
                  </span>
                </div>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Nhập mã 6 số"
                  maxLength={6}
                  className="w-full text-center tracking-widest px-3.5 py-2.5 bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-[16px] font-bold text-[#322622] dark:text-[#F4EDE6] tabular-nums"
                />
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    handleQuickLogin('khanhbang');
                  }}
                  className="w-full min-h-[44px] py-2.5 rounded-xl bg-[#4F6B56] hover:bg-[#3F5745] text-white text-[13px] font-bold cursor-pointer"
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

