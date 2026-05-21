'use client';

import { useState } from 'react';
import Link from 'next/link';

const CATEGORIES = [
  { id: 'nong-san',     label: 'Nông sản',       icon: 'ri-plant-line',      color: 'text-green-600',  activeBg: 'bg-green-600' },
  { id: 'bat-dong-san', label: 'Bất động sản',    icon: 'ri-building-line',   color: 'text-orange-600', activeBg: 'bg-orange-500' },
  { id: 'viec-lam',     label: 'Việc làm',        icon: 'ri-briefcase-line',  color: 'text-blue-600',   activeBg: 'bg-blue-600' },
  { id: 'vat-nuoi',     label: 'Vật nuôi',        icon: 'ri-bear-smile-line', color: 'text-yellow-600', activeBg: 'bg-yellow-500' },
  { id: 'dich-vu',      label: 'Dịch vụ',         icon: 'ri-service-line',    color: 'text-purple-600', activeBg: 'bg-purple-600' },
  { id: 'quang-cao',    label: 'Quảng cáo',       icon: 'ri-megaphone-line',  color: 'text-red-600',    activeBg: 'bg-red-600' },
];

const PACKAGES: Record<string, any[]> = {
  'nong-san': [
    {
      name: 'Gói Cơ bản', discount: '-16%', price: 99, days: 30,
      boostDefault: 0, boostPlus: 5, boostPrice: 20,
      features: ['30 lượt đăng tin mỗi tháng', 'Hiển thị 45 ngày/tin', 'Tối đa 10 ảnh/tin', 'Hỗ trợ qua email'],
      posts: 30, unlimited: false, href: '/wallet',
    },
    {
      name: 'Gói Chuyên nghiệp', discount: '-25%', price: 199, days: 30,
      boostDefault: 0, boostPlus: 10, boostPrice: 30,
      features: ['Đăng tin không giới hạn', 'Hiển thị 60 ngày/tin', 'Ảnh không giới hạn', 'Trang cửa hàng riêng', 'Hỗ trợ 24/7'],
      posts: null, unlimited: true, href: '/wallet', highlight: true,
    },
  ],
  'bat-dong-san': [
    {
      name: 'Gói Cơ bản', discount: '-16%', price: 199, days: 30,
      boostDefault: 0, boostPlus: 5, boostPrice: 30,
      features: ['20 lượt đăng tin mỗi tháng', 'Hiển thị 60 ngày/tin', 'Tối đa 15 ảnh/tin', 'Hỗ trợ qua email'],
      posts: 20, unlimited: false, href: '/wallet',
    },
    {
      name: 'Gói Chuyên nghiệp', discount: '-30%', price: 399, days: 30,
      boostDefault: 0, boostPlus: 15, boostPrice: 50,
      features: ['Đăng tin không giới hạn', 'Hiển thị 90 ngày/tin', 'Ảnh không giới hạn', 'Trang bất động sản riêng', 'Hỗ trợ 24/7'],
      posts: null, unlimited: true, href: '/wallet', highlight: true,
    },
  ],
  'viec-lam': [
    {
      name: 'Gói Cơ bản', discount: '-20%', price: 149, days: 30,
      boostDefault: 0, boostPlus: 5, boostPrice: 25,
      features: ['20 lượt đăng tuyển dụng/tháng', 'Hiển thị 45 ngày/tin', 'Logo công ty', 'Hỗ trợ qua email'],
      posts: 20, unlimited: false, href: '/wallet',
    },
    {
      name: 'Gói Chuyên nghiệp', discount: '-28%', price: 299, days: 30,
      boostDefault: 0, boostPlus: 10, boostPrice: 40,
      features: ['Đăng tin không giới hạn', 'Hiển thị 60 ngày/tin', 'Trang doanh nghiệp riêng', 'Lọc hồ sơ nâng cao', 'Hỗ trợ 24/7'],
      posts: null, unlimited: true, href: '/wallet', highlight: true,
    },
  ],
  'vat-nuoi': [
    {
      name: 'Gói Cơ bản', discount: '-15%', price: 79, days: 30,
      boostDefault: 0, boostPlus: 5, boostPrice: 15,
      features: ['25 lượt đăng tin mỗi tháng', 'Hiển thị 45 ngày/tin', 'Tối đa 10 ảnh/tin', 'Hỗ trợ qua email'],
      posts: 25, unlimited: false, href: '/wallet',
    },
    {
      name: 'Gói Chuyên nghiệp', discount: '-22%', price: 149, days: 30,
      boostDefault: 0, boostPlus: 8, boostPrice: 20,
      features: ['Đăng tin không giới hạn', 'Hiển thị 60 ngày/tin', 'Ảnh không giới hạn', 'Trang trại riêng', 'Hỗ trợ 24/7'],
      posts: null, unlimited: true, href: '/wallet', highlight: true,
    },
  ],
  'dich-vu': [
    {
      name: 'Gói Cơ bản', discount: '-16%', price: 99, days: 30,
      boostDefault: 0, boostPlus: 5, boostPrice: 20,
      features: ['30 lượt đăng tin mỗi tháng', 'Hiển thị 45 ngày/tin', 'Tối đa 10 ảnh/tin', 'Hỗ trợ qua email'],
      posts: 30, unlimited: false, href: '/wallet',
    },
    {
      name: 'Gói Chuyên nghiệp', discount: '-24%', price: 199, days: 30,
      boostDefault: 0, boostPlus: 8, boostPrice: 30,
      features: ['Đăng tin không giới hạn', 'Hiển thị 60 ngày/tin', 'Ảnh không giới hạn', 'Trang dịch vụ riêng', 'Hỗ trợ 24/7'],
      posts: null, unlimited: true, href: '/wallet', highlight: true,
    },
  ],
  'quang-cao': [
    {
      name: 'Gói Nổi bật', discount: '-20%', price: 50, days: 14,
      boostDefault: 0, boostPlus: 3, boostPrice: 10,
      features: ['Vị trí ưu tiên', 'Hiển thị 14 ngày', 'Nhãn "Nổi bật"', 'Tối đa 5 ảnh'],
      posts: 1, unlimited: false, href: '/wallet',
    },
    {
      name: 'Gói VIP', discount: '-30%', price: 100, days: 30,
      boostDefault: 0, boostPlus: 5, boostPrice: 20,
      features: ['Vị trí đầu tiên', 'Hiển thị 30 ngày', 'Nhãn "VIP" nổi bật', 'Ảnh không giới hạn', 'Ghim toàn thời gian'],
      posts: 1, unlimited: false, href: '/wallet', highlight: true,
    },
  ],
};

