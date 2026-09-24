import Link from 'next/link';
import type { Metadata } from 'next';
import { t } from '@/src/i18n/ui';
import { locales, type Locale } from '@/src/i18n/settings';
import { getAllPosts } from '@/src/lib/posts';
import { alternatesFor, OG_IMAGE } from '@/src/lib/seo';
import { BOOKS, bookUrl, cheapestEdition, formatLabel } from '@/src/lib/products';
import { Reveal } from '@/components/Reveal';
import { Parallax } from '@/components/Parallax';
import { BookGrid } from '@/components/BookCard';
import { BookShowcase, type ShowcaseItem } from '@/components/BookShowcase';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  return {
    title: t(locale, 'seo.home.title'),
    description: t(locale, 'seo.home.desc'),
    alternates: alternatesFor('/'),
    openGraph: {
      title: t(locale, 'seo.home.title'),
      description: t(locale, 'seo.home.desc'),
      locale,
      images: [OG_IMAGE[locale]],
    },
    twitter: { images: [OG_IMAGE[locale]] },
  };
}

function ArrowIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const WHY = [
  { title: 'home.why1Title', body: 'home.why1Body', icon: 'alert' },
  { title: 'home.why2Title', body: 'home.why2Body', icon: 'book' },
  { title: 'home.why3Title', body: 'home.why3Body', icon: 'columns' },
  { title: 'home.why4Title', body: 'home.why4Body', icon: 'tag' },
] as const;

function WhyIcon({ name }: { name: string }) {
  const common = {
    viewBox: '0 0 24 24',
    className: 'h-5 w-5',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.7',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  if (name === 'alert')
    return (
      <svg {...common}>
        <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </svg>
    );
  if (name === 'book')
    return (
      <svg {...common}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      </svg>
    );
  if (name === 'columns')
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18M15 3v18" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M20.6 13.4 12 22l-8.6-8.6a6 6 0 0 1 8.5-8.5l.1.1.1-.1a6 6 0 0 1 8.5 8.5Z" />
    </svg>
  );
}

function Faq({ locale }: { locale: Locale }) {
  const items = [1, 2, 3, 4];
  return (
    <div className="divide-y divide-sand-200 overflow-hidden rounded-2xl border border-sand-200 bg-white dark:divide-sand-800 dark:border-sand-800 dark:bg-sand-900/40">
      {items.map((n) => (
        <details key={n} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 transition-colors hover:bg-sand-50 dark:hover:bg-sand-800/40">
            <span className="text-[15px] font-semibold text-sand-900 dark:text-sand-50">
              {t(locale, `home.faq${n}q`)}
            </span>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sand-200 text-sand-500 transition-all duration-300 group-open:rotate-45 group-open:border-brand-400 group-open:text-brand-500 dark:border-sand-700 dark:text-sand-400">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
          </summary>
          <div className="px-6 pb-6 pr-16 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
            {t(locale, `home.faq${n}a`)}
          </div>
        </details>
      ))}
    </div>
  );
}

const MARQUEE = [
  '27 CFR § 478.125',
  'ACQUISITION',
  'DISPOSITION',
  'BOUND RECORD',
  'SERIAL NUMBER',
  'DATE RECEIVED',
  'NAME & ADDRESS',
  'PAPERBACK',
  'HARDCOVER',
];

