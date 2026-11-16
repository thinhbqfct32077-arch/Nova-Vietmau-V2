import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSETS, NOVA_VIDEOS_DATA, PRODUCTS_DATA } from '../../data/mockData';
import { ECOSYSTEM_BANNERS, INITIAL_LIBRARY_ARTICLES } from '../../data/ecosystemData';
import { UserProfile, DailyWaterRecord, HealthReminder, ScreenType } from '../../types';
import { storageService, ThemeMode } from '../../services/storageService';
import { getPregnancySummary } from '../../services/pregnancyCalculator';
import { getWeekMilestone } from '../../data/pregnancyMilestones';
import { NovaImage, NovaLotusDivider } from '../NovaBrandMark';
import {
  Bell,
  Mic,
  ChevronRight,
  ChevronDown,
  Smile,
  Calendar,
  Droplet,
  Crown,
  PhoneCall,
  Search,
  Sun,
  Moon,
  Compass,
  CheckSquare,
  Camera,
  FileBarChart2,
  BookOpen,
  HeartHandshake,
  ClipboardList,
  Baby,
  Award,
  ShieldCheck,
  Heart,
  Play,
  ShoppingBag,
} from 'lucide-react';

interface HomeScreenProps {
  onOpenVoiceChat: () => void;
  onNavigateToCare: () => void;
  onOpenNotifications: () => void;
  onOpenVipModal: () => void;
  onOpenProfile?: () => void;
  onOpenEmergency?: () => void;
  onNavigateScreen?: (screen: ScreenType) => void;
  onOpenGlobalSearch?: () => void;
  themeMode?: ThemeMode;
  onToggleTheme?: () => void;
  unreadNotificationsCount?: number;
  user?: UserProfile;
  isVip?: boolean;
}

