'use client';

import { useEffect, useState } from 'react';
import { type Locale } from '@/src/i18n/settings';

type Heading = { id: string; text: string; level: number };

export function PostTOC({ locale }: { locale: Locale }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState('');

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLHeadingElement>('article h2, article h3')
    );
    const items = nodes.map((n, i) => {
      if (!n.id) n.id = `h-${i}-${n.textContent?.slice(0, 24).replace(/\W+/g, '-') ?? i}`;
      return { id: n.id, text: n.textContent || '', level: n.tagName === 'H2' ? 2 : 3 };
    });
    setHeadings(items);

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px' }
    );
    nodes.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, []);

  if (headings.length < 2) return null;

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          {locale === 'ru' ? 'Содержание' : 'On this page'}
        </p>
        <nav className="space-y-1 border-l border-gray-200 dark:border-gray-800">
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              className={`block border-l-2 py-1 text-sm transition ${
                h.level === 3 ? 'pl-6' : 'pl-3'
              } ${
                active === h.id
                  ? 'border-orange-500 font-medium text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 hover:text-orange-500 dark:text-gray-400'
              }`}
            >
              {h.text}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
