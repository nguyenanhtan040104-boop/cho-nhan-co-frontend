'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { products, realEstate, jobs, forum, auth, users } from '../../../lib/api';

type TabType = 'products' | 'real-estate' | 'jobs' | 'forum';

const TABS: { id: TabType; label: string; icon: string; color: string }[] = [
  { id: 'products',     label: 'San pham',     icon: 'ri-store-line',       color: 'text-forest-600'  },
  { id: 'real-estate',  label: 'Bat dong san', icon: 'ri-building-line',    color: 'text-brand-600' },
  { id: 'jobs',         label: 'Viec lam',     icon: 'ri-briefcase-line',   color: 'text-ink-soft'   },
  { id: 'forum',        label: 'Dien dan',     icon: 'ri-discuss-line',     color: 'text-forest-600' },
];

// Forum uses approvePost / rejectPost; others use adminApprove / adminReject
const API_MAP: Record<TabType, {
  getPending: (page: number, limit: number) => Promise<any>;
  approve: (id: string) => Promise<any>;
  reject: (id: string) => Promise<any>;
}> = {
  products:      { getPending: (p, l) => products.adminGetPending(p, l),      approve: id => products.adminApprove(id),      reject: id => products.adminReject(id)      },
  'real-estate': { getPending: (p, l) => realEstate.adminGetPending(p, l),    approve: id => realEstate.adminApprove(id),    reject: id => realEstate.adminReject(id)    },
  jobs:          { getPending: (p, l) => jobs.adminGetPending(p, l),          approve: id => jobs.adminApprove(id),          reject: id => jobs.adminReject(id)          },
  forum:         { getPending: (p, l) => forum.getPendingPosts({ page: p, limit: l }), approve: id => forum.approvePost(id), reject: id => forum.rejectPost(id) },
};

