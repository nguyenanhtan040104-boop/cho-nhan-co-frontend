'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const ITEMS = [
  { key: 'cafe',   label: 'Cà phê',      icon: 'ri-cup-line',         unit: 'đ/kg',  catMatch: 'cà phê',   itemIdx: 0 },
  { key: 'tieu',   label: 'Hồ tiêu',     icon: 'ri-seedling-line',    unit: 'đ/kg',  catMatch: 'hồ tiêu',  itemIdx: 0 },
  { key: 'xang',   label: 'Xăng RON 95', icon: 'ri-gas-station-line', unit: 'đ/lít', catMatch: 'xăng dầu', itemIdx: 0 },
  { key: 'cao_su', label: 'Cao su',      icon: 'ri-drop-line',        unit: 'đ/kg',  catMatch: 'cao su',   itemIdx: 0 },
];

type Row = { price: number; priceMax?: number; change: number | null; unit?: string; place?: string };

const fmt = (n: number) => n.toLocaleString('vi-VN');

export default function MarketPriceWidget() {
  const [data, setData] = useState<Record<string, Row>>({});
  const [priceDate, setPriceDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agri-prices')
      .then(r => r.json())
      .then(d => {
        const cats: any[] = d.categories || [];
        const map: Record<string, Row> = {};
        for (const item of ITEMS) {
          const cat = cats.find((c: any) => c.category?.toLowerCase().includes(item.catMatch));
          const row = cat?.items?.[item.itemIdx];
          if (row?.price) {
            map[item.key] = {
              price: row.price,
              priceMax: row.priceMax,
              change: row.change ?? null,
              unit: row.unit ? `đ/${row.unit}` : undefined,
              place: item.key === 'cafe' || item.key === 'tieu' ? row.location : undefined,
            };
          }
        }
        setData(map);
        setPriceDate(d.priceDate || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="card p-4 sm:p-5" aria-label="Giá thị trường hôm nay">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-[17px] font-bold text-ink">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-forest-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-forest-500" />
            </span>
            Giá hôm nay
          </h2>
          {priceDate && <p className="mt-0.5 text-xs text-ink-faint">Cập nhật ngày {priceDate}</p>}
        </div>
        <Link href="/market-prices" className="inline-flex items-center gap-0.5 whitespace-nowrap text-[13px] font-bold text-forest-700 hover:underline">
          Xem bảng giá <i className="ri-arrow-right-s-line text-base" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {ITEMS.map(item => {
          const row = data[item.key];
          const up = row?.change != null && row.change > 0;
          const down = row?.change != null && row.change < 0;
          return (
            <Link key={item.key} href="/market-prices" className="rounded-xl border border-line bg-paper p-3 transition hover:border-forest-300 hover:bg-forest-50">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-forest-100 text-forest-700"><i className={`${item.icon} text-base`} aria-hidden="true" /></span>
                {item.label}
              </div>
              {loading ? (
                <div className="mt-2.5 h-5 w-24 animate-pulse rounded bg-line" />
              ) : row ? (
                <>
                  <p className="mt-2 text-[17px] font-extrabold tabular-nums leading-tight text-ink">
                    {fmt(row.price)}{row.priceMax ? `–${fmt(row.priceMax)}` : ''}
                    <span className="ml-1 text-[11px] font-medium text-ink-faint">{row.unit ?? item.unit}</span>
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px]">
                    {row.change != null && row.change !== 0 ? (
                      <span className={`font-bold ${up ? 'text-brand-600' : 'text-forest-700'}`}>{up ? '▲' : '▼'} {fmt(Math.abs(row.change))}</span>
                    ) : (
                      <span className="text-ink-faint">Không đổi</span>
                    )}
                    {row.place && <span className="truncate text-ink-faint">· {row.place}</span>}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-xs text-ink-faint">Đang cập nhật</p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
