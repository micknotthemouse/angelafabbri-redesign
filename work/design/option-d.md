# Option D, "Studio Index": design spec
2026-10-26. Phase: design. Build target `docs/option-d/` (index.html, paintings.html, painting.html, portfolio.html, data.js, build-data.mjs, style.css, app.js). D1 to D9 and D11 bind. Tokens below come from the saved Isembard source (`work/research/isembard/capacity.html`).

## 1. Concept and name
**Studio Index.** Tagline: *Every original, numbered and on the record.*

Isembard reports on a factory network like an engineering document. D documents Angela's studio the same way:
- numbered chapters (01 Work, 02 Artist, 03 Collect);
- every painting a numbered "Fig." with a mono spec table, a status pill and a counter;
- records instead of puffery;
- a CTA closing every chapter.

The chrome is monochrome (near-black or paper-white) and her paintings are the only color. Precision in the frame makes the color hit harder.

Checked while designing: Inversion lettering uses **mirrored glyphs** in reverse order (seen in MIN_0031_E and Ape In), so a horizontal flip makes the text readable. Prickly Delight's only image is a styled room view, which serves rule 14. Builder: confirm both at 1200px.

## 2. Palette and typography
| Token | Light | Dark | Use |
|---|---|---|---|
| `--canvas` | #f1f2f3 | #0d0d0d | page ground |
| `--surface` | #ffffff | #1a1a1a | cards, dropdown sheet, tiles |
| `--field` | #e6e6e6 | #23272c | image mat, inputs |
| `--ink` | #0d0d0d | #f1f2f3 | text, primary button fill |
| `--muted` | #6b6b6b | #a6a6a6 | captions, chapter numerals (≥4.5:1) |
| `--edge` / `--edge-strong` | ink 14% / 32% (color-mix) | same | hairlines / input borders, crosshairs |
| `--accent` | #946200 | #e2d45c | Available dot, focus ring, success dot, active filter underline only |
| `--pill` | #0d0d0d on #f1f2f3 text | #23272c, same text | header pills |

