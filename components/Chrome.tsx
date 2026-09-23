'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type Locale } from '@/src/i18n/settings';
import { t } from '@/src/i18n/ui';
import { BOOKS, cheapestEdition, bookUrl, formatLabel } from '@/src/lib/products';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

const NAV = [
  { key: 'nav.buy', href: '/buy/' },
  { key: 'nav.blog', href: '/blog/' },
  { key: 'nav.reviews', href: '/reviews/' },
  { key: 'nav.about', href: '/about/' },
  { key: 'nav.contact', href: '/contact/' },
] as const;

function Monogram() {
  return (
    <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 shadow-[0_6px_18px_-8px_rgba(226,100,5,0.8)]">
      <span className="font-display text-[15px] leading-none text-white">ST</span>
    </span>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-6 w-6" aria-hidden="true">
      {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  );
}

export function Header({ locale }: { locale: Locale }) {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const [booksOpen, setBooksOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const seg = pathname.split('/');
  const cur = seg[1] === locale ? seg.slice(2).join('/') : '';
  const isActive = (href: string) => {
    const base = href.replace(/^\/|\/$/g, '');
    return cur.replace(/^\/|\/$/g, '').startsWith(base);
  };

  // Тень шапки при скролле
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Закрытие мобильного меню и дропдауна
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        setBooksOpen(false);
      }
    }
    function onResize() {
      if (window.innerWidth >= 1024) setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setBooksOpen(false);
    }
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    document.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  const openBooks = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setBooksOpen(true);
  };
  const closeBooksSoon = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setBooksOpen(false), 180);
  };

  const navLink = (href: string) =>
    `relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-300 ${
      isActive(href)
        ? 'text-brand-600 dark:text-brand-400'
        : 'text-sand-600 hover:text-sand-900 dark:text-sand-300 dark:hover:text-white'
    }`;

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
          scrolled
            ? 'border-sand-200/80 glass dark:border-sand-800/70'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="shell flex h-16 items-center justify-between gap-4">
          <Link href={`/${locale}/`} className="group flex items-center gap-2.5" aria-label={t(locale, 'brand.name')}>
            <Monogram />
            <span className="hidden sm:block">
              <span className="block font-display text-lg leading-none text-sand-900 dark:text-sand-50">
                {t(locale, 'brand.name')}
              </span>
              <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-sand-400">
                FFL compliance books
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            <div
              ref={ddRef}
              className="relative"
              onMouseEnter={openBooks}
              onMouseLeave={closeBooksSoon}
            >
              <button
                type="button"
                onClick={() => setBooksOpen((v) => !v)}
                aria-expanded={booksOpen}
                aria-haspopup="true"
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-300 ${
                  booksOpen
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-sand-600 hover:text-sand-900 dark:text-sand-300 dark:hover:text-white'
                }`}
              >
                {t(locale, 'nav.books')}
                <Chevron open={booksOpen} />
              </button>

              {booksOpen && (
                <div className="dropdown-in absolute left-0 top-full z-50 w-[26rem] pt-3">
                  <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-[0_30px_60px_-30px_rgba(12,10,9,0.35)] dark:border-sand-800 dark:bg-sand-900">
                    {BOOKS.map((book) => {
                      const cheapest = cheapestEdition(book);
                      return (
                        <Link
                          key={book.slug}
                          href={bookUrl(book, locale)}
                          onClick={() => setBooksOpen(false)}
                          className="group flex items-center gap-4 border-b border-sand-100 px-4 py-3.5 transition-colors duration-200 last:border-0 hover:bg-sand-50 dark:border-sand-800 dark:hover:bg-sand-800/50"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={cheapest.cover}
                            alt=""
                            className="h-14 w-11 shrink-0 rounded object-cover shadow-sm transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-sand-900 dark:text-sand-50">
                              {book[locale].title}
                            </span>
                            <span className="mt-0.5 block font-mono text-[11px] text-sand-500 dark:text-sand-400">
                              {book.pages} pp · {book.trim.split(' ')[0]} · {formatLabel(cheapest.format, locale).toLowerCase()} · {cheapest.price}
                            </span>
                          </span>
                          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-sand-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-brand-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </Link>
                      );
                    })}
                    <Link
                      href={`/${locale}/buy/`}
                      onClick={() => setBooksOpen(false)}
                      className="block bg-sand-50 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-brand-600 transition-colors hover:bg-brand-50 dark:bg-sand-950/40 dark:text-brand-400 dark:hover:bg-sand-900"
                    >
                      {t(locale, 'nav.allBooks')} →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {NAV.map((item) => (
              <Link
                key={item.key}
                href={`/${locale}${item.href}`}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={navLink(item.href)}
              >
                {t(locale, item.key)}
                {isActive(item.href) && (
                  <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-brand-500" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/login/`}
              className="hidden text-xs font-medium text-sand-400 transition-colors hover:text-brand-500 sm:block"
            >
              {t(locale, 'nav.login')}
            </Link>
            <div className="hidden lg:block">
              <LanguageSwitcher locale={locale} />
            </div>
            <ThemeToggle />
            <Link href={`/${locale}/buy/`} className="btn-primary hidden !px-5 !py-2.5 !text-[13px] lg:inline-flex">
              {t(locale, 'nav.buy')}
            </Link>
            <button
              type="button"
              aria-label="Menu"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className="flex items-center justify-center rounded-full border border-sand-200 p-2 text-sand-600 transition-colors hover:border-brand-400 hover:text-brand-500 lg:hidden dark:border-sand-700 dark:text-sand-300"
            >
              <MenuIcon open={open} />
            </button>
          </div>
        </div>
      </header>

      {/* Мобильное меню */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-sand-950/40 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-sand-200 bg-white px-5 py-5 lg:hidden dark:border-sand-800 dark:bg-sand-950">
            <p className="eyebrow mb-3">{t(locale, 'nav.books')}</p>
            <div className="mb-5 space-y-1">
              {BOOKS.map((book) => {
                const cheapest = cheapestEdition(book);
                return (
                  <Link
                    key={book.slug}
                    href={bookUrl(book, locale)}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-sand-50 dark:hover:bg-sand-900"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cheapest.cover} alt="" className="h-12 w-9 rounded object-cover" loading="lazy" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-sand-900 dark:text-sand-50">
                        {book[locale].title}
                      </span>
                      <span className="font-mono text-[11px] text-sand-500 dark:text-sand-400">
                        {book.pages} pp · {cheapest.price}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="hairline mb-4" />

            <nav className="flex flex-col gap-0.5">
              {NAV.map((item) => (
                <Link
                  key={item.key}
                  href={`/${locale}${item.href}`}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-3 py-3 text-[15px] font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400'
                      : 'text-sand-700 hover:bg-sand-50 dark:text-sand-200 dark:hover:bg-sand-900'
                  }`}
                >
                  {t(locale, item.key)}
                </Link>
              ))}
              <Link
                href={`/${locale}/login/`}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-[15px] font-medium text-sand-500 transition-colors hover:bg-sand-50 dark:text-sand-400 dark:hover:bg-sand-900"
              >
                {t(locale, 'nav.login')}
              </Link>
            </nav>

            <div className="mt-5 flex items-center justify-between border-t border-sand-200 pt-4 dark:border-sand-800">
              <LanguageSwitcher locale={locale} />
              <Link href={`/${locale}/buy/`} onClick={() => setOpen(false)} className="btn-primary !py-2.5">
                {t(locale, 'nav.buy')}
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export function Footer({ locale }: { locale: Locale }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-sand-200 bg-white dark:border-sand-800 dark:bg-sand-950">
      <div className="shell grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <Monogram />
            <span className="font-display text-lg text-sand-900 dark:text-sand-50">
              {t(locale, 'brand.name')}
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-sand-500 dark:text-sand-400">
            {t(locale, 'brand.tagline')}
          </p>
          <p className="mt-4 max-w-md text-xs leading-relaxed text-sand-400 dark:text-sand-500">
            {t(locale, 'footer.disclaimer')}
          </p>
        </div>

        <div>
          <h3 className="eyebrow">{t(locale, 'nav.books')}</h3>
          <nav className="mt-4 flex flex-col gap-2.5">
            {BOOKS.map((book) => (
              <Link
                key={book.slug}
                href={bookUrl(book, locale)}
                className="text-sm text-sand-600 transition-colors hover:text-brand-600 dark:text-sand-400 dark:hover:text-brand-400"
              >
                {book[locale].title}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h3 className="eyebrow">{t(locale, 'nav.buy')}</h3>
          <nav className="mt-4 flex flex-col gap-2.5">
            {NAV.map((item) => (
              <Link
                key={item.key}
                href={`/${locale}${item.href}`}
                className="text-sm text-sand-600 transition-colors hover:text-brand-600 dark:text-sand-400 dark:hover:text-brand-400"
              >
                {t(locale, item.key)}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-sand-200 dark:border-sand-800">
        <div className="shell flex flex-col gap-2 py-6 text-xs text-sand-400 sm:flex-row sm:items-center sm:justify-between dark:text-sand-500">
          <span>
            © {year} {t(locale, 'brand.name')}. {t(locale, 'footer.rights')}
          </span>
          <span className="font-mono">{t(locale, 'footer.made')}</span>
        </div>
      </div>
    </footer>
  );
}
