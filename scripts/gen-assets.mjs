// Генерация OG-картинок и иконок через Chromium headless (screenshot).
// Запуск: node scripts/gen-assets.mjs
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const out = join(root, 'public');
mkdirSync(out, { recursive: true });

const PAGE = (title, subtitle, lang) => `<!doctype html><html><head><meta charset="utf-8">
<style>
  * { margin:0; box-sizing:border-box; }
  html,body { height:100%; }
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
  .card {
    width:1200px; height:630px; padding:80px;
    display:flex; flex-direction:column; justify-content:space-between;
    background: linear-gradient(135deg,#FF512F,#F09819);
    color:#fff;
  }
  .logo { display:flex; align-items:center; gap:16px; }
  .dot { width:48px; height:48px; border-radius:14px; background:rgba(255,255,255,.9); }
  .brand { font-size:34px; font-weight:800; letter-spacing:.5px; }
  h1 { font-size:74px; line-height:1.05; font-weight:800; max-width:980px; }
  .sub { font-size:34px; opacity:.92; }
  .foot { font-size:26px; opacity:.8; }
</style></head><body>
  <div class="card" lang="${lang}">
    <div class="logo"><span class="dot"></span><span class="brand">Blog</span></div>
    <div>
      <h1>${title}</h1>
      <p class="sub">${subtitle}</p>
    </div>
    <div class="foot">Notes · Guides · Products</div>
  </div>
</body></html>`;

const ICON = `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0} body{display:flex;align-items:center;justify-content:center;height:100vh;background:#fff}
  .d{width:80%;height:80%;border-radius:22%;background:linear-gradient(135deg,#FF512F,#F09819)}
</style></head><body><div class="d"></div></body></html>`;

const dark = '#0b0b0f';
const ICON_DARK = `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0} body{display:flex;align-items:center;justify-content:center;height:100vh;background:${dark}}
  .d{width:80%;height:80%;border-radius:22%;background:linear-gradient(135deg,#FF512F,#F09819)}
</style></head><body><div class="d"></div></body></html>`;

async function shot(html, file, w, h) {
  const tmp = join(out, 'tmp-' + Math.random().toString(36).slice(2) + '.html');
  writeFileSync(tmp, html);
  const url = 'file://' + tmp;
  const args = [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
    `--window-size=${w},${h}`, `--screenshot=${file}`, '--hide-scrollbars',
    `--default-background-color=00000000`, url,
  ];
  execFileSync('chromium', args, { stdio: 'ignore' });
  console.log('wrote', file);
}

await shot(PAGE('Blog', 'Notes, guides and products — built fast and clean.', 'en'), join(out, 'og-en.png'), 1200, 630);
await shot(PAGE('Блог', 'Заметки, гайды и продукты — быстро и чисто.', 'ru'), join(out, 'og-ru.png'), 1200, 630);
await shot(ICON, join(out, 'icon-192.png'), 192, 192);
await shot(ICON, join(out, 'icon-512.png'), 512, 512);
await shot(ICON_DARK, join(out, 'icon-maskable-512.png'), 512, 512);
console.log('done');
