'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { jobs, auth } from '../../lib/api';

const typeOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'EMPLOYER', label: 'Tuyển dụng' },
  { value: 'JOB_SEEKER', label: 'Tìm việc' },
];

export default function JobsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [urgentOnly, setUrgentOnly] = useState(false);

  const [bulkMode, setBulkMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const isLoggedIn = typeof window !== 'undefined' && auth.isLoggedIn();

  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  async function handleBulkDelete() {
    if (!selected.size || !confirm(`Xóa ${selected.size} tin đã chọn?`)) return;
    setDeleting(true);
    try {
      await Promise.all([...selected].map(id => jobs.delete(id)));
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
      if (category) params.category = category;
      if (location) params.location = location;
      if (urgentOnly) params.isUrgent = true;

      const res = await jobs.getAll(params);
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
  }, [search, type, category, location, urgentOnly]);

  useEffect(() => { loadData(1); }, [loadData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tuyển dụng</h1>
              <p className="text-gray-500 text-sm mt-1">{total} tin tuyển dụng</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {isLoggedIn && (
                <button onClick={() => { setBulkMode(!bulkMode); setSelected(new Set()); }}
                  className={`border px-3 py-2 rounded-lg text-sm flex items-center gap-1 ${bulkMode ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                  <i className="ri-checkbox-multiple-line"></i>
                  <span className="hidden sm:inline">Chọn nhiều</span>
                </button>
              )}
              <Link href="/jobs/seek" className="border border-indigo-600 text-indigo-600 px-4 py-2.5 rounded-lg hover:bg-indigo-50 text-sm font-medium whitespace-nowrap">
                Tìm việc
              </Link>
              <Link href="/jobs/create" className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 text-sm font-medium whitespace-nowrap">
                + Đăng tuyển dụng
              </Link>
            </div>
          </div>

          <form onSubmit={e => { e.preventDefault(); loadData(1); }} className="flex gap-2 mb-4">
            <input type="text" placeholder="Tìm kiếm công việc, địa điểm..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
            <button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 text-sm">Tìm</button>
          </form>

          <div className="flex flex-wrap gap-2 items-center">
            <select value={type} onChange={e => setType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
              {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input type="text" placeholder="Địa điểm" value={location} onChange={e => setLocation(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-36" />
            <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={urgentOnly} onChange={e => setUrgentOnly(e.target.checked)} className="rounded" />
              Chỉ tin khẩn cấp
            </label>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {bulkMode && (
          <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3 flex-wrap">
            <span className="text-sm text-indigo-700 font-medium">
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
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl p-16 text-center shadow-sm">
            <i className="ri-briefcase-line text-6xl text-gray-300 block mb-3"></i>
            <p className="text-gray-500 mb-4">Chưa có tin tuyển dụng nào</p>
            <Link href="/jobs/create" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 text-sm">
              Đăng tin đầu tiên
            </Link>
          </div>
        ) : (
          <>
            {/* Tin VIP nổi bật */}
            {items.filter(j => j.isVip).length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <i className="ri-vip-crown-fill text-yellow-500 text-xl"></i>
                  <h2 className="text-lg font-bold text-gray-900">Tin nổi bật</h2>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">VIP</span>
                </div>
                <div className="space-y-3">
                  {items.filter(j => j.isVip).slice(0, 3).map(job => (
                    <Link key={job.id} href={`/jobs/${job.id}`}
                      className="flex-1 bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex gap-4 items-start ring-2 ring-yellow-400 block">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center flex-shrink-0">
                        <i className="ri-vip-crown-fill text-white text-xl"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{job.title}</h3>
                            <p className="text-sm text-gray-500 mt-0.5">{job.user?.fullName} • {job.location}</p>
                          </div>
                          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0">VIP</span>
                        </div>
                        {job.salary && <p className="text-green-600 font-semibold text-sm mt-1">{job.salary}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
                <hr className="mt-4" />
              </div>
            )}
            <div className="space-y-4">
              {items.map(job => (
                <div key={job.id} className="flex gap-3 items-stretch">
                  {bulkMode && (
                    <div className="flex items-center">
                      <input type="checkbox" checked={selected.has(job.id)} onChange={() => toggleSelect(job.id)}
                        className="rounded w-4 h-4 cursor-pointer" />
                    </div>
                  )}
                <Link href={bulkMode ? '#' : `/jobs/${job.id}`}
                  onClick={bulkMode ? (e) => { e.preventDefault(); toggleSelect(job.id); } : undefined}
                  className={`flex-1 bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex gap-4 items-start ${bulkMode && selected.has(job.id) ? 'ring-2 ring-indigo-500' : ''}`}>
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="ri-briefcase-line text-indigo-600 text-xl"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{job.user?.fullName} • {job.location}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {job.isUrgent && (
                          <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">Khẩn cấp</span>
                        )}
                        {job.isVip && (
                          <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">VIP</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {job.salary && (
                        <span className="text-green-600 font-semibold text-sm">{job.salary}</span>
                      )}
                      <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded">
                        {job.type === 'EMPLOYER' ? 'Tuyển dụng' : job.type === 'JOB_SEEKER' ? 'Tìm việc' : job.type}
                      </span>
                      {job.category && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{job.category}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span><i className="ri-eye-line mr-1"></i>{job.viewCount} lượt xem</span>
                      <span>{new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                      {job.deadline && <span>Hạn: {new Date(job.deadline).toLocaleDateString('vi-VN')}</span>}
                    </div>
                  </div>
                </Link>
                </div>
              ))}
            </div>

            {page < totalPages && (
              <div className="text-center mt-8">
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
