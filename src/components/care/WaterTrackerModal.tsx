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
  CheckCircle2,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';
import { DailyWaterRecord, WaterLogEntry } from '../../types';
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
          colors: ['#2980B9', '#3498DB', '#A9CCE3', '#2ECC71'],
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
          colors: ['#2980B9', '#3498DB', '#A9CCE3', '#2ECC71'],
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
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#3A2E2B] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-[#F0ECE9] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EBF5FB] text-[#2980B9] flex items-center justify-center shadow-xs">
              <Droplet className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#3A2E2B] leading-tight">
                Theo dõi lượng nước uống
              </h2>
              <p className="text-[11px] font-medium text-[#8C7B75] mt-0.5">
                Ngày {waterRecord.date} · Đảm bảo lượng nước ối cho bé
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
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4.5 no-scrollbar">
          {/* Main Visual Progress Card with Liquid Bubble Meter */}
          <div className="p-5 bg-gradient-to-br from-white to-[#F2F8FC] rounded-[24px] border border-[#E3EDF5] shadow-xs flex flex-col items-center relative overflow-hidden">
            {/* Ambient water reflection */}
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#D6EAF8]/50 rounded-full blur-2xl pointer-events-none" />

            {/* Circular Percentage Meter */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-3">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  stroke="#E8F1F8"
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
                    <stop offset="0%" stopColor="#3498DB" />
                    <stop offset="100%" stopColor="#2980B9" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-[#2980B9] tracking-tight leading-none">
                  {percent}%
                </span>
                <span className="text-[10px] font-semibold text-[#6C7A89] mt-1">
                  {waterRecord.isCompleted ? 'Hoàn thành 🎉' : 'Đang tiếp tục'}
                </span>
              </div>
            </div>

            {/* Current vs Target Amount Display */}
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-[28px] font-extrabold text-[#2C3E50] tracking-tight leading-none">
                  {waterRecord.currentMl.toLocaleString('vi-VN')}
                </span>
                <span className="text-[16px] font-bold text-[#8C7B75]">
                  / {waterRecord.targetMl.toLocaleString('vi-VN')} ml
                </span>
              </div>

              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-xs text-[#6C7A89]">
                  {waterRecord.isCompleted
                    ? 'Mẹ đã đạt mục tiêu nước hôm nay! Rất tuyệt vời 💧'
                    : `Còn thiếu ${(waterRecord.targetMl - waterRecord.currentMl > 0
                        ? waterRecord.targetMl - waterRecord.currentMl
                        : 0
                      ).toLocaleString('vi-VN')} ml để hoàn thành`}
                </span>
              </div>
            </div>

            {/* Change Daily Target Goal Button */}
            <div className="mt-3 pt-3 border-t border-[#E8EFF5] w-full flex items-center justify-between">
              <span className="text-[11.5px] text-[#6C7A89] font-medium">
                Mục tiêu: {waterRecord.targetMl} ml/ngày
              </span>
              <button
                type="button"
                onClick={() => {
                  setNewTargetInput(waterRecord.targetMl.toString());
                  setIsEditingTarget(!isEditingTarget);
                }}
                className="text-[11.5px] font-bold text-[#2980B9] hover:text-[#1F618D] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Target className="w-3.5 h-3.5" />
                <span>{isEditingTarget ? 'Đóng' : 'Đổi mục tiêu'}</span>
              </button>
            </div>

            {/* Target Edit Form Drawer */}
            <AnimatePresence>
              {isEditingTarget && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full mt-3 pt-3 border-t border-[#E8EFF5] overflow-hidden"
                >
                  <label className="text-[11px] font-semibold text-[#6C7A89] block mb-1.5">
                    Chọn hoặc nhập mục tiêu nước mới (ml):
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    {[2000, 2500, 3000].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewTargetInput(t.toString())}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          newTargetInput === t.toString()
                            ? 'bg-[#2980B9] text-white border-[#2980B9]'
                            : 'bg-white text-[#6C7A89] border-[#DCE4EC] hover:bg-[#F2F6FA]'
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
                      className="flex-1 px-3 py-2 bg-white border border-[#DCE4EC] rounded-xl text-xs font-semibold text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2980B9]/30"
                      placeholder="Nhập số ml..."
                    />
                    <button
                      type="button"
                      onClick={handleSaveTarget}
                      className="px-4 py-2 bg-[#2980B9] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#1F618D] cursor-pointer"
                    >
                      Lưu
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Add Buttons: 100ml, 250ml, 350ml, 500ml */}
          <div>
            <h3 className="text-xs font-bold text-[#8C7B75] uppercase tracking-wider mb-2.5">
              Thêm nhanh lượng nước
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((amount) => (
                <motion.button
                  key={amount}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleQuickAdd(amount)}
                  className="py-3 px-2 rounded-2xl bg-white border border-[#EDE7E2] shadow-2xs hover:border-[#2980B9] hover:bg-[#F9FCFF] flex flex-col items-center justify-center cursor-pointer transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#EBF5FB] text-[#2980B9] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-[13px] font-extrabold text-[#2C3E50]">
                    +{amount}
                  </span>
                  <span className="text-[9.5px] font-medium text-[#8C7B75]">
                    ml
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Custom Add Water Form */}
          <form
            onSubmit={handleCustomAdd}
            className="p-3.5 bg-white rounded-2xl border border-[#EDE7E2] shadow-2xs space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#3A2E2B]">
                Nhập số ml tùy chỉnh
              </span>
              {waterRecord.logs.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onUndoLastLog();
                    showToast('Đã hoàn tác lần nhập nước gần nhất!');
                  }}
                  className="text-[11px] font-bold text-[#C84B4B] hover:text-[#A93226] flex items-center gap-1 cursor-pointer transition-colors"
                  title="Hoàn tác lần nhập gần nhất"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Hoàn tác lần vừa nhập</span>
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
                placeholder="Số ml (VD: 300)"
                className="w-28 px-3 py-2.5 bg-[#FAF7F4] border border-[#E8DFD8] rounded-xl text-xs font-bold text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2980B9]/30"
              />
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Ghi chú (VD: Nước cam, canh rau...)"
                className="flex-1 px-3 py-2.5 bg-[#FAF7F4] border border-[#E8DFD8] rounded-xl text-xs text-[#3A2E2B] focus:outline-none focus:ring-2 focus:ring-[#2980B9]/30"
              />
              <motion.button
                whileTap={{ scale: 0.94 }}
                type="submit"
                disabled={!customMl}
                className="px-4 py-2.5 rounded-xl bg-[#2980B9] disabled:opacity-40 text-white text-xs font-bold shadow-xs hover:bg-[#1F618D] cursor-pointer"
              >
                Thêm
              </motion.button>
            </div>
          </form>

          {/* Today Water Log History */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-[#8C7B75] uppercase tracking-wider">
                Lịch sử uống nước hôm nay ({waterRecord.logs.length} lần)
              </h3>
              <span className="text-[11px] font-semibold text-[#2980B9]">
                Tổng: {waterRecord.currentMl} ml
              </span>
            </div>

            {waterRecord.logs.length === 0 ? (
              <div className="p-4 bg-white rounded-2xl border border-dashed border-[#E0D8D0] text-center text-xs text-[#8C7B75]">
                Hôm nay mẹ chưa ghi nhận lần uống nước nào. Hãy chạm các nút nhanh ở trên để bắt đầu nhé!
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-0.5">
                {waterRecord.logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-white rounded-xl border border-[#EDE7E2] shadow-2xs flex items-center justify-between hover:bg-[#FAF8F5] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] text-[#2980B9] flex items-center justify-center font-bold text-xs">
                        +{log.amountMl}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#2C3E50]">
                            {log.amountMl} ml
                          </span>
                          <span className="text-[10px] text-[#8C7B75] flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {log.timestamp}
                          </span>
                        </div>
                        {log.note && (
                          <p className="text-[11px] text-[#6C7A89] mt-0.5">
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
                      className="w-7 h-7 rounded-lg text-[#8C7B75] hover:text-[#C84B4B] hover:bg-[#FCEEEB] flex items-center justify-center cursor-pointer transition-colors"
                      title="Xóa lần này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clinical Maternal hydration tip */}
          <div className="p-3 bg-[#EBF5FB]/80 rounded-2xl border border-[#D4E6F1] flex items-start gap-2.5 text-xs text-[#2471A3]">
            <Info className="w-4 h-4 text-[#2980B9] shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11.5px]">
              <strong>Lời khuyên sản khoa:</strong> Mẹ bầu cần khoảng 2.0 - 2.5 lít nước/ngày để duy trì thể tích máu nuôi thai, tái tạo nước ối đều đặn và phòng ngừa nhiễm trùng đường tiết niệu hay táo bón thai kỳ.
            </p>
          </div>
        </div>

        {/* Bottom Done Button */}
        <div className="p-4 border-t border-[#F0ECE9] bg-white">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-3 bg-[#2980B9] hover:bg-[#1F618D] text-white font-bold rounded-2xl shadow-sm text-sm cursor-pointer transition-colors"
          >
            Đã xong
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
