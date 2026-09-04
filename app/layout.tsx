import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://psychology-baoyan-ddl.starry-vale-4704.chatgpt.site'),
  title: '心理学保研 DDL · 截止日期速查',
  description: '心理学夏令营、预推免与推免接收截止日期聚合工具。',
  openGraph: {
    title: '心理学保研 DDL · 截止日期速查',
    description: '搜索、筛选并追踪心理学夏令营与预推免截止时间。',
    url: 'https://psychology-baoyan-ddl.starry-vale-4704.chatgpt.site',
    siteName: '心理学保研 DDL',
    locale: 'zh_CN',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: '心理学保研 DDL 截止日期速查' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '心理学保研 DDL · 截止日期速查',
    description: '搜索、筛选并追踪心理学夏令营与预推免截止时间。',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
