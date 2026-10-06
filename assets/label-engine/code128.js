// Faithful TS port of ZXing 3.5.3's com.google.zxing.oned.Code128Writer, which
// app/src/main/java/com/mohammed/possystem/core/label/Barcode128.kt wraps directly
// (`Code128Writer().encode(data)`). Ported from the pinned upstream source at git tag
// `zxing-3.5.3` (matches the exact jar version this Android app depends on):
//   core/src/main/java/com/google/zxing/oned/Code128Writer.java
//   core/src/main/java/com/google/zxing/oned/Code128Reader.java (CODE_PATTERNS table)
//
// Only the "fast" (non-compaction) encode path is ported. Barcode128.kt never passes
// EncodeHintType.CODE128_COMPACT, so ZXing's MinimalEncoder path is dead code for this
// app and is intentionally not mirrored — porting it would add real complexity with zero
// behavioral coverage (nothing in this app ever exercises it).
//
// moduleCount(value) MUST equal Barcode128.moduleCount(value) exactly — that's what keeps
// printed labels and PDF/preview barcodes the same width. vectors.json's `code128` and
// `moduleWidth` sections are the acceptance gate (121 / 77 / 165 modules for the three
// pinned values).

const CODE_START_A = 103;
const CODE_START_B = 104;
const CODE_START_C = 105;
const CODE_CODE_A = 101;
const CODE_CODE_B = 100;
const CODE_CODE_C = 99;
const CODE_STOP = 106;

const CODE_FNC_1 = 102; // Code A, Code B, Code C
const CODE_FNC_2 = 97; // Code A, Code B
const CODE_FNC_3 = 96; // Code A, Code B
const CODE_FNC_4_A = 101; // Code A (same value as CODE_CODE_A — reused per ZXing)
const CODE_FNC_4_B = 100; // Code B (same value as CODE_CODE_B — reused per ZXing)

// Dummy characters used to specify control characters in input (ZXing's ESCAPE_FNC_*).
const ESCAPE_FNC_1 = "ñ";
const ESCAPE_FNC_2 = "ò";
const ESCAPE_FNC_3 = "ó";
const ESCAPE_FNC_4 = "ô";

const SPACE_CODE = 32; // ' '
const BACKTICK_CODE = 96; // '`'
const ZERO_CODE = 48; // '0'
const NINE_CODE = 57; // '9'
const FNC1_CODE = 0xf1; // ESCAPE_FNC_1
const FNC4_CODE = 0xf4; // ESCAPE_FNC_4

