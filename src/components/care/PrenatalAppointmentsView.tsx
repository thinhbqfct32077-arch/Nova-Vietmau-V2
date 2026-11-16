import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MapPin,
  User,
  Plus,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Check,
  Stethoscope,
  X,
} from 'lucide-react';
import { PrenatalAppointment } from '../../types';
import { storageService, getTodayDateString } from '../../services/storageService';

export const PrenatalAppointmentsView: React.FC = () => {
  const [appointments, setAppointments] = useState<PrenatalAppointment[]>(() =>
    storageService.loadPrenatalAppointments()
  );
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [expandedAptId, setExpandedAptId] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState('09:00');
  const [hospital, setHospital] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [notes, setNotes] = useState('');

  const [newQuestionText, setNewQuestionText] = useState('');
  const [activeQuestionAptId, setActiveQuestionAptId] = useState<string | null>(null);

  const [completingApt, setCompletingApt] = useState<PrenatalAppointment | null>(null);
  const [resultsSummary, setResultsSummary] = useState('');

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
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-nova-accent text-nova-accent-contrast px-4 py-2 rounded-full text-xs font-semibold shadow-lg"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner & Action */}
      <div className="bg-nova-surface rounded-3xl p-5 border border-nova-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-nova-accent-soft text-nova-accent flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-editorial text-[16px] font-semibold text-nova-text truncate">
              Sổ theo dõi lịch khám thai
            </h3>
            <p className="text-[11px] text-nova-text-muted">
              Chuẩn 6 mốc vàng tầm soát của Bộ Y tế
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast rounded-2xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Đặt lịch khám</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-nova-bg-subtle border border-nova-border rounded-2xl">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer min-h-[40px] ${
            activeTab === 'upcoming'
              ? 'bg-nova-surface text-nova-text shadow-2xs'
              : 'text-nova-text-muted hover:text-nova-text'
          }`}
        >
          Lịch khám sắp tới ({appointments.filter((a) => a.status === 'upcoming').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer min-h-[40px] ${
            activeTab === 'completed'
              ? 'bg-nova-surface text-nova-text shadow-2xs'
              : 'text-nova-text-muted hover:text-nova-text'
          }`}
        >
          Đã khám xong ({appointments.filter((a) => a.status === 'completed').length})
        </button>
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="bg-nova-surface rounded-3xl p-8 text-center text-nova-text-muted border border-nova-border">
            <Calendar className="w-8 h-8 mx-auto text-nova-icon mb-2" />
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
                className="bg-nova-surface rounded-3xl border border-nova-border overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedAptId(isExpanded ? null : apt.id)}
                  className="p-5 cursor-pointer hover:bg-nova-bg-subtle/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold">
                        {apt.weekRecommended && (
                          <span className="text-nova-accent">
                            Tuần {apt.weekRecommended} ·
                          </span>
                        )}
                        <span className={apt.status === 'completed' ? 'text-nova-sage-text' : 'text-nova-warning'}>
                          {apt.status === 'completed' ? 'Đã hoàn thành' : 'Sắp tới'}
                        </span>
                      </div>
                      <h4 className="font-editorial text-[16px] font-semibold text-nova-text leading-snug">
                        {apt.title}
                      </h4>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(apt.id);
                      }}
                      className="p-2 text-nova-icon hover:text-nova-danger transition-colors cursor-pointer"
                      title="Xóa lịch khám"
                      aria-label="Xóa lịch khám"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-nova-text-muted pt-2.5 border-t border-nova-border">
                    <div className="flex items-center gap-1.5 tabular-nums">
                      <Calendar className="w-3.5 h-3.5 text-nova-accent" />
                      <span className="font-semibold">{apt.date} ({apt.time})</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-nova-sage-text" />
                      <span className="truncate">{apt.hospitalOrClinic}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-nova-border text-[11px]">
                    <div className="flex items-center gap-1.5 text-nova-text-muted">
                      <User className="w-3.5 h-3.5" />
                      <span>{apt.doctorName || 'Bác sĩ sản khoa phụ trách'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-nova-accent tabular-nums">
                        {answeredCount}/{apt.questions.length} câu hỏi đã giải đáp
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-nova-icon" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-nova-icon" />
                      )}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-nova-border bg-nova-bg-subtle p-5 space-y-4"
                    >
                      {apt.notes && (
                        <div className="p-3.5 bg-nova-surface rounded-2xl border border-nova-border text-xs text-nova-text-muted leading-relaxed">
                          <strong className="text-nova-text font-semibold block mb-1">
                            Lưu ý chuẩn bị trước khi khám:
                          </strong>
                          {apt.notes}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-xs font-semibold text-nova-text flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-nova-accent" />
                            <span>Danh sách câu hỏi cần hỏi bác sĩ:</span>
                          </h5>
                          <button
                            onClick={() => setActiveQuestionAptId(apt.id)}
                            className="text-[11px] font-semibold text-nova-accent hover:underline cursor-pointer"
                          >
                            + Thêm câu hỏi
                          </button>
                        </div>

                        {activeQuestionAptId === apt.id && (
                          <div className="flex items-center gap-2 mb-2.5">
                            <input
                              type="text"
                              value={newQuestionText}
                              onChange={(e) => setNewQuestionText(e.target.value)}
                              placeholder="Nhập câu hỏi mẹ muốn hỏi bác sĩ..."
                              className="flex-1 bg-nova-surface border border-nova-border rounded-xl px-3 py-2 text-[16px] sm:text-xs text-nova-text focus:outline-none focus:border-nova-accent"
                            />
                            <button
                              onClick={() => handleAddQuestion(apt.id)}
                              className="px-3.5 py-2 bg-nova-accent text-nova-accent-contrast rounded-xl text-xs font-semibold cursor-pointer"
                            >
                              Thêm
                            </button>
                            <button
                              onClick={() => setActiveQuestionAptId(null)}
                              className="p-1.5 text-nova-icon hover:text-nova-text cursor-pointer"
                              aria-label="Đóng"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        <div className="space-y-2">
                          {apt.questions.map((q) => (
                            <div
                              key={q.id}
                              onClick={() => handleToggleQuestion(apt.id, q.id)}
                              className="flex items-start gap-2.5 p-3 bg-nova-surface rounded-xl border border-nova-border cursor-pointer hover:border-nova-taupe"
                            >
                              <div
                                className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                  q.isAnswered
                                    ? 'bg-nova-sage border-nova-sage text-nova-accent-contrast'
                                    : 'border-nova-taupe bg-nova-bg-subtle'
                                }`}
                              >
                                {q.isAnswered && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <div className="flex-1">
                                <p
                                  className={`text-xs ${
                                    q.isAnswered
                                      ? 'line-through text-nova-text-muted'
                                      : 'text-nova-text font-medium'
                                  }`}
                                >
                                  {q.question}
                                </p>
                                {q.answerNotes && (
                                  <p className="text-[11px] text-nova-sage-text font-semibold mt-1">
                                    Bác sĩ giải đáp: {q.answerNotes}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {apt.resultsSummary && (
                        <div className="p-3.5 bg-nova-sage-soft rounded-2xl border border-nova-success-border text-xs text-nova-sage-text">
                          <strong className="font-semibold block mb-1">Kết quả sau khám:</strong>
                          {apt.resultsSummary}
                        </div>
                      )}

                      {apt.status === 'upcoming' && (
                        <div className="pt-2">
                          <button
                            onClick={() => setCompletingApt(apt)}
                            className="w-full py-3 bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
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

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1B18]/60 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-nova-surface rounded-3xl p-5 border border-nova-border shadow-2xl space-y-3">
              <h4 className="font-editorial text-base font-semibold text-nova-text">
                Xóa lịch khám này?
              </h4>
              <p className="text-xs text-nova-text-muted">
                Mẹ có chắc muốn xóa lịch khám thai và danh sách câu hỏi kèm theo không?
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-nova-border text-xs font-semibold text-nova-text-muted cursor-pointer min-h-[44px]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmDeleteAppointment(confirmDeleteId)}
                  className="flex-1 py-2.5 rounded-xl bg-nova-danger text-[#FAF9F6] text-xs font-semibold cursor-pointer min-h-[44px]"
                >
                  Xóa lịch
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Add appointment modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-[#1C1B18]/60 backdrop-blur-xs cursor-pointer"
            />
            <motion.form
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onSubmit={handleCreateAppointment}
              className="relative w-full max-w-[460px] bg-nova-surface rounded-3xl p-6 shadow-2xl z-10 border border-nova-border flex flex-col gap-3.5"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-nova-border">
                <h3 className="font-editorial text-lg font-semibold text-nova-text">Đặt lịch khám thai mới</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  aria-label="Đóng"
                  className="w-8 h-8 rounded-full bg-nova-bg-subtle text-nova-icon flex items-center justify-center hover:bg-nova-accent-soft cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-nova-text block mb-1">
                  Tên buổi khám / Mốc tuần thai *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Siêu âm 4D tuần 22 hoặc tái khám định kỳ"
                  className="w-full bg-nova-bg-subtle border border-nova-border rounded-xl px-3 py-2 text-[16px] sm:text-xs text-nova-text focus:outline-none focus:border-nova-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-nova-text block mb-1">Ngày khám *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-nova-bg-subtle border border-nova-border rounded-xl px-3 py-2 text-[16px] sm:text-xs text-nova-text focus:outline-none focus:border-nova-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-nova-text block mb-1">Giờ khám *</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-nova-bg-subtle border border-nova-border rounded-xl px-3 py-2 text-[16px] sm:text-xs text-nova-text focus:outline-none focus:border-nova-accent"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-nova-text block mb-1">
                  Bệnh viện / Phòng khám *
                </label>
                <input
                  type="text"
                  required
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder="Ví dụ: Bệnh viện Phụ Sản Từ Dũ hoặc phòng khám bác sĩ"
                  className="w-full bg-nova-bg-subtle border border-nova-border rounded-xl px-3 py-2 text-[16px] sm:text-xs text-nova-text focus:outline-none focus:border-nova-accent"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-nova-text block mb-1">
                  Bác sĩ phụ trách (tùy chọn)
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Ví dụ: BS. CKII Nguyễn Thị Kim Ánh"
                  className="w-full bg-nova-bg-subtle border border-nova-border rounded-xl px-3 py-2 text-[16px] sm:text-xs text-nova-text focus:outline-none focus:border-nova-accent"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-nova-text block mb-1">
                  Ghi chú chuẩn bị (tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ví dụ: Nhịn ăn sáng để xét nghiệm máu, mang theo sổ khám cũ..."
                  className="w-full bg-nova-bg-subtle border border-nova-border rounded-xl px-3 py-2 text-[16px] sm:text-xs text-nova-text focus:outline-none focus:border-nova-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-nova-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-nova-text-muted hover:text-nova-text cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Lưu lịch khám
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Complete appointment modal */}
      <AnimatePresence>
        {completingApt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCompletingApt(null)}
              className="fixed inset-0 bg-[#1C1B18]/60 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-[440px] bg-nova-surface rounded-3xl p-6 shadow-2xl z-10 border border-nova-border flex flex-col gap-3.5"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-nova-border">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-nova-sage-text" />
                  <h3 className="font-editorial text-lg font-semibold text-nova-text">
                    Hoàn thành khám thai
                  </h3>
                </div>
                <button
                  onClick={() => setCompletingApt(null)}
                  aria-label="Đóng"
                  className="w-8 h-8 rounded-full bg-nova-bg-subtle text-nova-icon flex items-center justify-center hover:bg-nova-accent-soft cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-nova-text-muted">
                Mẹ hãy ghi chú tóm tắt kết quả (cân nặng em bé, tim thai, lời dặn của bác sĩ...) để lưu lại kỷ niệm:
              </p>

              <textarea
                rows={3}
                value={resultsSummary}
                onChange={(e) => setResultsSummary(e.target.value)}
                placeholder="Ví dụ: Bé phát triển đúng chuẩn tuần thai, tim thai 145 nhịp/phút, bác sĩ dặn uống thêm canxi và hẹn 4 tuần nữa tái khám..."
                className="w-full bg-nova-bg-subtle border border-nova-border rounded-xl p-3 text-[16px] sm:text-xs text-nova-text focus:outline-none focus:border-nova-sage"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-nova-border">
                <button
                  type="button"
                  onClick={() => setCompletingApt(null)}
                  className="px-4 py-2 text-xs font-semibold text-nova-text-muted hover:text-nova-text cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmComplete}
                  className="px-5 py-2.5 bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast rounded-xl text-xs font-semibold cursor-pointer"
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
