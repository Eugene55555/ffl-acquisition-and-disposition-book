import Link from 'next/link';
import type { Metadata } from 'next';
import { t } from '@/src/i18n/ui';
import { locales, type Locale } from '@/src/i18n/settings';
import { getAllPosts } from '@/src/lib/posts';
import { BookCard } from '@/components/BookCard';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  return {
    title: t(locale, 'seo.home.title'),
    description: t(locale, 'seo.home.desc'),
  };
}

export default function Home({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  const posts = getAllPosts(locale).slice(0, 5);
  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-to-r from-[#FF512F] to-[#F09819] px-8 py-16 text-center text-white">
        <h1 className="text-4xl font-bold sm:text-5xl">Blog</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">{t(locale, 'home.tagline')}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={`/${locale}/blog/`}
            className="inline-block rounded-lg bg-white px-6 py-3 font-semibold text-orange-600 shadow hover:bg-gray-50"
          >
            {t(locale, 'nav.blog')} →
          </Link>
          <Link
            href={`/${locale}/buy/`}
            className="inline-block rounded-lg border border-white/70 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            {t(locale, 'nav.buy')}
          </Link>
        </div>
      </section>

      <BookCard locale={locale} />

      <section>
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">{t(locale, 'home.latest')}</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/${locale}/blog/${p.slug}/`}
              className="group rounded-xl border border-gray-200 p-6 transition hover:border-orange-400 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-500 dark:text-white">{p.title}</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{p.date}</p>
              {p.description && <p className="mt-3 text-gray-600 dark:text-gray-300">{p.description}</p>}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
