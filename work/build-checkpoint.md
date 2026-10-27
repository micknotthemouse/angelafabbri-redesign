# Build checkpoint — angelafabbri-redesign

## 2026-10-23 — directions workflow running

**Running:** Workflow `af-option-d-isembard` (run wf_3d7f057c-441, task wkztiaxcz; script `C:UsersMNowo.claudeprojectsC--Users-MNowoc1c04d4-33b4-52d8-8bbc-9826b7ea160cworkflowsscriptsaf-option-d-isembard-wf_3d7f057c-441.js`): Option D mockup in the Isembard.com visual language (user request 2026-10-25, scope confirmed: home + paintings + detail, like A/B/C) → Opus spec `work/design/option-d.md` + skeptic `skeptic-review-d.md` → Sonnet build `docs/option-d/` → verify/fix → landing card. Reference captures in `work/research/isembard/`. When done: spot-check `work/screens/option-d/` PNGs (both themes), commit + push docs, curl the Pages URL, update decisions.md (D11: Option D requested as a fourth direction), changelog, checkpoint, report. Phase 1 and 2 DONE (see Status).

**Links:** Pages site https://micknotthemouse.github.io/angelafabbri-redesign/ (repo https://github.com/micknotthemouse/angelafabbri-redesign, Pages from `main:/docs`). Live site https://angelafabbri.com (Shopify, Dawn 15.2). Storeify quote-app config decoded at `source/data/storeify-config.json` (contains the current and business email addresses; do not copy into the vault).

**Status 2026-10-23 (later):** directions workflow DONE (15 agents, all verified). Options pushed and served: A "Paper & Pigment" (editorial gallery, warm paper, serif), B "Mirror Studio" (color-forward, mirrored words, pink/black), C "After Hours" (dark concierge gallery). Research brief `work/research/brief.md`, specs `work/design/option-{a,b,c}.md`, skeptic `work/design/skeptic-review.md`, screenshots `work/screens/option-*/verify-*/`. Known minor leftovers per verifier: A lazy-load gaps on sold cards in headless capture, lightbox alt set by JS; C demo badge overlaps card text at 390px, hero grows when dropdown opens.

**Pending from user:** none for the build (D10: Option C chosen). Still open: whether the unmatched blue "I Don't Understand You Either" stays in the portfolio at PDF resolution. Angela to confirm the inquiry address switch in Shopify admin (Apps > Request a Quote > form "I'm Interested!" > Send to) when she is ready; not part of the demo.

**Open risks:** not tested on a real phone (touch swipe in the portfolio, dropdown success state in a live browser); 4 paintbrush sculptures missing from Shop (HEIC-only CDN images); desktop portfolio page 9 (Shows & events) scrolls inside its stage without a cue; Gift Bag item appears under Coasters because the live collection includes it; commissions page copy is draft for Angela to edit; the blue "I Don't Understand You Either" uses the low-res PDF image.

**Next step:** collect feedback from the user and Angela on the full site; apply change requests as bounded fixes (one Sonnet agent per page group, re-verify only the affected pages), push. If Angela wants it real: plan the Shopify implementation per architecture.md (Dawn customization or new theme, inline Storeify form or native contact form, hide prices on painting collections, portfolio page template) and the Storeify Send-to switch.

Decisions D1–D10 are in `decisions.md`.
