# Option C: "After Hours" (Collector Concierge)

Tagline: **Private viewing, after hours.**

## 1 Concept
A gallery after closing: a warm near-black room where Angela's kaleidoscopic paintings hang lit and captioned like a museum wall. Every work carries a quiet concierge next step (Request info if available, "Sold · Submit commission inquiry" if collected) that opens in place, so desire becomes a conversation in two clicks. Designers and galleries get their own door, one tap from every page.

## 2 Palette and typography

| Token | Hex | Use |
|---|---|---|
| `--night` | #0E0C0B | Page ground (all but one section) |
| `--umber` | #181412 | Card frames, dropdown panel, solid header |
| `--smoke` | #2A2420 | Chips, Sold label, input fill |
| `--line` | #3B332D | Decorative hairlines only (never controls) |
| `--edge` | #8A7F73 | Input and outline-button borders (4.7:1 on umber) |
| `--ivory` | #F3EEE7 | Text (16.9:1 on night) |
| `--stone` | #B0A598 | Meta, captions (8.1:1 night, 6.3:1 smoke) |
| `--brass` | #C8A46A | Eyebrows, numerals, success check, rules (8.3:1) |
| `--fuchsia` | #FF4D94 | Primary button fill with `--night` text (6.3:1), focus ring, availability dot |
| `--error` | #FF8A7A | Field errors (8:1 on umber) |
| `--linen` / `--ink` | #EFE8DF / #15110F | "Meet Angela" only; muted #5E554C (6:1); focus ring #C2185B (4.8:1) |

Rules: fuchsia only on primary buttons, focus rings and the 6px availability dot; the art supplies all other color. Sold is never red: `--smoke` chip, `--ivory` text. No overlays on paintings.

**Fonts:** `<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">` with preconnects to fonts.googleapis.com and fonts.gstatic.com (crossorigin). Instrument Serif 400 + italic for headings, painting titles, quotes, press names; Instrument Sans 400/500/600 for everything else.

- H1 hero: Serif clamp(36px, 6.2vw, 76px), lh 1.02, -0.01em
- H2: Serif clamp(30px, 4.2vw, 52px), lh 1.08
- Detail H1: Serif clamp(34px, 4.5vw, 56px), lh 1.05; card title Serif 22px (24px at 1200+), lh 1.15
- Pull quote: Serif italic clamp(22px, 2.6vw, 32px), lh 1.3
- Body: Sans 400, 16px (18px at 1024+), lh 1.6
- Caption/meta: Sans 500, 13px (14px at 1024+), lh 1.45, 0.02em
- Eyebrow: Sans 600, 12px, uppercase, 0.16em; Button: Sans 600, 15px, 0.02em

Signature detail: the Inversion-block eyebrow and the footer wordmark render mirrored (`display:inline-block; transform:scaleX(-1)`, `aria-hidden="true"`, visually hidden real-text twin). Nowhere else.

## 3 Layout system
- Grid: 4 / 8 / 12 columns at <640 / 640-1023 / 1024+. Gutters 16 / 24 / 32px; side padding 20 / 32 / 48px. Content max 1360px; text measure 62ch; hero and Inversion block full-bleed.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 72, 112, 160px. Section padding 72 / 112 / 160px.
- Card frame: 4:5 on `--umber`, painting inside with `object-fit: contain` and 7% padding, like a hung work. Detail and hero images keep natural aspect. Always set width/height (1200x1500 for frames).
- Image URLs: product `src` + `&width=800` (cards, srcset 800w/1200w), `&width=1200` (detail), `&width=1600` (hero, srcset 800w/1600w, `sizes="100vw"`, `fetchpriority="high"`, not lazy). Below the fold: `loading="lazy" decoding="async"`.
- Radius 0 on images and cards, 2px inputs, pills (999px) for buttons and chips. Only shadow: painting images in frames, `0 18px 40px rgba(0,0,0,.45)`.
- Motion: 200-260ms `cubic-bezier(.2,.7,.2,1)`. Dropdown expands via `grid-template-rows: 0fr` to `1fr` plus opacity. Sections fade up 16px via IntersectionObserver. No parallax, autoplay or scroll hijack. Reduced motion: 0ms transitions, no reveals (JS adds `.will-reveal` only when motion is allowed).

## 4 Navigation and header
- Desktop (1024+): 72px sticky header, transparent over the hero, `--umber` at 94% with a `--line` hairline after 48px scroll. Left: "ANGELA FABBRI" (Sans 600, 15px, 0.24em) over "Fabbriology Fine Art" (Serif italic 13px `--stone`). Centre: Paintings · Commissions · Shop · About · Press · Contact. Right: outline pill "For designers & galleries" to `portfolio.html`.
- Mobile (<1024): 60px header, **not sticky**, no bottom bars, so nothing covers an open dropdown. "Menu" button (`aria-expanded`) opens a full-height `--night` sheet: Serif 34px links, full-width trade pill, email, Instagram. Esc closes; focus trapped, then returned.
- Request info lives on each painting, never in the nav.
- Mockup links: Paintings `paintings.html`; Commissions `index.html#commissions`; Shop `#shop`; About `#about`; Press `#credentials`; Contact `#contact`.

