import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Video,
  Users,
  ShoppingBag,
  BellRing,
  Check,
  X,
  RefreshCw,
  BookOpen,
  History,
  Flag,
  Plus,
} from 'lucide-react';
import {
  AuditLogEntry,
  ContentReport,
  DetailedPost,
  LibraryArticle,
  NovaVideoItem,
  OrderInfo,
  ProductItem,
  UserProfile,
  UserRole,
} from '../../types';
import { apiService } from '../../services/apiService';

interface AdminDashboardScreenProps {
  user: UserProfile;
  onBack: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  user: 'Thành viên',
  moderator: 'Điều phối viên',
  admin: 'Quản trị viên',
};

const CONTENT_STATUS_LABELS: Record<string, string> = {
  approved: 'Đã duyệt',
  pending: 'Chờ duyệt',
  rejected: 'Từ chối',
  hidden: 'Đã ẩn',
};

const REPORT_TARGET_LABELS: Record<string, string> = {
  post: 'Bài viết',
  video: 'Video',
  comment: 'Bình luận',
};

const REPORT_STATUS_LABELS: Record<string, string> = {
  open: 'Đang mở',
  resolved_removed: 'Đã gỡ nội dung',
  dismissed: 'Đã bỏ qua',
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  awaiting_verification: 'Chờ xác minh chuyển khoản',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: 'Chưa thanh toán',
  awaiting_verification: 'Chờ xác minh',
  verified: 'Đã xác minh',
  paid: 'Đã thanh toán',
  failed: 'Thất bại',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng',
  vietqr: 'Chuyển khoản VietQR',
  momo: 'Ví MoMo',
  zalopay: 'Ví ZaloPay',
};

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ user, onBack }) => {
  const isStaff = user.role === 'admin' || user.role === 'moderator';
  const isAdmin = user.role === 'admin';

  const [activeTab, setActiveTab] = useState<'moderation' | 'shop' | 'users' | 'broadcast'>('moderation');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [stats, setStats] = useState({
    usersCount: 0,
    pendingVideosCount: 0,
    totalVideosCount: 0,
    postsCount: 0,
    openReportsCount: 0,
    ordersCount: 0,
    pendingOrdersCount: 0,
    outOfStockProductsCount: 0,
  });
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [videos, setVideos] = useState<NovaVideoItem[]>([]);
  const [posts, setPosts] = useState<DetailedPost[]>([]);
  const [articles, setArticles] = useState<LibraryArticle[]>([]);
  const [orders, setOrders] = useState<OrderInfo[]>([]);
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Broadcast state
  const [bcTitle, setBcTitle] = useState('');
  const [bcDesc, setBcDesc] = useState('');

  // Quick Add Product state
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('199000');
  const [newProdStock, setNewProdStock] = useState('20');

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const loadOverview = async () => {
    if (!isStaff) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.fetchAdminOverview(user);
      setStats(data.stats);
      setUsersList(data.users);
      setVideos(data.videos);
      setPosts(data.posts);
      setArticles(data.articles);
      setOrders(data.orders);
      setReports(data.reports);
      setProducts(data.products);
      setAuditLogs(data.auditLogs);
    } catch (err: any) {
      setError(err?.message || 'Không tải được dữ liệu quản trị.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, [user.id, user.role]);

  if (!isStaff) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-nova-bg text-nova-text text-center">
        <ShieldAlert className="w-12 h-12 text-nova-accent mb-3" />
        <h2 className="font-editorial text-lg font-bold text-nova-text">
          Không có quyền truy cập
        </h2>
        <p className="text-xs text-nova-text-muted mt-1.5 max-w-xs leading-relaxed">
          Bảng điều khiển này chỉ dành cho Quản trị viên hoặc Điều phối viên kiểm duyệt nội dung.
        </p>
        <button
          onClick={onBack}
          className="mt-4 min-h-[44px] px-5 py-2.5 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-xs font-bold cursor-pointer transition-colors"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-nova-bg text-nova-text overflow-y-auto no-scrollbar pb-16">
      {toast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-nova-text text-nova-bg text-xs font-bold px-4 py-2.5 rounded-full shadow-xl">
          {toast}
        </div>
      )}

      <header className="px-4 sm:px-6 pt-3 pb-3 flex items-center justify-between gap-3 border-b border-nova-border bg-nova-bg/95 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-nova-surface border border-nova-border flex items-center justify-center text-nova-text-muted hover:bg-nova-bg-subtle cursor-pointer shrink-0 transition-colors"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div className="min-w-0">
            <h1 className="font-editorial text-[17px] font-bold text-nova-text flex items-center gap-1.5 truncate">
              <ShieldCheck className="w-4.5 h-4.5 text-nova-accent shrink-0" />
              <span>Quản trị và kiểm duyệt</span>
            </h1>
            <p className="text-[11px] text-nova-text-muted truncate">
              Vai trò: {ROLE_LABELS[user.role || 'moderator'] || 'Điều phối viên'}
            </p>
          </div>
        </div>
        <button
          onClick={loadOverview}
          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-nova-surface border border-nova-border text-xs font-bold text-nova-text hover:bg-nova-bg-subtle inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-nova-accent ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </header>

      <div className="px-4 sm:px-6 pt-4 space-y-4 max-w-6xl mx-auto w-full">
        {error && (
          <div className="p-3.5 rounded-2xl bg-nova-danger-soft border border-nova-danger-border text-xs text-nova-danger">
            {error}
          </div>
        )}

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Thành viên', value: stats.usersCount, icon: Users, accent: 'text-nova-sage-text' },
            { label: 'Video chờ duyệt', value: stats.pendingVideosCount, icon: Video, accent: 'text-nova-warning' },
            { label: 'Báo cáo đang mở', value: stats.openReportsCount, icon: Flag, accent: 'text-nova-accent' },
            { label: 'Đơn hàng chờ xử lý', value: stats.pendingOrdersCount, icon: ShoppingBag, accent: 'text-nova-accent' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="p-3.5 rounded-2xl bg-nova-surface border border-nova-border shadow-xs"
              >
                <div className="flex items-center justify-between text-xs text-nova-text-muted">
                  <span>{s.label}</span>
                  <Icon className={`w-4 h-4 shrink-0 ${s.accent}`} />
                </div>
                <p className="font-editorial text-2xl font-bold text-nova-text mt-1 tabular-nums">
                  {s.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'moderation' as const, label: 'Kiểm duyệt và báo cáo' },
            { id: 'shop' as const, label: `Đơn hàng và kho (${orders.length})` },
            ...(isAdmin ? [{ id: 'users' as const, label: `Phân quyền (${usersList.length})` }] : []),
            { id: 'broadcast' as const, label: 'Thông báo và nhật ký' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer border transition-colors ${
                activeTab === t.id
                  ? 'bg-nova-accent text-nova-accent-contrast border-nova-accent'
                  : 'bg-nova-surface text-nova-text-muted border-nova-border hover:bg-nova-bg-subtle'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: MODERATION */}
        {activeTab === 'moderation' && (
          <div className="space-y-4">
            {/* Reports Queue */}
            <section className="p-4 sm:p-5 bg-nova-surface rounded-3xl border border-nova-border space-y-3 shadow-xs">
              <h3 className="font-editorial text-[15px] font-bold text-nova-text flex items-center gap-2">
                <Flag className="w-4 h-4 text-nova-accent shrink-0" />
                <span className="tabular-nums">Báo cáo vi phạm cộng đồng và video ({reports.filter((r) => r.status === 'open').length} đang mở)</span>
              </h3>
              {reports.length === 0 ? (
                <p className="text-xs text-nova-text-muted">Chưa có báo cáo vi phạm nào.</p>
              ) : (
                <div className="space-y-2.5">
                  {reports.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-3.5 rounded-2xl bg-nova-bg border border-nova-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="min-w-0">
                        <span className="text-[10.5px] font-bold uppercase tracking-wide text-nova-accent">
                          {REPORT_TARGET_LABELS[rep.targetType] || rep.targetType} · {REPORT_STATUS_LABELS[rep.status] || rep.status}
                        </span>
                        <p className="text-xs font-bold text-nova-text truncate mt-0.5">{rep.targetTitle}</p>
                        <p className="text-[11px] text-nova-text-muted">
                          Lý do: {rep.reason} · Báo bởi {rep.reporterName}
                        </p>
                      </div>
                      {rep.status === 'open' && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={async () => {
                              await apiService.resolveContentReport(rep.id, 'resolved_removed', 'Đã gỡ theo báo cáo', user);
                              notify('Đã gỡ nội dung vi phạm.');
                              loadOverview();
                            }}
                            className="min-h-[36px] px-3 py-1.5 rounded-xl bg-nova-danger hover:opacity-90 text-[#FAF9F6] text-[11px] font-bold cursor-pointer whitespace-nowrap transition-opacity"
                          >
                            Gỡ nội dung
                          </button>
                          <button
                            onClick={async () => {
                              await apiService.resolveContentReport(rep.id, 'dismissed', 'Nội dung hợp lệ', user);
                              notify('Đã bỏ qua báo cáo.');
                              loadOverview();
                            }}
                            className="min-h-[36px] px-3 py-1.5 rounded-xl bg-nova-sage hover:opacity-90 text-nova-accent-contrast text-[11px] font-bold cursor-pointer whitespace-nowrap transition-opacity"
                          >
                            Bỏ qua
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Videos Moderation */}
            <section className="p-4 sm:p-5 bg-nova-surface rounded-3xl border border-nova-border space-y-3 shadow-xs">
              <h3 className="font-editorial text-[15px] font-bold text-nova-text flex items-center gap-2">
                <Video className="w-4 h-4 text-nova-warning shrink-0" />
                <span className="tabular-nums">Kiểm duyệt video thai giáo ({videos.length})</span>
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
                {videos.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 rounded-2xl bg-nova-bg border border-nova-border flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-nova-text truncate">{v.title}</p>
                      <p className="text-[11px] text-nova-text-muted">
                        {v.channelName} · Trạng thái: <strong className="text-nova-text">{CONTENT_STATUS_LABELS[v.status || 'approved'] || v.status}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {v.status !== 'approved' && (
                        <button
                          onClick={async () => {
                            await apiService.moderateVideo(v.id, 'approved', undefined, user);
                            notify('Đã duyệt video.');
                            loadOverview();
                          }}
                          className="w-9 h-9 rounded-xl bg-nova-sage hover:opacity-90 text-nova-accent-contrast flex items-center justify-center cursor-pointer transition-opacity"
                          title="Duyệt"
                          aria-label="Duyệt video"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {v.status !== 'rejected' && (
                        <button
                          onClick={async () => {
                            await apiService.moderateVideo(v.id, 'rejected', 'Chưa phù hợp quy chuẩn', user);
                            notify('Đã từ chối video.');
                            loadOverview();
                          }}
                          className="w-9 h-9 rounded-xl bg-nova-danger hover:opacity-90 text-[#FAF9F6] flex items-center justify-center cursor-pointer transition-opacity"
                          title="Từ chối"
                          aria-label="Từ chối video"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Posts & Library Moderation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="p-4 sm:p-5 bg-nova-surface rounded-3xl border border-nova-border space-y-2.5 shadow-xs">
                <h3 className="font-editorial text-[15px] font-bold text-nova-text tabular-nums">
                  Bài viết cộng đồng ({posts.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                  {posts.slice(0, 10).map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-nova-bg border border-nova-border text-xs flex justify-between items-center gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-nova-text truncate">{p.title}</p>
                        <p className="text-[10.5px] text-nova-text-muted">
                          {p.author} · {CONTENT_STATUS_LABELS[p.status || 'approved'] || p.status}
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          await apiService.moderateCommunityPost(p.id, 'approved', !p.isFeatured, user);
                          notify(p.isFeatured ? 'Đã bỏ ghim bài viết.' : 'Đã ghim nổi bật bài viết.');
                          loadOverview();
                        }}
                        className={`min-h-[34px] px-2.5 py-1 rounded-xl text-[10.5px] font-bold cursor-pointer shrink-0 whitespace-nowrap transition-colors ${
                          p.isFeatured
                            ? 'bg-nova-warning-soft text-nova-warning border border-nova-warning-border'
                            : 'bg-nova-text text-nova-bg'
                        }`}
                      >
                        {p.isFeatured ? 'Bỏ ghim' : 'Ghim nổi bật'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="p-4 sm:p-5 bg-nova-surface rounded-3xl border border-nova-border space-y-2.5 shadow-xs">
                <h3 className="font-editorial text-[15px] font-bold text-nova-text flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-nova-sage-text shrink-0" />
                  <span className="tabular-nums">Bài thư viện y khoa ({articles.length})</span>
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                  {articles.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 rounded-2xl bg-nova-bg border border-nova-border text-xs flex justify-between items-center gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-nova-text truncate">{a.title}</p>
                        <p className="text-[10.5px] text-nova-text-muted">
                          Trạng thái: {CONTENT_STATUS_LABELS[a.status || 'approved'] || a.status}
                        </p>
                      </div>
                      {a.status !== 'approved' && (
                        <button
                          onClick={async () => {
                            await apiService.moderateLibraryArticle(a.id, 'approved', user);
                            notify('Đã duyệt bài thư viện.');
                            loadOverview();
                          }}
                          className="min-h-[34px] px-2.5 py-1 rounded-xl bg-nova-sage hover:opacity-90 text-nova-accent-contrast text-[10.5px] font-bold cursor-pointer shrink-0 whitespace-nowrap transition-opacity"
                        >
                          Duyệt
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* TAB 2: SHOP & ORDERS */}
        {activeTab === 'shop' && (
          <div className="space-y-4">
            <section className="p-4 sm:p-5 bg-nova-surface rounded-3xl border border-nova-border space-y-3 shadow-xs">
              <h3 className="font-editorial text-[15px] font-bold text-nova-text tabular-nums">
                Quản lý đơn hàng ({orders.length})
              </h3>
              {orders.length === 0 ? (
                <p className="text-xs text-nova-text-muted">Chưa có đơn hàng nào được tạo trên hệ thống.</p>
              ) : (
                <div className="space-y-2.5">
                  {orders.map((ord) => (
                    <div
                      key={ord.orderId}
                      className="p-3.5 rounded-2xl bg-nova-bg border border-nova-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-nova-text tabular-nums">
                          {ord.orderId} · <span className="text-nova-accent">{ord.totalAmount.toLocaleString('vi-VN')}đ</span>
                        </p>
                        <p className="text-[11px] text-nova-text-muted">
                          Khách: {ord.shippingAddress.fullName} · Phương thức: {PAYMENT_METHOD_LABELS[ord.paymentMethod] || ord.paymentMethod} · Trạng thái: {ORDER_STATUS_LABELS[ord.status] || ord.status} ({PAYMENT_STATUS_LABELS[ord.paymentStatus || 'unpaid'] || ord.paymentStatus})
                        </p>
                      </div>
                      {isAdmin && (
                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                          {ord.paymentStatus === 'awaiting_verification' && (
                            <button
                              onClick={async () => {
                                await apiService.updateOrderStatus(ord.orderId, 'confirmed', 'verified', user);
                                notify('Đã xác minh chuyển khoản VietQR và xác nhận đơn.');
                                loadOverview();
                              }}
                              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-nova-sage hover:opacity-90 text-nova-accent-contrast text-[11px] font-bold cursor-pointer whitespace-nowrap transition-opacity"
                            >
                              Xác minh VietQR
                            </button>
                          )}
                          <select
                            value={ord.status}
                            onChange={async (e) => {
                              await apiService.updateOrderStatus(ord.orderId, e.target.value as OrderInfo['status'], undefined, user);
                              notify(`Đã cập nhật trạng thái đơn ${ord.orderId}.`);
                              loadOverview();
                            }}
                            className="min-h-[36px] px-2.5 py-1.5 rounded-xl bg-nova-surface border border-nova-border text-[11px] font-bold text-nova-text focus:outline-none focus:border-nova-accent"
                          >
                            <option value="pending">Chờ xác nhận</option>
                            <option value="awaiting_verification">Chờ xác minh chuyển khoản</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="shipping">Đang giao</option>
                            <option value="delivered">Đã giao</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {isAdmin && (
              <section className="p-4 sm:p-5 bg-nova-surface rounded-3xl border border-nova-border space-y-3 shadow-xs">
                <h3 className="font-editorial text-[15px] font-bold text-nova-text tabular-nums">
                  Quản lý kho sản phẩm ({products.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="Tên sản phẩm mới..."
                    className="sm:col-span-2 px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text placeholder:text-nova-text-muted focus:outline-none focus:border-nova-accent"
                  />
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="Giá (đồng)"
                    className="px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text placeholder:text-nova-text-muted tabular-nums focus:outline-none focus:border-nova-accent"
                  />
                  <button
                    onClick={async () => {
                      if (!newProdName.trim()) return;
                      await apiService.upsertProduct(
                        { name: newProdName.trim(), price: Number(newProdPrice), stockCount: Number(newProdStock) || 10 },
                        user
                      );
                      setNewProdName('');
                      notify('Đã thêm sản phẩm mới vào kho.');
                      loadOverview();
                    }}
                    className="min-h-[40px] px-3 py-2 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-xs font-bold cursor-pointer inline-flex items-center justify-center gap-1 whitespace-nowrap transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Thêm sản phẩm
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto no-scrollbar">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-nova-bg border border-nova-border flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-nova-text truncate">{p.name}</p>
                        <p className="text-[11px] text-nova-text-muted tabular-nums">
                          {p.formattedPrice} · Kho: {p.stockCount ?? (p.inStock ? 'Còn' : 'Hết')}
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          await apiService.upsertProduct(
                            { id: p.id, inStock: !p.inStock, stockCount: p.inStock ? 0 : 15 },
                            user
                          );
                          notify('Đã cập nhật trạng thái tồn kho.');
                          loadOverview();
                        }}
                        className={`min-h-[34px] px-2.5 py-1 rounded-xl text-[10.5px] font-bold cursor-pointer shrink-0 whitespace-nowrap transition-colors ${
                          p.inStock
                            ? 'bg-nova-sage-soft text-nova-sage-text border border-nova-border'
                            : 'bg-nova-danger-soft text-nova-danger border border-nova-danger-border'
                        }`}
                      >
                        {p.inStock ? 'Đang bán' : 'Hết hàng'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* TAB 3: USERS & ROLES */}
        {activeTab === 'users' && isAdmin && (
          <section className="p-4 sm:p-5 bg-nova-surface rounded-3xl border border-nova-border space-y-3 shadow-xs">
            <h3 className="font-editorial text-[15px] font-bold text-nova-text">
              Danh sách tài khoản và phân quyền
            </h3>
            <div className="space-y-2.5">
              {usersList.map((u) => (
                <div
                  key={u.id}
                  className="p-3.5 rounded-2xl bg-nova-bg border border-nova-border flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-nova-text truncate">{u.name}</p>
                    <p className="text-[11px] text-nova-text-muted truncate tabular-nums">{u.email || u.phone}</p>
                  </div>
                  <select
                    value={u.role || 'user'}
                    disabled={u.id === user.id}
                    onChange={async (e) => {
                      const nextRole = e.target.value as UserRole;
                      await apiService.updateUserRole(u.id, nextRole, user);
                      notify(`Đã đổi quyền ${u.name} thành ${ROLE_LABELS[nextRole] || nextRole}.`);
                      loadOverview();
                    }}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl bg-nova-surface border border-nova-border text-xs font-bold text-nova-text disabled:opacity-60 focus:outline-none focus:border-nova-accent"
                  >
                    <option value="user">Thành viên</option>
                    <option value="moderator">Điều phối viên</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 4: BROADCAST & AUDIT LOGS */}
        {activeTab === 'broadcast' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isAdmin && (
              <section className="p-4 sm:p-5 bg-nova-surface rounded-3xl border border-nova-border space-y-3 shadow-xs">
                <h3 className="font-editorial text-[15px] font-bold text-nova-text flex items-center gap-1.5">
                  <BellRing className="w-4 h-4 text-nova-accent shrink-0" />
                  <span>Gửi thông báo toàn hệ thống</span>
                </h3>
                <input
                  type="text"
                  value={bcTitle}
                  onChange={(e) => setBcTitle(e.target.value)}
                  placeholder="Tiêu đề thông báo..."
                  className="w-full px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text placeholder:text-nova-text-muted focus:outline-none focus:border-nova-accent"
                />
                <textarea
                  rows={3}
                  value={bcDesc}
                  onChange={(e) => setBcDesc(e.target.value)}
                  placeholder="Nội dung thông báo gửi tới các mẹ bầu..."
                  className="w-full px-3 py-2.5 rounded-xl bg-nova-bg border border-nova-border text-xs text-nova-text placeholder:text-nova-text-muted resize-none focus:outline-none focus:border-nova-accent"
                />
                <button
                  onClick={async () => {
                    if (!bcTitle.trim() || !bcDesc.trim()) return;
                    const res = await apiService.sendAdminBroadcast(bcTitle, bcDesc, user);
                    setBcTitle('');
                    setBcDesc('');
                    notify(`Đã gửi tới ${res.sentCount} tài khoản.`);
                    loadOverview();
                  }}
                  className="w-full min-h-[44px] py-2.5 rounded-xl bg-nova-accent hover:bg-nova-accent-hover text-nova-accent-contrast text-xs font-bold cursor-pointer transition-colors"
                >
                  Gửi thông báo hệ thống
                </button>
              </section>
            )}

            <section className="p-4 sm:p-5 bg-nova-surface rounded-3xl border border-nova-border space-y-3 shadow-xs">
              <h3 className="font-editorial text-[15px] font-bold text-nova-text flex items-center gap-1.5">
                <History className="w-4 h-4 text-nova-sage-text shrink-0" />
                <span className="tabular-nums">Nhật ký kiểm duyệt và quản trị ({auditLogs.length})</span>
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-nova-text-muted">Chưa có nhật ký hoạt động quản trị.</p>
                ) : (
                  auditLogs.slice(0, 20).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-2xl bg-nova-bg border border-nova-border text-xs"
                    >
                      <p className="font-bold text-nova-text">
                        {log.actorName} ({ROLE_LABELS[log.actorRole] || log.actorRole}) · {log.action}
                      </p>
                      <p className="text-[11px] text-nova-text-muted mt-0.5 leading-relaxed">{log.details}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
