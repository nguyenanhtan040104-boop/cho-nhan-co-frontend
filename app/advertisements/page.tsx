'use client';

import ListPage from '../components/list/ListPage';
import { advertisements } from '../../lib/api';

export default function AdvertisementsPage() {
  return (
    <ListPage
      simple
      basePath="/advertisements"
      subParam="category"
      title="Quảng cáo và thông báo"
      crumb="Quảng cáo"
      noun="quảng cáo từ cửa hàng địa phương"
      entity="quảng cáo"
      createHref="/advertisements/create"
      createLabel="Đăng quảng cáo"
      placeholder="Tìm cửa hàng, sự kiện..."
      type="ad"
      logKind="advertisements"
      subCats={[
        { value: '', name: 'Tất cả' },
        { value: 'KHAI_TRUONG', name: 'Khai trương' },
        { value: 'KHUYEN_MAI', name: 'Khuyến mãi' },
        { value: 'SAN_PHAM_MOI', name: 'Sản phẩm mới' },
        { value: 'DICH_VU', name: 'Dịch vụ' },
        { value: 'SU_KIEN', name: 'Sự kiện' },
        { value: 'KHAC', name: 'Khác' },
      ]}
      quickFilters={[]}
      popular={['Khai trương', 'Khuyến mãi', 'Sự kiện', 'Sản phẩm mới']}
      safety="Quảng cáo do cửa hàng tự đăng. Hãy xem kỹ thông tin trước khi mua hoặc đặt cọc."
      load={({ search, sub, page }) =>
        advertisements.getAll({ page, limit: 12, ...(sub ? { category: sub } : {}), ...(search ? { search } : {}) } as any)}
    />
  );
}
