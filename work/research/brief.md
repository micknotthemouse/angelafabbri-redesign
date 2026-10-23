# Design brief: angelafabbri.com redesign options (A, B, C)
2026-10-23. Sources: the three sweeps here plus the `source/html` snapshots (the live site returned HTTP 429 today, so the critique uses same-day snapshots). D1 to D9 are binding; where research disagrees (prices), the decision holds and the tradeoff is noted.

## 1. Rules that matter most for this site

1. **Say who she is in one line, in the hero, over a photo of Angela with an Inversion piece (D3).** Visitors know her name but not her story, and identity heroes do this in a single screen. [jamesniehues.com](https://jamesniehues.com), [nickmayerart.com](https://nickmayerart.com)
2. **Put a real, available painting with its Request info button in the first screen at 390px.** That is the only way the 2-click rule holds without scrolling. Suggested piece: *Fire Horse*, available, Inversion, acrylic on wood panel, 24 x 30 in. [web.dev Core Web Vitals](https://web.dev/articles/vitals)
3. **Request info opens inline, directly under its button. Never a modal (D4).** Modals break context and hide the painting the visitor is asking about. [NN/g](https://www.nngroup.com/articles/modal-nonmodal-dialog/)
4. **Three fields only: Name, Email, optional Note. The painting title is attached and shown as a chip ("About: Fire Horse").** Fields people don't expect cost conversions most, and a single Name field replaces today's first/last split. [Venture Harbour](https://www.ventureharbour.com/how-form-length-impacts-conversion-rates), [Baymard](https://baymard.com/guidelines/668-number-of-form-fields)
5. **Sold works never show Request info. They show a "Sold" label and a "Sold · Submit commission inquiry" button that opens the same dropdown in commission mode (D9).** A sold work that leads to a next step keeps the lead. A dead end loses it. [Artcloud](https://help.artcloud.com/knowledge/add-or-remove-inquire-or-purchase-buttons-from-your-website), [andyokay.com](https://andyokay.com)
6. **Show available works first. Sold works become social proof ("Collected" / archive toggle).** Keeping sold and available apart is standard practice, and a "Just sold" section shows demand. [Artsy Shark](https://artsyshark.com/?p=30915), [singulart.com](https://singulart.com)
7. **Put the hardest credentials right next to the first Request info:** Florence Biennale 2019, Miami Art Week, the Marfa solo show, the MOCA LA and Whitney curator selections, and the press names (Vogue, Washington Post, Houston Chronicle). Seller reputation and authenticity are the main barriers to buying art online. [Hiscox 2014](https://www.hiscox.co.uk/online-art-trade-report/docs/hiscox-online-art-trade-report-2014.pdf), [Wiser Review](https://wiserreview.com/blog/social-proof-for-artists/)
8. **Add a short trust line beside the form: "Original, 1 of 1 · Certificate of authenticity included · Reply within 1 business day."** The certificate is already true (it appears on the product page). The reply time and shipping/insurance wording are placeholders until Angela confirms them. [singulart.com](https://singulart.com)
9. **No prices on paintings (D2). To soften that, say "Price on request" in the form.** Artsy's survey says hidden prices are the top online obstacle. That survey is vendor-run and about marketplace buyers, but it is still the main tradeoff to flag to Angela. [Il Sole 24 Ore on Artsy 2024](https://en.ilsole24ore.com/art/collectors-demand-transparency-prices-gallery-owners-do-not-respond-AHhEXSV)
10. **Give every card a museum caption: title, medium, size, and "Available" or "Sold".** Missing descriptions are a classic artist-site failure. Captions also read as serious to galleries. [jenstark.com](https://jenstark.com), [Artsy Shark 10 mistakes](https://www.artsyshark.com/2014/10/14/10-website-mistakes/)
11. **Explain how an Inversion reads (starts top right; a repeated and a hidden message) in one small visual block.** Today this lives only in product copy, yet it is her most memorable trait. Source: Fire Horse copy in `source/html/af_product.html`.
12. **Make the designer and gallery lane visible on the homepage and in the nav: "For designers & galleries" leads to the portfolio (D1, D5).** Tappan, 20x200, Rise Art and Partnership Editions all give trade a top-level entry. [tappancollective.com](https://tappancollective.com), [partnershipeditions.com](https://partnershipeditions.com)
13. **The portfolio opens on the work: 12 to 20 pieces in the PDF's order, then a short statement, a CV list (exhibitions, press, collections), sizes/commissions/lead time, one-click contact, and the PDF download as a secondary link.** Reviewers look at images first. Designers want sizes, flexibility and follow-through. [Agora Gallery](https://www.agora-gallery.com), [Artsy Shark on designers](https://www.artsyshark.com/2016/10/13/how-artists-can-work-with-interior-designers/)
14. **Show at least one work in a room.** Buyers hesitate when they can't picture it in place; a static in-situ photo is a cheap stand-in (vendor figure). [8th Wall / Saatchi](https://www.8thwall.com/customer-work/saatchi-art-integrates-largest-deployment-of-webar-ecommerce)
15. **Pair the CTAs: one to browse or ask, one to "Meet Angela".** Here the story is a conversion asset, not an afterthought. [lisacongdon.com](https://lisacongdon.com)
16. **Keep merch apart from paintings. Merch keeps prices and a buy link to the live product (D2).** Mixing the two cheapens the originals. [ashleylongshore.com](https://ashleylongshore.com) ("Shop Goodies")
17. **Newsletter goes inline, never as an entry popup. After a successful inquiry, offer "Get notified of new works".** Early interrupting popups hurt trust. [NN/g popups](https://www.nngroup.com/articles/popups/)
18. **Treat speed as conversion:** hero at width=1600 (800 on mobile via srcset), explicit width/height, `fetchpriority="high"` on the hero only, lazy-loading below the fold. Targets: LCP 2.5s or less, CLS 0.1 or less. [web.dev](https://web.dev/articles/vitals)

## 2. What loses conversions on the current site (snapshots of 2026-10-23)

**Homepage**
- The hero image has no identity line and no CTA. "INTERNATIONALLY COLLECTED" and "OBSESSED WITH COLOR" are claims with no proof under them.
- Not a single painting and not a single Request info button. The only content is three collection cards, and two titles repeat (Inversion, Minis, All Paintings).
- No credentials, no press and no designer lane. A first-time visitor can't learn who she is.
- Footer: newsletter and socials, but no visible email address.
- 11 nav sub-links; "AWA" is jargon, "Merch" means handbags, Commission inquiries is buried.

**Collection page (original paintings)**
- 105 works over 7 pages of 16, sorted "Featured" with sold works mixed into page 1 (for example *Donkey Mini (Yellow)*, marked Sold out).
- **Sold works still show Request Info next to the "Sold out" badge.** This is what the user flagged.
- Every card shows a price plus Shopify leftovers ("Regular price… Sale price… Unit price / per"), which contradicts D2 and reads as a template.
- Cards carry no medium or size. Sorting offers "Price, low to high" and "Best selling", but no Available filter.

**Product page (Fire Horse)**
- Request Info opens a Storeify modal with first name, last name and email that covers the painting, and inquiries go to a Gmail address.
- The certificate of authenticity is buried in small print under a color disclaimer.
- No credentials, reply time, in-room view or similar available works.
- Path today: home, collection, product, Request Info, modal, submit: at least 4 clicks plus page loads, versus 2 under D4.

## 3. Five reference sites, one pattern each

1. **Ashley Longshore** ([ashleylongshore.com](https://ashleylongshore.com)): paintings with image and title only and no price, with Commissions and appointments as first-class nav and merch walled off as "Goodies". This is the closest model for D2.
2. **James Niehues** ([jamesniehues.com](https://jamesniehues.com)): a one-line identity headline plus a third-party press quote in the first screen, and a four-item nav.
3. **Angela Simeone trade page** ([angelasimeone.com/pages/trade-program](https://angelasimeone.com/pages/trade-program)): a designer lane with no account, one email, a stated offer (ready-to-ship originals plus bespoke commissions) and a downloadable asset list.
4. **Andy Okay** ([andyokay.com](https://andyokay.com)): sold-out items route to a next step instead of a dead end. Borrow the logic for D9, not the urgency tone.
5. **Jen Stark** ([jenstark.com](https://jenstark.com)): kaleidoscopic peer in pure portfolio mode with museum captions; the model for the portfolio page.

## 4. Do not do

- No modals, entry popups or splash pages (Mr Brainwash adds a click).
- No autoplay hero carousels. One decisive image.
- No prices on paintings, no Shopify price residue, and no "Sale price" text anywhere near originals.
- No Request info on a sold work, and no dead-end "SOLD OUT" with no action.
- No dark overlay that hides a sold painting. Keep the art fully visible and mark it with a quiet label.
- No more than 3 fields. Don't ask for phone, budget or address.
- No fake scarcity or timers. "Original, 1 of 1" is true and enough.
- No scroll-hijacking. Scroll reveals only behind `@supports (animation-timeline: view())`, with an IntersectionObserver fallback and respect for `prefers-reduced-motion`.
- No ES-module lightbox libraries (PhotoSwipe): module imports fail on file://. Write a small vanilla `<dialog>` lightbox instead.
- No sticky bars that cover the open dropdown on mobile.

## 5. Recommended homepage order (a starting point; deviate with a reason)

1. **Slim header.** Logo; Paintings, Shop, For designers & galleries, About, Contact. On mobile, at most one line plus a menu.
2. **Hero (D3, 2-click).** Angela with a signature Inversion piece. One line, for example: "Houston painter of backwards messages and kaleidoscopic color, collected internationally." The hero piece gets its own caption and a **Request info** button that opens the dropdown in place (click 1), then Send (click 2). Secondary link: "For designers & galleries" (D1).
3. **Credential strip.** Florence Biennale 2019 · Miami Art Week · Solo show, Marfa TX · Selected by MOCA LA curators, then the press names as text logos.
4. **Available now.** 6 to 8 available works with museum captions and an inline Request info on each, then "See all available paintings".
5. **How to read an Inversion.** A mirror or flip demo on one piece, showing the repeated and hidden messages.
6. **Meet Angela.** Portrait, 3 sentences (first commission at 16, professional since 2017, hundreds of collections), and "Her story".
7. **For designers & galleries.** Portfolio, sizes, commissions and lead time, then a link to the portfolio.
8. **Recently collected.** 4 to 6 sold works marked Sold, each with "Sold · Submit commission inquiry".
9. **Shop.** Coasters, trays, handbags and chairs with prices and a buy link to the live store.
10. **Newsletter (inline), contact email angela@fabbriology.com, Instagram.**

Success state names the email and offers the newsletter; commission variant per D9.

## 6. Typography and palette (Google Fonts only)

- **The principle:** galleries use one neutral grotesk so the art supplies the color. Add an expressive serif only for statements. Load two families at most, only the weights you need, with `display=swap`. Check each family on fonts.google.com before shipping.
- **Option A, editorial:** Fraunces (light, optical size; the closest free match for Canela) for headlines, with Inter for UI and captions.
- **Option B, gallery-neutral:** Inter or Libre Franklin for everything (closest to Whitney's Haas Grotesk), with small uppercase tracked labels. Zwirner and Pace are the reference.
- **Option C, modern edge:** Bricolage Grotesque or Barlow Condensed display, with Instrument Serif accents. One mirrored-text detail (for example a reversed eyebrow label) echoes the Inversion series. Use it sparingly and keep it readable.
- **Palette:** warm paper background (around #F6F3EE) or pure white, ink text (around #141414), mid-grey meta text that still meets 4.5:1 contrast. Take one accent from her work (hot pink or turquoise) and use it only for the primary button and focus ring. "Sold" goes in quiet ink-on-grey, not red. Focus states: a 2px outline offset in the accent color, visible on both photos and paper.
- **Type scale:** captions 13 to 14px tracked, body 16 to 18px, hero line clamp(32px, 6vw, 64px).

Gaps: no live inline form or sold badge was captured visually; price and form-length evidence is vendor-run or mixed; commission-CTA wording is practice, not research.
