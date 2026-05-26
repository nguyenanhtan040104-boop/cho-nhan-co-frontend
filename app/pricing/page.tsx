'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ─── Categories with per-category pricing ─────────────────────────────
const CATEGORIES = [
  {
    id: 'nong-san',
    name: 'Nông sản',
    desc: 'Lúa, gạo, rau, củ, trái cây',
    icon: 'ri-leaf-line',
    color: 'emerald',
    prices: { vip7: 30000, vip30: 79000 },
  },
  {
    id: 'vat-nuoi',
    name: 'Vật nuôi',
    desc: 'Trâu, bò, gà, vịt, heo',
    icon: 'ri-heart-pulse-line',
    color: 'orange',
    prices: { vip7: 35000, vip30: 89000 },
  },
  {
    id: 'cay-giong',
    name: 'Cây giống',
    desc: 'Hạt giống, cây con, cây ăn trái',
    icon: 'ri-plant-line',
    color: 'lime',
    prices: { vip7: 30000, vip30: 75000 },
  },
  {
    id: 'may-nong-nghiep',
    name: 'Máy nông nghiệp',
    desc: 'Máy cày, máy xới, máy bơm',
    icon: 'ri-tools-fill',
    color: 'slate',
    prices: { vip7: 50000, vip30: 129000 },
  },
  {
    id: 'dat-vuon',
    name: 'Đất - Vườn',
    desc: 'Ruộng, rẫy, vườn cây',
    icon: 'ri-landscape-line',
    color: 'amber',
    prices: { vip7: 70000, vip30: 199000 },
  },
  {
    id: 'viec-lam',
    name: 'Việc làm',
    desc: 'Thời vụ, mùa gặt, mùa hái',
    icon: 'ri-briefcase-line',
    color: 'blue',
    prices: { vip7: 30000, vip30: 79000 },
  },
  {
    id: 'do-cu',
    name: 'Đồ dùng cũ',
    desc: 'Thanh lý, hàng đã qua sử dụng',
    icon: 'ri-shopping-bag-line',
    color: 'purple',
    prices: { vip7: 30000, vip30: 69000 },
  },
  {
    id: 'dien-dan',
    name: 'Bài diễn đàn',
    desc: 'Hỏi đáp, kinh nghiệm canh tác',
    icon: 'ri-chat-3-line',
    color: 'teal',
    prices: { vip7: 30000, vip30: 69000 },
  },
];

// Tailwind needs full class strings to scan — explicit color map
const COLOR_MAP: Record<string, { bg: string; bgSoft: string; text: string; textDark: string; border: string; ring: string }> = {
  emerald: { bg: 'bg-emerald-500', bgSoft: 'bg-emerald-50',  text: 'text-emerald-600', textDark: 'text-emerald-800', border: 'border-emerald-200', ring: 'ring-emerald-400' },
  orange:  { bg: 'bg-orange-500',  bgSoft: 'bg-orange-50',   text: 'text-orange-600',  textDark: 'text-orange-800',  border: 'border-orange-200',  ring: 'ring-orange-400' },
  lime:    { bg: 'bg-lime-500',    bgSoft: 'bg-lime-50',     text: 'text-lime-600',    textDark: 'text-lime-800',    border: 'border-lime-200',    ring: 'ring-lime-400' },
  slate:   { bg: 'bg-slate-600',   bgSoft: 'bg-slate-50',    text: 'text-slate-600',   textDark: 'text-slate-800',   border: 'border-slate-200',   ring: 'ring-slate-400' },
  amber:   { bg: 'bg-amber-500',   bgSoft: 'bg-amber-50',    text: 'text-amber-600',   textDark: 'text-amber-800',   border: 'border-amber-200',   ring: 'ring-amber-400' },
  blue:    { bg: 'bg-blue-500',    bgSoft: 'bg-blue-50',     text: 'text-blue-600',    textDark: 'text-blue-800',    border: 'border-blue-200',    ring: 'ring-blue-400' },
  purple:  { bg: 'bg-purple-500',  bgSoft: 'bg-purple-50',   text: 'text-purple-600',  textDark: 'text-purple-800',  border: 'border-purple-200',  ring: 'ring-purple-400' },
  teal:    { bg: 'bg-teal-500',    bgSoft: 'bg-teal-50',     text: 'text-teal-600',    textDark: 'text-teal-800',    border: 'border-teal-200',    ring: 'ring-teal-400' },
};

function formatMoney(n: number) {
  if (n === 0) return 'Miễn phí';
  return n.toLocaleString('vi-VN') + 'đ';
}

