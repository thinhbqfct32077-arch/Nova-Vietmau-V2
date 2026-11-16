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
        colors: ['#51483F', '#A3A795', '#B8AA98', '#EDE7DE'],
      });
    } catch {}
  };

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="flex-1 flex flex-col bg-nova-bg text-nova-text overflow-y-auto no-scrollbar pb-16">
      {toast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-nova-text text-nova-bg text-xs font-bold px-4 py-2 rounded-full shadow-xl">
          {toast}
        </div>
      )}

      <header className="px-4 sm:px-6 pt-3 pb-3 flex items-center justify-between border-b border-nova-border bg-nova-bg/95 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-nova-surface border border-nova-border flex items-center justify-center text-nova-text-muted cursor-pointer shrink-0 hover:bg-nova-bg-subtle"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div className="min-w-0">
            <h1 className="font-editorial text-[17px] font-bold text-nova-text leading-tight flex items-center gap-1.5 truncate">
              <Award className="w-4.5 h-4.5 text-nova-warning shrink-0" />
              <span>Huy hiệu nhẹ nhàng</span>
            </h1>
            <p className="text-[11px] text-nova-text-muted truncate">Ghi nhận từng bước chăm sóc mẹ bầu đầy yêu thương</p>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 pt-4 space-y-4 max-w-4xl mx-auto w-full">
        {/* Opt-out / Control Card */}
        <section className="p-4 sm:p-5 bg-nova-surface rounded-3xl border border-nova-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-editorial text-[16px] font-bold text-nova-text flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-nova-accent" />
              <span>Không áp lực thành tích</span>
            </h2>
            <p className="text-xs text-nova-text-muted mt-0.5 leading-relaxed">
              Huy hiệu chỉ là lời động viên dịu dàng — mẹ có thể tắt hoàn toàn bất cứ lúc nào mà không ảnh hưởng dữ liệu thai kỳ.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleOptOut}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer shrink-0 transition-colors ${
              rewardsEnabled
                ? 'bg-nova-accent-soft text-nova-accent border border-nova-border'
                : 'bg-nova-text text-nova-bg'
            }`}
          >
            {rewardsEnabled ? 'Tạm tắt huy hiệu' : 'Bật lại huy hiệu'}
          </button>
        </section>

        {!rewardsEnabled ? (
          <div className="p-8 bg-nova-surface rounded-3xl border border-nova-border text-center space-y-2">
            <p className="font-editorial text-base font-bold text-nova-text">
              Tính năng huy hiệu đang được tạm ẩn theo lựa chọn của mẹ
            </p>
            <p className="text-xs text-nova-text-muted">
              Mẹ vẫn có thể sử dụng đầy đủ nhật ký, lịch khám, sổ chuẩn bị và mọi tiện ích thai kỳ bình thường.
            </p>
          </div>
        ) : (
          <>
            <div className="p-4 sm:p-5 rounded-3xl bg-nova-accent-soft border border-nova-border flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-nova-text-muted">Dấu ấn đã ghi nhận</p>
                <p className="text-xl font-extrabold text-nova-text mt-0.5 tabular-nums">
                  {unlockedCount} / {badges.length} huy hiệu
                </p>
              </div>
              {unlockedCount > 0 && (
                <button
                  onClick={handleCelebrate}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap transition-colors"
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
                      ? 'bg-nova-surface border-nova-warning-border shadow-xs'
                      : 'bg-nova-bg-subtle border-nova-border opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        badge.unlocked
                          ? 'bg-nova-warning-soft text-nova-warning border border-nova-warning-border'
                          : 'bg-nova-surface text-nova-text-muted border border-nova-border'
                      }`}
                    >
                      {badge.unlocked ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-nova-text-muted">
                        {badge.unlocked ? 'Đã mở khóa' : 'Chưa mở khóa'}
                      </span>
                      <h3 className="font-editorial text-[15px] font-bold text-nova-text mt-0.5">
                        {badge.title}
                      </h3>
                      <p className="text-xs text-nova-text-muted mt-1 leading-relaxed">{badge.description}</p>
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
