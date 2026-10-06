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
