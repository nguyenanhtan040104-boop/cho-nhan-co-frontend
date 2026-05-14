'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { wallet as walletApi, auth } from '../../../lib/api';

export default function AdminWalletPage() {
  const router = useRouter();
  const [pending, setPending] = useState<any[]>([]);
  const [all, setAll] = useState<any[]>([]);
  const [tab, setTab] = useState<'pending' | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!auth.isLoggedIn() || user?.role?.toLowerCase() !== 'admin') { router.replace('/profile'); return; }
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([walletApi.getPendingTopUps(), walletApi.getAllTransactions()]);
      setPending(p || []);
      setAll(a.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  async function handleConfirm(id: string) {
    setProcessing(id);
    try {
      await walletApi.confirmTopUp(id, note || undefined);
      await load();
    } catch (e: any) { alert(e.message || 'Lỗi'); }
    finally { setProcessing(null); setNote(''); }
  }

  async function handleReject(id: string) {
    if (!confirm('Từ chối yêu cầu này?')) return;
    setProcessing(id);
    try {
      await walletApi.rejectTopUp(id, 'Admin từ chối');
      await load();
    } catch (e: any) { alert(e.message || 'Lỗi'); }
    finally { setProcessing(null); }
  }

  const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.abs(n)) + 'đ';
  const statusColor: Record<string, string> = { pending: 'text-yellow-700 bg-yellow-100', completed: 'text-green-700 bg-green-100', rejected: 'text-red-700 bg-red-100' };
  const statusLabel: Record<string, string> = { pending: 'Chờ duyệt', completed: 'Đã duyệt', rejected: 'Từ chối' };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
            <i className="ri-arrow-left-line"></i>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <i className="ri-wallet-3-line text-green-600"></i> Quản lý nạp tiền
            </h1>
            <p className="text-sm text-gray-500">{pending.length} yêu cầu đang chờ duyệt</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          {(['pending', 'all'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg font-medium text-sm transition ${tab === t ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              {t === 'pending' ? `Chờ duyệt (${pending.length})` : 'Tất cả giao dịch'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400">Đang tải...</div>
        ) : tab === 'pending' ? (
          pending.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-400">
              <i className="ri-check-double-line text-4xl block mb-2 text-green-400"></i>Không có yêu cầu nào chờ duyệt
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map(tx => (
                <div key={tx.id} className="bg-white rounded-2xl shadow-sm border p-5">
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-add-circle-line text-green-600 text-lg"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{tx.user?.fullName || 'Người dùng'}</p>
                      <p className="text-sm text-gray-500">{tx.user?.email || tx.user?.phone}</p>
                      <p className="text-sm text-gray-600 mt-1">{tx.description}</p>
                      {tx.adminNote && <p className="text-xs text-gray-400 mt-1">Ghi chú: {tx.adminNote}</p>}
                      <p className="text-xs text-gray-400 mt-1">{new Date(tx.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{fmt(Number(tx.amount))}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <input value={note} onChange={e => setNote(e.target.value)} placeholder="Ghi chú (tùy chọn)..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
                    <button onClick={() => handleConfirm(tx.id)} disabled={processing === tx.id}
                      className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium">
                      {processing === tx.id ? '...' : '✓ Xác nhận'}
                    </button>
                    <button onClick={() => handleReject(tx.id)} disabled={processing === tx.id}
                      className="px-5 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50 text-sm font-medium">
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-600 font-medium">Người dùng</th>
                  <th className="text-left px-5 py-3 text-gray-600 font-medium hidden md:table-cell">Mô tả</th>
                  <th className="text-right px-5 py-3 text-gray-600 font-medium">Số tiền</th>
                  <th className="text-center px-5 py-3 text-gray-600 font-medium">Trạng thái</th>
                  <th className="text-right px-5 py-3 text-gray-600 font-medium hidden md:table-cell">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {all.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{tx.user?.fullName}</td>
                    <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{tx.description}</td>
                    <td className={`px-5 py-3 text-right font-bold ${Number(tx.amount) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {Number(tx.amount) > 0 ? '+' : '-'}{fmt(Number(tx.amount))}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[tx.status]}`}>{statusLabel[tx.status]}</span>
                    </td>
                    <td className="px-5 py-3 text-right text-gray-400 text-xs hidden md:table-cell">{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
