'use client';

import Link from 'next/link';
import { useState } from 'react';

interface SearchPost {
  id: number;
  title: string;
  type: string;
  status: string;
  description: string;
  image: string;
  location: string;
  lostDate: string;
  lostTime: string;
  contact: {
    name: string;
    phone: string;
    avatar: string;
  };
  reward: string;
  createdAt: string;
  views: number;
  shares: number;
  isPinned: boolean;
  isUrgent: boolean;
  hashtag: string;
}

interface SearchPeopleCardProps {
  post: SearchPost;
}

export default function SearchPeopleCard({ post }: SearchPeopleCardProps) {
  const [showContact, setShowContact] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const getTypeIcon = (type: string) => {
    const icons = {
      'people': 'ri-user-search-line',
      'pets': 'ri-bear-smile-line',
      'objects': 'ri-briefcase-line'
    };
    return icons[type] || 'ri-search-line';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'people': 'bg-blue-100 text-blue-700',
      'pets': 'bg-green-100 text-green-700',
      'objects': 'bg-orange-100 text-orange-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'new': 'bg-purple-100 text-purple-700',
      'searching': 'bg-red-100 text-red-700',
      'found': 'bg-green-100 text-green-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'new': 'Mới đăng',
      'searching': 'Đang tìm',
      'found': 'Đã tìm thấy'
    };
    return texts[status] || status;
  };

  const handleShare = () => {
    const url = `${window.location.origin}/search-people/${post.id}`;
    const text = `${post.title} - ${post.hashtag}`;
    
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: text,
        url: url
      });
    } else {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
      window.open(facebookUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${
      post.isPinned ? 'ring-2 ring-red-200 border-red-300' : 'border-gray-200'
    } ${post.status === 'found' ? 'opacity-75' : ''}`}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getTypeColor(post.type)}`}>
              <i className={`${getTypeIcon(post.type)} text-lg`}></i>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(post.status)}`}>
                  {getStatusText(post.status)}
                </span>
                {post.isPinned && (
                  <span className="flex items-center space-x-1 text-red-600 text-xs">
                    <i className="ri-pushpin-line"></i>
                    <span>Ghim</span>
                  </span>
                )}
                {post.isUrgent && (
                  <span className="flex items-center space-x-1 text-red-600 text-xs">
                    <i className="ri-alarm-warning-line"></i>
                    <span>Khẩn cấp</span>
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-600">{post.createdAt}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isSaved ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <i className={`${isSaved ? 'ri-bookmark-fill' : 'ri-bookmark-line'}`}></i>
            </button>
            <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer">
              <i className="ri-more-2-line"></i>
            </button>
          </div>
        </div>

        <Link href={`/search-people/${post.id}`} className="cursor-pointer">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-red-600 transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>
      </div>

      {/* Content */}
      <div className="px-6 pb-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-80 flex-shrink-0">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-48 lg:h-40 object-cover object-top rounded-lg"
            />
          </div>
          
          <div className="flex-1">
            <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
              {post.description}
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <i className="ri-map-pin-line text-red-500"></i>
                  <span className="font-medium">Địa điểm:</span>
                </div>
                <p className="text-gray-900">{post.location}</p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <i className="ri-time-line text-red-500"></i>
                  <span className="font-medium">Thời gian:</span>
                </div>
                <p className="text-gray-900">{post.lostTime} - {post.lostDate}</p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <i className="ri-gift-line text-red-500"></i>
                  <span className="font-medium">Hậu tạ:</span>
                </div>
                <p className="text-red-600 font-semibold">{post.reward}</p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <i className="ri-hashtag"></i>
                  <span className="font-medium">Hashtag:</span>
                </div>
                <span className="text-blue-600 font-medium cursor-pointer hover:text-blue-800">
                  {post.hashtag}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="px-6 pb-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={post.contact.avatar}
                alt={post.contact.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-gray-900">{post.contact.name}</p>
                <p className="text-sm text-gray-600">Người đăng tin</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowContact(!showContact)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium cursor-pointer"
            >
              {showContact ? 'Ẩn liên hệ' : 'Xem liên hệ'}
            </button>
          </div>
          
          {showContact && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <i className="ri-phone-line text-red-500"></i>
                <a 
                  href={`tel:${post.contact.phone}`}
                  className="text-red-600 font-semibold hover:text-red-700 cursor-pointer"
                >
                  {post.contact.phone}
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * Vui lòng liên hệ nếu bạn có thông tin hữu ích
              </p>
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
              <span>{post.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <i className="ri-share-line"></i>
              <span>{post.shares}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleShare}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm cursor-pointer"
            >
              <i className="ri-facebook-line"></i>
              <span>Chia sẻ</span>
            </button>
            
            <Link 
              href={`/search-people/${post.id}`}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium cursor-pointer"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}