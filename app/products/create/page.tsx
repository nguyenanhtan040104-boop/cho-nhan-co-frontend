'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { products as productsApi, uploads, users as usersApi } from '../../../lib/api';
import { auth as _auth } from '../../../lib/api';

const CATEGORY_CONFIG: Record<string, { label: string; backHref: string; successHref: string; color: string }> = {
  NONG_SAN:        { label: 'Nông sản',  backHref: '/products', successHref: '/products', color: 'green' },
  VAT_NUOI:        { label: 'Vật nuôi',  backHref: '/vat-nuoi', successHref: '/vat-nuoi', color: 'amber' },
  DICH_VU:         { label: 'Dịch vụ',   backHref: '/dich-vu',  successHref: '/dich-vu',  color: 'indigo' },
  DO_DUNG_GIA_DINH:{ label: 'Đồ dùng gia đình', backHref: '/products', successHref: '/products', color: 'green' },
  HANG_TIEU_DUNG:  { label: 'Hàng tiêu dùng',   backHref: '/products', successHref: '/products', color: 'green' },
};

// Danh mục chỉ dùng khi không pre-select (trang nông sản chung)
const categories = [
  { id: 'NONG_SAN',         name: 'Nông sản' },
  { id: 'DO_DUNG_GIA_DINH', name: 'Đồ dùng gia đình' },
  { id: 'HANG_TIEU_DUNG',   name: 'Hàng tiêu dùng' },
];

// Subcategories cho vật nuôi
const VAT_NUOI_SUBS = ['Chó', 'Mèo', 'Gia cầm', 'Gia súc', 'Cá cảnh', 'Khác'];
// Subcategories cho dịch vụ
const DICH_VU_SUBS  = ['Sửa chữa', 'Vận chuyển', 'Tư vấn', 'Xây dựng', 'Giặt ủi', 'Vệ sinh', 'Khác'];

export default function CreateProductPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <CreateProductContent />
    </Suspense>
  );
}

function CreateProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initCategory = searchParams.get('category') || '';

  useEffect(() => {
    if (!_auth.isLoggedIn()) { router.replace('/profile'); }
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    category: initCategory,
    subCategory: '',
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
  const [monthlyUsage, setMonthlyUsage] = useState<{ used: number; limit: number; isVip: boolean; remaining: number } | null>(null);

  useEffect(() => {
    if (_auth.isLoggedIn()) {
      usersApi.getMonthlyUsage().then(setMonthlyUsage).catch(() => {});
    }
  }, []);

  const cfg = CATEGORY_CONFIG[formData.category] || CATEGORY_CONFIG['NONG_SAN'];

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
    if (imageFiles.length === 0) {
      setError('Vui lòng thêm ít nhất 1 ảnh');
      return;
    }
    setLoading(true);
    try {
      const uploaded = await uploads.uploadImages(imageFiles);
      const imageUrls = uploaded.map((u: any) => u.url);

      const descWithSub = formData.subCategory
        ? `#${formData.subCategory}\n${formData.description}`
        : formData.description;

      await productsApi.create({
        title: formData.title,
        category: formData.category as any,
        price: Number(formData.price),
        unit: formData.unit,
        description: descWithSub,
        location: formData.location,
        contactPhone: formData.contactPhone || undefined,
        quantity: formData.quantity ? Number(formData.quantity) : undefined,
        images: imageUrls,
      });

      setShowSuccess(true);
      setTimeout(() => router.push(cfg.successHref), 2000);
    } catch (e: any) {
      const status = e?.statusCode || e?.status;
      if (status === 403 || (e?.message && e.message.toLowerCase().includes('gioi han'))) {
        setError('Ban da dat gioi han dang bai thang nay. Nang cap VIP de dang them bai.');
      } else {
        setError(e.message || 'Dang that bai. Vui long dang nhap truoc.');
      }
    } finally {
      setLoading(false);
    }
  }

  const colorMap: Record<string, string> = {
    green:  'focus:ring-green-500 focus:border-green-500',
    amber:  'focus:ring-amber-500 focus:border-amber-500',
    indigo: 'focus:ring-indigo-500 focus:border-indigo-500',
  };
  const btnMap: Record<string, string> = {
    green:  'bg-green-600 hover:bg-green-700',
    amber:  'bg-amber-600 hover:bg-amber-700',
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
  };
  const ringClass = colorMap[cfg.color] || colorMap.green;
  const btnClass  = btnMap[cfg.color] || btnMap.green;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center gap-4">
            <Link href={cfg.backHref}
              className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50">
              <i className="ri-arrow-left-line text-lg"></i>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Đăng {cfg.label.toLowerCase()}
              </h1>
              <p className="text-sm text-gray-500">Điền đầy đủ thông tin để đăng tin</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Monthly usage banner */}
        {monthlyUsage && (
          <div className={`mb-4 p-3 rounded-lg text-sm flex items-center justify-between ${monthlyUsage.remaining === 0 ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
            <span>
              {monthlyUsage.isVip ? 'Goi VIP: ' : 'Goi mien phi: '}
              Thang nay da dang {monthlyUsage.used}/{monthlyUsage.limit === 999 ? 'khong gioi han' : monthlyUsage.limit} bai
              {monthlyUsage.remaining === 0 && ' - Da het luot dang bai'}
            </span>
            {!monthlyUsage.isVip && (
              <Link href="/vip" className="ml-2 underline font-medium whitespace-nowrap">Nang cap VIP</Link>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border">
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-1">(tối đa 10 ảnh)</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative w-24 h-24">
                    <img src={src} className="w-full h-full object-cover rounded-lg border" alt="" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow">
                      <i className="ri-close-line"></i>
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 10 && (
                  <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                    <i className="ri-image-add-line text-2xl text-gray-400"></i>
                    <span className="text-xs text-gray-400 mt-1">Thêm ảnh</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </div>

            {/* Tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input type="text" name="title" required value={formData.title} onChange={handleInputChange}
                placeholder={`Nhập tên ${cfg.label.toLowerCase()}...`}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 outline-none ${ringClass}`} />
            </div>

            {/* Danh mục & Giá */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                {/* Nếu category đã cố định (VAT_NUOI / DICH_VU) → show subcategory picker */}
                {initCategory === 'VAT_NUOI' ? (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại vật nuôi <span className="text-red-500">*</span>
                    </label>
                    <select name="subCategory" required value={formData.subCategory} onChange={handleInputChange}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 outline-none ${ringClass} bg-white`}>
                      <option value="">Chọn loại</option>
                      {VAT_NUOI_SUBS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </>
                ) : initCategory === 'DICH_VU' ? (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại dịch vụ <span className="text-red-500">*</span>
                    </label>
                    <select name="subCategory" required value={formData.subCategory} onChange={handleInputChange}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 outline-none ${ringClass} bg-white`}>
                      <option value="">Chọn loại</option>
                      {DICH_VU_SUBS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </>
                ) : (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục <span className="text-red-500">*</span>
                    </label>
                    <select name="category" required value={formData.category} onChange={handleInputChange}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 outline-none ${ringClass} bg-white`}>
                      <option value="">Chọn danh mục</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá bán <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input type="number" name="price" required value={formData.price} onChange={handleInputChange}
                    placeholder="0" min="0"
                    className={`flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 outline-none ${ringClass}`} />
                  <input type="text" name="unit" required value={formData.unit} onChange={handleInputChange}
                    placeholder="kg/cái..."
                    className={`w-24 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 outline-none ${ringClass}`} />
                </div>
              </div>
            </div>

            {/* Số lượng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng <span className="text-gray-400 font-normal">(để trống nếu không giới hạn)</span>
              </label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange}
                placeholder="VD: 100" min="0"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 outline-none ${ringClass}`} />
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả <span className="text-red-500">*</span>
              </label>
              <textarea name="description" required rows={5} value={formData.description} onChange={handleInputChange}
                placeholder="Mô tả chi tiết..."
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 outline-none resize-none ${ringClass}`}
                maxLength={1000} />
              <p className="text-xs text-gray-400 mt-1 text-right">{formData.description.length}/1000</p>
            </div>

            {/* Địa điểm & SĐT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa điểm <span className="text-red-500">*</span>
                </label>
                <input type="text" name="location" required value={formData.location} onChange={handleInputChange}
                  placeholder="Tỉnh/Thành phố"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 outline-none ${ringClass}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange}
                  placeholder="0912345678"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 outline-none ${ringClass}`} />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Link href={cfg.backHref}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center text-sm font-medium">
                Hủy
              </Link>
              <button type="submit" disabled={loading}
                className={`flex-2 flex-1 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors ${btnClass}`}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-loader-4-line animate-spin"></i> Đang đăng...
                  </span>
                ) : `Đăng ${cfg.label.toLowerCase()}`}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-sm mx-4 text-center shadow-xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-line text-green-600 text-3xl"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Đăng thành công!</h3>
            <p className="text-gray-500 text-sm">Đang chuyển hướng...</p>
          </div>
        </div>
      )}
    </div>
  );
}
