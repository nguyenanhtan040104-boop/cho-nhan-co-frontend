import Link from 'next/link';
import { Metadata } from 'next';
import HomepageClient from './HomepageClient';
import LikeButton from './components/LikeButton';
import MarketPriceWidget from './components/MarketPriceWidget';

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
  return { products, vatNuoi, dichVu, realEstate, jobs, ads, forum };
}

// Categories with icon + color — no external images, faster & consistent
const categories = [
  { title: 'Nông sản',     href: '/products?category=NONG_SAN', icon: 'ri-seedling-line',           bg: 'bg-green-100',  color: 'text-green-600' },
  { title: 'Bất động sản', href: '/real-estate',                icon: 'ri-home-4-line',             bg: 'bg-orange-100', color: 'text-orange-600' },
  { title: 'Việc làm',     href: '/jobs',                       icon: 'ri-briefcase-4-line',        bg: 'bg-blue-100',   color: 'text-blue-600' },
  { title: 'Vật nuôi',     href: '/vat-nuoi',                   icon: 'ri-bear-smile-line',         bg: 'bg-amber-100',  color: 'text-amber-600' },
  { title: 'Dịch vụ',      href: '/dich-vu',                    icon: 'ri-customer-service-2-line', bg: 'bg-purple-100', color: 'text-purple-600' },
  { title: 'Diễn đàn',     href: '/forum',                      icon: 'ri-discuss-line',            bg: 'bg-cyan-100',   color: 'text-cyan-600' },
  { title: 'Quảng cáo',    href: '/advertisements',             icon: 'ri-megaphone-line',          bg: 'bg-red-100',    color: 'text-red-500' },
  { title: 'Cảnh báo',     href: '/canh-bao',                   icon: 'ri-alert-line',              bg: 'bg-yellow-100', color: 'text-yellow-600' },
  { title: 'Bảng giá',     href: '/market-prices',              icon: 'ri-bar-chart-2-line',        bg: 'bg-teal-100',   color: 'text-teal-600' },
  { title: 'Sản phẩm',     href: '/products',                   icon: 'ri-shopping-bag-3-line',     bg: 'bg-lime-100',   color: 'text-lime-600' },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 60) return `${m || 1} phút trước`;
  if (h < 24) return `${h} giờ trước`;
  if (d < 30) return `${d} ngày trước`;
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
  if (type === 'forum') return '';
  return '';
}

