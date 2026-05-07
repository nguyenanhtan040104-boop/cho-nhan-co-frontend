
'use client';

import Link from 'next/link';
import { useState } from 'react';
import MessengerModal from '../../../components/MessengerModal';

interface SearchPeopleDetailProps {
  personId: string;
}

export default function SearchPeopleDetail({ personId }: SearchPeopleDetailProps) {
  const [showContact, setShowContact] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'other',
      text: 'Xin chào! Cảm ơn bạn đã quan tâm đến tin đăng của tôi.',
      time: '14:30'
    }
  ]);

  const [showContactModal, setShowContactModal] = useState(false);
  const [showMessengerModal, setShowMessengerModal] = useState(false);

  // Mock data - trong thực tế sẽ fetch từ API
  const post = {
    id: parseInt(personId),
    title: 'Tìm chiếc iPhone 13 màu xanh thất lạc tại chợ',
    type: 'objects',
    status: 'searching',
    description: 'Chiếc điện thoại iPhone 13 Pro màu xanh alpine, có ốp lưng trong suốt, bên trong có ảnh gia đình. Thất lạc vào sáng ngày 15/11 tại khu vực quầy rau củ chợ Nhân Cơ. Điện thoại rất quan trọng với tôi vì chứa nhiều ảnh kỷ niệm gia đình không thể khôi phục. Nếu ai nhặt được xin vui lòng liên hệ với tôi.',
    images: [
      'https://readdy.ai/api/search-image?query=Lost%20iPhone%2013%20blue%20color%20on%20traditional%20Vietnamese%20market%20table%2C%20rural%20market%20setting%2C%20simple%20clean%20background%2C%20realistic%20product%20photography&width=600&height=400&seq=lostphone3&orientation=landscape',
      'https://readdy.ai/api/search-image?query=iPhone%2013%20Pro%20blue%20with%20clear%20case%20containing%20family%20photos%2C%20detailed%20product%20photography%2C%20rural%20Vietnamese%20setting&width=600&height=400&seq=lostphone4&orientation=landscape'
    ],
    location: 'Chợ Nhân Cơ, Kon Tum',
    specificLocation: 'Khu vực quầy rau củ, gần cổng chính chợ',
    lostDate: '15/11/2024',
    lostTime: '7:30 sáng',
    contact: {
      name: 'Nguyễn Văn Minh',
      phone: '0912345678',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20man%20portrait%20worried%20expression%20traditional%20clothes%20rural%20setting%20natural%20lighting%20photorealistic&width=100&height=100&seq=contact7&orientation=squarish',
      verified: true
    },
    reward: '2,000,000đ',
    createdAt: '30 phút trước',
    views: 156,
    shares: 23,
    isPinned: true,
    isUrgent: true,
    hashtag: '#TimDoThatLac',
    additionalInfo: {
      brand: 'Apple iPhone 13 Pro',
      color: 'Xanh Alpine',
      condition: 'Còn mới, có ốp lưng trong suốt',
      distinctive: 'Có ảnh gia đình trong ốp lưng, màn hình có dán kính cường lực',
      lastSeen: 'Lần cuối thấy tại quầy bán rau củ của cô Hương'
    }
  };

  const relatedPosts = [
    {
      id: 2,
      title: 'Tìm chú chó Golden Retriever tên Lucky',
      image: 'https://readdy.ai/api/search-image?query=Golden%20Retriever%20dog%20missing%20pet%20with%20red%20collar%20friendly%20expression%20outdoor%20Vietnamese%20rural%20setting%20natural%20lighting&width=300&height=200&seq=lostdog2&orientation=landscape',
      type: 'pets',
      createdAt: '2 giờ trước'
    },
    {
      id: 4,
      title: 'Tìm chiếc ví da màu nâu thất lạc',
      image: 'https://readdy.ai/api/search-image?query=Lost%20brown%20leather%20wallet%20on%20market%20ground%2C%20Vietnamese%20rural%20market%20setting%2C%20simple%20background%2C%20realistic%20photography&width=300&height=200&seq=lostwallet3&orientation=landscape',
      type: 'objects',
      createdAt: '1 ngày trước'
    }
  ];

  const handleShare = () => {
    const url = window.location.href;
    const text = `${post.title} - ${post.hashtag}`;
    
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: text,
        url: url
      });
    } else {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
      window.open(facebookUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        sender: 'me',
        text: message,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...chatMessages, newMessage]);
      setMessage('');
      
      // Simulate response after 2 seconds
      setTimeout(() => {
        const response = {
          id: chatMessages.length + 2,
          sender: 'other',
          text: 'Cảm ơn bạn đã liên hệ! Tôi sẽ phản hồi sớm nhất có thể.',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, response]);
      }, 2000);
    }
  };

  const handleMessageClick = () => {
    setShowMessengerModal(true);
    setShowContactModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3 cursor-pointer">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <i className="ri-store-2-line text-white text-xl"></i>
                </div>
                <div>
                  <h1 className="font-['Pacifico'] text-2xl text-green-700">logo</h1>
                  <p className="text-sm text-gray-600">Chi tiết tin tìm kiếm</p>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/search-people" className="text-gray-700 hover:text-red-600 transition-colors cursor-pointer">
                <i className="ri-arrow-left-line mr-2"></i>
                Quay lại
              </Link>
              <Link href="/search-people/create" className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer">
                Đăng tin tìm kiếm
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Post Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg bg-red-100 text-red-700">
                    <i className="ri-search-line text-2xl"></i>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-red-100 text-red-700 text-sm px-3 py-1 rounded-full">
                        Đang tìm
                      </span>
                      {post.isPinned && (
                        <span className="flex items-center space-x-1 text-red-600 text-sm">
                          <i className="ri-pushpin-line"></i>
                          <span>Ghim</span>
                        </span>
                      )}
                      {post.isUrgent && (
                        <span className="flex items-center space-x-1 text-red-600 text-sm">
                          <i className="ri-alarm-warning-line"></i>
                          <span>Khẩn cấp</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{post.createdAt}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setIsSaved(!isSaved)}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      isSaved ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    <i className={`${isSaved ? 'ri-bookmark-fill' : 'ri-bookmark-line'}`}></i>
                  </button>
                  <button 
                    onClick={handleShare}
                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors cursor-pointer"
                  >
                    <i className="ri-share-line"></i>
                  </button>
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <i className="ri-eye-line"></i>
                  <span>{post.views} lượt xem</span>
                </div>
                <div className="flex items-center space-x-1">
                  <i className="ri-share-line"></i>
                  <span>{post.shares} lượt chia sẻ</span>
                </div>
                <span className="text-blue-600 font-medium cursor-pointer hover:text-blue-800">
                  {post.hashtag}
                </span>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Hình ảnh</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {post.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${post.title} - Ảnh ${index + 1}`}
                    className="w-full h-64 object-cover object-top rounded-lg"
                  />
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Mô tả chi tiết</h2>
              <p className="text-gray-700 leading-relaxed">
                {post.description}
              </p>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin chi tiết</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Thông tin sản phẩm</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thương hiệu:</span>
                      <span className="text-gray-900">{post.additionalInfo.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Màu sắc:</span>
                      <span className="text-gray-900">{post.additionalInfo.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tình trạng:</span>
                      <span className="text-gray-900">{post.additionalInfo.condition}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Đặc điểm nhận dạng</h3>
                  <p className="text-sm text-gray-700">
                    {post.additionalInfo.distinctive}
                  </p>
                  <div className="mt-3">
                    <h4 className="font-medium text-gray-900 mb-1">Lần cuối nhìn thấy:</h4>
                    <p className="text-sm text-gray-700">
                      {post.additionalInfo.lastSeen}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên hệ</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={post.contact.avatar}
                      alt={post.contact.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{post.contact.name}</h3>
                        {post.contact.verified && (
                          <i className="ri-verified-badge-fill text-blue-500" title="Đã xác thực"></i>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Người đăng tin</p>
                      <div className="mt-2">
                        <span className="text-lg font-bold text-red-600">{post.reward}</span>
                        <span className="text-sm text-gray-600 ml-2">tiền hậu tạ</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowContact(!showContact)}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium cursor-pointer"
                  >
                    {showContact ? 'Ẩn liên hệ' : 'Hiện số điện thoại'}
                  </button>
                </div>
                
                {showContact && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <i className="ri-phone-line text-red-500 text-lg"></i>
                        <a 
                          href={`tel:${post.contact.phone}`}
                          className="text-red-600 font-semibold text-lg hover:text-red-700 cursor-pointer"
                        >
                          {post.contact.phone}
                        </a>
                      </div>
                      <button 
                        onClick={handleMessageClick}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                      >
                        <i className="ri-message-line w-5 h-5 flex items-center justify-center"></i>
                        Nhắn tin riêng
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-3">
                      * Vui lòng liên hệ nếu bạn có thông tin hữu ích về đồ vật này
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            {/* Location & Time Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin thất lạc</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <i className="ri-map-pin-line text-red-500"></i>
                    <span className="font-medium">Địa điểm:</span>
                  </div>
                  <p className="text-gray-900">{post.location}</p>
                  <p className="text-sm text-gray-600 mt-1">{post.specificLocation}</p>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <i className="ri-calendar-line text-red-500"></i>
                    <span className="font-medium">Ngày thất lạc:</span>
                  </div>
                  <p className="text-gray-900">{post.lostDate}</p>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <i className="ri-time-line text-red-500"></i>
                    <span className="font-medium">Thời gian:</span>
                  </div>
                  <p className="text-gray-900">{post.lostTime}</p>
                </div>
              </div>
            </div>

            {/* Emergency Notice */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <div className="flex items-start space-x-3">
                <i className="ri-alarm-warning-line text-red-600 text-xl flex-shrink-0 mt-1"></i>
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Báo cáo khẩn cấp</h3>
                  <p className="text-red-700 text-sm mb-3">
                    Nếu đây là trường hợp khẩn cấp, vui lòng liên hệ ngay:
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <i className="ri-phone-line text-red-600"></i>
                      <span className="font-semibold">Công an: 113</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="ri-government-line text-red-600"></i>
                      <span className="font-semibold">UBND xã: 0905.123.456</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Posts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tin đăng liên quan</h3>
              <div className="space-y-4">
                {relatedPosts.map(relatedPost => (
                  <Link
                    key={relatedPost.id}
                    href={`/search-people/${relatedPost.id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex space-x-3">
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        className="w-16 h-16 object-cover object-top rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 line-clamp-2 text-sm">
                          {relatedPost.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">{relatedPost.createdAt}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="mt-4">
                <Link
                  href="/search-people"
                  className="block w-full text-center bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-medium cursor-pointer"
                >
                  Xem tất cả tin đăng
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <img
                  src={post.contact.avatar}
                  alt={post.contact.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{post.contact.name}</h3>
                  <p className="text-sm text-green-600">Đang hoạt động</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-[300px] max-h-[400px]">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${
                    msg.sender === 'me' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  } rounded-lg px-4 py-2`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender === 'me' ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="w-10 h-10 flex items-center justify-center bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <i className="ri-send-plane-line"></i>
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2">
                Nhấn Enter để gửi tin nhắn
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messenger Modal */}
      <MessengerModal
        isOpen={showMessengerModal}
        onClose={() => setShowMessengerModal(false)}
        recipientName={post.contact.name}
        recipientAvatar={post.contact.avatar}
        recipientPhone={post.contact.phone}
      />
    </div>
  );
}
