import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Cảnh báo lừa đảo', description: 'Bà con chia sẻ các chiêu lừa đảo mua bán để cùng tránh.' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
