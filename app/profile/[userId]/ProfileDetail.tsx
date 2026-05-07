'use client';

import Link from 'next/link';
import { useState } from 'react';

interface ProfileDetailProps {
  userId: string;
}

export default function ProfileDetail({ userId }: ProfileDetailProps) {
  const [activeTab, setActiveTab] = useState('info');

  // Mock data - trong thực tế sẽ fetch từ API
  const profile = {
    id: userId,
    name: 'Anh Minh',
    avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20coffee%20farmer%20portrait%20middle%20aged%20man%20friendly%20expression%20traditional%20rural%20setting%20natural%20lighting&width=150&height=150&seq=farmer1&orientation=squarish',
    phone: '0912345678',
    location: 'Xã Nhân Cơ, Huyện Đăk Hà',
    joinDate: 'Tham gia từ tháng 3/2023',
    rating: 4.8,
    reviewCount: 24,
    completedJobs: 45,
    bio: 'Tôi là chủ vườn cà phê với hơn 15 năm kinh nghiệm trong lĩnh vực nông nghiệp. Luôn tìm kiếm những người lao động chăm chỉ và có trách nhiệm để cùng phát triển.',
    skills: ['Quản lý vườn cà phê', 'Thu hoạch nông sản', 'Chăm sóc cây trồng', 'Tổ chức lao động'],
    experience: '15 năm kinh nghiệm',
    verified: true,
    badges: ['Nhà tuyển dụng uy tín', 'Thanh toán đúng hạn', 'Môi trường làm việc tốt'],
    recentJobs: [
      {
        id: 1,
        title: 'Cần thuê 5 người thu hoạch cà phê',
        type: 'hiring',
        salary: '350,000đ/ngày',
        status: 'Đang tuyển',
        postedDate: '2 ngày trước'
      },
      {
        id: 2,
        title: 'Tuyển thợ cắt tỉa cây cà phê',
        type: 'hiring',
        salary: '300,000đ/ngày',
        status: 'Đã đủ người',
        postedDate: '1 tuần trước'
      }
    ],
    reviews: [
      {
        id: 1,
        reviewer: 'Chị Lan',
        rating: 5,
        comment: 'Anh Minh rất tốt, trả lương đúng hạn và môi trường làm việc thân thiện.',
        date: '1 tuần trước',
        jobTitle: 'Thu hoạch cà phê'
      },
      {
        id: 2,
        reviewer: 'Anh Đức',
        rating: 5,
        comment: 'Công việc như mô tả, anh chủ nhiệt tình hướng dẫn.',
        date: '2 tuần trước',
        jobTitle: 'Cắt tỉa cây'
      }
    ]
  };

  const handleCall = () => {
    window.open(`tel:${profile.phone}`, '_self');
  };

  const handleMessage = () => {
    alert('Tính năng nhắn tin sẽ được phát triển trong phiên bản tiếp theo');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`ri-star-${i < Math.floor(rating) ? 'fill' : 'line'} text-yellow-400`}
      ></i>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/jobs" className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer">
            <i className="ri-arrow-left-line"></i>
            <span>Quay lại</span>
          </Link>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-32 h-32 rounded-full object-cover"
              />
              {profile.verified && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2">
                  <i className="ri-check-line text-sm"></i>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                {profile.verified && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                    Đã xác thực
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(profile.rating)}
                  <span className="text-gray-600 ml-2">({profile.reviewCount} đánh giá)</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center md:text-left">
                  <div className="text-2xl font-bold text-indigo-600">{profile.completedJobs}</div>
                  <div className="text-sm text-gray-600">Công việc hoàn thành</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-2xl font-bold text-green-600">{profile.rating}</div>
                  <div className="text-sm text-gray-600">Điểm đánh giá</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-2xl font-bold text-orange-600">{profile.reviewCount}</div>
                  <div className="text-sm text-gray-600">Lượt đánh giá</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center space-x-1">
                  <i className="ri-map-pin-line"></i>
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <i className="ri-calendar-line"></i>
                  <span>{profile.joinDate}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {profile.badges.map((badge, index) => (
                  <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {badge}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCall}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer flex items-center space-x-2"
                >
                  <i className="ri-phone-line"></i>
                  <span>Gọi điện</span>
                </button>
                
                <button
                  onClick={handleMessage}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer flex items-center space-x-2"
                >
                  <i className="ri-message-line"></i>
                  <span>Nhắn tin</span>
                </button>
                
                <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium cursor-pointer">
                  Báo cáo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                  activeTab === 'info'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                  activeTab === 'jobs'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tin đăng gần đây
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Đánh giá ({profile.reviewCount})
              </button>
            </nav>
          </div>

          <div className="p-8">
            {/* Personal Info Tab */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Giới thiệu</h3>
                  <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Kỹ năng</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span key={index} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Kinh nghiệm</h3>
                  <p className="text-gray-700">{profile.experience}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin liên hệ</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <i className="ri-phone-line text-gray-500"></i>
                      <span className="text-gray-700">{profile.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="ri-map-pin-line text-gray-500"></i>
                      <span className="text-gray-700">{profile.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Jobs Tab */}
            {activeTab === 'jobs' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tin đăng gần đây</h3>
                {profile.recentJobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">{job.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="text-green-600 font-medium">{job.salary}</span>
                          <span>{job.postedDate}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            job.status === 'Đang tuyển' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                      </div>
                      <Link 
                        href={`/jobs/${job.id}`}
                        className="text-indigo-600 hover:text-indigo-700 text-sm cursor-pointer"
                      >
                        Xem chi tiết →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Đánh giá từ người lao động</h3>
                {profile.reviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <i className="ri-user-line text-gray-600"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{review.reviewer}</h4>
                            <p className="text-sm text-gray-600">{review.jobTitle}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1 mb-1">
                              {renderStars(review.rating)}
                            </div>
                            <p className="text-sm text-gray-600">{review.date}</p>
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}