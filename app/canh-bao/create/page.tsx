'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forum, auth } from '../../../lib/api';

const reportTypeOptions = [
  { value: 'Lừa đảo mua bán', label: 'Lừa đảo mua bán' },
  { value: 'Giả mạo danh tính', label: 'Giả mạo danh tính' },
  { value: 'Lừa đảo đặt cọc', label: 'Lừa đảo đặt cọc BĐS / xe cộ' },
  { value: 'Hàng giả kém chất lượng', label: 'Hàng giả / kém chất lượng' },
  { value: 'Lừa đảo cho vay', label: 'Lừa đảo cho vay, tín dụng đen' },
  { value: 'Khác', label: 'Hình thức khác' },
];

export default function CreateReportPage() {
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.replace('/profile'); }
  }, []);

  const [form, setForm] = useState({
    type: 'Lừa đảo mua bán',
    subject: '',
    phone: '',
    bankAccount: '',
    amount: '',
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
      const details = [
        form.phone && `Số điện thoại: ${form.phone}`,
        form.bankAccount && `Số tài khoản: ${form.bankAccount}`,
        form.amount && `Số tiền thiệt hại: ${form.amount}`,
      ].filter(Boolean).join('\n');

      const content = `<p><strong>Loại lừa đảo:</strong> ${form.type}</p>${details ? `<p>${details.replace(/\n/g, '<br/>')}</p>` : ''}<p>${form.description}</p>`;

      const title = `[CẢNH BÁO] ${form.type}: ${form.subject}`;

      await forum.create({
        title,
        content,
        category: 'CANH_BAO',
        isAnonymous: form.isAnonymous,
        status: 'PUBLISHED',
      });
      router.push('/canh-bao');
    } catch (e: any) {
      setError(e.message || 'Đăng báo cáo thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f5f0' }}>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)' }} className="py-6">
        <div className="max-w-2xl mx-auto px-4">
          <Link href="/canh-bao" className="text-red-300 text-sm hover:text-white transition-colors flex items-center gap-1 mb-2">
            <i className="ri-arrow-left-line"></i> Quay lại cảnh báo
          </Link>
          <h1 className="text-xl font-bold text-white">Đăng báo cáo lừa đảo</h1>
          <p className="text-red-200 text-sm mt-1">Chia sẻ thông tin để cộng đồng cùng cảnh giác</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-5">
          <div className="flex gap-2">
            <i className="ri-information-line text-yellow-600 text-base flex-shrink-0 mt-0.5"></i>
            <p className="text-xs text-yellow-800">Thông tin đăng lên mang tính cộng đồng cảnh báo. Không vu khống, bịa đặt. Nếu bị thiệt hại tài sản, hãy trình báo công an để được hỗ trợ pháp lý.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-800">Thông tin cảnh báo</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Loại lừa đảo <span className="text-red-500">*</span></label>
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white">
                {reportTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên / mô tả ngắn đối tượng <span className="text-red-500">*</span></label>
              <input type="text" name="subject" value={form.subject} onChange={handleChange}
                placeholder="VD: Tài khoản Facebook tên Nguyễn Văn X, bán đất huyện Đắk R'Lấp..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-800">Thông tin nhận diện (không bắt buộc)</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
                <input type="text" name="phone" value={form.phone} onChange={handleChange}
                  placeholder="0xxx xxx xxx"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Số tài khoản ngân hàng</label>
                <input type="text" name="bankAccount" value={form.bankAccount} onChange={handleChange}
                  placeholder="Tên ngân hàng + số TK"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Số tiền thiệt hại (nếu có)</label>
              <input type="text" name="amount" value={form.amount} onChange={handleChange}
                placeholder="VD: 5.000.000đ"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-800">Mô tả chi tiết <span className="text-red-500">*</span></h2>
            <textarea name="description" value={form.description} onChange={handleChange} rows={6}
              placeholder="Mô tả cách thức lừa đảo, diễn biến sự việc, bằng chứng bạn có..."
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
