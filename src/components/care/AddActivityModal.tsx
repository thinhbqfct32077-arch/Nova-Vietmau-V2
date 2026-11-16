import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Plus,
  Edit3,
  Clock,
  Sparkles,
  Droplet,
  Activity,
  Music,
  Stethoscope,
  Heart,
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
  const [colorTheme, setColorTheme] = useState('terracotta');
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
    terracotta: { bg: 'bg-[#F7EAE5] dark:bg-[#35231E]', color: 'text-[#B55841] dark:text-[#D47A63]', label: 'Hồng đất ấm' },
    sage: { bg: 'bg-[#EBF1EC] dark:bg-[#1E2922]', color: 'text-[#4F6B56] dark:text-[#8DA892]', label: 'Xanh sage' },
    champagne: { bg: 'bg-[#F6EFE2] dark:bg-[#2F281C]', color: 'text-[#9E5B3B] dark:text-[#D7BA86]', label: 'Vàng champagne' },
    forest: { bg: 'bg-[#E6ECE9] dark:bg-[#1B2A24]', color: 'text-[#263E35] dark:text-[#A7C2AC]', label: 'Xanh rừng sâu' },
    linen: { bg: 'bg-[#F2ECE3] dark:bg-[#2A2320]', color: 'text-[#786962] dark:text-[#C5B9B0]', label: 'Vải lanh dịu' },
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

    const theme = colorThemes[colorTheme] || colorThemes.terracotta;

    if (editingActivity && onUpdate) {
      onUpdate(editingActivity.id, {
        title: title.trim(),
        subtitle: subtitle.trim() || 'Hoạt động chăm sóc mẹ & bé',
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
        subtitle: subtitle.trim() || 'Hoạt động chăm sóc mẹ & bé',
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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#161311]/55 backdrop-blur-xs p-0 md:p-4">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="w-full max-w-[430px] max-h-[92vh] bg-[#FAF6F0] dark:bg-[#161311] rounded-t-[32px] md:rounded-[32px] border border-[#E6DDD1] dark:border-[#362E2A] shadow-2xl flex flex-col overflow-hidden text-[#322622] dark:text-[#F4EDE6]"
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3.5 border-b border-[#E6DDD1] dark:border-[#362E2A] bg-white dark:bg-[#1E1A17] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63] flex items-center justify-center">
              {editingActivity ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5 stroke-[2.2]" />}
            </div>
            <div>
              <h2 className="font-editorial text-[18px] font-semibold text-[#322622] dark:text-[#F4EDE6] leading-tight">
                {editingActivity ? 'Chỉnh sửa hoạt động' : 'Thêm hoạt động mới'}
              </h2>
              <p className="text-[11px] font-medium text-[#786962] dark:text-[#B5A89F] mt-0.5">
                Cá nhân hóa nhịp chăm sóc thai kỳ của mẹ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F2ECE3] dark:bg-[#2A2320] hover:bg-[#E6DDD1] dark:hover:bg-[#362E2A] text-[#786962] dark:text-[#B5A89F] flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Đóng"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] block mb-1.5">
              Tên hoạt động
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Uống viên Sắt & Canxi, Đi bộ 20 phút..."
              className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:ring-2 focus:ring-[#B55841]/30"
            />
          </div>

          {/* Subtitle / Note */}
          <div>
            <label className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] block mb-1.5">
              Mô tả ngắn / Lời dặn
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="VD: Uống sau ăn sáng 1 tiếng với nước ấm"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:ring-2 focus:ring-[#B55841]/30"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] block mb-1.5">
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
                        ? 'bg-[#B55841] text-white border-[#B55841]'
                        : 'bg-white dark:bg-[#1E1A17] text-[#6B5D56] dark:text-[#C5B9B0] border-[#E6DDD1] dark:border-[#362E2A] hover:bg-[#F2ECE3] dark:hover:bg-[#231E1B]'
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

          {/* Time Target */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] block mb-1.5">
                Thời gian mục tiêu
              </label>
              <input
                type="text"
                value={timeTarget}
                onChange={(e) => setTimeTarget(e.target.value)}
                placeholder="VD: Sáng 08:00"
                className="w-full px-3 py-2.5 bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:ring-2 focus:ring-[#B55841]/30"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] block mb-1.5">
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
                        colorTheme === key ? 'border-[#322622] dark:border-[#F4EDE6] scale-110' : 'border-transparent'
                      }`}
                      title={theme.label}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Auto Reminder Toggle */}
          <div className="p-3.5 bg-white dark:bg-[#1E1A17] rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#B55841] dark:text-[#D47A63]" />
                <span className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6]">
                  Bật nhắc nhở hẹn giờ
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                  reminderEnabled ? 'bg-[#6D8572]' : 'bg-[#D6CDC2] dark:bg-[#3A322D]'
                }`}
                aria-label="Bật tắt nhắc nhở"
              >
                <motion.div
                  animate={{ x: reminderEnabled ? 20 : 0 }}
                  className="w-5 h-5 rounded-full bg-white shadow-xs"
                />
              </button>
            </div>

            {reminderEnabled && (
              <div className="flex items-center gap-2 pt-2 border-t border-[#E6DDD1] dark:border-[#362E2A]">
                <span className="text-[11px] text-[#786962] dark:text-[#B5A89F]">Giờ nhắc hằng ngày:</span>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="px-2.5 py-1 bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-lg text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] tabular-nums"
                />
              </div>
            )}
          </div>

          {/* Delete Option if editing */}
          {editingActivity && onDelete && (
            <div className="pt-1">
              {!confirmingDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="w-full py-2.5 rounded-xl border border-[#EBCDC2] dark:border-[#4D342D] text-[#B55841] dark:text-[#D47A63] bg-[#F7EAE5]/60 dark:bg-[#35231E]/60 hover:bg-[#F7EAE5] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors min-h-[44px]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa hoạt động này</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-[#F7EAE5] dark:bg-[#35231E] border border-[#EBCDC2] dark:border-[#4D342D] space-y-2">
                  <p className="text-xs font-medium text-[#322622] dark:text-[#F4EDE6]">
                    Xác nhận xóa "{editingActivity.title}"?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(false)}
                      className="flex-1 py-2 rounded-lg bg-white dark:bg-[#1E1A17] text-xs font-semibold text-[#786962] cursor-pointer"
                    >
                      Giữ lại
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(editingActivity.id);
                        onClose();
                      }}
                      className="flex-1 py-2 rounded-lg bg-[#B55841] text-white text-xs font-semibold cursor-pointer"
                    >
                      Xóa ngay
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Submit Button */}
          <div className="pt-2 pb-2">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3 bg-[#B55841] hover:bg-[#9E4A35] text-white font-semibold rounded-2xl text-xs cursor-pointer transition-colors min-h-[46px]"
            >
              {editingActivity ? 'Lưu thay đổi' : 'Thêm vào kế hoạch'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
