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
      locale: locale,
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
    <div className="mx-auto max-w-5xl">
      <div className="flex gap-10">
        <article className="mx-auto w-full max-w-3xl">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <ReadingProgress />
          <Breadcrumbs
            locale={locale}
            items={[{ label: t(locale, 'nav.blog'), href: `/${locale}/blog/` }, { label: post.title }]}
          />
          <h1 className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">{post.title}</h1>
          <p className="mt-3 text-sm text-gray-500">
            {t(locale, 'post.published')}: {post.date}
            {post.author ? ` · ${t(locale, 'post.by')} ${post.author}` : ''}
            {post.readingTime ? ` · ${post.readingTime} ${locale === 'ru' ? 'чтения' : 'read'}` : ''}
          </p>
          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-orange-50 px-3 py-1 text-xs text-orange-600 dark:bg-orange-500/10">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <div
            className="prose prose-orange mt-8 max-w-none prose-headings:text-gray-900 prose-a:text-orange-500 dark:prose-headings:text-white dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <ShareButtons locale={locale} title={post.title} />
          <RelatedPosts
            locale={locale}
            current={post.slug}
            all={getAllPosts(locale).map((p) => ({ slug: p.slug, title: p.title, tags: p.tags || [] }))}
          />
          <Newsletter locale={locale} />
          <Comments locale={locale} />
        </article>
        <PostTOC locale={locale} />
      </div>
    </div>
  );
}
