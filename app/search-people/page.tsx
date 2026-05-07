
'use client';

import { useState } from 'react';
import Link from 'next/link';
import SearchPeopleHeader from './SearchPeopleHeader';
import SearchPeopleCard from './SearchPeopleCard';

const categories = [
  { id: 'all', name: 'Tất cả', count: 89, icon: 'ri-search-line' },
  { id: 'people', name: 'Người thân', count: 23, icon: 'ri-user-search-line' },
  { id: 'pets', name: 'Thú cưng', count: 34, icon: 'ri-bear-smile-line' },
  { id: 'objects', name: 'Đồ vật', count: 32, icon: 'ri-briefcase-line' }
];

const statusTypes = [
  { id: 'all', name: 'Tất cả trạng thái', count: 89 },
  { id: 'new', name: 'Mới đăng', count: 45 },
  { id: 'searching', name: 'Đang tìm', count: 32 },
  { id: 'found', name: 'Đã tìm thấy', count: 12 }
];

const locations = [
  'Tất cả khu vực', 'Trung tâm thành phố', 'Khu dân cư', 'Chợ truyền thống', 
  'Trường học', 'Bệnh viện', 'Công viên', 'Bến xe'
];

const mockPosts = [
  {
    id: 1,
    title: 'Tìm chiếc iPhone 13 màu xanh thất lạc tại chợ',
    type: 'objects',
    status: 'searching',
    description: 'Chiếc điện thoại iPhone 13 Pro màu xanh alpine, có ốp lưng trong suốt, bên trong có ảnh gia đình. Thất lạc vào sáng ngày 15/11 tại khu vực quầy rau củ chợ Nhân Cơ.',
    image: 'https://readdy.ai/api/search-image?query=Lost%20iPhone%2013%20blue%20color%20on%20traditional%20Vietnamese%20market%20table%2C%20rural%20market%20setting%2C%20simple%20clean%20background%2C%20realistic%20product%20photography&width=300&height=200&seq=lostphone2&orientation=landscape',
    location: 'Chợ Nhân Cơ, Kon Tum',
    lostDate: '15/11/2024',
    lostTime: '7:30 sáng',
    contact: {
      name: 'Nguyễn Văn Minh',
      phone: '0912345678',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20man%20portrait%20worried%20expression%20traditional%20clothes%20rural%20setting%20natural%20lighting%20photorealistic&width=50&height=50&seq=contact1&orientation=squarish'
    },
    reward: '2,000,000đ',
    createdAt: '30 phút trước',
    views: 156,
    shares: 23,
    isPinned: true,
    isUrgent: true,
    hashtag: '#TimDoThatLac'
  },
  {
    id: 2,
    title: 'Tìm chú chó Golden Retriever tên Lucky',
    type: 'pets',
    status: 'searching',
    description: 'Chú chó Golden Retriever đực, 2 tuổi, lông vàng, đeo vòng cổ màu đỏ có tên Lucky. Mất tích từ nhà gần chợ vào chiều qua, rất thân thiện với người.',
    image: 'https://readdy.ai/api/search-image?query=Golden%20Retriever%20dog%20missing%20pet%20with%20red%20collar%20friendly%20expression%20outdoor%20Vietnamese%20rural%20setting%20natural%20lighting&width=300&height=200&seq=lostdog1&orientation=landscape',
    location: 'Gần chợ Nhân Cơ',
    lostDate: '14/11/2024',
    lostTime: '5:00 chiều',
    contact: {
      name: 'Trần Thị Lan',
      phone: '0987654321',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20woman%20portrait%20sad%20expression%20caring%20look%20traditional%20clothes%20rural%20village%20natural%20lighting&width=50&height=50&seq=contact2&orientation=squarish'
    },
    reward: '1,500,000đ',
    createdAt: '2 giờ trước',
    views: 89,
    shares: 34,
    isPinned: false,
    isUrgent: true,
    hashtag: '#TimDoThatLac'
  },
  {
    id: 3,
    title: 'Tìm ông Lê Văn Hùng, 68 tuổi, mất tích từ sáng nay',
    type: 'people',
    status: 'searching',
    description: 'Ông Lê Văn Hùng, 68 tuổi, cao khoảng 1m65, tóc bạc, mặc áo sơ mi trắng, quần tây đen. Có dấu hiệu sa sút trí tuệ, ra khỏi nhà từ 6h sáng chưa về.',
    image: 'https://readdy.ai/api/search-image?query=Vietnamese%20elderly%20man%20portrait%2068%20years%20old%20white%20shirt%20black%20pants%20traditional%20Vietnamese%20rural%20setting%20concerned%20family%20photo%20style&width=300&height=200&seq=lostperson1&orientation=landscape',
    location: 'Khu vực trung tâm xã',
    lostDate: '15/11/2024',
    lostTime: '6:00 sáng',
    contact: {
      name: 'Lê Thị Mai (con gái)',
      phone: '0934567890',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20woman%20portrait%20worried%20expression%20daughter%20looking%20for%20father%20traditional%20clothes%20natural%20lighting&width=50&height=50&seq=contact3&orientation=squarish'
    },
    reward: 'Hậu tạ',
    createdAt: '4 giờ trước',
    views: 234,
    shares: 67,
    isPinned: true,
    isUrgent: true,
    hashtag: '#TimDoThatLac'
  },
  {
    id: 4,
    title: 'Tìm chiếc ví da màu nâu thất lạc',
    type: 'objects',
    status: 'searching',
    description: 'Chiếc ví da màu nâu, bên trong có CMND, bằng lái xe và một số tiền mặt. Thất lạc vào chiều qua khi đi chợ mua đồ.',
    image: 'https://readdy.ai/api/search-image?query=Lost%20brown%20leather%20wallet%20on%20market%20ground%2C%20Vietnamese%20rural%20market%20setting%2C%20simple%20background%2C%20realistic%20photography&width=300&height=200&seq=lostwallet2&orientation=landscape',
    location: 'Khu vực chợ và bến xe',
    lostDate: '14/11/2024',
    lostTime: '3:00 chiều',
    contact: {
      name: 'Phạm Văn Đức',
      phone: '0945678901',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20middle%20aged%20man%20portrait%20concerned%20expression%20traditional%20rural%20setting%20natural%20lighting&width=50&height=50&seq=contact4&orientation=squarish'
    },
    reward: '500,000đ',
    createdAt: '1 ngày trước',
    views: 78,
    shares: 12,
    isPinned: false,
    isUrgent: false,
    hashtag: '#TimDoThatLac'
  },
  {
    id: 5,
    title: 'ĐÃ TÌM THẤY: Bé gái 5 tuổi đã về với gia đình',
    type: 'people',
    status: 'found',
    description: 'Cập nhật: Bé Nguyễn Thị An, 5 tuổi đã được tìm thấy an toàn tại nhà bà ngoại. Cảm ơn sự hỗ trợ của cộng đồng.',
    image: 'https://readdy.ai/api/search-image?query=Happy%20Vietnamese%20family%20reunion%20little%20girl%20found%20safe%20traditional%20rural%20village%20setting%20joyful%20atmosphere%20natural%20lighting&width=300&height=200&seq=found1&orientation=landscape',
    location: 'Đã tìm thấy tại nhà bà ngoại',
    lostDate: '13/11/2024',
    lostTime: '2:00 chiều',
    contact: {
      name: 'Nguyễn Văn Thắng (bố)',
      phone: '0956789012',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20father%20portrait%20happy%20relieved%20expression%20traditional%20clothes%20rural%20setting%20natural%20lighting&width=50&height=50&seq=contact5&orientation=squarish'
    },
    reward: 'Đã tìm thấy',
    createdAt: '2 ngày trước',
    views: 456,
    shares: 89,
    isPinned: false,
    isUrgent: false,
    hashtag: '#TimDoThatLac'
  },
  {
    id: 6,
    title: 'Tìm chìa khóa xe máy thất lạc tại bến xe',
    type: 'objects',
    status: 'searching',
    description: 'Chùm chìa khóa xe máy Honda Wave có móc khóa hình con cá, thất lạc tại bến xe buổi sáng. Rất cần tìm lại để đi làm.',
    image: 'https://readdy.ai/api/search-image?query=Lost%20motorcycle%20keys%20on%20ground%2C%20Vietnamese%20bus%20station%20setting%2C%20simple%20background%2C%20realistic%20photography&width=300&height=200&seq=lostkeys2&orientation=landscape',
    location: 'Bến xe Nhân Cơ',
    lostDate: '15/11/2024',
    lostTime: '8:00 sáng',
    contact: {
      name: 'Hoàng Thị Nga',
      phone: '0967890123',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20woman%20portrait%20worried%20expression%20looking%20for%20keys%20traditional%20clothes%20rural%20setting&width=50&height=50&seq=contact6&orientation=squarish'
    },
    reward: '200,000đ',
    createdAt: '6 giờ trước',
    views: 67,
    shares: 8,
    isPinned: false,
    isUrgent: false,
    hashtag: '#TimDoThatLac'
  }
];

