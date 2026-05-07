'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { products as productsApi, uploads } from '../../../lib/api';

const categories = [
  { id: 'NONG_SAN', name: 'Nông sản' },
  { id: 'VAT_NUOI', name: 'Vật nuôi' },
  { id: 'DO_DUNG_GIA_DINH', name: 'Đồ dùng gia đình' },
  { id: 'HANG_TIEU_DUNG', name: 'Hàng tiêu dùng' },
  { id: 'DICH_VU', name: 'Dịch vụ' },
];

export default function CreateProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    unit: '',
    description: '',
    location: '',
    contactPhone: '',
    quantity: '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 10) {
      setError('Tối đa 10 ảnh');
      return;
    }
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index: number) {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Upload ảnh trước
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        const uploaded = await uploads.uploadImages(imageFiles);
        imageUrls = uploaded.map(u => u.url);
      }

      // Tạo sản phẩm
      await productsApi.create({
        title: formData.title,
        category: formData.category as any,
        price: Number(formData.price),
        unit: formData.unit,
        description: formData.description,
        location: formData.location,
        contactPhone: formData.contactPhone || undefined,
        quantity: formData.quantity ? Number(formData.quantity) : undefined,
        images: imageUrls,
      });

      setShowSuccess(true);
      setTimeout(() => router.push('/products'), 2000);
    } catch (e: any) {
      setError(e.message || 'Đăng sản phẩm thất bại. Vui lòng đăng nhập trước.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/products" className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50">
              <i className="ri-arrow-left-line text-lg"></i>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Đăng sản phẩm mới</h1>
              <p className="text-gray-600">Chia sẻ sản phẩm của bạn với cộng đồng</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh sản phẩm (tối đa 10 ảnh)</label>
              <div className="flex flex-wrap gap-3 mb-3">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative w-24 h-24">
                    <img src={src} className="w-full h-full object-cover rounded-lg border" alt="" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                      ×
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 10 && (
                  <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-400 transition-colors">
                    <i className="ri-image-add-line text-2xl text-gray-400"></i>
                    <span className="text-xs text-gray-400 mt-1">Thêm ảnh</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </div>

            {/* Tên sản phẩm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm *</label>
              <input type="text" name="title" required value={formData.title} onChange={handleInputChange}
                placeholder="Nhập tên sản phẩm..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>

            {/* Danh mục & Giá */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục *</label>
                <select name="category" required value={formData.category} onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                  <option value="">Chọn danh mục</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giá bán *</label>
                <div className="flex gap-2">
                  <input type="number" name="price" required value={formData.price} onChange={handleInputChange}
                    placeholder="0" min="0"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                  <input type="text" name="unit" required value={formData.unit} onChange={handleInputChange}
                    placeholder="kg/cái/bó..."
                    className="w-28 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
            </div>

            {/* Số lượng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng (tùy chọn)</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange}
                placeholder="Để trống nếu không giới hạn" min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả sản phẩm *</label>
              <textarea name="description" required rows={4} value={formData.description} onChange={handleInputChange}
                placeholder="Mô tả chi tiết về sản phẩm của bạn..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                maxLength={1000} />
              <p className="text-sm text-gray-500 mt-1">{formData.description.length}/1000 ký tự</p>
            </div>

            {/* Địa điểm & SĐT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm *</label>
                <input type="text" name="location" required value={formData.location} onChange={handleInputChange}
                  placeholder="Tỉnh/Thành phố"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại liên hệ</label>
                <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange}
                  placeholder="0912345678"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <Link href="/products"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center">
                Hủy bỏ
              </Link>
              <button type="submit" disabled={loading}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Đang đăng...' : 'Đăng sản phẩm'}
              </button>
            </div>
          </form>
        </div>

        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-check-line text-green-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Đăng sản phẩm thành công!</h3>
              <p className="text-gray-600 mb-2">Sản phẩm của bạn đã được lưu vào hệ thống</p>
              <p className="text-sm text-gray-500">Đang chuyển đến trang sản phẩm...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