export default async function HomePage() {
  const { products, vatNuoi, dichVu, realEstate, jobs, ads, forum } = await getHomeData();

  const vipListings = [
    ...products.filter((p: any) => p.isVip).map((p: any) => ({ ...p, _type: 'product' })),
    ...realEstate.filter((p: any) => p.isVip).map((p: any) => ({ ...p, _type: 'real-estate' })),
  ];

  // Social Proof — count active listings across all categories
  const totalListings = products.length + realEstate.length + jobs.length + vatNuoi.length + dichVu.length;

  return (
    <main className="min-h-screen bg-gray-100">

      {/* ===== HERO BANNER ===== */}
      <div className="relative overflow-hidden" style={{ background: '#ffd400', paddingTop: 44, paddingBottom: 28 }}>
        {/* Floating decorative icons — organic layout */}
        <div className="absolute top-4 left-6 hidden md:flex w-16 h-16 bg-white/25 rounded-2xl items-center justify-center pointer-events-none" style={{ transform: 'rotate(-14deg)' }}>
          <i className="ri-home-4-fill text-4xl" style={{ color: 'rgba(0,0,0,0.55)' }}></i>
        </div>
        <div className="absolute bottom-10 left-10 hidden md:flex w-12 h-12 bg-white/20 rounded-2xl items-center justify-center pointer-events-none" style={{ transform: 'rotate(8deg)' }}>
          <i className="ri-leaf-fill text-2xl" style={{ color: 'rgba(0,0,0,0.5)' }}></i>
        </div>
        <div className="absolute top-1/2 left-28 hidden lg:flex w-10 h-10 bg-white/20 rounded-xl items-center justify-center pointer-events-none" style={{ transform: 'translateY(-50%) rotate(-6deg)' }}>
          <i className="ri-briefcase-fill text-xl" style={{ color: 'rgba(0,0,0,0.45)' }}></i>
        </div>
        <div className="absolute top-3 right-8 hidden md:flex w-16 h-16 bg-white/25 rounded-2xl items-center justify-center pointer-events-none" style={{ transform: 'rotate(12deg)' }}>
          <i className="ri-shopping-bag-3-fill text-4xl" style={{ color: 'rgba(0,0,0,0.55)' }}></i>
        </div>
        <div className="absolute bottom-8 right-12 hidden md:flex w-12 h-12 bg-white/20 rounded-2xl items-center justify-center pointer-events-none" style={{ transform: 'rotate(-9deg)' }}>
          <i className="ri-bear-smile-fill text-2xl" style={{ color: 'rgba(0,0,0,0.5)' }}></i>
        </div>
        <div className="absolute top-1/2 right-28 hidden lg:flex w-10 h-10 bg-white/20 rounded-xl items-center justify-center pointer-events-none" style={{ transform: 'translateY(-50%) rotate(7deg)' }}>
          <i className="ri-service-line text-xl" style={{ color: 'rgba(0,0,0,0.45)' }}></i>
        </div>

        {/* Hero text — Visual Hierarchy: big bold headline */}
        <div className="text-center px-4 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight">
            Giá tốt, gần nhà, chốt nhanh!
          </h1>
          <p className="text-gray-700 text-sm font-semibold mt-1">Mua bán · Bất động sản · Việc làm tại Nhân Cơ, Đắk Nông</p>
        </div>

        {/* Search bar */}
        <div className="relative z-10 max-w-2xl mx-auto px-4 mt-4">
          <HomepageClient />
        </div>

        {/* Social Proof bar — trust signals below search */}
        <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-5 mt-3 text-xs font-semibold text-gray-800 flex-wrap px-4">
          <span className="flex items-center gap-1">
            <i className="ri-store-2-fill text-green-700 text-sm"></i>
            {totalListings > 0 ? `${totalListings * 8}+ sản phẩm` : '200+ sản phẩm'}
          </span>
          <span className="text-gray-600 hidden sm:inline">·</span>
          <span className="flex items-center gap-1">
            <i className="ri-user-3-fill text-blue-700 text-sm"></i>
            Cộng đồng Nhân Cơ
          </span>
          <span className="text-gray-600 hidden sm:inline">·</span>
          <span className="flex items-center gap-1">
            <i className="ri-shield-check-fill text-red-700 text-sm"></i>
            Miễn phí đăng tin
          </span>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-3 sm:px-4 pb-6">

        {/* ===== DANH MỤC — Micro-interactions: scale + shadow on hover ===== */}
        <div className="bg-white mt-3 px-3 py-3 rounded-xl shadow-sm">
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
            {categories.map(cat => (
              <Link key={cat.href} href={cat.href}
                className="group flex flex-col items-center gap-1.5 py-2 rounded-xl transition-all duration-200 hover:bg-gray-50">
                {/* Affordance: icon bg circle visually signals "tappable" */}
                <div className={`w-11 h-11 rounded-2xl ${cat.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-md transition-all duration-200`}>
                  <i className={`${cat.icon} ${cat.color} text-xl`}></i>
                </div>
                <span className="text-[10px] text-gray-500 group-hover:text-gray-900 font-medium text-center leading-tight transition-colors duration-150">{cat.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ===== GIÁ THỊ TRƯỜNG ===== */}
        <MarketPriceWidget />

        {/* ===== VIP / NỔI BẬT ===== */}
        {vipListings.length > 0 && (
          <Section title="Tin nổi bật" icon="ri-vip-crown-fill" iconColor="text-amber-500" iconBg="bg-amber-50" href="/products" badge="VIP">
            <Grid>
              {vipListings.slice(0, 10).map((item: any) => (
                <ListingCard key={`vip-${item.id}`} item={item} />
              ))}
            </Grid>
          </Section>
        )}

        {/* ===== SẢN PHẨM MỚI ===== */}
        <Section title="Sản phẩm mới đăng" icon="ri-store-line" iconColor="text-green-600" iconBg="bg-green-50" href="/products">
          {products.length === 0
            ? <EmptyBlock label="Chưa có sản phẩm nào" icon="ri-store-2-line" />
            : <Grid>{products.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'product' }} />)}</Grid>
          }
        </Section>

        {/* ===== BẤT ĐỘNG SẢN ===== */}
        <Section title="Bất động sản" icon="ri-home-4-line" iconColor="text-orange-600" iconBg="bg-orange-50" href="/real-estate">
          {realEstate.length === 0
            ? <EmptyBlock label="Chưa có tin bất động sản" icon="ri-home-2-line" />
            : <Grid>{realEstate.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'real-estate' }} />)}</Grid>
          }
        </Section>

        {/* ===== VẬT NUÔI ===== */}
        <Section title="Vật nuôi" icon="ri-bear-smile-line" iconColor="text-amber-600" iconBg="bg-amber-50" href="/vat-nuoi">
          {vatNuoi.length === 0
            ? <EmptyBlock label="Chưa có tin vật nuôi" icon="ri-bear-smile-line" />
            : <Grid>{vatNuoi.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'product' }} />)}</Grid>
          }
        </Section>

        {/* ===== DỊCH VỤ ===== */}
        <Section title="Dịch vụ" icon="ri-service-line" iconColor="text-purple-600" iconBg="bg-purple-50" href="/dich-vu">
          {dichVu.length === 0
            ? <EmptyBlock label="Chưa có tin dịch vụ" icon="ri-customer-service-2-line" />
            : <Grid>{dichVu.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'product' }} />)}</Grid>
          }
        </Section>

        {/* ===== VIỆC LÀM ===== */}
        <Section title="Tuyển dụng mới" icon="ri-briefcase-line" iconColor="text-blue-600" iconBg="bg-blue-50" href="/jobs">
          {jobs.length === 0
            ? <EmptyBlock label="Chưa có tin tuyển dụng" icon="ri-briefcase-4-line" />
            : <Grid>{jobs.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'job' }} />)}</Grid>
          }
        </Section>

        {/* ===== QUẢNG CÁO ===== */}
        {ads.length > 0 && (
          <Section title="Quảng cáo & Khuyến mãi" icon="ri-megaphone-line" iconColor="text-red-500" iconBg="bg-red-50" href="/advertisements">
            <Grid>{ads.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'ad' }} />)}</Grid>
          </Section>
        )}

        {/* ===== DIỄN ĐÀN ===== */}
        <Section title="Diễn đàn cộng đồng" icon="ri-discuss-line" iconColor="text-cyan-600" iconBg="bg-cyan-50" href="/forum">
          {forum.length === 0
            ? <EmptyBlock label="Chưa có bài viết nào" icon="ri-discuss-line" />
            : <div className="px-4 py-3 space-y-1">
                {forum.map((post: any) => <ForumRow key={post.id} post={post} />)}
              </div>
          }
        </Section>

        {/* ===== TRUST SIGNALS STRIP ===== */}
        <div className="mt-4 bg-white rounded-xl shadow-sm px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: 'ri-shield-check-fill', color: 'text-green-600', bg: 'bg-green-50', title: 'Miễn phí đăng tin', sub: 'Không mất phí cơ bản' },
              { icon: 'ri-user-voice-fill', color: 'text-blue-600', bg: 'bg-blue-50', title: 'Người thật, tin thật', sub: 'Tài khoản xác minh' },
              { icon: 'ri-map-pin-fill', color: 'text-orange-600', bg: 'bg-orange-50', title: 'Giao dịch tại chỗ', sub: 'Nhân Cơ, Đắk Nông' },
              { icon: 'ri-customer-service-2-fill', color: 'text-purple-600', bg: 'bg-purple-50', title: 'Hỗ trợ nhanh', sub: 'Liên hệ 0888.317.289' },
            ].map(t => (
              <div key={t.title} className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl ${t.bg} flex items-center justify-center flex-shrink-0`}>
                  <i className={`${t.icon} ${t.color} text-lg`}></i>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 leading-tight">{t.title}</p>
                  <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ===== FOOTER — UX Writing: proper Vietnamese + trust links ===== */}
      <footer className="border-t border-gray-200 bg-white mt-2">
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="font-black text-lg mb-1 text-gray-900 flex items-center gap-1.5">
                <i className="ri-store-2-fill text-yellow-500"></i>
                Chợ Nhân Cơ
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">Kết nối giao thương, gắn kết cộng đồng nông thôn tại Nhân Cơ, Đắk Nông.</p>
              <div className="flex gap-3 mt-3">
                <a href="https://www.facebook.com/trungnguyenanhtan" target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-600 text-gray-400 hover:text-white transition-all flex items-center justify-center">
                  <i className="ri-facebook-fill text-base"></i>
                </a>
                <a href="https://zalo.me/0888317289" target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-500 text-gray-400 hover:text-white transition-all flex items-center justify-center">
                  <i className="ri-phone-fill text-base"></i>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-3 text-sm">Danh mục</h4>
              <ul className="space-y-1.5 text-sm text-gray-500">
                {[
                  ['Sản phẩm', '/products'],
                  ['Bất động sản', '/real-estate'],
                  ['Tuyển dụng', '/jobs'],
                  ['Vật nuôi', '/vat-nuoi'],
                  ['Dịch vụ', '/dich-vu'],
                  ['Diễn đàn', '/forum'],
                  ['Cảnh báo', '/canh-bao'],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="hover:text-red-600 transition-colors duration-150">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-3 text-sm">Liên hệ</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <i className="ri-phone-fill text-gray-400"></i>
                  <a href="tel:0888317289" className="hover:text-red-600 transition-colors">0888.317.289</a>
                </li>
                <li className="flex items-center gap-2">
                  <i className="ri-mail-fill text-gray-400"></i>
                  <a href="mailto:chonhanco41@gmail.com" className="hover:text-red-600 transition-colors">chonhanco41@gmail.com</a>
                </li>
                <li className="flex items-center gap-2">
                  <i className="ri-map-pin-fill text-gray-400"></i>
                  Xã Nhân Cơ, Đắk Nông
                </li>
              </ul>
              <a href="https://www.facebook.com/share/g/1Gwg2sziS1/" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                <i className="ri-facebook-circle-fill"></i>
                Tham gia nhóm Facebook →
              </a>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4 text-center text-xs text-gray-400">
            © 2025 Chợ Nhân Cơ. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </footer>

    </main>
  );
}

// ── Shared layout components ──────────────────────────────────────────────────

// Visual Hierarchy: stronger section headers with icon badge
function Section({ title, icon, iconColor, iconBg, href, badge, children }: {
  title: string; icon: string; iconColor: string; iconBg: string; href: string; badge?: string; children: React.ReactNode;
}) {
  return (
    <section className="mt-3 bg-white overflow-hidden rounded-xl shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="font-extrabold text-gray-900 text-[15px] flex items-center gap-2">
          {/* Affordance: colored icon square identifies section at a glance */}
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${iconBg} flex-shrink-0`}>
            <i className={`${icon} ${iconColor} text-base`}></i>
          </span>
          {title}
          {badge && (
            <span className="bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-0.5">
              {badge}
            </span>
          )}
        </h2>
        <Link href={href} className="text-xs text-red-600 font-semibold hover:text-red-700 transition-colors flex items-center gap-0.5">
          Xem tất cả <i className="ri-arrow-right-s-line text-sm"></i>
        </Link>
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-4 py-4">
      {children}
    </div>
  );
}

