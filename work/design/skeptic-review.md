# Skeptic review: options A, B, C (before build)
2026-10-23. Phase: design (skeptic). Read: research/brief.md, design/option-a.md, option-b.md, option-c.md. The data claims below were checked with Node against source/data/original-paintings.json, products.json and collections.json. Image paths were checked against the source/html snapshots. This review does not pick a winner. Each MUST-FIX is something the builder changes in the spec before or during the build. SHOULD items are optional.

## 0. Facts checked (these apply to all options)
- Every handle the specs curate exists, and its availability matches what the spec says. Available ones: fire-horse, green-goddess, neon-roses, why-not-you, blaze-your-own-trail, same-same-but-different-copy-1, handle-with-care, its-rude-to-stare-black, if-you-listen-you-can-hear, im-expensive, smiles-original-painting, painted-bunting, bloom-big-blue-22, smell-the-roses, im-your-biggest-fan. Sold ones: live-luxuriously-copy, exit-strategy-copy, squad-goals-copy, buy-the-dip-copy, sensory-overload-copy, i-want-you-too, i-am-bluetiful, send-the-jet, love-money-art, same-same-but-different-copy, elephant, hug-me, im-a-conversation-piece-fl-orange. Shop handles all exist and are in stock. Prices: Ghost Chair $2500, tray $175, coasters $20, totes $225.
- Counts: 105 paintings, 51 available and 54 sold. Fire Horse is "Acrylic on wood panel | 24 x 30in", Repeated "HORSE", Hidden "FIRE". Green Goddess is 36 x 48 in, Repeated "LOOKING SHARP", Hidden "HOT AND BOTHERED".
- These images exist in the snapshots: MIN_0031_E.jpg (4928x3280, landscape, v=1737578050), BS1A0457.jpg (1500x1995, v=1738073980), and the press-page files installation-...ai-01-01-01.jpg, river-oaks-...-01.png, live-paintning-...-01.png, florence-biennale-...-01.png, angela-fabbri-...-01.jpg, carla-hall-...-01.jpg. None of them has been viewed. The press "-01.png" files and the ".ai-01-01-01.jpg" file may be designed press graphics with text in them, not clean photos.
- Size range. **Every spec states it wrong.** Available works run from 10 x 10 in (Ten by Tens) to 50 x 50 in (Now or Never). The 60 x 40 / 40 x 60 works (exit-strategy-copy, live-luxuriously-copy) are SOLD.
- Size parsing. Ten by Tens write sizes as `10" x 10"`. The A and B regexes match 93 of 105 works and miss all 8 Ten by Tens plus 4 others. B wrongly says Ten by Tens "lack medium/size". The C regex matches 101 of 105 but drops the single "in diameter" work.
- HEIC. country-games-green and prickly-delight are both AVAILABLE and both have a .heic first image (each has a .jpg second image). Any grid of all available works will show broken images in Chrome and Firefox unless the build picks the .jpg.
- Raw variants carry `price` and `compare_at_price`. Under D2, the generated painting data file must drop them, because otherwise prices sit in view-source.
- Bio wording: "MOCA ... in Los Angeles ... selecting her work for a group exhibition in Houston", the 2018 Whitney assistant curator, "self-taught", "California born, Mississippi raised, and Texas based". The California/dreamer pull quote is in portfolio-structure.json.

