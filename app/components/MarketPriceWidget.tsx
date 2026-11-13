'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const ITEMS = [
  { key: 'cafe',   label: 'Cà phê',      unit: 'đ/kg',  catMatch: 'cà phê',   itemIdx: 0 },
  { key: 'tieu',   label: 'Hồ tiêu',     unit: 'đ/kg',  catMatch: 'hồ tiêu',  itemIdx: 0 },
  { key: 'xang',   label: 'Xăng RON 95', unit: 'đ/lít', catMatch: 'xăng dầu', itemIdx: 0 },
  { key: 'cao_su', label: 'Cao su',      unit: 'đ/kg',  catMatch: 'cao su',   itemIdx: 0 },
];

type Row = { price: number; priceMax?: number; change: number | null; unit?: string; place?: string };

const fmt = (n: number) => n.toLocaleString('vi-VN');

// A plain price board: label, number, change. No decoration.
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
    <section aria-label="Giá thị trường hôm nay">
      <div className="mb-3 flex items-baseline justify-between gap-4 border-b border-line pb-2">
        <h2 className="text-xl font-bold text-ink">
          Giá hôm nay
          {priceDate && <span className="ml-2 text-[13px] font-normal text-ink-faint">{priceDate}</span>}
        </h2>
        <Link href="/market-prices" className="whitespace-nowrap text-[14px] font-semibold text-forest-700 hover:underline">Xem bảng giá</Link>
      </div>

      <dl className="grid grid-cols-2 divide-x divide-y divide-line overflow-hidden rounded-card border border-line bg-surface md:grid-cols-4 md:divide-y-0">
        {ITEMS.map(item => {
          const row = data[item.key];
          const up = row?.change != null && row.change > 0;
          return (
            <Link key={item.key} href="/market-prices" className="block p-3.5 transition-colors hover:bg-paper sm:p-4">
              <dt className="text-[13px] text-ink-soft">{item.label}</dt>
              {loading ? (
                <dd className="mt-2 h-6 w-24 animate-pulse rounded bg-line" />
              ) : row ? (
                <dd className="mt-1">
                  <span className="text-xl font-bold tabular-nums text-ink">{fmt(row.price)}{row.priceMax ? `–${fmt(row.priceMax)}` : ''}</span>
                  <span className="ml-1 text-[12px] text-ink-faint">{row.unit ?? item.unit}</span>
                  <span className="mt-0.5 block text-[12px]">
                    {row.change != null && row.change !== 0 ? (
                      <span className={`font-semibold ${up ? 'text-brand-600' : 'text-forest-700'}`}>{up ? '▲' : '▼'} {fmt(Math.abs(row.change))}</span>
                    ) : (
                      <span className="text-ink-faint">Không đổi</span>
                    )}
                    {row.place && <span className="text-ink-faint"> · {row.place}</span>}
                  </span>
                </dd>
              ) : (
                <dd className="mt-2 text-[13px] text-ink-faint">Đang cập nhật</dd>
              )}
            </Link>
          );
        })}
      </dl>
    </section>
  );
}
