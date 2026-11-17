import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Ví của tôi', description: 'Số dư và lịch sử giao dịch.', robots: { index: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
