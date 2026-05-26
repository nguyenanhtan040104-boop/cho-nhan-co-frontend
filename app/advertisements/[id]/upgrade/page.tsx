'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { advertisements, wallet, auth } from '../../../../lib/api';

// Pricing for advertisement VIP — must match backend buyAdVip pricing
const AD_PLANS = [
  {
    id: 7 as const,
    name: 'Gói 7 ngày',
    price: 50000,
    badge: null,
    benefits: [
      'Đẩy lên đầu danh sách Quảng cáo',
      'Hiển thị trên banner chạy dưới',
      'Xuất hiện trong popup khi khách mở trang',
      'Nhãn VIP nổi bật',
    ],
  },
  {
    id: 30 as const,
    name: 'Gói 30 ngày',
    price: 149000,
    badge: 'Tiết kiệm 30%',
    benefits: [
      'Đẩy lên đầu danh sách Quảng cáo',
      'Hiển thị trên banner chạy dưới',
      'Xuất hiện trong popup khi khách mở trang',
      'Nhãn VIP nổi bật',
      'Ưu tiên hiển thị cao nhất',
    ],
  },
];

function fmtMoney(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

export default function AdvertisementUpgradePage() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const adId = params.id;

  const [ad, setAd] = useState<any>(null);
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<7 | 30 | null>(null);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      router.replace('/profile');
      return;
    }
    Promise.all([
      advertisements.getOne(adId).catch(() => null),
      wallet.get().catch(() => null),
    ]).then(([adRes, walletRes]) => {
      setAd(adRes);
      setWalletData(walletRes);
      setLoading(false);
    });
  }, [adId, router]);

  async function handleBuy(durationDays: 7 | 30) {
    const plan = AD_PLANS.find(p => p.id === durationDays)!;
    const balance = Number(walletData?.balance || 0);
    if (balance < plan.price) {
      const confirmTopUp = confirm(
        `Số dư hiện tại: ${fmtMoney(balance)}\nGiá gói: ${fmtMoney(plan.price)}\n\nBạn cần nạp thêm tiền. Đi tới trang nạp tiền?`,
      );
      if (confirmTopUp) router.push('/wallet');
      return;
    }
    if (!confirm(`Mua ${plan.name} cho quảng cáo này với giá ${fmtMoney(plan.price)}?`)) return;

    setPurchasing(durationDays);
    setResultMsg(null);
    try {
      const res = await advertisements.buyVip(adId, durationDays);
      setResultMsg(res.message);
      // Refresh wallet + ad
      const [adRes, walletRes] = await Promise.all([
        advertisements.getOne(adId).catch(() => null),
        wallet.get().catch(() => null),
      ]);
      setAd(adRes);
      setWalletData(walletRes);
    } catch (e: any) {
      alert(e?.message || 'Mua VIP thất bại');
    } finally {
      setPurchasing(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-3">
        <p className="text-gray-500">Không tìm thấy quảng cáo</p>
        <Link href="/advertisements" className="text-orange-600 underline">Quay lại</Link>
      </div>
    );
  }

  const currentUserId = auth.getCurrentUserId();
  const isOwner = ad.userId === currentUserId || ad.user?.id === currentUserId;
  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-3">
        <p className="text-gray-500">Bạn không phải chủ của quảng cáo này</p>
        <Link href={`/advertisements/${adId}`} className="text-orange-600 underline">Quay lại</Link>
      </div>
    );
  }

  const balance = Number(walletData?.balance || 0);
  const vipActive = ad.isVip && ad.vipExpiresAt && new Date(ad.vipExpiresAt) > new Date();

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#f7f7f3' }}>

      {/* ─── Top bar ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href={`/advertisements/${adId}`} className="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50">
            <i className="ri-arrow-left-line"></i>
          </Link>
          <div className="text-sm text-gray-500 flex-1 min-w-0">
            <Link href="/advertisements" className="hover:text-orange-600">Quảng cáo</Link>
            <span className="mx-1.5 text-gray-300">/</span>
            <Link href={`/advertisements/${adId}`} className="hover:text-orange-600 truncate">{ad.title}</Link>
            <span className="mx-1.5 text-gray-300">/</span>
            <span className="text-gray-900">Nâng VIP</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ─── Header ───────────────────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-[10px] font-bold tracking-widest text-orange-700 uppercase mb-2">
            <span className="inline-block w-6 h-px bg-orange-700 align-middle mr-2"></span>
            Thanh toán quảng cáo
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2" style={{ letterSpacing: '-0.5px' }}>
            Đẩy quảng cáo lên VIP
          </h1>
          <p className="text-gray-500 text-sm">
            Thanh toán bằng số dư ví — quảng cáo sẽ xuất hiện trên banner chạy ở mọi trang và popup khi khách mở site.
          </p>
        </div>

        {/* ─── Ad summary ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5 flex items-center gap-4">
          {ad.images?.[0] ? (
            <img src={ad.images[0]} alt={ad.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <i className="ri-megaphone-line text-orange-500 text-2xl"></i>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-black text-gray-900 truncate">{ad.title}</p>
            {ad.businessName && <p className="text-xs text-gray-500 truncate">{ad.businessName}</p>}
            {vipActive ? (
              <p className="text-xs text-emerald-600 mt-1 font-semibold">
                <i className="ri-vip-crown-fill mr-1"></i>
                VIP đến {new Date(ad.vipExpiresAt).toLocaleDateString('vi-VN')}
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">Chưa có VIP</p>
            )}
          </div>
        </div>

        {/* ─── Wallet balance ───────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl px-5 py-4 mb-6 flex items-center justify-between text-white">
          <div>
            <p className="text-[11px] font-bold tracking-widest uppercase opacity-80">Số dư ví</p>
            <p className="text-2xl font-black">{fmtMoney(balance)}</p>
          </div>
          <Link
            href="/wallet"
            className="bg-white/15 hover:bg-white/25 backdrop-blur border border-white/20 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          >
            <i className="ri-add-line mr-1"></i>Nạp thêm
          </Link>
        </div>

        {/* ─── Result message ───────────────────────────────────────── */}
        {resultMsg && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 mb-5 flex items-start gap-3">
            <i className="ri-checkbox-circle-fill text-emerald-600 text-xl flex-shrink-0"></i>
            <div className="flex-1">
              <p className="font-bold text-emerald-800 text-sm">Thanh toán thành công</p>
              <p className="text-xs text-emerald-700 mt-0.5">{resultMsg}</p>
            </div>
            <Link href={`/advertisements/${adId}`} className="text-xs font-semibold text-emerald-700 underline whitespace-nowrap">
              Xem ad
            </Link>
          </div>
        )}

        {/* ─── Plan cards ───────────────────────────────────────────── */}
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">Chọn gói VIP</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {AD_PLANS.map(plan => {
            const enough = balance >= plan.price;
            const isBusy = purchasing === plan.id;
            const highlight = plan.id === 30;
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl overflow-hidden flex flex-col ${
                  highlight ? 'ring-2 ring-orange-500 shadow-lg' : 'border border-gray-200'
                }`}
              >
                {plan.badge ? (
                  <div className={`text-center py-2 text-xs font-bold ${
                    highlight ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' : 'bg-gray-900 text-white'
                  }`}>
                    {plan.badge}
                  </div>
                ) : (
                  <div className="py-2" />
                )}
                <div className="px-5 pt-3 pb-5 flex flex-col flex-1">
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">{plan.name}</p>
                  <div className="mb-5">
                    <span className={`text-3xl font-black ${highlight ? 'text-orange-600' : 'text-gray-900'}`}>
                      {fmtMoney(plan.price)}
                    </span>
                    <span className="text-sm text-gray-400 ml-1">/ {plan.id} ngày</span>
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <i className={`ri-check-line mt-0.5 flex-shrink-0 ${highlight ? 'text-orange-500' : 'text-gray-700'}`}></i>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    disabled={isBusy || purchasing !== null}
                    onClick={() => handleBuy(plan.id)}
                    className={`block w-full text-center py-2.5 rounded-xl text-sm transition-all font-bold ${
                      !enough
                        ? 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        : highlight
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-95'
                          : 'bg-gray-900 text-white hover:bg-gray-700'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {isBusy
                      ? 'Đang xử lý...'
                      : !enough
                        ? 'Số dư không đủ — Nạp thêm'
                        : `Thanh toán ${fmtMoney(plan.price)}`}
                  </button>
                  {!enough && (
                    <p className="text-[11px] text-red-500 mt-2 text-center">
                      Thiếu {fmtMoney(plan.price - balance)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Info ─────────────────────────────────────────────────── */}
        <div className="mt-6 text-xs text-gray-400 text-center">
          <p>Tiền sẽ được trừ trực tiếp từ ví. Nếu quảng cáo đang VIP, thời gian sẽ được cộng dồn.</p>
          <p className="mt-1">Bạn có thắc mắc? <Link href="/wallet" className="text-orange-600 underline">Xem lịch sử ví</Link></p>
        </div>
      </div>
    </div>
  );
}
