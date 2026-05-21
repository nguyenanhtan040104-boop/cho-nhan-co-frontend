'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { users, messages as messagesApi, auth } from '../../../lib/api';

function timeJoined(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  if (months < 1) return 'Moi tham gia';
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
  const [activeTab, setActiveTab] = useState<'active'|'info'>('active');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      users.getProfile(userId),
      users.getUserProducts(userId),
    ]).then(([profileRes, productsRes]) => {
      if (profileRes.status === 'fulfilled') setProfile(profileRes.value);
      if (productsRes.status === 'fulfilled') setProducts(productsRes.value?.data || []);
    }).finally(() => setLoading(false));
  }, [userId]);

  async function handleMessage() {
    if (!auth.isLoggedIn()) { router.push('/profile'); return; }
    try {
      const conv = await messagesApi.getOrCreate(userId) as any;
      router.push(`/messages/${conv.id}`);
    } catch { alert('Không thể mở chat'); }
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: profile?.fullName || 'Trang cá nhân', url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-3">
      <p className="text-gray-500">Không tìm thấy người dùng</p>
      <Link href="/" className="text-green-600 underline">Về trang chủ</Link>
    </div>
  );

  const joinedStr = profile.createdAt ? timeJoined(profile.createdAt) : null;
  const activeProducts = products.filter((p: any) => p.status !== 'SOLD' && p.status !== 'INACTIVE');
  const soldProducts = products.filter((p: any) => p.status === 'SOLD');

  const fmt = (n: number) => Number(n).toLocaleString('vi-VN');
  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Vua dang';
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    return `${Math.floor(h / 24)} ngày trước`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ── Back button ── */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
          <i className="ri-arrow-left-line text-lg text-gray-600"></i>
        </button>
        <span className="text-sm font-semibold text-gray-700 truncate">{profile.fullName || profile.username}</span>
      </div>

      {/* ── Banner ── */}
      <div className="relative">
        <div className="h-36 md:h-48 w-full overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #134e2a 0%, #1a6b3a 40%, #2d9e5f 75%, #52c78b 100%)' }}>
          {/* Decorative shapes */}
          <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice">
            <circle cx="50" cy="50" r="80" fill="white" />
            <circle cx="750" cy="160" r="100" fill="white" />
            <ellipse cx="400" cy="-20" rx="200" ry="80" fill="white" />
            <circle cx="200" cy="180" r="50" fill="white" />
            <circle cx="600" cy="30" r="60" fill="white" />
          </svg>
          {/* Leaf motif */}
          <svg className="absolute right-6 top-4 opacity-20" width="120" height="100" viewBox="0 0 120 100">
            <path d="M60 10 Q100 10 100 50 Q100 90 60 90 Q20 90 20 50 Q20 10 60 10Z" fill="white"/>
            <path d="M60 15 Q90 15 90 50 Q90 85 60 85 Q30 85 30 50 Q30 15 60 15Z" fill="none" stroke="white" strokeWidth="2"/>
            <line x1="60" y1="15" x2="60" y2="85" stroke="white" strokeWidth="1.5"/>
            <line x1="35" y1="40" x2="60" y2="50" stroke="white" strokeWidth="1"/>
            <line x1="35" y1="60" x2="60" y2="60" stroke="white" strokeWidth="1"/>
            <line x1="85" y1="40" x2="60" y2="50" stroke="white" strokeWidth="1"/>
            <line x1="85" y1="60" x2="60" y2="60" stroke="white" strokeWidth="1"/>
          </svg>
          <svg className="absolute left-8 bottom-2 opacity-15" width="80" height="70" viewBox="0 0 80 70">
            <path d="M40 5 Q70 5 70 35 Q70 65 40 65 Q10 65 10 35 Q10 5 40 5Z" fill="white"/>
            <line x1="40" y1="5" x2="40" y2="65" stroke="white" strokeWidth="1.5"/>
            <line x1="18" y1="30" x2="40" y2="38" stroke="white" strokeWidth="1"/>
            <line x1="62" y1="30" x2="40" y2="38" stroke="white" strokeWidth="1"/>
          </svg>
        </div>

        {/* Avatar overlapping banner */}
        <div className="absolute left-4 md:left-8 bottom-0 translate-y-1/2">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt=""
              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white shadow-lg" />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-green-600 border-4 border-white shadow-lg flex items-center justify-center">
              <span className="text-white font-bold text-3xl">
                {(profile.fullName || profile.username || 'U')[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Profile Info Card ── */}
      <div className="bg-white shadow-sm pt-12 md:pt-14 pb-5 px-4 md:px-8 mb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Left: name + badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                {profile.fullName || profile.username}
              </h1>
              {profile.isVerified && (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 flex-shrink-0">
                  <i className="ri-shield-check-fill text-xs"></i> Xác thực
                </span>
              )}
              {profile.isEmailVerified && (
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 flex-shrink-0">
                  <i className="ri-mail-check-line text-xs"></i> Email
                </span>
              )}
            </div>
            {profile.username && profile.fullName && (
              <p className="text-sm text-gray-400 mb-2">@{profile.username}</p>
            )}

            {/* Stats row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-500 mb-4">
              {profile.address && (
                <span className="flex items-center gap-1">
                  <i className="ri-map-pin-2-line text-green-500"></i>
                  {profile.address}
                </span>
              )}
              {joinedStr && (
                <span className="flex items-center gap-1">
                  <i className="ri-calendar-check-line text-green-500"></i>
                  Đã tham gia: {joinedStr}
                </span>
              )}
              <span className="flex items-center gap-1">
                <i className="ri-file-list-3-line text-green-500"></i>
                {products.length} tin đăng
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <button onClick={handleMessage}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition shadow-sm">
                <i className="ri-message-3-fill"></i> Nhắn tin
              </button>
              <button onClick={handleShare}
                className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition">
                <i className="ri-share-forward-line"></i>
                {copied ? 'Đã sao chép!' : 'Chia sẻ'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Listings section ── */}
      <div className="bg-white shadow-sm">
        {/* Tab bar */}
        <div className="flex border-b border-gray-100 px-4">
          <button onClick={() => setActiveTab('active')}
            className={`py-3.5 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'active' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            Tin đăng ({activeProducts.length || products.length})
          </button>
          <button onClick={() => setActiveTab('info')}
            className={`py-3.5 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'info' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            Thông tin
          </button>
        </div>

        {/* Tab: Tin dang */}
        {activeTab === 'active' && (
          <div className="p-4">
            {products.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <i className="ri-store-line text-5xl block mb-3 text-gray-300"></i>
                <p className="font-medium text-gray-500">Chưa có tin đăng nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {products.map((p: any) => {
                  const img = p.images?.[0]?.url || null;
                  return (
                    <Link key={p.id} href={`/products/${p.id}`}
                      className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-green-200 transition-all">
                      <div className="relative aspect-square bg-gray-100 overflow-hidden">
                        {img ? (
                          <img src={img} alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <i className="ri-image-line text-3xl text-gray-300"></i>
                          </div>
                        )}
                        {p.isVip && (
                          <span className="absolute top-1.5 left-1.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded">VIP</span>
                        )}
                        <span className="absolute bottom-1.5 left-1.5 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                          {timeAgo(p.createdAt)}
                        </span>
                        {p.images?.length > 1 && (
                          <span className="absolute bottom-1.5 right-1.5 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <i className="ri-image-2-line text-[9px]"></i> {p.images.length}
                          </span>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-gray-800 font-medium line-clamp-2 leading-snug mb-1">{p.title}</p>
                        <p className="text-sm font-bold text-red-500">{fmt(p.price)}đ</p>
                        {p.location && (
                          <p className="text-[10px] text-gray-400 mt-0.5 truncate flex items-center gap-0.5">
                            <i className="ri-map-pin-line"></i> {p.location}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Thông tin */}
        {activeTab === 'info' && (
          <div className="p-5 space-y-3 text-sm text-gray-700">
            {profile.email && (
              <div className="flex items-center gap-3 py-2 border-b border-gray-50">
                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-mail-line text-blue-500"></i>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
              </div>
            )}
            {profile.address && (
              <div className="flex items-center gap-3 py-2 border-b border-gray-50">
                <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-map-pin-line text-green-500"></i>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Địa chỉ</p>
                  <p className="font-medium">{profile.address}</p>
                </div>
              </div>
            )}
            {joinedStr && (
              <div className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-calendar-line text-orange-500"></i>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Tham gia</p>
                  <p className="font-medium">{joinedStr}</p>
                </div>
              </div>
            )}
            {!profile.email && !profile.address && (
              <p className="text-gray-400 text-center py-8">Người dùng chưa cập nhật thông tin</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}