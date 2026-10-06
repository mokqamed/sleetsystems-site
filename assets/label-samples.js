// Fictional examples built with the current product renderer, not label mockups.
import { BUILTIN_CLASSIC } from './label-engine/builtinClassic.js';
import { ensureLabelFonts, renderLabelDataUrl } from './label-engine/render.js';

const content = Object.freeze({
  name: 'Granola',
  brand: 'Sample Bakery',
  packSize: '12 oz',
  cashCents: 499,
  barcode: '012345678905',
  taxable: false,
  depositCents: 0,
  category: 'Bakery',
});
const dual = Object.freeze({ enabled: true, pct: 4, flatCents: 0 });

function text(type, x, y, w, h, fontScale, extra = {}) {
  return { type, x, y, w, h, align: 'center', fontMode: 'fixed', fontScale, maxLines: 1, ...extra };
}

const productTemplate = {
  id: 'website-sample-product', name: 'Sample product label', wIn: 2, hIn: 4, isDefault: false,
  elements: [
    text('brand', .09, .045, .82, .05, .025, { bold: true }),
    text('name', .09, .135, .82, .085, .055, { bold: true }),
    text('packSize', .09, .255, .82, .04, .024),
    text('category', .09, .323, .82, .035, .022),
    text('cashPrice', .09, .427, .82, .07, .043, { bold: true, showTag: true }),
    text('cardPrice', .09, .525, .82, .045, .025, { showTag: true }),
    { type: 'barcode', x: .09, y: .655, w: .82, h: .085 },
    text('barcodeDigits', .09, .756, .82, .035, .022),
    text('customText', .09, .86, .82, .075, .018, { maxLines: 2, text: 'DEMO LABEL - SAMPLE DATA' }),
  ],
};

const largeTemplate = {
  id: 'website-sample-large', name: 'Sample detailed product label', wIn: 4, hIn: 6, isDefault: false,
  elements: [
    text('brand', .08, .055, .84, .05, .03, { bold: true }),
    text('name', .08, .148, .84, .1, .075, { bold: true }),
    text('packSize', .08, .282, .84, .035, .026),
    text('category', .08, .338, .84, .04, .024),
    text('cashPrice', .08, .437, .84, .07, .052, { bold: true, showTag: true }),
    text('cardPrice', .08, .535, .84, .04, .028, { showTag: true }),
    { type: 'barcode', x: .1, y: .655, w: .8, h: .08 },
    text('barcodeDigits', .1, .752, .8, .03, .022),
    text('customText', .12, .832, .76, .1, .02, {
      maxLines: 3,
      text: 'DEMO LABEL - SAMPLE DATA. Customize the layout, product details and prices for your store.',
    }),
  ],
};

const examples = [
  {
    id: 'shelf', title: 'Cash & card shelf label', size: '2.25 × 1.25 in',
    description: 'A shelf label with product name, pack size, both prices and a scannable barcode.',
    features: ['Cash and card prices', 'Product details', 'Barcode'],
    template: BUILTIN_CLASSIC,
  },
  {
    id: 'product', title: 'Product labels', size: '2 × 4 in',
    description: 'A portrait label with your brand name, product details, prices and custom text.',
    features: ['Brand name', 'Custom text', 'Portrait format'],
    template: productTemplate,
  },
  {
    id: 'large', title: 'Large-format labels', size: '4 × 6 in',
    description: 'More space for your brand name, product details and a custom message.',
    features: ['Custom layout', 'More room for text', 'Cash and card prices'],
    template: largeTemplate,
  },
];

let samplesPromise;

/** Returns {id,title,size,description,status,features,wIn,hIn,src,alt}[].
 * `src` is a PNG data URL rendered at 2× the existing 203-dpi label dot grid.
 * No store reads, saved designs, external assets or print jobs are involved. */
export async function createLabelSamples() {
  if (!samplesPromise) {
    samplesPromise = ensureLabelFonts().then(() => examples.map(({ template, ...example }) => ({
      ...example,
      status: example.id === 'shelf' ? 'Current designer' : 'Layout example',
      wIn: template.wIn,
      hIn: template.hIn,
      src: renderLabelDataUrl(template, content, dual, 2),
      alt: `${example.title}, ${example.size}. Fictional Granola sample: cash $4.99, card $5.19. ${example.id === 'shelf' ? '' : 'Sample Bakery brand name. '}Barcode 012345678905.`,
    }))).catch((error) => {
      samplesPromise = undefined;
      throw error;
    });
  }
  // Metadata may be adapted by a caller without changing later users of the cache.
  return (await samplesPromise).map((sample) => ({ ...sample, features: [...sample.features] }));
}
