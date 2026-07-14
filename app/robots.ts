const BASE_PATH = process.env.BASE_PATH || '/ffl-acquisition-and-disposition-book';

function getSiteUrl(): string {
  return process.env.SITE_URL || `https://eugene55555.github.io${BASE_PATH}`;
}

export default function robots() {
  const siteUrl = getSiteUrl();
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
