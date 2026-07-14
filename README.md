# Blog (static, Next.js export)

Fast, secure, SEO-friendly blog. No database, no admin panel, no runtime server.
Content is Markdown in `content/posts/`. Deploy via GitHub Action → GitHub Pages.

## Stack
- Next.js 14 (`output: 'export'`) — static HTML
- Tailwind CSS v4 + brand tokens copied 1:1 from the screwfast project (oklch)
- i18n: `en` + `ru` (configurable in `src/i18n/settings.ts`)
- SEO: `sitemap.xml`, `robots.txt`, RSS (`/feed.xml`), Open Graph-ready

## How to add a post
Create `content/posts/<slug>.<locale>.md`:

```
---
title: My post
date: 2026-07-14
description: Short summary for SEO.
tags: [tag1, tag2]
author: Katya
---

# Heading
Your Markdown content here.
```

`git push` to `main` → Action builds and publishes to Pages.

## Local dev
```
npm install
npm run dev      # http://localhost:3000/en/
npm run build    # outputs static site to ./out
```

## Configure language
Edit `src/i18n/settings.ts`:
```ts
export const locales = ['en', 'ru'] as const;   // drop one to keep a single language
export const defaultLocale: Locale = 'en';
```

## Configure domain
1. Buy a domain, point DNS to GitHub Pages.
2. In repo Settings → Pages → Custom domain.
3. Set repo variable `SITE_URL` (used by sitemap/robots/RSS).

## Wire up payments (placeholder on /buy)
Replace `href="#"` in `app/[locale]/buy/page.tsx` with a Gumroad / Stripe / PayPal link.

## Wire up contact form (placeholder)
Replace `action="https://formspree.io/f/REPLACE_ME"` in `app/[locale]/contact/page.tsx`
with your Formspree endpoint (or a Cloudflare Worker).
