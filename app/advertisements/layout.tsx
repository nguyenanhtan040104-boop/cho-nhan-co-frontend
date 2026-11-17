import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Quảng cáo', description: 'Quảng cáo từ cửa hàng và dịch vụ quanh Nhân Cơ.' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
