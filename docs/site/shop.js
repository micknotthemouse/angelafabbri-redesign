/* Shop overview/category, product detail and contact. Needs data.js, components.js, app.js (window.AF). */
(function () {
  'use strict';
  var AF = window.AF, esc = AF.esc, $ = AF.$, $$ = AF.$$, cats = AF.shop.cats;
  var page = document.body.dataset.page;
  var LEDE = {
    coasters: 'Fine-art coasters printed from her paintings.',
    'acrylic-trays': 'Acrylic trays for the coffee table or the bar.',
    handbags: 'Hand-painted totes, pouches and studio extras.',
    chairs: 'A hand-painted ghost chair, one of a kind.',
    sculptures: 'Paint-brush sculptures and fine-art boxes.',
    'other-goodies': 'Small things from the studio.',
    prints: 'Signed, numbered prints of her originals.'
  };
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
  function setTitle(t, d) {
    document.title = t + ' | Angela Fabbri | Fabbriology Fine Art';
    var m = $('meta[name="description"]'); if (m && d) m.setAttribute('content', d);
  }

  /* ---------- shop ---------- */
  function tile(c, more) {
    var href = !more && c.key === 'chairs' ? 'product.html?handle=ghost-chair' : 'shop.html?c=' + encodeURIComponent(c.key);
    return '<a class="tile" href="' + href + '"><div class="tile-img"><img src="' + esc(c.cover) + '" alt="' + esc(c.coverAlt) + '" width="800" height="' + (more ? 600 : 800) + '" loading="lazy" decoding="async"></div>' +
      '<div class="tile-body"><h3 class="tile-title">' + esc(c.label) + '</h3><p class="price">' + esc(c.fromText) + '</p><span class="count">' + plural(c.count, 'item') + '</span></div></a>';
  }
  function shop() {
    var key = AF.qs('c'), cat = key && AF.catBy[key];
    var head = $('#shopHead'), body = $('#shopBody');
    if (cat) {
      var list = AF.itemsInCat(cat.key);
      setTitle(cat.label + ' · Shop', 'Fabbriology shop: ' + cat.label + '. ' + (LEDE[cat.key] || ''));
      $('#crumb').hidden = false;
      head.innerHTML = '<p class="eyebrow">The Fabbriology shop</p><h1 class="h1">' + esc(cat.label) + '</h1><p class="lede">' + esc(LEDE[cat.key] || '') + '</p>';
      body.innerHTML = '<p class="result" aria-live="polite">' + plural(list.length, 'item') + '</p>' +
        '<div class="merch-grid">' + AF.merchCards(list, { eager: 4 }) + '</div>' +
        '<p class="shop-live"><a class="btn btn-outline" href="' + esc(cat.live) + '">See this collection on angelafabbri.com</a></p>';
    } else {
      var main = cats.filter(function (c) { return c.group === 'main'; });
      var more = cats.filter(function (c) { return c.group === 'more'; });
      body.innerHTML = '<div class="tiles">' + main.map(function (c) { return tile(c, false); }).join('') + '</div>' +
        '<section class="shop-more" id="more" aria-labelledby="more-h"><div class="sec-head"><h2 class="h2" id="more-h">More from the studio</h2></div>' +
        '<div class="tiles tiles--more">' + more.map(function (c) { return tile(c, true); }).join('') + '</div></section>';
    }
    AF.reveal();
  }

  /* ---------- product ---------- */
  function product() {
    var h = AF.qs('handle') || AF.qs('h');
    if (h && AF.isPainting(h) && !AF.isItem(h)) { location.replace('painting.html?handle=' + encodeURIComponent(h)); return; }
    var it = h && AF.shopBy[h];
    if (!it) { location.replace('shop.html'); return; }
    var cat = AF.catBy[it.cats[0]], n = it.images.length, idx = 0;
    setTitle(it.title, it.title + ' from the Fabbriology shop. ' + it.priceText + '. Checkout happens on angelafabbri.com.');
    $('#crumb').innerHTML = '<a href="shop.html' + (cat ? '?c=' + encodeURIComponent(cat.key) : '') + '">← ' + (cat ? esc(cat.label) : 'Shop') + '</a>';
    function altAt(i) { return i === 0 ? AF.merchAlt(it) : it.title + ', view ' + (i + 1) + ' of ' + n; }
    var thumbs = n > 1 ? '<div class="thumbs" role="group" aria-label="More views">' + it.images.map(function (im, i) {
      return '<button type="button" data-i="' + i + '"' + (i === 0 ? ' aria-current="true"' : '') + '><img src="' + AF.imgAt(it, i, 200) + '" alt="' + esc(it.title + ', view ' + (i + 1) + ' of ' + n) + '" width="128" height="128" loading="lazy" decoding="async"></button>';
    }).join('') + '</div>' : '';
    var buy = it.available
      ? '<a class="btn btn-primary btn-buy" href="' + esc(it.url) + '">Buy on angelafabbri.com</a>'
      : '<a class="btn btn-outline btn-buy" href="' + esc(it.url) + '">View on angelafabbri.com</a>';
    $('#detail').innerHTML =
      '<div class="d-media"><button type="button" class="d-frame sq" id="open-lb" aria-label="Enlarge image of ' + esc(it.title) + '"><img id="d-img" src="' + AF.imgAt(it, 0, 1200) + '" srcset="' + AF.imgAt(it, 0, 800) + ' 800w, ' + AF.imgAt(it, 0, 1200) + ' 1200w, ' + AF.imgAt(it, 0, 1600) + ' 1600w" sizes="(min-width:1024px) 58vw, 92vw" alt="' + esc(altAt(0)) + '" width="1200" height="1200" fetchpriority="high"></button>' + thumbs + '</div>' +
      '<div class="d-info">' + (cat ? '<p class="eyebrow"><a href="shop.html?c=' + encodeURIComponent(cat.key) + '" style="text-decoration:none">' + esc(cat.label) + '</a></p>' : '') +
      '<h1>' + esc(it.title) + '</h1><p class="p-price">' + esc(it.priceText) + '</p>' +
      '<p class="status" style="margin-top:12px">' + (it.available ? '<i class="dot" aria-hidden="true"></i>In stock' : '<span class="tag-sold">Sold out</span>') + '</p>' +
      buy + '<p class="p-note">Checkout happens on angelafabbri.com. This demo has no cart.</p>' +
      (it.desc && it.desc.length ? '<div class="d-desc">' + it.desc.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('') + '</div>' : '') + '</div>';

    var main = $('#d-img'), thumbBtns = $$('.thumbs button');
    function show(i) {
      idx = i;
      main.src = AF.imgAt(it, i, 1200); main.removeAttribute('srcset'); main.alt = altAt(i);
      thumbBtns.forEach(function (b, k) { if (k === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    }
    thumbBtns.forEach(function (b) { b.addEventListener('click', function () { show(+b.dataset.i); }); });
    $('#open-lb').addEventListener('click', function (e) {
      AF.lightbox(it.images.map(function (im, i) { return { src: AF.imgAt(it, i, 1600), alt: altAt(i), caption: it.title + (n > 1 ? ' · view ' + (i + 1) + ' of ' + n : '') }; }), idx, e.currentTarget, { label: 'Image viewer: ' + it.title, onChange: show });
    });

    // More in this category (padded from the item's other categories)
    var primary = cat ? AF.itemsInCat(cat.key).filter(function (x) { return x.handle !== it.handle; }) : [];
    function bagLast(a) { return a.filter(function (x) { return !/^Gift Bag/i.test(x.title); }).concat(a.filter(function (x) { return /^Gift Bag/i.test(x.title); })); }
    primary = bagLast(primary);
    var rel = primary.slice(0, 4), full = rel.length === 4;
    it.cats.slice(1).forEach(function (k) { bagLast(AF.itemsInCat(k)).forEach(function (x) { if (rel.length < 4 && x.handle !== it.handle && rel.indexOf(x) < 0) rel.push(x); }); });
    if (rel.length) {
      $('#alsoTitle').textContent = full && cat ? 'More in ' + cat.label : 'More from the studio';
      $('#also').innerHTML = AF.merchCards(rel);
      $('#alsoWrap').hidden = false;
    }
    AF.reveal();
  }

  /* ---------- contact ---------- */
  function contact() {
    AF.inlineForm('#contactForm', { mode: 'general', ref: 'General inquiry', placeholder: 'Tell Angela what you have in mind' });
  }

  AF.ready(function () { if (page === 'shop') shop(); else if (page === 'product') product(); else if (page === 'contact') contact(); });
})();
