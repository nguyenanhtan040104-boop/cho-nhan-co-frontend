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

export default function Header() {
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  const [showSellerMenu, setShowSellerMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const postMenuRef = useRef<HTMLDivElement>(null);
  const sellerMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (postMenuRef.current && !postMenuRef.current.contains(e.target as Node)) setShowPostMenu(false);
      if (sellerMenuRef.current && !sellerMenuRef.current.contains(e.target as Node)) setShowSellerMenu(false);
      if (hamburgerRef.current && !hamburgerRef.current.contains(e.target as Node)) setShowHamburger(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setShowPostMenu(false);
    setShowHamburger(false);
    setShowSellerMenu(false);
  }, [pathname]);

  function handlePostClick() {
    if (!auth.isLoggedIn()) { router.push('/profile'); return; }
    setShowPostMenu(v => !v);
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm" suppressHydrationWarning>
      <div className="max-w-screen-xl mx-auto px-4 flex items-center gap-2 h-14" suppressHydrationWarning>

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

        {/* Dành cho người bán */}
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

        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-1 flex-shrink-0" suppressHydrationWarning>

          {/* Yêu thích → dashboard tab engagement */}
          <Link href="/dashboard?tab=liked" title="Bài đã thích"
            className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500 transition">
            <i className="ri-heart-line text-lg"></i>
          </Link>

          {/* Thông báo → dashboard tab notifications */}
          <Link href="/dashboard?tab=notifications" title="Thông báo"
            className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500 transition">
            <i className="ri-notification-3-line text-lg"></i>
          </Link>

          {/* Liên hệ → trang nhắn tin */}
          <Link href="/messages"
            className="hidden lg:flex items-center gap-1.5 border border-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full hover:bg-gray-50 transition">
            <i className="ri-chat-1-line text-sm"></i>
            <span>Liên hệ</span>
          </Link>

          {/* Quản lý tin → dashboard tab products */}
          <Link href="/dashboard?tab=products"
            className="hidden md:flex items-center border border-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full hover:bg-gray-50 transition">
            Quản lý tin
          </Link>

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
