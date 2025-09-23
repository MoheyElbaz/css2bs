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

  // Handle range queries (min-width AND max-width)
  if (mq.includes('and')) {
    // Extract min-width and max-width values
    const minWidthMatch = mq.match(/min-width:\s*(\d+(?:\.\d+)?)px/);
    const maxWidthMatch = mq.match(/max-width:\s*(\d+(?:\.\d+)?)px/);

    if (minWidthMatch && maxWidthMatch) {
      const minWidth = parseFloat(minWidthMatch[1]);
      const maxWidth = parseFloat(maxWidthMatch[1]);

      // Map ranges to Bootstrap breakpoints
      // sm: 576px-767px, md: 768px-991px, lg: 992px-1199px, xl: 1200px-1399px, xxl: 1400px+
      if (minWidth >= 576 && maxWidth <= 767) return 'sm';
      if (minWidth >= 768 && maxWidth <= 991) return 'md';
      if (minWidth >= 992 && maxWidth <= 1199) return 'lg';
      if (minWidth >= 1200 && maxWidth <= 1399) return 'xl';
      if (minWidth >= 1400) return 'xxl';
    }
  }

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

/**
 * Parse font-size ranges (clamp, min, max, calc)
 * Returns the most appropriate rem value for Bootstrap mapping
 */
function parseFontSizeRange(value) {
  const s = String(value).trim().toLowerCase();

  // Handle clamp(min, preferred, max)
  const clampMatch = s.match(/clamp\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/);
  if (clampMatch) {
    const min = toRem(clampMatch[1].trim());
    const preferred = toRem(clampMatch[2].trim());
    const max = toRem(clampMatch[3].trim());

    // Use the preferred value, or fallback to min if preferred is not available
    if (preferred != null) return preferred;
    if (min != null) return min;
    if (max != null) return max;
  }

  // Handle min(a, b)
  const minMatch = s.match(/min\s*\(\s*([^,]+),\s*([^)]+)\)/);
  if (minMatch) {
    const a = toRem(minMatch[1].trim());
    const b = toRem(minMatch[2].trim());
    if (a != null && b != null) return Math.min(a, b);
    if (a != null) return a;
    if (b != null) return b;
  }

  // Handle max(a, b)
  const maxMatch = s.match(/max\s*\(\s*([^,]+),\s*([^)]+)\)/);
  if (maxMatch) {
    const a = toRem(maxMatch[1].trim());
    const b = toRem(maxMatch[2].trim());
    if (a != null && b != null) return Math.max(a, b);
    if (a != null) return a;
    if (b != null) return b;
  }

  // Handle calc() expressions
  if (s.includes('calc(')) {
    // Extract rem values from calc expressions
    const remMatch = s.match(/(\d+(?:\.\d+)?)\s*rem/);
    if (remMatch) return parseFloat(remMatch[1]);

    // Extract px values and convert to rem
    const pxMatch = s.match(/(\d+(?:\.\d+)?)\s*px/);
    if (pxMatch) return parseFloat(pxMatch[1]) / 16;
  }

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

/**
 * Map heading styles to display utilities
 * This handles h1-h6 styles and large font sizes that should use display-* instead of fs-*
 */
function mapHeadingToDisplay(fontSize, breakpoint = null) {
  const prefix = breakpoint ? `${breakpoint}-` : '';
  const rem = toRem(fontSize);

  if (rem != null) {
    // Map to the closest Bootstrap display size, not the largest possible
    if (rem >= 5) return `${prefix}display-1`; // 80px+
    if (rem >= 4.5) return `${prefix}display-2`; // 72px+
    if (rem >= 4) return `${prefix}display-3`; // 64px+
    if (rem >= 3.5) return `${prefix}display-4`; // 56px+
    if (rem >= 3) return `${prefix}display-5`; // 48px+
    if (rem >= 2.5) return `${prefix}display-6`; // 40px+
  }

  return null;
}

/**
 * Check if a font size should use display utilities instead of fs utilities
 * Only use display utilities for heading elements (h1-h6)
 */
function shouldUseDisplay(fontSize, selector = null) {
  const rem = toRem(fontSize);
  if (rem != null && rem >= 1.125) { // 18px and above
    // Only use display utilities for heading elements
    return isHeadingSelector(selector || '');
  }
  return false;
}

/**
 * Check if a selector is a heading element
 * This includes h1-h6 tags and classes that are typically used for headings
 */
