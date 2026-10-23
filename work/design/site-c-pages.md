# Full site spec: Option C "After Hours"
**Date:** 2026-10-23. **Phase:** design, for Sonnet builders.

Extend `docs/option-c/` (spec `work/design/option-c.md`): port its tokens, type, spacing, components, class names and CSS verbatim. Do not redesign. Decisions D1 to D10 bind.

**Success means:**
- No painting price anywhere, including view-source.
- Every painting shows Request info, or the D9 button if sold.
- The portfolio reads like the PDF.
- The trade lane is on every page.
- Every page works from file:// and from `/site/`.

## 1. Shell

### 1.1 Files
All files sit flat in `docs/site/`, with relative links. Each page's `body[data-page]` value is its file name.

| File | Notes |
|---|---|
| `index.html` | `data-page="home"` |
| `paintings.html?series=key` | |
| `painting.html?handle=h&from=key` | Also accept `?h=`. Default `fire-horse`. A merch handle redirects to `product.html`. |
| `commissions.html` | |
| `shop.html?c=key` | |
| `product.html?handle=h` | Merch only. A painting handle redirects to `painting.html`. |
| `bio.html`, `press.html`, `portfolio.html`, `contact.html` | |
| `style.css` | Option-c CSS plus appended sections |
| `data.js` | Generated (§1.5) |
| `components.js` | Exposes `window.AFC` |
| `app.js` | Per-page init |
| `assets/portfolio/` | §9.1 |

- **Generator:** `work/site/build-data.mjs`, adapted from option-c's `build-data.mjs`.
- **Head:** option-c's, plus a unique `<title>` "Page | Angela Fabbri | Fabbriology Fine Art" and a meta description.
- **Scripts:** load data.js, then components.js, then app.js, all `defer`. No modules, no fetch.
- **Body:** `#chrome-top` (reserves header height, plus the 44px mobile lane), then `main#main`, then `#chrome-foot`. An optional `data-trade-band="off"` on the body suppresses the trade band.

### 1.2 Header (`AFC.chrome()`)
- **Bar:** solid `--umber` with a hairline. Sticky only at 1024px and up.
- **Desktop items:** Paintings ▾ · Shop ▾ · Bio · Press · Contact, plus an outline pill "For designers & galleries" linking to `portfolio.html`. Set `aria-current` on the active item and the active sub-link.
- **Menus:**
  - **Markup:** `button.nav-dd-btn[aria-expanded][aria-controls]` toggles a `.nav-dd` panel.
  - **Panel style:** `--umber` background, `--line` border, min-width 280px. Rows are 44px, Sans 500 15px, with `--smoke` on hover.
  - **Behaviour:**
    - Opens on click, or on hover where `(hover:hover)` matches, and closes 150ms after the pointer leaves.
    - Only one menu is open at a time.
    - Esc or an outside click closes it and returns focus to the button.
    - ArrowDown moves focus to the first link.
  - **Paintings menu:** All paintings · Inversion · Rose Pattern · Minis · Ten by Tens · Abstracts with Attitude (each `?series=key`) · divider · Commission inquiries.
  - **Shop menu:** Shop overview · Coasters (`shop.html?c=coasters`) · Trays (`?c=acrylic-trays`) · Merch (`?c=handbags`) · Chairs (`product.html?handle=ghost-chair`) · divider · More from the studio (`shop.html#more`).
- **Mobile (below 1024px):** option-c's `dialog.sheet`. It contains:
  - Paintings and Shop as Serif 34px disclosures holding the same links (Sans 17px, 44px rows).
  - Bio, Press, Contact.
  - A full-width trade pill.
  - Email, Instagram, Facebook.

### 1.3 Trade lane (D1)
The lane appears in four places:
1. **Header pill.**
2. **Mobile lane:** below 1024px, on every page except home. A 44px non-sticky `--umber` bar under the header, centred link "For designers & galleries →" (Sans 600 13px, uppercase, `--brass`).
3. **Trade band:** before the footer, except on home and portfolio, and when the body has `data-trade-band="off"`. Uses option-c `.band-cta`:
   - Eyebrow "For designers & galleries"; H2 "Sourcing for a client or a show?"; lede "Portfolio, sizes and commissions in one place."
   - Buttons "View the portfolio" and "Download PDF".
   - Image: the CultureMap installation graphic at 1:1 with `object-fit:contain`. Never crop it; it contains a headline.
   - Caption: "“Bloom Big” at a Houston Medical Center hotel, via CultureMap Houston".
4. **Footer link.**

PDF: `https://cdn.shopify.com/s/files/1/0052/8334/8544/files/Printable_-_AF_Portfolio_2026.pdf?v=1782407305`.

