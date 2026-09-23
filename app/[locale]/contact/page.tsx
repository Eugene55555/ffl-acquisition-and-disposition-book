import type { Metadata } from 'next';
import { t } from '@/src/i18n/ui';
import { locales, type Locale } from '@/src/i18n/settings';
import { alternatesFor, OG_IMAGE } from '@/src/lib/seo';
import { Reveal } from '@/components/Reveal';

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
      locale,
      images: [OG_IMAGE[locale]],
    },
    twitter: { images: [OG_IMAGE[locale]] },
  };
}

const FIELD =
  'mt-2 w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-sand-900 outline-none transition-colors placeholder:text-sand-400 focus:border-brand-400 dark:border-sand-700 dark:bg-sand-900 dark:text-sand-50';
const LABEL = 'block font-mono text-[11px] uppercase tracking-[0.16em] text-sand-500 dark:text-sand-400';

export default function ContactPage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'en') as Locale;

  return (
    <div>
      <section className="relative overflow-hidden pb-12 pt-14">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 right-1/3 h-[28rem] w-[28rem] animate-glow rounded-full bg-brand-500/15 blur-[120px]" />
        </div>
        <div className="shell max-w-2xl">
          <Reveal>
            <p className="eyebrow">{t(locale, 'nav.contact')}</p>
            <h1 className="display mt-4 text-4xl text-sand-900 sm:text-5xl dark:text-sand-50">
              {t(locale, 'contact.title')}
            </h1>
            <p className="lede mt-6">{t(locale, 'contact.subtitle')}</p>
          </Reveal>
        </div>
      </section>

      <section className="pb-24">
        <div className="shell max-w-2xl">
          <Reveal delay={1}>
            {/* Форма через Formspree (без БД). Эндпоинт переопределяется NEXT_PUBLIC_FORMSPREE_ID. */}
            <form
              action={`https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_ID || 'xlgqdblz'}`}
              method="POST"
              className="surface space-y-6 p-7 sm:p-9"
            >
              <div>
                <label htmlFor="contact-name" className={LABEL}>
                  {t(locale, 'contact.name')}
                </label>
                <input id="contact-name" name="name" required className={FIELD} placeholder={locale === 'ru' ? 'Как к вам обращаться' : 'What should we call you'} />
              </div>
              <div>
                <label htmlFor="contact-email" className={LABEL}>
                  {t(locale, 'contact.email')}
                </label>
                <input id="contact-email" type="email" name="email" required className={FIELD} placeholder="you@example.com" />
              </div>
              <div>
                <label htmlFor="contact-message" className={LABEL}>
                  {t(locale, 'contact.message')}
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  required
                  className={FIELD}
                  placeholder={locale === 'ru' ? 'Вопрос о книге, оптовый заказ…' : 'A question about a book, a bulk order…'}
                />
              </div>
              <button type="submit" className="btn-primary w-full sm:w-auto">
                {t(locale, 'contact.send')}
              </button>
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
