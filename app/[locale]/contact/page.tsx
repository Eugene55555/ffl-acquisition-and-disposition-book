import { t } from '@/src/i18n/ui';
import { locales, type Locale } from '@/src/i18n/settings';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function ContactPage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold text-gray-900">{t(locale, 'contact.title')}</h1>
      <p className="mt-3 text-gray-600">{t(locale, 'contact.subtitle')}</p>

      {/* ЗАГЛУШКА ФОРМЫ.
          Подставь свой Formspree-эндпоинт в action="https://formspree.io/f/XXXXXXX"
          или настрой Cloudflare Worker. Бэкенд не требуется. */}
      <form
        action="https://formspree.io/f/REPLACE_ME"
        method="POST"
        className="mt-8 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">{t(locale, 'contact.name')}</label>
          <input name="name" required className="mt-1 w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t(locale, 'contact.email')}</label>
          <input type="email" name="email" required className="mt-1 w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t(locale, 'contact.message')}</label>
          <textarea name="message" rows={5} required className="mt-1 w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500" />
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
