'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { realEstate, uploads } from '../../../../lib/api';

const typeOptions = [
  { value: 'NHA_O', label: 'Nhà ở' },
  { value: 'DAT_NEN', label: 'Đất nền' },
  { value: 'PHONG_TRO', label: 'Phòng trọ' },
  { value: 'MAT_BANG', label: 'Mặt bằng kinh doanh' },
];

const legalOptions = [
  'Sổ đỏ chính chủ', 'Sổ hồng', 'Giấy tờ hợp lệ', 'Hợp đồng mua bán', 'Đang làm sổ', 'Khác',
];

const statusOptions = [
  { value: 'NEW', label: 'Mới đăng', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'TRADING', label: 'Đang giao dịch', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'COMPLETED', label: 'Đã hoàn tất', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'PAUSED', label: 'Tạm dừng', color: 'bg-gray-100 text-gray-600 border-gray-300' },
];

export default function EditRealEstatePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    title: '', description: '', type: 'NHA_O',
    price: '', area: '', address: '', legalStatus: '',
  });
  const [status, setStatus] = useState('NEW');
  const [statusSaving, setStatusSaving] = useState(false);

  // Gallery state
  const [images, setImages] = useState<{ id?: string; url: string; caption?: string; order?: number }[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [gallerySaving, setGallerySaving] = useState(false);

  useEffect(() => {
    realEstate.getOne(id)
      .then((data: any) => {
        setForm({
          title: data.title || '',
          description: data.description || '',
          type: data.type || 'HOUSE',
          price: String(data.price || ''),
          area: String(data.area || ''),
          address: data.address || '',
          legalStatus: data.legalStatus || '',
        });
        setStatus(data.status || 'NEW');
        setImages(data.images || []);
      })
      .catch(() => setError('Không tìm thấy tin hoặc bạn không có quyền chỉnh sửa'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await realEstate.update(id, {
        title: form.title,
        description: form.description,
        type: form.type,
        price: Number(form.price),
        area: Number(form.area),
        address: form.address,
        legalStatus: form.legalStatus || undefined,
      });
      setSuccess('Đã lưu thông tin thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    setStatusSaving(true);
    setError('');
    try {
      await realEstate.updateStatus(id, newStatus);
      setStatus(newStatus);
      setSuccess('Đã cập nhật trạng thái!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setStatusSaving(false);
    }
  }

  function handleNewImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const total = images.length + newImageFiles.length + files.length;
    if (total > 10) { setError('Tổng số ảnh không được vượt quá 10'); return; }
    setNewImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setNewImagePreviews(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  }

  function removeNewImage(i: number) {
    setNewImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setNewImagePreviews(prev => prev.filter((_, idx) => idx !== i));
  }

  async function handleSaveGallery() {
    if (newImageFiles.length === 0) return;
    setGallerySaving(true);
    setError('');
    try {
      const uploaded = await uploads.uploadImages(newImageFiles);
      const newUrls = uploaded.map((u: any) => ({ url: u.url }));
      await realEstate.addImages(id, newUrls);
      setImages(prev => [...prev, ...newUrls]);
      setNewImageFiles([]);
      setNewImagePreviews([]);
      setSuccess('Đã thêm ảnh thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message || 'Upload ảnh thất bại');
    } finally {
      setGallerySaving(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const currentStatus = statusOptions.find(s => s.value === status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <Link href={`/real-estate/${id}`}
            className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">
            <i className="ri-arrow-left-line text-lg"></i>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa tin bất động sản</h1>
            <p className="text-gray-500 text-sm">Cập nhật thông tin, trạng thái và hình ảnh</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
            <i className="ri-check-circle-line"></i>{success}
          </div>
        )}

        {/* ===== TRẠNG THÁI ===== */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i className="ri-git-branch-line text-green-600"></i>
            Trạng thái tin đăng
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Trạng thái hiện tại:{' '}
            <span className={`inline-block px-2 py-0.5 rounded border text-xs font-medium ${currentStatus?.color}`}>
              {currentStatus?.label}
            </span>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statusOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value)}
                disabled={statusSaving || status === opt.value}
                className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                  status === opt.value
                    ? `${opt.color} border-current`
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                } disabled:opacity-50`}
              >
                {status === opt.value && <i className="ri-check-line mr-1"></i>}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== THÔNG TIN ===== */}
        <form onSubmit={handleSaveInfo} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <i className="ri-file-edit-line text-green-600"></i>
            Thông tin tin đăng
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
            <input type="text" name="title" required value={form.title} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
          </div>

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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Diện tích (m²) *</label>
              <input type="number" name="area" required min="1" value={form.area} onChange={handleChange}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ *</label>
            <input type="text" name="address" required value={form.address} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết *</label>
            <textarea name="description" required rows={5} value={form.description} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
              maxLength={2000} />
            <p className="text-xs text-gray-400 mt-1">{form.description.length}/2000</p>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button type="submit" disabled={saving}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium">
              {saving ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </div>
        </form>

        {/* ===== GALLERY ===== */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i className="ri-image-line text-green-600"></i>
            Quản lý hình ảnh
            <span className="text-sm font-normal text-gray-400">({images.length + newImageFiles.length}/10 ảnh)</span>
          </h2>

          {/* Ảnh hiện có */}
          {images.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Ảnh hiện tại</p>
              <div className="flex flex-wrap gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative w-24 h-24 group">
                    <img src={img.url} className="w-full h-full object-cover rounded-lg border" alt="" />
                    {i === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-xs text-center py-0.5 rounded-b-lg">
                        Ảnh bìa
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thêm ảnh mới */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Thêm ảnh mới</p>
            <div className="flex flex-wrap gap-3">
              {newImagePreviews.map((src, i) => (
                <div key={i} className="relative w-24 h-24">
                  <img src={src} className="w-full h-full object-cover rounded-lg border-2 border-dashed border-green-400" alt="" />
                  <button type="button" onClick={() => removeNewImage(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                    ×
                  </button>
                </div>
              ))}
              {images.length + newImageFiles.length < 10 && (
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-400">
                  <i className="ri-image-add-line text-2xl text-gray-400"></i>
                  <span className="text-xs text-gray-400 mt-1">Thêm ảnh</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleNewImages} />
                </label>
              )}
            </div>
          </div>

          {newImageFiles.length > 0 && (
            <div className="flex justify-end mt-4 pt-4 border-t">
              <button onClick={handleSaveGallery} disabled={gallerySaving}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium flex items-center gap-2">
                {gallerySaving ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang upload...</>
                ) : (
                  <><i className="ri-upload-cloud-line"></i> Upload {newImageFiles.length} ảnh</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between pb-8">
          <Link href={`/real-estate/${id}`}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            Xem tin đăng
          </Link>
          <Link href="/real-estate"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            Về danh sách
          </Link>
        </div>
      </div>
    </div>
  );
}
