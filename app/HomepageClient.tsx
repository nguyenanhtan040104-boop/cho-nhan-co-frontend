'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const HASHTAG_ROUTES: Record<string, string> = {
  batdongsan: '/real-estate', bds: '/real-estate', phongtro: '/real-estate',
  tuyendung: '/jobs', timviec: '/jobs', nhancong: '/jobs',
  dienddan: '/forum', canhbao: '/canh-bao', quangcao: '/advertisements',
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

export default function HomepageClient() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(resolveSearch(q));
  }

  return (
    <form onSubmit={handleSearch}>
      <div className="flex items-center bg-white rounded-xl overflow-hidden shadow-lg">
        <i className="ri-search-line text-gray-400 pl-4 text-lg flex-shrink-0"></i>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Tìm sản phẩm, việc làm, bất động sản..."
          className="flex-1 px-3 py-3.5 text-sm focus:outline-none text-gray-800 placeholder-gray-400"
        />
        <button
          type="submit"
          className="px-6 py-3.5 text-sm font-bold text-white transition hover:opacity-90 flex-shrink-0 rounded-r-xl"
          style={{ backgroundColor: '#d0011b' }}
        >
          Tìm kiếm
        </button>
      </div>
    </form>
  );
}
