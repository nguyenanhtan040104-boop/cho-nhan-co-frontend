'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomepageClient() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (q.startsWith('#')) {
      router.push(`/products?search=${encodeURIComponent(q.slice(1))}`);
    } else {
      router.push(`/products?search=${encodeURIComponent(q)}`);
    }
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
        {['#nongsan', '#batdongsan', '#tuyendung', '#cafferobusta'].map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => { setQuery(tag); router.push(`/products?search=${encodeURIComponent(tag.slice(1))}`); }}
            className="text-xs px-3 py-1 rounded-full border border-white/30 text-green-200 hover:bg-white/10 transition"
          >
            {tag}
          </button>
        ))}
      </div>
    </form>
  );
}