The accent is one gold family: Isembard's straw on dark and its signal amber on light, so it holds at least 3:1 on both grounds. It is never used for body text or fills. Sold is muted text inside an outline pill, never red. The only gradient is a 3px footer top rule using Isembard's footer gradient (#e2d45c → #ccad60 → #aa8c64).

**Fonts:** one link, `family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap`. Geist stands in for Isembard Sans and Geist Mono for Isembard Mono. Curl the CSS once; if it isn't 200, use Inter Tight + JetBrains Mono. The serif stand-in would be Newsreader, but **do not load it**: Isembard uses its serif once, and the brief caps families at two.

| Role | Font | Size (390 → 1440) | Wt | Tracking | LH |
|---|---|---|---|---|---|
| Hero statement | Geist | clamp(34px, 1.5rem + 5vw, 84px) | 500 | -0.04em | 1.02 |
| Chapter numeral and word | Geist | clamp(56px, 14vw, 150px) | 500 | -0.055em | 0.9 |
| Heading | Geist | clamp(24px, 1rem + 2vw, 40px) | 500 | -0.025em | 1.15 |
| Title | Geist | 18 → 20px | 500 | -0.015em | 1.3 |
| Editorial, quotes | Geist | 20 → 22px | 400 | -0.01em | 1.4 |
| Body | Geist | 16 → 17px | 400 | 0 | 1.5 |
| Label (spec values) | Geist Mono | 13px | 400 | 0 | 1.43 |
| Control (buttons, pills) | Geist Mono | 13px uppercase | 500 | 0.02em | 1 |
| Micro (sub-numbers, Fig., counters) | Geist Mono | 11px uppercase | 400 | 0.04em | 1.35 |
| Stat numerals | Geist | clamp(56px, 1.5rem + 6vw, 112px) | 500 | -0.055em | 0.9 |

## 3. Layout system
- **Grid:** content width `min(100% - 2*var(--gutter), 1440px)` with `--gutter: clamp(16px, 5.2vw, 75px)` (Isembard's). Gap 10px for tiles, 24px for cards. Prose max 38rem.
- **Spacing:** 4/8/12/16/24/32/48/64/96. Sections pad `clamp(48px, 1.5rem + 6vw, 96px)`; chapters pad `clamp(80px, 10vw, 144px)`.
- **Radii:** 6 for buttons and inputs, 8 for tiles, 12 for cards and the sheet, 16 for the hero panel, 999 for pills.
- **Lines:** 1px `--edge` hairlines; every chapter opens with a full-width rule. Decorative 9px "+" crosshairs (aria-hidden) sit at the rule's ends.
- **Buttons:** mono uppercase 13px, min-height 44px, padding 0 16px, radius 6.
  - Primary: ink fill, canvas text. Secondary: surface with a 1px edge inset. Ghost: transparent.
  - Hover: Isembard's rolling label. The label sits twice in an overflow-hidden span (the second copy aria-hidden) and slides up in 240ms on hover and focus-visible, with a 6% tint.
- **Status pills:** height 22, mono 11px uppercase.
  - `Available`: 6px accent dot, ink text on field.
  - `Sold`: muted text, 1px edge-strong outline.
  - `Commission`: dashed outline.
- **Motion** uses Isembard's tokens: 80/160/240/440ms; ease-out `cubic-bezier(.23,1,.32,1)`; sheet `cubic-bezier(.32,.72,0,1)`.
  - Scroll reveal (fade plus 12px rise, 440ms) only behind `@supports (animation-timeline: view())`, with an IntersectionObserver fallback.
  - Hero "focus pull": the sharp photo goes from `blur(14px)` to 0 in 900ms. Opacity stays 1 so LCP is not delayed.
  - Dropdown: grid-rows 0fr to 1fr, 240ms. Remove `hidden`, add `.open` on the next frame, and re-add `hidden` on `transitionend`.
  - `prefers-reduced-motion` cancels all of it and jumps to end states.
  - No autoplay, no scroll-jacking, no count-up numbers.
- **Theme:** System / Light / Dark as a fieldset of 3 radios styled as one segmented mono control, placed in the "+" panel and the footer.
  - Stored in `localStorage['afd-theme']` inside try/catch. Default is `system`.
  - An inline head script, placed before the CSS, sets `html[data-theme]` so the page doesn't flash.
  - CSS: light tokens on `:root`; dark under `[data-theme=dark]` and under `@media (prefers-color-scheme: dark){:root:not([data-theme=light])}`. `system` removes the attribute.
  - 

## 4. Navigation and header
- **Header:** sticky and transparent. Each pill has its own dark fill, so contrast holds over the photo in both themes (fixes C7). `html{scroll-padding-top:72px}`.
  - Left: logo pill `FABBRIOLOGY`. The first F is mirrored (aria-hidden span, `scaleX(-1)`) with sr-only "Fabbriology".
  - Centre (≥1024): `WORK` `ARTIST` `COLLECT` `PAINTINGS`.
  - Right: an accent-outlined `FOR DESIGNERS & GALLERIES` pill → portfolio.html (D1), then a square `+` pill.
- **"+" panel:** a disclosure, not a modal. `aria-expanded`; Escape closes and returns focus. It opens as a surface sheet with radius 12, max 420px, right-aligned, in three columns:
  - **Collect:** Request info (→ index.html#work), Commission a piece (→ #commission), For designers & galleries.
  - **Studio:** Bio, Press, Shop, Contact, linking to the live pages with `title="Built in the next phase"`.
  - **Theme:** the segmented control.
- **Mobile (<1024):** logo, a `FOR DESIGNERS` pill (same target) and `+` fit on one line (about 290px). The centre links move into the panel.

## 5. Homepage
**Hero (unnumbered).** An inset panel: margin 8 (12 on desktop), radius 16, `inset 0 0 120px rgba(0,0,0,.45)` vignette.
- **Background:** `MIN_0031_E.jpg?width=400` as a CSS background, `blur(40px) saturate(1.3)`, scaled 1.2, under a rgba(13,13,13,.35) scrim. Her wall of paintings becomes a color field, which is Isembard's blurred-photo treatment.
- **White text in both themes:**
  - Micro: `ANGELA FABBRI · HOUSTON, TX · PROFESSIONAL SINCE 2017`.
  - H1: **"Angela Fabbri paints backwards."**
  - Sub: "Houston contemporary realist. Hidden messages, kaleidoscopic color, collected internationally."
- **Sharp figure (D3):** MIN_0031_E (srcset 800/1600), natural 3:2 and never cropped, radius 8, with the focus pull.
  - Alt: "Angela Fabbri seated on a stool in a white gallery, surrounded by her Inversion paintings with mirrored lettering."
  - Caption: `FIG. 00 · THE ARTIST WITH HER INVERSION SERIES`.
- **Featured card** (surface, radius 12):
  - `prickly-delight` thumbnail (room view; 72x90 on mobile, 120x150 on desktop, cover).
  - `FEATURED · FIG. 01` with an `Available` pill.
  - "Prickly Delight", with `Inversion · Acrylic on wood panel · 36 x 48 in`.
  - Primary **Request info** with the dropdown underneath.
  - Below: "For designers & galleries →" and "Meet Angela ↓".
- **Mobile:** header 56, eyebrow + 2-line H1 about 110, photo 366x244, then the card. The Request info bottom lands at about 560px. **Acceptance: fully visible at 390x664**, also checked at 390x844. On mobile the sub-line goes below the card.
- **Desktop:** a 12-column grid inside the panel with `min-height:min(88svh,860px)`. Text in columns 1 to 6, bottom-aligned; photo in columns 7 to 12. The card sits in a fixed grid row under the photo with `align-self:start`, so opening grows the panel downward and never moves the button (C5).

**Press strip** (Isembard's logo strip):
- Micro `AS FEATURED IN`, then seven surface tiles (radius 8, height 64) with text wordmarks in Geist 500 18px: Vogue, The Washington Post, Houston Chronicle, Modern Luxury, Paper City, The Book of Lists, The Round Top Show Guide.
- 2, 4 or 7 columns by width. No marquee.
- Credential pills below: `FLORENCE BIENNALE 2019` · `MIAMI ART WEEK` · `SOLO EXHIBITION, MARFA TX` · `SELECTED BY MOCA LOS ANGELES FOR A HOUSTON GROUP EXHIBITION, 2017`.

**01 Work** (opener: muted `01`, ink `Work`)
- **01.1 Available now.** Heading "Originals, one of one.", counter `08 / 51` (computed).
  - Eight available works that no other option's homepage uses: `country-games-green`, `water-me-silver-22`, `this-is-my-good-side-original-painting` (Fall For Me), `i-dont-understand-you-either-original-painting-1` (48 x 48), `black-bird`, `giraffe`, `saguaro-cactus-ten-by-ten-collection`, `water-me-pink-22-copy`.
  - 1, 2 or 4 columns by width.
- **01.2 How to read an Inversion.** The **Inversion Reader** is a product-UI mockup, like Isembard's MasonOS card.
  - A surface panel with a window bar: micro `INVERSION READER · FIG. 02 · APE IN` and an `ORIGINAL | MIRRORED` toggle (aria-pressed).
  - Left: the `ape-in-original-painting` image. MIRRORED applies `scaleX(-1)`.
  - Right: a readout with hairline rows: `01 Start` Top right corner · `02 Read` Right to left · `03 Repeated` DIAMOND HANDS · `04 Hidden` [Reveal] → HODL · `Status` Available.
  - An aria-live note: "Mirrored: the lettering now reads left to right."
  - Request info for Ape In below.
  - If the mirror check fails, keep Reveal only.
- **Chapter-end CTA bar** (every chapter): a hairline-topped row with micro `NEXT STEP` and buttons. Here: primary `See all 51 available paintings`, secondary `Commission a piece`.

**02 Artist**
- **02.1 Meet Angela.**
  - `BS1A0457.jpg?width=1200` at 3:4, lazy. Alt: "Angela Fabbri seated on a wooden crate in front of her painting in a gallery corridor."
  - Copy: "Angela Fabbri took her first commission at sixteen and has painted professionally since 2017. Self-taught, California born, Mississippi raised and Texas based, she is known for backwards text and contemporary realism in bold color. Baccarat, Thrillist and Dos Equis have invited her to paint live."
  - Isembard-style timeline (mono when/where, Geist line):
    - `AGE 16` First commission.
    - `2017 · HOUSTON` Selected by MOCA Los Angeles for a group exhibition.
    - `2018 · NEW YORK` Selected again by an assistant curator for the Whitney.
    - `2019 · FLORENCE` Florence Biennale.
    - `2019 · HOUSTON` Three-month popup gallery at River Oaks District, beside Harry Winston and Hermès.
- **02.2 On the record.** A quote-block carousel: scroll-snap row, prev/next pills, aria-live counter `01 / 04`.
  - Card 1 is the only real quote: "California is where the dreamer in me was born, Mississippi taught me to slow down, and in Texas I learned the value in that stillness." `ANGELA FABBRI · ARTIST · FABBRIOLOGY FINE ART`.
  - Cards 2 to 4 are records **without quote marks**:
    - "Selected her work for a group exhibition in Houston." `MOCA · LOS ANGELES · 2017`
    - "Selected her work." `ASSISTANT CURATOR · WHITNEY MUSEUM · 2018`
    - "Invited her to paint live." `BACCARAT · THRILLIST · DOS EQUIS`
  - Collector quotes pending from Angela; never invent one.
- **02.3 By the numbers.** Four stat tiles (numeral, label, micro source):
  - `25+` Years creating (bio).
  - `2017` Professional since (bio).
  - `100s` Private and corporate collections (bio).
  - `51` Originals available now (computed at runtime).
  - Then the table **Exhibitions & selections**, in the style of Isembard's roles table (Year | Event | Place):
    - 2019 | Florence Biennale | Florence, Italy
    - — | Solo exhibition | Marfa, TX
    - Consecutive years | Miami Art Week | Miami, FL
    - 2017 | Selected by MOCA Los Angeles | Houston group exhibition
    - 2018 | Selected by a Whitney assistant curator | New York
    - 2019 | Popup gallery, three months | River Oaks District, Houston
  - Years the bio doesn't give stay "—".
- **CTA bar:** `Her full story` (live bio), primary `Request info` → #work.

**03 Collect**
- **03.1 For designers & galleries.**
  - Numbered list:
    - `01` Ready-to-ship originals from 10 x 10 in to 50 x 50 in (computed).
    - `02` Commissions sized and colored for a specific room.
    - `03` High-resolution images, dimensions and CV on request.
    - `04` One email, a personal reply within 1 business day (placeholder).
  - Image: `installation-fabbri-best-houston-artist.ai-01-01-01.jpg?width=1200`, 1:1, caption "Bloom Big, a living-art installation in a Houston Medical Center hotel, as reported by CultureMap Houston." (verified in the C build).
  - CTAs: `View the portfolio`, `Email the studio` (mailto).
- **03.2 Commission a piece** (`#commission`).
  - Process row: `01 Tell her the room and size` · `02 She proposes palette and message` · `03 You approve, she paints`. This wording is unconfirmed; flag it to Angela.
  - Button `Commission a piece` opens the dropdown in commission mode: chip "About: A new commission", hidden reference "Commission inquiry", success "Commission inquiry sent to angela@fabbriology.com".
- **03.3 Recently collected.** "Collected. Yours can be next.", counter `04 / 54`.
  - Sold cards: `live-luxuriously-copy-copy` (Squad Goals), `black-tie-affair-copy` (Exit Strategy), `kiss-me-like-you-need-me`, `i-dont-understand-you-either-green`.
  - D9 buttons. One column on mobile.
- **CTA bar:** `See the collected archive` → paintings.html#collected, primary `Commission a piece`.

**2-click rule.** Click 1 is Request info on the hero card (first screen at 390x664), which opens the dropdown in place. Type, then click 2: Send. This holds for every card.

## 6. Paintings page
- **Head:** micro `01 WORK / PAINTINGS`, heading "Every original, indexed.", counter `51 AVAILABLE · 54 COLLECTED`.
- **Filter pills:** All, Inversion, Rose Pattern, Minis, Ten by Tens, AWA (title "Abstracts With Attitude"), each with its available count from `AF.series`.
  - State lives in `?series=` (`location.search`; `replaceState` in try/catch). The hash is reserved for `#collected` (B1).
  - Works with no primary series appear under All only.
  - Active pill: ink fill with a 2px accent underline.
- **View toggle `GRID | INDEX`.** Index is the same card markup with `.is-index`: rows with a 64px thumbnail, title, series, size, medium, pill and button. The dropdown opens full-width under the row.
- **Order and archive:** available works first. A `role="switch"` reading "Show 54 collected works" reveals the Collected section, which respects the filter. `#collected` turns it on at load.
- **Card:**
  - `--field` mat at 4:5, contain (art never cropped). Room shots (`room:true`) use cover. Explicit width/height; lazy after the first 4.
  - Micro `FIG. 014` (position in the list) and the status pill.
  - Title links to painting.html?handle=.
  - Mono `dl` with Series · Medium (short) · Size.
  - Full-width button.
  - Surface fill, radius 12, hairline border.
- **Dropdown:** one component, mode taken from `available`. Only one is open at a time; Escape closes it and restores focus.
  1. **Closed:** `Request info`.
  2. **Open:** a sheet with chip `ABOUT: <TITLE>`; mono labels Name, Email, Note (optional); the line "Price on request · Original, 1 of 1 · Certificate of authenticity included · Reply within 1 business day"; `Send` and ghost `Cancel`. Native validation, with inline errors shown as text plus an icon.
  3. **Sent:** the fields collapse to an accent-dot status, "Sent to angela@fabbriology.com" (aria-live), plus "Get notified of new works" (mailto). The trigger becomes `Request sent ✓`. No network call.
- **D9:**
  - The image stays undimmed and the pill reads Sold.
  - Button: `Sold · Submit commission inquiry`.
  - Chip `COMMISSION · INSPIRED BY <TITLE>`, hidden reference "Commission inquiry inspired by <title>".
  - Success: "Commission inquiry sent to angela@fabbriology.com". The trigger then reads `Sold · Commission inquiry sent ✓`.
- No-JS: mailto link only.

## 7. Painting detail page
- **Breadcrumb:** micro `01 WORK / INVERSION / FIG. 07 OF 51`, with prev/next pills through the same list (available or collected). An unknown handle shows "Painting not found" with a link back.
- **Layout:** 7/5 columns on ≥1024.
  - Image stage: field mat, radius 12, contain, srcset 800/1600, `fetchpriority="high"`. Thumbnails below with counter `01 / 03`.
  - Click opens a vanilla `<dialog>` lightbox, images only (C9).
  - Inversions get a `MIRRORED` toggle (Reader logic).
- **Sticky panel** (top 80):
  - Title and pill.
  - **Spec table**, in the spirit of Isembard's attributed blocks and factory tables. Hairline rows, mono label, Geist value:
    - Series
    - Medium
    - Size (`36 x 48 in · 91 x 122 cm`, ×2.54 rounded)
    - Repeated message
    - Hidden message (Reveal)
    - Edition: Original, 1 of 1
    - Certificate: Included
    - Price: On request
  - Then Request info and dropdown, or D9 on sold works.
  - Then the about text and a one-line "How to read it" for Inversions.
- **Related:** "More from <series>", a scroll-snap row of up to 8 cards (available first) with prev/next pills and counter `01 / 06`. It's a labelled `tabindex=0` region. The cards carry the same inline forms, and an opened card scrolls fully into view.
- **CTA bar:** `Commission a piece`, `For designers & galleries`.

## 8. Portfolio stub
- Micro `03.1 COLLECT / PORTFOLIO`, heading "Portfolio for designers & galleries", line "The full portfolio builds in the next phase."
- A plain grid of the first six artwork entries with a `matchedImage` in `source/data/portfolio-structure.json`, baked as `AF.portfolio`, with mono captions. Each links to painting.html when a store handle matches. No forms.
- The four trade facts, `Email the studio`, and `Download PDF portfolio` (live press page, next-phase title).

## 9. Footer
- Canvas ground, 3px gradient top rule, four columns (stacked on mobile):
  - **Studio:** "Fabbriology Fine Art · Houston, Texas", `angela@fabbriology.com` with a `COPY` pill (Isembard's copy-to-clipboard; `COPIED` for 2s).
  - **Index:** Work, Artist, Collect, Paintings, Portfolio.
  - **Elsewhere:** Instagram, Facebook.
  - **Theme:** segmented control.
- Micro bottom row: `© 2026 FABBRIOLOGY FINE ART` · `DEMO BUILD, NOTHING IS SENT` · `DEMO D` → `../index.html`. No fixed badge.

## 10. Accessibility and performance
- **Semantics:** skip link, landmarks, one H1 per page; sub-numbers sit inside headings (`<span class="num">01.1</span> Available now`).
- **Keyboard:** real buttons and links, 44px targets. `:focus-visible` is a 2px accent outline at 3px offset, and it reads on photos because pills and cards are solid.
- **States:** `aria-expanded`/`aria-controls` on dropdowns and the panel. Carousels are labelled regions with live counters. The theme uses native radios; the Reader uses aria-pressed.
- **Color is never the only signal.** Muted text is at least 4.5:1 and the accent at least 3:1 in both themes; check both at 390 and 1440.
- **Performance:**
  - LCP is the 3:2 hero photo with width/height set; the blurred background uses the 400px file.
  - Everything below the fold is lazy and async-decoded. Preconnect to the CDN and Fonts hosts.
  - 2 families, 5 weights. No libraries, no ES modules (file://).
  - Targets: LCP ≤2.5s, CLS ≤0.1.
- **Data:** copy `docs/site/build-data.mjs` without the shop output. It emits `window.AF={series,paintings,portfolio}` with the price-free whitelist (D2) and keeps its HEIC rule. Assert no `.heic`, no `price` keys and 51 available. Relative links only (D8).

## 11. Why this converts, and tradeoffs versus After Hours
**Converts:**
- Request info appears in the first phone screen inside a card that already answers what, how big and what medium.
- Credentials appear as records and tables, so they read as verifiable rather than as claims. That answers the trust barrier.
- The Index view and the inch/cm spec tables serve designers better than any earlier option.
- Every chapter ends in a CTA.
- Sold works feed commissions (D9).
- The Reader makes her signature trait into an interaction people remember.

**Versus After Hours:**
- C sells mood; D sells credibility.
- The light theme and the field mat answer C's recorded risk: dark ground fighting light paintings and hiding image edges.
- Costs:
  - D is cooler and less romantic, and engineering cues may feel corporate for a joyful-color brand.
  - The theme doubles visual QA.
  - Mono density may be skimmed.
  - 02.2 leans on records until Angela supplies collector quotes.
- Build cost is about C's plus roughly 20% for the theme, Reader and Index view. Run cost is identical (static).
- **How it fails:** too many pills and numbers drown the art. Keep pills to status, and give images at least 60% of each card.
- **Runner-up:** a dark-only build closer to the reference. It lost because it repeats C's dark-ground risk and drops Isembard's signature theme toggle.
