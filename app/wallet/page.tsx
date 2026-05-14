'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { wallet as walletApi, products as productsApi, jobs as jobsApi, realEstate as reApi, auth } from '../../lib/api';

const BANK_ACCOUNTS = [
  { bank: 'Agribank', number: '5300205746694', owner: 'NGUYEN ANH TAN', color: 'green' },
  { bank: 'MB Bank',  number: '0888317289',    owner: 'NGUYEN ANH TAN', color: 'blue'  },
];

const VIP_PRICE: Record<string, number> = { product: 50000, job: 50000, real_estate: 100000 };
const TYPE_LABEL: Record<string, string> = { product: 'Sản phẩm', job: 'Tuyển dụng', real_estate: 'BĐS' };

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Top-up form
  const [showTopUp, setShowTopUp] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // My listings for VIP purchase
  const [showBuyVip, setShowBuyVip] = useState(false);
  const [myListings, setMyListings] = useState<{ type: string; id: string; title: string; isVip: boolean }[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [vipSuccess, setVipSuccess] = useState('');

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

  async function loadMyListings() {
    setLoadingListings(true);
    try {
      const [p, j, r] = await Promise.all([
        productsApi.getMine().catch(() => ({ data: [] })),
        jobsApi.getMine().catch(() => ({ data: [] })),
        reApi.getMine().catch(() => ({ data: [] })),
      ]);
      const listings = [
        ...((p as any).data || []).map((x: any) => ({ type: 'product', id: x.id, title: x.title, isVip: x.isVip })),
        ...((j as any).data || []).map((x: any) => ({ type: 'job', id: x.id, title: x.title, isVip: x.isVip })),
        ...((r as any).data || []).map((x: any) => ({ type: 'real_estate', id: x.id, title: x.title, isVip: x.isVip })),
      ];
      setMyListings(listings);
    } catch { /* ignore */ }
    finally { setLoadingListings(false); }
  }

  async function handleOpenBuyVip() {
    setShowBuyVip(true);
    setVipSuccess('');
    if (myListings.length === 0) loadMyListings();
  }

  async function handleBuyVip(item: { type: string; id: string; title: string }) {
    const price = VIP_PRICE[item.type];
    if (balance < price) {
      setError(`Số dư không đủ. Cần ${fmt(price)}, hiện có ${fmt(balance)}. Vui lòng nạp thêm.`);
      setShowBuyVip(false);
      setShowTopUp(true);
      return;
    }
    if (!confirm(`Mua VIP cho "${item.title}" với giá ${fmt(price)}?`)) return;
    setBuyingId(item.id);
    try {
      const res = await walletApi.buyVip(item.type as any, item.id) as any;
      setVipSuccess(res.message || 'Mua VIP thành công!');
      setMyListings(prev => prev.map(l => l.id === item.id ? { ...l, isVip: true } : l));
      await load(); // refresh balance
    } catch (e: any) {
      alert(e.message || 'Lỗi mua VIP');
    } finally {
      setBuyingId(null);
    }
  }

  async function handleTopUp(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!amount || Number(amount) < 10000) { setError('Số tiền tối thiểu 10,000đ'); return; }
    setSubmitting(true);
    try {
      await walletApi.requestTopUp(Number(amount), note || undefined);
      setSuccess('Yêu cầu nạp tiền đã được gửi! Admin sẽ xác nhận trong vòng 30 phút.');
      setAmount(''); setNote(''); setShowTopUp(false);
      load();
    } catch (e: any) { setError(e.message || 'Lỗi gửi yêu cầu'); }
    finally { setSubmitting(false); }
  }

  const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
  const PRESETS = [50000, 100000, 200000, 500000];
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
            <button onClick={() => { setShowTopUp(!showTopUp); setShowBuyVip(false); }}
              className="flex-1 bg-white text-green-700 font-semibold py-2.5 rounded-xl hover:bg-green-50 transition flex items-center justify-center gap-2 text-sm">
              <i className="ri-add-circle-line text-lg"></i> Nạp tiền
            </button>
            <button onClick={() => { handleOpenBuyVip(); setShowTopUp(false); }}
              className="flex-1 bg-white/20 text-white font-semibold py-2.5 rounded-xl hover:bg-white/30 transition flex items-center justify-center gap-2 text-sm backdrop-blur-sm">
              <i className="ri-vip-crown-fill text-lg"></i> Mua VIP
            </button>
          </div>
        </div>

        {/* Messages */}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2"><i className="ri-check-circle-line"></i>{success}</div>}
        {vipSuccess && <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2"><i className="ri-vip-crown-fill"></i>{vipSuccess}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}

        {/* Buy VIP panel */}
        {showBuyVip && (
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <i className="ri-vip-crown-fill text-yellow-500"></i> Mua VIP cho tin đăng
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">Chọn tin bạn muốn nâng lên VIP</p>
              </div>
              <button onClick={() => setShowBuyVip(false)} className="text-gray-400 hover:text-gray-600">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* Price info */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {Object.entries(VIP_PRICE).map(([type, price]) => (
                <div key={type} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">{TYPE_LABEL[type]}</p>
                  <p className="font-bold text-gray-900 text-sm mt-1">{fmt(price)}</p>
                  <p className="text-xs text-gray-400">30 ngày</p>
                </div>
              ))}
            </div>

            {loadingListings ? (
              <div className="py-8 text-center text-gray-400">
                <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Đang tải danh sách tin...
              </div>
            ) : myListings.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <i className="ri-inbox-line text-3xl block mb-2"></i>
                <p className="text-sm">Bạn chưa có tin đăng nào</p>
                <Link href="/products/create" className="inline-block mt-3 text-green-600 text-sm hover:underline">+ Đăng tin ngay</Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {myListings.map(item => (
                  <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition ${item.isVip ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200 hover:border-yellow-300'}`}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.isVip ? 'bg-yellow-100' : 'bg-white border border-gray-200'}`}>
                      <i className={`text-sm ${item.isVip ? 'ri-vip-crown-fill text-yellow-500' : 'ri-file-list-line text-gray-400'}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                      <p className="text-xs text-gray-400">{TYPE_LABEL[item.type]} · {fmt(VIP_PRICE[item.type])}</p>
                    </div>
                    {item.isVip ? (
                      <span className="flex-shrink-0 text-xs bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
                        <i className="ri-vip-crown-fill"></i> Đang VIP
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBuyVip(item)}
                        disabled={buyingId === item.id}
                        className="flex-shrink-0 text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-1.5 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition whitespace-nowrap"
                      >
                        {buyingId === item.id ? '...' : '⭐ Mua VIP'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-4 text-center">
              Số dư hiện tại: <strong className="text-gray-600">{fmt(balance)}</strong> · Sau khi mua VIP, số dư sẽ bị trừ ngay lập tức
            </p>
          </div>
        )}

        {/* Top-up form */}
        {showTopUp && (
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Nạp tiền vào ví</h2>
              <button onClick={() => setShowTopUp(false)} className="text-gray-400 hover:text-gray-600">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* Bank info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {BANK_ACCOUNTS.map(acc => (
                <div key={acc.bank} className={`rounded-xl p-4 border-2 ${acc.color === 'green' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                  <p className={`font-bold text-sm mb-2 ${acc.color === 'green' ? 'text-green-800' : 'text-blue-800'}`}>{acc.bank}</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Số TK:</span>
                      <div className="flex items-center gap-1">
                        <span className={`font-bold ${acc.color === 'green' ? 'text-green-700' : 'text-blue-700'}`}>{acc.number}</span>
                        <button onClick={() => navigator.clipboard.writeText(acc.number)} className="text-gray-400 hover:text-gray-600">
                          <i className="ri-file-copy-line"></i>
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Chủ TK:</span>
                      <span className="font-medium text-gray-700">{acc.owner}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleTopUp} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Số tiền muốn nạp</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESETS.map(p => (
                    <button key={p} type="button" onClick={() => setAmount(String(p))}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${amount === String(p) ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 hover:border-green-400 text-gray-700'}`}>
                      {fmt(p)}
                    </button>
                  ))}
                </div>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="Nhập số tiền khác..." min="10000" step="1000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Mã giao dịch / ghi chú (tùy chọn)</label>
                <input type="text" value={note} onChange={e => setNote(e.target.value)}
                  placeholder="Nhập mã giao dịch ngân hàng để admin dễ xác nhận..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-sm" />
              </div>
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
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Lịch sử giao dịch</h2>
            <Link href="/pricing" className="text-sm text-green-600 hover:underline">Mua gói dịch vụ</Link>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400">Đang tải...</div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <i className="ri-receipt-line text-4xl block mb-2"></i>
              <p className="text-sm">Chưa có giao dịch nào</p>
            </div>
          ) : (
            <div className="divide-y">
              {transactions.map(tx => (
                <div key={tx.id} className="px-5 py-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === 'top_up' ? 'bg-green-100' : 'bg-orange-100'}`}>
                    <i className={`${tx.type === 'top_up' ? 'ri-add-circle-line text-green-600' : 'ri-vip-crown-fill text-orange-500'}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{tx.description}</p>
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
