import { Inter } from 'next/font/google';
import './globals.css';
import Header from './components/Header';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata = {
  title: 'Chợ Nhân Cơ - Marketplace Nông Nghiệp',
  description: 'Kết nối giao thương, gắn kết cộng đồng',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className} suppressHydrationWarning>
        <Header />
        {children}
      </body>
    </html>
  );
}
