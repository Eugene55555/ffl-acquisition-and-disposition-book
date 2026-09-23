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
    <section className="section">
      <div className="shell">
        <Link href={`/${locale}/blog/`} className="link-sweep text-sm text-sand-500 dark:text-sand-400">
          {t(locale, 'post.back')}
        </Link>
        <h1 className="display mt-6 text-4xl text-sand-900 sm:text-5xl dark:text-sand-50">#{tag}</h1>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/${locale}/blog/${p.slug}/`}
              className="surface group flex h-full flex-col p-6 transition-all duration-500 hover:-translate-y-1 hover:border-brand-300"
            >
              <span className="font-mono text-[11px] uppercase tracking-wider text-sand-400">{p.date}</span>
              <h2 className="mt-3 text-lg font-semibold leading-snug text-sand-900 transition-colors group-hover:text-brand-600 dark:text-sand-50 dark:group-hover:text-brand-400">
                {p.title}
              </h2>
              {p.description && (
                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
                  {p.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
