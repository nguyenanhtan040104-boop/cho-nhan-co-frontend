
'use client';

import { useState } from 'react';
import Link from 'next/link';
import MessengerModal from '../../components/MessengerModal';

interface RealEstateItem {
  id: number;
  title: string;
  price: number;
  pricePerM2: number;
  area: number;
  type: string;
  transactionType: string;
  status: string;
  images: string[];
  address: string;
  description: string;
  legalStatus: string;
  seller: {
    name: string;
    phone: string;
    avatar: string;
    isAgent: boolean;
    totalListings: number;
    userId?: string;
  };
  postedDate: string;
  isVip: boolean;
  isFeatured: boolean;
  viewCount: number;
}

interface Props {
  item: RealEstateItem;
  isSaved: boolean;
  onSave: () => void;
}

const getTypeLabel = (type: string) => {
  const types: { [key: string]: string } = {
    house: 'Nhà ở',
    land: 'Đất nền',
    room: 'Phòng trọ',
    commercial: 'Mặt bằng'
  };
  return types[type] || type;
};

const getTransactionLabel = (type: string) => {
  const types: { [key: string]: string } = {
    sell: 'Bán',
    rent: 'Cho thuê',
    transfer: 'Sang nhượng'
  };
  return types[type] || type;
};

const getStatusLabel = (status: string) => {
  const statuses: { [key: string]: { label: string; color: string } } = {
    new: { label: 'Mới đăng', color: 'bg-green-100 text-green-800' },
    trading: { label: 'Đang giao dịch', color: 'bg-yellow-100 text-yellow-800' },
    completed: { label: 'Đã hoàn tất', color: 'bg-gray-100 text-gray-800' }
  };
  return statuses[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
};

const formatPrice = (price: number, transactionType: string) => {
  if (transactionType === 'rent') {
    return `${price.toLocaleString('vi-VN')}đ/tháng`;
  }
  if (price >= 1000000000) {
    return `${(price / 1000000000).toFixed(1)} tỷ`;
  }
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(0)} triệu`;
  }
  return `${price.toLocaleString('vi-VN')}đ`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays <= 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

export default function RealEstateCard({ item, isSaved, onSave }: Props) {
  const [showContact, setShowContact] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMessengerModal, setShowMessengerModal] = useState(false);
  
  const statusInfo = getStatusLabel(item.status);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `${item.title} - ${formatPrice(item.price, item.transactionType)}`,
        url: window.location.origin + `/real-estate/${item.id}`
      });
    } else {
      const url = window.location.origin + `/real-estate/${item.id}`;
      navigator.clipboard.writeText(url);
      alert('Đã sao chép liên kết!');
    }
  };

  const handleCall = () => {
    window.open(`tel:${item.seller.phone}`, '_self');
  };

  const handleMessageClick = () => {
    setShowMessengerModal(true);
    setShowContact(false);
  };

  const handleContactProfile = () => {
    const userId = item.seller.userId || 'user123';
    window.location.href = `/profile/${userId}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative">
        <Link href={`/real-estate/${item.id}`} className="cursor-pointer">
          <img
            src={item.images[currentImageIndex]}
            alt={item.title}
            className="w-full h-48 object-cover object-top rounded-t-lg hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        {/* VIP Badge */}
        {item.isVip && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
            VIP
          </div>
        )}
        
        {/* Status Badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </div>

        {/* Image Navigation */}
        {item.images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : item.images.length - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 cursor-pointer"
            >
              <i className="ri-arrow-left-s-line w-5 h-5 flex items-center justify-center"></i>
            </button>
            <button
              onClick={() => setCurrentImageIndex(prev => prev < item.images.length - 1 ? prev + 1 : 0)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 cursor-pointer"
            >
              <i className="ri-arrow-right-s-line w-5 h-5 flex items-center justify-center"></i>
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {item.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Save Button */}
        <button
          onClick={onSave}
          className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg cursor-pointer"
        >
          <i className={`${isSaved ? 'ri-heart-fill text-red-500' : 'ri-heart-line text-gray-600'} w-5 h-5 flex items-center justify-center`}></i>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <Link href={`/real-estate/${item.id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-green-600 cursor-pointer">
            {item.title}
          </h3>
        </Link>

        {/* Price and Area */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-bold text-green-600">
            {formatPrice(item.price, item.transactionType)}
          </div>
          <div className="text-sm text-gray-600">
            {item.area}m² • {item.pricePerM2.toLocaleString('vi-VN')}đ/m²
          </div>
        </div>

        {/* Type and Transaction */}
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
            {getTypeLabel(item.type)}
          </span>
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
            {getTransactionLabel(item.transactionType)}
          </span>
        </div>

        {/* Address */}
        <div className="flex items-center gap-2 mb-3">
          <i className="ri-map-pin-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
          <span className="text-sm text-gray-600 line-clamp-1">{item.address}</span>
        </div>

        {/* Legal Status */}
        <div className="flex items-center gap-2 mb-4">
          <i className="ri-file-text-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
          <span className="text-sm text-gray-600">{item.legalStatus}</span>
        </div>

        {/* Seller Info */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <img
              src={item.seller.avatar}
              alt={item.seller.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleContactProfile}
                  className="text-sm font-medium text-gray-900 hover:text-green-600 transition-colors cursor-pointer"
                >
                  {item.seller.name}
                </button>
                {item.seller.isAgent && (
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                    Môi giới
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-600">
                <span>{item.seller.totalListings} tin đăng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-2">
          {showContact && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <i className="ri-phone-line text-blue-500"></i>
                <span className="font-medium text-blue-700">{item.seller.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCall}
                  className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm cursor-pointer flex items-center gap-1"
                >
                  <i className="ri-phone-line w-4 h-4 flex items-center justify-center"></i>
                  Gọi
                </button>
                <button
                  onClick={handleMessageClick}
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm cursor-pointer flex items-center gap-1"
                >
                  <i className="ri-message-line w-4 h-4 flex items-center justify-center"></i>
                  Nhắn tin
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowContact(!showContact)}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
            >
              <i className="ri-phone-line w-4 h-4 flex items-center justify-center mr-2 inline-flex"></i>
              {showContact ? 'Ẩn liên hệ' : 'Hiện số điện thoại'}
            </button>
            <button
              onClick={handleShare}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <i className="ri-share-line text-gray-600 w-5 h-5 flex items-center justify-center"></i>
            </button>
            <Link
              href={`/real-estate/${item.id}`}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              <i className="ri-eye-line w-5 h-5 flex items-center justify-center"></i>
            </Link>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-gray-500">
          <span>{formatDate(item.postedDate)}</span>
          <div className="flex items-center gap-1">
            <i className="ri-eye-line w-4 h-4 flex items-center justify-center"></i>
            <span>{item.viewCount} lượt xem</span>
          </div>
        </div>
      </div>

      {/* Messenger Modal */}
      <MessengerModal
        isOpen={showMessengerModal}
        onClose={() => setShowMessengerModal(false)}
        recipientName={item.seller.name}
        recipientAvatar={item.seller.avatar}
        recipientPhone={item.seller.phone}
        productTitle={item.title}
        productImage={item.images[0]}
      />
    </div>
  );
}
