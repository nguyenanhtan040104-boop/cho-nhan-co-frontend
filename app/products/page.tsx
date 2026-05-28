'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { products as productsApi, auth } from '../../lib/api';
import PostOptionsMenu from '../components/PostOptionsMenu';
import EmptyState from '../components/EmptyState';
import LikeButton from '../components/LikeButton';
import CategorySidebar from '../components/CategorySidebar';

const categories = [
  { value: '', name: 'Tất cả' },
  { value: 'NONG_SAN', name: 'Nông sản' },
  { value: 'VAT_NUOI', name: 'Vật nuôi' },
  { value: 'DICH_VU', name: 'Dịch vụ' },
  { value: 'DO_DUNG_GIA_DINH', name: 'Đồ dùng' },
  { value: 'HANG_TIEU_DUNG', name: 'Tiêu dùng' },
];

const QUICK_FILTERS = [
  { value: '', label: 'Tất cả' },
  { value: 'vip', label: 'Chỉ VIP' },
  { value: 'image', label: 'Có ảnh' },
  { value: 'today', label: 'Đăng hôm nay' },
];

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

function timeAgo(dateStr?: string) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'vừa xong';
  if (m < 60) return `${m} phút`;
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h} giờ`;
  const d = Math.floor(diff / 86400000);
  if (d < 30) return `${d} ngày`;
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: '#f5f4ee' }} />}>
      <ProductsInner />
    </Suspense>
  );
}

function ProductsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [quickFilter, setQuickFilter] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const isLoggedIn = typeof window !== 'undefined' && auth.isLoggedIn();

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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    router.replace('/products' + (params.toString() ? '?' + params.toString() : ''));
    loadProducts(search);
  }

  // Apply quick filter client-side
  const filteredItems = items.filter(item => {
    if (quickFilter === 'vip') return item.isVip;
    if (quickFilter === 'image') return item.images?.length > 0;
    if (quickFilter === 'today') {
      const d = new Date(item.createdAt).getTime();
      return Date.now() - d < 86400000;
    }
    return true;
  });

  const vipItems = filteredItems.filter(p => p.isVip);
  const normalItems = filteredItems.filter(p => !p.isVip);
  const showRecommendedFill = !loading && filteredItems.length < 6 && filteredItems.length > 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f4ee' }}>

      {/* ── Compact Hero ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 60%, #40916c 100%)' }}>
        <div className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        <div className="relative max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            {/* Title block */}
            <div className="flex-shrink-0">
              <p className="text-[10px] font-bold tracking-widest text-emerald-200 uppercase mb-1">
                <span className="inline-block w-5 h-px bg-emerald-200 align-middle mr-1.5"></span>
                Chợ Nhân Cơ
              </p>
              <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {search && !category ? 'Kết quả tìm kiếm' : 'Nông sản & Sản phẩm'}
              </h1>
              <p className="text-emerald-200 text-xs mt-0.5">
                <span className="font-bold text-white">{total}</span>{' '}
                {search && !category ? <>kết quả cho &ldquo;<span className="text-yellow-300">{search}</span>&rdquo;</> : 'tin đang rao'}
              </p>
            </div>

            {/* Search + Post button */}
            <form onSubmit={handleSearch} className="flex flex-1 gap-2 min-w-0">
              <div className="relative flex-1 min-w-0">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-white"
                />
              </div>
              <button type="submit" className="bg-yellow-500 hover:bg-yellow-400 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap">
                Tìm
              </button>
              <Link href="/products/create"
                className="bg-white text-emerald-800 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition whitespace-nowrap flex items-center gap-1.5">
                <i className="ri-add-line"></i>
                <span className="hidden sm:inline">Đăng tin</span>
              </Link>
            </form>
          </div>

          {/* Subcategory chips */}
          <div className="flex gap-1.5 mt-3 overflow-x-auto -mx-4 px-4 pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => { setCategory(cat.value); setPage(1); }}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  category === cat.value
                    ? 'bg-yellow-500 text-white shadow'
                    : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">

        {/* ── Toolbar ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 mb-5 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <span className="text-sm font-bold text-gray-800">
              {fmt(total)} <span className="font-medium text-gray-500">tin</span>
            </span>
            <span className="hidden sm:inline text-gray-300">·</span>
            <div className="flex items-center gap-1 flex-wrap">
              {QUICK_FILTERS.map(f => (
                <button key={f.value}
                  onClick={() => setQuickFilter(f.value)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    quickFilter === f.value
                      ? 'bg-emerald-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setPage(1); }}
              className="text-xs border border-gray-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-300 font-medium text-gray-700"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá thấp</option>
              <option value="price_desc">Giá cao</option>
              <option value="popular">Phổ biến</option>
            </select>
            {/* Grid / List toggle */}
            <div className="flex items-center bg-gray-100 rounded-xl p-0.5">
              <button onClick={() => setView('grid')}
                aria-label="Lưới"
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${view === 'grid' ? 'bg-white shadow text-emerald-700' : 'text-gray-400'}`}>
                <i className="ri-grid-fill text-sm"></i>
              </button>
              <button onClick={() => setView('list')}
                aria-label="Danh sách"
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${view === 'list' ? 'bg-white shadow text-emerald-700' : 'text-gray-400'}`}>
                <i className="ri-list-check text-sm"></i>
              </button>
            </div>
          </div>
        </div>

        {/* ── Two-column layout ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

          {/* MAIN column */}
          <main className="min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                    <div className="bg-gray-100" style={{ aspectRatio: '4/3' }} />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-4 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <EmptyState
                keyword={search || category ? (search || category) : undefined}
                entityLabel="sản phẩm"
                createHref="/products/create"
                createLabel="+ Đăng sản phẩm ngay"
                onClearSearch={search || category ? () => { setSearch(''); setCategory(''); router.replace('/products'); } : undefined}
              />
            ) : (
              <>
                {/* VIP section */}
                {vipItems.length > 0 && (
                  <section className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        <i className="ri-vip-crown-fill"></i>
                        Tin VIP nổi bật
                      </span>
                      <span className="text-xs text-gray-400">{vipItems.length} tin</span>
                    </div>
                    {view === 'grid' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {vipItems.slice(0, 6).map(p => <ProductCard key={p.id} product={p} onDeleted={id => setItems(prev => prev.filter(x => x.id !== id))} />)}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {vipItems.slice(0, 6).map(p => <ProductListRow key={p.id} product={p} onDeleted={id => setItems(prev => prev.filter(x => x.id !== id))} />)}
                      </div>
                    )}
                  </section>
                )}

                {/* Section header for normal items if VIP shown */}
                {vipItems.length > 0 && normalItems.length > 0 && (
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Tất cả tin đăng</span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>
                )}

                {/* Normal items */}
                {view === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {normalItems.map(p => <ProductCard key={p.id} product={p} onDeleted={id => setItems(prev => prev.filter(x => x.id !== id))} />)}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {normalItems.map(p => <ProductListRow key={p.id} product={p} onDeleted={id => setItems(prev => prev.filter(x => x.id !== id))} />)}
                  </div>
                )}

                {/* Recommended fill — only when category is sparse */}
                {showRecommendedFill && (
                  <section className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <i className="ri-lightbulb-flash-fill text-amber-500 text-lg"></i>
                      <div>
                        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Gợi ý cho bạn</p>
                        <h3 className="font-black text-gray-900 text-sm">Có thể bạn quan tâm</h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {categories.filter(c => c.value && c.value !== category).slice(0, 6).map(c => (
                        <Link key={c.value} href={`/products?category=${c.value}`}
                          className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-emerald-50 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors">
                          <i className="ri-arrow-right-circle-line text-emerald-600"></i>
                          <span className="text-xs font-bold text-gray-700">{c.name}</span>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-1.5 mt-8">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-50">
                      <i className="ri-arrow-left-s-line"></i>
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button key={i} onClick={() => setPage(i + 1)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${page === i + 1 ? 'bg-emerald-700 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
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
          </main>

          {/* SIDEBAR */}
          <div className="hidden lg:block">
            <CategorySidebar
              postHref="/products/create"
              postLabel="Đăng tin sản phẩm"
              searchHref={(q) => `/products?search=${encodeURIComponent(q)}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Product card (grid view) ────────────────────────────────────────
