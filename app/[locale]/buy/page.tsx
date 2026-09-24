import Link from 'next/link';
import type { Metadata } from 'next';
import { t } from '@/src/i18n/ui';
import { locales, type Locale } from '@/src/i18n/settings';
import { BOOKS, bookUrl, formatLabel, cheapestEdition, seriesLabel } from '@/src/lib/products';
import { alternatesFor, OG_IMAGE } from '@/src/lib/seo';
import { Reveal } from '@/components/Reveal';
import { Parallax } from '@/components/Parallax';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  return {
    title: t(locale, 'seo.buy.title'),
    description: t(locale, 'seo.buy.desc'),
    alternates: alternatesFor('/buy'),
    openGraph: {
      title: t(locale, 'seo.buy.title'),
      description: t(locale, 'seo.buy.desc'),
      locale,
      images: [OG_IMAGE[locale]],
    },
    twitter: { images: [OG_IMAGE[locale]] },
  };
}

export default function BuyPage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;

  return (
    <div>
      <section className="relative overflow-hidden pb-16 pt-14">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/3 h-[32rem] w-[32rem] animate-glow rounded-full bg-brand-500/15 blur-[120px]" />
        </div>
        <div className="shell">
          <Reveal>
            <p className="eyebrow">{t(locale, 'nav.buy')}</p>
            <h1 className="display mt-4 max-w-3xl text-4xl text-sand-900 sm:text-6xl dark:text-sand-50">
              {localTitle(locale)}
            </h1>
            <p className="lede mt-6 max-w-2xl">{t(locale, 'buy.subtitle')}</p>
          </Reveal>
        </div>
      </section>

      {/* ==== Все книги и издания ==== */}
      <section className="pb-8">
        <div className="shell space-y-16">
          {BOOKS.map((book, idx) => {
            const text = book[locale];
            const cover = cheapestEdition(book).cover;
            return (
              <Reveal key={book.slug} delay={(idx % 2 === 0 ? 1 : 2) as 1 | 2}>
                <article className="surface grid gap-10 overflow-hidden p-6 sm:p-8 lg:grid-cols-[0.75fr_1.25fr]">
                  <Parallax speed={0.05}>
                    <div className="relative mx-auto max-w-[15rem] lg:mx-0">
                      <div aria-hidden="true" className="absolute inset-6 rounded-full bg-brand-400/20 blur-3xl" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cover}
                        alt={text.title}
                        className="relative w-full rounded-lg shadow-[0_30px_60px_-28px_rgba(12,10,9,0.55)]"
                        loading="lazy"
                      />
                    </div>
                  </Parallax>

                  <div>
                    <p className="eyebrow">{seriesLabel(book.series, locale)}</p>
                    <h2 className="display mt-3 text-3xl text-sand-900 dark:text-sand-50">
                      <Link href={bookUrl(book, locale)} className="link-sweep">
                        {text.title}
                      </Link>
                    </h2>
                    <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-sand-400">
                      {text.subtitle}
                    </p>
                    <p className="mt-5 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
                      {text.blurb}
                    </p>

                    <div className="mt-7 grid gap-4 sm:grid-cols-2">
                      {book.editions.map((edition) => (
                        <div
                          key={edition.asin}
                          className="group rounded-2xl border border-sand-200 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-brand-300 dark:border-sand-800"
                        >
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-sm font-semibold text-sand-900 dark:text-sand-50">
                              {formatLabel(edition.format, locale)}
                            </span>
                            <span className="font-display text-xl text-sand-900 dark:text-sand-50">
                              {edition.price}
                            </span>
                          </div>
                          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-sand-400">
                            ASIN {edition.asin}
                          </p>
                          <a
                            href={edition.amazonUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary mt-4 w-full !py-2.5 !text-[13px]"
                          >
                            {t(locale, 'buy.cta')}
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M7 17 17 7M9 7h8v8" />
                            </svg>
                          </a>
                        </div>
                      ))}
                    </div>

                    <Link
                      href={bookUrl(book, locale)}
                      className="link-sweep mt-6 inline-flex text-sm font-semibold text-brand-600 dark:text-brand-400"
                    >
                      Full book details →
                    </Link>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ==== Сравнение ==== */}
      <section className="section">
        <div className="shell max-w-4xl">
          <Reveal>
            <h2 className="display text-3xl text-sand-900 sm:text-4xl dark:text-sand-50">
              Compare
            </h2>
          </Reveal>
          <Reveal delay={1}>
            {/* Телефон: карточки вместо горизонтальной прокрутки таблицы */}
            <div className="mt-8 space-y-4 sm:hidden">
              {BOOKS.map((book) => (
                <div key={book.slug} className="surface p-5">
                  <Link
                    href={bookUrl(book, locale)}
                    className="text-base font-semibold leading-snug text-sand-900 dark:text-sand-50"
                  >
                    {book[locale].title}
                  </Link>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    {[
                      { k: t(locale, 'book.pages'), v: String(book.pages) },
                      {
                        k: t(locale, 'book.entries'),
                        v: book.entries ? book.entries.toLocaleString('en-US') : '—',
                      },
                      { k: t(locale, 'book.trim'), v: book.trim },
                    ].map((row) => (
                      <div key={row.k}>
                        <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-sand-400">{row.k}</dt>
                        <dd className="mt-1 text-sand-700 dark:text-sand-300">{row.v}</dd>
                      </div>
                    ))}
                    <div className="col-span-2">
                      <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-sand-400">
                        Price
                      </dt>
                      <dd className="mt-1 space-y-0.5 font-mono text-sm text-sand-700 dark:text-sand-300">
                        {book.editions.map((e) => (
                          <span key={e.asin} className="block">
                            {formatLabel(e.format, locale)} — {e.price}
                          </span>
                        ))}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>

            <div className="surface mt-8 hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[36rem] text-sm">
                <thead>
                  <tr className="border-b border-sand-200 text-left dark:border-sand-800">
                    <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.16em] text-sand-400">
                      {t(locale, 'nav.books')}
                    </th>
                    <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.16em] text-sand-400">
                      {t(locale, 'book.pages')}
                    </th>
                    <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.16em] text-sand-400">
                      {t(locale, 'book.entries')}
                    </th>
                    <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.16em] text-sand-400">
                      {t(locale, 'book.trim')}
                    </th>
                    <th className="px-6 py-4 text-right font-mono text-[10px] uppercase tracking-[0.16em] text-sand-400">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200 dark:divide-sand-800">
                  {BOOKS.map((book) => (
                    <tr key={book.slug} className="transition-colors hover:bg-sand-50 dark:hover:bg-sand-800/30">
                      <td className="px-6 py-4">
                        <Link href={bookUrl(book, locale)} className="link-sweep font-medium text-sand-900 dark:text-sand-50">
                          {book[locale].title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sand-600 dark:text-sand-400">{book.pages}</td>
                      <td className="px-6 py-4 text-sand-600 dark:text-sand-400">
                        {book.entries ? book.entries.toLocaleString('en-US') : '—'}
                      </td>
                      <td className="px-6 py-4 text-sand-600 dark:text-sand-400">{book.trim}</td>
                      <td className="px-6 py-4 text-right font-mono text-sand-700 dark:text-sand-300">
                        {book.editions.map((e) => (
                          <span key={e.asin} className="block whitespace-nowrap">
                            {formatLabel(e.format, locale)} — {e.price}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
          <Reveal delay={2}>
            <p className="mt-6 text-xs leading-relaxed text-sand-400 dark:text-sand-500">
              {t(locale, 'footer.disclaimer')}
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function localTitle(locale: Locale): string {
  return 'Three books. Six editions.';
}
