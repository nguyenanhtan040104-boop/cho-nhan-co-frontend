'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { wallet as walletApi } from '../../lib/api';

const PACKAGES: Record<string, { name: string; price: number; duration: string; description: string }> = {
  vip:             { name: 'Tin VIP',                price: 50000,  duration: '30 ngày',  description: 'Ưu tiên hiển thị trên đầu, khung viền vàng nổi bật' },
  premium:         { name: 'Tin Premium',            price: 100000, duration: '45 ngày',  description: 'Hiển thị nổi bật nhất, ghim 7 ngày đầu, hỗ trợ 24/7' },
  basic_member:    { name: 'Thành viên Cơ bản',      price: 99000,  duration: '1 tháng',  description: 'Đăng 20 tin/tháng, giảm 20% phí VIP, duyệt ưu tiên' },
  pro_member:      { name: 'Thành viên Pro',         price: 199000, duration: '1 tháng',  description: 'Đăng không giới hạn, giảm 40% VIP, thống kê chi tiết' },
  business_member: { name: 'Thành viên Doanh nghiệp', price: 399000, duration: '1 tháng', description: 'Tất cả Pro, trang cửa hàng riêng, quản lý đa tài khoản' },
  ad_featured:     { name: 'Quảng cáo Nổi bật',      price: 50000,  duration: '14 ngày',  description: 'Vị trí ưu tiên, nhãn Nổi bật, ghim 3 ngày đầu' },
  ad_vip:          { name: 'Quảng cáo VIP',          price: 100000, duration: '30 ngày',  description: 'Vị trí đầu tiên, không giới hạn ảnh, ghim toàn thời gian' },
};

const BANK_ACCOUNTS = [
  { bank: 'Agribank', number: '5300205746694', owner: 'NGUYEN ANH TAN' },
  { bank: 'MB Bank', number: '0888317289', owner: 'NGUYEN ANH TAN' },
];

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

