'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { type Locale } from '@/src/i18n/settings';

/**
 * Комментарии на giscus — обсуждения GitHub поверх репозитория сайта.
 *
 * Почему не Cusdis: хостинг cusdis.com перестал отвечать (HTTP 521 на самом сайте
 * и на API), из-за чего скрипт iframe блокировался и комментарии не грузились.
 * giscus не требует бэкенда: сообщения живут в GitHub Discussions того же репозитория,
 * что и сайт, модерация — обычная модерация Discussions, спам-фильтр — GitHub.
 *
 * Тема оформления — своя, под палитру сайта: /giscus-light.css и /giscus-dark.css
 * (в основе официальные темы giscus, переопределены переменные).
 */
const REPO = 'Eugene55555/ffl-acquisition-and-disposition-book';
const REPO_ID = 'R_kgDOTXuLwA';
const CATEGORY = 'General';
const CATEGORY_ID = 'DIC_kwDOTXuLwM4DBMPB';
const GISCUS_ORIGIN = 'https://giscus.app';
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '/ffl-acquisition-and-disposition-book';

const isDark = () =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

const themeUrl = (dark: boolean) =>
  `${window.location.origin}${BASE_PATH}/giscus-${dark ? 'dark' : 'light'}.css`;

export function Comments({ locale }: { locale: Locale }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Монтируем giscus заново при смене страницы/языка (SPA-навигация в static export).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Просто очищаем контейнер перед вставкой нового скрипта giscus —
    // пользовательский HTML сюда не попадает, санитизация не требуется.
    el.innerHTML = '';

    const script = document.createElement('script');
    script.src = `${GISCUS_ORIGIN}/client.js`;
    script.async = true;
    script.crossOrigin = 'anonymous';

    const attrs: Record<string, string> = {
      'data-repo': REPO,
      'data-repo-id': REPO_ID,
      'data-category': CATEGORY,
      'data-category-id': CATEGORY_ID,
      'data-mapping': 'pathname',
      'data-strict': '0',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'bottom',
      'data-theme': themeUrl(isDark()),
      'data-lang': locale,
      'data-loading': 'lazy',
    };
    for (const [k, v] of Object.entries(attrs)) script.setAttribute(k, v);

    el.appendChild(script);

    return () => {
      el.innerHTML = '';
    };
  }, [locale, pathname]);

  // Переключение темы на лету: giscus принимает setConfig через postMessage.
  useEffect(() => {
    const send = () => {
      const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
      if (!iframe?.contentWindow) return;
      iframe.contentWindow.postMessage(
        { giscus: { setConfig: { theme: themeUrl(isDark()) } } },
        GISCUS_ORIGIN,
      );
    };
    const t = window.setTimeout(send, 600);
    const observer = new MutationObserver(send);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      window.clearTimeout(t);
      observer.disconnect();
    };
  }, []);

  return <div ref={ref} className="giscus-slot min-w-0" />;
}
