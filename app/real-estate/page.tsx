'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { realEstate, auth } from '../../lib/api';

const typeOptions = [
  { value: '', label: 'Tất cả loại' },
  { value: 'NHA_O', label: 'Nhà ở' },
  { value: 'DAT_NEN', label: 'Đất nền' },
  { value: 'PHONG_TRO', label: 'Phòng trọ' },
  { value: 'MAT_BANG', label: 'Mặt bằng KD' },
];

const sortOptions = [
  { value: '', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá thấp đến cao' },
  { value: 'price_desc', label: 'Giá cao đến thấp' },
];

function formatPrice(price: number) {
  if (price >= 1_000_000_000) return (price / 1_000_000_000).toFixed(1) + ' tỷ';
  if (price >= 1_000_000) return (price / 1_000_000).toFixed(0) + ' triệu';
  return price.toLocaleString() + 'đ';
}

export default function RealEstatePage() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const isLoggedIn = typeof window !== 'undefined' && auth.isLoggedIn();

  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  async function handleBulkDelete() {
    if (!selected.size || !confirm(`Xóa ${selected.size} tin BĐS đã chọn?`)) return;
    setDeleting(true);
    try {
      await Promise.all([...selected].map(id => realEstate.delete(id)));
      setItems(prev => prev.filter(p => !selected.has(p.id)));
      setTotal(prev => prev - selected.size);
      setSelected(new Set()); setBulkMode(false);
    } catch (e: any) { alert(e.message || 'Xóa thất bại'); }
    finally { setDeleting(false); }
  }

  const loadData = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit: 12 };
      if (search) params.search = search;
      if (type) params.type = type;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (minArea) params.minArea = minArea;
      if (maxArea) params.maxArea = maxArea;
      if (sortBy) params.sortBy = sortBy;

      const res = await realEstate.getAll(params);
      if (p === 1) {
        setItems(res.data || []);
      } else {
        setItems(prev => [...prev, ...(res.data || [])]);
      }
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setPage(p);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [search, type, minPrice, maxPrice, minArea, maxArea, sortBy]);

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadData(1);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bất động sản</h1>
              <p className="text-gray-500 text-sm mt-1">{total} tin đăng</p>
            </div>
            <div className="flex gap-2">
              {isLoggedIn && (
                <button onClick={() => { setBulkMode(!bulkMode); setSelected(new Set()); }}
                  className={`border px-3 py-2.5 rounded-lg text-sm flex items-center gap-1 ${bulkMode ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                  <i className="ri-checkbox-multiple-line"></i>
                  <span className="hidden sm:inline">Chọn nhiều</span>
                </button>
              )}
              <Link href="/real-estate/create" className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap">
                + Đăng tin BĐS
              </Link>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm địa chỉ, tiêu đề..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 text-sm">
              Tìm
            </button>
          </form>

          {/* Quick filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <select value={type} onChange={e => setType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500">
              {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500">
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              <i className="ri-filter-line"></i> Lọc nâng cao
            </button>
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Giá từ (đ)</label>
                <input type="number" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Giá đến (đ)</label>
                <input type="number" placeholder="Không giới hạn" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Diện tích từ (m²)</label>
                <input type="number" placeholder="0" value={minArea} onChange={e => setMinArea(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Diện tích đến (m²)</label>
                <input type="number" placeholder="Không giới hạn" value={maxArea} onChange={e => setMaxArea(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div className="col-span-2 md:col-span-4 flex gap-2">
                <button onClick={() => loadData(1)} className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700">
                  Áp dụng
                </button>
                <button onClick={() => { setMinPrice(''); setMaxPrice(''); setMinArea(''); setMaxArea(''); }}
                  className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  Đặt lại
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {bulkMode && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 flex-wrap">
            <span className="text-sm text-green-700 font-medium">
              {selected.size > 0 ? `Đã chọn ${selected.size} tin` : 'Nhấn vào tin để chọn'}
            </span>
            <div className="ml-auto flex gap-2">
              <button onClick={handleBulkDelete} disabled={selected.size === 0 || deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-40 text-sm flex items-center gap-1">
                <i className="ri-delete-bin-line"></i>{deleting ? 'Đang xóa...' : `Xóa (${selected.size})`}
              </button>
              <button onClick={() => { setBulkMode(false); setSelected(new Set()); }}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Hủy</button>
            </div>
          </div>
        )}
        {loading && items.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl p-16 text-center shadow-sm">
            <i className="ri-home-4-line text-6xl text-gray-300 block mb-3"></i>
            <p className="text-gray-500 mb-4">Chưa có tin bất động sản nào</p>
            <Link href="/real-estate/create" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 text-sm">
              Đăng tin đầu tiên
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(item => (
                <div key={item.id} className="relative">
                  {bulkMode && (
                    <button onClick={() => toggleSelect(item.id)}
                      className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-md border-2 flex items-center justify-center ${selected.has(item.id) ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'}`}>
                      {selected.has(item.id) && <i className="ri-check-line text-white text-xs"></i>}
                    </button>
                  )}
                <Link key={item.id} href={bulkMode ? '#' : `/real-estate/${item.id}`}
                  onClick={bulkMode ? (e) => { e.preventDefault(); toggleSelect(item.id); } : undefined}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group block ${bulkMode && selected.has(item.id) ? 'ring-2 ring-green-500' : ''}`}>
                  <div className="relative h-48 bg-gray-100">
                    {item.images?.[0] ? (
                      <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="ri-home-4-line text-5xl text-gray-300"></i>
                      </div>
                    )}
                    {item.isVip && (
                      <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded">VIP</span>
                    )}
                    <span className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 rounded">
                      {item.type === 'NHA_O' ? 'Nhà ở' : item.type === 'DAT_NEN' ? 'Đất nền' : item.type === 'PHONG_TRO' ? 'Phòng trọ' : item.type === 'MAT_BANG' ? 'Mặt bằng' : item.type}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{item.title}</h3>
                    <p className="text-green-600 font-bold text-lg mb-1">{formatPrice(Number(item.price))}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span><i className="ri-map-2-line mr-1"></i>{item.area}m²</span>
                      <span className="flex-1 truncate"><i className="ri-map-pin-line mr-1"></i>{item.address}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      {item.user?.avatarUrl ? (
                        <img src={item.user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs text-green-700 font-bold">
                          {item.user?.fullName?.[0] || 'U'}
                        </div>
                      )}
                      <span className="text-xs text-gray-500">{item.user?.fullName}</span>
                      <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                        <i className="ri-eye-line"></i>{item.viewCount}
                      </span>
                    </div>
                  </div>
                </Link>
                </div>
              ))}
            </div>

            {page < totalPages && (
              <div className="text-center mt-10">
                <button onClick={() => loadData(page + 1)} disabled={loading}
                  className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
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
