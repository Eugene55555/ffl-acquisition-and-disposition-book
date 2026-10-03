import type { MetadataRoute } from 'next';
import { siteUrl } from '@/src/lib/seo';

const basePath = process.env.BASE_PATH || '/ffl-acquisition-and-disposition-book';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ATF-Compliant FFL Bound Book',
    short_name: 'FFL Bound Book',
    description: 'Pre-formatted, ATF-compliant FFL acquisition and disposition log books for dealers, gunsmiths and manufacturers.',
    start_url: `${basePath}/en/`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#FF512F',
    icons: [
      {
        src: `${basePath}/icon-192.png`,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: `${basePath}/icon-512.png`,
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: `${basePath}/icon-maskable-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
