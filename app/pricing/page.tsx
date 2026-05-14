
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
      price: { monthly: 0, yearly: 0 },
      duration: '7 ngày',
      features: [
        'Hiển thị 7 ngày',
        'Vị trí thường trong danh sách',
        'Tối đa 3 hình ảnh',
        'Hỗ trợ cơ bản',
      ],
      color: 'gray',
      popular: false,
    },
    {
      id: 'ad_featured',
      name: 'Quảng cáo Nổi bật',
      price: { monthly: 50000, yearly: 500000 },
      duration: '14 ngày',
      features: [
        'Hiển thị 14 ngày',
        'Vị trí ưu tiên',
        'Tối đa 5 hình ảnh',
        'Nhãn "Nổi bật"',
        'Ghim 3 ngày đầu',
        'Hỗ trợ ưu tiên',
      ],
      color: 'orange',
      popular: true,
    },
    {
      id: 'ad_vip',
      name: 'Quảng cáo VIP',
      price: { monthly: 100000, yearly: 1000000 },
      duration: '30 ngày',
      features: [
        'Hiển thị 30 ngày',
        'Vị trí đầu tiên',
        'Không giới hạn hình ảnh',
        'Nhãn "VIP" nổi bật',
        'Ghim toàn bộ thời gian',
        'Hỗ trợ chuyên biệt',
      ],
      color: 'red',
      popular: false,
    },
  ];

  const postPackages = [
    {
      id: 'basic',
      name: 'Tin thường',
      price: { monthly: 0, yearly: 0 },
      duration: '30 ngày',
      features: [
        'Đăng tin miễn phí',
        'Hiển thị trong danh sách thông thường',
        'Tối đa 5 hình ảnh',
        'Thời gian hiển thị: 30 ngày',
        'Hỗ trợ cơ bản',
      ],
      color: 'gray',
      popular: false,
    },
    {
      id: 'vip',
      name: 'Tin VIP',
      price: { monthly: 50000, yearly: 500000 },
      duration: '30 ngày',
      features: [
        'Ưu tiên hiển thị trên đầu',
        'Khung viền nổi bật màu vàng',
        'Nhãn "VIP" đặc biệt',
        'Tối đa 10 hình ảnh',
        'Thời gian hiển thị: 30 ngày',
        'Hỗ trợ ưu tiên',
      ],
      color: 'yellow',
      popular: true,
    },
    {
      id: 'premium',
      name: 'Tin Premium',
      price: { monthly: 100000, yearly: 1000000 },
      duration: '45 ngày',
      features: [
        'Hiển thị nổi bật nhất',
        'Khung viền Premium màu đỏ',
        'Nhãn "PREMIUM" đặc biệt',
        'Không giới hạn hình ảnh',
        'Ghim tin 7 ngày đầu',
        'Thời gian hiển thị: 45 ngày',
        'Hỗ trợ 24/7',
      ],
      color: 'red',
      popular: false,
    },
  ];

  const membershipPlans = [
    {
      id: 'basic_member',
      name: 'Thành viên Cơ bản',
      price: { monthly: 99000, yearly: 990000 },
      features: [
        'Đăng 20 tin/tháng',
        'Giảm 20% phí tin VIP',
        'Duyệt tin nhanh hơn 50%',
        'Thống kê cơ bản',
        'Hỗ trợ email',
      ],
      color: 'blue',
      popular: false,
    },
    {
      id: 'pro_member',
      name: 'Thành viên Pro',
      price: { monthly: 199000, yearly: 1990000 },
      features: [
        'Đăng không giới hạn tin',
        'Giảm 40% phí tin VIP/Premium',
        'Duyệt tin ưu tiên',
        'Thống kê chi tiết',
        'Hỗ trợ điện thoại',
        'Quản lý tin đăng nâng cao',
      ],
      color: 'green',
      popular: true,
    },
    {
      id: 'business_member',
      name: 'Thành viên Doanh nghiệp',
      price: { monthly: 399000, yearly: 3990000 },
      features: [
        'Tất cả tính năng Pro',
        'Trang cửa hàng riêng',
        'Tin được ghim tự động',
        'API tích hợp',
        'Quản lý đa tài khoản',
        'Hỗ trợ chuyên biệt',
        'Báo cáo doanh số',
      ],
      color: 'purple',
      popular: false,
    },
  ];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  const getDiscountPercent = (monthly: number, yearly: number) => {
    if (monthly === 0) return 0;
    return Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100);
  };

  const handleSelectPlan = (planId: string) => {
    router.push(`/payment?package=${planId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Hero */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-green-100 rounded-full opacity-50 -z-10"></div>
          <div className="absolute top-10 right-1/3 w-24 h-24 bg-blue-100 rounded-full opacity-50 -z-10"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="ri-price-tag-3-line text-4xl text-white"></i>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Bảng giá dịch vụ</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Chọn gói dịch vụ phù hợp để tăng hiệu quả hiển thị tin đăng và quảng cáo
            </p>
          </div>
        </div>

        {/* Quick links to pages */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { href: '/products/create', icon: 'ri-plant-line', label: 'Đăng sản phẩm', color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
            { href: '/jobs/create', icon: 'ri-briefcase-line', label: 'Đăng tuyển dụng', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' },
            { href: '/real-estate/create', icon: 'ri-home-4-line', label: 'Đăng BĐS', color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
            { href: '/forum/create', icon: 'ri-discuss-line', label: 'Đăng bài diễn đàn', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
          ].map(link => (
            <Link key={link.href} href={link.href}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all font-medium text-sm text-center ${link.color}`}>
              <i className={`${link.icon} text-2xl`}></i>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-16">
          <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-200">
            <button onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${billingCycle === 'monthly' ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg' : 'text-gray-600 hover:text-gray-900'}`}>
              Thanh toán hàng tháng
            </button>
            <button onClick={() => setBillingCycle('yearly')}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${billingCycle === 'yearly' ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg' : 'text-gray-600 hover:text-gray-900'}`}>
              Thanh toán hàng năm
              <span className="ml-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Tiết kiệm đến 20%</span>
            </button>
          </div>
        </div>

        {/* Advertisement Packages */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="ri-megaphone-line text-3xl text-white"></i>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Gói quảng cáo</h2>
            <p className="text-gray-600 text-lg">Quảng bá doanh nghiệp và sản phẩm hiệu quả</p>
            <Link href="/advertisements/create" className="inline-flex items-center gap-2 mt-4 text-orange-600 hover:text-orange-700 font-medium text-sm">
              <i className="ri-external-link-line"></i>Tạo quảng cáo ngay
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {advertisementPackages.map((pkg) => (
              <div key={pkg.id}
                className={`relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${pkg.popular ? 'ring-4 ring-orange-300 scale-105' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      <i className="ri-star-fill mr-1"></i>Phổ biến nhất
                    </span>
                  </div>
                )}
                <div className="p-8 lg:p-10">
                  <div className="text-center mb-8">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                      pkg.id === 'ad_basic' ? 'bg-gray-100' : pkg.id === 'ad_featured' ? 'bg-gradient-to-r from-orange-100 to-red-100' : 'bg-gradient-to-r from-red-100 to-pink-100'}`}>
                      <i className={`ri-megaphone-line text-2xl ${pkg.id === 'ad_basic' ? 'text-gray-600' : pkg.id === 'ad_featured' ? 'text-orange-600' : 'text-red-600'}`}></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl lg:text-5xl font-bold text-gray-900">
                        {pkg.price[billingCycle] === 0 ? 'Miễn phí' : formatPrice(pkg.price[billingCycle])}
                      </span>
                      {pkg.price[billingCycle] > 0 && <span className="text-gray-600 text-lg">/{pkg.duration}</span>}
                    </div>
                    {billingCycle === 'yearly' && pkg.price.monthly > 0 && (
                      <div className="text-sm text-orange-600 font-medium bg-orange-50 px-3 py-1 rounded-full inline-block">
                        Tiết kiệm {getDiscountPercent(pkg.price.monthly, pkg.price.yearly)}%
                      </div>
                    )}
                  </div>
                  <ul className="space-y-4 mb-10">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          <i className="ri-check-line text-green-600 text-sm"></i>
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {pkg.id === 'ad_basic' ? (
                    <Link href="/advertisements/create"
                      className="block w-full py-4 px-6 rounded-2xl font-bold text-center bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md transition-all">
                      Đăng quảng cáo miễn phí
                    </Link>
                  ) : (
                    <button onClick={() => handleSelectPlan(pkg.id)}
                      className={`w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300 ${
                        pkg.popular ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg' : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 shadow-lg'}`}>
                      Chọn gói này
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Post Packages */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="ri-article-line text-3xl text-white"></i>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Gói đăng tin</h2>
            <p className="text-gray-600 text-lg">Chọn loại tin đăng phù hợp với nhu cầu</p>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {[
                { href: '/products/create', label: 'Sản phẩm', icon: 'ri-plant-line' },
                { href: '/jobs/create', label: 'Tuyển dụng', icon: 'ri-briefcase-line' },
                { href: '/real-estate/create', label: 'Bất động sản', icon: 'ri-home-4-line' },
              ].map(l => (
                <Link key={l.href} href={l.href} className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 font-medium text-sm border border-green-200 rounded-full px-4 py-1.5 hover:bg-green-50 transition-colors">
                  <i className={l.icon}></i>{l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {postPackages.map((pkg) => (
              <div key={pkg.id}
                className={`relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${pkg.popular ? 'ring-4 ring-green-300 scale-105' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      <i className="ri-star-fill mr-1"></i>Phổ biến nhất
                    </span>
                  </div>
                )}
                <div className="p-8 lg:p-10">
                  <div className="text-center mb-8">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                      pkg.id === 'basic' ? 'bg-gray-100' : pkg.id === 'vip' ? 'bg-gradient-to-r from-yellow-100 to-orange-100' : 'bg-gradient-to-r from-red-100 to-pink-100'}`}>
                      <i className={`${pkg.id === 'vip' ? 'ri-vip-crown-fill' : 'ri-article-line'} text-2xl ${
                        pkg.id === 'basic' ? 'text-gray-600' : pkg.id === 'vip' ? 'text-yellow-600' : 'text-red-600'}`}></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl lg:text-5xl font-bold text-gray-900">
                        {pkg.price[billingCycle] === 0 ? 'Miễn phí' : formatPrice(pkg.price[billingCycle])}
                      </span>
                      {pkg.price[billingCycle] > 0 && <span className="text-gray-600 text-lg">/{pkg.duration}</span>}
                    </div>
                    {billingCycle === 'yearly' && pkg.price.monthly > 0 && (
                      <div className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full inline-block">
                        Tiết kiệm {getDiscountPercent(pkg.price.monthly, pkg.price.yearly)}%
                      </div>
                    )}
                  </div>
                  <ul className="space-y-4 mb-10">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          <i className="ri-check-line text-green-600 text-sm"></i>
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {pkg.id === 'basic' ? (
                    <Link href="/products/create"
                      className="block w-full py-4 px-6 rounded-2xl font-bold text-center bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md transition-all">
                      Đăng tin miễn phí
                    </Link>
                  ) : (
                    <button onClick={() => handleSelectPlan(pkg.id)}
                      className={`w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300 ${
                        pkg.popular ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500 shadow-lg' : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg'}`}>
                      Chọn gói này
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Membership Plans */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="ri-vip-crown-2-line text-3xl text-white"></i>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Gói thành viên</h2>
            <p className="text-gray-600 text-lg">Trở thành thành viên để nhận nhiều ưu đãi hấp dẫn</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {membershipPlans.map((plan) => (
              <div key={plan.id}
                className={`relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${plan.popular ? 'ring-4 ring-green-300 scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      <i className="ri-star-fill mr-1"></i>Được chọn nhiều nhất
                    </span>
                  </div>
                )}
                <div className="p-8 lg:p-10">
                  <div className="text-center mb-8">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                      plan.id === 'basic_member' ? 'bg-gradient-to-r from-blue-100 to-indigo-100' :
                      plan.id === 'pro_member' ? 'bg-gradient-to-r from-green-100 to-emerald-100' :
                      'bg-gradient-to-r from-purple-100 to-indigo-100'}`}>
                      <i className={`ri-vip-crown-2-line text-2xl ${
                        plan.id === 'basic_member' ? 'text-blue-600' : plan.id === 'pro_member' ? 'text-green-600' : 'text-purple-600'}`}></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl lg:text-5xl font-bold text-gray-900">{formatPrice(plan.price[billingCycle])}</span>
                      <span className="text-gray-600 text-lg">/{billingCycle === 'monthly' ? 'tháng' : 'năm'}</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <div className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full inline-block">
                        Tiết kiệm {getDiscountPercent(plan.price.monthly, plan.price.yearly)}%
                      </div>
                    )}
                  </div>
                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          <i className="ri-check-line text-green-600 text-sm"></i>
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300 ${
                      plan.popular ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg' : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg'}`}>
                    Đăng ký ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="ri-table-line text-3xl text-white"></i>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">So sánh các gói đăng tin</h2>
            <p className="text-gray-600 text-lg">Bảng so sánh chi tiết các tính năng</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-8 py-6 text-left text-sm font-bold text-gray-900">Tính năng</th>
                    <th className="px-8 py-6 text-center text-sm font-bold text-gray-900">Tin thường</th>
                    <th className="px-8 py-6 text-center text-sm font-bold text-yellow-700 bg-yellow-50">⭐ Tin VIP</th>
                    <th className="px-8 py-6 text-center text-sm font-bold text-red-700">🏆 Tin Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { label: 'Thời gian hiển thị', values: ['30 ngày', '30 ngày', '45 ngày'] },
                    { label: 'Số lượng hình ảnh', values: ['5 ảnh', '10 ảnh', 'Không giới hạn'] },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 text-sm font-medium text-gray-900">{row.label}</td>
                      {row.values.map((v, j) => (
                        <td key={j} className={`px-8 py-6 text-center text-sm text-gray-600 ${j === 1 ? 'bg-yellow-50/30' : ''}`}>{v}</td>
                      ))}
                    </tr>
                  ))}
                  {[
                    { label: 'Ưu tiên hiển thị', values: [false, true, true] },
                    { label: 'Khung viền nổi bật', values: [false, true, true] },
                    { label: 'Ghim tin đầu trang', values: [false, false, '7 ngày'] },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 text-sm font-medium text-gray-900">{row.label}</td>
                      {row.values.map((v, j) => (
                        <td key={j} className={`px-8 py-6 text-center ${j === 1 ? 'bg-yellow-50/30' : ''}`}>
                          {typeof v === 'boolean' ? (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${v ? 'bg-green-100' : 'bg-red-100'}`}>
                              <i className={`${v ? 'ri-check-line text-green-500' : 'ri-close-line text-red-500'}`}></i>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-600">{v}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="ri-question-line text-3xl text-white"></i>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Câu hỏi thường gặp</h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                question: 'Làm thế nào để nâng cấp tin thường thành tin VIP?',
                answer: 'Bạn có thể nâng cấp tin đăng bất kỳ lúc nào trong phần quản lý tin đăng. Chỉ cần chọn tin muốn nâng cấp và thanh toán phí VIP.',
              },
              {
                question: 'Tôi có thể hủy gói thành viên không?',
                answer: 'Có, bạn có thể hủy gói thành viên bất kỳ lúc nào. Tuy nhiên, chúng tôi không hoàn lại phí đã thanh toán cho thời gian còn lại.',
              },
              {
                question: 'Thời gian duyệt tin VIP là bao lâu?',
                answer: 'Tin VIP được ưu tiên duyệt trong vòng 2-4 giờ làm việc. Tin Premium được duyệt trong vòng 1-2 giờ.',
              },
              {
                question: 'Tôi có thể đăng tin ở những chuyên mục nào?',
                answer: 'Chợ Nhân Cơ hỗ trợ đăng tin ở 4 chuyên mục: Sản phẩm nông sản, Tuyển dụng việc làm, Bất động sản, và Diễn đàn cộng đồng.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-3xl p-16 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
              <i className="ri-rocket-line text-4xl text-white"></i>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Sẵn sàng bắt đầu?</h2>
            <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed">
              Đăng tin ngay hôm nay và tiếp cận hàng nghìn người mua trong khu vực
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
              <Link href="/products/create"
                className="bg-white text-green-600 px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2">
                <i className="ri-plant-line"></i>Đăng sản phẩm
              </Link>
              <Link href="/jobs/create"
                className="bg-white/20 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/30 transition-all backdrop-blur-sm flex items-center justify-center gap-2">
                <i className="ri-briefcase-line"></i>Đăng tuyển dụng
              </Link>
              <Link href="/real-estate/create"
                className="bg-white/20 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/30 transition-all backdrop-blur-sm flex items-center justify-center gap-2">
                <i className="ri-home-4-line"></i>Đăng BĐS
              </Link>
              <Link href="/forum/create"
                className="bg-white/20 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/30 transition-all backdrop-blur-sm flex items-center justify-center gap-2">
                <i className="ri-discuss-line"></i>Đăng diễn đàn
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
