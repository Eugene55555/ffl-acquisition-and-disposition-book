import { type Locale } from '@/src/i18n/settings';
import { BOOKS, formatLabel, cheapestEdition, bookUrl } from '@/src/lib/products';
import Link from 'next/link';
import { Tilt } from '@/components/Motion';

export function BookCard({ book, locale }: { book: (typeof BOOKS)[number]; locale: Locale }) {
  const text = book[locale];
  const cheapest = cheapestEdition(book);
  const href = bookUrl(book, locale);

  return (
    <Tilt innerClassName="rounded-[24px]" className="h-full">
      <Link href={href} className="book-card group h-full" aria-label={text.title}>
      <div className="book-card__media">
        <span className="book-card__badge">{book.regulation}</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cheapest.cover} alt={`${text.title} — ${formatLabel(cheapest.format, locale)}`} loading="lazy" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="eyebrow">{book.pages} pages · {book.trim}</p>
        <h3 className="mt-3 text-xl font-semibold leading-snug text-sand-900 dark:text-sand-50">
          {text.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
          {text.blurb}
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-sand-200 pt-4 dark:border-sand-800">
          <span className="font-mono text-sm text-sand-500 dark:text-sand-400">
            {locale === 'ru' ? 'от' : 'from'} {cheapest.price}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
            {locale === 'ru' ? 'Подробнее' : 'Details'}
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
      </Link>
    </Tilt>
  );
}

/** Сетка всех книг каталога. */
export function BookGrid({ locale, limit }: { locale: Locale; limit?: number }) {
  const list = limit ? BOOKS.slice(0, limit) : BOOKS;
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((book) => (
        <BookCard key={book.slug} book={book} locale={locale} />
      ))}
    </div>
  );
}
