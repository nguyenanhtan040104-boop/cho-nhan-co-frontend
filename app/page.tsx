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

const API = process.env.NEXT_PUBLIC_API_URL || 'https://cho-nhan-co-backend-production.up.railway.app/api';

async function getHomeData() {
  try {
    const [products, jobs, realEstate, forum] = await Promise.allSettled([
      fetch(`${API}/products?limit=12&sortBy=newest`, { next: { revalidate: 300 } }).then(r => r.json()),
      fetch(`${API}/jobs?limit=6&sortBy=newest`, { next: { revalidate: 300 } }).then(r => r.json()),
      fetch(`${API}/real-estates?limit=6`, { next: { revalidate: 300 } }).then(r => r.json()),
      fetch(`${API}/forum/posts?limit=5`, { next: { revalidate: 300 } }).then(r => r.json()),
    ]);
    return {
      products: products.status === 'fulfilled' ? (products.value.data || []) : [],
      jobs: jobs.status === 'fulfilled' ? (jobs.value.data || []) : [],
      realEstate: realEstate.status === 'fulfilled' ? (realEstate.value.data || []) : [],
      forum: forum.status === 'fulfilled' ? (forum.value.data || []) : [],
    };
  } catch { return { products: [], jobs: [], realEstate: [], forum: [] }; }
}

