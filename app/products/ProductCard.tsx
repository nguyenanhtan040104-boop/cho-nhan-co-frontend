
'use client';

import { useState } from 'react';
import Link from 'next/link';
import MessengerModal from '../../components/MessengerModal';

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  image: string;
  category: string;
  seller: {
    name: string;
    phone: string;
    avatar: string;
    location: string;
    rating: number;
    userId?: string;
  };
  isVip: boolean;
  rating: number;
  soldCount: number;
  description: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [showMessengerModal, setShowMessengerModal] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/products/${product.id}`;
    const text = `${product.name} - ${formatPrice(product.price)}`;
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: text,
        url: url
      });
    } else {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
      window.open(facebookUrl, '_blank', 'width=600,height=400');
    }
  };


  const handleMessage = () => {
    setShowMessengerModal(true);
  };

  const handleContactProfile = () => {
    const userId = product.seller.userId || 'user123';
    window.location.href = `/profile/${userId}`;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow" data-product-shop>
        {/* Image */}
        <div className="relative">
          <Link href={`/products/${product.id}`} className="cursor-pointer">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover object-top rounded-t-lg hover:scale-105 transition-transform duration-300"
            />
          </Link>
          
          {/* VIP Badge */}
          {product.isVip && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded text-xs font-semibold">
              VIP
            </div>
          )}
          
          {/* Save Button */}
          <button
            onClick={() => setIsSaved(!isSaved)}
            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg cursor-pointer"
            suppressHydrationWarning={true}
          >
            <i className={`${isSaved ? 'ri-heart-fill text-red-500' : 'ri-heart-line text-gray-600'} w-5 h-5 flex items-center justify-center`}></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-green-600 cursor-pointer">
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="text-lg font-bold text-green-600 mb-2">
            {formatPrice(product.price)}
            <span className="text-sm text-gray-500 font-normal">/{product.unit}</span>
          </div>

          {/* Rating and Sold */}
          <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
              <span>{product.rating}</span>
            </div>
            <span>|</span>
            <span>Đã bán {product.soldCount}</span>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

          {/* Seller Info */}
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <img
                src={product.seller.avatar}
                alt={product.seller.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <button
                  onClick={handleContactProfile}
                  className="text-sm font-medium text-gray-900 hover:text-green-600 transition-colors cursor-pointer"
                >
                  {product.seller.name}
                </button>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <i className="ri-star-fill text-yellow-400 w-3 h-3 flex items-center justify-center"></i>
                    <span>{product.seller.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{product.seller.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleMessage}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
                suppressHydrationWarning={true}
              >
                <i className="ri-message-3-line w-4 h-4 flex items-center justify-center mr-2 inline-flex"></i>
                Nhắn tin
              </button>
              <button
                onClick={handleShare}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                suppressHydrationWarning={true}
              >
                <i className="ri-share-line text-gray-600 w-5 h-5 flex items-center justify-center"></i>
              </button>
              <Link
                href={`/products/${product.id}`}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                <i className="ri-eye-line w-5 h-5 flex items-center justify-center"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Messenger Modal */}
      <MessengerModal
        isOpen={showMessengerModal}
        onClose={() => setShowMessengerModal(false)}
        recipientName={product.seller.name}
        recipientAvatar={product.seller.avatar}
        recipientPhone={product.seller.phone}
        productTitle={product.name}
        productImage={product.image}
      />
    </>
  );
}
