'use client';

import ListPage, { nearParams } from '../components/list/ListPage';
import { products as productsApi } from '../../lib/api';

export default function DichVuPage() {
  return (
    <ListPage
      basePath="/dich-vu"
      subParam="sub"
      title="Dịch vụ tại Nhân Cơ"
      crumb="Dịch vụ"
      noun="dịch vụ đang rao"
      entity="dịch vụ"
      createHref="/products/create?category=DICH_VU"
      createLabel="Đăng dịch vụ"
      placeholder="Tìm sửa chữa, vận chuyển, gia sư..."
      type="product"
      logKind="products"
      subCats={[
        { value: '', name: 'Tất cả' },
        { value: 'Sửa chữa', name: 'Sửa chữa' },
        { value: 'Vận chuyển', name: 'Vận chuyển' },
        { value: 'Tư vấn', name: 'Tư vấn' },
        { value: 'Xây dựng', name: 'Xây dựng' },
        { value: 'Giặt ủi', name: 'Giặt ủi' },
        { value: 'Vệ sinh', name: 'Vệ sinh' },
        { value: 'Gia sư', name: 'Gia sư' },
      ]}
      quickFilters={[
        { value: '', label: 'Tất cả' },
        { value: 'vip', label: 'Nổi bật' },
        { value: 'image', label: 'Có ảnh' },
        { value: 'near', label: 'Gần bạn' },
        { value: 'today', label: 'Mới hôm nay' },
      ]}
      popular={['Sửa xe máy', 'Chở hàng', 'Xây nhà', 'Giặt ủi', 'Vệ sinh máy lạnh', 'Gia sư toán', 'Cắt tóc', 'Sơn nhà']}
      safety="Thỏa thuận giá và công việc rõ ràng trước khi làm, chỉ trả tiền khi nghiệm thu."
      load={({ search, sub, quick, sortBy, page, userLoc }) =>
        productsApi.getAll({ category: 'DICH_VU', search: [search, sub].filter(Boolean).join(' ') || undefined, sortBy, page, limit: 12, ...nearParams(quick, userLoc) } as any)}
    />
  );
}
