'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { forum, auth } from '../../lib/api';

const reportTypes = [
  { value: '', label: 'Tất cả' },
  { value: 'lua_dao_mua_ban', label: 'Lừa đảo mua bán' },
  { value: 'gia_mao', label: 'Giả mạo danh tính' },
  { value: 'lua_dao_dat_coc', label: 'Lừa đảo đặt cọc' },
  { value: 'hang_gia', label: 'Hàng giả / kém chất lượng' },
  { value: 'khac', label: 'Khác' },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 24) return h < 1 ? 'Vừa đăng' : `${h} giờ trước`;
  const d = Math.floor(h / 24);
  return d < 30 ? `${d} ngày trước` : `${Math.floor(d / 30)} tháng trước`;
}

const TIPS = [
  'Cung cấp số điện thoại, tên tài khoản ngân hàng của đối tượng nếu có',
  'Chụp màn hình cuộc trò chuyện, biên lai chuyển khoản làm bằng chứng',
  'Trình báo cơ quan công an địa phương khi bị thiệt hại về tài sản',
  'Không chuyển tiền trước khi nhận hàng hoặc kiểm tra thực tế',
  'Cảnh giác với giá quá rẻ, ưu đãi hấp dẫn bất thường',
];

export default function CanhBaoPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const loadData = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit: 15, sortBy, category: 'CANH_BAO' };
      if (search) params.search = search;
      const res = await forum.getAll(params);
      setPosts(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setPage(p);
    } catch { } finally { setLoading(false); }
  }, [search, sortBy]);

  useEffect(() => { loadData(1); }, [loadData]);

  const isLoggedIn = typeof window !== 'undefined' && auth.isLoggedIn();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f5f0' }}>
      {/* Banner đỏ cảnh báo */}
      <div style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)' }} className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="text-red-300 text-xs uppercase tracking-wider mb-1">Chợ Nhân Cơ · Cộng đồng</p>
              <h1 className="text-2xl font-bold text-white">Cảnh báo cộng đồng</h1>
              <p className="text-red-200 text-sm mt-1">{total} thông báo từ cộng đồng · Cùng bảo vệ nhau</p>
            </div>
            <div className="flex gap-2">
              <form onSubmit={e => { e.preventDefault(); loadData(1); }} className="flex gap-2">
                <input type="text" placeholder="Tìm tên, số tài khoản, số điện thoại..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="px-4 py-2 rounded-xl text-sm bg-white/10 backdrop-blur border border-white/20 text-white placeholder-red-200 focus:outline-none focus:bg-white/20 w-64" />
                <button type="submit" className="bg-white text-red-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-50">Tìm</button>
              </form>
              <Link href="/canh-bao/create"
                className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-400 whitespace-nowrap border border-red-400">
                + Đăng cảnh báo
              </Link>
            </div>
          </div>
          {/* Sort */}
          <div className="flex gap-2 mt-4">
            {[{ v: 'newest', l: 'Mới nhất' }, { v: 'popular', l: 'Nhiều xem nhất' }, { v: 'most_comments', l: 'Nhiều bình luận' }].map(o => (
              <button key={o.v} onClick={() => setSortBy(o.v)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${sortBy === o.v ? 'bg-white text-red-700' : 'bg-white/15 text-white hover:bg-white/25'}`}>
                {o.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Main list */}
          <div className="flex-1 min-w-0">
            {/* Warning notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
              <div className="flex gap-3">
                <i className="ri-information-line text-amber-500 text-xl flex-shrink-0 mt-0.5"></i>
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-1">Lưu ý</p>
                  <p className="text-xs text-amber-700">Các bài đăng mang tính cộng đồng, chưa được kiểm chứng pháp lý. Nếu bị thiệt hại về tài sản, hãy trình báo cơ quan công an để được hỗ trợ.</p>
                </div>
              </div>
            </div>

            {loading && posts.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                    <div className="w-full bg-gray-200" style={{ paddingBottom: '65%' }}></div>
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
                <i className="ri-shield-check-line text-5xl text-gray-200 block mb-3"></i>
                <p className="text-gray-500 font-medium mb-1">Chưa có thông báo nào</p>
                <p className="text-gray-400 text-sm mb-4">Cộng đồng đang an toàn. Nếu bạn có thông tin cần cảnh báo, hãy chia sẻ để mọi người cùng biết.</p>
                <Link href="/canh-bao/create"
                  className="inline-block bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700">
                  + Đăng cảnh báo đầu tiên
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {posts.map(post => <ReportCard key={post.id} post={post} />)}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {[...Array(totalPages)].map((_, i) => (
                      <button key={i} onClick={() => loadData(i + 1)}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === i + 1 ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-72 flex-shrink-0 space-y-4">
            {/* Đăng báo cáo CTA */}
            {isLoggedIn ? (
              <Link href="/canh-bao/create"
                className="block bg-red-600 hover:bg-red-700 text-white rounded-2xl p-5 transition-colors text-center">
                <i className="ri-alarm-warning-line text-2xl block mb-2"></i>
                <p className="font-semibold mb-1">Có thông tin cần cảnh báo?</p>
                <p className="text-sm text-red-100">Chia sẻ để bảo vệ cộng đồng</p>
              </Link>
            ) : (
              <Link href="/profile"
                className="block bg-red-600 hover:bg-red-700 text-white rounded-2xl p-5 transition-colors text-center">
                <i className="ri-alarm-warning-line text-2xl block mb-2"></i>
                <p className="font-semibold mb-1">Đăng cảnh báo</p>
                <p className="text-sm text-red-100">Đăng nhập để chia sẻ thông tin</p>
              </Link>
            )}

            {/* Tips */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <i className="ri-shield-line text-green-600"></i>
                Cách tự bảo vệ
              </h3>
              <ul className="space-y-2.5">
                {TIPS.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-xs text-gray-600">
                    <span className="w-4 h-4 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5">{i + 1}</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hotline */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <i className="ri-phone-line text-blue-600"></i>
                Đường dây nóng
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-gray-600">Công an Đắk Nông</span>
                  <span className="font-bold text-blue-700">113</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-gray-600">Cảnh sát kinh tế</span>
                  <span className="font-bold text-blue-700">069.2349.567</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-gray-600">Tố giác tội phạm</span>
                  <span className="font-bold text-blue-700">1900.5656</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ post }: { post: any }) {
  const thumb = post.images?.[0]?.url || post.images?.[0];

  return (
    <Link href={`/forum/${post.id}`}
      className="block bg-white rounded-2xl border border-red-100 hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden group">
      {/* Thumbnail */}
      <div className="relative w-full bg-red-50" style={{ paddingBottom: '65%' }}>
        {thumb ? (
          <img src={thumb} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200">
            <i className="ri-alarm-warning-line text-4xl text-red-400"></i>
          </div>
        )}
        <span className="absolute top-2 left-2 text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded">Cảnh báo</span>
      </div>
      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-snug mb-2 group-hover:text-red-700 transition-colors">{post.title}</h3>
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-[10px] flex-shrink-0">
              {post.user?.fullName?.[0] || 'U'}
            </div>
            <span className="truncate max-w-[60px]">{post.user?.fullName}</span>
          </div>
          <span className="flex items-center gap-2">
            <span><i className="ri-chat-3-line"></i> {post.commentCount || post._count?.comments || 0}</span>
            <span>{timeAgo(post.createdAt)}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
