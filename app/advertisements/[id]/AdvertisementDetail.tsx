'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { advertisements, messages as messagesApi, auth } from '../../../lib/api';

const CATEGORIES: any = {
  KHAI_TRUONG: 'Khai trương', KHUYEN_MAI: 'Khuyến mãi',
  SAN_PHAM_MOI: 'Sản phẩm mới', DICH_VU: 'Dịch vụ',
  SU_KIEN: 'Sự kiện', KHAC: 'Khác',
};

export default function AdvertisementDetail({ adId }: { adId: string }) {
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImg, setSelectedImg] = useState(0);

  useEffect(() => {
    advertisements.getOne(adId)
      .then(data => setAd(data))
      .catch(() => setError('Không tìm thấy quảng cáo'))
      .finally(() => setLoading(false));
  }, [adId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error || !ad) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <p className="text-gray-500">{error || 'Không tìm thấy'}</p>
      <Link href="/advertisements" className="text-orange-500 underline">Quay lại</Link>
    </div>
  );

  const images = ad.images || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/advertisements" className="w-9 h-9 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">
            <i className="ri-arrow-left-line"></i>
          </Link>
          <div className="text-sm text-gray-500 flex-1 min-w-0">
            <Link href="/advertisements" className="hover:text-orange-500 flex-shrink-0">Quảng cáo</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 truncate">{ad.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {images.length > 0 && (
              <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-100">
                  <img src={images[selectedImg]} alt={ad.title} className="w-full h-auto max-h-[500px] object-contain" />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {images.map((img: string, i: number) => (
                      <button key={i} onClick={() => setSelectedImg(i)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${selectedImg === i ? 'border-orange-500' : 'border-transparent'}`}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded font-medium">
                  {CATEGORIES[ad.category] || ad.category}
                </span>
                {ad.isVip && <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">VIP</span>}
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{ad.title}</h1>
              {ad.businessName && (
                <p className="text-orange-600 font-semibold text-lg mb-4">{ad.businessName}</p>
              )}

              {(ad.startDate || ad.endDate) && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 bg-orange-50 rounded-lg px-4 py-2">
                  <i className="ri-calendar-event-line text-orange-500"></i>
                  <span>
                    {ad.startDate && new Date(ad.startDate).toLocaleDateString('vi-VN')}
                    {ad.startDate && ad.endDate && ' – '}
                    {ad.endDate && new Date(ad.endDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}

              <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">{ad.description}</div>

              {ad.location && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                  <i className="ri-map-pin-line text-orange-500"></i>
                  {ad.location}
                </div>
              )}

              <p className="text-xs text-gray-400 mt-4">
                Đăng ngày {new Date(ad.createdAt).toLocaleDateString('vi-VN')} • {ad.viewCount} lượt xem
              </p>
            </div>
          </div>

          {/* Sidebar - Contact */}
          <div>
            <div className="bg-white rounded-xl p-5 shadow-sm sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Thông tin liên hệ</h3>

              {ad.contactName && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="ri-user-line text-orange-600"></i>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{ad.contactName}</p>
                    {ad.businessName && <p className="text-sm text-gray-500">{ad.businessName}</p>}
                  </div>
                </div>
              )}

              {ad.contactPhone && (
                <a href={`tel:${ad.contactPhone}`}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 mb-2">
                  <i className="ri-phone-line"></i> {ad.contactPhone}
                </a>
              )}

              {ad.user?.id && (
                <button
                  onClick={async () => {
                    if (!auth.isLoggedIn()) { window.location.href = '/profile'; return; }
                    try {
                      const conv = await messagesApi.getOrCreate(ad.user.id) as any;
                      window.location.href = `/messages/${conv.id}`;
                    } catch { alert('Không thể mở chat'); }
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 mb-2">
                  <i className="ri-message-3-line"></i> Nhắn tin
                </button>
              )}
              {ad.user?.id && (
                <Link href={`/profile/${ad.user.id}`}
                  className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 text-sm">
                  Xem trang người đăng
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
