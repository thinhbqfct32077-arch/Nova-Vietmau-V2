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
  Video,
  MessageSquareHeart,
  ShoppingBag,
  HeartHandshake,
  SlidersHorizontal,
} from 'lucide-react';
import { AppNotification, NotificationPreferences, ScreenType, UserProfile } from '../types';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';

interface NotificationModalProps {
  isOpen: boolean;
  user?: UserProfile;
  onClose: () => void;
  onNavigateScreen?: (screen: ScreenType) => void;
  onNavigateNotification?: (notif: AppNotification) => void;
  onUnreadCountChange?: (count: number) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  user,
  onClose,
  onNavigateScreen,
  onNavigateNotification,
  onUnreadCountChange,
}) => {
  const [serverNotifs, setServerNotifs] = useState<AppNotification[]>([]);
  const [localNotifs, setLocalNotifs] = useState<AppNotification[]>(() =>
    storageService.loadNotifications()
  );
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    videoEnabled: true,
    communityEnabled: true,
    reminderSoundEnabled: true,
    shopEnabled: true,
    familyEnabled: true,
  });
  const [showPrefs, setShowPrefs] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'unread' | 'community' | 'video' | 'appointment' | 'water' | 'shop' | 'family' | 'system'
  >('all');

  useEffect(() => {
    if (!isOpen) return;
    setLocalNotifs(storageService.loadNotifications());
    apiService
      .fetchNotifications('all', user)
      .then((list) => setServerNotifs(list))
      .catch(() => {});
    apiService
      .fetchNotificationPrefs(user)
      .then((p) => setPrefs((prev) => ({ ...prev, ...p })))
      .catch(() => {});
  }, [isOpen, user?.id]);

  const notifications = [...serverNotifs, ...localNotifs];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [unreadCount, onUnreadCountChange]);

  if (!isOpen) return null;

  const handleTogglePref = async (key: keyof NotificationPreferences) => {
    const nextVal = !prefs[key];
    setPrefs((prev) => ({ ...prev, [key]: nextVal }));
    try {
      const updated = await apiService.updateNotificationPrefs({ [key]: nextVal }, user);
      setPrefs((prev) => ({ ...prev, ...updated }));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    const updatedLocal = storageService.markAllNotificationsAsRead();
    setLocalNotifs(updatedLocal);
    try {
      const updatedServer = await apiService.markAllNotificationsRead('all', user);
      setServerNotifs(updatedServer);
    } catch {}
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    const isServer = serverNotifs.some((s) => s.id === notif.id);
    if (isServer) {
      try {
        const updated = await apiService.markNotificationRead(notif.id, user);
        setServerNotifs(updated);
      } catch {}
    } else {
      setLocalNotifs(storageService.markNotificationAsRead(notif.id));
    }

    if (onNavigateNotification) {
      onClose();
      onNavigateNotification(notif);
    } else if (notif.actionScreen && onNavigateScreen) {
      onClose();
      onNavigateScreen(notif.actionScreen);
    }
  };

  const handleDeleteNotif = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isServer = serverNotifs.some((s) => s.id === id);
    if (isServer) {
      try {
        const updated = await apiService.deleteNotification(id, user);
        setServerNotifs(updated);
      } catch {}
    } else {
      setLocalNotifs(storageService.deleteNotification(id));
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'all') return true;
    return n.category === activeFilter;
  });

  const getCategoryIcon = (category: AppNotification['category']) => {
    switch (category) {
      case 'appointment':
        return <Calendar className="w-4 h-4 text-nova-accent" />;
      case 'water':
        return <Droplet className="w-4 h-4 text-nova-sage-text" />;
      case 'milestone':
        return <Sparkles className="w-4 h-4 text-nova-warning" />;
      case 'health':
        return <ShieldAlert className="w-4 h-4 text-nova-danger" />;
      case 'video':
        return <Video className="w-4 h-4 text-nova-accent" />;
      case 'community':
        return <MessageSquareHeart className="w-4 h-4 text-nova-accent" />;
      case 'shop':
        return <ShoppingBag className="w-4 h-4 text-nova-warning" />;
      case 'family':
        return <HeartHandshake className="w-4 h-4 text-nova-sage-text" />;
      default:
        return <Info className="w-4 h-4 text-nova-icon" />;
    }
  };

  const getCategoryBg = (category: AppNotification['category']) => {
    switch (category) {
      case 'health':
        return 'bg-nova-danger-soft';
      case 'appointment':
      case 'community':
      case 'video':
        return 'bg-nova-accent-soft';
      case 'water':
      case 'family':
        return 'bg-nova-sage-soft';
      case 'milestone':
      case 'shop':
        return 'bg-nova-warning-soft';
      default:
        return 'bg-nova-bg-subtle';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none print:hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#1C1B18]/60 backdrop-blur-xs cursor-pointer"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-[560px] max-h-[86vh] bg-nova-bg rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col z-10 border border-nova-border"
        >
          <div className="flex items-center justify-between pb-3 border-b border-nova-border">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-nova-accent-soft border border-nova-border flex items-center justify-center text-nova-accent">
                <Bell className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="font-editorial text-[19px] font-bold text-nova-text leading-tight">
                  Trung tâm thông báo
                </h2>
                <p className="text-[11px] text-nova-text-muted tabular-nums">
                  {unreadCount > 0
                    ? `Mẹ có ${unreadCount} thông báo chưa đọc`
                    : 'Không có thông báo mới chưa đọc'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowPrefs(!showPrefs)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                  showPrefs
                    ? 'bg-nova-accent text-nova-accent-contrast'
                    : 'bg-nova-bg-subtle text-nova-text-muted hover:bg-nova-accent-soft hover:text-nova-text'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Tùy chọn</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng thông báo"
                className="w-9 h-9 rounded-full bg-nova-bg-subtle text-nova-text-muted flex items-center justify-center hover:bg-nova-accent-soft transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {showPrefs && (
            <div className="my-3 p-3.5 rounded-2xl bg-nova-surface border border-nova-border space-y-2">
              <p className="text-xs font-bold text-nova-text">
                Tùy chỉnh loại thông báo muốn nhận
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'videoEnabled' as const, label: 'Video thai giáo mới' },
                  { key: 'communityEnabled' as const, label: 'Tương tác cộng đồng' },
                  { key: 'shopEnabled' as const, label: 'Đơn hàng & Vận chuyển' },
                  { key: 'familyEnabled' as const, label: 'Chia sẻ Gia đình Nova' },
                  { key: 'reminderSoundEnabled' as const, label: 'Âm báo nhắc lịch' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-nova-bg border border-nova-border cursor-pointer"
                  >
                    <span className="text-[11.5px] font-medium text-nova-text-muted truncate">
                      {item.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={Boolean(prefs[item.key])}
                      onChange={() => handleTogglePref(item.key)}
                      className="accent-nova-accent w-4 h-4 cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 py-3 border-b border-nova-border overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: `Tất cả (${notifications.length})` },
              { id: 'unread', label: `Chưa đọc (${unreadCount})` },
              { id: 'appointment', label: 'Lịch khám' },
              { id: 'water', label: 'Nhắc nhở' },
              { id: 'community', label: 'Cộng đồng' },
              { id: 'video', label: 'Video' },
              { id: 'shop', label: 'Đơn hàng' },
              { id: 'family', label: 'Gia đình' },
              { id: 'system', label: 'Hệ thống' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer tabular-nums ${
                  activeFilter === tab.id
                    ? 'bg-nova-accent text-nova-accent-contrast shadow-xs'
                    : 'bg-nova-bg-subtle text-nova-text-muted hover:bg-nova-accent-soft hover:text-nova-text'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-2.5 no-scrollbar min-h-[220px]">
            {filteredNotifs.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center text-nova-text-muted">
                <div className="w-12 h-12 rounded-2xl bg-nova-bg-subtle border border-nova-border flex items-center justify-center mb-2.5">
                  <Bell className="w-6 h-6 text-nova-icon" />
                </div>
                <p className="font-editorial text-[15px] font-semibold text-nova-text">
                  Chưa có thông báo nào trong mục này
                </p>
              </div>
            ) : (
              filteredNotifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                    n.isRead
                      ? 'bg-nova-surface border-nova-border hover:border-nova-taupe'
                      : 'bg-nova-accent-soft border-nova-taupe/60 hover:border-nova-accent shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl ${getCategoryBg(n.category)} flex items-center justify-center shrink-0 mt-0.5`}
                    >
                      {getCategoryIcon(n.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3
                          className={`text-xs ${
                            n.isRead
                              ? 'font-semibold text-nova-text'
                              : 'font-bold text-nova-accent'
                          } truncate`}
                        >
                          {n.title}
                        </h3>
                        <span className="text-[10px] text-nova-text-muted shrink-0 tabular-nums">
                          {n.timestamp}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-nova-text-muted leading-relaxed mt-1 line-clamp-2">
                        {n.description}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-nova-border">
                        {n.actionScreen ? (
                          <span className="text-[10.5px] font-bold text-nova-accent flex items-center gap-0.5">
                            Xem chi tiết <ChevronRight className="w-3 h-3" />
                          </span>
                        ) : (
                          <span />
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteNotif(n.id, e)}
                          className="p-1 text-nova-icon hover:text-nova-danger transition-colors cursor-pointer"
                          title="Xóa thông báo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-nova-border flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                unreadCount > 0
                  ? 'bg-nova-bg-subtle hover:bg-nova-accent-soft text-nova-text cursor-pointer'
                  : 'bg-nova-bg-subtle text-nova-text-muted cursor-not-allowed opacity-60'
              }`}
            >
              <CheckCheck className="w-4 h-4 text-nova-sage-text" />
              <span>Đánh dấu tất cả đã đọc</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] py-2.5 px-6 bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast rounded-2xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
