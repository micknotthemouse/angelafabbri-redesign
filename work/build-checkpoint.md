# Build checkpoint — angelafabbri-redesign

## 2026-10-23 — directions workflow running

**Running:** Workflow `af-redesign-directions` (run wf_439cd6d6-2aa, restarted as task w6aafjit0 after adding D9 sold-painting rule to the design/build/verify prompts; script at `C:\Users\MNowo\.claude\projects\C--Users-MNowo-Documents-Claude-angelafabbri-redesign\3c1c04d4-33b4-52d8-8bbc-9826b7ea160c\workflows\scripts\af-redesign-directions-wf_439cd6d6-2aa.js`): 3 research sweeps + Opus brief → 3 Opus design specs + skeptic → 3 Sonnet builds into `docs/option-a|b|c/` → headless-Edge verify + fix rounds → landing `docs/index.html`. Two side agents: site mirror into `docs/current/` (report at `source/data/mirror-report.txt`), portfolio PDF teardown (`source/data/portfolio-structure.json`, `source/data/portfolio-report.md`, renders in `work/pdf-pages/2026/`).

**Links:** Pages site https://micknotthemouse.github.io/angelafabbri-redesign/ (repo https://github.com/micknotthemouse/angelafabbri-redesign, Pages from `main:/docs`). Live site https://angelafabbri.com (Shopify, Dawn 15.2). Storeify quote-app config decoded at `source/data/storeify-config.json` (contains the current and business email addresses; do not copy into the vault).

**Pending from user:** pick one of the three directions once the landing page is up. Angela to confirm the inquiry address switch in Shopify admin (Apps > Request a Quote > form "I'm Interested!" > Send to) when she is ready; not part of the demo.

**Open risks:** Shopify rate-limits scraping (HTTP 429 seen once); mirror agent throttles. Headless Edge path may differ; agents try both Program Files locations. Design quality from Sonnet builders is the main quality risk; verify rounds cap at 2 fixes per option. Nothing pushed yet beyond the scaffold; push after the workflow returns.

**Next step:** when the workflow completes: read its result, spot-check each option's desktop+mobile screenshots, commit and push `docs/`, confirm the Pages URL serves, then send Angela the link and ask for the pick. Then phase 2: full build of the chosen direction (all pages incl. shop, portfolio gallery from `portfolio-structure.json`), architecture.md and changelog.md updates.

Decisions D1–D8 are in `decisions.md`.
