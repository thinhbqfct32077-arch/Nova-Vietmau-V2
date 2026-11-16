import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Camera,
  Crown,
  PhoneCall,
  CreditCard,
  ShieldAlert,
  Heart,
  Baby,
  Edit3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  LogOut,
  Sparkles,
  Save,
  X,
  Package,
  Download,
  Upload,
  RotateCcw,
  Truck,
  Check,
  AlertCircle,
  Copy,
  Sun,
  Moon,
  Monitor,
  Type,
  Award,
  Lock,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile, OrderInfo, ScreenType } from '../../types';
import { storageService, ThemeMode, FontScale } from '../../services/storageService';
import { apiService } from '../../services/apiService';
import confetti from 'canvas-confetti';
import { NovaImage } from '../NovaBrandMark';

interface ProfileScreenProps {
  user: UserProfile;
  orders?: OrderInfo[];
  onUpdateUser: (updatedUser: Partial<UserProfile>) => void;
  onBack: () => void;
  onOpenAvatarModal: () => void;
  onNavigateToEmergency: () => void;
  onNavigateToPayment: () => void;
  onNavigateToOrderInfo?: () => void;
  onNavigateScreen?: (screen: ScreenType) => void;
  themeMode?: ThemeMode;
  onChangeTheme?: (theme: ThemeMode) => void;
  fontScale?: FontScale;
  onChangeFontScale?: (scale: FontScale) => void;
  onResetData?: () => void;
  onImportData?: (importedUser: UserProfile) => void;
  onReopenOnboarding?: () => void;
  onAccountDeleted?: () => void;
  onLogout: () => void;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  vietqr: 'Chuyển khoản VietQR',
  cod: 'Thanh toán khi nhận hàng (COD)',
  online_demo: 'Thanh toán trực tuyến',
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  orders = [],
  onUpdateUser,
  onBack,
  onOpenAvatarModal,
  onNavigateToEmergency,
  onNavigateToPayment,
  onNavigateToOrderInfo,
  onNavigateScreen,
  themeMode = 'system',
  onChangeTheme,
  fontScale = 'normal',
  onChangeFontScale,
  onResetData,
  onImportData,
  onReopenOnboarding,
  onAccountDeleted,
  onLogout,
}) => {
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [serverOrders, setServerOrders] = useState<OrderInfo[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');
  const [lastSaved, setLastSaved] = useState(() => storageService.getLastSavedTime());

  const [editName, setEditName] = useState(user.name);
  const [editPhone, setEditPhone] = useState(user.phone);
  const [editWeek, setEditWeek] = useState(user.pregnancyWeek);
  const [editDueDate, setEditDueDate] = useState(user.dueDate);
  const [editNickname, setEditNickname] = useState(user.babyNickname || 'Bé Bơ');
  const [editWeight, setEditWeight] = useState(user.weightKg || 58.5);
  const [editHeight, setEditHeight] = useState(user.heightCm || 162);
  const [editBloodType, setEditBloodType] = useState(user.bloodType || 'O+');

  useEffect(() => {
    if (!showOrdersModal) return;
    apiService
      .fetchOrders(false, user)
      .then((list) => setServerOrders(list))
      .catch(() => {});
  }, [showOrdersModal, user?.id]);

  const combinedOrders = [
    ...serverOrders,
    ...orders.filter((lo) => !serverOrders.some((so) => so.orderId === lo.orderId)),
  ];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleExportAllData = async () => {
    try {
      let serverBundle: Record<string, unknown> = {};
      try {
        serverBundle = await apiService.exportServerData(user);
      } catch {}
      const localBundle = JSON.parse(storageService.exportAllUserData());
      const fullBundle = {
        ...localBundle,
        serverEcosystem: serverBundle,
      };
      const dataStr = JSON.stringify(fullBundle, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `NovaCare_Backup_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerToast('Đã xuất toàn bộ dữ liệu cá nhân (JSON)!');
    } catch {
      triggerToast('Không thể tạo tệp JSON, vui lòng thử lại.');
    }
  };

  const handleApplyImport = () => {
    setImportError('');
    if (!importJsonText.trim()) {
      setImportError('Vui lòng dán chuỗi JSON sao lưu.');
      return;
    }
    const result = storageService.importUserData(importJsonText);
    if (!result.success) {
      setImportError(result.message);
      return;
    }
    if (result.user) {
      onImportData?.(result.user);
      onUpdateUser(result.user);
    }
    setLastSaved(storageService.getLastSavedTime());
    setShowImportModal(false);
    setImportJsonText('');
    triggerToast('Đã khôi phục dữ liệu cá nhân thành công!');
  };

  const handleResetConfirmed = () => {
    const fresh = storageService.resetAllUserData();
    onResetData?.();
    onUpdateUser(fresh);
    setLastSaved(storageService.getLastSavedTime());
    setShowResetConfirmModal(false);
    triggerToast('Đã đặt lại dữ liệu mặc định ban đầu!');
  };

  const normalizedDeleteInput = deleteConfirmText.trim().toUpperCase();
  const isDeleteKeywordValid = normalizedDeleteInput === 'XOA' || normalizedDeleteInput === 'XÓA';

  const handleDeleteAccountConfirmed = async () => {
    if (!isDeleteKeywordValid) return;
    try {
      await apiService.deleteServerAccount(user);
    } catch {}
    storageService.deleteUserAccountAndData();
    setShowDeleteAccountModal(false);
    onAccountDeleted?.();
    onLogout();
  };

  const handleTogglePrivacy = async (
    field: 'allowFamilyDiscovery' | 'hideSensitiveDiaryInReportsByDefault'
  ) => {
    const current = user.privacySettings || {
      allowFamilyDiscovery: true,
      hideSensitiveDiaryInReportsByDefault: true,
      analyticsOptIn: false,
    };
    const nextSettings = { ...current, [field]: !current[field] };
    onUpdateUser({ privacySettings: nextSettings });
    try {
      await apiService.updatePrivacySettings({ privacySettings: nextSettings }, user);
      triggerToast('Đã cập nhật cài đặt quyền riêng tư');
    } catch {}
  };

  const handleToggleRewardsOptOut = async () => {
    const nextVal = user.rewardsEnabled === false ? true : false;
    onUpdateUser({ rewardsEnabled: nextVal });
    try {
      await apiService.updatePrivacySettings({ rewardsEnabled: nextVal }, user);
      triggerToast(nextVal ? 'Đã bật ghi nhận nhẹ nhàng' : 'Đã tắt tính năng ghi nhận');
    } catch {}
  };

  const handleSaveInfo = () => {
    const updated = {
      name: editName,
      phone: editPhone,
      pregnancyWeek: Number(editWeek),
      dueDate: editDueDate,
      babyNickname: editNickname,
      weightKg: Number(editWeight),
      heightCm: Number(editHeight),
      bloodType: editBloodType,
    };
    onUpdateUser(updated);
    storageService.saveUserProfile({ ...user, ...updated });
    setLastSaved(storageService.getLastSavedTime());
    setIsEditingInfo(false);
    triggerToast('Đã lưu thông tin cá nhân thành công!');
    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.5 },
        colors: ['#51483F', '#A3A795', '#B8AA98', '#EDE7DE'],
      });
    } catch {}
  };

  const roleDisplayLabel =
    user.role === 'admin'
      ? 'Quản trị viên'
      : user.role === 'moderator'
      ? 'Điều phối viên'
      : '';

  return (
    <div className="flex-1 flex flex-col bg-nova-bg overflow-y-auto no-scrollbar select-none">
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-nova-accent text-nova-accent-contrast border border-nova-border text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="px-5 pt-3 pb-2.5 flex items-center justify-between border-b border-nova-border sticky top-0 bg-nova-bg/95 backdrop-blur-md z-20">
        <button
          onClick={onBack}
          aria-label="Quay lại"
          className="w-9 h-9 rounded-full bg-nova-surface border border-nova-border shadow-2xs flex items-center justify-center text-nova-text-muted hover:bg-nova-bg-subtle transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="font-editorial text-[17px] font-bold text-nova-text">
          Hồ sơ mẹ và bé
        </span>
        <button
          onClick={() => setIsEditingInfo(true)}
          className="flex items-center gap-1 text-[12px] font-bold text-nova-accent bg-nova-accent-soft border border-nova-border px-3 py-1.5 rounded-full cursor-pointer whitespace-nowrap"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Sửa</span>
        </button>
      </div>

      <div className="px-5 pt-4 pb-8 space-y-4">
        {/* Hero Card */}
        <div className="relative p-5 bg-nova-surface rounded-3xl border border-nova-border shadow-2xs flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="w-22 h-22 rounded-full overflow-hidden border-3 border-nova-surface shadow-md ring-2 ring-nova-taupe/30 bg-nova-bg-subtle">
              <NovaImage src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <button
              onClick={onOpenAvatarModal}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast flex items-center justify-center shadow-md ring-2 ring-nova-surface cursor-pointer transition-colors"
              title="Đổi ảnh đại diện"
              aria-label="Đổi ảnh đại diện"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 mb-1 flex-wrap justify-center">
            <h2 className="font-editorial text-[21px] font-bold text-nova-text">
              {user.name}
            </h2>
            {user.isVip && (
              <span className="flex items-center gap-1 bg-nova-accent-soft border border-nova-border text-nova-accent text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                <Crown className="w-2.5 h-2.5 fill-current" /> VIP
              </span>
            )}
            {roleDisplayLabel && (
              <span className="bg-nova-bg-subtle border border-nova-border text-nova-text-muted text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                {roleDisplayLabel}
              </span>
            )}
          </div>

          <p className="text-[12px] text-nova-text-muted mb-2.5 tabular-nums">
            {user.phone} · {user.email}
          </p>

          <div className="flex items-center gap-2 flex-wrap justify-center text-[11.5px] font-semibold">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-nova-accent-soft text-nova-accent rounded-full tabular-nums">
              <Baby className="w-3.5 h-3.5" />
              {user.pregnancyStatus === 'postpartum'
                ? 'Chế độ sau sinh & em bé'
                : `Tuần ${user.pregnancyWeek} · Tam cá nguyệt ${user.pregnancyWeek <= 13 ? 1 : user.pregnancyWeek <= 27 ? 2 : 3}`}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-nova-bg-subtle text-nova-text-muted rounded-full">
              <Heart className="w-3 h-3 text-nova-accent" />
              {user.babyNickname || 'Bé Bơ'}
            </span>
          </div>

          <div className="w-full mt-4 p-3.5 bg-nova-bg-subtle rounded-2xl border border-nova-border flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-xl bg-nova-surface border border-nova-border flex items-center justify-center text-nova-accent">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-nova-text-muted block uppercase tracking-wider">
                  Dự sinh
                </span>
                <span className="text-[13px] font-extrabold text-nova-text tabular-nums">
                  {user.dueDate}
                </span>
              </div>
            </div>
            {onNavigateScreen && (
              <button
                onClick={() => onNavigateScreen('postpartum')}
                className="text-[11px] font-bold text-nova-accent bg-nova-surface border border-nova-border px-3 py-1.5 rounded-xl cursor-pointer whitespace-nowrap hover:bg-nova-accent-soft transition-colors"
              >
                {user.pregnancyStatus === 'postpartum' ? 'Quản lý sau sinh' : 'Chuyển sau sinh →'}
              </button>
            )}
          </div>
        </div>

        {/* UI & Accessibility Settings */}
        <div className="p-4 bg-nova-surface rounded-2xl border border-nova-border space-y-3">
          <span className="font-editorial text-[15px] font-bold text-nova-text block">
            Giao diện & Trợ năng
          </span>

          {onChangeTheme && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1.5">
              <div className="flex items-center gap-2.5">
                {themeMode === 'dark' ? (
                  <Moon className="w-4 h-4 text-nova-taupe" />
                ) : themeMode === 'light' ? (
                  <Sun className="w-4 h-4 text-nova-taupe" />
                ) : (
                  <Monitor className="w-4 h-4 text-nova-icon" />
                )}
                <span className="text-[12.5px] font-medium text-nova-text">
                  Chế độ giao diện
                </span>
              </div>
              <div className="flex bg-nova-bg-subtle p-1 rounded-xl gap-1 border border-nova-border self-start sm:self-auto">
                {[
                  { id: 'light' as const, label: 'Sáng' },
                  { id: 'dark' as const, label: 'Tối' },
                  { id: 'system' as const, label: 'Hệ thống' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeTheme(opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer whitespace-nowrap transition-colors ${
                      themeMode === opt.id
                        ? 'bg-nova-accent text-nova-accent-contrast shadow-2xs'
                        : 'text-nova-text-muted hover:text-nova-text'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {onChangeFontScale && (
            <div className="flex items-center justify-between py-1.5 border-t border-nova-border">
              <div className="flex items-center gap-2.5">
                <Type className="w-4 h-4 text-nova-sage-text" />
                <span className="text-[12.5px] font-medium text-nova-text">
                  Cỡ chữ hiển thị
                </span>
              </div>
              <div className="flex bg-nova-bg-subtle p-1 rounded-xl gap-1 border border-nova-border">
                {[
                  { id: 'small' as const, label: 'Nhỏ' },
                  { id: 'normal' as const, label: 'Chuẩn' },
                  { id: 'large' as const, label: 'Lớn' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeFontScale(opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer whitespace-nowrap transition-colors ${
                      fontScale === opt.id
                        ? 'bg-nova-accent text-nova-accent-contrast'
                        : 'text-nova-text-muted hover:text-nova-text'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label className="flex items-center justify-between py-1.5 border-t border-nova-border cursor-pointer">
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-nova-taupe" />
              <div>
                <span className="text-[12.5px] font-medium text-nova-text block">
                  Hiển thị ghi nhận nhẹ nhàng
                </span>
                <span className="text-[10.5px] text-nova-text-muted">
                  Mẹ có thể tắt bất kỳ lúc nào nếu muốn yên tĩnh
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={user.rewardsEnabled !== false}
              onChange={handleToggleRewardsOptOut}
              className="accent-nova-accent w-4 h-4 cursor-pointer"
            />
          </label>
        </div>

        {/* Essential Actions */}
        <div className="space-y-2.5">
          <span className="font-editorial text-[15px] font-bold text-nova-text px-1 block">
            Tiện ích & Giao dịch
          </span>

          {(user.role === 'admin' || user.role === 'moderator') && onNavigateScreen && (
            <div
              onClick={() => onNavigateScreen('admin')}
              className="p-3.5 bg-nova-surface-elevated text-nova-text rounded-2xl shadow-xs flex items-center justify-between cursor-pointer border border-nova-taupe/50 hover:border-nova-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-nova-accent-soft flex items-center justify-center text-nova-accent">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[13.5px] font-bold text-nova-text">
                    Bảng điều khiển quản trị & kiểm duyệt
                  </h4>
                  <p className="text-[11px] text-nova-text-muted">
                    Kiểm duyệt video, bài viết, đơn hàng & báo cáo vi phạm
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-nova-icon" />
            </div>
          )}

          <div
            onClick={onNavigateToEmergency}
            className="p-3.5 bg-nova-danger-soft border border-nova-danger-border text-nova-danger rounded-2xl shadow-xs flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-nova-danger/15 flex items-center justify-center text-nova-danger">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold">Số khẩn cấp SOS & Y tế</h4>
                <p className="text-[11px] opacity-85">Cấp cứu 115 & Người thân</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 opacity-75" />
          </div>

          <div
            onClick={onNavigateToPayment}
            className="p-3.5 bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast rounded-2xl border border-nova-border shadow-xs flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-nova-accent-contrast/15 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold">Nâng cấp gói VIP & VietQR</h4>
                <p className="text-[11px] opacity-85">Thông tin chuyển khoản & đối soát minh bạch</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 opacity-80" />
          </div>

          <div
            onClick={() => setShowOrdersModal(true)}
            className="p-3.5 bg-nova-surface border border-nova-border rounded-2xl flex items-center justify-between cursor-pointer hover:border-nova-taupe transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-nova-bg-subtle flex items-center justify-center text-nova-accent">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[13.5px] font-bold text-nova-text">
                  Đơn hàng & Theo dõi vận chuyển
                </h4>
                <p className="text-[11px] text-nova-text-muted">
                  Xem trạng thái xác nhận thanh toán và lịch sử giao hàng
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-nova-icon" />
          </div>

          <div
            onClick={onNavigateToOrderInfo}
            className="p-3.5 bg-nova-surface border border-nova-border rounded-2xl flex items-center justify-between cursor-pointer hover:border-nova-sage transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-nova-sage-soft flex items-center justify-center text-nova-sage-text">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[13.5px] font-bold text-nova-text">Sổ địa chỉ nhận hàng</h4>
                <p className="text-[11px] text-nova-text-muted line-clamp-1">
                  {user.shippingAddresses?.[0]?.streetAddress || 'Quản lý địa chỉ giao hàng'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-nova-icon" />
          </div>
        </div>

        {/* Privacy & Data Ownership */}
        <div className="p-4 bg-nova-surface rounded-2xl border border-nova-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-nova-sage-text" />
              <div>
                <h4 className="font-editorial text-[15px] font-bold text-nova-text">
                  Quyền riêng tư & Dữ liệu cá nhân
                </h4>
                <span className="text-[10.5px] text-nova-text-muted tabular-nums">
                  Lưu gần nhất: {lastSaved}
                </span>
              </div>
            </div>
          </div>

          <label className="flex items-center justify-between gap-2 py-1.5 cursor-pointer">
            <span className="text-xs text-nova-text-muted">
              Cho phép mời người thân vào Gia đình Nova
            </span>
            <input
              type="checkbox"
              checked={user.privacySettings?.allowFamilyDiscovery ?? true}
              onChange={() => handleTogglePrivacy('allowFamilyDiscovery')}
              className="accent-nova-accent w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between gap-2 py-1.5 border-t border-nova-border cursor-pointer">
            <span className="text-xs text-nova-text-muted">
              Mặc định ẩn nhật ký nhạy cảm khi chia sẻ báo cáo
            </span>
            <input
              type="checkbox"
              checked={user.privacySettings?.hideSensitiveDiaryInReportsByDefault ?? true}
              onChange={() => handleTogglePrivacy('hideSensitiveDiaryInReportsByDefault')}
              className="accent-nova-accent w-4 h-4 cursor-pointer"
            />
          </label>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleExportAllData}
              className="min-h-[42px] flex items-center justify-center gap-1.5 py-2.5 px-3 bg-nova-bg-subtle border border-nova-border text-nova-text rounded-xl text-[11.5px] font-bold cursor-pointer whitespace-nowrap hover:border-nova-accent transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-nova-accent" />
              <span>Xuất dữ liệu JSON</span>
            </button>
            <button
              onClick={() => {
                setImportError('');
                setImportJsonText('');
                setShowImportModal(true);
              }}
              className="min-h-[42px] flex items-center justify-center gap-1.5 py-2.5 px-3 bg-nova-bg-subtle border border-nova-border text-nova-text rounded-xl text-[11.5px] font-bold cursor-pointer whitespace-nowrap hover:border-nova-sage transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-nova-sage-text" />
              <span>Khôi phục JSON</span>
            </button>
          </div>

          <div className="pt-2 border-t border-nova-border flex items-center justify-between text-[11px]">
            <button
              onClick={onReopenOnboarding}
              className="text-nova-accent hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Thiết lập lại thai kỳ</span>
            </button>
            <button
              onClick={() => setShowResetConfirmModal(true)}
              className="text-nova-text-muted hover:text-nova-accent font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Đặt lại mặc định</span>
            </button>
          </div>

          <button
            onClick={() => {
              setDeleteConfirmText('');
              setShowDeleteAccountModal(true);
            }}
            className="w-full min-h-[42px] py-2.5 px-3 rounded-xl bg-nova-danger-soft border border-nova-danger-border text-nova-danger text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa tài khoản & toàn bộ dữ liệu cá nhân</span>
          </button>
        </div>

        {/* Account Actions */}
        <div className="p-4 bg-nova-surface rounded-2xl border border-nova-border space-y-2">
          <div
            onClick={onNavigateToEmergency}
            className="flex items-center justify-between py-2 border-b border-nova-border cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <PhoneCall className="w-4 h-4 text-nova-danger" />
              <span className="text-[12.5px] font-medium text-nova-text">
                Danh bạ cấp cứu sản khoa
              </span>
            </div>
            <span className="text-[11px] font-bold text-nova-danger tabular-nums">
              {user.emergencyContacts.length} số
            </span>
          </div>

          <button
            onClick={onLogout}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 py-3 text-nova-accent text-[13px] font-bold rounded-xl hover:bg-nova-bg-subtle transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất / Đổi tài khoản</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Info Modal */}
      {isEditingInfo && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#1C1B18]/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-[420px] bg-nova-surface rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-nova-border max-h-[90vh] overflow-y-auto no-scrollbar text-nova-text">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-nova-border">
              <h3 className="font-editorial text-[18px] font-bold">Chỉnh sửa hồ sơ mẹ và bé</h3>
              <button
                onClick={() => setIsEditingInfo(false)}
                className="w-9 h-9 rounded-full bg-nova-bg-subtle border border-nova-border text-nova-text flex items-center justify-center cursor-pointer hover:bg-nova-accent-soft"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-nova-text-muted mb-1">Họ tên của mẹ</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-nova-bg-subtle border border-nova-border rounded-xl text-[13px] text-nova-text focus:outline-none focus:border-nova-accent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-nova-text-muted mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-nova-bg-subtle border border-nova-border rounded-xl text-[13px] text-nova-text tabular-nums focus:outline-none focus:border-nova-accent"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-nova-text-muted mb-1">Biệt danh bé</label>
                  <input
                    type="text"
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-nova-bg-subtle border border-nova-border rounded-xl text-[13px] text-nova-text focus:outline-none focus:border-nova-accent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-nova-text-muted mb-1">Tuần thai (1 - 40)</label>
                  <input
                    type="number"
                    min="1"
                    max="42"
                    value={editWeek}
                    onChange={(e) => setEditWeek(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-nova-bg-subtle border border-nova-border rounded-xl text-[13px] text-nova-text tabular-nums focus:outline-none focus:border-nova-accent"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-nova-text-muted mb-1">Ngày dự sinh</label>
                  <input
                    type="text"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-nova-bg-subtle border border-nova-border rounded-xl text-[13px] text-nova-text tabular-nums focus:outline-none focus:border-nova-accent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10.5px] font-bold text-nova-text-muted mb-1">Cân nặng (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editWeight}
                    onChange={(e) => setEditWeight(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-nova-bg-subtle border border-nova-border rounded-xl text-[13px] text-center text-nova-text tabular-nums focus:outline-none focus:border-nova-accent"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-nova-text-muted mb-1">Chiều cao (cm)</label>
                  <input
                    type="number"
                    value={editHeight}
                    onChange={(e) => setEditHeight(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-nova-bg-subtle border border-nova-border rounded-xl text-[13px] text-center text-nova-text tabular-nums focus:outline-none focus:border-nova-accent"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-nova-text-muted mb-1">Nhóm máu</label>
                  <select
                    value={editBloodType}
                    onChange={(e) => setEditBloodType(e.target.value)}
                    className="w-full px-2 py-2.5 bg-nova-bg-subtle border border-nova-border rounded-xl text-[13px] text-center text-nova-text focus:outline-none focus:border-nova-accent"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="Rh-">Rh- (Hiếm)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditingInfo(false)}
                  className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-nova-bg-subtle border border-nova-border text-[13px] font-bold text-nova-text-muted cursor-pointer hover:bg-nova-accent-soft"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveInfo}
                  className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order History + Tracking Timeline Modal */}
      {showOrdersModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#1C1B18]/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-[460px] bg-nova-surface rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-nova-border max-h-[85vh] flex flex-col text-nova-text">
            <div className="flex items-center justify-between pb-3 border-b border-nova-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-nova-bg-subtle border border-nova-border text-nova-accent flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-editorial text-[17px] font-bold">Lịch sử đơn hàng</h3>
                  <p className="text-[11px] text-nova-text-muted tabular-nums">{combinedOrders.length} đơn hàng</p>
                </div>
              </div>
              <button
                onClick={() => setShowOrdersModal(false)}
                className="w-9 h-9 rounded-full bg-nova-bg-subtle border border-nova-border flex items-center justify-center cursor-pointer hover:bg-nova-accent-soft"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-3">
              {combinedOrders.length === 0 ? (
                <div className="py-12 text-center text-nova-text-muted">
                  <Package className="w-12 h-12 mx-auto opacity-40 mb-2" />
                  <p className="text-[13px] font-bold text-nova-text">Chưa có đơn hàng nào</p>
                </div>
              ) : (
                combinedOrders.map((ord) => (
                  <div
                    key={ord.orderId}
                    className="p-3.5 bg-nova-bg-subtle rounded-2xl border border-nova-border space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-[11px] gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-nova-accent">{ord.orderId}</span>
                        <button
                          onClick={() => {
                            try {
                              navigator.clipboard.writeText(ord.orderId);
                              triggerToast('Đã sao chép mã: ' + ord.orderId);
                            } catch {}
                          }}
                          className="text-nova-icon hover:text-nova-accent cursor-pointer"
                          aria-label="Sao chép mã đơn hàng"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] whitespace-nowrap border ${
                          ord.status === 'delivered'
                            ? 'bg-nova-sage-soft text-nova-sage-text border-nova-success-border'
                            : ord.status === 'cancelled'
                            ? 'bg-nova-danger-soft text-nova-danger border-nova-danger-border'
                            : 'bg-nova-warning-soft text-nova-warning border-nova-warning-border'
                        }`}
                      >
                        {ord.status === 'delivered'
                          ? 'Đã giao'
                          : ord.status === 'shipping'
                          ? 'Đang giao'
                          : ord.status === 'confirmed'
                          ? 'Đã xác nhận'
                          : ord.status === 'awaiting_verification'
                          ? 'Chờ xác minh VietQR'
                          : ord.status === 'cancelled'
                          ? 'Đã hủy'
                          : 'Chờ xác nhận'}
                      </span>
                    </div>

                    <div className="space-y-1 py-1.5 border-y border-nova-border">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-[12px]">
                          <span className="line-clamp-1">
                            {it.product.name}{' '}
                            <span className="text-nova-text-muted font-semibold tabular-nums">x{it.quantity}</span>
                          </span>
                          <span className="font-semibold shrink-0 ml-2 tabular-nums">
                            {(it.product.price * it.quantity).toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      ))}
                    </div>

                    {ord.trackingHistory && ord.trackingHistory.length > 0 && (
                      <div className="space-y-1 bg-nova-surface border border-nova-border p-2.5 rounded-xl">
                        <p className="text-[10px] font-bold uppercase text-nova-text-muted">Tiến trình xử lý:</p>
                        {ord.trackingHistory.map((ev, idx) => (
                          <div key={idx} className="text-[11px] flex items-start justify-between gap-2">
                            <span className="font-semibold text-nova-text">• {ev.label}</span>
                            <span className="text-[10px] text-nova-text-muted shrink-0 tabular-nums">
                              {new Date(ev.timestamp).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-nova-text-muted">
                      <span>{PAYMENT_METHOD_LABELS[ord.paymentMethod] || ord.paymentMethod}</span>
                      <span className="text-[13px] font-extrabold text-nova-accent tabular-nums">
                        {ord.totalAmount.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowOrdersModal(false)}
              className="w-full min-h-[44px] py-2.5 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-[13px] font-bold cursor-pointer mt-2"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#1C1B18]/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-[420px] bg-nova-surface rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-nova-border max-h-[85vh] flex flex-col text-nova-text">
            <div className="flex items-center justify-between pb-3 border-b border-nova-border">
              <h3 className="font-editorial text-[17px] font-bold">Khôi phục dữ liệu JSON</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="w-9 h-9 rounded-full bg-nova-bg-subtle border border-nova-border flex items-center justify-center cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-3 space-y-3">
              <textarea
                rows={6}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='Dán nội dung bản sao lưu JSON tại đây...'
                className="w-full p-3 bg-nova-bg-subtle border border-nova-border rounded-xl text-[11px] font-mono text-nova-text focus:outline-none focus:border-nova-sage"
              />
              {importError && (
                <div className="p-2.5 bg-nova-danger-soft border border-nova-danger-border rounded-xl text-nova-danger text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-nova-bg-subtle border border-nova-border text-xs font-bold text-nova-text-muted cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleApplyImport}
                className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check className="w-4 h-4" /> Khôi phục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1B18]/60 backdrop-blur-xs">
          <div className="bg-nova-surface rounded-3xl p-5 w-full max-w-sm border border-nova-border space-y-3 text-nova-text shadow-2xl">
            <h3 className="font-editorial text-[18px] font-bold">Đặt lại dữ liệu mặc định?</h3>
            <p className="text-xs text-nova-text-muted leading-relaxed">
              Hành động này sẽ khôi phục bộ nhớ cục bộ trên trình duyệt về trạng thái mẫu ban đầu.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-nova-bg-subtle border border-nova-border text-xs font-bold text-nova-text-muted cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleResetConfirmed}
                className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-nova-danger text-[#FAF9F6] text-xs font-bold cursor-pointer hover:opacity-90"
              >
                Đặt lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Account Deletion Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1B18]/60 backdrop-blur-xs">
          <div className="bg-nova-surface rounded-3xl p-5 w-full max-w-sm border border-nova-danger-border space-y-3 text-nova-text shadow-2xl">
            <div className="flex items-center gap-2 text-nova-danger">
              <Trash2 className="w-5 h-5" />
              <h3 className="font-editorial text-[18px] font-bold">Xóa vĩnh viễn dữ liệu cá nhân</h3>
            </div>
            <p className="text-xs text-nova-text-muted leading-relaxed">
              Tất cả kỷ niệm siêu âm, nhật ký sức khỏe, nhắc nhở, kế hoạch sinh và kết nối gia đình của tài khoản <strong>{user.name}</strong> sẽ bị xóa khỏi máy chủ và thiết bị. Hãy nhập <strong>XÓA</strong> để xác nhận.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Nhập XÓA"
              className="w-full px-3.5 py-2.5 bg-nova-bg-subtle border border-nova-border rounded-xl text-sm font-bold text-center text-nova-text focus:outline-none focus:border-nova-danger"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteAccountModal(false)}
                className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-nova-bg-subtle border border-nova-border text-xs font-bold text-nova-text-muted cursor-pointer"
              >
                Giữ lại tài khoản
              </button>
              <button
                onClick={handleDeleteAccountConfirmed}
                disabled={!isDeleteKeywordValid}
                className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-nova-danger hover:opacity-90 disabled:opacity-40 text-[#FAF9F6] text-xs font-bold cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
