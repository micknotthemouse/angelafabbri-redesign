# Option B: "Mirror Studio" (Color-Forward Studio)
Tagline: **Messages backwards. Color forwards.**
Build target `docs/option-b/`: index.html, paintings.html, painting.html, portfolio.html, assets/styles.css, assets/app.js, assets/paintings-data.js. D1 to D9 and brief rules 1 to 18 are binding.

## 1. Concept
Angela is the brand: her mirror-lettering and kaleidoscopic palette become the site's design language, with mirrored section markers, one color block per section and oversized type. The art always sits on paper or white, so color frames the work. Every scroll stop shows a real painting with a one-click inquiry, and sold works become commission leads.

## 2. Palette and typography
- `--paper` #FAF7F2 page background · `--white` #FFFFFF inquiry panel and wells on color blocks · `--well` #F1ECE4 wells behind paintings on paper · `--ink` #15121A text, ink sections, borders · `--meta` #5E5866 captions on paper (about 6.4:1) · `--meta-on-ink` #BDB6C4 captions on ink (about 9:1).
- Color from the works: `--pink` #FF2E88 primary buttons with ink text (about 5.2:1) and mirrored accent words (34px+, weight 800 only) · `--turq` #00B3B8 Inversion block, ink text (about 7:1) · `--sun` #FFC93C hard offset blocks, credential separators, newsletter block · `--tang` #FF6A2B shop section rule only.
- States: `--sold-bg` #E9E4DC Sold pill with ink text · `--error` #B0124F error text on white (about 6.4:1).
- Rules: at most one color block per section. Paintings always sit in a `--well` or `--white` frame, never directly on color. Body text never in an accent color. Pink only for primary buttons and mirrored accent words. Sold is ink-on-grey, never red. (More color than brief section 6 suggests, on purpose.)

Fonts, one `<link>` with preconnects: `https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap`. Syne (drawn for an art center) is loud at 800; Inter carries everything read.
- H1: Syne 800, clamp(34px, 6.4vw, 104px), line-height 0.98, tracking -0.02em.
- H2: Syne 800, clamp(30px, 4.6vw, 68px), 1.0, -0.015em.
- Mirrored marker: Syne 800, clamp(64px, 16vw, 220px), 0.8, -0.03em.
- H3 card title: Syne 700, 18px mobile / 20px desktop, 1.15.
- Eyebrow/label: Inter 600, 12px uppercase, 0.12em tracking.
- Body: Inter 400, 16px mobile / 18px desktop, 1.6. Caption: Inter 400/500 14px, 1.45. Button: Inter 600 16px.

## 3. Layout system
- Grid: 4 columns under 768px (16px gutters, 20px margins); 8 columns 768 to 1023 (24px); 12 columns 1024+ (24px). Max width 1360px; margins `clamp(20px, 5vw, 64px)`; text max 62ch.
- Spacing (px): 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Section padding 64 mobile, 128 desktop.
- Never crop a painting: wells are `aspect-ratio: 4/5`, `object-fit: contain`, 16px padding. Photos of Angela, studio and rooms use `cover`: hero 3:2, portrait 4:5, studio strip 1:1.
- Radius 0 everywhere (stencil-cut edges) except 999px on chips and pills.
- No blurred shadows. One device: hard offset block `box-shadow: 10px 10px 0 var(--sun)` (8px mobile) on the hero tile, portrait, inquiry panel and card hover.
- Motion: card hover lifts image 4px plus offset block, 160ms. Sections fade up 16px, 400ms, via IntersectionObserver (enhanced behind `@supports (animation-timeline: view())`). Panel opens via `grid-template-rows` 0fr to 1fr, 220ms. Reduced motion: no transforms, reveals or flip animation; panels open instantly. No autoplay, marquee or scroll-hijacking.
- Mirror device: `.mirror { display:inline-block; transform: scaleX(-1); }`; DOM text stays normal so screen readers read it. Markers are `aria-hidden="true"`, placed behind the top edge of a real H2. Never mirror body text, buttons, labels or captions.

