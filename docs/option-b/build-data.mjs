// Option B build step. Run: node docs/option-b/build-data.mjs
// Reads ../../source/data/*.json, writes data.js and fills the static card regions
// of index.html (between <!--AF:name--> ... <!--/AF:name--> markers).
// D2: painting prices are NEVER written. Price, compare_at_price and every variant field are dropped.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = (f) => JSON.parse(fs.readFileSync(path.join(here, '../../source/data', f), 'utf8'));
const originals = src('original-paintings.json').products;
const products = src('products.json').products;
const collections = src('collections.json').collections;

// ---------- parsing helpers ----------
const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'")
  .replace(/&quot;/g, '"').replace(/&ldquo;|&rdquo;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const lines = (html) => decode((html || '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|h\d|div|li)>/gi, '\n').replace(/<[^>]+>/g, ''))
  .split('\n').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean).filter((s) => !s.startsWith('*'));

// Handles 36 x 30in, 11 x 14in, 36" x 36", 10" x 10" and "24in diameter".
const SIZE_RE = /(\d+(?:\.\d+)?)\s*["”″]?\s*x\s*(\d+(?:\.\d+)?)\s*(?:in\b|["”″])/i;
const DIA_RE = /(\d+(?:\.\d+)?)\s*in\s*diameter/i;
const MEDIUM_START = /^(acrylic|mixed media|textured|uv reactive|glossy|oil)/i;
const unq = (s) => s.replace(/^["“\s]+|["”\s|]+$/g, '').trim();

function parse(p) {
  const ls = lines(p.body_html);
  const out = { medium: '', size: '', repeated: '', hidden: '', message: '', w: 0, h: 0, first: ls[0] || '' };
  let sizeLine = -1, sizeIdx = 0;
  ls.forEach((l, i) => {
    if (sizeLine >= 0) return;
    const m = l.match(SIZE_RE), d = l.match(DIA_RE);
    if (m) { out.size = `${m[1]} x ${m[2]} in`; out.w = +m[1]; out.h = +m[2]; sizeLine = i; sizeIdx = m.index; }
    else if (d) { out.size = `${d[1]} in diameter`; out.w = out.h = +d[1]; sizeLine = i; sizeIdx = d.index; }
  });
  let medium = '';
  if (sizeLine >= 0) {
    const before = ls[sizeLine].slice(0, sizeIdx);
    const lm = before.match(/letters:\s*(.+?)\s*$/i);
    if (lm) out.message = unq(lm[1]);
    medium = before.replace(/[|\s.]+$/, '').trim();
  }
  if (!medium) medium = (ls.find((l) => MEDIUM_START.test(l) && !SIZE_RE.test(l) && l.length < 140) || '').replace(/[|\s.]+$/, '').trim();
  medium = medium.split(/ topped with /i)[0]
    .replace(/ layered with used stencils repurposed from Angela Fabbri.s Inversion series\.?\s*/i, ', ')
    .replace(/, ([A-Z])/, (_, c) => ', ' + c.toLowerCase()).replace(/[,\s]+$/, '');
  out.medium = medium;
  for (const l of ls) {
    let m;
    if ((m = l.match(/^Repeated Message:\s*(.+)$/i))) out.repeated = unq(m[1]);
    else if ((m = l.match(/^Hidden Message:\s*(.+)$/i))) out.hidden = unq(m[1]);
    else if ((m = l.match(/^Backwards Message:\s*(.+)$/i))) out.message = unq(m[1]);
    else if (!out.message && /^["“].+["”]$/.test(l)) out.message = unq(l);
  }
  out.text = ls.join(' ');
  return out;
}

// Collection membership is not in the product JSON, so derive it. First match wins.
// Cross-checked against the live collection pages (first page of Inversion, Rose Pattern, AWA).
const CATS = [
  ['inversion', 'Inversion'], ['rose-pattern', 'Rose Pattern'], ['minis', 'Minis'],
  ['ten-by-tens', 'Ten by Tens'], ['awa', 'AWA · Abstracts with Attitude'],
];
function categorize(p, t) {
  if (/ten by ten/i.test(p.title)) return 'ten-by-tens';
  // A "Mini" title only counts when the panel is small; "I'm A Conversation Piece Mini" is 22 x 22 and sits in AWA.
  if (p.tags.includes('mini') || (/\bmini\b/i.test(p.title) && Math.max(t.w, t.h) <= 14)) return 'minis';
  if (/rose bud pattern/i.test(t.text) || /bloom$/i.test(p.title.trim())) return 'rose-pattern';
  if (/stencils repurposed/i.test(t.text) || /^(textured|glossy acrylic)/i.test(t.first)) return 'awa';
  return 'inversion';
}

const isHeic = (u) => /\.(heic|heif)(\?|$)/i.test(u);
const w = (u, n) => `${u}&width=${n}`;

// ---------- paintings ----------
const paintings = originals.map((p) => {
  const t = parse(p);
  const category = categorize(p, t);
  const images = p.images.filter((i) => !isHeic(i.src)).slice(0, 6)
    .map((i) => ({ u800: w(i.src, 800), u1600: w(i.src, 1600), w: i.width, h: i.height }));
  if (!images.length) throw new Error('No usable image: ' + p.handle);
  const backwards = category !== 'ten-by-tens' && !!(t.repeated || t.hidden || t.message || /backwards/i.test(t.text));
  return {
    handle: p.handle, title: p.title, available: !!p.variants[0].available, category,
    medium: t.medium, size: t.size, repeated: t.repeated, hidden: t.hidden, message: t.message,
    backwards, images,
    _w: t.w, _h: t.h,
  };
});

if (new Set(paintings.map((p) => p.handle)).size !== paintings.length) throw new Error('duplicate handles');
const availableCount = paintings.filter((p) => p.available).length;

// Size extremes for the trade fact.
const sized = paintings.filter((p) => p._w);
const byArea = [...sized].sort((a, b) => a._w * a._h - b._w * b._h);
const smallest = byArea[0];
const longest = [...sized].sort((a, b) => (Math.max(b._w, b._h) - Math.max(a._w, a._h)) || (b._w * b._h - a._w * a._h))[0];
const longestStr = `${Math.max(longest._w, longest._h)} x ${Math.min(longest._w, longest._h)} in`;

const outP = paintings.map(({ _w, _h, ...rest }) => rest);
const pJson = JSON.stringify(outP);
if (/price|compare_at/i.test(pJson)) throw new Error('D2 violation: price field in painting data');

// ---------- merch (price and live URL allowed here, never on paintings) ----------
const MERCH = [
  ['neon-flowers-coaster', 'Coasters'], ['orange-you-glad-acrylic-tray', 'Trays'],
  ['copy-of-hand-painted-camel-bloom-big-tote-neutral-splatter', 'Totes'], ['ghost-chair', 'Chairs'],
];
const merch = MERCH.map(([handle, kind]) => {
  const p = products.find((x) => x.handle === handle);
  if (!p) throw new Error('missing merch ' + handle);
  const i = p.images[0];
  return {
    handle, title: p.title, kind, price: Math.round(Number(p.variants[0].price)),
    url: `https://angelafabbri.com/products/${handle}`, available: !!p.variants[0].available,
    image: w(i.src, 600), image2x: w(i.src, 900), w: i.width, h: i.height,
  };
});

const colInfo = Object.fromEntries(collections
  .filter((c) => ['inversion', 'rose-pattern', 'minis', 'ten-by-tens', 'abstracts-with-attitude'].includes(c.handle))
  .map((c) => [c.handle, c.products_count]));
const stats = {
  generated: new Date().toISOString().slice(0, 10), total: paintings.length, available: availableCount,
  sold: paintings.length - availableCount, smallest: smallest.size, longest: longestStr,
};

const banner = '// Generated by build-data.mjs. Do not edit. No painting prices by design (D2).\n';
fs.writeFileSync(path.join(here, 'data.js'),
  `${banner}window.AF_CATEGORIES=${JSON.stringify(CATS.map(([id, label]) => ({ id, label })))};\n` +
  `window.AF_PAINTINGS=[\n${outP.map((p) => JSON.stringify(p)).join(',\n')}\n];\n` +
  `window.AF_MERCH=${JSON.stringify(merch)};\nwindow.AF_STATS=${JSON.stringify(stats)};\n`);

// ---------- static cards for index.html (must mirror cardHTML in app.js) ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const caption = (p) => [p.medium, p.size].filter(Boolean).map(esc).join(' · ');
function card(p, { extra = '' } = {}) {
  const sold = !p.available, im = p.images[0], base = im.u800.replace(/&width=800$/, '');
  const href = `painting.html?handle=${encodeURIComponent(p.handle)}`;
  return `<article class="card${extra ? ' ' + extra : ''}" data-handle="${esc(p.handle)}">
  <div class="card-media">
    <a class="card-well" href="${href}" tabindex="-1"><img src="${esc(base)}&amp;width=600" srcset="${esc(base)}&amp;width=600 600w, ${esc(base)}&amp;width=900 900w" sizes="(min-width:1024px) 22vw, (min-width:768px) 44vw, 90vw" width="${im.w}" height="${im.h}" alt="${esc(p.title)}, painting by Angela Fabbri" loading="lazy" decoding="async"></a>
    <span class="pill ${sold ? 'pill-sold' : 'pill-avail'}">${sold ? 'Sold' : '<i aria-hidden="true"></i>Available'}</span>
  </div>
  <div class="card-body">
    <h3 class="card-title"><a href="${href}">${esc(p.title)}</a></h3>
    ${caption(p) ? `<p class="card-cap">${caption(p)}</p>` : ''}
    <div class="inq" data-title="${esc(p.title)}" data-handle="${esc(p.handle)}" data-mode="${sold ? 'commission' : 'info'}">
      <button type="button" class="btn ${sold ? 'btn-ghost' : 'btn-pink'} inq-toggle" aria-expanded="false">${sold ? 'Sold · Submit commission inquiry' : 'Request info'}</button>
      <a class="inq-mailto" href="mailto:angela@fabbriology.com?subject=${encodeURIComponent((sold ? 'Commission inquiry inspired by ' : 'Request info: ') + p.title)}">Email Angela about ${esc(p.title)}</a>
    </div>
  </div>
</article>`;
}
const by = (h) => { const p = paintings.find((x) => x.handle === h); if (!p) throw new Error('missing ' + h); return p; };
const AVAIL = ['green-goddess', 'neon-roses', 'im-expensive', 'handle-with-care', 'smiles-original-painting', 'why-not-you', 'painted-bunting', 'bloom-big-blue-22'];
const COLL = ['i-am-bluetiful', 'send-the-jet', 'love-money-art', 'live-luxuriously-copy', 'same-same-but-different-copy', 'elephant'];
AVAIL.forEach((h) => { if (!by(h).available) throw new Error('curated not available ' + h); });
COLL.forEach((h) => { if (by(h).available) throw new Error('curated not sold ' + h); });

const shopCard = (m) => `<article class="shop-card">
  <a class="shop-img" href="${m.url}" rel="noopener"><img src="${esc(m.image)}" srcset="${esc(m.image)} 600w, ${esc(m.image2x)} 900w" sizes="(min-width:1024px) 22vw, (min-width:600px) 44vw, 90vw" width="${m.w}" height="${m.h}" alt="${esc(m.title)}, studio goods by Angela Fabbri" loading="lazy" decoding="async"></a>
  <div class="shop-body">
    <p class="eyebrow">${esc(m.kind)}</p>
    <h3 class="card-title">${esc(m.title)}</h3>
    <p class="shop-price">$${m.price.toLocaleString('en-US')}</p>
    <a class="btn btn-ghost" href="${m.url}" target="_blank" rel="noopener">Buy on angelafabbri.com<span class="sr-only"> (opens in a new tab)</span></a>
  </div>
</article>`;

const fills = {
  available: AVAIL.map((h, i) => card(by(h), { extra: i >= 4 ? 'm-hide' : '' })).join('\n'),
  collected: COLL.map((h, i) => card(by(h), { extra: i >= 4 ? 'm-hide' : '' })).join('\n'),
  shop: merch.map(shopCard).join('\n'),
  count: String(availableCount),
  sizefact: `Originals from ${smallest.size} to ${longestStr}, and commissions sized to your wall`,
};
const idx = path.join(here, 'index.html');
if (fs.existsSync(idx)) {
  let html = fs.readFileSync(idx, 'utf8');
  html = html.replace(/<!--AF:(\w+)-->[\s\S]*?<!--\/AF:\1-->/g, (m, k) => {
    if (!(k in fills)) throw new Error('unknown marker ' + k);
    return `<!--AF:${k}-->${fills[k]}<!--/AF:${k}-->`;
  });
  fs.writeFileSync(idx, html);
}

console.log(JSON.stringify(stats));
const byCat = {};
paintings.forEach((p) => { const c = (byCat[p.category] ||= { a: 0, s: 0 }); p.available ? c.a++ : c.s++; });
console.log('categories (available/sold):', JSON.stringify(byCat), '| live collection counts:', JSON.stringify(colInfo));
console.log('missing size:', paintings.filter((p) => !p.size).map((p) => p.handle).join(', ') || 'none');
console.log('missing medium:', paintings.filter((p) => !p.medium).map((p) => p.handle).join(', ') || 'none');
console.log('smallest:', smallest.size, smallest.handle, '| longest side:', longestStr, longest.handle);
