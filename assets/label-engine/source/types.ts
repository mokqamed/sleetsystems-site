// Shared shapes for the dashboard's label engine. This is a line-for-line TS mirror of
// app/src/main/java/com/mohammed/possystem/core/label/{TemplateContent,LabelTemplate}.kt —
// vectors.json (byte-identical copy of the Android test resource) pins both sides.
// See docs/superpowers/specs/... shelf-label-designer spec for the wire format.

export type ElementType =
  | "name"
  | "brand"
  | "packSize"
  | "cashPrice"
  | "cardPrice"
  | "barcode"
  | "barcodeDigits"
  | "taxNote"
  | "depositNote"
  | "stock"
  | "category"
  | "customText";

export const ELEMENT_TYPES: readonly ElementType[] = [
  "name",
  "brand",
  "packSize",
  "cashPrice",
  "cardPrice",
  "barcode",
  "barcodeDigits",
  "taxNote",
  "depositNote",
  "stock",
  "category",
  "customText",
];

export type Align = "left" | "center" | "right";
export type FontMode = "auto" | "fixed";

export interface LabelElement {
  type: ElementType;
  x: number;
  y: number;
  w: number;
  h: number;
  align?: Align;
  fontMode?: FontMode;
  fontScale?: number;
  bold?: boolean;
  maxLines?: number;
  showTag?: boolean;
  text?: string;
}

export interface LabelTemplate {
  id: string;
  name: string;
  wIn: number;
  hIn: number;
  isDefault: boolean;
  elements: LabelElement[];
}

/** The product/store facts a template's elements are rendered against.
 *  Mirrors Kotlin's TemplateContent data class. */
export interface TemplateContent {
  name: string;
  brand?: string;
  packSize?: string;
  cashCents: number;
  barcode?: string;
  taxable: boolean;
  depositCents: number;
  stock?: number;
  category?: string;
}

/** Dual (cash/card) pricing settings applied when computing a label's card price. */
export interface DualSettings {
  enabled: boolean;
  pct: number;
  flatCents: number;
}

function elementTypeFromWire(wire: unknown): ElementType | null {
  if (typeof wire !== "string") return null;
  return (ELEMENT_TYPES as readonly string[]).includes(wire) ? (wire as ElementType) : null;
}

/** Mirrors Kotlin's Align.fromWire: unknown/missing wire values default to "left". */
function alignFromWire(wire: unknown): Align {
  return wire === "left" || wire === "center" || wire === "right" ? wire : "left";
}

/** Mirrors Kotlin's FontMode.fromWire: unknown/missing wire values default to "auto". */
function fontModeFromWire(wire: unknown): FontMode {
  return wire === "auto" || wire === "fixed" ? wire : "auto";
}

/** Mirrors Kotlin's LabelElement.maxLines default (1) then LabelTemplate.fromMap's
 *  `.coerceIn(1, 4)` clamp applied on parse. */
function coerceMaxLines(raw: unknown): number {
  const n = typeof raw === "number" ? Math.trunc(raw) : 1;
  return Math.min(4, Math.max(1, n));
}

/** Mirrors Kotlin's LabelTemplate.Companion.fromMap(id, data: Map<*, *>): LabelTemplate?
 *  Unknown element types are skipped (element dropped, not the whole template); an element
 *  missing x/y/w/h is also skipped. A template missing name/wIn/hIn returns null entirely. */
export function parseTemplate(id: string, data: unknown): LabelTemplate | null {
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;

  const name = typeof d.name === "string" ? d.name : null;
  if (name === null) return null;
  const wIn = typeof d.wIn === "number" ? d.wIn : null;
  if (wIn === null) return null;
  const hIn = typeof d.hIn === "number" ? d.hIn : null;
  if (hIn === null) return null;

  const rawEls = Array.isArray(d.elements) ? d.elements : [];
  const elements: LabelElement[] = [];
  for (const raw of rawEls) {
    if (typeof raw !== "object" || raw === null) continue;
    const m = raw as Record<string, unknown>;

    const type = elementTypeFromWire(m.type);
    if (type === null) continue;
    const x = typeof m.x === "number" ? m.x : null;
    const y = typeof m.y === "number" ? m.y : null;
    const w = typeof m.w === "number" ? m.w : null;
    const h = typeof m.h === "number" ? m.h : null;
    if (x === null || y === null || w === null || h === null) continue;

    elements.push({
      type,
      x,
      y,
      w,
      h,
      align: alignFromWire(m.align),
      fontMode: fontModeFromWire(m.fontMode),
      fontScale: typeof m.fontScale === "number" ? m.fontScale : undefined,
      bold: typeof m.bold === "boolean" ? m.bold : false,
      maxLines: coerceMaxLines(m.maxLines),
      showTag: typeof m.showTag === "boolean" ? m.showTag : false,
      text: typeof m.text === "string" ? m.text : undefined,
    });
  }

  return {
    id,
    name,
    wIn,
    hIn,
    isDefault: typeof d.isDefault === "boolean" ? d.isDefault : false,
    elements,
  };
}
