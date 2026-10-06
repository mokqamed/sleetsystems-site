// Verbatim mirror of Kotlin's LabelTemplate.Companion.BUILTIN_CLASSIC
// (app/src/main/java/com/mohammed/possystem/core/label/LabelTemplate.kt). MUST stay
// byte-identical in meaning to that Kotlin literal — see its doc comment. Every element
// field below is written out explicitly (even ones equal to LabelElement's Kotlin
// constructor defaults: align="left", fontMode="auto", bold=false, maxLines=1,
// showTag=false) so this reads as a complete, self-documenting field-by-field match
// rather than relying on downstream consumers re-implementing Kotlin's defaulting.



export const BUILTIN_CLASSIC                = {
  id: "builtin-classic",
  name: "Classic retail",
  wIn: 2.25,
  hIn: 1.25,
  isDefault: false,
  elements: [
    // LabelElement(ElementType.NAME, 0.04, 0.05, 0.50, 0.30, Align.LEFT, FontMode.AUTO, null, true, 2)
    { type: "name", x: 0.04, y: 0.05, w: 0.5, h: 0.3, align: "left", fontMode: "auto", bold: true, maxLines: 2, showTag: false },
    // LabelElement(ElementType.PACK_SIZE, 0.04, 0.37, 0.30, 0.10)
    { type: "packSize", x: 0.04, y: 0.37, w: 0.3, h: 0.1, align: "left", fontMode: "auto", bold: false, maxLines: 1, showTag: false },
    // LabelElement(ElementType.CASH_PRICE, 0.55, 0.05, 0.41, 0.36, Align.RIGHT, FontMode.AUTO, null, true, 1, showTag = true)
    { type: "cashPrice", x: 0.55, y: 0.05, w: 0.41, h: 0.36, align: "right", fontMode: "auto", bold: true, maxLines: 1, showTag: true },
    // LabelElement(ElementType.CARD_PRICE, 0.55, 0.43, 0.41, 0.13, Align.RIGHT, FontMode.AUTO, null, true, 1, showTag = true)
    { type: "cardPrice", x: 0.55, y: 0.43, w: 0.41, h: 0.13, align: "right", fontMode: "auto", bold: true, maxLines: 1, showTag: true },
    // LabelElement(ElementType.TAX_NOTE, 0.55, 0.74, 0.41, 0.08, Align.RIGHT)
    { type: "taxNote", x: 0.55, y: 0.74, w: 0.41, h: 0.08, align: "right", fontMode: "auto", bold: false, maxLines: 1, showTag: false },
    // LabelElement(ElementType.DEPOSIT_NOTE, 0.55, 0.84, 0.41, 0.08, Align.RIGHT)
    { type: "depositNote", x: 0.55, y: 0.84, w: 0.41, h: 0.08, align: "right", fontMode: "auto", bold: false, maxLines: 1, showTag: false },
    // LabelElement(ElementType.BARCODE, 0.04, 0.55, 0.42, 0.28)
    { type: "barcode", x: 0.04, y: 0.55, w: 0.42, h: 0.28, align: "left", fontMode: "auto", bold: false, maxLines: 1, showTag: false },
    // LabelElement(ElementType.BARCODE_DIGITS, 0.04, 0.85, 0.42, 0.09)
    { type: "barcodeDigits", x: 0.04, y: 0.85, w: 0.42, h: 0.09, align: "left", fontMode: "auto", bold: false, maxLines: 1, showTag: false },
  ],
};
