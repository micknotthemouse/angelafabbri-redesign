// Generates docs/site/data.js (window.AF = {series, paintings, shop}) from the mirrored Shopify exports.
// Run: node docs/site/build-data.mjs   (from anywhere)
// D2: painting records carry NO price, compare_at_price, variants, tags or body_html (explicit whitelist below).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, '../../source/data');
const read = (f) => JSON.parse(readFileSync(resolve(dataDir, f), 'utf8'));
const originals = read('original-paintings.json').products;
const allProducts = read('products.json').products;
const membership = read('collection-products.json'); // { key: { title, handles: [...] } }

const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&rsquo;|&lsquo;/g, "'").replace(/&ldquo;|&rdquo;/g, '"');
function toLines(html) {
  const t = html
    .replace(/<meta[^>]*>/gi, '')
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/(p|h\d|div|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  return decode(t).split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
}

// Size: handles 24 x 30in, 10" x 10", 12 x 12in; plus the single "in diameter" work.
const SIZE = /(\d+(?:\.\d+)?)\s*(?:"|”|in)?\s*x\s*(\d+(?:\.\d+)?)\s*(?:"|”|in)?/i;
const DIAM = /(\d+(?:\.\d+)?)\s*(?:"|”|in)?\s*(?:in\s+)?diameter/i;
function mediumOf(flat) {
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  let m;
  if (/stencils repurposed/i.test(flat)) return /resin/i.test(flat) ? (/high gloss resin/i.test(flat) ? 'Textured acrylic with high gloss resin finish' : 'Textured acrylic with resin finish') : 'Textured acrylic';
  if (/UV reactive acrylic on wood panel with resin/i.test(flat)) return 'UV reactive acrylic on wood panel with resin';
  if ((m = flat.match(/Mixed media on wood panel\. Digitally created ([a-z ]+?) print, acrylic paint, with gloss varnish/i))) return 'Mixed media on wood panel, digitally created ' + m[1] + ' print, acrylic paint, gloss varnish';
  if (/Mixed media with acrylic paint and a custom digital layer/i.test(flat)) return 'Mixed media with acrylic paint and a custom digital layer';
  if (/Mixed media with acrylic paint/i.test(flat)) return 'Mixed media with acrylic paint';
  if (/Textured, matte acrylic/i.test(flat)) return 'Textured matte acrylic on canvas';
  if (/Glossy acrylic creating/i.test(flat)) return 'Glossy acrylic on canvas';
  if ((m = flat.match(/Acrylic on (?:wood panel|canvas)(?: with [a-z ,()]+?)?(?=\s*(?:\||\.|\d|Collection:|$))/i))) return cap(m[0].trim());
  return '';
}

function parse(p) {
  const lines = toLines(p.body_html);
  const flat = lines.join(' ');
  let w = null, h = null, diameter = null;
  const m = flat.match(SIZE);
  if (m) { w = +m[1]; h = +m[2]; } else { const d = flat.match(DIAM); if (d) diameter = +d[1]; }
  const medium = mediumOf(flat);

  const grab = (re) => { const x = flat.match(re); return x ? x[1].replace(/[\s"”“*]+$/, '').trim() : ''; };
  const repeated = grab(/Repeated Message:\s*["“]([^"”*]+)/i);
  const hidden = grab(/Hidden Message:\s*["“]([^"”*]+)/i);
  const message = grab(/(?:Backwards Message|messaging):\s*["“]([^"”*]+)/i) || grab(/Backwards Message:\s*([A-Z][A-Z' ,!?-]+?)\s*(?:\*|$)/) || grab(/backwards letters:\s*([^|*]+?)\s*(?:\||$)/i);

  // about: leftover prose, minus structured bits, size, medium line and disclaimers.
  let about = lines
    .map((l) => l
      .replace(/^[^|]*\|\s*(?:\d+\s*in diameter|[\d.]+\s*(?:"|”|in)?\s*x\s*[\d.]+\s*(?:"|”|in)?)\s*/i, '')
      .replace(/Featuring Angela Fabbri's signature backwards messaging[^.:]*[.:]?/i, '')
      .replace(/(Repeated|Hidden) Message:\s*["“][^"”*]*["”]?/gi, '')
      .replace(/(Backwards Message|messaging):\s*["“][^"”*]*["”]?/gi, '')
      .replace(/\*?\s*Color may not be accurately portrayed[^*]*/i, '')
      .replace(/\*?\s*Certificate of authenticity included\.?/i, '')
      .replace(/My Ten by Tens collection is just what[^.]*\./i, '')
      .replace(/Collection: Ten by Tens/i, '')
      .replace(/^"[^"]*"$/, '')
      .replace(/^Backwards Message:\s*[A-Z][A-Z' ,!?-]+$/, '')
      .trim())
    .filter((l) => l && !(SIZE.test(l) && l.length < 60) && !/^(Acrylic on|Mixed media|UV reactive|Textured|Glossy)/i.test(l))
    .join(' ').replace(/\s+/g, ' ').trim();
  if (/stencils repurposed/i.test(flat)) about = "Textured acrylic layered with used stencils repurposed from Angela Fabbri's Inversion series.";
  if (/Textured, matte acrylic|Glossy acrylic creating/i.test(flat)) about = '';
  return { w, h, diameter, medium, repeated, hidden, message, about };
}

// Cards need the whole painting first. For these works the export lists a room mockup or a close-up first,
// so the flat image (index below, in the HEIC-filtered list) leads and the rest keep their order.
const FLAT_FIRST = { 'plane-mini': 1, 'donkey-mini-yellow': 1, 'giraffe': 1, 'neon-flowers': 1 };
// Works whose only usable first image is a staged room photo. Flagged so cards crop to fill the frame
// and so these sort after the flat-art works.
const ROOM_FIRST = new Set(['im-expensive', 'its-rude-to-stare-black', 'black-bird', 'this-is-my-good-side-original-painting', 'im-a-conversation-piece-smile', 'i-dont-understand-you-either', 'im-a-conversation-piece-mini', 'stay-wild-neon', 'black-bird-copy', 'country-games-green', 'prickly-delight', 'bitcoin-clock', 'painted-bunting', 'cowboy-cowgirl-things-ten-by-ten-collection', 'bird-ten-by-ten-collection', 'rose-ten-by-ten-collection', 'saguaro-cactus-ten-by-ten-collection', 'malibu-cactus-ten-by-ten-collection', 'i-dont-understand-you-either-original-painting-2', 'elephant', 'gummy-bear', 'toucan-mini', 'smile-balloon', 'flamingo-floatie', 'bee-hot-pink', 'rooster-mini', 'chicken-mini', 'blue-bonnets-mini', 'longhorn-mini', 'horse-ten-by-ten-collection', 'roses-ten-by-ten-collection', 'longhorn-ten-by-ten-collection']);
const isHeic = (u) => /\.heic(\?|$)/i.test(u);
const withW = (src, w) => src + (src.includes('?') ? '&' : '?') + 'width=' + w;

/* ---------- classification (spec 1.5) ---------- */
const PAINT_COLS = ['inversion', 'rose-pattern', 'minis', 'ten-by-tens', 'abstracts-with-attitude', 'flowers-that-wont-fade', 'miami-collection', 'studio-move', 'more'];
const MERCH_COLS = ['coasters', 'acrylic-trays', 'handbags', 'chairs', 'sculptures', 'other-goodies', 'prints', 'gift-cards'];
const MERCH_TITLE = /coaster|tray|print|tote|pouch|bag|chair|hat|box|sculpture/i;
const EXCLUDE = (p) => /- Framed$/i.test(p.title.trim()) || p.handle === 'sensory-overload-print';
const ownHandles = new Set(originals.map((o) => o.handle));
const colsOf = (handle) => Object.keys(membership).filter((k) => membership[k].handles.includes(handle));
const isPainting = (p) => ownHandles.has(p.handle) ||
  (colsOf(p.handle).some((c) => PAINT_COLS.includes(c)) && !colsOf(p.handle).some((c) => MERCH_COLS.includes(c)) && !MERCH_TITLE.test(p.title));

// Source order: original-paintings.json first (its order), then the extra products in products.json order.
const byHandle = new Map(allProducts.map((p) => [p.handle, p]));
const origOrder = originals.map((o) => byHandle.get(o.handle) || o);
const paintSrc = origOrder.concat(allProducts.filter((p) => !ownHandles.has(p.handle) && !EXCLUDE(p) && isPainting(p)));

const SERIES_DEF = [
  ['inversion', 'Inversion', true], ['rose-pattern', 'Rose Pattern', true], ['minis', 'Minis', true], ['ten-by-tens', 'Ten by Tens', true], ['abstracts-with-attitude', 'Abstracts with Attitude', true],
  ['flowers-that-wont-fade', "Flowers That Won't Fade", false], ['miami-collection', 'Miami Art Week', false], ['studio-move', 'Studio Move', false],
];
const COLL_SKIP = new Set(['frontpage', 'original-paintings']);

const paintings = paintSrc.map((p) => {
  const info = parse(p);
  const imgs = p.images.map((i) => i.src).filter((u) => !isHeic(u)); // HEIC breaks Chrome/Firefox
  if (!imgs.length) return null;
  const lead = FLAT_FIRST[p.handle];
  if (lead && imgs[lead]) imgs.unshift(imgs.splice(lead, 1)[0]);
  const cols = colsOf(p.handle);
  // Explicit whitelist: no price, no compare_at_price, no variants, no tags, no body_html (D2).
  return {
    title: p.title.trim(),
    handle: p.handle,
    series: SERIES_DEF.filter((s) => cols.includes(s[0])).map((s) => s[0]),
    collections: cols.filter((c) => !COLL_SKIP.has(c)),
    medium: info.medium,
    w: info.w, h: info.h, diameter: info.diameter,
    repeated: info.repeated, hidden: info.hidden, message: info.message,
    about: info.about,
    available: p.variants.some((v) => v.available),
    room: ROOM_FIRST.has(p.handle),
    images: imgs.map((u) => ({ a: withW(u, 800), b: withW(u, 1600) })),
  };
}).filter(Boolean);
// Available first, room shots last, then original order (stable sort).
paintings.sort((x, y) => (y.available - x.available) || (x.room - y.room));
const paintingSet = new Set(paintings.map((p) => p.handle));

const series = SERIES_DEF.map(([key, label, primary], order) => {
  const handles = membership[key].handles.filter((h) => paintingSet.has(h));
  const avail = handles.filter((h) => paintings.find((p) => p.handle === h).available).length;
  return { key, label, primary, count: handles.length, available: avail, order, handles };
});

/* ---------- shop ---------- */
const money = (n) => '$' + (Number.isInteger(n) ? n.toLocaleString('en-US') : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const BAD_DESC = /^\*?WIPE|^\*\*?This is for/i;
const CAT_DEF = [
  ['coasters', 'Coasters', 'main'], ['acrylic-trays', 'Trays', 'main'], ['handbags', 'Merch', 'main'], ['chairs', 'Chairs', 'main'],
  ['sculptures', 'Sculptures', 'more'], ['other-goodies', 'Other goodies', 'more'], ['prints', 'Limited edition prints', 'more'],
];
const merchSrc = allProducts.filter((p) => !EXCLUDE(p) && !paintingSet.has(p.handle) && !ownHandles.has(p.handle));
const items = [];
for (const p of merchSrc) {
  const img = p.images.map((i) => i.src).filter((u) => !isHeic(u));
  if (!img.length) continue;
  const cols = colsOf(p.handle);
  const cats = CAT_DEF.map((c) => c[0]).filter((k) => cols.includes(k));
  if (/^Limited Edition Print/i.test(p.title) && !cats.includes('prints')) cats.push('prints');
  if (!cats.length) continue;
  const prices = p.variants.map((v) => parseFloat(v.price)).filter((n) => !isNaN(n));
  const lo = Math.min(...prices), hi = Math.max(...prices);
  items.push({
    handle: p.handle,
    title: p.title.trim(),
    cats,
    price: lo,
    priceText: (hi > lo ? 'From ' : '') + money(lo),
    available: p.variants.some((v) => v.available),
    url: 'https://angelafabbri.com/products/' + p.handle,
    images: img.map((u) => ({ a: withW(u, 800), b: withW(u, 1600) })),
    desc: toLines(p.body_html).filter((l) => !BAD_DESC.test(l)),
  });
}
// Category order = collection membership order (prints: members first, then the titled prints).
const posIn = (cat, handle) => { const i = (membership[cat] ? membership[cat].handles : []).indexOf(handle); return i < 0 ? 9999 : i; };
const orderOf = {};
const cats = CAT_DEF.map(([key, label, group]) => {
  const list = items.filter((i) => i.cats.includes(key));
  // Packaging add-ons (the Gift Bag, $3) go last and do not set the cover or the "From" price.
  const addon = (i) => /^Gift Bag/i.test(i.title);
  list.sort((a, b) => (addon(a) - addon(b)) || (posIn(key, a.handle) - posIn(key, b.handle)));
  orderOf[key] = list.map((i) => i.handle);
  const core = list.filter((i) => !addon(i));
  const live = (core.length ? core : list).filter((i) => i.available);
  const cover = live[0] || list[0];
  const lowest = Math.min(...(core.length ? core : list).map((i) => i.price));
  return { key, label, group, live: 'https://angelafabbri.com/collections/' + key, count: list.length, from: lowest, fromText: 'From ' + money(lowest), cover: cover.images[0].a, coverAlt: cover.title + ', Fabbriology shop' };
});
// Items array is ordered by category order, then membership order; each item once.
const seen = new Set(), ordered = [];
for (const c of cats) for (const h of orderOf[c.key]) if (!seen.has(h)) { seen.add(h); ordered.push(items.find((i) => i.handle === h)); }

/* ---------- asserts ---------- */
const pj = JSON.stringify(paintings);
const fail = (m) => { throw new Error('ASSERT: ' + m); };
if (paintings.length !== 110) fail('expected 110 paintings, got ' + paintings.length);
if (/price|compare_at/i.test(pj)) fail('painting data must not contain price fields');
for (const s of series) if (s.count !== membership[s.key].handles.filter((h) => paintingSet.has(h)).length) fail('series count ' + s.key);
const urls = [].concat(...paintings.map((p) => p.images.flatMap((i) => [i.a, i.b])), ...ordered.map((i) => i.images.flatMap((x) => [x.a, x.b])), cats.map((c) => c.cover));
if (urls.some((u) => !/width=\d+/.test(u))) fail('image url without width=');
if (ordered.some((i) => !(i.price >= 0) || !i.priceText)) fail('item without price');
if (paintings.some((p) => !p.images.length)) fail('painting without image');

const header = `/* GENERATED by docs/site/build-data.mjs. Do not edit by hand.
 *
 * window.AF = { series, paintings, shop }   (app.js adds functions to the same object, see app.js)
 *
 * series[]  {key, label, primary:bool, count, available, order, handles:[painting handles in collection order]}
 *           8 entries: 5 primary (inversion, rose-pattern, minis, ten-by-tens, abstracts-with-attitude)
 *           then 3 "more" (flowers-that-wont-fade, miami-collection, studio-move). count = paintings, available = available paintings.
 * paintings[] 110 records, sorted available first, room shots last, then original order. Whitelist, NO price (D2):
 *           {title, handle, series:[keys in series order], collections:[collection handles], medium, w, h, diameter (inches or null),
 *            repeated, hidden, message (strings, may be ''), about (string), available:bool,
 *            room:bool (first image is a staged room photo: crop to fill),
 *            images:[{a: url?width=800, b: url?width=1600}]}   derive other widths by replacing width=800
 * shop = { cats:[...], items:[...] }  (merch only, shows prices, buy links go to the live store)
 *   cats[]  {key, label, group:'main'|'more', live:'https://angelafabbri.com/collections/<key>', count, from (number), fromText ('From $20'),
 *            cover (url width=800), coverAlt}   keys: coasters, acrylic-trays, handbags (label Merch), chairs | sculptures, other-goodies, prints
 *   (cats[].cover and .from ignore the "Gift Bag" add-on, which also sorts last in each category)
 *   items[] {handle, title, cats:[category keys], price (number, lowest variant), priceText ('$20', '$2,500', '$12.50', 'From $3'),
 *            available:bool, url:'https://angelafabbri.com/products/<handle>', images:[{a,b}] same shape as paintings,
 *            desc:[plain-text paragraphs, render through esc()]}   ordered by category order then collection order
 */
`;
writeFileSync(resolve(here, 'data.js'), header + 'window.AF=' + JSON.stringify({ series, paintings, shop: { cats, items: ordered } }) + ';\n');

const avail = paintings.filter((p) => p.available);
console.log(`paintings ${paintings.length} (available ${avail.length}, sold ${paintings.length - avail.length}); size parsed ${paintings.filter((p) => p.w || p.diameter).length}; medium empty ${paintings.filter((p) => !p.medium).length}; no series ${paintings.filter((p) => !p.series.length).length}`);
console.log('series', series.map((s) => `${s.key}:${s.count}/${s.available}`).join(' | '));
console.log('shop items', ordered.length, '|', cats.map((c) => `${c.key}:${c.count} ${c.fromText}`).join(' | '));
