# Sweep 2: conversion patterns, inquiry-first original art ($500 to $25k)
Date 2026-10-23. Method: 11 searches, 7 pages opened and read, plus search-summary-only sources (marked "search only"). Failed fetches: Hiscox PDFs, Artsy 2024 PDF (binary), Think with Google (redirect), 8thwall (redirect), Artsy editorial (403).

## Evidence level key
E1 = survey or platform data (vendor-run, so biased but quantified). E2 = established UX research from a neutral publisher. O = opinion or anecdote.

## 1. Showing vs hiding prices (biggest tension with decision D2)
- E1: Artsy Art Collector Insights 2024 (via search summary, [Il Sole 24 Ore](https://en.ilsole24ore.com/art/collectors-demand-transparency-prices-gallery-owners-do-not-respond-AHhEXSV), [Artsy report PDF](https://pages.artsy.net/rs/609-FDY-207/images/Collector%20Insights%20Report%202024.pdf?version=0), not read directly): 95% say a listed price matters buying online; lack of visible price is the top obstacle (56%); two thirds say a missing price stopped a purchase; one respondent: "Having to inquire is a barrier to purchase." The claim "priced works sell up to 5-6x more often" circulates widely but is secondary and unverified. Artsy sells marketplace transparency, so it has a stake.
- O: [Artsy Shark, Edlund](https://artsyshark.com/?p=30915) (read): list prices, at minimum a range; mark sold/NFS separately. No data, anecdotes only.
- O: [ArtHelper thread](https://www.arthelper.com/community/smallwins/post/pricing-visible-or-hidden-on-your-own-site) (read): most favor visible prices; the counter-argument (a hidden price starts a conversation that helps close) is also anecdotal. No data.
- Implication: the evidence is mostly marketplace data about anonymous buyers. For an established artist with name recognition and high-end originals, hiding prices is defensible, but the research leans against it. Cheap mitigation that keeps D2: state a range in copy ("Originals from $X") or "Price on request, reply within 1 business day" in the form. Flag to Angela as a tradeoff, not a settled fact.

## 2. Inquiry form: inline vs modal
- E2: [NN/g modal vs nonmodal](https://www.nngroup.com/articles/modal-nonmodal-dialog/) (read): modals break context, cover content, add interaction cost; use only when the interruption is worth it. Inline keeps the painting visible.
- E1 weak: static forms 45.5% vs modal 26% success ([WPForms stats roundup](https://wpforms.com/online-form-statistics/), search only, methodology unverified). Directional only.
- Supports D4 (inline, painting stays in view, title auto-attached).

## 3. Form length
- E2 limited: [Baymard #668](https://baymard.com/guidelines/668-number-of-form-fields) (opened, paywalled): too many fields intimidate; average checkout has 15 fields, twice what is needed ([Amazon Pay summary](https://pay.amazon.com/blog/the-baymard-report-series-too-many-fields-too-little-time), search only). Checkout, not inquiry.
- Mixed E1: [Venture Harbour roundup](https://www.ventureharbour.com/how-form-length-impacts-conversion-rates) (search only): HubSpot found more fields lower conversion but not linearly, with textareas and dropdowns hurting most; an Unbounce/Aagaard test found cutting fields dropped conversions 14% when the removed fields were ones users wanted. Expectation fit matters more than raw count.
- Implication: name + email + optional note is right. Keep Note clearly optional and small. Do not add phone, budget or address.

## 4. Trust signals
- E1: Hiscox Online Art Trade Report ([2013](https://www.hiscox.co.uk/online-art-trade-report/docs/hiscox-online-art-trade-report-2013.pdf), [2014](https://www.hiscox.co.uk/online-art-trade-report/docs/hiscox-online-art-trade-report-2014.pdf); search summary only, PDFs unreadable): main barrier to buying art online is provenance/authenticity (80% in 2013); condition reports, certificates of authenticity and seller reputation are key. Dated.
- E1 vendor: Saatchi Art "View in My Room": about 4x conversion and 17% higher spend for users ([8thwall case study](https://www.8thwall.com/customer-work/saatchi-art-integrates-largest-deployment-of-webar-ecommerce), search only; agency-written); a Saatchi survey said 70% of buyers hesitate because they cannot see the work in place. Self-selection bias likely. A static "in a room" image is a cheap proxy.
- O: [Artweb](https://blog.artweb.com/how-to/add-customer-testimonials-to-your-website-to-help-increase-sales/) and [Wiser Review](https://wiserreview.com/blog/social-proof-for-artists/) (search only): bio plus photo, collector testimonials, work in collectors' homes. The "+34% / +80% reviews" figures are vendor claims.
- Implication: Angela's strongest assets (Florence Biennale, Miami Art Week, press names, hundreds of collections) should sit near the first Request info, not buried on Bio. Add "certificate of authenticity included" and a shipping/insurance line if true (confirm with Angela).

## 5. Scarcity and availability
- No rigorous evidence found for "only 1 left" on unique works ([Bamberg paper](https://web05.iis.uni-bamberg.de/literature/pdf/276.pdf) notes the lack of online evidence; search only). Vendor blogs claim lifts; one warns fake scarcity kills trust.
- Logic: every original is already 1 of 1, so scarcity is real. Honest signals ("Original, 1 of 1", "Available", "Sold") are safe; avoid manufactured timers.

## 6. Sold works and commission CTA (user's latest request)
- Practice, not research: Artcloud removes the Purchase button when an item is no longer active and keeps Inquire so visitors can be referred to a similar piece or a custom one ([Artcloud help](https://help.artcloud.com/knowledge/add-or-remove-inquire-or-purchase-buttons-from-your-website)); Artfinder shows commissioned pieces as sold ([Artfinder](https://sellers.artfinder.com/article/708-commissions-feature)). Both search only.
- [Artsy Shark](https://artsyshark.com/?p=30915) (read): separate sold from available; commissions typically run about 10% above regular prices; invite inquiry.
- Implication: sold paintings show a "Sold" label, and the CTA becomes "Sold. Submit commission inquiry", opening the same inline form with context "Commission inquiry inspired by [title]". It must not offer a plain "Request info" on a sold piece. Sold works also act as proof of demand. Research is supportive but thin.

## 7. Newsletter capture
- E2: [NN/g popups](https://www.nngroup.com/articles/popups/) (read): early or interrupting email asks backfire and users assume spam; prefer slim dismissible banners or engagement-triggered nonmodal prompts; one overlay at a time.
- O: [Artsy Shark mistakes list](https://www.artsyshark.com/2014/10/14/10-website-mistakes/) (read): most sales do not happen on a first visit, so capture emails.
- Implication: inline footer/section signup, no entry popup; offer "get notified of new releases" after a Request info success.

## 8. Mobile and speed to first CTA
- E2: Core Web Vitals "good": LCP at most 2.5s, INP at most 200ms, CLS at most 0.1 at the 75th percentile ([web.dev](https://web.dev/articles/vitals), read). Google's bounce-vs-load-time figures could not be fetched, so not cited.
- Implication: size the hero with the width param, high priority on the hero only, explicit width/height to avoid layout shift, lazy-load below the fold, Request info visible without scrolling at 390px; avoid sticky bars that cover the form.

## 9. What kills artist sites
- O (Edlund, [10 mistakes](https://www.artsyshark.com/2014/10/14/10-website-mistakes/), read, no data): boring home, dense text, confusing nav, poor images with no detail or in-situ shots, self-focused copy, no email signup, missing description/price, no visible contact email/phone, no FAQ (shipping, insurance, commissions, turnaround). Dated 2014 but consistent with later sources.
- Implication: short buying FAQ near the form, contact email beside the form, medium + size on every card.

## Evidence-backed vs opinion
Evidence-backed (E1/E2): price visibility matters to collectors (survey); modals interrupt (NN/g); popups hurt trust (NN/g); Web Vitals targets. Vendor-biased: Artsy 5-6x, Saatchi 4x AR, form-length studies (mixed). Opinion only: scarcity, testimonials, FAQ, sold-work display, commission CTA wording.
