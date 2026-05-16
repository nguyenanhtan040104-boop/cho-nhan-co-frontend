'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const ITEMS = [
  { key: 'cafe', label: 'Cà phê', icon: '☕', color: '#6b3a2a', bg: '#fdf6f0', unit: 'đ/kg' },
  { key: 'tieu', label: 'Hồ tiêu', icon: '🌿', color: '#2d6a4f', bg: '#f0fdf4', unit: 'đ/kg' },
  { key: 'xang', label: 'Xăng RON95', icon: '⛽', color: '#1d4ed8', bg: '#eff6ff', unit: 'đ/lít' },
  { key: 'cao_su', label: 'Cao su', icon: '🌱', color: '#7c3aed', bg: '#f5f3ff', unit: 'đ/kg' },
];

function fmt(n: number) {
  if (!n) return '—';
  return n.toLocaleString('vi-VN');
}

export default function MarketPriceWidget() {
  const [prices, setPrices] = useState<Record<string, { price: number; change: number | null }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agri-prices')
      .then(r => r.json())
      .then(d => {
        const map: Record<string, { price: number; change: number | null }> = {};
        const cats: any[] = d.categories || [];

        for (const cat of cats) {
          const rows = cat.rows || [];
          if (!rows.length) continue;
          const label: string = cat.category?.toLowerCase() || '';
          const latest = rows[0];

          if (label.includes('cà phê') || label.includes('cafe') || label.includes('coffee')) {
            // Lấy Đắk Lắk nếu có, nếu không lấy đầu tiên
            const dakLak = rows.find((r: any) => r.province?.toLowerCase().includes('đắk') || r.province?.toLowerCase().includes('dak'));
            const row = dakLak || rows[0];
            map['cafe'] = { price: row.price || row.buy || 0, change: row.change ?? null };
          }
          if (label.includes('tiêu') || label.includes('pepper')) {
            const row = rows[0];
            map['tieu'] = { price: row.price || row.buy || 0, change: row.change ?? null };
          }
          if (label.includes('cao su') || label.includes('rubber')) {
            const row = rows[0];
            map['cao_su'] = { price: row.price || row.buy || 0, change: row.change ?? null };
          }
        }

        // Xăng: thử lấy từ goldData hoặc để cứng tạm
        setPrices(map);
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
          const data = prices[item.key];
          const isUp = data?.change != null && data.change > 0;
          const isDown = data?.change != null && data.change < 0;
          return (
            <Link key={item.key} href="/market-prices"
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: item.bg }}>
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                {loading ? (
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mt-1"></div>
                ) : (
                  <p className="font-bold text-gray-900 text-sm leading-tight">
                    {data?.price ? fmt(data.price) : <span className="text-gray-400 font-normal text-xs">Đang cập nhật</span>}
                    {data?.price ? <span className="text-[11px] font-normal text-gray-400 ml-0.5">{item.unit}</span> : null}
                  </p>
                )}
                {data?.change != null && data.change !== 0 && (
                  <p className={`text-[11px] font-semibold ${isUp ? 'text-red-500' : 'text-green-600'}`}>
                    {isUp ? '▲' : '▼'} {Math.abs(data.change).toLocaleString('vi-VN')}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
