/* Site chrome: header (with menus, mobile drawer, trade lane), trade band and footer.
 * Injects into <div data-site-header></div> and <div data-site-footer></div> (legacy ids #chrome-top / #chrome-foot also work).
 * Loaded after data.js and before app.js. Exposes window.AFC (app.js adds the shared component functions to it).
 * Body options: <body data-page="home|paintings|..." data-trade-band="off"> */
(function () {
  'use strict';

  var K = {
    EMAIL: 'angela@fabbriology.com',
    PDF: 'https://cdn.shopify.com/s/files/1/0052/8334/8544/files/Printable_-_AF_Portfolio_2026.pdf?v=1782407305',
    CDN: 'https://angelafabbri.com/cdn/shop/files/',
    IG: 'https://www.instagram.com/fabbriology',
    FB: 'https://www.facebook.com/Fabbriology',
    POLICIES: 'https://angelafabbri.com/policies/',
    INSTALL: 'installation-fabbri-best-houston-artist.ai-01-01-01.jpg'
  };
  var AFC = window.AFC = window.AFC || {};
  AFC.K = K;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- where are we ---------- */
  var path = location.pathname.split('/').pop().replace(/\.html$/, '');
  var page = (path === '' || path === 'index') ? 'index' : path;
  var qs = {};
  try { new URLSearchParams(location.search).forEach(function (v, k) { qs[k] = v; }); } catch (e) {}
  var isHome = page === 'index' || document.body.dataset.page === 'home';
  var GROUP = { paintings: 'paintings', painting: 'paintings', commissions: 'paintings', shop: 'shop', product: 'shop' };

  var PAINT_LINKS = [
    ['All paintings', 'paintings.html'],
    ['Inversion', 'paintings.html?series=inversion'],
    ['Rose Pattern', 'paintings.html?series=rose-pattern'],
    ['Minis', 'paintings.html?series=minis'],
    ['Ten by Tens', 'paintings.html?series=ten-by-tens'],
    ['Abstracts with Attitude', 'paintings.html?series=abstracts-with-attitude'],
    '-',
    ['Commission inquiries', 'commissions.html']
  ];
  var SHOP_LINKS = [
    ['Shop overview', 'shop.html'],
    ['Coasters', 'shop.html?c=coasters'],
    ['Trays', 'shop.html?c=acrylic-trays'],
    ['Merch', 'shop.html?c=handbags'],
    ['Chairs', 'product.html?handle=ghost-chair'],
    '-',
    ['More from the studio', 'shop.html#more']
  ];

  function linkCurrent(href) {
    var m = href.match(/^([a-z]+)\.html(?:\?([a-z]+)=([^#]+))?(#.*)?$/);
    if (!m || m[4]) return false;
    var file = m[1];
    if (file !== page) return false;
    if (!m[2]) {
      if (file === 'paintings') return !qs.series || !PAINT_LINKS.some(function (l) { return l[1] === 'paintings.html?series=' + qs.series; });
      if (file === 'shop') return !qs.c || !SHOP_LINKS.some(function (l) { return l[1] === 'shop.html?c=' + qs.c; });
      return true;
    }
    return qs[m[2]] === m[3];
  }
  function subLinks(list) {
    return list.map(function (l) {
      if (l === '-') return '<div class="nav-sep" role="separator"></div>';
      return '<a href="' + l[1] + '"' + (linkCurrent(l[1]) ? ' aria-current="page"' : '') + '>' + l[0] + '</a>';
    }).join('');
  }
  function drawerLinks(list) {
    return list.filter(function (l) { return l !== '-'; }).map(function (l) {
      return '<a href="' + l[1] + '"' + (linkCurrent(l[1]) ? ' aria-current="page"' : '') + '>' + l[0] + '</a>';
    }).join('');
  }
  function groupOn(g) { return GROUP[page] === g; }
  var caret = '<svg class="caret" width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>';
  function ddItem(id, label, list, g) {
    return '<div class="nav-item"><button type="button" class="nav-dd-btn" id="' + id + '-btn" aria-expanded="false" aria-controls="' + id + '"' + (groupOn(g) ? ' aria-current="page"' : '') + '>' + label + caret + '</button>' +
      '<div class="nav-dd" id="' + id + '" hidden>' + subLinks(list) + '</div></div>';
  }
  function flat(file, label) { return '<a href="' + file + '.html"' + (page === file ? ' aria-current="page"' : '') + '>' + label + '</a>'; }

  /* ---------- header ---------- */
  function headerHTML() {
    var brand = '<a class="brand" href="index.html"><span class="brand-name">ANGELA FABBRI</span><span class="brand-sub">Fabbriology Fine Art</span></a>';
    return '<a class="skip" href="#main">Skip to content</a>' +
      '<header class="site-header"><div class="hdr wrap">' + brand +
      '<nav class="nav-desk" aria-label="Primary">' +
      ddItem('dd-paintings', 'Paintings', PAINT_LINKS, 'paintings') +
      ddItem('dd-shop', 'Shop', SHOP_LINKS, 'shop') +
      flat('bio', 'Bio') + flat('press', 'Press') + flat('contact', 'Contact') +
      '</nav>' +
      '<a class="btn btn-outline btn-sm hdr-trade" href="portfolio.html"' + (page === 'portfolio' ? ' aria-current="page"' : '') + '>For designers &amp; galleries</a>' +
      '<button type="button" class="menu-btn" aria-expanded="false" aria-controls="sheet" aria-haspopup="dialog">Menu</button>' +
      '</div></header>' +
      (isHome ? '' : '<div class="trade-lane"><a href="portfolio.html">For designers &amp; galleries →</a></div>') +
      '<dialog id="sheet" class="sheet" aria-label="Menu"><div class="sheet-in">' +
      '<div class="sheet-top">' + brand + '<button type="button" class="menu-btn sheet-close" autofocus>Close</button></div>' +
      '<nav aria-label="Menu">' +
      '<details class="sheet-dd"' + (groupOn('paintings') ? ' open' : '') + '><summary>Paintings</summary><div>' + drawerLinks(PAINT_LINKS) + '</div></details>' +
      '<details class="sheet-dd"' + (groupOn('shop') ? ' open' : '') + '><summary>Shop</summary><div>' + drawerLinks(SHOP_LINKS) + '</div></details>' +
      flat('bio', 'Bio') + flat('press', 'Press') + flat('contact', 'Contact') +
      '</nav>' +
      '<a class="btn btn-primary" href="portfolio.html">For designers &amp; galleries</a>' +
      '<div class="sheet-foot"><a href="mailto:' + K.EMAIL + '">' + K.EMAIL + '</a><a href="' + K.IG + '" rel="noopener">Instagram</a><a href="' + K.FB + '" rel="noopener">Facebook</a></div>' +
      '</div></dialog>';
  }

  function setupHeader() {
    var sheet = $('#sheet'), mb = $('.hdr .menu-btn');
    mb.addEventListener('click', function () { sheet.showModal(); mb.setAttribute('aria-expanded', 'true'); });
    function closeSheet() { if (sheet.open) sheet.close(); }
    $('.sheet-close').addEventListener('click', closeSheet);
    sheet.addEventListener('close', function () { mb.setAttribute('aria-expanded', 'false'); mb.focus(); });
    $$('#sheet a').forEach(function (a) { a.addEventListener('click', function () { if (a.pathname === location.pathname && a.search === location.search) closeSheet(); }); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1024) closeSheet(); });

    /* desktop menus */
    var items = $$('.nav-item'), openItem = null, timer = null, viaHover = false;
    var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (min-width: 1024px)');
    function btnOf(it) { return $('.nav-dd-btn', it); }
    function panelOf(it) { return $('.nav-dd', it); }
    function open(it, hover) {
      clearTimeout(timer);
      if (openItem && openItem !== it) close(openItem, false);
      btnOf(it).setAttribute('aria-expanded', 'true');
      panelOf(it).hidden = false;
      openItem = it; viaHover = !!hover;
    }
    function close(it, focus) {
      clearTimeout(timer);
      btnOf(it).setAttribute('aria-expanded', 'false');
      panelOf(it).hidden = true;
      if (openItem === it) openItem = null;
      if (focus) btnOf(it).focus();
    }
    items.forEach(function (it) {
      var b = btnOf(it), pn = panelOf(it);
      b.addEventListener('click', function () {
        if (openItem === it && viaHover) { viaHover = false; return; }
        if (openItem === it) close(it, false); else open(it, false);
      });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); open(it, false); $('a', pn).focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); open(it, false); var l = $$('a', pn); l[l.length - 1].focus(); }
      });
      pn.addEventListener('keydown', function (e) {
        var links = $$('a', pn), i = links.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') { e.preventDefault(); links[(i + 1) % links.length].focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); links[(i - 1 + links.length) % links.length].focus(); }
        else if (e.key === 'Home') { e.preventDefault(); links[0].focus(); }
        else if (e.key === 'End') { e.preventDefault(); links[links.length - 1].focus(); }
      });
      it.addEventListener('mouseenter', function () { if (canHover && canHover.matches) open(it, true); });
      it.addEventListener('mouseleave', function () { if (canHover && canHover.matches && openItem === it) { clearTimeout(timer); timer = setTimeout(function () { if (openItem === it) close(it, false); }, 150); } });
      it.addEventListener('focusout', function (e) { if (openItem === it && e.relatedTarget && !it.contains(e.relatedTarget)) close(it, false); });
    });
    document.addEventListener('click', function (e) { if (openItem && !openItem.contains(e.target)) close(openItem, false); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !openItem) return;
      var it = openItem; close(it, true);
    });
  }

  /* ---------- trade band + footer ---------- */
  function tradeBandHTML() {
    return '<section class="section band trade-band" aria-labelledby="tb-h"><div class="wrap"><div class="band-cta">' +
      '<div><p class="eyebrow">For designers &amp; galleries</p><h2 class="h2" id="tb-h" style="margin-top:12px">Sourcing for a client or a show?</h2>' +
      '<p class="lede" style="margin-top:16px">Portfolio, sizes and commissions in one place.</p>' +
      '<div class="btn-row" style="margin-top:24px"><a class="btn btn-primary" href="portfolio.html">View the portfolio</a><a class="btn btn-outline" href="' + K.PDF + '" target="_blank" rel="noopener">Download PDF</a></div></div>' +
      '<figure style="margin:0"><div class="trade-img"><img src="' + K.CDN + K.INSTALL + '?width=1200" alt="Bloom Big, a wall of blue painted panels with backwards green lettering and painted plant boxes, installed in a Houston hotel lobby" width="1200" height="1200" loading="lazy" decoding="async"></div>' +
      '<figcaption>“Bloom Big” at a Houston Medical Center hotel, via CultureMap Houston</figcaption></figure>' +
      '</div></div></section>';
  }
  AFC.tradeBandHTML = tradeBandHTML;

  var POL = [['privacy-policy', 'Privacy policy'], ['refund-policy', 'Refund policy'], ['shipping-policy', 'Shipping policy'], ['terms-of-service', 'Terms of service'], ['contact-information', 'Contact information']];
  function footerHTML() {
    var showBand = !isHome && page !== 'portfolio' && document.body.dataset.tradeBand !== 'off';
    return (showBand ? tradeBandHTML() : '') +
      '<footer class="foot" id="colophon"><div class="wrap"><div class="foot-grid">' +
      '<div><h2>First look at new works</h2><p class="big">Be the first to see what comes off the easel.</p>' +
      '<form class="join join-form" novalidate><div class="field"><label for="join-e" class="sr">Email</label><input id="join-e" type="email" placeholder="Your email" autocomplete="email"></div><button class="btn btn-primary" type="submit">Join</button></form>' +
      '<p class="join-done" role="status" hidden><svg width="22" height="22" viewBox="0 0 36 36" fill="none" stroke="#C8A46A" stroke-width="2.5" aria-hidden="true"><circle cx="18" cy="18" r="16"/><path d="M11 18.5l5 5 9-10" stroke-linecap="round" stroke-linejoin="round"/></svg>You’re on the list</p></div>' +
      '<div><h2>Studio</h2><p class="big"><a href="mailto:' + K.EMAIL + '">' + K.EMAIL + '</a></p><p class="meta">Houston, Texas</p>' +
      '<ul><li><a href="' + K.IG + '" rel="noopener">Instagram</a></li><li><a href="' + K.FB + '" rel="noopener">Facebook</a></li></ul></div>' +
      '<div><h2>Explore</h2><ul><li><a href="paintings.html">Paintings</a></li><li><a href="commissions.html">Commissions</a></li><li><a href="shop.html">Shop</a></li><li><a href="bio.html">Bio</a></li><li><a href="press.html">Press</a></li><li><a href="contact.html">Contact</a></li><li><a href="portfolio.html">For designers &amp; galleries</a></li></ul></div>' +
      '</div>' +
      '<div class="foot-bottom"><div class="wordmark" aria-hidden="true"><span class="mirror">FABBRIOLOGY</span></div><span class="sr">Fabbriology</span>' +
      '<ul class="foot-policies">' + POL.map(function (p) { return '<li><a href="' + K.POLICIES + p[0] + '" rel="noopener">' + p[1] + '</a></li>'; }).join('') + '</ul>' +
      '<small>© 2026 Angela Fabbri · Fabbriology Fine Art</small><small class="demo-note">Demo build, nothing is sent</small></div>' +
      '</div></footer>';
  }

  /* ---------- boot ---------- */
  function chrome() {
    var top = $('[data-site-header]') || $('#chrome-top');
    var foot = $('[data-site-footer]') || $('#chrome-foot');
    if (top) { top.innerHTML = headerHTML(); setupHeader(); }
    if (foot) foot.innerHTML = footerHTML();
  }
  AFC.chrome = chrome;
  chrome();
})();
