import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Diễn đàn',
  description: 'Diễn đàn chia sẻ kinh nghiệm nông nghiệp, thị trường, kỹ thuật canh tác tại Chợ Nhân Cơ — cộng đồng nông dân Tây Nguyên.',
  openGraph: {
    title: 'Diễn đàn | Chợ Nhân Cơ',
    description: 'Cộng đồng chia sẻ kinh nghiệm nông nghiệp Tây Nguyên.',
  },
};

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
