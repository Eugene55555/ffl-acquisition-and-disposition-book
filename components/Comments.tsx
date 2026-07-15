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
  // 2) iframe растёт под контент (без «окна» и прокрутки).
  // 3) Внутренний фон делаем прозрачным -> наследует фон обёртки (единый цвет).
  useEffect(() => {
    if (!CUSDIS_APP_ID || !ref.current) return;
    const el = ref.current;
    const isDark = document.documentElement.classList.contains('dark');

    const wireIframe = () => {
      const ifr = el.querySelector('iframe');
      if (!ifr) return;

      const applyHeight = () => {
        try {
          const doc = ifr.contentDocument;
          if (doc && doc.documentElement) {
            ifr.style.height = doc.documentElement.scrollHeight + 'px';
          }
        } catch {
          /* cross-origin — не должно быть, т.к. srcdoc same-origin */
        }
      };

      const injectInnerFix = () => {
        try {
          const doc = ifr.contentDocument;
          if (doc && doc.head && !doc.getElementById('cusdis-inner-fix')) {
            const s = doc.createElement('style');
            s.id = 'cusdis-inner-fix';
            s.textContent =
              'html,body,#root,#root > div{background:transparent !important;}';
            doc.head.appendChild(s);
          }
        } catch {
          /* ignore */
        }
      };

      ifr.addEventListener('load', () => {
        applyHeight();
        injectInnerFix();
      });
      applyHeight();
      injectInnerFix();

      // ResizeObserver ВНУТРИ iframe — ловит рост контента (новый коммент и т.п.)
      const RO = ifr.contentWindow && (ifr.contentWindow as unknown as {
        ResizeObserver?: typeof ResizeObserver;
      }).ResizeObserver;
      if (RO && ifr.contentDocument && ifr.contentDocument.body) {
        try {
          const ro = new RO(() => applyHeight());
          ro.observe(ifr.contentDocument.body);
        } catch {
          /* ignore */
        }
      }

      // Fallback-поллинг (на случай, если контент домонтируется позже)
      const iv = setInterval(applyHeight, 600);
      setTimeout(() => clearInterval(iv), 12000);
    };

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

      const w = window as unknown as { renderCusdis?: (t: HTMLElement) => void };
      if (w.renderCusdis) {
        w.renderCusdis(node);
        // iframe создаётся внутри renderCusdis -> подождём и подцепим
        setTimeout(wireIframe, 350);
      }
    };

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-cusdis-loader]'
    );
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

  // 4) Синхронизация тёмной/светлой темы (класс .dark на <html>).
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
        {/* Обёртка: фон совпадает со страницей (white / gray-950) -> единый цвет */}
        <div
          ref={ref}
          className="cusdis-wrapper min-w-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5 dark:border-neutral-800 dark:bg-gray-950"
        />
        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          Comments powered by Cusdis.
        </p>
      </div>
    </section>
  );
}