## 4. Navigation and header
- Sticky header, 56px mobile / 68px desktop, paper, 2px ink bottom rule. Wordmark "ANGELA FABBRI", Syne 800 20px, plain, links to index.html.
- Desktop links (Inter 500 15px): Paintings (paintings.html), Shop (index.html#shop), About (index.html#meet), Contact (#contact). Right: outlined ink pill "For designers & galleries" (portfolio.html). Current page: 3px pink underline.
- Mobile: wordmark + "Menu" button (`aria-expanded`). Opens a full-width disclosure panel below the header (not a modal): the four links in Syne 28px, then a full-width pink block "For designers & galleries / Portfolio, sizes and commissions". Esc or second tap closes; focus returns to the button.
- Request info is never in the header; it lives on the hero, every painting card and detail page. The trade lane: header, hero link, homepage ink section, footer.
- Panels use `scroll-margin-top: 80px`; no sticky bottom bars.

## 5. Homepage (index.html), in order
**5.1 Hero (D3, 2-click).**
- Photo `https://angelafabbri.com/cdn/shop/files/MIN_0031_E.jpg?v=1737578050&width=1600` (srcset 800/1200/1600, width 4928 height 3280, `fetchpriority="high"`, eager), alt "Angela Fabbri at her studio open house, surrounded by her paintings".
- Overlapping bottom right, the Fire Horse tile `https://cdn.shopify.com/s/files/1/0052/8334/8544/files/Fire_Horse.jpg?v=1777475793&width=800` (srcset 400/800, width 3988 height 4779), 6px white border, `--sun` offset block, alt "Fire Horse by Angela Fabbri, a horse in layered color with backwards lettering".
- Mobile: photo full-bleed 3:2; tile 36vw, 20px from the right, translated down 24% into the text area. Desktop: photo columns 1 to 7; tile 34% of photo width, `translate(18%, 14%)`; text columns 8 to 12, vertically centered.
- Eyebrow "ANGELA FABBRI · HOUSTON, TEXAS". H1 `Messages <span class="mirror accent">backwards</span>. Color forwards.` Sub (who she is): "Houston painter of the Inversion series, collected internationally and shown from the Florence Biennale to Miami Art Week."
- Caption "Now available: **Fire Horse** · Acrylic on wood panel · 24 x 30 in", then pink "Request info" (request mode, Fire Horse) and text link "For designers & galleries →".
- Acceptance: at 390x844 the Request info button's bottom edge is at most 760px from the top on load. If it misses, change the photo to 16:10; never shrink the button.

**5.2 Credential strip.** Ink band, paper text, wraps, no motion. Row 1 (Inter 600 14px caps, `--sun` "·"): "Florence Biennale 2019 · Solo exhibition, Marfa TX · Miami Art Week, consecutive years · Selected by MOCA Los Angeles for a group exhibition, 2017 · Selected by a Whitney assistant curator, 2018". Row 2: "As seen in" then Syne 700 18px: Vogue, The Washington Post, The Houston Chronicle, Modern Luxury, Paper City.

**5.3 Available now.** Marker mirrored "AVAILABLE", pink at 20% opacity. H2 "Available now". Sub "Originals, one of one. Ask about any piece and Angela replies personally." Eight request-mode cards: green-goddess, neon-roses (title "Now or Never"), im-expensive, handle-with-care, smiles-original-painting, why-not-you ("Lucky You!"), painted-bunting, bloom-big-blue-22. No `.heic` sources in curated slots. Under 768px: horizontal scroll-snap row (cards 82vw, next card peeking, "Swipe for more" hint). 768+: 2 columns; 1024+: 4 columns, `align-items: start` so an open panel grows only its own card. Then outlined ink button "See all N available paintings", N from data.

**5.4 How to read an Inversion.** Full `--turq` block. Left: Fire Horse in a white well with a "Flip it" toggle (`aria-pressed`, `scaleX(-1)`, 300ms). Builder views the image once: if the letters are mirror glyphs, label it "Flip it to read it". Right: H2 "How to read an Inversion"; three steps with Syne 800 48px numerals: "Start in the top right corner." / "Find the repeated message: HORSE." / "Hunt for the hidden one." plus a "Reveal it" button showing "FIRE" (`aria-live="polite"`). Then a second Fire Horse inquiry (unique ids per instance).

**5.5 Meet Angela** (id `meet`). Paper. Portrait `https://angelafabbri.com/cdn/shop/files/BS1A0457.jpg?v=1738073980&width=900` (1500x1995, 4:5, `--sun` offset), alt "Portrait of Angela Fabbri". Marker "ANGELA". H2 "A journal in paint." Pull quote (Syne 700 24px, portfolio cover): "California is where the dreamer in me was born, Mississippi taught me to slow down, and in Texas I learned the value in that stillness." Body: "Angela took her first commission at 16 and has painted professionally since 2017. Her contemporary realism, kaleidoscopic color and backwards-lettered Inversion series hang in hundreds of private and corporate collections. She has live-painted for Baccarat, Thrillist and Dos Equis, and opened a 2019 pop-up gallery in Houston's River Oaks District." CTAs "Her story" (https://angelafabbri.com/pages/bio, new tab) and "Browse available work". Studio strip, 1:1, lazy, `https://angelafabbri.com/cdn/shop/files/<name>?width=600`: live-paintning-fresh-arts-houston-artist-01.png "Live painting, Fresh Arts Houston"; river-oaks-district-houston-artist-01.png "Pop-up gallery, River Oaks District, 2019"; florence-biennale-best-houston-artist-01.png "Florence Biennale, 2019".

**5.6 For designers & galleries** (D1). Ink block. Marker "TRADE" in pink. H2 "For designers & galleries". Sub "Originals ready to place, commissions sized to the room, and a portfolio you can scan in a minute." Three facts (Syne 700 20px): "Sizes from 11 x 14 in minis to 40 x 60 in statement panels" (confirm extremes from data), "Commissions in her palette and lettering, made to your dimensions", "Portfolio, CV and press on one page". Pink "Open the portfolio" (portfolio.html); outlined paper "Email the studio" (`mailto:angela@fabbriology.com?subject=Trade%20inquiry`). In-room image `https://angelafabbri.com/cdn/shop/files/installation-fabbri-best-houston-artist.ai-01-01-01.jpg?width=1200`, alt "Angela Fabbri painting installed in a living space" (rule 14).

**5.7 Recently collected.** Paper. Marker "COLLECTED". H2 "Recently collected". Sub "These found their homes. Love one? Angela can paint you something in the same spirit." Six commission-mode cards: i-am-bluetiful, send-the-jet, love-money-art, live-luxuriously-copy ("Beauty Like A Rose, Strength Like A Weed"), same-same-but-different-copy ("Wheels UP"), elephant ("Elephant Mini"). Show `title`, never the handle. Same layout as 5.3, 3 columns at 1024+. Link "See the collected archive →" (paintings.html#collected).

**5.8 Shop** (id `shop`, D2). Paper, 6px `--tang` top rule, cards smaller than painting cards. H2 "Studio goods". Sub "Coasters, trays, totes and the Ghost Chair, sold through the live store." Four cards (1:1 image, title, price from `variants[0].price` formatted "$20", button "Buy on angelafabbri.com" to `https://angelafabbri.com/products/<handle>`, new tab, `rel="noopener"`): neon-flowers-coaster, orange-you-glad-acrylic-tray, copy-of-hand-painted-camel-bloom-big-tote-neutral-splatter, ghost-chair.

**5.9 Newsletter.** `--sun` block, H2 "First look at new work", Email + "Join"; success "You're on the list. Demo only, nothing was sent." No popups.

## 6. Paintings page (paintings.html)
- H1 "Paintings", marker "PAINTINGS". Intro "Every piece is an original, one of one. Available works first; collected works below."
- Filter chips (buttons, `aria-pressed`, single select, scroll row on mobile, wrap on desktop): All, Inversion, Rose Pattern, Minis, Ten by Tens, "AWA · Abstracts with Attitude", each with its available count. Selection writes `location.hash` (#inversion, #rose-pattern, #minis, #ten-by-tens, #awa) and restores on load. Live result line (`aria-live="polite"`): "17 available in Inversion".
- Category mapping (demo approximation; collection membership is not in the data; log in decisions.md), first match wins: title has "Ten by Ten" → Ten by Tens; title has "Mini" or tag `mini` → Minis; body has "rose bud pattern" or title ends "Bloom" → Rose Pattern; body has "stencils repurposed" → AWA; else Inversion.
- Available grid: available only; 1 column under 600px (no carousel), 2 at 600+, 3 at 1024+, 4 at 1360+, `align-items: start`.
- Collected archive (id `collected`): H2 "Collected" and disclosure button "Show N collected works" (N follows the chip). Opening renders sold cards in commission mode; hash `#collected` opens it on load.
- Card anatomy: image well linking to `painting.html?h=<handle>` (`&width=600`, srcset 600/900, `sizes` per grid, lazy after the first 4); pill top-left ("Available" ink on white with a pink dot / "Sold" ink on `--sold-bg`); H3 title link; caption "Medium · Size" in `--meta`; full-width button. Available: pink "Request info". Sold: outlined ink "Sold · Submit commission inquiry". No price, "Sale price" or unit price anywhere. No overlay on sold images.
- Caption parsing from body_html: strip tags; drop lines starting "*"; size = first match of `/(\d+(?:\.\d+)?\s*x\s*\d+(?:\.\d+)?)\s*in\b|(\d+)\s*in diameter/i`, shown as "24 x 30 in"; medium = text before the size on its line, else the first non-empty line, trimmed of "|" and trailing "."; messages from `Repeated Message:`, `Hidden Message:`, `Backwards Message:`. Show only what exists (Ten by Tens lack medium/size). Never invent values.
- Data: a one-off Node script turns source/data/original-paintings.json into `assets/paintings-data.js` (`window.AF_PAINTINGS = [...]`, classic script for file://): handle, title, available, category, medium, size, repeated, hidden, images (src, width, height). Prefer a non-heic image where one exists. Homepage cards are static HTML.

**Inquiry dropdown (one component, two modes).**
- Markup: `.inq` with `data-title`, `data-handle`, `data-mode="info|commission"`; toggle button with `aria-expanded`/`aria-controls`; panel `hidden` until opened, directly below the button, full card width. Opening one closes any other.
- Panel: white, 2px ink border, 16px padding, 8px `--sun` offset. Chip: "About: Fire Horse" / "Commission inspired by: Elephant Mini"; commission mode adds above it "This one's collected. Angela can paint one in the same spirit."
- Fields (labels above, 48px inputs, 16px text): Name (`autocomplete="name"`, required); Email (`type="email"`, `autocomplete="email"`, required); "Note (optional)", 2-row textarea, placeholder "Where it would hang, or questions on size and shipping" / "Size, colors, a message you'd hide in it". Hidden: `inquiry_type` (request-info/commission), `painting_handle`, `reference` ("Request info: <title>" / "Commission inquiry inspired by <title>").
- Pink full-width "Send" / "Send commission inquiry". Trust line below (13px `--meta`): "Original, 1 of 1 · Certificate of authenticity included · Price on request · Reply within 1 business day" / "Made to your size and palette · Reply within 1 business day". Reply time is a placeholder for Angela (log in decisions.md).
- States. Closed: hidden. Open: focus to Name; Esc closes and returns focus to the toggle. Validating: `novalidate`; on Send, Name non-empty and Email matches a simple pattern; errors under each field in `--error` prefixed "!", `aria-invalid`, `aria-describedby`, focus to first invalid; errors clear on input. Sending: button disabled, "Sending…", 600ms. Success: form replaced by `role="status"` block: heading "Sent to angela@fabbriology.com" / "Commission inquiry sent to angela@fabbriology.com"; "Angela will reply about <title> personally."; small "Demo only: no message was sent."; link "Get notified of new works" (to the newsletter or footer signup); "Close". Focus to the heading (`tabindex="-1"`).
- Two clicks in both modes: the card's button, then Send. The hero instance makes it true from the first homepage screen.
- No JS: each panel holds a `mailto:angela@fabbriology.com?subject=<title>` link; panels hide only once JS adds `.js` to `<html>`.

## 7. Painting detail page (painting.html?h=handle)
- Reads `h` from the query string (works on file://); missing or unknown falls back to fire-horse. `document.title` = "<Title> by Angela Fabbri".
- Desktop: image columns 1 to 7; info columns 8 to 12, `position: sticky; top: 92px`. Mobile: image then info, nothing sticky.
- Image: main in a `--well`, `contain`, max-height 80vh, `&width=1600` (srcset 800/1200/1600); thumbnail buttons swap it (`aria-current`); click opens a vanilla `<dialog>` lightbox (arrows, pointer swipe, Esc, focus return). Works with backwards messaging get "Flip it".
- Info: breadcrumb "Paintings / <Category>"; H1 (Syne 800, clamp 34px to 64px); pill; `<dl>` of Medium, Size, Repeated message, Hidden message (existing rows only); "Original, 1 of 1 · Certificate of authenticity included"; inquiry component (request if available; commission if sold, with "This one's collected. Commission a piece in the same spirit."). Three `<details>`: "How does pricing work?" ("Every original is priced individually. Ask, and Angela replies personally."); "Shipping and installation" ("Details come with your reply.", placeholder); "Can I commission something similar?" ("Yes, via the commission inquiry on any collected work.").
- Related: H2 "More from <Category>", four available works from that category (fallback any available), standard cards with inquiries.

## 8. Portfolio gallery (next phase; stub now)
- Stub (portfolio.html): header, H1 "Portfolio 2026", "The full gallery for designers and galleries opens here next.", pink "Email the studio" mailto, footer.
- Next phase: the 10 sections in PDF order from `source/data/portfolio-structure.json`, CDN images. Opens on the work (full-bleed cover installation, 100svh). Desktop: fixed left rail of sections; works as 3x2 captioned grids. Mobile: vertical scroll with `y proximity` snap, 2-column works, tap opens the swipe lightbox with a "3 / 12" counter. Each section ends "Email the studio · Download the PDF"; commissions states sizes and lead time (placeholder).

## 9. Footer (id `contact`)
Ink. Huge mirrored "FABBRIOLOGY" marker in pink (aria-hidden), then plain "Fabbriology Fine Art". Columns (stacked on mobile): Contact (angela@fabbriology.com mailto, "Houston, Texas", "Commissions welcome"); Explore (Paintings, Studio goods, For designers & galleries, Her story); Follow (instagram.com/fabbriology, facebook.com/Fabbriology, new tab, text labels). Inner pages carry the newsletter here. Bottom: "© 2026 Fabbriology Fine Art · Design proposal, not the live store".

## 10. Accessibility and performance
- Focus: `:focus-visible { outline: 3px solid var(--pink); outline-offset: 3px; }`; inside turquoise and yellow blocks `outline-color: var(--ink)`. Never remove outlines.
- Alt text "<Title>, painting by Angela Fabbri"; one H1 per page; skip link; 44px+ tap targets.
- Hero eager and high priority, all else lazy and async; width/height on every `<img>`; preconnect both CDNs. Targets LCP 2.5s or less, CLS 0.1 or less. Relative links, no ES modules.

## 11. Why this converts, and tradeoffs
- Converts: identity line over Angela plus a signature piece, with Request info in the first mobile screen (rules 1, 2, 15, D4); inline three-field panel with title chip and trust line (3, 4, 8, 9); credentials under the first CTA (7); the Inversion made playful (11); sold works as proof and leads (5, 6, D9); trade lane in header, hero and ink section (12); merch walled off (16); inline newsletter (17).
- Tradeoffs: color blocks and mirrored type turn busy if overused, so the one-block and frame rules are load-bearing; galleries may read mirroring as playful; Syne may date faster than a neutral grotesk; the mobile carousel hides cards behind a swipe; no prices stays the main conversion risk (rule 9).
- Runner-up: a full-bleed color-block hero with no photo; rejected because D3 needs Angela with her work.
