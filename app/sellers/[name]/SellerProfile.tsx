
'use client';

import { useState } from 'react';
import Link from 'next/link';

const mockSellers = {
  'Nguyễn Văn A': {
    name: 'Nguyễn Văn A',
    avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20farmer%20portrait%20smiling%20face%20middle%20aged%20man%2C%20friendly%20person%20wearing%20traditional%20Vietnamese%20farmer%20hat%2C%20professional%20headshot%20style%2C%20rural%20background&width=200&height=200&seq=seller001&orientation=squarish',
    coverImage: 'https://readdy.ai/api/search-image?query=Vietnamese%20rice%20farm%20landscape%20green%20paddy%20fields%2C%20traditional%20farming%20countryside%2C%20beautiful%20rural%20scenery%20with%20mountains%20background%2C%20peaceful%20agricultural%20environment&width=800&height=300&seq=farm001&orientation=landscape',
    phone: '0912345678',
    location: 'Xã Nhân Cơ, Huyện Kon Rẫy, Kon Tum',
    rating: 4.8,
    totalProducts: 15,
    joinDate: '2023',
    totalSold: 1250,
    responseTime: '2 giờ',
    isVip: true,
    vipExpiry: '30/12/2024',
    description: 'Tôi là nông dân có 15 năm kinh nghiệm trồng lúa và các loại cây trồng khác tại vùng đất An Giang. Chuyên cung cấp gạo Tám Xoan chất lượng cao, được trồng trên vùng đất phù sa màu mỡ. Cam kết sản phẩm sạch, không hóa chất độc hại.',
    specialties: ['Gạo Tám Xoan', 'Lúa giống', 'Rau sạch', 'Trái cây vùng miền'],
    achievements: [
      'Top seller tháng 11/2024',
      'Sản phẩm được yêu thích nhất',
      '500+ đánh giá tích cực'
    ],
    workingHours: 'Thứ 2 - Chủ nhật: 6:00 - 18:00',
    socialLinks: {
      facebook: 'https://facebook.com/nguyenvana',
      zalo: '0912345678'
    }
  },
  'Trần Thị B': {
    name: 'Trần Thị B',
    avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20female%20farmer%20portrait%20smiling%20face%20middle%20aged%20woman%2C%20traditional%20Vietnamese%20farming%20attire%2C%20friendly%20person%20headshot%20style%2C%20rural%20background&width=200&height=200&seq=seller002&orientation=squarish',
    coverImage: 'https://readdy.ai/api/search-image?query=Vietnamese%20pig%20farm%20livestock%20farming%2C%20clean%20modern%20pig%20farming%20facility%2C%20rural%20agriculture%20setting%2C%20professional%20livestock%20management&width=800&height=300&seq=farm002&orientation=landscape',
    phone: '0987654321',
    location: 'Xã An Bình, Huyện Tam Nông, Đồng Tháp',
    rating: 4.5,
    totalProducts: 8,
    joinDate: '2023',
    totalSold: 856,
    responseTime: '4 giờ',
    isVip: false,
    description: 'Chuyên chăn nuôi heo thịt sạch theo quy trình khép kín. Trang trại của tôi tuân thủ các tiêu chuẩn về vệ sinh an toàn thực phẩm, thức ăn chăn nuôi không chất kích thích tăng trường.',
    specialties: ['Heo thịt sạch', 'Thịt tươi', 'Sản phẩm chăn nuôi'],
    achievements: [
      'Chứng nhận VietGAP',
      '200+ khách hàng tin tưởng'
    ],
    workingHours: 'Thứ 2 - Thứ 7: 7:00 - 17:00',
    socialLinks: {
      zalo: '0987654321'
    }
  }
};

