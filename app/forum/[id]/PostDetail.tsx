
'use client';

import Link from 'next/link';
import { useState } from 'react';
import ForumHeader from '../ForumHeader';
import MessengerModal from '../../../components/MessengerModal';

interface PostDetailProps {
  postId: string;
}

export default function PostDetail({ postId }: PostDetailProps) {
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(45);
  const [showMessengerModal, setShowMessengerModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const post = {
    id: parseInt(postId),
    title: 'Cách trồng rau muống sạch tại nhà cho năng suất cao',
    content: `Xin chào các bác! Hôm nay tôi muốn chia sẻ kinh nghiệm trồng rau muống sạch tại nhà mà tôi đã tích lũy được sau 3 năm thực hiện.

**1. Chuẩn bị đất và giống:**
- Đất cần tơi xốp, giàu dinh dưỡng. Trộn đất vườn với phân hữu cơ theo tỷ lệ 7:3
- Chọn giống rau muống tốt, hạt to, không bị sâu bệnh 
- Ngâm hạt giống trong nước ấm 30-40°C trong 2-3 giờ trước khi gieo

**2. Kỹ thuật trồng:**
- Gieo hạt cách nhau 15-20cm, độ sâu 1-2cm
- Tưới nước đều đặn, giữ đất luôn ẩm nhưng không úng
- Sau 7-10 ngày hạt sẽ nảy mầm

**3. Chăm sóc:**
- Bón phân hữu cơ 2 tuần/lần
- Tưới nước sáng sớm hoặc chiều mát
- Làm cỏ thường xuyên, không để cỏ dại cạnh tranh dinh dưỡng

**4. Thu hoạch:**
- Sau 25-30 ngày có thể cắt lần đầu
- Cắt cách gốc 3-4cm để cây tiếp tục ra chồi mới
- Có thể thu hoạch liên tục trong 2-3 tháng

Các bác có kinh nghiệm gì thêm thì chia sẻ nhé! Cảm ơn mọi người đã đọc.`,
    author: {
      name: 'Nguyễn Văn Thành',
      avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20farmer%20portrait%20smiling%20elderly%20man%20wearing%20straw%20hat%20in%20rural%20countryside%20setting%2C%20friendly%20expression%2C%20natural%20lighting%2C%20photorealistic%20style&width=80&height=80&seq=authordetail1&orientation=squarish',
      level: 'Thành viên tích cực',
      reputation: 1250,
      joinDate: 'Tham gia: Tháng 3, 2023',
      totalPosts: 156,
      location: 'An Giang',
      userId: 'user123'
    },
    category: 'Nông nghiệp',
    createdAt: '2 giờ trước',
    updatedAt: null,
    views: 324,
    likes: likeCount,
    comments: 12,
    isVip: true,
    isPinned: false,
    tags: ['trồng trọt', 'rau sạch', 'kinh nghiệm'],
    images: [
      'https://readdy.ai/api/search-image?query=fresh%20green%20water%20spinach%20vegetables%20growing%20in%20home%20garden%20with%20rich%20soil%2C%20healthy%20leafy%20vegetables%2C%20natural%20sunlight%2C%20detailed%20agricultural%20photography&width=600&height=400&seq=vegetable1&orientation=landscape',
      'https://readdy.ai/api/search-image?query=Vietnamese%20farmer%20hands%20planting%20water%20spinach%20seeds%20in%20prepared%20soil%20garden%20bed%2C%20step%20by%20step%20planting%20process%2C%20organic%20farming%20techniques&width=600&height=400&seq=vegetable2&orientation=landscape'
    ]
  };

  const comments = [
    {
      id: 1,
      author: {
        name: 'Trần Văn Minh',
        avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20middle%20aged%20man%20farmer%20portrait%20wearing%20traditional%20farming%20hat%2C%20experienced%20expression%2C%20rural%20background&width=50&height=50&seq=commenter1&orientation=squarish',
        level: 'Thành viên',
        reputation: 680,
        userId: 'user456'
      },
      content: 'Cảm ơn bác chia sẻ! Tôi thử làm theo cách này được 1 tháng rồi, rau muống nhà tôi xanh tốt lắm. Có điều tôi thấy lá hơi nhỏ, không biết có phải do thiếu phân không?',
      createdAt: '1 giờ trước',
      likes: 8,
      replies: [
        {
          id: 11,
          author: {
            name: 'Nguyễn Văn Thành',
            avatar: post.author.avatar,
            level: post.author.level,
            reputation: post.author.reputation,
            userId: post.author.userId
          },
          content: 'Lá nhỏ có thể do thiếu đạm bác ạ. Bác thử bón thêm phân urê loãng, 1 tuần 1 lần. Hoặc có thể dùng nước vo gạo để tưới cũng tốt lắm.',
          createdAt: '45 phút trước',
          likes: 5
        }
      ]
    },
    {
      id: 2,
      author: {
        name: 'Lê Thị Hoa',
        avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20woman%20farmer%20portrait%20middle%20aged%20wearing%20sun%20hat%20in%20vegetable%20garden%2C%20friendly%20smile%2C%20natural%20lighting&width=50&height=50&seq=commenter2&orientation=squarish',
        level: 'Thành viên VIP',
        reputation: 1450,
        userId: 'user789'
      },
      content: 'Bài viết rất chi tiết và dễ hiểu! Mình đã save lại để thực hiện. Cho mình hỏi loại phân hữu cơ nào tốt nhất ạ? Phân chuồng hay phân compost?',
      createdAt: '30 phút trước',
      likes: 12,
      replies: []
    },
    {
      id: 3,
      author: {
        name: 'Phạm Quang Đức',
        avatar: 'https://readdy.ai/api/search-image?query=Vietnamese%20young%20farmer%20portrait%20confident%20expression%20wearing%20casual%20farming%20clothes%2C%20modern%20agriculture%20background&width=50&height=50&seq=commenter3&orientation=squarish',
        level: 'Chuyên gia',
        reputation: 2150,
        userId: 'user101'
      },
      content: 'Kinh nghiệm hay! Thêm một tip: nếu trồng trong thùng xốp thì nên khoan lỗ thoát nước dưới đáy, tránh úng rễ. Và nên trồng luân canh với các loại rau khác để đất không bị cạn kiệt.',
      createdAt: '15 phút trước',
      likes: 15,
      replies: []
    }
  ];

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      console.log('New comment:', newComment);
      setNewComment('');
    }
  };

  const shareToFacebook = () => {
    const url = window.location.href;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleMessage = (user?: any) => {
    if (user) {
      setSelectedUser(user);
    } else {
      setSelectedUser(post.author);
    }
    setShowMessengerModal(true);
  };

  const handleContactProfile = (userId: string) => {
    window.location.href = `/profile/${userId}`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Nông nghiệp': 'bg-green-100 text-green-700',
      'Chăn nuôi': 'bg-blue-100 text-blue-700',
      'Đời sống': 'bg-purple-100 text-purple-700',
      'Tìm người giúp đỡ': 'bg-orange-100 text-orange-700',
      'Tin khẩn': 'bg-red-100 text-red-700',
      'Hỏi đáp': 'bg-indigo-100 text-indigo-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ForumHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-green-600 cursor-pointer">Trang chủ</Link>
          <i className="ri-arrow-right-s-line"></i>
          <Link href="/forum" className="hover:text-green-600 cursor-pointer">Diễn đàn</Link>
          <i className="ri-arrow-right-s-line"></i>
          <span className="text-gray-900">Chi tiết bài viết</span>
        </div>

        {/* Post Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          {/* Post Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start space-x-4">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
              />
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <button
                    onClick={() => handleContactProfile(post.author.userId)}
                    className="text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors cursor-pointer"
                  >
                    {post.author.name}
                  </button>
                  <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {post.author.level}
                  </span>
                  {post.isVip && (
                    <span className="flex items-center space-x-1 text-yellow-600">
                      <i className="ri-vip-crown-line"></i>
                      <span className="text-sm">VIP</span>
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center space-x-4">
                    <span>{post.author.reputation} điểm uy tín</span>
                    <span>{post.author.totalPosts} bài viết</span>
                    <span>{post.author.location}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span>{post.author.joinDate}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right text-sm text-gray-600">
                <div>Đăng {post.createdAt}</div>
                {post.updatedAt && <div>Sửa {post.updatedAt}</div>}
                <div className="flex items-center space-x-3 mt-2">
                  <div className="flex items-center space-x-1">
                    <i className="ri-eye-line"></i>
                    <span>{post.views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <i className="ri-chat-3-line"></i>
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Post Body */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">{post.title}</h1>
            
            {/* Content */}
            <div className="prose max-w-none mb-6">
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {post.content}
              </div>
            </div>

            {/* Images */}
            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {post.images.map((image, index) => (
                  <div key={index} className="rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`Hình ảnh ${index + 1}`}
                      className="w-full h-64 object-cover object-top hover:scale-105 transition-transform cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                    isLiked 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <i className={isLiked ? 'ri-heart-fill' : 'ri-heart-line'}></i>
                  <span>{likeCount}</span>
                </button>
                
                <button className="flex items-center space-x-2 bg-gray-50 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <i className="ri-bookmark-line"></i>
                  <span>Lưu</span>
                </button>
                
                <button 
                  onClick={shareToFacebook}
                  className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <i className="ri-facebook-line"></i>
                  <span>Chia sẻ</span>
                </button>

                <button
                  onClick={() => handleMessage()}
                  className="flex items-center space-x-2 bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors cursor-pointer"
                >
                  <i className="ri-message-line"></i>
                  <span>Nhắn tin</span>
                </button>
              </div>
              
              <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <i className="ri-more-2-line text-xl"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Bình luận ({comments.length})
            </h3>
          </div>

          {/* Comment Form */}
          <div className="p-6 border-b border-gray-200">
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <div className="flex space-x-4">
                <img
                  src="https://readdy.ai/api/search-image?query=Vietnamese%20person%20portrait%20neutral%20expression%20wearing%20casual%20clothes%2C%20clean%20simple%20background%20for%20user%20avatar&width=50&height=50&seq=currentuser&orientation=squarish"
                  alt="Bạn"
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Viết bình luận của bạn..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {newComment.length}/500 ký tự
                    </span>
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
                    >
                      Gửi bình luận
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Comments List */}
          <div className="divide-y divide-gray-200">
            {comments.map((comment) => (
              <div key={comment.id} className="p-6">
                <div className="flex space-x-4">
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <button
                        onClick={() => handleContactProfile(comment.author.userId)}
                        className="font-medium text-gray-900 hover:text-green-600 transition-colors cursor-pointer"
                      >
                        {comment.author.name}
                      </button>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {comment.author.level}
                      </span>
                      <span className="text-xs text-gray-500">{comment.author.reputation} điểm</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{comment.createdAt}</span>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed mb-3">{comment.content}</p>
                    
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500 transition-colors cursor-pointer">
                        <i className="ri-heart-line"></i>
                        <span>{comment.likes}</span>
                      </button>
                      <button className="text-sm text-gray-500 hover:text-green-600 transition-colors cursor-pointer">
                        Trả lời
                      </button>
                      <button
                        onClick={() => handleMessage(comment.author)}
                        className="text-sm text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        Nhắn tin
                      </button>
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 ml-6 space-y-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex space-x-3 bg-gray-50 rounded-lg p-4">
                            <img
                              src={reply.author.avatar}
                              alt={reply.author.name}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <button
                                  onClick={() => handleContactProfile(reply.author.userId)}
                                  className="text-sm font-medium text-gray-900 hover:text-green-600 transition-colors cursor-pointer"
                                >
                                  {reply.author.name}
                                </button>
                                <span className="text-xs text-gray-500">{reply.createdAt}</span>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed mb-2">{reply.content}</p>
                              <div className="flex items-center space-x-3">
                                <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-red-500 transition-colors cursor-pointer">
                                  <i className="ri-heart-line"></i>
                                  <span>{reply.likes}</span>
                                </button>
                                <button
                                  onClick={() => handleMessage(reply.author)}
                                  className="text-xs text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                                >
                                  Nhắn tin
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Comments */}
          <div className="p-6 text-center border-t border-gray-200">
            <button className="text-green-600 hover:text-green-700 font-medium cursor-pointer">
              Xem thêm bình luận
            </button>
          </div>
        </div>

        {/* Related Posts */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bài viết liên quan</h3>
          <div className="space-y-4">
            {[
              { title: 'Cách trị sâu bệnh cho cây rau muống', views: 156, comments: 8 },
              { title: 'Kinh nghiệm chọn giống rau sạch', views: 234, comments: 12 },
              { title: 'Phân bón hữu cơ tự làm tại nhà', views: 189, comments: 15 }
            ].map((relatedPost, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <h4 className="text-gray-900 hover:text-green-600 transition-colors">{relatedPost.title}</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{relatedPost.views} lượt xem</span>
                  <span>{relatedPost.comments} bình luận</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messenger Modal */}
        <MessengerModal
          isOpen={showMessengerModal}
          onClose={() => setShowMessengerModal(false)}
          recipientName={selectedUser?.name || ''}
          recipientAvatar={selectedUser?.avatar || ''}
          recipientPhone={selectedUser?.phone || '0123456789'}
        />
      </div>
    </div>
  );
}
