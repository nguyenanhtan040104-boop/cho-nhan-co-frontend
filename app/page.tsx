import Link from 'next/link';
import { Metadata } from 'next';
import HomepageSearchBar from './HomepageClient';

export const metadata: Metadata = {
  title: 'Chợ Nhân Cơ — Mua bán nông sản, bất động sản, việc làm tại Đắk Nông',
  description: 'Chợ Nhân Cơ là nền tảng mua bán trực tuyến cho cộng đồng Nhân Cơ, Đắk Nông. Đăng tin nông sản, bất động sản, tuyển dụng miễn phí.',
  alternates: { canonical: 'https://cho-nhan-co-frontend-bxj2-18271g0zq.vercel.app' },
};

const API = process.env.NEXT_PUBLIC_API_URL || 'https://cho-nhan-co-backend-production.up.railway.app/api';

async function getHomeData() {
  try {
    const [products, jobs, realEstate, forum, ads] = await Promise.allSettled([
      fetch(`${API}/products?limit=12&sortBy=newest`, { next: { revalidate: 300 } }).then(r => r.json()),
      fetch(`${API}/jobs?limit=6&sortBy=newest`, { next: { revalidate: 300 } }).then(r => r.json()),
      fetch(`${API}/real-estate?limit=6&sortBy=newest`, { next: { revalidate: 300 } }).then(r => r.json()),
      fetch(`${API}/forum/posts?limit=5`, { next: { revalidate: 300 } }).then(r => r.json()),
      fetch(`${API}/advertisements?limit=4`, { next: { revalidate: 300 } }).then(r => r.json()),
    ]);
    return {
      products: products.status === 'fulfilled' ? (products.value.data || []) : [],
      jobs: jobs.status === 'fulfilled' ? (jobs.value.data || []) : [],
      realEstate: realEstate.status === 'fulfilled' ? (realEstate.value.data || []) : [],
      forum: forum.status === 'fulfilled' ? (forum.value.data || []) : [],
      ads: ads.status === 'fulfilled' ? (ads.value.data || []) : [],
    };
  } catch { return { products: [], jobs: [], realEstate: [], forum: [], ads: [] }; }
}

const categories = [
  { title: 'Sản phẩm', sub: 'Nông sản, thực phẩm', href: '/products', icon: 'ri-leaf-line', color: '#16a34a', bg: '#f0fdf4' },
  { title: 'Bất động sản', sub: 'Đất vườn, nhà cửa', href: '/real-estate', icon: 'ri-home-4-line', color: '#2563eb', bg: '#eff6ff' },
  { title: 'Tuyển dụng', sub: 'Việc làm, nhân công', href: '/jobs', icon: 'ri-briefcase-line', color: '#7c3aed', bg: '#f5f3ff' },
  { title: 'Diễn đàn', sub: 'Hỏi đáp, kinh nghiệm', href: '/forum', icon: 'ri-chat-3-line', color: '#0891b2', bg: '#f0f9ff' },
  { title: 'Cảnh báo', sub: 'Lừa đảo, trộm cắp', href: '/canh-bao', icon: 'ri-alert-line', color: '#b91c1c', bg: '#fef2f2' },
  { title: 'Quảng cáo', sub: 'Khai trương, ưu đãi', href: '/advertisements', icon: 'ri-megaphone-line', color: '#ea580c', bg: '#fff7ed' },
  { title: 'Bảng giá', sub: 'Giá thị trường', href: '/market-prices', icon: 'ri-line-chart-line', color: '#ca8a04', bg: '#fefce8' },
  { title: 'Đăng tin', sub: 'Miễn phí, nhanh chóng', href: '/products/create', icon: 'ri-add-circle-line', color: '#d0011b', bg: '#fff1f2' },
];

function fmtPrice(item: any, type: string) {
  if (type === 'product') return `${Number(item.price).toLocaleString('vi-VN')}đ/${item.unit || 'cái'}`;
  if (type === 'real-estate') {
    const p = Number(item.price);
    return p >= 1e9 ? (p / 1e9).toFixed(1) + ' tỷ' : (p / 1e6).toFixed(0) + ' triệu';
  }
  return item.salary || 'Thỏa thuận';
}

