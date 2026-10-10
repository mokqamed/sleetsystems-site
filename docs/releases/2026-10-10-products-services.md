# Products & Services website expansion

Local preview for the owner's approved slot 2 work. Not deployed.

## Current result

- Shared merchant navigation groups POS Systems, Websites and Store Displays & Signage. It opens on pointer hover, click or keyboard activation; the phone menu uses tap. Escape, focus leaving the submenu and outside clicks dismiss it.
- `/websites` presents custom branding, pages and workflows, an animated interactive café demonstration, a real POS image, and the phone-to-register pickup ordering workflow. Product discovery and less manual order-taking explain the value without promising guaranteed or effortless revenue.
- Public copy presents custom websites, online ordering and SleetPOS integration as services configured for each business. It removes development-status wording and explains project setup, launch and pricing. The pickup workflow follows the slot 1 design; the underlying ordering implementation remains separate slot 1 work and this copy revision does not make it live. The page does not advertise live inventory syncing, item modifiers or automatic kitchen routing. The interactive demo remains labeled as a sample that sends no orders or payments.
- `/store-signage` shows menu board designs, light boxes and shelving strips, plus two complete store concepts and custom-fit details. Production, installation and artwork updates are scoped explicitly; static artwork is not advertised as automatically synced with POS prices.
- The POS homepage previews both services; merchant footers and company homepage link to them. Existing public route mappings, sitemap, static redirects and dashboard proxy/CSP allowlist include both pages.
- Signage quote links now open a three-step form and preselect menu boards, light boxes or shelving strips. Customers can select multiple types and describe dimensions, quantities, board/screen type, indoor/outdoor placement, shelf-strip type, design/production/installation help, artwork, timing, notes, a reference link, budget and contact details. Measurements and quantities can be left unknown. A final summary lets them review and go back before sending.
- `/api/signage-quote` validates the request and emails sales through the existing `RESEND_API_KEY`; it creates no login account or database record. The dashboard forwards this exact endpoint. The browser preserves answers on failure, prevents duplicate clicks while sending and shows success only after the server confirms delivery. Tests use a fake email provider; no real email was sent.
- Removed the dot beside Connected pickup ordering. The public site and auth pages pair the unchanged snowflake with lighter Manrope lettering and balanced spacing. The owner's October 10 request supersedes the earlier artwork-only wordmark rule in `TYPOGRAPHY.md`.
- Removed the owner's home street address and postal code from all public page content and structured search metadata, including corporate contact, support and policy pages. Also removed the duplicate references in the dashboard's support/privacy sources. City/state information and email contacts remain.
- Signup now asks **Do you need a website?** before the timing question: Yes / I have one that needs updating / Not sure yet / No. The optional answer is validated server-side, stored as `signupRequests.websiteInterest` and included in the existing sales notification. Skipped and older submissions remain valid. The separate `website` spam honeypot is unchanged.

## Images

The website service page now uses screenshots of its working demo for the homepage, food menu, product details and promotional pop-up. Separate phone screenshots keep the homepage and menu readable on small screens. The four product photographs reuse the owner's café samples as optimized WebP files. These are real HTML interfaces, not generated screenshots. The original captures are in `Design/review/website-demo-2026-10-10/` in the parent workspace.

Two store concept images were generated with `image_gen.imagegen`, then converted to 1536 × 1024 WebP assets (approximately 268 and 286 KiB). Captions identify them as AI-generated concepts, not client work. Original PNGs and full prompts are retained in `Design/creatives/custom-services-2026-10-10/` in the parent SleetSystems workspace; `2026-10-10-service-image-provenance.json` also records the prompts in this repository.

Café latte and croissant pictures reuse the owner's October 6 samples. The website mockups and ordering steps use actual HTML text. The owner-supplied POS composition is unchanged and shown with its real screen.

## Validation

Latest logo, privacy and signage-form revision:

