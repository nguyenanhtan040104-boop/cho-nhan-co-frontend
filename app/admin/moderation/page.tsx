'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forum, auth } from '../../../lib/api';

const STATUS_OPTS = [
  { value: '', label: 'Tất cả' },
  { value: 'active', label: 'Đang hiển thị' },
  { value: 'hidden', label: 'Đã ẩn' },
];

const categoryLabel: Record<string, string> = {
  NONG_NGHIEP: 'Nông nghiệp', CHAN_NUOI: 'Chăn nuôi', THI_TRUONG: 'Thị trường',
  KY_THUAT: 'Kỹ thuật', KINH_NGHIEM: 'Kinh nghiệm', KHAC: 'Khác',
};

export default function ModerationPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.replace('/profile'); return; }
    loadPosts(1);
  }, [statusFilter]);

  const loadPosts = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await forum.getPendingPosts(params);
      setPosts(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setPage(p);
      setSelected(new Set());
    } catch (e: any) { console.error(e); }
    finally { setLoading(false); }
  }, [statusFilter, search]);

  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleAll() {
    setSelected(selected.size === posts.length ? new Set() : new Set(posts.map(p => p.id)));
  }

  async function handleHide(id: string) {
    setProcessing(id);
    try {
      await forum.hidePost(id);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'hidden' } : p));
    } catch (e: any) { alert(e.message || 'Lỗi'); }
    finally { setProcessing(null); }
  }

  async function handleUnhide(id: string) {
    setProcessing(id);
    try {
      await forum.unhidePost(id);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'active' } : p));
    } catch (e: any) { alert(e.message || 'Lỗi'); }
    finally { setProcessing(null); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa vĩnh viễn bài này?')) return;
    setProcessing(id);
    try {
      await forum.adminDeletePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      setTotal(prev => prev - 1);
    } catch (e: any) { alert(e.message || 'Lỗi'); }
    finally { setProcessing(null); }
  }

  async function handleBulkHide() {
    if (!selected.size) return;
    setProcessing('bulk');
    try {
      await Promise.all([...selected].map(id => forum.hidePost(id)));
      setPosts(prev => prev.map(p => selected.has(p.id) ? { ...p, status: 'hidden' } : p));
      setSelected(new Set());
    } catch (e: any) { alert(e.message || 'Lỗi'); }
    finally { setProcessing(null); }
  }

  async function handleBulkDelete() {
    if (!selected.size || !confirm(`Xóa ${selected.size} bài?`)) return;
    setProcessing('bulk');
    try {
      await forum.bulkDelete([...selected]);
      setPosts(prev => prev.filter(p => !selected.has(p.id)));
      setTotal(prev => prev - selected.size);
      setSelected(new Set());
    } catch (e: any) { alert(e.message || 'Lỗi'); }
    finally { setProcessing(null); }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center gap-4">
          <Link href="/admin/dashboard" className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">
            <i className="ri-arrow-left-line text-lg"></i>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Kiểm duyệt nội dung</h1>
            <p className="text-gray-500 text-sm">{total} bài viết</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
          <form onSubmit={e => { e.preventDefault(); loadPosts(1); }} className="flex gap-2 flex-1 min-w-[200px]">
            <input type="text" placeholder="Tìm tiêu đề, nội dung..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500" />
            <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">Tìm</button>
          </form>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-orange-700">Đã chọn {selected.size} bài</span>
            <div className="ml-auto flex gap-2">
              <button onClick={handleBulkHide} disabled={processing === 'bulk'}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 text-sm">
                <i className="ri-eye-off-line mr-1"></i> Ẩn tất cả
              </button>
              <button onClick={handleBulkDelete} disabled={processing === 'bulk'}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm">
                <i className="ri-delete-bin-line mr-1"></i> Xóa tất cả
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl p-16 text-center shadow-sm">
            <i className="ri-file-list-3-line text-6xl text-gray-300 block mb-3"></i>
            <p className="text-gray-500">Không có bài viết nào</p>
          </div>
        ) : (
          <>
            {/* Select all row */}
            <div className="bg-white rounded-xl shadow-sm mb-2 px-5 py-3 flex items-center gap-3">
              <input type="checkbox" checked={selected.size === posts.length}
                onChange={toggleAll} className="rounded w-4 h-4 cursor-pointer" />
              <span className="text-sm text-gray-500">Chọn tất cả ({posts.length})</span>
            </div>

            <div className="space-y-2">
              {posts.map(post => (
                <div key={post.id} className={`bg-white rounded-xl shadow-sm p-4 flex gap-3 ${post.status === 'hidden' ? 'opacity-60' : ''}`}>
                  <input type="checkbox" checked={selected.has(post.id)}
                    onChange={() => toggleSelect(post.id)}
                    className="rounded w-4 h-4 mt-1 cursor-pointer flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {post.status === 'hidden' ? (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded flex items-center gap-1">
                          <i className="ri-eye-off-line"></i> Đã ẩn
                        </span>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Hiển thị</span>
                      )}
                      <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded">
                        {categoryLabel[post.category] || post.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{post.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1">{post.content?.replace(/<[^>]+>/g, '')}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                      <span>{post.isAnonymous ? 'Ẩn danh' : (post.user?.fullName || post.user?.username)}</span>
                      <span><i className="ri-heart-line mr-0.5"></i>{post.likeCount}</span>
                      <span><i className="ri-chat-1-line mr-0.5"></i>{post._count?.comments || 0}</span>
                      <span><i className="ri-eye-line mr-0.5"></i>{post.viewCount}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                      <Link href={`/forum/${post.id}`} target="_blank"
                        className="text-purple-500 hover:underline ml-auto flex items-center gap-1">
                        <i className="ri-external-link-line"></i> Xem
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    {post.status === 'hidden' ? (
                      <button onClick={() => handleUnhide(post.id)} disabled={processing === post.id}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-xs whitespace-nowrap">
                        {processing === post.id ? '...' : 'Hiện lại'}
                      </button>
                    ) : (
                      <button onClick={() => handleHide(post.id)} disabled={processing === post.id}
                        className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 text-xs whitespace-nowrap">
                        {processing === post.id ? '...' : 'Ẩn bài'}
                      </button>
                    )}
                    <button onClick={() => handleDelete(post.id)} disabled={processing === post.id}
                      className="px-3 py-1.5 border border-red-300 text-red-500 rounded-lg hover:bg-red-50 disabled:opacity-50 text-xs whitespace-nowrap">
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => loadPosts(p)}
                    className={`w-10 h-10 rounded-lg text-sm ${p === page ? 'bg-red-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                    {p}
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
