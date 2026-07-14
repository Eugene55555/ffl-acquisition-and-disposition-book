'use client';

import { useState } from 'react';
import { type Locale } from '@/src/i18n/settings';
import { t } from '@/src/i18n/ui';

// Ньюслеттер через Buttondown (или любой совместимый эндпоинт).
// Задай NEXT_PUBLIC_NEWSLETTER_URL при сборке, иначе форма скроется.
export function Newsletter({ locale }: { locale: Locale }) {
  const url = process.env.NEXT_PUBLIC_NEWSLETTER_URL;
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  if (!url) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const f = document.createElement('form');
    f.action = url!;
    f.method = 'POST';
    f.target = '_blank';
    const i = document.createElement('input');
    i.type = 'hidden';
    i.name = 'email';
    i.value = email;
    f.appendChild(i);
    document.body.appendChild(f);
    f.submit();
    f.remove();
    setDone(true);
  }

  const title = locale === 'ru' ? 'Подписка на новости' : 'Subscribe to the newsletter';
  const sub = locale === 'ru' ? 'Новые посты без спама.' : 'New posts, no spam.';
  const ph = locale === 'ru' ? 'you@example.com' : 'you@example.com';
  const cta = locale === 'ru' ? 'Подписаться' : 'Subscribe';

  return (
    <section className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-8 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{sub}</p>
      {done ? (
        <p className="mt-4 text-sm font-medium text-orange-600">✓ {t(locale, 'contact.send')}</p>
      ) : (
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={ph}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
          <button
            type="submit"
            className="rounded-lg bg-[linear-gradient(to_right,#FF512F,#F09819)] px-6 py-2.5 font-semibold text-white shadow hover:opacity-90"
          >
            {cta}
          </button>
        </form>
      )}
    </section>
  );
}
