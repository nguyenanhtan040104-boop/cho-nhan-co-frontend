import Link from 'next/link';
import { Metadata } from 'next';
import MarketPriceWidget from './components/MarketPriceWidget';
import AdSponsoredCarousel from './components/AdSponsoredCarousel';
import ListingCard from './components/ListingCard';
import NearbySection from './components/NearbySection';
import { CATEGORIES } from './components/nav-data';
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
    <main className="pb-24 md:pb-6">
      {/* ===== Hero: one job — get people searching ===== */}
      <section className="mx-auto max-w-content px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="relative overflow-hidden rounded-sheet bg-forest-700 px-5 py-8 text-white sm:px-10 sm:py-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-forest-500/40 blur-2xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-forest-400/20 blur-2xl" />
          <div className="relative max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-pill bg-white/15 px-3 py-1 text-[13px] font-semibold">
              <i className="ri-map-pin-2-fill text-forest-200" aria-hidden="true" /> Nhân Cơ, Đắk Nông
            </p>
            <h1 className="mt-4 text-[1.9rem] font-extrabold leading-[1.15] sm:text-5xl">
              Chợ của bà con Nhân Cơ
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-forest-50 sm:text-lg">
              Bán cà phê, tiêu, đất rẫy, tìm thợ hái mùa vụ ngay trong vùng. Đăng tin miễn phí, gặp người mua người bán gần nhà.
            </p>

            <form action="/products" method="get" role="search" className="mt-6 flex max-w-xl gap-2 rounded-pill bg-white p-1.5 shadow-lift">
              <label htmlFor="home-search" className="sr-only">Tìm trên Chợ Nhân Cơ</label>
              <i className="ri-search-line self-center pl-3 text-xl text-ink-faint" aria-hidden="true" />
              <input
                id="home-search"
                name="search"
                type="search"
                placeholder="Bạn đang tìm gì?"
                className="min-w-0 flex-1 bg-transparent px-1 text-[15px] text-ink placeholder-ink-faint focus:outline-none"
              />
              <button type="submit" className="btn-primary px-6">Tìm</button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {POPULAR.map((p) => (
                <Link key={p.label} href={p.href} className="rounded-pill border border-white/25 bg-white/10 px-3 py-1.5 text-[13px] font-semibold text-white transition hover:bg-white/20">
                  {p.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Categories ===== */}
      <section className="mx-auto mt-5 max-w-content px-4 sm:px-6" aria-label="Danh mục">
        <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-9">
          {CATEGORIES.map((c) => (
            <li key={c.href}>
              <Link href={c.href} className="group flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface px-2 py-3.5 text-center shadow-card transition hover:-translate-y-0.5 hover:border-forest-300 hover:shadow-lift">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-forest-100 text-forest-700 transition group-hover:bg-forest-600 group-hover:text-white">
                  <i className={`${c.icon} text-[22px]`} aria-hidden="true" />
                </span>
                <span className="text-[13px] font-bold leading-tight text-ink">{c.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ===== Today's prices + safety ===== */}
      <section className="mx-auto mt-5 grid max-w-content gap-4 px-4 sm:px-6 lg:grid-cols-[1fr_20rem]">
        <MarketPriceWidget />
        <aside className="card p-4 sm:p-5" aria-label="Mua bán an toàn">
          <h2 className="flex items-center gap-2 text-[17px] font-bold text-ink">
            <i className="ri-shield-check-fill text-xl text-forest-600" aria-hidden="true" /> Mua bán an toàn
          </h2>
          <ul className="mt-3 space-y-2 text-[13px] leading-snug text-ink-soft">
            <li className="flex gap-2"><i className="ri-check-line mt-0.5 text-forest-600" aria-hidden="true" />Gặp trực tiếp, xem hàng rồi mới trả tiền.</li>
            <li className="flex gap-2"><i className="ri-check-line mt-0.5 text-forest-600" aria-hidden="true" />Không chuyển tiền đặt cọc cho người chưa gặp mặt.</li>
            <li className="flex gap-2"><i className="ri-check-line mt-0.5 text-forest-600" aria-hidden="true" />Giá rẻ bất thường thường là dấu hiệu lừa đảo.</li>
          </ul>
          <Link href="/canh-bao" className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-brand-600 hover:underline">
            Xem cảnh báo lừa đảo <i className="ri-arrow-right-s-line" aria-hidden="true" />
          </Link>
        </aside>
      </section>

      <div className="mx-auto max-w-content space-y-10 px-4 pt-8 sm:px-6">
        <NearbySection />

        <Section icon="ri-flashlight-line" title="Tin mới đăng" sub="Vừa lên chợ trong ngày" href="/products" empty={products.length === 0} emptyLabel="Chưa có sản phẩm nào">
          <Grid>{products.map((item: any) => <ListingCard key={item.id} item={item} type="product" />)}</Grid>
        </Section>

        <AdSponsoredCarousel />

        <Section icon="ri-home-4-line" title="Nhà đất và vườn rẫy" sub="Đất rẫy, nhà, mặt bằng" href="/real-estate" empty={realEstate.length === 0} emptyLabel="Chưa có tin nhà đất">
          <Grid>{realEstate.map((item: any) => <ListingCard key={item.id} item={item} type="real-estate" />)}</Grid>
        </Section>

        <Section icon="ri-briefcase-4-line" title="Việc làm mùa vụ" sub="Hái cà phê, thu hoạch, làm vườn" href="/jobs" empty={jobs.length === 0} emptyLabel="Chưa có tin tuyển dụng">
          <Grid>{jobs.map((item: any) => <ListingCard key={item.id} item={item} type="job" />)}</Grid>
        </Section>

        <Section icon="ri-bear-smile-line" title="Vật nuôi" sub="Gà, heo, bò, chó mèo" href="/vat-nuoi" empty={vatNuoi.length === 0} emptyLabel="Chưa có tin vật nuôi">
          <Grid>{vatNuoi.map((item: any) => <ListingCard key={item.id} item={item} type="product" />)}</Grid>
        </Section>

        {dichVu.length > 0 && (
          <Section icon="ri-tools-line" title="Dịch vụ" sub="Sửa chữa, vận chuyển, xây dựng" href="/dich-vu" empty={false} emptyLabel="">
            <Grid>{dichVu.map((item: any) => <ListingCard key={item.id} item={item} type="product" />)}</Grid>
          </Section>
        )}

        <Section icon="ri-chat-3-line" title="Chuyện của bà con" sub="Hỏi đáp, kinh nghiệm làm vườn" href="/forum" empty={forum.length === 0} emptyLabel="Chưa có bài viết nào">
          <div className="grid gap-3 md:grid-cols-2">
            {forum.map((post: any) => <ForumRow key={post.id} post={post} />)}
          </div>
        </Section>

        {/* Closing call to action */}
        <section className="overflow-hidden rounded-sheet bg-forest-50 px-6 py-8 text-center sm:py-10">
          <h2 className="text-2xl font-extrabold text-forest-800 sm:text-3xl">Có nông sản cần bán?</h2>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-forest-800/80">Đăng tin trong vài phút, bà con trong vùng sẽ liên hệ bạn qua Zalo hoặc điện thoại.</p>
          <Link href="/dashboard" className="btn-primary mt-5 px-8 py-3 text-base">
            <i className="ri-add-line text-xl" aria-hidden="true" /> Đăng tin miễn phí
          </Link>
        </section>
      </div>
    </main>
  );
}

// ── Page pieces ──────────────────────────────────────────────────────────────

function Section({ icon, title, sub, href, empty, emptyLabel, children }: {
  icon: string; title: string; sub: string; href: string; empty: boolean; emptyLabel: string; children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest-100 text-forest-700">
            <i className={`${icon} text-xl`} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold leading-tight text-ink">{title}</h2>
            <p className="text-[13px] text-ink-faint">{sub}</p>
          </div>
        </div>
        <Link href={href} className="inline-flex items-center gap-0.5 whitespace-nowrap rounded-pill px-3 py-1.5 text-[13px] font-bold text-forest-700 transition hover:bg-forest-50">
          Xem tất cả <i className="ri-arrow-right-s-line text-base" aria-hidden="true" />
        </Link>
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
    <Link href={`/forum/${post.id}`} className="group flex gap-3 rounded-card border border-line bg-surface p-4 shadow-card transition hover:border-forest-300 hover:shadow-lift">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest-100 text-sm font-extrabold uppercase text-forest-700" aria-hidden="true">{name.charAt(0)}</span>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[15px] font-bold leading-snug text-ink group-hover:text-forest-700">{post.title}</p>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-ink-faint">
          <span className="font-semibold text-ink-soft">{name}</span>
          <span><i className="ri-heart-line" aria-hidden="true" /> {post.likeCount || 0}</span>
          <span><i className="ri-chat-1-line" aria-hidden="true" /> {post._count?.comments || 0}</span>
          {post.createdAt && <span>{timeAgo(post.createdAt)}</span>}
        </p>
      </div>
    </Link>
  );
}

function EmptyBlock({ label }: { label: string }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-surface px-6 py-10 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-forest-100 text-forest-700">
        <i className="ri-inbox-line text-2xl" aria-hidden="true" />
      </span>
      <p className="mt-3 text-[15px] font-bold text-ink">{label}</p>
      <p className="mt-1 text-[13px] text-ink-faint">Bạn có thể là người đầu tiên đăng tin ở mục này.</p>
      <Link href="/dashboard" className="btn-forest mt-4">Đăng tin ngay</Link>
    </div>
  );
}
