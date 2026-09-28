import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "FreshMix - Ichimlik Konstruktori | O'zingizning Noyob Ichimligingizni Yarating",
  description: "Turli xil tabiiy ta'mlar, meva ekstraktlari va doza (mg) asosida o'z ichimligingizni 0.5L dan 2.0L gacha miks qiling va buyurtma bering.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="uz"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50 dark:bg-gray-950">
        {children}
      </body>
    </html>
  );
}
