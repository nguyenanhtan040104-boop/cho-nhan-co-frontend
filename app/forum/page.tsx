'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { forum, auth } from '../../lib/api';
import { timeAgo } from '../../lib/format';
import PostOptionsMenu from '../components/PostOptionsMenu';
import { FORUM_CATEGORIES, forumCategoryLabel } from './categories';

const SORTS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Phổ biến' },
  { value: 'most_comments', label: 'Nhiều bình luận' },
];

const PG = 'grid h-9 min-w-9 place-items-center rounded-lg border border-line bg-surface hover:border-forest-500 disabled:opacity-40';

export default function ForumPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <ForumContent />
    </Suspense>
  );
}

function ForumContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [bulkMode, setBulkMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => { setLoggedIn(auth.isLoggedIn()); }, []);
  useEffect(() => { setCategory(searchParams.get('category') || ''); }, [searchParams]);

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
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, sortBy]);

  useEffect(() => { loadData(1); }, [loadData]);

  const toggle = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  async function bulkDelete() {
    if (!selected.size || !confirm(`Xóa ${selected.size} bài?`)) return;
    setDeleting(true);
    try {
      await Promise.all([...selected].map(id => forum.delete(id)));
      setPosts(prev => prev.filter(p => !selected.has(p.id)));
      setSelected(new Set());
      setBulkMode(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setDeleting(false);
    }
  }

  const pickCategory = (value: string) => {
    setCategory(value);
    router.replace(value ? `/forum?category=${value}` : '/forum');
  };

  return (
    <div className="min-h-screen bg-paper pb-10">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto max-w-content px-4 pb-4 pt-4 sm:px-6">
          <nav className="mb-2 flex items-center gap-1 text-[13px] text-ink-faint" aria-label="Đường dẫn">
            <Link href="/" className="hover:text-ink">Trang chủ</Link>
            <i className="ri-arrow-right-s-line" aria-hidden="true" />
            <span className="text-ink-soft">Diễn đàn</span>
          </nav>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="text-[1.4rem] font-bold leading-tight text-ink sm:text-3xl">Diễn đàn cộng đồng</h1>
              <p className="mt-1 text-[13px] text-ink-faint"><b className="text-ink">{total.toLocaleString('vi-VN')}</b> bài viết · hỏi đáp, kinh nghiệm canh tác, chăn nuôi</p>
            </div>
            <Link href="/forum/create" className="btn-primary hidden shrink-0 sm:inline-flex"><i className="ri-edit-line" aria-hidden="true" /> Viết bài</Link>
          </div>

          <form onSubmit={e => { e.preventDefault(); setSearch(text.trim()); }} className="mt-4 flex gap-2" role="search">
            <div className="relative min-w-0 flex-1">
              <i className="ri-search-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
              <input value={text} onChange={e => setText(e.target.value)} placeholder="Tìm bài viết, câu hỏi..." aria-label="Tìm bài viết" className="field !pl-9" />
            </div>
            <button type="submit" className="btn-forest shrink-0 px-5">Tìm</button>
          </form>

          <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {FORUM_CATEGORIES.map(c => (
              <button key={c.value} onClick={() => pickCategory(c.value)} className={`chip shrink-0 ${category === c.value ? 'chip-active' : ''}`}>{c.label}</button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 pt-4 sm:px-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-[13px]">
          <div className="no-scrollbar flex gap-4 overflow-x-auto" role="tablist" aria-label="Sắp xếp">
            {SORTS.map(s => (
              <button key={s.value} role="tab" aria-selected={sortBy === s.value} onClick={() => setSortBy(s.value)}
                className={`shrink-0 border-b-2 pb-1 font-semibold ${sortBy === s.value ? 'border-forest-600 text-forest-700' : 'border-transparent text-ink-soft hover:text-ink'}`}>{s.label}</button>
            ))}
          </div>
          {loggedIn && (
            <div className="ml-auto flex items-center gap-3">
              {bulkMode && selected.size > 0 && (
                <button onClick={bulkDelete} disabled={deleting} className="font-semibold text-brand-600 disabled:opacity-50">{deleting ? 'Đang xóa...' : `Xóa ${selected.size} bài`}</button>
              )}
              <button onClick={() => { setBulkMode(!bulkMode); setSelected(new Set()); }} className="font-semibold text-ink-soft hover:text-ink">{bulkMode ? 'Thoát chọn' : 'Chọn nhiều'}</button>
            </div>
          )}
        </div>

        {loading && posts.length === 0 ? (
          <ul className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="card animate-pulse space-y-2 p-4">
                <div className="h-3 w-24 rounded bg-paper" />
                <div className="h-4 w-4/5 rounded bg-paper" />
                <div className="h-3 w-2/3 rounded bg-paper" />
              </li>
            ))}
          </ul>
        ) : posts.length === 0 ? (
          <div className="card px-6 py-12 text-center">
            <i className="ri-chat-3-line text-4xl text-ink-faint" aria-hidden="true" />
            <h2 className="mt-2 text-lg font-bold text-ink">{search || category ? 'Không có bài phù hợp' : 'Chưa có bài viết nào'}</h2>
            <p className="mt-1 text-sm text-ink-soft">{search || category ? 'Thử từ khóa khác hoặc xem tất cả chuyên mục.' : 'Hãy là người đầu tiên chia sẻ.'}</p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              {(search || category) && <button onClick={() => { setText(''); setSearch(''); pickCategory(''); }} className="btn-ghost">Xóa bộ lọc</button>}
              <Link href="/forum/create" className="btn-primary">Viết bài</Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {posts.map(p => <Row key={p.id} post={p} bulkMode={bulkMode} selected={selected.has(p.id)} onToggle={() => toggle(p.id)} onDeleted={id => setPosts(prev => prev.filter(x => x.id !== id))} />)}
          </ul>
        )}

        {totalPages > 1 && !loading && (
          <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Phân trang">
            <button className={PG} disabled={page === 1} onClick={() => loadData(page - 1)} aria-label="Trang trước"><i className="ri-arrow-left-s-line" /></button>
            <span className="px-2 text-sm text-ink-soft">Trang <b className="text-ink">{page}</b> / {totalPages}</span>
            <button className={PG} disabled={page === totalPages} onClick={() => loadData(page + 1)} aria-label="Trang sau"><i className="ri-arrow-right-s-line" /></button>
          </nav>
        )}
      </div>
    </div>
  );
}

