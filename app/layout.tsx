import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PPT 展示系统',
  description: '实时PPT展示系统',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

