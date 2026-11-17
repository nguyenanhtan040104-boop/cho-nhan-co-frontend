import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Hồ sơ của tôi', description: 'Thông tin tài khoản.', robots: { index: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
