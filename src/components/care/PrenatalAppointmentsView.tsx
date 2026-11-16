import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Sparkles,
  Info,
  Check,
  Stethoscope,
  X,
} from 'lucide-react';
import { PrenatalAppointment, DoctorQuestion } from '../../types';
import { storageService, getTodayDateString } from '../../services/storageService';

export const PrenatalAppointmentsView: React.FC = () => {
  const [appointments, setAppointments] = useState<PrenatalAppointment[]>(() =>
    storageService.loadPrenatalAppointments()
  );
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [expandedAptId, setExpandedAptId] = useState<string | null>(null);

  // New Appointment modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState('09:00');
  const [hospital, setHospital] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [notes, setNotes] = useState('');

  // New Question state
  const [newQuestionText, setNewQuestionText] = useState('');
  const [activeQuestionAptId, setActiveQuestionAptId] = useState<string | null>(null);

  // Completion modal state
  const [completingApt, setCompletingApt] = useState<PrenatalAppointment | null>(null);
  const [resultsSummary, setResultsSummary] = useState('');

  // Delete confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  useEffect(() => {
    setAppointments(storageService.loadPrenatalAppointments());
  }, []);

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !hospital.trim()) {
      triggerToast('Vui lòng nhập tên buổi khám và bệnh viện / phòng khám');
      return;
    }

    const created = storageService.addPrenatalAppointment({
      title: title.trim(),
      date,
      time,
      hospitalOrClinic: hospital.trim(),
      doctorName: doctorName.trim() || undefined,
      notes: notes.trim() || undefined,
      status: 'upcoming',
      questions: [
        { id: `q-${Date.now()}-1`, question: 'Chỉ số phát triển của bé có tương xứng với tuổi thai không?', isAnswered: false },
        { id: `q-${Date.now()}-2`, question: 'Mẹ cần lưu ý thêm về dinh dưỡng hoặc thuốc bổ trong giai đoạn này?', isAnswered: false },
      ],
      reminderEnabled: true,
    });

    setAppointments(storageService.loadPrenatalAppointments());
    setShowAddModal(false);
    setTitle('');
    setHospital('');
    setDoctorName('');
    setNotes('');
    setExpandedAptId(created.id);
    triggerToast('Đã tạo lịch khám thai thành công!');
  };

  const handleToggleQuestion = (aptId: string, qId: string) => {
    const updated = storageService.toggleQuestionAnswered(aptId, qId);
    setAppointments(updated);
  };

  const handleAddQuestion = (aptId: string) => {
    if (!newQuestionText.trim()) return;
    const updated = storageService.addQuestionToAppointment(aptId, newQuestionText.trim());
    setAppointments(updated);
    setNewQuestionText('');
    setActiveQuestionAptId(null);
    triggerToast('Đã thêm câu hỏi cần hỏi bác sĩ!');
  };

  const handleConfirmDeleteAppointment = (id: string) => {
    const updated = storageService.deletePrenatalAppointment(id);
    setAppointments(updated);
    setConfirmDeleteId(null);
    triggerToast('Đã xóa lịch khám');
  };

  const handleConfirmComplete = () => {
    if (!completingApt) return;
    const updated = storageService.updatePrenatalAppointment(completingApt.id, {
      status: 'completed',
      resultsSummary: resultsSummary || 'Đã hoàn thành buổi khám thai tốt đẹp.',
    });
    setAppointments(updated);
    setCompletingApt(null);
    setResultsSummary('');
    triggerToast('Chúc mừng mẹ đã hoàn thành mốc khám thai!');
  };

  const filteredAppointments = appointments.filter((a) =>
    activeTab === 'upcoming' ? a.status === 'upcoming' : a.status === 'completed'
  );

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Toast alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#322622] dark:bg-[#F4EDE6] text-white dark:text-[#322622] px-4 py-2 rounded-full text-xs font-semibold shadow-lg"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner & Action */}
      <div className="bg-white dark:bg-[#1E1A17] rounded-3xl p-5 border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63] flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-editorial text-[16px] font-semibold text-[#322622] dark:text-[#F4EDE6] truncate">
              Sổ theo dõi Lịch khám thai
            </h3>
            <p className="text-[11px] text-[#786962] dark:text-[#B5A89F]">
              Chuẩn 6 mốc vàng tầm soát của Bộ Y tế
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#B55841] hover:bg-[#9E4A35] text-white rounded-2xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Đặt lịch khám</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-[#F2ECE3] dark:bg-[#231E1B] rounded-2xl">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer min-h-[40px] ${
            activeTab === 'upcoming'
              ? 'bg-white dark:bg-[#1E1A17] text-[#322622] dark:text-[#F4EDE6]'
              : 'text-[#786962] dark:text-[#B5A89F] hover:text-[#322622]'
          }`}
        >
          Lịch khám sắp tới ({appointments.filter((a) => a.status === 'upcoming').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer min-h-[40px] ${
            activeTab === 'completed'
              ? 'bg-white dark:bg-[#1E1A17] text-[#322622] dark:text-[#F4EDE6]'
              : 'text-[#786962] dark:text-[#B5A89F] hover:text-[#322622]'
          }`}
        >
          Đã khám xong ({appointments.filter((a) => a.status === 'completed').length})
        </button>
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white dark:bg-[#1E1A17] rounded-3xl p-8 text-center text-[#786962] dark:text-[#B5A89F] border border-[#E6DDD1] dark:border-[#362E2A]">
            <Calendar className="w-8 h-8 mx-auto text-[#C4B7AD] mb-2" />
            <p className="text-xs font-medium">
              {activeTab === 'upcoming'
                ? 'Mẹ không có lịch khám sắp tới. Hãy bấm "Đặt lịch khám" để ghi nhớ ngày hẹn!'
                : 'Chưa có buổi khám nào được hoàn thành.'}
            </p>
          </div>
        ) : (
          filteredAppointments.map((apt) => {
            const isExpanded = expandedAptId === apt.id;
            const answeredCount = apt.questions.filter((q) => q.isAnswered).length;

            return (
              <div
                key={apt.id}
                className="bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] overflow-hidden transition-all"
              >
                {/* Main Card Header */}
                <div
                  onClick={() => setExpandedAptId(isExpanded ? null : apt.id)}
                  className="p-5 cursor-pointer hover:bg-[#FAF6F0]/60 dark:hover:bg-[#231E1B]/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold">
                        {apt.weekRecommended && (
                          <span className="text-[#B55841] dark:text-[#D47A63]">
                            Tuần {apt.weekRecommended} ·
                          </span>
                        )}
                        <span className={apt.status === 'completed' ? 'text-[#4F6B56] dark:text-[#8DA892]' : 'text-[#9E5B3B] dark:text-[#D7BA86]'}>
                          {apt.status === 'completed' ? 'Đã hoàn thành' : 'Sắp tới'}
                        </span>
                      </div>
                      <h4 className="font-editorial text-[16px] font-semibold text-[#322622] dark:text-[#F4EDE6] leading-snug">
                        {apt.title}
                      </h4>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(apt.id);
                      }}
                      className="p-2 text-[#A3958E] hover:text-[#B55841] transition-colors cursor-pointer"
                      title="Xóa lịch khám"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Date, Time, Clinic */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#6B5D56] dark:text-[#C5B9B0] pt-2.5 border-t border-[#E6DDD1]/60 dark:border-[#362E2A]">
                    <div className="flex items-center gap-1.5 tabular-nums">
                      <Calendar className="w-3.5 h-3.5 text-[#B55841] dark:text-[#D47A63]" />
                      <span className="font-semibold">{apt.date} ({apt.time})</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#6D8572]" />
                      <span className="truncate">{apt.hospitalOrClinic}</span>
                    </div>
                  </div>

                  {/* Doctor & Question Counter Preview */}
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#E6DDD1]/60 dark:border-[#362E2A] text-[11px]">
                    <div className="flex items-center gap-1.5 text-[#786962] dark:text-[#B5A89F]">
                      <User className="w-3.5 h-3.5" />
                      <span>{apt.doctorName || 'Bác sĩ sản khoa phụ trách'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#B55841] dark:text-[#D47A63] tabular-nums">
                        {answeredCount}/{apt.questions.length} câu hỏi đã giải đáp
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#786962]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#786962]" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Collapsible Details & Question Checklist */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[#E6DDD1] dark:border-[#362E2A] bg-[#FAF6F0] dark:bg-[#231E1B] p-5 space-y-4"
                    >
                      {/* Clinical Notes */}
                      {apt.notes && (
                        <div className="p-3.5 bg-white dark:bg-[#1E1A17] rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#6B5D56] dark:text-[#C5B9B0] leading-relaxed">
                          <strong className="text-[#322622] dark:text-[#F4EDE6] font-semibold block mb-1">
                            Lưu ý chuẩn bị trước khi khám:
                          </strong>
                          {apt.notes}
                        </div>
                      )}

                      {/* Doctor Questions Checklist */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-[#B55841] dark:text-[#D47A63]" />
                            <span>Danh sách câu hỏi cần hỏi bác sĩ:</span>
                          </h5>
                          <button
                            onClick={() => setActiveQuestionAptId(apt.id)}
                            className="text-[11px] font-semibold text-[#B55841] dark:text-[#D47A63] hover:underline cursor-pointer"
                          >
                            + Thêm câu hỏi
                          </button>
                        </div>

                        {/* Add question inline input */}
                        {activeQuestionAptId === apt.id && (
                          <div className="flex items-center gap-2 mb-2.5">
                            <input
                              type="text"
                              value={newQuestionText}
                              onChange={(e) => setNewQuestionText(e.target.value)}
                              placeholder="Nhập câu hỏi mẹ muốn hỏi bác sĩ..."
                              className="flex-1 bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl px-3 py-2 text-[16px] sm:text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841]"
                            />
                            <button
                              onClick={() => handleAddQuestion(apt.id)}
                              className="px-3.5 py-2 bg-[#B55841] text-white rounded-xl text-xs font-semibold cursor-pointer"
                            >
                              Thêm
                            </button>
                            <button
                              onClick={() => setActiveQuestionAptId(null)}
                              className="p-1.5 text-[#786962] hover:text-[#322622] cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {/* Question Items */}
                        <div className="space-y-2">
                          {apt.questions.map((q) => (
                            <div
                              key={q.id}
                              onClick={() => handleToggleQuestion(apt.id, q.id)}
                              className="flex items-start gap-2.5 p-3 bg-white dark:bg-[#1E1A17] rounded-xl border border-[#E6DDD1] dark:border-[#362E2A] cursor-pointer hover:border-[#B55841]/50"
                            >
                              <div
                                className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                  q.isAnswered
                                    ? 'bg-[#6D8572] border-[#6D8572] text-white'
                                    : 'border-[#C4B7AD] dark:border-[#524640] bg-white dark:bg-[#231E1B]'
                                }`}
                              >
                                {q.isAnswered && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <div className="flex-1">
                                <p
                                  className={`text-xs ${
                                    q.isAnswered
                                      ? 'line-through text-[#786962] dark:text-[#B5A89F]'
                                      : 'text-[#322622] dark:text-[#F4EDE6] font-medium'
                                  }`}
                                >
                                  {q.question}
                                </p>
                                {q.answerNotes && (
                                  <p className="text-[11px] text-[#4F6B56] dark:text-[#8DA892] font-semibold mt-1">
                                    Bác sĩ giải đáp: {q.answerNotes}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Completed Result Notes */}
                      {apt.resultsSummary && (
                        <div className="p-3.5 bg-[#EBF1EC] dark:bg-[#1E2922] rounded-2xl border border-[#CFE0D3] dark:border-[#2C3F33] text-xs text-[#263E35] dark:text-[#A7C2AC]">
                          <strong className="font-semibold block mb-1">Kết quả sau khám:</strong>
                          {apt.resultsSummary}
                        </div>
                      )}

                      {/* Action buttons */}
                      {apt.status === 'upcoming' && (
                        <div className="pt-2">
                          <button
                            onClick={() => setCompletingApt(apt)}
                            className="w-full py-3 bg-[#263E35] hover:bg-[#1D3029] text-[#FAF6F0] rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Đã hoàn thành buổi khám thai</span>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Xác nhận Xóa lịch khám */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161311]/55 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-white dark:bg-[#1E1A17] rounded-3xl p-5 border border-[#E6DDD1] dark:border-[#362E2A] shadow-2xl space-y-3">
              <h4 className="font-editorial text-base font-semibold text-[#322622] dark:text-[#F4EDE6]">
                Xóa lịch khám này?
              </h4>
              <p className="text-xs text-[#6B5D56] dark:text-[#C5B9B0]">
                Mẹ có chắc muốn xóa lịch khám thai và danh sách câu hỏi kèm theo không?
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E6DDD1] dark:border-[#362E2A] text-xs font-semibold text-[#786962] cursor-pointer min-h-[44px]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmDeleteAppointment(confirmDeleteId)}
                  className="flex-1 py-2.5 rounded-xl bg-[#B55841] text-white text-xs font-semibold cursor-pointer min-h-[44px]"
                >
                  Xóa lịch
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Đặt Lịch Khám Mới */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-[#161311]/55 backdrop-blur-xs cursor-pointer"
            />
            <motion.form
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onSubmit={handleCreateAppointment}
              className="relative w-full max-w-[460px] bg-white dark:bg-[#1E1A17] rounded-3xl p-6 shadow-2xl z-10 border border-[#E6DDD1] dark:border-[#362E2A] flex flex-col gap-3.5"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-[#E6DDD1] dark:border-[#362E2A]">
                <h3 className="font-editorial text-lg font-semibold text-[#322622] dark:text-[#F4EDE6]">Đặt lịch khám thai mới</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-[#F2ECE3] dark:bg-[#231E1B] text-[#786962] flex items-center justify-center hover:bg-[#E6DDD1] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] block mb-1">
                  Tên buổi khám / Mốc tuần thai *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Siêu âm 4D tuần 22 hoặc Tái khám định kỳ"
                  className="w-full bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl px-3 py-2 text-[16px] sm:text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] block mb-1">Ngày khám *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl px-3 py-2 text-[16px] sm:text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] block mb-1">Giờ khám *</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl px-3 py-2 text-[16px] sm:text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] block mb-1">
                  Bệnh viện / Phòng khám *
                </label>
                <input
                  type="text"
                  required
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder="VD: Bệnh viện Phụ Sản Từ Dũ hoặc Phòng khám Bác sĩ"
                  className="w-full bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl px-3 py-2 text-[16px] sm:text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] block mb-1">
                  Bác sĩ phụ trách (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="VD: BS. CKII Nguyễn Thị Kim Ánh"
                  className="w-full bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl px-3 py-2 text-[16px] sm:text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] block mb-1">
                  Ghi chú chuẩn bị (Tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="VD: Nhịn ăn sáng để xét nghiệm máu, mang theo sổ khám cũ..."
                  className="w-full bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl px-3 py-2 text-[16px] sm:text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6DDD1] dark:border-[#362E2A]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#786962] hover:text-[#322622] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#B55841] hover:bg-[#9E4A35] text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Lưu lịch khám
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Xác nhận Hoàn thành buổi khám */}
      <AnimatePresence>
        {completingApt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCompletingApt(null)}
              className="fixed inset-0 bg-[#161311]/55 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-[440px] bg-white dark:bg-[#1E1A17] rounded-3xl p-6 shadow-2xl z-10 border border-[#E6DDD1] dark:border-[#362E2A] flex flex-col gap-3.5"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-[#E6DDD1] dark:border-[#362E2A]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#6D8572]" />
                  <h3 className="font-editorial text-lg font-semibold text-[#322622] dark:text-[#F4EDE6]">
                    Hoàn thành khám thai
                  </h3>
                </div>
                <button
                  onClick={() => setCompletingApt(null)}
                  className="w-8 h-8 rounded-full bg-[#F2ECE3] dark:bg-[#231E1B] text-[#786962] flex items-center justify-center hover:bg-[#E6DDD1] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#6B5D56] dark:text-[#C5B9B0]">
                Mẹ hãy ghi chú tóm tắt kết quả (cân nặng em bé, tim thai, lời dặn của bác sĩ...) để lưu lại kỷ niệm:
              </p>

              <textarea
                rows={3}
                value={resultsSummary}
                onChange={(e) => setResultsSummary(e.target.value)}
                placeholder="VD: Bé phát triển đúng chuẩn tuần thai, tim thai 145 ck/phút, bác sĩ dặn uống thêm canxi và hẹn 4 tuần nữa tái khám..."
                className="w-full bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl p-3 text-[16px] sm:text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#6D8572]"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6DDD1] dark:border-[#362E2A]">
                <button
                  type="button"
                  onClick={() => setCompletingApt(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#786962] hover:text-[#322622] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmComplete}
                  className="px-5 py-2.5 bg-[#263E35] hover:bg-[#1D3029] text-[#FAF6F0] rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Xác nhận xong
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
