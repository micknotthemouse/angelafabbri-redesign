/* Option A: Paper & Pigment. Vanilla JS, no modules, no network calls. Works from file:// */
(function () {
  "use strict";

  var P = window.AF_PAINTINGS || [];
  var SHOP = window.AF_SHOP || { items: [], links: {} };
  var EMAIL = "angela@fabbriology.com";
  var DEFAULT_HANDLE = "fire-horse";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SIZES = "(min-width:1440px) 22vw,(min-width:1024px) 30vw,(min-width:600px) 45vw,92vw";

  /* ---------- helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function img(src, w) { return src + (src.indexOf("?") > -1 ? "&" : "?") + "width=" + w; }
  function byHandle(h) { for (var i = 0; i < P.length; i++) if (P[i].handle === h) return P[i]; return null; }
  function url(p) { return "painting.html?handle=" + encodeURIComponent(p.handle); }
  function caption(p) {
    var bits = [];
    if (p.medium) bits.push(p.medium);
    if (p.size) bits.push(p.size);
    return bits.length ? bits.join(" · ") : "Original painting";
  }
  function altFor(p) {
    var bits = [p.title];
    if (p.medium) bits.push(p.medium);
    if (p.size) bits.push(p.size);
    return bits.join(", ") + ", by Angela Fabbri";
  }
  function srcset(src, ws) { return ws.map(function (w) { return img(src, w) + " " + w + "w"; }).join(", "); }
  function newestFirst(a, b) { return (b.published || "").localeCompare(a.published || ""); }
  function availableList() { return P.filter(function (p) { return p.available; }).sort(newestFirst); }
  function soldList() { return P.filter(function (p) { return !p.available; }).sort(newestFirst); }
  function store(k, v) { try { if (v === undefined) return window.sessionStorage.getItem(k); window.sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function say(msg) { var el = $("#live"); if (el) { el.textContent = ""; window.setTimeout(function () { el.textContent = msg; }, 30); } }
  function norm(w, h) { return Math.max(w, h) + " x " + Math.min(w, h) + " in"; }

  /* ---------- paintings: card and inquiry markup ---------- */
  var uid = 0;

  function inquiryHTML(p) {
    uid += 1;
    var id = "inq-" + uid;
    var sold = !p.available;
    var label = sold ? "Sold · Submit commission inquiry" : "Request info";
    var chip = sold
      ? "Commission inquiry inspired by <em>" + esc(p.title) + "</em>"
      : "About: <em>" + esc(p.title) + "</em>";
    var subject = sold ? "Commission inquiry inspired by " + p.title : "Inquiry about " + p.title;
    var ph = sold ? "Size, colors or the space you have in mind" : "Size, shipping or a viewing in person";
    var trust = sold
      ? "Commissions are one of one, made for you · Reply within 1 business day*"
      : "Price on request · Original, 1 of 1 · Certificate of authenticity included · Reply within 1 business day*";
    return '' +
      '<div class="inq" data-inq data-mode="' + (sold ? "commission" : "info") + '" data-title="' + esc(p.title) + '">' +
      '<button type="button" class="btn inq-btn ' + (sold ? "btn--outline btn--sold" : "") + '" data-inq-toggle aria-expanded="false" aria-controls="' + id + '" aria-label="' + esc(label + ", " + p.title) + '">' + label + '</button>' +
      '<div class="inq-panel" id="' + id + '" hidden data-panel><div class="inq-inner"><div class="inq-box">' +
      '<form novalidate data-inq-form>' +
            '<p class="inq-chip">' + chip + '</p>' +
      '<input type="hidden" name="subject" value="' + esc(subject) + '">' +
      '<div class="field"><label for="' + id + '-name">Name</label>' +
      '<input id="' + id + '-name" name="name" type="text" autocomplete="name" required aria-describedby="' + id + '-name-err">' +
      '<div class="field-err" id="' + id + '-name-err"></div></div>' +
      '<div class="field"><label for="' + id + '-email">Email</label>' +
      '<input id="' + id + '-email" name="email" type="email" autocomplete="email" required aria-describedby="' + id + '-email-err">' +
      '<div class="field-err" id="' + id + '-email-err"></div></div>' +
      '<div class="field"><label for="' + id + '-note">Note (optional)</label>' +
      '<textarea id="' + id + '-note" name="note" rows="3" placeholder="' + esc(ph) + '"></textarea></div>' +
      '<button type="submit" class="btn btn--block" data-submit>' + (sold ? "Send commission inquiry" : "Send inquiry") + '</button>' +
      '<p class="trust">' + trust + '</p>' +
      '</form>' +
      '<div data-success role="status" aria-live="polite"></div>' +
      '</div></div></div></div>';
  }

  function cardHTML(p, o) {
    o = o || {};
    var lazy = o.eager ? "" : ' loading="lazy" decoding="async"';
    var im = p.images[0];
    var sold = !p.available;
    var status = sold
      ? '<span class="badge-sold">Sold</span><span class="status">Original · Collected</span>'
      : '<span class="status">Original · Available</span>';
    return '' +
      '<article class="card" data-handle="' + esc(p.handle) + '">' +
      '<a class="wall" href="' + url(p) + '" tabindex="-1" aria-hidden="true">' +
      '<img src="' + img(im.src, 800) + '" srcset="' + srcset(im.src, [400, 800, 1200]) + '" sizes="' + SIZES + '" width="' + im.w + '" height="' + im.h + '" alt="' + esc(altFor(p)) + '"' + lazy + '>' +
      '</a>' +
      '<div class="card-body">' +
      '<h3 class="card-title"><a href="' + url(p) + '">' + esc(p.title) + '</a></h3>' +
      '<p class="caption">' + esc(caption(p)) + '</p>' +
      '<div class="status-row">' + status + '</div>' +
      '</div>' +
      inquiryHTML(p) +
      '</article>';
  }

  /* ---------- inquiry behaviour ---------- */
  var openInq = null;

  function panelOf(inq) { return $("[data-panel]", inq); }
  function btnOf(inq) { return $("[data-inq-toggle]", inq); }

  function openPanel(inq) {
    if (openInq && openInq !== inq) closePanel(openInq, false);
    var panel = panelOf(inq), btn = btnOf(inq);
    if (openInq === inq && panel.classList.contains("is-open")) return;
    openInq = inq;
    window.clearTimeout(panel._t);
    // prefill remembered name and email
    var form = $("[data-inq-form]", inq);
    var nm = $("[name=name]", form), em = $("[name=email]", form), note = $("[name=note]", form);
    if (!nm.value && store("af-name")) nm.value = store("af-name");
    if (!em.value && store("af-email")) em.value = store("af-email");
    panel.hidden = false;                  // 1. un-hide so the transition can run
    btn.setAttribute("aria-expanded", "true");
    void panel.offsetHeight;               // 2. commit the collapsed state
    if (reduce) panel.classList.add("is-open");
    else window.requestAnimationFrame(function () { panel.classList.add("is-open"); }); // 3. animate on the next frame
    var done = inq.getAttribute("data-sent") === "1";
    var target = done ? $("[data-success] h3", inq) : (nm.value && em.value ? note : (nm.value ? em : nm));
    if (target) { try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); } }
    window.setTimeout(function () {
      if (openInq === inq) { try { panel.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" }); } catch (e) { panel.scrollIntoView(); } }
    }, reduce ? 0 : 240);
  }

  function closePanel(inq, returnFocus) {
    var panel = panelOf(inq), btn = btnOf(inq);
    if (!panel) return;
    btn.setAttribute("aria-expanded", "false");
    panel.classList.remove("is-open");
    if (openInq === inq) openInq = null;
    window.clearTimeout(panel._t);
    function hide() { if (!panel.classList.contains("is-open")) panel.hidden = true; panel.removeEventListener("transitionend", onEnd); }
    function onEnd(e) { if (e.target === panel && e.propertyName === "grid-template-rows") hide(); }
    if (reduce) hide();
    else { panel.addEventListener("transitionend", onEnd); panel._t = window.setTimeout(hide, 400); }
    if (returnFocus) btn.focus();
  }

  function closeAllInquiries() { if (openInq) closePanel(openInq, false); }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setErr(input, msg) {
    var err = document.getElementById(input.id + "-err");
    if (!err) return;
    err.textContent = msg || "";
    if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
  }

  function submitInq(form) {
    var inq = form.closest("[data-inq]");
    var nm = $("[name=name]", form), em = $("[name=email]", form);
    var bad = null;
    setErr(nm, ""); setErr(em, "");
    if (!nm.value.trim()) { setErr(nm, "Please add your name."); bad = bad || nm; }
    if (!EMAIL_RE.test(em.value.trim())) { setErr(em, "Please enter an email like name@example.com."); bad = bad || em; }
    if (bad) { bad.focus(); return; }
    store("af-name", nm.value.trim()); store("af-email", em.value.trim());
    var sb = $("[data-submit]", form), old = sb.textContent;
    sb.disabled = true; sb.textContent = "Sending…";
    window.setTimeout(function () { // nothing is sent: demo only
      sb.disabled = false; sb.textContent = old;
      showSuccess(inq, form);
    }, 700);
  }

  function showSuccess(inq, form) {
    var sold = inq.getAttribute("data-mode") === "commission";
    var title = inq.getAttribute("data-title");
    var box = $("[data-success]", inq);
    box.innerHTML = '' +
      '<div class="inq-success">' +
      '<h3 tabindex="-1"><span class="check" aria-hidden="true">✓</span><span>' + (sold ? "Commission inquiry sent to " : "Sent to ") + EMAIL + '</span></h3>' +
      '<p>Angela replies personally about <em>' + esc(title) + '</em>.</p>' +
      '<button type="button" class="btn btn--outline" data-notify>Get notified of new works</button>' +
      '<p class="caption">Demo only: nothing was actually sent.</p>' +
      '</div>';
    form.hidden = true;
    inq.setAttribute("data-sent", "1");
    var btn = btnOf(inq);
    var label = sold ? "Sold · Commission inquiry sent ✓" : "Inquiry sent ✓";
    btn.textContent = label;
    btn.setAttribute("aria-label", label.replace(" ✓", "") + ", " + title);
    var h = $("h3", box);
    if (h) { try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); } }
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-inq-toggle]") : null;
    if (t) {
      var inq = t.closest("[data-inq]");
      if (t.getAttribute("aria-expanded") === "true") closePanel(inq, true); else openPanel(inq);
      return;
    }
    var n = e.target.closest ? e.target.closest("[data-notify]") : null;
    if (n) { n.textContent = "You’re on the list."; n.disabled = true; }
  });
  document.addEventListener("submit", function (e) {
    var f = e.target;
    if (f.matches && f.matches("[data-inq-form]")) { e.preventDefault(); submitInq(f); }
    else if (f.matches && f.matches("[data-news]")) {
      e.preventDefault();
      var em = $("input[type=email]", f), err = $(".field-err", f);
      if (!EMAIL_RE.test(em.value.trim())) { err.textContent = "Please enter an email like name@example.com."; em.setAttribute("aria-invalid", "true"); em.focus(); return; }
      var done = document.createElement("p");
      done.setAttribute("role", "status"); done.className = "serif pull"; done.tabIndex = -1;
      done.textContent = "You’re on the list.";
      f.replaceWith(done); done.focus();
    }
  });
  document.addEventListener("input", function (e) {
    var el = e.target;
    if (el.getAttribute && el.getAttribute("aria-invalid") === "true") {
      if (el.id && document.getElementById(el.id + "-err")) setErr(el, "");
      else { el.removeAttribute("aria-invalid"); var er = el.closest("form") && $(".field-err", el.closest("form")); if (er) er.textContent = ""; }
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var dlg = $("dialog.viewer[open]");
    if (dlg) { dlg.close(); return; }
    if (menuOpen()) { setMenu(false, true); return; }
    if (openInq) { var inside = openInq.contains(document.activeElement); closePanel(openInq, inside); }
  });

  /* ---------- header, menu, reveal ---------- */
  var hdr = $(".site-header"), menuBtn = $("#menu-btn"), menu = $("#mobile-menu");
  function menuOpen() { return menuBtn && menuBtn.getAttribute("aria-expanded") === "true"; }
  function setMenu(open, focusBtn) {
    if (!menuBtn || !menu) return;
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menu.hidden = !open;
    document.body.classList.toggle("menu-open", open);
    if (!open && focusBtn) menuBtn.focus();
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", function () { setMenu(!menuOpen()); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    window.addEventListener("resize", function () { if (window.innerWidth >= 1024 && menuOpen()) setMenu(false); });
  }
  function onScroll() { if (hdr) hdr.classList.toggle("is-stuck", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  function initReveal() {
    var els = $$(".reveal");
    if (!els.length) return;
    if (reduce || !("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- numbers from data ---------- */
  function fillNumbers() {
    var av = availableList(), sold = soldList();
    $$("[data-n-available]").forEach(function (el) { el.textContent = av.length; });
    $$("[data-n-sold]").forEach(function (el) { el.textContent = sold.length; });
    var el = $("[data-size-range]");
    if (el) {
      var sz = av.filter(function (p) { return p.sizeW; });
      var area = function (p) { return p.sizeW * p.sizeH; };
      sz.sort(function (a, b) { return area(a) - area(b); });
      var past = sold.filter(function (p) { return p.sizeW; }).sort(function (a, b) { return area(b) - area(a); })[0];
      if (sz.length) {
        el.textContent = "Available originals from " + norm(sz[0].sizeW, sz[0].sizeH) + " to " + norm(sz[sz.length - 1].sizeW, sz[sz.length - 1].sizeH) +
          (past ? "; past works up to " + norm(past.sizeW, past.sizeH) : "");
      }
    }
  }

  /* ---------- page: home ---------- */
  var AVAIL_PICKS = ["why-not-you", "blaze-your-own-trail", "same-same-but-different-copy-1", "handle-with-care",
    "smiles-original-painting", "im-your-biggest-fan", "perfectly-imperfect", "if-you-listen-you-can-hear"];
  var SOLD_PICKS = ["live-luxuriously-copy", "exit-strategy-copy", "squad-goals-copy", "buy-the-dip-copy", "sensory-overload-copy", "i-want-you-too"];

  function pickCards(handles, el, mHideFrom, o) {
    if (!el) return;
    var out = "", n = 0;
    handles.forEach(function (h) {
      var p = byHandle(h);
      if (!p) return;
      var html = cardHTML(p, o);
      if (mHideFrom != null && n >= mHideFrom) html = html.replace('<article class="card"', '<article class="card m-hide"');
      out += html; n += 1;
    });
    el.innerHTML = out;
  }

  function initHome() {
    var f = byHandle("fire-horse");
    var box = $("#hero-feature");
    if (f && box) {
      var im = f.images[0];
      box.innerHTML = '' +
        '<div class="feature-row">' +
        '<a class="feature-thumb" href="' + url(f) + '" tabindex="-1" aria-hidden="true"><img src="' + img(im.src, 400) + '" width="' + im.w + '" height="' + im.h + '" alt="' + esc(altFor(f)) + '" decoding="async"></a>' +
        '<div class="feature-meta"><h2 class="card-title"><a href="' + url(f) + '">' + esc(f.title) + '</a></h2>' +
        '<p class="caption">' + esc(caption(f)) + '</p><p class="status">Original · Available</p></div></div>' +
        inquiryHTML(f);
    }
    pickCards(AVAIL_PICKS, $("#avail-grid"), 4);
    pickCards(SOLD_PICKS, $("#sold-grid"), 3);
    var sg = $("#shop-grid");
    if (sg) {
      var wanted = [
        ["ghost-chair", "Ghost Chair", SHOP.links.chairs, false],
        ["orange-you-glad-acrylic-tray", "Acrylic trays", "https://angelafabbri.com/products/orange-you-glad-acrylic-tray", true],
        ["flower-bouquet-gray-coaster", "Coasters", SHOP.links.coasters, true],
        ["camel-bloom-big-tote-coffee-break-splatter-1", "Totes", SHOP.links.handbags, true]
      ];
      var html = "";
      wanted.forEach(function (w) {
        var it = null;
        (SHOP.items || []).forEach(function (m) { if (m.handle === w[0]) it = m; });
        if (!it) return;
        var price = (it.priceFrom || w[3] ? "From " : "") + it.price;
        html += '<a class="tile reveal" href="' + w[2] + '" target="_blank" rel="noopener" aria-label="' + esc(w[1] + ", " + price + " (opens the live store)") + '">' +
          '<span class="tile-img"><img src="' + img(it.image.src, 800) + '" srcset="' + srcset(it.image.src, [400, 800]) + '" sizes="(min-width:1024px) 22vw,45vw" width="' + it.image.w + '" height="' + it.image.h + '" alt="' + esc(it.title) + '" loading="lazy" decoding="async"></span>' +
          '<span><span class="tile-title">' + esc(w[1]) + ' ↗</span><br><span class="tile-price">' + esc(price) + '</span></span></a>';
      });
      sg.innerHTML = html;
    }
    // Inversion explainer
    var rev = $("#reveal-btn"), box2 = $("#reveal-box");
    if (rev && box2) rev.addEventListener("click", function () {
      var open = rev.getAttribute("aria-expanded") === "true";
      rev.setAttribute("aria-expanded", open ? "false" : "true");
      box2.hidden = open;
      rev.textContent = open ? "Reveal the messages" : "Hide the messages";
    });
    var flip = $("#flip-btn"), art = $("#explain-art");
    if (flip && art) flip.addEventListener("click", function () {
      var on = flip.getAttribute("aria-pressed") === "true";
      flip.setAttribute("aria-pressed", on ? "false" : "true");
      art.classList.toggle("is-flipped", !on);
      flip.textContent = on ? "Flip the painting" : "Flip it back";
    });
    // lane link text
    initReveal();
  }

  /* ---------- page: paintings ---------- */
  var SERIES = [["all", "All"], ["inversion", "Inversion"], ["rose-pattern", "Rose Pattern"], ["minis", "Minis"], ["ten-by-tens", "Ten by Tens"], ["abstracts-with-attitude", "Abstracts with Attitude"]];

  function initPaintings() {
    var params = new URLSearchParams(window.location.search);
    var series = params.get("series") || "all";
    if (!SERIES.some(function (s) { return s[0] === series; })) series = "all";
    var chips = $("#chips"), gridA = $("#grid-available"), gridS = $("#grid-collected"), toggle = $("#archive-toggle");
    var av = availableList(), sold = soldList();
    var archiveOpen = false;

    function inSeries(p) { return series === "all" || p.series === series; }
    function renderChips() {
      chips.innerHTML = SERIES.map(function (s) {
        var n = av.filter(function (p) { return s[0] === "all" || p.series === s[0]; }).length;
        return '<button type="button" class="chip" data-series="' + s[0] + '" aria-pressed="' + (s[0] === series) + '">' + s[1] + ' <small>' + n + '</small></button>';
      }).join("");
    }
    function renderGrids() {
      var a = av.filter(inSeries), s = sold.filter(inSeries);
      gridA.innerHTML = a.length ? a.map(function (p, i) { return cardHTML(p, { eager: i < 4 }); }).join("") : "";
      $("#empty-available").hidden = a.length > 0;
      $("#result-note").textContent = a.length + " available " + (a.length === 1 ? "work" : "works") + (series === "all" ? "" : " in " + seriesName(series)) + ".";
      toggle.hidden = s.length === 0;
      toggle.textContent = archiveOpen ? "Hide collected works" : "Show " + s.length + " collected " + (s.length === 1 ? "work" : "works");
      toggle.setAttribute("aria-expanded", archiveOpen ? "true" : "false");
      gridS.hidden = !archiveOpen || s.length === 0;
      gridS.innerHTML = archiveOpen ? s.map(function (p) { return cardHTML(p); }).join("") : "";
      $("#empty-collected").hidden = s.length > 0;
      return a.length;
    }
    function seriesName(k) { for (var i = 0; i < SERIES.length; i++) if (SERIES[i][0] === k) return SERIES[i][1]; return k; }
    function setSeries(k, announce) {
      series = k;
      closeAllInquiries();
      renderChips();
      var n = renderGrids();
      try { var u = new URL(window.location.href); if (k === "all") u.searchParams.delete("series"); else u.searchParams.set("series", k); window.history.replaceState(null, "", u.pathname + u.search + u.hash); } catch (e) { /* file:// */ }
      if (announce) say("Showing " + n + " available " + (n === 1 ? "work" : "works"));
    }
    chips.addEventListener("click", function (e) {
      var b = e.target.closest("[data-series]");
      if (!b) return;
      setSeries(b.getAttribute("data-series"), true);
      var again = $('[data-series="' + b.getAttribute("data-series") + '"]', chips); if (again) again.focus();
    });
    toggle.addEventListener("click", function () {
      archiveOpen = !archiveOpen;
      closeAllInquiries();
      renderGrids();
    });
    function checkHash() {
      if (window.location.hash === "#collected") {
        archiveOpen = true; renderGrids();
        var el = $("#collected"); if (el) el.scrollIntoView();
      }
    }
    window.addEventListener("hashchange", checkHash);
    setSeries(series, false);
    checkHash();
  }

  /* ---------- page: detail ---------- */
  function initDetail() {
    var params = new URLSearchParams(window.location.search);
    var p = byHandle(params.get("handle") || params.get("h") || DEFAULT_HANDLE) || byHandle(DEFAULT_HANDLE) || P[0];
    if (!p) return;
    document.title = p.title + " by Angela Fabbri | Fabbriology Fine Art";
    var ims = p.images, cur = 0;
    var serie = p.series === "other" ? "" : p.seriesLabel;
    var crumbs = $("#crumbs");
    crumbs.innerHTML = '<a href="paintings.html">Paintings</a>' + (serie ? ' / <a href="paintings.html?series=' + p.series + '">' + esc(serie) + '</a>' : "") + (p.available ? "" : ' / <a href="paintings.html#collected">Collected</a>');
    $("#d-title").textContent = p.title;

    var stage = $("#stage"), thumbs = $("#thumbs");
    function main(i) {
      cur = i;
      var im = ims[i];
      stage.innerHTML = '<button type="button" class="zoom" id="zoom" aria-label="View larger: ' + esc(p.title) + '">' +
        '<img src="' + img(im.src, 1200) + '" srcset="' + srcset(im.src, [800, 1200, 1600]) + '" sizes="(min-width:1024px) 58vw,92vw" width="' + im.w + '" height="' + im.h + '" alt="' + esc(i === 0 ? altFor(p) : p.title + ", view " + (i + 1) + " of " + ims.length + ", by Angela Fabbri") + '"' + (i === 0 ? ' fetchpriority="high"' : "") + '></button>';
      $$("button", thumbs).forEach(function (b, j) { if (j === i) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
      $("#zoom").addEventListener("click", openViewer);
    }
    if (ims.length > 1) {
      thumbs.innerHTML = ims.map(function (im, i) {
        return '<button type="button" class="thumb" aria-label="Show view ' + (i + 1) + " of " + ims.length + '"><img src="' + img(im.src, 200) + '" width="' + im.w + '" height="' + im.h + '" alt="" loading="lazy" decoding="async"></button>';
      }).join("");
      thumbs.addEventListener("click", function (e) { var b = e.target.closest(".thumb"); if (b) main($$(".thumb", thumbs).indexOf(b)); });
    }
    main(0);

    // spec rows
    var rows = [["Medium", p.medium || "Original painting"]];
    if (p.size) rows.push(["Size", p.size]);
    if (serie) rows.push(["Series", serie]);
    rows.push(["Edition", "Original, 1 of 1"]);
    rows.push(["Status", p.available ? "Available" : "Sold. Commission inquiries welcome."]);
    $("#spec").innerHTML = rows.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("");

    // inquiry (button and dropdown; commission mode for sold works)
    $("#d-inq").innerHTML = inquiryHTML(p);

    // about
    var about = "";
    if (p.story) about += "<p>" + esc(p.story) + "</p>";
    var hasMsg = p.repeated || p.hidden;
    if (hasMsg) {
      about += '<dl class="msgs">' + (p.repeated ? "<dt>Repeated</dt><dd>" + esc(p.repeated) + "</dd>" : "") + (p.hidden ? "<dt>Hidden</dt><dd>" + esc(p.hidden) + "</dd>" : "") + "</dl>";
    }
    about += "<p>Angela’s backwards messages start in the top right corner. Certificate of authenticity included.</p>";
    $("#about-body").innerHTML = about;

    // related
    var rel = availableList().filter(function (q) { return q.handle !== p.handle && q.series === p.series; });
    var title = p.available && rel.length >= 2 ? "More available " + (serie || "works") : "Available now";
    if (!(p.available && rel.length >= 2)) rel = availableList().filter(function (q) { return q.handle !== p.handle; });
    $("#related-title").textContent = title;
    $("#related").innerHTML = rel.slice(0, 4).map(function (q) { return cardHTML(q); }).join("");

    // viewer
    var dlg = $("#viewer");
    var vimg = $("#viewer-img"), vcount = $("#viewer-count");
    function showV(i) {
      cur = (i + ims.length) % ims.length;
      vimg.src = img(ims[cur].src, 1600);
      vimg.alt = p.title + ", view " + (cur + 1) + " of " + ims.length + ", by Angela Fabbri";
      vcount.textContent = (cur + 1) + " / " + ims.length;
    }
    function openViewer() {
      if (!dlg || !dlg.showModal) return;
      showV(cur);
      dlg.showModal();
    }
    if (dlg) {
      $("#viewer-close").addEventListener("click", function () { dlg.close(); });
      $("#viewer-prev").addEventListener("click", function () { showV(cur - 1); main(cur); });
      $("#viewer-next").addEventListener("click", function () { showV(cur + 1); main(cur); });
      if (ims.length < 2) { $("#viewer-prev").hidden = true; $("#viewer-next").hidden = true; }
      dlg.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { showV(cur - 1); main(cur); }
        if (e.key === "ArrowRight") { showV(cur + 1); main(cur); }
      });
      dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
      var x0 = null;
      dlg.addEventListener("touchstart", function (e) { x0 = e.changedTouches[0].clientX; }, { passive: true });
      dlg.addEventListener("touchend", function (e) {
        if (x0 == null) return;
        var dx = e.changedTouches[0].clientX - x0; x0 = null;
        if (Math.abs(dx) > 50 && ims.length > 1) { showV(cur + (dx < 0 ? 1 : -1)); main(cur); }
      }, { passive: true });
    }
  }

  /* ---------- boot ---------- */
  function boot() {
    fillNumbers();
    var page = document.body.getAttribute("data-page");
    if (page === "home") initHome();
    else if (page === "paintings") initPaintings();
    else if (page === "detail") initDetail();
    else initReveal();
  }
  boot();
})();
