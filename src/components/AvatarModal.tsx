import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, Camera, Sparkles } from 'lucide-react';
import { AVATAR_PRESETS } from '../data/mockData';
import confetti from 'canvas-confetti';
import { NovaImage } from './NovaBrandMark';

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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if modal opens
  React.useEffect(() => {
    setSelectedAvatar(currentAvatar);
    setPreviewError(false);
    setUploadError(null);
  }, [currentAvatar, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Vui lòng chọn ảnh dung lượng dưới 5MB để tải lên nhanh và ổn định.');
        return;
      }
      setUploadError(null);
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
        colors: ['#B55841', '#C4A46B', '#6D8572', '#F2ECE3'],
      });
    } catch {
      // ignore
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#161311]/60 backdrop-blur-sm select-none">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-[420px] bg-[#FAF6F0] dark:bg-[#1E1A17] rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh] border border-[#E6DDD1] dark:border-[#362E2A]"
        >
          {/* Grabber */}
          <div className="w-12 h-1 bg-[#D6CCC0] dark:bg-[#4A403B] rounded-full mx-auto mt-3 mb-1" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#E6DDD1] dark:border-[#362E2A]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#F7EAE5] dark:bg-[#35231E] border border-[#EBCDC2] dark:border-[#52352D] flex items-center justify-center text-[#B55841] dark:text-[#D47A63]">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-editorial text-[18px] font-bold text-[#322622] dark:text-[#F4EDE6] leading-tight">
                  Đổi ảnh đại diện
                </h3>
                <p className="text-[11px] text-[#786962] dark:text-[#B5A89F]">
                  Chọn ảnh mẫu hoặc tải ảnh từ điện thoại
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Đóng"
              className="w-9 h-9 rounded-full bg-[#F2ECE3] dark:bg-[#231E1B] hover:bg-[#E6DDD1] dark:hover:bg-[#2F2824] flex items-center justify-center text-[#6B5D56] dark:text-[#C5B9B0] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-5 overflow-y-auto no-scrollbar space-y-5">
            {/* Live Preview Circle */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-[#231E1B] shadow-lg ring-2 ring-[#B55841]/30 bg-[#F2ECE3] dark:bg-[#231E1B]">
                  <NovaImage
                    src={selectedAvatar}
                    alt="Preview avatar"
                    className="w-full h-full object-cover"
                    onError={() => setPreviewError(true)}
                  />
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#B55841] text-white flex items-center justify-center shadow-md hover:bg-[#9E4A35] transition-colors cursor-pointer ring-2 ring-white dark:ring-[#1E1A17]"
                  title="Tải ảnh mới"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[12px] font-semibold text-[#786962] dark:text-[#B5A89F] mt-2">
                {previewError ? 'Không thể xem trước ảnh này' : 'Xem trước ảnh đại diện'}
              </span>
            </div>

            {uploadError && (
              <div className="px-3.5 py-2.5 rounded-2xl bg-[#F7EAE5] dark:bg-[#35231E] border border-[#EBCDC2] dark:border-[#52352D] text-[12px] font-medium text-[#B55841] dark:text-[#D47A63]">
                {uploadError}
              </div>
            )}

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
              className="w-full min-h-[44px] py-2.5 px-4 bg-white dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] hover:border-[#B55841]/50 hover:bg-[#F7EAE5]/40 dark:hover:bg-[#35231E]/40 rounded-2xl flex items-center justify-center gap-2 text-[#322622] dark:text-[#F4EDE6] text-[13px] font-bold transition-all shadow-xs cursor-pointer group"
            >
              <Upload className="w-4 h-4 text-[#B55841] dark:text-[#D47A63] group-hover:scale-110 transition-transform" />
              <span>Tải ảnh từ thư viện thiết bị</span>
            </button>

            {/* Presets List */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[13px] font-bold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C4A46B]" />
                  Bộ sưu tập Avatar Mẹ & Bé
                </span>
                <span className="text-[11px] text-[#786962] dark:text-[#B5A89F] tabular-nums">
                  {AVATAR_PRESETS.length} mẫu
                </span>
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
                        setUploadError(null);
                      }}
                      className={`relative flex flex-col items-center p-2 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#B55841] bg-[#F7EAE5] dark:bg-[#35231E] shadow-xs ring-1 ring-[#B55841]'
                          : 'border-[#E6DDD1] dark:border-[#362E2A] bg-white dark:bg-[#231E1B] hover:border-[#C4A46B]'
                      }`}
                    >
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border border-white dark:border-[#362E2A] shadow-xs mb-1.5">
                        <NovaImage
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#B55841]/30 flex items-center justify-center backdrop-blur-[1px]">
                            <div className="w-5 h-5 rounded-full bg-[#B55841] text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-[#322622] dark:text-[#F4EDE6] text-center truncate w-full">
                        {preset.name}
                      </span>
                      <span className="text-[9.5px] text-[#786962] dark:text-[#B5A89F] text-center font-medium">
                        {preset.tag}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-white dark:bg-[#231E1B] border-t border-[#E6DDD1] dark:border-[#362E2A] flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 min-h-[44px] py-2.5 rounded-2xl border border-[#E6DDD1] dark:border-[#362E2A] text-[#6B5D56] dark:text-[#C5B9B0] text-[14px] font-bold hover:bg-[#F2ECE3] dark:hover:bg-[#2F2824] transition-colors cursor-pointer whitespace-nowrap"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="flex-2 min-h-[44px] py-2.5 rounded-2xl bg-[#B55841] text-white text-[14px] font-bold hover:bg-[#9E4A35] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98 whitespace-nowrap"
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

