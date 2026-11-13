// One source of truth for the site's categories and the "post a listing" choices.

export const CATEGORIES = [
  { href: '/products',       label: 'Nông sản',  icon: 'ri-plant-line' },
  { href: '/vat-nuoi',       label: 'Vật nuôi',  icon: 'ri-bear-smile-line' },
  { href: '/dich-vu',        label: 'Dịch vụ',   icon: 'ri-tools-line' },
  { href: '/real-estate',    label: 'Nhà đất',   icon: 'ri-home-4-line' },
  { href: '/jobs',           label: 'Việc làm',  icon: 'ri-briefcase-4-line' },
  { href: '/forum',          label: 'Diễn đàn',  icon: 'ri-chat-3-line' },
  { href: '/market-prices',  label: 'Bảng giá',  icon: 'ri-line-chart-line' },
  { href: '/advertisements', label: 'Quảng cáo', icon: 'ri-megaphone-line' },
  { href: '/canh-bao',       label: 'Cảnh báo',  icon: 'ri-shield-flash-line' },
];

export const POST_ITEMS = [
  { href: '/products/create',                  icon: 'ri-leaf-line',       label: 'Đăng nông sản',  sub: 'Nông sản, thực phẩm' },
  { href: '/products/create?category=VAT_NUOI', icon: 'ri-bear-smile-line', label: 'Đăng vật nuôi',  sub: 'Chó, mèo, gia súc...' },
  { href: '/products/create?category=DICH_VU',  icon: 'ri-service-line',    label: 'Đăng dịch vụ',   sub: 'Sửa chữa, vận chuyển...' },
  { href: '/real-estate/create',               icon: 'ri-home-4-line',     label: 'Nhà đất',        sub: 'Đất rẫy, nhà, phòng trọ' },
  { href: '/jobs/create',                      icon: 'ri-briefcase-line',  label: 'Tuyển dụng',     sub: 'Tìm việc, thuê nhân công' },
  { href: '/advertisements/create',            icon: 'ri-megaphone-line',  label: 'Quảng cáo',      sub: 'Khai trương, khuyến mãi' },
  { href: '/forum/create',                     icon: 'ri-chat-3-line',     label: 'Bài diễn đàn',   sub: 'Chia sẻ kinh nghiệm' },
];

export function isActivePath(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');
}
