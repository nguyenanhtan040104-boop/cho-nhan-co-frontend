'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { advertisements } from '../../lib/api';

/**
 * Fixed bottom marquee that scrolls active VIP ads horizontally.
 * When no real VIP ads exist yet, shows a CTA inviting users to advertise.
 * - Hidden after user clicks the close (X) button — remembered in localStorage
 *   for 24h so they don't have to dismiss it every page reload.
 */

// Fallback CTAs shown when there are no live VIP ads yet — keeps the banner
// useful from day one and demonstrates the feature.
const FALLBACK_CTAS = [
  { title: 'Cửa hàng của bạn?', desc: 'Đẩy quảng cáo lên đầu trang chỉ từ 50.000đ', href: '/advertisements/create' },
  { title: 'Khai trương — Khuyến mãi', desc: 'Tiếp cận hàng nghìn bà con Đắk Nông', href: '/advertisements/create' },
  { title: 'Đăng quảng cáo ngay', desc: 'Banner chạy + popup mở trang. Click để bắt đầu', href: '/advertisements/create' },
  { title: 'Bán nhanh hơn với VIP', desc: 'Hiển thị nổi bật 7-30 ngày', href: '/advertisements' },
];

export default function AdRollingBanner() {
  const [ads, setAds] = useState<any[]>([]);
  const [usingFallback, setUsingFallback] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    // Respect user's recent dismissal (24h)
    if (typeof window !== 'undefined') {
      const until = Number(localStorage.getItem('adBannerHiddenUntil') || 0);
      if (Date.now() < until) {
        setClosed(true);
        return;
      }
    }

    advertisements
      .getFeatured(15)
      .then(res => {
        const list = res.data || [];
        if (list.length > 0) {
          setAds(list);
        } else {
          setUsingFallback(true);
        }
      })
      .catch(() => setUsingFallback(true));
  }, []);

  function dismiss() {
    setClosed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('adBannerHiddenUntil', String(Date.now() + 24 * 60 * 60 * 1000));
    }
  }

  if (closed) return null;
  if (ads.length === 0 && !usingFallback) return null; // still loading

  // Build the reel: real ads first, otherwise fallback CTAs
  const items = usingFallback
    ? FALLBACK_CTAS.map((c, i) => ({ id: `fallback-${i}`, _fallback: true, title: c.title, businessName: c.desc, href: c.href }))
    : ads.map(a => ({ ...a, href: `/advertisements/${a.id}` }));

  // Duplicate so the marquee loops seamlessly
  const reel = [...items, ...items];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 shadow-[0_-2px_8px_rgba(234,88,12,0.08)]">
        <div className="relative flex items-center">
          <div className={`flex-shrink-0 px-3 sm:px-4 py-2 text-white text-xs font-black tracking-wider uppercase flex items-center gap-1.5 ${
            usingFallback ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-orange-600'
          }`}>
            <i className={`${usingFallback ? 'ri-megaphone-fill' : 'ri-megaphone-line'} text-sm`}></i>
            <span className="hidden sm:inline">{usingFallback ? 'Quảng cáo của bạn?' : 'Quảng cáo'}</span>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="ad-marquee-track flex items-center gap-8 whitespace-nowrap py-2">
              {reel.map((ad: any, i: number) => (
                <Link
                  key={`${ad.id}-${i}`}
                  href={ad.href}
                  className="flex items-center gap-2.5 text-sm hover:opacity-80 transition-opacity"
                >
                  {ad._fallback ? (
                    <i className="ri-rocket-2-fill text-orange-500 text-base"></i>
                  ) : ad.images?.[0] ? (
                    <img
                      src={ad.images[0]}
                      alt=""
                      className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : null}
                  <span className="font-bold text-orange-700">{ad.title}</span>
                  {ad.businessName && (
                    <span className="text-gray-500 hidden md:inline">· {ad.businessName}</span>
                  )}
                  {ad.location && (
                    <span className="text-gray-400 hidden lg:inline">· {ad.location}</span>
                  )}
                  <span className="text-orange-500 text-xs">›</span>
                </Link>
              ))}
            </div>
          </div>

          <button
            onClick={dismiss}
            aria-label="Đóng quảng cáo"
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-orange-700 hover:bg-orange-100 transition-colors"
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>
    </div>
  );
}
