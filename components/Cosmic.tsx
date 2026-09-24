'use client';

/**
 * Cosmic — фоновые «космические» слои для статического сайта.
 *
 * Ноль зависимостей: Canvas 2D + CSS-градиенты + чистый TypeScript.
 * Всё помещается в один файл (+ app/cosmic.css), существующие файлы не трогаются.
 *
 * Экспорты:
 *   <CosmicBackground />  — собирает все слои сразу, каждый можно выключить пропсом;
 *   <Starfield />         — Canvas 2D: 3 слоя параллакса, мерцание, дрейф,
 *                           редкие падающие звёзды, отклик на скролл и курсор;
 *   <Aurora />            — CSS-аврора из размытых пятен (медь + холодный синий);
 *   <ScrollProgress />    — тонкая полоска прочитанного с пружинным сглаживанием.
 *
 * Производительность и безопасность:
 *   - один <canvas>, position: fixed, inset: 0, pointer-events: none, z-index: -1
 *     → контент сайта остаётся кликабельным, горизонтального переполнения нет;
 *   - devicePixelRatio ограничен 2, кадры рисуются только в rAF (30 fps на экранах <768px);
 *   - пауза при document.hidden, полная остановка rAF и снятие слушателей в cleanup;
 *   - prefers-reduced-motion → статичное звёздное небо одним кадром, без падающих звёзд;
 *   - мобильные (<768px): меньше звёзд, нет падающих звёзд;
 *   - SSR-безопасно: весь доступ к window/document только внутри useEffect.
 */

import { useEffect, useRef, type CSSProperties } from 'react';
import '../app/cosmic.css';

/* ============================== типы и данные ============================= */

type RGB = readonly [number, number, number];

type Palette = {
  /** Нейтральный, холодный, тёплый (медь) оттенки звёзд. */
  star: readonly [RGB, RGB, RGB];
  bright: RGB;
  shooting: RGB;
  /** Общий множитель яркости: днём звёзды почти не видны, ночью — читаемы. */
  scale: number;
};

const PALETTES: { light: Palette; dark: Palette } = {
  light: {
    // На светлой «бумаге» звёзды — это едва заметные графитовые крупинки.
    star: [
      [124, 117, 112],
      [87, 83, 78],
      [187, 75, 8],
    ],
    bright: [226, 100, 5],
    shooting: [187, 75, 8],
    scale: 0.3,
  },
  dark: {
    star: [
      [255, 246, 235],
      [199, 216, 255],
      [255, 193, 110],
    ],
    bright: [255, 226, 190],
    shooting: [255, 157, 54],
    scale: 1,
  },
};

/** Три слоя параллакса: дальние — мелкие и тусклые, ближние — крупнее и подвижнее. */
const LAYERS = [
  { depth: 0.16, radius: 0.6, alpha: 0.44, driftX: 0.0035, driftY: 0.0022 },
  { depth: 0.44, radius: 0.9, alpha: 0.66, driftX: 0.0058, driftY: 0.0036 },
  { depth: 0.9, radius: 1.35, alpha: 1, driftX: 0.0098, driftY: 0.0058 },
] as const;

const TAU = Math.PI * 2;

type Star = {
  x: number;
  y: number;
  layer: number;
  r: number;
  a: number;
  phase: number;
  speed: number;
  tint: number;
  bright: boolean;
};

type Shot = {
  x: number;
  y: number;
  ux: number;
  uy: number;
  speed: number;
  len: number;
  life: number;
  ttl: number;
  w: number;
};

/** Остаток по модулю с положительным результатом — звёзды «заворачиваются» в поле. */
function wrap(v: number, size: number): number {
  if (size <= 0) return 0;
  const m = v % size;
  return m < 0 ? m + size : m;
}

/* ================================ Starfield =============================== */

