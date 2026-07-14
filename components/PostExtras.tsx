'use client';

import { useEffect, useState } from 'react';
import { type Locale } from '@/src/i18n/settings';
import { t } from '@/src/i18n/ui';

export function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setPct(max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-transparent" aria-hidden="true">
      <div
        className="h-full bg-[linear-gradient(to_right,#FF512F,#F09819)] transition-[width] duration-75"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ShareButtons({ locale, title }: { locale: Locale; title: string }) {
  const [copied, setCopied] = useState(false);

  function shareUrl() {
    if (typeof window === 'undefined') return '';
    return window.location.href;
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  function tweet() {
    const url = encodeURIComponent(shareUrl());
    const text = encodeURIComponent(title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'noopener');
  }

  const base =
    'inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:border-orange-400 hover:text-orange-500 dark:border-gray-700 dark:text-gray-300';

  return (
    <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-6 dark:border-gray-800">
      <span className="mr-1 text-sm font-medium text-gray-500 dark:text-gray-400">
        {locale === 'ru' ? 'Поделиться:' : 'Share:'}
      </span>
      <button type="button" className={base} onClick={tweet}>
        𝕏 {locale === 'ru' ? 'Твит' : 'Tweet'}
      </button>
      <button type="button" className={base} onClick={copy}>
        {copied ? (locale === 'ru' ? 'Скопировано!' : 'Copied!') : locale === 'ru' ? 'Копировать ссылку' : 'Copy link'}
      </button>
    </div>
  );
}
