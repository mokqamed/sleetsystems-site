# Clear POS product imagery — October 10, 2026

The owner supplied `composite (12).png` and asked to replace unclear AI-generated POS imagery, especially on login. The source is a transparent 6140 × 4912 PNG. An unchanged copy is kept at `Design/creatives/pos-composite-2026-10-10/original.png` in the SleetSystems workspace.

The product hero, café section, cashier gallery view and company homepage now use `assets/pos-cafe-20261010.webp`. It is a full-resolution lossless export, 2,750,044 bytes. Comparing decoded RGBA values found zero changed visible pixels and zero alpha differences. CSS frames transparent margins with 80 source pixels of padding around the nontransparent bounds; the screen stays part of the supplied composition. No image generation or perspective overlay is applied to this asset.

Source SHA-256: `99b703fb61ffa98af3e92b4ae5e48d57ca30f29f31b3549ac3c942f8872e6894`.
WebP SHA-256: `8f76267debfcf0b9b674196c455f92ef2e5118ef6047407199bdcbbb59823d83`.

The separate dashboard repository carries the same asset for login and its legacy marketing kit component. Customer-facing demonstrations, side profile, native software screenshots, forms and pricing are unchanged. Superseded image files remain available for history.

Verification before release: all 34 referenced public assets exist; HTML asset audit, CSS parsing, existing screen-positioning JavaScript syntax and whitespace checks passed. Browser checks at 1440 × 1000 and 390 × 844 confirmed the homepage, café section, gallery and company page fit without horizontal overflow. Screenshot evidence is in `Design/review/pos-images-2026-10-10/`. The dashboard build passed with 67 generated pages, and its 31 existing auth/CSP checks passed. Login handler source is byte-for-byte unchanged.

Publication uses the existing Git-to-Vercel integration. Production readback and final release state are recorded in the branch dashboard note and the workspace review folder after deployment.
