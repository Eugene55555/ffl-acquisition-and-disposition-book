'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type Locale } from '@/src/i18n/settings';
import { t } from '@/src/i18n/ui';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

const NAV = [
  { key: 'nav.blog', href: '/blog/' },
  { key: 'nav.about', href: '/about/' },
  { key: 'nav.buy', href: '/buy/' },
  { key: 'nav.contact', href: '/contact/' },
] as const;

function Logo() {
  return (
    <span className="inline-block h-7 w-7 rounded-lg bg-[linear-gradient(to_right,#FF512F,#F09819)]" />
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-6 w-6" aria-hidden="true">
      {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  );
}

function useMobileMenu() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
    };
  }, []);
  return [open, setOpen] as const;
}

export function Header({ locale }: { locale: Locale }) {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useMobileMenu();

  // Текущий под-путь без языкового сегмента: /en/blog/x -> 'blog/x'
  const seg = pathname.split('/');
  const cur = seg[1] === locale ? seg.slice(2).join('/') : '';
  const isHome = cur === '' || cur === '/';

  const isActive = (href: string) => {
    const base = href.replace(/^\/|\/$/g, '');
    return cur.replace(/^\/|\/$/g, '').startsWith(base);
  };

  const linkClass = (href: string) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive(href)
        ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10'
        : 'text-gray-600 hover:bg-gray-100 hover:text-orange-500 dark:text-gray-300 dark:hover:bg-gray-800'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href={`/${locale}/`} className="flex items-center gap-2" aria-label="Home">
          <Logo />
          <span className="text-lg font-bold text-gray-900 dark:text-white">Blog</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={`/${locale}${item.href}`}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={linkClass(item.href)}
            >
              {t(locale, item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <LanguageSwitcher locale={locale} />
          </div>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="flex items-center justify-center rounded-md border border-gray-200 p-2 text-gray-600 transition hover:border-orange-400 hover:text-orange-500 md:hidden dark:border-gray-700 dark:text-gray-300"
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <>
          {/* Затемняющий оверлей: клик вне меню закрывает его */}
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-50 border-t border-gray-200 px-4 py-3 md:hidden dark:border-gray-800">
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.key}
                  href={`/${locale}${item.href}`}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={linkClass(item.href)}
                >
                  {t(locale, item.key)}
                </Link>
              ))}
            </nav>
            <div className="mt-3 flex items-center justify-end gap-2 border-t border-gray-200 pt-3 dark:border-gray-800">
              <ThemeToggle />
              <LanguageSwitcher locale={locale} />
            </div>
          </div>
        </>
      )}
    </header>
  );
}

export function Footer({ locale }: { locale: Locale }) {
  const year = new Date().getFullYear();
  const navItems = NAV;
  return (
    <footer className="mt-20 border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-bold text-gray-900 dark:text-white">Blog</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-gray-500 dark:text-gray-400">
            {t(locale, 'footer.tagline')}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t(locale, 'nav.blog')}</h3>
          <nav className="mt-3 flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
            {navItems.map((item) => (
              <Link key={item.key} className="hover:text-orange-500" href={`/${locale}${item.href}`}>
                {t(locale, item.key)}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {t(locale, 'footer.contact')}
          </h3>
          <a
            href="mailto:hello@example.com"
            className="mt-3 block text-sm text-gray-500 hover:text-orange-500 dark:text-gray-400"
          >
            hello@example.com
          </a>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between dark:text-gray-400">
          <span>© {year} Blog. {locale === 'ru' ? 'Все права защищены.' : 'All rights reserved.'}</span>
          <span className="text-xs">{t(locale, 'footer.made')}</span>
        </div>
      </div>
    </footer>
  );
}
