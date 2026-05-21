'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { products, realEstate, jobs, auth } from '../../../lib/api';

type TabType = 'products' | 'real-estate' | 'jobs';

const TABS: { id: TabType; label: string; icon: string; color: string }[] = [
  { id: 'products',     label: 'San pham',     icon: 'ri-store-line',     color: 'text-green-600'  },
  { id: 'real-estate',  label: 'Bat dong san', icon: 'ri-building-line',  color: 'text-orange-600' },
  { id: 'jobs',         label: 'Viec lam',     icon: 'ri-briefcase-line', color: 'text-blue-600'   },
];

const API_MAP = {
  products:     { getPending: products.adminGetPending.bind(products),    approve: products.adminApprove.bind(products),    reject: products.adminReject.bind(products)    },
  'real-estate':{ getPending: realEstate.adminGetPending.bind(realEstate), approve: realEstate.adminApprove.bind(realEstate), reject: realEstate.adminReject.bind(realEstate) },
  jobs:         { getPending: jobs.adminGetPending.bind(jobs),             approve: jobs.adminApprove.bind(jobs),             reject: jobs.adminReject.bind(jobs)             },
};

const DETAIL_LINK: Record<TabType, (id: string) => string> = {
  'products':    id => `/products/${id}`,
  'real-estate': id => `/real-estate/${id}`,
  'jobs':        id => `/jobs/${id}`,
};

function fmt(n: number) { return Number(n).toLocaleString('vi-VN'); }

export default function AdminContentPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabType>('products');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [processing, setProcessing] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<TabType, number>>({ products: 0, 'real-estate': 0, jobs: 0 });

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.replace('/profile'); return; }
    // Load count badges for all tabs
    Promise.all([
      products.adminGetPending(1, 1),
      realEstate.adminGetPending(1, 1),
      jobs.adminGetPending(1, 1),
    ]).then(([p, r, j]: any[]) => {
      setCounts({ products: p.total || 0, 'real-estate': r.total || 0, jobs: j.total || 0 });
    }).catch(() => {});
  }, []);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await API_MAP[tab].getPending(p, 20) as any;
      setItems(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setPage(p);
    } catch (e: any) { console.error(e); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(1); }, [tab]);

  async function handleApprove(id: string) {
    setProcessing(id);
    try {
      await API_MAP[tab].approve(id);
      setItems(prev => prev.filter(i => i.id !== id));
      setTotal(prev => prev - 1);
      setCounts(prev => ({ ...prev, [tab]: Math.max(0, prev[tab] - 1) }));
    } catch (e: any) { alert(e.message || 'Loi'); }
    finally { setProcessing(null); }
  }

  async function handleReject(id: string) {
    if (!confirm('Tu choi bai nay?')) return;
    setProcessing(id);
    try {
      await API_MAP[tab].reject(id);
      setItems(prev => prev.filter(i => i.id !== id));
      setTotal(prev => prev - 1);
      setCounts(prev => ({ ...prev, [tab]: Math.max(0, prev[tab] - 1) }));
    } catch (e: any) { alert(e.message || 'Loi'); }
    finally { setProcessing(null); }
  }

  const getImage = (item: any) => item.images?.[0]?.url || null;
  const getPrice = (item: any) => item.price ? `${fmt(item.price)}d` : (item.salary || 'Thoa thuan');
  const getSub = (item: any) => {
    if (tab === 'products') return item.location || item.category || '';
    if (tab === 'real-estate') return item.address || item.type || '';
    return item.location || item.type || '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/dashboard"
            className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50">
            <i className="ri-arrow-left-line text-gray-600"></i>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Duyet noi dung</h1>
            <p className="text-xs text-gray-400">{total} bai cho duyet</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 flex border-t border-gray-100">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              <i className={`${t.icon} ${t.color}`}></i>
              {t.label}
              {counts[t.id] > 0 && (
                <span className="absolute -top-0.5 right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                  {counts[t.id] > 99 ? '99+' : counts[t.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
            <i className="ri-checkbox-circle-line text-6xl text-green-400 block mb-3"></i>
            <p className="font-semibold text-gray-700 text-lg">Tat ca da duoc duyet!</p>
            <p className="text-gray-400 text-sm mt-1">Khong co bai nao cho duyet trong muc nay.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => {
              const img = getImage(item);
              const isProcessing = processing === item.id;
              return (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex gap-4 p-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {img ? (
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="ri-image-line text-2xl text-gray-300"></i>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug">{item.title}</h3>
                        <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                          CHO DUYET
                        </span>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <span className="text-sm font-bold text-red-500">{getPrice(item)}</span>
                        {getSub(item) && (
                          <span className="text-xs text-gray-400 flex items-center gap-0.5">
                            <i className="ri-map-pin-line"></i> {getSub(item)}
                          </span>
                        )}
                      </div>

                      {/* Author */}
                      <div className="flex items-center gap-2">
                        {item.user?.avatarUrl ? (
                          <img src={item.user.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                            <i className="ri-user-line text-[10px] text-gray-400"></i>
                          </div>
                        )}
                        <span className="text-xs text-gray-500">
                          {item.user?.fullName || item.user?.username || 'N/A'}
                        </span>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-gray-50 px-4 py-3 flex items-center gap-2 bg-gray-50/50">
                    <Link href={DETAIL_LINK[tab](item.id)} target="_blank"
                      className="flex items-center gap-1 text-xs text-blue-500 hover:underline mr-auto">
                      <i className="ri-external-link-line"></i> Xem chi tiet
                    </Link>

                    <button onClick={() => handleReject(item.id)} disabled={isProcessing}
                      className="px-4 py-2 border border-red-200 text-red-500 rounded-xl text-xs font-semibold hover:bg-red-50 disabled:opacity-50 transition">
                      {isProcessing ? '...' : 'Tu choi'}
                    </button>

                    <button onClick={() => handleApprove(item.id)} disabled={isProcessing}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-semibold hover:bg-green-700 disabled:opacity-50 transition">
                      {isProcessing ? '...' : 'Duyet dang'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => load(p)}
                className={`w-10 h-10 rounded-xl text-sm font-medium transition ${
                  p === page ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
