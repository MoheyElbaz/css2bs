/**
 * Bootstrap spacing scale reference (rem):
 * 0 => 0
 * 1 => .25rem
 * 2 => .5rem
 * 3 => 1rem
 * 4 => 1.5rem
 * 5 => 3rem
 */
const spacingScale = [
  { k: 0, rem: 0 },
  { k: 1, rem: 0.25 },
  { k: 2, rem: 0.5 },
  { k: 3, rem: 1 },
  { k: 4, rem: 1.5 },
  { k: 5, rem: 3 }
];

function toRem(val) {
  // Supports px/number/rem/em
  const s = String(val).trim().toLowerCase();
  if (s.endsWith("rem")) return parseFloat(s);
  if (s.endsWith("px")) return parseFloat(s) / 16; // assume 16px base
  const num = parseFloat(s);
  if (!Number.isNaN(num)) return num; // treat bare as rem
  return null;
}

function nearestScale(rem) {
  let best = spacingScale[0];
  let diff = Infinity;
  for (const item of spacingScale) {
    const d = Math.abs(item.rem - rem);
    if (d < diff) { diff = d; best = item; }
  }
  return best.k;
}

function mapSpacing(side, rem) {
  const k = nearestScale(rem);
  switch (side) {
    case "all": return `p-${k}`;
    case "x":   return `px-${k}`;
    case "y":   return `py-${k}`;
    case "t":   return `pt-${k}`;
    case "r":   return `pe-${k}`; // Bootstrap uses logical props: e=start, s=start
    case "b":   return `pb-${k}`;
    case "l":   return `ps-${k}`;
    default: return null;
  }
}

function mapMargin(side, rem) {
  const k = nearestScale(rem);
  switch (side) {
    case "all": return `m-${k}`;
    case "x":   return `mx-${k}`;
    case "y":   return `my-${k}`;
    case "t":   return `mt-${k}`;
    case "r":   return `me-${k}`;
    case "b":   return `mb-${k}`;
    case "l":   return `ms-${k}`;
    default: return null;
  }
}

export function mapDeclToBs(prop, value) {
  const p = prop.trim().toLowerCase();

  // Helpers for shorthand parsing (1-4 values)
  function parseShorthand(val) {
    const parts = String(val).trim().split(/\s+/);
    if (parts.length === 0) return null;
    if (parts.length === 1) {
      const v = parts[0];
      return [v, v, v, v];
    }
    if (parts.length === 2) {
      const [v, h] = parts;
      return [v, h, v, h]; // top/bottom, right/left
    }
    if (parts.length === 3) {
      const [t, h, b] = parts;
      return [t, h, b, h]; // right/left share
    }
    return [parts[0], parts[1], parts[2], parts[3]]; // t r b l
  }

  // line-height
  if (p === "line-height") {
    const v = String(value).trim();
    if (v === "1") return "lh-1";
    if (v === "sm" || v === "1.25") return "lh-sm";
    if (v === "base" || v === "1.5") return "lh-base";
    if (v === "lg" || v === "2") return "lh-lg";
    return null;
  }

  // padding
  if (p === "padding") {
    const vals = parseShorthand(value);
    if (!vals) return null;
    const [t, r, b, l] = vals;
    const classes = [];
    const tr = toRem(t); if (tr != null) classes.push(mapSpacing("t", tr));
    const rr = toRem(r); if (rr != null) classes.push(mapSpacing("r", rr));
    const br = toRem(b); if (br != null) classes.push(mapSpacing("b", br));
    const lr = toRem(l); if (lr != null) classes.push(mapSpacing("l", lr));
    return classes.filter(Boolean).join(" ") || null;
  }
  if (p === "padding-left" || p === "padding-inline-start") {
    const rem = toRem(value); if (rem == null) return null;
    return mapSpacing("l", rem);
  }
  if (p === "padding-right" || p === "padding-inline-end") {
    const rem = toRem(value); if (rem == null) return null;
    return mapSpacing("r", rem);
  }
  if (p === "padding-top") {
    const rem = toRem(value); if (rem == null) return null;
    return mapSpacing("t", rem);
  }
  if (p === "padding-bottom") {
    const rem = toRem(value); if (rem == null) return null;
    return mapSpacing("b", rem);
  }

  // margin
  if (p === "margin") {
    const vals = parseShorthand(value);
    if (!vals) return null;
    const [t, r, b, l] = vals;
    const classes = [];
    const ts = String(t).trim().toLowerCase();
    const rs = String(r).trim().toLowerCase();
    const bs = String(b).trim().toLowerCase();
    const ls = String(l).trim().toLowerCase();
    if (ts === "auto") classes.push("mt-auto"); else { const tr = toRem(t); if (tr != null) classes.push(mapMargin("t", tr)); }
    if (rs === "auto") classes.push("me-auto"); else { const rr = toRem(r); if (rr != null) classes.push(mapMargin("r", rr)); }
    if (bs === "auto") classes.push("mb-auto"); else { const br = toRem(b); if (br != null) classes.push(mapMargin("b", br)); }
    if (ls === "auto") classes.push("ms-auto"); else { const lr = toRem(l); if (lr != null) classes.push(mapMargin("l", lr)); }
    return classes.filter(Boolean).join(" ") || null;
  }
  if (p === "margin-left" || p === "margin-inline-start") {
    const s = String(value).trim().toLowerCase();
    if (s === "auto") return "ms-auto";
    const rem = toRem(value); if (rem == null) return null;
    return mapMargin("l", rem);
  }
  if (p === "margin-right" || p === "margin-inline-end") {
    const s = String(value).trim().toLowerCase();
    if (s === "auto") return "me-auto";
    const rem = toRem(value); if (rem == null) return null;
    return mapMargin("r", rem);
  }
  if (p === "margin-top") {
    const s = String(value).trim().toLowerCase();
    if (s === "auto") return "mt-auto";
    const rem = toRem(value); if (rem == null) return null;
    return mapMargin("t", rem);
  }
  if (p === "margin-bottom") {
    const s = String(value).trim().toLowerCase();
    if (s === "auto") return "mb-auto";
    const rem = toRem(value); if (rem == null) return null;
    return mapMargin("b", rem);
  }

  // TODO: add font-size -> fs-*, text-*, etc., as needed
  return null;
}
