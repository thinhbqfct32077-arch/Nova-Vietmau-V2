import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Camera,
  Plus,
  Edit3,
  Trash2,
  BookOpen,
  Printer,
  Lock,
  Users,
  Globe,
  X,
  Upload,
  Heart,
} from 'lucide-react';
import { MemoryEntry, MemoryPrivacy, MemoryType, UserProfile } from '../../types';
import { apiService } from '../../services/apiService';
import { storageService } from '../../services/storageService';
import { ECOSYSTEM_BANNERS } from '../../data/ecosystemData';
import { NovaImage } from '../NovaBrandMark';

interface MemoriesScreenProps {
  user: UserProfile;
  onBack: () => void;
}

const MEMORY_TYPE_META: Record<MemoryType, { label: string; color: string }> = {
  ultrasound: {
    label: 'Ảnh siêu âm',
    color: 'bg-nova-sage-soft text-nova-sage-text border border-nova-border',
  },
  bump_photo: {
    label: 'Ảnh bụng bầu',
    color: 'bg-nova-accent-soft text-nova-accent border border-nova-border',
  },
  moment: {
    label: 'Khoảnh khắc nhật ký',
    color: 'bg-nova-warning-soft text-nova-warning border border-nova-warning-border',
  },
  letter: {
    label: 'Thư gửi em bé',
    color: 'bg-nova-bg-subtle text-nova-text-muted border border-nova-border',
  },
};

const PRIVACY_META: Record<MemoryPrivacy, { label: string; icon: any }> = {
  private: { label: 'Riêng tư', icon: Lock },
  family: { label: 'Gia đình', icon: Users },
  public: { label: 'Công khai', icon: Globe },
};

