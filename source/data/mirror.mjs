import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(import.meta.dirname, '../..');
const OUT = path.join(ROOT, 'docs/current');
const LIVE = 'https://angelafabbri.com';
const UA = 'Mozilla/5.0';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const report = [];
const failures = [];
const rj = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'source/data', f), 'utf8'));

async function get(url) {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
      if (r.status === 429) { if (i === 3) throw new Error('429'); await sleep(65000); continue; }
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.text();
    } catch (e) { if (i === 3 || !/429/.test(e.message) && i >= 1) throw e; await sleep(2000); }
  }
}

const collections = rj('collections.json').collections.map(c => c.handle);
const orig = rj('original-paintings.json').products;
const prodHandles = [];
for (const p of orig) if (p.variants?.[0]?.available) prodHandles.push(p.handle);
const extra = ['ghost-chair'];
for (const c of ['coasters', 'acrylic-trays', 'handbags']) {
  try {
    const j = JSON.parse(await get(`${LIVE}/collections/${c}/products.json?limit=1`));
    if (j.products?.[0]) extra.push(j.products[0].handle);
  } catch (e) { failures.push(`first product of ${c}: ${e.message}`); }
  await sleep(400);
}
const allProd = [...new Set([...extra, ...prodHandles])];
const prods = allProd.slice(0, 60), skipped = allProd.slice(60);
const prodSet = new Set(prods);

const pages = [{ url: '/', file: 'index.html' }];
for (const c of collections) pages.push({ url: `/collections/${c}`, file: `collections/${c}.html` });
for (const p of ['bio', 'press', 'contact']) pages.push({ url: `/pages/${p}`, file: `pages/${p}.html` });
for (const p of ['refund-policy', 'privacy-policy', 'terms-of-service', 'shipping-policy', 'contact-information']) pages.push({ url: `/policies/${p}`, file: `policies/${p}.html` });
for (const p of prods) pages.push({ url: `/products/${p}`, file: `products/${p}.html` });
const mirrored = new Set(pages.map(p => p.file));

const BANNER = '<div style="position:fixed;bottom:8px;right:8px;z-index:2147483647;background:rgba(0,0,0,.7);color:#fff;font:12px/1.4 sans-serif;padding:6px 10px;border-radius:4px;pointer-events:none">Reference copy of the current site. Some interactive features are disabled.</div>';

function rewrite(html, file) {
  const depth = file.split('/').length - 1;
  const up = '../'.repeat(depth) || './';
  // assets
  html = html.replace(/(["'(=\s,])\/cdn\//g, `$1${LIVE}/cdn/`);
  { const B = String.fromCharCode(92); html = html.split(B+"/cdn"+B+"/").join("https:"+B+"/"+B+"/angelafabbri.com"+B+"/cdn"+B+"/"); }
  for (const pre of ["\"", "'", "(", "=", " ", ","]) for (const h of ["angelafabbri.com", "cdn.shopify.com"]) html = html.split(pre + "//" + h).join(pre + "https://" + h);
  // links
  html = html.replace(/href=(["'])(\/[^"']*)\1/g, (m, q, u) => {
    if (u.startsWith('//')) return m;
    const mm = u.match(/^(\/[^?#]*)([?#].*)?$/);
    let p = mm[1], rest = mm[2] || '';
    if (p === '/') return `href=${q}${up}index.html${q}`;
    const t = p.match(/^\/(collections|products|pages|policies)\/([^\/]+)\/?$/);
    if (t) {
      const f = `${t[1]}/${t[2]}.html`;
      if (mirrored.has(f)) return `href=${q}${up}${f}${rest.startsWith('#') ? rest : ''}${q}`;
      return `href=${q}${LIVE}${u}${q} target="_blank"`;
    }
    return `href=${q}${LIVE}${u}${q}`;
  });
  html = html.replace(/action=(["'])(\/[^"']*)\1/g, (m, q, u) => u.startsWith('//') ? m : `action=${q}${LIVE}${u}${q}`);
  html = html.replace(/<body([^>]*)>/i, (m) => m + BANNER);
  return html;
}

let saved = 0;
for (const pg of pages) {
  try {
    const html = await get(LIVE + pg.url);
    const out = path.join(OUT, pg.file);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, rewrite(html, pg.file));
    saved++;
  } catch (e) { failures.push(`${pg.url}: ${e.message}`); mirrored.delete(pg.file); }
  await sleep(400);
}

function dirSize(d) { let s = 0; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); s += e.isDirectory() ? dirSize(p) : fs.statSync(p).size; } return s; }
const mb = (dirSize(OUT) / 1048576).toFixed(2);
const rep = [
  `Pages fetched and saved: ${saved} of ${pages.length}`,
  `Failures (${failures.length}):`, ...failures.map(f => '  ' + f),
  `Product pages mirrored: ${prods.length}`, `Product pages skipped (cap 60): ${skipped.length}`, ...skipped.map(s => '  ' + s),
  `Total size docs/current: ${mb} MB`,
  `Visual differences: (see appended notes)`, ''
].join('\n');
fs.writeFileSync(path.join(ROOT, 'source/data/mirror-report.txt'), rep);
console.log(rep);
