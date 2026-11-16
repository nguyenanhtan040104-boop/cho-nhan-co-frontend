// Small formatting helpers shared by the listing cards and list pages.

export type ListingType = 'product' | 'real-estate' | 'job' | 'ad' | 'forum';

export function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  if (isNaN(diff)) return '';
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'Vừa đăng';
  if (m < 60) return `${m} phút trước`;
  if (h < 24) return `${h} giờ trước`;
  if (d < 30) return `${d} ngày trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

// 2.800.000.000 -> "2,8 tỷ", 950.000.000 -> "950 triệu"
export function shortMoney(n: number): string {
  if (!n) return 'Thỏa thuận';
  if (n >= 1e9) return `${(n / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tỷ`;
  if (n >= 1e6) return `${(n / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} triệu`;
  return `${n.toLocaleString('vi-VN')}đ`;
}

export function listingPrice(item: any, type: ListingType): string {
  if (type === 'product') {
    const p = Number(item.price);
    return p > 0 ? `${p.toLocaleString('vi-VN')}đ${item.unit ? '/' + item.unit : ''}` : 'Thỏa thuận';
  }
  if (type === 'real-estate') return shortMoney(Number(item.price));
  if (type === 'job') return item.salary || 'Thỏa thuận';
  if (type === 'ad') return item.businessName || 'Quảng cáo';
  return '';
}

export function listingHref(item: any, type: ListingType): string {
  switch (type) {
    case 'product': return `/products/${item.id}`;
    case 'real-estate': return `/real-estate/${item.id}`;
    case 'job': return `/jobs/${item.id}`;
    case 'ad': return `/advertisements/${item.id}`;
    default: return `/forum/${item.id}`;
  }
}

export function listingImage(item: any): string | null {
  const first = item?.images?.[0];
  return (first && (first.url || (typeof first === 'string' ? first : null))) || item?.imageUrl || null;
}

// ---- Labels for the small "attributes" line on listing rows. Only fields the API returns. ----
const PRODUCT_CATEGORY: Record<string, string> = { NONG_SAN: 'Nông sản', VAT_NUOI: 'Vật nuôi', DICH_VU: 'Dịch vụ', DO_DUNG_GIA_DINH: 'Đồ dùng gia đình', HANG_TIEU_DUNG: 'Hàng tiêu dùng' };
const RE_TYPE: Record<string, string> = { NHA_O: 'Nhà ở', DAT_NEN: 'Đất nền', PHONG_TRO: 'Phòng trọ', MAT_BANG: 'Mặt bằng', CHO_THUE: 'Cho thuê' };
const AD_CATEGORY: Record<string, string> = { KHAI_TRUONG: 'Khai trương', KHUYEN_MAI: 'Khuyến mãi', SAN_PHAM_MOI: 'Sản phẩm mới', DICH_VU: 'Dịch vụ', SU_KIEN: 'Sự kiện', KHAC: 'Khác' };

export function listingFacts(item: any, type: ListingType): string[] {
  const out: string[] = [];
  if (type === 'product') {
    if (item.category) out.push(PRODUCT_CATEGORY[item.category] || '');
    const qty = Number(item.quantity);
    if (item.status !== 'SOLD_OUT' && qty > 1) out.push(`Còn ${qty.toLocaleString('vi-VN')}${item.unit ? ' ' + item.unit : ''}`);
  } else if (type === 'real-estate') {
    out.push(RE_TYPE[item.type] || '');
    if (item.area) out.push(`${Number(item.area).toLocaleString('vi-VN')} m²`);
    if (item.legalStatus) out.push(item.legalStatus);
  } else if (type === 'job') {
    out.push(item.type === 'EMPLOYER' ? 'Tuyển dụng' : item.type === 'JOB_SEEKER' ? 'Tìm việc' : '');
    if (item.category) out.push(item.category);
    if (item.experience) out.push(item.experience);
  } else if (type === 'ad') {
    out.push(AD_CATEGORY[item.category] || '');
  }
  return out.filter(Boolean);
}