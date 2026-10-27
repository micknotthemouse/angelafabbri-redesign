# Build checkpoint — angelafabbri-redesign

## 2026-10-23 — directions workflow running

**Running:** nothing. Option D workflow (wf_3d7f057c-441) DONE 2026-10-26: "Studio Index" built, verified, pushed, live at /option-d/ and on the landing page. Phase 1 and 2 DONE (see Status).

**Links:** Pages site https://micknotthemouse.github.io/angelafabbri-redesign/ (repo https://github.com/micknotthemouse/angelafabbri-redesign, Pages from `main:/docs`). Live site https://angelafabbri.com (Shopify, Dawn 15.2). Storeify quote-app config decoded at `source/data/storeify-config.json` (contains the current and business email addresses; do not copy into the vault).

**Status 2026-10-23 (later):** directions workflow DONE (15 agents, all verified). Options pushed and served: A "Paper & Pigment" (editorial gallery, warm paper, serif), B "Mirror Studio" (color-forward, mirrored words, pink/black), C "After Hours" (dark concierge gallery). Research brief `work/research/brief.md`, specs `work/design/option-{a,b,c}.md`, skeptic `work/design/skeptic-review.md`, screenshots `work/screens/option-*/verify-*/`. Known minor leftovers per verifier: A lazy-load gaps on sold cards in headless capture, lightbox alt set by JS; C demo badge overlaps card text at 390px, hero grows when dropdown opens.

**Pending from user:** reaction to Option D versus the After Hours full site (D10): keep C, switch the full site to D, or borrow elements. Also: Still open: whether the unmatched blue "I Don't Understand You Either" stays in the portfolio at PDF resolution. Angela to confirm the inquiry address switch in Shopify admin (Apps > Request a Quote > form "I'm Interested!" > Send to) when she is ready; not part of the demo.

**Open risks:** not tested on a real phone (touch swipe in the portfolio, dropdown success state in a live browser); 4 paintbrush sculptures missing from Shop (HEIC-only CDN images); desktop portfolio page 9 (Shows & events) scrolls inside its stage without a cue; Gift Bag item appears under Coasters because the live collection includes it; commissions page copy is draft for Angela to edit; the blue "I Don't Understand You Either" uses the low-res PDF image.

**Next step:** wait for feedback on D and the full site. If D wins, port the full site (docs/site page set) into the D language with the same 5-builder workflow; if C stays, apply change requests as bounded fixes. Then the Shopify implementation plan if Angela wants it real.

Decisions D1–D11 are in `decisions.md`.
