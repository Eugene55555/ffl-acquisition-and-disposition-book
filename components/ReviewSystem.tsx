'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { type Locale } from '@/src/i18n/settings';
import {
  REVIEWS,
  REVIEW_BOOKS,
  REVIEW_SETTINGS,
  bookTitle,
  type Review,
  type StarRating,
} from '@/src/lib/reviews-data';
import {
  REVIEW_MAX_LENGTH,
  REVIEW_MIN_LENGTH,
  REVIEW_PER_PAGE,
  STARS_DESC,
  averageRating,
  buildEndpointPayload,
  buildOwnerEmail,
  countWords,
  emptyDraft,
  firstErrorField,
  formatAverage,
  formatReviewDate,
  hasErrors,
  initials,
  paginate,
  ratingCounts,
  ratingShare,
  readHelpfulVotes,
  selectReviews,
  toStarRating,
  validateReviewSubmission,
  writeHelpfulVote,
  type ReviewDraft,
  type ReviewErrorCode,
  type ReviewErrorField,
  type ReviewSort,
  type ValidationErrors,
} from '@/src/lib/reviews';
import '@/app/reviews.css';

// ============================================================================
// СИСТЕМА ОТЗЫВОВ — БЕЗ ЛОГИНА, БЕЗ БЭКЕНДА
// ============================================================================
// * Сервер не нужен: отзывы читаются из REVIEWS (src/lib/reviews-data.ts),
//   а форма либо делает POST на NEXT_PUBLIC_REVIEW_ENDPOINT, либо (если
//   эндпоинт не задан) собирает готовое письмо владельцу — mailto + копирование.
// * Голосование «полезно» хранится в localStorage этого браузера (try/catch).
// * Отзывов сейчас ноль — пустое состояние спроектировано как витрина,
//   а не как «сломанная» страница.

// --- Общие классы полей (не дублируем их в каждом input) --------------------
const FIELD_BASE =
  'w-full rounded-2xl border bg-white px-4 py-3 text-sm text-sand-900 placeholder:text-sand-400 transition-colors focus:outline-none focus:ring-2 dark:bg-sand-950 dark:text-sand-50';

const fieldClass = (invalid?: boolean): string =>
  `${FIELD_BASE} ${
    invalid
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/25 dark:border-red-500'
      : 'border-sand-200 focus:border-brand-500 focus:ring-brand-500/25 dark:border-sand-700'
  }`;

// --- Иконки (инлайн-SVG, без зависимостей) ---------------------------------

function StarShape({ size, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M10 1.7l2.47 5.06 5.53.8-4 3.93.94 5.55L10 14.42l-4.94 2.62.94-5.55-4-3.93 5.53-.8z"
        fill="currentColor"
      />
    </svg>
  );
}

function CheckIcon({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true" focusable="false">
      <path
        d="M8.2 14.3L3.9 10l1.4-1.4 2.9 2.8 6.5-6.4L16.1 6z"
        fill="currentColor"
      />
    </svg>
  );
}

function QuoteIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <path
        d="M7.2 11.6c1.9 0 3.2 1.4 3.2 3.3 0 1.9-1.4 3.4-3.3 3.4-2.1 0-3.6-1.6-3.6-4 0-4.1 2.7-6.9 6.6-8.1l.7 1.6c-2.4.9-3.8 2.3-4.2 4 .2-.1.4-.2.6-.2zm9 0c1.9 0 3.2 1.4 3.2 3.3 0 1.9-1.4 3.4-3.3 3.4-2.1 0-3.6-1.6-3.6-4 0-4.1 2.7-6.9 6.6-8.1l.7 1.6c-2.4.9-3.8 2.3-4.2 4 .2-.1.4-.2.6-.2z"
        fill="currentColor"
      />
    </svg>
  );
}

// --- Звёзды ----------------------------------------------------------------

/** Одна звезда с частичным заполнением (0..1) — для среднего рейтинга. */
function FillStar({ fill, size = 16 }: { fill: number; size?: number }) {
  const pct = Math.round(Math.max(0, Math.min(1, fill)) * 100);
  return (
    <span
      className="relative inline-block shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <StarShape size={size} className="absolute inset-0 text-sand-300 dark:text-sand-700" />
      <span className="absolute left-0 top-0 h-full overflow-hidden" style={{ width: `${pct}%` }}>
        <StarShape size={size} className="text-brand-500 dark:text-brand-400" />
      </span>
    </span>
  );
}

/** Пять звёзд по значению (дробное число → частичное заполнение). */
function Stars({ value, size = 16, label }: { value: number; size?: number; label?: string }) {
  return (
    <span className="review-stars inline-flex items-center gap-0.5" role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <FillStar key={n} size={size} fill={value - (n - 1)} />
      ))}
    </span>
  );
}

