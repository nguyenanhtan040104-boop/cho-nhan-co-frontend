'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forum, auth, uploads } from '../../../lib/api';
import { Field, FormCard, FormError, FormShell, ImageField, Row, useImages } from '../../components/form/Kit';

const REPORT_TYPES = [
  {
    group: 'Lừa đảo',
    items: [
      { value: 'lua_dao_mua_ban', label: 'Lừa đảo mua bán hàng hóa' },
      { value: 'lua_dao_dat_coc', label: 'Lừa đảo đặt cọc (nhà đất, xe cộ...)' },
      { value: 'lua_dao_cho_vay', label: 'Lừa đảo cho vay, tín dụng đen' },
      { value: 'gia_mao_danh_tinh', label: 'Giả mạo danh tính, tài khoản' },
      { value: 'hang_gia', label: 'Hàng giả, hàng kém chất lượng' },
    ],
  },
  {
    group: 'Tội phạm và an ninh',
    items: [
      { value: 'trom_cap', label: 'Trộm cắp tài sản' },
      { value: 'cuop_giat', label: 'Cướp giật, trấn lột' },
      { value: 'pha_hoai', label: 'Phá hoại tài sản' },
      { value: 'mat_an_ninh', label: 'Mất an ninh khu vực' },
    ],
  },
  {
    group: 'Mất đồ và tìm kiếm',
    items: [
      { value: 'mat_do', label: 'Mất đồ (giấy tờ, ví, điện thoại...)' },
      { value: 'mat_xe', label: 'Mất xe, phương tiện' },
      { value: 'mat_vat_nuoi', label: 'Mất vật nuôi, gia súc' },
      { value: 'nhat_duoc_do', label: 'Nhặt được đồ, cần tìm chủ' },
    ],
  },
  { group: 'Khác', items: [{ value: 'khac', label: 'Thông tin cảnh báo khác' }] },
];

function getTypeLabel(value: string) {
  for (const g of REPORT_TYPES) {
    const found = g.items.find(i => i.value === value);
    if (found) return found.label;
  }
  return '';
}

function getTitlePrefix(value: string) {
  if (value.startsWith('lua_dao')) return '[LỪA ĐẢO]';
  if (value === 'gia_mao_danh_tinh') return '[GIẢ MẠO]';
  if (value === 'hang_gia') return '[HÀNG GIẢ]';
  if (value === 'trom_cap') return '[TRỘM CẮP]';
  if (value === 'cuop_giat') return '[CƯỚP GIẬT]';
  if (value === 'pha_hoai') return '[PHÁ HOẠI]';
  if (value === 'mat_an_ninh') return '[MẤT AN NINH]';
  if (value.startsWith('mat_')) return '[MẤT ĐỒ]';
  if (value === 'nhat_duoc_do') return '[TÌM CHỦ]';
  return '[CẢNH BÁO]';
}

const showPhone = (t: string) => ['lua_dao_mua_ban', 'lua_dao_dat_coc', 'lua_dao_cho_vay', 'gia_mao_danh_tinh', 'trom_cap', 'cuop_giat'].includes(t);
const showBank = (t: string) => ['lua_dao_mua_ban', 'lua_dao_dat_coc', 'lua_dao_cho_vay'].includes(t);
const showAmount = (t: string) => ['lua_dao_mua_ban', 'lua_dao_dat_coc', 'lua_dao_cho_vay', 'trom_cap', 'cuop_giat', 'mat_xe'].includes(t);
const showLocation = (t: string) => ['trom_cap', 'cuop_giat', 'pha_hoai', 'mat_an_ninh', 'mat_do', 'mat_xe', 'mat_vat_nuoi', 'nhat_duoc_do'].includes(t);
const showItem = (t: string) => ['mat_do', 'mat_xe', 'mat_vat_nuoi', 'nhat_duoc_do', 'trom_cap'].includes(t);

const EMPTY = { subject: '', phone: '', bankAccount: '', amount: '', location: '', itemDescription: '', description: '', isAnonymous: false };

