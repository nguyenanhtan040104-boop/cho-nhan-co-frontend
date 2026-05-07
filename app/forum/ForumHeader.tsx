'use client';

import Link from 'next/link';

export default function ForumHeader() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">KT</span>
              </div>
              <span className="text-xl font-['Pacifico'] text-gray-900">Kon Tum</span>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-700 hover:text-green-600 font-medium cursor-pointer">
                Trang chủ
              </Link>
              <Link href="/forum" className="text-green-600 font-medium cursor-pointer">
                Diễn đàn
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-green-600 font-medium cursor-pointer">
                Sản phẩm
              </Link>
              <Link href="/market-prices" className="text-gray-700 hover:text-green-600 font-medium cursor-pointer">
                Giá thị trường
              </Link>
              <Link href="/events" className="text-gray-700 hover:text-green-600 font-medium cursor-pointer">
                Sự kiện
              </Link>
            </nav>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-green-600 cursor-pointer">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-notification-3-line"></i>
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            
            <Link href="/profile" className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
              <img
                src="https://readdy.ai/api/search-image?query=Vietnamese%20person%20portrait%20neutral%20friendly%20expression%20wearing%20casual%20clothes%20clean%20simple%20background%20for%20user%20profile%20avatar&width=32&height=32&seq=headeruser&orientation=squarish"
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-gray-700 font-medium hidden sm:block">Tài khoản</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}