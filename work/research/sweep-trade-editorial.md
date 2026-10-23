# Sweep 3: trade/designer presentation + editorial web design refs
Date 2026-10-23. Sites actually opened (fetched or curl-grepped): 24. Failed/blocked: hauserwirth.com (429), gagosian.com (403), artworkarchive Bailey Silva (403), fontalternatives suisse-intl (404). Caveat: the fetch tool returns text, so visual claims about big gallery sites are limited to structure plus CSS font names I grepped.

## A. Designers, consultants, galleries

### A1. Artist/retailer trade pages (opened)
- Angela Simeone, https://angelasimeone.com/pages/trade-program : headline "Original art and bespoke commissions, to the trade." Press-logo strip plus one project photo. Two tiers (ready-to-ship originals; bespoke commissions about 4 weeks, two paintings made so client picks at reveal). One flat discount: 20% off retail for verified designers. Entry = ONE email from studio address (firm name, website, needs) with a pre-filled template; primary CTA "Email the Studio", secondary "Browse Paintings Available Now". Assets offered: hi-res images, transparent PNGs, dimensions/weight, series tear sheets, pre-shipment videos, flat-fee hand delivery. Payment in full at order (noted as likely friction).
- Abstract House, https://abstracthouse.com/pages/art-for-interior-designers-and-project-managers : sourcing-partner positioning; 3 pillars (art in every medium, framing/bespoke, project scale); residential vs commercial blocks; "Why choose us" list; two named project case studies; CTA "Open A Trade Account". No project enquiry form on page (newsletter only).
- The Future Perfect, https://thefutureperfect.com/trade/overview : audience selector in the inquiry form ("Individual / Designer-Architect"), short pitch, Join/Login, six benefits (trade discount + price match, consolidated insured shipping, early access, VIP previews, custom commissions, free samples/swatches), direct phone line to trade team. Tone: polished, concierge.
- ArtStar, https://www.artstar.com/blogs/news/what-is-a-trade-program : application (business name, role, contact; portfolio link or tax ID as proof), approval 1-3 business days, free membership, dedicated advisor, curated boards/palette collections. Friction = verification wait.
- Search snippets only (not opened): Minted, Wescover, Artful Home (requires tax ID/resale cert), Bailey Silva (20% single piece, 30% multi/repeat, 3-day approval).
- Pattern: designers' pain = verification delay + unknown pricing. Lowest friction seen = no account, one email, personal reply. For Angela (no public prices): a "request trade info" form with firm name + website only, with a stated reply time.

### A2. What designers want (artsyshark, https://www.artsyshark.com/2016/10/13/how-artists-can-work-with-interior-designers/ , opened)
Flexibility on size/colour/format; reproductions as budget option; realistic (not low) commission bids; shipping options not inflated plus hanging/installer info; designers discover artists via Instagram/Facebook then research them; explain what makes the work distinctive and which spaces suit it; professionalism and follow-through. A search result (not opened) recommends a curated PDF lookbook (dimensions, medium, trade pricing on request) over "go see my site".
Implication: the portfolio page should pair (a) fast in-page browse, (b) a "Download PDF" link, (c) a sizes/commission/lead-time/shipping block, (d) one-click contact. Angela's PDF is the lookbook; the HTML page is the faster front door.

### A3. Gallery submission conventions (opened: thepracticalartworld.com 2011 article, agora-gallery.com guide)
- Reviewers look at images FIRST, then statement, CV, bio. So the portfolio must open on work, not text.
- Focused set: Agora says 4-6 works with a consistent language; Practical Art World says 10-20 recent works. Treat 12-20 curated as the range.
- Package = images (JPEG, about 2000px long edge), statement (about 500 words max, shorter better), CV/exhibition history (exhibitions, publications, press, collections), short bio, contact info, optional works-list PDF with numbered file names.
- CV conventions: education, solo/group exhibitions (year, venue, city), awards, press, collections; reverse chronological. Angela's bio has no education line, so lead with exhibitions/press/collections.
- Avoid: pushy follow-up, unrequested proposals, price lists to non-commercial venues.
- 60-second test (my synthesis, not sourced): first screen shows name, medium, what the work looks like, 2-3 hardest credentials (Florence Biennale 2019, Marfa solo, Miami Art Week, MOCA LA / Whitney curator selections, River Oaks District popup), press names, contact. Then work, then CV.

## B. Editorial / art-forward design refs

