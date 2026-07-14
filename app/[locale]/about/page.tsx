import type { Metadata } from 'next';
import { t } from '@/src/i18n/ui';
import { locales, type Locale } from '@/src/i18n/settings';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  return {
    title: t(locale, 'seo.about.title'),
    description: t(locale, 'seo.about.desc'),
  };
}

export default function AboutPage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t(locale, 'about.title')}</h1>
      <p className="mt-4 text-gray-600 leading-relaxed dark:text-gray-300">
        {locale === 'ru'
          ? 'Мы пишем о том, что важно — честно, без воды. Этот блог собран на быстром статическом стеке, поэтому он загружается мгновенно и хорошо индексируется.'
          : 'We write about what matters — honest, no fluff. This blog runs on a fast static stack, so it loads instantly and indexes well.'}
      </p>
    </div>
  );
}
