import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  BookOpen,
  PlayCircle,
  BellPlus,
  Stethoscope,
  ShieldCheck,
  CheckSquare,
} from 'lucide-react';
import {
  ChecklistItem,
  LibraryArticle,
  NovaVideoItem,
  ScreenType,
  UserKnowledgeState,
  UserProfile,
} from '../../types';
import { apiService } from '../../services/apiService';
import { storageService } from '../../services/storageService';
import { getWeekMilestone } from '../../data/pregnancyMilestones';
import { FRUIT_COMPARISONS } from '../../services/pregnancyCalculator';
import { INITIAL_LIBRARY_ARTICLES } from '../../data/ecosystemData';
import { NOVA_VIDEOS_DATA } from '../../data/mockData';

interface WeeklyScreenProps {
  user: UserProfile;
  initialWeek?: number;
  onBack: () => void;
  onNavigateScreen: (screen: ScreenType, meta?: { videoId?: string; articleId?: string }) => void;
}

export const WeeklyScreen: React.FC<WeeklyScreenProps> = ({
  user,
  initialWeek,
  onBack,
  onNavigateScreen,
}) => {
  const [selectedWeek, setSelectedWeek] = useState<number>(
    Math.max(1, Math.min(40, initialWeek || user.pregnancyWeek || 24))
  );
  const [knowledgeState, setKnowledgeState] = useState<UserKnowledgeState>({
    userId: user.id,
    readArticleIds: [],
    savedArticleIds: [],
    readWeeks: [],
    favoriteWeeks: [],
  });
  const [articles, setArticles] = useState<LibraryArticle[]>(INITIAL_LIBRARY_ARTICLES);
  const [videos, setVideos] = useState<NovaVideoItem[]>(NOVA_VIDEOS_DATA);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (initialWeek) setSelectedWeek(Math.max(1, Math.min(40, initialWeek)));
  }, [initialWeek]);

  useEffect(() => {
    Promise.allSettled([
      apiService.fetchLibrary(false, user).then((res) => {
        setArticles(res.articles);
        setKnowledgeState(res.state);
      }),
      apiService.fetchVideos('feed', user).then(setVideos),
      apiService.fetchChecklists(user).then(setChecklists),
    ]).catch(() => {});
  }, [user.id]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const milestone = getWeekMilestone(selectedWeek);
  const fruit = FRUIT_COMPARISONS[selectedWeek] || FRUIT_COMPARISONS[24];
  const isWeekRead = knowledgeState.readWeeks.includes(selectedWeek);
  const isWeekFav = knowledgeState.favoriteWeeks.includes(selectedWeek);

  const matchedArticles = articles.filter(
    (a) =>
      (a.weekMin === undefined || selectedWeek >= a.weekMin) &&
      (a.weekMax === undefined || selectedWeek <= a.weekMax)
  );

  const matchedVideos = videos
    .filter(
      (v) =>
        (v.weekMin === undefined || selectedWeek >= v.weekMin) &&
        (v.weekMax === undefined || selectedWeek <= v.weekMax)
    )
    .slice(0, 4);

  const matchedChecklists = checklists.filter(
    (c) => c.weekNumber === selectedWeek || (c.trimester && c.trimester === (selectedWeek <= 13 ? 1 : selectedWeek <= 27 ? 2 : 3))
  );

  const handleMarkWeekRead = async () => {
    try {
      const next = await apiService.updateLibraryState({ type: 'mark_week_read', week: selectedWeek }, user);
      setKnowledgeState(next);
      showToast(`Đã đánh dấu đã đọc Tuần ${selectedWeek}`);
    } catch {
      showToast('Đã lưu trạng thái đọc trên thiết bị');
    }
  };

  const handleToggleFavWeek = async () => {
    try {
      const next = await apiService.updateLibraryState(
        { type: 'toggle_week_favorite', week: selectedWeek },
        user
      );
      setKnowledgeState(next);
      showToast(isWeekFav ? 'Đã bỏ lưu tuần yêu thích' : `Đã lưu Tuần ${selectedWeek} vào yêu thích`);
    } catch {}
  };

  const handleCreateWeekReminder = async () => {
    storageService.addHealthReminder(
      {
        title: `Theo dõi Tuần ${selectedWeek}: ${milestone.title}`,
        category: 'checkup',
        time: '09:00',
        frequency: 'once',
        date: new Date().toISOString().slice(0, 10),
        isEnabled: true,
        notes: milestone.checkupMilestone || milestone.nutritionAdvice,
      },
      user.id
    );
    try {
      await apiService.syncReminders(storageService.loadHealthReminders(user.id), user);
    } catch {}
    showToast(`Đã tạo nhắc nhở cho Tuần ${selectedWeek} lúc 09:00`);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FAF6F0] dark:bg-[#161311] overflow-y-auto no-scrollbar select-none">
      {toast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#322622] dark:bg-[#231E1B] text-[#FAF6F0] border border-[#E6DDD1]/20 text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
          {toast}
        </div>
      )}

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
            <h1 className="font-editorial text-[18px] font-bold text-[#322622] dark:text-[#F4EDE6] leading-tight">
              Nova Weekly
            </h1>
            <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] tabular-nums">
              Hồ sơ của mẹ: Tuần {user.pregnancyWeek} · Đang xem Tuần {selectedWeek}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleFavWeek}
            aria-label="Yêu thích tuần thai"
            className={`w-9 h-9 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
              isWeekFav
                ? 'bg-[#B55841] border-[#B55841] text-white'
                : 'bg-white dark:bg-[#1E1A17] border-[#E6DDD1] dark:border-[#362E2A] text-[#786962] dark:text-[#B5A89F]'
            }`}
          >
            <Bookmark className="w-4 h-4" fill={isWeekFav ? 'currentColor' : 'none'} />
          </button>
        </div>
      </header>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Week Selector Strip */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedWeek((w) => Math.max(1, w - 1))}
            aria-label="Tuần trước"
            className="w-9 h-9 rounded-xl bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-center text-[#6B5D56] dark:text-[#C5B9B0] shrink-0 cursor-pointer hover:bg-[#F2ECE3] dark:hover:bg-[#231E1B]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {Array.from({ length: 40 }, (_, i) => i + 1).map((w) => (
              <button
                key={w}
                onClick={() => setSelectedWeek(w)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer tabular-nums transition-colors whitespace-nowrap ${
                  selectedWeek === w
                    ? 'bg-[#B55841] text-white shadow-2xs'
                    : w === user.pregnancyWeek
                    ? 'bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63] border border-[#EBCDC2] dark:border-[#52352D]'
                    : 'bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] text-[#6B5D56] dark:text-[#C5B9B0]'
                }`}
              >
                T{w}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSelectedWeek((w) => Math.min(40, w + 1))}
            aria-label="Tuần sau"
            className="w-9 h-9 rounded-xl bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-center text-[#6B5D56] dark:text-[#C5B9B0] shrink-0 cursor-pointer hover:bg-[#F2ECE3] dark:hover:bg-[#231E1B]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Week Hero Card */}
        <div className="p-5 rounded-3xl bg-[#F7EAE5] dark:bg-[#231E1B] border border-[#EBCDC2] dark:border-[#362E2A]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#B55841] dark:text-[#D47A63] tabular-nums">
                  Tuần thai thứ {selectedWeek}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#EBF1EC] dark:bg-[#1E2922] text-[#4F6B56] dark:text-[#8DA892] border border-[#C8D9CB] dark:border-[#33483A] px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Đã kiểm duyệt y khoa
                </span>
              </div>
              <h2 className="font-editorial text-[20px] font-bold text-[#322622] dark:text-[#F4EDE6] leading-snug">
                {milestone.title}
              </h2>
              <p className="text-xs text-[#6B5D56] dark:text-[#C5B9B0] mt-1 tabular-nums">
                Kích thước: <strong className="text-[#322622] dark:text-[#F4EDE6]">{fruit.fruitName}</strong> ({fruit.lengthDescription} · {fruit.weightDescription})
              </p>
            </div>
            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#EBCDC2] dark:border-[#362E2A] flex flex-col items-center justify-center shrink-0">
              <span className="text-4xl">{fruit.fruitEmoji}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <button
              onClick={handleMarkWeekRead}
              className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                isWeekRead
                  ? 'bg-[#4F6B56] text-white'
                  : 'bg-[#B55841] hover:bg-[#9E4A35] text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isWeekRead ? 'Đã hoàn thành đọc tuần này' : 'Đánh dấu đã đọc'}</span>
            </button>
            <button
              onClick={handleCreateWeekReminder}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] text-xs font-bold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-1.5 cursor-pointer hover:bg-[#F2ECE3] dark:hover:bg-[#2F2824] transition-colors whitespace-nowrap"
            >
              <BellPlus className="w-4 h-4 text-[#B55841] dark:text-[#D47A63]" /> Tạo nhắc nhở tuần {selectedWeek}
            </button>
          </div>
        </div>

        {/* Baby & Mother Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] space-y-2">
            <h3 className="font-editorial text-[15px] font-bold text-[#B55841] dark:text-[#D47A63]">
              Sự phát triển của bé
            </h3>
            <p className="text-xs text-[#6B5D56] dark:text-[#C5B9B0] leading-relaxed">
              {milestone.babyDevelopment}
            </p>
            <p className="text-[11px] font-semibold text-[#786962] dark:text-[#B5A89F]">
              {milestone.babySizeDesc}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] space-y-2">
            <h3 className="font-editorial text-[15px] font-bold text-[#4F6B56] dark:text-[#8DA892]">
              Thay đổi ở cơ thể mẹ
            </h3>
            <p className="text-xs text-[#6B5D56] dark:text-[#C5B9B0] leading-relaxed">
              {milestone.motherChanges}
            </p>
            <p className="text-xs text-[#4F6B56] dark:text-[#8DA892] font-semibold leading-relaxed">
              Dinh dưỡng: {milestone.nutritionAdvice}
            </p>
          </div>
        </div>

        {/* Checkup Milestone & Doctor Questions */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] space-y-2.5">
          <h3 className="font-editorial text-[15px] font-bold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-[#B55841] dark:text-[#D47A63]" /> Gợi ý chuẩn bị khám thai
          </h3>
          {milestone.checkupMilestone && (
            <div className="p-3 rounded-xl bg-[#F7EAE5] dark:bg-[#35231E] border border-[#EBCDC2] dark:border-[#52352D] text-xs font-semibold text-[#B55841] dark:text-[#D47A63]">
              {milestone.checkupMilestone}
            </div>
          )}
          <ul className="space-y-1.5">
            {milestone.doctorQuestions.map((q, i) => (
              <li key={i} className="text-xs text-[#6B5D56] dark:text-[#C5B9B0] flex items-start gap-2">
                <span className="font-bold text-[#B55841] dark:text-[#D47A63]">•</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] pt-2 border-t border-[#E6DDD1] dark:border-[#362E2A]">
            Nguồn tham khảo: {milestone.medicalSource} · Tài liệu phục vụ tham khảo, không thay thế khám bác sĩ.
          </p>
        </div>

        {/* Matched Checklist */}
        {matchedChecklists.length > 0 && (
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-[#4F6B56] dark:text-[#8DA892]" /> Checklist gợi ý giai đoạn này
              </h3>
              <button
                onClick={() => onNavigateScreen('checklist')}
                className="text-xs font-bold text-[#B55841] dark:text-[#D47A63] cursor-pointer whitespace-nowrap"
              >
                Mở Checklist →
              </button>
            </div>
            {matchedChecklists.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs flex items-center justify-between gap-2"
              >
                <span className={item.completed ? 'line-through text-[#786962] dark:text-[#B5A89F]' : 'font-medium text-[#322622] dark:text-[#F4EDE6]'}>
                  {item.title}
                </span>
                <span
                  className={`text-[10px] font-bold shrink-0 ${
                    item.completed
                      ? 'text-[#4F6B56] dark:text-[#8DA892]'
                      : 'text-[#9E5B3B] dark:text-[#D7BA86]'
                  }`}
                >
                  {item.completed ? 'Xong' : 'Cần làm'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Matched Articles & Videos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#4F6B56] dark:text-[#8DA892]" /> Bài đọc phù hợp Tuần {selectedWeek}
              </h3>
              <button
                onClick={() => onNavigateScreen('library')}
                className="text-xs font-bold text-[#B55841] dark:text-[#D47A63] cursor-pointer whitespace-nowrap"
              >
                Tất cả
              </button>
            </div>
            {matchedArticles.slice(0, 3).map((art) => (
              <button
                key={art.id}
                onClick={() => onNavigateScreen('library', { articleId: art.id })}
                className="w-full p-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] text-left hover:border-[#B55841] border border-[#E6DDD1] dark:border-[#362E2A] cursor-pointer block transition-colors"
              >
                <p className="text-xs font-bold text-[#322622] dark:text-[#F4EDE6] truncate">{art.title}</p>
                <p className="text-[10.5px] text-[#786962] dark:text-[#B5A89F] truncate mt-0.5">{art.medicalSource}</p>
              </button>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-1.5">
                <PlayCircle className="w-4 h-4 text-[#9E5B3B] dark:text-[#D7BA86]" /> Video thai giáo phù hợp
              </h3>
              <button
                onClick={() => onNavigateScreen('video')}
                className="text-xs font-bold text-[#B55841] dark:text-[#D47A63] cursor-pointer whitespace-nowrap"
              >
                Xem thêm
              </button>
            </div>
            {matchedVideos.map((vid) => (
              <button
                key={vid.id}
                onClick={() => onNavigateScreen('video', { videoId: vid.id })}
                className="w-full p-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#B55841] text-left cursor-pointer flex items-center justify-between gap-2 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#322622] dark:text-[#F4EDE6] truncate">{vid.title}</p>
                  <p className="text-[10.5px] text-[#786962] dark:text-[#B5A89F] truncate">{vid.channelName}</p>
                </div>
                <PlayCircle className="w-4 h-4 text-[#9E5B3B] dark:text-[#D7BA86] shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
