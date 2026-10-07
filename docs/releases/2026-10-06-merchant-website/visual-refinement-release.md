# Merchant website visual refinement — October 6, 2026

Owner: “good, i want more images less explanations”. Continuing the approved merchant website publication work.

## Scope

- Replaced the food-service paragraphs with a large café POS scene using the existing Higgsfield scene and actual current TestStore register screenshot. The existing calibrated cafe homography preserves the screen content; the scene waits until both images load.
- Added a screenshot of current Sleet Store Setup with a throwaway demonstration catalogue and an accessible full-screen viewer. No real store data or credentials are included.
- Added three image links above the comparison: dual-price label, customer advertisement and assisted setup.
- Shortened overview copy by roughly 27%; retained the feature library for full explanations. Made business categories and setup steps compact.
- Kept the comparison table and its 37 official source links, the complete Pricing view and placement terms unchanged. The setup example remains one merchant’s reported experience, not a general speed claim.

## Verification

Static validation passed 12 public HTML pages, 62 referenced files, 49 JavaScript syntax checks, seven JSON-LD parses and 16 CSS checks; no missing assets or invalid references. Policy bodies unchanged. Independent source/accuracy review passed; its price-barcode clarification was adopted.

Local 1440px and 390px browser checks: accurate cafe screen mapping, no horizontal document overflow, comparison image links, setup screenshot open/close, kitchen accordion deep link, customer video auto-play and checkout switching, Pricing routing and retained placement terms. No browser errors. No real accounts, bookings, emails, payments or store data were changed.

## Release

Published site main **4dc36b7b99ad8bd43f9c125be3231dbe510b0758**. Vercel production deployment `sleetsystems-delyxisgs-sleetsystems-projects.vercel.app` is READY. Both public merchant homepages and all three changed CSS/image assets returned 200 and matched local file hashes exactly.

Live browser checks passed at 1440px and 390px: all comparison images loaded, eight comparison rows retained, no horizontal page overflow; setup screenshot opened and closed successfully; café scene used the current mapped screen. No browser errors. Browser viewport reset and public comparison left open.

Proofs: `live-visual-comparison.jpg`, `live-visual-comparison-mobile.jpg`, `live-visual-food-service.jpg`, `live-visual-food-mobile.jpg`. Machine-readable results: `visual-refinement-static-check.json` and `visual-refinement-live-http.json`.

Previous release/rollback: site `3460b297cc7eb7e259df207d4e3513eb7670fbf7`. Authentication remains at its already-published release; no dashboard code change in this pass.
