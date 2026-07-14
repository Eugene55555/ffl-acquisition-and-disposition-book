import { locales, defaultLocale, type Locale } from '@/src/i18n/settings';

const BASE_PATH = process.env.BASE_PATH || '/ffl-acquisition-and-disposition-book';

export function siteUrl(): string {
  return process.env.SITE_URL || `https://eugene55555.github.io${BASE_PATH}`;
}

export function absUrl(path: string): string {
  return siteUrl() + (path.startsWith('/') ? path : `/${path}`);
}

import type { Metadata } from 'next';

export function alternatesFor(pathWithoutLocale: string): Metadata['alternates'] {
  const clean = pathWithoutLocale.startsWith('/') ? pathWithoutLocale : `/${pathWithoutLocale}`;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = absUrl(`/${l}${clean}`);
  languages['x-default'] = absUrl(`/${defaultLocale}${clean}`);
  return {
    canonical: absUrl(`/${defaultLocale}${clean}`),
    languages,
  };
}

// Путь без языкового сегмента, напр. '/blog/foo' или '' (для главной).
export function alternateLanguages(pathWithoutLocale: string): Record<string, string> {
  const clean = pathWithoutLocale.startsWith('/') ? pathWithoutLocale : `/${pathWithoutLocale}`;
  const map: Record<string, string> = {};
  for (const l of locales) {
    map[l] = absUrl(`/${l}${clean}`);
  }
  map['x-default'] = absUrl(`/${defaultLocale}${clean}`);
  return map;
}

export const OG_IMAGE = {
  en: absUrl('/og-en.png'),
  ru: absUrl('/og-ru.png'),
};
