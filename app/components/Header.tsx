'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '../../lib/api';

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
      if (postMenuRef.current && !postMenuRef.current.contains(e.target as Node)) {
        setShowPostMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
    setShowPostMenu(false);
  }, [pathname]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50" suppressHydrationWarning>
      <div className="w-full px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="flex justify-between items-center py-3 lg:py-4" suppressHydrationWarning>
          <Link href="/" className="flex items-center space-x-2 lg:space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-600 rounded-lg flex items-center justify-center" suppressHydrationWarning>
              <i className="ri-store-2-line text-white text-lg lg:text-xl"></i>
            </div>
            <div suppressHydrationWarning>
              <h1 className="font-['Pacifico'] text-lg lg:text-2xl text-green-700">Chợ Nhân Cơ</h1>
              <p className="text-xs lg:text-sm text-gray-600 hidden sm:block">Kết nối giao thương, gắn kết cộng đồng</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-6" suppressHydrationWarning>
            <Link href="/" className="text-green-600 font-medium hover:text-green-700">Trang chủ</Link>
            <Link href="/products" className="text-gray-700 hover:text-green-600">Sản phẩm</Link>
            <Link href="/real-estate" className="text-gray-700 hover:text-green-600">Bất động sản</Link>
            <Link href="/forum" className="text-gray-700 hover:text-green-600">Diễn đàn</Link>
            <Link href="/market-prices" className="text-gray-700 hover:text-green-600">Giá thị trường</Link>
            <Link href="/advertisements" className="text-gray-700 hover:text-green-600">Quảng cáo</Link>
            <Link href="/jobs" className="text-gray-700 hover:text-green-600">Tuyển dụng</Link>
            <Link href="/pricing" className="text-gray-700 hover:text-green-600">Bảng giá</Link>
          </nav>

          <div className="flex items-center space-x-2 lg:space-x-4" suppressHydrationWarning>
            <div className="relative" ref={postMenuRef}>
              <button
                onClick={handlePostMenuToggle}
                className="bg-green-600 text-white px-3 py-2 lg:px-6 lg:py-2 rounded-lg hover:bg-green-700 text-sm lg:text-base flex items-center gap-2"
              >
                <span className="hidden sm:inline">Đăng tin</span>
                <i className="ri-add-line sm:hidden"></i>
                <i className="ri-arrow-down-s-line hidden sm:inline"></i>
              </button>

              {showPostMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link href="/products/create" className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50" onClick={() => setShowPostMenu(false)}>
                    <i className="ri-plant-line text-green-600 mr-3 text-lg"></i>
                    <div><div className="font-medium">Đăng sản phẩm</div><div className="text-xs text-gray-500">Nông sản, thực phẩm</div></div>
                  </Link>
                  <Link href="/real-estate/create" className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50" onClick={() => setShowPostMenu(false)}>
                    <i className="ri-home-4-line text-blue-600 mr-3 text-lg"></i>
                    <div><div className="font-medium">Đăng bất động sản</div><div className="text-xs text-gray-500">Nhà đất, phòng trọ</div></div>
                  </Link>
                  <Link href="/forum/create" className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50" onClick={() => setShowPostMenu(false)}>
                    <i className="ri-chat-3-line text-purple-600 mr-3 text-lg"></i>
                    <div><div className="font-medium">Viết bài diễn đàn</div><div className="text-xs text-gray-500">Chia sẻ kinh nghiệm</div></div>
                  </Link>
                  <Link href="/advertisements/create" className="flex items-center px-4 py-3 text-gray-700 hover:bg-orange-50" onClick={() => setShowPostMenu(false)}>
                    <i className="ri-megaphone-line text-orange-600 mr-3 text-lg"></i>
                    <div><div className="font-medium">Đăng quảng cáo</div><div className="text-xs text-gray-500">Khai trương, khuyến mãi</div></div>
                  </Link>
                  <Link href="/jobs/create" className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50" onClick={() => setShowPostMenu(false)}>
                    <i className="ri-briefcase-line text-indigo-600 mr-3 text-lg"></i>
                    <div><div className="font-medium">Đăng tuyển dụng</div><div className="text-xs text-gray-500">Tìm việc, thuê nhân công</div></div>
                  </Link>
                </div>
              )}
            </div>

            <Link href="/dashboard" className="text-gray-700 hover:text-green-600 p-2" title="Dashboard">
              <i className="ri-user-line text-lg lg:text-xl"></i>
            </Link>

            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="lg:hidden text-gray-700 hover:text-green-600 p-2">
              <i className="ri-menu-line text-xl"></i>
            </button>
          </div>
        </div>

        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <nav className="space-y-1">
              {[
                { href: '/', label: 'Trang chủ' },
                { href: '/products', label: 'Sản phẩm' },
                { href: '/real-estate', label: 'Bất động sản' },
                { href: '/forum', label: 'Diễn đàn' },
                { href: '/market-prices', label: 'Giá thị trường' },
                { href: '/advertisements', label: 'Quảng cáo' },
                { href: '/jobs', label: 'Tuyển dụng' },
                { href: '/pricing', label: 'Bảng giá' },
                { href: '/dashboard', label: 'Dashboard' },
              ].map(item => (
                <Link key={item.href} href={item.href} className="block px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg" onClick={() => setShowMobileMenu(false)}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
