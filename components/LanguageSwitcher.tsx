'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { locales, localeNames, type Locale } from '@/src/i18n/settings';
import { t } from '@/src/i18n/ui';

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.6 2.6 3.6 6 3.6 9s-1 6.4-3.6 9c-2.6-2.6-3.6-6-3.6-9s1-6.4 3.6-9z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Заменяем языковой сегмент в текущем пути, сохраняя остальную часть URL.
  function switchTo(next: Locale) {
    const segments = pathname.split('/');
    // segments[0] === '' (путь начинается с '/')
    if (segments[1] && locales.includes(segments[1] as Locale)) {
      segments[1] = next;
    } else {
      segments.splice(1, 0, next);
    }
    const target = segments.join('/') || '/';
    router.push(target);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={t(locale, 'lang.switch')}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-600 transition hover:border-orange-400 hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
      >
        <GlobeIcon />
        <span className="hidden text-sm font-medium sm:inline">{localeNames[locale]}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t(locale, 'lang.switch')}
          className="absolute left-0 z-50 mt-2 w-48 origin-top-left overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg ring-1 ring-black/5 sm:left-auto sm:right-0 sm:origin-top-right dark:border-gray-700 dark:bg-gray-900"
        >
          {locales.map((l) => {
            const active = l === locale;
            return (
              <li key={l} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => switchTo(l)}
                  className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition hover:bg-orange-50 dark:hover:bg-orange-500/10 ${
                    active ? 'font-semibold text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <span>{localeNames[l]}</span>
                  <span className="text-xs uppercase tracking-wide text-gray-400">{l}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
