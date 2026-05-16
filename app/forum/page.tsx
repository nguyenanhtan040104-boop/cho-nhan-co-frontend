'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { forum, auth } from '../../lib/api';
import PostOptionsMenu from '../components/PostOptionsMenu';
import EmptyState from '../components/EmptyState';

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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 24) return h < 1 ? 'Vừa đăng' : `${h} giờ trước`;
  const d = Math.floor(h / 24);
  return d < 30 ? `${d} ngày trước` : `${Math.floor(d / 30)} tháng trước`;
}

const catColors: any = {
  NONG_NGHIEP: { bg: '#f0fdf4', color: '#166534', label: 'Nông nghiệp' },
  CHAN_NUOI: { bg: '#fff7ed', color: '#9a3412', label: 'Chăn nuôi' },
  THI_TRUONG: { bg: '#eff6ff', color: '#1e40af', label: 'Thị trường' },
  KY_THUAT: { bg: '#fdf4ff', color: '#6b21a8', label: 'Kỹ thuật' },
  KINH_NGHIEM: { bg: '#fefce8', color: '#854d0e', label: 'Kinh nghiệm' },
  KHAC: { bg: '#f9fafb', color: '#374151', label: 'Khác' },
};

export default function ForumPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Đang tải...</div>}>
      <ForumContent />
    </Suspense>
  );
}

function ForumContent() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [bulkMode, setBulkMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const isLoggedIn = typeof window !== 'undefined' && auth.isLoggedIn();
  const currentUserId = typeof window !== 'undefined' ? auth.getCurrentUserId() : null;

  // Đọc query params từ URL (từ header dropdown)
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setCategory(cat);
  }, [searchParams]);

  const loadData = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit: 15, sortBy };
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await forum.getAll(params);
      setPosts(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setPage(p);
    } catch { } finally { setLoading(false); }
  }, [search, category, sortBy]);

  useEffect(() => { loadData(1); }, [loadData]);

  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  async function handleBulkDelete() {
    if (!selected.size || !confirm(`Xóa ${selected.size} bài?`)) return;
    setDeleting(true);
    try {
      await Promise.all([...selected].map(id => forum.delete(id)));
      setPosts(prev => prev.filter(p => !selected.has(p.id)));
      setSelected(new Set()); setBulkMode(false);
    } catch (e: any) { alert(e.message); } finally { setDeleting(false); }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f5f0' }}>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)' }} className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="text-green-300 text-xs uppercase tracking-wider mb-1">Chợ Nhân Cơ</p>
              <h1 className="text-2xl font-bold text-white">Diễn đàn cộng đồng</h1>
              <p className="text-green-200 text-sm mt-1">{total} bài viết · Chia sẻ kinh nghiệm nông nghiệp</p>
            </div>
            <div className="flex gap-2">
              <form onSubmit={e => { e.preventDefault(); loadData(1); }} className="flex gap-2">
                <input type="text" placeholder="Tìm bài viết..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="px-4 py-2 rounded-xl text-sm bg-white/10 backdrop-blur border border-white/20 text-white placeholder-green-200 focus:outline-none focus:bg-white/20 w-52" />
                <button type="submit" className="bg-white text-green-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-50">Tìm</button>
              </form>
              <Link href="/forum/create" className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-400 whitespace-nowrap">
                + Viết bài
              </Link>
            </div>
          </div>
          {/* Filters */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {categoryOptions.map(o => (
              <button key={o.value} onClick={() => setCategory(o.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${category === o.value ? 'bg-white text-green-700' : 'bg-white/15 text-white hover:bg-white/25'}`}>
                {o.label}
              </button>
            ))}
            <div className="ml-auto flex gap-2">
              {sortOptions.map(o => (
                <button key={o.value} onClick={() => setSortBy(o.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${sortBy === o.value ? 'bg-white text-green-700' : 'bg-white/15 text-white hover:bg-white/25'}`}>
                  {o.label}
                </button>
              ))}
            </div>
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

        {loading && posts.length === 0 ? (
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
        ) : posts.length === 0 ? (
          <EmptyState
            keyword={search || category ? (search || category) : undefined}
            entityLabel="bài viết"
            createHref="/forum/create"
            createLabel="+ Viết bài đầu tiên"
            onClearSearch={search || category ? () => { setSearch(''); setCategory(''); } : undefined}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {posts.map(post => (
                <ForumCard key={post.id} post={post} bulkMode={bulkMode} selected={selected.has(post.id)} onToggle={() => toggleSelect(post.id)} onDeleted={id => setPosts(prev => prev.filter(p => p.id !== id))} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => loadData(i + 1)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === i + 1 ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
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

function ForumCard({ post, bulkMode, selected, onToggle, onDeleted }: { post: any; bulkMode: boolean; selected: boolean; onToggle: () => void; currentUserId?: string | null; onDeleted: (id: string) => void }) {
  const cat = catColors[post.category] || catColors.KHAC;
  const thumb = post.images?.[0]?.url || post.images?.[0];

  return (
    <div className="relative group">
      {bulkMode && (
        <button onClick={onToggle}
          className={`absolute top-2 left-2 z-20 w-6 h-6 rounded-md border-2 flex items-center justify-center shadow ${selected ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'}`}>
          {selected && <i className="ri-check-line text-white text-xs"></i>}
        </button>
      )}
      <Link href={bulkMode ? '#' : `/forum/${post.id}`}
        onClick={bulkMode ? (e) => { e.preventDefault(); onToggle(); } : undefined}
        className={`block bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden ${selected ? 'ring-2 ring-green-500' : ''}`}>
        {/* Thumbnail */}
        <div className="relative w-full bg-gray-100" style={{ paddingBottom: '65%' }}>
          {thumb ? (
            <img src={thumb} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${cat.color}22, ${cat.color}44)` }}>
              <i className="ri-article-line text-4xl" style={{ color: cat.color, opacity: 0.5 }}></i>
            </div>
          )}
          {post.category && (
            <span className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: cat.color, color: '#fff' }}>{cat.label}</span>
          )}
          {post.isPinned && <span className="absolute top-2 right-2 text-[10px] bg-yellow-400 text-yellow-900 font-bold px-1.5 py-0.5 rounded">Ghim</span>}
        </div>
        {/* Info */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-snug mb-2">{post.title}</h3>
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-[10px] flex-shrink-0">
                {post.user?.fullName?.[0] || 'U'}
              </div>
              <span className="truncate max-w-[60px]">{post.user?.fullName}</span>
            </div>
            <span className="flex items-center gap-2">
              <span><i className="ri-chat-3-line"></i> {post.commentCount || post._count?.comments || 0}</span>
              <span>{timeAgo(post.createdAt)}</span>
            </span>
          </div>
        </div>
      </Link>
      <div className="absolute top-2 right-2 z-10">
        <PostOptionsMenu postId={post.id} ownerId={post.userId || post.user?.id} onDelete={async (id) => { await forum.delete(id); onDeleted(id); }} editHref={`/forum/${post.id}/edit`} />
      </div>
    </div>
  );
}
