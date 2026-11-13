'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { forum } from '../../../../lib/api';
import { FORUM_LEGACY_CATEGORIES, FORUM_TOPICS } from '../../categories';
import { Field, FormCard, FormError, FormShell, SubmitBar } from '../../../components/form/Kit';

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState({ title: '', content: '', category: 'NONG_NGHIEP', tags: '', isAnonymous: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    forum.getOne(id)
      .then((data: any) => {
        setForm({
          title: data.title || '',
          content: data.content || '',
          category: data.category || 'NONG_NGHIEP',
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
          isAnonymous: data.isAnonymous || false,
        });
      })
      .catch(() => setError('Không tìm thấy bài viết hoặc bạn không có quyền chỉnh sửa'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      await forum.updatePost(id, { title: form.title, content: form.content, category: form.category, tags, isAnonymous: form.isAnonymous });
      setSuccess('Đã lưu, đang chuyển về bài viết...');
      setTimeout(() => router.push(`/forum/${id}`), 1200);
    } catch (e: any) {
      setError(e.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="grid min-h-[60vh] place-items-center"><div className="h-9 w-9 animate-spin rounded-full border-[3px] border-forest-600 border-t-transparent" /></div>;
  }

  // Keep a legacy category selectable only when the post already uses it
  const options = [...FORUM_TOPICS, ...FORUM_LEGACY_CATEGORIES.filter(c => c.value === form.category)];

  return (
    <FormShell title="Chỉnh sửa bài viết" hint="Cập nhật nội dung bài đăng" backHref={`/forum/${id}`} wide>
      <FormCard onSubmit={handleSubmit}>
        <FormError message={error} />
        {success && <p role="status" className="flex items-center gap-2 rounded-lg border border-forest-200 bg-forest-50 p-3 text-sm text-forest-800"><i className="ri-check-line" aria-hidden="true" />{success}</p>}

        <Field label="Tiêu đề" required>
          <input type="text" name="title" required value={form.title} onChange={handleChange} className="field" />
        </Field>
        <Field label="Chủ đề">
          <select name="category" value={form.category} onChange={handleChange} className="field">
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Nội dung" required>
          <textarea name="content" required rows={10} maxLength={5000} value={form.content} onChange={handleChange} className="field resize-none" />
          <span className="mt-1 block text-right text-xs text-ink-faint">{form.content.length}/5000</span>
        </Field>
        <Field label="Từ khóa" hint="cách nhau bằng dấu phẩy">
          <input type="text" name="tags" value={form.tags} onChange={handleChange} placeholder="cà phê, thu hoạch, kinh nghiệm" className="field" />
        </Field>
        <label className="flex cursor-pointer items-center gap-2.5">
          <input type="checkbox" checked={form.isAnonymous} onChange={e => setForm(prev => ({ ...prev, isAnonymous: e.target.checked }))} className="h-4 w-4 rounded accent-forest-600" />
          <span className="text-sm text-ink">Đăng ẩn danh</span>
        </label>
        <SubmitBar backHref={`/forum/${id}`} loading={saving} label="Lưu thay đổi" />
      </FormCard>
    </FormShell>
  );
}