export type StarfieldProps = {
  /** Множитель плотности звёзд. 1 — «много пустоты», 2 — плотнее. */
  density?: number;
  /** Мерцание. */
  twinkle?: boolean;
  /** Падающие звёзды (только desktop, ≥768px). */
  shootingStars?: boolean;
  /** Отклик на скролл. 0 — выключить. */
  scrollFactor?: number;
  /** Отклик на позицию курсора (только устройства с мышью). 0 — выключить. */
  pointerFactor?: number;
  className?: string;
  style?: CSSProperties;
};

export function Starfield({
  density = 1,
  twinkle = true,
  shootingStars = true,
  scrollFactor = 1,
  pointerFactor = 1,
  className = '',
  style,
}: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    let width = 1;
    let height = 1;
    let dpr = 1;
    let frameBudget = 0;
    let stars: Star[] = [];
    let sprites = new Map<string, HTMLCanvasElement>();
    const colors = new Map<number, string>();
    const lx = [0, 0, 0];
    const ly = [0, 0, 0];
    const sx = [0, 0, 0];
    const sy = [0, 0, 0];
    const so = [0, 0, 0];

    let raf = 0;
    let running = false;
    let disposed = false;
    let elapsed = 0;
    let lastNow = 0;
    let lastDraw = 0;
    let prevT = 0;
    let scrollY = 0;
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let pointerX = 0;
    let pointerY = 0;
    let shot: Shot | null = null;
    let nextShotAt = 6;
    let resizeTimer: number | undefined;

    const isDark = () => document.documentElement.classList.contains('dark');
    const palette = () => (isDark() ? PALETTES.dark : PALETTES.light);

    /* --- кэш строк цвета: одна строка на «ведро» прозрачности, без мусора в GC --- */
    const starColor = (tint: number, alpha: number): string => {
      const bucket = Math.max(1, Math.min(20, Math.round(alpha * 20)));
      const key = tint * 32 + bucket;
      const cached = colors.get(key);
      if (cached !== undefined) return cached;
      const c = palette().star[tint] ?? palette().star[0];
      const value = `rgba(${c[0]},${c[1]},${c[2]},${(bucket / 20).toFixed(2)})`;
      colors.set(key, value);
      return value;
    };

    /* --- спрайт гало для ярких звёзд: рисуем градиент один раз, дальше drawImage --- */
    const spriteFor = (tint: number, layer: number): HTMLCanvasElement | null => {
      const key = `${tint}-${layer}`;
      const hit = sprites.get(key);
      if (hit) return hit;
      const c = palette().star[tint] ?? palette().star[0];
      const size = Math.max(6, Math.round(LAYERS[layer].radius * 2.1 * 4 * dpr));
      const off = document.createElement('canvas');
      off.width = size;
      off.height = size;
      const octx = off.getContext('2d');
      if (!octx) return null;
      const half = size / 2;
      const grad = octx.createRadialGradient(half, half, 0, half, half, half);
      grad.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0.95)`);
      grad.addColorStop(0.26, `rgba(${c[0]},${c[1]},${c[2]},0.42)`);
      grad.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
      octx.fillStyle = grad;
      octx.fillRect(0, 0, size, size);
      sprites.set(key, off);
      return off;
    };

    const rebuildSprites = () => {
      sprites = new Map();
      colors.clear();
    };

    const buildStars = () => {
      const area = width * height;
      const cap = width < 768 ? 110 : 260; // слабые устройства — меньше звёзд
      const count = Math.max(28, Math.min(cap, Math.round((area / 13500) * density)));
      const list: Star[] = [];
      for (let i = 0; i < count; i++) {
        const roll = Math.random();
        const layer = roll < 0.5 ? 0 : roll < 0.84 ? 1 : 2;
        const bright = layer === 2 && Math.random() < 0.12;
        const tintRoll = Math.random();
        list.push({
          x: Math.random() * width,
          y: Math.random() * height,
          layer,
          r: bright
            ? LAYERS[layer].radius * 2.1
            : LAYERS[layer].radius * (0.6 + Math.random() * 0.7),
          a: bright ? 1 : 0.32 + Math.random() * 0.68,
          phase: Math.random() * TAU,
          speed: 0.32 + Math.random() * 1.2,
          tint: tintRoll < 0.62 ? 0 : tintRoll < 0.9 ? 1 : 2,
          bright,
        });
      }
      stars = list;
    };

    const resize = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      dpr = Math.min(2, window.devicePixelRatio || 1); // cap DPR → меньше пикселей
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      frameBudget = width < 768 ? 1000 / 30 : 0; // на телефоне 30 fps
      ctx.lineCap = 'round';
      ctx.globalAlpha = 1;
      rebuildSprites();
      buildStars();
    };

    const draw = (tMs: number) => {
      const t = tMs / 1000;
      if (prevT === 0) prevT = t;
      const dt = Math.min(0.05, Math.max(0, t - prevT));
      prevT = t;

      const pal = palette();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = 'round';

      scrollY = window.scrollY || 0;
      pointerX += (pointerTargetX - pointerX) * 0.05;
      pointerY += (pointerTargetY - pointerY) * 0.05;

      for (let li = 0; li < LAYERS.length; li++) {
        const layer = LAYERS[li];
        lx[li] = t * layer.driftX * width * 0.6;
        ly[li] = t * layer.driftY * height * 0.6;
        sx[li] = pointerX * width * 0.035 * layer.depth * pointerFactor;
        sy[li] = pointerY * height * 0.03 * layer.depth * pointerFactor;
        so[li] = scrollY * layer.depth * 0.05 * scrollFactor;
      }

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const layer = LAYERS[s.layer];
        const x = wrap(s.x + lx[s.layer] + sx[s.layer], width);
        const y = wrap(s.y + ly[s.layer] + sy[s.layer] - so[s.layer], height);
        const tw = twinkle ? 0.62 + 0.38 * Math.sin(t * s.speed + s.phase) : 1;
        const alpha = s.a * layer.alpha * pal.scale * tw;
        if (alpha <= 0.012) continue;
        if (s.bright) {
          const sprite = spriteFor(s.tint, s.layer);
          if (sprite) {
            const size = layer.radius * 2.1 * 3.4;
            ctx.globalAlpha = Math.min(1, alpha * 0.85);
            ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
            ctx.globalAlpha = 1;
            continue;
          }
        }
        ctx.fillStyle = starColor(s.tint, alpha);
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, TAU);
        ctx.fill();
      }

      /* --- падающие звёзды: только desktop и только когда движение разрешено --- */
      if (shootingStars && width >= 768 && !reduceMotion.matches) {
        if (!shot && t >= nextShotAt) {
          const dir = Math.random() < 0.5 ? 1 : -1;
          const angle = 0.4 + Math.random() * 0.22;
          const speed = (width < 1200 ? 560 : 780) * (0.85 + Math.random() * 0.35);
          const ux = dir * Math.cos(angle);
          const uy = Math.sin(angle);
          shot = {
            x: dir > 0 ? -60 : width + 60,
            y: Math.random() * height * 0.55,
            ux,
            uy,
            speed,
            len: 110 + Math.random() * 130,
            life: 0,
            ttl: 0.9 + Math.random() * 0.7,
            w: 1.3 + Math.random() * 0.9,
          };
        }
        if (shot) {
          shot.life += dt;
          if (shot.life >= shot.ttl) {
            shot = null;
            nextShotAt = t + 7 + Math.random() * 9; // редко: раз в 7–16 секунд
          } else {
            shot.x += shot.ux * shot.speed * dt;
            shot.y += shot.uy * shot.speed * dt;
            const fade = 1 - shot.life / shot.ttl;
            const tx = shot.x - shot.ux * shot.len;
            const ty = shot.y - shot.uy * shot.len;
            const c = pal.shooting;
            const grad = ctx.createLinearGradient(shot.x, shot.y, tx, ty);
            grad.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${(0.85 * fade * pal.scale).toFixed(3)})`);
            grad.addColorStop(0.4, `rgba(${c[0]},${c[1]},${c[2]},${(0.28 * fade * pal.scale).toFixed(3)})`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = shot.w;
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(shot.x, shot.y);
            ctx.stroke();
          }
        }
      } else if (shot) {
        shot = null;
      }
    };

    const loop = (now: number) => {
      if (!running || disposed) return;
      if (!lastNow) lastNow = now;
      elapsed += now - lastNow;
      lastNow = now;
      if (lastDraw === 0 || now - lastDraw >= frameBudget) {
        lastDraw = now;
        draw(elapsed);
      }
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || disposed) return;
      running = true;
      lastNow = 0; // не «доигрывать» время, потерянное в паузе
      lastDraw = 0;
      raf = requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      pointerTargetX = e.clientX / Math.max(1, width) - 0.5;
      pointerTargetY = e.clientY / Math.max(1, height) - 0.5;
    };

    const onResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        if (!running) draw(elapsed); // для reduced-motion достаточно одного статичного кадра
      }, 180);
    };

    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else if (!reduceMotion.matches) {
        start();
      } else {
        draw(elapsed);
      }
    };

    const onMotionPref = () => {
      if (reduceMotion.matches) {
        stop();
        draw(elapsed);
      } else {
        start();
      }
    };

    /* --- смена темы (кнопка .dark на <html> или системная) → пересобрать палитру --- */
    const onThemeChange = () => {
      rebuildSprites();
      if (!running) draw(elapsed);
    };
    const themeObserver = new MutationObserver(onThemeChange);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    const scheme = window.matchMedia('(prefers-color-scheme: dark)');
    scheme.addEventListener('change', onThemeChange);

    const hasPointer = finePointer.matches && !reduceMotion.matches;
    if (hasPointer) window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    reduceMotion.addEventListener('change', onMotionPref);

    resize();
    if (reduceMotion.matches) {
      draw(0); // статичное звёздное небо: ни одного кадра анимации
    } else if (!document.hidden) {
      start();
    }

    return () => {
      disposed = true;
      stop();
      if (resizeTimer) window.clearTimeout(resizeTimer);
      if (hasPointer) window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      reduceMotion.removeEventListener('change', onMotionPref);
      scheme.removeEventListener('change', onThemeChange);
      themeObserver.disconnect();
      sprites.clear();
      colors.clear();
      stars = [];
      shot = null;
    };
  }, [density, twinkle, shootingStars, scrollFactor, pointerFactor]);

  return (
    <div className={`cosmic-layer ${className}`.trim()} style={style} aria-hidden="true" data-cosmic="stars">
      <canvas ref={canvasRef} className="cosmic-canvas" />
    </div>
  );
}

