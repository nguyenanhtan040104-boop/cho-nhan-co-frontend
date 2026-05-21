'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { id: 'nong-san',    label: 'Nông sản',       icon: 'ri-plant-line',        color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200',  activeBg: 'bg-green-600' },
  { id: 'bat-dong-san',label: 'Bất động sản',   icon: 'ri-building-line',     color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', activeBg: 'bg-orange-600' },
  { id: 'viec-lam',    label: 'Việc làm',        icon: 'ri-briefcase-line',    color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   activeBg: 'bg-blue-600' },
  { id: 'vat-nuoi',    label: 'Vật nuôi',        icon: 'ri-bear-smile-line',   color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', activeBg: 'bg-yellow-500' },
  { id: 'dich-vu',     label: 'Dịch vụ',         icon: 'ri-service-line',      color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', activeBg: 'bg-purple-600' },
  { id: 'quang-cao',   label: 'Quảng cáo',       icon: 'ri-megaphone-line',    color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',    activeBg: 'bg-red-600' },
];

type PkgTier = { name: string; badge?: string; price: number; unit: string; posts: number | string; vipPosts: number; features: string[]; highlight: boolean; createHref: string };

const PACKAGES: Record<string, PkgTier[]> = {
  'nong-san': [
    {
      name: 'Cơ bản', price: 0, unit: 'Miễn phí',
      posts: 10, vipPosts: 0,
      features: ['10 tin thường/tháng', 'Hiển thị 30 ngày/tin', 'Tối đa 5 ảnh/tin', 'Hỗ trợ qua email'],
      highlight: false, createHref: '/products/create',
    },
    {
      name: 'Tiêu chuẩn', badge: 'Phổ biến', price: 99000, unit: '/tháng',
      posts: 30, vipPosts: 3,
      features: ['30 tin thường/tháng', '3 tin VIP ưu tiên', 'Hiển thị 45 ngày/tin', 'Tối đa 10 ảnh/tin', 'Ghim tin 3 ngày', 'Hỗ trợ ưu tiên'],
      highlight: true, createHref: '/wallet',
    },
    {
      name: 'Chuyên nghiệp', price: 199000, unit: '/tháng',
      posts: 'Không giới hạn', vipPosts: 10,
      features: ['Tin thường không giới hạn', '10 tin VIP/tháng', 'Hiển thị 60 ngày/tin', 'Ảnh không giới hạn', 'Ghim tin 7 ngày', 'Trang cửa hàng riêng', 'Hỗ trợ 24/7'],
      highlight: false, createHref: '/wallet',
    },
  ],
  'bat-dong-san': [
    {
      name: 'Cơ bản', price: 0, unit: 'Miễn phí',
      posts: 5, vipPosts: 0,
      features: ['5 tin thường/tháng', 'Hiển thị 30 ngày/tin', 'Tối đa 8 ảnh/tin', 'Hỗ trợ qua email'],
      highlight: false, createHref: '/real-estate/create',
    },
    {
      name: 'Tiêu chuẩn', badge: 'Phổ biến', price: 199000, unit: '/tháng',
      posts: 20, vipPosts: 5,
      features: ['20 tin thường/tháng', '5 tin VIP ưu tiên', 'Hiển thị 60 ngày/tin', 'Tối đa 15 ảnh/tin', 'Ghim tin 5 ngày', 'Hỗ trợ ưu tiên'],
      highlight: true, createHref: '/wallet',
    },
    {
      name: 'Chuyên nghiệp', price: 399000, unit: '/tháng',
      posts: 'Không giới hạn', vipPosts: 15,
      features: ['Tin thường không giới hạn', '15 tin VIP/tháng', 'Hiển thị 90 ngày/tin', 'Ảnh không giới hạn', 'Ghim tin 14 ngày', 'Trang cửa hàng riêng', 'Hỗ trợ 24/7'],
      highlight: false, createHref: '/wallet',
    },
  ],
  'viec-lam': [
    {
      name: 'Cơ bản', price: 0, unit: 'Miễn phí',
      posts: 5, vipPosts: 0,
      features: ['5 tin tuyển dụng/tháng', 'Hiển thị 30 ngày/tin', 'Tối đa 3 ảnh/tin', 'Hỗ trợ qua email'],
      highlight: false, createHref: '/jobs/create',
    },
    {
      name: 'Tiêu chuẩn', badge: 'Phổ biến', price: 149000, unit: '/tháng',
      posts: 20, vipPosts: 3,
      features: ['20 tin tuyển dụng/tháng', '3 tin VIP ưu tiên', 'Hiển thị 45 ngày/tin', 'Logo công ty', 'Ghim tin 3 ngày', 'Hỗ trợ ưu tiên'],
      highlight: true, createHref: '/wallet',
    },
    {
      name: 'Chuyên nghiệp', price: 299000, unit: '/tháng',
      posts: 'Không giới hạn', vipPosts: 10,
      features: ['Tin tuyển dụng không giới hạn', '10 tin VIP/tháng', 'Hiển thị 60 ngày/tin', 'Trang doanh nghiệp riêng', 'Ghim tin 7 ngày', 'Lọc hồ sơ nâng cao', 'Hỗ trợ 24/7'],
      highlight: false, createHref: '/wallet',
    },
  ],
  'vat-nuoi': [
    {
      name: 'Cơ bản', price: 0, unit: 'Miễn phí',
      posts: 10, vipPosts: 0,
      features: ['10 tin vật nuôi/tháng', 'Hiển thị 30 ngày/tin', 'Tối đa 5 ảnh/tin', 'Hỗ trợ qua email'],
      highlight: false, createHref: '/products/create?category=VAT_NUOI',
    },
    {
      name: 'Tiêu chuẩn', badge: 'Phổ biến', price: 79000, unit: '/tháng',
      posts: 25, vipPosts: 3,
      features: ['25 tin vật nuôi/tháng', '3 tin VIP ưu tiên', 'Hiển thị 45 ngày/tin', 'Tối đa 10 ảnh/tin', 'Ghim tin 3 ngày', 'Hỗ trợ ưu tiên'],
      highlight: true, createHref: '/wallet',
    },
    {
      name: 'Chuyên nghiệp', price: 149000, unit: '/tháng',
      posts: 'Không giới hạn', vipPosts: 8,
      features: ['Tin không giới hạn', '8 tin VIP/tháng', 'Hiển thị 60 ngày/tin', 'Ảnh không giới hạn', 'Ghim tin 7 ngày', 'Trang trại riêng', 'Hỗ trợ 24/7'],
      highlight: false, createHref: '/wallet',
    },
  ],
  'dich-vu': [
    {
      name: 'Cơ bản', price: 0, unit: 'Miễn phí',
      posts: 10, vipPosts: 0,
      features: ['10 tin dịch vụ/tháng', 'Hiển thị 30 ngày/tin', 'Tối đa 5 ảnh/tin', 'Hỗ trợ qua email'],
      highlight: false, createHref: '/products/create?category=DICH_VU',
    },
    {
      name: 'Tiêu chuẩn', badge: 'Phổ biến', price: 99000, unit: '/tháng',
      posts: 30, vipPosts: 3,
      features: ['30 tin dịch vụ/tháng', '3 tin VIP ưu tiên', 'Hiển thị 45 ngày/tin', 'Tối đa 10 ảnh/tin', 'Ghim tin 3 ngày', 'Hỗ trợ ưu tiên'],
      highlight: true, createHref: '/wallet',
    },
    {
      name: 'Chuyên nghiệp', price: 199000, unit: '/tháng',
      posts: 'Không giới hạn', vipPosts: 8,
      features: ['Tin không giới hạn', '8 tin VIP/tháng', 'Hiển thị 60 ngày/tin', 'Ảnh không giới hạn', 'Ghim tin 7 ngày', 'Trang dịch vụ riêng', 'Hỗ trợ 24/7'],
      highlight: false, createHref: '/wallet',
    },
  ],
  'quang-cao': [
    {
      name: 'Cơ bản', price: 0, unit: 'Miễn phí',
      posts: 3, vipPosts: 0,
      features: ['3 quảng cáo/tháng', 'Hiển thị 7 ngày/tin', 'Tối đa 3 ảnh', 'Hỗ trợ qua email'],
      highlight: false, createHref: '/advertisements/create',
    },
    {
      name: 'Nổi bật', badge: 'Phổ biến', price: 50000, unit: '/tin',
      posts: 1, vipPosts: 0,
      features: ['Vị trí ưu tiên', 'Hiển thị 14 ngày', 'Nhãn "Nổi bật"', 'Tối đa 5 ảnh', 'Ghim 3 ngày đầu', 'Hỗ trợ ưu tiên'],
      highlight: true, createHref: '/wallet',
    },
    {
      name: 'VIP', price: 100000, unit: '/tin',
      posts: 1, vipPosts: 0,
      features: ['Vị trí đầu tiên', 'Hiển thị 30 ngày', 'Nhãn "VIP" nổi bật', 'Ảnh không giới hạn', 'Ghim toàn thời gian', 'Hỗ trợ 24/7'],
      highlight: false, createHref: '/wallet',
    },
  ],
};

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

export default function PricingPage() {
  const [activeCat, setActiveCat] = useState('nong-san');
  const router = useRouter();
  const cat = CATEGORIES.find(c => c.id === activeCat)!;
  const pkgs = PACKAGES[activeCat] || [];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-10 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <i className="ri-vip-crown-fill"></i> Gói PRO
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gói dịch vụ đăng tin chuyên nghiệp</h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">Tối ưu chi phí, tăng hiệu quả tiếp cận khách hàng với gói PRO phù hợp từng danh mục</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Quản lý gói */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Quản lý gói đang sử dụng</p>
          <Link href="/dashboard?tab=vip"
            className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center">
                <i className="ri-vip-crown-fill text-white text-base"></i>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Quản lý gói PRO</p>
                <p className="text-xs text-gray-400">Xem gói đang dùng, lịch sử mua</p>
              </div>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400 group-hover:text-yellow-500 text-lg"></i>
          </Link>
        </div>

        {/* Chọn danh mục */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-4">Chọn danh mục gói cần mua</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setActiveCat(c.id)}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all font-medium text-sm ${
                  activeCat === c.id
                    ? `${c.activeBg} text-white border-transparent shadow-md`
                    : `bg-white ${c.border} ${c.color} hover:${c.bg}`
                }`}>
                <div className="flex items-center gap-2.5">
                  <i className={`${c.icon} text-lg`}></i>
                  <span>{c.label}</span>
                </div>
                <i className="ri-arrow-right-s-line text-base opacity-70"></i>
              </button>
            ))}
          </div>
        </div>

        {/* Gói theo danh mục */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.bg}`}>
              <i className={`${cat.icon} ${cat.color} text-base`}></i>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base">Gói PRO — {cat.label}</p>
              <p className="text-xs text-gray-400">Chọn gói phù hợp với nhu cầu đăng tin</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pkgs.map((pkg) => (
              <div key={pkg.name}
                className={`relative rounded-2xl border-2 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                  pkg.highlight
                    ? 'border-yellow-400 bg-yellow-50 shadow-md'
                    : 'border-gray-200 bg-white'
                }`}>
                {pkg.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow">
                      {pkg.badge}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="text-center mb-4 pt-1">
                  <p className="font-bold text-gray-900 text-base mb-1">{pkg.name}</p>
                  <p className={`text-2xl font-bold ${pkg.highlight ? 'text-yellow-700' : 'text-gray-900'}`}>
                    {pkg.price === 0 ? 'Miễn phí' : fmt(pkg.price)}
                  </p>
                  {pkg.price > 0 && <p className="text-xs text-gray-400">{pkg.unit}</p>}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className={`rounded-xl p-2.5 text-center ${pkg.highlight ? 'bg-yellow-100' : 'bg-gray-50'}`}>
                    <p className={`text-lg font-bold ${pkg.highlight ? 'text-yellow-700' : 'text-gray-800'}`}>
                      {typeof pkg.posts === 'number' ? pkg.posts : '∞'}
                    </p>
                    <p className="text-[10px] text-gray-500">Tin thường</p>
                  </div>
                  <div className={`rounded-xl p-2.5 text-center ${pkg.vipPosts > 0 ? (pkg.highlight ? 'bg-orange-100' : 'bg-orange-50') : (pkg.highlight ? 'bg-yellow-100' : 'bg-gray-50')}`}>
                    <p className={`text-lg font-bold ${pkg.vipPosts > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                      {pkg.vipPosts}
                    </p>
                    <p className="text-[10px] text-gray-500">Tin VIP</p>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-1.5 mb-5">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                      <i className={`ri-check-line flex-shrink-0 ${pkg.highlight ? 'text-yellow-600' : 'text-green-500'}`}></i>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {pkg.price === 0 ? (
                  <Link href={pkg.createHref}
                    className="block w-full text-center py-2.5 rounded-xl border-2 border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
                    Đăng tin miễn phí
                  </Link>
                ) : (
                  <Link href={pkg.createHref}
                    className={`block w-full text-center py-2.5 rounded-xl text-sm font-bold text-white transition shadow ${
                      pkg.highlight
                        ? 'bg-yellow-500 hover:bg-yellow-600'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}>
                    Mua ngay
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* So sánh nhanh */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          <p className="font-semibold text-gray-800 mb-4">So sánh các gói — {cat.label}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 text-gray-500 font-medium w-1/3">Tính năng</th>
                  {pkgs.map(p => (
                    <th key={p.name} className={`py-2 px-3 text-center font-bold ${p.highlight ? 'text-yellow-700' : 'text-gray-700'}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { label: 'Giá', values: pkgs.map(p => p.price === 0 ? 'Miễn phí' : fmt(p.price) + p.unit) },
                  { label: 'Tin thường/tháng', values: pkgs.map(p => typeof p.posts === 'number' ? p.posts.toString() : '∞') },
                  { label: 'Tin VIP/tháng', values: pkgs.map(p => p.vipPosts === 0 ? '—' : p.vipPosts.toString()) },
                  { label: 'Thời hạn hiển thị', values: pkgs.map((_, i) => i === 0 ? '30 ngày' : i === 1 ? '45 ngày' : '60 ngày') },
                  { label: 'Ghim tin', values: pkgs.map((_, i) => i === 0 ? '—' : i === 1 ? '3 ngày' : '7 ngày') },
                  { label: 'Hỗ trợ', values: pkgs.map((_, i) => i === 0 ? 'Email' : i === 1 ? 'Ưu tiên' : '24/7') },
                ].map(row => (
                  <tr key={row.label}>
                    <td className="py-2.5 pr-4 text-gray-500">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className={`py-2.5 px-3 text-center font-medium ${pkgs[i]?.highlight ? 'text-yellow-700 bg-yellow-50/50' : 'text-gray-700'}`}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Nạp ví */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="ri-wallet-3-line text-2xl"></i>
            </div>
            <div>
              <p className="font-bold text-base">Thanh toán qua Ví Chợ NC</p>
              <p className="text-sm text-yellow-100">Nạp tiền vào ví để mua gói PRO nhanh chóng</p>
            </div>
          </div>
          <Link href="/wallet"
            className="flex-shrink-0 bg-white text-yellow-700 font-bold px-6 py-2.5 rounded-xl hover:bg-yellow-50 transition text-sm whitespace-nowrap">
            Nạp tiền ngay
          </Link>
        </div>

      </div>
    </div>
  );
}