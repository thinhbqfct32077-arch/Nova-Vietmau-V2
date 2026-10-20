import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Volume2,
  VolumeX,
  Heart,
  Clock,
  Calendar,
  Activity,
  Music,
  Stethoscope,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { ActivityItem } from '../../types';
import confetti from 'canvas-confetti';
import { notificationService } from '../../services/notificationService';

interface ActivityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ActivityItem | null;
  onCompleteActivity: (id: string, notes?: string) => void;
  onUncompleteActivity: (id: string) => void;
  onOpenWaterModal?: () => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  isOpen,
  onClose,
  activity,
  onCompleteActivity,
  onUncompleteActivity,
  onOpenWaterModal,
}) => {
  // Timer State for Yoga / Walking / Meditation
  const [timerSeconds, setTimerSeconds] = useState(15 * 60); // default 15 mins
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [notesInput, setNotesInput] = useState('');

  // Audio stream for Music
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const ambientStreamRef = useRef<{ stop: () => void } | null>(null);

  // Breathing Guide Phase
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  useEffect(() => {
    if (!isOpen || !activity) {
      setIsRunning(false);
      if (ambientStreamRef.current) {
        ambientStreamRef.current.stop();
        ambientStreamRef.current = null;
      }
      setIsPlayingMusic(false);
    } else {
      setNotesInput(activity.notes || '');
    }
  }, [isOpen, activity]);

  // Breathing phase loop when Yoga timer is running
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setBreathPhase((prev) => {
        if (prev === 'inhale') return 'hold';
        if (prev === 'hold') return 'exhale';
        return 'inhale';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Countdown timer
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            notificationService.playChime(0.4);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timerSeconds]);

  // Handle ambient stream for music activity
  const toggleMusicPlay = () => {
    if (isPlayingMusic) {
      if (ambientStreamRef.current) {
        ambientStreamRef.current.stop();
        ambientStreamRef.current = null;
      }
      setIsPlayingMusic(false);
    } else {
      ambientStreamRef.current = notificationService.createAmbientStream(selectedDuration * 60);
      setIsPlayingMusic(true);
      setIsRunning(true);
    }
  };

  if (!isOpen || !activity) return null;

  // Format MM:SS
  const mins = Math.floor(timerSeconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (timerSeconds % 60).toString().padStart(2, '0');

  const handleConfirmCompletion = () => {
    onCompleteActivity(activity.id, notesInput.trim() || undefined);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C84B4B', '#FCEEEB', '#F39C12', '#2ECC71'],
      });
    } catch {}
    if (ambientStreamRef.current) {
      ambientStreamRef.current.stop();
      ambientStreamRef.current = null;
    }
    onClose();
  };

  const handleResetTimer = (minutes: number) => {
    setSelectedDuration(minutes);
    setTimerSeconds(minutes * 60);
    setIsRunning(false);
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
            <div className={`w-10 h-10 rounded-2xl ${activity.iconBg} ${activity.iconColor} flex items-center justify-center shadow-xs`}>
              {activity.category === 'yoga' ? (
                <Activity className="w-5 h-5 stroke-[2.2]" />
              ) : activity.category === 'music' ? (
                <Music className="w-5 h-5 stroke-[2.2]" />
              ) : activity.category === 'checkup' ? (
                <Stethoscope className="w-5 h-5 stroke-[2.2]" />
              ) : (
                <Sparkles className="w-5 h-5 stroke-[2]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-bold text-[#3A2E2B] leading-tight">
                  {activity.title}
                </h2>
                {activity.completed && (
                  <span className="text-[10px] font-bold text-[#2ECC71] bg-[#EAFAF1] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Đã hoàn thành
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-[#8C7B75] mt-0.5">
                {activity.subtitle} · {activity.timeTarget}
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4.5 no-scrollbar">
          {/* Specific content for YOGA */}
          {activity.category === 'yoga' && (
            <div className="space-y-4">
              {/* Interactive Breathing & Timer Card */}
              <div className="p-5 bg-gradient-to-br from-white to-[#FEF9F5] rounded-[24px] border border-[#F5E6DA] shadow-xs flex flex-col items-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#D35400] mb-2">
                  Đồng hồ bấm giờ & Nhịp thở
                </span>

                {/* Breathing Visual Pulse */}
                <div className="relative w-36 h-36 flex items-center justify-center mb-3">
                  <motion.div
                    animate={{
                      scale: isRunning
                        ? breathPhase === 'inhale'
                          ? [1, 1.25]
                          : breathPhase === 'hold'
                          ? 1.25
                          : [1.25, 1]
                        : 1,
                      opacity: isRunning ? [0.6, 0.9, 0.6] : 0.6,
                    }}
                    transition={{ duration: 4, ease: 'easeInOut' }}
                    className="absolute w-32 h-32 rounded-full bg-[#FDEBD0]/60 pointer-events-none"
                  />
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="text-3xl font-black text-[#D35400] tracking-tight">
                      {mins}:{secs}
                    </span>
                    <span className="text-[11px] font-bold text-[#8C7B75] mt-0.5">
                      {isRunning
                        ? breathPhase === 'inhale'
                          ? 'Hít vào sâu...'
                          : breathPhase === 'hold'
                          ? 'Giữ nhẹ...'
                          : 'Thở ra chậm...'
                        : 'Sẵn sàng'}
                    </span>
                  </div>
                </div>

                {/* Timer Duration Selection Chips */}
                <div className="flex gap-2 mb-3">
                  {[10, 15, 20].map((m) => (
                    <button
                      key={m}
                      onClick={() => handleResetTimer(m)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        selectedDuration === m
                          ? 'bg-[#D35400] text-white border-[#D35400]'
                          : 'bg-white text-[#8C7B75] border-[#EAE0D7]'
                      }`}
                    >
                      {m} phút
                    </button>
                  ))}
                </div>

                {/* Timer Control Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className="px-5 py-2.5 rounded-2xl bg-[#D35400] hover:bg-[#BA4A00] text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-4 h-4 fill-current" />
                        <span>Tạm dừng</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>Bắt đầu tập</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleResetTimer(selectedDuration)}
                    className="p-2.5 rounded-2xl bg-white border border-[#EAE0D7] text-[#8C7B75] hover:text-[#D35400] cursor-pointer"
                    title="Đặt lại giờ"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Step by step poses */}
              <div className="p-4 bg-white rounded-2xl border border-[#EDE7E2] shadow-2xs space-y-2.5">
                <h4 className="text-xs font-bold text-[#3A2E2B]">
                  3 Động tác Yoga bầu an toàn:
                </h4>
                <div className="space-y-2 text-xs text-[#6E5D57]">
                  <div className="p-2.5 bg-[#FAF7F4] rounded-xl">
                    <strong className="text-[#3A2E2B]">1. Tư thế Con mèo - Con bò (Cat-Cow):</strong> Quỳ 4 điểm, hít vào võng nhẹ lưng nhìn lên, thở ra cong lưng cúi đầu. Giúp giải phóng hoàn toàn áp lực cột sống.
                  </div>
                  <div className="p-2.5 bg-[#FAF7F4] rounded-xl">
                    <strong className="text-[#3A2E2B]">2. Tư thế Em bé mở rộng (Extended Child's Pose):</strong> Quỳ mở rộng 2 gối để nhường chỗ cho bụng bầu, hạ trán chạm thảm, vươn dài hai tay thư giãn vùng hông.
                  </div>
                  <div className="p-2.5 bg-[#FAF7F4] rounded-xl">
                    <strong className="text-[#3A2E2B]">3. Bài tập Kegel sàn chậu:</strong> Co thắt cơ sàn chậu 5 giây rồi thả lỏng 5 giây, lặp lại 10 lần giúp tăng sức bền khi vượt cạn.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Specific content for MUSIC */}
          {activity.category === 'music' && (
            <div className="space-y-4">
              <div className="p-5 bg-gradient-to-br from-white to-[#FBF6FD] rounded-[24px] border border-[#F0DDF6] shadow-xs flex flex-col items-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E44AD] mb-2">
                  Trị liệu âm thanh & Thai giáo 432Hz
                </span>

                <div className="w-24 h-24 rounded-full bg-[#F4ECF7] text-[#8E44AD] flex items-center justify-center my-3 shadow-inner relative">
                  {isPlayingMusic && (
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.2, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0 rounded-full border-2 border-[#8E44AD]"
                    />
                  )}
                  <Music className="w-10 h-10 stroke-[2.2]" />
                </div>

                <h3 className="text-sm font-bold text-[#3A2E2B] mb-0.5">
                  Bản giao hưởng Mozart & Tần số 432Hz
                </h3>
                <p className="text-[11px] text-[#8C7B75] mb-4 text-center">
                  Sóng âm êm dịu kích thích tế bào thính giác thai nhi phát triển vượt trội
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleMusicPlay}
                    className="px-6 py-2.5 rounded-2xl bg-[#8E44AD] hover:bg-[#7D3C98] text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    {isPlayingMusic ? (
                      <>
                        <VolumeX className="w-4 h-4" />
                        <span>Tắt âm thanh</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        <span>Phát nhạc thư giãn 432Hz</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-[#EDE7E2] text-xs text-[#6E5D57] space-y-1.5 leading-relaxed">
                <strong className="text-[#3A2E2B]">Lợi ích thai giáo âm thanh:</strong>
                <p>• Từ tuần 16, thai nhi đã có thể phản ứng với âm thanh bên ngoài tử cung.</p>
                <p>• Nghe nhạc âm lượng dưới 60dB giúp mẹ giải tỏa hormone Cortisol (stress), truyền năng lượng tích cực đến em bé.</p>
              </div>
            </div>
          )}

          {/* Specific content for CHECKUP */}
          {activity.category === 'checkup' && (
            <div className="space-y-3.5">
              <div className="p-4 bg-[#FCEEEB] rounded-2xl border border-[#FADCD5] text-xs text-[#C84B4B] space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[13px]">
                  <Stethoscope className="w-4 h-4" />
                  <span>Cột mốc khám thai quan trọng: Tuần 12</span>
                </div>
                <p className="text-[11.5px] leading-relaxed text-[#5C2B22]">
                  Mốc đo độ mờ da gáy (NT) và xét nghiệm Double Test / NIPT để tầm soát hội chứng Down. Thời điểm vàng là 11 tuần đến 13 tuần 6 ngày.
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#EDE7E2] shadow-2xs space-y-2">
                <h4 className="text-xs font-bold text-[#3A2E2B]">
                  Chuẩn bị trước khi đi khám:
                </h4>
                <ul className="text-xs text-[#6E5D57] list-disc list-inside space-y-1">
                  <li>Mang theo Sổ theo dõi thai kỳ và kết quả siêu âm mốc trước.</li>
                  <li>Mặc đồ thoải mái, dễ di chuyển khi siêu âm bụng.</li>
                  <li>Chuẩn bị sẵn các thắc mắc để hỏi trực tiếp bác sĩ sản khoa.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Note Input for the session */}
          <div className="p-3.5 bg-white rounded-2xl border border-[#EDE7E2] shadow-2xs space-y-1.5">
            <label className="text-xs font-bold text-[#3A2E2B] block">
              Ghi chú kết quả thực hiện hôm nay:
            </label>
            <textarea
              rows={2}
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="VD: Cảm thấy lưng nhẹ nhõm, bé đạp nhẹ lúc nghe nhạc..."
              className="w-full p-2.5 bg-[#FAF7F4] border border-[#E8DFD8] rounded-xl text-xs text-[#3A2E2B] focus:outline-none focus:ring-2 focus:ring-[#C84B4B]/30 resize-none"
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#F0ECE9] bg-white flex items-center gap-2.5">
          {activity.completed ? (
            <button
              onClick={() => {
                onUncompleteActivity(activity.id);
                onClose();
              }}
              className="flex-1 py-3 bg-[#FAF7F4] border border-[#E8DFD8] text-[#8C7B75] hover:text-[#C84B4B] font-bold rounded-2xl text-xs cursor-pointer transition-colors"
            >
              Hủy đánh dấu hoàn thành
            </button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirmCompletion}
              className="flex-1 py-3 bg-[#C84B4B] hover:bg-[#B53E3E] text-white font-bold rounded-2xl shadow-sm text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác nhận hoàn thành hoạt động</span>
            </motion.button>
          )}

          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl border border-[#E8DFD8] text-xs font-semibold text-[#8C7B75] cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
};
