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
        colors: ['#B55841', '#F2ECE3', '#C4A46B', '#6D8572'],
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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#161311]/55 backdrop-blur-xs p-0 md:p-4">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="w-full max-w-[430px] max-h-[92vh] bg-[#FAF6F0] dark:bg-[#161311] rounded-t-[32px] md:rounded-[32px] border border-[#E6DDD1] dark:border-[#362E2A] shadow-2xl flex flex-col overflow-hidden text-[#322622] dark:text-[#F4EDE6]"
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3.5 border-b border-[#E6DDD1] dark:border-[#362E2A] bg-white dark:bg-[#1E1A17] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-2xl ${activity.iconBg} ${activity.iconColor} flex items-center justify-center shrink-0`}>
              {activity.category === 'yoga' ? (
                <Activity className="w-5 h-5 stroke-[2]" />
              ) : activity.category === 'music' ? (
                <Music className="w-5 h-5 stroke-[2]" />
              ) : activity.category === 'checkup' ? (
                <Stethoscope className="w-5 h-5 stroke-[2]" />
              ) : (
                <Sparkles className="w-5 h-5 stroke-[2]" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-editorial text-[18px] font-semibold text-[#322622] dark:text-[#F4EDE6] leading-tight truncate">
                  {activity.title}
                </h2>
                {activity.completed && (
                  <span className="text-[11px] font-semibold text-[#263E35] dark:text-[#8DA892] flex items-center gap-1 whitespace-nowrap">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#6D8572]" />
                    Đã hoàn thành
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-[#786962] dark:text-[#B5A89F] mt-0.5">
                {activity.subtitle} · {activity.timeTarget}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F2ECE3] dark:bg-[#2A2320] hover:bg-[#E6DDD1] dark:hover:bg-[#362E2A] text-[#786962] dark:text-[#B5A89F] flex items-center justify-center cursor-pointer transition-colors shrink-0"
            aria-label="Đóng"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
          {/* Specific content for YOGA */}
          {activity.category === 'yoga' && (
            <div className="space-y-4">
              {/* Interactive Breathing & Timer Card */}
              <div className="p-5 bg-white dark:bg-[#1E1A17] rounded-[26px] border border-[#E6DDD1] dark:border-[#362E2A] flex flex-col items-center">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B55841] dark:text-[#D47A63] mb-2">
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
                      opacity: isRunning ? [0.55, 0.85, 0.55] : 0.55,
                    }}
                    transition={{ duration: 4, ease: 'easeInOut' }}
                    className="absolute w-32 h-32 rounded-full bg-[#F7EAE5] dark:bg-[#35231E] pointer-events-none"
                  />
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="font-editorial text-3xl font-semibold text-[#B55841] dark:text-[#D47A63] tracking-tight tabular-nums">
                      {mins}:{secs}
                    </span>
                    <span className="text-[11px] font-medium text-[#786962] dark:text-[#B5A89F] mt-0.5">
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
                <div className="flex gap-2 mb-3.5">
                  {[10, 15, 20].map((m) => (
                    <button
                      key={m}
                      onClick={() => handleResetTimer(m)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                        selectedDuration === m
                          ? 'bg-[#B55841] text-white border-[#B55841]'
                          : 'bg-[#FAF6F0] dark:bg-[#231E1B] text-[#786962] dark:text-[#B5A89F] border-[#E6DDD1] dark:border-[#362E2A]'
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
                    className="px-5 py-2.5 rounded-2xl bg-[#B55841] hover:bg-[#9E4A35] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors min-h-[44px]"
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
                    className="p-2.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-[#786962] dark:text-[#B5A89F] hover:text-[#B55841] cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Đặt lại giờ"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Step by step poses */}
              <div className="p-4 bg-white dark:bg-[#1E1A17] rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-2.5">
                <h4 className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6]">
                  3 Động tác Yoga bầu an toàn:
                </h4>
                <div className="space-y-2 text-xs text-[#6B5D56] dark:text-[#C5B9B0]">
                  <div className="p-3 bg-[#F2ECE3]/70 dark:bg-[#231E1B] rounded-xl leading-relaxed">
                    <strong className="text-[#322622] dark:text-[#F4EDE6]">1. Tư thế Con mèo - Con bò (Cat-Cow):</strong> Quỳ 4 điểm, hít vào võng nhẹ lưng nhìn lên, thở ra cong lưng cúi đầu. Giúp giải phóng hoàn toàn áp lực cột sống.
                  </div>
                  <div className="p-3 bg-[#F2ECE3]/70 dark:bg-[#231E1B] rounded-xl leading-relaxed">
                    <strong className="text-[#322622] dark:text-[#F4EDE6]">2. Tư thế Em bé mở rộng (Extended Child's Pose):</strong> Quỳ mở rộng 2 gối để nhường chỗ cho bụng bầu, hạ trán chạm thảm, vươn dài hai tay thư giãn vùng hông.
                  </div>
                  <div className="p-3 bg-[#F2ECE3]/70 dark:bg-[#231E1B] rounded-xl leading-relaxed">
                    <strong className="text-[#322622] dark:text-[#F4EDE6]">3. Bài tập Kegel sàn chậu:</strong> Co thắt cơ sàn chậu 5 giây rồi thả lỏng 5 giây, lặp lại 10 lần giúp tăng sức bền khi vượt cạn.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Specific content for MUSIC */}
          {activity.category === 'music' && (
            <div className="space-y-4">
              <div className="p-5 bg-white dark:bg-[#1E1A17] rounded-[26px] border border-[#E6DDD1] dark:border-[#362E2A] flex flex-col items-center">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6D8572] dark:text-[#8DA892] mb-2">
                  Trị liệu âm thanh & Thai giáo 432Hz
                </span>

                <div className="w-24 h-24 rounded-full bg-[#EBF1EC] dark:bg-[#1E2922] text-[#263E35] dark:text-[#A7C2AC] flex items-center justify-center my-3 relative">
                  {isPlayingMusic && (
                    <motion.div
                      animate={{ scale: [1, 1.35, 1], opacity: [0.55, 0.2, 0.55] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0 rounded-full border-2 border-[#6D8572]"
                    />
                  )}
                  <Music className="w-10 h-10 stroke-[2]" />
                </div>

                <h3 className="font-editorial text-base font-semibold text-[#322622] dark:text-[#F4EDE6] mb-1 text-center">
                  Bản giao hưởng Mozart & Tần số 432Hz
                </h3>
                <p className="text-[11.5px] text-[#786962] dark:text-[#B5A89F] mb-4 text-center max-w-[280px]">
                  Sóng âm êm dịu kích thích tế bào thính giác thai nhi phát triển hài hòa
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleMusicPlay}
                    className="px-6 py-2.5 rounded-2xl bg-[#263E35] hover:bg-[#1D3029] text-[#FAF6F0] text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors min-h-[44px]"
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

              <div className="p-4 bg-[#F2ECE3]/70 dark:bg-[#1E1A17] rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#6B5D56] dark:text-[#C5B9B0] space-y-1.5 leading-relaxed">
                <strong className="text-[#322622] dark:text-[#F4EDE6] block">Lợi ích thai giáo âm thanh:</strong>
                <p>• Từ tuần 16, thai nhi đã có thể phản ứng với âm thanh bên ngoài tử cung.</p>
                <p>• Nghe nhạc âm lượng dưới 60dB giúp mẹ giải tỏa hormone Cortisol (stress), truyền năng lượng bình an đến em bé.</p>
              </div>
            </div>
          )}

          {/* Specific content for CHECKUP */}
          {activity.category === 'checkup' && (
            <div className="space-y-3.5">
              <div className="p-4 bg-[#F7EAE5] dark:bg-[#35231E] rounded-2xl border border-[#EBCDC2] dark:border-[#4D342D] text-xs text-[#9E4A35] dark:text-[#E29A86] space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-[13px]">
                  <Stethoscope className="w-4 h-4" />
                  <span>Cột mốc khám thai quan trọng: Tuần 12</span>
                </div>
                <p className="text-[12px] leading-relaxed text-[#5C3A31] dark:text-[#E8D5CF]">
                  Mốc đo độ mờ da gáy (NT) và xét nghiệm Double Test / NIPT để tầm soát hội chứng Down. Thời điểm vàng là 11 tuần đến 13 tuần 6 ngày.
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-[#1E1A17] rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-2">
                <h4 className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6]">
                  Chuẩn bị trước khi đi khám:
                </h4>
                <ul className="text-xs text-[#6B5D56] dark:text-[#C5B9B0] list-disc list-inside space-y-1">
                  <li>Mang theo Sổ theo dõi thai kỳ và kết quả siêu âm mốc trước.</li>
                  <li>Mặc đồ thoải mái, dễ di chuyển khi siêu âm bụng.</li>
                  <li>Chuẩn bị sẵn các thắc mắc để hỏi trực tiếp bác sĩ sản khoa.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Note Input for the session */}
          <div className="p-4 bg-white dark:bg-[#1E1A17] rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-2">
            <label className="text-xs font-semibold text-[#322622] dark:text-[#F4EDE6] block">
              Ghi chú kết quả thực hiện hôm nay:
            </label>
            <textarea
              rows={2}
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="VD: Cảm thấy lưng nhẹ nhõm, bé đạp nhẹ lúc nghe nhạc..."
              className="w-full p-2.5 bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] rounded-xl text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:ring-2 focus:ring-[#B55841]/30 resize-none"
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#E6DDD1] dark:border-[#362E2A] bg-white dark:bg-[#1E1A17] flex items-center gap-2.5">
          {activity.completed ? (
            <button
              onClick={() => {
                onUncompleteActivity(activity.id);
                onClose();
              }}
              className="flex-1 py-3 bg-[#F2ECE3] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-[#786962] dark:text-[#B5A89F] hover:text-[#B55841] font-semibold rounded-2xl text-xs cursor-pointer transition-colors min-h-[44px]"
            >
              Hủy đánh dấu hoàn thành
            </button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirmCompletion}
              className="flex-1 py-3 bg-[#B55841] hover:bg-[#9E4A35] text-white font-semibold rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác nhận hoàn thành hoạt động</span>
            </motion.button>
          )}

          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] text-xs font-semibold text-[#786962] dark:text-[#B5A89F] cursor-pointer min-h-[44px]"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
};
