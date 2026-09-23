'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Лёгкий параллакс: смещает содержимое по оси Y относительно центра вьюпорта.
 * Работает через requestAnimationFrame, обновляет одну CSS-переменную — без ре-рендеров React.
 */
export function Parallax({
  children,
  speed = 0.12,
  className = '',
}: {
  children: ReactNode;
  /** Множитель смещения. 0.1 — деликатно, 0.3 — заметно. */
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // прогресс: -1 (ниже вьюпорта) .. 0 (центр) .. 1 (выше вьюпорта)
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      el.style.setProperty('--py', `${(-progress * speed * 100).toFixed(2)}px`);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);

  return (
    <div ref={ref} className={`parallax ${className}`.trim()}>
      {children}
    </div>
  );
}
