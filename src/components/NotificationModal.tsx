import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bell,
  Calendar,
  Droplet,
  Sparkles,
  CheckCheck,
  ShieldAlert,
  Info,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { AppNotification, ScreenType } from '../types';
import { storageService } from '../services/storageService';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateScreen?: (screen: ScreenType) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onNavigateScreen,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    storageService.loadNotifications()
  );
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'appointment' | 'water'>('all');

  useEffect(() => {
    if (isOpen) {
      setNotifications(storageService.loadNotifications());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    const updated = storageService.markAllNotificationsAsRead();
    setNotifications(updated);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    const updated = storageService.markNotificationAsRead(notif.id);
    setNotifications(updated);
    if (notif.actionScreen && onNavigateScreen) {
      onClose();
      onNavigateScreen(notif.actionScreen);
    }
  };

  const handleDeleteNotif = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = storageService.deleteNotification(id);
    setNotifications(updated);
  };

  const filteredNotifs = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'appointment') return n.category === 'appointment';
    if (activeFilter === 'water') return n.category === 'water';
    return true;
  });

  const getCategoryIcon = (category: AppNotification['category']) => {
    switch (category) {
      case 'appointment':
        return <Calendar className="w-4 h-4 text-[#C84B4B]" />;
      case 'water':
        return <Droplet className="w-4 h-4 text-[#2980B9]" />;
      case 'milestone':
        return <Sparkles className="w-4 h-4 text-[#D35400]" />;
      case 'health':
        return <ShieldAlert className="w-4 h-4 text-[#E67E22]" />;
      default:
        return <Info className="w-4 h-4 text-[#8C7B75]" />;
    }
  };

  const getCategoryBg = (category: AppNotification['category']) => {
    switch (category) {
      case 'appointment':
        return 'bg-[#FCEEEB]';
      case 'water':
        return 'bg-[#EBF5FB]';
      case 'milestone':
        return 'bg-[#FEF5E7]';
      case 'health':
        return 'bg-[#FDF2E9]';
      default:
        return 'bg-[#F5F2EF]';
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-[520px] max-h-[85vh] bg-white rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col z-10 border border-[#F0ECE9]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE9]">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-[#FCEEEB] flex items-center justify-center text-[#C84B4B]">
                <Bell className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-[#3A2E2B]">
                  Trung tâm thông báo
                </h2>
                <p className="text-[11px] text-[#8C7B75]">
                  {unreadCount > 0
                    ? `Bạn có ${unreadCount} thông báo mới chưa đọc`
                    : 'Tất cả thông báo đã được xem'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#FAF6F3] text-[#8C7B75] flex items-center justify-center hover:bg-[#EFEAE5] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1.5 py-3 border-b border-[#FAF6F3] overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#3A2E2B] text-white shadow-xs'
                  : 'bg-[#FAF6F3] text-[#6E5D57] hover:bg-[#EFEAE5]'
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === 'unread'
                  ? 'bg-[#C84B4B] text-white shadow-xs'
                  : 'bg-[#FAF6F3] text-[#6E5D57] hover:bg-[#EFEAE5]'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
            <button
              onClick={() => setActiveFilter('appointment')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === 'appointment'
                  ? 'bg-[#3A2E2B] text-white shadow-xs'
                  : 'bg-[#FAF6F3] text-[#6E5D57] hover:bg-[#EFEAE5]'
              }`}
            >
              Lịch khám
            </button>
            <button
              onClick={() => setActiveFilter('water')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === 'water'
                  ? 'bg-[#3A2E2B] text-white shadow-xs'
                  : 'bg-[#FAF6F3] text-[#6E5D57] hover:bg-[#EFEAE5]'
              }`}
            >
              Uống nước
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2.5 no-scrollbar min-h-[220px]">
            {filteredNotifs.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center text-[#8C7B75]">
                <Bell className="w-8 h-8 text-[#DDD6CF] mb-2" />
                <p className="text-xs font-medium">Không có thông báo nào trong mục này</p>
              </div>
            ) : (
              filteredNotifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                    n.isRead
                      ? 'bg-white border-[#F0ECE9] hover:border-[#DDD6CF]'
                      : 'bg-[#FFF9F6] border-[#F5DDD7] hover:border-[#E8A598] shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl ${getCategoryBg(
                        n.category
                      )} flex items-center justify-center shrink-0 mt-0.5`}
                    >
                      {getCategoryIcon(n.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`text-xs ${n.isRead ? 'font-medium text-[#3A2E2B]' : 'font-bold text-[#C84B4B]'} truncate`}>
                          {n.title}
                        </h3>
                        <span className="text-[10px] text-[#8C7B75] shrink-0">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-[#6E5D57] leading-relaxed mt-1 line-clamp-2">
                        {n.description}
                      </p>
                      {n.actionScreen && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F5EFEA]">
                          <span className="text-[10px] font-bold text-[#C84B4B] flex items-center gap-0.5">
                            Xem chi tiết <ChevronRight className="w-3 h-3" />
                          </span>
                          <button
                            onClick={(e) => handleDeleteNotif(n.id, e)}
                            className="p-1 text-[#BBB0A8] hover:text-[#C84B4B] transition-colors cursor-pointer"
                            title="Xóa thông báo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#F0ECE9] flex items-center justify-between gap-3">
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                unreadCount > 0
                  ? 'bg-[#FAF6F3] hover:bg-[#F2ECE7] text-[#3A2E2B] cursor-pointer'
                  : 'bg-[#FAF6F3] text-[#BBB0A8] cursor-not-allowed opacity-60'
              }`}
            >
              <CheckCheck className="w-4 h-4 text-[#2ECC71]" />
              <span>Đánh dấu tất cả đã đọc</span>
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-5 bg-[#3A2E2B] hover:bg-[#2A2321] text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
