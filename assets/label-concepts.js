// Illustrative layouts for the planned custom-label tools, never current app output.
import { encode128 } from './label-engine/code128.js';

const image = (width, height, body) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="white"/><g fill="#111" font-family="Arial, sans-serif">${body}</g></svg>`
);

function barcode(value, x, y, width, height) {
  const pattern = encode128(value);
  if (!pattern) return '';
  const total = pattern.reduce((sum, run) => sum + run, 0) + 20;
  const unit = width / total;
  let cursor = x + unit * 10;
  return pattern.map((run, index) => {
    const rectangle = index % 2 === 0 ? `<rect x="${cursor}" y="${y}" width="${run * unit}" height="${height}"/>` : '';
    cursor += run * unit;
    return rectangle;
  }).join('');
}

export function createLabelConcepts() {
  const branded = image(406, 812, `
    <circle cx="203" cy="122" r="69" fill="none" stroke="#111" stroke-width="3"/>
    <text x="203" y="138" text-anchor="middle" font-size="47" font-weight="700">SB</text>
    <text x="203" y="232" text-anchor="middle" font-size="29" font-weight="700">Sample Bakery</text>
    <path d="M45 270H361" stroke="#111" stroke-width="2"/>
    <text x="203" y="337" text-anchor="middle" font-size="35" font-weight="700">Honey oat</text>
    <text x="203" y="380" text-anchor="middle" font-size="35" font-weight="700">granola</text>
    <text x="203" y="429" text-anchor="middle" font-size="20">Net wt. 8 oz (227 g)</text>
    <text x="203" y="506" text-anchor="middle" font-size="19">Your own product details.</text>
    <text x="203" y="536" text-anchor="middle" font-size="19">Your brand on the package.</text>
    ${barcode('012345678905', 44, 612, 318, 71)}
    <text x="203" y="711" text-anchor="middle" font-size="17" letter-spacing="2">012345678905</text>
    <text x="203" y="768" text-anchor="middle" font-size="14">Sample design</text>`);

  const nutrients = [
    ['Total Fat', '— g'], ['Saturated Fat', '— g'], ['Trans Fat', '— g'],
    ['Cholesterol', '— mg'], ['Sodium', '— mg'], ['Total Carbohydrate', '— g'],
    ['Dietary Fiber', '— g'], ['Total Sugars', '— g'], ['Added Sugars', '— g'], ['Protein', '— g'],
  ];
  const nutrition = image(812, 1218, `
    <rect x="38" y="38" width="736" height="1142" fill="none" stroke="#111" stroke-width="3"/>
    <text x="61" y="127" font-size="77" font-weight="700" letter-spacing="-4">Nutrition Facts</text>
    <path d="M60 151H752" stroke="#111" stroke-width="3"/>
    <text x="61" y="191" font-size="27">Servings per container: —</text>
    <text x="61" y="235" font-size="30" font-weight="700">Serving size</text>
    <text x="750" y="235" text-anchor="end" font-size="30">—</text>
    <path d="M60 263H752" stroke="#111" stroke-width="19"/>
    <text x="61" y="309" font-size="24" font-weight="700">Amount per serving</text>
    <text x="61" y="374" font-size="60" font-weight="700">Calories</text>
    <text x="750" y="374" text-anchor="end" font-size="60" font-weight="700">—</text>
    <path d="M60 403H752" stroke="#111" stroke-width="10"/>
    <text x="750" y="440" text-anchor="end" font-size="22" font-weight="700">% Daily Value</text>
    ${nutrients.map(([name, amount], index) => `<path d="M60 ${460 + index * 50}H752" stroke="#111" stroke-width="1.5"/><text x="${index === 1 || index === 2 || index === 6 || index === 7 || index === 8 ? 81 : 61}" y="${495 + index * 50}" font-size="25" font-weight="${index === 0 || index === 3 || index === 4 || index === 5 || index === 9 ? 700 : 400}">${name} ${amount}</text><text x="748" y="${495 + index * 50}" text-anchor="end" font-size="24">—</text>`).join('')}
    <path d="M60 974H752" stroke="#111" stroke-width="12"/>
    <text x="61" y="1025" font-size="23">Nutrient values supplied by your business.</text>
    <text x="61" y="1090" font-size="22">Sample layout · values not entered</text>
    <text x="61" y="1131" font-size="20">Preview of planned custom-label tools</text>`);

  return [
    { id: 'branded', title: 'Branded logo labels', size: '2 × 4 in', wIn: 2, hIn: 4,
      description: 'A logo, product details and your own message on the package.',
      status: 'Upcoming concept', features: ['Logo', 'Custom text', 'Barcode'], src: branded,
      alt: 'Upcoming branded-label concept for fictional Sample Bakery, with an SB logo, granola name, package size and barcode.' },
    { id: 'nutrition', title: 'Nutrition facts', size: '4 × 6 in', wIn: 4, hIn: 6,
      description: 'A larger layout for nutrition information supplied by your business.',
      status: 'Upcoming concept', features: ['Nutrition layout', 'Your supplied values', 'Larger format'], src: nutrition,
      alt: 'Upcoming nutrition-facts label concept with blank nutrient values. This is a design example, not a calculated nutrition label.' },
  ];
}
