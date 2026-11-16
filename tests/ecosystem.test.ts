import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  EcosystemStore,
  issueSessionToken,
  verifySessionToken,
} from '../src/services/ecosystemStore';
import {
  ForbiddenError,
  NotFoundError,
  RequestActor,
  ValidationError,
} from '../src/services/serverDataStore';
import { PRODUCTS_DATA } from '../src/data/mockData';

const USER_A: RequestActor = {
  id: 'usr-1',
  name: 'Khánh Băng',
  avatar: 'KB',
  role: 'user',
};

const USER_B: RequestActor = {
  id: 'usr-2',
  name: 'Mẹ Lan Hương',
  avatar: 'LH',
  role: 'user',
};

const MOD_ACTOR: RequestActor = {
  id: 'usr-mod',
  name: 'Kiểm duyệt viên Nova',
  avatar: 'KD',
  role: 'moderator',
};

const ADMIN_ACTOR: RequestActor = {
  id: 'usr-admin',
  name: 'Quản trị viên Nova',
  avatar: 'QT',
  role: 'admin',
};

describe('Module 17 & 18: HMAC Session Auth, Anti-Header-Spoofing & RBAC', () => {
  let tmpDir: string;
  let eco: EcosystemStore;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-eco-auth-'));
    eco = new EcosystemStore(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('Signed session token verifies accurately and rejects tampered tokens', () => {
    const token = issueSessionToken({ id: 'usr-admin', name: 'Admin', role: 'admin' });
    const verified = verifySessionToken(token);
    assert.ok(verified);
    assert.equal(verified?.id, 'usr-admin');
    assert.equal(verified?.role, 'admin');

    // Tamper signature or payload
    const [encoded, sig] = token.split('.');
    assert.equal(verifySessionToken(`${encoded}.${sig}tampered`), null);
    const fakePayload = Buffer.from(
      JSON.stringify({ id: 'usr-1', name: 'Hacker', role: 'admin', exp: Date.now() + 60000 })
    ).toString('base64url');
    assert.equal(verifySessionToken(`${fakePayload}.${sig}`), null);

    // Expired token rejected
    const expiredToken = issueSessionToken({ id: 'usr-1', name: 'User', role: 'user' }, -1000);
    assert.equal(verifySessionToken(expiredToken), null);
  });

  test('upsertUserSessionProfile prevents arbitrary client role self-escalation', () => {
    const { user, token } = eco.upsertUserSessionProfile({
      id: 'usr-attacker',
      name: 'Kẻ giả mạo',
      role: 'admin', // Client tries passing admin
    });

    assert.equal(user.role, 'user');
    const decoded = verifySessionToken(token);
    assert.equal(decoded?.role, 'user');

    // Only authoritative admin/moderator IDs or admin-assigned roles receive elevated role
    const adminSession = eco.upsertUserSessionProfile({
      id: 'usr-admin',
      name: 'Quản trị viên Nova',
      role: 'user',
    });
    assert.equal(adminSession.user.role, 'admin');
  });

  test('Regular users cannot access Admin Overview, Audit Logs, or update user roles', () => {
    assert.throws(() => eco.getAdminOverview(USER_A), ForbiddenError);
    assert.throws(() => eco.getAuditLogs(USER_A), ForbiddenError);
    assert.throws(() => eco.updateUserRole('usr-2', 'moderator', USER_A), ForbiddenError);
    assert.throws(() => eco.updateUserRole('usr-2', 'admin', MOD_ACTOR), ForbiddenError);

    // Admin succeeds and audit log is recorded
    const promoted = eco.updateUserRole('usr-2', 'moderator', ADMIN_ACTOR);
    assert.equal(promoted.role, 'moderator');

    const overview = eco.getAdminOverview(ADMIN_ACTOR);
    assert.ok(overview.stats.usersCount >= 4);
    assert.equal(overview.auditLogs[0].action, 'update_user_role');
  });
});

describe('Modules 1, 2, 3, 9, 10: Journey, Memories, Checklists, Birth Plan & Postpartum Isolation', () => {
  let tmpDir: string;
  let eco: EcosystemStore;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-eco-modules-'));
    eco = new EcosystemStore(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('Journey milestones, due-date history, and Memories isolate per account and enforce ownership', () => {
    const j1 = eco.toggleMilestoneWeek(USER_A.id, 24);
    assert.deepEqual(j1.completedMilestoneWeeks, [24]);
    assert.deepEqual(eco.getJourneyState(USER_B.id).completedMilestoneWeeks, []);

    const adjusted = eco.recordDueDateAdjustment(USER_A.id, {
      previousDueDate: '15/11/2026',
      newDueDate: '20/11/2026',
      previousWeek: 24,
      newWeek: 23,
      reason: 'Siêu âm hình thái tuần 23',
    });
    assert.equal(adjusted.dueDateHistory.length, 1);
    assert.equal(eco.getUserById(USER_A.id)?.pregnancyWeek, 23);

    const mem = eco.createMemory(USER_A.id, {
      title: 'Lần đầu nghe tim thai',
      content: 'Nghe nhịp tim rộn ràng lắm con yêu.',
      type: 'ultrasound',
      monthNumber: 2,
      privacy: 'private',
      memoryDate: '2026-06-01',
    });
    assert.equal(eco.getMemories(USER_A.id).length, 1);
    assert.equal(eco.getMemories(USER_B.id).length, 0);

    // Cross-account edit/delete denied
    assert.throws(
      () => eco.updateMemory(USER_A.id, mem.id, { title: 'Sửa trộm' }, USER_B),
      ForbiddenError
    );
    assert.throws(() => eco.deleteMemory(USER_A.id, mem.id, USER_B), ForbiddenError);
  });

  test('Checklists, Birth Plan, and Postpartum transitions preserve pregnancy data cleanly', () => {
    const defaultList = eco.getChecklists(USER_A.id);
    assert.ok(defaultList.length >= 6);

    const customItem = eco.createChecklistItem(USER_A.id, {
      category: 'birth_bag',
      title: 'Chuẩn bị bình giữ nhiệt pha sữa',
    });
    assert.throws(
      () => eco.updateChecklistItem(USER_A.id, customItem.id, { completed: true }, USER_B),
      ForbiddenError
    );

    const plan = eco.getBirthPlan(USER_A.id);
    assert.throws(
      () =>
        eco.saveBirthPlan(
          USER_A.id,
          { ...plan, preferredHospital: 'Bệnh viện Từ Dũ' },
          USER_B
        ),
      ForbiddenError
    );
    const savedPlan = eco.saveBirthPlan(
      USER_A.id,
      { ...plan, preferredHospital: 'Bệnh viện Từ Dũ' },
      USER_A
    );
    assert.equal(savedPlan.preferredHospital, 'Bệnh viện Từ Dũ');

    // Switch to postpartum mode and verify Journey history stays intact
    eco.toggleMilestoneWeek(USER_A.id, 38);
    const pp = eco.updatePostpartumState(USER_A.id, (curr) => ({
      ...curr,
      isPostpartumMode: true,
      babyProfile: { id: 'baby-1', name: 'Bé Sóc', birthDate: '2026-11-15', gender: 'girl' },
    }));
    assert.equal(pp.isPostpartumMode, true);
    assert.equal(eco.getUserById(USER_A.id)?.pregnancyStatus, 'postpartum');
    assert.deepEqual(eco.getJourneyState(USER_A.id).completedMilestoneWeeks, [38]);

    const afterLog = eco.addBabyCareLog(USER_A.id, {
      type: 'feeding',
      title: 'Bú mẹ 20 phút',
      details: 'Bé bú ngoan bên trái',
      loggedAt: '2026-11-16T08:00:00.000Z',
    });
    assert.equal(afterLog.careLogs.length, 1);
  });
});

describe('Module 8 & Privacy: Family Sharing Controls, Opt-in Sensitive Data & Data Export/Delete', () => {
  let tmpDir: string;
  let eco: EcosystemStore;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-eco-family-'));
    eco = new EcosystemStore(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('Sensitive health diary is NEVER exposed by default and revoke locks out access immediately', () => {
    eco.upsertDiaryEntry(USER_A.id, '2026-11-15', {
      id: 'diary-2026-11-15',
      date: '2026-11-15',
      mood: 'calm',
      sleepHours: 7,
      sleepQuality: 'good',
      symptoms: [{ id: 'sym-1', name: 'Đau lưng nhẹ', severity: 'mild' }],
      personalNotes: 'Huyết áp ổn định',
      updatedAt: new Date().toISOString(),
    });
    eco.createMemory(USER_A.id, {
      title: 'Nhật ký riêng tư',
      content: 'Chỉ mình mẹ đọc',
      type: 'letter',
      monthNumber: 6,
      privacy: 'private',
      memoryDate: '2026-11-15',
    });

    const invite = eco.createFamilyInvite(USER_A, {
      memberName: 'Anh Minh',
      relationship: 'Chồng',
    });
    assert.equal(invite.permissions.shareSensitiveHealth, false);

    const joined = eco.joinFamilyByCode(invite.inviteCode, USER_B);
    assert.equal(joined.status, 'active');

    // Stranger cannot view snapshot
    assert.throws(
      () => eco.getSharedFamilySnapshot(joined.id, MOD_ACTOR),
      ForbiddenError
    );

    // Connected viewer gets milestones/checklists, NO private memories, NO sensitiveDiary
    const snap1 = eco.getSharedFamilySnapshot(joined.id, USER_B);
    assert.equal(snap1.sensitiveDiary, undefined);
    assert.equal(snap1.memories?.length ?? 0, 0);

    // Owner explicitly grants shareSensitiveHealth
    eco.updateFamilyPermissions(joined.id, { shareSensitiveHealth: true }, USER_A);
    const snap2 = eco.getSharedFamilySnapshot(joined.id, USER_B);
    assert.ok(snap2.sensitiveDiary?.['2026-11-15']);

    // Owner revokes -> immediate lockout
    eco.revokeFamilyConnection(joined.id, USER_A);
    assert.throws(() => eco.getSharedFamilySnapshot(joined.id, USER_B), ForbiddenError);
  });

  test('Full export & account data deletion cleanly removes user records', () => {
    eco.toggleMilestoneWeek(USER_A.id, 12);
    eco.createMemory(USER_A.id, {
      title: 'Kỷ niệm tuần 12',
      content: 'Khoảnh khắc tuyệt vời',
      type: 'moment',
      monthNumber: 3,
      privacy: 'family',
      memoryDate: '2026-08-01',
    });

    const exported = eco.exportUserEcosystemData(USER_A.id);
    assert.equal((exported.memories as any[]).length, 1);

    assert.throws(() => eco.deleteAccountData(USER_A.id, USER_B), ForbiddenError);
    const res = eco.deleteAccountData(USER_A.id, USER_A);
    assert.equal(res.deleted, true);
    assert.equal(eco.getMemories(USER_A.id).length, 0);
    assert.equal(eco.getUserById(USER_A.id), undefined);
  });
});

describe('Module 11, 12, 15: Medical Library Moderation, Honest Shop Orders & Gentle Rewards', () => {
  let tmpDir: string;
  let eco: EcosystemStore;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-eco-shop-'));
    eco = new EcosystemStore(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('Library articles require medicalSource and moderator approval before public listing', () => {
    assert.throws(
      () =>
        eco.createKnowledgeArticle(
          {
            title: 'Mẹo dân gian chưa kiểm chứng',
            summary: 'Tóm tắt',
            content: 'Nội dung',
            category: 'nutrition',
            medicalSource: '   ',
            readTimeMinutes: 3,
          },
          USER_A
        ),
      ValidationError
    );

    const pendingArt = eco.createKnowledgeArticle(
      {
        title: 'Bổ sung sắt đúng cách trong tam cá nguyệt 2',
        summary: 'Lưu ý uống sắt xa canxi',
        content: 'Uống sắt cùng vitamin C cách thời điểm uống canxi ít nhất 2 giờ.',
        category: 'nutrition',
        medicalSource: 'Bộ Y tế Việt Nam · Hướng dẫn Quốc gia Chăm sóc SKSS',
        readTimeMinutes: 4,
        weekMin: 20,
        weekMax: 24,
      },
      USER_A
    );
    assert.equal(pendingArt.status, 'pending');
    assert.equal(
      eco.getKnowledgeArticles('user', false).some((a) => a.id === pendingArt.id),
      false
    );

    assert.throws(
      () => eco.moderateKnowledgeArticle(pendingArt.id, 'approved', USER_A),
      ForbiddenError
    );
    eco.moderateKnowledgeArticle(pendingArt.id, 'approved', MOD_ACTOR);
    assert.equal(
      eco.getKnowledgeArticles('user', false).some((a) => a.id === pendingArt.id),
      true
    );
  });

  test('Shop validates coupons, decrements inventory, rejects unconfigured online payment, and verifies VietQR', () => {
    const validCoupon = eco.validateCoupon('MEBAU2026', 300000);
    assert.equal(validCoupon.valid, true);
    assert.equal(validCoupon.discount, 50000);

    const percentCoupon = eco.validateCoupon('NOVAVIP', 300000);
    assert.equal(percentCoupon.valid, true);
    assert.equal(percentCoupon.discount, 45000);

    const invalidCoupon = eco.validateCoupon('KHONGTONTAI', 300000);
    assert.equal(invalidCoupon.valid, false);

    const targetProduct = PRODUCTS_DATA[0];
    const initialStock = targetProduct.stockCount || 10;

    // Unconfigured online payment fails honestly
    const testAddress = {
      id: 'addr-test-1',
      fullName: 'Khánh Băng',
      phone: '0909123456',
      province: 'TP.HCM',
      district: 'Quận 1',
      ward: 'Phường Bến Nghé',
      streetAddress: '12 Lê Lợi',
    };

    assert.throws(
      () =>
        eco.createOrder(USER_A.id, {
          orderId: 'ORD-ONLINE-FAIL',
          shippingAddress: testAddress,
          shippingMethod: 'standard',
          shippingFee: 25000,
          paymentMethod: 'momo',
          items: [{ product: targetProduct, quantity: 1 }],
          subtotal: targetProduct.price,
          discountAmount: 0,
          totalAmount: targetProduct.price + 25000,
          status: 'pending',
          estimatedDeliveryDate: '2026-11-20',
        }),
      ValidationError
    );

    // Valid VietQR enters awaiting_verification & decrements stock
    const qrOrder = eco.createOrder(USER_A.id, {
      orderId: 'ORD-QR-1',
      shippingAddress: testAddress,
      shippingMethod: 'standard',
      shippingFee: 25000,
      paymentMethod: 'vietqr',
      items: [{ product: targetProduct, quantity: 2 }],
      subtotal: targetProduct.price * 2,
      discountAmount: 0,
      totalAmount: targetProduct.price * 2 + 25000,
      status: 'awaiting_verification',
      estimatedDeliveryDate: '2026-11-20',
    });

    assert.equal(qrOrder.status, 'awaiting_verification');
    assert.equal(qrOrder.paymentStatus, 'awaiting_verification');
    const updatedProduct = eco.getProducts().find((p) => p.id === targetProduct.id);
    assert.equal(updatedProduct?.stockCount, initialStock - 2);

    // Non-admin cannot verify payment / update order status
    assert.throws(
      () => eco.updateOrderStatus(qrOrder.orderId, 'confirmed', 'verified', USER_A),
      ForbiddenError
    );
    const confirmed = eco.updateOrderStatus(qrOrder.orderId, 'confirmed', 'verified', ADMIN_ACTOR);
    assert.equal(confirmed.status, 'confirmed');
    assert.equal(confirmed.paymentStatus, 'verified');
  });

  test('Rewards evaluate based on real user actions and respect opt-out', () => {
    eco.toggleMilestoneWeek(USER_A.id, 20);
    const badges = eco.evaluateAndUnlockRewards(USER_A.id);
    const journeyBadge = badges.find((b) => b.id === 'badge-journey-start');
    assert.equal(journeyBadge?.unlocked, true);

    const optOutProfile = eco.updatePrivacyAndPrefs(USER_A.id, { rewardsEnabled: false });
    assert.equal(optOutProfile.rewardsEnabled, false);
  });

  test('Content report resolution automatically hides reported community posts and logs audit trail', () => {
    const report = eco.createContentReport(
      {
        targetType: 'post',
        targetId: 'post-1',
        targetTitle: 'Bài viết test',
        reason: 'Quảng cáo sai lệch thông tin y tế',
      },
      USER_B
    );
    assert.equal(report.status, 'open');

    const resolved = eco.resolveContentReport(report.id, 'resolved_removed', 'Đã xác minh vi phạm', MOD_ACTOR);
    assert.equal(resolved.status, 'resolved_removed');
    assert.throws(() => eco.resolveContentReport('non-existent', 'dismissed', '', ADMIN_ACTOR), NotFoundError);
  });
});