## 5 Homepage (`index.html`), in order

**5.1 Hero.** `https://angelafabbri.com/cdn/shop/files/MIN_0031_E.jpg?width=1600` (srcset 800/1600), Angela at her open house among her works; start at `object-position: 50% 35%`.
- Desktop: min-height 100svh (min 680px); gradient `--night` 88% to transparent over the left 55% only. Bottom-left (cols 1-6): eyebrow "Angela Fabbri · Houston"; H1 "Backwards messages. Kaleidoscopic color. Collected internationally."; sub (18px `--stone`, 46ch) "Contemporary realist painter, exhibited at the 2019 Florence Biennale and Miami Art Week, with work in hundreds of private and corporate collections."; links "Meet Angela" (`#about`) and "For designers & galleries →" (`portfolio.html`).
- Bottom-right **Featured plate** (cols 9-12, `--umber` 92%, 24px padding, `--line` border): Fire Horse (`fire-horse`, images[0], 120px 4:5 thumbnail beside text), eyebrow "Featured original · Inversion", title "Fire Horse", meta "Acrylic on wood panel · 24 × 30 in", status "● Available · Original, 1 of 1", primary **Request info**. The dropdown opens inside the plate under the button; the plate is bottom-anchored and grows upward.
- Mobile (390 x 844): header 60; photo alone at 44svh, no gradient; then on `--night`: eyebrow, H1 at 36px, the plate as a row (72px thumbnail + title/meta/status) and a full-width Request info button whose bottom edge sits at or above 800px (if not, move the sub line into 5.2). Secondary links follow.

**2-click rule:** Request info (focus jumps to Name), type, Send. No scroll or page load; identical on every card, available or sold.

**5.2 Credential strip** (`id="credentials"`), brass hairlines above and below. Row 1 (Sans 13px uppercase, brass "·"): "Florence Biennale 2019 · Miami Art Week · Solo exhibition, Marfa TX · Selected for a MOCA Los Angeles group show, 2017 · Selected by a Whitney assistant curator, 2018". Row 2: "As featured in" then Serif italic 22px text logos: Vogue · The Washington Post · Houston Chronicle · Modern Luxury · Paper City. Mobile: row 1 as a 2-column list.

**5.3 Available originals.** Eyebrow "Available now"; H2 "Originals, one of one."; sub "Ask about any piece. Angela replies personally." Grid 1 / 2 / 3 / 4 columns at <640 / 640 / 1024 / 1200, `align-items: start` so an open dropdown pushes only its column. Cards (6.3): `neon-roses` (Now or Never), `smell-the-roses` (Life Is Magic), `im-expensive`, `why-not-you` (Lucky You!), `im-your-biggest-fan`, `handle-with-care`, `if-you-listen-you-can-hear`, `its-rude-to-stare-black`. Never use `prickly-delight` (.heic image). Then outline pill "See all available paintings (N)", N counted from the data, to `paintings.html`.

**5.4 How to read an Inversion** (full-bleed `--umber`). Cols 1-7: `green-goddess` large in a frame with a toggle "Mirror it" / "Back to original" (`aria-pressed`) that flips the image (`scaleX(-1)`, 240ms, instant under reduced motion) so the letters read normally. Cols 8-12: mirrored eyebrow "INVERSION"; H2 "How to read an Inversion"; steps with brass Serif 40px numerals: 1 "Start in the top right corner." 2 "Read right to left. The repeated message here: LOOKING SHARP." 3 "Find the one she hid: HOT AND BOTHERED." Caption "Green Goddess · Acrylic on wood panel · 36 × 48 in · Available" and Request info with its dropdown. Mobile: image, toggle, steps, caption, button.

**5.5 For designers & galleries** (`id="trade"`), 2 columns, stacked on mobile. Eyebrow "For designers & galleries"; H2 "Original art for interiors, collections and exhibitions."; brass-dash list: "Ready-to-ship originals from 10 × 10 in to 60 × 40 in." / "Commissions in custom sizes and palettes for a specific room." / "High-resolution images, dimensions and CV on request." / "One email, a personal reply within 1 business day." (placeholder). Buttons: primary "View the portfolio" (`portfolio.html`), outline "Email the studio" (`mailto:angela@fabbriology.com?subject=Trade%20inquiry`). Image: `https://angelafabbri.com/cdn/shop/files/river-oaks-district-houston-artist-01.png?width=1200`, caption "Pop-up gallery, River Oaks District, Houston, 2019".

