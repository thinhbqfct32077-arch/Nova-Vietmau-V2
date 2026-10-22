import {
  UserProfile,
  OrderInfo,
  CartItem,
  ActivityItem,
  EmergencyContact,
  ShippingAddress,
  ChatMessage,
  DailyWaterRecord,
  HealthReminder,
  DayProgress,
  HealthDiaryEntry,
  PrenatalAppointment,
  DoctorQuestion,
  SymptomLog,
  WeightLog,
  AppNotification,
  MoodType,
} from '../types';
import {
  INITIAL_USER_PROFILE,
  INITIAL_ACTIVITIES,
  DEFAULT_SHIPPING_ADDRESSES,
  DEFAULT_EMERGENCY_CONTACTS,
  PRODUCTS_DATA,
  INITIAL_CHAT_MESSAGES,
} from '../data/mockData';

const STORAGE_KEYS = {
  USER_PROFILE: 'nova_mom_user_profile_v2',
  ORDERS: 'nova_mom_user_orders_v2',
  CART: 'nova_mom_user_cart_v2',
  CARE_ACTIVITIES: 'nova_mom_care_activities_v2',
  CHAT_HISTORY: 'nova_mom_chat_history_v2',
  LAST_SAVED: 'nova_mom_last_saved_v2',
  SAVED_ACCOUNTS: 'nova_mom_saved_accounts_v2',
  WATER_RECORDS: 'nova_mom_water_records_v3',
  HEALTH_REMINDERS: 'nova_mom_health_reminders_v3',
  DAILY_ACTIVITIES: 'nova_mom_daily_activities_v3',
  HEALTH_DIARY: 'nova_mom_health_diary_v3',
  PRENATAL_APPOINTMENTS: 'nova_mom_prenatal_appointments_v3',
  NOTIFICATIONS: 'nova_mom_notifications_v3',
  WEIGHT_LOGS: 'nova_mom_weight_logs_v3',
};

