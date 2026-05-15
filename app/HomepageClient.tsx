'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const HASHTAG_ROUTES: Record<string, string> = {
  batdongsan: '/real-estate', bds: '/real-estate', phongtro: '/real-estate', nhadat: '/real-estate',
  tuyendung: '/jobs', timviec: '/jobs', nhancong: '/jobs',
  dienddan: '/forum', forum: '/forum',
  canhbao: '/canh-bao', luadao: '/canh-bao',
  quangcao: '/advertisements',
  nongsan: '/products?category=NONG_SAN',
  vatnuoi: '/products?category=VAT_NUOI',
  dichvu: '/products?category=DICH_VU',
  muaban: '/products',
};

function resolveSearch(q: string): string {
  if (q.startsWith('#')) {
    const tag = q.slice(1).toLowerCase().replace(/\s/g, '');
    return HASHTAG_ROUTES[tag] || `/products?search=${encodeURIComponent(tag)}`;
  }
  return `/products?search=${encodeURIComponent(q)}`;
}

const QUICK_TAGS = [
  { label: 'Nông sản', route: '/products?category=NONG_SAN' },
  { label: 'Vật nuôi', route: '/products?category=VAT_NUOI' },
  { label: 'Dịch vụ', route: '/products?category=DICH_VU' },
  { label: 'Bất động sản', route: '/real-estate' },
  { label: 'Tuyển dụng', route: '/jobs' },
  { label: 'Diễn đàn', route: '/forum' },
];

export default function HomepageSearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(resolveSearch(q));
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex items-center border-2 rounded-lg overflow-hidden focus-within:border-red-500 transition-all" style={{ borderColor: '#d0011b' }}>
        <i className="ri-search-line text-gray-400 pl-3 text-base flex-shrink-0"></i>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Tìm sản phẩm, việc làm, bất động sản..."
          className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
        />
        <button type="submit"
          className="px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: '#d0011b' }}>
          Tìm kiếm
        </button>
      </form>
      <div className="flex flex-wrap gap-2 mt-2">
        {QUICK_TAGS.map(tag => (
          <button key={tag.label} type="button" onClick={() => router.push(tag.route)}
            className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600 transition-colors bg-white">
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
}
