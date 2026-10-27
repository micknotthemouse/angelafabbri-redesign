# Skeptic review: Option D "Studio Index"
2026-10-26. Phase: design (skeptic). Inputs: `work/design/option-d.md`, `work/research/brief.md`, `work/research/isembard/capacity-1440-top.png`, and spot checks against `source/data/*` and the bio snapshot.

## Verdict
The spec is buildable and holds D1 to D9. The 2-click path, the inline dropdown, the D9 copy, the no-price rule and the static/file:// constraints are all covered. It reads as Isembard: #0d0d0d/#f1f2f3 tokens, mono pill nav, a "+" panel, blurred-photo hero with inset vignette, numbered chapters with sub-numbers, counters, records, a factory-style table, a product-UI explainer and a CTA bar per chapter. Fix the items below before building. Several of them are contrast or state bugs that would otherwise surface only in QA.

## Checked and fine (no action)
- All 14 named handles exist. Available and sold status match the spec (51 available, 54 sold, computed from variants). Prickly Delight and Ape In are in the `inversion` membership list.
- Prickly Delight and Country Games (Green) lead with a `.heic` image. The site `build-data.mjs` HEIC filter promotes their JPG (`stuck_on_you_smt.jpg` 2166x2166, `IMG_2398.jpg`), so both have a usable image. Keep that filter.
- Ape In copy confirms "DIAMOND HANDS" / "HODL" and "starts in the top right corner".
- Every bio claim in the spec is in the bio text: 25+ years, 2017, 100s of collections, self-taught, California/Mississippi/Texas, three months at River Oaks, and Baccarat/Thrillist/Dos Equis. The California quote is real: it is on the 2026 portfolio PDF cover (`portfolio-structure.json`).
- Contrast: muted #6b6b6b reaches about 4.7:1 on #f1f2f3 and 5.3:1 on #fff. Dark muted #a6a6a6 on #0d0d0d is about 7.9:1. Accent #946200 on #f1f2f3 is about 4.6:1, and on the #0d0d0d pills about 3.7:1. Dark accent #e2d45c passes easily.
- Rough mobile hero arithmetic puts the Request info bottom at about 620 to 640px, not 560, but that is still inside 664. The acceptance test stays valid as long as it is actually measured.