const categories = [
  { title: 'Nông sản', href: '/products?category=NONG_SAN', img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=120&h=120&fit=crop&q=80' },
  { title: 'Bất động sản', href: '/real-estate', img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=120&h=120&fit=crop&q=80' },
  { title: 'Tuyển dụng', href: '/jobs', img: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=120&h=120&fit=crop&q=80' },
  { title: 'Vật nuôi', href: '/products?category=VAT_NUOI', img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=120&h=120&fit=crop&q=80' },
  { title: 'Dịch vụ', href: '/products?category=DICH_VU', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=120&h=120&fit=crop&q=80' },
  { title: 'Diễn đàn', href: '/forum', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=120&h=120&fit=crop&q=80' },
  { title: 'Cảnh báo', href: '/canh-bao', img: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=120&h=120&fit=crop&q=80' },
  { title: 'Quảng cáo', href: '/advertisements', img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=120&h=120&fit=crop&q=80' },
  { title: 'Bảng giá', href: '/market-prices', img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&h=120&fit=crop&q=80' },
  { title: 'Sản phẩm', href: '/products', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&h=120&fit=crop&q=80' },
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
  if (type === 'product') return `${Number(item.price).toLocaleString('vi-VN')}đ`;
  if (type === 'real-estate') {
    const p = Number(item.price);
    return p >= 1e9 ? (p / 1e9).toFixed(1) + ' tỷ' : (p / 1e6).toFixed(0) + ' triệu';
  }
  if (type === 'job') return item.salary || 'Thỏa thuận';
  if (type === 'forum') return item.category || 'Diễn đàn';
  return '';
}

export default async function HomePage() {
  const { products, jobs, realEstate, forum } = await getHomeData();

  const vipListings = [
    ...products.filter((p: any) => p.isVip).map((p: any) => ({ ...p, _type: 'product' })),
    ...realEstate.filter((p: any) => p.isVip).map((p: any) => ({ ...p, _type: 'real-estate' })),
  ];

  return (
    <main className="min-h-screen bg-gray-100">

      {/* ===== BANNER ===== */}
      <div className="relative" style={{ background: '#ffd400', paddingTop: 44, paddingBottom: 32 }}>
        {/* === Scattered decorations (absolute positioned) === */}
        {/* Left side */}
        <div className="absolute top-4 left-6 hidden md:flex w-16 h-16 bg-white/25 rounded-2xl items-center justify-center pointer-events-none" style={{ transform: 'rotate(-14deg)' }}>
          <i className="ri-home-4-fill text-4xl" style={{ color: 'rgba(0,0,0,0.55)' }}></i>
        </div>
        <div className="absolute bottom-10 left-10 hidden md:flex w-12 h-12 bg-white/20 rounded-2xl items-center justify-center pointer-events-none" style={{ transform: 'rotate(8deg)' }}>
          <i className="ri-leaf-fill text-2xl" style={{ color: 'rgba(0,0,0,0.5)' }}></i>
        </div>
        <div className="absolute top-1/2 left-28 hidden lg:flex w-10 h-10 bg-white/20 rounded-xl items-center justify-center pointer-events-none" style={{ transform: 'translateY(-50%) rotate(-6deg)' }}>
          <i className="ri-briefcase-fill text-xl" style={{ color: 'rgba(0,0,0,0.45)' }}></i>
        </div>
        <div className="absolute top-6 left-36 hidden xl:flex w-9 h-9 bg-white/15 rounded-xl items-center justify-center pointer-events-none" style={{ transform: 'rotate(10deg)' }}>
          <i className="ri-car-fill text-lg" style={{ color: 'rgba(0,0,0,0.4)' }}></i>
        </div>
        {/* Right side */}
        <div className="absolute top-3 right-8 hidden md:flex w-16 h-16 bg-white/25 rounded-2xl items-center justify-center pointer-events-none" style={{ transform: 'rotate(12deg)' }}>
          <i className="ri-shopping-bag-3-fill text-4xl" style={{ color: 'rgba(0,0,0,0.55)' }}></i>
        </div>
        <div className="absolute bottom-8 right-12 hidden md:flex w-12 h-12 bg-white/20 rounded-2xl items-center justify-center pointer-events-none" style={{ transform: 'rotate(-9deg)' }}>
          <i className="ri-bear-smile-fill text-2xl" style={{ color: 'rgba(0,0,0,0.5)' }}></i>
        </div>
        <div className="absolute top-1/2 right-28 hidden lg:flex w-10 h-10 bg-white/20 rounded-xl items-center justify-center pointer-events-none" style={{ transform: 'translateY(-50%) rotate(7deg)' }}>
          <i className="ri-tv-fill text-xl" style={{ color: 'rgba(0,0,0,0.45)' }}></i>
        </div>
        <div className="absolute bottom-6 right-36 hidden xl:flex w-9 h-9 bg-white/15 rounded-xl items-center justify-center pointer-events-none" style={{ transform: 'rotate(-12deg)' }}>
          <i className="ri-sofa-fill text-lg" style={{ color: 'rgba(0,0,0,0.4)' }}></i>
        </div>

        {/* Text */}
        <div className="text-center px-4 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
            Giá tốt, gần nhà, chốt nhanh!
          </h1>
          <p className="text-gray-700 text-sm font-semibold mt-1">Mua bán · Bất động sản · Việc làm tại Nhân Cơ, Đắk Nông</p>
        </div>

        {/* Search bar — inside banner, bottom */}
        <div className="relative z-10 max-w-2xl mx-auto px-4 mt-5">
          <HomepageClient />
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-3 sm:px-4 pb-4">

          {/* ===== CATEGORIES ===== */}
        <div className="bg-white mt-3 px-2 py-3">
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
            {categories.map(cat => (
              <Link key={cat.href} href={cat.href}
                className="flex flex-col items-center gap-1.5 py-2 hover:opacity-80 transition-opacity">
                <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={cat.img} alt={cat.title} className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] text-gray-600 font-medium text-center leading-tight">{cat.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ===== GIÁ THỊ TRƯỜNG ===== */}
        <MarketPriceWidget />

        {/* ===== VIP / NỔI BẬT ===== */}
        {vipListings.length > 0 && (
          <section className="mt-2 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <span className="bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">VIP</span>
                Tin nổi bật
              </h2>
              <Link href="/products" className="text-xs text-red-600 font-medium">Xem thêm →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-4 py-4 bg-white">
              {vipListings.slice(0, 6).map((item: any) => (
                <ListingCard key={`vip-${item.id}`} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* ===== SẢN PHẨM ===== */}
        <section className="mt-2 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-sm">Sản phẩm mới đăng</h2>
            <Link href="/products" className="text-xs text-red-600 font-medium">Xem tất cả →</Link>
          </div>
          {products.length === 0 ? <EmptyBlock label="Chưa có sản phẩm nào" /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-4 py-4 bg-white">
              {products.slice(0, 12).map((item: any) => (
                <ListingCard key={item.id} item={{ ...item, _type: 'product' }} />
              ))}
            </div>
          )}
        </section>

        {/* ===== BĐS ===== */}
        <section className="mt-2 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
              <i className="ri-home-4-line text-blue-500"></i> Bất động sản
            </h2>
            <Link href="/real-estate" className="text-xs text-red-600">Xem tất cả →</Link>
          </div>
          {realEstate.length === 0 ? <EmptyBlock label="Chưa có tin bất động sản" /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-4 py-4 bg-white">
              {realEstate.slice(0, 6).map((item: any) => (
                <ListingCard key={item.id} item={{ ...item, _type: 'real-estate' }} />
              ))}
            </div>
          )}
        </section>

        {/* ===== TUYỂN DỤNG ===== */}
        <section className="mt-2 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
              <i className="ri-briefcase-line text-purple-500"></i> Tuyển dụng mới
            </h2>
            <Link href="/jobs" className="text-xs text-red-600">Xem tất cả →</Link>
          </div>
          {jobs.length === 0 ? <EmptyBlock label="Chưa có tin tuyển dụng" /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-4 py-4 bg-white">
              {jobs.slice(0, 6).map((item: any) => (
                <ListingCard key={item.id} item={{ ...item, _type: 'job' }} />
              ))}
            </div>
          )}
        </section>

        {/* ===== DIỄN ĐÀN ===== */}
        <section className="mt-2 bg-white overflow-hidden mb-4">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
              <i className="ri-chat-3-line text-cyan-500"></i> Diễn đàn cộng đồng
            </h2>
            <Link href="/forum" className="text-xs text-red-600">Xem tất cả →</Link>
          </div>
          {forum.length === 0 ? <EmptyBlock label="Chưa có bài viết nào" /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-4 py-4 bg-white">
              {forum.slice(0, 6).map((item: any) => (
                <ListingCard key={item.id} item={{ ...item, _type: 'forum' }} />
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Chợ Nhân Cơ</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Kết nối giao thương, gắn kết cộng đồng nông thôn tại Nhân Cơ, Đắk Nông.</p>
              <div className="flex gap-3 mt-3">
                <a href="https://www.facebook.com/trungnguyenanhtan" className="text-gray-400 hover:text-blue-600 transition"><i className="ri-facebook-circle-line text-xl"></i></a>
                <a href="https://zalo.me/0888317289" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition"><i className="ri-phone-line text-xl"></i></a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">Danh mục</h4>
              <ul className="space-y-1.5 text-sm text-gray-500">
                {[['Sản phẩm', '/products'], ['Bất động sản', '/real-estate'], ['Tuyển dụng', '/jobs'], ['Diễn đàn', '/forum'], ['Cảnh báo cộng đồng', '/canh-bao']].map(([label, href]) => (
                  <li key={href}><Link href={href} className="hover:text-red-600 transition">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">Liên hệ</h4>
              <ul className="space-y-1.5 text-sm text-gray-500">
                <li className="flex items-center gap-2"><i className="ri-phone-line"></i> 0888.317.289</li>
                <li className="flex items-center gap-2"><i className="ri-mail-line"></i> chonhanco41@gmail.com</li>
                <li className="flex items-center gap-2"><i className="ri-map-pin-line"></i> Xã Nhân Cơ, Đắk Nông</li>
              </ul>
              <a href="https://www.facebook.com/share/g/1Gwg2sziS1/" className="inline-block mt-3 text-sm text-blue-500 hover:underline">Tham gia nhóm Facebook →</a>
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

function ListingCard({ item }: { item: any }) {
  const href = item._type === 'product' ? `/products/${item.id}`
    : item._type === 'real-estate' ? `/real-estate/${item.id}`
    : item._type === 'forum' ? `/forum/${item.id}`
    : `/jobs/${item.id}`;
  // products/real-estate: images[0].url | jobs/forum: images[0] là string URL
  const imgUrl = item.images?.[0]?.url || (typeof item.images?.[0] === 'string' ? item.images[0] : null);
  const imgCount = item.images?.length || 0;
  const price = fmtPrice(item, item._type);

  return (
    <Link href={href} className="group bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow block">
      <div className="relative bg-gray-100 overflow-hidden rounded-xl" style={{ aspectRatio: '4/3' }}>
        {imgUrl ? (
          <img src={imgUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <i className="ri-image-line text-3xl text-gray-300"></i>
          </div>
        )}
        {/* Heart button */}
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
        <p className="text-sm font-medium leading-snug line-clamp-2 text-gray-800 mb-1.5">{item.title}</p>
        <p className="text-base font-bold" style={{ color: '#d0011b' }}>{price}</p>
        {(item.location || item.address) && (
          <p className="text-xs text-gray-400 mt-1 truncate flex items-center gap-0.5">
            <i className="ri-map-pin-line"></i> {item.location || item.address}
          </p>
        )}
      </div>
    </Link>
  );
}

function EmptyBlock({ label }: { label: string }) {
  return (
    <div className="py-8 text-center text-gray-400 text-sm">
      <i className="ri-inbox-line text-3xl block mb-2"></i>
      {label}
    </div>
  );
}