function CopyButton({ text, label }: { text: string; label: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" onClick={() => { navigator.clipboard.writeText(text).then(() => { setOk(true); setTimeout(() => setOk(false), 1500); }).catch(() => {}); }}
      className="shrink-0 rounded-lg border border-line px-2.5 py-1 text-[13px] font-semibold text-forest-700 hover:border-forest-500" aria-label={`Sao chép ${label}`}>
      {ok ? 'Đã chép' : 'Sao chép'}
    </button>
  );
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get('package') || '';
  const pkg = PACKAGES[packageId];

  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [transferNote, setTransferNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    let u: any = null;
    try { u = JSON.parse(localStorage.getItem('user') || 'null'); } catch {}
    setUser(u);
    if (pkg) setTransferNote(`NAP ${u?.fullName || 'USER'} ${pkg.name}`);
    walletApi.get().then((r: any) => setBalance(Number(r.balance))).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="grid min-h-[60vh] place-items-center px-4 text-center">
        <div>
          <h1 className="text-xl font-bold text-ink">Không tìm thấy gói dịch vụ</h1>
          <p className="mb-5 mt-1 text-ink-soft">Hãy chọn gói từ trang bảng giá.</p>
          <Link href="/pricing" className="btn-forest">Xem bảng giá</Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-paper px-4">
        <div className="card w-full max-w-md p-7">
          <h1 className="text-xl font-bold text-ink">Đã gửi yêu cầu</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
            Yêu cầu nạp <b className="text-ink">{fmt(pkg.price)}</b> đã được ghi nhận. Quản trị viên sẽ xác nhận và cộng số dư vào ví trong vòng 15 đến 30 phút. Bạn theo dõi kết quả ở trang Ví.
          </p>
          <dl className="mt-4 divide-y divide-line rounded-lg border border-line text-sm">
            <div className="flex justify-between px-3 py-2"><dt className="text-ink-soft">Gói</dt><dd className="font-semibold text-ink">{pkg.name}</dd></div>
            <div className="flex justify-between px-3 py-2"><dt className="text-ink-soft">Số tiền</dt><dd className="font-semibold tabular-nums text-ink">{fmt(pkg.price)}</dd></div>
            <div className="flex justify-between px-3 py-2"><dt className="text-ink-soft">Thời hạn</dt><dd className="font-semibold text-ink">{pkg.duration}</dd></div>
          </dl>
          <div className="mt-5 flex flex-col gap-2">
            <Link href="/wallet" className="btn-forest">Xem ví của tôi</Link>
            <Link href="/pricing" className="btn-ghost">Về bảng giá</Link>
          </div>
        </div>
      </div>
    );
  }

  const enough = balance >= pkg.price;

  return (
    <div className="min-h-screen bg-paper pb-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="flex items-center gap-3 py-4">
          <Link href="/pricing" aria-label="Quay lại bảng giá" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line bg-surface hover:border-forest-500"><i className="ri-arrow-left-line text-lg" /></Link>
          <h1 className="text-xl font-bold text-ink sm:text-2xl">Thanh toán</h1>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <div className="space-y-5 lg:order-1">
            {enough && (
              <p className="rounded-card border border-forest-200 bg-forest-50 p-4 text-sm text-forest-900">
                <b>Số dư ví của bạn đã đủ ({fmt(balance)}).</b> Bạn có thể mua VIP trực tiếp từ ví mà không cần chuyển khoản.{' '}
                <Link href="/wallet" className="font-semibold underline">Mở ví</Link>
              </p>
            )}

            <section className="card p-4 sm:p-6">
              <h2 className="text-lg font-bold text-ink">1. Chuyển khoản</h2>
              <p className="mt-1 text-sm text-ink-soft">Chuyển đúng số tiền vào một trong hai tài khoản dưới đây.</p>

              <ul className="mt-4 divide-y divide-line rounded-lg border border-line">
                {BANK_ACCOUNTS.map(acc => (
                  <li key={acc.bank} className="flex items-center justify-between gap-3 px-3 py-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-ink-soft">{acc.bank}</p>
                      <p className="text-lg font-bold tabular-nums text-ink">{acc.number}</p>
                      <p className="text-[12px] text-ink-faint">{acc.owner}</p>
                    </div>
                    <CopyButton text={acc.number} label={`số tài khoản ${acc.bank}`} />
                  </li>
                ))}
              </ul>

              <div className="mt-4 rounded-lg border border-gold-200 bg-gold-50 p-3 text-sm text-gold-900">
                <p className="font-semibold">Ghi đúng nội dung chuyển khoản</p>
                <div className="mt-1.5 flex items-center justify-between gap-3">
                  <p className="min-w-0 break-words font-bold">{transferNote}</p>
                  <CopyButton text={transferNote} label="nội dung chuyển khoản" />
                </div>
                <p className="mt-2 text-[13px]">Số tiền: <b>{fmt(pkg.price)}</b>. Số dư được cộng sau khi quản trị viên duyệt.</p>
              </div>
            </section>

            <form onSubmit={handleSubmit} className="card p-4 sm:p-6">
              <h2 className="text-lg font-bold text-ink">2. Xác nhận đã chuyển</h2>
              <label className="mt-3 block">
                <span className="mb-1.5 block text-sm font-semibold text-ink">Nội dung chuyển khoản bạn đã dùng</span>
                <input type="text" value={transferNote} onChange={e => setTransferNote(e.target.value)} className="field" />
              </label>
              {user && <p className="mt-3 text-sm text-ink-soft">Tài khoản: <b className="text-ink">{user.fullName}</b> · {user.email || user.phone}</p>}
              {err && <p role="alert" className="mt-3 text-sm text-brand-600">{err}</p>}
              <button type="submit" disabled={submitting} className="btn-primary mt-4 w-full py-3 disabled:opacity-50">
                {submitting ? <><i className="ri-loader-4-line animate-spin" aria-hidden="true" /> Đang gửi...</> : 'Tôi đã chuyển khoản, gửi yêu cầu'}
              </button>
            </form>
          </div>

          <aside className="card p-4 sm:p-5 lg:sticky lg:top-36 lg:order-2">
            <h2 className="text-[15px] font-bold text-ink">Đơn hàng</h2>
            <p className="mt-2 font-semibold text-ink">{pkg.name}</p>
            <p className="mt-0.5 text-[13px] leading-snug text-ink-soft">{pkg.description}</p>
            <dl className="mt-4 divide-y divide-line border-t border-line text-sm">
              <div className="flex justify-between py-2"><dt className="text-ink-soft">Thời hạn</dt><dd className="text-ink">{pkg.duration}</dd></div>
              <div className="flex justify-between py-2"><dt className="text-ink-soft">Giá gói</dt><dd className="tabular-nums text-ink">{fmt(pkg.price)}</dd></div>
              <div className="flex justify-between py-2"><dt className="font-bold text-ink">Tổng</dt><dd className="text-lg font-bold tabular-nums text-forest-700">{fmt(pkg.price)}</dd></div>
            </dl>
            <p className={`mt-3 rounded-lg px-3 py-2 text-[13px] ${enough ? 'bg-forest-50 text-forest-800' : 'bg-paper text-ink-soft'}`}>
              Số dư ví: <b className="tabular-nums">{fmt(balance)}</b>{!enough && <> · cần thêm <b className="tabular-nums">{fmt(pkg.price - balance)}</b></>}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="grid min-h-[60vh] place-items-center text-ink-faint">Đang tải...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
