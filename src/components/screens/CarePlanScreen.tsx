import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Droplet,
  Sparkles,
  Music,
  Stethoscope,
  Activity,
  CheckCircle2,
  Clock,
  Plus,
  Bell,
  Star,
  ChevronRight,
  RotateCcw,
  Calendar,
  AlertCircle,
  MoreVertical,
  Footprints,
  Pill,
  Filter,
  BookOpen,
  ListTodo,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ActivityItem,
  DailyWaterRecord,
  HealthReminder,
  DayProgress,
} from '../../types';
import { storageService, getTodayDateString } from '../../services/storageService';
import { notificationService } from '../../services/notificationService';
import { WaterTrackerModal } from '../care/WaterTrackerModal';
import { ReminderManagerModal } from '../care/ReminderManagerModal';
import { ActivityDetailModal } from '../care/ActivityDetailModal';
import { AddActivityModal } from '../care/AddActivityModal';
import { HealthDiaryView } from '../care/HealthDiaryView';
import { PrenatalAppointmentsView } from '../care/PrenatalAppointmentsView';

export const CarePlanScreen: React.FC = () => {
  const todayStr = getTodayDateString();
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  // Core Data loaded from persistent storage
  const [waterRecord, setWaterRecord] = useState<DailyWaterRecord>(() =>
    storageService.getWaterRecord(todayStr)
  );
  const [activities, setActivities] = useState<ActivityItem[]>(() =>
    storageService.loadCareActivities(todayStr)
  );
  const [reminders, setReminders] = useState<HealthReminder[]>(() =>
    storageService.loadHealthReminders()
  );
  const [weeklyProgress, setWeeklyProgress] = useState<DayProgress[]>(() =>
    storageService.getWeeklyProgress()
  );

  // Active filter tab: 'all' | 'favorite' | 'pending' | 'completed'
  const [filterTab, setFilterTab] = useState<'all' | 'favorite' | 'pending' | 'completed'>('all');

  // Main view tab: 'activities' | 'diary' | 'appointments'
  const [mainTab, setMainTab] = useState<'activities' | 'diary' | 'appointments'>('activities');

  // Modals state
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null);

  // In-app alarm alert notification
  const [activeAlarm, setActiveAlarm] = useState<HealthReminder | null>(null);

  // 1. Start background reminder watcher and listen for alarm events
  useEffect(() => {
    notificationService.startReminderWatcher(() => storageService.loadHealthReminders());

    const handleAlarmEvent = (e: any) => {
      if (e.detail && e.detail.reminder) {
        setActiveAlarm(e.detail.reminder);
      }
    };

    window.addEventListener('nova_health_alert', handleAlarmEvent);
    return () => {
      window.removeEventListener('nova_health_alert', handleAlarmEvent);
    };
  }, []);

  // 2. Synchronize data whenever selected date changes
  useEffect(() => {
    const dayWater = storageService.getWaterRecord(selectedDateStr);
    const dayActs = storageService.loadCareActivities(selectedDateStr);
    setWaterRecord(dayWater);
    setActivities(dayActs);
    setWeeklyProgress(storageService.getWeeklyProgress());
  }, [selectedDateStr]);

  // 3. Listen to cross-component storage updates
  useEffect(() => {
    const handleStorageChange = () => {
      setWaterRecord(storageService.getWaterRecord(selectedDateStr));
      setActivities(storageService.loadCareActivities(selectedDateStr));
      setReminders(storageService.loadHealthReminders());
      setWeeklyProgress(storageService.getWeeklyProgress());
    };

    window.addEventListener('nova_storage_update', handleStorageChange);
    return () => window.removeEventListener('nova_storage_update', handleStorageChange);
  }, [selectedDateStr]);

  // --- WATER HANDLERS ---
  const handleAddWaterLog = (amount: number, note?: string) => {
    const updated = storageService.addWaterLog(amount, note, selectedDateStr);
    setWaterRecord(updated);
    setActivities(storageService.loadCareActivities(selectedDateStr));
    setWeeklyProgress(storageService.getWeeklyProgress());
  };

  const handleUndoLastWaterLog = () => {
    const updated = storageService.undoLastWaterLog(selectedDateStr);
    setWaterRecord(updated);
    setActivities(storageService.loadCareActivities(selectedDateStr));
    setWeeklyProgress(storageService.getWeeklyProgress());
  };

  const handleRemoveWaterLog = (logId: string) => {
    const updated = storageService.removeWaterLog(logId, selectedDateStr);
    setWaterRecord(updated);
    setActivities(storageService.loadCareActivities(selectedDateStr));
    setWeeklyProgress(storageService.getWeeklyProgress());
  };

  const handleUpdateWaterTarget = (newTarget: number) => {
    const updated = storageService.updateWaterTarget(newTarget, selectedDateStr);
    setWaterRecord(updated);
    setActivities(storageService.loadCareActivities(selectedDateStr));
  };

  // --- REMINDER HANDLERS ---
  const handleAddReminder = (newRem: Omit<HealthReminder, 'id' | 'createdAt'>) => {
    storageService.addHealthReminder(newRem);
    setReminders(storageService.loadHealthReminders());
  };

  const handleToggleReminder = (id: string) => {
    const updated = storageService.toggleHealthReminder(id);
    setReminders(updated);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = storageService.deleteHealthReminder(id);
    setReminders(updated);
  };

  // --- ACTIVITY HANDLERS ---
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = storageService.toggleFavoriteActivity(id, selectedDateStr);
    setActivities(updated);
  };

  const handleOpenActivityDetail = (activity: ActivityItem) => {
    if (activity.category === 'water') {
      setIsWaterModalOpen(true);
    } else {
      setSelectedActivity(activity);
      setIsDetailModalOpen(true);
    }
  };

  const handleCompleteActivity = (id: string, notes?: string) => {
    const updated = storageService.recordActivityCompletion(id, notes, selectedDateStr);
    setActivities(updated);
    setWeeklyProgress(storageService.getWeeklyProgress());
  };

  const handleUncompleteActivity = (id: string) => {
    const updated = storageService.uncompleteActivity(id, selectedDateStr);
    setActivities(updated);
    setWeeklyProgress(storageService.getWeeklyProgress());
  };

  const handleSaveNewActivity = (newAct: Omit<ActivityItem, 'id'>) => {
    storageService.addCareActivity(newAct, selectedDateStr);
    setActivities(storageService.loadCareActivities(selectedDateStr));
    setReminders(storageService.loadHealthReminders());
    setWeeklyProgress(storageService.getWeeklyProgress());
  };

  const handleUpdateActivity = (id: string, partial: Partial<ActivityItem>) => {
    const updated = storageService.updateCareActivity(id, partial, selectedDateStr);
    setActivities(updated);
  };

  const handleDeleteActivity = (id: string) => {
    const updated = storageService.deleteCareActivity(id, selectedDateStr);
    setActivities(updated);
    setWeeklyProgress(storageService.getWeeklyProgress());
  };

  // Filtered & sorted activities (Favorites pinned to top)
  const filteredActivities = activities
    .filter((act) => {
      if (filterTab === 'favorite') return Boolean(act.isFavorite);
      if (filterTab === 'pending') return !act.completed;
      if (filterTab === 'completed') return act.completed;
      return true;
    })
    .sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));

  const completedCount = activities.filter((a) => a.completed).length;
  const isToday = selectedDateStr === todayStr;

  // Category Icon helper
  const renderCategoryIcon = (category: ActivityItem['category']) => {
    switch (category) {
      case 'water':
        return <Droplet className="w-5 h-5 fill-current" />;
      case 'yoga':
        return <Activity className="w-5 h-5 stroke-[2.2]" />;
      case 'music':
        return <Music className="w-5 h-5 stroke-[2.2]" />;
      case 'checkup':
        return <Stethoscope className="w-5 h-5 stroke-[2.2]" />;
      case 'walk':
        return <Footprints className="w-5 h-5 stroke-[2.2]" />;
      case 'pill':
        return <Pill className="w-5 h-5 stroke-[2.2]" />;
      default:
        return <Sparkles className="w-5 h-5 stroke-[2]" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col px-5 pt-3 pb-6 overflow-y-auto no-scrollbar select-none bg-[#FFFBF7]">
      {/* In-App Alarm Alert Modal Drawer */}
      <AnimatePresence>
        {activeAlarm && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-14 left-4 right-4 z-50 bg-[#3A2E2B] text-white p-4 rounded-3xl shadow-2xl border border-white/20 flex flex-col gap-2 max-w-[400px] mx-auto"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#C84B4B] flex items-center justify-center animate-pulse">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-bold text-[#F5D77F] uppercase tracking-wider">
                  Đến giờ nhắc nhở ({activeAlarm.time})
                </span>
              </div>
              <button
                onClick={() => setActiveAlarm(null)}
                className="text-xs text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <h4 className="text-sm font-bold text-white">
              {activeAlarm.title}
            </h4>
            {activeAlarm.notes && (
              <p className="text-xs text-white/80 leading-relaxed">
                {activeAlarm.notes}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  if (activeAlarm.category === 'water') {
                    setIsWaterModalOpen(true);
                  }
                  setActiveAlarm(null);
                }}
                className="flex-1 py-2 bg-[#C84B4B] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#B53E3E]"
              >
                Thực hiện ngay
              </button>
              <button
                onClick={() => setActiveAlarm(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Quick Action Buttons */}
      <header className="mb-3.5 flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-[#3A2E2B] tracking-tight leading-tight">
            Kế hoạch chăm sóc
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[12px] font-medium text-[#8C7B75]">
              {isToday ? 'Hôm nay' : `Ngày ${selectedDateStr}`} · Mẹ & Bé khỏe mạnh
            </p>
            {!isToday && (
              <button
                onClick={() => setSelectedDateStr(todayStr)}
                className="text-[10px] font-bold bg-[#FCEEEB] text-[#C84B4B] px-2 py-0.5 rounded-full hover:bg-[#F9DDD6] transition-colors cursor-pointer"
              >
                Về hôm nay
              </button>
            )}
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-1.5">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsReminderModalOpen(true)}
            className="w-9 h-9 rounded-full bg-white border border-[#EFEAE5] shadow-2xs flex items-center justify-center text-[#3A2E2B] hover:text-[#C84B4B] relative cursor-pointer"
            title="Lịch nhắc nhở & báo thức"
          >
            <Bell className="w-4 h-4 stroke-[2]" />
            {reminders.filter((r) => r.isEnabled).length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C84B4B] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                {reminders.filter((r) => r.isEnabled).length}
              </span>
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              setEditingActivity(null);
              setIsAddModalOpen(true);
            }}
            className="w-9 h-9 rounded-full bg-[#C84B4B] text-white shadow-xs flex items-center justify-center cursor-pointer hover:bg-[#B53E3E] transition-colors"
            title="Thêm hoạt động mới"
          >
            <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
          </motion.button>
        </div>
      </header>

      {/* 3 Main View Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#F5F0EB] rounded-2xl mb-4 shrink-0">
        <button
          onClick={() => setMainTab('activities')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mainTab === 'activities'
              ? 'bg-white text-[#3A2E2B] shadow-xs'
              : 'text-[#8C7B75] hover:text-[#3A2E2B]'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5" />
          <span>Hôm nay</span>
        </button>
        <button
          onClick={() => setMainTab('diary')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mainTab === 'diary'
              ? 'bg-white text-[#3A2E2B] shadow-xs'
              : 'text-[#8C7B75] hover:text-[#3A2E2B]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Nhật ký thai kỳ</span>
        </button>
        <button
          onClick={() => setMainTab('appointments')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mainTab === 'appointments'
              ? 'bg-white text-[#3A2E2B] shadow-xs'
              : 'text-[#8C7B75] hover:text-[#3A2E2B]'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Lịch khám thai</span>
        </button>
      </div>

      {mainTab === 'diary' && <HealthDiaryView selectedDate={selectedDateStr} />}

      {mainTab === 'appointments' && <PrenatalAppointmentsView />}

      {mainTab === 'activities' && (
        <>
          {/* Thẻ "Tiến độ tuần này" với Biểu đồ cột Spring Animation (Tính toán số liệu thật) */}
          <div className="bg-white rounded-[24px] p-5 ios-card-shadow border border-[#F2ECE7] mb-4">
        {/* Top of Card */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold text-[#3A2E2B] tracking-tight">
              Tiến độ tuần này
            </h2>
            <span className="text-[11px] text-[#8C7B75]">
              (Dữ liệu thực tế)
            </span>
          </div>

          {/* Average Completion Pill */}
          <div className="bg-[#FCEEEB] text-[#C84B4B] text-[12px] font-bold px-3 py-1 rounded-full shadow-2xs">
            {weeklyProgress.find((p) => p.dateStr === selectedDateStr)?.percent || 0}% Đạt
          </div>
        </div>

        {/* Dynamic Spring Bar Chart calculated from REAL activities & water */}
        <div className="h-40 pt-2 pb-1 flex items-end justify-between gap-2">
          {weeklyProgress.map((item) => {
            const isSelected = item.dateStr === selectedDateStr;
            const isPeak = item.isPeak;

            return (
              <div
                key={item.shortDay}
                onClick={() => item.dateStr && setSelectedDateStr(item.dateStr)}
                className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
                title={`${item.dayName} (${item.dateStr}): ${item.percent}% hoàn thành`}
              >
                {/* Tooltip Percentage */}
                <span
                  className={`text-[9.5px] font-semibold mb-1 transition-all ${
                    isSelected
                      ? 'text-[#C84B4B] font-bold opacity-100 scale-100'
                      : 'text-[#8C7B75] opacity-0 group-hover:opacity-100 scale-90'
                  }`}
                >
                  {item.percent}%
                </span>

                {/* Bar Track Background */}
                <div className="w-full max-w-[26px] h-24 bg-[#F4EFEA] rounded-full p-0.5 flex flex-col justify-end relative overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${item.percent}%` }}
                    transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                    className={`w-full rounded-full transition-colors ${
                      isSelected
                        ? 'bg-[#C84B4B] shadow-sm shadow-[#C84B4B]/30'
                        : item.percent >= 80
                        ? 'bg-[#E58383]'
                        : item.percent > 0
                        ? 'bg-[#D6CBC4]'
                        : 'bg-transparent'
                    }`}
                  />
                </div>

                {/* Day Label */}
                <span
                  className={`text-[11px] mt-2 font-medium transition-colors ${
                    isSelected
                      ? 'text-[#C84B4B] font-bold'
                      : 'text-[#8C7B75]'
                  }`}
                >
                  {item.shortDay}
                </span>
              </div>
            );
          })}
        </div>

        {/* Daily Summary Note */}
        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#6E5D57]">
          <span>
            {isToday ? 'Hôm nay' : selectedDateStr}: Hoàn thành {completedCount}/{activities.length} mục tiêu
          </span>
          <span className="text-[#C84B4B] font-bold">
            {completedCount === activities.length && activities.length > 0
              ? 'Xuất sắc ✨'
              : completedCount > 0
              ? 'Đang tiến triển 👍'
              : 'Hãy bắt đầu nào 💪'}
          </span>
        </div>
      </div>

      {/* SPECIAL INTERACTIVE WATER TRACKER CARD (Điểm nhấn Theo dõi nước) */}
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsWaterModalOpen(true)}
        className="p-4 bg-gradient-to-r from-[#EBF5FB] via-[#F2F8FD] to-[#E8F3FA] rounded-[22px] border border-[#D0E4F2] shadow-xs mb-4 flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white text-[#2980B9] shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Droplet className="w-6 h-6 fill-current text-[#2980B9]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-extrabold text-[#2C3E50] tracking-tight">
                Lượng nước đã uống
              </h3>
              {waterRecord.isCompleted && (
                <span className="text-[10px] font-bold bg-[#2ECC71] text-white px-2 py-0.2 rounded-full shadow-2xs">
                  Đạt chỉ tiêu
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-[16px] font-black text-[#2980B9]">
                {waterRecord.currentMl.toLocaleString('vi-VN')}
              </span>
              <span className="text-xs font-semibold text-[#6C7A89]">
                / {waterRecord.targetMl.toLocaleString('vi-VN')} ml
              </span>
              <span className="text-[11px] font-bold text-[#2980B9] ml-1">
                ({Math.min(100, Math.round((waterRecord.currentMl / waterRecord.targetMl) * 100))}%)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#2980B9] bg-white px-2.5 py-1.5 rounded-xl shadow-2xs border border-[#DCE8F2] group-hover:bg-[#2980B9] group-hover:text-white transition-colors">
            + Uống nước
          </span>
          <ChevronRight className="w-4 h-4 text-[#2980B9]" />
        </div>
      </motion.div>

      {/* DANH SÁCH HOẠT ĐỘNG CHĂM SÓC */}
      <div className="flex flex-col">
        {/* Section Header & Filter Tabs */}
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="text-[16px] font-bold text-[#3A2E2B] tracking-tight">
            Hoạt động ({activities.length})
          </h2>

          <span className="text-[11.5px] font-semibold text-[#8C7B75]">
            {completedCount}/{activities.length} Đã xong
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mb-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'favorite', label: '⭐ Yêu thích' },
            { id: 'pending', label: 'Chưa xong' },
            { id: 'completed', label: 'Đã xong' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap cursor-pointer transition-all ${
                filterTab === tab.id
                  ? 'bg-[#C84B4B] text-white shadow-2xs'
                  : 'bg-white text-[#8C7B75] border border-[#EDE7E2] hover:bg-[#FDF9F6]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Activity Cards List */}
        <div className="flex flex-col gap-3">
          {filteredActivities.length === 0 ? (
            <div className="p-8 bg-white rounded-[22px] border border-dashed border-[#E0D8D0] text-center text-xs text-[#8C7B75] space-y-2">
              <p>Không có hoạt động nào trong mục này.</p>
              <button
                onClick={() => {
                  setEditingActivity(null);
                  setIsAddModalOpen(true);
                }}
                className="text-xs font-bold text-[#C84B4B] hover:underline inline-block"
              >
                + Thêm hoạt động mới
              </button>
            </div>
          ) : (
            filteredActivities.map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                onClick={() => handleOpenActivityDetail(activity)}
                className={`bg-white rounded-[22px] p-4 ios-card-shadow border transition-all cursor-pointer flex items-center justify-between group ${
                  activity.completed
                    ? 'border-[#EDE7E2] bg-white'
                    : 'border-[#F2ECE7] hover:border-[#E8DFD8]'
                }`}
              >
                {/* Left Category Icon & Information */}
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl ${activity.iconBg} ${activity.iconColor} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
                  >
                    {renderCategoryIcon(activity.category)}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-[15px] font-bold tracking-tight transition-colors ${
                          activity.completed
                            ? 'text-[#3A2E2B] line-through decoration-[#C84B4B]/40 decoration-2'
                            : 'text-[#3A2E2B]'
                        }`}
                      >
                        {activity.title}
                      </h3>
                      {activity.completed && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2ECC71] inline shrink-0" />
                      )}
                    </div>

                    <p className="text-[12px] font-medium text-[#8C7B75] mt-0.5 line-clamp-1">
                      {activity.subtitle}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-[#A69B96] flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {activity.timeTarget}
                      </span>
                      {activity.reminderEnabled && (
                        <span className="text-[9.5px] font-semibold text-[#C84B4B] bg-[#FCEEEB] px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                          <Bell className="w-2.5 h-2.5" />
                          {activity.reminderTime || 'Nhắc nhở'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Icons: Favorite Star & Execution Arrow */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Star/Favorite Toggle */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleFavorite(activity.id, e)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#FAF7F4] text-[#A69B96] hover:text-[#F39C12] transition-colors cursor-pointer"
                    title={activity.isFavorite ? 'Bỏ yêu thích' : 'Ghim yêu thích'}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        activity.isFavorite
                          ? 'text-[#F39C12] fill-[#F39C12]'
                          : 'stroke-[1.8]'
                      }`}
                    />
                  </button>

                  {/* Detail trigger */}
                  <div className="w-8 h-8 rounded-full bg-[#FAF7F4] flex items-center justify-center text-[#8C7B75] group-hover:bg-[#FCEEEB] group-hover:text-[#C84B4B] transition-colors">
                    <ChevronRight className="w-4 h-4 stroke-[2]" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
      </>
      )}

      {/* --- MODALS --- */}
      {/* 1. Water Tracker Modal */}
      <WaterTrackerModal
        isOpen={isWaterModalOpen}
        onClose={() => setIsWaterModalOpen(false)}
        waterRecord={waterRecord}
        onAddLog={handleAddWaterLog}
        onUndoLastLog={handleUndoLastWaterLog}
        onRemoveLog={handleRemoveWaterLog}
        onUpdateTarget={handleUpdateWaterTarget}
      />

      {/* 2. Reminder Manager Modal */}
      <ReminderManagerModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        reminders={reminders}
        onAddReminder={handleAddReminder}
        onToggleReminder={handleToggleReminder}
        onDeleteReminder={handleDeleteReminder}
      />

      {/* 3. Activity Detail / Execution Modal */}
      <ActivityDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        activity={selectedActivity}
        onCompleteActivity={handleCompleteActivity}
        onUncompleteActivity={handleUncompleteActivity}
        onOpenWaterModal={() => {
          setIsDetailModalOpen(false);
          setIsWaterModalOpen(true);
        }}
      />

      {/* 4. Add / Edit Activity Modal */}
      <AddActivityModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingActivity(null);
        }}
        onSave={handleSaveNewActivity}
        onUpdate={handleUpdateActivity}
        onDelete={handleDeleteActivity}
        editingActivity={editingActivity}
      />
    </div>
  );
};
