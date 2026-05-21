import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sản phẩm',
  description: 'Mua bán sản phẩm, hàng hóa từ bà con Đắk Nông, Tây Nguyên. Nông sản, vật nuôi, đồ dùng, dịch vụ — giá tốt, giao dịch tin cậy.',
  openGraph: {
    title: 'Sản phẩm | Chợ Nhân Cơ',
    description: 'Mua bán đủ loại sản phẩm, hàng hóa tại Chợ Nhân Cơ.',
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
