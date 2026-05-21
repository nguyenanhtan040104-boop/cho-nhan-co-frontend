'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { realEstate, messages as messagesApi, auth } from '../../../lib/api';
import CommentSection from '../../../components/CommentSection';

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
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(1);
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
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-orange-700 text-sm font-medium">Đang tải tin bất động sản...</p>
      </div>
    </div>
  );

  if (error || !item) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-orange-50">
      <i className="ri-home-4-line text-6xl text-orange-300"></i>
      <p className="text-gray-500">{error || 'Không tìm thấy'}</p>
      <Link href="/real-estate" className="text-orange-600 underline font-medium">← Quay lại danh sách</Link>
    </div>
  );

  const images = item.images || [];
  const isOwner = currentUserId && item.user?.id === currentUserId;

  return (
    <>
      <div className="min-h-screen bg-orange-50/40">
        {/* Breadcrumb */}
        <div className="bg-white shadow-sm border-b border-orange-100">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/real-estate" className="flex items-center justify-center w-9 h-9 rounded-lg border border-orange-200 hover:bg-orange-50 text-orange-600 transition-colors">
              <i className="ri-arrow-left-line"></i>
            </Link>
            <div className="text-sm text-gray-500 flex-1 min-w-0 flex items-center gap-1">
              <Link href="/" className="hover:text-orange-600 flex-shrink-0">Trang chủ</Link>
              <i className="ri-arrow-right-s-line text-gray-400"></i>
              <Link href="/real-estate" className="hover:text-orange-600 flex-shrink-0">Bất động sản</Link>
              <i className="ri-arrow-right-s-line text-gray-400"></i>
              <span className="text-gray-900 truncate">{item.title}</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: Image Gallery */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-orange-100">
                {/* Lightbox */}
                {lightbox && images[selectedImg] && (
                  <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center" onClick={() => { setLightbox(false); setZoom(1); }}>
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                      <button onClick={e => { e.stopPropagation(); setZoom(z => Math.min(z + 0.5, 4)); }} className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition"><i className="ri-zoom-in-line text-lg"></i></button>
                      <button onClick={e => { e.stopPropagation(); setZoom(z => Math.max(z - 0.5, 0.5)); }} className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition"><i className="ri-zoom-out-line text-lg"></i></button>
                      <button onClick={e => { e.stopPropagation(); setZoom(1); }} className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition"><i className="ri-fullscreen-exit-line text-lg"></i></button>
                      <button onClick={() => { setLightbox(false); setZoom(1); }} className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition"><i className="ri-close-line text-lg"></i></button>
                    </div>
                    {images.length > 1 && (
                      <>
                        <button onClick={e => { e.stopPropagation(); setSelectedImg(i => (i - 1 + images.length) % images.length); }} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition z-10"><i className="ri-arrow-left-s-line text-2xl"></i></button>
                        <button onClick={e => { e.stopPropagation(); setSelectedImg(i => (i + 1) % images.length); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition z-10"><i className="ri-arrow-right-s-line text-2xl"></i></button>
                        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">{selectedImg + 1} / {images.length}</span>
                      </>
                    )}
                    <div className="overflow-auto max-w-full max-h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                      <img src={images[selectedImg].url} alt={item.title} style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s', maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', cursor: zoom > 1 ? 'zoom-out' : 'zoom-in' }} onClick={() => setZoom(z => z > 1 ? 1 : 2)} />
                    </div>
                  </div>
                )}

                {/* Main image */}
                <div className="relative bg-gray-100" style={{ height: 360 }}>
                  {images[selectedImg] ? (
                    <img src={images[selectedImg].url} alt={item.title} className="w-full h-full object-contain cursor-zoom-in" onClick={() => { setLightbox(true); setZoom(1); }} />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <i className="ri-home-4-line text-6xl text-orange-200"></i>
                      <span className="text-orange-300 text-sm">Chưa có ảnh</span>
                    </div>
                  )}
                  {item.isVip && (
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow z-10 flex items-center gap-1">
                      <i className="ri-vip-crown-fill"></i> VIP
                    </span>
                  )}
                  {images.length > 1 && (
                    <>
                      <button onClick={() => setSelectedImg(i => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow hover:bg-white transition z-10">
                        <i className="ri-arrow-left-s-line text-xl text-gray-700"></i>
                      </button>
                      <button onClick={() => setSelectedImg(i => (i + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow hover:bg-white transition z-10">
                        <i className="ri-arrow-right-s-line text-xl text-gray-700"></i>
                      </button>
                      <span className="absolute bottom-2.5 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                        {selectedImg + 1}/{images.length}
                      </span>
                    </>
                  )}
                </div>

                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto bg-white">
                    {images.map((img: any, i: number) => (
                      <button key={i} onClick={() => setSelectedImg(i)}
                        className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImg === i ? 'border-orange-400 shadow-md' : 'border-transparent hover:border-orange-200'}`}>
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
                <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-base">
                  <i className="ri-file-text-line text-orange-500"></i>
                  Mô tả chi tiết
                </h2>
                <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">{item.description}</p>
              </div>

              {/* Price history */}
              {item.priceHistory && item.priceHistory.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
                  <p className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base">
                    <i className="ri-line-chart-line text-orange-500"></i>
                    Lịch sử thay đổi giá
                  </p>
                  <div className="relative">
                    <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-orange-100"></div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-4 pl-7 relative">
                        <div className="absolute left-0 w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-sm"></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-orange-600">{formatPrice(Number(item.price))}</p>
                          <p className="text-xs text-gray-400">Giá hiện tại</p>
                        </div>
                      </div>
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

            {/* RIGHT: Sticky Card */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-md border border-orange-100 sticky top-4 overflow-hidden">
                {/* Orange top accent */}
                <div className="h-1.5 bg-gradient-to-r from-orange-400 to-amber-400"></div>
                <div className="p-5 space-y-4">
                  {/* VIP badge */}
                  {item.isVip && (
                    <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      <i className="ri-vip-crown-fill"></i> Tin VIP nổi bật
                    </div>
                  )}

                  {/* Title */}
                  <h1 className="text-xl font-bold text-gray-900 leading-snug">{item.title}</h1>

                  {/* Price */}
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                    <p className="text-2xl font-extrabold text-orange-600">{formatPrice(Number(item.price))}</p>
                    <p className="text-xs text-orange-400 mt-0.5">Giá thỏa thuận</p>
                  </div>

                  {/* Type + Status badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {typeLabel[item.type] || item.type}
                    </span>
                    <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                      {statusLabel[item.status] || item.status}
                    </span>
                  </div>

                  {/* Property specs grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-orange-50/60 rounded-xl p-3 flex items-start gap-2">
                      <i className="ri-ruler-2-line text-orange-500 mt-0.5 flex-shrink-0"></i>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">Diện tích</p>
                        <p className="text-sm font-semibold text-gray-900">{item.area} m²</p>
                      </div>
                    </div>
                    <div className="bg-orange-50/60 rounded-xl p-3 flex items-start gap-2">
                      <i className="ri-money-dollar-circle-line text-orange-500 mt-0.5 flex-shrink-0"></i>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">Giá/m²</p>
                        <p className="text-sm font-semibold text-gray-900">{item.area ? formatPrice(Math.round(Number(item.price) / item.area)) : '—'}/m²</p>
                      </div>
                    </div>
                    <div className="bg-orange-50/60 rounded-xl p-3 flex items-start gap-2">
                      <i className="ri-eye-line text-orange-500 mt-0.5 flex-shrink-0"></i>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">Lượt xem</p>
                        <p className="text-sm font-semibold text-gray-900">{item.viewCount || 0}</p>
                      </div>
                    </div>
                    {item.legalStatus && (
                      <div className="bg-orange-50/60 rounded-xl p-3 flex items-start gap-2">
                        <i className="ri-file-shield-2-line text-orange-500 mt-0.5 flex-shrink-0"></i>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Pháp lý</p>
                          <p className="text-sm font-semibold text-gray-900">{item.legalStatus}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  {item.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-700 bg-orange-50/40 rounded-xl p-3">
                      <i className="ri-map-pin-2-line text-orange-500 mt-0.5 flex-shrink-0"></i>
                      <span>{item.address}</span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="space-y-2 pt-1">
                    {item.user?.phone && (
                      <a href={`tel:${item.user.phone}`}
                        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-colors shadow-sm">
                        <i className="ri-phone-line"></i>
                        Liên hệ xem nhà
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
                      className="w-full flex items-center justify-center gap-2 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 py-3 rounded-xl font-semibold transition-colors">
                      <i className="ri-message-3-line"></i>
                      Nhắn tin người đăng
                    </button>
                    {isOwner && (
                      <div className="flex gap-2 pt-1">
                        <Link href={`/real-estate/${propertyId}/edit`}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-sm font-medium transition-colors">
                          <i className="ri-edit-line"></i> Chỉnh sửa
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Seller info */}
                  <div className="border-t border-orange-100 pt-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-3">Người đăng tin</p>
                    <div className="flex items-center gap-3">
                      {item.user?.avatarUrl ? (
                        <img src={item.user.avatarUrl} alt="" className="w-11 h-11 rounded-full object-cover border-2 border-orange-200" />
                      ) : (
                        <div className="w-11 h-11 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-base border-2 border-orange-200">
                          {item.user?.fullName?.[0] || 'U'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{item.user?.fullName}</p>
                        <p className="text-xs text-gray-400">@{item.user?.username}</p>
                      </div>
                      <Link href={`/profile/${item.user?.id}`} className="text-orange-500 hover:text-orange-600 text-xs font-medium flex-shrink-0">
                        Xem →
                      </Link>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      <i className="ri-calendar-line mr-1"></i>
                      Đăng ngày {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 pb-6">
        <CommentSection targetType="REAL_ESTATE" targetId={propertyId} />
      </div>
    </>
  );
}