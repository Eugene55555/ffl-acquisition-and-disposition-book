import Link from 'next/link';
import { type Locale } from '@/src/i18n/settings';

type Item = {
  slug: string;
  title: string;
  tags: string[];
};

export function RelatedPosts({
  locale,
  current,
  all,
}: {
  locale: Locale;
  current: string;
  all: Item[];
}) {
  const currentPost = all.find((p) => p.slug === current);
  const tags = new Set(currentPost?.tags || []);
  const related = all
    .filter((p) => p.slug !== current)
    .map((p) => ({ p, score: (p.tags || []).filter((t) => tags.has(t)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.p);

  if (related.length === 0) return null;

  const label = locale === 'ru' ? 'Читайте также' : 'Related posts';

  return (
    <section className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">{label}</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {related.map((p) => (
          <Link
            key={p.slug}
            href={`/${locale}/blog/${p.slug}/`}
            className="group rounded-xl border border-gray-200 p-4 transition hover:border-orange-400 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-orange-500 dark:text-white">
              {p.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
