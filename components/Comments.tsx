'use client';

import { useEffect, useRef } from 'react';
import { type Locale } from '@/src/i18n/settings';

// Cusdis — бесплатный open-source комментарий-сервис.
// https://cusdis.com — проект Eugene55555.
const CUSDIS_APP_ID = process.env.NEXT_PUBLIC_CUSDIS_APP_ID || '88e9de72-f907-4d0b-9aa4-bbbecc2a991a';
const CUSDIS_HOST = process.env.NEXT_PUBLIC_CUSDIS_HOST || 'https://cusdis.com';

export function Comments({ locale }: { locale: Locale }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!CUSDIS_APP_ID || !ref.current) return;
    const el = ref.current;
    el.setAttribute('id', 'cusdis_thread');
    el.setAttribute('data-host', CUSDIS_HOST);
    el.setAttribute('data-app-id', CUSDIS_APP_ID);
    el.setAttribute('data-page-id', window.location.pathname);
    el.setAttribute('data-page-url', window.location.href);
    el.setAttribute('data-page-title', document.title);
    el.setAttribute('data-lang', locale);

    // Скрываем полосу прокрутки у iframe Cusdis (у iframe нет рамки, авто-высота).
    const styleId = 'cusdis-no-scrollbar';
    if (!document.getElementById(styleId)) {
      const s = document.createElement('style');
      s.id = styleId;
      s.textContent = `
        #cusdis_thread { overflow: hidden !important; }
        #cusdis_thread iframe {
          border: 0 !important;
          width: 100% !important;
          overflow: hidden !important;
          scrollbar-width: none !important;
        }
        #cusdis_thread iframe::-webkit-scrollbar { display: none !important; }
      `;
      document.head.appendChild(s);
    }

    const script = document.createElement('script');
    script.src = `${CUSDIS_HOST}/js/cusdis.es.js`;
    script.async = true;
    el.appendChild(script);
  }, [locale]);

  if (!CUSDIS_APP_ID) return null;
  return (
    <section className="mt-16 border-t border-orange-100 pt-10">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="mb-2 text-center text-2xl font-bold tracking-tight text-neutral-900 font-serif md:text-3xl">
          Comments
        </h2>
        <p className="mb-6 text-center text-sm text-neutral-500">
          Share your thoughts — join the conversation below.
        </p>
        <div
          ref={ref}
          className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
        />
        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          Comments powered by Cusdis.
        </p>
      </div>
    </section>
  );
}
