'use client';

import { useState } from 'react';
import Link from 'next/link';
import RealEstateCard from './RealEstateCard';

const categories = [
  { id: 'all', name: 'Tất cả bất động sản', count: 89 },
  { id: 'house', name: 'Nhà ở', count: 32 },
  { id: 'land', name: 'Đất nền', count: 28 },
  { id: 'room', name: 'Phòng trọ', count: 15 },
  { id: 'commercial', name: 'Mặt bằng kinh doanh', count: 14 }
];

const transactionTypes = [
  { id: 'all', name: 'Tất cả', count: 89 },
  { id: 'sell', name: 'Bán', count: 45 },
  { id: 'rent', name: 'Cho thuê', count: 32 },
  { id: 'transfer', name: 'Sang nhượng', count: 12 }
];

const statusTypes = [
  { id: 'all', name: 'Tất cả trạng thái' },
  { id: 'new', name: 'Mới đăng' },
  { id: 'trading', name: 'Đang giao dịch' },
  { id: 'completed', name: 'Đã hoàn tất' }
];

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-low', label: 'Giá thấp đến cao' },
  { value: 'price-high', label: 'Giá cao đến thấp' },
  { value: 'area-large', label: 'Diện tích lớn đến nhỏ' },
  { value: 'area-small', label: 'Diện tích nhỏ đến lớn' }
];

