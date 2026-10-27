/* Option D "Studio Index": behaviour for every page. Vanilla JS, no modules, no fetch: works from file:// and GitHub Pages.
 * Loaded after data.js at the end of <body>. Page is chosen by <body data-page="home|paintings|painting|portfolio">.
 * Demo build: nothing is sent anywhere (D4). */
(function () {
  'use strict';

  var AF = window.AF || { series: [], paintings: [], portfolio: [] };
  var P = AF.paintings, SERIES = AF.series;
  var EMAIL = 'angela@fabbriology.com';
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var by = {}, seriesBy = {};
  P.forEach(function (p) { by[p.handle] = p; });
  SERIES.forEach(function (s) { seriesBy[s.key] = s; });

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n, w) { n = String(n); while (n.length < w) n = '0' + n; return n; }

  /* ---------- painting helpers ---------- */
  function figText(p) { return 'Fig. ' + pad(p.fig, 3); }
  function sizeText(p) { return p.w && p.h ? p.w + ' × ' + p.h + ' in' : (p.diameter ? p.diameter + ' in diameter' : ''); }
  function cmText(p) {
    if (p.w && p.h) return Math.round(p.w * 2.54) + ' × ' + Math.round(p.h * 2.54) + ' cm';
    if (p.diameter) return Math.round(p.diameter * 2.54) + ' cm diameter';
    return '';
  }
  function shortMedium(m) { if (!m) return ''; return m.length > 48 && m.indexOf(',') > 0 ? m.slice(0, m.indexOf(',')) : m; }
  function primaryKey(p) {
    for (var i = 0; i < p.series.length; i++) { var s = seriesBy[p.series[i]]; if (s && s.primary) return s.key; }
    return p.series[0] || '';
  }
  function seriesLabel(key) { return seriesBy[key] ? seriesBy[key].label : ''; }
  function mainSeries(p) { var k = primaryKey(p); return k ? seriesLabel(k) : 'Original painting'; }
  function imgAt(p, i, w) { var im = p.images[i] || p.images[0]; return im.a.replace('width=800', 'width=' + w); }
  function alt(p) { return p.title + ', ' + [shortMedium(p.medium), sizeText(p)].filter(Boolean).join(', ') + ', by Angela Fabbri'; }
  function href(p) { return 'painting.html?handle=' + encodeURIComponent(p.handle); }
  function availableCount() { return P.filter(function (p) { return p.available; }).length; }
  function qs(name) { try { return new URLSearchParams(location.search).get(name); } catch (e) { return null; } }
  function setQS(name, value) {
    try { var u = new URL(location.href); if (value == null || value === '') u.searchParams.delete(name); else u.searchParams.set(name, value); history.replaceState(null, '', u); } catch (e) {}
  }
  function ordered(list) { return list.filter(function (p) { return p.available; }).concat(list.filter(function (p) { return !p.available; })); }
  function seriesPaintings(key) { return ordered(seriesBy[key].handles.map(function (h) { return by[h]; }).filter(Boolean)); }
  function two(n) { return pad(n, 2); }

  /* ---------- rolling label (Isembard button hover) ---------- */
  function rollHTML(t) { return '<span class="roll"><span>' + esc(t) + '</span><span aria-hidden="true">' + esc(t) + '</span></span>'; }
  function setLabel(btn, t) { btn.innerHTML = rollHTML(t); }
  function enhance(root) {
    $$('.btn', root).forEach(function (b) {
      if (b.querySelector('.roll') || b.dataset.noroll != null) return;
      setLabel(b, b.textContent.replace(/\s+/g, ' ').trim());
    });
  }

  /* ---------- theme: System / Light / Dark ---------- */
  function initTheme() {
    var radios = $$('input[data-theme-radio]');
    var stored = 'system';
    try { stored = localStorage.getItem('afd-theme') || 'system'; } catch (e) {}
    var param = qs('theme'); // ?theme=dark|light previews a theme without saving it
    if (param === 'dark' || param === 'light') stored = param;
    function sync(v) { radios.forEach(function (r) { r.checked = r.value === v; }); }
    sync(stored);
    radios.forEach(function (r) {
      r.addEventListener('change', function () {
        if (!r.checked) return;
        var v = r.value;
        if (v === 'system') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', v);
        try { localStorage.setItem('afd-theme', v); } catch (e) {}
        sync(v); // the panel and footer groups have different names, so keep them in step by hand
      });
    });
  }

  /* ---------- "+" panel (disclosure, not a modal) ---------- */
  function initMenu() {
    var btn = $('#menuBtn'), menu = $('#menu');
    if (!btn || !menu) return;
    function close(ret) { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.textContent = '+'; if (ret) btn.focus(); }
    function open() { menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); btn.textContent = '×'; }
    btn.addEventListener('click', function () { if (menu.hidden) open(); else close(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { close(menu.contains(document.activeElement) || document.activeElement === btn); }
    });
    document.addEventListener('click', function (e) {
      if (!menu.hidden && !menu.contains(e.target) && e.target !== btn) close(false);
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { close(false); }); });
  }

  /* ---------- copy pill: never claim COPIED unless it worked ---------- */
  function initCopy() {
    var b = $('#copyMail'), addr = $('#mailAddr');
    if (!b || !addr) return;
    var timer;
    function label(t) { b.textContent = t; clearTimeout(timer); timer = setTimeout(function () { b.textContent = 'Copy'; }, 2000); }
    function select() {
      try { var r = document.createRange(); r.selectNodeContents(addr); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {}
    }
    function fallback() {
      select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      label(ok ? 'Copied' : 'Select + copy');
    }
    b.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(EMAIL).then(function () { label('Copied'); }, fallback);
      } else fallback();
    });
  }

  /* ---------- scroll reveal fallback (the CSS view() timeline handles modern browsers) ---------- */
  function reveal() {
    var native = window.CSS && CSS.supports && CSS.supports('animation-timeline', 'view()');
    if (reduce || native || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').forEach(function (el) { el.classList.add('will-reveal'); io.observe(el); });
  }

  /* ---------- inline inquiry dropdown (D4, D9) ---------- */
  var uid = 0, current = null, REG = {};
  var TRUST_INFO = ['Price on request', 'Original, 1 of 1', 'Certificate of authenticity included', 'Reply within 1 business day'];
  var TRUST_COMM = ['Sized and colored to your space', 'Reply within 1 business day'];
  var PH = { info: 'Anything you’d like to know, such as shipping or framing', commission: 'Size, colors, the room, or a message you’d like hidden in it' };

  // inquiry(p, o): HTML for a trigger button plus its hidden dropdown.
  //   p = painting (available -> "Request info"; sold -> D9 commission mode) or null (general commission).
  //   o.label overrides the label for available works and for null-p buttons; sold works always read "Sold · Submit commission inquiry".
  function inquiry(p, o) {
    o = o || {};
    var kind = (!p || !p.available) ? 'commission' : 'info';
    var id = 'inq-' + (p ? p.handle : 'general') + '-' + (++uid);
    var label, sent;
    if (p && !p.available) { label = 'Sold · Submit commission inquiry'; sent = 'Sold · Commission inquiry sent ✓'; }
    else if (!p) { label = o.label || 'Commission a piece'; sent = 'Commission inquiry sent ✓'; }
    else { label = o.label || 'Request info'; sent = 'Request sent ✓'; }
    REG[id] = { p: p, kind: kind, label: label, sent: sent };
    var cls = 'btn inq-btn ' + (o.cls || (kind === 'commission' && p ? 'btn-secondary' : 'btn-primary')) + ' btn-block';
    return '<div class="inq-wrap">' +
      '<button type="button" class="' + cls + '" aria-expanded="false" aria-controls="' + id + '">' + rollHTML(label) + '</button>' +
      '<div id="' + id + '" class="inq" role="region" aria-label="' + esc(p ? 'Inquiry about ' + p.title : 'Commission inquiry') + '" hidden></div>' +
      '</div>';
  }

  function build(panel) {
    var r = REG[panel.id], p = r.p, id = panel.id, commission = r.kind === 'commission';
    var chip, ref;
    if (!p) { chip = 'About: A new commission'; ref = 'Commission inquiry'; }
    else if (commission) { chip = 'Commission · inspired by ' + p.title; ref = 'Commission inquiry inspired by ' + p.title; }
    else { chip = 'About: ' + p.title + (sizeText(p) ? ' · ' + sizeText(p) : ''); ref = 'Request info about ' + p.title; }
    var trust = (commission ? TRUST_COMM : TRUST_INFO).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');
    panel.innerHTML =
      '<div class="inq-in"><div class="inq-card' + (commission ? ' commission' : '') + '">' +
      '<p class="inq-chip">' + esc(chip) + '</p>' +
      '<form class="inq-form" novalidate>' +
      '<input type="hidden" name="reference" value="' + esc(ref) + '">' +
      '<div class="field"><label for="' + id + '-n">Name</label><input id="' + id + '-n" name="name" type="text" autocomplete="name" aria-describedby="' + id + '-ne"><p class="err" id="' + id + '-ne" hidden></p></div>' +
      '<div class="field"><label for="' + id + '-e">Email</label><input id="' + id + '-e" name="email" type="email" inputmode="email" autocomplete="email" aria-describedby="' + id + '-ee"><p class="err" id="' + id + '-ee" hidden></p></div>' +
      '<div class="field"><label for="' + id + '-m">Note (optional)</label><textarea id="' + id + '-m" name="note" rows="3" placeholder="' + esc(PH[commission ? 'commission' : 'info']) + '"></textarea></div>' +
      '<div class="inq-actions"><button type="submit" class="btn btn-primary">Send</button><button type="button" class="btn btn-ghost inq-cancel">Cancel</button></div>' +
      '<p class="trust">' + trust + '</p>' +
      '</form></div></div>';
    enhance(panel);
    panel.dataset.built = '1';
  }

  function openInq(btn) {
    if (current && current !== btn) closeInq(current, false);
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel.dataset.built) build(panel);
    clearTimeout(panel._t);
    panel.hidden = false;
    void panel.offsetHeight; // paint the collapsed state first so the grid-rows transition runs
    panel.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    current = btn;
    var target = $('input[name="name"]', panel) || $('.inq-done', panel);
    if (target) target.focus({ preventScroll: true });
    setTimeout(function () {
      if (current === btn) panel.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    }, reduce ? 0 : 260);
  }

  // Never waits on transitionend: reduced motion hides at once, otherwise a 300ms timer re-hides (must-fix 6).
  function closeInq(btn, returnFocus) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    panel.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    clearTimeout(panel._t);
    if (reduce) panel.hidden = true;
    else panel._t = setTimeout(function () { if (!panel.classList.contains('open')) panel.hidden = true; }, 300);
    if (current === btn) current = null;
    if (returnFocus) btn.focus();
  }

  function err(input, msg) {
    var e = document.getElementById(input.getAttribute('aria-describedby'));
    if (msg) { input.setAttribute('aria-invalid', 'true'); e.textContent = msg; e.hidden = false; }
    else { input.removeAttribute('aria-invalid'); e.textContent = ''; e.hidden = true; }
  }

  function submitInq(form) {
    var name = form.elements.name, email = form.elements.email, first = null;
    err(name, ''); err(email, '');
    if (!name.value.trim()) { err(name, 'Please add your name'); first = first || name; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { err(email, 'Please enter a valid email'); first = first || email; }
    if (first) { first.focus(); return; }
    var panel = form.closest('.inq'), r = REG[panel.id];
    var btn = $('.inq-btn', panel.parentNode);
    var send = $('button[type="submit"]', form);
    send.disabled = true;
    // Demo: no network call is made.
    var done = function () {
      var card = $('.inq-card', panel);
      card.innerHTML = '<div class="inq-done" role="status" tabindex="-1">' +
        '<p class="ok">' + (r.kind === 'commission' ? 'Commission inquiry sent to ' : 'Sent to ') + EMAIL + '</p>' +
        '<p>Angela replies personally, usually within 1 business day.</p>' +
        '<a class="arrow-link" href="mailto:' + EMAIL + '?subject=Get%20notified%20of%20new%20works">Get notified of new works</a></div>';
      setLabel(btn, r.sent);
      $('.inq-done', card).focus({ preventScroll: true });
    };
    if (reduce) done(); else setTimeout(done, 450);
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : e.target.parentNode;
    var btn = t.closest('.inq-btn');
    if (btn) { if (btn.getAttribute('aria-expanded') === 'true') closeInq(btn, true); else openInq(btn); return; }
    var cancel = t.closest('.inq-cancel');
    if (cancel) closeInq($('.inq-btn', cancel.closest('.inq-wrap')), true);
  });
  document.addEventListener('submit', function (e) {
    if (e.target.classList.contains('inq-form')) { e.preventDefault(); submitInq(e.target); }
  });
  document.addEventListener('input', function (e) {
    if (e.target.getAttribute && e.target.getAttribute('aria-invalid') === 'true') err(e.target, '');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !current || $('dialog[open]') || ($('#menu') && !$('#menu').hidden)) return;
    var btn = current, ret = btn.closest('.inq-wrap').contains(document.activeElement);
    closeInq(btn, ret);
  });

  /* ---------- painting cards ---------- */
  function statusPill(p) { return p.available ? '<span class="st st-av">Available</span>' : '<span class="st st-sold">Sold</span>'; }
  function card(p, o) {
    o = o || {};
    var h = o.hl || 'h3', u = href(p);
    return '<article class="card' + (p.available ? '' : ' card--sold') + '">' +
      '<a class="card-media' + (p.room ? ' room' : '') + '" href="' + u + '" tabindex="-1" aria-hidden="true"><img src="' + imgAt(p, 0, 800) + '" srcset="' + imgAt(p, 0, 800) + ' 800w, ' + imgAt(p, 0, 1200) + ' 1200w" sizes="(min-width:1100px) 22vw, (min-width:640px) 44vw, 92vw" alt="' + esc(alt(p)) + '" width="800" height="1000"' + (o.eager ? ' fetchpriority="low"' : ' loading="lazy"') + ' decoding="async"></a>' +
      '<div class="card-body">' +
      '<div class="card-top"><span class="fig micro">' + esc(figText(p)) + '</span>' + statusPill(p) + '</div>' +
      '<' + h + ' class="card-title"><a href="' + u + '">' + esc(p.title) + '</a></' + h + '>' +
      '<dl class="spec-mini"><div class="s-series"><dt>Series</dt><dd>' + esc(mainSeries(p)) + '</dd></div><div class="s-medium"><dt>Medium</dt><dd>' + esc(shortMedium(p.medium) || '—') + '</dd></div><div class="s-size"><dt>Size</dt><dd>' + esc(sizeText(p) || '—') + '</dd></div></dl>' +
      inquiry(p) + '</div></article>';
  }
  function cards(list, o) { o = o || {}; return list.map(function (p, i) { return card(p, { hl: o.hl, eager: o.eager && i < o.eager }); }).join(''); }

  /* ---------- carousel with counter ---------- */
  function carousel(car, prev, next, counter) {
    var items = $$(':scope > *', car), last = -1;
    function idx() {
      var l = car.scrollLeft, i;
      if (l + car.clientWidth >= car.scrollWidth - 4) return items.length - 1;
      for (i = 0; i < items.length; i++) if (items[i].offsetLeft + items[i].offsetWidth * 0.5 > l) return i;
      return 0;
    }
    function update() {
      var i = idx();
      prev.disabled = car.scrollLeft <= 2;
      next.disabled = car.scrollLeft + car.clientWidth >= car.scrollWidth - 4;
      if (i !== last) { counter.textContent = two(i + 1) + ' / ' + two(items.length); last = i; }
    }
    function step(dir) {
      var w = items[0] ? items[0].offsetWidth + 16 : 300;
      car.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });
    var raf;
    car.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- lightbox (images only, no forms: D4) ---------- */
  function lightbox(items, start, opener, o) {
    o = o || {};
    var n = items.length, idx = 0;
    var dlg = document.createElement('dialog');
    dlg.className = 'lb';
    dlg.setAttribute('aria-label', o.label || 'Image viewer');
    dlg.innerHTML = '<div class="lb-in"><button type="button" class="lb-btn lb-x" aria-label="Close viewer">✕</button>' +
      (n > 1 ? '<button type="button" class="lb-btn lb-pv" aria-label="Previous image">‹</button><button type="button" class="lb-btn lb-nx" aria-label="Next image">›</button>' : '') +
      '<div class="lb-fig"><img alt="" src=""></div>' +
      '<div class="lb-foot"><p class="micro lb-cap" aria-live="polite"></p>' + (o.mirrored ? '<span class="mirror-chip" style="position:static">Mirrored view</span>' : '') + '<span class="micro lb-ct"></span></div></div>';
    document.body.appendChild(dlg);
    var img = $('img', dlg), cap = $('.lb-cap', dlg), ct = $('.lb-ct', dlg);
    function show(i) {
      idx = (i + n) % n;
      var it = items[idx];
      img.src = it.src; img.alt = it.alt || '';
      img.classList.toggle('flipped', !!o.mirrored);
      cap.textContent = it.caption || '';
      ct.textContent = n > 1 ? two(idx + 1) + ' / ' + two(n) : '';
    }
    $('.lb-x', dlg).addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.classList.contains('lb-in') || e.target.classList.contains('lb-fig')) dlg.close(); });
    dlg.addEventListener('close', function () { if (dlg.parentNode) dlg.parentNode.removeChild(dlg); if (opener && opener.focus) opener.focus(); });
    if (n > 1) {
      $('.lb-pv', dlg).addEventListener('click', function () { show(idx - 1); });
      $('.lb-nx', dlg).addEventListener('click', function () { show(idx + 1); });
      dlg.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
    }
    show(start || 0);
    dlg.showModal();
    $('.lb-x', dlg).focus();
  }

  /* ---------- HOME ---------- */
  function home() {
    var feat = by['prickly-delight'];
    var fc = $('#featCard');
    if (feat && fc) {
      fc.innerHTML = '<div class="feat">' +
        '<div class="feat-top"><a class="feat-thumb" href="' + href(feat) + '" tabindex="-1" aria-hidden="true"><img src="' + imgAt(feat, 0, 400) + '" srcset="' + imgAt(feat, 0, 400) + ' 400w, ' + imgAt(feat, 0, 800) + ' 800w" sizes="120px" alt="' + esc(alt(feat)) + '" width="240" height="300"></a>' +
        '<div class="feat-text"><div class="feat-line"><span class="micro">Featured · ' + esc(figText(feat)) + '</span>' + statusPill(feat) + '</div>' +
        '<h2 class="feat-title"><a href="' + href(feat) + '">' + esc(feat.title) + '</a></h2>' +
        '<p class="feat-spec">' + esc(mainSeries(feat)) + ' · ' + esc(shortMedium(feat.medium)) + ' · ' + esc(sizeText(feat)) + '</p></div></div>' +
        inquiry(feat) + '</div>';
    }
    var AV = ['country-games-green', 'water-me-silver-22', 'this-is-my-good-side-original-painting', 'i-dont-understand-you-either-original-painting-1', 'black-bird', 'giraffe', 'saguaro-cactus-ten-by-ten-collection', 'water-me-pink-22-copy'].map(function (h) { return by[h]; }).filter(Boolean);
    var avail = availableCount(), sold = P.length - avail;
    $('#availGrid').innerHTML = cards(AV, { hl: 'h4' });
    $('#availCount').textContent = two(AV.length) + ' / ' + avail;
    $$('.n-avail').forEach(function (el) { el.textContent = avail; });
    $('#seeAll').textContent = 'See all ' + avail + ' available paintings';

    var SD = ['live-luxuriously-copy-copy', 'black-tie-affair-copy', 'kiss-me-like-you-need-me', 'i-dont-understand-you-either-green'].map(function (h) { return by[h]; }).filter(Boolean);
    $('#soldGrid').innerHTML = cards(SD, { hl: 'h4' });
    $('#soldCount').textContent = two(SD.length) + ' / ' + sold;

    $('#commBox').innerHTML = inquiry(null);

    var av = P.filter(function (p) { return p.available && p.w && p.h; });
    var lo = Math.min.apply(null, av.map(function (p) { return Math.min(p.w, p.h); }));
    var hi = Math.max.apply(null, av.map(function (p) { return Math.max(p.w, p.h); }));
    $('#tradeRange').textContent = 'Ready-to-ship originals from ' + lo + ' × ' + lo + ' in to ' + hi + ' × ' + hi + ' in.';

    reader();
    var cq = $('#quotes');
    carousel(cq, $('#qPrev'), $('#qNext'), $('#qCount'));
    enhance(document);
  }

  /* Inversion Reader: product-UI explainer with a mirror toggle on Ape In */
  function reader() {
    var p = by['ape-in-original-painting'];
    if (!p) return;
    var img = $('#rdImg'), chip = $('#rdChip'), note = $('#rdNote');
    img.src = imgAt(p, 0, 1200);
    img.srcset = imgAt(p, 0, 800) + ' 800w, ' + imgAt(p, 0, 1200) + ' 1200w';
    img.alt = alt(p);
    $('#rdBar').textContent = 'Inversion Reader · ' + figText(p) + ' · ' + p.title;
    $('#rdRep').textContent = p.repeated || '—';
    $('#rdStatus').textContent = p.available ? 'Available' : 'Sold';
    $('#rdInq').innerHTML = inquiry(p);
    var hidden = p.hidden;
    var rv = $('#rdReveal');
    if (hidden) {
      rv.addEventListener('click', function () {
        var dd = rv.parentNode;
        dd.innerHTML = '<span class="n" aria-hidden="true">→</span>' + esc(hidden);
        dd.setAttribute('role', 'status');
      });
    } else rv.parentNode.textContent = '—';
    var btns = $$('#rdTog button');
    function set(on) {
      img.classList.toggle('flipped', on);
      chip.hidden = !on;
      btns[0].setAttribute('aria-pressed', String(!on));
      btns[1].setAttribute('aria-pressed', String(on));
      note.textContent = on ? 'Mirrored: the lettering now reads left to right.' : 'Original: the lettering is written backwards, as painted.';
    }
    btns[0].addEventListener('click', function () { set(false); });
    btns[1].addEventListener('click', function () { set(true); });
    window.addEventListener('pageshow', function (e) { if (e.persisted) set(false); });
    set(false);
  }

  /* ---------- PAINTINGS ---------- */
  function paintingsPage() {
    var primary = SERIES.filter(function (s) { return s.primary; });
    var avail = availableCount(), sold = P.length - avail;
    var state = { series: '', view: 'grid', collected: false };
    var sk = qs('series');
    if (sk && seriesBy[sk] && seriesBy[sk].primary) state.series = sk;
    if (qs('view') === 'index') state.view = 'index';
    if (location.hash === '#collected') state.collected = true;

    $('#totalCount').textContent = avail + ' available · ' + sold + ' collected';
    var SHORT = { 'abstracts-with-attitude': 'AWA' };
    var fp = $('#filters');
    fp.innerHTML = '<button type="button" class="fpill" data-k="" aria-pressed="false">All <span class="c">' + avail + '</span></button>' +
      primary.map(function (s) { return '<button type="button" class="fpill" data-k="' + s.key + '" aria-pressed="false"' + (SHORT[s.key] ? ' title="' + esc(s.label) + '"' : '') + '>' + esc(SHORT[s.key] || s.label) + ' <span class="c">' + s.available + '</span></button>'; }).join('');
    var sw = $('#swCollected'), gA = $('#gridAvail'), gC = $('#gridSold'), secC = $('#collected');

    function list() {
      var l = state.series ? seriesPaintings(state.series) : ordered(P);
      return { a: l.filter(function (p) { return p.available; }), s: l.filter(function (p) { return !p.available; }) };
    }
    function render() {
      if (current) closeInq(current, false);
      var l = list();
      $$('.fpill', fp).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === state.series)); });
      gA.innerHTML = l.a.length ? cards(l.a, { hl: 'h3', eager: 4 }) : '';
      $('#emptyAvail').hidden = !!l.a.length;
      $('#availHead').textContent = l.a.length + ' available';
      $('#swLabel').textContent = 'Show ' + l.s.length + ' collected works';
      sw.setAttribute('aria-checked', String(state.collected));
      secC.hidden = !state.collected;
      if (state.collected) { gC.innerHTML = cards(l.s, { hl: 'h3' }); $('#soldHead').textContent = l.s.length + ' collected'; } else gC.innerHTML = '';
      [gA, gC].forEach(function (g) { g.classList.toggle('is-index', state.view === 'index'); });
      $$('#viewTog button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.v === state.view)); });
      enhance(document);
    }
    fp.addEventListener('click', function (e) {
      var b = e.target.closest('.fpill'); if (!b) return;
      state.series = b.dataset.k; setQS('series', state.series); render();
    });
    $('#viewTog').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      state.view = b.dataset.v; setQS('view', state.view === 'index' ? 'index' : ''); render();
    });
    sw.addEventListener('click', function () { state.collected = !state.collected; render(); });
    render();
    if (state.collected && location.hash === '#collected') setTimeout(function () { secC.scrollIntoView(); }, 60);
    window.addEventListener('hashchange', function () { if (location.hash === '#collected') { state.collected = true; render(); secC.scrollIntoView(); } });
  }

  /* ---------- DETAIL ---------- */
  function detailPage() {
    var handle = qs('handle') || 'ape-in-original-painting';
    var p = by[handle], main = $('#main');
    if (!p) {
      document.title = 'Painting not found | Angela Fabbri';
      main.innerHTML = '<div class="wrap nf"><p class="micro muted">01 Work / Not found</p><h1 class="h-hero" style="margin-top:20px">Painting not found</h1><p>We could not find “' + esc(handle) + '” in the index.</p><a class="btn btn-primary" href="paintings.html">Back to all paintings</a></div>';
      enhance(document);
      return;
    }
    document.title = p.title + ' | ' + figText(p) + ' | Angela Fabbri';
    var pos = P.indexOf(p), prev = P[(pos - 1 + P.length) % P.length], next = P[(pos + 1) % P.length];
    var pk = primaryKey(p), isInv = p.series.indexOf('inversion') > -1;
    var imgs = p.images, cur = 0, mirrored = false;

    $('#crumb').innerHTML = '<span class="micro">01 Work / ' + (pk ? '<a href="paintings.html?series=' + pk + '">' + esc(seriesLabel(pk)) + '</a>' : 'Original') + ' / ' + esc(figText(p)) + ' / ' + P.length + '</span>' +
      '<span class="crumb-nav"><a class="pill" href="' + href(prev) + '" aria-label="Previous painting: ' + esc(prev.title) + '">← Prev</a><a class="pill" href="' + href(next) + '" aria-label="Next painting: ' + esc(next.title) + '">Next →</a></span>';

    var stage = $('#stage');
    stage.classList.toggle('room', !!p.room);
    stage.innerHTML = '<button type="button" class="stage-btn" id="stageBtn" aria-label="Open larger image of ' + esc(p.title) + '"><img class="stage-img" id="stageImg" src="' + imgAt(p, 0, 1200) + '" srcset="' + imgAt(p, 0, 800) + ' 800w, ' + imgAt(p, 0, 1600) + ' 1600w" sizes="(min-width:1024px) 58vw, 92vw" alt="' + esc(alt(p)) + '" width="1200" height="1500" fetchpriority="high" decoding="async"></button><span class="mirror-chip" id="stageChip" hidden>Mirrored view</span>';
    var simg = $('#stageImg'), chip = $('#stageChip');
    var tools = '';
    if (imgs.length > 1) tools += '<div class="thumbs" role="group" aria-label="Images of ' + esc(p.title) + '">' + imgs.map(function (im, i) { return '<button type="button" data-i="' + i + '" aria-label="Show image ' + (i + 1) + ' of ' + imgs.length + '"' + (i === 0 ? ' aria-current="true"' : '') + '><img src="' + im.a.replace('width=800', 'width=200') + '" alt="" width="64" height="64" loading="lazy"></button>'; }).join('') + '</div>';
    tools += '<span class="micro muted" id="imgCount">' + (imgs.length > 1 ? '01 / ' + two(imgs.length) : '') + '</span>';
    if (isInv) tools += '<div class="tog" id="dTog" role="group" aria-label="Lettering view"><button type="button" aria-pressed="true">Original</button><button type="button" aria-pressed="false">Mirrored</button></div>';
    $('#stageTools').innerHTML = tools;

    function setMirror(on) {
      mirrored = on;
      simg.classList.toggle('flipped', on);
      chip.hidden = !on;
      var b = $$('#dTog button'); if (b.length) { b[0].setAttribute('aria-pressed', String(!on)); b[1].setAttribute('aria-pressed', String(on)); }
    }
    function showImg(i) {
      cur = i;
      simg.src = imgAt(p, i, 1200);
      simg.srcset = imgAt(p, i, 800) + ' 800w, ' + imgAt(p, i, 1600) + ' 1600w';
      stage.classList.toggle('room', !!(p.room && i === 0));
      $$('#stageTools .thumbs button').forEach(function (b) { b.setAttribute('aria-current', String(+b.dataset.i === i)); });
      $('#imgCount').textContent = imgs.length > 1 ? two(i + 1) + ' / ' + two(imgs.length) : '';
      setMirror(false); // a flipped image never carries over to another view
    }
    $('#stageTools').addEventListener('click', function (e) {
      var tb = e.target.closest('.thumbs button'); if (tb) { showImg(+tb.dataset.i); return; }
      var mb = e.target.closest('#dTog button'); if (mb) setMirror(mb === $$('#dTog button')[1]);
    });
    $('#stageBtn').addEventListener('click', function (e) {
      lightbox(imgs.map(function (im, i) { return { src: im.b, alt: alt(p), caption: p.title + ' · ' + (i + 1) + ' of ' + imgs.length }; }), cur, e.currentTarget, { label: p.title + ', larger view', mirrored: mirrored });
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) setMirror(false); });

    var rows = [['Series', mainSeries(p)], ['Medium', p.medium || '—'], ['Size', sizeText(p) ? sizeText(p) + ' · ' + cmText(p) : 'Size on request']];
    var rep = p.repeated || p.message;
    var html = '<div class="head-line"><span class="micro muted">' + esc(figText(p)) + '</span>' + statusPill(p) + '</div>' +
      '<h1 class="h-head">' + esc(p.title) + '</h1>' +
      '<dl class="spec">' + rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') +
      (rep ? '<div><dt>Repeated message</dt><dd class="m">' + esc(rep) + '</dd></div>' : '') +
      (p.hidden ? '<div><dt>Hidden message</dt><dd class="m" id="hidDD"><span class="rv-mask" aria-hidden="true">••••••</span><button type="button" class="reveal-btn" id="hidBtn">Reveal</button></dd></div>' : '') +
      '<div><dt>Edition</dt><dd>Original, 1 of 1</dd></div><div><dt>Certificate</dt><dd>Included</dd></div></dl>' +
      inquiry(p) +
      (p.about ? '<div class="about"><h2 class="micro muted">About this painting</h2><p>' + esc(p.about) + '</p></div>' : '') +
      (isInv ? '<p class="how">How to read it: Inversion paintings are written backwards, starting at the top right. Press “Mirrored” to read the lettering left to right.</p>' : '');
    $('#panel').innerHTML = html;
    var hb = $('#hidBtn');
    if (hb) hb.addEventListener('click', function () { var dd = $('#hidDD'); dd.innerHTML = esc(p.hidden); dd.setAttribute('role', 'status'); });

    // Related carousel
    var rel = pk ? seriesPaintings(pk).filter(function (x) { return x.handle !== p.handle; }) : [];
    if (rel.length < 4) ordered(P).forEach(function (x) { if (rel.length < 8 && x.handle !== p.handle && rel.indexOf(x) < 0 && x.available) rel.push(x); });
    rel = rel.slice(0, 8);
    $('#relTitle').textContent = pk ? 'More from ' + seriesLabel(pk) : 'More originals';
    var car = $('#relCar');
    car.innerHTML = cards(rel, { hl: 'h3' });
    carousel(car, $('#relPrev'), $('#relNext'), $('#relCount'));
    enhance(document);
  }

  /* ---------- PORTFOLIO stub ---------- */
  function portfolioPage() {
    $('#pfGrid').innerHTML = (AF.portfolio || []).map(function (w) {
      var inner = '<div class="pm"><img src="' + esc(w.image) + '" alt="' + esc(w.title + (w.size ? ', ' + w.size : '') + ', by Angela Fabbri') + '" width="800" height="1000" loading="lazy" decoding="async"></div>' +
        '<span class="micro">' + esc([w.size, w.medium].filter(Boolean).join(' · ') + (w.handle ? '' : ' · title provisional')) + '</span><b>' + esc(w.title) + '</b>';
      return '<li>' + (w.handle ? '<a class="pf-item" href="painting.html?handle=' + encodeURIComponent(w.handle) + '">' + inner + '</a>' : '<div class="pf-item">' + inner + '</div>') + '</li>';
    }).join('');
    var av = P.filter(function (p) { return p.available && p.w && p.h; });
    var lo = Math.min.apply(null, av.map(function (p) { return Math.min(p.w, p.h); }));
    var hi = Math.max.apply(null, av.map(function (p) { return Math.max(p.w, p.h); }));
    var r = $('#tradeRange'); if (r) r.textContent = 'Ready-to-ship originals from ' + lo + ' × ' + lo + ' in to ' + hi + ' × ' + hi + ' in.';
  }

  /* ---------- init ---------- */
  initTheme();
  initMenu();
  initCopy();
  var page = document.body.dataset.page;
  if (page === 'home') home();
  else if (page === 'paintings') paintingsPage();
  else if (page === 'painting') detailPage();
  else if (page === 'portfolio') portfolioPage();
  enhance(document);
  reveal();
  window.AFD = { inquiry: inquiry, card: card, by: by };
})();
