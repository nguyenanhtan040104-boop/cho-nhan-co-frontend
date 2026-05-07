
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const adTypes = [
  { id: 'opening', name: '🎉 Khai trương', description: 'Khai trương cửa hàng, doanh nghiệp mới' },
  { id: 'promotion', name: '🏷️ Khuyến mãi', description: 'Chương trình giảm giá, ưu đãi đặc biệt' },
  { id: 'new-product', name: '🎁 Sản phẩm mới', description: 'Ra mắt sản phẩm, dịch vụ mới' },
  { id: 'service', name: '🔧 Dịch vụ', description: 'Quảng bá dịch vụ, tư vấn' },
  { id: 'event', name: '📅 Sự kiện', description: 'Lễ hội, hội chợ, triển lãm' },
  { id: 'other', name: '📢 Khác', description: 'Các loại quảng cáo khác' }
];

const packageTypes = [
  { 
    id: 'basic', 
    name: 'Cơ bản', 
    price: 0, 
    duration: 7,
    features: ['Hiển thị 7 ngày', 'Vị trí thường', 'Không ghim']
  },
  { 
    id: 'premium', 
    name: 'Nổi bật', 
    price: 50000, 
    duration: 14,
    features: ['Hiển thị 14 ngày', 'Vị trí ưu tiên', 'Ghim 3 ngày đầu', 'Nhãn "Nổi bật"']
  },
  { 
    id: 'vip', 
    name: 'VIP', 
    price: 100000, 
    duration: 30,
    features: ['Hiển thị 30 ngày', 'Vị trí đầu tiên', 'Ghim toàn bộ thời gian', 'Nhãn "VIP"', 'Hỗ trợ ưu tiên']
  }
];

