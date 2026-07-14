import { t } from '@/src/i18n/ui';
import { locales, type Locale } from '@/src/i18n/settings';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function BuyPage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="text-3xl font-bold text-gray-900">{t(locale, 'buy.title')}</h1>
      <p className="mt-3 text-gray-600">{t(locale, 'buy.subtitle')}</p>

      {/* ЗАГЛУШКА ПЛАТЁЖКИ.
          Позже замени href на реальную ссылку Gumroad / Stripe / PayPal.
          Пока это просто кнопка-ссылка: бэкенд не нужен. */}
      <div className="mt-10 rounded-2xl border border-gray-200 p-8">
        <p className="text-gray-500">
          {locale === 'ru' ? 'Продукт — скоро в продаже.' : 'Product — coming soon.'}
        </p>
        <a
          href="#"
          className="mt-6 inline-block rounded-lg bg-[linear-gradient(to_right,#FF512F,#F09819)] px-8 py-3 font-semibold text-white shadow hover:opacity-90"
        >
          {t(locale, 'buy.cta')}
        </a>
      </div>
    </div>
  );
}
