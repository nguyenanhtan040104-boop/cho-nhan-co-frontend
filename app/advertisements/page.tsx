'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { advertisements } from '../../lib/api';

const CATEGORIES = [
  { value: '', label: 'Tất cả', icon: 'ri-apps-line' },
  { value: 'KHAI_TRUONG', label: 'Khai trương', icon: 'ri-store-3-line' },
  { value: 'KHUYEN_MAI', label: 'Khuyến mãi', icon: 'ri-price-tag-3-line' },
  { value: 'SAN_PHAM_MOI', label: 'Sản phẩm mới', icon: 'ri-star-line' },
  { value: 'DICH_VU', label: 'Dịch vụ', icon: 'ri-customer-service-2-line' },
  { value: 'SU_KIEN', label: 'Sự kiện', icon: 'ri-calendar-event-line' },
  { value: 'KHAC', label: 'Khác', icon: 'ri-more-line' },
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

export default function AdvertisementsPage() {
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
      if (p === 1) setItems(res.data || []);
      else setItems(prev => [...prev, ...(res.data || [])]);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setPage(p);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => { loadData(1); }, [loadData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quảng cáo & Thông báo</h1>
              <p className="text-gray-500 text-sm mt-1">{total} tin quảng cáo</p>
            </div>
            <Link href="/advertisements/create"
              className="bg-orange-500 text-white px-5 py-2.5 rounded-lg hover:bg-orange-600 text-sm font-medium whitespace-nowrap">
              + Đăng quảng cáo
            </Link>
          </div>

          {/* Search */}
          <form onSubmit={e => { e.preventDefault(); loadData(1); }} className="flex gap-2 mb-4">
            <input type="text" placeholder="Tìm kiếm quảng cáo, tên cửa hàng..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400" />
            <button type="submit" className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 text-sm">Tìm</button>
          </form>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button key={c.value} onClick={() => setCategory(c.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${category === c.value ? 'bg-orange-500 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                <i className={c.icon}></i> {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && items.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl p-16 text-center shadow-sm">
            <i className="ri-megaphone-line text-6xl text-gray-300 block mb-3"></i>
            <p className="text-gray-500 mb-4">Chưa có quảng cáo nào</p>
            <Link href="/advertisements/create" className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 text-sm">
              Đăng quảng cáo đầu tiên
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(ad => (
                <Link key={ad.id} href={`/advertisements/${ad.id}`}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-orange-50 to-yellow-50">
                    {ad.images?.[0] ? (
                      <img src={ad.images[0]} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="ri-megaphone-line text-5xl text-orange-200"></i>
                      </div>
                    )}
                    {ad.isVip && (
                      <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded">VIP</span>
                    )}
                    <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded">
                      {getCategoryLabel(ad.category)}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{ad.title}</h3>
                    {ad.businessName && (
                      <p className="text-sm text-orange-600 font-medium mb-1">{ad.businessName}</p>
                    )}
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{ad.description}</p>

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      {ad.location && (
                        <span className="flex items-center gap-1 truncate">
                          <i className="ri-map-pin-line"></i> {ad.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1 ml-auto">
                        <i className="ri-eye-line"></i> {ad.viewCount}
                      </span>
                    </div>

                    {(ad.startDate || ad.endDate) && (
                      <div className="mt-2 pt-2 border-t text-xs text-gray-400">
                        {ad.startDate && <span>{new Date(ad.startDate).toLocaleDateString('vi-VN')}</span>}
                        {ad.startDate && ad.endDate && <span> – </span>}
                        {ad.endDate && <span>{new Date(ad.endDate).toLocaleDateString('vi-VN')}</span>}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {page < totalPages && (
              <div className="text-center mt-10">
                <button onClick={() => loadData(page + 1)} disabled={loading}
                  className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                  {loading ? 'Đang tải...' : 'Xem thêm'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
