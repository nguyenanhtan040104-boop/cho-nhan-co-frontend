'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '../../lib/api';

const navLinks = [
  { href: '/', label: 'Chợ Nhân Cơ' },
  { href: '/products', label: 'Sản phẩm' },
  { href: '/real-estate', label: 'Bất động sản' },
  { href: '/jobs', label: 'Việc làm' },
];

const allCategories = [
  { href: '/products', label: 'Sản phẩm', icon: 'ri-leaf-line' },
  { href: '/real-estate', label: 'Bất động sản', icon: 'ri-home-4-line' },
  { href: '/jobs', label: 'Tuyển dụng / Việc làm', icon: 'ri-briefcase-line' },
  { href: '/products?category=NONG_SAN', label: 'Nông sản, thực phẩm', icon: 'ri-plant-line' },
  { href: '/products?category=VAT_NUOI', label: 'Vật nuôi', icon: 'ri-bear-smile-line' },
  { href: '/products?category=DICH_VU', label: 'Dịch vụ', icon: 'ri-service-line' },
  { href: '/forum', label: 'Diễn đàn cộng đồng', icon: 'ri-chat-3-line' },
  { href: '/canh-bao', label: 'Cảnh báo, lừa đảo', icon: 'ri-alert-line' },
  { href: '/advertisements', label: 'Quảng cáo, khuyến mãi', icon: 'ri-megaphone-line' },
  { href: '/market-prices', label: 'Bảng giá thị trường', icon: 'ri-line-chart-line' },
];

const postItems = [
  { href: '/products/create', icon: 'ri-leaf-line', label: 'Đăng sản phẩm', sub: 'Nông sản, thực phẩm, vật nuôi' },
  { href: '/real-estate/create', icon: 'ri-home-4-line', label: 'Bất động sản', sub: 'Nhà đất, phòng trọ' },
  { href: '/jobs/create', icon: 'ri-briefcase-line', label: 'Tuyển dụng', sub: 'Tìm việc, thuê nhân công' },
  { href: '/advertisements/create', icon: 'ri-megaphone-line', label: 'Quảng cáo', sub: 'Khai trương, khuyến mãi' },
  { href: '/forum/create', icon: 'ri-chat-3-line', label: 'Bài diễn đàn', sub: 'Chia sẻ kinh nghiệm' },
];

// Danh sách tìm kiếm nhanh theo từ khóa → route
const SEARCH_ROUTES: { keywords: string[]; route: string }[] = [
  { keywords: ['bất động sản', 'bds', 'nhà', 'đất', 'phòng trọ', 'căn hộ'], route: '/real-estate' },
  { keywords: ['việc làm', 'tuyển dụng', 'tuyển', 'xin việc', 'nhân công'], route: '/jobs' },
  { keywords: ['diễn đàn', 'forum', 'hỏi đáp'], route: '/forum' },
  { keywords: ['cảnh báo', 'lừa đảo', 'mất đồ'], route: '/canh-bao' },
  { keywords: ['quảng cáo', 'khai trương', 'khuyến mãi'], route: '/advertisements' },
  { keywords: ['nông sản', 'rau', 'củ', 'thực phẩm'], route: '/products?category=NONG_SAN' },
  { keywords: ['vật nuôi', 'chó', 'mèo', 'gà', 'heo', 'bò'], route: '/products?category=VAT_NUOI' },
];

