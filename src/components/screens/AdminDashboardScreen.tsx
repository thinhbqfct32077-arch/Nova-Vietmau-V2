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
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#FAF6F0] dark:bg-[#161311] text-[#322622] dark:text-[#F4EDE6] text-center">
        <ShieldAlert className="w-12 h-12 text-[#B55841] dark:text-[#D47A63] mb-3" />
        <h2 className="font-editorial text-lg font-bold text-[#322622] dark:text-[#F4EDE6]">
          Không có quyền truy cập (403)
        </h2>
        <p className="text-xs text-[#786962] dark:text-[#B5A89F] mt-1.5 max-w-xs leading-relaxed">
          Bảng điều khiển này chỉ dành cho Quản trị viên hoặc Kiểm duyệt viên nội dung.
        </p>
        <button
          onClick={onBack}
          className="mt-4 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#B55841] hover:bg-[#9E4A35] text-white text-xs font-bold cursor-pointer transition-colors"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#FAF6F0] dark:bg-[#161311] text-[#322622] dark:text-[#F4EDE6] overflow-y-auto no-scrollbar pb-16">
      {toast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#322622] dark:bg-[#F4EDE6] text-white dark:text-[#161311] text-xs font-bold px-4 py-2.5 rounded-full shadow-xl">
          {toast}
        </div>
      )}

      <header className="px-4 sm:px-6 pt-3 pb-3 flex items-center justify-between gap-3 border-b border-[#E6DDD1] dark:border-[#362E2A] bg-[#FAF6F0]/95 dark:bg-[#161311]/95 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-center text-[#6B5D56] dark:text-[#C5B9B0] hover:bg-[#F2ECE3] dark:hover:bg-[#231E1B] cursor-pointer shrink-0 transition-colors"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div className="min-w-0">
            <h1 className="font-editorial text-[17px] font-bold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-1.5 truncate">
              <ShieldCheck className="w-4.5 h-4.5 text-[#B55841] dark:text-[#D47A63] shrink-0" />
              <span>Quản trị & Kiểm duyệt</span>
            </h1>
            <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] truncate">
              Vai trò: {user.role === 'admin' ? 'Quản trị viên (Admin)' : 'Kiểm duyệt viên (Moderator)'}
            </p>
          </div>
        </div>
        <button
          onClick={loadOverview}
          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] text-xs font-bold text-[#322622] dark:text-[#F4EDE6] hover:bg-[#F2ECE3] dark:hover:bg-[#231E1B] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#B55841] dark:text-[#D47A63] ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </header>

      <div className="px-4 sm:px-6 pt-4 space-y-4 max-w-6xl mx-auto w-full">
        {error && (
          <div className="p-3.5 rounded-2xl bg-[#F7EAE5] dark:bg-[#35231E] border border-[#EBCDC2] dark:border-[#52352D] text-xs text-[#A9422D] dark:text-[#E5927D]">
            {error}
          </div>
        )}

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Thành viên', value: stats.usersCount, icon: Users, accent: 'text-[#4F6B56] dark:text-[#8DA892]' },
            { label: 'Video chờ duyệt', value: stats.pendingVideosCount, icon: Video, accent: 'text-[#9E5B3B] dark:text-[#D7BA86]' },
            { label: 'Báo cáo đang mở', value: stats.openReportsCount, icon: Flag, accent: 'text-[#B55841] dark:text-[#D47A63]' },
            { label: 'Đơn hàng chờ xử lý', value: stats.pendingOrdersCount, icon: ShoppingBag, accent: 'text-[#B55841] dark:text-[#D47A63]' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] shadow-xs"
              >
                <div className="flex items-center justify-between text-xs text-[#786962] dark:text-[#B5A89F]">
                  <span>{s.label}</span>
                  <Icon className={`w-4 h-4 shrink-0 ${s.accent}`} />
                </div>
                <p className="font-editorial text-2xl font-bold text-[#322622] dark:text-[#F4EDE6] mt-1 tabular-nums">
                  {s.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'moderation' as const, label: 'Kiểm duyệt & Báo cáo' },
            { id: 'shop' as const, label: `Đơn hàng & Kho (${orders.length})` },
            ...(isAdmin ? [{ id: 'users' as const, label: `Phân quyền (${usersList.length})` }] : []),
            { id: 'broadcast' as const, label: 'Thông báo & Nhật ký' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer border transition-colors ${
                activeTab === t.id
                  ? 'bg-[#B55841] text-white border-[#B55841]'
                  : 'bg-white dark:bg-[#1E1A17] text-[#6B5D56] dark:text-[#C5B9B0] border-[#E6DDD1] dark:border-[#362E2A] hover:bg-[#F2ECE3] dark:hover:bg-[#231E1B]'
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
            <section className="p-4 sm:p-5 bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-3 shadow-xs">
              <h3 className="font-editorial text-[15px] font-bold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-2">
                <Flag className="w-4 h-4 text-[#B55841] dark:text-[#D47A63] shrink-0" />
                <span className="tabular-nums">Báo cáo vi phạm cộng đồng / video ({reports.filter((r) => r.status === 'open').length} đang mở)</span>
              </h3>
              {reports.length === 0 ? (
                <p className="text-xs text-[#786962] dark:text-[#B5A89F]">Chưa có báo cáo vi phạm nào.</p>
              ) : (
                <div className="space-y-2.5">
                  {reports.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="min-w-0">
                        <span className="text-[10.5px] font-bold uppercase tracking-wide text-[#B55841] dark:text-[#D47A63]">
                          {rep.targetType} · {rep.status}
                        </span>
                        <p className="text-xs font-bold text-[#322622] dark:text-[#F4EDE6] truncate mt-0.5">{rep.targetTitle}</p>
                        <p className="text-[11px] text-[#6B5D56] dark:text-[#C5B9B0]">
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
                            className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[#A9422D] hover:bg-[#933825] text-white text-[11px] font-bold cursor-pointer whitespace-nowrap transition-colors"
                          >
                            Gỡ nội dung
                          </button>
                          <button
                            onClick={async () => {
                              await apiService.resolveContentReport(rep.id, 'dismissed', 'Nội dung hợp lệ', user);
                              notify('Đã bỏ qua báo cáo.');
                              loadOverview();
                            }}
                            className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[#4F6B56] hover:bg-[#3F5745] text-white text-[11px] font-bold cursor-pointer whitespace-nowrap transition-colors"
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
            <section className="p-4 sm:p-5 bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-3 shadow-xs">
              <h3 className="font-editorial text-[15px] font-bold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-2">
                <Video className="w-4 h-4 text-[#9E5B3B] dark:text-[#D7BA86] shrink-0" />
                <span className="tabular-nums">Kiểm duyệt Video thai giáo ({videos.length})</span>
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
                {videos.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 rounded-2xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-[#322622] dark:text-[#F4EDE6] truncate">{v.title}</p>
                      <p className="text-[11px] text-[#786962] dark:text-[#B5A89F]">
                        {v.channelName} · Trạng thái: <strong className="text-[#322622] dark:text-[#F4EDE6]">{v.status}</strong>
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
                          className="w-9 h-9 rounded-xl bg-[#4F6B56] hover:bg-[#3F5745] text-white flex items-center justify-center cursor-pointer transition-colors"
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
                          className="w-9 h-9 rounded-xl bg-[#A9422D] hover:bg-[#933825] text-white flex items-center justify-center cursor-pointer transition-colors"
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
              <section className="p-4 sm:p-5 bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-2.5 shadow-xs">
                <h3 className="font-editorial text-[15px] font-bold text-[#322622] dark:text-[#F4EDE6] tabular-nums">
                  Bài viết cộng đồng ({posts.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                  {posts.slice(0, 10).map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs flex justify-between items-center gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-[#322622] dark:text-[#F4EDE6] truncate">{p.title}</p>
                        <p className="text-[10.5px] text-[#786962] dark:text-[#B5A89F]">{p.author} · {p.status || 'approved'}</p>
                      </div>
                      <button
                        onClick={async () => {
                          await apiService.moderateCommunityPost(p.id, 'approved', !p.isFeatured, user);
                          notify(p.isFeatured ? 'Đã bỏ ghim bài viết.' : 'Đã ghim nổi bật bài viết.');
                          loadOverview();
                        }}
                        className={`min-h-[34px] px-2.5 py-1 rounded-xl text-[10.5px] font-bold cursor-pointer shrink-0 whitespace-nowrap transition-colors ${
                          p.isFeatured
                            ? 'bg-[#F6EFE2] dark:bg-[#2F281C] text-[#9E5B3B] dark:text-[#D7BA86] border border-[#E5D4B3] dark:border-[#4A3F2B]'
                            : 'bg-[#322622] dark:bg-[#F4EDE6] text-white dark:text-[#161311]'
                        }`}
                      >
                        {p.isFeatured ? 'Bỏ ghim' : 'Ghim nổi bật'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="p-4 sm:p-5 bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-2.5 shadow-xs">
                <h3 className="font-editorial text-[15px] font-bold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#4F6B56] dark:text-[#8DA892] shrink-0" />
                  <span className="tabular-nums">Bài thư viện y khoa ({articles.length})</span>
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                  {articles.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 rounded-2xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs flex justify-between items-center gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-[#322622] dark:text-[#F4EDE6] truncate">{a.title}</p>
                        <p className="text-[10.5px] text-[#786962] dark:text-[#B5A89F]">Trạng thái: {a.status}</p>
                      </div>
                      {a.status !== 'approved' && (
                        <button
                          onClick={async () => {
                            await apiService.moderateLibraryArticle(a.id, 'approved', user);
                            notify('Đã duyệt bài thư viện.');
                            loadOverview();
                          }}
                          className="min-h-[34px] px-2.5 py-1 rounded-xl bg-[#4F6B56] hover:bg-[#3F5745] text-white text-[10.5px] font-bold cursor-pointer shrink-0 whitespace-nowrap transition-colors"
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
            <section className="p-4 sm:p-5 bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-3 shadow-xs">
              <h3 className="font-editorial text-[15px] font-bold text-[#322622] dark:text-[#F4EDE6] tabular-nums">
                Quản lý đơn hàng ({orders.length})
              </h3>
              {orders.length === 0 ? (
                <p className="text-xs text-[#786962] dark:text-[#B5A89F]">Chưa có đơn hàng nào được tạo trên hệ thống.</p>
              ) : (
                <div className="space-y-2.5">
                  {orders.map((ord) => (
                    <div
                      key={ord.orderId}
                      className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-[#322622] dark:text-[#F4EDE6] tabular-nums">
                          {ord.orderId} · <span className="text-[#B55841] dark:text-[#D47A63]">{ord.totalAmount.toLocaleString('vi-VN')}đ</span>
                        </p>
                        <p className="text-[11px] text-[#6B5D56] dark:text-[#C5B9B0]">
                          Khách: {ord.shippingAddress.fullName} · PT: {ord.paymentMethod.toUpperCase()} · TT: {ord.status} ({ord.paymentStatus || 'unpaid'})
                        </p>
                      </div>
                      {isAdmin && (
                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                          {ord.paymentStatus === 'awaiting_verification' && (
                            <button
                              onClick={async () => {
                                await apiService.updateOrderStatus(ord.orderId, 'confirmed', 'verified', user);
                                notify('Đã xác minh chuyển khoản VietQR & xác nhận đơn.');
                                loadOverview();
                              }}
                              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[#4F6B56] hover:bg-[#3F5745] text-white text-[11px] font-bold cursor-pointer whitespace-nowrap transition-colors"
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
                            className="min-h-[36px] px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] text-[11px] font-bold text-[#322622] dark:text-[#F4EDE6] focus:outline-none focus:border-[#B55841] dark:focus:border-[#D47A63]"
                          >
                            <option value="pending">Chờ xác nhận</option>
                            <option value="awaiting_verification">Chờ xác minh CK</option>
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
              <section className="p-4 sm:p-5 bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-3 shadow-xs">
                <h3 className="font-editorial text-[15px] font-bold text-[#322622] dark:text-[#F4EDE6] tabular-nums">
                  Quản lý kho sản phẩm ({products.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="Tên sản phẩm mới..."
                    className="sm:col-span-2 px-3 py-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#322622] dark:text-[#F4EDE6] placeholder:text-[#786962] dark:placeholder:text-[#B5A89F] focus:outline-none focus:border-[#B55841] dark:focus:border-[#D47A63]"
                  />
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="Giá (VND)"
                    className="px-3 py-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#322622] dark:text-[#F4EDE6] placeholder:text-[#786962] dark:placeholder:text-[#B5A89F] tabular-nums focus:outline-none focus:border-[#B55841] dark:focus:border-[#D47A63]"
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
                    className="min-h-[40px] px-3 py-2 rounded-xl bg-[#B55841] hover:bg-[#9E4A35] text-white text-xs font-bold cursor-pointer inline-flex items-center justify-center gap-1 whitespace-nowrap transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Thêm sản phẩm
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto no-scrollbar">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-[#322622] dark:text-[#F4EDE6] truncate">{p.name}</p>
                        <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] tabular-nums">
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
                            ? 'bg-[#EBF1EC] dark:bg-[#1E2922] text-[#4F6B56] dark:text-[#8DA892] border border-[#C8D9CB] dark:border-[#33483A]'
                            : 'bg-[#F7EAE5] dark:bg-[#35231E] text-[#A9422D] dark:text-[#E5927D] border border-[#EBCDC2] dark:border-[#52352D]'
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
          <section className="p-4 sm:p-5 bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-3 shadow-xs">
            <h3 className="font-editorial text-[15px] font-bold text-[#322622] dark:text-[#F4EDE6]">
              Danh sách tài khoản & Phân quyền
            </h3>
            <div className="space-y-2.5">
              {usersList.map((u) => (
                <div
                  key={u.id}
                  className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-[#322622] dark:text-[#F4EDE6] truncate">{u.name} ({u.id})</p>
                    <p className="text-[11px] text-[#786962] dark:text-[#B5A89F] truncate tabular-nums">{u.email || u.phone}</p>
                  </div>
                  <select
                    value={u.role || 'user'}
                    disabled={u.id === user.id}
                    onChange={async (e) => {
                      await apiService.updateUserRole(u.id, e.target.value as UserRole, user);
                      notify(`Đã đổi quyền ${u.name} thành ${e.target.value}.`);
                      loadOverview();
                    }}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E1A17] border border-[#E6DDD1] dark:border-[#362E2A] text-xs font-bold text-[#322622] dark:text-[#F4EDE6] disabled:opacity-60 focus:outline-none focus:border-[#B55841] dark:focus:border-[#D47A63]"
                  >
                    <option value="user">user</option>
                    <option value="moderator">moderator</option>
                    <option value="admin">admin</option>
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
              <section className="p-4 sm:p-5 bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-3 shadow-xs">
                <h3 className="font-editorial text-[15px] font-bold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-1.5">
                  <BellRing className="w-4 h-4 text-[#B55841] dark:text-[#D47A63] shrink-0" />
                  <span>Gửi thông báo toàn hệ thống</span>
                </h3>
                <input
                  type="text"
                  value={bcTitle}
                  onChange={(e) => setBcTitle(e.target.value)}
                  placeholder="Tiêu đề thông báo..."
                  className="w-full px-3 py-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#322622] dark:text-[#F4EDE6] placeholder:text-[#786962] dark:placeholder:text-[#B5A89F] focus:outline-none focus:border-[#B55841] dark:focus:border-[#D47A63]"
                />
                <textarea
                  rows={3}
                  value={bcDesc}
                  onChange={(e) => setBcDesc(e.target.value)}
                  placeholder="Nội dung thông báo gửi tới các mẹ bầu..."
                  className="w-full px-3 py-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs text-[#322622] dark:text-[#F4EDE6] placeholder:text-[#786962] dark:placeholder:text-[#B5A89F] resize-none focus:outline-none focus:border-[#B55841] dark:focus:border-[#D47A63]"
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
                  className="w-full min-h-[44px] py-2.5 rounded-xl bg-[#B55841] hover:bg-[#9E4A35] text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Gửi thông báo hệ thống
                </button>
              </section>
            )}

            <section className="p-4 sm:p-5 bg-white dark:bg-[#1E1A17] rounded-3xl border border-[#E6DDD1] dark:border-[#362E2A] space-y-3 shadow-xs">
              <h3 className="font-editorial text-[15px] font-bold text-[#322622] dark:text-[#F4EDE6] flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#4F6B56] dark:text-[#8DA892] shrink-0" />
                <span className="tabular-nums">Nhật ký kiểm duyệt & quản trị ({auditLogs.length})</span>
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-[#786962] dark:text-[#B5A89F]">Chưa có nhật ký hoạt động quản trị.</p>
                ) : (
                  auditLogs.slice(0, 20).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-2xl bg-[#FAF6F0] dark:bg-[#231E1B] border border-[#E6DDD1] dark:border-[#362E2A] text-xs"
                    >
                      <p className="font-bold text-[#322622] dark:text-[#F4EDE6]">
                        {log.actorName} ({log.actorRole}) · {log.action}
                      </p>
                      <p className="text-[11px] text-[#6B5D56] dark:text-[#C5B9B0] mt-0.5 leading-relaxed">{log.details}</p>
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