export default function Home({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  const posts = getAllPosts(locale).slice(0, 3);
  const featured = BOOKS.filter((b) => b.featured);
  const center = featured[1] ?? BOOKS[0];
  const left = featured[0] ?? BOOKS[1];
  const right = BOOKS[2];

  // Все шесть изданий (3 книги × 2 формата) — для 3D-витрины
  const showcaseItems: ShowcaseItem[] = BOOKS.flatMap((b) =>
    b.editions.map((e) => ({
      slug: `${b.slug}-${e.format}`,
      cover: e.cover,
      title: b[locale].title,
      subtitle:
        b[locale].blurb.length > 150 ? `${b[locale].blurb.slice(0, 150).trimEnd()}…` : b[locale].blurb,
      specs: [
        b.trim,
        `${b.pages} ${locale === 'ru' ? 'стр.' : 'pages'}`,
        b.regulation,
        formatLabel(e.format, locale),
      ],
      price: e.price,
      format: formatLabel(e.format, locale),
      href: `/${locale}/books/${b.slug}/`,
      amazonUrl: e.amazonUrl,
    })),
  );

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden pb-20 pt-14 sm:pb-28 sm:pt-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-48 left-1/4 h-[38rem] w-[38rem] animate-glow rounded-full bg-brand-500/20 blur-[130px]" />
          <div className="absolute -right-24 top-10 h-[30rem] w-[30rem] animate-glow rounded-full bg-brand-300/25 blur-[110px] dark:bg-brand-600/10" />
        </div>

        <div className="shell grid items-center gap-16 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <Reveal>
              <span className="chip">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {t(locale, 'home.eyebrow')}
              </span>
            </Reveal>

            <Reveal delay={1}>
              <h1 className="display mt-6 text-[2.6rem] text-sand-900 sm:text-6xl lg:text-[4.1rem] dark:text-sand-50">
                {t(locale, 'home.title')}
              </h1>
            </Reveal>

            <Reveal delay={2}>
              <p className="lede mt-6 max-w-xl">{t(locale, 'home.lede')}</p>
            </Reveal>

            <Reveal delay={3}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href={`/${locale}/buy/`} className="btn-primary">
                  {t(locale, 'home.ctaPrimary')}
                  <ArrowIcon className="h-4 w-4" />
                </Link>
                <Link href={`/${locale}/books/${left.slug}/`} className="btn-outline">
                  {t(locale, 'home.ctaSecondary')}
                </Link>
              </div>
            </Reveal>

            <Reveal delay={4}>
              <dl className="mt-14 grid max-w-lg grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
                {[
                  { v: '6', k: 'home.stat1' },
                  { v: '1,372', k: 'home.stat2' },
                  { v: '$0', k: 'home.stat3' },
                  { v: '478.125', k: 'home.stat4' },
                ].map((s) => (
                  <div key={s.k}>
                    <dt className="font-display text-2xl text-sand-900 dark:text-sand-50">{s.v}</dt>
                    <dd className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-sand-400">
                      {t(locale, s.k)}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {/* Кластер обложек с параллаксом */}
          <div className="relative">
            <Parallax speed={0.09}>
              <div className="relative mx-auto aspect-[4/3.6] w-full max-w-md">
                <div aria-hidden="true" className="absolute inset-8 rounded-full bg-brand-400/20 blur-3xl" />

                <div className="absolute left-0 top-10 w-[30%] -rotate-[9deg] animate-float" style={{ animationDelay: '-1.5s' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cheapestEdition(left).cover}
                    alt={left[locale].title}
                    className="w-full rounded-lg shadow-[0_30px_50px_-24px_rgba(12,10,9,0.55)]"
                  />
                </div>

                <div className="absolute right-0 top-20 w-[30%] rotate-[8deg] animate-float" style={{ animationDelay: '-3.5s' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cheapestEdition(right).cover}
                    alt={right[locale].title}
                    className="w-full rounded-lg shadow-[0_30px_50px_-24px_rgba(12,10,9,0.55)]"
                  />
                </div>

                <div className="absolute left-1/2 top-0 w-[44%] -translate-x-1/2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cheapestEdition(center).cover}
                    alt={center[locale].title}
                    className="w-full rounded-xl shadow-[0_40px_70px_-30px_rgba(12,10,9,0.6)]"
                  />
                </div>
              </div>
            </Parallax>

            <Reveal delay={3}>
              <div className="mx-auto mt-6 flex max-w-md flex-wrap items-center justify-center gap-2">
                <span className="chip">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {t(locale, 'book.inStock')}
                </span>
                <span className="chip">27 CFR § 478.125</span>
                <span className="chip">{locale === 'ru' ? 'с Amazon' : 'ships from Amazon'}</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= БЕГУЩАЯ СТРОКА ================= */}
      <div className="relative overflow-hidden border-y border-sand-200 bg-white py-4 dark:border-sand-800 dark:bg-sand-900/30">
        <div className="marquee-track gap-10">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center gap-10 pr-10">
              {MARQUEE.map((m) => (
                <span key={`${dup}-${m}`} className="font-mono text-[11px] uppercase tracking-[0.28em] text-sand-400 dark:text-sand-500">
                  {m}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ================= 3D-ВИТРИНА ИЗДАНИЙ ================= */}
      <section className="section section-veil">
        <div className="shell">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">{t(locale, 'home.collection')}</p>
              <h2 className="display mt-4 text-3xl text-sand-900 sm:text-4xl dark:text-sand-50">
                {locale === 'ru'
                  ? 'Все шесть изданий — покрутите, чтобы рассмотреть'
                  : 'All six editions — spin them to look closer'}
              </h2>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="mt-12">
              <BookShowcase
                items={showcaseItems}
                locale={locale}
                label={t(locale, 'home.collection')}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= КОЛЛЕКЦИЯ ================= */}
      <section className="section" id="collection">
        <div className="shell">
          <Reveal>
            <div className="max-w-2xl">
              <p className="eyebrow">{t(locale, 'home.collection')}</p>
              <h2 className="display mt-4 text-4xl text-sand-900 sm:text-5xl dark:text-sand-50">
                {t(locale, 'home.collectionLede')}
              </h2>
            </div>
          </Reveal>

          <div className="mt-12">
            <Reveal delay={1}>
              <BookGrid locale={locale} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= ПОЧЕМУ BOUND BOOK ================= */}
      <section className="section border-t border-sand-200 bg-white dark:border-sand-800 dark:bg-sand-900/20">
        <div className="shell">
          <Reveal>
            <div className="max-w-2xl">
              <p className="eyebrow">{t(locale, 'home.why')}</p>
              <h2 className="display mt-4 text-4xl text-sand-900 sm:text-5xl dark:text-sand-50">
                {t(locale, 'home.whyLede')}
              </h2>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={(i % 2 === 0 ? 1 : 2) as 1 | 2}>
                <div className="group flex gap-4">
                  <span className="icon-tile transition-colors duration-300 group-hover:border-brand-400 group-hover:text-brand-500">
                    <WhyIcon name={w.icon} />
                  </span>
                  <div>
                    <h3 className="text-[17px] font-semibold text-sand-900 dark:text-sand-50">
                      {t(locale, w.title)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
                      {t(locale, w.body)}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ЦИТАТА РЕГЛАМЕНТА ================= */}
      <section className="relative overflow-hidden border-t border-sand-200 bg-sand-950 py-24 dark:border-sand-800">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <img
            src={`${process.env.BASE_PATH || '/ffl-acquisition-and-disposition-book'}/images/texture-dark.jpg`}
            alt=""
            className="h-full w-full object-cover opacity-40"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-sand-950/70" />
          <div className="absolute left-1/2 top-0 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[120px]" />
        </div>
        <Parallax speed={0.06} className="relative">
          <div className="shell max-w-3xl text-center">
            <Reveal>
              <p className="eyebrow !text-brand-400">{t(locale, 'home.regTitle')}</p>
            </Reveal>
            <Reveal delay={1}>
              <blockquote className="display mt-7 text-2xl leading-snug text-white sm:text-3xl lg:text-[2.35rem]">
                “{t(locale, 'home.regBody')}”
              </blockquote>
            </Reveal>
            <Reveal delay={2}>
              <p className="mt-7 font-mono text-xs uppercase tracking-[0.24em] text-brand-400">
                {t(locale, 'home.regSource')}
              </p>
            </Reveal>
          </div>
        </Parallax>
      </section>

      {/* ================= FAQ ================= */}
      <section className="section">
        <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <div>
              <p className="eyebrow">{t(locale, 'home.faqTitle')}</p>
              <h2 className="display mt-4 text-4xl text-sand-900 dark:text-sand-50">
                {locale === 'ru' ? 'Коротко о главном' : 'The short answers'}
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-sand-500 dark:text-sand-400">
                {t(locale, 'footer.disclaimer')}
              </p>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <Faq locale={locale} />
          </Reveal>
        </div>
      </section>

      {/* ================= БЛОГ ================= */}
      {posts.length > 0 && (
        <section className="section border-t border-sand-200 dark:border-sand-800">
          <div className="shell">
            <Reveal>
              <div className="flex items-end justify-between gap-6">
                <h2 className="display text-3xl text-sand-900 sm:text-4xl dark:text-sand-50">
                  {t(locale, 'home.latest')}
                </h2>
                <Link href={`/${locale}/blog/`} className="link-sweep text-sm text-brand-600 dark:text-brand-400">
                  {locale === 'ru' ? 'Все записи' : 'All posts'}
                </Link>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {posts.map((p, i) => (
                <Reveal key={p.slug} delay={(i + 1) as 1 | 2 | 3}>
                  <Link
                    href={`/${locale}/blog/${p.slug}/`}
                    className="surface group flex h-full flex-col p-6 transition-all duration-500 hover:-translate-y-1 hover:border-brand-300"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-wider text-sand-400">{p.date}</span>
                    <h3 className="mt-3 text-lg font-semibold leading-snug text-sand-900 group-hover:text-brand-600 dark:text-sand-50 dark:group-hover:text-brand-400">
                      {p.title}
                    </h3>
                    {p.description && (
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
                        {p.description}
                      </p>
                    )}
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
                      {locale === 'ru' ? 'Читать' : 'Read'}
                      <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= CTA ================= */}
      <section className="pb-8">
        <div className="shell">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 px-8 py-14 text-center shadow-[0_40px_80px_-40px_rgba(226,100,5,0.7)] sm:px-16 sm:py-20">
              <div aria-hidden="true" className="noise absolute inset-0" />
              <div className="relative">
                <h2 className="display mx-auto max-w-2xl text-3xl text-white sm:text-4xl lg:text-[2.9rem]">
                  {t(locale, 'home.ctaTitle')}
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-white/90">
                  {t(locale, 'home.ctaBody')}
                </p>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href={`/${locale}/buy/`}
                    className="btn !bg-white !bg-none !text-brand-700 hover:!bg-sand-50"
                  >
                    {t(locale, 'home.ctaPrimary')}
                    <ArrowIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/${locale}/reviews/`}
                    className="btn border border-white/60 !text-white hover:!bg-white/10"
                  >
                    {t(locale, 'nav.reviews')}
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
