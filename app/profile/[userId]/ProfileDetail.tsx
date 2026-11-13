'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { users, messages as messagesApi, auth } from '../../../lib/api';
import ListingCard from '../../components/ListingCard';

function timeJoined(dateStr: string): string {
  const months = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24 * 30));
  if (months < 1) return 'mới tham gia';
  if (months < 12) return `${months} tháng`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years} năm ${rem} tháng` : `${years} năm`;
}

export default function ProfileDetail({ userId }: { userId: string }) {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.allSettled([users.getProfile(userId), users.getUserProducts(userId)]).then(([profileRes, productsRes]) => {
      if (profileRes.status === 'fulfilled') setProfile(profileRes.value);
      if (productsRes.status === 'fulfilled') setProducts(productsRes.value?.data || []);
    }).finally(() => setLoading(false));
  }, [userId]);

  async function handleMessage() {
    if (!auth.isLoggedIn()) { router.push('/profile'); return; }
    try {
      const conv = await messagesApi.getOrCreate(userId) as any;
      router.push(`/messages/${conv.id}`);
    } catch { alert('Không mở được cuộc trò chuyện'); }
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: profile?.fullName || 'Trang cá nhân', url }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
    }
  }

  if (loading) {
    return <div className="grid min-h-[60vh] place-items-center"><div className="h-9 w-9 animate-spin rounded-full border-[3px] border-forest-600 border-t-transparent" /></div>;
  }

  if (!profile) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4 text-center">
        <div>
          <p className="mb-4 text-ink-soft">Không tìm thấy người dùng</p>
          <Link href="/" className="btn-forest">Về trang chủ</Link>
        </div>
      </div>
    );
  }

  const name = profile.fullName || profile.username;
  const joined = profile.createdAt ? timeJoined(profile.createdAt) : null;

  return (
    <div className="min-h-screen bg-paper pb-10">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto max-w-content px-4 py-6 sm:px-6">
          <div className="flex items-start gap-4">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="h-20 w-20 shrink-0 rounded-full object-cover sm:h-24 sm:w-24" />
            ) : (
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-forest-600 text-3xl font-bold text-white sm:h-24 sm:w-24">
                {(name || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="break-words text-[1.5rem] font-bold leading-tight text-ink sm:text-3xl">{name}</h1>
              {profile.username && profile.fullName && <p className="text-sm text-ink-faint">@{profile.username}</p>}
              {(profile.isVerified || profile.isEmailVerified) && (
                <p className="mt-1.5 flex flex-wrap gap-x-3 text-[13px] font-semibold text-forest-700">
                  {profile.isVerified && <span><i className="ri-shield-check-line" aria-hidden="true" /> Đã xác thực</span>}
                  {profile.isEmailVerified && <span><i className="ri-mail-check-line" aria-hidden="true" /> Đã xác thực email</span>}
                </p>
              )}
              <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-soft">
                {profile.address && <span><i className="ri-map-pin-line" aria-hidden="true" /> {profile.address}</span>}
                {joined && <span>Tham gia {joined}</span>}
                <span>{products.length} tin đăng</span>
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={handleMessage} className="btn-forest"><i className="ri-message-3-line" aria-hidden="true" /> Nhắn tin</button>
                <button onClick={handleShare} className="btn-ghost">{copied ? 'Đã sao chép liên kết' : 'Chia sẻ trang này'}</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-content px-4 pt-5 sm:px-6" aria-labelledby="tin">
        <h2 id="tin" className="mb-3 text-xl font-bold text-ink">Tin đăng <span className="font-medium text-ink-faint">({products.length})</span></h2>
        {products.length === 0 ? (
          <p className="card px-6 py-12 text-center text-ink-soft">Người này chưa có tin đăng nào.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {products.map((p: any) => <ListingCard key={p.id} item={p} type="product" />)}
          </div>
        )}
      </section>
    </div>
  );
}
