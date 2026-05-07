'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface MessengerModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientAvatar: string;
  recipientPhone: string;
  productTitle?: string;
  productImage?: string;
}

export default function MessengerModal({
  isOpen,
  onClose,
  recipientName,
  recipientAvatar,
  recipientPhone,
  productTitle,
  productImage
}: MessengerModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Xin chào! Cảm ơn bạn đã quan tâm đến sản phẩm của tôi.',
      sender: 'other',
      timestamp: new Date(Date.now() - 300000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: 2,
      text: 'Tôi có thể giúp gì cho bạn?',
      sender: 'other',
      timestamp: new Date(Date.now() - 240000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      status: 'sending'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate message status updates
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'sent' } : msg
      ));
    }, 500);

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 1000);

    // Simulate typing indicator and response
    setTimeout(() => {
      setIsTyping(true);
    }, 2000);

    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        'Cảm ơn bạn đã liên hệ! Tôi sẽ trả lời ngay.',
        'Vâng, tôi hiểu rồi. Cho tôi kiểm tra và phản hồi bạn nhé.',
        'Được rồi, tôi sẽ chuẩn bị thông tin chi tiết cho bạn.',
        'Cảm ơn bạn! Tôi sẽ liên hệ lại sớm nhất có thể.'
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const responseMessage: Message = {
        id: messages.length + 2,
        text: randomResponse,
        sender: 'other',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, responseMessage]);
      
      // Mark user's message as read
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'read' } : msg
      ));
    }, 4000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return <i className="ri-time-line text-gray-400 text-xs"></i>;
      case 'sent':
        return <i className="ri-check-line text-gray-400 text-xs"></i>;
      case 'delivered':
        return <i className="ri-check-double-line text-gray-400 text-xs"></i>;
      case 'read':
        return <i className="ri-check-double-line text-blue-500 text-xs"></i>;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md h-[600px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={recipientAvatar}
                alt={recipientName}
                className="w-10 h-10 rounded-full object-cover border-2 border-white"
              />
              {isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div>
              <h3 className="font-semibold">{recipientName}</h3>
              <p className="text-xs text-blue-100">
                {isOnline ? 'Đang hoạt động' : 'Hoạt động 5 phút trước'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.open(`tel:${recipientPhone}`, '_self')}
              className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <i className="ri-phone-line text-white w-4 h-4 flex items-center justify-center"></i>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-white w-4 h-4 flex items-center justify-center"></i>
            </button>
          </div>
        </div>

        {/* Product Info (if provided) */}
        {productTitle && productImage && (
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-3 bg-white rounded-lg p-2">
              <img
                src={productImage}
                alt={productTitle}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{productTitle}</p>
                <p className="text-xs text-gray-500">Sản phẩm đang trao đổi</p>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${
                message.sender === 'me' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-900 border border-gray-200'
              } rounded-2xl px-4 py-2 shadow-sm`}>
                <p className="text-sm">{message.text}</p>
                <div className={`flex items-center justify-end space-x-1 mt-1 ${
                  message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  <span className="text-xs">{message.timestamp}</span>
                  {message.sender === 'me' && getMessageStatusIcon(message.status)}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2 shadow-sm">
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">{recipientName} đang nhập...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
          <div className="flex items-end space-x-3">
            <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors cursor-pointer">
              <i className="ri-add-line text-gray-600 w-4 h-4 flex items-center justify-center"></i>
            </button>
            
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                maxLength={500}
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors cursor-pointer">
                <i className="ri-emotion-line text-gray-600 w-4 h-4 flex items-center justify-center"></i>
              </button>
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <i className="ri-send-plane-fill text-white w-4 h-4 flex items-center justify-center"></i>
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>{newMessage.length}/500</span>
            <span>Nhấn Enter để gửi</span>
          </div>
        </div>
      </div>
    </div>
  );
}