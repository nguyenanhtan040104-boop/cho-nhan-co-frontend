'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { forum } from '../../lib/api';

const categoryOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'NONG_NGHIEP', label: 'Nông nghiệp' },
  { value: 'CHAN_NUOI', label: 'Chăn nuôi' },
  { value: 'THI_TRUONG', label: 'Thị trường' },
  { value: 'KY_THUAT', label: 'Kỹ thuật' },
  { value: 'KINH_NGHIEM', label: 'Kinh nghiệm' },
  { value: 'KHAC', label: 'Khác' },
];

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Phổ biến' },
  { value: 'most_comments', label: 'Nhiều bình luận' },
];

export default function ForumPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const loadData = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit: 15, sortBy };
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await forum.getAll(params);
      if (p === 1) setPosts(res.data || []);
      else setPosts(prev => [...prev, ...(res.data || [])]);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setPage(p);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [search, category, sortBy]);

  useEffect(() => { loadData(1); }, [loadData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Diễn đàn</h1>
              <p className="text-gray-500 text-sm mt-1">{total} bài viết</p>
            </div>
            <Link href="/forum/create" className="bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700 text-sm font-medium whitespace-nowrap">
              + Viết bài
            </Link>
          </div>

          <form onSubmit={e => { e.preventDefault(); loadData(1); }} className="flex gap-2 mb-4">
            <input type="text" placeholder="Tìm kiếm bài viết..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
            <button type="submit" className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 text-sm">Tìm</button>
          </form>

          <div className="flex flex-wrap gap-2">
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
              {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading && posts.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl p-16 text-center shadow-sm">
            <i className="ri-chat-3-line text-6xl text-gray-300 block mb-3"></i>
            <p className="text-gray-500 mb-4">Chưa có bài viết nào</p>
            <Link href="/forum/create" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 text-sm">
              Viết bài đầu tiên
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {posts.map(post => (
                <Link key={post.id} href={`/forum/${post.id}`}
                  className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {post.isAnonymous ? (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <i className="ri-user-line text-gray-500"></i>
                      </div>
                    ) : post.user?.avatarUrl ? (
                      <img src={post.user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
                        {post.user?.fullName?.[0] || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        {post.isPinned && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded mr-2">Ghim</span>}
                        <h3 className="font-semibold text-gray-900 inline">{post.title}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.content?.replace(/<[^>]+>/g, '')}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>{post.isAnonymous ? 'Ẩn danh' : post.user?.fullName}</span>
                      {post.category && <span className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">{post.category}</span>}
                      <span><i className="ri-heart-line mr-0.5"></i>{post.likeCount}</span>
                      <span><i className="ri-chat-1-line mr-0.5"></i>{post._count?.comments || 0}</span>
                      <span><i className="ri-eye-line mr-0.5"></i>{post.viewCount}</span>
                      <span className="ml-auto">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </Link>
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