// Verbatim copy of com.google.zxing.oned.Code128Reader.CODE_PATTERNS (zxing-core 3.5.3).
// Rows 0-102: character/digit-pair values. Rows 96-102 double as FNC/shift/code symbols
// depending on context (reused per ZXing, not a transcription error). Rows 103-105: start
// A/B/C. Row 106: stop — 7 widths, not 6; the extra terminal bar is what Barcode128.kt's
// doc comment calls the "stop symbol's 2-module bar extension".
const CODE_PATTERNS                                 = [
  [2, 1, 2, 2, 2, 2], // 0
  [2, 2, 2, 1, 2, 2],
  [2, 2, 2, 2, 2, 1],
  [1, 2, 1, 2, 2, 3],
  [1, 2, 1, 3, 2, 2],
  [1, 3, 1, 2, 2, 2], // 5
  [1, 2, 2, 2, 1, 3],
  [1, 2, 2, 3, 1, 2],
  [1, 3, 2, 2, 1, 2],
  [2, 2, 1, 2, 1, 3],
  [2, 2, 1, 3, 1, 2], // 10
  [2, 3, 1, 2, 1, 2],
  [1, 1, 2, 2, 3, 2],
  [1, 2, 2, 1, 3, 2],
  [1, 2, 2, 2, 3, 1],
  [1, 1, 3, 2, 2, 2], // 15
  [1, 2, 3, 1, 2, 2],
  [1, 2, 3, 2, 2, 1],
  [2, 2, 3, 2, 1, 1],
  [2, 2, 1, 1, 3, 2],
  [2, 2, 1, 2, 3, 1], // 20
  [2, 1, 3, 2, 1, 2],
  [2, 2, 3, 1, 1, 2],
  [3, 1, 2, 1, 3, 1],
  [3, 1, 1, 2, 2, 2],
  [3, 2, 1, 1, 2, 2], // 25
  [3, 2, 1, 2, 2, 1],
  [3, 1, 2, 2, 1, 2],
  [3, 2, 2, 1, 1, 2],
  [3, 2, 2, 2, 1, 1],
  [2, 1, 2, 1, 2, 3], // 30
  [2, 1, 2, 3, 2, 1],
  [2, 3, 2, 1, 2, 1],
  [1, 1, 1, 3, 2, 3],
  [1, 3, 1, 1, 2, 3],
  [1, 3, 1, 3, 2, 1], // 35
  [1, 1, 2, 3, 1, 3],
  [1, 3, 2, 1, 1, 3],
  [1, 3, 2, 3, 1, 1],
  [2, 1, 1, 3, 1, 3],
  [2, 3, 1, 1, 1, 3], // 40
  [2, 3, 1, 3, 1, 1],
  [1, 1, 2, 1, 3, 3],
  [1, 1, 2, 3, 3, 1],
  [1, 3, 2, 1, 3, 1],
  [1, 1, 3, 1, 2, 3], // 45
  [1, 1, 3, 3, 2, 1],
  [1, 3, 3, 1, 2, 1],
  [3, 1, 3, 1, 2, 1],
  [2, 1, 1, 3, 3, 1],
  [2, 3, 1, 1, 3, 1], // 50
  [2, 1, 3, 1, 1, 3],
  [2, 1, 3, 3, 1, 1],
  [2, 1, 3, 1, 3, 1],
  [3, 1, 1, 1, 2, 3],
  [3, 1, 1, 3, 2, 1], // 55
  [3, 3, 1, 1, 2, 1],
  [3, 1, 2, 1, 1, 3],
  [3, 1, 2, 3, 1, 1],
  [3, 3, 2, 1, 1, 1],
  [3, 1, 4, 1, 1, 1], // 60
  [2, 2, 1, 4, 1, 1],
  [4, 3, 1, 1, 1, 1],
  [1, 1, 1, 2, 2, 4],
  [1, 1, 1, 4, 2, 2],
  [1, 2, 1, 1, 2, 4], // 65
  [1, 2, 1, 4, 2, 1],
  [1, 4, 1, 1, 2, 2],
  [1, 4, 1, 2, 2, 1],
  [1, 1, 2, 2, 1, 4],
  [1, 1, 2, 4, 1, 2], // 70
  [1, 2, 2, 1, 1, 4],
  [1, 2, 2, 4, 1, 1],
  [1, 4, 2, 1, 1, 2],
  [1, 4, 2, 2, 1, 1],
  [2, 4, 1, 2, 1, 1], // 75
  [2, 2, 1, 1, 1, 4],
  [4, 1, 3, 1, 1, 1],
  [2, 4, 1, 1, 1, 2],
  [1, 3, 4, 1, 1, 1],
  [1, 1, 1, 2, 4, 2], // 80
  [1, 2, 1, 1, 4, 2],
  [1, 2, 1, 2, 4, 1],
  [1, 1, 4, 2, 1, 2],
  [1, 2, 4, 1, 1, 2],
  [1, 2, 4, 2, 1, 1], // 85
  [4, 1, 1, 2, 1, 2],
  [4, 2, 1, 1, 1, 2],
  [4, 2, 1, 2, 1, 1],
  [2, 1, 2, 1, 4, 1],
  [2, 1, 4, 1, 2, 1], // 90
  [4, 1, 2, 1, 2, 1],
  [1, 1, 1, 1, 4, 3],
  [1, 1, 1, 3, 4, 1],
  [1, 3, 1, 1, 4, 1],
  [1, 1, 4, 1, 1, 3], // 95
  [1, 1, 4, 3, 1, 1],
  [4, 1, 1, 1, 1, 3],
  [4, 1, 1, 3, 1, 1],
  [1, 1, 3, 1, 4, 1],
  [1, 1, 4, 1, 3, 1], // 100
  [3, 1, 1, 1, 4, 1],
  [4, 1, 1, 1, 3, 1],
  [2, 1, 1, 4, 1, 2],
  [2, 1, 1, 2, 1, 4],
  [2, 1, 1, 2, 3, 2], // 105
  [2, 3, 3, 1, 1, 1, 2], // 106 — CODE_STOP (7 widths)
];



function isDigitCharCode(code        )          {
  return code >= ZERO_CODE && code <= NINE_CODE;
}

