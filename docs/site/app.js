/* Shared behaviour for every page. Vanilla JS, no modules, no fetch: works from file:// and GitHub Pages.
 * Loaded after data.js and components.js. Everything public is exposed on window.AF (data + functions) and aliased on window.AFC.
 * Page scripts load after this file (defer, in order) and call e.g. AF.inquiry(p), AF.card(p,{from}), AF.lightbox(items,0,opener).
 * Public API (see the table at the bottom of this file):
 *   helpers      esc sizeText shortMedium metaText alt imgAt by mainSeries merchAlt
 *   data helpers seriesBy seriesLabel validSeries seriesPaintings related catBy itemBy itemsInCat availableCount isPainting isItem paintingHref
 *   components   inquiry inlineForm openInq closeInq current card cards merchCard merchCards lightbox
 *   utilities    qs setQS ready reveal reduce trustHTML K (constants) tradeBandHTML
 */
(function () {
  'use strict';

  var AF = window.AF = window.AF || { series: [], paintings: [], shop: { cats: [], items: [] } };
  var AFC = window.AFC = window.AFC || {};
  var K = AFC.K || { EMAIL: 'angela@fabbriology.com', CDN: 'https://angelafabbri.com/cdn/shop/files/', PDF: '' };
  var EMAIL = K.EMAIL;
  var P = AF.paintings, SERIES = AF.series, SHOP = AF.shop;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var by = {}, shopBy = {}, seriesBy = {}, catBy = {};
  P.forEach(function (p) { by[p.handle] = p; });
  SHOP.items.forEach(function (i) { shopBy[i.handle] = i; });
  SERIES.forEach(function (s) { seriesBy[s.key] = s; });
  SHOP.cats.forEach(function (c) { catBy[c.key] = c; });

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ---------- painting helpers ---------- */
  function sizeText(p) { return p.w && p.h ? p.w + ' × ' + p.h + ' in' : (p.diameter ? p.diameter + ' in diameter' : ''); }
  function shortMedium(m) { if (!m) return ''; return m.length > 48 && m.indexOf(',') > 0 ? m.slice(0, m.indexOf(',')) : m; }
  function metaText(p) { return [shortMedium(p.medium), sizeText(p)].filter(Boolean).join(' · ') || 'Original painting'; }
  function seriesLabel(key) { return seriesBy[key] ? seriesBy[key].label : ''; }
  function mainSeries(p) { return p.series && p.series.length ? seriesLabel(p.series[0]) : 'Original painting'; }
  function imgAt(p, i, w) { var im = p.images[i] || p.images[0]; return im.a.replace('width=800', 'width=' + w); }
  function alt(p) { return p.title + ', ' + [shortMedium(p.medium), sizeText(p)].filter(Boolean).join(', ') + ', by Angela Fabbri'; }
  function merchAlt(i) { return i.title + ', Fabbriology shop'; }
  function availableCount() { return P.filter(function (p) { return p.available; }).length; }
  function isPainting(h) { return !!by[h]; }
  function isItem(h) { return !!shopBy[h]; }
  function paintingHref(p, from) { return 'painting.html?handle=' + encodeURIComponent(p.handle) + (from ? '&from=' + encodeURIComponent(from) : ''); }

  /* ---------- series / shop helpers ---------- */
  function validSeries(key) { return !!(key && seriesBy[key]); }
  // Paintings of one series in collection order, available first (stable). Pass nothing for all paintings in data order.
  function seriesPaintings(key) {
    var list = key && seriesBy[key] ? seriesBy[key].handles.map(function (h) { return by[h]; }).filter(Boolean) : P.slice();
    return list.filter(function (p) { return p.available; }).concat(list.filter(function (p) { return !p.available; }));
  }
  // "Also available": n available works from the `from` series (else the painting's first series), padded from other available works.
  function related(p, from, n) {
    n = n || 4;
    var key = validSeries(from) ? from : (p.series[0] || '');
    var out = key ? seriesPaintings(key).filter(function (x) { return x.available && x.handle !== p.handle; }) : [];
    out = out.slice(0, n);
    if (out.length < n) {
      P.forEach(function (x) { if (out.length < n && x.available && x.handle !== p.handle && out.indexOf(x) < 0) out.push(x); });
    }
    return out;
  }
  // Items of one shop category, available first (stable).
  function itemsInCat(key) {
    var list = SHOP.items.filter(function (i) { return i.cats.indexOf(key) > -1; });
    return list.filter(function (i) { return i.available; }).concat(list.filter(function (i) { return !i.available; }));
  }

  /* ---------- utilities ---------- */
  function qs(name) { try { return new URLSearchParams(location.search).get(name); } catch (e) { return null; } }
  // Sets (or with null deletes) a query parameter without reloading.
  function setQS(name, value) {
    try {
      var u = new URL(location.href);
      if (value == null || value === '') u.searchParams.delete(name); else u.searchParams.set(name, value);
      history.replaceState(null, '', u);
    } catch (e) {}
  }
  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  function reveal(root) {
    if (reduce || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    $$('.reveal:not(.will-reveal)', root).forEach(function (el) { el.classList.add('will-reveal'); io.observe(el); });
  }

  /* ---------- the inline inquiry component (D4, D9) ---------- */
  var uid = 0, current = null, REG = {};
  var TRUST_INFO = 'Original, 1 of 1 · Certificate of authenticity included · Price on request · Reply within 1 business day';
  var TRUST_COMM = 'Sized and colored to your space · Reply within 1 business day';
  var TRUST_GEN = 'Reply within 1 business day';
  var PH = { info: 'Anything you’d like to know, such as shipping or framing', commission: 'Size, colors, the room, or a message you’d like hidden in it', general: 'Tell Angela what you have in mind' };

  function trustHTML(t) { return t.split(' · ').map(function (x) { return '<span>' + esc(x) + '</span>'; }).join(' '); }
  // One function decides the kind, so a sold work can never show "Request info".
  function kindOf(p, o) { return o.mode === 'general' ? 'general' : ((!p || !p.available) ? 'commission' : 'info'); }
  function refOf(p, o, kind) {
    if (o.ref) return o.ref;
    if (kind === 'general') return 'General inquiry';
    if (!p) return 'Commission inquiry (general)';
    if (kind === 'commission') return 'Commission inquiry inspired by ' + p.title;
    return 'About: ' + p.title + (sizeText(p) ? ' · ' + sizeText(p) : '');
  }

  // inquiry(p, o) -> HTML for a trigger button + its hidden dropdown panel.
  //   p: painting record (or a pseudo-record {handle,title,available}); null = general commission.
  //   o.label    label for available works / general / null-p buttons (sold works always read "Sold · Submit commission inquiry")
  //   o.mode     'general' (with o.ref) = plain message, success "Sent to angela@fabbriology.com"
  //   o.ref, o.placeholder, o.cls (extra button classes, e.g. 'btn-sm')
  function inquiry(p, o) {
    o = o || {};
    var kind = kindOf(p, o);
    var id = 'inq-' + (p ? p.handle : 'general') + '-' + (++uid);
    var label, sent;
    if (kind === 'commission' && p) { label = 'Sold · Submit commission inquiry'; sent = 'Sold · Commission inquiry sent'; }
    else if (kind === 'commission') { label = o.label || 'Start a commission inquiry'; sent = 'Commission inquiry sent'; }
    else if (kind === 'general') { label = o.label || 'Send a message'; sent = 'Message sent'; }
    else { label = o.label || 'Request info'; sent = 'Inquiry sent'; }
    REG[id] = { p: p, o: o, kind: kind, sent: sent };
    var cls = 'btn inq-btn ' + (kind === 'commission' && p ? 'btn-outline' : 'btn-primary') + (o.cls ? ' ' + o.cls : '');
    return '<div class="inq-wrap">' +
      '<button type="button" class="' + cls + '" aria-expanded="false" aria-controls="' + id + '" data-kind="' + kind + '">' + esc(label) + '</button>' +
      '<div id="' + id + '" class="inq" role="region" aria-label="' + esc(p ? 'Inquiry about ' + p.title : (kind === 'general' ? 'Message to the studio' : 'Commission inquiry')) + '" hidden></div>' +
      '</div>';
  }

  function buildPanel(panel) {
    var r = REG[panel.id], p = r.p, o = r.o, kind = r.kind, id = panel.id;
    var commission = kind === 'commission';
    var ref = refOf(p, o, kind);
    var ph = o.placeholder || PH[kind];
    var inline = !!r.inline;
    panel.innerHTML =
      '<div class="inq-in"><div class="inq-card' + (commission || (inline && o.mode === 'commission') ? ' commission' : '') + '">' +
      '<p class="inq-ref">' + esc(ref) + '</p>' +
      '<form class="inq-form" novalidate>' +
      '<input type="hidden" name="painting" value="' + esc(p ? p.title : 'General') + '">' +
      '<input type="hidden" name="inquiry_type" value="' + kind + '">' +
      '<input type="hidden" name="reference" value="' + esc(ref) + '">' +
      '<div class="field"><label for="' + id + '-n">Name</label><input id="' + id + '-n" name="name" type="text" autocomplete="name" aria-describedby="' + id + '-ne"><p class="err" id="' + id + '-ne" hidden></p></div>' +
      '<div class="field"><label for="' + id + '-e">Email</label><input id="' + id + '-e" name="email" type="email" inputmode="email" autocomplete="email" aria-describedby="' + id + '-ee"><p class="err" id="' + id + '-ee" hidden></p></div>' +
      '<div class="field"><label for="' + id + '-m">Note (optional)</label><textarea id="' + id + '-m" name="note" rows="3" placeholder="' + esc(ph) + '"></textarea></div>' +
      '<div class="inq-actions"><button type="submit" class="btn btn-primary">Send</button>' + (inline ? '' : '<button type="button" class="btn-text inq-cancel">Cancel</button>') + '</div>' +
      '<p class="trust">' + trustHTML(commission ? TRUST_COMM : (kind === 'general' ? TRUST_GEN : TRUST_INFO)) + '</p>' +
      '</form></div></div>';
    panel.dataset.built = '1';
  }

  function openInq(btn) {
    if (current && current !== btn) closeInq(current, false);
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel.dataset.built) buildPanel(panel);
    panel.hidden = false;
    void panel.offsetHeight; // let the browser paint 0fr first so the transition runs (hidden-timing fix)
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

  // inlineForm(el, {mode:'commission'|'general'|'info', ref, placeholder}): the same panel, already open, no trigger.
  function inlineForm(el, o) {
    if (typeof el === 'string') el = $(el);
    if (!el) return null;
    o = o || {};
    var kind = o.mode === 'general' ? 'general' : (o.mode === 'info' ? 'info' : 'commission');
    var id = 'inq-inline-' + (++uid);
    REG[id] = { p: null, o: o, kind: kind, sent: '', inline: true };
    el.innerHTML = '<div class="inq-wrap inq-inline"><div id="' + id + '" class="inq open" role="region" aria-label="' + esc(o.ref || (kind === 'general' ? 'General inquiry' : 'Commission inquiry')) + '"></div></div>';
    var panel = document.getElementById(id);
    buildPanel(panel);
    return panel;
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
    var panel = form.closest('.inq'), r = REG[panel.id];
    var btn = $('.inq-btn', panel.parentNode);
    var send = $('button[type="submit"]', form);
    send.disabled = true; send.textContent = 'Sending…';
    // Demo only: no network request is made.
    setTimeout(function () {
      var commission = r.kind === 'commission' || (r.inline && r.o.mode === 'commission');
      var card = $('.inq-card', panel);
      card.innerHTML =
        '<div class="inq-done" role="status" tabindex="-1">' +
        '<svg class="check" viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="18" cy="18" r="16"/><path d="M11 18.5l5 5 9-10" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '<p class="inq-done-title">' + (commission ? 'Commission inquiry sent to ' : 'Sent to ') + EMAIL + '</p>' +
        '<p>Angela will reply personally, usually within 1 business day.</p>' +
        '<button type="button" class="btn btn-outline inq-notify">Notify me of new works</button></div>';
      if (btn) btn.textContent = r.sent;
      $('.inq-done', card).focus({ preventScroll: true });
    }, reduce ? 0 : 600);
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : e.target.parentNode;
    var btn = t.closest('.inq-btn');
    if (btn) { if (btn.getAttribute('aria-expanded') === 'true') closeInq(btn, true); else openInq(btn); return; }
    var cancel = t.closest('.inq-cancel');
    if (cancel) { var b = $('.inq-btn', cancel.closest('.inq-wrap')); closeInq(b, true); return; }
    var nf = t.closest('.inq-notify');
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
    if (e.target.getAttribute && e.target.getAttribute('aria-invalid') === 'true') {
      if (e.target.closest('.inq-form')) clearError(e.target); else e.target.removeAttribute('aria-invalid');
    }
  });
  // Esc closes the open dropdown. The close is deferred one tick so other Esc handlers (portfolio index, full screen)
  // still see AFC.current() set during this same keydown and leave their own state alone.
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !current || $('dialog[open]')) return;
    var btn = current, ret = btn.closest('.inq-wrap').contains(document.activeElement);
    setTimeout(function () { if (current === btn) closeInq(btn, ret); }, 0);
  });

  /* ---------- cards ---------- */
  // card(p, {from, eager}): painting card. Sold works get the Sold chip and the D9 button via inquiry().
  function card(p, o) {
    o = o || {};
    var sold = !p.available;
    var href = paintingHref(p, o.from);
    return '<article class="card' + (sold ? ' card--sold' : '') + '">' +
      '<a class="card-frame' + (p.room ? ' room' : '') + '" href="' + href + '" aria-label="' + esc(p.title) + ': view painting"><img src="' + imgAt(p, 0, 800) + '" srcset="' + imgAt(p, 0, 800) + ' 800w, ' + imgAt(p, 0, 1200) + ' 1200w" sizes="(min-width:1200px) 300px, (min-width:640px) 45vw, 92vw" alt="' + esc(alt(p)) + '" width="1200" height="1500"' + (o.eager ? '' : ' loading="lazy"') + ' decoding="async"></a>' +
      '<div class="card-body"><h3 class="card-title"><a href="' + href + '">' + esc(p.title) + '</a></h3>' +
      '<p class="meta">' + esc(metaText(p)) + '</p>' +
      '<p class="status">' + (sold ? '<span class="tag-sold">Sold</span>' : '<i class="dot" aria-hidden="true"></i>Available') + '</p>' +
      inquiry(p) + '</div></article>';
  }
  // cards(list, {from, eager:N}) -> joined HTML; the first N cards load eagerly.
  function cards(list, o) {
    o = o || {};
    return list.map(function (p, i) { return card(p, { from: o.from, eager: o.eager && i < o.eager }); }).join('');
  }
  // merchCard(item): square tile for the shop. No inquiry, shows the price.
  function merchCard(i, o) {
    o = o || {};
    return '<a class="merch" href="product.html?handle=' + encodeURIComponent(i.handle) + '">' +
      '<div class="merch-frame"><img src="' + imgAt(i, 0, 800) + '" alt="' + esc(i.title) + '" width="800" height="800"' + (o.eager ? '' : ' loading="lazy"') + ' decoding="async"></div>' +
      '<div class="merch-body"><h3 class="merch-title">' + esc(i.title) + '</h3><p class="merch-price">' + esc(i.priceText) + (i.available ? '' : ' <span class="tag-sold">Sold out</span>') + '</p></div></a>';
  }
  function merchCards(list, o) { return list.map(function (i, n) { return merchCard(i, { eager: o && o.eager && n < o.eager }); }).join(''); }

  /* ---------- lightbox (no forms in dialogs: D4) ---------- */
  // lightbox(items, start, opener, o): items [{src, alt, caption, maxW?}]; o {label, action:{label, run}, onChange(i)}.
  // o.action adds an outline button: it closes the dialog, then calls run() (open the card's own inline dropdown there).
  function lightbox(items, start, opener, o) {
    o = o || {};
    var n = items.length, idx = 0;
    var dlg = document.createElement('dialog');
    dlg.className = 'lb';
    dlg.setAttribute('aria-label', o.label || 'Image viewer');
    dlg.innerHTML = '<div class="lb-in"><button type="button" class="x" aria-label="Close viewer">✕</button>' +
      (n > 1 ? '<button type="button" class="pv" aria-label="Previous image">‹</button><button type="button" class="nx" aria-label="Next image">›</button>' : '') +
      '<div class="lb-fig"><img alt="" src=""></div>' +
      '<div class="lb-foot"><p class="lb-cap" aria-live="polite"></p>' + (o.action ? '<button type="button" class="btn btn-outline btn-sm lb-act">' + esc(o.action.label) + '</button>' : '') + '<div class="ct"></div></div></div>';
    document.body.appendChild(dlg);
    var img = $('img', dlg), cap = $('.lb-cap', dlg), ct = $('.ct', dlg), acted = false;
    function show(i) {
      idx = (i + n) % n;
      var it = items[idx];
      img.src = it.src; img.alt = it.alt || it.caption || '';
      img.style.maxWidth = it.maxW ? it.maxW + 'px' : '';
      cap.textContent = it.caption || '';
      ct.textContent = n > 1 ? (idx + 1) + ' / ' + n : '';
      if (o.onChange) o.onChange(idx);
    }
    $('.x', dlg).addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () {
      var run = acted && o.action && o.action.run;
      if (dlg.parentNode) dlg.parentNode.removeChild(dlg);
      if (run) run(); else if (opener && opener.focus) opener.focus();
    });
    if (o.action) $('.lb-act', dlg).addEventListener('click', function () { acted = true; dlg.close(); });
    if (n > 1) {
      $('.pv', dlg).addEventListener('click', function () { show(idx - 1); });
      $('.nx', dlg).addEventListener('click', function () { show(idx + 1); });
      dlg.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
      var sx = null;
      dlg.addEventListener('pointerdown', function (e) { sx = e.clientX; });
      dlg.addEventListener('pointerup', function (e) { if (sx === null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); });
    }
    show(start || 0);
    dlg.showModal();
    $('.x', dlg).focus();
    return { show: show, close: function () { dlg.close(); }, dialog: dlg };
  }

  /* ---------- homepage ---------- */
  function home() {
    var fire = by['fire-horse'];
    var plate = $('#plate');
    if (fire && plate) {
      var fh = paintingHref(fire);
      plate.innerHTML =
        '<div class="plate-top"><a class="plate-thumb" href="' + fh + '" tabindex="-1"><img src="' + imgAt(fire, 0, 400) + '" srcset="' + imgAt(fire, 0, 400) + ' 400w, ' + imgAt(fire, 0, 800) + ' 800w" sizes="120px" alt="' + esc(alt(fire)) + '" width="240" height="300"></a>' +
        '<div class="plate-text"><p class="eyebrow">Featured · ' + esc(mainSeries(fire)) + '</p><h2 class="plate-title"><a href="' + fh + '">' + esc(fire.title) + '</a></h2>' +
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
    var lo = Math.min.apply(null, av.map(function (p) { return Math.min(p.w, p.h); }));
    var hi = Math.max.apply(null, av.map(function (p) { return Math.max(p.w, p.h); }));
    var rng = $('#tradeRange');
    if (rng) rng.textContent = 'Ready-to-ship originals from ' + lo + ' × ' + lo + ' in to ' + hi + ' × ' + hi + ' in.';

    var tiles = [['coasters', 'shop.html?c=coasters'], ['acrylic-trays', 'shop.html?c=acrylic-trays'], ['handbags', 'shop.html?c=handbags'], ['chairs', 'product.html?handle=ghost-chair']];
    $('#shopTiles').innerHTML = tiles.map(function (t) {
      var c = catBy[t[0]];
      if (!c) return '';
      return '<a class="tile" href="' + t[1] + '"><div class="tile-img"><img src="' + c.cover + '" alt="' + esc(c.coverAlt) + '" width="800" height="800" loading="lazy" decoding="async"></div>' +
        '<div class="tile-body"><h3 class="tile-title">' + esc(c.label) + '</h3><p class="price">' + esc(c.fromText) + '</p><span class="go">Shop the collection</span></div></a>';
    }).join('');
    reveal();
  }

  /* ---------- public API ---------- */
  var api = {
    K: K, reduce: reduce, by: by, shopBy: shopBy, seriesBy: seriesBy, catBy: catBy,
    esc: esc, sizeText: sizeText, shortMedium: shortMedium, metaText: metaText, alt: alt, imgAt: imgAt, mainSeries: mainSeries, merchAlt: merchAlt,
    seriesLabel: seriesLabel, validSeries: validSeries, seriesPaintings: seriesPaintings, related: related, itemsInCat: itemsInCat,
    availableCount: availableCount, isPainting: isPainting, isItem: isItem, paintingHref: paintingHref,
    inquiry: inquiry, inlineForm: inlineForm, openInq: openInq, closeInq: closeInq, current: function () { return current; },
    card: card, cards: cards, merchCard: merchCard, merchCards: merchCards, lightbox: lightbox, trustHTML: trustHTML,
    qs: qs, setQS: setQS, ready: ready, reveal: reveal, $: $, $$: $$
  };
  Object.keys(api).forEach(function (k) { AF[k] = api[k]; AFC[k] = api[k]; });

  /* ---------- per-page init (only the homepage lives here; other pages ship their own script) ---------- */
  if (document.body.dataset.page === 'home') home();
})();
