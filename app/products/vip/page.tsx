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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div></div>}>
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="w-9 h-9 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">
            <i className="ri-arrow-left-line"></i>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Nâng cấp VIP sản phẩm</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-vip-crown-2-fill text-yellow-500 text-4xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Tin VIP - Hiển thị nổi bật hơn</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Sản phẩm VIP được ưu tiên hiển thị đầu trang, có nhãn VIP nổi bật, thu hút nhiều người mua hơn</p>
        </div>

        {/* Lợi ích */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: 'ri-arrow-up-circle-line', title: 'Hiển thị đầu trang', desc: 'Luôn xuất hiện trên đầu danh sách tìm kiếm', color: 'text-green-600 bg-green-100' },
            { icon: 'ri-medal-line', title: 'Nhãn VIP nổi bật', desc: 'Badge vàng đặc biệt thu hút sự chú ý', color: 'text-yellow-600 bg-yellow-100' },
            { icon: 'ri-eye-line', title: 'Nhiều lượt xem hơn', desc: 'Tăng 3-5x lượt xem so với tin thường', color: 'text-blue-600 bg-blue-100' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm text-center">
              <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <i className={`${item.icon} text-xl`}></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chọn gói */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Chọn gói VIP</h3>
            <div className="space-y-3">
              {VIP_PLANS.map(p => (
                <button key={p.days} onClick={() => setSelectedPlan(p.days)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedPlan === p.days ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white hover:border-yellow-300'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === p.days ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'}`}>
                        {selectedPlan === p.days && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">{p.label}</span>
                        {p.popular && <span className="ml-2 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded">Phổ biến</span>}
                        <p className="text-xs text-gray-500">{p.desc}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">{p.price.toLocaleString()}đ</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Thanh toán */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Xác nhận</h3>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              {/* Sản phẩm được chọn */}
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : product ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {product.images?.[0] ? (
                      <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="ri-image-line text-gray-400"></i>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{product.title}</p>
                    <p className="text-xs text-gray-500">{Number(product.price).toLocaleString()}đ/{product.unit}</p>
                    {product.isVip && product.vipExpiresAt && (
                      <p className="text-xs text-yellow-600">VIP đến: {new Date(product.vipExpiresAt).toLocaleDateString('vi-VN')}</p>
                    )}
                  </div>
                </div>
              ) : !productId ? (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg mb-4 text-sm text-orange-700">
                  <i className="ri-information-line mr-1"></i>
                  Chưa chọn sản phẩm. Vào <Link href="/dashboard" className="underline">Dashboard</Link> → Sản phẩm → Nâng VIP
                </div>
              ) : null}

              {/* Tóm tắt */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Gói VIP</span>
                  <span className="font-medium">{plan.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Giá</span>
                  <span className="font-bold text-yellow-600">{plan.price.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="font-bold text-lg">{plan.price.toLocaleString()}đ</span>
                </div>
              </div>

              {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

              {success ? (
                <div className="text-center py-4">
                  <i className="ri-checkbox-circle-fill text-green-500 text-4xl block mb-2"></i>
                  <p className="font-semibold text-green-700">Nâng cấp VIP thành công!</p>
                  <p className="text-sm text-gray-500 mt-1">Đang chuyển về trang quản lý...</p>
                </div>
              ) : (
                <button onClick={handlePay} disabled={creating || !productId}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-3 rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-500 disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2">
                  {creating ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang tạo...</>
                  ) : (
                    <><i className="ri-bank-card-line"></i> Tiến hành thanh toán</>
                  )}
                </button>
              )}

              <p className="text-xs text-gray-400 text-center mt-3">
                Thanh toán qua PayOS - tự động xác nhận sau khi nhận tiền
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showModal && paymentData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-6 py-4 text-white text-center">
              <p className="text-sm font-medium opacity-90">Thanh toán VIP</p>
              <p className="text-2xl font-bold mt-1">{paymentData.amount.toLocaleString()}đ</p>
            </div>

            <div className="px-6 py-5">
              {/* QR Code */}
              <div className="flex justify-center mb-4">
                <div className="w-52 h-52 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
                  {paymentData.qrCode ? (
                    <img src={paymentData.qrCode} alt="QR thanh toán" className="w-full h-full object-contain" />
                  ) : (
                    <i className="ri-qr-code-line text-5xl text-gray-400"></i>
                  )}
                </div>
              </div>

              {/* Countdown */}
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500 mb-1">Mã QR hết hạn sau</p>
                <p className={`text-2xl font-bold tabular-nums ${countdown <= 60 ? 'text-red-500' : 'text-gray-800'}`}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-5">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                Đang chờ thanh toán... tự động xác nhận khi nhận tiền
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <a
                  href={paymentData.checkoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-blue-600 text-white text-sm py-2.5 rounded-xl font-semibold text-center hover:bg-blue-700 transition flex items-center justify-center gap-1.5"
                >
                  <i className="ri-external-link-line"></i>
                  Mở trang thanh toán
                </a>
                <button
                  onClick={handleCancelModal}
                  className="flex-1 border border-gray-300 text-gray-700 text-sm py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
