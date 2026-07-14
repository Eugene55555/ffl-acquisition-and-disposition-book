import type { Metadata } from 'next';
import { t } from '@/src/i18n/ui';
import { locales, type Locale } from '@/src/i18n/settings';
import { alternatesFor, OG_IMAGE } from '@/src/lib/seo';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  return {
    title: t(locale, 'seo.contact.title'),
    description: t(locale, 'seo.contact.desc'),
    alternates: alternatesFor('/contact'),
    openGraph: {
      title: t(locale, 'seo.contact.title'),
      description: t(locale, 'seo.contact.desc'),
      locale: locale,
      images: [OG_IMAGE[locale]],
    },
    twitter: { images: [OG_IMAGE[locale]] },
  };
}

export default function ContactPage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t(locale, 'contact.title')}</h1>
      <p className="mt-3 text-gray-600 dark:text-gray-300">{t(locale, 'contact.subtitle')}</p>

      {/* Форма контакта через Formspree (без БД). Письма приходят на твой email.
          Эндпоинт можно переопределить через NEXT_PUBLIC_FORMSPREE_ID при сборке. */}
      <form
        action={`https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_ID || 'xlgqdblz'}`}
        method="POST"
        className="mt-8 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{t(locale, 'contact.name')}</label>
          <input name="name" required className="mt-1 w-full rounded-lg border-gray-300 bg-white text-gray-900 focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{t(locale, 'contact.email')}</label>
          <input type="email" name="email" required className="mt-1 w-full rounded-lg border-gray-300 bg-white text-gray-900 focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{t(locale, 'contact.message')}</label>
          <textarea name="message" rows={5} required className="mt-1 w-full rounded-lg border-gray-300 bg-white text-gray-900 focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-[linear-gradient(to_right,#FF512F,#F09819)] px-6 py-3 font-semibold text-white shadow hover:opacity-90"
        >
          {t(locale, 'contact.send')}
        </button>
      </form>
    </div>
  );
}
