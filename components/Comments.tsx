'use client';

import { useEffect, useRef } from 'react';
import { type Locale } from '@/src/i18n/settings';

// Disqus — универсальные комментарии (гостевой вход + Google/Facebook).
// Задай NEXT_PUBLIC_DISQUS_SHORTNAME или захардкожь ниже.
const SHORTNAME = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME || 'ffl';

export function Comments({ locale }: { locale: Locale }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SHORTNAME || !ref.current) return;
    const w = window as unknown as {
      disqus_config?: () => void;
      DISQUS?: unknown;
    };
    w.disqus_config = function (this: { page: { identifier: string; url: string; language: string } }) {
      this.page.identifier = window.location.pathname;
      this.page.url = window.location.href;
      this.page.language = locale;
    };
    const s = document.createElement('script');
    s.src = `https://${SHORTNAME}.disqus.com/embed.js`;
    s.async = true;
    s.setAttribute('data-timestamp', String(Date.now()));
    ref.current.appendChild(s);
  }, [locale]);

  if (!SHORTNAME) return null;
  return (
    <div className="mt-12">
      <div id="disqus_thread" ref={ref} />
      <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
        Comments powered by Disqus.
      </p>
    </div>
  );
}
