import { type Locale } from '@/src/i18n/settings';
import { PRODUCTS } from '@/src/lib/products';

export function BookCard({ locale }: { locale: Locale }) {
  return (
    <section className="space-y-6">
      {PRODUCTS.map((p) => {
        const c = p[locale];
        return (
          <div
            key={p.asin}
            className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center">
              <img
                src={p.cover}
                alt={c.title}
                width={180}
                height={232}
                loading="lazy"
                className="rounded-lg shadow-md"
              />
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{c.title}</h2>
                <p className="mt-3 text-gray-600 dark:text-gray-300">{c.blurb}</p>
                <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:items-center">
                  <a
                    href={p.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-lg bg-[linear-gradient(to_right,#FF512F,#F09819)] px-8 py-3 font-semibold text-white shadow hover:opacity-90"
                  >
                    {c.buy} — {p.price}
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
