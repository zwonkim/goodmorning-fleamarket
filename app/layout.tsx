import type { Metadata } from 'next';
import { Mochiy_Pop_P_One } from 'next/font/google';
import { SITE_URL } from '@/lib/auth';
import './globals.css';

const mochiyPopPOne = Mochiy_Pop_P_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-mochiy',
});

const title = 'Good Morning';
const description = '굿모닝 바자회';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  openGraph: {
    title,
    description,
    url: SITE_URL,
    siteName: title,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={mochiyPopPOne.variable}>
      <body className="bg-background text-text-primary font-sans">{children}</body>
    </html>
  );
}
