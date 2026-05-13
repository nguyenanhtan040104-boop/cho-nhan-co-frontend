'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forum, auth } from '../../../lib/api';

export default function ModerationPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string | null; isBulk: boolean }>({ id: null, isBulk: false });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.replace('/profile'); return; }
    loadPosts(1);
  }, []);

  const loadPosts = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await forum.getPendingPosts({ page: p, limit: 20 });
      setPosts(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setPage(p);
      setSelected(new Set());
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === posts.length) setSelected(new Set());
    else setSelected(new Set(posts.map(p => p.id)));
  }

  async function handleApprove(id: string) {
    setProcessing(id);
    try {
      await forum.approvePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      setTotal(prev => prev - 1);
    } catch (e: any) { alert(e.message || 'Lỗi'); }
    finally { setProcessing(null); }
  }

  async function handleReject(id: string, reason: string) {
    setProcessing(id);
    try {
      await forum.rejectPost(id, reason);
      setPosts(prev => prev.filter(p => p.id !== id));
      setTotal(prev => prev - 1);
    } catch (e: any) { alert(e.message || 'Lỗi'); }
    finally { setProcessing(null); setRejectModal({ id: null, isBulk: false }); setRejectReason(''); }
  }

  async function handleBulkApprove() {
    if (selected.size === 0) return;
    setProcessing('bulk');
    try {
      await forum.bulkApprove([...selected]);
      setPosts(prev => prev.filter(p => !selected.has(p.id)));
      setTotal(prev => prev - selected.size);
      setSelected(new Set());
    } catch (e: any) { alert(e.message || 'Lỗi'); }
    finally { setProcessing(null); }
  }

  async function handleBulkReject(reason: string) {
    setProcessing('bulk');
    try {
      await forum.bulkReject([...selected], reason);
      setPosts(prev => prev.filter(p => !selected.has(p.id)));
      setTotal(prev => prev - selected.size);
      setSelected(new Set());
    } catch (e: any) { alert(e.message || 'Lỗi'); }
    finally { setProcessing(null); setRejectModal({ id: null, isBulk: false }); setRejectReason(''); }
  }

  const categoryLabel: Record<string, string> = {
    NONG_NGHIEP: 'Nông nghiệp', CHAN_NUOI: 'Chăn nuôi', THI_TRUONG: 'Thị trường',
    KY_THUAT: 'Kỹ thuật', KINH_NGHIEM: 'Kinh nghiệm', KHAC: 'Khác',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center gap-4">
          <Link href="/admin/dashboard" className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">
            <i className="ri-arrow-left-line text-lg"></i>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Kiểm duyệt nội dung</h1>
            <p className="text-gray-500 text-sm">{total} bài chờ duyệt</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4 flex items-center gap-3">
            <span className="text-sm font-medium text-purple-700">Đã chọn {selected.size} bài</span>
            <div className="ml-auto flex gap-2">
              <button
                onClick={handleBulkApprove}
                disabled={processing === 'bulk'}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                <i className="ri-check-line mr-1"></i> Duyệt tất cả
              </button>
              <button
                onClick={() => setRejectModal({ id: null, isBulk: true })}
                disabled={processing === 'bulk'}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm"
              >
                <i className="ri-close-line mr-1"></i> Từ chối tất cả
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl p-16 text-center shadow-sm">
            <i className="ri-checkbox-circle-line text-6xl text-green-300 block mb-3"></i>
            <p className="text-gray-500">Không có bài nào chờ duyệt</p>
          </div>
        ) : (
          <>
            {/* Select all */}
            <div className="bg-white rounded-xl shadow-sm mb-2 px-5 py-3 flex items-center gap-3 border-b">
              <input type="checkbox" checked={selected.size === posts.length}
                onChange={toggleAll} className="rounded w-4 h-4 cursor-pointer" />
              <span className="text-sm text-gray-500">Chọn tất cả</span>
            </div>

            <div className="space-y-3">
              {posts.map(post => (
                <div key={post.id} className="bg-white rounded-xl shadow-sm p-5 flex gap-4">
                  <input type="checkbox" checked={selected.has(post.id)}
                    onChange={() => toggleSelect(post.id)}
                    className="rounded w-4 h-4 mt-1 cursor-pointer flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Chờ duyệt</span>
                      <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded">
                        {categoryLabel[post.category] || post.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{post.content?.replace(/<[^>]+>/g, '')}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>{post.user?.fullName || post.user?.username || 'Ẩn danh'}</span>
                      <span>{new Date(post.createdAt).toLocaleString('vi-VN')}</span>
                      <Link href={`/forum/${post.id}`} target="_blank"
                        className="text-purple-500 hover:underline flex items-center gap-1">
                        <i className="ri-external-link-line"></i> Xem
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(post.id)}
                      disabled={processing === post.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm whitespace-nowrap"
                    >
                      {processing === post.id ? '...' : 'Duyệt'}
                    </button>
                    <button
                      onClick={() => setRejectModal({ id: post.id, isBulk: false })}
                      disabled={processing === post.id}
                      className="px-4 py-2 border border-red-300 text-red-500 rounded-lg hover:bg-red-50 disabled:opacity-50 text-sm whitespace-nowrap"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => loadPosts(p)}
                    className={`w-10 h-10 rounded-lg text-sm ${p === page ? 'bg-purple-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Reject modal */}
      {rejectModal.id !== null || rejectModal.isBulk ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Lý do từ chối</h3>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối (tùy chọn)..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectModal({ id: null, isBulk: false }); setRejectReason(''); }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (rejectModal.isBulk) handleBulkReject(rejectReason);
                  else if (rejectModal.id) handleReject(rejectModal.id, rejectReason);
                }}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
