'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { realEstate, messages as messagesApi, auth } from '../../../lib/api';

function getCurrentUserId(): string | null {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.id || null;
  } catch {
    return null;
  }
}

function formatPrice(price: number) {
  if (price >= 1_000_000_000) return (price / 1_000_000_000).toFixed(2) + ' tỷ';
  if (price >= 1_000_000) return (price / 1_000_000).toFixed(0) + ' triệu';
  return price.toLocaleString() + 'đ';
}

const typeLabel: any = {
  NHA_O: 'Nhà ở', DAT_NEN: 'Đất nền', PHONG_TRO: 'Phòng trọ', MAT_BANG: 'Mặt bằng KD',
};

const statusLabel: any = {
  NEW: 'Mới đăng', TRADING: 'Đang giao dịch', COMPLETED: 'Đã hoàn tất', PAUSED: 'Tạm dừng',
};

export default function RealEstateDetail({ propertyId }: { propertyId: string }) {
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImg, setSelectedImg] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUserId(getCurrentUserId());
  }, []);

  useEffect(() => {
    realEstate.getOne(propertyId)
      .then(data => setItem(data))
      .catch(() => setError('Không tìm thấy tin bất động sản'))
      .finally(() => setLoading(false));
  }, [propertyId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error || !item) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <p className="text-gray-500">{error || 'Không tìm thấy'}</p>
      <Link href="/real-estate" className="text-green-600 underline">Quay lại</Link>
    </div>
  );

  const images = item.images || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/real-estate" className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 hover:bg-gray-50">
            <i className="ri-arrow-left-line"></i>
          </Link>
          <div className="text-sm text-gray-500 flex-1">
            <Link href="/real-estate" className="hover:text-green-600">Bất động sản</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{item.title}</span>
          </div>
          {currentUserId && item.user?.id === currentUserId && (
            <Link href={`/real-estate/${propertyId}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
              <i className="ri-edit-line"></i> Chỉnh sửa
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="relative h-80 bg-gray-100">
                {images[selectedImg] ? (
                  <img src={images[selectedImg].url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="ri-home-4-line text-6xl text-gray-300"></i>
                  </div>
                )}
                {item.isVip && (
                  <span className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">VIP</span>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((img: any, i: number) => (
                    <button key={i} onClick={() => setSelectedImg(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${selectedImg === i ? 'border-green-500' : 'border-transparent'}`}>
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">{typeLabel[item.type] || item.type}</span>
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">{statusLabel[item.status] || item.status}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h1>
              <p className="text-3xl font-bold text-green-600 mb-4">{formatPrice(Number(item.price))}</p>

              <div className="grid grid-cols-2 gap-4 py-4 border-y mb-4">
                <div>
                  <span className="text-xs text-gray-500 block">Diện tích</span>
                  <span className="font-semibold text-gray-900">{item.area} m²</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Giá/m²</span>
                  <span className="font-semibold text-gray-900">{formatPrice(Math.round(Number(item.price) / item.area))}/m²</span>
                </div>
                {item.legalStatus && (
                  <div>
                    <span className="text-xs text-gray-500 block">Pháp lý</span>
                    <span className="font-semibold text-gray-900">{item.legalStatus}</span>
                  </div>
                )}
                <div>
                  <span className="text-xs text-gray-500 block">Lượt xem</span>
                  <span className="font-semibold text-gray-900">{item.viewCount}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Địa chỉ</p>
                <p className="text-gray-800 flex items-start gap-1">
                  <i className="ri-map-pin-line text-green-600 mt-0.5"></i>
                  {item.address}
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-900 mb-2">Mô tả</p>
                <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>

            {/* Lịch sử giá */}
            {item.priceHistory && item.priceHistory.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <p className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="ri-line-chart-line text-green-600"></i>
                  Lịch sử thay đổi giá
                </p>
                <div className="relative">
                  <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-3">
                    {/* Giá hiện tại */}
                    <div className="flex items-start gap-4 pl-7 relative">
                      <div className="absolute left-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-600">{formatPrice(Number(item.price))}</p>
                        <p className="text-xs text-gray-400">Giá hiện tại</p>
                      </div>
                    </div>
                    {/* Lịch sử */}
                    {item.priceHistory.map((h: any, i: number) => (
                      <div key={i} className="flex items-start gap-4 pl-7 relative">
                        <div className="absolute left-0 w-4 h-4 rounded-full bg-gray-300 border-2 border-white shadow-sm"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">{formatPrice(Number(h.price))}</p>
                          <p className="text-xs text-gray-400">{new Date(h.changedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right - Seller */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-sm sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Thông tin người đăng</h3>
              <div className="flex items-center gap-3 mb-4">
                {item.user?.avatarUrl ? (
                  <img src={item.user.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">
                    {item.user?.fullName?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{item.user?.fullName}</p>
                  <p className="text-sm text-gray-500">@{item.user?.username}</p>
                </div>
              </div>

              {item.user?.phone && (
                <a href={`tel:${item.user.phone}`}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors mb-2">
                  <i className="ri-phone-line"></i>
                  {item.user.phone}
                </a>
              )}

              <button
                onClick={async () => {
                  if (!auth.isLoggedIn()) { window.location.href = '/profile'; return; }
                  try {
                    const conv = await messagesApi.getOrCreate(item.user?.id) as any;
                    window.location.href = `/messages/${conv.id}`;
                  } catch { alert('Không thể mở chat'); }
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors mb-2">
                <i className="ri-message-3-line"></i>
                Nhắn tin
              </button>

              <Link href={`/profile/${item.user?.id}`}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                Xem trang người đăng
              </Link>

              <p className="text-xs text-gray-400 mt-3 text-center">
                Đăng ngày {new Date(item.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
