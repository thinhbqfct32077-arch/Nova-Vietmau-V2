/**
 * Notification & Audio Chime Service for Nova Care Health Reminders
 * Integrates Web Notification API, Web Audio API chime synthesis, and in-app event dispatcher.
 */

import { HealthReminder } from '../types';

export function shouldReminderTriggerAt(reminder: HealthReminder, now: Date): boolean {
  if (!reminder.isEnabled) return false;

  const currentHours = now.getHours().toString().padStart(2, '0');
  const currentMinutes = now.getMinutes().toString().padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;
  if (reminder.time !== currentTimeStr) return false;

  const todayDateStr = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  const currentDayOfWeek = now.getDay();

  if (reminder.frequency === 'once') {
    return !reminder.date || reminder.date === todayDateStr;
  }

  // For repeating schedules, if an explicit start date is provided, do not fire before start date
  if (reminder.date && todayDateStr < reminder.date) {
    return false;
  }

  if (reminder.frequency === 'daily') {
    return true;
  }

  if (reminder.frequency === 'weekly') {
    if (Array.isArray(reminder.daysOfWeek) && reminder.daysOfWeek.length > 0) {
      return reminder.daysOfWeek.includes(currentDayOfWeek);
    }
    if (reminder.date) {
      const [y, m, d] = reminder.date.split('-').map(Number);
      if (y && m && d) {
        const startDay = new Date(y, m - 1, d).getDay();
        return startDay === currentDayOfWeek;
      }
    }
    return true;
  }

  if (reminder.frequency === 'custom_days' && Array.isArray(reminder.daysOfWeek)) {
    return reminder.daysOfWeek.includes(currentDayOfWeek);
  }

  return false;
}

export interface PlatformNotificationGuide {
  platformLabel: string;
  title: string;
  steps: string[];
}

class NotificationService {
  private audioCtx: AudioContext | null = null;
  private intervalId: number | null = null;
  private lastTriggeredMap: Record<string, string> = {};

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.initAudio();
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
      window.addEventListener('click', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
    }
  }

  private initAudio() {
    if (typeof window !== 'undefined' && !this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  public playChime(volume = 0.3) {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const chords = [
        { freq: 528, delay: 0 },
        { freq: 660, delay: 0.12 },
        { freq: 792, delay: 0.24 },
        { freq: 1056, delay: 0.38 },
      ];

      chords.forEach(({ freq, delay }) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(volume, now + delay + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.8);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 2.0);
      });
    } catch (err) {
      console.warn('[NotificationService] Audio chime failed:', err);
    }
  }

  public createAmbientStream(durationSec = 600): { stop: () => void } {
    try {
      this.initAudio();
      if (!this.audioCtx) return { stop: () => {} };

      const baseFreq = 432;
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(baseFreq, this.audioCtx.currentTime);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(baseFreq * 1.5, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, this.audioCtx.currentTime + 3);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc1.start();
      osc2.start();

      let stopped = false;
      const stop = () => {
        if (stopped || !this.audioCtx) return;
        stopped = true;
        try {
          const t = this.audioCtx.currentTime;
          gain.gain.linearRampToValueAtTime(0.0001, t + 1.5);
          setTimeout(() => {
            try {
              osc1.stop();
              osc2.stop();
            } catch {}
          }, 1600);
        } catch {}
      };

      if (durationSec > 0) {
        setTimeout(stop, durationSec * 1000);
      }

      return { stop };
    } catch {
      return { stop: () => {} };
    }
  }

  public isNotificationSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!this.isNotificationSupported()) return 'unsupported';
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!this.isNotificationSupported()) return 'unsupported';
    try {
      const status = await Notification.requestPermission();
      return status;
    } catch {
      return 'denied';
    }
  }

  public getPlatformNotificationGuide(): PlatformNotificationGuide {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);

    if (isIOS) {
      return {
        platformLabel: 'iOS (iPhone / iPad)',
        title: 'Hướng dẫn bật thông báo trên iOS',
        steps: [
          'Nhấn nút Chia sẻ (biểu tượng mũi tên lên) trên Safari và chọn "Thêm vào MH chính".',
          'Mở ứng dụng Nova Việt Mẫu từ màn hình chính.',
          'Vào Cài đặt iPhone -> Thông báo -> Nova Việt Mẫu -> Bật Cho phép thông báo.',
        ],
      };
    }

    if (isAndroid) {
      return {
        platformLabel: 'Android (Chrome / Trình duyệt)',
        title: 'Hướng dẫn bật thông báo trên Android',
        steps: [
          'Chạm biểu tượng ổ khóa (hoặc Cài đặt trang web) bên cạnh thanh địa chỉ trình duyệt.',
          'Chọn Quyền -> Thông báo -> Chuyển sang "Cho phép".',
          'Nếu thông báo hệ thống vẫn bị tắt, mở Cài đặt Android -> Ứng dụng -> Chrome -> Thông báo để bật.',
        ],
      };
    }

    return {
      platformLabel: 'Windows / Desktop',
      title: 'Hướng dẫn bật thông báo trên trình duyệt máy tính',
      steps: [
        'Nhấn vào biểu tượng ổ khóa / cài đặt bên trái thanh địa chỉ (URL).',
        'Tìm mục Thông báo (Notifications) và chọn "Cho phép" (Allow).',
        'Kiểm tra Windows Settings -> System -> Notifications để đảm bảo trình duyệt không bị tắt thông báo.',
      ],
    };
  }

  public triggerReminderAlert(reminder: HealthReminder): void {
    this.playChime(0.35);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100, 300]);
      } catch {}
    }

    if (this.isNotificationSupported() && Notification.permission === 'granted') {
      try {
        const notif = new Notification(`Nhắc nhở: ${reminder.title}`, {
          body: reminder.notes || 'Đã đến giờ chăm sóc sức khỏe mẹ và bé cùng Nova!',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `nova-reminder-${reminder.id}`,
          requireInteraction: false,
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (err) {
        console.warn('[NotificationService] System notification failed:', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('nova_health_alert', {
          detail: {
            reminder,
            timestamp: new Date().toISOString(),
          },
        })
      );
    }
  }

  public startReminderWatcher(getReminders: () => HealthReminder[]) {
    if (this.intervalId) return;

    const checkReminders = () => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayDateStr = `${now.getFullYear()}-${(now.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

      const reminders = getReminders();

      reminders.forEach((r) => {
        if (!shouldReminderTriggerAt(r, now)) return;

        const triggerKey = `${r.id}_${todayDateStr}_${currentTimeStr}`;
        if (this.lastTriggeredMap[triggerKey]) return;

        this.lastTriggeredMap[triggerKey] = new Date().toISOString();
        this.triggerReminderAlert(r);
      });
    };

    checkReminders();
    if (typeof window !== 'undefined') {
      this.intervalId = window.setInterval(checkReminders, 20000);
    }
  }

  public stopReminderWatcher() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const notificationService = new NotificationService();
