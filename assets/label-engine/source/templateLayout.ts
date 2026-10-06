// Line-for-line mirror of app/src/main/java/com/mohammed/possystem/core/label/{LabelSize,
// TemplateLayout}.kt; vectors.json pins both sides. Math.round here == Kotlin's roundToInt,
// Math.floor == Kotlin's floor — both mirrors hold for the non-negative domain these
// functions operate in (physical label sizes and dot coordinates are never negative).
//
// NOTE: named templateLayout.ts, not layout.ts as the task-8 brief's file list literally
// says — `layout.ts` is a Next.js App Router reserved filename (any file with that exact
// name anywhere under app/ is treated as a route segment layout and must default-export a
// React component; `next build` fails typecheck otherwise). The exported symbols below
// (LayoutBox, labelDots, boxFor, visibleElements, barcodeWidth) are unchanged from the
// brief's Interfaces block — only the file path differs. Import from "./templateLayout".

import type { DualSettings, LabelElement, LabelTemplate, TemplateContent } from "./types";
import { textFor } from "./strings";
import { moduleCount } from "./code128";

export interface LayoutBox {
  xDots: number;
  yDots: number;
  wDots: number;
  hDots: number;
}

const DEFAULT_DPI = 203;

/** Mirrors LabelSize.widthDots/heightDots. */
export function labelDots(wIn: number, hIn: number, dpi: number = DEFAULT_DPI): { w: number; h: number } {
  return { w: Math.round(wIn * dpi), h: Math.round(hIn * dpi) };
}

/** Mirrors TemplateLayout.boxFor. */
export function boxFor(el: LabelElement, wIn: number, hIn: number, dpi: number = DEFAULT_DPI): LayoutBox {
  const { w: lw, h: lh } = labelDots(wIn, hIn, dpi);
  return {
    xDots: Math.round(el.x * lw),
    yDots: Math.round(el.y * lh),
    wDots: Math.round(el.w * lw),
    hDots: Math.round(el.h * lh),
  };
}

/** Mirrors TemplateLayout.visibleElements: barcode/barcodeDigits are gated directly on
 *  content.barcode being present (same condition textFor would apply for those two types,
 *  spelled out explicitly rather than round-tripping through textFor). */
export function visibleElements(t: LabelTemplate, c: TemplateContent, dual: DualSettings): LabelElement[] {
  return t.elements.filter((el) => {
    if (el.type === "barcode" || el.type === "barcodeDigits") {
      return c.barcode != null;
    }
    return textFor(el, c, dual) !== null;
  });
}

/** Mirrors TemplateLayout.barcodeWidth: moduleDots = max(2, floor(boxW / totalModules));
 *  the symbol may overflow its box (centered) but is never clipped mid-symbol. */
export function barcodeWidth(value: string, boxWDots: number): { moduleDots: number; totalWDots: number } {
  const modules = moduleCount(value);
  const moduleDots = Math.max(2, Math.floor(boxWDots / modules));
  return { moduleDots, totalWDots: moduleDots * modules };
}
