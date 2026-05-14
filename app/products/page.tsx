'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { products as productsApi, auth } from '../../lib/api';
import PostOptionsMenu from '../components/PostOptionsMenu';

const categories = [
  { value: '', name: 'Tất cả', icon: '' },
  { value: 'NONG_SAN', name: 'Nông sản', icon: '' },
  { value: 'VAT_NUOI', name: 'Vật nuôi', icon: '' },
  { value: 'DO_DUNG_GIA_DINH', name: 'Đồ dùng', icon: '' },
  { value: 'HANG_TIEU_DUNG', name: 'Tiêu dùng', icon: '' },
  { value: 'DICH_VU', name: 'Dịch vụ', icon: '' },
];

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: '#f8f5f0' }} />}>
      <ProductsInner />
    </Suspense>
  );
}

function ProductsInner() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [bulkMode, setBulkMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const isLoggedIn = typeof window !== 'undefined' && auth.isLoggedIn();
  const currentUserId = typeof window !== 'undefined' ? auth.getCurrentUserId() : null;

  // Đồng bộ khi URL params thay đổi (vd: từ hashtag search)
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const q = searchParams.get('search') || '';
    setCategory(cat);
    setSearch(q);
    setPage(1);
  }, [searchParams]);

  useEffect(() => { loadProducts(); }, [category, sortBy, page]);
  useEffect(() => { if (search === '') { setPage(1); loadProducts(''); } }, [search]);

  async function loadProducts(searchQuery?: string) {
    setLoading(true);
    try {
      const res = await productsApi.getAll({ search: searchQuery ?? search, category: category || undefined, sortBy, page, limit: 12 });
      setItems(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function handleSearch(e: React.FormEvent) { e.preventDefault(); setPage(1); loadProducts(search); }
  function toggleSelect(id: string) { setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  async function handleBulkDelete() {
    if (!selected.size || !confirm(`Xóa ${selected.size} sản phẩm?`)) return;
    setDeleting(true);
    try {
      await Promise.all([...selected].map(id => productsApi.delete(id)));
      setItems(prev => prev.filter(p => !selected.has(p.id)));
      setTotal(prev => prev - selected.size);
      setSelected(new Set()); setBulkMode(false);
    } catch (e: any) { alert(e.message || 'Xóa thất bại'); }
    finally { setDeleting(false); }
  }

  const vipItems = items.filter(p => p.isVip);
  const normalItems = items.filter(p => !p.isVip);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f5f0' }}>

      {/* Hero banner */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 60%, #40916c 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-300 text-sm font-medium uppercase tracking-wider">Chợ Nhân Cơ</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-1">Sản phẩm nông nghiệp</h1>
              <p className="text-green-200 text-sm">
                <span className="font-semibold text-white">{total}</span> sản phẩm từ bà con địa phương
              </p>
            </div>

            {/* Search */}
            <div className="flex gap-2 w-full lg:w-auto">
              <form onSubmit={handleSearch} className="flex flex-1 lg:w-80 gap-2">
                <div className="relative flex-1">
                  <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Tìm sản phẩm, vật nuôi..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-white/90 backdrop-blur"
                  />
                </div>
                <button type="submit" className="bg-yellow-500 hover:bg-yellow-400 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap">
                  Tìm
                </button>
              </form>
              <Link href="/products/create"
                className="bg-white text-green-800 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-50 transition whitespace-nowrap flex items-center gap-1.5">
                <i className="ri-add-line"></i>
                <span className="hidden sm:inline">Đăng tin</span>
              </Link>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 mt-5 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => { setCategory(cat.value); setPage(1); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  category === cat.value
                    ? 'bg-yellow-500 text-white shadow-lg scale-105'
                    : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur'
                }`}
              >
                      <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
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
                    ? 'bg-green-700 text-white border-green-700'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
          {isLoggedIn && (
            <button onClick={() => { setBulkMode(!bulkMode); setSelected(new Set()); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${bulkMode ? 'bg-red-50 border-red-300 text-red-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}>
              <i className="ri-checkbox-multiple-line"></i>
              {bulkMode ? 'Thoát chọn' : 'Chọn nhiều'}
            </button>
          )}
        </div>

        {/* Bulk action bar */}
        {bulkMode && selected.size > 0 && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
            <span className="text-sm text-red-700 font-medium">Đã chọn {selected.size} sản phẩm</span>
            <button onClick={handleBulkDelete} disabled={deleting}
              className="ml-auto px-4 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-50">
              {deleting ? 'Đang xóa...' : `Xóa (${selected.size})`}
            </button>
            <button onClick={() => { setBulkMode(false); setSelected(new Set()); }}
              className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Hủy</button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse shadow-sm">
                <div className="h-44 bg-gray-200"></div>
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <i className="ri-inbox-line text-3xl text-gray-300"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có sản phẩm nào</h3>
            <p className="text-gray-500 text-sm mb-6">Hãy là người đầu tiên đăng sản phẩm lên chợ!</p>
            <Link href="/products/create" className="inline-block bg-green-700 text-white px-6 py-2.5 rounded-xl hover:bg-green-800 font-medium text-sm">
              + Đăng sản phẩm ngay
            </Link>
          </div>
        ) : (
          <>
            {/* VIP section */}
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
                  {vipItems.slice(0, 8).map(product => (
                    <ProductCard key={product.id} product={product} isVip bulkMode={bulkMode} selected={selected.has(product.id)} onToggle={() => toggleSelect(product.id)} currentUserId={currentUserId} onDeleted={id => setItems(prev => prev.filter(p => p.id !== id))} />
                  ))}
                </div>
                {normalItems.length > 0 && (
                  <div className="flex items-center gap-3 mt-8 mb-2">
                    <div className="h-px flex-1 bg-gray-200"></div>
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Tất cả sản phẩm</span>
                    <div className="h-px flex-1 bg-gray-200"></div>
                  </div>
                )}
              </div>
            )}

            {/* Normal products */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {normalItems.map(product => (
                <ProductCard key={product.id} product={product} isVip={false} bulkMode={bulkMode} selected={selected.has(product.id)} onToggle={() => toggleSelect(product.id)} currentUserId={currentUserId} onDeleted={id => setItems(prev => prev.filter(p => p.id !== id))} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-50">
                  <i className="ri-arrow-left-s-line"></i>
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${page === i + 1 ? 'bg-green-700 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {i + 1}
                  </button>
                )).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))}
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

function ProductCard({ product, isVip, bulkMode, selected, onToggle, currentUserId, onDeleted }: {
  product: any; isVip: boolean; bulkMode: boolean; selected: boolean; onToggle: () => void;
  currentUserId: string | null; onDeleted: (id: string) => void;
}) {
  return (
    <div className="relative group">
      {bulkMode && (
        <button onClick={onToggle}
          className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-md border-2 flex items-center justify-center shadow transition-all ${selected ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'}`}>
          {selected && <i className="ri-check-line text-white text-xs"></i>}
        </button>
      )}
      <Link
        href={bulkMode ? '#' : `/products/${product.id}`}
        onClick={bulkMode ? (e) => { e.preventDefault(); onToggle(); } : undefined}
        className={`block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 ${isVip ? 'ring-2 ring-yellow-400' : 'hover:-translate-y-0.5'} ${selected ? 'ring-2 ring-green-500' : ''}`}
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: '168px', backgroundColor: '#e8f5e9' }}>
          {product.images?.[0] ? (
            <img src={product.images[0].url} alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
              <i className="ri-image-line text-4xl text-gray-300"></i>
              <span className="text-xs text-gray-400">Chưa có ảnh</span>
            </div>
          )}
          {/* VIP badge */}
          {isVip && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 shadow">
              <i className="ri-vip-crown-fill text-xs"></i> VIP
            </div>
          )}
          {/* Category tag */}
          {product.category && (
            <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
              {categories.find(c => c.value === product.category)?.name}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-snug mb-2 group-hover:text-green-700 transition-colors">
            {product.title}
          </h4>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-base font-bold" style={{ color: '#2d6a4f' }}>
              {fmt(Number(product.price))}đ
            </span>
            {product.unit && <span className="text-xs text-gray-400">/{product.unit}</span>}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1 min-w-0">
              <i className="ri-map-pin-2-fill text-red-400 flex-shrink-0"></i>
              <span className="truncate">{product.location || 'Đắk Nông'}</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-1">
              <i className="ri-eye-line"></i>
              <span>{product.viewCount || 0}</span>
            </div>
          </div>
          {product.user?.fullName && (
            <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400 min-w-0">
              <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <i className="ri-user-fill text-green-600" style={{ fontSize: '9px' }}></i>
              </div>
              <span className="truncate">{product.user.fullName}</span>
            </div>
          )}
        </div>
      </Link>
      <div className="absolute top-2 right-2 z-10">
        <PostOptionsMenu postId={product.id} ownerId={product.userId || product.user?.id} currentUserId={currentUserId} onDelete={async (id) => { await productsApi.delete(id); onDeleted(id); }} editHref={`/products/${product.id}/edit`} />
      </div>
    </div>
  );
}
