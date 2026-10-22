import { AIMemoryItem } from '../types';

const STORAGE_KEY_AI_MEMORY = 'nova_mom_ai_memory_v1';

const DEFAULT_MEMORIES: AIMemoryItem[] = [
  {
    id: 'mem-1',
    key: 'preferred_drinks',
    category: 'preference',
    content: 'Mẹ thích uống nước ấm pha chút gừng tươi vào buổi sáng để giảm cảm giác buồn nôn.',
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  },
  {
    id: 'mem-2',
    key: 'fetal_activity_time',
    category: 'health_note',
    content: 'Bé con thường máy nhiều nhất vào khung giờ 20h - 22h sau khi mẹ ăn tối xong.',
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  },
];

export const aiMemoryService = {
  loadAIMemories(): AIMemoryItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AI_MEMORY);
      if (!raw) {
        this.saveAIMemories(DEFAULT_MEMORIES);
        return DEFAULT_MEMORIES;
      }
      return JSON.parse(raw);
    } catch {
      return DEFAULT_MEMORIES;
    }
  },

  saveAIMemories(items: AIMemoryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_AI_MEMORY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save AI memories:', e);
    }
  },

  addAIMemory(item: Omit<AIMemoryItem, 'id' | 'createdAt' | 'lastUpdatedAt'>): AIMemoryItem {
    const current = this.loadAIMemories();
    const now = new Date().toISOString();
    const newMemory: AIMemoryItem = {
      ...item,
      id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: now,
      lastUpdatedAt: now,
    };
    const updated = [newMemory, ...current.filter((m) => m.key !== item.key)];
    this.saveAIMemories(updated);
    return newMemory;
  },

  updateAIMemory(id: string, content: string): AIMemoryItem[] {
    const current = this.loadAIMemories();
    const updated = current.map((m) =>
      m.id === id ? { ...m, content, lastUpdatedAt: new Date().toISOString() } : m
    );
    this.saveAIMemories(updated);
    return updated;
  },

  deleteAIMemory(id: string): AIMemoryItem[] {
    const current = this.loadAIMemories();
    const updated = current.filter((m) => m.id !== id);
    this.saveAIMemories(updated);
    return updated;
  },

  clearAllAIMemories(): void {
    this.saveAIMemories([]);
  },

  getFormattedMemoriesForPrompt(): string {
    const memories = this.loadAIMemories();
    if (memories.length === 0) return 'Chưa có ghi nhớ riêng nào.';
    return memories.map((m) => `- [${m.category}]: ${m.content}`).join('\n');
  },
};
