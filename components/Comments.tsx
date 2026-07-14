'use client';

import { useEffect, useRef } from 'react';
import { type Locale } from '@/src/i18n/settings';

// Giscus — статик-френдли комментарии на базе GitHub Discussions.
// Значения по умолчанию — твой репозиторий. Переопредели через
// NEXT_PUBLIC_GISCUS_* при сборке, если нужно сменить.
const DEFAULT_REPO = 'Eugene55555/ffl-acquisition-and-disposition-book';
const DEFAULT_REPO_ID = 'R_kgDOTXuLwA';
const DEFAULT_CATEGORY = 'Announcements';
const DEFAULT_CATEGORY_ID = 'DIC_kwDOTXuLwM4DBMPA';

export function Comments({ locale }: { locale: Locale }) {
  const ref = useRef<HTMLDivElement>(null);
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO || DEFAULT_REPO;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID || DEFAULT_REPO_ID;
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY || DEFAULT_CATEGORY;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || DEFAULT_CATEGORY_ID;

  useEffect(() => {
    if (!ref.current) return;
    const s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.setAttribute('data-repo', repo);
    s.setAttribute('data-repo-id', repoId);
    s.setAttribute('data-category', category);
    s.setAttribute('data-category-id', categoryId);
    s.setAttribute('data-mapping', 'pathname');
    s.setAttribute('data-strict', '0');
    s.setAttribute('data-reactions-enabled', '1');
    s.setAttribute('data-emit-metadata', '0');
    s.setAttribute('data-input-position', 'bottom');
    s.setAttribute('data-theme', 'preferred_color_scheme');
    s.setAttribute('data-lang', locale);
    s.setAttribute('data-loading', 'lazy');
    ref.current.appendChild(s);
  }, [repo, repoId, category, categoryId, locale]);

  return (
    <div className="mt-12">
      <div ref={ref} />
      <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
        Sign in with GitHub to comment.
      </p>
    </div>
  );
}
