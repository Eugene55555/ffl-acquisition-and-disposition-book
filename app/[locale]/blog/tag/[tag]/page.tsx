import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { t } from '@/src/i18n/ui';
import { locales, type Locale } from '@/src/i18n/settings';
import { getAllPosts } from '@/src/lib/posts';
import { alternatesFor, OG_IMAGE } from '@/src/lib/seo';

export function generateStaticParams() {
  const out: { locale: string; tag: string }[] = [];
  const seen = new Set<string>();
  for (const locale of locales) {
    for (const p of getAllPosts(locale)) {
      for (const tag of p.tags || []) {
        const key = `${locale}/${tag}`;
        if (!seen.has(key)) {
          seen.add(key);
          out.push({ locale, tag });
        }
      }
    }
  }
  return out;
}

export function generateMetadata({ params }: { params: { locale: string; tag: string } }): Metadata {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  const tag = decodeURIComponent(params.tag);
  return {
    title: `#${tag} — ${t(locale, 'nav.blog')}`,
    description: `${t(locale, 'nav.blog')}: ${tag}`,
    alternates: alternatesFor(`/blog/tag/${tag}`),
    openGraph: { images: [OG_IMAGE[locale]], locale },
    twitter: { images: [OG_IMAGE[locale]] },
  };
}

export default function TagPage({ params }: { params: { locale: string; tag: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  const tag = decodeURIComponent(params.tag);
  const posts = getAllPosts(locale).filter((p) => (p.tags || []).includes(tag));
  if (posts.length === 0) notFound();

  return (
    <div>
      <Link href={`/${locale}/blog/`} className="text-sm text-orange-500 hover:underline">
        {t(locale, 'post.back')}
      </Link>
      <h1 className="mb-8 mt-4 text-3xl font-bold text-gray-900 dark:text-white">
        #{tag}
      </h1>
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
          </Link>
        ))}
      </div>
    </div>
  );
}
