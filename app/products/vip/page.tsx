'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { products as productsApi, wallet as walletApi, auth } from '../../../lib/api';

const VIP_PLANS = [
  { days: 7, label: '7 ngày', price: 50000, desc: 'Thử nghiệm' },
  { days: 30, label: '30 ngày', price: 150000, desc: 'Phổ biến nhất', popular: true },
  { days: 90, label: '90 ngày', price: 350000, desc: 'Tiết kiệm 22%' },
];

export default function VipProductPage() {
  return (
    <Suspense fallback={<div className="grid min-h-[60vh] place-items-center text-ink-faint">Đang tải...</div>}>
      <VipProductContent />
    </Suspense>
  );
}

function VipProductContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get('id');

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(30);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Payment modal state
  const [paymentData, setPaymentData] = useState<{ checkoutUrl: string; qrCode: string; orderCode: number; amount: number } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.push('/profile'); return; }
    if (!productId) { setLoading(false); return; }
    productsApi.getOne(productId)
      .then(p => setProduct(p))
      .catch(() => setError('Không tìm thấy sản phẩm'))
      .finally(() => setLoading(false));
  }, [productId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  function startPolling(orderCode: string) {
    pollRef.current = setInterval(async () => {
      try {
        const res = await walletApi.checkVipPaymentStatus(orderCode);
        if (res.status === 'completed') {
          stopAll();
          setShowModal(false);
          setPaymentData(null);
          setSuccess(true);
          setTimeout(() => router.push('/dashboard?tab=products'), 2500);
        }
      } catch {}
    }, 3000);
  }

  function startCountdown() {
    setCountdown(300);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          stopAll();
          setShowModal(false);
          setPaymentData(null);
          setError('Thanh toán hết hạn. Vui lòng thử lại.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function stopAll() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
  }

  async function handlePay() {
    if (!productId) { alert('Vui lòng chọn sản phẩm từ trang quản lý'); return; }
    setError('');
    setCreating(true);
    try {
      const res = await walletApi.createVipPayment('product', productId, selectedPlan);
      setPaymentData(res);
      setShowModal(true);
      startPolling(String(res.orderCode));
      startCountdown();
    } catch (e: any) {
      setError(e.message || 'Không thể tạo thanh toán');
    } finally {
      setCreating(false);
    }
  }

  function handleCancelModal() {
    stopAll();
    setShowModal(false);
    setPaymentData(null);
  }

  const plan = VIP_PLANS.find(p => p.days === selectedPlan)!;
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="min-h-screen bg-paper pb-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="flex items-center gap-3 py-4">
          <Link href="/dashboard" aria-label="Quay lại" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line bg-surface hover:border-forest-500"><i className="ri-arrow-left-line text-lg" /></Link>
          <div>
            <h1 className="text-xl font-bold text-ink sm:text-2xl">Đẩy tin lên nổi bật</h1>
            <p className="text-[13px] text-ink-faint">Tin VIP hiện trên đầu danh sách và có nhãn "Nổi bật"</p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
          <section aria-labelledby="goi">
            <h2 id="goi" className="mb-2 text-lg font-bold text-ink">Chọn thời gian</h2>
            <div className="space-y-2" role="radiogroup" aria-labelledby="goi">
              {VIP_PLANS.map(p => (
                <button key={p.days} role="radio" aria-checked={selectedPlan === p.days} onClick={() => setSelectedPlan(p.days)}
                  className={`flex w-full items-center justify-between gap-3 rounded-card border p-4 text-left transition-colors ${selectedPlan === p.days ? 'border-forest-600 bg-forest-50' : 'border-line bg-surface hover:border-forest-400'}`}>
                  <span>
                    <span className="font-semibold text-ink">{p.label}</span>
                    {p.popular && <span className="ml-2 rounded bg-gold-100 px-1.5 py-0.5 text-[11px] font-semibold text-gold-700">Phổ biến</span>}
                    <span className="block text-[13px] text-ink-soft">{p.desc}</span>
                  </span>
                  <span className="text-lg font-bold tabular-nums text-ink">{p.price.toLocaleString('vi-VN')}đ</span>
                </button>
              ))}
            </div>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-ink-soft marker:text-forest-600">
              <li>Hiện trên đầu danh sách trong thời gian VIP</li>
              <li>Có nhãn "Nổi bật" bên cạnh ảnh</li>
            </ul>
          </section>

          <section className="card p-4 sm:p-5" aria-labelledby="xn">
            <h2 id="xn" className="text-lg font-bold text-ink">Xác nhận</h2>

            {loading ? (
              <p className="py-6 text-center text-sm text-ink-faint">Đang tải tin...</p>
            ) : product ? (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-line p-2.5">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-paper">
                  {product.images?.[0] && <img src={product.images[0].url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{product.title}</p>
                  <p className="text-[12px] text-ink-faint">{Number(product.price).toLocaleString('vi-VN')}đ/{product.unit}</p>
                  {product.isVip && product.vipExpiresAt && <p className="text-[12px] font-semibold text-gold-700">VIP đến {new Date(product.vipExpiresAt).toLocaleDateString('vi-VN')}</p>}
                </div>
              </div>
            ) : !productId ? (
              <p className="mt-3 rounded-lg border border-gold-200 bg-gold-50 p-3 text-sm text-gold-800">
                Chưa chọn tin. Vào <Link href="/dashboard?tab=products" className="font-semibold underline">Quản lý tin</Link>, chọn tin rồi bấm "Nâng VIP".
              </p>
            ) : null}

            <dl className="mt-4 divide-y divide-line border-t border-line text-sm">
              <div className="flex justify-between py-2"><dt className="text-ink-soft">Gói</dt><dd className="font-medium text-ink">{plan.label}</dd></div>
              <div className="flex justify-between py-2"><dt className="font-bold text-ink">Tổng cộng</dt><dd className="text-lg font-bold tabular-nums text-forest-700">{plan.price.toLocaleString('vi-VN')}đ</dd></div>
            </dl>

            {error && <p role="alert" className="mt-3 text-sm text-brand-600">{error}</p>}

            {success ? (
              <p role="status" className="mt-4 rounded-lg border border-forest-200 bg-forest-50 p-3 text-center text-sm text-forest-800"><b>Nâng cấp VIP thành công.</b> Đang chuyển về trang quản lý...</p>
            ) : (
              <button onClick={handlePay} disabled={creating || !productId} className="btn-forest mt-4 w-full py-3 disabled:opacity-50">
                {creating ? <><i className="ri-loader-4-line animate-spin" aria-hidden="true" /> Đang tạo thanh toán...</> : 'Tiến hành thanh toán'}
              </button>
            )}
            <p className="mt-3 text-center text-[12px] text-ink-faint">Thanh toán qua PayOS, tự xác nhận sau khi nhận được tiền.</p>
          </section>
        </div>
      </div>

      {showModal && paymentData && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/60 p-4" role="dialog" aria-modal="true" aria-label="Thanh toán VIP">
          <div className="w-full max-w-sm rounded-sheet bg-surface p-5">
            <p className="text-sm text-ink-soft">Thanh toán VIP</p>
            <p className="text-3xl font-bold tabular-nums text-ink">{paymentData.amount.toLocaleString('vi-VN')}đ</p>

            <div className="mt-4 grid place-items-center">
              <div className="grid h-52 w-52 place-items-center overflow-hidden rounded-card border border-line bg-white">
                {paymentData.qrCode ? <img src={paymentData.qrCode} alt="Mã QR thanh toán" className="h-full w-full object-contain" /> : <i className="ri-qr-code-line text-5xl text-ink-faint" />}
              </div>
            </div>

            <p className="mt-4 text-center text-sm text-ink-soft">Mã QR hết hạn sau</p>
            <p className={`text-center text-2xl font-bold tabular-nums ${countdown <= 60 ? 'text-brand-600' : 'text-ink'}`} aria-live="off">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </p>
            <p className="mt-2 text-center text-[13px] text-ink-soft">Đang chờ thanh toán, tự xác nhận khi nhận được tiền.</p>

            <div className="mt-5 flex gap-3">
              <a href={paymentData.checkoutUrl} target="_blank" rel="noreferrer" className="btn-forest flex-1">Mở trang thanh toán</a>
              <button onClick={handleCancelModal} className="btn-ghost flex-1">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
