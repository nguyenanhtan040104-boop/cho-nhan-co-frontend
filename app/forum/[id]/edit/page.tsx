'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { forum } from '../../../../lib/api';

const categoryOptions = [
  { value: 'NONG_NGHIEP', label: 'Nông nghiệp tổng hợp' },
  { value: 'TRONG_TROT', label: 'Trồng trọt' },
  { value: 'CHAN_NUOI', label: 'Chăn nuôi' },
  { value: 'THI_TRUONG', label: 'Thị trường nông sản' },
  { value: 'KY_THUAT', label: 'Công nghệ nông nghiệp' },
  { value: 'KINH_NGHIEM', label: 'Chia sẻ kinh nghiệm' },
  { value: 'HOI_DAP', label: 'Hỏi đáp' },
  { value: 'KINH_DOANH', label: 'Kinh doanh nông nghiệp' },
  { value: 'KHAC', label: 'Khác' },
];

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '', content: '', category: 'NONG_NGHIEP', tags: '', isAnonymous: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    forum.getOne(id)
      .then((data: any) => {
        setForm({
          title: data.title || '',
          content: data.content || '',
          category: data.category || 'NONG_NGHIEP',
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
          isAnonymous: data.isAnonymous || false,
        });
      })
      .catch(() => setError('Không tìm thấy bài viết hoặc bạn không có quyền chỉnh sửa'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      await forum.updatePost(id, {
        title: form.title,
        content: form.content,
        category: form.category,
        tags,
        isAnonymous: form.isAnonymous,
      });
      setSuccess('Đã lưu thành công!');
      setTimeout(() => router.push(`/forum/${id}`), 1500);
    } catch (e: any) {
      setError(e.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <Link href={`/forum/${id}`}
            className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">
            <i className="ri-arrow-left-line text-lg"></i>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa bài viết</h1>
            <p className="text-gray-500 text-sm">Cập nhật nội dung bài đăng</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm mb-4">{error}</div>}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm mb-4 flex items-center gap-2">
            <i className="ri-check-circle-line"></i>{success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
            <input type="text" name="title" required value={form.title} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chuyên mục</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
              {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung *</label>
            <textarea name="content" required rows={10} value={form.content} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
              maxLength={5000} />
            <p className="text-xs text-gray-400 mt-1">{form.content.length}/5000</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (phân cách bằng dấu phẩy)</label>
            <input type="text" name="tags" value={form.tags} onChange={handleChange}
              placeholder="cà phê, thu hoạch, kinh nghiệm..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isAnonymous" checked={form.isAnonymous}
              onChange={e => setForm(prev => ({ ...prev, isAnonymous: e.target.checked }))} className="rounded" />
            <span className="text-sm text-gray-700">Đăng ẩn danh</span>
          </label>

          <div className="flex gap-4 pt-4 border-t">
            <Link href={`/forum/${id}`}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center">
              Hủy
            </Link>
            <button type="submit" disabled={saving}
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium">
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
