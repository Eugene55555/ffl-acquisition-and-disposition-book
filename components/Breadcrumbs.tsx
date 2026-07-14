import Link from 'next/link';
import { type Locale } from '@/src/i18n/settings';
import { t } from '@/src/i18n/ui';

type Crumb = { label: string; href?: string };

function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500"
      aria-hidden="true"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function Breadcrumbs({ locale, items }: { locale: Locale; items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm dark:border-gray-800 dark:bg-gray-900">
        <li>
          <Link
            href={`/${locale}/`}
            className="font-medium text-gray-500 transition hover:text-orange-500 dark:text-gray-400"
          >
            {locale === 'ru' ? 'Главная' : 'Home'}
          </Link>
        </li>
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              <Chevron />
              {c.href && !last ? (
                <Link
                  href={c.href}
                  className="font-medium text-gray-500 transition hover:text-orange-500 dark:text-gray-400"
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  className="font-semibold text-gray-900 dark:text-white"
                  aria-current="page"
                >
                  {c.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
