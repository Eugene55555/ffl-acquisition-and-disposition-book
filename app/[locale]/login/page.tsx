import type { Metadata } from 'next';
import { t } from '@/src/i18n/ui';
import { locales, type Locale } from '@/src/i18n/settings';
import { alternatesFor } from '@/src/lib/seo';
import { Reveal } from '@/components/Reveal';
import { LoginForm } from '@/components/LoginForm';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  return {
    title: t(locale, 'seo.login.title'),
    description: t(locale, 'seo.login.desc'),
    alternates: alternatesFor('/login'),
    robots: { index: false, follow: false },
  };
}

export default function LoginPage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  return (
    <section className="section">
      <div className="shell max-w-3xl">
        <Reveal>
          <p className="eyebrow">{t(locale, 'nav.login')}</p>
          <h1 className="display mt-4 text-4xl text-sand-900 sm:text-5xl dark:text-sand-50">
            {t(locale, 'login.title')}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-sand-500 dark:text-sand-400">
            {t(locale, 'login.subtitle')}
          </p>
        </Reveal>
        <div className="mt-10">
          <LoginForm locale={locale} />
        </div>
      </div>
    </section>
  );
}
