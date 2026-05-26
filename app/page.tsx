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

// ── Pinterest cream palette — warms the page without competing with product images
const PAGE_BG = '#f5f4ee';
const CARD_BG = '#ffffff';

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

// Pinterest filter-chip style — horizontal scroll, icon + label
const categories = [
  { title: 'Nông sản',     href: '/products?category=NONG_SAN', icon: 'ri-seedling-fill',           bg: 'bg-green-100',  color: 'text-green-700',  ring: 'hover:ring-green-300' },
  { title: 'Bất động sản', href: '/real-estate',                icon: 'ri-home-4-fill',             bg: 'bg-orange-100', color: 'text-orange-700', ring: 'hover:ring-orange-300' },
  { title: 'Việc làm',     href: '/jobs',                       icon: 'ri-briefcase-4-fill',        bg: 'bg-blue-100',   color: 'text-blue-700',   ring: 'hover:ring-blue-300' },
  { title: 'Vật nuôi',     href: '/vat-nuoi',                   icon: 'ri-bear-smile-fill',         bg: 'bg-amber-100',  color: 'text-amber-700',  ring: 'hover:ring-amber-300' },
  { title: 'Dịch vụ',      href: '/dich-vu',                    icon: 'ri-customer-service-2-fill', bg: 'bg-purple-100', color: 'text-purple-700', ring: 'hover:ring-purple-300' },
  { title: 'Diễn đàn',     href: '/forum',                      icon: 'ri-discuss-fill',            bg: 'bg-cyan-100',   color: 'text-cyan-700',   ring: 'hover:ring-cyan-300' },
  { title: 'Quảng cáo',    href: '/advertisements',             icon: 'ri-megaphone-fill',          bg: 'bg-red-100',    color: 'text-red-600',    ring: 'hover:ring-red-300' },
  { title: 'Cảnh báo',     href: '/canh-bao',                   icon: 'ri-alert-fill',              bg: 'bg-yellow-100', color: 'text-yellow-700', ring: 'hover:ring-yellow-300' },
  { title: 'Bảng giá',     href: '/market-prices',              icon: 'ri-bar-chart-2-fill',        bg: 'bg-teal-100',   color: 'text-teal-700',   ring: 'hover:ring-teal-300' },
  { title: 'Sản phẩm',     href: '/products',                   icon: 'ri-shopping-bag-3-fill',     bg: 'bg-lime-100',   color: 'text-lime-700',   ring: 'hover:ring-lime-300' },
];

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

  const totalListings = products.length + realEstate.length + jobs.length + vatNuoi.length + dichVu.length;

  return (
    // Pinterest warm cream canvas — gets out of the product images' way
    <main className="min-h-screen" style={{ background: PAGE_BG }}>

      {/* ===== HERO BANNER ===== */}
      <div className="relative overflow-hidden" style={{ background: '#ffd400', paddingTop: 44, paddingBottom: 24 }}>
        {/* Organic floating icons */}
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

        {/* Headline — Airbnb: trusts whitespace + tight weight over heavy type */}
        <div className="text-center px-4 relative z-10">
          <h1 className="font-black text-gray-900 leading-tight tracking-tight" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.4rem)' }}>
            Giá tốt, gần nhà, chốt nhanh!
          </h1>
          <p className="text-gray-700 text-sm font-semibold mt-1">Mua bán · Bất động sản · Việc làm tại Nhân Cơ, Đắk Nông</p>
        </div>

        {/* Search — Airbnb pill-shaped search bar */}
        <div className="relative z-10 max-w-2xl mx-auto px-4 mt-4">
          <HomepageClient />
        </div>

        {/* Social proof — authentic, micro */}
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

        {/* ===== DANH MỤC — Pinterest filter-chip horizontal scroll ===== */}
        {/* Each chip: colored pill with icon + label, scrolls on mobile */}
        <div className="bg-white mt-3 px-4 py-3 rounded-2xl shadow-sm">
          {/* Linear eyebrow: uppercase tiny label with positive tracking */}
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2.5">Danh mục</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {categories.map(cat => (
              <Link key={cat.href} href={cat.href}
                className={`group inline-flex items-center gap-1.5 px-3 py-2 rounded-full ${cat.bg} whitespace-nowrap flex-shrink-0 ring-2 ring-transparent ${cat.ring} transition-all duration-200 hover:scale-105`}>
                <i className={`${cat.icon} ${cat.color} text-sm`}></i>
                <span className={`text-xs font-bold ${cat.color}`}>{cat.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ===== GIÁ THỊ TRƯỜNG ===== */}
        <MarketPriceWidget />

        {/* ===== VIP / NỔI BẬT — Framer gradient-spotlight-card treatment ===== */}
        {vipListings.length > 0 && (
          <section className="mt-3 overflow-hidden rounded-2xl" style={{ background: 'linear-gradient(135deg, #fff6c0 0%, #ffdc00 60%, #f5b800 100%)' }}>
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-amber-800/70 uppercase">Được đề xuất</p>
                <h2 className="font-extrabold text-amber-900 text-base flex items-center gap-2 mt-0.5" style={{ letterSpacing: '-0.3px' }}>
                  <i className="ri-vip-crown-fill text-amber-700 text-lg"></i>
                  Tin nổi bật
                  <span className="bg-amber-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">VIP</span>
                </h2>
              </div>
              <Link href="/products" className="text-xs text-amber-800 font-bold flex items-center gap-0.5 bg-white/40 px-2.5 py-1.5 rounded-full">
                Xem tất cả <i className="ri-arrow-right-s-line text-sm"></i>
              </Link>
            </div>
            {/* Cards on white surface lifted from gradient — Airbnb card pattern */}
            <div className="bg-white rounded-2xl mx-2 mb-2">
              <Grid>
                {vipListings.slice(0, 10).map((item: any) => (
                  <ListingCard key={`vip-${item.id}`} item={item} />
                ))}
              </Grid>
            </div>
          </section>
        )}

        {/* ===== SẢN PHẨM MỚI ===== */}
        <Section eyebrow="Mới nhất" title="Sản phẩm mới đăng" icon="ri-store-line" iconColor="text-green-600" iconBg="bg-green-50" href="/products">
          {products.length === 0
            ? <EmptyBlock label="Chưa có sản phẩm nào" icon="ri-store-2-line" />
            : <Grid>{products.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'product' }} />)}</Grid>
          }
        </Section>

        {/* ===== BẤT ĐỘNG SẢN ===== */}
        <Section eyebrow="Nhà đất" title="Bất động sản" icon="ri-home-4-line" iconColor="text-orange-600" iconBg="bg-orange-50" href="/real-estate">
          {realEstate.length === 0
            ? <EmptyBlock label="Chưa có tin bất động sản" icon="ri-home-2-line" />
            : <Grid>{realEstate.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'real-estate' }} />)}</Grid>
          }
        </Section>

        {/* ===== VẬT NUÔI ===== */}
        <Section eyebrow="Chăn nuôi" title="Vật nuôi" icon="ri-bear-smile-line" iconColor="text-amber-600" iconBg="bg-amber-50" href="/vat-nuoi">
          {vatNuoi.length === 0
            ? <EmptyBlock label="Chưa có tin vật nuôi" icon="ri-bear-smile-line" />
            : <Grid>{vatNuoi.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'product' }} />)}</Grid>
          }
        </Section>

        {/* ===== DỊCH VỤ ===== */}
        <Section eyebrow="Phục vụ" title="Dịch vụ" icon="ri-service-line" iconColor="text-purple-600" iconBg="bg-purple-50" href="/dich-vu">
          {dichVu.length === 0
            ? <EmptyBlock label="Chưa có tin dịch vụ" icon="ri-customer-service-2-line" />
            : <Grid>{dichVu.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'product' }} />)}</Grid>
          }
        </Section>

        {/* ===== VIỆC LÀM ===== */}
        <Section eyebrow="Cơ hội" title="Tuyển dụng mới" icon="ri-briefcase-line" iconColor="text-blue-600" iconBg="bg-blue-50" href="/jobs">
          {jobs.length === 0
            ? <EmptyBlock label="Chưa có tin tuyển dụng" icon="ri-briefcase-4-line" />
            : <Grid>{jobs.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'job' }} />)}</Grid>
          }
        </Section>

        {/* ===== QUẢNG CÁO ===== */}
        {ads.length > 0 && (
          <Section eyebrow="Khuyến mãi" title="Quảng cáo & Khuyến mãi" icon="ri-megaphone-line" iconColor="text-red-500" iconBg="bg-red-50" href="/advertisements">
            <Grid>{ads.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'ad' }} />)}</Grid>
          </Section>
        )}

        {/* ===== DIỄN ĐÀN ===== */}
        <Section eyebrow="Cộng đồng" title="Diễn đàn cộng đồng" icon="ri-discuss-line" iconColor="text-cyan-600" iconBg="bg-cyan-50" href="/forum">
          {forum.length === 0
            ? <EmptyBlock label="Chưa có bài viết nào" icon="ri-discuss-line" />
            : <div className="px-4 py-3 space-y-1">
                {forum.map((post: any) => <ForumRow key={post.id} post={post} />)}
              </div>
          }
        </Section>

        {/* ===== TRUST SIGNALS — Linear surface-1 card lift ===== */}
        <div className="mt-4 rounded-2xl overflow-hidden" style={{ background: CARD_BG, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="px-4 pt-4 pb-1">
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Cam kết</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-y sm:divide-y-0 divide-gray-100">
            {[
              { icon: 'ri-shield-check-fill', color: 'text-green-600', bg: 'bg-green-50', title: 'Miễn phí đăng tin', sub: 'Không mất phí cơ bản' },
              { icon: 'ri-user-voice-fill',   color: 'text-blue-600',  bg: 'bg-blue-50',  title: 'Người thật, tin thật', sub: 'Tài khoản xác minh' },
              { icon: 'ri-map-pin-fill',      color: 'text-orange-600',bg: 'bg-orange-50',title: 'Giao dịch tại chỗ', sub: 'Nhân Cơ, Đắk Nông' },
              { icon: 'ri-customer-service-2-fill', color: 'text-purple-600', bg: 'bg-purple-50', title: 'Hỗ trợ nhanh', sub: '0888.317.289' },
            ].map(t => (
              <div key={t.title} className="flex items-start gap-3 px-4 py-4">
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

      {/* ===== FOOTER — Airbnb: canvas-matching footer, no contrast band ===== */}
      <footer style={{ background: CARD_BG, borderTop: '1px solid #e8e7e1' }}>
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="font-black text-lg mb-1 text-gray-900 flex items-center gap-1.5">
                <i className="ri-store-2-fill text-yellow-500"></i>
                Chợ Nhân Cơ
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed" style={{ letterSpacing: '-0.1px' }}>
                Kết nối giao thương, gắn kết cộng đồng nông thôn tại Nhân Cơ, Đắk Nông.
              </p>
              <div className="flex gap-2 mt-3">
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
              {/* Linear eyebrow style for footer column heads */}
              <h4 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">Danh mục</h4>
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
                    <Link href={href} className="hover:text-gray-900 transition-colors duration-150">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">Liên hệ</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <i className="ri-phone-fill text-gray-400 flex-shrink-0"></i>
                  <a href="tel:0888317289" className="hover:text-gray-900 transition-colors">0888.317.289</a>
                </li>
                <li className="flex items-center gap-2">
                  <i className="ri-mail-fill text-gray-400 flex-shrink-0"></i>
                  <a href="mailto:chonhanco41@gmail.com" className="hover:text-gray-900 transition-colors">chonhanco41@gmail.com</a>
                </li>
                <li className="flex items-center gap-2">
                  <i className="ri-map-pin-fill text-gray-400 flex-shrink-0"></i>
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
          {/* Airbnb legal band — muted, caption-sm */}
          <div className="pt-4 text-center text-xs text-gray-400" style={{ borderTop: '1px solid #e8e7e1' }}>
            © 2025 Chợ Nhân Cơ. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </footer>

    </main>
  );
}

// ── Shared layout components ──────────────────────────────────────────────────

// Section — Linear eyebrow + Airbnb display hierarchy + Pinterest 16px radius
function Section({ eyebrow, title, icon, iconColor, iconBg, href, badge, children }: {
  eyebrow?: string;
  title: string; icon: string; iconColor: string; iconBg: string; href: string; badge?: string; children: React.ReactNode;
}) {
  return (
    <section className="mt-3 overflow-hidden rounded-2xl" style={{ background: CARD_BG, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div className="flex items-center justify-between px-4 pt-4 pb-3" style={{ borderBottom: '1px solid #f0efe9' }}>
        <div>
          {/* Linear-style eyebrow: positive tracking, all-caps, muted */}
          {eyebrow && (
            <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase mb-1">{eyebrow}</p>
          )}
          {/* Airbnb-style section title: display-sm weight, modest size */}
          <h2 className="font-extrabold text-gray-900 flex items-center gap-2" style={{ fontSize: 15, letterSpacing: '-0.3px' }}>
            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl ${iconBg} flex-shrink-0`}>
              <i className={`${icon} ${iconColor} text-base`}></i>
            </span>
            {title}
            {badge && (
              <span className="bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-0.5">{badge}</span>
            )}
          </h2>
        </div>
        <Link href={href} className="text-xs text-gray-500 font-semibold hover:text-gray-900 transition-colors flex items-center gap-0.5 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-full">
          Xem tất cả <i className="ri-arrow-right-s-line text-sm"></i>
        </Link>
      </div>
      {children}
    </section>
  );
}

// Grid — Pinterest 8px gutter inside cards
function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 px-3 py-3">
      {children}
    </div>
  );
}

// ListingCard — Pinterest 16px radius + Airbnb single-shadow-tier on hover
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
  const isNew = item.createdAt && (Date.now() - new Date(item.createdAt).getTime()) < 86400000;

  return (
    {/* Pinterest pin-card: 16px radius, flat default, single Airbnb shadow tier on hover via CSS */}
    <Link href={href}
      className="group block overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.06),0_6px_20px_rgba(0,0,0,0.08)]"
      style={{ background: CARD_BG, border: '1px solid rgba(0,0,0,0.06)' }}>
      {/* Photo — Pinterest pin-card: full-bleed, image IS the card */}
      <div className="relative overflow-hidden rounded-t-2xl bg-gray-100" style={{ aspectRatio: '4/3' }}>
        {imgUrl ? (
          <img src={imgUrl} alt={item.title}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-400" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: '#f5f4ee' }}>
            <i className="ri-image-line text-3xl text-gray-300"></i>
          </div>
        )}
        {/* LikeButton */}
        <LikeButton itemId={String(item.id)} />
        {/* Time badge — Airbnb overlay pill style */}
        {item.createdAt && (
          <span className="absolute top-2 left-2 bg-black/55 text-white text-[10px] px-2 py-0.5 rounded-full font-medium backdrop-blur-sm">
            {timeAgo(item.createdAt)}
          </span>
        )}
        {/* "Mới" badge for < 24h — Pinterest pin-overlay-pill */}
        {isNew && !item.isVip && (
          <span className="absolute bottom-2 left-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">Mới</span>
        )}
        {imgCount > 1 && (
          <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 backdrop-blur-sm">
            <i className="ri-image-2-line text-[10px]"></i> {imgCount}
          </span>
        )}
        {item.isVip && (
          <span className="absolute bottom-2 left-2 bg-amber-400 text-gray-900 text-[10px] font-black px-1.5 py-0.5 rounded-full">VIP</span>
        )}
      </div>
      {/* Meta — Airbnb: 4–5 lines of metadata beneath photo */}
      <div className="px-3 pt-2 pb-3">
        <p className="text-[13px] font-semibold leading-snug line-clamp-2 text-gray-800 mb-1" style={{ letterSpacing: '-0.1px' }}>{item.title}</p>
        {price && (
          <p className="text-sm font-black" style={{ color: '#d0011b', letterSpacing: '-0.2px' }}>{price}</p>
        )}
        {(item.location || item.address) && (
          <p className="text-[11px] text-gray-400 mt-0.5 truncate flex items-center gap-0.5">
            <i className="ri-map-pin-line text-[11px]"></i> {item.location || item.address}
          </p>
        )}
      </div>
    </Link>
  );
}

// ForumRow — Pinterest editorial: article-layout with clear info hierarchy
function ForumRow({ post }: { post: any }) {
  return (
    <Link href={`/forum/${post.id}`}
      className="flex items-start gap-3 py-2.5 px-2 rounded-xl transition-colors duration-150 hover:bg-[#f5f4ee] last:border-0"
      style={{ borderBottom: '1px solid #f0efe9' }}>
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0" style={{ background: '#f5f4ee' }}>
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
        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug" style={{ letterSpacing: '-0.1px' }}>{post.title}</p>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
          <span className="font-semibold text-gray-600">{post.user?.fullName || post.user?.username || 'Ẩn danh'}</span>
          <span className="flex items-center gap-0.5"><i className="ri-heart-line"></i> {post.likeCount || 0}</span>
          <span className="flex items-center gap-0.5"><i className="ri-chat-1-line"></i> {post._count?.comments || 0}</span>
          {post.createdAt && <span className="ml-auto">{timeAgo(post.createdAt)}</span>}
        </div>
      </div>
    </Link>
  );
}

// EmptyBlock — Pinterest feature-card: warm surface-card, not cold gray
function EmptyBlock({ label, icon = 'ri-inbox-line' }: { label: string; icon?: string }) {
  return (
    <div className="py-10 text-center flex flex-col items-center mx-4 my-3 rounded-xl" style={{ background: PAGE_BG }}>
      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-3 shadow-sm">
        <i className={`${icon} text-2xl text-gray-300`}></i>
      </div>
      <p className="text-sm text-gray-400 font-medium">{label}</p>
      <p className="text-xs text-gray-300 mt-1">Hãy là người đầu tiên đăng tin!</p>
    </div>
  );
}
