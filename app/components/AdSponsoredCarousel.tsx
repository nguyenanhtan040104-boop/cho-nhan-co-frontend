'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { advertisements } from '../../lib/api';

type Ad = {
  id: string;
  href: string;
  title: string;
  description?: string;
  image: string;
  label: string;
};

const CATEGORY_LABEL: Record<string, string> = {
  KHAI_TRUONG: 'Khai trương',
  KHUYEN_MAI: 'Khuyến mãi',
  SAN_PHAM_MOI: 'Sản phẩm mới',
  DICH_VU: 'Dịch vụ',
  SU_KIEN: 'Sự kiện',
};

const toAd = (ad: any): Ad | null => {
  const image = ad.images?.[0];
  if (!image) return null;
  return {
    id: ad.id,
    href: `/advertisements/${ad.id}`,
    title: ad.title,
    description: ad.description,
    image: typeof image === 'string' ? image : image.url,
    label: ad.businessName || CATEGORY_LABEL[ad.category] || '',
  };
};

// One ad at a time, changed by the reader. A photo beside a plain text panel;
// the word "Quảng cáo" is always shown so it is never mistaken for a listing.
// Renders nothing when there are no real ads.
export default function AdSponsoredCarousel() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [i, setI] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Paid (featured) ads first, then recent ones
        const featured = await advertisements.getFeatured(8).catch(() => ({ data: [] }));
        let list = ((featured.data || []) as any[]).map(toAd).filter(Boolean) as Ad[];
        if (list.length === 0) {
          const recent = await advertisements.getAll({ limit: 8 }).catch(() => ({ data: [] }));
          list = ((recent.data || []) as any[]).map(toAd).filter(Boolean) as Ad[];
        }
        if (!cancelled) setAds(list);
      } catch {
        if (!cancelled) setAds([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (ads.length === 0) return null;
  const ad = ads[Math.min(i, ads.length - 1)];
  const step = (d: number) => setI(prev => (prev + d + ads.length) % ads.length);

  return (
    <section aria-label="Quảng cáo" className="overflow-hidden rounded-card border border-line bg-surface md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
      <Link href={ad.href} className="block aspect-[16/9] bg-paper md:aspect-auto md:min-h-[240px]">
        <img src={ad.image} alt={ad.title} className="h-full w-full object-cover" loading="lazy" />
      </Link>

      <div className="flex flex-col p-4 sm:p-6">
        <p className="text-[12px] font-semibold text-ink-faint">
          Quảng cáo{ad.label && <span> · {ad.label}</span>}
        </p>
        <h2 className="mt-1.5 line-clamp-2 text-xl font-bold leading-snug text-ink sm:text-2xl">
          <Link href={ad.href} className="hover:text-forest-700">{ad.title}</Link>
        </h2>
        {ad.description && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">{ad.description}</p>}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <Link href={ad.href} className="text-sm font-semibold text-forest-700 underline underline-offset-4">Xem chi tiết</Link>
          {ads.length > 1 && (
            <div className="flex items-center gap-1 text-sm text-ink-soft" role="group" aria-label="Chọn quảng cáo">
              <button onClick={() => step(-1)} aria-label="Quảng cáo trước" className="grid h-8 w-8 place-items-center rounded-lg border border-line hover:border-forest-500"><i className="ri-arrow-left-s-line" /></button>
              <span className="min-w-[3rem] text-center tabular-nums">{i + 1} / {ads.length}</span>
              <button onClick={() => step(1)} aria-label="Quảng cáo sau" className="grid h-8 w-8 place-items-center rounded-lg border border-line hover:border-forest-500"><i className="ri-arrow-right-s-line" /></button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
