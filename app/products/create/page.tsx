'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { products as productsApi, uploads, users as usersApi, auth as _auth } from '../../../lib/api';
import GPSLocationPicker from '../../components/GPSLocationPicker';
import { Field, FormCard, FormError, FormShell, ImageField, Row, SavedOverlay, SubmitBar, useImages } from '../../components/form/Kit';

const CATEGORY_CONFIG: Record<string, { label: string; backHref: string }> = {
  NONG_SAN: { label: 'Nông sản', backHref: '/products' },
  VAT_NUOI: { label: 'Vật nuôi', backHref: '/vat-nuoi' },
  DICH_VU: { label: 'Dịch vụ', backHref: '/dich-vu' },
  DO_DUNG_GIA_DINH: { label: 'Đồ dùng gia đình', backHref: '/products' },
  HANG_TIEU_DUNG: { label: 'Hàng tiêu dùng', backHref: '/products' },
};

// Shown only when the category is not fixed by the page the user came from
const categories = [
  { id: 'NONG_SAN', name: 'Nông sản' },
  { id: 'DO_DUNG_GIA_DINH', name: 'Đồ dùng gia đình' },
  { id: 'HANG_TIEU_DUNG', name: 'Hàng tiêu dùng' },
];

const VAT_NUOI_SUBS = ['Chó', 'Mèo', 'Gia cầm', 'Gia súc', 'Cá cảnh', 'Khác'];
const DICH_VU_SUBS = ['Sửa chữa', 'Vận chuyển', 'Tư vấn', 'Xây dựng', 'Giặt ủi', 'Vệ sinh', 'Khác'];

export default function CreateProductPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <CreateProductContent />
    </Suspense>
  );
}

function CreateProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initCategory = searchParams.get('category') || '';

  useEffect(() => {
    if (!_auth.isLoggedIn()) router.replace('/profile');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [formData, setFormData] = useState({
    title: '', category: initCategory, subCategory: '', price: '', unit: '',
    description: '', location: '', contactPhone: '', quantity: '',
  });
  const [gps, setGps] = useState<{ latitude: number | null; longitude: number | null }>({ latitude: null, longitude: null });
  const images = useImages(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [limitHit, setLimitHit] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [monthlyUsage, setMonthlyUsage] = useState<{ used: number; limit: number; isVip: boolean; remaining: number } | null>(null);

  useEffect(() => {
    if (_auth.isLoggedIn()) usersApi.getMonthlyUsage().then(setMonthlyUsage).catch(() => {});
  }, []);

  const cfg = CATEGORY_CONFIG[formData.category] || CATEGORY_CONFIG['NONG_SAN'];

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

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
      const imageUrls = uploaded.map((u: any) => u.url);
      const descWithSub = formData.subCategory ? `#${formData.subCategory}\n${formData.description}` : formData.description;

      await productsApi.create({
        title: formData.title,
        category: formData.category as any,
        price: Number(formData.price),
        unit: formData.unit,
        description: descWithSub,
        location: formData.location,
        latitude: gps.latitude ?? undefined,
        longitude: gps.longitude ?? undefined,
        contactPhone: formData.contactPhone || undefined,
        quantity: formData.quantity ? Number(formData.quantity) : undefined,
        images: imageUrls,
      });

      setShowSuccess(true);
      setTimeout(() => router.push(cfg.backHref), 1800);
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

  const subs = initCategory === 'VAT_NUOI' ? VAT_NUOI_SUBS : initCategory === 'DICH_VU' ? DICH_VU_SUBS : null;

  return (
    <FormShell title={`Đăng ${cfg.label.toLowerCase()}`} hint="Điền đủ thông tin để người mua tin tưởng hơn" backHref={cfg.backHref}>
      {monthlyUsage && (
        <p className={`mb-3 flex flex-wrap items-center justify-between gap-2 rounded-card border p-3 text-sm ${monthlyUsage.remaining === 0 ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-line bg-surface text-ink-soft'}`}>
          <span>
            {monthlyUsage.isVip ? 'Gói VIP' : 'Gói miễn phí'}: tháng này đã đăng <b className="text-ink">{monthlyUsage.used}</b>/{monthlyUsage.limit === 999 ? 'không giới hạn' : monthlyUsage.limit} tin
            {monthlyUsage.remaining === 0 && ', đã hết lượt đăng'}
          </span>
          {!monthlyUsage.isVip && <Link href="/pricing" className="font-semibold text-forest-700 underline">Nâng cấp VIP</Link>}
        </p>
      )}

      <FormCard onSubmit={handleSubmit}>
        <FormError message={error}>
          {limitHit && <Link href="/pricing" className="mt-1 block font-semibold underline">Xem các gói VIP</Link>}
        </FormError>

        <ImageField images={images} onError={setError} required />

        <Field label="Tiêu đề" required>
          <input type="text" name="title" required value={formData.title} onChange={handleInputChange} placeholder={`Tên ${cfg.label.toLowerCase()} bạn muốn bán`} className="field" />
        </Field>

        <Row>
          {subs ? (
            <Field label={initCategory === 'VAT_NUOI' ? 'Loại vật nuôi' : 'Loại dịch vụ'} required>
              <select name="subCategory" required value={formData.subCategory} onChange={handleInputChange} className="field">
                <option value="">Chọn loại</option>
                {subs.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          ) : (
            <Field label="Danh mục" required>
              <select name="category" required value={formData.category} onChange={handleInputChange} className="field">
                <option value="">Chọn danh mục</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          )}
          <Field label="Giá bán" required>
            <div className="flex gap-2">
              <input type="number" name="price" required min="0" inputMode="numeric" value={formData.price} onChange={handleInputChange} placeholder="0" className="field flex-1" />
              <input type="text" name="unit" required value={formData.unit} onChange={handleInputChange} placeholder="kg, con..." className="field !w-24" />
            </div>
          </Field>
        </Row>

        <Field label="Số lượng" hint="để trống nếu không giới hạn">
          <input type="number" name="quantity" min="0" inputMode="numeric" value={formData.quantity} onChange={handleInputChange} placeholder="Ví dụ: 100" className="field" />
        </Field>

        <Field label="Mô tả" required>
          <textarea name="description" required rows={5} maxLength={1000} value={formData.description} onChange={handleInputChange} placeholder="Chất lượng, nguồn gốc, cách giao hàng..." className="field resize-none" />
          <span className="mt-1 block text-right text-xs text-ink-faint">{formData.description.length}/1000</span>
        </Field>

        <Row>
          <Field label="Địa điểm" required>
            <input type="text" name="location" required value={formData.location} onChange={handleInputChange} placeholder="Xã, huyện, tỉnh" className="field" />
          </Field>
          <Field label="Số điện thoại">
            <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} placeholder="0912345678" className="field" />
          </Field>
        </Row>

        <div>
          <p className="mb-1.5 text-sm font-semibold text-ink">Vị trí GPS <span className="font-normal text-ink-faint">tùy chọn</span></p>
          <GPSLocationPicker
            value={gps}
            onChange={setGps}
            label="Lấy vị trí hiện tại của tôi"
            onAddressDetected={addr => setFormData(prev => ({ ...prev, location: prev.location || addr }))}
          />
        </div>

        <SubmitBar backHref={cfg.backHref} loading={loading} label={`Đăng ${cfg.label.toLowerCase()}`} busy="Đang đăng..." />
      </FormCard>

      {showSuccess && <SavedOverlay />}
    </FormShell>
  );
}