/* ================================== Aurora ================================ */

export type AuroraProps = {
  /** Сколько пятен рисовать: 1–4. По умолчанию 4 (на <768px видны только два). */
  blobs?: number;
  /** Общая интенсивность 0–2. По умолчанию 1 — очень сдержанно. */
  intensity?: number;
  className?: string;
  style?: CSSProperties;
};

const BLOB_CLASSES = [
  'cosmic-aurora__blob--copper',
  'cosmic-aurora__blob--azure',
  'cosmic-aurora__blob--ember',
  'cosmic-aurora__blob--indigo',
];

export function Aurora({ blobs = 4, intensity = 1, className = '', style }: AuroraProps) {
  const count = Math.max(0, Math.min(BLOB_CLASSES.length, Math.round(blobs)));
  return (
    <div
      className={`cosmic-aurora ${className}`.trim()}
      style={{ ...style, '--cosmic-aurora-intensity': String(intensity) } as CSSProperties}
      aria-hidden="true"
      data-cosmic="aurora"
    >
      {BLOB_CLASSES.slice(0, count).map((cls) => (
        <span key={cls} className={`cosmic-aurora__blob ${cls}`} />
      ))}
    </div>
  );
}

/* ============================== ScrollProgress ============================ */

export type ScrollProgressProps = {
  /** Толщина полоски в px. */
  height?: number;
  /** Коэффициент сглаживания (0–1): меньше — мягче пружина. */
  smoothing?: number;
  /** Скрывать, если страница короче N экранов. По умолчанию 2. */
  minScreens?: number;
  className?: string;
  style?: CSSProperties;
};

