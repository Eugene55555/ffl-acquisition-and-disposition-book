'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import { type Locale } from '@/src/i18n/settings';

export type SearchItem = {
  slug: string;
  title: string;
  description?: string;
  tags: string[];
};

export function Search({ locale, items }: { locale: Locale; items: SearchItem[] }) {
  const [q, setQ] = useState('');
  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: ['title', 'description', 'tags'],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [items]
  );

  const results = q.trim() ? fuse.search(q.trim()).map((r) => r.item) : [];
  const searching = q.trim().length > 0;

  return (
    <div>
      <div className="relative">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={locale === 'ru' ? 'Поиск по блогу…' : 'Search the blog…'}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      {searching && (
        <ul className="mt-4 space-y-2">
          {results.length === 0 && (
            <li className="text-sm text-gray-500 dark:text-gray-400">
              {locale === 'ru' ? 'Ничего не найдено.' : 'No results.'}
            </li>
          )}
          {results.map((r) => (
            <li key={r.slug}>
              <Link
                href={`/${locale}/blog/${r.slug}/`}
                className="block rounded-lg border border-gray-200 p-3 transition hover:border-orange-400 dark:border-gray-800 dark:bg-gray-900"
              >
                <span className="font-medium text-gray-900 dark:text-white">{r.title}</span>
                {r.description && (
                  <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">
                    {r.description}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