/** Интерактивный выбор звёзд: hover, клавиатура (стрелки/Home/End), радиогруппа. */
function RatingPicker({
  value,
  labels,
  invalid,
  describedBy,
  onChange,
}: {
  value: number;
  labels: { group: string; hint: string; names: Record<number, string>; star: (n: number) => string };
  invalid?: boolean;
  describedBy?: string;
  onChange: (value: StarRating) => void;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover > 0 ? hover : Math.round(value);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        role="radiogroup"
        aria-label={labels.group}
        aria-describedby={describedBy}
        aria-invalid={invalid ? true : undefined}
        className="flex items-center"
        onMouseLeave={() => setHover(0)}
        onKeyDown={(event) => {
          const current = toStarRating(value || 0);
          if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
            event.preventDefault();
            onChange(toStarRating(current + 1));
          } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            event.preventDefault();
            onChange(toStarRating(current - 1));
          } else if (event.key === 'Home') {
            event.preventDefault();
            onChange(1);
          } else if (event.key === 'End') {
            event.preventDefault();
            onChange(5);
          }
        }}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const checked = Math.round(value) === n;
          const tabbable = checked || (Math.round(value) === 0 && n === 1);
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={labels.star(n)}
              tabIndex={tabbable ? 0 : -1}
              data-filled={n <= shown ? 'true' : 'false'}
              className="review-star-btn"
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(0)}
              onClick={() => onChange(toStarRating(n))}
            >
              <StarShape size={22} />
            </button>
          );
        })}
      </div>
      <span className="text-sm font-medium text-sand-600 dark:text-sand-300" aria-live="polite">
        {shown > 0 ? labels.names[toStarRating(shown)] : labels.hint}
      </span>
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
      {message}
    </p>
  );
}

// --- Локальные строки ru/en -------------------------------------------------

