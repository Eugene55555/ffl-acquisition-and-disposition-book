import { t } from '@/src/i18n/ui';
import { locales, type Locale } from '@/src/i18n/settings';
import { BookCard } from '@/components/BookCard';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function BuyPage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">{t(locale, 'buy.title')}</h1>
      <BookCard locale={locale} />
    </div>
  );
}