export function ScrollProgress({
  height = 3,
  smoothing = 0.16,
  minScreens = 2,
  className = '',
  style,
}: ScrollProgressProps) {
  const fillRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = fillRef.current?.parentElement;
    const fill = fillRef.current;
    if (!root || !fill) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let target = 0;
    let current = 0;
    let raf = 0;
    let active = false;
    let last = 0;

    const scrollable = () =>
      Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0) -
      window.innerHeight;

    const write = () => {
      fill.style.setProperty('--cosmic-progress', current.toFixed(4));
    };

    const step = (now: number) => {
      raf = 0;
      const dt = Math.min(64, last ? now - last : 16.67);
      last = now;
      // кадронезависимый lerp: сходимость не зависит от частоты кадров
      const k = 1 - Math.pow(1 - smoothing, dt / 16.67);
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.0004) {
        current = target;
        write();
        return; // движение прекратилось — rAF останавливаем
      }
      write();
      raf = requestAnimationFrame(step);
    };

    const read = () => {
      const max = scrollable();
      const ratio = max > 0 ? window.scrollY / max : 0;
      target = Math.min(1, Math.max(0, ratio));
      if (reduceMotion.matches) {
        current = target;
        write();
        return;
      }
      if (!raf) raf = requestAnimationFrame(step);
    };

    const measure = () => {
      const nextActive = scrollable() > window.innerHeight * minScreens;
      if (nextActive !== active) {
        active = nextActive;
        root.dataset.active = active ? 'true' : 'false';
      }
      read();
    };

    const onVisibility = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
      } else {
        measure();
      }
    };

    root.dataset.active = 'false';
    measure();
    window.addEventListener('scroll', read, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    // контент может дорисоваться после монтирования (шрифты, картинки, переходы) — следим за высотой
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener('scroll', read);
      window.removeEventListener('resize', measure);
      document.removeEventListener('visibilitychange', onVisibility);
      ro.disconnect();
    };
  }, [smoothing, minScreens]);

  return (
    <div
      className={`cosmic-progress ${className}`.trim()}
      style={{ ...style, '--cosmic-progress-height': `${height}px` } as CSSProperties}
      aria-hidden="true"
    >
      <div ref={fillRef} className="cosmic-progress__bar" />
    </div>
  );
}

/* ============================== CosmicBackground ========================== */

export type CosmicBackgroundProps = {
  /** false — выключить слой; объект — передать настройки <Starfield />. */
  stars?: boolean | StarfieldProps;
  /** false — выключить слой; объект — передать настройки <Aurora />. */
  aurora?: boolean | AuroraProps;
  /** false — выключить слой; объект — передать настройки <ScrollProgress />. */
  progress?: boolean | ScrollProgressProps;
};

/**
 * Все фоновые слои одним компонентом. Ставится один раз — в layout:
 *
 *   <body>
 *     <CosmicBackground />
 *     {children}
 *   </body>
 */
export function CosmicBackground({ stars = true, aurora = true, progress = true }: CosmicBackgroundProps) {
  return (
    <>
      {aurora !== false && <Aurora {...(typeof aurora === 'object' ? aurora : {})} />}
      {stars !== false && <Starfield {...(typeof stars === 'object' ? stars : {})} />}
      {progress !== false && <ScrollProgress {...(typeof progress === 'object' ? progress : {})} />}
    </>
  );
}

export default CosmicBackground;
