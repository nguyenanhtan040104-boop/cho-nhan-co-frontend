'use client';

import ListPage, { nearParams } from '../components/list/ListPage';
import { products as productsApi } from '../../lib/api';

export default function VatNuoiPage() {
  return (
    <ListPage
      basePath="/vat-nuoi"
      subParam="sub"
      title="Mua bán vật nuôi tại Nhân Cơ"
      crumb="Vật nuôi"
      noun="tin đang rao"
      entity="tin vật nuôi"
      createHref="/products/create?category=VAT_NUOI"
      createLabel="Đăng tin vật nuôi"
      placeholder="Tìm chó, mèo, gà, bò..."
      type="product"
      logKind="products"
      subCats={[
        { value: '', name: 'Tất cả' },
        { value: 'Chó', name: 'Chó' },
        { value: 'Mèo', name: 'Mèo' },
        { value: 'Gia cầm', name: 'Gia cầm' },
        { value: 'Gia súc', name: 'Gia súc' },
        { value: 'Cá cảnh', name: 'Cá cảnh' },
        { value: 'Chim', name: 'Chim' },
      ]}
      quickFilters={[
        { value: '', label: 'Tất cả' },
        { value: 'vip', label: 'Nổi bật' },
        { value: 'image', label: 'Có ảnh' },
        { value: 'near', label: 'Gần bạn' },
        { value: 'today', label: 'Mới hôm nay' },
      ]}
      popular={['Chó corgi', 'Mèo anh lông ngắn', 'Gà thả đồi', 'Heo rừng', 'Cá koi', 'Bò sữa', 'Dê núi', 'Vịt xiêm']}
      safety="Xem tận nơi, hỏi giấy tiêm phòng, không chuyển khoản trước khi gặp vật nuôi."
      load={({ search, sub, quick, sortBy, page, userLoc }) =>
        productsApi.getAll({ category: 'VAT_NUOI', search: [search, sub].filter(Boolean).join(' ') || undefined, sortBy, page, limit: 12, ...nearParams(quick, userLoc) } as any)}
    />
  );
}
