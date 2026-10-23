# Changelog — angelafabbri.com redesign demo

## 2026-10-23
- Implemented: project scaffold, public repo `micknotthemouse/angelafabbri-redesign`, GitHub Pages enabled from `docs/`. Verified: Pages URL returned by the GitHub API.
- Implemented: live-site teardown. Platform (Shopify, Dawn 15.2), navigation, 192 products and 19 collections via storefront JSON, 349 product images downloaded, both portfolio PDFs saved, Request-a-Quote app config decoded (fields and destination address identified). Verified: counts from the JSON and download log.
- Decisions D1–D8 recorded in `decisions.md` after a one-by-one session with the user and Angela.
- Implemented: reference mirror of the live site at `docs/current/` (83 pages). Verified: served from the Pages URL, no root-relative links; cart, search and checkout disabled by design.
- Implemented: portfolio PDF teardown (`source/data/portfolio-structure.json`): 10 pages, 16 works, 15 matched to CDN originals. Unverified: the one unmatched work (blue "I Don't Understand You Either").
- Implemented: three design directions at `docs/option-a` (Paper & Pigment, editorial gallery), `docs/option-b` (Mirror Studio, color-forward), `docs/option-c` (After Hours, collector concierge), each with home, paintings grid, painting detail and a portfolio stub; inline Request-info dropdown; sold works show "Sold · Submit commission inquiry" (D9). Verified: headless-Edge renders at desktop and 390px, link check, no painting prices, DOM check of the sold-button variant, 2-click path by code reading. Smoke-checked: desktop screenshots reviewed by the main session. Skipped: real-device interactive test of the dropdown; portfolio gallery (next phase).
- Implemented: landing page `docs/index.html` with screenshots for picking a direction. Verified: all pages return 200 from GitHub Pages.
