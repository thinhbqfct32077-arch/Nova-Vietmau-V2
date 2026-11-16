import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
  Footprints,
  Pill,
  BookOpen,
  ListTodo,
  Moon,
  Edit3,
  Trash2,
  AlertCircle,
  FileBarChart2,
  History,
  Flame,
} from 'lucide-react';
import {
  ActivityItem,
  DailyWaterRecord,
  HealthReminder,
  DayProgress,
  UserProfile,
  ActivityCategory,
  ReminderHistoryEntry,
  ScreenType,
} from '../../types';
import { storageService, getTodayDateString } from '../../services/storageService';
import { apiService } from '../../services/apiService';
import { notificationService } from '../../services/notificationService';
import { WaterTrackerModal } from '../care/WaterTrackerModal';
import { ReminderManagerModal } from '../care/ReminderManagerModal';
import { ActivityDetailModal } from '../care/ActivityDetailModal';
import { AddActivityModal } from '../care/AddActivityModal';
import { HealthDiaryView } from '../care/HealthDiaryView';
import { PrenatalAppointmentsView } from '../care/PrenatalAppointmentsView';

interface CarePlanScreenProps {
  user?: UserProfile;
  onNavigate?: (screen: ScreenType) => void;
}

export const CarePlanScreen: React.FC<CarePlanScreenProps> = ({ user, onNavigate }) => {
  const userId = user?.id || 'usr-1';
  const todayStr = getTodayDateString();
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  const [waterRecord, setWaterRecord] = useState<DailyWaterRecord>(() =>
    storageService.getWaterRecord(todayStr)
  );
  const [activities, setActivities] = useState<ActivityItem[]>(() =>
    storageService.loadCareActivities(todayStr)
  );
  const [reminders, setReminders] = useState<HealthReminder[]>(() =>
    storageService.loadHealthReminders(userId)
  );
  const [weeklyProgress, setWeeklyProgress] = useState<DayProgress[]>(() =>
    storageService.getWeeklyProgress()
  );
  const [reminderHistory, setReminderHistory] = useState<ReminderHistoryEntry[]>([]);
  const [chartRange, setChartRange] = useState<'week' | 'month'>('week');
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>(() =>
    notificationService.getPermissionStatus()
  );
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);

  const [filterTab, setFilterTab] = useState<'all' | 'favorite' | 'pending' | 'completed'>('all');
  const [mainTab, setMainTab] = useState<'activities' | 'diary' | 'appointments'>('activities');

  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderModalOpenForm, setReminderModalOpenForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<HealthReminder | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null);
  const [activeAlarm, setActiveAlarm] = useState<HealthReminder | null>(null);

  useEffect(() => {
    let active = true;
    const localList = storageService.loadHealthReminders(userId);
    setReminders(localList);

    apiService
      .fetchReminders(user)
      .then((serverList) => {
        if (!active) return;
        if (serverList.length > 0) {
          storageService.saveHealthReminders(serverList, userId);
          setReminders(serverList);
        } else if (localList.length > 0) {
          apiService.syncReminders(localList, user).catch(() => {});
        }
      })
      .catch(() => {});

    apiService
      .fetchDiary(user)
      .then((res) => {
        if (active && res.reminderHistory) {
          setReminderHistory(res.reminderHistory);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    notificationService.stopReminderWatcher();
    notificationService.startReminderWatcher(() => storageService.loadHealthReminders(userId));

    const handleAlarmEvent = (e: any) => {
      if (e.detail && e.detail.reminder) {
        const rem: HealthReminder = e.detail.reminder;
        setActiveAlarm(rem);
        apiService
          .appendReminderHistory(
            {
              reminderId: rem.id,
              title: rem.title,
              category: rem.category,
              triggeredAt: new Date().toISOString(),
              status: 'triggered',
            },
            user
          )
          .then(setReminderHistory)
          .catch(() => {});
      }
    };

    window.addEventListener('nova_health_alert', handleAlarmEvent);
    return () => {
      window.removeEventListener('nova_health_alert', handleAlarmEvent);
    };
  }, [userId]);

  useEffect(() => {
    setWaterRecord(storageService.getWaterRecord(selectedDateStr));
    setActivities(storageService.loadCareActivities(selectedDateStr));
    setWeeklyProgress(storageService.getWeeklyProgress());
  }, [selectedDateStr]);

  useEffect(() => {
    const handleStorageChange = () => {
      setWaterRecord(storageService.getWaterRecord(selectedDateStr));
      setActivities(storageService.loadCareActivities(selectedDateStr));
      setReminders(storageService.loadHealthReminders(userId));
      setWeeklyProgress(storageService.getWeeklyProgress());
    };

    window.addEventListener('nova_storage_update', handleStorageChange);
    return () => window.removeEventListener('nova_storage_update', handleStorageChange);
  }, [selectedDateStr, userId]);

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

  const handleAddReminder = (newRem: Omit<HealthReminder, 'id' | 'createdAt'>) => {
    storageService.addHealthReminder(newRem, userId);
    const updated = storageService.loadHealthReminders(userId);
    setReminders(updated);
    apiService.syncReminders(updated, user).catch(() => {});
  };

  const handleUpdateReminder = (id: string, partial: Partial<HealthReminder>) => {
    const updated = storageService.updateHealthReminder(id, partial, userId);
    setReminders(updated);
    apiService.syncReminders(updated, user).catch(() => {});
  };

  const handleToggleReminder = (id: string) => {
    const updated = storageService.toggleHealthReminder(id, userId);
    setReminders(updated);
    apiService.syncReminders(updated, user).catch(() => {});
  };

  const handleDeleteReminder = (id: string) => {
    const updated = storageService.deleteHealthReminder(id, userId);
    setReminders(updated);
    apiService.syncReminders(updated, user).catch(() => {});
  };

  const handleRequestNotifPermission = async () => {
    const status = await notificationService.requestPermission();
    setPermissionStatus(status);
    if (status !== 'granted') {
      setShowPermissionGuide(true);
    } else {
      setShowPermissionGuide(false);
      notificationService.playChime(0.25);
    }
  };

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
    const rems = storageService.loadHealthReminders(userId);
    setReminders(rems);
    apiService.syncReminders(rems, user).catch(() => {});
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

  const monthlyStats = useMemo(() => {
    const points: { label: string; percent: number; dateStr: string }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getTodayDateString(d);
      const acts = storageService.loadCareActivities(dateStr);
      const done = acts.filter((a) => a.completed).length;
      const pct = acts.length > 0 ? Math.round((done / acts.length) * 100) : 0;
      points.push({ label: `${d.getDate()}/${d.getMonth() + 1}`, percent: pct, dateStr });
    }
    return points;
  }, [activities, waterRecord, selectedDateStr]);

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
  const platformGuide = notificationService.getPlatformNotificationGuide();

  const activeHabitDays = weeklyProgress.filter((d) => d.percent > 0).length;
  const avgWeeklyPercent = Math.round(
    weeklyProgress.reduce((s, d) => s + d.percent, 0) / Math.max(1, weeklyProgress.length)
  );

  const renderCategoryIcon = (category: ActivityCategory) => {
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
      case 'rest':
        return <Moon className="w-5 h-5 stroke-[2.2]" />;
      default:
        return <Sparkles className="w-5 h-5 stroke-[2]" />;
    }
  };

  const getFrequencyLabel = (rem: HealthReminder) => {
    if (rem.frequency === 'daily') return 'Hằng ngày';
    if (rem.frequency === 'weekly') return 'Hằng tuần';
    if (rem.frequency === 'once') return rem.date ? `Ngày ${rem.date}` : 'Một lần';
    return 'Theo thứ';
  };

  return (
    <div className="flex-1 flex flex-col px-4 sm:px-6 pt-3 pb-8 overflow-y-auto no-scrollbar select-none bg-nova-bg text-nova-text">
      {/* In-App Alarm Alert Banner */}
      <AnimatePresence>
        {activeAlarm && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            className="fixed top-14 left-4 right-4 z-50 bg-nova-accent text-nova-accent-contrast p-4 rounded-2xl ios-float-shadow border border-nova-border flex flex-col gap-2 max-w-[420px] mx-auto"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-nova-accent-contrast/15 flex items-center justify-center">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider tabular-nums opacity-90">
                  Đến giờ nhắc nhẹ ({activeAlarm.time})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveAlarm(null)}
                aria-label="Đóng thông báo"
                className="text-xs opacity-75 hover:opacity-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <h4 className="text-sm font-semibold">{activeAlarm.title}</h4>
            {activeAlarm.notes && (
              <p className="text-xs opacity-85 leading-relaxed">{activeAlarm.notes}</p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  apiService
                    .appendReminderHistory(
                      {
                        reminderId: activeAlarm.id,
                        title: activeAlarm.title,
                        category: activeAlarm.category,
                        triggeredAt: new Date().toISOString(),
                        status: 'completed',
                      },
                      user
                    )
                    .then(setReminderHistory)
                    .catch(() => {});
                  if (activeAlarm.category === 'water') {
                    setIsWaterModalOpen(true);
                  }
                  setActiveAlarm(null);
                }}
                className="flex-1 py-2 bg-nova-surface text-nova-text rounded-xl text-xs font-semibold hover:opacity-90 cursor-pointer"
              >
                Thực hiện ngay
              </button>
              <button
                type="button"
                onClick={() => setActiveAlarm(null)}
                className="px-4 py-2 bg-nova-accent-contrast/15 hover:bg-nova-accent-contrast/25 rounded-xl text-xs font-medium cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editorial Header */}
      <header className="mb-4 flex items-start justify-between gap-2 flex-wrap">
        <div>
          <h1 className="font-editorial text-[24px] sm:text-[26px] font-semibold tracking-tight leading-tight">
            Chăm sóc & Nhật ký
          </h1>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <p className="text-[12.5px] font-medium text-nova-text-muted">
              {isToday ? 'Hôm nay' : `Ngày ${selectedDateStr}`} · {user?.name || 'Khánh Băng'}
            </p>
            {!isToday && (
              <button
                type="button"
                onClick={() => setSelectedDateStr(todayStr)}
                className="text-[11px] font-semibold text-nova-accent hover:underline cursor-pointer"
              >
                · Về hôm nay
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('report')}
              className="px-3 h-10 rounded-xl bg-nova-surface border border-nova-border text-nova-text text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:border-nova-taupe whitespace-nowrap"
              title="Xuất báo cáo khám thai"
            >
              <FileBarChart2 className="w-3.5 h-3.5 text-nova-accent" />
              <span className="hidden sm:inline">Báo cáo PDF</span>
            </button>
          )}

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => {
              setEditingReminder(null);
              setReminderModalOpenForm(true);
              setIsReminderModalOpen(true);
            }}
            className="px-3.5 h-10 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast flex items-center gap-1 cursor-pointer transition-colors text-xs font-semibold whitespace-nowrap"
            title="Thêm nhắc nhở mới"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
            <span>THÊM</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              setEditingActivity(null);
              setIsAddModalOpen(true);
            }}
            className="w-10 h-10 rounded-xl bg-nova-surface border border-nova-border text-nova-text flex items-center justify-center cursor-pointer hover:border-nova-taupe"
            title="Thêm hoạt động chăm sóc"
            aria-label="Thêm hoạt động chăm sóc"
          >
            <ListTodo className="w-4 h-4 stroke-[2]" />
          </motion.button>
        </div>
      </header>

      {/* 3 Main View Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-nova-bg-subtle border border-nova-border rounded-2xl mb-4 shrink-0">
        <button
          type="button"
          onClick={() => setMainTab('activities')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px] whitespace-nowrap ${
            mainTab === 'activities'
              ? 'bg-nova-surface text-nova-accent shadow-2xs'
              : 'text-nova-text-muted hover:text-nova-text'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5" />
          <span>Hôm nay & Nhắc nhở</span>
        </button>
        <button
          type="button"
          onClick={() => setMainTab('diary')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px] whitespace-nowrap ${
            mainTab === 'diary'
              ? 'bg-nova-surface text-nova-accent shadow-2xs'
              : 'text-nova-text-muted hover:text-nova-text'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Nhật ký chi tiết</span>
        </button>
        <button
          type="button"
          onClick={() => setMainTab('appointments')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px] whitespace-nowrap ${
            mainTab === 'appointments'
              ? 'bg-nova-surface text-nova-accent shadow-2xs'
              : 'text-nova-text-muted hover:text-nova-text'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Lịch khám thai</span>
        </button>
      </div>

      {mainTab === 'diary' && <HealthDiaryView selectedDate={selectedDateStr} user={user} />}

      {mainTab === 'appointments' && <PrenatalAppointmentsView />}

      {mainTab === 'activities' && (
        <>
          {/* REMINDERS SECTION */}
          <section className="bg-nova-surface rounded-2xl p-4 sm:p-5 nova-card-shadow border border-nova-border mb-4">
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-nova-accent-soft text-nova-accent flex items-center justify-center">
                  <Bell className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h2 className="font-editorial text-[16px] font-semibold leading-tight">
                    Nhắc nhở của mẹ ({reminders.length})
                  </h2>
                  <p className="text-[11.5px] text-nova-text-muted">
                    Uống nước, vitamin, lịch khám, nghỉ ngơi & vận động
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowHistoryDrawer((v) => !v)}
                  className="px-3 py-2 bg-nova-bg-subtle border border-nova-border rounded-xl text-xs font-semibold text-nova-text-muted flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Lịch sử ({reminderHistory.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingReminder(null);
                    setReminderModalOpenForm(true);
                    setIsReminderModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shrink-0 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>THÊM</span>
                </button>
              </div>
            </div>

            {showHistoryDrawer && (
              <div className="mb-3 p-3 rounded-2xl bg-nova-bg-subtle border border-nova-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Lịch sử nhắc nhở gần đây</span>
                  <button
                    type="button"
                    onClick={() => setShowHistoryDrawer(false)}
                    className="text-[11px] font-semibold text-nova-text-muted cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
                {reminderHistory.length === 0 ? (
                  <p className="text-[11.5px] text-nova-text-muted">
                    Chưa có nhắc nhở nào được kích hoạt trên hệ thống.
                  </p>
                ) : (
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {reminderHistory.slice(0, 8).map((h) => (
                      <div
                        key={h.id}
                        className="text-[11px] flex items-center justify-between py-1 border-b border-nova-border last:border-0"
                      >
                        <span className="font-medium truncate pr-2">{h.title}</span>
                        <span className="text-nova-text-muted shrink-0 tabular-nums">
                          {new Date(h.triggeredAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {permissionStatus !== 'granted' && (
              <div className="mb-3 p-3 rounded-2xl bg-nova-bg-subtle border border-nova-border text-nova-text-muted">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-nova-warning shrink-0 mt-0.5" />
                    <div className="text-[11.5px] leading-snug">
                      <span className="font-semibold text-nova-text">
                        {permissionStatus === 'denied'
                          ? 'Thông báo thiết bị đang bị tắt.'
                          : permissionStatus === 'unsupported'
                          ? 'Trình duyệt không hỗ trợ thông báo hệ thống.'
                          : 'Chưa bật quyền gửi thông báo đúng giờ.'}
                      </span>{' '}
                      <button
                        type="button"
                        onClick={() => setShowPermissionGuide((v) => !v)}
                        className="underline font-semibold text-nova-accent cursor-pointer ml-1"
                      >
                        {showPermissionGuide ? 'Ẩn hướng dẫn' : 'Xem cách bật'}
                      </button>
                    </div>
                  </div>
                  {permissionStatus === 'default' && (
                    <button
                      type="button"
                      onClick={handleRequestNotifPermission}
                      className="px-3 py-1.5 bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast rounded-xl text-[11px] font-semibold shrink-0 cursor-pointer"
                    >
                      Bật ngay
                    </button>
                  )}
                </div>

                {showPermissionGuide && (
                  <div className="mt-2 pt-2 border-t border-nova-border text-[11.5px] space-y-1">
                    <p className="font-semibold text-nova-text">
                      {platformGuide.title}:
                    </p>
                    <ol className="list-decimal list-inside space-y-0.5">
                      {platformGuide.steps.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}

            {reminders.length === 0 ? (
              <div className="p-5 bg-nova-bg-subtle rounded-2xl border border-dashed border-nova-border text-center space-y-2">
                <p className="text-xs font-medium text-nova-text-muted">
                  Chưa có nhắc nhở nào được tạo cho tài khoản này.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingReminder(null);
                    setReminderModalOpenForm(true);
                    setIsReminderModalOpen(true);
                  }}
                  className="px-4 py-2 bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo nhắc nhở đầu tiên</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {reminders.map((rem) => (
                  <div
                    key={rem.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                      rem.isEnabled
                        ? 'bg-nova-bg-subtle border-nova-border'
                        : 'bg-nova-bg-subtle/60 border-nova-border opacity-65'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-nova-surface border border-nova-border flex items-center justify-center shrink-0 text-nova-accent">
                        {renderCategoryIcon(rem.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-semibold tabular-nums">{rem.time}</span>
                          <span className="text-[11px] text-nova-text-muted">
                            · {getFrequencyLabel(rem)}
                          </span>
                        </div>
                        <h3 className="text-xs font-semibold mt-0.5 truncate">{rem.title}</h3>
                        {rem.notes && (
                          <p className="text-[11px] text-nova-text-muted line-clamp-1 mt-0.5">
                            {rem.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleReminder(rem.id)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                          rem.isEnabled ? 'bg-nova-sage' : 'bg-nova-border'
                        }`}
                        title={rem.isEnabled ? 'Tạm tắt' : 'Bật lại'}
                        aria-label={rem.isEnabled ? 'Tạm tắt nhắc nhở' : 'Bật lại nhắc nhở'}
                      >
                        <motion.div
                          animate={{ x: rem.isEnabled ? 16 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="w-4 h-4 rounded-full bg-nova-surface shadow-xs"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingReminder(rem);
                          setReminderModalOpenForm(true);
                          setIsReminderModalOpen(true);
                        }}
                        className="w-7 h-7 rounded-lg text-nova-icon hover:text-nova-accent flex items-center justify-center cursor-pointer"
                        title="Chỉnh sửa nhắc nhở"
                        aria-label="Chỉnh sửa nhắc nhở"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteReminder(rem.id)}
                        className="w-7 h-7 rounded-lg text-nova-icon hover:text-nova-danger flex items-center justify-center cursor-pointer"
                        title="Xóa nhắc nhở"
                        aria-label="Xóa nhắc nhở"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Chart & Water Tracker Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="bg-nova-surface rounded-2xl p-5 nova-card-shadow border border-nova-border">
              <div className="flex items-center justify-between mb-3 gap-2">
                <div>
                  <h2 className="font-editorial text-[16px] font-semibold tracking-tight flex items-center gap-2">
                    <span>Nhịp chăm sóc mỗi ngày</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-nova-warning font-sans">
                      <Flame className="w-3.5 h-3.5" /> {activeHabitDays}/7 ngày
                    </span>
                  </h2>
                  <p className="text-[11.5px] text-nova-text-muted">
                    Trung bình tuần: {avgWeeklyPercent}% nhẹ nhàng
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-nova-bg-subtle border border-nova-border p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setChartRange('week')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                      chartRange === 'week'
                        ? 'bg-nova-surface text-nova-accent'
                        : 'text-nova-text-muted'
                    }`}
                  >
                    Tuần
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartRange('month')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                      chartRange === 'month'
                        ? 'bg-nova-surface text-nova-accent'
                        : 'text-nova-text-muted'
                    }`}
                  >
                    14 ngày
                  </button>
                </div>
              </div>

              {chartRange === 'week' ? (
                <div className="h-36 pt-2 pb-1 flex items-end justify-between gap-2">
                  {weeklyProgress.map((item) => {
                    const isSelected = item.dateStr === selectedDateStr;
                    return (
                      <div
                        key={item.shortDay}
                        onClick={() => item.dateStr && setSelectedDateStr(item.dateStr)}
                        className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
                      >
                        <span
                          className={`text-[10px] font-semibold mb-1 transition-all tabular-nums ${
                            isSelected
                              ? 'text-nova-accent opacity-100'
                              : 'text-nova-text-muted opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          {item.percent}%
                        </span>
                        <div className="w-full max-w-[26px] h-24 bg-nova-bg-subtle rounded-full p-0.5 flex flex-col justify-end relative overflow-hidden">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${item.percent}%` }}
                            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                            className={`w-full rounded-full transition-colors ${
                              isSelected
                                ? 'bg-nova-accent'
                                : item.percent >= 80
                                ? 'bg-nova-sage'
                                : item.percent > 0
                                ? 'bg-nova-taupe'
                                : 'bg-transparent'
                            }`}
                          />
                        </div>
                        <span
                          className={`text-[11px] mt-2 font-medium ${
                            isSelected
                              ? 'text-nova-accent font-semibold'
                              : 'text-nova-text-muted'
                          }`}
                        >
                          {item.shortDay}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-36 pt-2 flex flex-col justify-between">
                  <svg viewBox="0 0 280 90" className="w-full h-24 overflow-visible">
                    <line x1="0" y1="85" x2="280" y2="85" stroke="var(--color-nova-border)" strokeWidth="1" />
                    <line x1="0" y1="45" x2="280" y2="45" stroke="var(--color-nova-border)" strokeDasharray="3 3" strokeWidth="1" />
                    <polyline
                      fill="none"
                      stroke="var(--color-nova-accent)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={monthlyStats
                        .map((pt, i) => `${i * 21 + 5},${85 - (pt.percent / 100) * 75}`)
                        .join(' ')}
                    />
                    {monthlyStats.map((pt, i) => (
                      <circle
                        key={pt.dateStr}
                        cx={i * 21 + 5}
                        cy={85 - (pt.percent / 100) * 75}
                        r="3"
                        fill={pt.dateStr === selectedDateStr ? 'var(--color-nova-accent)' : 'var(--color-nova-surface)'}
                        stroke="var(--color-nova-accent)"
                        strokeWidth="1.5"
                        className="cursor-pointer"
                        onClick={() => setSelectedDateStr(pt.dateStr)}
                      />
                    ))}
                  </svg>
                  <div className="flex justify-between text-[10px] text-nova-text-muted">
                    <span>{monthlyStats[0]?.label}</span>
                    <span>Xu hướng 14 ngày gần đây</span>
                    <span>{monthlyStats[monthlyStats.length - 1]?.label}</span>
                  </div>
                </div>
              )}

              <div className="mt-3 pt-2.5 border-t border-nova-border flex items-center justify-between text-[11.5px] text-nova-text-muted">
                <span className="tabular-nums">
                  {isToday ? 'Hôm nay' : selectedDateStr}: {completedCount}/{activities.length} việc nhẹ
                </span>
                <span className="text-nova-sage-text font-semibold">
                  {completedCount === activities.length && activities.length > 0
                    ? 'Đủ đầy bình yên'
                    : completedCount > 0
                    ? 'Đang đi đúng nhịp'
                    : 'Bắt đầu thong thả'}
                </span>
              </div>
            </div>

            {/* Water Tracker Card */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.985 }}
              onClick={() => setIsWaterModalOpen(true)}
              className="p-5 bg-nova-sage-soft rounded-2xl border border-nova-success-border flex flex-col justify-between cursor-pointer text-left hover:border-nova-sage transition-colors"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-nova-surface text-nova-sage-text flex items-center justify-center shrink-0">
                    <Droplet className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-editorial text-[16px] font-semibold text-nova-text">
                        Lượng nước ấm hôm nay
                      </h3>
                      {waterRecord.isCompleted && (
                        <span className="text-[11px] font-semibold text-nova-sage-text">
                          · Đủ nước
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-[22px] font-semibold text-nova-sage-text tabular-nums">
                        {waterRecord.currentMl.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-xs font-medium text-nova-text-muted tabular-nums">
                        / {waterRecord.targetMl.toLocaleString('vi-VN')} ml
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-nova-sage-text" />
              </div>

              <div className="mt-4 w-full">
                <div className="w-full h-2 bg-nova-surface/80 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-nova-sage rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.round((waterRecord.currentMl / waterRecord.targetMl) * 100))}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11.5px] font-semibold text-nova-sage-text">
                  <span className="tabular-nums">
                    {Math.min(100, Math.round((waterRecord.currentMl / waterRecord.targetMl) * 100))}% gợi ý mỗi ngày
                  </span>
                  <span className="bg-nova-surface px-3 py-1 rounded-xl border border-nova-success-border">
                    + Uống thêm ly nước
                  </span>
                </div>
              </div>
            </motion.button>
          </div>

          {/* CARE ACTIVITIES LIST */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <h2 className="font-editorial text-[17px] font-semibold tracking-tight">
                Hoạt động chăm sóc ({activities.length})
              </h2>
              <span className="text-[12px] font-medium text-nova-text-muted tabular-nums">
                {completedCount}/{activities.length} đã ghi nhận
              </span>
            </div>

            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'favorite', label: 'Yêu thích' },
                { id: 'pending', label: 'Chưa xong' },
                { id: 'completed', label: 'Đã xong' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterTab(tab.id as any)}
                  className={`text-[12px] font-semibold px-3.5 py-2 rounded-xl whitespace-nowrap cursor-pointer transition-colors shrink-0 min-h-[38px] ${
                    filterTab === tab.id
                      ? 'bg-nova-accent text-nova-accent-contrast'
                      : 'bg-nova-surface text-nova-text-muted border border-nova-border hover:border-nova-taupe'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredActivities.length === 0 ? (
                <div className="col-span-full p-8 bg-nova-surface rounded-2xl border border-dashed border-nova-border text-center text-xs text-nova-text-muted space-y-2">
                  <p>Không có hoạt động nào trong mục này.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingActivity(null);
                      setIsAddModalOpen(true);
                    }}
                    className="text-xs font-semibold text-nova-accent hover:underline inline-block cursor-pointer"
                  >
                    + Thêm hoạt động mới
                  </button>
                </div>
              ) : (
                filteredActivities.map((activity, idx) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    onClick={() => handleOpenActivityDetail(activity)}
                    className="bg-nova-surface rounded-2xl p-4 nova-card-shadow border border-nova-border hover:border-nova-taupe transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl ${activity.iconBg} ${activity.iconColor} flex items-center justify-center shrink-0`}
                      >
                        {renderCategoryIcon(activity.category)}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`text-[14.5px] font-semibold tracking-tight truncate ${
                              activity.completed ? 'line-through decoration-nova-sage decoration-2 text-nova-text-muted' : ''
                            }`}
                          >
                            {activity.title}
                          </h3>
                          {activity.completed && (
                            <CheckCircle2 className="w-4 h-4 text-nova-sage-text inline shrink-0" />
                          )}
                        </div>

                        <p className="text-[12px] text-nova-text-muted mt-0.5 line-clamp-1">
                          {activity.subtitle}
                        </p>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-nova-text-muted">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {activity.timeTarget}
                          </span>
                          {activity.reminderEnabled && (
                            <span className="font-semibold text-nova-accent flex items-center gap-1">
                              · <Bell className="w-2.5 h-2.5" />
                              {activity.reminderTime || 'Nhắc nhẹ'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(activity.id, e)}
                        aria-label={activity.isFavorite ? 'Bỏ yêu thích' : 'Đánh dấu yêu thích'}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-nova-bg-subtle text-nova-icon hover:text-nova-taupe transition-colors cursor-pointer"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            activity.isFavorite ? 'text-nova-taupe fill-nova-taupe' : 'stroke-[1.8]'
                          }`}
                        />
                      </button>

                      <div className="w-8 h-8 rounded-full bg-nova-bg-subtle flex items-center justify-center text-nova-icon group-hover:bg-nova-accent-soft group-hover:text-nova-accent transition-colors">
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

      {/* Modals */}
      <WaterTrackerModal
        isOpen={isWaterModalOpen}
        onClose={() => setIsWaterModalOpen(false)}
        waterRecord={waterRecord}
        onAddLog={handleAddWaterLog}
        onUndoLastLog={handleUndoLastWaterLog}
        onRemoveLog={handleRemoveWaterLog}
        onUpdateTarget={handleUpdateWaterTarget}
      />

      <ReminderManagerModal
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setEditingReminder(null);
          setReminderModalOpenForm(false);
          setPermissionStatus(notificationService.getPermissionStatus());
        }}
        reminders={reminders}
        initialEditingReminder={editingReminder}
        initialOpenForm={reminderModalOpenForm}
        onAddReminder={handleAddReminder}
        onUpdateReminder={handleUpdateReminder}
        onToggleReminder={handleToggleReminder}
        onDeleteReminder={handleDeleteReminder}
      />

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
