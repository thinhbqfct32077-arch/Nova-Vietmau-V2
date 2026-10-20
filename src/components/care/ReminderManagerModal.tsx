import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bell,
  Clock,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Volume2,
  Calendar,
  ShieldCheck,
  Droplet,
  Activity,
  Music,
  Stethoscope,
  Check,
} from 'lucide-react';
import { HealthReminder, ReminderFrequency, ActivityCategory } from '../../types';
import { notificationService } from '../../services/notificationService';

interface ReminderManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: HealthReminder[];
  onAddReminder: (reminder: Omit<HealthReminder, 'id' | 'createdAt'>) => void;
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
}

export const ReminderManagerModal: React.FC<ReminderManagerModalProps> = ({
  isOpen,
  onClose,
  reminders,
  onAddReminder,
  onToggleReminder,
  onDeleteReminder,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('water');
  const [time, setTime] = useState('08:00');
  const [frequency, setFrequency] = useState<ReminderFrequency>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);
  const [notes, setNotes] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPermissionStatus(notificationService.getPermissionStatus());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleRequestPermission = async () => {
    const status = await notificationService.requestPermission();
    setPermissionStatus(status);
    if (status === 'granted') {
      showToast('Đã cấp quyền thông báo hệ thống thành công! 🎉');
      notificationService.playChime(0.25);
    } else if (status === 'denied') {
      showToast('Quyền thông báo bị từ chối trong cài đặt trình duyệt.');
    }
  };

  const handleTestChimeAndNotification = () => {
    const sample: HealthReminder = {
      id: 'test-reminder',
      title: 'Đã đến giờ uống nước & thư giãn cùng bé!',
      category: 'water',
      time: 'Bây giờ',
      frequency: 'daily',
      isEnabled: true,
      notes: 'Thử nghiệm chuông và thông báo thành công! Âm thanh chuông êm dịu 528Hz đã phát.',
      createdAt: new Date().toISOString(),
    };
    notificationService.triggerReminderAlert(sample);
    showToast('Đang phát chuông thử nghiệm & gửi thông báo!');
  };

  const handleDayToggle = (dayNum: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum].sort()
    );
  };

  const handleSubmitNewReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Vui lòng nhập tên hoạt động nhắc nhở');
      return;
    }

    onAddReminder({
      title: title.trim(),
      category,
      time,
      frequency,
      daysOfWeek: frequency === 'custom_days' ? selectedDays : undefined,
      isEnabled: true,
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setNotes('');
    setShowAddForm(false);
    showToast(`Đã lưu lịch nhắc nhở lúc ${time}!`);
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
        return <Droplet className="w-4 h-4 text-[#2980B9]" />;
      case 'yoga':
        return <Activity className="w-4 h-4 text-[#D35400]" />;
      case 'music':
        return <Music className="w-4 h-4 text-[#8E44AD]" />;
      case 'checkup':
        return <Stethoscope className="w-4 h-4 text-[#C84B4B]" />;
      default:
        return <Clock className="w-4 h-4 text-[#7F8C8D]" />;
    }
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
        {/* Toast */}
        {toastMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#3A2E2B] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 animate-fade-in whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-[#F0ECE9] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FCEEEB] text-[#C84B4B] flex items-center justify-center shadow-xs">
              <Bell className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#3A2E2B] leading-tight">
                Nhắc nhở & Hẹn giờ sức khỏe
              </h2>
              <p className="text-[11px] font-medium text-[#8C7B75] mt-0.5">
                Thông báo âm thanh & chuông nhắc thực tế
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F4] hover:bg-[#F2ECE7] text-[#8C7B75] flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Đóng"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
          {/* System Notification Permission Status Banner */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between transition-colors ${
              permissionStatus === 'granted'
                ? 'bg-[#EAFAF1] border-[#A9DFBF] text-[#1E8449]'
                : permissionStatus === 'denied'
                ? 'bg-[#FDF2E9] border-[#FAD7A0] text-[#B9770E]'
                : 'bg-[#F4F6F7] border-[#D5D8DC] text-[#5D6D7E]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {permissionStatus === 'granted' ? (
                <ShieldCheck className="w-5 h-5 text-[#27AE60] shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[#E67E22] shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold leading-tight">
                  {permissionStatus === 'granted'
                    ? 'Thông báo hệ thống: Đã kích hoạt'
                    : permissionStatus === 'denied'
                    ? 'Thông báo hệ thống: Bị chặn trong trình duyệt'
                    : 'Chưa cấp quyền thông báo'}
                </p>
                <p className="text-[10.5px] opacity-80 mt-0.5 leading-normal">
                  {permissionStatus === 'granted'
                    ? 'Điện thoại/máy tính sẽ nhận được chuông & thông báo khi đến giờ.'
                    : 'Cần cấp quyền để thiết bị báo khi mẹ đang mở ứng dụng khác.'}
                </p>
              </div>
            </div>

            {permissionStatus !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="px-3 py-1.5 bg-[#C84B4B] hover:bg-[#B53E3E] text-white rounded-xl text-[11px] font-bold shrink-0 cursor-pointer shadow-xs transition-colors"
              >
                Bật quyền
              </button>
            )}
          </div>

          {/* Test Chime and Notification Button */}
          <div className="p-3 bg-white rounded-2xl border border-[#EDE7E2] shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-[#6E5D57]">
              <Volume2 className="w-4 h-4 text-[#C84B4B]" />
              <span>Kiểm tra âm thanh chuông 528Hz & thông báo</span>
            </div>
            <button
              type="button"
              onClick={handleTestChimeAndNotification}
              className="px-3 py-1.5 bg-[#FAF1ED] border border-[#F2D0C7] text-[#C84B4B] rounded-xl text-[11px] font-bold hover:bg-[#F8E5DF] cursor-pointer transition-colors"
            >
              Thử chuông ngay
            </button>
          </div>

          {/* Add Reminder Toggle Button */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#8C7B75] uppercase tracking-wider">
              Danh sách lịch nhắc ({reminders.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-bold text-[#C84B4B] hover:text-[#B53E3E] flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Đóng form' : '+ Tạo lịch nhắc mới'}</span>
            </button>
          </div>

          {/* Add Reminder Form Drawer */}
          <AnimatePresence>
            {showAddForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmitNewReminder}
                className="p-4 bg-white rounded-2xl border border-[#EDE7E2] shadow-xs space-y-3 overflow-hidden"
              >
                <h4 className="text-xs font-bold text-[#3A2E2B] mb-1">
                  Thiết lập lịch nhắc nhở mới
                </h4>

                {/* Title */}
                <div>
                  <label className="text-[11px] font-semibold text-[#8C7B75] block mb-1">
                    Nội dung nhắc nhở:
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Uống 250ml nước ấm, Tập yoga..."
                    className="w-full px-3 py-2 bg-[#FAF7F4] border border-[#E8DFD8] rounded-xl text-xs text-[#3A2E2B] focus:outline-none focus:ring-2 focus:ring-[#C84B4B]/30"
                  />
                </div>

                {/* Category & Time */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-[#8C7B75] block mb-1">
                      Hoạt động:
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                      className="w-full px-2.5 py-2 bg-[#FAF7F4] border border-[#E8DFD8] rounded-xl text-xs text-[#3A2E2B] focus:outline-none"
                    >
                      <option value="water">💧 Uống nước</option>
                      <option value="yoga">🧘‍♀️ Yoga / Thư giãn</option>
                      <option value="music">🎵 Nghe nhạc thai giáo</option>
                      <option value="checkup">🩺 Lịch khám thai</option>
                      <option value="custom">✨ Hoạt động khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#8C7B75] block mb-1">
                      Giờ nhắc (24h):
                    </label>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-2.5 py-2 bg-[#FAF7F4] border border-[#E8DFD8] rounded-xl text-xs text-[#3A2E2B] font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label className="text-[11px] font-semibold text-[#8C7B75] block mb-1">
                    Tần suất nhắc:
                  </label>
                  <div className="flex gap-1.5">
                    {[
                      { id: 'daily', label: 'Hằng ngày' },
                      { id: 'once', label: 'Một lần' },
                      { id: 'custom_days', label: 'Chọn thứ' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFrequency(f.id as ReminderFrequency)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                          frequency === f.id
                            ? 'bg-[#C84B4B] text-white border-[#C84B4B]'
                            : 'bg-[#FAF7F4] text-[#6E5D57] border-[#E8DFD8]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom days of week picker */}
                {frequency === 'custom_days' && (
                  <div>
                    <label className="text-[10.5px] font-semibold text-[#8C7B75] block mb-1">
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
                            className={`w-9 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isSel
                                ? 'bg-[#C84B4B] text-white shadow-xs'
                                : 'bg-[#FAF7F4] text-[#8C7B75] border border-[#E8DFD8]'
                            }`}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="text-[11px] font-semibold text-[#8C7B75] block mb-1">
                    Ghi chú thêm (tùy chọn):
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="VD: Uống trước bữa ăn 30 phút..."
                    className="w-full px-3 py-2 bg-[#FAF7F4] border border-[#E8DFD8] rounded-xl text-xs text-[#3A2E2B] focus:outline-none"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-2 rounded-xl border border-[#E8DFD8] text-xs font-semibold text-[#8C7B75]"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#C84B4B] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#B53E3E]"
                  >
                    Lưu nhắc nhở
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Reminder Cards List */}
          <div className="space-y-2.5">
            {reminders.length === 0 ? (
              <div className="p-6 bg-white rounded-2xl border border-dashed border-[#E0D8D0] text-center text-xs text-[#8C7B75]">
                Chưa có lịch nhắc nhở nào. Nhấn "+ Tạo lịch nhắc mới" để không bỏ lỡ các cữ nước và bài tập nhé!
              </div>
            ) : (
              reminders.map((rem) => (
                <div
                  key={rem.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    rem.isEnabled
                      ? 'bg-white border-[#EDE7E2] shadow-2xs'
                      : 'bg-[#F9F7F5] border-[#EAE4DD] opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FAF7F4] border border-[#EFEAE5] flex items-center justify-center shrink-0">
                      {getCategoryIcon(rem.category)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-extrabold text-[#3A2E2B] tracking-tight">
                          {rem.time}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF7F4] text-[#8C7B75] border border-[#EDE7E2]">
                          {rem.frequency === 'daily'
                            ? 'Hằng ngày'
                            : rem.frequency === 'once'
                            ? '1 lần'
                            : 'Theo thứ'}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-[#3A2E2B] mt-0.5">
                        {rem.title}
                      </h4>

                      {rem.notes && (
                        <p className="text-[11px] text-[#8C7B75] mt-0.5 line-clamp-1">
                          {rem.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions: Toggle switch + Delete */}
                  <div className="flex items-center gap-2">
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => onToggleReminder(rem.id)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                        rem.isEnabled ? 'bg-[#2ECC71]' : 'bg-[#D5D8DC]'
                      }`}
                      aria-label={rem.isEnabled ? 'Tắt nhắc nhở' : 'Bật nhắc nhở'}
                    >
                      <motion.div
                        animate={{ x: rem.isEnabled ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-5 h-5 rounded-full bg-white shadow-xs"
                      />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => onDeleteReminder(rem.id)}
                      className="w-7 h-7 rounded-lg text-[#8C7B75] hover:text-[#C84B4B] hover:bg-[#FCEEEB] flex items-center justify-center transition-colors cursor-pointer"
                      title="Xóa nhắc nhở"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Platform Capability Note */}
          <div className="p-3 bg-[#FAF7F4] rounded-2xl border border-[#EDE7E2] text-[11px] text-[#8C7B75] leading-relaxed">
            <span className="font-bold text-[#6E5D57]">📌 Cơ chế hoạt động trên nền tảng:</span>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>Trình duyệt hỗ trợ Web Notification & âm thanh chuông khi trang đang mở hoặc chạy ngầm.</li>
              <li>Để nhận chuông khi khóa màn hình, mẹ hãy cài đặt ứng dụng vào màn hình chính (PWA/Home Screen).</li>
            </ul>
          </div>
        </div>

        {/* Bottom Button */}
        <div className="p-4 border-t border-[#F0ECE9] bg-white">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-3 bg-[#C84B4B] hover:bg-[#B53E3E] text-white font-bold rounded-2xl shadow-sm text-sm cursor-pointer transition-colors"
          >
            Đóng
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
