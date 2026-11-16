import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bell,
  Clock,
  Plus,
  Trash2,
  Edit3,
  AlertCircle,
  Sparkles,
  Volume2,
  ShieldCheck,
  Droplet,
  Activity,
  Music,
  Stethoscope,
  Pill,
  Moon,
  Footprints,
  HelpCircle,
} from 'lucide-react';
import { HealthReminder, ReminderFrequency, ActivityCategory } from '../../types';
import { notificationService } from '../../services/notificationService';
import { getTodayDateString } from '../../services/storageService';

interface ReminderManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: HealthReminder[];
  initialEditingReminder?: HealthReminder | null;
  initialOpenForm?: boolean;
  onAddReminder: (reminder: Omit<HealthReminder, 'id' | 'createdAt'>) => void;
  onUpdateReminder: (id: string, partial: Partial<HealthReminder>) => void;
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
}

export const REMINDER_TYPE_OPTIONS: {
  id: ActivityCategory;
  label: string;
  hint: string;
}[] = [
  { id: 'water', label: 'Uống nước', hint: 'VD: Uống 250ml nước ấm' },
  { id: 'pill', label: 'Uống vitamin / thuốc theo chỉ định', hint: 'VD: Uống viên sắt sau ăn trưa' },
  { id: 'checkup', label: 'Lịch khám thai', hint: 'VD: Siêu âm mốc 22 tuần' },
  { id: 'rest', label: 'Nghỉ ngơi', hint: 'VD: Nằm nghiêng trái thư giãn 20 phút' },
  { id: 'walk', label: 'Vận động nhẹ', hint: 'VD: Đi bộ hoặc Yoga bầu 15 phút' },
  { id: 'custom', label: 'Tự tạo nhắc nhở khác', hint: 'VD: Nghe nhạc thai giáo, chuẩn bị đồ đi sinh' },
];

