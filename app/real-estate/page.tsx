'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { realEstate, auth } from '../../lib/api';

const typeOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'NHA_O', label: 'Nhà ở' },
  { value: 'DAT_NEN', label: 'Đất nền' },
  { value: 'PHONG_TRO', label: 'Phòng trọ' },
  { value: 'MAT_BANG', label: 'Mặt bằng KD' },
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
  const [sortBy, setSortBy] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const isLoggedIn = typeof window !== 'undefined' && auth.isLoggedIn();

  const loadData = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit: 12 };
      if (search) params.search = search;
      if (type) params.type = type;
      if (sortBy) params.sortBy = sortBy;
      const res = await realEstate.getAll(params);
      setItems(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setPage(p);
    } catch { } finally { setLoading(false); }
  }, [search, type, sortBy]);

  useEffect(() => { loadData(1); }, [loadData]);

  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  async function handleBulkDelete() {
    if (!selected.size || !confirm(`Xóa ${selected.size} tin?`)) return;
    setDeleting(true);
    try {
      await Promise.all([...selected].map(id => realEstate.delete(id)));
      setItems(prev => prev.filter(p => !selected.has(p.id)));
      setSelected(new Set()); setBulkMode(false);
    } catch (e: any) { alert(e.message); } finally { setDeleting(false); }
  }

  const vipItems = items.filter(i => i.isVip);
  const normalItems = items.filter(i => !i.isVip);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f5f0' }}>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)' }} className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="text-blue-300 text-xs uppercase tracking-wider mb-1">Chợ Nhân Cơ</p>
              <h1 className="text-2xl font-bold text-white">Bất động sản</h1>
              <p className="text-blue-200 text-sm mt-1">{total} tin đăng tại Đắk Nông</p>
            </div>
            <div className="flex gap-2">
              <form onSubmit={e => { e.preventDefault(); loadData(1); }} className="flex gap-2">
                <input type="text" placeholder="Tìm địa chỉ, tiêu đề..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="px-4 py-2 rounded-xl text-sm bg-white/10 backdrop-blur border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:bg-white/20 w-52" />
                <button type="submit" className="bg-white text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50">Tìm</button>
              </form>
              <Link href="/real-estate/create" className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-400 whitespace-nowrap">
                + Đăng tin
              </Link>
            </div>
          </div>
          {/* Filters */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {typeOptions.map(o => (
              <button key={o.value} onClick={() => setType(o.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${type === o.value ? 'bg-white text-blue-700' : 'bg-white/15 text-white hover:bg-white/25'}`}>
                {o.label}
              </button>
            ))}
            <div className="ml-auto flex gap-2">
              {[{ v: '', l: 'Mới nhất' }, { v: 'price_asc', l: 'Giá thấp' }, { v: 'price_desc', l: 'Giá cao' }].map(o => (
                <button key={o.v} onClick={() => setSortBy(o.v)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${sortBy === o.v ? 'bg-white text-blue-700' : 'bg-white/15 text-white hover:bg-white/25'}`}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Bulk bar */}
        {isLoggedIn && (
          <div className="flex justify-end mb-4 gap-2">
            <button onClick={() => { setBulkMode(!bulkMode); setSelected(new Set()); }}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${bulkMode ? 'bg-red-50 border-red-300 text-red-600' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'}`}>
              {bulkMode ? 'Thoát chọn' : 'Chọn nhiều'}
            </button>
            {bulkMode && selected.size > 0 && (
              <button onClick={handleBulkDelete} disabled={deleting}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">
                {deleting ? 'Đang xóa...' : `Xóa (${selected.size})`}
              </button>
            )}
          </div>
        )}

        {loading && items.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4"></div><div className="h-5 bg-gray-200 rounded w-1/2"></div></div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
            <i className="ri-home-4-line text-5xl text-gray-200 block mb-3"></i>
            <p className="text-gray-500 mb-4">Chưa có tin bất động sản nào</p>
            <Link href="/real-estate/create" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700">+ Đăng tin đầu tiên</Link>
          </div>
        ) : (
          <>
            {vipItems.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-yellow-300 to-transparent"></div>
                  <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full">Tin nổi bật VIP</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-yellow-300 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {vipItems.map(item => <RECard key={item.id} item={item} bulkMode={bulkMode} selected={selected.has(item.id)} onToggle={() => toggleSelect(item.id)} />)}
                </div>
                {normalItems.length > 0 && <div className="flex items-center gap-3 mt-8 mb-2"><div className="h-px flex-1 bg-gray-200"></div><span className="text-xs text-gray-400 uppercase tracking-wider">Tất cả tin đăng</span><div className="h-px flex-1 bg-gray-200"></div></div>}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {normalItems.map(item => <RECard key={item.id} item={item} bulkMode={bulkMode} selected={selected.has(item.id)} onToggle={() => toggleSelect(item.id)} />)}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => loadData(i + 1)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
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

function RECard({ item, bulkMode, selected, onToggle }: { item: any; bulkMode: boolean; selected: boolean; onToggle: () => void }) {
  const typeLabel: any = { NHA_O: 'Nhà ở', DAT_NEN: 'Đất nền', PHONG_TRO: 'Phòng trọ', MAT_BANG: 'Mặt bằng' };
  return (
    <div className="relative group">
      {bulkMode && (
        <button onClick={onToggle} className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-md border-2 flex items-center justify-center shadow ${selected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
          {selected && <i className="ri-check-line text-white text-xs"></i>}
        </button>
      )}
      <Link href={bulkMode ? '#' : `/real-estate/${item.id}`} onClick={bulkMode ? (e) => { e.preventDefault(); onToggle(); } : undefined}
        className={`block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all ${item.isVip ? 'ring-2 ring-yellow-400' : ''} ${selected ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="relative h-48 bg-gray-50">
          {item.images?.[0] ? (
            <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><i className="ri-home-4-line text-4xl text-gray-200"></i></div>
          )}
          {item.isVip && <span className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">VIP</span>}
          {item.type && <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">{typeLabel[item.type] || item.type}</span>}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors">{item.title}</h3>
          <p className="text-lg font-bold text-blue-700 mb-2">{Number(item.price) >= 1e9 ? (Number(item.price)/1e9).toFixed(1)+' tỷ' : Number(item.price) >= 1e6 ? (Number(item.price)/1e6).toFixed(0)+' triệu' : Number(item.price).toLocaleString()+'đ'}</p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {item.area && <span><i className="ri-map-2-line mr-0.5"></i>{item.area}m²</span>}
            <span className="truncate flex-1"><i className="ri-map-pin-line mr-0.5"></i>{item.address || item.location}</span>
          </div>
          {item.user?.fullName && (
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-50">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-700 font-bold flex-shrink-0">{item.user.fullName[0]}</div>
              <span className="text-xs text-gray-400 truncate flex-1">{item.user.fullName}</span>
              <span className="text-xs text-gray-400 flex items-center gap-0.5"><i className="ri-eye-line"></i>{item.viewCount || 0}</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
