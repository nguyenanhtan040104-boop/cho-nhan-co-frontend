'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { realEstate, uploads } from '../../../lib/api';
import { auth as _auth } from '../../../lib/api';

const typeOptions = [
  { value: 'NHA_O', label: 'Nhà ở' },
  { value: 'DAT_NEN', label: 'Đất nền' },
  { value: 'PHONG_TRO', label: 'Phòng trọ' },
  { value: 'MAT_BANG', label: 'Mặt bằng kinh doanh' },
];

const legalOptions = [
  'Sổ đỏ chính chủ', 'Sổ hồng', 'Giấy tờ hợp lệ', 'Hợp đồng mua bán', 'Đang làm sổ', 'Khác',
];

export default function CreateRealEstatePage() {
  const router = useRouter();

  useEffect(() => {
    if (!_auth.isLoggedIn()) { router.replace("/profile"); }
  }, []);
  const [form, setForm] = useState({
    title: '', description: '', type: 'NHA_O',
    price: '', area: '', address: '', legalStatus: '',
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
    if (files.length + imageFiles.length > 10) { setError('Tối đa 10 ảnh'); return; }
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
    if (imageFiles.length === 0) {
      setError('Vui lòng thêm ít nhất 1 ảnh bất động sản');
      return;
    }
    setLoading(true);
    try {
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        const uploaded = await uploads.uploadImages(imageFiles);
        imageUrls = uploaded.map(u => u.url);
      }

      const created: any = await realEstate.create({
        title: form.title,
        description: form.description,
        type: form.type,
        price: Number(form.price),
        area: Number(form.area),
        address: form.address,
        legalStatus: form.legalStatus || undefined,
      });

      // Thêm ảnh nếu có
      if (imageUrls.length > 0 && created.id) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/real-estates/${created.id}/images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({ images: imageUrls.map(url => ({ url })) }),
        });
      }

      setSuccess(true);
      setTimeout(() => router.push('/real-estate'), 2000);
    } catch (e: any) {
      const status = e?.statusCode || e?.status;
      if (status === 403 || (e?.message && e.message.toLowerCase().includes('gioi han'))) {
        setError('Ban da dat gioi han dang bai thang nay. Nang cap VIP de dang them bai.');
      } else {
        setError(e.message || 'Dang tin that bai. Vui long dang nhap truoc.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <Link href="/real-estate" className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">
            <i className="ri-arrow-left-line text-lg"></i>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đăng tin bất động sản</h1>
            <p className="text-gray-500 text-sm">Nhà ở, đất nền, phòng trọ...</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
              {error.includes('gioi han') && (
                <div className="mt-2">
                  <Link href="/vip" className="text-red-800 font-semibold underline">Xem goi VIP &rarr;</Link>
                </div>
              )}
            </div>
          )}

          {/* Ảnh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh (tối đa 10 ảnh)</label>
            <div className="flex flex-wrap gap-3">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative w-24 h-24">
                  <img src={src} className="w-full h-full object-cover rounded-lg border" alt="" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                </div>
              ))}
              {imagePreviews.length < 10 && (
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-400">
                  <i className="ri-image-add-line text-2xl text-gray-400"></i>
                  <span className="text-xs text-gray-400 mt-1">Thêm ảnh</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>

          {/* Tiêu đề */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
            <input type="text" name="title" required value={form.title} onChange={handleChange}
              placeholder="Ví dụ: Bán đất vườn 1000m² mặt tiền đường xã..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
          </div>

          {/* Loại & Giá */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại bất động sản *</label>
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá (đồng) *</label>
              <input type="number" name="price" required min="0" value={form.price} onChange={handleChange}
                placeholder="Ví dụ: 500000000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          {/* Diện tích & Địa chỉ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Diện tích (m²) *</label>
              <input type="number" name="area" required min="1" value={form.area} onChange={handleChange}
                placeholder="Ví dụ: 500"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pháp lý</label>
              <select name="legalStatus" value={form.legalStatus} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                <option value="">Chưa rõ</option>
                {legalOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ *</label>
            <input type="text" name="address" required value={form.address} onChange={handleChange}
              placeholder="Xã/Phường, Huyện/Quận, Tỉnh/TP"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết *</label>
            <textarea name="description" required rows={5} value={form.description} onChange={handleChange}
              placeholder="Mô tả về vị trí, hiện trạng, tiện ích xung quanh..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
              maxLength={2000} />
            <p className="text-xs text-gray-400 mt-1">{form.description.length}/2000</p>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <Link href="/real-estate" className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center">
              Hủy
            </Link>
            <button type="submit" disabled={loading}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50">
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
