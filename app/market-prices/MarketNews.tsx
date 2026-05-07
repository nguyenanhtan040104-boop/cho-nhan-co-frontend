
'use client';

export default function MarketNews() {
  const newsData = [
    {
      id: 1,
      title: 'Giá cà phê tăng mạnh do ảnh hưởng thời tiết',
      summary: 'Thời tiết khô hạn kéo dài tại Tây Nguyên làm giá cà phê robusta tăng 2.5% so với tuần trước...',
      time: '2 giờ trước',
      category: 'Cà phê',
      isHot: true
    },
    {
      id: 2,
      title: 'Xuất khẩu hồ tiêu Việt Nam đạt kỷ lục mới',
      summary: 'Trong 11 tháng đầu năm, xuất khẩu hồ tiêu đạt 285,000 tấn, tăng 15% so với cùng kỳ...',
      time: '4 giờ trước',
      category: 'Hồ tiêu',
      isHot: false
    },
    {
      id: 3,
      title: 'Sầu riêng Đắk Lắk được mùa, giá ổn định',
      summary: 'Năm nay vụ sầu riêng tại Đắk Lắk cho năng suất cao, chất lượng tốt, giá dao động 85-95k/kg...',
      time: '6 giờ trước',
      category: 'Trái cây',
      isHot: false
    },
    {
      id: 4,
      title: 'Thị trường cao su thế giới biến động mạnh',
      summary: 'Giá cao su tự nhiên trên thị trường thế giới tăng nhẹ, ảnh hưởng tích cực đến nông dân...',
      time: '8 giờ trước',
      category: 'Cao su',
      isHot: false
    },
    {
      id: 5,
      title: 'Gạo ST25 tiếp tục chinh phục thị trường quốc tế',
      summary: 'Giống gạo ST25 của Việt Nam được đánh giá cao tại các thị trường khó tính như Nhật Bản, EU...',
      time: '1 ngày trước',
      category: 'Lúa gạo',
      isHot: false
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Tin tức thị trường</h3>
          <button className="text-sm text-green-600 hover:text-green-700 whitespace-nowrap">
            Xem tất cả
          </button>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {newsData.map((news) => (
          <div key={news.id} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-5">
                  {news.title}
                  {news.isHot && (
                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                      <i className="ri-fire-line mr-1"></i>
                      Hot
                    </span>
                  )}
                </h4>
              </div>
              
              <p className="text-xs text-gray-600 line-clamp-2 leading-4">
                {news.summary}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  {news.category}
                </span>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <i className="ri-time-line"></i>
                  <span>{news.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap">
          <i className="ri-newspaper-line"></i>
          <span>Đọc thêm tin tức</span>
        </button>
      </div>
    </div>
  );
}
