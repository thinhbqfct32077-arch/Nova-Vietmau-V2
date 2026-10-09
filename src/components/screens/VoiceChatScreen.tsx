import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INITIAL_CHAT_MESSAGES } from '../../data/mockData';
import { ChatMessage } from '../../types';
import { askNovaAI } from '../../services/aiService';
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
  Bot,
  User,
} from 'lucide-react';

interface VoiceChatScreenProps {
  onBack: () => void;
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  isVip?: boolean;
  onOpenVipModal?: () => void;
}

export const VoiceChatScreen: React.FC<VoiceChatScreenProps> = ({
  onBack,
  isListening,
  setIsListening,
  isVip = false,
  onOpenVipModal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTypingMode, setIsTypingMode] = useState(false);
  const [isNovaThinking, setIsNovaThinking] = useState(false);
  const [isNovaSpeaking, setIsNovaSpeaking] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isNovaThinking, isNovaSpeaking]);

  // Speech synthesis for AI Voice
  const speakText = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Remove bullets / markdown symbols for cleaner speech
      const clean = text.replace(/[*#•-]/g, ' ').replace(/\n+/g, '. ');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

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

  // Stop speaking when leaving
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle Send text message with real AI
  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsNovaThinking(true);

    try {
      const aiReply = await askNovaAI(query);
      const novaReply: ChatMessage = {
        id: `nova-${Date.now()}`,
        sender: 'nova',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, novaReply]);
      setIsNovaThinking(false);
      speakText(aiReply);
    } catch (err) {
      console.error(err);
      setIsNovaThinking(false);
    }
  };

  // Toggle voice recognition simulation
  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsNovaSpeaking(false);

      setTimeout(() => {
        setIsListening(false);
        handleSend('Tuần 12 em bé phát triển ra sao và mẹ nên chú ý điều gì nhất hả Nova?');
      }, 3000);
    } else {
      setIsListening(false);
    }
  };

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
      {/* Top Header (Hình 4) */}
      <header className="px-4 py-2.5 border-b border-[#F0ECE9] bg-white/80 backdrop-blur-md flex items-center justify-between z-30 shrink-0">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-[#F7F4F1] hover:bg-[#EFEAE5] text-[#3A2E2B] flex items-center justify-center cursor-pointer transition-colors"
          aria-label="Quay lại"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Center Title & Tag */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[15px] font-bold text-[#3A2E2B]">
              Trò chuyện với Nova
            </h1>
            <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />
          </div>

          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] font-semibold text-[#C84B4B] bg-[#FCEEEB] px-2 py-0.2 rounded-full">
              Trợ lý Nova AI
            </span>
            {isVip && (
              <span className="text-[9px] font-black bg-[#D4AF37] text-[#2A2321] px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5 fill-current" />
                VIP
              </span>
            )}
          </div>
        </div>

        {/* Right Info & VIP CTA Button */}
        <div className="flex items-center gap-1">
          {!isVip && onOpenVipModal && (
            <button
              onClick={onOpenVipModal}
              className="text-[10px] font-bold text-[#B38728] bg-[#FDF5E6] px-2 py-1 rounded-lg border border-[#D4AF37]/30 flex items-center gap-1"
            >
              <Crown className="w-3 h-3 fill-current" />
              <span>VIP</span>
            </button>
          )}

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
              Nova là trợ lý thai sản thông minh được đào tạo dựa trên phác đồ chăm sóc sản phụ khoa của Bộ Y tế và WHO. Mọi câu trả lời mang tính chất tham vấn y khoa và động viên tinh thần mẹ bầu.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages Body (Hình 4) */}
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
              {/* Nova Avatar Circle */}
              {isNova && (
                <div className="w-8 h-8 rounded-full bg-[#C84B4B] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 mt-0.5">
                  N
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-2xs ${
                  isNova
                    ? 'bg-white text-[#3A2E2B] border border-[#F2ECE7] rounded-tl-sm'
                    : 'bg-[#C84B4B] text-white rounded-tr-sm'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                <div
                  className={`text-[9px] mt-1.5 flex items-center justify-between ${
                    isNova ? 'text-[#A0938E]' : 'text-white/70'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {isNova && (
                    <button
                      onClick={() => speakText(msg.text)}
                      className="ml-2 hover:text-[#C84B4B] text-[10px] flex items-center gap-0.5"
                      title="Nghe giọng đọc"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Nghe</span>
                    </button>
                  )}
                </div>
              </div>

              {/* User Avatar Circle */}
              {!isNova && (
                <div className="w-8 h-8 rounded-full bg-[#3A2E2B] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 mt-0.5">
                  M
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
            <span>Nova đang suy nghĩ câu trả lời y khoa...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="px-4 py-1.5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        {[
          'Mẹ mỏi lưng quá phải làm sao?',
          'Tuần 12 nên ăn gì để vào con?',
          'Đo độ mờ da gáy khi nào?',
          'Hết nghén tuần 12 có sao không?',
        ].map((tip, i) => (
          <button
            key={i}
            onClick={() => handleSend(tip)}
            className="text-[11px] font-medium text-[#6B5A54] bg-white border border-[#EDE7E2] px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-[#FAF6F3] cursor-pointer transition-colors shadow-2xs"
          >
            {tip}
          </button>
        ))}
      </div>

      {/* Bottom Voice / Keyboard Control Area (Hình 4) */}
      <div className="bg-white/95 backdrop-blur-xl border-t border-[#F0ECE9] px-6 pt-3.5 pb-6 flex flex-col items-center justify-center relative shrink-0 shadow-lg">
        {/* Toggle between Voice Mode & Typing Mode */}
        <div className="w-full flex items-center justify-between mb-2.5 px-2">
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
              placeholder="Nhập câu hỏi của mẹ cho Nova..."
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
          /* Voice Mode with Dynamic Soundwave Waveform & Acoustic Aura (Hình 4) */
          <div className="flex flex-col items-center w-full">
            {/* Dynamic Soundwave Waveform with iOS Gradient Visualizer */}
            <div className="h-14 flex items-center justify-center gap-1.5 w-full max-w-[280px] mb-2 px-2">
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

            {/* Listening / Speaking Status Text with iOS Breathing Glow */}
            <motion.p
              animate={{ opacity: isAudioActive ? [0.7, 1, 0.7] : 0.85 }}
              transition={{ duration: 1.6, repeat: isAudioActive ? Infinity : 0 }}
              className="text-[13px] font-semibold text-[#8C7B75] tracking-wide mb-3 flex items-center gap-1.5"
            >
              {isListening ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#C84B4B] animate-ping" />
                  <span>Đang lắng nghe mẹ nói...</span>
                </>
              ) : isNovaSpeaking ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#F59E0B] animate-spin" />
                  <span>Nova đang trò chuyện...</span>
                </>
              ) : (
                <span>Chạm để nói chuyện với Nova</span>
              )}
            </motion.p>

            {/* Super Big Red Mic Button with iOS 27 Apple Intelligence Fluid Glowing Orb */}
            <div className="relative flex items-center justify-center">
              {/* Apple Intelligence Chromatic Swirling Halo */}
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

              {/* Acoustic Aura Waves */}
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
                  <motion.div
                    animate={{ scale: [1, 2.3], opacity: [0.35, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeOut',
                      delay: 1.3,
                    }}
                    className="absolute w-20 h-20 rounded-full border-2 border-[#EC4899] pointer-events-none"
                  />
                </>
              )}

              {/* Main Red Microphone Button with Tactile 3D Glass Press */}
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
