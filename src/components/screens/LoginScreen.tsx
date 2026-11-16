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
  X,
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
  const [otpError, setOtpError] = useState('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3200);
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
        colors: ['#51483F', '#A3A795', '#B8AA98', '#EDE7DE'],
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
        name: 'Mẹ bầu trải nghiệm',
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
        colors: ['#51483F', '#A3A795', '#B8AA98', '#EDE7DE'],
      });
    } catch {}

    await finalizeSessionAndLogin(user);
  };

  const handleVerifyOtp = () => {
    if (otpCode.trim() !== '886622') {
      setOtpError('Mã OTP chưa chính xác. Vui lòng nhập đúng mã thử nghiệm 886622.');
      triggerToast('Mã OTP chưa chính xác');
      return;
    }
    setOtpError('');
    setShowForgotModal(false);
    setOtpSent(false);
    setOtpCode('');
    handleQuickLogin('khanhbang');
  };

  return (
    <div className="flex-1 flex flex-col bg-nova-bg overflow-y-auto no-scrollbar select-none">
      {notificationMsg && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-nova-accent text-nova-accent-contrast border border-nova-border text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{notificationMsg}</span>
        </div>
      )}

      <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-nova-border">
        <button
          onClick={onBack}
          aria-label="Quay lại"
          className="w-9 h-9 rounded-full bg-nova-surface border border-nova-border shadow-2xs flex items-center justify-center text-nova-text-muted hover:bg-nova-bg-subtle transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-[12px] font-bold text-nova-text-muted tracking-wider uppercase">
          Tài khoản Nova Việt Mẫu
        </span>
        <button
          onClick={() => handleQuickLogin('guest')}
          disabled={isSubmitting}
          className="text-[12px] font-bold text-nova-accent hover:underline cursor-pointer whitespace-nowrap"
        >
          Dùng thử
        </button>
      </div>

      <div className="px-6 pt-3 pb-10 flex flex-col max-w-md w-full mx-auto">
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-3 w-14 h-14 rounded-2xl bg-nova-accent-soft border border-nova-border flex items-center justify-center text-nova-accent shadow-xs"
          >
            <NovaBrandMark className="w-8 h-8" />
          </motion.div>
          <h2 className="font-editorial text-[24px] font-bold text-nova-text tracking-tight leading-snug">
            Chào mừng mẹ đến với Nova
          </h2>
          <p className="text-[13px] text-nova-text-muted mt-1 max-w-[290px] leading-relaxed">
            Đồng hành chăm sóc sức khỏe dịu dàng cho mẹ bầu và em bé từng ngày
          </p>
        </div>

        <div className="flex p-1 bg-nova-bg-subtle border border-nova-border rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 min-h-[40px] py-2 text-[13px] font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              mode === 'login'
                ? 'bg-nova-surface text-nova-text shadow-2xs'
                : 'text-nova-text-muted hover:text-nova-text'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 min-h-[40px] py-2 text-[13px] font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              mode === 'register'
                ? 'bg-nova-surface text-nova-text shadow-2xs'
                : 'text-nova-text-muted hover:text-nova-text'
            }`}
          >
            Đăng ký mới
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[11.5px] font-bold text-nova-text-muted mb-1">
                  Họ và tên của mẹ
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-nova-icon absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Khánh Băng"
                    className="w-full pl-10 pr-4 py-2.5 bg-nova-surface border border-nova-border rounded-xl text-[13.5px] text-nova-text focus:outline-none focus:border-nova-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] font-bold text-nova-text-muted mb-1">
                    Tuần thai (1 - 40)
                  </label>
                  <div className="relative">
                    <Heart className="w-4 h-4 text-nova-icon absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="1"
                      max="42"
                      value={pregnancyWeek}
                      onChange={(e) => setPregnancyWeek(Number(e.target.value))}
                      className="w-full pl-10 pr-3 py-2.5 bg-nova-surface border border-nova-border rounded-xl text-[13.5px] text-nova-text tabular-nums focus:outline-none focus:border-nova-accent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11.5px] font-bold text-nova-text-muted mb-1">
                    Biệt danh của bé
                  </label>
                  <div className="relative">
                    <Baby className="w-4 h-4 text-nova-icon absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={babyNickname}
                      onChange={(e) => setBabyNickname(e.target.value)}
                      placeholder="Bé Bơ, Bé Đậu..."
                      className="w-full pl-10 pr-3 py-2.5 bg-nova-surface border border-nova-border rounded-xl text-[13.5px] text-nova-text focus:outline-none focus:border-nova-accent"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11.5px] font-bold text-nova-text-muted mb-1">
              Số điện thoại hoặc thư điện tử
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-nova-icon absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={accountInput}
                onChange={(e) => setAccountInput(e.target.value)}
                placeholder="0987 654 321 hoặc email@..."
                className="w-full pl-10 pr-4 py-2.5 bg-nova-surface border border-nova-border rounded-xl text-[13.5px] text-nova-text focus:outline-none focus:border-nova-accent"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11.5px] font-bold text-nova-text-muted">Mật khẩu</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpCode('');
                    setOtpError('');
                    setShowForgotModal(true);
                  }}
                  className="text-[11px] font-semibold text-nova-accent hover:underline cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-nova-icon absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full pl-10 pr-10 py-2.5 bg-nova-surface border border-nova-border rounded-xl text-[13.5px] text-nova-text focus:outline-none focus:border-nova-accent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-nova-icon hover:text-nova-text cursor-pointer"
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
                  className="w-4 h-4 rounded accent-nova-accent"
                />
                <span className="text-[12px] text-nova-text-muted">Ghi nhớ đăng nhập</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[46px] py-3 bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast rounded-2xl text-[14px] font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-60 mt-2 whitespace-nowrap"
          >
            {isSubmitting ? 'Đang xác thực...' : mode === 'login' ? 'Đăng nhập ngay' : 'Tạo tài khoản Nova'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-nova-border" />
          <span className="text-[10.5px] font-bold text-nova-text-muted tracking-wider">
            HOẶC TIẾP TỤC VỚI
          </span>
          <div className="flex-1 h-px bg-nova-border" />
        </div>

        <div className="p-4 bg-nova-surface rounded-3xl border border-nova-border">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-nova-taupe" />
            <span className="text-[12px] font-bold text-nova-text">
              Đăng nhập nhanh theo vai trò
            </span>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => handleQuickLogin('khanhbang')}
              disabled={isSubmitting}
              className="w-full min-h-[48px] p-2.5 bg-nova-bg-subtle rounded-2xl border border-nova-border hover:border-nova-accent flex items-center justify-between text-left cursor-pointer transition-colors"
            >
              <div>
                <p className="text-[12px] font-bold text-nova-text">Khánh Băng (VIP · Tuần 24)</p>
                <p className="text-[10.5px] text-nova-text-muted">khanhbang.mom@gmail.com · Thành viên</p>
              </div>
              <ChevronRight className="w-4 h-4 text-nova-accent" />
            </button>

            <button
              onClick={() => handleQuickLogin('lanhuong')}
              disabled={isSubmitting}
              className="w-full min-h-[48px] p-2.5 bg-nova-bg-subtle rounded-2xl border border-nova-border hover:border-nova-sage flex items-center justify-between text-left cursor-pointer transition-colors"
            >
              <div>
                <p className="text-[12px] font-bold text-nova-text">Mẹ Lan Hương (Tuần 12)</p>
                <p className="text-[10.5px] text-nova-text-muted">lanhuong.mom@gmail.com · Thành viên</p>
              </div>
              <ChevronRight className="w-4 h-4 text-nova-sage-text" />
            </button>

            <button
              onClick={() => handleQuickLogin('moderator')}
              disabled={isSubmitting}
              className="w-full min-h-[48px] p-2.5 bg-nova-bg-subtle rounded-2xl border border-nova-border hover:border-nova-taupe flex items-center justify-between text-left cursor-pointer transition-colors"
            >
              <div>
                <p className="text-[12px] font-bold text-nova-text">Điều phối viên Thu Hà</p>
                <p className="text-[10.5px] text-nova-text-muted">moderator@novacare.vn · Kiểm duyệt nội dung & báo cáo</p>
              </div>
              <ChevronRight className="w-4 h-4 text-nova-taupe" />
            </button>

            <button
              onClick={() => handleQuickLogin('admin')}
              disabled={isSubmitting}
              className="w-full min-h-[48px] p-2.5 bg-nova-bg-subtle rounded-2xl border border-nova-border hover:border-nova-accent flex items-center justify-between text-left cursor-pointer transition-colors"
            >
              <div>
                <p className="text-[12px] font-bold text-nova-accent">Quản trị viên Nova</p>
                <p className="text-[10.5px] text-nova-text-muted">admin@novacare.vn · Quản lý hệ thống & cửa hàng</p>
              </div>
              <ChevronRight className="w-4 h-4 text-nova-accent" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-4 text-[11px] text-nova-text-muted">
          <ShieldCheck className="w-3.5 h-3.5 text-nova-sage-text" />
          <span>Phiên làm việc được bảo mật và mã hóa an toàn</span>
        </div>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1B18]/60 backdrop-blur-xs">
          <div className="bg-nova-surface rounded-3xl p-5 w-full max-w-[340px] shadow-2xl border border-nova-border">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-editorial text-[18px] font-bold text-nova-text">
                Khôi phục mật khẩu
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setOtpSent(false);
                  setOtpCode('');
                  setOtpError('');
                }}
                aria-label="Đóng"
                className="w-8 h-8 rounded-full bg-nova-bg-subtle flex items-center justify-center text-nova-icon hover:text-nova-text cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[12px] text-nova-text-muted mb-3">
              Nhập số điện thoại để nhận mã xác thực OTP gồm 6 chữ số.
            </p>
            {!otpSent ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={forgotPhone}
                  onChange={(e) => setForgotPhone(e.target.value)}
                  placeholder="Nhập số điện thoại..."
                  className="w-full px-3.5 py-2.5 bg-nova-bg-subtle border border-nova-border rounded-xl text-[13px] text-nova-text"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 min-h-[44px] py-2 rounded-xl border border-nova-border text-[12px] font-semibold text-nova-text-muted cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!forgotPhone.trim()) {
                        triggerToast('Vui lòng nhập số điện thoại');
                        return;
                      }
                      setOtpSent(true);
                      setOtpError('');
                      triggerToast('Mã xác thực thử nghiệm: 886622');
                    }}
                    className="flex-1 min-h-[44px] py-2 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-[12px] font-bold cursor-pointer"
                  >
                    Gửi mã OTP
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-2.5 bg-nova-accent-soft rounded-xl border border-nova-border text-center">
                  <span className="text-[11px] text-nova-accent font-bold tabular-nums">
                    Mã OTP thử nghiệm: 886622
                  </span>
                </div>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value);
                    if (otpError) setOtpError('');
                  }}
                  placeholder="Nhập mã 6 số"
                  maxLength={6}
                  className="w-full text-center tracking-widest px-3.5 py-2.5 bg-nova-bg-subtle border border-nova-border rounded-xl text-[16px] font-bold text-nova-text tabular-nums"
                />
                {otpError && (
                  <p className="text-[11.5px] text-nova-danger font-medium text-center">
                    {otpError}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode('');
                      setOtpError('');
                    }}
                    className="px-4 min-h-[44px] py-2.5 rounded-xl border border-nova-border text-nova-text-muted text-[12px] font-semibold cursor-pointer"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-[13px] font-bold cursor-pointer"
                  >
                    Xác nhận & Đăng nhập
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
