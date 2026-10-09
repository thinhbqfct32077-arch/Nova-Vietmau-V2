import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  WEEKLY_PROGRESS_DATA,
  INITIAL_ACTIVITIES,
} from '../../data/mockData';
import { ActivityItem } from '../../types';
import {
  Heart,
  Droplet,
  Sparkles,
  Music,
  Stethoscope,
  Activity,
  CheckCircle,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CarePlanScreen: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [selectedDayIndex, setSelectedDayIndex] = useState(5); // Saturday (Thứ 7 is index 5)
  const [poppingId, setPoppingId] = useState<string | null>(null);

  const toggleHeart = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPoppingId(id);

    setActivities((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.completed;
          if (nextState) {
            // Trigger joyful mini confetti particle pop
            try {
              confetti({
                particleCount: 22,
                spread: 45,
                origin: { y: 0.7 },
                colors: ['#C84B4B', '#FCEEEB', '#F39C12', '#2ECC71'],
                disableForReducedMotion: true,
              });
            } catch {
              // fallback
            }
          }
          return { ...item, completed: nextState };
        }
        return item;
      })
    );

    setTimeout(() => {
      setPoppingId(null);
    }, 450);
  };

  const getCategoryIcon = (category: ActivityItem['category']) => {
    switch (category) {
      case 'water':
        return <Droplet className="w-5 h-5 fill-current" />;
      case 'yoga':
        return <Activity className="w-5 h-5 stroke-[2.2]" />;
      case 'music':
        return <Music className="w-5 h-5 stroke-[2.2]" />;
      case 'checkup':
        return <Stethoscope className="w-5 h-5 stroke-[2.2]" />;
      default:
        return <Sparkles className="w-5 h-5 stroke-[2]" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col px-5 pt-3 pb-6 overflow-y-auto no-scrollbar select-none bg-[#FFFBF7]">
      {/* Header (Hình 2) */}
      <header className="mb-4">
        <h1 className="text-[24px] font-bold text-[#3A2E2B] tracking-tight leading-tight">
          Kế hoạch chăm sóc
        </h1>
        <p className="text-[12px] font-medium text-[#8C7B75] mt-0.5">
          Mỗi ngày một chút, mẹ và bé sẽ khỏe hơn
        </p>
      </header>

      {/* Thẻ "Tiến độ tuần này" với Biểu đồ cột Spring Animation (Hình 2) */}
      <div className="bg-white rounded-[24px] p-5 ios-card-shadow border border-[#F2ECE7] mb-5">
        {/* Top of Card */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold text-[#3A2E2B] tracking-tight">
              Tiến độ tuần này
            </h2>
            <span className="text-[11px] text-[#8C7B75]">
              (Tuần 12)
            </span>
          </div>

          {/* Pill "82% Đạt" */}
          <div className="bg-[#FCEEEB] text-[#C84B4B] text-[12px] font-bold px-3 py-1 rounded-full shadow-2xs">
            82% Đạt
          </div>
        </div>

        {/* Dynamic Spring Bar Chart */}
        <div className="h-44 pt-3 pb-1 flex items-end justify-between gap-2.5">
          {WEEKLY_PROGRESS_DATA.map((item, index) => {
            const isSelected = selectedDayIndex === index;
            const isHighest = item.isPeak;

            return (
              <div
                key={item.shortDay}
                onClick={() => setSelectedDayIndex(index)}
                className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
              >
                {/* Tooltip Percentage */}
                <span
                  className={`text-[10px] font-semibold mb-1 transition-all ${
                    isHighest || isSelected
                      ? 'text-[#C84B4B] font-bold opacity-100 scale-100'
                      : 'text-[#8C7B75] opacity-0 group-hover:opacity-100 scale-90'
                  }`}
                >
                  {item.percent}%
                </span>

                {/* Bar Track Background */}
                <div className="w-full max-w-[28px] h-28 bg-[#F4EFEA] rounded-full p-0.5 flex flex-col justify-end relative overflow-hidden">
                  {/* Dynamic Spring Filled Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${item.percent}%` }}
                    transition={{
                      type: 'spring',
                      stiffness: isHighest ? 200 : 160,
                      damping: isHighest ? 15 : 20,
                      delay: index * 0.06,
                    }}
                    className={`w-full rounded-full transition-colors ${
                      isHighest
                        ? 'bg-[#C84B4B] shadow-sm shadow-[#C84B4B]/30'
                        : isSelected
                        ? 'bg-[#E58383]'
                        : 'bg-[#D6CBC4] group-hover:bg-[#C2B5AC]'
                    }`}
                  />
                </div>

                {/* Day Label (Th 2 ... CN) */}
                <span
                  className={`text-[11px] mt-2 font-medium transition-colors ${
                    isHighest || isSelected
                      ? 'text-[#C84B4B] font-bold'
                      : 'text-[#8C7B75]'
                  }`}
                >
                  {item.shortDay}
                </span>
              </div>
            );
          })}
        </div>

        {/* Daily Summary Note */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#6E5D57]">
          <span>Thứ 7: Hoàn thành 4/4 mục tiêu sức khỏe</span>
          <span className="text-[#C84B4B] font-semibold">Xuất sắc ✨</span>
        </div>
      </div>

      {/* Danh sách "Hoạt động hôm nay" (Hình 2) */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-[16px] font-bold text-[#3A2E2B] tracking-tight">
            Hoạt động hôm nay
          </h2>
          <span className="text-[11px] font-semibold text-[#8C7B75]">
            {activities.filter((a) => a.completed).length}/{activities.length} Đã xong
          </span>
        </div>

        {/* 4 Interactive Activity Rows with Heart Particle Pop */}
        <div className="flex flex-col gap-3">
          {activities.map((activity, idx) => {
            const isPopping = poppingId === activity.id;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  x: isPopping ? [0, -3, 3, -1, 1, 0] : 0,
                }}
                whileHover={{ y: -2, scale: 1.015 }}
                whileTap={{ scale: 0.96 }}
                transition={{
                  opacity: { delay: idx * 0.05 },
                  x: { duration: 0.35 },
                  type: 'spring',
                  stiffness: 420,
                  damping: 24,
                }}
                onClick={(e) => toggleHeart(activity.id, e)}
                className={`bg-white rounded-[22px] p-4 ios-card-shadow border transition-all cursor-pointer flex items-center justify-between group ${
                  activity.completed
                    ? 'border-[#F0ECE9] bg-white'
                    : 'border-[#F2ECE7] hover:border-[#E8DFD8]'
                }`}
              >
                {/* Left Category Icon & Info */}
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl ${activity.iconBg} ${activity.iconColor} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
                  >
                    {getCategoryIcon(activity.category)}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-[15px] font-bold tracking-tight transition-colors ${
                          activity.completed
                            ? 'text-[#3A2E2B] line-through decoration-[#C84B4B]/40 decoration-2'
                            : 'text-[#3A2E2B]'
                        }`}
                      >
                        {activity.title}
                      </h3>
                      {activity.completed && (
                        <CheckCircle className="w-3.5 h-3.5 text-[#2ECC71] inline" />
                      )}
                    </div>
                    <p className="text-[12px] font-medium text-[#8C7B75] mt-0.5">
                      {activity.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right Heart Outline / Filled Button with Particle Pop */}
                <motion.button
                  whileTap={{ scale: 0.75 }}
                  onClick={(e) => toggleHeart(activity.id, e)}
                  animate={
                    isPopping
                      ? {
                          scale: [1, 1.45, 1],
                        }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    activity.completed
                      ? 'bg-[#FCEEEB] text-[#C84B4B]'
                      : 'bg-[#F9F6F3] text-[#A69B96] hover:text-[#C84B4B]'
                  }`}
                  aria-label={`Đánh dấu ${activity.title}`}
                >
                  <Heart
                    className={`w-5 h-5 transition-transform duration-200 ${
                      activity.completed
                        ? 'text-[#C84B4B] fill-[#C84B4B]'
                        : 'stroke-[2]'
                    }`}
                  />
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
