'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { wallet as walletApi, auth } from '../../lib/api';

const PACKAGES: Record<string, { name: string; price: number; duration: string; description: string; icon: string }> = {
  vip:              { name: 'Tin VIP',                  price: 50000,  duration: '30 ngày',  description: 'Ưu tiên hiển thị trên đầu, khung viền vàng nổi bật',      icon: 'ri-vip-crown-fill' },
  premium:          { name: 'Tin Premium',               price: 100000, duration: '45 ngày',  description: 'Hiển thị nổi bật nhất, ghim 7 ngày đầu, hỗ trợ 24/7',      icon: 'ri-award-fill' },
  basic_member:     { name: 'Thành viên Cơ bản',         price: 99000,  duration: '1 tháng', description: 'Đăng 20 tin/tháng, giảm 20% phí VIP, duyệt ưu tiên',        icon: 'ri-user-star-line' },
  pro_member:       { name: 'Thành viên Pro',             price: 199000, duration: '1 tháng', description: 'Đăng không giới hạn, giảm 40% VIP, thống kê chi tiết',       icon: 'ri-vip-diamond-line' },
  business_member:  { name: 'Thành viên Doanh nghiệp',   price: 399000, duration: '1 tháng', description: 'Tất cả Pro + trang cửa hàng riêng, quản lý đa tài khoản',    icon: 'ri-building-line' },
  ad_featured:      { name: 'Quảng cáo Nổi bật',         price: 50000,  duration: '14 ngày', description: 'Vị trí ưu tiên, nhãn Nổi bật, ghim 3 ngày đầu',             icon: 'ri-megaphone-fill' },
  ad_vip:           { name: 'Quảng cáo VIP',              price: 100000, duration: '30 ngày', description: 'Vị trí đầu tiên, không giới hạn ảnh, ghim toàn thời gian',   icon: 'ri-megaphone-fill' },
};

const BANK_ACCOUNTS = [
  { bank: 'Agribank', number: '5300205746694', owner: 'NGUYEN ANH TAN', color: 'green' },
  { bank: 'MB Bank',  number: '0888317289',    owner: 'NGUYEN ANH TAN', color: 'blue'  },
];

