'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const categories = [
  { id: 'general', name: '🌾 Nông nghiệp tổng hợp', description: 'Thảo luận chung về nông nghiệp' },
  { id: 'crops', name: '🌱 Trồng trọt', description: 'Kỹ thuật trồng cây, chăm sóc cây trồng' },
  { id: 'livestock', name: '🐄 Chăn nuôi', description: 'Kỹ thuật chăn nuôi, chăm sóc vật nuôi' },
  { id: 'market', name: '📈 Thị trường nông sản', description: 'Giá cả, xu hướng thị trường' },
  { id: 'technology', name: '💡 Công nghệ nông nghiệp', description: 'Công nghệ mới, máy móc thiết bị' },
  { id: 'experience', name: '📚 Chia sẻ kinh nghiệm', description: 'Câu chuyện, bài học từ thực tế' },
  { id: 'questions', name: '❓ Hỏi đáp', description: 'Đặt câu hỏi và nhận tư vấn' },
  { id: 'business', name: '💼 Kinh doanh nông nghiệp', description: 'Khởi nghiệp, mở rộng sản xuất' }
];

const postTypes = [
  { id: 'discussion', name: 'Thảo luận', icon: 'ri-chat-3-line' },
  { id: 'question', name: 'Câu hỏi', icon: 'ri-question-line' },
  { id: 'share', name: 'Chia sẻ', icon: 'ri-share-line' },
  { id: 'guide', name: 'Hướng dẫn', icon: 'ri-book-open-line' }
];

export default function CreateForumPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    postType: 'discussion',
    content: '',
    tags: '',
    isAnonymous: false,
    allowComments: true,
    authorName: '',
    authorPhone: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Tạo bài viết mới
    const newPost = {
      id: Date.now(),
      title: formData.title,
      category: formData.category,
      postType: formData.postType,
      content: formData.content,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      isAnonymous: formData.isAnonymous,
      allowComments: formData.allowComments,
      author: formData.isAnonymous ? 'Ẩn danh' : formData.authorName,
      authorPhone: formData.isAnonymous ? '' : formData.authorPhone,
      createdAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      comments: 0,
      isSticky: false,
      status: 'active'
    };

    // Lưu bài viết vào localStorage
    const existingPosts = JSON.parse(localStorage.getItem('userForumPosts') || '[]');
    existingPosts.unshift(newPost);
    localStorage.setItem('userForumPosts', JSON.stringify(existingPosts));

    // Hiển thị thông báo thành công
    setShowSuccess(true);
    
    // Chuyển hướng sau 2 giây
    setTimeout(() => {
      router.push('/forum');
    }, 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/forum"
              className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-line w-5 h-5 flex items-center justify-center"></i>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tạo bài viết mới</h1>
              <p className="text-gray-600">Chia sẻ kiến thức và kinh nghiệm với cộng đồng</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Post Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Loại bài viết *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {postTypes.map(type => (
                  <label
                    key={type.id}
                    className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.postType === type.id
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="postType"
                      value={type.id}
                      checked={formData.postType === type.id}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <i className={`${type.icon} text-2xl mb-2 w-6 h-6 flex items-center justify-center`}></i>
                    <span className="text-sm font-medium">{type.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề bài viết *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                placeholder="VD: Cách trồng cà phê Robusta cho năng suất cao"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chủ đề *
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-8 cursor-pointer"
              >
                <option value="">Chọn chủ đề phù hợp</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {formData.category && (
                <p className="text-sm text-gray-500 mt-1">
                  {categories.find(c => c.id === formData.category)?.description}
                </p>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung bài viết *
              </label>
              <textarea
                name="content"
                required
                rows={12}
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Chia sẻ kiến thức, kinh nghiệm hoặc đặt câu hỏi để nhận được sự hỗ trợ từ cộng đồng..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                maxLength={5000}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.content.length}/5000 ký tự
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Từ khóa (Tags)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="VD: cà phê, robusta, trồng trọt (phân cách bằng dấu phẩy)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Thêm từ khóa giúp bài viết dễ được tìm thấy hơn
              </p>
            </div>

            {/* Author Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tác giả</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    name="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="isAnonymous" className="text-sm text-gray-700">
                    <span className="font-medium">Đăng ẩn danh</span>
                    <p className="text-gray-500 mt-1">Tên của bạn sẽ không hiển thị công khai</p>
                  </label>
                </div>

                {!formData.isAnonymous && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        name="authorName"
                        required={!formData.isAnonymous}
                        value={formData.authorName}
                        onChange={handleInputChange}
                        placeholder="Nhập họ và tên"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="authorPhone"
                        value={formData.authorPhone}
                        onChange={handleInputChange}
                        placeholder="0912345678 (tùy chọn)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Cài đặt bài viết</h3>
              
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="allowComments"
                  name="allowComments"
                  checked={formData.allowComments}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="allowComments" className="text-sm text-gray-700">
                  <span className="font-medium">Cho phép bình luận</span>
                  <p className="text-gray-500 mt-1">Mọi người có thể bình luận và thảo luận về bài viết</p>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <Link
                href="/forum"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center whitespace-nowrap cursor-pointer"
              >
                Hủy bỏ
              </Link>
              <button
                type="submit"
                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                Đăng bài viết
              </button>
            </div>
          </form>
        </div>

        {/* Guidelines */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Hướng dẫn viết bài hiệu quả</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Tiêu đề hay:</h4>
              <ul className="space-y-1">
                <li>• Rõ ràng, cụ thể</li>
                <li>• Thể hiện được vấn đề chính</li>
                <li>• Thu hút sự chú ý</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Nội dung chất lượng:</h4>
              <ul className="space-y-1">
                <li>• Có cấu trúc rõ ràng</li>
                <li>• Thông tin chính xác, hữu ích</li>
                <li>• Dễ hiểu, dễ áp dụng</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-check-line text-purple-600 text-2xl w-8 h-8 flex items-center justify-center"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Đăng bài thành công!
                </h3>
                <p className="text-gray-600 mb-4">
                  Bài viết đã được thêm vào diễn đàn
                </p>
                <div className="text-sm text-gray-500">
                  Đang chuyển đến trang diễn đàn...
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}