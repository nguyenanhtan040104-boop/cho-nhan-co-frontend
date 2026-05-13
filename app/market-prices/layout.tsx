import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Giá thị trường',
  description: 'Cập nhật giá nông sản, xăng dầu, vàng hôm nay tại Đắk Nông và Tây Nguyên. Dữ liệu thực, cập nhật liên tục.',
  openGraph: {
    title: 'Giá thị trường | Chợ Nhân Cơ',
    description: 'Giá nông sản, xăng dầu, vàng hôm nay tại Tây Nguyên.',
  },
};

export default function MarketPricesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