// Mirrors Code128Writer.findCType.
function findCType(value        , start        )        {
  const last = value.length;
  if (start >= last) return "UNCODABLE";
  let ch = value.charAt(start);
  if (ch === ESCAPE_FNC_1) return "FNC_1";
  if (!isDigitCharCode(ch.charCodeAt(0))) return "UNCODABLE";
  if (start + 1 >= last) return "ONE_DIGIT";
  ch = value.charAt(start + 1);
  if (!isDigitCharCode(ch.charCodeAt(0))) return "ONE_DIGIT";
  return "TWO_DIGITS";
}

// Mirrors Code128Writer.chooseCode exactly, including the digit-run lookahead that
// decides when to latch into (or stay out of) Code Set C.
function chooseCode(value        , start        , oldCode        )         {
  let lookahead = findCType(value, start);
  if (lookahead === "ONE_DIGIT") {
    return oldCode === CODE_CODE_A ? CODE_CODE_A : CODE_CODE_B;
  }
  if (lookahead === "UNCODABLE") {
    if (start < value.length) {
      const code = value.charCodeAt(start);
      if (
        code < SPACE_CODE ||
        (oldCode === CODE_CODE_A && (code < BACKTICK_CODE || (code >= FNC1_CODE && code <= FNC4_CODE)))
      ) {
        // can continue in code A, encodes ASCII 0 to 95 or FNC1 to FNC4
        return CODE_CODE_A;
      }
    }
    return CODE_CODE_B; // no choice
  }
  if (oldCode === CODE_CODE_A && lookahead === "FNC_1") {
    return CODE_CODE_A;
  }
  if (oldCode === CODE_CODE_C) {
    // can continue in code C
    return CODE_CODE_C;
  }
  if (oldCode === CODE_CODE_B) {
    if (lookahead === "FNC_1") {
      return CODE_CODE_B; // can continue in code B
    }
    // Seen two consecutive digits, see what follows
    lookahead = findCType(value, start + 2);
    if (lookahead === "UNCODABLE" || lookahead === "ONE_DIGIT") {
      return CODE_CODE_B; // not worth switching now
    }
    if (lookahead === "FNC_1") {
      // two digits, then FNC_1...
      lookahead = findCType(value, start + 3);
      if (lookahead === "TWO_DIGITS") {
        // then two more digits, switch
        return CODE_CODE_C;
      }
      return CODE_CODE_B; // otherwise not worth switching
    }
    // At this point, there are at least 4 consecutive digits.
    // Look ahead to choose whether to switch now or on the next round.
    let index = start + 4;
    while ((lookahead = findCType(value, index)) === "TWO_DIGITS") {
      index += 2;
    }
    if (lookahead === "ONE_DIGIT") {
      // odd number of digits, switch later
      return CODE_CODE_B;
    }
    return CODE_CODE_C; // even number of digits, switch now
  }
  // Here oldCode == 0, which means we are choosing the initial code
  if (lookahead === "FNC_1") {
    // ignore FNC_1
    lookahead = findCType(value, start + 1);
  }
  if (lookahead === "TWO_DIGITS") {
    // at least two digits, start in code C
    return CODE_CODE_C;
  }
  return CODE_CODE_B;
}

// Mirrors Code128Writer.check's ASCII validation (the parts reachable with no hints —
// Barcode128.kt never passes EncodeHintType.FORCE_CODE_SET, so that branch is omitted).
function validateAscii(contents        )       {
  for (let i = 0; i < contents.length; i++) {
    const ch = contents.charAt(i);
    if (ch === ESCAPE_FNC_1 || ch === ESCAPE_FNC_2 || ch === ESCAPE_FNC_3 || ch === ESCAPE_FNC_4) {
      continue;
    }
    const code = ch.charCodeAt(0);
    if (code > 127) {
      throw new Error(`Bad character in input: ASCII value=${code}`);
    }
  }
}

// Mirrors Code128Writer.produceResult: append the checksum + stop patterns, then flatten
// every symbol's width-run into one sequence. Every row 0-105 sums to 11 modules and
// always starts on a bar (each appendPattern call in ZXing resets to black), so simple
// concatenation already yields a valid alternating bar/space run-length sequence — no
// separate "merge adjacent same-color runs" step is needed at the symbol boundaries.
function produceResult(patterns            , checkSum        )           {
  const cs = checkSum % 103; // always >= 0: checkSum only ever accumulates non-negative terms
  patterns.push(CODE_PATTERNS[cs]            );
  patterns.push(CODE_PATTERNS[CODE_STOP]            );
  return patterns.flat();
}

