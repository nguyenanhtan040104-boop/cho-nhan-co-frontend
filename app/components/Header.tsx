'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '../../lib/api';

const HASHTAG_ROUTES: Record<string, string> = {
  batdongsan: '/real-estate', bds: '/real-estate', phongtro: '/real-estate', nhadat: '/real-estate',
  tuyendung: '/jobs', timviec: '/jobs', nhancong: '/jobs',
  dienddan: '/forum', forum: '/forum',
  canhbao: '/canh-bao', luadao: '/canh-bao',
  quangcao: '/advertisements',
  nongsan: '/products?category=NONG_SAN',
  vatnuoi: '/products?category=VAT_NUOI',
  dichvu: '/products?category=DICH_VU',
  muaban: '/products',
};

function resolveSearch(q: string): string {
  if (q.startsWith('#')) {
    const tag = q.slice(1).toLowerCase().replace(/\s/g, '');
    return HASHTAG_ROUTES[tag] || `/products?search=${encodeURIComponent(tag)}`;
  }
  return `/products?search=${encodeURIComponent(q)}`;
}

const catLinks = [
  { href: '/products', label: 'Sản phẩm', icon: 'ri-leaf-line' },
  { href: '/real-estate', label: 'Bất động sản', icon: 'ri-home-4-line' },
  { href: '/jobs', label: 'Tuyển dụng', icon: 'ri-briefcase-line' },
  { href: '/forum', label: 'Diễn đàn', icon: 'ri-chat-3-line' },
  { href: '/canh-bao', label: 'Cảnh báo', icon: 'ri-alert-line' },
  { href: '/advertisements', label: 'Quảng cáo', icon: 'ri-megaphone-line' },
  { href: '/market-prices', label: 'Bảng giá', icon: 'ri-line-chart-line' },
];

const postItems = [
  { href: '/products/create', icon: 'ri-leaf-line', color: '#16a34a', label: 'Đăng sản phẩm', sub: 'Nông sản, thực phẩm, vật nuôi' },
  { href: '/real-estate/create', icon: 'ri-home-4-line', color: '#2563eb', label: 'Bất động sản', sub: 'Nhà đất, phòng trọ' },
  { href: '/forum/create', icon: 'ri-chat-3-line', color: '#7c3aed', label: 'Bài diễn đàn', sub: 'Chia sẻ kinh nghiệm' },
  { href: '/advertisements/create', icon: 'ri-megaphone-line', color: '#ea580c', label: 'Quảng cáo', sub: 'Khai trương, khuyến mãi' },
  { href: '/jobs/create', icon: 'ri-briefcase-line', color: '#0369a1', label: 'Tuyển dụng', sub: 'Tìm việc, thuê nhân công' },
];

export default function Header() {
  const [query, setQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const postMenuRef = useRef<HTMLDivElement>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(resolveSearch(q));
  }

  function handlePostMenuToggle() {
    if (!auth.isLoggedIn()) { router.push('/profile'); return; }
    setShowPostMenu(v => !v);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (postMenuRef.current && !postMenuRef.current.contains(e.target as Node)) setShowPostMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { setShowMobileMenu(false); setShowPostMenu(false); }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm" suppressHydrationWarning>

      {/* Top bar */}
      <div className="border-b border-gray-100" suppressHydrationWarning>
        <div className="max-w-screen-xl mx-auto px-3 sm:px-6 flex items-center gap-3 h-14" suppressHydrationWarning>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#d0011b' }}>
              <i className="ri-store-2-line text-white text-base"></i>
            </div>
            <span className="font-['Pacifico'] text-lg hidden sm:block leading-none" style={{ color: '#d0011b' }}>Chợ Nhân Cơ</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 max-w-2xl">
            <div className="flex-1 flex items-center border-2 rounded-lg overflow-hidden transition-all focus-within:border-red-500" style={{ borderColor: '#d0011b' }}>
              <i className="ri-search-line text-gray-400 pl-3 text-base flex-shrink-0"></i>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Tìm sản phẩm, việc làm, bất động sản..."
                className="flex-1 px-2 py-2 text-sm focus:outline-none bg-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold text-white flex-shrink-0 transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#d0011b' }}
              >
                Tìm
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0" suppressHydrationWarning>
            {/* Post button */}
            <div className="relative" ref={postMenuRef}>
              <button
                onClick={handlePostMenuToggle}
                className="flex items-center gap-1.5 text-white text-sm font-semibold px-3 py-2 rounded-lg transition hover:opacity-90"
                style={{ backgroundColor: '#d0011b' }}
              >
                <i className="ri-add-line text-base"></i>
                <span className="hidden sm:inline">Đăng tin</span>
              </button>
              {showPostMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider px-4 py-2 border-b border-gray-50">Chọn loại đăng tin</p>
                  {postItems.map(item => (
                    <Link key={item.href} href={item.href}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowPostMenu(false)}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: item.color + '18' }}>
                        <i className={`${item.icon} text-sm`} style={{ color: item.color }}></i>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{item.label}</div>
                        <div className="text-xs text-gray-400">{item.sub}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Account */}
            <Link href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-red-300 hover:text-red-600 transition-all"
              title="Tài khoản">
              <i className="ri-user-line text-base"></i>
              <span className="hidden sm:inline text-sm font-medium">Tài khoản</span>
            </Link>

            {/* Mobile menu */}
            <button onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              <i className={`text-lg ${showMobileMenu ? 'ri-close-line' : 'ri-menu-line'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Category nav bar */}
      <div className="hidden lg:block border-b border-gray-100 bg-white">
        <div className="max-w-screen-xl mx-auto px-6">
          <nav className="flex items-center gap-0">
            {catLinks.map(link => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link key={link.href} href={link.href}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-600 hover:text-red-600 hover:border-red-300'
                  }`}>
                  <i className={`${link.icon} text-base`}></i>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3">
          <nav className="space-y-0.5">
            {catLinks.map(item => (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg ${
                  pathname.startsWith(item.href) ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setShowMobileMenu(false)}>
                <i className={`${item.icon} text-base`}></i>
                {item.label}
              </Link>
            ))}
            <Link href="/dashboard"
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              onClick={() => setShowMobileMenu(false)}>
              <i className="ri-user-line text-base"></i>
              Tài khoản
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