### B1. Real fonts used by institutions (grepped from live CSS)
- Whitney https://www.whitney.org : Haas Grotesk (Text + "Sign" display cut). Free stand-in: Inter / Libre Franklin.
- Tate https://www.tate.org.uk : Tate New Pro (custom, Thin to Bold). Stand-in: Libre Franklin / DM Sans.
- MoMA https://www.moma.org : MoMA Sans (+ Condensed, 100-900). Stand-in: Barlow Condensed for tight labels.
- Pace https://www.pacegallery.com : LFT Etica + Untitled Sans. Stand-in: Inter, Hanken Grotesk.
- David Zwirner https://www.davidzwirner.com : Avenir Next (Medium/Demi), fallback Roboto/Helvetica Neue; Swiper for carousels. Long single column of card rows (artist / title / venue / dates); nested nav (Artists, Exhibitions, Fairs, Collect, Stories, Books, About).
- Saatchi Gallery https://www.saatchigallery.com : Calibre. Stand-in: Inter.
- Serpentine https://www.serpentinegalleries.org : fonts not found; structure = featured carousel, What's On cards (image, title, venue, dates, "Free", blurb), venue cards.
- Takeaway: institutions overwhelmingly use ONE neutral grotesk for everything so the art supplies the colour. Serif display is the exception (editorial/brand moments); style references describe "neo-grotesque for structure plus a light display serif over imagery".

### B2. Google Fonts stand-ins (fontalternatives.com scores are that site's own judgement)
- Canela (paid): Fraunces 80% (closest; soft/wonk axes), Lora 77, Crimson Pro 75, Cormorant Garamond 73, Bricolage Grotesque 55, Instrument Serif 52 (sharper display serif; still a popular modern pick).
- GT Super: Fraunces, Playfair Display (high contrast), EB Garamond, Crimson Pro.
- GT Sectra: Merriweather 78, Lora 76, Literata 75, Crimson Pro 74.
- Neue Haas Grotesk: Inter 86, Roboto 82, Source Sans 3 80, Libre Franklin 78, DM Sans 76, Barlow 74.
- Suisse Intl / Neue Montreal / Sohne: source page 404. From my own knowledge (unverified here): Inter, Hanken Grotesk, Instrument Sans, Public Sans, DM Sans.
- Suggested pairings (my synthesis; test at size): Fraunces (light, opsz) + Inter; Cormorant Garamond (large, italic accents) + Libre Franklin; Instrument Serif headings + Inter or Instrument Sans; Playfair Display + DM Sans for a louder luxury read. For "modern edge" echoing her backwards text: Bricolage Grotesque, or Barlow Condensed labels, plus a serif for statements.
- Verify each on fonts.google.com before shipping (the specimen page was a JS shell and gave no detail); use display=swap and only needed weights.

### B3. Lightbox / gallery / scroll
- PhotoSwipe 5.4.4 https://photoswipe.com (opened): MIT, no dependencies, single CSS file, ES module with no build step. NOTE (my knowledge): browsers block module imports on file://, which conflicts with the file:// requirement. Recommendation: write a small vanilla lightbox (dialog element, pointer-event swipe, arrow keys, Esc, focus return) instead.
- Swiper is what Zwirner uses (seen in CSS). Native alternative: CSS scroll-snap (scroll-snap-type: x mandatory), no JS, works everywhere; best for a horizontal gallery on mobile.
- Awwwards element pages (opened one, text only, visuals not inspected): Lumen Artspace "Art Lightbox" (lightbox + flip) https://www.awwwards.com/inspiration/art-lightbox-lumen-artspace ; also listed: Horizontal Scroll, Gallery Grid, UNVEIL "Fullscreen mode on mobile". Pointers only.
- Scroll-driven reveals: CSS animation-timeline (view()/scroll()) is Chromium 115+; Safari support reported from 26 by one non-primary source (another says 18.4, conflicting); Firefox unresolved. MDN says "Limited availability, not Baseline" https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline . Use @supports (animation-timeline: view()) for the enhancement with an IntersectionObserver fade-up as default; respect prefers-reduced-motion.
- Mobile premium feel (synthesis): full-bleed first image at 100svh, large type, scroll-snap rows with the next card peeking, tap-to-fullscreen with swipe, counter ("3 / 18"), caption with title/medium/size, no autoplay carousels.

## C. Recommendations for the options
1. Portfolio order: hero on work + one-line credentials, selected works (lightbox), statement/bio, CV list (exhibitions / press / collections), commissions + sizes + lead time, contact (name, firm, email only), PDF download secondary.
2. Designer lane (Simeone model): no price grid (D2). "Request trade info" form: name, firm, website/email; promise a reply time (placeholder for Angela to confirm).
3. Typography: one neutral grotesk (Inter or Libre Franklin) + one expressive serif (Fraunces or Instrument Serif) for headlines; small tracked labels. One option can go bolder (condensed display).
4. No scroll-hijacking; reveal effects optional behind @supports.
