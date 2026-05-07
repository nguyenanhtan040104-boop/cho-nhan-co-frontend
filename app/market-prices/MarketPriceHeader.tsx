
'use client';

import { useState } from 'react';

interface MarketPriceHeaderProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function MarketPriceHeader({ selectedCategory, onCategoryChange }: MarketPriceHeaderProps) {
  const categories = [
    { key: 'ca-phe', label: 'Cà phê', icon: 'ri-goblet-line', count: '45' },
    { key: 'ho-tieu', label: 'Hồ tiêu', icon: 'ri-leaf-line', count: '28' },
    { key: 'cao-su', label: 'Cao su', icon: 'ri-plant-line', count: '12' },
    { key: 'lua-gao', label: 'Lúa gạo', icon: 'ri-seedling-line', count: '35' },
    { key: 'trai-cay', label: 'Trái cây', icon: 'ri-apple-line', count: '68' },
    { key: 'rau-cu', label: 'Rau củ', icon: 'ri-leaf-fill', count: '89' }
  ];

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Giá thị trường</h1>
          <p className="text-gray-600">Thông tin giá cả nông sản và hàng hóa được cập nhật liên tục</p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => onCategoryChange(category.key)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-all whitespace-nowrap ${
                selectedCategory === category.key
                  ? 'bg-green-600 text-white border-green-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-green-50 hover:border-green-300'
              }`}
            >
              <div className={`w-5 h-5 flex items-center justify-center ${
                selectedCategory === category.key ? 'text-white' : 'text-green-600'
              }`}>
                <i className={category.icon}></i>
              </div>
              <span className="font-medium">{category.label}</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                selectedCategory === category.key
                  ? 'bg-white bg-opacity-20 text-white'
                  : 'bg-green-100 text-green-700'
              }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-6 mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Cập nhật lúc: 10:30 AM - 20/12/2024</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Nguồn: Sở NN&PTNT, Hiệp hội Cà phê - Hồ tiêu Việt Nam</span>
          </div>
        </div>
      </div>
    </div>
  );
}
