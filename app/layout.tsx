import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '치킨 매출 대시보드',
  description: '2025년 9~11월 매출 분석',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
