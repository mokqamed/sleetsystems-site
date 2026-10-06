// Canvas renderer for the label engine — the dashboard-side twin of
// app/src/main/java/com/mohammed/possystem/core/label/TemplateRenderer.kt. Every layout
// decision (box geometry, which elements are visible, barcode module width) is delegated to
// templateLayout.ts/strings.ts/code128.ts so this file owns ONLY font loading, auto-fit sizing,
// and canvas compositing — mirroring TemplateRenderer's own division of responsibility.
//
// Coordinate convention: all layout math (box x/y/w/h, font sizes, line heights) happens in
// UNSCALED 203-dot space — the same space boxFor/labelDots/barcodeWidth already operate in.
// The canvas itself is sized `labelDots × scale` and every coordinate is multiplied by `scale`
// at the point it's handed to a canvas drawing call. There is deliberately no `ctx.scale(...)`
// transform: `ctx.measureText` is NOT affected by the current transform (only by `ctx.font`), so
// baking `scale` into the font-size string directly is what keeps measurement and drawing
// consistent at any resolution — see fontString below.


import { textFor } from "./strings.js";
import { boxFor, labelDots, visibleElements, barcodeWidth,                } from "./templateLayout.js";
import { encode128 } from "./code128.js";

/** Auto-fit never shrinks text below this size, even if it still overflows.
 *  Mirrors TemplateRenderer.FLOOR_PX — a BINDING parity ruling from the Android Task 3 review
 *  (legibility-over-containment): the starting size clamp below and this floor must both use it. */
const FLOOR_PX = 8;

/** FontMode.FIXED's fontScale default when an element omits it. Mirrors
 *  TemplateRenderer.DEFAULT_FIXED_SCALE. */
const DEFAULT_FIXED_SCALE = 0.1;

const FONT_FAMILY = "SleetLabel";
const FONT_FAMILY_MONO = "SleetLabelMono";

// ---- Fonts --------------------------------------------------------------------------------
//
// Android bundles the Roboto TTFs as app resources (ResourcesCompat.getFont) so they're always
// synchronously available. The browser has no equivalent of a bundled resource: the same three
// files are copied into public/fonts/ and loaded at runtime via the CSS Font Loading API. Every
// canvas font string in this file uses ONLY "SleetLabel"/"SleetLabelMono" — never a system
// fallback — so a caller that forgets to await ensureLabelFonts() gets a clear thrown error
// (assertFontsReady below) instead of a silently-wrong render that would break Android parity.

let fontsPromise                       = null;

async function loadLabelFonts()                {
  const regular = new FontFace(FONT_FAMILY, "url(/fonts/Roboto-Regular.ttf)", { weight: "400" });
  const bold = new FontFace(FONT_FAMILY, "url(/fonts/Roboto-Bold.ttf)", { weight: "700" });
  const mono = new FontFace(FONT_FAMILY_MONO, "url(/fonts/RobotoMono-Regular.ttf)", { weight: "400" });
  const [loadedRegular, loadedBold, loadedMono] = await Promise.all([
    regular.load(),
    bold.load(),
    mono.load(),
  ]);
  document.fonts.add(loadedRegular);
  document.fonts.add(loadedBold);
  document.fonts.add(loadedMono);
}

/** Loads the three bundled TTFs into `document.fonts` as families "SleetLabel" (weights 400 +
 *  700) and "SleetLabelMono" (weight 400). Memoized single-flight: concurrent/repeat callers
 *  share one in-flight load and a resolved call is a safe no-op. On failure the memo is cleared
 *  (so a transient network blip doesn't permanently wedge the designer for the rest of the
 *  session) and the rejection is rethrown so callers surface it — never fall back silently. */
export function ensureLabelFonts()                {
  if (!fontsPromise) {
    fontsPromise = loadLabelFonts().catch((err         ) => {
      fontsPromise = null;
      throw err;
    });
  }
  return fontsPromise;
}

/** Throws with a clear, actionable message instead of letting canvas silently fall back to a
 *  system font (which would break visual parity with TemplateRenderer without any error). */
function assertFontsReady()       {
  if (typeof document === "undefined" || !document.fonts) {
    throw new Error("renderLabelCanvas requires a browser document with the CSS Font Loading API");
  }
  const ready =
    document.fonts.check(`16px ${FONT_FAMILY}`) &&
    document.fonts.check(`bold 16px ${FONT_FAMILY}`) &&
    document.fonts.check(`16px ${FONT_FAMILY_MONO}`);
  if (!ready) {
    throw new Error("Label fonts not loaded — call and await ensureLabelFonts() before rendering labels");
  }
}

function fontString(px        , scale        , family        , bold         )         {
  return `${bold ? "bold " : ""}${px * scale}px ${family}`;
}

// ---- Auto-fit (pure, canvas-free) ----------------------------------------------------------

