'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, users, forum, wallet } from '../../../lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cho-nhan-co-backend.onrender.com/api';

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
function timeAgo(d: string) {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return fmtDate(d);
}

function MiniBar({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div className="w-full rounded-t transition-all" style={{ height: `${(d.value / max) * 72}px`, backgroundColor: color }} />
          <span className="text-[11px] text-ink-faint truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(['overview']));
  const [loading, setLoading] = useState(true);

  function handleTabChange(tabId: string) {
    setActiveTab(tabId);
    setVisitedTabs(prev => new Set(prev).add(tabId));
  }

  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allRealEstates, setAllRealEstates] = useState<any[]>([]);
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [allAds, setAllAds] = useState<any[]>([]);
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [vipItems, setVipItems] = useState<any[]>([]);
  const [walletTx, setWalletTx] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.push('/profile'); return; }
    init();
  }, []);

  async function init() {
    try {
      const meData = await users.getMe();
      if (meData.role?.toLowerCase() !== 'admin') {
        alert('Bạn không có quyền truy cập trang này');
        router.push('/dashboard');
        return;
      }
      setMe(meData);
      await loadAll();
    } catch { router.push('/profile'); }
    finally { setLoading(false); }
  }

  async function loadAll() {
    const [
      productsRes, reRes, jobsRes, postsRes,
      usersRes, pendingRes, walletRes, adsRes, historyRes,
    ] = await Promise.allSettled([
      adminFetch('/products?limit=200'),
      adminFetch('/real-estates?limit=200'),
      adminFetch('/jobs?limit=200'),
      adminFetch('/forum/posts?limit=200'),
      adminFetch('/users/admin/all?limit=200'),
      adminFetch('/forum/admin/pending?limit=50').catch(() => ({ data: [] })),
      wallet.getAllTransactions({ limit: 100 }).catch(() => ({ data: [] })),
      adminFetch('/advertisements?limit=200'),
      adminFetch('/users/admin/login-history?limit=300').catch(() => ({ data: [] })),
    ]);

    const products = productsRes.status === 'fulfilled' ? (productsRes.value?.data || []) : [];
    const re = reRes.status === 'fulfilled' ? (reRes.value?.data || []) : [];
    const jobs = jobsRes.status === 'fulfilled' ? (jobsRes.value?.data || []) : [];
    const fp = postsRes.status === 'fulfilled' ? (postsRes.value?.data || []) : [];
    const usersList = usersRes.status === 'fulfilled' ? (usersRes.value?.data || usersRes.value || []) : [];
    const ads = adsRes.status === 'fulfilled' ? (adsRes.value?.data || []) : [];
    const pending = pendingRes.status === 'fulfilled' ? (pendingRes.value?.data || []) : [];
    const txList = walletRes.status === 'fulfilled' ? (walletRes.value?.data || []) : [];
    const history = historyRes.status === 'fulfilled' ? (historyRes.value?.data || []) : [];

    setAllProducts(products); setAllRealEstates(re); setAllJobs(jobs);
    setAllPosts(fp); setAllUsers(usersList); setAllAds(ads);
    setPendingPosts(pending); setWalletTx(txList); setLoginHistory(history);

    setVipItems([
      ...products.filter((p: any) => p.isVip).map((p: any) => ({ ...p, _type: 'Sản phẩm' })),
      ...re.filter((p: any) => p.isVip).map((p: any) => ({ ...p, _type: 'BĐS' })),
      ...jobs.filter((p: any) => p.isVip).map((p: any) => ({ ...p, _type: 'Tuyển dụng' })),
    ]);

    const revenue = txList.filter((t: any) => t.status === 'completed' && t.type === 'top_up')
      .reduce((s: number, t: any) => s + (Number(t.amount) || 0), 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const newUsersToday = usersList.filter((u: any) => new Date(u.createdAt) >= today).length;

    // Failed logins today
    const failedToday = history.filter((h: any) =>
      new Date(h.createdAt) >= today && h.status === 'FAILED'
    ).length;

    setStats({
      totalProducts: products.length, totalRE: re.length, totalJobs: jobs.length,
      totalPosts: fp.length, totalUsers: usersList.length,
      pendingCount: pending.length, revenue, newUsersToday, failedToday,
    });

    // Plain fields, rendered as text. User-supplied titles and names must never be
    // turned into HTML here (that would let a listing title run script in the admin's browser).
    const activity = [
      ...products.slice(0, 5).map((p: any) => ({ who: p.user?.fullName || 'Ai đó', verb: 'đăng sản phẩm', title: p.title, time: p.createdAt })),
      ...jobs.slice(0, 3).map((p: any) => ({ who: p.user?.fullName || 'Ai đó', verb: 'đăng tuyển dụng', title: p.title, time: p.createdAt })),
      ...fp.slice(0, 3).map((p: any) => ({ who: p.isAnonymous ? 'Ẩn danh' : (p.user?.fullName || 'Ai đó'), verb: 'đăng diễn đàn', title: p.title, time: p.createdAt })),
      ...re.slice(0, 3).map((p: any) => ({ who: p.user?.fullName || 'Ai đó', verb: 'đăng nhà đất', title: p.title, time: p.createdAt })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 15);
    setRecentActivity(activity);
  }

  if (loading) return (
    <div className="grid min-h-screen place-items-center bg-paper">
      <div className="text-center">
        <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-[3px] border-forest-600 border-t-transparent" />
        <p className="text-sm text-ink-soft">Đang tải trang quản trị...</p>
      </div>
    </div>
  );

  // Count suspicious IPs
  const ipMap: Record<string, { failed: number; total: number; lastSeen: string; users: Set<string> }> = {};
  loginHistory.forEach((h: any) => {
    const ip = h.ipAddress || 'unknown';
    if (!ipMap[ip]) ipMap[ip] = { failed: 0, total: 0, lastSeen: h.createdAt, users: new Set() };
    ipMap[ip].total++;
    if (h.status === 'FAILED' || h.status === 'LOCKED') ipMap[ip].failed++;
    if (h.user?.fullName) ipMap[ip].users.add(h.user.fullName);
    if (new Date(h.createdAt) > new Date(ipMap[ip].lastSeen)) ipMap[ip].lastSeen = h.createdAt;
  });
  const suspiciousIPs = Object.entries(ipMap).filter(([, v]) => v.failed >= 3).length;

  // `alert` badges need attention (filled red); the rest are plain counts
  const navGroups: { label: string; items: { id: string; label: string; count?: number; alert?: boolean }[] }[] = [
    { label: 'Theo dõi', items: [
      { id: 'overview', label: 'Tổng quan' },
      { id: 'moderation', label: 'Kiểm duyệt', count: pendingPosts.length || undefined, alert: true },
      { id: 'security', label: 'Bảo mật và IP', count: (!visitedTabs.has('security') && suspiciousIPs > 0) ? suspiciousIPs : undefined, alert: true },
      { id: 'activity', label: 'Nhật ký' },
    ] },
    { label: 'Nội dung', items: [
      { id: 'products', label: 'Sản phẩm', count: allProducts.length },
      { id: 'real-estate', label: 'Bất động sản', count: allRealEstates.length },
      { id: 'jobs', label: 'Tuyển dụng', count: allJobs.length },
      { id: 'forum', label: 'Diễn đàn', count: allPosts.length },
      { id: 'ads', label: 'Quảng cáo', count: allAds.length },
    ] },
    { label: 'Tiền và người dùng', items: [
      { id: 'users', label: 'Người dùng', count: allUsers.length },
      { id: 'vip', label: 'Quản lý VIP', count: (!visitedTabs.has('vip') && vipItems.length > 0) ? vipItems.length : undefined, alert: true },
      { id: 'wallet', label: 'Doanh thu' },
    ] },
  ];
  const sidebarTabs = navGroups.flatMap(g => g.items);

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-screen-2xl px-4 py-4 sm:px-6">

        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h1 className="text-xl font-bold text-ink">Quản trị Chợ Nhân Cơ</h1>
            <p className="text-[13px] text-ink-faint">Xin chào <b className="text-ink-soft">{me?.fullName}</b> · {fmtDate(new Date().toISOString())}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {suspiciousIPs > 0 && (
              <button onClick={() => handleTabChange('security')} className="btn-ghost !border-brand-200 !px-3 !py-1.5 text-[13px] !text-brand-600">
                {suspiciousIPs} IP đáng ngờ
              </button>
            )}
            <Link href="/" className="btn-ghost !px-3 !py-1.5 text-[13px]">Trang chủ</Link>
            <Link href="/dashboard" className="btn-ghost !px-3 !py-1.5 text-[13px]">Tài khoản của tôi</Link>
            <button onClick={() => { auth.logout(); router.push('/'); }} className="btn-ghost !px-3 !py-1.5 text-[13px]">Đăng xuất</button>
          </div>
        </header>

        {/* Phones and small tablets: one scrolling row */}
        <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 md:hidden">
          {sidebarTabs.map(tab => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`chip shrink-0 ${activeTab === tab.id ? 'chip-active' : ''}`}>
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && <span className={`ml-1.5 text-[11px] ${tab.alert ? 'rounded-full bg-brand-500 px-1.5 text-white' : 'opacity-70'}`}>{tab.count}</span>}
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-6">
          <aside className="hidden w-56 shrink-0 md:block">
            <nav className="card sticky top-4 p-2" aria-label="Menu quản trị">
              {navGroups.map((g, gi) => (
                <div key={g.label} className={gi > 0 ? 'mt-2 border-t border-line pt-2' : ''}>
                  <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{g.label}</p>
                  {g.items.map(tab => (
                    <button key={tab.id} onClick={() => handleTabChange(tab.id)} aria-current={activeTab === tab.id ? 'page' : undefined}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${activeTab === tab.id ? 'bg-forest-50 font-semibold text-forest-800' : 'text-ink-soft hover:bg-paper'}`}>
                      <span>{tab.label}</span>
                      {tab.count !== undefined && tab.count > 0 && (
                        <span className={`text-[11px] font-semibold tabular-nums ${tab.alert ? 'rounded-full bg-brand-500 px-1.5 text-white' : 'text-ink-faint'}`}>{tab.count}</span>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {activeTab === 'overview' && stats && (
              <OverviewTab stats={stats} products={allProducts} recentActivity={recentActivity} walletTx={walletTx} loginHistory={loginHistory} onTabChange={handleTabChange} />
            )}
            {activeTab === 'users' && (
              <UsersTab usersList={allUsers} loginHistory={loginHistory} onRefresh={loadAll} />
            )}
            {activeTab === 'security' && (
              <SecurityTab loginHistory={loginHistory} onRefresh={loadAll} />
            )}
            {activeTab === 'moderation' && (
              <ModerationTab posts={pendingPosts} onRefresh={loadAll} />
            )}
            {activeTab === 'products' && (
              <ContentTab title="Sản phẩm" items={allProducts} color="green"
                renderRow={p => (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink truncate text-sm">{p.title}</p>
                      <p className="text-xs text-ink-faint mt-0.5">{p.user?.fullName} · {p.location} · {p.category}</p>
                      <p className="text-sm font-bold text-forest-600 mt-0.5">{fmtMoney(Number(p.price))}/{p.unit}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <StatusBadge status={p.status} isVip={p.isVip} />
                      <p className="text-xs text-ink-faint mt-1"><i className="ri-eye-line"></i> {p.viewCount || 0} · {fmtDate(p.createdAt)}</p>
                    </div>
                  </>
                )}
                onDelete={async id => { await adminFetch(`/products/${id}`, { method: 'DELETE' }); setAllProducts(p => p.filter(x => x.id !== id)); }}
                editHref={id => `/products/${id}/edit`}
                onToggleVip={async (id, isVip) => { await adminFetch(`/products/${id}/vip`, { method: 'PATCH', body: JSON.stringify({ isVip }) }); setAllProducts(p => p.map(x => x.id === id ? { ...x, isVip } : x)); }}
              />
            )}
            {activeTab === 'real-estate' && (
              <ContentTab title="Bất động sản" items={allRealEstates} color="blue"
                renderRow={p => (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink truncate text-sm">{p.title}</p>
                      <p className="text-xs text-ink-faint mt-0.5">{p.user?.fullName} · {p.address}</p>
                      <p className="text-sm font-bold text-ink-soft mt-0.5">{fmtMoney(Number(p.price))} · {p.area}m²</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-paper text-ink-soft">{p.type}</span>
                      <StatusBadge isVip={p.isVip} />
                      <p className="text-xs text-ink-faint mt-1">{fmtDate(p.createdAt)}</p>
                    </div>
                  </>
                )}
                onDelete={async id => { await adminFetch(`/real-estates/${id}`, { method: 'DELETE' }); setAllRealEstates(p => p.filter(x => x.id !== id)); }}
                editHref={id => `/real-estate/${id}/edit`}
                onToggleVip={async (id, isVip) => { await adminFetch(`/real-estates/${id}/vip`, { method: 'PATCH', body: JSON.stringify({ isVip }) }); setAllRealEstates(p => p.map(x => x.id === id ? { ...x, isVip } : x)); }}
              />
            )}
            {activeTab === 'jobs' && (
              <ContentTab title="Tuyển dụng" items={allJobs} color="indigo"
                renderRow={p => (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-ink truncate text-sm">{p.title}</p>
                        {p.isUrgent && <span className="text-xs bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded-full flex-shrink-0">Khẩn</span>}
                      </div>
                      <p className="text-xs text-ink-faint mt-0.5">{p.user?.fullName} · {p.location}</p>
                      {p.salary && <p className="text-sm font-bold text-forest-600 mt-0.5">{p.salary}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-forest-100 text-forest-700">{p.type === 'EMPLOYER' ? 'Tuyển dụng' : 'Tìm việc'}</span>
                      <p className="text-xs text-ink-faint mt-1">{fmtDate(p.createdAt)}</p>
                    </div>
                  </>
                )}
                onDelete={async id => { await adminFetch(`/jobs/${id}`, { method: 'DELETE' }); setAllJobs(p => p.filter(x => x.id !== id)); }}
                editHref={id => `/jobs/${id}/edit`}
                onToggleVip={async (id, isVip) => { await adminFetch(`/jobs/${id}/vip`, { method: 'PATCH', body: JSON.stringify({ isVip }) }); setAllJobs(p => p.map(x => x.id === id ? { ...x, isVip } : x)); }}
              />
            )}
            {activeTab === 'forum' && (
              <ContentTab title="Diễn đàn" items={allPosts} color="purple"
                renderRow={p => (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink truncate text-sm">{p.title}</p>
                      <p className="text-xs text-ink-faint mt-0.5">{p.isAnonymous ? 'Ẩn danh' : p.user?.fullName} · {p.category}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-ink-soft">{p.likeCount} thích · {p.viewCount} xem</p>
                      <p className="text-xs text-ink-faint mt-0.5">{p._count?.comments || 0} bình luận</p>
                      <p className="text-xs text-ink-faint">{fmtDate(p.createdAt)}</p>
                    </div>
                  </>
                )}
                onDelete={async id => { await adminFetch(`/forum/posts/${id}`, { method: 'DELETE' }); setAllPosts(p => p.filter(x => x.id !== id)); }}
                editHref={id => `/forum/${id}/edit`}
              />
            )}
            {activeTab === 'ads' && (
              <ContentTab title="Quảng cáo" items={allAds} color="orange"
                renderRow={p => (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink truncate text-sm">{p.title}</p>
                      <p className="text-xs text-ink-faint mt-0.5">{p.user?.fullName} · {p.category}</p>
                      {p.endDate && <p className="text-xs text-brand-500 mt-0.5">Hết hạn: {fmtDate(p.endDate)}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${new Date(p.endDate) > new Date() ? 'bg-forest-100 text-forest-700' : 'bg-paper text-ink-soft'}`}>
                        {new Date(p.endDate) > new Date() ? 'Đang chạy' : 'Hết hạn'}
                      </span>
                      <p className="text-xs text-ink-faint mt-1">{fmtDate(p.createdAt)}</p>
                    </div>
                  </>
                )}
                onDelete={async id => { await adminFetch(`/advertisements/${id}`, { method: 'DELETE' }); setAllAds(p => p.filter(x => x.id !== id)); }}
                editHref={id => `/advertisements/${id}/edit`}
              />
            )}
            {activeTab === 'vip' && (
              <VipTab vipItems={vipItems} onRefresh={loadAll} />
            )}
            {activeTab === 'wallet' && (
              <WalletTab txList={walletTx} />
            )}
            {activeTab === 'activity' && (
              <ActivityTab activity={recentActivity} loginHistory={loginHistory} />
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
      {isVip && <span className="text-xs px-1.5 py-0.5 rounded-full bg-gold-100 text-gold-700 font-semibold">VIP</span>}
      {status && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
          status === 'ACTIVE' ? 'bg-forest-100 text-forest-700' :
          status === 'HIDDEN' ? 'bg-paper text-ink-soft' : 'bg-brand-50 text-brand-600'
        }`}>{status === 'ACTIVE' ? 'Hiển thị' : status === 'HIDDEN' ? 'Đã ẩn' : status}</span>
      )}
    </div>
  );
}

// ─── OverviewTab ──────────────────────────────────────────────────────
function OverviewTab({ stats, products, recentActivity, walletTx, loginHistory, onTabChange }: any) {
  const revenue = walletTx.filter((t: any) => t.status === 'completed' && t.type === 'top_up')
    .reduce((s: number, t: any) => s + (Number(t.amount) || 0), 0);
  const pendingTx = walletTx.filter((t: any) => t.status === 'pending');

  const cards = [
    { label: 'Tổng sản phẩm', value: stats.totalProducts, tab: 'products' },
    { label: 'Bất động sản', value: stats.totalRE, tab: 'real-estate' },
    { label: 'Tuyển dụng', value: stats.totalJobs, tab: 'jobs' },
    { label: 'Bài diễn đàn', value: stats.totalPosts, tab: 'forum' },
    { label: 'Người dùng', value: stats.totalUsers, tab: 'users' },
    { label: 'Mới hôm nay', value: stats.newUsersToday, tab: 'users' },
    { label: 'Chờ duyệt', value: stats.pendingCount, tab: 'moderation' },
    { label: 'Login thất bại hôm nay', value: stats.failedToday, tab: 'security' },
  ];

  const days7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
  const chartData = days7.map(day => {
    const dayStr = day.toISOString().slice(0, 10);
    return { label: `${day.getDate()}/${day.getMonth() + 1}`, value: products.filter((p: any) => (p.createdAt || '').slice(0, 10) === dayStr).length };
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Tổng quan hệ thống</h2>
        <span className="text-xs text-ink-faint bg-surface border border-line px-3 py-1.5 rounded-full">
          <i className="ri-refresh-line mr-1"></i>Cập nhật: {fmtTime(new Date().toISOString())}
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((c, i) => (
          <button key={i} onClick={() => c.tab && onTabChange(c.tab)}
            className="bg-surface rounded-card p-4 border border-line transition-all text-left group">
            <p className="text-2xl font-bold text-ink">{c.value}</p>
            <p className="text-xs text-ink-faint mt-0.5">{c.label}</p>
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface rounded-card p-5 border border-line">
          <p className="text-sm font-bold text-ink mb-3">Sản phẩm đăng mới (7 ngày)</p>
          <MiniBar data={chartData} color="#059669" />
        </div>
        <div className="bg-surface rounded-card p-5 border border-line">
          <p className="text-sm font-bold text-ink mb-4">Giao dịch nạp tiền</p>
          <div className="space-y-3">
            {[
              { label: 'Đã xác nhận', value: fmtMoney(revenue), color: 'text-forest-600', dot: 'bg-forest-500' },
              { label: 'Chờ xác nhận', value: `${pendingTx.length} giao dịch`, color: 'text-brand-500', dot: 'bg-brand-400' },
              { label: 'Tổng giao dịch', value: walletTx.length, color: 'text-ink', dot: 'bg-ink' },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${r.dot}`}></div>
                  <span className="text-sm text-ink-soft">{r.label}</span>
                </div>
                <span className={`font-bold text-sm ${r.color}`}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity + Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface rounded-card border border-line overflow-hidden">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="ri-history-line text-ink-faint"></i>
              <h3 className="font-bold text-ink text-sm">Hoạt động gần đây</h3>
            </div>
            <button onClick={() => onTabChange('activity')} className="text-xs text-brand-600 hover:underline">Xem tất cả</button>
          </div>
          <div className="divide-y divide-line max-h-72 overflow-y-auto">
            {recentActivity.slice(0, 8).map((a: any, i: number) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-paper">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-ink line-clamp-1"><b>{a.who}</b> {a.verb} <i>{a.title}</i></p>
                  <p className="text-[11px] text-ink-faint mt-0.5">{timeAgo(a.time)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-card border border-line overflow-hidden">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="ri-leaf-line text-forest-500"></i>
              <h3 className="font-bold text-ink text-sm">Sản phẩm mới nhất</h3>
            </div>
            <button onClick={() => onTabChange('products')} className="text-xs text-brand-600 hover:underline">Quản lý</button>
          </div>
          <div className="divide-y divide-line">
            {products.slice(0, 6).map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-paper">
                <div className="w-9 h-9 rounded-lg bg-paper overflow-hidden flex-shrink-0">
                  {p.images?.[0]?.url
                    ? <img src={p.images[0].url} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><i className="ri-image-line text-ink-faint text-sm"></i></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-ink truncate">{p.title}</p>
                  <p className="text-[11px] text-ink-faint">{p.user?.fullName} · {timeAgo(p.createdAt)}</p>
                </div>
                <span className="text-xs font-bold text-forest-600 flex-shrink-0">{fmtMoney(Number(p.price))}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Login security preview */}
      {loginHistory.length > 0 && (
        <div className="bg-surface rounded-card border border-line overflow-hidden">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="ri-shield-keyhole-line text-brand-600"></i>
              <h3 className="font-bold text-ink text-sm">Đăng nhập gần đây</h3>
            </div>
            <button onClick={() => onTabChange('security')} className="text-xs text-brand-600 hover:underline">Xem bảo mật</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-line bg-paper">
                <th className="text-left px-5 py-2.5 font-medium text-ink-faint">Người dùng</th>
                <th className="text-left px-4 py-2.5 font-medium text-ink-faint">IP</th>
                <th className="text-center px-4 py-2.5 font-medium text-ink-faint">Trạng thái</th>
                <th className="text-right px-5 py-2.5 font-medium text-ink-faint">Thời gian</th>
              </tr></thead>
              <tbody className="divide-y divide-line">
                {loginHistory.slice(0, 5).map((h: any, i: number) => (
                  <tr key={i} className="hover:bg-paper">
                    <td className="px-5 py-2.5 text-ink font-medium">{h.user?.fullName || '—'}</td>
                    <td className="px-4 py-2.5 text-ink-soft font-mono">{h.ipAddress || '—'}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-semibold ${
                        h.status === 'SUCCESS' ? 'bg-forest-100 text-forest-700' :
                        h.status === 'FAILED' ? 'bg-brand-50 text-brand-600' :
                        'bg-brand-100 text-brand-700'
                      }`}>{h.status === 'SUCCESS' ? 'Thành công' : h.status === 'FAILED' ? 'Thất bại' : 'Bị khóa'}</span>
                    </td>
                    <td className="px-5 py-2.5 text-right text-ink-faint">{timeAgo(h.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SecurityTab ──────────────────────────────────────────────────────
function SecurityTab({ loginHistory, onRefresh }: { loginHistory: any[]; onRefresh: () => void }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [blockedIps, setBlockedIps] = useState<any[]>([]);
  const [blockingIp, setBlockingIp] = useState<string | null>(null);
  const [manualIp, setManualIp] = useState('');
  const [manualReason, setManualReason] = useState('');
  const [addingManual, setAddingManual] = useState(false);

  useEffect(() => {
    loadBlockedIps();
  }, []);

  async function loadBlockedIps() {
    try {
      const data = await adminFetch('/users/admin/blocked-ips');
      setBlockedIps(Array.isArray(data) ? data : []);
    } catch { setBlockedIps([]); }
  }

  async function handleBlockIp(ip: string, reason?: string) {
    setBlockingIp(ip);
    try {
      await adminFetch('/users/admin/block-ip', {
        method: 'POST',
        body: JSON.stringify({ ip, reason: reason || `Tự động chặn từ dashboard — ${new Date().toLocaleString('vi-VN')}` }),
      });
      await loadBlockedIps();
    } catch (e: any) { alert(e?.message || 'Chặn IP thất bại'); }
    finally { setBlockingIp(null); }
  }

  async function handleUnblockIp(ip: string) {
    if (!confirm(`Bỏ chặn IP ${ip}?`)) return;
    setBlockingIp(ip);
    try {
      await adminFetch(`/users/admin/block-ip/${encodeURIComponent(ip)}`, { method: 'DELETE' });
      await loadBlockedIps();
    } catch (e: any) { alert(e?.message || 'Bỏ chặn thất bại'); }
    finally { setBlockingIp(null); }
  }

  async function handleManualBlock() {
    if (!manualIp.trim()) { alert('Nhập địa chỉ IP'); return; }
    setAddingManual(true);
    try {
      await adminFetch('/users/admin/block-ip', {
        method: 'POST',
        body: JSON.stringify({ ip: manualIp.trim(), reason: manualReason.trim() || undefined }),
      });
      setManualIp(''); setManualReason('');
      await loadBlockedIps();
    } catch (e: any) { alert(e?.message || 'Thêm IP thất bại'); }
    finally { setAddingManual(false); }
  }

  const blockedIpSet = new Set(blockedIps.map((b: any) => b.ip));

  // Aggregate by IP
  const ipMap: Record<string, { failed: number; locked: number; success: number; total: number; lastSeen: string; users: string[] }> = {};
  loginHistory.forEach((h: any) => {
    const ip = h.ipAddress || 'unknown';
    if (!ipMap[ip]) ipMap[ip] = { failed: 0, locked: 0, success: 0, total: 0, lastSeen: h.createdAt, users: [] };
    ipMap[ip].total++;
    if (h.status === 'FAILED') ipMap[ip].failed++;
    else if (h.status === 'LOCKED') ipMap[ip].locked++;
    else if (h.status === 'SUCCESS') ipMap[ip].success++;
    if (h.user?.fullName && !ipMap[ip].users.includes(h.user.fullName)) ipMap[ip].users.push(h.user.fullName);
    if (new Date(h.createdAt) > new Date(ipMap[ip].lastSeen)) ipMap[ip].lastSeen = h.createdAt;
  });
  const ipList = Object.entries(ipMap).sort((a, b) => b[1].failed - a[1].failed);
  const suspiciousIPs = ipList.filter(([, v]) => v.failed >= 3);

  const filtered = loginHistory.filter(h =>
    (!statusFilter || h.status === statusFilter) &&
    (!search || h.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      h.ipAddress?.includes(search) || h.user?.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const failedToday = loginHistory.filter(h => new Date(h.createdAt) >= today && h.status === 'FAILED').length;
  const lockedToday = loginHistory.filter(h => new Date(h.createdAt) >= today && h.status === 'LOCKED').length;
  const successToday = loginHistory.filter(h => new Date(h.createdAt) >= today && h.status === 'SUCCESS').length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Bảo mật & Giám sát IP</h2>
        <button onClick={onRefresh} className="text-xs text-ink-faint hover:text-ink border border-line px-3 py-1.5 rounded-lg hover:bg-surface transition-all">
          <i className="ri-refresh-line mr-1"></i>Làm mới
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Login hôm nay', value: successToday + failedToday + lockedToday },
          { label: 'Thành công', value: successToday },
          { label: 'Thất bại hôm nay', value: failedToday },
          { label: 'IP bị chặn', value: blockedIps.length },
        ].map((c, i) => (
          <div key={i} className="bg-surface rounded-card p-4 border border-line">
            <p className="text-2xl font-bold text-ink">{c.value}</p>
            <p className="text-xs text-ink-faint mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Suspicious IPs */}
      {suspiciousIPs.length > 0 && (
        <div className="bg-brand-50 border border-brand-200 rounded-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <i className="ri-alarm-warning-fill text-brand-600 text-lg"></i>
            <h3 className="font-bold text-brand-600">IP đáng ngờ ({suspiciousIPs.length})</h3>
            <span className="text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">≥ 3 lần thất bại</span>
          </div>
          <div className="space-y-2">
            {suspiciousIPs.map(([ip, data]) => {
              const isBlocked = blockedIpSet.has(ip);
              return (
                <div key={ip} className={`bg-surface rounded-lg border p-3 flex items-center gap-4 ${isBlocked ? 'border-line opacity-60' : 'border-brand-200'}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isBlocked ? 'bg-paper' : 'bg-brand-50'}`}>
                    <i className={`${isBlocked ? 'ri-lock-line text-ink-faint' : 'ri-spy-line text-brand-600'}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-ink font-mono text-sm">{ip}</p>
                      {isBlocked && <span className="text-[11px] bg-line text-ink-soft px-1.5 py-0.5 rounded font-semibold">ĐÃ CHẶN</span>}
                    </div>
                    <p className="text-xs text-ink-soft mt-0.5">
                      {data.users.length > 0 ? `Tài khoản: ${data.users.slice(0, 2).join(', ')}${data.users.length > 2 ? ` +${data.users.length - 2}` : ''}` : 'Không xác định'}
                      {' · '}Lần cuối: {timeAgo(data.lastSeen)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-center flex-shrink-0">
                    <div>
                      <p className="text-lg font-bold text-brand-600">{data.failed}</p>
                      <p className="text-[11px] text-ink-faint">Thất bại</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-brand-500">{data.locked}</p>
                      <p className="text-[11px] text-ink-faint">Bị khóa</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-forest-600">{data.success}</p>
                      <p className="text-[11px] text-ink-faint">Thành công</p>
                    </div>
                    <div className="ml-1 flex flex-col gap-1.5 items-end">
                      <span className={`text-xs px-2 py-0.5 rounded-lg font-bold ${
                        data.failed >= 10 ? 'bg-brand-500 text-white' :
                        data.failed >= 5 ? 'bg-brand-50 text-brand-600' :
                        'bg-brand-100 text-brand-700'
                      }`}>
                        {data.failed >= 10 ? 'Nguy hiểm' : data.failed >= 5 ? 'Cao' : 'Trung bình'}
                      </span>
                      {isBlocked ? (
                        <button
                          disabled={blockingIp === ip}
                          onClick={() => handleUnblockIp(ip)}
                          className="text-xs px-2.5 py-1 bg-paper hover:bg-line text-ink-soft rounded-lg font-semibold transition-all disabled:opacity-50">
                          {blockingIp === ip ? '...' : 'Bỏ chặn'}
                        </button>
                      ) : (
                        <button
                          disabled={blockingIp === ip}
                          onClick={() => handleBlockIp(ip, `${data.failed} lần đăng nhập thất bại`)}
                          className="text-xs px-2.5 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50">
                          {blockingIp === ip ? '...' : 'Chặn IP'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Blocked IPs management */}
      <div className="bg-surface rounded-card border border-line overflow-hidden">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="ri-shield-cross-line text-ink-soft"></i>
            <h3 className="font-bold text-ink">IP đang bị chặn ({blockedIps.length})</h3>
          </div>
          <button onClick={loadBlockedIps} className="text-xs text-ink-faint hover:text-ink border border-line px-2.5 py-1.5 rounded-lg transition-all">
            <i className="ri-refresh-line"></i>
          </button>
        </div>

        {/* Manual block form */}
        <div className="px-5 py-3 border-b border-line flex items-center gap-2 flex-wrap bg-paper">
          <input
            type="text" placeholder="Nhập địa chỉ IP..." value={manualIp} onChange={e => setManualIp(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleManualBlock()}
            className="text-xs border border-line rounded-lg px-3 py-2 w-40 focus:outline-none focus:ring-2 focus:ring-forest-400 bg-surface" />
          <input
            type="text" placeholder="Lý do (tuỳ chọn)..." value={manualReason} onChange={e => setManualReason(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleManualBlock()}
            className="text-xs border border-line rounded-lg px-3 py-2 flex-1 min-w-[160px] focus:outline-none focus:ring-2 focus:ring-forest-400 bg-surface" />
          <button
            disabled={addingManual || !manualIp.trim()}
            onClick={handleManualBlock}
            className="text-xs px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex-shrink-0">
            {addingManual ? 'Đang chặn...' : <><i className="ri-add-line mr-1"></i>Chặn IP</>}
          </button>
        </div>

        {blockedIps.length === 0 ? (
          <div className="py-8 text-center text-ink-faint text-sm">
            <i className="ri-shield-check-line text-2xl mb-2 block text-forest-400"></i>
            Không có IP nào bị chặn
          </div>
        ) : (
          <div className="divide-y divide-line">
            {blockedIps.map((b: any) => (
              <div key={b.id} className="px-5 py-3 flex items-center gap-4 hover:bg-paper">
                <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-lock-line text-brand-600 text-sm"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-bold text-ink text-sm">{b.ip}</p>
                  <p className="text-xs text-ink-faint mt-0.5 truncate">
                    {b.reason || 'Không có lý do'} · {fmtTime(b.createdAt)}
                  </p>
                </div>
                <button
                  disabled={blockingIp === b.ip}
                  onClick={() => handleUnblockIp(b.ip)}
                  className="text-xs px-3 py-1.5 border border-line hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600 text-ink-soft rounded-lg font-semibold transition-all disabled:opacity-50 flex-shrink-0">
                  {blockingIp === b.ip ? '...' : 'Bỏ chặn'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All IP table */}
      <div className="bg-surface rounded-card border border-line overflow-hidden">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-bold text-ink">Nhật ký đăng nhập ({loginHistory.length})</h3>
          <div className="flex gap-2">
            <input type="text" placeholder="Tìm IP, tên, email..." value={search} onChange={e => setSearch(e.target.value)}
              className="text-xs border border-line rounded-lg px-3 py-2 w-44 focus:outline-none focus:ring-2 focus:ring-forest-400" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="text-xs border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-forest-400">
              <option value="">Tất cả</option>
              <option value="SUCCESS">Thành công</option>
              <option value="FAILED">Thất bại</option>
              <option value="LOCKED">Bị khóa</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-surface border-b border-line">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-ink-soft">Người dùng</th>
                <th className="text-left px-4 py-3 font-semibold text-ink-soft">IP Address</th>
                <th className="text-left px-4 py-3 font-semibold text-ink-soft">User Agent</th>
                <th className="text-center px-4 py-3 font-semibold text-ink-soft">Trạng thái</th>
                <th className="text-right px-5 py-3 font-semibold text-ink-soft">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-ink-faint">Không có dữ liệu</td></tr>
              )}
              {filtered.slice(0, 100).map((h: any, i: number) => (
                <tr key={i} className={`hover:bg-paper ${h.status === 'FAILED' ? 'bg-brand-50/30' : h.status === 'LOCKED' ? 'bg-brand-50/30' : ''}`}>
                  <td className="px-5 py-2.5">
                    <p className="font-medium text-ink">{h.user?.fullName || '—'}</p>
                    <p className="text-ink-faint text-[11px]">{h.user?.email || h.user?.username}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-ink-soft">{h.ipAddress || '—'}</span>
                      {h.ipAddress && blockedIpSet.has(h.ipAddress) && (
                        <span className="text-[11px] bg-brand-50 text-brand-600 px-1 py-0.5 rounded font-bold">CHẶN</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-ink-faint max-w-[200px] truncate">{h.userAgent?.split(' ').slice(0, 3).join(' ') || '—'}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${
                      h.status === 'SUCCESS' ? 'bg-forest-100 text-forest-700' :
                      h.status === 'FAILED' ? 'bg-brand-50 text-brand-600' :
                      'bg-brand-100 text-brand-700'
                    }`}>
                      {h.status === 'SUCCESS' ? 'Thành công' : h.status === 'FAILED' ? 'Thất bại' : 'Bị khóa'}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-right text-ink-faint whitespace-nowrap">{fmtTime(h.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── UsersTab ─────────────────────────────────────────────────────────
function UsersTab({ usersList, loginHistory, onRefresh }: { usersList: any[]; loginHistory: any[]; onRefresh: () => void }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [banModal, setBanModal] = useState<{ user: any } | null>(null);
  const [banDuration, setBanDuration] = useState<'1d' | '7d' | '30d' | 'permanent'>('permanent');
  const [historyModal, setHistoryModal] = useState<{ user: any; logs: any[] } | null>(null);

  const filtered = usersList.filter(u =>
    (!search || u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search) ||
      u.username?.toLowerCase().includes(search.toLowerCase())) &&
    (!roleFilter || u.role?.toLowerCase() === roleFilter) &&
    (!statusFilter || (statusFilter === 'active' ? u.isActive : !u.isActive))
  );

  // Map last IP per user from loginHistory
  const userLastIP: Record<string, string> = {};
  const userFailedCount: Record<string, number> = {};
  loginHistory.forEach((h: any) => {
    if (h.userId || h.user?.id) {
      const uid = h.userId || h.user?.id;
      if (!userLastIP[uid]) userLastIP[uid] = h.ipAddress || '—';
      if (h.status === 'FAILED') userFailedCount[uid] = (userFailedCount[uid] || 0) + 1;
    }
  });

  async function confirmBan() {
    if (!banModal) return;
    const u = banModal.user;
    const isBanned = !u.isActive;
    if (!confirm(isBanned ? 'Mở khóa tài khoản này?' : `Khóa tài khoản "${u.fullName}"?`)) return;
    setProcessing(u.id);
    try {
      await adminFetch(`/users/${u.id}/ban`, {
        method: 'POST',
        body: JSON.stringify({ banned: !isBanned, duration: isBanned ? undefined : banDuration }),
      });
      onRefresh();
    } catch { alert('Thao tác thất bại'); }
    finally { setProcessing(null); setBanModal(null); }
  }

  async function handleRole(id: string, role: string) {
    setProcessing(id);
    try {
      await adminFetch(`/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) });
      onRefresh();
    } catch { alert('Đổi quyền thất bại'); }
    finally { setProcessing(null); }
  }

  async function handleHideAll(u: any) {
    if (!confirm(`Ẩn toàn bộ bài đăng của "${u.fullName}"?`)) return;
    setProcessing(u.id);
    try {
      const res = await adminFetch(`/users/${u.id}/hide-all`, { method: 'POST' });
      alert(`Đã ẩn: ${res.hidden?.products || 0} sản phẩm, ${res.hidden?.realEstates || 0} BĐS, ${res.hidden?.jobs || 0} tuyển dụng`);
      onRefresh();
    } catch { alert('Thao tác thất bại'); }
    finally { setProcessing(null); }
  }

  function showHistory(u: any) {
    const logs = loginHistory.filter(h => (h.userId || h.user?.id) === u.id);
    setHistoryModal({ user: u, logs });
  }

  const totalPosts = (u: any) =>
    (u._count?.products || 0) + (u._count?.realEstates || 0) + (u._count?.jobs || 0) + (u._count?.forumPosts || 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-ink">Người dùng ({filtered.length}/{usersList.length})</h2>
        <div className="flex gap-2 flex-wrap">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="text-xs border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-forest-400">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="banned">Đã khóa</option>
          </select>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="text-xs border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-forest-400">
            <option value="">Tất cả role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="vip">VIP</option>
          </select>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm tên, email, SĐT..."
            className="text-xs border border-line rounded-lg px-3 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-forest-400" />
        </div>
      </div>

      <div className="bg-surface rounded-card border border-line overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-line bg-paper">
              <th className="text-left px-4 py-3 font-semibold text-ink-soft">Người dùng</th>
              <th className="text-left px-4 py-3 font-semibold text-ink-soft">Liên hệ</th>
              <th className="text-center px-3 py-3 font-semibold text-ink-soft">Bài đăng</th>
              <th className="text-center px-3 py-3 font-semibold text-ink-soft">IP gần nhất</th>
              <th className="text-center px-3 py-3 font-semibold text-ink-soft">Role</th>
              <th className="text-center px-3 py-3 font-semibold text-ink-soft">Đăng ký</th>
              <th className="text-center px-4 py-3 font-semibold text-ink-soft">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-12 text-ink-faint">Không tìm thấy người dùng</td></tr>
            )}
            {filtered.map(u => {
              const failedCount = userFailedCount[u.id] || 0;
              const lastIP = userLastIP[u.id];
              return (
                <tr key={u.id} className={`hover:bg-paper transition-colors ${!u.isActive ? 'bg-brand-50/20' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        u.role === 'admin' ? 'bg-brand-500 text-white' :
                        u.role === 'vip' ? 'bg-gold-400 text-white' :
                        'bg-line text-ink-soft'
                      }`}>
                        {u.fullName?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-ink text-xs">{u.fullName || 'Chưa đặt tên'}</p>
                        {u.username && <p className="text-[11px] text-ink-faint">@{u.username}</p>}
                        <div className="flex items-center gap-1 mt-0.5">
                          {!u.isActive && <span className="text-[11px] text-brand-600 font-bold bg-brand-50 px-1.5 py-0.5 rounded-full">Bị khóa</span>}
                          {failedCount >= 3 && <span className="text-[11px] text-brand-600 font-bold bg-brand-50 px-1.5 py-0.5 rounded-full">{failedCount} thất bại</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    <p className="truncate max-w-[140px]">{u.email || '—'}</p>
                    {u.phone && <p className="text-ink-faint">{u.phone}</p>}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="font-bold text-ink">{totalPosts(u)}</span>
                    <p className="text-[11px] text-ink-faint">
                      {u._count?.products || 0}sp · {u._count?.realEstates || 0}bđs · {u._count?.jobs || 0}td
                    </p>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {lastIP ? (
                      <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${failedCount >= 3 ? 'text-brand-600 bg-brand-50' : 'text-ink-soft'}`}>
                        {lastIP}
                      </span>
                    ) : <span className="text-ink-faint">—</span>}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <select value={u.role?.toLowerCase() || 'user'} onChange={e => handleRole(u.id, e.target.value.toUpperCase())}
                      disabled={processing === u.id}
                      className="text-[11px] border border-line rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-forest-400 disabled:opacity-50">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="vip">VIP</option>
                    </select>
                  </td>
                  <td className="px-3 py-3 text-center text-ink-faint whitespace-nowrap">{fmtDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-center">
                      <button onClick={() => showHistory(u)}
                        title="Lịch sử đăng nhập"
                        className="p-1.5 text-ink-faint hover:text-ink-soft hover:bg-paper rounded-lg transition-all">
                        <i className="ri-time-line text-sm"></i>
                      </button>
                      <button onClick={() => handleHideAll(u)} disabled={processing === u.id}
                        title="Ẩn tất cả bài đăng"
                        className="p-1.5 text-ink-faint hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all disabled:opacity-50">
                        <i className="ri-eye-off-line text-sm"></i>
                      </button>
                      <button onClick={() => setBanModal({ user: u })} disabled={processing === u.id}
                        title={u.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                        className={`p-1.5 rounded-lg transition-all disabled:opacity-50 ${
                          !u.isActive
                            ? 'text-forest-600 bg-forest-50 hover:bg-forest-100'
                            : 'text-brand-600 hover:text-brand-600 hover:bg-brand-50'
                        }`}>
                        {processing === u.id
                          ? <i className="ri-loader-4-line text-sm animate-spin"></i>
                          : <i className={`${!u.isActive ? 'ri-lock-unlock-line' : 'ri-lock-2-line'} text-sm`}></i>}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Ban Modal */}
      {banModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-card w-full max-w-sm p-6">
            {banModal.user.isActive ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center">
                    <i className="ri-lock-2-line text-brand-600 text-lg"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-ink">Khóa tài khoản</h3>
                    <p className="text-xs text-ink-soft">{banModal.user.fullName}</p>
                  </div>
                </div>
                <p className="text-sm text-ink-soft mb-4">Chọn thời hạn khóa:</p>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {[
                    { value: '1d', label: '1 ngày' },
                    { value: '7d', label: '7 ngày' },
                    { value: '30d', label: '30 ngày' },
                    { value: 'permanent', label: 'Vĩnh viễn' },
                  ].map(opt => (
                    <button key={opt.value} onClick={() => setBanDuration(opt.value as any)}
                      className={`py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                        banDuration === opt.value
                          ? 'border-brand-200 bg-brand-50 text-brand-600'
                          : 'border-line text-ink-soft hover:border-line'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={confirmBan} className="flex-1 py-2.5 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-all">
                    Xác nhận khóa
                  </button>
                  <button onClick={() => setBanModal(null)} className="flex-1 py-2.5 border border-line rounded-lg text-ink-soft hover:bg-paper transition-all">
                    Huỷ
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-forest-100 rounded-lg flex items-center justify-center">
                    <i className="ri-lock-unlock-line text-forest-600 text-lg"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-ink">Mở khóa tài khoản</h3>
                    <p className="text-xs text-ink-soft">{banModal.user.fullName}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={confirmBan} className="flex-1 py-2.5 bg-forest-600 text-white rounded-lg font-semibold hover:bg-forest-700 transition-all">
                    Mở khóa
                  </button>
                  <button onClick={() => setBanModal(null)} className="flex-1 py-2.5 border border-line rounded-lg text-ink-soft hover:bg-paper transition-all">
                    Huỷ
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-card w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-paper rounded-lg flex items-center justify-center">
                  <i className="ri-time-line text-ink-soft"></i>
                </div>
                <div>
                  <h3 className="font-bold text-ink">Lịch sử đăng nhập</h3>
                  <p className="text-xs text-ink-soft">{historyModal.user.fullName}</p>
                </div>
              </div>
              <button onClick={() => setHistoryModal(null)} className="text-ink-faint hover:text-ink p-1">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            {historyModal.logs.length === 0 ? (
              <p className="text-center text-ink-faint py-8 text-sm">Chưa có lịch sử đăng nhập</p>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2">
                {historyModal.logs.map((h: any, i: number) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${
                    h.status === 'SUCCESS' ? 'bg-forest-50' :
                    h.status === 'FAILED' ? 'bg-brand-50' : 'bg-brand-50'
                  }`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      h.status === 'SUCCESS' ? 'bg-forest-500' :
                      h.status === 'FAILED' ? 'bg-brand-500' : 'bg-brand-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink font-mono">{h.ipAddress || '—'}</p>
                      <p className="text-[11px] text-ink-faint truncate">{h.userAgent?.split(' ').slice(0, 4).join(' ')}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-[11px] font-bold ${
                        h.status === 'SUCCESS' ? 'text-forest-700' :
                        h.status === 'FAILED' ? 'text-brand-600' : 'text-brand-600'
                      }`}>{h.status}</span>
                      <p className="text-[11px] text-ink-faint">{fmtTime(h.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ModerationTab ────────────────────────────────────────────────────
function ModerationTab({ posts, onRefresh }: { posts: any[]; onRefresh: () => void }) {
  const [items, setItems] = useState(posts);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; text: string } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => { setItems(posts); }, [posts]);

  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleAll() {
    setSelected(selected.size === items.length ? new Set() : new Set(items.map(p => p.id)));
  }

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
      setRejectModal(null);
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

  async function bulkApprove() {
    if (!selected.size) return;
    setProcessing('bulk');
    try {
      await Promise.all([...selected].map(id => adminFetch(`/forum/admin/posts/${id}/approve`, { method: 'POST' }).catch(() => {})));
      setItems(prev => prev.filter(p => !selected.has(p.id)));
      setSelected(new Set());
    } catch { alert('Lỗi xử lý hàng loạt'); }
    finally { setProcessing(null); }
  }

  async function bulkDelete() {
    if (!selected.size || !confirm(`Xóa ${selected.size} bài?`)) return;
    setProcessing('bulk');
    try {
      await Promise.all([...selected].map(id => adminFetch(`/forum/posts/${id}`, { method: 'DELETE' }).catch(() => {})));
      setItems(prev => prev.filter(p => !selected.has(p.id)));
      setSelected(new Set());
    } catch { alert('Lỗi xóa hàng loạt'); }
    finally { setProcessing(null); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-ink">Kiểm duyệt bài viết</h2>
          <p className="text-xs text-ink-faint mt-0.5">{items.length} bài chờ duyệt</p>
        </div>
        <a href="/admin/content"
          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-ink hover:bg-ink px-3 py-2 rounded-lg transition">
          <i className="ri-store-2-line"></i> Duyệt SP/BĐS/Việc làm
        </a>
        {selected.size > 0 && (
          <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 px-4 py-2 rounded-lg">
            <span className="text-xs font-bold text-brand-700">Đã chọn {selected.size}</span>
            <button onClick={bulkApprove} disabled={processing === 'bulk'}
              className="text-xs px-3 py-1.5 bg-forest-600 text-white rounded-lg hover:bg-forest-700 disabled:opacity-50">
              Duyệt tất cả
            </button>
            <button onClick={bulkDelete} disabled={processing === 'bulk'}
              className="text-xs px-3 py-1.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50">
              Xóa tất cả
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-surface rounded-card border border-line p-16 text-center">
          <div className="w-16 h-16 bg-forest-50 rounded-card flex items-center justify-center mx-auto mb-4">
            <i className="ri-checkbox-circle-line text-3xl text-forest-400"></i>
          </div>
          <p className="text-ink-soft font-semibold">Không có bài nào chờ duyệt</p>
          <p className="text-sm text-ink-faint mt-1">Tất cả bài đã được xử lý </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select all row */}
          <div className="bg-surface rounded-lg px-5 py-3 flex items-center gap-3 border border-line">
            <input type="checkbox" checked={selected.size === items.length && items.length > 0}
              onChange={toggleAll} className="rounded w-4 h-4 cursor-pointer" />
            <span className="text-xs text-ink-soft font-medium">Chọn tất cả ({items.length} bài)</span>
          </div>

          {items.map(post => (
            <div key={post.id} className="bg-surface rounded-card border border-line p-4">
              <div className="flex items-start gap-3">
                <input type="checkbox" checked={selected.has(post.id)} onChange={() => toggleSelect(post.id)}
                  className="rounded w-4 h-4 mt-1 cursor-pointer flex-shrink-0" />
                <div className="w-9 h-9 rounded-lg bg-forest-50 flex items-center justify-center flex-shrink-0">
                  <i className="ri-article-line text-forest-500"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="font-bold text-ink text-sm">{post.title}</p>
                      <p className="text-xs text-ink-faint mt-0.5">
                        {post.isAnonymous ? 'Ẩn danh' : post.user?.fullName} · {post.category} · {timeAgo(post.createdAt)}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-brand-100 text-brand-700 font-bold flex-shrink-0">Chờ duyệt</span>
                  </div>
                  {post.content && (
                    <p className="text-xs text-ink-soft mt-2 line-clamp-2 bg-paper rounded-lg px-3 py-2">{post.content}</p>
                  )}

                  {rejectModal && rejectModal.id === post.id && (
                    <div className="mt-3 flex gap-2">
                      <input type="text" placeholder="Lý do từ chối..." value={rejectModal.text}
                        onChange={e => setRejectModal({ id: post.id, text: e.target.value })}
                        className="flex-1 text-xs border border-brand-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-forest-400" autoFocus />
                      <button onClick={() => reject(post.id, rejectModal.text)} disabled={processing === post.id}
                        className="px-4 py-2 bg-brand-500 text-white text-xs rounded-lg hover:bg-brand-600 disabled:opacity-50 font-semibold">Gửi</button>
                      <button onClick={() => setRejectModal(null)} className="px-4 py-2 border border-line text-xs rounded-lg hover:bg-paper">Huỷ</button>
                    </div>
                  )}
                </div>
              </div>

              {rejectModal?.id !== post.id && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-line">
                  <button onClick={() => approve(post.id)} disabled={processing === post.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-forest-600 text-white text-xs rounded-lg hover:opacity-90 disabled:opacity-50 font-semibold">
                    <i className="ri-check-line"></i> Duyệt
                  </button>
                  <button onClick={() => setRejectModal({ id: post.id, text: '' })}
                    className="flex items-center gap-1.5 px-4 py-2 bg-brand-50 text-brand-700 text-xs rounded-lg hover:bg-brand-100 border border-brand-200 font-semibold">
                    <i className="ri-close-line"></i> Từ chối
                  </button>
                  <Link href={`/forum/${post.id}`} target="_blank"
                    className="flex items-center gap-1.5 px-4 py-2 border border-line text-ink-soft text-xs rounded-lg hover:bg-paper">
                    <i className="ri-external-link-line"></i> Xem
                  </Link>
                  <button onClick={() => deletePost(post.id)} disabled={processing === post.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-brand-50 text-brand-600 text-xs rounded-lg hover:bg-brand-50 border border-brand-200 ml-auto font-semibold disabled:opacity-50">
                    <i className="ri-delete-bin-line"></i> Xóa
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ContentTab ───────────────────────────────────────────────────────
function ContentTab({ title, items, color, renderRow, onDelete, editHref, onToggleVip }: {
  title: string; items: any[]; color: string;
  renderRow: (item: any) => React.ReactNode;
  onDelete: (id: string) => Promise<void>;
  editHref: (id: string) => string;
  onToggleVip?: (id: string, isVip: boolean) => Promise<void>;
}) {
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [togglingVip, setTogglingVip] = useState<string | null>(null);

  const filtered = items.filter(item =>
    !search || item.title?.toLowerCase().includes(search.toLowerCase()) ||
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
    if (!confirm(currentVip ? 'Hủy VIP?' : 'Đặt VIP?')) return;
    setTogglingVip(id);
    try { await onToggleVip(id, !currentVip); }
    catch { alert('Thao tác thất bại'); }
    finally { setTogglingVip(null); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-ink">{title} ({filtered.length}/{items.length})</h2>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm kiếm..."
          className="text-xs border border-line rounded-lg px-3 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-forest-400" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-surface rounded-card border border-line p-12 text-center">
          <p className="text-ink-faint">Không có dữ liệu</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item.id} className={`bg-surface rounded-lg border px-4 py-3 flex items-center gap-3 transition-all ${
              item.isVip ? 'border-gold-200 bg-gold-50/50' : 'border-line'
            }`}>
              {item.images?.[0]?.url && (
                <img src={item.images[0].url} className="w-11 h-11 rounded-lg object-cover flex-shrink-0 border border-line" />
              )}
              <div className="flex-1 flex items-center gap-4 min-w-0">
                {renderRow(item)}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {onToggleVip && (
                  <button onClick={() => handleToggleVip(item.id, item.isVip)} disabled={togglingVip === item.id} title={item.isVip ? 'Hủy VIP' : 'Đặt VIP'}
                    className={`p-2 rounded-lg transition-all disabled:opacity-50 ${item.isVip ? 'text-gold-500 bg-gold-50 hover:bg-gold-100' : 'text-ink-faint hover:text-gold-500 hover:bg-gold-50'}`}>
                    {togglingVip === item.id ? <i className="ri-loader-4-line text-sm animate-spin"></i> : <i className="ri-vip-crown-fill text-sm"></i>}
                  </button>
                )}
                <Link href={editHref(item.id)} className="p-2 text-ink-faint hover:text-ink-soft hover:bg-paper rounded-lg transition-all" title="Chỉnh sửa">
                  <i className="ri-pencil-line text-sm"></i>
                </Link>
                <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id}
                  className="p-2 text-ink-faint hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all disabled:opacity-50" title="Xóa">
                  {deleting === item.id ? <i className="ri-loader-4-line text-sm animate-spin"></i> : <i className="ri-delete-bin-line text-sm"></i>}
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
    const endpointMap: any = { 'Sản phẩm': `/products/${item.id}/vip`, 'BĐS': `/real-estates/${item.id}/vip`, 'Tuyển dụng': `/jobs/${item.id}/vip` };
    try {
      await adminFetch(endpointMap[item._type], { method: 'PATCH', body: JSON.stringify({ isVip: false }) });
      onRefresh();
    } catch { alert('Thao tác thất bại'); }
    finally { setProcessing(null); }
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-ink mb-4">Quản lý VIP ({vipItems.length} bài)</h2>
      {vipItems.length === 0 ? (
        <div className="bg-surface rounded-card border border-line p-12 text-center">
          <i className="ri-vip-crown-line text-4xl text-ink-faint block mb-3"></i>
          <p className="text-ink-faint">Chưa có bài VIP nào</p>
        </div>
      ) : (
        <div className="space-y-2">
          {vipItems.map(item => (
            <div key={item.id} className="bg-surface rounded-lg border border-gold-200 px-4 py-3 flex items-center gap-3 bg-gold-50/30">
              {item.images?.[0]?.url && <img src={item.images[0].url} className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gold-100 text-gold-700 font-bold">{item._type}</span>
                  <p className="font-semibold text-ink truncate text-sm">{item.title}</p>
                </div>
                <p className="text-xs text-ink-faint mt-0.5">{item.user?.fullName}</p>
                {item.vipExpiresAt && <p className="text-xs text-brand-500 mt-0.5">Hết hạn: {fmtDate(item.vipExpiresAt)}</p>}
              </div>
              <button onClick={() => removeVip(item)} disabled={processing === item.id}
                className="text-xs px-3 py-1.5 border border-brand-200 text-brand-600 rounded-lg hover:bg-brand-50 disabled:opacity-50 transition-all flex-shrink-0 font-semibold">
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
function WalletTab({ txList }: { txList: any[] }) {
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Manual credit form
  const [creditUserId, setCreditUserId] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [creditNote, setCreditNote] = useState('');
  const [crediting, setCrediting] = useState(false);
  const [creditResult, setCreditResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const PRESET_AMOUNTS = [50000, 100000, 150000, 200000, 500000];

  async function handleCredit() {
    if (!creditUserId.trim()) { setCreditResult({ ok: false, msg: 'Vui lòng nhập User ID' }); return; }
    const amount = parseInt(creditAmount);
    if (!amount || amount <= 0) { setCreditResult({ ok: false, msg: 'Số tiền không hợp lệ' }); return; }
    setCrediting(true); setCreditResult(null);
    try {
      const res: any = await wallet.adminCredit(creditUserId.trim(), amount, creditNote || undefined);
      setCreditResult({ ok: true, msg: res.message || 'Cộng tiền thành công' });
      setCreditUserId(''); setCreditAmount(''); setCreditNote('');
    } catch (e: any) {
      setCreditResult({ ok: false, msg: e.message || 'Lỗi khi cộng tiền' });
    } finally { setCrediting(false); }
  }

  const filtered = txList.filter(t => (!filter || t.status === filter) && (!typeFilter || t.type === typeFilter));
  const revenue = txList.filter(t => t.status === 'completed' && t.type === 'top_up').reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const pending = txList.filter(t => t.status === 'pending').reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const totalSpend = txList.filter(t => t.status === 'completed' && t.type !== 'top_up').reduce((s, t) => s + Math.abs(Number(t.amount) || 0), 0);
  const typeLabel: Record<string, string> = { top_up: 'Nạp tiền', spend: 'Chi tiêu', vip: 'Mua VIP', refund: 'Hoàn tiền' };

  return (
    <div>
      {/* Manual Credit Form */}
      <div className="bg-surface rounded-card border border-line p-5 mb-5">
        <p className="text-[11px] font-bold tracking-widest text-ink-faint uppercase mb-1">Công cụ test</p>
        <h3 className="text-sm font-bold text-ink mb-4">Cộng tiền thủ công vào ví</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-soft mb-1">User ID</label>
            <input value={creditUserId} onChange={e => setCreditUserId(e.target.value)}
              placeholder="Dán userId từ DB..."
              className="w-full px-3 py-2 border border-line rounded-lg text-xs focus:ring-2 focus:ring-brand-400 focus:border-transparent font-mono" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-soft mb-1">Số tiền</label>
            <input type="number" value={creditAmount} onChange={e => setCreditAmount(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-line rounded-lg text-xs focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {PRESET_AMOUNTS.map(a => (
                <button key={a} onClick={() => setCreditAmount(String(a))}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${creditAmount === String(a) ? 'bg-brand-500 text-white border-forest-600' : 'bg-paper text-ink-soft border-line hover:bg-line'}`}>
                  {a / 1000}k
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-soft mb-1">Ghi chú (tùy chọn)</label>
            <input value={creditNote} onChange={e => setCreditNote(e.target.value)}
              placeholder="Lý do..."
              className="w-full px-3 py-2 border border-line rounded-lg text-xs focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button onClick={handleCredit} disabled={crediting}
            className="px-5 py-2 bg-brand-500 text-white rounded-lg text-xs font-bold hover:bg-brand-600 disabled:opacity-50 transition">
            {crediting ? 'Đang xử lý...' : `+ Cộng ${creditAmount ? new Intl.NumberFormat('vi-VN').format(parseInt(creditAmount) || 0) + 'đ' : 'tiền'}`}
          </button>
          {creditResult && (
            <p className={`text-xs font-semibold ${creditResult.ok ? 'text-forest-600' : 'text-brand-600'}`}>
              {creditResult.ok ? 'Thành công: ' : 'Lỗi: '}{creditResult.msg}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-ink">Doanh thu & Giao dịch</h2>
        <div className="flex gap-2">
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="text-xs border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-forest-400">
            <option value="">Tất cả loại</option>
            <option value="top_up">Nạp tiền</option>
            <option value="spend">Chi tiêu</option>
          </select>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="text-xs border border-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-forest-400">
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Đang xử lý</option>
            <option value="completed">Hoàn thành</option>
            <option value="rejected">Thất bại</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Tổng nạp thành công', value: fmtMoney(revenue) },
          { label: 'Đang chờ xác nhận', value: fmtMoney(pending) },
          { label: 'Tổng chi tiêu VIP', value: fmtMoney(totalSpend) },
          { label: 'Tổng giao dịch', value: txList.length },
        ].map((c, i) => (
          <div key={i} className="bg-surface rounded-card p-4 border border-line">
            <p className="text-xl font-bold text-ink">{c.value}</p>
            <p className="text-xs text-ink-faint mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-card border border-line overflow-hidden">
        <div className="px-4 py-3 border-b border-line bg-paper flex items-center gap-2">
          <i className="ri-paypal-line text-ink-soft"></i>
          <p className="text-xs text-ink-faint">Giao dịch tự động qua <b>PayOS</b> — không cần xác nhận thủ công</p>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-line bg-paper">
              <th className="text-left px-4 py-3 font-semibold text-ink-soft">Người dùng</th>
              <th className="text-left px-4 py-3 font-semibold text-ink-soft">Loại</th>
              <th className="text-right px-4 py-3 font-semibold text-ink-soft">Số tiền</th>
              <th className="text-center px-4 py-3 font-semibold text-ink-soft">Trạng thái</th>
              <th className="text-center px-4 py-3 font-semibold text-ink-soft">Ngày</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-ink-faint">Không có giao dịch nào</td></tr>}
            {filtered.map(tx => (
              <tr key={tx.id} className="hover:bg-paper">
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{tx.user?.fullName || '—'}</p>
                  <p className="text-ink-faint">{tx.user?.email || tx.user?.phone}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full font-semibold ${tx.type === 'top_up' ? 'bg-paper text-ink-soft' : 'bg-forest-50 text-forest-600'}`}>
                    {typeLabel[tx.type] || tx.type}
                  </span>
                </td>
                <td className={`px-4 py-3 text-right font-bold ${Number(tx.amount) < 0 ? 'text-brand-600' : 'text-ink'}`}>
                  {Number(tx.amount) > 0 ? '+' : ''}{fmtMoney(Number(tx.amount))}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full font-semibold ${
                    tx.status === 'completed' ? 'bg-forest-100 text-forest-700' :
                    tx.status === 'pending' ? 'bg-brand-100 text-brand-700' : 'bg-brand-50 text-brand-600'
                  }`}>
                    {tx.status === 'completed' ? 'Hoàn thành' : tx.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-ink-faint">{fmtDate(tx.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ActivityTab (Audit Log) ──────────────────────────────────────────
function ActivityTab({ activity, loginHistory }: { activity: any[]; loginHistory: any[] }) {
  const [tab, setTab] = useState<'content' | 'login'>('content');

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-ink">Nhật ký hoạt động</h2>
        <div className="flex bg-paper rounded-lg p-1 gap-1">
          {[{ id: 'content', label: 'Nội dung', icon: 'ri-file-list-line' }, { id: 'login', label: 'Đăng nhập', icon: 'ri-login-box-line' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? 'bg-surface text-ink' : 'text-ink-soft hover:text-ink'}`}>
              <i className={t.icon}></i> {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'content' && (
        <div className="bg-surface rounded-card border border-line overflow-hidden">
          {activity.length === 0 ? (
            <div className="p-12 text-center text-ink-faint">Chưa có hoạt động nào</div>
          ) : (
            <div className="divide-y divide-line">
              {activity.map((a, i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-3.5 hover:bg-paper transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-ink"><b>{a.who}</b> {a.verb} <i>{a.title}</i></p>
                    <p className="text-[11px] text-ink-faint mt-0.5 flex items-center gap-1">
                      <i className="ri-time-line"></i>{timeAgo(a.time)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'login' && (
        <div className="bg-surface rounded-card border border-line overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line bg-paper">
                <th className="text-left px-5 py-3 font-semibold text-ink-soft">Người dùng</th>
                <th className="text-left px-4 py-3 font-semibold text-ink-soft">IP</th>
                <th className="text-center px-4 py-3 font-semibold text-ink-soft">Trạng thái</th>
                <th className="text-right px-5 py-3 font-semibold text-ink-soft">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line max-h-[600px] overflow-y-auto">
              {loginHistory.length === 0 && <tr><td colSpan={4} className="text-center py-12 text-ink-faint">Không có dữ liệu</td></tr>}
              {loginHistory.map((h: any, i: number) => (
                <tr key={i} className={`hover:bg-paper ${h.status === 'FAILED' ? 'bg-brand-50/20' : h.status === 'LOCKED' ? 'bg-brand-50/20' : ''}`}>
                  <td className="px-5 py-2.5">
                    <p className="font-medium text-ink">{h.user?.fullName || '—'}</p>
                    <p className="text-[11px] text-ink-faint">{h.user?.email}</p>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-ink-soft">{h.ipAddress || '—'}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${
                      h.status === 'SUCCESS' ? 'bg-forest-100 text-forest-700' :
                      h.status === 'FAILED' ? 'bg-brand-50 text-brand-600' : 'bg-brand-100 text-brand-700'
                    }`}>{h.status}</span>
                  </td>
                  <td className="px-5 py-2.5 text-right text-ink-faint">{fmtTime(h.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}