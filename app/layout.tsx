import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://xyl-18.github.io/xinlixue-baoyan-ddl/'),
  title: '心理学保研 DDL · 截止日期速查',
  description: '985/211 院校心理学预推免、推免接收与夏令营截止日期聚合工具。',
  openGraph: {
    title: '心理学保研 DDL · 截止日期速查',
    description: '搜索、筛选并追踪 985/211 院校心理学预推免截止时间。',
    url: 'https://xyl-18.github.io/xinlixue-baoyan-ddl/',
    siteName: '心理学保研 DDL',
    locale: 'zh_CN',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: '心理学保研 DDL 截止日期速查' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '心理学保研 DDL · 截止日期速查',
    description: '搜索、筛选并追踪 985/211 院校心理学预推免截止时间。',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
