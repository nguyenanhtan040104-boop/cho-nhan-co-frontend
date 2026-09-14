import Link from 'next/link';
import { Metadata } from 'next';
import LikeButton from './components/LikeButton';
import MarketPriceWidget from './components/MarketPriceWidget';
import AdSponsoredCarousel from './components/AdSponsoredCarousel';
import { mockProducts, mockRealEstate, mockJobs, mockForum, isDev } from '../lib/devMock';

export const metadata: Metadata = {
  title: 'Chợ Nhân Cơ — Mua bán nông sản, bất động sản, việc làm tại Đắk Nông',
  description: 'Chợ Nhân Cơ là nền tảng mua bán trực tuyến cho cộng đồng Nhân Cơ, Đắk Nông.',
  alternates: { canonical: 'https://chonhanco.com' },
};

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.chonhanco.com/api';

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
  const [products, vatNuoi, dichVu, realEstate, jobs, ads, forum] = await Promise.all([
    safeFetch(`${API}/products?limit=10&sortBy=newest`),
    safeFetch(`${API}/products?category=VAT_NUOI&limit=8&sortBy=newest`),
    safeFetch(`${API}/products?category=DICH_VU&limit=8&sortBy=newest`),
    safeFetch(`${API}/real-estates?limit=8`),
    safeFetch(`${API}/jobs?limit=8&sortBy=newest`),
    safeFetch(`${API}/advertisements?limit=6`),
    safeFetch(`${API}/forum/posts?limit=6`),
  ]);
  return {
    products: orMock(products, mockProducts),
    vatNuoi: orMock(vatNuoi, mockProducts.slice(0, 3)),
    dichVu,
    realEstate: orMock(realEstate, mockRealEstate),
    jobs: orMock(jobs, mockJobs),
    ads,
    forum: orMock(forum, mockForum),
  };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 60) return `${m || 1} phút`;
  if (h < 24) return `${h} giờ`;
  if (d < 30) return `${d} ngày`;
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

function fmtPrice(item: any, type: string) {
  if (type === 'product')     return `${Number(item.price).toLocaleString('vi-VN')}đ`;
  if (type === 'real-estate') {
    const p = Number(item.price);
    if (!p) return 'Thỏa thuận';
    return p >= 1e9 ? (p / 1e9).toFixed(1) + ' tỷ' : (p / 1e6).toFixed(0) + ' triệu';
  }
  if (type === 'job') return item.salary || 'Thỏa thuận';
  if (type === 'ad')  return item.businessName || 'Quảng cáo';
  return '';
}

const todayVi = () => new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export default async function HomePage() {
  const { products, vatNuoi, dichVu, realEstate, jobs, ads, forum } = await getHomeData();

  const featured = (products.find((p: any) => p.isVip) && { ...products.find((p: any) => p.isVip), _type: 'product' })
    || (realEstate.find((p: any) => p.isVip) && { ...realEstate.find((p: any) => p.isVip), _type: 'real-estate' })
    || (products[0] ? { ...products[0], _type: 'product' } : null);
  const featuredImg = featured && (featured.images?.[0]?.url
    || (typeof featured.images?.[0] === 'string' ? featured.images[0] : null) || featured.imageUrl);
  const featuredHref = featured && (featured._type === 'real-estate' ? `/real-estate/${featured.id}` : `/products/${featured.id}`);
  // The rest of the newest products (featured pulled out) run as the lead column.
  const rest = products.filter((p: any) => p.id !== featured?.id);

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-content px-4 py-6 sm:px-8">

        {/* ===== MASTHEAD — dateline over a ruled banner, like a local almanac ===== */}
        <header className="border-y-2 border-ink py-3">
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-display text-[13px] italic text-ink-soft">Nhân Cơ, Đắk Nông</p>
            <p className="hidden text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-faint sm:block">{todayVi()}</p>
            <p className="text-[13px] font-semibold text-brand-600">Số hôm nay</p>
          </div>
        </header>

        {/* ===== LEAD FEATURE — the day's headline listing, magazine-style ===== */}
        {featured && (
          <section className="mt-6 grid gap-6 lg:grid-cols-12">
            <Link href={featuredHref!} className="group lg:col-span-8">
              <div className="relative aspect-[16/9] overflow-hidden bg-ink/5">
                {featuredImg && <img src={featuredImg} alt={featured.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />}
                <span className="absolute left-0 top-4 bg-brand-500 px-3 py-1 font-display text-[13px] font-semibold italic text-white">Tin của phiên chợ</span>
              </div>
              <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.1] text-ink sm:text-[2.6rem]">{featured.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
                <span className="font-display text-2xl font-bold text-brand-600">{fmtPrice(featured, featured._type)}</span>
                {(featured.location || featured.address) && (
                  <span className="text-sm text-ink-soft">{featured.location || featured.address}</span>
                )}
                <span className="text-sm font-semibold text-forest-600 underline decoration-forest-300 underline-offset-4 group-hover:decoration-forest-600">Xem chi tiết</span>
              </div>
            </Link>

            {/* Side rail — market prices board */}
            <aside className="lg:col-span-4">
              <MarketPriceWidget />
            </aside>
          </section>
        )}

        {/* ===== NEWEST — the lead column of fresh listings ===== */}
        <Section n="01" title="Mới đăng trong phiên" href="/products" empty={rest.length === 0} emptyLabel="Chưa có sản phẩm nào">
          <Grid>{rest.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'product' }} />)}</Grid>
        </Section>

        <div className="mt-8"><AdSponsoredCarousel /></div>

        <Section n="02" title="Nhà đất & vườn rẫy" href="/real-estate" empty={realEstate.length === 0} emptyLabel="Chưa có tin bất động sản">
          <Grid>{realEstate.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'real-estate' }} />)}</Grid>
        </Section>

        <Section n="03" title="Vật nuôi" href="/vat-nuoi" empty={vatNuoi.length === 0} emptyLabel="Chưa có tin vật nuôi">
          <Grid>{vatNuoi.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'product' }} />)}</Grid>
        </Section>

        <Section n="04" title="Việc làm mùa vụ" href="/jobs" empty={jobs.length === 0} emptyLabel="Chưa có tin tuyển dụng">
          <Grid>{jobs.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'job' }} />)}</Grid>
        </Section>

        {dichVu.length > 0 && (
          <Section n="05" title="Dịch vụ" href="/dich-vu" empty={false} emptyLabel="">
            <Grid>{dichVu.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'product' }} />)}</Grid>
          </Section>
        )}

        {/* ===== DIỄN ĐÀN — editorial column ===== */}
        <Section n={dichVu.length > 0 ? '06' : '05'} title="Chuyện của bà con" href="/forum" empty={forum.length === 0} emptyLabel="Chưa có bài viết nào">
          <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
            {forum.map((post: any) => <ForumRow key={post.id} post={post} />)}
          </div>
        </Section>

        {/* Colophon */}
        <footer className="mt-12 border-t-2 border-ink pt-4">
          <p className="font-display text-lg italic text-ink">Chợ Nhân Cơ</p>
          <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-ink-soft">
            Miễn phí đăng tin, người thật tin thật, giao dịch tại chỗ trong xã Nhân Cơ, Đắk Nông.
            Cần hỗ trợ, gọi <a href="tel:0888317289" className="font-semibold text-brand-600 hover:underline">0888.317.289</a>.
          </p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.15em] text-ink-faint">© 2025 Chợ Nhân Cơ</p>
        </footer>
      </div>
    </main>
  );
}

