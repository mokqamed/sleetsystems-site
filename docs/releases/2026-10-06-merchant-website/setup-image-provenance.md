# Store Setup visual provenance

Captured on 2026-10-06 for the merchant website. Published website revision reported by the parent task: `4dc36b7`.

- **Image:** `store-setup-demo.jpg`, captured by the parent task through its IAB browser from the actual current Store Setup page. The final capture shows Cold Brew Coffee and the app's existing “No photo” placeholder. No product photo or UI redesign was added. Image SHA-256: `2740aaa260593c5ea7810dd88e3e4b6b9903313ab5f4ab2dbd2e72289ea03a7a`.
- **Product source:** `POSSystem2/tools/store-setup-scanner/`. The capture server imports the existing `src/server/service.mjs`, `http.mjs` and `phoneDoor.mjs`, and serves the unchanged `public/` and `src/core/` files.
- **Capture fixture:** followed the product’s existing smoke-test fixture pattern, using the unchanged UI with local demonstration data. The original reproducible capture script remains in the workspace’s `Design/creatives/visual-features-2026-10-06/` directory.
- **Sample catalog:** fictional Demo Market, Drinks/Snacks categories, Sparkling Water 12oz, Iced Tea 16oz and Cold Brew Coffee 12oz. Product codes and prices were sample inputs inserted only into the temporary local fixture. No real merchant catalog, transaction, contact detail or credential was read or copied.
- **Isolation:** a fresh temporary data directory, lookup requests forced offline, `claudePath: null`, and loopback-only desktop/phone servers. The phone route used a deliberately public synthetic demo key that grants no access to any real account or service. No Tailscale, Firebase or production service was called.

The optional phone and barcode-sheet captures were not needed for the release. No kitchen or modifier screenshot was created by this subtask. The prior ADB inventory found no running device, so no emulator or merchant hardware was changed.
