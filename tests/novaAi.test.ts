import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

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

import { detectEmergencyTriage, searchClinicalKnowledge } from '../src/services/knowledgeBaseService';
import { detectToolIntent, executeToolAction } from '../src/services/aiToolService';
import { aiMemoryService } from '../src/services/aiMemoryService';
import { storageService } from '../src/services/storageService';

describe('Nova AI Clinical Safety Triage Red Flags', () => {
  test('Identifies acute vaginal bleeding as medical emergency', () => {
    const triage = detectEmergencyTriage('Nova ơi mẹ bị ra máu đỏ tươi ướt băng vệ sinh thì làm sao?');
    assert.equal(triage.isEmergency, true);
    assert.match(triage.reason || '', /xuất huyết|ra máu/i);
    assert.match(triage.immediateAction || '', /115|cấp cứu/);
  });

  test('Identifies amniotic fluid leakage / water break as medical emergency', () => {
    const triage = detectEmergencyTriage('Mẹ thấy có nước ối chảy ra nhiều ở quần lót hình như bị vỡ ối');
    assert.equal(triage.isEmergency, true);
    assert.match(triage.reason || '', /vỡ ối|rỉ ối/i);
  });

  test('Identifies severe preeclampsia warning signs', () => {
    const triage = detectEmergencyTriage('Mẹ bị nhức đầu dữ dội, mắt nhìn mờ hoa mắt và mặt bị sưng phù');
    assert.equal(triage.isEmergency, true);
    assert.match(triage.reason || '', /tiền sản giật/i);
  });

  test('Identifies loss of fetal movements / fetal distress', () => {
    const triage = detectEmergencyTriage('Bé không cử động từ sáng đến giờ, suốt nửa ngày không thấy đạp cái nào');
    assert.equal(triage.isEmergency, true);
    assert.match(triage.reason || '', /thai máy|cử động/i);
  });

  test('Identifies severe acute abdominal contractions', () => {
    const triage = detectEmergencyTriage('Bụng mẹ đau quặn dữ dội từng cơn liên tục cứng đơ');
    assert.equal(triage.isEmergency, true);
  });

  test('Allows normal benign pregnancy symptoms through without emergency triage', () => {
    const triage = detectEmergencyTriage('Mẹ bị mỏi lưng nhẹ khi ngồi làm việc lâu ở tuần 24');
    assert.equal(triage.isEmergency, false);
  });
});

describe('Clinical Knowledge Retrieval & MoH / WHO Citations', () => {
  test('Retrieves iron and calcium absorption guidelines with authentic MoH citation', () => {
    const result = searchClinicalKnowledge('Uống canxi và sắt cách nhau bao lâu?');
    assert.ok(result.sources.length > 0);
    const hasMoH = result.sources.some((s) => s.source.includes('Bộ Y tế'));
    assert.equal(hasMoH, true);
    assert.match(result.summaryContext, /2 tiếng|2 giờ/i);
  });

  test('Retrieves gestational diabetes screening (OGTT 75g) guidelines', () => {
    const result = searchClinicalKnowledge('Xét nghiệm tiểu đường thai kỳ tuần 24 đến 28');
    assert.ok(result.sources.length > 0);
    assert.match(result.summaryContext, /nghiệm pháp dung nạp glucose|OGTT/i);
  });

  test('Retrieves fetal movement counting guideline', () => {
    const result = searchClinicalKnowledge('Cách đếm thai máy sau ăn');
    assert.ok(result.sources.length > 0);
    assert.match(result.summaryContext, /2 giờ/i);
    assert.match(result.summaryContext, /4/);
  });
});