/** Picks the largest font size (in unscaled 203-dot units) for which `wrap(px)` produces no
 *  more than `maxLines` lines AND `measure(px)` (the widest of those lines) fits `boxW`,
 *  starting from `max(8, floor(boxH / maxLines))` and stepping down by 1 dot-unit, floor 8.
 *  Mirrors TemplateRenderer.fitTextLines's stepping loop exactly (the size half of its
 *  `Pair<Int, List<String>>` — callers re-derive final lines separately, same split as Kotlin's
 *  fitTextLines/linesForSize). Pure and canvas-free so it's directly unit-testable. */
export function fitFontSize(
  measure                        ,
  boxW        ,
  boxH        ,
  maxLines        ,
  wrap                          ,
)         {
  let px = Math.max(FLOOR_PX, Math.floor(boxH / maxLines));
  while (true) {
    const lines = wrap(px);
    if (lines.length <= maxLines && measure(px) <= boxW) return px;
    if (px <= FLOOR_PX) return FLOOR_PX;
    px--;
  }
}

/** Horizontal offset (same unscaled dot space as boxFor) to center a `totalWDots`-wide symbol
 *  inside a box starting at `boxXDots` spanning `boxWDots`. Mirrors TemplateRenderer.drawBarcode's
 *  `box.xDots + (box.wDots - barBmp.width) / 2` — Kotlin Int division truncates toward zero, so
 *  this uses Math.trunc (not Math.floor, which would differ from Kotlin by 1 on odd negative
 *  remainders — i.e. wide-overflow barcodes with an odd overflow amount). May return a value that
 *  pushes the symbol past the box's edges; that's the intended "overflow the box, never clip
 *  mid-symbol" behavior — canvas clips naturally at the label edge (the canvas bounds). */
export function barcodeDrawX(boxXDots        , boxWDots        , totalWDots        )         {
  return boxXDots + Math.trunc((boxWDots - totalWDots) / 2);
}

// ---- Text wrap / fit (canvas-backed, mirrors TemplateRenderer 1:1) --------------------------
//
// wrapLines/fitsBox/forceLines/ellipsize below are direct ports of TemplateRenderer's private
// functions of the same names. `ctx.font` must already be set to the size being tested before
// any of these are called — they only ever call ctx.measureText, never ctx.font.

