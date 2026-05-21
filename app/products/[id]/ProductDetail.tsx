'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MessengerModal from '../../../components/MessengerModal';
import { products as productsApi, messages as messagesApi, auth, wallet as walletApi } from '../../../lib/api';
import CommentSection from '../../../components/CommentSection';

interface ProductDetailProps {
  productId: string;
}

const CATEGORY_THEME: Record<string, { accent: string; bg: string; bgHover: string; border: string; bgLight: string; badge: string; icon: string; label: string; ctaLabel: string; ctaIcon: string }> = {
  NONG_SAN:   { accent: 'text-green-600',  bg: 'bg-green-600',  bgHover: 'hover:bg-green-700',  border: 'border-green-200', bgLight: 'bg-green-50',  badge: 'bg-green-100 text-green-700',  icon: 'ri-plant-line',        label: 'Nông sản',  ctaLabel: 'Liên hệ đặt hàng', ctaIcon: 'ri-shopping-basket-line' },
  VAT_NUOI:   { accent: 'text-amber-600',  bg: 'bg-amber-500',  bgHover: 'hover:bg-amber-600',  border: 'border-amber-200', bgLight: 'bg-amber-50',  badge: 'bg-amber-100 text-amber-700',  icon: 'ri-bear-smile-line',   label: 'Vật nuôi', ctaLabel: 'Liên hệ xem thú',  ctaIcon: 'ri-paw-print-line' },
  DICH_VU:    { accent: 'text-purple-600', bg: 'bg-purple-600', bgHover: 'hover:bg-purple-700', border: 'border-purple-200', bgLight: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700',icon: 'ri-service-line',      label: 'Dịch vụ',  ctaLabel: 'Yêu cầu dịch vụ', ctaIcon: 'ri-customer-service-2-line' },
  DO_DUNG_GIA_DINH: { accent: 'text-blue-600', bg: 'bg-blue-600', bgHover: 'hover:bg-blue-700', border: 'border-blue-200', bgLight: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700', icon: 'ri-home-gear-line',    label: 'Đồ dùng',  ctaLabel: 'Liên hệ người bán', ctaIcon: 'ri-message-line' },
  HANG_TIEU_DUNG: { accent: 'text-teal-600', bg: 'bg-teal-600', bgHover: 'hover:bg-teal-700', border: 'border-teal-200', bgLight: 'bg-teal-50', badge: 'bg-teal-100 text-teal-700',  icon: 'ri-shopping-bag-line', label: 'Hàng tiêu dùng', ctaLabel: 'Liên hệ người bán', ctaIcon: 'ri-message-line' },
};
const DEFAULT_THEME = { accent: 'text-green-600', bg: 'bg-green-600', bgHover: 'hover:bg-green-700', border: 'border-green-200', bgLight: 'bg-green-50', badge: 'bg-green-100 text-green-700', icon: 'ri-leaf-line', label: 'Sản phẩm', ctaLabel: 'Liên hệ mua hàng', ctaIcon: 'ri-message-line' };

export default function ProductDetail({ productId }: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showMessengerModal, setShowMessengerModal] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [buyingVip, setBuyingVip] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`);
        const data = await res.json();
        setProduct(data);
        setLikeCount(data.likeCount || 0);
      } catch (e) {
        console.error('Lỗi tải sản phẩm:', e);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
    try {
      const ids: string[] = JSON.parse(localStorage.getItem('liked_items') || '[]');
      setLiked(ids.includes(productId));
      setLikedIds(ids);
    } catch {}
  }, [productId]);

  useEffect(() => {
    if (!product) return;
    const cat = product.category || '';
    const url = `${process.env.NEXT_PUBLIC_API_URL}/products?limit=10&category=${cat}`;
    fetch(url).then(r => r.json()).then(data => {
      const list = (data.data || []).filter((p: any) => String(p.id) !== String(productId));
      setSimilarProducts(list.slice(0, 8));
    }).catch(() => {});
  }, [product, productId]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-alert-line text-6xl text-red-500 mb-4 block"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
          <Link href="/products" className="text-green-600 hover:text-green-700">
            ← Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  const theme = CATEGORY_THEME[product.category] || DEFAULT_THEME;
  const isDichVu = product.category === 'DICH_VU';
  const isVatNuoi = product.category === 'VAT_NUOI';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const currentUser = auth.getCurrentUser?.() || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null);
  const isOwner = currentUser && product && currentUser.id === product.userId;

  const handleContactClick = () => setShowContactModal(true);

  const handleLikeClick = () => {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem('liked_items') || '[]');
      const isNowLiked = !ids.includes(productId);
      const next = isNowLiked ? [...ids, productId] : ids.filter(x => x !== productId);
      localStorage.setItem('liked_items', JSON.stringify(next));
      setLiked(isNowLiked);
      setLikedIds(next);
      setLikeCount(c => isNowLiked ? c + 1 : c - 1);
    } catch {}
  };

  const toggleSimilarLike = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const ids: string[] = JSON.parse(localStorage.getItem('liked_items') || '[]');
      const next = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
      localStorage.setItem('liked_items', JSON.stringify(next));
      setLikedIds(next);
    } catch {}
  };

  const handleShareClick = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: product.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert('Đã sao chép liên kết!');
    }
  };

  const handleDeleteClick = async () => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    setDeleting(true);
    try {
      await productsApi.delete(productId);
      router.push('/products');
    } catch {
      alert('Xóa thất bại');
      setDeleting(false);
    }
  };

  const handleBuyVip = async () => {
    if (!confirm('Mua VIP cho sản phẩm này với giá 50,000đ?')) return;
    setBuyingVip(true);
    try {
      const res = await walletApi.buyVip('product', productId) as any;
      alert(res.message || 'Mua VIP thành công!');
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`);
      const d = await r.json();
      setProduct(d);
    } catch (e: any) {
      alert(e.message || 'Lỗi mua VIP');
    } finally {
      setBuyingVip(false);
    }
  };

  const handleMessageClick = async () => {
    if (!auth.isLoggedIn()) { window.location.href = '/profile'; return; }
    try {
      const conv = await messagesApi.getOrCreate(product.user?.id) as any;
      window.location.href = `/messages/${conv.id}`;
    } catch { alert('Không thể mở chat'); }
  };

  const handleContactProfile = () => {
    window.location.href = `/profile/${product.user?.id}`;
  };

  const images = product.images || [];
  const mainImage = images.length > 0 ? images[selectedImageIndex] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-800">Trang chu</Link>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
            <Link href="/products" className={`text-gray-500 ${theme.accent.replace('text-', 'hover:text-')}`}>Sản phẩm</Link>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
            <span className="text-gray-900 truncate max-w-xs">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Product Images */}
          <div className="space-y-3">
            {/* Lightbox */}
            {lightbox && mainImage && (
              <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center" onClick={() => { setLightbox(false); setZoom(1); }}>
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <button onClick={e => { e.stopPropagation(); setZoom(z => Math.min(z + 0.5, 4)); }} className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition"><i className="ri-zoom-in-line text-lg"></i></button>
                  <button onClick={e => { e.stopPropagation(); setZoom(z => Math.max(z - 0.5, 0.5)); }} className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition"><i className="ri-zoom-out-line text-lg"></i></button>
                  <button onClick={e => { e.stopPropagation(); setZoom(1); }} className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition"><i className="ri-fullscreen-exit-line text-lg"></i></button>
                  <button onClick={() => { setLightbox(false); setZoom(1); }} className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition"><i className="ri-close-line text-lg"></i></button>
                </div>
                {images.length > 1 && (
                  <>
                    <button onClick={e => { e.stopPropagation(); setSelectedImageIndex(i => (i - 1 + images.length) % images.length); }} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition z-10"><i className="ri-arrow-left-s-line text-2xl"></i></button>
                    <button onClick={e => { e.stopPropagation(); setSelectedImageIndex(i => (i + 1) % images.length); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition z-10"><i className="ri-arrow-right-s-line text-2xl"></i></button>
                    <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">{selectedImageIndex + 1} / {images.length}</span>
                  </>
                )}
                <div className="overflow-auto max-w-full max-h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                  <img src={mainImage.url || mainImage} alt={product.title} style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s', maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', cursor: zoom > 1 ? 'zoom-out' : 'zoom-in' }} onClick={() => setZoom(z => z > 1 ? 1 : 2)} />
                </div>
              </div>
            )}

            {/* Main image */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200" style={{ height: 360 }}>
              {mainImage ? (
                <img src={mainImage.url || mainImage} alt={product.title} className="w-full h-full object-contain cursor-zoom-in" onClick={() => { setLightbox(true); setZoom(1); }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <i className="ri-image-line text-6xl text-gray-300"></i>
                </div>
              )}
              {product.isVip && (
                <span className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1 z-10">
                  <i className="ri-vip-crown-fill"></i> VIP
                </span>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setSelectedImageIndex(i => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow hover:bg-white transition z-10">
                    <i className="ri-arrow-left-s-line text-xl text-gray-700"></i>
                  </button>
                  <button onClick={() => setSelectedImageIndex(i => (i + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow hover:bg-white transition z-10">
                    <i className="ri-arrow-right-s-line text-xl text-gray-700"></i>
                  </button>
                  <span className="absolute bottom-2.5 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                    {selectedImageIndex + 1}/{images.length}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((image: any, index: number) => (
                  <button key={index} onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImageIndex === index ? 'border-yellow-400 shadow-md' : 'border-transparent hover:border-gray-300'}`}>
                    <img src={image.url || image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            {/* Category badge + title */}
            <div>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-3 ${theme.badge}`}>
                <i className={theme.icon}></i>
                {theme.label}
              </span>
              {product.isVip && (
                <div className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-semibold mb-3 ml-2">
                  <i className="ri-vip-crown-fill"></i>
                  Sản phẩm VIP
                </div>
              )}
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 break-words">{product.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                {isVatNuoi ? (
                  product.stock > 0 ? (
                    <span className="text-amber-600 font-medium">Còn {product.stock} con</span>
                  ) : null
                ) : (
                  <span>Đã bán {product.soldCount || 0}</span>
                )}
              </div>
            </div>

            {/* Price box */}
            <div className={`${theme.bgLight} border ${theme.border} rounded-xl p-4`}>
              <div className={`text-2xl md:text-3xl font-bold ${theme.accent}`}>
                {formatPrice(product.price)}
                <span className="text-lg text-gray-500 font-normal">/{product.unit}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Giá có thể thay đổi tùy theo số lượng</p>
            </div>

            {/* Quantity Selector - hidden for DICH_VU */}
            {!isDichVu && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Số lượng (tối thiểu 1 {product.unit})
                </label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <i className="ri-subtract-line"></i>
                  </button>
                  <input type="number" min="1" value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center border border-gray-300 rounded-xl py-2 text-sm" />
                  <button onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <i className="ri-add-line"></i>
                  </button>
                  <span className="text-sm text-gray-500">Còn {product.stock || 'có sẵn'} {product.unit}</span>
                </div>
                <div className="text-xl font-semibold text-gray-900">
                  Tổng: {formatPrice(product.price * quantity)}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 md:gap-3 flex-wrap">
              <button onClick={handleContactClick}
                className={`flex-1 ${theme.bg} ${theme.bgHover} text-white py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 font-semibold text-sm md:text-base shadow-sm`}>
                <i className={theme.ctaIcon}></i>
                {theme.ctaLabel}
              </button>
              <button onClick={handleLikeClick}
                className={`px-4 py-3 border rounded-xl transition-colors flex items-center gap-1.5 ${liked ? 'border-red-400 bg-red-50 text-red-500' : 'border-gray-300 hover:bg-gray-50 text-gray-600'}`}>
                <i className={liked ? 'ri-heart-fill' : 'ri-heart-line'}></i>
                {likeCount > 0 && <span className="text-sm">{likeCount}</span>}
              </button>
              <button onClick={handleShareClick} className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-gray-600">
                <i className="ri-share-line"></i>
              </button>
              {isOwner && !product.isVip && (
                <button onClick={handleBuyVip} disabled={buyingVip}
                  className="px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5 text-sm font-semibold">
                  <i className="ri-vip-crown-fill"></i>
                  {buyingVip ? '...' : 'Mua VIP'}
                </button>
              )}
              {isOwner && product.isVip && (
                <span className="px-4 py-3 bg-yellow-50 text-yellow-700 rounded-xl text-sm font-semibold flex items-center gap-1.5 border border-yellow-200">
                  <i className="ri-vip-crown-fill"></i> Đang VIP
                </span>
              )}
              {isOwner && (
                <button onClick={handleDeleteClick} disabled={deleting}
                  className="px-4 py-3 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50">
                  <i className="ri-delete-bin-line"></i>
                </button>
              )}
            </div>

            {/* Seller Info */}
            {product.user && (
              <div className={`bg-white border ${theme.border} rounded-2xl p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">Người bán</h3>
                  <button onClick={handleContactProfile} className={`text-sm font-medium ${theme.accent}`}>
                    Xem trang
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  {product.user.avatar ? (
                    <img src={product.user.avatar} alt={product.user.fullName} className="w-12 h-12 rounded-full object-cover border-2 border-gray-100" />
                  ) : (
                    <div className={`w-12 h-12 ${theme.bgLight} rounded-full flex items-center justify-center ${theme.accent} font-bold text-lg`}>
                      {product.user.fullName?.[0] || 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <button onClick={handleContactProfile} className="font-semibold text-gray-900 hover:underline text-sm truncate block">
                      {product.user.fullName}
                    </button>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <i className="ri-map-pin-line"></i> {product.user.location || 'Chưa cập nhật'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <div className="mt-10">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className={`border-b border-gray-100 px-6 py-4 flex items-center gap-2 ${theme.accent}`}>
                <i className="ri-file-text-line"></i>
                <h3 className="font-bold">Mô tả sản phẩm</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{product.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Similar products */}
      {similarProducts.length > 0 && (
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          <h2 className="text-base font-bold text-gray-900 mb-3">Tin đăng tương tự</h2>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {similarProducts.map((p: any) => {
              const isLiked = likedIds.includes(String(p.id));
              const imgUrl = p.images?.[0]?.url || null;
              const imgCount = p.images?.length || 0;
              const diff = Date.now() - new Date(p.createdAt).getTime();
              const d = Math.floor(diff / 86400000);
              const h = Math.floor(diff / 3600000);
              const timeStr = d > 0 ? `${d} ngày trước` : h > 0 ? `${h} giờ trước` : 'Vừa đăng';
              return (
                <a key={p.id} href={`/products/${p.id}`}
                  className="flex-shrink-0 w-44 bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow block">
                  <div className="relative" style={{ aspectRatio: '4/3' }}>
                    {imgUrl ? (
                      <img src={imgUrl} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <i className="ri-image-line text-2xl text-gray-300"></i>
                      </div>
                    )}
                    <button onClick={e => toggleSimilarLike(e, String(p.id))}
                      className="absolute top-1.5 right-1.5 w-7 h-7 bg-white/85 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
                      <i className={`${isLiked ? 'ri-heart-fill text-red-500' : 'ri-heart-line text-gray-400'} text-sm`}></i>
                    </button>
                    <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">{timeStr}</span>
                    {imgCount > 1 && (
                      <span className="absolute bottom-1.5 right-1.5 bg-black/55 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <i className="ri-image-2-line text-[10px]"></i> {imgCount}
                      </span>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug mb-1">{p.title}</p>
                    <p className="text-sm font-bold" style={{ color: '#d0011b' }}>{Number(p.price).toLocaleString('vi-VN')}đ</p>
                    {p.location && <p className="text-[10px] text-gray-400 mt-0.5 truncate"><i className="ri-map-pin-line"></i> {p.location}</p>}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Comment Section */}
      <div className="max-w-screen-xl mx-auto px-4 pb-6">
        <CommentSection targetType="PRODUCT" targetId={productId} />
      </div>

      {/* Contact Modal */}
      {showContactModal && product.user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Liên hệ người bán</h3>
                <button onClick={() => setShowContactModal(false)} className="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  {product.user.avatar && (
                    <img src={product.user.avatar} alt={product.user.fullName} className="w-12 h-12 rounded-full object-cover" />
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">{product.user.fullName}</h4>
                    <p className="text-sm text-gray-500">{product.user.phone}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <button onClick={handleMessageClick}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium">
                    <i className="ri-message-line"></i>
                    Nhắn tin riêng
                  </button>
                  <button onClick={handleContactProfile}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-medium">
                    <i className="ri-user-line"></i>
                    Xem thông tin cá nhân
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messenger Modal */}
      {product.user && (
        <MessengerModal
          isOpen={showMessengerModal}
          onClose={() => setShowMessengerModal(false)}
          recipientName={product.user.fullName}
          recipientAvatar={product.user.avatar}
          recipientPhone={product.user.phone}
          productTitle={product.title}
          productImage={mainImage?.url || mainImage}
        />
      )}
    </div>
  );
}