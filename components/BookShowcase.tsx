'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { type Locale } from '@/src/i18n/settings';

export type ShowcaseItem = {
  slug: string;
  cover: string;
  title: string;
  subtitle?: string;
  specs: string[];
  price: string;
  format?: string;
  href: string;
  amazonUrl?: string;
};

const COPY = {
  en: {
    spin: 'Drag to spin · swipe to change edition',
    paused: 'Paused',
    play: 'Auto-spin',
    details: 'See the book',
    buy: 'Buy on Amazon',
    prev: 'Previous edition',
    next: 'Next edition',
    goTo: 'Show edition',
    reduce: 'Spin it',
  },
} as const;

/** Пиксели, после которых жест фиксирует ось: вверх/вниз — вращение, влево/вправо — свайп. */
const AXIS_LOCK = 12;
/** Минимальная длина горизонтального свайпа, чтобы сменить издание. */
const SWIPE_MIN = 56;
/** Длина вертикального протяга, до которой вращение идёт 1:0.62 без сопротивления. */
const SPIN_SOFT = 90;

/** Вертикальный протяг → угол поворота книги вокруг Y, с сопротивлением на краях. */
function spinAngle(dy: number): number {
  const sign = dy < 0 ? -1 : 1;
  const mag = Math.abs(dy);
  const deg = mag <= SPIN_SOFT ? mag * 0.62 : SPIN_SOFT * 0.62 + (mag - SPIN_SOFT) * 0.2;
  return Math.max(-135, Math.min(135, sign * deg));
}

/**
 * Витрина изданий: настоящая 3D-книга (обложка, корешок с текстом, торец страниц)
 * + живая текстовая панель рядом.
 *
 * Жесты разведены по оси, а не по «кто первый успел»:
 *   • протяг вверх/вниз  → книга вращается вокруг Y (автовращение на паузе, пока держишь);
 *   • свайп влево/вправо → смена издания (порог 56px, ось зафиксирована).
 * Вращение и смена издания больше не пересекаются: покрутил — издание не съехало.
 *
 * Автовращение делает CSS-анимация на композиторе — она не зависит от JS и touch-событий,
 * поэтому книга крутится и на телефоне (раньше вращение убивал «залипший» :hover).
 * Пауза при наведении включается только там, где есть настоящий курсор.
 */