function Row({ post, bulkMode, selected, onToggle, onDeleted }: { post: any; bulkMode: boolean; selected: boolean; onToggle: () => void; onDeleted: (id: string) => void }) {
  const thumb = post.images?.[0]?.url || (typeof post.images?.[0] === 'string' ? post.images[0] : null);
  const author = post.isAnonymous ? 'Ẩn danh' : (post.user?.fullName || post.user?.username || '');
  const excerpt = (post.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const likes = post.likeCount ?? post._count?.likes ?? 0;
  const comments = post.commentCount ?? post._count?.comments ?? 0;

  return (
    <li className="relative">
      <Link
        href={bulkMode ? '#' : `/forum/${post.id}`}
        onClick={bulkMode ? e => { e.preventDefault(); onToggle(); } : undefined}
        className={`card flex gap-3 p-4 pr-12 transition-colors hover:border-forest-500 ${selected ? '!border-forest-600 !bg-forest-50/50' : ''}`}
      >
        {bulkMode && (
          <span className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded border-2 ${selected ? 'border-forest-600 bg-forest-600 text-white' : 'border-line bg-white'}`}>
            {selected && <i className="ri-check-line text-xs" aria-hidden="true" />}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 text-[12px] font-semibold">
            {post.category && <span className="text-forest-700">{forumCategoryLabel(post.category)}</span>}
            {post.isPinned && <span className="rounded bg-gold-100 px-1.5 py-0.5 text-[11px] text-gold-700">Ghim</span>}
          </p>
          <h2 className="mt-0.5 line-clamp-2 text-[16px] font-semibold leading-snug text-ink">{post.title}</h2>
          {excerpt && <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{excerpt}</p>}
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-ink-faint">
            {author && <span className="max-w-[10rem] truncate">{author}</span>}
            <span>{timeAgo(post.createdAt)}</span>
            <span><i className="ri-heart-line" aria-hidden="true" /> {likes}</span>
            <span><i className="ri-chat-3-line" aria-hidden="true" /> {comments}</span>
          </p>
        </div>
        {thumb && <img src={thumb} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded-lg object-cover sm:h-24 sm:w-24" />}
      </Link>
      {!bulkMode && (
        <div className="absolute right-2 top-2 z-10">
          <PostOptionsMenu postId={post.id} ownerId={post.userId || post.user?.id} onDelete={async id => { await forum.delete(id); onDeleted(id); }} editHref={`/forum/${post.id}/edit`} />
        </div>
      )}
    </li>
  );
}
