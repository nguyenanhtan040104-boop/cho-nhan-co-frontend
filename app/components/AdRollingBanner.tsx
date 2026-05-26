'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { advertisements } from '../../lib/api';

/**
 * Fixed bottom marquee that scrolls active VIP ads horizontally.
 * - Hidden after user clicks the close (X) button — remembered in localStorage
 *   for 24h so they don't have to dismiss it every page reload.
 * - Auto-hidden if no featured ads are available.
 * - Each ad is clickable → /advertisements/<id>.
 */
export default function AdRollingBanner() {
  const [ads, setAds] = useState<any[]>([]);
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
      .then(res => setAds(res.data || []))
      .catch(() => setAds([]));
  }, []);

  function dismiss() {
    setClosed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('adBannerHiddenUntil', String(Date.now() + 24 * 60 * 60 * 1000));
    }
  }

  if (closed || ads.length === 0) return null;

  // Duplicate the list so the marquee loops seamlessly
  const reel = [...ads, ...ads];

  return (
    <>
      <style jsx>{`
        @keyframes ad-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ad-track {
          animation: ad-marquee 60s linear infinite;
        }
        .ad-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 shadow-[0_-2px_8px_rgba(234,88,12,0.08)]">
        <div className="relative flex items-center">
          <div className="flex-shrink-0 px-3 sm:px-4 py-2 bg-orange-600 text-white text-xs font-black tracking-wider uppercase flex items-center gap-1.5">
            <i className="ri-megaphone-line text-sm"></i>
            <span className="hidden sm:inline">Quảng cáo</span>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="ad-track flex items-center gap-8 whitespace-nowrap py-2 will-change-transform">
              {reel.map((ad, i) => (
                <Link
                  key={`${ad.id}-${i}`}
                  href={`/advertisements/${ad.id}`}
                  className="flex items-center gap-2.5 text-sm hover:opacity-80 transition-opacity"
                >
                  {ad.images?.[0] && (
                    <img
                      src={ad.images[0]}
                      alt=""
                      className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
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
    </>
  );
}
