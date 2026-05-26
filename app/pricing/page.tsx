'use client';

import Link from 'next/link';

const PLANS = [
  {
    id: 'free',
    name: 'Miễn phí',
    price: 0,
    priceLabel: '0đ',
    period: 'mãi mãi',
    badge: null,
    highlight: false,
    features: [
      '1 tin đăng mỗi tháng',
      'Hiển thị 30 ngày/tin',
      'Tối đa 3 ảnh/tin',
      'Danh sách thường',
      'Không có nhãn nổi bật',
    ],
    cta: 'Đang sử dụng',
    ctaHref: '/products/create',
    ctaStyle: 'border border-gray-300 text-gray-600 bg-white',
    disabled: true,
  },
  {
    id: 'vip-7',
    name: 'VIP 7 ngày',
    price: 50000,
    priceLabel: '50.000đ',
    period: '/ 7 ngày',
    badge: null,
    highlight: false,
    features: [
      'Hiển thị đầu trang 7 ngày',
      'Nhãn VIP vàng nổi bật',
      'Ảnh không giới hạn',
      'Ưu tiên tìm kiếm',
      'Tăng 3x lượt xem',
    ],
    cta: 'Mua ngay',
    ctaHref: '/products/vip',
    ctaStyle: 'bg-gray-900 text-white hover:bg-gray-700',
    disabled: false,
  },
  {
    id: 'vip-30',
    name: 'VIP 30 ngày',
    price: 150000,
    priceLabel: '150.000đ',
    period: '/ 30 ngày',
    badge: 'Phổ biến nhất',
    highlight: true,
    features: [
      'Hiển thị đầu trang 30 ngày',
      'Nhãn VIP vàng nổi bật',
      'Ảnh không giới hạn',
      'Ưu tiên tìm kiếm cao nhất',
      'Tăng 5x lượt xem',
    ],
    cta: 'Mua ngay',
    ctaHref: '/products/vip',
    ctaStyle: 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 font-bold',
    disabled: false,
  },
  {
    id: 'vip-90',
    name: 'VIP 90 ngày',
    price: 350000,
    priceLabel: '350.000đ',
    period: '/ 90 ngày',
    badge: 'Tiết kiệm 22%',
    highlight: false,
    features: [
      'Hiển thị đầu trang 90 ngày',
      'Nhãn VIP vàng nổi bật',
      'Ảnh không giới hạn',
      'Ưu tiên tìm kiếm cao nhất',
      'Tăng 5x lượt xem',
    ],
    cta: 'Mua ngay',
    ctaHref: '/products/vip',
    ctaStyle: 'bg-gray-900 text-white hover:bg-gray-700',
    disabled: false,
  },
];

const COMPARE_ROWS = [
  { label: 'Số tin/tháng',      free: '1 tin',       vip7: 'Không giới hạn', vip30: 'Không giới hạn', vip90: 'Không giới hạn' },
  { label: 'Thời gian hiển thị',free: '30 ngày',     vip7: '7 ngày VIP',     vip30: '30 ngày VIP',    vip90: '90 ngày VIP' },
  { label: 'Số ảnh/tin',         free: 'Tối đa 3',   vip7: 'Không giới hạn', vip30: 'Không giới hạn', vip90: 'Không giới hạn' },
  { label: 'Nhãn VIP vàng',      free: 'Không',      vip7: 'Có',             vip30: 'Có',             vip90: 'Có' },
  { label: 'Vị trí hiển thị',    free: 'Danh sách thường', vip7: 'Đầu trang', vip30: 'Đầu trang',    vip90: 'Đầu trang' },
  { label: 'Lượt xem ước tính',  free: '× 1',        vip7: '× 3',            vip30: '× 5',            vip90: '× 5' },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f4ee' }}>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-10 text-center">
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">Bảng giá</p>
          <h1 className="text-2xl font-black text-gray-900 mb-2" style={{ letterSpacing: '-0.5px' }}>
            Đăng tin hiệu quả hơn với VIP
          </h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Tài khoản miễn phí được đăng 1 tin mỗi tháng. Nâng lên VIP để hiển thị nổi bật và thu hút nhiều người mua hơn.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {PLANS.map(plan => (
            <div key={plan.id}
              className={`rounded-2xl bg-white overflow-hidden flex flex-col ${
                plan.highlight
                  ? 'ring-2 ring-yellow-400 shadow-lg'
                  : 'border border-gray-200'
              }`}>

              {/* Top badge */}
              {plan.badge ? (
                <div className={`text-center py-2 text-xs font-bold ${
                  plan.highlight ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-900 text-white'
                }`}>
                  {plan.badge}
                </div>
              ) : (
                <div className="py-2" />
              )}

              <div className="px-5 pt-4 pb-5 flex flex-col flex-1">
                {/* Name */}
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">{plan.name}</p>

                {/* Price */}
                <div className="mb-5">
                  <span className={`text-3xl font-black ${plan.highlight ? 'text-yellow-600' : 'text-gray-900'}`}>
                    {plan.priceLabel}
                  </span>
                  <span className="text-sm text-gray-400 ml-1">{plan.period}</span>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        plan.highlight ? 'bg-yellow-400' : plan.disabled ? 'bg-gray-300' : 'bg-gray-800'
                      }`}></span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href={plan.ctaHref}
                  className={`block w-full text-center py-2.5 rounded-xl text-sm transition-all ${plan.ctaStyle} ${
                    plan.disabled ? 'pointer-events-none opacity-60' : ''
                  }`}>
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">So sánh chi tiết</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-gray-500 font-semibold w-1/4">Tính năng</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-semibold">Miễn phí</th>
                  <th className="text-center px-4 py-3 text-gray-700 font-bold">VIP 7 ngày</th>
                  <th className="text-center px-4 py-3 text-yellow-600 font-bold bg-yellow-50">VIP 30 ngày</th>
                  <th className="text-center px-4 py-3 text-gray-700 font-bold">VIP 90 ngày</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) => (
                  <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-3 text-gray-600 font-medium">{row.label}</td>
                    <td className="px-4 py-3 text-center text-gray-400">{row.free}</td>
                    <td className="px-4 py-3 text-center text-gray-700 font-medium">{row.vip7}</td>
                    <td className="px-4 py-3 text-center text-yellow-700 font-semibold bg-yellow-50/50">{row.vip30}</td>
                    <td className="px-4 py-3 text-center text-gray-700 font-medium">{row.vip90}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/wallet"
            className="block bg-white rounded-2xl border border-gray-200 px-6 py-5 hover:border-yellow-400 transition-colors">
            <p className="font-bold text-gray-900 mb-0.5">Nạp tiền vào ví</p>
            <p className="text-sm text-gray-400">Thanh toán qua PayOS · Tự động xác nhận</p>
          </Link>
          <Link href="/dashboard"
            className="block bg-white rounded-2xl border border-gray-200 px-6 py-5 hover:border-gray-400 transition-colors">
            <p className="font-bold text-gray-900 mb-0.5">Quản lý sản phẩm</p>
            <p className="text-sm text-gray-400">Chọn sản phẩm cần nâng VIP từ dashboard</p>
          </Link>
        </div>

      </div>
    </div>
  );
}
