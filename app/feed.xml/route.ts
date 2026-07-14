import { locales } from '@/src/i18n/settings';
import { getAllPosts } from '@/src/lib/posts';

const SITE_URL = process.env.SITE_URL || 'https://example.github.io/blog-site';

export const dynamic = 'force-static';

export function GET() {
  const posts = getAllPosts('en').slice(0, 20);
  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/en/blog/${p.slug}/`;
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${escapeXml(p.description || '')}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Blog</title>
    <link>${SITE_URL}/en/</link>
    <description>A fast, clean static blog.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