describe('Nova AI Action Tools Intent Detection & Execution', () => {
  beforeEach(() => {
    (globalThis.localStorage as any).clear();
  });

  test('Detects water intake intent and parses volume accurately', () => {
    const action = detectToolIntent('Ghi giúp mẹ 300ml nước vừa uống');
    assert.ok(action);
    assert.equal(action.tool, 'log_water');
    assert.equal(action.data.amountMl, 300);
    assert.equal(action.status, 'pending_confirmation');
  });

  test('Executes water logging tool and updates persistent storage', () => {
    const action = detectToolIntent('Ghi nhận 250ml nước');
    assert.ok(action);
    const result = executeToolAction(action);
    assert.equal(result.success, true);

    const waterRecord = storageService.getWaterRecord();
    assert.ok(waterRecord.currentMl >= 250);
  });

  test('Detects prenatal appointment creation intent', () => {
    const action = detectToolIntent('Tạo lịch khám thai siêu âm 4D vào thứ 7 tuần tới tại BV Phụ sản');
    assert.ok(action);
    assert.equal(action.tool, 'create_appointment');
    assert.match(action.data.title, /khám thai|siêu âm/i);
  });

  test('Executes appointment creation tool and verifies storage', () => {
    const action = detectToolIntent('Tạo lịch khám thai định kỳ lúc 09:00 tại Bệnh viện Từ Dũ');
    assert.ok(action);
    const result = executeToolAction(action);
    assert.equal(result.success, true);

    const appointments = storageService.loadPrenatalAppointments();
    assert.ok(appointments.length > 0);
    assert.equal(appointments[0].title, action.data.title);
  });

  test('Detects and executes health diary symptom logging', () => {
    const action = detectToolIntent('Lưu triệu chứng đau thắt lưng mức độ vừa vào nhật ký hôm nay');
    assert.ok(action);
    assert.equal(action.tool, 'add_symptom');
    const result = executeToolAction(action);
    assert.equal(result.success, true);
  });

  test('Detects and executes daily health reminder tool', () => {
    const action = detectToolIntent('Nhắc mẹ uống sắt lúc 08:30 sáng mỗi ngày');
    assert.ok(action);
    assert.equal(action.tool, 'create_reminder');
    const result = executeToolAction(action);
    assert.equal(result.success, true);

    const reminders = storageService.loadHealthReminders();
    assert.ok(reminders.some((r) => r.time === '08:30'));
  });
});

describe('AI Memory Privacy Controls', () => {
  beforeEach(() => {
    (globalThis.localStorage as any).clear();
  });

  test('Adds custom user memory and formats for prompt injection', () => {
    aiMemoryService.clearAllAIMemories();
    const added = aiMemoryService.addAIMemory({
      key: 'tea_preference',
      category: 'preference',
      content: 'Mẹ không thích trà gừng ngọt, chỉ thích nước ấm vắt chanh lát nhẹ.',
    });

    assert.ok(added.id);
    const memories = aiMemoryService.loadAIMemories();
    assert.equal(memories.length, 1);
    assert.equal(memories[0].key, 'tea_preference');

    const promptText = aiMemoryService.getFormattedMemoriesForPrompt();
    assert.match(promptText, /nước ấm vắt chanh/);
  });

  test('Allows user to delete a specific memory item', () => {
    aiMemoryService.clearAllAIMemories();
    const item1 = aiMemoryService.addAIMemory({
      key: 'item1',
      category: 'health_note',
      content: 'Bé hay nấc cụt sau bữa trưa.',
    });
    const item2 = aiMemoryService.addAIMemory({
      key: 'item2',
      category: 'preference',
      content: 'Mẹ thích nghe nhạc giao hưởng Mozart.',
    });

    assert.equal(aiMemoryService.loadAIMemories().length, 2);

    aiMemoryService.deleteAIMemory(item1.id);
    const remaining = aiMemoryService.loadAIMemories();
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].key, 'item2');
  });

  test('Clears all memories completely on user request', () => {
    aiMemoryService.clearAllAIMemories();
    assert.equal(aiMemoryService.loadAIMemories().length, 0);
    assert.equal(aiMemoryService.getFormattedMemoriesForPrompt(), 'Chưa có ghi nhớ riêng nào.');
  });
});
