import Link from 'next/link';
import { t } from '@/src/i18n/ui';
import { locales, type Locale } from '@/src/i18n/settings';
import { getAllPosts } from '@/src/lib/posts';
import { BookCard } from '@/components/BookCard';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function Home({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  const posts = getAllPosts(locale).slice(0, 5);
  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-to-r from-[#FF512F] to-[#F09819] px-8 py-16 text-center text-white">
        <h1 className="text-4xl font-bold sm:text-5xl">Blog</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">{t(locale, 'home.tagline')}</p>
        <Link
          href={`/${locale}/blog/`}
          className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-orange-600 shadow hover:bg-gray-50"
        >
          {t(locale, 'nav.blog')} →
        </Link>
      </section>

      <BookCard locale={locale} />

      <section>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">{t(locale, 'home.latest')}</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/${locale}/blog/${p.slug}/`}
              className="group rounded-xl border border-gray-200 p-6 transition hover:border-orange-400 hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-500">
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-gray-500">{p.date}</p>
              {p.description && <p className="mt-3 text-gray-600">{p.description}</p>}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
