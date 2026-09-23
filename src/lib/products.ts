import { type Locale } from '@/src/i18n/settings';

// === КАТАЛОГ КНИГ ===
// Единый реестр: правка здесь обновляет карточки, лендинги книг, магазин и SEO.
// Цены, ASIN и форматы — фактические данные с Amazon (проверено 23.09.2026).

export type Format = 'paperback' | 'hardcover';

export type Edition = {
  format: Format;
  asin: string;
  amazonUrl: string;
  price: string;
  cover: string;
};

export type Faq = { q: string; a: string };

export type BookText = {
  title: string;
  subtitle: string;
  blurb: string;
  highlights: string[];
  inside: string[];
  faq: Faq[];
};

export type Book = {
  slug: string;
  series: 'classic' | 'expanded' | 'landscape';
  pages: number;
  entries?: number;
  trim: string;
  regulation: string;
  featured?: boolean;
  editions: Edition[];
  en: BookText;
  ru: BookText;
};

const AMZ = 'https://www.amazon.com';
const BASE = process.env.BASE_PATH || '/ffl-acquisition-and-disposition-book';
const cover = (file: string) => `${BASE}/images/${file}`;

export const BOOKS: Book[] = [
  {
    slug: 'ffl-acquisition-disposition-120',
    series: 'classic',
    pages: 120,
    trim: '8.5 × 11 in',
    regulation: '27 CFR § 478.125',
    featured: true,
    editions: [
      {
        format: 'paperback',
        asin: 'B0H6V4X481',
        amazonUrl: `${AMZ}/dp/B0H6V4X481`,
        price: '$13.99',
        cover: cover('ffl-120-pb.jpg'),
      },
      {
        format: 'hardcover',
        asin: 'B0H6VSF6S6',
        amazonUrl: `${AMZ}/dp/B0H6VSF6S6`,
        price: '$19.99',
        cover: cover('ffl-120-hc.jpg'),
      },
    ],
    en: {
      title: 'FFL Acquisition & Disposition Book',
      subtitle: '120 pages · pre-formatted A&D ledger',
      blurb:
        'The bound acquisition and disposition record, laid out the way an inspector expects to read it. Acquisition and disposition columns side by side, a dedicated field for every required data point, and no guessing what goes where.',
      highlights: [
        'Acquisition & disposition columns side by side',
        'Dedicated fields: date · name · address · serial',
        '120 pre-formatted pages of logs',
        'A notes line on every entry',
      ],
      inside: [
        '120 pre-formatted record pages',
        'Bound book format — not loose-leaf',
        'Acquisition and disposition columns, paired per entry',
        'Plain-English notes on key 27 CFR § 478.125 points',
      ],
      faq: [
        {
          q: 'Do FFL holders have to keep acquisition and disposition records?',
          a: 'Federal law requires licensed firearms dealers to maintain acquisition and disposition records under 27 CFR § 478.125.',
        },
        {
          q: 'Paperback or hardcover — which should I get?',
          a: 'Paperback is the everyday write-in log for the counter. Hardcover is the durable, archival option for a permanent record. Many dealers keep a hardcover master and a paperback working copy.',
        },
        {
          q: 'Is this book "ATF approved"?',
          a: 'No log book is individually approved by ATF. This book is formatted to match the record layout inspectors look for under 27 CFR § 478.125. A compliance tool, not legal advice.',
        },
      ],
    },
    ru: {
      title: 'FFL: приобретение и отчуждение',
      subtitle: '120 страниц · готовый A&D-журнал',
      blurb:
        'Сброшюрованный журнал учёта приобретения и отчуждения оружия — в той раскладке, в которой инспектор ожидает его читать. Колонки прихода и расхода рядом, отдельное поле под каждый обязательный реквизит.',
      highlights: [
        'Колонки приобретения и отчуждения рядом',
        'Отдельные поля: дата · имя · адрес · серийный номер',
        '120 готовых страниц для записей',
        'Строка заметок на каждую запись',
      ],
      inside: [
        '120 готовых страниц учёта',
        'Формат «bound book» — не сменные листы',
        'Колонки прихода и расхода, спаренные на каждую запись',
        'Ключевые пункты 27 CFR § 478.125 простым языком',
      ],
      faq: [
        {
          q: 'Обязаны ли держатели FFL вести учёт приобретения и отчуждения?',
          a: 'Федеральный закон требует от лицензированных дилеров вести учёт приобретения и отчуждения оружия по 27 CFR § 478.125.',
        },
        {
          q: 'Бумажная или твёрдый переплёт — что взять?',
          a: 'Бумажная — рабочий журнал на прилавок. Твёрдый переплёт — долговечный архивный вариант. Многие держат твёрдый как мастер-журнал, а бумажный как рабочий.',
        },
        {
          q: 'Эта книга «одобрена ATF»?',
          a: 'Ни один подобный журнал не одобряется ATF поштучно. Книга свёрстана по той раскладке записей, которую проверяют инспекторы в рамках 27 CFR § 478.125. Это инструмент соответствия, а не юридическая консультация.',
        },
      ],
    },
  },
  {
    slug: 'ffl-acquisition-disposition-200',
    series: 'expanded',
    pages: 200,
    entries: 1372,
    trim: '8.5 × 11 in',
    regulation: '27 CFR § 478.125',
    featured: true,
    editions: [
      {
        format: 'paperback',
        asin: 'B0HH6LZYFM',
        amazonUrl: `${AMZ}/dp/B0HH6LZYFM`,
        price: '$14.99',
        cover: cover('ffl-200-pb.jpg'),
      },
      {
        format: 'hardcover',
        asin: 'B0HH6J6Q4D',
        amazonUrl: `${AMZ}/dp/B0HH6J6Q4D`,
        price: '$20.99',
        cover: cover('ffl-200-hc.jpg'),
      },
    ],
    en: {
      title: 'FFL Acquisition & Disposition Book — 200 Pages',
      subtitle: '200 pages · 1,372 record entries',
      blurb:
        'The same inspector-ready acquisition and disposition layout, with two thirds more room. 200 pages and 1,372 pre-formatted entries — built for shops that move real volume and would rather not start a second log mid-year.',
      highlights: [
        '1,372 pre-formatted record entries',
        '200 pages — fewer mid-year book changes',
        'Same 27 CFR § 478.125 column layout',
        'Notes line on every entry',
      ],
      inside: [
        '200 pre-formatted record pages',
        '1,372 acquisition & disposition entries',
        'Bound book format — not loose-leaf',
        'Plain-English notes on key 27 CFR § 478.125 points',
      ],
      faq: [
        {
          q: 'Why 200 pages instead of 120?',
          a: 'Volume. A high-turnover dealer can fill a 120-page log long before the year is out. 200 pages and 1,372 entries keep one book in service longer.',
        },
        {
          q: 'Is the layout the same as the 120-page edition?',
          a: 'Yes — the same acquisition and disposition columns, the same dedicated fields, formatted to match the layout inspectors look for under 27 CFR § 478.125.',
        },
        {
          q: 'Is this book "ATF approved"?',
          a: 'No log book is individually approved by ATF. This is a compliance tool formatted to the record layout inspectors expect, not legal advice.',
        },
      ],
    },
    ru: {
      title: 'FFL: приобретение и отчуждение — 200 страниц',
      subtitle: '200 страниц · 1 372 записи',
      blurb:
        'Та же раскладка, которую проверяют инспекторы, — но на две трети больше места. 200 страниц и 1 372 готовых строки для магазинов с реальным потоком, которым не хочется заводить второй журнал посреди года.',
      highlights: [
        '1 372 готовые строки для записей',
        '200 страниц — реже менять журнал',
        'Та же раскладка колонок по 27 CFR § 478.125',
        'Строка заметок на каждую запись',
      ],
      inside: [
        '200 готовых страниц учёта',
        '1 372 записи о приобретении и отчуждении',
        'Формат «bound book» — не сменные листы',
        'Ключевые пункты 27 CFR § 478.125 простым языком',
      ],
      faq: [
        {
          q: 'Зачем 200 страниц вместо 120?',
          a: 'Из-за объёма. Дилер с высокой оборачиваемостью заполняет журнал на 120 страниц задолго до конца года. 200 страниц и 1 372 записи держат одну книгу в работе дольше.',
        },
        {
          q: 'Раскладка такая же, как в издании на 120 страниц?',
          a: 'Да — те же колонки прихода и расхода, те же отдельные поля, свёрстано под раскладку из 27 CFR § 478.125.',
        },
        {
          q: 'Эта книга «одобрена ATF»?',
          a: 'Ни один подобный журнал не одобряется ATF поштучно. Это инструмент соответствия, а не юридическая консультация.',
        },
      ],
    },
  },
  {
    slug: 'firearms-dealer-ad-log-landscape',
    series: 'landscape',
    pages: 113,
    trim: '11 × 8.5 in (landscape)',
    regulation: '27 CFR § 478.125',
    editions: [
      {
        format: 'paperback',
        asin: 'B0H38N8XNL',
        amazonUrl: `${AMZ}/dp/B0H38N8XNL`,
        price: '$11.99',
        cover: cover('ffl-landscape-pb.jpg'),
      },
      {
        format: 'hardcover',
        asin: 'B0HC4JKFJV',
        amazonUrl: `${AMZ}/dp/B0HC4JKFJV`,
        price: '$19.99',
        cover: cover('ffl-landscape-hc.jpg'),
      },
    ],
    en: {
      title: 'Firearms Dealer A&D Log — Landscape',
      subtitle: '11 × 8.5 in wide format · Professional Compliance Series',
      blurb:
        'A wide 11 × 8.5 landscape ledger: more columns fit per line, so a long entry stays on one row instead of wrapping. For dealers and collectors who write in full addresses and want the row to breathe.',
      highlights: [
        'Wide 11 × 8.5 in landscape page',
        'More room per row — long entries stay on one line',
        'Bound book format — not loose-leaf',
        'Acquisition & disposition columns paired',
      ],
      inside: [
        '11 × 8.5 in landscape (wide) pages',
        'Acquisition and disposition columns, paired per entry',
        'Dedicated fields: date · name · address · serial',
        'Bound book format — not loose-leaf',
      ],
      faq: [
        {
          q: 'Why a landscape (wide) layout?',
          a: 'Width. A wide page fits more per row, so a full name, address and serial number stay on a single line. Some dealers find that faster to write and easier to audit.',
        },
        {
          q: 'Does this format still meet the record requirement?',
          a: 'It is formatted to the acquisition and disposition record layout expected under 27 CFR § 478.125. Page orientation is a writing-comfort choice; the fields are the same.',
        },
        {
          q: 'Is this book "ATF approved"?',
          a: 'No log book is individually approved by ATF. This is a compliance tool, not legal advice — verify current text at eCFR.gov.',
        },
      ],
    },
    ru: {
      title: 'Журнал A&D для оружейного дилера — альбомный',
      subtitle: '11 × 8.5 дюйма, широкая страница · Professional Compliance Series',
      blurb:
        'Широкий альбомный журнал 11 × 8.5: в строку влезает больше колонок, поэтому длинная запись остаётся в одной строке, а не переносится. Для дилеров и коллекционеров, которые вписывают адрес полностью.',
      highlights: [
        'Широкая альбомная страница 11 × 8.5',
        'Больше места в строке — длинные записи не переносятся',
        'Формат «bound book» — не сменные листы',
        'Колонки прихода и расхода спарены',
      ],
      inside: [
        'Альбомные (широкие) страницы 11 × 8.5',
        'Колонки прихода и расхода, спаренные на запись',
        'Отдельные поля: дата · имя · адрес · серийный номер',
        'Формат «bound book» — не сменные листы',
      ],
      faq: [
        {
          q: 'Зачем альбомная (широкая) раскладка?',
          a: 'Из-за ширины. На широкой странице в строку влезает больше: имя, адрес и серийный номер остаются в одной строке. Многим так быстрее писать и легче проверять.',
        },
        {
          q: 'Такой формат всё ещё соответствует требованиям к записям?',
          a: 'Он свёрстан под раскладку записей о приобретении и отчуждении по 27 CFR § 478.125. Ориентация страницы — вопрос удобства письма; поля те же.',
        },
        {
          q: 'Эта книга «одобрена ATF»?',
          a: 'Ни один подобный журнал не одобряется ATF поштучно. Это инструмент соответствия, а не юридическая консультация — проверяйте актуальный текст на eCFR.gov.',
        },
      ],
    },
  },
];

