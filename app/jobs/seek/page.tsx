'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { jobs } from '../../../lib/api';

const typeOptions = [
  { value: 'JOB_SEEKER', label: 'Tìm việc' },
];

const categoryOptions = [
  'Nông nghiệp', 'Chăn nuôi', 'Xây dựng', 'Vận tải', 'Buôn bán', 'Giáo dục', 'Y tế', 'Khác',
];

export default function SeekJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', description: '', category: '',
    salary: '', location: '', experience: '', benefits: '',
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
      await jobs.create({
        title: form.title,
        description: form.description,
        type: 'JOB_SEEKER',
        category: form.category,
        salary: form.salary || undefined,
        location: form.location,
        experience: form.experience || undefined,
        benefits: form.benefits || undefined,
      });
      setSuccess(true);
      setTimeout(() => router.push('/jobs'), 2000);
    } catch (e: any) {
      setError(e.message || 'Đăng tin thất bại. Vui lòng đăng nhập trước.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="bg-surface border-b">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <Link href="/jobs"
            className="w-10 h-10 border border-line rounded-lg flex items-center justify-center hover:bg-paper">
            <i className="ri-arrow-left-line text-lg"></i>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-ink">Đăng tin tìm việc</h1>
            <p className="text-ink-soft text-sm">Giới thiệu bản thân để nhà tuyển dụng liên hệ</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Banner */}
        <div className="bg-forest-50 border border-forest-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <i className="ri-user-search-line text-forest-600 text-xl mt-0.5"></i>
          <div>
            <p className="text-forest-800 font-medium text-sm">Tin tìm việc</p>
            <p className="text-forest-600 text-xs mt-0.5">Nhà tuyển dụng sẽ thấy tin của bạn và liên hệ trực tiếp qua số điện thoại trong hồ sơ</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-lg p-6 space-y-6">
          {error && <div className="p-4 bg-brand-50 border border-brand-200 text-brand-600 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-ink mb-2">Tiêu đề *</label>
            <input type="text" name="title" required value={form.title} onChange={handleChange}
              placeholder="Ví dụ: Tìm việc thu hoạch cà phê, có kinh nghiệm 3 năm..."
              className="w-full px-4 py-3 border border-line rounded-lg focus:ring-2 focus:ring-forest-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">Ngành nghề *</label>
            <select name="category" required value={form.category} onChange={handleChange}
              className="w-full px-4 py-3 border border-line rounded-lg focus:ring-2 focus:ring-forest-500">
              <option value="">Chọn ngành nghề</option>
              {categoryOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Mức lương mong muốn</label>
              <input type="text" name="salary" value={form.salary} onChange={handleChange}
                placeholder="Ví dụ: 300.000đ/ngày, thỏa thuận..."
                className="w-full px-4 py-3 border border-line rounded-lg focus:ring-2 focus:ring-forest-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Khu vực làm việc *</label>
              <input type="text" name="location" required value={form.location} onChange={handleChange}
                placeholder="Xã/Huyện/Tỉnh mong muốn"
                className="w-full px-4 py-3 border border-line rounded-lg focus:ring-2 focus:ring-forest-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">Kinh nghiệm</label>
            <input type="text" name="experience" value={form.experience} onChange={handleChange}
              placeholder="Ví dụ: 3 năm thu hoạch cà phê, biết lái xe máy..."
              className="w-full px-4 py-3 border border-line rounded-lg focus:ring-2 focus:ring-forest-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">Giới thiệu bản thân *</label>
            <textarea name="description" required rows={5} value={form.description} onChange={handleChange}
              placeholder="Mô tả về kỹ năng, kinh nghiệm, thời gian có thể làm việc..."
              className="w-full px-4 py-3 border border-line rounded-lg focus:ring-2 focus:ring-forest-500 resize-none"
              maxLength={2000} />
            <p className="text-xs text-ink-faint mt-1">{form.description.length}/2000</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">Yêu cầu của bạn</label>
            <textarea name="benefits" rows={2} value={form.benefits} onChange={handleChange}
              placeholder="Ví dụ: Có chỗ ở, xe đưa đón, ăn trưa..."
              className="w-full px-4 py-3 border border-line rounded-lg focus:ring-2 focus:ring-forest-500 resize-none" />
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <Link href="/jobs"
              className="flex-1 px-6 py-3 border border-line text-ink rounded-lg hover:bg-paper text-center">
              Hủy
            </Link>
            <button type="submit" disabled={loading}
              className="flex-1 bg-forest-600 text-white px-6 py-3 rounded-lg hover:bg-forest-700 disabled:opacity-50 font-medium">
              {loading ? 'Đang đăng...' : 'Đăng tin tìm việc'}
            </button>
          </div>
        </form>
      </div>

      {success && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-8 max-w-sm mx-4 text-center">
            <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-line text-forest-600 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">Đăng tin thành công!</h3>
            <p className="text-ink-soft text-sm">Nhà tuyển dụng sẽ liên hệ qua số điện thoại của bạn</p>
          </div>
        </div>
      )}
    </div>
  );
}
