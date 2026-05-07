
'use client';

import { useState } from 'react';
import Link from 'next/link';
import JobCard from './JobCard';

const categories = [
  { id: 'all', name: 'Tất cả', count: 156, icon: 'ri-briefcase-line' },
  { id: 'agriculture', name: 'Nông nghiệp', count: 45, icon: 'ri-plant-line' },
  { id: 'construction', name: 'Xây dựng', count: 32, icon: 'ri-hammer-line' },
  { id: 'repair', name: 'Sửa chữa', count: 28, icon: 'ri-tools-line' },
  { id: 'cleaning', name: 'Dọn dẹp', count: 23, icon: 'ri-brush-line' },
  { id: 'petcare', name: 'Chăm sóc thú cưng', count: 15, icon: 'ri-bear-smile-line' },
  { id: 'childcare', name: 'Trông trẻ', count: 13, icon: 'ri-parent-line' }
];

const jobTypes = [
  { id: 'all', name: 'Tất cả loại', count: 156 },
  { id: 'hiring', name: 'Cần thuê', count: 89 },
  { id: 'seeking', name: 'Tìm việc', count: 67 }
];

const salaryRanges = [
  'Tất cả mức lương',
  'Dưới 200,000đ/ngày',
  '200,000 - 300,000đ/ngày',
  '300,000 - 500,000đ/ngày',
  'Trên 500,000đ/ngày',
  'Theo thỏa thuận'
];

const locations = [
  'Tất cả khu vực',
  'Trung tâm xã',
  'Khu dân cư',
  'Vùng nông nghiệp',
  'Khu công nghiệp',
  'Gần chợ',
  'Ven đường chính'
];

