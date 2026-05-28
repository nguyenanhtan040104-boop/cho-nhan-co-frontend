'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { advertisements } from '../../lib/api';

const STORAGE_KEY = 'adPopupLastShown'; // stores YYYY-MM-DD
const DELAY_MS = 1200; // wait before showing

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Entry promotional popup — homepage only, once per day per user (localStorage).
 * Shows the top featured VIP ad; falls back to a generic CTA when none exist.
 */
export default function AdPopup() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  const [ad, setAd] = useState<any>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!isHome || typeof window === 'undefined') return;

    // Only once per day
    if (localStorage.getItem(STORAGE_KEY) === todayKey()) return;

    let cancelled = false;
    async function load() {
      try {
        // 1. Prefer top featured VIP ad
        const featured = await advertisements.getFeatured(1).catch(() => ({ data: [] }));
        let top = featured.data?.[0];

        // 2. Fallback to most recent user-submitted ad if no VIP
        if (!top) {
          const recent = await advertisements.getAll({ limit: 1 }).catch(() => ({ data: [] }));
          top = recent.data?.[0];
        }

        if (cancelled) return;

        if (top) {
          setAd(top);
          setIsFallback(false);
        } else {
          setIsFallback(true);
        }
        setTimeout(() => { if (!cancelled) setVisible(true); }, DELAY_MS);
      } catch {
        if (cancelled) return;
        setIsFallback(true);
        setTimeout(() => { if (!cancelled) setVisible(true); }, DELAY_MS);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [isHome]);

  function close() {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, todayKey());
      }
    }, 200); // match fade-out duration
  }

  if (!visible) return null;

  // ─── Slide content ──────────────────────────────────────────────────
  const image = ad?.images?.[0];
  const title = ad?.title ?? 'Quảng cáo trên Chợ Nhân Cơ';
  const description = ad?.description ?? 'Đẩy cửa hàng, sản phẩm hoặc khuyến mãi lên đầu trang. Tiếp cận hàng nghìn bà con tại Đắk Nông chỉ từ 50.000đ.';
  const businessName = ad?.businessName;
  const href = ad ? `/advertisements/${ad.id}` : '/advertisements/create';
  const ctaLabel = ad ? 'Xem chi tiết' : 'Đăng quảng cáo ngay';

  return (
    <div
      onClick={close}
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
        closing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        onClick={e => e.stopPropagation()}
        className={`ad-popup-card relative bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl transition-all duration-200 ${
          closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Close button */}
        <button
          onClick={close}
          aria-label="Đóng"
          className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/95 backdrop-blur rounded-full flex items-center justify-center shadow-md text-gray-600 hover:bg-white hover:text-gray-900 transition-all"
        >
          <i className="ri-close-line text-xl"></i>
        </button>

        {/* Banner — real image OR gradient fallback */}
        {image ? (
          <div className="relative bg-gray-100" style={{ aspectRatio: '16/10' }}>
            <img src={image} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute top-3 left-3 bg-orange-600 text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
              <i className="ri-megaphone-fill text-sm"></i>
              Quảng cáo
            </div>
            {businessName && (
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white/90 text-xs font-bold uppercase tracking-wider drop-shadow">{businessName}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="relative bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 py-10 px-6 text-center text-white overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/10 rounded-full" />
            <div className="relative">
              <i className="ri-rocket-2-fill text-5xl text-white/95 mb-2 inline-block"></i>
              <p className="text-[10px] font-black tracking-widest uppercase opacity-90">Mới ra mắt</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-black text-gray-900 mb-2 leading-tight line-clamp-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4">
            {description}
          </p>

          {isFallback && (
            <div className="bg-orange-50 rounded-xl px-4 py-3 mb-4 space-y-1.5">
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <i className="ri-check-line text-emerald-600"></i>
                Gói 7 ngày — <b className="text-orange-700">50.000đ</b>
              </p>
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <i className="ri-check-line text-emerald-600"></i>
                Gói 30 ngày — <b className="text-orange-700">149.000đ</b>
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={close}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Để sau
            </button>
            <Link
              href={href}
              onClick={close}
              className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold text-center hover:opacity-95 transition-opacity"
            >
              {ctaLabel}
              <i className="ri-arrow-right-line ml-1"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
