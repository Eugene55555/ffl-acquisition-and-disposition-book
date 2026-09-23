'use client';

import Link from 'next/link';
import { useEffect, useRef, type CSSProperties } from 'react';
import { type Locale } from '@/src/i18n/settings';

export type CarouselItem = {
  cover: string;
  title: string;
  href: string;
};

/**
 * 3D-карусель всех изданий: CSS-трансформы (preserve-3d) вместо библиотеки —
 * крутится на GPU, вес нулевой, перетаскивание работает на тач-экранах.
 * Автовращение выключается при наведении, перетаскивании, скрытой вкладке
 * и при системном «меньше движения».
 */
export function BookCarousel({
  items,
  locale,
  label,
  hint,
}: {
  items: CarouselItem[];
  locale: Locale;
  label?: string;
  hint?: string;
}) {
  const ringRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const angle = useRef(0);
  const speed = useRef(0.16);
  const paused = useRef(false);
  const drag = useRef({ active: false, startX: 0, startAngle: 0, moved: false });

  useEffect(() => {
    const ring = ringRef.current;
    const stage = stageRef.current;
    if (!ring || !stage) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let last = performance.now();

    const apply = () => {
      ring.style.setProperty('--a', `${angle.current}deg`);
    };

    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (!reduce && !paused.current && !drag.current.active && !document.hidden) {
        angle.current += speed.current * (dt / 16.7);
        apply();
      }
      raf = requestAnimationFrame(tick);
    };
    apply();
    raf = requestAnimationFrame(tick);

    // Перетаскивание (мышь/палец)
    const onDown = (e: PointerEvent) => {
      drag.current = { active: true, startX: e.clientX, startAngle: angle.current, moved: false };
      stage.setPointerCapture?.(e.pointerId);
      stage.dataset.dragging = 'true';
    };
    const onMove = (e: PointerEvent) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.startX;
      if (Math.abs(dx) > 6) drag.current.moved = true;
      angle.current = drag.current.startAngle + dx * 0.35;
      apply();
    };
    const onUp = () => {
      drag.current.active = false;
      delete stage.dataset.dragging;
      // инерция
      if (drag.current.moved) {
        speed.current = 0.16;
      }
    };
    const onEnter = () => (paused.current = true);
    const onLeave = () => (paused.current = false);

    stage.addEventListener('pointerdown', onDown);
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerup', onUp);
    stage.addEventListener('pointercancel', onUp);
    stage.addEventListener('pointerleave', onUp);
    stage.addEventListener('mouseenter', onEnter);
    stage.addEventListener('mouseleave', onLeave);

    // Свайп не должен открывать ссылку
    const onClickCapture = (e: MouseEvent) => {
      if (drag.current.moved) {
        e.preventDefault();
        e.stopPropagation();
        drag.current.moved = false;
      }
    };
    stage.addEventListener('click', onClickCapture, true);

    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointerdown', onDown);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerup', onUp);
      stage.removeEventListener('pointercancel', onUp);
      stage.removeEventListener('pointerleave', onUp);
      stage.removeEventListener('mouseenter', onEnter);
      stage.removeEventListener('mouseleave', onLeave);
      stage.removeEventListener('click', onClickCapture, true);
    };
  }, []);

  const n = Math.max(3, items.length);

  return (
    <div className="carousel-wrap">
      {label && <p className="eyebrow text-center">{label}</p>}
      <div
        ref={stageRef}
        className="carousel-stage"
        role="group"
        aria-label={label}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            angle.current -= 60;
            ringRef.current?.style.setProperty('--a', `${angle.current}deg`);
          }
          if (e.key === 'ArrowRight') {
            angle.current += 60;
            ringRef.current?.style.setProperty('--a', `${angle.current}deg`);
          }
        }}
      >
        <div ref={ringRef} className="carousel-ring" style={{ ['--n' as string]: n } as CSSProperties}>
          {items.map((it, i) => (
            <div key={`${it.href}-${i}`} className="carousel-slot" style={{ ['--i' as string]: i } as CSSProperties}>
              <Link
                href={it.href}
                className="carousel-card"
                draggable={false}
                title={it.title}
                aria-label={it.title}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.cover} alt={it.title} draggable={false} loading="lazy" />
              </Link>
            </div>
          ))}
        </div>
        <div className="carousel-floor" aria-hidden="true" />
      </div>
      <p className="carousel-hint">
        {hint ?? (locale === 'ru' ? 'Потяните, чтобы прокрутить · ← →' : 'Drag to spin · ← →')}
      </p>
    </div>
  );
}
