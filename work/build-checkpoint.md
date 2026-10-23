# Build checkpoint — angelafabbri-redesign

## 2026-10-23 — directions workflow running

**Running:** nothing. Phase 2 workflow `af-site-c-build` (wf_2cdf3b4b-10b) DONE: 13 agents, all 5 verify groups passed round 1, link check 0 broken. Full site pushed and live at the Pages URL under /site/. Phase 1 DONE (see Status).

**Links:** Pages site https://micknotthemouse.github.io/angelafabbri-redesign/ (repo https://github.com/micknotthemouse/angelafabbri-redesign, Pages from `main:/docs`). Live site https://angelafabbri.com (Shopify, Dawn 15.2). Storeify quote-app config decoded at `source/data/storeify-config.json` (contains the current and business email addresses; do not copy into the vault).

**Status 2026-10-23 (later):** directions workflow DONE (15 agents, all verified). Options pushed and served: A "Paper & Pigment" (editorial gallery, warm paper, serif), B "Mirror Studio" (color-forward, mirrored words, pink/black), C "After Hours" (dark concierge gallery). Research brief `work/research/brief.md`, specs `work/design/option-{a,b,c}.md`, skeptic `work/design/skeptic-review.md`, screenshots `work/screens/option-*/verify-*/`. Known minor leftovers per verifier: A lazy-load gaps on sold cards in headless capture, lightbox alt set by JS; C demo badge overlaps card text at 390px, hero grows when dropdown opens.

**Pending from user:** none for the build (D10: Option C chosen). Still open: whether the unmatched blue "I Don't Understand You Either" stays in the portfolio at PDF resolution. Angela to confirm the inquiry address switch in Shopify admin (Apps > Request a Quote > form "I'm Interested!" > Send to) when she is ready; not part of the demo.

**Open risks:** not tested on a real phone (touch swipe in the portfolio, dropdown success state in a live browser); 4 paintbrush sculptures missing from Shop (HEIC-only CDN images); desktop portfolio page 9 (Shows & events) scrolls inside its stage without a cue; Gift Bag item appears under Coasters because the live collection includes it; commissions page copy is draft for Angela to edit; the blue "I Don't Understand You Either" uses the low-res PDF image.

**Next step:** collect feedback from the user and Angela on the full site; apply change requests as bounded fixes (one Sonnet agent per page group, re-verify only the affected pages), push. If Angela wants it real: plan the Shopify implementation per architecture.md (Dawn customization or new theme, inline Storeify form or native contact form, hide prices on painting collections, portfolio page template) and the Storeify Send-to switch.

Decisions D1–D10 are in `decisions.md`.
