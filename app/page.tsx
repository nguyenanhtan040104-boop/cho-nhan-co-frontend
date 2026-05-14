import Link from 'next/link';
import { Metadata } from 'next';
import HomepageClient from './HomepageClient';

export const metadata: Metadata = {
  title: 'Chợ Nhân Cơ — Mua bán nông sản, bất động sản, việc làm tại Đắk Nông',
  description: 'Chợ Nhân Cơ là nền tảng mua bán trực tuyến cho cộng đồng Nhân Cơ, Đắk Nông. Đăng tin nông sản, bất động sản, tuyển dụng miễn phí. Kết nối người mua và người bán tại Tây Nguyên.',
  alternates: { canonical: 'https://cho-nhan-co-frontend-bxj2-18271g0zq.vercel.app' },
};

const API = process.env.NEXT_PUBLIC_API_URL || 'https://cho-nhan-co-backend-production.up.railway.app/api';

async function getHomeData() {
  try {
    const [products, jobs, realEstate, forum] = await Promise.allSettled([
      fetch(`${API}/products?limit=8&sortBy=newest`, { next: { revalidate: 300 } }).then(r => r.json()),
      fetch(`${API}/jobs?limit=4&sortBy=newest`, { next: { revalidate: 300 } }).then(r => r.json()),
      fetch(`${API}/real-estate?limit=4&sortBy=newest`, { next: { revalidate: 300 } }).then(r => r.json()),
      fetch(`${API}/forum/posts?limit=4`, { next: { revalidate: 300 } }).then(r => r.json()),
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
  { title: 'Sản phẩm', sub: 'Nông sản, thực phẩm sạch', href: '/products', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80', accent: '#2d6a4f' },
  { title: 'Bất động sản', sub: 'Đất vườn, nhà cửa, cho thuê', href: '/real-estate', image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80', accent: '#1d4ed8' },
  { title: 'Tuyển dụng', sub: 'Việc làm, thuê nhân công', href: '/jobs', image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&q=80', accent: '#7c3aed' },
  { title: 'Cảnh báo', sub: 'Lừa đảo, trộm cắp, mất đồ', href: '/canh-bao', image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400&q=80', accent: '#b91c1c' },
  { title: 'Diễn đàn', sub: 'Chia sẻ kinh nghiệm, hỏi đáp', href: '/forum', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80', accent: '#0891b2' },
  { title: 'Quảng cáo', sub: 'Khai trương, khuyến mãi', href: '/advertisements', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80', accent: '#dc2626' },
];

export default async function HomePage() {
  const { products, jobs, realEstate, forum } = await getHomeData();

  const featuredItems = [
    ...products.slice(0, 4).map((p: any) => ({ ...p, _type: 'product' })),
    ...realEstate.slice(0, 2).map((p: any) => ({ ...p, _type: 'real-estate' })),
    ...jobs.slice(0, 2).map((p: any) => ({ ...p, _type: 'job' })),
  ];

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#f8f5f0' }}>

      {/* Hero */}
      <section
        className="relative py-14 sm:py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/chonhanco.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <p className="text-green-300 text-sm font-medium uppercase tracking-widest mb-3">Nhân Cơ · Đắk Nông</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Chợ Nhân Cơ
          </h1>
          <p className="text-lg text-gray-200 mb-8 max-w-xl mx-auto">
            Nền tảng mua bán và trao đổi thông tin cho cộng đồng địa phương
          </p>
          <HomepageClient />
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 grid grid-cols-3 divide-x divide-gray-100 text-center">
          {[
            { label: 'Sản phẩm', value: products.length > 0 ? `${products.length}+` : '—' },
            { label: 'Tin tuyển dụng', value: jobs.length > 0 ? `${jobs.length}+` : '—' },
            { label: 'Bài diễn đàn', value: forum.length > 0 ? `${forum.length}+` : '—' },
          ].map(s => (
            <div key={s.label} className="py-1">
              <p className="text-xl font-bold" style={{ color: '#2d6a4f' }}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <section className="py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Danh mục</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map(cat => (
              <Link key={cat.href} href={cat.href}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all aspect-[4/3]">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-sm font-bold text-white leading-tight">{cat.title}</p>
                  <p className="text-xs text-gray-300 mt-0.5 leading-snug hidden sm:block line-clamp-1">{cat.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured listings */}
      {featuredItems.length > 0 && (
        <section className="pb-10 sm:pb-14">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">Tin đăng mới nhất</h2>
              <Link href="/products" className="text-sm font-medium hover:underline" style={{ color: '#2d6a4f' }}>
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredItems.slice(0, 8).map((item: any) => {
                const href = item._type === 'product' ? `/products/${item.id}`
                  : item._type === 'real-estate' ? `/real-estate/${item.id}`
                  : `/jobs/${item.id}`;
                const imgUrl = item.images?.[0]?.url || null;
                const price = item._type === 'product'
                  ? `${Number(item.price).toLocaleString('vi-VN')}đ/${item.unit || 'cái'}`
                  : item._type === 'real-estate'
                  ? (Number(item.price) >= 1e9 ? (Number(item.price) / 1e9).toFixed(1) + ' tỷ' : (Number(item.price) / 1e6).toFixed(0) + ' triệu')
                  : item.salary || 'Thỏa thuận';
                const typeColor: any = { product: '#2d6a4f', 'real-estate': '#1d4ed8', job: '#7c3aed' };
                const typeLabel: any = { product: 'Sản phẩm', 'real-estate': 'Bất động sản', job: 'Tuyển dụng' };
                return (
                  <Link key={`${item._type}-${item.id}`} href={href}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                    <div className="relative h-40 bg-gray-50">
                      {imgUrl ? (
                        <img src={imgUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="ri-image-line text-3xl text-gray-200"></i>
                        </div>
                      )}
                      {item.isVip && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          VIP
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full mb-2 inline-block"
                        style={{ backgroundColor: typeColor[item._type] + '15', color: typeColor[item._type] }}>
                        {typeLabel[item._type]}
                      </span>
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-green-700 transition-colors mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm font-bold" style={{ color: '#2d6a4f' }}>{price}</p>
                      {(item.location || item.address) && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 truncate">
                          <i className="ri-map-pin-line flex-shrink-0"></i>
                          {item.location || item.address}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Forum + Jobs row */}
      <section className="pb-10 sm:pb-14">
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-6">

          {/* Forum */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-bold text-gray-800">Diễn đàn cộng đồng</h2>
              <Link href="/forum" className="text-sm" style={{ color: '#2d6a4f' }}>Xem tất cả →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {forum.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">Chưa có bài viết nào</div>
              ) : forum.slice(0, 4).map((post: any) => (
                <Link key={post.id} href={`/forum/${post.id}`}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="ri-chat-3-line text-purple-500 text-sm"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-purple-700">{post.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <i className="ri-arrow-right-s-line text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-1"></i>
                </Link>
              ))}
            </div>
          </div>

          {/* Jobs */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-bold text-gray-800">Tuyển dụng mới</h2>
              <Link href="/jobs" className="text-sm" style={{ color: '#2d6a4f' }}>Xem tất cả →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {jobs.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">Chưa có tin tuyển dụng</div>
              ) : jobs.slice(0, 4).map((job: any) => (
                <Link key={job.id} href={`/jobs/${job.id}`}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="ri-briefcase-line text-indigo-500 text-sm"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-indigo-700">{job.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-400">{job.location || 'Đắk Nông'}</p>
                      {job.salary && <span className="text-xs font-medium text-green-600">{job.salary}</span>}
                    </div>
                  </div>
                  <i className="ri-arrow-right-s-line text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-1"></i>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Giá thị trường mini */}
      <section className="pb-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-yellow-100">
              <div className="flex items-center gap-2">
                <i className="ri-line-chart-line text-yellow-600 text-lg"></i>
                <h2 className="font-bold text-gray-800">Giá thị trường hôm nay</h2>
              </div>
              <Link href="/market-prices" className="text-sm text-yellow-700 hover:text-yellow-800 font-medium">Xem đầy đủ →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-yellow-100">
              {[
                { name: 'Cà phê Robusta', price: '132.000đ/kg', change: '+1.200', up: true },
                { name: 'Hồ tiêu đen', price: '165.000đ/kg', change: '-500', up: false },
                { name: 'Sầu riêng', price: '85.000đ/kg', change: '+3.000', up: true },
                { name: 'Điều nhân', price: '72.000đ/kg', change: '—', up: null },
              ].map((item, i) => (
                <div key={i} className="px-5 py-4">
                  <p className="text-xs text-gray-500 mb-0.5">{item.name}</p>
                  <p className="font-bold text-gray-800 text-sm">{item.price}</p>
                  <span className={`text-xs font-medium ${item.up === true ? 'text-red-500' : item.up === false ? 'text-green-600' : 'text-gray-400'}`}>
                    {item.up === true ? '▲ ' : item.up === false ? '▼ ' : ''}{item.change}
                  </span>
                </div>
              ))}
            </div>
            <div className="px-5 py-2 bg-yellow-50/50 border-t border-yellow-100">
              <p className="text-xs text-gray-400">Giá tham khảo · Cập nhật hằng ngày · <Link href="/market-prices" className="text-yellow-700 hover:underline">Xem bảng giá chi tiết</Link></p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="rounded-2xl p-8 sm:p-10 text-center text-white" style={{ background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)' }}>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Bắt đầu đăng tin miễn phí</h2>
            <p className="text-green-200 mb-7 text-sm sm:text-base">
              Tiếp cận hàng nghìn người dân trong khu vực Nhân Cơ và Đắk Nông
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/products/create"
                className="bg-white font-semibold px-7 py-3 rounded-xl hover:bg-gray-50 transition text-sm"
                style={{ color: '#2d6a4f' }}>
                Đăng sản phẩm
              </Link>
              <Link href="/jobs/create"
                className="bg-white/15 text-white font-semibold px-7 py-3 rounded-xl hover:bg-white/25 transition text-sm border border-white/20">
                Đăng tuyển dụng
              </Link>
              <Link href="/forum/create"
                className="bg-white/15 text-white font-semibold px-7 py-3 rounded-xl hover:bg-white/25 transition text-sm border border-white/20">
                Viết bài diễn đàn
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#111827' }} className="text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-['Pacifico'] text-xl text-green-400 mb-3">Chợ Nhân Cơ</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Kết nối giao thương, gắn kết cộng đồng nông thôn tại Nhân Cơ, Đắk Nông.
              </p>
              <div className="flex gap-3 mt-4">
                <a href="https://www.facebook.com/trungnguyenanhtan" className="text-gray-400 hover:text-green-400 transition">
                  <i className="ri-facebook-circle-line text-2xl"></i>
                </a>
                <a href="https://zalo.me/0888317289" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-400 transition">
                  <i className="ri-phone-line text-2xl"></i>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-200 mb-3">Danh mục</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {[['Sản phẩm', '/products'], ['Bất động sản', '/real-estate'], ['Tuyển dụng', '/jobs'], ['Diễn đàn', '/forum'], ['Cảnh báo cộng đồng', '/canh-bao'], ['Bảng giá', '/pricing']].map(([label, href]) => (
                  <li key={href}><Link href={href} className="hover:text-green-400 transition">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-200 mb-3">Liên hệ</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2"><i className="ri-phone-line"></i> 0888.317.289</li>
                <li className="flex items-center gap-2"><i className="ri-mail-line"></i> chonhanco41@gmail.com</li>
                <li className="flex items-center gap-2"><i className="ri-map-pin-line"></i> Xã Nhân Cơ, Đắk Nông</li>
              </ul>
              <a href="https://www.facebook.com/share/g/1Gwg2sziS1/" className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300">
                Tham gia nhóm Facebook →
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
            © 2025 Chợ Nhân Cơ. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </footer>

    </main>
  );
}
