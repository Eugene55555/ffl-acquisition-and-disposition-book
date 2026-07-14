import type { ReactNode } from 'react';
import { Header, Footer } from '@/components/Chrome';
import { locales, type Locale } from '@/src/i18n/settings';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  return (
    <>
      <Header locale={locale} />
      <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
      <Footer locale={locale} />
    </>
  );
}
