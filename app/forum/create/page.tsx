'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forum, uploads } from '../../../lib/api';
import { auth as _auth } from '../../../lib/api';

const categoryOptions = [
  { value: 'NONG_NGHIEP', label: 'Nông nghiệp' },
  { value: 'CHAN_NUOI', label: 'Chăn nuôi' },
  { value: 'THI_TRUONG', label: 'Thị trường' },
  { value: 'KY_THUAT', label: 'Kỹ thuật' },
  { value: 'KINH_NGHIEM', label: 'Kinh nghiệm' },
  { value: 'KHAC', label: 'Khác' },
];

export default function CreatePostPage() {
  const router = useRouter();

  useEffect(() => {
    if (!_auth.isLoggedIn()) { router.replace('/profile'); }
  }, []);

  const [form, setForm] = useState({
    title: '', content: '', category: 'NONG_NGHIEP',
    tags: '', isAnonymous: false, scheduledAt: '',
  });
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [savedAsDraft, setSavedAsDraft] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 8) { alert('Tối đa 8 ảnh'); return; }
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
    e.target.value = '';
  }

  function removeImage(i: number) {
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent, publishStatus: 'PUBLISHED' | 'DRAFT' = 'PUBLISHED') {
    e.preventDefault();
    setError('');
    const isDraft = publishStatus === 'DRAFT';
    if (!isDraft && imageFiles.length === 0) {
      setError('Vui lòng thêm ít nhất 1 ảnh cho bài viết');
      return;
    }
    if (isDraft) setDraftLoading(true); else setLoading(true);
    try {
      const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        const uploaded = await uploads.uploadImages(imageFiles);
        imageUrls = uploaded.map(u => u.url);
      }
      await forum.create({
        title: form.title,
        content: form.content,
        category: form.category,
        tags,
        images: imageUrls,
        isAnonymous: form.isAnonymous,
        publishStatus,
        ...(form.scheduledAt && { scheduledAt: new Date(form.scheduledAt).toISOString() }),
      });
      if (isDraft) {
        setSavedAsDraft(true);
        setTimeout(() => router.push('/forum/drafts'), 1500);
      } else {
        setSuccess(true);
        setTimeout(() => router.push('/forum'), 2000);
      }
    } catch (e: any) {
      const status = e?.statusCode || e?.status;
      if (status === 403 || (e?.message && e.message.toLowerCase().includes('gioi han'))) {
        setError('Ban da dat gioi han dang bai thang nay. Nang cap VIP de dang them bai.');
      } else {
        setError(e.message || 'Thao tac that bai. Vui long xac thuc email truoc.');
      }
    } finally {
      setLoading(false);
      setDraftLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center gap-4">
          <Link href="/forum" className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">
            <i className="ri-arrow-left-line text-lg"></i>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Viết bài mới</h1>
            <p className="text-gray-500 text-sm">Chia sẻ kiến thức, kinh nghiệm với cộng đồng</p>
          </div>
          <div className="ml-auto">
            <Link href="/forum/drafts" className="text-sm text-purple-600 hover:underline flex items-center gap-1">
              <i className="ri-draft-line"></i> Bản nháp của tôi
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={(e) => handleSubmit(e, 'PUBLISHED')} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
            <input type="text" name="title" required value={form.title} onChange={handleChange}
              placeholder="Tiêu đề bài viết của bạn..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chủ đề *</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
              {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung *</label>
            <textarea name="content" required rows={10} value={form.content} onChange={handleChange}
              placeholder="Nội dung bài viết của bạn..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
              maxLength={5000} />
            <p className="text-xs text-gray-400 mt-1">{form.content.length}/5000</p>
          </div>

          {/* Upload ảnh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh đính kèm (tối đa 8 ảnh)</label>
            <div className="flex flex-wrap gap-2">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">
                    <i className="ri-close-line text-xs"></i>
                  </button>
                </div>
              ))}
              {imagePreviews.length < 8 && (
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                  <i className="ri-image-add-line text-2xl text-gray-400"></i>
                  <span className="text-xs text-gray-400 mt-1">Thêm ảnh</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (phân cách bằng dấu phẩy)</label>
            <input type="text" name="tags" value={form.tags} onChange={handleChange}
              placeholder="Ví dụ: lúa, phân bón, sâu bệnh"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <i className="ri-calendar-schedule-line mr-1"></i>
              Lên lịch đăng (tùy chọn)
            </label>
            <input type="datetime-local" name="scheduledAt" value={form.scheduledAt} onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            <p className="text-xs text-gray-400 mt-1">Để trống nếu muốn đăng ngay. Nếu chọn thời gian, bài sẽ lưu nháp cho đến lúc đó.</p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isAnonymous}
              onChange={e => setForm(prev => ({ ...prev, isAnonymous: e.target.checked }))} className="rounded" />
            <span className="text-sm text-gray-700">Đăng ẩn danh</span>
          </label>

          <div className="flex gap-3 pt-4 border-t">
            <Link href="/forum" className="px-5 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
              Hủy
            </Link>
            <button
              type="button"
              onClick={(e) => handleSubmit(e as any, 'DRAFT')}
              disabled={draftLoading || !form.title}
              className="px-5 py-3 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 disabled:opacity-50 text-sm flex items-center gap-2"
            >
              <i className="ri-save-line"></i>
              {draftLoading ? 'Đang lưu...' : 'Lưu nháp'}
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm">
              {loading ? 'Đang đăng...' : form.scheduledAt ? 'Lên lịch đăng' : 'Đăng bài'}
            </button>
          </div>
        </form>
      </div>

      {success && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-time-line text-amber-500 text-2xl"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Đã gửi thành công!</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-1">Bài viết đang <span className="font-semibold text-amber-600">chờ admin kiểm duyệt</span>.</p>
            <p className="text-gray-400 text-xs">Sau khi được duyệt, bài sẽ xuất hiện công khai.</p>
            <div className="mt-4 flex justify-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center"><i className="ri-check-line text-white text-xs"></i></div>
                <span className="text-[10px] text-green-600">Đã gửi</span>
              </div>
              <div className="flex-1 h-0.5 bg-amber-200 mt-3.5 max-w-[32px]"></div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center animate-pulse"><i className="ri-time-line text-white text-xs"></i></div>
                <span className="text-[10px] text-amber-600">Chờ duyệt</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200 mt-3.5 max-w-[32px]"></div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center"><i className="ri-global-line text-gray-400 text-xs"></i></div>
                <span className="text-[10px] text-gray-400">Công khai</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {savedAsDraft && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-sm mx-4 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-draft-line text-purple-600 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">Đã lưu nháp!</h3>
            <p className="text-gray-500 text-sm">Đang chuyển đến trang quản lý nháp...</p>
          </div>
        </div>
      )}
    </div>
  );
}
