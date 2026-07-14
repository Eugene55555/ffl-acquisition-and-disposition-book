'use client';

import { useEffect, useRef } from 'react';
import { type Locale } from '@/src/i18n/settings';

// Giscus — статик-френдли комментарии на базе GitHub Discussions.
// Включи, задав переменные окружения при сборке (repo, repo-id, category-id).
// Если не заданы — компонент просто ничего не рендерит.
export function Comments({ locale }: { locale: Locale }) {
  const ref = useRef<HTMLDivElement>(null);
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

  useEffect(() => {
    if (!repo || !repoId || !categoryId || !ref.current) return;
    const s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.setAttribute('data-repo', repo);
    s.setAttribute('data-repo-id', repoId);
    s.setAttribute('data-category', 'Comments');
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
  }, [repo, repoId, categoryId, locale]);

  if (!repo || !repoId || !categoryId) return null;
  return <div ref={ref} className="mt-12" />;
}
