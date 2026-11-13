'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, users, analytics, products, realEstate, jobs, notifications, wallet as walletApi, forum, advertisements, sellerStats } from '../../lib/api';
import { shortMoney, timeAgo } from '../../lib/format';

// ?tab=... from the URL (and header shortcuts) -> tab id on this page
const TAB_MAP: Record<string, string> = {
  saved: 'engagement',
  liked: 'engagement',
  notifications: 'notifications',
  messages: 'overview',
  products: 'products',
  'vat-nuoi': 'vat-nuoi',
  'dich-vu': 'dich-vu',
  'real-estate': 'real-estate',
  jobs: 'jobs',
  wallet: 'wallet',
  engagement: 'engagement',
  advertisements: 'advertisements',
  forum: 'forum',
  'canh-bao': 'canh-bao',
  analytics: 'analytics',
  performance: 'analytics',
  security: 'security',
  settings: 'settings',
};

const NAV: { label: string; items: { id: string; label: string; icon: string }[] }[] = [
  {
    label: 'Tổng quan',
    items: [
      { id: 'overview', label: 'Tổng quan', icon: 'ri-dashboard-line' },
      { id: 'analytics', label: 'Hiệu suất', icon: 'ri-bar-chart-line' },
      { id: 'engagement', label: 'Đã lưu và tương tác', icon: 'ri-heart-line' },
      { id: 'notifications', label: 'Thông báo', icon: 'ri-notification-line' },
    ],
  },
  {
    label: 'Tin của tôi',
    items: [
      { id: 'products', label: 'Nông sản', icon: 'ri-plant-line' },
      { id: 'vat-nuoi', label: 'Vật nuôi', icon: 'ri-bear-smile-line' },
      { id: 'dich-vu', label: 'Dịch vụ', icon: 'ri-tools-line' },
      { id: 'real-estate', label: 'Bất động sản', icon: 'ri-home-4-line' },
      { id: 'jobs', label: 'Việc làm', icon: 'ri-briefcase-line' },
      { id: 'advertisements', label: 'Quảng cáo', icon: 'ri-megaphone-line' },
      { id: 'forum', label: 'Diễn đàn', icon: 'ri-chat-3-line' },
      { id: 'canh-bao', label: 'Cảnh báo', icon: 'ri-alert-line' },
    ],
  },
  {
    label: 'Tài khoản',
    items: [
      { id: 'security', label: 'Bảo mật', icon: 'ri-shield-check-line' },
      { id: 'settings', label: 'Cài đặt', icon: 'ri-settings-line' },
    ],
  },
];

