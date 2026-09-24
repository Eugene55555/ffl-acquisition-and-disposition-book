import { type Locale } from '@/src/i18n/settings';
import { type Review, type ReviewSubmission, type StarRating } from '@/src/lib/reviews-data';

// ============================================================================
// ОТЗЫВЫ — ЧИСТЫЕ ФУНКЦИИ
// ============================================================================
// Здесь нет ни React, ни DOM на верхнем уровне: только вычисления, работа с
// localStorage (внутри try/catch + guard) и сборка текстов. Всё это безопасно
// вызывать и на этапе статической сборки, и в браузере.

// --- Константы формы --------------------------------------------------------
export const REVIEW_MIN_LENGTH = 20;
export const REVIEW_MAX_LENGTH = 1500;
export const REVIEW_MIN_SECONDS = 5;
export const REVIEW_PER_PAGE = 6;

// --- Рейтинг ----------------------------------------------------------------

/** Средний рейтинг. Пустой список — 0 (а не NaN). */
export function averageRating(reviews: readonly Review[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return sum / reviews.length;
}

/** Распределение по звёздам (сколько отзывов на каждую оценку). */
export function ratingCounts(reviews: readonly Review[]): Record<StarRating, number> {
  const counts: Record<StarRating, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) counts[r.rating] += 1;
  return counts;
}

/** Доля отзывов (0..1) для полоски распределения. */
export function ratingShare(count: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, count / total));
}

/** Средний рейтинг как строка с одним знаком после запятой (0 → «—»). */
export function formatAverage(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '—';
  return value.toFixed(1);
}

/** Привести произвольное число к допустимой звезде. */
export function toStarRating(value: number): StarRating {
  const n = Math.round(Number.isFinite(value) ? value : 0);
  if (n < 1) return 1;
  if (n > 5) return 5;
  return n as StarRating;
}

/** Звёзды в порядке убывания — удобно для полосок распределения. */
export const STARS_DESC: StarRating[] = [5, 4, 3, 2, 1];

// --- Фильтр, сортировка, поиск ---------------------------------------------

export type ReviewSort = 'newest' | 'helpful' | 'highest' | 'lowest';
export const REVIEW_SORTS: ReviewSort[] = ['newest', 'helpful', 'highest', 'lowest'];

export type ReviewQuery = {
  /** Поиск по имени, городу, заголовку и тексту (регистр не важен). */
  query?: string;
  /** Только отзывы об этой книге. */
  bookSlug?: string | null;
  /** Не ниже этой оценки. */
  minRating?: number | null;
  sort?: ReviewSort;
};

function timeOf(date: string): number {
  const t = Date.parse(date);
  return Number.isNaN(t) ? 0 : t;
}

function comparator(sort: ReviewSort): (a: Review, b: Review) => number {
  switch (sort) {
    case 'helpful':
      return (a, b) => (b.helpful ?? 0) - (a.helpful ?? 0) || timeOf(b.date) - timeOf(a.date);
    case 'highest':
      return (a, b) => b.rating - a.rating || timeOf(b.date) - timeOf(a.date);
    case 'lowest':
      return (a, b) => a.rating - b.rating || timeOf(b.date) - timeOf(a.date);
    case 'newest':
    default:
      return (a, b) => timeOf(b.date) - timeOf(a.date);
  }
}

