'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { advertisements } from '../../lib/api';

const SESSION_KEY = 'adPopupShown';
const DELAY_MS = 1500; // wait 1.5s after page load before popping up

/**
 * Modal that shows the top active VIP ad once per browser session.
 * Closing it sets a sessionStorage flag so it doesn't pop up again
 * until the user opens a new tab / restarts the browser.
 */
export default function AdPopup() {
  const [ad, setAd] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Only once per session
    if (sessionStorage.getItem(SESSION_KEY)) return;

    advertisements
      .getFeatured(1)
      .then(res => {
        const top = res.data?.[0];
        if (top) {
          setAd(top);
          setTimeout(() => setVisible(true), DELAY_MS);
        }
      })
      .catch(() => {});
  }, []);

  function close() {
    setVisible(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_KEY, '1');
    }
  }

  if (!ad || !visible) return null;

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="ad-popup-card relative bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={close}
          aria-label="Đóng"
          className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/95 backdrop-blur rounded-full flex items-center justify-center shadow-md text-gray-600 hover:bg-white hover:text-gray-900 transition-all"
        >
          <i className="ri-close-line text-xl"></i>
        </button>

        {/* Image */}
        {ad.images?.[0] ? (
          <div className="relative bg-gray-100" style={{ aspectRatio: '16/10' }}>
            <img src={ad.images[0]} alt={ad.title} className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 bg-orange-600 text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
              <i className="ri-megaphone-line text-sm"></i>
              Quảng cáo
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 py-12 px-6 text-center">
            <i className="ri-megaphone-line text-5xl text-white/90"></i>
          </div>
        )}

        <div className="p-5">
          {ad.businessName && (
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
              {ad.businessName}
            </p>
          )}
          <h3 className="text-lg font-black text-gray-900 mb-2 leading-tight">{ad.title}</h3>
          {ad.description && (
            <p className="text-sm text-gray-500 line-clamp-3 mb-4">{ad.description}</p>
          )}

          {ad.location && (
            <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
              <i className="ri-map-pin-line"></i>
              {ad.location}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={close}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Để sau
            </button>
            <Link
              href={`/advertisements/${ad.id}`}
              onClick={close}
              className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold text-center hover:opacity-95 transition-opacity"
            >
              Xem chi tiết
              <i className="ri-arrow-right-line ml-1"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
