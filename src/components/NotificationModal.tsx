import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Calendar, Droplet, Sparkles, CheckCheck } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (action: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'notif-1',
      title: 'Lịch khám thai tuần 12',
      time: '15:00 Ngày mai',
      desc: 'Bác sĩ sản khoa - Siêu âm đo độ mờ da gáy tại Bệnh viện Phụ Sản.',
      icon: Calendar,
      iconBg: 'bg-[#FCEEEB]',
      iconColor: 'text-[#C84B4B]',
      unread: true,
    },
    {
      id: 'notif-2',
      title: 'Nhắc uống nước giờ trưa',
      time: '12:00 Hôm nay',
      desc: 'Mẹ đã uống được 1.2 lít rồi, thêm 1 cốc nước ấm sau bữa ăn nhé!',
      icon: Droplet,
      iconBg: 'bg-[#EBF5FB]',
      iconColor: 'text-[#2980B9]',
      unread: true,
    },
    {
      id: 'notif-3',
      title: 'Tuần mới, cột mốc mới!',
      time: 'Hôm qua',
      desc: 'Em bé đã bước sang tuần thứ 12, kích thước tương đương một quả chanh vàng.',
      icon: Sparkles,
      iconBg: 'bg-[#FEF5E7]',
      iconColor: 'text-[#D35400]',
      unread: false,
    },
  ];

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-end justify-center select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/45 backdrop-blur-xs cursor-pointer"
        />

        {/* Slide-Up Sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-h-[85%] bg-white rounded-t-[32px] p-5 shadow-2xl flex flex-col z-10 border-t border-[#F0ECE9]"
        >
          {/* Drag Handle */}
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#C84B4B]" />
              <h2 className="text-[17px] font-bold text-[#3A2E2B]">
                Thông báo thai kỳ
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#FAF6F3] text-[#8C7B75] flex items-center justify-center hover:bg-[#EFEAE5] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 no-scrollbar">
            {notifications.map((n) => {
              const Icon = n.icon;
              return (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    n.unread
                      ? 'bg-[#FFFBF9] border-[#F5DDD7]'
                      : 'bg-white border-[#F0ECE9]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl ${n.iconBg} ${n.iconColor} flex items-center justify-center shrink-0`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-[#3A2E2B]">
                          {n.title}
                        </h3>
                        <span className="text-[10px] text-[#8C7B75]">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-[#6E5D57] leading-relaxed mt-1">
                        {n.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-gray-100">
            <button
              onClick={onClose}
              className="w-full py-3 bg-[#FAF6F3] hover:bg-[#F2ECE7] text-[#3A2E2B] rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-[#2ECC71]" />
              <span>Đã xem tất cả thông báo</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
