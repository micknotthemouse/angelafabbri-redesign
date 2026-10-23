/* Portfolio gallery: 10 pages, swipe / keys / buttons / dots / index, hash deep links, full screen, lightbox, inquiry dropdowns.
 * Loads after data.js, components.js and app.js (all defer). The page markup is static (build: work/site/build-portfolio.mjs). */
(function () {
  'use strict';
  var AF = window.AF;
  if (!AF || !AF.inquiry) return;
  var $ = AF.$, $$ = AF.$$, esc = AF.esc;
  var root = $('.pf');
  if (!root) return;

  var pages = $$('.pf-page', root), N = pages.length;
  var stage = $('.pf-stage', root), live = $('#pf-live'), num = $('#pf-num'), nm = $('#pf-name');
  var prev = $('.pf-prev', root), next = $('.pf-next', root);
  var dotsEl = $('#pf-dots'), indexEl = $('#pf-index'), indexBtn = $('#pf-index-btn'), fullBtn = $('#pf-full');
  var desk = window.matchMedia('(min-width:1024px)');
  var cur = -1, dots = [], idxBtns = [];
  var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
  var BLUE = { handle: 'idontunderstand-blue', title: 'I Don’t Understand You Either (Blue)', available: true };

  root.classList.add('pf-js');
  document.documentElement.classList.add('pf-js');

  /* ---------- works: inquiry dropdowns + lightbox ---------- */
  pages.forEach(function (page) {
    var figs = $$('.pf-work[data-work]', page);
    figs.forEach(function (fig) {
      var h = fig.getAttribute('data-work'), p = h === BLUE.handle ? BLUE : AF.by[h];
      if (!p) return;
      $('.pf-inq', fig).innerHTML = AF.inquiry(p, { label: 'Ask about this work', cls: 'btn-sm' });
    });
    function items() {
      return figs.map(function (fig) {
        var im = $('img', fig), p = AF.by[fig.getAttribute('data-work')];
        var cap = $('.pf-work-title', fig).textContent + ' · ' + $('.meta', fig).textContent + (p ? (p.available ? ' · Available' : ' · Sold') : '');
        return { src: im.getAttribute('data-big') || im.src, alt: im.alt, caption: cap, maxW: +im.getAttribute('data-maxw') || 0 };
      });
    }
    figs.forEach(function (fig, i) {
      $('.pf-work-frame', fig).addEventListener('click', function (e) {
        var at = i;
        function relabel(n) {
          at = n;
          var b = document.querySelector('dialog.lb .lb-act'), p = AF.by[figs[n].getAttribute('data-work')];
          if (b) b.textContent = p && !p.available ? 'Submit commission inquiry' : 'Ask about this work';
        }
        var done = false;
        function ask() { if (done) return; done = true; var b = $('.inq-btn', figs[at]); if (b) AF.openInq(b); }
        var lb = AF.lightbox(items(), i, e.currentTarget, { label: 'Portfolio works', action: { label: 'Ask about this work', run: ask }, onChange: relabel });
        // belt and braces: if the dialog's close event is late or missing, still open the card's dropdown once
        var act = $('.lb-act', lb.dialog);
        if (act) act.addEventListener('click', function () { setTimeout(ask, 80); });
      });
    });
  });

  /* general commission on the Commissions page */
  var comm = $('#pf-comm');
  if (comm) comm.innerHTML = AF.inquiry(null, {});

  /* ---------- dots + index ---------- */
  pages.forEach(function (pg, i) {
    var name = pg.getAttribute('data-name');
    var d = document.createElement('button');
    d.type = 'button'; d.className = 'pf-dot';
    d.setAttribute('aria-label', 'Go to page ' + (i + 1) + ': ' + name);
    d.addEventListener('click', function () { go(i, { src: 'dot' }); });
    dotsEl.appendChild(d); dots.push(d);

    var b = document.createElement('button');
    b.type = 'button';
    var thumb = pg.getAttribute('data-thumb'), tile = pg.getAttribute('data-tile');
    b.innerHTML = '<span class="pf-thumb">' + (thumb ? '<img src="' + esc(thumb) + '" alt="" width="96" height="120" loading="lazy" decoding="async">' : esc(tile)) + '</span>' + pad2(i + 1) + ' ' + esc(name);
    b.addEventListener('click', function () { setIndex(false); go(i, { src: 'index', focus: true }); });
    indexEl.appendChild(b); idxBtns.push(b);
  });
  [dotsEl, prev, next, indexBtn, fullBtn].forEach(function (el) { el.hidden = false; });

  function setIndex(open, focusBtn) {
    indexEl.hidden = !open;
    indexBtn.setAttribute('aria-expanded', String(open));
    if (open) { var c = idxBtns[cur]; if (c) { c.focus({ preventScroll: true }); if (c.scrollIntoView) c.scrollIntoView({ block: 'nearest', inline: 'center' }); } }
    else if (focusBtn) indexBtn.focus();
  }
  indexBtn.addEventListener('click', function () { setIndex(indexEl.hidden); });

  /* ---------- navigation ---------- */
  var started = false;
  function setHash(n) {
    if (!started) return; // writing the hash before load makes the browser scroll to #page-N
    var h = '#page-' + n;
    try { history.replaceState(null, '', h); } catch (e) { try { location.replace(h); } catch (e2) {} }
  }
  function go(n, o) {
    o = o || {};
    n = Math.max(0, Math.min(N - 1, n));
    if (n === cur && !o.force) return;
    var old = cur, dir = n > cur ? 1 : -1;
    var btn = AF.current();
    if (btn) AF.closeInq(btn, false);
    pages.forEach(function (pg, i) {
      pg.hidden = i !== n;
      pg.classList.remove('pf-enter');
    });
    var pg = pages[n];
    if (old > -1 && !AF.reduce) {
      pg.style.setProperty('--pf-from', (dir > 0 ? 24 : -24) + 'px');
      void pg.offsetWidth;
      pg.classList.add('pf-enter');
      setTimeout(function () { pg.classList.remove('pf-enter'); }, 320);
    }
    cur = n;
    pg.scrollTop = 0;
    if (stage.scrollTop) stage.scrollTop = 0;
    var name = pg.getAttribute('data-name');
    num.textContent = pad2(n + 1) + ' / ' + N;
    nm.textContent = name;
    live.textContent = 'Page ' + (n + 1) + ' of ' + N + ': ' + name;
    dots.forEach(function (d, i) { if (i === n) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    idxBtns.forEach(function (b, i) { if (i === n) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    prev.disabled = n === 0; next.disabled = n === N - 1;
    setHash(n + 1);
    // preload the next page's images
    var nx = pages[n + 1];
    if (nx) $$('img[loading="lazy"]', nx).forEach(function (im) { im.loading = 'eager'; });
    if (old > -1 && !desk.matches && !document.body.classList.contains('pf-immersive')) {
      var top = stage.getBoundingClientRect().top;
      if (top < 52) window.scrollTo(0, window.pageYOffset + top - 52);
    }
    if (o.focus) { var hd = $('h2', pg); if (hd) hd.focus({ preventScroll: true }); }
  }

  prev.addEventListener('click', function () { go(cur - 1, { focus: true }); });
  next.addEventListener('click', function () { go(cur + 1, { focus: true }); });
  $$('[data-pf-go]', root).forEach(function (b) {
    b.addEventListener('click', function () { go(+b.getAttribute('data-pf-go') - 1, { focus: true }); });
  });

  /* keyboard */
  document.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (document.querySelector('dialog[open]')) return;
    var t = e.target;
    if (t && t.closest && t.closest('input,textarea,select,[contenteditable="true"],.site-header,.nav-dd,dialog')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1, { focus: true }); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1, { focus: true }); }
    else if (e.key === 'Home') { e.preventDefault(); go(0, { focus: true }); }
    else if (e.key === 'End') { e.preventDefault(); go(N - 1, { focus: true }); }
  });
  /* Esc: inquiry first (the shared handler closes it one tick later, so current() is still set here), then index, then full screen */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (AF.current() || document.querySelector('dialog[open]') || document.querySelector('.nav-dd:not([hidden])')) return;
    if (!indexEl.hidden) { setIndex(false, true); return; }
    if (document.body.classList.contains('pf-immersive')) setFull(false, true);
  });

  /* swipe: touch or pen only */
  var sx = 0, sy = 0, sid = null;
  stage.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse') return;
    var t = e.target;
    if (t.closest && t.closest('.inq,form,input,textarea,select,.pf-prev,.pf-next,button:not(.pf-work-frame)')) { sid = null; return; }
    sid = e.pointerId; sx = e.clientX; sy = e.clientY;
  });
  stage.addEventListener('pointerup', function (e) {
    if (sid !== e.pointerId) return;
    sid = null;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > 1.5 * Math.abs(dy)) go(cur + (dx < 0 ? 1 : -1), { src: 'swipe' });
  });
  stage.addEventListener('pointercancel', function () { sid = null; });

  /* full screen */
  function setFull(on, focusBtn) {
    document.body.classList.toggle('pf-immersive', on);
    fullBtn.setAttribute('aria-pressed', String(on));
    if (stage.scrollTop) stage.scrollTop = 0;
    if (focusBtn) fullBtn.focus();
  }
  fullBtn.addEventListener('click', function () { setFull(fullBtn.getAttribute('aria-pressed') !== 'true'); });

  /* hash + start */
  function fromHash() {
    var m = /^#page-(\d+)$/.exec(location.hash);
    return m ? Math.max(0, Math.min(N - 1, +m[1] - 1)) : 0;
  }
  window.addEventListener('hashchange', function () { go(fromHash()); });
  document.documentElement.removeAttribute('data-pf-start');
  go(fromHash(), { force: true });
  function settle() { started = true; }
  if (document.readyState === "complete") setTimeout(settle, 80); else window.addEventListener("load", function () { setTimeout(settle, 80); });
})();
