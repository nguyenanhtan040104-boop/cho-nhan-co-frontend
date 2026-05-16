'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const ITEMS = [
  {
    key: 'cafe',
    label: 'Cà phê',
    img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=80&h=80&fit=crop&q=80',
    unit: 'đ/kg',
    catMatch: 'cà phê',
    itemIdx: 0,
  },
  {
    key: 'tieu',
    label: 'Hồ tiêu',
    img: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=80&h=80&fit=crop&q=80',
    unit: 'đ/kg',
    catMatch: 'hồ tiêu',
    itemIdx: 0,
  },
  {
    key: 'xang',
    label: 'Xăng RON95',
    img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=80&h=80&fit=crop&q=80',
    unit: 'đ/lít',
    catMatch: 'xăng dầu',
    itemIdx: 0,
  },
  {
    key: 'cao_su',
    label: 'Cao su',
    img: 'https://images.unsplash.com/photo-1605787020600-b9ebd5df1d07?w=80&h=80&fit=crop&q=80',
    unit: 'đ/kg',
    catMatch: 'cao su',
    itemIdx: 0,
  },
];

function fmt(n: number) {
  return n.toLocaleString('vi-VN');
}

export default function MarketPriceWidget() {
  const [data, setData] = useState<Record<string, { price: number; change: number | null }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agri-prices')
      .then(r => r.json())
      .then(d => {
        const cats: any[] = d.categories || [];
        const map: Record<string, { price: number; change: number | null }> = {};

        for (const item of ITEMS) {
          const cat = cats.find((c: any) =>
            c.category?.toLowerCase().includes(item.catMatch)
          );
          if (!cat) continue;
          const row = cat.items?.[item.itemIdx];
          if (row?.price) {
            map[item.key] = { price: row.price, change: row.change ?? null };
          }
        }
        setData(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mt-2 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <i className="ri-line-chart-line text-green-600"></i>
          Giá thị trường hôm nay
        </h2>
        <Link href="/market-prices" className="text-xs text-red-600 font-medium flex items-center gap-0.5 hover:underline">
          Xem tất cả <i className="ri-arrow-right-s-line text-sm"></i>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
        {ITEMS.map(item => {
          const row = data[item.key];
          const isUp = row?.change != null && row.change > 0;
          const isDown = row?.change != null && row.change < 0;
          return (
            <Link key={item.key} href="/market-prices"
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors">
              <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0">
                <img src={item.img} alt={item.label} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">{item.label}</p>
                {loading ? (
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mt-1"></div>
                ) : row?.price ? (
                  <>
                    <p className="font-bold text-gray-900 text-sm leading-tight">
                      {fmt(row.price)}
                      <span className="text-[11px] font-normal text-gray-400 ml-0.5">{item.unit}</span>
                    </p>
                    {row.change != null && row.change !== 0 && (
                      <p className={`text-[11px] font-semibold ${isUp ? 'text-red-500' : 'text-green-600'}`}>
                        {isUp ? '▲' : '▼'} {fmt(Math.abs(row.change))}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-gray-400 mt-0.5">Đang cập nhật</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
