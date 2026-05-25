import Link from 'next/link';
import { Metadata } from 'next';
import HomepageClient from './HomepageClient';
import LikeButton from './components/LikeButton';
import MarketPriceWidget from './components/MarketPriceWidget';

export const metadata: Metadata = {
  title: 'Chợ Nhân Cơ — Mua bán nông sản, bất động sản, việc làm tại Đắk Nông',
  description: 'Chợ Nhân Cơ là nền tảng mua bán trực tuyến cho cộng đồng Nhân Cơ, Đắk Nông.',
  alternates: { canonical: 'https://cho-nhan-co-frontend-bxj2-18271g0zq.vercel.app' },
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

const categories = [
  { title: 'Nông sản',     href: '/products?category=NONG_SAN', img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=120&h=120&fit=crop&q=80', icon: 'ri-seedling-line',           bg: 'bg-green-100',  color: 'text-green-600' },
  { title: 'Bất động sản', href: '/real-estate',                img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=120&h=120&fit=crop&q=80', icon: 'ri-home-4-line',             bg: 'bg-orange-100', color: 'text-orange-600' },
  { title: 'Việc làm',     href: '/jobs',                       img: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=120&h=120&fit=crop&q=80', icon: 'ri-briefcase-4-line',        bg: 'bg-blue-100',   color: 'text-blue-600' },
  { title: 'Vật nuôi',     href: '/vat-nuoi',                   img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=120&h=120&fit=crop&q=80', icon: 'ri-bear-smile-line',         bg: 'bg-amber-100',  color: 'text-amber-600' },
  { title: 'Dịch vụ',      href: '/dich-vu',                    img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=120&h=120&fit=crop&q=80', icon: 'ri-customer-service-2-line', bg: 'bg-purple-100', color: 'text-purple-600' },
  { title: 'Diễn đàn',     href: '/forum',                      img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=120&h=120&fit=crop&q=80', icon: 'ri-discuss-line',            bg: 'bg-cyan-100',   color: 'text-cyan-600' },
  { title: 'Quảng cáo',    href: '/advertisements',             img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=120&h=120&fit=crop&q=80', icon: 'ri-megaphone-line',          bg: 'bg-red-100',    color: 'text-red-500' },
  { title: 'Cảnh báo',     href: '/canh-bao',                   img: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=120&h=120&fit=crop&q=80', icon: 'ri-alert-line',              bg: 'bg-yellow-100', color: 'text-yellow-600' },
  { title: 'Bảng giá',     href: '/market-prices',              img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&h=120&fit=crop&q=80', icon: 'ri-bar-chart-2-line',        bg: 'bg-teal-100',   color: 'text-teal-600' },
  { title: 'Sản phẩm',     href: '/products',                   img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&h=120&fit=crop&q=80',    icon: 'ri-shopping-bag-3-line',     bg: 'bg-lime-100',   color: 'text-lime-600' },
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

  return (
    <main className="min-h-screen bg-gray-100">

      {/* ===== BANNER ===== */}
      <div className="relative" style={{ background: '#ffd400', paddingTop: 44, paddingBottom: 32 }}>
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

        <div className="text-center px-4 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
            Giá tốt, gần nhà, chốt nhanh!
          </h1>
          <p className="text-gray-700 text-sm font-semibold mt-1">Mua bán · Bất động sản · Việc làm tại Nhân Cơ, Đắk Nông</p>
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-4 mt-5">
          <HomepageClient />
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-3 sm:px-4 pb-4">

        {/* ===== CATEGORIES ===== */}
        <div className="bg-white mt-3 px-3 py-3 rounded-lg">
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
            {categories.map(cat => (
              <Link key={cat.href} href={cat.href}
                className="flex flex-col items-center gap-1.5 py-2 hover:opacity-80 transition-opacity">
                <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={cat.img} alt={cat.title} className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] text-gray-600 font-medium text-center leading-tight">{cat.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ===== GIÁ THỊ TRƯỜNG ===== */}
        <MarketPriceWidget />

        {/* ===== VIP / NỔI BẬT ===== */}
        {vipListings.length > 0 && (
          <Section title="Tin nổi bật" icon="ri-vip-crown-line" iconColor="text-amber-500" href="/products" badge="VIP">
            <Grid>
              {vipListings.slice(0, 10).map((item: any) => (
                <ListingCard key={`vip-${item.id}`} item={item} />
              ))}
            </Grid>
          </Section>
        )}

        {/* ===== SẢN PHẨM MỚI ===== */}
        <Section title="Sản phẩm mới đăng" icon="ri-store-line" iconColor="text-green-500" href="/products">
          {products.length === 0
            ? <EmptyBlock label="Chua co san pham nao" />
            : <Grid>{products.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'product' }} />)}</Grid>
          }
        </Section>

        {/* ===== BẤT ĐỘNG SẢN ===== */}
        <Section title="Bat dong san" icon="ri-home-4-line" iconColor="text-orange-500" href="/real-estate">
          {realEstate.length === 0
            ? <EmptyBlock label="Chua co tin bat dong san" />
            : <Grid>{realEstate.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'real-estate' }} />)}</Grid>
          }
        </Section>

        {/* ===== VẬT NUÔI ===== */}
        <Section title="Vat nuoi" icon="ri-bear-smile-line" iconColor="text-amber-500" href="/vat-nuoi">
          {vatNuoi.length === 0
            ? <EmptyBlock label="Chua co tin vat nuoi" />
            : <Grid>{vatNuoi.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'product' }} />)}</Grid>
          }
        </Section>

        {/* ===== DỊCH VỤ ===== */}
        <Section title="Dich vu" icon="ri-service-line" iconColor="text-purple-500" href="/dich-vu">
          {dichVu.length === 0
            ? <EmptyBlock label="Chua co tin dich vu" />
            : <Grid>{dichVu.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'product' }} />)}</Grid>
          }
        </Section>

        {/* ===== VIỆC LÀM ===== */}
        <Section title="Tuyen dung moi" icon="ri-briefcase-line" iconColor="text-blue-500" href="/jobs">
          {jobs.length === 0
            ? <EmptyBlock label="Chua co tin tuyen dung" />
            : <Grid>{jobs.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'job' }} />)}</Grid>
          }
        </Section>

        {/* ===== QUẢNG CÁO ===== */}
        {ads.length > 0 && (
          <Section title="Quang cao & Khuyen mai" icon="ri-megaphone-line" iconColor="text-red-500" href="/advertisements">
            <Grid>{ads.map((item: any) => <ListingCard key={item.id} item={{ ...item, _type: 'ad' }} />)}</Grid>
          </Section>
        )}

        {/* ===== DIỄN ĐÀN ===== */}
        <Section title="Dien dan cong dong" icon="ri-discuss-line" iconColor="text-cyan-500" href="/forum">
          {forum.length === 0
            ? <EmptyBlock label="Chua co bai viet nao" />
            : <div className="px-4 py-3 space-y-2">
                {forum.map((post: any) => <ForumRow key={post.id} post={post} />)}
              </div>
          }
        </Section>

      </div>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Cho Nhan Co</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Ket noi giao thuong, gan ket cong dong nong thon tai Nhan Co, Dak Nong.</p>
              <div className="flex gap-3 mt-3">
                <a href="https://www.facebook.com/trungnguyenanhtan" className="text-gray-400 hover:text-blue-600 transition"><i className="ri-facebook-circle-line text-xl"></i></a>
                <a href="https://zalo.me/0888317289" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition"><i className="ri-phone-line text-xl"></i></a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">Danh muc</h4>
              <ul className="space-y-1.5 text-sm text-gray-500">
                {[['San pham', '/products'], ['Bat dong san', '/real-estate'], ['Tuyen dung', '/jobs'], ['Vat nuoi', '/vat-nuoi'], ['Dich vu', '/dich-vu'], ['Dien dan', '/forum'], ['Canh bao', '/canh-bao']].map(([label, href]) => (
                  <li key={href}><Link href={href} className="hover:text-red-600 transition">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">Lien he</h4>
              <ul className="space-y-1.5 text-sm text-gray-500">
                <li className="flex items-center gap-2"><i className="ri-phone-line"></i> 0888.317.289</li>
                <li className="flex items-center gap-2"><i className="ri-mail-line"></i> chonhanco41@gmail.com</li>
                <li className="flex items-center gap-2"><i className="ri-map-pin-line"></i> Xa Nhan Co, Dak Nong</li>
              </ul>
              <a href="https://www.facebook.com/share/g/1Gwg2sziS1/" className="inline-block mt-3 text-sm text-blue-500 hover:underline">Tham gia nhom Facebook →</a>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4 text-center text-xs text-gray-400">
            © 2025 Cho Nhan Co. Tat ca quyen duoc bao luu.
          </div>
        </div>
      </footer>

    </main>
  );
}

// ── Shared layout components ──────────────────────────────────────────────────

function Section({ title, icon, iconColor, href, badge, children }: {
  title: string; icon: string; iconColor: string; href: string; badge?: string; children: React.ReactNode;
}) {
  return (
    <section className="mt-2 bg-white overflow-hidden rounded-lg">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
          <i className={`${icon} ${iconColor}`}></i>
          {title}
          {badge && <span className="bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm ml-1">{badge}</span>}
        </h2>
        <Link href={href} className="text-xs text-red-600 font-medium">Xem tất cả →</Link>
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
    <Link href={href} className="group bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow block border border-gray-100">
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

function ForumRow({ post }: { post: any }) {
  return (
    <Link href={`/forum/${post.id}`}
      className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg px-1 transition">
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {post.images?.[0] ? (
          <img src={typeof post.images[0] === 'string' ? post.images[0] : post.images[0].url}
            alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="ri-discuss-line text-xl text-gray-300"></i>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{post.title}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          <span>{post.user?.fullName || post.user?.username || 'An danh'}</span>
          <span className="flex items-center gap-0.5"><i className="ri-heart-line"></i> {post.likeCount || 0}</span>
          <span className="flex items-center gap-0.5"><i className="ri-chat-1-line"></i> {post._count?.comments || 0}</span>
          {post.createdAt && <span>{timeAgo(post.createdAt)}</span>}
        </div>
      </div>
    </Link>
  );
}

function EmptyBlock({ label }: { label: string }) {
  return (
    <div className="py-8 text-center text-gray-400 text-sm">
      <i className="ri-inbox-line text-3xl block mb-2 text-gray-300"></i>
      {label}
    </div>
  );
}
