import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Việc làm',
  description: 'Tìm kiếm việc làm nông nghiệp, công nhân, lao động phổ thông tại Nhân Cơ, Đắk Nông. Tuyển dụng uy tín, lương tốt.',
  openGraph: {
    title: 'Việc làm | Chợ Nhân Cơ',
    description: 'Việc làm nông nghiệp và phổ thông tại Đắk Nông.',
  },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
