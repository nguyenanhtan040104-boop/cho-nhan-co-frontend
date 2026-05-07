'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const propertyTypes = [
  { id: 'house', name: 'Nhà ở' },
  { id: 'land', name: 'Đất nền' },
  { id: 'room', name: 'Phòng trọ' },
  { id: 'commercial', name: 'Mặt bằng kinh doanh' },
  { id: 'warehouse', name: 'Kho xưởng' },
  { id: 'other', name: 'Khác' }
];

const transactionTypes = [
  { id: 'sell', name: 'Bán' },
  { id: 'rent', name: 'Cho thuê' },
  { id: 'transfer', name: 'Sang nhượng' }
];

const legalStatuses = [
  { id: 'red-book', name: 'Sổ đỏ chính chủ' },
  { id: 'pink-book', name: 'Sổ hồng' },
  { id: 'land-use-right', name: 'Giấy chứng nhận quyền sử dụng đất' },
  { id: 'sales-contract', name: 'Hợp đồng mua bán' },
  { id: 'other', name: 'Khác' }
];

export default function CreateRealEstatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    propertyType: '',
    transactionType: '',
    price: '',
    area: '',
    address: '',
    description: '',
    legalStatus: '',
    bedrooms: '',
    bathrooms: '',
    floors: '',
    frontage: '',
    contactName: '',
    contactPhone: '',
    isUrgent: false
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Tạo bất động sản mới
    const newProperty = {
      id: Date.now(),
      title: formData.title,
      price: Number(formData.price),
      area: Number(formData.area),
      type: formData.propertyType,
      transactionType: formData.transactionType,
      status: 'new',
      address: formData.address,
      description: formData.description,
      legalStatus: formData.legalStatus,
      bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
      floors: formData.floors ? Number(formData.floors) : null,
      frontage: formData.frontage ? Number(formData.frontage) : null,
      contactName: formData.contactName,
      contactPhone: formData.contactPhone,
      isUrgent: formData.isUrgent,
      postedDate: new Date().toISOString().split('T')[0],
      isVip: false,
      isFeatured: false,
      viewCount: 0,
      seller: {
        name: formData.contactName,
        phone: formData.contactPhone,
        isAgent: false,
        rating: 5.0,
        totalListings: 1
      },
      images: [
        `https://readdy.ai/api/search-image?query=$%7BencodeURIComponent%28formData.title%20%20%20%20%20%20%20formData.propertyType%20%20%20%20Vietnamese%20real%20estate%20property%20clean%20background%20professional%20photography%29%7D&width=400&height=300&seq=property${Date.now()}&orientation=landscape`
      ]
    };

    // Lưu bất động sản vào localStorage
    const existingProperties = JSON.parse(localStorage.getItem('userRealEstate') || '[]');
    existingProperties.unshift(newProperty);
    localStorage.setItem('userRealEstate', JSON.stringify(existingProperties));

    // Hiển thị thông báo thành công
    setShowSuccess(true);
    
    // Chuyển hướng sau 2 giây
    setTimeout(() => {
      router.push('/real-estate');
    }, 2000);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/real-estate"
              className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-line w-5 h-5 flex items-center justify-center"></i>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Đăng tin bất động sản</h1>
              <p className="text-gray-600">Đăng tin mua bán, cho thuê bất động sản</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề tin đăng *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="VD: Bán nhà cấp 4 có vườn 500m² trung tâm xã"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại bất động sản *
                    </label>
                    <select
                      name="propertyType"
                      required
                      value={formData.propertyType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8 cursor-pointer"
                    >
                      <option value="">Chọn loại bất động sản</option>
                      {propertyTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hình thức giao dịch *
                    </label>
                    <select
                      name="transactionType"
                      required
                      value={formData.transactionType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8 cursor-pointer"
                    >
                      <option value="">Chọn hình thức</option>
                      {transactionTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá *
                    </label>
                    <input
                      type="number"
                      name="price"
                      required
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Nhập giá (VNĐ)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diện tích (m²) *
                    </label>
                    <input
                      type="number"
                      name="area"
                      required
                      value={formData.area}
                      onChange={handleInputChange}
                      placeholder="Nhập diện tích"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Nhập địa chỉ cụ thể"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin chi tiết</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số phòng ngủ
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số phòng tắm
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số tầng
                  </label>
                  <input
                    type="number"
                    name="floors"
                    value={formData.floors}
                    onChange={handleInputChange}
                    placeholder="1"
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mặt tiền (m)
                  </label>
                  <input
                    type="number"
                    name="frontage"
                    value={formData.frontage}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tình trạng pháp lý *
                </label>
                <select
                  name="legalStatus"
                  required
                  value={formData.legalStatus}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8 cursor-pointer"
                >
                  <option value="">Chọn tình trạng pháp lý</option>
                  {legalStatuses.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
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
                placeholder="Mô tả chi tiết về bất động sản: vị trí, tiện ích, đặc điểm nổi bật..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                maxLength={1000}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length}/1000 ký tự
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên hệ</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    required
                    value={formData.contactName}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    placeholder="0912345678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="isUrgent"
                  name="isUrgent"
                  checked={formData.isUrgent}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isUrgent" className="text-sm text-gray-700">
                  <span className="font-medium">Tin khẩn cấp</span>
                  <p className="text-gray-500 mt-1">Tin của bạn sẽ được ưu tiên hiển thị</p>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <Link
                href="/real-estate"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center whitespace-nowrap cursor-pointer"
              >
                Hủy bỏ
              </Link>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                Đăng tin bất động sản
              </button>
            </div>
          </form>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-check-line text-blue-600 text-2xl w-8 h-8 flex items-center justify-center"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Đăng tin thành công!
                </h3>
                <p className="text-gray-600 mb-4">
                  Tin bất động sản đã được thêm vào danh sách
                </p>
                <div className="text-sm text-gray-500">
                  Đang chuyển đến trang bất động sản...
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}