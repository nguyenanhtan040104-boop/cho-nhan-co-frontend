
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientPhone: string;
  recipientId?: string;
  productTitle?: string;
  productId?: string;
}

export default function MessageModal({
  isOpen,
  onClose,
  recipientName,
  recipientPhone,
  recipientId,
  productTitle,
  productId
}: MessageModalProps) {
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim() || !senderName.trim() || !senderPhone.trim()) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsSending(true);

    // Simulate sending message
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Save message to localStorage
    const messageData = {
      id: Date.now(),
      recipientName,
      recipientPhone,
      recipientId,
      senderName,
      senderPhone,
      message,
      productTitle,
      productId,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    const existingMessages = JSON.parse(localStorage.getItem('user_messages') || '[]');
    existingMessages.unshift(messageData);
    localStorage.setItem('user_messages', JSON.stringify(existingMessages));

    setIsSending(false);
    setShowSuccess(true);

    // Reset form and close after success
    setTimeout(() => {
      setMessage('');
      setSenderName('');
      setSenderPhone('');
      setShowSuccess(false);
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="ri-message-line text-blue-600 w-5 h-5 flex items-center justify-center"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gửi tin nhắn</h3>
              <p className="text-sm text-gray-600">Liên hệ với {recipientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
          >
            <i className="ri-close-line w-4 h-4 flex items-center justify-center"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Recipient Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-user-line text-blue-600 w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{recipientName}</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <i className="ri-phone-line mr-1 w-3 h-3 flex items-center justify-center"></i>
                    {recipientPhone}
                  </span>
                  {recipientId && (
                    <Link
                      href={`/profile/${recipientId}`}
                      className="text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      Xem thông tin
                    </Link>
                  )}
                </div>
              </div>
            </div>
            
            {productTitle && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">Về sản phẩm:</p>
                <p className="font-medium text-gray-900 text-sm">{productTitle}</p>
              </div>
            )}
          </div>

          {/* Sender Info */}
          <div className="space-y-4 mb-6">
            <h4 className="font-medium text-gray-900">Thông tin của bạn</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Nhập họ và tên của bạn"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="0912345678"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tin nhắn *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder={productTitle 
                ? `Xin chào, tôi quan tâm đến sản phẩm "${productTitle}". Bạn có thể cho tôi biết thêm thông tin không?`
                : "Xin chào, tôi muốn liên hệ với bạn..."
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1">
              {message.length}/500 ký tự
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Hoặc liên hệ trực tiếp:</p>
            <div className="flex space-x-3">
              <a
                href={`tel:${recipientPhone}`}
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors text-center font-medium cursor-pointer"
              >
                <i className="ri-phone-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                Gọi điện
              </a>
              <a
                href={`sms:${recipientPhone}`}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium cursor-pointer"
              >
                <i className="ri-message-2-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                SMS
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSendMessage}
              disabled={isSending || !message.trim() || !senderName.trim() || !senderPhone.trim()}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang gửi...</span>
                </div>
              ) : (
                <>
                  <i className="ri-send-plane-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                  Gửi tin nhắn
                </>
              )}
            </button>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <i className="ri-check-line text-green-600 w-5 h-5 flex items-center justify-center"></i>
                <div>
                  <p className="font-medium text-green-800">Gửi tin nhắn thành công!</p>
                  <p className="text-sm text-green-600">
                    Tin nhắn đã được gửi đến {recipientName}. Họ sẽ liên hệ lại với bạn sớm nhất.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info Note */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <i className="ri-information-line text-blue-600 flex-shrink-0 mt-0.5 w-4 h-4 flex items-center justify-center"></i>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Lưu ý:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Tin nhắn sẽ được chuyển đến người bán qua số điện thoại</li>
                  <li>• Vui lòng cung cấp thông tin liên hệ chính xác</li>
                  <li>• Tính năng chat trực tuyến sẽ được phát triển trong tương lai</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
