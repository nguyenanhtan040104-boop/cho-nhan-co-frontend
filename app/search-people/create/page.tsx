'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function CreateSearchPeoplePage() {
  const [formData, setFormData] = useState({
    title: '',
    type: 'objects',
    description: '',
    location: '',
    specificLocation: '',
    lostDate: '',
    lostTime: '',
    contactName: '',
    contactPhone: '',
    reward: '',
    additionalInfo: {
      brand: '',
      color: '',
      condition: '',
      distinctive: '',
      lastSeen: ''
    },
    isUrgent: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('additionalInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        additionalInfo: {
          ...prev.additionalInfo,
          [field]: value
        }
      }));
    } else if (type === 'checkbox') {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitMessage('Đăng tin thành công! Tin của bạn đang được xem xét.');
      
      // Reset form
      setTimeout(() => {
        window.location.href = '/search-people';
      }, 3000);
    } catch (error) {
      setSubmitMessage('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3 cursor-pointer">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <i className="ri-store-2-line text-white text-xl"></i>
                </div>
                <div>
                  <h1 className="font-['Pacifico'] text-2xl text-green-700">Chợ Nhân Cơ</h1>
                  <p className="text-sm text-gray-600">Đăng tin tìm kiếm</p>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/search-people" className="text-gray-700 hover:text-red-600 transition-colors cursor-pointer">
                <i className="ri-arrow-left-line mr-2"></i>
                Quay lại
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Đăng tin tìm kiếm</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Hãy cung cấp thông tin chi tiết để cộng đồng có thể hỗ trợ bạn tìm kiếm hiệu quả nhất
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8" data-readdy-form id="search-people-form">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin cơ bản</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề tin đăng *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="VD: Tìm chiếc iPhone 13 màu xanh thất lạc tại chợ"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Loại tìm kiếm *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 pr-8 cursor-pointer"
                  required
                >
                  <option value="objects">Đồ vật</option>
                  <option value="pets">Thú cưng</option>
                  <option value="people">Người thân</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="reward" className="block text-sm font-medium text-gray-700 mb-2">
                  Tiền hậu tạ
                </label>
                <input
                  type="text"
                  id="reward"
                  name="reward"
                  value={formData.reward}
                  onChange={handleInputChange}
                  placeholder="VD: 2,000,000đ hoặc Hậu tạ"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div className="lg:col-span-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isUrgent"
                    checked={formData.isUrgent}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Đánh dấu là tin khẩn cấp
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Tin khẩn cấp sẽ được ưu tiên hiển thị và thu hút sự chú ý nhiều hơn
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Mô tả chi tiết</h2>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả chi tiết về đối tượng cần tìm *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                placeholder="Hãy mô tả chi tiết về đặc điểm, màu sắc, kích thước, tình trạng... để mọi người dễ nhận ra"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                maxLength={500}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Tối đa 500 ký tự ({500 - formData.description.length} ký tự còn lại)
              </p>
            </div>
          </div>

          {/* Location & Time */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin địa điểm và thời gian</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Địa điểm thất lạc *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="VD: Chợ Nhân Cơ, Kon Tum"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="specificLocation" className="block text-sm font-medium text-gray-700 mb-2">
                  Vị trí cụ thể
                </label>
                <input
                  type="text"
                  id="specificLocation"
                  name="specificLocation"
                  value={formData.specificLocation}
                  onChange={handleInputChange}
                  placeholder="VD: Gần quầy rau củ, cổng chính"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div>
                <label htmlFor="lostDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày thất lạc *
                </label>
                <input
                  type="date"
                  id="lostDate"
                  name="lostDate"
                  value={formData.lostDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="lostTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian thất lạc
                </label>
                <input
                  type="text"
                  id="lostTime"
                  name="lostTime"
                  value={formData.lostTime}
                  onChange={handleInputChange}
                  placeholder="VD: 7:30 sáng, Khoảng 2:00 chiều"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin bổ sung</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="additionalInfo.brand" className="block text-sm font-medium text-gray-700 mb-2">
                  Thương hiệu/Giống loài
                </label>
                <input
                  type="text"
                  id="additionalInfo.brand"
                  name="additionalInfo.brand"
                  value={formData.additionalInfo.brand}
                  onChange={handleInputChange}
                  placeholder="VD: iPhone 13, Golden Retriever"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div>
                <label htmlFor="additionalInfo.color" className="block text-sm font-medium text-gray-700 mb-2">
                  Màu sắc
                </label>
                <input
                  type="text"
                  id="additionalInfo.color"
                  name="additionalInfo.color"
                  value={formData.additionalInfo.color}
                  onChange={handleInputChange}
                  placeholder="VD: Xanh alpine, Vàng gold"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div>
                <label htmlFor="additionalInfo.condition" className="block text-sm font-medium text-gray-700 mb-2">
                  Tình trạng
                </label>
                <input
                  type="text"
                  id="additionalInfo.condition"
                  name="additionalInfo.condition"
                  value={formData.additionalInfo.condition}
                  onChange={handleInputChange}
                  placeholder="VD: Còn mới, Có ốp lưng"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div>
                <label htmlFor="additionalInfo.lastSeen" className="block text-sm font-medium text-gray-700 mb-2">
                  Lần cuối nhìn thấy
                </label>
                <input
                  type="text"
                  id="additionalInfo.lastSeen"
                  name="additionalInfo.lastSeen"
                  value={formData.additionalInfo.lastSeen}
                  onChange={handleInputChange}
                  placeholder="VD: Tại quầy bán rau củ của cô Hương"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div className="lg:col-span-2">
                <label htmlFor="additionalInfo.distinctive" className="block text-sm font-medium text-gray-700 mb-2">
                  Đặc điểm nhận dạng đặc biệt
                </label>
                <textarea
                  id="additionalInfo.distinctive"
                  name="additionalInfo.distinctive"
                  value={formData.additionalInfo.distinctive}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="VD: Có ảnh gia đình trong ốp lưng, màn hình có dán kính cường lực"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin liên hệ</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên của bạn"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  placeholder="VD: 0912345678"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <i className="ri-information-line text-yellow-600 flex-shrink-0 mt-0.5"></i>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Lưu ý về thông tin liên hệ:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Số điện thoại sẽ chỉ hiển thị cho người dùng khi họ bấm "Xem liên hệ"</li>
                    <li>• Chúng tôi khuyên bạn chỉ cung cấp thông tin liên hệ cần thiết</li>
                    <li>• Tránh chia sẻ thông tin cá nhân quá chi tiết trong mô tả công khai</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Message */}
          {submitMessage && (
            <div className={`p-4 rounded-lg ${
              submitMessage.includes('thành công') 
                ? 'bg-green-100 border border-green-200 text-green-800' 
                : 'bg-red-100 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center space-x-2">
                <i className={`${
                  submitMessage.includes('thành công') ? 'ri-check-line' : 'ri-error-warning-line'
                }`}></i>
                <span>{submitMessage}</span>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Link
              href="/search-people"
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center cursor-pointer"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang đăng tin...</span>
                </div>
              ) : (
                'Đăng tin tìm kiếm'
              )}
            </button>
          </div>
        </form>

        {/* Guidelines */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Hướng dẫn đăng tin hiệu quả</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Tiêu đề hay:</h4>
              <ul className="space-y-1">
                <li>• Ngắn gọn, súc tích</li>
                <li>• Nêu rõ đối tượng cần tìm</li>
                <li>• Có địa điểm cụ thể</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Mô tả chi tiết:</h4>
              <ul className="space-y-1">
                <li>• Đặc điểm nhận dạng rõ ràng</li>
                <li>• Thời gian, địa điểm cụ thể</li>
                <li>• Tình huống mất tích</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}