'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { jobs } from '../../../../lib/api';

const typeOptions = [
  { value: 'FULL_TIME', label: 'Toàn thời gian' },
  { value: 'PART_TIME', label: 'Bán thời gian' },
  { value: 'SEASONAL', label: 'Thời vụ' },
  { value: 'FREELANCE', label: 'Tự do' },
];

const categoryOptions = [
  'Nông nghiệp', 'Chăn nuôi', 'Xây dựng', 'Vận tải', 'Buôn bán', 'Giáo dục', 'Y tế', 'Khác',
];

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '', description: '', type: 'FULL_TIME', category: '',
    salary: '', location: '', experience: '', benefits: '',
    deadline: '', isUrgent: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    jobs.getOne(id)
      .then((data: any) => {
        setForm({
          title: data.title || '',
          description: data.description || '',
          type: data.type || 'FULL_TIME',
          category: data.category || '',
          salary: data.salary || '',
          location: data.location || '',
          experience: data.experience || '',
          benefits: data.benefits || '',
          deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '',
          isUrgent: data.isUrgent || false,
        });
      })
      .catch(() => setError('Không tìm thấy tin hoặc bạn không có quyền chỉnh sửa'))
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
      await jobs.update(id, {
        title: form.title,
        description: form.description,
        salary: form.salary || undefined,
        location: form.location,
        isUrgent: form.isUrgent,
      });
      setSuccess('Đã lưu thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkUrgent() {
    setSaving(true);
    try {
      await jobs.markUrgent(id);
      setForm(prev => ({ ...prev, isUrgent: true }));
      setSuccess('Đã đánh dấu tuyển gấp!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message || 'Thất bại');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <Link href={`/jobs/${id}`}
            className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">
            <i className="ri-arrow-left-line text-lg"></i>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa tin tuyển dụng</h1>
            <p className="text-gray-500 text-sm">Cập nhật thông tin tin đăng</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
            <i className="ri-check-circle-line"></i>{success}
          </div>
        )}

        {/* Urgent toggle */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i className="ri-alarm-warning-line text-red-500"></i>
            Trạng thái tuyển gấp
          </h2>
          {form.isUrgent ? (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">KHẨN CẤP</span>
              <span className="text-red-700 text-sm">Tin đang được đánh dấu tuyển gấp — hiển thị ưu tiên đầu trang</span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="text-gray-600 text-sm">Chưa đánh dấu tuyển gấp</span>
              <button onClick={handleMarkUrgent} disabled={saving}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50 font-medium">
                Đánh dấu KHẨN CẤP
              </button>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <i className="ri-file-edit-line text-indigo-600"></i>
            Thông tin tin đăng
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
            <input type="text" name="title" required value={form.title} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mức lương</label>
              <input type="text" name="salary" value={form.salary} onChange={handleChange}
                placeholder="300.000đ/ngày, thỏa thuận..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm *</label>
              <input type="text" name="location" required value={form.location} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả công việc *</label>
            <textarea name="description" required rows={5} value={form.description} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
              maxLength={2000} />
            <p className="text-xs text-gray-400 mt-1">{form.description.length}/2000</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quyền lợi</label>
            <textarea name="benefits" rows={3} value={form.benefits} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>

          <div className="flex justify-end pt-4 border-t gap-4">
            <Link href={`/jobs/${id}`}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Xem tin
            </Link>
            <button type="submit" disabled={saving}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium">
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
