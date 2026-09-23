import type { Metadata } from 'next';
import { t } from '@/src/i18n/ui';
import { locales, type Locale } from '@/src/i18n/settings';
import { BOOKS, cheapestEdition, formatLabel } from '@/src/lib/products';
import { alternatesFor, OG_IMAGE } from '@/src/lib/seo';
import { Reveal } from '@/components/Reveal';
import { Comments } from '@/components/Comments';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  return {
    title: t(locale, 'seo.reviews.title'),
    description: t(locale, 'seo.reviews.desc'),
    alternates: alternatesFor('/reviews'),
    openGraph: {
      title: t(locale, 'seo.reviews.title'),
      description: t(locale, 'seo.reviews.desc'),
      locale,
      images: [OG_IMAGE[locale]],
    },
    twitter: { images: [OG_IMAGE[locale]] },
  };
}

export default function ReviewsPage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;

  return (
    <div>
      <section className="relative overflow-hidden pb-14 pt-14">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 right-1/3 h-[30rem] w-[30rem] animate-glow rounded-full bg-brand-500/15 blur-[120px]" />
        </div>
        <div className="shell max-w-3xl">
          <Reveal>
            <p className="eyebrow">{t(locale, 'nav.reviews')}</p>
            <h1 className="display mt-4 text-4xl text-sand-900 sm:text-6xl dark:text-sand-50">
              {t(locale, 'reviews.title')}
            </h1>
            <p className="lede mt-6">{t(locale, 'reviews.subtitle')}</p>
            <p className="mt-6 rounded-2xl border border-sand-200 bg-white/60 px-5 py-4 text-sm leading-relaxed text-sand-500 dark:border-sand-800 dark:bg-sand-900/40 dark:text-sand-400">
              {t(locale, 'reviews.amazonNote')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ==== Ссылки на отзывы покупателей на Amazon ==== */}
      <section className="pb-16">
        <div className="shell max-w-3xl">
          <Reveal delay={1}>
            <h2 className="eyebrow">{t(locale, 'nav.books')}</h2>
            <div className="mt-5 space-y-3">
              {BOOKS.map((book) => {
                const cheapest = cheapestEdition(book);
                return (
                  <a
                    key={book.slug}
                    href={cheapest.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="surface group flex items-center gap-4 p-4 transition-all duration-500 hover:-translate-y-1 hover:border-brand-300"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cheapest.cover}
                      alt=""
                      className="h-16 w-12 shrink-0 rounded object-cover shadow-sm transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-semibold text-sand-900 dark:text-sand-50">
                        {book[locale].title}
                      </span>
                      <span className="mt-1 block font-mono text-[11px] text-sand-500 dark:text-sand-400">
                        {book.pages} pp · {formatLabel(cheapest.format, locale).toLowerCase()} · {cheapest.price}
                      </span>
                    </span>
                    <span className="hidden text-sm font-semibold text-brand-600 sm:block dark:text-brand-400">
                      Amazon →
                    </span>
                  </a>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==== Комментарии ==== */}
      <section className="section border-t border-sand-200 dark:border-sand-800">
        <div className="shell max-w-3xl">
          <Reveal>
            <h2 className="display text-3xl text-sand-900 sm:text-4xl dark:text-sand-50">
              {t(locale, 'reviews.commentsTitle')}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-sand-500 dark:text-sand-400">
              {t(locale, 'reviews.commentsNote')}
            </p>
          </Reveal>
          <div className="giscus-slot mt-8">
            <Comments locale={locale} />
          </div>
        </div>
      </section>
    </div>
  );
}
