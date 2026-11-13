import Link from 'next/link';
import { Metadata } from 'next';
import MarketPriceWidget from './components/MarketPriceWidget';
import AdSponsoredCarousel from './components/AdSponsoredCarousel';
import ListingCard from './components/ListingCard';
import NearbySection from './components/NearbySection';
import { timeAgo } from '../lib/format';
import { mockProducts, mockRealEstate, mockJobs, mockForum, isDev } from '../lib/devMock';

export const metadata: Metadata = {
  title: 'Chợ Nhân Cơ — Mua bán nông sản, bất động sản, việc làm tại Đắk Nông',
  description: 'Chợ Nhân Cơ là nền tảng mua bán trực tuyến cho cộng đồng Nhân Cơ, Đắk Nông.',
  alternates: { canonical: 'https://chonhanco.com' },
};

const API = process.env.NEXT_PUBLIC_API_URL || 'https://cho-nhan-co-backend.onrender.com/api';

async function safeFetch(url: string) {
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch { return []; }
}

// Fall back to sample data in dev when the API is unreachable, so the UI stays reviewable.
const orMock = (real: any[], mock: any[]) => (real.length === 0 && isDev ? mock : real);

async function getHomeData() {
  const [products, vatNuoi, dichVu, realEstate, jobs, forum] = await Promise.all([
    safeFetch(`${API}/products?limit=10&sortBy=newest`),
    safeFetch(`${API}/products?category=VAT_NUOI&limit=5&sortBy=newest`),
    safeFetch(`${API}/products?category=DICH_VU&limit=5&sortBy=newest`),
    safeFetch(`${API}/real-estates?limit=5`),
    safeFetch(`${API}/jobs?limit=5&sortBy=newest`),
    safeFetch(`${API}/forum/posts?limit=6`),
  ]);
  return {
    products: orMock(products, mockProducts),
    vatNuoi: orMock(vatNuoi, mockProducts.slice(0, 3)),
    dichVu,
    realEstate: orMock(realEstate, mockRealEstate),
    jobs: orMock(jobs, mockJobs),
    forum: orMock(forum, mockForum),
  };
}

const POPULAR = [
  { label: 'Cà phê', href: '/products?search=cà phê' },
  { label: 'Hồ tiêu', href: '/products?search=tiêu' },
  { label: 'Sầu riêng', href: '/products?search=sầu riêng' },
  { label: 'Macca', href: '/products?search=macca' },
  { label: 'Đất rẫy', href: '/real-estate?type=DAT_NEN' },
  { label: 'Thợ hái cà phê', href: '/jobs?search=hái' },
];

