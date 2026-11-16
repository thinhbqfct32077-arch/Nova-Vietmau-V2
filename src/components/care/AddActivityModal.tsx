import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Plus,
  Edit3,
  Sparkles,
  Droplet,
  Activity,
  Music,
  Stethoscope,
  Pill,
  Footprints,
  Bell,
  Trash2,
} from 'lucide-react';
import { ActivityItem, ActivityCategory } from '../../types';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Omit<ActivityItem, 'id'>) => void;
  onUpdate?: (id: string, partial: Partial<ActivityItem>) => void;
  onDelete?: (id: string) => void;
  editingActivity?: ActivityItem | null;
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  editingActivity,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('yoga');
  const [timeTarget, setTimeTarget] = useState('Sáng 08:00');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [colorTheme, setColorTheme] = useState('sand');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    setConfirmingDelete(false);
    if (editingActivity) {
      setTitle(editingActivity.title);
      setSubtitle(editingActivity.subtitle);
      setCategory(editingActivity.category);
      setTimeTarget(editingActivity.timeTarget);
      setReminderEnabled(Boolean(editingActivity.reminderEnabled));
      setReminderTime(editingActivity.reminderTime || '08:00');
    } else {
      setTitle('');
      setSubtitle('');
      setCategory('yoga');
      setTimeTarget('Sáng 08:00');
      setReminderEnabled(true);
      setReminderTime('08:00');
    }
  }, [editingActivity, isOpen]);

  if (!isOpen) return null;

  const colorThemes: Record<string, { bg: string; color: string; label: string }> = {
    sand: { bg: 'bg-nova-accent-soft', color: 'text-nova-accent', label: 'Cát ấm dịu' },
    sage: { bg: 'bg-nova-sage-soft', color: 'text-nova-sage-text', label: 'Xanh sage' },
    oat: { bg: 'bg-nova-bg-subtle', color: 'text-nova-text', label: 'Yến mạch nhẹ' },
    amber: { bg: 'bg-nova-warning-soft', color: 'text-nova-warning', label: 'Nắng nhạt' },
    rose: { bg: 'bg-nova-danger-soft', color: 'text-nova-danger', label: 'Hồng đất trầm' },
  };

  const categories: { id: ActivityCategory; label: string; icon: any }[] = [
    { id: 'water', label: 'Uống nước', icon: Droplet },
    { id: 'yoga', label: 'Yoga / Giãn cơ', icon: Activity },
    { id: 'music', label: 'Nghe nhạc', icon: Music },
    { id: 'checkup', label: 'Khám thai', icon: Stethoscope },
    { id: 'walk', label: 'Đi bộ', icon: Footprints },
    { id: 'pill', label: 'Vi chất / Thuốc', icon: Pill },
    { id: 'custom', label: 'Khác', icon: Sparkles },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const theme = colorThemes[colorTheme] || colorThemes.sand;

    if (editingActivity && onUpdate) {
      onUpdate(editingActivity.id, {
        title: title.trim(),
        subtitle: subtitle.trim() || 'Hoạt động chăm sóc mẹ và bé',
        category,
        timeTarget,
        iconBg: theme.bg,
        iconColor: theme.color,
        reminderEnabled,
        reminderTime: reminderEnabled ? reminderTime : undefined,
      });
    } else {
      onSave({
        title: title.trim(),
        subtitle: subtitle.trim() || 'Hoạt động chăm sóc mẹ và bé',
        category,
        completed: false,
        timeTarget,
        iconBg: theme.bg,
        iconColor: theme.color,
        reminderEnabled,
        reminderTime: reminderEnabled ? reminderTime : undefined,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#1C1B18]/60 backdrop-blur-xs p-0 md:p-4">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="w-full max-w-[430px] max-h-[92vh] bg-nova-bg rounded-t-[32px] md:rounded-[32px] border border-nova-border shadow-2xl flex flex-col overflow-hidden text-nova-text"
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3.5 border-b border-nova-border bg-nova-surface flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-nova-accent-soft text-nova-accent flex items-center justify-center">
              {editingActivity ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5 stroke-[2.2]" />}
            </div>
            <div>
              <h2 className="font-editorial text-[18px] font-semibold text-nova-text leading-tight">
                {editingActivity ? 'Chỉnh sửa hoạt động' : 'Thêm hoạt động mới'}
              </h2>
              <p className="text-[11px] font-medium text-nova-text-muted mt-0.5">
                Cá nhân hóa nhịp chăm sóc thai kỳ của mẹ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-nova-bg-subtle hover:bg-nova-accent-soft text-nova-icon flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Đóng"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
          <div>
            <label className="text-xs font-semibold text-nova-text block mb-1.5">
              Tên hoạt động
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Uống viên sắt & canxi, đi bộ 20 phút..."
              className="w-full px-3.5 py-2.5 bg-nova-surface border border-nova-border rounded-xl text-xs text-nova-text focus:outline-none focus:border-nova-accent"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-nova-text block mb-1.5">
              Mô tả ngắn / Lời dặn
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ví dụ: Uống sau ăn sáng 1 tiếng với nước ấm"
              className="w-full px-3.5 py-2.5 bg-nova-surface border border-nova-border rounded-xl text-xs text-nova-text focus:outline-none focus:border-nova-accent"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-nova-text block mb-1.5">
              Phân loại hoạt động
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all min-h-[44px] ${
                      isSelected
                        ? 'bg-nova-accent text-nova-accent-contrast border-nova-accent'
                        : 'bg-nova-surface text-nova-text-muted border-nova-border hover:bg-nova-bg-subtle'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-[11px] font-semibold truncate">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-nova-text block mb-1.5">
                Thời gian mục tiêu
              </label>
              <input
                type="text"
                value={timeTarget}
                onChange={(e) => setTimeTarget(e.target.value)}
                placeholder="Ví dụ: Sáng 08:00"
                className="w-full px-3 py-2.5 bg-nova-surface border border-nova-border rounded-xl text-xs text-nova-text focus:outline-none focus:border-nova-accent"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-nova-text block mb-1.5">
                Sắc thái thẻ
              </label>
              <div className="flex gap-1.5 pt-1">
                {Object.keys(colorThemes).map((key) => {
                  const theme = colorThemes[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setColorTheme(key)}
                      className={`w-7 h-7 rounded-full ${theme.bg} border-2 transition-transform cursor-pointer flex items-center justify-center ${
                        colorTheme === key ? 'border-nova-accent scale-110' : 'border-nova-border'
                      }`}
                      title={theme.label}
                      aria-label={theme.label}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-nova-surface rounded-2xl border border-nova-border space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-nova-accent" />
                <span className="text-xs font-semibold text-nova-text">
                  Bật nhắc nhở hẹn giờ
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                  reminderEnabled ? 'bg-nova-sage' : 'bg-nova-border'
                }`}
                aria-label="Bật tắt nhắc nhở"
              >
                <motion.div
                  animate={{ x: reminderEnabled ? 20 : 0 }}
                  className="w-5 h-5 rounded-full bg-nova-surface shadow-xs"
                />
              </button>
            </div>

            {reminderEnabled && (
              <div className="flex items-center gap-2 pt-2 border-t border-nova-border">
                <span className="text-[11px] text-nova-text-muted">Giờ nhắc hằng ngày:</span>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="px-2.5 py-1 bg-nova-bg-subtle border border-nova-border rounded-lg text-xs font-semibold text-nova-text tabular-nums"
                />
              </div>
            )}
          </div>

          {editingActivity && onDelete && (
            <div className="pt-1">
              {!confirmingDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="w-full py-2.5 rounded-xl border border-nova-danger-border text-nova-danger bg-nova-danger-soft hover:opacity-90 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-opacity min-h-[44px]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa hoạt động này</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-nova-danger-soft border border-nova-danger-border space-y-2">
                  <p className="text-xs font-medium text-nova-text">
                    Xác nhận xóa "{editingActivity.title}"?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(false)}
                      className="flex-1 py-2 rounded-lg bg-nova-surface text-xs font-semibold text-nova-text-muted cursor-pointer"
                    >
                      Giữ lại
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(editingActivity.id);
                        onClose();
                      }}
                      className="flex-1 py-2 rounded-lg bg-nova-danger text-[#FAF9F6] text-xs font-semibold cursor-pointer"
                    >
                      Xóa ngay
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 pb-2">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3 bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast font-semibold rounded-2xl text-xs cursor-pointer transition-colors min-h-[46px]"
            >
              {editingActivity ? 'Lưu thay đổi' : 'Thêm vào kế hoạch'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
