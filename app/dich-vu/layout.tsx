import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dịch vụ', description: 'Dịch vụ nông nghiệp và đời sống ở Nhân Cơ.' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
