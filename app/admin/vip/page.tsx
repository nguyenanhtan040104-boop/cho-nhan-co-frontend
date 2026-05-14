'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { products as productsApi, jobs as jobsApi, realEstate as reApi, auth } from '../../../lib/api';

const TABS = [
  { key: 'products', label: 'Sản phẩm', icon: 'ri-plant-line' },
  { key: 'jobs', label: 'Tuyển dụng', icon: 'ri-briefcase-line' },
  { key: 'realestate', label: 'Bất động sản', icon: 'ri-home-4-line' },
];

export default function AdminVipPage() {
  const router = useRouter();
  const [tab, setTab] = useState('products');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!auth.isLoggedIn() || user?.role?.toLowerCase() !== 'admin') {
      router.replace('/profile');
    }
  }, []);

  useEffect(() => { loadItems(); }, [tab]);

  async function loadItems() {
    setLoading(true);
    try {
      let res: any;
      if (tab === 'products') res = await productsApi.getAll({ limit: 50 });
      else if (tab === 'jobs') res = await jobsApi.getAll({ limit: 50 });
      else res = await reApi.getAll({ limit: 50 });
      setItems(res.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  async function toggleVip(item: any) {
    setToggling(item.id);
    try {
      const newVip = !item.isVip;
      if (tab === 'products') await productsApi.adminToggleVip(item.id, newVip);
      else if (tab === 'jobs') await jobsApi.adminToggleVip(item.id, newVip);
      else await reApi.adminToggleVip(item.id, newVip);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isVip: newVip } : i));
    } catch (e: any) { alert(e.message || 'Lỗi cập nhật VIP'); }
    finally { setToggling(null); }
  }

  const filtered = items.filter(i =>
    !search || i.title?.toLowerCase().includes(search.toLowerCase()) || i.user?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  const vipCount = items.filter(i => i.isVip).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
              <i className="ri-arrow-left-line"></i>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <i className="ri-vip-crown-fill text-yellow-500"></i>
                Quản lý VIP
              </h1>
              <p className="text-sm text-gray-500">{vipCount} tin đang là VIP</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {TABS.map(t => {
            const tabItems = tab === t.key ? items : [];
            return (
              <div key={t.key} onClick={() => setTab(t.key)}
                className={`bg-white rounded-xl p-4 shadow-sm cursor-pointer border-2 transition-all ${tab === t.key ? 'border-yellow-400' : 'border-transparent hover:border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tab === t.key ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                    <i className={`${t.icon} ${tab === t.key ? 'text-yellow-600' : 'text-gray-500'}`}></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t.label}</p>
                    {tab === t.key && <p className="font-bold text-gray-900">{vipCount} VIP / {items.length}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="mb-4">
          <input type="text" placeholder="Tìm theo tiêu đề hoặc tên người đăng..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Tiêu đề</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">Người đăng</th>
                <th className="text-center px-4 py-3 text-gray-600 font-medium">Trạng thái VIP</th>
                <th className="text-center px-4 py-3 text-gray-600 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={4} className="py-12 text-center text-gray-400">
                  <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="py-12 text-center text-gray-400">Không có dữ liệu</td></tr>
              ) : filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 line-clamp-1">{item.title}</div>
                    {item.isVip && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">VIP</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{item.user?.fullName}</td>
                  <td className="px-4 py-3 text-center">
                    {item.isVip ? (
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-3 py-1 rounded-full font-bold">
                        <i className="ri-vip-crown-fill"></i> VIP
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Thường</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleVip(item)} disabled={toggling === item.id}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                        item.isVip
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:opacity-90'
                      }`}>
                      {toggling === item.id ? '...' : item.isVip ? 'Hủy VIP' : '⭐ Lên VIP'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
