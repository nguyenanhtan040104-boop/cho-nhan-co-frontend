'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function CreateJobPage() {
  const [formData, setFormData] = useState({
    title: '',
    type: 'hiring',
    category: 'agriculture',
    description: '',
    location: '',
    workTime: '',
    salary: '',
    contactName: '',
    contactPhone: '',
    requirements: '',
    benefits: '',
    skills: '',
    experience: '',
    isUrgent: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

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
        window.location.href = '/jobs';
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
                  <p className="text-sm text-gray-600">Đăng tin tuyển dụng</p>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/jobs" className="text-gray-700 hover:text-indigo-600 transition-colors cursor-pointer">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Đăng tin tuyển dụng</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Đăng tin tìm việc hoặc thuê nhân công trong nhiều lĩnh vực khác nhau
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8" data-readdy-form id="job-posting-form">
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
                  placeholder="VD: Cần thuê 5 người thu hoạch cà phê"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Loại tin đăng *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-8 cursor-pointer"
                  required
                >
                  <option value="hiring">Cần thuê nhân công</option>
                  <option value="seeking">Tìm việc làm</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Lĩnh vực *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-8 cursor-pointer"
                  required
                >
                  <option value="agriculture">Nông nghiệp</option>
                  <option value="construction">Xây dựng</option>
                  <option value="repair">Sửa chữa</option>
                  <option value="cleaning">Dọn dẹp</option>
                  <option value="petcare">Chăm sóc thú cưng</option>
                  <option value="childcare">Trông trẻ</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-2">
                  Mức lương *
                </label>
                <input
                  type="text"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  placeholder="VD: 350,000đ/ngày"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="workTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian làm việc *
                </label>
                <input
                  type="text"
                  id="workTime"
                  name="workTime"
                  value={formData.workTime}
                  onChange={handleInputChange}
                  placeholder="VD: Từ 15/12 đến 30/12"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div className="lg:col-span-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isUrgent"
                    checked={formData.isUrgent}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Đánh dấu là tin gấp
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Tin gấp sẽ được ưu tiên hiển thị và thu hút sự chú ý nhiều hơn
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Mô tả công việc</h2>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả chi tiết về công việc *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                placeholder="Hãy mô tả chi tiết về công việc, yêu cầu, điều kiện làm việc..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                maxLength={500}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Tối đa 500 ký tự ({500 - formData.description.length} ký tự còn lại)
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Địa điểm làm việc</h2>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Địa điểm cụ thể *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="VD: Vườn cà phê Nhân Cơ, Trung tâm xã"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Requirements & Skills */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {formData.type === 'hiring' ? 'Yêu cầu & Quyền lợi' : 'Kỹ năng & Kinh nghiệm'}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {formData.type === 'hiring' ? (
                <>
                  <div>
                    <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                      Yêu cầu công việc
                    </label>
                    <textarea
                      id="requirements"
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="VD: Có kinh nghiệm thu hoạch, Sức khỏe tốt, Chịu khó"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 mb-2">
                      Quyền lợi
                    </label>
                    <textarea
                      id="benefits"
                      name="benefits"
                      value={formData.benefits}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="VD: Bao cơm trưa, Trả lương hàng ngày, Thưởng cuối vụ"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                      Kỹ năng
                    </label>
                    <textarea
                      id="skills"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="VD: Đổ bê tông, Xây tường, Lát gạch, Sơn nhà"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                      Kinh nghiệm
                    </label>
                    <input
                      type="text"
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder="VD: 5 năm kinh nghiệm"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </>
              )}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <i className="ri-information-line text-blue-600 flex-shrink-0 mt-0.5"></i>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Lưu ý về thông tin liên hệ:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Số điện thoại sẽ chỉ hiển thị cho người quan tâm khi họ bấm "Xem liên hệ"</li>
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
              href="/jobs"
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center cursor-pointer"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang đăng tin...</span>
                </div>
              ) : (
                'Đăng tin tuyển dụng'
              )}
            </button>
          </div>
        </form>

        {/* Guidelines */}
        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-xl p-6">
          <h3 className="font-semibold text-indigo-900 mb-3">Hướng dẫn đăng tin hiệu quả</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-800">
            <div>
              <h4 className="font-medium mb-2">Tiêu đề hay:</h4>
              <ul className="space-y-1">
                <li>• Ngắn gọn, súc tích</li>
                <li>• Nêu rõ công việc cần tuyển</li>
                <li>• Có số lượng cụ thể</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Mô tả chi tiết:</h4>
              <ul className="space-y-1">
                <li>• Yêu cầu công việc rõ ràng</li>
                <li>• Thời gian, địa điểm cụ thể</li>
                <li>• Quyền lợi hấp dẫn</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}