### 1.4 Footer
Option-c's three columns:
1. **Join** (the email signup).
2. **Studio:** a visible mailto to `angela@fabbriology.com`, "Houston, Texas", Instagram (`https://www.instagram.com/fabbriology`) and Facebook (`https://www.facebook.com/Fabbriology`).
3. **Explore:** Paintings, Commissions, Shop, Bio, Press, Contact, For designers & galleries.

The bottom row holds:
- the mirrored wordmark;
- policies links (13px, `--stone`) to `https://angelafabbri.com/policies/` + privacy-policy, refund-policy, shipping-policy, terms-of-service and contact-information;
- "© 2026 Angela Fabbri · Fabbriology Fine Art";
- "Demo build, nothing is sent".

Delete `.demo-label`.

### 1.5 data.js → `window.AF = {series, paintings, shop}`
**Reuse from option-c, unchanged:** `toLines`, `SIZE`, `DIAM`, `mediumOf`, `parse`, `FLAT_FIRST`, `ROOM_FIRST`, the HEIC filter and `withW`.

**Painting fields (whitelist):** `title, handle, series, medium, w, h, diameter, repeated, hidden, message, about, available, room, images:[{a:width=800, b:width=1600}]`.
- The 1200px image is derived client-side.
- Never emit variants, price, compare_at_price, tags or body_html.

**Classify per product.** Collections mix types: flowers-that-wont-fade holds coasters, trays, prints and bags; studio-move holds the Ghost Chair; "more" holds 8 paintings.
- `PAINT_COLS` = inversion, rose-pattern, minis, ten-by-tens, abstracts-with-attitude, flowers-that-wont-fade, miami-collection, studio-move, more.
- `MERCH_COLS` = coasters, acrylic-trays, handbags, chairs, sculptures, other-goodies, prints, gift-cards.
- **A product is a painting if either:**
  - its handle is in original-paintings.json; or
  - it is in at least one `PAINT_COLS` collection, in no `MERCH_COLS` collection, and its title does not match `/coaster|tray|print|tote|pouch|bag|chair|hat|box|sculpture/i`.
- This adds the 5 sold minis, for 110 paintings in total.
- **Exclude:** the 6 "- Framed" originals (in no collection, and they would expose prices) and `sensory-overload-print` (no image).

**Series:** exact membership from collection-products.json, in that file's order, paintings only.
- Each entry: `{key, label, primary, count, available, order}`.
- **Primary:** inversion "Inversion", rose-pattern "Rose Pattern", minis "Minis", ten-by-tens "Ten by Tens", abstracts-with-attitude "Abstracts with Attitude".
- **More:** flowers-that-wont-fade "Flowers That Won't Fade", miami-collection "Miami Art Week", studio-move "Studio Move".
- `p.series` lists a painting's keys in this order.
- **Sort paintings:** available first, then room shots last, then original order.

**Shop `{cats, items}`:**
- **Categories:**
  - Main: coasters "Coasters", acrylic-trays "Trays", handbags "Merch", chairs "Chairs".
  - More: sculptures "Sculptures", other-goodies "Other goodies", prints "Limited edition prints".
  - **prints** = collection members with images, plus every product titled `/^Limited Edition Print/` (21). The live collection has one product and no image.
  - **gift-cards** is empty, so omit it.
- **Category record:** `{key, label, group, live:'https://angelafabbri.com/collections/key', count, from, cover, coverAlt}`. The cover is the first available member with an image.
- **Item record:** `{handle, title, cats, price, priceText, available, url:'https://angelafabbri.com/products/handle', images, desc}`.
  - `priceText`: "$20", "$2,500", "$12.50"; "From $X" when variants differ.
  - `desc`: `toLines(body_html)` as plain paragraphs, minus lines matching `/^\*?WIPE|^\*\*?This is for/i`. Render it through `esc()`.

**Throw unless:**
- there are 110 paintings;
- the paintings JSON contains no `price` or `compare_at`;
- series counts match their membership;
- every image URL has `width=`;
- every item has a price.

Print the counts.

### 1.6 components.js (`window.AFC`)
- **Helpers from option-c:** `esc`, `sizeText`, `shortMedium`, `metaText`, `alt`, `imgAt`, `by`.
- **`inquiry(p,o)`:** option-c behaviour unchanged, including the hidden-timing fix, focus on Name, Esc/Cancel, validation, "Sending…", success, "Notify me", and the sent labels ("Inquiry sent", "Sold · Commission inquiry sent", "Commission inquiry sent"). Additions:
  - `o.label` overrides the label for available works.
  - `o.mode:'general'` with `o.ref` sets the reference chip, success text "Sent to angela@fabbriology.com" and trust line "Reply within 1 business day".
  - `p=null` means a general commission.
  - Expose `openInq`, `closeInq` and `current()`.
