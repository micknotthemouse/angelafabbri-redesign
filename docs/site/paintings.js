/* Page script for paintings.html, painting.html and commissions.html. Loads after app.js (window.AF). */
(function () {
  'use strict';
  var AF = window.AF, $ = AF.$, $$ = AF.$$, esc = AF.esc, reduce = AF.reduce;
  var page = document.body.dataset.page;
  var SITE = ' | Angela Fabbri | Fabbriology Fine Art';

  var LEDE = {
    'inversion': 'Backwards messages repeated across the canvas, with one hidden inside. Start in the top right corner.',
    'rose-pattern': 'Her rose-bud pattern in color combinations you won’t see twice.',
    'minis': 'Small originals, big personality.',
    'ten-by-tens': 'Ten-by-ten-inch originals, easy to place and collect.',
    'abstracts-with-attitude': 'Textured abstracts layered with stencils from the Inversion series.',
    'flowers-that-wont-fade': 'Bouquets that stay in bloom.',
    'miami-collection': 'Works shown at Miami Art Week.',
    'studio-move': 'Works from the studio move.'
  };
  var ALL_LEDE = 'Every painting is an original, one of one, with a certificate of authenticity. Prices on request.';
  var TRUST_INFO = 'Original, 1 of 1 · Certificate of authenticity included · Price on request · Reply within 1 business day';
  var TRUST_COMM = 'Sized and colored to your space · Reply within 1 business day';

  /* ---------- paintings.html ---------- */
  function paintings() {
    var key = AF.qs('series');
    var state = { series: AF.validSeries(key) ? key : 'all', archive: false };
    var chips = $('#chips'), grid = $('#grid'), res = $('#result'), tg = $('#archiveToggle'), col = $('#collected'), cg = $('#collectedGrid');
    var h1 = $('#pageTitle'), lede = $('#pageLede');
    var prim = AF.series.filter(function (s) { return s.primary; });
    var more = AF.series.filter(function (s) { return !s.primary; });
    function chip(k, label, n, extra) {
      return '<button type="button" data-s="' + k + '" aria-pressed="false"' + (extra || '') + '>' + esc(label) + (n == null ? '' : '<span class="n">' + n + '</span>') + '</button>';
    }
    var moreIds = more.map(function (s) { return 'chip-' + s.key; }).join(' ');
    chips.innerHTML = chip('all', 'All', AF.availableCount()) +
      prim.map(function (s) { return chip(s.key, s.label, s.available); }).join('') +
      '<button type="button" class="chip-more" aria-expanded="false" aria-controls="' + moreIds + '">More series</button>' +
      more.map(function (s) { return chip(s.key, s.label, s.available, ' id="chip-' + s.key + '" hidden'); }).join('');
    var moreBtn = $('.chip-more', chips), moreChips = more.map(function (s) { return $('#chip-' + s.key); });
    function setMore(open) {
      moreBtn.setAttribute('aria-expanded', String(open));
      moreChips.forEach(function (b) { b.hidden = !open; });
    }
    function render() {
      var cur = AF.current(); if (cur) AF.closeInq(cur, false);
      var k = state.series, isAll = k === 'all', from = isAll ? undefined : k;
      $$('button[data-s]', chips).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.s === k)); });
      if (!isAll && !AF.seriesBy[k].primary) setMore(true);
      var label = isAll ? 'The collection' : AF.seriesLabel(k);
      h1.textContent = label;
      lede.textContent = isAll ? ALL_LEDE : (LEDE[k] || '') + ' Prices on request.';
      document.title = label + SITE;
      var list = AF.seriesPaintings(isAll ? undefined : k);
      var a = list.filter(function (p) { return p.available; });
      var s = list.filter(function (p) { return !p.available; });
      res.textContent = a.length + ' available' + (isAll ? '' : ' in ' + label);
      grid.innerHTML = a.length ? AF.cards(a, { from: from, eager: 4 }) :
        '<div class="empty" style="grid-column:1/-1"><p>No available works in this series right now. Angela can paint something in the same spirit for you.</p>' + AF.inquiry(null) + '</div>';
      tg.setAttribute('aria-expanded', String(state.archive));
      tg.textContent = state.archive ? 'Hide collected works' : 'Show collected works (' + s.length + ')';
      tg.hidden = !s.length;
      col.hidden = !(state.archive && s.length);
      cg.innerHTML = state.archive ? AF.cards(s, { from: from }) : '';
      AF.reveal();
    }
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b === moreBtn) { setMore(moreBtn.getAttribute('aria-expanded') !== 'true'); return; }
      if (!b.dataset.s) return;
      state.series = b.dataset.s;
      AF.setQS('series', state.series === 'all' ? null : state.series);
      render();
    });
    tg.addEventListener('click', function () {
      state.archive = !state.archive; render();
      if (state.archive) col.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    });
    render();
  }

  /* ---------- painting.html ---------- */
  function detail() {
    var h = AF.qs('handle') || AF.qs('h') || 'fire-horse';
    if (!AF.by[h] && AF.shopBy[h]) { location.replace('product.html?handle=' + encodeURIComponent(h)); return; }
    var p = AF.by[h] || AF.by['fire-horse'] || AF.paintings[0];
    var from = AF.qs('from'), fromKey = AF.validSeries(from) ? from : '';
    var sold = !p.available, n = p.images.length, idx = 0;
    var meta = [p.medium || 'Original painting', AF.sizeText(p)].filter(Boolean).join(' · ');
    var crumb = $('#crumb');
    crumb.innerHTML = fromKey ? '<a href="paintings.html?series=' + fromKey + '">← Back to ' + esc(AF.seriesLabel(fromKey)) + '</a>' : '<a href="paintings.html">← All paintings</a>';
    document.title = p.title + SITE;
    var md = $('meta[name="description"]');
    if (md) md.setAttribute('content', p.title + ', an original painting by Angela Fabbri. ' + (sold ? 'Collected. Submit a commission inquiry for something in the same spirit.' : 'Request info on this original.'));

    function viewAlt(i) { return i === 0 ? AF.alt(p) : p.title + ', view ' + (i + 1) + ' of ' + n; }
    var thumbs = n > 1 ? '<div class="thumbs" role="group" aria-label="More views">' + p.images.map(function (im, i) {
      return '<button type="button" data-i="' + i + '"' + (i === 0 ? ' aria-current="true"' : '') + '><img src="' + AF.imgAt(p, i, 200) + '" alt="' + esc(p.title + ', view ' + (i + 1) + ' of ' + n) + '" width="128" height="128" loading="lazy"></button>';
    }).join('') + '</div>' : '';
    var msgs = '';
    if (p.repeated) msgs += '<div><dt>Repeated</dt><dd>“' + esc(p.repeated) + '”</dd></div>';
    if (p.hidden) msgs += '<div><dt>Hidden</dt><dd>“' + esc(p.hidden) + '”</dd></div>';
    if (p.message && !p.repeated) msgs += '<div><dt>Message</dt><dd>“' + esc(p.message) + '”</dd></div>';
    var s0 = p.series[0];
    var eyebrow = s0 ? '<a href="paintings.html?series=' + s0 + '">' + esc(AF.seriesLabel(s0)) + '</a>' : 'Original painting';

    $('#detail').innerHTML =
      '<div class="d-media"><button type="button" class="d-frame' + (p.room ? ' room' : '') + '" id="open-lb" aria-label="Enlarge image of ' + esc(p.title) + '"><img id="d-img" src="' + AF.imgAt(p, 0, 1200) + '" srcset="' + AF.imgAt(p, 0, 800) + ' 800w, ' + AF.imgAt(p, 0, 1200) + ' 1200w, ' + AF.imgAt(p, 0, 1600) + ' 1600w" sizes="(min-width:1024px) 58vw, 92vw" alt="' + esc(AF.alt(p)) + '" width="1200" height="1500" fetchpriority="high" decoding="async"></button>' + thumbs + '</div>' +
      '<div class="d-info"><p class="eyebrow">' + eyebrow + '</p><h1>' + esc(p.title) + '</h1><p class="meta">' + esc(meta) + '</p>' +
      (msgs ? '<dl class="dl">' + msgs + '</dl>' : '<div style="height:24px"></div>') +
      '<p class="status">' + (sold ? '<span class="tag-sold">Sold</span>' : '<i class="dot" aria-hidden="true"></i>Available · Original, 1 of 1') + '</p>' +
      (sold ? '<p class="sold-note">This original has found a home. Angela can paint one in the same spirit.</p>' : '') +
      AF.inquiry(p) +
      '<p class="trust">' + AF.trustHTML(sold ? TRUST_COMM : TRUST_INFO) + '</p>' +
      (p.about ? '<div class="about-piece"><h2>About this piece</h2><p class="lede">' + esc(p.about) + '</p></div>' : '') +
      '<p class="cert">Certificate of authenticity included</p></div>';

    var img = $('#d-img'), frame = $('#open-lb');
    function showMain(i) {
      idx = i;
      img.src = AF.imgAt(p, i, 1200);
      img.srcset = AF.imgAt(p, i, 800) + ' 800w, ' + AF.imgAt(p, i, 1200) + ' 1200w, ' + AF.imgAt(p, i, 1600) + ' 1600w';
      img.alt = viewAlt(i);
      frame.classList.toggle('room', !!p.room && i === 0);
      $$('.thumbs button').forEach(function (b, k) { if (k === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    }
    $$('.thumbs button').forEach(function (b) { b.addEventListener('click', function () { showMain(+b.dataset.i); }); });
    frame.addEventListener('click', function () {
      AF.lightbox(p.images.map(function (im, i) {
        return { src: AF.imgAt(p, i, 1600), alt: viewAlt(i), caption: p.title + ' · ' + AF.metaText(p) };
      }), idx, frame, { label: 'Image viewer: ' + p.title, onChange: function (i) { if (i !== idx) showMain(i); } });
    });

    var rel = AF.related(p, fromKey, 4);
    $('#related').innerHTML = AF.cards(rel, { from: fromKey || s0 });
    AF.reveal();
  }

  /* ---------- commissions.html ---------- */
  function commissions() {
    $('#commStart').innerHTML = AF.inquiry(null, { label: 'Start a commission inquiry' });
    var list = ['live-luxuriously-copy', 'exit-strategy-copy', 'sensory-overload-copy', 'green-goddess-copy-1', 'scrumptious-copy', 'im-a-conversation-piece-fl-orange']
      .map(function (h) { return AF.by[h]; }).filter(Boolean);
    $('#collectedGrid').innerHTML = AF.cards(list);
    AF.inlineForm('#commForm', { mode: 'commission', ref: 'Commission inquiry (general)', placeholder: 'Size, colors, the room, or a message you’d like hidden in it' });
    AF.reveal();
  }

  AF.ready(function () {
    if (page === 'paintings') paintings();
    else if (page === 'painting') detail();
    else if (page === 'commissions') commissions();
  });
})();
