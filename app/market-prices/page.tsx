'use client';

import { useState, useEffect, useCallback } from 'react';
import { marketPrices, auth, users } from '../../lib/api';

const PRESET_CATEGORIES = [
  { value: '', label: 'Tất cả' },
  { value: 'Cà phê', label: 'Cà phê' },
  { value: 'Hồ tiêu', label: 'Hồ tiêu' },
  { value: 'Cao su', label: 'Cao su' },
  { value: 'Lúa gạo', label: 'Lúa gạo' },
  { value: 'Trái cây', label: 'Trái cây' },
  { value: 'Rau củ', label: 'Rau củ' },
  { value: 'Vật nuôi', label: 'Vật nuôi' },
  { value: 'Thủy sản', label: 'Thủy sản' },
  { value: 'Khác', label: 'Khác' },
];

function formatPrice(price: number) {
  if (price >= 1_000_000) return (price / 1_000_000).toFixed(1) + 'tr';
  return price.toLocaleString('vi-VN');
}

function getTimeDiff(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
}

export default function MarketPricesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  // Giá vàng thực tế
  const [goldPrices, setGoldPrices] = useState<any[]>([]);
  const [goldUpdatedAt, setGoldUpdatedAt] = useState('');
  const [goldSource, setGoldSource] = useState('');
  const [goldLoading, setGoldLoading] = useState(true);

  // Giá nông sản tham khảo
  const [agriCategories, setAgriCategories] = useState<any[]>([]);
  const [agriLoading, setAgriLoading] = useState(true);
  const [agriUpdatedAt, setAgriUpdatedAt] = useState('');
  const [openCat, setOpenCat] = useState<string>('');

  // Form thêm giá
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productName: '', category: 'Cà phê', unit: 'kg', price: '', location: '', note: '', source: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadData = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit: 30 };
      if (category) params.category = category;
      if (search) params.search = search;
      if (location) params.location = location;
      const res = await marketPrices.getAll(params);
      if (p === 1) setItems(res.data || []);
      else setItems(prev => [...prev, ...(res.data || [])]);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setPage(p);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [category, search, location]);

  useEffect(() => { loadData(1); }, [loadData]);

  useEffect(() => {
    if (auth.isLoggedIn()) {
      users.getMe().then(u => setIsAdmin(u.role === 'admin')).catch(() => {});
    }
    // Fetch giá vàng SJC
    fetch('/api/gold-prices')
      .then(r => r.json())
      .then(d => {
        setGoldPrices(d.data || []);
        setGoldUpdatedAt(d.updatedAt || '');
        setGoldSource(d.source || '');
      })
      .catch(() => {})
      .finally(() => setGoldLoading(false));

    // Fetch giá nông sản
    fetch('/api/agri-prices')
      .then(r => r.json())
      .then(d => {
        setAgriCategories(d.categories || []);
        setAgriUpdatedAt(d.updatedAt || '');
        if (d.categories?.length > 0) setOpenCat(d.categories[0].category);
      })
      .catch(() => {})
      .finally(() => setAgriLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.isLoggedIn()) { setFormError('Vui lòng đăng nhập để đóng góp giá'); return; }
    setFormError('');
    setSubmitting(true);
    try {
      const newItem = await marketPrices.create({ ...form, price: Number(form.price) });
      setItems(prev => [newItem, ...prev]);
      setTotal(prev => prev + 1);
      setForm({ productName: '', category: 'Cà phê', unit: 'kg', price: '', location: '', note: '', source: '' });
      setShowForm(false);
    } catch (e: any) {
      setFormError(e.message || 'Lỗi đăng giá');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa bản ghi giá này?')) return;
    try {
      await marketPrices.delete(id);
      setItems(prev => prev.filter((i: any) => i.id !== id));
    } catch { alert('Xóa thất bại'); }
  }

  // Group by category
  const grouped = items.reduce((acc: any, item: any) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Giá thị trường</h1>
              <p className="text-gray-500 text-sm mt-1">Cập nhật bởi Admin • {total} bản ghi</p>
            </div>
            {isAdmin && (
              <button onClick={() => setShowForm(!showForm)}
                className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 text-sm font-medium">
                + Thêm giá
              </button>
            )}
          </div>

          {/* Form - chỉ admin */}
          {isAdmin && showForm && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Đóng góp giá thị trường</h3>
              {formError && <p className="text-red-600 text-sm mb-3">{formError}</p>}
              <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <input required placeholder="Tên sản phẩm *" value={form.productName}
                  onChange={e => setForm(p => ({ ...p, productName: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  {PRESET_CATEGORIES.filter(c => c.value).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <div className="flex gap-2">
                  <input required type="number" placeholder="Giá *" value={form.price} min="0"
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <input placeholder="đvt" value={form.unit}
                    onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                    className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <input required placeholder="Địa điểm *" value={form.location}
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input placeholder="Nguồn (Chợ, Thương lái...)" value={form.source}
                  onChange={e => setForm(p => ({ ...p, source: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input placeholder="Ghi chú" value={form.note}
                  onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <div className="col-span-2 md:col-span-3 flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Hủy</button>
                  <button type="submit" disabled={submitting}
                    className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                    {submitting ? 'Đang lưu...' : 'Lưu giá'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 items-center mb-3">
            {PRESET_CATEGORIES.map(c => (
              <button key={c.value} onClick={() => setCategory(c.value)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${category === c.value ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input type="text" placeholder="Tìm sản phẩm..." value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadData(1)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
            <input type="text" placeholder="Địa điểm..." value={location}
              onChange={e => setLocation(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadData(1)}
              className="w-44 px-4 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>
      </div>

      {/* Giá vàng SJC */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow">
                <span className="text-lg font-bold text-white">Au</span>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Giá Vàng SJC Hôm Nay</h2>
                <p className="text-xs text-gray-500">
                  {goldSource === 'SJC' ? '🟢 Dữ liệu thực từ SJC' : '🟡 Dữ liệu tham khảo'}
                  {goldUpdatedAt && ` • Cập nhật: ${new Date(goldUpdatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`}
                </p>
              </div>
            </div>
            <button onClick={() => {
              setGoldLoading(true);
              fetch('/api/gold-prices').then(r => r.json()).then(d => {
                setGoldPrices(d.data || []); setGoldUpdatedAt(d.updatedAt || ''); setGoldSource(d.source || '');
              }).finally(() => setGoldLoading(false));
            }} className="text-yellow-600 hover:text-yellow-700 p-2 rounded-lg hover:bg-yellow-100 transition-colors" title="Làm mới">
              <i className={`ri-refresh-line text-lg ${goldLoading ? 'animate-spin' : ''}`}></i>
            </button>
          </div>

          {goldLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="flex justify-between">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {goldPrices.map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-yellow-100">
                  <p className="text-sm font-semibold text-gray-800 mb-3 line-clamp-1">{item.name}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Mua vào</p>
                      <p className="text-base font-bold text-blue-600">
                        {item.buy > 0 ? (item.buy / 1_000_000).toFixed(1) + ' tr' : '—'}
                      </p>
                    </div>
                    <div className="w-px h-10 bg-gray-200"></div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Bán ra</p>
                      <p className="text-base font-bold text-red-500">
                        {item.sell > 0 ? (item.sell / 1_000_000).toFixed(1) + ' tr' : '—'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">/{item.unit}</p>
                    </div>
                  </div>
                </div>
              ))}
              {goldPrices.length === 0 && (
                <div className="col-span-2 text-center py-4 text-gray-400 text-sm">
                  Không thể tải giá vàng lúc này
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-3 text-center">
            Nguồn: sjc.com.vn • Giá đơn vị triệu đồng/lượng (37.5g) • Chỉ mang tính tham khảo
          </p>
        </div>

        {/* Giá nông sản tham khảo */}
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <span className="text-lg">🌾</span>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Bảng Giá Nông Sản Tham Khảo</h2>
                <p className="text-xs text-gray-500">
                  🟡 Giá tham khảo thị trường
                  {agriUpdatedAt && ` • Cập nhật: ${new Date(agriUpdatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`}
                </p>
              </div>
            </div>
            <button onClick={() => {
              setAgriLoading(true);
              fetch('/api/agri-prices').then(r => r.json()).then(d => {
                setAgriCategories(d.categories || []);
                setAgriUpdatedAt(d.updatedAt || '');
              }).finally(() => setAgriLoading(false));
            }} className="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-100 transition-colors" title="Làm mới">
              <i className={`ri-refresh-line text-lg ${agriLoading ? 'animate-spin' : ''}`}></i>
            </button>
          </div>

          {agriLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <>
              {/* Category tabs */}
              <div className="flex flex-wrap gap-1.5 px-5 py-3 border-b bg-gray-50">
                {agriCategories.map(cat => (
                  <button key={cat.category}
                    onClick={() => setOpenCat(openCat === cat.category ? '' : cat.category)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${openCat === cat.category ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                    <span>{cat.category}</span>
                    {cat.isLive && <span className={`w-1.5 h-1.5 rounded-full ${openCat === cat.category ? 'bg-green-200' : 'bg-green-500'}`}></span>}
                  </button>
                ))}
              </div>

              {/* Selected category table */}
              {agriCategories.filter(cat => cat.category === openCat).map(cat => (
                <div key={cat.category}>
                  <div className="px-5 py-2.5 bg-gray-50 border-b flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {cat.icon} {cat.category}
                      {cat.isLive
                        ? <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">🟢 Dữ liệu thực ({cat.source})</span>
                        : <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Tham khảo</span>}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                          <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">Giá</th>
                          <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Địa điểm</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {cat.items.map((item: any, i: number) => (
                          <tr key={i} className="hover:bg-green-50/30 transition-colors">
                            <td className="px-5 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                            <td className="px-5 py-3 text-right">
                              <span className="font-bold text-green-600">{item.price.toLocaleString('vi-VN')}đ</span>
                              <span className="text-xs text-gray-400">/{item.unit}</span>
                            </td>
                            <td className="px-5 py-3 text-sm text-gray-500 hidden sm:table-cell">{item.location}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {!openCat && (
                <div className="px-5 py-8 text-center text-gray-400 text-sm">
                  Chọn một danh mục để xem bảng giá chi tiết
                </div>
              )}
            </>
          )}

          <p className="text-xs text-gray-400 px-5 py-3 border-t text-center">
            Giá mang tính tham khảo, cập nhật theo dữ liệu thị trường • giacaphe.com, Vietcombank
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && items.length > 0 ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (category || search || location) && items.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <p className="text-gray-400 text-sm">Không tìm thấy kết quả</p>
          </div>
        ) : category || search || location ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">{category || 'Kết quả tìm kiếm'} <span className="text-gray-400 font-normal text-sm">({items.length} bản ghi)</span></h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Giá</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Địa điểm</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Nguồn</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Cập nhật</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 text-sm">{item.productName}</p>
                        {item.note && <p className="text-xs text-gray-400">{item.note}</p>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-green-600">{formatPrice(item.price)}đ</span>
                        <span className="text-xs text-gray-400">/{item.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{item.location}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{item.source || '-'}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{getTimeDiff(item.createdAt)}</td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDelete(item.id)} className="text-gray-300 hover:text-red-500 text-xs">
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(grouped).map(([cat, catItems]: [string, any]) => (
              <div key={cat} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">{cat} <span className="text-gray-400 font-normal text-sm ml-1">({catItems.length})</span></h2>
                  <button onClick={() => setCategory(cat)} className="text-sm text-green-600 hover:underline">Xem tất cả</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Sản phẩm</th>
                        <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">Giá</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 hidden md:table-cell">Địa điểm</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Cập nhật</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {catItems.slice(0, 5).map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5">
                            <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <span className="font-bold text-green-600 text-sm">{formatPrice(item.price)}đ</span>
                            <span className="text-xs text-gray-400">/{item.unit}</span>
                          </td>
                          <td className="px-4 py-2.5 text-sm text-gray-500 hidden md:table-cell">{item.location}</td>
                          <td className="px-4 py-2.5 text-xs text-gray-400">{getTimeDiff(item.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {page < totalPages && (
          <div className="text-center mt-8">
            <button onClick={() => loadData(page + 1)} disabled={loading}
              className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              {loading ? 'Đang tải...' : 'Xem thêm'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