// ── Editorial components ──────────────────────────────────────────────────────

// Numbered, ruled section head — a structural device that carries real meaning.
function Section({ n, title, href, empty, emptyLabel, children }: {
  n: string; title: string; href: string; empty: boolean; emptyLabel: string; children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-4 border-b-2 border-ink pb-2">
        <h2 className="flex items-baseline gap-3 font-display text-2xl font-semibold text-ink">
          <span className="font-sans text-sm font-bold text-brand-500">{n}</span>
          {title}
        </h2>
        <Link href={href} className="whitespace-nowrap text-[13px] font-semibold text-ink-soft underline decoration-line underline-offset-4 hover:text-brand-600 hover:decoration-brand-400">
          Xem tất cả
        </Link>
      </div>
      <div className="mt-5">{empty ? <EmptyBlock label={emptyLabel} /> : children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">{children}</div>;
}

// Editorial listing — image, serif nothing on the card, quiet sans meta, price in serif.
function ListingCard({ item }: { item: any }) {
  const href = item._type === 'product'     ? `/products/${item.id}`
             : item._type === 'real-estate' ? `/real-estate/${item.id}`
             : item._type === 'job'         ? `/jobs/${item.id}`
             : item._type === 'ad'          ? `/advertisements/${item.id}`
             : `/forum/${item.id}`;
  const imgUrl = item.images?.[0]?.url
    || (typeof item.images?.[0] === 'string' ? item.images[0] : null) || item.imageUrl || null;
  const price = fmtPrice(item, item._type);

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-ink/5">
        {imgUrl
          ? <img src={imgUrl} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          : <div className="grid h-full w-full place-items-center text-ink-faint"><i className="ri-image-line text-2xl" /></div>}
        <LikeButton itemId={String(item.id)} />
        {item.isVip && <span className="absolute left-0 top-2 bg-gold-500 px-2 py-0.5 text-[10px] font-black text-ink">VIP</span>}
      </div>
      <p className="mt-2.5 line-clamp-2 text-[14px] font-semibold leading-snug text-ink group-hover:text-brand-700">{item.title}</p>
      {price && <p className="mt-1 font-display text-[17px] font-bold text-brand-600">{price}</p>}
      {(item.location || item.address) && (
        <p className="mt-0.5 text-[12px] text-ink-faint">{item.location || item.address}</p>
      )}
    </Link>
  );
}

function ForumRow({ post }: { post: any }) {
  return (
    <Link href={`/forum/${post.id}`} className="group flex gap-4 border-b border-line py-4">
      <span className="font-display text-2xl font-semibold italic text-line group-hover:text-brand-300">”</span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-[17px] font-semibold leading-snug text-ink group-hover:text-brand-700">{post.title}</p>
        <div className="mt-1.5 flex items-center gap-3 text-[12px] text-ink-faint">
          <span className="font-semibold text-ink-soft">{post.user?.fullName || post.user?.username || 'Ẩn danh'}</span>
          <span>{post.likeCount || 0} thích</span>
          <span>{post._count?.comments || 0} bình luận</span>
          {post.createdAt && <span>· {timeAgo(post.createdAt)}</span>}
        </div>
      </div>
    </Link>
  );
}

function EmptyBlock({ label }: { label: string }) {
  return (
    <div className="border border-dashed border-line px-6 py-12 text-center">
      <p className="font-display text-lg italic text-ink-soft">{label}</p>
      <p className="mt-1 text-[13px] text-ink-faint">Hãy là người đầu tiên đăng tin ở mục này.</p>
      <Link href="/dashboard" className="btn-primary mt-4">Đăng tin ngay</Link>
    </div>
  );
}