- **`inlineForm(el,{mode,ref})`:** the same panel, already open, with no trigger.
- **`card(p,{from})`:** links to `painting.html?handle=h&from=key`.
- **`merchCard(item)`:** a square `--umber` tile with the cover image cropped (width=800, lazy), title in Serif 20px, `priceText`, a "Sold out" `.tag-sold` when unavailable, and a link to `product.html`.
- **`lightbox(items,start,opener,o)`:** option-c's `dialog.lb`, generalised.
  - Items are `{src, alt, caption}`; the caption sits in `.lb-cap`; the alt updates on every swap.
  - `o.action{label,run}` adds an outline button that closes the dialog, then opens the card's own inline dropdown. Never put a form in a dialog (D4).
- **Alt text (D10):** every injected image gets a non-empty alt, except thumbnails inside buttons that have visible text (`alt=""`).
  - Plate thumbnail: `alt(p)`, `tabindex=-1`, no `aria-hidden`.
  - Detail thumbnails: alt "Title, view 2 of 3", replacing the `aria-label`.

## 2. Homepage
Port option-c's index and `home()`, with these changes:
- **Shop tiles:** link to `shop.html?c=coasters`, `?c=acrylic-trays`, `?c=handbags` (label "Merch") and `product.html?handle=ghost-chair`, each with the sub-line "Shop the collection".
- **Other links:**
  - "Her full story" goes to `bio.html`.
  - The credential strip ends with "All press →".
  - Painting links use `?handle=`.
- **Hero dropdown (D10), at 1024px and up:**
  - Add `.plate{position:relative}`.
  - Give the plate's `.inq` `position:absolute; left:-1px; right:-1px; top:100%; z-index:20`.
  - Give its `.inq-card` margin 0, background `--night` and `box-shadow:0 24px 48px rgba(0,0,0,.55)`.
  - The panel overlays the credential strip. The hero height and the button position never change.
  - Below 1024px it stays in flow.
- **Keep:** Request info visible at 390×664.

## 3. Paintings
**Heading:** eyebrow "Original paintings".
- **All:** H1 "The collection". Lede "Every painting is an original, one of one, with a certificate of authenticity. Prices on request."
- **A series:** the H1 is the series label, and the lede is one of these DRAFT lines followed by " Prices on request.":
  - Inversion "Backwards messages repeated across the canvas, with one hidden inside. Start in the top right corner."
  - Rose Pattern "Her rose-bud pattern in color combinations you won't see twice."
  - Minis "Small originals, big personality."
  - Ten by Tens "Ten-by-ten-inch originals, easy to place and collect."
  - Abstracts with Attitude "Textured abstracts layered with stencils from the Inversion series."
  - Flowers "Bouquets that stay in bloom."
  - Miami "Works shown at Miami Art Week."
  - Studio Move "Works from the studio move."

**Chips** (`role=group`, `aria-pressed`):
- All, plus the 5 primary series, each with its available count in `span.n`.
- A "More series ▾" chip (`aria-expanded`) reveals the other 3. Open it automatically when one of them is active.
- A click updates the H1, lede and title, sets `?series=` (via `replaceState` in try/catch), closes any open dropdown and re-renders.
- An unknown key shows All.

**Grid:**
- A series keeps its collection order; All keeps data order. Available works first.
- Result line, `aria-live`: "12 available in Inversion".
- Option-c `.cards` showing available works only. The first 4 load eagerly. Cards carry `from`.
- **Card (option-c 6.3):** a 4:5 `--umber` frame (`.room` images fill it), title, "Medium · W × H in", "● Available", and a full-width Request info button. No price.

**Collected archive:** option-c's "Show collected works (N)" toggle, with the series filter applied.
- Sold cards keep the image at full opacity, show a Sold chip, and an outline **"Sold · Submit commission inquiry"** button.
- A single render function picks the button from `available`.
- **Empty series:** option-c `.empty` plus a general commission dropdown.

**Dropdown states:** as option-c 6.5. Commission mode:
- brass top border;
- reference "Commission inquiry inspired by Title";
- success "Commission inquiry sent to angela@fabbriology.com";
- trigger afterwards "Sold · Commission inquiry sent".