type Copy = {
  heading: string;
  lede: string;
  emptyTitle: string;
  emptyBody: string;
  emptyCta: string;
  emptyNote: string;
  writeCta: string;
  summaryHeading: string;
  basedOn: (n: number) => string;
  noRatingYet: string;
  distributionLabel: string;
  barAria: (stars: number, count: number) => string;
  ratingValue: (value: string) => string;
  searchLabel: string;
  searchPlaceholder: string;
  bookFilterLabel: string;
  allBooks: string;
  sortLabel: string;
  sort: Record<ReviewSort, string>;
  resultsCount: (n: number) => string;
  resultsNone: string;
  verified: string;
  helpful: string;
  helpfulThanks: string;
  replyFrom: string;
  showMore: string;
  showingCount: (shown: number, total: number) => string;
  photosAlt: (name: string) => string;
  noResultsTitle: string;
  noResultsBody: string;
  clearFilters: string;
  modalTitle: string;
  modalIntro: string;
  nameLabel: string;
  namePlaceholder: string;
  locationLabel: string;
  locationPlaceholder: string;
  bookLabel: string;
  bookNone: string;
  ratingLabel: string;
  ratingHint: string;
  ratingNames: Record<number, string>;
  starAria: (n: number) => string;
  titleLabel: string;
  titlePlaceholder: string;
  bodyLabel: string;
  bodyPlaceholder: string;
  bodyHint: (min: number, max: number) => string;
  bodyCounter: (chars: number, words: number, max: number) => string;
  photoLabel: string;
  photoPlaceholder: string;
  photoHint: string;
  consentLabel: string;
  submit: string;
  sending: string;
  cancel: string;
  closeLabel: string;
  errorBanner: string;
  errors: Record<ReviewErrorCode, string>;
  successTitle: string;
  successBody: string;
  errorTitle: string;
  errorBody: string;
  retry: string;
  mailTitle: string;
  mailBody: string;
  mailCta: string;
  copyCta: string;
  copiedCta: string;
  copyFailed: string;
  done: string;
  letterLabel: string;
  letterHint: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    heading: 'Reader reviews',
    lede: 'Honest notes from dealers, gunsmiths and collectors who use these books at the counter. No accounts, no star-begging — just what buyers actually wrote.',
    emptyTitle: 'No reviews published yet',
    emptyBody:
      'The first review is the hardest one. If one of these ledgers is on your bench, tell other FFL holders what the layout is like in daily use — where it helped, where it did not.',
    emptyCta: 'Write the first review',
    emptyNote: 'Reviews are read by a human and published by hand — usually within a couple of days.',
    writeCta: 'Write a review',
    summaryHeading: 'Rating summary',
    basedOn: (n) => (n === 1 ? 'based on 1 review' : `based on ${n} reviews`),
    noRatingYet: 'No rating yet',
    distributionLabel: 'Rating distribution',
    barAria: (stars, count) => `${stars} star${stars === 1 ? '' : 's'}: ${count}`,
    ratingValue: (value) => `${value} out of 5`,
    searchLabel: 'Search reviews',
    searchPlaceholder: 'e.g. serial number column',
    bookFilterLabel: 'Filter by book',
    allBooks: 'All books',
    sortLabel: 'Sort',
    sort: { newest: 'Newest first', helpful: 'Most helpful', highest: 'Highest rated', lowest: 'Lowest rated' },
    resultsCount: (n) => (n === 1 ? '1 review shown' : `${n} reviews shown`),
    resultsNone: 'No reviews match your filters',
    verified: 'Verified purchase',
    helpful: 'Helpful',
    helpfulThanks: 'Thanks',
    replyFrom: 'Reply from the author',
    showMore: 'Show more reviews',
    showingCount: (shown, total) => `Showing ${shown} of ${total}`,
    photosAlt: (name) => `Photo attached to ${name}'s review`,
    noResultsTitle: 'Nothing matches that',
    noResultsBody: 'Try a shorter search, another book, or clear the filters.',
    clearFilters: 'Clear filters',
    modalTitle: 'Write a review',
    modalIntro:
      'No account needed. Your review is sent to the site owner and published by hand — so it may take a day or two to appear.',
    nameLabel: 'Your name',
    namePlaceholder: 'Daniel R. (or a nickname)',
    locationLabel: 'City, state (optional)',
    locationPlaceholder: 'Reno, NV',
    bookLabel: 'Which book? (optional)',
    bookNone: 'Not specified',
    ratingLabel: 'Your rating',
    ratingHint: 'Pick a rating',
    ratingNames: { 1: 'Poor', 2: 'Weak', 3: 'Fine', 4: 'Good', 5: 'Excellent' },
    starAria: (n) => `Rate ${n} out of 5`,
    titleLabel: 'Headline (optional)',
    titlePlaceholder: 'Exactly the layout I needed',
    bodyLabel: 'Your review',
    bodyPlaceholder: 'What did you use it for? What worked, what did not? Plain text only.',
    bodyHint: (min, max) => `Plain text, ${min}–${max} characters.`,
    bodyCounter: (chars, words, max) => `${chars}/${max} characters · ${words} words`,
    photoLabel: 'Link to a photo (optional)',
    photoPlaceholder: 'https://…',
    photoHint: 'Paste a direct link to an image (https). We will embed it; no file upload is needed.',
    consentLabel: 'I agree that this review may be published on this site with my name and city.',
    submit: 'Send review',
    sending: 'Sending…',
    cancel: 'Cancel',
    closeLabel: 'Close the review form',
    errorBanner: 'Please fix the highlighted fields.',
    errors: {
      required: 'Please fill this in.',
      body_short: `A little more detail, please — at least ${REVIEW_MIN_LENGTH} characters.`,
      body_long: `Too long — please keep it under ${REVIEW_MAX_LENGTH} characters.`,
      photo_invalid: 'Use a full https:// image link.',
      consent_required: 'Please tick the consent box.',
      too_fast: 'That was very fast — please take a moment and send again.',
      bot: 'Something went wrong. Please try again.',
    },
    successTitle: 'Thank you — review received',
    successBody: 'Your review has been sent to the site owner. It will appear here once it is checked and published, usually within a day or two.',
    errorTitle: 'Could not send the review',
    errorBody: 'The connection failed. You can try again, or send the same text by email using the form owner address.',
    retry: 'Try again',
    mailTitle: 'Almost there — send it by email',
    mailBody: 'This site has no review server, so the text below is ready as an email. Open it in your mail app, or copy it and send it yourself.',
    mailCta: 'Send by email',
    copyCta: 'Copy the review text',
    copiedCta: 'Copied',
    copyFailed: 'Could not copy — select the text below and copy it manually.',
    done: 'Done',
    letterLabel: 'Review as an email',
    letterHint: 'Recipient',
      },
    };

export type ReviewSystemProps = {
  /** Язык интерфейса (весь текст — из локальной карты COPY). */
  locale: Locale;
  /** Отзывы. По умолчанию — массив REVIEWS из src/lib/reviews-data.ts. */
  reviews?: Review[];
  /** POST-эндпоинт формы. По умолчанию — REVIEW_SETTINGS.endpoint. */
  endpoint?: string;
  /** Адрес владельца для mailto. По умолчанию — REVIEW_SETTINGS.email. */
  email?: string;
  /** Сколько карточек показывать за раз (по умолчанию 6). */
  perPage?: number;
};

type SubmitPhase = 'form' | 'sending' | 'success' | 'mail' | 'error';

