'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { realEstate, uploads } from '../../../../lib/api';
import { Field, FormError, FormShell, ImageField, Row, useImages } from '../../../components/form/Kit';

const typeOptions = [
  { value: 'NHA_O', label: 'Nhà ở' },
  { value: 'DAT_NEN', label: 'Đất nền' },
  { value: 'PHONG_TRO', label: 'Phòng trọ' },
  { value: 'MAT_BANG', label: 'Mặt bằng kinh doanh' },
];

const legalOptions = ['Sổ đỏ chính chủ', 'Sổ hồng', 'Giấy tờ hợp lệ', 'Hợp đồng mua bán', 'Đang làm sổ', 'Khác'];

const statusOptions = [
  { value: 'NEW', label: 'Mới đăng' },
  { value: 'TRADING', label: 'Đang giao dịch' },
  { value: 'COMPLETED', label: 'Đã hoàn tất' },
  { value: 'PAUSED', label: 'Tạm dừng' },
];

export default function EditRealEstatePage() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({ title: '', description: '', type: 'NHA_O', price: '', area: '', address: '', legalStatus: '' });
  const [status, setStatus] = useState('NEW');
  const [statusSaving, setStatusSaving] = useState(false);

  const [existing, setExisting] = useState<{ id?: string; url: string }[]>([]);
  const images = useImages(10);
  const [gallerySaving, setGallerySaving] = useState(false);

  useEffect(() => {
    realEstate.getOne(id)
      .then((data: any) => {
        setForm({
          title: data.title || '',
          description: data.description || '',
          type: data.type || 'NHA_O',
          price: String(data.price || ''),
          area: String(data.area || ''),
          address: data.address || '',
          legalStatus: data.legalStatus || '',
        });
        setStatus(data.status || 'NEW');
        setExisting(data.images || []);
      })
      .catch(() => setError('Không tìm thấy tin hoặc bạn không có quyền chỉnh sửa'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const flash = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess(''); setSaving(true);
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
      flash('Đã lưu thông tin');
    } catch (e: any) {
      setError(e.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(next: string) {
    setStatusSaving(true); setError('');
    try {
      await realEstate.updateStatus(id, next);
      setStatus(next);
      flash('Đã cập nhật trạng thái');
    } catch (e: any) {
      setError(e.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setStatusSaving(false);
    }
  }

  async function handleSaveGallery() {
    if (images.files.length === 0) return;
    setGallerySaving(true); setError('');
    try {
      const uploaded = await uploads.uploadImages(images.files);
      const urls = uploaded.map((u: any) => ({ url: u.url }));
      await realEstate.addImages(id, urls);
      setExisting(prev => [...prev, ...urls]);
      images.clear();
      flash('Đã thêm ảnh');
    } catch (e: any) {
      setError(e.message || 'Tải ảnh lên thất bại');
    } finally {
      setGallerySaving(false);
    }
  }

  if (loading) {
    return <div className="grid min-h-[60vh] place-items-center"><div className="h-9 w-9 animate-spin rounded-full border-[3px] border-forest-600 border-t-transparent" /></div>;
  }

  return (
    <FormShell title="Chỉnh sửa tin nhà đất" hint="Cập nhật thông tin, trạng thái và hình ảnh" backHref={`/real-estate/${id}`} wide>
      <div className="space-y-4">
        <FormError message={error} />
        {success && <p role="status" className="flex items-center gap-2 rounded-lg border border-forest-200 bg-forest-50 p-3 text-sm text-forest-800"><i className="ri-check-line" aria-hidden="true" />{success}</p>}

        <section className="card p-4 sm:p-6">
          <h2 className="text-lg font-bold text-ink">Trạng thái tin</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Trạng thái tin">
            {statusOptions.map(o => (
              <button key={o.value} type="button" role="radio" aria-checked={status === o.value} onClick={() => handleStatusChange(o.value)} disabled={statusSaving || status === o.value}
                className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors disabled:cursor-default ${status === o.value ? 'border-forest-600 bg-forest-50 text-forest-800' : 'border-line text-ink-soft hover:border-forest-400 disabled:opacity-50'}`}>
                {status === o.value && <i className="ri-check-line mr-1" aria-hidden="true" />}{o.label}
              </button>
            ))}
          </div>
        </section>

        <form onSubmit={handleSaveInfo} className="card space-y-5 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-ink">Thông tin tin đăng</h2>

          <Field label="Tiêu đề" required>
            <input type="text" name="title" required value={form.title} onChange={handleChange} className="field" />
          </Field>
          <Row>
            <Field label="Loại bất động sản" required>
              <select name="type" value={form.type} onChange={handleChange} className="field">
                {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Giá (đồng)" required>
              <input type="number" name="price" required min="0" inputMode="numeric" value={form.price} onChange={handleChange} className="field" />
            </Field>
          </Row>
          <Row>
            <Field label="Diện tích (m²)" required>
              <input type="number" name="area" required min="1" inputMode="numeric" value={form.area} onChange={handleChange} className="field" />
            </Field>
            <Field label="Pháp lý">
              <select name="legalStatus" value={form.legalStatus} onChange={handleChange} className="field">
                <option value="">Chưa rõ</option>
                {legalOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
          </Row>
          <Field label="Địa chỉ" required>
            <input type="text" name="address" required value={form.address} onChange={handleChange} className="field" />
          </Field>
          <Field label="Mô tả chi tiết" required>
            <textarea name="description" required rows={5} maxLength={2000} value={form.description} onChange={handleChange} className="field resize-none" />
            <span className="mt-1 block text-right text-xs text-ink-faint">{form.description.length}/2000</span>
          </Field>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary px-8 disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu thông tin'}</button>
          </div>
        </form>

        <section className="card space-y-4 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-ink">Hình ảnh <span className="text-sm font-normal text-ink-faint">({existing.length + images.files.length}/10)</span></h2>
          <ImageField images={images} existing={existing.map(i => i.url)} onError={setError} label="Ảnh của tin" />
          {images.files.length > 0 && (
            <div className="flex justify-end">
              <button type="button" onClick={handleSaveGallery} disabled={gallerySaving} className="btn-forest disabled:opacity-50">
                {gallerySaving ? <><i className="ri-loader-4-line animate-spin" aria-hidden="true" /> Đang tải lên...</> : <><i className="ri-upload-cloud-line" aria-hidden="true" /> Tải lên {images.files.length} ảnh</>}
              </button>
            </div>
          )}
        </section>

        <div className="flex justify-between">
          <Link href={`/real-estate/${id}`} className="btn-ghost">Xem tin</Link>
          <Link href="/real-estate" className="btn-ghost">Về danh sách</Link>
        </div>
      </div>
    </FormShell>
  );
}
