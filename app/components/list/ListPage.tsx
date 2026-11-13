'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { search as searchApi } from '../../../lib/api';
import { captureUserLocation, clearUserLocation, distanceKm, formatDistance, getUserLocation, type UserLocation } from '../../../lib/userLocation';
import type { ListingType } from '../../../lib/format';
import ListingCard from '../ListingCard';

export interface LoadArgs {
  search: string;
  sub: string;
  quick: string;
  sortBy: string;
  page: number;
  userLoc: UserLocation | null;
}

export interface ListConfig {
  basePath: string;                 // e.g. /products
  subParam: string;                 // URL param that holds the sub-category
  title: string;                    // heading without a search
  crumb: string;                    // breadcrumb label
  noun: string;                     // "tin", "tin tuyển dụng"
  entity: string;                   // used in the empty state: "sản phẩm"
  createHref: string;
  createLabel: string;
  placeholder: string;
  type: ListingType;
  logKind: string;
  subCats: { value: string; name: string }[];
  quickFilters: { value: string; label: string }[];
  popular: string[];
  load: (a: LoadArgs) => Promise<any>;
  matchQuick?: (item: any, quick: string) => boolean;
  safety: string;
}

const DAY = 86400000;
const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

// Shared by every list page: pass these to the API when "Gần bạn" is on.
export function nearParams(quick: string, userLoc: UserLocation | null) {
  return quick === 'near' && userLoc ? { nearLat: userLoc.latitude, nearLng: userLoc.longitude, radiusKm: 30 } : {};
}

export default function ListPage(config: ListConfig) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <Inner {...config} />
    </Suspense>
  );
}

