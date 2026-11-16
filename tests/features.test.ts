import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Setup Mock localStorage for Node test runner environment
const mockStorage: Record<string, string> = {};
if (typeof globalThis.localStorage === 'undefined' || !globalThis.localStorage) {
  (globalThis as any).localStorage = {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => {
      mockStorage[key] = String(value);
    },
    removeItem: (key: string) => {
      delete mockStorage[key];
    },
    clear: () => {
      for (const k of Object.keys(mockStorage)) {
        delete mockStorage[k];
      }
    },
  };
}

import { shouldReminderTriggerAt } from '../src/services/notificationService';
import { storageService } from '../src/services/storageService';
import {
  ServerDataStore,
  ForbiddenError,
  ValidationError,
  extractMentions,
  RequestActor,
} from '../src/services/serverDataStore';
import { SHOP_CATEGORIES, PRODUCTS_DATA } from '../src/data/mockData';
import { HealthReminder } from '../src/types';

const USER_A: RequestActor = {
  id: 'usr-1',
  name: 'Khánh Băng',
  avatar: '',
  role: 'user',
};

const USER_B: RequestActor = {
  id: 'usr-2',
  name: 'Mẹ Lan Hương',
  avatar: '',
  role: 'user',
};

const ADMIN_ACTOR: RequestActor = {
  id: 'usr-admin',
  name: 'Quản trị viên Nova',
  avatar: '',
  role: 'admin',
};

const GUEST_ACTOR: RequestActor = {
  id: 'usr-guest',
  name: 'Khách',
  avatar: '',
  role: 'user',
};

