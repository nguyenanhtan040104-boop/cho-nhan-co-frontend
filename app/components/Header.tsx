'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '../../lib/api';

const postItems = [
  { href: '/products/create', icon: 'ri-leaf-line', label: 'Đăng sản phẩm', sub: 'Nông sản, thực phẩm, vật nuôi' },
  { href: '/real-estate/create', icon: 'ri-home-4-line', label: 'Bất động sản', sub: 'Nhà đất, phòng trọ' },
  { href: '/forum/create', icon: 'ri-chat-3-line', label: 'Bài diễn đàn', sub: 'Chia sẻ kinh nghiệm' },
  { href: '/advertisements/create', icon: 'ri-megaphone-line', label: 'Quảng cáo', sub: 'Khai trương, khuyến mãi' },
  { href: '/jobs/create', icon: 'ri-briefcase-line', label: 'Tuyển dụng', sub: 'Tìm việc, thuê nhân công' },
];

const navLinks = [
  { href: '/', label: 'Chợ Nhân Cơ' },
  { href: '/products', label: 'Sản phẩm' },
  { href: '/real-estate', label: 'Bất động sản' },
  { href: '/jobs', label: 'Việc làm' },
];

export default function Header() {
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const postMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoggedIn(auth.isLoggedIn());
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (postMenuRef.current && !postMenuRef.current.contains(e.target as Node)) setShowPostMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handlePostClick() {
    if (!auth.isLoggedIn()) { router.push('/profile'); return; }
    setShowPostMenu(v => !v);
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm" suppressHydrationWarning>
      <div className="max-w-screen-xl mx-auto px-4 flex items-center gap-3 h-14" suppressHydrationWarning>

        {/* Hamburger */}
        <button onClick={() => setShowMobileMenu(v => !v)}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 flex-shrink-0">
          <i className="ri-menu-line text-xl"></i>
        </button>

        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-yellow-400 px-3 py-1.5 rounded-full">
            <i className="ri-store-2-fill text-white text-base"></i>
            <span className="font-black text-white text-sm leading-none tracking-tight">chợ<span className="uppercase">NC</span></span>
          </div>
        </Link>

        {/* "Dành cho người bán" style dropdown */}
        <div className="hidden md:flex items-center gap-1 text-sm text-gray-700 font-medium cursor-pointer hover:text-gray-900 flex-shrink-0">
          <span>Dành cho người bán</span>
          <i className="ri-arrow-down-s-line"></i>
        </div>

        {/* Center nav */}
        <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center" suppressHydrationWarning>
          {navLinks.map(link => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href}
                className={`text-sm font-medium transition-colors whitespace-nowrap ${isActive ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-900'}`}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0" suppressHydrationWarning>
          {/* Heart */}
          <button className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            <i className="ri-heart-line text-xl"></i>
          </button>

          {/* Bell */}
          <button className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 relative">
            <i className="ri-notification-3-line text-xl"></i>
          </button>

          {/* Quản lý tin */}
          <Link href="/dashboard"
            className="hidden md:flex items-center gap-1 border border-gray-300 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
            Quản lý tin
          </Link>

          {/* Đăng tin */}
          <div className="relative" ref={postMenuRef}>
            <button onClick={handlePostClick}
              className="flex items-center gap-1.5 bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition">
              <i className="ri-add-line"></i>
              <span>Đăng tin</span>
            </button>
            {showPostMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider px-4 py-2 border-b border-gray-50">Chọn loại đăng tin</p>
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

          {/* Avatar / login */}
          <Link href="/dashboard"
            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 hover:bg-gray-700 transition">
            <i className="ri-user-line text-white text-sm"></i>
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3">
          <nav className="space-y-0.5">
            {[
              { href: '/products', label: 'Sản phẩm', icon: 'ri-leaf-line' },
              { href: '/real-estate', label: 'Bất động sản', icon: 'ri-home-4-line' },
              { href: '/jobs', label: 'Tuyển dụng', icon: 'ri-briefcase-line' },
              { href: '/forum', label: 'Diễn đàn', icon: 'ri-chat-3-line' },
              { href: '/canh-bao', label: 'Cảnh báo', icon: 'ri-alert-line' },
              { href: '/advertisements', label: 'Quảng cáo', icon: 'ri-megaphone-line' },
              { href: '/dashboard', label: 'Quản lý tin', icon: 'ri-user-line' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setShowMobileMenu(false)}>
                <i className={`${item.icon} text-gray-400`}></i>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
