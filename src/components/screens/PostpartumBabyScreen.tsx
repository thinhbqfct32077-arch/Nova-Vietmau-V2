import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Baby,
  Heart,
  CheckCircle2,
  Circle,
  BookOpen,
  Camera,
  Plus,
  BellPlus,
  Sparkles,
  Upload,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import {
  BabyCareLog,
  BabyProfile,
  MoodType,
  PostpartumState,
  UserProfile,
} from '../../types';
import {
  BABY_MILESTONES_BY_MONTH,
  ECOSYSTEM_BANNERS,
  POSTPARTUM_BABY_CHECKLIST_ITEMS,
  POSTPARTUM_KNOWLEDGE_GUIDES,
  POSTPARTUM_MOM_CHECKLIST_ITEMS,
} from '../../data/ecosystemData';
import { apiService } from '../../services/apiService';
import { storageService, getTodayDateString } from '../../services/storageService';
import { NovaImage } from '../NovaBrandMark';

interface PostpartumBabyScreenProps {
  user: UserProfile;
  onUpdateUser: (partial: Partial<UserProfile>) => void;
  onBack: () => void;
}

const LOG_TYPES: { id: BabyCareLog['type']; label: string }[] = [
  { id: 'feeding', label: 'Cữ bú' },
  { id: 'diaper', label: 'Thay tã' },
  { id: 'sleep', label: 'Giấc ngủ bé' },
  { id: 'bath', label: 'Tắm bé' },
  { id: 'tummy_time', label: 'Tập nằm sấp cho bé' },
  { id: 'note', label: 'Ghi chú khác' },
];

