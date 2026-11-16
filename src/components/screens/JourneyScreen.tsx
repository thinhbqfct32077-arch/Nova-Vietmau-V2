import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Compass,
  CheckCircle2,
  Circle,
  Calendar,
  Edit3,
  History,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';
import { JourneyState, ScreenType, UserProfile } from '../../types';
import { apiService } from '../../services/apiService';
import { storageService } from '../../services/storageService';
import { getPregnancySummary, FRUIT_COMPARISONS } from '../../services/pregnancyCalculator';
import { getWeekMilestone } from '../../data/pregnancyMilestones';

interface JourneyScreenProps {
  user: UserProfile;
  onUpdateUser: (partial: Partial<UserProfile>) => void;
  onBack: () => void;
  onOpenWeek: (week: number) => void;
  onNavigateScreen?: (screen: ScreenType) => void;
}

export const JourneyScreen: React.FC<JourneyScreenProps> = ({
  user,
  onUpdateUser,
  onBack,
  onOpenWeek,
}) => {
  const [journey, setJourney] = useState<JourneyState>(() =>
    storageService.getOfflineCache<JourneyState>(user.id, 'journey', {
      userId: user.id,
      completedMilestoneWeeks: [],
      dueDateHistory: [],
      updatedAt: new Date().toISOString(),
    })
  );
  const [activeTrimester, setActiveTrimester] = useState<1 | 2 | 3>(() => {
    const w = user.pregnancyWeek || 24;
    return w <= 13 ? 1 : w <= 27 ? 2 : 3;
  });
  const [showEditDueModal, setShowEditDueModal] = useState(false);
  const [newDueDate, setNewDueDate] = useState(user.dueDate || '15/11/2026');
  const [newWeek, setNewWeek] = useState(user.pregnancyWeek || 24);
  const [reason, setReason] = useState('Cập nhật theo kết quả siêu âm định kỳ');
  const [toast, setToast] = useState<string | null>(null);

  const summary = getPregnancySummary(user);

  useEffect(() => {
    apiService
      .fetchJourney(user)
      .then((data) => {
        setJourney(data);
        storageService.setOfflineCache(user.id, 'journey', data);
      })
      .catch(() => {});
  }, [user.id]);

  const showMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const handleToggleWeek = async (week: number) => {
    const exists = journey.completedMilestoneWeeks.includes(week);
    const optimistic: JourneyState = {
      ...journey,
      completedMilestoneWeeks: exists
        ? journey.completedMilestoneWeeks.filter((w) => w !== week)
        : [...journey.completedMilestoneWeeks, week].sort((a, b) => a - b),
      updatedAt: new Date().toISOString(),
    };
    setJourney(optimistic);
    try {
      const saved = await apiService.toggleMilestone(week, user);
      setJourney(saved);
      storageService.setOfflineCache(user.id, 'journey', saved);
      showMsg(exists ? `Đã bỏ đánh dấu tuần ${week}` : `Đã hoàn thành cột mốc tuần ${week}`);
    } catch {
      storageService.setOfflineCache(user.id, 'journey', optimistic);
    }
  };

  const handleSaveDueDate = async () => {
    const prevDue = user.dueDate || '15/11/2026';
    const prevWeek = user.pregnancyWeek || 24;
    const clampedWeek = Math.max(1, Math.min(42, Number(newWeek) || prevWeek));
    onUpdateUser({ dueDate: newDueDate.trim() || prevDue, pregnancyWeek: clampedWeek });
    setShowEditDueModal(false);
    try {
      const saved = await apiService.recordDueDateAdjustment(
        {
          previousDueDate: prevDue,
          newDueDate: newDueDate.trim() || prevDue,
          previousWeek: prevWeek,
          newWeek: clampedWeek,
          reason: reason.trim() || 'Cập nhật ngày dự sinh',
        },
        user
      );
      setJourney(saved);
      storageService.setOfflineCache(user.id, 'journey', saved);
      showMsg('Đã cập nhật tuổi thai & lưu lịch sử thay đổi');
    } catch {
      showMsg('Đã lưu ngày dự sinh mới trên thiết bị');
    }
  };

  const trimesterRanges: Record<1 | 2 | 3, number[]> = {
    1: Array.from({ length: 13 }, (_, i) => i + 1),
    2: Array.from({ length: 14 }, (_, i) => i + 14),
    3: Array.from({ length: 13 }, (_, i) => i + 28),
  };

  const monthlyStats = Array.from({ length: 9 }, (_, mIdx) => {
    const startW = mIdx * 4 + 1;
    const endW = mIdx === 8 ? 40 : (mIdx + 1) * 4;
    const weeksInMonth = Array.from({ length: endW - startW + 1 }, (_, i) => startW + i);
    const done = weeksInMonth.filter((w) => journey.completedMilestoneWeeks.includes(w)).length;
    return { month: mIdx + 1, done, total: weeksInMonth.length };
  });

  return (
    <div className="flex-1 flex flex-col bg-[#FAF6F0] dark:bg-[#161311] overflow-y-auto no-scrollbar select-none">
      {toast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#322622] dark:bg-[#231E1B] text-[#FAF6F0] border border-[#E6DDD1]/20 text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#D7BA86]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <header className="px-4 sm:px-5 py-3 flex items-center justify-between border-b border-[#E6DDD1] dark:border-[#362E2A] sticky top-0 bg-[#FAF6F0]/95 dark:bg-[#161311]/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Quay lại"
            className="w-9 h-9 rounded-full bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-center text-[#6B5D56] dark:text-[#C5B9B0] hover:bg-[#F2ECE3] dark:hover:bg-[#231E1B] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-editorial text-[18px] font-bold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-1.5 leading-tight">
              <Compass className="w-4 h-4 text-[#B55841] dark:text-[#D47A63]" /> Hành trình 40 tuần
            </h1>
            <p className="text-[11px] text-[#786962] dark:text-[#B5A89F]">
              Theo dõi cột mốc phát triển & lịch sử dự sinh
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowEditDueModal(true)}
          className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#F7EAE5] dark:bg-[#35231E] border border-[#EBCDC2] dark:border-[#52352D] text-[#B55841] dark:text-[#D47A63] text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Edit3 className="w-3.5 h-3.5" /> Đổi dự sinh
        </button>
      </header>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Progress Summary */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#F7EAE5] dark:bg-[#231E1B] border border-[#EBCDC2] dark:border-[#362E2A] space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#B55841] dark:text-[#D47A63]">
                Tuổi thai hiện tại
              </p>
              <h2 className="font-editorial text-[26px] font-bold text-[#322622] dark:text-[#F4EDE6] tabular-nums leading-tight mt-0.5">
                Tuần {summary.weeks} {summary.days > 0 ? `+ ${summary.days} ngày` : ''}
              </h2>
              <p className="text-xs text-[#6B5D56] dark:text-[#C5B9B0] mt-1 tabular-nums">
                Dự sinh: <strong className="text-[#322622] dark:text-[#F4EDE6]">{user.dueDate}</strong> · Còn {summary.daysRemaining} ngày
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="w-14 h-14 ml-auto rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#EBCDC2] dark:border-[#362E2A] flex items-center justify-center mb-1">
                <span className="text-3xl">{summary.fruitComparison.fruitEmoji}</span>
              </div>
              <p className="text-[11px] font-bold text-[#4F6B56] dark:text-[#8DA892]">
                {summary.fruitComparison.fruitName}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-[#322622] dark:text-[#F4EDE6] tabular-nums">
                Tiến trình thai kỳ ({summary.progressPercent}%)
              </span>
              <span className="text-[#B55841] dark:text-[#D47A63] tabular-nums">
                {journey.completedMilestoneWeeks.length}/40 cột mốc đã đánh dấu
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-white/85 dark:bg-[#161311] overflow-hidden">
              <div
                className="h-full bg-[#B55841] dark:bg-[#D47A63] rounded-full transition-all"
                style={{ width: `${summary.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Monthly Progress Grid */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#786962] dark:text-[#B5A89F] mb-2.5">
            Tổng quan 9 tháng thai kỳ
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
            {monthlyStats.map((m) => (
              <div
                key={m.month}
                className="p-2 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] text-center border border-[#E6DDD1] dark:border-[#362E2A]"
              >
                <p className="text-[10px] font-bold text-[#786962] dark:text-[#B5A89F]">Tháng {m.month}</p>
                <p className="text-xs font-extrabold text-[#B55841] dark:text-[#D47A63] tabular-nums mt-0.5">
                  {m.done}/{m.total}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Trimester Switcher */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 1 as const, label: 'Tam cá 1 (1–13w)' },
            { id: 2 as const, label: 'Tam cá 2 (14–27w)' },
            { id: 3 as const, label: 'Tam cá 3 (28–40w)' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTrimester(t.id)}
              className={`min-h-[42px] py-2.5 px-2 rounded-2xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                activeTrimester === t.id
                  ? 'bg-[#B55841] text-white shadow-2xs'
                  : 'bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] text-[#6B5D56] dark:text-[#C5B9B0] hover:bg-[#F2ECE3] dark:hover:bg-[#231E1B]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Interactive 40-Week Milestone Timeline */}
        <div className="space-y-2.5">
          {trimesterRanges[activeTrimester].map((week) => {
            const info = getWeekMilestone(week);
            const fruit = FRUIT_COMPARISONS[week] || FRUIT_COMPARISONS[12];
            const isCompleted = journey.completedMilestoneWeeks.includes(week);
            const isCurrent = week === summary.weeks;
            return (
              <div
                key={week}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                  isCurrent
                    ? 'bg-[#F7EAE5]/65 dark:bg-[#35231E]/60 border-[#B55841]'
                    : 'bg-white dark:bg-[#1E1A17] border-[#E6DDD1] dark:border-[#362E2A]'
                }`}
              >
                <button
                  onClick={() => handleToggleWeek(week)}
                  aria-label={`Đánh dấu hoàn thành tuần ${week}`}
                  className="mt-0.5 shrink-0 cursor-pointer"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-[#4F6B56] dark:text-[#8DA892]" />
                  ) : (
                    <Circle className="w-6 h-6 text-[#C5B9B0] dark:text-[#4A403B]" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-extrabold text-[#322622] dark:text-[#F4EDE6] tabular-nums">
                        Tuần {week}
                      </span>
                      <span className="text-[#D6CCC0] dark:text-[#4A403B]">·</span>
                      <span className="text-xs font-medium text-[#6B5D56] dark:text-[#C5B9B0]">
                        {fruit.fruitEmoji} {fruit.fruitName}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#B55841] text-white whitespace-nowrap">
                          Hiện tại
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => onOpenWeek(week)}
                      className="text-[11px] font-bold text-[#B55841] dark:text-[#D47A63] flex items-center gap-0.5 cursor-pointer hover:underline whitespace-nowrap"
                    >
                      Chi tiết <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-bold text-[#322622] dark:text-[#F4EDE6] mt-1">{info.title}</p>
                  <p className="text-[11.5px] text-[#6B5D56] dark:text-[#C5B9B0] mt-0.5 line-clamp-2">
                    {info.babyDevelopment}
                  </p>
                  {info.checkupMilestone && (
                    <p className="text-[11px] text-[#B55841] dark:text-[#D47A63] font-semibold mt-1">
                      Mốc khám: {info.checkupMilestone}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Due Date Adjustment History */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] space-y-2.5">
          <h3 className="text-xs font-bold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-1.5">
            <History className="w-4 h-4 text-[#B55841] dark:text-[#D47A63]" /> Lịch sử điều chỉnh ngày dự sinh
          </h3>
          {journey.dueDateHistory.length === 0 ? (
            <p className="text-[11.5px] text-[#786962] dark:text-[#B5A89F]">
              Chưa có lần điều chỉnh nào. Nhấn "Đổi dự sinh" để cập nhật theo siêu âm mới.
            </p>
          ) : (
            <div className="space-y-2">
              {journey.dueDateHistory.map((h) => (
                <div
                  key={h.id}
                  className="p-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs flex items-center justify-between gap-2"
                >
                  <div>
                    <p className="font-bold text-[#322622] dark:text-[#F4EDE6] tabular-nums">
                      {h.previousDueDate} (Tuần {h.previousWeek}) → {h.newDueDate} (Tuần {h.newWeek})
                    </p>
                    <p className="text-[11px] text-[#786962] dark:text-[#B5A89F]">{h.reason}</p>
                  </div>
                  <span className="text-[10px] text-[#786962] dark:text-[#B5A89F] shrink-0 tabular-nums">
                    {new Date(h.changedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Due Date Modal */}
      {showEditDueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161311]/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#FAF6F0] dark:bg-[#1E1A17] rounded-3xl p-5 border border-[#E6DDD1] dark:border-[#362E2A] space-y-3 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#E6DDD1] dark:border-[#362E2A]">
              <h3 className="font-editorial text-[18px] font-bold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#B55841] dark:text-[#D47A63]" /> Cập nhật ngày dự sinh
              </h3>
              <button
                onClick={() => setShowEditDueModal(false)}
                aria-label="Đóng"
                className="w-8 h-8 rounded-full bg-[#F2ECE3] dark:bg-[#231E1B] text-[#786962] dark:text-[#B5A89F] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#6B5D56] dark:text-[#C5B9B0] mb-1">
                  Ngày dự sinh mới (DD/MM/YYYY)
                </label>
                <input
                  type="text"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-sm text-[#322622] dark:text-[#F4EDE6] tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#6B5D56] dark:text-[#C5B9B0] mb-1">
                  Tuần thai hiện tại (1 - 42)
                </label>
                <input
                  type="number"
                  min={1}
                  max={42}
                  value={newWeek}
                  onChange={(e) => setNewWeek(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-sm text-[#322622] dark:text-[#F4EDE6] tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#6B5D56] dark:text-[#C5B9B0] mb-1">
                  Lý do cập nhật
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-sm text-[#322622] dark:text-[#F4EDE6]"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowEditDueModal(false)}
                className="flex-1 min-h-[44px] py-2.5 rounded-xl border border-[#E6DDD1] dark:border-[#362E2A] text-xs font-bold text-[#6B5D56] dark:text-[#C5B9B0] cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveDueDate}
                className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-[#B55841] hover:bg-[#9E4A35] text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Lưu & Ghi lịch sử
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
