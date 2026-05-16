'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { jobs, uploads } from '../../../lib/api';
import { auth as _auth } from '../../../lib/api';

const typeOptions = [
  { value: 'EMPLOYER', label: 'Tuyển dụng' },
  { value: 'JOB_SEEKER', label: 'Tìm việc' },
];

const categoryOptions = [
  'Nông nghiệp', 'Chăn nuôi', 'Xây dựng', 'Vận tải', 'Buôn bán', 'Giáo dục', 'Y tế', 'Khác',
];

export default function CreateJobPage() {
  const router = useRouter();

  useEffect(() => {
    if (!_auth.isLoggedIn()) { router.replace("/profile"); }
  }, []);
  const [form, setForm] = useState({
    title: '', description: '', type: 'EMPLOYER', category: '',
    salary: '', location: '', experience: '', benefits: '',
    deadline: '', isUrgent: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 6) { alert('Tối đa 6 ảnh'); return; }
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    e.target.value = '';
  }

  function removeImage(i: number) {
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        const uploaded = await uploads.uploadImages(imageFiles);
        imageUrls = uploaded.map(u => u.url);
      }
      await jobs.create({
        title: form.title,
        description: form.description,
        type: form.type,
        category: form.category,
        salary: form.salary || undefined,
        location: form.location,
        experience: form.experience || undefined,
        benefits: form.benefits || undefined,
        deadline: form.deadline ? new Date(form.deadline) : undefined,
        isUrgent: form.isUrgent,
        images: imageUrls,
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <Link href="/jobs" className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">
            <i className="ri-arrow-left-line text-lg"></i>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đăng tin tuyển dụng</h1>
            <p className="text-gray-500 text-sm">Tìm kiếm nhân lực phù hợp</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Type selector — 2 big cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {typeOptions.map(o => (
            <button key={o.value} type="button"
              onClick={() => setForm(prev => ({ ...prev, type: o.value }))}
              className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all ${form.type === o.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-500 hover:border-indigo-300'}`}>
              <i className={`text-3xl ${o.value === 'EMPLOYER' ? 'ri-building-2-line' : 'ri-user-search-line'}`}></i>
              <span className="font-semibold text-base">{o.label}</span>
              <span className="text-xs text-center">{o.value === 'EMPLOYER' ? 'Bạn cần tuyển người' : 'Bạn đang tìm việc'}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
            <input type="text" name="title" required value={form.title} onChange={handleChange}
              placeholder={form.type === 'EMPLOYER' ? 'Ví dụ: Tuyển công nhân hái cà phê mùa vụ...' : 'Ví dụ: Tìm việc làm nông nghiệp tại Đắk Lắk...'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngành nghề *</label>
              <select name="category" required value={form.category} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="">Chọn ngành nghề</option>
                {categoryOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm *</label>
              <input type="text" name="location" required value={form.location} onChange={handleChange}
                placeholder="Xã/Huyện/Tỉnh"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {form.type === 'EMPLOYER' ? 'Mức lương' : 'Mức lương mong muốn'}
              </label>
              <input type="text" name="salary" value={form.salary} onChange={handleChange}
                placeholder={form.type === 'EMPLOYER' ? 'Ví dụ: 300.000đ/ngày, thỏa thuận...' : 'Ví dụ: 5-7 triệu/tháng, thỏa thuận...'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {form.type === 'EMPLOYER' ? 'Kinh nghiệm yêu cầu' : 'Kinh nghiệm bản thân'}
              </label>
              <input type="text" name="experience" value={form.experience} onChange={handleChange}
                placeholder={form.type === 'EMPLOYER' ? 'Ví dụ: Không yêu cầu, 1-2 năm...' : 'Ví dụ: 2 năm làm nông, chưa có kinh nghiệm...'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          {/* Chỉ hiển thị cho Tuyển dụng */}
          {form.type === 'EMPLOYER' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hạn nộp hồ sơ</label>
              <input type="date" name="deadline" value={form.deadline} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {form.type === 'EMPLOYER' ? 'Mô tả công việc *' : 'Giới thiệu bản thân *'}
            </label>
            <textarea name="description" required rows={5} value={form.description} onChange={handleChange}
              placeholder={form.type === 'EMPLOYER' ? 'Mô tả chi tiết về công việc, yêu cầu, giờ làm...' : 'Giới thiệu về bản thân, kỹ năng, mong muốn công việc...'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
              maxLength={2000} />
            <p className="text-xs text-gray-400 mt-1">{form.description.length}/2000</p>
          </div>

          {/* Chỉ hiển thị cho Tuyển dụng */}
          {form.type === 'EMPLOYER' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quyền lợi</label>
              <textarea name="benefits" rows={3} value={form.benefits} onChange={handleChange}
                placeholder="Ăn ở, xe đưa đón, bảo hiểm..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
          )}

          {/* Upload ảnh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh đính kèm (tối đa 6 ảnh)</label>
            <div className="flex flex-wrap gap-2">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                    <i className="ri-close-line text-xs"></i>
                  </button>
                </div>
              ))}
              {imagePreviews.length < 6 && (
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                  <i className="ri-image-add-line text-2xl text-gray-400"></i>
                  <span className="text-xs text-gray-400 mt-1">Thêm ảnh</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>

          {form.type === 'EMPLOYER' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isUrgent" checked={form.isUrgent}
                onChange={e => setForm(prev => ({ ...prev, isUrgent: e.target.checked }))} className="rounded" />
              <span className="text-sm text-gray-700">Đánh dấu là <span className="text-red-600 font-medium">Tuyển gấp</span></span>
            </label>
          )}

          <div className="flex gap-4 pt-4 border-t">
            <Link href="/jobs" className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center">Hủy</Link>
            <button type="submit" disabled={loading}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {loading ? 'Đang đăng...' : 'Đăng tin'}
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
            <h3 className="text-lg font-semibold mb-2">Đăng tin thành công!</h3>
            <p className="text-gray-500 text-sm">Đang chuyển trang...</p>
          </div>
        </div>
      )}
    </div>
  );
}
