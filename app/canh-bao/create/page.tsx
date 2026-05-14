'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forum, auth } from '../../../lib/api';

const REPORT_TYPES = [
  {
    group: 'Lừa đảo',
    icon: 'ri-money-dollar-circle-line',
    color: '#dc2626',
    items: [
      { value: 'lua_dao_mua_ban', label: 'Lừa đảo mua bán hàng hóa' },
      { value: 'lua_dao_dat_coc', label: 'Lừa đảo đặt cọc (BĐS, xe cộ...)' },
      { value: 'lua_dao_cho_vay', label: 'Lừa đảo cho vay, tín dụng đen' },
      { value: 'gia_mao_danh_tinh', label: 'Giả mạo danh tính, tài khoản' },
      { value: 'hang_gia', label: 'Hàng giả / hàng kém chất lượng' },
    ],
  },
  {
    group: 'Tội phạm & Mất an ninh',
    icon: 'ri-shield-cross-line',
    color: '#7c3aed',
    items: [
      { value: 'trom_cap', label: 'Trộm cắp tài sản' },
      { value: 'cuop_giat', label: 'Cướp giật, trấn lột' },
      { value: 'pha_hoai', label: 'Phá hoại tài sản' },
      { value: 'mat_an_ninh', label: 'Mất an ninh khu vực' },
    ],
  },
  {
    group: 'Mất đồ & Tìm kiếm',
    icon: 'ri-search-eye-line',
    color: '#0369a1',
    items: [
      { value: 'mat_do', label: 'Mất đồ (CMND, ví, điện thoại...)' },
      { value: 'mat_xe', label: 'Mất xe / phương tiện' },
      { value: 'mat_vat_nuoi', label: 'Mất vật nuôi, gia súc' },
      { value: 'nhat_duoc_do', label: 'Nhặt được đồ — cần tìm chủ' },
    ],
  },
  {
    group: 'Khác',
    icon: 'ri-megaphone-line',
    color: '#6b7280',
    items: [
      { value: 'khac', label: 'Thông tin cảnh báo khác' },
    ],
  },
];

const ALL_TYPES = REPORT_TYPES.flatMap(g => g.items);

