import { locales, defaultLocale } from '@/src/i18n/settings';
import { getAllPosts } from '@/src/lib/posts';

const BASE_PATH = process.env.BASE_PATH || '/ffl-acquisition-and-disposition-book';

function getSiteUrl(): string {
  return (
    process.env.SITE_URL ||
    `https://eugene55555.github.io${BASE_PATH}`
  );
}

export default function sitemap() {
  const siteUrl = getSiteUrl();
  const staticPaths = ['', '/blog', '/buy', '/about', '/contact'];
  const urls: { url: string; lastModified: string }[] = [];

  for (const locale of locales) {
    for (const p of staticPaths) {
      urls.push({
        url: `${siteUrl}/${locale}${p}/`,
        lastModified: new Date().toISOString(),
      });
    }
    for (const post of getAllPosts(locale)) {
      urls.push({
        url: `${siteUrl}/${locale}/blog/${post.slug}/`,
        lastModified: new Date(post.date).toISOString(),
      });
    }
  }
  return urls;
}
