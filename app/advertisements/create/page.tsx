'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { advertisements, uploads, auth as _auth } from '../../../lib/api';
import { Field, FormCard, FormError, FormShell, ImageField, Row, SavedOverlay, SubmitBar, useImages } from '../../components/form/Kit';

const CATEGORIES = [
  { value: 'KHAI_TRUONG', label: 'Khai trương' },
  { value: 'KHUYEN_MAI', label: 'Khuyến mãi' },
  { value: 'SAN_PHAM_MOI', label: 'Sản phẩm mới' },
  { value: 'DICH_VU', label: 'Dịch vụ' },
  { value: 'SU_KIEN', label: 'Sự kiện' },
  { value: 'KHAC', label: 'Khác' },
];

export default function CreateAdvertisementPage() {
  const router = useRouter();

  useEffect(() => {
    if (!_auth.isLoggedIn()) router.replace('/profile');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [form, setForm] = useState({
    title: '', category: 'KHAI_TRUONG', description: '', businessName: '', location: '',
    contactName: '', contactPhone: '', startDate: '', endDate: '',
  });
  const images = useImages(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (images.files.length === 0) {
      setError('Vui lòng thêm ít nhất 1 ảnh quảng cáo');
      return;
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      setError('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }
    setLoading(true);
    try {
      const uploaded = await uploads.uploadImages(images.files);
      await advertisements.create({
        title: form.title,
        category: form.category,
        description: form.description,
        businessName: form.businessName || undefined,
        images: uploaded.map(u => u.url),
        location: form.location || undefined,
        contactName: form.contactName || undefined,
        contactPhone: form.contactPhone || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      });
      setSuccess(true);
      setTimeout(() => router.push('/advertisements'), 1800);
    } catch (err: any) {
      setError(err.message || 'Đăng thất bại. Vui lòng đăng nhập và thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormShell title="Đăng quảng cáo" hint="Khai trương, khuyến mãi, sự kiện" backHref="/advertisements" wide>
      <FormCard onSubmit={handleSubmit}>
        <FormError message={error} />

        <ImageField images={images} onError={setError} required />

        <Row>
          <Field label="Tiêu đề" required>
            <input type="text" name="title" required value={form.title} onChange={handleChange} placeholder="Ví dụ: Khai trương tạp hóa Minh Phát" className="field" />
          </Field>
          <Field label="Loại quảng cáo" required>
            <select name="category" value={form.category} onChange={handleChange} className="field">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
        </Row>

        <Field label="Tên cửa hàng, doanh nghiệp">
          <input type="text" name="businessName" value={form.businessName} onChange={handleChange} placeholder="Ví dụ: Tạp hóa Minh Phát" className="field" />
        </Field>

        <Field label="Nội dung quảng cáo" required>
          <textarea name="description" required rows={5} maxLength={2000} value={form.description} onChange={handleChange} placeholder="Chương trình, ưu đãi, sự kiện..." className="field resize-none" />
          <span className="mt-1 block text-right text-xs text-ink-faint">{form.description.length}/2000</span>
        </Field>

        <Row>
          <Field label="Ngày bắt đầu"><input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="field" /></Field>
          <Field label="Ngày kết thúc"><input type="date" name="endDate" value={form.endDate} min={form.startDate || undefined} onChange={handleChange} className="field" /></Field>
        </Row>

        <Row>
          <Field label="Địa điểm"><input type="text" name="location" value={form.location} onChange={handleChange} placeholder="Địa chỉ cửa hàng hoặc nơi tổ chức" className="field" /></Field>
          <Field label="Người liên hệ"><input type="text" name="contactName" value={form.contactName} onChange={handleChange} placeholder="Họ tên" className="field" /></Field>
        </Row>

        <Field label="Số điện thoại liên hệ">
          <input type="tel" name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="0912345678" className="field" />
        </Field>

        <SubmitBar backHref="/advertisements" loading={loading} label="Đăng quảng cáo" busy="Đang đăng..." />
      </FormCard>

      {success && <SavedOverlay title="Đăng thành công" />}
    </FormShell>
  );
}
