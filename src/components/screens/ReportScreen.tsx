import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  FileBarChart2,
  Printer,
  ShieldAlert,
  Droplet,
  Moon,
  Smile,
  CheckSquare,
  Compass,
  Lock,
} from 'lucide-react';
import { ChecklistItem, HealthDiaryEntry, JourneyState, UserProfile } from '../../types';
import { storageService } from '../../services/storageService';
import { apiService } from '../../services/apiService';

interface ReportScreenProps {
  user: UserProfile;
  onBack: () => void;
}

const MOOD_LABELS: Record<string, string> = {
  happy: 'Vui vẻ',
  calm: 'Thư thái',
  tired: 'Mệt mỏi',
  anxious: 'Lo âu',
  sad: 'Buồn',
  excited: 'Hào hứng',
  nauseous: 'Buồn nôn',
};

const SEVERITY_LABELS: Record<string, string> = {
  mild: 'Nhẹ',
  low: 'Nhẹ',
  moderate: 'Trung bình',
  medium: 'Trung bình',
  severe: 'Nặng',
  high: 'Nặng',
};

export const ReportScreen: React.FC<ReportScreenProps> = ({ user, onBack }) => {
  const [range, setRange] = useState<'week' | 'month'>('week');
  const [includeJourney, setIncludeJourney] = useState(true);
  const [includeHabits, setIncludeHabits] = useState(true);
  const [includeSleepMood, setIncludeSleepMood] = useState(true);
  const [includeSensitiveSymptoms, setIncludeSensitiveSymptoms] = useState(
    !(user.privacySettings?.hideSensitiveDiaryInReportsByDefault ?? true)
  );

  const [journey, setJourney] = useState<JourneyState | null>(null);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [serverDiary, setServerDiary] = useState<Record<string, HealthDiaryEntry>>({});

  useEffect(() => {
    Promise.allSettled([
      apiService.fetchJourney(user).then(setJourney),
      apiService.fetchChecklists(user).then(setChecklists),
      apiService.fetchDiary(user).then((r) => setServerDiary(r.entries || {})),
    ]).catch(() => {});
  }, [user.id]);

  const localDiary = storageService.loadHealthDiary();
  const mergedDiary: Record<string, HealthDiaryEntry> = { ...localDiary, ...serverDiary };
  const waterRecords = storageService.loadWaterRecords();
  const weeklyHabit = storageService.getWeeklyProgress();

  const stats = useMemo(() => {
    const daysLimit = range === 'week' ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysLimit);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    const recentWater = Object.values(waterRecords).filter((r) => r.date >= cutoffStr);
    const avgWater =
      recentWater.length > 0
        ? Math.round(recentWater.reduce((s, r) => s + r.currentMl, 0) / recentWater.length)
        : 0;

    const recentDiary = Object.values(mergedDiary).filter((d) => d.date >= cutoffStr);
    const sleepEntries = recentDiary.filter((d) => typeof d.sleepHours === 'number');
    const avgSleep =
      sleepEntries.length > 0
        ? (sleepEntries.reduce((s, d) => s + (d.sleepHours || 0), 0) / sleepEntries.length).toFixed(1)
        : 'Chưa ghi nhận';

    const avgHabitPct =
      weeklyHabit.length > 0
        ? Math.round(weeklyHabit.reduce((s, d) => s + d.percent, 0) / weeklyHabit.length)
        : 0;

    const symptomsList = recentDiary.flatMap((d) =>
      d.symptoms.map((s) => ({ date: d.date, name: s.name, severity: s.severity }))
    );

    const moodCounts = recentDiary.reduce((acc, d) => {
      if (d.mood) acc[d.mood] = (acc[d.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { avgWater, avgSleep, avgHabitPct, recentDiaryCount: recentDiary.length, symptomsList, moodCounts };
  }, [range, waterRecords, mergedDiary, weeklyHabit]);

  return (
    <div className="flex-1 flex flex-col bg-nova-bg text-nova-text overflow-y-auto no-scrollbar select-none print:bg-white print:text-black">
      <header className="px-4 sm:px-5 py-3 flex items-center justify-between gap-2 border-b border-nova-border sticky top-0 bg-nova-bg/95 backdrop-blur-md z-20 print:hidden">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-nova-surface border border-nova-border flex items-center justify-center cursor-pointer shrink-0 hover:bg-nova-bg-subtle text-nova-text-muted"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="font-editorial text-[17px] font-bold flex items-center gap-1.5 truncate text-nova-text">
              <FileBarChart2 className="w-4 h-4 text-nova-warning shrink-0" /> Báo cáo sức khỏe
            </h1>
            <p className="text-[11px] text-nova-text-muted truncate">Tổng hợp theo dõi sức khỏe và xuất tệp cho buổi khám</p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" /> Xuất PDF / In
        </button>
      </header>

      <div className="p-4 sm:p-5 space-y-4 max-w-4xl w-full mx-auto">
        {/* Non-diagnostic Notice */}
        <div className="p-3.5 rounded-2xl bg-nova-warning-soft border border-nova-warning-border flex items-start gap-2.5 text-xs text-nova-text">
          <ShieldAlert className="w-4 h-4 text-nova-warning shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Lưu ý quan trọng:</strong> Báo cáo này tổng hợp số liệu mẹ tự ghi nhận trong Nova Việt Mẫu nhằm hỗ trợ trao đổi thuận tiện với bác sĩ. Đây <strong>không phải kết luận chẩn đoán y khoa</strong>.
          </p>
        </div>

        {/* Range & Privacy Controls (Hidden in Print) */}
        <div className="p-4 rounded-3xl bg-nova-surface border border-nova-border space-y-3 print:hidden">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-nova-text">Phạm vi tổng hợp và quyền riêng tư trước khi xuất</span>
            <div className="flex bg-nova-bg-subtle p-1 rounded-xl gap-1 border border-nova-border">
              <button
                onClick={() => setRange('week')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap tabular-nums transition-colors ${
                  range === 'week'
                    ? 'bg-nova-accent text-nova-accent-contrast'
                    : 'text-nova-text-muted'
                }`}
              >
                7 ngày qua
              </button>
              <button
                onClick={() => setRange('month')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap tabular-nums transition-colors ${
                  range === 'month'
                    ? 'bg-nova-accent text-nova-accent-contrast'
                    : 'text-nova-text-muted'
                }`}
              >
                30 ngày qua
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              { label: 'Mục Hành trình và tuần thai', checked: includeJourney, set: setIncludeJourney },
              { label: 'Mục Nước uống và thói quen', checked: includeHabits, set: setIncludeHabits },
              { label: 'Mục Giấc ngủ và tâm trạng', checked: includeSleepMood, set: setIncludeSleepMood },
              { label: 'Mục Triệu chứng chi tiết (nhạy cảm)', checked: includeSensitiveSymptoms, set: setIncludeSensitiveSymptoms },
            ].map((opt, idx) => (
              <label key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-nova-bg border border-nova-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={opt.checked}
                  onChange={() => opt.set(!opt.checked)}
                  className="accent-nova-accent w-4 h-4 shrink-0"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Report Body (Printable) */}
        <div className="p-5 rounded-3xl bg-nova-surface border border-nova-border space-y-5 print:border-0 print:p-0 print:bg-white">
          <div className="flex items-center justify-between gap-2 border-b border-nova-border pb-3">
            <div>
              <h2 className="font-editorial text-lg font-bold">Báo cáo theo dõi sức khỏe mẹ và bé</h2>
              <p className="text-xs text-nova-text-muted tabular-nums mt-0.5">
                Họ tên: <strong className="text-nova-text">{user.name}</strong> · Tuần {user.pregnancyWeek} · Dự sinh: {user.dueDate}
              </p>
            </div>
            <span className="text-xs font-bold text-nova-accent whitespace-nowrap">
              {range === 'week' ? 'Báo cáo tuần' : 'Báo cáo tháng'}
            </span>
          </div>

          {includeJourney && (
            <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-nova-bg border border-nova-border">
                <p className="text-[11px] text-nova-text-muted flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-nova-accent" /> Mốc hoàn thành
                </p>
                <p className="text-xl font-extrabold mt-1 tabular-nums">
                  {journey?.completedMilestoneWeeks.length || 0}/40 tuần
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-nova-bg border border-nova-border">
                <p className="text-[11px] text-nova-text-muted flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5 text-nova-sage-text" /> Sổ chuẩn bị
                </p>
                <p className="text-xl font-extrabold mt-1 tabular-nums">
                  {checklists.filter((c) => c.completed).length}/{checklists.length} mục
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-nova-bg border border-nova-border">
                <p className="text-[11px] text-nova-text-muted">Số ngày ghi nhật ký</p>
                <p className="text-xl font-extrabold mt-1 tabular-nums">{stats.recentDiaryCount} ngày</p>
              </div>
            </section>
          )}

          {includeHabits && (
            <section className="space-y-2">
              <h3 className="font-editorial text-[15px] font-bold flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-nova-sage-text" /> Lượng nước và duy trì thói quen
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-nova-bg border border-nova-border">
                  <p className="text-[11px] text-nova-text-muted">Trung bình lượng nước</p>
                  <p className="text-lg font-extrabold text-nova-sage-text tabular-nums">{stats.avgWater} ml/ngày</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-nova-bg border border-nova-border">
                  <p className="text-[11px] text-nova-text-muted">Mức hoàn thành thói quen tuần</p>
                  <p className="text-lg font-extrabold text-nova-accent tabular-nums">{stats.avgHabitPct}%</p>
                </div>
              </div>
            </section>
          )}

          {includeSleepMood && (
            <section className="space-y-2">
              <h3 className="font-editorial text-[15px] font-bold flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-nova-warning" /> Giấc ngủ và tâm trạng
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-nova-bg border border-nova-border">
                  <p className="text-[11px] text-nova-text-muted">Thời lượng ngủ trung bình</p>
                  <p className="text-lg font-extrabold text-nova-warning tabular-nums">
                    {stats.avgSleep === 'Chưa ghi nhận' ? stats.avgSleep : `${stats.avgSleep} giờ/đêm`}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-nova-bg border border-nova-border">
                  <p className="text-[11px] text-nova-text-muted flex items-center gap-1">
                    <Smile className="w-3.5 h-3.5 text-nova-warning" /> Phân bố tâm trạng
                  </p>
                  <p className="text-xs font-semibold mt-1 text-nova-text">
                    {Object.keys(stats.moodCounts).length === 0
                      ? 'Chưa có dữ liệu tâm trạng'
                      : Object.entries(stats.moodCounts)
                          .map(([m, c]) => `${MOOD_LABELS[m] || m} (${c} lần)`)
                          .join(' · ')}
                  </p>
                </div>
              </div>
            </section>
          )}

          {includeSensitiveSymptoms ? (
            <section className="space-y-2">
              <h3 className="font-editorial text-[15px] font-bold text-nova-accent">Triệu chứng mẹ tự ghi nhận</h3>
              {stats.symptomsList.length === 0 ? (
                <p className="text-xs text-nova-text-muted">Không có triệu chứng nào được ghi nhận trong khoảng thời gian này.</p>
              ) : (
                <div className="space-y-1.5">
                  {stats.symptomsList.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs flex justify-between"
                    >
                      <span className="font-semibold">
                        {s.name} ({SEVERITY_LABELS[s.severity] || s.severity})
                      </span>
                      <span className="text-nova-text-muted tabular-nums">{s.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <div className="p-3 rounded-xl bg-nova-bg-subtle border border-nova-border text-xs text-nova-text-muted flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0" />
              <span>Dữ liệu triệu chứng nhạy cảm đã được ẩn theo cài đặt quyền riêng tư.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