## MUST-FIX
1. **Hero text contrast.** MIN_0031_E is a white gallery, so blurred it becomes a pale grey field. Under only a 35% scrim, white text lands near 3:1, which fails 4.5:1 for the sub-line and the micro eyebrow. The capture shows Isembard has the same weakness. Raise the scrim to at least 0.55, or add a bottom-weighted dark gradient behind the text block. Sample pixels from the headless capture and confirm at least 4.5:1 for the small text and 3:1 for the H1.
2. **Focus ring over the hero and header in light theme.** The 3px-offset ring falls on the photo, not the pill, and #946200 on a mid-tone blur can drop below 3:1. Inside the hero and header, use the dark-theme accent #e2d45c, or a two-tone ring (accent outline plus a 1px dark box-shadow).
3. **Muted text never sits on `--field`.** #6b6b6b on #e6e6e6 is about 4.3:1 and fails. This covers placeholders, mat captions and Index rows. Darken muted to about #5f5f5f, or keep muted text off field.
4. **One painting, one stable Fig number.** As written, the same work is "FIG. 01" on the hero, "FIG. 014" by list position (which changes with the filter) and "FIG. 07 OF 51" on detail. A collected work would also show "OF 51". Bake a stable `fig` index into `data.js` (for example, its position in the full 105 master order) and use it everywhere. Breadcrumb: `FIG. 063 / 105`, or "OF 51" only for available works.
5. **Two theme controls, one state.** The segmented control appears in both the "+" panel and the footer. Give each radio group a distinct `name` and sync them on change. Also set `color-scheme: light` / `dark` per theme, plus `<meta name="color-scheme" content="light dark">`, so inputs, scrollbars and the `<dialog>` backdrop match.
6. **Dropdown close must not depend on `transitionend`.** Under `prefers-reduced-motion`, or when no transition runs, the event never fires and `hidden` is never re-added. Set `hidden` immediately when reduced motion is on, and add a 300ms timeout fallback otherwise.
7. **Mobile sticky header versus the open form.** With the on-screen keyboard open, a 56px sticky header can cover the focused input, and the brief rules out sticky bars over the open dropdown. Make the header non-sticky below 1024px, or give every form field and sheet `scroll-margin-top: 72px` and scroll the sheet into view on open.
8. **Header pill hit areas.** Isembard's pills are about 24px tall. Keep that look, but give each nav, logo, "+" and FOR DESIGNERS pill a hit area of at least 44px (padding or a ::before extension). On mobile, measure that logo, FOR DESIGNERS and + fit on one line at 390px with the real 16 to 20px gutters.
9. **"+" panel layout on mobile.** Three columns inside 358px is unreadable. Stack the columns below 600px, and let the panel go full-width under the header.
10. **The long credential pill overflows at 390px.** "SELECTED BY MOCA LOS ANGELES FOR A HOUSTON GROUP EXHIBITION, 2017" is about 60 mono characters, roughly 420px wide. Shorten it to `MOCA LOS ANGELES SELECTION, 2017`, or allow pills to wrap. No `white-space: nowrap` on any pill wider than about 300px.
11. **Whitney place is overstated.** The bio says the Whitney assistant curator "echoed" the selection in 2018, but it does not say the exhibition was in New York. Timeline: `2018` "Selected again by the assistant curator for the Whitney, New York". Table place: "—", not "New York".
12. **Mirrored view must be labelled where it shows.** When MIRRORED is on, whether on the detail page or in the Reader, show a persistent overlay chip `MIRRORED VIEW` on the image. Reset it on navigation, so nobody saves or shares a flipped artwork as the real one.
13. **Related row and the inline form.** In the scroll-snap carousel, set `align-items: start` so opening one card's sheet doesn't stretch the others. Make sure the opened sheet sits within the visible card width on mobile; the spec says "scrolls fully into view", so test it at 390px.
14. **COPY pill fallback.** `navigator.clipboard` can reject (permissions, older Safari). On failure, select the address text and show `SELECT + COPY` rather than a false `COPIED`.
15. **Painting detail sticky panel only from 1024px up.** On mobile it must be static, or it will cover the image and the opened dropdown.
16. **Portfolio stub titles.** PDF titles and store titles disagree in `portfolio-structure.json` (for example, PDF "Keep It Simple" is store "Live Luxuriously"). When an entry links to painting.html, caption it with the store title so the link target matches. Otherwise use the PDF title, marked as provisional.

## Fidelity and art-as-hero notes (advice, not blocking)
- Add Isembard's full-height vertical gutter hairlines (visible at the gutter edges in the capture) as a fixed, aria-hidden, 1px `--edge` frame. It is cheap and one of the most recognisable cues, more than the crosshairs.
- Geist is a credible neutral stand-in, but Isembard Sans is rounder and more geometric. Compare glyphs ("a", "t", "e") against the capture before locking. If Geist reads as generic Vercel, try Host Grotesk or Hanken Grotesk at the same weights.
- Chapter numerals at 150px plus big stat numerals risk out-shouting the art. Cap the chapter opener at about 120px on desktop, and keep only one oversized numeral block per screen.
- Dark theme gives a dark mat behind light paintings. That is C's risk again, now for every phone set to dark mode, because the default is System. Make the dark `--field` a lighter neutral (about #2e3135) so image edges still read.
- On mobile the "who she is" sub-line drops below the card. D3 is still met, because the eyebrow carries Houston and "since 2017". If it fits after fix 1, keep it above the card.

## Risk
The biggest single risk is the hero. A pale blurred gallery photo under white text will fail contrast in both themes, while the extra hero furniture (blur field, sharp photo, card, caption) pushes Request info toward the 664px fold. Measure both from a real 390x664 capture before building anything below the hero.
