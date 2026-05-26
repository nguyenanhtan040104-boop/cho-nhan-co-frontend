'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { advertisements } from '../../lib/api';

const SESSION_KEY = 'adPopupShown';
const DELAY_MS = 1500; // wait 1.5s after page load before popping up

/**
 * Modal that shows the top active VIP ad once per browser session.
 * When there are no real VIP ads yet, shows a CTA inviting the user
 * to advertise. Closing it sets a sessionStorage flag so it doesn't
 * pop up again until a new browser session.
 */
export default function AdPopup() {
  const [ad, setAd] = useState<any>(null);
  const [isFallback, setIsFallback] = useState(false);
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
          setIsFallback(false);
        } else {
          setIsFallback(true);
        }
        setTimeout(() => setVisible(true), DELAY_MS);
      })
      .catch(() => {
        setIsFallback(true);
        setTimeout(() => setVisible(true), DELAY_MS);
      });
  }, []);

  function close() {
    setVisible(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_KEY, '1');
    }
  }

  if (!visible) return null;

  // ─── Fallback popup (no real VIP ads yet) ──────────────────────────
  if (isFallback) {
    return (
      <div
        onClick={close}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <div
          onClick={e => e.stopPropagation()}
          className="ad-popup-card relative bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl"
        >
          <button
            onClick={close}
            aria-label="Đóng"
            className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/95 backdrop-blur rounded-full flex items-center justify-center shadow-md text-gray-600 hover:bg-white hover:text-gray-900 transition-all"
          >
            <i className="ri-close-line text-xl"></i>
          </button>

          <div className="bg-gradient-to-br from-orange-500 to-amber-500 py-10 px-6 text-center text-white">
            <i className="ri-rocket-2-fill text-5xl text-white/95 mb-2 inline-block"></i>
            <p className="text-[10px] font-black tracking-widest uppercase opacity-80">Mới ra mắt</p>
            <h3 className="text-2xl font-black mt-1">Quảng cáo trên Chợ Nhân Cơ</h3>
          </div>

          <div className="p-5">
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Đẩy cửa hàng, sản phẩm hoặc khuyến mãi của bạn lên <b className="text-orange-700">banner chạy ở mọi trang</b> và <b className="text-orange-700">popup khi khách mở site</b>.
            </p>

            <div className="bg-orange-50 rounded-xl px-4 py-3 mb-4 space-y-1.5">
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <i className="ri-check-line text-emerald-600"></i>Gói 7 ngày — chỉ <b className="text-orange-700">50.000đ</b>
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <i className="ri-check-line text-emerald-600"></i>Gói 30 ngày — <b className="text-orange-700">149.000đ</b> (tiết kiệm 30%)
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <i className="ri-check-line text-emerald-600"></i>Tiếp cận hàng nghìn bà con Đắk Nông
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={close}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Để sau
              </button>
              <Link
                href="/advertisements/create"
                onClick={close}
                className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold text-center hover:opacity-95 transition-opacity"
              >
                Đăng quảng cáo ngay
                <i className="ri-arrow-right-line ml-1"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Real VIP ad popup ─────────────────────────────────────────────
  return (
    <div
      onClick={close}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="ad-popup-card relative bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl"
      >
        <button
          onClick={close}
          aria-label="Đóng"
          className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/95 backdrop-blur rounded-full flex items-center justify-center shadow-md text-gray-600 hover:bg-white hover:text-gray-900 transition-all"
        >
          <i className="ri-close-line text-xl"></i>
        </button>

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
