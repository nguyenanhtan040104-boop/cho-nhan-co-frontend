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

export default async function HomePage() {
  const { products, vatNuoi, dichVu, realEstate, jobs, ads, forum } = await getHomeData();

  const vipListings = [
    ...products.filter((p: any) => p.isVip).map((p: any) => ({ ...p, _type: 'product' })),
    ...realEstate.filter((p: any) => p.isVip).map((p: any) => ({ ...p, _type: 'real-estate' })),
  ];

  // Lead with a real listing — the most characteristic thing in this market's world.
  const featured = vipListings[0]
    || (products[0] ? { ...products[0], _type: 'product' } : null)
    || (realEstate[0] ? { ...realEstate[0], _type: 'real-estate' } : null);
  const featuredImg = featured && (featured.images?.[0]?.url
    || (typeof featured.images?.[0] === 'string' ? featured.images[0] : null) || featured.imageUrl);
  const featuredHref = featured && (featured._type === 'real-estate' ? `/real-estate/${featured.id}` : `/products/${featured.id}`);

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-content px-4 py-6 sm:px-6">

        {/* ===== WELCOME BANNER — dashboard header card ===== */}
        <section className="relative overflow-hidden rounded-card bg-ink px-5 py-6 text-white sm:px-7 sm:py-7 animate-rise">
          <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-forest-500/20 blur-3xl" />
          <div className="relative">
            <span className="kicker text-brand-300 before:bg-brand-400">Chợ của người Nhân Cơ</span>
            <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">Chào bà con Nhân Cơ 👋</h1>
            <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-white/70">
              Cà phê, tiêu, bơ, đất rẫy hay việc mùa vụ — đăng tin và tìm người mua ngay trong xã Nhân Cơ, Đắk Nông.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link href="/dashboard" className="btn-primary"><i className="ri-add-line text-base" /> Đăng tin miễn phí</Link>
              <Link href="/products" className="btn-ghost bg-white/10 border-white/20 text-white hover:border-white/50">Khám phá tin đăng</Link>
            </div>
          </div>
        </section>

        {/* ===== TIN DẪN ĐẦU — lead with a real listing, not navigation chrome ===== */}
        {featured && (
          <section className="mt-5">
            <Link href={featuredHref!}
              className="group grid overflow-hidden rounded-card border border-line bg-surface sm:grid-cols-2">
              <div className="relative aspect-[16/10] overflow-hidden bg-paper sm:aspect-auto sm:min-h-[260px]">
                {featuredImg
                  ? <img src={featuredImg} alt={featured.title} className="h-full w-full object-cover" />
                  : <div className="h-full w-full" />}
                <span className="absolute left-3 top-3 rounded-pill bg-gold-500 px-2.5 py-1 text-[11px] font-black text-ink">Tin nổi bật</span>
              </div>
              <div className="flex flex-col justify-center gap-2.5 p-6 sm:p-8">
                <span className="kicker">Hôm nay ở chợ</span>
                <h2 className="text-xl font-black leading-tight text-ink sm:text-2xl">{featured.title}</h2>
                <p className="text-2xl font-black text-brand-600 sm:text-3xl">{fmtPrice(featured, featured._type)}</p>
                {(featured.location || featured.address) && (
                  <p className="flex items-center gap-1.5 text-sm text-ink-faint">
                    <i className="ri-map-pin-line" />{featured.location || featured.address}
                  </p>
                )}
                <span className="btn-primary mt-2 w-fit">Xem chi tiết</span>
              </div>
            </Link>
          </section>
        )}

        <div className="mt-6"><MarketPriceWidget /></div>
        <div className="mt-6"><AdSponsoredCarousel /></div>

        {/* ===== NỔI BẬT (VIP) — restrained gold accent, not a loud gradient ===== */}
        {vipListings.length > 0 && (
          <section className="mt-8">
            <SectionHead kicker="Được đề xuất" title="Tin nổi bật" href="/products" accent="gold" />
            <Grid>
              {vipListings.slice(0, 10).map((item: any) => <ListingCard key={`vip-${item.id}`} item={item} />)}
            </Grid>
          </section>
        )}

        {/* ===== SẢN PHẨM MỚI ===== */}
        <Section kicker="Mới nhất" title="Sản phẩm mới đăng" href="/products"
          empty={products.length === 0} emptyLabel="Chưa có sản phẩm nào">
          <Grid>{products.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'product' }} />)}</Grid>
        </Section>

        {/* ===== BẤT ĐỘNG SẢN ===== */}
        <Section kicker="Nhà đất" title="Bất động sản" href="/real-estate"
          empty={realEstate.length === 0} emptyLabel="Chưa có tin bất động sản">
          <Grid>{realEstate.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'real-estate' }} />)}</Grid>
        </Section>

        {/* ===== VẬT NUÔI ===== */}
        <Section kicker="Chăn nuôi" title="Vật nuôi" href="/vat-nuoi"
          empty={vatNuoi.length === 0} emptyLabel="Chưa có tin vật nuôi">
          <Grid>{vatNuoi.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'product' }} />)}</Grid>
        </Section>

        {/* ===== DỊCH VỤ ===== */}
        {dichVu.length > 0 && (
          <Section kicker="Phục vụ" title="Dịch vụ" href="/dich-vu" empty={false} emptyLabel="">
            <Grid>{dichVu.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'product' }} />)}</Grid>
          </Section>
        )}

        {/* ===== VIỆC LÀM ===== */}
        <Section kicker="Cơ hội" title="Tuyển dụng mới" href="/jobs"
          empty={jobs.length === 0} emptyLabel="Chưa có tin tuyển dụng">
          <Grid>{jobs.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'job' }} />)}</Grid>
        </Section>

        {/* ===== QUẢNG CÁO ===== */}
        {ads.length > 0 && (
          <Section kicker="Khuyến mãi" title="Quảng cáo & Khuyến mãi" href="/advertisements" empty={false} emptyLabel="">
            <Grid>{ads.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'ad' }} />)}</Grid>
          </Section>
        )}

        {/* ===== DIỄN ĐÀN ===== */}
        <section className="mt-8">
          <SectionHead kicker="Cộng đồng" title="Diễn đàn cộng đồng" href="/forum" />
          {forum.length === 0
            ? <EmptyBlock label="Chưa có bài viết nào" />
            : <div className="mt-3 divide-y divide-line rounded-card border border-line bg-surface">
                {forum.map((post: any) => <ForumRow key={post.id} post={post} />)}
              </div>}
        </section>

        {/* ===== CAM KẾT — a plain sentence, not an icon-tile row ===== */}
        <p className="mt-8 border-t border-line pt-5 text-[15px] leading-relaxed text-ink-soft">
          Miễn phí đăng tin · người thật tin thật · giao dịch tại chỗ trong xã Nhân Cơ.
          Cần hỗ trợ, gọi <a href="tel:0888317289" className="font-bold text-brand-600 hover:underline">0888.317.289</a>.
        </p>

        {/* Slim footer */}
        <footer className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-line py-6 text-xs text-ink-faint sm:flex-row">
          <p>© 2025 Chợ Nhân Cơ · Xã Nhân Cơ, Đắk Nông</p>
          <div className="flex items-center gap-4">
            <a href="tel:0888317289" className="hover:text-brand-600">0888.317.289</a>
            <a href="https://www.facebook.com/share/g/1Gwg2sziS1/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">Nhóm Facebook</a>
          </div>
        </footer>
      </div>
    </main>
  );
}

