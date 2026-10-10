# Products & Services website expansion

Local preview for the owner's approved slot 2 work. Not deployed.

## Changes

- Shared merchant navigation groups POS Systems, Websites and Store Displays & Signage. It opens on pointer hover, click or keyboard activation; the phone menu uses tap. Escape, focus leaving the submenu and outside clicks dismiss it.
- `/websites` describes standalone website design for cafés, shops and other businesses, with a desktop/phone concept and a quote inquiry to the existing sales email.
- `/store-signage` covers menu board designs, light boxes and shelving strips, with individual email quote links.
- The POS homepage previews the two services; merchant footers link to them. The company homepage describes and links both services.
- CSS and real text draw the illustrative concepts. Café photos are copies of the owner's existing October 6 latte and croissant assets, used as samples. They are not a client portfolio or installed signage. The approved high-resolution POS image is unchanged.
- New public paths are in the preview server, sitemap, static redirects and the dashboard's exact public proxy/CSP allowlist.

## Checks

- Dashboard production build: passed, 67 app routes generated.
- Dashboard marketing policy and routing tests: 13 passed. Exact new destinations preserve campaign parameters; nested paths and app routes are not captured by these rewrites.
- All eight merchant pages checked for existing assets, unique IDs and internal anchor targets.
- Local HTTP: homepage, company homepage, eight merchant pages (including slash/no-slash service routes), shared scripts/styles and sample assets return 200.
- Browser: desktop 1440px and phone 390px visual review, dropdown click, mobile menu, keyboard Enter/Tab/Escape, quote anchor/email targets, and existing Pricing/Overview behavior. No browser errors on the new service pages. Hover behavior is implemented; pointer-only hover was not independently isolated by the browser automation.
- JavaScript and preview Python syntax, plus git whitespace checks: passed.

Proof files: `Design/review/products-services-2026-10-10/` in the parent SleetSystems workspace.

## Release

Publish the static-site and dashboard changes together after owner review. The site contains new links and the dashboard owns the public routes, so both repositories are required. Verify `/websites` and `/store-signage` on www.sleetpos.com after both deployments finish. Do not mark slot 2 delivered before release.
