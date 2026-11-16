import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smile,
  Activity,
  Scale,
  Plus,
  Trash2,
  Save,
  Info,
  Stethoscope,
  Moon,
  Utensils,
  FileText,
  ShieldAlert,
  Baby,
} from 'lucide-react';
import {
  HealthDiaryEntry,
  SymptomSeverity,
  MoodType,
  WeightLog,
  SleepQuality,
  NutritionLog,
  UserProfile,
} from '../../types';
import { storageService } from '../../services/storageService';
import { apiService } from '../../services/apiService';

interface HealthDiaryViewProps {
  selectedDate: string;
  user?: UserProfile;
}

export const HealthDiaryView: React.FC<HealthDiaryViewProps> = ({ selectedDate, user }) => {
  const [diaryEntry, setDiaryEntry] = useState<HealthDiaryEntry>(() =>
    storageService.getHealthDiaryEntry(selectedDate)
  );
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>(() =>
    storageService.loadWeightLogs()
  );

  const [showAddSymptom, setShowAddSymptom] = useState(false);
  const [symptomName, setSymptomName] = useState('');
  const [symptomSeverity, setSymptomSeverity] = useState<SymptomSeverity>('mild');
  const [symptomNote, setSymptomNote] = useState('');

  const [inputWeight, setInputWeight] = useState<string>(
    diaryEntry.weightKg ? diaryEntry.weightKg.toString() : ''
  );
  const [doctorNotes, setDoctorNotes] = useState<string>(
    diaryEntry.doctorAdviceNotes || ''
  );
  const [moodNote, setMoodNote] = useState<string>(diaryEntry.moodNote || '');

  const [sleepHours, setSleepHours] = useState<string>(
    diaryEntry.sleepHours !== undefined ? String(diaryEntry.sleepHours) : ''
  );
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>(
    diaryEntry.sleepQuality || 'good'
  );
  const [sleepNote, setSleepNote] = useState<string>(diaryEntry.sleepNote || '');

  const [showAddNutrition, setShowAddNutrition] = useState(false);
  const [mealType, setMealType] = useState<NutritionLog['mealType']>('morning');
  const [mealDesc, setMealDesc] = useState('');
  const [mealTime, setMealTime] = useState('08:00');

  const [activityNotes, setActivityNotes] = useState<string>(diaryEntry.activityNotes || '');
  const [personalNotes, setPersonalNotes] = useState<string>(diaryEntry.personalNotes || '');
  const [kickCount, setKickCount] = useState<string>(
    diaryEntry.fetalKickCount !== undefined ? String(diaryEntry.fetalKickCount) : ''
  );

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2600);
  };

  const syncToServer = (entry: HealthDiaryEntry) => {
    apiService.upsertDiaryEntry(selectedDate, entry, user).catch(() => {});
  };

  const hydrateFromEntry = (entry: HealthDiaryEntry) => {
    setDiaryEntry(entry);
    setInputWeight(entry.weightKg ? entry.weightKg.toString() : '');
    setDoctorNotes(entry.doctorAdviceNotes || '');
    setMoodNote(entry.moodNote || '');
    setSleepHours(entry.sleepHours !== undefined ? String(entry.sleepHours) : '');
    setSleepQuality(entry.sleepQuality || 'good');
    setSleepNote(entry.sleepNote || '');
    setActivityNotes(entry.activityNotes || '');
    setPersonalNotes(entry.personalNotes || '');
    setKickCount(entry.fetalKickCount !== undefined ? String(entry.fetalKickCount) : '');
  };

  useEffect(() => {
    const local = storageService.getHealthDiaryEntry(selectedDate);
    hydrateFromEntry(local);
    setWeightLogs(storageService.loadWeightLogs());

    apiService
      .fetchDiary(user)
      .then((res) => {
        if (res.entries && res.entries[selectedDate]) {
          const merged = storageService.saveHealthDiaryEntry({
            ...local,
            ...res.entries[selectedDate],
          });
          hydrateFromEntry(merged);
        }
      })
      .catch(() => {});
  }, [selectedDate, user?.id]);

  const moods: { type: MoodType; label: string; emoji: string }[] = [
    { type: 'happy', label: 'Rất vui', emoji: '😊' },
    { type: 'calm', label: 'Bình an', emoji: '😌' },
    { type: 'tired', label: 'Mệt mỏi', emoji: '🥱' },
    { type: 'excited', label: 'Háo hức', emoji: '🥰' },
    { type: 'anxious', label: 'Lo âu', emoji: '🥺' },
    { type: 'nauseous', label: 'Nghén nôn', emoji: '🤢' },
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
    syncToServer(updated);
    triggerToast('Đã lưu trạng thái tâm trạng!');
  };

  const handleSaveMoodNote = () => {
    const updated = storageService.updateMoodInDiary(
      selectedDate,
      diaryEntry.mood || 'calm',
      moodNote
    );
    setDiaryEntry(updated);
    syncToServer(updated);
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
    syncToServer(updated);
    setSymptomName('');
    setSymptomNote('');
    setShowAddSymptom(false);
    triggerToast('Đã ghi nhận triệu chứng!');
  };

  const handleRemoveSymptom = (symptomId: string) => {
    const updated = storageService.removeSymptomFromDiary(selectedDate, symptomId);
    setDiaryEntry(updated);
    syncToServer(updated);
    triggerToast('Đã xóa triệu chứng');
  };

  const handleSaveSleep = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = parseFloat(sleepHours);
    if (isNaN(hours) || hours < 0 || hours > 24) {
      triggerToast('Vui lòng nhập số giờ ngủ hợp lệ (0 - 24 giờ)');
      return;
    }
    const updated = storageService.updateSleepInDiary(selectedDate, {
      sleepHours: hours,
      sleepQuality,
      sleepNote: sleepNote.trim() || undefined,
    });
    setDiaryEntry(updated);
    syncToServer(updated);
    triggerToast(`Đã lưu giấc ngủ ${hours} giờ!`);
  };

  const handleAddNutrition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealDesc.trim()) {
      triggerToast('Vui lòng nhập món ăn hoặc vitamin đã bổ sung');
      return;
    }
    const updated = storageService.addNutritionLogToDiary(selectedDate, {
      mealType,
      description: mealDesc.trim(),
      time: mealTime || '08:00',
    });
    setDiaryEntry(updated);
    syncToServer(updated);
    setMealDesc('');
    setShowAddNutrition(false);
    triggerToast('Đã thêm nhật ký dinh dưỡng!');
  };

  const handleRemoveNutrition = (logId: string) => {
    const updated = storageService.removeNutritionLogFromDiary(selectedDate, logId);
    setDiaryEntry(updated);
    syncToServer(updated);
    triggerToast('Đã xóa mục dinh dưỡng');
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
    syncToServer(updated);
    triggerToast(`Đã lưu cân nặng ${val} kg!`);
  };

  const handleSaveAllNotes = () => {
    const parsedKicks = kickCount.trim() ? Math.max(0, parseInt(kickCount, 10) || 0) : undefined;
    const updated = storageService.updateDiaryNotes(selectedDate, {
      activityNotes: activityNotes.trim(),
      personalNotes: personalNotes.trim(),
      doctorAdviceNotes: doctorNotes.trim(),
      fetalKickCount: parsedKicks,
    });
    setDiaryEntry(updated);
    syncToServer(updated);
    triggerToast('Đã lưu ghi chú & lời dặn bác sĩ!');
  };

  const handleDeleteDayDiary = async () => {
    storageService.deleteHealthDiaryEntry(selectedDate);
    try {
      await apiService.deleteDiaryDate(selectedDate, user);
    } catch {}
    const fresh = storageService.getHealthDiaryEntry(selectedDate);
    hydrateFromEntry(fresh);
    setConfirmResetOpen(false);
    triggerToast(`Đã xóa nhật ký ngày ${selectedDate}`);
  };

  const initialWeight = 50.0;
  const currentRecordedWeight = diaryEntry.weightKg || (weightLogs[0]?.weightKg ?? initialWeight);
  const totalGain = (currentRecordedWeight - initialWeight).toFixed(1);

  const mealLabels: Record<NutritionLog['mealType'], string> = {
    morning: 'Bữa sáng',
    lunch: 'Bữa trưa',
    dinner: 'Bữa tối',
    snack: 'Bữa phụ',
    supplement: 'Vitamin / Sắt / Canxi',
  };

  return (
    <div className="flex flex-col gap-5 pb-6">
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

      {/* Non-diagnostic notice */}
      <div className="p-3.5 rounded-2xl bg-nova-bg-subtle border border-nova-border flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 text-[11.5px] text-nova-text-muted leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-nova-accent shrink-0 mt-0.5" />
          <span>
            Nhật ký sức khỏe phục vụ theo dõi cá nhân và chuẩn bị thông tin trao đổi khi khám thai, không thay thế chẩn đoán y khoa.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setConfirmResetOpen(true)}
          className="text-[11px] font-semibold text-nova-text-muted hover:text-nova-danger shrink-0 cursor-pointer whitespace-nowrap"
        >
          Xóa ngày này
        </button>
      </div>

      {/* 1. Mood */}
      <section className="bg-nova-surface rounded-3xl p-5 border border-nova-border">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-nova-bg-subtle text-nova-accent flex items-center justify-center">
              <Smile className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-editorial text-[16px] font-semibold text-nova-text">
                Cảm xúc & Tâm trạng
              </h3>
              <p className="text-[11px] text-nova-text-muted">Hôm nay mẹ cảm thấy thế nào?</p>
            </div>
          </div>
          {diaryEntry.mood && (
            <span className="text-[11px] font-semibold text-nova-sage-text whitespace-nowrap">
              Đã ghi nhận
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {moods.map((m) => {
            const isSelected = diaryEntry.mood === m.type;
            return (
              <button
                key={m.type}
                type="button"
                onClick={() => handleSelectMood(m.type)}
                className={`flex flex-col items-center justify-center py-2.5 px-1.5 rounded-2xl border transition-all cursor-pointer min-h-[44px] ${
                  isSelected
                    ? 'bg-nova-accent-soft border-nova-accent'
                    : 'bg-nova-bg-subtle border-transparent hover:border-nova-border'
                }`}
              >
                <span className="text-2xl mb-1">{m.emoji}</span>
                <span className={`text-[11px] ${isSelected ? 'font-semibold text-nova-accent' : 'font-medium text-nova-text-muted'}`}>
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3.5 pt-3 border-t border-nova-border">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="Viết đôi dòng nhật ký cảm xúc hôm nay..."
              className="flex-1 bg-nova-bg-subtle border border-nova-border rounded-xl px-3 py-2 text-[16px] sm:text-[13px] text-nova-text focus:outline-none focus:border-nova-accent"
            />
            <button
              type="button"
              onClick={handleSaveMoodNote}
              className="px-4 py-2 bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast rounded-xl text-xs font-semibold shrink-0 cursor-pointer min-h-[44px]"
            >
              Lưu
            </button>
          </div>
        </div>
      </section>

      {/* 2. Sleep & Rest */}
      <section className="bg-nova-surface rounded-3xl p-5 border border-nova-border">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-nova-sage-soft text-nova-sage-text flex items-center justify-center">
              <Moon className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-editorial text-[16px] font-semibold text-nova-text">
                Giấc ngủ & Nghỉ ngơi
              </h3>
              <p className="text-[11px] text-nova-text-muted">Theo dõi thời lượng và chất lượng giấc ngủ</p>
            </div>
          </div>
          {diaryEntry.sleepHours !== undefined && (
            <span className="text-xs font-semibold text-nova-sage-text tabular-nums">{diaryEntry.sleepHours} giờ</span>
          )}
        </div>

        <form onSubmit={handleSaveSleep} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-nova-text-muted block mb-1">
                Tổng số giờ ngủ (tối + nghỉ trưa)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                placeholder="Ví dụ: 7.5"
                className="w-full bg-nova-bg-subtle border border-nova-border rounded-xl px-3 py-2 text-xs font-semibold text-nova-text tabular-nums"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-nova-text-muted block mb-1">
                Chất lượng giấc ngủ
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {([
                  { id: 'good', label: 'Ngủ sâu' },
                  { id: 'fair', label: 'Tạm ổn' },
                  { id: 'poor', label: 'Khó ngủ' },
                ] as { id: SleepQuality; label: string }[]).map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setSleepQuality(q.id)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-semibold border cursor-pointer min-h-[40px] ${
                      sleepQuality === q.id
                        ? 'bg-nova-sage-soft border-nova-sage text-nova-sage-text'
                        : 'bg-nova-bg-subtle border-nova-border text-nova-text-muted'
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={sleepNote}
              onChange={(e) => setSleepNote(e.target.value)}
              placeholder="Ghi chú: nằm nghiêng trái với gối ôm, có thức giấc ban đêm không..."
              className="flex-1 bg-nova-bg-subtle border border-nova-border rounded-xl px-3 py-2 text-xs text-nova-text"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast rounded-xl text-xs font-semibold shrink-0 cursor-pointer min-h-[44px]"
            >
              Lưu giấc ngủ
            </button>
          </div>
        </form>
      </section>

      {/* 3. Nutrition & Supplements */}
      <section className="bg-nova-surface rounded-3xl p-5 border border-nova-border">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-nova-sage-soft text-nova-sage-text flex items-center justify-center">
              <Utensils className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-editorial text-[16px] font-semibold text-nova-text">
                Dinh dưỡng & Bổ sung
              </h3>
              <p className="text-[11px] text-nova-text-muted">
                {(diaryEntry.nutritionLogs || []).length > 0
                  ? `${diaryEntry.nutritionLogs?.length} bữa ăn · vi chất hôm nay`
                  : 'Ghi nhận bữa ăn và viên uống sắt, canxi, DHA'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddNutrition((v) => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-nova-sage-text bg-nova-sage-soft hover:opacity-90 px-3.5 py-2 rounded-full cursor-pointer whitespace-nowrap min-h-[40px]"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm bữa ăn
          </button>
        </div>

        <AnimatePresence>
          {showAddNutrition && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddNutrition}
              className="bg-nova-bg-subtle border border-nova-border rounded-2xl p-3.5 mb-3 space-y-2.5 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as NutritionLog['mealType'])}
                  className="bg-nova-surface border border-nova-border rounded-xl px-3 py-2 text-xs font-semibold text-nova-text"
                >
                  {Object.entries(mealLabels).map(([k, lbl]) => (
                    <option key={k} value={k}>{lbl}</option>
                  ))}
                </select>
                <input
                  type="time"
                  value={mealTime}
                  onChange={(e) => setMealTime(e.target.value)}
                  className="bg-nova-surface border border-nova-border rounded-xl px-3 py-2 text-xs font-semibold text-nova-text tabular-nums"
                />
              </div>
              <input
                type="text"
                value={mealDesc}
                onChange={(e) => setMealDesc(e.target.value)}
                placeholder="Ví dụ: Cháo yến mạch trứng gà + 1 ly nước cam; uống viên sắt sau ăn..."
                className="w-full bg-nova-surface border border-nova-border rounded-xl px-3 py-2 text-xs text-nova-text"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddNutrition(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-nova-text-muted cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Lưu dinh dưỡng
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {(diaryEntry.nutritionLogs || []).length === 0 ? (
          <p className="text-xs text-nova-text-muted text-center py-4">Chưa có ghi chép dinh dưỡng nào trong ngày này.</p>
        ) : (
          <div className="space-y-2">
            {(diaryEntry.nutritionLogs || []).map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-nova-bg-subtle"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-[11px] font-medium text-nova-sage-text tabular-nums">
                    {mealLabels[n.mealType]} · {n.time}
                  </div>
                  <p className="text-xs font-semibold text-nova-text mt-0.5">{n.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveNutrition(n.id)}
                  className="p-2 text-nova-icon hover:text-nova-danger cursor-pointer"
                  aria-label="Xóa mục dinh dưỡng"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Symptoms */}
      <section className="bg-nova-surface rounded-3xl p-5 border border-nova-border">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-nova-accent-soft text-nova-accent flex items-center justify-center">
              <Activity className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-editorial text-[16px] font-semibold text-nova-text">
                Triệu chứng cơ thể
              </h3>
              <p className="text-[11px] text-nova-text-muted">
                {diaryEntry.symptoms.length > 0
                  ? `${diaryEntry.symptoms.length} triệu chứng được ghi nhận`
                  : 'Chưa có triệu chứng bất thường nào'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddSymptom(!showAddSymptom)}
            className="flex items-center gap-1 text-xs font-semibold text-nova-accent bg-nova-accent-soft hover:opacity-90 px-3.5 py-2 rounded-full transition-opacity cursor-pointer whitespace-nowrap min-h-[40px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm triệu chứng</span>
          </button>
        </div>

        <AnimatePresence>
          {showAddSymptom && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddSymptom}
              className="bg-nova-bg-subtle border border-nova-border rounded-2xl p-4 mb-4 flex flex-col gap-3 overflow-hidden"
            >
              <h4 className="text-xs font-semibold text-nova-text">Ghi nhận triệu chứng mới:</h4>

              <div className="flex flex-wrap gap-1.5">
                {commonSymptoms.map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setSymptomName(sym)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                      symptomName === sym
                        ? 'bg-nova-accent text-nova-accent-contrast border-nova-accent'
                        : 'bg-nova-surface text-nova-text-muted border-nova-border hover:border-nova-accent'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={symptomName}
                onChange={(e) => setSymptomName(e.target.value)}
                placeholder="Hoặc tự nhập tên triệu chứng..."
                className="w-full bg-nova-surface border border-nova-border rounded-xl px-3 py-2 text-[16px] sm:text-[13px] text-nova-text focus:outline-none focus:border-nova-accent"
              />

              <div>
                <label className="text-[11px] font-semibold text-nova-text-muted block mb-1.5">
                  Mức độ khó chịu:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['mild', 'moderate', 'severe'] as SymptomSeverity[]).map((lvl) => {
                    const labels: Record<SymptomSeverity, { text: string; color: string }> = {
                      mild: { text: 'Nhẹ', color: 'text-nova-sage-text' },
                      moderate: { text: 'Vừa', color: 'text-nova-warning' },
                      severe: { text: 'Nặng', color: 'text-nova-danger' },
                    };
                    const isSel = symptomSeverity === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSymptomSeverity(lvl)}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer min-h-[40px] ${
                          isSel
                            ? 'bg-nova-surface border-nova-accent ring-1 ring-nova-accent/30'
                            : 'bg-nova-surface/70 border-nova-border'
                        }`}
                      >
                        <span className={labels[lvl].color}>{labels[lvl].text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <input
                type="text"
                value={symptomNote}
                onChange={(e) => setSymptomNote(e.target.value)}
                placeholder="Ghi chú thêm (thời điểm xuất hiện, cách giảm...)"
                className="w-full bg-nova-surface border border-nova-border rounded-xl px-3 py-2 text-[16px] sm:text-[13px] text-nova-text focus:outline-none focus:border-nova-accent"
              />

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddSymptom(false)}
                  className="px-3 py-1.5 text-xs text-nova-text-muted hover:text-nova-text font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Lưu triệu chứng
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {diaryEntry.symptoms.length === 0 ? (
          <div className="py-5 text-center text-nova-text-muted">
            <p className="text-xs">Chưa có triệu chứng khó chịu nào được lưu trong ngày này.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {diaryEntry.symptoms.map((sym) => {
              const severityMeta = {
                mild: { text: 'Mức độ nhẹ', color: 'text-nova-sage-text' },
                moderate: { text: 'Mức độ vừa', color: 'text-nova-warning' },
                severe: { text: 'Mức độ nặng', color: 'text-nova-danger' },
              }[sym.severity];

              return (
                <div
                  key={sym.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-nova-bg-subtle"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-semibold text-nova-text truncate">{sym.name}</h4>
                      <span className={`text-[11px] font-medium ${severityMeta.color}`}>
                        · {severityMeta.text}
                      </span>
                    </div>
                    {sym.notes && (
                      <p className="text-[11px] text-nova-text-muted mt-0.5 leading-snug">{sym.notes}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSymptom(sym.id)}
                    className="p-2 text-nova-icon hover:text-nova-danger transition-colors cursor-pointer"
                    title="Xóa triệu chứng"
                    aria-label="Xóa triệu chứng"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Weight */}
      <section className="bg-nova-surface rounded-3xl p-5 border border-nova-border">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-nova-bg-subtle text-nova-accent flex items-center justify-center">
              <Scale className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-editorial text-[16px] font-semibold text-nova-text">
                Cân nặng mẹ bầu
              </h3>
              <p className="text-[11px] text-nova-text-muted">Theo dõi xu hướng tăng cân theo tuần</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-nova-accent tabular-nums">
              {Number(totalGain) >= 0 ? `+${totalGain} kg` : `${totalGain} kg`}
            </span>
            <span className="text-[10px] text-nova-text-muted block">so với đầu thai kỳ</span>
          </div>
        </div>

        <form onSubmit={handleSaveWeight} className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <input
              type="number"
              step="0.1"
              value={inputWeight}
              onChange={(e) => setInputWeight(e.target.value)}
              placeholder="Ví dụ: 54.5"
              className="w-full bg-nova-bg-subtle border border-nova-border rounded-xl px-3 py-2 pr-10 text-[16px] sm:text-[14px] font-semibold text-nova-text focus:outline-none focus:border-nova-accent tabular-nums"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-nova-text-muted">
              kg
            </span>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 min-h-[44px]"
          >
            Lưu cân nặng
          </button>
        </form>

        <div className="p-3 rounded-2xl bg-nova-bg-subtle border border-nova-border mb-3 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-nova-taupe shrink-0 mt-0.5" />
          <div className="text-[11px] text-nova-text-muted leading-relaxed">
            <strong className="font-semibold text-nova-text">Tham khảo Bộ Y tế & WHO:</strong> Mẹ có chỉ số khối cơ thể bình thường trước mang thai thường tăng khoảng{' '}
            <span className="font-semibold text-nova-accent">10 - 12.5 kg</span> suốt thai kỳ (tùy tư vấn bác sĩ cá nhân).
          </div>
        </div>

        <div className="space-y-1.5">
          <h4 className="text-[11px] font-semibold text-nova-text-muted uppercase tracking-wider">
            Lịch sử các lần cân gần đây:
          </h4>
          <div className="divide-y divide-nova-border">
            {weightLogs.slice(0, 4).map((w) => (
              <div key={w.id} className="py-2 flex items-center justify-between text-xs">
                <span className="text-nova-text-muted font-medium">
                  {w.date} {w.week ? `(Tuần ${w.week})` : ''}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-nova-text tabular-nums">{w.weightKg} kg</span>
                  <span className="text-[10.5px] text-nova-sage-text font-semibold tabular-nums">
                    +{(w.weightKg - initialWeight).toFixed(1)}kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Activity, Personal Notes, Fetal Kicks & Doctor Notes */}
      <section className="bg-nova-surface rounded-3xl p-5 border border-nova-border space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-nova-sage-soft text-nova-sage-text flex items-center justify-center">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-editorial text-[16px] font-semibold text-nova-text">
                Ghi chú vận động, thai máy & bác sĩ
              </h3>
              <p className="text-[11px] text-nova-text-muted">Lưu tổng hợp lịch sử ngày {selectedDate}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveAllNotes}
            className="flex items-center gap-1.5 text-xs font-semibold text-nova-accent-contrast bg-nova-accent hover:bg-nova-accent-hover px-3.5 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap min-h-[40px]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu ghi chú</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-nova-text-muted flex items-center gap-1 mb-1">
              <Baby className="w-3.5 h-3.5 text-nova-accent" /> Số lần thai máy cảm nhận
            </label>
            <input
              type="number"
              min="0"
              max="200"
              value={kickCount}
              onChange={(e) => setKickCount(e.target.value)}
              placeholder="Ví dụ: 12 lần trong 2 giờ tối"
              className="w-full bg-nova-bg-subtle border border-nova-border rounded-xl px-3 py-2 text-xs font-semibold text-nova-text tabular-nums"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-nova-text-muted block mb-1">
              Vận động / Thư giãn hôm nay
            </label>
            <input
              type="text"
              value={activityNotes}
              onChange={(e) => setActivityNotes(e.target.value)}
              placeholder="Ví dụ: Đi bộ nhẹ 20 phút, tập thở 10 phút"
              className="w-full bg-nova-bg-subtle border border-nova-border rounded-xl px-3 py-2 text-xs text-nova-text"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-nova-text-muted block mb-1">
            Nhật ký cá nhân
          </label>
          <textarea
            rows={2}
            value={personalNotes}
            onChange={(e) => setPersonalNotes(e.target.value)}
            placeholder="Ghi chú riêng tư của mẹ trong ngày hôm nay..."
            className="w-full bg-nova-bg-subtle border border-nova-border rounded-2xl p-3 text-xs text-nova-text focus:outline-none focus:border-nova-accent"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-nova-text-muted flex items-center gap-1 mb-1">
            <Stethoscope className="w-3.5 h-3.5 text-nova-sage-text" /> Lời dặn & Ghi chú từ bác sĩ
          </label>
          <textarea
            rows={2}
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            placeholder="Ví dụ: Bác sĩ dặn uống bổ sung viên sắt vào buổi sáng sau ăn 1 giờ..."
            className="w-full bg-nova-bg-subtle border border-nova-border rounded-2xl p-3 text-xs text-nova-text focus:outline-none focus:border-nova-accent"
          />
        </div>
      </section>

      {/* Confirm delete diary entry modal */}
      <AnimatePresence>
        {confirmResetOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1B18]/60 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-nova-surface rounded-3xl p-5 border border-nova-border shadow-2xl space-y-3">
              <h4 className="font-editorial text-base font-semibold text-nova-text">
                Xóa nhật ký ngày {selectedDate}?
              </h4>
              <p className="text-xs text-nova-text-muted">
                Thao tác này sẽ xóa dữ liệu tâm trạng, triệu chứng, giấc ngủ và dinh dưỡng đã ghi trong ngày {selectedDate}.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmResetOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-nova-border text-xs font-semibold text-nova-text-muted cursor-pointer min-h-[44px]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleDeleteDayDiary}
                  className="flex-1 py-2.5 rounded-xl bg-nova-danger text-[#FAF9F6] text-xs font-semibold cursor-pointer min-h-[44px]"
                >
                  Xóa dữ liệu
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
