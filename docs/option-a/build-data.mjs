// Generates data.js for Option A from the local Shopify snapshots.
// Run:  node build-data.mjs      (from this folder)
// Output: data.js  ->  window.AF_PAINTINGS (NO prices, D2) and window.AF_SHOP (prices allowed, merch only)
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "..", "..", "source", "data");
const readJson = (f) => JSON.parse(readFileSync(join(dataDir, f), "utf8"));

const originals = readJson("original-paintings.json").products;
const allProducts = readJson("products.json").products;
const collections = readJson("collections.json").collections; // used only to confirm the collection handles exist
const knownCollections = new Set(collections.map((c) => c.handle));
for (const h of ["inversion", "rose-pattern", "minis", "ten-by-tens", "abstracts-with-attitude"]) {
  if (!knownCollections.has(h)) throw new Error("collection missing from collections.json: " + h);
}

/* ---------- helpers ---------- */
const decode = (s) =>
  s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const strip = (html) =>
  decode(html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

// Size: 24 x 30in | 10" x 10" | 36" x 36" | 24in diameter  (skeptic A1)
const SIZE_RE = /(\d+(?:\.\d+)?)\s*(?:"|”|in)?\s*x\s*(\d+(?:\.\d+)?)\s*(?:"|”|in(?:ch(?:es)?)?)?/i;
const DIAM_RE = /(\d+(?:\.\d+)?)\s*in(?:ch(?:es)?)?\s*diameter/i;

function parseSize(text) {
  const d = text.match(DIAM_RE);
  if (d) return { size: `${d[1]} in diameter`, index: d.index, len: d[0].length, w: +d[1], h: +d[1] };
  const m = text.match(SIZE_RE);
  if (m) return { size: `${m[1]} x ${m[2]} in`, index: m.index, len: m[0].length, w: +m[1], h: +m[2] };
  return null;
}

const MEDIUM_RE = /\b(UV reactive acrylic|Mixed [Mm]edia|Textured,? (?:matte )?acrylic|Glossy acrylic|Acrylic)\b/;

function tidyMedium(m) {
  let s = m.split(/\.\s/)[0];
  s = s.replace(/\s+Digitally created.*/i, "").replace(/\s+featuring\b.*/i, "").replace(/\s*\(.*$/, "");
  s = s.replace(/\s*layered with used stencils repurposed from Angela Fabbri.s Inversion series\.?/i, " with stencils");
  s = s.replace(/\s+(Finished with resin)$/i, ", resin finish");
  if (!/\bwith (high gloss )?resin finish$/i.test(s)) s = s.replace(/\s+(Resin finish|High gloss resin finish)$/i, (_, a) => ", " + a.toLowerCase());
  s = s.replace(/\s+layered throughout the canvas topped with my signature backwards letters:?.*$/i, "");
  s = s.replace(/\s+creating beautiful visibly fused layers.*$/i, " with fused layers");
  s = s.replace(/\s+/g, " ").replace(/[|.,\s]+$/, "").trim();
  if (s.length > 60) s = s.slice(0, 57).replace(/\s+\S*$/, "") + "…";
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

function parseMediumSize(text) {
  const sz = parseSize(text);
  let medium = "";
  if (sz) {
    const before = text.slice(0, sz.index).replace(/[|\s]+$/, "");
    const after = text.slice(sz.index + sz.len).trim();
    if (before && /^(UV reactive|Mixed|Textured|Glossy|Acrylic)/i.test(before)) {
      medium = before;
    } else {
      // medium written after the size (Ten by Tens) or inside the prose (I'm Your Biggest Fan)
      const mm = (after.match(new RegExp(MEDIUM_RE.source + "[^.*\"\\d|]*")) || before.match(new RegExp(MEDIUM_RE.source + "[^.*\"\\d|]*")) || [])[0];
      if (mm) medium = mm.replace(/\s*Collection:?.*$/i, "").trim();
    }
  } else {
    const mm = text.match(new RegExp(MEDIUM_RE.source + "[^.*\"\\d|]*"));
    if (mm) medium = mm[0];
  }
  // minis: "Acrylic on wood panel with high gloss resin finish 11 x 14in" -> before holds the whole medium (no pipe)
  return { medium: tidyMedium(medium), sz };
}

function imageBase(src) {
  return src; // already carries ?v=...; sizes are appended with &width=
}
const imgEntry = (im) => ({
  src: imageBase(im.src),
  src800: imageBase(im.src) + "&width=800",
  src1600: imageBase(im.src) + "&width=1600",
  w: im.width,
  h: im.height,
});

const SERIES_LABEL = {
  "inversion": "Inversion",
  "rose-pattern": "Rose Pattern",
  "minis": "Minis",
  "ten-by-tens": "Ten by Tens",
  "abstracts-with-attitude": "Abstracts with Attitude",
  "other": "Original painting",
};

// Series membership is approximate: derived from tags, title and the first 300 characters of the description.
// Live collection membership was not captured. Order matters (first match wins).
function classify(p, plain) {
  const head = plain.slice(0, 300);
  if (/ten by ten/i.test(p.title) || /Collection: Ten by Tens/i.test(plain)) return "ten-by-tens";
  if (p.tags.includes("mini") || /\bmini\b/i.test(p.title)) return "minis";
  if (/stencils repurposed|^Textured|^Glossy acrylic/i.test(head)) return "abstracts-with-attitude";
  if (/rose (bud )?pattern/i.test(head) || /^(bloom big|water me|blaze your own trail \()/i.test(p.title)) return "rose-pattern";
  if (/backwards|inversion/i.test(plain)) return "inversion";
  return "other";
}

/* ---------- paintings ---------- */
const isHeic = (u) => /\.heic(\?|$)/i.test(u);

const paintings = originals.map((p) => {
  const plain = strip(p.body_html || "");
  const { medium, sz } = parseMediumSize(plain);

  const rep = plain.match(/(?:Repeated|Backwards) Message:\s*"?([^"*]+?)"?\s*(?:Hidden Message:|\*|Acrylic|$)/i);
  const hid = plain.match(/Hidden Message:\s*"?([^"*]+?)"?\s*(?:\*|Repeated|$)/i);

  // description text: drop medium/size prefix, message lines and the two footnotes
  let story = plain;
  if (sz) story = (/^(UV reactive|Mixed|Textured|Glossy|Acrylic)/i.test(plain.slice(0, sz.index)) ? plain.slice(sz.index + sz.len) : plain.replace(plain.slice(sz.index, sz.index + sz.len), ""));
  story = story
    .replace(/\*Color may not[^*]*/i, "")
    .replace(/\*Certificate of authenticity included\.?/i, "")
    .replace(/(Repeated|Hidden|Backwards) Message:\s*"?[^"*]*?"?(?=\s*(Hidden Message:|Repeated Message:|\*|$|Acrylic))/gi, "")
    .replace(/Collection: Ten by Tens/i, "")
    .replace(/^[\s|]+/, "")
    .replace(/\s+/g, " ").trim();
  if (medium && story.toLowerCase().startsWith(medium.toLowerCase())) story = story.slice(medium.length).replace(/^[\s.|]+/, "");
  if (/^Acrylic on (?:wood panel|canvas)[.\s]*$/i.test(story)) story = "";

  // Primary image: first non-HEIC image (HEIC does not render in Chrome/Firefox)
  const usable = p.images.filter((im) => !isHeic(im.src));
  const series = classify(p, plain);
  const tags = [series];
  if (/inversion|backwards/i.test(plain) && series !== "inversion") tags.push("backwards-text");

  return {
    title: p.title,
    handle: p.handle,
    available: !!p.variants.some((v) => v.available),
    series,
    seriesLabel: SERIES_LABEL[series],
    tags,
    medium,
    size: sz ? sz.size : "",
    sizeW: sz ? sz.w : null,
    sizeH: sz ? sz.h : null,
    repeated: rep ? rep[1].trim() : "",
    hidden: hid ? hid[1].trim() : "",
    story,
    published: p.published_at,
    images: usable.map(imgEntry),
  };
}).filter((p) => p.images.length);

paintings.sort((a, b) => (b.published || "").localeCompare(a.published || ""));

/* ---------- shop (merch only; prices allowed, D2) ---------- */
const originalHandles = new Set(originals.map((p) => p.handle));
function merchKind(p) {
  const t = p.title + " " + p.handle;
  if (/coaster/i.test(t)) return "coasters";
  if (/acrylic tray|\btray\b/i.test(t)) return "trays";
  if (/\bchair\b/i.test(t)) return "chairs";
  if (/\b(tote|bag|pouch|clutch|handbag|purse)\b/i.test(t)) return "handbags";
  return null;
}
const money = (n) => "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
const merch = [];
for (const p of allProducts) {
  if (originalHandles.has(p.handle)) continue;
  const kind = merchKind(p);
  if (!kind || !p.images.length) continue;
  const prices = p.variants.map((v) => Number(v.price)).filter((n) => !isNaN(n));
  const min = Math.min(...prices), max = Math.max(...prices);
  merch.push({
    title: p.title,
    handle: p.handle,
    kind,
    price: money(min),
    priceFrom: max > min,
    available: p.variants.some((v) => v.available),
    url: "https://angelafabbri.com/products/" + p.handle,
    image: { src: imageBase(p.images[0].src), src800: imageBase(p.images[0].src) + "&width=800", w: p.images[0].width, h: p.images[0].height },
  });
}

const shopLinks = {
  coasters: "https://angelafabbri.com/collections/coasters",
  trays: "https://angelafabbri.com/collections/acrylic-trays",
  handbags: "https://angelafabbri.com/collections/handbags",
  chairs: "https://angelafabbri.com/products/ghost-chair",
};

/* ---------- guard: no prices in the paintings array ---------- */
const paintingsJson = JSON.stringify(paintings);
if (/"(price|compare_at_price|prices)"/.test(paintingsJson)) throw new Error("price field leaked into AF_PAINTINGS");

const out =
  "/* Generated by build-data.mjs. Do not edit by hand. AF_PAINTINGS carries no price fields (D2). */\n" +
  "window.AF_PAINTINGS=" + paintingsJson + ";\n" +
  "window.AF_SHOP=" + JSON.stringify({ links: shopLinks, items: merch }) + ";\n";
writeFileSync(join(here, "data.js"), out);

const avail = paintings.filter((p) => p.available);
const dims = avail.filter((p) => p.sizeW).map((p) => ({ t: p.title, a: p.sizeW * p.sizeH, s: p.size }));
dims.sort((a, b) => a.a - b.a);
console.log("paintings", paintings.length, "available", avail.length, "sold", paintings.length - avail.length);
console.log("size parsed", paintings.filter((p) => p.size).length, "medium parsed", paintings.filter((p) => p.medium).length);
console.log("smallest available:", dims[0].s, "| largest available:", dims[dims.length - 1].s);
const bySeries = {};
for (const p of paintings) bySeries[p.series] = (bySeries[p.series] || 0) + (p.available ? 1 : 0) + "" && { total: (bySeries[p.series]?.total || 0) + 1, avail: (bySeries[p.series]?.avail || 0) + (p.available ? 1 : 0) };
console.log(bySeries);
console.log("merch", merch.length, Object.fromEntries(Object.keys(shopLinks).map((k) => [k, merch.filter((m) => m.kind === k).length])));
if (process.argv.includes("--table")) for (const p of paintings) console.log([p.available ? "A" : "S", p.series, p.title, "|", p.medium, "|", p.size, "|", p.repeated, "|", p.hidden, "|", p.story.slice(0, 70)].join(" "));