export const ReminderManagerModal: React.FC<ReminderManagerModalProps> = ({
  isOpen,
  onClose,
  reminders,
  initialEditingReminder = null,
  initialOpenForm = false,
  onAddReminder,
  onUpdateReminder,
  onToggleReminder,
  onDeleteReminder,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('water');
  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState('08:00');
  const [frequency, setFrequency] = useState<ReminderFrequency>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const platformGuide = notificationService.getPlatformNotificationGuide();

  useEffect(() => {
    if (isOpen) {
      const status = notificationService.getPermissionStatus();
      setPermissionStatus(status);
      setShowGuide(status === 'denied' || status === 'unsupported');

      if (initialEditingReminder) {
        setEditingId(initialEditingReminder.id);
        setTitle(initialEditingReminder.title);
        setNotes(initialEditingReminder.notes || '');
        setCategory(initialEditingReminder.category);
        setDate(initialEditingReminder.date || getTodayDateString());
        setTime(initialEditingReminder.time);
        setFrequency(initialEditingReminder.frequency);
        setSelectedDays(initialEditingReminder.daysOfWeek || [1, 2, 3, 4, 5, 6, 0]);
        setShowAddForm(true);
      } else if (initialOpenForm) {
        resetForm();
        setShowAddForm(true);
      } else {
        setShowAddForm(false);
        setEditingId(null);
      }
    }
  }, [isOpen, initialEditingReminder, initialOpenForm]);

  if (!isOpen) return null;

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setNotes('');
    setCategory('water');
    setDate(getTodayDateString());
    setTime('08:00');
    setFrequency('daily');
    setSelectedDays([1, 2, 3, 4, 5, 6, 0]);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleRequestPermission = async () => {
    const status = await notificationService.requestPermission();
    setPermissionStatus(status);
    if (status === 'granted') {
      setShowGuide(false);
      showToast('Đã bật quyền thông báo thành công!');
      notificationService.playChime(0.25);
    } else {
      setShowGuide(true);
      showToast('Trình duyệt chưa cấp quyền. Hãy xem hướng dẫn bên dưới.');
    }
  };

  const handleTestChimeAndNotification = () => {
    const sample: HealthReminder = {
      id: 'test-reminder',
      title: 'Kiểm tra chuông nhắc nhở Nova',
      category: 'water',
      time: 'Bây giờ',
      frequency: 'once',
      isEnabled: true,
      notes: 'Âm thanh chuông nhẹ nhàng đã được phát thành công.',
      createdAt: new Date().toISOString(),
    };
    notificationService.triggerReminderAlert(sample);
    showToast('Đã phát chuông thử nghiệm!');
  };

  const handleDayToggle = (dayNum: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum].sort()
    );
  };

  const handleStartEdit = (rem: HealthReminder) => {
    setEditingId(rem.id);
    setTitle(rem.title);
    setNotes(rem.notes || '');
    setCategory(rem.category);
    setDate(rem.date || getTodayDateString());
    setTime(rem.time);
    setFrequency(rem.frequency);
    setSelectedDays(rem.daysOfWeek || [1, 2, 3, 4, 5, 6, 0]);
    setShowAddForm(true);
  };

  const handleSubmitReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Vui lòng nhập tên nhắc nhở');
      return;
    }
    if (frequency === 'custom_days' && selectedDays.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 thứ trong tuần');
      return;
    }

    const payload: Omit<HealthReminder, 'id' | 'createdAt'> = {
      title: title.trim(),
      notes: notes.trim() || undefined,
      category,
      date: date || getTodayDateString(),
      time,
      frequency,
      daysOfWeek: frequency === 'custom_days' ? selectedDays : undefined,
      isEnabled: true,
    };

    if (editingId) {
      onUpdateReminder(editingId, payload);
      showToast(`Đã cập nhật nhắc nhở lúc ${time}!`);
    } else {
      onAddReminder(payload);
      showToast(`Đã thêm nhắc nhở mới lúc ${time}!`);
    }

    resetForm();
    setShowAddForm(false);
  };

  const daysLabels = [
    { num: 1, label: 'T2' },
    { num: 2, label: 'T3' },
    { num: 3, label: 'T4' },
    { num: 4, label: 'T5' },
    { num: 5, label: 'T6' },
    { num: 6, label: 'T7' },
    { num: 0, label: 'CN' },
  ];

  const getCategoryIcon = (cat: ActivityCategory) => {
    switch (cat) {
      case 'water':
        return <Droplet className="w-4 h-4 text-[#6D8572] dark:text-[#8DA892]" />;
      case 'pill':
        return <Pill className="w-4 h-4 text-[#B55841] dark:text-[#D47A63]" />;
      case 'checkup':
        return <Stethoscope className="w-4 h-4 text-[#B55841] dark:text-[#D47A63]" />;
      case 'rest':
        return <Moon className="w-4 h-4 text-[#9E5B3B] dark:text-[#D7BA86]" />;
      case 'walk':
      case 'yoga':
        return <Footprints className="w-4 h-4 text-[#263E35] dark:text-[#8DA892]" />;
      case 'music':
        return <Music className="w-4 h-4 text-[#9E5B3B] dark:text-[#D7BA86]" />;
      default:
        return <Activity className="w-4 h-4 text-[#786962] dark:text-[#B5A89F]" />;
    }
  };

  const getFrequencyLabel = (rem: HealthReminder) => {
    if (rem.frequency === 'daily') return 'Hằng ngày';
    if (rem.frequency === 'weekly') return 'Hằng tuần';
    if (rem.frequency === 'once') return rem.date ? `Ngày ${rem.date}` : 'Một lần';
    return 'Theo thứ';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#322622]/45 backdrop-blur-xs p-0 md:p-4">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="w-full max-w-[480px] max-h-[92vh] bg-[#FAF6F0] dark:bg-[#161311] rounded-t-[28px] md:rounded-[28px] border border-[#E6DDD1] dark:border-[#362E2A] ios-float-shadow flex flex-col overflow-hidden text-[#322622] dark:text-[#F4EDE6]"
      >
        {toastMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#263E35] text-[#FAF6F0] text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-[#D7BA86]" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-[#E6DDD1] dark:border-[#362E2A] bg-[#FFFFFF] dark:bg-[#1E1A17] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63] flex items-center justify-center">
              <Bell className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="font-editorial text-[17px] font-semibold text-[#322622] dark:text-[#F4EDE6] leading-tight">
                Quản lý nhắc nhở
              </h2>
              <p className="text-[11px] font-medium text-[#786962] dark:text-[#B5A89F] mt-0.5">
                Lưu riêng theo tài khoản của mẹ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF6F0] dark:bg-[#231E1B] hover:bg-[#F2ECE3] text-[#786962] dark:text-[#B5A89F] flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Đóng"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
          {/* Permission Status Banner */}
          <div
            className={`p-3.5 rounded-2xl border transition-colors ${
              permissionStatus === 'granted'
                ? 'bg-[#EBF1EC] dark:bg-[#1E2922] border-[#D4E2D7] dark:border-[#2E3F34] text-[#263E35] dark:text-[#A7C2AC]'
                : 'bg-[#F2ECE3] dark:bg-[#231E1B] border-[#E6DDD1] dark:border-[#362E2A] text-[#786962] dark:text-[#D7BA86]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {permissionStatus === 'granted' ? (
                  <ShieldCheck className="w-5 h-5 text-[#6D8572] dark:text-[#8DA892] shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-[#9E5B3B] dark:text-[#D7BA86] shrink-0" />
                )}
                <div>
                  <p className="text-xs font-semibold leading-tight text-[#322622] dark:text-[#F4EDE6]">
                    {permissionStatus === 'granted'
                      ? 'Thông báo thiết bị: Đã bật'
                      : permissionStatus === 'denied'
                      ? 'Quyền thông báo đang bị chặn'
                      : permissionStatus === 'unsupported'
                      ? 'Trình duyệt hiện tại không hỗ trợ thông báo nền'
                      : 'Chưa cấp quyền thông báo'}
                  </p>
                  <p className="text-[11px] opacity-85 mt-0.5 leading-normal">
                    {permissionStatus === 'granted'
                      ? 'Ứng dụng sẽ gửi thông báo đúng giờ đã hẹn.'
                      : 'Khi chưa có quyền hệ thống, mẹ vẫn nhận cảnh báo trong ứng dụng khi đang mở.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {permissionStatus === 'default' && (
                  <button
                    type="button"
                    onClick={handleRequestPermission}
                    className="px-3 py-1.5 bg-[#B55841] hover:bg-[#9E4A35] text-white rounded-xl text-[11px] font-semibold cursor-pointer transition-colors"
                  >
                    Bật quyền
                  </button>
                )}
                {permissionStatus !== 'granted' && (
                  <button
                    type="button"
                    onClick={() => setShowGuide((v) => !v)}
                    className="p-1.5 rounded-xl bg-[#FFFFFF] dark:bg-[#1E1A17] text-[#9E5B3B] dark:text-[#D7BA86] cursor-pointer"
                    title="Hướng dẫn bật thông báo"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {showGuide && permissionStatus !== 'granted' && (
              <div className="mt-3 pt-2.5 border-t border-[#E6DDD1] dark:border-[#362E2A] text-[11px] space-y-1">
                <p className="font-semibold text-[#322622] dark:text-[#F4EDE6]">
                  {platformGuide.title} ({platformGuide.platformLabel}):
                </p>
                <ol className="list-decimal list-inside space-y-0.5">
                  {platformGuide.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Test Chime Button */}
          <div className="p-3 bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-[#786962] dark:text-[#B5A89F]">
              <Volume2 className="w-4 h-4 text-[#B55841] dark:text-[#D47A63]" />
              <span>Thử âm thanh chuông & cảnh báo</span>
            </div>
            <button
              type="button"
              onClick={handleTestChimeAndNotification}
              className="px-3 py-1.5 bg-[#F7EAE5] dark:bg-[#35231E] border border-[#E6DDD1] dark:border-[#4A3630] text-[#B55841] dark:text-[#D47A63] rounded-xl text-[11px] font-semibold hover:bg-[#EFE0D9] cursor-pointer transition-colors"
            >
              Thử ngay
            </button>
          </div>

          {/* Header & Add Button */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#786962] dark:text-[#B5A89F] uppercase tracking-wider">
              Nhắc nhở của mẹ ({reminders.length})
            </h3>
            <button
              type="button"
              onClick={() => {
                if (showAddForm) {
                  setShowAddForm(false);
                  resetForm();
                } else {
                  resetForm();
                  setShowAddForm(true);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-[#B55841] hover:bg-[#9E4A35] dark:bg-[#D47A63] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Đóng biểu mẫu' : 'THÊM'}</span>
            </button>
          </div>

          {/* Create / Edit Reminder Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmitReminder}
                className="p-4 bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-3 overflow-hidden"
              >
                <h4 className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6]">
                  {editingId ? 'Chỉnh sửa nhắc nhở' : 'Tạo nhắc nhở mới'}
                </h4>

                <div>
                  <label className="text-[11px] font-semibold text-[#786962] dark:text-[#B5A89F] block mb-1">
                    Loại nhắc nhở:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                    className="w-full px-3 py-2 bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-xs font-semibold text-[#322622] dark:text-[#F4EDE6]"
                  >
                    {REMINDER_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#786962] dark:text-[#B5A89F] block mb-1">
                    Tên nhắc nhở:
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      REMINDER_TYPE_OPTIONS.find((o) => o.id === category)?.hint ||
                      'Nhập tên nhắc nhở...'
                    }
                    className="w-full px-3 py-2 bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-xs text-[#322622] dark:text-[#F4EDE6]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#786962] dark:text-[#B5A89F] block mb-1">
                    Nội dung chi tiết:
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ghi chú liều lượng, lưu ý của bác sĩ hoặc lời nhắn..."
                    className="w-full px-3 py-2 bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-xs text-[#322622] dark:text-[#F4EDE6] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-[#786962] dark:text-[#B5A89F] block mb-1">
                      Ngày bắt đầu / hẹn:
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-2.5 py-2 bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-xs text-[#322622] dark:text-[#F4EDE6] font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#786962] dark:text-[#B5A89F] block mb-1">
                      Giờ nhắc:
                    </label>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-2.5 py-2 bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-xs text-[#322622] dark:text-[#F4EDE6] font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#786962] dark:text-[#B5A89F] block mb-1">
                    Tần suất lặp:
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'once', label: 'Một lần' },
                      { id: 'daily', label: 'Hằng ngày' },
                      { id: 'weekly', label: 'Hằng tuần' },
                      { id: 'custom_days', label: 'Chọn thứ' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFrequency(f.id as ReminderFrequency)}
                        className={`py-1.5 rounded-xl text-[11px] font-semibold border cursor-pointer transition-colors ${
                          frequency === f.id
                            ? 'bg-[#B55841] dark:bg-[#D47A63] text-white border-[#B55841]'
                            : 'bg-[#FAF6F0] dark:bg-[#231E1B] text-[#786962] dark:text-[#B5A89F] border-[#E6DDD1] dark:border-[#362E2A]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {frequency === 'custom_days' && (
                  <div>
                    <label className="text-[10.5px] font-semibold text-[#786962] dark:text-[#B5A89F] block mb-1">
                      Chọn các ngày trong tuần:
                    </label>
                    <div className="flex gap-1 justify-between">
                      {daysLabels.map((d) => {
                        const isSel = selectedDays.includes(d.num);
                        return (
                          <button
                            key={d.num}
                            type="button"
                            onClick={() => handleDayToggle(d.num)}
                            className={`w-9 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              isSel
                                ? 'bg-[#B55841] dark:bg-[#D47A63] text-white'
                                : 'bg-[#FAF6F0] dark:bg-[#231E1B] text-[#786962] dark:text-[#B5A89F] border border-[#E6DDD1] dark:border-[#362E2A]'
                            }`}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowAddForm(false);
                    }}
                    className="flex-1 py-2 rounded-xl border border-[#E6DDD1] dark:border-[#362E2A] text-xs font-semibold text-[#786962] dark:text-[#B5A89F] cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#B55841] hover:bg-[#9E4A35] text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    {editingId ? 'Cập nhật nhắc nhở' : 'Lưu nhắc nhở'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Reminder Cards List */}
          <div className="space-y-2.5">
            {reminders.length === 0 ? (
              <div className="p-6 bg-[#FFFFFF] dark:bg-[#1E1A17] rounded-2xl border border-dashed border-[#E6DDD1] dark:border-[#362E2A] text-center text-xs text-[#786962] dark:text-[#B5A89F]">
                Tài khoản này chưa có nhắc nhở nào. Nhấn nút "THÊM" để tạo nhắc nhở uống nước, vitamin hoặc lịch khám thai nhé!
              </div>
            ) : (
              reminders.map((rem) => (
                <div
                  key={rem.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                    rem.isEnabled
                      ? 'bg-[#FFFFFF] dark:bg-[#1E1A17] border-[#E6DDD1] dark:border-[#362E2A]'
                      : 'bg-[#F2ECE3]/60 dark:bg-[#1A1614] border-[#E6DDD1] dark:border-[#362E2A] opacity-65'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-center shrink-0 mt-0.5">
                      {getCategoryIcon(rem.category)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[15px] font-semibold text-[#322622] dark:text-[#F4EDE6] tracking-tight tabular-nums">
                          {rem.time}
                        </span>
                        <span className="text-[11px] font-medium text-[#786962] dark:text-[#B5A89F]">
                          · {getFrequencyLabel(rem)}
                        </span>
                        {!rem.isEnabled && (
                          <span className="text-[10.5px] font-medium text-[#786962] dark:text-[#B5A89F]">
                            (Đang tạm tắt)
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] mt-0.5 break-words">
                        {rem.title}
                      </h4>

                      {rem.notes && (
                        <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] mt-0.5 line-clamp-2">
                          {rem.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions: Toggle, Edit, Delete */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleReminder(rem.id)}
                      className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                        rem.isEnabled ? 'bg-[#6D8572]' : 'bg-[#D6CBC0] dark:bg-[#362E2A]'
                      }`}
                      title={rem.isEnabled ? 'Tạm tắt nhắc nhở' : 'Bật lại nhắc nhở'}
                      aria-label={rem.isEnabled ? 'Tạm tắt nhắc nhở' : 'Bật lại nhắc nhở'}
                    >
                      <motion.div
                        animate={{ x: rem.isEnabled ? 18 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-4.5 h-4.5 rounded-full bg-white shadow-xs"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartEdit(rem)}
                      className="w-7 h-7 rounded-lg text-[#786962] dark:text-[#B5A89F] hover:text-[#322622] hover:bg-[#FAF6F0] flex items-center justify-center transition-colors cursor-pointer"
                      title="Chỉnh sửa"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteReminder(rem.id)}
                      className="w-7 h-7 rounded-lg text-[#786962] dark:text-[#B5A89F] hover:text-[#B55841] hover:bg-[#F7EAE5] flex items-center justify-center transition-colors cursor-pointer"
                      title="Xóa nhắc nhở"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Button */}
        <div className="p-4 border-t border-[#E6DDD1] dark:border-[#362E2A] bg-[#FFFFFF] dark:bg-[#1E1A17]">
          <motion.button
            whileTap={{ scale: 0.985 }}
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-[#B55841] hover:bg-[#9E4A35] dark:bg-[#D47A63] text-white font-semibold rounded-2xl text-sm cursor-pointer transition-colors"
          >
            Hoàn tất
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