## 4. Painting detail
Option-c's `detail()`, plus:
- **Crumb:** "← Back to Series" (`paintings.html?series=from`) when `from` is valid; otherwise "← All paintings".
- **Eyebrow:** the label of `p.series[0]`, linked to that series.
- **Image column** (columns 1-7, sticky): image at 1200 (srcset 800/1200/1600, high fetch priority), 64px thumbnails, and `AFC.lightbox` with caption "Title · meta".
- **Info column, in order:**
  1. H1
  2. Medium · size
  3. Messages `dl`
  4. Status: "● Available · Original, 1 of 1", or the Sold chip plus "This original has found a home. Angela can paint one in the same spirit."
  5. Button, with its dropdown directly below
  6. Trust line
  7. About
  8. Certificate
- **Below:** "Also available": 4 available works from the `from` series (else `p.series[0]`), padded from other available works. Then the trade band.

## 5. Commissions
1. **Intro** (2 columns at 1024px and up).
   - **Left:**
     - Eyebrow "Commissions".
     - H1 "A painting made for your room." (DRAFT)
     - Lede "Your size, your palette, even a message hidden in the letters. Angela paints it and keeps you in the loop." (DRAFT)
     - Primary **"Start a commission inquiry"**, with the general commission dropdown below it (max 440px).
   - **Right:** `angela-crate.png` with a purple offset block (§9.3). Alt "Angela Fabbri sitting on a painted shipping crate in a gallery corridor".
2. **How it works.** Option-c `.steps`, text verbatim from PDF page 8:
   1. Consultation = "Initial Consultation".
   2. Proposal and agreement = "Design Proposal" + "Agreement and Deposit".
   3. Creation and delivery = "Creation Process" + "Completion and Delivery".
3. **Pictured in a room** (`--umber` band, 2 columns from 640px):
   - `room-bloom-big.png`, yellow block down-left, caption "Staged room view · Beauty Like A Rose, Strength Like A Weed".
   - `room-conversation-piece.png`, lime block down-right, caption "Staged room view · I'm A Conversation Piece".
4. **"Recently collected. Yours can be next."** D9 cards for `live-luxuriously-copy`, `exit-strategy-copy`, `sensory-overload-copy`, `green-goddess-copy-1`, `scrumptious-copy`, `im-a-conversation-piece-fl-orange`. Grid: 1 column, 2 at 640px, 3 at 1024px.
5. **"Tell Angela about your space."** `inlineForm`, commission mode, reference "Commission inquiry (general)", placeholder "Size, colors, the room, or a message you'd like hidden in it", max 560px.
6. **Trade band.**

## 6. Shop
**Overview** (`shop.html`):
- Eyebrow "The Fabbriology shop"; H1 "Take a little color home."; lede "Coasters, trays, bags and more, made from Angela's paintings. Checkout happens on angelafabbri.com."
- **Main tiles** (option-c `.tiles`, 2 columns, 4 at 1024px): Coasters, Trays, Merch, Chairs. Each shows cover, label, "From $X" and "N items".
- **`#more` "More from the studio":** quieter, with a 30px H2, 3/2 columns, 4:3 images and no zoom. Sculptures, Other goodies, Limited edition prints.

**Category** (`?c=key`):
- Crumb "← Shop"; the H1 is the label.
- Ledes:
  - Coasters "Fine-art coasters printed from her paintings."
  - Trays "Acrylic trays for the coffee table or the bar."
  - Merch "Hand-painted totes, pouches and studio extras."
  - Sculptures "Paint-brush sculptures and fine-art boxes."
  - Other goodies "Small things from the studio."
  - Prints "Signed, numbered prints of her originals."
- Then a count; a `merchCard` grid (2/3/4 columns at 0/640/1024px) with available items first; and "See this collection on angelafabbri.com" linking to the `live` URL.
- An unknown key shows the overview.

**Product** (`product.html`):
- Same layout as §4, with square frames.
- Eyebrow is the category, linked. Then H1, `priceText` (Sans 600 22px), and "● In stock" or "Sold out".
- **"Buy on angelafabbri.com"** links to `item.url` in the same tab. If sold out, show an outline "View on angelafabbri.com" instead.
- Note: "Checkout happens on angelafabbri.com. This demo has no cart."
- Then the description, then "More in Category" (4 items).
- No inquiry button.

## 7. Bio
1. **Linen** (option-c `.about`):
   - `BS1A0457.jpg?width=1200`, eager.
   - Eyebrow "Bio"; H1 "Angela Fabbri".
   - Live bio verbatim from `af_pages_bio.html`: 5 paragraphs, breaking at "Her creative talent", "The Museum of", "In 2019" and "Fabbri's work". Max 62ch.
   - `.quote`: "California is where the dreamer in me was born, Mississippi taught me to slow down, and in Texas I learned the value in that stillness. My life inspires my art — my journal in paint."
   - Buttons "View portfolio" and "Download portfolio (PDF)".