const mockRealEstate = [
  {
    id: 1,
    title: 'Đất vườn 2000m² mặt tiền đường liên xã',
    price: 450000000,
    pricePerM2: 225000,
    area: 2000,
    type: 'land',
    transactionType: 'sell',
    status: 'new',
    images: [
      'https://readdy.ai/api/search-image?query=Rural%20Vietnamese%20farmland%20plot%20with%20road%20frontage%2C%20green%20fields%2C%20coconut%20palm%20trees%2C%20traditional%20Vietnamese%20village%20in%20background%2C%20peaceful%20countryside%20landscape%2C%20clear%20blue%20sky&width=400&height=300&seq=land1&orientation=landscape'
    ],
    address: 'Đường Nhân Cơ - Đăk Tô, Kon Tum',
    description: 'Đất vườn màu mỡ, mặt tiền đường liên xã rộng 6m, có thể phân lô được. Đất vuông vắn, có ao cá, cây ăn trái lâu năm.',
    legalStatus: 'Sổ đỏ chính chủ',
    seller: {
      name: 'Nguyễn Văn Minh',
      phone: '0912345678',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20middle-aged%20man%20portrait%2C%20friendly%20face%2C%20professional%20headshot%20style&width=100&height=100&seq=seller1&orientation=squarish',
      isAgent: false,
      rating: 4.8,
      totalListings: 3
    },
    postedDate: '2024-01-15',
    isVip: true,
    isFeatured: true,
    viewCount: 245
  },
  {
    id: 2,
    title: 'Nhà cấp 4 có vườn 500m² trung tâm xã',
    price: 280000000,
    pricePerM2: 560000,
    area: 500,
    type: 'house',
    transactionType: 'sell',
    status: 'trading',
    images: [
      'https://readdy.ai/api/search-image?query=Traditional%20Vietnamese%20rural%20house%20with%20garden%2C%20single%20story%20home%2C%20green%20yard%2C%20peaceful%20countryside%20setting%2C%20authentic%20village%20architecture&width=400&height=300&seq=house1&orientation=landscape'
    ],
    address: 'Trung tâm xã Nhân Cơ, Kon Tum',
    description: 'Nhà cấp 4 kiên cố, 3 phòng ngủ, 2 phòng tắm. Vườn rộng trồng cây ăn trái, gần trường học và chợ.',
    legalStatus: 'Sổ đỏ chính chủ',
    seller: {
      name: 'Trần Thị Lan',
      phone: '0987654321',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20middle-aged%20woman%20portrait%2C%20friendly%20face%2C%20professional%20headshot%20style&width=100&height=100&seq=seller2&orientation=squarish',
      isAgent: false,
      rating: 4.6,
      totalListings: 2
    },
    postedDate: '2024-01-12',
    isVip: false,
    isFeatured: true,
    viewCount: 189
  },
  {
    id: 3,
    title: 'Phòng trọ cho thuê gần chợ Nhân Cơ',
    price: 800000,
    pricePerM2: 32000,
    area: 25,
    type: 'room',
    transactionType: 'rent',
    status: 'new',
    images: [
      'https://readdy.ai/api/search-image?query=Simple%20rental%20room%20in%20Vietnamese%20rural%20area%2C%20clean%20interior%2C%20basic%20furniture%2C%20affordable%20housing%2C%20countryside%20accommodation&width=400&height=300&seq=room1&orientation=landscape'
    ],
    address: 'Gần chợ Nhân Cơ, Kon Tum',
    description: 'Phòng trọ sạch sẽ, đầy đủ tiện nghi cơ bản. Có điều hòa, tủ lạnh, giường tủ. An ninh tốt.',
    legalStatus: 'Hợp đồng thuê',
    seller: {
      name: 'Lê Văn Hùng',
      phone: '0901234567',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20young%20man%20portrait%2C%20friendly%20face%2C%20professional%20headshot%20style&width=100&height=100&seq=seller3&orientation=squarish',
      isAgent: false,
      rating: 4.4,
      totalListings: 5
    },
    postedDate: '2024-01-14',
    isVip: false,
    isFeatured: false,
    viewCount: 156
  },
  {
    id: 4,
    title: 'Mặt bằng kinh doanh mặt tiền chợ',
    price: 15000000,
    pricePerM2: 300000,
    area: 50,
    type: 'commercial',
    transactionType: 'rent',
    status: 'new',
    images: [
      'https://readdy.ai/api/search-image?query=Vietnamese%20rural%20market%20storefront%2C%20commercial%20space%20for%20rent%2C%20traditional%20market%20setting%2C%20business%20opportunity&width=400&height=300&seq=commercial1&orientation=landscape'
    ],
    address: 'Mặt tiền chợ Nhân Cơ, Kon Tum',
    description: 'Mặt bằng kinh doanh vị trí đẹp, mặt tiền chợ đông đúc. Thích hợp kinh doanh tạp hóa, quán ăn.',
    legalStatus: 'Hợp đồng thuê dài hạn',
    seller: {
      name: 'Phạm Văn Đức',
      phone: '0934567890',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20businessman%20portrait%2C%20professional%20appearance%2C%20confident%20look&width=100&height=100&seq=seller4&orientation=squarish',
      isAgent: true,
      rating: 4.9,
      totalListings: 12
    },
    postedDate: '2024-01-13',
    isVip: true,
    isFeatured: true,
    viewCount: 298
  },
  {
    id: 5,
    title: 'Đất nền thổ cư 300m² gần trường học',
    price: 180000000,
    pricePerM2: 600000,
    area: 300,
    type: 'land',
    transactionType: 'sell',
    status: 'trading',
    images: [
      'https://readdy.ai/api/search-image?query=Residential%20land%20plot%20in%20Vietnamese%20rural%20area%2C%20empty%20lot%20ready%20for%20construction%2C%20peaceful%20neighborhood%20setting&width=400&height=300&seq=land2&orientation=landscape'
    ],
    address: 'Gần trường THCS Nhân Cơ, Kon Tum',
    description: 'Đất nền thổ cư 100%, vuông vắn, mặt tiền 12m. Vị trí đẹp gần trường học, thuận tiện xây nhà ở.',
    legalStatus: 'Sổ đỏ chính chủ',
    seller: {
      name: 'Hoàng Thị Mai',
      phone: '0945678901',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20woman%20portrait%2C%20middle-aged%2C%20friendly%20smile%2C%20professional%20headshot&width=100&height=100&seq=seller5&orientation=squarish',
      isAgent: false,
      rating: 4.7,
      totalListings: 1
    },
    postedDate: '2024-01-10',
    isVip: false,
    isFeatured: false,
    viewCount: 167
  },
  {
    id: 6,
    title: 'Nhà 2 tầng mặt tiền đường chính',
    price: 650000000,
    pricePerM2: 1300000,
    area: 500,
    type: 'house',
    transactionType: 'sell',
    status: 'completed',
    images: [
      'https://readdy.ai/api/search-image?query=Two-story%20Vietnamese%20rural%20house%2C%20modern%20design%2C%20front%20yard%2C%20main%20road%20frontage%2C%20completed%20construction&width=400&height=300&seq=house2&orientation=landscape'
    ],
    address: 'Đường chính xã Nhân Cơ, Kon Tum',
    description: 'Nhà 2 tầng kiên cố, 4 phòng ngủ, 3 phòng tắm. Thiết kế hiện đại, đầy đủ nội thất.',
    legalStatus: 'Sổ đỏ chính chủ',
    seller: {
      name: 'Vũ Văn Thành',
      phone: '0956789012',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20man%20portrait%2C%20professional%20appearance%2C%20confident%20smile&width=100&height=100&seq=seller6&orientation=squarish',
      isAgent: true,
      rating: 4.8,
      totalListings: 8
    },
    postedDate: '2024-01-08',
    isVip: true,
    isFeatured: false,
    viewCount: 412
  }
];