export function ReviewSystem({
  locale,
  reviews,
  endpoint,
  email,
  perPage = REVIEW_PER_PAGE,
}: ReviewSystemProps) {
  const copy = COPY[locale];
  const list = reviews ?? REVIEWS;
  const postTo = endpoint ?? REVIEW_SETTINGS.endpoint;
  const ownerAddress = email ?? REVIEW_SETTINGS.email;

  const uid = useId();
  const headingId = `${uid}-reviews-heading`;
  const dialogId = `${uid}-dialog`;
  const dialogTitleId = `${uid}-dialog-title`;
  const formErrorId = `${uid}-form-error`;

  const ids = {
    name: `${uid}-name`,
    location: `${uid}-location`,
    book: `${uid}-book`,
    rating: `${uid}-rating`,
    title: `${uid}-title`,
    body: `${uid}-body`,
    bodyHint: `${uid}-body-hint`,
    photo: `${uid}-photo`,
    photoHint: `${uid}-photo-hint`,
    consent: `${uid}-consent`,
    honeypot: `${uid}-website`,
  };

  // --- Состояние списка ---
  const [query, setQuery] = useState('');
  const [bookSlug, setBookSlug] = useState('');
  const [sort, setSort] = useState<ReviewSort>('newest');
  const [page, setPage] = useState(1);
  const [voted, setVoted] = useState<string[]>([]);

  // --- Состояние формы ---
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<SubmitPhase>('form');
  const [draft, setDraft] = useState<ReviewDraft>(emptyDraft);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [copyState, setCopyState] = useState<'idle' | 'ok' | 'failed'>('idle');

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const openedAtRef = useRef(0);

  // Голоса «полезно» читаем только после монтирования (на сервере localStorage нет).
  useEffect(() => {
    setVoted(readHelpfulVotes());
  }, []);

  // Любая смена фильтра/поиска/сортировки возвращает на первую страницу.
  useEffect(() => {
    setPage(1);
  }, [query, bookSlug, sort]);

  const closeModal = useCallback(() => {
    setOpen(false);
    setPhase('form');
    setErrors({});
    setCopyState('idle');
    setDraft(emptyDraft());
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  // Модалка: Esc закрывает, Tab не уходит за её пределы, фокус возвращается
  // на кнопку-инициатор, страница под окном не скроллится.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      (firstFieldRef.current ?? dialogRef.current)?.focus();
    }, 30);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
        return;
      }
      if (event.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, closeModal]);

  const openModal = useCallback((event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) triggerRef.current = event.currentTarget;
    openedAtRef.current = Date.now();
    setDraft(emptyDraft());
    setErrors({});
    setCopyState('idle');
    setPhase('form');
    setOpen(true);
  }, []);

  // Смена фазы (отправка → успех/ошибка/письмо) переносит фокус в диалог:
  // иначе после отправки фокус остался бы на удалённой кнопке.
  useEffect(() => {
    if (!open || phase === 'form') return;
    dialogRef.current?.focus();
  }, [open, phase]);

  // --- Производные данные ---
  const counts = useMemo(() => ratingCounts(list), [list]);
  const average = useMemo(() => averageRating(list), [list]);
  const totalReviews = list.length;

  const filtered = useMemo(
    () => selectReviews(list, { query, bookSlug: bookSlug || null, sort }),
    [list, query, bookSlug, sort],
  );
  const pageData = useMemo(() => paginate(filtered, page, perPage), [filtered, page, perPage]);

  const letter = useMemo(
    () => buildOwnerEmail(draft, locale, ownerAddress, bookTitle(draft.bookSlug || undefined, locale)),
    [draft, locale, ownerAddress],
  );

  const handleHelpful = useCallback((id: string) => {
    setVoted((prev) => (prev.includes(id) ? prev : writeHelpfulVote(id)));
  }, []);

  const update = useCallback((patch: Partial<ReviewDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const focusError = useCallback(
    (field: ReviewErrorField | undefined) => {
      if (!field || field === 'form') return;
      const map: Record<Exclude<ReviewErrorField, 'form'>, string> = {
        name: ids.name,
        rating: ids.rating,
        body: ids.body,
        photo: ids.photo,
        consent: ids.consent,
      };
      window.setTimeout(() => document.getElementById(map[field])?.focus(), 20);
    },
    [ids.body, ids.consent, ids.name, ids.photo, ids.rating],
  );

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = validateReviewSubmission(draft, openedAtRef.current, Date.now());
    setErrors(found);
    if (hasErrors(found)) {
      focusError(firstErrorField(found));
      return;
    }
    if (!postTo) {
      setPhase('mail');
      return;
    }

    setPhase('sending');
    try {
      const response = await fetch(postTo, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(buildEndpointPayload(draft, locale)),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setPhase('success');
    } catch {
      setPhase('error');
    }
  }

  async function copyLetter() {
    try {
      if (!navigator.clipboard) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(letter.body);
      setCopyState('ok');
    } catch {
      setCopyState('failed');
    }
  }

  const errText = (code?: ReviewErrorCode): string | undefined => (code ? copy.errors[code] : undefined);
  const hasAny = totalReviews > 0;
  const hasFilters = query.trim() !== '' || bookSlug !== '' || sort !== 'newest';

  const resetFilters = () => {
    setQuery('');
    setBookSlug('');
    setSort('newest');
  };

  const writeButton = (variant: 'primary' | 'outline') => (
    <button
      type="button"
      onClick={openModal}
      className={variant === 'primary' ? 'btn-primary' : 'btn-outline'}
    >
      {hasAny ? copy.writeCta : copy.emptyCta}
    </button>
  );

  return (
    <section className="section" aria-labelledby={headingId}>
      <h2 id={headingId} className="display text-3xl text-sand-900 sm:text-4xl dark:text-sand-50">
        {copy.heading}
      </h2>
      <p className="lede mt-4 max-w-2xl">{copy.lede}</p>

      {!hasAny ? (
        /* ---------- Пустое состояние: отзывов ноль ---------- */
        <div className="surface relative mt-10 overflow-hidden p-8 text-center sm:p-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-500/15 blur-[90px]"
          />
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-300/60 bg-brand-50 text-brand-600 dark:border-brand-900/60 dark:bg-brand-950/50 dark:text-brand-400">
            <StarShape size={30} />
          </div>
          <h3 className="display mt-6 text-2xl text-sand-900 sm:text-3xl dark:text-sand-50">
            {copy.emptyTitle}
          </h3>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-sand-600 dark:text-sand-300">
            {copy.emptyBody}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            {writeButton('primary')}
            <p className="font-mono text-[11px] uppercase tracking-wider text-sand-400">
              {copy.emptyNote}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* ---------- Сводка ---------- */}
          <h3 className="sr-only">{copy.summaryHeading}</h3>
          <div className="surface mt-10 grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,15rem)_1fr] lg:items-center">
            <div className="flex items-center gap-5">
              <span className="review-average-wrap flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-sand-200 bg-gradient-to-br from-sand-50 to-sand-100 dark:border-sand-800 dark:from-sand-900 dark:to-sand-950">
                <span className="review-average review-glint text-4xl text-sand-900 dark:text-sand-50">
                  {formatAverage(average)}
                </span>
              </span>
              <span className="min-w-0">
                <Stars value={average} size={18} label={copy.ratingValue(formatAverage(average))} />
                <span className="mt-2 block text-sm text-sand-500 dark:text-sand-400">
                  {copy.basedOn(totalReviews)}
                </span>
              </span>
            </div>

            <ul className="flex flex-col gap-2.5" aria-label={copy.distributionLabel}>
              {STARS_DESC.map((stars) => {
                const count = counts[stars];
                const share = ratingShare(count, totalReviews);
                return (
                  <li key={stars} className="flex items-center gap-3">
                    <span className="flex w-12 shrink-0 items-center gap-1 font-mono text-xs tabular-nums text-sand-500 dark:text-sand-400">
                      {stars}
                      <StarShape size={12} className="text-brand-500 dark:text-brand-400" />
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-sand-200/80 dark:bg-sand-800">
                      <span
                        className="review-bar block h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
                        style={{ width: `${Math.round(share * 100)}%` }}
                      />
                    </span>
                    <span className="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-sand-500 dark:text-sand-400">
                      {count}
                    </span>
                    <span className="sr-only">{copy.barAria(stars, count)}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ---------- Фильтры ---------- */}
          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-3xl lg:grid-cols-[1.4fr_1fr_1fr]">
              <label className="flex flex-col gap-1.5" htmlFor={`${uid}-search`}>
                <span className="eyebrow">{copy.searchLabel}</span>
                <input
                  id={`${uid}-search`}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={copy.searchPlaceholder}
                  className={fieldClass()}
                />
              </label>

              <label className="flex flex-col gap-1.5" htmlFor={`${uid}-book-filter`}>
                <span className="eyebrow">{copy.bookFilterLabel}</span>
                <select
                  id={`${uid}-book-filter`}
                  value={bookSlug}
                  onChange={(event) => setBookSlug(event.target.value)}
                  className={fieldClass()}
                >
                  <option value="">{copy.allBooks}</option>
                  {REVIEW_BOOKS.map((book) => (
                    <option key={book.slug} value={book.slug}>
                      {book.label[locale]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5" htmlFor={`${uid}-sort`}>
                <span className="eyebrow">{copy.sortLabel}</span>
                <select
                  id={`${uid}-sort`}
                  value={sort}
                  onChange={(event) => setSort(event.target.value as ReviewSort)}
                  className={fieldClass()}
                >
                  {(['newest', 'helpful', 'highest', 'lowest'] as ReviewSort[]).map((key) => (
                    <option key={key} value={key}>
                      {copy.sort[key]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="shrink-0">{writeButton('primary')}</div>
          </div>

          {/* ---------- Живой регион результатов ---------- */}
          <p
            className="mt-6 text-xs font-medium uppercase tracking-wider text-sand-500 dark:text-sand-400"
            aria-live="polite"
            aria-atomic="true"
          >
            {pageData.total === 0 ? copy.resultsNone : copy.resultsCount(pageData.total)}
          </p>

          {/* ---------- Карточки ---------- */}
          {pageData.total === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-sand-300 p-10 text-center dark:border-sand-700">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-sand-200 text-sand-400 dark:border-sand-800">
                <QuoteIcon />
              </span>
              <h3 className="display mt-5 text-xl text-sand-900 dark:text-sand-50">{copy.noResultsTitle}</h3>
              <p className="mx-auto mt-3 max-w-md text-sm text-sand-600 dark:text-sand-300">
                {copy.noResultsBody}
              </p>
              {hasFilters ? (
                <button type="button" onClick={resetFilters} className="btn-outline mt-6">
                  {copy.clearFilters}
                </button>
              ) : null}
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {pageData.items.map((review, index) => {
                const alreadyVoted = voted.includes(review.id);
                const helpfulCount = (review.helpful ?? 0) + (alreadyVoted ? 1 : 0);
                const book = bookTitle(review.bookSlug, locale);
                const dateText = formatReviewDate(review.date, locale);

                return (
                  <article
                    key={review.id}
                    data-index={index}
                    className="review-card surface flex flex-col p-5 sm:p-6"
                  >
                    <header className="flex items-start gap-3">
                      <span
                        className="review-avatar flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-sand-200 bg-gradient-to-br from-brand-50 to-sand-100 text-sm font-semibold text-brand-700 dark:border-sand-700 dark:from-brand-950/60 dark:to-sand-900 dark:text-brand-300"
                        aria-hidden="true"
                      >
                        {initials(review.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-[15px] font-semibold text-sand-900 dark:text-sand-50">
                            {review.name}
                          </span>
                          {review.verified ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                              <CheckIcon /> {copy.verified}
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-sand-500 dark:text-sand-400">
                          {review.location ? <span>{review.location}</span> : null}
                          {review.location ? <span aria-hidden="true">·</span> : null}
                          <time dateTime={review.date}>{dateText}</time>
                        </span>
                      </span>
                    </header>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Stars
                        value={review.rating}
                        size={16}
                        label={copy.ratingValue(String(review.rating))}
                      />
                      {book ? <span className="chip">{book}</span> : null}
                    </div>

                    {review.title ? (
                      <h4 className="mt-4 text-base font-semibold text-sand-900 dark:text-sand-50">
                        {review.title}
                      </h4>
                    ) : null}

                    <p className="mt-3 flex-1 whitespace-pre-line text-sm leading-relaxed text-sand-700 dark:text-sand-200">
                      {review.body}
                    </p>

                    {review.photos && review.photos.length > 0 ? (
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {review.photos.map((photo) => (
                          <li key={photo}>
                            <a
                              href={photo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block overflow-hidden rounded-xl border border-sand-200 transition-transform duration-300 hover:-translate-y-0.5 dark:border-sand-700"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={photo}
                                alt={copy.photosAlt(review.name)}
                                loading="lazy"
                                className="h-20 w-20 object-cover"
                              />
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {review.reply ? (
                      <div className="mt-4 rounded-2xl border border-brand-200/70 bg-brand-50/70 p-4 dark:border-brand-900/60 dark:bg-brand-950/40">
                        <p className="eyebrow">{copy.replyFrom}</p>
                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-sand-700 dark:text-sand-200">
                          {review.reply.text}
                        </p>
                        <p className="mt-2 font-mono text-[11px] text-sand-500 dark:text-sand-400">
                          {formatReviewDate(review.reply.date, locale)}
                        </p>
                      </div>
                    ) : null}

                    <footer className="mt-5 flex items-center justify-between gap-3 border-t border-sand-200/80 pt-4 dark:border-sand-800">
                      <button
                        type="button"
                        onClick={() => handleHelpful(review.id)}
                        disabled={alreadyVoted}
                        aria-pressed={alreadyVoted}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-sand-200 px-4 text-xs font-semibold text-sand-600 transition-colors hover:border-brand-400 hover:text-brand-600 disabled:opacity-60 dark:border-sand-700 dark:text-sand-300 dark:hover:text-brand-400"
                      >
                        <span aria-hidden="true">▲</span>
                        {alreadyVoted ? copy.helpfulThanks : copy.helpful}
                        <span className="font-mono tabular-nums">{helpfulCount}</span>
                      </button>
                    </footer>
                  </article>
                );
              })}
            </div>
          )}

          {/* ---------- «Показать ещё» ---------- */}
          {pageData.hasMore ? (
            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                className="btn-outline"
              >
                {copy.showMore}
              </button>
              <p className="font-mono text-[11px] uppercase tracking-wider text-sand-400">
                {copy.showingCount(pageData.items.length, pageData.total)}
              </p>
            </div>
          ) : null}
        </>
      )}

      {/* ---------- Модалка отправки ---------- */}
      {open ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
          <div className="review-backdrop absolute inset-0" onClick={closeModal} aria-hidden="true" />

          <div
            ref={dialogRef}
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            tabIndex={-1}
            className="review-modal relative w-full max-w-2xl rounded-t-3xl border border-sand-200 bg-sand-50 p-6 shadow-2xl sm:rounded-3xl sm:p-8 dark:border-sand-800 dark:bg-sand-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">{copy.writeCta}</p>
                <h3
                  id={dialogTitleId}
                  className="display mt-2 text-2xl text-sand-900 sm:text-3xl dark:text-sand-50"
                >
                  {copy.modalTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label={copy.closeLabel}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-sand-200 text-lg leading-none text-sand-500 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-sand-700 dark:text-sand-300"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            {phase === 'success' ? (
              <div className="review-success mt-8 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckIcon size={24} />
                </span>
                <h4 className="display mt-5 text-xl text-sand-900 dark:text-sand-50">{copy.successTitle}</h4>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-sand-600 dark:text-sand-300">
                  {copy.successBody}
                </p>
                <button type="button" onClick={closeModal} className="btn-primary mt-6">
                  {copy.done}
                </button>
              </div>
            ) : phase === 'mail' ? (
              <div className="mt-6">
                <h4 className="display text-xl text-sand-900 dark:text-sand-50">{copy.mailTitle}</h4>
                <p className="mt-3 text-sm leading-relaxed text-sand-600 dark:text-sand-300">
                  {copy.mailBody}
                </p>
                {ownerAddress.includes('@') && (
                  <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-sand-400">
                    {copy.letterHint}: {ownerAddress}
                  </p>
                )}
                <label className="mt-3 flex flex-col gap-1.5" htmlFor={`${uid}-letter`}>
                  <span className="eyebrow">{copy.letterLabel}</span>
                  <textarea
                    id={`${uid}-letter`}
                    readOnly
                    rows={8}
                    value={letter.body}
                    className={fieldClass()}
                  />
                </label>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a href={letter.mailto} className="btn-primary">
                    {copy.mailCta}
                  </a>
                  <button type="button" onClick={copyLetter} className="btn-outline">
                    {copyState === 'ok' ? copy.copiedCta : copy.copyCta}
                  </button>
                  <button type="button" onClick={closeModal} className="btn-ghost">
                    {copy.done}
                  </button>
                </div>
                {copyState === 'failed' ? (
                  <p role="alert" className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
                    {copy.copyFailed}
                  </p>
                ) : null}
              </div>
            ) : phase === 'error' ? (
              <div className="mt-6">
                <h4 className="display text-xl text-sand-900 dark:text-sand-50">{copy.errorTitle}</h4>
                <p className="mt-3 text-sm leading-relaxed text-sand-600 dark:text-sand-300">{copy.errorBody}</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button type="button" onClick={() => setPhase('form')} className="btn-primary">
                    {copy.retry}
                  </button>
                  <button type="button" onClick={closeModal} className="btn-ghost">
                    {copy.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={submitReview} noValidate>
                <p className="text-sm leading-relaxed text-sand-600 dark:text-sand-300">{copy.modalIntro}</p>

                {errors.form ? (
                  <p
                    id={formErrorId}
                    role="alert"
                    className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                  >
                    {errText(errors.form)}
                  </p>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5" htmlFor={ids.name}>
                    <span className="eyebrow">{copy.nameLabel}</span>
                    <input
                      ref={firstFieldRef}
                      id={ids.name}
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={draft.name}
                      onChange={(event) => update({ name: event.target.value })}
                      placeholder={copy.namePlaceholder}
                      aria-invalid={errors.name ? true : undefined}
                      aria-describedby={errors.name ? `${ids.name}-error` : undefined}
                      className={fieldClass(Boolean(errors.name))}
                    />
                    <FieldError id={`${ids.name}-error`} message={errText(errors.name)} />
                  </label>

                  <label className="flex flex-col gap-1.5" htmlFor={ids.location}>
                    <span className="eyebrow">{copy.locationLabel}</span>
                    <input
                      id={ids.location}
                      name="location"
                      type="text"
                      autoComplete="address-level2"
                      value={draft.location}
                      onChange={(event) => update({ location: event.target.value })}
                      placeholder={copy.locationPlaceholder}
                      className={fieldClass()}
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1.5" htmlFor={ids.book}>
                  <span className="eyebrow">{copy.bookLabel}</span>
                  <select
                    id={ids.book}
                    name="book"
                    value={draft.bookSlug}
                    onChange={(event) => update({ bookSlug: event.target.value })}
                    className={fieldClass()}
                  >
                    <option value="">{copy.bookNone}</option>
                    {REVIEW_BOOKS.map((book) => (
                      <option key={book.slug} value={book.slug}>
                        {book.label[locale]}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex flex-col gap-2" id={ids.rating} tabIndex={-1}>
                  <span className="eyebrow">{copy.ratingLabel}</span>
                  <RatingPicker
                    value={draft.rating}
                    invalid={Boolean(errors.rating)}
                    describedBy={errors.rating ? `${ids.rating}-error` : undefined}
                    labels={{
                      group: copy.ratingLabel,
                      hint: copy.ratingHint,
                      names: copy.ratingNames,
                      star: copy.starAria,
                    }}
                    onChange={(value) => update({ rating: value })}
                  />
                  <FieldError id={`${ids.rating}-error`} message={errText(errors.rating)} />
                </div>

                <label className="flex flex-col gap-1.5" htmlFor={ids.title}>
                  <span className="eyebrow">{copy.titleLabel}</span>
                  <input
                    id={ids.title}
                    name="title"
                    type="text"
                    value={draft.title}
                    onChange={(event) => update({ title: event.target.value })}
                    placeholder={copy.titlePlaceholder}
                    className={fieldClass()}
                  />
                </label>

                <label className="flex flex-col gap-1.5" htmlFor={ids.body}>
                  <span className="eyebrow">{copy.bodyLabel}</span>
                  <textarea
                    id={ids.body}
                    name="body"
                    rows={6}
                    maxLength={REVIEW_MAX_LENGTH}
                    value={draft.body}
                    onChange={(event) => update({ body: event.target.value })}
                    placeholder={copy.bodyPlaceholder}
                    aria-invalid={errors.body ? true : undefined}
                    aria-describedby={`${ids.bodyHint}${errors.body ? ` ${ids.body}-error` : ''}`}
                    className={fieldClass(Boolean(errors.body))}
                  />
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span id={ids.bodyHint} className="text-xs text-sand-500 dark:text-sand-400">
                      {copy.bodyHint(REVIEW_MIN_LENGTH, REVIEW_MAX_LENGTH)}
                    </span>
                    <span className="font-mono text-[11px] tabular-nums text-sand-400">
                      {copy.bodyCounter(draft.body.trim().length, countWords(draft.body), REVIEW_MAX_LENGTH)}
                    </span>
                  </span>
                  <FieldError id={`${ids.body}-error`} message={errText(errors.body)} />
                </label>

                <label className="flex flex-col gap-1.5" htmlFor={ids.photo}>
                  <span className="eyebrow">{copy.photoLabel}</span>
                  <input
                    id={ids.photo}
                    name="photo"
                    type="url"
                    inputMode="url"
                    value={draft.photoUrl}
                    onChange={(event) => update({ photoUrl: event.target.value })}
                    placeholder={copy.photoPlaceholder}
                    aria-invalid={errors.photo ? true : undefined}
                    aria-describedby={`${ids.photoHint}${errors.photo ? ` ${ids.photo}-error` : ''}`}
                    className={fieldClass(Boolean(errors.photo))}
                  />
                  <span id={ids.photoHint} className="text-xs text-sand-500 dark:text-sand-400">
                    {copy.photoHint}
                  </span>
                  <FieldError id={`${ids.photo}-error`} message={errText(errors.photo)} />
                </label>

                {/* Ловушка для ботов: люди этого поля не видят */}
                <div
                  aria-hidden="true"
                  className="absolute h-0 w-0 overflow-hidden opacity-0"
                >
                  <label htmlFor={ids.honeypot}>Website</label>
                  <input
                    id={ids.honeypot}
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={draft.honeypot}
                    onChange={(event) => update({ honeypot: event.target.value })}
                  />
                </div>

                <label
                  htmlFor={ids.consent}
                  className="flex cursor-pointer items-start gap-3 rounded-2xl border border-sand-200 p-4 dark:border-sand-800"
                >
                  <input
                    id={ids.consent}
                    name="consent"
                    type="checkbox"
                    checked={draft.consent}
                    onChange={(event) => update({ consent: event.target.checked })}
                    aria-invalid={errors.consent ? true : undefined}
                    aria-describedby={errors.consent ? `${ids.consent}-error` : undefined}
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border-sand-300 text-brand-600 focus:ring-brand-500 dark:border-sand-700"
                  />
                  <span className="text-sm leading-relaxed text-sand-600 dark:text-sand-300">
                    {copy.consentLabel}
                  </span>
                </label>
                <FieldError id={`${ids.consent}-error`} message={errText(errors.consent)} />

                {hasErrors(errors) && !errors.form ? (
                  <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
                    {copy.errorBanner}
                  </p>
                ) : null}

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                  <button type="submit" className="btn-primary" disabled={phase === 'sending'}>
                    {phase === 'sending' ? copy.sending : copy.submit}
                  </button>
                  <button type="button" onClick={closeModal} className="btn-ghost">
                    {copy.cancel}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ReviewSystem;