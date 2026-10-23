/* Option C: After Hours. Vanilla JS, no modules, no fetch: works from file:// and GitHub Pages. */
(function () {
  'use strict';

  var EMAIL = 'angela@fabbriology.com';
  var CDN = 'https://angelafabbri.com/cdn/shop/files/';
  var P = window.AF_PAINTINGS || [];
  var SHOP = window.AF_SHOP || { groups: [], items: [] };
  var SERIES = [['inversion', 'Inversion'], ['rose-pattern', 'Rose Pattern'], ['minis', 'Minis'], ['ten-by-tens', 'Ten by Tens'], ['abstracts-with-attitude', 'Abstracts with Attitude']];
  var SERIES_NAME = {};
  SERIES.forEach(function (s) { SERIES_NAME[s[0]] = s[1]; });
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var by = {};
  P.forEach(function (p) { by[p.handle] = p; });

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ---------- painting helpers ---------- */
  function sizeText(p) { return p.w && p.h ? p.w + ' × ' + p.h + ' in' : (p.diameter ? p.diameter + ' in diameter' : ''); }
  function shortMedium(m) { if (!m) return ''; return m.length > 48 && m.indexOf(',') > 0 ? m.slice(0, m.indexOf(',')) : m; }
  function metaText(p) { return [shortMedium(p.medium), sizeText(p)].filter(Boolean).join(' · ') || 'Original painting'; }
  function mainSeries(p) { return p.series.length ? SERIES_NAME[p.series[0]] : 'Original painting'; }
  function imgAt(p, i, w) { var im = p.images[i] || p.images[0]; return im.a.replace('width=800', 'width=' + w); }
  function alt(p) { return p.title + ', ' + [shortMedium(p.medium), sizeText(p)].filter(Boolean).join(', ') + ', by Angela Fabbri'; }
  function availableCount() { return P.filter(function (p) { return p.available; }).length; }

  /* ---------- the inline inquiry component ---------- */
  var uid = 0, current = null;
  var TRUST_INFO = 'Original, 1 of 1 · Certificate of authenticity included · Price on request · Reply within 1 business day';
  var TRUST_COMM = 'Sized and colored to your space · Reply within 1 business day';

  function trustHTML(t) { return t.split(' · ').map(function (x) { return '<span>' + esc(x) + '</span>'; }).join(' '); }

  // One render function picks the mode from `available`, so a sold work can never show "Request info".
  function inquiry(p, o) {
    o = o || {};
    var id = 'inq-' + (p ? p.handle : 'general') + '-' + (++uid);
    var commission = !p || !p.available;
    var label = !p ? 'Start a commission inquiry' : (p.available ? 'Request info' : 'Sold · Submit commission inquiry');
    var sent = !p ? 'Commission inquiry sent' : (p.available ? 'Inquiry sent' : 'Sold · Commission inquiry sent');
    var cls = 'btn inq-btn ' + (commission && p ? 'btn-outline' : 'btn-primary');
    var title = p ? p.title : 'general';
    return '<div class="inq-wrap">' +
      '<button type="button" class="' + cls + '" aria-expanded="false" aria-controls="' + id + '" data-h="' + esc(p ? p.handle : '') + '" data-mode="' + (commission ? 'commission' : 'info') + '" data-label="' + esc(label) + '" data-sent="' + esc(sent) + '">' + esc(label) + '</button>' +
      '<div id="' + id + '" class="inq" role="region" aria-label="' + esc(p ? 'Inquiry about ' + title : 'Commission inquiry') + '" hidden></div>' +
      '</div>';
  }

  function buildPanel(panel, btn) {
    var p = btn.dataset.h ? by[btn.dataset.h] : null;
    var commission = btn.dataset.mode === 'commission';
    var id = panel.id;
    var ref = !p ? 'Commission inquiry (general)' : (commission ? 'Commission inquiry inspired by ' + p.title : 'About: ' + p.title + (sizeText(p) ? ' · ' + sizeText(p) : ''));
    var ph = commission ? 'Size, colors, the room, or a message you’d like hidden in it' : 'Anything you’d like to know, such as shipping or framing';
    panel.innerHTML =
      '<div class="inq-in"><div class="inq-card' + (commission ? ' commission' : '') + '">' +
      '<p class="inq-ref">' + esc(ref) + '</p>' +
      '<form class="inq-form" novalidate>' +
      '<input type="hidden" name="painting" value="' + esc(p ? p.title : 'General') + '">' +
      '<input type="hidden" name="inquiry_type" value="' + (commission ? 'commission' : 'info') + '">' +
      '<input type="hidden" name="reference" value="' + esc(ref) + '">' +
      '<div class="field"><label for="' + id + '-n">Name</label><input id="' + id + '-n" name="name" type="text" autocomplete="name" aria-describedby="' + id + '-ne"><p class="err" id="' + id + '-ne" hidden></p></div>' +
      '<div class="field"><label for="' + id + '-e">Email</label><input id="' + id + '-e" name="email" type="email" inputmode="email" autocomplete="email" aria-describedby="' + id + '-ee"><p class="err" id="' + id + '-ee" hidden></p></div>' +
      '<div class="field"><label for="' + id + '-m">Note (optional)</label><textarea id="' + id + '-m" name="note" rows="3" placeholder="' + esc(ph) + '"></textarea></div>' +
      '<div class="inq-actions"><button type="submit" class="btn btn-primary">Send</button><button type="button" class="btn-text inq-cancel">Cancel</button></div>' +
      '<p class="trust">' + trustHTML(commission ? TRUST_COMM : TRUST_INFO) + '</p>' +
      '</form></div></div>';
    panel.dataset.built = '1';
  }

  function openInq(btn) {
    if (current && current !== btn) closeInq(current, false);
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel.dataset.built) buildPanel(panel, btn);
    panel.hidden = false;
    void panel.offsetHeight; // let the browser paint 0fr first so the transition runs
    panel.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    current = btn;
    var target = $('input[name="name"]', panel) || $('.inq-done', panel);
    if (target) target.focus({ preventScroll: true });
    setTimeout(function () {
      if (current === btn) panel.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    }, reduce ? 0 : 260);
  }

  function closeInq(btn, returnFocus) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    panel.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    var done = function () { if (!panel.classList.contains('open')) panel.hidden = true; };
    if (reduce) done(); else setTimeout(done, 280);
    if (current === btn) current = null;
    if (returnFocus) btn.focus();
  }

  function showError(input, msg) {
    var err = document.getElementById(input.getAttribute('aria-describedby'));
    input.setAttribute('aria-invalid', 'true');
    err.textContent = msg; err.hidden = false;
  }
  function clearError(input) {
    var err = document.getElementById(input.getAttribute('aria-describedby'));
    input.removeAttribute('aria-invalid');
    if (err) { err.textContent = ''; err.hidden = true; }
  }

  function submitInq(form) {
    var name = form.elements.name, email = form.elements.email, first = null;
    clearError(name); clearError(email);
    if (!name.value.trim()) { showError(name, 'Please add your name'); first = first || name; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { showError(email, 'Please enter a valid email'); first = first || email; }
    if (first) { first.focus(); return; }
    var panel = form.closest('.inq'), btn = $('.inq-btn', panel.parentNode);
    var send = $('button[type="submit"]', form);
    send.disabled = true; send.textContent = 'Sending…';
    // Demo only: no network request is made.
    setTimeout(function () {
      var commission = btn.dataset.mode === 'commission';
      var card = $('.inq-card', panel);
      card.innerHTML =
        '<div class="inq-done" role="status" tabindex="-1">' +
        '<svg class="check" viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="18" cy="18" r="16"/><path d="M11 18.5l5 5 9-10" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '<p class="inq-done-title">' + (commission ? 'Commission inquiry sent to ' : 'Sent to ') + EMAIL + '</p>' +
        '<p>Angela will reply personally, usually within 1 business day.</p>' +
        '<button type="button" class="btn btn-outline inq-notify">Notify me of new works</button></div>';
      btn.textContent = btn.dataset.sent;
      $('.inq-done', card).focus({ preventScroll: true });
    }, reduce ? 0 : 600);
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.inq-btn');
    if (btn) { if (btn.getAttribute('aria-expanded') === 'true') closeInq(btn, true); else openInq(btn); return; }
    var cancel = e.target.closest && e.target.closest('.inq-cancel');
    if (cancel) { var b = $('.inq-btn', cancel.closest('.inq-wrap')); closeInq(b, true); return; }
    var nf = e.target.closest && e.target.closest('.inq-notify');
    if (nf) { nf.textContent = 'You’re on the list'; nf.disabled = true; }
  });
  document.addEventListener('submit', function (e) {
    if (e.target.classList.contains('inq-form')) { e.preventDefault(); submitInq(e.target); }
    if (e.target.classList.contains('join-form')) {
      e.preventDefault();
      var inp = $('input', e.target);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim())) { inp.setAttribute('aria-invalid', 'true'); inp.focus(); return; }
      e.target.hidden = true; var d = $('.join-done', e.target.parentNode); d.hidden = false;
    }
  });
  document.addEventListener('input', function (e) {
    if (e.target.getAttribute && e.target.getAttribute('aria-invalid') === 'true' && e.target.closest('.inq-form')) clearError(e.target);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !current || $('dialog[open]')) return;
    var wrap = current.closest('.inq-wrap');
    closeInq(current, wrap.contains(document.activeElement));
  });

  /* ---------- shared render pieces ---------- */
  function card(p, o) {
    o = o || {};
    var sold = !p.available;
    var href = 'painting.html?h=' + encodeURIComponent(p.handle);
    return '<article class="card">' +
      '<a class="card-frame' + (p.room ? ' room' : '') + '" href="' + href + '" aria-label="' + esc(p.title) + ': view painting"><img src="' + imgAt(p, 0, 800) + '" srcset="' + imgAt(p, 0, 800) + ' 800w, ' + imgAt(p, 0, 1200) + ' 1200w" sizes="(min-width:1200px) 300px, (min-width:640px) 45vw, 92vw" alt="' + esc(alt(p)) + '" width="1200" height="1500" ' + (o.eager ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async"></a>' +
      '<div class="card-body"><h3 class="card-title"><a href="' + href + '">' + esc(p.title) + '</a></h3>' +
      '<p class="meta">' + esc(metaText(p)) + '</p>' +
      '<p class="status">' + (sold ? '<span class="tag-sold">Sold</span>' : '<i class="dot" aria-hidden="true"></i>Available') + '</p>' +
      inquiry(p) + '</div></article>';
  }
  function cards(list, o) { return list.map(function (p, i) { return card(p, { eager: o && o.eager && i < o.eager }); }).join(''); }

  /* ---------- chrome: header, mobile menu, footer ---------- */
  function chrome() {
    var top = $('#chrome-top');
    var page = document.body.dataset.page;
    var links = [['Paintings', 'paintings.html', 'paintings'], ['Commissions', 'index.html#commissions'], ['Shop', 'index.html#shop'], ['About', 'index.html#about'], ['Press', 'index.html#credentials'], ['Contact', 'index.html#contact']];
    var nav = links.map(function (l) { return '<a href="' + l[1] + '"' + (l[2] === page ? ' aria-current="page"' : '') + '>' + l[0] + '</a>'; }).join('');
    var sheetNav = links.map(function (l) { return '<a href="' + l[1] + '">' + l[0] + '</a>'; }).join('');
    top.innerHTML =
      '<a class="skip" href="#main">Skip to content</a>' +
      '<header class="site-header"><div class="hdr wrap">' +
      '<a class="brand" href="index.html"><span class="brand-name">ANGELA FABBRI</span><span class="brand-sub">Fabbriology Fine Art</span></a>' +
      '<nav class="nav-desk" aria-label="Primary">' + nav + '</nav>' +
      '<a class="btn btn-outline btn-sm hdr-trade" href="portfolio.html">For designers &amp; galleries</a>' +
      '<button type="button" class="menu-btn" aria-expanded="false" aria-controls="sheet" aria-haspopup="dialog">Menu</button>' +
      '</div></header>' +
      '<dialog id="sheet" class="sheet" aria-label="Menu"><div class="sheet-in">' +
      '<div class="sheet-top"><a class="brand" href="index.html"><span class="brand-name">ANGELA FABBRI</span><span class="brand-sub">Fabbriology Fine Art</span></a><button type="button" class="menu-btn sheet-close" autofocus>Close</button></div>' +
      '<nav aria-label="Menu">' + sheetNav + '</nav>' +
      '<a class="btn btn-primary" href="portfolio.html">For designers &amp; galleries</a>' +
      '<div class="sheet-foot"><a href="mailto:' + EMAIL + '">' + EMAIL + '</a><a href="https://www.instagram.com/fabbriology" rel="noopener">Instagram</a></div>' +
      '</div></dialog>';
    var sheet = $('#sheet'), mb = $('.hdr .menu-btn');
    mb.addEventListener('click', function () { sheet.showModal(); mb.setAttribute('aria-expanded', 'true'); });
    function closeSheet() { if (sheet.open) sheet.close(); }
    $('.sheet-close').addEventListener('click', closeSheet);
    sheet.addEventListener('close', function () { mb.setAttribute('aria-expanded', 'false'); mb.focus(); });
    $$('#sheet a').forEach(function (a) { a.addEventListener('click', function () { if (a.hash && a.pathname === location.pathname) closeSheet(); }); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1024) closeSheet(); });

    var foot = $('#chrome-foot');
    foot.innerHTML =
      '<footer class="foot" id="contact"><div class="wrap">' +
      '<div class="foot-grid">' +
      '<div><h2>First look at new works</h2><p class="big">Be the first to see what comes off the easel.</p>' +
      '<form class="join join-form" novalidate><div class="field"><label for="join-e" class="sr">Email</label><input id="join-e" type="email" placeholder="Your email" autocomplete="email"></div><button class="btn btn-primary" type="submit">Join</button></form>' +
      '<p class="join-done" role="status" hidden><svg width="22" height="22" viewBox="0 0 36 36" fill="none" stroke="#C8A46A" stroke-width="2.5" aria-hidden="true"><circle cx="18" cy="18" r="16"/><path d="M11 18.5l5 5 9-10" stroke-linecap="round" stroke-linejoin="round"/></svg>You’re on the list</p></div>' +
      '<div><h2>Studio inquiries</h2><p class="big"><a href="mailto:' + EMAIL + '">' + EMAIL + '</a></p><p class="meta">Houston, Texas</p>' +
      '<ul><li><a href="https://www.instagram.com/fabbriology" rel="noopener">Instagram</a></li><li><a href="https://www.facebook.com/Fabbriology" rel="noopener">Facebook</a></li></ul></div>' +
      '<div><h2>Explore</h2><ul><li><a href="paintings.html">Paintings</a></li><li><a href="index.html#commissions">Commissions</a></li><li><a href="portfolio.html">For designers &amp; galleries</a></li><li><a href="index.html#shop">Shop</a></li><li><a href="index.html#about">About</a></li><li><a href="index.html#credentials">Press</a></li></ul></div>' +
      '</div>' +
      '<div class="foot-bottom"><div class="wordmark" aria-hidden="true"><span class="mirror">FABBRIOLOGY</span></div><span class="sr">Fabbriology</span><small>© 2026 Angela Fabbri · Fabbriology Fine Art</small></div>' +
      '</div></footer>' +
      '<a class="demo-label" href="../index.html">Demo C: After Hours (Option C, Collector Concierge)</a>';
  }

  /* ---------- reveal ---------- */
  function reveal() {
    if (reduce || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').forEach(function (el) { el.classList.add('will-reveal'); io.observe(el); });
  }

  /* ---------- homepage ---------- */
  function home() {
    var fire = by['fire-horse'];
    var plate = $('#plate');
    if (fire && plate) {
      plate.innerHTML =
        '<div class="plate-top"><a class="plate-thumb" href="painting.html?h=fire-horse" tabindex="-1" aria-hidden="true"><img src="' + imgAt(fire, 0, 400) + '" srcset="' + imgAt(fire, 0, 400) + ' 400w, ' + imgAt(fire, 0, 800) + ' 800w" sizes="120px" alt="" width="240" height="300"></a>' +
        '<div class="plate-text"><p class="eyebrow">Featured · ' + esc(mainSeries(fire)) + '</p><h2 class="plate-title"><a href="painting.html?h=fire-horse">' + esc(fire.title) + '</a></h2>' +
        '<p class="meta meta-2"><span>' + esc(shortMedium(fire.medium)) + '</span><span>' + esc(sizeText(fire)) + '</span></p><p class="status"><i class="dot" aria-hidden="true"></i>Available · Original, 1 of 1</p></div></div>' +
        inquiry(fire);
    }

    var avail = ['neon-roses', 'smell-the-roses', 'im-expensive', 'why-not-you', 'im-your-biggest-fan', 'handle-with-care', 'if-you-listen-you-can-hear', 'its-rude-to-stare-black'].map(function (h) { return by[h]; }).filter(Boolean);
    $('#availGrid').innerHTML = cards(avail);
    $('#seeAll').textContent = 'See all available paintings (' + availableCount() + ')';

    var sold = ['i-am-bluetiful', 'send-the-jet', 'love-money-art', 'i-want-you-too', 'hug-me', 'im-a-conversation-piece-fl-orange'].map(function (h) { return by[h]; }).filter(Boolean);
    $('#soldGrid').innerHTML = cards(sold);
    $('#commissionCta').innerHTML = inquiry(null);

    var gg = by['green-goddess'];
    if (gg) {
      var img = $('#mirrorImg');
      img.src = imgAt(gg, 0, 1200); img.srcset = imgAt(gg, 0, 800) + ' 800w, ' + imgAt(gg, 0, 1200) + ' 1200w'; img.alt = alt(gg);
      $('#mirrorCap').textContent = gg.title + ' · ' + shortMedium(gg.medium) + ' · ' + sizeText(gg) + ' · ' + (gg.available ? 'Available' : 'Sold');
      $('#mirrorInq').innerHTML = inquiry(gg);
    }
    var mb = $('#mirrorBtn'), note = $('#mirrorNote'), im = $('#mirrorImg');
    mb.addEventListener('click', function () {
      var on = mb.getAttribute('aria-pressed') !== 'true';
      mb.setAttribute('aria-pressed', String(on));
      mb.textContent = on ? 'Back to original' : 'Mirror it';
      im.classList.toggle('flipped', on);
      if (reduce) im.style.transition = 'none';
      note.textContent = on ? 'Mirrored: the letters now read normally, left to right.' : '';
    });

    // Trade facts computed from the data (available works only).
    var av = P.filter(function (p) { return p.available && p.w; });
    var mins = av.map(function (p) { return Math.min(p.w, p.h); }), maxs = av.map(function (p) { return Math.max(p.w, p.h); });
    var lo = Math.min.apply(null, mins), hi = Math.max.apply(null, maxs);
    var rng = $('#tradeRange');
    if (rng) rng.textContent = 'Ready-to-ship originals from ' + lo + ' × ' + lo + ' in to ' + hi + ' × ' + hi + ' in.';

    $('#shopTiles').innerHTML = SHOP.groups.map(function (g) {
      return '<a class="tile" href="' + g.url + '" rel="noopener"><div class="tile-img"><img src="' + g.cover + '" alt="' + esc(g.coverTitle) + ', Fabbriology shop" width="800" height="800" loading="lazy" decoding="async"></div>' +
        '<div class="tile-body"><h3 class="tile-title">' + esc(g.title) + '</h3><p class="price">From $' + g.from + '</p><span class="go">Shop on angelafabbri.com</span></div></a>';
    }).join('');
  }

  /* ---------- paintings page ---------- */
  function paintings() {
    var state = { series: 'all', archive: false };
    try { var q = new URLSearchParams(location.search).get('series'); if (q && SERIES_NAME[q]) state.series = q; } catch (e) {}
    var chips = $('#chips'), grid = $('#grid'), res = $('#result'), tg = $('#archiveToggle'), col = $('#collected'), cg = $('#collectedGrid');
    chips.innerHTML = [['all', 'All']].concat(SERIES).map(function (s) { return '<button type="button" data-s="' + s[0] + '" aria-pressed="false">' + s[1] + '</button>'; }).join('');
    function match(p) { return state.series === 'all' || p.series.indexOf(state.series) > -1; }
    function render() {
      if (current) { closeInq(current, false); }
      $$('button', chips).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.s === state.series)); });
      var a = P.filter(function (p) { return p.available && match(p); });
      var s = P.filter(function (p) { return !p.available && match(p); });
      var label = state.series === 'all' ? '' : ' in ' + SERIES_NAME[state.series];
      res.textContent = a.length + ' available' + label;
      grid.innerHTML = a.length ? cards(a, { eager: 4 }) : '<div class="empty" style="grid-column:1/-1"><p>No available works in this series right now. Angela can paint something in the same spirit for you.</p>' + inquiry(null) + '</div>';
      tg.setAttribute('aria-expanded', String(state.archive));
      tg.textContent = state.archive ? 'Hide collected works' : 'Show collected works (' + s.length + ')';
      tg.hidden = !s.length;
      col.hidden = !(state.archive && s.length);
      cg.innerHTML = state.archive ? cards(s) : '';
    }
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      state.series = b.dataset.s;
      try { var u = new URL(location.href); if (state.series === 'all') u.searchParams.delete('series'); else u.searchParams.set('series', state.series); history.replaceState(null, '', u); } catch (err) {}
      render();
    });
    tg.addEventListener('click', function () { state.archive = !state.archive; render(); if (state.archive) col.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' }); });
    render();
    reveal();
  }

  /* ---------- painting detail ---------- */
  function detail() {
    var h = 'fire-horse';
    try { h = new URLSearchParams(location.search).get('h') || h; } catch (e) {}
    var p = by[h] || by['fire-horse'] || P[0];
    document.title = p.title + ' | Angela Fabbri | Fabbriology Fine Art';
    var n = p.images.length, idx = 0;
    var thumbs = n > 1 ? '<div class="thumbs" role="group" aria-label="More views">' + p.images.map(function (im, i) { return '<button type="button" data-i="' + i + '" aria-label="View image ' + (i + 1) + ' of ' + n + '"' + (i === 0 ? ' aria-current="true"' : '') + '><img src="' + imgAt(p, i, 200) + '" alt="" width="128" height="128" loading="lazy"></button>'; }).join('') + '</div>' : '';
    var msgs = '';
    if (p.repeated) msgs += '<div><dt>Repeated</dt><dd>“' + esc(p.repeated) + '”</dd></div>';
    if (p.hidden) msgs += '<div><dt>Hidden</dt><dd>“' + esc(p.hidden) + '”</dd></div>';
    if (p.message && !p.repeated) msgs += '<div><dt>Message</dt><dd>“' + esc(p.message) + '”</dd></div>';
    var sold = !p.available;
    var med = p.medium || 'Original painting';
    var meta = [med, sizeText(p)].filter(Boolean).join(' · ');
    var rel = P.filter(function (x) { return x.handle !== p.handle && p.series.length && x.series.indexOf(p.series[0]) > -1; });
    if (rel.length < 4) rel = rel.concat(P.filter(function (x) { return x.handle !== p.handle && rel.indexOf(x) < 0; }));
    rel.sort(function (a, b) { return b.available - a.available; });
    rel = rel.slice(0, 4);
    $('#detail').innerHTML =
      '<div class="d-media"><button type="button" class="d-frame' + (p.room ? ' room' : '') + '" id="open-lb" aria-label="Enlarge image of ' + esc(p.title) + '"><img id="d-img" src="' + imgAt(p, 0, 1200) + '" srcset="' + imgAt(p, 0, 800) + ' 800w, ' + imgAt(p, 0, 1200) + ' 1200w, ' + imgAt(p, 0, 1600) + ' 1600w" sizes="(min-width:1024px) 58vw, 92vw" alt="' + esc(alt(p)) + '" width="1200" height="1500" fetchpriority="high"></button>' + thumbs + '</div>' +
      '<div class="d-info"><p class="eyebrow">' + esc(mainSeries(p)) + '</p><h1>' + esc(p.title) + '</h1><p class="meta">' + esc(meta) + '</p>' +
      (msgs ? '<dl class="dl">' + msgs + '</dl>' : '<div style="height:24px"></div>') +
      '<p class="status">' + (sold ? '<span class="tag-sold">Sold</span>' : '<i class="dot" aria-hidden="true"></i>Available · Original, 1 of 1') + '</p>' +
      inquiry(p) +
      '<p class="trust">' + trustHTML(sold ? TRUST_COMM : TRUST_INFO) + '</p>' +
      (p.about ? '<div class="about-piece"><h2>About this piece</h2><p class="lede">' + esc(p.about) + '</p></div>' : '') +
      '<p class="cert">Certificate of authenticity included</p></div>';

    // lightbox
    var dlg = document.createElement('dialog');
    dlg.className = 'lb'; dlg.setAttribute('aria-label', 'Image viewer: ' + p.title);
    dlg.innerHTML = '<div class="lb-in"><button type="button" class="x" aria-label="Close viewer">✕</button>' + (n > 1 ? '<button type="button" class="pv" aria-label="Previous image">‹</button><button type="button" class="nx" aria-label="Next image">›</button>' : '') + '<img alt="' + esc(alt(p)) + '" src=""><div class="ct" aria-live="polite"></div></div>';
    document.body.appendChild(dlg);
    var lbImg = $('img', dlg), ct = $('.ct', dlg), opener = null;
    function show(i) { idx = (i + n) % n; lbImg.src = imgAt(p, idx, 1600); ct.textContent = n > 1 ? (idx + 1) + ' / ' + n : ''; $$('.thumbs button').forEach(function (b, k) { if (k === idx) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); }); $('#d-img').src = imgAt(p, idx, 1200); $('#d-img').srcset = ''; $('#open-lb').classList.toggle('room', !!p.room && idx === 0); }
    $$('.thumbs button').forEach(function (b) { b.addEventListener('click', function () { show(+b.dataset.i); }); });
    $('#open-lb').addEventListener('click', function (e) { opener = e.currentTarget; show(idx); dlg.showModal(); $('.x', dlg).focus(); });
    dlg.addEventListener('close', function () { if (opener) opener.focus(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    $('.x', dlg).addEventListener('click', function () { dlg.close(); });
    if (n > 1) {
      $('.pv', dlg).addEventListener('click', function () { show(idx - 1); });
      $('.nx', dlg).addEventListener('click', function () { show(idx + 1); });
      dlg.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
      var sx = null;
      dlg.addEventListener('pointerdown', function (e) { sx = e.clientX; });
      dlg.addEventListener('pointerup', function (e) { if (sx === null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); });
    }

    $('#related').innerHTML = cards(rel);
    $('#relatedTitle').textContent = p.series.length ? 'From the same series' : 'More from the collection';
    reveal();
  }

  /* ---------- boot ---------- */
  chrome();
  var page = document.body.dataset.page;
  if (page === 'home') home();
  if (page === 'paintings') paintings();
  if (page === 'detail') detail();
  if (page === 'home') reveal();
})();
