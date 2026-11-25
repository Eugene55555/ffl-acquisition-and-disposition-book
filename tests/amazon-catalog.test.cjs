const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const catalog = require('../src/lib/amazon-catalog.json');

const expectedMainAsins = [
  'B0HM1BMTHP',
  'B0HH6J6Q4D',
  'B0H6VSF6S6',
  'B0HN3767N5',
  'B0HNXTR3PW',
  'B0HN2Z11KM',
  'B0HP71P67V',
  'B0HC4JKFJV',
  'B0HRQN65RC',
  'B0HLY2LXCV',
];

const expectedPrices = {
  B0HM1BMTHP: '$18.99',
  B0HM1WHB7M: '$9.99',
  B0HH6J6Q4D: '$20.99',
  B0HH6LZYFM: '$14.99',
  B0H6VSF6S6: '$18.99',
  B0H6V4X481: '$13.99',
  B0HN3767N5: '$19.99',
  B0HN2RB41P: '$13.99',
  B0HNXTR3PW: '$13.99',
  B0HN2Z11KM: '$19.99',
  B0HMY3JXB6: '$13.99',
  B0HP71P67V: '$9.99',
  B0HC4JKFJV: '$19.99',
  B0H38N8XNL: '$10.99',
  B0HRQN65RC: '$24.99',
  B0HRQQSBZQ: '$19.99',
  B0HLY2LXCV: null,
};

test('catalog mirrors all ten Amazon author-store listings in source order', () => {
  assert.equal(catalog.sourceListingCount, 10);
  assert.equal(catalog.items.length, 10);
  assert.deepEqual(catalog.items.map((item) => item.mainAsin), expectedMainAsins);
});

test('catalog contains all 17 unique format ASINs with canonical Amazon links', () => {
  const offers = catalog.items.flatMap((item) => item.offers);
  assert.equal(offers.length, 17);
  assert.equal(catalog.formatAsinCount, offers.length);
  assert.equal(new Set(offers.map((offer) => offer.asin)).size, offers.length);
  for (const item of catalog.items) {
    assert.ok(item.offers.some((offer) => offer.asin === item.mainAsin), item.mainAsin);
  }
  assert.deepEqual(
    offers.map((offer) => offer.asin).sort(),
    Object.keys(expectedPrices).sort(),
  );
  for (const offer of offers) {
    assert.equal(offer.amazonUrl, `https://www.amazon.com/dp/${offer.asin}`);
    assert.ok(['paperback', 'hardcover'].includes(offer.format));
  }
});

test('catalog prices and limited-availability state match the checked listings', () => {
  const offers = new Map(catalog.items.flatMap((item) => item.offers.map((offer) => [offer.asin, offer])));
  for (const [asin, price] of Object.entries(expectedPrices)) {
    assert.equal(offers.get(asin)?.price ?? null, price, asin);
  }
  assert.match(offers.get('B0HLY2LXCV').availability, /Out of Print.*Limited Availability/);
  assert.equal([...offers.values()].filter((offer) => offer.price == null).length, 1);
});

test('each listing uses a local cover asset and the Amazon source image URL', () => {
  for (const item of catalog.items) {
    assert.match(item.cover, /^[a-z0-9-]+\.jpg$/);
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'public', 'images', item.cover)), item.cover);
    assert.match(item.sourceCoverUrl, /^https:\/\/m\.media-amazon\.com\/images\/I\//);
  }
});

test('catalog records the requested author store and the price-check date', () => {
  assert.equal(
    catalog.authorStoreUrl,
    'https://www.amazon.com/stores/Silas-Thorne/author/B0HBNRT3MS?ref=ap_rdr&shoppingPortalEnabled=true',
  );
  assert.match(catalog.lastVerified, /^2026-11-25$/);
});