function ProductCard({ product, onDeleted }: { product: any; onDeleted: (id: string) => void }) {
  const isNew = product.createdAt && (Date.now() - new Date(product.createdAt).getTime()) < 86400000;
  const imgUrl = product.images?.[0]?.url || (typeof product.images?.[0] === 'string' ? product.images[0] : null);

  return (
    <div className="relative group">
      <Link
        href={`/products/${product.id}`}
        className={`block bg-white rounded-2xl overflow-hidden border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${
          product.isVip ? 'border-amber-300 ring-1 ring-amber-200' : 'border-gray-100'
        }`}
      >
        <div className="relative overflow-hidden rounded-t-2xl bg-emerald-50/30" style={{ aspectRatio: '4/3' }}>
          {imgUrl ? (
            <img src={imgUrl} alt={product.title}
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-emerald-50 to-emerald-100/40">
              <i className="ri-image-2-line text-3xl text-emerald-300"></i>
              <span className="text-[10px] font-medium text-emerald-400">Chưa có ảnh</span>
            </div>
          )}

          {/* Top-left badges */}
          <div className="absolute top-2 left-2 flex items-center gap-1">
            {product.isVip && (
              <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow">
                <i className="ri-vip-crown-fill text-[10px]"></i>VIP
              </span>
            )}
            {isNew && !product.isVip && (
              <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow">MỚI</span>
            )}
          </div>

          {/* Time badge — top right */}
          {product.createdAt && (
            <span className="absolute top-2 right-2 bg-black/45 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
              {timeAgo(product.createdAt)}
            </span>
          )}

          <LikeButton itemId={String(product.id)} />
        </div>

        <div className="p-3">
          <h4 className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug mb-1.5 group-hover:text-emerald-700 transition-colors min-h-[2.5em]">
            {product.title}
          </h4>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-base font-black" style={{ color: '#d0011b' }}>{fmt(Number(product.price))}đ</span>
            {product.unit && <span className="text-[11px] text-gray-400">/{product.unit}</span>}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-1.5">
            <span className="flex items-center gap-0.5 min-w-0 flex-1">
              <i className="ri-map-pin-2-line text-red-400 flex-shrink-0"></i>
              <span className="truncate">{product.location || 'Đắk Nông'}</span>
            </span>
            <span className="flex items-center gap-0.5 flex-shrink-0">
              <i className="ri-eye-line"></i>
              <span>{product.viewCount || 0}</span>
            </span>
          </div>

          {/* Seller row */}
          {product.user?.fullName && (
            <div className="flex items-center gap-1.5 pt-1.5 border-t border-gray-50">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {product.user.avatarUrl ? (
                  <img src={product.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <i className="ri-user-fill text-emerald-600" style={{ fontSize: 9 }}></i>
                )}
              </div>
              <span className="text-[11px] text-gray-500 font-medium truncate">{product.user.fullName}</span>
            </div>
          )}
        </div>
      </Link>
      <div className="absolute top-2 right-9 z-10">
        <PostOptionsMenu postId={product.id} ownerId={product.userId || product.user?.id} onDelete={async (id) => { await productsApi.delete(id); onDeleted(id); }} editHref={`/products/${product.id}/edit`} />
      </div>
    </div>
  );
}

// ─── Product list row (compact horizontal view) ──────────────────────
function ProductListRow({ product, onDeleted }: { product: any; onDeleted: (id: string) => void }) {
  const isNew = product.createdAt && (Date.now() - new Date(product.createdAt).getTime()) < 86400000;
  const imgUrl = product.images?.[0]?.url || (typeof product.images?.[0] === 'string' ? product.images[0] : null);

  return (
    <div className="relative group">
      <Link
        href={`/products/${product.id}`}
        className={`flex gap-3 bg-white rounded-2xl overflow-hidden border transition-all hover:shadow-md ${
          product.isVip ? 'border-amber-300' : 'border-gray-100'
        }`}
      >
        <div className="relative w-32 h-32 sm:w-40 sm:h-32 flex-shrink-0 bg-emerald-50/30">
          {imgUrl ? (
            <img src={imgUrl} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <i className="ri-image-2-line text-3xl text-emerald-300"></i>
            </div>
          )}
          <div className="absolute top-1.5 left-1.5 flex gap-1">
            {product.isVip && (
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">VIP</span>
            )}
            {isNew && !product.isVip && (
              <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">MỚI</span>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0 p-3 pr-12">
          <h4 className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
            {product.title}
          </h4>
          <p className="text-base font-black mt-1" style={{ color: '#d0011b' }}>
            {fmt(Number(product.price))}đ
            {product.unit && <span className="text-[11px] text-gray-400 ml-0.5">/{product.unit}</span>}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-2 flex-wrap">
            <span className="flex items-center gap-0.5">
              <i className="ri-map-pin-2-line text-red-400"></i>
              {product.location || 'Đắk Nông'}
            </span>
            <span className="flex items-center gap-0.5">
              <i className="ri-eye-line"></i>
              {product.viewCount || 0}
            </span>
            {product.createdAt && (
              <span className="flex items-center gap-0.5">
                <i className="ri-time-line"></i>
                {timeAgo(product.createdAt)}
              </span>
            )}
            {product.user?.fullName && (
              <span className="flex items-center gap-0.5 ml-auto">
                <i className="ri-user-line"></i>
                {product.user.fullName}
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="absolute top-2 right-2 z-10">
        <PostOptionsMenu postId={product.id} ownerId={product.userId || product.user?.id} onDelete={async (id) => { await productsApi.delete(id); onDeleted(id); }} editHref={`/products/${product.id}/edit`} />
      </div>
    </div>
  );
}