function getGentleGreeting(): { title: string; subtitle: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) {
    return { title: 'Chào buổi sáng,', subtitle: 'Một ngày mới thật nhẹ nhàng cùng con nhé' };
  }
  if (hour >= 11 && hour < 14) {
    return { title: 'Buổi trưa dịu dàng,', subtitle: 'Nhớ nghỉ ngơi và dùng bữa ấm bụng mẹ nhé' };
  }
  if (hour >= 14 && hour < 18) {
    return { title: 'Buổi chiều an yên,', subtitle: 'Thư giãn đôi vai và hít thở chậm một chút' };
  }
  return { title: 'Buổi tối bình yên,', subtitle: 'Chúc hai mẹ con có một giấc ngủ êm sâu' };
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenVoiceChat,
  onNavigateToCare,
  onOpenNotifications,
  onOpenVipModal,
  onOpenProfile,
  onOpenEmergency,
  onNavigateScreen,
  onOpenGlobalSearch,
  themeMode = 'light',
  onToggleTheme,
  unreadNotificationsCount = 0,
  user,
  isVip = false,
}) => {
  const [selectedMood, setSelectedMood] = useState<'happy' | 'calm' | 'tired' | 'excited'>('calm');
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showMilestoneDetail, setShowMilestoneDetail] = useState(false);
  const [showAllTools, setShowAllTools] = useState(false);

  const pregnancySummary = getPregnancySummary(user || {});
  const weekMilestone = getWeekMilestone(pregnancySummary.weeks);
  const greeting = getGentleGreeting();

  const [todayWater, setTodayWater] = useState<DailyWaterRecord>(() =>
    storageService.getWaterRecord()
  );
  const [activeReminders, setActiveReminders] = useState<HealthReminder[]>(() =>
    storageService.loadHealthReminders(user?.id).filter((r) => r.isEnabled)
  );

  useEffect(() => {
    const syncReminders = () => {
      setTodayWater(storageService.getWaterRecord());
      setActiveReminders(storageService.loadHealthReminders(user?.id).filter((r) => r.isEnabled));
    };
    syncReminders();
    window.addEventListener('nova_storage_update', syncReminders);
    return () => window.removeEventListener('nova_storage_update', syncReminders);
  }, [user?.id]);

  const nextReminder = activeReminders[0];

  const moodLabels = {
    calm: { text: 'Bình yên', emoji: '🌿' },
    happy: { text: 'Vui vẻ', emoji: '☀️' },
    excited: { text: 'Háo hức', emoji: '🤍' },
    tired: { text: 'Hơi mệt nhẹ', emoji: '🌙' },
  };

  const isStaff = user?.role === 'admin' || user?.role === 'moderator';

  const coreShortcuts: {
    id: ScreenType;
    title: string;
    sub: string;
    icon: React.ComponentType<{ className?: string }>;
    tint: string;
  }[] = [
    {
      id: 'care',
      title: 'Chăm sóc & Nhật ký',
      sub: 'Uống nước, lịch nhắc',
      icon: Heart,
      tint: 'bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63]',
    },
    {
      id: 'journey',
      title: 'Hành trình 40 tuần',
      sub: `Đang ở tuần ${pregnancySummary.weeks}`,
      icon: Compass,
      tint: 'bg-[#EBF1EC] dark:bg-[#1E2922] text-[#263E35] dark:text-[#8DA892]',
    },
    {
      id: 'checklist',
      title: 'Checklist mẹ bầu',
      sub: 'Giỏ đồ & khám thai',
      icon: CheckSquare,
      tint: 'bg-[#F2ECE3] dark:bg-[#231E1B] text-[#9E5B3B] dark:text-[#D7BA86]',
    },
    {
      id: 'library',
      title: 'Thư viện y khoa',
      sub: 'Chuẩn Bộ Y tế & WHO',
      icon: BookOpen,
      tint: 'bg-[#EBF1EC] dark:bg-[#1E2922] text-[#6D8572] dark:text-[#8DA892]',
    },
  ];

  const moreShortcuts: {
    id: ScreenType;
    title: string;
    sub: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'weekly', title: 'Thai kỳ theo tuần', sub: `Tuần ${pregnancySummary.weeks}`, icon: Calendar },
    { id: 'memories', title: 'Kỷ niệm & Siêu âm', sub: 'Lưu ảnh & thư cho con', icon: Camera },
    { id: 'birth_plan', title: 'Kế hoạch đi sinh', sub: 'Mong muốn & người thân', icon: ClipboardList },
    { id: 'family', title: 'Nova Family', sub: 'Chia sẻ cùng người thân', icon: HeartHandshake },
    { id: 'postpartum', title: 'Sau sinh & Em bé', sub: 'Theo dõi 0–12 tháng', icon: Baby },
    { id: 'report', title: 'Báo cáo sức khỏe', sub: 'Tổng hợp mang đi khám', icon: FileBarChart2 },
    ...(user?.rewardsEnabled !== false
      ? [{ id: 'rewards' as ScreenType, title: 'Ghi nhận nhẹ nhàng', sub: 'Dấu mốc yêu thương', icon: Award }]
      : []),
    ...(isStaff
      ? [{ id: 'admin' as ScreenType, title: 'Quản trị & Kiểm duyệt', sub: 'Kiểm duyệt nội dung', icon: ShieldCheck }]
      : []),
  ];

  // Curated week-relevant Library Article
  const curatedArticle =
    INITIAL_LIBRARY_ARTICLES.find(
      (a) =>
        typeof a.weekMin === 'number' &&
        typeof a.weekMax === 'number' &&
        pregnancySummary.weeks >= a.weekMin &&
        pregnancySummary.weeks <= a.weekMax
    ) || INITIAL_LIBRARY_ARTICLES[0];

  const curatedVideo = NOVA_VIDEOS_DATA[0];
  const curatedProducts = PRODUCTS_DATA.slice(0, 2);

  const waterPercent = Math.min(
    100,
    Math.round(((todayWater.currentMl || 0) / (todayWater.targetMl || 2200)) * 100)
  );

  return (
    <div className="flex-1 flex flex-col px-4 sm:px-6 pt-3 pb-8 overflow-y-auto no-scrollbar select-none bg-[#FAF6F0] dark:bg-[#161311]">
      {/* Warm Personal Top Bar */}
      <header className="flex items-center justify-between py-2 mb-3 gap-2">
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-3 cursor-pointer group min-w-0 text-left focus:outline-none"
          title="Chạm để xem hồ sơ cá nhân"
        >
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-full overflow-hidden border border-[#E6DDD1] dark:border-[#362E2A] bg-[#F2ECE3] dark:bg-[#231E1B]">
              <NovaImage
                src={user?.avatar || ASSETS.motherAvatar}
                alt={user?.name || 'Khánh Băng'}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
            {isVip && (
              <div className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-[#C4A46B] rounded-full border border-[#FAF6F0] dark:border-[#161311] flex items-center justify-center text-white">
                <Crown className="w-2.5 h-2.5 fill-current" />
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[11.5px] font-medium text-[#786962] dark:text-[#B5A89F] leading-tight">
              {greeting.title}
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-editorial text-[18px] font-semibold text-[#322622] dark:text-[#F4EDE6] leading-tight group-hover:text-[#B55841] dark:group-hover:text-[#D47A63] transition-colors truncate">
                {user?.name || 'Khánh Băng'}
              </span>
              {isVip && (
                <span className="text-[10px] font-semibold text-[#9E7B3B] dark:text-[#D7BA86] shrink-0">
                  · VIP
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Quiet Utility Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenGlobalSearch && (
            <button
              type="button"
              onClick={onOpenGlobalSearch}
              aria-label="Tìm kiếm"
              className="w-10 h-10 rounded-full bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-center text-[#322622] dark:text-[#F4EDE6] hover:border-[#B55841]/50 transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Đổi chế độ Sáng/Tối"
              className="lg:hidden w-10 h-10 rounded-full bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-center text-[#322622] dark:text-[#F4EDE6] cursor-pointer"
            >
              {themeMode === 'dark' ? (
                <Sun className="w-4 h-4 text-[#D7BA86]" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          )}
          {onOpenEmergency && (
            <button
              type="button"
              onClick={onOpenEmergency}
              className="flex items-center gap-1 px-3 py-2 rounded-full bg-[#F7EAE5] dark:bg-[#35231E] border border-[#E6DDD1] dark:border-[#4A3630] text-[#A2402E] dark:text-[#E08975] text-[11px] font-semibold cursor-pointer hover:bg-[#EFE0D9] transition-colors whitespace-nowrap min-h-[40px]"
              title="Liên hệ khẩn cấp & 115"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>SOS</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="w-10 h-10 rounded-full bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-center text-[#322622] dark:text-[#F4EDE6] relative hover:border-[#B55841]/50 transition-colors cursor-pointer"
            aria-label="Thông báo thai kỳ"
          >
            <Bell className="w-4 h-4 stroke-[1.8]" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#B55841] dark:bg-[#D47A63] text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-5">
        {/* ======================================================= */}
        {/* 1. EDITORIAL HERO — WARM WELCOME & PREGNANCY MILESTONE   */}
        {/* ======================================================= */}
        <section className="rounded-[24px] bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] p-4 sm:p-5 nova-card-shadow">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Editorial Morning-Light Photograph */}
            <div className="md:col-span-5 relative rounded-[18px] overflow-hidden aspect-[4/3] bg-[#F2ECE3] dark:bg-[#231E1B]">
              <NovaImage
                src={ASSETS.homeHeroImg}
                alt="Không gian sáng sớm bình yên của mẹ bầu Việt Nam"
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#322622]/45 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[#FAF6F0]">
                <span className="text-[11.5px] font-medium drop-shadow-xs">
                  {greeting.subtitle}
                </span>
              </div>
            </div>

            {/* Warm Milestone Narrative */}
            <div className="md:col-span-7 flex flex-col justify-between gap-3">
              <div>
                <p className="text-[11.5px] font-semibold tracking-wide text-[#B55841] dark:text-[#D47A63] uppercase">
                  {user?.pregnancyStatus === 'postpartum'
                    ? 'Sau sinh & Đồng hành cùng bé'
                    : `Tam cá nguyệt ${pregnancySummary.trimester} · ${
                        pregnancySummary.daysRemaining > 0
                          ? `Còn ${pregnancySummary.daysRemaining} ngày`
                          : 'Ngày dự sinh cận kề'
                      }`}
                </p>

                <div className="flex items-start justify-between gap-3 mt-1.5">
                  <div className="min-w-0">
                    <h1 className="font-editorial text-[26px] sm:text-[30px] font-semibold text-[#322622] dark:text-[#F4EDE6] leading-tight tabular-nums">
                      {user?.pregnancyStatus === 'postpartum' ? (
                        <>Chăm sóc {user.babyNickname || 'Bé Bơ'}</>
                      ) : (
                        <>
                          Tuần {pregnancySummary.weeks}
                          {pregnancySummary.days > 0 && (
                            <span className="text-[17px] font-normal text-[#786962] dark:text-[#B5A89F] ml-1.5">
                              ngày {pregnancySummary.days}
                            </span>
                          )}
                        </>
                      )}
                    </h1>
                    <p className="text-[13px] text-[#786962] dark:text-[#B5A89F] mt-0.5">
                      {user?.babyNickname ? `Cùng ${user.babyNickname}` : 'Cùng thiên thần nhỏ'} ·{' '}
                      <span className="text-[#263E35] dark:text-[#8DA892] font-medium">
                        Kích thước như {pregnancySummary.fruitComparison.fruitName}
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMilestoneDetail(!showMilestoneDetail)}
                    className="w-14 h-14 rounded-2xl bg-[#F2ECE3] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-center text-3xl shrink-0 cursor-pointer hover:border-[#C4A46B] transition-colors"
                    title="Chạm để xem chi tiết phát triển tuần này"
                  >
                    {pregnancySummary.fruitComparison.fruitEmoji}
                  </button>
                </div>

                <p className="text-[13px] text-[#5A4C46] dark:text-[#CFC4BC] leading-relaxed mt-2.5 line-clamp-2">
                  {weekMilestone.babyDevelopment}
                </p>
              </div>

              {onNavigateScreen && (
                <div className="flex items-center flex-wrap gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      onNavigateScreen(user?.pregnancyStatus === 'postpartum' ? 'postpartum' : 'weekly')
                    }
                    className="px-4 py-2.5 rounded-xl bg-[#B55841] hover:bg-[#9E4A35] dark:bg-[#D47A63] dark:hover:bg-[#C36A53] text-white text-xs sm:text-[13px] font-semibold transition-colors cursor-pointer min-h-[44px] whitespace-nowrap"
                  >
                    {user?.pregnancyStatus === 'postpartum'
                      ? 'Mở nhật ký sau sinh'
                      : `Khám phá tuần ${pregnancySummary.weeks}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateScreen('journey')}
                    className="text-xs sm:text-[13px] font-semibold text-[#263E35] dark:text-[#8DA892] hover:text-[#B55841] dark:hover:text-[#D47A63] transition-colors cursor-pointer py-2 whitespace-nowrap flex items-center gap-1"
                  >
                    <span>Hành trình 40 tuần</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Expandable Baby Development Details */}
          <AnimatePresence>
            {showMilestoneDetail && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-3.5 border-t border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#5A4C46] dark:text-[#CFC4BC] space-y-2 overflow-hidden"
              >
                <div className="flex items-center justify-between font-medium">
                  <span className="tabular-nums">
                    Kích thước ước tính: {pregnancySummary.fruitComparison.lengthDescription} ·{' '}
                    {pregnancySummary.fruitComparison.weightDescription}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMilestoneDetail(false)}
                    className="text-[11.5px] font-semibold text-[#B55841] dark:text-[#D47A63] cursor-pointer"
                  >
                    Thu gọn
                  </button>
                </div>
                <div className="bg-[#FAF6F0] dark:bg-[#231E1B] p-3 rounded-xl space-y-1.5">
                  <p className="text-[12px] leading-relaxed">
                    <strong className="text-[#322622] dark:text-[#F4EDE6]">Thay đổi ở mẹ:</strong>{' '}
                    {weekMilestone.motherChanges}
                  </p>
                  <p className="text-[12px] leading-relaxed">
                    <strong className="text-[#322622] dark:text-[#F4EDE6]">Gợi ý dinh dưỡng:</strong>{' '}
                    {weekMilestone.nutritionAdvice}
                  </p>
                </div>
                <p className="text-[10.5px] text-[#786962] dark:text-[#B5A89F]">
                  Nguồn tham khảo: {weekMilestone.medicalSource}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <NovaLotusDivider label="Nhịp sống hôm nay" />

        {/* ======================================================= */}
        {/* 2. CURATED DAILY RHYTHM — GENTLE CARE WITHOUT PRESSURE  */}
        {/* ======================================================= */}
        <section className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Mood Check-in */}
            <button
              type="button"
              onClick={() => setShowMoodPicker(!showMoodPicker)}
              className="bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-2xl p-4 border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#C4A46B] transition-colors flex flex-col justify-between text-left cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#F2ECE3] dark:bg-[#231E1B] flex items-center justify-center text-[#9E5B3B] dark:text-[#D7BA86]">
                  <Smile className="w-4.5 h-4.5" />
                </div>
                <span className="text-lg">{moodLabels[selectedMood].emoji}</span>
              </div>
              <div>
                <p className="text-[11px] text-[#786962] dark:text-[#B5A89F]">Cảm xúc hôm nay</p>
                <h3 className="text-[14.5px] font-semibold text-[#322622] dark:text-[#F4EDE6] mt-0.5">
                  {moodLabels[selectedMood].text}
                </h3>
              </div>
            </button>

            {/* Next Reminder */}
            <button
              type="button"
              onClick={onNavigateToCare}
              className="bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-2xl p-4 border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#B55841]/60 transition-colors flex flex-col justify-between text-left cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#F7EAE5] dark:bg-[#35231E] flex items-center justify-center text-[#B55841] dark:text-[#D47A63]">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <span className="text-[11.5px] font-semibold text-[#B55841] dark:text-[#D47A63] tabular-nums">
                  {nextReminder ? nextReminder.time : 'Nhẹ nhàng'}
                </span>
              </div>
              <div>
                <p className="text-[11px] text-[#786962] dark:text-[#B5A89F]">Nhắc nhở sắp tới</p>
                <h3 className="text-[14.5px] font-semibold text-[#322622] dark:text-[#F4EDE6] mt-0.5 line-clamp-1">
                  {nextReminder ? nextReminder.title : 'Tự tạo lời nhắc riêng'}
                </h3>
              </div>
            </button>

            {/* Daily Warm Water */}
            <button
              type="button"
              onClick={onNavigateToCare}
              className="bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-2xl p-4 border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#6D8572]/60 transition-colors flex flex-col justify-between text-left cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#EBF1EC] dark:bg-[#1E2922] flex items-center justify-center text-[#263E35] dark:text-[#8DA892]">
                  <Droplet className="w-4.5 h-4.5" />
                </div>
                <span className="text-[11.5px] font-semibold text-[#6D8572] dark:text-[#8DA892] tabular-nums">
                  {todayWater.currentMl} / {todayWater.targetMl} ml
                </span>
              </div>
              <div>
                <p className="text-[11px] text-[#786962] dark:text-[#B5A89F]">Nước ấm hôm nay</p>
                <div className="w-full h-1.5 rounded-full bg-[#F2ECE3] dark:bg-[#231E1B] mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#6D8572] dark:bg-[#8DA892] transition-all"
                    style={{ width: `${waterPercent}%` }}
                  />
                </div>
              </div>
            </button>
          </div>

          <AnimatePresence>
            {showMoodPicker && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-2xl p-2.5 border border-[#E6DDD1] dark:border-[#362E2A] grid grid-cols-4 gap-2"
              >
                {(Object.keys(moodLabels) as (keyof typeof moodLabels)[]).map((key) => {
                  const isCurrent = selectedMood === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedMood(key);
                        setShowMoodPicker(false);
                      }}
                      className={`flex flex-col items-center py-2 px-1 rounded-xl cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63]'
                          : 'hover:bg-[#FAF6F0] dark:hover:bg-[#231E1B] text-[#786962] dark:text-[#B5A89F]'
                      }`}
                    >
                      <span className="text-xl mb-1">{moodLabels[key].emoji}</span>
                      <span className="text-[11px] font-medium whitespace-nowrap">
                        {moodLabels[key].text}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4 Curated Primary Shortcuts + Expandable Ecosystem Drawer */}
          {onNavigateScreen && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {coreShortcuts.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigateScreen(item.id)}
                      className="p-3 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#B55841]/50 flex items-center gap-2.5 text-left transition-colors cursor-pointer min-h-[58px]"
                    >
                      <div
                        className={`w-9 h-9 rounded-xl ${item.tint} flex items-center justify-center shrink-0`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-semibold text-[#322622] dark:text-[#F4EDE6] truncate">
                          {item.title}
                        </p>
                        <p className="text-[10.5px] text-[#786962] dark:text-[#B5A89F] truncate">
                          {item.sub}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllTools(!showAllTools)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#786962] dark:text-[#B5A89F] hover:text-[#B55841] dark:hover:text-[#D47A63] py-1.5 px-3 cursor-pointer transition-colors"
                >
                  <span>{showAllTools ? 'Thu gọn công cụ' : 'Mở tất cả công cụ thai kỳ & gia đình'}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${showAllTools ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>

              <AnimatePresence>
                {showAllTools && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 overflow-hidden pt-1"
                  >
                    {moreShortcuts.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onNavigateScreen(item.id)}
                          className="p-3 rounded-2xl bg-[#F2ECE3]/65 dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#B55841]/50 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                        >
                          <Icon className="w-4 h-4 text-[#B55841] dark:text-[#D47A63] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] truncate">
                              {item.title}
                            </p>
                            <p className="text-[10.5px] text-[#786962] dark:text-[#B5A89F] truncate">
                              {item.sub}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </section>

        <NovaLotusDivider label="Dành riêng cho mẹ tuần này" />

        {/* ======================================================= */}
        {/* 3. GENTLE DISCOVERY — KNOWLEDGE, VIDEO, MEMORIES & SHOP */}
        {/* ======================================================= */}
        <section className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Curated Library Read */}
            {onNavigateScreen && (
              <button
                type="button"
                onClick={() => onNavigateScreen('library')}
                className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#6D8572]/60 text-left transition-colors cursor-pointer flex flex-col justify-between gap-2"
              >
                <div>
                  <p className="text-[11px] font-semibold text-[#6D8572] dark:text-[#8DA892] uppercase tracking-wide">
                    Góc đọc chậm · {curatedArticle.readTimeMinutes} phút đọc
                  </p>
                  <h3 className="font-editorial text-[17px] font-semibold text-[#322622] dark:text-[#F4EDE6] mt-1 leading-snug">
                    {curatedArticle.title}
                  </h3>
                  <p className="text-[12.5px] text-[#786962] dark:text-[#B5A89F] mt-1.5 line-clamp-2 leading-relaxed">
                    {curatedArticle.summary}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E6DDD1] dark:border-[#362E2A] text-[11.5px]">
                  <span className="text-[#786962] dark:text-[#B5A89F] truncate">
                    {curatedArticle.medicalSource}
                  </span>
                  <span className="font-semibold text-[#B55841] dark:text-[#D47A63] shrink-0 whitespace-nowrap ml-2">
                    Đọc ngay →
                  </span>
                </div>
              </button>
            )}

            {/* Curated Video Thai Giáo */}
            {onNavigateScreen && curatedVideo && (
              <button
                type="button"
                onClick={() => onNavigateScreen('video')}
                className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#B55841]/50 text-left transition-colors cursor-pointer flex items-center gap-3.5"
              >
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-[#F2ECE3] dark:bg-[#231E1B] shrink-0">
                  <NovaImage
                    src={ASSETS.wellnessRitualImg}
                    alt={curatedVideo.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[#322622]/25 flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-[#FAF6F0]/90 text-[#B55841] flex items-center justify-center">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-[#B55841] dark:text-[#D47A63] uppercase tracking-wide">
                    Video thai giáo nhẹ nhàng
                  </p>
                  <h3 className="font-editorial text-[16px] font-semibold text-[#322622] dark:text-[#F4EDE6] mt-0.5 line-clamp-2 leading-snug">
                    {curatedVideo.title}
                  </h3>
                  <p className="text-[11.5px] text-[#786962] dark:text-[#B5A89F] mt-1 truncate">
                    {curatedVideo.channelName}
                  </p>
                </div>
              </button>
            )}
          </div>

          {/* Memories Vignette + Curated Gentle Shop */}
          {onNavigateScreen && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onNavigateScreen('memories')}
                className="rounded-2xl overflow-hidden bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#C4A46B] text-left transition-colors cursor-pointer flex items-center gap-3.5 p-3.5"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F2ECE3] dark:bg-[#231E1B] shrink-0">
                  <NovaImage
                    src={ECOSYSTEM_BANNERS.memoriesBanner}
                    alt="Kỷ niệm thai kỳ"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-[#9E7B3B] dark:text-[#D7BA86] uppercase tracking-wide">
                    Nhật ký hình ảnh & thư gửi con
                  </p>
                  <h4 className="font-editorial text-[15.5px] font-semibold text-[#322622] dark:text-[#F4EDE6] mt-0.5 truncate">
                    Lưu giữ khoảnh khắc bên {user?.babyNickname || 'Bé Bơ'}
                  </h4>
                  <p className="text-[12px] text-[#786962] dark:text-[#B5A89F] mt-0.5 line-clamp-1">
                    Ảnh siêu âm, nhật ký thai máy và những dòng thư đầu đời.
                  </p>
                </div>
              </button>

              <div className="rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] p-3.5 flex flex-col justify-between gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#B55841] dark:text-[#D47A63]" />
                    <span className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6]">
                      Chăm sóc lành tính được tuyển chọn
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateScreen('shop')}
                    className="text-[11.5px] font-semibold text-[#B55841] dark:text-[#D47A63] cursor-pointer whitespace-nowrap"
                  >
                    Ghé cửa hàng →
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {curatedProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onNavigateScreen('shop')}
                      className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] hover:bg-[#F2ECE3] dark:hover:bg-[#2A2420] text-left transition-colors cursor-pointer"
                    >
                      <NovaImage
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-[11.5px] font-semibold text-[#322622] dark:text-[#F4EDE6] truncate">
                          {p.name}
                        </p>
                        <p className="text-[10.5px] text-[#786962] dark:text-[#B5A89F] tabular-nums">
                          {p.price.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Warm Nova AI Companion & VIP Quiet Invitation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onOpenVoiceChat}
              className="bg-[#F2ECE3] dark:bg-[#231E1B] rounded-2xl p-4 border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#B55841]/50 flex items-center justify-between cursor-pointer text-left transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-[#B55841] dark:bg-[#D47A63] text-white flex items-center justify-center shrink-0">
                  <Mic className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-editorial text-[16px] font-semibold text-[#322622] dark:text-[#F4EDE6]">
                    Tâm sự cùng Nova AI
                  </h3>
                  <p className="text-[12px] text-[#786962] dark:text-[#B5A89F] truncate">
                    Giải đáp nhẹ nhàng bất cứ lúc nào mẹ thấy băn khoăn
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#786962] dark:text-[#B5A89F] shrink-0" />
            </button>

            <button
              type="button"
              onClick={onOpenVipModal}
              className="rounded-2xl p-4 bg-[#263E35] hover:bg-[#1E312A] text-[#FAF6F0] border border-[#C4A46B]/40 flex items-center justify-between cursor-pointer text-left transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-[#C4A46B]/20 border border-[#C4A46B]/40 flex items-center justify-center text-[#D7BA86] shrink-0">
                  <Crown className="w-5 h-5 fill-current" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-editorial text-[15.5px] font-semibold text-[#FAF6F0]">
                    {isVip ? 'Đặc quyền Nova VIP đang mở' : 'Đồng hành sâu hơn cùng Nova VIP'}
                  </h4>
                  <p className="text-[11.5px] text-[#FAF6F0]/80 truncate">
                    {isVip
                      ? 'Trọn bộ tư vấn & ưu đãi 10% tại cửa hàng'
                      : 'Mở khóa chuyên mục y khoa & ưu đãi 10%'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#D7BA86] shrink-0" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
