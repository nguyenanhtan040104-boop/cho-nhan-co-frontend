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

  // Credit form
  const [creditUserId, setCreditUserId] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [creditNote, setCreditNote] = useState('');
  const [crediting, setCrediting] = useState(false);
  const [creditResult, setCreditResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const PRESET_AMOUNTS = [50000, 100000, 150000, 200000, 500000];

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

  async function handleCredit() {
    if (!creditUserId.trim()) { setCreditResult({ ok: false, msg: 'Vui lòng nhập User ID' }); return; }
    const amount = parseInt(creditAmount);
    if (!amount || amount <= 0) { setCreditResult({ ok: false, msg: 'Số tiền không hợp lệ' }); return; }
    setCrediting(true);
    setCreditResult(null);
    try {
      const res = await walletApi.adminCredit(creditUserId.trim(), amount, creditNote || undefined);
      setCreditResult({ ok: true, msg: res.message || 'Cộng tiền thành công' });
      setCreditUserId('');
      setCreditAmount('');
      setCreditNote('');
      await load();
    } catch (e: any) {
      setCreditResult({ ok: false, msg: e.message || 'Lỗi khi cộng tiền' });
    } finally {
      setCrediting(false);
    }
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

        {/* Manual Credit Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Công cụ test</p>
          <h2 className="text-base font-bold text-gray-900 mb-4">Cộng tiền thủ công vào ví</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">User ID</label>
              <input
                value={creditUserId}
                onChange={e => setCreditUserId(e.target.value)}
                placeholder="Dán userId từ DB..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Số tiền (VNĐ)</label>
              <input
                type="number"
                value={creditAmount}
                onChange={e => setCreditAmount(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {PRESET_AMOUNTS.map(a => (
                  <button key={a} onClick={() => setCreditAmount(String(a))}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${creditAmount === String(a) ? 'bg-green-600 text-white border-green-600' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`}>
                    {(a / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ghi chú (tùy chọn)</label>
              <input
                value={creditNote}
                onChange={e => setCreditNote(e.target.value)}
                placeholder="Lý do cộng tiền..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <button onClick={handleCredit} disabled={crediting}
              className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 disabled:opacity-50 transition">
              {crediting ? 'Đang xử lý...' : `+ Cộng ${creditAmount ? fmt(parseInt(creditAmount) || 0) : 'tiền'}`}
            </button>
            {creditResult && (
              <p className={`text-sm font-medium ${creditResult.ok ? 'text-green-600' : 'text-red-600'}`}>
                {creditResult.ok ? '✓ ' : '✗ '}{creditResult.msg}
              </p>
            )}
          </div>
        </div>

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
