import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, Camera, Sparkles, Image as ImageIcon } from 'lucide-react';
import { AVATAR_PRESETS } from '../data/mockData';
import confetti from 'canvas-confetti';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSelectAvatar: (newAvatarUrl: string) => void;
}

export const AvatarModal: React.FC<AvatarModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onSelectAvatar,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if modal opens
  React.useEffect(() => {
    setSelectedAvatar(currentAvatar);
    setPreviewError(false);
  }, [currentAvatar, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Vui lòng chọn ảnh dung lượng dưới 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedAvatar(reader.result);
          setPreviewError(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSelectAvatar(selectedAvatar);
    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#C84B4B', '#FCEEEB', '#F39C12'],
      });
    } catch {
      // ignore
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm select-none">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-[420px] bg-[#FFFBF7] rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh] border border-[#EFEAE5]"
        >
          {/* iOS Grabber */}
          <div className="w-12 h-1 bg-[#D1C7BD] rounded-full mx-auto mt-3 mb-1" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#F0ECE6]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FCEEEB] flex items-center justify-center text-[#C84B4B]">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-[#3A2E2B] leading-tight">Đổi ảnh đại diện</h3>
                <p className="text-[11px] text-[#8C7B75]">Chọn ảnh mẫu hoặc tải ảnh từ điện thoại</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#EFEAE5] hover:bg-[#E5DFD7] flex items-center justify-center text-[#5E4E49] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-5 overflow-y-auto no-scrollbar space-y-5">
            {/* Live Preview Circle */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl ring-2 ring-[#C84B4B]/30 bg-[#F5EFEB]">
                  <img
                    src={selectedAvatar}
                    alt="Preview avatar"
                    className="w-full h-full object-cover"
                    onError={() => setPreviewError(true)}
                  />
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#C84B4B] text-white flex items-center justify-center shadow-md hover:bg-[#B84040] transition-colors cursor-pointer ring-2 ring-white"
                  title="Tải ảnh mới"
                >
                  <Camera className="w-4.5 h-4.5" />
                </button>
              </div>
              <span className="text-[12px] font-semibold text-[#8C7B75] mt-2">Xem trước ảnh đại diện</span>
            </div>

            {/* Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 bg-white border border-[#E8DFD5] hover:border-[#C84B4B]/50 hover:bg-[#FFF7F5] rounded-2xl flex items-center justify-center gap-2 text-[#3A2E2B] text-[13px] font-bold transition-all shadow-xs cursor-pointer group"
            >
              <Upload className="w-4 h-4 text-[#C84B4B] group-hover:scale-110 transition-transform" />
              <span>Tải ảnh từ thư viện thiết bị</span>
            </button>

            {/* Presets List */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[13px] font-bold text-[#3A2E2B] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C84B4B]" />
                  Bộ sưu tập Avatar Mẹ & Bé
                </span>
                <span className="text-[11px] text-[#8C7B75]">{AVATAR_PRESETS.length} mẫu</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = selectedAvatar === preset.url;
                  return (
                    <motion.div
                      key={preset.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedAvatar(preset.url);
                        setPreviewError(false);
                      }}
                      className={`relative flex flex-col items-center p-2 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#C84B4B] bg-[#FFF2EE] shadow-sm ring-1 ring-[#C84B4B]'
                          : 'border-[#EAE3DC] bg-white hover:border-[#D1C7BD]'
                      }`}
                    >
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border border-white shadow-xs mb-1.5">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#C84B4B]/30 flex items-center justify-center backdrop-blur-[1px]">
                            <div className="w-5 h-5 rounded-full bg-[#C84B4B] text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-[#3A2E2B] text-center truncate w-full">
                        {preset.name}
                      </span>
                      <span className="text-[9.5px] text-[#8C7B75] text-center font-medium">
                        {preset.tag}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-white border-t border-[#F0ECE6] flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-[#E2DAD0] text-[#5E4E49] text-[14px] font-bold hover:bg-[#F8F5F2] transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="flex-2 py-3 rounded-2xl bg-[#C84B4B] text-white text-[14px] font-bold hover:bg-[#B84040] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Lưu ảnh đại diện</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