export default function SearchPeoplePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('Tất cả khu vực');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredPosts = mockPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.type === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || post.status === selectedStatus;
    const matchesLocation = selectedLocation === 'Tất cả khu vực' || post.location.includes(selectedLocation);
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesLocation && matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (a.isUrgent && !b.isUrgent) return -1;
    if (!a.isUrgent && b.isUrgent) return 1;
    return b.id - a.id;
  });

  return (
    <div className="min-h-screen bg-gray-50">      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-8 mb-8 text-white">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Tìm đồ thất lạc</h1>
            <p className="text-red-100 text-lg mb-6">
              Cộng đồng hỗ trợ tìm kiếm người thân, thú cưng và đồ vật thất lạc
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                <i className="ri-search-line text-gray-400"></i>
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, mô tả, địa điểm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-full text-lg focus:outline-none focus:ring-4 focus:ring-red-300"
              />
            </div>
            
            <div className="flex justify-center mt-6">
              <Link href="/search-people/create" className="bg-white text-red-600 px-8 py-3 rounded-lg hover:bg-red-50 transition-colors font-semibold cursor-pointer">
                <i className="ri-add-line mr-2"></i>
                Đăng tin tìm kiếm
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">89</div>
                  <div className="text-sm text-red-600">Tin đăng</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">12</div>
                  <div className="text-sm text-green-600">Đã tìm thấy</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">32</div>
                  <div className="text-sm text-orange-600">Đang tìm</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">45</div>
                  <div className="text-sm text-blue-600">Mới đăng</div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Loại</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCategory === category.id
                        ? 'bg-red-100 text-red-800'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <i className={`${category.icon} text-lg`}></i>
                      <span>{category.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">({category.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái</h3>
              <div className="space-y-2">
                {statusTypes.map(status => (
                  <button
                    key={status.id}
                    onClick={() => setSelectedStatus(status.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                      selectedStatus === status.id
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{status.name}</span>
                    <span className="text-sm text-gray-500">({status.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Khu vực</h3>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 pr-8 cursor-pointer"
              >
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Hiển thị {sortedPosts.length} kết quả
                </span>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-7  cursor-pointer"
                >
                  <i className="ri-filter-line"></i>
                  <span className="text-sm">Bộ lọc</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Link href="/search-people/create" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium cursor-pointer">
                  <i className="ri-add-line mr-1"></i>
                  Đăng tin
                </Link>
              </div>
            </div>

            {/* Posts List */}
            <div className="space-y-6">
              {sortedPosts.map(post => (
                <SearchPeopleCard key={post.id} post={post} />
              ))}
            </div>

            {sortedPosts.length === 0 && (
              <div className="bg-white rounded-xl p-12 text-center">
                <i className="ri-search-line text-gray-300 text-6xl mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không có kết quả</h3>
                <p className="text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            )}

            {/* Load More */}
            <div className="text-center mt-8">
              <button className="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer">
                Xem thêm tin đăng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
