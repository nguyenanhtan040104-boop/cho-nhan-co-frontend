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
      <form onSubmit={handleSearch} className="flex items-center rounded-lg overflow-hidden shadow-lg">
        <i className="ri-search-line text-gray-400 pl-3 text-base flex-shrink-0 bg-white"></i>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Tìm sản phẩm, việc làm, bất động sản..."
          className="flex-1 px-3 py-3 text-sm focus:outline-none bg-white"
        />
        <button type="submit"
          className="px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 flex-shrink-0"
          style={{ backgroundColor: '#d0011b' }}>
          Tìm kiếm
        </button>
      </form>
      <div className="flex flex-wrap gap-2 mt-2 justify-center">
        {QUICK_TAGS.map(tag => (
          <button key={tag.label} type="button" onClick={() => router.push(tag.route)}
            className="text-xs px-3 py-1 rounded-full border border-white/40 text-white hover:bg-white/20 transition-colors">
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
}
