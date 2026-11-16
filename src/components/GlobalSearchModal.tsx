import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  BookOpen,
  PlayCircle,
  Users,
  ShoppingBag,
  CheckSquare,
  Calendar,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  ChecklistItem,
  DetailedPost,
  LibraryArticle,
  NovaVideoItem,
  ProductItem,
  ScreenType,
  UserProfile,
} from '../types';
import { apiService } from '../services/apiService';
import { INITIAL_LIBRARY_ARTICLES } from '../data/ecosystemData';
import { NOVA_VIDEOS_DATA, INITIAL_DETAILED_POSTS, PRODUCTS_DATA } from '../data/mockData';
import { getWeekMilestone } from '../data/pregnancyMilestones';
import { FRUIT_COMPARISONS } from '../services/pregnancyCalculator';
import { NovaImage } from './NovaBrandMark';

interface GlobalSearchModalProps {
  isOpen: boolean;
  user?: UserProfile;
  onClose: () => void;
  onNavigate: (
    screen: ScreenType,
    meta?: {
      week?: number;
      articleId?: string;
      videoId?: string;
      postId?: string;
      product?: ProductItem;
    }
  ) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  user,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'weekly' | 'library' | 'video' | 'community' | 'shop' | 'checklist'>('all');
  const [articles, setArticles] = useState<LibraryArticle[]>(INITIAL_LIBRARY_ARTICLES);
  const [videos, setVideos] = useState<NovaVideoItem[]>(NOVA_VIDEOS_DATA);
  const [posts, setPosts] = useState<DetailedPost[]>(INITIAL_DETAILED_POSTS);
  const [products, setProducts] = useState<ProductItem[]>(PRODUCTS_DATA);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    Promise.allSettled([
      apiService.fetchLibrary(false, user).then((r) => setArticles(r.articles)),
      apiService.fetchVideos('feed', user).then(setVideos),
      apiService.fetchCommunityPosts(user).then(setPosts),
      apiService.fetchProducts().then(setProducts),
      apiService.fetchChecklists(user).then(setChecklists),
    ]).catch(() => {});
  }, [isOpen, user?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const q = query.trim().toLowerCase();

  const weekResults = useMemo(() => {
    const weeks = Array.from({ length: 40 }, (_, i) => i + 1).map((w) => ({
      week: w,
      info: getWeekMilestone(w),
      fruit: FRUIT_COMPARISONS[w] || FRUIT_COMPARISONS[12],
    }));
    if (!q) return weeks.filter((w) => w.week === (user?.pregnancyWeek || 24) || w.week === 12 || w.week === 20 || w.week === 36);
    return weeks
      .filter(
        (w) =>
          `tuần ${w.week}`.includes(q) ||
          String(w.week) === q ||
          w.info.title.toLowerCase().includes(q) ||
          w.info.babyDevelopment.toLowerCase().includes(q) ||
          w.info.motherChanges.toLowerCase().includes(q) ||
          w.fruit.fruitName.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [q, user?.pregnancyWeek]);

  const articleResults = useMemo(() => {
    if (!q) return articles.slice(0, 3);
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.medicalSource.toLowerCase().includes(q)
    );
  }, [articles, q]);

  const videoResults = useMemo(() => {
    if (!q) return videos.slice(0, 3);
    return videos.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.channelName.toLowerCase().includes(q) ||
        v.hashtags.some((h) => h.toLowerCase().includes(q))
    );
  }, [videos, q]);

  const postResults = useMemo(() => {
    if (!q) return posts.slice(0, 3);
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q)
    );
  }, [posts, q]);

  const productResults = useMemo(() => {
    if (!q) return products.slice(0, 3);
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [products, q]);

  const checklistResults = useMemo(() => {
    if (!q) return checklists.slice(0, 3);
    return checklists.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.notes || '').toLowerCase().includes(q)
    );
  }, [checklists, q]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'weekly', label: `Tuần thai (${weekResults.length})` },
    { id: 'library', label: `Thư viện (${articleResults.length})` },
    { id: 'video', label: `Video (${videoResults.length})` },
    { id: 'community', label: `Cộng đồng (${postResults.length})` },
    { id: 'checklist', label: `Checklist (${checklistResults.length})` },
    { id: 'shop', label: `Cửa hàng (${productResults.length})` },
  ] as const;

  const hasAny =
    weekResults.length +
      articleResults.length +
      videoResults.length +
      postResults.length +
      checklistResults.length +
      productResults.length >
    0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:pt-12 select-none print:hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#161311]/55 backdrop-blur-xs cursor-pointer"
        />

        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.97 }}
          className="relative z-10 w-full max-w-2xl max-h-[85vh] bg-[#FAF6F0] dark:bg-[#1E1A17] rounded-3xl shadow-2xl border border-[#E6DDD1] dark:border-[#362E2A] flex flex-col overflow-hidden"
        >
          {/* Search Input Header */}
          <div className="p-4 bg-white dark:bg-[#231E1B] border-b border-[#E6DDD1] dark:border-[#362E2A] flex items-center gap-3">
            <Search className="w-5 h-5 text-[#B55841] dark:text-[#D47A63] shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tuần thai, bài kiến thức, video thai giáo, checklist, sản phẩm..."
              className="flex-1 bg-transparent text-sm text-[#322622] dark:text-[#F4EDE6] placeholder:text-[#786962] dark:placeholder:text-[#B5A89F] focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs font-semibold text-[#786962] dark:text-[#B5A89F] hover:text-[#B55841] dark:hover:text-[#D47A63] px-2 py-1 cursor-pointer whitespace-nowrap"
              >
                Xóa
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Đóng tìm kiếm"
              className="w-9 h-9 rounded-full bg-[#F2ECE3] dark:bg-[#1E1A17] text-[#6B5D56] dark:text-[#C5B9B0] flex items-center justify-center hover:bg-[#E6DDD1] dark:hover:bg-[#2F2824] transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 py-2.5 bg-white dark:bg-[#231E1B] border-b border-[#E6DDD1] dark:border-[#362E2A] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors tabular-nums ${
                  activeTab === t.id
                    ? 'bg-[#B55841] text-white'
                    : 'bg-[#F2ECE3] dark:bg-[#1E1A17] text-[#6B5D56] dark:text-[#C5B9B0] hover:bg-[#E6DDD1] dark:hover:bg-[#2F2824]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
            {!q && (
              <div className="flex items-center gap-2 text-xs text-[#6B5D56] dark:text-[#C5B9B0] bg-[#F7EAE5]/65 dark:bg-[#35231E]/60 px-3.5 py-2.5 rounded-2xl border border-[#EBCDC2] dark:border-[#52352D]">
                <Sparkles className="w-4 h-4 text-[#B55841] dark:text-[#D47A63] shrink-0" />
                <span className="tabular-nums">
                  Gợi ý nhanh cho mẹ bầu tuần {user?.pregnancyWeek || 24}. Nhập từ khóa để tìm trên toàn hệ sinh thái Nova.
                </span>
              </div>
            )}

            {!hasAny && (
              <div className="py-14 text-center text-[#786962] dark:text-[#B5A89F]">
                <Search className="w-9 h-9 mx-auto mb-2.5 opacity-40" />
                <p className="font-editorial text-[16px] font-bold text-[#322622] dark:text-[#F4EDE6]">
                  Không tìm thấy kết quả phù hợp
                </p>
                <p className="text-xs mt-1">
                  Thử tìm với từ khóa ngắn gọn hơn như "sắt", "tuần 24", "thai máy", "yoga"...
                </p>
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'weekly') && weekResults.length > 0 && (
              <section>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#786962] dark:text-[#B5A89F] mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#B55841] dark:text-[#D47A63]" /> Thai kỳ theo tuần
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {weekResults.map((w) => (
                    <button
                      key={w.week}
                      onClick={() => {
                        onClose();
                        onNavigate('weekly', { week: w.week });
                      }}
                      className="p-3 rounded-2xl bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#B55841] text-left flex items-center justify-between gap-2 cursor-pointer transition-colors min-h-[44px]"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#322622] dark:text-[#F4EDE6] truncate tabular-nums">
                          Tuần {w.week} · {w.fruit.fruitEmoji} {w.fruit.fruitName}
                        </p>
                        <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] truncate mt-0.5">
                          {w.info.babyDevelopment}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#B5A89F] dark:text-[#786962] shrink-0" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'library') && articleResults.length > 0 && (
              <section>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#786962] dark:text-[#B5A89F] mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#4F6B56] dark:text-[#8DA892]" /> Thư viện kiến thức y khoa
                </h4>
                <div className="space-y-2">
                  {articleResults.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        onClose();
                        onNavigate('library', { articleId: a.id });
                      }}
                      className="w-full min-h-[44px] p-3 rounded-2xl bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#B55841] text-left flex items-center justify-between gap-2 cursor-pointer transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#322622] dark:text-[#F4EDE6] truncate">{a.title}</p>
                        <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] truncate mt-0.5">
                          Nguồn: {a.medicalSource}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#B5A89F] dark:text-[#786962] shrink-0" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'video') && videoResults.length > 0 && (
              <section>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#786962] dark:text-[#B5A89F] mb-2 flex items-center gap-1.5">
                  <PlayCircle className="w-3.5 h-3.5 text-[#9E5B3B] dark:text-[#D7BA86]" /> Video thai giáo
                </h4>
                <div className="space-y-2">
                  {videoResults.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        onClose();
                        onNavigate('video', { videoId: v.id });
                      }}
                      className="w-full min-h-[44px] p-3 rounded-2xl bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#B55841] text-left flex items-center justify-between gap-2 cursor-pointer transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#322622] dark:text-[#F4EDE6] truncate">{v.title}</p>
                        <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] truncate mt-0.5">
                          {v.channelName} · {v.hashtags.slice(0, 2).join(' ')}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#B5A89F] dark:text-[#786962] shrink-0" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'community') && postResults.length > 0 && (
              <section>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#786962] dark:text-[#B5A89F] mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#B55841] dark:text-[#D47A63]" /> Cộng đồng mẹ bầu
                </h4>
                <div className="space-y-2">
                  {postResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onClose();
                        onNavigate('community', { postId: p.id });
                      }}
                      className="w-full min-h-[44px] p-3 rounded-2xl bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#B55841] text-left flex items-center justify-between gap-2 cursor-pointer transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#322622] dark:text-[#F4EDE6] truncate">{p.title}</p>
                        <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] truncate mt-0.5">
                          {p.author} · {p.weekTag}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#B5A89F] dark:text-[#786962] shrink-0" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'checklist') && checklistResults.length > 0 && (
              <section>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#786962] dark:text-[#B5A89F] mb-2 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-[#4F6B56] dark:text-[#8DA892]" /> Nova Checklist
                </h4>
                <div className="space-y-2">
                  {checklistResults.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onClose();
                        onNavigate('checklist');
                      }}
                      className="w-full min-h-[44px] p-3 rounded-2xl bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#B55841] text-left flex items-center justify-between gap-2 cursor-pointer transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#322622] dark:text-[#F4EDE6] truncate">{c.title}</p>
                        <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] truncate mt-0.5">
                          {c.completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#B5A89F] dark:text-[#786962] shrink-0" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'shop') && productResults.length > 0 && (
              <section>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#786962] dark:text-[#B5A89F] mb-2 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#9E5B3B] dark:text-[#D7BA86]" /> Cửa hàng Mẹ & Bé
                </h4>
                <div className="space-y-2">
                  {productResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onClose();
                        onNavigate('shop', { product: p });
                      }}
                      className="w-full min-h-[44px] p-3 rounded-2xl bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#B55841] text-left flex items-center justify-between gap-2 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <NovaImage src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0 bg-[#F2ECE3] dark:bg-[#1E1A17]" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#322622] dark:text-[#F4EDE6] truncate">{p.name}</p>
                          <p className="text-[11px] font-bold text-[#B55841] dark:text-[#D47A63] mt-0.5 tabular-nums">{p.formattedPrice}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#B5A89F] dark:text-[#786962] shrink-0" />
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
