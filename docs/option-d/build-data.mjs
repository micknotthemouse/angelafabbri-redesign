// Generates docs/option-d/data.js (window.AF = {series, paintings, portfolio}) from the mirrored Shopify exports.
// Run: node docs/option-d/build-data.mjs   (from anywhere). Paintings only (the 105 originals), exact collection membership.
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

/* ---------- classification: the 105 originals only ---------- */
const byHandle = new Map(allProducts.map((p) => [p.handle, p]));
const paintSrc = originals.map((o) => byHandle.get(o.handle) || o); // original-paintings.json order = stable Fig order
const colsOf = (handle) => Object.keys(membership).filter((k) => membership[k].handles.includes(handle));

const SERIES_DEF = [
  ['inversion', 'Inversion', true], ['rose-pattern', 'Rose Pattern', true], ['minis', 'Minis', true], ['ten-by-tens', 'Ten by Tens', true], ['abstracts-with-attitude', 'Abstracts with Attitude', true],
  ['flowers-that-wont-fade', "Flowers That Won't Fade", false], ['miami-collection', 'Miami Art Week', false], ['studio-move', 'Studio Move', false],
];
const COLL_SKIP = new Set(['frontpage', 'original-paintings']);

let paintings = paintSrc.map((p, idx) => {
  const info = parse(p);
  const imgs = p.images.map((i) => i.src).filter((u) => !isHeic(u)); // HEIC breaks Chrome/Firefox
  if (!imgs.length) return null;
  const lead = FLAT_FIRST[p.handle];
  if (lead && imgs[lead]) imgs.unshift(imgs.splice(lead, 1)[0]);
  const cols = colsOf(p.handle);
  // Explicit whitelist: no price, no compare_at_price, no variants, no tags, no body_html (D2).
  return {
    fig: idx + 1, // stable Fig number: position in original-paintings.json (1..105), used on every page
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
// Available first, room shots last, then original order (stable sort). fig is NOT recomputed.
paintings.sort((x, y) => (y.available - x.available) || (x.room - y.room));
const paintingSet = new Set(paintings.map((p) => p.handle));
const pByHandle = new Map(paintings.map((p) => [p.handle, p]));

const series = SERIES_DEF.map(([key, label, primary], order) => {
  const handles = membership[key].handles.filter((h) => paintingSet.has(h));
  const avail = handles.filter((h) => pByHandle.get(h).available).length;
  return { key, label, primary, count: handles.length, available: avail, order, handles };
});

/* ---------- portfolio stub: first six entries with a matched image ---------- */
const pf = readFileSync(resolve(dataDir, 'portfolio-structure.json'), 'utf8');
const works = JSON.parse(pf).pages.flatMap((pg) => pg.works || []).filter((w) => w.matchedImage).slice(0, 6);
const portfolio = works.map((w) => {
  const linked = w.matchedHandle && paintingSet.has(w.matchedHandle);
  return {
    pdfTitle: w.title,
    title: linked ? pByHandle.get(w.matchedHandle).title : w.title, // linked entries use the store title so the link target matches
    handle: linked ? w.matchedHandle : null,
    size: (w.size || '').replace(/\s*x\s*/i, ' × ').replace(/(\d)\s*in$/i, '$1 in'),
    medium: (w.medium || '').replace(/ \(per store listing\)/i, ''),
    image: withW(w.matchedImage, 800),
  };
});

/* ---------- asserts ---------- */
const pj = JSON.stringify(paintings);
const fail = (m) => { throw new Error('ASSERT: ' + m); };
if (paintings.length !== 105) fail('expected 105 paintings, got ' + paintings.length);
if (paintings.filter((p) => p.available).length !== 51) fail('expected 51 available, got ' + paintings.filter((p) => p.available).length);
if (/price|compare_at/i.test(pj + JSON.stringify(portfolio))) fail('data must not contain price fields');
if (/\.heic/i.test(pj)) fail('heic image in data');
if (new Set(paintings.map((p) => p.fig)).size !== 105) fail('fig numbers must be unique');
for (const s of series) if (s.count !== membership[s.key].handles.filter((h) => paintingSet.has(h)).length) fail('series count ' + s.key);
if ([].concat(...paintings.map((p) => p.images.flatMap((i) => [i.a, i.b]))).some((u) => !/width=\d+/.test(u))) fail('image url without width=');
if (portfolio.length !== 6) fail('portfolio entries');

const header = `/* GENERATED by docs/option-d/build-data.mjs. Do not edit by hand.
 *
 * window.AF = { series, paintings, portfolio }   (app.js adds functions to the same object)
 *
 * series[]  {key, label, primary:bool, count, available, order, handles:[painting handles in collection order]}
 * paintings[] 105 original paintings, sorted available first, room shots last, then original order. Whitelist, NO price (D2):
 *           {fig (stable 1..105, the same on every page), title, handle, series:[keys], collections:[handles], medium,
 *            w, h, diameter (inches or null), repeated, hidden, message, about, available:bool,
 *            room:bool (first image is a staged room photo: crop to fill),
 *            images:[{a: url&width=800, b: url&width=1600}]}
 * portfolio[] first six PDF entries with an image: {pdfTitle, title (store title when handle is set), handle|null, size, medium, image}
 */
`;
writeFileSync(resolve(here, 'data.js'), header + 'window.AF=' + JSON.stringify({ series, paintings, portfolio }) + ';\n');

const avail = paintings.filter((p) => p.available);
console.log(`paintings ${paintings.length} (available ${avail.length}, sold ${paintings.length - avail.length}); size parsed ${paintings.filter((p) => p.w || p.diameter).length}; medium empty ${paintings.filter((p) => !p.medium).length}; no primary series ${paintings.filter((p) => !p.series.some((s) => SERIES_DEF.find((d) => d[0] === s && d[2]))).length}`);
console.log('series', series.map((s) => `${s.key}:${s.count}/${s.available}`).join(' | '));
console.log('portfolio', portfolio.map((p) => p.title + (p.handle ? '*' : '')).join(' | '));
