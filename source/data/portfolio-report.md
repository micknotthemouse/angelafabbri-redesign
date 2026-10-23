# AF_Portfolio_2026.pdf structure report

## Method
- pdfjs-dist 4 (legacy build) in Node. Passing a custom @napi-rs/canvas canvasFactory segfaulted; using `doc.canvasFactory` (pdfjs default) worked. Scripts: `work/pdftool/render.mjs` (render + text), `extract.mjs` (embedded images), `match.mjs` (image matching), `build.mjs` (writes the JSON).
- 10 pages, US Letter (612x792 pt), rendered to `work/pdf-pages/2026/page-NN.png` at 1400 px wide. Per-page text in `work/pdf-pages/2026/text.json`.
- Every page was viewed and classified by eye. Artwork pages have no captions, so artworks were identified by comparing each extracted embedded image against all 349 local product images in `source/images` (20x20 pixel distance, then visual confirmation of the top candidates). Good matches score about 13-22; weak ones above 35.
- Embedded images extracted to `work/pdf-pages/2026/extract/` (pNN-imgMM.png, `images.json` has pixel size and placement). The artwork images in the PDF are low resolution (340-1116 px), so the CDN images should be used in the HTML rebuild.

## Page sequence
1 cover (wordmark, quote, installation photo) | 2 artist statement | 3 works x6 (portrait grid) | 4 bio | 5 works x6 (square grid) | 6-7 in conversation (interview with offset-block artworks, 2 works each) | 8 commissions (3 photos + process steps) | 9 shows & events (CV) | 10 contact (+ 7 press logos).
No collection dividers or separate press page exist in this version. The press list is inside page 9 and the logos on page 10.

## Counts
16 artworks shown (6 + 6 + 2 + 2). 15 matched to a store product, 1 unmatched. Of the 15: high 8, medium-high 2, medium 5 (see JSON `confidence`).

## Unmatched
- Page 5, row 2 left: blue "I Don't Understand You Either". No store product with this colourway; nearest is "I Am Bluetiful" (different piece).

## Ambiguities
- Store handles and titles are scrambled (stale "copy-of" handles). Matched by image, so `storeTitle` often differs from the visual title: p3 purple bouquet = "Beauty Like A Rose, Strength Like A Weed"; p3 water tower = "Live Luxuriously"; p3 All The Feels = "I Still Love You Though"; p5 roses = "Now or Never"; p5 Hublot = "Watch This!"; p5 elephant = "Same Same, But Different"; p6 clock = "Buy The Dip"; p6 green Blaze Your Own Trail = "Empty Roads & Playlists"; p7 cactus = "Green Goddess".
- p5 Hublot watch also near-matches the Hublot limited-edition print; chose the original painting listing.
- p7 "It's Rude To Stare" matched on title and lettering; pixel distance is weak for both listed images.
- p5 red piece matched to the "(Fl. Orange)" listing whose image is red.
- Dimensions and medium come from the store listing; the PDF prints none. No years printed.
- Contact page phone and mail icons render as solid black discs in pdfjs; confirm against the original in a PDF viewer.
- Decorative brush strokes, underlines and colour offset blocks behind artworks on pages 6-7 and 8 are vector shapes, not images. Page 8 `img02` and page 1 `img03` are cardboard-letter decorations.

## Comparison with AF_Portfolio_sm.pdf
The older file has 11 pages, but they are web-capture style with varying heights (1025 px wide, 377 to 2633 tall), not US Letter. Sequence: cover, image, artist statement, works grid (6 images), bio, works grid (6 images), in-conversation (one tall page, 4 images), commissions (5 images), CV, press logos strip (7 images), contact. So the structure is the same as 2026 apart from splitting: the 2026 version is a proper letter-size layout with the interview spread across two pages, a cover with the stencil letters and a separate image-only page folded in, and updated CV entries (2025 items appear only in 2026; the sm CV starts at 2021). The press logos are a separate page in sm and merged into the contact page in 2026.