const mockJobs = [
  {
    id: 1,
    title: 'Cần thuê 5 người thu hoạch cà phê',
    type: 'hiring',
    category: 'agriculture',
    description: 'Cần thuê 5 người có kinh nghiệm thu hoạch cà phê Robusta. Công việc từ 6h sáng đến 5h chiều, bao cơm trưa. Yêu cầu có sức khỏe tốt, chịu khó.',
    image: 'https://readdy.ai/api/search-image?query=Vietnamese%20coffee%20harvest%20workers%20picking%20coffee%20beans%20in%20plantation%2C%20traditional%20farming%2C%20rural%20setting%2C%20people%20working%20together%2C%20authentic%20agricultural%20scene&width=300&height=200&seq=coffeejob1&orientation=landscape',
    location: 'Vườn cà phê Nhân Cơ',
    workTime: 'Từ 15/12 đến 30/12',
    salary: '350,000đ/ngày',
    contact: {
      name: 'Anh Minh',
      phone: '0912345678',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20coffee%20farmer%20portrait%20middle%20aged%20man%20friendly%20expression%20traditional%20rural%20setting%20natural%20lighting&width=50&height=50&seq=farmer1&orientation=squarish',
      userId: 'user123'
    },
    requirements: ['Có kinh nghiệm thu hoạch', 'Sức khỏe tốt', 'Chịu khó làm việc'],
    benefits: ['Bao cơm trưa', 'Trả lương hàng ngày', 'Thưởng cuối vụ'],
    createdAt: '30 phút trước',
    views: 89,
    applications: 12,
    isUrgent: true,
    hashtag: '#TuyenDungNongNghiep'
  },
  {
    id: 2,
    title: 'Tìm việc làm thợ xây có kinh nghiệm',
    type: 'seeking',
    category: 'construction',
    description: 'Tôi là thợ xây có 5 năm kinh nghiệm, biết đổ bê tông, xây tường, lát gạch. Có thể làm việc cả tuần, nhận công việc dài hạn hoặc ngắn hạn.',
    image: 'https://readdy.ai/api/search-image?query=Vietnamese%20construction%20worker%20portrait%20with%20tools%2C%20experienced%20builder%2C%20rural%20construction%20site%2C%20professional%20appearance%2C%20traditional%20work%20clothes&width=300&height=200&seq=builder1&orientation=landscape',
    location: 'Sẵn sàng đi xa trong xã',
    workTime: 'Linh hoạt',
    salary: '400,000đ/ngày',
    contact: {
      name: 'Anh Đức',
      phone: '0987654321',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20construction%20worker%20portrait%20experienced%20builder%20friendly%20expression%20work%20clothes%20rural%20setting&width=50&height=50&seq=worker1&orientation=squarish',
      userId: 'user456'
    },
    skills: ['Đổ bê tông', 'Xây tường', 'Lát gạch', 'Sơn nhà'],
    experience: '5 năm kinh nghiệm',
    createdAt: '1 giờ trước',
    views: 67,
    applications: 8,
    isUrgent: false,
    hashtag: '#TimViecXayDung'
  },
  {
    id: 3,
    title: 'Cần người dọn vệ sinh nhà cửa',
    type: 'hiring',
    category: 'cleaning',
    description: 'Cần thuê người dọn vệ sinh nhà cửa 2 lần/tuần (thứ 3 và thứ 6). Nhà 2 tầng, có sân vườn. Công việc nhẹ nhàng, phù hợp với chị em.',
    image: 'https://readdy.ai/api/search-image?query=Vietnamese%20house%20cleaning%20service%2C%20woman%20cleaning%20traditional%20rural%20house%2C%20domestic%20work%2C%20clean%20organized%20home%20interior%2C%20professional%20cleaning&width=300&height=200&seq=cleaning1&orientation=landscape',
    location: 'Trung tâm xã Nhân Cơ',
    workTime: 'Thứ 3 và thứ 6 hàng tuần',
    salary: '200,000đ/lần',
    contact: {
      name: 'Chị Lan',
      phone: '0934567890',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20middle%20aged%20woman%20portrait%20kind%20expression%20traditional%20clothes%20rural%20setting%20natural%20lighting&width=50&height=50&seq=woman1&orientation=squarish',
      userId: 'user789'
    },
    requirements: ['Cẩn thận', 'Sạch sẽ', 'Có kinh nghiệm'],
    benefits: ['Lương ổn định', 'Môi trường thân thiện', 'Có thể thương lượng giờ giấc'],
    createdAt: '2 giờ trước',
    views: 45,
    applications: 6,
    isUrgent: false,
    hashtag: '#TuyenDungDonDep'
  },
  {
    id: 4,
    title: 'Tìm việc chăm sóc thú cưng',
    type: 'seeking',
    category: 'petcare',
    description: 'Tôi yêu thích động vật, có kinh nghiệm chăm sóc chó mèo. Có thể tắm rửa, cho ăn, dắt đi dạo, chăm sóc khi ốm. Làm việc cả cuối tuần.',
    image: 'https://readdy.ai/api/search-image?query=Vietnamese%20person%20caring%20for%20pets%2C%20dog%20and%20cat%20care%2C%20pet%20grooming%2C%20rural%20pet%20care%20service%2C%20loving%20animal%20care%2C%20traditional%20village%20setting&width=300&height=200&seq=petcare1&orientation=landscape',
    location: 'Khu vực trung tâm xã',
    workTime: 'Cả tuần kể cả cuối tuần',
    salary: '150,000đ/ngày',
    contact: {
      name: 'Chị Hương',
      phone: '0945678901',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20young%20woman%20portrait%20caring%20expression%20with%20pets%20rural%20setting%20natural%20lighting%20animal%20lover&width=50&height=50&seq=petlover1&orientation=squarish',
      userId: 'user101'
    },
    skills: ['Tắm rửa thú cưng', 'Cho ăn đúng giờ', 'Dắt đi dạo', 'Chăm sóc khi ốm'],
    experience: '2 năm kinh nghiệm',
    createdAt: '3 giờ trước',
    views: 34,
    applications: 4,
    isUrgent: false,
    hashtag: '#TimViecChamSocThuCung'
  },
  {
    id: 5,
    title: 'Cần thợ sửa chữa điện nước',
    type: 'hiring',
    category: 'repair',
    description: 'Cần thuê thợ có kinh nghiệm sửa chữa điện nước trong nhà. Công việc bao gồm thay bóng đèn, sửa ổ cắm, thông tắc cống, sửa vòi nước.',
    image: 'https://readdy.ai/api/search-image?query=Vietnamese%20electrician%20plumber%20repair%20work%2C%20fixing%20electrical%20and%20water%20systems%2C%20traditional%20rural%20house%20maintenance%2C%20professional%20repair%20service&width=300&height=200&seq=repair1&orientation=landscape',
    location: 'Khu dân cư Nhân Cơ',
    workTime: 'Theo yêu cầu',
    salary: 'Theo công việc',
    contact: {
      name: 'Anh Tùng',
      phone: '0956789012',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20homeowner%20portrait%20middle%20aged%20man%20concerned%20expression%20traditional%20rural%20house%20background&width=50&height=50&seq=homeowner1&orientation=squarish',
      userId: 'user102'
    },
    requirements: ['Có kinh nghiệm điện nước', 'Có dụng cụ', 'Làm việc cẩn thận'],
    benefits: ['Trả tiền ngay', 'Có thể làm dài hạn', 'Giá cả thỏa thuận'],
    createdAt: '4 giờ trước',
    views: 56,
    applications: 9,
    isUrgent: true,
    hashtag: '#TuyenDungSuaChua'
  },
  {
    id: 6,
    title: 'Tìm việc trông trẻ có kinh nghiệm',
    type: 'seeking',
    category: 'childcare',
    description: 'Tôi có 3 năm kinh nghiệm trông trẻ từ 1-5 tuổi. Biết nấu cháo, cho ăn, ru ngủ, chơi cùng trẻ. Có thể làm cả ngày hoặc theo giờ.',
    image: 'https://readdy.ai/api/search-image?query=Vietnamese%20childcare%20worker%20with%20children%2C%20babysitter%20playing%20with%20kids%2C%20rural%20childcare%20service%2C%20caring%20woman%20with%20toddlers%2C%20traditional%20family%20setting&width=300&height=200&seq=childcare1&orientation=landscape',
    location: 'Trong xã Nhân Cơ',
    workTime: 'Linh hoạt theo nhu cầu',
    salary: '180,000đ/ngày',
    contact: {
      name: 'Chị Mai',
      phone: '0967890123',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20woman%20portrait%20caring%20expression%20childcare%20worker%20traditional%20clothes%20rural%20setting%20maternal%20look&width=50&height=50&seq=caregiver1&orientation=squarish',
      userId: 'user103'
    },
    skills: ['Chăm sóc trẻ nhỏ', 'Nấu cháo dinh dưỡng', 'Ru ngủ', 'Chơi giáo dục'],
    experience: '3 năm kinh nghiệm',
    createdAt: '5 giờ trước',
    views: 78,
    applications: 11,
    isUrgent: false,
    hashtag: '#TimViecTrongTre'
  }
];

