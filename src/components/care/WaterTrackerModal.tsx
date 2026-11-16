import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Droplet,
  Plus,
  RotateCcw,
  Target,
  Clock,
  Trash2,
  Sparkles,
  Info,
} from 'lucide-react';
import { DailyWaterRecord } from '../../types';
import confetti from 'canvas-confetti';

interface WaterTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  waterRecord: DailyWaterRecord;
  onAddLog: (amountMl: number, note?: string) => void;
  onUndoLastLog: () => void;
  onRemoveLog: (logId: string) => void;
  onUpdateTarget: (targetMl: number) => void;
}

export const WaterTrackerModal: React.FC<WaterTrackerModalProps> = ({
  isOpen,
  onClose,
  waterRecord,
  onAddLog,
  onUndoLastLog,
  onRemoveLog,
  onUpdateTarget,
}) => {
  const [customMl, setCustomMl] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [newTargetInput, setNewTargetInput] = useState(waterRecord.targetMl.toString());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickAmounts = [100, 250, 350, 500];
  const percent = Math.min(100, Math.round((waterRecord.currentMl / waterRecord.targetMl) * 100));

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleQuickAdd = (amount: number) => {
    onAddLog(amount, `Uống nhanh +${amount}ml`);
    showToast(`Đã thêm +${amount} ml nước thành công!`);

    if (waterRecord.currentMl + amount >= waterRecord.targetMl && !waterRecord.isCompleted) {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#51483F', '#A3A795', '#B8AA98', '#EDE7DE'],
        });
      } catch {}
    }
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customMl, 10);
    if (isNaN(val) || val <= 0) return;

    onAddLog(val, customNote.trim() || `Thêm +${val}ml`);
    setCustomMl('');
    setCustomNote('');
    showToast(`Đã thêm +${val} ml nước thành công!`);

    if (waterRecord.currentMl + val >= waterRecord.targetMl && !waterRecord.isCompleted) {
      try {
        confetti({
          particleCount: 50,
          spread: 65,
          origin: { y: 0.6 },
          colors: ['#51483F', '#A3A795', '#B8AA98', '#EDE7DE'],
        });
      } catch {}
    }
  };

  const handleSaveTarget = () => {
    const val = parseInt(newTargetInput, 10);
    if (!isNaN(val) && val >= 500) {
      onUpdateTarget(val);
      setIsEditingTarget(false);
      showToast(`Đã cập nhật mục tiêu mới: ${val.toLocaleString('vi-VN')} ml`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#1C1B18]/60 backdrop-blur-xs p-0 md:p-4">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="w-full max-w-[430px] max-h-[92vh] bg-nova-bg rounded-t-[28px] md:rounded-[28px] border border-nova-border ios-float-shadow flex flex-col overflow-hidden text-nova-text"
      >
        {toastMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-nova-accent text-nova-accent-contrast text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-nova-border bg-nova-surface flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-nova-sage-soft text-nova-sage-text flex items-center justify-center">
              <Droplet className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="font-editorial text-[17px] font-semibold text-nova-text leading-tight">
                Nước ấm mỗi ngày
              </h2>
              <p className="text-[11px] font-medium text-nova-text-muted mt-0.5">
                Ngày {waterRecord.date} · Duy trì nước ối khỏe mạnh cho bé
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-nova-bg-subtle hover:bg-nova-accent-soft text-nova-icon flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Đóng"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
          {/* Main Visual Progress Card */}
          <div className="p-5 bg-nova-surface rounded-2xl border border-nova-border flex flex-col items-center relative overflow-hidden">
            <div className="relative w-36 h-36 flex items-center justify-center mb-3">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  stroke="var(--color-nova-sage-soft)"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  stroke="url(#waterGrad)"
                  strokeWidth="8"
                  strokeDasharray="263.89"
                  strokeDashoffset={263.89 - (263.89 * percent) / 100}
                  strokeLinecap="round"
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-nova-sage)" />
                    <stop offset="100%" stopColor="var(--color-nova-sage-text)" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-editorial text-3xl font-semibold text-nova-sage-text tracking-tight leading-none tabular-nums">
                  {percent}%
                </span>
                <span className="text-[10.5px] font-medium text-nova-text-muted mt-1">
                  {waterRecord.isCompleted ? 'Đủ đầy hôm nay' : 'Thong thả từng ngụm'}
                </span>
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-baseline justify-center gap-1.5 tabular-nums">
                <span className="text-[26px] font-semibold text-nova-text tracking-tight leading-none">
                  {waterRecord.currentMl.toLocaleString('vi-VN')}
                </span>
                <span className="text-[15px] font-medium text-nova-text-muted">
                  / {waterRecord.targetMl.toLocaleString('vi-VN')} ml
                </span>
              </div>

              <p className="mt-2 text-xs text-nova-text-muted">
                {waterRecord.isCompleted
                  ? 'Mẹ đã uống đủ lượng nước gợi ý hôm nay.'
                  : `Gợi ý thêm ${(waterRecord.targetMl - waterRecord.currentMl > 0
                      ? waterRecord.targetMl - waterRecord.currentMl
                      : 0
                    ).toLocaleString('vi-VN')} ml nữa trong ngày`}
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-nova-border w-full flex items-center justify-between">
              <span className="text-[11.5px] text-nova-text-muted font-medium tabular-nums">
                Mục tiêu: {waterRecord.targetMl} ml/ngày
              </span>
              <button
                type="button"
                onClick={() => {
                  setNewTargetInput(waterRecord.targetMl.toString());
                  setIsEditingTarget(!isEditingTarget);
                }}
                className="text-[11.5px] font-semibold text-nova-sage-text hover:text-nova-accent flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Target className="w-3.5 h-3.5" />
                <span>{isEditingTarget ? 'Đóng' : 'Đổi mục tiêu'}</span>
              </button>
            </div>

            <AnimatePresence>
              {isEditingTarget && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full mt-3 pt-3 border-t border-nova-border overflow-hidden"
                >
                  <label className="text-[11px] font-semibold text-nova-text-muted block mb-1.5">
                    Chọn hoặc nhập mục tiêu nước mới (ml):
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    {[2000, 2500, 3000].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewTargetInput(t.toString())}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                          newTargetInput === t.toString()
                            ? 'bg-nova-accent text-nova-accent-contrast border-nova-accent'
                            : 'bg-nova-bg-subtle text-nova-text-muted border-nova-border'
                        }`}
                      >
                        {t} ml
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={500}
                      step={50}
                      value={newTargetInput}
                      onChange={(e) => setNewTargetInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-nova-bg-subtle border border-nova-border rounded-xl text-xs font-semibold text-nova-text"
                      placeholder="Nhập số ml..."
                    />
                    <button
                      type="button"
                      onClick={handleSaveTarget}
                      className="px-4 py-2 bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Lưu
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Add Buttons */}
          <div>
            <h3 className="text-xs font-semibold text-nova-text-muted uppercase tracking-wider mb-2.5">
              Thêm nhanh lượng nước
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((amount) => (
                <motion.button
                  key={amount}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickAdd(amount)}
                  className="py-3 px-2 rounded-2xl bg-nova-surface border border-nova-border hover:border-nova-sage flex flex-col items-center justify-center cursor-pointer transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-nova-sage-soft text-nova-sage-text flex items-center justify-center mb-1">
                    <Plus className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="text-[13px] font-semibold text-nova-text tabular-nums">
                    +{amount}
                  </span>
                  <span className="text-[10px] font-medium text-nova-text-muted">
                    ml
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Custom Add Water Form */}
          <form
            onSubmit={handleCustomAdd}
            className="p-3.5 bg-nova-surface rounded-2xl border border-nova-border space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-nova-text">
                Nhập số ml tùy chỉnh
              </span>
              {waterRecord.logs.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onUndoLastLog();
                    showToast('Đã hoàn tác lần nhập nước gần nhất!');
                  }}
                  className="text-[11px] font-semibold text-nova-accent flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Hoàn tác</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={10}
                step={10}
                value={customMl}
                onChange={(e) => setCustomMl(e.target.value)}
                placeholder="Số ml"
                className="w-24 px-3 py-2.5 bg-nova-bg-subtle border border-nova-border rounded-xl text-xs font-semibold text-nova-text"
              />
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Ghi chú (Ví dụ: Nước cam, canh rau...)"
                className="flex-1 px-3 py-2.5 bg-nova-bg-subtle border border-nova-border rounded-xl text-xs text-nova-text"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!customMl}
                className="px-4 py-2.5 rounded-xl bg-nova-accent hover:bg-nova-accent-hover disabled:opacity-40 text-nova-accent-contrast text-xs font-semibold cursor-pointer"
              >
                Thêm
              </motion.button>
            </div>
          </form>

          {/* Today Water Log History */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-semibold text-nova-text-muted uppercase tracking-wider">
                Lịch sử hôm nay ({waterRecord.logs.length} lần)
              </h3>
              <span className="text-[11px] font-semibold text-nova-sage-text tabular-nums">
                Tổng: {waterRecord.currentMl} ml
              </span>
            </div>

            {waterRecord.logs.length === 0 ? (
              <div className="p-4 bg-nova-surface rounded-2xl border border-dashed border-nova-border text-center text-xs text-nova-text-muted">
                Hôm nay mẹ chưa ghi nhận lần uống nước nào. Hãy chạm các nút nhanh ở trên để bắt đầu nhé!
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-0.5">
                {waterRecord.logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-nova-surface rounded-xl border border-nova-border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-nova-sage-soft text-nova-sage-text flex items-center justify-center font-semibold text-xs tabular-nums">
                        +{log.amountMl}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-nova-text tabular-nums">
                            {log.amountMl} ml
                          </span>
                          <span className="text-[10.5px] text-nova-text-muted flex items-center gap-0.5 tabular-nums">
                            <Clock className="w-2.5 h-2.5" />
                            {log.timestamp}
                          </span>
                        </div>
                        {log.note && (
                          <p className="text-[11px] text-nova-text-muted mt-0.5">
                            {log.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onRemoveLog(log.id);
                        showToast(`Đã xóa lần uống ${log.amountMl}ml`);
                      }}
                      className="w-7 h-7 rounded-lg text-nova-icon hover:text-nova-danger hover:bg-nova-danger-soft flex items-center justify-center cursor-pointer transition-colors"
                      title="Xóa lần này"
                      aria-label="Xóa lần này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3.5 bg-nova-sage-soft rounded-2xl border border-nova-success-border flex items-start gap-2.5 text-xs text-nova-sage-text">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11.5px]">
              <strong>Lời khuyên sản khoa:</strong> Mẹ bầu cần khoảng 2.0 - 2.5 lít nước/ngày để duy trì thể tích máu nuôi thai, tái tạo nước ối đều đặn và giảm táo bón thai kỳ.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-nova-border bg-nova-surface">
          <motion.button
            whileTap={{ scale: 0.985 }}
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast font-semibold rounded-2xl text-sm cursor-pointer transition-colors"
          >
            Đã xong
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
