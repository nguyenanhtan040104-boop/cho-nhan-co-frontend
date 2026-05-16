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
    router.push(`/products?search=${encodeURIComponent(q)}`);
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
