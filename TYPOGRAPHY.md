# SleetPOS typography and visual style

Approved merchant website direction · October 6, 2026

The typeface is **Manrope**. Use it for page headings, body text, navigation, buttons and forms. The logo is artwork; do not recreate it with typed text. POS screenshots retain the actual software's typography. Printed label samples retain the label renderer's Roboto fonts.

## Family and weights

```css
font-family: Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

| Role | Weight | Use |
| --- | --- | --- |
| Body and descriptions | 400, regular | Paragraphs, helper text, input values |
| Headlines and navigation | 500, medium | Page titles, section headings, links |
| Controls and emphasis | 600, semibold | Buttons, form labels, important prices |
| Strong emphasis | 700, bold | Sparingly, within text; not the default headline |

Static pages load Manrope from Google Fonts with `display=swap`. Keep the fallback stack. Use a local or Next.js-managed copy for the dashboard auth pages. Do not change the merchant dashboard's other fonts as part of a website revision.

## Type scale

Sizes below are CSS pixels. Responsive titles scale with viewport width; browser zoom and accessibility settings may enlarge them.

| Element | Desktop | Phone (≤680 px) | Weight | Line height | Letter spacing |
| --- | --- | --- | --- | --- | --- |
| Homepage hero | `clamp(54px, 5.55vw, 80px)` | `clamp(44px, 11.7vw, 65px)` | 500 | 1.045 | −0.062em |
| Book/demo, signup and related page title | `clamp(44px, 4.6vw, 64px)` | `clamp(38px, 10.5vw, 48px)` | 500 | 1.08 | −0.055em |
| Pricing page title | `clamp(38px, 4.2vw, 60px)` | 38px | 500 | 1.12 | −0.055em |
| Main section heading | `clamp(36px, 3.65vw, 52px)` | Same fluid rule; usually 36px | 500 | 1.12 | −0.055em |
| Label feature heading | `clamp(40px, 4vw, 58px)` | 40px | 500 | 1.12 | −0.055em |
| Subsection/card heading | 24–28px | 22–25px | 500 | 1.2–1.3 | −0.03em to −0.045em |
| Homepage introduction | 19px | 16px | 400 | 1.65 | Normal |
| Related page introduction | 18px | 16px | 400 | 1.75 | Normal |
| Main body | 16px | 16px | 400 | 1.65 | Normal |
| Feature descriptions | 15px | 15px | 400 | 1.75 | Normal |
| Navigation | 13px | 16px in expanded menu | 500 | 1.65 | Normal |
| Main buttons | 15px | 14–15px | 600 | 1.35 | Normal |
| Homepage hero button | 14px | 13px | 600 | 1.35 | Normal |
| Form label | 14px | 14px | 600 | 1.65 | Normal |
| Input, select, textarea | 16px | 16px | 400 | 1.5 | Normal |
| Helper text | 13–14px | 13–14px | 400 | 1.6–1.7 | Normal |
| Image caption | 12px | 11–12px | 400 | 1.6 | Normal |

Homepage hero breakpoint exceptions retained from the approved design:

- 921–1120px viewport: `clamp(48px, 5.5vw, 63px)`.
- 681–920px viewport: `clamp(42px, 5.5vw, 51px)`.
- 1600px and wider: 82px.
- At 1280px wide, the main headline is about **71px**. At 390px wide, it is about **46px**.

Authentication pages use a 46px title on desktop and 36px on mobile, weight 500, line-height 1.08 and tracking −0.055em. Auth buttons and inputs use 16px text and a 52px minimum height; inputs have a 10px radius. Manrope is bundled locally with its OFL license and applied only to the public auth routes. Keep input text at 16px or more on phones.

## Color and layout

| Token | Value | Purpose |
| --- | --- | --- |
| Ink | `#152532` | Main text and primary buttons |
| Slate | `#61717e` | Secondary text |
| Link blue | `#1478b8` | Link hover/active accents |
| Mist | `#edf5fb` | Supporting surface |
| Line | `#dce5eb` | Dividers and borders |
| White | `#ffffff` | Main background |

- Align text to the left. Keep body lines roughly 45–70 characters.
- Keep headings in sentence case. Do not add widely spaced uppercase labels.
- Use white space and a clear size hierarchy; avoid heavy bold headlines and decorative font changes.
- Primary buttons are dark ink with white semibold text and a pill radius. Inputs use an 8px radius and at least 48px height.
- Desktop content width: up to 1280px, with 48px outer gutters (32px below 1120px, 20px on phones).
- Related pages start 65px below the header, or 37px on phones. Space a page intro paragraph about 23px below its title, or 20px on phones.
- Show visible keyboard focus. Respect reduced motion. Avoid new scroll-driven reveal effects.

## Source of truth

- `assets/merchant-system.css`: shared family, colors, weights, header and controls.
- `assets/merchant-pages.css`: related pages, forms and feature library.
- `assets/hero-showcase.css`: approved homepage typography and layout overrides.
- `assets/showcase.css`: pricing and existing product-page styling.
- `assets/merchant-documents.css`: typography-only alignment for shared policy pages.

Load shared system styles after the base `merchant.css`; load page-specific styles after the system. Use these rules instead of adding another page-local font stack or arbitrary headline weight. Shared policy text and auth behavior are independent of this visual specification.

Cal.com controls the contents of its embedded booking calendar. The surrounding page uses this specification; the embed uses Cal.com's supported light theme and brand-color settings. Its internal font is managed by Cal.com.
