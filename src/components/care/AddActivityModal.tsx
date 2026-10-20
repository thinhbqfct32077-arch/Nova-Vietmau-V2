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
  const [colorTheme, setColorTheme] = useState('coral');

  useEffect(() => {
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
    coral: { bg: 'bg-[#FCEEEB]', color: 'text-[#C84B4B]', label: 'Hồng san hô' },
    blue: { bg: 'bg-[#EBF5FB]', color: 'text-[#2980B9]', label: 'Xanh êm dịu' },
    amber: { bg: 'bg-[#FEF5E7]', color: 'text-[#D35400]', label: 'Cam ấm áp' },
    purple: { bg: 'bg-[#F4ECF7]', color: 'text-[#8E44AD]', label: 'Tím mộng mơ' },
    green: { bg: 'bg-[#EAFAF1]', color: 'text-[#27AE60]', label: 'Xanh lá tươi' },
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

    const theme = colorThemes[colorTheme] || colorThemes.coral;

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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-xs p-0 md:p-4">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="w-full max-w-[430px] max-h-[92vh] bg-[#FFFBF7] rounded-t-[32px] md:rounded-[32px] border border-[#EDE7E2] shadow-2xl flex flex-col overflow-hidden text-[#3A2E2B]"
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-[#F0ECE9] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FCEEEB] text-[#C84B4B] flex items-center justify-center shadow-xs">
              {editingActivity ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5 stroke-[2.5]" />}
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#3A2E2B] leading-tight">
                {editingActivity ? 'Chỉnh sửa hoạt động' : 'Thêm hoạt động mới'}
              </h2>
              <p className="text-[11px] font-medium text-[#8C7B75] mt-0.5">
                Cá nhân hóa kế hoạch chăm sóc thai kỳ của mẹ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F4] hover:bg-[#F2ECE7] text-[#8C7B75] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-[#3A2E2B] block mb-1">
              Tên hoạt động:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Uống viên Sắt & Canxi, Đi bộ 20 phút..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD8] rounded-xl text-xs text-[#3A2E2B] focus:outline-none focus:ring-2 focus:ring-[#C84B4B]/30"
            />
          </div>

          {/* Subtitle / Note */}
          <div>
            <label className="text-xs font-bold text-[#3A2E2B] block mb-1">
              Mô tả ngắn / Lời dặn:
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="VD: Uống sau ăn sáng 1 tiếng với nước ấm"
              className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD8] rounded-xl text-xs text-[#3A2E2B] focus:outline-none focus:ring-2 focus:ring-[#C84B4B]/30"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-bold text-[#3A2E2B] block mb-1.5">
              Phân loại hoạt động:
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
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#C84B4B] text-white border-[#C84B4B] shadow-xs'
                        : 'bg-white text-[#6E5D57] border-[#E8DFD8] hover:bg-[#FAF7F4]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-[11px] font-bold truncate">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Target */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-bold text-[#3A2E2B] block mb-1">
                Thời gian mục tiêu:
              </label>
              <input
                type="text"
                value={timeTarget}
                onChange={(e) => setTimeTarget(e.target.value)}
                placeholder="VD: Sáng 08:00"
                className="w-full px-3 py-2 bg-white border border-[#E8DFD8] rounded-xl text-xs text-[#3A2E2B] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#3A2E2B] block mb-1">
                Màu sắc thẻ:
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
                        colorTheme === key ? 'border-[#3A2E2B] scale-110' : 'border-transparent'
                      }`}
                      title={theme.label}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Auto Reminder Toggle */}
          <div className="p-3.5 bg-white rounded-2xl border border-[#EDE7E2] shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#C84B4B]" />
                <span className="text-xs font-bold text-[#3A2E2B]">
                  Bật nhắc nhở hẹn giờ
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                  reminderEnabled ? 'bg-[#2ECC71]' : 'bg-[#D5D8DC]'
                }`}
              >
                <motion.div
                  animate={{ x: reminderEnabled ? 18 : 0 }}
                  className="w-4.5 h-4.5 rounded-full bg-white shadow-xs"
                />
              </button>
            </div>

            {reminderEnabled && (
              <div className="flex items-center gap-2 pt-1 border-t border-[#F0ECE9]">
                <span className="text-[11px] text-[#8C7B75]">Giờ nhắc hằng ngày:</span>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="px-2 py-1 bg-[#FAF7F4] border border-[#E8DFD8] rounded-lg text-xs font-bold text-[#3A2E2B]"
                />
              </div>
            )}
          </div>

          {/* Delete Option if editing */}
          {editingActivity && onDelete && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Mẹ có chắc muốn xóa hoạt động "${editingActivity.title}" không?`)) {
                    onDelete(editingActivity.id);
                    onClose();
                  }
                }}
                className="w-full py-2.5 rounded-xl border border-[#FADCD5] text-[#C84B4B] bg-[#FDF2F0] hover:bg-[#FCEAE6] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa hoạt động này</span>
              </button>
            </div>
          )}

          {/* Form Submit Button */}
          <div className="pt-2 pb-2">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3 bg-[#C84B4B] hover:bg-[#B53E3E] text-white font-bold rounded-2xl shadow-sm text-xs cursor-pointer transition-colors"
            >
              {editingActivity ? 'Lưu thay đổi' : 'Thêm vào kế hoạch'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
