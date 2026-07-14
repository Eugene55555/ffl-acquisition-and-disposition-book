import Link from 'next/link';
import type { Metadata } from 'next';
import { t } from '@/src/i18n/ui';
import { locales, type Locale } from '@/src/i18n/settings';
import { getAllPosts } from '@/src/lib/posts';
import { alternatesFor, OG_IMAGE } from '@/src/lib/seo';
import { Search, type SearchItem } from '@/components/Search';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  return {
    title: t(locale, 'seo.blog.title'),
    description: t(locale, 'seo.blog.desc'),
    alternates: alternatesFor('/blog'),
    openGraph: {
      title: t(locale, 'seo.blog.title'),
      description: t(locale, 'seo.blog.desc'),
      locale: locale,
      images: [OG_IMAGE[locale]],
    },
    twitter: { images: [OG_IMAGE[locale]] },
  };
}

export default function BlogIndex({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  const posts = getAllPosts(locale);
  const searchItems: SearchItem[] = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    tags: p.tags || [],
  }));
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">{t(locale, 'nav.blog')}</h1>
      <div className="mb-8">
        <Search locale={locale} items={searchItems} />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/${locale}/blog/${p.slug}/`}
            className="group rounded-xl border border-gray-200 p-6 transition hover:border-orange-400 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <h2 className="text-xl font-semibold text-gray-900 group-hover:text-orange-500 dark:text-white">
              {p.title}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{p.date}</p>
            {p.description && <p className="mt-3 text-gray-600 dark:text-gray-300">{p.description}</p>}
            {p.tags && p.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {p.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-orange-50 px-3 py-1 text-xs text-orange-600 transition hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20">
                    <Link href={`/${locale}/blog/tag/${encodeURIComponent(tag)}/`}>#{tag}</Link>
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
      {posts.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">No posts yet. Add a .md file in content/posts/.</p>
      )}
    </div>
  );
}