export default function PricingPage() {
  const [activeCat, setActiveCat] = useState('nong-san');
  const [boostMode, setBoostMode] = useState<Record<string, boolean>>({});
  const pkgs = PACKAGES[activeCat] || [];

  function toggleBoost(pkgName: string) {
    setBoostMode(prev => ({ ...prev, [pkgName]: !prev[pkgName] }));
  }

  function getPrice(pkg: any) {
    const isBoost = boostMode[pkg.name];
    return isBoost ? pkg.price + pkg.boostPrice : pkg.price;
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
            <i className="ri-vip-crown-fill"></i> Gói PRO
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Gói đăng tin chuyên nghiệp</h1>
          <p className="text-gray-400 text-sm">Chọn gói phù hợp — tăng hiệu quả, tiết kiệm chi phí</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* Category grid */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">CHỌN DANH MỤC</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setActiveCat(c.id)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                  activeCat === c.id
                    ? `${c.activeBg} text-white shadow-sm`
                    : `bg-gray-50 ${c.color} hover:bg-gray-100`
                }`}>
                <i className={`${c.icon} text-xl`}></i>
                <span className="leading-tight text-center">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Package cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pkgs.map((pkg) => {
            const isBoost = boostMode[pkg.name];
            const price = getPrice(pkg);
            return (
              <div key={pkg.name}
                className={`rounded-2xl border-2 overflow-hidden transition-all ${
                  pkg.highlight ? 'border-yellow-400' : 'border-gray-200'
                } bg-white`}>

                {/* Card top */}
                <div className={`px-5 pt-5 pb-4 ${pkg.highlight ? 'bg-yellow-50' : ''}`}>

                  {/* Name + discount badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-gray-900 text-base">{pkg.name}</span>
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                      {pkg.discount}
                    </span>
                    {pkg.highlight && (
                      <span className="ml-auto bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Pho bien
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <span className={`text-3xl font-black ${pkg.highlight ? 'text-yellow-600' : 'text-gray-900'}`}>
                      {price}k
                    </span>
                    <span className="text-sm font-semibold text-gray-400 ml-1.5">
                      VND/ {pkg.days} NGÀY
                    </span>
                  </div>

                  {/* Boost toggle */}
                  <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-5 text-xs font-semibold">
                    <button onClick={() => !isBoost || toggleBoost(pkg.name)}
                      className={`flex-1 py-2 transition-all ${!isBoost ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                      Mặc định
                    </button>
                    <button onClick={() => isBoost || toggleBoost(pkg.name)}
                      className={`flex-1 py-2 transition-all ${isBoost ? 'bg-green-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                      +{pkg.boostPlus} Đẩy tin
                    </button>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-5">
                    {pkg.features.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <i className="ri-check-line text-green-500 flex-shrink-0 mt-0.5"></i>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link href={pkg.href}
                    className={`block w-full text-center py-3 rounded-xl text-sm font-bold transition ${
                      pkg.highlight
                        ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900'
                        : 'bg-gray-900 hover:bg-gray-700 text-white'
                    }`}>
                    Mua ngay
                  </Link>
                </div>

                {/* Stats row */}
                <div className={`border-t px-5 py-3 flex items-center justify-between ${pkg.highlight ? 'border-yellow-200 bg-yellow-50/60' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <i className="ri-file-list-line text-gray-400"></i>
                    <span>Lượt đăng tin:</span>
                    <span className="font-bold text-gray-700">{pkg.unlimited ? 'Không giới hạn' : pkg.posts}</span>
                  </div>
                  {pkg.unlimited && (
                    <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                      Không giới hạn hiển thị
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quản lý gói + Nap vi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/dashboard?tab=vip"
            className="flex items-center gap-4 bg-white rounded-2xl border border-gray-200 p-4 hover:border-yellow-400 hover:bg-yellow-50 transition group">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="ri-vip-crown-fill text-white text-lg"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm">Quản lý gói PRO</p>
              <p className="text-xs text-gray-400">Xem gói đang dùng, lịch sử mua</p>
            </div>
            <i className="ri-arrow-right-s-line text-gray-300 group-hover:text-yellow-500 text-xl"></i>
          </Link>

          <Link href="/wallet"
            className="flex items-center gap-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 hover:opacity-90 transition">
            <div className="w-10 h-10 bg-white/25 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="ri-wallet-3-line text-white text-lg"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm">Nạp tiền vào ví</p>
              <p className="text-xs text-yellow-100">Thanh toán nhanh qua Ví Chợ NC</p>
            </div>
            <i className="ri-arrow-right-s-line text-white/70 text-xl"></i>
          </Link>
        </div>

      </div>
    </div>
  );
}