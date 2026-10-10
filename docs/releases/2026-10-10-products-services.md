# Products & Services website expansion

Local preview for the owner's approved slot 2 work. Not deployed.

## Current result

- Shared merchant navigation groups POS Systems, Websites and Store Displays & Signage. It opens on pointer hover, click or keyboard activation; the phone menu uses tap. Escape, focus leaving the submenu and outside clicks dismiss it.
- `/websites` presents custom branding, pages and workflows; café and grocery concepts; a real POS image; and the planned phone-to-register pickup ordering flow. Product discovery and less manual order-taking explain the value without promising guaranteed or effortless revenue.
- Connected pickup ordering is clearly marked **in development**. Copy follows the slot 1 design: website link to ordering page, item selection/payment/pickup time, designated register acceptance, ready/picked-up status and completed sale recording. It does not advertise live inventory syncing, item modifiers or automatic kitchen routing. A standalone website can be scoped separately.
- `/store-signage` shows menu board designs, light boxes and shelving strips, plus two complete store concepts and custom-fit details. Production, installation and artwork updates are scoped explicitly; static artwork is not advertised as automatically synced with POS prices.
- The POS homepage previews both services; merchant footers and company homepage link to them. Existing public route mappings, sitemap, static redirects and dashboard proxy/CSP allowlist include both pages.
- Signup now asks **Do you need a website?** before the timing question: Yes / I have one that needs updating / Not sure yet / No. The optional answer is validated server-side, stored as `signupRequests.websiteInterest` and included in the existing sales notification. Skipped and older submissions remain valid. The separate `website` spam honeypot is unchanged.

## Images

Two store concept images were generated with `image_gen.imagegen`, then converted to 1536 × 1024 WebP assets (approximately 268 and 286 KiB). Captions identify them as AI-generated concepts, not client work. Original PNGs and full prompts are retained in `Design/creatives/custom-services-2026-10-10/` in the parent SleetSystems workspace; `2026-10-10-service-image-provenance.json` also records the prompts in this repository.

Café latte and croissant pictures reuse the owner's October 6 samples. The website mockups and ordering steps use actual HTML text. The owner-supplied POS composition is unchanged and shown with its real screen.

## Validation

Current revision:

- `npm test`: 11 tests pass against the actual signup handler with in-memory Firebase/email adapters. Covers all four answers, omitted answers, invalid values, and separation from the spam honeypot. No accounts, Firestore records or emails were created in production.
- All eight merchant HTML pages checked: no duplicate IDs, missing referenced assets or broken same-page anchors. All 19 inline scripts pass JavaScript syntax checks. Both changed stylesheets parse; git whitespace check passes.
- Browser: desktop 1440px and phone 390px layouts reviewed for service imagery, POS connection and questionnaire. No horizontal overflow in the checked views. Images load. The POS connection link opens the intended section. The website answer persists when going Back. Both Skip and ordinary step progression reach the account form. No credentials entered or account submitted. No console errors during the signup check.
- Screenshots and static-check report: `Design/review/products-services-custom-2026-10-10/` in the parent workspace.

Prior revision validation (dashboard unchanged in this revision):

- Dashboard production build passed with 67 app routes; 13 marketing policy/routing tests passed.
- Local HTTP checks passed for homepage, company, all merchant pages, service slash/no-slash routes and shared assets.
- Browser dropdown click, mobile menu, keyboard Enter/Tab/Escape, quote targets and existing Pricing/Overview behavior passed. Pointer-only hover was not independently isolated by automation.

## Release

Publish static-site and dashboard changes together after owner review. The dashboard owns the public routes; both repositories are required. Verify `/websites`, `/store-signage` and the revised signup questionnaire on www.sleetpos.com after both deployments finish. Do not mark slot 2 delivered before release.
