import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage, UserProfile } from '../../types';
import { askNovaAI } from '../../services/aiService';
import { storageService } from '../../services/storageService';
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
  AlertCircle,
  HelpCircle,
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
  const [isMuted, setIsMuted] = useState(false);
  const [voiceToast, setVoiceToast] = useState<string | null>(null);

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
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsNovaThinking(true);

    try {
      const historyPayload = messages.slice(-4).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const aiReply = await askNovaAI(
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
        text: aiReply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, novaReply]);
      setIsNovaThinking(false);
      speakText(aiReply);
    } catch (err) {
      console.error('Nova AI Error:', err);
      setIsNovaThinking(false);
      triggerToast('Đã chuyển sang chế độ phân tích lâm sàng tích hợp.');
    }
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
      // Fallback: prompt user to type or use sample query
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

  // Categorized suggestions for maternal care & counseling
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'symptoms' | 'nutrition' | 'psychology' | 'baby' | 'emergency'
  >('all');

  const CATEGORY_TIPS: Record<string, string[]> = {
    all: [
      `Mẹ mỏi lưng tuần ${pregnancyWeek} phải làm sao?`,
      `Thực đơn dinh dưỡng tuần ${pregnancyWeek} cho ${babyNickname}?`,
      `Cách đếm cử động thai máy chuẩn y khoa?`,
      `Tư thế ngủ nghiêng trái dễ chịu?`,
      `Mẹ thấy lo âu và căng thẳng trong thai kỳ`,
      `Uống sắt và canxi lúc nào chuẩn nhất?`,
    ],
    symptoms: [
      `Mẹ bị đau lưng và mỏi hông thì nằm thế nào?`,
      `Bị chuột rút ban đêm bắp chân xử lý sao?`,
      `Mẹ bị phù nề chân tuần ${pregnancyWeek} có sao không?`,
      `Bị ốm nghén, nôn nao dạ dày làm sao dịu?`,
      `Bị cảm cúm, sốt nhẹ có được uống thuốc không?`,
    ],
    nutrition: [
      `Thực đơn bổ sung sắt, canxi, DHA cho ${babyNickname}?`,
      `Những thực phẩm mẹ bầu nên kiêng kỵ?`,
      `Cách uống sắt và canxi không bị táo bón?`,
      `Bao nhiêu ml nước mỗi ngày là đủ ở tuần ${pregnancyWeek}?`,
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
      `Lịch siêu âm 4D và xét nghiệm cần làm tuần ${pregnancyWeek}`,
    ],
    emergency: [
      `Khi nào cơn đau bụng là dấu hiệu chuyển dạ thật?`,
      `Ra huyết âm đạo hoặc rỉ ối cần làm gì ngay?`,
      `Số điện thoại cấp cứu sản khoa 115`,
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
                className="text-xs text-[#8C7B75] hover:text-[#3A2E2B]"
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
              <span>Mô hình: Gemini 3.8 Flash</span>
              <span className="text-[#2ECC71] font-bold">● Đang hoạt động</span>
            </div>
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
                    ? 'bg-white text-[#3A2E2B] border border-[#F2ECE7] rounded-tl-sm'
                    : 'bg-[#C84B4B] text-white rounded-tr-sm'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                <div
                  className={`text-[9.5px] mt-2 flex items-center justify-between pt-1 border-t ${
                    isNova ? 'border-[#F8F5F2] text-[#A0938E]' : 'border-white/20 text-white/70'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {isNova && (
                    <button
                      onClick={() => speakText(msg.text)}
                      className="ml-2 hover:text-[#C84B4B] text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Nghe lại giọng đọc"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Nghe lại</span>
                    </button>
                  )}
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
            <span>Nova đang tổng hợp lời khuyên y khoa cho mẹ...</span>
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