export const PostpartumBabyScreen: React.FC<PostpartumBabyScreenProps> = ({
  user,
  onUpdateUser,
  onBack,
}) => {
  const [state, setState] = useState<PostpartumState>(() =>
    storageService.getOfflineCache<PostpartumState>(user.id, 'postpartum', {
      userId: user.id,
      isPostpartumMode: user.pregnancyStatus === 'postpartum',
      postpartumDiary: [],
      careLogs: [],
      completedMomChecklistIds: [],
      completedBabyChecklistIds: [],
      achievedBabyMilestoneIds: [],
      albumPhotos: [],
    })
  );
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'milestones' | 'album'>('overview');
  const [toast, setToast] = useState<string | null>(null);

  // Baby Profile form
  const [babyName, setBabyName] = useState(state.babyProfile?.name || user.babyNickname || 'Bé Bơ');
  const [birthDate, setBirthDate] = useState(state.babyProfile?.birthDate || getTodayDateString());
  const [babyGender, setBabyGender] = useState<BabyProfile['gender']>(state.babyProfile?.gender || 'unspecified');
  const [birthWeightKg, setBirthWeightKg] = useState<string>(
    state.babyProfile?.birthWeightKg ? String(state.babyProfile.birthWeightKg) : '3.2'
  );
  const [birthLengthCm, setBirthLengthCm] = useState<string>(
    state.babyProfile?.birthLengthCm ? String(state.babyProfile.birthLengthCm) : '50'
  );

  // Care Log form
  const [logType, setLogType] = useState<BabyCareLog['type']>('feeding');
  const [logTitle, setLogTitle] = useState('');
  const [logDetails, setLogDetails] = useState('');
  const [createReminder, setCreateReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('14:00');

  // Mom Recovery Diary form
  const [momMood, setMomMood] = useState<MoodType>('calm');
  const [momSleepHours, setMomSleepHours] = useState('6.5');
  const [momRecoveryNote, setMomRecoveryNote] = useState('');

  // Album upload form
  const [albumMonth, setAlbumMonth] = useState(0);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumCaption, setAlbumCaption] = useState('');
  const [albumImageUrl, setAlbumImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    apiService
      .fetchPostpartumState(user)
      .then((serverState) => {
        setState(serverState);
        storageService.setOfflineCache(user.id, 'postpartum', serverState);
        if (serverState.babyProfile) {
          setBabyName(serverState.babyProfile.name);
          setBirthDate(serverState.babyProfile.birthDate);
          setBabyGender(serverState.babyProfile.gender);
          if (serverState.babyProfile.birthWeightKg) setBirthWeightKg(String(serverState.babyProfile.birthWeightKg));
          if (serverState.babyProfile.birthLengthCm) setBirthLengthCm(String(serverState.babyProfile.birthLengthCm));
        }
      })
      .catch(() => {});
  }, [user.id]);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const syncState = async (partial: Partial<PostpartumState>) => {
    const optimistic = { ...state, ...partial };
    setState(optimistic);
    storageService.setOfflineCache(user.id, 'postpartum', optimistic);
    try {
      const updated = await apiService.updatePostpartumState(partial, user);
      setState(updated);
      storageService.setOfflineCache(user.id, 'postpartum', updated);
      return updated;
    } catch {
      return optimistic;
    }
  };

  const handleToggleMode = async (postpartumOn: boolean) => {
    await syncState({
      isPostpartumMode: postpartumOn,
      transitionedAt: postpartumOn ? new Date().toISOString() : state.transitionedAt,
    });
    onUpdateUser({ pregnancyStatus: postpartumOn ? 'postpartum' : 'pregnant' });
    notify(
      postpartumOn
        ? 'Đã bật chế độ Sau sinh và chăm sóc bé (dữ liệu thai kỳ vẫn được giữ nguyên).'
        : 'Đã chuyển về chế độ Theo dõi thai kỳ.'
    );
  };

  const handleSaveBabyProfile = async () => {
    const profile: BabyProfile = {
      id: state.babyProfile?.id || `baby-${Date.now()}`,
      name: babyName.trim() || 'Bé yêu',
      birthDate,
      gender: babyGender,
      birthWeightKg: Number(birthWeightKg) || undefined,
      birthLengthCm: Number(birthLengthCm) || undefined,
    };
    await syncState({ babyProfile: profile });
    notify('Đã lưu hồ sơ của bé!');
  };

  const toggleMomCheck = async (id: string) => {
    const curr = state.completedMomChecklistIds;
    const next = curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id];
    await syncState({ completedMomChecklistIds: next });
  };

  const toggleBabyCheck = async (id: string) => {
    const curr = state.completedBabyChecklistIds;
    const next = curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id];
    await syncState({ completedBabyChecklistIds: next });
  };

  const toggleMilestone = async (id: string) => {
    const curr = state.achievedBabyMilestoneIds;
    const next = curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id];
    await syncState({ achievedBabyMilestoneIds: next });
  };

  const handleAddCareLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const label = LOG_TYPES.find((t) => t.id === logType)?.label || 'Chăm bé';
    const payload = {
      type: logType,
      title: logTitle.trim() || label,
      details: logDetails.trim() || 'Đã ghi nhận chăm sóc cho bé',
      loggedAt: new Date().toISOString(),
      reminderTime: createReminder ? reminderTime : undefined,
    };
    try {
      const next = await apiService.addBabyCareLog(payload, user);
      setState(next);
      storageService.setOfflineCache(user.id, 'postpartum', next);
    } catch {
      const localNext = {
        ...state,
        careLogs: [{ ...payload, id: `bcl-${Date.now()}` }, ...state.careLogs],
      };
      setState(localNext);
      storageService.setOfflineCache(user.id, 'postpartum', localNext);
    }

    if (createReminder) {
      storageService.addHealthReminder(
        {
          title: `Nhắc chăm bé: ${payload.title}`,
          category: 'custom',
          time: reminderTime,
          frequency: 'daily',
          isEnabled: true,
          notes: payload.details,
        },
        user.id
      );
      apiService.syncReminders(storageService.loadHealthReminders(user.id), user).catch(() => {});
    }

    setLogTitle('');
    setLogDetails('');
    notify(createReminder ? 'Đã lưu nhật ký bé và tạo nhắc nhở!' : 'Đã lưu nhật ký chăm bé!');
  };

  const handleAddMomDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!momRecoveryNote.trim()) return;
    const payload = {
      date: getTodayDateString(),
      mood: momMood,
      recoveryNote: momRecoveryNote.trim(),
      sleepHours: Number(momSleepHours) || undefined,
    };
    try {
      const next = await apiService.addPostpartumDiary(payload, user);
      setState(next);
      storageService.setOfflineCache(user.id, 'postpartum', next);
      setMomRecoveryNote('');
      notify('Đã lưu nhật ký hồi phục của mẹ!');
    } catch {}
  };

  const handleUploadAlbumImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await apiService.uploadImageFile(file, user);
      setAlbumImageUrl(res.url);
    } catch {
      notify('Không tải được ảnh lên máy chủ.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddAlbumPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumImageUrl) {
      notify('Vui lòng chọn tải ảnh của bé lên trước.');
      return;
    }
    try {
      const next = await apiService.addBabyAlbumPhoto(
        {
          monthAge: albumMonth,
          title: albumTitle.trim() || `Tháng thứ ${albumMonth} của bé`,
          caption: albumCaption.trim(),
          imageUrl: albumImageUrl,
          takenDate: getTodayDateString(),
        },
        user
      );
      setState(next);
      storageService.setOfflineCache(user.id, 'postpartum', next);
      setAlbumTitle('');
      setAlbumCaption('');
      setAlbumImageUrl('');
      notify('Đã lưu ảnh vào Album tháng đầu đời!');
    } catch {}
  };

  return (
    <div className="flex-1 flex flex-col bg-nova-bg text-nova-text overflow-y-auto no-scrollbar pb-16">
      {toast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-nova-text text-nova-bg text-xs font-bold px-4 py-2 rounded-full shadow-xl">
          {toast}
        </div>
      )}

      {/* Header */}
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
              <Baby className="w-4.5 h-4.5 text-nova-accent shrink-0" />
              <span>Sau sinh và chăm sóc bé</span>
            </h1>
            <p className="text-[11px] text-nova-text-muted truncate">Chuyển giai đoạn nhẹ nhàng, lưu trọn ký ức thai kỳ</p>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 pt-4 space-y-4 max-w-5xl mx-auto w-full">
        {/* Hero Banner & Stage Switcher */}
        <div className="relative rounded-3xl overflow-hidden border border-nova-border bg-nova-surface shadow-xs">
          <div className="h-36 sm:h-44 w-full overflow-hidden relative">
            <NovaImage
              src={ECOSYSTEM_BANNERS.babyBanner}
              alt="Mẹ và bé sau sinh"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1B18]/75 via-[#1C1B18]/25 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 text-[#FAF9F6]">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#1C1B18]/45 backdrop-blur-xs px-2.5 py-0.5 rounded-md">
                {state.isPostpartumMode ? 'Đang ở chế độ Sau sinh và em bé' : 'Chế độ chuẩn bị đón bé'}
              </span>
              <h2 className="font-editorial text-base sm:text-lg font-bold mt-1">
                Đồng hành cùng mẹ hồi phục và theo dõi từng tháng đầu đời của bé
              </h2>
            </div>
          </div>

          <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-nova-text-muted">
              Việc bật chế độ Sau sinh hoàn toàn không xóa nhật ký, siêu âm hay kỷ niệm thai kỳ cũ.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleToggleMode(false)}
                className={`min-h-[38px] px-3 py-2 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap transition-colors ${
                  !state.isPostpartumMode
                    ? 'bg-nova-text text-nova-bg'
                    : 'bg-nova-bg-subtle text-nova-text-muted'
                }`}
              >
                Thai kỳ
              </button>
              <button
                type="button"
                onClick={() => handleToggleMode(true)}
                className={`min-h-[38px] px-3 py-2 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap transition-colors ${
                  state.isPostpartumMode
                    ? 'bg-nova-accent text-nova-accent-contrast'
                    : 'bg-nova-accent-soft text-nova-accent'
                }`}
              >
                Sau sinh và em bé
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Sub-tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview' as const, label: 'Hồ sơ và sổ chuẩn bị' },
            { id: 'logs' as const, label: 'Nhật ký mẹ và chăm bé' },
            { id: 'milestones' as const, label: 'Mốc 0–12 tháng và cẩm nang' },
            { id: 'album' as const, label: `Album bé (${state.albumPhotos.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer shrink-0 border tabular-nums transition-colors ${
                activeTab === tab.id
                  ? 'bg-nova-accent text-nova-accent-contrast border-nova-accent'
                  : 'bg-nova-surface text-nova-text-muted border-nova-border hover:bg-nova-bg-subtle'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Baby Profile Form */}
            <section className="p-4 sm:p-5 bg-nova-surface rounded-3xl border border-nova-border space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-editorial text-[16px] font-bold text-nova-text flex items-center gap-2">
                  <Baby className="w-4 h-4 text-nova-accent" />
                  <span>Hồ sơ của bé yêu</span>
                </h3>
                <button
                  onClick={handleSaveBabyProfile}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-xs font-bold cursor-pointer whitespace-nowrap transition-colors"
                >
                  Lưu hồ sơ bé
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-nova-text-muted block mb-1">Tên / Biệt danh bé</label>
                  <input
                    type="text"
                    value={babyName}
                    onChange={(e) => setBabyName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text focus:outline-none focus:border-nova-accent"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-nova-text-muted block mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text tabular-nums focus:outline-none focus:border-nova-accent"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-nova-text-muted block mb-1">Giới tính</label>
                  <select
                    value={babyGender}
                    onChange={(e) => setBabyGender(e.target.value as BabyProfile['gender'])}
                    className="w-full px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text focus:outline-none focus:border-nova-accent"
                  >
                    <option value="unspecified">Chưa chọn</option>
                    <option value="boy">Bé trai</option>
                    <option value="girl">Bé gái</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-nova-text-muted block mb-1">Cân nặng lúc sinh (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={birthWeightKg}
                    onChange={(e) => setBirthWeightKg(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text tabular-nums focus:outline-none focus:border-nova-accent"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-nova-text-muted block mb-1">Chiều dài lúc sinh (cm)</label>
                  <input
                    type="number"
                    value={birthLengthCm}
                    onChange={(e) => setBirthLengthCm(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text tabular-nums focus:outline-none focus:border-nova-accent"
                  />
                </div>
              </div>
            </section>

            {/* Mom & Baby Checklists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="p-4 sm:p-5 bg-nova-surface rounded-3xl border border-nova-border space-y-2.5">
                <h3 className="font-editorial text-[16px] font-bold text-nova-text flex items-center gap-2">
                  <Heart className="w-4 h-4 text-nova-accent" />
                  <span>Sổ chuẩn bị hồi phục của mẹ</span>
                </h3>
                {POSTPARTUM_MOM_CHECKLIST_ITEMS.map((item) => {
                  const done = state.completedMomChecklistIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleMomCheck(item.id)}
                      className="w-full p-2.5 rounded-xl bg-nova-bg border border-nova-border text-left text-xs flex items-start gap-2.5 cursor-pointer"
                    >
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-nova-sage-text shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-nova-icon shrink-0 mt-0.5" />
                      )}
                      <span className={done ? 'line-through text-nova-text-muted' : 'text-nova-text'}>
                        {item.title}
                      </span>
                    </button>
                  );
                })}
              </section>

              <section className="p-4 sm:p-5 bg-nova-surface rounded-3xl border border-nova-border space-y-2.5">
                <h3 className="font-editorial text-[16px] font-bold text-nova-text flex items-center gap-2">
                  <Baby className="w-4 h-4 text-nova-sage-text" />
                  <span>Sổ chuẩn bị chăm sóc bé sơ sinh</span>
                </h3>
                {POSTPARTUM_BABY_CHECKLIST_ITEMS.map((item) => {
                  const done = state.completedBabyChecklistIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleBabyCheck(item.id)}
                      className="w-full p-2.5 rounded-xl bg-nova-bg border border-nova-border text-left text-xs flex items-start gap-2.5 cursor-pointer"
                    >
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-nova-sage-text shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-nova-icon shrink-0 mt-0.5" />
                      )}
                      <span className={done ? 'line-through text-nova-text-muted' : 'text-nova-text'}>
                        {item.title}
                      </span>
                    </button>
                  );
                })}
              </section>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Baby Care Log */}
            <section className="p-4 sm:p-5 bg-nova-surface rounded-3xl border border-nova-border space-y-3 shadow-xs">
              <h3 className="font-editorial text-[15px] font-bold text-nova-text flex items-center gap-2">
                <Clock className="w-4 h-4 text-nova-sage-text" />
                <span>Ghi nhận cữ bú, tã và giấc ngủ bé</span>
              </h3>
              <form onSubmit={handleAddCareLog} className="space-y-2.5">
                <div className="flex flex-wrap gap-1.5">
                  {LOG_TYPES.map((lt) => (
                    <button
                      key={lt.id}
                      type="button"
                      onClick={() => setLogType(lt.id)}
                      className={`min-h-[36px] px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer whitespace-nowrap transition-colors ${
                        logType === lt.id
                          ? 'bg-nova-accent text-nova-accent-contrast'
                          : 'bg-nova-bg-subtle text-nova-text-muted border border-nova-border'
                      }`}
                    >
                      {lt.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={logTitle}
                  onChange={(e) => setLogTitle(e.target.value)}
                  placeholder="Tiêu đề ngắn (Ví dụ: Bú mẹ 15 phút / Ngủ trưa 90 phút)"
                  className="w-full px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text placeholder:text-nova-text-muted focus:outline-none focus:border-nova-accent"
                />
                <input
                  type="text"
                  value={logDetails}
                  onChange={(e) => setLogDetails(e.target.value)}
                  placeholder="Chi tiết lượng sữa / tã / ghi chú thêm..."
                  className="w-full px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text placeholder:text-nova-text-muted focus:outline-none focus:border-nova-accent"
                />
                <div className="flex items-center justify-between gap-2 text-xs py-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createReminder}
                      onChange={(e) => setCreateReminder(e.target.checked)}
                      className="w-4 h-4 accent-nova-accent"
                    />
                    <span className="font-semibold text-nova-text-muted flex items-center gap-1">
                      <BellPlus className="w-3.5 h-3.5 text-nova-accent" /> Tạo nhắc cữ tiếp theo
                    </span>
                  </label>
                  {createReminder && (
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text tabular-nums"
                    />
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full min-h-[44px] py-2.5 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-xs font-bold cursor-pointer inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Ghi nhận hoạt động của bé
                </button>
              </form>

              <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar pt-2">
                {state.careLogs.length === 0 ? (
                  <p className="text-xs text-nova-text-muted italic">Chưa có ghi nhận chăm sóc bé nào.</p>
                ) : (
                  state.careLogs.map((l) => (
                    <div
                      key={l.id}
                      className="p-3 rounded-2xl bg-nova-bg border border-nova-border"
                    >
                      <div className="flex items-center justify-between text-xs font-bold gap-2">
                        <span className="text-nova-text">{l.title}</span>
                        <span className="text-[10.5px] text-nova-text-muted tabular-nums shrink-0">
                          {new Date(l.loggedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-nova-text-muted mt-0.5">{l.details}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Mom Recovery Diary */}
            <section className="p-4 sm:p-5 bg-nova-surface rounded-3xl border border-nova-border space-y-3 shadow-xs">
              <h3 className="font-editorial text-[15px] font-bold text-nova-text flex items-center gap-2">
                <Heart className="w-4 h-4 text-nova-accent" />
                <span>Nhật ký hồi phục của mẹ sau sinh</span>
              </h3>
              <form onSubmit={handleAddMomDiary} className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={momMood}
                    onChange={(e) => setMomMood(e.target.value as MoodType)}
                    className="px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text focus:outline-none focus:border-nova-accent"
                  >
                    <option value="happy">Vui vẻ và bình an</option>
                    <option value="calm">Thư thái</option>
                    <option value="tired">Hơi mệt / thiếu ngủ</option>
                    <option value="anxious">Lo âu cần chia sẻ</option>
                  </select>
                  <input
                    type="number"
                    step="0.5"
                    value={momSleepHours}
                    onChange={(e) => setMomSleepHours(e.target.value)}
                    placeholder="Số giờ ngủ (Ví dụ: 6.5)"
                    className="px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text placeholder:text-nova-text-muted tabular-nums focus:outline-none focus:border-nova-accent"
                  />
                </div>
                <textarea
                  rows={2}
                  value={momRecoveryNote}
                  onChange={(e) => setMomRecoveryNote(e.target.value)}
                  placeholder="Ghi lại tình trạng vết sinh, bữa ăn, cảm xúc của mẹ hôm nay..."
                  className="w-full px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text placeholder:text-nova-text-muted resize-none focus:outline-none focus:border-nova-accent"
                />
                <button
                  type="submit"
                  className="w-full min-h-[44px] py-2.5 rounded-xl bg-nova-sage hover:opacity-90 text-nova-accent-contrast text-xs font-bold cursor-pointer transition-opacity"
                >
                  Lưu nhật ký mẹ hôm nay
                </button>
              </form>

              <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar pt-2">
                {state.postpartumDiary.length === 0 ? (
                  <p className="text-xs text-nova-text-muted italic">Chưa có nhật ký hậu sản.</p>
                ) : (
                  state.postpartumDiary.map((d) => (
                    <div
                      key={d.id}
                      className="p-3 rounded-2xl bg-nova-bg border border-nova-border"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-nova-text-muted tabular-nums">
                        <span>{d.date}</span>
                        {d.sleepHours && <span>Ngủ {d.sleepHours} giờ</span>}
                      </div>
                      <p className="text-xs text-nova-text mt-0.5 leading-relaxed">{d.recoveryNote}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-nova-warning-soft border border-nova-warning-border flex items-start gap-2.5 text-xs text-nova-text">
              <ShieldAlert className="w-4 h-4 text-nova-warning shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                Mốc phát triển 0–12 tháng chỉ mang tính tham khảo nhịp chung; mỗi em bé có tốc độ phát triển riêng. Nếu có bất kỳ băn khoăn nào về sức khỏe bé, hãy trao đổi cùng bác sĩ nhi khoa.
              </span>
            </div>

            <div className="space-y-2.5">
              {BABY_MILESTONES_BY_MONTH.map((m) => {
                const done = state.achievedBabyMilestoneIds.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => toggleMilestone(m.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-colors ${
                      done
                        ? 'bg-nova-sage-soft border-nova-sage'
                        : 'bg-nova-surface border-nova-border'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {done ? (
                        <CheckCircle2 className="w-5 h-5 text-nova-sage-text shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-nova-icon shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-editorial text-[14px] font-bold text-nova-text">{m.title}</h4>
                        <p className="text-xs text-nova-text-muted mt-1 leading-relaxed">{m.description}</p>
                        <p className="text-[11px] font-semibold text-nova-accent mt-1.5 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 shrink-0" /> Gợi ý đồng hành: {m.careFocus}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <section className="p-4 sm:p-5 bg-nova-surface rounded-3xl border border-nova-border space-y-3 shadow-xs">
              <h3 className="font-editorial text-[15px] font-bold text-nova-text flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-nova-sage-text" />
                <span>Hướng dẫn sau sinh có trích dẫn nguồn</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {POSTPARTUM_KNOWLEDGE_GUIDES.map((g) => (
                  <div
                    key={g.id}
                    className="p-3.5 rounded-2xl bg-nova-bg border border-nova-border"
                  >
                    <h4 className="text-xs font-bold text-nova-text">{g.title}</h4>
                    <p className="text-[11px] text-nova-text-muted mt-1 leading-relaxed">{g.summary}</p>
                    <p className="text-[10.5px] font-bold text-nova-sage-text mt-2">Nguồn: {g.source}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'album' && (
          <div className="space-y-4">
            <form
              onSubmit={handleAddAlbumPhoto}
              className="p-4 sm:p-5 bg-nova-surface rounded-3xl border border-nova-border space-y-3 shadow-xs"
            >
              <h3 className="font-editorial text-[15px] font-bold text-nova-text flex items-center gap-2">
                <Camera className="w-4 h-4 text-nova-accent" />
                <span>Lưu ảnh kỷ niệm từng tháng đầu đời của bé</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <select
                  value={albumMonth}
                  onChange={(e) => setAlbumMonth(Number(e.target.value))}
                  className="px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text focus:outline-none focus:border-nova-accent"
                >
                  {Array.from({ length: 13 }, (_, i) => (
                    <option key={i} value={i}>
                      {i === 0 ? 'Sơ sinh (0 tháng)' : `Bé ${i} tháng tuổi`}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  placeholder="Tiêu đề bức ảnh..."
                  className="px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text placeholder:text-nova-text-muted focus:outline-none focus:border-nova-accent"
                />
                <input
                  type="text"
                  value={albumCaption}
                  onChange={(e) => setAlbumCaption(e.target.value)}
                  placeholder="Lời nhắn cho bé..."
                  className="px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text placeholder:text-nova-text-muted focus:outline-none focus:border-nova-accent"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="min-h-[40px] px-3.5 py-2 rounded-xl bg-nova-accent-soft border border-nova-border text-xs font-bold text-nova-accent inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Đang tải ảnh...' : 'Tải ảnh từ thiết bị'}</span>
                  <input type="file" accept="image/*" onChange={handleUploadAlbumImage} className="hidden" />
                </label>
                {albumImageUrl && (
                  <NovaImage
                    src={albumImageUrl}
                    alt="Xem trước ảnh bé"
                    className="w-12 h-12 rounded-xl object-cover border border-nova-border"
                  />
                )}
                <button
                  type="submit"
                  className="ml-auto min-h-[40px] px-4 py-2 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-xs font-bold cursor-pointer whitespace-nowrap transition-colors"
                >
                  Lưu vào Album
                </button>
              </div>
            </form>

            {state.albumPhotos.length === 0 ? (
              <div className="p-8 rounded-3xl bg-nova-surface border border-nova-border text-center text-xs text-nova-text-muted">
                Chưa có bức ảnh nào trong Album sau sinh của bé.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {state.albumPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="rounded-3xl bg-nova-surface border border-nova-border overflow-hidden shadow-xs"
                  >
                    <NovaImage src={photo.imageUrl} alt={photo.title} className="w-full h-44 object-cover" />
                    <div className="p-3.5">
                      <span className="text-[10.5px] font-bold text-nova-accent tabular-nums">
                        {photo.monthAge === 0 ? 'Sơ sinh' : `Tháng ${photo.monthAge}`} · {photo.takenDate}
                      </span>
                      <h4 className="font-editorial text-sm font-bold text-nova-text mt-0.5">{photo.title}</h4>
                      {photo.caption && (
                        <p className="text-xs text-nova-text-muted mt-1 leading-relaxed">{photo.caption}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
