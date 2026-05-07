
'use client';

interface Category {
  name: string;
  count: number;
  icon: string;
}

interface ForumSidebarProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function ForumSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
}: ForumSidebarProps) {
  const stats = [
    {
      label: 'Tổng bài viết',
      value: '1,234',
      icon: 'ri-article-line',
      color: 'text-blue-600',
    },
    {
      label: 'Thành viên hoạt động',
      value: '5,678',
      icon: 'ri-user-star-line',
      color: 'text-green-600',
    },
    {
      label: 'Bình luận hôm nay',
      value: '456',
      icon: 'ri-chat-3-line',
      color: 'text-purple-600',
    },
    {
      label: 'Lượt xem tuần này',
      value: '12.5K',
      icon: 'ri-eye-line',
      color: 'text-orange-600',
    },
  ];

  const topMembers = [
    {
      name: 'Nguyễn Văn An',
      reputation: 3450,
      avatar:
        'https://readdy.ai/api/search-image?query=Vietnamese%20elderly%20farmer%20portrait%20experienced%20wise%20expression%20wearing%20traditional%20hat%2C%20respected%20community%20leader%20look%2C%20natural%20outdoor%20lighting&width=40&height=40&seq=topmember1&orientation=squarish',
      badge: 'Chuyên gia',
    },
    {
      name: 'Trần Thị Hoa',
      reputation: 2890,
      avatar:
        'https://readdy.ai/api/search-image?query=Vietnamese%20middle%20aged%20woman%20farmer%20portrait%20confident%20experienced%20look%20wearing%20traditional%20farming%20clothes%2C%20knowledgeable%20expression&width=40&height=40&seq=topmember2&orientation=squarish',
      badge: 'Thành viên VIP',
    },
    {
      name: 'Lê Minh Đức',
      reputation: 2150,
      avatar:
        'https://readdy.ai/api/search-image?query=Vietnamese%20young%20man%20farmer%20portrait%20modern%20farmer%20wearing%20casual%20shirt%2C%20friendly%20helpful%20expression%2C%20rural%20background&width=40&height=40&seq=topmember3&orientation=squarish',
      badge: 'Tích cực',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Forum Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thống kê diễn đàn
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                <i className={`${stat.icon} ${stat.color} text-lg`}></i>
              </div>
              <div className="text-lg font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Chuyên mục
        </h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => onCategoryChange(category.name)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                selectedCategory === category.name
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i
                    className={`${category.icon} ${
                      selectedCategory === category.name
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }`}
                  ></i>
                </div>
                <span className="font-medium">{category.name}</span>
              </div>
              <span
                className={`text-sm px-2 py-1 rounded-full ${
                  selectedCategory === category.name
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Top Members */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thành viên nổi bật
        </h3>
        <div className="space-y-4">
          {topMembers.map((member, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div
                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    index === 0
                      ? 'bg-yellow-500'
                      : index === 1
                      ? 'bg-gray-400'
                      : 'bg-orange-500'
                  }`}
                >
                  {index + 1}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {member.name}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600">
                    {member.reputation} điểm
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {member.badge}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-3">Bắt đầu thảo luận</h3>
        <p className="text-green-100 text-sm mb-4">
          Chia sẻ kinh nghiệm, đặt câu hỏi hoặc tìm kiếm sự giúp đỡ từ cộng đồng
        </p>
        <button className="w-full bg-white text-green-700 py-2 px-4 rounded-lg hover:bg-green-50 transition-colors font-medium whitespace-nowrap cursor-pointer">
          <i className="ri-edit-line mr-2"></i>
          Viết bài mới
        </button>
      </div>
    </div>
  );
}