export const MemoriesScreen: React.FC<MemoriesScreenProps> = ({ user, onBack }) => {
  const [memories, setMemories] = useState<MemoryEntry[]>(() =>
    storageService.getOfflineCache<MemoryEntry[]>(user.id, 'memories', [])
  );
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<MemoryType | 'all'>('all');
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [showScrapbook, setShowScrapbook] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<MemoryType>('ultrasound');
  const [monthNumber, setMonthNumber] = useState<number>(Math.max(1, Math.min(9, Math.ceil((user.pregnancyWeek || 24) / 4.4))));
  const [privacy, setPrivacy] = useState<MemoryPrivacy>('private');
  const [memoryDate, setMemoryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    apiService
      .fetchMemories(user)
      .then((list) => {
        setMemories(list);
        storageService.setOfflineCache(user.id, 'memories', list);
      })
      .catch(() => {});
  }, [user.id]);

  const showMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setType('ultrasound');
    setMonthNumber(Math.max(1, Math.min(9, Math.ceil((user.pregnancyWeek || 24) / 4.4))));
    setPrivacy('private');
    setMemoryDate(new Date().toISOString().slice(0, 10));
    setImageUrl('');
    setShowEditorModal(true);
  };

  const openEditModal = (m: MemoryEntry) => {
    setEditingId(m.id);
    setTitle(m.title);
    setContent(m.content);
    setType(m.type);
    setMonthNumber(m.monthNumber);
    setPrivacy(m.privacy);
    setMemoryDate(m.memoryDate);
    setImageUrl(m.imageUrl || '');
    setShowEditorModal(true);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await apiService.uploadImageFile(file, user);
      setImageUrl(res.url);
      showMsg('Đã tải ảnh lên thành công');
    } catch (err: any) {
      showMsg(err?.message || 'Tải ảnh thất bại');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      if (editingId) {
        const updated = await apiService.updateMemory(
          editingId,
          { title, content, type, monthNumber, privacy, memoryDate, imageUrl: imageUrl || undefined },
          user
        );
        setMemories((prev) => {
          const next = prev.map((m) => (m.id === updated.id ? updated : m));
          storageService.setOfflineCache(user.id, 'memories', next);
          return next;
        });
        showMsg('Đã cập nhật kỷ niệm');
      } else {
        const created = await apiService.createMemory(
          {
            type,
            title: title.trim(),
            content: content.trim(),
            monthNumber,
            pregnancyWeek: user.pregnancyWeek,
            memoryDate,
            privacy,
            imageUrl: imageUrl || undefined,
          },
          user
        );
        setMemories((prev) => {
          const next = [created, ...prev];
          storageService.setOfflineCache(user.id, 'memories', next);
          return next;
        });
        showMsg('Đã lưu kỷ niệm mới vào album!');
      }
      setShowEditorModal(false);
    } catch (err: any) {
      showMsg(err?.message || 'Không thể lưu kỷ niệm');
    }
  };

  const handleDeleteMemory = async (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    try {
      await apiService.deleteMemory(id, user);
      showMsg('Đã xóa kỷ niệm');
    } catch {}
  };

  const filtered = memories.filter(
    (m) =>
      (selectedMonth === 'all' || m.monthNumber === selectedMonth) &&
      (selectedType === 'all' || m.type === selectedType)
  );

  return (
    <div className="flex-1 flex flex-col bg-nova-bg text-nova-text overflow-y-auto no-scrollbar select-none print:bg-white print:text-black">
      {toast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-nova-text text-nova-bg text-xs font-semibold px-4 py-2 rounded-full shadow-lg print:hidden">
          {toast}
        </div>
      )}

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
              <Camera className="w-4 h-4 text-nova-accent shrink-0" /> Kỷ niệm thai kỳ
            </h1>
            <p className="text-[11px] text-nova-text-muted truncate">
              Album siêu âm, bụng bầu và thư gửi {user.babyNickname || 'Bé yêu'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowScrapbook(true)}
            className="min-h-[40px] px-3 py-2 rounded-xl bg-nova-surface border border-nova-border text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap hover:bg-nova-bg-subtle text-nova-text"
          >
            <BookOpen className="w-3.5 h-3.5 text-nova-accent" /> Tập san kỷ niệm
          </button>
          <button
            onClick={openCreateModal}
            className="min-h-[40px] px-3 py-2 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Plus className="w-4 h-4" /> Lưu kỷ niệm
          </button>
        </div>
      </header>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Editorial Banner */}
        <div className="relative h-36 sm:h-44 rounded-3xl overflow-hidden border border-nova-border print:hidden">
          <NovaImage
            src={ECOSYSTEM_BANNERS.memoriesBanner}
            alt="Album kỷ niệm thai kỳ Nova"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1B18]/75 via-[#1C1B18]/30 to-transparent flex flex-col justify-end p-4 text-[#FAF9F6]">
            <h2 className="font-editorial text-lg font-bold">Lưu giữ từng khoảnh khắc chờ con chào đời</h2>
            <p className="text-xs text-[#FAF9F6]/85 mt-0.5">
              Ảnh siêu âm, nhật ký 9 tháng và những lá thư yêu thương bảo mật riêng tư
            </p>
          </div>
        </div>

        {/* Month 1-9 Album Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar print:hidden">
          <button
            onClick={() => setSelectedMonth('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 whitespace-nowrap cursor-pointer tabular-nums transition-colors ${
              selectedMonth === 'all'
                ? 'bg-nova-accent text-nova-accent-contrast'
                : 'bg-nova-surface border border-nova-border text-nova-text-muted hover:bg-nova-bg-subtle'
            }`}
          >
            Tất cả tháng ({memories.length})
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap cursor-pointer tabular-nums transition-colors ${
                selectedMonth === m
                  ? 'bg-nova-accent text-nova-accent-contrast'
                  : 'bg-nova-surface border border-nova-border text-nova-text-muted hover:bg-nova-bg-subtle'
              }`}
            >
              Tháng {m}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar print:hidden">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold shrink-0 whitespace-nowrap cursor-pointer transition-colors ${
              selectedType === 'all'
                ? 'bg-nova-text text-nova-bg'
                : 'bg-nova-bg-subtle text-nova-text-muted'
            }`}
          >
            Mọi loại
          </button>
          {(Object.keys(MEMORY_TYPE_META) as MemoryType[]).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold shrink-0 whitespace-nowrap cursor-pointer transition-colors ${
                selectedType === t
                  ? 'bg-nova-text text-nova-bg'
                  : 'bg-nova-bg-subtle text-nova-text-muted'
              }`}
            >
              {MEMORY_TYPE_META[t].label}
            </button>
          ))}
        </div>

        {/* Memories Grid */}
        {filtered.length === 0 ? (
          <div className="py-12 px-4 text-center bg-nova-surface rounded-3xl border border-nova-border text-nova-text-muted">
            <Heart className="w-9 h-9 mx-auto mb-2 text-nova-accent" />
            <p className="font-editorial text-base font-bold text-nova-text">Chưa có kỷ niệm nào ở mục này</p>
            <p className="text-xs mt-1 mb-4">Hãy tải lên tấm ảnh siêu âm đầu tiên hoặc viết thư gửi bé nhé!</p>
            <button
              onClick={openCreateModal}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-xs font-bold cursor-pointer"
            >
              + Thêm kỷ niệm đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filtered.map((m) => {
              const PIcon = PRIVACY_META[m.privacy].icon;
              return (
                <article
                  key={m.id}
                  className="bg-nova-surface rounded-3xl border border-nova-border overflow-hidden shadow-xs flex flex-col"
                >
                  {m.imageUrl && (
                    <NovaImage
                      src={m.imageUrl}
                      alt={m.title}
                      className="w-full h-48 object-cover bg-nova-bg-subtle"
                    />
                  )}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full tabular-nums ${MEMORY_TYPE_META[m.type].color}`}>
                          {MEMORY_TYPE_META[m.type].label} · Tháng {m.monthNumber}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-nova-text-muted">
                          <PIcon className="w-3 h-3" /> {PRIVACY_META[m.privacy].label}
                        </span>
                      </div>
                      <h3 className="font-editorial text-[15px] font-bold text-nova-text">{m.title}</h3>
                      {m.content && (
                        <p className="text-xs text-nova-text-muted mt-1 leading-relaxed whitespace-pre-line">
                          {m.content}
                        </p>
                      )}
                    </div>
                    <div className="pt-2 border-t border-nova-border flex items-center justify-between text-[11px] text-nova-text-muted">
                      <span className="tabular-nums">{m.memoryDate} {m.pregnancyWeek ? `· Tuần ${m.pregnancyWeek}` : ''}</span>
                      <div className="flex items-center gap-2 print:hidden">
                        <button
                          onClick={() => openEditModal(m)}
                          className="p-1.5 hover:text-nova-accent cursor-pointer"
                          title="Chỉnh sửa"
                          aria-label="Chỉnh sửa kỷ niệm"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMemory(m.id)}
                          className="p-1.5 hover:text-nova-danger cursor-pointer"
                          title="Xóa"
                          aria-label="Xóa kỷ niệm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Memory Editor Modal */}
      {showEditorModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#1C1B18]/60 backdrop-blur-xs">
          <form
            onSubmit={handleSaveMemory}
            className="w-full max-w-md bg-nova-surface-elevated rounded-t-3xl sm:rounded-3xl p-5 border border-nova-border max-h-[90vh] overflow-y-auto space-y-3 text-nova-text shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-nova-border">
              <h3 className="font-editorial text-[17px] font-bold">{editingId ? 'Chỉnh sửa kỷ niệm' : 'Lưu kỷ niệm thai kỳ'}</h3>
              <button
                type="button"
                onClick={() => setShowEditorModal(false)}
                className="w-9 h-9 rounded-full bg-nova-bg-subtle border border-nova-border flex items-center justify-center cursor-pointer text-nova-text-muted"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-nova-text-muted mb-1">Loại kỷ niệm</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as MemoryType)}
                  className="w-full px-2.5 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text focus:outline-none focus:border-nova-accent"
                >
                  {(Object.keys(MEMORY_TYPE_META) as MemoryType[]).map((k) => (
                    <option key={k} value={k}>
                      {MEMORY_TYPE_META[k].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-nova-text-muted mb-1">Quyền riêng tư</label>
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value as MemoryPrivacy)}
                  className="w-full px-2.5 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text focus:outline-none focus:border-nova-accent"
                >
                  <option value="private">Riêng tư (chỉ mẹ)</option>
                  <option value="family">Chia sẻ với Gia đình Nova</option>
                  <option value="public">Công khai</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-nova-text-muted mb-1">Album tháng (1–9)</label>
                <select
                  value={monthNumber}
                  onChange={(e) => setMonthNumber(Number(e.target.value))}
                  className="w-full px-2.5 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text focus:outline-none focus:border-nova-accent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((m) => (
                    <option key={m} value={m}>
                      Tháng thứ {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-nova-text-muted mb-1">Ngày kỷ niệm</label>
                <input
                  type="date"
                  value={memoryDate}
                  onChange={(e) => setMemoryDate(e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text tabular-nums focus:outline-none focus:border-nova-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-nova-text-muted mb-1">Tiêu đề kỷ niệm *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Lần đầu nghe tim thai 162 nhịp/phút"
                className="w-full px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text focus:outline-none focus:border-nova-accent"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-nova-text-muted mb-1">Tải ảnh siêu âm / ảnh bụng bầu</label>
              <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-nova-border bg-nova-bg cursor-pointer text-xs font-semibold text-nova-accent hover:border-nova-accent">
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Đang tải ảnh...' : imageUrl ? 'Đổi ảnh khác' : 'Chọn ảnh JPG, PNG hoặc WebP (tối đa 5MB)'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} />
              </label>
              {imageUrl && (
                <NovaImage src={imageUrl} alt="Xem trước ảnh kỷ niệm" className="mt-2 w-full h-36 object-cover rounded-xl border border-nova-border" />
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-nova-text-muted mb-1">Nội dung / Lá thư gửi bé</label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ghi lại cảm xúc của ba mẹ trong ngày đặc biệt này..."
                className="w-full px-3 py-2 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text focus:outline-none focus:border-nova-accent"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full min-h-[44px] py-3 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-xs font-bold cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {editingId ? 'Lưu chỉnh sửa' : 'Lưu vào Album kỷ niệm'}
            </button>
          </form>
        </div>
      )}

      {/* Scrapbook Print Preview Modal */}
      {showScrapbook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-[#1C1B18]/65 backdrop-blur-xs print:static print:bg-white print:p-0">
          <div className="w-full max-w-3xl max-h-[90vh] bg-nova-surface-elevated text-nova-text rounded-3xl p-6 overflow-y-auto shadow-2xl border border-nova-border print:max-h-none print:shadow-none print:border-0 print:bg-white print:text-black">
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-nova-border mb-5 print:hidden">
              <h3 className="font-editorial text-[17px] font-bold">Tập san hành trình chờ {user.babyNickname || 'Bé Bơ'}</h3>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => window.print()}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Printer className="w-4 h-4" /> In / Lưu PDF
                </button>
                <button
                  onClick={() => setShowScrapbook(false)}
                  className="w-9 h-9 rounded-full bg-nova-bg-subtle border border-nova-border text-nova-text flex items-center justify-center cursor-pointer"
                  aria-label="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-xs uppercase font-bold tracking-widest text-nova-accent">Tập san kỷ niệm thai kỳ Nova</p>
              <h2 className="font-editorial text-2xl font-bold mt-1">Ký ức thai kỳ của Mẹ {user.name}</h2>
              <p className="text-xs text-nova-text-muted mt-1 tabular-nums">Ngày dự sinh: {user.dueDate} · {memories.length} kỷ niệm</p>
            </div>

            <div className="space-y-6">
              {memories.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl border border-nova-border bg-nova-surface break-inside-avoid print:bg-white print:border-[#D9D5CE]">
                  <div className="flex justify-between items-center text-xs text-nova-text-muted mb-2">
                    <span className="font-bold text-nova-accent tabular-nums">Tháng {m.monthNumber} · {MEMORY_TYPE_META[m.type].label}</span>
                    <span className="tabular-nums">{m.memoryDate}</span>
                  </div>
                  <h4 className="font-editorial text-base font-bold text-nova-text print:text-[#1C1B18] mb-2">{m.title}</h4>
                  {m.imageUrl && (
                    <NovaImage src={m.imageUrl} alt={m.title} className="w-full max-h-72 object-cover rounded-xl mb-3" />
                  )}
                  <p className="text-xs text-nova-text-muted print:text-[#4F4B45] leading-relaxed whitespace-pre-line">{m.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
