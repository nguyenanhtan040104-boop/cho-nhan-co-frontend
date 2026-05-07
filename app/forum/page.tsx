
'use client';

import Link from 'next/link';
import { useState } from 'react';
import ForumSidebar from './ForumSidebar';
import PostCard from './PostCard';

const mockPosts = [
  {
    id: 1,
    title: 'Cách trồng rau muống sạch tại nhà cho năng suất cao',
    content: 'Chia sẻ kinh nghiệm trồng rau muống từ hạt giống đến thu hoạch, đảm bảo rau sạch không thuốc trừ sâu...',
    author: {
      name: 'Nguyễn Văn Thành',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20farmer%20portrait%20smiling%20elderly%20man%20wearing%20straw%20hat%20in%20rural%20countryside%20setting%2C%20friendly%20expression%2C%20natural%20lighting%2C%20photorealistic%20style&width=50&height=50&seq=avatar1&orientation=squarish',
      level: 'Thành viên tích cực',
      reputation: 1250
    },
    category: 'Nông nghiệp',
    createdAt: '2 giờ trước',
    views: 324,
    likes: 45,
    comments: 12,
    isVip: true,
    isPinned: false,
    tags: ['trồng trọt', 'rau sạch', 'kinh nghiệm']
  },
  {
    id: 2,
    title: '[KHẨN CẤP] Cần tìm thuốc chữa bệnh tụ huyết trùng cho heo',
    content: 'Đàn heo nhà tôi bị bệnh tụ huyết trùng, cần tìm thuốc và phương pháp điều trị khẩn cấp. Ai có kinh nghiệm xin chia sẻ...',
    author: {
      name: 'Trần Thị Mai',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20woman%20farmer%20portrait%20middle%20aged%20wearing%20traditional%20clothing%20in%20rural%20village%2C%20concerned%20expression%2C%20natural%20outdoor%20lighting&width=50&height=50&seq=avatar2&orientation=squarish',
      level: 'Thành viên mới',
      reputation: 85
    },
    category: 'Tin khẩn',
    createdAt: '4 giờ trước',
    views: 156,
    likes: 8,
    comments: 23,
    isVip: false,
    isPinned: true,
    tags: ['chăn nuôi', 'bệnh tật', 'cần giúp đỡ']
  },
  {
    id: 3,
    title: 'Chia sẻ cách làm bánh chưng ngon đúng vị truyền thống',
    content: 'Sắp Tết rồi, chia sẻ với mọi người cách làm bánh chưng thơm ngon như thời xưa. Bí quyết ở khâu chọn lá và cách gói...',
    author: {
      name: 'Lê Văn Đức',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20elderly%20man%20portrait%20traditional%20cook%20wearing%20white%20shirt%20in%20kitchen%20warm%20smile%20traditional%20Vietnamese%20cooking%20background&width=50&height=50&seq=avatar3&orientation=squarish',
      level: 'Chuyên gia',
      reputation: 2840
    },
    category: 'Đời sống',
    createdAt: '6 giờ trước',
    views: 892,
    likes: 128,
    comments: 34,
    isVip: false,
    isPinned: false,
    tags: ['nấu ăn', 'truyền thống', 'tết nguyên đán']
  },
  {
    id: 4,
    title: 'Tuyển thợ thu hoạch lúa tại Cần Thơ - Lương cao',
    content: 'Cần tuyển 10 thợ thu hoạch lúa, làm việc tại các xã thuộc Cần Thơ. Lương 300k/ngày, bao ăn trưa...',
    author: {
      name: 'Phạm Minh Tâm',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20business%20man%20portrait%20confident%20expression%20wearing%20casual%20shirt%20professional%20headshot%20clean%20background%20natural%20lighting&width=50&height=50&seq=avatar4&orientation=squarish',
      level: 'Thành viên VIP',
      reputation: 1650
    },
    category: 'Tìm người giúp đỡ',
    createdAt: '8 giờ trước',
    views: 445,
    likes: 23,
    comments: 18,
    isVip: true,
    isPinned: false,
    tags: ['tuyển dụng', 'thu hoạch', 'cần thơ']
  },
  {
    id: 5,
    title: 'Hỏi về cách phòng bệnh đốm lá cho cây ớt',
    content: 'Vườn ớt nhà em bị bệnh đốm lá, lá vàng rụng nhiều. Các anh chị có kinh nghiệm chỉ cách phòng và trị bệnh...',
    author: {
      name: 'Hoàng Thị Lan',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20young%20woman%20farmer%20portrait%20wearing%20sun%20hat%20in%20vegetable%20garden%20questioning%20expression%20natural%20outdoor%20environment&width=50&height=50&seq=avatar5&orientation=squarish',
      level: 'Thành viên',
      reputation: 420
    },
    category: 'Hỏi đáp',
    createdAt: '1 ngày trước',
    views: 234,
    likes: 15,
    comments: 27,
    isVip: false,
    isPinned: false,
    tags: ['bệnh cây trồng', 'ớt', 'hỏi đáp']
  },
  {
    id: 6,
    title: 'Kinh nghiệm nuôi gà ta thả vườn hiệu quả',
    content: 'Sau 2 năm nuôi gà ta thả vườn, tôi muốn chia sẻ những kinh nghiệm về cách chọn giống, chăm sóc và phòng bệnh...',
    author: {
      name: 'Võ Thanh Long',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20middle%20aged%20man%20farmer%20portrait%20wearing%20traditional%20farming%20clothes%20experienced%20look%20chicken%20coop%20background%20rural%20setting&width=50&height=50&seq=avatar6&orientation=squarish',
      level: 'Thành viên tích cực',
      reputation: 980
    },
    category: 'Chăn nuôi',
    createdAt: '1 ngày trước',
    views: 567,
    likes: 72,
    comments: 29,
    isVip: false,
    isPinned: false,
    tags: ['chăn nuôi', 'gà ta', 'kinh nghiệm']
  }
];

