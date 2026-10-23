# Decisions — angelafabbri.com redesign demo

Decisions made with the user and Angela on 2026-10-23, in order asked.

## D1. Audience priority: collectors first, trade lane second
Homepage sells originals with inline "Request info" on each piece. A clearly visible second lane ("For designers & galleries") leads to the portfolio gallery. Rejected: trade-first (most revenue is direct collectors), split homepage (diluted focus).

## D2. Prices hidden on paintings; "Request info" is the only path
Gallery-style. Accepted tradeoff: fewer ready-buyer self-serve purchases and some unqualified inquiries, in exchange for more conversations. Assumption (not asked): shop merch (coasters, trays, handbags, chairs) keeps prices and a buy path, since those are retail items.

## D3. Hero: Angela with her work
Large photo of Angela with a signature Inversion piece plus one line on who she is. Goal is "learn who she is" plus credibility. Rejected: artwork-only hero (less personal), cinematic reel (less identity).

## D4. Inline request-info form: name, email, optional note
Replaces the Storeify modal with a dropdown directly below the button. Painting title attached automatically. Fewer fields than phone+message for higher completion.

## D5. Portfolio gallery: PDF order, rebuilt pages
Keep the 2026 PDF's page order and wording, rebuild each page in HTML with the high-res CDN artwork. Opens instantly in-page; a "Download PDF" link stays for people who need a file.

## D6. Demo scope: everything, including shop pages
Home, Paintings (all collections), painting detail, Shop (coasters, chairs, merch, trays), Bio, Press, Portfolio gallery, Contact. Shop buy buttons link to the live product pages (no checkout in the demo).

## D7. Inquiry destination: the business address (angela@fabbriology.com)
The live form sends to a Gmail address. The business address is already on file as the shop email in the Storeify Request-a-Quote app. Switch-over is a settings change in Shopify admin (Apps > Request a Quote > form "I'm Interested!" > Send to), no developer access needed. The demo shows a success state only; it sends nothing.

## D8. Viewing: everything on GitHub Pages
Public repo `micknotthemouse/angelafabbri-redesign`, Pages served from `docs/`. Three design directions at `/option-a`, `/option-b`, `/option-c`, the reference copy of the current site at `/current`. Rejected: files in chat (awkward multi-page click-through on a phone).

## D9. Sold paintings never offer "Request info"
Added by the user after the first build started (2026-10-23). A sold painting stays visible (it is social proof) and is marked Sold, but its button reads along the lines of "Sold · Submit commission inquiry" and opens the same inline dropdown in commission mode (Name, Email, optional Note, hidden reference "Commission inquiry inspired by <title>"). Success state: "Commission inquiry sent to angela@fabbriology.com". Reason: today's site shows Request Info on sold work, which produces dead-end inquiries; a commission prompt turns that interest into a sale.

## Technical assumptions (not asked, stated)
- Demo is static HTML/CSS/JS, no build step, no framework. Product images are hotlinked from Angela's Shopify CDN with width parameters, so the repo stays small and the images are already where a Shopify implementation would need them.
- Real implementation path, if she approves: Dawn theme customization (sections + inline form), Storeify form restyled inline or replaced with a Shopify contact form posting to the business address, portfolio as a theme page. Recorded in architecture.md.
- Design direction choice is Angela's, made visually from three built options; no judge panel picks for her. A skeptic reviews all three for conversion and feasibility flaws before build.
