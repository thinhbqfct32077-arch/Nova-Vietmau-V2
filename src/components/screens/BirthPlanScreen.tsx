import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ClipboardList,
  Printer,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Hospital,
  UserPlus,
  Heart,
  Sparkles,
  FileText,
} from 'lucide-react';
import { BirthPlanData, UserProfile } from '../../types';
import { apiService } from '../../services/apiService';
import { storageService } from '../../services/storageService';

interface BirthPlanScreenProps {
  user: UserProfile;
  onBack: () => void;
}

const PRESET_PREFERENCES = [
  'Da kề da 90 phút ngay sau sinh',
  'Cho bé bú mẹ sớm trong giờ đầu',
  'Cắt dây rốn chậm sau 1–3 phút theo đánh giá bác sĩ',
  'Có chồng / người thân đồng hành trong phòng chờ sinh',
  'Ưu tiên tư vấn rõ ràng trước mọi can thiệp y khoa không khẩn cấp',
  'Giữ không gian phòng sinh yên tĩnh, ánh sáng dịu',
];

export const BirthPlanScreen: React.FC<BirthPlanScreenProps> = ({ user, onBack }) => {
  const [plan, setPlan] = useState<BirthPlanData>(() =>
    storageService.getOfflineCache<BirthPlanData>(user.id, 'birth_plan', {
      userId: user.id,
      expectedDueDate: user.dueDate || '15/11/2026',
      preferredHospital: '',
      hospitalAddress: '',
      obgynName: '',
      supportContacts: (user.emergencyContacts || []).slice(0, 3).map((c) => ({
        id: c.id,
        name: c.name,
        role: c.relationship,
        phone: c.phone,
      })),
      birthPreferences: ['Da kề da 90 phút ngay sau sinh', 'Cho bé bú mẹ sớm trong giờ đầu'],
      personalNotes: '',
      postpartumSupportPlan: '',
      prepItems: [
        { id: 'bp-1', label: 'Đăng ký hồ sơ sinh & làm xét nghiệm tuần 36', checked: false },
        { id: 'bp-2', label: 'Tìm hiểu lộ trình di chuyển tới bệnh viện', checked: false },
      ],
      hospitalBagItems: [
        { id: 'hb-1', label: 'Giấy tờ tùy thân, BHYT & sổ khám thai', checked: false },
        { id: 'hb-2', label: 'Quần áo mẹ & bé sơ sinh đã giặt ủi sạch', checked: false },
      ],
      updatedAt: new Date().toISOString(),
    })
  );

  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [newContactName, setNewContactName] = useState('');
  const [newContactRole, setNewContactRole] = useState('Chồng / Người thân');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newPref, setNewPref] = useState('');
  const [newPrepItem, setNewPrepItem] = useState('');
  const [newBagItem, setNewBagItem] = useState('');

  useEffect(() => {
    apiService
      .fetchBirthPlan(user)
      .then((serverPlan) => {
        setPlan(serverPlan);
        storageService.setOfflineCache(user.id, 'birth_plan', serverPlan);
      })
      .catch(() => {});
  }, [user.id]);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const handleSave = async (nextPlan: BirthPlanData = plan) => {
    setIsSaving(true);
    try {
      const saved = await apiService.saveBirthPlan(nextPlan, user);
      setPlan(saved);
      storageService.setOfflineCache(user.id, 'birth_plan', saved);
      notify('Đã lưu kế hoạch đi sinh thành công!');
    } catch {
      storageService.setOfflineCache(user.id, 'birth_plan', nextPlan);
      notify('Đã lưu bản nháp trên thiết bị.');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePreference = (pref: string) => {
    setPlan((prev) => {
      const exists = prev.birthPreferences.includes(pref);
      return {
        ...prev,
        birthPreferences: exists
          ? prev.birthPreferences.filter((p) => p !== pref)
          : [...prev.birthPreferences, pref],
      };
    });
  };

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    setPlan((prev) => ({
      ...prev,
      supportContacts: [
        ...prev.supportContacts,
        {
          id: `sc-${Date.now()}`,
          name: newContactName.trim(),
          role: newContactRole.trim() || 'Người hỗ trợ',
          phone: newContactPhone.trim(),
        },
      ],
    }));
    setNewContactName('');
    setNewContactPhone('');
  };

  const handleAddPref = () => {
    if (!newPref.trim()) return;
    const val = newPref.trim();
    if (!plan.birthPreferences.includes(val)) {
      setPlan((prev) => ({ ...prev, birthPreferences: [...prev.birthPreferences, val] }));
    }
    setNewPref('');
  };

  const handleAddPrepItem = () => {
    if (!newPrepItem.trim()) return;
    setPlan((prev) => ({
      ...prev,
      prepItems: [...prev.prepItems, { id: `bp-${Date.now()}`, label: newPrepItem.trim(), checked: false }],
    }));
    setNewPrepItem('');
  };

  const handleAddBagItem = () => {
    if (!newBagItem.trim()) return;
    setPlan((prev) => ({
      ...prev,
      hospitalBagItems: [
        ...prev.hospitalBagItems,
        { id: `hb-${Date.now()}`, label: newBagItem.trim(), checked: false },
      ],
    }));
    setNewBagItem('');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FAF6F0] dark:bg-[#161311] text-[#322622] dark:text-[#F4EDE6] overflow-y-auto no-scrollbar pb-16 print:overflow-visible print:bg-white print:text-black print:pb-0">
      {toast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#322622] dark:bg-[#F4EDE6] text-white dark:text-[#161311] text-xs font-bold px-4 py-2 rounded-full shadow-xl print:hidden">
          {toast}
        </div>
      )}

      {/* Top Sticky Header */}
      <header className="px-4 sm:px-6 pt-3 pb-3 flex items-center justify-between gap-2 border-b border-[#E6DDD1] dark:border-[#362E2A] bg-[#FAF6F0]/95 dark:bg-[#161311]/95 backdrop-blur-md sticky top-0 z-20 print:hidden">
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
              <ClipboardList className="w-4 h-4 text-[#B55841] dark:text-[#D47A63] shrink-0" />
              <span>Kế hoạch đi sinh</span>
            </h1>
            <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] truncate">Chuẩn bị rõ ràng để mẹ và gia đình an tâm đón bé</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] text-xs font-bold text-[#6B5D56] dark:text-[#C5B9B0] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap min-h-[40px] hover:bg-[#F2ECE3] dark:hover:bg-[#231E1B]"
          >
            <Printer className="w-3.5 h-3.5 text-[#B55841] dark:text-[#D47A63]" />
            <span className="hidden sm:inline">In / PDF</span>
          </button>
          <button
            onClick={() => handleSave(plan)}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-xl bg-[#B55841] hover:bg-[#9E4A35] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap min-h-[40px] shadow-xs disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu kế hoạch'}</span>
          </button>
        </div>
      </header>

      {/* Print Header */}
      <div className="hidden print:block px-6 py-4 border-b border-gray-300">
        <h1 className="font-editorial text-xl font-bold text-[#322622]">KẾ HOẠCH ĐI SINH — NOVA VIỆT MẪU</h1>
        <p className="text-xs text-gray-600 mt-1 tabular-nums">
          Mẹ bầu: {user.name} · Bé: {user.babyNickname || 'Bé yêu'} · Ngày dự sinh: {plan.expectedDueDate}
        </p>
      </div>

      <div className="px-4 sm:px-6 pt-4 space-y-4 max-w-4xl mx-auto w-full">
        {/* Section 1: Hospital & OB/GYN Info */}
        <section className="p-4 sm:p-5 bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-3">
          <h2 className="font-editorial text-[16px] font-bold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-2">
            <Hospital className="w-4 h-4 text-[#B55841] dark:text-[#D47A63]" />
            <span>Thông tin bệnh viện & Bác sĩ đồng hành</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#786962] dark:text-[#B5A89F] block mb-1">
                Ngày dự sinh dự kiến
              </label>
              <input
                type="text"
                value={plan.expectedDueDate}
                onChange={(e) => setPlan({ ...plan, expectedDueDate: e.target.value })}
                placeholder="VD: 15/11/2026"
                className="w-full px-3 py-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#322622] dark:text-[#F4EDE6] tabular-nums focus:outline-none focus:border-[#B55841]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#786962] dark:text-[#B5A89F] block mb-1">
                Bác sĩ sản khoa theo dõi
              </label>
              <input
                type="text"
                value={plan.obgynName || ''}
                onChange={(e) => setPlan({ ...plan, obgynName: e.target.value })}
                placeholder="VD: BS. CKII Nguyễn Thị Ánh"
                className="w-full px-3 py-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#786962] dark:text-[#B5A89F] block mb-1">
                Bệnh viện dự kiến sinh
              </label>
              <input
                type="text"
                value={plan.preferredHospital}
                onChange={(e) => setPlan({ ...plan, preferredHospital: e.target.value })}
                placeholder="VD: Bệnh viện Phụ sản Từ Dũ"
                className="w-full px-3 py-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#786962] dark:text-[#B5A89F] block mb-1">
                Địa chỉ / Cổng cấp cứu sản
              </label>
              <input
                type="text"
                value={plan.hospitalAddress || ''}
                onChange={(e) => setPlan({ ...plan, hospitalAddress: e.target.value })}
                placeholder="VD: 284 Cống Quỳnh, Q.1, TP.HCM"
                className="w-full px-3 py-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841]"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Support Contacts */}
        <section className="p-4 sm:p-5 bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-3">
          <h2 className="font-editorial text-[16px] font-bold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#4F6B56] dark:text-[#8DA892]" />
            <span>Người đồng hành & Liên hệ khẩn cấp</span>
          </h2>

          <div className="space-y-2">
            {plan.supportContacts.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A]"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#322622] dark:text-[#F4EDE6]">
                    {c.name} <span className="text-[#786962] dark:text-[#B5A89F] font-medium">({c.role})</span>
                  </p>
                  <p className="text-[11px] font-mono text-[#B55841] dark:text-[#D47A63] font-bold tabular-nums">{c.phone}</p>
                </div>
                <button
                  onClick={() =>
                    setPlan({
                      ...plan,
                      supportContacts: plan.supportContacts.filter((item) => item.id !== c.id),
                    })
                  }
                  className="p-2 text-[#786962] dark:text-[#B5A89F] hover:text-[#A9422D] dark:hover:text-[#D47A63] cursor-pointer print:hidden"
                  aria-label="Xóa liên hệ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 print:hidden">
            <input
              type="text"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              placeholder="Tên người thân..."
              className="px-3 py-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841]"
            />
            <input
              type="text"
              value={newContactRole}
              onChange={(e) => setNewContactRole(e.target.value)}
              placeholder="Vai trò (Chồng, Mẹ...)"
              className="px-3 py-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841]"
            />
            <div className="flex gap-1.5">
              <input
                type="tel"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                placeholder="Số điện thoại"
                className="flex-1 px-3 py-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs font-mono text-[#322622] dark:text-[#F4EDE6] tabular-nums focus:outline-none focus:border-[#B55841]"
              />
              <button
                type="button"
                onClick={handleAddContact}
                className="min-h-[40px] px-3 py-2 rounded-xl bg-[#322622] dark:bg-[#F4EDE6] text-white dark:text-[#161311] text-xs font-bold cursor-pointer shrink-0"
                aria-label="Thêm người liên hệ"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Section 3: Birth Preferences */}
        <section className="p-4 sm:p-5 bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-3">
          <h2 className="font-editorial text-[16px] font-bold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#B55841] dark:text-[#D47A63]" />
            <span>Mong muốn khi sinh (trao đổi cùng ê-kíp bác sĩ)</span>
          </h2>
          <p className="text-[11px] text-[#786962] dark:text-[#B5A89F]">
            * Lưu ý: Kế hoạch sinh mang tính chuẩn bị mong muốn, bác sĩ sẽ điều chỉnh linh hoạt để ưu tiên an toàn tối đa cho mẹ và bé.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Array.from(new Set([...PRESET_PREFERENCES, ...plan.birthPreferences])).map((pref) => {
              const checked = plan.birthPreferences.includes(pref);
              return (
                <button
                  key={pref}
                  type="button"
                  onClick={() => togglePreference(pref)}
                  className={`p-3 rounded-2xl border text-left text-xs flex items-start gap-2.5 transition-colors cursor-pointer ${
                    checked
                      ? 'bg-[#F7EAE5] dark:bg-[#35231E] border-[#EBCDC2] dark:border-[#52352D] text-[#322622] dark:text-[#F4EDE6] font-semibold'
                      : 'bg-[#FAF6F0] dark:bg-[#231E1B] border-[#E6DDD1] dark:border-[#362E2A] text-[#6B5D56] dark:text-[#C5B9B0]'
                  }`}
                >
                  {checked ? (
                    <CheckCircle2 className="w-4 h-4 text-[#B55841] dark:text-[#D47A63] shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#C5B9B0] dark:text-[#786962] shrink-0 mt-0.5" />
                  )}
                  <span>{pref}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 print:hidden">
            <input
              type="text"
              value={newPref}
              onChange={(e) => setNewPref(e.target.value)}
              placeholder="Thêm mong muốn riêng của mẹ..."
              className="flex-1 px-3 py-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841]"
            />
            <button
              type="button"
              onClick={handleAddPref}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-[#322622] dark:bg-[#F4EDE6] text-white dark:text-[#161311] text-xs font-bold cursor-pointer whitespace-nowrap"
            >
              Thêm mục
            </button>
          </div>
        </section>

        {/* Section 4: Prep Items & Hospital Bag */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="p-4 sm:p-5 bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-3">
            <h2 className="font-editorial text-[16px] font-bold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#9E5B3B] dark:text-[#D7BA86]" />
              <span>Việc cần chuẩn bị trước ngày sinh</span>
            </h2>
            <div className="space-y-2">
              {plan.prepItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A]"
                >
                  <label className="flex items-center gap-2.5 flex-1 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() =>
                        setPlan({
                          ...plan,
                          prepItems: plan.prepItems.map((p) =>
                            p.id === item.id ? { ...p, checked: !p.checked } : p
                          ),
                        })
                      }
                      className="w-4 h-4 accent-[#B55841]"
                    />
                    <span className={item.checked ? 'line-through text-[#786962] dark:text-[#B5A89F]' : 'text-[#322622] dark:text-[#F4EDE6]'}>
                      {item.label}
                    </span>
                  </label>
                  <button
                    onClick={() =>
                      setPlan({ ...plan, prepItems: plan.prepItems.filter((p) => p.id !== item.id) })
                    }
                    className="p-1 text-[#786962] dark:text-[#B5A89F] hover:text-[#A9422D] dark:hover:text-[#D47A63] cursor-pointer print:hidden"
                    aria-label="Xóa mục chuẩn bị"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 print:hidden">
              <input
                type="text"
                value={newPrepItem}
                onChange={(e) => setNewPrepItem(e.target.value)}
                placeholder="Thêm việc chuẩn bị..."
                className="flex-1 px-3 py-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841]"
              />
              <button
                type="button"
                onClick={handleAddPrepItem}
                className="min-h-[40px] px-3 py-2 rounded-xl bg-[#B55841] hover:bg-[#9E4A35] text-white text-xs font-bold cursor-pointer"
                aria-label="Thêm việc chuẩn bị"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </section>

          <section className="p-4 sm:p-5 bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-3">
            <h2 className="font-editorial text-[16px] font-bold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#4F6B56] dark:text-[#8DA892]" />
              <span>Giỏ đồ đi sinh sẵn sàng</span>
            </h2>
            <div className="space-y-2">
              {plan.hospitalBagItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A]"
                >
                  <label className="flex items-center gap-2.5 flex-1 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() =>
                        setPlan({
                          ...plan,
                          hospitalBagItems: plan.hospitalBagItems.map((p) =>
                            p.id === item.id ? { ...p, checked: !p.checked } : p
                          ),
                        })
                      }
                      className="w-4 h-4 accent-[#4F6B56]"
                    />
                    <span className={item.checked ? 'line-through text-[#786962] dark:text-[#B5A89F]' : 'text-[#322622] dark:text-[#F4EDE6]'}>
                      {item.label}
                    </span>
                  </label>
                  <button
                    onClick={() =>
                      setPlan({
                        ...plan,
                        hospitalBagItems: plan.hospitalBagItems.filter((p) => p.id !== item.id),
                      })
                    }
                    className="p-1 text-[#786962] dark:text-[#B5A89F] hover:text-[#A9422D] dark:hover:text-[#D47A63] cursor-pointer print:hidden"
                    aria-label="Xóa món đồ đi sinh"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 print:hidden">
              <input
                type="text"
                value={newBagItem}
                onChange={(e) => setNewBagItem(e.target.value)}
                placeholder="Thêm món vào giỏ đi sinh..."
                className="flex-1 px-3 py-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#4F6B56]"
              />
              <button
                type="button"
                onClick={handleAddBagItem}
                className="min-h-[40px] px-3 py-2 rounded-xl bg-[#4F6B56] hover:bg-[#3F5745] text-white text-xs font-bold cursor-pointer"
                aria-label="Thêm món vào giỏ đi sinh"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </section>
        </div>

        {/* Section 5: Notes & Postpartum Support */}
        <section className="p-4 sm:p-5 bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-3">
          <h2 className="font-editorial text-[16px] font-bold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#9E5B3B] dark:text-[#D7BA86]" />
            <span>Ghi chú cá nhân & Kế hoạch hỗ trợ sau sinh</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#786962] dark:text-[#B5A89F] block mb-1">
                Lưu ý tiền sử / Dị ứng / Ghi chú cho bác sĩ
              </label>
              <textarea
                rows={3}
                value={plan.personalNotes}
                onChange={(e) => setPlan({ ...plan, personalNotes: e.target.value })}
                placeholder="VD: Dị ứng thuốc kháng sinh nhóm..., nhóm máu..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#322622] dark:text-[#F4EDE6] resize-none focus:outline-none focus:border-[#B55841]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#786962] dark:text-[#B5A89F] block mb-1">
                Kế hoạch hỗ trợ mẹ tuần đầu sau sinh
              </label>
              <textarea
                rows={3}
                value={plan.postpartumSupportPlan}
                onChange={(e) => setPlan({ ...plan, postpartumSupportPlan: e.target.value })}
                placeholder="VD: Người chăm ca đêm, chuẩn bị thực đơn ấm cho mẹ..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#322622] dark:text-[#F4EDE6] resize-none focus:outline-none focus:border-[#B55841]"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
