
'use client';

import Link from 'next/link';
import { useState } from 'react';
import MessengerModal from '../../../components/MessengerModal';

interface AdvertisementDetailProps {
  adId: string;
}

export default function AdvertisementDetail({ adId }: AdvertisementDetailProps) {
  const [showMessengerModal, setShowMessengerModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const mockAds = [
    {
      id: 1,
      title: 'Khai trương cửa hàng tạp hóa Minh Phát',
      category: 'grand-opening',
      type: 'Khai trương',
      businessName: 'Tạp hóa Minh Phát',
      description: 'Chúng tôi vui mừng thông báo khai trương cửa hàng tạp hóa Minh Phát với đầy đủ các mặt hàng thiết yếu, thực phẩm tươi sống và đồ gia dụng. Khai trương từ ngày 15/12 với nhiều ưu đãi hấp dẫn.',
      fullDescription: `🎉 **KHAI TRƯƠNG CỬA HÀNG TẠP HÓA MINH PHÁT** 🎉

Chúng tôi vui mừng thông báo chính thức khai trương cửa hàng tạp hóa Minh Phát tại Thôn 2, Xã Nhân Cơ, Kon Tum từ ngày 15/12/2024.

**🏪 GIỚI THIỆU VỀ CỬA HÀNG:**
- Diện tích: 200m² với không gian mua sắm thoải mái
- Đầy đủ các mặt hàng thiết yếu hàng ngày
- Thực phẩm tươi sống được nhập hàng ngày
- Đồ gia dụng chất lượng cao
- Giá cả cạnh tranh, phù hợp với mọi gia đình

**🎁 ƯU ĐÃI KHAI TRƯƠNG ĐẶC BIỆT:**
✅ Giảm 20% tất cả mặt hàng trong tuần đầu tiên
✅ Tặng kèm quà tặng cho 100 khách hàng đầu tiên
✅ Mua 2 tặng 1 cho các sản phẩm chọn lọc
✅ Tích điểm thành viên VIP ngay từ lần mua đầu tiên
✅ Miễn phí giao hàng tận nhà trong bán kính 5km

**🕐 GIỜ MỞ CỬA:**
- Thứ 2 - Chủ nhật: 6:00 - 22:00
- Không nghỉ các ngày lễ, tết

**📍 ĐỊA CHỈ:**
Thôn 2, Xã Nhân Cơ, Huyện Kon Tum, Tỉnh Kon Tum

**📞 LIÊN HỆ:**
- Hotline: 0905.123.456
- Zalo: 0905.123.456
- Facebook: Tạp hóa Minh Phát

Hãy đến và trải nghiệm dịch vụ tuyệt vời của chúng tôi! Cảm ơn quý khách hàng đã tin tưởng và ủng hộ.`,
      image: 'https://readdy.ai/api/search-image?query=Vietnamese%20grocery%20store%20grand%20opening%20celebration%20with%20colorful%20banners%2C%20fresh%20products%20display%2C%20traditional%20Vietnamese%20village%20setting%2C%20festive%20atmosphere%20with%20red%20and%20gold%20decorations&width=800&height=500&seq=store1&orientation=landscape',
      images: [
        'https://readdy.ai/api/search-image?query=Vietnamese%20grocery%20store%20grand%20opening%20celebration%20with%20colorful%20banners%2C%20fresh%20products%20display%2C%20traditional%20Vietnamese%20village%20setting%2C%20festive%20atmosphere%20with%20red%20and%20gold%20decorations&width=800&height=500&seq=store1&orientation=landscape',
        'https://readdy.ai/api/search-image?query=Vietnamese%20grocery%20store%20interior%20with%20shelves%20full%20of%20products%2C%20clean%20organized%20layout%2C%20modern%20lighting%2C%20professional%20retail%20environment&width=800&height=500&seq=store2&orientation=landscape',
        'https://readdy.ai/api/search-image?query=Vietnamese%20fresh%20vegetables%20and%20fruits%20display%20in%20grocery%20store%2C%20colorful%20produce%20section%2C%20healthy%20food%20arrangement&width=800&height=500&seq=store3&orientation=landscape'
      ],
      startDate: '2024-12-15',
      endDate: '2024-12-25',
      location: 'Thôn 2, Xã Nhân Cơ, Kon Tum',
      address: 'Thôn 2, Xã Nhân Cơ, Huyện Kon Tum, Tỉnh Kon Tum',
      contactName: 'Anh Minh',
      contactPhone: '0905123456',
      contactEmail: 'minhphat.grocery@gmail.com',
      website: 'https://facebook.com/taphoaminhphat',
      owner: {
        name: 'Nguyễn Văn Minh',
        avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20middle%20aged%20man%20business%20owner%20portrait%20smiling%20friendly%20expression%20wearing%20casual%20shirt%2C%20professional%20headshot%20style&width=100&height=100&seq=owner1&orientation=squarish',
        phone: '0905123456',
        userId: 'owner123'
      },
      promotions: [
        'Giảm 20% tất cả mặt hàng trong tuần đầu',
        'Tặng kèm quà cho 100 khách hàng đầu tiên',
        'Mua 2 tặng 1 cho các sản phẩm chọn lọc',
        'Tích điểm thành viên VIP',
        'Miễn phí giao hàng tận nhà trong bán kính 5km'
      ],
      isSponsored: true,
      isPinned: true,
      views: 245,
      createdAt: '2024-12-10',
      status: 'active',
      businessHours: 'Thứ 2 - Chủ nhật: 6:00 - 22:00'
    },
    {
      id: 2,
      title: 'Khuyến mãi lớn - Giảm giá 50% máy nông nghiệp',
      category: 'promotion',
      type: 'Khuyến mãi',
      businessName: 'Cửa hàng máy nông nghiệp Thành Đạt',
      description: 'Chương trình khuyến mãi lớn nhất trong năm! Giảm giá lên đến 50% cho tất cả máy móc nông nghiệp, máy cày, máy gặt, máy phun thuốc. Cơ hội tuyệt vời để nâng cấp trang thiết bị canh tác.',
      fullDescription: `🚜 **KHUYẾN MÃI LỚN - GIẢM GIÁ ĐẾN 50% MÁY NÔNG NGHIỆP** 🚜

Cửa hàng máy nông nghiệp Thành Đạt tự hào mang đến chương trình khuyến mãi lớn nhất trong năm với mức giảm giá lên đến 50% cho tất cả các loại máy móc nông nghiệp.

**🔧 SẢN PHẨM KHUYẾN MÃI:**

**Máy cày mini:**
- Giảm 50% từ 25 triệu xuống còn 12.5 triệu
- Công suất 8-12 HP
- Bảo hành 2 năm

**Máy gặt lúa:**
- Giảm 30% từ 45 triệu xuống còn 31.5 triệu  
- Năng suất 0.5-1 ha/ngày
- Bảo hành 3 năm

**Máy phun thuốc:**
- Giảm 40% từ 8 triệu xuống còn 4.8 triệu
- Dung tích 16-20 lít
- Bảo hành 1 năm

**Máy xới đất:**
- Giảm 35% từ 15 triệu xuống còn 9.75 triệu
- Độ sâu xới 15-25cm
- Bảo hành 2 năm

**🎁 ƯU ĐÃI THÊM:**
✅ Tặng kèm phụ kiện trị giá 2 triệu đồng
✅ Bảo hành mở rộng thêm 1 năm
✅ Miễn phí vận chuyển và lắp đặt
✅ Hỗ trợ trả góp 0% lãi suất
✅ Đào tạo sử dụng miễn phí

**⏰ THỜI GIAN KHUYẾN MÃI:**
Từ ngày 12/12/2024 đến 31/12/2024

**📍 ĐỊA CHỈ:**
Trung tâm Xã Nhân Cơ, Kon Tum

**📞 LIÊN HỆ:**
- Hotline: 0912.345.678
- Zalo: 0912.345.678

Số lượng có hạn, liên hệ ngay để được tư vấn và đặt hàng!`,
      image: 'https://readdy.ai/api/search-image?query=Vietnamese%20agricultural%20machinery%20store%20promotion%20sale%20with%20tractors%2C%20farming%20equipment%2C%20discount%20banners%2C%20rural%20Vietnam%20setting%2C%20professional%20product%20display&width=800&height=500&seq=machinery1&orientation=landscape',
      images: [
        'https://readdy.ai/api/search-image?query=Vietnamese%20agricultural%20machinery%20store%20promotion%20sale%20with%20tractors%2C%20farming%20equipment%2C%20discount%20banners%2C%20rural%20Vietnam%20setting%2C%20professional%20product%20display&width=800&height=500&seq=machinery1&orientation=landscape',
        'https://readdy.ai/api/search-image?query=Vietnamese%20farming%20tractors%20and%20agricultural%20equipment%20showroom%20display%2C%20modern%20machinery%2C%20professional%20retail%20environment&width=800&height=500&seq=machinery2&orientation=landscape',
        'https://readdy.ai/api/search-image?query=Vietnamese%20farmers%20using%20modern%20agricultural%20machinery%20in%20rice%20field%2C%20productive%20farming%20scene%2C%20rural%20landscape&width=800&height=500&seq=machinery3&orientation=landscape'
      ],
      startDate: '2024-12-12',
      endDate: '2024-12-31',
      location: 'Trung tâm Xã Nhân Cơ, Kon Tum',
      address: 'Số 45 Đường Trần Hưng Đạo, Trung tâm Xã Nhân Cơ, Kon Tum',
      contactName: 'Ông Thành',
      contactPhone: '0912345678',
      contactEmail: 'thanhdat.machinery@gmail.com',
      website: 'https://maynongngghiepthanhdat.com',
      owner: {
        name: 'Lê Văn Thành',
        avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20elderly%20man%20business%20owner%20portrait%20confident%20expression%20wearing%20work%20shirt%2C%20experienced%20professional%20headshot&width=100&height=100&seq=owner2&orientation=squarish',
        phone: '0912345678',
        userId: 'owner456'
      },
      promotions: [
        'Giảm 50% máy cày mini',
        'Giảm 30% máy gặt lúa',
        'Tặng kèm phụ kiện trị giá 2 triệu',
        'Bảo hành mở rộng 2 năm',
        'Hỗ trợ trả góp 0% lãi suất'
      ],
      isSponsored: true,
      isPinned: false,
      views: 189,
      createdAt: '2024-12-08',
      status: 'active',
      businessHours: 'Thứ 2 - Thứ 7: 7:00 - 18:00'
    }
  ];

  const ad = mockAds.find(a => a.id === parseInt(adId)) || mockAds[0];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const isNew = (createdAt: string) => {
    const daysDiff = (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 3;
  };

  const handleContactClick = () => {
    setShowContactModal(true);
  };

  const handleCallClick = () => {
    const phoneNumber = ad.contactPhone.replace(/\D/g, '');
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleMessageClick = () => {
    setShowMessengerModal(true);
    setShowContactModal(false);
  };

  const handleContactProfile = () => {
    window.location.href = `/profile/${ad.owner.userId}`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'grand-opening': 'bg-green-100 text-green-700',
      'promotion': 'bg-red-100 text-red-700',
      'new-product': 'bg-blue-100 text-blue-700',
      'service': 'bg-purple-100 text-purple-700',
      'event': 'bg-orange-100 text-orange-700',
      'other': 'bg-gray-100 text-gray-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-orange-600 cursor-pointer">
              Trang chủ
            </Link>
            <i className="ri-arrow-right-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
            <Link href="/advertisements" className="text-gray-500 hover:text-orange-600 cursor-pointer">
              Quảng cáo
            </Link>
            <i className="ri-arrow-right-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
            <span className="text-gray-900">Chi tiết quảng cáo</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Advertisement Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getCategoryColor(ad.category)}`}>
                  {ad.type}
                </span>
                {ad.isSponsored && (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-bold">
                    <i className="ri-vip-crown-fill mr-1"></i>
                    Tài trợ
                  </span>
                )}
                {ad.isPinned && (
                  <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    <i className="ri-pushpin-fill mr-1"></i>
                    Ghim
                  </span>
                )}
                {isNew(ad.createdAt) && (
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                    <i className="ri-star-fill mr-1"></i>
                    MỚI
                  </span>
                )}
              </div>
              
              <div className="text-right text-sm text-gray-600">
                <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                  <i className="ri-eye-line mr-1 text-orange-500"></i>
                  <span className="font-medium">{ad.views} lượt xem</span>
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{ad.title}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-store-line text-orange-600"></i>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">{ad.businessName}</span>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-map-pin-line text-blue-600"></i>
                  </div>
                  <div>
                    <span>{ad.location}</span>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-calendar-line text-green-600"></i>
                  </div>
                  <div>
                    <span>
                      {formatDate(ad.startDate)} - {formatDate(ad.endDate)}
                      {isExpired(ad.endDate) && (
                        <span className="ml-2 text-red-600 font-medium">(Đã hết hạn)</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-phone-line text-purple-600"></i>
                  </div>
                  <div>
                    <span className="font-medium">{ad.contactPhone}</span>
                  </div>
                </div>
                
                {ad.contactEmail && (
                  <div className="flex items-center text-gray-600">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                      <i className="ri-mail-line text-indigo-600"></i>
                    </div>
                    <div>
                      <span>{ad.contactEmail}</span>
                    </div>
                  </div>
                )}
                
                {ad.businessHours && (
                  <div className="flex items-center text-gray-600">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      <i className="ri-time-line text-yellow-600"></i>
                    </div>
                    <div>
                      <span>{ad.businessHours}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {ad.images.map((image, index) => (
                <div key={index} className="rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${ad.title} ${index + 1}`}
                    className="w-full h-64 object-cover object-top hover:scale-105 transition-transform cursor-pointer"
                  />
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                onClick={handleContactClick}
                className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 font-medium whitespace-nowrap cursor-pointer"
              >
                <i className="ri-phone-line w-5 h-5 flex items-center justify-center"></i>
                Liên hệ ngay
              </button>
              
              <button
                onClick={() => setShowMessengerModal(true)}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium whitespace-nowrap cursor-pointer"
              >
                <i className="ri-message-line w-5 h-5 flex items-center justify-center"></i>
                Nhắn tin
              </button>
              
              <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <i className="ri-share-line w-5 h-5 flex items-center justify-center"></i>
              </button>
              
              <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <i className="ri-bookmark-line w-5 h-5 flex items-center justify-center"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Advertisement Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Thông tin chi tiết</h2>
          </div>
          
          <div className="p-6">
            <div className="prose max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {ad.fullDescription}
              </div>
            </div>
          </div>
        </div>

        {/* Promotions */}
        {ad.promotions && ad.promotions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <i className="ri-gift-line text-red-500 mr-2"></i>
                Ưu đãi đặc biệt
              </h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ad.promotions.map((promotion, index) => (
                  <div key={index} className="flex items-center p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <i className="ri-check-line text-white text-sm"></i>
                    </div>
                    <span className="text-gray-800 font-medium">{promotion}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Business Owner Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Thông tin chủ doanh nghiệp</h2>
          </div>
          
          <div className="p-6">
            <div className="flex items-center gap-6">
              <img
                src={ad.owner.avatar}
                alt={ad.owner.name}
                className="w-20 h-20 rounded-full object-cover"
              />
              
              <div className="flex-1">
                <button
                  onClick={handleContactProfile}
                  className="text-xl font-semibold text-gray-900 hover:text-orange-600 transition-colors cursor-pointer"
                >
                  {ad.owner.name}
                </button>
                <div className="text-gray-600 mt-1">
                  <div className="flex items-center gap-1 mb-1">
                    <i className="ri-phone-line text-green-600"></i>
                    <span>{ad.owner.phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <i className="ri-map-pin-line text-blue-600"></i>
                    <span>{ad.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleContactProfile}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Xem thông tin
                </button>
                <button
                  onClick={() => setShowMessengerModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Nhắn tin
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Liên hệ</h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line w-6 h-6 flex items-center justify-center"></i>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={ad.owner.avatar}
                    alt={ad.owner.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{ad.owner.name}</h4>
                    <p className="text-sm text-gray-600">{ad.businessName}</p>
                    <p className="text-sm text-gray-600">{ad.contactPhone}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={handleCallClick}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
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
                    className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-user-line w-5 h-5 flex items-center justify-center"></i>
                    Xem thông tin cá nhân
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messenger Modal */}
      <MessengerModal
        isOpen={showMessengerModal}
        onClose={() => setShowMessengerModal(false)}
        recipientName={ad.owner.name}
        recipientAvatar={ad.owner.avatar}
        recipientPhone={ad.contactPhone}
        productTitle={ad.title}
        productImage={ad.image}
      />
    </div>
  );
}
