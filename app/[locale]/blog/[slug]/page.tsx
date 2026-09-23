import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { marked } from 'marked';
import { t } from '@/src/i18n/ui';
import { locales, type Locale } from '@/src/i18n/settings';
import { getPost, getSlugs, getAllPosts } from '@/src/lib/posts';
import { ReadingProgress, ShareButtons } from '@/components/PostExtras';
import { PostTOC } from '@/components/PostTOC';
import { RelatedPosts } from '@/components/RelatedPosts';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Newsletter } from '@/components/Newsletter';
import { Comments } from '@/components/Comments';
import { Reveal } from '@/components/Reveal';
import { alternatesFor, siteUrl, OG_IMAGE } from '@/src/lib/seo';

export function generateStaticParams() {
  const out: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const slug of getSlugs(locale)) {
      out.push({ locale, slug });
    }
  }
  return out;
}

export function generateMetadata({ params }: { params: { locale: string; slug: string } }): Metadata {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  const post = getPost(params.slug, locale);
  if (!post) return { title: 'Not found' };
  return {
    title: post.title,
    description: post.description || post.content?.slice(0, 150),
    alternates: alternatesFor(`/blog/${params.slug}`),
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description || post.content?.slice(0, 150),
      locale,
      publishedTime: post.date,
      images: [OG_IMAGE[locale]],
    },
    twitter: { images: [OG_IMAGE[locale]] },
  };
}

export default async function PostPage({ params }: { params: { locale: string; slug: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  const post = getPost(params.slug, locale);
  if (!post) notFound();

  const html = marked.parse(post.content || '') as string;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description || post.content?.slice(0, 150),
    datePublished: post.date,
    inLanguage: locale,
    author: post.author ? { '@type': 'Person', name: post.author } : undefined,
    mainEntityOfPage: siteUrl(),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ReadingProgress />

      <section className="relative overflow-hidden pb-10 pt-10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 right-1/4 h-[26rem] w-[26rem] animate-glow rounded-full bg-brand-500/10 blur-[120px]" />
        </div>
        <div className="shell">
          <div className="flex gap-12">
            <article className="mx-auto w-full max-w-3xl">
              <Breadcrumbs
                locale={locale}
                items={[{ label: t(locale, 'nav.blog'), href: `/${locale}/blog/` }, { label: post.title }]}
              />
              <Reveal>
                <h1 className="display mt-5 text-4xl text-sand-900 sm:text-5xl dark:text-sand-50">
                  {post.title}
                </h1>
                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-sand-400">
                  {t(locale, 'post.published')}: {post.date}
                  {post.author ? ` · ${t(locale, 'post.by')} ${post.author}` : ''}
                  {post.readingTime ? ` · ${post.readingTime} ${locale === 'ru' ? 'чтения' : 'read'}` : ''}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link key={tag} href={`/${locale}/blog/tag/${encodeURIComponent(tag)}/`} className="chip transition-colors hover:border-brand-400 hover:text-brand-600">
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}
              </Reveal>

              <div
                className="prose prose-lg mt-10 max-w-none prose-headings:font-semibold prose-headings:text-sand-900 prose-p:text-sand-700 prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-sand-900 prose-li:text-sand-700 prose-blockquote:border-brand-400 prose-blockquote:text-sand-600 prose-code:text-brand-700 prose-hr:border-sand-200 dark:prose-invert dark:prose-headings:text-sand-50 dark:prose-p:text-sand-300 dark:prose-a:text-brand-400 dark:prose-strong:text-sand-50 dark:prose-li:text-sand-300 dark:prose-blockquote:text-sand-400 dark:prose-hr:border-sand-800"
                dangerouslySetInnerHTML={{ __html: html }}
              />

              <ShareButtons locale={locale} title={post.title} />
              <RelatedPosts
                locale={locale}
                current={post.slug}
                all={getAllPosts(locale).map((p) => ({ slug: p.slug, title: p.title, tags: p.tags || [] }))}
              />
              <Newsletter locale={locale} />
              <div className="giscus-slot mt-14 border-t border-sand-200 pt-10 dark:border-sand-800">
                <h2 className="display mb-6 text-2xl text-sand-900 dark:text-sand-50">
                  {locale === 'ru' ? 'Обсудить запись' : 'Discuss this post'}
                </h2>
                <Comments locale={locale} />
              </div>
            </article>
            <PostTOC locale={locale} />
          </div>
        </div>
      </section>
    </div>
  );
}
