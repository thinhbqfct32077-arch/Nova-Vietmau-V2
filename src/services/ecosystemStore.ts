import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  AuditLogEntry,
  BabyAlbumPhoto,
  BabyCareLog,
  BirthPlanData,
  ChecklistCategory,
  ChecklistItem,
  ContentReport,
  DetailedPost,
  DueDateChangeEntry,
  FamilyConnection,
  FamilySharePermissions,
  HealthDiaryEntry,
  HealthReminder,
  JourneyState,
  LibraryArticle,
  LibraryCategory,
  MemoryEntry,
  NovaVideoItem,
  OrderInfo,
  PostpartumDiaryEntry,
  PostpartumState,
  ProductItem,
  ReminderHistoryEntry,
  RewardBadge,
  UserKnowledgeState,
  UserPrivacySettings,
  UserProfile,
  UserRole,
  VideoPlaylist,
  VideoWatchEntry,
} from '../types';
import {
  ADMIN_USER_PROFILE,
  INITIAL_USER_PROFILE,
  MODERATOR_USER_PROFILE,
  NOVA_VIDEOS_DATA,
  PRODUCTS_DATA,
  INITIAL_DETAILED_POSTS,
} from '../data/mockData';
import {
  AVAILABLE_COUPONS,
  DEFAULT_CHECKLIST_TEMPLATES,
  INITIAL_LIBRARY_ARTICLES,
  REWARD_BADGE_DEFINITIONS,
} from '../data/ecosystemData';
import { ForbiddenError, NotFoundError, RequestActor, ValidationError } from './serverDataStore';

const EPHEMERAL_SECRET = crypto.randomBytes(32).toString('hex');

function getSessionSecret(): string {
  return process.env.SESSION_SECRET && process.env.SESSION_SECRET !== 'CHANGE_ME_TO_STRONG_RANDOM_SECRET'
    ? process.env.SESSION_SECRET
    : EPHEMERAL_SECRET;
}

export interface SignedSessionPayload {
  id: string;
  name: string;
  role: UserRole;
  exp: number;
}

