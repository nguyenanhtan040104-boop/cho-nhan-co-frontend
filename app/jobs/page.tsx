'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { jobs, auth } from '../../lib/api';
import PostOptionsMenu from '../components/PostOptionsMenu';

const typeOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'EMPLOYER', label: 'Tuyển dụng' },
  { value: 'JOB_SEEKER', label: 'Tìm việc' },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 24) return h < 1 ? 'Vừa đăng' : `${h} giờ trước`;
  const d = Math.floor(h / 24);
  return d < 30 ? `${d} ngày trước` : `${Math.floor(d / 30)} tháng trước`;
}

export default function JobsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const isLoggedIn = typeof window !== 'undefined' && auth.isLoggedIn();
  const currentUserId = typeof window !== 'undefined' ? auth.getCurrentUserId() : null;

  const loadData = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit: 12 };
      if (search) params.search = search;
      if (type) params.type = type;
      if (urgentOnly) params.isUrgent = true;
      const res = await jobs.getAll(params);
      setItems(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setPage(p);
    } catch { } finally { setLoading(false); }
  }, [search, type, urgentOnly]);

  useEffect(() => { loadData(1); }, [loadData]);

  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  async function handleBulkDelete() {
    if (!selected.size || !confirm(`Xóa ${selected.size} tin?`)) return;
    setDeleting(true);
    try {
      await Promise.all([...selected].map(id => jobs.delete(id)));
      setItems(prev => prev.filter(p => !selected.has(p.id)));
      setSelected(new Set()); setBulkMode(false);
    } catch (e: any) { alert(e.message); } finally { setDeleting(false); }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f5f0' }}>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)' }} className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="text-indigo-300 text-xs uppercase tracking-wider mb-1">Chợ Nhân Cơ</p>
              <h1 className="text-2xl font-bold text-white">Tuyển dụng &amp; Tìm việc</h1>
              <p className="text-indigo-200 text-sm mt-1">{total} tin đăng tại Đắk Nông</p>
            </div>
            <div className="flex gap-2">
              <form onSubmit={e => { e.preventDefault(); loadData(1); }} className="flex gap-2">
                <input type="text" placeholder="Tìm vị trí, công ty..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="px-4 py-2 rounded-xl text-sm bg-white/10 backdrop-blur border border-white/20 text-white placeholder-indigo-200 focus:outline-none focus:bg-white/20 w-52" />
                <button type="submit" className="bg-white text-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-50">Tìm</button>
              </form>
              <Link href="/jobs/create" className="bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-400 whitespace-nowrap">
                + Đăng tin
              </Link>
            </div>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap items-center">
            {typeOptions.map(o => (
              <button key={o.value} onClick={() => setType(o.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${type === o.value ? 'bg-white text-indigo-700' : 'bg-white/15 text-white hover:bg-white/25'}`}>
                {o.label}
              </button>
            ))}
            <div className="w-px h-4 bg-white/20 mx-1"></div>
            <button onClick={() => setUrgentOnly(!urgentOnly)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${urgentOnly ? 'bg-red-400 text-white' : 'bg-white/15 text-white hover:bg-white/25'}`}>
              Gấp
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
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
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse flex gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
            <i className="ri-briefcase-line text-5xl text-gray-200 block mb-3"></i>
            <p className="text-gray-500 mb-4">Chưa có tin tuyển dụng nào</p>
            <Link href="/jobs/create" className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700">+ Đăng tin đầu tiên</Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {items.map(item => (
                <JobCard key={item.id} item={item} bulkMode={bulkMode} selected={selected.has(item.id)} onToggle={() => toggleSelect(item.id)} currentUserId={currentUserId} onDeleted={id => setItems(prev => prev.filter(p => p.id !== id))} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => loadData(i + 1)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === i + 1 ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
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

function JobCard({ item, bulkMode, selected, onToggle, currentUserId, onDeleted }: { item: any; bulkMode: boolean; selected: boolean; onToggle: () => void; currentUserId: string | null; onDeleted: (id: string) => void }) {
  const isEmployer = item.type === 'EMPLOYER';
  const categoryLabel: any = {
    NONG_NGHIEP: 'Nông nghiệp', CHAN_NUOI: 'Chăn nuôi',
    VAN_TAI: 'Vận tải', KINH_DOANH: 'Kinh doanh', KHAC: 'Khác',
  };

  return (
    <div className="relative">
      {bulkMode && (
        <button onClick={onToggle}
          className={`absolute top-4 left-4 z-10 w-6 h-6 rounded-md border-2 flex items-center justify-center shadow ${selected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}`}>
          {selected && <i className="ri-check-line text-white text-xs"></i>}
        </button>
      )}
      <Link href={bulkMode ? '#' : `/jobs/${item.id}`}
        onClick={bulkMode ? (e) => { e.preventDefault(); onToggle(); } : undefined}
        className={`block bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all p-5 ${selected ? 'ring-2 ring-indigo-500' : ''}`}>
        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-lg font-bold text-white"
            style={{ backgroundColor: isEmployer ? '#4338ca' : '#0369a1' }}>
            {(item.companyName || item.title || 'J')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-800 hover:text-indigo-700 transition-colors line-clamp-1">{item.title}</h3>
                {item.companyName && <p className="text-sm text-gray-500 mt-0.5">{item.companyName}</p>}
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {item.isUrgent && (
                  <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">Gấp</span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isEmployer ? 'bg-indigo-50 text-indigo-700' : 'bg-sky-50 text-sky-700'}`}>
                  {isEmployer ? 'Tuyển dụng' : 'Tìm việc'}
                </span>
                <PostOptionsMenu postId={item.id} ownerId={item.userId || item.user?.id} currentUserId={currentUserId} onDelete={async (id) => { await jobs.delete(id); onDeleted(id); }} editHref={`/jobs/${item.id}/edit`} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
              {item.location && <span><i className="ri-map-pin-line mr-0.5"></i>{item.location}</span>}
              {item.salary && <span className="text-green-700 font-semibold">{item.salary}</span>}
              {item.category && <span>{categoryLabel[item.category] || item.category}</span>}
              {item.createdAt && <span className="ml-auto">{timeAgo(item.createdAt)}</span>}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