export default function PricingPage() {
  const [selectedId, setSelectedId] = useState<string>('nong-san');
  const plansRef = useRef<HTMLDivElement | null>(null);

  const selected = CATEGORIES.find(c => c.id === selectedId)!;
  const c = COLOR_MAP[selected.color];

  function pickCategory(id: string) {
    setSelectedId(id);
    setTimeout(() => plansRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f7f3' }}>

      {/* ─── Header ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase mb-2">
              <span className="inline-block w-6 h-px bg-emerald-700 align-middle mr-2"></span>
              Nâng cấp bài đăng
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2" style={{ letterSpacing: '-0.5px' }}>
              Đẩy bài lên top, bán nhanh hơn
            </h1>
            <p className="text-gray-500 text-sm max-w-xl">
              Phù hợp với bà con nông thôn — giá rẻ, dễ mua, không ràng buộc.
              Chọn danh mục bạn muốn nâng cấp bên dưới.
            </p>
          </div>

          {/* Current plan strip */}
          <div className="mt-6 border-t border-gray-100 pt-4 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[11px] text-gray-400">Bạn đang dùng</p>
              <p className="font-bold text-gray-900 text-sm">Gói Miễn phí · 3 tin / tháng</p>
            </div>
            <Link href="/dashboard" className="text-xs font-semibold text-gray-700 hover:text-gray-900 hover:underline underline-offset-4 transition-all">
              Quản lý bài đăng
              <i className="ri-arrow-right-line ml-1"></i>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ─── Category grid ──────────────────────────────────────── */}
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">Chọn danh mục</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
          {CATEGORIES.map(cat => {
            const col = COLOR_MAP[cat.color];
            const isActive = cat.id === selectedId;
            const minPrice = cat.prices.vip7 || cat.prices.vip30;
            return (
              <button
                key={cat.id}
                onClick={() => pickCategory(cat.id)}
                className={`group relative text-left bg-white rounded-2xl pl-5 pr-4 py-4 transition-all overflow-hidden ${
                  isActive
                    ? 'shadow-md ring-1 ring-gray-900'
                    : 'border border-gray-200 hover:border-gray-400 hover:-translate-y-0.5'
                }`}
              >
                {/* Left accent stripe — replaces the icon box */}
                <span className={`absolute left-0 top-0 bottom-0 w-1 ${col.bg}`} />

                {/* Subtle large icon as watermark in corner */}
                <i className={`${cat.icon} absolute -bottom-2 -right-2 text-6xl ${col.text} opacity-[0.08] pointer-events-none`} />

                <p className="font-black text-gray-900 text-base mb-1 leading-tight">{cat.name}</p>
                <p className="text-[11px] text-gray-400 mb-4 leading-tight">{cat.desc}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Từ <span className={`font-black ${col.text}`}>{formatMoney(minPrice)}</span>
                  </p>
                  <i className="ri-arrow-right-line text-gray-300 group-hover:text-gray-900 group-hover:translate-x-0.5 transition-all"></i>
                </div>
              </button>
            );
          })}
        </div>

        {/* ─── Plans for selected category ────────────────────────── */}
        <div ref={plansRef} className="scroll-mt-4">
          <div className="flex items-end gap-3 mb-5 pb-3 border-b border-gray-200">
            <span className={`block w-1.5 h-10 ${c.bg} rounded-full`} />
            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Gói cho danh mục</p>
              <h2 className="text-xl font-black text-gray-900 leading-tight">{selected.name}</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {/* Free */}
            <PlanCard
              title="Miễn phí"
              price="0đ"
              period="mãi mãi"
              features={[
                '3 tin / tháng',
                'Hiển thị 30 ngày',
                'Tối đa 5 ảnh / tin',
                'Danh sách thường',
              ]}
              cta="Đang sử dụng"
              ctaHref="/dashboard"
              disabled
            />

            {/* 7 days */}
            <PlanCard
              title="Gói 7 ngày"
              price={formatMoney(selected.prices.vip7)}
              period="/ 7 ngày"
              features={[
                'Đẩy lên đầu danh sách',
                'Hiển thị 7 ngày VIP',
                'Ảnh không giới hạn',
                'Có nhãn nổi bật',
              ]}
              cta="Mua ngay"
              ctaHref={`/dashboard?upgrade=${selected.id}&plan=vip-7`}
              color={selected.color}
            />

            {/* 30 days - highlighted */}
            <PlanCard
              title="Gói 30 ngày"
              price={formatMoney(selected.prices.vip30)}
              period="/ 30 ngày"
              features={[
                'Đẩy lên đầu danh sách',
                'Hiển thị 30 ngày VIP',
                'Ảnh không giới hạn',
                'Có nhãn nổi bật',
                'Ưu tiên hiển thị cao nhất',
              ]}
              cta="Mua ngay"
              ctaHref={`/dashboard?upgrade=${selected.id}&plan=vip-30`}
              color={selected.color}
              highlight
              badge="Tiết kiệm hơn"
            />
          </div>
        </div>

        {/* ─── Bottom actions ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/wallet"
            className="group bg-white rounded-2xl border border-gray-200 px-5 py-4 hover:border-gray-900 transition-all flex items-center justify-between gap-3"
          >
            <div>
              <p className="font-bold text-gray-900 text-sm">Nạp tiền vào ví</p>
              <p className="text-xs text-gray-400 mt-0.5">Thanh toán qua PayOS · Tự động xác nhận</p>
            </div>
            <i className="ri-arrow-right-line text-gray-300 group-hover:text-gray-900 group-hover:translate-x-0.5 transition-all"></i>
          </Link>
          <Link
            href="/dashboard"
            className="group bg-white rounded-2xl border border-gray-200 px-5 py-4 hover:border-gray-900 transition-all flex items-center justify-between gap-3"
          >
            <div>
              <p className="font-bold text-gray-900 text-sm">Quản lý bài đăng</p>
              <p className="text-xs text-gray-400 mt-0.5">Chọn bài cần nâng cấp từ dashboard</p>
            </div>
            <i className="ri-arrow-right-line text-gray-300 group-hover:text-gray-900 group-hover:translate-x-0.5 transition-all"></i>
          </Link>
        </div>

        {/* ─── FAQ ───────────────────────────────────────────────── */}
        <div className="mt-10 bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Câu hỏi thường gặp</p>
          </div>
          <FaqItem
            q="Mua gói rồi hết hạn có sao không?"
            a="Bài đăng vẫn hiển thị bình thường trong danh sách thường, chỉ mất nhãn nổi bật và không còn được đẩy lên đầu nữa."
          />
          <FaqItem
            q="Tôi có thể mua nhiều gói cho cùng một bài đăng không?"
            a="Được. Mỗi lần mua sẽ cộng dồn thời gian VIP. Ví dụ: bài đang VIP còn 3 ngày, mua thêm gói 7 ngày sẽ thành 10 ngày."
          />
          <FaqItem
            q="Tại sao giá khác nhau giữa các danh mục?"
            a="Các danh mục như Đất - Vườn hoặc Máy nông nghiệp có giá trị cao và ít người mua hơn, nên giá VIP cao hơn để bù lại thời gian tìm khách. Việc làm và Đồ dùng cũ có giá thấp hơn vì người mua chủ yếu trong vùng."
          />
          <FaqItem
            q="Tôi có được hoàn tiền nếu bán được sớm không?"
            a="Hiện chưa hỗ trợ hoàn tiền. Nhưng bạn có thể dùng phần thời gian còn lại để đẩy bài đăng khác cùng danh mục."
          />
        </div>

      </div>
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────

function PlanCard({
  title, price, period, features, cta, ctaHref, color, highlight, badge, disabled,
}: {
  title: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  ctaHref: string;
  color?: string;
  highlight?: boolean;
  badge?: string;
  disabled?: boolean;
}) {
  const c = color ? COLOR_MAP[color] : null;

  return (
    <div className={`rounded-2xl bg-white overflow-hidden flex flex-col ${
      highlight && c ? `ring-2 ${c.ring} shadow-lg` : 'border border-gray-200'
    }`}>
      {/* badge slot */}
      {badge ? (
        <div className={`text-center py-2 text-xs font-bold ${
          highlight && c ? `${c.bg} text-white` : 'bg-gray-900 text-white'
        }`}>
          {badge}
        </div>
      ) : (
        <div className="py-2" />
      )}

      <div className="px-5 pt-3 pb-5 flex flex-col flex-1">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">{title}</p>
        <div className="mb-5">
          <span className={`text-3xl font-black ${highlight && c ? c.textDark : 'text-gray-900'}`}>{price}</span>
          <span className="text-sm text-gray-400 ml-1">{period}</span>
        </div>

        <ul className="space-y-2.5 mb-6 flex-1">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <i className={`ri-check-line mt-0.5 flex-shrink-0 ${
                disabled ? 'text-gray-300' : highlight && c ? c.text : 'text-gray-700'
              }`}></i>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <Link
          href={ctaHref}
          className={`block w-full text-center py-2.5 rounded-xl text-sm transition-all ${
            disabled
              ? 'border border-gray-200 text-gray-400 bg-white pointer-events-none'
              : highlight && c
                ? `${c.bg} text-white hover:opacity-90 font-bold`
                : 'bg-gray-900 text-white hover:bg-gray-700 font-semibold'
          }`}
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(o => !o)}
      className="w-full text-left px-6 py-4 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-gray-800 text-sm flex-1">{q}</p>
        <i className={`ri-arrow-down-s-line text-gray-400 transition-transform flex-shrink-0 mt-0.5 ${open ? 'rotate-180' : ''}`}></i>
      </div>
      {open && <p className="text-sm text-gray-500 mt-2 leading-relaxed">{a}</p>}
    </button>
  );
}