export function issueSessionToken(actor: { id: string; name: string; role: UserRole }, ttlMs = 7 * 24 * 3600 * 1000): string {
  const payload: SignedSessionPayload = {
    id: actor.id,
    name: actor.name,
    role: actor.role,
    exp: Date.now() + ttlMs,
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const sig = crypto.createHmac('sha256', getSessionSecret()).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token: string): SignedSessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encoded, sig] = parts;
    const expectedSig = crypto.createHmac('sha256', getSessionSecret()).update(encoded).digest('base64url');
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as SignedSessionPayload;
    if (!payload?.id || !payload?.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export class EcosystemStore {
  private dataDir: string;

  constructor(dataDir: string) {
    this.dataDir = dataDir;
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private readJson<T>(filename: string, fallback: T): T {
    const filePath = path.join(this.dataDir, filename);
    try {
      if (!fs.existsSync(filePath)) {
        this.writeJson(filename, fallback);
        return fallback;
      }
      const raw = fs.readFileSync(filePath, 'utf-8');
      if (!raw.trim()) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  private writeJson<T>(filename: string, data: T): void {
    const filePath = path.join(this.dataDir, filename);
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  // =========================================================================
  // 0. USERS, ROLES, SESSIONS, PRIVACY & AUDIT LOGS (Modules 17 & 18)
  // =========================================================================
  private getDefaultUsers(): UserProfile[] {
    return [
      { ...INITIAL_USER_PROFILE, role: 'user' },
      {
        ...INITIAL_USER_PROFILE,
        id: 'usr-2',
        name: 'Mẹ Lan Hương',
        email: 'lanhuong.mom@gmail.com',
        phone: '0912 888 777',
        role: 'user',
        pregnancyWeek: 12,
        babyNickname: 'Bé Đậu',
        isVip: false,
      },
      { ...MODERATOR_USER_PROFILE, role: 'moderator' },
      { ...ADMIN_USER_PROFILE, role: 'admin' },
    ];
  }

  getUsersDirectory(): UserProfile[] {
    return this.readJson<UserProfile[]>('users.json', this.getDefaultUsers());
  }

  getUserById(userId: string): UserProfile | undefined {
    return this.getUsersDirectory().find((u) => u.id === userId);
  }

  upsertUserSessionProfile(input: Partial<UserProfile> & { id: string }): {
    user: UserProfile;
    token: string;
  } {
    const users = this.getUsersDirectory();
    const idx = users.findIndex((u) => u.id === input.id);

    // Determine authoritative server role — never let arbitrary user promote themselves to admin/moderator
    let authoritativeRole: UserRole = 'user';
    if (input.id === 'usr-admin') authoritativeRole = 'admin';
    else if (input.id === 'usr-mod') authoritativeRole = 'moderator';
    else if (idx !== -1 && users[idx].role) authoritativeRole = users[idx].role!;

    const merged: UserProfile =
      idx !== -1
        ? {
            ...users[idx],
            ...input,
            role: authoritativeRole,
          }
        : {
            ...INITIAL_USER_PROFILE,
            ...input,
            id: input.id,
            name: input.name || 'Mẹ Bầu Nova',
            role: authoritativeRole,
            isVip: input.isVip ?? false,
            rewardsEnabled: input.rewardsEnabled ?? true,
          };

    if (idx !== -1) users[idx] = merged;
    else users.push(merged);
    this.writeJson('users.json', users);

    const token = issueSessionToken({
      id: merged.id,
      name: merged.name,
      role: merged.role || 'user',
    });

    return { user: merged, token };
  }

  updateUserRole(targetUserId: string, newRole: UserRole, actor: RequestActor): UserProfile {
    if (actor.role !== 'admin') {
      throw new ForbiddenError('Chỉ Quản trị viên mới có quyền thay đổi phân quyền người dùng.');
    }
    const users = this.getUsersDirectory();
    const idx = users.findIndex((u) => u.id === targetUserId);
    if (idx === -1) throw new NotFoundError('Không tìm thấy tài khoản.');
    users[idx] = { ...users[idx], role: newRole };
    this.writeJson('users.json', users);
    this.appendAuditLog(actor, 'update_user_role', 'user', targetUserId, `Đổi quyền thành ${newRole}`);
    return users[idx];
  }

  updatePrivacyAndPrefs(
    userId: string,
    payload: {
      privacySettings?: Partial<UserPrivacySettings>;
      rewardsEnabled?: boolean;
      blockedUserIds?: string[];
      followingUserIds?: string[];
    }
  ): UserProfile {
    const users = this.getUsersDirectory();
    const idx = users.findIndex((u) => u.id === userId);
    const current = idx !== -1 ? users[idx] : { ...INITIAL_USER_PROFILE, id: userId };
    const updated: UserProfile = {
      ...current,
      rewardsEnabled: payload.rewardsEnabled ?? current.rewardsEnabled ?? true,
      blockedUserIds: payload.blockedUserIds ?? current.blockedUserIds ?? [],
      followingUserIds: payload.followingUserIds ?? current.followingUserIds ?? [],
      privacySettings: {
        allowFamilyDiscovery: current.privacySettings?.allowFamilyDiscovery ?? true,
        hideSensitiveDiaryInReportsByDefault:
          current.privacySettings?.hideSensitiveDiaryInReportsByDefault ?? true,
        analyticsOptIn: current.privacySettings?.analyticsOptIn ?? false,
        ...(payload.privacySettings || {}),
      },
    };
    if (idx !== -1) users[idx] = updated;
    else users.push(updated);
    this.writeJson('users.json', users);
    return updated;
  }

  appendAuditLog(
    actor: RequestActor,
    action: string,
    targetType: string,
    targetId: string,
    details: string
  ): AuditLogEntry {
    const logs = this.readJson<AuditLogEntry[]>('audit_logs.json', []);
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action,
      targetType,
      targetId,
      details,
      createdAt: new Date().toISOString(),
    };
    logs.unshift(entry);
    this.writeJson('audit_logs.json', logs.slice(0, 500));
    return entry;
  }

  getAuditLogs(actor: RequestActor): AuditLogEntry[] {
    if (actor.role !== 'admin' && actor.role !== 'moderator') {
      throw new ForbiddenError('Chỉ Admin hoặc Moderator mới có thể xem nhật ký kiểm toán.');
    }
    return this.readJson<AuditLogEntry[]>('audit_logs.json', []);
  }

  exportUserEcosystemData(userId: string): Record<string, unknown> {
    const user = this.getUserById(userId) || null;
    const remindersAll = this.readJson<Record<string, HealthReminder[]>>('reminders.json', {});
    return {
      exportedAt: new Date().toISOString(),
      userId,
      profile: user,
      journey: this.getJourneyState(userId),
      memories: this.getMemories(userId),
      checklists: this.getChecklists(userId),
      diary: this.getDiaryEntries(userId),
      reminders: remindersAll[userId] || [],
      reminderHistory: this.getReminderHistory(userId),
      birthPlan: this.getBirthPlan(userId),
      postpartum: this.getPostpartumState(userId),
      familyConnections: this.getFamilyConnections(userId),
      orders: this.getOrders(userId),
      rewards: this.getRewards(userId),
    };
  }

  deleteAccountData(userId: string, actor: RequestActor): { deleted: boolean } {
    if (actor.id !== userId && actor.role !== 'admin') {
      throw new ForbiddenError('Bạn không thể xóa dữ liệu của tài khoản khác.');
    }

    const purgeKey = <T>(filename: string) => {
      const map = this.readJson<Record<string, T>>(filename, {});
      if (map && typeof map === 'object' && !Array.isArray(map)) {
        delete map[userId];
        this.writeJson(filename, map);
      }
    };

    purgeKey('reminders.json');
    purgeKey('journey.json');
    purgeKey('memories.json');
    purgeKey('checklists.json');
    purgeKey('diary.json');
    purgeKey('reminder_history.json');
    purgeKey('birth_plan.json');
    purgeKey('postpartum.json');
    purgeKey('knowledge_state.json');
    purgeKey('video_watch.json');
    purgeKey('video_favorites.json');
    purgeKey('video_playlists.json');
    purgeKey('wishlist.json');
    purgeKey('rewards.json');
    purgeKey('prefs.json');

    const users = this.getUsersDirectory().filter((u) => u.id !== userId);
    this.writeJson('users.json', users);

    const family = this.readJson<FamilyConnection[]>('family.json', []).filter(
      (f) => f.ownerId !== userId && f.memberId !== userId
    );
    this.writeJson('family.json', family);

    this.appendAuditLog(actor, 'delete_account_data', 'user', userId, 'Xóa dữ liệu cá nhân theo yêu cầu người dùng');
    return { deleted: true };
  }

  // =========================================================================
  // 1. MODULE 1: PREGNANCY JOURNEY
  // =========================================================================
  getJourneyState(userId: string): JourneyState {
    const all = this.readJson<Record<string, JourneyState>>('journey.json', {});
    return (
      all[userId] || {
        userId,
        completedMilestoneWeeks: [],
        dueDateHistory: [],
        updatedAt: new Date().toISOString(),
      }
    );
  }

  toggleMilestoneWeek(userId: string, week: number): JourneyState {
    if (week < 1 || week > 42) throw new ValidationError('Tuần thai không hợp lệ.');
    const all = this.readJson<Record<string, JourneyState>>('journey.json', {});
    const current = this.getJourneyState(userId);
    const exists = current.completedMilestoneWeeks.includes(week);
    const nextWeeks = exists
      ? current.completedMilestoneWeeks.filter((w) => w !== week)
      : [...current.completedMilestoneWeeks, week].sort((a, b) => a - b);

    const updated: JourneyState = {
      ...current,
      completedMilestoneWeeks: nextWeeks,
      updatedAt: new Date().toISOString(),
    };
    all[userId] = updated;
    this.writeJson('journey.json', all);
    return updated;
  }

  recordDueDateAdjustment(
    userId: string,
    payload: {
      previousDueDate: string;
      newDueDate: string;
      previousWeek: number;
      newWeek: number;
      reason: string;
    }
  ): JourneyState {
    const all = this.readJson<Record<string, JourneyState>>('journey.json', {});
    const current = this.getJourneyState(userId);
    const entry: DueDateChangeEntry = {
      id: `dd-${Date.now()}`,
      previousDueDate: payload.previousDueDate,
      newDueDate: payload.newDueDate,
      previousWeek: payload.previousWeek,
      newWeek: payload.newWeek,
      reason: payload.reason?.trim() || 'Cập nhật theo kết quả siêu âm mới nhất',
      changedAt: new Date().toISOString(),
    };
    const updated: JourneyState = {
      ...current,
      dueDateHistory: [entry, ...current.dueDateHistory],
      updatedAt: new Date().toISOString(),
    };
    all[userId] = updated;
    this.writeJson('journey.json', all);

    // Sync user profile week & dueDate
    const users = this.getUsersDirectory();
    const uidx = users.findIndex((u) => u.id === userId);
    if (uidx !== -1) {
      users[uidx] = {
        ...users[uidx],
        dueDate: payload.newDueDate,
        pregnancyWeek: payload.newWeek,
      };
      this.writeJson('users.json', users);
    }

    return updated;
  }

  // =========================================================================
  // 2. MODULE 2: NOVA MEMORIES (Ultrasound, Photos, Monthly Albums, Letters)
  // =========================================================================
  getMemories(userId: string): MemoryEntry[] {
    const all = this.readJson<Record<string, MemoryEntry[]>>('memories.json', {});
    return Array.isArray(all[userId]) ? all[userId] : [];
  }

  createMemory(
    userId: string,
    input: Omit<MemoryEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): MemoryEntry {
    if (!input.title || !input.title.trim()) {
      throw new ValidationError('Vui lòng nhập tiêu đề kỷ niệm.');
    }
    const all = this.readJson<Record<string, MemoryEntry[]>>('memories.json', {});
    const list = Array.isArray(all[userId]) ? all[userId] : [];
    const now = new Date().toISOString();
    const item: MemoryEntry = {
      ...input,
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId,
      title: input.title.trim(),
      content: (input.content || '').trim(),
      monthNumber: Math.min(9, Math.max(1, Number(input.monthNumber) || 1)),
      privacy: input.privacy || 'private',
      memoryDate: input.memoryDate || now.slice(0, 10),
      createdAt: now,
      updatedAt: now,
    };
    all[userId] = [item, ...list];
    this.writeJson('memories.json', all);
    return item;
  }

  updateMemory(
    userId: string,
    memoryId: string,
    partial: Partial<MemoryEntry>,
    actor: RequestActor
  ): MemoryEntry {
    if (actor.id !== userId) throw new ForbiddenError('Bạn không thể sửa kỷ niệm của tài khoản khác.');
    const all = this.readJson<Record<string, MemoryEntry[]>>('memories.json', {});
    const list = Array.isArray(all[userId]) ? all[userId] : [];
    const idx = list.findIndex((m) => m.id === memoryId);
    if (idx === -1) throw new NotFoundError('Không tìm thấy kỷ niệm.');
    const updated: MemoryEntry = {
      ...list[idx],
      ...partial,
      id: list[idx].id,
      userId,
      updatedAt: new Date().toISOString(),
    };
    list[idx] = updated;
    all[userId] = list;
    this.writeJson('memories.json', all);
    return updated;
  }

  deleteMemory(userId: string, memoryId: string, actor: RequestActor): { deletedId: string } {
    if (actor.id !== userId) throw new ForbiddenError('Bạn không thể xóa kỷ niệm của tài khoản khác.');
    const all = this.readJson<Record<string, MemoryEntry[]>>('memories.json', {});
    const list = Array.isArray(all[userId]) ? all[userId] : [];
    const next = list.filter((m) => m.id !== memoryId);
    if (next.length === list.length) throw new NotFoundError('Không tìm thấy kỷ niệm.');
    all[userId] = next;
    this.writeJson('memories.json', all);
    return { deletedId: memoryId };
  }

  // =========================================================================
  // 3. MODULE 3: NOVA CHECKLIST
  // =========================================================================
  getChecklists(userId: string): ChecklistItem[] {
    const all = this.readJson<Record<string, ChecklistItem[]>>('checklists.json', {});
    if (Array.isArray(all[userId])) return all[userId];
    // Initialize structured default checklists on first access for that account
    const now = new Date().toISOString();
    const seeded: ChecklistItem[] = DEFAULT_CHECKLIST_TEMPLATES.map((tpl, i) => ({
      ...tpl,
      id: `chk-${userId}-${i + 1}`,
      userId,
      createdAt: now,
    }));
    all[userId] = seeded;
    this.writeJson('checklists.json', all);
    return seeded;
  }

  createChecklistItem(
    userId: string,
    input: {
      category: ChecklistCategory;
      title: string;
      notes?: string;
      weekNumber?: number;
      trimester?: 1 | 2 | 3;
    }
  ): ChecklistItem {
    if (!input.title || !input.title.trim()) throw new ValidationError('Vui lòng nhập tên mục checklist.');
    const current = this.getChecklists(userId);
    const all = this.readJson<Record<string, ChecklistItem[]>>('checklists.json', {});
    const item: ChecklistItem = {
      id: `chk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      userId,
      category: input.category || 'custom',
      title: input.title.trim(),
      notes: input.notes?.trim(),
      weekNumber: input.weekNumber,
      trimester: input.trimester,
      completed: false,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    all[userId] = [item, ...current];
    this.writeJson('checklists.json', all);
    return item;
  }

  updateChecklistItem(
    userId: string,
    itemId: string,
    partial: Partial<ChecklistItem>,
    actor: RequestActor
  ): ChecklistItem {
    if (actor.id !== userId) throw new ForbiddenError('Không thể chỉnh sửa checklist của tài khoản khác.');
    const current = this.getChecklists(userId);
    const all = this.readJson<Record<string, ChecklistItem[]>>('checklists.json', {});
    const idx = current.findIndex((c) => c.id === itemId);
    if (idx === -1) throw new NotFoundError('Không tìm thấy mục checklist.');
    const nextCompleted = partial.completed !== undefined ? partial.completed : current[idx].completed;
    const updated: ChecklistItem = {
      ...current[idx],
      ...partial,
      id: current[idx].id,
      userId,
      completed: nextCompleted,
      completedAt: nextCompleted ? partial.completedAt || new Date().toISOString() : undefined,
    };
    current[idx] = updated;
    all[userId] = current;
    this.writeJson('checklists.json', all);
    return updated;
  }

  deleteChecklistItem(userId: string, itemId: string, actor: RequestActor): { deletedId: string } {
    if (actor.id !== userId) throw new ForbiddenError('Không thể xóa checklist của tài khoản khác.');
    const current = this.getChecklists(userId);
    const all = this.readJson<Record<string, ChecklistItem[]>>('checklists.json', {});
    all[userId] = current.filter((c) => c.id !== itemId);
    this.writeJson('checklists.json', all);
    return { deletedId: itemId };
  }

  // =========================================================================
  // 4. MODULE 4: EXTENDED HEALTH DIARY & REMINDER HISTORY
  // =========================================================================
  getDiaryEntries(userId: string): Record<string, HealthDiaryEntry> {
    const all = this.readJson<Record<string, Record<string, HealthDiaryEntry>>>('diary.json', {});
    return all[userId] || {};
  }

  upsertDiaryEntry(userId: string, date: string, entry: HealthDiaryEntry): HealthDiaryEntry {
    const all = this.readJson<Record<string, Record<string, HealthDiaryEntry>>>('diary.json', {});
    if (!all[userId]) all[userId] = {};
    const saved: HealthDiaryEntry = {
      ...entry,
      date,
      updatedAt: new Date().toISOString(),
    };
    all[userId][date] = saved;
    this.writeJson('diary.json', all);
    return saved;
  }

  deleteDiaryDate(userId: string, date: string): { deletedDate: string } {
    const all = this.readJson<Record<string, Record<string, HealthDiaryEntry>>>('diary.json', {});
    if (all[userId]) {
      delete all[userId][date];
      this.writeJson('diary.json', all);
    }
    return { deletedDate: date };
  }

  getReminderHistory(userId: string): ReminderHistoryEntry[] {
    const all = this.readJson<Record<string, ReminderHistoryEntry[]>>('reminder_history.json', {});
    return Array.isArray(all[userId]) ? all[userId] : [];
  }

  appendReminderHistory(
    userId: string,
    entry: Omit<ReminderHistoryEntry, 'id'>
  ): ReminderHistoryEntry[] {
    const all = this.readJson<Record<string, ReminderHistoryEntry[]>>('reminder_history.json', {});
    const list = Array.isArray(all[userId]) ? all[userId] : [];
    const created: ReminderHistoryEntry = {
      ...entry,
      id: `rh-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    };
    all[userId] = [created, ...list].slice(0, 100);
    this.writeJson('reminder_history.json', all);
    return all[userId];
  }

  // =========================================================================
  // 5. MODULES 5 & 11: WEEKLY INTERACTION & KNOWLEDGE LIBRARY
  // =========================================================================
  getKnowledgeArticles(actorRole: UserRole = 'user', includeUnapproved = false): LibraryArticle[] {
    const all = this.readJson<LibraryArticle[]>('library.json', INITIAL_LIBRARY_ARTICLES);
    if (includeUnapproved && (actorRole === 'admin' || actorRole === 'moderator')) {
      return all;
    }
    return all.filter((a) => a.status === 'approved');
  }

  createKnowledgeArticle(
    input: Omit<LibraryArticle, 'id' | 'updatedDate' | 'status' | 'authorName'>,
    actor: RequestActor
  ): LibraryArticle {
    if (!input.title.trim() || !input.content.trim() || !input.medicalSource.trim()) {
      throw new ValidationError('Bài kiến thức bắt buộc phải có tiêu đề, nội dung và nguồn tài liệu y khoa đáng tin cậy.');
    }
    const all = this.readJson<LibraryArticle[]>('library.json', INITIAL_LIBRARY_ARTICLES);
    const article: LibraryArticle = {
      ...input,
      id: `lib-${Date.now()}`,
      title: input.title.trim(),
      summary: input.summary.trim(),
      content: input.content.trim(),
      medicalSource: input.medicalSource.trim(),
      updatedDate: new Date().toISOString().slice(0, 10),
      status: actor.role === 'admin' || actor.role === 'moderator' ? 'approved' : 'pending',
      authorName: actor.name,
    };
    all.unshift(article);
    this.writeJson('library.json', all);
    if (actor.role === 'admin' || actor.role === 'moderator') {
      this.appendAuditLog(actor, 'create_library_article', 'article', article.id, article.title);
    }
    return article;
  }

  moderateKnowledgeArticle(
    articleId: string,
    status: 'approved' | 'rejected' | 'pending',
    actor: RequestActor
  ): LibraryArticle {
    if (actor.role !== 'admin' && actor.role !== 'moderator') {
      throw new ForbiddenError('Chỉ Admin hoặc Moderator mới có quyền kiểm duyệt kiến thức.');
    }
    const all = this.readJson<LibraryArticle[]>('library.json', INITIAL_LIBRARY_ARTICLES);
    const idx = all.findIndex((a) => a.id === articleId);
    if (idx === -1) throw new NotFoundError('Không tìm thấy bài viết.');
    all[idx] = { ...all[idx], status, updatedDate: new Date().toISOString().slice(0, 10) };
    this.writeJson('library.json', all);
    this.appendAuditLog(actor, `moderate_article_${status}`, 'article', articleId, all[idx].title);
    return all[idx];
  }

  getUserKnowledgeState(userId: string): UserKnowledgeState {
    const all = this.readJson<Record<string, UserKnowledgeState>>('knowledge_state.json', {});
    return (
      all[userId] || {
        userId,
        readArticleIds: [],
        savedArticleIds: [],
        readWeeks: [],
        favoriteWeeks: [],
      }
    );
  }

  updateUserKnowledgeState(
    userId: string,
    action:
      | { type: 'mark_article_read'; articleId: string }
      | { type: 'toggle_article_save'; articleId: string }
      | { type: 'mark_week_read'; week: number }
      | { type: 'toggle_week_favorite'; week: number }
  ): UserKnowledgeState {
    const all = this.readJson<Record<string, UserKnowledgeState>>('knowledge_state.json', {});
    const state = this.getUserKnowledgeState(userId);
    if (action.type === 'mark_article_read') {
      if (!state.readArticleIds.includes(action.articleId)) {
        state.readArticleIds = [action.articleId, ...state.readArticleIds];
      }
    } else if (action.type === 'toggle_article_save') {
      state.savedArticleIds = state.savedArticleIds.includes(action.articleId)
        ? state.savedArticleIds.filter((id) => id !== action.articleId)
        : [action.articleId, ...state.savedArticleIds];
    } else if (action.type === 'mark_week_read') {
      if (!state.readWeeks.includes(action.week)) {
        state.readWeeks = [...state.readWeeks, action.week];
      }
    } else if (action.type === 'toggle_week_favorite') {
      state.favoriteWeeks = state.favoriteWeeks.includes(action.week)
        ? state.favoriteWeeks.filter((w) => w !== action.week)
        : [...state.favoriteWeeks, action.week];
    }
    all[userId] = state;
    this.writeJson('knowledge_state.json', all);
    return state;
  }

  // =========================================================================
  // 6. MODULE 6: VIDEO EXTENSIONS (Watch History, Resume, Favorites, Playlists)
  // =========================================================================
  getVideoLibraryState(userId: string): {
    favoriteVideoIds: string[];
    watchHistory: VideoWatchEntry[];
    playlists: VideoPlaylist[];
  } {
    const favsAll = this.readJson<Record<string, string[]>>('video_favorites.json', {});
    const watchAll = this.readJson<Record<string, VideoWatchEntry[]>>('video_watch.json', {});
    const plAll = this.readJson<Record<string, VideoPlaylist[]>>('video_playlists.json', {});
    return {
      favoriteVideoIds: favsAll[userId] || [],
      watchHistory: watchAll[userId] || [],
      playlists: plAll[userId] || [],
    };
  }

  toggleVideoFavorite(userId: string, videoId: string): string[] {
    const all = this.readJson<Record<string, string[]>>('video_favorites.json', {});
    const list = all[userId] || [];
    const next = list.includes(videoId) ? list.filter((id) => id !== videoId) : [videoId, ...list];
    all[userId] = next;
    this.writeJson('video_favorites.json', all);
    return next;
  }

  recordVideoProgress(
    userId: string,
    videoId: string,
    progressSec: number,
    durationSec: number
  ): VideoWatchEntry[] {
    const all = this.readJson<Record<string, VideoWatchEntry[]>>('video_watch.json', {});
    const list = (all[userId] || []).filter((w) => w.videoId !== videoId);
    const updated: VideoWatchEntry = {
      videoId,
      progressSec: Math.max(0, Math.round(progressSec)),
      durationSec: Math.max(0, Math.round(durationSec)),
      watchedAt: new Date().toISOString(),
    };
    all[userId] = [updated, ...list].slice(0, 50);
    this.writeJson('video_watch.json', all);
    return all[userId];
  }

  createVideoPlaylist(userId: string, name: string, initialVideoId?: string): VideoPlaylist[] {
    if (!name.trim()) throw new ValidationError('Vui lòng nhập tên playlist.');
    const all = this.readJson<Record<string, VideoPlaylist[]>>('video_playlists.json', {});
    const list = all[userId] || [];
    const pl: VideoPlaylist = {
      id: `pl-${Date.now()}`,
      userId,
      name: name.trim(),
      videoIds: initialVideoId ? [initialVideoId] : [],
      createdAt: new Date().toISOString(),
    };
    all[userId] = [pl, ...list];
    this.writeJson('video_playlists.json', all);
    return all[userId];
  }

  toggleVideoInPlaylist(userId: string, playlistId: string, videoId: string): VideoPlaylist[] {
    const all = this.readJson<Record<string, VideoPlaylist[]>>('video_playlists.json', {});
    const list = all[userId] || [];
    const idx = list.findIndex((p) => p.id === playlistId);
    if (idx === -1) throw new NotFoundError('Không tìm thấy playlist.');
    const vids = list[idx].videoIds;
    list[idx] = {
      ...list[idx],
      videoIds: vids.includes(videoId) ? vids.filter((id) => id !== videoId) : [...vids, videoId],
    };
    all[userId] = list;
    this.writeJson('video_playlists.json', all);
    return list;
  }

  // =========================================================================
  // 7. MODULE 7 & 18: COMMUNITY INTERACTIONS, MODERATION & VIOLATION REPORTS
  // =========================================================================
  togglePostBookmark(postId: string, userId: string): DetailedPost {
    const posts = this.readJson<DetailedPost[]>('community.json', INITIAL_DETAILED_POSTS);
    const idx = posts.findIndex((p) => p.id === postId);
    if (idx === -1) throw new NotFoundError('Không tìm thấy bài viết.');
    const current = posts[idx].bookmarkedBy || [];
    const exists = current.includes(userId);
    posts[idx].bookmarkedBy = exists ? current.filter((id) => id !== userId) : [...current, userId];
    posts[idx].isBookmarked = !exists;
    this.writeJson('community.json', posts);
    return posts[idx];
  }

  hidePostForUser(postId: string, userId: string): { postId: string } {
    const posts = this.readJson<DetailedPost[]>('community.json', INITIAL_DETAILED_POSTS);
    const idx = posts.findIndex((p) => p.id === postId);
    if (idx === -1) throw new NotFoundError('Không tìm thấy bài viết.');
    const hiddenBy = posts[idx].hiddenBy || [];
    if (!hiddenBy.includes(userId)) {
      posts[idx].hiddenBy = [...hiddenBy, userId];
      this.writeJson('community.json', posts);
    }
    return { postId };
  }

  moderatePost(
    postId: string,
    status: 'approved' | 'hidden' | 'removed',
    isFeatured: boolean | undefined,
    actor: RequestActor
  ): DetailedPost {
    if (actor.role !== 'admin' && actor.role !== 'moderator') {
      throw new ForbiddenError('Chỉ Moderator hoặc Quản trị viên mới có quyền kiểm duyệt bài viết.');
    }
    const posts = this.readJson<DetailedPost[]>('community.json', INITIAL_DETAILED_POSTS);
    const idx = posts.findIndex((p) => p.id === postId);
    if (idx === -1) throw new NotFoundError('Không tìm thấy bài viết.');
    posts[idx] = {
      ...posts[idx],
      status,
      isFeatured: isFeatured !== undefined ? isFeatured : posts[idx].isFeatured,
    };
    this.writeJson('community.json', posts);
    this.appendAuditLog(actor, `moderate_post_${status}`, 'post', postId, posts[idx].title);
    return posts[idx];
  }

  createContentReport(
    input: {
      targetType: 'post' | 'comment' | 'video';
      targetId: string;
      targetTitle: string;
      reason: string;
    },
    actor: RequestActor
  ): ContentReport {
    if (!input.reason || !input.reason.trim()) {
      throw new ValidationError('Vui lòng chọn hoặc nhập lý do báo cáo.');
    }
    const reports = this.readJson<ContentReport[]>('reports.json', []);
    const item: ContentReport = {
      id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      targetType: input.targetType,
      targetId: input.targetId,
      targetTitle: input.targetTitle,
      reporterId: actor.id,
      reporterName: actor.name,
      reason: input.reason.trim(),
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    reports.unshift(item);
    this.writeJson('reports.json', reports);
    return item;
  }

  getContentReports(actor: RequestActor): ContentReport[] {
    if (actor.role !== 'admin' && actor.role !== 'moderator') {
      throw new ForbiddenError('Chỉ Admin hoặc Moderator mới được xem danh sách báo cáo vi phạm.');
    }
    return this.readJson<ContentReport[]>('reports.json', []);
  }

  resolveContentReport(
    reportId: string,
    status: 'resolved_removed' | 'dismissed',
    resolutionNote: string,
    actor: RequestActor
  ): ContentReport {
    if (actor.role !== 'admin' && actor.role !== 'moderator') {
      throw new ForbiddenError('Không có quyền xử lý báo cáo vi phạm.');
    }
    const reports = this.readJson<ContentReport[]>('reports.json', []);
    const idx = reports.findIndex((r) => r.id === reportId);
    if (idx === -1) throw new NotFoundError('Không tìm thấy báo cáo.');
    reports[idx] = {
      ...reports[idx],
      status,
      resolvedBy: actor.name,
      resolutionNote: resolutionNote?.trim() || '',
      resolvedAt: new Date().toISOString(),
    };
    this.writeJson('reports.json', reports);

    // If removed, hide/remove the target automatically
    if (status === 'resolved_removed') {
      if (reports[idx].targetType === 'post') {
        const posts = this.readJson<DetailedPost[]>('community.json', INITIAL_DETAILED_POSTS);
        const pIdx = posts.findIndex((p) => p.id === reports[idx].targetId);
        if (pIdx !== -1) {
          posts[pIdx].status = 'removed';
          this.writeJson('community.json', posts);
        }
      } else if (reports[idx].targetType === 'video') {
        const vids = this.readJson<NovaVideoItem[]>('videos.json', NOVA_VIDEOS_DATA);
        const vIdx = vids.findIndex((v) => v.id === reports[idx].targetId);
        if (vIdx !== -1) {
          vids[vIdx].status = 'hidden';
          this.writeJson('videos.json', vids);
        }
      }
    }

    this.appendAuditLog(
      actor,
      `resolve_report_${status}`,
      reports[idx].targetType,
      reports[idx].targetId,
      resolutionNote || reports[idx].reason
    );
    return reports[idx];
  }

  // =========================================================================
  // 8. MODULE 8: NOVA FAMILY SHARING (Strict Privacy & Permissions Control)
  // =========================================================================
  getFamilyConnections(userId: string): FamilyConnection[] {
    const all = this.readJson<FamilyConnection[]>('family.json', []);
    return all.filter((f) => f.ownerId === userId || f.memberId === userId);
  }

  createFamilyInvite(
    owner: RequestActor,
    input: {
      memberName: string;
      relationship: string;
      permissions?: Partial<FamilySharePermissions>;
    }
  ): FamilyConnection {
    if (!input.memberName.trim()) throw new ValidationError('Vui lòng nhập tên người thân.');
    const all = this.readJson<FamilyConnection[]>('family.json', []);
    const code = `NOVA-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const conn: FamilyConnection = {
      id: `fam-${Date.now()}`,
      ownerId: owner.id,
      ownerName: owner.name,
      memberName: input.memberName.trim(),
      relationship: input.relationship?.trim() || 'Người thân',
      inviteCode: code,
      role: 'viewer',
      status: 'pending',
      permissions: {
        shareAppointments: input.permissions?.shareAppointments ?? true,
        shareChecklist: input.permissions?.shareChecklist ?? true,
        shareMilestones: input.permissions?.shareMilestones ?? true,
        shareMemories: input.permissions?.shareMemories ?? false,
        // Sensitive health data NEVER shared automatically! Must be explicit user toggle.
        shareSensitiveHealth: input.permissions?.shareSensitiveHealth === true,
      },
      createdAt: new Date().toISOString(),
    };
    all.unshift(conn);
    this.writeJson('family.json', all);
    return conn;
  }

  joinFamilyByCode(inviteCode: string, member: RequestActor): FamilyConnection {
    const normalized = inviteCode.trim().toUpperCase();
    const all = this.readJson<FamilyConnection[]>('family.json', []);
    const idx = all.findIndex((f) => f.inviteCode === normalized && f.status !== 'revoked');
    if (idx === -1) throw new NotFoundError('Mã mời gia đình không hợp lệ hoặc đã bị thu hồi.');
    if (all[idx].ownerId === member.id) {
      throw new ValidationError('Bạn không thể tự tham gia mã mời của chính mình.');
    }
    all[idx] = {
      ...all[idx],
      memberId: member.id,
      memberName: member.name,
      status: 'active',
    };
    this.writeJson('family.json', all);
    return all[idx];
  }

  updateFamilyPermissions(
    connectionId: string,
    permissions: Partial<FamilySharePermissions>,
    actor: RequestActor
  ): FamilyConnection {
    const all = this.readJson<FamilyConnection[]>('family.json', []);
    const idx = all.findIndex((f) => f.id === connectionId);
    if (idx === -1) throw new NotFoundError('Không tìm thấy liên kết gia đình.');
    if (all[idx].ownerId !== actor.id) {
      throw new ForbiddenError('Chỉ chủ hồ sơ mới được thay đổi quyền chia sẻ dữ liệu.');
    }
    all[idx] = {
      ...all[idx],
      permissions: {
        ...all[idx].permissions,
        ...permissions,
      },
    };
    this.writeJson('family.json', all);
    return all[idx];
  }

  revokeFamilyConnection(connectionId: string, actor: RequestActor): FamilyConnection {
    const all = this.readJson<FamilyConnection[]>('family.json', []);
    const idx = all.findIndex((f) => f.id === connectionId);
    if (idx === -1) throw new NotFoundError('Không tìm thấy liên kết gia đình.');
    if (all[idx].ownerId !== actor.id && all[idx].memberId !== actor.id) {
      throw new ForbiddenError('Không có quyền thu hồi liên kết này.');
    }
    all[idx] = { ...all[idx], status: 'revoked' };
    this.writeJson('family.json', all);
    return all[idx];
  }

  getSharedFamilySnapshot(connectionId: string, actor: RequestActor): {
    connection: FamilyConnection;
    ownerProfile: Partial<UserProfile>;
    milestones?: number[];
    checklists?: ChecklistItem[];
    memories?: MemoryEntry[];
    sensitiveDiary?: Record<string, HealthDiaryEntry>;
  } {
    const all = this.readJson<FamilyConnection[]>('family.json', []);
    const conn = all.find((f) => f.id === connectionId);
    if (!conn || conn.status === 'revoked') {
      throw new ForbiddenError('Quyền xem chia sẻ gia đình không tồn tại hoặc đã bị thu hồi.');
    }
    if (conn.ownerId !== actor.id && conn.memberId !== actor.id) {
      throw new ForbiddenError('Bạn không thuộc nhóm gia đình này.');
    }

    const owner = this.getUserById(conn.ownerId);
    const result: ReturnType<EcosystemStore['getSharedFamilySnapshot']> = {
      connection: conn,
      ownerProfile: {
        name: owner?.name || conn.ownerName,
        pregnancyWeek: owner?.pregnancyWeek,
        dueDate: owner?.dueDate,
        babyNickname: owner?.babyNickname,
      },
    };

    if (conn.permissions.shareMilestones) {
      result.milestones = this.getJourneyState(conn.ownerId).completedMilestoneWeeks;
    }
    if (conn.permissions.shareChecklist) {
      result.checklists = this.getChecklists(conn.ownerId);
    }
    if (conn.permissions.shareMemories) {
      result.memories = this.getMemories(conn.ownerId).filter((m) => m.privacy !== 'private');
    }
    // Strictly only expose health diary if owner explicitly turned shareSensitiveHealth ON
    if (conn.permissions.shareSensitiveHealth) {
      result.sensitiveDiary = this.getDiaryEntries(conn.ownerId);
    }

    return result;
  }

  // =========================================================================
  // 9. MODULE 9: NOVA BIRTH PLAN
  // =========================================================================
  getBirthPlan(userId: string): BirthPlanData {
    const all = this.readJson<Record<string, BirthPlanData>>('birth_plan.json', {});
    if (all[userId]) return all[userId];
    const user = this.getUserById(userId);
    return {
      userId,
      expectedDueDate: user?.dueDate || '15/11/2026',
      preferredHospital: '',
      hospitalAddress: '',
      obgynName: '',
      supportContacts: (user?.emergencyContacts || []).slice(0, 3).map((c) => ({
        id: c.id,
        name: c.name,
        role: c.relationship,
        phone: c.phone,
      })),
      birthPreferences: ['Da kề da 90 phút ngay sau sinh', 'Cho bé bú mẹ sớm trong giờ đầu'],
      personalNotes: '',
      postpartumSupportPlan: '',
      prepItems: [
        { id: 'bp-1', label: 'Đăng ký hồ sơ sinh & làm xét nghiệm tuần 36', checked: false },
        { id: 'bp-2', label: 'Tìm hiểu lộ trình di chuyển tới bệnh viện', checked: false },
      ],
      hospitalBagItems: [
        { id: 'hb-1', label: 'Giấy tờ tùy thân, BHYT & sổ khám thai', checked: false },
        { id: 'hb-2', label: 'Quần áo mẹ & bé sơ sinh đã giặt ủi sạch', checked: false },
      ],
      updatedAt: new Date().toISOString(),
    };
  }

  saveBirthPlan(userId: string, plan: BirthPlanData, actor: RequestActor): BirthPlanData {
    if (actor.id !== userId) throw new ForbiddenError('Không thể chỉnh sửa kế hoạch sinh của tài khoản khác.');
    const all = this.readJson<Record<string, BirthPlanData>>('birth_plan.json', {});
    const saved: BirthPlanData = {
      ...plan,
      userId,
      updatedAt: new Date().toISOString(),
    };
    all[userId] = saved;
    this.writeJson('birth_plan.json', all);
    return saved;
  }

  // =========================================================================
  // 10. MODULE 10: NOVA POSTPARTUM & BABY
  // =========================================================================
  getPostpartumState(userId: string): PostpartumState {
    const all = this.readJson<Record<string, PostpartumState>>('postpartum.json', {});
    return (
      all[userId] || {
        userId,
        isPostpartumMode: false,
        postpartumDiary: [],
        careLogs: [],
        completedMomChecklistIds: [],
        completedBabyChecklistIds: [],
        achievedBabyMilestoneIds: [],
        albumPhotos: [],
      }
    );
  }

  updatePostpartumState(
    userId: string,
    updater: (curr: PostpartumState) => PostpartumState
  ): PostpartumState {
    const all = this.readJson<Record<string, PostpartumState>>('postpartum.json', {});
    const curr = this.getPostpartumState(userId);
    const next = { ...updater(curr), userId };
    all[userId] = next;
    this.writeJson('postpartum.json', all);

    // Sync pregnancyStatus cleanly without losing pregnancy data
    const users = this.getUsersDirectory();
    const uidx = users.findIndex((u) => u.id === userId);
    if (uidx !== -1) {
      users[uidx] = {
        ...users[uidx],
        pregnancyStatus: next.isPostpartumMode ? 'postpartum' : 'pregnant',
      };
      this.writeJson('users.json', users);
    }
    return next;
  }

  addPostpartumDiary(
    userId: string,
    entry: Omit<PostpartumDiaryEntry, 'id' | 'createdAt'>
  ): PostpartumState {
    return this.updatePostpartumState(userId, (curr) => ({
      ...curr,
      postpartumDiary: [
        { ...entry, id: `ppd-${Date.now()}`, createdAt: new Date().toISOString() },
        ...curr.postpartumDiary,
      ],
    }));
  }

  addBabyCareLog(userId: string, log: Omit<BabyCareLog, 'id'>): PostpartumState {
    return this.updatePostpartumState(userId, (curr) => ({
      ...curr,
      careLogs: [{ ...log, id: `bcl-${Date.now()}` }, ...curr.careLogs],
    }));
  }

  addBabyAlbumPhoto(
    userId: string,
    photo: Omit<BabyAlbumPhoto, 'id' | 'createdAt'>
  ): PostpartumState {
    return this.updatePostpartumState(userId, (curr) => ({
      ...curr,
      albumPhotos: [
        { ...photo, id: `bap-${Date.now()}`, createdAt: new Date().toISOString() },
        ...curr.albumPhotos,
      ],
    }));
  }

  // =========================================================================
  // 11. MODULE 12 & 18: E-COMMERCE CATALOG, STOCK, WISHLIST & ORDERS
  // =========================================================================
  getProducts(): ProductItem[] {
    return this.readJson<ProductItem[]>('products.json', PRODUCTS_DATA);
  }

  upsertProduct(product: Partial<ProductItem> & { id?: string }, actor: RequestActor): ProductItem {
    if (actor.role !== 'admin') {
      throw new ForbiddenError('Chỉ Quản trị viên mới có quyền quản lý danh mục & sản phẩm.');
    }
    const products = this.getProducts();
    if (product.id) {
      const idx = products.findIndex((p) => p.id === product.id);
      if (idx !== -1) {
        products[idx] = { ...products[idx], ...product };
        this.writeJson('products.json', products);
        this.appendAuditLog(actor, 'update_product', 'product', products[idx].id, products[idx].name);
        return products[idx];
      }
    }
    if (!product.name?.trim() || !product.price) {
      throw new ValidationError('Vui lòng nhập đầy đủ tên và giá sản phẩm.');
    }
    const newItem: ProductItem = {
      id: `prod-${Date.now()}`,
      name: product.name.trim(),
      brand: product.brand?.trim() || 'Nova Store (Demo)',
      price: Number(product.price),
      formattedPrice: `${Number(product.price).toLocaleString('vi-VN')}đ`,
      originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
      formattedOriginalPrice: product.originalPrice
        ? `${Number(product.originalPrice).toLocaleString('vi-VN')}đ`
        : undefined,
      reviewsCount: 0,
      category: product.category || 'maternal_care',
      image: product.image || PRODUCTS_DATA[0].image,
      description: product.description?.trim() || '',
      benefits: product.benefits || ['Sản phẩm minh họa danh mục Nova'],
      inStock: (product.stockCount ?? 10) > 0,
      stockCount: product.stockCount ?? 10,
      isDemo: true,
    };
    products.unshift(newItem);
    this.writeJson('products.json', products);
    this.appendAuditLog(actor, 'create_product', 'product', newItem.id, newItem.name);
    return newItem;
  }

  getWishlist(userId: string): string[] {
    const all = this.readJson<Record<string, string[]>>('wishlist.json', {});
    return all[userId] || [];
  }

  toggleWishlist(userId: string, productId: string): string[] {
    const all = this.readJson<Record<string, string[]>>('wishlist.json', {});
    const curr = all[userId] || [];
    const next = curr.includes(productId) ? curr.filter((id) => id !== productId) : [productId, ...curr];
    all[userId] = next;
    this.writeJson('wishlist.json', all);
    return next;
  }

  validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; message: string } {
    const normalized = code.trim().toUpperCase();
    const rule = AVAILABLE_COUPONS.find((c) => c.code === normalized);
    if (!rule) return { valid: false, discount: 0, message: 'Mã giảm giá không tồn tại.' };
    if (subtotal < rule.minOrder) {
      return {
        valid: false,
        discount: 0,
        message: `Đơn tối thiểu ${rule.minOrder.toLocaleString('vi-VN')}đ để dùng mã ${rule.code}.`,
      };
    }
    const discount =
      rule.type === 'fixed'
        ? rule.value
        : Math.min(150000, Math.round((subtotal * rule.value) / 100));
    return { valid: true, discount, message: `Áp dụng ${rule.code}: Giảm ${discount.toLocaleString('vi-VN')}đ` };
  }

  getOrders(userId: string, actorRole: UserRole = 'user'): OrderInfo[] {
    const all = this.readJson<OrderInfo[]>('orders.json', []);
    if (actorRole === 'admin' && userId === '*') return all;
    return all.filter((o) => o.userId === userId);
  }

  createOrder(userId: string, order: Omit<OrderInfo, 'userId' | 'createdAt' | 'trackingHistory'>): OrderInfo {
    if (!order.items || order.items.length === 0) {
      throw new ValidationError('Giỏ hàng trống.');
    }
    // Online gateways must NOT be marked paid or mutate stock without real gateway credentials
    if ((order.paymentMethod === 'momo' || order.paymentMethod === 'card') && !process.env.PAYMENT_GATEWAY_SECRET_KEY) {
      throw new ValidationError('Cổng thanh toán trực tuyến chưa được cấu hình. Vui lòng chọn COD hoặc chuyển khoản VietQR chờ xác minh.');
    }

    // Check stock & decrement if available
    const products = this.getProducts();
    for (const item of order.items) {
      const pIdx = products.findIndex((p) => p.id === item.product.id);
      if (pIdx !== -1 && (!products[pIdx].inStock || (products[pIdx].stockCount ?? 1) < item.quantity)) {
        throw new ValidationError(`Sản phẩm "${products[pIdx].name}" hiện không đủ số lượng tồn kho.`);
      }
    }

    // Decrement stock
    for (const item of order.items) {
      const pIdx = products.findIndex((p) => p.id === item.product.id);
      if (pIdx !== -1 && products[pIdx].stockCount !== undefined) {
        const remaining = Math.max(0, (products[pIdx].stockCount || 0) - item.quantity);
        products[pIdx].stockCount = remaining;
        products[pIdx].inStock = remaining > 0;
      }
    }
    this.writeJson('products.json', products);

    const nowIso = new Date().toISOString();
    const initialStatus = order.paymentMethod === 'vietqr' ? 'awaiting_verification' : 'pending';
    const created: OrderInfo = {
      ...order,
      userId,
      createdAt: nowIso,
      status: initialStatus,
      paymentStatus: order.paymentMethod === 'vietqr' ? 'awaiting_verification' : 'unpaid',
      trackingHistory: [
        {
          status: initialStatus,
          label:
            order.paymentMethod === 'vietqr'
              ? 'Đã ghi nhận đơn hàng · Chờ xác minh chuyển khoản VietQR'
              : 'Đã đặt đơn hàng COD · Chờ xác nhận',
          timestamp: nowIso,
        },
      ],
    };

    const all = this.readJson<OrderInfo[]>('orders.json', []);
    all.unshift(created);
    this.writeJson('orders.json', all);
    return created;
  }

  updateOrderStatus(
    orderId: string,
    status: OrderInfo['status'],
    paymentStatus: OrderInfo['paymentStatus'] | undefined,
    actor: RequestActor
  ): OrderInfo {
    if (actor.role !== 'admin') {
      throw new ForbiddenError('Chỉ Quản trị viên mới có quyền cập nhật trạng thái đơn hàng.');
    }
    const all = this.readJson<OrderInfo[]>('orders.json', []);
    const idx = all.findIndex((o) => o.orderId === orderId);
    if (idx === -1) throw new NotFoundError('Không tìm thấy đơn hàng.');

    const labels: Record<OrderInfo['status'], string> = {
      pending: 'Chờ xác nhận',
      awaiting_verification: 'Chờ xác minh chuyển khoản',
      confirmed: 'Đã xác nhận & Đang đóng gói',
      shipping: 'Đang giao hàng',
      delivered: 'Đã giao thành công',
      cancelled: 'Đã hủy đơn',
    };

    const nowIso = new Date().toISOString();
    const history = Array.isArray(all[idx].trackingHistory) ? all[idx].trackingHistory! : [];
    history.push({
      status,
      label: labels[status],
      timestamp: nowIso,
      note: `Cập nhật bởi ${actor.name}`,
    });

    all[idx] = {
      ...all[idx],
      status,
      paymentStatus: paymentStatus ?? all[idx].paymentStatus,
      trackingHistory: history,
    };
    this.writeJson('orders.json', all);
    this.appendAuditLog(actor, `update_order_${status}`, 'order', orderId, labels[status]);
    return all[idx];
  }

  // =========================================================================
  // 12. MODULE 15: NOVA REWARDS (Gentle Achievements)
  // =========================================================================
  getRewards(userId: string): RewardBadge[] {
    const all = this.readJson<Record<string, RewardBadge[]>>('rewards.json', {});
    const saved = all[userId] || [];
    const savedMap = new Map(saved.map((b) => [b.id, b]));
    return REWARD_BADGE_DEFINITIONS.map((def) => {
      const existing = savedMap.get(def.id);
      return existing || { ...def, unlocked: false };
    });
  }

  evaluateAndUnlockRewards(userId: string): RewardBadge[] {
    const all = this.readJson<Record<string, RewardBadge[]>>('rewards.json', {});
    const current = this.getRewards(userId);
    const journey = this.getJourneyState(userId);
    const checklists = this.getChecklists(userId);
    const memories = this.getMemories(userId);
    const diary = Object.keys(this.getDiaryEntries(userId));
    const posts = this.readJson<DetailedPost[]>('community.json', INITIAL_DETAILED_POSTS);

    const conditions: Record<string, boolean> = {
      'badge-journey-start': journey.completedMilestoneWeeks.length >= 1 || journey.dueDateHistory.length >= 1,
      'badge-care-water': diary.length >= 1,
      'badge-checklist-5': checklists.filter((c) => c.completed).length >= 5,
      'badge-memory-keeper': memories.length >= 1,
      'badge-community-heart': posts.some((p) => p.authorId === userId || p.likedBy?.includes(userId)),
    };

    const now = new Date().toISOString();
    const updated = current.map((badge) => {
      if (!badge.unlocked && conditions[badge.id]) {
        return { ...badge, unlocked: true, unlockedAt: now };
      }
      return badge;
    });

    all[userId] = updated;
    this.writeJson('rewards.json', all);
    return updated;
  }

  // =========================================================================
  // 13. MODULE 18: ADMIN DASHBOARD OVERVIEW
  // =========================================================================
  getAdminOverview(actor: RequestActor) {
    if (actor.role !== 'admin' && actor.role !== 'moderator') {
      throw new ForbiddenError('Không có quyền truy cập bảng điều khiển quản trị.');
    }
    const users = this.getUsersDirectory();
    const videos = this.readJson<NovaVideoItem[]>('videos.json', NOVA_VIDEOS_DATA);
    const posts = this.readJson<DetailedPost[]>('community.json', INITIAL_DETAILED_POSTS);
    const articles = this.getKnowledgeArticles(actor.role, true);
    const orders = this.readJson<OrderInfo[]>('orders.json', []);
    const reports = this.readJson<ContentReport[]>('reports.json', []);
    const products = this.getProducts();
    const auditLogs = this.getAuditLogs(actor);

    return {
      stats: {
        usersCount: users.length,
        pendingVideosCount: videos.filter((v) => v.status === 'pending').length,
        totalVideosCount: videos.length,
        postsCount: posts.length,
        openReportsCount: reports.filter((r) => r.status === 'open').length,
        ordersCount: orders.length,
        pendingOrdersCount: orders.filter((o) => o.status === 'pending' || o.status === 'awaiting_verification').length,
        outOfStockProductsCount: products.filter((p) => !p.inStock).length,
      },
      users,
      videos,
      posts,
      articles,
      orders,
      reports,
      products,
      auditLogs,
    };
  }
}
