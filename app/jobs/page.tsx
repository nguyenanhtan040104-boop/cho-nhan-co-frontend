'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { jobs, auth } from '../../lib/api';
import PostOptionsMenu from '../components/PostOptionsMenu';
import EmptyState from '../components/EmptyState';

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
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Đang tải...</div>}>
      <JobsContent />
    </Suspense>
  );
}

function JobsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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

  // Đọc query params từ URL (từ header dropdown)
  useEffect(() => {
    const t = searchParams.get('type');
    if (t) setType(t);
  }, [searchParams]);

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
          <div className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto">
            <div>
              <p className="text-indigo-300 text-xs uppercase tracking-wider mb-1">Chợ Nhân Cơ</p>
              <h1 className="text-2xl font-bold text-white">Tuyển dụng &amp; Tìm việc</h1>
              <p className="text-indigo-200 text-sm mt-1">{total} tin đăng tại Đắk Nông</p>
            </div>
            <div className="flex gap-2 w-full">
              <form onSubmit={e => { e.preventDefault(); loadData(1); }} className="flex flex-1 gap-2">
                <input type="text" placeholder="Tìm vị trí, công ty..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl text-sm bg-white/10 backdrop-blur border border-white/20 text-white placeholder-indigo-200 focus:outline-none focus:bg-white/20" />
                <button type="submit" className="bg-white text-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-50">Tìm</button>
              </form>
              <Link href="/jobs/create" className="bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-400 whitespace-nowrap">
                + Đăng tin
              </Link>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap justify-center items-center mt-5">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="w-full bg-gray-200" style={{ paddingBottom: '65%' }}></div>
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            keyword={search || type ? (search || type) : undefined}
            entityLabel="việc làm"
            createHref="/jobs/create"
            createLabel="+ Đăng tin đầu tiên"
            onClearSearch={search || type ? () => { setSearch(''); setType(''); router.replace('/jobs'); } : undefined}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map(item => (
                <JobCard key={item.id} item={item} bulkMode={bulkMode} selected={selected.has(item.id)} onToggle={() => toggleSelect(item.id)} onDeleted={id => setItems(prev => prev.filter(p => p.id !== id))} />
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

function JobCard({ item, bulkMode, selected, onToggle, onDeleted }: { item: any; bulkMode: boolean; selected: boolean; onToggle: () => void; currentUserId?: string | null; onDeleted: (id: string) => void }) {
  const isEmployer = item.type === 'EMPLOYER';
  const thumb = item.images?.[0];
  const thumbUrl = typeof thumb === 'string' ? thumb : thumb?.url;

  return (
    <div className="relative group">
      {bulkMode && (
        <button onClick={onToggle}
          className={`absolute top-2 left-2 z-20 w-6 h-6 rounded-md border-2 flex items-center justify-center shadow ${selected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}`}>
          {selected && <i className="ri-check-line text-white text-xs"></i>}
        </button>
      )}
      <Link href={bulkMode ? '#' : `/jobs/${item.id}`}
        onClick={bulkMode ? (e) => { e.preventDefault(); onToggle(); } : undefined}
        className={`block bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden ${selected ? 'ring-2 ring-indigo-500' : ''}`}>

        {/* Ảnh hoặc placeholder */}
        <div className="relative w-full bg-gray-100" style={{ paddingBottom: '65%' }}>
          {thumbUrl ? (
            <img src={thumbUrl} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: isEmployer ? 'linear-gradient(135deg,#4338ca,#6366f1)' : 'linear-gradient(135deg,#0369a1,#0ea5e9)' }}>
              <span className="text-4xl font-bold text-white/80">{(item.title || 'J')[0].toUpperCase()}</span>
            </div>
          )}
          {/* badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {item.isUrgent && <span className="text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded">Gấp</span>}
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isEmployer ? 'bg-indigo-600 text-white' : 'bg-sky-500 text-white'}`}>
              {isEmployer ? 'Tuyển dụng' : 'Tìm việc'}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-snug mb-1">{item.title}</h3>
          {item.salary && <p className="text-green-600 font-bold text-sm">{item.salary}</p>}
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
            {item.location && <><i className="ri-map-pin-line"></i><span className="truncate">{item.location}</span></>}
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-gray-400">
            <span>{item.category}</span>
            <span>{timeAgo(item.createdAt)}</span>
          </div>
        </div>
      </Link>
      <div className="absolute top-2 right-2 z-10">
        <PostOptionsMenu postId={item.id} ownerId={item.userId || item.user?.id} onDelete={async (id) => { await jobs.delete(id); onDeleted(id); }} editHref={`/jobs/${item.id}/edit`} />
      </div>
    </div>
  );
}
