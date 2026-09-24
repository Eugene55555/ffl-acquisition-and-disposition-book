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
    spin: 'Grab to spin 360°',
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

/** Чувствительность вращения: градусов на пиксель протяга. */
const YAW_PER_PX = 0.5;
const PITCH_PER_PX = 0.4;
/** Наклон по X ограничен, чтобы книга не встала «вверх ногами»; поворот по Y — полные 360°. */
const PITCH_LIMIT = 80;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Витрина изданий: настоящая 3D-книга (обложка, корешок с текстом, торец страниц)
 * + живая текстовая панель рядом.
 *
 * Хват мышью/пальцем = свободное вращение: влево-вправо крутит книгу вокруг Y
 * (полные 360°), вверх-вниз — наклон вокруг X. Ориентация накапливается и остаётся
 * после отпускания. Протяг по книге НИКОГДА не перелистывает издание — смена издания
 * живёт на стрелках, точках, стрелках клавиатуры и в автопрокрутке.
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
  // Накопленная ориентация книги: yaw свободный (360°), pitch в пределах PITCH_LIMIT.
  const rotRef = useRef({ yaw: 0, pitch: 0 });
  const dragRef = useRef({ active: false, startX: 0, startY: 0, baseYaw: 0, basePitch: 0 });
  // Как только книгу крутанули руками, параллакс за курсором уступает место хвату.
  const userRotatedRef = useRef(false);
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

  // Страховка: если указатель отпустили вне сцены и pointerup до неё не дошёл
  // (или pointer capture не сработал) — жест всё равно заканчивается.
  useEffect(() => {
    if (!dragging) return;
    const stop = () => endDrag();
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  const finePointer = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const applyRotation = () => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.setProperty('--bk-dy', `${rotRef.current.yaw.toFixed(2)}deg`);
    stage.style.setProperty('--bk-gx', `${rotRef.current.pitch.toFixed(2)}deg`);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) return;
    const d = dragRef.current;

    // Не держим книгу — лёгкий параллакс за курсором: только настоящая мышь
    // и только пока книгу ни разу не крутили руками (иначе он спорит с хватом).
    if (!d.active) {
      if (!finePointer() || reduce || userRotatedRef.current) return;
      const r = stage.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      stage.style.setProperty('--bk-rx', `${(-7 + ny * 4).toFixed(2)}deg`);
      stage.style.setProperty('--bk-rz', `${(nx * 2.5).toFixed(2)}deg`);
      return;
    }

    // Хват: влево-вправо — поворот вокруг Y (360°), вверх-вниз — наклон вокруг X.
    // Никакого перелистывания: издание здесь не меняется никогда.
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    rotRef.current = {
      yaw: d.baseYaw + dx * YAW_PER_PX,
      pitch: clamp(d.basePitch - dy * PITCH_PER_PX, -PITCH_LIMIT, PITCH_LIMIT),
    };
    userRotatedRef.current = true;
    applyRotation();
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      baseYaw: rotRef.current.yaw,
      basePitch: rotRef.current.pitch,
    };
    setDragging(true);
    stage?.setAttribute('data-snap', 'false');
    try {
      stage?.setPointerCapture?.(e.pointerId);
    } catch {
      // Pointer capture не критичен — жест всё равно отработает.
    }
  };

  const onPointerUp = () => endDrag();

  const endDrag = () => {
    const stage = stageRef.current;
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    setDragging(false);
    if (!stage) return;
    // Ориентацию не сбрасываем — книга остаётся там, где её оставили.
    stage.setAttribute('data-snap', 'true');
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
          onPointerCancel={onPointerUp}
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