export default function CreateReportPage() {
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoggedIn()) router.replace('/profile');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedType, setSelectedType] = useState('lua_dao_mua_ban');
  const [form, setForm] = useState(EMPTY);
  const images = useImages(6);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [limitHit, setLimitHit] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLimitHit(false);
    if (!form.subject.trim() || !form.description.trim()) {
      setError('Vui lòng điền tiêu đề và mô tả chi tiết');
      return;
    }
    if (images.files.length === 0) {
      setError('Vui lòng thêm ít nhất 1 ảnh bằng chứng');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const detailLines = [
        form.phone && `Số điện thoại liên quan: ${form.phone}`,
        form.bankAccount && `Số tài khoản ngân hàng: ${form.bankAccount}`,
        form.amount && `Giá trị tài sản, thiệt hại: ${form.amount}`,
        form.location && `Địa điểm: ${form.location}`,
        form.itemDescription && `Mô tả đồ vật, tài sản: ${form.itemDescription}`,
      ].filter(Boolean);

      // Plain text: the post page shows content as text, so no HTML tags here
      const content = [`Loại: ${getTypeLabel(selectedType)}`, detailLines.join('\n'), form.description].filter(Boolean).join('\n\n');

      const uploaded = await uploads.uploadImages(images.files);
      await forum.create({
        title: `${getTitlePrefix(selectedType)} ${form.subject}`,
        content,
        category: 'CANH_BAO',
        images: uploaded.map(u => u.url),
        isAnonymous: form.isAnonymous,
      });
      setSubmitted(true);
    } catch (err: any) {
      const status = err?.statusCode || err?.status;
      const msg = String(err?.message || '');
      if (status === 403 || /gioi han|giới hạn|limit/i.test(msg)) {
        setLimitHit(true);
        setError('Bạn đã đăng hết số bài của tháng này. Nâng cấp VIP để đăng thêm.');
      } else {
        setError(msg || 'Đăng thất bại, thử lại sau');
      }
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-paper px-4">
        <div className="card w-full max-w-md p-7 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold-100 text-gold-700"><i className="ri-time-line text-3xl" /></div>
          <h1 className="mt-3 text-xl font-bold text-ink">Đã gửi cảnh báo</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Bài đang chờ kiểm duyệt. Sau khi được duyệt, bài sẽ hiển thị công khai cho cộng đồng. Bạn sẽ nhận thông báo khi có kết quả.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/canh-bao" className="btn-primary">Về trang cảnh báo</Link>
            <button onClick={() => { setSubmitted(false); setForm(EMPTY); images.clear(); }} className="btn-ghost">Đăng thêm cảnh báo khác</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FormShell title="Đăng cảnh báo" hint="Chia sẻ để cộng đồng cùng phòng tránh" backHref="/canh-bao">
      <p className="mb-3 flex gap-2 rounded-card border border-gold-200 bg-gold-50 p-3 text-[13px] leading-snug text-gold-800">
        <i className="ri-information-line mt-0.5 shrink-0" aria-hidden="true" />
        <span>Chỉ đăng thông tin có thật, không vu khống hay bịa đặt. Nếu bị thiệt hại tài sản, hãy trình báo công an để được hỗ trợ pháp lý.</span>
      </p>

      <FormCard onSubmit={handleSubmit}>
        <FormError message={error}>
          {limitHit && <Link href="/pricing" className="mt-1 block font-semibold underline">Xem các gói VIP</Link>}
        </FormError>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink">Loại cảnh báo <span className="text-brand-600">*</span></legend>
          <div className="space-y-3">
            {REPORT_TYPES.map(g => (
              <div key={g.group}>
                <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">{g.group}</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label={g.group}>
                  {g.items.map(item => (
                    <button key={item.value} type="button" role="radio" aria-checked={selectedType === item.value} onClick={() => setSelectedType(item.value)}
                      className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${selectedType === item.value ? 'border-forest-600 bg-forest-50 font-semibold text-forest-800' : 'border-line text-ink-soft hover:border-forest-400'}`}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        <Field label="Tiêu đề ngắn" required hint={`tự thêm nhãn ${getTitlePrefix(selectedType)}`}>
          <input type="text" name="subject" value={form.subject} onChange={handleChange} className="field"
            placeholder={
              selectedType === 'trom_cap' ? 'Ví dụ: Mất xe máy tối qua tại thôn 5' :
              selectedType === 'mat_do' ? 'Ví dụ: Mất ví và giấy tờ tại chợ Nhân Cơ' :
              selectedType === 'nhat_duoc_do' ? 'Ví dụ: Nhặt được ví gần cổng trường' :
              'Ví dụ: Tài khoản Facebook giả mạo bán đất'
            } />
        </Field>

        <Row>
          {showPhone(selectedType) && (
            <Field label="Số điện thoại liên quan"><input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="0xxx xxx xxx" className="field" /></Field>
          )}
          {showBank(selectedType) && (
            <Field label="Số tài khoản ngân hàng"><input type="text" name="bankAccount" value={form.bankAccount} onChange={handleChange} placeholder="Tên ngân hàng và số tài khoản" className="field" /></Field>
          )}
          {showAmount(selectedType) && (
            <Field label={selectedType === 'trom_cap' || selectedType === 'mat_xe' ? 'Giá trị tài sản mất' : 'Số tiền thiệt hại'}>
              <input type="text" name="amount" value={form.amount} onChange={handleChange} placeholder="Ví dụ: 5.000.000đ" className="field" />
            </Field>
          )}
          {showLocation(selectedType) && (
            <Field label="Địa điểm xảy ra"><input type="text" name="location" value={form.location} onChange={handleChange} placeholder="Ví dụ: Thôn 3, xã Nhân Cơ" className="field" /></Field>
          )}
        </Row>

        {showItem(selectedType) && (
          <Field label={selectedType === 'nhat_duoc_do' ? 'Mô tả đồ vật nhặt được' : 'Mô tả đồ vật, tài sản mất'}>
            <input type="text" name="itemDescription" value={form.itemDescription} onChange={handleChange} className="field"
              placeholder={selectedType === 'mat_xe' ? 'Ví dụ: Wave Alpha đỏ, biển số 49G1-xxxxx' : selectedType === 'mat_vat_nuoi' ? 'Ví dụ: 3 con heo nái, tai có đánh số' : 'Ví dụ: Ví da đen, CCCD tên Nguyễn...'} />
          </Field>
        )}

        <Field label="Mô tả chi tiết" required>
          <textarea name="description" value={form.description} onChange={handleChange} rows={6} className="field resize-none"
            placeholder={
              selectedType === 'trom_cap' ? 'Thời gian, cách thức, đặc điểm đối tượng nếu có...' :
              selectedType.startsWith('mat_') ? 'Hoàn cảnh mất đồ và cách liên hệ để nhận lại...' :
              selectedType === 'nhat_duoc_do' ? 'Đồ vật, nơi nhặt được và cách liên hệ để nhận lại...' :
              'Sự việc, cách thức và bằng chứng bạn có...'
            } />
        </Field>

        <ImageField images={images} onError={setError} required label="Ảnh bằng chứng" />

        <label className="flex cursor-pointer items-center gap-2.5">
          <input type="checkbox" checked={form.isAnonymous} onChange={e => setForm(prev => ({ ...prev, isAnonymous: e.target.checked }))} className="h-4 w-4 rounded accent-forest-600" />
          <span className="text-sm text-ink">Đăng ẩn danh, không hiện tên của tôi</span>
        </label>

        <div className="sticky bottom-[4.5rem] z-20 -mx-4 -mb-4 flex gap-3 border-t border-line bg-surface/95 px-4 py-3 sm:static sm:m-0 sm:border-0 sm:bg-transparent sm:p-0 sm:pt-2">
          <Link href="/canh-bao" className="btn-ghost flex-1 sm:flex-none sm:px-8">Hủy</Link>
          <button type="submit" disabled={loading} className="btn-primary flex-[2] disabled:opacity-50">
            {loading ? <><i className="ri-loader-4-line animate-spin" aria-hidden="true" /> Đang đăng...</> : 'Đăng cảnh báo'}
          </button>
        </div>
      </FormCard>
    </FormShell>
  );
}