**5.6 Meet Angela** (`id="about"`), the only `--linen` section. Portrait `https://angelafabbri.com/cdn/shop/files/BS1A0457.jpg?width=1200`, natural aspect. Eyebrow "Meet Angela"; H2 "Self-taught. Soul-driven. Painting in reverse."; body "Angela Fabbri took her first commission at sixteen and has painted professionally since 2017. She has exhibited at the 2019 Florence Biennale, held a solo exhibition in Marfa, Texas, and shown at consecutive Miami Art Weeks; Baccarat, Thrillist and Dos Equis have invited her to paint live. Her work lives in hundreds of private and corporate collections." Pull quote (2px #C2185B left rule): "California is where the dreamer in me was born, Mississippi taught me to slow down, and in Texas I learned the value in that stillness." Link "Her full story" to `https://angelafabbri.com/pages/bio`.

**5.7 Commissions and recently collected** (`id="commissions"`). Eyebrow "Commissions"; H2 "Recently collected. Yours can be next."; sub "These works have found homes. Angela can create something in the same spirit, sized and colored for your space." Primary "Start a commission inquiry" opens the dropdown in commission mode, reference "Commission inquiry (general)". Then 6 sold cards (2 cols mobile, 3 desktop), each with the Sold chip and **"Sold · Submit commission inquiry"**: `i-am-bluetiful`, `send-the-jet`, `love-money-art`, `i-want-you-too`, `hug-me`, `im-a-conversation-piece-fl-orange`.

**5.8 Shop** (`id="shop"`). Eyebrow "The Fabbriology shop"; H2 "Take a little color home."; 4 square tiles (image = first product of each collection in products.json): Coasters (`https://angelafabbri.com/collections/coasters`), Acrylic trays (`/collections/acrylic-trays`), Handbags (`/collections/handbags`), Ghost chair (`/products/ghost-chair`). Each shows "From $X" (lowest `variants[0].price` in that collection, computed from products.json) and "Shop on angelafabbri.com".

## 6 Paintings page (`paintings.html`)
**6.1 Intro.** Eyebrow "Original paintings"; H1 "The collection"; sub "Every painting is an original, one of one, with a certificate of authenticity. Prices on request."

**6.2 Filter chips** (horizontal scroll on mobile; `role="group" aria-label="Series"`; `aria-pressed`): All · Inversion · Rose Pattern · Minis · Ten by Tens · Abstracts with Attitude. Result line "N available" (`aria-live="polite"`). Membership is not in the data; infer it (comment as inferred):
- Minis: tag `mini` or title ends "Mini". Ten by Tens: title contains "Ten by Ten".
- Rose Pattern: body contains "rose bud pattern" or title contains "Rose".
- Abstracts with Attitude: body contains "stencils repurposed".
- Inversion: body contains "top right corner" or "Repeated Message".
Works may match several chips.

**6.3 Available first; card anatomy.** The main grid shows only available works. Card: 4:5 `--umber` frame with the contained, shadowed painting (links to `painting.html?h=<handle>`); 16px below: title (Serif 22, link), meta "Medium · W × H in" (Sans 13 `--stone`), status "● Available" (fuchsia dot), **Request info** (full width on mobile). No price or "Sale" text anywhere.

**6.4 Collected archive.** Under the grid, a full-width outline toggle "Show collected works (N)" / "Hide collected works" (`aria-expanded`, `aria-controls`) reveals a "Collected" grid with the active chip applied. Sold cards: image at full opacity, `--smoke` chip "Sold", outline button **"Sold · Submit commission inquiry"**. One render function picks the button from `available`, so a sold work can never show Request info.

**6.5 Dropdown** (one component everywhere): `<button aria-expanded="false" aria-controls="inq-<handle>">` followed directly by `<div id="inq-<handle>" class="inq" role="region" aria-label="Inquiry about <title>" hidden>`.
- **Closed:** button only. Opening one panel closes any other.
- **Open:** `--umber` panel, 20px padding, 2px top border (fuchsia info, brass commission). Reference chip: "About: Fire Horse · 24 × 30 in" or "Commission inquiry inspired by Send The Jet". Hidden inputs `painting`, `inquiry_type` (`info`/`commission`), `reference`. Labelled fields "Name", "Email", "Note (optional)" (3-row textarea; placeholder "Anything you'd like to know, such as shipping or framing" or, commission, "Size, colors, the room, or a message you'd like hidden in it"). Primary "Send", text "Cancel". Trust line (13px `--stone`): "Original, 1 of 1 · Certificate of authenticity included · Price on request · Reply within 1 business day"; commission: "Sized and colored to your space · Reply within 1 business day". Focus to Name on open; Esc/Cancel closes and returns focus to the trigger; on mobile `panel.scrollIntoView({block:'nearest'})`.
- **Validating:** Name non-empty; Email matches `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Errors under the field in `--error` ("Please add your name", "Please enter a valid email") with `aria-invalid` and `aria-describedby`; focus the first invalid field. Valid: Send reads "Sending…", disabled 600ms. No network request.
- **Success** (`role="status"`, replaces the form): brass check, "Sent to angela@fabbriology.com" or "Commission inquiry sent to angela@fabbriology.com"; "Angela will reply personally, usually within 1 business day."; a "Notify me of new works" button that becomes "You're on the list". The trigger then reads "Inquiry sent" and reopens the success panel.

## 7 Painting detail (`painting.html?h=<handle>`, default `fire-horse`)
JS renders from embedded data. Desktop: image cols 1-7 (sticky, top 96px), info cols 8-12; mobile stacked.
- Image: images[0] `&width=1200` (srcset 800/1200/1600), framed with the shadow; 64px thumbnail buttons for all images[]. Clicking opens a vanilla `<dialog>` lightbox (arrows, Esc, pointer swipe, "1 / 2" counter, focus return).
- Caption from `body_html` (tags stripped): medium = text before "|", else the sentence with acrylic/mixed media/resin/glossy; size via `/(\d+)\s*(?:"|”|in)?\s*x\s*(\d+)/i` shown "24 × 30 in"; `Repeated Message: "…"`, `Hidden Message: "…"`, or `messaging: "…"` shown as "Message". Order: series eyebrow (inferred), H1, medium · size, definition list of messages, status, button (Request info or Sold · Submit commission inquiry) with its dropdown directly below, trust line, "About this piece" (remaining text minus color and certificate disclaimers), "Certificate of authenticity included" on its own brass-ruled line.
- Below: "From the same series", 4 cards (available first), each with its own dropdown; then "Sourcing for a client or a show? For designers & galleries →".

## 8 Portfolio (`portfolio.html`)
Stub now: header/footer, H1 "Portfolio", one line, "Email the studio" and "Back to paintings".
Next phase: opens on the work, with the PDF cover rebuilt (installation image, cover quote, three credentials), then the PDF's 10 pages in order as "plates". Desktop: slim sticky rail of plate names with "03 / 10"; arrow keys jump between plate anchors (native scroll). Mobile: plain vertical scroll. Works open the shared lightbox with caption and the correct inquiry button. Close with sizes, lead time, one-tap "Email the studio" and a secondary "Download PDF portfolio".

## 9 Footer (`id="contact"`)
Three columns, stacked on mobile with newsletter first. 1: "First look at new works", email field + "Join" (demo "You're on the list"); never a popup. 2: "Studio inquiries", visible mailto `angela@fabbriology.com`, "Houston, Texas", Instagram and Facebook text links. 3: Paintings, Commissions, For designers & galleries, Shop, About, Press. Bottom: mirrored wordmark "FABBRIOLOGY" (decorative) and "© 2026 Angela Fabbri · Fabbriology Fine Art".

## 10 Accessibility and performance
- Landmarks, one H1 per page, skip link. `:focus-visible { outline: 2px solid var(--fuchsia); outline-offset: 3px }` (#C2185B on linen).
- Alt: "<Title>, <medium>, <size>, by Angela Fabbri"; hero "Angela Fabbri at her Houston open house with her paintings". Targets ≥ 44px; contrast as in section 2.
- Data: a generated `assets/data.js` (`window.AF_PAINTINGS`, `window.AF_SHOP`) loaded by plain `<script defer>`; no modules or fetch, so file:// works.
- LCP ≤ 2.5s, CLS ≤ 0.1; JS under 15 KB.

## 11 Why this converts, and tradeoffs
- Brief rules 1-4, 8-9: who she is plus an available Inversion with Request info in the first 390px screen; inline, three fields, two clicks, trust line beside Send.
- Rules 5-7, D9: sold works stay as proof and become commission leads; credentials sit under the first CTA. Rules 10-17: museum captions, Inversion explainer, trade lane in five places, merch walled off, inline newsletter.
- Desire comes from lighting and restraint, not urgency tricks.

Tradeoffs:
- Dark grounds can feel heavy; dark works (Black Bird, It's Rude To Stare - Black) read less crisply than on white.
- Hidden prices (D2) remain the biggest research-flagged risk; only "Price on request" and a reply promise soften it.
- Series chips are inferred and may mis-file a few works.
- Reply-time and trade wording are placeholders until Angela confirms.
- Mobile fit depends on MIN_0031_E.jpg; check 390 x 844 and tune height and `object-position`.
- No single-painting room shot on the listed CDN images; installation photos stand in.