function copy(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const packageId = searchParams.get('package') || '';
  const pkg = PACKAGES[packageId];

  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [transferNote, setTransferNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(u);
    if (pkg) setTransferNote(`NAP ${u?.fullName || 'USER'} ${pkg.name}`);
    walletApi.get().then((r: any) => setBalance(Number(r.balance))).catch(() => {});
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pkg) return;
    setErr('');
    setSubmitting(true);
    try {
      await walletApi.requestTopUp(pkg.price, transferNote || `Nạp tiền cho gói ${pkg.name}`);
      setDone(true);
    } catch (e: any) {
      setErr(e.message || 'Gửi yêu cầu thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-error-warning-line text-5xl text-red-400 block mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy gói dịch vụ</h2>
          <p className="text-gray-500 mb-6">Vui lòng chọn gói từ trang bảng giá</p>
          <Link href="/pricing" className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition font-medium">
            Quay lại bảng giá
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <i className="ri-check-double-line text-green-600 text-4xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Gửi yêu cầu thành công!</h2>
          <p className="text-gray-600 mb-2">Yêu cầu nạp <strong className="text-green-600">{fmt(pkg.price)}</strong> đã được ghi nhận.</p>
          <p className="text-gray-500 text-sm mb-6">Admin sẽ xác nhận và cộng số dư vào ví trong vòng <strong>15-30 phút</strong>. Bạn có thể theo dõi trong trang Ví.</p>
          <div className="bg-green-50 rounded-xl p-4 mb-6 text-left text-sm text-green-800 space-y-1">
            <p>📦 Gói: <strong>{pkg.name}</strong></p>
            <p>💰 Số tiền: <strong>{fmt(pkg.price)}</strong></p>
            <p>⏱ Thời hạn: <strong>{pkg.duration}</strong></p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/wallet" className="bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition block">
              Xem ví của tôi
            </Link>
            <Link href="/pricing" className="border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition block">
              Quay lại bảng giá
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/pricing" className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
            <i className="ri-arrow-left-line"></i>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <i className="ri-store-2-line text-white text-sm"></i>
            </div>
            <span className="font-bold text-gray-900">Chợ Nhân Cơ</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 text-sm">Thanh toán</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-6">
              <h2 className="font-bold text-gray-900 mb-4">Đơn hàng</h2>

              <div className="flex items-start gap-3 mb-5">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className={`${pkg.icon} text-green-600 text-xl`}></i>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{pkg.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{pkg.description}</p>
                  <p className="text-xs text-gray-400 mt-1">⏱ {pkg.duration}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giá gói</span>
                  <span className="font-medium">{fmt(pkg.price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VAT (0%)</span>
                  <span className="text-gray-400">Miễn</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Tổng</span>
                  <span className="font-bold text-green-600 text-lg">{fmt(pkg.price)}</span>
                </div>
              </div>

              {/* Current balance */}
              <div className={`mt-4 p-3 rounded-xl text-sm ${balance >= pkg.price ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
                <p className={`font-medium ${balance >= pkg.price ? 'text-green-700' : 'text-orange-700'}`}>
                  Số dư ví: {fmt(balance)}
                </p>
                {balance >= pkg.price ? (
                  <p className="text-green-600 text-xs mt-1">✓ Đủ số dư — <Link href="/wallet" className="underline">dùng số dư ngay</Link></p>
                ) : (
                  <p className="text-orange-600 text-xs mt-1">Cần nạp thêm {fmt(pkg.price - balance)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="lg:col-span-2 space-y-5">

            {/* Use balance shortcut */}
            {balance >= pkg.price && (
              <div className="bg-green-50 border border-green-300 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <i className="ri-wallet-3-line text-green-600 text-2xl"></i>
                  <div>
                    <p className="font-semibold text-green-800">Bạn có đủ số dư trong ví!</p>
                    <p className="text-sm text-green-600">Số dư hiện tại: {fmt(balance)}</p>
                  </div>
                </div>
                <p className="text-sm text-green-700 mb-4">Bạn có thể dùng số dư ví để mua VIP trực tiếp trên trang tin đăng mà không cần nạp thêm.</p>
                <Link href="/products" className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-green-700 transition text-sm">
                  <i className="ri-arrow-right-line"></i> Đến trang sản phẩm để mua VIP
                </Link>
              </div>
            )}

            {/* Bank transfer info */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="font-bold text-gray-900 mb-1">Thông tin chuyển khoản</h2>
              <p className="text-sm text-gray-500 mb-5">Chuyển khoản đến 1 trong các tài khoản bên dưới, sau đó nhấn "Tôi đã chuyển khoản".</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                {BANK_ACCOUNTS.map(acc => (
                  <div key={acc.bank} className={`rounded-xl p-4 border-2 ${acc.color === 'green' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                    <p className={`font-bold mb-3 ${acc.color === 'green' ? 'text-green-800' : 'text-blue-800'}`}>{acc.bank}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Số TK:</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${acc.color === 'green' ? 'text-green-700' : 'text-blue-700'}`}>{acc.number}</span>
                          <button onClick={() => copy(acc.number)} title="Sao chép" className={`${acc.color === 'green' ? 'text-green-600 hover:text-green-700' : 'text-blue-600 hover:text-blue-700'}`}>
                            <i className="ri-file-copy-line text-xs"></i>
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Chủ TK:</span>
                        <span className="font-semibold text-gray-800">{acc.owner}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                <p className="font-semibold mb-1.5 flex items-center gap-1.5"><i className="ri-information-line"></i>Lưu ý quan trọng</p>
                <ul className="space-y-1 text-xs">
                  <li>• Chuyển đúng số tiền: <strong>{fmt(pkg.price)}</strong></li>
                  <li>• Nội dung CK: <strong className="cursor-pointer underline" onClick={() => copy(transferNote)}>{transferNote}</strong> <button onClick={() => copy(transferNote)} className="text-yellow-600"><i className="ri-file-copy-line"></i></button></li>
                  <li>• Admin xác nhận trong vòng 15-30 phút</li>
                  <li>• Sau khi được duyệt, số dư ví sẽ tự động cập nhật</li>
                </ul>
              </div>
            </div>

            {/* Confirmation form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="font-bold text-gray-900 mb-4">Xác nhận đã chuyển khoản</h2>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Nội dung chuyển khoản đã dùng</label>
                <input type="text" value={transferNote} onChange={e => setTransferNote(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500" />
              </div>

              {user && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm text-gray-700">
                  <p>👤 Tài khoản: <strong>{user.fullName}</strong></p>
                  <p className="mt-1">📧 {user.email || user.phone}</p>
                </div>
              )}

              {err && <p className="text-red-600 text-sm mb-4">{err}</p>}

              <button type="submit" disabled={submitting}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang gửi...</>
                ) : (
                  <><i className="ri-check-double-line"></i> Tôi đã chuyển khoản — Gửi yêu cầu</>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                Sau khi gửi, admin sẽ xác nhận và cộng <strong>{fmt(pkg.price)}</strong> vào ví của bạn
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
