'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MessengerModal from '../../../components/MessengerModal';
import { products as productsApi, messages as messagesApi, auth } from '../../../lib/api';

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

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`);
        const data = await res.json();
        setProduct(data);
      } catch (e) {
        console.error('Lỗi tải sản phẩm:', e);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

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

  const handleContactClick = () => {
    setShowContactModal(true);
  };

  const handleCallClick = () => {
    const phoneNumber = product.user?.phone?.replace(/\D/g, '') || '';
    if (phoneNumber) window.open(`tel:${phoneNumber}`, '_self');
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
            <div className="aspect-square overflow-hidden rounded-lg bg-white border">
              {mainImage ? (
                <img
                  src={mainImage.url || mainImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
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
                      className="w-full h-full object-cover"
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
            <div className="flex gap-2 md:gap-4">
              <button
                onClick={handleContactClick}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm md:text-base"
              >
                <i className="ri-phone-line"></i>
                Liên hệ mua hàng
              </button>
              <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <i className="ri-heart-line"></i>
              </button>
              <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <i className="ri-share-line"></i>
              </button>
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
                  {product.user.phone && (
                    <button
                      onClick={handleCallClick}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="ri-phone-line"></i>
                      Gọi điện ngay
                    </button>
                  )}
                  
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
