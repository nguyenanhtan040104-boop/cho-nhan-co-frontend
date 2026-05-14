'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { advertisements, auth } from '../../lib/api';
import PostOptionsMenu from '../components/PostOptionsMenu';

const CATEGORIES = [
  { value: '', label: 'Tất cả' },
  { value: 'KHAI_TRUONG', label: 'Khai trương' },
  { value: 'KHUYEN_MAI', label: 'Khuyến mãi' },
  { value: 'SAN_PHAM_MOI', label: 'Sản phẩm mới' },
  { value: 'DICH_VU', label: 'Dịch vụ' },
  { value: 'SU_KIEN', label: 'Sự kiện' },
  { value: 'KHAC', label: 'Khác' },
];

function getCategoryLabel(val: string) {
  return CATEGORIES.find(c => c.value === val)?.label || val;
}

function isActive(ad: any) {
  if (!ad.isActive) return false;
  const now = new Date();
  if (ad.endDate && new Date(ad.endDate) < now) return false;
  return true;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

export default function AdvertisementsPage() {
  const currentUserId = typeof window !== 'undefined' ? auth.getCurrentUserId() : null;
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  const loadData = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit: 12 };
      if (category) params.category = category;
      if (search) params.search = search;
      const res = await advertisements.getAll(params);
      setItems(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setPage(p);
    } catch { } finally { setLoading(false); }
  }, [category, search]);

  useEffect(() => { loadData(1); }, [loadData]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f5f0' }}>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)' }} className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="text-orange-300 text-xs uppercase tracking-wider mb-1">Chợ Nhân Cơ</p>
              <h1 className="text-2xl font-bold text-white">Quảng cáo &amp; Thông báo</h1>
              <p className="text-orange-200 text-sm mt-1">{total} tin quảng cáo từ cửa hàng địa phương</p>
            </div>
            <div className="flex gap-2">
              <form onSubmit={e => { e.preventDefault(); loadData(1); }} className="flex gap-2">
                <input type="text" placeholder="Tìm cửa hàng, sự kiện..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="px-4 py-2 rounded-xl text-sm bg-white/10 backdrop-blur border border-white/20 text-white placeholder-orange-200 focus:outline-none focus:bg-white/20 w-52" />
                <button type="submit" className="bg-white text-orange-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-50">Tìm</button>
              </form>
              <Link href="/advertisements/create" className="bg-orange-400 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-300 whitespace-nowrap">
                + Đăng quảng cáo
              </Link>
            </div>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            {CATEGORIES.map(o => (
              <button key={o.value} onClick={() => setCategory(o.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${category === o.value ? 'bg-white text-orange-700' : 'bg-white/15 text-white hover:bg-white/25'}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading && items.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
            <i className="ri-megaphone-line text-5xl text-gray-200 block mb-3"></i>
            <p className="text-gray-500 mb-4">Chưa có quảng cáo nào</p>
            <Link href="/advertisements/create" className="inline-block bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-700">+ Đăng quảng cáo đầu tiên</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map(item => (
                <AdCard key={item.id} item={item} currentUserId={currentUserId} onDeleted={id => setItems(prev => prev.filter(p => p.id !== id))} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => loadData(i + 1)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === i + 1 ? 'bg-orange-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AdCard({ item, currentUserId, onDeleted }: { item: any; currentUserId: string | null; onDeleted: (id: string) => void }) {
  const active = isActive(item);
  const hasImage = item.images?.[0]?.url || item.image;

  return (
    <div className="relative group">
    <Link href={`/advertisements/${item.id}`}
      className="block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
      <div className="relative h-44 bg-gray-50">
        {hasImage ? (
          <img src={hasImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="ri-megaphone-line text-4xl text-gray-200"></i>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {active ? 'Đang chạy' : 'Hết hạn'}
          </span>
        </div>
        {item.category && (
          <span className="absolute bottom-2 left-2 bg-orange-500/90 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            {getCategoryLabel(item.category)}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 line-clamp-2 mb-1 group-hover:text-orange-700 transition-colors">{item.title}</h3>
        {item.description && <p className="text-xs text-gray-400 line-clamp-2 mb-2">{item.description}</p>}
        {item.endDate && (
          <p className="text-xs text-gray-400">Hết hạn: {formatDate(item.endDate)}</p>
        )}
        {item.user?.fullName && (
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-50">
            <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-xs text-orange-700 font-bold flex-shrink-0">
              {item.user.fullName[0]}
            </div>
            <span className="text-xs text-gray-400 truncate">{item.user.fullName}</span>
          </div>
        )}
      </div>
    </Link>
    <div className="absolute top-2 right-2 z-10">
      <PostOptionsMenu postId={item.id} ownerId={item.userId || item.user?.id} currentUserId={currentUserId} onDelete={async (id) => { await advertisements.delete(id); onDeleted(id); }} editHref={`/advertisements/${item.id}/edit`} />
    </div>
    </div>
  );
}
