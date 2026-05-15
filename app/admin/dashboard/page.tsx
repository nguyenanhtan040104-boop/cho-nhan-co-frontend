'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, users, forum, wallet } from '../../../lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

async function adminFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers as any),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Lỗi không xác định' }));
    throw err;
  }
  return res.json();
}

// ─── Helpers ──────────────────────────────────────────────────────────
function fmtDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fmtTime(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
function fmtMoney(n: number) {
  if (!n) return '0đ';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + ' tỷ';
  if (n >= 1e6) return (n / 1e6).toFixed(0) + ' triệu';
  return n.toLocaleString() + 'đ';
}

// ─── Mini bar chart ────────────────────────────────────────────────────
function MiniBar({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div className="w-full rounded-t-sm transition-all" style={{ height: `${(d.value / max) * 72}px`, backgroundColor: color, opacity: 0.85 }} />
          <span className="text-[9px] text-gray-400 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // overview data
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // lists
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allRealEstates, setAllRealEstates] = useState<any[]>([]);
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [allAds, setAllAds] = useState<any[]>([]);
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [vipItems, setVipItems] = useState<any[]>([]);
  const [walletTx, setWalletTx] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.push('/profile'); return; }
    init();
  }, []);

  async function init() {
    try {
      const me = await users.getMe();
      if (me.role?.toLowerCase() !== 'admin') {
        alert('Bạn không có quyền truy cập trang này');
        router.push('/dashboard');
        return;
      }
      setMe(me);
      await loadAll();
    } catch { router.push('/profile'); }
    finally { setLoading(false); }
  }

  async function loadAll() {
    const [
      productsRes, reRes, jobsRes, postsRes,
      usersRes, pendingRes, walletRes, adsRes,
    ] = await Promise.allSettled([
      adminFetch('/products?limit=200'),
      adminFetch('/real-estates?limit=200'),
      adminFetch('/jobs?limit=200'),
      adminFetch('/forum/posts?limit=200'),
      adminFetch('/users/admin/all?limit=200'),
      adminFetch('/forum/admin/pending?limit=50').catch(() => ({ data: [] })),
      wallet.getAllTransactions({ limit: 50 }).catch(() => ({ data: [] })),
      adminFetch('/advertisements?limit=200'),
    ]);

    const products = productsRes.status === 'fulfilled' ? (productsRes.value?.data || []) : [];
    const re = reRes.status === 'fulfilled' ? (reRes.value?.data || []) : [];
    const jobs = jobsRes.status === 'fulfilled' ? (jobsRes.value?.data || []) : [];
    const fp = postsRes.status === 'fulfilled' ? (postsRes.value?.data || []) : [];
    const usersList = usersRes.status === 'fulfilled' ? (usersRes.value?.data || usersRes.value || []) : [];
    const ads = adsRes.status === 'fulfilled' ? (adsRes.value?.data || []) : [];
    setAllAds(ads);
    const pending = pendingRes.status === 'fulfilled' ? (pendingRes.value?.data || []) : [];
    const txList = walletRes.status === 'fulfilled' ? (walletRes.value?.data || []) : [];

    setAllProducts(products);
    setAllRealEstates(re);
    setAllJobs(jobs);
    setAllPosts(fp);
    setAllUsers(usersList);
    setPendingPosts(pending);
    setWalletTx(txList);

    // VIP items across all types
    setVipItems([
      ...products.filter((p: any) => p.isVip).map((p: any) => ({ ...p, _type: 'Sản phẩm' })),
      ...re.filter((p: any) => p.isVip).map((p: any) => ({ ...p, _type: 'BĐS' })),
      ...jobs.filter((p: any) => p.isVip).map((p: any) => ({ ...p, _type: 'Tuyển dụng' })),
    ]);

    // Revenue from confirmed txs
    const revenue = txList.filter((t: any) => t.status === 'CONFIRMED').reduce((s: number, t: any) => s + (t.amount || 0), 0);

    // Build stats
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const newUsersToday = usersList.filter((u: any) => new Date(u.createdAt) >= today).length;

    setStats({
      totalProducts: products.length,
      totalRE: re.length,
      totalJobs: jobs.length,
      totalPosts: fp.length,
      totalUsers: usersList.length,
      pendingCount: pending.length,
      revenue,
      newUsersToday,
      reportsCount: 0,
    });

    // Recent activity: merge and sort by date
    const activity = [
      ...products.slice(0, 5).map((p: any) => ({ icon: 'ri-leaf-line', color: '#2d6a4f', text: `<b>${p.user?.fullName || 'Ai đó'}</b> vừa đăng sản phẩm <i>${p.title}</i>`, time: p.createdAt })),
      ...jobs.slice(0, 3).map((p: any) => ({ icon: 'ri-briefcase-line', color: '#7c3aed', text: `<b>${p.user?.fullName || 'Ai đó'}</b> vừa đăng tuyển dụng <i>${p.title}</i>`, time: p.createdAt })),
      ...fp.slice(0, 3).map((p: any) => ({ icon: 'ri-chat-3-line', color: '#0891b2', text: `<b>${p.isAnonymous ? 'Ẩn danh' : (p.user?.fullName || 'Ai đó')}</b> vừa đăng bài diễn đàn <i>${p.title}</i>`, time: p.createdAt })),
      ...re.slice(0, 3).map((p: any) => ({ icon: 'ri-home-4-line', color: '#1d4ed8', text: `<b>${p.user?.fullName || 'Ai đó'}</b> vừa đăng BĐS <i>${p.title}</i>`, time: p.createdAt })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 12);

    setRecentActivity(activity);

    // Build last 7 days data for chart
    const days7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    // could be used for a chart
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const sidebarTabs = [
    { id: 'overview', label: 'Tổng quan', icon: 'ri-dashboard-3-line' },
    { id: 'users', label: 'Người dùng', icon: 'ri-group-line', badge: allUsers.length },
    { id: 'moderation', label: 'Kiểm duyệt', icon: 'ri-shield-check-line', badge: pendingPosts.length, badgeColor: 'bg-orange-500' },
    { id: 'products', label: 'Sản phẩm', icon: 'ri-leaf-line', badge: allProducts.length },
    { id: 'real-estate', label: 'Bất động sản', icon: 'ri-home-4-line', badge: allRealEstates.length },
    { id: 'jobs', label: 'Tuyển dụng', icon: 'ri-briefcase-line', badge: allJobs.length },
    { id: 'forum', label: 'Diễn đàn', icon: 'ri-chat-3-line', badge: allPosts.length },
    { id: 'ads', label: 'Quảng cáo', icon: 'ri-megaphone-line', badge: allAds.length },
    { id: 'vip', label: 'Quản lý VIP', icon: 'ri-vip-crown-fill', badge: vipItems.length, badgeColor: 'bg-yellow-500' },
    { id: 'wallet', label: 'Doanh thu', icon: 'ri-wallet-3-line' },
    { id: 'activity', label: 'Hoạt động', icon: 'ri-history-line' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
              A
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Xin chào, <b>{me?.fullName}</b> · {fmtDate(new Date().toISOString())}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-white transition-all">
              <i className="ri-home-line mr-1"></i>Trang chủ
            </Link>
            <Link href="/dashboard" className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-white transition-all">
              Dashboard cá nhân
            </Link>
            <button onClick={() => { auth.logout(); router.push('/'); }}
              className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all">
              <i className="ri-logout-box-line mr-1"></i>Đăng xuất
            </button>
          </div>
        </div>

        <div className="flex gap-5">
          {/* Sidebar */}
          <aside className="w-52 flex-shrink-0">
            <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 sticky top-20">
              {sidebarTabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all mb-0.5 ${
                    activeTab === tab.id
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                  <i className={`${tab.icon} text-base flex-shrink-0`}></i>
                  <span className="text-sm flex-1 font-medium">{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                      activeTab === tab.id ? 'bg-white/20 text-white' : (tab.badgeColor || 'bg-gray-100 text-gray-600')
                    } ${tab.badgeColor && activeTab !== tab.id ? 'text-white' : ''}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">

            {/* ── OVERVIEW ─────────────────────────────────────── */}
            {activeTab === 'overview' && stats && (
              <OverviewTab stats={stats} products={allProducts} recentActivity={recentActivity} walletTx={walletTx} />
            )}

            {/* ── USERS ────────────────────────────────────────── */}
            {activeTab === 'users' && (
              <UsersTab usersList={allUsers} onRefresh={loadAll} />
            )}

            {/* ── MODERATION ───────────────────────────────────── */}
            {activeTab === 'moderation' && (
              <ModerationTab posts={pendingPosts} onRefresh={loadAll} />
            )}

            {/* ── PRODUCTS ─────────────────────────────────────── */}
            {activeTab === 'products' && (
              <ContentTab
                title="Sản phẩm" items={allProducts} color="green"
                renderRow={p => (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{p.title}</p>
                      <p className="text-xs text-gray-400">{p.user?.fullName} · {p.location} · {p.category}</p>
                      <p className="text-sm font-semibold text-green-600">{fmtMoney(Number(p.price))}/{p.unit}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <StatusBadge status={p.status} isVip={p.isVip} />
                      <p className="text-xs text-gray-400 mt-1"><i className="ri-eye-line"></i> {p.viewCount || 0}</p>
                      <p className="text-xs text-gray-400">{fmtDate(p.createdAt)}</p>
                    </div>
                  </>
                )}
                onDelete={async id => { await adminFetch(`/products/${id}`, { method: 'DELETE' }); setAllProducts(p => p.filter(x => x.id !== id)); }}
                editHref={id => `/products/${id}/edit`}
                onToggleVip={async (id, isVip) => { await adminFetch(`/products/${id}/vip`, { method: 'PATCH', body: JSON.stringify({ isVip }) }); setAllProducts(p => p.map(x => x.id === id ? { ...x, isVip } : x)); }}
              />
            )}

            {/* ── REAL ESTATE ───────────────────────────────────── */}
            {activeTab === 'real-estate' && (
              <ContentTab
                title="Bất động sản" items={allRealEstates} color="blue"
                renderRow={p => (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{p.title}</p>
                      <p className="text-xs text-gray-400">{p.user?.fullName} · {p.address}</p>
                      <p className="text-sm font-semibold text-blue-600">{fmtMoney(Number(p.price))} · {p.area}m²</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{p.type}</span>
                      <StatusBadge isVip={p.isVip} />
                      <p className="text-xs text-gray-400 mt-1">{fmtDate(p.createdAt)}</p>
                    </div>
                  </>
                )}
                onDelete={async id => { await adminFetch(`/real-estates/${id}`, { method: 'DELETE' }); setAllRealEstates(p => p.filter(x => x.id !== id)); }}
                editHref={id => `/real-estate/${id}/edit`}
                onToggleVip={async (id, isVip) => { await adminFetch(`/real-estates/${id}/vip`, { method: 'PATCH', body: JSON.stringify({ isVip }) }); setAllRealEstates(p => p.map(x => x.id === id ? { ...x, isVip } : x)); }}
              />
            )}

            {/* ── JOBS ─────────────────────────────────────────── */}
            {activeTab === 'jobs' && (
              <ContentTab
                title="Tuyển dụng" items={allJobs} color="indigo"
                renderRow={p => (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 truncate">{p.title}</p>
                        {p.isUrgent && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full flex-shrink-0">Khẩn</span>}
                      </div>
                      <p className="text-xs text-gray-400">{p.user?.fullName} · {p.location}</p>
                      {p.salary && <p className="text-sm font-semibold text-indigo-600">{p.salary}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">{p.type === 'EMPLOYER' ? 'Tuyển dụng' : 'Tìm việc'}</span>
                      <p className="text-xs text-gray-400 mt-1">{fmtDate(p.createdAt)}</p>
                    </div>
                  </>
                )}
                onDelete={async id => { await adminFetch(`/jobs/${id}`, { method: 'DELETE' }); setAllJobs(p => p.filter(x => x.id !== id)); }}
                editHref={id => `/jobs/${id}/edit`}
                onToggleVip={async (id, isVip) => { await adminFetch(`/jobs/${id}/vip`, { method: 'PATCH', body: JSON.stringify({ isVip }) }); setAllJobs(p => p.map(x => x.id === id ? { ...x, isVip } : x)); }}
              />
            )}

            {/* ── FORUM ────────────────────────────────────────── */}
            {activeTab === 'forum' && (
              <ContentTab
                title="Diễn đàn" items={allPosts} color="purple"
                renderRow={p => (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{p.title}</p>
                      <p className="text-xs text-gray-400">{p.isAnonymous ? 'Ẩn danh' : p.user?.fullName} · {p.category}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-500">❤️ {p.likeCount} · 👁️ {p.viewCount}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p._count?.comments || 0} bình luận</p>
                      <p className="text-xs text-gray-400">{fmtDate(p.createdAt)}</p>
                    </div>
                  </>
                )}
                onDelete={async id => { await adminFetch(`/forum/posts/${id}`, { method: 'DELETE' }); setAllPosts(p => p.filter(x => x.id !== id)); }}
                editHref={id => `/forum/${id}/edit`}
              />
            )}

            {/* ── ADS ──────────────────────────────────────────── */}
            {activeTab === 'ads' && (
              <ContentTab
                title="Quảng cáo" items={allAds} color="orange"
                renderRow={p => (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{p.title}</p>
                      <p className="text-xs text-gray-400">{p.user?.fullName} · {p.category}</p>
                      {p.endDate && <p className="text-xs text-orange-500">Hết hạn: {fmtDate(p.endDate)}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${new Date(p.endDate) > new Date() ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {new Date(p.endDate) > new Date() ? 'Đang chạy' : 'Hết hạn'}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{fmtDate(p.createdAt)}</p>
                    </div>
                  </>
                )}
                onDelete={async id => { await adminFetch(`/advertisements/${id}`, { method: 'DELETE' }); setAllAds(p => p.filter(x => x.id !== id)); }}
                editHref={id => `/advertisements/${id}/edit`}
                onToggleVip={async (id, isVip) => { await adminFetch(`/advertisements/${id}/vip`, { method: 'PATCH', body: JSON.stringify({ isVip }) }); setAllAds(p => p.map(x => x.id === id ? { ...x, isVip } : x)); }}
              />
            )}

            {/* ── VIP ─────────────────────────────────────────── */}
            {activeTab === 'vip' && (
              <VipTab vipItems={vipItems} onRefresh={loadAll} />
            )}

            {/* ── WALLET ───────────────────────────────────────── */}
            {activeTab === 'wallet' && (
              <WalletTab txList={walletTx} onRefresh={loadAll} />
            )}

            {/* ── ACTIVITY ─────────────────────────────────────── */}
            {activeTab === 'activity' && (
              <ActivityTab activity={recentActivity} />
            )}

          </main>
        </div>
      </div>
    </div>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────
function StatusBadge({ status, isVip }: { status?: string; isVip?: boolean }) {
  return (
    <div className="flex items-center gap-1 justify-end flex-wrap">
      {isVip && <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-semibold">VIP</span>}
      {status && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
          status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
          status === 'HIDDEN' ? 'bg-gray-100 text-gray-500' :
          'bg-red-100 text-red-600'
        }`}>{status === 'ACTIVE' ? 'Đang hiển thị' : status === 'HIDDEN' ? 'Đã ẩn' : status}</span>
      )}
    </div>
  );
}

// ─── OverviewTab ──────────────────────────────────────────────────────
function OverviewTab({ stats, products, recentActivity, walletTx }: any) {
  const confirmedTx = walletTx.filter((t: any) => t.status === 'CONFIRMED');
  const pendingTx = walletTx.filter((t: any) => t.status === 'PENDING');
  const revenue = confirmedTx.reduce((s: number, t: any) => s + (t.amount || 0), 0);

  const cards = [
    { label: 'Tổng sản phẩm', value: stats.totalProducts, icon: 'ri-leaf-line', bg: 'bg-green-50', color: 'text-green-600', border: 'border-green-100' },
    { label: 'Bất động sản', value: stats.totalRE, icon: 'ri-home-4-line', bg: 'bg-blue-50', color: 'text-blue-600', border: 'border-blue-100' },
    { label: 'Tuyển dụng', value: stats.totalJobs, icon: 'ri-briefcase-line', bg: 'bg-indigo-50', color: 'text-indigo-600', border: 'border-indigo-100' },
    { label: 'Bài diễn đàn', value: stats.totalPosts, icon: 'ri-chat-3-line', bg: 'bg-purple-50', color: 'text-purple-600', border: 'border-purple-100' },
    { label: 'Người dùng', value: stats.totalUsers, icon: 'ri-group-line', bg: 'bg-cyan-50', color: 'text-cyan-600', border: 'border-cyan-100' },
    { label: 'Người dùng mới hôm nay', value: stats.newUsersToday, icon: 'ri-user-add-line', bg: 'bg-teal-50', color: 'text-teal-600', border: 'border-teal-100' },
    { label: 'Chờ duyệt', value: stats.pendingCount, icon: 'ri-time-line', bg: 'bg-orange-50', color: 'text-orange-600', border: 'border-orange-100' },
    { label: 'Doanh thu xác nhận', value: fmtMoney(revenue), icon: 'ri-money-dollar-circle-line', bg: 'bg-yellow-50', color: 'text-yellow-600', border: 'border-yellow-100' },
  ];

  // Simple last-7-days chart using product count by day
  const days7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const chartData = days7.map(day => {
    const dayStr = day.toISOString().slice(0, 10);
    const count = products.filter((p: any) => (p.createdAt || '').slice(0, 10) === dayStr).length;
    return { label: `${day.getDate()}/${day.getMonth() + 1}`, value: count };
  });

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-gray-900">Tổng quan hệ thống</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((c, i) => (
          <div key={i} className={`bg-white rounded-2xl p-4 border ${c.border} shadow-sm`}>
            <div className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center mb-3`}>
              <i className={`${c.icon} ${c.color} text-lg`}></i>
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm font-semibold text-gray-800 mb-3">Sản phẩm đăng mới (7 ngày)</p>
          <MiniBar data={chartData} color="#2d6a4f" />
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm font-semibold text-gray-800 mb-3">Giao dịch nạp tiền</p>
          <div className="space-y-2 mt-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Đã xác nhận</span>
              <span className="font-bold text-green-600">{fmtMoney(revenue)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Chờ xác nhận</span>
              <span className="font-bold text-orange-500">{pendingTx.length} giao dịch</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tổng giao dịch</span>
              <span className="font-bold text-gray-700">{walletTx.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity + recent products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <i className="ri-history-line text-gray-400"></i>
            <h3 className="font-semibold text-gray-800">Hoạt động gần đây</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {recentActivity.slice(0, 8).map((a, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: a.color + '20' }}>
                  <i className={`${a.icon} text-sm`} style={{ color: a.color }}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 line-clamp-2" dangerouslySetInnerHTML={{ __html: a.text }} />
                  <p className="text-[10px] text-gray-400 mt-0.5">{fmtTime(a.time)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <i className="ri-leaf-line text-green-500"></i>
            <h3 className="font-semibold text-gray-800">Sản phẩm mới nhất</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {products.slice(0, 6).map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {p.images?.[0]?.url ? <img src={p.images[0].url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><i className="ri-image-line text-gray-300 text-sm"></i></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.title}</p>
                  <p className="text-xs text-gray-400">{p.user?.fullName}</p>
                </div>
                <span className="text-sm font-semibold text-green-600 flex-shrink-0">{fmtMoney(Number(p.price))}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── UsersTab ─────────────────────────────────────────────────────────
function UsersTab({ usersList, onRefresh }: { usersList: any[]; onRefresh: () => void }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  const filtered = usersList.filter(u =>
    (!search || u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search)) &&
    (!roleFilter || u.role?.toLowerCase() === roleFilter)
  );

  async function handleBan(id: string, isBanned: boolean) {
    if (!confirm(isBanned ? 'Mở khóa tài khoản này?' : 'Khóa tài khoản này?')) return;
    setProcessing(id);
    try {
      await adminFetch(`/users/${id}/ban`, { method: 'POST', body: JSON.stringify({ banned: !isBanned }) });
      onRefresh();
    } catch { alert('Thao tác thất bại'); }
    finally { setProcessing(null); }
  }

  async function handleRole(id: string, role: string) {
    setProcessing(id);
    try {
      await adminFetch(`/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) });
      onRefresh();
    } catch { alert('Đổi quyền thất bại'); }
    finally { setProcessing(null); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Người dùng ({filtered.length}/{usersList.length})</h2>
        <div className="flex gap-2">
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400">
            <option value="">Tất cả role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="vip">VIP</option>
          </select>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm tên, email, SĐT..."
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 w-52 focus:outline-none focus:ring-2 focus:ring-red-400" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Người dùng</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Liên hệ</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Role</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Đăng ký</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">Không tìm thấy người dùng nào</td></tr>
            )}
            {filtered.map(u => (
              <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${!u.isActive ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                      {u.fullName?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{u.fullName || 'Chưa đặt tên'}</p>
                      {!u.isActive && <span className="text-xs text-red-500 font-medium">Đã bị khóa</span>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  <p>{u.email}</p>
                  {u.phone && <p className="text-xs">{u.phone}</p>}
                </td>
                <td className="px-4 py-3 text-center">
                  <select
                    value={u.role?.toLowerCase() || 'user'}
                    onChange={e => handleRole(u.id, e.target.value.toUpperCase())}
                    disabled={processing === u.id}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-400">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="vip">VIP</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-center text-xs text-gray-400">{fmtDate(u.createdAt)}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleBan(u.id, !u.isActive)}
                    disabled={processing === u.id}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                      !u.isActive
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    } disabled:opacity-50`}>
                    {processing === u.id ? '...' : !u.isActive ? 'Mở khóa' : 'Khóa'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ModerationTab ────────────────────────────────────────────────────
function ModerationTab({ posts, onRefresh }: { posts: any[]; onRefresh: () => void }) {
  const [items, setItems] = useState(posts);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<{ id: string; text: string } | null>(null);

  useEffect(() => { setItems(posts); }, [posts]);

  async function approve(id: string) {
    setProcessing(id);
    try {
      await adminFetch(`/forum/admin/posts/${id}/approve`, { method: 'POST' });
      setItems(prev => prev.filter(p => p.id !== id));
    } catch { alert('Thao tác thất bại'); }
    finally { setProcessing(null); }
  }

  async function reject(id: string, reason: string) {
    setProcessing(id);
    try {
      await adminFetch(`/forum/admin/posts/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) });
      setItems(prev => prev.filter(p => p.id !== id));
      setRejectReason(null);
    } catch { alert('Thao tác thất bại'); }
    finally { setProcessing(null); }
  }

  async function deletePost(id: string) {
    if (!confirm('Xóa bài này?')) return;
    setProcessing(id);
    try {
      await adminFetch(`/forum/posts/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(p => p.id !== id));
    } catch { alert('Xóa thất bại'); }
    finally { setProcessing(null); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Kiểm duyệt bài viết</h2>
        <span className="text-sm text-gray-500">{items.length} bài chờ duyệt</span>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
          <i className="ri-checkbox-circle-line text-5xl text-green-300 block mb-3"></i>
          <p className="text-gray-500 font-medium">Không có bài nào chờ duyệt</p>
          <p className="text-sm text-gray-400 mt-1">Tất cả bài đã được xử lý</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(post => (
            <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <i className="ri-article-line text-purple-500"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{post.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {post.isAnonymous ? 'Ẩn danh' : post.user?.fullName} · {post.category} · {fmtTime(post.createdAt)}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-medium flex-shrink-0">Chờ duyệt</span>
                  </div>
                  {post.content && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{post.content}</p>
                  )}

                  {/* Reject reason input */}
                  {rejectReason?.id === post.id && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        placeholder="Lý do từ chối..."
                        value={rejectReason.text}
                        onChange={e => setRejectReason({ id: post.id, text: e.target.value })}
                        className="flex-1 text-sm border border-red-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                        autoFocus
                      />
                      <button onClick={() => reject(post.id, rejectReason.text)}
                        disabled={processing === post.id}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700 disabled:opacity-50">
                        Gửi
                      </button>
                      <button onClick={() => setRejectReason(null)}
                        className="px-4 py-2 border border-gray-200 text-sm rounded-xl hover:bg-gray-50">
                        Huỷ
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {rejectReason?.id !== post.id && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                  <button onClick={() => approve(post.id)} disabled={processing === post.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all">
                    <i className="ri-check-line"></i> Duyệt
                  </button>
                  <button onClick={() => setRejectReason({ id: post.id, text: '' })}
                    className="flex items-center gap-1.5 px-4 py-2 bg-orange-50 text-orange-700 text-sm rounded-xl hover:bg-orange-100 transition-all border border-orange-200">
                    <i className="ri-close-line"></i> Từ chối
                  </button>
                  <button onClick={() => deletePost(post.id)} disabled={processing === post.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 text-sm rounded-xl hover:bg-red-100 transition-all border border-red-200 ml-auto">
                    <i className="ri-delete-bin-line"></i> Xóa ngay
                  </button>
                  <Link href={`/forum/${post.id}`} target="_blank"
                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-all">
                    <i className="ri-external-link-line"></i> Xem
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ContentTab (generic list for products/re/jobs/forum) ─────────────
function ContentTab({ title, items, color, renderRow, onDelete, editHref, onToggleVip }: {
  title: string;
  items: any[];
  color: string;
  renderRow: (item: any) => React.ReactNode;
  onDelete: (id: string) => Promise<void>;
  editHref: (id: string) => string;
  onToggleVip?: (id: string, isVip: boolean) => Promise<void>;
}) {
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [togglingVip, setTogglingVip] = useState<string | null>(null);

  const filtered = items.filter(item =>
    !search ||
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    item.user?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string) {
    if (!confirm('Xóa bài đăng này?')) return;
    setDeleting(id);
    try { await onDelete(id); }
    catch { alert('Xóa thất bại'); }
    finally { setDeleting(null); }
  }

  async function handleToggleVip(id: string, currentVip: boolean) {
    if (!onToggleVip) return;
    const action = currentVip ? 'Hủy VIP' : 'Đặt VIP';
    if (!confirm(`${action} cho bài này?`)) return;
    setTogglingVip(id);
    try { await onToggleVip(id, !currentVip); }
    catch { alert(`${action} thất bại`); }
    finally { setTogglingVip(null); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">{title} ({filtered.length}/{items.length})</h2>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm kiếm..."
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 w-52 focus:outline-none focus:ring-2 focus:ring-red-400" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <p className="text-gray-400">Không có dữ liệu</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item.id} className={`bg-white rounded-xl border shadow-sm px-4 py-3 flex items-center gap-4 hover:border-gray-200 transition-all ${item.isVip ? 'border-yellow-300 bg-yellow-50/30' : 'border-gray-100'}`}>
              {item.images?.[0]?.url && (
                <img src={item.images[0].url} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              )}
              <div className="flex-1 flex items-center gap-4 min-w-0">
                {renderRow(item)}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {onToggleVip && (
                  <button
                    onClick={() => handleToggleVip(item.id, item.isVip)}
                    disabled={togglingVip === item.id}
                    title={item.isVip ? 'Hủy VIP' : 'Đặt VIP'}
                    className={`p-2 rounded-lg transition-all disabled:opacity-50 ${
                      item.isVip
                        ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                        : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                    }`}>
                    {togglingVip === item.id
                      ? <i className="ri-loader-4-line text-base animate-spin"></i>
                      : <i className="ri-vip-crown-fill text-base"></i>}
                  </button>
                )}
                <Link href={editHref(item.id)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Chỉnh sửa">
                  <i className="ri-pencil-line text-base"></i>
                </Link>
                <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50" title="Xóa">
                  {deleting === item.id
                    ? <i className="ri-loader-4-line text-base animate-spin"></i>
                    : <i className="ri-delete-bin-line text-base"></i>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── VipTab ───────────────────────────────────────────────────────────
function VipTab({ vipItems, onRefresh }: { vipItems: any[]; onRefresh: () => void }) {
  const [processing, setProcessing] = useState<string | null>(null);

  async function removeVip(item: any) {
    if (!confirm(`Hủy VIP cho "${item.title}"?`)) return;
    setProcessing(item.id);
    const endpointMap: any = {
      'Sản phẩm': `/products/${item.id}/vip`,
      'BĐS': `/real-estates/${item.id}/vip`,
      'Tuyển dụng': `/jobs/${item.id}/vip`,
    };
    try {
      await adminFetch(endpointMap[item._type], {
        method: 'PATCH',
        body: JSON.stringify({ isVip: false }),
      });
      onRefresh();
    } catch { alert('Thao tác thất bại'); }
    finally { setProcessing(null); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Quản lý VIP ({vipItems.length} bài)</h2>
      </div>

      {vipItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <i className="ri-vip-crown-line text-4xl text-gray-200 block mb-3"></i>
          <p className="text-gray-400">Chưa có bài VIP nào</p>
        </div>
      ) : (
        <div className="space-y-2">
          {vipItems.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-yellow-200 shadow-sm px-4 py-3 flex items-center gap-4">
              {item.images?.[0]?.url && (
                <img src={item.images[0].url} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-semibold flex-shrink-0">{item._type}</span>
                  <p className="font-medium text-gray-900 truncate">{item.title}</p>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{item.user?.fullName}</p>
                {item.vipExpiresAt && <p className="text-xs text-orange-500 mt-0.5">Hết hạn: {fmtDate(item.vipExpiresAt)}</p>}
              </div>
              <button onClick={() => removeVip(item)} disabled={processing === item.id}
                className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-all flex-shrink-0">
                {processing === item.id ? '...' : 'Hủy VIP'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── WalletTab ────────────────────────────────────────────────────────
function WalletTab({ txList, onRefresh }: { txList: any[]; onRefresh: () => void }) {
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const filtered = filter ? txList.filter(t => t.status === filter) : txList;
  const revenue = txList.filter(t => t.status === 'CONFIRMED').reduce((s, t) => s + (t.amount || 0), 0);

  async function confirm_(id: string) {
    setProcessing(id);
    try { await wallet.confirmTopUp(id); onRefresh(); }
    catch { alert('Thao tác thất bại'); }
    finally { setProcessing(null); }
  }
  async function reject_(id: string) {
    setProcessing(id);
    try { await wallet.rejectTopUp(id); onRefresh(); }
    catch { alert('Thao tác thất bại'); }
    finally { setProcessing(null); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Doanh thu & Giao dịch</h2>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400">
          <option value="">Tất cả</option>
          <option value="PENDING">Chờ xác nhận</option>
          <option value="CONFIRMED">Đã xác nhận</option>
          <option value="REJECTED">Từ chối</option>
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Tổng doanh thu', value: fmtMoney(revenue), color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Chờ xác nhận', value: txList.filter(t => t.status === 'PENDING').length + ' giao dịch', color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Tổng giao dịch', value: txList.length, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((c, i) => (
          <div key={i} className={`${c.bg} rounded-2xl p-4 border border-gray-100`}>
            <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Người dùng</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Số tiền</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Trạng thái</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Ngày</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">Không có giao dịch nào</td></tr>
            )}
            {filtered.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{tx.user?.fullName || '—'}</p>
                  <p className="text-xs text-gray-400">{tx.user?.phone || tx.user?.email}</p>
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">{fmtMoney(tx.amount)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    tx.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                    tx.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-600'
                  }`}>{tx.status === 'CONFIRMED' ? 'Đã xác nhận' : tx.status === 'PENDING' ? 'Chờ xác nhận' : 'Từ chối'}</span>
                </td>
                <td className="px-4 py-3 text-center text-xs text-gray-400">{fmtDate(tx.createdAt)}</td>
                <td className="px-4 py-3 text-center">
                  {tx.status === 'PENDING' && (
                    <div className="flex gap-1.5 justify-center">
                      <button onClick={() => confirm_(tx.id)} disabled={processing === tx.id}
                        className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                        {processing === tx.id ? '...' : 'Xác nhận'}
                      </button>
                      <button onClick={() => reject_(tx.id)} disabled={processing === tx.id}
                        className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50">
                        Từ chối
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ActivityTab ──────────────────────────────────────────────────────
function ActivityTab({ activity }: { activity: any[] }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4">Hoạt động gần đây</h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {activity.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Chưa có hoạt động nào</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {activity.map((a, i) => (
              <div key={i} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: a.color + '18' }}>
                  <i className={`${a.icon} text-base`} style={{ color: a.color }}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: a.text }} />
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <i className="ri-time-line"></i>{fmtTime(a.time)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
