
'use client';

import Link from 'next/link';
import { useState } from 'react';
import MessengerModal from '../../../components/MessengerModal';

interface RealEstateDetailProps {
  propertyId: string;
}

export default function RealEstateDetail({ propertyId }: RealEstateDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showMessengerModal, setShowMessengerModal] = useState(false);

  // Mock data - trong thực tế sẽ fetch từ API
  const property = {
    id: parseInt(propertyId),
    title: 'Bán nhà mặt tiền đường Nguyễn Văn Linh, Q7',
    price: 8500000000,
    pricePerM2: 85000000,
    area: 100,
    type: 'house',
    transactionType: 'sell',
    status: 'new',
    images: [
      'https://readdy.ai/api/search-image?query=Modern%20Vietnamese%20house%20exterior%20with%20beautiful%20architecture%2C%20clean%20design%2C%20natural%20lighting%2C%20real%20estate%20photography%20style&width=800&height=600&seq=house1&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Vietnamese%20house%20interior%20living%20room%20modern%20furniture%2C%20bright%20spacious%20design%2C%20real%20estate%20interior%20photography&width=800&height=600&seq=house2&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Vietnamese%20house%20kitchen%20modern%20appliances%2C%20clean%20white%20design%2C%20real%20estate%20photography&width=800&height=600&seq=house3&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Vietnamese%20house%20bedroom%20modern%20furniture%2C%20comfortable%20design%2C%20natural%20lighting&width=800&height=600&seq=house4&orientation=landscape'
    ],
    address: '123 Nguyễn Văn Linh, Phường Tân Phú, Quận 7, TP.HCM',
    description: 'Nhà mặt tiền đường Nguyễn Văn Linh, vị trí đắc địa, giao thông thuận lợi. Nhà mới xây, thiết kế hiện đại, đầy đủ nội thất cao cấp. Phù hợp để ở hoặc kinh doanh.',
    legalStatus: 'Sổ hồng riêng',
    seller: {
      name: 'Chị Lan Anh',
      phone: '0908123456',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20woman%20real%20estate%20agent%20professional%20portrait%2C%20friendly%20smile%2C%20business%20attire&width=100&height=100&seq=agent1&orientation=squarish',
      isAgent: true,
      totalListings: 45,
      userId: 'agent123'
    },
    postedDate: '2024-01-15',
    isVip: true,
    isFeatured: true,
    viewCount: 1250,
    details: {
      bedrooms: 4,
      bathrooms: 3,
      floors: 3,
      frontage: 5,
      direction: 'Đông Nam',
      yearBuilt: 2023,
      furniture: 'Đầy đủ nội thất',
      parking: '2 xe hơi',
      balcony: 2
    },
    amenities: [
      'Gần trường học',
      'Gần bệnh viện',
      'Gần chợ',
      'Gần công viên',
      'An ninh tốt',
      'Giao thông thuận lợi'
    ],
    nearbyPlaces: [
      { name: 'Trường THPT Nguyễn Thị Minh Khai', distance: '500m' },
      { name: 'Bệnh viện Quận 7', distance: '1.2km' },
      { name: 'Chợ Tân Mỹ', distance: '800m' },
      { name: 'Công viên Tân Cảng', distance: '1.5km' }
    ]
  };

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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `${property.title} - ${formatPrice(property.price, property.transactionType)}`,
        url: window.location.href
      });
    } else {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      alert('Đã sao chép liên kết!');
    }
  };

  const handleCall = () => {
    window.open(`tel:${property.seller.phone}`, '_self');
  };

  const handleMessageClick = () => {
    setShowMessengerModal(true);
    setShowContactModal(false);
  };

  const handleContactProfile = () => {
    window.location.href = `/profile/${property.seller.userId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600 cursor-pointer">Trang chủ</Link>
            <i className="ri-arrow-right-s-line"></i>
            <Link href="/real-estate" className="hover:text-green-600 cursor-pointer">Bất động sản</Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-gray-900">Chi tiết</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="relative">
                <img
                  src={property.images[selectedImageIndex]}
                  alt={property.title}
                  className="w-full h-96 object-cover object-top"
                />
                
                {/* VIP Badge */}
                {property.isVip && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded text-sm font-medium">
                    VIP
                  </div>
                )}

                {/* Navigation */}
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : property.images.length - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 cursor-pointer"
                    >
                      <i className="ri-arrow-left-s-line w-6 h-6 flex items-center justify-center"></i>
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(prev => prev < property.images.length - 1 ? prev + 1 : 0)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 cursor-pointer"
                    >
                      <i className="ri-arrow-right-s-line w-6 h-6 flex items-center justify-center"></i>
                    </button>
                  </>
                )}

                {/* Actions */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg cursor-pointer"
                  >
                    <i className={`${isSaved ? 'ri-heart-fill text-red-500' : 'ri-heart-line text-gray-600'} w-5 h-5 flex items-center justify-center`}></i>
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg cursor-pointer"
                  >
                    <i className="ri-share-line text-gray-600 w-5 h-5 flex items-center justify-center"></i>
                  </button>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              <div className="p-4">
                <div className="grid grid-cols-4 gap-2">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-video overflow-hidden rounded border-2 transition-colors cursor-pointer ${
                        selectedImageIndex === index ? 'border-green-500' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Hình ${index + 1}`}
                        className="w-full h-full object-cover object-top"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{property.title}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium">
                  {getTypeLabel(property.type)}
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm font-medium">
                  {getTransactionLabel(property.transactionType)}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(property.price, property.transactionType)}
                  </div>
                  <div className="text-sm text-gray-600">Tổng giá</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{property.area}m²</div>
                  <div className="text-sm text-gray-600">Diện tích</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">
                    {(property.pricePerM2 / 1000000).toFixed(1)}tr/m²
                  </div>
                  <div className="text-sm text-gray-600">Đơn giá</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">{property.viewCount}</div>
                  <div className="text-sm text-gray-600">Lượt xem</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Mô tả</h3>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin chi tiết</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phòng ngủ:</span>
                      <span className="font-medium">{property.details.bedrooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phòng tắm:</span>
                      <span className="font-medium">{property.details.bathrooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số tầng:</span>
                      <span className="font-medium">{property.details.floors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mặt tiền:</span>
                      <span className="font-medium">{property.details.frontage}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hướng:</span>
                      <span className="font-medium">{property.details.direction}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Năm xây:</span>
                      <span className="font-medium">{property.details.yearBuilt}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tiện ích</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <i className="ri-check-line text-green-500 w-4 h-4 flex items-center justify-center"></i>
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Địa điểm lân cận</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {property.nearbyPlaces.map((place, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{place.name}</span>
                      <span className="text-sm text-green-600 font-medium">{place.distance}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Info */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên hệ</h3>
              
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={property.seller.avatar}
                  alt={property.seller.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <button
                    onClick={handleContactProfile}
                    className="font-semibold text-gray-900 hover:text-green-600 transition-colors cursor-pointer"
                  >
                    {property.seller.name}
                  </button>
                  <div className="flex items-center gap-2 mt-1">
                    {property.seller.isAgent && (
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                        Môi giới
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {property.seller.totalListings} tin đăng
                  </p>
                </div>
              </div>

              {showContactModal && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <i className="ri-phone-line text-green-500"></i>
                    <span className="font-medium text-gray-900">{property.seller.phone}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => setShowContactModal(!showContactModal)}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap cursor-pointer"
                >
                  {showContactModal ? 'Ẩn số điện thoại' : 'Hiện số điện thoại'}
                </button>

                <button
                  onClick={handleCall}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-phone-line w-5 h-5 flex items-center justify-center"></i>
                  Gọi điện ngay
                </button>

                <button
                  onClick={handleMessageClick}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-message-line w-5 h-5 flex items-center justify-center"></i>
                  Nhắn tin riêng
                </button>

                <button
                  onClick={handleContactProfile}
                  className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-medium whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-user-line w-5 h-5 flex items-center justify-center"></i>
                  Xem thông tin cá nhân
                </button>
              </div>

              <div className="mt-6 pt-6 border-t text-center text-sm text-gray-500">
                <p>Đăng {formatDate(property.postedDate)}</p>
                <p className="mt-1">Mã tin: #{property.id}</p>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vị trí</h3>
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <i className="ri-map-pin-line text-3xl mb-2"></i>
                  <p className="text-sm">{property.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Properties */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tin đăng liên quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mock related properties */}
            {[1, 2, 3].map((id) => (
              <div key={id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <img
                  src={`https://readdy.ai/api/search-image?query=Vietnamese%20house%20exterior%20modern%20architecture%20real%20estate%20photography&width=400&height=300&seq=related${id}&orientation=landscape`}
                  alt="Nhà liên quan"
                  className="w-full h-48 object-cover object-top rounded-t-lg"
                />
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    Bán nhà mặt tiền đường lớn, vị trí đẹp
                  </h3>
                  <div className="text-lg font-bold text-green-600 mb-2">
                    {formatPrice(5000000000 + id * 1000000000, 'sell')}
                  </div>
                  <div className="text-sm text-gray-600">
                    80m² • Quận {id + 6}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messenger Modal */}
        <MessengerModal
          isOpen={showMessengerModal}
          onClose={() => setShowMessengerModal(false)}
          recipientName={property.seller.name}
          recipientAvatar={property.seller.avatar}
          recipientPhone={property.seller.phone}
          productTitle={property.title}
          productImage={property.images[0]}
        />
      </div>
    </div>
  );
}