// Mirrors Code128Writer.encodeFast (forcedCodeSet is always -1 for this app — Barcode128.kt
// never passes hints — so that parameter/branch is dropped rather than carried as dead code).
function encodeFast(contents        )           {
  const length = contents.length;
  const patterns             = [];
  let checkSum = 0;
  let checkWeight = 1;
  let codeSet = 0; // 0 = none chosen yet
  let position = 0;

  while (position < length) {
    const newCodeSet = chooseCode(contents, position, codeSet);
    let patternIndex        ;

    if (newCodeSet === codeSet) {
      // Encode the current character (first handle escapes, then per-code-set chars).
      const ch = contents.charAt(position);
      if (ch === ESCAPE_FNC_1) {
        patternIndex = CODE_FNC_1;
      } else if (ch === ESCAPE_FNC_2) {
        patternIndex = CODE_FNC_2;
      } else if (ch === ESCAPE_FNC_3) {
        patternIndex = CODE_FNC_3;
      } else if (ch === ESCAPE_FNC_4) {
        patternIndex = codeSet === CODE_CODE_A ? CODE_FNC_4_A : CODE_FNC_4_B;
      } else if (codeSet === CODE_CODE_A) {
        patternIndex = ch.charCodeAt(0) - SPACE_CODE;
        if (patternIndex < 0) {
          // everything below a space character comes behind the underscore in the table
          patternIndex += BACKTICK_CODE;
        }
      } else if (codeSet === CODE_CODE_B) {
        patternIndex = ch.charCodeAt(0) - SPACE_CODE;
      } else {
        // CODE_CODE_C — always encodes two characters
        if (position + 1 === length) {
          throw new Error("Bad number of characters for digit only encoding.");
        }
        patternIndex = parseInt(contents.substring(position, position + 2), 10);
        position++; // also incremented below
      }
      position++;
    } else {
      // Switching code set: do we have one yet?
      if (codeSet === 0) {
        patternIndex =
          newCodeSet === CODE_CODE_A ? CODE_START_A : newCodeSet === CODE_CODE_B ? CODE_START_B : CODE_START_C;
      } else {
        patternIndex = newCodeSet;
      }
      codeSet = newCodeSet;
    }

    patterns.push(CODE_PATTERNS[patternIndex]            );
    checkSum += patternIndex * checkWeight;
    if (position !== 0) {
      checkWeight++;
    }
  }

  return produceResult(patterns, checkSum);
}

/** Faithful, always-non-null mirror of `Code128Writer().encode(value)` — same behavior on
 *  every input including throwing for non-ASCII input and (degenerately) succeeding on an
 *  empty string. Not exported: callers use `encode128` (nullable/defensive) or
 *  `moduleCount` (strict, matches Kotlin's unguarded arithmetic) instead. */
function encodeCore(value        )           {
  validateAscii(value);
  return encodeFast(value);
}

/** Bar/space module run-lengths for `value` (start pattern + data/mode-switch symbols +
 *  checksum + stop, EXCLUDING the quiet zone) — a faithful port of ZXing's
 *  Code128Writer().encode(value), returned as widths rather than a per-module boolean[]
 *  (equivalent information, cheaper for a canvas/SVG renderer to consume). Returns null
 *  for blank input, mirroring Barcode128.kt's render()/renderExact() blank guard (that
 *  guard exists for those two rendering functions only — Kotlin's moduleCount() has no
 *  such guard, which `moduleCount` below mirrors by not routing through this function). */
export function encode128(value        )                  {
  if (value.trim().length === 0) return null;
  try {
    return encodeCore(value);
  } catch {
    return null;
  }
}

/** Total Code128 modules for `value`, INCLUDING the 20-module quiet zone (10 each side) —
 *  mirrors Barcode128.moduleCount(data) = Code128Writer().encode(data).size + 20 exactly,
 *  with the same (unguarded) behavior on edge-case input: this intentionally does NOT route
 *  through encode128's blank-safe null, so it stays numerically identical to the Kotlin
 *  side for every input the real encoder can process (including throwing on invalid
 *  characters, just like the Kotlin/ZXing original would). */
export function moduleCount(value        )         {
  const widths = encodeCore(value);
  let sum = 0;
  for (const w of widths) sum += w;
  return sum + 20;
}
