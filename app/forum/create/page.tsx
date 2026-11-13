'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forum, uploads, auth as _auth } from '../../../lib/api';
import { FORUM_TOPICS } from '../categories';
import { Field, FormCard, FormError, FormShell, ImageField, SavedOverlay, useImages } from '../../components/form/Kit';

export default function CreatePostPage() {
  const router = useRouter();

  useEffect(() => {
    if (!_auth.isLoggedIn()) router.replace('/profile');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [form, setForm] = useState({ title: '', content: '', category: 'NONG_NGHIEP', tags: '', isAnonymous: false, scheduledAt: '' });
  const images = useImages(8);
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [error, setError] = useState('');
  const [limitHit, setLimitHit] = useState(false);
  const [done, setDone] = useState<'' | 'sent' | 'draft'>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  async function submit(publishStatus: 'PUBLISHED' | 'DRAFT') {
    setError('');
    setLimitHit(false);
    const isDraft = publishStatus === 'DRAFT';
    if (!isDraft && images.files.length === 0) {
      setError('Vui lòng thêm ít nhất 1 ảnh cho bài viết');
      return;
    }
    if (isDraft) setDraftLoading(true); else setLoading(true);
    try {
      const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      let imageUrls: string[] = [];
      if (images.files.length > 0) {
        const uploaded = await uploads.uploadImages(images.files);
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
        setDone('draft');
        setTimeout(() => router.push('/forum/drafts'), 1500);
      } else {
        setDone('sent');
        setTimeout(() => router.push('/forum'), 2200);
      }
    } catch (err: any) {
      const status = err?.statusCode || err?.status;
      const msg = String(err?.message || '');
      if (status === 403 || /gioi han|giới hạn|limit/i.test(msg)) {
        setLimitHit(true);
        setError('Bạn đã đăng hết số bài của tháng này. Nâng cấp VIP để đăng thêm.');
      } else {
        setError(msg || 'Không thực hiện được. Hãy xác thực email rồi thử lại.');
      }
    } finally {
      setLoading(false);
      setDraftLoading(false);
    }
  }

  return (
    <FormShell title="Viết bài mới" hint="Chia sẻ kinh nghiệm với cộng đồng" backHref="/forum" wide>
      <p className="-mt-1 mb-3 text-right text-sm">
        <Link href="/forum/drafts" className="font-semibold text-forest-700 hover:underline"><i className="ri-draft-line" aria-hidden="true" /> Bản nháp của tôi</Link>
      </p>

      <FormCard onSubmit={e => { e.preventDefault(); submit('PUBLISHED'); }}>
        <FormError message={error}>
          {limitHit && <Link href="/pricing" className="mt-1 block font-semibold underline">Xem các gói VIP</Link>}
        </FormError>

        <Field label="Tiêu đề" required>
          <input type="text" name="title" required value={form.title} onChange={handleChange} placeholder="Câu hỏi hoặc chủ đề của bạn" className="field" />
        </Field>

        <Field label="Chủ đề" required>
          <select name="category" value={form.category} onChange={handleChange} className="field">
            {FORUM_TOPICS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>

        <Field label="Nội dung" required>
          <textarea name="content" required rows={10} maxLength={5000} value={form.content} onChange={handleChange} placeholder="Viết chi tiết để mọi người dễ góp ý..." className="field resize-none" />
          <span className="mt-1 block text-right text-xs text-ink-faint">{form.content.length}/5000</span>
        </Field>

        <ImageField images={images} onError={setError} required label="Ảnh đính kèm" />

        <Field label="Từ khóa" hint="cách nhau bằng dấu phẩy">
          <input type="text" name="tags" value={form.tags} onChange={handleChange} placeholder="Ví dụ: cà phê, phân bón, sâu bệnh" className="field" />
        </Field>

        <Field label="Hẹn giờ đăng" hint="tùy chọn, để trống nếu đăng ngay">
          <input type="datetime-local" name="scheduledAt" value={form.scheduledAt} onChange={handleChange} min={new Date().toISOString().slice(0, 16)} className="field" />
        </Field>

        <label className="flex cursor-pointer items-center gap-2.5">
          <input type="checkbox" checked={form.isAnonymous} onChange={e => setForm(prev => ({ ...prev, isAnonymous: e.target.checked }))} className="h-4 w-4 rounded accent-forest-600" />
          <span className="text-sm text-ink">Đăng ẩn danh</span>
        </label>

        <div className="sticky bottom-[4.5rem] z-20 -mx-4 -mb-4 flex gap-3 border-t border-line bg-surface/95 px-4 py-3 sm:static sm:m-0 sm:border-0 sm:bg-transparent sm:p-0 sm:pt-2">
          <Link href="/forum" className="btn-ghost hidden sm:inline-flex sm:px-6">Hủy</Link>
          <button type="button" onClick={() => submit('DRAFT')} disabled={draftLoading || !form.title} className="btn-ghost flex-1 disabled:opacity-50 sm:flex-none sm:px-6">
            <i className="ri-save-line" aria-hidden="true" /> {draftLoading ? 'Đang lưu...' : 'Lưu nháp'}
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-[2] disabled:opacity-50">
            {loading ? <><i className="ri-loader-4-line animate-spin" aria-hidden="true" /> Đang đăng...</> : form.scheduledAt ? 'Hẹn giờ đăng' : 'Đăng bài'}
          </button>
        </div>
      </FormCard>

      {done === 'sent' && <SavedOverlay title="Đã gửi bài" note="Bài viết đang chờ kiểm duyệt, sau khi duyệt sẽ hiển thị công khai." />}
      {done === 'draft' && <SavedOverlay title="Đã lưu nháp" note="Đang chuyển đến bản nháp của bạn..." />}
    </FormShell>
  );
}