export default function JobsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedJobType, setSelectedJobType] = useState('all');
  const [selectedSalary, setSelectedSalary] = useState('Tất cả mức lương');
  const [selectedLocation, setSelectedLocation] = useState('Tất cả khu vực');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = mockJobs.filter(job => {
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    const matchesJobType = selectedJobType === 'all' || job.type === selectedJobType;
    const matchesLocation = selectedLocation === 'Tất cả khu vực' || job.location.includes(selectedLocation);
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesJobType && matchesLocation && matchesSearch;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (a.isUrgent && !b.isUrgent) return -1;
    if (!a.isUrgent && b.isUrgent) return 1;
    return b.id - a.id;
  });

  return (
    <div className="min-h-screen bg-gray-50">      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-8 mb-8 text-white">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Tuyển dụng</h1>
            <p className="text-indigo-100 text-lg mb-6">
              Nền tảng kết nối người tìm việc và nhà tuyển dụng trong cộng đồng
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                <i className="ri-search-line text-gray-400"></i>
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm công việc, kỹ năng, địa điểm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-full text-lg focus:outline-none focus:ring-4 focus:ring-indigo-300"
              />
            </div>
            
            <div className="flex justify-center mt-6">
              <Link href="/jobs/create" className="bg-white text-indigo-600 px-8 py-3 rounded-lg hover:bg-indigo-50 transition-colors font-semibold cursor-pointer">
                <i className="ri-add-line mr-2"></i>
                Đăng tin tuyển dụng
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
                <div className="text-center p-3 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">156</div>
                  <div className="text-sm text-indigo-600">Tin đăng</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">89</div>
                  <div className="text-sm text-green-600">Cần thuê</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">67</div>
                  <div className="text-sm text-orange-600">Tìm việc</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">45</div>
                  <div className="text-sm text-blue-600">Nông nghiệp</div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lĩnh vực</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCategory === category.id
                        ? 'bg-indigo-100 text-indigo-800'
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

            {/* Job Type Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Loại tin</h3>
              <div className="space-y-2">
                {jobTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedJobType(type.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                      selectedJobType === type.id
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{type.name}</span>
                    <span className="text-sm text-gray-500">({type.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Salary Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mức lương</h3>
              <select
                value={selectedSalary}
                onChange={(e) => setSelectedSalary(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-8 cursor-pointer"
              >
                {salaryRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Khu vực</h3>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-8 cursor-pointer"
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
                  Hiển thị {sortedJobs.length} kết quả
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Link href="/jobs/create" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium cursor-pointer">
                  <i className="ri-add-line mr-1"></i>
                  Đăng tin
                </Link>
              </div>
            </div>

            {/* Jobs List */}
            <div className="space-y-6">
              {sortedJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {sortedJobs.length === 0 && (
              <div className="bg-white rounded-xl p-12 text-center">
                <i className="ri-briefcase-line text-gray-300 text-6xl mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
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
