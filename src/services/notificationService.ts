/**
 * Notification & Audio Chime Service for Nova Care Health Reminders
 * Integrates Web Notification API, Web Audio API chime synthesis, and in-app event dispatcher.
 */

import { HealthReminder } from '../types';

class NotificationService {
  private audioCtx: AudioContext | null = null;
  private intervalId: number | null = null;
  private lastTriggeredMap: Record<string, string> = {};

  constructor() {
    // Listen for user interaction to unlock AudioContext if needed
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

  /**
   * Play a celestial, gentle harp/bell chime using Web Audio API synthesis
   * Frequencies: 528Hz (mi/solfeggio tone) -> 660Hz -> 792Hz
   */
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

        // Soft acoustic attack and long gentle natural decay
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

  /**
   * Play soothing 432Hz ambient meditation drone for relaxation / yoga / music therapy
   */
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
      osc2.frequency.setValueAtTime(baseFreq * 1.5, this.audioCtx.currentTime); // Perfect fifth harmonic

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

  /**
   * Check if Web Notification API is supported by the current browser
   */
  public isNotificationSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Get current permission status ('granted', 'denied', or 'default')
   */
  public getPermissionStatus(): NotificationPermission {
    if (!this.isNotificationSupported()) return 'denied';
    return Notification.permission;
  }

  /**
   * Request permission from user
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isNotificationSupported()) return 'denied';
    try {
      const status = await Notification.requestPermission();
      return status;
    } catch {
      return 'denied';
    }
  }

  /**
   * Trigger both system notification (if granted) and in-app event + audio chime
   */
  public triggerReminderAlert(reminder: HealthReminder): void {
    // 1. Play soothing chime
    this.playChime(0.35);

    // 2. Gentle vibration if supported on mobile
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100, 300]);
      } catch {}
    }

    // 3. System notification if granted
    if (this.isNotificationSupported() && Notification.permission === 'granted') {
      try {
        const notif = new Notification(`⏰ Nhắc nhở: ${reminder.title}`, {
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

    // 4. In-app custom event for UI toast/modal
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

  /**
   * Start background checker for active reminders
   */
  public startReminderWatcher(getReminders: () => HealthReminder[]) {
    if (this.intervalId) return;

    const checkReminders = () => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday ...
      const todayDateStr = `${now.getFullYear()}-${(now.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

      const reminders = getReminders();

      reminders.forEach((r) => {
        if (!r.isEnabled) return;
        if (r.time !== currentTimeStr) return;

        // Check frequency condition
        let shouldTrigger = false;
        if (r.frequency === 'daily') {
          shouldTrigger = true;
        } else if (r.frequency === 'once') {
          shouldTrigger = !r.date || r.date === todayDateStr;
        } else if (r.frequency === 'custom_days' && Array.isArray(r.daysOfWeek)) {
          shouldTrigger = r.daysOfWeek.includes(currentDayOfWeek);
        }

        if (!shouldTrigger) return;

        // Debounce so we only trigger once per minute per reminder
        const triggerKey = `${r.id}_${todayDateStr}_${currentTimeStr}`;
        if (this.lastTriggeredMap[triggerKey]) return;

        this.lastTriggeredMap[triggerKey] = new Date().toISOString();
        this.triggerReminderAlert(r);
      });
    };

    // Run check immediately and then every 20 seconds
    checkReminders();
    this.intervalId = window.setInterval(checkReminders, 20000);
  }

  public stopReminderWatcher() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const notificationService = new NotificationService();