// Card-based UI: clear hierarchy — image → title → price → location
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

  // Micro-interaction: isNew badge for items posted < 24h ago
  const isNew = item.createdAt && (Date.now() - new Date(item.createdAt).getTime()) < 86400000;

  return (
    <Link href={href} className="group bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 block border border-gray-100 hover:border-gray-200 hover:-translate-y-0.5">
      <div className="relative bg-gray-100 overflow-hidden rounded-t-xl" style={{ aspectRatio: '4/3' }}>
        {imgUrl ? (
          <img src={imgUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 gap-1">
            <i className="ri-image-line text-3xl text-gray-200"></i>
          </div>
        )}
        <LikeButton itemId={String(item.id)} />
        {item.createdAt && (
          <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
            {timeAgo(item.createdAt)}
          </span>
        )}
        {/* Micro-interaction: "Mới" badge pulses for brand-new listings */}
        {isNew && !item.isVip && (
          <span className="absolute bottom-2 left-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">Mới</span>
        )}
        {imgCount > 1 && (
          <span className="absolute bottom-2 right-2 bg-black/55 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <i className="ri-image-2-line text-[10px]"></i> {imgCount}
          </span>
        )}
        {item.isVip && (
          <span className="absolute bottom-2 left-2 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">VIP</span>
        )}
      </div>
      <div className="px-3 pt-2 pb-3">
        <p className="text-sm font-medium leading-snug line-clamp-2 text-gray-800 mb-1">{item.title}</p>
        {price && <p className="text-base font-bold" style={{ color: '#d0011b' }}>{price}</p>}
        {(item.location || item.address) && (
          <p className="text-xs text-gray-400 mt-0.5 truncate flex items-center gap-0.5">
            <i className="ri-map-pin-line"></i> {item.location || item.address}
          </p>
        )}
      </div>
    </Link>
  );
}

