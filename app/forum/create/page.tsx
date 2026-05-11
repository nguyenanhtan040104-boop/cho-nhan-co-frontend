'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forum } from '../../../lib/api';
import { auth as _auth } from '../../../lib/api';

const categoryOptions = [
  { value: 'NONG_NGHIEP', label: 'Nông nghiệp' },
  { value: 'CHAN_NUOI', label: 'Chăn nuôi' },
  { value: 'THI_TRUONG', label: 'Thị trường' },
  { value: 'KY_THUAT', label: 'Kỹ thuật' },
  { value: 'KINH_NGHIEM', label: 'Kinh nghiệm' },
  { value: 'KHAC', label: 'Khác' },
];

export default function CreatePostPage() {
  const router = useRouter();

  useEffect(() => {
    if (!_auth.isLoggedIn()) { router.replace("/profile"); }
  }, []);
  const [form, setForm] = useState({
    title: '', content: '', category: 'NONG_NGHIEP',
    tags: '', isAnonymous: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      await forum.create({
        title: form.title,
        content: form.content,
        category: form.category,
        tags,
        isAnonymous: form.isAnonymous,
      });
      setSuccess(true);
      setTimeout(() => router.push('/forum'), 2000);
    } catch (e: any) {
      setError(e.message || 'Đăng bài thất bại. Vui lòng xác thực email trước.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center gap-4">
          <Link href="/forum" className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">
            <i className="ri-arrow-left-line text-lg"></i>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Viết bài mới</h1>
            <p className="text-gray-500 text-sm">Chia sẻ kiến thức, kinh nghiệm với cộng đồng</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
            <input type="text" name="title" required value={form.title} onChange={handleChange}
              placeholder="Tiêu đề bài viết của bạn..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chủ đề *</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
              {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung *</label>
            <textarea name="content" required rows={10} value={form.content} onChange={handleChange}
              placeholder="Nội dung bài viết của bạn..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
              maxLength={5000} />
            <p className="text-xs text-gray-400 mt-1">{form.content.length}/5000</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (phân cách bằng dấu phẩy)</label>
            <input type="text" name="tags" value={form.tags} onChange={handleChange}
              placeholder="Ví dụ: lúa, phân bón, sâu bệnh"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isAnonymous}
              onChange={e => setForm(prev => ({ ...prev, isAnonymous: e.target.checked }))} className="rounded" />
            <span className="text-sm text-gray-700">Đăng ẩn danh</span>
          </label>

          <div className="flex gap-4 pt-4 border-t">
            <Link href="/forum" className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center">Hủy</Link>
            <button type="submit" disabled={loading}
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {loading ? 'Đang đăng...' : 'Đăng bài'}
            </button>
          </div>
        </form>
      </div>

      {success && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-sm mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-line text-green-600 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">Đăng bài thành công!</h3>
            <p className="text-gray-500 text-sm">Đang chuyển trang...</p>
          </div>
        </div>
      )}
    </div>
  );
}
