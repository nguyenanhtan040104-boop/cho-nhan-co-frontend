
'use client';

interface PriceTableProps {
  category: string;
}

export default function PriceTable({ category }: PriceTableProps) {
  const getPriceData = (category: string) => {
    const data = {
      'ca-phe': [
        { name: 'Cà phê Robusta', unit: 'kg', buyPrice: '82,500', sellPrice: '85,000', change: '+2.5%', changeType: 'up', location: 'Đắk Lắk' },
        { name: 'Cà phê Arabica', unit: 'kg', buyPrice: '125,000', sellPrice: '128,500', change: '+1.8%', changeType: 'up', location: 'Lâm Đồng' },
        { name: 'Cà phê Cherry', unit: 'kg', buyPrice: '28,000', sellPrice: '30,500', change: '-0.5%', changeType: 'down', location: 'Gia Lai' },
        { name: 'Cà phê Moka', unit: 'kg', buyPrice: '145,000', sellPrice: '148,000', change: '+3.2%', changeType: 'up', location: 'Lâm Đồng' }
      ],
      'ho-tieu': [
        { name: 'Hồ tiêu đen', unit: 'kg', buyPrice: '185,000', sellPrice: '190,000', change: '+1.5%', changeType: 'up', location: 'Đắk Lắk' },
        { name: 'Hồ tiêu trắng', unit: 'kg', buyPrice: '220,000', sellPrice: '225,000', change: '+2.1%', changeType: 'up', location: 'Phú Quốc' },
        { name: 'Hồ tiêu tươi', unit: 'kg', buyPrice: '45,000', sellPrice: '48,000', change: '-1.2%', changeType: 'down', location: 'Đắk Nông' }
      ],
      'cao-su': [
        { name: 'Mủ cao su SVR3L', unit: 'kg', buyPrice: '38,500', sellPrice: '40,200', change: '+0.8%', changeType: 'up', location: 'Bình Dương' },
        { name: 'Mủ cao su SVR10', unit: 'kg', buyPrice: '36,800', sellPrice: '38,500', change: '+1.2%', changeType: 'up', location: 'Đồng Nai' },
        { name: 'Mủ cao su tươi', unit: 'kg', buyPrice: '18,500', sellPrice: '20,000', change: '-0.3%', changeType: 'down', location: 'Tây Ninh' }
      ],
      'lua-gao': [
        { name: 'Lúa IR50404', unit: 'kg', buyPrice: '6,800', sellPrice: '7,200', change: '+1.0%', changeType: 'up', location: 'An Giang' },
        { name: 'Lúa Jasmine 85', unit: 'kg', buyPrice: '7,500', sellPrice: '7,900', change: '+1.5%', changeType: 'up', location: 'Cần Thơ' },
        { name: 'Gạo ST25', unit: 'kg', buyPrice: '22,000', sellPrice: '24,500', change: '+2.8%', changeType: 'up', location: 'An Giang' },
        { name: 'Gạo Jasmine', unit: 'kg', buyPrice: '18,500', sellPrice: '20,200', change: '+1.8%', changeType: 'up', location: 'Đồng Tháp' }
      ],
      'trai-cay': [
        { name: 'Sầu riêng Ri6', unit: 'kg', buyPrice: '85,000', sellPrice: '95,000', change: '+5.2%', changeType: 'up', location: 'Đắk Lắk' },
        { name: 'Thanh long ruột đỏ', unit: 'kg', buyPrice: '18,000', sellPrice: '22,000', change: '+3.1%', changeType: 'up', location: 'Bình Thuận' },
        { name: 'Xoài cát Hòa Lộc', unit: 'kg', buyPrice: '35,000', sellPrice: '42,000', change: '+2.5%', changeType: 'up', location: 'Đồng Tháp' },
        { name: 'Chôm chôm', unit: 'kg', buyPrice: '25,000', sellPrice: '28,500', change: '+1.8%', changeType: 'up', location: 'Bến Tre' }
      ],
      'rau-cu': [
        { name: 'Cà chua', unit: 'kg', buyPrice: '12,000', sellPrice: '15,000', change: '+2.2%', changeType: 'up', location: 'Lâm Đồng' },
        { name: 'Khoai tây', unit: 'kg', buyPrice: '18,000', sellPrice: '22,000', change: '+1.5%', changeType: 'up', location: 'Đà Lạt' },
        { name: 'Bắp cải', unit: 'kg', buyPrice: '8,500', sellPrice: '12,000', change: '+3.8%', changeType: 'up', location: 'Lâm Đồng' },
        { name: 'Cà rót', unit: 'kg', buyPrice: '15,000', sellPrice: '18,500', change: '-1.2%', changeType: 'down', location: 'Đồng Tháp' }
      ]
    };
    return data[category as keyof typeof data] || data['ca-phe'];
  };

  const priceData = getPriceData(category);

  const getCategoryTitle = (category: string) => {
    const titles = {
      'ca-phe': 'Cà phê',
      'ho-tieu': 'Hồ tiêu', 
      'cao-su': 'Cao su',
      'lua-gao': 'Lúa gạo',
      'trai-cay': 'Trái cây',
      'rau-cu': 'Rau củ'
    };
    return titles[category as keyof typeof titles] || 'Cà phê';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Bảng giá {getCategoryTitle(category)}</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Cập nhật: 10:30 AM hôm nay</span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Sản phẩm</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Đơn vị</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Giá mua vào</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Giá bán ra</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Biến động</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Khu vực</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {priceData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{item.name}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">{item.unit}</td>
                <td className="px-6 py-4 text-right">
                  <span className="font-semibold text-blue-600">{item.buyPrice}đ</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-semibold text-green-600">{item.sellPrice}đ</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className={`flex items-center justify-end space-x-1 ${
                    item.changeType === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <i className={`${
                      item.changeType === 'up' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'
                    }`}></i>
                    <span className="font-medium">{item.change}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    <i className="ri-map-pin-line mr-1"></i>
                    {item.location}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Summary */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Tổng {priceData.length} sản phẩm</span>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-green-600">
                <i className="ri-arrow-up-line"></i>
                <span>{priceData.filter(item => item.changeType === 'up').length} tăng</span>
              </div>
              <div className="flex items-center space-x-1 text-red-600">
                <i className="ri-arrow-down-line"></i>
                <span>{priceData.filter(item => item.changeType === 'down').length} giảm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}