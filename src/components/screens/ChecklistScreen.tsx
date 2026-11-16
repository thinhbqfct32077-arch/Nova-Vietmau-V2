import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckSquare,
  Plus,
  Trash2,
  BellPlus,
  CheckCircle2,
  Circle,
  X,
} from 'lucide-react';
import { ChecklistCategory, ChecklistItem, UserProfile } from '../../types';
import { apiService } from '../../services/apiService';
import { storageService } from '../../services/storageService';

interface ChecklistScreenProps {
  user: UserProfile;
  onBack: () => void;
}

const CATEGORY_LABELS: { id: ChecklistCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'checkup_prep', label: 'Chuẩn bị khám thai' },
  { id: 'birth_bag', label: 'Giỏ đồ đi sinh' },
  { id: 'nursery', label: 'Phòng & cũi cho bé' },
  { id: 'postpartum_care', label: 'Chăm sóc sau sinh' },
  { id: 'newborn_essentials', label: 'Đồ sơ sinh' },
  { id: 'weekly', label: 'Theo tuần thai' },
  { id: 'stage', label: 'Theo giai đoạn' },
  { id: 'custom', label: 'Tự tạo thêm' },
];

export const ChecklistScreen: React.FC<ChecklistScreenProps> = ({ user, onBack }) => {
  const [items, setItems] = useState<ChecklistItem[]>(() =>
    storageService.getOfflineCache<ChecklistItem[]>(user.id, 'checklists', [])
  );
  const [activeCategory, setActiveCategory] = useState<ChecklistCategory | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newCategory, setNewCategory] = useState<ChecklistCategory>('custom');
  const [newWeek, setNewWeek] = useState<string>('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    apiService
      .fetchChecklists(user)
      .then((list) => {
        setItems(list);
        storageService.setOfflineCache(user.id, 'checklists', list);
      })
      .catch(() => {});
  }, [user.id]);

  const showMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const totalDone = items.filter((i) => i.completed).length;
  const totalPct = items.length > 0 ? Math.round((totalDone / items.length) * 100) : 0;

  const filtered = items.filter((i) => activeCategory === 'all' || i.category === activeCategory);

  const handleToggleItem = async (item: ChecklistItem) => {
    const nextVal = !item.completed;
    setItems((prev) => prev.map((c) => (c.id === item.id ? { ...c, completed: nextVal } : c)));
    try {
      const updated = await apiService.updateChecklistItem(item.id, { completed: nextVal }, user);
      setItems((prev) => {
        const nextList = prev.map((c) => (c.id === updated.id ? updated : c));
        storageService.setOfflineCache(user.id, 'checklists', nextList);
        return nextList;
      });
    } catch {}
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const created = await apiService.createChecklistItem(
        {
          title: newTitle.trim(),
          notes: newNotes.trim() || undefined,
          category: newCategory,
          weekNumber: newWeek ? Number(newWeek) : undefined,
        },
        user
      );
      setItems((prev) => {
        const nextList = [created, ...prev];
        storageService.setOfflineCache(user.id, 'checklists', nextList);
        return nextList;
      });
      setNewTitle('');
      setNewNotes('');
      setNewWeek('');
      setShowAddModal(false);
      showMsg('Đã thêm mục chuẩn bị mới');
    } catch (err: any) {
      showMsg(err?.message || 'Không thể thêm mục chuẩn bị');
    }
  };

  const handleDeleteItem = async (id: string) => {
    setItems((prev) => prev.filter((c) => c.id !== id));
    try {
      await apiService.deleteChecklistItem(id, user);
      showMsg('Đã xóa mục khỏi sổ chuẩn bị');
    } catch {}
  };

  const handleCreateReminderFromItem = async (item: ChecklistItem) => {
    const createdRem = storageService.addHealthReminder(
      {
        title: `Sổ chuẩn bị: ${item.title}`,
        category: 'checkup',
        time: '09:00',
        frequency: 'once',
        date: new Date().toISOString().slice(0, 10),
        isEnabled: true,
        notes: item.notes,
      },
      user.id
    );
    try {
      await apiService.syncReminders(storageService.loadHealthReminders(user.id), user);
      const updated = await apiService.updateChecklistItem(
        item.id,
        { reminderId: createdRem.id },
        user
      );
      setItems((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      showMsg('Đã tạo nhắc nhở lúc 09:00 từ sổ chuẩn bị');
    } catch {
      showMsg('Đã lưu nhắc nhở trên thiết bị');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-nova-bg text-nova-text overflow-y-auto no-scrollbar select-none">
      {toast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-nova-text text-nova-bg border border-nova-border/20 text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      <header className="px-4 sm:px-5 py-3 flex items-center justify-between border-b border-nova-border sticky top-0 bg-nova-bg/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Quay lại"
            className="w-9 h-9 rounded-full bg-nova-surface border border-nova-border flex items-center justify-center text-nova-text-muted cursor-pointer hover:bg-nova-bg-subtle transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-editorial text-[18px] font-bold text-nova-text flex items-center gap-1.5 leading-tight">
              <CheckSquare className="w-4 h-4 text-nova-sage-text" /> Sổ chuẩn bị mẹ và bé
            </h1>
            <p className="text-[11px] text-nova-text-muted">
              Chuẩn bị chu toàn từ thai kỳ đến ngày đi sinh
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="min-h-[38px] px-3.5 py-2 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm mục
        </button>
      </header>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Progress Overview */}
        <div className="p-4 rounded-2xl bg-nova-surface border border-nova-border space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-nova-text">Tiến độ hoàn thành tổng thể</span>
            <span className="text-nova-sage-text tabular-nums">
              {totalDone}/{items.length} mục ({totalPct}%)
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-nova-bg-subtle overflow-hidden">
            <div
              className="h-full bg-nova-sage rounded-full transition-all"
              style={{ width: `${totalPct}%` }}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {CATEGORY_LABELS.map((cat) => {
            const count =
              cat.id === 'all' ? items.length : items.filter((i) => i.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer tabular-nums transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-nova-accent text-nova-accent-contrast'
                    : 'bg-nova-surface border border-nova-border text-nova-text-muted hover:bg-nova-bg-subtle'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Checklist Items */}
        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-nova-text-muted bg-nova-surface rounded-2xl border border-nova-border">
              <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="font-editorial text-[15px] font-semibold text-nova-text">
                Chưa có mục nào trong nhóm này
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-nova-surface border border-nova-border flex items-start gap-3"
              >
                <button
                  onClick={() => handleToggleItem(item)}
                  className="mt-0.5 shrink-0 cursor-pointer"
                  aria-label="Đánh dấu hoàn thành"
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-nova-sage-text" />
                  ) : (
                    <Circle className="w-6 h-6 text-nova-icon" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-bold leading-snug ${
                      item.completed
                        ? 'line-through text-nova-text-muted'
                        : 'text-nova-text'
                    }`}
                  >
                    {item.title}
                  </p>
                  {item.notes && (
                    <p className="text-[11px] text-nova-text-muted mt-1">{item.notes}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-[10.5px] font-medium text-nova-text-muted">
                      {CATEGORY_LABELS.find((c) => c.id === item.category)?.label || item.category}
                    </span>
                    {item.weekNumber && (
                      <>
                        <span className="text-nova-border">·</span>
                        <span className="text-[10.5px] text-nova-accent font-bold tabular-nums">
                          Tuần {item.weekNumber}
                        </span>
                      </>
                    )}
                    <span className="text-nova-border">·</span>
                    <button
                      onClick={() => handleCreateReminderFromItem(item)}
                      className="text-[10.5px] font-bold text-nova-warning flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <BellPlus className="w-3 h-3" />
                      {item.reminderId ? 'Đã gắn nhắc nhở' : 'Tạo nhắc nhở'}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1.5 text-nova-icon hover:text-nova-danger cursor-pointer shrink-0 transition-colors"
                  title="Xóa mục"
                  aria-label="Xóa mục"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1B18]/60 backdrop-blur-xs">
          <form
            onSubmit={handleAddItem}
            className="w-full max-w-sm bg-nova-surface-elevated rounded-3xl p-5 border border-nova-border space-y-3 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-nova-border">
              <h3 className="font-editorial text-[18px] font-bold text-nova-text">
                Thêm mục chuẩn bị mới
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Đóng"
                className="w-8 h-8 rounded-full bg-nova-bg-subtle text-nova-text-muted flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-nova-text-muted mb-1">
                Nội dung cần chuẩn bị *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ví dụ: Mua máy hút sữa và túi trữ sữa"
                className="w-full px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text focus:outline-none focus:border-nova-accent"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-nova-text-muted mb-1">
                  Nhóm chuẩn bị
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ChecklistCategory)}
                  className="w-full px-2.5 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text focus:outline-none focus:border-nova-accent"
                >
                  {CATEGORY_LABELS.filter((c) => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-nova-text-muted mb-1">
                  Tuần gợi ý
                </label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={newWeek}
                  onChange={(e) => setNewWeek(e.target.value)}
                  placeholder="Tuần (tùy chọn)"
                  className="w-full px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text tabular-nums focus:outline-none focus:border-nova-accent"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-nova-text-muted mb-1">
                Ghi chú thêm
              </label>
              <textarea
                rows={2}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Chi tiết thương hiệu, kích cỡ hoặc lưu ý..."
                className="w-full px-3 py-2 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text focus:outline-none focus:border-nova-accent"
              />
            </div>
            <button
              type="submit"
              className="w-full min-h-[44px] py-2.5 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-xs font-bold cursor-pointer transition-colors"
            >
              Lưu vào sổ chuẩn bị
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