// Editorial UI: compact forum rows with clear info hierarchy
function ForumRow({ post }: { post: any }) {
  return (
    <Link href={`/forum/${post.id}`}
      className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-xl px-2 transition-colors duration-150">
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        {post.images?.[0] ? (
          <img src={typeof post.images[0] === 'string' ? post.images[0] : post.images[0].url}
            alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-cyan-50">
            <i className="ri-discuss-line text-xl text-cyan-300"></i>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{post.title}</p>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
          <span className="font-medium text-gray-600">{post.user?.fullName || post.user?.username || 'Ẩn danh'}</span>
          <span className="flex items-center gap-0.5"><i className="ri-heart-line"></i> {post.likeCount || 0}</span>
          <span className="flex items-center gap-0.5"><i className="ri-chat-1-line"></i> {post._count?.comments || 0}</span>
          {post.createdAt && <span className="ml-auto">{timeAgo(post.createdAt)}</span>}
        </div>
      </div>
    </Link>
  );
}

// Humanized UI: friendly empty state with action cue
function EmptyBlock({ label, icon = 'ri-inbox-line' }: { label: string; icon?: string }) {
  return (
    <div className="py-10 text-center flex flex-col items-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
        <i className={`${icon} text-2xl text-gray-300`}></i>
      </div>
      <p className="text-sm text-gray-400 font-medium">{label}</p>
      <p className="text-xs text-gray-300 mt-1">Hãy là người đầu tiên đăng tin!</p>
    </div>
  );
}
