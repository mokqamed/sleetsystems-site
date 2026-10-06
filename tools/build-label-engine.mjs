// Rebuild the website's label previews from the product's existing renderer.
// Run with Node 24+: node tools/build-label-engine.mjs [dashboard-directory]
// No Firebase code, application changes, third-party packages or network calls.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dashboard = path.resolve(process.argv[2] || path.join(site, '../POSSystem2/sleet-dashboard'));
const engine = path.join(site, 'assets/label-engine');
const sourceDirectory = path.join(engine, 'source');
const fontsDirectory = path.join(site, 'fonts');
const provenancePath = path.resolve(site, '../../Design/creatives/dual-price-labels-2026-10-06/label-engine-provenance.json');
const moduleNames = ['types', 'strings', 'code128', 'templateLayout', 'render', 'builtinClassic'];
const fontNames = ['Roboto-Regular.ttf', 'Roboto-Bold.ttf', 'RobotoMono-Regular.ttf'];
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

await Promise.all([mkdir(sourceDirectory, { recursive: true }), mkdir(fontsDirectory, { recursive: true })]);
const modules = [];
for (const name of moduleNames) {
  const original = path.join(dashboard, `app/lib/label-engine/${name}.ts`);
  const snapshot = path.join(sourceDirectory, `${name}.ts`);
  const output = path.join(engine, `${name}.js`);
  const source = await readFile(original, 'utf8');
  await copyFile(original, snapshot);
  // Strip mode preserves the original comments and layout. The only runtime-source
  // adjustment is the extension required for native browser module imports.
  const javascript = stripTypeScriptTypes(source, { mode: 'strip' })
    .replace(/(\bfrom\s+["'])(\.\/[^"']+)(["'])/g, (match, prefix, specifier, quote) =>
      `${prefix}${specifier.endsWith('.js') ? specifier : `${specifier}.js`}${quote}`)
    .replace(/[\t ]+$/gm, '');
  await writeFile(output, javascript);
  modules.push({ source: original, sourceSnapshot: path.relative(site, snapshot), output: path.relative(site, output), sourceSha256: sha256(source), outputSha256: sha256(javascript) });
}

const fonts = [];
for (const name of fontNames) {
  const original = path.join(dashboard, 'public/fonts', name);
  const output = path.join(fontsDirectory, name);
  await copyFile(original, output);
  fonts.push({ source: original, output: path.relative(site, output), sha256: sha256(await readFile(output)) });
}

const provenance = {
  purpose: 'Local merchant-website examples rendered with the current SleetPOS label engine',
  generatedAt: new Date().toISOString(),
  sourceRepository: dashboard,
  sourceCommit: execFileSync('git', ['-C', dashboard, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  nodeVersion: process.version,
  transformation: 'Verbatim TypeScript snapshots; Node stripTypeScriptTypes(mode=strip); relative runtime imports gain .js extensions; trailing whitespace removed. Fonts copied unchanged.',
  modules,
  fonts,
  sampleModule: 'assets/label-samples.js',
  sampleData: { brand: 'Sample Bakery', name: 'Granola', packSize: '12 oz', cashCents: 499, cardCents: 519, dualPercent: 4, barcode: '012345678905', fictional: true },
  samples: [
    { id: 'shelf', sizeInches: [2.25, 1.25], nativeDots: [457, 254], canvasPixels: [914, 508], template: 'Unchanged BUILTIN_CLASSIC' },
    { id: 'product', sizeInches: [2, 4], nativeDots: [406, 812], canvasPixels: [812, 1624], template: 'Supported fields, one instance per element type' },
    { id: 'large', sizeInches: [4, 6], nativeDots: [812, 1218], canvasPixels: [1624, 2436], template: 'Supported fields, one instance per element type' },
  ],
  boundaries: [
    'Examples contain fictional sample data, not private merchant records.',
    'Brand text only: no unsupported logo, picture, item-value or repeated custom-text elements.',
    'No nutrition or health claims; no invented current designer UI.',
    'Source implementation establishes rendering capability; this build does not independently verify deployment at every merchant.',
    'No website deployment, backend connection, printing or paid generation performed.',
  ],
};
await mkdir(path.dirname(provenancePath), { recursive: true });
await writeFile(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`);
console.log(`Copied ${modules.length} renderer modules and ${fonts.length} fonts. Provenance: ${provenancePath}`);