export default function CreateAdvertisementPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    adType: '',
    description: '',
    businessName: '',
    contactPhone: '',
    contactEmail: '',
    location: '',
    address: '',
    website: '',
    startDate: '',
    endDate: '',
    discount: '',
    validUntil: '',
    packageType: 'basic',
    terms: false
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Tạo quảng cáo mới
    const newAd = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      category: formData.adType,
      startDate: formData.startDate,
      endDate: formData.endDate || new Date(Date.now() + (packageTypes.find(p => p.id === formData.packageType)?.duration || 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: formData.location,
      contact: formData.contactPhone,
      businessName: formData.businessName,
      isPinned: formData.packageType !== 'basic',
      isSponsored: formData.packageType === 'premium' || formData.packageType === 'vip',
      isNew: true,
      views: 0,
      image: `https://readdy.ai/api/search-image?query=$%7BencodeURIComponent%28formData.title%20%20%20%20%20%20%20formData.businessName%20%20%20%20Vietnamese%20business%20advertisement%20promotional%20banner%20colorful%20attractive%20design%29%7D&width=400&height=250&seq=ad${Date.now()}&orientation=landscape`,
      discount: formData.discount,
      validUntil: formData.validUntil || formData.endDate,
      packageType: formData.packageType,
      createdAt: new Date().toISOString()
    };

    // Lưu quảng cáo vào localStorage
    const existingAds = JSON.parse(localStorage.getItem('userAdvertisements') || '[]');
    existingAds.unshift(newAd);
    localStorage.setItem('userAdvertisements', JSON.stringify(existingAds));

    // Nếu là gói trả phí, chuyển đến trang thanh toán
    if (formData.packageType !== 'basic') {
      const packageMap = {
        'premium': 'ad_featured',
        'vip': 'ad_vip'
      };
      const paymentPackage = packageMap[formData.packageType];
      router.push(`/payment?package=${paymentPackage}`);
    } else {
      // Hiển thị thông báo thành công cho gói miễn phí
      setShowSuccess(true);
      
      // Chuyển hướng sau 2 giây
      setTimeout(() => {
        router.push('/advertisements');
      }, 2000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const selectedPackage = packageTypes.find(p => p.id === formData.packageType);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/advertisements"
              className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-line w-5 h-5 flex items-center justify-center"></i>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Đăng quảng cáo mới</h1>
              <p className="text-gray-600">Quảng bá doanh nghiệp và sản phẩm của bạn</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề quảng cáo *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="VD: Khai trương cửa hàng nông sản sạch Green Farm"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại quảng cáo *
                  </label>
                  <select
                    name="adType"
                    required
                    value={formData.adType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-8 cursor-pointer"
                  >
                    <option value="">Chọn loại quảng cáo</option>
                    {adTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {formData.adType && (
                    <p className="text-sm text-gray-500 mt-1">
                      {adTypes.find(t => t.id === formData.adType)?.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả chi tiết *
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={6}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Mô tả chi tiết về sản phẩm/dịch vụ, ưu đãi đặc biệt..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    maxLength={1000}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.description.length}/1000 ký tự
                  </p>
                </div>
              </div>
            </div>

            {/* Business Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin doanh nghiệp</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên doanh nghiệp *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    required
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="VD: Green Farm Store"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    required
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="0262.3888.999"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email liên hệ
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    placeholder="contact@greenfarm.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://greenfarm.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Địa điểm</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khu vực *
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="VD: TP. Buôn Ma Thuột"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ cụ thể *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="VD: Số 123 Lê Duẩn, TP. Buôn Ma Thuột"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Promotion Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khuyến mãi (nếu có)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ưu đãi/Giảm giá
                  </label>
                  <input
                    type="text"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    placeholder="VD: 20% giảm giá toàn bộ sản phẩm"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Có hiệu lực đến
                  </label>
                  <input
                    type="date"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Package Selection */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Chọn gói quảng cáo</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packageTypes.map(pkg => (
                  <label
                    key={pkg.id}
                    className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.packageType === pkg.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="packageType"
                      value={pkg.id}
                      checked={formData.packageType === pkg.id}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    
                    {pkg.id === 'vip' && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold">
                          PHỔ BIẾN
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.name}</h3>
                      <div className="text-3xl font-bold text-orange-600 mb-2">
                        {pkg.price === 0 ? 'Miễn phí' : `${pkg.price.toLocaleString()}đ`}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{pkg.duration} ngày</p>
                      
                      <ul className="text-left space-y-2">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-600">
                            <i className="ri-check-line text-green-600 mr-2 mt-0.5 flex-shrink-0"></i>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </label>
                ))}
              </div>
              
              {selectedPackage && selectedPackage.price > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-blue-700">
                    <i className="ri-information-line mr-2"></i>
                    <span className="font-medium">Thông tin thanh toán</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    Sau khi đăng tin, bạn sẽ được chuyển đến trang thanh toán để hoàn tất gói {selectedPackage.name}.
                  </p>
                </div>
              )}
            </div>

            {/* Terms */}
            <div>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  <span className="font-medium">Tôi đồng ý với các điều khoản sử dụng</span>
                  <p className="text-gray-500 mt-1">
                    Quảng cáo phải tuân thủ quy định của nền tảng, không chứa nội dung vi phạm pháp luật.
                    Chúng tôi có quyền từ chối hoặc gỡ bỏ quảng cáo không phù hợp.
                  </p>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <Link
                href="/advertisements"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center whitespace-nowrap cursor-pointer"
              >
                Hủy bỏ
              </Link>
              <button
                type="submit"
                className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                {selectedPackage?.price === 0 ? 'Đăng quảng cáo miễn phí' : `Tiếp tục thanh toán`}
              </button>
            </div>
          </form>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-check-line text-orange-600 text-2xl w-8 h-8 flex items-center justify-center"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Đăng quảng cáo thành công!
                </h3>
                <p className="text-gray-600 mb-4">
                  Quảng cáo đã được thêm vào danh sách
                </p>
                <div className="text-sm text-gray-500">
                  Đang chuyển đến trang quảng cáo...
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