const DETAIL_LINK: Record<TabType, (id: string) => string> = {
  'products':    id => `/products/${id}`,
  'real-estate': id => `/real-estate/${id}`,
  'jobs':        id => `/jobs/${id}`,
  'forum':       id => `/forum/${id}`,
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
  const [counts, setCounts] = useState<Record<TabType, number>>({
    products: 0, 'real-estate': 0, jobs: 0, forum: 0,
  });

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.replace('/profile'); return; }
    users.getMe().then(me => {
      if (me?.role?.toLowerCase() !== 'admin') { router.replace('/dashboard'); return; }
      Promise.allSettled([
        products.adminGetPending(1, 1),
        realEstate.adminGetPending(1, 1),
        jobs.adminGetPending(1, 1),
        forum.getPendingPosts({ page: 1, limit: 1 }),
      ]).then(([p, r, j, f]) => {
        setCounts({
          products:      p.status === 'fulfilled' ? (p.value as any).total || 0 : 0,
          'real-estate': r.status === 'fulfilled' ? (r.value as any).total || 0 : 0,
          jobs:          j.status === 'fulfilled' ? (j.value as any).total || 0 : 0,
          forum:         f.status === 'fulfilled' ? (f.value as any).total || 0 : 0,
        });
      });
    }).catch(() => router.replace('/profile'));
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

  // Helpers to extract display fields per content type
  const getImage = (item: any) => item.images?.[0]?.url || (Array.isArray(item.images) && typeof item.images[0] === 'string' ? item.images[0] : null);
  const getPrice = (item: any) => {
    if (tab === 'forum') return null;
    if (item.price) return `${fmt(item.price)}d`;
    return item.salary || 'Thoa thuan';
  };
  const getSub = (item: any) => {
    if (tab === 'products')     return item.location || item.category || '';
    if (tab === 'real-estate')  return item.address || item.type || '';
    if (tab === 'jobs')         return item.location || item.category || '';
    return item.category || '';   // forum
  };
  const getBody = (item: any) => {
    if (tab === 'forum') return item.content?.replace(/<[^>]*>/g, '').slice(0, 120) || '';
    return item.description?.slice(0, 80) || '';
  };

  const totalPending = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <div className="bg-surface border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/dashboard"
            className="w-9 h-9 border border-line rounded-lg flex items-center justify-center hover:bg-paper">
            <i className="ri-arrow-left-line text-ink-soft"></i>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-ink">Duyet noi dung</h1>
            <p className="text-xs text-ink-faint">
              {totalPending > 0 ? `${totalPending} bai cho duyet tren tat ca danh muc` : 'Tat ca da duoc duyet'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 flex border-t border-line overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'border-line text-ink'
                  : 'border-transparent text-ink-soft hover:text-ink'
              }`}>
              <i className={`${t.icon} ${t.color}`}></i>
              {t.label}
              {counts[t.id] > 0 && (
                <span className="absolute -top-0.5 right-0.5 bg-brand-500 text-white text-[11px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
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
            <div className="w-10 h-10 border-4 border-line border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-surface rounded-card p-16 text-center">
            <i className="ri-checkbox-circle-line text-6xl text-forest-400 block mb-3"></i>
            <p className="font-semibold text-ink text-lg">Tat ca da duoc duyet!</p>
            <p className="text-ink-faint text-sm mt-1">Khong co bai nao cho duyet trong muc nay.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-ink-faint mb-3 font-medium">{total} bai cho duyet</p>
            <div className="space-y-3">
              {items.map(item => {
                const img = getImage(item);
                const price = getPrice(item);
                const sub = getSub(item);
                const body = getBody(item);
                const isProcessing = processing === item.id;

                return (
                  <div key={item.id} className="bg-surface rounded-card border border-line overflow-hidden">
                    <div className="flex gap-4 p-4">
                      {/* Thumbnail — hide for forum if no image */}
                      {(img || tab !== 'forum') && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-paper flex-shrink-0">
                          {img ? (
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <i className={`text-2xl text-ink-faint ${
                                tab === 'products' ? 'ri-store-line' :
                                tab === 'real-estate' ? 'ri-building-line' :
                                tab === 'jobs' ? 'ri-briefcase-line' : 'ri-discuss-line'
                              }`}></i>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-ink text-sm line-clamp-2 leading-snug">{item.title}</h3>
                          <span className="bg-gold-100 text-gold-700 text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                            CHO DUYET
                          </span>
                        </div>

                        {body && (
                          <p className="text-xs text-ink-soft line-clamp-2 mb-1.5">{body}</p>
                        )}

                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          {price && <span className="text-sm font-bold text-brand-600">{price}</span>}
                          {sub && (
                            <span className="text-xs text-ink-faint flex items-center gap-0.5">
                              <i className="ri-map-pin-line"></i> {sub}
                            </span>
                          )}
                        </div>

                        {/* Author */}
                        <div className="flex items-center gap-2">
                          {item.user?.avatarUrl ? (
                            <img src={item.user.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-line flex items-center justify-center">
                              <i className="ri-user-line text-[11px] text-ink-faint"></i>
                            </div>
                          )}
                          <span className="text-xs text-ink-soft">
                            {item.isAnonymous ? 'An danh' : (item.user?.fullName || item.user?.username || 'N/A')}
                          </span>
                          <span className="text-xs text-ink-faint">•</span>
                          <span className="text-xs text-ink-faint">
                            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action bar */}
                    <div className="border-t border-line px-4 py-3 flex items-center gap-2 bg-paper">
                      <Link href={DETAIL_LINK[tab](item.id)} target="_blank"
                        className="flex items-center gap-1 text-xs text-ink-soft hover:underline mr-auto">
                        <i className="ri-external-link-line"></i> Xem chi tiet
                      </Link>

                      <button onClick={() => handleReject(item.id)} disabled={isProcessing}
                        className="px-4 py-2 border border-brand-200 text-brand-600 rounded-lg text-xs font-semibold hover:bg-brand-50 disabled:opacity-50 transition">
                        {isProcessing ? '...' : 'Tu choi'}
                      </button>

                      <button onClick={() => handleApprove(item.id)} disabled={isProcessing}
                        className="px-4 py-2 bg-brand-500 text-white rounded-lg text-xs font-semibold hover:bg-brand-600 disabled:opacity-50 transition">
                        {isProcessing ? '...' : 'Duyet dang'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => load(p)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                  p === page ? 'bg-ink text-white' : 'bg-surface border border-line text-ink-soft hover:bg-paper'
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
