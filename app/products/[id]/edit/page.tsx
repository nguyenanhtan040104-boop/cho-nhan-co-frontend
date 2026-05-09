'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { products as productsApi, uploads } from '../../../../lib/api';

const categories = [
  { value: 'NONG_SAN', label: 'Nông sản' },
  { value: 'VAT_NUOI', label: 'Vật nuôi' },
  { value: 'DO_DUNG_GIA_DINH', label: 'Đồ dùng gia đình' },
  { value: 'HANG_TIEU_DUNG', label: 'Hàng tiêu dùng' },
  { value: 'DICH_VU', label: 'Dịch vụ' },
];

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [form, setForm] = useState({
    title: '', description: '', category: '', price: '', unit: '',
    quantity: '', location: '', contactPhone: '',
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    productsApi.getOne(id).then((p: any) => {
      setForm({
        title: p.title || '',
        description: p.description || '',
        category: p.category || '',
        price: String(p.price || ''),
        unit: p.unit || '',
        quantity: String(p.quantity ?? ''),
        location: p.location || '',
        contactPhone: p.contactPhone || '',
      });
      setExistingImages(p.images?.map((img: any) => img.url) || []);
    }).catch(() => setError('Không tìm thấy sản phẩm'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleNewImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length + existingImages.length + newFiles.length > 10) {
      setError('Tối đa 10 ảnh'); return;
    }
    setNewFiles(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setNewPreviews(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  }

  function removeExisting(i: number) {
    setExistingImages(prev => prev.filter((_, idx) => idx !== i));
  }

  function removeNew(i: number) {
    setNewFiles(prev => prev.filter((_, idx) => idx !== i));
    setNewPreviews(prev => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      // Upload ảnh mới nếu có
      let newUrls: string[] = [];
      if (newFiles.length > 0) {
        const uploaded = await uploads.uploadImages(newFiles);
        newUrls = uploaded.map(u => u.url);
      }

      await productsApi.update(id, {
        title: form.title,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        unit: form.unit,
        quantity: form.quantity ? Number(form.quantity) : undefined,
        location: form.location,
        contactPhone: form.contactPhone || undefined,
      });

      router.push(`/products/${id}`);
    } catch (e: any) {
      setError(e.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <Link href={`/products/${id}`} className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">
            <i className="ri-arrow-left-line text-lg"></i>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h1>
            <p className="text-gray-500 text-sm">Cập nhật thông tin sản phẩm</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

          {/* Ảnh hiện có */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>
            <div className="flex flex-wrap gap-3 mb-2">
              {existingImages.map((url, i) => (
                <div key={i} className="relative w-24 h-24">
                  <img src={url} className="w-full h-full object-cover rounded-lg border" alt="" />
                  <button type="button" onClick={() => removeExisting(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                </div>
              ))}
              {newPreviews.map((src, i) => (
                <div key={`new-${i}`} className="relative w-24 h-24">
                  <img src={src} className="w-full h-full object-cover rounded-lg border border-green-300" alt="" />
                  <button type="button" onClick={() => removeNew(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                  <span className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-xs text-center py-0.5 rounded-b-lg">Mới</span>
                </div>
              ))}
              {existingImages.length + newFiles.length < 10 && (
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-400">
                  <i className="ri-image-add-line text-2xl text-gray-400"></i>
                  <span className="text-xs text-gray-400 mt-1">Thêm ảnh</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleNewImages} />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-400">Lưu ý: Ảnh cũ sẽ được giữ nguyên, chỉ thêm ảnh mới</p>
          </div>

          {/* Tên sản phẩm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm *</label>
            <input type="text" name="title" required value={form.title} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
          </div>

          {/* Danh mục & Giá */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục *</label>
              <select name="category" required value={form.category} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                <option value="">Chọn danh mục</option>
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá bán *</label>
              <div className="flex gap-2">
                <input type="number" name="price" required min="0" value={form.price} onChange={handleChange}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                <input type="text" name="unit" required value={form.unit} onChange={handleChange}
                  placeholder="kg/cái..." className="w-28 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
          </div>

          {/* Số lượng */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng</label>
            <input type="number" name="quantity" min="0" value={form.quantity} onChange={handleChange}
              placeholder="Để trống nếu không giới hạn"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả *</label>
            <textarea name="description" required rows={4} value={form.description} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
              maxLength={1000} />
            <p className="text-xs text-gray-400 mt-1">{form.description.length}/1000</p>
          </div>

          {/* Địa điểm & SĐT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm *</label>
              <input type="text" name="location" required value={form.location} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <input type="tel" name="contactPhone" value={form.contactPhone} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <Link href={`/products/${id}`} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center">
              Hủy
            </Link>
            <button type="submit" disabled={saving}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50">
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