export function BookShowcase({
  items,
  locale,
  label,
}: {
  items: ShowcaseItem[];
  locale: Locale;
  label?: string;
}) {
  const c = COPY[locale] ?? COPY.en;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [spinOnce, setSpinOnce] = useState(false);
  const [dragging, setDragging] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  // axis === null, пока движение меньше AXIS_LOCK; дальше фиксируется один раз:
  // 'y' — вращение (вверх/вниз), 'x' — свайп (влево/вправо).
  const dragRef = useRef<{ active: boolean; axis: null | 'x' | 'y'; startX: number; startY: number }>({
    active: false,
    axis: null,
    startX: 0,
    startY: 0,
  });
  const visibleRef = useRef(false);
  const count = Math.max(1, items.length);

  const go = useCallback(
    (delta: number) => setActive((i) => (i + delta + count) % count),
    [count],
  );

  // Системное «меньше движения»: без автовращения, но с кнопкой «Покрутить».
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Автоперелистывание изданий.
  useEffect(() => {
    if (reduce || paused) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      if (dragRef.current.active) return;
      setActive((i) => (i + 1) % count);
    }, 5200);
    return () => window.clearInterval(id);
  }, [count, paused, reduce]);

  // Наклон от курсора + мягкий отклик на скролл (только пока сцена в кадре).
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        visibleRef.current = entries.some((e) => e.isIntersecting);
      },
      { rootMargin: '120px' },
    );
    io.observe(stage);

    const paint = () => {
      raf = 0;
      if (!visibleRef.current || mq.matches) return;
      const r = stage.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = (r.top + r.height / 2 - vh / 2) / vh; // -0.5..0.5 примерно
      const sy = Math.max(-6, Math.min(6, p * 12));
      stage.style.setProperty('--bk-sy', `${sy.toFixed(2)}deg`);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const finePointer = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) return;
    const d = dragRef.current;

    // Не тащим — легкий параллакс книги за курсором (только настоящая мышь).
    if (!d.active) {
      if (!finePointer() || reduce) return;
      const r = stage.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      stage.style.setProperty('--bk-rx', `${(-7 + ny * 4).toFixed(2)}deg`);
      stage.style.setProperty('--bk-rz', `${(nx * 2.5).toFixed(2)}deg`);
      return;
    }

    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    // Ось жеста фиксируем один раз — дальше не переключаемся до отпускания.
    if (!d.axis && Math.max(Math.abs(dx), Math.abs(dy)) > AXIS_LOCK) {
      d.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }

    // Вращение — только вертикальный протяг; горизонтальный жест книгу не крутит.
    if (d.axis === 'y') {
      stage.style.setProperty('--bk-dy', `${spinAngle(dy).toFixed(2)}deg`);
    }
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    dragRef.current = { active: true, axis: null, startX: e.clientX, startY: e.clientY };
    setDragging(true);
    stage?.setAttribute('data-snap', 'false');
    try {
      stage?.setPointerCapture?.(e.pointerId);
    } catch {
      // Pointer capture не критичен — жест всё равно отработает.
    }
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    // Смену издания даёт только осознанный горизонтальный свайп.
    if (d.active && d.axis === 'x') {
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy) * 1.2) {
        go(dx < 0 ? 1 : -1);
      }
    }
    endDrag();
  };

  const endDrag = () => {
    const stage = stageRef.current;
    dragRef.current.active = false;
    dragRef.current.axis = null;
    setDragging(false);
    if (!stage) return;
    stage.setAttribute('data-snap', 'true');
    // Поворот, набранный протягом, мягко возвращается — книга снова смотрит обложкой вперёд.
    stage.style.setProperty('--bk-dy', '0deg');
  };

  const onPointerLeave = () => {
    const stage = stageRef.current;
    if (dragRef.current.active) endDrag();
    if (!stage) return;
    stage.style.setProperty('--bk-rx', '-7deg');
    stage.style.setProperty('--bk-rz', '0deg');
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
    }
  };

  const item = items[active];
  if (!item) return null;
  const floats = [item.specs[0], item.specs[1], item.price, item.specs[2]].filter(Boolean).slice(0, 4);
  const floatPos = ['tl', 'tr', 'bl', 'br'] as const;

  return (
    <div className="bk-showcase">
      {/* Сцена с книгой */}
      <div className="tilt-wrap">
        <div
          ref={stageRef}
          className="bk-stage"
          role="group"
          aria-label={label ?? 'Book showcase'}
          tabIndex={0}
          data-dragging={dragging ? 'true' : 'false'}
          data-paused={paused ? 'true' : 'false'}
          data-spin={spinOnce ? 'true' : 'false'}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={endDrag}
          onPointerLeave={onPointerLeave}
          onKeyDown={onKeyDown}
          style={{ ['--bk-dur' as string]: '22s' } as CSSProperties}
        >
          <div className="bk-orbit" aria-hidden="true">
            <i className="bk-glow" />
            <i className="bk-ring-a" />
            <i className="bk-ring-b" />
          </div>

          {floats.map((f, i) => (
            <span key={`${item.slug}-f${i}`} className="bk-float" data-pos={floatPos[i]} aria-hidden="true">
              {f}
            </span>
          ))}

          <div className="bk-spin">
            <div className="bk-drag">
              <div className="bk-tilt">
                <div className="bk">
                  <div className="bk-face bk-front">
                    {items.map((it, i) => (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        key={it.slug}
                        className="bk-cover"
                        data-on={i === active ? 'true' : 'false'}
                        src={it.cover}
                        alt={i === active ? it.title : ''}
                        draggable={false}
                        loading={i === 0 ? 'eager' : 'lazy'}
                      />
                    ))}
                  </div>
                  <div className="bk-face bk-back" aria-hidden="true" />
                  <div className="bk-face bk-spine" aria-hidden="true">
                    <span key={`${item.slug}-spine`}>{item.title}</span>
                    <i>8.5×11</i>
                  </div>
                  <div className="bk-face bk-pages" aria-hidden="true" />
                  <div className="bk-face bk-top" aria-hidden="true" />
                  <div className="bk-face bk-bottom" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>

          <div className="bk-shadow" aria-hidden="true" />
        </div>
      </div>

      {/* Живая текстовая панель */}
      <div className="bk-panel" aria-live="polite">
        <div key={item.slug} className="bk-panel-in">
          <p className="bk-kicker">
            Edition
          </p>
          <h3 className="bk-title mt-2">{item.title}</h3>
          {item.subtitle && <p className="bk-sub mt-2.5">{item.subtitle}</p>}

          <div className="bk-chips mt-4">
            {item.specs.map((s) => (
              <span key={s} className="bk-chip">
                {s}
              </span>
            ))}
          </div>

          <div className="bk-price-row mt-5">
            <span className="bk-price">{item.price}</span>
            {item.format && <span className="bk-price-note">{item.format}</span>}
          </div>

          <div className="bk-ctas">
            <Link href={item.href} className="btn-primary">
              {c.details}
            </Link>
            {item.amazonUrl && (
              <a href={item.amazonUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">
                {c.buy}
              </a>
            )}
          </div>
        </div>

        <div className="bk-nav">
          <button type="button" className="bk-arrow" onClick={() => go(-1)} aria-label={c.prev}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button type="button" className="bk-arrow" onClick={() => go(1)} aria-label={c.next}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>

          <button
            type="button"
            className="bk-play"
            onClick={() => {
              if (reduce) {
                setSpinOnce(true);
                window.setTimeout(() => setSpinOnce(false), 7200);
                return;
              }
              setPaused((v) => !v);
            }}
            aria-pressed={reduce ? undefined : paused}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {paused && !reduce ? <path d="M8 5l11 7-11 7z" /> : <path d="M9 5v14M15 5v14" />}
            </svg>
            {reduce ? c.reduce : paused ? c.paused : c.play}
          </button>

          <div className="bk-dots" role="tablist" aria-label={label ?? 'Editions'}>
            {items.map((it, i) => (
              <button
                key={it.slug}
                type="button"
                role="tab"
                className="bk-dot"
                aria-current={i === active ? 'true' : 'false'}
                aria-label={`${c.goTo} ${it.title}`}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
        </div>

        <p className="bk-hint mt-1">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4" />
          </svg>
          {c.spin}
        </p>
      </div>
    </div>
  );
}