const mockProducts = [
  {
    id: 1,
    name: 'Gạo Tám Xoan ngon',
    price: 25000,
    unit: 'kg',
    image: 'https://readdy.ai/api/search-image?query=Premium%20Vietnamese%20rice%20grains%20in%20white%20cloth%20bag%2C%20simple%20clean%20background%2C%20product%20photography%20style%2C%20natural%20lighting%2C%20minimalist%20composition&width=300&height=300&seq=rice001&orientation=squarish',
    seller: 'Nguyễn Văn A',
    rating: 4.8,
    soldCount: 120,
    isVip: true
  },
  {
    id: 4,
    name: 'Rau xanh hữu cơ',
    price: 35000,
    unit: 'kg',
    image: 'https://readdy.ai/api/search-image?query=Fresh%20organic%20green%20vegetables%20leafy%20greens%20in%20basket%2C%20farm%20fresh%20produce%2C%20natural%20lighting%2C%20clean%20background%2C%20healthy%20food%20photography&width=300&height=300&seq=vegetables001&orientation=squarish',
    seller: 'Nguyễn Văn A',
    rating: 4.7,
    soldCount: 95,
    isVip: false
  },
  {
    id: 2,
    name: 'Heo thịt sạch 15kg',
    price: 180000,
    unit: 'kg',
    image: 'https://readdy.ai/api/search-image?query=Fresh%20pork%20meat%20cuts%20on%20clean%20white%20surface%2C%20butcher%20shop%20style%2C%20professional%20food%20photography%2C%20clean%20background%2C%20good%20lighting&width=300&height=300&seq=pork001&orientation=squarish',
    seller: 'Trần Thị B',
    rating: 4.5,
    soldCount: 85,
    isVip: false
  }
];

const mockReviews = [
  {
    id: 1,
    customerName: 'Lê Văn C',
    rating: 5,
    comment: 'Gạo rất ngon, hạt dẻo thơm. Chú A bán hàng rất uy tín, giao hàng đúng hẹn.',
    date: '2 ngày trước',
    productName: 'Gạo Tám Xoan ngon',
    avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20customer%20portrait%20smiling%20face%2C%20professional%20headshot%20style%2C%20friendly%20person&width=50&height=50&seq=customer001&orientation=squarish'
  },
  {
    id: 2,
    customerName: 'Phạm Thị D',
    rating: 5,
    comment: 'Rau sạch, tươi ngon. Rất hài lòng với chất lượng sản phẩm.',
    date: '5 ngày trước',
    productName: 'Rau xanh hữu cơ',
    avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20female%20customer%20portrait%20smiling%20face%2C%20professional%20headshot%20style%2C%20friendly%20person&width=50&height=50&seq=customer002&orientation=squarish'
  },
  {
    id: 3,
    customerName: 'Hoàng Văn E',
    rating: 4,
    comment: 'Sản phẩm tốt, giá cả hợp lý. Sẽ ủng hộ lâu dài.',
    date: '1 tuần trước',
    productName: 'Gạo Tám Xoan ngon',
    avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20male%20customer%20portrait%20smiling%20face%2C%20professional%20headshot%20style%2C%20friendly%20person&width=50&height=50&seq=customer003&orientation=squarish'
  }
];

interface SellerProfileProps {
  sellerName: string;
}

