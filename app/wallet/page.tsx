'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { wallet as walletApi, products as productsApi, jobs as jobsApi, realEstate as reApi, auth } from '../../lib/api';

const VIP_PRICE: Record<string, number> = { product: 50000, job: 50000, real_estate: 100000 };
const TYPE_LABEL: Record<string, string> = { product: 'Sản phẩm', job: 'Tuyển dụng', real_estate: 'BĐS' };
const PRESETS = [50000, 100000, 200000, 500000];
const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
const statusColor: Record<string, string> = { pending: 'text-gold-700 bg-gold-100', completed: 'text-forest-800 bg-forest-50', rejected: 'text-brand-700 bg-brand-50' };
const statusLabel: Record<string, string> = { pending: 'Đang xử lý', completed: 'Thành công', rejected: 'Từ chối' };

export default function WalletPage() {
  return (
    <Suspense fallback={<div className="grid min-h-[60vh] place-items-center text-ink-faint">Đang tải...</div>}>
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

  const panel = 'card p-4 sm:p-5';

  return (
    <div className="min-h-screen bg-paper pb-10">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="flex items-center gap-3 py-4">
          <Link href="/dashboard" aria-label="Quay lại" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line bg-surface hover:border-forest-500">
            <i className="ri-arrow-left-line text-lg" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-ink sm:text-2xl">Ví của tôi</h1>
            <p className="text-[13px] text-ink-faint">Số dư và lịch sử giao dịch</p>
          </div>
        </div>

        <div className="space-y-4">
          <section className={panel} aria-label="Số dư">
            <p className="text-[13px] text-ink-soft">Số dư hiện tại</p>
            {loading ? (
              <div className="mt-1 h-10 w-40 animate-pulse rounded bg-paper" />
            ) : (
              <p className="mt-1 text-4xl font-bold tabular-nums text-ink">{fmt(balance)}</p>
            )}
            <div className="mt-4 flex gap-3">
              <button onClick={() => { setShowTopUp(!showTopUp); setShowBuyVip(false); setError(''); }} className="btn-forest flex-1">Nạp tiền</button>
              <button onClick={() => { setShowBuyVip(!showBuyVip); setShowTopUp(false); if (myListings.length === 0) loadMyListings(); setVipSuccess(''); }} className="btn-ghost flex-1">Mua VIP cho tin</button>
            </div>
          </section>

          {paymentStatus === 'success' && !paymentData && (
            <p role="status" className="rounded-card border border-forest-200 bg-forest-50 p-3 text-sm text-forest-800">
              <b>Nạp tiền thành công.</b> Số dư đã được cộng vào ví của bạn.
            </p>
          )}
          {paymentStatus === 'cancel' && (
            <p className="rounded-card border border-gold-200 bg-gold-50 p-3 text-sm text-gold-800">Bạn đã hủy giao dịch. Chọn lại số tiền để nạp.</p>
          )}
          {vipSuccess && <p role="status" className="rounded-card border border-gold-200 bg-gold-50 p-3 text-sm text-gold-800">{vipSuccess}</p>}
          {error && <p role="alert" className="rounded-card border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">{error}</p>}

          {paymentData && (
            <section className={panel} aria-label="Thanh toán">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-ink">Quét mã để thanh toán</h2>
                  <p className="mt-0.5 text-sm text-ink-soft">Mở app ngân hàng, quét mã QR và xác nhận chuyển tiền.</p>
                </div>
                <button onClick={closePayment} aria-label="Đóng" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-paper"><i className="ri-close-line text-xl" /></button>
              </div>

              <div className="mt-4 flex flex-col items-center">
                <div className="rounded-card border border-line bg-white p-3">
                  <img
                    src={paymentData.qrCode}
                    alt="Mã QR thanh toán"
                    className="h-56 w-56 object-contain"
                    onError={e => {
                      (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=224x224&data=${encodeURIComponent(paymentData.qrCode)}`;
                    }}
                  />
                </div>
                <p className="mt-4 text-[13px] text-ink-soft">Số tiền cần chuyển</p>
                <p className="text-3xl font-bold tabular-nums text-forest-700">{fmt(paymentData.amount)}</p>
                <p className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-forest-600 border-t-transparent" aria-hidden="true" />
                  Đang chờ thanh toán, tự động xác nhận khi nhận được tiền
                </p>
                <div className="mt-5 flex w-full gap-3">
                  <a href={paymentData.checkoutUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost flex-1">Mở lại trang thanh toán</a>
                  <button onClick={closePayment} className="btn-ghost px-6">Hủy</button>
                </div>
              </div>
            </section>
          )}

          {showTopUp && !paymentData && (
            <section className={panel} aria-label="Nạp tiền">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-ink">Nạp tiền vào ví</h2>
                  <p className="mt-0.5 text-sm text-ink-soft">Chọn số tiền, quét mã QR, số dư được cộng tự động.</p>
                </div>
                <button onClick={() => { setShowTopUp(false); setError(''); }} aria-label="Đóng" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-paper"><i className="ri-close-line text-xl" /></button>
              </div>

              <p className="mb-2 mt-4 text-sm font-semibold text-ink">Chọn số tiền</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Số tiền nạp">
                {PRESETS.map(p => (
                  <button key={p} role="radio" aria-checked={amount === String(p)} onClick={() => setAmount(String(p))}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-semibold tabular-nums transition-colors ${amount === String(p) ? 'border-forest-600 bg-forest-50 text-forest-800' : 'border-line text-ink-soft hover:border-forest-400'}`}>
                    {fmt(p)}
                  </button>
                ))}
              </div>
              <label className="mt-3 block">
                <span className="mb-1.5 block text-sm font-semibold text-ink">Hoặc nhập số khác <span className="font-normal text-ink-faint">tối thiểu 10.000đ</span></span>
                <input type="number" inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value)} min="10000" step="1000" placeholder="Ví dụ: 150000" className="field" />
              </label>

              <button onClick={handleCreatePayment} disabled={creatingPayment || !amount || Number(amount) < 10000} className="btn-primary mt-4 w-full disabled:opacity-50">
                {creatingPayment ? <><i className="ri-loader-4-line animate-spin" aria-hidden="true" /> Đang tạo mã QR...</> : 'Tạo mã QR thanh toán'}
              </button>
            </section>
          )}

          {showBuyVip && (
            <section className={panel} aria-label="Mua VIP">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-ink">Mua VIP cho tin đăng</h2>
                  <p className="mt-0.5 text-sm text-ink-soft">Chọn tin muốn nâng lên nổi bật. Tiền được trừ từ số dư ví.</p>
                </div>
                <button onClick={() => setShowBuyVip(false)} aria-label="Đóng" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-paper"><i className="ri-close-line text-xl" /></button>
              </div>

              <dl className="mt-3 grid grid-cols-3 divide-x divide-line rounded-lg border border-line text-center">
                {Object.entries(VIP_PRICE).map(([type, price]) => (
                  <div key={type} className="px-2 py-2.5">
                    <dt className="text-[12px] text-ink-faint">{TYPE_LABEL[type]}</dt>
                    <dd className="text-sm font-bold tabular-nums text-ink">{fmt(price)}</dd>
                    <dd className="text-[11px] text-ink-faint">30 ngày</dd>
                  </div>
                ))}
              </dl>

              {loadingListings ? (
                <p className="py-8 text-center text-sm text-ink-faint">Đang tải danh sách tin...</p>
              ) : myListings.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-ink-soft">Bạn chưa có tin đăng nào</p>
                  <Link href="/products/create" className="mt-3 inline-block text-sm font-semibold text-forest-700 underline">Đăng tin ngay</Link>
                </div>
              ) : (
                <ul className="mt-3 max-h-80 divide-y divide-line overflow-y-auto">
                  {myListings.map(item => (
                    <li key={item.id} className="flex items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                        <p className="text-[12px] text-ink-faint">{TYPE_LABEL[item.type]} · {fmt(VIP_PRICE[item.type])}</p>
                      </div>
                      {item.isVip ? (
                        <span className="shrink-0 rounded bg-gold-100 px-2 py-1 text-[12px] font-semibold text-gold-700">Đang VIP</span>
                      ) : (
                        <button onClick={() => handleBuyVip(item)} disabled={buyingId === item.id} className="btn-forest shrink-0 !px-4 !py-1.5 text-[13px] disabled:opacity-50">
                          {buyingId === item.id ? 'Đang mua...' : 'Mua VIP'}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <section className="card" aria-label="Lịch sử giao dịch">
            <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
              <h2 className="text-lg font-bold text-ink">Lịch sử giao dịch</h2>
              <button onClick={load} aria-label="Tải lại" className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-paper"><i className="ri-refresh-line" /></button>
            </div>
            {loading ? (
              <p className="p-8 text-center text-sm text-ink-faint">Đang tải...</p>
            ) : transactions.length === 0 ? (
              <p className="p-10 text-center text-sm text-ink-faint">Chưa có giao dịch nào</p>
            ) : (
              <ul className="divide-y divide-line">
                {transactions.map(tx => {
                  const amt = Number(tx.amount);
                  return (
                    <li key={tx.id} className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{tx.description}</p>
                        <p className="text-[12px] text-ink-faint">{new Date(tx.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`text-sm font-bold tabular-nums ${amt > 0 ? 'text-forest-700' : 'text-ink'}`}>{amt > 0 ? '+' : '-'}{fmt(Math.abs(amt))}</p>
                        <span className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold ${statusColor[tx.status] || 'bg-paper text-ink-soft'}`}>{statusLabel[tx.status] || tx.status}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
