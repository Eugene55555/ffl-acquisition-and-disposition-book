import Link from 'next/link';
import { type Locale } from '@/src/i18n/settings';
import { t } from '@/src/i18n/ui';

type Crumb = { label: string; href?: string };

export function Breadcrumbs({ locale, items }: { locale: Locale; items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-500 dark:text-gray-400">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href={`/${locale}/`} className="hover:text-orange-500">
            {locale === 'ru' ? 'Главная' : 'Home'}
          </Link>
        </li>
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span aria-hidden="true">/</span>
            {c.href && i < items.length - 1 ? (
              <Link href={c.href} className="hover:text-orange-500">
                {c.label}
              </Link>
            ) : (
              <span className="text-gray-700 dark:text-gray-200" aria-current="page">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
