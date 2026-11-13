'use client';

import ListPage, { nearParams } from '../components/list/ListPage';
import { products as productsApi } from '../../lib/api';

export default function ProductsPage() {
  return (
    <ListPage
      basePath="/products"
      subParam="category"
      title="Mua bán sản phẩm tại Nhân Cơ"
      crumb="Sản phẩm"
      noun="tin đang rao"
      entity="sản phẩm"
      createHref="/products/create"
      createLabel="Đăng sản phẩm"
      placeholder="Tìm cà phê, hồ tiêu, sầu riêng..."
      type="product"
      logKind="products"
      subCats={[
        { value: '', name: 'Tất cả' },
        { value: 'NONG_SAN', name: 'Nông sản' },
        { value: 'VAT_NUOI', name: 'Vật nuôi' },
        { value: 'DICH_VU', name: 'Dịch vụ' },
        { value: 'DO_DUNG_GIA_DINH', name: 'Đồ dùng' },
        { value: 'HANG_TIEU_DUNG', name: 'Tiêu dùng' },
      ]}
      quickFilters={[
        { value: '', label: 'Tất cả' },
        { value: 'vip', label: 'Nổi bật' },
        { value: 'image', label: 'Có ảnh' },
        { value: 'near', label: 'Gần bạn' },
        { value: 'today', label: 'Mới hôm nay' },
      ]}
      popular={['Cà phê nhân', 'Hồ tiêu', 'Sầu riêng', 'Bơ booth', 'Mít Thái', 'Cao su', 'Điều khô', 'Mắc ca']}
      safety="Gặp trực tiếp nơi đông người, kiểm tra hàng trước khi trả tiền, không chuyển khoản trước."
      load={({ search, sub, quick, sortBy, page, userLoc }) =>
        productsApi.getAll({ search, category: sub || undefined, sortBy, page, limit: 12, ...nearParams(quick, userLoc) } as any)}
    />
  );
}
