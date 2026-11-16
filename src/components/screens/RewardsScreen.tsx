import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Lock,
  Sparkles,
  Heart,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RewardBadge, UserProfile } from '../../types';
import { REWARD_BADGE_DEFINITIONS } from '../../data/ecosystemData';
import { apiService } from '../../services/apiService';

interface RewardsScreenProps {
  user: UserProfile;
  onUpdateUser: (partial: Partial<UserProfile>) => void;
  onBack: () => void;
}

export const RewardsScreen: React.FC<RewardsScreenProps> = ({
  user,
  onUpdateUser,
  onBack,
}) => {
  const rewardsEnabled = user.rewardsEnabled !== false;
  const [badges, setBadges] = useState<RewardBadge[]>(() =>
    REWARD_BADGE_DEFINITIONS.map((d) => ({ ...d, unlocked: false }))
  );
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!rewardsEnabled) return;
    apiService
      .fetchRewards(user)
      .then(setBadges)
      .catch(() => {});
  }, [user.id, rewardsEnabled]);

  const handleToggleOptOut = async () => {
    const next = !rewardsEnabled;
    onUpdateUser({ rewardsEnabled: next });
    try {
      await apiService.updatePrivacySettings({ rewardsEnabled: next }, user);
    } catch {}
    setToast(next ? 'Đã bật huy hiệu động viên nhẹ nhàng.' : 'Đã tạm tắt tính năng huy hiệu.');
    setTimeout(() => setToast(null), 2500);
  };

  const handleCelebrate = () => {
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#B55841', '#C4A46B', '#6D8572', '#F6EFE2'],
      });
    } catch {}
  };

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="flex-1 flex flex-col bg-[#FAF6F0] dark:bg-[#161311] text-[#322622] dark:text-[#F4EDE6] overflow-y-auto no-scrollbar pb-16">
      {toast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#322622] dark:bg-[#F4EDE6] text-white dark:text-[#161311] text-xs font-bold px-4 py-2 rounded-full shadow-xl">
          {toast}
        </div>
      )}

      <header className="px-4 sm:px-6 pt-3 pb-3 flex items-center justify-between border-b border-[#E6DDD1] dark:border-[#362E2A] bg-[#FAF6F0]/95 dark:bg-[#161311]/95 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-center text-[#6B5D56] dark:text-[#C5B9B0] cursor-pointer shrink-0 hover:bg-[#F2ECE3] dark:hover:bg-[#231E1B]"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div className="min-w-0">
            <h1 className="font-editorial text-[17px] font-bold text-[#322622] dark:text-[#F4EDE6] leading-tight flex items-center gap-1.5 truncate">
              <Award className="w-4.5 h-4.5 text-[#C4A46B] shrink-0" />
              <span>Huy hiệu nhẹ nhàng</span>
            </h1>
            <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] truncate">Ghi nhận từng bước chăm sóc mẹ bầu đầy yêu thương</p>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 pt-4 space-y-4 max-w-4xl mx-auto w-full">
        {/* Opt-out / Control Card */}
        <section className="p-4 sm:p-5 bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-editorial text-[16px] font-bold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-[#B55841] dark:text-[#D47A63]" />
              <span>Không áp lực thành tích</span>
            </h2>
            <p className="text-xs text-[#6B5D56] dark:text-[#C5B9B0] mt-0.5 leading-relaxed">
              Huy hiệu chỉ là lời động viên dịu dàng — mẹ có thể tắt hoàn toàn bất cứ lúc nào mà không ảnh hưởng dữ liệu thai kỳ.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleOptOut}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer shrink-0 ${
              rewardsEnabled
                ? 'bg-[#F7EAE5] dark:bg-[#35231E] text-[#B55841] dark:text-[#D47A63] border border-[#EBCDC2] dark:border-[#52352D]'
                : 'bg-[#322622] dark:bg-[#F4EDE6] text-white dark:text-[#161311]'
            }`}
          >
            {rewardsEnabled ? 'Tạm tắt huy hiệu' : 'Bật lại huy hiệu'}
          </button>
        </section>

        {!rewardsEnabled ? (
          <div className="p-8 bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] text-center space-y-2">
            <p className="font-editorial text-base font-bold text-[#322622] dark:text-[#F4EDE6]">
              Tính năng huy hiệu đang được tạm ẩn theo lựa chọn của mẹ
            </p>
            <p className="text-xs text-[#786962] dark:text-[#B5A89F]">
              Mẹ vẫn có thể sử dụng đầy đủ nhật ký, lịch khám, checklist và mọi tiện ích thai kỳ bình thường.
            </p>
          </div>
        ) : (
          <>
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#F6EFE2] to-[#F7EAE5] dark:from-[#2F281C] dark:to-[#35231E] border border-[#E5D4B3] dark:border-[#4A3F2B] flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[#786962] dark:text-[#B5A89F]">Dấu ấn đã ghi nhận</p>
                <p className="text-xl font-extrabold text-[#322622] dark:text-[#F4EDE6] mt-0.5 tabular-nums">
                  {unlockedCount} / {badges.length} huy hiệu
                </p>
              </div>
              {unlockedCount > 0 && (
                <button
                  onClick={handleCelebrate}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#9E5B3B] hover:bg-[#8A4E32] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gửi lời chúc nhẹ</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-3xl border transition-colors ${
                    badge.unlocked
                      ? 'bg-white dark:bg-[#1E1A17] border-[#E5D4B3] dark:border-[#4A3F2B] shadow-xs'
                      : 'bg-[#FAF6F0]/80 dark:bg-[#1B1715] border-[#E6DDD1] dark:border-[#362E2A] opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        badge.unlocked
                          ? 'bg-[#F6EFE2] dark:bg-[#2F281C] text-[#9E5B3B] dark:text-[#D7BA86] border border-[#E5D4B3] dark:border-[#4A3F2B]'
                          : 'bg-[#F2ECE3] dark:bg-[#231E1B] text-[#786962] dark:text-[#B5A89F]'
                      }`}
                    >
                      {badge.unlocked ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#786962] dark:text-[#B5A89F]">
                        {badge.unlocked ? 'Đã mở khóa' : 'Chưa mở khóa'}
                      </span>
                      <h3 className="font-editorial text-[15px] font-bold text-[#322622] dark:text-[#F4EDE6] mt-0.5">
                        {badge.title}
                      </h3>
                      <p className="text-xs text-[#6B5D56] dark:text-[#C5B9B0] mt-1 leading-relaxed">{badge.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
