'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { jobs, uploads, auth as _auth } from '../../../lib/api';
import GPSLocationPicker from '../../components/GPSLocationPicker';
import { Field, FormCard, FormError, FormShell, ImageField, Row, SavedOverlay, SubmitBar, useImages } from '../../components/form/Kit';

const typeOptions = [
  { value: 'EMPLOYER', label: 'Tuyển dụng', note: 'Bạn cần tuyển người', icon: 'ri-building-2-line' },
  { value: 'JOB_SEEKER', label: 'Tìm việc', note: 'Bạn đang tìm việc', icon: 'ri-user-search-line' },
];

const categoryOptions = ['Nông nghiệp', 'Chăn nuôi', 'Xây dựng', 'Vận tải', 'Buôn bán', 'Giáo dục', 'Y tế', 'Khác'];

export default function CreateJobPage() {
  const router = useRouter();

  useEffect(() => {
    if (!_auth.isLoggedIn()) router.replace('/profile');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [form, setForm] = useState({
    title: '', description: '', type: 'EMPLOYER', category: '', salary: '', location: '',
    experience: '', benefits: '', deadline: '', isUrgent: false,
  });
  const [gps, setGps] = useState<{ latitude: number | null; longitude: number | null }>({ latitude: null, longitude: null });
  const images = useImages(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [limitHit, setLimitHit] = useState(false);
  const [success, setSuccess] = useState(false);

  const isEmployer = form.type === 'EMPLOYER';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

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
      await jobs.create({
        title: form.title,
        description: form.description,
        type: form.type,
        category: form.category,
        salary: form.salary || undefined,
        location: form.location,
        latitude: gps.latitude ?? undefined,
        longitude: gps.longitude ?? undefined,
        experience: form.experience || undefined,
        benefits: form.benefits || undefined,
        deadline: form.deadline ? new Date(form.deadline) : undefined,
        isUrgent: form.isUrgent,
        images: uploaded.map(u => u.url),
      });
      setSuccess(true);
      setTimeout(() => router.push('/jobs'), 1800);
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
    <FormShell title="Đăng tin việc làm" hint="Tìm nhân lực hoặc tìm việc gần nhà" backHref="/jobs" wide>
      <div className="mb-4 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Loại tin">
        {typeOptions.map(o => (
          <button key={o.value} type="button" role="radio" aria-checked={form.type === o.value} onClick={() => setForm(prev => ({ ...prev, type: o.value }))}
            className={`flex flex-col items-center gap-1 rounded-card border-2 p-4 transition-colors ${form.type === o.value ? 'border-forest-600 bg-forest-50 text-forest-800' : 'border-line bg-surface text-ink-soft hover:border-forest-400'}`}>
            <i className={`${o.icon} text-2xl`} aria-hidden="true" />
            <span className="font-bold">{o.label}</span>
            <span className="text-xs">{o.note}</span>
          </button>
        ))}
      </div>

      <FormCard onSubmit={handleSubmit}>
        <FormError message={error}>
          {limitHit && <Link href="/pricing" className="mt-1 block font-semibold underline">Xem các gói VIP</Link>}
        </FormError>

        <Field label="Tiêu đề" required>
          <input type="text" name="title" required value={form.title} onChange={handleChange}
            placeholder={isEmployer ? 'Ví dụ: Cần 10 thợ hái cà phê mùa vụ' : 'Ví dụ: Tìm việc làm vườn tại Nhân Cơ'} className="field" />
        </Field>

        <Row>
          <Field label="Ngành nghề" required>
            <select name="category" required value={form.category} onChange={handleChange} className="field">
              <option value="">Chọn ngành nghề</option>
              {categoryOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Địa điểm" required>
            <input type="text" name="location" required value={form.location} onChange={handleChange} placeholder="Xã, huyện, tỉnh" className="field" />
          </Field>
        </Row>

        <div>
          <p className="mb-1.5 text-sm font-semibold text-ink">Vị trí GPS <span className="font-normal text-ink-faint">tùy chọn</span></p>
          <GPSLocationPicker
            value={gps}
            onChange={setGps}
            label="Lấy vị trí GPS của nơi làm việc"
            hint="Đứng tại nơi làm việc rồi bấm để người tìm việc thấy tin gần nhà."
            onAddressDetected={addr => setForm(prev => ({ ...prev, location: prev.location || addr }))}
          />
        </div>

        <Row>
          <Field label={isEmployer ? 'Mức lương' : 'Mức lương mong muốn'}>
            <input type="text" name="salary" value={form.salary} onChange={handleChange}
              placeholder={isEmployer ? 'Ví dụ: 300.000đ/ngày, thỏa thuận' : 'Ví dụ: 5-7 triệu/tháng'} className="field" />
          </Field>
          <Field label={isEmployer ? 'Kinh nghiệm yêu cầu' : 'Kinh nghiệm của bạn'}>
            <input type="text" name="experience" value={form.experience} onChange={handleChange}
              placeholder={isEmployer ? 'Ví dụ: Không yêu cầu, 1-2 năm' : 'Ví dụ: 2 năm làm nông'} className="field" />
          </Field>
        </Row>

        {isEmployer && (
          <Field label="Hạn nộp hồ sơ">
            <input type="date" name="deadline" value={form.deadline} onChange={handleChange} className="field" />
          </Field>
        )}

        <Field label={isEmployer ? 'Mô tả công việc' : 'Giới thiệu bản thân'} required>
          <textarea name="description" required rows={5} maxLength={2000} value={form.description} onChange={handleChange}
            placeholder={isEmployer ? 'Công việc, yêu cầu, giờ làm...' : 'Kỹ năng và công việc bạn mong muốn...'} className="field resize-none" />
          <span className="mt-1 block text-right text-xs text-ink-faint">{form.description.length}/2000</span>
        </Field>

        {isEmployer && (
          <Field label="Quyền lợi">
            <textarea name="benefits" rows={3} value={form.benefits} onChange={handleChange} placeholder="Ăn ở, xe đưa đón, bảo hiểm..." className="field resize-none" />
          </Field>
        )}

        <ImageField images={images} onError={setError} required label="Ảnh đính kèm" />

        {isEmployer && (
          <label className="flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" checked={form.isUrgent} onChange={e => setForm(prev => ({ ...prev, isUrgent: e.target.checked }))} className="h-4 w-4 rounded accent-brand-500" />
            <span className="text-sm text-ink">Đánh dấu <b className="text-brand-600">Tuyển gấp</b></span>
          </label>
        )}

        <SubmitBar backHref="/jobs" loading={loading} label="Đăng tin" busy="Đang đăng..." />
      </FormCard>

      {success && <SavedOverlay title="Đăng tin thành công" />}
    </FormShell>
  );
}
