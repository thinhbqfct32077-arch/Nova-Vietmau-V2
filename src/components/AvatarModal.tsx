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
        colors: ['#51483F', '#A3A795', '#B8AA98', '#EDE7DE'],
      });
    } catch {
      // ignore
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#1C1B18]/60 backdrop-blur-sm select-none">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-[420px] bg-nova-bg rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh] border border-nova-border"
        >
          {/* Grabber */}
          <div className="w-12 h-1 bg-nova-taupe/40 rounded-full mx-auto mt-3 mb-1" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-nova-border">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-nova-accent-soft border border-nova-border flex items-center justify-center text-nova-accent">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-editorial text-[18px] font-bold text-nova-text leading-tight">
                  Đổi ảnh đại diện
                </h3>
                <p className="text-[11px] text-nova-text-muted">
                  Chọn ảnh mẫu hoặc tải ảnh từ điện thoại
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="w-9 h-9 rounded-full bg-nova-bg-subtle hover:bg-nova-accent-soft flex items-center justify-center text-nova-text-muted transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-5 overflow-y-auto no-scrollbar space-y-5">
            {/* Live Preview Circle */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-nova-surface shadow-lg ring-2 ring-nova-taupe/40 bg-nova-bg-subtle">
                  <NovaImage
                    src={selectedAvatar}
                    alt="Xem trước ảnh đại diện"
                    className="w-full h-full object-cover"
                    onError={() => setPreviewError(true)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-nova-accent text-nova-accent-contrast flex items-center justify-center shadow-md hover:bg-nova-accent-hover transition-colors cursor-pointer ring-2 ring-nova-surface"
                  title="Tải ảnh mới"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[12px] font-semibold text-nova-text-muted mt-2">
                {previewError ? 'Không thể xem trước ảnh này' : 'Xem trước ảnh đại diện'}
              </span>
            </div>

            {uploadError && (
              <div className="px-3.5 py-2.5 rounded-2xl bg-nova-danger-soft border border-nova-danger-border text-[12px] font-medium text-nova-danger">
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
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full min-h-[44px] py-2.5 px-4 bg-nova-surface border border-nova-border hover:border-nova-taupe hover:bg-nova-bg-subtle rounded-2xl flex items-center justify-center gap-2 text-nova-text text-[13px] font-bold transition-all shadow-xs cursor-pointer group"
            >
              <Upload className="w-4 h-4 text-nova-accent group-hover:scale-110 transition-transform" />
              <span>Tải ảnh từ thư viện thiết bị</span>
            </button>

            {/* Presets List */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[13px] font-bold text-nova-text flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-nova-taupe" />
                  Bộ sưu tập ảnh đại diện Mẹ & Bé
                </span>
                <span className="text-[11px] text-nova-text-muted tabular-nums">
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
                          ? 'border-nova-accent bg-nova-accent-soft shadow-xs ring-1 ring-nova-accent'
                          : 'border-nova-border bg-nova-surface hover:border-nova-taupe'
                      }`}
                    >
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border border-nova-border shadow-xs mb-1.5">
                        <NovaImage
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#1C1B18]/35 flex items-center justify-center backdrop-blur-[1px]">
                            <div className="w-5 h-5 rounded-full bg-nova-accent text-nova-accent-contrast flex items-center justify-center shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-nova-text text-center truncate w-full">
                        {preset.name}
                      </span>
                      <span className="text-[9.5px] text-nova-text-muted text-center font-medium">
                        {preset.tag}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-nova-surface border-t border-nova-border flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[44px] py-2.5 rounded-2xl border border-nova-border text-nova-text-muted text-[14px] font-bold hover:bg-nova-bg-subtle transition-colors cursor-pointer whitespace-nowrap"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-2 min-h-[44px] py-2.5 rounded-2xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-[14px] font-bold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98 whitespace-nowrap"
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
