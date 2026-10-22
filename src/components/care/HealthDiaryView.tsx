import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Smile,
  Activity,
  Scale,
  Plus,
  Trash2,
  Calendar,
  Save,
  CheckCircle2,
  Info,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Stethoscope,
} from 'lucide-react';
import {
  HealthDiaryEntry,
  SymptomLog,
  SymptomSeverity,
  MoodType,
  WeightLog,
} from '../../types';
import { storageService, getTodayDateString } from '../../services/storageService';

interface HealthDiaryViewProps {
  selectedDate: string;
}

export const HealthDiaryView: React.FC<HealthDiaryViewProps> = ({ selectedDate }) => {
  const [diaryEntry, setDiaryEntry] = useState<HealthDiaryEntry>(() =>
    storageService.getHealthDiaryEntry(selectedDate)
  );
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>(() =>
    storageService.loadWeightLogs()
  );

  // New symptom form states
  const [showAddSymptom, setShowAddSymptom] = useState(false);
  const [symptomName, setSymptomName] = useState('');
  const [symptomSeverity, setSymptomSeverity] = useState<SymptomSeverity>('mild');
  const [symptomNote, setSymptomNote] = useState('');

  // Weight form states
  const [inputWeight, setInputWeight] = useState<string>(
    diaryEntry.weightKg ? diaryEntry.weightKg.toString() : ''
  );
  const [doctorNotes, setDoctorNotes] = useState<string>(
    diaryEntry.doctorAdviceNotes || ''
  );
  const [moodNote, setMoodNote] = useState<string>(diaryEntry.moodNote || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  useEffect(() => {
    const entry = storageService.getHealthDiaryEntry(selectedDate);
    setDiaryEntry(entry);
    setInputWeight(entry.weightKg ? entry.weightKg.toString() : '');
    setDoctorNotes(entry.doctorAdviceNotes || '');
    setMoodNote(entry.moodNote || '');
    setWeightLogs(storageService.loadWeightLogs());
  }, [selectedDate]);

  const moods: { type: MoodType; label: string; emoji: string; color: string }[] = [
    { type: 'happy', label: 'Rất vui', emoji: '😊', color: '#F39C12' },
    { type: 'calm', label: 'Bình an', emoji: '😌', color: '#27AE60' },
    { type: 'tired', label: 'Mệt mỏi', emoji: '🥱', color: '#8E44AD' },
    { type: 'excited', label: 'Háo hức', emoji: '🥰', color: '#C84B4B' },
    { type: 'anxious', label: 'Lo âu', emoji: '🥺', color: '#E67E22' },
    { type: 'nauseous', label: 'Nghén nôn', emoji: '🤢', color: '#16A085' },
  ];

  const commonSymptoms = [
    'Buồn nôn / Nôn khan',
    'Đau mỏi thắt lưng',
    'Ợ nóng / Trào ngược',
    'Chuột rút bắp chân',
    'Khó ngủ / Tỉnh giấc đêm',
    'Phù nhẹ mu bàn chân',
    'Táo bón thai kỳ',
    'Căng tức ngực',
    'Chóng mặt khi đứng dậy',
  ];

  const handleSelectMood = (mood: MoodType) => {
    const updated = storageService.updateMoodInDiary(selectedDate, mood, moodNote);
    setDiaryEntry(updated);
    triggerToast('Đã lưu trạng thái tâm trạng!');
  };

  const handleSaveMoodNote = () => {
    if (!diaryEntry.mood) return;
    const updated = storageService.updateMoodInDiary(selectedDate, diaryEntry.mood, moodNote);
    setDiaryEntry(updated);
    triggerToast('Đã lưu chia sẻ cảm xúc!');
  };

  const handleAddSymptom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomName.trim()) {
      triggerToast('Vui lòng chọn hoặc nhập tên triệu chứng');
      return;
    }

    const updated = storageService.addSymptomToDiary(selectedDate, {
      name: symptomName.trim(),
      severity: symptomSeverity,
      notes: symptomNote.trim() || undefined,
    });

    setDiaryEntry(updated);
    setSymptomName('');
    setSymptomNote('');
    setShowAddSymptom(false);
    triggerToast('Đã ghi nhận triệu chứng!');
  };

  const handleRemoveSymptom = (symptomId: string) => {
    const updated = storageService.removeSymptomFromDiary(selectedDate, symptomId);
    setDiaryEntry(updated);
    triggerToast('Đã xóa triệu chứng');
  };

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputWeight);
    if (isNaN(val) || val < 30 || val > 160) {
      triggerToast('Vui lòng nhập cân nặng hợp lệ (30kg - 160kg)');
      return;
    }

    const updated = storageService.updateWeightInDiary(selectedDate, val);
    setDiaryEntry(updated);
    setWeightLogs(storageService.loadWeightLogs());
    triggerToast(`Đã lưu cân nặng ${val} kg!`);
  };

  const handleSaveDoctorNotes = () => {
    const updated = storageService.saveHealthDiaryEntry({
      ...diaryEntry,
      doctorAdviceNotes: doctorNotes,
    });
    setDiaryEntry(updated);
    triggerToast('Đã lưu lời dặn của bác sĩ!');
  };

  const initialWeight = 50.0; // Pre-pregnancy baseline
  const currentRecordedWeight = diaryEntry.weightKg || (weightLogs[0]?.weightKg ?? initialWeight);
  const totalGain = (currentRecordedWeight - initialWeight).toFixed(1);

  return (
    <div className="flex flex-col gap-5 pb-6">
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

      {/* 1. Tâm trạng & Cảm xúc */}
      <section className="bg-white rounded-3xl p-5 border border-[#F0ECE9] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FEF5E7] text-[#F39C12] flex items-center justify-center">
              <Smile className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#3A2E2B]">Cảm xúc & Tâm trạng</h3>
              <p className="text-[11px] text-[#8C7B75]">Hôm nay mẹ cảm thấy thế nào?</p>
            </div>
          </div>
          {diaryEntry.mood && (
            <span className="text-[11px] font-bold text-[#27AE60] bg-[#EAFBF0] px-2.5 py-1 rounded-full">
              Đã ghi nhận
            </span>
          )}
        </div>

        {/* Mood Selector Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {moods.map((m) => {
            const isSelected = diaryEntry.mood === m.type;
            return (
              <button
                key={m.type}
                onClick={() => handleSelectMood(m.type)}
                className={`flex flex-col items-center justify-center py-2.5 px-1.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFF6F4] border-[#C84B4B] shadow-xs scale-102 ring-1 ring-[#C84B4B]/30'
                    : 'bg-[#FAF6F3] border-transparent hover:border-[#E8DFD8]'
                }`}
              >
                <span className="text-2xl mb-1">{m.emoji}</span>
                <span className={`text-[11px] ${isSelected ? 'font-bold text-[#C84B4B]' : 'font-medium text-[#6E5D57]'}`}>
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mood Notes Input */}
        <div className="mt-3.5 pt-3 border-t border-[#F5EFEA]">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="Viết đôi dòng nhật ký cảm xúc hôm nay..."
              className="flex-1 bg-[#FAF6F3] border border-[#EFEAE5] rounded-xl px-3 py-2 text-[16px] sm:text-[13px] text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
            />
            <button
              onClick={handleSaveMoodNote}
              className="px-3.5 py-2 bg-[#3A2E2B] hover:bg-[#2A2321] text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer"
            >
              Lưu
            </button>
          </div>
        </div>
      </section>

      {/* 2. Theo dõi Triệu chứng cơ thể */}
      <section className="bg-white rounded-3xl p-5 border border-[#F0ECE9] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FCEEEB] text-[#C84B4B] flex items-center justify-center">
              <Activity className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#3A2E2B]">Triệu chứng cơ thể</h3>
              <p className="text-[11px] text-[#8C7B75]">
                {diaryEntry.symptoms.length > 0
                  ? `${diaryEntry.symptoms.length} triệu chứng được ghi nhận`
                  : 'Chưa có triệu chứng bất thường nào'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddSymptom(!showAddSymptom)}
            className="flex items-center gap-1 text-xs font-bold text-[#C84B4B] bg-[#FCEEEB] hover:bg-[#F8DDD7] px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm triệu chứng</span>
          </button>
        </div>

        {/* Add Symptom Drawer/Form */}
        <AnimatePresence>
          {showAddSymptom && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddSymptom}
              className="bg-[#FFF9F6] border border-[#F5DDD7] rounded-2xl p-4 mb-4 flex flex-col gap-3"
            >
              <h4 className="text-xs font-bold text-[#3A2E2B]">Ghi nhận triệu chứng mới:</h4>

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1.5">
                {commonSymptoms.map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setSymptomName(sym)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                      symptomName === sym
                        ? 'bg-[#C84B4B] text-white border-[#C84B4B]'
                        : 'bg-white text-[#6E5D57] border-[#EAE3DE] hover:border-[#C84B4B]'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <input
                type="text"
                value={symptomName}
                onChange={(e) => setSymptomName(e.target.value)}
                placeholder="Hoặc tự nhập tên triệu chứng..."
                className="w-full bg-white border border-[#EFEAE5] rounded-xl px-3 py-2 text-[16px] sm:text-[13px] text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
              />

              {/* Severity Level */}
              <div>
                <label className="text-[11px] font-semibold text-[#6E5D57] block mb-1.5">
                  Mức độ khó chịu:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['mild', 'moderate', 'severe'] as SymptomSeverity[]).map((lvl) => {
                    const labels: Record<SymptomSeverity, { text: string; bg: string }> = {
                      mild: { text: 'Nhẹ (Thoáng qua)', bg: 'text-[#27AE60]' },
                      moderate: { text: 'Vừa (Cần nghỉ ngơi)', bg: 'text-[#E67E22]' },
                      severe: { text: 'Nặng (Rất khó chịu)', bg: 'text-[#C84B4B]' },
                    };
                    const isSel = symptomSeverity === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSymptomSeverity(lvl)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          isSel
                            ? 'bg-white border-[#C84B4B] shadow-xs ring-1 ring-[#C84B4B]/30'
                            : 'bg-white/70 border-[#EAE3DE] text-[#6E5D57]'
                        }`}
                      >
                        <span className={labels[lvl].bg}>{labels[lvl].text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <input
                type="text"
                value={symptomNote}
                onChange={(e) => setSymptomNote(e.target.value)}
                placeholder="Ghi chú thêm (thời điểm xuất hiện, cách giảm...)"
                className="w-full bg-white border border-[#EFEAE5] rounded-xl px-3 py-2 text-[16px] sm:text-[13px] text-[#3A2E2B] focus:outline-none focus:border-[#C84B4B]"
              />

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddSymptom(false)}
                  className="px-3 py-1.5 text-xs text-[#8C7B75] hover:text-[#3A2E2B] font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#C84B4B] hover:bg-[#B33E3E] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Lưu triệu chứng
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Recorded Symptoms List */}
        {diaryEntry.symptoms.length === 0 ? (
          <div className="py-6 text-center text-[#8C7B75]">
            <p className="text-xs">Chưa có triệu chứng khó chịu nào được lưu trong ngày hôm nay.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {diaryEntry.symptoms.map((sym) => {
              const severityBadge = {
                mild: { text: 'Mức độ nhẹ', color: 'bg-[#EAFBF0] text-[#27AE60] border-[#D1F2D9]' },
                moderate: { text: 'Mức độ vừa', color: 'bg-[#FEF5E7] text-[#E67E22] border-[#FCE6CA]' },
                severe: { text: 'Mức độ nặng', color: 'bg-[#FCEEEB] text-[#C84B4B] border-[#F5DDD7]' },
              }[sym.severity];

              return (
                <div
                  key={sym.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF6F3] border border-[#F0ECE9]"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#3A2E2B] truncate">{sym.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severityBadge.color}`}>
                        {severityBadge.text}
                      </span>
                    </div>
                    {sym.notes && (
                      <p className="text-[11px] text-[#6E5D57] mt-0.5 leading-snug">{sym.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveSymptom(sym.id)}
                    className="p-1.5 text-[#BBB0A8] hover:text-[#C84B4B] transition-colors cursor-pointer"
                    title="Xóa triệu chứng"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Theo dõi Cân nặng & Biểu đồ chuẩn Bộ Y tế */}
      <section className="bg-white rounded-3xl p-5 border border-[#F0ECE9] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EBF5FB] text-[#2980B9] flex items-center justify-center">
              <Scale className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#3A2E2B]">Cân nặng mẹ bầu</h3>
              <p className="text-[11px] text-[#8C7B75]">
                Chuẩn tăng cân theo khuyến cáo Bộ Y tế & WHO
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-[#2980B9]">
              {Number(totalGain) >= 0 ? `+${totalGain} kg` : `${totalGain} kg`}
            </span>
            <span className="text-[10px] text-[#8C7B75] block">so với đầu thai kỳ</span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSaveWeight} className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <input
              type="number"
              step="0.1"
              value={inputWeight}
              onChange={(e) => setInputWeight(e.target.value)}
              placeholder="VD: 54.5"
              className="w-full bg-[#FAF6F3] border border-[#EFEAE5] rounded-xl px-3 py-2 pr-10 text-[16px] sm:text-[14px] font-bold text-[#3A2E2B] focus:outline-none focus:border-[#2980B9]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8C7B75]">
              kg
            </span>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#2980B9] hover:bg-[#20638F] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            Lưu cân nặng
          </button>
        </form>

        {/* Clinical Guideline Pill */}
        <div className="p-3 rounded-2xl bg-[#F0F8FF] border border-[#D5EAF8] mb-3 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#2980B9] shrink-0 mt-0.5" />
          <div className="text-[11px] text-[#2C3E50] leading-relaxed">
            <strong className="font-bold">Mức tăng cân chuẩn:</strong> Mẹ có BMI bình thường nên tăng từ{' '}
            <span className="font-bold text-[#2980B9]">10 - 12.5 kg</span> trong suốt thai kỳ (khoảng 0.4 - 0.5 kg/tuần ở tam cá nguyệt 2 và 3).
          </div>
        </div>

        {/* Recent Weight Records */}
        <div className="space-y-1.5">
          <h4 className="text-[11px] font-bold text-[#8C7B75] uppercase tracking-wider">
            Lịch sử các lần cân gần đây:
          </h4>
          <div className="divide-y divide-[#F5EFEA]">
            {weightLogs.slice(0, 4).map((w) => (
              <div key={w.id} className="py-2 flex items-center justify-between text-xs">
                <span className="text-[#6E5D57] font-medium">
                  {w.date} {w.week ? `(Tuần ${w.week})` : ''}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#3A2E2B] tabular-nums">{w.weightKg} kg</span>
                  <span className="text-[10px] text-[#27AE60] font-bold tabular-nums">
                    +{(w.weightKg - initialWeight).toFixed(1)}kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Lời dặn & Ghi chú từ Bác sĩ */}
      <section className="bg-white rounded-3xl p-5 border border-[#F0ECE9] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E8F8F5] text-[#16A085] flex items-center justify-center">
              <Stethoscope className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#3A2E2B]">Lời dặn của Bác sĩ</h3>
              <p className="text-[11px] text-[#8C7B75]">Ghi chú đơn thuốc hoặc chỉ định thăm khám</p>
            </div>
          </div>
          <button
            onClick={handleSaveDoctorNotes}
            className="flex items-center gap-1 text-xs font-bold text-white bg-[#16A085] hover:bg-[#117A65] px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu dặn dò</span>
          </button>
        </div>

        <textarea
          rows={3}
          value={doctorNotes}
          onChange={(e) => setDoctorNotes(e.target.value)}
          placeholder="VD: Bác sĩ dặn uống bổ sung viên sắt vào buổi sáng sau ăn 1 giờ, tránh uống cùng canxi hoặc sữa..."
          className="w-full bg-[#FAF6F3] border border-[#EFEAE5] rounded-2xl p-3 text-[16px] sm:text-[13px] text-[#3A2E2B] leading-relaxed focus:outline-none focus:border-[#16A085]"
        />
      </section>
    </div>
  );
};
