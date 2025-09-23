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

/**
 * Bootstrap 5.3 responsive breakpoints
 */
const breakpoints = {
  'sm': '(min-width: 576px)',
  'md': '(min-width: 768px)',
  'lg': '(min-width: 992px)',
  'xl': '(min-width: 1200px)',
  'xxl': '(min-width: 1400px)'
};

/**
 * Parse media query to get Bootstrap breakpoint
 */
function parseMediaQuery(mediaQuery) {
  const mq = mediaQuery.trim().toLowerCase();

  // Handle min-width queries
  if (mq.includes('min-width')) {
    if (mq.includes('576px')) return 'sm';
    if (mq.includes('768px')) return 'md';
    if (mq.includes('992px')) return 'lg';
    if (mq.includes('1200px')) return 'xl';
    if (mq.includes('1400px')) return 'xxl';
  }

  // Handle max-width queries (for mobile-first approach)
  if (mq.includes('max-width')) {
    if (mq.includes('575.98px')) return 'sm';
    if (mq.includes('767.98px')) return 'md';
    if (mq.includes('991.98px')) return 'lg';
    if (mq.includes('1199.98px')) return 'xl';
    if (mq.includes('1399.98px')) return 'xxl';
  }

  return null;
}

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

function mapSpacing(side, rem, breakpoint = null) {
  const k = nearestScale(rem);
  const prefix = breakpoint ? `${breakpoint}-` : '';
  switch (side) {
    case "all": return `${prefix}p-${k}`;
    case "x":   return `${prefix}px-${k}`;
    case "y":   return `${prefix}py-${k}`;
    case "t":   return `${prefix}pt-${k}`;
    case "r":   return `${prefix}pe-${k}`; // Bootstrap uses logical props: e=start, s=start
    case "b":   return `${prefix}pb-${k}`;
    case "l":   return `${prefix}ps-${k}`;
    default: return null;
  }
}

function mapMargin(side, rem, breakpoint = null) {
  const k = nearestScale(rem);
  const prefix = breakpoint ? `${breakpoint}-` : '';
  switch (side) {
    case "all": return `${prefix}m-${k}`;
    case "x":   return `${prefix}mx-${k}`;
    case "y":   return `${prefix}my-${k}`;
    case "t":   return `${prefix}mt-${k}`;
    case "r":   return `${prefix}me-${k}`;
    case "b":   return `${prefix}mb-${k}`;
    case "l":   return `${prefix}ms-${k}`;
    default: return null;
  }
}

export function mapDeclToBs(prop, value, breakpoint = null) {
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
    const tr = toRem(t); if (tr != null) classes.push(mapSpacing("t", tr, breakpoint));
    const rr = toRem(r); if (rr != null) classes.push(mapSpacing("r", rr, breakpoint));
    const br = toRem(b); if (br != null) classes.push(mapSpacing("b", br, breakpoint));
    const lr = toRem(l); if (lr != null) classes.push(mapSpacing("l", lr, breakpoint));
    return classes.filter(Boolean).join(" ") || null;
  }
  if (p === "padding-left" || p === "padding-inline-start") {
    const rem = toRem(value); if (rem == null) return null;
    return mapSpacing("l", rem, breakpoint);
  }
  if (p === "padding-right" || p === "padding-inline-end") {
    const rem = toRem(value); if (rem == null) return null;
    return mapSpacing("r", rem, breakpoint);
  }
  if (p === "padding-top") {
    const rem = toRem(value); if (rem == null) return null;
    return mapSpacing("t", rem, breakpoint);
  }
  if (p === "padding-bottom") {
    const rem = toRem(value); if (rem == null) return null;
    return mapSpacing("b", rem, breakpoint);
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
    const prefix = breakpoint ? `${breakpoint}-` : '';
    if (ts === "auto") classes.push(`${prefix}mt-auto`); else { const tr = toRem(t); if (tr != null) classes.push(mapMargin("t", tr, breakpoint)); }
    if (rs === "auto") classes.push(`${prefix}me-auto`); else { const rr = toRem(r); if (rr != null) classes.push(mapMargin("r", rr, breakpoint)); }
    if (bs === "auto") classes.push(`${prefix}mb-auto`); else { const br = toRem(b); if (br != null) classes.push(mapMargin("b", br, breakpoint)); }
    if (ls === "auto") classes.push(`${prefix}ms-auto`); else { const lr = toRem(l); if (lr != null) classes.push(mapMargin("l", lr, breakpoint)); }
    return classes.filter(Boolean).join(" ") || null;
  }
  if (p === "margin-left" || p === "margin-inline-start") {
    const s = String(value).trim().toLowerCase();
    const prefix = breakpoint ? `${breakpoint}-` : '';
    if (s === "auto") return `${prefix}ms-auto`;
    const rem = toRem(value); if (rem == null) return null;
    return mapMargin("l", rem, breakpoint);
  }
  if (p === "margin-right" || p === "margin-inline-end") {
    const s = String(value).trim().toLowerCase();
    const prefix = breakpoint ? `${breakpoint}-` : '';
    if (s === "auto") return `${prefix}me-auto`;
    const rem = toRem(value); if (rem == null) return null;
    return mapMargin("r", rem, breakpoint);
  }
  if (p === "margin-top") {
    const s = String(value).trim().toLowerCase();
    const prefix = breakpoint ? `${breakpoint}-` : '';
    if (s === "auto") return `${prefix}mt-auto`;
    const rem = toRem(value); if (rem == null) return null;
    return mapMargin("t", rem, breakpoint);
  }
  if (p === "margin-bottom") {
    const s = String(value).trim().toLowerCase();
    const prefix = breakpoint ? `${breakpoint}-` : '';
    if (s === "auto") return `${prefix}mb-auto`;
    const rem = toRem(value); if (rem == null) return null;
    return mapMargin("b", rem, breakpoint);
  }

  // TODO: add font-size -> fs-*, text-*, etc., as needed
  return null;
}

/**
 * Process media query rules and extract responsive classes
 */
export function processMediaQuery(mediaQuery, rules) {
  const breakpoint = parseMediaQuery(mediaQuery);
  if (!breakpoint) return null;

  const responsiveClasses = [];

  rules.forEach(rule => {
    rule.walkDecls(decl => {
      const cls = mapDeclToBs(decl.prop, decl.value, breakpoint);
      if (cls) {
        responsiveClasses.push(cls);
      }
    });
  });

  return {
    breakpoint,
    classes: responsiveClasses.filter(Boolean)
  };
}

// Export the parseMediaQuery function for use in index.js
export { parseMediaQuery };
