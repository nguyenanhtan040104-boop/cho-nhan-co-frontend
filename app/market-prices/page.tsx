
'use client';

import { useState } from 'react';
import MarketPriceHeader from './MarketPriceHeader';
import PriceTable from './PriceTable';
import PriceChart from './PriceChart';
import MarketNews from './MarketNews';
import PriceNotifications from './PriceNotifications';

export default function MarketPricesPage() {
  const [selectedCategory, setSelectedCategory] = useState('ca-phe');
  const [timeRange, setTimeRange] = useState('7-days');

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketPriceHeader 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Price Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Giá cao nhất hôm nay</p>
                    <p className="text-2xl font-bold text-green-600">85,000đ</p>
                    <p className="text-xs text-gray-500">Cà phê Robusta/kg</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="ri-arrow-up-line text-green-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Giá thấp nhất hôm nay</p>
                    <p className="text-2xl font-bold text-red-600">82,500đ</p>
                    <p className="text-xs text-gray-500">Cà phê Robusta/kg</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <i className="ri-arrow-down-line text-red-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Biến động</p>
                    <p className="text-2xl font-bold text-green-600">+2.5%</p>
                    <p className="text-xs text-gray-500">So với hôm qua</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="ri-trending-up-line text-blue-600 text-xl"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Table */}
            <PriceTable category={selectedCategory} />

            {/* Price Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Biểu đồ giá</h2>
                  <div className="flex space-x-2">
                    {[
                      { key: '7-days', label: '7 ngày' },
                      { key: '30-days', label: '30 ngày' },
                      { key: '90-days', label: '3 tháng' }
                    ].map((range) => (
                      <button
                        key={range.key}
                        onClick={() => setTimeRange(range.key)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors whitespace-nowrap ${
                          timeRange === range.key
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <PriceChart category={selectedCategory} timeRange={timeRange} />
              </div>
            </div>

            {/* Price Comparison */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">So sánh giá theo ngày</h2>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 font-medium text-gray-700">Ngày</th>
                        <th className="text-right py-3 font-medium text-gray-700">Giá mua vào</th>
                        <th className="text-right py-3 font-medium text-gray-700">Giá bán ra</th>
                        <th className="text-right py-3 font-medium text-gray-700">Biến động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { date: '20/12/2024', buyPrice: '82,500', sellPrice: '85,000', change: '+2.5%', changeColor: 'text-green-600' },
                        { date: '19/12/2024', buyPrice: '80,000', sellPrice: '82,800', change: '+1.2%', changeColor: 'text-green-600' },
                        { date: '18/12/2024', buyPrice: '79,500', sellPrice: '82,000', change: '-0.8%', changeColor: 'text-red-600' },
                        { date: '17/12/2024', buyPrice: '80,200', sellPrice: '82,700', change: '+0.5%', changeColor: 'text-green-600' },
                        { date: '16/12/2024', buyPrice: '79,800', sellPrice: '82,300', change: '-1.1%', changeColor: 'text-red-600' }
                      ].map((row, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 text-gray-900">{row.date}</td>
                          <td className="py-3 text-right text-gray-900">{row.buyPrice}đ</td>
                          <td className="py-3 text-right text-gray-900">{row.sellPrice}đ</td>
                          <td className={`py-3 text-right font-medium ${row.changeColor}`}>{row.change}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Price Notifications */}
            <PriceNotifications />
            
            {/* Market News */}
            <MarketNews />

            {/* Quick Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Tìm kiếm nhanh</h3>
              </div>
              <div className="p-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm theo tên sản phẩm..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="ri-search-line text-gray-400"></i>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Tìm kiếm phổ biến:</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Cà phê', 'Hồ tiêu', 'Cao su', 'Lúa gạo', 'Rau củ'].map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full cursor-pointer hover:bg-green-100 hover:text-green-700 transition-colors whitespace-nowrap"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Market Statistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Thống kê thị trường</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Số sản phẩm theo dõi</span>
                  <span className="text-sm font-medium text-gray-900">248</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cập nhật cuối</span>
                  <span className="text-sm font-medium text-gray-900">10:30 AM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sản phẩm tăng giá</span>
                  <span className="text-sm font-medium text-green-600">156</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sản phẩm giảm giá</span>
                  <span className="text-sm font-medium text-red-600">92</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
