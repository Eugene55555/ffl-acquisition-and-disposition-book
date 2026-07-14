import Link from 'next/link';
import { locales, localeLabels, type Locale } from '@/src/i18n/settings';

export function Header({ locale }: { locale: Locale }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <a href={`/${locale}/`} className="flex items-center gap-2">
          <span className="inline-block h-7 w-7 rounded-lg bg-[linear-gradient(to_right,#FF512F,#F09819)]" />
          <span className="text-lg font-bold text-gray-900">Blog</span>
        </a>
        <nav className="flex items-center gap-5 text-sm font-medium text-gray-600">
          <a className="hover:text-orange-500" href={`/${locale}/blog/`}>Blog</a>
          <a className="hover:text-orange-500" href={`/${locale}/about/`}>About</a>
          <a className="hover:text-orange-500" href={`/${locale}/buy/`}>Buy</a>
          <a className="hover:text-orange-500" href={`/${locale}/contact/`}>Contact</a>
          <span className="ml-2 flex gap-1">
            {locales.map((l) => (
              <a
                key={l}
                href={`/${l}/`}
                className={`rounded px-2 py-1 text-xs ${
                  l === locale ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-orange-500'
                }`}
              >
                {localeLabels[l]}
              </a>
            ))}
          </span>
        </nav>
      </div>
    </header>
  );
}

export function Footer({ locale }: { locale: Locale }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <span>© {year} Blog. {locale === 'ru' ? 'Все права защищены.' : 'All rights reserved.'}</span>
        <nav className="flex gap-4">
          <a className="hover:text-orange-500" href={`/${locale}/blog/`}>Blog</a>
          <a className="hover:text-orange-500" href={`/${locale}/about/`}>About</a>
          <a className="hover:text-orange-500" href={`/${locale}/buy/`}>Buy</a>
          <a className="hover:text-orange-500" href={`/${locale}/contact/`}>Contact</a>
        </nav>
      </div>
    </footer>
  );
}
