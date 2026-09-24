'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

/**
 * Живой моушен без библиотек: 3D-наклон карточки за курсором, «магнитные» кнопки
 * и счётчики с набором чисел. Всё на CSS-переменных + rAF, уважает
 * prefers-reduced-motion и не мешает тач-скроллу.
 */

function prefersReduce() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function finePointer() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches
  );
}

/** Карточка, которая слегка поворачивается в 3D за курсором и ловит блик. */
export function Tilt({
  children,
  className = '',
  max = 7,
  shine = true,
  style,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  shine?: boolean;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !finePointer() || prefersReduce()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--tx', ((px - 0.5) * max * 2).toFixed(2));
    el.style.setProperty('--ty', ((py - 0.5) * max * 2).toFixed(2));
    el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--tx', '0');
    el.style.setProperty('--ty', '0');
  };

  return (
    <div className={`tilt-wrap ${className}`} style={style}>
      <div
        ref={ref}
        className="tilt relative h-full"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        {children}
        {shine && <span className="tilt-shine" aria-hidden="true" />}
      </div>
    </div>
  );
}

/** Кнопка/ссылка, которая слегка тянется к курсору. */
export function Magnetic({
  children,
  className = '',
  strength = 8,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const onMove = (e: ReactPointerEvent<HTMLSpanElement>) => {
    const el = ref.current;
    if (!el || !finePointer() || prefersReduce()) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    el.style.transform = `translate3d(${(dx * strength).toFixed(2)}px, ${(dy * strength).toFixed(2)}px, 0)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = 'translate3d(0,0,0)';
  };

  return (
    <span
      ref={ref}
      className={`magnetic inline-flex ${className}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </span>
  );
}

/** Число, которое «набегает» при появлении в кадре. */
export function Counter({
  value,
  duration = 1200,
  className = '',
  suffix = '',
  prefix = '',
}: {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduce()) {
      setShown(value);
      return;
    }
    let raf = 0;
    let start = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const step = (now: number) => {
          if (!start) start = now;
          const p = Math.min(1, (now - start) / duration);
          // easeOutCubic
          const eased = 1 - Math.pow(1 - p, 3);
          setShown(Math.round(value * eased));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={`counter-num ${className}`}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}
