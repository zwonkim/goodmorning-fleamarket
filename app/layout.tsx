import type { Metadata } from 'next';
import { Mochiy_Pop_P_One } from 'next/font/google';
import './globals.css';

const mochiyPopPOne = Mochiy_Pop_P_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-mochiy',
});

export const metadata: Metadata = {
  title: 'Good Morning',
  description: 'A private flea market for friends',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={mochiyPopPOne.variable}>
      <body className="bg-background text-text-primary font-sans">{children}</body>
    </html>
  );
}