export default function ForumPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('Mới nhất');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { name: 'Tất cả', count: 156, icon: 'ri-discuss-line' },
    { name: 'Nông nghiệp', count: 45, icon: 'ri-plant-line' },
    { name: 'Chăn nuôi', count: 32, icon: 'ri-bear-smile-line' },
    { name: 'Đời sống', count: 28, icon: 'ri-home-heart-line' },
    { name: 'Tìm người giúp đỡ', count: 19, icon: 'ri-hand-heart-line' },
    { name: 'Tin khẩn', count: 12, icon: 'ri-alarm-warning-line' },
    { name: 'Hỏi đáp', count: 20, icon: 'ri-question-answer-line' }
  ];

  const sortOptions = ['Mới nhất', 'Nhiều lượt xem', 'Nhiều bình luận', 'Nhiều thích'];

  const filteredPosts = mockPosts.filter(post => {
    const matchesCategory = selectedCategory === 'Tất cả' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    switch (sortBy) {
      case 'Nhiều lượt xem':
        return b.views - a.views;
      case 'Nhiều bình luận':
        return b.comments - a.comments;
      case 'Nhiều thích':
        return b.likes - a.likes;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 mb-8 text-white">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Diễn đàn cộng đồng</h1>
            <p className="text-green-100 text-lg mb-6">
              Chia sẻ kinh nghiệm, thảo luận và kết nối với cộng đồng nông dân Kon Tum
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                <i className="ri-search-line text-gray-400"></i>
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm bài viết, chủ đề..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-full text-lg focus:outline-none focus:ring-4 focus:ring-green-300"
              />
            </div>
            
            <div className="flex justify-center mt-6">
              <Link href="/forum/create" className="bg-white text-green-600 px-8 py-3 rounded-lg hover:bg-green-50 transition-colors font-semibold cursor-pointer">
                <i className="ri-add-line mr-2"></i>
                Tạo bài viết mới
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <ForumSidebar 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Hiển thị {filteredPosts.length} bài viết
                </span>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 text-green-600 hover:text-green-700 cursor-pointer"
                >
                  <i className="ri-filter-line"></i>
                  <span className="text-sm">Bộ lọc</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-8 cursor-pointer"
                >
                  <option value="Mới nhất">Mới nhất</option>
                  <option value="Nhiều lượt xem">Phổ biến</option>
                  <option value="Nhiều thích">Nhiều like nhất</option>
                  <option value="Nhiều bình luận">Nhiều bình luận</option>
                </select>
                <Link href="/forum/create" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium cursor-pointer">
                  <i className="ri-add-line mr-1"></i>
                  Tạo bài viết
                </Link>
              </div>
            </div>

            {/* Posts List */}
            <div className="space-y-6">
              {sortedPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {sortedPosts.length === 0 && (
              <div className="bg-white rounded-xl p-12 text-center">
                <i className="ri-chat-3-line text-gray-300 text-6xl mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bài viết nào</h3>
                <p className="text-gray-600 mb-4">Hãy là người đầu tiên tạo bài viết trong chủ đề này</p>
                <Link href="/forum/create" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer">
                  Tạo bài viết đầu tiên
                </Link>
              </div>
            )}

            {/* Load More */}
            <div className="text-center mt-8">
              <button className="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer">
                Xem thêm bài viết
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}