'use client';

import ListPage, { nearParams } from '../components/list/ListPage';
import { realEstate as realEstateApi } from '../../lib/api';

export default function RealEstatePage() {
  return (
    <ListPage
      basePath="/real-estate"
      subParam="type"
      title="Bất động sản Nhân Cơ"
      crumb="Bất động sản"
      noun="tin đăng"
      entity="tin nhà đất"
      createHref="/real-estate/create"
      createLabel="Đăng tin nhà đất"
      placeholder="Tìm nhà, đất, phòng trọ, địa chỉ..."
      type="real-estate"
      logKind="real-estate"
      subCats={[
        { value: '', name: 'Tất cả' },
        { value: 'NHA_O', name: 'Nhà ở' },
        { value: 'DAT_NEN', name: 'Đất nền' },
        { value: 'PHONG_TRO', name: 'Phòng trọ' },
        { value: 'MAT_BANG', name: 'Mặt bằng KD' },
        { value: 'CHO_THUE', name: 'Cho thuê' },
      ]}
      quickFilters={[
        { value: '', label: 'Tất cả' },
        { value: 'vip', label: 'Nổi bật' },
        { value: 'image', label: 'Có ảnh' },
        { value: 'near', label: 'Gần bạn' },
        { value: 'today', label: 'Mới hôm nay' },
      ]}
      popular={['Nhà bán Nhân Cơ', 'Đất nền giá rẻ', 'Phòng trọ', 'Mặt bằng kinh doanh', 'Đất vườn', 'Nhà nguyên căn', 'Đất thổ cư']}
      safety="Kiểm tra sổ đỏ và gặp chủ đất tại thực địa trước khi đặt cọc."
      load={({ search, sub, quick, sortBy, page, userLoc }) =>
        realEstateApi.getAll({ page, limit: 12, sortBy, ...(search ? { search } : {}), ...(sub ? { type: sub } : {}), ...nearParams(quick, userLoc) } as any)}
    />
  );
}