2. **"Shows & events"** (`--night`): the CV from PDF page 9, verbatim, grouped by year, newest first.
   - Year in Serif 40px `--brass`, in a 96px column (stacked above the entries on mobile).
   - Entries tagged Solo / Art fair / Group / Press & live.
   - Lines without a year go under the previous year.
   - Fix "Installation s".
3. **"As featured in":**
   - the 7 logos (§9.1), 32px tall;
   - a Serif italic line: Vogue · The Washington Post · The Houston Chronicle · Modern Luxury · Paper City · The Book of Lists · The Round Top Show Guide;
   - "See the press →".
4. **Trade band.**

## 8. Press
**Header:** eyebrow "Press"; H1 "In the press"; lede "Features, exhibitions and live painting, from Houston to Florence."; then the logo row.

**Tiles:** 12, in the live order, 1/2/3 columns.
- Each tile is a `<button>` with a square `--umber` frame showing the image uncropped (`contain`, width=800, lazy). The images are press graphics with headlines.
- Clicking opens `AFC.lightbox` at 1600 with a caption.
- Below each tile: the outlet in Serif italic 20px, then the line in Sans 13px `--stone`.
- Image base: `https://angelafabbri.com/cdn/shop/files/`.

| # | file | outlet | line |
|---|---|---|---|
| 1 | art-basel-miami-houston-artist_17919be2-1b91-4a65-8cbc-4e5382f5eac9.png | Spectrum Miami | Art Basel Week Miami, 2019, 2021, 2022, 2023 |
| 2 | river-oaks-district-houston-artist-01.png | Houston Chronicle | A 2,000-square-foot pop-up at River Oaks District |
| 3 | ric-village-pop-up-houston-fabbri-artist-01.png | PaperCity | A Rice Village holiday pop-up |
| 4 | carla-hall-houston-fabbri-artist-01.jpg | The Washington Post | Carla Hall takes soul food mainstream |
| 5 | installation-fabbri-best-houston-artist.ai-01-01-01.jpg | CultureMap Houston | "Bloom Big," a living-art installation at a Medical Center hotel |
| 6 | angela-fabbri-best-houston-artist-01.jpg | Modern Luxury Houston | The Art of Living |
| 7 | live-paintning-fresh-arts-houston-artist-01.png | PaperCity | Live painting: "One Piece of Advice" went to co-chair Raquel Segal |
| 8 | florence-biennale-best-houston-artist-01.png | Florence Biennale | Art + Design, Florence, 2019 |
| 9 | voyage-fabbri-houston-best-artist-01-01.png | VoyageHouston | Local interview: Meet Angela Fabbri |
| 10 | Houston_BOL_2019-34.jpg | Houston Business Journal | Book of Lists, featuring "Watch This" |
| 11 | downtown-fabbri-best-houston-artist.ai-01-01-01-01.jpg | Houston Chronicle | Public art downtown: "It's Just Paper," 930 Main |
| 12 | beth-lindsey-fabbri-houston-artist-01.jpg | Houston Chronicle | The Gray Sofa Project |

- **Alt:** "Outlet feature: line". These were captioned after viewing all 12.
- **Closing band:** "The full story, in one portfolio." with "View portfolio" and "Download PDF". The page sets `data-trade-band="off"`.

## 9. Portfolio gallery (showpiece)
The page uses `data-trade-band="off"` and opens straight on page 1, with no click and no loader.

### 9.1 Assets
Copy from `work/pdf-pages/2026/extract/` to `docs/site/assets/portfolio/`. Images are transparent unless marked "opaque".

| Copy to | Source | Notes |
|---|---|---|
| `cover-letters.png` | `p01-img01` | 1152×782 |
| `wordmark.png` | `p01-img02` | black |
| `signature.png` | `p02-img01` | navy, 382×140 |
| `works/idontunderstand-blue.png` | `p05-img03` | 828×828 |
| `angela-crate.png` | `p08-img01` | opaque, 410×545; same image as `p10-img08` |
| `commission-letters.png` | `p08-img02` | |
| `room-conversation-piece.png` | `p08-img03` | opaque, 769×480 |
| `room-bloom-big.png` | `p08-img04` | opaque, 769×480 |
| `logos/vogue.png` | `p10-img01` | |
| `logos/florence-biennale.png` | `p10-img02` | |
| `logos/houston-chronicle.png` | `p10-img03` | |
| `logos/modern-luxury-houston.png` | `p10-img04` | |
| `logos/washington-post.png` | `p10-img05` | solid black box |
| `logos/papercity.png` | `p10-img06` | |
| `logos/culturemap.png` | `p10-img07` | |

