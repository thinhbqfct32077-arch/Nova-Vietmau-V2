import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ASSETS } from '../../data/mockData';
import { UserProfile, DailyWaterRecord, HealthReminder } from '../../types';
import { storageService } from '../../services/storageService';
import {
  getPregnancySummary,
  formatDateVietnamese,
} from '../../services/pregnancyCalculator';
import { getWeekMilestone } from '../../data/pregnancyMilestones';
import {
  Bell,
  Mic,
  ChevronRight,
  Smile,
  Calendar,
  Sparkles,
  Droplet,
  Crown,
  Zap,
  ShieldAlert,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface HomeScreenProps {
  onOpenVoiceChat: () => void;
  onNavigateToCare: () => void;
  onOpenNotifications: () => void;
  onOpenVipModal: () => void;
  onOpenProfile?: () => void;
  onOpenEmergency?: () => void;
  user?: UserProfile;
  isVip?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenVoiceChat,
  onNavigateToCare,
  onOpenNotifications,
  onOpenVipModal,
  onOpenProfile,
  onOpenEmergency,
  user,
  isVip = false,
}) => {
  const [selectedMood, setSelectedMood] = useState<'happy' | 'calm' | 'tired' | 'excited'>('happy');
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showMilestoneDetail, setShowMilestoneDetail] = useState(false);

  // Dynamic clinical gestational age & milestone
  const pregnancySummary = getPregnancySummary(user || {});
  const weekMilestone = getWeekMilestone(pregnancySummary.weeks);

  // Live water and reminder from storage
  const [todayWater, setTodayWater] = useState<DailyWaterRecord>(() =>
    storageService.getWaterRecord()
  );
  const [activeReminders, setActiveReminders] = useState<HealthReminder[]>(() =>
    storageService.loadHealthReminders().filter((r) => r.isEnabled)
  );

  useEffect(() => {
    const handleStorage = () => {
      setTodayWater(storageService.getWaterRecord());
      setActiveReminders(storageService.loadHealthReminders().filter((r) => r.isEnabled));
    };
    window.addEventListener('nova_storage_update', handleStorage);
    return () => window.removeEventListener('nova_storage_update', handleStorage);
  }, []);

  const nextReminder = activeReminders[0];

  const moodLabels = {
    happy: { text: 'Rất vui vẻ', emoji: '😊', color: '#F39C12' },
    calm: { text: 'Bình yên', emoji: '😌', color: '#27AE60' },
    tired: { text: 'Hơi mỏi lưng', emoji: '🥱', color: '#8E44AD' },
    excited: { text: 'Háo hức', emoji: '🥰', color: '#C84B4B' },
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 420,
        damping: 28,
      },
    },
  };

  return (
    <div className="flex-1 flex flex-col px-5 pt-3 pb-6 overflow-y-auto no-scrollbar select-none bg-[#FFFBF7]">
      {/* Top Header */}
      <header className="flex items-center justify-between py-2 mb-3">
        {/* User Profile with Tactile Tap */}
        <motion.div
          whileTap={{ scale: 0.95 }}
          onClick={onOpenProfile}
          className="flex items-center gap-3 cursor-pointer group"
          title="Chạm để xem hồ sơ và đổi ảnh đại diện"
        >
          <div className="relative">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-[#EFEAE5] transition-transform group-hover:scale-105">
              <img
                src={user?.avatar || ASSETS.motherAvatar}
                alt={user?.name || 'Khánh Băng'}
                className="w-full h-full object-cover"
                loading="eager"
                referrerPolicy="no-referrer"
              />
            </div>
            {isVip ? (
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-tr from-[#D4AF37] to-[#F5D77F] rounded-full border-2 border-white flex items-center justify-center text-[#2A2321] shadow-xs"
                title="Hội viên VIP"
              >
                <Crown className="w-2.5 h-2.5 fill-current" />
              </motion.div>
            ) : (
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#2ECC71] rounded-full border-2 border-white shadow-xs" />
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-normal text-[#8C7B75] leading-tight">
                Chào mẹ,
              </span>
              {isVip && (
                <span className="text-[9px] font-black bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-white px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-xs">
                  VIP
                </span>
              )}
            </div>
            <span className="text-[17px] font-bold text-[#3A2E2B] leading-tight tracking-tight group-hover:text-[#C84B4B] transition-colors">
              {user?.name || 'Khánh Băng'}
            </span>
          </div>
        </motion.div>

        {/* Right Action Buttons: Emergency SOS + Notification Bell */}
        <div className="flex items-center gap-2">
          {/* Quick SOS Emergency Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={onOpenEmergency}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FDF2F0] border border-[#FADCD5] text-[#E74C3C] text-[11px] font-black shadow-xs cursor-pointer hover:bg-[#FCEAE6] transition-colors active:scale-95"
            title="Số điện thoại cấp cứu 115 & Bệnh viện phụ sản"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#E74C3C]" />
            <span>SOS</span>
          </motion.button>

          {/* Notification Bell Button with iOS Tap Dynamics */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
            onClick={onOpenNotifications}
            className="w-10 h-10 rounded-full bg-white border border-[#EFEAE5] shadow-xs flex items-center justify-center text-[#3A2E2B] relative hover:bg-[#FAF6F3] cursor-pointer"
            aria-label="Thông báo thai kỳ"
          >
            <Bell className="w-5 h-5 text-[#3A2E2B] stroke-[1.8]" />
            <motion.span
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C84B4B] ring-2 ring-white"
            />
          </motion.button>
        </div>
      </header>

      {/* Main Animated List Stagger */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-3.5"
      >
        {/* Card: HÀNH TRÌNH TUẦN NÀY DYNAMIC VỚI TUỔI THAI THẬT */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="relative bg-[#FCEEEB] rounded-[26px] p-5 shadow-xs border border-[#F6DDD7]/80 overflow-hidden"
        >
          {/* Subtle Ambient Refraction Glow */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/50 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            {/* Left Texts */}
            <div className="flex-1 pr-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold tracking-wider text-[#C84B4B] uppercase">
                  HÀNH TRÌNH TUẦN NÀY
                </span>
                <span className="text-[10px] font-semibold bg-white/80 text-[#C84B4B] px-2 py-0.5 rounded-full border border-[#FADBD8]">
                  {pregnancySummary.daysRemaining > 0
                    ? `Còn ${pregnancySummary.daysRemaining} ngày`
                    : 'Đã đến ngày dự sinh'}
                </span>
              </div>

              <h2 className="text-[25px] font-extrabold text-[#3A2E2B] tracking-tight leading-none mb-1.5">
                Tuần {pregnancySummary.weeks}
                {pregnancySummary.days > 0 && (
                  <span className="text-[16px] font-medium text-[#8C7B75] ml-1.5">
                    ngày {pregnancySummary.days}
                  </span>
                )}
              </h2>

              <p className="text-[13px] font-medium text-[#8C7B75] flex items-center gap-1.5 mb-2">
                <span>{user?.babyNickname ? `Bé ${user.babyNickname}` : 'Thiên thần nhỏ'}</span>
                <span className="w-1 h-1 rounded-full bg-[#8C7B75]/50" />
                <span className="text-[#C84B4B] font-semibold">
                  Tam cá nguyệt {pregnancySummary.trimester}
                </span>
              </p>

              <p className="text-[11.5px] text-[#5C4A42] leading-relaxed line-clamp-2">
                {weekMilestone.babyDevelopment}
              </p>
            </div>

            {/* Right Dynamic Fruit Box with 3D Float Animation */}
            <motion.div
              onClick={() => setShowMilestoneDetail(!showMilestoneDetail)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92, rotate: -2 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className="w-24 h-24 rounded-2xl bg-[#E8F3EE] border border-[#D3E8DF] shadow-inner flex flex-col items-center justify-center relative cursor-pointer group shrink-0"
              title="Nhấn để xem chi tiết tuần thai"
            >
              <motion.div
                animate={{
                  y: [0, -4, 0],
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 3,
                  ease: 'easeInOut',
                  repeat: Infinity,
                }}
                className="text-4xl leading-none drop-shadow-sm select-none"
              >
                {pregnancySummary.fruitComparison.fruitEmoji}
              </motion.div>

              <span className="text-[10px] font-bold text-[#2D6A4F] mt-1.5 bg-white/90 px-2 py-0.5 rounded-full shadow-2xs backdrop-blur-xs text-center max-w-[84px] truncate">
                {pregnancySummary.fruitComparison.fruitName}
              </span>
            </motion.div>
          </div>

          {/* Quick Expand Milestone Details */}
          <AnimatePresence>
            {showMilestoneDetail && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="mt-3 pt-3 border-t border-[#F2D6CF] text-xs text-[#523F3A] flex flex-col gap-2 overflow-hidden"
              >
                <div className="flex items-center justify-between font-medium">
                  <span>
                    📏 Kích thước: {pregnancySummary.fruitComparison.lengthDescription} · ⚖️{' '}
                    {pregnancySummary.fruitComparison.weightDescription}
                  </span>
                  <button
                    onClick={() => setShowMilestoneDetail(false)}
                    className="text-[11px] font-bold text-[#C84B4B] underline cursor-pointer"
                  >
                    Thu gọn
                  </button>
                </div>

                <div className="bg-white/70 p-2.5 rounded-xl border border-[#F2D6CF] flex flex-col gap-1.5">
                  <p className="text-[11px] leading-relaxed">
                    <strong className="text-[#3A2E2B]">Thay đổi ở mẹ:</strong>{' '}
                    {weekMilestone.motherChanges}
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    <strong className="text-[#3A2E2B]">Dinh dưỡng vàng:</strong>{' '}
                    {weekMilestone.nutritionAdvice}
                  </p>
                  {weekMilestone.checkupMilestone && (
                    <p className="text-[11px] text-[#C84B4B] font-semibold leading-relaxed bg-[#FFF0ED] p-1.5 rounded-lg border border-[#FADBD8]">
                      🩺 {weekMilestone.checkupMilestone}
                    </p>
                  )}
                </div>

                <p className="text-[9.5px] text-[#8C7B75] italic">
                  Nguồn: {weekMilestone.medicalSource}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Grid 2 Cột: Thẻ "Tâm trạng" & Thẻ "Lịch nhắc" with iOS Spatial Press (Hình 5) */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
          {/* Card 1: Tâm trạng */}
          <motion.div
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 450, damping: 24 }}
            onClick={() => setShowMoodPicker(!showMoodPicker)}
            className="bg-white rounded-[22px] p-4 ios-card-shadow border border-[#F2ECE7] flex flex-col justify-between cursor-pointer relative group hover:border-[#E8DFD8] transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-full bg-[#FEF6E9] flex items-center justify-center text-[#F39C12] transition-transform group-hover:scale-110">
                <Smile className="w-5 h-5 stroke-[2]" />
              </div>
              <motion.span
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="text-xl"
              >
                {moodLabels[selectedMood].emoji}
              </motion.span>
            </div>

            <div>
              <h3 className="text-[15px] font-bold text-[#3A2E2B] leading-tight">
                Tâm trạng
              </h3>
              <p className="text-[12px] font-medium text-[#8C7B75] mt-1">
                {moodLabels[selectedMood].text}
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#C84B4B] font-semibold">
              <span>Chạm để đổi</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.div>

          {/* Card 2: Lịch nhắc */}
          <motion.div
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 450, damping: 24 }}
            onClick={onNavigateToCare}
            className="bg-white rounded-[22px] p-4 ios-card-shadow border border-[#F2ECE7] flex flex-col justify-between cursor-pointer relative group hover:border-[#E8DFD8] transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-full bg-[#FCEEEB] flex items-center justify-center text-[#C84B4B] transition-transform group-hover:scale-110">
                <Calendar className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-[10px] font-bold bg-[#FCEEEB] text-[#C84B4B] px-2 py-0.5 rounded-full">
                {nextReminder ? nextReminder.time : 'Chăm sóc'}
              </span>
            </div>

            <div>
              <h3 className="text-[15px] font-bold text-[#3A2E2B] leading-tight">
                Lịch nhắc
              </h3>
              <p className="text-[12px] font-medium text-[#8C7B75] mt-1 line-clamp-1">
                {nextReminder ? nextReminder.title : 'Khám mốc 12w'}
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#C84B4B] font-semibold">
              <span>Xem chi tiết</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.div>
        </motion.div>

        {/* Mood Quick Selector Drawer with Fluid Spring Morph */}
        <AnimatePresence>
          {showMoodPicker && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, scale: 0.95, filter: 'blur(4px)' }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl p-3 border border-[#F0ECE9] shadow-lg flex items-center justify-around"
            >
              {(Object.keys(moodLabels) as (keyof typeof moodLabels)[]).map((key) => {
                const isCurrent = selectedMood === key;
                return (
                  <motion.button
                    key={key}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => {
                      setSelectedMood(key);
                      setShowMoodPicker(false);
                    }}
                    className={`flex flex-col items-center p-2 rounded-xl transition-all cursor-pointer ${
                      isCurrent ? 'bg-[#FCEEEB] scale-105 shadow-2xs' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl mb-1">{moodLabels[key].emoji}</span>
                    <span
                      className={`text-[11px] font-medium ${
                        isCurrent ? 'text-[#C84B4B] font-bold' : 'text-[#8C7B75]'
                      }`}
                    >
                      {moodLabels[key].text}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* VIP Nova Banner with Light Shimmer Sweep & Depth Press */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2, scale: 1.015 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          onClick={onOpenVipModal}
          className="relative rounded-[22px] p-4 bg-gradient-to-r from-[#2F2725] via-[#3A2E2B] to-[#251E1C] text-white shadow-lg border border-[#D4AF37]/35 flex items-center justify-between cursor-pointer overflow-hidden group animate-shimmer-sweep"
        >
          {/* Subtle gold shine effect */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#D4AF37]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#B38728] via-[#FBF5B7] to-[#DAA520] p-0.5 shadow-md group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-[14px] bg-[#2A2321] flex items-center justify-center text-[#F5D77F]">
                <Crown className="w-5 h-5 fill-current" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-[14px] font-extrabold text-[#FDF5E6] tracking-tight">
                  {isVip ? 'Gói Nova VIP Đang Hoạt Động' : 'Nâng cấp Nova VIP'}
                </h4>
                {!isVip && (
                  <span className="text-[9px] font-black bg-[#D4AF37] text-[#2C2416] px-1.5 py-0.2 rounded-full uppercase shadow-xs">
                    99k/tháng
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/70 mt-0.5">
                {isVip
                  ? 'Đã mở khóa toàn bộ đặc quyền y khoa & giảm 10%'
                  : 'Hỏi đáp AI 24/7 & Giảm 10% tại Cửa hàng'}
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-[#D4AF37] group-hover:text-[#2A2321] text-white flex items-center justify-center transition-all relative z-10">
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </motion.div>

        {/* Banner: "Trợ lý ảo Nova" with Multi-Tier Acoustic Aura (Hình 5) */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2, scale: 1.015 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          onClick={onOpenVoiceChat}
          className="bg-white rounded-[22px] p-4 ios-card-shadow border border-[#F2ECE7] flex items-center justify-between cursor-pointer hover:border-[#E8DFD8] transition-all relative overflow-hidden group"
        >
          {/* Left Icon with Multi-Tier Radiating Fluid Rings */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
                className="absolute w-12 h-12 rounded-full bg-[#C84B4B]/25 pointer-events-none"
              />
              <motion.div
                animate={{ scale: [1, 2.2], opacity: [0.35, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.7 }}
                className="absolute w-12 h-12 rounded-full bg-[#F59E0B]/20 pointer-events-none"
              />

              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#C84B4B] to-[#D8574B] text-white flex items-center justify-center shadow-md shadow-[#C84B4B]/35 relative z-10 transition-transform group-hover:scale-105">
                <Mic className="w-6 h-6 stroke-[2.2]" />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <h3 className="text-[16px] font-bold text-[#3A2E2B] tracking-tight">
                  Trợ lý ảo Nova
                </h3>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C84B4B] animate-pulse" />
              </div>
              <p className="text-[12px] font-medium text-[#8C7B75] mt-0.5">
                Nói chuyện hoặc hỏi đáp thai kỳ
              </p>
            </div>
          </div>

          {/* Right Arrow */}
          <div className="w-8 h-8 rounded-full bg-[#FAF6F3] flex items-center justify-center text-[#8C7B75] group-hover:bg-[#FCEEEB] group-hover:text-[#C84B4B] transition-colors">
            <ChevronRight className="w-5 h-5 stroke-[2.2]" />
          </div>
        </motion.div>

        {/* Daily Healthy Tip Banner */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNavigateToCare}
          className="bg-[#FAF7F4] rounded-[20px] p-3.5 border border-[#EDE7E2] flex items-center gap-3 cursor-pointer transition-all hover:bg-[#F7F2ED]"
        >
          <div className="w-8 h-8 rounded-xl bg-[#E8F4F8] text-[#2980B9] flex items-center justify-center shrink-0">
            <Droplet className="w-4 h-4 fill-current" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-[#3A2E2B]">
                Lượng nước hôm nay: {todayWater.currentMl} / {todayWater.targetMl} ml
              </p>
              {todayWater.isCompleted && (
                <span className="text-[9.5px] font-bold bg-[#2ECC71] text-white px-1.5 py-0.2 rounded-md">
                  Đạt
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#8C7B75]">
              {todayWater.isCompleted
                ? 'Mẹ đã hoàn thành chỉ tiêu nước hôm nay! Chạm để xem chi tiết.'
                : 'Chạm để ghi nhận nhanh các cữ uống nước và xem lịch sử.'}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8C7B75]" />
        </motion.div>
      </motion.div>
    </div>
  );
};