describe('1. Care & Diary Custom Reminders + Account Isolation', () => {
  let tmpDir: string;
  let store: ServerDataStore;

  beforeEach(() => {
    (globalThis.localStorage as any).clear();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-test-reminders-'));
    store = new ServerDataStore(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('New accounts start with empty reminders and zero fake notifications', () => {
    assert.deepEqual(storageService.loadHealthReminders('usr-fresh-1'), []);
    assert.deepEqual(storageService.loadNotifications(), []);
    assert.deepEqual(store.getReminders('usr-fresh-1'), []);
  });

  test('Reminders are strictly isolated per account (userId)', () => {
    const remA: HealthReminder = {
      id: 'rem-a',
      userId: 'usr-1',
      title: 'Uống viên sắt',
      notes: 'Sau bữa trưa 1 tiếng',
      date: '2026-11-15',
      time: '12:30',
      category: 'pill',
      frequency: 'daily',
      isEnabled: true,
      createdAt: '2026-11-15T00:00:00.000Z',
    };
    const remB: HealthReminder = {
      id: 'rem-b',
      userId: 'usr-2',
      title: 'Khám thai tuần 28',
      date: '2026-11-20',
      time: '09:00',
      category: 'checkup',
      frequency: 'once',
      isEnabled: true,
      createdAt: '2026-11-15T00:00:00.000Z',
    };

    storageService.saveHealthReminders([remA], 'usr-1');
    storageService.saveHealthReminders([remB], 'usr-2');

    assert.equal(storageService.loadHealthReminders('usr-1').length, 1);
    assert.equal(storageService.loadHealthReminders('usr-1')[0].title, 'Uống viên sắt');
    assert.equal(storageService.loadHealthReminders('usr-2').length, 1);
    assert.equal(storageService.loadHealthReminders('usr-2')[0].title, 'Khám thai tuần 28');

    store.saveReminders('usr-1', [remA]);
    store.saveReminders('usr-2', [remB]);
    assert.equal(store.getReminders('usr-1')[0].id, 'rem-a');
    assert.equal(store.getReminders('usr-2')[0].id, 'rem-b');
  });

  test('shouldReminderTriggerAt handles once, daily, weekly, custom_days, and paused states', () => {
    // Sunday Nov 15, 2026 at 08:30 local time
    const sundayMorning = new Date(2026, 10, 15, 8, 30, 0);
    const mondayMorning = new Date(2026, 10, 16, 8, 30, 0);

    const onceRem: HealthReminder = {
      id: 'r1',
      title: 'Siêu âm',
      date: '2026-11-15',
      time: '08:30',
      category: 'checkup',
      frequency: 'once',
      isEnabled: true,
      createdAt: '2026-11-15T00:00:00.000Z',
    };
    assert.equal(shouldReminderTriggerAt(onceRem, sundayMorning), true);
    assert.equal(shouldReminderTriggerAt(onceRem, mondayMorning), false);

    const pausedRem: HealthReminder = { ...onceRem, isEnabled: false };
    assert.equal(shouldReminderTriggerAt(pausedRem, sundayMorning), false);

    const dailyFutureRem: HealthReminder = {
      id: 'r2',
      title: 'Uống nước',
      date: '2026-11-16',
      time: '08:30',
      category: 'water',
      frequency: 'daily',
      isEnabled: true,
      createdAt: '2026-11-15T00:00:00.000Z',
    };
    assert.equal(shouldReminderTriggerAt(dailyFutureRem, sundayMorning), false);
    assert.equal(shouldReminderTriggerAt(dailyFutureRem, mondayMorning), true);

    const customDaysRem: HealthReminder = {
      id: 'r3',
      title: 'Đi bộ nhẹ',
      time: '08:30',
      category: 'walk',
      frequency: 'custom_days',
      daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
      isEnabled: true,
      createdAt: '2026-11-15T00:00:00.000Z',
    };
    assert.equal(shouldReminderTriggerAt(customDaysRem, sundayMorning), false);
    assert.equal(shouldReminderTriggerAt(customDaysRem, mondayMorning), true);

    const weeklyRem: HealthReminder = {
      id: 'r4',
      title: 'Cân nặng hàng tuần',
      date: '2026-11-15', // Sunday
      time: '08:30',
      category: 'custom',
      frequency: 'weekly',
      isEnabled: true,
      createdAt: '2026-11-15T00:00:00.000Z',
    };
    assert.equal(shouldReminderTriggerAt(weeklyRem, sundayMorning), true);
    assert.equal(shouldReminderTriggerAt(weeklyRem, mondayMorning), false);
  });
});

describe('2. Video Thai Giáo Upload, RBAC Moderation & Notifications', () => {
  let tmpDir: string;
  let store: ServerDataStore;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-test-videos-'));
    store = new ServerDataStore(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('Guest cannot upload video; regular user upload enters pending status', () => {
    assert.throws(
      () =>
        store.createVideo(
          {
            title: 'Nhạc thai giáo Mozart',
            description: 'Nhạc nhẹ nhàng buổi tối',
            videoUrl: '/uploads/videos/sample.mp4',
            category: 'thai_giao_nhac',
          },
          GUEST_ACTOR
        ),
      ForbiddenError
    );

    const created = store.createVideo(
      {
        title: 'Nhạc thai giáo Mozart',
        description: 'Nhạc nhẹ nhàng buổi tối',
        videoUrl: '/uploads/videos/sample.mp4',
        category: 'thai_giao_nhac',
      },
      USER_A
    );

    assert.equal(created.status, 'pending');
    assert.equal(created.authorId, USER_A.id);

    // Pending video does not appear in public feed until approved
    const publicFeed = store.getVideos(USER_B.id, USER_B.role, 'feed');
    assert.equal(publicFeed.some((v) => v.id === created.id), false);

    // Author sees it in 'mine'
    const myVideos = store.getVideos(USER_A.id, USER_A.role, 'mine');
    assert.equal(myVideos.some((v) => v.id === created.id), true);
  });

  test('RBAC: Regular user cannot moderate or delete another user video; Admin can approve & notify', () => {
    const created = store.createVideo(
      {
        title: 'Bài tập thở giảm đau',
        description: 'Hướng dẫn hít thở sâu',
        videoUrl: 'https://example.com/breath.mp4',
        category: 'yoga_van_dong',
      },
      USER_A
    );

    // Non-admin cannot moderate
    assert.throws(
      () => store.moderateVideo(created.id, 'approved', undefined, USER_A),
      ForbiddenError
    );

    // Non-author regular user cannot delete or edit
    assert.throws(() => store.deleteVideo(created.id, USER_B), ForbiddenError);
    assert.throws(
      () => store.updateVideo(created.id, { title: 'Hacked' }, USER_B),
      ForbiddenError
    );

    // Admin approves video
    const approved = store.moderateVideo(created.id, 'approved', undefined, ADMIN_ACTOR);
    assert.equal(approved.status, 'approved');

    // Now visible on public feed
    const feed = store.getVideos(USER_B.id, USER_B.role, 'feed');
    assert.equal(feed.some((v) => v.id === created.id), true);

    // Author receives 'video_approved' notification
    const authorNotifs = store.getNotifications(USER_A.id, 'video');
    assert.equal(authorNotifs.some((n) => n.subType === 'video_approved' && n.targetId === created.id), true);

    // Subscriber USER_B receives 'video_new' notification
    const subscriberNotifs = store.getNotifications(USER_B.id, 'video');
    assert.equal(subscriberNotifs.some((n) => n.subType === 'video_new' && n.targetId === created.id), true);
  });

  test('Admin rejection notifies author with reason and opt-out suppresses new video alerts', () => {
    store.updatePreferences(USER_B.id, { videoEnabled: false });

    const v1 = store.createVideo(
      {
        title: 'Video thiếu âm thanh',
        description: 'Thử nghiệm',
        videoUrl: '/uploads/videos/test.mp4',
        category: 'dinh_duong',
      },
      USER_A
    );

    const rejected = store.moderateVideo(v1.id, 'rejected', 'Chất lượng âm thanh quá nhỏ', ADMIN_ACTOR);
    assert.equal(rejected.status, 'rejected');
    assert.equal(rejected.rejectionReason, 'Chất lượng âm thanh quá nhỏ');

    const authorNotifs = store.getNotifications(USER_A.id, 'video');
    assert.equal(authorNotifs[0].subType, 'video_rejected');
    assert.match(authorNotifs[0].description, /Chất lượng âm thanh quá nhỏ/);

    // Admin publishes directly -> USER_B opted out so receives 0 notifications
    store.createVideo(
      {
        title: 'Dinh dưỡng 3 tháng cuối',
        description: 'Thực đơn chuẩn',
        videoUrl: '/uploads/videos/menu.mp4',
        category: 'dinh_duong',
      },
      ADMIN_ACTOR
    );
    assert.equal(store.getNotifications(USER_B.id, 'video').length, 0);
  });
});

describe('3. Community Interaction Notifications, Replies & @Mentions', () => {
  let tmpDir: string;
  let store: ServerDataStore;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-test-community-'));
    store = new ServerDataStore(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('extractMentions detects valid @mentions cleanly', () => {
    const mentions = extractMentions('Cảm ơn @Mẹ Lan Hương và @Khánh Băng nhiều nhé!');
    const ids = mentions.map((m) => m.id).sort();
    assert.deepEqual(ids, ['usr-1', 'usr-2']);
  });

  test('Self-like and self-comment never notify actor; like toggles coalesce deduplication', () => {
    const post = store.createPost(
      {
        title: 'Kinh nghiệm uống sắt không táo bón',
        content: 'Mình uống cùng nước cam buổi sáng thấy rất ổn.',
        category: 'nutrition',
      },
      USER_A
    );

    // Self-like does not create notification
    store.togglePostLike(post.id, USER_A);
    assert.equal(store.getNotifications(USER_A.id, 'community').length, 0);

    // USER_B likes, unlikes, and re-likes -> coalesced into 1 notification row
    store.togglePostLike(post.id, USER_B);
    store.togglePostLike(post.id, USER_B);
    store.togglePostLike(post.id, USER_B);

    const notifs = store.getNotifications(USER_A.id, 'community');
    assert.equal(notifs.length, 1);
    assert.equal(notifs[0].subType, 'community_like');
    assert.equal(notifs[0].targetId, post.id);
    assert.equal(notifs[0].aggregateCount, 2);
  });

  test('Reply and @mention notifications carry post targetId & commentId without duplicate dispatch', () => {
    const post = store.createPost(
      {
        title: 'Chuẩn bị giỏ đồ đi sinh',
        content: 'Các mẹ chia sẻ kinh nghiệm nhé.',
        category: 'birth_prep',
      },
      USER_A
    );

    // USER_B comments on USER_A's post
    const { comment: firstComment } = store.addPostComment(
      post.id,
      USER_B,
      'Mẹ nhớ mang thêm vớ ấm và bình giữ nhiệt nhé!'
    );

    const authorNotifs = store.getNotifications(USER_A.id, 'community');
    assert.equal(authorNotifs.length, 1);
    assert.equal(authorNotifs[0].subType, 'community_comment');
    assert.equal(authorNotifs[0].commentId, firstComment.id);

    // USER_A replies to USER_B's comment and also @mentions USER_B -> USER_B gets single reply notification
    const { comment: replyComment } = store.addPostComment(
      post.id,
      USER_A,
      'Cảm ơn @Mẹ Lan Hương rất nhiều!',
      firstComment.id
    );

    const userBNotifs = store.getNotifications(USER_B.id, 'community');
    assert.equal(userBNotifs.length, 1);
    assert.equal(userBNotifs[0].subType, 'community_reply');
    assert.equal(userBNotifs[0].targetId, post.id);
    assert.equal(userBNotifs[0].commentId, replyComment.id);
  });

  test('Opting out of community notifications prevents further community alerts', () => {
    const post = store.createPost(
      {
        title: 'Hỏi về sữa bầu',
        content: 'Loại nào dễ uống ạ?',
        category: 'nutrition',
      },
      USER_A
    );

    store.updatePreferences(USER_A.id, { communityEnabled: false });
    store.togglePostLike(post.id, USER_B);
    store.addPostComment(post.id, USER_B, 'Mình uống sữa tươi không đường.');

    assert.equal(store.getNotifications(USER_A.id, 'community').length, 0);
  });
});

describe('4. Mother & Baby Shop Categories, Demo Transparency & Real Reviews', () => {
  let tmpDir: string;
  let store: ServerDataStore;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-test-shop-'));
    store = new ServerDataStore(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('Contains all 8 required Mother & Baby shop categories with products', () => {
    const requiredIds = [
      'maternal_care',
      'maternal_nutrition',
      'pregnancy_gear',
      'newborn_essentials',
      'apparel',
      'baby_hygiene',
      'toys_development',
      'postpartum',
    ];

    const categoryIds = SHOP_CATEGORIES.map((c) => c.id);
    for (const req of requiredIds) {
      assert.equal(categoryIds.includes(req as any), true, `Missing shop category: ${req}`);
      const count = PRODUCTS_DATA.filter((p) => p.category === req).length;
      assert.ok(count > 0, `Category ${req} must contain at least 1 product`);
    }
  });

  test('Demo products are clearly flagged and have zero fake pre-seeded reviews', () => {
    assert.ok(PRODUCTS_DATA.length >= 12);
    for (const p of PRODUCTS_DATA) {
      assert.equal(p.isDemo, true);
      assert.equal(p.reviewsCount, 0);
      assert.equal(p.rating, undefined);
      assert.ok(p.brand.length > 0);
    }

    const hasPromo = PRODUCTS_DATA.some((p) => p.originalPrice && p.originalPrice > p.price);
    const hasOutOfStock = PRODUCTS_DATA.some((p) => !p.inStock || p.stockCount === 0);
    assert.equal(hasPromo, true);
    assert.equal(hasOutOfStock, true);
  });

  test('Real product review submission computes actual average rating and validates input', () => {
    const productId = PRODUCTS_DATA[0].id;
    const initial = store.getProductReviews(productId);
    assert.equal(initial.reviewsCount, 0);
    assert.equal(initial.rating, undefined);

    assert.throws(
      () => store.addProductReview(productId, USER_A, 6, 'Quá tuyệt'),
      ValidationError
    );
    assert.throws(
      () => store.addProductReview(productId, USER_A, 5, '   '),
      ValidationError
    );

    store.addProductReview(productId, USER_A, 5, 'Dễ uống, không bị buồn nôn');
    const afterTwo = store.addProductReview(productId, USER_B, 4, 'Giao hàng cẩn thận');

    assert.equal(afterTwo.reviewsCount, 2);
    assert.equal(afterTwo.rating, 4.5);
    assert.equal(afterTwo.reviews.length, 2);
  });
});