- **Cover photo:** don't copy `p01-img03` (1.7 MB). It is the same photo as `MIN_0031_E.jpg`, so use the CDN version: 1600 wide, srcset 800/1600, eager, high priority. (The portfolio report swaps img01 and img03.)
- **Logos, wordmark and signature on dark:** `.logo-mono{filter:brightness(0) invert(1);opacity:.86}`. The Washington Post logo uses `.logo-screen{mix-blend-mode:screen;opacity:.86}` instead. On linen, show native colours.

### 9.2 Structure and navigation
```
section.pf [aria-roledescription=carousel][aria-label="Portfolio 2026, 10 pages"]
  .pf-bar    48px --umber: eyebrow "Portfolio 2026 · For designers & galleries" | "03 / 10 · Works" | Index (aria-expanded) | Download PDF | Full screen (aria-pressed)
  #pf-index  hidden strip of 10 buttons (96×120 thumb + "03 Works"), aria-current
  .pf-stage  touch-action:pan-y; .pf-prev/.pf-next; article.pf-page#page-N [role=group][aria-roledescription=slide][aria-label="3 of 10: Works"]
  .pf-dots   10 dots, 44px targets, "Go to page N: Name", aria-current
  .sr live region "Page 3 of 10: Works"
.pf-after  "Sizes, availability and pricing on request." · Email the studio · Download PDF
```
**Visibility:** JS adds `.pf-js` and sets `hidden` on inactive pages. Without JS, all pages stack.

**Hash:** use `#page-N`. Read it on load; write it with `replaceState` inside try/catch, falling back to `location.replace`.

**Inputs:**
- **Keyboard:** Left/Right and Home/End, ignored while focus is in a form field.
- **Swipe:** touch or pen only. Trigger when |dx| > 50 and |dx| > 1.5·|dy|. Ignore swipes that start in `.inq`, a form or a button.
- **Prev/next buttons:** at 1024px and up, 72px-wide full-height edge buttons with a 48px round `--umber` arrow (60% opacity, 100% on hover or focus). Below 1024px they sit at the ends of the dots row.
- **Dots and index** also navigate.

**Esc** closes, in this order:
1. an open inquiry (the portfolio handler returns early while `AFC.current()` is set);
2. the index;
3. full screen.

**On page change:**
- Close any inquiry.
- Update the counter, dots, index, hash and live region.
- Focus the page heading (`tabindex=-1`, preventScroll) after keyboard or button navigation.
- Below 1024px, scroll the stage top into view.
- Make the next page's images eager.

**Transition:** opacity 0→1 and translateX ±24px→0, 260ms, with option-c's easing. Instant under reduced motion.

**Full screen:** `body.pf-immersive` hides the header, lane and `.pf-after`, and makes the stage 100svh.

**Sizing:**
- **1024px and up:** stage height `calc(100svh - var(--hdr) - 104px)`, min 560px. Pages use 12 columns, max 1280px, with `overflow-y:auto`.
- **Below 1024px:** stage height auto; page padding `32px var(--pad) 48px`.

### 9.3 Shared pieces
- **`.pf-h` heading:** Serif clamp(40px,5vw,72px).
- **`.brush`** (aria-hidden): `width:min(100%,440px); height:18px; background:currentColor`, masked (`mask` and `-webkit-mask`) with:
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 24' preserveAspectRatio='none'%3E%3Cpath d='M4 13C90 5 210 8 330 7s190-2 266 2l-6 5c-90 2-210 1-292 4S110 21 10 21z'/%3E%3Cpath d='M40 19l220 1-30 3H52z' opacity='.6'/%3E%3C/svg%3E") center/100% 100% no-repeat`
- **`.pf-stroke`** (aria-hidden, absolute, `pointer-events:none`):
  - Size: 200×280px desktop, 96×134px mobile.
  - Mask: `viewBox='0 0 200 280'`, round caps, three paths:
    - `M30 270C70 180 120 90 180 10` at width 26
    - `M60 275C95 195 140 110 195 40` at width 14
    - `M10 240C50 170 90 100 140 30` at width 8
  - Colours: `--pf-pink:#F2277E` and `--pf-green:#93D48E`, opacity .9.
  - Pages use `overflow:hidden` so strokes crop at the edges.
