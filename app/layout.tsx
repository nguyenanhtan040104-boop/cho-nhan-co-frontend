import { Inter } from 'next/font/google';
import './globals.css';
import Header from './components/Header';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata = {
  metadataBase: new URL('https://chonhanco.com'),
  title: {
    default: 'Chợ Nhân Cơ - Marketplace Nông Nghiệp Tây Nguyên',
    template: '%s | Chợ Nhân Cơ',
  },
  description: 'Chợ Nhân Cơ — Kết nối người mua và người bán nông sản, bất động sản, việc làm tại Đắk Nông và Tây Nguyên. Giá cả minh bạch, cộng đồng giao thương tin cậy.',
  keywords: ['nông sản', 'chợ nông nghiệp', 'Đắk Nông', 'Tây Nguyên', 'Nhân Cơ', 'mua bán nông sản', 'giá thị trường'],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://chonhanco.com',
    siteName: 'Chợ Nhân Cơ',
    title: 'Chợ Nhân Cơ - Marketplace Nông Nghiệp Tây Nguyên',
    description: 'Kết nối người mua và người bán nông sản, bất động sản, việc làm tại Đắk Nông và Tây Nguyên.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Chợ Nhân Cơ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chợ Nhân Cơ',
    description: 'Marketplace nông nghiệp Tây Nguyên',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Header />
        {children}
      </body>
    </html>
  );
}
