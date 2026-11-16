import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSETS, NOVA_VIDEOS_DATA, PRODUCTS_DATA } from '../../data/mockData';
import { INITIAL_LIBRARY_ARTICLES } from '../../data/ecosystemData';
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
  Monitor,
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

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenVoiceChat,
  onNavigateToCare,
  onOpenNotifications,
  onOpenVipModal,
  onOpenProfile,
  onOpenEmergency,
  onNavigateScreen,
  onOpenGlobalSearch,
  themeMode = 'system',
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
    tired: { text: 'Mệt nhẹ', emoji: '🌙' },
  };

  const isStaff = user?.role === 'admin' || user?.role === 'moderator';

  const coreShortcuts: {
    id: ScreenType;
    title: string;
    sub: string;
    icon: React.ComponentType<{ className?: string }>;
    tint: string;
  }[] = [
    { id: 'care', title: 'Chăm sóc', sub: 'Nước & lịch', icon: Heart, tint: 'bg-nova-accent-soft text-nova-accent' },
    { id: 'journey', title: 'Hành trình', sub: `Tuần ${pregnancySummary.weeks}`, icon: Compass, tint: 'bg-nova-sage-soft text-nova-sage-text' },
    { id: 'checklist', title: 'Sổ chuẩn bị', sub: 'Đồ đi sinh', icon: CheckSquare, tint: 'bg-nova-bg-subtle text-nova-accent' },
    { id: 'library', title: 'Thư viện', sub: 'Chuẩn Bộ Y tế', icon: BookOpen, tint: 'bg-nova-sage-soft text-nova-sage-text' },
  ];

  const moreShortcuts: {
    id: ScreenType;
    title: string;
    sub: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'weekly', title: 'Theo tuần', sub: `Tuần ${pregnancySummary.weeks}`, icon: Calendar },
    { id: 'memories', title: 'Kỷ niệm', sub: 'Ảnh siêu âm', icon: Camera },
    { id: 'birth_plan', title: 'Đi sinh', sub: 'Kế hoạch', icon: ClipboardList },
    { id: 'family', title: 'Gia đình', sub: 'Kết nối', icon: HeartHandshake },
    { id: 'postpartum', title: 'Sau sinh', sub: '0–12 tháng', icon: Baby },
    { id: 'report', title: 'Báo cáo', sub: 'Khám thai', icon: FileBarChart2 },
    ...(user?.rewardsEnabled !== false ? [{ id: 'rewards' as ScreenType, title: 'Dấu mốc', sub: 'Quà tặng', icon: Award }] : []),
    ...(isStaff ? [{ id: 'admin' as ScreenType, title: 'Quản trị', sub: 'Kiểm duyệt', icon: ShieldCheck }] : []),
  ];

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

  const themeTitle =
    themeMode === 'light' ? 'Sáng' : themeMode === 'dark' ? 'Tối' : 'Hệ thống';

  return (
    <div className="flex-1 flex flex-col px-4 sm:px-6 pt-3 pb-8 overflow-y-auto no-scrollbar select-none bg-nova-bg">
      {/* Top Header */}
      <header className="flex items-center justify-between py-2 mb-3 gap-2">
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-3 cursor-pointer group min-w-0 text-left focus:outline-none"
        >
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-nova-border bg-nova-bg-subtle">
              <NovaImage
                src={user?.avatar || ASSETS.motherAvatar}
                alt={user?.name || 'Khánh Băng'}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
            {isVip && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-nova-accent rounded-full border border-nova-bg flex items-center justify-center text-nova-accent-contrast">
                <Crown className="w-2.5 h-2.5 fill-current" />
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-medium text-nova-text-muted leading-tight">Chào mẹ</span>
            <span className="font-editorial text-[16px] font-semibold text-nova-text leading-tight group-hover:text-nova-accent truncate">
              {user?.name || 'Khánh Băng'}
            </span>
          </div>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenGlobalSearch && (
            <button
              type="button"
              onClick={onOpenGlobalSearch}
              aria-label="Tìm kiếm"
              className="w-9 h-9 rounded-full bg-nova-surface border border-nova-border flex items-center justify-center text-nova-text hover:border-nova-taupe transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={themeTitle}
              className="lg:hidden w-9 h-9 rounded-full bg-nova-surface border border-nova-border flex items-center justify-center text-nova-text hover:border-nova-taupe transition-colors cursor-pointer"
            >
              {themeMode === 'dark' ? (
                <Moon className="w-4 h-4 text-nova-taupe" />
              ) : themeMode === 'light' ? (
                <Sun className="w-4 h-4 text-nova-taupe" />
              ) : (
                <Monitor className="w-4 h-4 text-nova-icon" />
              )}
            </button>
          )}
          {onOpenEmergency && (
            <button
              type="button"
              onClick={onOpenEmergency}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-nova-danger-soft border border-nova-danger-border text-nova-danger text-[11px] font-bold cursor-pointer hover:opacity-90"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>SOS</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label="Thông báo"
            className="w-9 h-9 rounded-full bg-nova-surface border border-nova-border flex items-center justify-center text-nova-text relative hover:border-nova-taupe transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4 stroke-[1.8]" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-3.5 px-0.5 rounded-full bg-nova-accent text-nova-accent-contrast text-[9px] font-bold flex items-center justify-center tabular-nums">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        {/* 1. HERO CARD */}
        <section className="rounded-[22px] bg-nova-surface border border-nova-border p-4 nova-card-shadow">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            <div className="md:col-span-4 relative rounded-2xl overflow-hidden aspect-[4/3] bg-nova-bg-subtle">
              <NovaImage
                src={ASSETS.homeHeroImg}
                alt="Không gian sáng sớm"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>

            <div className="md:col-span-8 flex flex-col justify-between gap-2.5">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-nova-sage-text uppercase tracking-wider">
                    {user?.pregnancyStatus === 'postpartum'
                      ? 'Sau sinh'
                      : `Trimester ${pregnancySummary.trimester} · Còn ${pregnancySummary.daysRemaining} ngày`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMilestoneDetail(!showMilestoneDetail)}
                    className="w-11 h-11 rounded-xl bg-nova-bg-subtle border border-nova-border flex items-center justify-center text-2xl shrink-0 cursor-pointer"
                  >
                    {pregnancySummary.fruitComparison.fruitEmoji}
                  </button>
                </div>

                <div className="mt-1">
                  <h1 className="font-editorial text-[24px] font-bold text-nova-text leading-tight tabular-nums">
                    {user?.pregnancyStatus === 'postpartum' ? (
                      <>{user.babyNickname || 'Bé Bơ'}</>
                    ) : (
                      <>Tuần {pregnancySummary.weeks} {pregnancySummary.days > 0 ? `+ ${pregnancySummary.days}d` : ''}</>
                    )}
                  </h1>
                  <p className="text-xs text-nova-text-muted mt-0.5">
                    Kích thước: <strong className="text-nova-text">{pregnancySummary.fruitComparison.fruitName}</strong>
                  </p>
                </div>
              </div>

              {onNavigateScreen && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      onNavigateScreen(user?.pregnancyStatus === 'postpartum' ? 'postpartum' : 'weekly')
                    }
                    className="px-3.5 py-2 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-xs font-semibold cursor-pointer transition-colors"
                  >
                    {user?.pregnancyStatus === 'postpartum' ? 'Nhật ký bé' : `Xem tuần ${pregnancySummary.weeks}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateScreen('journey')}
                    className="text-xs font-semibold text-nova-sage-text hover:text-nova-accent cursor-pointer px-2 py-2 flex items-center gap-1"
                  >
                    <span>Hành trình</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showMilestoneDetail && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-nova-border text-xs text-nova-text-muted space-y-1.5 overflow-hidden"
              >
                <div className="flex items-center justify-between font-bold text-nova-text">
                  <span>{pregnancySummary.fruitComparison.lengthDescription} · {pregnancySummary.fruitComparison.weightDescription}</span>
                  <button
                    type="button"
                    onClick={() => setShowMilestoneDetail(false)}
                    className="text-xs text-nova-accent cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
                <p className="text-[11.5kpx] leading-relaxed">{weekMilestone.babyDevelopment}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <NovaLotusDivider label="Hôm nay" />

        {/* 2. DAILY RHYTHM */}
        <section className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setShowMoodPicker(!showMoodPicker)}
              className="bg-nova-surface rounded-2xl p-3.5 border border-nova-border hover:border-nova-taupe flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-nova-bg-subtle flex items-center justify-center text-nova-accent">
                  <Smile className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-nova-text-muted">Cảm xúc</p>
                  <p className="text-xs font-bold text-nova-text">{moodLabels[selectedMood].text}</p>
                </div>
              </div>
              <span className="text-xl">{moodLabels[selectedMood].emoji}</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToCare}
              className="bg-nova-surface rounded-2xl p-3.5 border border-nova-border hover:border-nova-taupe flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-nova-accent-soft flex items-center justify-center text-nova-accent shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-nova-text-muted">Nhắc nhở</p>
                  <p className="text-xs font-bold text-nova-text truncate">
                    {nextReminder ? nextReminder.title : 'Thêm lịch'}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-nova-accent tabular-nums shrink-0">
                {nextReminder ? nextReminder.time : '—'}
              </span>
            </button>

            <button
              type="button"
              onClick={onNavigateToCare}
              className="bg-nova-surface rounded-2xl p-3.5 border border-nova-border hover:border-nova-sage flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-nova-sage-soft flex items-center justify-center text-nova-sage-text shrink-0">
                  <Droplet className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-nova-text-muted">Nước ấm</p>
                  <p className="text-xs font-bold text-nova-text tabular-nums">{todayWater.currentMl}ml</p>
                </div>
              </div>
              <span className="text-xs font-bold text-nova-sage-text tabular-nums shrink-0">
                {waterPercent}%
              </span>
            </button>
          </div>

          <AnimatePresence>
            {showMoodPicker && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="bg-nova-surface rounded-2xl p-2 border border-nova-border grid grid-cols-4 gap-1.5"
              >
                {(Object.keys(moodLabels) as (keyof typeof moodLabels)[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedMood(key);
                      setShowMoodPicker(false);
                    }}
                    className={`flex flex-col items-center py-2 rounded-xl cursor-pointer ${
                      selectedMood === key ? 'bg-nova-accent-soft text-nova-accent' : 'hover:bg-nova-bg-subtle text-nova-text-muted'
                    }`}
                  >
                    <span className="text-lg">{moodLabels[key].emoji}</span>
                    <span className="text-[10px] font-bold mt-0.5">{moodLabels[key].text}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {onNavigateScreen && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {coreShortcuts.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigateScreen(item.id)}
                      className="p-3 rounded-2xl bg-nova-surface border border-nova-border hover:border-nova-taupe flex items-center gap-2.5 text-left cursor-pointer"
                    >
                      <div className={`w-8 h-8 rounded-xl ${item.tint} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-nova-text truncate">{item.title}</p>
                        <p className="text-[10px] text-nova-text-muted truncate">{item.sub}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllTools(!showAllTools)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-nova-text-muted hover:text-nova-accent py-1 cursor-pointer"
                >
                  <span>{showAllTools ? 'Thu gọn' : 'Xem thêm công cụ'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllTools ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <AnimatePresence>
                {showAllTools && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-2 overflow-hidden"
                  >
                    {moreShortcuts.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onNavigateScreen(item.id)}
                          className="p-2.5 rounded-xl bg-nova-bg-subtle border border-nova-border hover:border-nova-taupe flex items-center gap-2 text-left cursor-pointer"
                        >
                          <Icon className="w-3.5 h-3.5 text-nova-accent shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-nova-text truncate">{item.title}</p>
                            <p className="text-[10px] text-nova-text-muted truncate">{item.sub}</p>
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

        <NovaLotusDivider label="Khám phá" />

        {/* 3. DISCOVERY */}
        <section className="space-y-2.5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
            {onNavigateScreen && (
              <button
                type="button"
                onClick={() => onNavigateScreen('library')}
                className="p-3.5 rounded-2xl bg-nova-surface border border-nova-border hover:border-nova-sage text-left cursor-pointer flex flex-col justify-between gap-2"
              >
                <div>
                  <span className="text-[10px] font-bold text-nova-sage-text uppercase">Góc đọc · {curatedArticle.readTimeMinutes}p</span>
                  <h3 className="font-editorial text-[15px] font-bold text-nova-text mt-0.5 line-clamp-1">{curatedArticle.title}</h3>
                </div>
                <span className="text-xs font-bold text-nova-accent">Đọc ngay →</span>
              </button>
            )}

            {onNavigateScreen && curatedVideo && (
              <button
                type="button"
                onClick={() => onNavigateScreen('video')}
                className="p-3 rounded-2xl bg-nova-surface border border-nova-border hover:border-nova-taupe text-left cursor-pointer flex items-center gap-3"
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-nova-bg-subtle shrink-0">
                  <NovaImage src={ASSETS.wellnessRitualImg} alt="Video" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-[#1C1B18]/30 flex items-center justify-center text-white">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-nova-sage-text uppercase">Video thai giáo</span>
                  <h3 className="font-editorial text-xs font-bold text-nova-text truncate mt-0.5">{curatedVideo.title}</h3>
                </div>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
            {onNavigateScreen && (
              <button
                type="button"
                onClick={() => onNavigateScreen('memories')}
                className="p-3.5 rounded-2xl bg-nova-surface border border-nova-border hover:border-nova-taupe text-left cursor-pointer flex items-center gap-3"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-nova-bg-subtle shrink-0">
                  <NovaImage src={ASSETS.journalImg || ASSETS.motherAvatar} alt="Kỷ niệm" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-nova-taupe uppercase">Kỷ niệm</span>
                  <h4 className="font-editorial text-xs font-bold text-nova-text truncate mt-0.5">Thư & ảnh siêu âm</h4>
                </div>
              </button>
            )}

            {onNavigateScreen && (
              <button
                type="button"
                onClick={() => onNavigateScreen('shop')}
                className="p-3.5 rounded-2xl bg-nova-surface border border-nova-border hover:border-nova-taupe text-left cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-nova-bg-subtle flex items-center justify-center text-nova-accent shrink-0">
                    <ShoppingBag className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-nova-accent uppercase">Cửa hàng mẹ & bé</span>
                    <h4 className="font-editorial text-xs font-bold text-nova-text truncate mt-0.5">Sản phẩm tuyển chọn</h4>
                  </div>
                </div>
                <span className="text-xs font-bold text-nova-accent shrink-0 ml-2">Ghé shop →</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onOpenVoiceChat}
              className="p-3.5 rounded-2xl bg-nova-bg-subtle border border-nova-border hover:border-nova-taupe flex items-center justify-between cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-nova-accent text-nova-accent-contrast flex items-center justify-center shrink-0">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-editorial text-xs font-bold text-nova-text">Tâm sự Nova AI</h3>
                  <p className="text-[10px] text-nova-text-muted">Hỏi đáp 24/7</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-nova-icon" />
            </button>

            <button
              type="button"
              onClick={onOpenVipModal}
              className="p-3.5 rounded-2xl bg-nova-accent text-nova-accent-contrast border border-nova-border flex items-center justify-between cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-nova-accent-contrast/2format flex items-center justify-center text-nova-accent-contrast shrink-0">
                  <Crown className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h4 className="font-editorial text-xs font-bold">Gói Nova VIP</h4>
                  <p className="text-[10px] opacity-85">Ưu đãi 10% & y khoa</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-80" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
