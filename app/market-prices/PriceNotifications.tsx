
'use client';

import { useState } from 'react';

export default function PriceNotifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      product: 'Cà phê Robusta',
      type: 'increase',
      change: '+2.5%',
      price: '85,000đ',
      time: '10:30 AM',
      isRead: false
    },
    {
      id: 2,
      product: 'Sầu riêng Ri6',
      type: 'increase',
      change: '+5.2%',
      price: '95,000đ',
      time: '9:15 AM',
      isRead: false
    },
    {
      id: 3,
      product: 'Hồ tiêu đen',
      type: 'increase',
      change: '+1.5%',
      price: '190,000đ',
      time: '8:45 AM',
      isRead: true
    }
  ]);

  const [showSettings, setShowSettings] = useState(false);

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Cảnh báo giá</h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="ri-settings-3-line"></i>
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-7">Cài đặt thông báo</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-green-600"
                  defaultChecked
                />
                <span className="ml-2 text-sm text-gray-600">
                  Giá tăng &gt; 2%
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-green-600"
                  defaultChecked
                />
                <span className="ml-2 text-sm text-gray-600">
                  Giá giảm &gt; 2%
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-green-600"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Cập nhật hàng ngày
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="max-h-80 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
              !notification.isRead ? 'bg-green-50' : ''
            }`}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  !notification.isRead ? 'bg-green-500' : 'bg-gray-300'
                }`}
              ></div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {notification.product}
                  </span>
                  <span className="text-xs text-gray-500">
                    {notification.time}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                      notification.type === 'increase'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    <i
                      className={`mr-1 ${
                        notification.type === 'increase'
                          ? 'ri-arrow-up-line'
                          : 'ri-arrow-down-line'
                      }`}
                    ></i>
                    {notification.change}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {notification.price}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors whitespace-nowrap">
          <i className="ri-notification-3-line"></i>
          <span>Đăng ký nhận thông báo</span>
        </button>
      </div>
    </div>
  );
}