export default function RealEstatePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTransactionType, setSelectedTransactionType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000000000]);
  const [areaRange, setAreaRange] = useState([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);
  const [savedListings, setSavedListings] = useState<number[]>([]);

  const filteredRealEstate = mockRealEstate.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory;
    const matchesTransaction = selectedTransactionType === 'all' || item.transactionType === selectedTransactionType;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    const matchesArea = item.area >= areaRange[0] && item.area <= areaRange[1];
    return matchesCategory && matchesTransaction && matchesStatus && matchesSearch && matchesPrice && matchesArea;
  });

  const sortedRealEstate = [...filteredRealEstate].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'area-large':
        return b.area - a.area;
      case 'area-small':
        return a.area - b.area;
      default:
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
    }
  });

  const featuredListings = sortedRealEstate.filter(item => item.isFeatured);
  const regularListings = sortedRealEstate.filter(item => !item.isFeatured);

  const handleSaveListing = (id: number) => {
    setSavedListings(prev => 
      prev.includes(id) 
        ? prev.filter(listingId => listingId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Bất động sản</h1>
              <p className="text-gray-600">Tìm kiếm nhà đất, phòng trọ và mặt bằng kinh doanh tại Nhân Cơ</p>
            </div>
            
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <i className="ri-search-line text-gray-400 w-5 h-5 flex items-center justify-center"></i>
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm theo địa chỉ, tiêu đề..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Loại:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-8 cursor-pointer"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Giao dịch:</span>
              <select
                value={selectedTransactionType}
                onChange={(e) => setSelectedTransactionType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-8 cursor-pointer"
              >
                {transactionTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({type.count})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Trạng thái:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-8 cursor-pointer"
              >
                {statusTypes.map(status => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              <i className="ri-filter-line w-4 h-4 flex items-center justify-center"></i>
              Bộ lọc nâng cao
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-600 whitespace-nowrap">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-8 cursor-pointer"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Khoảng giá</h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      placeholder="Từ (VNĐ)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Đến (VNĐ)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Diện tích (m²)</h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      placeholder="Từ (m²)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      value={areaRange[0]}
                      onChange={(e) => setAreaRange([Number(e.target.value), areaRange[1]])}
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Đến (m²)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      value={areaRange[1]}
                      onChange={(e) => setAreaRange([areaRange[0], Number(e.target.value)])}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => {
                    setPriceRange([0, 1000000000]);
                    setAreaRange([0, 5000]);
                  }}
                  className="px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  Đặt lại bộ lọc
                </button>
                <span className="text-sm text-gray-600">
                  Hiển thị {sortedRealEstate.length} kết quả
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured Listings */}
        {featuredListings.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <i className="ri-star-fill text-yellow-500 w-6 h-6 flex items-center justify-center"></i>
              <h2 className="text-xl font-bold text-gray-900">Bất động sản nổi bật</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map(item => (
                <RealEstateCard 
                  key={item.id} 
                  item={item} 
                  isSaved={savedListings.includes(item.id)}
                  onSave={() => handleSaveListing(item.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Listings */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Tất cả bất động sản ({regularListings.length})
            </h2>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                <i className="ri-layout-grid-line w-5 h-5 flex items-center justify-center"></i>
              </button>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                <i className="ri-list-unordered w-5 h-5 flex items-center justify-center"></i>
              </button>
            </div>
          </div>

          {regularListings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <i className="ri-home-line text-gray-300 text-6xl mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy bất động sản</h3>
              <p className="text-gray-600">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularListings.map(item => (
                <RealEstateCard 
                  key={item.id} 
                  item={item} 
                  isSaved={savedListings.includes(item.id)}
                  onSave={() => handleSaveListing(item.id)}
                />
              ))}
            </div>
          )}

          {/* Load More */}
          {regularListings.length > 0 && (
            <div className="text-center mt-12">
              <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer">
                Xem thêm bất động sản
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}