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

  const handleDeleteAppointment = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch khám thai này không?')) {
      const updated = storageService.deletePrenatalAppointment(id);
      setAppointments(updated);
      triggerToast('Đã xóa lịch khám');
    }
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
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#3A2E2B] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg border border-white/10"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner & Action */}
      <div className="bg-white rounded-3xl p-5 border border-[#F0ECE9] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#FCEEEB] text-[#C84B4B] flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#3A2E2B]">Sổ theo dõi Lịch khám thai</h3>
            <p className="text-[11px] text-[#8C7B75]">
              Chuẩn 6 mốc vàng tầm soát của Bộ Y tế
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#C84B4B] hover:bg-[#B33E3E] text-white rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Đặt lịch khám</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-[#F5F0EB] rounded-2xl">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-white text-[#3A2E2B] shadow-xs'
              : 'text-[#8C7B75] hover:text-[#3A2E2B]'
          }`}
        >
          Lịch khám sắp tới ({appointments.filter((a) => a.status === 'upcoming').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-white text-[#3A2E2B] shadow-xs'
              : 'text-[#8C7B75] hover:text-[#3A2E2B]'
          }`}
        >
          Đã khám xong ({appointments.filter((a) => a.status === 'completed').length})
        </button>
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-[#8C7B75] border border-[#F0ECE9]">
            <Calendar className="w-8 h-8 mx-auto text-[#DDD6CF] mb-2" />
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
                className="bg-white rounded-3xl border border-[#F0ECE9] shadow-xs overflow-hidden transition-all"
              >
                {/* Main Card Header */}
                <div
                  onClick={() => setExpandedAptId(isExpanded ? null : apt.id)}
                  className="p-5 cursor-pointer hover:bg-[#FFFDFB] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {apt.weekRecommended && (
                          <span className="text-[10px] font-bold text-[#C84B4B] bg-[#FCEEEB] px-2 py-0.5 rounded-full">
                            Tuần {apt.weekRecommended}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          apt.status === 'completed'
                            ? 'bg-[#EAFBF0] text-[#27AE60]'
                            : 'bg-[#FEF5E7] text-[#E67E22]'
                        }`}>
                          {apt.status === 'completed' ? 'Đã hoàn thành' : 'Sắp tới'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#3A2E2B] leading-snug">
                        {apt.title}
                      </h4>
                    </div>
                    <button
                      onClick={(e) => handleDeleteAppointment(apt.id, e)}
                      className="p-1.5 text-[#BBB0A8] hover:text-[#C84B4B] transition-colors cursor-pointer"
                      title="Xóa lịch khám"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Date, Time, Clinic */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#6E5D57] pt-2 border-t border-[#FAF6F3]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#C84B4B]" />
                      <span className="font-semibold">{apt.date} ({apt.time})</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#2980B9]" />
                      <span className="truncate">{apt.hospitalOrClinic}</span>
                    </div>
                  </div>

                  {/* Doctor & Question Counter Preview */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#FAF6F3] text-[11px]">
                    <div className="flex items-center gap-1.5 text-[#8C7B75]">
                      <User className="w-3.5 h-3.5" />
                      <span>{apt.doctorName || 'Bác sĩ sản khoa phụ trách'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#C84B4B]">
                        {answeredCount}/{apt.questions.length} câu hỏi đã giải đáp
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#8C7B75]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#8C7B75]" />
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
                      className="border-t border-[#F0ECE9] bg-[#FAF8F5] p-5 space-y-4"
                    >
                      {/* Clinical Notes */}
                      {apt.notes && (
                        <div className="p-3 bg-white rounded-2xl border border-[#EFEAE5] text-xs text-[#6E5D57] leading-relaxed">
                          <strong className="text-[#3A2E2B] font-bold block mb-1">
                            Lưu ý chuẩn bị trước khi khám:
                          </strong>
                          {apt.notes}
                        </div>
                      )}

                      {/* Doctor Questions Checklist */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-xs font-bold text-[#3A2E2B] flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-[#C84B4B]" />
                            <span>Danh sách câu hỏi cần hỏi bác sĩ:</span>
                          </h5>
                          <button
                            onClick={() => setActiveQuestionAptId(apt.id)}
                            className="text-[11px] font-bold text-[#C84B4B] hover:underline cursor-pointer"
                          >
                            + Thêm câu hỏi
                          </button>
                        </div>

                        {/* Add question inline input */}
                        {activeQuestionAptId === apt.id && (
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="text"
                              value={newQuestionText}
                              onChange={(e) => setNewQuestionText(e.target.value)}
                              placeholder="Nhập câu hỏi mẹ muốn hỏi bác sĩ..."
                              className="flex-1 bg-white border border-[#EFEAE5] rounded-xl px-3 py-1.5 text-[16px] sm:text-xs text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                            />
                            <button
                              onClick={() => handleAddQuestion(apt.id)}
                              className="px-3 py-1.5 bg-[#C84B4B] text-white rounded-xl text-xs font-bold cursor-pointer"
                            >
                              Thêm
                            </button>
                            <button
                              onClick={() => setActiveQuestionAptId(null)}
                              className="p-1 text-[#8C7B75] hover:text-[#3A2E2B] cursor-pointer"
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
                              className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-[#EFEAE5] cursor-pointer hover:border-[#DDD6CF]"
                            >
                              <div
                                className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                  q.isAnswered
                                    ? 'bg-[#27AE60] border-[#27AE60] text-white'
                                    : 'border-[#CCC3BD] bg-white'
                                }`}
                              >
                                {q.isAnswered && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <div className="flex-1">
                                <p
                                  className={`text-xs ${
                                    q.isAnswered
                                      ? 'line-through text-[#8C7B75]'
                                      : 'text-[#3A2E2B] font-medium'
                                  }`}
                                >
                                  {q.question}
                                </p>
                                {q.answerNotes && (
                                  <p className="text-[11px] text-[#27AE60] font-semibold mt-1">
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
                        <div className="p-3 bg-[#EAFBF0] rounded-2xl border border-[#CDEED6] text-xs text-[#27AE60]">
                          <strong className="font-bold block mb-1">Kết quả sau khám:</strong>
                          {apt.resultsSummary}
                        </div>
                      )}

                      {/* Action buttons */}
                      {apt.status === 'upcoming' && (
                        <div className="pt-2">
                          <button
                            onClick={() => setCompletingApt(apt)}
                            className="w-full py-2.5 bg-[#27AE60] hover:bg-[#219653] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
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

      {/* Modal Đặt Lịch Khám Mới */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
            />
            <motion.form
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onSubmit={handleCreateAppointment}
              className="relative w-full max-w-[460px] bg-white rounded-3xl p-6 shadow-2xl z-10 border border-[#F0ECE9] flex flex-col gap-3.5"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE9]">
                <h3 className="text-base font-bold text-[#3A2E2B]">Đặt lịch khám thai mới</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-[#FAF6F3] text-[#8C7B75] flex items-center justify-center hover:bg-[#EFEAE5] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-[#3A2E2B] block mb-1">
                  Tên buổi khám / Mốc tuần thai *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Siêu âm 4D tuần 22 hoặc Tái khám định kỳ"
                  className="w-full bg-[#FAF6F3] border border-[#EFEAE5] rounded-xl px-3 py-2 text-[16px] sm:text-xs text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[#3A2E2B] block mb-1">Ngày khám *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#FAF6F3] border border-[#EFEAE5] rounded-xl px-3 py-2 text-[16px] sm:text-xs text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#3A2E2B] block mb-1">Giờ khám *</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-[#FAF6F3] border border-[#EFEAE5] rounded-xl px-3 py-2 text-[16px] sm:text-xs text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#3A2E2B] block mb-1">
                  Bệnh viện / Phòng khám *
                </label>
                <input
                  type="text"
                  required
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder="VD: Bệnh viện Phụ Sản Từ Dũ hoặc Phòng khám Bác sĩ"
                  className="w-full bg-[#FAF6F3] border border-[#EFEAE5] rounded-xl px-3 py-2 text-[16px] sm:text-xs text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#3A2E2B] block mb-1">
                  Bác sĩ phụ trách (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="VD: BS. CKII Nguyễn Thị Kim Ánh"
                  className="w-full bg-[#FAF6F3] border border-[#EFEAE5] rounded-xl px-3 py-2 text-[16px] sm:text-xs text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#3A2E2B] block mb-1">
                  Ghi chú chuẩn bị (Tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="VD: Nhịn ăn sáng để xét nghiệm máu, mang theo sổ khám cũ..."
                  className="w-full bg-[#FAF6F3] border border-[#EFEAE5] rounded-xl px-3 py-2 text-[16px] sm:text-xs text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0ECE9]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#8C7B75] hover:text-[#3A2E2B] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C84B4B] hover:bg-[#B33E3E] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
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
              className="fixed inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-[440px] bg-white rounded-3xl p-6 shadow-2xl z-10 border border-[#F0ECE9] flex flex-col gap-3.5"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE9]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#27AE60]" />
                  <h3 className="text-base font-bold text-[#3A2E2B]">Hoàn thành khám thai</h3>
                </div>
                <button
                  onClick={() => setCompletingApt(null)}
                  className="w-8 h-8 rounded-full bg-[#FAF6F3] text-[#8C7B75] flex items-center justify-center hover:bg-[#EFEAE5] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#6E5D57]">
                Mẹ hãy ghi chú tóm tắt kết quả (cân nặng em bé, tim thai, lời dặn của bác sĩ...) để lưu lại kỷ niệm:
              </p>

              <textarea
                rows={3}
                value={resultsSummary}
                onChange={(e) => setResultsSummary(e.target.value)}
                placeholder="VD: Bé phát triển đúng chuẩn tuần thai, tim thai 145 ck/phút, bác sĩ dặn uống thêm canxi và hẹn 4 tuần nữa tái khám..."
                className="w-full bg-[#FAF6F3] border border-[#EFEAE5] rounded-xl p-3 text-[16px] sm:text-xs text-[#3A2E2B] focus:outline-none focus:border-[#27AE60]"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0ECE9]">
                <button
                  type="button"
                  onClick={() => setCompletingApt(null)}
                  className="px-4 py-2 text-xs font-bold text-[#8C7B75] hover:text-[#3A2E2B] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmComplete}
                  className="px-5 py-2 bg-[#27AE60] hover:bg-[#219653] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
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
