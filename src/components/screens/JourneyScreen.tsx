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
      showMsg('Đã cập nhật tuổi thai và lưu lịch sử thay đổi');
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
    <div className="flex-1 flex flex-col bg-nova-bg text-nova-text overflow-y-auto no-scrollbar select-none">
      {toast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-nova-text text-nova-bg border border-nova-border/20 text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-nova-taupe" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <header className="px-4 sm:px-5 py-3 flex items-center justify-between border-b border-nova-border sticky top-0 bg-nova-bg/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Quay lại"
            className="w-9 h-9 rounded-full bg-nova-surface border border-nova-border flex items-center justify-center text-nova-text-muted hover:bg-nova-bg-subtle transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-editorial text-[18px] font-bold text-nova-text flex items-center gap-1.5 leading-tight">
              <Compass className="w-4 h-4 text-nova-accent" /> Hành trình 40 tuần
            </h1>
            <p className="text-[11px] text-nova-text-muted">
              Theo dõi cột mốc phát triển và lịch sử dự sinh
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowEditDueModal(true)}
          className="min-h-[38px] px-3 py-1.5 rounded-xl bg-nova-accent-soft border border-nova-border text-nova-accent text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap hover:bg-nova-bg-subtle transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" /> Đổi dự sinh
        </button>
      </header>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Progress Summary */}
        <div className="p-4 sm:p-5 rounded-3xl bg-nova-accent-soft border border-nova-border space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-nova-accent">
                Tuổi thai hiện tại
              </p>
              <h2 className="font-editorial text-[26px] font-bold text-nova-text tabular-nums leading-tight mt-0.5">
                Tuần {summary.weeks} {summary.days > 0 ? `+ ${summary.days} ngày` : ''}
              </h2>
              <p className="text-xs text-nova-text-muted mt-1 tabular-nums">
                Dự sinh: <strong className="text-nova-text">{user.dueDate}</strong> · Còn {summary.daysRemaining} ngày
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="w-14 h-14 ml-auto rounded-2xl bg-nova-surface border border-nova-border flex items-center justify-center mb-1">
                <span className="text-3xl">{summary.fruitComparison.fruitEmoji}</span>
              </div>
              <p className="text-[11px] font-bold text-nova-sage-text">
                {summary.fruitComparison.fruitName}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-nova-text tabular-nums">
                Tiến trình thai kỳ ({summary.progressPercent}%)
              </span>
              <span className="text-nova-accent tabular-nums">
                {journey.completedMilestoneWeeks.length}/40 cột mốc đã đánh dấu
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-nova-surface overflow-hidden">
              <div
                className="h-full bg-nova-accent rounded-full transition-all"
                style={{ width: `${summary.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Monthly Progress Grid */}
        <div className="p-4 rounded-2xl bg-nova-surface border border-nova-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-nova-text-muted mb-2.5">
            Tổng quan 9 tháng thai kỳ
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
            {monthlyStats.map((m) => (
              <div
                key={m.month}
                className="p-2 rounded-xl bg-nova-bg text-center border border-nova-border"
              >
                <p className="text-[10px] font-bold text-nova-text-muted">Tháng {m.month}</p>
                <p className="text-xs font-extrabold text-nova-accent tabular-nums mt-0.5">
                  {m.done}/{m.total}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Trimester Switcher */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 1 as const, label: 'Tam cá nguyệt 1', sub: 'Tuần 1–13' },
            { id: 2 as const, label: 'Tam cá nguyệt 2', sub: 'Tuần 14–27' },
            { id: 3 as const, label: 'Tam cá nguyệt 3', sub: 'Tuần 28–40' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTrimester(t.id)}
              className={`min-h-[48px] py-2 px-2 rounded-2xl text-center transition-colors cursor-pointer tabular-nums flex flex-col items-center justify-center ${
                activeTrimester === t.id
                  ? 'bg-nova-accent text-nova-accent-contrast shadow-2xs'
                  : 'bg-nova-surface border border-nova-border text-nova-text-muted hover:bg-nova-bg-subtle'
              }`}
            >
              <span className="text-[11.5px] font-bold leading-tight">{t.label}</span>
              <span className={`text-[10px] mt-0.5 ${activeTrimester === t.id ? 'opacity-85' : 'opacity-75'}`}>
                {t.sub}
              </span>
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
                    ? 'bg-nova-accent-soft border-nova-accent'
                    : 'bg-nova-surface border-nova-border'
                }`}
              >
                <button
                  onClick={() => handleToggleWeek(week)}
                  aria-label={`Đánh dấu hoàn thành tuần ${week}`}
                  className="mt-0.5 shrink-0 cursor-pointer"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-nova-sage-text" />
                  ) : (
                    <Circle className="w-6 h-6 text-nova-icon" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-extrabold text-nova-text tabular-nums">
                        Tuần {week}
                      </span>
                      <span className="text-nova-border">·</span>
                      <span className="text-xs font-medium text-nova-text-muted">
                        {fruit.fruitEmoji} {fruit.fruitName}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-nova-accent text-nova-accent-contrast whitespace-nowrap">
                          Hiện tại
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => onOpenWeek(week)}
                      className="text-[11px] font-bold text-nova-accent flex items-center gap-0.5 cursor-pointer hover:underline whitespace-nowrap"
                    >
                      Chi tiết <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-bold text-nova-text mt-1">{info.title}</p>
                  <p className="text-[11.5px] text-nova-text-muted mt-0.5 line-clamp-2">
                    {info.babyDevelopment}
                  </p>
                  {info.checkupMilestone && (
                    <p className="text-[11px] text-nova-accent font-semibold mt-1">
                      Mốc khám: {info.checkupMilestone}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Due Date Adjustment History */}
        <div className="p-4 rounded-2xl bg-nova-surface border border-nova-border space-y-2.5">
          <h3 className="text-xs font-bold text-nova-text flex items-center gap-1.5">
            <History className="w-4 h-4 text-nova-accent" /> Lịch sử điều chỉnh ngày dự sinh
          </h3>
          {journey.dueDateHistory.length === 0 ? (
            <p className="text-[11.5px] text-nova-text-muted">
              Chưa có lần điều chỉnh nào. Nhấn "Đổi dự sinh" để cập nhật theo kết quả siêu âm mới.
            </p>
          ) : (
            <div className="space-y-2">
              {journey.dueDateHistory.map((h) => (
                <div
                  key={h.id}
                  className="p-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs flex items-center justify-between gap-2"
                >
                  <div>
                    <p className="font-bold text-nova-text tabular-nums">
                      {h.previousDueDate} (Tuần {h.previousWeek}) → {h.newDueDate} (Tuần {h.newWeek})
                    </p>
                    <p className="text-[11px] text-nova-text-muted">{h.reason}</p>
                  </div>
                  <span className="text-[10px] text-nova-text-muted shrink-0 tabular-nums">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1B18]/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-nova-surface-elevated rounded-3xl p-5 border border-nova-border space-y-3 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-nova-border">
              <h3 className="font-editorial text-[18px] font-bold text-nova-text flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-nova-accent" /> Cập nhật ngày dự sinh
              </h3>
              <button
                onClick={() => setShowEditDueModal(false)}
                aria-label="Đóng"
                className="w-8 h-8 rounded-full bg-nova-bg-subtle text-nova-text-muted flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-nova-text-muted mb-1">
                  Ngày dự sinh mới (Ngày/Tháng/Năm)
                </label>
                <input
                  type="text"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-sm text-nova-text tabular-nums focus:outline-none focus:border-nova-accent"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-nova-text-muted mb-1">
                  Tuần thai hiện tại (1 - 42)
                </label>
                <input
                  type="number"
                  min={1}
                  max={42}
                  value={newWeek}
                  onChange={(e) => setNewWeek(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-sm text-nova-text tabular-nums focus:outline-none focus:border-nova-accent"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-nova-text-muted mb-1">
                  Lý do cập nhật
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-sm text-nova-text focus:outline-none focus:border-nova-accent"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowEditDueModal(false)}
                className="flex-1 min-h-[44px] py-2.5 rounded-xl border border-nova-border bg-nova-bg text-xs font-bold text-nova-text-muted cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveDueDate}
                className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-xs font-bold cursor-pointer transition-colors"
              >
                Lưu và ghi lịch sử
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
