
'use client';

import Link from 'next/link';
import { useState } from 'react';
import MessengerModal from '../../components/MessengerModal';

interface Job {
  id: number;
  title: string;
  type: string;
  category: string;
  description: string;
  image: string;
  location: string;
  workTime: string;
  salary: string;
  contact: {
    name: string;
    phone: string;
    avatar: string;
    userId?: string;
  };
  requirements?: string[];
  benefits?: string[];
  skills?: string[];
  experience?: string;
  createdAt: string;
  views: number;
  applications: number;
  isUrgent: boolean;
  hashtag: string;
}

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showMessengerModal, setShowMessengerModal] = useState(false);

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
      'agriculture': 'ri-plant-line',
      'construction': 'ri-hammer-line',
      'repair': 'ri-tools-line',
      'cleaning': 'ri-brush-line',
      'petcare': 'ri-bear-smile-line',
      'childcare': 'ri-parent-line'
    };
    return icons[category] || 'ri-briefcase-line';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'agriculture': 'text-green-600',
      'construction': 'text-orange-600',
      'repair': 'text-purple-600',
      'cleaning': 'text-blue-600',
      'petcare': 'text-pink-600',
      'childcare': 'text-indigo-600'
    };
    return colors[category] || 'text-gray-600';
  };

  const handleShare = () => {
    const url = `${window.location.origin}/jobs/${job.id}`;
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
    } else {
      setShowContact(true);
    }
  };

  const handleContactProfile = () => {
    const userId = job.contact.userId || 'user123';
    window.location.href = `/profile/${userId}`;
  };


  const handleMessageClick = () => {
    setShowMessengerModal(true);
    setShowContact(false);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${
      job.isUrgent ? 'ring-2 ring-orange-200 border-orange-300' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getCategoryColor(job.category)} bg-gray-50`}>
              <i className={`${getCategoryIcon(job.category)} text-lg`}></i>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(job.type)}`}>
                  {getTypeText(job.type)}
                </span>
                {job.isUrgent && (
                  <span className="flex items-center space-x-1 text-orange-600 text-xs">
                    <i className="ri-alarm-warning-line"></i>
                    <span>Gấp</span>
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-600">{job.createdAt}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isSaved ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              <i className={`${isSaved ? 'ri-bookmark-fill' : 'ri-bookmark-line'}`}></i>
            </button>
            <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer">
              <i className="ri-more-2-line"></i>
            </button>
          </div>
        </div>

        <Link href={`/jobs/${job.id}`} className="cursor-pointer">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-indigo-600 transition-colors line-clamp-2">
            {job.title}
          </h2>
        </Link>
      </div>

      {/* Content */}
      <div className="px-6 pb-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-80 flex-shrink-0">
            <img
              src={job.image}
              alt={job.title}
              className="w-full h-48 lg:h-40 object-cover object-top rounded-lg"
            />
          </div>
          
          <div className="flex-1">
            <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
              {job.description}
            </p>
            
            {/* Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
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
              
              <div>
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <i className="ri-money-dollar-circle-line text-indigo-500"></i>
                  <span className="font-medium">Lương:</span>
                </div>
                <p className="text-indigo-600 font-semibold">{job.salary}</p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <i className="ri-hashtag"></i>
                  <span className="font-medium">Hashtag:</span>
                </div>
                <span className="text-blue-600 font-medium cursor-pointer hover:text-blue-800">
                  {job.hashtag}
                </span>
              </div>
            </div>

            {/* Skills or Requirements */}
            {(job.skills || job.requirements) && (
              <div className="mt-4">
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <i className="ri-star-line text-indigo-500"></i>
                  <span className="font-medium">
                    {job.type === 'seeking' ? 'Kỹ năng:' : 'Yêu cầu:'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(job.skills || job.requirements)?.slice(0, 3).map((item, index) => (
                    <span key={index} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs">
                      {item}
                    </span>
                  ))}
                  {(job.skills || job.requirements)?.length > 3 && (
                    <span className="text-gray-500 text-xs">+{(job.skills || job.requirements).length - 3} khác</span>
                  )}
                </div>
              </div>
            )}

            {/* Experience */}
            {job.experience && (
              <div className="mt-3">
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <i className="ri-award-line text-indigo-500"></i>
                  <span className="font-medium">Kinh nghiệm:</span>
                </div>
                <p className="text-gray-900 text-sm">{job.experience}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="px-6 pb-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={job.contact.avatar}
                alt={job.contact.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <button
                  onClick={handleContactProfile}
                  className="font-medium text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  {job.contact.name}
                </button>
                <p className="text-sm text-gray-600">
                  {job.type === 'hiring' ? 'Nhà tuyển dụng' : 'Người tìm việc'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowContact(!showContact)}
                className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium cursor-pointer"
              >
                {showContact ? 'Ẩn liên hệ' : 'Xem liên hệ'}
              </button>
              
              <button
                onClick={handleApply}
                disabled={hasApplied}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium cursor-pointer ${
                  hasApplied 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {hasApplied ? 'Đã ứng tuyển' : (job.type === 'hiring' ? 'Ứng tuyển' : 'Liên hệ')}
              </button>
            </div>
          </div>


          {hasApplied && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-green-600">
                <i className="ri-check-line"></i>
                <span className="text-sm">Bạn đã ứng tuyển thành công!</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <i className="ri-eye-line"></i>
              <span>{job.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <i className="ri-user-line"></i>
              <span>{job.applications} {job.type === 'hiring' ? 'ứng viên' : 'liên hệ'}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleShare}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm cursor-pointer"
            >
              <i className="ri-share-line"></i>
              <span>Chia sẻ</span>
            </button>
            
            <Link 
              href={`/jobs/${job.id}`}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium cursor-pointer"
            >
              Xem chi tiết
            </Link>
          </div>
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
  );
}
