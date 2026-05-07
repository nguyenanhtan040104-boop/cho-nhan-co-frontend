
'use client';

import Link from 'next/link';
import { useState } from 'react';
import MessengerModal from '../../../components/MessengerModal';

interface JobDetailProps {
  jobId: string;
}

export default function JobDetail({ jobId }: JobDetailProps) {
  const [showContact, setShowContact] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showMessengerModal, setShowMessengerModal] = useState(false);

  // Mock data - trong thực tế sẽ fetch từ API
  const job = {
    id: parseInt(jobId),
    title: 'Cần thuê 5 người thu hoạch cà phê',
    type: 'hiring',
    category: 'agriculture',
    description: 'Cần thuê 5 người có kinh nghiệm thu hoạch cà phê Robusta. Công việc từ 6h sáng đến 5h chiều, bao cơm trưa. Yêu cầu có sức khỏe tốt, chịu khó. Vườn cà phê rộng 10 hecta, dự kiến thu hoạch trong 15 ngày. Ưu tiên những người có kinh nghiệm và có thể làm việc liên tục.',
    image: 'https://readdy.ai/api/search-image?query=Vietnamese%20coffee%20harvest%20workers%20picking%20coffee%20beans%20in%20plantation%2C%20traditional%20farming%2C%20rural%20setting%2C%20people%20working%20together%2C%20authentic%20agricultural%20scene&width=600&height=400&seq=coffeejob1&orientation=landscape',
    location: 'Vườn cà phê Nhân Cơ, Thôn 3, Xã Nhân Cơ',
    workTime: 'Từ 15/12 đến 30/12, 6h-17h hàng ngày',
    salary: '350,000đ/ngày',
    contact: {
      name: 'Anh Minh',
      phone: '0912345678',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20coffee%20farmer%20portrait%20middle%20aged%20man%20friendly%20expression%20traditional%20rural%20setting%20natural%20lighting&width=100&height=100&seq=farmer1&orientation=squarish',
      userId: 'user123'
    },
    requirements: ['Có kinh nghiệm thu hoạch cà phê', 'Sức khỏe tốt, chịu được nắng nóng', 'Chịu khó làm việc', 'Có thể làm việc liên tục 15 ngày'],
    benefits: ['Bao cơm trưa', 'Trả lương hàng ngày', 'Thưởng cuối vụ 500,000đ', 'Có chỗ nghỉ trưa tại vườn'],
    createdAt: '30 phút trước',
    views: 89,
    applications: 12,
    isUrgent: true,
    hashtag: '#TuyenDungNongNghiep',
    additionalInfo: {
      workEnvironment: 'Vườn cà phê trên núi, không khí trong lành',
      equipment: 'Cung cấp đầy đủ dụng cụ thu hoạch',
      transportation: 'Có xe đưa đón từ trung tâm xã',
      accommodation: 'Có nhà nghỉ tại vườn cho ai muốn ở lại'
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'hiring' ? 'ri-user-add-line' : 'ri-user-search-line';
  };

  const getTypeColor = (type: string) => {
    return type === 'hiring'
      ? 'bg-green-100 text-green-700'
      : 'bg-blue-100 text-blue-700';
  };

  const getTypeText = (type: string) => {
    return type === 'hiring' ? 'Cần thuê' : 'Tìm việc';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      agriculture: 'ri-plant-line',
      construction: 'ri-hammer-line',
      repair: 'ri-tools-line',
      cleaning: 'ri-brush-line',
      petcare: 'ri-bear-smile-line',
      childcare: 'ri-parent-line'
    };
    return icons[category] || 'ri-briefcase-line';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      agriculture: 'text-green-600',
      construction: 'text-orange-600',
      repair: 'text-purple-600',
      cleaning: 'text-blue-600',
      petcare: 'text-pink-600',
      childcare: 'text-indigo-600'
    };
    return colors[category] || 'text-gray-600';
  };

  const handleShare = () => {
    const url = window.location.href;
    const text = `${job.title} - ${job.hashtag}`;

    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: text,
        url: url
      });
    } else {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
      window.open(facebookUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleApply = () => {
    if (job.type === 'hiring') {
      setHasApplied(true);
      // Trong thực tế sẽ gửi API để lưu thông tin ứng tuyển
    } else {
      setShowContact(true);
    }
  };

  const handleContact = () => {
    // Chuyển đến trang profile của người đăng
    window.location.href = `/profile/${job.contact.userId}`;
  };

  const handleCall = () => {
    window.open(`tel:${job.contact.phone}`, '_self');
  };

  const handleMessageClick = () => {
    setShowMessengerModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/jobs" className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer">
            <i className="ri-arrow-left-line"></i>
            <span>Quay lại danh sách</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${getCategoryColor(job.category)} bg-gray-50`}>
                  <i className={`${getCategoryIcon(job.category)} text-2xl`}></i>
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`text-sm px-3 py-1 rounded-full ${getTypeColor(job.type)}`}>
                      {getTypeText(job.type)}
                    </span>
                    {job.isUrgent && (
                      <span className="flex items-center space-x-1 text-orange-600 text-sm">
                        <i className="ri-alarm-warning-line"></i>
                        <span>Gấp</span>
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">{job.createdAt}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className={`p-3 rounded-lg transition-colors cursor-pointer ${
                    isSaved ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  <i className={`${isSaved ? 'ri-bookmark-fill' : 'ri-bookmark-line'}`}></i>
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <i className="ri-share-line"></i>
                </button>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>

            <div className="flex items-center space-x-2 mb-6">
              <span className="text-blue-600 font-medium cursor-pointer hover:text-blue-800">
                {job.hashtag}
              </span>
            </div>
          </div>

          {/* Image */}
          <div className="px-8 pb-6">
            <img
              src={job.image}
              alt={job.title}
              className="w-full h-80 object-cover object-top rounded-lg"
            />
          </div>

          {/* Job Details */}
          <div className="px-8 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <i className="ri-map-pin-line text-indigo-500"></i>
                    <span className="font-medium">Địa điểm:</span>
                  </div>
                  <p className="text-gray-900">{job.location}</p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <i className="ri-time-line text-indigo-500"></i>
                    <span className="font-medium">Thời gian:</span>
                  </div>
                  <p className="text-gray-900">{job.workTime}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <i className="ri-money-dollar-circle-line text-indigo-500"></i>
                    <span className="font-medium">Mức lương:</span>
                  </div>
                  <p className="text-indigo-600 font-bold text-xl">{job.salary}</p>
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <i className="ri-eye-line"></i>
                    <span>{job.views} lượt xem</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <i className="ri-user-line"></i>
                    <span>{job.applications} ứng viên</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Mô tả công việc</h2>
              <p className="text-gray-700 leading-relaxed">{job.description}</p>
            </div>

            {/* Requirements & Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Yêu cầu công việc</h3>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <i className="ri-check-line text-green-500 mt-1 flex-shrink-0"></i>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quyền lợi</h3>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <i className="ri-gift-line text-indigo-500 mt-1 flex-shrink-0"></i>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin bổ sung</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Môi trường làm việc:</p>
                  <p className="text-gray-900">{job.additionalInfo.workEnvironment}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Dụng cụ:</p>
                  <p className="text-gray-900">{job.additionalInfo.equipment}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Đưa đón:</p>
                  <p className="text-gray-900">{job.additionalInfo.transportation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Chỗ ở:</p>
                  <p className="text-gray-900">{job.additionalInfo.accommodation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="px-8 pb-8">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên hệ</h3>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={job.contact.avatar}
                    alt={job.contact.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">{job.contact.name}</h4>
                    <p className="text-gray-600">
                      {job.type === 'hiring' ? 'Nhà tuyển dụng' : 'Người tìm việc'}
                    </p>
                    <button
                      onClick={handleContact}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium cursor-pointer"
                    >
                      Xem thông tin cá nhân →
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {showContact && (
                    <div className="flex items-center space-x-3 mr-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Số điện thoại</p>
                        <p className="font-semibold text-gray-900">{job.contact.phone}</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setShowContact(!showContact)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium cursor-pointer"
                  >
                    {showContact ? 'Ẩn liên hệ' : 'Hiện số ĐT'}
                  </button>

                  <button
                    onClick={handleCall}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer flex items-center space-x-2"
                  >
                    <i className="ri-phone-line"></i>
                    <span>Gọi ngay</span>
                  </button>

                  <button
                    onClick={handleMessageClick}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-message-line w-5 h-5 flex items-center justify-center"></i>
                    Nhắn tin riêng
                  </button>

                  <button
                    onClick={handleApply}
                    disabled={hasApplied}
                    className={`px-6 py-2 rounded-lg font-semibold cursor-pointer transition-colors ${
                      hasApplied
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {hasApplied ? 'Đã ứng tuyển' : job.type === 'hiring' ? 'Ứng tuyển' : 'Liên hệ'}
                  </button>
                </div>
              </div>

              {hasApplied && (
                <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-800">
                    <i className="ri-check-line"></i>
                    <span className="text-sm">Bạn đã ứng tuyển thành công! Nhà tuyển dụng sẽ liên hệ với bạn sớm.</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Messenger Modal */}
          <MessengerModal
            isOpen={showMessengerModal}
            onClose={() => setShowMessengerModal(false)}
            recipientName={job.contact.name}
            recipientAvatar={job.contact.avatar}
            recipientPhone={job.contact.phone}
            productTitle={job.title}
            productImage={job.image}
          />
        </div>

        {/* Related Jobs */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tin đăng liên quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mock related jobs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Cần thuê thợ cắt cỏ</h3>
              <p className="text-gray-600 text-sm mb-3">Cần thuê 2 người cắt cỏ vườn cà phê, công việc nhẹ nhàng...</p>
              <div className="flex items-center justify-between">
                <span className="text-green-600 font-semibold">200,000đ/ngày</span>
                <Link href="/jobs/2" className="text-indigo-600 hover:text-indigo-700 text-sm cursor-pointer">
                  Xem chi tiết →
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Tìm việc làm vườn</h3>
              <p className="text-gray-600 text-sm mb-3">Có kinh nghiệm chăm sóc cây trồng, tưới nước, bón phân...</p>
              <div className="flex items-center justify-between">
                <span className="text-green-600 font-semibold">300,000đ/ngày</span>
                <Link href="/jobs/3" className="text-indigo-600 hover:text-indigo-700 text-sm cursor-pointer">
                  Xem chi tiết →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
