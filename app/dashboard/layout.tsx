import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Tin của tôi', description: 'Quản lý các tin bạn đã đăng.', robots: { index: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
