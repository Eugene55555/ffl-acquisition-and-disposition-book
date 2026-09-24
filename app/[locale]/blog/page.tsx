import Link from 'next/link';
import type { Metadata } from 'next';
import { t } from '@/src/i18n/ui';
import { locales, type Locale } from '@/src/i18n/settings';
import { getAllPosts } from '@/src/lib/posts';
import { alternatesFor, OG_IMAGE } from '@/src/lib/seo';
import { Search, type SearchItem } from '@/components/Search';
import { Reveal } from '@/components/Reveal';

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
      locale,
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
      <section className="relative overflow-hidden pb-12 pt-14">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/3 h-[28rem] w-[28rem] animate-glow rounded-full bg-brand-500/15 blur-[120px]" />
        </div>
        <div className="shell max-w-3xl">
          <Reveal>
            <p className="eyebrow">{t(locale, 'nav.blog')}</p>
            <h1 className="display mt-4 text-4xl text-sand-900 sm:text-5xl dark:text-sand-50">
              Notes on record-keeping
            </h1>
            <p className="lede mt-6">{t(locale, 'seo.blog.desc')}</p>
          </Reveal>
          <Reveal delay={1}>
            <div className="mt-8 max-w-xl">
              <Search locale={locale} items={searchItems} />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pb-24">
        <div className="shell">
          {posts.length === 0 && (
            <p className="text-sm text-sand-500 dark:text-sand-400">
              No posts yet. Add a .md file in content/posts/.
            </p>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3 === 0 ? 1 : i % 3 === 1 ? 2 : 3) as 1 | 2 | 3}>
                <Link
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
                  {p.tags && p.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.tags.map((tag) => (
                        <span key={tag} className="chip">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
                    Read
                    <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
