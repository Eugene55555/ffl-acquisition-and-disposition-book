import type { ReactNode } from 'react';
import './globals.css';
import { defaultLocale } from '@/src/i18n/settings';
import { siteUrl } from '@/src/lib/seo';

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
  icons: {
    icon: [
      { url: '/ffl-acquisition-and-disposition-book/icon-192.png', sizes: '192x192' },
      { url: '/ffl-acquisition-and-disposition-book/icon-512.png', sizes: '512x512' },
    ],
    apple: '/ffl-acquisition-and-disposition-book/icon-192.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="alternate" type="application/rss+xml" title="Blog RSS" href={siteUrl() + '/feed.xml'} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-orange-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        {children}
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
      </body>
    </html>
  );
}
