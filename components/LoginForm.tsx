'use client';

import { useEffect, useState } from 'react';
import { t } from '@/src/i18n/ui';
import { type Locale } from '@/src/i18n/settings';

/**
 * Вход владельца. Это НЕ средство защиты: сайт статический, хэш пароля лежит в открытом
 * бандле. Панель лишь прячет быстрые ссылки от случайных глаз. Пароль меняется здесь:
 * положи новый SHA-256 хэш в ADMIN_HASH (см. инструкцию в README).
 */
const ADMIN_HASH = 'af69dd4f43707b85679946d3003966343a5ff3d0544100d1d752b9f0707136f7';
const STORAGE_KEY = 'st-owner';

const LINKS = [
  {
    key: 'login.linkRepo',
    href: 'https://github.com/Eugene55555/ffl-acquisition-and-disposition-book',
    hint: 'github.com/Eugene55555',
  },
  {
    key: 'login.linkCatalog',
    href: 'https://github.com/Eugene55555/ffl-acquisition-and-disposition-book/edit/main/src/lib/products.ts',
    hint: 'src/lib/products.ts',
  },
  {
    key: 'login.linkActions',
    href: 'https://github.com/Eugene55555/ffl-acquisition-and-disposition-book/actions',
    hint: 'GitHub Actions',
  },
  { key: 'login.linkComments', href: 'https://github.com/Eugene55555/ffl-acquisition-and-disposition-book/discussions', hint: 'github.com · Discussions' },
  { key: 'login.linkKdp', href: 'https://kdp.amazon.com', hint: 'kdp.amazon.com' },
] as const;

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function LoginForm({ locale }: { locale: Locale }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') setUnlocked(true);
    } catch {
      /* приватный режим — просто не запоминаем */
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    const hash = await sha256Hex(value);
    if (hash === ADMIN_HASH) {
      setUnlocked(true);
      try {
        sessionStorage.setItem(STORAGE_KEY, '1');
      } catch {}
    } else {
      setError(true);
    }
    setValue('');
    setBusy(false);
  }

  function logout() {
    setUnlocked(false);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  if (!unlocked) {
    return (
      <form onSubmit={submit} className="surface max-w-md p-7">
        <label htmlFor="owner-password" className="eyebrow">
          {t(locale, 'login.password')}
        </label>
        <input
          id="owner-password"
          type="password"
          autoComplete="current-password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-3 w-full rounded-xl border border-sand-200 bg-white px-4 py-3 font-mono text-sm text-sand-900 outline-none transition-colors focus:border-brand-400 dark:border-sand-700 dark:bg-sand-900 dark:text-sand-50"
          placeholder="••••••••••••"
        />
        {error && (
          <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">{t(locale, 'login.wrong')}</p>
        )}
        <button type="submit" disabled={busy || !value} className="btn-primary mt-5 w-full disabled:opacity-50">
          {t(locale, 'login.submit')}
        </button>
      </form>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="display text-3xl text-sand-900 dark:text-sand-50">{t(locale, 'login.panelTitle')}</h2>
        <button type="button" onClick={logout} className="btn-outline !py-2 !text-[13px]">
          {t(locale, 'login.logout')}
        </button>
      </div>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-sand-500 dark:text-sand-400">
        {t(locale, 'login.panelNote')}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {LINKS.map((l) => (
          <a
            key={l.key}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="surface group flex items-center justify-between gap-4 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-brand-300"
          >
            <span>
              <span className="block text-[15px] font-semibold text-sand-900 dark:text-sand-50">
                {t(locale, l.key)}
              </span>
              <span className="mt-1 block font-mono text-[11px] text-sand-400">{l.hint}</span>
            </span>
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-sand-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-brand-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
