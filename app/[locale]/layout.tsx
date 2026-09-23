import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Header, Footer } from '@/components/Chrome';
import { locales, type Locale } from '@/src/i18n/settings';
import { siteUrl, OG_IMAGE } from '@/src/lib/seo';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: 'ATF-Compliant FFL Bound Book — Acquisition & Disposition Logs',
    template: '%s · Silas Thorne',
  },
  openGraph: {
    type: 'website',
    siteName: 'Silas Thorne',
    images: [OG_IMAGE.en],
  },
  twitter: {
    card: 'summary_large_image',
    images: [OG_IMAGE.en],
  },
};

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Silas Thorne — FFL compliance books',
    url: siteUrl(),
    inLanguage: locale,
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header locale={locale} />
      <main id="main">{children}</main>
      <Footer locale={locale} />
    </>
  );
}
