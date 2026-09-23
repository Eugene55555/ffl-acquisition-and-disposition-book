import { locales, defaultLocale } from '@/src/i18n/settings';
import { getAllPosts } from '@/src/lib/posts';
import { BOOKS } from '@/src/lib/products';

const BASE_PATH = process.env.BASE_PATH || '/ffl-acquisition-and-disposition-book';

function getSiteUrl(): string {
  return process.env.SITE_URL || `https://eugene55555.github.io${BASE_PATH}`;
}

export default function sitemap() {
  const siteUrl = getSiteUrl();
  const staticPaths = ['', '/buy', '/blog', '/reviews', '/about', '/contact'];
  const urls: { url: string; lastModified: string; priority?: number }[] = [];
  const now = new Date().toISOString();

  for (const locale of locales) {
    urls.push({
      url: `${siteUrl}/${locale}/`,
      lastModified: now,
      priority: 1,
    });
    for (const p of staticPaths.filter(Boolean)) {
      urls.push({
        url: `${siteUrl}/${locale}${p}/`,
        lastModified: now,
        priority: p === '/buy' ? 0.9 : 0.6,
      });
    }
    for (const book of BOOKS) {
      urls.push({
        url: `${siteUrl}/${locale}/books/${book.slug}/`,
        lastModified: now,
        priority: 0.9,
      });
    }
    for (const post of getAllPosts(locale)) {
      urls.push({
        url: `${siteUrl}/${locale}/blog/${post.slug}/`,
        lastModified: new Date(post.date).toISOString(),
        priority: 0.5,
      });
    }
  }
  return urls;
}
