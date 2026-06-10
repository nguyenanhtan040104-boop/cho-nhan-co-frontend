'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { products as productsApi, search as searchApi } from '../../lib/api';
import PostOptionsMenu from '../components/PostOptionsMenu';
import EmptyState from '../components/EmptyState';
import LikeButton from '../components/LikeButton';
import CategorySidebar from '../components/CategorySidebar';
import { getUserLocation, captureUserLocation, clearUserLocation, distanceKm, formatDistance, type UserLocation } from '../../lib/userLocation';

const SUB_CATEGORIES = [
  { value: '', name: 'Tất cả' },
  { value: 'Sửa chữa', name: 'Sửa chữa' },
  { value: 'Vận chuyển', name: 'Vận chuyển' },
  { value: 'Tư vấn', name: 'Tư vấn' },
  { value: 'Xây dựng', name: 'Xây dựng' },
  { value: 'Giặt ủi', name: 'Giặt ủi' },
  { value: 'Vệ sinh', name: 'Vệ sinh' },
  { value: 'Gia sư', name: 'Gia sư' },
];

const QUICK_FILTERS = [
  { value: '', label: 'Tất cả' },
  { value: 'vip', label: 'VIP' },
  { value: 'image', label: 'Có ảnh' },
  { value: 'near', label: 'Gần bạn' },
  { value: 'today', label: 'Mới hôm nay' },
];

const POPULAR_SEARCHES = ['Sửa xe máy', 'Chở hàng', 'Xây nhà', 'Giặt ủi', 'Vệ sinh máy lạnh', 'Gia sư toán', 'Cắt tóc', 'Sơn nhà'];

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

export default function DichVuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: '#faf8f4' }} />}>
      <DichVuInner />
    </Suspense>
  );
}

function DichVuInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [subCat, setSubCat] = useState(searchParams.get('sub') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [quickFilter, setQuickFilter] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [userLoc, setUserLoc] = useState<UserLocation | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    setUserLoc(getUserLocation());
    const onChange = () => setUserLoc(getUserLocation());
    window.addEventListener('userLocation:changed', onChange);
    return () => window.removeEventListener('userLocation:changed', onChange);
  }, []);

  async function handleUpdateLocation() {
    setLocating(true);
    const loc = await captureUserLocation();
    setLocating(false);
    if (!loc) alert('Không lấy được vị trí. Vui lòng kiểm tra quyền GPS.');
  }

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setSubCat(searchParams.get('sub') || '');
    setPage(1);
  }, [searchParams]);

  useEffect(() => { loadProducts(); }, [subCat, sortBy, page, quickFilter, userLoc]);
  useEffect(() => { if (search === '') { setPage(1); loadProducts(''); } }, [search]);

  async function loadProducts(searchQuery?: string) {
    setLoading(true);
    try {
      const keyword = [searchQuery ?? search, subCat].filter(Boolean).join(' ');
      const params: any = { category: 'DICH_VU', page, limit: 12, sortBy };
      if (keyword) params.search = keyword;
      if (quickFilter === 'near' && userLoc) {
        params.nearLat = userLoc.latitude;
        params.nearLng = userLoc.longitude;
        params.radiusKm = 30;
      }
      const res = await productsApi.getAll(params);
      setItems(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch { }
    finally { setLoading(false); }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    if (search.trim()) searchApi.log(search, 'products');
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (subCat) params.set('sub', subCat);
    router.replace('/dich-vu' + (params.toString() ? '?' + params.toString() : ''));
    loadProducts(search);
  }

  const itemsWithDistance = items.map(item => {
    if (userLoc && typeof item.latitude === 'number' && typeof item.longitude === 'number') {
      return { ...item, _distanceKm: distanceKm(userLoc, { latitude: item.latitude, longitude: item.longitude }) };
    }
    return item;
  });

  let filtered = itemsWithDistance.filter(item => {
    if (quickFilter === 'vip') return item.isVip;
    if (quickFilter === 'image') return item.images?.length > 0;
    if (quickFilter === 'today') return Date.now() - new Date(item.createdAt).getTime() < 86400000;
    if (quickFilter === 'near') {
      if (userLoc && typeof item._distanceKm === 'number') return item._distanceKm <= 30;
      return (item.location || '').toLowerCase().includes('nhân cơ') || (item.location || '').toLowerCase().includes('đắk nông');
    }
    return true;
  });

  if (quickFilter === 'near' && userLoc) {
    filtered = [...filtered].sort((a, b) => (a._distanceKm ?? 999) - (b._distanceKm ?? 999));
  }

  const vipItems = filtered.filter(p => p.isVip);
  const lowData = !loading && filtered.length < 8;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf8f4' }}>

      {/* Header */}
      <header className="border-b border-stone-200" style={{ backgroundColor: '#1e1b4b' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
          <div className="flex items-end justify-between gap-3 mb-4">
            <div>
              <nav className="text-[11px] text-indigo-200/80 mb-1 flex items-center gap-1">
                <Link href="/" className="hover:text-white">Trang chủ</Link>
                <i className="ri-arrow-right-s-line"></i>
                <span className="text-indigo-200">Dịch vụ</span>
              </nav>
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                {search ? `Kết quả "${search}"` : 'Dịch vụ tại Nhân Cơ'}
              </h1>
              <p className="text-[12px] text-indigo-200/90 mt-0.5">
                <b className="text-white">{fmt(total)}</b> dịch vụ đang rao · Đắk Nông
              </p>
            </div>
            <Link href="/products/create?category=DICH_VU"
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-4 py-2 rounded-md text-[13px] font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm">
              <i className="ri-add-line"></i>
              <span className="hidden sm:inline">Đăng tin</span>
            </Link>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Tìm dịch vụ sửa chữa, vận chuyển..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
              />
            </div>
            <button type="submit" className="bg-white hover:bg-stone-100 text-gray-900 px-4 py-2 rounded-md text-[13px] font-semibold transition-colors whitespace-nowrap">
              Tìm
            </button>
          </form>

          <div className="flex gap-1.5 overflow-x-auto -mx-4 px-4 pb-1 scrollbar-none">
            {SUB_CATEGORIES.map(cat => (
              <button key={cat.value}
                onClick={() => { setSubCat(cat.value); setPage(1); }}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-[12px] font-medium whitespace-nowrap transition-colors ${
                  subCat === cat.value
                    ? 'bg-white text-indigo-900'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-[12px] text-gray-500">
            <b className="text-gray-900">{fmt(filtered.length || total)}</b> kết quả
          </span>
          <div className="w-px h-4 bg-stone-300 mx-1" />
          <div className="flex items-center gap-1 flex-wrap">
            {QUICK_FILTERS.map(f => (
              <button key={f.value} onClick={() => setQuickFilter(f.value)}
                className={`px-2.5 py-1 rounded text-[12px] font-medium transition-colors ${
                  quickFilter === f.value ? 'bg-indigo-700 text-white' : 'text-gray-600 hover:bg-stone-200'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={userLoc ? clearUserLocation : handleUpdateLocation}
              disabled={locating}
              title={userLoc ? `Vị trí: ${userLoc.latitude.toFixed(3)}, ${userLoc.longitude.toFixed(3)}` : 'Chia sẻ GPS để xem khoảng cách'}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[12px] font-medium transition-colors ${
                userLoc ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200' : 'text-gray-600 hover:bg-stone-200'
              } disabled:opacity-50`}>
              <i className={`${locating ? 'ri-loader-4-line animate-spin' : userLoc ? 'ri-map-pin-2-fill' : 'ri-map-pin-line'}`}></i>
              {locating ? 'Đang lấy...' : userLoc ? 'Đã có GPS' : 'Vị trí của tôi'}
            </button>
            <span className="text-[12px] text-gray-500">Sắp xếp:</span>
            <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
              className="text-[12px] border border-stone-300 rounded px-2 py-1 focus:outline-none focus:border-indigo-700 bg-white font-medium text-gray-700">
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá thấp</option>
              <option value="price_desc">Giá cao</option>
              <option value="popular">Phổ biến</option>
            </select>
            <div className="flex items-center border border-stone-300 rounded overflow-hidden">
              <button onClick={() => setView('grid')} aria-label="Lưới"
                className={`w-7 h-7 flex items-center justify-center transition-colors ${view === 'grid' ? 'bg-stone-200 text-gray-900' : 'text-gray-400 hover:bg-stone-100'}`}>
                <i className="ri-grid-fill text-sm"></i>
              </button>
              <button onClick={() => setView('list')} aria-label="Danh sách"
                className={`w-7 h-7 flex items-center justify-center transition-colors border-l border-stone-300 ${view === 'list' ? 'bg-stone-200 text-gray-900' : 'text-gray-400 hover:bg-stone-100'}`}>
                <i className="ri-list-check text-sm"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          <main className="min-w-0">
            {loading ? (
              <GridSkeleton view={view} />
            ) : filtered.length === 0 ? (
              <EmptyState
                keyword={search || subCat || undefined}
                entityLabel="dịch vụ"
                createHref="/products/create?category=DICH_VU"
                createLabel="+ Đăng dịch vụ ngay"
                onClearSearch={search || subCat ? () => { setSearch(''); setSubCat(''); router.replace('/dich-vu'); } : undefined}
              />
            ) : view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map(p => <ItemCard key={p.id} item={p} onDeleted={id => setItems(prev => prev.filter(x => x.id !== id))} accentColor="indigo" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(p => <ItemListRow key={p.id} item={p} onDeleted={id => setItems(prev => prev.filter(x => x.id !== id))} accentColor="indigo" />)}
              </div>
            )}

            {lowData && filtered.length > 0 && <LowDataFill createHref="/products/create?category=DICH_VU" accentColor="indigo" />}

            {totalPages > 1 && !loading && (
              <div className="flex justify-center items-center gap-1 mt-8">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded border border-stone-300 bg-white text-gray-600 disabled:opacity-40 hover:bg-stone-50">
                  <i className="ri-arrow-left-s-line"></i>
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-[13px] font-semibold transition-colors ${page === i + 1 ? 'bg-indigo-700 text-white' : 'bg-white border border-stone-300 text-gray-700 hover:bg-stone-50'}`}>
                    {i + 1}
                  </button>
                )).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded border border-stone-300 bg-white text-gray-600 disabled:opacity-40 hover:bg-stone-50">
                  <i className="ri-arrow-right-s-line"></i>
                </button>
              </div>
            )}
          </main>

          <div className="hidden lg:block">
            <CategorySidebar
              vipItems={vipItems}
              popularCategory="products"
              fallbackSearches={POPULAR_SEARCHES}
              searchHref={(q) => `/dich-vu?search=${encodeURIComponent(q)}`}
              itemHref={(item) => `/products/${item.id}`}
              postHref="/products/create?category=DICH_VU"
              postLabel="Đăng tin dịch vụ"
              showAd={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function GridSkeleton({ view }: { view: 'grid' | 'list' }) {
  if (view === 'list') {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-3 bg-white border border-stone-200 rounded-lg overflow-hidden animate-pulse">
            <div className="w-32 h-28 bg-stone-100 flex-shrink-0" />
            <div className="flex-1 p-3 space-y-2">
              <div className="h-3 bg-stone-100 rounded w-3/4" />
              <div className="h-4 bg-stone-100 rounded w-1/3" />
              <div className="h-2 bg-stone-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="bg-white border border-stone-200 rounded-lg overflow-hidden animate-pulse">
          <div className="bg-stone-100" style={{ aspectRatio: '4/3' }} />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-stone-100 rounded w-3/4" />
            <div className="h-4 bg-stone-100 rounded w-1/2" />
            <div className="h-2 bg-stone-100 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LowDataFill({ createHref, accentColor }: { createHref: string; accentColor: string }) {
  const isIndigo = accentColor === 'indigo';
  return (
    <div className="mt-8 space-y-5">
      <section className={`${isIndigo ? 'bg-indigo-50/60 border-indigo-200/60' : 'bg-amber-50/60 border-amber-200/60'} border rounded-lg p-5 flex items-center gap-4 flex-wrap`}>
        <div className="flex-1 min-w-[200px]">
          <p className={`text-[10px] font-semibold tracking-wider ${isIndigo ? 'text-indigo-700' : 'text-amber-700'} uppercase`}>Cộng đồng Nhân Cơ</p>
          <h3 className="text-[15px] font-bold text-gray-900 mt-0.5 mb-1">Đăng dịch vụ của bạn</h3>
          <p className="text-[12.5px] text-gray-600 leading-relaxed">
            Bà con tại Nhân Cơ, Đắk Nông đang cần nhiều loại dịch vụ. Đăng ngay để tiếp cận khách hàng gần nhà.
          </p>
        </div>
        <Link href={createHref}
          className={`${isIndigo ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-amber-800 hover:bg-amber-900'} text-white text-[13px] font-semibold px-4 py-2 rounded transition-colors`}>
          + Đăng ngay
        </Link>
      </section>
      <section className="bg-amber-50/60 border border-amber-200/60 rounded-lg p-4 flex gap-3">
        <i className="ri-shield-check-line text-amber-700 text-xl flex-shrink-0 mt-0.5"></i>
        <div>
          <p className="text-[13px] font-bold text-amber-900 mb-1">Sử dụng dịch vụ an toàn</p>
          <p className="text-[12px] text-amber-900/80 leading-relaxed">
            Xác nhận giá trước khi ký hợp đồng · Không trả toàn bộ tiền trước · Yêu cầu biên lai.
            <Link href="/canh-bao" className="text-amber-900 font-bold hover:underline ml-1">Xem cảnh báo</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

function ItemCard({ item, onDeleted, accentColor }: { item: any; onDeleted: (id: string) => void; accentColor: string }) {
  const isNew = item.createdAt && (Date.now() - new Date(item.createdAt).getTime()) < 86400000;
  const imgUrl = item.images?.[0]?.url || (typeof item.images?.[0] === 'string' ? item.images[0] : null);
  const hoverColor = accentColor === 'indigo' ? 'group-hover:text-indigo-700' : 'group-hover:text-amber-800';
  const distColor = accentColor === 'indigo' ? 'text-indigo-700' : 'text-amber-800';

  return (
    <div className="relative group">
      <Link href={`/products/${item.id}`}
        className="block bg-white border border-stone-200 rounded-lg overflow-hidden transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:border-stone-300">
        <div className="relative bg-stone-100 overflow-hidden" style={{ aspectRatio: '4/3' }}>
          {imgUrl ? (
            <img src={imgUrl} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
              <i className="ri-service-line text-3xl text-stone-300"></i>
              <span className="text-[10px] text-stone-400">Chưa có ảnh</span>
            </div>
          )}
          {item.isVip ? (
            <span className="absolute top-2 left-2 bg-white/95 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5">
              <i className="ri-vip-crown-fill"></i>VIP
            </span>
          ) : isNew && (
            <span className={`absolute top-2 left-2 bg-white/95 ${accentColor === 'indigo' ? 'text-indigo-700 border-indigo-200' : 'text-amber-700 border-amber-200'} text-[10px] font-bold px-1.5 py-0.5 rounded border`}>
              MỚI
            </span>
          )}
        </div>
        <div className="p-3">
          <h4 className={`text-[13.5px] font-medium text-gray-900 line-clamp-2 leading-snug min-h-[2.5em] mb-1.5 ${hoverColor} transition-colors`}>
            {item.title}
          </h4>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-[15px] font-bold text-red-700">{fmt(Number(item.price))}đ</span>
            {item.unit && <span className="text-[11px] text-gray-400">/{item.unit}</span>}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-2">
            <span className="flex items-center gap-0.5 min-w-0 flex-1">
              <i className="ri-map-pin-line text-gray-400 flex-shrink-0"></i>
              <span className="truncate">{item.location || 'Đắk Nông'}</span>
            </span>
            {typeof item._distanceKm === 'number' && (
              <span className={`flex items-center gap-0.5 ${distColor} font-semibold flex-shrink-0`}>
                <i className="ri-navigation-fill"></i>{formatDistance(item._distanceKm)}
              </span>
            )}
            {item.viewCount !== undefined && (
              <span className="flex items-center gap-0.5 text-gray-400 flex-shrink-0">
                <i className="ri-eye-line"></i>{item.viewCount}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100 text-[11px] text-gray-500">
            {item.user?.fullName ? (
              <span className="flex items-center gap-1 min-w-0 flex-1">
                <i className="ri-user-line text-gray-400 flex-shrink-0"></i>
                <span className="truncate">{item.user.fullName}</span>
              </span>
            ) : <span className="flex-1" />}
            <div className="flex items-center gap-2 flex-shrink-0 text-gray-400">
              {item.createdAt && (
                <span className="flex items-center gap-0.5">
                  <i className="ri-time-line"></i>{timeAgo(item.createdAt)}
                </span>
              )}
              <LikeButton itemId={String(item.id)} inline />
            </div>
          </div>
        </div>
      </Link>
      <div className="absolute top-1 right-1 z-10">
        <PostOptionsMenu postId={item.id} ownerId={item.userId || item.user?.id} onDelete={async (id) => { await productsApi.delete(id); onDeleted(id); }} editHref={`/products/${item.id}/edit`} />
      </div>
    </div>
  );
}

function ItemListRow({ item, onDeleted, accentColor }: { item: any; onDeleted: (id: string) => void; accentColor: string }) {
  const isNew = item.createdAt && (Date.now() - new Date(item.createdAt).getTime()) < 86400000;
  const imgUrl = item.images?.[0]?.url || (typeof item.images?.[0] === 'string' ? item.images[0] : null);
  const hoverColor = accentColor === 'indigo' ? 'group-hover:text-indigo-700' : 'group-hover:text-amber-800';

  return (
    <div className="relative group">
      <Link href={`/products/${item.id}`}
        className="flex gap-3 bg-white border border-stone-200 rounded-lg overflow-hidden hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:border-stone-300 transition-all">
        <div className="relative w-32 sm:w-40 flex-shrink-0 bg-stone-100" style={{ aspectRatio: '4/3' }}>
          {imgUrl ? (
            <img src={imgUrl} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <i className="ri-service-line text-3xl text-stone-300"></i>
            </div>
          )}
          {item.isVip ? (
            <span className="absolute top-1.5 left-1.5 bg-white/95 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200">VIP</span>
          ) : isNew && (
            <span className={`absolute top-1.5 left-1.5 bg-white/95 ${accentColor === 'indigo' ? 'text-indigo-700 border-indigo-200' : 'text-amber-700 border-amber-200'} text-[10px] font-bold px-1.5 py-0.5 rounded border`}>MỚI</span>
          )}
        </div>
        <div className="flex-1 min-w-0 py-2.5 pr-10">
          <h4 className={`text-[14px] font-medium text-gray-900 line-clamp-2 leading-snug ${hoverColor} transition-colors`}>
            {item.title}
          </h4>
          <p className="text-[15px] font-bold text-red-700 mt-1">
            {fmt(Number(item.price))}đ
            {item.unit && <span className="text-[11px] font-normal text-gray-400 ml-0.5">/{item.unit}</span>}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-2 flex-wrap">
            <span className="flex items-center gap-0.5">
              <i className="ri-map-pin-line text-gray-400"></i>{item.location || 'Đắk Nông'}
            </span>
            {item.createdAt && (
              <span className="flex items-center gap-0.5 text-gray-400">
                <i className="ri-time-line"></i>{timeAgo(item.createdAt)}
              </span>
            )}
            {item.user?.fullName && (
              <span className="flex items-center gap-0.5 text-gray-400">
                <i className="ri-user-line"></i>{item.user.fullName}
              </span>
            )}
            {item.viewCount !== undefined && (
              <span className="flex items-center gap-0.5 text-gray-400">
                <i className="ri-eye-line"></i>{item.viewCount}
              </span>
            )}
            <span className="ml-auto">
              <LikeButton itemId={String(item.id)} inline />
            </span>
          </div>
        </div>
      </Link>
      <div className="absolute top-1.5 right-1.5 z-10">
        <PostOptionsMenu postId={item.id} ownerId={item.userId || item.user?.id} onDelete={async (id) => { await productsApi.delete(id); onDeleted(id); }} editHref={`/products/${item.id}/edit`} />
      </div>
    </div>
  );
}
