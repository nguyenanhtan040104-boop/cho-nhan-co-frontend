import Link from 'next/link';
import { Metadata } from 'next';
import MarketPriceWidget from './components/MarketPriceWidget';
import AdSponsoredCarousel from './components/AdSponsoredCarousel';
import ListingRow from './components/ListingRow';
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
      <section className="mx-auto max-w-content px-4 pb-1 pt-7 sm:px-6 sm:pt-12">
        <p className="kicker">Chợ của bà con Nhân Cơ, Đắk Nông</p>
        <h1 className="mt-3 max-w-2xl text-[1.75rem] font-bold leading-tight text-ink sm:text-[2.5rem] sm:leading-[1.15]">Mua bán ngay trong xã Nhân Cơ</h1>
        <p className="mt-2 max-w-xl text-[16px] leading-relaxed text-ink-soft">Nông sản, đất rẫy, việc làm mùa vụ. Đăng tin miễn phí, gặp người bán gần nhà.</p>
        <div className="no-scrollbar -mx-4 mt-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Tìm nhiều">
          <span className="mr-1 hidden shrink-0 text-sm text-ink-faint sm:inline">Tìm nhiều:</span>
          {POPULAR.map(p => <Link key={p.label} href={p.href} className="chip">{p.label}</Link>)}
        </div>
      </section>

      <div className="mx-auto max-w-content space-y-12 px-4 pt-8 sm:px-6 sm:pt-10">
        <MarketPriceWidget />

        <NearbySection />

        <Section title="Tin mới đăng" href="/products" empty={products.length === 0} emptyLabel="Chưa có sản phẩm nào">
          <Rows>{products.map((item: any) => <ListingRow key={item.id} item={item} type="product" />)}</Rows>
        </Section>

        <AdSponsoredCarousel />

        <Section title="Nhà đất và vườn rẫy" href="/real-estate" empty={realEstate.length === 0} emptyLabel="Chưa có tin nhà đất">
          <Rows>{realEstate.map((item: any) => <ListingRow key={item.id} item={item} type="real-estate" />)}</Rows>
        </Section>

        <Section title="Việc làm mùa vụ" href="/jobs" empty={jobs.length === 0} emptyLabel="Chưa có tin tuyển dụng">
          <Rows>{jobs.map((item: any) => <ListingRow key={item.id} item={item} type="job" />)}</Rows>
        </Section>

        <Section title="Vật nuôi" href="/vat-nuoi" empty={vatNuoi.length === 0} emptyLabel="Chưa có tin vật nuôi">
          <Rows>{vatNuoi.map((item: any) => <ListingRow key={item.id} item={item} type="product" />)}</Rows>
        </Section>

        {dichVu.length > 0 && (
          <Section title="Dịch vụ" href="/dich-vu" empty={false} emptyLabel="">
            <Rows>{dichVu.map((item: any) => <ListingRow key={item.id} item={item} type="product" />)}</Rows>
          </Section>
        )}

        <Section title="Chuyện của bà con" href="/forum" empty={forum.length === 0} emptyLabel="Chưa có bài viết nào">
          <ul className="divide-y divide-line border-y border-line">
            {forum.map((post: any) => <ForumRow key={post.id} post={post} />)}
          </ul>
        </Section>

        <aside className="text-[14px] leading-relaxed text-ink-soft sm:flex sm:items-center sm:justify-between sm:gap-6">
          <p>
            <b className="text-ink">Mua bán an toàn.</b> Gặp trực tiếp, xem hàng rồi mới trả tiền. Không chuyển tiền đặt cọc cho người chưa gặp mặt.
          </p>
          <Link href="/canh-bao" className="mt-2 inline-block shrink-0 font-semibold text-forest-700 underline underline-offset-2 sm:mt-0">Xem cảnh báo lừa đảo</Link>
        </aside>

        <section className="flex flex-col gap-4 rounded-card bg-paper p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-lg font-bold text-ink">Có hàng cần bán?</h2>
            <p className="text-[14px] text-ink-soft">Đăng tin trong vài phút. Người mua liên hệ bạn qua Zalo hoặc điện thoại.</p>
          </div>
          <Link href="/dashboard" className="btn-primary shrink-0 px-6 py-3.5">Đăng tin miễn phí</Link>
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
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-[22px] font-bold leading-tight text-ink">{title}</h2>
        <Link href={href} className="whitespace-nowrap text-[15px] font-medium text-ink underline underline-offset-4 hover:text-forest-700">Xem tất cả</Link>
      </div>
      {empty ? <EmptyBlock label={emptyLabel} /> : children}
    </section>
  );
}

function Rows({ children }: { children: React.ReactNode }) {
  return <div className="border-t border-line md:grid md:grid-cols-2 md:gap-x-10">{children}</div>;
}

function ForumRow({ post }: { post: any }) {
  const name = post.user?.fullName || post.user?.username || 'Ẩn danh';
  return (
    <li>
      <Link href={`/forum/${post.id}`} className="block py-4 transition-colors hover:bg-paper sm:px-2">
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
    <div className="rounded-card bg-paper px-6 py-10 text-center">
      <p className="text-[15px] font-semibold text-ink">{label}</p>
      <p className="mt-1 text-[13px] text-ink-faint">Bạn có thể là người đầu tiên đăng tin ở mục này.</p>
      <Link href="/dashboard" className="btn-forest mt-4">Đăng tin</Link>
    </div>
  );
}
