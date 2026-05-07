'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { products as productsApi } from '../../lib/api';

const categories = [
  { value: '', name: 'Tất cả' },
  { value: 'NONG_SAN', name: 'Nông sản' },
  { value: 'VAT_NUOI', name: 'Vật nuôi' },
  { value: 'DO_DUNG_GIA_DINH', name: 'Đồ dùng gia đình' },
  { value: 'HANG_TIEU_DUNG', name: 'Hàng tiêu dùng' },
  { value: 'DICH_VU', name: 'Dịch vụ' },
];

export default function ProductsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { loadProducts(); }, [category, sortBy, page]);

  async function loadProducts(searchQuery?: string) {
    setLoading(true);
    try {
      const res = await productsApi.getAll({
        search: searchQuery ?? search,
        category: category || undefined,
        sortBy, page, limit: 12,
      });
      setItems(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadProducts(search);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
              <p className="text-gray-500 text-sm mt-1">Tìm thấy {total} sản phẩm</p>
            </div>
            <div className="flex gap-3">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 w-48"
                />
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">Tìm</button>
              </form>
              <Link href="/products/create" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 whitespace-nowrap">
                + Đăng sản phẩm
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Danh mục</h3>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button key={cat.value} onClick={() => { setCategory(cat.value); setPage(1); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === cat.value ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
              <hr className="my-4" />
              <h3 className="font-semibold text-gray-900 mb-3">Sắp xếp</h3>
              <div className="space-y-1">
                {[
                  { value: 'newest', label: 'Mới nhất' },
                  { value: 'price_asc', label: 'Giá thấp → cao' },
                  { value: 'price_desc', label: 'Giá cao → thấp' },
                  { value: 'popular', label: 'Phổ biến nhất' },
                ].map(opt => (
                  <button key={opt.value} onClick={() => { setSortBy(opt.value); setPage(1); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === opt.value ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm h-64 animate-pulse">
                    <div className="h-40 bg-gray-200 rounded-t-xl"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="bg-white rounded-xl p-16 text-center shadow-sm">
                <i className="ri-plant-line text-6xl text-gray-300 block mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có sản phẩm nào</h3>
                <p className="text-gray-500 mb-6">Hãy là người đầu tiên đăng sản phẩm!</p>
                <Link href="/products/create" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
                  Đăng sản phẩm ngay
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map(product => (
                    <Link key={product.id} href={`/products/${product.id}`}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden block group">
                      <div className="relative h-40 bg-gray-100">
                        {product.images?.[0] ? (
                          <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <i className="ri-image-line text-4xl text-gray-300"></i>
                          </div>
                        )}
                        {product.isVip && (
                          <div className="absolute top-2 left-2 bg-yellow-400 text-white text-xs px-2 py-0.5 rounded-full font-bold">VIP</div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-green-600 transition-colors">{product.title}</h4>
                        <p className="text-green-600 font-bold">{Number(product.price).toLocaleString()}đ/{product.unit}</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                          <i className="ri-map-pin-line"></i>
                          <span className="truncate">{product.location}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                          <i className="ri-user-line"></i>
                          <span className="flex-1 truncate">{product.user?.fullName}</span>
                          <i className="ri-eye-line"></i>
                          <span>{product.viewCount}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">← Trước</button>
                    <span className="px-4 py-2 text-sm text-gray-600">Trang {page} / {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">Tiếp →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
