'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { realEstate, uploads, auth as _auth } from '../../../lib/api';
import GPSLocationPicker from '../../components/GPSLocationPicker';
import { Field, FormCard, FormError, FormShell, ImageField, Row, SavedOverlay, SubmitBar, useImages } from '../../components/form/Kit';

const typeOptions = [
  { value: 'NHA_O', label: 'Nhà ở' },
  { value: 'DAT_NEN', label: 'Đất nền' },
  { value: 'PHONG_TRO', label: 'Phòng trọ' },
  { value: 'MAT_BANG', label: 'Mặt bằng kinh doanh' },
];

const legalOptions = ['Sổ đỏ chính chủ', 'Sổ hồng', 'Giấy tờ hợp lệ', 'Hợp đồng mua bán', 'Đang làm sổ', 'Khác'];

export default function CreateRealEstatePage() {
  const router = useRouter();

  useEffect(() => {
    if (!_auth.isLoggedIn()) router.replace('/profile');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [form, setForm] = useState({ title: '', description: '', type: 'NHA_O', price: '', area: '', address: '', legalStatus: '' });
  const [gps, setGps] = useState<{ latitude: number | null; longitude: number | null }>({ latitude: null, longitude: null });
  const images = useImages(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [limitHit, setLimitHit] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLimitHit(false);
    if (images.files.length === 0) {
      setError('Vui lòng thêm ít nhất 1 ảnh');
      return;
    }
    setLoading(true);
    try {
      const uploaded = await uploads.uploadImages(images.files);
      const imageUrls = uploaded.map(u => u.url);

      const created: any = await realEstate.create({
        title: form.title,
        description: form.description,
        type: form.type,
        price: Number(form.price),
        area: Number(form.area),
        address: form.address,
        latitude: gps.latitude ?? undefined,
        longitude: gps.longitude ?? undefined,
        legalStatus: form.legalStatus || undefined,
      } as any);

      if (imageUrls.length > 0 && created.id) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/real-estates/${created.id}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
          body: JSON.stringify({ images: imageUrls.map(url => ({ url })) }),
        });
      }

      setSuccess(true);
      setTimeout(() => router.push('/real-estate'), 1800);
    } catch (err: any) {
      const status = err?.statusCode || err?.status;
      const msg = String(err?.message || '');
      if (status === 403 || /gioi han|giới hạn|limit/i.test(msg)) {
        setLimitHit(true);
        setError('Bạn đã đăng hết số tin của tháng này. Nâng cấp VIP để đăng thêm.');
      } else {
        setError(msg || 'Đăng tin thất bại. Vui lòng đăng nhập và thử lại.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormShell title="Đăng tin nhà đất" hint="Nhà ở, đất nền, phòng trọ, mặt bằng" backHref="/real-estate" wide>
      <FormCard onSubmit={handleSubmit}>
        <FormError message={error}>
          {limitHit && <Link href="/pricing" className="mt-1 block font-semibold underline">Xem các gói VIP</Link>}
        </FormError>

        <ImageField images={images} onError={setError} required />

        <Field label="Tiêu đề" required>
          <input type="text" name="title" required value={form.title} onChange={handleChange} placeholder="Ví dụ: Bán đất vườn 1000 m², mặt tiền đường xã" className="field" />
        </Field>

        <Row>
          <Field label="Loại bất động sản" required>
            <select name="type" value={form.type} onChange={handleChange} className="field">
              {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Giá (đồng)" required>
            <input type="number" name="price" required min="0" inputMode="numeric" value={form.price} onChange={handleChange} placeholder="Ví dụ: 500000000" className="field" />
          </Field>
        </Row>

        <Row>
          <Field label="Diện tích (m²)" required>
            <input type="number" name="area" required min="1" inputMode="numeric" value={form.area} onChange={handleChange} placeholder="Ví dụ: 500" className="field" />
          </Field>
          <Field label="Pháp lý">
            <select name="legalStatus" value={form.legalStatus} onChange={handleChange} className="field">
              <option value="">Chưa rõ</option>
              {legalOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
        </Row>

        <Field label="Địa chỉ" required>
          <input type="text" name="address" required value={form.address} onChange={handleChange} placeholder="Xã/phường, huyện/quận, tỉnh/thành" className="field" />
        </Field>

        <div>
          <p className="mb-1.5 text-sm font-semibold text-ink">Vị trí GPS <span className="font-normal text-ink-faint">tùy chọn</span></p>
          <GPSLocationPicker
            value={gps}
            onChange={setGps}
            label="Lấy vị trí GPS của khu đất, căn nhà"
            hint="Đứng tại khu đất hoặc căn nhà rồi bấm nút này để người mua tính được khoảng cách."
            onAddressDetected={addr => setForm(prev => ({ ...prev, address: prev.address || addr }))}
          />
        </div>

        <Field label="Mô tả chi tiết" required>
          <textarea name="description" required rows={5} maxLength={2000} value={form.description} onChange={handleChange} placeholder="Vị trí, hiện trạng, tiện ích xung quanh..." className="field resize-none" />
          <span className="mt-1 block text-right text-xs text-ink-faint">{form.description.length}/2000</span>
        </Field>

        <SubmitBar backHref="/real-estate" loading={loading} label="Đăng tin" busy="Đang đăng..." />
      </FormCard>

      {success && <SavedOverlay title="Đăng tin thành công" />}
    </FormShell>
  );
}
