/* Option B, Mirror Studio. Vanilla JS, classic script (works from file://). */
(function () {
  'use strict';
  var EMAIL = 'angela@fabbriology.com';
  var P = window.AF_PAINTINGS || [];
  var CATS = window.AF_CATEGORIES || [];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function byHandle(h) { for (var i = 0; i < P.length; i++) if (P[i].handle === h) return P[i]; return null; }
  function catLabel(id) { for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i].label; return ''; }
  function wUrl(u, n) { return u.replace(/width=\d+$/, 'width=' + n); }
  function caption(p) { return [p.medium, p.size].filter(Boolean).map(esc).join(' · '); }

  /* ---------- card (mirrors build-data.mjs) ---------- */
  function cardHTML(p, opts) {
    opts = opts || {};
    var sold = !p.available, im = p.images[0], base = im.u800.replace(/&width=800$/, '');
    var href = 'painting.html?handle=' + encodeURIComponent(p.handle);
    var subject = (sold ? 'Commission inquiry inspired by ' : 'Request info: ') + p.title;
    return '<article class="card" data-handle="' + esc(p.handle) + '">' +
      '<div class="card-media"><a class="card-well" href="' + href + '" tabindex="-1"><img src="' + esc(base) + '&amp;width=600" srcset="' +
      esc(base) + '&amp;width=600 600w, ' + esc(base) + '&amp;width=900 900w" sizes="(min-width:1360px) 22vw, (min-width:1024px) 30vw, (min-width:600px) 44vw, 90vw" width="' + im.w + '" height="' + im.h +
      '" alt="' + esc(p.title) + ', painting by Angela Fabbri"' + (opts.eager ? '' : ' loading="lazy" decoding="async"') + '></a>' +
      '<span class="pill ' + (sold ? 'pill-sold' : 'pill-avail') + '">' + (sold ? 'Sold' : '<i aria-hidden="true"></i>Available') + '</span></div>' +
      '<div class="card-body"><h3 class="card-title"><a href="' + href + '">' + esc(p.title) + '</a></h3>' +
      (caption(p) ? '<p class="card-cap">' + caption(p) + '</p>' : '') +
      '<div class="inq" data-title="' + esc(p.title) + '" data-handle="' + esc(p.handle) + '" data-mode="' + (sold ? 'commission' : 'info') + '">' +
      '<button type="button" class="btn ' + (sold ? 'btn-ghost' : 'btn-pink') + ' inq-toggle" aria-expanded="false">' +
      (sold ? 'Sold · Submit commission inquiry' : 'Request info') + '</button>' +
      '<a class="inq-mailto" href="mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '">Email Angela about ' + esc(p.title) + '</a></div></div></article>';
  }
  window.AF = { cardHTML: cardHTML, initInq: initInq };

  /* ---------- inquiry dropdown ---------- */
  var seq = 0;
  function initInq(root) {
    $$('.inq', root || document).forEach(function (inq) {
      if (inq.__ready) return;
      inq.__ready = true;
      var btn = $('.inq-toggle', inq);
      var id = 'inq-' + (++seq);
      var panel = document.createElement('div');
      panel.className = 'inq-panel';
      panel.id = id;
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-label', (inq.dataset.mode === 'commission' ? 'Commission inquiry: ' : 'Request info: ') + inq.dataset.title);
      panel.innerHTML = '<div class="inq-clip"><div class="inq-inner"><div class="inq-box"></div></div></div>';
      btn.insertAdjacentElement('afterend', panel);
      btn.setAttribute('aria-controls', id);
      inq.__panel = panel; inq.__btn = btn; inq.__id = id;
    });
  }
  function fieldHTML(id, key, label, type, extra) {
    return '<div class="field"><label for="' + id + '-' + key + '">' + label + '</label>' +
      (type === 'textarea'
        ? '<textarea id="' + id + '-' + key + '" name="' + key + '" rows="2" ' + extra + '></textarea>'
        : '<input id="' + id + '-' + key + '" name="' + key + '" type="' + type + '" ' + extra + '>') +
      '<p class="err" id="' + id + '-' + key + '-err"></p></div>';
  }
  function renderForm(inq) {
    var t = inq.dataset.title, h = inq.dataset.handle, c = inq.dataset.mode === 'commission', id = inq.__id;
    var box = $('.inq-box', inq.__panel);
    box.innerHTML =
      (c ? '<p class="note">This one’s collected. Angela can paint one in the same spirit.</p>' : '') +
      '<p class="inq-chip">' + (c ? 'Commission inspired by: ' : 'About: ') + '<strong>' + esc(t) + '</strong></p>' +
      '<form novalidate>' +
      fieldHTML(id, 'name', 'Name', 'text', 'autocomplete="name" required') +
      fieldHTML(id, 'email', 'Email', 'email', 'autocomplete="email" required') +
      fieldHTML(id, 'note', 'Note (optional)', 'textarea', 'placeholder="' + (c ? 'Size, colors, a message you’d hide in it' : 'Where it would hang, or questions on size and shipping') + '"') +
      '<input type="hidden" name="inquiry_type" value="' + (c ? 'commission' : 'request-info') + '">' +
      '<input type="hidden" name="painting_handle" value="' + esc(h) + '">' +
      '<input type="hidden" name="reference" value="' + esc((c ? 'Commission inquiry inspired by ' : 'Request info: ') + t) + '">' +
      '<button class="btn btn-pink btn-block" type="submit">' + (c ? 'Send commission inquiry' : 'Send') + '</button></form>' +
      '<p class="trust">' + (c ? 'Made to your size and palette · Reply within 1 business day' :
        'Original, 1 of 1 · Certificate of authenticity included · Price on request · Reply within 1 business day') + '</p>';
    var form = $('form', box);
    ['name', 'email'].forEach(function (k) {
      $('#' + id + '-' + k, box).addEventListener('input', function () { clearErr(id, k, box); });
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); submitInq(inq, form, box); });
  }
  function clearErr(id, k, box) {
    var el = $('#' + id + '-' + k, box);
    el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby');
    $('#' + id + '-' + k + '-err', box).textContent = '';
  }
  function setErr(id, k, msg, box) {
    var el = $('#' + id + '-' + k, box);
    el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', id + '-' + k + '-err');
    $('#' + id + '-' + k + '-err', box).textContent = '! ' + msg;
    return el;
  }
  function submitInq(inq, form, box) {
    var id = inq.__id, first = null;
    var name = form.elements.name.value.trim(), email = form.elements.email.value.trim();
    clearErr(id, 'name', box); clearErr(id, 'email', box);
    if (!name) first = setErr(id, 'name', 'Please enter your name.', box);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { var e = setErr(id, 'email', 'Please enter a valid email.', box); first = first || e; }
    if (first) { first.focus(); return; }
    var sb = $('button[type=submit]', form);
    sb.disabled = true; sb.textContent = 'Sending…';
    setTimeout(function () { renderDone(inq, box); }, reduce ? 0 : 600);
  }
  function renderDone(inq, box) {
    var t = inq.dataset.title, c = inq.dataset.mode === 'commission';
    box.innerHTML = '<div class="inq-done" role="status"><h4 tabindex="-1">' + (c ? 'Commission inquiry sent to ' : 'Sent to ') + EMAIL + '</h4>' +
      '<p>Angela will reply about <strong>' + esc(t) + '</strong> personally.</p>' +
      '<p class="small">Demo only: no message was sent.</p>' +
      '<div class="acts"><a class="link-arrow" href="#newsletter">Get notified of new works</a>' +
      '<button type="button" class="btn btn-ghost" data-inq-close>Close</button></div></div>';
    var h = $('h4', box); h.focus();
    $('[data-inq-close]', box).addEventListener('click', function () { setOpen(inq, false, true); });
    inq.__done = true;
  }
  function setOpen(inq, open, returnFocus) {
    var panel = inq.__panel, btn = inq.__btn;
    if (!panel) return;
    if (open) {
      $$('.inq').forEach(function (o) { if (o !== inq && o.__panel && o.__panel.classList.contains('open')) setOpen(o, false); });
      renderForm(inq); inq.__done = false;
      panel.classList.add('open'); btn.setAttribute('aria-expanded', 'true');
      var nm = $('input[name=name]', panel);
      if (nm) nm.focus({ preventScroll: true });
      var go = function () { try { panel.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }); } catch (x) { } };
      reduce ? go() : setTimeout(go, 240);
    } else {
      var hadFocus = panel.contains(document.activeElement);
      panel.classList.remove('open'); btn.setAttribute('aria-expanded', 'false');
      if (hadFocus || returnFocus) btn.focus();
    }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.inq-toggle');
    if (!b) return;
    var inq = b.closest('.inq');
    if (!inq.__panel) initInq(inq.parentNode);
    setOpen(inq, !inq.__panel.classList.contains('open'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = $$('.inq-panel.open');
    if (open.length) { open.forEach(function (p) { setOpen(p.parentNode, false); }); return; }
    var m = $('#mnav.open');
    if (m) { m.classList.remove('open'); var mb = $('.menu-btn'); mb.setAttribute('aria-expanded', 'false'); mb.focus(); }
  });

  /* ---------- header menu ---------- */
  var mb = $('.menu-btn'), mn = $('#mnav');
  if (mb && mn) {
    mb.addEventListener('click', function () {
      var o = !mn.classList.contains('open');
      mn.classList.toggle('open', o); mb.setAttribute('aria-expanded', String(o));
    });
    $$('a', mn).forEach(function (a) { a.addEventListener('click', function () { mn.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); }); });
  }

  /* ---------- reveal on scroll ---------- */
  var rv = $$('.rv');
  if (rv.length) {
    if (!('IntersectionObserver' in window) || reduce) rv.forEach(function (n) { n.classList.add('in'); });
    else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting || en.boundingClientRect.top < 0) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      rv.forEach(function (n) { io.observe(n); });
    }
  }

  /* ---------- newsletter ---------- */
  $$('[data-news]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var inp = $('input[type=email]', f), err = $('.err', f), v = inp.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        inp.setAttribute('aria-invalid', 'true'); inp.setAttribute('aria-describedby', err.id);
        err.textContent = '! Please enter a valid email.'; inp.focus(); return;
      }
      var done = f.parentNode.querySelector('.news-done');
      done.textContent = 'You’re on the list. Demo only, nothing was sent.';
      done.hidden = false; f.hidden = true; done.tabIndex = -1; done.focus();
    });
    $('input[type=email]', f).addEventListener('input', function () {
      this.removeAttribute('aria-invalid'); this.removeAttribute('aria-describedby'); $('.err', f).textContent = '';
    });
  });

  /* ---------- homepage: flip + reveal ---------- */
  var fb = $('#flip-btn');
  if (fb) {
    var fi = $('#flip-img');
    fb.addEventListener('click', function () {
      var on = fb.getAttribute('aria-pressed') !== 'true';
      fb.setAttribute('aria-pressed', String(on)); fi.classList.toggle('flipped', on);
      fb.textContent = on ? 'Flip it back' : 'Flip it to read it';
    });
    var rb = $('#reveal-btn'), ro = $('#reveal-out');
    rb.addEventListener('click', function () {
      var on = rb.getAttribute('aria-expanded') !== 'true';
      rb.setAttribute('aria-expanded', String(on)); rb.textContent = on ? 'Hide it' : 'Reveal it';
      ro.textContent = on ? 'FIRE' : '';
    });
  }

  /* ---------- paintings page ---------- */
  var grid = $('#grid');
  if (grid) {
    var chipsEl = $('#chips'), resultEl = $('#result'), archBtn = $('#arch-btn'), archGrid = $('#arch-grid');
    var SHORT = { awa: 'AWA' };
    var series = (new URLSearchParams(location.search).get('series')) || 'all';
    if (series !== 'all' && !CATS.some(function (c) { return c.id === series; })) series = 'all';
    var archOpen = false;
    var inSeries = function (p) { return series === 'all' || p.category === series; };
    var availList = function () { return P.filter(function (p) { return p.available && inSeries(p); }); };
    var soldList = function () { return P.filter(function (p) { return !p.available && inSeries(p); }); };

    var all = [{ id: 'all', label: 'All' }].concat(CATS);
    chipsEl.innerHTML = all.map(function (c) {
      var n = P.filter(function (p) { return p.available && (c.id === 'all' || p.category === c.id); }).length;
      return '<button type="button" class="chip" data-series="' + c.id + '" aria-pressed="false">' + esc(c.label) + ' <span class="ct">' + n + '</span></button>';
    }).join('');
    chipsEl.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      series = b.dataset.series; render(true);
    });

    var renderArch = function () {
      var list = soldList();
      archBtn.textContent = (archOpen ? 'Hide ' : 'Show ') + list.length + ' collected works';
      archBtn.setAttribute('aria-expanded', String(archOpen));
      archGrid.hidden = !archOpen;
      archGrid.innerHTML = archOpen ? list.map(function (p) { return cardHTML(p); }).join('') : '';
      if (archOpen) initInq(archGrid);
    };
    var render = function (push) {
      var a = availList(), s = soldList();
      $$('.chip', chipsEl).forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.series === series)); });
      grid.innerHTML = a.map(function (p, i) { return cardHTML(p, { eager: i < 4 }); }).join('');
      initInq(grid);
      var lab = series === 'all' ? 'across all series' : 'in ' + (SHORT[series] || catLabel(series));
      resultEl.textContent = a.length + ' available ' + lab + ' · ' + s.length + ' collected';
      renderArch();
      if (push) {
        var u = location.pathname + (series === 'all' ? '' : '?series=' + series) + location.hash;
        try { history.replaceState(null, '', u); } catch (x) { }
      }
    };
    archBtn.addEventListener('click', function () { archOpen = !archOpen; renderArch(); });
    archOpen = location.hash === '#collected';
    render(false);
    if (archOpen) { var t = $('#collected'); if (t) setTimeout(function () { t.scrollIntoView(); }, 50); }
  }

  /* ---------- detail page ---------- */
  var root = $('#detail-root');
  if (root) {
    var q = new URLSearchParams(location.search);
    var p = byHandle(q.get('handle') || q.get('h') || '') || byHandle('fire-horse');
    var sold = !p.available, c = p.category;
    document.title = p.title + ' by Angela Fabbri';
    var imgs = p.images, cur = 0;
    var sets = function (im) { return wUrl(im.u800, 800) + ' 800w, ' + wUrl(im.u800, 1200) + ' 1200w, ' + im.u1600 + ' 1600w'; };
    var rows = [['Medium', p.medium], ['Size', p.size], ['Repeated message', p.repeated], ['Hidden message', p.hidden], ['Backwards message', p.message]]
      .filter(function (r) { return r[1]; });
    root.innerHTML =
      '<div class="detail wrap"><div class="d-media"><div class="d-main"><button type="button" class="zoom" id="zoom" aria-label="Open larger image of ' + esc(p.title) + '">' +
      '<img id="d-img" src="' + imgs[0].u1600 + '" srcset="' + sets(imgs[0]) + '" sizes="(min-width:1024px) 58vw, 92vw" width="' + imgs[0].w + '" height="' + imgs[0].h +
      '" fetchpriority="high" alt="' + esc(p.title) + ', painting by Angela Fabbri"></button></div>' +
      (imgs.length > 1 ? '<div class="d-thumbs" id="thumbs">' + imgs.map(function (im, i) {
        return '<button type="button" data-i="' + i + '" aria-label="Show image ' + (i + 1) + ' of ' + imgs.length + '"' + (i === 0 ? ' aria-current="true"' : '') + '><img src="' + wUrl(im.u800, 400) + '" width="' + im.w + '" height="' + im.h + '" alt="" loading="lazy"></button>';
      }).join('') + '</div>' : '') +
      (p.backwards ? '<button type="button" class="btn btn-ghost flip-detail" id="d-flip" aria-pressed="false">Flip it to read it</button>' : '') +
      '</div><div class="d-info"><p class="crumbs"><a href="paintings.html">Paintings</a> / <a href="paintings.html?series=' + c + '">' + esc(catLabel(c)) + '</a></p>' +
      '<span class="pill pill-static ' + (sold ? 'pill-sold' : 'pill-avail') + '">' + (sold ? 'Sold' : '<i aria-hidden="true"></i>Available') + '</span>' +
      '<h1 class="h1">' + esc(p.title) + '</h1>' +
      (rows.length ? '<dl class="facts-dl">' + rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl>' : '') +
      '<p class="coa">Original, 1 of 1 · Certificate of authenticity included</p>' +
      (sold ? '<p class="commission-note">This one’s collected. Commission a piece in the same spirit.</p>' : '') +
      '<div class="inq" data-title="' + esc(p.title) + '" data-handle="' + esc(p.handle) + '" data-mode="' + (sold ? 'commission' : 'info') + '">' +
      '<button type="button" class="btn ' + (sold ? 'btn-ghost' : 'btn-pink') + ' inq-toggle" aria-expanded="false">' + (sold ? 'Sold · Submit commission inquiry' : 'Request info') + '</button>' +
      '<a class="inq-mailto" href="mailto:' + EMAIL + '">Email Angela about ' + esc(p.title) + '</a></div>' +
      '<div class="faq"><details><summary>How does pricing work?</summary><p>Every original is priced individually. Ask, and Angela replies personally.</p></details>' +
      '<details><summary>Shipping and installation</summary><p>Details come with your reply.</p></details>' +
      '<details><summary>Can I commission something similar?</summary><p>Yes, via the commission inquiry on any collected work.</p></details></div></div></div>';
    initInq(root);

    var rel = P.filter(function (x) { return x.available && x.category === c && x.handle !== p.handle; });
    if (rel.length < 4) rel = rel.concat(P.filter(function (x) { return x.available && x.category !== c && x.handle !== p.handle; }));
    rel = rel.slice(0, 4);
    var rs = $('#related');
    if (rs) {
      $('#related-h').textContent = 'More from ' + catLabel(c);
      $('#related-grid').innerHTML = rel.map(function (x) { return cardHTML(x); }).join('');
      initInq(rs);
    }

    var dimg = $('#d-img');
    var show = function (i) {
      cur = (i + imgs.length) % imgs.length;
      var im = imgs[cur];
      dimg.src = im.u1600; dimg.srcset = sets(im); dimg.width = im.w; dimg.height = im.h;
      $$('#thumbs button').forEach(function (b, k) { if (k === cur) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    };
    var th = $('#thumbs');
    if (th) th.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) show(+b.dataset.i); });
    var df = $('#d-flip');
    if (df) df.addEventListener('click', function () {
      var on = df.getAttribute('aria-pressed') !== 'true';
      df.setAttribute('aria-pressed', String(on)); dimg.classList.toggle('flipped', on);
      df.textContent = on ? 'Flip it back' : 'Flip it to read it';
    });

    /* lightbox */
    var dlg = document.createElement('dialog');
    dlg.className = 'lb'; dlg.setAttribute('aria-label', p.title + ' images');
    dlg.innerHTML = '<div class="lb-bar"><span id="lb-count" aria-live="polite"></span><button type="button" id="lb-close" aria-label="Close">Close</button></div>' +
      '<div class="lb-stage"><button type="button" class="prev" aria-label="Previous image">‹</button><img id="lb-img" alt="' + esc(p.title) + ', painting by Angela Fabbri"><button type="button" class="next" aria-label="Next image">›</button></div>';
    document.body.appendChild(dlg);
    var lbi = $('#lb-img', dlg), zoomBtn = $('#zoom');
    var lbShow = function (i) {
      cur = (i + imgs.length) % imgs.length; lbi.src = imgs[cur].u1600;
      $('#lb-count', dlg).textContent = (cur + 1) + ' / ' + imgs.length;
      $$('.prev, .next', dlg).forEach(function (b) { b.hidden = imgs.length < 2; });
    };
    zoomBtn.addEventListener('click', function () { lbShow(cur); dlg.showModal(); $('#lb-close', dlg).focus(); });
    $('#lb-close', dlg).addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('close', function () { show(cur); zoomBtn.focus(); });
    $('.prev', dlg).addEventListener('click', function () { lbShow(cur - 1); });
    $('.next', dlg).addEventListener('click', function () { lbShow(cur + 1); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') lbShow(cur - 1); else if (e.key === 'ArrowRight') lbShow(cur + 1);
    });
    var sx = null, stage = $('.lb-stage', dlg);
    stage.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    stage.addEventListener('pointerup', function (e) {
      if (sx === null) return; var dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 50) lbShow(cur + (dx < 0 ? 1 : -1));
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  }

  /* ---------- everything static on the page ---------- */
  initInq(document);
  $$('[data-count="available"]').forEach(function (n) {
    n.textContent = P.filter(function (x) { return x.available; }).length;
  });
})();