export default async function HomePage() {
  const { products, vatNuoi, dichVu, realEstate, jobs, forum } = await getHomeData();

  return (
    <main className="pb-24 md:pb-8">
      {/* Search first: it is what most visitors came to do */}
      <section className="bg-forest-700 text-white">
        <div className="mx-auto max-w-content px-4 py-6 sm:px-6 sm:py-9">
          <h1 className="text-[1.6rem] font-bold leading-tight sm:text-4xl">Mua bán ngay trong xã Nhân Cơ</h1>
          <p className="mt-1.5 max-w-xl text-[15px] text-forest-100">Nông sản, đất rẫy, việc làm mùa vụ. Đăng tin miễn phí, gặp người bán gần nhà.</p>

          <form action="/products" method="get" role="search" className="mt-5 flex max-w-2xl gap-2">
            <label htmlFor="home-search" className="sr-only">Tìm trên Chợ Nhân Cơ</label>
            <input
              id="home-search"
              name="search"
              type="search"
              placeholder="Bạn đang tìm gì? Ví dụ: cà phê nhân, đất rẫy"
              className="h-12 min-w-0 flex-1 rounded-lg border-0 bg-white px-4 text-[15px] text-ink placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-white/60"
            />
            <button type="submit" className="btn-primary h-12 px-6">Tìm</button>
          </form>

          <p className="mt-3 text-[13px] text-forest-100">
            Tìm nhiều:{' '}
            {POPULAR.map((p, i) => (
              <span key={p.label}>
                <Link href={p.href} className="font-semibold text-white underline decoration-white/40 underline-offset-2 hover:decoration-white">{p.label}</Link>
                {i < POPULAR.length - 1 && <span className="px-1.5 text-forest-300">·</span>}
              </span>
            ))}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-content space-y-9 px-4 pt-5 sm:px-6 sm:pt-6">
        <MarketPriceWidget />

        <NearbySection />

        <Section title="Tin mới đăng" href="/products" empty={products.length === 0} emptyLabel="Chưa có sản phẩm nào">
          <Grid>{products.map((item: any) => <ListingCard key={item.id} item={item} type="product" />)}</Grid>
        </Section>

        <AdSponsoredCarousel />

        <Section title="Nhà đất và vườn rẫy" href="/real-estate" empty={realEstate.length === 0} emptyLabel="Chưa có tin nhà đất">
          <Grid>{realEstate.map((item: any) => <ListingCard key={item.id} item={item} type="real-estate" />)}</Grid>
        </Section>

        <Section title="Việc làm mùa vụ" href="/jobs" empty={jobs.length === 0} emptyLabel="Chưa có tin tuyển dụng">
          <Grid>{jobs.map((item: any) => <ListingCard key={item.id} item={item} type="job" />)}</Grid>
        </Section>

        <Section title="Vật nuôi" href="/vat-nuoi" empty={vatNuoi.length === 0} emptyLabel="Chưa có tin vật nuôi">
          <Grid>{vatNuoi.map((item: any) => <ListingCard key={item.id} item={item} type="product" />)}</Grid>
        </Section>

        {dichVu.length > 0 && (
          <Section title="Dịch vụ" href="/dich-vu" empty={false} emptyLabel="">
            <Grid>{dichVu.map((item: any) => <ListingCard key={item.id} item={item} type="product" />)}</Grid>
          </Section>
        )}

        <Section title="Chuyện của bà con" href="/forum" empty={forum.length === 0} emptyLabel="Chưa có bài viết nào">
          <ul className="divide-y divide-line rounded-card border border-line bg-surface">
            {forum.map((post: any) => <ForumRow key={post.id} post={post} />)}
          </ul>
        </Section>

        <aside className="rounded-card border border-line bg-surface p-4 text-[14px] leading-relaxed text-ink-soft sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-5">
          <p>
            <b className="text-ink">Mua bán an toàn.</b> Gặp trực tiếp, xem hàng rồi mới trả tiền. Không chuyển tiền đặt cọc cho người chưa gặp mặt.
          </p>
          <Link href="/canh-bao" className="mt-2 inline-block shrink-0 font-semibold text-forest-700 underline underline-offset-2 sm:mt-0">Xem cảnh báo lừa đảo</Link>
        </aside>

        <section className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">Có hàng cần bán?</h2>
            <p className="text-[14px] text-ink-soft">Đăng tin trong vài phút. Người mua liên hệ bạn qua Zalo hoặc điện thoại.</p>
          </div>
          <Link href="/dashboard" className="btn-primary shrink-0 px-6 py-3">Đăng tin miễn phí</Link>
        </section>
      </div>
    </main>
  );
}

// ── Page pieces ──────────────────────────────────────────────────────────────

function Section({ title, href, empty, emptyLabel, children }: {
  title: string; href: string; empty: boolean; emptyLabel: string; children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-4 border-b border-line pb-2">
        <h2 className="text-xl font-bold text-ink">{title}</h2>
        <Link href={href} className="whitespace-nowrap text-[14px] font-semibold text-forest-700 hover:underline">Xem tất cả</Link>
      </div>
      {empty ? <EmptyBlock label={emptyLabel} /> : children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">{children}</div>;
}

function ForumRow({ post }: { post: any }) {
  const name = post.user?.fullName || post.user?.username || 'Ẩn danh';
  return (
    <li>
      <Link href={`/forum/${post.id}`} className="block px-4 py-3.5 transition-colors hover:bg-paper">
        <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink">{post.title}</p>
        <p className="mt-1 text-[12px] text-ink-faint">
          {name} · {post.likeCount || 0} thích · {post._count?.comments || 0} bình luận{post.createdAt ? ` · ${timeAgo(post.createdAt)}` : ''}
        </p>
      </Link>
    </li>
  );
}

function EmptyBlock({ label }: { label: string }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-surface px-6 py-8 text-center">
      <p className="text-[15px] font-semibold text-ink">{label}</p>
      <p className="mt-1 text-[13px] text-ink-faint">Bạn có thể là người đầu tiên đăng tin ở mục này.</p>
      <Link href="/dashboard" className="btn-forest mt-4">Đăng tin</Link>
    </div>
  );
}
