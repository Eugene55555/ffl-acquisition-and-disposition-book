import { type Locale } from '@/src/i18n/settings';

// Реальные данные книги FFL (ASIN из рабочего workspace).
const BOOK = {
  asin: 'B0H6V4X481',
  amazonUrl: 'https://www.amazon.com/dp/B0H6V4X481',
  price: '$13.99',
  cover: '/ffl-acquisition-and-disposition-book/images/ffl-book-cover.jpg',
};

const copy = {
  en: {
    title: 'FFL — Acquisition & Disposition',
    blurb: 'How firearms-related acquisitions and dispositions actually work: the paperwork, the timelines, and the traps to avoid.',
    buy: 'Buy on Amazon',
  },
  ru: {
    title: 'FFL — Приобретение и отчуждение',
    blurb: 'Как на самом деле устроены приобретение и отчуждение оружия: бумаги, сроки и типичные ошибки.',
    buy: 'Купить на Amazon',
  },
} as const;

export function BookCard({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center">
        <img
          src={BOOK.cover}
          alt={c.title}
          width={180}
          height={232}
          className="rounded-lg shadow-md"
        />
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-gray-900">{c.title}</h2>
          <p className="mt-3 text-gray-600">{c.blurb}</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:items-center">
            <a
              href={BOOK.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-[linear-gradient(to_right,#FF512F,#F09819)] px-8 py-3 font-semibold text-white shadow hover:opacity-90"
            >
              {c.buy} — {BOOK.price}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
