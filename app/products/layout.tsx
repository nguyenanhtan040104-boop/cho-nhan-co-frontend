import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mua bán nông sản',
  description: 'Mua bán nông sản, hàng hóa tươi sạch từ nông dân Đắk Nông, Tây Nguyên. Giá tốt, minh bạch, giao dịch tin cậy.',
  openGraph: {
    title: 'Mua bán nông sản | Chợ Nhân Cơ',
    description: 'Nông sản tươi sạch, giá tốt từ Tây Nguyên.',
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
