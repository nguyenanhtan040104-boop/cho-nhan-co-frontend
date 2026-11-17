import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Tin nhắn', description: 'Trao đổi với người mua và người bán.', robots: { index: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
