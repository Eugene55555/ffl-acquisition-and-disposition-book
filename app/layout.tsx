import type { ReactNode } from 'react';
import './globals.css';
import { defaultLocale } from '@/src/i18n/settings';

// Блокирующий скрипт: ставит .dark на <html> ДО отрисовки, чтобы не было вспышки светлой темы.
const themeScript = `
(function () {
  try {
    var t = localStorage.getItem('theme');
    var dark = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export const metadata = {
  title: 'Blog',
  description: 'A fast, clean static blog.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
