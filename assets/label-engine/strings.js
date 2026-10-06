// Every user-visible string on a label. ONE formula per fact — line-for-line mirror of
// app/src/main/java/com/mohammed/possystem/core/label/LabelStrings.kt; vectors.json pins
// both sides (Math.round here == Kotlin's roundToLong/roundToInt for the non-negative
// domain every value in this file operates in).



export function cardCents(cashCents        , pct        , flatCents        )         {
  return cashCents + Math.round((cashCents * pct) / 100) + flatCents;
}

export function money(cents        )         {
  const dollars = Math.floor(cents / 100);
  const remainder = String(cents % 100).padStart(2, "0");
  return `$${dollars}.${remainder}`;
}

/** Not part of the Task 8 brief's binding strings.ts signature list, but Kotlin exports
 *  the equivalent LabelStrings.taxNote() directly and vectors.json pins its exact string
 *  independently of textFor — exported here too so both can be tested the same way. */
export function taxNote()         {
  return "+ tax";
}

export function depositNote(cents        )         {
  return cents < 100 ? `+ ${cents}¢ deposit` : `+ ${money(cents)} deposit`;
}

/** Final text for a text element; null = element hidden (spec §2 conditional rules). */
export function textFor(el              , c                 , dual              )                {
  switch (el.type) {
    case "name":
      return c.name;
    case "brand":
      return c.brand ?? null;
    case "packSize":
      return c.packSize ?? null;
    case "cashPrice": {
      const tag = el.showTag && dual.enabled ? "CASH " : "";
      return tag + money(c.cashCents);
    }
    case "cardPrice": {
      if (!dual.enabled) return null;
      const tag = el.showTag ? "CARD " : "";
      return tag + money(cardCents(c.cashCents, dual.pct, dual.flatCents));
    }
    case "taxNote":
      return c.taxable ? taxNote() : null;
    case "depositNote":
      return c.depositCents > 0 ? depositNote(c.depositCents) : null;
    case "stock":
      return c.stock == null ? null : `Stock: ${c.stock}`;
    case "category":
      return c.category ?? null;
    case "customText":
      return el.text ?? null;
    case "barcode":
    case "barcodeDigits":
      return c.barcode ?? null;
    default: {
      const exhaustive        = el.type;
      return exhaustive;
    }
  }
}
