import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Search,
  Bookmark,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Plus,
  X,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { LibraryArticle, LibraryCategory, UserKnowledgeState, UserProfile } from '../../types';
import { INITIAL_LIBRARY_ARTICLES } from '../../data/ecosystemData';
import { apiService } from '../../services/apiService';
import { storageService } from '../../services/storageService';

interface LibraryScreenProps {
  user?: UserProfile;
  focusArticleId?: string | null;
  onClearFocusArticle?: () => void;
}

const CATEGORY_LABELS: { id: 'all' | LibraryCategory; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pregnancy', label: 'Thai kỳ' },
  { id: 'nutrition', label: 'Dinh dưỡng' },
  { id: 'maternal_care', label: 'Chăm sóc mẹ' },
  { id: 'birth_prep', label: 'Chuẩn bị sinh' },
  { id: 'postpartum', label: 'Sau sinh' },
  { id: 'newborn_care', label: 'Chăm sóc bé' },
];

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  user,
  focusArticleId,
  onClearFocusArticle,
}) => {
  const userId = user?.id || 'usr-1';
  const isStaff = user?.role === 'admin' || user?.role === 'moderator';

  const [articles, setArticles] = useState<LibraryArticle[]>(() =>
    storageService.getOfflineCache(userId, 'library_articles', INITIAL_LIBRARY_ARTICLES)
  );
  const [knowledgeState, setKnowledgeState] = useState<UserKnowledgeState>({
    userId,
    readArticleIds: [],
    savedArticleIds: [],
    readWeeks: [],
    favoriteWeeks: [],
  });
  const [selectedCategory, setSelectedCategory] = useState<'all' | LibraryCategory>('all');
  const [filterTab, setFilterTab] = useState<'all' | 'saved' | 'read' | 'pending'>('all');
  const [weekFilter, setWeekFilter] = useState<'all' | 'current_week'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [readingArticle, setReadingArticle] = useState<LibraryArticle | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Create article form
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<LibraryCategory>('pregnancy');
  const [medicalSource, setMedicalSource] = useState('');
  const [weekMin, setWeekMin] = useState('1');
  const [weekMax, setWeekMax] = useState('40');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const loadLibrary = async () => {
    try {
      const res = await apiService.fetchLibrary(isStaff, user);
      setArticles(res.articles);
      setKnowledgeState(res.state);
      storageService.setOfflineCache(userId, 'library_articles', res.articles);
    } catch {}
  };

  useEffect(() => {
    loadLibrary();
  }, [userId, isStaff]);

  useEffect(() => {
    if (focusArticleId && articles.length > 0) {
      const found = articles.find((a) => a.id === focusArticleId);
      if (found) {
        handleOpenArticle(found);
      }
      onClearFocusArticle?.();
    }
  }, [focusArticleId, articles.length]);

  const handleOpenArticle = async (article: LibraryArticle) => {
    setReadingArticle(article);
    try {
      const next = await apiService.updateLibraryState(
        { type: 'mark_article_read', articleId: article.id },
        user
      );
      setKnowledgeState(next);
    } catch {}
  };

  const handleToggleSave = async (articleId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const next = await apiService.updateLibraryState(
        { type: 'toggle_article_save', articleId },
        user
      );
      setKnowledgeState(next);
      showToast(
        next.savedArticleIds.includes(articleId)
          ? 'Đã lưu bài viết vào danh sách đọc'
          : 'Đã bỏ lưu bài viết'
      );
    } catch {}
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !medicalSource.trim()) {
      showToast('Vui lòng nhập tiêu đề, nội dung và nguồn y khoa trích dẫn.');
      return;
    }
    try {
      const created = await apiService.createLibraryArticle(
        {
          title: title.trim(),
          summary: summary.trim() || content.trim().slice(0, 120),
          content: content.trim(),
          category,
          medicalSource: medicalSource.trim(),
          weekMin: Number(weekMin) || 1,
          weekMax: Number(weekMax) || 40,
          readTimeMinutes: Math.max(2, Math.ceil(content.trim().split(/\s+/).length / 180)),
        },
        user
      );
      setIsCreateOpen(false);
      setTitle('');
      setSummary('');
      setContent('');
      setMedicalSource('');
      await loadLibrary();
      showToast(
        created.status === 'approved'
          ? 'Đã xuất bản bài viết vào Thư viện!'
          : 'Đã gửi bài viết chờ kiểm duyệt y khoa.'
      );
    } catch (err: any) {
      showToast(err?.message || 'Không thể lưu bài viết.');
    }
  };

  const handleModerate = async (articleId: string, status: 'approved' | 'rejected') => {
    try {
      await apiService.moderateLibraryArticle(articleId, status, user);
      await loadLibrary();
      showToast(status === 'approved' ? 'Đã duyệt bài viết' : 'Đã từ chối bài viết');
    } catch (err: any) {
      showToast(err?.message || 'Thao tác thất bại.');
    }
  };

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const myWeek = user?.pregnancyWeek || 24;
    return articles.filter((a) => {
      if (filterTab === 'pending') {
        if (a.status !== 'pending') return false;
      } else {
        if (a.status !== 'approved') return false;
      }
      if (filterTab === 'saved' && !knowledgeState.savedArticleIds.includes(a.id)) return false;
      if (filterTab === 'read' && !knowledgeState.readArticleIds.includes(a.id)) return false;
      if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
      if (weekFilter === 'current_week') {
        const minW = a.weekMin || 1;
        const maxW = a.weekMax || 40;
        if (myWeek < minW || myWeek > maxW) return false;
      }
      if (q) {
        const hit =
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.medicalSource.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [articles, filterTab, selectedCategory, weekFilter, searchQuery, knowledgeState, user?.pregnancyWeek]);

  const relatedArticles = useMemo(() => {
    if (!readingArticle) return [];
    return articles
      .filter((a) => a.id !== readingArticle.id && a.status === 'approved' && a.category === readingArticle.category)
      .slice(0, 3);
  }, [readingArticle, articles]);

  const pendingCount = articles.filter((a) => a.status === 'pending').length;

  return (
    <div className="flex-1 flex flex-col px-4 sm:px-6 pt-3 pb-8 overflow-y-auto no-scrollbar bg-[#FAF6F0] dark:bg-[#161311] text-[#322622] dark:text-[#F4EDE6]">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#322622] dark:bg-[#F4EDE6] text-white dark:text-[#161311] px-4 py-2 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <h1 className="font-editorial text-[22px] sm:text-[24px] font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#4F6B56] dark:text-[#8DA892]" /> Thư viện Kiến thức Nova
          </h1>
          <p className="text-xs text-[#786962] dark:text-[#B5A89F] mt-0.5">
            Bài viết tổng hợp từ Bộ Y tế, WHO, ACOG & UNICEF · Dễ hiểu và kiểm duyệt nguồn
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="min-h-[42px] px-4 py-2.5 rounded-2xl bg-[#B55841] hover:bg-[#9E4A35] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{isStaff ? 'Thêm bài kiến thức' : 'Đề xuất bài viết'}</span>
        </button>
      </header>

      {/* Disclaimer */}
      <div className="mb-4 p-3.5 rounded-2xl bg-[#EBF1EC] dark:bg-[#1E2922] border border-[#C8D9CB] dark:border-[#33483A] flex items-start gap-2.5 text-[11.5px] text-[#322622] dark:text-[#DFECE2]">
        <AlertCircle className="w-4 h-4 text-[#4F6B56] dark:text-[#8DA892] shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          Tài liệu chỉ mang tính giáo dục sức khỏe tham khảo. Khi có thắc mắc lâm sàng hoặc dấu hiệu bất thường, mẹ hãy trao đổi trực tiếp với bác sĩ chuyên khoa.
        </span>
      </div>

      {/* Search & Week Filter */}
      <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#786962] dark:text-[#B5A89F] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo từ khóa, tuần thai hoặc nguồn (WHO, Bộ Y tế...)"
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841] dark:focus:border-[#D47A63]"
          />
        </div>
        <button
          type="button"
          onClick={() => setWeekFilter((f) => (f === 'all' ? 'current_week' : 'all'))}
          className={`min-h-[40px] px-3.5 py-2.5 rounded-2xl text-xs font-bold border cursor-pointer whitespace-nowrap tabular-nums ${
            weekFilter === 'current_week'
              ? 'bg-[#B55841] text-white border-[#B55841]'
              : 'bg-white dark:bg-[#1E1A17] text-[#6B5D56] dark:text-[#C5B9B0] border-[#E6DDD1] dark:border-[#362E2A]'
          }`}
        >
          Phù hợp Tuần {user?.pregnancyWeek || 24}
        </button>
      </div>

      {/* Status & Reading Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-3">
        {[
          { id: 'all', label: 'Tất cả bài viết' },
          { id: 'saved', label: `Đã lưu (${knowledgeState.savedArticleIds.length})` },
          { id: 'read', label: `Đã đọc (${knowledgeState.readArticleIds.length})` },
          ...(isStaff ? [{ id: 'pending', label: `Chờ duyệt (${pendingCount})` }] : []),
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilterTab(t.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
              filterTab === t.id
                ? 'bg-[#322622] dark:bg-[#B55841] text-white'
                : 'bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] text-[#6B5D56] dark:text-[#C5B9B0]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Category Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-4">
        {CATEGORY_LABELS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63] border border-[#EBCDC2] dark:border-[#52352D]'
                : 'bg-[#F2ECE3] dark:bg-[#231E1B] text-[#786962] dark:text-[#B5A89F]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="p-10 bg-white dark:bg-[#1E1A17] rounded-3xl border border-dashed border-[#E6DDD1] dark:border-[#362E2A] text-center text-xs text-[#786962] dark:text-[#B5A89F]">
          Không tìm thấy bài viết nào phù hợp bộ lọc hiện tại.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((article) => {
            const isSaved = knowledgeState.savedArticleIds.includes(article.id);
            const isRead = knowledgeState.readArticleIds.includes(article.id);
            return (
              <article
                key={article.id}
                onClick={() => handleOpenArticle(article)}
                className="bg-white dark:bg-[#1E1A17] rounded-3xl p-4.5 border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#B55841] dark:hover:border-[#D47A63] transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-md bg-[#EBF1EC] dark:bg-[#1E2922] text-[#4F6B56] dark:text-[#8DA892] border border-[#C8D9CB] dark:border-[#33483A] whitespace-nowrap">
                      {CATEGORY_LABELS.find((c) => c.id === article.category)?.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isRead && (
                        <span className="text-[10px] font-bold text-[#4F6B56] dark:text-[#8DA892] flex items-center gap-0.5 whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3" /> Đã đọc
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleToggleSave(article.id, e)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                          isSaved
                            ? 'bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63]'
                            : 'bg-[#F2ECE3] dark:bg-[#231E1B] text-[#786962] dark:text-[#B5A89F]'
                        }`}
                        aria-label="Lưu bài viết"
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-editorial text-[16px] font-bold leading-snug mb-1.5 text-[#322622] dark:text-[#F4EDE6]">
                    {article.title}
                  </h3>
                  <p className="text-xs text-[#6B5D56] dark:text-[#C5B9B0] line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-[#F2ECE3] dark:border-[#362E2A] space-y-2">
                  <div className="flex items-center justify-between text-[10.5px] text-[#786962] dark:text-[#B5A89F]">
                    <span className="flex items-center gap-1 text-[#4F6B56] dark:text-[#8DA892] font-semibold truncate pr-2">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      {article.medicalSource}
                    </span>
                    <span className="flex items-center gap-0.5 shrink-0 tabular-nums">
                      <Clock className="w-3 h-3" /> {article.readTimeMinutes}p
                    </span>
                  </div>

                  {isStaff && article.status === 'pending' && (
                    <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleModerate(article.id, 'approved')}
                        className="flex-1 min-h-[38px] py-1.5 rounded-xl bg-[#EBF1EC] dark:bg-[#1E2922] border border-[#C8D9CB] dark:border-[#33483A] text-[#4F6B56] dark:text-[#8DA892] text-xs font-bold cursor-pointer"
                      >
                        Duyệt bài
                      </button>
                      <button
                        onClick={() => handleModerate(article.id, 'rejected')}
                        className="flex-1 min-h-[38px] py-1.5 rounded-xl bg-[#F7EAE5] dark:bg-[#35231E] border border-[#EBCDC2] dark:border-[#52352D] text-[#A9422D] dark:text-[#D47A63] text-xs font-bold cursor-pointer"
                      >
                        Từ chối
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Article Reader Modal */}
      <AnimatePresence>
        {readingArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#161311]/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-2xl max-h-[90vh] bg-[#FAF6F0] dark:bg-[#1E1A17] text-[#322622] dark:text-[#F4EDE6] rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#E6DDD1] dark:border-[#362E2A] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E6DDD1] dark:border-[#362E2A] mb-4 shrink-0">
                <button
                  onClick={() => setReadingArticle(null)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#6B5D56] dark:text-[#C5B9B0] hover:text-[#B55841] dark:hover:text-[#D47A63] cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleSave(readingArticle.id)}
                    className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                      knowledgeState.savedArticleIds.includes(readingArticle.id)
                        ? 'bg-[#B55841] text-white'
                        : 'bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-[#6B5D56] dark:text-[#C5B9B0]'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{knowledgeState.savedArticleIds.includes(readingArticle.id) ? 'Đã lưu' : 'Lưu bài'}</span>
                  </button>
                  <button
                    onClick={() => setReadingArticle(null)}
                    className="w-9 h-9 rounded-full bg-[#F2ECE3] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-center cursor-pointer"
                    aria-label="Đóng"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#EBF1EC] dark:bg-[#1E2922] text-[#4F6B56] dark:text-[#8DA892] border border-[#C8D9CB] dark:border-[#33483A]">
                    {CATEGORY_LABELS.find((c) => c.id === readingArticle.category)?.label}
                  </span>
                  {readingArticle.status === 'approved' && (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#F6EFE2] dark:bg-[#2F281C] text-[#9E5B3B] dark:text-[#D7BA86] border border-[#E5D4B3] dark:border-[#4A3F2B] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Đã kiểm duyệt nguồn
                    </span>
                  )}
                  <span className="text-[11px] text-[#786962] dark:text-[#B5A89F] tabular-nums">
                    Cập nhật: {readingArticle.updatedDate}
                  </span>
                </div>

                <h2 className="font-editorial text-xl sm:text-2xl font-bold leading-snug">{readingArticle.title}</h2>
                <p className="text-xs font-semibold text-[#786962] dark:text-[#B5A89F]">
                  Tác giả / Cố vấn: {readingArticle.authorName} · Nguồn: {readingArticle.medicalSource}
                </p>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-sm leading-relaxed whitespace-pre-line text-[#322622] dark:text-[#F4EDE6]">
                  {readingArticle.content}
                </div>

                {relatedArticles.length > 0 && (
                  <div className="pt-3 border-t border-[#E6DDD1] dark:border-[#362E2A]">
                    <h4 className="text-xs font-bold text-[#786962] dark:text-[#B5A89F] uppercase mb-2">Bài viết liên quan</h4>
                    <div className="space-y-2">
                      {relatedArticles.map((rel) => (
                        <button
                          key={rel.id}
                          onClick={() => handleOpenArticle(rel)}
                          className="w-full p-3 rounded-2xl bg-white dark:bg-[#231E1B] hover:border-[#B55841] dark:hover:border-[#D47A63] border border-[#E6DDD1] dark:border-[#362E2A] text-left cursor-pointer"
                        >
                          <p className="text-xs font-bold text-[#322622] dark:text-[#F4EDE6]">{rel.title}</p>
                          <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] mt-0.5">{rel.medicalSource}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Article Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161311]/60 backdrop-blur-xs">
            <motion.form
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onSubmit={handleCreateArticle}
              className="w-full max-w-lg bg-[#FAF6F0] dark:bg-[#1E1A17] text-[#322622] dark:text-[#F4EDE6] rounded-3xl p-5 shadow-2xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-3 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-[#E6DDD1] dark:border-[#362E2A]">
                <h3 className="font-editorial text-[17px] font-bold">
                  {isStaff ? 'Thêm bài kiến thức y khoa' : 'Đề xuất bài kiến thức mới'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="w-9 h-9 rounded-full bg-[#F2ECE3] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-center cursor-pointer"
                  aria-label="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tiêu đề bài viết *"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs font-bold text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841]"
              />

              <div className="grid grid-cols-3 gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as LibraryCategory)}
                  className="col-span-1 px-2.5 py-2.5 rounded-xl bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841]"
                >
                  {CATEGORY_LABELS.filter((c) => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={weekMin}
                  onChange={(e) => setWeekMin(e.target.value)}
                  placeholder="Từ tuần"
                  className="px-3 py-2.5 rounded-xl bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#322622] dark:text-[#F4EDE6] tabular-nums focus:outline-none focus:border-[#B55841]"
                />
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={weekMax}
                  onChange={(e) => setWeekMax(e.target.value)}
                  placeholder="Đến tuần"
                  className="px-3 py-2.5 rounded-xl bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#322622] dark:text-[#F4EDE6] tabular-nums focus:outline-none focus:border-[#B55841]"
                />
              </div>

              <input
                type="text"
                required
                value={medicalSource}
                onChange={(e) => setMedicalSource(e.target.value)}
                placeholder="Nguồn y khoa trích dẫn (VD: Bộ Y tế VN, WHO, ACOG) *"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841]"
              />

              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Tóm tắt ngắn gọn..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841]"
              />

              <textarea
                rows={5}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nội dung chi tiết đã đối chiếu nguồn y khoa *"
                className="w-full p-3.5 rounded-xl bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841]"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs font-semibold text-[#6B5D56] dark:text-[#C5B9B0] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2.5 bg-[#B55841] hover:bg-[#9E4A35] text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                >
                  {isStaff ? 'Xuất bản ngay' : 'Gửi kiểm duyệt'}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