function Inner(c: ListConfig) {
  const params = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState(params.get('search') || '');
  const [query, setQuery] = useState(params.get('search') || '');
  const [sub, setSub] = useState(params.get(c.subParam) || '');
  const [quick, setQuick] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [userLoc, setUserLoc] = useState<UserLocation | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    setUserLoc(getUserLocation());
    const onChange = () => setUserLoc(getUserLocation());
    window.addEventListener('userLocation:changed', onChange);
    return () => window.removeEventListener('userLocation:changed', onChange);
  }, []);

  // The URL is the source of truth for the keyword and the sub-category.
  useEffect(() => {
    const s = params.get('search') || '';
    setText(s); setQuery(s); setSub(params.get(c.subParam) || ''); setPage(1);
  }, [params, c.subParam]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    c.load({ search: query, sub, quick, sortBy, page, userLoc })
      .then(res => {
        if (cancelled) return;
        setItems(res?.data || []);
        setTotal(res?.total || 0);
        setTotalPages(res?.totalPages || 1);
      })
      .catch(() => { if (!cancelled) { setItems([]); setTotal(0); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sub, quick, sortBy, page, userLoc]);

  const go = (nextSearch: string, nextSub: string) => {
    const q = new URLSearchParams();
    if (nextSearch) q.set('search', nextSearch);
    if (nextSub) q.set(c.subParam, nextSub);
    router.replace(c.basePath + (q.toString() ? `?${q}` : ''));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = text.trim();
    if (s) searchApi.log(s, c.logKind);
    go(s, sub);
  };

  const visible = useMemo(() => {
    const withDist = items.map(i =>
      userLoc && typeof i.latitude === 'number' && typeof i.longitude === 'number'
        ? { ...i, _distanceKm: distanceKm(userLoc, { latitude: i.latitude, longitude: i.longitude }) }
        : i,
    );
    let out = withDist.filter(i => {
      if (c.matchQuick && c.matchQuick(i, quick) === false) return false;
      if (quick === 'vip') return !!i.isVip;
      if (quick === 'image') return (i.images?.length || 0) > 0;
      if (quick === 'today') return Date.now() - new Date(i.createdAt).getTime() < DAY;
      if (quick === 'near') {
        if (userLoc && typeof i._distanceKm === 'number') return i._distanceKm <= 30;
        return `${i.location || ''} ${i.address || ''}`.toLowerCase().includes('nhân cơ');
      }
      return true;
    });
    if (quick === 'near' && userLoc) out = [...out].sort((a, b) => (a._distanceKm ?? 999) - (b._distanceKm ?? 999));
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, quick, userLoc]);

  const locate = async () => {
    setLocating(true);
    const loc = await captureUserLocation();
    setLocating(false);
    if (!loc) alert('Không lấy được vị trí. Hãy cho phép trình duyệt dùng GPS.');
  };

  const filtered = !!(query || sub);

  return (
    <div className="min-h-screen bg-paper pb-8">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto max-w-content px-4 pb-4 pt-4 sm:px-6">
          <nav className="mb-2 flex items-center gap-1 text-[13px] text-ink-faint" aria-label="Đường dẫn">
            <Link href="/" className="hover:text-ink">Trang chủ</Link>
            <i className="ri-arrow-right-s-line" aria-hidden="true" />
            <span className="text-ink-soft">{c.crumb}</span>
          </nav>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-[1.4rem] font-bold leading-tight text-ink sm:text-3xl">
                {query ? `Kết quả cho “${query}”` : c.title}
              </h1>
              <p className="mt-1 text-[13px] text-ink-faint"><b className="text-ink">{fmt(total)}</b> {c.noun} tại Đắk Nông</p>
            </div>
            <Link href={c.createHref} className="btn-primary hidden shrink-0 sm:inline-flex">
              <i className="ri-add-line" aria-hidden="true" /> Đăng tin
            </Link>
          </div>

          <form onSubmit={submit} className="mt-4 flex gap-2" role="search">
            <div className="relative min-w-0 flex-1">
              <i className="ri-search-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
              <input value={text} onChange={e => setText(e.target.value)} placeholder={c.placeholder} aria-label="Tìm kiếm" className="field !pl-9" />
            </div>
            <button type="submit" className="btn-forest shrink-0 px-5">Tìm</button>
          </form>

          <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {c.subCats.map(s => (
              <button key={s.value} onClick={() => go(query, s.value)} className={`chip shrink-0 ${sub === s.value ? 'chip-active' : ''}`}>{s.name}</button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-content px-4 pt-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {c.quickFilters.map(f => (
              <button key={f.value} onClick={() => { setQuick(f.value); setPage(1); }}
                className={`chip shrink-0 ${quick === f.value ? 'chip-active' : ''}`}>{f.label}</button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3 text-[13px]">
            <button onClick={userLoc ? clearUserLocation : locate} disabled={locating}
              className={`inline-flex items-center gap-1 font-semibold ${userLoc ? 'text-forest-700' : 'text-ink-soft hover:text-ink'} disabled:opacity-50`}>
              <i className={locating ? 'ri-loader-4-line animate-spin' : userLoc ? 'ri-map-pin-2-fill' : 'ri-map-pin-line'} aria-hidden="true" />
              {locating ? 'Đang lấy vị trí' : userLoc ? 'Đã có vị trí' : 'Vị trí của tôi'}
            </button>
            <label className="flex items-center gap-1.5 text-ink-soft">
              <span className="sr-only sm:not-sr-only">Sắp xếp</span>
              <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
                className="rounded-lg border border-line bg-surface px-2 py-1.5 font-medium text-ink focus:border-forest-500 focus:outline-none">
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá thấp trước</option>
                <option value="price_desc">Giá cao trước</option>
                <option value="popular">Xem nhiều</option>
              </select>
            </label>
          </div>
        </div>

        {loading ? (
          <Grid>{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}</Grid>
        ) : visible.length === 0 ? (
          <Empty c={c} filtered={filtered || !!quick} onClear={() => { setQuick(''); go('', ''); }} />
        ) : (
          <Grid>
            {visible.map(i => (
              <ListingCard key={i.id} item={i} type={c.type}
                distanceLabel={typeof i._distanceKm === 'number' ? formatDistance(i._distanceKm) : undefined} />
            ))}
          </Grid>
        )}

        {totalPages > 1 && !loading && <Pager page={page} totalPages={totalPages} onPage={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}

        {!loading && !filtered && visible.length < 8 && (
          <section className="mt-8 rounded-card border border-line bg-surface p-4 sm:p-5">
            <h2 className="text-[15px] font-bold text-ink">Tìm nhanh</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {c.popular.map(p => (
                <Link key={p} href={`${c.basePath}?search=${encodeURIComponent(p)}`} className="chip">{p}</Link>
              ))}
            </div>
          </section>
        )}

        <p className="mt-8 flex items-start gap-2 text-[13px] leading-snug text-ink-soft">
          <i className="ri-shield-check-line mt-0.5 text-forest-700" aria-hidden="true" />
          <span>{c.safety} <Link href="/canh-bao" className="font-semibold text-forest-700 underline">Xem cảnh báo lừa đảo</Link></span>
        </p>
      </div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">{children}</div>;
}

function Skeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-card border border-line bg-surface">
      <div className="aspect-[4/3] bg-paper" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-4/5 rounded bg-paper" />
        <div className="h-4 w-1/2 rounded bg-paper" />
        <div className="h-3 w-2/3 rounded bg-paper" />
      </div>
    </div>
  );
}

function Empty({ c, filtered, onClear }: { c: ListConfig; filtered: boolean; onClear: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-card border border-line bg-surface px-6 py-12 text-center">
      <i className="ri-search-eye-line text-4xl text-ink-faint" aria-hidden="true" />
      <h2 className="mt-3 text-lg font-bold text-ink">{filtered ? 'Không có tin phù hợp' : `Chưa có ${c.entity} nào`}</h2>
      <p className="mt-1 text-sm text-ink-soft">{filtered ? 'Thử từ khóa khác hoặc bỏ bớt bộ lọc.' : 'Hãy là người đầu tiên đăng tin ở đây.'}</p>
      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
        {filtered && <button onClick={onClear} className="btn-ghost">Xóa bộ lọc</button>}
        <Link href={c.createHref} className="btn-primary">{c.createLabel}</Link>
      </div>
    </div>
  );
}

function Pager({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const nums = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i);
  const base = 'grid h-9 min-w-9 place-items-center rounded-lg border border-line bg-surface px-2 text-sm font-semibold text-ink-soft hover:border-forest-500 disabled:opacity-40';
  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Phân trang">
      <button className={base} disabled={page === 1} onClick={() => onPage(page - 1)} aria-label="Trang trước"><i className="ri-arrow-left-s-line" /></button>
      {nums.map(n => (
        <button key={n} onClick={() => onPage(n)} aria-current={n === page ? 'page' : undefined}
          className={`${base} ${n === page ? '!border-forest-600 !bg-forest-600 !text-white' : ''}`}>{n}</button>
      ))}
      <button className={base} disabled={page === totalPages} onClick={() => onPage(page + 1)} aria-label="Trang sau"><i className="ri-arrow-right-s-line" /></button>
    </nav>
  );
}
