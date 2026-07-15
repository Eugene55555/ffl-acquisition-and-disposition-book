'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { type Locale } from '@/src/i18n/settings';

// Cusdis — бесплатный open-source комментарий-сервис.
// https://cusdis.com — проект Eugene55555.
const CUSDIS_APP_ID = process.env.NEXT_PUBLIC_CUSDIS_APP_ID || '88e9de72-f907-4d0b-9aa4-bbbecc2a991a';
const CUSDIS_HOST = process.env.NEXT_PUBLIC_CUSDIS_HOST || 'https://cusdis.com';

export function Comments({ locale }: { locale: Locale }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // 1) Рендер/перерендер Cusdis при смене поста (SPA-навигация) и локали.
  useEffect(() => {
    if (!CUSDIS_APP_ID || !ref.current) return;
    const el = ref.current;

    const isDark = document.documentElement.classList.contains('dark');

    const render = () => {
      if (!ref.current) return;
      const node = ref.current;
      node.setAttribute('id', 'cusdis_thread');
      node.setAttribute('data-host', CUSDIS_HOST);
      node.setAttribute('data-app-id', CUSDIS_APP_ID);
      node.setAttribute('data-page-id', window.location.pathname);
      node.setAttribute('data-page-url', window.location.href);
      node.setAttribute('data-page-title', document.title);
      node.setAttribute('data-lang', locale);
      node.setAttribute('data-theme', isDark ? 'dark' : 'light');
      // Cusdis публично экспонирует renderCusdis(target)
      const w = window as unknown as { renderCusdis?: (t: HTMLElement) => void };
      if (w.renderCusdis) w.renderCusdis(node);
    };

    // Скрипт грузим один раз; при повторных сменах поста просто ререндерим.
    const existing = document.querySelector<HTMLScriptElement>('script[data-cusdis-loader]');
    if (!existing) {
      const s = document.createElement('script');
      s.src = `${CUSDIS_HOST}/js/cusdis.es.js`;
      s.async = true;
      s.dataset.cusdisLoader = '1';
      s.onload = render;
      document.body.appendChild(s);
    } else {
      render();
    }
  }, [locale, pathname]);

  // 2) Синхронизация тёмной/светлой темы (класс .dark на <html>).
  useEffect(() => {
    const applyTheme = () => {
      const dark = document.documentElement.classList.contains('dark');
      const w = window as unknown as {
        CUSDIS?: { setTheme?: (t: string) => void };
      };
      if (w.CUSDIS && w.CUSDIS.setTheme) w.CUSDIS.setTheme(dark ? 'dark' : 'light');
    };
    const observer = new MutationObserver(applyTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  if (!CUSDIS_APP_ID) return null;
  return (
    <section className="mt-16 border-t border-orange-100 pt-10">
      <div className="mx-auto w-full max-w-3xl px-4">
        <h2 className="mb-2 text-center text-2xl font-bold tracking-tight text-neutral-900 font-serif md:text-3xl dark:text-white">
          Comments
        </h2>
        <p className="mb-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          Share your thoughts — join the conversation below.
        </p>
        {/* Обёртка адаптивная: на мобильных не уезжает, iframe на 100% ширины */}
        <div
          ref={ref}
          className="cusdis-wrapper min-w-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5 dark:border-neutral-800 dark:bg-neutral-900"
        />
        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          Comments powered by Cusdis.
        </p>
      </div>
    </section>
  );
}