// Safe JSON parser helper
function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[storageService] Failed to parse key ${key} from localStorage`, error);
    return fallback;
  }
}

// Safe JSON setter helper with storage event trigger
function safeSet<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
    window.dispatchEvent(new CustomEvent('nova_storage_update', { detail: { key, value } }));
    return true;
  } catch (error) {
    console.error(`[storageService] Failed to set key ${key} in localStorage`, error);
    return false;
  }
}

export function getTodayDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DEFAULT_REMINDERS: HealthReminder[] = [
  {
    id: 'rem-1',
    title: 'Uống cốc nước ấm đầu ngày',
    category: 'water',
    time: '07:30',
    frequency: 'daily',
    isEnabled: true,
    notes: '250ml nước ấm giúp thanh lọc dạ dày và tuần hoàn nước ối',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem-2',
    title: 'Uống nước & vận động nhẹ buổi sáng',
    category: 'water',
    time: '10:00',
    frequency: 'daily',
    isEnabled: true,
    notes: 'Bổ sung 250ml nước và đứng dậy đi lại 5 phút',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem-3',
    title: 'Tập Yoga bầu 15 phút giãn cơ',
    category: 'yoga',
    time: '16:30',
    frequency: 'daily',
    isEnabled: true,
    notes: 'Tư thế con mèo - con bò và tư thế em bé giúp giảm mỏi lưng',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem-4',
    title: 'Nghe nhạc Mozart & Thai giáo bé yêu',
    category: 'music',
    time: '21:00',
    frequency: 'daily',
    isEnabled: true,
    notes: 'Bản giao hưởng dịu êm giúp mẹ và bé thư giãn sâu trước khi ngủ',
    createdAt: new Date().toISOString(),
  },
];

export const storageService = {
  // -------------------------------------------------------------
  // ONBOARDING & USER PROFILE
  // -------------------------------------------------------------
  hasCompletedOnboarding(): boolean {
    try {
      const onboarded = localStorage.getItem('nova_mom_onboarded_v3');
      if (onboarded === 'true') return true;
      const profileRaw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (profileRaw) {
        const parsed = JSON.parse(profileRaw);
        if (parsed.hasCompletedOnboarding === true) return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  completeOnboarding(profileData: Partial<UserProfile>): UserProfile {
    const current = this.loadUserProfile();
    const updated: UserProfile = {
      ...current,
      ...profileData,
      hasCompletedOnboarding: true,
      // Ensure VIP is optional and not forced: default false unless previously subscribed
      isVip: current.isVip ?? false,
    };
    this.saveUserProfile(updated);
    try {
      localStorage.setItem('nova_mom_onboarded_v3', 'true');
    } catch {}
    return updated;
  },

  resetOnboarding(): void {
    try {
      localStorage.removeItem('nova_mom_onboarded_v3');
      const current = this.loadUserProfile();
      this.saveUserProfile({
        ...current,
        hasCompletedOnboarding: false,
      });
    } catch {}
  },

  loadUserProfile(): UserProfile {
    const profile = safeParse<UserProfile>(STORAGE_KEYS.USER_PROFILE, INITIAL_USER_PROFILE);
    return {
      ...INITIAL_USER_PROFILE,
      ...profile,
      emergencyContacts:
        profile.emergencyContacts && profile.emergencyContacts.length > 0
          ? profile.emergencyContacts
          : DEFAULT_EMERGENCY_CONTACTS,
      shippingAddresses:
        profile.shippingAddresses && profile.shippingAddresses.length > 0
          ? profile.shippingAddresses
          : DEFAULT_SHIPPING_ADDRESSES,
    };
  },

  saveUserProfile(profile: UserProfile): void {
    safeSet(STORAGE_KEYS.USER_PROFILE, profile);
  },

  updateUserProfile(partial: Partial<UserProfile>): UserProfile {
    const current = this.loadUserProfile();
    const updated: UserProfile = { ...current, ...partial };
    this.saveUserProfile(updated);
    return updated;
  },

  exportAllUserDataJSON(): string {
    return this.exportAllUserData();
  },

  // -------------------------------------------------------------
  // WATER TRACKING (Theo dõi nước uống)
  // -------------------------------------------------------------
  loadWaterRecords(): Record<string, DailyWaterRecord> {
    const records = safeParse<Record<string, DailyWaterRecord>>(STORAGE_KEYS.WATER_RECORDS, {});
    return records;
  },

  getWaterRecord(dateStr = getTodayDateString()): DailyWaterRecord {
    const all = this.loadWaterRecords();
    if (all[dateStr]) {
      return all[dateStr];
    }

    // Default template for a new day - strictly 0ml initial unless past seeded day
    const isToday = dateStr === getTodayDateString();
    const newRecord: DailyWaterRecord = {
      date: dateStr,
      targetMl: 2500,
      currentMl: isToday ? 500 : 0,
      logs: isToday
        ? [
            { id: 'seed-log-1', timestamp: '07:30', amountMl: 250, note: 'Cốc nước ấm sau khi dậy' },
            { id: 'seed-log-2', timestamp: '09:15', amountMl: 250, note: 'Uống sau bữa ăn sáng' },
          ]
        : [],
      isCompleted: isToday ? 500 >= 2500 : false, // False! Cannot complete unless >= targetMl!
    };

    all[dateStr] = newRecord;
    safeSet(STORAGE_KEYS.WATER_RECORDS, all);
    return newRecord;
  },

  saveWaterRecord(record: DailyWaterRecord): void {
    const all = this.loadWaterRecords();
    all[record.date] = record;
    safeSet(STORAGE_KEYS.WATER_RECORDS, all);

    // Synchronize the "Uống nước" activity card for this day
    this.syncWaterActivityWithRecord(record);
  },

  addWaterLog(amountMl: number, note?: string, dateStr = getTodayDateString()): DailyWaterRecord {
    const current = this.getWaterRecord(dateStr);
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    const newLog = {
      id: `water-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: timeStr,
      amountMl: Math.max(1, amountMl),
      note: note || undefined,
    };

    const newLogs = [newLog, ...current.logs];
    const newTotal = newLogs.reduce((sum, l) => sum + l.amountMl, 0);
    const updated: DailyWaterRecord = {
      ...current,
      logs: newLogs,
      currentMl: newTotal,
      isCompleted: newTotal >= current.targetMl, // Never complete unless >= target!
    };

    this.saveWaterRecord(updated);
    return updated;
  },

  undoLastWaterLog(dateStr = getTodayDateString()): DailyWaterRecord {
    const current = this.getWaterRecord(dateStr);
    if (current.logs.length === 0) return current;

    const remainingLogs = current.logs.slice(1);
    const newTotal = remainingLogs.reduce((sum, l) => sum + l.amountMl, 0);
    const updated: DailyWaterRecord = {
      ...current,
      logs: remainingLogs,
      currentMl: newTotal,
      isCompleted: newTotal >= current.targetMl,
    };

    this.saveWaterRecord(updated);
    return updated;
  },

  removeWaterLog(logId: string, dateStr = getTodayDateString()): DailyWaterRecord {
    const current = this.getWaterRecord(dateStr);
    const remainingLogs = current.logs.filter((l) => l.id !== logId);
    const newTotal = remainingLogs.reduce((sum, l) => sum + l.amountMl, 0);
    const updated: DailyWaterRecord = {
      ...current,
      logs: remainingLogs,
      currentMl: newTotal,
      isCompleted: newTotal >= current.targetMl,
    };

    this.saveWaterRecord(updated);
    return updated;
  },

  updateWaterTarget(targetMl: number, dateStr = getTodayDateString()): DailyWaterRecord {
    const current = this.getWaterRecord(dateStr);
    const validTarget = Math.max(500, targetMl);
    const updated: DailyWaterRecord = {
      ...current,
      targetMl: validTarget,
      isCompleted: current.currentMl >= validTarget,
    };

    this.saveWaterRecord(updated);
    return updated;
  },

  // -------------------------------------------------------------
  // HEALTH REMINDERS (Nhắc nhở & Hẹn giờ)
  // -------------------------------------------------------------
  loadHealthReminders(): HealthReminder[] {
    return safeParse<HealthReminder[]>(STORAGE_KEYS.HEALTH_REMINDERS, DEFAULT_REMINDERS);
  },

  saveHealthReminders(reminders: HealthReminder[]): void {
    safeSet(STORAGE_KEYS.HEALTH_REMINDERS, reminders);
  },

  addHealthReminder(reminder: Omit<HealthReminder, 'id' | 'createdAt'>): HealthReminder {
    const current = this.loadHealthReminders();
    const newRem: HealthReminder = {
      ...reminder,
      id: `rem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newRem, ...current];
    this.saveHealthReminders(updated);
    return newRem;
  },

  updateHealthReminder(id: string, partial: Partial<HealthReminder>): HealthReminder[] {
    const current = this.loadHealthReminders();
    const updated = current.map((r) => (r.id === id ? { ...r, ...partial } : r));
    this.saveHealthReminders(updated);
    return updated;
  },

  toggleHealthReminder(id: string): HealthReminder[] {
    const current = this.loadHealthReminders();
    const updated = current.map((r) => (r.id === id ? { ...r, isEnabled: !r.isEnabled } : r));
    this.saveHealthReminders(updated);
    return updated;
  },

  deleteHealthReminder(id: string): HealthReminder[] {
    const current = this.loadHealthReminders();
    const updated = current.filter((r) => r.id !== id);
    this.saveHealthReminders(updated);
    return updated;
  },

  // -------------------------------------------------------------
  // CARE ACTIVITIES (Quản lý hoạt động chăm sóc theo ngày)
  // -------------------------------------------------------------
  loadCareActivities(dateStr = getTodayDateString()): ActivityItem[] {
    const dailyMap = safeParse<Record<string, ActivityItem[]>>(STORAGE_KEYS.DAILY_ACTIVITIES, {});
    if (dailyMap[dateStr] && dailyMap[dateStr].length > 0) {
      return dailyMap[dateStr];
    }

    // Fallback: copy template activities for this day
    const baseTemplate = safeParse<ActivityItem[]>(STORAGE_KEYS.CARE_ACTIVITIES, INITIAL_ACTIVITIES);
    const dayWater = this.getWaterRecord(dateStr);

    // Initialize activities for this date
    const initialized = baseTemplate.map((item) => {
      if (item.category === 'water') {
        return {
          ...item,
          subtitle: `Mục tiêu: ${dayWater.currentMl} / ${dayWater.targetMl} ml hôm nay`,
          completed: dayWater.isCompleted,
        };
      }
      return {
        ...item,
        completed: false, // Start uncompleted on new day
      };
    });

    dailyMap[dateStr] = initialized;
    safeSet(STORAGE_KEYS.DAILY_ACTIVITIES, dailyMap);
    return initialized;
  },

  saveCareActivities(activities: ActivityItem[], dateStr = getTodayDateString()): void {
    const dailyMap = safeParse<Record<string, ActivityItem[]>>(STORAGE_KEYS.DAILY_ACTIVITIES, {});
    dailyMap[dateStr] = activities;
    safeSet(STORAGE_KEYS.DAILY_ACTIVITIES, dailyMap);

    // Also update base template if today
    if (dateStr === getTodayDateString()) {
      safeSet(STORAGE_KEYS.CARE_ACTIVITIES, activities);
    }
  },

  syncWaterActivityWithRecord(waterRecord: DailyWaterRecord): void {
    const activities = this.loadCareActivities(waterRecord.date);
    const updated = activities.map((act) => {
      if (act.category === 'water') {
        return {
          ...act,
          subtitle: `Mục tiêu: ${waterRecord.currentMl} / ${waterRecord.targetMl} ml hôm nay`,
          completed: waterRecord.isCompleted,
        };
      }
      return act;
    });
    this.saveCareActivities(updated, waterRecord.date);
  },

  toggleFavoriteActivity(id: string, dateStr = getTodayDateString()): ActivityItem[] {
    const current = this.loadCareActivities(dateStr);
    const updated = current.map((act) =>
      act.id === id ? { ...act, isFavorite: !act.isFavorite } : act
    );
    this.saveCareActivities(updated, dateStr);
    return updated;
  },

  recordActivityCompletion(
    id: string,
    notes?: string,
    dateStr = getTodayDateString()
  ): ActivityItem[] {
    const current = this.loadCareActivities(dateStr);
    const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const updated = current.map((act) => {
      if (act.id === id) {
        return {
          ...act,
          completed: true,
          notes: notes || act.notes,
          lastCompletedAt: nowStr,
        };
      }
      return act;
    });

    this.saveCareActivities(updated, dateStr);
    return updated;
  },

  uncompleteActivity(id: string, dateStr = getTodayDateString()): ActivityItem[] {
    const current = this.loadCareActivities(dateStr);
    const updated = current.map((act) => {
      if (act.id === id) {
        return {
          ...act,
          completed: false,
          lastCompletedAt: undefined,
        };
      }
      return act;
    });

    this.saveCareActivities(updated, dateStr);
    return updated;
  },

  addCareActivity(newAct: Omit<ActivityItem, 'id'>, dateStr = getTodayDateString()): ActivityItem {
    const current = this.loadCareActivities(dateStr);
    const item: ActivityItem = {
      ...newAct,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      completed: false,
    };
    const updated = [...current, item];
    this.saveCareActivities(updated, dateStr);

    // If reminderEnabled, auto-create a reminder
    if (newAct.reminderEnabled && newAct.reminderTime) {
      this.addHealthReminder({
        title: newAct.title,
        category: newAct.category,
        activityId: item.id,
        time: newAct.reminderTime,
        frequency: 'daily',
        isEnabled: true,
        notes: newAct.subtitle,
      });
    }

    return item;
  },

  updateCareActivity(
    id: string,
    partial: Partial<ActivityItem>,
    dateStr = getTodayDateString()
  ): ActivityItem[] {
    const current = this.loadCareActivities(dateStr);
    const updated = current.map((act) => (act.id === id ? { ...act, ...partial } : act));
    this.saveCareActivities(updated, dateStr);
    return updated;
  },

  deleteCareActivity(id: string, dateStr = getTodayDateString()): ActivityItem[] {
    const current = this.loadCareActivities(dateStr);
    const updated = current.filter((act) => act.id !== id);
    this.saveCareActivities(updated, dateStr);
    return updated;
  },

  // -------------------------------------------------------------
  // WEEKLY PROGRESS CALCULATION (Thống kê tiến độ thực tế theo tuần)
  // -------------------------------------------------------------
  getWeeklyProgress(referenceDate = new Date()): DayProgress[] {
    // Generate Monday to Sunday for the current week
    const current = new Date(referenceDate);
    const currentDay = current.getDay(); // 0 is Sunday, 1 is Monday ...
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(current);
    monday.setDate(current.getDate() - distanceToMonday);

    const dayLabels = [
      { name: 'Thứ 2', short: 'Th 2' },
      { name: 'Thứ 3', short: 'Th 3' },
      { name: 'Thứ 4', short: 'Th 4' },
      { name: 'Thứ 5', short: 'Th 5' },
      { name: 'Thứ 6', short: 'Th 6' },
      { name: 'Thứ 7', short: 'Th 7' },
      { name: 'Chủ nhật', short: 'CN' },
    ];

    const todayStr = getTodayDateString();

    const result: DayProgress[] = dayLabels.map((lbl, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dateStr = getTodayDateString(d);

      const acts = this.loadCareActivities(dateStr);
      const total = acts.length || 4;
      const completed = acts.filter((a) => a.completed).length;

      // Also factor in water completion
      const water = this.getWaterRecord(dateStr);
      const waterPercent = Math.min(100, Math.round((water.currentMl / water.targetMl) * 100));

      const actPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
      const overallPercent = Math.round((actPercent * 0.7) + (waterPercent * 0.3));

      return {
        dayName: lbl.name,
        shortDay: lbl.short,
        percent: Math.min(100, Math.max(0, overallPercent)),
        dateStr,
        completedCount: completed,
        totalCount: total,
        isPeak: dateStr === todayStr,
      };
    });

    return result;
  },

  // -------------------------------------------------------------
  // ORDERS & SHOP
  // -------------------------------------------------------------
  loadOrders(): OrderInfo[] {
    const defaultOrders: OrderInfo[] = [
      {
        orderId: 'NV-20261019-892',
        createdAt: '19/10/2026 14:30',
        items: [
          { product: PRODUCTS_DATA[0], quantity: 1 },
          { product: PRODUCTS_DATA[3], quantity: 1 },
        ],
        shippingAddress: DEFAULT_SHIPPING_ADDRESSES[0],
        shippingMethod: 'express',
        shippingFee: 25000,
        subtotal: 515000,
        discountAmount: 50000,
        voucherCode: 'NOVAMOM',
        totalAmount: 490000,
        paymentMethod: 'vietqr',
        deliveryNote: 'Nhà có mẹ bầu & trẻ sơ sinh, xin gọi trước khi đến, không bấm chuông to',
        status: 'shipping',
        estimatedDeliveryDate: 'Dự kiến: Hôm nay (16:00 - 18:00)',
      },
    ];
    return safeParse<OrderInfo[]>(STORAGE_KEYS.ORDERS, defaultOrders);
  },

  saveOrder(newOrder: OrderInfo): OrderInfo[] {
    const currentOrders = this.loadOrders();
    const exists = currentOrders.some((o) => o.orderId === newOrder.orderId);
    let updated: OrderInfo[];
    if (exists) {
      updated = currentOrders.map((o) => (o.orderId === newOrder.orderId ? newOrder : o));
    } else {
      updated = [newOrder, ...currentOrders];
    }
    safeSet(STORAGE_KEYS.ORDERS, updated);
    return updated;
  },

  updateOrderStatus(orderId: string, status: OrderInfo['status']): OrderInfo[] {
    const current = this.loadOrders();
    const updated = current.map((ord) => (ord.orderId === orderId ? { ...ord, status } : ord));
    safeSet(STORAGE_KEYS.ORDERS, updated);
    return updated;
  },

  loadCart(): CartItem[] {
    const defaultCart: CartItem[] = [{ product: PRODUCTS_DATA[0], quantity: 1 }];
    return safeParse<CartItem[]>(STORAGE_KEYS.CART, defaultCart);
  },

  saveCart(items: CartItem[]): void {
    safeSet(STORAGE_KEYS.CART, items);
  },

  // -------------------------------------------------------------
  // CHAT HISTORY
  // -------------------------------------------------------------
  loadChatMessages(): ChatMessage[] {
    return safeParse<ChatMessage[]>(STORAGE_KEYS.CHAT_HISTORY, INITIAL_CHAT_MESSAGES);
  },

  saveChatMessages(messages: ChatMessage[]): void {
    safeSet(STORAGE_KEYS.CHAT_HISTORY, messages);
  },

  clearChatMessages(): void {
    safeSet(STORAGE_KEYS.CHAT_HISTORY, INITIAL_CHAT_MESSAGES);
  },

  // -------------------------------------------------------------
  // HEALTH DIARY (Nhật ký triệu chứng, tâm trạng & cân nặng)
  // -------------------------------------------------------------
  loadHealthDiary(): Record<string, HealthDiaryEntry> {
    const raw = safeParse<Record<string, HealthDiaryEntry>>(STORAGE_KEYS.HEALTH_DIARY, {});
    // Seed today entry if missing
    const today = getTodayDateString();
    if (!raw[today]) {
      raw[today] = {
        id: `diary-${today}`,
        date: today,
        mood: 'calm',
        moodNote: 'Mẹ cảm thấy dễ chịu, bé cử động nhẹ nhàng sau bữa ăn.',
        symptoms: [
          { id: 'sym-1', name: 'Đau mỏi thắt lưng', severity: 'mild', notes: 'Mỏi khi ngồi làm việc lâu' },
          { id: 'sym-2', name: 'Ợ nóng nhẹ sau ăn', severity: 'mild', notes: 'Uống nước ấm chia nhỏ' },
        ],
        weightKg: 54.5,
        doctorAdviceNotes: 'Duy trì uống đủ 2 lít nước ấm, đi bộ nhẹ nhàng 20 phút mỗi ngày.',
        fetalKickCount: 12,
        updatedAt: new Date().toISOString(),
      };
      safeSet(STORAGE_KEYS.HEALTH_DIARY, raw);
    }
    return raw;
  },

  getHealthDiaryEntry(dateStr = getTodayDateString()): HealthDiaryEntry {
    const all = this.loadHealthDiary();
    if (all[dateStr]) return all[dateStr];
    const newEntry: HealthDiaryEntry = {
      id: `diary-${dateStr}`,
      date: dateStr,
      symptoms: [],
      updatedAt: new Date().toISOString(),
    };
    all[dateStr] = newEntry;
    safeSet(STORAGE_KEYS.HEALTH_DIARY, all);
    return newEntry;
  },

  saveHealthDiaryEntry(entry: HealthDiaryEntry): HealthDiaryEntry {
    const all = this.loadHealthDiary();
    all[entry.date] = { ...entry, updatedAt: new Date().toISOString() };
    safeSet(STORAGE_KEYS.HEALTH_DIARY, all);
    return entry;
  },

  addSymptomToDiary(
    dateStr: string,
    symptom: Omit<SymptomLog, 'id'>
  ): HealthDiaryEntry {
    const entry = this.getHealthDiaryEntry(dateStr);
    const newSymptom: SymptomLog = {
      ...symptom,
      id: `sym-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    const updated: HealthDiaryEntry = {
      ...entry,
      symptoms: [newSymptom, ...entry.symptoms],
      updatedAt: new Date().toISOString(),
    };
    return this.saveHealthDiaryEntry(updated);
  },

  removeSymptomFromDiary(dateStr: string, symptomId: string): HealthDiaryEntry {
    const entry = this.getHealthDiaryEntry(dateStr);
    const updated: HealthDiaryEntry = {
      ...entry,
      symptoms: entry.symptoms.filter((s) => s.id !== symptomId),
      updatedAt: new Date().toISOString(),
    };
    return this.saveHealthDiaryEntry(updated);
  },

  updateMoodInDiary(
    dateStr: string,
    mood: MoodType,
    moodNote?: string
  ): HealthDiaryEntry {
    const entry = this.getHealthDiaryEntry(dateStr);
    const updated: HealthDiaryEntry = {
      ...entry,
      mood,
      moodNote: moodNote !== undefined ? moodNote : entry.moodNote,
      updatedAt: new Date().toISOString(),
    };
    return this.saveHealthDiaryEntry(updated);
  },

  updateWeightInDiary(dateStr: string, weightKg: number): HealthDiaryEntry {
    const entry = this.getHealthDiaryEntry(dateStr);
    const updated: HealthDiaryEntry = {
      ...entry,
      weightKg,
      updatedAt: new Date().toISOString(),
    };
    this.saveHealthDiaryEntry(updated);

    // Also sync with global user weight logs
    this.addWeightLog({
      date: dateStr,
      weightKg,
      notes: `Ghi nhận từ nhật ký ngày ${dateStr}`,
    });

    return updated;
  },

  loadWeightLogs(): WeightLog[] {
    const defaultLogs: WeightLog[] = [
      { id: 'w-1', date: '2026-08-10', weightKg: 50.0, week: 8, notes: 'Khám thai đầu quý 1' },
      { id: 'w-2', date: '2026-09-08', weightKg: 51.5, week: 12, notes: 'Mốc đo độ mờ da gáy' },
      { id: 'w-3', date: '2026-10-06', weightKg: 53.0, week: 16, notes: 'Mốc khám tam cá nguyệt 2' },
      { id: 'w-4', date: '2026-10-20', weightKg: 54.5, week: 20, notes: 'Chuẩn bị siêu âm 4D' },
    ];
    return safeParse<WeightLog[]>(STORAGE_KEYS.WEIGHT_LOGS, defaultLogs);
  },

  saveWeightLogs(logs: WeightLog[]): void {
    safeSet(STORAGE_KEYS.WEIGHT_LOGS, logs);
  },

  addWeightLog(log: Omit<WeightLog, 'id'>): WeightLog {
    const current = this.loadWeightLogs();
    const newLog: WeightLog = {
      ...log,
      id: `w-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    const updated = [newLog, ...current];
    this.saveWeightLogs(updated);

    // Sync latest weight to UserProfile
    const profile = this.loadUserProfile();
    this.saveUserProfile({ ...profile, weightKg: log.weightKg });

    return newLog;
  },

  deleteWeightLog(id: string): WeightLog[] {
    const current = this.loadWeightLogs();
    const updated = current.filter((w) => w.id !== id);
    this.saveWeightLogs(updated);
    return updated;
  },

  // -------------------------------------------------------------
  // PRENATAL APPOINTMENTS (Lịch khám thai & Câu hỏi bác sĩ)
  // -------------------------------------------------------------
  loadPrenatalAppointments(): PrenatalAppointment[] {
    const defaultAppointments: PrenatalAppointment[] = [
      {
        id: 'apt-1',
        title: 'Mốc 11-13w6d: Siêu âm đo độ mờ da gáy & Double Test',
        weekRecommended: 12,
        date: '2026-10-25',
        time: '09:00',
        hospitalOrClinic: 'Bệnh viện Phụ Sản Từ Dũ (Khu Dịch Vụ)',
        doctorName: 'BS. CKII Nguyễn Thị Kim Ánh',
        status: 'upcoming',
        notes: 'Uống nước vừa phải trước khi siêu âm. Nhịn ăn sáng nếu có chỉ định làm xét nghiệm sinh hóa máu song hành.',
        reminderEnabled: true,
        createdAt: '2026-10-15T08:00:00.000Z',
        questions: [
          { id: 'q-1', question: 'Chỉ số đo độ mờ da gáy (NT) của bé bao nhiêu là an toàn?', isAnswered: true, answerNotes: 'Dưới 2.5mm là trong giới hạn bình thường an toàn.' },
          { id: 'q-2', question: 'Mẹ bị ốm nghén nôn nao nhiều có cần uống men vi sinh hoặc thuốc chống nôn không?', isAnswered: false },
          { id: 'q-3', question: 'Vị trí nhau bám hiện tại của bé ở mặt trước hay mặt sau tử cung?', isAnswered: false },
        ],
      },
      {
        id: 'apt-2',
        title: 'Mốc 16-18w: Xét nghiệm Triple Test & Theo dõi phát triển',
        weekRecommended: 16,
        date: '2026-11-22',
        time: '14:30',
        hospitalOrClinic: 'Phòng khám Sản Phụ khoa Quốc tế',
        doctorName: 'ThS. BS Trần Minh Tâm',
        status: 'upcoming',
        notes: 'Kiểm tra cân nặng mẹ, huyết áp, bề cao tử cung và nghe nhịp tim thai bằng máy Doppler cầm tay.',
        reminderEnabled: true,
        createdAt: '2026-10-15T08:00:00.000Z',
        questions: [
          { id: 'q-4', question: 'Mẹ bắt đầu cảm nhận thấy thai máy như thế nào là đúng chuẩn?', isAnswered: false },
          { id: 'q-5', question: 'Có cần bổ sung thêm canxi hữu cơ và DHA từ tuần thai này chưa?', isAnswered: false },
        ],
      },
      {
        id: 'apt-3',
        title: 'Mốc 20-22w: Siêu âm 4D hình thái học toàn diện cơ quan',
        weekRecommended: 22,
        date: '2026-12-28',
        time: '10:00',
        hospitalOrClinic: 'Bệnh viện Phụ Sản Trung Ương',
        doctorName: 'PGS. TS Lê Hoài Nam',
        status: 'upcoming',
        notes: 'Mốc quan trọng nhất để khảo sát toàn diện hình thái cơ quan: não bộ, 4 buồng tim, cột sống, thành bụng, bàn tay bàn chân, sứt môi chẻ vòm.',
        reminderEnabled: true,
        createdAt: '2026-10-15T08:00:00.000Z',
        questions: [
          { id: 'q-6', question: 'Các buồng tim và cấu trúc van tim của bé có phát triển bình thường không?', isAnswered: false },
          { id: 'q-7', question: 'Chiều dài xương đùi và chu vi đầu bé tương đương chuẩn bao nhiêu?', isAnswered: false },
        ],
      },
      {
        id: 'apt-4',
        title: 'Mốc 24-28w: Nghiệm pháp đường (OGTT) & Tiêm uốn ván mũi 1',
        weekRecommended: 26,
        date: '2027-01-25',
        time: '07:30',
        hospitalOrClinic: 'Khoa Sản Bệnh viện Đa khoa',
        doctorName: 'BS. CKI Vũ Lan Phương',
        status: 'upcoming',
        notes: 'Bắt buộc nhịn ăn từ 22h tối hôm trước. Chuẩn bị lấy 3 mẫu máu: lúc đói, sau uống nước đường 1h và 2h.',
        reminderEnabled: true,
        createdAt: '2026-10-15T08:00:00.000Z',
        questions: [
          { id: 'q-8', question: 'Chỉ số đường huyết của mẹ có nguy cơ tiểu đường thai kỳ không?', isAnswered: false },
          { id: 'q-9', question: 'Sau tiêm uốn ván mũi 1 có bị sốt hoặc sưng đau bắp tay nhiều không?', isAnswered: false },
        ],
      },
    ];
    return safeParse<PrenatalAppointment[]>(STORAGE_KEYS.PRENATAL_APPOINTMENTS, defaultAppointments);
  },

  savePrenatalAppointments(appointments: PrenatalAppointment[]): void {
    safeSet(STORAGE_KEYS.PRENATAL_APPOINTMENTS, appointments);
  },

  addPrenatalAppointment(
    apt: Omit<PrenatalAppointment, 'id' | 'createdAt'>
  ): PrenatalAppointment {
    const current = this.loadPrenatalAppointments();
    const newApt: PrenatalAppointment = {
      ...apt,
      id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newApt, ...current];
    this.savePrenatalAppointments(updated);

    // Auto-create notification for new appointment
    this.addNotification({
      title: `Đã tạo lịch khám: ${newApt.title}`,
      description: `Hẹn lúc ${newApt.time} ngày ${newApt.date} tại ${newApt.hospitalOrClinic}`,
      category: 'appointment',
      isRead: false,
      actionScreen: 'care',
    });

    return newApt;
  },

  updatePrenatalAppointment(
    id: string,
    partial: Partial<PrenatalAppointment>
  ): PrenatalAppointment[] {
    const current = this.loadPrenatalAppointments();
    const updated = current.map((a) => (a.id === id ? { ...a, ...partial } : a));
    this.savePrenatalAppointments(updated);
    return updated;
  },

  deletePrenatalAppointment(id: string): PrenatalAppointment[] {
    const current = this.loadPrenatalAppointments();
    const updated = current.filter((a) => a.id !== id);
    this.savePrenatalAppointments(updated);
    return updated;
  },

  toggleQuestionAnswered(
    appointmentId: string,
    questionId: string,
    answerNotes?: string
  ): PrenatalAppointment[] {
    const current = this.loadPrenatalAppointments();
    const updated = current.map((a) => {
      if (a.id === appointmentId) {
        return {
          ...a,
          questions: a.questions.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  isAnswered: !q.isAnswered,
                  answerNotes: answerNotes !== undefined ? answerNotes : q.answerNotes,
                }
              : q
          ),
        };
      }
      return a;
    });
    this.savePrenatalAppointments(updated);
    return updated;
  },

  addQuestionToAppointment(
    appointmentId: string,
    questionText: string
  ): PrenatalAppointment[] {
    const current = this.loadPrenatalAppointments();
    const updated = current.map((a) => {
      if (a.id === appointmentId) {
        const newQ: DoctorQuestion = {
          id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          question: questionText,
          isAnswered: false,
        };
        return {
          ...a,
          questions: [...a.questions, newQ],
        };
      }
      return a;
    });
    this.savePrenatalAppointments(updated);
    return updated;
  },

  // -------------------------------------------------------------
  // CENTRALIZED NOTIFICATIONS (Trung tâm thông báo toàn diện)
  // -------------------------------------------------------------
  loadNotifications(): AppNotification[] {
    const defaultNotifs: AppNotification[] = [
      {
        id: 'notif-1',
        title: 'Lịch khám thai mốc 12 tuần sắp tới',
        description: 'Siêu âm đo độ mờ da gáy tại BV Phụ Sản. Nhớ kiểm tra checklist câu hỏi cho bác sĩ nhé!',
        category: 'appointment',
        timestamp: 'Hôm nay, 08:30',
        isRead: false,
        actionScreen: 'care',
      },
      {
        id: 'notif-2',
        title: 'Mục tiêu nước ấm buổi sáng',
        description: 'Bổ sung ngay 250ml nước ấm giúp thanh lọc cơ thể và điều hòa lượng dịch ối cho bé.',
        category: 'water',
        timestamp: 'Hôm nay, 07:30',
        isRead: false,
        actionScreen: 'care',
      },
      {
        id: 'notif-3',
        title: 'Cột mốc thai kỳ tuần mới',
        description: 'Bé con tuần này đã có thể cử động các ngón tay và mút ngón tay cái rồi mẹ nhé!',
        category: 'milestone',
        timestamp: 'Hôm qua',
        isRead: true,
        actionScreen: 'home',
      },
      {
        id: 'notif-4',
        title: 'Lưu ý an toàn: Dấu hiệu cần gọi cấp cứu',
        description: 'Mẹ hãy lưu lại số 115 và danh sách các bệnh viện sản khoa gần nhất trong mục Khẩn cấp.',
        category: 'health',
        timestamp: '2 ngày trước',
        isRead: true,
        actionScreen: 'emergency',
      },
    ];
    return safeParse<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, defaultNotifs);
  },

  saveNotifications(notifs: AppNotification[]): void {
    safeSet(STORAGE_KEYS.NOTIFICATIONS, notifs);
  },

  addNotification(notif: Omit<AppNotification, 'id' | 'timestamp'>): AppNotification {
    const current = this.loadNotifications();
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')} - Hôm nay`;

    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timeStr,
    };
    const updated = [newNotif, ...current];
    this.saveNotifications(updated);
    return newNotif;
  },

  markNotificationAsRead(id: string): AppNotification[] {
    const current = this.loadNotifications();
    const updated = current.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    this.saveNotifications(updated);
    return updated;
  },

  markAllNotificationsAsRead(): AppNotification[] {
    const current = this.loadNotifications();
    const updated = current.map((n) => ({ ...n, isRead: true }));
    this.saveNotifications(updated);
    return updated;
  },

  deleteNotification(id: string): AppNotification[] {
    const current = this.loadNotifications();
    const updated = current.filter((n) => n.id !== id);
    this.saveNotifications(updated);
    return updated;
  },

  clearAllNotifications(): AppNotification[] {
    const updated: AppNotification[] = [];
    this.saveNotifications(updated);
    return updated;
  },

  // -------------------------------------------------------------
  // GUEST DATA MIGRATION & ACCOUNT DELETION
  // -------------------------------------------------------------
  migrateGuestDataToAccount(accountProfile: UserProfile): UserProfile {
    const currentGuestProfile = this.loadUserProfile();
    // Preserve local gestational info, water logs, reminders, diary, appointments
    const mergedProfile: UserProfile = {
      ...currentGuestProfile,
      ...accountProfile,
      // If the guest configured a gestational week or LMP, keep it unless account has explicit one
      pregnancyWeek: accountProfile.pregnancyWeek || currentGuestProfile.pregnancyWeek,
      babyNickname: accountProfile.babyNickname || currentGuestProfile.babyNickname,
      dueDate: accountProfile.dueDate || currentGuestProfile.dueDate,
      hasCompletedOnboarding: true,
    };

    this.saveUserProfile(mergedProfile);
    this.addNotification({
      title: 'Đồng bộ tài khoản thành công',
      description: `Chào mừng ${mergedProfile.name}! Toàn bộ dữ liệu theo dõi thai kỳ của mẹ đã được gắn kết an toàn.`,
      category: 'system',
      isRead: false,
    });

    return mergedProfile;
  },

  deleteUserAccountAndData(): void {
    // Thoroughly remove all user data keys
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.CARE_ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.WATER_RECORDS);
    localStorage.removeItem(STORAGE_KEYS.HEALTH_REMINDERS);
    localStorage.removeItem(STORAGE_KEYS.DAILY_ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.HEALTH_DIARY);
    localStorage.removeItem(STORAGE_KEYS.PRENATAL_APPOINTMENTS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.WEIGHT_LOGS);
    localStorage.removeItem('nova_mom_onboarded_v3');
    localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());

    window.dispatchEvent(new CustomEvent('nova_storage_update', { detail: { action: 'deleted' } }));
  },

  // -------------------------------------------------------------
  // SYSTEM & BACKUP
  // -------------------------------------------------------------
  getLastSavedTime(): string {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_SAVED);
    if (!raw) return 'Vừa mới đây';
    try {
      const d = new Date(raw);
      return `${d.getHours().toString().padStart(2, '0')}:${d
        .getMinutes()
        .toString()
        .padStart(2, '0')} · ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return 'Vừa mới đây';
    }
  },

  exportAllUserData(): string {
    const bundle = {
      version: '3.1.0',
      exportedAt: new Date().toISOString(),
      userProfile: this.loadUserProfile(),
      orders: this.loadOrders(),
      cart: this.loadCart(),
      careActivities: this.loadCareActivities(),
      waterRecords: this.loadWaterRecords(),
      healthReminders: this.loadHealthReminders(),
      dailyActivities: safeParse(STORAGE_KEYS.DAILY_ACTIVITIES, {}),
      healthDiary: this.loadHealthDiary(),
      prenatalAppointments: this.loadPrenatalAppointments(),
      weightLogs: this.loadWeightLogs(),
      notifications: this.loadNotifications(),
      chatHistory: this.loadChatMessages(),
    };
    return JSON.stringify(bundle, null, 2);
  },

  importUserData(jsonString: string): { success: boolean; message: string; user?: UserProfile } {
    try {
      const bundle = JSON.parse(jsonString);
      if (!bundle || (!bundle.userProfile && !bundle.name)) {
        return { success: false, message: 'Tệp sao lưu không hợp lệ hoặc sai định dạng dữ liệu.' };
      }

      const importedProfile = bundle.userProfile || bundle;
      this.saveUserProfile(importedProfile);

      if (Array.isArray(bundle.orders)) safeSet(STORAGE_KEYS.ORDERS, bundle.orders);
      if (Array.isArray(bundle.cart)) safeSet(STORAGE_KEYS.CART, bundle.cart);
      if (Array.isArray(bundle.careActivities)) safeSet(STORAGE_KEYS.CARE_ACTIVITIES, bundle.careActivities);
      if (bundle.waterRecords) safeSet(STORAGE_KEYS.WATER_RECORDS, bundle.waterRecords);
      if (Array.isArray(bundle.healthReminders)) safeSet(STORAGE_KEYS.HEALTH_REMINDERS, bundle.healthReminders);
      if (bundle.dailyActivities) safeSet(STORAGE_KEYS.DAILY_ACTIVITIES, bundle.dailyActivities);
      if (bundle.healthDiary) safeSet(STORAGE_KEYS.HEALTH_DIARY, bundle.healthDiary);
      if (Array.isArray(bundle.prenatalAppointments)) safeSet(STORAGE_KEYS.PRENATAL_APPOINTMENTS, bundle.prenatalAppointments);
      if (Array.isArray(bundle.weightLogs)) safeSet(STORAGE_KEYS.WEIGHT_LOGS, bundle.weightLogs);
      if (Array.isArray(bundle.notifications)) safeSet(STORAGE_KEYS.NOTIFICATIONS, bundle.notifications);
      if (Array.isArray(bundle.chatHistory)) safeSet(STORAGE_KEYS.CHAT_HISTORY, bundle.chatHistory);

      return {
        success: true,
        message: 'Khôi phục toàn bộ dữ liệu người dùng thành công!',
        user: importedProfile,
      };
    } catch (err) {
      return {
        success: false,
        message: 'Lỗi giải mã tệp dữ liệu: ' + (err instanceof Error ? err.message : String(err)),
      };
    }
  },

  resetAllUserData(): UserProfile {
    this.deleteUserAccountAndData();
    const fresh = { ...INITIAL_USER_PROFILE };
    this.saveUserProfile(fresh);
    return fresh;
  },
};
