'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function VipProductsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<'guest' | 'member' | 'vip'>('guest');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ code: '', phone: '' });

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập từ localStorage
    const savedAuth = localStorage.getItem('vip_auth');
    const savedUserType = localStorage.getItem('user_type');
    if (savedAuth === 'true' && savedUserType) {
      setIsAuthenticated(true);
      setUserType(savedUserType as 'member' | 'vip');
    }
  }, []);

  const vipProducts = [
    {
      id: 1,
      name: 'Cà phê Arabica hạt đặc biệt',
      price: '850.000',
      originalPrice: '1.200.000',
      discount: '29%',
      seller: 'Nông trại Ea Knốp Premium',
      rating: 4.9,
      reviews: 156,
      sold: 234,
      isVip: true,
      isMember: false,
      image: 'https://readdy.ai/api/search-image?query=premium%20arabica%20coffee%20beans%20in%20elegant%20packaging%20with%20golden%20seal%2C%20high%20quality%20roasted%20coffee%20beans%20in%20luxury%20container%2C%20professional%20product%20photography%20with%20rich%20brown%20colors%20and%20sophisticated%20branding&width=300&height=300&seq=vip1&orientation=squarish',
      badge: 'VIP EXCLUSIVE',
      features: ['Hạt được tuyển chọn thủ công', 'Rang theo công thức bí mật', 'Chỉ 50kg/tháng', 'Đóng gói chân không cao cấp']
    },
    {
      id: 2, 
      name: 'Hồ tiêu đen hạt to Premium',
      price: '420.000',
      originalPrice: '580.000',
      discount: '28%',
      seller: 'HTX Hồ tiêu Ea H\'leo Elite',
      rating: 4.8,
      reviews: 89,
      sold: 167,
      isVip: true,
      isMember: false,
      image: 'https://readdy.ai/api/search-image?query=premium%20black%20pepper%20peppercorns%20in%20luxury%20glass%20jar%20with%20gold%20lid%2C%20high%20quality%20whole%20black%20pepper%20spices%2C%20elegant%20packaging%20with%20premium%20label%20and%20sophisticated%20presentation&width=300&height=300&seq=vip2&orientation=squarish',
      badge: 'VIP EXCLUSIVE',
      features: ['Hạt to đều, không tạp chất', 'Độ cay chuẩn quốc tế', 'Bảo quản chân không', 'Chứng nhận organic']
    },
    {
      id: 3,
      name: 'Mật ong rừng nguyên chất U Minh',
      price: '680.000',
      originalPrice: '850.000', 
      discount: '20%',
      seller: 'Hợp tác xã Mật ong U Minh',
      rating: 4.9,
      reviews: 234,
      sold: 89,
      isVip: false,
      isMember: true,
      image: 'https://readdy.ai/api/search-image?query=pure%20wild%20forest%20honey%20in%20elegant%20glass%20bottle%20with%20wooden%20dipper%2C%20golden%20amber%20colored%20honey%2C%20luxury%20packaging%20with%20nature-inspired%20design%20and%20premium%20labeling&width=300&height=300&seq=member1&orientation=squarish',
      badge: 'MEMBER ONLY',
      features: ['100% mật ong rừng tự nhiên', 'Không pha trộn', 'Thu hoạch 1 năm/lần', 'Kiểm định chất lượng']
    },
    {
      id: 4,
      name: 'Gạo ST25 hạt dài cao cấp',
      price: '180.000',
      originalPrice: '220.000',
      discount: '18%',
      seller: 'Nông trại An Giang Premium',
      rating: 4.7,
      reviews: 445,
      sold: 678,
      isVip: false,
      isMember: true,
      image: 'https://readdy.ai/api/search-image?query=premium%20ST25%20rice%20grains%20in%20elegant%20packaging%20bag%20with%20golden%20design%2C%20high%20quality%20long%20grain%20white%20rice%2C%20professional%20product%20photography%20with%20luxury%20branding%20and%20Vietnamese%20agricultural%20heritage&width=300&height=300&seq=member2&orientation=squarish',
      badge: 'MEMBER ONLY',
      features: ['Giống lúa ST25 đạt giải thưởng', 'Hạt dài, thơm ngon', 'Không chất bảo quản', 'Đóng gói chân không']
    },
    {
      id: 5,
      name: 'Trà Shan Tuyết cổ thư 200 năm',
      price: '2.800.000',
      originalPrice: '3.500.000',
      discount: '20%',
      seller: 'Trà Shan Tuyết Tà Xùa',
      rating: 5.0,
      reviews: 23,
      sold: 12,
      isVip: true,
      isMember: false,
      image: 'https://readdy.ai/api/search-image?query=ancient%20Shan%20Tuyet%20tea%20leaves%20in%20luxury%20wooden%20box%20with%20traditional%20Vietnamese%20craftsmanship%2C%20premium%20aged%20tea%20packaging%20with%20golden%20accents%20and%20elegant%20presentation&width=300&height=300&seq=vip3&orientation=squarish',
      badge: 'ULTRA VIP',
      features: ['Trà từ cây cổ thụ 200 năm', 'Hái thủ công', 'Giới hạn 5kg/năm', 'Chứng nhận nguồn gốc']
    },
    {
      id: 6,
      name: 'Nấm linh chi đỏ khô Đà Lạt',
      price: '950.000',
      originalPrice: '1.250.000',
      discount: '24%',
      seller: 'Nông trại Nấm Đà Lạt Organic',
      rating: 4.8,
      reviews: 167,
      sold: 234,
      isVip: false,
      isMember: true,
      image: 'https://readdy.ai/api/search-image?query=premium%20dried%20red%20reishi%20mushrooms%20in%20luxury%20glass%20container%20with%20wooden%20lid%2C%20high%20quality%20organic%20lingzhi%20mushrooms%2C%20elegant%20packaging%20with%20health%20benefits%20labeling%20and%20sophisticated%20presentation&width=300&height=300&seq=member3&orientation=squarish',
      badge: 'MEMBER ONLY',
      features: ['Nấm linh chi đỏ nguyên chất', 'Trồng theo tiêu chuẩn organic', 'Sấy khô tự nhiên', 'Đóng gói chân không']
    }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mã VIP giả định
    const vipCodes = ['VIP2024', 'PREMIUM01', 'ELITE999'];
    const memberCodes = ['MEMBER01', 'USER2024', 'BASIC123'];
    
    if (vipCodes.includes(loginForm.code.toUpperCase())) {
      setUserType('vip');
      setIsAuthenticated(true);
      localStorage.setItem('vip_auth', 'true');
      localStorage.setItem('user_type', 'vip');
      setShowLoginModal(false);
    } else if (memberCodes.includes(loginForm.code.toUpperCase())) {
      setUserType('member');
      setIsAuthenticated(true);
      localStorage.setItem('vip_auth', 'true');
      localStorage.setItem('user_type', 'member');
      setShowLoginModal(false);
    } else {
      alert('Mã truy cập không hợp lệ!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserType('guest');
    localStorage.removeItem('vip_auth');
    localStorage.removeItem('user_type');
  };

  const getVisibleProducts = () => {
    if (!isAuthenticated) return [];
    if (userType === 'vip') return vipProducts; // VIP thấy tất cả
    if (userType === 'member') return vipProducts.filter(p => p.isMember); // Member chỉ thấy sản phẩm member
    return [];
  };

  const visibleProducts = getVisibleProducts();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-vip-crown-2-line text-white text-3xl"></i>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Khu vực đặc biệt</h1>
            <p className="text-gray-600 mb-8">Chỉ dành cho thành viên VIP và Member</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center text-sm text-gray-600">
                <i className="ri-check-line text-green-500 mr-3"></i>
                <span>Sản phẩm chất lượng cao độc quyền</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <i className="ri-check-line text-green-500 mr-3"></i>
                <span>Giá ưu đãi đặc biệt</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <i className="ri-check-line text-green-500 mr-3"></i>
                <span>Hỗ trợ tư vấn 24/7</span>
              </div>
            </div>

            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all"
            >
              Đăng nhập truy cập
            </button>
            
            <Link href="/products" className="block mt-4 text-sm text-gray-500 hover:text-gray-700">
              ← Quay lại sản phẩm thường
            </Link>
          </div>
        </div>

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Nhập mã truy cập</h3>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã truy cập *
                  </label>
                  <input
                    type="text"
                    required
                    value={loginForm.code}
                    onChange={(e) => setLoginForm({...loginForm, code: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center font-mono text-lg"
                    placeholder="Nhập mã của bạn"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại (tùy chọn)
                  </label>
                  <input
                    type="tel"
                    value={loginForm.phone}
                    onChange={(e) => setLoginForm({...loginForm, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Số điện thoại của bạn"
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-sm">
                  <div className="font-medium text-gray-900 mb-2">Mã test để trải nghiệm:</div>
                  <div className="space-y-1 text-gray-600">
                    <div><strong>VIP:</strong> VIP2024, PREMIUM01, ELITE999</div>
                    <div><strong>Member:</strong> MEMBER01, USER2024, BASIC123</div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    Xác nhận
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/products" className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                <i className="ri-arrow-left-line"></i>
              </Link>
              <div>
                <h1 className="text-3xl font-bold mb-2">Khu vực đặc biệt</h1>
                <p className="text-green-100">
                  {userType === 'vip' ? 'Chào mừng thành viên VIP' : 'Chào mừng thành viên Member'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-full font-semibold ${
                userType === 'vip' 
                  ? 'bg-yellow-400 text-yellow-900' 
                  : 'bg-blue-400 text-blue-900'
              }`}>
                <i className={`${userType === 'vip' ? 'ri-vip-crown-line' : 'ri-user-star-line'} mr-2`}></i>
                {userType === 'vip' ? 'VIP' : 'MEMBER'}
              </div>
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                <i className="ri-logout-box-r-line mr-2"></i>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-shopping-bag-line text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{visibleProducts.length}</p>
                <p className="text-sm text-gray-600">Sản phẩm có thể xem</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="ri-discount-percent-line text-yellow-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">25%</p>
                <p className="text-sm text-gray-600">Giảm giá trung bình</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="ri-star-line text-purple-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">4.8</p>
                <p className="text-sm text-gray-600">Đánh giá trung bình</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              {/* Product Badge */}
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    product.badge === 'ULTRA VIP' 
                      ? 'bg-purple-600 text-white' 
                      : product.badge === 'VIP EXCLUSIVE'
                      ? 'bg-yellow-500 text-yellow-900'
                      : 'bg-blue-500 text-white'
                  }`}>
                    {product.badge}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-red-500 text-white px-2 py-1 text-xs font-bold rounded-full">
                    -{product.discount}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{product.name}</h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <i className="ri-store-line"></i>
                  <span>{product.seller}</span>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <div className="grid grid-cols-1 gap-1">
                    {product.features.slice(0, 2).map((feature, index) => (
                      <div key={index} className="flex items-start text-xs text-gray-600">
                        <i className="ri-check-line text-green-500 mr-1 mt-0.5 flex-shrink-0"></i>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    <i className="ri-star-fill text-yellow-400 text-sm"></i>
                    <span className="text-sm font-medium text-gray-900 ml-1">{product.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500">({product.reviews} đánh giá)</span>
                  <span className="text-xs text-gray-500">• Đã bán {product.sold}</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-red-600">{product.price}₫</span>
                    </div>
                    <div className="text-sm text-gray-500 line-through">{product.originalPrice}₫</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/products/${product.id}`}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-center text-sm font-medium"
                  >
                    Xem chi tiết
                  </Link>
                  <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <i className="ri-heart-line text-gray-600"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {visibleProducts.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-shopping-bag-line text-gray-300 text-6xl mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có sản phẩm</h3>
            <p className="text-gray-600">Sản phẩm đặc biệt đang được cập nhật</p>
          </div>
        )}

        {/* Upgrade Banner for Members */}
        {userType === 'member' && (
          <div className="mt-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <i className="ri-vip-crown-2-line text-white text-4xl mb-4"></i>
              <h3 className="text-2xl font-bold text-white mb-2">Nâng cấp lên VIP</h3>
              <p className="text-yellow-100 mb-6">
                Truy cập toàn bộ sản phẩm cao cấp và nhận thêm nhiều ưu đãi đặc biệt
              </p>
              <button className="bg-white text-yellow-600 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-50 transition-colors">
                Tìm hiểu thêm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}