## 1. Shared must-fix (all three)
1. **First-screen test viewport.** Rule 2 is measured at 390x844 in every spec, but iPhone Safari with its toolbars shows roughly 390x660. The specs' own estimates put the bottom of Request info at about 670 (A), about 760 (B) and about 800 (C, and my estimate is about 830). Pick one acceptance viewport. Recommendation: Request info fully visible at 390x664, also checked at 390x844. Meet it by shrinking the photo (A 4:3 or 36svh, B 16:10, C 34svh) or by moving the sub-line below the button. Never shrink the button.
2. **Size-range copy.** Compute it from the data. The defensible wording is "Available originals from 10 x 10 in to 50 x 50 in; past works up to 60 x 40 in". Do not imply 60 x 40 is ready to ship.
3. **Dropdown animation and `hidden`.** `hidden` sets display:none, so the grid-rows 0fr to 1fr transition never runs. Remove `hidden`, then add the open class on the next frame. On close, re-add `hidden` after `transitionend`. Under reduced motion, skip straight to the end state.
4. **Every sold-work state keeps "Sold".** After a send, the trigger must read something like "Sold · Commission inquiry sent" and never a generic "Inquiry sent". On a sold detail page, the button and the dropdown are the commission variant. The portfolio's work grid and viewer must use the D9 button for sold works. The rule is that one render function picks the mode from `available`.
5. **Check the images before writing captions.** Open MIN_0031_E, the installation file and the press PNGs once. Captions such as "Installed work, Houston" or "Pop-up gallery..." must describe what is actually in the image. Do not 1:1 crop a graphic that contains text.
6. **The "flip" demo.** Look at one Inversion close up first. If the letters are normal glyphs in reverse order, scaleX(-1) makes them mirror glyphs, which is less readable, not more. In that case keep only the text "Reveal" (A's approach).

## 2. Option A, "Paper & Pigment"
MUST-FIX
- A1. Use regex `/(\d+(?:\.\d+)?)\s*(?:"|”|in)?\s*x\s*(\d+(?:\.\d+)?)\s*(?:"|”|in)?/i` plus the diameter rule. The current one misses the 8 Ten by Tens and 4 more.
- A2. The trade facts line "Originals from 11 x 14 in to 60 x 40 in" is wrong at both ends (10 x 10 smallest; 60 x 40 is sold). See shared item 2.
- A3. The desktop hero crops a 3:2 landscape photo (4928x3280) to 4:5. That cuts away about half the width, very likely including the works around her, which defeats D3 "with her work". Use the photo's natural 3:2 (or 4:3 at most) and let the text column sit beside or below it.
- A4. The mobile hero comes out at about 690px by my estimate, against the spec's 670. That fails a 664 viewport (shared item 1). Use a 4:3 photo capped at 36svh.
- A5. "Installed work, Houston." names a location that hasn't been verified. Check the image (shared item 5). Caption it neutrally, or swap it if the image is a press graphic.
- A6. The detail page must state explicitly that a sold work shows the commission button and dropdown. Today this is only implied by the card rules. After a send on a sold work, the trigger should read "Sold · Commission inquiry sent ✓".

SHOULD
- At 80 to 96px the Fire Horse thumbnail barely counts as "a signature Inversion piece" (D3). Consider 120px or larger on desktop.
- `history.replaceState` throws on file:// in Chrome. The try/catch is already in the spec; keep it.

RISK: It is the safest build, but it reads as a polished template. Angela asked for a "modern edge", and A puts none on the page beyond the art itself.

## 3. Option B, "Mirror Studio"
MUST-FIX
- B1. **Hash conflict.** The filter chips write `location.hash` (#inversion...), and the collected archive also uses `#collected`. Picking a chip wipes #collected, and a deep link can't carry both. Move the series to `?series=` (read via `location.search`, which works on file://) and keep the hash only for #collected.
- B2. The size regex misses `10" x 10"`. Drop the claim that Ten by Tens lack medium and size (they have both). See A1.
- B3. The trade fact "11 x 14 in minis to 40 x 60 in statement panels" is wrong. See shared item 2.
- B4. **Hero tile overlap at 390.** The Fire Horse tile (36vw is about 140px wide and about 180px tall with its border) drops about 43px into the text area and will sit on top of the eyebrow and H1. Reserve the space (padding-top or a narrower text column beside the tile). My estimate puts the button at about 765px, which misses the spec's own 760 even before shared item 1. Move the sub-line below the button on mobile.
- B5. **Mobile carousel holding inline forms** (Available now and Recently collected). An open form inside an 82vw scroll-snap card is fragile: focus on Name can scroll the row sideways, and 7 of the 8 cards sit behind a swipe. Either stack 1 column on mobile and show 4 cards (preferred), or make the row a labelled, keyboard-focusable region (`tabindex="0"`, `aria-label`) and snap the opened card fully into view.
- B6. The data generator must explicitly drop `price` and `compare_at_price` (D2, view-source).
- B7. Portfolio (next phase): the swipe viewer must carry the inquiry, which closes the viewer and opens the card's inline dropdown. Sold works use the D9 variant. Today the spec doesn't mention an inquiry there at all.
- B8. The no-JS fallback shows every panel open, which means 14 visible forms on the homepage that do nothing. Without JS, show only the mailto link, not the fields.
- B9. "Flip it" on every backwards work on the detail page needs the same glyph check as the homepage (shared item 6).

SHOULD
- The mirrored word "backwards" in the H1 is pink on paper at about 3.3:1. That passes only as large text at weight 800, so keep it at 34px or larger. It is also the identity line's hardest-to-read word. Consider mirroring only the decorative marker.
- The nav has no Press link (Press exists in the current nav). Add `#credentials`, or accept that and log it.

RISK: It has the most color and mirrored type, so it is the most likely to read as busy or gimmicky to galleries. Its hero overlap and mobile carousel are also the most fragile layout pieces of the three options.

## 4. Option C, "After Hours"
MUST-FIX
- C1. **No build folder or file list.** State `docs/option-c/` with index.html, paintings.html, painting.html, portfolio.html, assets/styles.css, assets/app.js and assets/data.js (D8).
- C2. **HEIC.** There's no rule for it. country-games-green and prickly-delight are available, so the paintings grid will break in Chrome. Pick the first non-.heic image, as B does.
- C3. **Credential wording.** "Selected for a MOCA Los Angeles group show, 2017" implies MOCA put on the show. The bio says MOCA LA selected her work for a group exhibition in Houston. Use "Selected by MOCA Los Angeles for a Houston group exhibition, 2017".
- C4. The trade fact "Ready-to-ship originals from 10 × 10 in to 60 × 40 in" is wrong, because ready to ship tops out at 50 x 50. See shared item 2.
- C5. **Hero plate grows upward on desktop.** Opening the dropdown moves the Request info button up under the cursor, and on a 1366x768 screen the plate plus a roughly 420px form overflows the hero. Keep the button fixed. Let the plate grow downward and the hero height become auto while the form is open.
- C6. **Mobile hero height.** Header 60, photo at 44svh (371 at 844), H1 of about 4 lines at 36px, then a plate of about 120 and a button of 48. The button lands at about 830, which misses the spec's own 800 and fails 664 badly. Cut the photo to about 34svh, shorten the mobile H1 to two short sentences, and drop the plate padding.
- C7. **Header over the photo on desktop.** It is transparent over the hero, but the gradient covers only the left 55%. The centre links and the right-hand pill sit on the bare photo, so ivory text will fail contrast. Add a top scrim, or make the header solid `--umber` from the start.
- C8. **Recently collected at 2 columns on mobile.** That gives cards about 165px wide. The "Sold · Submit commission inquiry" button wraps to 3 lines and the inline form's inputs end up about 130px wide. Use 1 column on mobile, or let the open panel span the full grid row.
- C9. **The portfolio viewer must not host the form.** "Works open the shared lightbox with ... the correct inquiry button" puts the form inside a modal `<dialog>`, which breaks D4. Use A's pattern: "Ask about this work" closes the viewer and opens the card's inline dropdown.
- C10. The trigger after a send reads "Inquiry sent" for every work. Sold works need "Sold · Commission inquiry sent" (shared item 4).
- C11. `window.AF_PAINTINGS` must explicitly drop `price` and `compare_at_price` (D2). Only `AF_SHOP` carries prices.
- C12. **Rule 14 is not met.** There's no in-room image, and River Oaks is a gallery pop-up. Use the installation image if it turns out to be a real room (shared item 5), or state the gap to Angela.
- C13. "Mirror it" claims flipping makes the letters read normally. Verify that first (shared item 6). Green Goddess's messages are correct in the copy.

SHOULD
- The mobile menu is a full-height, focus-trapped sheet, which is a modal pattern. Either give it real dialog semantics (`<dialog>` with showModal and inert background) or make it a disclosure, as A and B do.
- The series rules leave 8 works with no chip (they show only under All). Add a fallback.
- The size regex drops the one "in diameter" work.

RISK: The dark ground is the boldest choice of the three, but it fights her bright, often light-ground paintings. C also has the heaviest hero stack, so it is the option most likely to push Request info off the first phone screen.

## 5. Convergence: the three are one layout in three skins
Measured overlap:
- **Same hero photo** (MIN_0031_E) and the **same featured piece** (Fire Horse) in all three, each as a small thumbnail card or tile with Request info.
- **Same homepage order.** All three copy brief section 5 almost exactly (C only swaps Meet Angela and Trade).
- **Same component copy.** The trust line, the dropdown fields and the success lines are near-verbatim across all three. So are the chip set, the inferred series rules, the "Show N collected works" archive, the 7/5 sticky detail page and the portfolio concept.
- **Same assets.** The BS1A0457 portrait in all three. The California pull quote in B and C. The installation photo in A and B. The 4-tile shop in all three.
- **Overlapping curated works.** neon-roses, why-not-you, handle-with-care and green-goddess appear in all three. i-am-bluetiful, send-the-jet and love-money-art are in both B and C. live-luxuriously-copy is in A and B. i-want-you-too, its-rude-to-stare-black and if-you-listen-you-can-hear are in A and C.

As things stand, Angela would be judging palette and fonts, not three ways to sell her work.

**Re-differentiation.** This changes structure, not just skin. Every change below keeps D1 to D9 and the 2-click rule.
- **A, "Editorial gallery" (the control).** Keep the brief order, the split hero with MIN_0031_E at its natural ratio, Fire Horse, and an 8-card grid. It is the baseline the other two depart from.
- **B, "The Studio Wall": the homepage is the shop floor.**
  - Hero: the BS1A0457 portrait set beside a large Green Goddess (both images exist; this is D3 read literally: her photo plus a signature piece, at equal weight).
  - The homepage shows the filter chips and all available works directly, so the paintings page holds the same content and the collected archive.
  - The Inversion explainer uses Green Goddess (LOOKING SHARP / HOT AND BOTHERED).
  - The mirror device and color blocks stay.
  - Fewer, louder sections. Credentials sit as a single ink band.
- **C, "Private Viewing": one work per screen, no grid on the homepage.**
  - Hero: MIN_0031_E cropped differently, or a verified live-painting photo of Angela (check the image first). The featured piece is Now or Never (UV-reactive acrylic, 50 x 50 in, available). Its 4 images may include a UV-lit shot. If they do, a "Lights off" toggle that swaps to it is a signature after-hours moment. Check the images first, and do not fake it.
  - The homepage is 5 or 6 hand-hung "plates": one large painting per viewport-height section with its museum caption and inline inquiry, in vertical scroll with no snap-jacking. A "Start a commission" concierge band follows.
  - The full grid lives only on the paintings page.
- **No repeats.** Make the curated sets disjoint across options (51 available and 54 sold leave plenty), so no painting appears on two homepages except as the shared fallback.
- **Distinct trade lane per option.**
  - A: a calm band.
  - B: a pinned header pill plus a color block.
  - C: a "Designer & gallery viewing" plate, a full-screen section that links to the portfolio with three facts and one email.
