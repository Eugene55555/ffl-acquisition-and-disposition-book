import Link from 'next/link';
import type { Metadata } from 'next';
import { t } from '@/src/i18n/ui';
import { locales, type Locale } from '@/src/i18n/settings';
import { alternatesFor, OG_IMAGE } from '@/src/lib/seo';
import { Reveal } from '@/components/Reveal';
import { BOOKS, bookUrl, cheapestEdition } from '@/src/lib/products';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  return {
    title: t(locale, 'seo.about.title'),
    description: t(locale, 'seo.about.desc'),
    alternates: alternatesFor('/about'),
    openGraph: {
      title: t(locale, 'seo.about.title'),
      description: t(locale, 'seo.about.desc'),
      locale,
      images: [OG_IMAGE[locale]],
    },
    twitter: { images: [OG_IMAGE[locale]] },
  };
}

const COPY = {
  en: {
    eyebrow: 'About',
    title: 'Record books built around one paragraph of the regulation.',
    lede:
      'These books exist because a compliance record is a form, not a notebook. Every page is laid out to match the acquisition and disposition layout inspectors look for under 27 CFR § 478.125 — so the writing is the only thing left to do.',
    points: [
      {
        h: 'One job, done properly',
        p: 'No filler pages, no “handy conversion tables”, no journal prompts. Pre-formatted A&D entries with date, name, address and serial fields — and a notes line when a transaction needs context.',
      },
      {
        h: 'Paper, not a subscription',
        p: 'A physical bound log costs once. No per-seat licence, no cloud sync to break, no export limits at audit time, nothing to cancel.',
      },
      {
        h: 'Two sizes, because shops differ',
        p: 'A 120-page log for a low-volume gunsmith; 200 pages and 1,372 entries for a shop that would rather not start a second book mid-year; and a wide 11 × 8.5 landscape edition for writing full addresses on one line.',
      },
      {
        h: 'Honest about what this is not',
        p: 'No log book is individually approved by ATF, and nobody can sell you “compliance”. These are tools formatted to the record layout the regulation describes. Verify the current text at eCFR.gov; this is not legal advice.',
      },
    ],
    booksTitle: 'The collection',
    ctaTitle: 'Pick the edition that matches your counter',
    cta: 'Shop the collection',
  },
  ru: {
    eyebrow: 'О нас',
    title: 'Журналы, построенные вокруг одного абзаца регламента.',
    lede:
      'Эти книги появились потому, что запись соответствия — это форма, а не блокнот. Каждая страница свёрстана под раскладку приобретения и отчуждения, которую проверяют инспекторы в рамках 27 CFR § 478.125. Остаётся только заполнять.',
    points: [
      {
        h: 'Одна задача — зато сделанная как надо',
        p: 'Без страниц-заполнителей, «полезных таблиц» и дневниковых подсказок. Готовые строки A&D с полями даты, имени, адреса и серийного номера — и строка заметок, когда у сделки есть контекст.',
      },
      {
        h: 'Бумага, а не подписка',
        p: 'Физический журнал стоит один раз. Ни лицензий на пользователя, ни облачной синхронизации, которая ломается, ни лимитов на выгрузку в момент проверки, ни того, что нужно отменять.',
      },
      {
        h: 'Два размера — потому что магазины разные',
        p: '120 страниц для оружейника с небольшим потоком; 200 страниц и 1 372 строки для магазина, которому не хочется заводить второй журнал посреди года; и широкое альбомное издание 11 × 8.5, чтобы адрес влезал в одну строку.',
      },
      {
        h: 'Честно о том, чем это не является',
        p: 'Ни один подобный журнал не одобряется ATF поштучно, и «соответствие» нельзя купить. Это инструменты, свёрстанные под раскладку записей из регламента. Проверяйте актуальный текст на eCFR.gov; это не юридическая консультация.',
      },
    ],
    booksTitle: 'Коллекция',
    ctaTitle: 'Выберите издание под свой прилавок',
    cta: 'Смотреть коллекцию',
  },
} as const;

export default function AboutPage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  const c = COPY[locale];

  return (
    <div>
      <section className="relative overflow-hidden pb-16 pt-14">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/4 h-[30rem] w-[30rem] animate-glow rounded-full bg-brand-500/15 blur-[120px]" />
        </div>
        <div className="shell max-w-3xl">
          <Reveal>
            <p className="eyebrow">{c.eyebrow}</p>
            <h1 className="display mt-4 text-4xl text-sand-900 sm:text-5xl dark:text-sand-50">{c.title}</h1>
            <p className="lede mt-6">{c.lede}</p>
          </Reveal>
        </div>
      </section>

      <section className="pb-16">
        <div className="shell max-w-3xl">
          <div className="space-y-10">
            {c.points.map((p, i) => (
              <Reveal key={p.h} delay={(i % 3 === 0 ? 1 : i % 3 === 1 ? 2 : 3) as 1 | 2 | 3}>
                <div className="border-l-2 border-brand-500/40 pl-6">
                  <h2 className="text-lg font-semibold text-sand-900 dark:text-sand-50">{p.h}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-sand-600 dark:text-sand-400">{p.p}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section border-t border-sand-200 bg-white dark:border-sand-800 dark:bg-sand-900/20">
        <div className="shell">
          <Reveal>
            <h2 className="display text-3xl text-sand-900 sm:text-4xl dark:text-sand-50">{c.booksTitle}</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {BOOKS.map((book) => (
              <Reveal key={book.slug} delay={1}>
                <Link href={bookUrl(book, locale)} className="book-card group">
                  <div className="book-card__media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cheapestEdition(book).cover} alt={book[locale].title} loading="lazy" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-base font-semibold leading-snug text-sand-900 dark:text-sand-50">
                      {book[locale].title}
                    </h3>
                    <span className="mt-3 font-mono text-xs text-sand-500 dark:text-sand-400">
                      {book.pages} pp · {cheapestEdition(book).price}
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <Reveal>
            <div className="surface flex flex-col items-start justify-between gap-6 p-10 sm:flex-row sm:items-center">
              <h2 className="display max-w-lg text-3xl text-sand-900 dark:text-sand-50">{c.ctaTitle}</h2>
              <Link href={`/${locale}/buy/`} className="btn-primary shrink-0">
                {c.cta}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
