import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Copy,
  UserPlus,
  Ban,
  Eye,
  Calendar,
  CheckSquare,
  CheckCircle2,
  Circle,
  Camera,
  Lock,
} from 'lucide-react';
import {
  FamilyConnection,
  FamilySharePermissions,
  UserProfile,
  ChecklistItem,
  MemoryEntry,
  HealthDiaryEntry,
} from '../../types';
import { ECOSYSTEM_BANNERS } from '../../data/ecosystemData';
import { apiService } from '../../services/apiService';
import { NovaImage } from '../NovaBrandMark';

interface FamilyScreenProps {
  user?: UserProfile;
}

const DEFAULT_PERMS: FamilySharePermissions = {
  shareAppointments: true,
  shareChecklist: true,
  shareMilestones: true,
  shareMemories: true,
  shareSensitiveHealth: false,
};

export const FamilyScreen: React.FC<FamilyScreenProps> = ({ user }) => {
  const userId = user?.id || 'usr-1';
  const [connections, setConnections] = useState<FamilyConnection[]>([]);
  const [inviteName, setInviteName] = useState('');
  const [inviteRelation, setInviteRelation] = useState('Chồng / Bạn đời');
  const [invitePerms, setInvitePerms] = useState<FamilySharePermissions>(DEFAULT_PERMS);

  const [joinCode, setJoinCode] = useState('');
  const [snapshotModal, setSnapshotModal] = useState<{
    connection: FamilyConnection;
    ownerProfile: Partial<UserProfile>;
    milestones?: number[];
    checklists?: ChecklistItem[];
    memories?: MemoryEntry[];
    sensitiveDiary?: Record<string, HealthDiaryEntry>;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const loadConnections = async () => {
    try {
      const list = await apiService.fetchFamilyConnections(user);
      setConnections(list);
    } catch {}
  };

  useEffect(() => {
    loadConnections();
  }, [userId]);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim()) {
      showToast('Vui lòng nhập tên người thân');
      return;
    }
    try {
      const conn = await apiService.createFamilyInvite(
        {
          memberName: inviteName.trim(),
          relationship: inviteRelation,
          permissions: invitePerms,
        },
        user
      );
      setConnections((prev) => [conn, ...prev]);
      setInviteName('');
      setInvitePerms(DEFAULT_PERMS);
      showToast(`Đã tạo mã mời ${conn.inviteCode}`);
    } catch (err: any) {
      showToast(err?.message || 'Không tạo được lời mời');
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    try {
      const conn = await apiService.joinFamilyByCode(joinCode.trim(), user);
      await loadConnections();
      setJoinCode('');
      showToast(`Đã kết nối gia đình với ${conn.ownerName}!`);
    } catch (err: any) {
      showToast(err?.message || 'Mã mời không hợp lệ hoặc đã bị thu hồi.');
    }
  };

  const handleTogglePerm = async (
    conn: FamilyConnection,
    key: keyof FamilySharePermissions
  ) => {
    try {
      const updated = await apiService.updateFamilyPermissions(
        conn.id,
        { [key]: !conn.permissions[key] },
        user
      );
      setConnections((prev) => prev.map((c) => (c.id === conn.id ? updated : c)));
      showToast('Đã cập nhật quyền chia sẻ');
    } catch (err: any) {
      showToast(err?.message || 'Không thể cập nhật quyền');
    }
  };

  const handleRevoke = async (connId: string) => {
    try {
      const updated = await apiService.revokeFamilyConnection(connId, user);
      setConnections((prev) => prev.map((c) => (c.id === connId ? updated : c)));
      showToast('Đã thu hồi quyền truy cập ngay lập tức');
    } catch (err: any) {
      showToast(err?.message || 'Thu hồi thất bại');
    }
  };

  const handleOpenSnapshot = async (conn: FamilyConnection) => {
    try {
      const snap = await apiService.fetchSharedFamilySnapshot(conn.id, user);
      setSnapshotModal(snap);
    } catch (err: any) {
      showToast(err?.message || 'Không thể xem bảng tin chia sẻ.');
    }
  };

  const ownerConns = connections.filter((c) => c.ownerId === userId);
  const memberConns = connections.filter((c) => c.ownerId !== userId && c.memberId === userId);

  const permLabels: { key: keyof FamilySharePermissions; label: string; warn?: boolean }[] = [
    { key: 'shareMilestones', label: 'Mốc phát triển thai kỳ' },
    { key: 'shareAppointments', label: 'Lịch khám và chuẩn bị' },
    { key: 'shareChecklist', label: 'Sổ chuẩn bị mẹ và bé' },
    { key: 'shareMemories', label: 'Kỷ niệm ảnh gia đình' },
    {
      key: 'shareSensitiveHealth',
      label: 'Nhật ký sức khỏe và triệu chứng nhạy cảm (Mặc định tắt)',
      warn: true,
    },
  ];

  return (
    <div className="flex-1 flex flex-col px-4 sm:px-6 pt-3 pb-8 overflow-y-auto no-scrollbar bg-nova-bg text-nova-text">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-nova-text text-nova-bg px-4 py-2 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-nova-border mb-5 h-36 sm:h-44">
        <NovaImage
          src={ECOSYSTEM_BANNERS.familyBanner}
          alt="Gia đình Nova"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C1B18]/80 via-[#1C1B18]/45 to-transparent p-5 flex flex-col justify-end text-[#FAF9F6]">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#EDE7DE]">
            Gia đình Nova · Chia sẻ có kiểm soát
          </span>
          <h1 className="font-editorial text-xl sm:text-2xl font-bold mt-0.5">Đồng hành cùng gia đình</h1>
          <p className="text-xs text-[#FAF9F6]/85 max-w-md mt-1">
            Mời chồng hoặc người thân theo dõi hành trình thai kỳ. Mẹ toàn quyền chọn mục chia sẻ và thu hồi bất kỳ lúc nào.
          </p>
        </div>
      </div>

      {/* Create Invite & Join by Code */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <form
          onSubmit={handleCreateInvite}
          className="bg-nova-surface rounded-3xl p-5 border border-nova-border space-y-3"
        >
          <div className="flex items-center gap-2">
            <UserPlus className="w-4.5 h-4.5 text-nova-accent" />
            <h2 className="font-editorial text-[16px] font-bold">Mời người thân (Chồng / Ông bà)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Tên người thân (Ví dụ: Anh Minh)"
              className="px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text focus:outline-none focus:border-nova-accent"
            />
            <select
              value={inviteRelation}
              onChange={(e) => setInviteRelation(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs font-semibold text-nova-text focus:outline-none focus:border-nova-accent"
            >
              <option>Chồng / Bạn đời</option>
              <option>Mẹ / Bà ngoại</option>
              <option>Bố mẹ nội</option>
              <option>Người thân hỗ trợ</option>
            </select>
          </div>

          <div className="p-3 rounded-2xl bg-nova-bg border border-nova-border space-y-1.5">
            <p className="text-[11px] font-bold text-nova-text-muted">Quyền được xem mặc định:</p>
            {permLabels.map((p) => (
              <label key={p.key} className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={invitePerms[p.key]}
                  onChange={(e) =>
                    setInvitePerms((prev) => ({ ...prev, [p.key]: e.target.checked }))
                  }
                  className="accent-nova-accent"
                />
                <span className={p.warn ? 'text-nova-accent font-semibold' : 'text-nova-text'}>{p.label}</span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="w-full min-h-[44px] py-2.5 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-xs font-bold cursor-pointer shadow-xs transition-colors"
          >
            Tạo mã mời gia đình
          </button>
        </form>

        <form
          onSubmit={handleJoinByCode}
          className="bg-nova-surface rounded-3xl p-5 border border-nova-border flex flex-col justify-between gap-3"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4.5 h-4.5 text-nova-sage-text" />
              <h2 className="font-editorial text-[16px] font-bold">Tham gia bằng mã mời từ mẹ bầu</h2>
            </div>
            <p className="text-xs text-nova-text-muted leading-relaxed">
              Nếu bạn là chồng hoặc người thân được chia sẻ hành trình, hãy nhập mã dạng <code className="font-bold text-nova-text">NOVA-XXXX</code> để xem các thông tin được mẹ cho phép.
            </p>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã mời (Ví dụ: NOVA-7281)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs font-bold tracking-wider uppercase text-nova-text focus:outline-none focus:border-nova-sage"
            />
          </div>

          <button
            type="submit"
            className="w-full min-h-[44px] py-2.5 rounded-xl bg-nova-sage hover:opacity-90 text-nova-accent-contrast text-xs font-bold cursor-pointer shadow-xs transition-opacity"
          >
            Kết nối bằng mã mời
          </button>
        </form>
      </div>

      {/* Owner's shared connections */}
      <section className="mb-6">
        <h3 className="font-editorial text-[16px] font-bold mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-nova-sage-text" /> Người thân đang kết nối với hồ sơ của mẹ ({ownerConns.length})
        </h3>
        {ownerConns.length === 0 ? (
          <div className="p-6 bg-nova-surface rounded-3xl border border-dashed border-nova-border text-center text-xs text-nova-text-muted">
            Mẹ chưa chia sẻ hồ sơ với người thân nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {ownerConns.map((conn) => (
              <div
                key={conn.id}
                className={`bg-nova-surface rounded-3xl p-4 border ${
                  conn.status === 'revoked'
                    ? 'border-nova-danger-border opacity-65'
                    : 'border-nova-border'
                } space-y-3`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-nova-text">{conn.memberName}</h4>
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-nova-bg-subtle text-nova-text-muted">
                        {conn.relationship}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono font-bold text-nova-sage-text">{conn.inviteCode}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(conn.inviteCode).catch(() => {});
                          showToast(`Đã sao chép mã ${conn.inviteCode}`);
                        }}
                        className="text-[10.5px] text-nova-text-muted hover:text-nova-text inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" /> Chép mã
                      </button>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                      conn.status === 'active'
                        ? 'bg-nova-sage-soft text-nova-sage-text border border-nova-border'
                        : conn.status === 'revoked'
                        ? 'bg-nova-danger-soft text-nova-danger border border-nova-danger-border'
                        : 'bg-nova-warning-soft text-nova-warning border border-nova-warning-border'
                    }`}
                  >
                    {conn.status === 'active'
                      ? 'Đang kết nối'
                      : conn.status === 'revoked'
                      ? 'Đã thu hồi'
                      : 'Chờ tham gia'}
                  </span>
                </div>

                {conn.status !== 'revoked' && (
                  <>
                    <div className="space-y-1.5 pt-2 border-t border-nova-border">
                      {permLabels.map((p) => (
                        <label key={p.key} className="flex items-center justify-between text-xs cursor-pointer py-0.5">
                          <span className={p.warn ? 'text-nova-accent font-semibold pr-2' : 'pr-2 text-nova-text'}>{p.label}</span>
                          <input
                            type="checkbox"
                            checked={conn.permissions[p.key]}
                            onChange={() => handleTogglePerm(conn, p.key)}
                            className="accent-nova-accent w-4 h-4 shrink-0"
                          />
                        </label>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-nova-border">
                      <button
                        type="button"
                        onClick={() => handleOpenSnapshot(conn)}
                        className="flex-1 min-h-[40px] py-2 rounded-xl bg-nova-bg border border-nova-border text-xs font-bold flex items-center justify-center gap-1 cursor-pointer hover:bg-nova-bg-subtle text-nova-text"
                      >
                        <Eye className="w-3.5 h-3.5" /> Xem bản chia sẻ
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRevoke(conn.id)}
                        className="min-h-[40px] px-3 py-2 rounded-xl bg-nova-danger-soft border border-nova-danger-border text-nova-danger text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <Ban className="w-3.5 h-3.5" /> Thu hồi
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Member view of shared journeys */}
      {memberConns.length > 0 && (
        <section>
          <h3 className="font-editorial text-[16px] font-bold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-nova-sage-text" /> Hành trình được chia sẻ với bạn ({memberConns.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {memberConns.map((conn) => (
              <div
                key={conn.id}
                className="bg-nova-surface rounded-3xl p-4 border border-nova-border flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-sm font-bold text-nova-text">Mẹ bầu {conn.ownerName}</h4>
                  <p className="text-xs text-nova-text-muted mt-0.5">Vai trò: {conn.relationship}</p>
                </div>
                {conn.status === 'active' ? (
                  <button
                    onClick={() => handleOpenSnapshot(conn)}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl bg-nova-sage hover:opacity-90 text-nova-accent-contrast text-xs font-bold cursor-pointer whitespace-nowrap transition-opacity"
                  >
                    Xem hành trình
                  </button>
                ) : (
                  <span className="text-xs font-bold text-nova-danger">Đã thu hồi quyền</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Snapshot Modal */}
      <AnimatePresence>
        {snapshotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1B18]/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="w-full max-w-xl max-h-[88vh] bg-nova-surface-elevated text-nova-text rounded-3xl p-5 shadow-2xl border border-nova-border flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-nova-border mb-3">
                <div>
                  <h3 className="font-editorial text-[17px] font-bold">Hành trình của {snapshotModal.ownerProfile.name}</h3>
                  <p className="text-xs text-nova-text-muted tabular-nums">
                    Tuần {snapshotModal.ownerProfile.pregnancyWeek} · Dự sinh {snapshotModal.ownerProfile.dueDate}
                  </p>
                </div>
                <button
                  onClick={() => setSnapshotModal(null)}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-nova-bg border border-nova-border text-xs font-bold cursor-pointer text-nova-text"
                >
                  Đóng
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
                {snapshotModal.milestones && (
                  <div className="p-3.5 rounded-2xl bg-nova-bg border border-nova-border">
                    <p className="text-xs font-bold flex items-center gap-1.5 mb-1">
                      <Calendar className="w-4 h-4 text-nova-accent" /> Cột mốc đã đánh dấu
                    </p>
                    <p className="text-xs text-nova-text-muted tabular-nums">
                      {snapshotModal.milestones.length > 0
                        ? `Tuần: ${snapshotModal.milestones.join(', ')}`
                        : 'Chưa đánh dấu cột mốc nào.'}
                    </p>
                  </div>
                )}

                {snapshotModal.checklists && (
                  <div className="p-3.5 rounded-2xl bg-nova-bg border border-nova-border">
                    <p className="text-xs font-bold flex items-center gap-1.5 mb-1.5 tabular-nums">
                      <CheckSquare className="w-4 h-4 text-nova-sage-text" /> Sổ chuẩn bị ({snapshotModal.checklists.filter((c) => c.completed).length}/{snapshotModal.checklists.length})
                    </p>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {snapshotModal.checklists.slice(0, 6).map((c) => (
                        <p key={c.id} className="text-xs text-nova-text-muted flex items-center gap-1.5">
                          {c.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-nova-sage-text shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-nova-icon shrink-0" />
                          )}
                          <span>{c.title}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {snapshotModal.memories && (
                  <div className="p-3.5 rounded-2xl bg-nova-bg border border-nova-border">
                    <p className="text-xs font-bold flex items-center gap-1.5 mb-1 tabular-nums">
                      <Camera className="w-4 h-4 text-nova-warning" /> Kỷ niệm gia đình ({snapshotModal.memories.length})
                    </p>
                    {snapshotModal.memories.map((m) => (
                      <div key={m.id} className="text-xs py-1.5 border-b border-nova-border last:border-0">
                        <span className="font-bold">{m.title}</span> — <span className="text-nova-text-muted tabular-nums">{m.memoryDate}</span>
                      </div>
                    ))}
                  </div>
                )}

                {!snapshotModal.connection.permissions.shareSensitiveHealth ? (
                  <div className="p-3 rounded-2xl bg-nova-bg-subtle border border-nova-border flex items-center gap-2 text-xs text-nova-text-muted">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>Nhật ký triệu chứng và sức khỏe nhạy cảm đang được giữ riêng tư bởi mẹ bầu.</span>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-nova-warning-soft border border-nova-warning-border space-y-1">
                    <p className="text-xs font-bold flex items-center gap-1.5 text-nova-warning">
                      <ShieldAlert className="w-4 h-4" /> Nhật ký sức khỏe (Được mẹ cấp quyền)
                    </p>
                    <p className="text-xs text-nova-text tabular-nums">
                      Số ngày có nhật ký: {Object.keys(snapshotModal.sensitiveDiary || {}).length} ngày
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
