'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { forum, auth } from '../../lib/api';
import { timeAgo } from '../../lib/format';

const REPORT_TYPES = [
  { value: '', label: 'Tất cả' },
  { value: 'Lừa đảo mua bán', label: 'Lừa đảo mua bán' },
  { value: 'Giả mạo danh tính', label: 'Giả mạo danh tính' },
  { value: 'Lừa đảo đặt cọc', label: 'Lừa đảo đặt cọc' },
  { value: 'Hàng giả', label: 'Hàng giả, kém chất lượng' },
  { value: 'Khác', label: 'Khác' },
];

const SORTS = [
  { v: 'newest', l: 'Mới nhất' },
  { v: 'popular', l: 'Xem nhiều' },
  { v: 'most_comments', l: 'Nhiều bình luận' },
];

const TIPS = [
  'Ghi lại số điện thoại, tài khoản ngân hàng của đối tượng nếu có.',
  'Chụp màn hình tin nhắn và biên lai chuyển khoản làm bằng chứng.',
  'Trình báo công an địa phương khi bị thiệt hại về tài sản.',
  'Không chuyển tiền trước khi nhận hàng hoặc kiểm tra thực tế.',
  'Cảnh giác với giá quá rẻ hoặc ưu đãi bất thường.',
];

const PG = 'grid h-9 min-w-9 place-items-center rounded-lg border border-line bg-surface hover:border-forest-500 disabled:opacity-40';

function CanhBaoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState(searchParams.get('search') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sub, setSub] = useState(searchParams.get('sub') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => { setLoggedIn(auth.isLoggedIn()); }, []);
  useEffect(() => { setSub(searchParams.get('sub') || ''); }, [searchParams]);

  const loadData = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit: 15, sortBy, category: 'CANH_BAO' };
      const kw = [search, sub].filter(Boolean).join(' ');
      if (kw) params.search = kw;
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
  }, [search, sub, sortBy]);

  useEffect(() => { loadData(1); }, [loadData]);

  const pickSub = (v: string) => {
    setSub(v);
    setSearch('');
    setText('');
    router.replace(v ? `/canh-bao?sub=${encodeURIComponent(v)}` : '/canh-bao');
  };

  const createHref = loggedIn ? '/canh-bao/create' : '/profile';
  const filtered = !!(search || sub);

  return (
    <div className="min-h-screen bg-paper pb-10">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto max-w-content px-4 pb-4 pt-4 sm:px-6">
          <nav className="mb-2 flex items-center gap-1 text-[13px] text-ink-faint" aria-label="Đường dẫn">
            <Link href="/" className="hover:text-ink">Trang chủ</Link>
            <i className="ri-arrow-right-s-line" aria-hidden="true" />
            <span className="text-ink-soft">Cảnh báo</span>
          </nav>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="text-[1.4rem] font-bold leading-tight text-ink sm:text-3xl">Cảnh báo lừa đảo</h1>
              <p className="mt-1 text-[13px] text-ink-faint"><b className="text-ink">{total.toLocaleString('vi-VN')}</b> cảnh báo từ cộng đồng, cùng nhau tránh bị lừa</p>
            </div>
            <Link href={createHref} className="btn-primary hidden shrink-0 sm:inline-flex"><i className="ri-alarm-warning-line" aria-hidden="true" /> Đăng cảnh báo</Link>
          </div>

          <form onSubmit={e => { e.preventDefault(); setSub(''); setSearch(text.trim()); }} className="mt-4 flex gap-2" role="search">
            <div className="relative min-w-0 flex-1">
              <i className="ri-search-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
              <input value={text} onChange={e => setText(e.target.value)} placeholder="Tìm tên, số tài khoản, số điện thoại..." aria-label="Tìm cảnh báo" className="field !pl-9" />
            </div>
            <button type="submit" className="btn-forest shrink-0 px-5">Tìm</button>
          </form>

          <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {REPORT_TYPES.map(t => (
              <button key={t.value} onClick={() => pickSub(t.value)} className={`chip shrink-0 ${sub === t.value ? 'chip-active' : ''}`}>{t.label}</button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-content gap-6 px-4 pt-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <main className="min-w-0">
          <p className="mb-3 flex gap-2 rounded-card border border-gold-200 bg-gold-50 p-3 text-[13px] leading-snug text-gold-800">
            <i className="ri-information-line mt-0.5 shrink-0" aria-hidden="true" />
            <span>Các bài đăng do cộng đồng chia sẻ và chưa được kiểm chứng pháp lý. Nếu bị thiệt hại tài sản, hãy trình báo công an để được hỗ trợ.</span>
          </p>

          <div className="mb-3 flex gap-4 text-[13px]" role="tablist" aria-label="Sắp xếp">
            {SORTS.map(s => (
              <button key={s.v} role="tab" aria-selected={sortBy === s.v} onClick={() => setSortBy(s.v)}
                className={`border-b-2 pb-1 font-semibold ${sortBy === s.v ? 'border-forest-600 text-forest-700' : 'border-transparent text-ink-soft hover:text-ink'}`}>{s.l}</button>
            ))}
          </div>

          {loading && posts.length === 0 ? (
            <ul className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="card animate-pulse space-y-2 p-4"><div className="h-4 w-4/5 rounded bg-paper" /><div className="h-3 w-1/2 rounded bg-paper" /></li>
              ))}
            </ul>
          ) : posts.length === 0 ? (
            <div className="card px-6 py-12 text-center">
              <i className="ri-shield-check-line text-4xl text-ink-faint" aria-hidden="true" />
              <h2 className="mt-2 text-lg font-bold text-ink">{filtered ? 'Không có cảnh báo phù hợp' : 'Chưa có cảnh báo nào'}</h2>
              <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                {filtered && <button onClick={() => pickSub('')} className="btn-ghost">Xóa bộ lọc</button>}
                <Link href={createHref} className="btn-primary">Đăng cảnh báo</Link>
              </div>
            </div>
          ) : (
            <ul className="space-y-2">
              {posts.map(p => {
                const thumb = p.images?.[0]?.url || (typeof p.images?.[0] === 'string' ? p.images[0] : null);
                return (
                  <li key={p.id}>
                    <Link href={`/forum/${p.id}`} className="card flex gap-3 border-l-4 !border-l-brand-500 p-4 transition-colors hover:border-forest-500 hover:!border-l-brand-500">
                      <div className="min-w-0 flex-1">
                        <h2 className="line-clamp-2 text-[16px] font-semibold leading-snug text-ink">{p.title}</h2>
                        <p className="mt-2 flex flex-wrap items-center gap-x-3 text-[12px] text-ink-faint">
                          {p.user?.fullName && <span className="max-w-[10rem] truncate">{p.user.fullName}</span>}
                          <span>{timeAgo(p.createdAt)}</span>
                          <span><i className="ri-eye-line" aria-hidden="true" /> {p.viewCount || 0}</span>
                          <span><i className="ri-chat-3-line" aria-hidden="true" /> {p.commentCount || p._count?.comments || 0}</span>
                        </p>
                      </div>
                      {thumb && <img src={thumb} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded-lg object-cover" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {totalPages > 1 && !loading && (
            <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Phân trang">
              <button className={PG} disabled={page === 1} onClick={() => loadData(page - 1)} aria-label="Trang trước"><i className="ri-arrow-left-s-line" /></button>
              <span className="px-2 text-sm text-ink-soft">Trang <b className="text-ink">{page}</b> / {totalPages}</span>
              <button className={PG} disabled={page === totalPages} onClick={() => loadData(page + 1)} aria-label="Trang sau"><i className="ri-arrow-right-s-line" /></button>
            </nav>
          )}
        </main>

        <aside className="space-y-4">
          <section className="card p-4">
            <h2 className="text-[15px] font-bold text-ink">Cách tự bảo vệ</h2>
            <ol className="mt-3 space-y-2.5">
              {TIPS.map((t, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] leading-snug text-ink-soft">
                  <span className="w-4 shrink-0 font-bold text-forest-700">{i + 1}.</span><span>{t}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className="card p-4">
            <h2 className="text-[15px] font-bold text-ink">Số khẩn cấp</h2>
            <dl className="mt-2 divide-y divide-line text-sm">
              {[['Công an', '113'], ['Cứu hỏa', '114'], ['Cấp cứu', '115']].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-2">
                  <dt className="text-ink-soft">{k}</dt>
                  <dd><a href={`tel:${v}`} className="font-bold tabular-nums text-forest-700">{v}</a></dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default function CanhBaoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <CanhBaoContent />
    </Suspense>
  );
}
