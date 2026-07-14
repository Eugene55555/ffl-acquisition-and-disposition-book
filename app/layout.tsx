import type { ReactNode } from 'react';
import './globals.css';
import { defaultLocale } from '@/src/i18n/settings';

export const metadata = {
  title: 'Blog',
  description: 'A fast, clean static blog.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={defaultLocale}>
      <body>{children}</body>
    </html>
  );
}
