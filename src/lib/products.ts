export type Product = {
  asin: string;
  amazonUrl: string;
  price: string;
  cover: string; // путь относительно basePath, напр. /images/x.jpg
  en: { title: string; blurb: string; buy: string };
  ru: { title: string; blurb: string; buy: string };
};

// Добавь сюда новые товары — компонент BookCard отрисует их сам.
export const PRODUCTS: Product[] = [
  {
    asin: 'B0H6V4X481',
    amazonUrl: 'https://www.amazon.com/dp/B0H6V4X481',
    price: '$13.99',
    cover: '/ffl-acquisition-and-disposition-book/images/ffl-book-cover.jpg',
    en: {
      title: 'FFL — Acquisition & Disposition',
      blurb:
        'How firearms-related acquisitions and dispositions actually work: the paperwork, the timelines, and the traps to avoid.',
      buy: 'Buy on Amazon',
    },
    ru: {
      title: 'FFL — Приобретение и отчуждение',
      blurb: 'Как на самом деле устроены приобретение и отчуждение оружия: бумаги, сроки и типичные ошибки.',
      buy: 'Купить на Amazon',
    },
  },
];
