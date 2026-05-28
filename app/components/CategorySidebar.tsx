'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { advertisements } from '../../lib/api';

type Props = {
  vipItems?: any[];                  // optional: featured VIP listings from the page
  popularSearches?: string[];
  searchHref?: (q: string) => string;
  postHref: string;
  postLabel: string;
  safetyTips?: string[];
  showAd?: boolean;
  /** Builds an href for a VIP listing thumbnail (depends on category type) */
  itemHref?: (item: any) => string;
};

const DEFAULT_TIPS = [
  'Gặp trực tiếp ở nơi đông người, không chuyển tiền trước',
  'Kiểm tra kỹ hàng hóa trước khi thanh toán',
  'Không chia sẻ OTP / mật khẩu cho bất kỳ ai',
];

const DEFAULT_SEARCHES = [
  'Cà phê', 'Hồ tiêu', 'Sầu riêng', 'Bơ booth', 'Mít', 'Cao su', 'Điều', 'Mắc ca',
];

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

export default function CategorySidebar({
  vipItems = [],
  popularSearches = DEFAULT_SEARCHES,
  searchHref,
  postHref,
  postLabel,
  safetyTips = DEFAULT_TIPS,
  showAd = true,
  itemHref = (item) => `/products/${item.id}`,
}: Props) {
  return (
    <aside className="space-y-3 lg:sticky lg:top-4 self-start text-[13px]">

      {/* ── 1. Tin nổi bật VIP ─────────────────────────────────────── */}
      {vipItems.length > 0 && (
        <Widget title="Tin nổi bật VIP" eyebrow="Được đề xuất">
          <div className="divide-y divide-gray-50">
            {vipItems.slice(0, 4).map((item) => {
              const img = item.images?.[0]?.url || (typeof item.images?.[0] === 'string' ? item.images[0] : null);
              return (
                <Link key={item.id} href={itemHref(item)} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-stone-50 transition-colors">
                  <div className="w-12 h-12 rounded-md bg-stone-100 flex-shrink-0 overflow-hidden border border-stone-200">
                    {img ? (
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="ri-image-line text-stone-300 text-lg"></i>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-medium text-gray-900 line-clamp-1 leading-snug">{item.title}</p>
                    {item.price !== undefined && (
                      <p className="text-[12px] font-semibold text-red-700 mt-0.5">{fmt(Number(item.price))}đ</p>
                    )}
                    <p className="text-[11px] text-gray-400 truncate">{item.location || 'Đắk Nông'}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Widget>
      )}

      {/* ── 2. Quảng cáo địa phương ────────────────────────────────── */}
      {showAd && <SidebarAdSlot />}

      {/* ── 3. Từ khóa phổ biến ────────────────────────────────────── */}
      <Widget title="Từ khóa phổ biến" eyebrow="Bà con đang tìm">
        <div className="px-3 pb-3 pt-1 flex flex-wrap gap-1.5">
          {popularSearches.map((q) => (
            <Link
              key={q}
              href={searchHref ? searchHref(q) : `/products?search=${encodeURIComponent(q)}`}
              className="px-2 py-0.5 text-[12px] text-gray-600 border border-stone-200 rounded hover:border-stone-400 hover:text-gray-900 transition-colors"
            >
              {q}
            </Link>
          ))}
        </div>
      </Widget>

      {/* ── 4. Mẹo mua bán an toàn ─────────────────────────────────── */}
      <Widget title="Mẹo an toàn" eyebrow="Trước khi giao dịch">
        <ul className="px-3 pb-3 pt-1 space-y-1.5">
          {safetyTips.map((tip, i) => (
            <li key={i} className="text-[12px] text-gray-600 leading-relaxed flex gap-1.5">
              <span className="text-gray-400 mt-0.5 flex-shrink-0">{i + 1}.</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/canh-bao"
          className="block px-3 pb-3 text-[12px] font-semibold text-gray-700 hover:text-gray-900 hover:underline underline-offset-4"
        >
          Xem tất cả cảnh báo →
        </Link>
      </Widget>

      {/* ── 5. CTA đăng tin (compact, no gradient) ─────────────────── */}
      <div className="bg-white border border-stone-200 rounded-lg p-4">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">Miễn phí đăng tin</p>
        <p className="text-[13px] text-gray-700 leading-relaxed mb-3">
          Đăng tin bán cà phê, hồ tiêu, đất rẫy, tuyển công nhật... gần nhà bạn tại Nhân Cơ.
        </p>
        <Link
          href={postHref}
          className="block text-center bg-emerald-700 hover:bg-emerald-800 text-white text-[13px] font-semibold py-2 rounded transition-colors"
        >
          {postLabel}
        </Link>
      </div>
    </aside>
  );
}

// ─── Reusable subtle-styled widget shell ─────────────────────────────
function Widget({ title, eyebrow, children }: { title: string; eyebrow?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
      <div className="px-3 pt-3 pb-1.5 border-b border-stone-100">
        {eyebrow && <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">{eyebrow}</p>}
        <h4 className="text-[13px] font-bold text-gray-900 mt-0.5">{title}</h4>
      </div>
      {children}
    </div>
  );
}

// ─── Sponsored ad slot (real ad from /advertisements/featured) ────────
function SidebarAdSlot() {
  const [ad, setAd] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const featured = await advertisements.getFeatured(1).catch(() => ({ data: [] }));
        let top = featured.data?.[0];
        if (!top) {
          const recent = await advertisements.getAll({ limit: 1 }).catch(() => ({ data: [] }));
          top = recent.data?.[0];
        }
        if (!cancelled) setAd(top || null);
      } catch {}
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Fallback compact CTA when no ads exist
  if (!ad) {
    return (
      <Link
        href="/advertisements/create"
        className="block bg-white border border-stone-200 rounded-lg overflow-hidden hover:border-stone-400 transition-colors"
      >
        <div className="px-3 pt-3 pb-1.5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">Quảng cáo</p>
            <h4 className="text-[13px] font-bold text-gray-900 mt-0.5">Cửa hàng của bạn?</h4>
          </div>
          <i className="ri-megaphone-line text-stone-400 text-lg"></i>
        </div>
        <div className="px-3 py-3 text-[12px] text-gray-600 leading-relaxed">
          Đẩy thương hiệu lên đầu trang chủ chỉ từ <b className="text-gray-900">50.000đ / 7 ngày</b>.
          <span className="block mt-2 text-emerald-700 font-semibold">Tìm hiểu →</span>
        </div>
      </Link>
    );
  }

  const image = ad.images?.[0];
  return (
    <Link
      href={`/advertisements/${ad.id}`}
      className="block bg-white border border-stone-200 rounded-lg overflow-hidden hover:border-stone-400 transition-colors"
    >
      <div className="px-3 pt-3 pb-1.5 border-b border-stone-100 flex items-center justify-between">
        <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">Quảng cáo địa phương</p>
        <i className="ri-megaphone-line text-stone-400"></i>
      </div>
      {image && (
        <div className="relative" style={{ aspectRatio: '16/10' }}>
          <img src={image} alt={ad.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="px-3 py-2.5">
        {ad.businessName && (
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5 truncate">{ad.businessName}</p>
        )}
        <p className="text-[13px] font-bold text-gray-900 line-clamp-2 leading-snug">{ad.title}</p>
        {ad.description && (
          <p className="text-[12px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">{ad.description}</p>
        )}
      </div>
    </Link>
  );
}