export function matchesQuery(review: Review, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [review.name, review.location ?? '', review.title ?? '', review.body]
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

/** Фильтрация + поиск + сортировка. Чистая: входной массив не мутируется. */
export function selectReviews(reviews: readonly Review[], opts: ReviewQuery = {}): Review[] {
  const { query = '', bookSlug = null, minRating = null, sort = 'newest' } = opts;

  const filtered = reviews.filter((r) => {
    if (bookSlug && r.bookSlug !== bookSlug) return false;
    if (minRating && r.rating < minRating) return false;
    return matchesQuery(r, query);
  });

  return filtered.sort(comparator(sort));
}

// --- Пагинация («показать ещё») --------------------------------------------

export type ReviewPage = {
  items: Review[];
  total: number;
  page: number;
  pages: number;
  hasMore: boolean;
};

export function paginate(items: readonly Review[], page = 1, perPage = REVIEW_PER_PAGE): ReviewPage {
  const total = items.length;
  const size = Math.max(1, Math.floor(perPage) || REVIEW_PER_PAGE);
  const pages = Math.max(1, Math.ceil(total / size));
  const safePage = Math.min(Math.max(1, Math.floor(page) || 1), pages);
  const start = (safePage - 1) * size;
  return {
    items: items.slice(start, start + size),
    total,
    page: safePage,
    pages,
    hasMore: start + size < total,
  };
}

// --- Даты и имена -----------------------------------------------------------

/**
 * Дата отзыва по локали (ru-RU / en-US).
 * timeZone: 'UTC' — иначе сборка (сервер в UTC) и браузер в другой зоне
 * отрисовали бы разные строки и React ругнулся бы на hydration mismatch.
 */
export function formatReviewDate(date: string, locale: Locale): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(parsed);
  } catch {
    return date;
  }
}

/** Инициалы для аватара: «Daniel Reyes» → «DR», «madison» → «M». */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  const out = (first + last).toUpperCase();
  return out || '?';
}

/** Число слов в тексте — для счётчика под полем. */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// --- Голосование «полезно» (localStorage, без логина) -----------------------
// Всё в try/catch: приватный режим/заблокированное хранилище не должны ломать UI.

const HELPFUL_VOTES_KEY = 'ffl-reviews-helpful-v1';

/** id отзывов, за которые этот браузер уже голосовал. Никогда не бросает. */
export function readHelpfulVotes(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(HELPFUL_VOTES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

export function hasHelpfulVote(id: string): boolean {
  return readHelpfulVotes().includes(id);
}

/** Записать голос и вернуть новое состояние списка. Никогда не бросает. */
export function writeHelpfulVote(id: string): string[] {
  const next = Array.from(new Set([...readHelpfulVotes(), id]));
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(HELPFUL_VOTES_KEY, JSON.stringify(next));
    } catch {
      /* приватный режим или переполнение — молча живём без сохранения */
    }
  }
  return next;
}

// --- Валидация отправки -----------------------------------------------------

/** То, что пользователь заполняет в модалке. */
export type ReviewDraft = {
  name: string;
  location: string;
  bookSlug: string;
  rating: number;
  title: string;
  body: string;
  photoUrl: string;
  consent: boolean;
  /** Скрытое поле-ловушка: люди его не видят, боты заполняют. */
  honeypot: string;
};

export function emptyDraft(): ReviewDraft {
  return {
    name: '',
    location: '',
    bookSlug: '',
    rating: 0,
    title: '',
    body: '',
    photoUrl: '',
    consent: false,
    honeypot: '',
  };
}

export type ReviewErrorField = 'name' | 'rating' | 'body' | 'photo' | 'consent' | 'form';
export type ReviewErrorCode =
  | 'required'
  | 'body_short'
  | 'body_long'
  | 'photo_invalid'
  | 'consent_required'
  | 'too_fast'
  | 'bot';
export type ValidationErrors = Partial<Record<ReviewErrorField, ReviewErrorCode>>;

/**
 * Проверка черновика. Возвращает коды ошибок (тексты — в локали компонента).
 * openedAt/now — миллисекунды; отсекают мгновенные отправки от ботов.
 */
