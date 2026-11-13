'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { jobs } from '../../../../lib/api';
import { Field, FormError, FormShell, Row } from '../../../components/form/Kit';

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();

  // The API only lets an owner change these fields after posting
  const [form, setForm] = useState({ title: '', description: '', salary: '', location: '', isUrgent: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    jobs.getOne(id)
      .then((data: any) => {
        setForm({
          title: data.title || '',
          description: data.description || '',
          salary: data.salary || '',
          location: data.location || '',
          isUrgent: data.isUrgent || false,
        });
      })
      .catch(() => setError('Không tìm thấy tin hoặc bạn không có quyền chỉnh sửa'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const flash = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      await jobs.update(id, {
        title: form.title,
        description: form.description,
        salary: form.salary || undefined,
        location: form.location,
        isUrgent: form.isUrgent,
      });
      flash('Đã lưu thay đổi');
    } catch (e: any) {
      setError(e.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkUrgent() {
    setSaving(true); setError('');
    try {
      await jobs.markUrgent(id);
      setForm(prev => ({ ...prev, isUrgent: true }));
      flash('Đã đánh dấu tuyển gấp');
    } catch (e: any) {
      setError(e.message || 'Không đánh dấu được');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="grid min-h-[60vh] place-items-center"><div className="h-9 w-9 animate-spin rounded-full border-[3px] border-forest-600 border-t-transparent" /></div>;
  }

  return (
    <FormShell title="Chỉnh sửa tin việc làm" hint="Cập nhật thông tin tin đăng" backHref={`/jobs/${id}`} wide>
      <div className="space-y-4">
        <FormError message={error} />
        {success && <p role="status" className="flex items-center gap-2 rounded-lg border border-forest-200 bg-forest-50 p-3 text-sm text-forest-800"><i className="ri-check-line" aria-hidden="true" />{success}</p>}

        <section className="card flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
          <div>
            <h2 className="text-[15px] font-bold text-ink">Tuyển gấp</h2>
            <p className="text-sm text-ink-soft">{form.isUrgent ? 'Tin đang được đánh dấu gấp và ưu tiên hiển thị.' : 'Tin chưa được đánh dấu gấp.'}</p>
          </div>
          {form.isUrgent
            ? <span className="rounded bg-brand-500 px-2.5 py-1 text-xs font-bold text-white">Gấp</span>
            : <button type="button" onClick={handleMarkUrgent} disabled={saving} className="btn-ghost disabled:opacity-50">Đánh dấu tuyển gấp</button>}
        </section>

        <form onSubmit={handleSubmit} className="card space-y-5 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-ink">Thông tin tin đăng</h2>

          <Field label="Tiêu đề" required>
            <input type="text" name="title" required value={form.title} onChange={handleChange} className="field" />
          </Field>
          <Row>
            <Field label="Mức lương">
              <input type="text" name="salary" value={form.salary} onChange={handleChange} placeholder="300.000đ/ngày, thỏa thuận" className="field" />
            </Field>
            <Field label="Địa điểm" required>
              <input type="text" name="location" required value={form.location} onChange={handleChange} className="field" />
            </Field>
          </Row>
          <Field label="Mô tả" required>
            <textarea name="description" required rows={5} maxLength={2000} value={form.description} onChange={handleChange} className="field resize-none" />
            <span className="mt-1 block text-right text-xs text-ink-faint">{form.description.length}/2000</span>
          </Field>

          <div className="flex justify-end gap-3">
            <Link href={`/jobs/${id}`} className="btn-ghost">Xem tin</Link>
            <button type="submit" disabled={saving} className="btn-primary px-8 disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
          </div>
        </form>
      </div>
    </FormShell>
  );
}
