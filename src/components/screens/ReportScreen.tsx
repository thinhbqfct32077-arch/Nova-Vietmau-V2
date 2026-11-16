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
    <div className="flex-1 flex flex-col bg-[#FAF6F0] dark:bg-[#161311] text-[#322622] dark:text-[#F4EDE6] overflow-y-auto no-scrollbar select-none print:bg-white print:text-black">
      <header className="px-4 sm:px-5 py-3 flex items-center justify-between gap-2 border-b border-[#E6DDD1] dark:border-[#362E2A] sticky top-0 bg-[#FAF6F0]/95 dark:bg-[#161311]/95 backdrop-blur-md z-20 print:hidden">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-center cursor-pointer shrink-0 hover:bg-[#F2ECE3] dark:hover:bg-[#231E1B]"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="font-editorial text-[17px] font-bold flex items-center gap-1.5 truncate">
              <FileBarChart2 className="w-4 h-4 text-[#9E5B3B] dark:text-[#D7BA86] shrink-0" /> Nova Report
            </h1>
            <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] truncate">Tổng hợp theo dõi sức khỏe & xuất PDF cho buổi khám</p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#B55841] hover:bg-[#9E4A35] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
        >
          <Printer className="w-4 h-4" /> Xuất PDF / In
        </button>
      </header>

      <div className="p-4 sm:p-5 space-y-4 max-w-4xl w-full mx-auto">
        {/* Non-diagnostic Notice */}
        <div className="p-3.5 rounded-2xl bg-[#F6EFE2] dark:bg-[#2F281C] border border-[#E5D4B3] dark:border-[#4A3F2B] flex items-start gap-2.5 text-xs text-[#6B4E23] dark:text-[#EAD6B3]">
          <ShieldAlert className="w-4 h-4 text-[#9E5B3B] dark:text-[#D7BA86] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Lưu ý quan trọng:</strong> Báo cáo này tổng hợp số liệu mẹ tự ghi nhận trong Nova Việt Mẫu nhằm hỗ trợ trao đổi thuận tiện với bác sĩ. Đây <strong>không phải kết luận chẩn đoán y khoa</strong>.
          </p>
        </div>

        {/* Range & Privacy Controls (Hidden in Print) */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] space-y-3 print:hidden">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-[#322622] dark:text-[#F4EDE6]">Phạm vi tổng hợp & Quyền riêng tư trước khi xuất</span>
            <div className="flex bg-[#F2ECE3] dark:bg-[#231E1B] p-1 rounded-xl gap-1 border border-[#E6DDD1] dark:border-[#362E2A]">
              <button
                onClick={() => setRange('week')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap tabular-nums ${
                  range === 'week'
                    ? 'bg-[#B55841] text-white'
                    : 'text-[#786962] dark:text-[#B5A89F]'
                }`}
              >
                7 ngày qua
              </button>
              <button
                onClick={() => setRange('month')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap tabular-nums ${
                  range === 'month'
                    ? 'bg-[#B55841] text-white'
                    : 'text-[#786962] dark:text-[#B5A89F]'
                }`}
              >
                30 ngày qua
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              { label: 'Mục Hành trình & Tuần thai', checked: includeJourney, set: setIncludeJourney },
              { label: 'Mục Nước uống & Thói quen', checked: includeHabits, set: setIncludeHabits },
              { label: 'Mục Giấc ngủ & Tâm trạng', checked: includeSleepMood, set: setIncludeSleepMood },
              { label: 'Mục Triệu chứng chi tiết (nhạy cảm)', checked: includeSensitiveSymptoms, set: setIncludeSensitiveSymptoms },
            ].map((opt, idx) => (
              <label key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1]/70 dark:border-[#362E2A] cursor-pointer">
                <input
                  type="checkbox"
                  checked={opt.checked}
                  onChange={() => opt.set(!opt.checked)}
                  className="accent-[#B55841] w-4 h-4 shrink-0"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Report Body (Printable) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] space-y-5 print:border-0 print:p-0 print:bg-white">
          <div className="flex items-center justify-between gap-2 border-b border-[#E6DDD1] dark:border-[#362E2A] pb-3">
            <div>
              <h2 className="font-editorial text-lg font-bold">Báo cáo theo dõi sức khỏe Mẹ & Bé</h2>
              <p className="text-xs text-[#786962] dark:text-[#B5A89F] tabular-nums mt-0.5">
                Họ tên: <strong className="text-[#322622] dark:text-[#F4EDE6]">{user.name}</strong> · Tuần {user.pregnancyWeek} · Dự sinh: {user.dueDate}
              </p>
            </div>
            <span className="text-xs font-bold text-[#B55841] dark:text-[#D47A63] whitespace-nowrap">
              {range === 'week' ? 'Báo cáo Tuần' : 'Báo cáo Tháng'}
            </span>
          </div>

          {includeJourney && (
            <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1]/70 dark:border-[#362E2A]">
                <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-[#B55841] dark:text-[#D47A63]" /> Mốc hoàn thành
                </p>
                <p className="text-xl font-extrabold mt-1 tabular-nums">
                  {journey?.completedMilestoneWeeks.length || 0}/40 tuần
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1]/70 dark:border-[#362E2A]">
                <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5 text-[#4F6B56] dark:text-[#8DA892]" /> Checklist chuẩn bị
                </p>
                <p className="text-xl font-extrabold mt-1 tabular-nums">
                  {checklists.filter((c) => c.completed).length}/{checklists.length} mục
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1]/70 dark:border-[#362E2A]">
                <p className="text-[11px] text-[#786962] dark:text-[#B5A89F]">Số ngày ghi nhật ký</p>
                <p className="text-xl font-extrabold mt-1 tabular-nums">{stats.recentDiaryCount} ngày</p>
              </div>
            </section>
          )}

          {includeHabits && (
            <section className="space-y-2">
              <h3 className="font-editorial text-[15px] font-bold flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-[#4F6B56] dark:text-[#8DA892]" /> Lượng nước & Duy trì thói quen
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#FAF6F0]/60 dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A]">
                  <p className="text-[11px] text-[#786962] dark:text-[#B5A89F]">Trung bình lượng nước</p>
                  <p className="text-lg font-extrabold text-[#4F6B56] dark:text-[#8DA892] tabular-nums">{stats.avgWater} ml/ngày</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF6F0]/60 dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A]">
                  <p className="text-[11px] text-[#786962] dark:text-[#B5A89F]">Mức hoàn thành thói quen tuần</p>
                  <p className="text-lg font-extrabold text-[#B55841] dark:text-[#D47A63] tabular-nums">{stats.avgHabitPct}%</p>
                </div>
              </div>
            </section>
          )}

          {includeSleepMood && (
            <section className="space-y-2">
              <h3 className="font-editorial text-[15px] font-bold flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-[#9E5B3B] dark:text-[#D7BA86]" /> Giấc ngủ & Tâm trạng
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#FAF6F0]/60 dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A]">
                  <p className="text-[11px] text-[#786962] dark:text-[#B5A89F]">Thời lượng ngủ trung bình</p>
                  <p className="text-lg font-extrabold text-[#9E5B3B] dark:text-[#D7BA86] tabular-nums">
                    {stats.avgSleep === 'Chưa ghi nhận' ? stats.avgSleep : `${stats.avgSleep} giờ/đêm`}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF6F0]/60 dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A]">
                  <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] flex items-center gap-1">
                    <Smile className="w-3.5 h-3.5 text-[#C4A46B]" /> Phân bố tâm trạng
                  </p>
                  <p className="text-xs font-semibold mt-1 text-[#322622] dark:text-[#F4EDE6]">
                    {Object.keys(stats.moodCounts).length === 0
                      ? 'Chưa có dữ liệu tâm trạng'
                      : Object.entries(stats.moodCounts)
                          .map(([m, c]) => `${m} (${c} lần)`)
                          .join(' · ')}
                  </p>
                </div>
              </div>
            </section>
          )}

          {includeSensitiveSymptoms ? (
            <section className="space-y-2">
              <h3 className="font-editorial text-[15px] font-bold text-[#B55841] dark:text-[#D47A63]">Triệu chứng mẹ tự ghi nhận</h3>
              {stats.symptomsList.length === 0 ? (
                <p className="text-xs text-[#786962] dark:text-[#B5A89F]">Không có triệu chứng nào được ghi nhận trong khoảng thời gian này.</p>
              ) : (
                <div className="space-y-1.5">
                  {stats.symptomsList.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1]/70 dark:border-[#362E2A] text-xs flex justify-between"
                    >
                      <span className="font-semibold">{s.name} ({s.severity})</span>
                      <span className="text-[#786962] dark:text-[#B5A89F] tabular-nums">{s.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <div className="p-3 rounded-xl bg-[#F2ECE3] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#786962] dark:text-[#B5A89F] flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0" />
              <span>Dữ liệu triệu chứng nhạy cảm đã được ẩn theo cài đặt quyền riêng tư.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
