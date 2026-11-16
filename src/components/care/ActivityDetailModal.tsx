import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Volume2,
  VolumeX,
  Activity,
  Music,
  Stethoscope,
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
}) => {
  const [timerSeconds, setTimerSeconds] = useState(15 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [notesInput, setNotesInput] = useState('');

  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const ambientStreamRef = useRef<{ stop: () => void } | null>(null);

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
        colors: ['#51483F', '#A3A795', '#B8AA98', '#EDE7DE'],
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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#1C1B18]/60 backdrop-blur-xs p-0 md:p-4">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="w-full max-w-[430px] max-h-[92vh] bg-nova-bg rounded-t-[32px] md:rounded-[32px] border border-nova-border shadow-2xl flex flex-col overflow-hidden text-nova-text"
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3.5 border-b border-nova-border bg-nova-surface flex items-center justify-between shrink-0">
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
                <h2 className="font-editorial text-[18px] font-semibold text-nova-text leading-tight truncate">
                  {activity.title}
                </h2>
                {activity.completed && (
                  <span className="text-[11px] font-semibold text-nova-sage-text flex items-center gap-1 whitespace-nowrap">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã hoàn thành
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-nova-text-muted mt-0.5">
                {activity.subtitle} · {activity.timeTarget}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-nova-bg-subtle hover:bg-nova-accent-soft text-nova-icon flex items-center justify-center cursor-pointer transition-colors shrink-0"
            aria-label="Đóng"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
          {activity.category === 'yoga' && (
            <div className="space-y-4">
              <div className="p-5 bg-nova-surface rounded-[26px] border border-nova-border flex flex-col items-center">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-nova-accent mb-2">
                  Đồng hồ bấm giờ & Nhịp thở
                </span>

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
                    className="absolute w-32 h-32 rounded-full bg-nova-accent-soft pointer-events-none"
                  />
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="font-editorial text-3xl font-semibold text-nova-accent tracking-tight tabular-nums">
                      {mins}:{secs}
                    </span>
                    <span className="text-[11px] font-medium text-nova-text-muted mt-0.5">
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

                <div className="flex gap-2 mb-3.5">
                  {[10, 15, 20].map((m) => (
                    <button
                      key={m}
                      onClick={() => handleResetTimer(m)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                        selectedDuration === m
                          ? 'bg-nova-accent text-nova-accent-contrast border-nova-accent'
                          : 'bg-nova-bg-subtle text-nova-text-muted border-nova-border'
                      }`}
                    >
                      {m} phút
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className="px-5 py-2.5 rounded-2xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors min-h-[44px]"
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
                    className="p-2.5 rounded-2xl bg-nova-bg-subtle border border-nova-border text-nova-icon hover:text-nova-accent cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Đặt lại giờ"
                    aria-label="Đặt lại giờ"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-nova-surface rounded-2xl border border-nova-border space-y-2.5">
                <h4 className="text-xs font-semibold text-nova-text">
                  3 động tác Yoga bầu an toàn:
                </h4>
                <div className="space-y-2 text-xs text-nova-text-muted">
                  <div className="p-3 bg-nova-bg-subtle rounded-xl leading-relaxed">
                    <strong className="text-nova-text">1. Tư thế Con mèo - Con bò:</strong> Quỳ 4 điểm, hít vào võng nhẹ lưng nhìn lên, thở ra cong lưng cúi đầu giúp giảm áp lực cột sống.
                  </div>
                  <div className="p-3 bg-nova-bg-subtle rounded-xl leading-relaxed">
                    <strong className="text-nova-text">2. Tư thế Em bé mở rộng:</strong> Quỳ mở rộng hai gối để nhường chỗ cho bụng bầu, hạ trán chạm thảm, vươn dài hai tay thư giãn vùng hông.
                  </div>
                  <div className="p-3 bg-nova-bg-subtle rounded-xl leading-relaxed">
                    <strong className="text-nova-text">3. Bài tập Kegel sàn chậu:</strong> Co nhẹ cơ sàn chậu 5 giây rồi thả lỏng 5 giây, lặp lại 10 lần giúp tăng sức bền khi sinh nở.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activity.category === 'music' && (
            <div className="space-y-4">
              <div className="p-5 bg-nova-surface rounded-[26px] border border-nova-border flex flex-col items-center">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-nova-sage-text mb-2">
                  Âm thanh thư giãn & Thai giáo 432Hz
                </span>

                <div className="w-24 h-24 rounded-full bg-nova-sage-soft text-nova-sage-text flex items-center justify-center my-3 relative">
                  {isPlayingMusic && (
                    <motion.div
                      animate={{ scale: [1, 1.35, 1], opacity: [0.55, 0.2, 0.55] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0 rounded-full border-2 border-nova-sage"
                    />
                  )}
                  <Music className="w-10 h-10 stroke-[2]" />
                </div>

                <h3 className="font-editorial text-base font-semibold text-nova-text mb-1 text-center">
                  Bản giao hưởng Mozart & Tần số 432Hz
                </h3>
                <p className="text-[11.5px] text-nova-text-muted mb-4 text-center max-w-[280px]">
                  Âm thanh êm dịu giúp mẹ thư giãn và hỗ trợ phát triển thính giác của bé
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleMusicPlay}
                    className="px-6 py-2.5 rounded-2xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors min-h-[44px]"
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

              <div className="p-4 bg-nova-surface rounded-2xl border border-nova-border text-xs text-nova-text-muted space-y-1.5 leading-relaxed">
                <strong className="text-nova-text block">Lợi ích thai giáo âm thanh:</strong>
                <p>• Từ tuần 16, thai nhi đã bắt đầu phản ứng nhẹ với âm thanh bên ngoài.</p>
                <p>• Nghe nhạc ở mức âm lượng dịu nhẹ dưới 60dB giúp mẹ thư giãn tinh thần và nghỉ ngơi tốt hơn.</p>
              </div>
            </div>
          )}

          {activity.category === 'checkup' && (
            <div className="space-y-3.5">
              <div className="p-4 bg-nova-accent-soft rounded-2xl border border-nova-border text-xs text-nova-text space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-[13px] text-nova-accent">
                  <Stethoscope className="w-4 h-4" />
                  <span>Cột mốc khám thai quan trọng: Tuần 12</span>
                </div>
                <p className="text-[12px] leading-relaxed text-nova-text-muted">
                  Mốc đo độ mờ da gáy và xét nghiệm sàng lọc theo tư vấn bác sĩ. Thời điểm phù hợp thường từ 11 tuần đến 13 tuần 6 ngày.
                </p>
              </div>

              <div className="p-4 bg-nova-surface rounded-2xl border border-nova-border space-y-2">
                <h4 className="text-xs font-semibold text-nova-text">
                  Chuẩn bị trước khi đi khám:
                </h4>
                <ul className="text-xs text-nova-text-muted list-disc list-inside space-y-1">
                  <li>Mang theo sổ theo dõi thai kỳ và kết quả siêu âm các lần trước.</li>
                  <li>Mặc trang phục rộng rãi, thoải mái khi siêu âm.</li>
                  <li>Ghi chú sẵn các câu hỏi cần trao đổi trực tiếp với bác sĩ sản khoa.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Note Input */}
          <div className="p-4 bg-nova-surface rounded-2xl border border-nova-border space-y-2">
            <label className="text-xs font-semibold text-nova-text block">
              Ghi chú kết quả thực hiện hôm nay:
            </label>
            <textarea
              rows={2}
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Ví dụ: Cảm thấy lưng nhẹ nhõm, bé đạp nhẹ lúc nghe nhạc..."
              className="w-full p-2.5 bg-nova-bg-subtle border border-nova-border rounded-xl text-xs text-nova-text focus:outline-none focus:border-nova-accent resize-none"
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-nova-border bg-nova-surface flex items-center gap-2.5">
          {activity.completed ? (
            <button
              onClick={() => {
                onUncompleteActivity(activity.id);
                onClose();
              }}
              className="flex-1 py-3 bg-nova-bg-subtle border border-nova-border text-nova-text-muted hover:text-nova-danger font-semibold rounded-2xl text-xs cursor-pointer transition-colors min-h-[44px]"
            >
              Hủy đánh dấu hoàn thành
            </button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirmCompletion}
              className="flex-1 py-3 bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast font-semibold rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác nhận hoàn thành</span>
            </motion.button>
          )}

          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl border border-nova-border text-xs font-semibold text-nova-text-muted cursor-pointer min-h-[44px]"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
};
