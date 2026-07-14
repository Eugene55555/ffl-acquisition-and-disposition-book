import { locales, defaultLocale } from '@/src/i18n/settings';
import { getAllPosts } from '@/src/lib/posts';

// Замени на свой домен после покупки (или оставь пока GitHub Pages URL).
const SITE_URL = process.env.SITE_URL || 'https://example.github.io/blog-site';

export default function sitemap() {
  const staticPaths = ['', '/blog', '/buy', '/about', '/contact'];
  const urls: { url: string; lastModified: string }[] = [];

  for (const locale of locales) {
    for (const p of staticPaths) {
      urls.push({
        url: `${SITE_URL}/${locale}${p}/`,
        lastModified: new Date().toISOString(),
      });
    }
    for (const post of getAllPosts(locale)) {
      urls.push({
        url: `${SITE_URL}/${locale}/blog/${post.slug}/`,
        lastModified: new Date(post.date).toISOString(),
      });
    }
  }
  return urls;
}
