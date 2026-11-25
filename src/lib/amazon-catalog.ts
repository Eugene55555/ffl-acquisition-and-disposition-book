import rawCatalog from './amazon-catalog.json';
import type { Locale } from '@/src/i18n/settings';

export type AmazonFormat = 'paperback' | 'hardcover';

export type AmazonCatalogOffer = {
  format: AmazonFormat;
  asin: string;
  price: string | null;
  availability?: string;
  amazonUrl: string;
};

export type AmazonCatalogItem = {
  slug: string;
  mainAsin: string;
  category: 'ffl' | 'range';
  bookSlug: string | null;
  sourceTitle: string;
  title: Record<Locale, string>;
  subtitle: Record<Locale, string>;
  summary: Record<Locale, string>;
  cover: string;
  sourceCoverUrl: string;
  offers: AmazonCatalogOffer[];
};

export type AmazonCatalogSnapshot = {
  sourceUrl: string;
  sourcePageUrl: string;
  sourceSnapshotAt: string;
  lastVerified: string;
  sourceListingCount: number;
  formatAsinCount: number;
  authorStoreUrl: string;
  items: AmazonCatalogItem[];
};

export const AMAZON_CATALOG = rawCatalog as AmazonCatalogSnapshot;

export function getAmazonOffer(asin: string): AmazonCatalogOffer | undefined {
  return AMAZON_CATALOG.items.flatMap((item) => item.offers).find((offer) => offer.asin === asin);
}

export function pricedAmazonOffer(asin: string): AmazonCatalogOffer & { price: string } {
  const offer = getAmazonOffer(asin);
  if (!offer || !offer.price) {
    throw new Error(`No verified Amazon price for ASIN ${asin}`);
  }
  return {
    format: offer.format,
    asin: offer.asin,
    amazonUrl: offer.amazonUrl,
    price: offer.price,
  };
}
