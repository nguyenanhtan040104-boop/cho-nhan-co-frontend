'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { wallet as walletApi, products as productsApi, jobs as jobsApi, realEstate as reApi, auth } from '../../lib/api';

const VIP_PRICE: Record<string, number> = { product: 50000, job: 50000, real_estate: 100000 };
const TYPE_LABEL: Record<string, string> = { product: 'Sản phẩm', job: 'Tuyển dụng', real_estate: 'BĐS' };
const PRESETS = [50000, 100000, 200000, 500000];
const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
const statusColor: Record<string, string> = { pending: 'text-yellow-600 bg-yellow-50', completed: 'text-green-600 bg-green-50', rejected: 'text-red-600 bg-red-50' };
const statusLabel: Record<string, string> = { pending: 'Đang xử lý', completed: 'Thành công', rejected: 'Từ chối' };

export default function WalletPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Đang tải...</div>}>
      <WalletContent />
    </Suspense>
  );
}

function WalletContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Top-up
  const [showTopUp, setShowTopUp] = useState(false);
  const [amount, setAmount] = useState('');
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [error, setError] = useState('');

  // QR payment
  const [paymentData, setPaymentData] = useState<{ checkoutUrl: string; qrCode: string; orderCode: number; amount: number } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'success' | 'cancel'>('waiting');
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Buy VIP panel
  const [showBuyVip, setShowBuyVip] = useState(false);
  const [myListings, setMyListings] = useState<{ type: string; id: string; title: string; isVip: boolean }[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [vipSuccess, setVipSuccess] = useState('');

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.replace('/profile'); return; }
    load();

    // Nếu redirect từ PayOS về
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      setPaymentStatus('success');
    } else if (payment === 'cancel') {
      setPaymentStatus('cancel');
    }
  }, []);

  async function load() {
    try {
      const res = await walletApi.get();
      setBalance(Number(res.balance));
      setTransactions(res.transactions || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  // Tạo QR thanh toán
  async function handleCreatePayment() {
    if (!amount || Number(amount) < 10000) { setError('Số tiền tối thiểu 10,000đ'); return; }
    setError('');
    setCreatingPayment(true);
    try {
      const res = await walletApi.createPayment(Number(amount)) as any;
      setPaymentData(res);
      setPaymentStatus('waiting');
      setShowTopUp(false);
      startPolling(String(res.orderCode));
      // Mở trang thanh toán PayOS ngay lập tức
      window.open(res.checkoutUrl, '_blank');
    } catch (e: any) {
      setError(e.message || 'Lỗi tạo thanh toán');
    } finally {
      setCreatingPayment(false);
    }
  }

  // Poll trạng thái mỗi 3 giây
  function startPolling(orderCode: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await walletApi.checkPaymentStatus(orderCode) as any;
        if (res.status === 'completed') {
          clearInterval(pollRef.current!);
          setPaymentStatus('success');
          setPaymentData(null);
          await load(); // reload balance
        }
      } catch { /* ignore */ }
    }, 3000);
  }

  function closePayment() {
    if (pollRef.current) clearInterval(pollRef.current);
    setPaymentData(null);
    setPaymentStatus('waiting');
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
      await load();
    } catch (e: any) {
      alert(e.message || 'Lỗi mua VIP');
    } finally {
      setBuyingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
            <button onClick={() => { setShowTopUp(!showTopUp); setShowBuyVip(false); setError(''); }}
              className="flex-1 bg-white text-green-700 font-semibold py-2.5 rounded-xl hover:bg-green-50 transition flex items-center justify-center gap-2 text-sm">
              <i className="ri-add-circle-line text-lg"></i> Nạp tiền
            </button>
            <button onClick={() => { setShowBuyVip(!showBuyVip); setShowTopUp(false); if (myListings.length === 0) loadMyListings(); setVipSuccess(''); }}
              className="flex-1 bg-white/20 text-white font-semibold py-2.5 rounded-xl hover:bg-white/30 transition flex items-center justify-center gap-2 text-sm backdrop-blur-sm">
              <i className="ri-vip-crown-fill text-lg"></i> Mua VIP
            </button>
          </div>
        </div>

        {/* Thông báo */}
        {paymentStatus === 'success' && !paymentData && (
          <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="ri-check-line text-green-600 text-xl"></i>
            </div>
            <div>
              <p className="font-semibold">Nạp tiền thành công!</p>
              <p className="text-sm">Số dư đã được cộng vào ví của bạn.</p>
            </div>
          </div>
        )}
        {paymentStatus === 'cancel' && (
          <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-xl text-sm">
            Bạn đã hủy giao dịch. Chọn lại số tiền để nạp.
          </div>
        )}
        {vipSuccess && (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <i className="ri-vip-crown-fill"></i> {vipSuccess}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* QR Payment Modal */}
        {paymentData && (
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <i className="ri-qr-code-line text-green-600 text-xl"></i> Quét mã thanh toán
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">Mở app ngân hàng → Quét QR → Xác nhận</p>
              </div>
              <button onClick={closePayment} className="text-gray-400 hover:text-gray-600">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="flex flex-col items-center">
              {/* QR Image */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-inner mb-4">
                <img
                  src={paymentData.qrCode}
                  alt="QR thanh toán"
                  className="w-56 h-56 object-contain"
                  onError={(e) => {
                    // Fallback: dùng QR generator nếu PayOS trả về URL
                    (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=224x224&data=${encodeURIComponent(paymentData.qrCode)}`;
                  }}
                />
              </div>

              {/* Amount */}
              <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-3 mb-4 text-center">
                <p className="text-xs text-gray-500 mb-0.5">Số tiền cần chuyển</p>
                <p className="text-2xl font-bold text-green-700">{fmt(paymentData.amount)}</p>
              </div>

              {/* Waiting indicator */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
                <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                Đang chờ thanh toán... tự động xác nhận khi nhận tiền
              </div>

              <div className="flex gap-3 w-full">
                <a
                  href={paymentData.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-50 border border-green-300 text-green-700 text-sm font-medium py-2.5 rounded-xl hover:bg-green-100 transition text-center"
                >
                  <i className="ri-external-link-line mr-1"></i>Mở lại trang thanh toán
                </a>
                <button
                  onClick={closePayment}
                  className="px-5 py-2.5 border border-gray-300 text-gray-600 text-sm rounded-xl hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top-up: chọn số tiền */}
        {showTopUp && !paymentData && (
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-gray-900">Nạp tiền vào ví</h2>
                <p className="text-sm text-gray-500 mt-0.5">Chọn số tiền → quét QR → tự động cộng số dư</p>
              </div>
              <button onClick={() => { setShowTopUp(false); setError(''); }} className="text-gray-400 hover:text-gray-600">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Chọn số tiền</label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {PRESETS.map(p => (
                    <button
                      key={p}
                      onClick={() => setAmount(String(p))}
                      className={`py-3 rounded-xl border-2 text-sm font-semibold transition ${amount === String(p)
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-gray-200 hover:border-green-400 text-gray-700 bg-gray-50'}`}
                    >
                      {fmt(p)}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Hoặc nhập số tiền khác..."
                  min="10000"
                  step="1000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>

              {amount && Number(amount) >= 10000 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 flex items-center gap-2">
                  <i className="ri-information-line"></i>
                  Sau khi quét QR và thanh toán <strong>{fmt(Number(amount))}</strong>, số dư sẽ được cộng tự động.
                </div>
              )}

              <button
                onClick={handleCreatePayment}
                disabled={creatingPayment || !amount || Number(amount) < 10000}
                className="w-full py-3.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-semibold text-sm flex items-center justify-center gap-2 transition"
              >
                {creatingPayment ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang tạo QR...</>
                ) : (
                  <><i className="ri-qr-code-line text-lg"></i> Tạo mã QR thanh toán</>
                )}
              </button>
            </div>
          </div>
        )}

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
                        <i className="ri-vip-crown-fill"></i> VIP
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBuyVip(item)}
                        disabled={buyingId === item.id}
                        className="flex-shrink-0 text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-1.5 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
                      >
                        {buyingId === item.id ? '...' : '⭐ Mua'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-4 text-center">
              Số dư: <strong className="text-gray-600">{fmt(balance)}</strong>
            </p>
          </div>
        )}

        {/* Transaction history */}
        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Lịch sử giao dịch</h2>
            <button onClick={load} className="text-sm text-gray-400 hover:text-green-600">
              <i className="ri-refresh-line"></i>
            </button>
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
                    <i className={tx.type === 'top_up' ? 'ri-add-circle-line text-green-600' : 'ri-vip-crown-fill text-orange-500'}></i>
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

