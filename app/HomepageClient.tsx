'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Map hashtag → đúng trang
const HASHTAG_ROUTES: Record<string, string> = {
  batdongsan: '/real-estate',
  bds: '/real-estate',
  phongtro: '/real-estate',
  nhadat: '/real-estate',
  tuyendung: '/jobs',
  timviec: '/jobs',
  vieclan: '/jobs',
  nhancong: '/jobs',
  dienddan: '/forum',
  forum: '/forum',
  canhbao: '/canh-bao',
  luadao: '/canh-bao',
  tromcap: '/canh-bao',
  matdo: '/canh-bao',
  quangcao: '/advertisements',
  nongsan: '/products?category=NONG_SAN',
  vatnuoi: '/products?category=VAT_NUOI',
  dichvu: '/products?category=DICH_VU',
  muaban: '/products',
};

function resolveSearch(q: string): string {
  if (q.startsWith('#')) {
    const tag = q.slice(1).toLowerCase().replace(/\s/g, '');
    if (HASHTAG_ROUTES[tag]) return HASHTAG_ROUTES[tag];
    // hashtag không có trong map → tìm kiếm chung trên products
    return `/products?search=${encodeURIComponent(tag)}`;
  }
  return `/products?search=${encodeURIComponent(q)}`;
}

const QUICK_TAGS = [
  { label: '#nongsan', route: '/products?category=NONG_SAN' },
  { label: '#vatnuoi', route: '/products?category=VAT_NUOI' },
  { label: '#dichvu', route: '/products?category=DICH_VU' },
  { label: '#batdongsan', route: '/real-estate' },
  { label: '#tuyendung', route: '/jobs' },
  { label: '#muaban', route: '/products' },
  { label: '#dienddan', route: '/forum' },
  { label: '#canhbao', route: '/canh-bao' },
];

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
    <form onSubmit={handleSearch} className="max-w-xl mx-auto">
      <div className="flex gap-2 bg-white/10 backdrop-blur rounded-2xl p-1.5 border border-white/20">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Tìm sản phẩm, việc làm, bất động sản..."
          className="flex-1 bg-transparent text-white placeholder-gray-300 px-3 py-2.5 text-sm focus:outline-none"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition"
          style={{ backgroundColor: '#40916c', color: 'white' }}
        >
          Tìm kiếm
        </button>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {QUICK_TAGS.map(tag => (
          <button
            key={tag.label}
            type="button"
            onClick={() => router.push(tag.route)}
            className="text-xs px-3 py-1 rounded-full border border-white/30 text-green-200 hover:bg-white/10 transition"
          >
            {tag.label}
          </button>
        ))}
      </div>
    </form>
  );
}
