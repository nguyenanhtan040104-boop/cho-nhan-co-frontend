'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const router = useRouter();

  const advertisementPackages = [
    {
      id: 'ad_basic',
      name: 'Quảng cáo Cơ bản',
      price: 0,
      duration: '7 ngày',
      features: ['Hiển thị 7 ngày', 'Vị trí thường trong danh sách', 'Tối đa 3 hình ảnh', 'Hỗ trợ cơ bản'],
      popular: false,
    },
    {
      id: 'ad_featured',
      name: 'Quảng cáo Nổi bật',
      price: 50000,
      duration: '14 ngày',
      features: ['Hiển thị 14 ngày', 'Vị trí ưu tiên', 'Tối đa 5 hình ảnh', 'Nhãn "Nổi bật"', 'Ghim 3 ngày đầu', 'Hỗ trợ ưu tiên'],
      popular: true,
    },
    {
      id: 'ad_vip',
      name: 'Quảng cáo VIP',
      price: 100000,
      duration: '30 ngày',
      features: ['Hiển thị 30 ngày', 'Vị trí đầu tiên', 'Không giới hạn hình ảnh', 'Nhãn "VIP" nổi bật', 'Ghim toàn thời gian', 'Hỗ trợ chuyên biệt'],
      popular: false,
    },
  ];

  const postPackages = [
    {
      id: 'basic',
      name: 'Tin thường',
      price: 0,
      duration: '30 ngày',
      features: ['Đăng tin miễn phí', 'Hiển thị trong danh sách', 'Tối đa 5 hình ảnh', 'Hỗ trợ cơ bản'],
      popular: false,
    },
    {
      id: 'vip',
      name: 'Tin VIP',
      price: 50000,
      duration: '30 ngày',
      features: ['Ưu tiên hiển thị trên đầu', 'Khung viền vàng nổi bật', 'Nhãn "VIP" đặc biệt', 'Tối đa 10 hình ảnh', 'Hỗ trợ ưu tiên'],
      popular: true,
    },
    {
      id: 'premium',
      name: 'Tin Premium',
      price: 100000,
      duration: '45 ngày',
      features: ['Hiển thị nổi bật nhất', 'Khung viền Premium', 'Nhãn "PREMIUM"', 'Không giới hạn hình ảnh', 'Ghim 7 ngày đầu', 'Hỗ trợ 24/7'],
      popular: false,
    },
  ];

  const membershipPlans = [
    {
      id: 'basic_member',
      name: 'Thành viên Cơ bản',
      price: { monthly: 99000, yearly: 990000 },
      color: 'blue',
      popular: false,
      features: ['Đăng 20 tin/tháng', 'Giảm 20% phí tin VIP', 'Duyệt tin nhanh hơn 50%', 'Thống kê cơ bản', 'Hỗ trợ email'],
    },
    {
      id: 'pro_member',
      name: 'Thành viên Pro',
      price: { monthly: 199000, yearly: 1990000 },
      color: 'green',
      popular: true,
      features: ['Đăng không giới hạn tin', 'Giảm 40% phí tin VIP', 'Duyệt tin ưu tiên', 'Thống kê chi tiết', 'Hỗ trợ điện thoại', 'Quản lý tin đăng nâng cao'],
    },
    {
      id: 'business_member',
      name: 'Thành viên Doanh nghiệp',
      price: { monthly: 399000, yearly: 3990000 },
      color: 'purple',
      popular: false,
      features: ['Tất cả tính năng Pro', 'Trang cửa hàng riêng', 'Tin được ghim tự động', 'API tích hợp', 'Quản lý đa tài khoản', 'Hỗ trợ chuyên biệt', 'Báo cáo doanh số'],
    },
  ];

  const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
  const discount = (m: number, y: number) => Math.round(((m * 12 - y) / (m * 12)) * 100);

  const memberColorMap: Record<string, { ring: string; badge: string; btn: string; iconCls: string }> = {
    blue:   { ring: 'ring-blue-300',   badge: 'from-blue-500 to-indigo-500',   btn: 'from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600',   iconCls: 'text-blue-600 bg-blue-100' },
    green:  { ring: 'ring-green-300',  badge: 'from-green-500 to-emerald-500', btn: 'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600', iconCls: 'text-green-600 bg-green-100' },
    purple: { ring: 'ring-purple-300', badge: 'from-purple-500 to-indigo-500', btn: 'from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600', iconCls: 'text-purple-600 bg-purple-100' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="ri-price-tag-3-line text-4xl text-white"></i>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Bảng giá dịch vụ</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Chọn gói phù hợp để tăng hiệu quả kinh doanh
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1.5 rounded-2xl shadow-md border border-gray-200 flex">
            <button onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}>
              Hàng tháng
            </button>
            <button onClick={() => setBillingCycle('yearly')}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${billingCycle === 'yearly' ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}>
              Hàng năm
              <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">-17%</span>
            </button>
          </div>
        </div>

        {/* ===== MONTHLY: Gói đăng tin + Quảng cáo + Thành viên ===== */}
        {billingCycle === 'monthly' && (
          <>
            {/* Quick links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { href: '/products/create', icon: 'ri-plant-line', label: 'Đăng sản phẩm', color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
                { href: '/jobs/create', icon: 'ri-briefcase-line', label: 'Đăng tuyển dụng', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' },
                { href: '/real-estate/create', icon: 'ri-home-4-line', label: 'Đăng BĐS', color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
                { href: '/forum/create', icon: 'ri-discuss-line', label: 'Đăng diễn đàn', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all font-medium text-sm text-center ${l.color}`}>
                  <i className={`${l.icon} text-2xl`}></i>
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Gói đăng tin */}
            <div className="mb-16">
              <div className="text-center mb-10">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="ri-article-line text-2xl text-white"></i>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Gói đăng tin</h2>
                <p className="text-gray-500">Chọn loại tin phù hợp — mua qua ví</p>
                <Link href="/wallet" className="inline-flex items-center gap-1 mt-2 text-green-600 hover:underline text-sm">
                  <i className="ri-wallet-3-line"></i> Nạp tiền vào ví để mua VIP
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {postPackages.map(pkg => (
                  <div key={pkg.id}
                    className={`relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${pkg.popular ? 'ring-4 ring-green-300 scale-105' : ''}`}>
                    {pkg.popular && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-lg">⭐ Phổ biến nhất</span>
                      </div>
                    )}
                    <div className="p-8">
                      <div className="text-center mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${pkg.id === 'basic' ? 'bg-gray-100' : pkg.id === 'vip' ? 'bg-yellow-100' : 'bg-red-100'}`}>
                          <i className={`text-2xl ${pkg.id === 'basic' ? 'ri-article-line text-gray-500' : pkg.id === 'vip' ? 'ri-vip-crown-fill text-yellow-600' : 'ri-award-fill text-red-500'}`}></i>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                        <p className="text-4xl font-bold text-gray-900">{pkg.price === 0 ? 'Miễn phí' : fmt(pkg.price)}</p>
                        {pkg.price > 0 && <p className="text-gray-500 text-sm">/{pkg.duration}</p>}
                      </div>
                      <ul className="space-y-3 mb-8">
                        {pkg.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <i className="ri-check-line text-green-600 text-xs"></i>
                            </div>
                            {f}
                          </li>
                        ))}
                      </ul>
                      {pkg.id === 'basic' ? (
                        <Link href="/products/create"
                          className="block w-full py-3.5 rounded-2xl font-bold text-center bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                          Đăng tin miễn phí
                        </Link>
                      ) : (
                        <Link href="/wallet"
                          className={`block w-full py-3.5 rounded-2xl font-bold text-white text-center transition shadow-md hover:shadow-lg ${pkg.id === 'vip' ? 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500' : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800'}`}>
                          Mua qua ví
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gói quảng cáo */}
            <div className="mb-16">
              <div className="text-center mb-10">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="ri-megaphone-line text-2xl text-white"></i>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Gói quảng cáo</h2>
                <p className="text-gray-500">Quảng bá sản phẩm và doanh nghiệp hiệu quả</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {advertisementPackages.map(pkg => (
                  <div key={pkg.id}
                    className={`relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${pkg.popular ? 'ring-4 ring-orange-300 scale-105' : ''}`}>
                    {pkg.popular && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                        <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-lg">⭐ Phổ biến nhất</span>
                      </div>
                    )}
                    <div className="p-8">
                      <div className="text-center mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${pkg.id === 'ad_basic' ? 'bg-gray-100' : pkg.id === 'ad_featured' ? 'bg-orange-100' : 'bg-red-100'}`}>
                          <i className={`ri-megaphone-line text-2xl ${pkg.id === 'ad_basic' ? 'text-gray-500' : pkg.id === 'ad_featured' ? 'text-orange-600' : 'text-red-600'}`}></i>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                        <p className="text-4xl font-bold text-gray-900">{pkg.price === 0 ? 'Miễn phí' : fmt(pkg.price)}</p>
                        {pkg.price > 0 && <p className="text-gray-500 text-sm">/{pkg.duration}</p>}
                      </div>
                      <ul className="space-y-3 mb-8">
                        {pkg.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <i className="ri-check-line text-green-600 text-xs"></i>
                            </div>
                            {f}
                          </li>
                        ))}
                      </ul>
                      {pkg.id === 'ad_basic' ? (
                        <Link href="/advertisements/create"
                          className="block w-full py-3.5 rounded-2xl font-bold text-center bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                          Đăng quảng cáo miễn phí
                        </Link>
                      ) : (
                        <button onClick={() => router.push(`/payment?package=${pkg.id}`)}
                          className={`w-full py-3.5 rounded-2xl font-bold text-white transition shadow-md hover:shadow-lg ${pkg.popular ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600' : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800'}`}>
                          Chọn gói này
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ===== BOTH: Gói thành viên ===== */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="ri-vip-crown-2-line text-2xl text-white"></i>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Gói thành viên</h2>
            <p className="text-gray-500">
              {billingCycle === 'yearly' ? 'Thanh toán hàng năm — tiết kiệm hơn 17%' : 'Nâng cấp tài khoản để đăng tin không giới hạn'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {membershipPlans.map(plan => {
              const c = memberColorMap[plan.color];
              return (
                <div key={plan.id}
                  className={`relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${plan.popular ? `ring-4 ${c.ring} scale-105` : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                      <span className={`bg-gradient-to-r ${c.badge} text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-lg`}>
                        ⭐ Được chọn nhiều nhất
                      </span>
                    </div>
                  )}
                  <div className="p-8">
                    <div className="text-center mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${c.iconCls}`}>
                        <i className="ri-vip-crown-2-line text-2xl"></i>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{plan.name}</h3>
                      <p className="text-4xl font-bold text-gray-900">{fmt(plan.price[billingCycle])}</p>
                      <p className="text-gray-500 text-sm">/{billingCycle === 'monthly' ? 'tháng' : 'năm'}</p>
                      {billingCycle === 'yearly' && (
                        <span className="inline-block mt-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full font-medium">
                          Tiết kiệm {discount(plan.price.monthly, plan.price.yearly)}%
                        </span>
                      )}
                      {billingCycle === 'monthly' && (
                        <p className="text-xs text-gray-400 mt-1">≈ {fmt(Math.round(plan.price.monthly / 30))}/ngày</p>
                      )}
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <i className="ri-check-line text-green-600 text-xs"></i>
                          </div>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => router.push(`/payment?package=${plan.id}`)}
                      className={`w-full py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r ${c.btn} transition-all shadow-md hover:shadow-lg`}>
                      Đăng ký ngay
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-12 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full -translate-y-28 translate-x-28"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-20 -translate-x-20"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Bắt đầu ngay hôm nay</h2>
            <p className="text-lg opacity-90 mb-8">Đăng tin, kết nối khách hàng và phát triển kinh doanh cùng Chợ Nhân Cơ</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/products/create" className="bg-white text-green-700 px-8 py-3.5 rounded-2xl font-bold hover:bg-gray-100 transition shadow-md flex items-center gap-2">
                <i className="ri-plant-line"></i> Đăng sản phẩm
              </Link>
              <Link href="/jobs/create" className="bg-white/20 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-white/30 transition backdrop-blur-sm flex items-center gap-2">
                <i className="ri-briefcase-line"></i> Đăng tuyển dụng
              </Link>
              <Link href="/real-estate/create" className="bg-white/20 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-white/30 transition backdrop-blur-sm flex items-center gap-2">
                <i className="ri-home-4-line"></i> Đăng BĐS
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