- **Offset block:**
  - `.pf-off{position:relative;isolation:isolate}`
  - `.pf-off::before{content:"";position:absolute;inset:0;background:var(--blk);transform:translate(var(--dx),var(--dy));z-index:-1}`
  - Offset 28px at 1024px and up, 14px below.
  - Colours: red #E8474A, maroon #6B2132, periwinkle #8790C9, magenta #C2255F, purple #8B57F7, yellow #FFD84A, lime #A6D94B.
- **`.pf-work`:**
  - **Frame:** a `<button>`, 4:5 on page 3 and 1:1 on page 5. Contained painting, 6% padding, option-c shadow, image `images[0].a`, height `min(24svh,250px)` on desktop.
  - Clicking the frame opens `AFC.lightbox` with `action:{label:'Ask about this work'}`.
  - **Caption:** store title (Serif 20px, linking to `painting.html`), meta, and status (Sold chip or "● Available").
  - **Button:** `AFC.inquiry(p,{label:'Ask about this work'})` as `btn-sm`. Sold works get D9 automatically.

### 9.4 Pages
Use text verbatim from portfolio-structure.json. Fix only the extraction artifacts ("O ne", "conti nuously", hyphen line-wraps). Drop trailing heading echoes.

1. **Cover** (`--night`).
   - `cover-letters.png` at the top left (34% wide, translate -18%/-22%).
   - **Centred stack:**
     - Eyebrow "Portfolio 2026 · For designers & galleries".
     - `wordmark.png`: width min(680px,80%), `.logo-mono`, alt "Angela Fabbri".
     - A 72px Serif “ in `--rose`.
     - The quote: Serif italic clamp(20px,2.2vw,28px), 46ch.
     - Buttons "Start viewing →" (goes to page 2) and "Download PDF".
     - A `.cred-list` row: "Florence Biennale 2019 · Art Basel Week Miami, 5 editions · Hundreds of private and corporate collections".
   - **MIN_0031_E** along the bottom, with a 40% top gradient from `--night`. At 1024px and up it takes the lower 45% of the stage (cover, `object-position:50% 40%`). Alt "Angela Fabbri seated on a stool in front of a wall of her Inversion paintings".
   - **Mobile order:** letters (46%), eyebrow, wordmark (86%), quote, photo, full-width buttons, credentials list.
2. **Artist statement** (`--linen` ground, `--ink` text, `--rose` focus).
   - Heading with an ink brush.
   - Three paragraphs ("Shaped by… / I paint in reverse… / My work lives…"), Sans 17px/1.75, 64ch, centred.
   - Then "– " and `signature.png` at 190px in native colour, alt "Signed, Angela Fabbri".
3. **Works I.** All sold, in PDF order: `live-luxuriously-copy`, `exit-strategy-copy`, `a-plane-a-tuk-tuk-and-a-tent`, `sensory-overload-copy`, `i-want-you-too`, `i-dont-understand-you-either-green-1`.
   - Grid: 3×2 on desktop, 2 columns from 640px, 1 column on mobile (frames max 360px).
   - Visually hidden heading "Works".
4. **Bio.**
   - The page 4 text in 5 paragraphs; 2 CSS columns at 1024px and up (48px gap, max 1080px).
   - Pink stroke at top right, green at bottom left.
   - "Full bio →".
5. **Works II.** Square frames, in PDF order:
   1. `neon-roses` (available)
   2. `blaze-your-own-trail-pink-22`
   3. the unmatched blue work
   4. `im-a-conversation-piece-fl-orange`
   5. `i-still-love-you-though-copy`
   6. `scrumptious-copy`

   **The unmatched blue work:**
   - `works/idontunderstand-blue.png` at no more than native size (`max-width:828px; width:100%`). The lightbox caps it at 828px too. No shadow, because the PNG carries the PDF's soft edge.
   - Caption "I Don't Understand You Either (Blue)"; meta "Details on request"; no status.
   - Button: info mode on the pseudo-record `{handle:'idontunderstand-blue', title:"I Don't Understand You Either (Blue)", available:true}`, labelled "Ask about this work".
   - Add the comment `<!-- Not in the store; PDF-resolution image; availability unconfirmed. -->`.
6. **In conversation I.**
   - **Row A:** paragraph 1 ("Inspiration comes…") in columns 1-6; `green-goddess-copy-1` in columns 8-12 with a red block down-right.
   - **Row B:** `empty-roads-playlists` in columns 1-5 with a maroon block down-left; paragraph 2 ("One of the most surprising…") in columns 7-12.
   - Text in Sans 16px/1.75, 52ch.
   - Art is max 34svh tall on desktop and carries the §9.3 caption and button. The offset block replaces the frame.
   - **Mobile order:** heading, paragraph, art, paragraph, art.
