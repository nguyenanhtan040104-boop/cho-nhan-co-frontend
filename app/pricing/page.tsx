'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const router = useRouter();

  const membershipPlans = [
    {
      id: 'basic_member',
      name: 'Thành viên Cơ bản',
      price: { monthly: 99000, yearly: 990000 },
      color: 'blue',
      popular: false,
      features: [
        'Đăng 20 tin/tháng',
        'Giảm 20% phí tin VIP',
        'Duyệt tin nhanh hơn 50%',
        'Thống kê cơ bản',
        'Hỗ trợ email',
      ],
    },
    {
      id: 'pro_member',
      name: 'Thành viên Pro',
      price: { monthly: 199000, yearly: 1990000 },
      color: 'green',
      popular: true,
      features: [
        'Đăng không giới hạn tin',
        'Giảm 40% phí tin VIP',
        'Duyệt tin ưu tiên',
        'Thống kê chi tiết',
        'Hỗ trợ điện thoại',
        'Quản lý tin đăng nâng cao',
      ],
    },
    {
      id: 'business_member',
      name: 'Thành viên Doanh nghiệp',
      price: { monthly: 399000, yearly: 3990000 },
      color: 'purple',
      popular: false,
      features: [
        'Tất cả tính năng Pro',
        'Trang cửa hàng riêng',
        'Tin được ghim tự động',
        'API tích hợp',
        'Quản lý đa tài khoản',
        'Hỗ trợ chuyên biệt',
        'Báo cáo doanh số',
      ],
    },
  ];

  const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
  const discount = (m: number, y: number) => Math.round(((m * 12 - y) / (m * 12)) * 100);

  const colorMap: Record<string, { ring: string; badge: string; btn: string; icon: string }> = {
    blue:   { ring: 'ring-blue-300',   badge: 'from-blue-500 to-indigo-500',   btn: 'from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600',   icon: 'text-blue-600 bg-blue-100' },
    green:  { ring: 'ring-green-300',  badge: 'from-green-500 to-emerald-500', btn: 'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600', icon: 'text-green-600 bg-green-100' },
    purple: { ring: 'ring-purple-300', badge: 'from-purple-500 to-indigo-500', btn: 'from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600', icon: 'text-purple-600 bg-purple-100' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="ri-vip-crown-2-line text-4xl text-white"></i>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Gói thành viên</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Nâng cấp tài khoản để đăng tin không giới hạn và nhận nhiều ưu đãi hấp dẫn
          </p>
        </div>

        {/* VIP info banner */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="ri-vip-crown-fill text-yellow-600 text-2xl"></i>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="font-semibold text-yellow-800">Muốn nâng tin lên VIP?</p>
            <p className="text-sm text-yellow-700 mt-0.5">Nạp tiền vào ví và mua VIP cho từng tin đăng riêng lẻ — Sản phẩm & Tuyển dụng: 50,000đ · BĐS: 100,000đ / 30 ngày</p>
          </div>
          <Link href="/wallet" className="flex-shrink-0 bg-yellow-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-yellow-600 transition text-sm whitespace-nowrap">
            Đến trang ví →
          </Link>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1.5 rounded-2xl shadow-md border border-gray-200 flex">
            <button onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}>
              Hàng tháng
            </button>
            <button onClick={() => setBillingCycle('yearly')}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${billingCycle === 'yearly' ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}>
              Hàng năm
              <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">-17%</span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {membershipPlans.map(plan => {
            const c = colorMap[plan.color];
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
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${c.icon}`}>
                      <i className="ri-vip-crown-2-line text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{plan.name}</h3>
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-gray-900">{fmt(plan.price[billingCycle])}</span>
                      <span className="text-gray-500 text-base">/{billingCycle === 'monthly' ? 'tháng' : 'năm'}</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full font-medium">
                        Tiết kiệm {discount(plan.price.monthly, plan.price.yearly)}% so với tháng
                      </span>
                    )}
                    {billingCycle === 'monthly' && (
                      <p className="text-xs text-gray-400 mt-1">≈ {fmt(Math.round(plan.price.monthly / 30))}/ngày</p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <i className="ri-check-line text-green-600 text-xs"></i>
                        </div>
                        <span className="text-gray-700 text-sm">{f}</span>
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

        {/* Compare table */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-16">
          <div className="text-center py-8 border-b">
            <h2 className="text-2xl font-bold text-gray-900">So sánh các gói</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">Tính năng</th>
                  <th className="px-6 py-4 text-center text-blue-700 font-semibold">Cơ bản</th>
                  <th className="px-6 py-4 text-center text-green-700 font-semibold bg-green-50">Pro</th>
                  <th className="px-6 py-4 text-center text-purple-700 font-semibold">Doanh nghiệp</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { label: 'Số tin/tháng',          values: ['20 tin', 'Không giới hạn', 'Không giới hạn'] },
                  { label: 'Giảm phí VIP',           values: ['20%', '40%', '40%'] },
                  { label: 'Ưu tiên duyệt tin',      values: [false, true, true] },
                  { label: 'Thống kê chi tiết',       values: [false, true, true] },
                  { label: 'Trang cửa hàng riêng',   values: [false, false, true] },
                  { label: 'Ghim tin tự động',        values: [false, false, true] },
                  { label: 'API tích hợp',            values: [false, false, true] },
                  { label: 'Hỗ trợ',                  values: ['Email', 'Điện thoại', 'Chuyên biệt'] },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{row.label}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className={`px-6 py-4 text-center ${j === 1 ? 'bg-green-50/40' : ''}`}>
                        {typeof v === 'boolean' ? (
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto ${v ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <i className={v ? 'ri-check-line text-green-600' : 'ri-close-line text-gray-400'}></i>
                          </div>
                        ) : (
                          <span className="text-gray-700">{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Câu hỏi thường gặp</h2>
          <div className="space-y-4">
            {[
              { q: 'Gói thành viên có ảnh hưởng đến tin VIP không?', a: 'Có. Thành viên Cơ bản giảm 20% phí VIP, Pro và Doanh nghiệp giảm 40%. Bạn vẫn mua VIP qua ví, nhưng sẽ được khấu trừ theo gói.' },
              { q: 'Tôi có thể hủy gói thành viên không?', a: 'Có thể hủy bất kỳ lúc nào. Tuy nhiên phí đã thanh toán sẽ không được hoàn lại cho thời gian còn lại.' },
              { q: 'Thanh toán hàng năm có lợi gì?', a: 'Tiết kiệm khoảng 17% so với trả hàng tháng. Ví dụ gói Pro: trả tháng 199,000đ × 12 = 2,388,000đ, trả năm chỉ 1,990,000đ.' },
              { q: 'VIP tin đăng khác gói thành viên như thế nào?', a: 'Gói thành viên là đặc quyền tài khoản (đăng nhiều hơn, ưu tiên duyệt). VIP là nâng cấp từng tin đăng cụ thể để hiển thị nổi bật — mua riêng qua ví.' },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
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