function wrapLines(ctx                          , text        , boxWDotsScaled        )           {
  const words = text.split(" ");
  const lines           = [];
  let current = "";
  for (const word of words) {
    const candidate = current === "" ? word : `${current} ${word}`;
    if (current === "" || ctx.measureText(candidate).width <= boxWDotsScaled) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  lines.push(current);
  return lines;
}

function fitsBox(
  lines          ,
  boxWDotsScaled        ,
  maxLines        ,
  ctx                          ,
)          {
  return lines.length <= maxLines && lines.every((l) => ctx.measureText(l).width <= boxWDotsScaled);
}

function ellipsize(ctx                          , text        , maxWidthScaled        )         {
  if (ctx.measureText(text).width <= maxWidthScaled) return text;
  let end = text.length;
  while (end > 1 && ctx.measureText(text.slice(0, end) + "…").width > maxWidthScaled) end--;
  return text.slice(0, end) + "…";
}

function forceLines(
  ctx                          ,
  text        ,
  boxWDotsScaled        ,
  maxLines        ,
)           {
  const words = text.split(" ");
  const lines           = [];
  let wordIdx = 0;
  let current = "";
  while (lines.length < maxLines - 1 && wordIdx < words.length) {
    const word = words[wordIdx];
    const candidate = current === "" ? word : `${current} ${word}`;
    if (current === "" || ctx.measureText(candidate).width <= boxWDotsScaled) {
      current = candidate;
      wordIdx++;
    } else {
      lines.push(current);
      current = "";
    }
  }
  const leftoverParts           = [];
  if (current !== "") leftoverParts.push(current);
  for (let i = wordIdx; i < words.length; i++) leftoverParts.push(words[i]);
  lines.push(ellipsize(ctx, leftoverParts.join(" "), boxWDotsScaled));
  return lines;
}

/** Final lines to draw at `ctx.font`'s CURRENT (already-fixed) size: the natural wrap if it
 *  already satisfies maxLines/boxW, else forceLines's clamped+ellipsized version. Mirrors
 *  TemplateRenderer.linesForSize — used for both the FIXED-mode path and the post-fit AUTO path. */
function linesForSize(
  ctx                          ,
  text        ,
  boxWDotsScaled        ,
  maxLines        ,
)           {
  const natural = wrapLines(ctx, text, boxWDotsScaled);
  return fitsBox(natural, boxWDotsScaled, maxLines, ctx) ? natural : forceLines(ctx, text, boxWDotsScaled, maxLines);
}

// ---- Drawing --------------------------------------------------------------------------------

function drawBarcode(ctx                          , box           , value        , scale        )       {
  const runs = encode128(value);
  if (runs === null) return; // blank value — TemplateRenderer/Barcode128.renderExact draw nothing too

  const { moduleDots, totalWDots } = barcodeWidth(value, box.wDots);
  const startX = barcodeDrawX(box.xDots, box.wDots, totalWDots);

  ctx.fillStyle = "#000";
  let xDots = startX + 10 * moduleDots; // left quiet zone (10 modules, blank — canvas is white)
  let isBar = true; // encode128's run-lengths always start on a bar
  for (const run of runs) {
    const runWDots = run * moduleDots;
    if (isBar) {
      ctx.fillRect(xDots * scale, box.yDots * scale, runWDots * scale, box.hDots * scale);
    }
    xDots += runWDots;
    isBar = !isBar;
  }
  // Trailing 10-module quiet zone is blank — nothing to draw. Canvas bounds clip naturally at
  // the label edge; only the caller's box.wDots > label width could ever be an issue, and boxFor
  // never produces that for elements inside a template's own 0..1 fractional coordinates.
}

function drawText(
  ctx                          ,
  el              ,
  box           ,
  text        ,
  labelHDots        ,
  scale        ,
  family        ,
)       {
  const bold = !!el.bold;
  const maxLines = el.maxLines ?? 1;
  const boxWScaled = box.wDots * scale;

  const wrap = (px        )           => {
    ctx.font = fontString(px, scale, family, bold);
    return wrapLines(ctx, text, boxWScaled);
  };
  const measure = (px        )         => {
    ctx.font = fontString(px, scale, family, bold);
    const lines = wrapLines(ctx, text, boxWScaled);
    let max = 0;
    for (const l of lines) {
      const w = ctx.measureText(l).width;
      if (w > max) max = w;
    }
    return max / scale; // normalized back to unscaled dot space — fitFontSize compares vs boxW
  };

  let size        ;
  if (el.fontMode === "fixed") {
    size = Math.max(FLOOR_PX, Math.floor((el.fontScale ?? DEFAULT_FIXED_SCALE) * labelHDots));
  } else {
    size = fitFontSize(measure, box.wDots, box.hDots, maxLines, wrap);
  }
  ctx.font = fontString(size, scale, family, bold);
  const lines = linesForSize(ctx, text, boxWScaled, maxLines);

  const metrics = ctx.measureText(text || "M");
  const ascentScaled = metrics.fontBoundingBoxAscent;
  const lineHScaled = size * scale;

  ctx.fillStyle = "#000";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineTopScaled = box.yDots * scale + i * lineHScaled;
    const baselineYScaled = lineTopScaled + ascentScaled;
    const lineWScaled = ctx.measureText(line).width;
    const x = xForAlign(el.align, box, scale, lineWScaled);
    ctx.fillText(line, x, baselineYScaled);
  }
}

function xForAlign(align                   , box           , scale        , lineWScaled        )         {
  const boxXScaled = box.xDots * scale;
  const boxWScaled = box.wDots * scale;
  switch (align ?? "left") {
    case "center":
      return boxXScaled + (boxWScaled - lineWScaled) / 2;
    case "right":
      return boxXScaled + boxWScaled - lineWScaled;
    case "left":
    default:
      return boxXScaled;
  }
}

// ---- Public entry points ----------------------------------------------------------------

/** Renders `t`/`c`/`dual` onto a fresh canvas sized `labelDots(t.wIn, t.hIn) × scale`. Layout is
 *  computed in unscaled 203-dot space (via boxFor/visibleElements — the SAME calls
 *  TemplateRenderer makes) and every drawn coordinate is multiplied by `scale`. Requires
 *  `ensureLabelFonts()` to have resolved first — throws otherwise rather than silently drawing
 *  with a system font. */
export function renderLabelCanvas(
  t               ,
  c                 ,
  dual              ,
  scale        ,
)                    {
  assertFontsReady();

  const { w: wDots, h: hDots } = labelDots(t.wIn, t.hIn);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(wDots * scale);
  canvas.height = Math.round(hDots * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const el of visibleElements(t, c, dual)) {
    const box = boxFor(el, t.wIn, t.hIn);
    if (box.wDots <= 0 || box.hDots <= 0) continue;
    const text = textFor(el, c, dual);
    if (text === null) continue; // visibleElements already guarantees this; defensive only

    if (el.type === "barcode") {
      drawBarcode(ctx, box, text, scale);
    } else if (el.type === "barcodeDigits") {
      drawText(ctx, el, box, text, hDots, scale, FONT_FAMILY_MONO);
    } else {
      drawText(ctx, el, box, text, hDots, scale, FONT_FAMILY);
    }
  }

  return canvas;
}

/** `renderLabelCanvas` as a data URL, for `<img>` previews. */
export function renderLabelDataUrl(
  t               ,
  c                 ,
  dual              ,
  scale        ,
)         {
  return renderLabelCanvas(t, c, dual, scale).toDataURL("image/png");
}
