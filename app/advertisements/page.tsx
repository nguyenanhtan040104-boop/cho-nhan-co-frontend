
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const categories = [
  { id: 'all', name: 'Tất cả', icon: 'ri-apps-line' },
  { id: 'grand-opening', name: 'Khai trương', icon: 'ri-store-3-line' },
  { id: 'promotion', name: 'Khuyến mãi', icon: 'ri-price-tag-3-line' },
  { id: 'new-product', name: 'Sản phẩm mới', icon: 'ri-star-line' },
  { id: 'service', name: 'Dịch vụ', icon: 'ri-customer-service-2-line' },
  { id: 'event', name: 'Sự kiện', icon: 'ri-calendar-event-line' }
];

export default function AdvertisementsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [advertisements, setAdvertisements] = useState([]);
  const [featuredAds, setFeaturedAds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for advertisements
  const mockAds = [
    {
      id: 1,
      title: 'Khai trương cửa hàng tạp hóa Minh Phát',
      category: 'grand-opening',
      type: 'Khai trương',
      businessName: 'Tạp hóa Minh Phát',
      description: 'Chúng tôi vui mừng thông báo khai trương cửa hàng tạp hóa Minh Phát với đầy đủ các mặt hàng thiết yếu, thực phẩm tươi sống và đồ gia dụng. Khai trương từ ngày 15/12 với nhiều ưu đãi hấp dẫn.',
      image: 'https://readdy.ai/api/search-image?query=Vietnamese%20grocery%20store%20grand%20opening%20celebration%20with%20colorful%20banners%2C%20fresh%20products%20display%2C%20traditional%20Vietnamese%20village%20setting%2C%20festive%20atmosphere%20with%20red%20and%20gold%20decorations&width=400&height=250&seq=store1&orientation=landscape',
      startDate: '2024-12-15',
      endDate: '2024-12-25',
      location: 'Thôn 2, Xã Nhân Cơ, Kon Tum',
      contactName: 'Anh Minh',
      contactPhone: '0905123456',
      promotions: [
        'Giảm 20% tất cả mặt hàng trong tuần đầu',
        'Tặng kèm quà cho 100 khách hàng đầu tiên',
        'Mua 2 tặng 1 cho các sản phẩm chọn lọc'
      ],
      isSponsored: true,
      isPinned: true,
      views: 245,
      createdAt: '2024-12-10',
      status: 'active'
    },
    {
      id: 2,
      title: 'Khuyến mãi lớn - Giảm giá 50% máy nông nghiệp',
      category: 'promotion',
      type: 'Khuyến mãi',
      businessName: 'Cửa hàng máy nông nghiệp Thành Đạt',
      description: 'Chương trình khuyến mãi lớn nhất trong năm! Giảm giá lên đến 50% cho tất cả máy móc nông nghiệp, máy cày, máy gặt, máy phun thuốc. Cơ hội tuyệt vời để nâng cấp trang thiết bị canh tác.',
      image: 'https://readdy.ai/api/search-image?query=Vietnamese%20agricultural%20machinery%20store%20promotion%20sale%20with%20tractors%2C%20farming%20equipment%2C%20discount%20banners%2C%20rural%20Vietnam%20setting%2C%20professional%20product%20display&width=400&height=250&seq=machinery1&orientation=landscape',
      startDate: '2024-12-12',
      endDate: '2024-12-31',
      location: 'Trung tâm Xã Nhân Cơ, Kon Tum',
      contactName: 'Ông Thành',
      contactPhone: '0912345678',
      promotions: [
        'Giảm 50% máy cày mini',
        'Giảm 30% máy gặt lúa',
        'Tặng kèm phụ kiện trị giá 2 triệu',
        'Bảo hành mở rộng 2 năm'
      ],
      isSponsored: true,
      isPinned: false,
      views: 189,
      createdAt: '2024-12-08',
      status: 'active'
    },
    {
      id: 3,
      title: 'Ra mắt dịch vụ giao hàng tận nhà',
      category: 'service',
      type: 'Dịch vụ mới',
      businessName: 'Siêu thị mini Hạnh Phúc',
      description: 'Siêu thị mini Hạnh Phúc chính thức ra mắt dịch vụ giao hàng tận nhà trong bán kính 10km. Đặt hàng qua điện thoại, giao hàng trong vòng 2 giờ. Miễn phí giao hàng cho đơn từ 200k.',
      image: 'https://readdy.ai/api/search-image?query=Vietnamese%20mini%20supermarket%20delivery%20service%20with%20motorcycle%20delivery%2C%20fresh%20groceries%2C%20home%20delivery%20concept%2C%20friendly%20delivery%20person%2C%20rural%20Vietnam%20background&width=400&height=250&seq=delivery1&orientation=landscape',
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      location: 'Xã Nhân Cơ và các xã lân cận',
      contactName: 'Chị Hạnh',
      contactPhone: '0934567890',
      promotions: [
        'Miễn phí giao hàng đơn từ 200k',
        'Giảm 10% cho khách hàng mới',
        'Giao hàng trong vòng 2 giờ'
      ],
      isSponsored: false,
      isPinned: false,
      views: 156,
      createdAt: '2024-12-05',
      status: 'active'
    },
    {
      id: 4,
      title: 'Lễ hội cà phê Robusta - Sự kiện lớn nhất năm',
      category: 'event',
      type: 'Sự kiện',
      businessName: 'Hợp tác xã Cà phê Nhân Cơ',
      description: 'Tham gia Lễ hội cà phê Robusta lần thứ 5 với nhiều hoạt động hấp dẫn: trưng bày sản phẩm, thi pha chế, biểu diễn văn nghệ, và cơ hội giao thương với các đối tác trong và ngoài tỉnh.',
      image: 'https://readdy.ai/api/search-image?query=Vietnamese%20coffee%20festival%20celebration%20with%20robusta%20coffee%20beans%20display%2C%20traditional%20Vietnamese%20festival%20decorations%2C%20coffee%20farmers%2C%20cultural%20performances%2C%20mountain%20landscape%20background&width=400&height=250&seq=coffee-festival1&orientation=landscape',
      startDate: '2024-12-20',
      endDate: '2024-12-22',
      location: 'Trung tâm Văn hóa Xã Nhân Cơ',
      contactName: 'Ông Tấn',
      contactPhone: '0901234567',
      promotions: [
        'Miễn phí tham gia cho tất cả mọi người',
        'Cà phê miễn phí cho 1000 khách đầu tiên',
        'Giảm giá 30% sản phẩm cà phê tại sự kiện'
      ],
      isSponsored: true,
      isPinned: true,
      views: 312,
      createdAt: '2024-12-01',
      status: 'active'
    },
    {
      id: 5,
      title: 'Sản phẩm mới: Gạo hữu cơ cao cấp',
      category: 'new-product',
      type: 'Sản phẩm mới',
      businessName: 'Hợp tác xã Nông nghiệp Xanh',
      description: 'Giới thiệu dòng gạo hữu cơ cao cấp mới được trồng theo tiêu chuẩn quốc tế. Không sử dụng hóa chất, thuốc trừ sâu. Gạo thơm ngon, bổ dưỡng, an toàn cho sức khỏe gia đình.',
      image: 'https://readdy.ai/api/search-image?query=Premium%20organic%20Vietnamese%20rice%20product%20display%20with%20traditional%20rice%20fields%2C%20organic%20farming%2C%20healthy%20food%20packaging%2C%20natural%20green%20environment%2C%20quality%20certification&width=400&height=250&seq=organic-rice1&orientation=landscape',
      startDate: '2024-12-10',
      endDate: '2025-01-10',
      location: 'Các cửa hàng trong xã và online',
      contactName: 'Bà Lan',
      contactPhone: '0945678901',
      promotions: [
        'Giảm 15% cho đơn hàng đầu tiên',
        'Tặng kèm túi đựng cao cấp',
        'Miễn phí giao hàng tận nhà'
      ],
      isSponsored: false,
      isPinned: false,
      views: 98,
      createdAt: '2024-12-07',
      status: 'active'
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setAdvertisements(mockAds);
      setFeaturedAds(mockAds.filter(ad => ad.isPinned));
      setLoading(false);
    }, 1000);
  }, []);

  const filteredAds = selectedCategory === 'all' 
    ? advertisements 
    : advertisements.filter(ad => ad.category === selectedCategory);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isExpired = (endDate) => {
    return new Date(endDate) < new Date();
  };

  const isNew = (createdAt) => {
    const daysDiff = (new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24);
    return daysDiff <= 3;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Đang tải quảng cáo...</p>
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 rounded-3xl p-8 lg:p-12 text-white mb-12 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full"></div>
          
          <div className="relative z-10 max-w-4xl">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-4 backdrop-blur-sm">
                <i className="ri-megaphone-line text-3xl text-white"></i>
              </div>
              <div>
                <h1 className="text-3xl lg:text-5xl font-bold mb-2">
                  Quảng cáo & Khai trương
                </h1>
                <div className="flex items-center space-x-4 text-orange-100">
                  <span className="flex items-center">
                    <i className="ri-store-line mr-2"></i>
                    Doanh nghiệp địa phương
                  </span>
                  <span className="flex items-center">
                    <i className="ri-fire-line mr-2"></i>
                    Ưu đãi hấp dẫn
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-xl lg:text-2xl text-orange-100 mb-8 leading-relaxed">
              Nơi các doanh nghiệp, cửa hàng quảng bá sản phẩm, dịch vụ và thông báo khai trương
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/advertisements/create"
                className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 cursor-pointer text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <i className="ri-add-line mr-2"></i>
                Đăng quảng cáo ngay
              </Link>
              <Link
                href="/pricing"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all duration-300 cursor-pointer text-center backdrop-blur-sm"
              >
                <i className="ri-price-tag-line mr-2"></i>
                Xem bảng giá
              </Link>
            </div>
          </div>
        </div>

        {/* Featured Ads */}
        {featuredAds.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                  <i className="ri-pushpin-line text-white text-xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    Quảng cáo nổi bật
                  </h2>
                  <p className="text-gray-600">Được ưu tiên hiển thị và nhiều người quan tâm</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredAds.slice(0, 2).map(ad => (
                <div key={ad.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-orange-200 hover:border-orange-400 transform hover:-translate-y-2">
                  <div className="relative overflow-hidden">
                    <img 
                      src={ad.image} 
                      alt={ad.title}
                      className="w-full h-56 lg:h-64 object-cover object-top group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    
                    <div className="absolute top-4 left-4 flex space-x-2">
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        <i className="ri-megaphone-line mr-1"></i>
                        Quảng cáo
                      </span>
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        <i className="ri-pushpin-fill mr-1"></i>
                        Ghim
                      </span>
                    </div>
                    
                    {isNew(ad.createdAt) && (
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                          <i className="ri-star-fill mr-1"></i>
                          MỚI
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold border border-orange-200">
                          {ad.type}
                        </span>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                          <i className="ri-eye-line mr-1 text-orange-500"></i>
                          <span className="font-medium">{ad.views} lượt xem</span>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {ad.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                      {ad.description}
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                          <i className="ri-store-line text-orange-600"></i>
                        </div>
                        <span className="font-medium">{ad.businessName}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <i className="ri-map-pin-line text-blue-600"></i>
                        </div>
                        <span>{ad.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <i className="ri-calendar-line text-green-600"></i>
                        </div>
                        <span>
                          {formatDate(ad.startDate)} - {formatDate(ad.endDate)}
                          {isExpired(ad.endDate) && (
                            <span className="ml-2 text-red-600 font-medium">(Đã hết hạn)</span>
                          )}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/advertisements/${ad.id}`}
                        className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
                      >
                        <i className="ri-eye-line mr-2"></i>
                        Xem chi tiết
                      </Link>
                      <div className="flex items-center space-x-3">
                        <button className="w-10 h-10 bg-gray-100 hover:bg-orange-100 rounded-lg flex items-center justify-center text-gray-600 hover:text-orange-600 transition-colors cursor-pointer">
                          <i className="ri-share-line"></i>
                        </button>
                        <button className="w-10 h-10 bg-gray-100 hover:bg-orange-100 rounded-lg flex items-center justify-center text-gray-600 hover:text-orange-600 transition-colors cursor-pointer">
                          <i className="ri-bookmark-line"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                <i className="ri-apps-line text-white text-xl"></i>
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Tất cả quảng cáo</h2>
                <p className="text-gray-600">Khám phá các cơ hội kinh doanh trong khu vực</p>
              </div>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl shadow-md border">
              <span className="text-sm text-gray-600">Tổng cộng: </span>
              <span className="font-bold text-orange-600">{filteredAds.length} quảng cáo</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 lg:gap-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:-translate-y-1 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-orange-50 border-2 border-gray-200 hover:border-orange-300 shadow-md hover:shadow-lg'
                }`}
              >
                <i className={`${category.icon} mr-2 text-lg`}></i>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Advertisements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAds.map(ad => (
            <div key={ad.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200 hover:border-orange-300 transform hover:-translate-y-2">
              <div className="relative overflow-hidden">
                <img 
                  src={ad.image} 
                  alt={ad.title}
                  className="w-full h-48 object-cover object-top group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                
                <div className="absolute top-3 left-3">
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {ad.type}
                  </span>
                </div>
                
                {ad.isSponsored && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      <i className="ri-vip-crown-fill mr-1"></i>
                      Tài trợ
                    </span>
                  </div>
                )}
                
                {isNew(ad.createdAt) && (
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                      <i className="ri-star-fill mr-1"></i>
                      MỚI
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 text-lg group-hover:text-orange-600 transition-colors">
                  {ad.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {ad.description}
                </p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-2">
                      <i className="ri-store-line text-orange-600 text-xs"></i>
                    </div>
                    <span className="font-medium truncate">{ad.businessName}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                      <i className="ri-map-pin-line text-blue-600 text-xs"></i>
                    </div>
                    <span className="truncate">{ad.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                      <i className="ri-calendar-line text-green-600 text-xs"></i>
                    </div>
                    <span className="truncate">
                      {formatDate(ad.startDate)} - {formatDate(ad.endDate)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Link
                    href={`/advertisements/${ad.id}`}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 text-sm font-bold shadow-md hover:shadow-lg transform hover:-translate-y-1 cursor-pointer"
                  >
                    Xem chi tiết
                  </Link>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center bg-gray-100 px-2 py-1 rounded-lg">
                      <i className="ri-eye-line mr-1 text-xs text-orange-500"></i>
                      <span className="text-xs font-medium text-gray-600">{ad.views}</span>
                    </div>
                    <button className="w-8 h-8 bg-gray-100 hover:bg-orange-100 rounded-lg flex items-center justify-center text-gray-600 hover:text-orange-600 transition-colors cursor-pointer">
                      <i className="ri-share-line text-xs"></i>
                    </button>
                    <button className="w-8 h-8 bg-gray-100 hover:bg-orange-100 rounded-lg flex items-center justify-center text-gray-600 hover:text-orange-600 transition-colors cursor-pointer">
                      <i className="ri-bookmark-line text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAds.length === 0 && (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <i className="ri-megaphone-line text-6xl text-orange-400"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Chưa có quảng cáo nào
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              Hãy là người đầu tiên đăng quảng cáo trong danh mục này
            </p>
            <Link
              href="/advertisements/create"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
            >
              <i className="ri-add-line mr-2"></i>
              Đăng quảng cáo ngay
            </Link>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 rounded-3xl p-12 text-white text-center overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
          <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-white/5 rounded-full"></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <i className="ri-rocket-line text-4xl text-white"></i>
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Bạn muốn quảng bá doanh nghiệp của mình?
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Đăng quảng cáo để tiếp cận hàng nghìn khách hàng tiềm năng trong khu vực. 
              Nhiều gói quảng cáo linh hoạt phù hợp với mọi ngân sách.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="ri-eye-line text-2xl text-white"></i>
                </div>
                <h3 className="font-bold text-lg mb-2">Tiếp cận rộng</h3>
                <p className="text-orange-100 text-sm">Hàng nghìn người xem mỗi ngày</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="ri-price-tag-line text-2xl text-white"></i>
                </div>
                <h3 className="font-bold text-lg mb-2">Giá cả hợp lý</h3>
                <p className="text-orange-100 text-sm">Từ miễn phí đến gói VIP</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="ri-customer-service-line text-2xl text-white"></i>
                </div>
                <h3 className="font-bold text-lg mb-2">Hỗ trợ 24/7</h3>
                <p className="text-orange-100 text-sm">Đội ngũ hỗ trợ chuyên nghiệp</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/advertisements/create"
                className="bg-white text-orange-600 px-10 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <i className="ri-add-line mr-2"></i>
                Đăng quảng cáo miễn phí
              </Link>
              <Link
                href="/pricing"
                className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold hover:bg-white/10 transition-all duration-300 cursor-pointer backdrop-blur-sm"
              >
                <i className="ri-price-tag-line mr-2"></i>
                Xem bảng giá
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
