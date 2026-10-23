# Option A: "Paper & Pigment" (Editorial Gallery)

Tagline: *The color is all hers. The page gets out of the way.*

Build in `docs/option-a/`: `index.html`, `paintings.html`, `painting.html?h=<handle>`, `portfolio.html` (stub), `assets/styles.css`, `assets/app.js`, `assets/data.js`. Unbuilt pages (About, Press, Shop, Contact) link to homepage anchors `#about #press #shop #contact`.

**Data (file:// safe):** never `fetch()`. Generate `assets/data.js` from `source/data/original-paintings.json` as `window.AF_PAINTINGS=[...]` (classic `<script>`), fields `title, handle, available, series, medium, size, repeated, hidden, story, published, images:[{src,w,h}]`. **No price fields in data.js.** Shop tiles use a separate `window.AF_SHOP` with prices.

## 1. Concept
A warm white gallery wall where nothing competes with the paintings: one soft serif, one quiet grotesk, ink on paper, and Angela's color doing all the talking. Every work hangs uncropped with a museum caption and one calm next step: **Request info** if available, **Sold · Submit commission inquiry** if collected. Zwirner-grade clarity, warmed by paper tones, a human serif and Angela's own face in the first screen.

## 2. Palette and typography
| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F7F4EF` | Page background |
| `--wall` | `#EFEBE4` | Wall boxes behind art, trade band |
| `--white` | `#FFFFFF` | Open dropdown panel, inputs |
| `--ink` | `#151412` | Text, all buttons |
| `--meta` | `#5E5A54` | Captions, secondary text (about 6:1 on paper) |
| `--rule` | `#E3DED6` | Hairlines, input borders |
| `--sold-bg` | `#E6E1D9` | Sold label (ink text) |
| `--accent` | `#C21E5E` | "Fabbri pink". Only: focus ring, success check, active chip underline, link hover underline |
| `--error` | `#A3122F` | Field errors |

No gradients, no overlays on art, no red for Sold. Color comes from the paintings.

```
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```
Fraunces with `font-optical-sizing:auto`, fallback Georgia; Inter fallback system-ui.

| Role | Font | Size | Wt | LH |
|---|---|---|---|---|
| Hero H1 | Fraunces | `clamp(2.25rem,1.4rem+3.6vw,4.25rem)`, -0.015em | 300 | 1.06 |
| H2 | Fraunces | `clamp(1.75rem,1.2rem+2.2vw,3rem)` | 300 | 1.1 |
| Card title | Fraunces | 1.25rem (detail H1 `clamp(2rem,1.5rem+2vw,2.75rem)`) | 400 | 1.2 |
| Pull quote | Fraunces italic | `clamp(1.375rem,1.1rem+1.2vw,2rem)` | 300 | 1.3 |
| Body | Inter | 1rem; 1.0625rem at 1024px+ ; max 62ch | 400 | 1.6 |
| Caption | Inter | 0.8125rem | 400 | 1.45 |
| Eyebrow/status | Inter uppercase, 0.14em | 0.75rem | 600 | 1.2 |
| Button | Inter | 0.9375rem | 500 | 1 |

## 3. Layout system
- Grid: 12 cols at 1024px+, 6 at 600 to 1023, 4 below 600. Gutter 24px (16px mobile). Margin `clamp(20px,5vw,72px)`. Max width 1440px; text blocks 760px.
- Spacing (px): 4, 8, 12, 16, 24, 32, 48, 64, 96, 144. Section padding `clamp(64px,9vw,144px)`. Card gaps 48px row / 24px column (40px row mobile).
- **Art is never cropped.** Card "wall box": `aspect-ratio:4/5; background:var(--wall); display:grid; place-items:center; padding:9%`; img `max-width:100%; max-height:100%; width:auto; height:auto` with real width/height attributes. Only photos of Angela, events and merch may use `object-fit:cover`.
- Image URLs: `src+"&width=800"` cards (srcset 400/800/1200, `sizes="(min-width:1440px) 22vw,(min-width:1024px) 30vw,(min-width:600px) 45vw,92vw"`), 1200 detail, 1600 hero. `.heic` sources (`country-games-green`, `prickly-delight`): append `&format=pjpg`, on error fall back to `images[1]`, never on the homepage.
- Radius 0 on art and cards; 2px on buttons, inputs, chips.
- One shadow, on artwork only: `0 1px 2px rgba(21,20,18,.08), 0 10px 28px -8px rgba(21,20,18,.18)`.
- Motion: dropdown 220ms `cubic-bezier(.2,.7,.2,1)` via `grid-template-rows:0fr→1fr` plus opacity; card hover (`hover:hover` only) art `translateY(-3px)`, 200ms; section reveal via IntersectionObserver (opacity plus 12px rise, 500ms, once), optional `@supports (animation-timeline:view())`. No carousels, parallax or scroll-jacking. Reduced motion: durations 0.01ms, no reveals; content visible unless JS adds the pre-reveal class.

## 4. Navigation and header
- Sticky header 64px (56px mobile), `--paper`; 1px `--rule` bottom border once `scrollY>8`. Targets and dropdowns get `scroll-margin-top:80px`.
- Left: wordmark "Angela Fabbri" (Fraunces 400, 1.375rem), with "FABBRIOLOGY FINE ART" eyebrow at 0.625rem below it from 600px up.
- Desktop nav (Inter 500): Paintings · Commissions (`paintings.html#collected`) · Shop · About · Press · Contact. Active: 1px ink underline; hover: accent underline.
- Far right: outlined button **"For designers & galleries"** to `portfolio.html` (the D1 lane, always visible).
- Request info is never in the header; it belongs to each painting.
- Mobile (under 1024px): wordmark plus a "Menu" text button (`aria-expanded`). The panel slides down under the header (disclosure, not modal; scroll locked; Esc closes and returns focus): Fraunces 300 2rem links, a hairline, a full-width outlined "For designers & galleries" button, then the email and Instagram.

## 5. Homepage
### 5.1 Hero (D3, 2-click)
- Desktop: cols 1 to 7 photo `https://angelafabbri.com/cdn/shop/files/MIN_0031_E.jpg?width=1600` (srcset 800/1200/1600), `aspect-ratio:4/5`, cover, `fetchpriority="high"`; open it once and set `object-position` so Angela's face is in frame. Cols 8 to 12, centered:
  - Eyebrow `HOUSTON · INTERNATIONALLY COLLECTED`
  - H1 **Angela Fabbri paints the messages you read backwards.**
  - Sub (1.125rem, `--meta`): "Contemporary realism, kaleidoscopic color and hidden words, from the 2019 Florence Biennale to hundreds of private and corporate collections."
  - Featured card between hairlines: `fire-horse` thumb (96px, `&width=400`, shadow), *Fire Horse*, "Acrylic on wood panel · 24 x 30 in", `ORIGINAL · AVAILABLE`, **Request info**; its dropdown opens under the card.
  - Text links: "View all available paintings →", "For designers & galleries →".
- Mobile 390: photo (`aspect-ratio:5/4`, max 42svh), eyebrow, H1, Fire Horse card (80px thumb) with Request info above the fold at 390x844 (about 56+330+150+130 = 670px); sub-line after the card.
- 2 clicks: Request info (opens, title attached), then Send after typing name and email. Same on every card.

### 5.2 Credential strip (`#press`)
Centered band between hairlines. Line 1 (Fraunces 300 1.25rem): "Florence Biennale, 2019 · Solo exhibition, Marfa TX · Miami Art Week · Selected by MOCA Los Angeles, 2017 · Selected by a Whitney assistant curator, 2018". Line 2 (eyebrow, `--meta`): "PRESS  VOGUE · THE WASHINGTON POST · HOUSTON CHRONICLE · MODERN LUXURY · PAPERCITY". Text only.

### 5.3 Available now
Eyebrow `AVAILABLE NOW`, H2 "Original paintings, one of one.", link "See all {N} available →" (N from data, now 51). 8 cards, 4x2 desktop, 2 cols tablet, 1 col mobile (first 4 only): `green-goddess`, `neon-roses`, `why-not-you`, `blaze-your-own-trail`, `same-same-but-different-copy-1`, `handle-with-care`, `its-rude-to-stare-black`, `if-you-listen-you-can-hear`. Titles from data, never handles (they differ). Lazy images.

### 5.4 How to read an Inversion
Fire Horse at 1200 (6 cols) beside text (5 cols); stacked on mobile. Eyebrow `THE INVERSION SERIES`, H2 "Start in the top right corner." Numbered steps: 1 "Every Inversion is written backwards, beginning in the top right corner." 2 "Read along and you'll find the repeated message." 3 "Look closer: one word breaks the pattern. That's the hidden message." Outlined button "Reveal the messages" (`aria-expanded`) shows Repeated **HORSE** / Hidden **FIRE**. Link "See every Inversion →" (`paintings.html?series=inversion`).

### 5.5 Meet Angela (`#about`)
Portrait `https://angelafabbri.com/cdn/shop/files/BS1A0457.jpg?width=1200` (5 cols, 4:5 cover) beside text. Eyebrow `MEET ANGELA`; pull quote "California born, Mississippi raised and Texas based." Body: "Angela Fabbri is a self-taught painter who received her first commission at 16 and has painted professionally since 2017. Her backwards text-based work has shown at the Florence Biennale, in a solo exhibition in Marfa and at Miami Art Week, and hangs in hundreds of private and corporate collections. She has painted live for Baccarat, Thrillist and Dos Equis, and opened a 2019 pop-up gallery in Houston's River Oaks District." Links "Read her story →" (placeholder), "View available paintings →".

### 5.6 For designers & galleries
Full-bleed `--wall` band. Left: eyebrow `TRADE`, H2 "For designers & galleries.", "The portfolio on one page: selected works, sizes, series, exhibitions and commission terms. No account, no price grid. One email reaches Angela directly." Hairline facts: "Originals from 11 x 14 in to 60 x 40 in" · "Commissions sized for your space" · "Certificate of authenticity with every original" · "Portfolio PDF available". Primary "View the portfolio" (`portfolio.html`), text link "Email the studio" (`mailto:angela@fabbriology.com?subject=Trade%20inquiry`). Right: `https://angelafabbri.com/cdn/shop/files/installation-fabbri-best-houston-artist.ai-01-01-01.jpg?width=1200`, 4:5 cover, caption "Installed work, Houston." (the in-room proof).

### 5.7 Recently collected
Eyebrow `RECENTLY COLLECTED`, H2 "Gone to collections. Commission one like it." 6 sold cards (3 cols desktop, 2 tablet, first 3 on mobile): `live-luxuriously-copy`, `exit-strategy-copy`, `squad-goals-copy`, `buy-the-dip-copy`, `sensory-overload-copy`, `i-want-you-too`. Each: Sold label plus **Sold · Submit commission inquiry**. Link "See all collected works →" (`paintings.html#collected`).

### 5.8 Shop (`#shop`)
Eyebrow `THE STUDIO SHOP`, H2 "Her color, for everyday things.", sub "Priced and ready to ship from the live store." 4 tiles (1:1 cover on `--wall`; 4 cols desktop, 2 mobile), image `images[0]` and price re-read from `products.json`: Ghost Chair `ghost-chair` "$2,500"; Acrylic trays `orange-you-glad-acrylic-tray` "From $175"; Coasters `flower-bouquet-gray-coaster` "From $20"; Totes `camel-bloom-big-tote-coffee-break-splatter-1` "From $225". Links: `https://angelafabbri.com/products/ghost-chair`, `/products/orange-you-glad-acrylic-tray`, `/collections/coasters`, `/collections/handbags`; `target="_blank" rel="noopener"`, visible ↗, aria-label ending "(opens the live store)".

### 5.9 Newsletter and contact (`#contact`)
Left: "Get first look at new works." inline email plus "Subscribe" (demo: "You're on the list."). Right: "Questions? angela@fabbriology.com" (mailto), "@fabbriology on Instagram". No popups.

## 6. Paintings page
- H1 "Paintings"; sub "Original works, one of one. {N} available now."
- **Chips:** All · Inversion · Rose Pattern · Minis · Ten by Tens · Abstracts with Attitude. `<button aria-pressed>`, 36px visual / 44px hit, 1px `--rule`, 2px radius; active = ink border and text plus 2px accent bottom underline; each shows its available count ("Minis 13"). Mobile: one row, `scroll-snap-type:x`. State syncs to `?series=` via `history.replaceState` (try/catch). Changing a filter closes open dropdowns and announces "Showing 16 available works" (`aria-live="polite"`).
- **Series rules** (approximate; live membership not captured; note it): on title plus the first 300 stripped characters of `body_html`, in order: title `/ten by ten/i` Ten by Tens; title `/mini/i` or tag `mini` Minis; body `/stencils repurposed/i` Abstracts with Attitude; `/rose|bloom|water me/i` Rose Pattern; else Inversion.
- **Order:** available first, newest `published_at` first.
- **Collected archive** `#collected` below a hairline: H2 "Collected", sub "Every original is one of one. Love one that's gone? Commission your own.", toggle "Show {M} collected works" (`aria-expanded`; auto-open on `#collected`). Same grid and filters; art fully visible.
- Grid: 1 col under 600, 2 to 1023, 3 to 1439, 4 above; `align-items:start`.

### Card anatomy
1. Wall box with uncropped art, link to `painting.html?h=<handle>`.
2. Title (Fraunces 400 1.25rem), same link.
3. Caption "{medium} · {size}" (`--meta`). Strip tags; size = first `/(\d+(\.\d+)?\s*x\s*\d+(\.\d+)?\s*in|\d+\s*in(ch)?\s*diameter)/i`, normalised "24 x 30 in"; medium = text before it minus trailing "|", capitalised, max 60 chars. Fallbacks: medium only, then "Original painting".
4. Status: `ORIGINAL · AVAILABLE`; or a `SOLD` label (ink on `--sold-bg`, 4px 8px) plus `ORIGINAL · COLLECTED`. Never on the image.
5. Button, 44px min, left aligned (full width under 600px). Available: solid ink **Request info**. Sold: ink outline **Sold · Submit commission inquiry** (`text-wrap:balance`, may wrap). A sold work never shows "Request info" anywhere.
6. Dropdown directly below the button, inside the card.

### Dropdown (one component, two modes)
`<button type="button" aria-expanded aria-controls="inq-<id>">` then `<div id="inq-<id>" hidden><form novalidate>` (unique id per instance). White panel, 1px `--rule`, 20px padding, 12px gap, 8px notch toward the button.
- Chip: "About: *{title}*" or "Commission inquiry inspired by *{title}*", mirrored in hidden `subject`.
- Fields with visible labels: Name (`autocomplete="name"`, required); Email (`type="email" autocomplete="email"`, required); "Note (optional)" textarea 3 rows, placeholder "Size, shipping or a viewing in person" (commission: "Size, colors or the space you have in mind"). Inputs 48px, 16px text.
- Submit, full width ink: "Send inquiry" / "Send commission inquiry".
- Trust line (0.75rem `--meta`): "Price on request · Original, 1 of 1 · Certificate of authenticity included · Reply within 1 business day*"; commission: "Commissions are one of one, made for you · Reply within 1 business day*".
- Name and email remembered in `sessionStorage` (try/catch) and prefilled next time.

**States.** *Closed:* `hidden`, `aria-expanded="false"`. *Open:* closes any other panel; focus to Name (Note if prefilled); `scrollIntoView({block:"nearest"})`; Esc or the button closes and returns focus. *Validating:* Name non-empty, Email `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`; errors under fields in `--error` ("Please add your name." / "Please enter an email like name@example.com."), `aria-invalid` plus `aria-describedby`, focus first invalid, clear on input; valid shows disabled "Sending…" for 700ms, nothing sent. *Success:* `role="status"` block, focused heading: accent check, **"Sent to angela@fabbriology.com"** (commission: **"Commission inquiry sent to angela@fabbriology.com"**), "Angela replies personally about *{title}*.", secondary button "Get notified of new works" (becomes "You're on the list."). Trigger then reads "Inquiry sent ✓" / "Commission inquiry sent ✓" and reopens the success block.

## 7. Painting detail page
Missing or unknown `h`: show Fire Horse. Title "{title} by Angela Fabbri".
- Desktop: image 7 cols; info 5 cols, `sticky; top:96px`.
- Image `images[0]` at 1200 (srcset 800/1200/1600), natural ratio, `max-height:82svh`, on a `--wall` field with 6% padding, shadow, `fetchpriority="high"`. Extra images as 72px thumbnail buttons that swap the main image. Main image opens a vanilla `<dialog>` viewer (1600px, arrows, swipe, Esc, focus return; no modules).
- Info: breadcrumb "Paintings / {Series}"; H1; hairline caption rows: Medium · Size · Series · Edition "Original, 1 of 1" · Status. Then the inquiry button and dropdown, above the fold on desktop, straight after the caption on mobile.
- About this work: description text minus the color disclaimer; `/Repeated Message:\s*"?([^"<]+)"?/i` and `/Hidden Message:.../i` as a definition list with "Start in the top right corner."; "Certificate of authenticity included." as body text.
- Mini credentials: "Florence Biennale 2019 · Marfa solo exhibition · Miami Art Week" plus "For designers & galleries →".
- Related: "More available {series}", 4 available cards (fallback any available); on sold pages titled "Available now".

## 8. Portfolio (next phase; stub now)
Stub: header, H1 "Portfolio", "A fast, one-page portfolio for designers and galleries, coming in the full build.", mailto "Email the studio", footer.

Concept: one long calm page in the PDF's order (`source/data/portfolio-structure.json`): Cover, Statement, Works I (6), Bio, Works II (6), In conversation (2 pairs), Commissions, Shows & events, Contact.
- Opens on the work: a full-bleed painting at 100svh with name, one line, three credentials; "Download the PDF" as a quiet top-right link.
- Navigation: desktop sticky left index 01 to 10 with scroll-spy accent tick; mobile sticky chip row that un-sticks while a dropdown is open.
- Works: caption grid; the `<dialog>` viewer adds "3 / 16", arrows, swipe and "Ask about this work", which closes the viewer and opens that card's inline dropdown (D4; commission variant for sold, D9).
- In conversation: pairs side by side with a two-line note.
- Trade lane: sizes, commissions, lead time (to confirm), then the dropdown open by default in trade mode, Note placeholder "Firm, project and sizes you need".

## 9. Footer
Top hairline, 64px padding, 4 cols (stacked mobile): (1) wordmark, "Fabbriology Fine Art, Houston, Texas.", visible `angela@fabbriology.com`; (2) Explore: Paintings, Commissions, For designers & galleries, About, Press; (3) Shop ↗: Coasters, Trays, Totes, Chairs; (4) "New works, first." email plus Subscribe, then Instagram (`https://instagram.com/fabbriology`) and Facebook (`https://facebook.com/Fabbriology`). Bottom row 0.75rem: "© 2026 Fabbriology Fine Art · Design concept A, not the live store. Demo forms do not send. *Reply time is a placeholder pending Angela's confirmation."

## 10. Accessibility and performance
- Landmarks, one H1 per page, skip link.
- `:focus-visible{outline:2px solid var(--accent);outline-offset:3px}`; over photos add `box-shadow:0 0 0 5px #fff`. Never remove outlines.
- Targets 44px+; text contrast 4.5:1+; Sold stated in text, not color.
- Alt: "{title}, {medium}, {size}, by Angela Fabbri"; photos describe the scene.
- Disclosures use `aria-expanded`/`aria-controls`; status changes in `aria-live`.
- Only the hero is high priority; below the fold `loading="lazy" decoding="async"` with width/height. Two families, five styles, no libraries, one deferred JS. Targets LCP 2.5s or less, CLS 0.1 or less.
- Relative links only, no fetch, no modules: works from file:// and `/option-a/`.

## 11. Why it converts, and tradeoffs
Covers brief rules 1 to 18: Angela plus a buyable Fire Horse with Request info in the first mobile screen; inline three-field form, 2 clicks; sold works become commission leads; credentials under the hero; trust line in the form; museum captions; Inversion explainer; visible trade lane; installation photo; merch separated; no popups; lean build.

Tradeoffs:
- Restraint can read as quiet; there is no bold "modern edge" device beyond the art.
- Ink buttons are calmer than a colored CTA; the bet is placement over color.
- 4:5 wall boxes leave margins around wide or square works, so each shows a little smaller than a crop would.
- Series filters are approximate until live collection membership is pulled.
- No prices (D2) stays the largest conversion risk in the research; "Price on request" and a reply time soften it only.
