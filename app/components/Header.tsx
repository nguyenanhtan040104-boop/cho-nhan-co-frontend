'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '../../lib/api';

const navLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/products', label: 'Sản phẩm' },
  { href: '/real-estate', label: 'Bất động sản' },
  { href: '/forum', label: 'Diễn đàn' },
  { href: '/market-prices', label: 'Giá thị trường' },
  { href: '/advertisements', label: 'Quảng cáo' },
  { href: '/jobs', label: 'Tuyển dụng' },
  { href: '/pricing', label: 'Bảng giá' },
];

const hashtags = [
  { label: '#nongsan', href: '/products?category=NONG_SAN' },
  { label: '#vatnuoi', href: '/products?category=VAT_NUOI' },
  { label: '#dichvu', href: '/products?category=DICH_VU' },
  { label: '#batdongsan', href: '/real-estate' },
  { label: '#tuyendung', href: '/jobs' },
  { label: '#muaban', href: '/products' },
  { label: '#dienddan', href: '/forum' },
];

export default function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const postMenuRef = useRef<HTMLDivElement>(null);

  function handlePostMenuToggle() {
    if (!auth.isLoggedIn()) { router.push('/profile'); return; }
    setShowPostMenu(!showPostMenu);
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
    <header className="sticky top-0 z-50" suppressHydrationWarning>

      {/* Main nav */}
      <div className="bg-white border-b border-gray-100 shadow-sm" suppressHydrationWarning>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex justify-between items-center py-3" suppressHydrationWarning>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#2d6a4f' }}>
              <i className="ri-store-2-line text-white text-lg"></i>
            </div>
            <div suppressHydrationWarning>
              <h1 className="font-['Pacifico'] text-xl leading-tight" style={{ color: '#2d6a4f' }}>Chợ Nhân Cơ</h1>
              <p className="text-xs text-gray-400 hidden sm:block leading-none">Kết nối giao thương, gắn kết cộng đồng</p>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-1" suppressHydrationWarning>
            {navLinks.map(link => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-green-700 bg-green-50'
                      : 'text-gray-600 hover:text-green-700 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2" suppressHydrationWarning>
            {/* Post button */}
            <div className="relative" ref={postMenuRef}>
              <button
                onClick={handlePostMenuToggle}
                className="flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:opacity-90"
                style={{ backgroundColor: '#2d6a4f' }}
              >
                <i className="ri-add-line text-base"></i>
                <span className="hidden sm:inline">Đăng tin</span>
              </button>

              {showPostMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-50">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Chọn loại đăng tin</p>
                  </div>
                  {[
                    { href: '/products/create', icon: 'ri-leaf-line', color: '#2d6a4f', bg: '#f0fdf4', label: 'Đăng sản phẩm', sub: 'Nông sản, thực phẩm, vật nuôi' },
                    { href: '/real-estate/create', icon: 'ri-home-4-line', color: '#1d4ed8', bg: '#eff6ff', label: 'Bất động sản', sub: 'Nhà đất, phòng trọ' },
                    { href: '/forum/create', icon: 'ri-chat-3-line', color: '#7c3aed', bg: '#f5f3ff', label: 'Bài diễn đàn', sub: 'Chia sẻ kinh nghiệm' },
                    { href: '/advertisements/create', icon: 'ri-megaphone-line', color: '#ea580c', bg: '#fff7ed', label: 'Quảng cáo', sub: 'Khai trương, khuyến mãi' },
                    { href: '/jobs/create', icon: 'ri-briefcase-line', color: '#0369a1', bg: '#f0f9ff', label: 'Tuyển dụng', sub: 'Tìm việc, thuê nhân công' },
                  ].map(item => (
                    <Link key={item.href} href={item.href}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowPostMenu(false)}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: item.bg }}>
                        <i className={`${item.icon} text-base`} style={{ color: item.color }}></i>
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

            {/* User icon */}
            <Link href="/dashboard"
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:text-green-700 hover:border-green-300 hover:bg-green-50 transition-all"
              title="Tài khoản">
              <i className="ri-user-line text-lg"></i>
            </Link>

            {/* Mobile menu toggle */}
            <button onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
              <i className={`text-lg ${showMobileMenu ? 'ri-close-line' : 'ri-menu-line'}`}></i>
            </button>
          </div>
        </div>

        {/* Hashtag bar - dưới nav */}
        <div className="hidden lg:block border-t border-gray-100">
          <div className="max-w-screen-xl mx-auto px-6 py-1.5 flex items-center gap-1.5 overflow-x-auto">
            <span className="text-gray-400 text-xs mr-1 whitespace-nowrap">Tìm nhanh:</span>
            {hashtags.map(tag => (
              <Link
                key={tag.label}
                href={tag.href}
                className="text-xs px-2.5 py-0.5 rounded-full border border-gray-200 text-gray-500 hover:border-green-500 hover:text-green-700 hover:bg-green-50 transition whitespace-nowrap"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-100 px-4 py-3">
            {/* Hashtags mobile */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {hashtags.map(tag => (
                <Link key={tag.label} href={tag.href}
                  className="text-xs px-2.5 py-1 rounded-full border text-green-700 border-green-200 bg-green-50"
                  onClick={() => setShowMobileMenu(false)}>
                  {tag.label}
                </Link>
              ))}
            </div>
            <nav className="space-y-0.5">
              {navLinks.map(item => (
                <Link key={item.href} href={item.href}
                  className="block px-3 py-2.5 text-sm text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-xl"
                  onClick={() => setShowMobileMenu(false)}>
                  {item.label}
                </Link>
              ))}
              <Link href="/dashboard"
                className="block px-3 py-2.5 text-sm text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-xl"
                onClick={() => setShowMobileMenu(false)}>
                Tài khoản
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
