'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MessengerModal from '../../../components/MessengerModal';
import { products as productsApi, messages as messagesApi, auth, wallet as walletApi } from '../../../lib/api';

interface ProductDetailProps {
  productId: string;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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
    // Sync liked state from localStorage
    try {
      const ids: string[] = JSON.parse(localStorage.getItem('liked_items') || '[]');
      setLiked(ids.includes(productId));
      setLikedIds(ids);
    } catch {}
  }, [productId]);

  // Fetch similar products after product loads
  useEffect(() => {
    if (!product) return;
    const cat = product.category || '';
    const url = `${process.env.NEXT_PUBLIC_API_URL}/products?limit=10&category=${cat}`;
    fetch(url).then(r => r.json()).then(data => {
      const list = (data.data || []).filter((p: any) => String(p.id) !== String(productId));
      setSimilarProducts(list.slice(0, 8));
    }).catch(() => {});
  }, [product, productId]);

  // Prevent hydration mismatch - only render on client
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const currentUser = auth.getCurrentUser?.() || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null);
  const isOwner = currentUser && product && currentUser.id === product.userId;

  const handleContactClick = () => {
    setShowContactModal(true);
  };

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
      try { await navigator.share({ title: product.title, url }); } catch { /* cancelled */ }
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
      // Reload product
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
  const mainImage = images.length > 0 ? images[0] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-green-600">
              Trang chủ
            </Link>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
            <Link href="/products" className="text-gray-500 hover:text-green-600">
              Sản phẩm
            </Link>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
            <span className="text-gray-900">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="w-full rounded-lg bg-white border overflow-hidden">
              {mainImage ? (
                <img
                  src={mainImage.url || mainImage}
                  alt={product.title}
                  className="w-full h-auto max-h-[500px] object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <i className="ri-image-line text-6xl text-gray-300"></i>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {images.map((image: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-green-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.url || image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.isVip && (
                <div className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-semibold mb-3">
                  <i className="ri-vip-crown-fill"></i>
                  Sản phẩm VIP
                </div>
              )}
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 break-words">{product.title}</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-gray-600">Đã bán {product.soldCount || 0}</span>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-2xl md:text-3xl font-bold text-orange-600">
                {formatPrice(product.price)}
                <span className="text-lg text-gray-600 font-normal">/{product.unit}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Giá có thể thay đổi tùy theo số lượng</p>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng (tối thiểu 1 {product.unit})
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                  >
                    <i className="ri-subtract-line"></i>
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center border border-gray-300 rounded-lg py-2"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                  >
                    <i className="ri-add-line"></i>
                  </button>
                  <span className="text-sm text-gray-600">
                    Còn {product.stock || 'có sẵn'} {product.unit}
                  </span>
                </div>

                <div className="text-xl font-semibold text-gray-900 mt-4">
                  Tổng: {formatPrice(product.price * quantity)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 md:gap-4 flex-wrap">
              <button
                onClick={handleContactClick}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm md:text-base"
              >
                <i className="ri-message-line"></i>
                Liên hệ mua hàng
              </button>
              <button onClick={handleLikeClick} className={`px-4 py-3 border rounded-lg transition-colors flex items-center gap-1 ${liked ? 'border-red-400 bg-red-50 text-red-500' : 'border-gray-300 hover:bg-gray-50'}`}>
                <i className={liked ? 'ri-heart-fill' : 'ri-heart-line'}></i>
                {likeCount > 0 && <span className="text-sm">{likeCount}</span>}
              </button>
              <button onClick={handleShareClick} className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <i className="ri-share-line"></i>
              </button>
              {isOwner && !product.isVip && (
                <button onClick={handleBuyVip} disabled={buyingVip}
                  className="px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-1 text-sm font-medium">
                  <i className="ri-vip-crown-fill"></i>
                  {buyingVip ? '...' : 'Mua VIP'}
                </button>
              )}
              {isOwner && product.isVip && (
                <span className="px-4 py-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium flex items-center gap-1 border border-yellow-200">
                  <i className="ri-vip-crown-fill"></i> Đang VIP
                </span>
              )}
              {isOwner && (
                <button onClick={handleDeleteClick} disabled={deleting}
                  className="px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                  <i className="ri-delete-bin-line"></i>
                </button>
              )}
            </div>

            {/* Seller Info */}
            {product.user && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Thông tin người bán</h3>
                <div className="flex items-center gap-4">
                  {product.user.avatar && (
                    <img
                      src={product.user.avatar}
                      alt={product.user.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <button
                      onClick={handleContactProfile}
                      className="font-medium text-gray-900 hover:text-green-600"
                    >
                      {product.user.fullName}
                    </button>
                    <div className="text-sm text-gray-600 mt-1">
                      <i className="ri-map-pin-line"></i> {product.user.location || 'Chưa cập nhật'}
                    </div>
                  </div>
                  <button
                    onClick={handleContactProfile}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    Xem thông tin
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <div className="mt-12">
            <div className="bg-white rounded-lg border">
              <div className="border-b">
                <h3 className="px-6 py-4 text-green-600 border-b-2 border-green-600 font-medium">
                  Mô tả sản phẩm
                </h3>
              </div>
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== TIN ĐĂNG TƯƠNG TỰ ===== */}
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

      {/* Contact Modal */}
      {showContactModal && product.user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Liên hệ người bán</h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  {product.user.avatar && (
                    <img
                      src={product.user.avatar}
                      alt={product.user.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{product.user.fullName}</h4>
                    <p className="text-sm text-gray-600">{product.user.phone}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={handleMessageClick}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="ri-message-line"></i>
                    Nhắn tin riêng
                  </button>

                  <button
                    onClick={handleContactProfile}
                    className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
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
