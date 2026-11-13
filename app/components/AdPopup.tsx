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
 * Entry popup for a real, paid advertisement: homepage only, once a day per visitor.
 * With no advertisement to show it stays closed (we no longer pitch ads to every visitor).
 */
export default function AdPopup() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  const [ad, setAd] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!isHome || typeof window === 'undefined') return;
    if (localStorage.getItem(STORAGE_KEY) === todayKey()) return;

    let cancelled = false;
    async function load() {
      try {
        // Prefer the top featured (VIP) ad, else the most recent one
        const featured = await advertisements.getFeatured(1).catch(() => ({ data: [] }));
        let top = featured.data?.[0];
        if (!top) {
          const recent = await advertisements.getAll({ limit: 1 }).catch(() => ({ data: [] }));
          top = recent.data?.[0];
        }
        if (cancelled || !top) return;
        setAd(top);
        setTimeout(() => { if (!cancelled) setVisible(true); }, DELAY_MS);
      } catch { /* no popup */ }
    }
    load();
    return () => { cancelled = true; };
  }, [isHome]);

  function close() {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, todayKey());
    }, 200); // match fade-out duration
  }

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [visible]);

  if (!visible || !ad) return null;

  const image = ad.images?.[0];

  return (
    <div
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Quảng cáo"
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm transition-opacity duration-200 ${closing ? 'opacity-0' : 'opacity-100'}`}
    >
      <div
        onClick={e => e.stopPropagation()}
        className={`relative w-full max-w-md overflow-hidden rounded-sheet bg-surface shadow-lift transition-all duration-200 ${closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <button
          onClick={close}
          aria-label="Đóng"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-ink-soft shadow-md transition hover:text-ink"
        >
          <i className="ri-close-line text-xl" />
        </button>

        {image ? (
          <div className="relative bg-forest-50" style={{ aspectRatio: '16/10' }}>
            <img src={image} alt={ad.title} className="h-full w-full object-cover" />
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-pill bg-ink/70 px-2.5 py-1 text-[11px] font-bold text-white">
              <i className="ri-megaphone-fill" aria-hidden="true" /> Quảng cáo
            </span>
          </div>
        ) : (
          <div className="grid h-28 place-items-center bg-forest-700 text-forest-100">
            <i className="ri-megaphone-fill text-5xl" aria-hidden="true" />
          </div>
        )}

        <div className="p-5">
          {ad.businessName && <p className="mb-1 text-xs font-bold text-forest-700">{ad.businessName}</p>}
          <h3 className="mb-2 line-clamp-2 text-lg font-extrabold leading-tight text-ink">{ad.title}</h3>
          {ad.description && <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-ink-soft">{ad.description}</p>}
          <div className="flex gap-2">
            <button onClick={close} className="btn-ghost flex-1">Để sau</button>
            <Link href={`/advertisements/${ad.id}`} onClick={close} className="btn-forest flex-[2]">
              Xem chi tiết <i className="ri-arrow-right-line" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
