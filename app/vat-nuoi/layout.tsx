import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Vật nuôi', description: 'Mua bán vật nuôi ở Nhân Cơ.' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