export function validateReviewSubmission(draft: ReviewDraft, openedAt: number, now: number): ValidationErrors {
  const errors: ValidationErrors = {};

  if (draft.honeypot.trim() !== '') {
    errors.form = 'bot';
    return errors;
  }

  const elapsed = now - openedAt;
  if (!Number.isFinite(elapsed) || elapsed < REVIEW_MIN_SECONDS * 1000) {
    errors.form = 'too_fast';
  }

  if (draft.name.trim().length < 2) errors.name = 'required';

  const rating = Math.round(draft.rating);
  if (!(rating >= 1 && rating <= 5)) errors.rating = 'required';

  const body = draft.body.trim();
  if (body.length < REVIEW_MIN_LENGTH) errors.body = 'body_short';
  else if (body.length > REVIEW_MAX_LENGTH) errors.body = 'body_long';

  const photo = draft.photoUrl.trim();
  if (photo && !/^https?:\/\/\S+$/i.test(photo)) errors.photo = 'photo_invalid';

  if (!draft.consent) errors.consent = 'consent_required';

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Порядок фокуса при ошибке — чтобы пользователь попал в первое проблемное поле. */
export const ERROR_FIELD_ORDER: ReviewErrorField[] = ['name', 'rating', 'body', 'photo', 'consent', 'form'];

export function firstErrorField(errors: ValidationErrors): ReviewErrorField | undefined {
  return ERROR_FIELD_ORDER.find((f) => errors[f] !== undefined);
}

// --- Отправка: payload и письмо --------------------------------------------

export type ReviewPayload = {
  source: 'website-reviews';
  name: string;
  location?: string;
  rating: StarRating;
  title?: string;
  body: string;
  bookSlug?: string;
  photoUrl?: string;
  locale: Locale;
  submittedAt: string;
};

function clean(value: string): string | undefined {
  const v = value.trim();
  return v === '' ? undefined : v;
}

/** JSON для POST-эндпоинта (Formspree, свой воркер и т.п.). */
export function buildEndpointPayload(draft: ReviewDraft, locale: Locale, now = new Date()): ReviewPayload {
  return {
    source: 'website-reviews',
    name: draft.name.trim(),
    location: clean(draft.location),
    rating: toStarRating(draft.rating),
    title: clean(draft.title),
    body: draft.body.trim(),
    bookSlug: clean(draft.bookSlug),
    photoUrl: clean(draft.photoUrl),
    locale,
    submittedAt: now.toISOString(),
  };
}

/** Черновик → объект Review для ручного добавления в src/lib/reviews-data.ts. */
export function draftToReview(draft: ReviewDraft): ReviewSubmission {
  return {
    name: draft.name.trim(),
    location: clean(draft.location),
    rating: toStarRating(draft.rating),
    title: clean(draft.title),
    body: draft.body.trim(),
    bookSlug: clean(draft.bookSlug),
    photoUrl: clean(draft.photoUrl),
  };
}

export type OwnerEmail = {
  subject: string;
  body: string;
  /** Готовая mailto-ссылка (subject и body закодированы). */
  mailto: string;
};

/** Текст письма владельцу — на случай, когда эндпоинт не настроен. */
export function buildOwnerEmail(
  draft: ReviewDraft,
  locale: Locale,
  email: string,
  bookLabel?: string,
): OwnerEmail {
  const ru = false;
  const rating = toStarRating(draft.rating);
  const date = new Date().toISOString().slice(0, 10);

  const subject = ru
    ? `Новый отзыв на сайте: ${rating}/5 — ${draft.name.trim() || 'без имени'}`
    : `New review from the site: ${rating}/5 — ${draft.name.trim() || 'no name'}`;

  const lines: string[] = [
    ru ? 'Новый отзыв с сайта' : 'New review from the site',
    '----------------------------------------',
    `${ru ? 'Имя' : 'Name'}: ${draft.name.trim()}`,
    `${ru ? 'Город' : 'Location'}: ${clean(draft.location) ?? '—'}`,
    `${ru ? 'Книга' : 'Book'}: ${bookLabel ?? clean(draft.bookSlug) ?? '—'}`,
    `${ru ? 'Оценка' : 'Rating'}: ${rating}/5`,
    `${ru ? 'Заголовок' : 'Title'}: ${clean(draft.title) ?? '—'}`,
    `${ru ? 'Фото' : 'Photo'}: ${clean(draft.photoUrl) ?? '—'}`,
    `${ru ? 'Дата' : 'Date'}: ${date}`,
    '----------------------------------------',
    draft.body.trim(),
    '----------------------------------------',
    ru
      ? 'Чтобы отзыв появился на сайте, добавьте объект в REVIEWS в src/lib/reviews-data.ts'
      : 'To publish it, add the object to REVIEWS in src/lib/reviews-data.ts',
  ];

  const body = lines.join('\n');
  const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return { subject, body, mailto };
}
