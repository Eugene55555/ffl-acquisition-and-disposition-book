import Link from 'next/link';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import { t } from '@/src/i18n/ui';
import { locales, type Locale } from '@/src/i18n/settings';
import { getPost, getSlugs } from '@/src/lib/posts';

export function generateStaticParams() {
  const out: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const slug of getSlugs(locale)) {
      out.push({ locale, slug });
    }
  }
  return out;
}

export default async function PostPage({ params }: { params: { locale: string; slug: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  const post = getPost(params.slug, locale);
  if (!post) notFound();

  const html = marked.parse(post.content || '') as string;

  return (
    <article className="mx-auto max-w-3xl">
      <Link href={`/${locale}/blog/`} className="text-sm text-orange-500 hover:underline">
        {t(locale, 'post.back')}
      </Link>
      <h1 className="mt-4 text-4xl font-bold text-gray-900">{post.title}</h1>
      <p className="mt-3 text-sm text-gray-500">
        {t(locale, 'post.published')}: {post.date}
        {post.author ? ` · ${t(locale, 'post.by')} ${post.author}` : ''}
      </p>
      {post.tags && post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-orange-50 px-3 py-1 text-xs text-orange-600">
              #{tag}
            </span>
          ))}
        </div>
      )}
      <div
        className="prose prose-orange mt-8 max-w-none prose-headings:text-gray-900 prose-a:text-orange-500"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