- `npm test`: 35 site tests pass, including 20 quote-handler cases for selected services and details, normalization/escaping, optional measurements, invalid input, request restrictions and failed email delivery.
- Browser: product-specific quote links preselect their service; multiple selections show matching questions; Back preserves details; desktop review includes all selected services; an intentionally failed request retains answers and a retry succeeds against the actual API handler with a fake provider. The local fixture sent no emails and was stopped afterward.
- Phone at 390px: the tailored shelving-strip questions fit without horizontal overflow. Reviewed the lighter header logo and the rebuilt login page with the real POS image. Confirmed the connection label has no pseudo-element dot.
- All 12 public HTML pages checked for address removal, IDs, referenced assets, scripts and structured JSON. Merchant same-page anchors resolve. Source and whitespace checks pass.
- Dashboard: 16 public routing/security-policy tests pass, including the exact quote endpoint and exclusion of similarly named paths. Production build passes with 67 generated app routes.
- Proof: `Design/review/brand-signage-2026-10-10/` in the parent workspace. Browser screenshots cover the quote form on desktop/phone, login wordmark and dot removal.

Latest copy revision: browser-verified the homepage service description and website POS connection section. Checked the changed pages for stale development wording, duplicate IDs and missing assets; git whitespace checks pass. Proof: `Design/review/website-demo-2026-10-10/connected-services-copy.png`. No scripts or interaction behavior changed.

Latest interactive demo revision:

- `/websites/?demo=cafe` opens the full café concept. `scene=menu`, `scene=product` and `scene=offer` open specific examples. It uses the existing public route and asset proxy; dashboard code is unchanged.
- A finite entrance sequence reveals the brand, headline and café image. Replay and Skip work. Reduced-motion handling skips the entrance and disables transitions; it was inspected in code, not tested by changing the system accessibility preference.
- Menu filters show the correct drinks and bakery items. Product details show photography, prices, descriptions, sample ingredients and quantity controls. The bag supports quantity changes and a sample breakfast discount. The confirmation is explicitly a preview. There are no fetch calls, payment requests or order submissions in the demo.
- Browser checks at 1440px and 390px: automatic entrance completion, Replay/Skip, menu categories, product quantity and bag count, offer discount and total, confirmation, gallery launch buttons, modal focus wrapping, Escape closing only the top view, and restoring the service page when closed. Phone product/offer layouts fit, responsive preview images load, and no horizontal overflow was found in checked views.
- `npm test`: 15 tests pass (4 cart/offer model tests plus the existing 11 signup-handler tests). Static checks cover all 8 merchant pages and 19 inline scripts; new scripts and stylesheets parse, all referenced assets exist, and there are no duplicate IDs, missing same-page anchors or whitespace errors.
- Proof and captures: `Design/review/website-demo-2026-10-10/`. The earlier basic café/grocery website cards have been replaced; store signage examples are retained.

Previous visual/questionnaire revision:

- `npm test`: 11 tests pass against the actual signup handler with in-memory Firebase/email adapters. Covers all four answers, omitted answers, invalid values, and separation from the spam honeypot. No accounts, Firestore records or emails were created in production.
- All eight merchant HTML pages checked: no duplicate IDs, missing referenced assets or broken same-page anchors. All 19 inline scripts pass JavaScript syntax checks. Both changed stylesheets parse; git whitespace check passes.
- Browser: desktop 1440px and phone 390px layouts reviewed for service imagery, POS connection and questionnaire. No horizontal overflow in the checked views. Images load. The POS connection link opens the intended section. The website answer persists when going Back. Both Skip and ordinary step progression reach the account form. No credentials entered or account submitted. No console errors during the signup check.
- Screenshots and static-check report: `Design/review/products-services-custom-2026-10-10/` in the parent workspace.

Prior revision validation (dashboard unchanged in this revision):

- Dashboard production build passed with 67 app routes; 13 marketing policy/routing tests passed.
- Local HTTP checks passed for homepage, company, all merchant pages, service slash/no-slash routes and shared assets.
- Browser dropdown click, mobile menu, keyboard Enter/Tab/Escape, quote targets and existing Pricing/Overview behavior passed. Pointer-only hover was not independently isolated by automation.

## Release

Publish static-site and dashboard changes together after owner review. The dashboard owns the public routes; both repositories are required. Verify `/websites`, `/store-signage`, the signage quote submission, privacy/contact pages, auth wordmark and the revised signup questionnaire on www.sleetpos.com after both deployments finish. Do not mark slot 2 delivered before release.
