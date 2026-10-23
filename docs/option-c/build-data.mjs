// Generates data.js for Option C ("After Hours") from the mirrored Shopify exports.
// Run: node docs/option-c/build-data.mjs   (from the project root, or anywhere)
// D2: painting records carry NO price and NO compare_at_price. Only AF_SHOP carries prices.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, '../../source/data');
const read = (f) => JSON.parse(readFileSync(resolve(dataDir, f), 'utf8'));
const originals = read('original-paintings.json').products;
const allProducts = read('products.json').products;
const collections = read('collections.json').collections;

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

// Series membership is NOT in the data. Inferred (a work can match several chips):
function series(p, body) {
  const t = p.title, tags = p.tags.map((x) => x.toLowerCase());
  const s = [];
  if (/top right corner|repeated message/i.test(body)) s.push('inversion');
  if (/rose bud pattern/i.test(body) || /rose/i.test(t)) s.push('rose-pattern');
  if (tags.includes('mini') || /\bmini\b/i.test(t)) s.push('minis');
  if (/ten by ten/i.test(t)) s.push('ten-by-tens');
  if (/stencils repurposed/i.test(body)) s.push('abstracts-with-attitude');
  return s;
}

// Cards need the whole painting first. For these works the export lists a room mockup or a close-up first,
// so the flat image (index below, in the HEIC-filtered list) leads and the rest keep their order.
// Checked by eye on a contact sheet of every multi-image work.
const FLAT_FIRST = { 'plane-mini': 1, 'donkey-mini-yellow': 1, 'giraffe': 1, 'neon-flowers': 1 };
// Works whose only usable first image is a staged room photo (art small on a wall). Flagged so cards can
// crop to fill the frame instead of floating the whole room, and so these sort after the flat-art works.
// Checked by eye on a contact sheet of all 105 first images.
const ROOM_FIRST = new Set(['im-expensive', 'its-rude-to-stare-black', 'black-bird', 'this-is-my-good-side-original-painting', 'im-a-conversation-piece-smile', 'i-dont-understand-you-either', 'im-a-conversation-piece-mini', 'stay-wild-neon', 'black-bird-copy', 'country-games-green', 'prickly-delight', 'bitcoin-clock', 'painted-bunting', 'cowboy-cowgirl-things-ten-by-ten-collection', 'bird-ten-by-ten-collection', 'rose-ten-by-ten-collection', 'saguaro-cactus-ten-by-ten-collection', 'malibu-cactus-ten-by-ten-collection', 'i-dont-understand-you-either-original-painting-2', 'elephant', 'gummy-bear', 'toucan-mini', 'smile-balloon', 'flamingo-floatie', 'bee-hot-pink', 'rooster-mini', 'chicken-mini', 'blue-bonnets-mini', 'longhorn-mini', 'horse-ten-by-ten-collection', 'roses-ten-by-ten-collection', 'longhorn-ten-by-ten-collection']);
const isHeic = (u) => /\.heic(\?|$)/i.test(u);
const withW = (src, w) => src + (src.includes('?') ? '&' : '?') + 'width=' + w;

const paintings = originals.map((p) => {
  const body = toLines(p.body_html).join(' ');
  const info = parse(p);
  const imgs = p.images.map((i) => i.src).filter((u) => !isHeic(u)); // HEIC breaks Chrome/Firefox
  if (!imgs.length) return null;
  const lead = FLAT_FIRST[p.handle];
  if (lead && imgs[lead]) imgs.unshift(imgs.splice(lead, 1)[0]);
  // Explicit whitelist: no price, no compare_at_price, no variant data (D2).
  return {
    title: p.title.trim(),
    handle: p.handle,
    series: series(p, body),
    medium: info.medium,
    w: info.w, h: info.h, diameter: info.diameter,
    repeated: info.repeated, hidden: info.hidden, message: info.message,
    about: info.about,
    available: p.variants.some((v) => v.available),
    room: ROOM_FIRST.has(p.handle),
    images: imgs.map((u) => ({ a: withW(u, 800), b: withW(u, 1600) })),
  };
}).filter(Boolean);

// Available first (stable sort keeps the exported order inside each group).
paintings.sort((x, y) => (y.available - x.available) || (x.room - y.room));

// Merch: coasters, trays, handbags, chair. Grouped by title keywords (the export has no collection membership).
const GROUPS = [
  { key: 'coasters', title: 'Coasters', url: 'https://angelafabbri.com/collections/coasters', test: (t) => /coaster/i.test(t) },
  { key: 'trays', title: 'Acrylic trays', url: 'https://angelafabbri.com/collections/acrylic-trays', test: (t) => /acrylic tray/i.test(t) },
  { key: 'handbags', title: 'Handbags', url: 'https://angelafabbri.com/collections/handbags', test: (t) => /\btote\b|pouch/i.test(t) },
  { key: 'chair', title: 'Ghost chair', url: 'https://angelafabbri.com/products/ghost-chair', test: (t) => /ghost chair/i.test(t) },
];
const ownHandles = new Set(originals.map((o) => o.handle));
const items = [];
for (const p of allProducts) {
  if (ownHandles.has(p.handle)) continue;
  const g = GROUPS.find((x) => x.test(p.title));
  if (!g) continue;
  const v = p.variants[0];
  const img = p.images.map((i) => i.src).find((u) => !isHeic(u));
  if (!img) continue;
  items.push({ group: g.key, title: p.title.trim(), handle: p.handle, price: Math.round(parseFloat(v.price)), available: !!v.available, url: 'https://angelafabbri.com/products/' + p.handle, image: withW(img, 800) });
}
const groups = GROUPS.map((g) => {
  const list = items.filter((i) => i.group === g.key && i.available);
  const cheapest = Math.min(...list.map((i) => i.price));
  const cover = list[0];
  const col = collections.find((c) => g.url.endsWith('/collections/' + c.handle));
  return { key: g.key, title: g.title, url: g.url, from: cheapest, count: list.length, cover: cover.image, coverTitle: cover.title, collectionCount: col ? col.products_count : null };
});

const out = '// GENERATED by build-data.mjs. Do not edit by hand.\n'
  + '// AF_PAINTINGS carries no prices (D2). AF_SHOP carries merch prices and live product URLs.\n'
  + 'window.AF_PAINTINGS=' + JSON.stringify(paintings) + ';\n'
  + 'window.AF_SHOP=' + JSON.stringify({ groups, items }) + ';\n';
if (/price/i.test(JSON.stringify(paintings))) throw new Error('painting data must not contain price fields');
writeFileSync(resolve(here, 'data.js'), out);

const avail = paintings.filter((p) => p.available);
const sizeOk = paintings.filter((p) => p.w || p.diameter).length;
console.log(`paintings ${paintings.length} (available ${avail.length}, sold ${paintings.length - avail.length}); size parsed ${sizeOk}; medium empty ${paintings.filter((p) => !p.medium).length}`);
console.log('series counts', Object.fromEntries(['inversion', 'rose-pattern', 'minis', 'ten-by-tens', 'abstracts-with-attitude'].map((k) => [k, paintings.filter((p) => p.series.includes(k)).length])), 'no series', paintings.filter((p) => !p.series.length).length);
console.log('available size range', Math.min(...avail.filter((p) => p.w).map((p) => Math.min(p.w, p.h))), 'to', Math.max(...avail.filter((p) => p.w).map((p) => Math.max(p.w, p.h))));
console.log('shop', groups.map((g) => `${g.key}:${g.count} from $${g.from}`).join(' | '));