function getTypeInfo(value: string) {
  for (const g of REPORT_TYPES) {
    const found = g.items.find(i => i.value === value);
    if (found) return { ...found, group: g.group };
  }
  return null;
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

// Các trường phụ theo loại
function showPhoneField(type: string) {
  return ['lua_dao_mua_ban', 'lua_dao_dat_coc', 'lua_dao_cho_vay', 'gia_mao_danh_tinh', 'trom_cap', 'cuop_giat'].includes(type);
}
function showBankField(type: string) {
  return ['lua_dao_mua_ban', 'lua_dao_dat_coc', 'lua_dao_cho_vay'].includes(type);
}
function showAmountField(type: string) {
  return ['lua_dao_mua_ban', 'lua_dao_dat_coc', 'lua_dao_cho_vay', 'trom_cap', 'cuop_giat', 'mat_xe'].includes(type);
}
function showLocationField(type: string) {
  return ['trom_cap', 'cuop_giat', 'pha_hoai', 'mat_an_ninh', 'mat_do', 'mat_xe', 'mat_vat_nuoi', 'nhat_duoc_do'].includes(type);
}
function showItemField(type: string) {
  return ['mat_do', 'mat_xe', 'mat_vat_nuoi', 'nhat_duoc_do', 'trom_cap'].includes(type);
}

export default function CreateReportPage() {
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.replace('/profile'); }
  }, []);

  const [selectedType, setSelectedType] = useState('lua_dao_mua_ban');
  const [form, setForm] = useState({
    subject: '',
    phone: '',
    bankAccount: '',
    amount: '',
    location: '',
    itemDescription: '',
    description: '',
    isAnonymous: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, type, value } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      setError('Vui lòng điền tiêu đề và mô tả chi tiết');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const typeInfo = getTypeInfo(selectedType);
      const prefix = getTitlePrefix(selectedType);

      const detailLines = [
        form.phone && `Số điện thoại liên quan: ${form.phone}`,
        form.bankAccount && `Số tài khoản ngân hàng: ${form.bankAccount}`,
        form.amount && `Giá trị tài sản / thiệt hại: ${form.amount}`,
        form.location && `Địa điểm: ${form.location}`,
        form.itemDescription && `Mô tả đồ vật / tài sản: ${form.itemDescription}`,
      ].filter(Boolean);

      const content = [
        `<p><strong>Loại:</strong> ${typeInfo?.label}</p>`,
        detailLines.length ? `<p>${detailLines.join('<br/>')}</p>` : '',
        `<p>${form.description}</p>`,
      ].join('');

      const title = `${prefix} ${form.subject}`;

      await forum.create({
        title,
        content,
        category: 'CANH_BAO',
        isAnonymous: form.isAnonymous,
        status: 'PUBLISHED',
      });
      router.push('/canh-bao');
    } catch (e: any) {
      setError(e.message || 'Đăng thất bại, thử lại sau');
    } finally {
      setLoading(false);
    }
  }

  const typeInfo = getTypeInfo(selectedType);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f5f0' }}>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)' }} className="py-6">
        <div className="max-w-2xl mx-auto px-4">
          <Link href="/canh-bao" className="text-red-300 text-sm hover:text-white transition-colors flex items-center gap-1 mb-2">
            <i className="ri-arrow-left-line"></i> Quay lại cảnh báo cộng đồng
          </Link>
          <h1 className="text-xl font-bold text-white">Đăng thông tin cảnh báo</h1>
          <p className="text-red-200 text-sm mt-1">Chia sẻ để cộng đồng cùng biết và phòng tránh</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Lưu ý */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
          <div className="flex gap-2">
            <i className="ri-information-line text-amber-600 text-base flex-shrink-0 mt-0.5"></i>
            <p className="text-xs text-amber-800">Thông tin đăng lên mang tính cộng đồng cảnh báo. Không vu khống, bịa đặt. Nếu bị thiệt hại tài sản hãy trình báo công an để được hỗ trợ pháp lý.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Chọn loại */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4">Loại thông tin cảnh báo <span className="text-red-500">*</span></h2>
            <div className="space-y-4">
              {REPORT_TYPES.map(group => (
                <div key={group.group}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5"
                    style={{ color: group.color }}>
                    <i className={group.icon}></i>
                    {group.group}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.items.map(item => (
                      <button key={item.value} type="button"
                        onClick={() => setSelectedType(item.value)}
                        className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${
                          selectedType === item.value
                            ? 'border-red-400 bg-red-50 text-red-800 font-medium'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tiêu đề */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-800">Thông tin chính <span className="text-red-500">*</span></h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tiêu đề ngắn <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-1">— sẽ tự thêm nhãn {getTitlePrefix(selectedType)}</span>
              </label>
              <input type="text" name="subject" value={form.subject} onChange={handleChange}
                placeholder={
                  selectedType === 'trom_cap' ? 'VD: Mất xe máy Wave tối qua tại thôn 5...' :
                  selectedType === 'mat_do' ? 'VD: Mất CMND và ví tại chợ Nhân Cơ...' :
                  selectedType === 'nhat_duoc_do' ? 'VD: Nhặt được chiếc ví gần cổng trường...' :
                  'VD: Tài khoản Facebook giả mạo bán đất huyện Đắk R\'Lấp...'
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
            </div>

            {/* Các trường phụ tùy loại */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {showPhoneField(selectedType) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại liên quan</label>
                  <input type="text" name="phone" value={form.phone} onChange={handleChange}
                    placeholder="0xxx xxx xxx"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
                </div>
              )}
              {showBankField(selectedType) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Số tài khoản ngân hàng</label>
                  <input type="text" name="bankAccount" value={form.bankAccount} onChange={handleChange}
                    placeholder="Tên ngân hàng + số TK"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
                </div>
              )}
              {showAmountField(selectedType) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {selectedType === 'trom_cap' || selectedType === 'mat_xe' ? 'Giá trị tài sản mất' : 'Số tiền thiệt hại'}
                  </label>
                  <input type="text" name="amount" value={form.amount} onChange={handleChange}
                    placeholder="VD: 5.000.000đ"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
                </div>
              )}
              {showLocationField(selectedType) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa điểm xảy ra</label>
                  <input type="text" name="location" value={form.location} onChange={handleChange}
                    placeholder="VD: Thôn 3, xã Nhân Cơ..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
                </div>
              )}
            </div>

            {showItemField(selectedType) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {selectedType === 'nhat_duoc_do' ? 'Mô tả đồ vật nhặt được' : 'Mô tả đồ vật / tài sản mất'}
                </label>
                <input type="text" name="itemDescription" value={form.itemDescription} onChange={handleChange}
                  placeholder={
                    selectedType === 'mat_xe' ? 'VD: Wave Alpha đỏ, BKS 49G1-xxxxx...' :
                    selectedType === 'mat_vat_nuoi' ? 'VD: 3 con heo nái, tai có đánh số...' :
                    'VD: Ví da đen, CMND tên Nguyễn...'
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
              </div>
            )}
          </div>

          {/* Mô tả chi tiết */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-800">Mô tả chi tiết <span className="text-red-500">*</span></h2>
            <textarea name="description" value={form.description} onChange={handleChange} rows={6}
              placeholder={
                selectedType === 'trom_cap' ? 'Mô tả thời gian, cách thức, đặc điểm nghi phạm (nếu có)...' :
                selectedType.startsWith('mat_') ? 'Mô tả chi tiết hoàn cảnh mất đồ, thông tin liên hệ để nhận lại...' :
                selectedType === 'nhat_duoc_do' ? 'Mô tả đồ vật, nơi nhặt được, cách liên hệ để nhận lại...' :
                'Mô tả chi tiết sự việc, cách thức, bằng chứng bạn có...'
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none" />

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isAnonymous" checked={form.isAnonymous}
                onChange={handleChange} className="w-4 h-4 accent-red-600" />
              <span className="text-sm text-gray-600">Đăng ẩn danh (không hiển thị tên của bạn)</span>
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>
          )}

          <div className="flex gap-3">
            <Link href="/canh-bao"
              className="flex-1 text-center px-5 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
              Hủy
            </Link>
            <button type="submit" disabled={loading}
              className="flex-1 bg-red-600 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors">
              {loading ? 'Đang đăng...' : 'Đăng cảnh báo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
