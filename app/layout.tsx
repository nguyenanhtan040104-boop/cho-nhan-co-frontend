import { Inter } from 'next/font/google';
import './globals.css';
import Header from './components/Header';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

const siteUrl = 'https://cho-nhan-co-frontend-bxj2-18271g0zq.vercel.app';
const siteName = 'Chợ Nhân Cơ';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Chợ Nhân Cơ — Mua bán nông sản, bất động sản, việc làm tại Đắk Nông',
    template: '%s | Chợ Nhân Cơ',
  },
  description: 'Chợ Nhân Cơ là nền tảng mua bán trực tuyến dành cho cộng đồng Nhân Cơ, Đắk Nông. Đăng tin nông sản, bất động sản, tuyển dụng, quảng cáo miễn phí. Kết nối người mua và người bán tại Tây Nguyên.',
  keywords: [
    'chợ nhân cơ', 'mua bán nông sản', 'đắk nông', 'nhân cơ', 'tây nguyên',
    'bất động sản đắk nông', 'việc làm đắk nông', 'nông sản sạch',
    'mua bán online', 'chợ online', 'marketplace nông nghiệp',
  ],
  authors: [{ name: 'Chợ Nhân Cơ', url: siteUrl }],
  creator: 'Chợ Nhân Cơ',
  publisher: 'Chợ Nhân Cơ',
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: siteUrl,
    siteName,
    title: 'Chợ Nhân Cơ — Mua bán nông sản, bất động sản tại Đắk Nông',
    description: 'Nền tảng mua bán trực tuyến cho cộng đồng Nhân Cơ, Đắk Nông. Đăng tin miễn phí, kết nối người mua và người bán.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Chợ Nhân Cơ - Marketplace Đắk Nông' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chợ Nhân Cơ — Marketplace Đắk Nông',
    description: 'Mua bán nông sản, bất động sản, việc làm tại Nhân Cơ, Đắk Nông.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: siteUrl },
  verification: {
    // google: 'your-google-verification-code', // thêm sau khi đăng ký Google Search Console
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* Structured data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Chợ Nhân Cơ',
              url: siteUrl,
              description: 'Nền tảng mua bán trực tuyến dành cho cộng đồng Nhân Cơ, Đắk Nông',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Nhân Cơ',
                addressRegion: 'Đắk Nông',
                addressCountry: 'VN',
              },
            }),
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Header />
        {children}
      </body>
    </html>
  );
}
