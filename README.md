# Sleet Systems brand site — `sleetsystems-site/`

The corporate landing page for **Sleet Systems Inc.** — the parent company. SleetPOS is the product; this is the company website that introduces it.

It deploys to **`sleetsystems.com`** via Vercel.

This is intentionally simple: a single static HTML file, no build step, no framework. It exists primarily to satisfy:

- **Twilio A2P 10DLC brand registration** (which rejects parked domains).
- **App Store reviewer requirements** for a publicly accessible privacy policy / terms of service.
- A first-impression page for prospects who Google "Sleet Systems" before talking to us.

## Contents

- [`index.html`](./index.html) — the entire site. Inline CSS, Inter font from Google Fonts, no JavaScript. Includes the brand description, a pointer to SleetPOS at `sleetpos.com`, an inline privacy policy, terms of service, and SMS messaging disclosure.

## Setup

There is no setup. Open the file in a browser to preview locally:

```bash
open sleetsystems-site/index.html
```

## Deploy

Push to `main`. Vercel deploys automatically.

The Vercel project is `sleetsystems-projects/sleetsystems` (separate from the SleetPOS Vercel projects). DNS is on Porkbun:

- `A @ → 76.76.21.21`
- `CNAME www → cname.vercel-dns.com`

If DNS ever needs to be re-pointed, the Porkbun login is in 1Password (Sleet Systems Operations vault).

## Editing

Just edit `index.html` directly. It's hand-written HTML — keep it that way. If it ever grows beyond what one HTML file can sustain, we'll convert it to Next.js then, not preemptively.

## Gotchas

- **No framework.** Don't reach for Tailwind, React, or a build step. The point of this folder is that it's the one piece of infrastructure that never breaks because there's nothing to break.
- **Privacy / terms / SMS disclosure** are also bundled in-app for the iOS app and the dashboard. If you change them here, mirror the change in [`sleet-dashboard/app/legal/`](../sleet-dashboard/app/legal) and [`sleet-ios/app/legal/`](../sleet-ios/app/legal).
- **DNS conflicts to watch out for.** Porkbun's default parking ALIAS, wildcard CNAME, and parking SPF TXT have been deleted; if Porkbun ever resets them automatically, the Twilio A2P registration will start failing again.