// ── Shared layout components ──────────────────────────────────────────────────

function SectionHead({ kicker, title, href, accent }: { kicker: string; title: string; href: string; accent?: 'gold' }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <span className={`kicker ${accent === 'gold' ? 'text-gold-600 before:bg-gold-500' : ''}`}>{kicker}</span>
        <h2 className="mt-1.5 text-xl font-extrabold text-ink sm:text-2xl">{title}</h2>
      </div>
      <Link href={href} className="chip shrink-0">Xem tất cả</Link>
    </div>
  );
}

function Section({ kicker, title, href, empty, emptyLabel, children }: {
  kicker: string; title: string; href: string; empty: boolean; emptyLabel: string; children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <SectionHead kicker={kicker} title={title} href={href} />
      {empty ? <EmptyBlock label={emptyLabel} /> : children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {children}
    </div>
  );
}

function ListingCard({ item }: { item: any }) {
  const href = item._type === 'product'     ? `/products/${item.id}`
             : item._type === 'real-estate' ? `/real-estate/${item.id}`
             : item._type === 'job'         ? `/jobs/${item.id}`
             : item._type === 'ad'          ? `/advertisements/${item.id}`
             : `/forum/${item.id}`;

  const imgUrl = item.images?.[0]?.url
    || (typeof item.images?.[0] === 'string' ? item.images[0] : null)
    || item.imageUrl || null;
  const imgCount = item.images?.length || 0;
  const price = fmtPrice(item, item._type);

  return (
    <Link href={href} className="group block overflow-hidden rounded-card border border-line bg-surface
                                 shadow-card transition-shadow duration-200 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-paper">
        {imgUrl
          ? <img src={imgUrl} alt={item.title} className="h-full w-full object-cover" />
          : <div className="flex h-full w-full items-center justify-center bg-paper text-ink-faint">
              <i className="ri-image-line text-2xl" />
            </div>}
        <LikeButton itemId={String(item.id)} />
        {item.isVip && (
          <span className="absolute left-2 top-2 rounded-pill bg-gold-500 px-2 py-0.5 text-[10px] font-black text-ink">VIP</span>
        )}
        {imgCount > 1 && (
          <span className="absolute bottom-2 right-2 rounded-pill bg-ink/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {imgCount} ảnh
          </span>
        )}
      </div>
      <div className="px-3 pb-3 pt-2.5">
        <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-ink">{item.title}</p>
        {price && <p className="mt-1 text-[15px] font-black text-brand-600">{price}</p>}
        {(item.location || item.address) && (
          <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-ink-faint">
            <i className="ri-map-pin-line" />{item.location || item.address}
          </p>
        )}
      </div>
    </Link>
  );
}

function ForumRow({ post }: { post: any }) {
  const img = post.images?.[0] ? (typeof post.images[0] === 'string' ? post.images[0] : post.images[0].url) : null;
  return (
    <Link href={`/forum/${post.id}`} className="flex items-start gap-3 px-3 py-3 transition-colors hover:bg-paper">
      <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-forest-50 text-forest-500">
        {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : <i className="ri-chat-3-line text-xl" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{post.title}</p>
        <div className="mt-1.5 flex items-center gap-4 text-xs text-ink-faint">
          <span className="font-semibold text-ink-soft">{post.user?.fullName || post.user?.username || 'Ẩn danh'}</span>
          <span className="flex items-center gap-1"><i className="ri-heart-line" />{post.likeCount || 0}</span>
          <span className="flex items-center gap-1"><i className="ri-chat-1-line" />{post._count?.comments || 0}</span>
          {post.createdAt && <span className="ml-auto">{timeAgo(post.createdAt)}</span>}
        </div>
      </div>
    </Link>
  );
}

function EmptyBlock({ label }: { label: string }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-surface px-6 py-12 text-center">
      <p className="text-sm font-semibold text-ink-soft">{label}</p>
      <p className="mt-1 text-xs text-ink-faint">Hãy là người đầu tiên đăng tin ở mục này.</p>
      <Link href="/dashboard" className="btn-primary mt-4">Đăng tin ngay</Link>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-4 bg-ink text-white/70">
      <div className="mx-auto max-w-content px-6 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <p className="text-lg font-black text-white">Chợ Nhân Cơ</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed">
              Kết nối giao thương, gắn kết cộng đồng nông thôn tại Nhân Cơ, Đắk Nông.
            </p>
            <div className="mt-4 flex gap-2">
              <a href="https://www.facebook.com/trungnguyenanhtan" target="_blank" rel="noopener noreferrer"
                className="grid h-9 w-9 place-items-center rounded-pill bg-white/10 text-white transition-colors hover:bg-brand-500">
                <i className="ri-facebook-fill" />
              </a>
              <a href="https://zalo.me/0888317289" target="_blank" rel="noopener noreferrer"
                className="grid h-9 w-9 place-items-center rounded-pill bg-white/10 text-white transition-colors hover:bg-forest-500">
                <i className="ri-phone-fill" />
              </a>
            </div>
          </div>
          <div>
            <p className="mb-3 font-bold text-white">Danh mục</p>
            <ul className="space-y-2 text-sm">
              {[['Sản phẩm','/products'],['Bất động sản','/real-estate'],['Tuyển dụng','/jobs'],['Vật nuôi','/vat-nuoi'],['Dịch vụ','/dich-vu'],['Diễn đàn','/forum'],['Cảnh báo','/canh-bao']].map(([label, href]) => (
                <li key={href}><Link href={href} className="transition-colors hover:text-white">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 font-bold text-white">Liên hệ</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><i className="ri-phone-fill" /><a href="tel:0888317289" className="hover:text-white">0888.317.289</a></li>
              <li className="flex items-center gap-2"><i className="ri-mail-fill" /><a href="mailto:chonhanco41@gmail.com" className="hover:text-white">chonhanco41@gmail.com</a></li>
              <li className="flex items-center gap-2"><i className="ri-map-pin-fill" />Xã Nhân Cơ, Đắk Nông</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-5 text-center text-xs text-white/50">
          © 2025 Chợ Nhân Cơ. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}
