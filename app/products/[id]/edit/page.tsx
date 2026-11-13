'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { products as productsApi, uploads } from '../../../../lib/api';
import { Field, FormCard, FormError, FormShell, ImageField, Row, SubmitBar, useImages } from '../../../components/form/Kit';

const categories = [
  { value: 'NONG_SAN', label: 'Nông sản' },
  { value: 'VAT_NUOI', label: 'Vật nuôi' },
  { value: 'DO_DUNG_GIA_DINH', label: 'Đồ dùng gia đình' },
  { value: 'HANG_TIEU_DUNG', label: 'Hàng tiêu dùng' },
  { value: 'DICH_VU', label: 'Dịch vụ' },
];

export default function EditProductPage() {
  const router = useRouter();
  const id = useParams().id as string;

  const [form, setForm] = useState({ title: '', description: '', category: '', price: '', unit: '', quantity: '', location: '', contactPhone: '' });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const images = useImages(10);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      let newUrls: string[] = [];
      if (images.files.length > 0) {
        const uploaded = await uploads.uploadImages(images.files);
        newUrls = uploaded.map((u: any) => u.url);
      }
      await productsApi.update(id, {
        title: form.title,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        unit: form.unit,
        quantity: form.quantity !== '' ? Number(form.quantity) : undefined,
        location: form.location,
        contactPhone: form.contactPhone || undefined,
        images: [...existingImages, ...newUrls],
      });
      router.push(`/products/${id}`);
    } catch (err: any) {
      setError(err?.message || err?.error || 'Lưu thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="grid min-h-[60vh] place-items-center"><div className="h-9 w-9 animate-spin rounded-full border-[3px] border-forest-600 border-t-transparent" /></div>;
  }

  return (
    <FormShell title="Chỉnh sửa tin" hint="Cập nhật thông tin sản phẩm" backHref={`/products/${id}`}>
      <FormCard onSubmit={handleSubmit}>
        <FormError message={error} />

        <ImageField images={images} existing={existingImages} onRemoveExisting={i => setExistingImages(prev => prev.filter((_, x) => x !== i))} onError={setError} />

        <Field label="Tiêu đề" required>
          <input type="text" name="title" required value={form.title} onChange={handleChange} className="field" />
        </Field>

        <Row>
          <Field label="Danh mục" required>
            <select name="category" required value={form.category} onChange={handleChange} className="field">
              <option value="">Chọn danh mục</option>
              {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Giá bán" required>
            <div className="flex gap-2">
              <input type="number" name="price" required min="0" inputMode="numeric" value={form.price} onChange={handleChange} className="field flex-1" />
              <input type="text" name="unit" required value={form.unit} onChange={handleChange} placeholder="kg, con..." className="field !w-24" />
            </div>
          </Field>
        </Row>

        <Field label="Số lượng" hint="để trống nếu không giới hạn">
          <input type="number" name="quantity" min="0" inputMode="numeric" value={form.quantity} onChange={handleChange} className="field" />
        </Field>

        <Field label="Mô tả" required>
          <textarea name="description" required rows={5} maxLength={1000} value={form.description} onChange={handleChange} className="field resize-none" />
          <span className="mt-1 block text-right text-xs text-ink-faint">{form.description.length}/1000</span>
        </Field>

        <Row>
          <Field label="Địa điểm" required>
            <input type="text" name="location" required value={form.location} onChange={handleChange} className="field" />
          </Field>
          <Field label="Số điện thoại">
            <input type="tel" name="contactPhone" value={form.contactPhone} onChange={handleChange} className="field" />
          </Field>
        </Row>

        <SubmitBar backHref={`/products/${id}`} loading={saving} label="Lưu thay đổi" />
      </FormCard>
    </FormShell>
  );
}