function smartSearch(q: string): string {
  const lower = q.toLowerCase().trim();
  for (const { keywords, route } of SEARCH_ROUTES) {
    if (keywords.some(k => lower.includes(k))) return route + (route.includes('?') ? '&' : '?') + `search=${encodeURIComponent(q)}`;
  }
  return `/products?search=${encodeURIComponent(q)}`;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'https://cho-nhan-co-backend-production.up.railway.app/api';

function timeAgoHeader(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

export default function Header() {
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  const [showSellerMenu, setShowSellerMenu] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showSavedDropdown, setShowSavedDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [notifTab, setNotifTab] = useState<'activity'|'news'>('activity');
  const [savedProducts, setSavedProducts] = useState<any[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  const postMenuRef = useRef<HTMLDivElement>(null);
  const sellerMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const savedRef = useRef<HTMLDivElement>(null);

  function navDashboard(tab: string) {
    if (pathname === '/dashboard') {
      // Đang ở dashboard: dispatch event để switch tab ngay + replace URL
      window.dispatchEvent(new CustomEvent('dashboard-switch-tab', { detail: tab }));
      router.replace(`/dashboard?tab=${tab}`);
    } else {
      router.push(`/dashboard?tab=${tab}`);
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (postMenuRef.current && !postMenuRef.current.contains(e.target as Node)) setShowPostMenu(false);
      if (sellerMenuRef.current && !sellerMenuRef.current.contains(e.target as Node)) setShowSellerMenu(false);
      if (hamburgerRef.current && !hamburgerRef.current.contains(e.target as Node)) setShowHamburger(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifDropdown(false);
      if (savedRef.current && !savedRef.current.contains(e.target as Node)) setShowSavedDropdown(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setShowPostMenu(false);
    setShowHamburger(false);
    setShowSellerMenu(false);
    setShowNotifDropdown(false);
    setShowSavedDropdown(false);
    if (pathname === '/dashboard') setUnreadCount(0);
  }, [pathname]);

  function openNotifDropdown() {
    setShowSavedDropdown(false);
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/profile'); return; }
    setShowNotifDropdown(v => !v);
    fetch(`${API}/notifications?limit=10`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => setNotifs(data.data || [])).catch(() => {});
    setUnreadCount(0);
  }

  function openSavedDropdown() {
    setShowNotifDropdown(false);
    setShowSavedDropdown(v => !v);
    // Load saved products từ localStorage
    try {
      const ids: string[] = JSON.parse(localStorage.getItem('liked_items') || '[]');
      if (ids.length === 0) { setSavedProducts([]); return; }
      Promise.all(
        ids.slice(0, 6).map(id =>
          fetch(`${API}/products/${id}`).then(r => r.ok ? r.json() : null).catch(() => null)
        )
      ).then(results => setSavedProducts(results.filter(Boolean)));
    } catch { setSavedProducts([]); }
  }

  useEffect(() => {
    function fetchUnread() {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) return;
      fetch(`${API}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data?.count !== undefined) setUnreadCount(data.count); })
        .catch(() => {});
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  function handlePostClick() {
    if (!auth.isLoggedIn()) { router.push('/profile'); return; }
    setShowPostMenu(v => !v);
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm" suppressHydrationWarning>
      <div className="w-full px-3 flex items-center gap-2 h-14" suppressHydrationWarning>

        {/* Hamburger → Danh mục */}
        <div className="relative flex-shrink-0" ref={hamburgerRef}>
          <button onClick={() => setShowHamburger(v => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600">
            <i className="ri-menu-line text-xl"></i>
          </button>
          {showHamburger && (
            <div className="absolute left-0 top-11 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50">
              <p className="text-base font-bold text-gray-900 px-4 mb-2">Danh mục</p>
              <div className="divide-y divide-gray-50">
                {allCategories.map(cat => (
                  <Link key={cat.href} href={cat.href}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group">
                    <i className={`${cat.icon} text-gray-400 text-lg w-5 flex-shrink-0`}></i>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{cat.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <div className="flex items-center gap-1 bg-yellow-400 px-3 py-1.5 rounded-full">
            <i className="ri-store-2-fill text-white text-sm"></i>
            <span className="font-black text-white text-sm leading-none">chợ<span className="uppercase">NC</span></span>
          </div>
        </Link>

        {/* Dành cho người bán — bên trái như Chợ Tốt */}
        <div className="relative hidden md:block flex-shrink-0" ref={sellerMenuRef}>
          <button onClick={() => setShowSellerMenu(v => !v)}
            className="flex items-center gap-1 text-sm text-gray-600 font-medium hover:text-gray-900 whitespace-nowrap">
            Dành cho người bán <i className="ri-arrow-down-s-line"></i>
          </button>
          {showSellerMenu && (
            <div className="absolute left-0 top-9 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
              <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors" onClick={() => setShowSellerMenu(false)}>
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <i className="ri-file-list-3-line text-gray-600 text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Quản lý tin</p>
                  <p className="text-xs text-gray-400">Tin đã đăng, đã xóa</p>
                </div>
              </Link>
              <Link href="/pricing" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors" onClick={() => setShowSellerMenu(false)}>
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i className="ri-vip-crown-line text-yellow-600 text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Gói VIP</p>
                  <p className="text-xs text-gray-400">Bảng giá, nâng cấp tin</p>
                </div>
              </Link>
              <Link href="/advertisements/create" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors" onClick={() => setShowSellerMenu(false)}>
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i className="ri-megaphone-line text-orange-600 text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Đăng quảng cáo</p>
                  <p className="text-xs text-gray-400">Khai trương, khuyến mãi</p>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Spacer trái */}
        <div className="flex-1" />

        {/* Nav links ở GIỮA — như Chợ Tốt */}
        <nav className="hidden lg:flex items-center gap-1 flex-shrink-0">
          <Link href="/" className={`text-sm font-semibold px-3 py-1.5 rounded-full transition ${pathname === '/' ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>
            Chợ NC
          </Link>
          <Link href="/products" className={`text-sm font-medium px-3 py-1.5 rounded-full transition ${pathname.startsWith('/products') ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>
            Sản phẩm
          </Link>
          <Link href="/real-estate" className={`text-sm font-medium px-3 py-1.5 rounded-full transition ${pathname.startsWith('/real-estate') ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>
            Bất động sản
          </Link>
          <Link href="/jobs" className={`text-sm font-medium px-3 py-1.5 rounded-full transition ${pathname.startsWith('/jobs') ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>
            Việc làm
          </Link>
        </nav>

        {/* Spacer phải */}
        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-1 flex-shrink-0" suppressHydrationWarning>

          {/* ❤️ Tin đã lưu dropdown */}
          <div className="relative hidden sm:block" ref={savedRef}>
            <button onClick={openSavedDropdown} title="Tin đã lưu"
              className="flex w-9 h-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500 transition">
              <i className="ri-heart-line text-lg"></i>
            </button>
            {showSavedDropdown && (
              <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Tin đăng đã lưu</h3>
                  <button onClick={() => { setShowSavedDropdown(false); navDashboard('liked'); }}
                    className="text-xs text-yellow-500 font-medium hover:underline">Xem tất cả</button>
                </div>
                {savedProducts.length === 0 ? (
                  <div className="py-10 text-center text-gray-400">
                    <i className="ri-heart-line text-3xl block mb-2"></i>
                    <p className="text-sm font-medium text-gray-700">Bạn chưa lưu tin đăng nào</p>
                    <p className="text-xs mt-1">Lưu tin yêu thích, tin sẽ hiển thị ở đây để bạn dễ dàng quay lại sau.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {savedProducts.map((p: any) => (
                      <Link key={p.id} href={`/products/${p.id}`} onClick={() => setShowSavedDropdown(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          {p.images?.[0]?.url
                            ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                            : <i className="ri-image-line text-gray-300 text-xl flex items-center justify-center w-full h-full"></i>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 line-clamp-1">{p.title}</p>
                          <p className="text-sm font-bold" style={{ color: '#d0011b' }}>{Number(p.price).toLocaleString('vi-VN')}đ</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 🔔 Thông báo dropdown */}
          <div className="relative hidden sm:block" ref={notifRef}>
            <button onClick={openNotifDropdown} title="Thông báo"
              className="flex w-9 h-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500 transition">
              <i className="ri-notification-3-line text-lg"></i>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifDropdown && (
              <div className="absolute right-0 top-12 w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                {/* Header */}
                <div className="px-5 pt-4 pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">Thông Báo</h3>
                    <button onClick={() => { setShowNotifDropdown(false); navDashboard('notifications'); }}
                      className="text-xs text-yellow-500 font-semibold hover:underline">Xem tất cả</button>
                  </div>
                  {/* Tabs */}
                  <div className="flex gap-0 border-b border-gray-100">
                    {(['activity','news'] as const).map(tab => (
                      <button key={tab} onClick={() => setNotifTab(tab)}
                        className={`px-4 py-2.5 text-sm font-semibold transition border-b-2 -mb-px ${notifTab === tab ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                        {tab === 'activity' ? 'Hoạt Động' : 'Tin Tức'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="max-h-[480px] overflow-y-auto">
                  {notifTab === 'news' ? (
                    <div className="py-12 text-center text-gray-400">
                      <i className="ri-newspaper-line text-4xl block mb-2"></i>
                      <p className="text-sm">Chưa có tin tức nào</p>
                    </div>
                  ) : notifs.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                      <i className="ri-notification-3-line text-4xl block mb-2"></i>
                      <p className="text-sm font-medium text-gray-600">Chưa có thông báo nào</p>
                      <p className="text-xs mt-1">Các thông báo tương tác sẽ hiện ở đây</p>
                    </div>
                  ) : (
                    <div>
                      {notifs.some((n:any) => !n.isRead) && (
                        <p className="px-5 pt-3 pb-1 text-xs font-bold text-gray-900">Thông báo mới</p>
                      )}
                      {notifs.map((n: any) => {
                        const isLike = n.type?.includes('LIKE');
                        const isComment = n.type?.includes('COMMENT');
                        const iconClass = isLike ? 'ri-heart-fill text-red-500' : isComment ? 'ri-chat-1-fill text-blue-500' : 'ri-notification-2-fill text-yellow-600';
                        const iconBg = isLike ? 'bg-red-50' : isComment ? 'bg-blue-50' : 'bg-yellow-50';
                        return (
                          <div key={n.id}
                            className={`flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition cursor-pointer ${!n.isRead ? 'bg-amber-50/60' : ''}`}
                            onClick={async () => {
                          setShowNotifDropdown(false);
                          if (!n.isRead) {
                            try {
                              await fetch(`${API}/notifications/${n.id}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });
                              setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
                            } catch {}
                          }
                          const d = n.data as any;
                          const url = d?.url
                            || (d?.targetType && d?.targetId ? (d.targetType === 'REAL_ESTATE' ? `/real-estate/${d.targetId}` : d.targetType === 'JOB' ? `/jobs/${d.targetId}` : `/products/${d.targetId}`) : null)
                            || (n.relatedId ? `/products/${n.relatedId}` : null);
                          if (url) router.push(url);
                          else navDashboard('notifications');
                        }}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${iconBg}`}>
                              <i className={`${iconClass} text-base`}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              {n.title && <p className={`text-sm leading-snug ${!n.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>{n.title}</p>}
                              <p className={`text-sm leading-snug line-clamp-2 mt-0.5 ${!n.isRead ? 'text-gray-700' : 'text-gray-400'}`}>{n.body || n.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{timeAgoHeader(n.createdAt)}</p>
                            </div>
                            {!n.isRead && <div className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0 mt-2"></div>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Liên hệ → trang nhắn tin */}
          <Link href="/messages"
            className="hidden lg:flex items-center gap-1.5 border border-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full hover:bg-gray-50 transition">
            <i className="ri-chat-1-line text-sm"></i>
            <span>Liên hệ</span>
          </Link>

          {/* Quản lý tin → dashboard tab products */}
          <button onClick={() => navDashboard('products')}
            className="hidden md:flex items-center border border-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full hover:bg-gray-50 transition">
            Quản lý tin
          </button>

          {/* Đăng tin */}
          <div className="relative" ref={postMenuRef}>
            <button onClick={handlePostClick}
              className="flex items-center gap-1 bg-gray-900 text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-gray-800 transition">
              Đăng tin
            </button>
            {showPostMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider px-4 py-2 border-b border-gray-100">Chọn loại đăng tin</p>
                {postItems.map(item => (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowPostMenu(false)}>
                    <i className={`${item.icon} text-gray-400 text-base w-5`}></i>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{item.label}</div>
                      <div className="text-xs text-gray-400">{item.sub}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Avatar */}
          <Link href="/dashboard"
            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 hover:bg-gray-700 transition">
            <i className="ri-user-line text-white text-sm"></i>
          </Link>
        </div>
      </div>
    </header>
  );
}
