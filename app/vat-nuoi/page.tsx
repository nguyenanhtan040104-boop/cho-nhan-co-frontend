'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { products as productsApi, auth } from '../../lib/api';
import PostOptionsMenu from '../components/PostOptionsMenu';
import EmptyState from '../components/EmptyState';
import LikeButton from '../components/LikeButton';

const subCategories = [
  { value: '', label: 'Tất cả' },
  { value: 'chó', label: 'Chó' },
  { value: 'mèo', label: 'Mèo' },
  { value: 'gia cầm', label: 'Gia cầm' },
  { value: 'gia súc', label: 'Gia súc' },
  { value: 'cá', label: 'Cá cảnh' },
];

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

export default function VatNuoiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: '#f8f5f0' }} />}>
      <VatNuoiContent />
    </Suspense>
  );
}

function VatNuoiContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [subFilter, setSubFilter] = useState(searchParams.get('sub') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const isLoggedIn = typeof window !== 'undefined' && auth.isLoggedIn();

  useEffect(() => {
    const s = searchParams.get('search') || '';
    const sub = searchParams.get('sub') || '';
    setSearch(s);
    setSubFilter(sub);
    setPage(1);
  }, [searchParams]);

  const loadData = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params: any = { category: 'VAT_NUOI', page: p, limit: 12, sortBy };
      if (search) params.search = search;
      if (subFilter) params.search = (params.search ? params.search + ' ' : '') + subFilter;
      const res = await productsApi.getAll(params);
      setItems(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setPage(p);
    } catch { } finally { setLoading(false); }
  }, [search, subFilter, sortBy]);

  useEffect(() => { loadData(1); }, [loadData]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (subFilter) params.set('sub', subFilter);
    router.replace('/vat-nuoi' + (params.toString() ? '?' + params.toString() : ''));
    loadData(1);
  }

  const vipItems = items.filter(p => p.isVip);
  const normalItems = items.filter(p => !p.isVip);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f5f0' }}>
      {/* Hero banner */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #78350f 0%, #b45309 60%, #d97706 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-300 text-sm font-medium uppercase tracking-wider">Chợ Nhân Cơ</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-1">Vật nuôi</h1>
              <p className="text-amber-200 text-sm">
                <span className="font-semibold text-white">{total}</span> tin đăng · Chó, mèo, gia cầm, gia súc...
              </p>
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
              <form onSubmit={handleSearch} className="flex flex-1 lg:w-80 gap-2">
                <div className="relative flex-1">
                  <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Tìm giống chó, mèo, gà..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white/90 backdrop-blur"
                  />
                </div>
                <button type="submit" className="bg-yellow-500 hover:bg-yellow-400 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap">
                  Tìm
                </button>
              </form>
              <Link href="/products/create?category=VAT_NUOI"
                className="bg-white text-amber-800 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-50 transition whitespace-nowrap flex items-center gap-1.5">
                <i className="ri-add-line"></i>
                <span className="hidden sm:inline">Đăng tin</span>
              </Link>
            </div>
          </div>

          {/* Sub-category pills */}
          <div className="flex gap-2 mt-5 overflow-x-auto pb-1 scrollbar-hide">
            {subCategories.map(cat => (
              <button key={cat.value} onClick={() => { setSubFilter(cat.value); setPage(1); }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  subFilter === cat.value
                    ? 'bg-yellow-500 text-white shadow-lg scale-105'
                    : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur'
                }`}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Sort toolbar */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className="text-sm text-gray-500">Sắp xếp:</span>
          {[
            { value: 'newest', label: 'Mới nhất' },
            { value: 'price_asc', label: 'Giá thấp' },
            { value: 'price_desc', label: 'Giá cao' },
            { value: 'popular', label: 'Phổ biến' },
          ].map(opt => (
            <button key={opt.value} onClick={() => { setSortBy(opt.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                sortBy === opt.value
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-amber-400'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse shadow-sm">
                <div className="h-44 bg-gray-200"></div>
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            keyword={search || subFilter || undefined}
            entityLabel="vật nuôi"
            createHref="/products/create?category=VAT_NUOI"
            createLabel="+ Đăng vật nuôi ngay"
            onClearSearch={search || subFilter ? () => { setSearch(''); setSubFilter(''); router.replace('/vat-nuoi'); } : undefined}
          />
        ) : (
          <>
            {vipItems.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-yellow-300 to-transparent"></div>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow">
                    <i className="ri-vip-crown-fill"></i> Tin nổi bật VIP
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-l from-yellow-300 to-transparent"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {vipItems.slice(0, 8).map(item => (
                    <PetCard key={item.id} item={item} isVip />
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {normalItems.map(item => (
                <PetCard key={item.id} item={item} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-50">
                  <i className="ri-arrow-left-s-line"></i>
                </button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${page === i + 1 ? 'bg-amber-600 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-50">
                  <i className="ri-arrow-right-s-line"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PetCard({ item, isVip }: { item: any; isVip?: boolean }) {
  return (
    <div className="relative group">
      <Link href={`/products/${item.id}`}
        className={`block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 ${isVip ? 'ring-2 ring-yellow-400' : ''}`}>
        <div className="relative overflow-hidden" style={{ height: '168px', backgroundColor: '#fef3c7' }}>
          {item.images?.[0] ? (
            <img src={item.images[0].url} alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
              <i className="ri-bear-smile-line text-4xl text-amber-300"></i>
              <span className="text-xs text-gray-400">Chưa có ảnh</span>
            </div>
          )}
          {isVip && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 shadow">
              <i className="ri-vip-crown-fill text-xs"></i> VIP
            </div>
          )}
          <LikeButton itemId={String(item.id)} />
        </div>
        <div className="p-3">
          <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-snug mb-2 group-hover:text-amber-700 transition-colors">
            {item.title}
          </h4>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-base font-bold text-amber-700">{fmt(Number(item.price))}đ</span>
            {item.unit && <span className="text-xs text-gray-400">/{item.unit}</span>}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1 min-w-0">
              <i className="ri-map-pin-2-fill text-red-400 flex-shrink-0"></i>
              <span className="truncate">{item.location || 'Đắk Nông'}</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-1">
              <i className="ri-eye-line"></i>
              <span>{item.viewCount || 0}</span>
            </div>
          </div>
        </div>
      </Link>
      <div className="absolute top-2 left-2 z-10">
        <PostOptionsMenu postId={item.id} ownerId={item.userId || item.user?.id} onDelete={async (id) => { await productsApi.delete(id); }} editHref={`/products/${item.id}/edit`} />
      </div>
    </div>
  );
}
