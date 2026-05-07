
'use client';

import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    level: string;
    reputation: number;
  };
  category: string;
  createdAt: string;
  views: number;
  likes: number;
  comments: number;
  isVip: boolean;
  isPinned: boolean;
  tags: string[];
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const getCategoryColor = (category: string) => {
    const colors = {
      'Nông nghiệp': 'bg-green-100 text-green-700',
      'Chăn nuôi': 'bg-blue-100 text-blue-700',
      'Đời sống': 'bg-purple-100 text-purple-700',
      'Tìm người giúp đỡ': 'bg-orange-100 text-orange-700',
      'Tin khẩn': 'bg-red-100 text-red-700',
      'Hỏi đáp': 'bg-indigo-100 text-indigo-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getLevelBadge = (level: string) => {
    const badges = {
      'Chuyên gia': 'bg-purple-100 text-purple-700',
      'Thành viên VIP': 'bg-yellow-100 text-yellow-700',
      'Thành viên tích cực': 'bg-green-100 text-green-700',
      'Thành viên': 'bg-blue-100 text-blue-700',
      'Thành viên mới': 'bg-gray-100 text-gray-700'
    };
    return badges[level] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${
      post.isVip ? 'border-yellow-300 ring-1 ring-yellow-200' : 'border-gray-200'
    } ${post.isPinned ? 'ring-2 ring-green-200' : ''}`}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start space-x-4">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getLevelBadge(post.author.level)}`}>
                    {post.author.level}
                  </span>
                  <span className="text-sm text-gray-600">{post.author.reputation} điểm</span>
                </div>
                
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <span>{post.createdAt}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                  {post.isPinned && (
                    <span className="flex items-center space-x-1 text-green-600">
                      <i className="ri-pushpin-line"></i>
                      <span className="text-xs">Ghim</span>
                    </span>
                  )}
                  {post.isVip && (
                    <span className="flex items-center space-x-1 text-yellow-600">
                      <i className="ri-vip-crown-line"></i>
                      <span className="text-xs">VIP</span>
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <i className="ri-bookmark-line"></i>
                </button>
                <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <i className="ri-more-2-line"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-4">
        <Link href={`/forum/${post.id}`} className="cursor-pointer">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 hover:text-green-600 transition-colors line-clamp-2">
            {post.title}
          </h2>
          <p className="text-gray-600 leading-relaxed line-clamp-3">
            {post.content}
          </p>
        </Link>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-200 cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <i className="ri-eye-line"></i>
              <span>{post.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <i className="ri-chat-3-line"></i>
              <span>{post.comments}</span>
            </div>
            <button className="flex items-center space-x-1 hover:text-red-500 transition-colors cursor-pointer">
              <i className="ri-heart-line"></i>
              <span>{post.likes}</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm cursor-pointer">
              <i className="ri-facebook-line"></i>
              <span>Chia sẻ</span>
            </button>
            <Link 
              href={`/forum/${post.id}`}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium cursor-pointer"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
