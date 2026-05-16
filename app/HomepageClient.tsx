'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SEARCH_ROUTES: { keywords: string[]; route: string }[] = [
  { keywords: ['bất động sản', 'bds', 'nhà', 'đất', 'phòng trọ', 'căn hộ'], route: '/real-estate' },
  { keywords: ['việc làm', 'tuyển dụng', 'tuyển', 'xin việc', 'nhân công'], route: '/jobs' },
  { keywords: ['diễn đàn', 'forum', 'hỏi đáp'], route: '/forum' },
  { keywords: ['cảnh báo', 'lừa đảo', 'mất đồ'], route: '/canh-bao' },
  { keywords: ['quảng cáo', 'khai trương', 'khuyến mãi'], route: '/advertisements' },
  { keywords: ['nông sản', 'rau', 'củ', 'thực phẩm'], route: '/products?category=NONG_SAN' },
  { keywords: ['vật nuôi', 'chó', 'mèo', 'gà', 'heo', 'bò'], route: '/products?category=VAT_NUOI' },
];

function smartSearch(q: string): string {
  const lower = q.toLowerCase().trim();
  for (const { keywords, route } of SEARCH_ROUTES) {
    if (keywords.some(k => lower.includes(k))) {
      return route + (route.includes('?') ? '&' : '?') + `search=${encodeURIComponent(q)}`;
    }
  }
  return `/products?search=${encodeURIComponent(q)}`;
}

export default function HomepageClient() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(smartSearch(q));
  }

  return (
    <form onSubmit={handleSearch}>
      <div className="flex items-center bg-white rounded-full shadow-lg overflow-hidden border border-gray-100" style={{ height: 52 }}>
        <i className="ri-search-line text-gray-400 pl-5 text-lg flex-shrink-0"></i>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Tìm sản phẩm..."
          className="flex-1 px-3 text-sm focus:outline-none text-gray-800 placeholder-gray-400 h-full"
        />
        <button
          type="submit"
          className="px-6 h-full text-sm font-bold text-gray-900 transition hover:opacity-90 flex-shrink-0 rounded-full m-1"
          style={{ backgroundColor: '#ffd400' }}
        >
          Tìm kiếm
        </button>
      </div>
    </form>
  );
}
