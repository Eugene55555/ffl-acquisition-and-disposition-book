import Link from 'next/link';
import { t } from '@/src/i18n/ui';
import { locales, type Locale } from '@/src/i18n/settings';
import { getAllPosts } from '@/src/lib/posts';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function BlogIndex({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  const posts = getAllPosts(locale);
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900">{t(locale, 'nav.blog')}</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/${locale}/blog/${p.slug}/`}
            className="group rounded-xl border border-gray-200 p-6 transition hover:border-orange-400 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-gray-900 group-hover:text-orange-500">
              {p.title}
            </h2>
            <p className="mt-2 text-sm text-gray-500">{p.date}</p>
            {p.description && <p className="mt-3 text-gray-600">{p.description}</p>}
            {p.tags && p.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {p.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-orange-50 px-3 py-1 text-xs text-orange-600">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
      {posts.length === 0 && (
        <p className="text-gray-500">No posts yet. Add a .md file in content/posts/.</p>
      )}
    </div>
  );
}
