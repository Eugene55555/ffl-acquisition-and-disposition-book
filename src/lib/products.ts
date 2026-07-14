export type Product = {
  asin: string;
  amazonUrl: string;
  price: string;
  cover: string; // путь относительно basePath, напр. /images/x.jpg
  format: 'paperback' | 'hardcover' | 'ebook';
  en: { title: string; blurb: string; buy: string };
  ru: { title: string; blurb: string; buy: string };
};

// Checkout для прямой продажи на сайте (Stripe / Lemon Squeezy / Paddle и т.п.).
// Задай NEXT_PUBLIC_CHECKOUT_URL при сборке, либо захардкожь ниже.
export const CHECKOUT_URL =
  process.env.NEXT_PUBLIC_CHECKOUT_URL || 'REPLACE_WITH_PAYONEER_CHECKOUT';

// Добавь сюда товары — компонент BookCard отрисует их сам.
export const PRODUCTS: Product[] = [
  {
    asin: 'B0H6V4X481',
    amazonUrl: 'https://www.amazon.com/dp/B0H6V4X481',
    price: '$13.99',
    cover: '/ffl-acquisition-and-disposition-book/images/ffl-book-cover.jpg',
    format: 'paperback',
    en: {
      title: 'FFL — Acquisition & Disposition (Paperback)',
      blurb:
        'How firearms-related acquisitions and dispositions actually work: the paperwork, the timelines, and the traps to avoid.',
      buy: 'Buy on Amazon',
    },
    ru: {
      title: 'FFL — Приобретение и отчуждение (Бумажная)',
      blurb: 'Как на самом деле устроены приобретение и отчуждение оружия: бумаги, сроки и типичные ошибки.',
      buy: 'Купить на Amazon',
    },
  },
  {
    asin: 'B0H6VSF6S6',
    amazonUrl: 'https://www.amazon.com/dp/B0H6VSF6S6',
    price: '$24.99',
    cover: '/ffl-acquisition-and-disposition-book/images/ffl-book-cover-hc.jpg',
    format: 'hardcover',
    en: {
      title: 'FFL — Acquisition & Disposition (Hardcover)',
      blurb: 'The same book, printed hardcover — built to last on the shelf.',
      buy: 'Buy on Amazon',
    },
    ru: {
      title: 'FFL — Приобретение и отчуждение (Твёрдый переплёт)',
      blurb: 'Та же книга, но в твёрдом переплёте — чтобы простояла на полке долго.',
      buy: 'Купить на Amazon',
    },
  },
];
