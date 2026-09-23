import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { t } from '@/src/i18n/ui';
import { locales, type Locale } from '@/src/i18n/settings';
import { BOOKS, getBook, bookUrl, formatLabel, cheapestEdition, seriesLabel } from '@/src/lib/products';
import { alternatesFor, OG_IMAGE } from '@/src/lib/seo';
import { Reveal } from '@/components/Reveal';
import { Parallax } from '@/components/Parallax';
import { Comments } from '@/components/Comments';

export function generateStaticParams() {
  const out: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const book of BOOKS) out.push({ locale, slug: book.slug });
  }
  return out;
}

export function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Metadata {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  const book = getBook(params.slug);
  if (!book) return {};
  const text = book[locale];
  const desc = text.blurb.slice(0, 180);
  const coverAbs = `${process.env.SITE_URL || 'https://eugene55555.github.io/ffl-acquisition-and-disposition-book'}${cheapestEdition(book).cover}`;
  return {
    title: text.title,
    description: desc,
    alternates: alternatesFor(`/books/${book.slug}`),
    openGraph: {
      title: text.title,
      description: desc,
      locale,
      type: 'website',
      images: [coverAbs || OG_IMAGE[locale]],
    },
    twitter: { images: [coverAbs || OG_IMAGE[locale]] },
  };
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function BookPage({ params }: { params: { locale: string; slug: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  const book = getBook(params.slug);
  if (!book) notFound();

  const text = book[locale];
  const others = BOOKS.filter((b) => b.slug !== book.slug);
  const cover = cheapestEdition(book).cover;

  const specs: { label: string; value: string }[] = [
    { label: t(locale, 'book.pages'), value: String(book.pages) },
    ...(book.entries ? [{ label: t(locale, 'book.entries'), value: book.entries.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US') }] : []),
    { label: t(locale, 'book.trim'), value: book.trim },
    { label: t(locale, 'book.binding'), value: book.editions.map((e) => formatLabel(e.format, locale)).join(' · ') },
    { label: t(locale, 'book.regulation'), value: book.regulation },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: text.title,
    description: text.blurb,
    inLanguage: locale,
    numberOfPages: book.pages,
    bookFormat: 'https://schema.org/Paperback',
    offers: book.editions.map((e) => ({
      '@type': 'Offer',
      price: e.price.replace('$', ''),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: e.amazonUrl,
      seller: { '@type': 'Organization', name: 'Amazon' },
    })),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ==== Герой книги ==== */}
      <section className="relative overflow-hidden pb-16 pt-8 sm:pt-12">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 right-1/4 h-[32rem] w-[32rem] animate-glow rounded-full bg-brand-500/15 blur-[120px]" />
        </div>

        <div className="shell">
          <Link href={`/${locale}/buy/`} className="link-sweep text-sm text-sand-500 dark:text-sand-400">
            {t(locale, 'book.allBooks')}
          </Link>

          <div className="mt-8 grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
            <Parallax speed={0.07}>
              <div className="relative mx-auto max-w-xs lg:mx-0">
                <div aria-hidden="true" className="absolute inset-6 rounded-full bg-brand-400/25 blur-3xl" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cover}
                  alt={`${text.title} — ${formatLabel(cheapestEdition(book).format, locale)}`}
                  className="relative w-full rounded-xl shadow-[0_40px_70px_-30px_rgba(12,10,9,0.6)]"
                />
                <div className="relative mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
                  <span className="chip">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {t(locale, 'book.inStock')}
                  </span>
                  <span className="chip">{seriesLabel(book.series, locale)}</span>
                </div>
              </div>
            </Parallax>

            <div>
              <Reveal>
                <p className="eyebrow">{book.regulation}</p>
                <h1 className="display mt-4 text-4xl text-sand-900 sm:text-5xl dark:text-sand-50">
                  {text.title}
                </h1>
                <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-sand-400">
                  {text.subtitle}
                </p>
                <p className="lede mt-6 max-w-2xl">{text.blurb}</p>
              </Reveal>

              <Reveal delay={1}>
                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {text.highlights.map((h) => (
                    <li key={h} className="flex gap-2.5 text-sm leading-relaxed text-sand-700 dark:text-sand-300">
                      <CheckIcon />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>

              {/* ==== Издания / покупка ==== */}
              <Reveal delay={2}>
                <h2 className="eyebrow mt-12">{t(locale, 'book.chooseEdition')}</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {book.editions.map((edition) => (
                    <div
                      key={edition.asin}
                      className="surface group flex flex-col justify-between p-5 transition-all duration-500 hover:-translate-y-1 hover:border-brand-300"
                    >
                      <div>
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-[15px] font-semibold text-sand-900 dark:text-sand-50">
                            {formatLabel(edition.format, locale)}
                          </span>
                          <span className="font-display text-2xl text-sand-900 dark:text-sand-50">
                            {edition.price}
                          </span>
                        </div>
                        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-sand-400">
                          ASIN {edition.asin}
                        </p>
                      </div>
                      <a
                        href={edition.amazonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary mt-5 w-full !py-2.5 !text-[13px]"
                      >
                        {t(locale, 'book.buyOnAmazon')}
                        <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M7 17 17 7M9 7h8v8" />
                        </svg>
                      </a>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ==== Что внутри + характеристики ==== */}
      <section className="section border-t border-sand-200 bg-white dark:border-sand-800 dark:bg-sand-900/20">
        <div className="shell grid gap-14 lg:grid-cols-2">
          <Reveal>
            <div>
              <p className="eyebrow">{t(locale, 'book.inside')}</p>
              <h2 className="display mt-4 text-3xl text-sand-900 sm:text-4xl dark:text-sand-50">
                {book.pages} {locale === 'ru' ? 'страниц готового учёта' : 'pages of ready layout'}
              </h2>
              <ul className="mt-8 space-y-4">
                {text.inside.map((row) => (
                  <li key={row} className="flex gap-3 border-b border-sand-200 pb-4 text-sm leading-relaxed text-sand-700 last:border-0 dark:border-sand-800 dark:text-sand-300">
                    <CheckIcon />
                    <span>{row}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="surface overflow-hidden">
              <h2 className="eyebrow border-b border-sand-200 px-6 py-4 dark:border-sand-800">
                {t(locale, 'book.specs')}
              </h2>
              <dl className="divide-y divide-sand-200 dark:divide-sand-800">
                {specs.map((s) => (
                  <div key={s.label} className="flex items-center justify-between gap-6 px-6 py-4">
                    <dt className="text-sm text-sand-500 dark:text-sand-400">{s.label}</dt>
                    <dd className="text-right text-sm font-medium text-sand-900 dark:text-sand-100">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==== FAQ книги ==== */}
      <section className="section">
        <div className="shell max-w-3xl">
          <Reveal>
            <h2 className="display text-3xl text-sand-900 sm:text-4xl dark:text-sand-50">
              {t(locale, 'home.faqTitle')}
            </h2>
          </Reveal>
          <Reveal delay={1}>
            <div className="mt-8 divide-y divide-sand-200 overflow-hidden rounded-2xl border border-sand-200 bg-white dark:divide-sand-800 dark:border-sand-800 dark:bg-sand-900/40">
              {text.faq.map((f) => (
                <details key={f.q} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 transition-colors hover:bg-sand-50 dark:hover:bg-sand-800/40">
                    <span className="text-[15px] font-semibold text-sand-900 dark:text-sand-50">{f.q}</span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sand-200 text-sand-500 transition-all duration-300 group-open:rotate-45 group-open:border-brand-400 group-open:text-brand-500 dark:border-sand-700 dark:text-sand-400">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 pr-16 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
                    {f.a}
                  </div>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==== Комментарии / вопросы ==== */}
      <section className="section border-t border-sand-200 dark:border-sand-800">
        <div className="shell max-w-3xl">
          <Reveal>
            <p className="eyebrow">{t(locale, 'book.commentsTitle')}</p>
            <p className="mt-3 text-sm leading-relaxed text-sand-500 dark:text-sand-400">
              {t(locale, 'book.commentsNote')}
            </p>
          </Reveal>
          <div className="cusdis-wrapper mt-8">
            <Comments locale={locale} />
          </div>
        </div>
      </section>

      {/* ==== Другие книги ==== */}
      <section className="section border-t border-sand-200 bg-white dark:border-sand-800 dark:bg-sand-900/20">
        <div className="shell">
          <Reveal>
            <h2 className="display text-3xl text-sand-900 sm:text-4xl dark:text-sand-50">
              {t(locale, 'book.related')}
            </h2>
          </Reveal>
          <div className="mt-10">
            <Reveal delay={1}>
              <div className="grid gap-6 sm:grid-cols-2">
                {others.map((b) => (
                  <Link key={b.slug} href={bookUrl(b, locale)} className="book-card group flex-row">
                    <div className="book-card__media !aspect-auto w-32 shrink-0 sm:w-40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cheapestEdition(b).cover} alt={b[locale].title} loading="lazy" />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="eyebrow">{b.pages} pp</p>
                      <h3 className="mt-2 text-base font-semibold leading-snug text-sand-900 dark:text-sand-50">
                        {b[locale].title}
                      </h3>
                      <p className="mt-2 line-clamp-2 flex-1 text-sm text-sand-600 dark:text-sand-400">
                        {b[locale].blurb}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
                        {locale === 'ru' ? 'Подробнее' : 'Details'}
                        <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
