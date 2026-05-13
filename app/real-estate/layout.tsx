import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bất động sản',
  description: 'Mua bán, cho thuê bất động sản tại Nhân Cơ, Đắk R\'Lấp, Đắk Nông. Đất nông nghiệp, đất ở, nhà vườn giá tốt.',
  openGraph: {
    title: 'Bất động sản | Chợ Nhân Cơ',
    description: 'Mua bán, cho thuê bất động sản Đắk Nông.',
  },
};

export default function RealEstateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
