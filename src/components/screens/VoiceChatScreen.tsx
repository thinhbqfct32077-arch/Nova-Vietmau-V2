import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage, UserProfile, ChatToolAction, AIMemoryItem } from '../../types';
import { askNovaAI } from '../../services/aiService';
import { storageService } from '../../services/storageService';
import { executeToolAction } from '../../services/aiToolService';
import { aiMemoryService } from '../../services/aiMemoryService';
import {
  ChevronLeft,
  Info,
  Mic,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Keyboard,
  Crown,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  PhoneCall,
  Droplets,
  Calendar,
  Bell,
  FileText,
  Brain,
  Trash2,
  Plus,
  BookOpen,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';

interface VoiceChatScreenProps {
  onBack: () => void;
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  user?: UserProfile;
  isVip?: boolean;
  onOpenVipModal?: () => void;
}

export const VoiceChatScreen: React.FC<VoiceChatScreenProps> = ({
  onBack,
  isListening,
  setIsListening,
  user,
  isVip = false,
  onOpenVipModal,
}) => {
  // Load chat history from persistent storage
  const [messages, setMessages] = useState<ChatMessage[]>(() => storageService.loadChatMessages());
  const [inputText, setInputText] = useState('');
  const [isTypingMode, setIsTypingMode] = useState(false);
  const [isNovaThinking, setIsNovaThinking] = useState(false);
  const [isNovaSpeaking, setIsNovaSpeaking] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceToast, setVoiceToast] = useState<string | null>(null);

  // Memory modal state
  const [memories, setMemories] = useState<AIMemoryItem[]>(() => aiMemoryService.loadAIMemories());
  const [newMemoryKey, setNewMemoryKey] = useState('');
  const [newMemoryContent, setNewMemoryContent] = useState('');
  const [isAddingMemory, setIsAddingMemory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const motherName = user?.name || 'Khánh Băng';
  const pregnancyWeek = user?.pregnancyWeek || 24;
  const babyNickname = user?.babyNickname || 'Bé Bơ';

  const triggerToast = (msg: string) => {
    setVoiceToast(msg);
    setTimeout(() => setVoiceToast(null), 3500);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isNovaThinking, isNovaSpeaking]);

  // Auto-sync messages to persistent storage
  useEffect(() => {
    storageService.saveChatMessages(messages);
  }, [messages]);

  // Refresh memories list when modal opens
  useEffect(() => {
    if (showMemoryModal) {
      setMemories(aiMemoryService.loadAIMemories());
    }
  }, [showMemoryModal]);

  // Preload speech synthesis voices
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
      }
    };
    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsNovaSpeaking(false);
  };

  // Speech synthesis for AI Voice
  const speakText = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Clean markdown bullets / asterisks for smooth human-like audio
      const clean = text
        .replace(/[*#•-]/g, ' ')
        .replace(/\n+/g, '. ')
        .replace(/\s+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.pitch = 1.02;
      utterance.lang = 'vi-VN';

      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find((v) => v.lang.includes('vi') || v.lang.includes('VN'));
      if (viVoice) {
        utterance.voice = viVoice;
      }

      utterance.onstart = () => setIsNovaSpeaking(true);
      utterance.onend = () => setIsNovaSpeaking(false);
      utterance.onerror = () => setIsNovaSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsNovaSpeaking(false);
    }
  };

  // Stop speaking when unmounting or leaving
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Handle Send text message with real AI
  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsNovaThinking(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const aiResult = await askNovaAI(
        query,
        {
          name: motherName,
          pregnancyWeek,
          babyNickname,
        },
        historyPayload
      );

      const novaReply: ChatMessage = {
        id: `nova-${Date.now()}`,
        sender: 'nova',
        text: aiResult.text,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        sources: aiResult.sources,
        toolAction: aiResult.toolAction,
        isEmergencyAlert: aiResult.isEmergencyAlert,
        status: 'sent',
      };

      setMessages((prev) => [...prev, novaReply]);
      setIsNovaThinking(false);
      speakText(aiResult.text);
    } catch (err) {
      console.error('Nova AI Error:', err);
      setIsNovaThinking(false);

      const fallbackReply: ChatMessage = {
        id: `nova-err-${Date.now()}`,
        sender: 'nova',
        text: `Chào mẹ ${motherName}! Hiện đường truyền mạng đang bận, Nova xin tóm lược lưu ý quan trọng: Ở tuần thai ${pregnancyWeek}, mẹ hãy nghỉ ngơi thoải mái, uống đủ nước và theo dõi sát cử động thai nhé. Mẹ có thể bấm "Thử lại" bên dưới để kết nối lại.`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        status: 'error',
      };

      setMessages((prev) => [...prev, fallbackReply]);
      triggerToast('Đã chuyển sang chế độ hỗ trợ ngoại tuyến.');
    }
  };

  // Handle Retry for a failed query
  const handleRetry = (msgText: string) => {
    handleSend(msgText);
  };

  // Handle Tool Confirmation Execution
  const handleConfirmTool = (msgId: string, action: ChatToolAction) => {
    const res = executeToolAction(action);
    if (res.success) {
      triggerToast(res.message);
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === msgId && m.toolAction) {
            return {
              ...m,
              toolAction: {
                ...m.toolAction,
                status: 'executed',
              },
            };
          }
          return m;
        })
      );
    } else {
      triggerToast(`Thất bại: ${res.message}`);
    }
  };

  // Handle Cancel Tool Action
  const handleCancelTool = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId && m.toolAction) {
          return {
            ...m,
            toolAction: {
              ...m.toolAction,
              status: 'cancelled',
            },
          };
        }
        return m;
      })
    );
    triggerToast('Đã hủy thao tác.');
  };

  // Real Speech Recognition toggle
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    // Stop speech synthesis if talking
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsNovaSpeaking(false);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      triggerToast('Trình duyệt chưa hỗ trợ ghi âm tiếng Việt, mẹ có thể nhập bằng phím nhé!');
      setIsTypingMode(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
        triggerToast('Nova đang lắng nghe mẹ nói...');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript && transcript.trim()) {
          handleSend(transcript.trim());
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          triggerToast('Mẹ hãy cho phép quyền micro để trò chuyện cùng Nova nhé!');
        } else if (event.error === 'no-speech') {
          triggerToast('Chưa nghe rõ giọng mẹ, mẹ thử bấm mic nói lại nha!');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Cannot start recognition:', err);
      setIsListening(false);
      setIsTypingMode(true);
    }
  };

  const handleResetChat = () => {
    if (window.confirm('Mẹ có muốn làm mới cuộc trò chuyện với Nova không?')) {
      storageService.clearChatMessages();
      setMessages(storageService.loadChatMessages());
      triggerToast('Đã làm mới cuộc hội thoại với Nova!');
    }
  };

  // Memory management handlers
  const handleDeleteMemory = (id: string) => {
    const updated = aiMemoryService.deleteAIMemory(id);
    setMemories(updated);
    triggerToast('Đã xóa thông tin khỏi bộ nhớ Nova AI.');
  };

  const handleClearAllMemories = () => {
    if (window.confirm('Mẹ có chắc chắn muốn xóa toàn bộ bộ nhớ riêng tư của Nova AI không?')) {
      aiMemoryService.clearAllAIMemories();
      setMemories([]);
      triggerToast('Đã xóa sạch bộ nhớ của Nova AI.');
    }
  };

  const handleAddNewMemory = () => {
    if (!newMemoryContent.trim()) return;
    const key = newMemoryKey.trim() || `custom_${Date.now()}`;
    aiMemoryService.addAIMemory({
      key,
      category: 'custom',
      content: newMemoryContent.trim(),
    });
    setMemories(aiMemoryService.loadAIMemories());
    setNewMemoryKey('');
    setNewMemoryContent('');
    setIsAddingMemory(false);
    triggerToast('Đã lưu thông tin mới vào bộ nhớ Nova AI.');
  };

  // Categorized suggestions for maternal care & counseling
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'symptoms' | 'nutrition' | 'psychology' | 'baby' | 'emergency'
  >('all');

  const CATEGORY_TIPS: Record<string, string[]> = {
    all: [
      `Mẹ mỏi lưng tuần ${pregnancyWeek} phải làm sao?`,
      `Thực đơn dinh dưỡng tuần ${pregnancyWeek} cho ${babyNickname}?`,
      `Cách đếm cử động thai máy chuẩn y khoa?`,
      `Uống sắt và canxi lúc nào chuẩn nhất?`,
      `Ghi nhận 250ml nước vào sổ theo dõi`,
      `Nhắc lịch khám thai định kỳ tuần tới`,
    ],
    symptoms: [
      `Mẹ bị đau lưng và mỏi hông thì nằm thế nào?`,
      `Bị chuột rút ban đêm bắp chân xử lý sao?`,
      `Mẹ bị phù nề chân tuần ${pregnancyWeek} có sao không?`,
      `Bị ốm nghén, nôn nao dạ dày làm sao dịu?`,
      `Lưu triệu chứng buồn nôn vào nhật ký hôm nay`,
    ],
    nutrition: [
      `Thực đơn bổ sung sắt, canxi, DHA cho ${babyNickname}?`,
      `Những thực phẩm mẹ bầu nên kiêng kỵ?`,
      `Cách uống sắt và canxi không bị táo bón?`,
      `Ghi nhận 300ml nước vừa uống`,
      `Tăng cân thế nào là chuẩn bách phân vị?`,
    ],
    psychology: [
      `Mẹ thấy lo lắng, hay khóc và nhạy cảm quá`,
      `Làm sao để giải tỏa áp lực và ngủ sâu giấc hơn?`,
      `Lời khuyên tâm lý từ Nova cho bố mẹ bầu`,
      `Cách trò chuyện và thai giáo cùng ${babyNickname}`,
    ],
    baby: [
      `Bé ${babyNickname} tuần ${pregnancyWeek} phát triển ra sao?`,
      `Hướng dẫn đếm cử động thai máy trong 2 giờ`,
      `Bé đạp ít vào ban ngày có nguy hiểm không?`,
      `Tạo lịch khám thai siêu âm hình thái học`,
    ],
    emergency: [
      `Dấu hiệu ra huyết hoặc rỉ ối khẩn cấp`,
      `Khi nào cơn đau bụng là dấu hiệu nguy hiểm?`,
      `Dấu hiệu tiền sản giật: hoa mắt, nhức đầu, phù mặt`,
      `Bé không cử động suốt nửa ngày có sao không?`,
    ],
  };

  const categoriesList = [
    { id: 'all', label: 'Tất cả gợi ý' },
    { id: 'symptoms', label: '🩺 Triệu chứng' },
    { id: 'nutrition', label: '🥗 Dinh dưỡng' },
    { id: 'psychology', label: '💖 Tâm lý mẹ' },
    { id: 'baby', label: '👶 Bé yêu' },
    { id: 'emergency', label: '🚨 Khẩn cấp' },
  ];

  // 18 Waveform bars with dynamic heights when listening or speaking
  const isAudioActive = isListening || isNovaSpeaking;
  const waveformBars = [
    { min: 6, max: 26, dur: 0.8 },
    { min: 8, max: 34, dur: 0.58 },
    { min: 10, max: 42, dur: 0.85 },
    { min: 6, max: 22, dur: 0.7 },
    { min: 14, max: 48, dur: 0.5 },
    { min: 12, max: 38, dur: 0.72 },
    { min: 16, max: 50, dur: 0.52 },
    { min: 18, max: 52, dur: 0.44 },
    { min: 14, max: 44, dur: 0.65 },
    { min: 16, max: 48, dur: 0.48 },
    { min: 18, max: 50, dur: 0.46 },
    { min: 12, max: 38, dur: 0.68 },
    { min: 10, max: 40, dur: 0.82 },
    { min: 8, max: 28, dur: 0.6 },
    { min: 12, max: 42, dur: 0.54 },
    { min: 6, max: 24, dur: 0.76 },
    { min: 8, max: 32, dur: 0.64 },
    { min: 6, max: 20, dur: 0.88 },
  ];

  // Helper to render tool icon
  const renderToolIcon = (tool: string) => {
    switch (tool) {
      case 'log_water':
        return <Droplets className="w-4 h-4 text-sky-500" />;
      case 'create_appointment':
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'add_symptom':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'create_reminder':
        return <Bell className="w-4 h-4 text-rose-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#C84B4B]" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between h-full bg-[#FFFBF7] select-none overflow-hidden relative">
      {/* Toast */}
      {voiceToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#3A2E2B] text-white text-[11.5px] font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>{voiceToast}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="px-4 py-2.5 border-b border-[#F0ECE9] bg-white/80 backdrop-blur-md flex items-center justify-between z-30 shrink-0">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-[#F7F4F1] hover:bg-[#EFEAE5] text-[#3A2E2B] flex items-center justify-center cursor-pointer transition-colors"
          aria-label="Quay lại"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[15px] font-bold text-[#3A2E2B]">Trò chuyện cùng Nova</h1>
            <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />
          </div>

          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] font-semibold text-[#C84B4B] bg-[#FCEEEB] px-2 py-0.2 rounded-full">
              Trợ lý Thai kỳ AI · Tuần {pregnancyWeek}
            </span>
            {isVip && (
              <span className="text-[9px] font-black bg-[#D4AF37] text-[#2A2321] px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5 fill-current" />
                VIP
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Memory Controls Button */}
          <button
            onClick={() => setShowMemoryModal(true)}
            className="w-8 h-8 rounded-full bg-[#F7F4F1] hover:bg-[#EFEAE5] text-[#8C7B75] hover:text-[#C84B4B] flex items-center justify-center cursor-pointer transition-colors relative"
            title="Bộ nhớ riêng tư của Nova AI"
          >
            <Brain className="w-4 h-4" />
            {memories.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#C84B4B] text-[8px] font-bold text-white flex items-center justify-center">
                {memories.length}
              </span>
            )}
          </button>

          <button
            onClick={handleResetChat}
            className="w-8 h-8 rounded-full bg-[#F7F4F1] hover:bg-[#EFEAE5] text-[#8C7B75] hover:text-[#C84B4B] flex items-center justify-center cursor-pointer transition-colors"
            title="Làm mới cuộc trò chuyện"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowInfoModal(!showInfoModal)}
            className="w-8 h-8 rounded-full bg-[#F7F4F1] hover:bg-[#EFEAE5] text-[#8C7B75] hover:text-[#3A2E2B] flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Thông tin trợ lý"
          >
            <Info className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </header>

      {/* Info Modal Drawer */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 left-4 right-4 z-40 bg-white/95 backdrop-blur-xl p-4.5 rounded-2xl border border-[#EDE7E2] shadow-xl text-[#3A2E2B]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#C84B4B] uppercase tracking-wider">
                Về Trợ lý Nova AI
              </span>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-xs text-[#8C7B75] hover:text-[#3A2E2B] cursor-pointer"
              >
                ✕ Đóng
              </button>
            </div>
            <p className="text-xs text-[#63534D] leading-relaxed">
              Nova AI là trợ lý AI đồng hành thông minh cùng mẹ bầu trong ứng dụng Nova Việt Mẫu, cung cấp thông tin thai kỳ dễ hiểu, hỗ trợ theo dõi sức khỏe, giải đáp thắc mắc và giúp mẹ chuẩn bị tốt cho các buổi khám thai dựa trên hướng dẫn y tế của Bộ Y tế và WHO.
            </p>
            <div className="mt-2.5 p-2 bg-[#FCEEEB] rounded-xl text-[11px] text-[#C84B4B] font-medium leading-relaxed">
              <strong>Lưu ý an toàn:</strong> Nova AI không phải bác sĩ, không chẩn đoán bệnh và không thay thế thăm khám chuyên khoa sản. Khi có dấu hiệu khẩn cấp, vui lòng liên hệ ngay 115 hoặc cơ sở y tế gần nhất.
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#F0ECE9] flex items-center justify-between text-[11px] text-[#8C7B75]">
              <span>Mô hình: Gemini 3.8 Flash (Server proxy)</span>
              <span className="text-[#2ECC71] font-bold">● Đang hoạt động</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Memory Management Modal */}
      <AnimatePresence>
        {showMemoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-[#EDE7E2]"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-[#F0ECE9] flex items-center justify-between bg-[#FAF6F3]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FCEEEB] flex items-center justify-center text-[#C84B4B]">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#3A2E2B]">Bộ nhớ riêng tư của Nova AI</h3>
                    <p className="text-[10px] text-[#8C7B75]">
                      Lưu trên máy mẹ · Mẹ có toàn quyền xem & xóa
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMemoryModal(false)}
                  className="w-7 h-7 rounded-full bg-white hover:bg-[#F2ECE7] flex items-center justify-center text-[#8C7B75] text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Explanatory note */}
              <div className="px-4 py-2.5 bg-[#FFF9F6] border-b border-[#F7EBE4] text-[11px] text-[#8C6D62] leading-relaxed">
                Nova AI ghi nhớ các chi tiết này để giải đáp phù hợp hơn với mẹ. Dữ liệu hoàn toàn bảo mật và không gửi cho bên thứ ba.
              </div>

              {/* Memories List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar">
                {memories.length === 0 ? (
                  <div className="text-center py-8 text-[#A0938E] text-xs">
                    Bộ nhớ hiện đang trống. Mẹ có thể thêm ghi nhớ mới hoặc trò chuyện để Nova tự lưu thói quen của mẹ.
                  </div>
                ) : (
                  memories.map((mem) => (
                    <div
                      key={mem.id}
                      className="p-3 bg-[#FAF8F5] border border-[#EFE9E4] rounded-2xl flex items-start justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#C84B4B] bg-[#FCEEEB] px-1.5 py-0.2 rounded-md">
                            {mem.category === 'preference'
                              ? 'Sở thích'
                              : mem.category === 'health_note'
                              ? 'Sức khỏe'
                              : 'Ghi chú'}
                          </span>
                          <span className="text-[9.5px] text-[#A0938E]">
                            {new Date(mem.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-xs text-[#3A2E2B] leading-relaxed">{mem.content}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteMemory(mem.id)}
                        className="p-1.5 rounded-lg text-[#A0938E] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                        title="Xóa ghi nhớ này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}

                {/* Add new memory inline form */}
                {isAddingMemory ? (
                  <div className="p-3 bg-[#FFFBF7] border border-[#F2D7CE] rounded-2xl space-y-2 mt-2">
                    <input
                      type="text"
                      placeholder="Chủ đề (ví dụ: món ăn yêu thích, thói quen ngủ...)"
                      value={newMemoryKey}
                      onChange={(e) => setNewMemoryKey(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#EAE3DC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C84B4B]"
                    />
                    <textarea
                      placeholder="Nội dung mẹ muốn Nova AI ghi nhớ..."
                      rows={2}
                      value={newMemoryContent}
                      onChange={(e) => setNewMemoryContent(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#EAE3DC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C84B4B]"
                    />
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setIsAddingMemory(false)}
                        className="text-xs text-[#8C7B75] px-2.5 py-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleAddNewMemory}
                        disabled={!newMemoryContent.trim()}
                        className="text-xs bg-[#C84B4B] disabled:opacity-40 text-white font-semibold px-3 py-1 rounded-lg hover:bg-[#B53E3E] cursor-pointer"
                      >
                        Lưu vào bộ nhớ
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingMemory(true)}
                    className="w-full py-2 border border-dashed border-[#D9CFC9] rounded-2xl text-xs font-semibold text-[#8C7B75] hover:text-[#C84B4B] hover:border-[#C84B4B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm ghi nhớ cho Nova</span>
                  </button>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3 bg-[#FAF6F3] border-t border-[#F0ECE9] flex items-center justify-between">
                {memories.length > 0 ? (
                  <button
                    onClick={handleClearAllMemories}
                    className="text-[11px] text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Xóa toàn bộ bộ nhớ</span>
                  </button>
                ) : (
                  <div />
                )}
                <button
                  onClick={() => setShowMemoryModal(false)}
                  className="px-4 py-1.5 bg-[#3A2E2B] text-white text-xs font-semibold rounded-xl hover:bg-black cursor-pointer"
                >
                  Xong
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 no-scrollbar">
        {messages.map((msg) => {
          const isNova = msg.sender === 'nova';

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`flex items-start gap-2.5 ${
                isNova ? 'justify-start' : 'justify-end'
              }`}
            >
              {isNova && (
                <div className="w-8 h-8 rounded-full bg-[#C84B4B] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 mt-0.5">
                  N
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-2xs ${
                  isNova
                    ? msg.isEmergencyAlert
                      ? 'bg-white text-[#3A2E2B] border-2 border-red-500 rounded-tl-sm'
                      : 'bg-white text-[#3A2E2B] border border-[#F2ECE7] rounded-tl-sm'
                    : 'bg-[#C84B4B] text-white rounded-tr-sm'
                }`}
              >
                {/* Emergency Red Flag Alert Banner */}
                {isNova && msg.isEmergencyAlert && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-400 rounded-xl text-red-900 shadow-xs">
                    <div className="flex items-center gap-2 font-bold text-red-700 text-xs mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>CẢNH BÁO Y TẾ KHẨN CẤP</span>
                    </div>
                    <p className="text-[11.5px] text-red-800 leading-relaxed font-medium mb-2">
                      Triệu chứng này có thể là dấu hiệu chuyển dạ sớm, dọa sảy thai hoặc biến chứng sản khoa. Mẹ cần đến ngay cơ sở y tế chuyên khoa sản gần nhất!
                    </p>
                    <a
                      href="tel:115"
                      className="inline-flex items-center justify-center gap-2 w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>GỌI CẤP CỨU 115 NGAY LẬP TỨC</span>
                    </a>
                  </div>
                )}

                {/* Message Text Content */}
                <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

                {/* Tool Action Confirmation Card */}
                {isNova && msg.toolAction && (
                  <div className="mt-3 p-3 bg-[#FFFBF7] border border-[#F0D0C6] rounded-xl text-[#3A2E2B] shadow-2xs">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-lg bg-white border border-[#EAE3DC] flex items-center justify-center shadow-2xs">
                        {renderToolIcon(msg.toolAction.tool)}
                      </div>
                      <span className="text-xs font-bold text-[#C84B4B]">
                        {msg.toolAction.title}
                      </span>
                    </div>

                    <p className="text-[11.5px] text-[#6B5A54] leading-relaxed mb-2.5">
                      {msg.toolAction.description}
                    </p>

                    {msg.toolAction.status === 'pending_confirmation' && (
                      <div className="flex items-center gap-2 pt-1 border-t border-[#F2ECE7]">
                        <button
                          onClick={() => handleConfirmTool(msg.id, msg.toolAction!)}
                          className="flex-1 py-1.5 bg-[#C84B4B] hover:bg-[#B53E3E] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Xác nhận thực hiện</span>
                        </button>
                        <button
                          onClick={() => handleCancelTool(msg.id)}
                          className="px-3 py-1.5 bg-[#F2ECE7] hover:bg-[#E8E0DA] text-[#6B5A54] text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Bỏ qua</span>
                        </button>
                      </div>
                    )}

                    {msg.toolAction.status === 'executed' && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 pt-1 border-t border-[#F2ECE7]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã thực hiện và lưu vào hệ thống</span>
                      </div>
                    )}

                    {msg.toolAction.status === 'cancelled' && (
                      <div className="text-[11px] text-[#8C7B75] pt-1 border-t border-[#F2ECE7]">
                        Thao tác đã hủy bỏ.
                      </div>
                    )}
                  </div>
                )}

                {/* Medical Evidence Sources References */}
                {isNova && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#F2ECE7]">
                    <div className="flex items-center gap-1 text-[10.5px] font-semibold text-[#8C7B75] mb-1">
                      <BookOpen className="w-3 h-3 text-[#C84B4B]" />
                      <span>Nguồn tài liệu y khoa ({msg.sources.length}):</span>
                    </div>
                    <div className="space-y-1">
                      {msg.sources.map((src) => (
                        <div
                          key={src.id}
                          className="text-[10px] text-[#6B5A54] bg-[#FAF8F5] px-2 py-1 rounded-md border border-[#EDE7E2] leading-tight flex items-baseline justify-between gap-1"
                        >
                          <span className="font-medium truncate">
                            <span className="text-[#C84B4B] font-bold">[{src.source}]</span> {src.title}
                          </span>
                          <span className="text-[9px] text-[#A0938E] shrink-0">({src.lastUpdated})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer timestamp and actions */}
                <div
                  className={`text-[9.5px] mt-2 flex items-center justify-between pt-1 border-t ${
                    isNova ? 'border-[#F8F5F2] text-[#A0938E]' : 'border-white/20 text-white/70'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  <div className="flex items-center gap-2">
                    {msg.status === 'error' && (
                      <button
                        onClick={() => handleRetry(msg.text)}
                        className="text-red-500 hover:text-red-600 font-semibold flex items-center gap-1 cursor-pointer"
                        title="Thử lại"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Thử lại</span>
                      </button>
                    )}

                    {isNova && (
                      <button
                        onClick={() => speakText(msg.text)}
                        className="hover:text-[#C84B4B] text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Nghe lại giọng đọc"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Nghe lại</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {!isNova && (
                <div className="w-8 h-8 rounded-full bg-[#3A2E2B] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 mt-0.5">
                  {motherName.charAt(0) || 'M'}
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Thinking Indicator */}
        {isNovaThinking && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs text-[#8C7B75] pl-10"
          >
            <div className="w-6 h-6 rounded-full bg-[#FCEEEB] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[#C84B4B] animate-spin" />
            </div>
            <span>Nova đang tra cứu hướng dẫn Bộ Y tế & tổng hợp lời khuyên cho mẹ...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Speaking Active Indicator Banner */}
      {isNovaSpeaking && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="mx-4 mb-1.5 px-3 py-1.5 bg-[#FAF1ED] border border-[#F2D7CE] rounded-xl flex items-center justify-between shadow-2xs shrink-0"
        >
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#C84B4B] animate-pulse" />
            <span className="text-xs font-medium text-[#7D3425]">
              Nova đang đọc câu trả lời y tế cho mẹ...
            </span>
          </div>
          <button
            onClick={stopSpeaking}
            className="text-[11px] font-bold text-[#C84B4B] bg-white px-2 py-0.5 rounded-lg border border-[#F0D0C6] hover:bg-[#FDF6F4] cursor-pointer"
          >
            Dừng đọc
          </button>
        </motion.div>
      )}

      {/* Category Tabs for Quick Suggestions */}
      <div className="px-4 pt-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {categoriesList.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer transition-all ${
                isActive
                  ? 'bg-[#C84B4B] text-white shadow-xs'
                  : 'bg-white/80 text-[#8C7B75] border border-[#ECE5DF] hover:bg-[#FBF8F5]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Suggested Quick Questions */}
      <div className="px-4 py-1.5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        {(CATEGORY_TIPS[selectedCategory] || CATEGORY_TIPS.all).map((tip, i) => (
          <button
            key={i}
            onClick={() => handleSend(tip)}
            className="text-[11px] font-medium text-[#6B5A54] bg-white border border-[#EDE7E2] px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-[#FAF6F3] cursor-pointer transition-colors shadow-2xs active:scale-95"
          >
            {tip}
          </button>
        ))}
      </div>

      {/* Bottom Voice / Keyboard Control Area */}
      <div className="bg-white/95 backdrop-blur-xl border-t border-[#F0ECE9] px-6 pt-3 pb-5 flex flex-col items-center justify-center relative shrink-0 shadow-lg">
        {/* Toggle between Voice Mode & Typing Mode */}
        <div className="w-full flex items-center justify-between mb-2 px-2">
          <button
            onClick={() => setIsTypingMode(!isTypingMode)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#8C7B75] hover:text-[#3A2E2B] cursor-pointer"
          >
            <Keyboard className="w-4 h-4 text-[#C84B4B]" />
            <span>{isTypingMode ? 'Chuyển sang Giọng nói' : 'Gõ câu hỏi'}</span>
          </button>

          <button
            onClick={() => {
              if (!isMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              setIsMuted(!isMuted);
            }}
            className="text-[#8C7B75] hover:text-[#3A2E2B] cursor-pointer flex items-center gap-1 text-xs"
            title={isMuted ? 'Bật giọng đọc' : 'Tắt giọng đọc'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-gray-400" />
                <span className="text-[11px]">Tắt tiếng</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#C84B4B]" />
                <span className="text-[11px]">Giọng đọc bật</span>
              </>
            )}
          </button>
        </div>

        {isTypingMode ? (
          /* Text Input Mode */
          <div className="w-full flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Hỏi Nova về tuần thai ${pregnancyWeek}...`}
              className="flex-1 px-4 py-3 bg-[#FAF7F4] border border-[#EBE4DE] rounded-2xl text-[13px] text-[#3A2E2B] focus:outline-none focus:ring-2 focus:ring-[#C84B4B]/30"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              className="w-11 h-11 rounded-2xl bg-[#C84B4B] disabled:opacity-40 text-white flex items-center justify-center shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        ) : (
          /* Voice Mode with Dynamic Soundwave Waveform & Acoustic Aura */
          <div className="flex flex-col items-center w-full">
            <div className="h-12 flex items-center justify-center gap-1.5 w-full max-w-[280px] mb-1.5 px-2">
              {waveformBars.map((bar, i) => (
                <motion.div
                  key={i}
                  animate={
                    isAudioActive
                      ? {
                          height: [bar.min, bar.max, bar.min],
                        }
                      : { height: 6 }
                  }
                  transition={{
                    duration: bar.dur,
                    repeat: isAudioActive ? Infinity : 0,
                    ease: 'easeInOut',
                    delay: (i % 4) * 0.08,
                  }}
                  className={`w-1 rounded-full transition-colors ${
                    isAudioActive
                      ? i % 3 === 0
                        ? 'bg-gradient-to-t from-[#C84B4B] to-[#F59E0B]'
                        : i % 3 === 1
                        ? 'bg-gradient-to-t from-[#EC4899] to-[#C84B4B]'
                        : 'bg-gradient-to-t from-[#C84B4B] to-[#E55353]'
                      : 'bg-[#D9CFC9]'
                  }`}
                  style={{ minHeight: '6px' }}
                />
              ))}
            </div>

            <motion.p
              animate={{ opacity: isAudioActive ? [0.7, 1, 0.7] : 0.85 }}
              transition={{ duration: 1.6, repeat: isAudioActive ? Infinity : 0 }}
              className="text-[12.5px] font-semibold text-[#8C7B75] tracking-wide mb-2.5 flex items-center gap-1.5"
            >
              {isListening ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#C84B4B] animate-ping" />
                  <span>Nova đang lắng nghe mẹ nói...</span>
                </>
              ) : isNovaSpeaking ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#F59E0B] animate-spin" />
                  <span>Nova đang trò chuyện...</span>
                </>
              ) : (
                <span>Chạm mic để trò chuyện với Nova</span>
              )}
            </motion.p>

            <div className="relative flex items-center justify-center">
              {isAudioActive && (
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.14, 1] }}
                  transition={{
                    rotate: { duration: 6, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className="absolute w-24 h-24 rounded-full pointer-events-none blur-xl opacity-70"
                  style={{
                    background:
                      'conic-gradient(from 0deg, #C84B4B, #F59E0B, #EC4899, #8B5CF6, #C84B4B)',
                  }}
                />
              )}

              {isListening && (
                <>
                  <motion.div
                    animate={{ scale: [1, 2.3], opacity: [0.55, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                    className="absolute w-20 h-20 rounded-full border-2 border-[#C84B4B] pointer-events-none"
                  />
                  <motion.div
                    animate={{ scale: [1, 2.3], opacity: [0.4, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeOut',
                      delay: 0.65,
                    }}
                    className="absolute w-20 h-20 rounded-full border-2 border-[#F59E0B] pointer-events-none"
                  />
                </>
              )}

              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.88, rotate: -3 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                onClick={toggleListening}
                className="w-18 h-18 rounded-full bg-gradient-to-tr from-[#B53E3E] via-[#C84B4B] to-[#E0564A] text-white flex items-center justify-center shadow-xl shadow-[#C84B4B]/40 relative z-10 cursor-pointer border border-white/25"
                aria-label="Kích hoạt trợ lý giọng nói Nova"
              >
                <Mic className={`w-8 h-8 ${isAudioActive ? 'animate-pulse' : ''}`} />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
