import type { MetadataRoute } from 'next';
import { siteUrl } from '@/src/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Blog',
    short_name: 'Blog',
    description: 'Notes, guides and products — built fast and clean.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#FF512F',
    icons: [
      {
        src: siteUrl() + '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: siteUrl() + '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