7. **In conversation II.** Same layout, in the order of the PDF render:
   - "Joy, laughter…" with `green-goddess-copy`, the SOLD "Green Goddess" (not the available `green-goddess`), periwinkle block down-right.
   - `its-rude-to-stare-black` (available, magenta block down-left) with "I continuously explore…".
8. **Commissions.**
   - `commission-letters.png` at the top right (200px; 110px on mobile), partly off-edge.
   - Columns 1-5: `angela-crate.png` with a purple block down-left.
   - Columns 6-12: the 5 steps verbatim, each as `<p><strong>Lead:</strong> text</p>`.
   - Below: the room images (yellow down-left, lime down-right; max 22svh tall on desktop) with the §5 captions.
   - Then "Start a commission inquiry" with its dropdown.
9. **Shows & events.**
   - Two columns at 1024px and up: Solo + Juried, then Group + Installations.
   - Group headings: Sans 600 13px, uppercase, `--brass`.
   - Each row has a 56px year cell (tabular-nums, `--brass`). Lines that start with "–" leave the year empty.
   - Green stroke on the right, pink at bottom left.
10. **Contact.**
    - `angela-crate.png`, centred (228px; 60vw on mobile).
    - A 2×2 grid of rows, each with a 44px ring SVG icon: "@Fabbriology" (Instagram), "angelafabbri.com", "angela@fabbriology.com" (mailto), "Houston, Texas".
    - Omit the PDF's phone and street address until Angela approves them.
    - Buttons: "Email the studio", "Download PDF", and the text link "Back to the start".
    - An ivory brush at 20%, then logos at 32px tall (Vogue 36px, Washington Post 28px), 4+3 on desktop and 2 columns on mobile, with outlet names as alt.

**Index thumbnails:**
- 1: MIN_0031_E (width=200)
- 3: `live-luxuriously-copy`
- 5: `neon-roses`
- 6: `green-goddess-copy-1`
- 7: `its-rude-to-stare-black`
- 8: `angela-crate.png`
- 2, 4, 9, 10: Serif text tiles on `--smoke` reading Statement, Bio, Shows and Contact.

**Page names:** Cover, Statement, Works, Bio, Works, In conversation, In conversation, Commissions, Shows & events, Contact.

## 10. Contact
- Eyebrow "Contact"; H1 "Talk to the studio."; lede "Questions about a painting, a commission or a project? Angela replies personally, usually within 1 business day." (The reply time is a placeholder.)
- **Left column:** `inlineForm` in general mode, reference "General inquiry", placeholder "Tell Angela what you have in mind", success "Sent to angela@fabbriology.com".
- **Right column:** the email as text with a mailto link, "Studio: Houston, Texas", Instagram, Facebook, and a join form with id `join-c`.
- **Then:** the trade band.

## 11. Accessibility, performance, two clicks
- One H1 per page, landmarks, and a skip link.
- Option-c focus ring; targets at least 44px; labelled fields; `aria-expanded`, `aria-controls` and `aria-current` where relevant.
- Images: lazy below the fold, explicit dimensions, and only the LCP image at high priority.
- JS under 40 KB, excluding data.js. No PDF in `docs`.
- **Two-click rule:** on every painting, on every page, it takes the button, then the fields, then Send, with no page load.
- Reduced motion: no reveals, slides or transitions.

## 12. QA checklist
1. The generator asserts pass, and `AF.paintings` has no `price`.
2. No `$` appears near a painting, in the DOM or in the source. Shop and product pages do show prices.
3. Sold works always show the Sold chip and "Sold · Submit commission inquiry". After sending, they read "Sold · Commission inquiry sent".
4. Dropdowns open below their buttons with focus on Name. Esc returns focus. Errors are announced. Success text follows D4, D7 and D9. No network request is made.
5. The hero height does not change when its dropdown opens, at 1440×900 and 1366×768. Request info is visible at 390×664.
6. Menus work by hover, click, keyboard and Esc. The mobile sheet works. The trade lane appears on every page at 390px and 1440px.
7. Every series key works, and a bad key falls back to All. Counts match the generator. "More series" opens automatically when its series is active. The back link keeps the series.
8. All 7 shop categories work, including Chairs. Every Buy link is `https://angelafabbri.com/products/<handle>`.
9. **Portfolio:** `#page-7` deep-links; keys, swipe, dots and index navigate; the Esc order holds; the page order matches the PDF; sold works use the D9 button; the lightbox has no form; reduced motion is respected. Take screenshots of every page at 1440×900 and at 390px (iframe wrapper).
10. Alt text is present. There are no console errors. The site works from file:// and from `/site/`. All links resolve. The footer note is present and there is no fixed badge.