export default async function HomePage() {
  const { products, jobs, realEstate, forum } = await getHomeData();

  const allListings = [
    ...products.map((p: any) => ({ ...p, _type: 'product' })),
    ...realEstate.map((p: any) => ({ ...p, _type: 'real-estate' })),
    ...jobs.map((p: any) => ({ ...p, _type: 'job' })),
  ].sort(() => Math.random() - 0.5);

  const vipListings = allListings.filter((x: any) => x.isVip);
  const normalListings = allListings.filter((x: any) => !x.isVip);

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>

      {/* Hero banner with real Nhân Cơ image */}
      <div className="relative overflow-hidden" style={{ height: '260px' }}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/c/ce/X%C3%A3_Nh%C3%A2n_C%C6%A1%2C_%C4%90%E1%BA%AFk_N%C3%B4ng.jpg"
          alt="Xã Nhân Cơ, Đắk Nông"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-white text-2xl sm:text-3xl font-bold mb-1 drop-shadow">Chợ Nhân Cơ</h1>
          <p className="text-gray-200 text-sm mb-4 drop-shadow">Mua bán · Trao đổi · Kết nối cộng đồng Nhân Cơ, Đắk Nông</p>
          <div className="w-full max-w-xl">
            <HomepageSearchBar />
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 space-y-4">

        {/* Categories */}
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {categories.map(cat => (
              <Link key={cat.href} href={cat.href}
                className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors group text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: cat.bg }}>
                  <i className={`${cat.icon} text-xl`} style={{ color: cat.color }}></i>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800 leading-tight">{cat.title}</p>
                  <p className="text-[10px] text-gray-400 leading-tight hidden sm:block mt-0.5">{cat.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Banner / promo strip */}
        <div className="rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-red-600 to-orange-500 px-6 py-4 flex items-center justify-between text-white">
            <div>
              <p className="font-bold text-lg leading-tight">Đăng tin miễn phí</p>
              <p className="text-red-100 text-sm">Tiếp cận hàng nghìn người dân trong khu vực</p>
            </div>
            <Link href="/products/create"
              className="bg-white text-red-600 font-bold px-5 py-2 rounded-lg text-sm hover:bg-red-50 transition flex-shrink-0">
              Đăng ngay
            </Link>
          </div>
        </div>

        {/* VIP listings */}
        {vipListings.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-0.5 rounded">VIP</span>
                <h2 className="font-bold text-gray-800 text-sm">Tin nổi bật</h2>
              </div>
              <Link href="/products" className="text-xs font-medium" style={{ color: '#d0011b' }}>Xem thêm →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-0 divide-x divide-y divide-gray-100">
              {vipListings.slice(0, 6).map((item: any) => (
                <ListingCard key={`${item._type}-${item.id}`} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Products section */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <i className="ri-leaf-line text-green-600"></i> Sản phẩm mới đăng
            </h2>
            <Link href="/products" className="text-xs font-medium" style={{ color: '#d0011b' }}>Xem tất cả →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-0 divide-x divide-y divide-gray-100">
            {products.slice(0, 12).map((item: any) => (
              <ListingCard key={item.id} item={{ ...item, _type: 'product' }} />
            ))}
          </div>
          {products.length === 0 && <EmptyState label="Chưa có sản phẩm nào" />}
        </section>

        {/* RE + Jobs row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Real estate */}
          <section className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <i className="ri-home-4-line text-blue-600"></i> Bất động sản
              </h2>
              <Link href="/real-estate" className="text-xs font-medium" style={{ color: '#d0011b' }}>Xem tất cả →</Link>
            </div>
            <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-gray-100">
              {realEstate.slice(0, 4).map((item: any) => (
                <ListingCard key={item.id} item={{ ...item, _type: 'real-estate' }} />
              ))}
            </div>
            {realEstate.length === 0 && <EmptyState label="Chưa có tin bất động sản" />}
          </section>

          {/* Jobs */}
          <section className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <i className="ri-briefcase-line text-purple-600"></i> Tuyển dụng
              </h2>
              <Link href="/jobs" className="text-xs font-medium" style={{ color: '#d0011b' }}>Xem tất cả →</Link>
            </div>
            <div className="divide-y divide-gray-100">
              {jobs.length === 0 ? (
                <EmptyState label="Chưa có tin tuyển dụng" />
              ) : jobs.slice(0, 5).map((job: any) => (
                <Link key={job.id} href={`/jobs/${job.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <i className="ri-briefcase-line text-purple-500"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-red-600 transition-colors">{job.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {job.salary && <span className="text-xs font-bold" style={{ color: '#d0011b' }}>{job.salary}</span>}
                      {job.location && <span className="text-xs text-gray-400 flex items-center gap-0.5"><i className="ri-map-pin-line"></i>{job.location}</span>}
                    </div>
                  </div>
                  <i className="ri-arrow-right-s-line text-gray-300 flex-shrink-0"></i>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Forum */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <i className="ri-chat-3-line text-cyan-600"></i> Diễn đàn cộng đồng
            </h2>
            <Link href="/forum" className="text-xs font-medium" style={{ color: '#d0011b' }}>Xem tất cả →</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {forum.length === 0 ? (
              <EmptyState label="Chưa có bài viết nào" />
            ) : forum.slice(0, 5).map((post: any) => (
              <Link key={post.id} href={`/forum/${post.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0">
                  <i className="ri-chat-3-line text-cyan-500 text-sm"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-red-600 transition-colors">{post.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <i className="ri-arrow-right-s-line text-gray-300 flex-shrink-0"></i>
              </Link>
            ))}
          </div>
        </section>

        {/* Hình ảnh Nhân Cơ */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <i className="ri-image-line text-red-600"></i> Hình ảnh Nhân Cơ · Đắk Nông
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
            {[
              { src: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/X%C3%A3_Nh%C3%A2n_C%C6%A1%2C_%C4%90%E1%BA%AFk_N%C3%B4ng.jpg', label: 'Xã Nhân Cơ' },
              { src: 'https://upload.wikimedia.org/wikipedia/commons/8/81/Cao_nguy%C3%AAn_M%C6%A1_N%C3%B4ng%2C_%C4%90%E1%BA%AFk_N%C3%B4ng.jpg', label: 'Cao nguyên Mơ Nông' },
              { src: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/X%C3%B3m_nh%E1%BB%8F_tr%C3%AAn_cao_nguy%C3%AAn_M%C6%A1_N%C3%B4ng.jpg', label: 'Buôn làng Mơ Nông' },
              { src: 'https://upload.wikimedia.org/wikipedia/commons/5/57/TX.Gia_Ngh%C4%A9a%2C_%C4%90%E1%BA%AFk_N%C3%B4ng..jpg', label: 'Thị xã Gia Nghĩa' },
            ].map((img, i) => (
              <div key={i} className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <img src={img.src} alt={img.label} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                  <p className="text-white text-xs font-medium">{img.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Market prices */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <i className="ri-line-chart-line text-yellow-600"></i> Giá thị trường hôm nay
            </h2>
            <Link href="/market-prices" className="text-xs font-medium" style={{ color: '#d0011b' }}>Xem đầy đủ →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-gray-100">
            {[
              { name: 'Cà phê Robusta', price: '132.000đ/kg', change: '+1.200', up: true },
              { name: 'Hồ tiêu đen', price: '165.000đ/kg', change: '-500', up: false },
              { name: 'Sầu riêng', price: '85.000đ/kg', change: '+3.000', up: true },
              { name: 'Điều nhân', price: '72.000đ/kg', change: '—', up: null },
            ].map((item, i) => (
              <div key={i} className="px-4 py-3">
                <p className="text-xs text-gray-500 mb-0.5">{item.name}</p>
                <p className="font-bold text-gray-800 text-sm">{item.price}</p>
                <span className={`text-xs font-medium ${item.up === true ? 'text-red-500' : item.up === false ? 'text-green-600' : 'text-gray-400'}`}>
                  {item.up === true ? '▲ ' : item.up === false ? '▼ ' : ''}{item.change}
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="mt-8 border-t border-gray-200 bg-white">
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="font-['Pacifico'] text-lg mb-2" style={{ color: '#d0011b' }}>Chợ Nhân Cơ</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Kết nối giao thương, gắn kết cộng đồng nông thôn tại Nhân Cơ, Đắk Nông.</p>
              <div className="flex gap-3 mt-3">
                <a href="https://www.facebook.com/trungnguyenanhtan" className="text-gray-400 hover:text-blue-600 transition">
                  <i className="ri-facebook-circle-line text-xl"></i>
                </a>
                <a href="https://zalo.me/0888317289" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition">
                  <i className="ri-phone-line text-xl"></i>
                </a>
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
              <a href="https://www.facebook.com/share/g/1Gwg2sziS1/" className="inline-block mt-3 text-sm text-blue-500 hover:underline">
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

function ListingCard({ item }: { item: any }) {
  const href = item._type === 'product' ? `/products/${item.id}`
    : item._type === 'real-estate' ? `/real-estate/${item.id}`
    : `/jobs/${item.id}`;
  const imgUrl = item.images?.[0]?.url || null;
  const price = fmtPrice(item, item._type);

  return (
    <Link href={href} className="group flex flex-col hover:bg-gray-50 transition-colors">
      {/* Image */}
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
        {imgUrl ? (
          <img src={imgUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="ri-image-line text-2xl text-gray-300"></i>
          </div>
        )}
        {item.isVip && (
          <span className="absolute top-1.5 left-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">VIP</span>
        )}
      </div>
      {/* Info */}
      <div className="p-2">
        <p className="text-xs font-semibold leading-tight line-clamp-2 text-gray-800 group-hover:text-red-600 transition-colors mb-1">{item.title}</p>
        <p className="text-xs font-bold" style={{ color: '#d0011b' }}>{price}</p>
        {(item.location || item.address) && (
          <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-0.5 truncate">
            <i className="ri-map-pin-line flex-shrink-0"></i>
            {item.location || item.address}
          </p>
        )}
      </div>
    </Link>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-10 text-center text-gray-400 text-sm">
      <i className="ri-inbox-line text-3xl block mb-2"></i>
      {label}
    </div>
  );
}