// === Помощники ===

export function getBook(slug: string): Book | undefined {
  return BOOKS.find((b) => b.slug === slug);
}

export function bookUrl(book: Book, locale: Locale): string {
  return `/${locale}/books/${book.slug}/`;
}

export function formatLabel(format: Format, locale: Locale): string {
  const map: Record<Locale, Record<Format, string>> = {
    en: { paperback: 'Paperback', hardcover: 'Hardcover' },
    ru: { paperback: 'Бумажная', hardcover: 'Твёрдый переплёт' },
  };
  return map[locale][format];
}

export function seriesLabel(series: Book['series'], locale: Locale): string {
  const map: Record<Locale, Record<Book['series'], string>> = {
    en: { classic: 'Classic edition', expanded: 'Expanded edition', landscape: 'Landscape edition' },
    ru: { classic: 'Классическое издание', expanded: 'Расширенное издание', landscape: 'Альбомное издание' },
  };
  return map[locale][series];
}

export function cheapestEdition(book: Book): Edition {
  return [...book.editions].sort(
    (a, b) => parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', '')),
  )[0];
}

export function editionByFormat(book: Book, format: Format): Edition | undefined {
  return book.editions.find((e) => e.format === format);
}

// Обратная совместимость со старым кодом
export type Product = Edition & { asin: string; amazonUrl: string; price: string };
export const PRODUCTS: Edition[] = BOOKS.flatMap((b) => b.editions);