function isHeadingSelector(selector) {
  if (!selector) return false;

  const s = selector.trim().toLowerCase();

  // Direct heading tags
  const headingRegex = /^h[1-6](\s|$|\.|#|\[)/;
  if (headingRegex.test(s)) return true;

  // Common heading class patterns
  const headingClassPatterns = [
    /\.title/, /\.heading/, /\.header/, /\.hero-title/, /\.page-title/,
    /\.section-title/, /\.card-title/, /\.modal-title/
  ];

  return headingClassPatterns.some(pattern => pattern.test(s));
}

/**
 * Check if Bootstrap display classes are already present in the selector
 * If they are, we should ignore custom font-size declarations
 */
function hasBootstrapDisplayClass(selector) {
  if (!selector) return false;

  const s = selector.trim().toLowerCase();

  // Check for display classes (display-1 through display-6)
  const displayClassRegex = /display-[1-6](\s|$)/;
  return displayClassRegex.test(s);
}

export function mapDeclToBs(prop, value, breakpoint = null, selector = null) {
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

  // font-size
  if (p === "font-size") {
    const v = String(value).trim().toLowerCase();
    const prefix = breakpoint ? `${breakpoint}-` : '';

    // If Bootstrap display classes are already present, ignore custom font-size
    if (hasBootstrapDisplayClass(selector)) {
      return null; // Don't map font-size if display classes are already present
    }

    // Handle rem/px values and font-size ranges
    let rem = toRem(value);
    if (rem == null) {
      // Try to parse font-size ranges (clamp, min, max, calc)
      rem = parseFontSizeRange(value);
    }

    if (rem != null) {
      // Check if this should use display utilities (large font sizes for headings only)
      if (shouldUseDisplay(value, selector)) {
        const displayClass = mapHeadingToDisplay(value, breakpoint);
        if (displayClass) return displayClass;
      }

      // For smaller font sizes, use fs-* utilities
      if (rem <= 0.875) return `${prefix}fs-6`; // 14px or smaller
      if (rem <= 1) return `${prefix}fs-5`; // 16px
      if (rem <= 1.125) return `${prefix}fs-4`; // 18px
      if (rem <= 1.25) return `${prefix}fs-3`; // 20px
      if (rem <= 1.5) return `${prefix}fs-2`; // 24px
      if (rem <= 2) return `${prefix}fs-1`; // 32px
      return `${prefix}fs-1`; // Default to largest
    }

    // Handle keyword values
    if (v === "small" || v === "smaller") return `${prefix}fs-6`;
    if (v === "medium" || v === "normal") return `${prefix}fs-5`;
    if (v === "large" || v === "larger") return `${prefix}fs-4`;
    if (v === "x-large" || v === "xx-large") return `${prefix}fs-3`;
    if (v === "xxx-large") return `${prefix}fs-2`;

    return null;
  }

  // font-weight -> fw-*
  if (p === "font-weight") {
    const v = String(value).trim().toLowerCase();
    const prefix = breakpoint ? `${breakpoint}-` : '';

    // Bootstrap 5.3 font-weight classes
    if (v === "100" || v === "lighter") return `${prefix}fw-lighter`;
    if (v === "200") return `${prefix}fw-lighter`;
    if (v === "300" || v === "light") return `${prefix}fw-light`;
    if (v === "400" || v === "normal") return `${prefix}fw-normal`;
    if (v === "500" || v === "medium") return `${prefix}fw-medium`;
    if (v === "600" || v === "semibold") return `${prefix}fw-semibold`;
    if (v === "700" || v === "bold") return `${prefix}fw-bold`;
    if (v === "800") return `${prefix}fw-bold`;
    if (v === "900" || v === "bolder") return `${prefix}fw-bolder`;

    return null;
  }

  // font-style -> fst-*
  if (p === "font-style") {
    const v = String(value).trim().toLowerCase();
    const prefix = breakpoint ? `${breakpoint}-` : '';

    if (v === "italic") return `${prefix}fst-italic`;
    if (v === "normal") return `${prefix}fst-normal`;

    return null;
  }

  // text-transform -> text-*
  if (p === "text-transform") {
    const v = String(value).trim().toLowerCase();
    const prefix = breakpoint ? `${breakpoint}-` : '';

    if (v === "uppercase") return `${prefix}text-uppercase`;
    if (v === "lowercase") return `${prefix}text-lowercase`;
    if (v === "capitalize") return `${prefix}text-capitalize`;
    if (v === "none") return `${prefix}text-capitalize`; // Bootstrap doesn't have text-none

    return null;
  }

  // text-decoration -> text-decoration-*
  if (p === "text-decoration") {
    const v = String(value).trim().toLowerCase();
    const prefix = breakpoint ? `${breakpoint}-` : '';

    if (v.includes("underline")) return `${prefix}text-decoration-underline`;
    if (v.includes("line-through")) return `${prefix}text-decoration-line-through`;
    if (v === "none") return `${prefix}text-decoration-none`;

    return null;
  }

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