export default function SellerProfile({ sellerName }: SellerProfileProps) {
  const [activeTab, setActiveTab] = useState('products');
  const [showContactModal, setShowContactModal] = useState(false);
  
  const seller = mockSellers[sellerName] || mockSellers['Nguyễn Văn A'];
  const sellerProducts = mockProducts.filter(p => p.seller === seller.name);
  const sellerReviews = mockReviews.filter(r => sellerProducts.some(p => p.name === r.productName));

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
    const phoneNumber = seller.phone.replace(/\D/g, '');
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleZaloClick = () => {
    const phoneNumber = seller.phone.replace(/\D/g, '');
    window.open(`https://zalo.me/${phoneNumber}`, '_blank');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <i
        key={index}
        className={`w-4 h-4 flex items-center justify-center ${
          index < Math.floor(rating)
            ? 'ri-star-fill text-yellow-400'
            : index < rating
            ? 'ri-star-half-fill text-yellow-400'
            : 'ri-star-line text-gray-300'
        }`}
      ></i>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-green-600 cursor-pointer">
              Trang chủ
            </Link>
            <i className="ri-arrow-right-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
            <Link href="/products" className="text-gray-500 hover:text-green-600 cursor-pointer">
              Sản phẩm
            </Link>
            <i className="ri-arrow-right-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
            <span className="text-gray-900">Thông tin người bán</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Seller Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="h-48 overflow-hidden">
            <img
              src={seller.coverImage}
              alt={`Trang trại ${seller.name}`}
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Profile Info */}
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Avatar & Basic Info */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={seller.avatar}
                    alt={seller.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  {seller.isVip && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-1 rounded-full">
                      <i className="ri-vip-crown-fill w-4 h-4 flex items-center justify-center"></i>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{seller.name}</h1>
                    {seller.isVip && (
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        VIP
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
                      <span className="font-medium">{seller.rating}</span>
                      <span>({sellerReviews.length} đánh giá)</span>
                    </div>
                    <span>|</span>
                    <div className="flex items-center gap-1">
                      <i className="ri-map-pin-line w-4 h-4 flex items-center justify-center"></i>
                      <span>{seller.location}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">{seller.totalProducts}</div>
                      <div className="text-blue-600">Sản phẩm</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">{seller.totalSold}</div>
                      <div className="text-green-600">Đã bán</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-xl font-bold text-purple-600">{seller.responseTime}</div>
                      <div className="text-purple-600">Phản hồi</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-xl font-bold text-orange-600">{seller.joinDate}</div>
                      <div className="text-orange-600">Tham gia</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 lg:w-48">
                <button
                  onClick={handleContactClick}
                  className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-phone-line w-5 h-5 flex items-center justify-center"></i>
                  Liên hệ ngay
                </button>
                <button className="border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium whitespace-nowrap cursor-pointer">
                  <i className="ri-chat-3-line w-5 h-5 flex items-center justify-center"></i>
                  Nhắn tin
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm mb-6">
              <div className="border-b">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`px-6 py-4 font-medium transition-colors ${
                      activeTab === 'products'
                        ? 'text-green-600 border-b-2 border-green-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Sản phẩm ({sellerProducts.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('about')}
                    className={`px-6 py-4 font-medium transition-colors ${
                      activeTab === 'about'
                        ? 'text-green-600 border-b-2 border-green-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Giới thiệu
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-6 py-4 font-medium transition-colors ${
                      activeTab === 'reviews'
                        ? 'text-green-600 border-b-2 border-green-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Đánh giá ({sellerReviews.length})
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {/* Products Tab */}
                {activeTab === 'products' && (
                  <div>
                    {sellerProducts.length === 0 ? (
                      <div className="text-center py-12">
                        <i className="ri-shopping-bag-line text-gray-300 text-6xl mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có sản phẩm</h3>
                        <p className="text-gray-600">Người bán này chưa đăng sản phẩm nào</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sellerProducts.map(product => (
                          <Link key={product.id} href={`/products/${product.id}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group">
                            <div className="flex gap-4">
                              <div className="relative">
                                {product.isVip && (
                                  <div className="absolute -top-2 -left-2 z-10">
                                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                      <i className="ri-vip-crown-fill w-3 h-3 flex items-center justify-center"></i>
                                      VIP
                                    </div>
                                  </div>
                                )}
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                                  {product.name}
                                </h4>
                                <div className="text-lg font-bold text-green-600 mb-2">
                                  {formatPrice(product.price)}
                                  <span className="text-sm text-gray-500 font-normal">/{product.unit}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
                                    <span>{product.rating}</span>
                                  </div>
                                  <span>Đã bán {product.soldCount}</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* About Tab */}
                {activeTab === 'about' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Giới thiệu</h3>
                      <p className="text-gray-700 leading-relaxed">{seller.description}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Chuyên môn</h3>
                      <div className="flex flex-wrap gap-2">
                        {seller.specialties.map((specialty, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    {seller.achievements && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Thành tích</h3>
                        <div className="space-y-2">
                          {seller.achievements.map((achievement, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <i className="ri-medal-line text-yellow-500 w-5 h-5 flex items-center justify-center"></i>
                              <span className="text-gray-700">{achievement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Giờ làm việc</h3>
                      <div className="flex items-center gap-2">
                        <i className="ri-time-line text-gray-500 w-5 h-5 flex items-center justify-center"></i>
                        <span className="text-gray-700">{seller.workingHours}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    {sellerReviews.length === 0 ? (
                      <div className="text-center py-12">
                        <i className="ri-chat-3-line text-gray-300 text-6xl mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đánh giá</h3>
                        <p className="text-gray-600">Hãy là người đầu tiên đánh giá người bán này</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Rating Summary */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-gray-900">{seller.rating}</div>
                              <div className="flex items-center justify-center gap-1 mb-1">
                                {renderStars(seller.rating)}
                              </div>
                              <div className="text-sm text-gray-600">{sellerReviews.length} đánh giá</div>
                            </div>
                            <div className="flex-1">
                              {[5, 4, 3, 2, 1].map(star => {
                                const count = sellerReviews.filter(r => r.rating === star).length;
                                const percentage = sellerReviews.length > 0 ? (count / sellerReviews.length) * 100 : 0;
                                return (
                                  <div key={star} className="flex items-center gap-2 mb-1">
                                    <span className="text-sm text-gray-600 w-6">{star}</span>
                                    <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-yellow-400 h-2 rounded-full"
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm text-gray-600 w-8">{count}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Reviews List */}
                        <div className="space-y-4">
                          {sellerReviews.map(review => (
                            <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                              <div className="flex items-start gap-3">
                                <img
                                  src={review.avatar}
                                  alt={review.customerName}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-medium text-gray-900">{review.customerName}</h4>
                                    <div className="flex items-center gap-1">
                                      {renderStars(review.rating)}
                                    </div>
                                    <span className="text-sm text-gray-500">{review.date}</span>
                                  </div>
                                  <p className="text-gray-700 mb-2">{review.comment}</p>
                                  <p className="text-sm text-gray-500">Sản phẩm: {review.productName}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên hệ</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <i className="ri-phone-line text-green-600 w-5 h-5 flex items-center justify-center"></i>
                  <div>
                    <p className="text-sm text-gray-600">Điện thoại</p>
                    <p className="font-medium text-gray-900">{seller.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <i className="ri-map-pin-line text-green-600 w-5 h-5 flex items-center justify-center mt-0.5"></i>
                  <div>
                    <p className="text-sm text-gray-600">Địa chỉ</p>
                    <p className="font-medium text-gray-900">{seller.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <i className="ri-time-line text-green-600 w-5 h-5 flex items-center justify-center"></i>
                  <div>
                    <p className="text-sm text-gray-600">Thời gian phản hồi</p>
                    <p className="font-medium text-gray-900">Trung bình {seller.responseTime}</p>
                  </div>
                </div>

                {seller.isVip && (
                  <div className="flex items-center gap-3">
                    <i className="ri-vip-crown-fill text-yellow-500 w-5 h-5 flex items-center justify-center"></i>
                    <div>
                      <p className="text-sm text-gray-600">Trạng thái VIP</p>
                      <p className="font-medium text-yellow-600">Còn hiệu lực đến {seller.vipExpiry}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Liên hệ qua</h4>
                <div className="flex gap-3">
                  {seller.socialLinks?.zalo && (
                    <button
                      onClick={handleZaloClick}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-message-line w-4 h-4 flex items-center justify-center"></i>
                      Zalo
                    </button>
                  )}
                  {seller.socialLinks?.facebook && (
                    <button
                      onClick={() => window.open(seller.socialLinks.facebook, '_blank')}
                      className="flex-1 bg-blue-800 text-white py-2 px-4 rounded-lg hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-facebook-fill w-4 h-4 flex items-center justify-center"></i>
                      Facebook
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cam kết chất lượng</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <i className="ri-shield-check-fill text-green-600 w-5 h-5 flex items-center justify-center"></i>
                  <span className="text-sm text-gray-700">Sản phẩm chính hãng</span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="ri-truck-line text-green-600 w-5 h-5 flex items-center justify-center"></i>
                  <span className="text-sm text-gray-700">Giao hàng tận nơi</span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="ri-customer-service-2-line text-green-600 w-5 h-5 flex items-center justify-center"></i>
                  <span className="text-sm text-gray-700">Hỗ trợ 24/7</span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="ri-money-dollar-circle-line text-green-600 w-5 h-5 flex items-center justify-center"></i>
                  <span className="text-sm text-gray-700">Giá cả hợp lý</span>
                </div>
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
                <h3 className="text-lg font-semibold text-gray-900">Liên hệ {seller.name}</h3>
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
                    src={seller.avatar}
                    alt={seller.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{seller.name}</h4>
                    <p className="text-sm text-gray-600">{seller.phone}</p>
                    <p className="text-xs text-gray-500">Phản hồi trong {seller.responseTime}</p>
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
                  
                  {seller.socialLinks?.zalo && (
                    <button
                      onClick={handleZaloClick}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-message-line w-5 h-5 flex items-center justify-center"></i>
                      Nhắn tin Zalo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
