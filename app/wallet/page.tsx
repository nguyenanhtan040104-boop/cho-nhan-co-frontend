'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { wallet as walletApi, auth } from '../../lib/api';

const BANK_INFO = {
  bankName: 'Vietcombank',
  accountNumber: '1234567890',
  accountName: 'NGUYEN ANH TAN',
  branch: 'Chi nhánh Đắk Nông',
};

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.replace('/profile'); return; }
    load();
  }, []);

  async function load() {
    try {
      const res = await walletApi.get();
      setBalance(Number(res.balance));
      setTransactions(res.transactions || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  async function handleTopUp(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!amount || Number(amount) < 10000) { setError('Số tiền tối thiểu 10,000đ'); return; }
    setSubmitting(true);
    try {
      await walletApi.requestTopUp(Number(amount), note || undefined);
      setSuccess('Yêu cầu nạp tiền đã được gửi! Admin sẽ xác nhận trong vòng 24h.');
      setAmount(''); setNote(''); setShowTopUp(false);
      load();
    } catch (e: any) { setError(e.message || 'Lỗi gửi yêu cầu'); }
    finally { setSubmitting(false); }
  }

  const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
  const PRESETS = [50000, 100000, 200000, 500000];

  const typeLabel: Record<string, string> = { top_up: 'Nạp tiền', buy_vip: 'Mua VIP', buy_ad: 'Mua quảng cáo' };
  const statusColor: Record<string, string> = { pending: 'text-yellow-600 bg-yellow-50', completed: 'text-green-600 bg-green-50', rejected: 'text-red-600 bg-red-50' };
  const statusLabel: Record<string, string> = { pending: 'Chờ duyệt', completed: 'Thành công', rejected: 'Từ chối' };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-3">
          <Link href="/dashboard" className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
            <i className="ri-arrow-left-line"></i>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Ví của tôi</h1>
            <p className="text-sm text-gray-500">Quản lý số dư và giao dịch</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Balance card */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-green-100 text-sm mb-1">Số dư hiện tại</p>
          {loading ? (
            <div className="h-10 w-40 bg-white/20 rounded animate-pulse"></div>
          ) : (
            <p className="text-4xl font-bold">{fmt(balance)}</p>
          )}
          <div className="flex gap-3 mt-5">
            <button onClick={() => setShowTopUp(true)}
              className="flex-1 bg-white text-green-700 font-semibold py-2.5 rounded-xl hover:bg-green-50 transition flex items-center justify-center gap-2 text-sm">
              <i className="ri-add-circle-line text-lg"></i> Nạp tiền
            </button>
            <Link href="/products" className="flex-1 bg-white/20 text-white font-semibold py-2.5 rounded-xl hover:bg-white/30 transition flex items-center justify-center gap-2 text-sm backdrop-blur-sm">
              <i className="ri-vip-crown-fill text-lg"></i> Mua VIP
            </Link>
          </div>
        </div>

        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{success}</div>}

        {/* Top-up form */}
        {showTopUp && (
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="font-bold text-gray-900 mb-1">Nạp tiền vào ví</h2>
            <p className="text-sm text-gray-500 mb-5">Chuyển khoản đến tài khoản bên dưới, sau đó nhập số tiền để admin xác nhận.</p>

            {/* Bank info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
              <p className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2"><i className="ri-bank-line"></i>Thông tin chuyển khoản</p>
              <div className="space-y-2 text-sm">
                {[
                  ['Ngân hàng', BANK_INFO.bankName],
                  ['Số tài khoản', BANK_INFO.accountNumber],
                  ['Chủ tài khoản', BANK_INFO.accountName],
                  ['Chi nhánh', BANK_INFO.branch],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-blue-600">{label}:</span>
                    <span className="font-semibold text-blue-900">{value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-blue-600 mt-3">Nội dung CK: <span className="font-bold">NAP {typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('user') || '{}')?.fullName || 'TEN') : 'TEN'}</span></p>
            </div>

            <form onSubmit={handleTopUp} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Số tiền muốn nạp</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESETS.map(p => (
                    <button key={p} type="button" onClick={() => setAmount(String(p))}
                      className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition ${amount === String(p) ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 hover:border-green-400 text-gray-700'}`}>
                      {fmt(p)}
                    </button>
                  ))}
                </div>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Hoặc nhập số tiền khác..." min="10000" step="1000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Ghi chú (tùy chọn)</label>
                <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Mã giao dịch ngân hàng..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-sm" />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowTopUp(false); setError(''); }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium">Hủy</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 text-sm font-medium">
                  {submitting ? 'Đang gửi...' : 'Gửi yêu cầu nạp tiền'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="px-5 py-4 border-b">
            <h2 className="font-bold text-gray-900">Lịch sử giao dịch</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400">Đang tải...</div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <i className="ri-receipt-line text-4xl block mb-2"></i>Chưa có giao dịch nào
            </div>
          ) : (
            <div className="divide-y">
              {transactions.map(tx => (
                <div key={tx.id} className="px-5 py-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === 'top_up' ? 'bg-green-100' : 'bg-orange-100'}`}>
                    <i className={`${tx.type === 'top_up' ? 'ri-add-circle-line text-green-600' : 'ri-vip-crown-fill text-orange-500'}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(tx.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm ${Number(tx.amount) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {Number(tx.amount) > 0 ? '+' : ''}{fmt(Math.abs(Number(tx.amount)))}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[tx.status]}`}>
                      {statusLabel[tx.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