const money = (n: number) => `${Number(n || 0).toLocaleString('vi-VN')}đ`;

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="grid min-h-[60vh] place-items-center text-ink-faint">Đang tải...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [myRealEstates, setMyRealEstates] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [myAds, setMyAds] = useState<any[]>([]);
  const [myForumPosts, setMyForumPosts] = useState<any[]>([]);
  const [myCanhBao, setMyCanhBao] = useState<any[]>([]);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [productStats, setProductStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      router.push('/profile');
      return;
    }
    const tabParam = searchParams.get('tab');
    if (tabParam && TAB_MAP[tabParam]) setActiveTab(TAB_MAP[tabParam]);
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && TAB_MAP[tabParam]) setActiveTab(TAB_MAP[tabParam]);
  }, [searchParams]);

  // The header's heart/bell fire this while the dashboard is already open
  useEffect(() => {
    function onSwitchTab(e: Event) {
      const tab = (e as CustomEvent).detail;
      if (tab && TAB_MAP[tab]) setActiveTab(TAB_MAP[tab]);
    }
    window.addEventListener('dashboard-switch-tab', onSwitchTab);
    return () => window.removeEventListener('dashboard-switch-tab', onSwitchTab);
  }, []);

  useEffect(() => {
    if (activeTab === 'wallet') router.push('/wallet');
  }, [activeTab, router]);

  async function loadData() {
    try {
      const userData = await users.getMe();
      setUser(userData);
      // Each part loads on its own so one failure does not blank the page
      const r = await Promise.allSettled([
        analytics.getOverview(),
        products.getMine(),
        realEstate.getMine(),
        jobs.getMine(),
        notifications.getAll(),
        advertisements.getMine(),
        forum.getMyPosts({ limit: 50 }),
        forum.getMyPosts({ category: 'CANH_BAO', limit: 50 }),
      ]);
      if (r[0].status === 'fulfilled') setStats(r[0].value);
      if (r[1].status === 'fulfilled') setMyProducts(r[1].value.data || []);
      if (r[2].status === 'fulfilled') setMyRealEstates(r[2].value.data || []);
      if (r[3].status === 'fulfilled') setMyJobs(r[3].value.data || []);
      if (r[4].status === 'fulfilled') setNotifs(r[4].value.data || []);
      if (r[5].status === 'fulfilled') setMyAds((r[5].value as any).data || []);
      if (r[6].status === 'fulfilled') setMyForumPosts((r[6].value as any).data || []);
      if (r[7].status === 'fulfilled') setMyCanhBao((r[7].value as any).data || []);
      walletApi.get().then((w: any) => setWalletBalance(Number(w.balance))).catch(() => {});
      sellerStats.getMyStats().then((s: any) => setProductStats(s)).catch(() => {});
    } catch (e: any) {
      setError(e.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  const unread = notifs.filter(n => !n.isRead).length;

  function goTab(id: string) {
    setActiveTab(id);
    if (id === 'notifications') notifications.getAll().then((d: any) => setNotifs(d.data || [])).catch(() => {});
    window.scrollTo({ top: 0 });
  }

  async function removeFrom<T extends { id: string }>(api: { delete: (id: string) => Promise<any> }, id: string, set: (f: (p: T[]) => T[]) => void, what: string) {
    if (!confirm(`Xóa ${what} này?`)) return;
    try { await api.delete(id); set(prev => prev.filter(x => x.id !== id)); }
    catch { alert('Xóa thất bại'); }
  }

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-[3px] border-forest-600 border-t-transparent" />
          <p className="text-sm text-ink-soft">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4 text-center">
        <div>
          <p className="mb-3 text-brand-600">{error}</p>
          <Link href="/profile" className="btn-primary">Đăng nhập lại</Link>
        </div>
      </div>
    );
  }

  const flatNav = NAV.flatMap(g => g.items);
  const current = flatNav.find(i => i.id === activeTab);

  return (
    <div className="min-h-screen bg-paper pb-8">
      <div className="mx-auto max-w-content px-4 py-4 sm:px-6 md:py-6">
        {/* Account header */}
        <div className="card flex flex-wrap items-center gap-3 p-4">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-forest-600 text-lg font-bold text-white">{user?.fullName?.[0] || 'U'}</div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold text-ink sm:text-xl">{user?.fullName}</h1>
            {user?.username && <p className="truncate text-[13px] text-ink-faint">@{user.username}</p>}
          </div>
          <Link href="/wallet" className="rounded-lg border border-line px-3 py-1.5 text-left hover:border-forest-500">
            <span className="block text-[11px] text-ink-faint">Số dư ví</span>
            <span className="block text-sm font-bold tabular-nums text-ink">{walletBalance !== null ? money(walletBalance) : '...'}</span>
          </Link>
          <button onClick={() => { auth.logout(); router.push('/'); }} className="btn-ghost shrink-0 !text-brand-600">
            <i className="ri-logout-box-line" aria-hidden="true" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>

        {/* Mobile tabs */}
        <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 md:hidden">
          {flatNav.map(t => (
            <button key={t.id} onClick={() => goTab(t.id)} className={`chip shrink-0 ${activeTab === t.id ? 'chip-active' : ''}`}>
              {t.label}
              {t.id === 'notifications' && unread > 0 && <span className="ml-1.5 rounded-full bg-brand-500 px-1.5 text-[11px] text-white">{unread}</span>}
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-6">
          {/* Desktop nav */}
          <nav className="hidden w-56 shrink-0 md:block" aria-label="Menu tài khoản">
            <div className="card sticky top-36 p-2">
              {NAV.map((g, gi) => (
                <div key={g.label} className={gi > 0 ? 'mt-2 border-t border-line pt-2' : ''}>
                  <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{g.label}</p>
                  {g.items.map(t => (
                    <button key={t.id} onClick={() => goTab(t.id)} aria-current={activeTab === t.id ? 'page' : undefined}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${activeTab === t.id ? 'bg-forest-50 font-semibold text-forest-800' : 'text-ink-soft hover:bg-paper'}`}>
                      <i className={`${t.icon} text-base`} aria-hidden="true" />
                      <span>{t.label}</span>
                      {t.id === 'notifications' && unread > 0 && <span className="ml-auto rounded-full bg-brand-500 px-1.5 text-[11px] text-white">{unread}</span>}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </nav>

          <main className="min-w-0 flex-1">
            {activeTab === 'overview' && (
              <Overview stats={stats} productStats={productStats} go={goTab} />
            )}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'engagement' && <EngagementTab />}

            {activeTab === 'products' && (
              <ProductsTab
                myProducts={myProducts.filter((p: any) => p.category !== 'VAT_NUOI' && p.category !== 'DICH_VU')}
                setMyProducts={setMyProducts}
                title="Nông sản của tôi" createHref="/products/create" createLabel="Đăng nông sản" emptyLabel="nông sản" accentColor="forest"
              />
            )}
            {activeTab === 'vat-nuoi' && (
              <ProductsTab
                myProducts={myProducts.filter((p: any) => p.category === 'VAT_NUOI')}
                setMyProducts={setMyProducts}
                title="Vật nuôi của tôi" createHref="/products/create?category=VAT_NUOI" createLabel="Đăng vật nuôi" emptyLabel="vật nuôi" accentColor="forest"
              />
            )}
            {activeTab === 'dich-vu' && (
              <ProductsTab
                myProducts={myProducts.filter((p: any) => p.category === 'DICH_VU')}
                setMyProducts={setMyProducts}
                title="Dịch vụ của tôi" createHref="/products/create?category=DICH_VU" createLabel="Đăng dịch vụ" emptyLabel="dịch vụ" accentColor="forest"
              />
            )}

            {activeTab === 'real-estate' && (
              <MyList
                title="Bất động sản của tôi" icon="ri-home-4-line" createHref="/real-estate/create" createLabel="Đăng tin nhà đất" empty="Bạn chưa có tin nhà đất nào"
                items={myRealEstates} viewHref={i => `/real-estate/${i.id}`} editHref={i => `/real-estate/${i.id}/edit`}
                onDelete={id => removeFrom(realEstate, id, setMyRealEstates, 'tin')}
                image={i => i.images?.[0]?.url}
                price={i => shortMoney(Number(i.price))}
                status={i => i.status === 'NEW' ? { text: 'Mới', tone: 'ok' } : i.status === 'TRADING' ? { text: 'Đang giao dịch', tone: 'warn' } : { text: i.status, tone: 'off' }}
                meta={i => [i.area ? `${i.area} m²` : '', i.address, `${i.viewCount ?? 0} lượt xem`]}
              />
            )}

            {activeTab === 'jobs' && (
              <MyList
                title="Việc làm của tôi" icon="ri-briefcase-line" createHref="/jobs/create" createLabel="Đăng tin tuyển dụng" empty="Bạn chưa có tin tuyển dụng nào"
                items={myJobs} viewHref={i => `/jobs/${i.id}`} editHref={i => `/jobs/${i.id}/edit`}
                onDelete={id => removeFrom(jobs, id, setMyJobs, 'tin')}
                price={i => i.salary || ''}
                status={i => i.isUrgent ? { text: 'Gấp', tone: 'bad' } : null}
                meta={i => [i.type === 'EMPLOYER' ? 'Tuyển dụng' : 'Tìm việc', i.location, `${i.viewCount ?? 0} lượt xem`]}
              />
            )}

            {activeTab === 'advertisements' && (
              <MyList
                title="Quảng cáo của tôi" icon="ri-megaphone-line" createHref="/advertisements/create" createLabel="Đăng quảng cáo" empty="Bạn chưa có quảng cáo nào"
                items={myAds} viewHref={i => `/advertisements/${i.id}`} editHref={i => `/advertisements/${i.id}/edit`}
                onDelete={id => removeFrom(advertisements, id, setMyAds, 'quảng cáo')}
                image={i => (typeof i.images?.[0] === 'string' ? i.images[0] : i.images?.[0]?.url)}
                meta={i => [i.businessName, i.location, i.startDate && i.endDate ? `${new Date(i.startDate).toLocaleDateString('vi-VN')} - ${new Date(i.endDate).toLocaleDateString('vi-VN')}` : '']}
              />
            )}

            {activeTab === 'forum' && (
              <MyList
                title="Bài diễn đàn của tôi" icon="ri-article-line" createHref="/forum/create" createLabel="Viết bài mới" empty="Bạn chưa có bài viết nào"
                items={myForumPosts} viewHref={i => `/forum/${i.id}`} editHref={i => `/forum/${i.id}/edit`}
                onDelete={id => removeFrom(forum, id, setMyForumPosts, 'bài viết')}
                image={i => (typeof i.images?.[0] === 'string' ? i.images[0] : i.images?.[0]?.url)}
                status={i => i.publishStatus === 'PUBLISHED' ? { text: 'Đã đăng', tone: 'ok' } : { text: 'Nháp', tone: 'off' }}
                meta={i => [`${i.likeCount || 0} thích`, `${i._count?.comments || 0} bình luận`, `${i.viewCount || 0} lượt xem`]}
              />
            )}

            {activeTab === 'canh-bao' && (
              <MyList
                title="Cảnh báo của tôi" icon="ri-alert-line" createHref="/canh-bao/create" createLabel="Đăng cảnh báo" empty="Bạn chưa đăng cảnh báo nào"
                items={myCanhBao} viewHref={i => `/canh-bao/${i.id}`} editHref={i => `/canh-bao/${i.id}/edit`}
                onDelete={id => removeFrom(forum, id, setMyCanhBao, 'cảnh báo')}
                meta={i => [`${i.viewCount || 0} lượt xem`, i.createdAt ? new Date(i.createdAt).toLocaleDateString('vi-VN') : '']}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationsTab
                notifs={notifs}
                onOpen={async (n, url) => {
                  if (!n.isRead) {
                    await notifications.markRead(n.id).catch(() => {});
                    setNotifs(prev => prev.map(x => (x.id === n.id ? { ...x, isRead: true } : x)));
                  }
                  if (url) router.push(url);
                }}
                onReadAll={async () => { await notifications.markAllRead(); setNotifs(prev => prev.map(n => ({ ...n, isRead: true }))); }}
              />
            )}

            {activeTab === 'security' && <SecurityTab />}
            {activeTab === 'settings' && user && <SettingsTab user={user} onUpdate={setUser} />}
          </main>
        </div>
      </div>
      {current && <span className="sr-only" aria-live="polite">{current.label}</span>}
    </div>
  );
}

// =================== OVERVIEW ===================
function Overview({ stats, productStats, go }: { stats: any; productStats: any; go: (id: string) => void }) {
  const s = stats || {};
  const tiles = [
    { label: 'Tin đang đăng', value: s.totalListings ?? 0, onClick: () => go('products') },
    { label: 'Lượt xem', value: Number(s.totalViews || 0).toLocaleString('vi-VN'), onClick: () => go('analytics') },
    { label: 'Tin nhắn mới', value: s.unreadMessages ?? 0, href: '/messages' },
    { label: 'Gói VIP', value: s.vip ? `${s.vip.plan} · còn ${s.vip.daysLeft} ngày` : 'Chưa có', href: '/pricing', small: true },
  ];
  const breakdown = [
    { label: 'Sản phẩm', value: s.breakdown?.products, tab: 'products' },
    { label: 'Bất động sản', value: s.breakdown?.realEstates, tab: 'real-estate' },
    { label: 'Việc làm', value: s.breakdown?.jobs, tab: 'jobs' },
    { label: 'Diễn đàn', value: s.breakdown?.forumPosts, tab: 'forum' },
  ];
  const tileCls = 'card block p-4 text-left transition-colors hover:border-forest-500';

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-ink">Tổng quan</h2>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(t => {
          const inner = (
            <>
              <p className="text-[13px] text-ink-faint">{t.label}</p>
              <p className={`mt-1 font-bold tabular-nums text-ink ${t.small ? 'text-base' : 'text-3xl'}`}>{t.value}</p>
            </>
          );
          return t.href
            ? <Link key={t.label} href={t.href} className={tileCls}>{inner}</Link>
            : <button key={t.label} onClick={t.onClick} className={tileCls}>{inner}</button>;
        })}
      </div>

      <div className="card divide-y divide-line">
        <h3 className="px-4 py-3 text-[15px] font-bold text-ink">Tin theo loại</h3>
        {breakdown.map(b => (
          <button key={b.tab} onClick={() => go(b.tab)} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-paper">
            <span className="text-ink-soft">{b.label}</span>
            <span className="flex items-center gap-2 font-bold tabular-nums text-ink">{b.value || 0}<i className="ri-arrow-right-s-line text-ink-faint" aria-hidden="true" /></span>
          </button>
        ))}
      </div>

      {productStats?.topProducts?.length > 0 && (
        <div className="card p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-[15px] font-bold text-ink">Tin được xem nhiều nhất</h3>
            <p className="text-[13px] text-ink-faint">
              Đang đăng <b className="text-ink">{productStats.activeCount || 0}</b> · Chờ duyệt <b className="text-ink">{productStats.pendingCount || 0}</b>
            </p>
          </div>
          <ol className="mt-3 divide-y divide-line">
            {productStats.topProducts.map((p: any, i: number) => (
              <li key={p.id} className="flex items-center gap-3 py-2.5">
                <span className="w-5 text-center text-sm font-bold text-ink-faint">{i + 1}</span>
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-paper">
                  {p.images?.[0]?.url ? <img src={p.images[0].url} alt="" className="h-full w-full object-cover" /> : <i className="ri-image-line grid h-full place-items-center text-ink-faint" />}
                </div>
                <Link href={`/products/${p.id}`} className="min-w-0 flex-1 truncate text-sm font-medium text-ink hover:text-forest-700">{p.title}</Link>
                <span className="shrink-0 text-right text-sm font-bold tabular-nums text-ink">{(p.viewCount || 0).toLocaleString('vi-VN')}<span className="block text-[11px] font-normal text-ink-faint">lượt xem</span></span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="card p-4">
        <h3 className="text-[15px] font-bold text-ink">Đăng tin mới</h3>
        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[
            { href: '/products/create', label: 'Sản phẩm' },
            { href: '/real-estate/create', label: 'Nhà đất' },
            { href: '/jobs/create', label: 'Việc làm' },
            { href: '/forum/create', label: 'Bài diễn đàn' },
          ].map(a => <Link key={a.href} href={a.href} className="btn-ghost justify-center"><i className="ri-add-line" aria-hidden="true" />{a.label}</Link>)}
        </div>
      </div>
    </div>
  );
}

// =================== GENERIC "MY LISTINGS" LIST ===================
type Tone = 'ok' | 'warn' | 'bad' | 'off';
const TONE: Record<Tone, string> = {
  ok: 'bg-forest-50 text-forest-800',
  warn: 'bg-gold-100 text-gold-700',
  bad: 'bg-brand-50 text-brand-600',
  off: 'bg-paper text-ink-soft',
};

function MyList({ title, icon, createHref, createLabel, empty, items, viewHref, editHref, onDelete, image, price, status, meta }: {
  title: string; icon: string; createHref: string; createLabel: string; empty: string;
  items: any[]; viewHref: (i: any) => string; editHref: (i: any) => string; onDelete: (id: string) => void;
  image?: (i: any) => string | undefined; price?: (i: any) => string;
  status?: (i: any) => { text: string; tone: Tone } | null; meta?: (i: any) => (string | undefined)[];
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-ink">{title} <span className="font-medium text-ink-faint">({items.length})</span></h2>
        <Link href={createHref} className="btn-primary shrink-0"><i className="ri-add-line" aria-hidden="true" />{createLabel}</Link>
      </div>

      {items.length === 0 ? (
        <div className="card px-6 py-12 text-center">
          <i className={`${icon} text-4xl text-ink-faint`} aria-hidden="true" />
          <p className="mb-4 mt-2 text-ink-soft">{empty}</p>
          <Link href={createHref} className="btn-primary">{createLabel}</Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map(item => {
            const img = image?.(item);
            const st = status?.(item);
            const p = price?.(item);
            const m = (meta?.(item) || []).filter(Boolean);
            return (
              <li key={item.id} className="card flex items-center gap-3 p-3">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-paper text-ink-faint">
                  {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : <i className={`${icon} text-xl`} aria-hidden="true" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <Link href={viewHref(item)} className="line-clamp-2 flex-1 text-[15px] font-medium leading-snug text-ink hover:text-forest-700">{item.title}</Link>
                    {st && <span className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold ${TONE[st.tone]}`}>{st.text}</span>}
                  </div>
                  {p && <p className="mt-0.5 text-sm font-bold text-forest-700">{p}</p>}
                  {m.length > 0 && <p className="mt-0.5 truncate text-[12px] text-ink-faint">{m.join(' · ')}</p>}
                </div>
                <div className="flex shrink-0 items-center">
                  <Link href={editHref(item)} aria-label="Sửa" className="grid h-9 w-9 place-items-center rounded-lg text-ink-soft hover:bg-paper hover:text-forest-700"><i className="ri-edit-line text-lg" /></Link>
                  <button onClick={() => onDelete(item.id)} aria-label="Xóa" className="grid h-9 w-9 place-items-center rounded-lg text-ink-soft hover:bg-brand-50 hover:text-brand-600"><i className="ri-delete-bin-line text-lg" /></button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// =================== NOTIFICATIONS ===================
function NotificationsTab({ notifs, onOpen, onReadAll }: { notifs: any[]; onOpen: (n: any, url: string | null) => void; onReadAll: () => void }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink">Thông báo</h2>
        {notifs.some(n => !n.isRead) && <button onClick={onReadAll} className="text-sm font-semibold text-forest-700 hover:underline">Đánh dấu tất cả đã đọc</button>}
      </div>
      {notifs.length === 0 ? (
        <div className="card px-6 py-12 text-center">
          <i className="ri-notification-line text-4xl text-ink-faint" aria-hidden="true" />
          <p className="mt-2 text-ink-soft">Chưa có thông báo nào</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifs.map(n => {
            const d = n.data as any;
            const url = d?.url
              || (d?.conversationId ? `/messages/${d.conversationId}` : null)
              || (d?.targetType && d?.targetId ? (d.targetType === 'REAL_ESTATE' ? `/real-estate/${d.targetId}` : d.targetType === 'JOB' ? `/jobs/${d.targetId}` : `/products/${d.targetId}`) : null)
              || (n.relatedId ? `/products/${n.relatedId}` : null);
            const icon = n.type?.includes('LIKE') ? 'ri-heart-line' : n.type?.includes('COMMENT') ? 'ri-chat-1-line' : n.type === 'MESSAGE' ? 'ri-message-3-line' : 'ri-notification-3-line';
            return (
              <li key={n.id}>
                <button onClick={() => onOpen(n, url)}
                  className={`card flex w-full items-start gap-3 p-3 text-left transition-colors hover:border-forest-500 ${n.isRead ? '' : '!border-forest-300 !bg-forest-50/50'}`}>
                  <i className={`${icon} mt-0.5 text-lg ${n.isRead ? 'text-ink-faint' : 'text-forest-700'}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm ${n.isRead ? 'text-ink-soft' : 'font-bold text-ink'}`}>{n.title}</span>
                    {n.body && <span className="mt-0.5 block text-sm text-ink-soft">{n.body}</span>}
                    <span className="mt-1 block text-[12px] text-ink-faint">{timeAgo(n.createdAt)}</span>
                  </span>
                  {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" aria-label="Chưa đọc" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}


function SecurityTab() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API_URL}/users/me/login-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setHistory(data.data || []);
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function getStatusStyle(status: string) {
    if (status === 'SUCCESS') return 'bg-forest-100 text-forest-700';
    if (status === 'FAILED') return 'bg-red-100 text-red-700';
    if (status === 'LOCKED') return 'bg-brand-100 text-brand-700';
    return 'bg-gray-100 text-gray-700';
  }

  function getStatusLabel(status: string) {
    if (status === 'SUCCESS') return 'Thành công';
    if (status === 'FAILED') return 'Sai mật khẩu';
    if (status === 'LOCKED') return 'Bị khóa';
    return status;
  }

  function formatDevice(userAgent: string) {
    if (!userAgent) return 'Không rõ';
    if (userAgent.includes('Mobile')) return 'Điện thoại';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    return 'Trình duyệt';
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Bảo mật tài khoản</h2>

      <div className="bg-white rounded-xl p-6  mb-6">
        <div className="flex items-center gap-2 mb-2">
          <i className="ri-lock-password-line text-forest-600 text-xl"></i>
          <h3 className="font-semibold text-gray-900">Khóa tài khoản tự động</h3>
        </div>
        <p className="text-sm text-gray-500">Tài khoản sẽ bị khóa <strong>15 phút</strong> nếu nhập sai mật khẩu <strong>5 lần liên tiếp</strong>.</p>
      </div>

      <div className="bg-white rounded-xl p-6 ">
        <h3 className="font-semibold text-gray-900 mb-4">Lịch sử đăng nhập gần đây</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Đang tải...</p>
        ) : history.length === 0 ? (
          <p className="text-gray-400 text-sm">Chưa có lịch sử đăng nhập</p>
        ) : (
          <div className="space-y-3">
            {history.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <i className={`text-xl ${item.status === 'SUCCESS' ? 'ri-shield-check-line text-forest-500' : 'ri-shield-cross-line text-red-500'}`}></i>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{formatDevice(item.userAgent)}</p>
                    <p className="text-xs text-gray-400">{item.ipAddress} · {new Date(item.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusStyle(item.status)}`}>
                  {getStatusLabel(item.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsTab({ user, onUpdate }: { user: any; onUpdate: (u: any) => void }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const [form, setForm] = useState({
    fullName: user.fullName || '',
    address: user.address || '',
    phone: user.phone || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState('');

  // Email verification state
  const [emailInput, setEmailInput] = useState(user.email || '');
  const [otpInput, setOtpInput] = useState('');
  const [emailStep, setEmailStep] = useState<'idle' | 'otp'>('idle');
  const [emailMsg, setEmailMsg] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  function startCountdown() {
    setCountdown(60);
    const t = setInterval(() => setCountdown(p => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; }), 1000);
  }

  async function handleSendEmailOtp(e: React.FormEvent) {
    e.preventDefault();
    setEmailLoading(true); setEmailMsg('');
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/users/me/add-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: emailInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setEmailMsg('Đã gửi mã OTP tới email của bạn');
      setEmailStep('otp');
      startCountdown();
    } catch (err: any) {
      setEmailMsg(err.message || 'Có lỗi xảy ra');
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleVerifyEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailLoading(true); setEmailMsg('');
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/users/me/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: otpInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setEmailMsg('Xác thực email thành công!');
      setEmailStep('idle');
      onUpdate({ ...user, email: emailInput, isEmailVerified: true });
    } catch (err: any) {
      setEmailMsg(err.message || 'Có lỗi xảy ra');
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await users.updateProfile(form);
      onUpdate({ ...user, ...(updated as any) });
      setMsg('Lưu thành công!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e.message || 'Lỗi lưu thông tin');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!user.isEmailVerified) {
      setAvatarMsg('Vui lòng xác thực email trước khi cập nhật ảnh đại diện');
      return;
    }
    setAvatarUploading(true);
    setAvatarMsg('');
    try {
      const { uploads } = await import('../../lib/api');
      const { url } = await uploads.uploadImage(file);
      const updated = await users.updateProfile({ avatarUrl: url });
      onUpdate({ ...user, ...(updated as any), avatarUrl: url });
      setAvatarMsg('Cập nhật ảnh đại diện thành công!');
      setTimeout(() => setAvatarMsg(''), 3000);
    } catch (err: any) {
      setAvatarMsg(err.message || 'Lỗi tải ảnh lên');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg('Mật khẩu mới không khớp');
      return;
    }
    try {
      const { auth: authApi } = await import('../../lib/api');
      await authApi.changePassword(pwForm.currentPassword, pwForm.newPassword);
      setPwMsg('Đổi mật khẩu thành công!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      setPwMsg(e.message || 'Lỗi đổi mật khẩu');
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Cài đặt tài khoản</h2>

      {/* Avatar */}
      <div className="bg-white rounded-xl p-6  mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Ảnh đại diện</h3>
        <div className="flex items-center gap-5">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-forest-200" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-bold text-2xl">
              {user.fullName?.[0] || 'U'}
            </div>
          )}
          <div>
            {user.isEmailVerified ? (
              <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${avatarUploading ? 'bg-gray-400' : 'bg-brand-500 hover:bg-brand-600'}`}>
                <i className={avatarUploading ? 'ri-loader-4-line animate-spin' : 'ri-camera-line'}></i>
                {avatarUploading ? 'Đang tải...' : 'Đổi ảnh đại diện'}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={avatarUploading} />
              </label>
            ) : (
              <div>
                <button disabled className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gray-300 cursor-not-allowed">
                  <i className="ri-camera-line"></i> Đổi ảnh đại diện
                </button>
                <p className="text-xs text-brand-500 mt-1.5 flex items-center gap-1">
                  <i className="ri-information-line"></i> Cần xác thực email để đổi ảnh
                </p>
              </div>
            )}
            {avatarMsg && (
              <p className={`text-xs mt-1.5 ${avatarMsg.includes('thành công') ? 'text-forest-600' : 'text-red-500'}`}>{avatarMsg}</p>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-xl p-6  mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Thông tin cá nhân</h3>
        <form onSubmit={handleSaveProfile}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
              <input
                type="text"
                value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
              <input
                type="text"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="flex items-center gap-2">
              <input type="text" value={user.email || 'Chưa có email'} disabled className="flex-1 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
              {user.isEmailVerified
                ? <span className="text-forest-600 text-sm font-medium whitespace-nowrap">Đã xác thực</span>
                : <span className="text-brand-500 text-sm font-medium whitespace-nowrap">Chưa xác thực</span>
              }
            </div>
          </div>

          {msg && (
            <p className={`mt-3 text-sm ${msg.includes('thành công') ? 'text-forest-600' : 'text-red-600'}`}>{msg}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-4 bg-brand-500 text-white px-6 py-2 rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl p-6 ">
        <h3 className="font-semibold text-gray-900 mb-4">Đổi mật khẩu</h3>
        <form onSubmit={handleChangePassword}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
              <input
                type="password"
                value={pwForm.currentPassword}
                onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={pwForm.confirmPassword}
                onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {pwMsg && (
            <p className={`mt-3 text-sm ${pwMsg.includes('thành công') ? 'text-forest-600' : 'text-red-600'}`}>{pwMsg}</p>
          )}

          <button
            type="submit"
            className="mt-4 bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition-colors"
          >
            Đổi mật khẩu
          </button>
        </form>
      </div>

      {/* Email Verification */}
      {!user.isEmailVerified && (
        <div className="bg-white rounded-xl p-6  mt-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-gray-900">Xác thực email</h3>
            <span className="bg-brand-100 text-brand-600 text-xs px-2 py-0.5 rounded-full">Bắt buộc để đăng bài</span>
          </div>

          {emailMsg && (
            <p className={`mb-3 text-sm ${emailMsg.includes('thành công') ? 'text-forest-600' : emailMsg.includes('gửi') ? 'text-forest-600' : 'text-red-600'}`}>{emailMsg}</p>
          )}

          {emailStep === 'idle' ? (
            <form onSubmit={handleSendEmailOtp} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {user.email ? 'Email của bạn' : 'Thêm email'}
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              <button type="submit" disabled={emailLoading}
                className="bg-brand-500 text-white px-6 py-2 rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50">
                {emailLoading ? 'Đang gửi...' : 'Gửi mã xác thực'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyEmail} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã OTP (6 chữ số)</label>
                <input
                  type="text"
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={emailLoading || otpInput.length !== 6}
                  className="bg-brand-500 text-white px-6 py-2 rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50">
                  {emailLoading ? 'Đang xác nhận...' : 'Xác nhận'}
                </button>
                <button type="button" onClick={handleSendEmailOtp} disabled={countdown > 0 || emailLoading}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm">
                  {countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi lại OTP'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {user.isEmailVerified && (
        <div className="bg-forest-50 border border-forest-200 rounded-xl p-4 mt-6 flex items-center gap-3">
          <i className="ri-checkbox-circle-fill text-forest-600 text-xl"></i>
          <div>
            <p className="font-medium text-forest-800">Email đã được xác thực</p>
            <p className="text-sm text-forest-600">{user.email}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// =================== PRODUCTS TAB COMPONENT ===================
function ProductsTab({
  myProducts,
  setMyProducts,
  title = 'Sản phẩm của tôi',
  createHref = '/products/create',
  createLabel = '+ Đăng sản phẩm',
  emptyLabel = 'sản phẩm',
  accentColor = 'forest',
}: {
  myProducts: any[];
  setMyProducts: any;
  title?: string;
  createHref?: string;
  createLabel?: string;
  emptyLabel?: string;
  accentColor?: string;
}) {
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null);
  const [quantityValue, setQuantityValue] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Xóa sản phẩm này?')) return;
    setActionLoading(id + '-delete');
    try {
      await products.delete(id);
      setMyProducts((prev: any[]) => prev.filter(p => p.id !== id));
    } catch { alert('Xóa thất bại'); }
    finally { setActionLoading(null); }
  }

  async function handleRestore(id: string) {
    setActionLoading(id + '-restore');
    try {
      await products.restore(id);
      setMyProducts((prev: any[]) => prev.map(p => p.id === id ? { ...p, isDeleted: false, status: 'ACTIVE' } : p));
    } catch { alert('Khôi phục thất bại'); }
    finally { setActionLoading(null); }
  }

  async function handleToggleStatus(product: any) {
    const newStatus = product.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setActionLoading(product.id + '-status');
    try {
      await products.updateStatus(product.id, newStatus);
      setMyProducts((prev: any[]) => prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
    } catch { alert('Cập nhật thất bại'); }
    finally { setActionLoading(null); }
  }

  async function handleSaveQuantity(id: string) {
    const qty = Number(quantityValue);
    if (isNaN(qty) || qty < 0) { alert('Số lượng không hợp lệ'); return; }
    setActionLoading(id + '-qty');
    try {
      const updated = await products.updateQuantity(id, qty);
      setMyProducts((prev: any[]) => prev.map(p => p.id === id ? { ...p, quantity: qty, status: qty <= 0 ? 'SOLD_OUT' : p.status } : p));
      setEditingQuantity(null);
    } catch { alert('Cập nhật thất bại'); }
    finally { setActionLoading(null); }
  }

  const statusLabel: any = { ACTIVE: 'Đang hiển thị', PAUSED: 'Tạm dừng', SOLD_OUT: 'Hết hàng', DRAFT: 'Nháp' };
  const statusColor: any = {
    ACTIVE: 'bg-forest-100 text-forest-700',
    PAUSED: 'bg-gold-100 text-gold-700',
    SOLD_OUT: 'bg-red-100 text-red-700',
    DRAFT: 'bg-gray-100 text-gray-600',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">{title} ({myProducts.length})</h2>
        <Link href={createHref} className={`bg-${accentColor}-600 text-white px-4 py-2 rounded-lg hover:bg-${accentColor}-700 text-sm`}>
          {createLabel}
        </Link>
      </div>

      {myProducts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center ">
          <i className="ri-plant-line text-5xl text-gray-300 block mb-3"></i>
          <p className="text-gray-500 mb-4">Bạn chưa có {emptyLabel} nào</p>
          <Link href={createHref} className={`bg-${accentColor}-600 text-white px-6 py-2 rounded-lg hover:bg-${accentColor}-700`}>
            Đăng {emptyLabel} ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {myProducts.map(product => (
            <div key={product.id} className={`bg-white rounded-xl p-4  ${product.isDeleted ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-4">
                {/* Ảnh */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {product.images?.[0] ? (
                    <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="ri-image-line text-gray-400 text-xl"></i>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-gray-900 truncate">{product.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${statusColor[product.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabel[product.status] || product.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className={`text-${accentColor}-600 font-semibold text-sm`}>{Number(product.price).toLocaleString()}đ/{product.unit}</span>
                    {product.isVip && (
                      <span className="text-xs bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded">VIP</span>
                    )}
                    <span className="text-xs text-gray-400"><i className="ri-eye-line mr-1"></i>{product.viewCount}</span>
                  </div>

                  {/* Tồn kho */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">Tồn kho:</span>
                    {editingQuantity === product.id ? (
                      <div className="flex items-center gap-1">
                        <input type="number" value={quantityValue} onChange={e => setQuantityValue(e.target.value)}
                          className="w-20 px-2 py-0.5 border border-gray-300 rounded text-xs" min="0" autoFocus />
                        <button onClick={() => handleSaveQuantity(product.id)}
                          disabled={actionLoading === product.id + '-qty'}
                          className={`text-xs bg-${accentColor}-600 text-white px-2 py-0.5 rounded hover:bg-${accentColor}-700 disabled:opacity-50`}>
                          {actionLoading === product.id + '-qty' ? '...' : 'Lưu'}
                        </button>
                        <button onClick={() => setEditingQuantity(null)} className="text-xs text-gray-500 hover:text-gray-700">Hủy</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingQuantity(product.id); setQuantityValue(String(product.quantity ?? 0)); }}
                        className="text-xs text-blue-600 hover:underline">
                        {product.quantity ?? 0} {product.unit} (sửa)
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t flex-wrap">
                <Link href={`/products/${product.id}`}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50">
                  <i className="ri-eye-line"></i> Xem
                </Link>

                {!product.isDeleted && (
                  <Link href={`/products/${product.id}/edit`}
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-brand-600 px-2 py-1 rounded hover:bg-forest-50">
                    <i className="ri-edit-line"></i> Sửa
                  </Link>
                )}

                {!product.isDeleted && product.status !== 'SOLD_OUT' && (
                  <button onClick={() => handleToggleStatus(product)}
                    disabled={actionLoading === product.id + '-status'}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors disabled:opacity-50 ${
                      product.status === 'ACTIVE'
                        ? 'text-gold-600 hover:bg-gold-50'
                        : 'text-forest-600 hover:bg-forest-50'
                    }`}>
                    <i className={product.status === 'ACTIVE' ? 'ri-pause-circle-line' : 'ri-play-circle-line'}></i>
                    {actionLoading === product.id + '-status' ? '...' : product.status === 'ACTIVE' ? 'Tạm dừng' : 'Hiển thị lại'}
                  </button>
                )}

                {!product.isDeleted && !product.isVip && (
                  <Link href={`/products/vip?id=${product.id}`}
                    className="flex items-center gap-1 text-xs text-gold-600 hover:text-gold-700 px-2 py-1 rounded hover:bg-gold-50">
                    <i className="ri-vip-crown-line"></i> Nâng VIP
                  </Link>
                )}

                {!product.isDeleted ? (
                  <button onClick={() => handleDelete(product.id)}
                    disabled={actionLoading === product.id + '-delete'}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 ml-auto disabled:opacity-50">
                    <i className="ri-delete-bin-line"></i>
                    {actionLoading === product.id + '-delete' ? '...' : 'Xóa'}
                  </button>
                ) : (
                  <button onClick={() => handleRestore(product.id)}
                    disabled={actionLoading === product.id + '-restore'}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 ml-auto disabled:opacity-50">
                    <i className="ri-restart-line"></i>
                    {actionLoading === product.id + '-restore' ? '...' : 'Khôi phục'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =================== 3.2 ANALYTICS TAB ===================
function AnalyticsTab() {
  const [data, setData] = useState<any>(null);
  const [reData, setReData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([analytics.getProductStats(), analytics.getRealEstateStats()])
      .then(([p, r]) => {
        if (p.status === 'fulfilled') setData(p.value);
        if (r.status === 'fulfilled') setReData(r.value || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full animate-spin"></div></div>;

  const products = data?.products || [];
  const maxViews = Math.max(...products.map((p: any) => p.viewCount), 1);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Hiệu suất tin đăng</h2>

      {/* Sản phẩm */}
      <div className="bg-white rounded-xl p-6 ">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="ri-plant-line text-forest-600"></i>
          Top sản phẩm theo lượt xem
        </h3>
        {products.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Chưa có dữ liệu</p>
        ) : (
          <div className="space-y-3">
            {products.map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-6 text-sm text-gray-400 text-center font-medium">{i + 1}</span>
                {p.images?.[0] && (
                  <img src={p.images[0].url} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" alt="" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${(p.viewCount / maxViews) * 100}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{p.viewCount} lượt xem</span>
                  </div>
                </div>
                {p.isVip && <span className="text-xs bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded font-medium">VIP</span>}
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'ACTIVE' ? 'bg-forest-100 text-forest-700' : 'bg-gray-100 text-gray-500'}`}>
                  {p.status === 'ACTIVE' ? 'Hoạt động' : 'Ẩn'}
                </span>
              </div>
            ))}
          </div>
        )}
        {data?.totalViews !== undefined && (
          <p className="text-xs text-gray-400 mt-4 pt-4 border-t">Tổng lượt xem sản phẩm: <strong className="text-gray-700">{data.totalViews.toLocaleString()}</strong></p>
        )}
      </div>

      {/* Bất động sản */}
      <div className="bg-white rounded-xl p-6 ">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="ri-home-4-line text-blue-600"></i>
          Bất động sản theo lượt xem
        </h3>
        {reData.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Chưa có dữ liệu</p>
        ) : (
          <div className="space-y-3">
            {reData.map((r: any, i: number) => (
              <div key={r.id} className="flex items-center gap-3">
                <span className="w-6 text-sm text-gray-400 text-center font-medium">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(r.viewCount / Math.max(...reData.map((x: any) => x.viewCount), 1)) * 100}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{r.viewCount} lượt xem</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  r.status === 'NEW' ? 'bg-forest-100 text-forest-700' :
                  r.status === 'TRADING' ? 'bg-gold-100 text-gold-700' :
                  r.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {r.status === 'NEW' ? 'Mới' : r.status === 'TRADING' ? 'Giao dịch' : r.status === 'COMPLETED' ? 'Hoàn tất' : 'Tạm dừng'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =================== 3.4 ENGAGEMENT TAB ===================
function EngagementTab() {
  const [data, setData] = useState<any>(null);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedProducts, setLikedProducts] = useState<any[]>([]);

  useEffect(() => {
    // Load liked products from localStorage
    try {
      const ids: string[] = JSON.parse(localStorage.getItem('liked_items') || '[]');
      if (ids.length > 0) {
        Promise.all(
          ids.slice(0, 12).map(id =>
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://cho-nhan-co-backend.onrender.com/api'}/products/${id}`)
              .then(r => r.ok ? r.json() : null).catch(() => null)
          )
        ).then(results => setLikedProducts(results.filter(Boolean)));
      }
    } catch {}
  }, []);

  useEffect(() => {
    Promise.all([
      analytics.getEngagement().catch(() => null),
      notifications.getAll(1).catch(() => null),
    ]).then(([eng, notifData]) => {
      setData(eng);
      const all: any[] = notifData?.data || [];
      // Lọc các thông báo tương tác: like, comment, reaction
      const interactTypes = ['LIKE', 'COMMENT', 'REACTION', 'FORUM_LIKE', 'FORUM_COMMENT', 'PRODUCT_LIKE'];
      const filtered = all.filter((n: any) =>
        interactTypes.some(t => (n.type || '').toUpperCase().includes(t.replace('_', '').slice(0, 4)))
        || (n.message || '').toLowerCase().match(/thích|bình luận|comment|like|phản hồi/)
      );
      setNotifs(filtered.length > 0 ? filtered : all.slice(0, 10));
    }).finally(() => setLoading(false));
  }, []);

  function timeAgoEng(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Vừa xong';
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    return `${Math.floor(h / 24)} ngày trước`;
  }

  function getNotifIcon(type: string) {
    const t = (type || '').toUpperCase();
    if (t.includes('LIKE') || t.includes('REACT')) return { icon: 'ri-heart-fill', color: 'text-red-500 bg-red-100' };
    if (t.includes('COMMENT')) return { icon: 'ri-chat-1-fill', color: 'text-blue-500 bg-blue-100' };
    if (t.includes('FOLLOW')) return { icon: 'ri-user-follow-fill', color: 'text-forest-500 bg-forest-100' };
    return { icon: 'ri-notification-2-fill', color: 'text-gold-600 bg-gold-100' };
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div></div>;

  const summary = data?.summary || {};
  const forumPosts = data?.forumPosts || [];
  const totalViews = (summary.totalProductViews || 0) + (summary.totalRealEstateViews || 0) + (summary.totalJobViews || 0);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Tương tác</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Tổng lượt xem', value: totalViews.toLocaleString(), icon: 'ri-eye-line', color: 'bg-blue-100 text-blue-600' },
          { label: 'Lượt thích', value: summary.totalForumLikes || 0, icon: 'ri-heart-line', color: 'bg-red-100 text-red-500' },
          { label: 'Bình luận', value: summary.totalForumComments || 0, icon: 'ri-chat-1-line', color: 'bg-forest-100 text-forest-600' },
          { label: 'View BĐS', value: (summary.totalRealEstateViews || 0).toLocaleString(), icon: 'ri-home-4-line', color: 'bg-forest-100 text-forest-600' },
        ].map((item, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${item.color}`}>
              <i className={`${item.icon} text-base`}></i>
            </div>
            <p className="text-xl font-bold text-gray-900">{item.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Sản phẩm đã thích */}
      {likedProducts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <i className="ri-heart-fill text-red-500"></i>
              Sản phẩm đã thích
            </h3>
            <span className="text-xs text-gray-400">{likedProducts.length} sản phẩm</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[1px] bg-gray-100">
            {likedProducts.map((p: any) => (
              <a key={p.id} href={`/products/${p.id}`} className="bg-white hover:bg-gray-50 transition block">
                <div className="relative" style={{ aspectRatio: '4/3' }}>
                  {p.images?.[0]?.url ? (
                    <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <i className="ri-image-line text-2xl text-gray-300"></i>
                    </div>
                  )}
                </div>
                <div className="px-2 py-2">
                  <p className="text-xs font-medium text-gray-800 line-clamp-1">{p.title}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: '#B32E1D' }}>{Number(p.price).toLocaleString('vi-VN')}đ</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Feed tương tác kiểu Facebook */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <i className="ri-heart-line text-red-500"></i>
            Hoạt động gần đây
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Ai đã thích và bình luận bài của bạn</p>
        </div>
        {notifs.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-400">
            <i className="ri-heart-line text-4xl mb-2"></i>
            <p className="text-sm">Chưa có tương tác nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifs.map((n: any) => {
              const { icon, color } = getNotifIcon(n.type);
              const senderName = n.sender?.fullName || n.sender?.username || n.actorName || 'Ai đó';
              const senderAvatar = n.sender?.avatarUrl || null;
              const initial = senderName[0]?.toUpperCase() || 'A';
              return (
                <div key={n.id} className={`flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition ${!n.isRead ? 'bg-gold-50/40' : ''}`}>
                  {/* Avatar + icon badge */}
                  <div className="relative flex-shrink-0">
                    {senderAvatar ? (
                      <img src={senderAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
                        {initial}
                      </div>
                    )}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ${color}`}>
                      <i className={`${icon} text-xs`}></i>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-snug">
                      <span className="font-semibold">{senderName}</span>{' '}
                      {n.message || 'đã tương tác với bài của bạn'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgoEng(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <div className="w-2.5 h-2.5 bg-gold-400 rounded-full flex-shrink-0 mt-1.5"></div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Forum posts engagement */}
      {forumPosts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i className="ri-chat-3-line text-forest-500"></i>
            Bài viết diễn đàn
          </h3>
          <div className="space-y-2">
            {forumPosts.map((p: any) => (
              <div key={p.id} className="flex items-center gap-4 py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                  <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 flex-shrink-0">
                  <span className="flex items-center gap-1"><i className="ri-heart-line text-red-400"></i>{p.likeCount}</span>
                  <span className="flex items-center gap-1"><i className="ri-chat-1-line text-blue-400"></i>{p._count?.comments || 0}</span>
                  <span className="flex items-center gap-1"><i className="ri-eye-line text-gray-400"></i>{p.viewCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}