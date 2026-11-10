# Sleet Systems and SleetPOS public websites

Hand-written static HTML, CSS and JavaScript. No frontend framework or bundler is needed.

- `index.html`: Sleet Systems company website on `sleetsystems.com`.
- `product/index.html`: SleetPOS merchant overview and Pricing view.
- `product/book`, `signup`, `features`, `support`, `partnerships`: related merchant pages.
- `assets/merchant-system.css` and `assets/merchant-pages.css`: shared visual system.
- `TYPOGRAPHY.md`: Manrope sizes, weights, spacing and usage guidelines.
- `api/signup.js` and `api/partner.js`: existing production form endpoints.
- Root policy/SMS pages: shared corporate documents and disclosures.

## Local preview

```sh
python3 tools/preview.py
```

Open `http://127.0.0.1:4317/`. Pricing is `/?view=pricing`, Book a Demo is `/book/`, and the company site is `/company/`. Static pages and assets are served with development caching disabled. This server does not implement form submissions.

Login, password reset and activation are real Next.js dashboard pages in the separate `DASH-merchant-auth` worktree. The local website redirects those paths to its production preview on `http://127.0.0.1:4320`. Start that preview from the dashboard worktree with `npm run build` and `npm run start -- --hostname 127.0.0.1 --port 4320`. These preview redirects exist only in `tools/preview.py`.

## Production routing

The Vercel project `sleetsystems-projects/sleetsystems` hosts this static repository. The merchant dashboard proxies its public routes on `www.sleetpos.com` to this repository's `/product/` pages and `/assets/` files. Authenticated dashboard routes and real login stay in the dashboard project. Keep the public proxy allowlist narrow.

The root `vercel.json` redirects company-domain product links to `www.sleetpos.com`. The dashboard proxies to `/product/…` to avoid redirect loops. Login links use `/login/` on the merchant site. The matching dashboard branch also directs the legacy `/pricing` URL to `/?view=pricing`.

## Release and review

The merchant website and matching dashboard auth styles are a coordinated release. Review proofs and verification records are in `../../Design/review/merchant-website-2026-10-06/`. The dashboard auth source is maintained in its own repository. Pushing `main` deploys each project through its existing Vercel integration; verify both production domains and the proxied merchant routes after release.

Preserve form request contracts and authentication behavior while editing visuals. Use the typography guide rather than introducing page-local font stacks. Policy text has not changed in this revision; if it is changed later, synchronize the corresponding app legal documents.

## First-visit opening

All 14 public pages load `assets/sleet-opening.js` asynchronously. On the first
navigation of a tab session, the approved snowflake opening appears only if the
page is still preparing its visible content after 600 ms. Readiness means the DOM,
above-the-fold eager images, and fonts; analytics, offscreen images, and embeds do
not hold the opening open. It disappears as soon as those are ready, without a
minimum display time. Image errors also count as settled.

The 160 CSS px logo is the only visible opening content, with an accessible
"Loading website" status. The two-second intro plays once and then holds its last
frame. It is removed after at most
8 seconds from navigation, or immediately on keyboard/pointer interaction or
leaving the tab/page. Reduced-motion preferences use a still image. Fast first
visits, subsequent pages, reloads, history restores, and browsers that block
session storage do not show it. A session is scoped to each site's origin and tab;
this is not a permanent first-ever-visitor cookie.

The 320 px website artwork is about 831 KB, renders at 160 CSS px for sharpness on
2× displays, retains the approved 1.5× / 60 fps timing, and is fetched only after
a slow first visit is detected. Regenerate it with `python3 tools/export-opening.py` (Pillow
required). The canonical intro remains 384 px.

Standalone pending states use a 96 CSS px logo with accessible loading copy.
Ready/error text and the calendar fallback link remain visible. Submit buttons
keep their compact 28 px indicator and action text. The shared 3.317-second loop
reverses 50 ms after its shine, matching the approved quick-reverse revision.
Reduced motion uses the still artwork. Run `npm test` to verify the fast, slow,
repeat, accessibility, failure and cleanup cases.
