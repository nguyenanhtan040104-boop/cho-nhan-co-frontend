'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { advertisements, uploads } from '../../../lib/api';

const CATEGORIES = [
  { value: 'KHAI_TRUONG', label: 'Khai trương' },
  { value: 'KHUYEN_MAI', label: 'Khuyến mãi' },
  { value: 'SAN_PHAM_MOI', label: 'Sản phẩm mới' },
  { value: 'DICH_VU', label: 'Dịch vụ' },
  { value: 'SU_KIEN', label: 'Sự kiện' },
  { value: 'KHAC', label: 'Khác' },
];

export default function CreateAdvertisementPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', category: 'KHAI_TRUONG', description: '',
    businessName: '', location: '', contactName: '', contactPhone: '',
    startDate: '', endDate: '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 5) { setError('Tối đa 5 ảnh'); return; }
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setImagePreviews(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  }

  function removeImage(i: number) {
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
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

      await advertisements.create({
        title: form.title,
        category: form.category,
        description: form.description,
        businessName: form.businessName || undefined,
        images: imageUrls,
        location: form.location || undefined,
        contactName: form.contactName || undefined,
        contactPhone: form.contactPhone || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      });

      setSuccess(true);
      setTimeout(() => router.push('/advertisements'), 2000);
    } catch (e: any) {
      setError(e.message || 'Đăng thất bại. Vui lòng đăng nhập trước.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <Link href="/advertisements" className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">
            <i className="ri-arrow-left-line text-lg"></i>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đăng quảng cáo</h1>
            <p className="text-gray-500 text-sm">Khai trương, khuyến mãi, sự kiện...</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

          {/* Ảnh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh (tối đa 5 ảnh)</label>
            <div className="flex flex-wrap gap-3">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative w-24 h-24">
                  <img src={src} className="w-full h-full object-cover rounded-lg border" alt="" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                </div>
              ))}
              {imagePreviews.length < 5 && (
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-400">
                  <i className="ri-image-add-line text-2xl text-gray-400"></i>
                  <span className="text-xs text-gray-400 mt-1">Thêm ảnh</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>

          {/* Tiêu đề & Danh mục */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
              <input type="text" name="title" required value={form.title} onChange={handleChange}
                placeholder="Ví dụ: Khai trương cửa hàng tạp hóa Minh Phát..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại quảng cáo *</label>
              <select name="category" value={form.category} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Tên cửa hàng */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên cửa hàng / doanh nghiệp</label>
            <input type="text" name="businessName" value={form.businessName} onChange={handleChange}
              placeholder="Ví dụ: Tạp hóa Minh Phát"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400" />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung quảng cáo *</label>
            <textarea name="description" required rows={5} value={form.description} onChange={handleChange}
              placeholder="Mô tả chi tiết về chương trình, khuyến mãi, sự kiện..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 resize-none"
              maxLength={2000} />
            <p className="text-xs text-gray-400 mt-1">{form.description.length}/2000</p>
          </div>

          {/* Thời gian */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc</label>
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>

          {/* Địa điểm & Liên hệ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm</label>
              <input type="text" name="location" value={form.location} onChange={handleChange}
                placeholder="Địa chỉ cửa hàng / sự kiện"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên người liên hệ</label>
              <input type="text" name="contactName" value={form.contactName} onChange={handleChange}
                placeholder="Họ tên"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại liên hệ</label>
            <input type="tel" name="contactPhone" value={form.contactPhone} onChange={handleChange}
              placeholder="0912345678"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400" />
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <Link href="/advertisements" className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center">Hủy</Link>
            <button type="submit" disabled={loading}
              className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50">
              {loading ? 'Đang đăng...' : 'Đăng quảng cáo'}
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
            <h3 className="text-lg font-semibold mb-2">Đăng thành công!</h3>
            <p className="text-gray-500 text-sm">Đang chuyển trang...</p>
          </div>
        </div>
      )}
    </div>
  );
}
