'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { users, messages as messagesApi, auth } from '../../../lib/api';

export default function ProfileDetail({ userId }: { userId: string }) {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    Promise.allSettled([
      users.getProfile(userId),
      users.getUserProducts(userId),
    ]).then(([profileRes, productsRes]) => {
      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value);
      } else {
        console.error('Profile fetch failed:', profileRes.reason);
      }
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

  const joinDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Back */}
        <Link href="javascript:history.back()"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6 text-sm">
          <i className="ri-arrow-left-line"></i> Quay lại
        </Link>

        {/* Profile card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-4">
          <div className="flex items-start gap-3 md:gap-5">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-2xl flex-shrink-0">
                {profile.fullName?.[0] || profile.username?.[0] || 'U'}
              </div>
            )}

            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-lg md:text-xl font-bold text-gray-900 break-words">{profile.fullName || profile.username}</h1>
                {profile.isVerified && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                    <i className="ri-shield-check-line"></i> Đã xác thực
                  </span>
                )}
                {profile.isEmailVerified && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                    <i className="ri-mail-check-line"></i> Email xác thực
                  </span>
                )}
              </div>

              {profile.username && profile.fullName && (
                <p className="text-sm text-gray-400 mb-1">@{profile.username}</p>
              )}

              <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
                {profile.address && (
                  <span className="flex items-center gap-1">
                    <i className="ri-map-pin-line"></i> {profile.address}
                  </span>
                )}
                {joinDate && (
                  <span className="flex items-center gap-1">
                    <i className="ri-calendar-line"></i> Tham gia {joinDate}
                  </span>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                <button onClick={handleMessage}
                  className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                  <i className="ri-message-3-line"></i> Nhắn tin
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {[
              { id: 'info', label: 'Thông tin' },
              { id: 'posts', label: `Tin đăng (${products.length})` },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'info' && (
              <div className="space-y-4 text-sm text-gray-700">
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <i className="ri-phone-line text-gray-400 w-5"></i>
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.email && (
                  <div className="flex items-center gap-2">
                    <i className="ri-mail-line text-gray-400 w-5"></i>
                    <span>{profile.email}</span>
                  </div>
                )}
                {profile.address && (
                  <div className="flex items-center gap-2">
                    <i className="ri-map-pin-line text-gray-400 w-5"></i>
                    <span>{profile.address}</span>
                  </div>
                )}
                {!profile.phone && !profile.email && !profile.address && (
                  <p className="text-gray-400">Người dùng chưa cung cấp thông tin liên hệ</p>
                )}
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="space-y-3">
                {products.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">Chưa có tin đăng nào</p>
                ) : (
                  products.map((p: any) => (
                    <Link key={p.id} href={`/products/${p.id}`}
                      className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
                      {p.images?.[0]?.url ? (
                        <img src={p.images[0].url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="ri-image-line text-gray-400"></i>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{p.title}</p>
                        <p className="text-green-600 text-sm font-semibold">
                          {Number(p.price).toLocaleString('vi-VN')}đ/{p.unit}
                        </p>
                        <p className="text-xs text-gray-400">{p.location}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
