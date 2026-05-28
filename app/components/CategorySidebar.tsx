'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { advertisements } from '../../lib/api';

type Props = {
  popularSearches?: string[];
  searchHref?: (q: string) => string; // builds href from a tag
  postHref: string;
  postLabel: string;
  safetyTips?: string[];
  showAd?: boolean;
};

const DEFAULT_TIPS = [
  'Gặp trực tiếp ở nơi đông người, không chuyển tiền trước',
  'Kiểm tra kỹ hàng hóa trước khi thanh toán',
  'Không chia sẻ OTP / mật khẩu cho bất kỳ ai',
  'Báo cáo tin xấu qua nút "Báo cáo" ở mỗi bài đăng',
];

const DEFAULT_SEARCHES = [
  'Cà phê', 'Hồ tiêu', 'Sầu riêng', 'Bơ', 'Mít', 'Tiêu sọ', 'Cà phê nhân',
];

/**
 * Right-column sidebar with supporting widgets to fill empty space
 * on category listing pages. Used across /products, /real-estate, /jobs,
 * /vat-nuoi, /dich-vu.
 */
export default function CategorySidebar({
  popularSearches = DEFAULT_SEARCHES,
  searchHref,
  postHref,
  postLabel,
  safetyTips = DEFAULT_TIPS,
  showAd = true,
}: Props) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-4 self-start">
      {/* ── Post CTA ─────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl text-white p-5"
        style={{ background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 60%, #40916c 100%)' }}
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/10 rounded-full" />
        <div className="relative">
          <p className="text-[10px] font-bold tracking-widest text-emerald-200 uppercase mb-1.5">
            <span className="inline-block w-5 h-px bg-emerald-200 align-middle mr-1.5"></span>
            Miễn phí đăng tin
          </p>
          <h3 className="font-black text-lg leading-tight mb-2">Bán hàng của bạn ngay hôm nay</h3>
          <p className="text-emerald-100 text-xs leading-relaxed mb-3">
            Hàng nghìn bà con tại Nhân Cơ, Đắk Nông đang chờ. Đăng tin chỉ mất 1 phút.
          </p>
          <Link
            href={postHref}
            className="inline-flex items-center gap-1.5 bg-white text-emerald-800 px-4 py-2 rounded-full text-sm font-bold hover:scale-105 transition-transform shadow-lg"
          >
            <i className="ri-add-line"></i>
            {postLabel}
          </Link>
        </div>
      </div>

      {/* ── Popular searches ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-4 pt-4 pb-2">
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Tìm kiếm phổ biến</p>
          <h4 className="font-bold text-gray-900 mt-0.5 text-sm">Bà con đang tìm</h4>
        </div>
        <div className="px-4 pb-4 flex flex-wrap gap-1.5">
          {popularSearches.map((q) => (
            <Link
              key={q}
              href={searchHref ? searchHref(q) : `/products?search=${encodeURIComponent(q)}`}
              className="px-2.5 py-1 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200 hover:border-emerald-300 rounded-full text-xs font-medium text-gray-600 transition-colors"
            >
              <i className="ri-search-line text-[10px] mr-1 opacity-60"></i>
              {q}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Safety tips ──────────────────────────────────────────── */}
      <div className="bg-amber-50 rounded-2xl border border-amber-100 overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex items-start gap-2">
          <i className="ri-shield-check-fill text-amber-600 text-lg mt-0.5"></i>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-amber-700 uppercase">Mẹo an toàn</p>
            <h4 className="font-bold text-amber-900 mt-0.5 text-sm">Giao dịch an toàn</h4>
          </div>
        </div>
        <ul className="px-4 pb-4 pt-1 space-y-1.5">
          {safetyTips.map((tip, i) => (
            <li key={i} className="text-xs text-amber-900/80 leading-relaxed flex items-start gap-2">
              <i className="ri-checkbox-circle-fill text-amber-600 text-sm flex-shrink-0 mt-0.5"></i>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/canh-bao"
          className="block mx-4 mb-4 text-center text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 py-2 rounded-xl transition-colors"
        >
          Xem cảnh báo lừa đảo →
        </Link>
      </div>

      {/* ── Sponsored ad slot ────────────────────────────────────── */}
      {showAd && <SidebarAdSlot />}

      {/* ── Community trust ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">Cộng đồng</p>
        <div className="space-y-2.5">
          <TrustRow icon="ri-map-pin-2-fill" iconColor="text-red-500" title="Nhân Cơ, Đắk Nông" sub="Giao dịch tại chỗ, gần nhà" />
          <TrustRow icon="ri-shield-user-fill" iconColor="text-emerald-600" title="Người thật, tin thật" sub="Tài khoản xác minh" />
          <TrustRow icon="ri-phone-fill" iconColor="text-blue-600" title="Hỗ trợ" sub="0888.317.289" />
        </div>
      </div>
    </aside>
  );
}

function TrustRow({ icon, iconColor, title, sub }: { icon: string; iconColor: string; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <i className={`${icon} ${iconColor} text-base mt-0.5 flex-shrink-0`}></i>
      <div className="min-w-0">
        <p className="text-xs font-bold text-gray-800 truncate">{title}</p>
        <p className="text-[11px] text-gray-400 truncate">{sub}</p>
      </div>
    </div>
  );
}

// ─── Sidebar ad slot — small sponsored card ──────────────────────────
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
        if (!cancelled && top) setAd(top);
      } catch {}
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Fallback CTA if no ads at all
  if (!ad) {
    return (
      <Link
        href="/advertisements/create"
        className="block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
      >
        <div className="relative bg-gradient-to-br from-orange-400 to-amber-500 p-5 text-white">
          <div className="absolute top-2 left-2 bg-white/25 backdrop-blur-md border border-white/30 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full">
            Quảng cáo
          </div>
          <i className="ri-rocket-2-fill text-3xl mb-2 inline-block mt-3"></i>
          <p className="font-black text-base leading-tight">Cửa hàng của bạn ở đây</p>
          <p className="text-xs opacity-90 mt-1">Đẩy thương hiệu chỉ từ 50.000đ</p>
        </div>
        <div className="p-3 text-center">
          <span className="text-xs font-bold text-orange-700">Đăng quảng cáo ngay →</span>
        </div>
      </Link>
    );
  }

  const image = ad.images?.[0];
  return (
    <Link
      href={`/advertisements/${ad.id}`}
      className="block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
    >
      {image ? (
        <div className="relative" style={{ aspectRatio: '4/3' }}>
          <img src={image} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute top-2 left-2 bg-white/85 backdrop-blur-md border border-white/40 text-orange-700 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
            <i className="ri-megaphone-fill text-[10px]"></i>
            Quảng cáo
          </div>
          {ad.businessName && (
            <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-bold drop-shadow truncate">{ad.businessName}</p>
          )}
        </div>
      ) : (
        <div className="relative bg-gradient-to-br from-orange-400 to-amber-500 p-5 text-white">
          <div className="absolute top-2 left-2 bg-white/25 backdrop-blur-md text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full">
            Quảng cáo
          </div>
          <i className="ri-megaphone-fill text-3xl mb-2 inline-block mt-3"></i>
        </div>
      )}
      <div className="p-3">
        <p className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug">{ad.title}</p>
        {ad.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mt-1">{ad.description}</p>
        )}
        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-orange-700 mt-2 group-hover:underline">
          Xem chi tiết
          <i className="ri-arrow-right-line text-sm"></i>
        </span>
      </div>
    </Link>
  );
}
