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
  const suffix = breakpoint ? `-${breakpoint}` : '';
  switch (side) {
    case "all": return `p${suffix}-${k}`;
    case "x":   return `px${suffix}-${k}`;
    case "y":   return `py${suffix}-${k}`;
    case "t":   return `pt${suffix}-${k}`;
    case "r":   return `pe${suffix}-${k}`; // Bootstrap uses logical props: e=end, s=start
    case "b":   return `pb${suffix}-${k}`;
    case "l":   return `ps${suffix}-${k}`;
    default: return null;
  }
}

function mapMargin(side, rem, breakpoint = null) {
  const k = nearestScale(rem);
  const suffix = breakpoint ? `-${breakpoint}` : '';
  switch (side) {
    case "all": return `m${suffix}-${k}`;
    case "x":   return `mx${suffix}-${k}`;
    case "y":   return `my${suffix}-${k}`;
    case "t":   return `mt${suffix}-${k}`;
    case "r":   return `me${suffix}-${k}`;
    case "b":   return `mb${suffix}-${k}`;
    case "l":   return `ms${suffix}-${k}`;
    default: return null;
  }
}

/**
 * Map heading styles to display utilities
 * This handles h1-h6 styles and large font sizes that should use display-* instead of fs-*
 */
function mapHeadingToDisplay(fontSize, breakpoint = null) {
  const suffix = breakpoint ? `-${breakpoint}` : '';
  const rem = toRem(fontSize);

  if (rem != null) {
    // Map to the closest Bootstrap display size, not the largest possible
    if (rem >= 5) return `display${suffix}-1`; // 80px+
    if (rem >= 4.5) return `display${suffix}-2`; // 72px+
    if (rem >= 4) return `display${suffix}-3`; // 64px+
    if (rem >= 3.5) return `display${suffix}-4`; // 56px+
    if (rem >= 3) return `display${suffix}-5`; // 48px+
    if (rem >= 2.5) return `display${suffix}-6`; // 40px+
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

  // Check for display classes (display-1 through display-6) and responsive variants
  const displayClassRegex = /(^|\s)(display-[1-6]|(sm|md|lg|xl|xxl)-display-[1-6])(\s|$)/;
  return displayClassRegex.test(s);
}

/**
 * Centralized selector matching helper
 * Finds exact selectors for all CSS properties
 */
function findExactSelector(selector, htmlContent) {
  if (!selector || !htmlContent) return null;

  // Clean the selector (remove pseudo-elements, media queries, etc.)
  const cleanSelector = selector
    .replace(/::before|::after|::first-child|::last-child|::nth-child\([^)]+\)/g, '')
    .replace(/@media[^{]*\{/g, '')
    .trim();

  // Handle different selector types
  if (cleanSelector.startsWith('.')) {
    // Class selector: .class-name
    const className = cleanSelector.substring(1);
    const classRegex = new RegExp(`class="[^"]*\\b${className}\\b[^"]*"`, 'g');
    const matches = htmlContent.match(classRegex);

    if (matches && matches.length > 0) {
      return {
        type: 'class',
        selector: cleanSelector,
        className: className,
        matches: matches.length,
        firstMatch: matches[0]
      };
    }
  } else if (cleanSelector.startsWith('#')) {
    // ID selector: #id-name
    const idName = cleanSelector.substring(1);
    const idRegex = new RegExp(`id="${idName}"`, 'g');
    const matches = htmlContent.match(idRegex);

    if (matches && matches.length > 0) {
      return {
        type: 'id',
        selector: cleanSelector,
        idName: idName,
        matches: matches.length,
        firstMatch: matches[0]
      };
    }
  } else if (/^[a-zA-Z][a-zA-Z0-9]*$/.test(cleanSelector)) {
    // Tag selector: div, span, etc.
    const tagRegex = new RegExp(`<${cleanSelector}\\b`, 'g');
    const matches = htmlContent.match(tagRegex);

    if (matches && matches.length > 0) {
      return {
        type: 'tag',
        selector: cleanSelector,
        tagName: cleanSelector,
        matches: matches.length,
        firstMatch: matches[0]
      };
    }
  } else if (cleanSelector.includes(' ')) {
    // Descendant selector: .parent .child
    const parts = cleanSelector.split(' ').map(part => part.trim()).filter(part => part);

    if (parts.length === 2) {
      const [parent, child] = parts;
      const parentClass = parent.startsWith('.') ? parent.substring(1) : null;
      const childClass = child.startsWith('.') ? child.substring(1) : null;

      if (parentClass && childClass) {
        // Look for parent element containing child with specific class
        const parentRegex = new RegExp(`<[^>]*class="[^"]*\\b${parentClass}\\b[^"]*"[^>]*>`, 'g');
        const parentMatches = htmlContent.match(parentRegex);

        if (parentMatches && parentMatches.length > 0) {
          return {
            type: 'descendant',
            selector: cleanSelector,
            parentClass: parentClass,
            childClass: childClass,
            matches: parentMatches.length,
            firstMatch: parentMatches[0]
          };
        }
      }
    }
  }

  return null;
}

/**
 * Check if a selector should be processed for Bootstrap mapping
 */
function shouldProcessSelector(selector, htmlContent) {
  if (!selector || !htmlContent) return false;

  // Don't process pseudo-elements
  if (selector.includes('::')) return false;

  // Don't process media queries
  if (selector.includes('@media')) return false;

  // Don't process complex selectors that don't have HTML matches
  const exactMatch = findExactSelector(selector, htmlContent);
  return exactMatch !== null;
}

export function mapDeclToBs(prop, value, breakpoint = null, selector = null, htmlContent = null) {
  const p = prop.trim().toLowerCase();

  // Don't process pseudo-elements
  if (selector && selector.includes('::')) {
    return null;
  }

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

    // Handle exact matches first
    if (v === "1") return "lh-1";
    if (v === "sm" || v === "1.25") return "lh-sm";
    if (v === "base" || v === "1.5") return "lh-base";
    if (v === "lg" || v === "2") return "lh-lg";

    // Handle numeric values by finding closest Bootstrap line-height
    const numValue = parseFloat(v);
    if (!isNaN(numValue)) {
      const lineHeightMap = [
        { value: 1, class: "lh-1" },
        { value: 1.25, class: "lh-sm" },
        { value: 1.5, class: "lh-base" },
        { value: 2, class: "lh-lg" }
      ];

      let closest = lineHeightMap[0];
      let minDiff = Math.abs(numValue - closest.value);

      for (const item of lineHeightMap) {
        const diff = Math.abs(numValue - item.value);
        if (diff < minDiff) {
          minDiff = diff;
          closest = item;
        }
      }

      return closest.class;
    }

    return null;
  }

  // padding
  if (p === "padding") {
    const vals = parseShorthand(value);
    if (!vals) return null;
    const [t, r, b, l] = vals;

    // Check if all sides are the same - use shorthand class
    if (t === r && r === b && b === l) {
      const rem = toRem(t);
      if (rem != null) return mapSpacing("all", rem, breakpoint);
    }

    // Check for x/y patterns
    if (t === b && r === l) {
      const classes = [];
      const tr = toRem(t); if (tr != null) classes.push(mapSpacing("y", tr, breakpoint));
      const rr = toRem(r); if (rr != null) classes.push(mapSpacing("x", rr, breakpoint));
      return classes.filter(Boolean).join(" ") || null;
    }

    // Otherwise, break down to individual sides
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
    const ts = String(t).trim().toLowerCase();
    const rs = String(r).trim().toLowerCase();
    const bs = String(b).trim().toLowerCase();
    const ls = String(l).trim().toLowerCase();

    // Check if all sides are equal (for using m- instead of individual sides)
    if (ts === rs && rs === bs && bs === ls) {
      if (ts === "auto") {
        const suffix = breakpoint ? `-${breakpoint}` : '';
        return `m${suffix}-auto`;
      } else {
        const rem = toRem(t);
        if (rem != null) return mapMargin("all", rem, breakpoint);
      }
    }

    const classes = [];
    const suffix = breakpoint ? `-${breakpoint}` : '';
    if (ts === "auto") classes.push(`mt${suffix}-auto`); else { const tr = toRem(t); if (tr != null) classes.push(mapMargin("t", tr, breakpoint)); }
    if (rs === "auto") classes.push(`me${suffix}-auto`); else { const rr = toRem(r); if (rr != null) classes.push(mapMargin("r", rr, breakpoint)); }
    if (bs === "auto") classes.push(`mb${suffix}-auto`); else { const br = toRem(b); if (br != null) classes.push(mapMargin("b", br, breakpoint)); }
    if (ls === "auto") classes.push(`ms${suffix}-auto`); else { const lr = toRem(l); if (lr != null) classes.push(mapMargin("l", lr, breakpoint)); }
    return classes.filter(Boolean).join(" ") || null;
  }
  if (p === "margin-left" || p === "margin-inline-start") {
    const s = String(value).trim().toLowerCase();
    const suffix = breakpoint ? `-${breakpoint}` : '';
    if (s === "auto") return `ms${suffix}-auto`;
    const rem = toRem(value); if (rem == null) return null;
    return mapMargin("l", rem, breakpoint);
  }
  if (p === "margin-right" || p === "margin-inline-end") {
    const s = String(value).trim().toLowerCase();
    const suffix = breakpoint ? `-${breakpoint}` : '';
    if (s === "auto") return `me${suffix}-auto`;
    const rem = toRem(value); if (rem == null) return null;
    return mapMargin("r", rem, breakpoint);
  }
  if (p === "margin-top") {
    const s = String(value).trim().toLowerCase();
    const suffix = breakpoint ? `-${breakpoint}` : '';
    if (s === "auto") return `mt${suffix}-auto`;
    const rem = toRem(value); if (rem == null) return null;
    return mapMargin("t", rem, breakpoint);
  }
  if (p === "margin-bottom") {
    const s = String(value).trim().toLowerCase();
    const suffix = breakpoint ? `-${breakpoint}` : '';
    if (s === "auto") return `mb${suffix}-auto`;
    const rem = toRem(value); if (rem == null) return null;
    return mapMargin("b", rem, breakpoint);
  }

  // font-size
  if (p === "font-size") {
    const v = String(value).trim().toLowerCase();
    const suffix = breakpoint ? `-${breakpoint}` : '';

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
      if (rem <= 0.875) return `fs${suffix}-6`; // 14px or smaller
      if (rem <= 1) return `fs${suffix}-5`; // 16px
      if (rem <= 1.125) return `fs${suffix}-4`; // 18px
      if (rem <= 1.25) return `fs${suffix}-3`; // 20px
      if (rem <= 1.5) return `fs${suffix}-2`; // 24px
      if (rem <= 2) return `fs${suffix}-1`; // 32px
      return `fs${suffix}-1`; // Default to largest
    }

    // Handle keyword values
    if (v === "small" || v === "smaller") return `fs${suffix}-6`;
    if (v === "medium" || v === "normal") return `fs${suffix}-5`;
    if (v === "large" || v === "larger") return `fs${suffix}-4`;
    if (v === "x-large" || v === "xx-large") return `fs${suffix}-3`;
    if (v === "xxx-large") return `fs${suffix}-2`;

    return null;
  }

  // font-weight -> fw-*
  if (p === "font-weight") {
    const v = String(value).trim().toLowerCase();
    const suffix = breakpoint ? `-${breakpoint}` : '';

    // Bootstrap 5.3 font-weight classes
    if (v === "100" || v === "lighter") return `fw${suffix}-lighter`;
    if (v === "200") return `fw${suffix}-lighter`;
    if (v === "300" || v === "light") return `fw${suffix}-light`;
    if (v === "400" || v === "normal") return `fw${suffix}-normal`;
    if (v === "500" || v === "medium") return `fw${suffix}-medium`;
    if (v === "600" || v === "semibold") return `fw${suffix}-semibold`;
    if (v === "700" || v === "bold") return `fw${suffix}-bold`;
    if (v === "800") return `fw${suffix}-bold`;
    if (v === "900" || v === "bolder") return `fw${suffix}-bolder`;

    return null;
  }

  // font-style -> fst-*
  if (p === "font-style") {
    const v = String(value).trim().toLowerCase();
    const suffix = breakpoint ? `-${breakpoint}` : '';

    if (v === "italic") return `fst${suffix}-italic`;
    if (v === "normal") return `fst${suffix}-normal`;

    return null;
  }

  // font-family -> font-*
  if (p === "font-family") {
    const v = String(value).trim().toLowerCase();

    // Check for monospace fonts
    if (v.includes("monospace") || v.includes("courier") || v.includes("consolas") ||
        v.includes("monaco") || v.includes("menlo") || v.includes("sfmono")) {
      return "font-monospace";
    }

    // Bootstrap doesn't have other font-family utilities beyond monospace
    return null;
  }

  // text-transform -> text-*
  if (p === "text-transform") {
    const v = String(value).trim().toLowerCase();
    const suffix = breakpoint ? `-${breakpoint}` : '';

    if (v === "uppercase") return `text${suffix}-uppercase`;
    if (v === "lowercase") return `text${suffix}-lowercase`;
    if (v === "capitalize") return `text${suffix}-capitalize`;
    // Bootstrap doesn't have text-none, so don't map "none"
    if (v === "none") return null;

    return null;
  }

  // text-decoration -> text-decoration-* (NO responsive support in Bootstrap 5.3)
  if (p === "text-decoration") {
    const v = String(value).trim().toLowerCase();

    // Text-decoration utilities don't support responsive breakpoints in Bootstrap 5.3
    if (breakpoint) return null;

    if (v.includes("underline")) return "text-decoration-underline";
    if (v.includes("line-through")) return "text-decoration-line-through";
    if (v === "none") return "text-decoration-none";

    return null;
  }

  // Only handle these properties for non-media queries (no breakpoint prefix)
  // Also ignore pseudo-elements (::before, ::after, etc.)
  if (!breakpoint && !selector.includes('::')) {
    // position -> position-*
    if (p === "position") {
      const v = String(value).trim().toLowerCase();

      if (v === "static") return "position-static";
      if (v === "relative") return "position-relative";
      if (v === "absolute") return "position-absolute";
      if (v === "fixed") return "position-fixed";
      if (v === "sticky") return "position-sticky";

      return null;
    }

    // top, right, bottom, left -> top-*, end-*, bottom-*, start-*
    if (p === "top") {
      const v = String(value).trim().toLowerCase();

      // Bootstrap 5.3 position values: 0, 50%, 100%
      if (v === "0" || v === "0px") return "top-0";
      if (v === "50%" || v === "0.5") return "top-50";
      if (v === "100%" || v === "1") return "top-100";

      // Handle negative values (for centering transforms)
      if (v === "-50%") return "top-50"; // Often used with translate-middle

      return null;
    }

    if (p === "right") {
      const v = String(value).trim().toLowerCase();

      // Bootstrap uses 'end' for right positioning (LTR)
      if (v === "0" || v === "0px") return "end-0";
      if (v === "50%" || v === "0.5") return "end-50";
      if (v === "100%" || v === "1") return "end-100";

      // Handle negative values
      if (v === "-50%") return "end-50";

      return null;
    }

    if (p === "bottom") {
      const v = String(value).trim().toLowerCase();

      if (v === "0" || v === "0px") return "bottom-0";
      if (v === "50%" || v === "0.5") return "bottom-50";
      if (v === "100%" || v === "1") return "bottom-100";

      // Handle negative values
      if (v === "-50%") return "bottom-50";

      return null;
    }

    if (p === "left") {
      const v = String(value).trim().toLowerCase();

      // Bootstrap uses 'start' for left positioning (LTR)
      if (v === "0" || v === "0px") return "start-0";
      if (v === "50%" || v === "0.5") return "start-50";
      if (v === "100%" || v === "1") return "start-100";

      // Handle negative values
      if (v === "-50%") return "start-50";

      return null;
    }

    // transform -> translate-middle utilities
    if (p === "transform") {
      const v = String(value).trim().toLowerCase();

      // Bootstrap centering transforms
      if (v.includes("translate(-50%, -50%)")) return "translate-middle";
      if (v.includes("translatex(-50%)")) return "translate-middle-x";
      if (v.includes("translatey(-50%)")) return "translate-middle-y";

      // Handle space variations
      if (v.includes("translate( -50%, -50% )")) return "translate-middle";
      if (v.includes("translate(-50%,-50%)")) return "translate-middle";

      return null;
    }

    // overflow -> overflow-*
    if (p === "overflow") {
      const v = String(value).trim().toLowerCase();

      if (v === "visible") return "overflow-visible";
      if (v === "hidden") return "overflow-hidden";
      if (v === "scroll") return "overflow-scroll";
      if (v === "auto") return "overflow-auto";

      return null;
    }

    // border-radius -> rounded-*
    if (p === "border-radius") {
      const v = String(value).trim().toLowerCase();

      if (v === "0") return "rounded-0";
      if (v === "0.25rem" || v === "4px") return "rounded-1";
      if (v === "0.375rem" || v === "6px") return "rounded-2";
      if (v === "0.5rem" || v === "8px") return "rounded-3";
      // Bootstrap 5.3 only has rounded-0 to rounded-3, plus special cases
      if (v === "50%") return "rounded-circle";
      if (v === "50rem" || v === "9999px") return "rounded-pill";
      // Default rounded for common values
      if (v === "0.25rem" || v === "4px" || v === ".25rem") return "rounded";

      return null;
    }

    // background-color -> bg-* (exact colors only)
    if (p === "background-color") {
      const v = String(value).trim().toLowerCase();

      // Bootstrap 5.3 exact color values
      if (v === "#000" || v === "#000000" || v === "black") return "bg-black";
      if (v === "#fff" || v === "#ffffff" || v === "white") return "bg-white";
      if (v === "transparent") return "bg-transparent";

      // Primary colors
      if (v === "#0d6efd") return "bg-primary";
      if (v === "#6c757d") return "bg-secondary";
      if (v === "#198754") return "bg-success";
      if (v === "#0dcaf0") return "bg-info";
      if (v === "#ffc107") return "bg-warning";
      if (v === "#dc3545") return "bg-danger";
      if (v === "#f8f9fa") return "bg-light";
      if (v === "#212529") return "bg-dark";

      // Gray scale
      if (v === "#e9ecef") return "bg-light";
      if (v === "#dee2e6") return "bg-light";
      if (v === "#ced4da") return "bg-light";
      if (v === "#adb5bd") return "bg-secondary";
      if (v === "#495057") return "bg-dark";
      if (v === "#343a40") return "bg-dark";

      return null;
    }

    // display -> d-*
    if (p === "display") {
      const v = String(value).trim().toLowerCase();

      if (v === "none") return "d-none";
      if (v === "inline") return "d-inline";
      if (v === "inline-block") return "d-inline-block";
      if (v === "block") return "d-block";
      if (v === "grid") return "d-grid";
      if (v === "table") return "d-table";
      if (v === "table-row") return "d-table-row";
      if (v === "table-cell") return "d-table-cell";
      if (v === "flex") return "d-flex";
      if (v === "inline-flex") return "d-inline-flex";

      return null;
    }

    // text-align -> text-* (supports responsive breakpoints)
    if (p === "text-align") {
      const v = String(value).trim().toLowerCase();
      const suffix = breakpoint ? `-${breakpoint}` : '';

      if (v === "start" || v === "left") return `text${suffix}-start`;
      if (v === "end" || v === "right") return `text${suffix}-end`;
      if (v === "center") return `text${suffix}-center`;
      // Note: text-justify doesn't support responsive breakpoints in Bootstrap 5.3
      if (v === "justify" && !breakpoint) return "text-justify";

      return null;
    }

    // color -> text-* (exact colors only)
    if (p === "color") {
      const v = String(value).trim().toLowerCase();

      // Bootstrap 5.3 exact color values
      if (v === "#000" || v === "#000000" || v === "black") return "text-black";
      if (v === "#fff" || v === "#ffffff" || v === "white") return "text-white";
      if (v === "transparent") return "text-transparent";

      // Primary colors
      if (v === "#0d6efd") return "text-primary";
      if (v === "#6c757d") return "text-secondary";
      if (v === "#198754") return "text-success";
      if (v === "#0dcaf0") return "text-info";
      if (v === "#ffc107") return "text-warning";
      if (v === "#dc3545") return "text-danger";
      if (v === "#f8f9fa") return "text-light";
      if (v === "#212529") return "text-dark";

      // Gray scale
      if (v === "#e9ecef") return "text-light";
      if (v === "#dee2e6") return "text-light";
      if (v === "#ced4da") return "text-light";
      if (v === "#adb5bd") return "text-secondary";
      if (v === "#495057") return "text-dark";
      if (v === "#343a40") return "text-dark";

      return null;
    }

    // width -> w-*
    if (p === "width") {
      const v = String(value).trim().toLowerCase();
      const suffix = breakpoint ? `-${breakpoint}` : '';

      // Percentage values
      if (v === "25%" || v === "0.25") return `w${suffix}-25`;
      if (v === "50%" || v === "0.5") return `w${suffix}-50`;
      if (v === "75%" || v === "0.75") return `w${suffix}-75`;
      if (v === "100%" || v === "1") return `w${suffix}-100`;
      if (v === "auto") return `w${suffix}-auto`;

      // Viewport units
      if (v === "100vw") return `vw${suffix}-100`;

      // For pixel values, rem values, etc. - Bootstrap doesn't have equivalents
      // so we don't map them and let them stay in the CSS
      return null;
    }

    // height -> h-*
    if (p === "height") {
      const v = String(value).trim().toLowerCase();
      const suffix = breakpoint ? `-${breakpoint}` : '';

      if (v === "25%" || v === "0.25") return `h${suffix}-25`;
      if (v === "50%" || v === "0.5") return `h${suffix}-50`;
      if (v === "75%" || v === "0.75") return `h${suffix}-75`;
      if (v === "100%" || v === "1") return `h${suffix}-100`;
      if (v === "100vh") return `vh${suffix}-100`;
      if (v === "auto") return `h${suffix}-auto`;
      return null;
    }

    // max-width -> mw-*
    if (p === "max-width") {
      const v = String(value).trim().toLowerCase();
      if (v === "100%" || v === "1") return "mw-100";
      return null;
    }

    // min-height -> min-vh-*
    if (p === "min-height") {
      const v = String(value).trim().toLowerCase();
      if (v === "100vh") return "min-vh-100";
      return null;
    }

    // flex-direction -> flex-*
    if (p === "flex-direction") {
      const v = String(value).trim().toLowerCase();
      const suffix = breakpoint ? `-${breakpoint}` : '';

      if (v === "row") return `flex${suffix}-row`;
      if (v === "column") return `flex${suffix}-column`;
      if (v === "row-reverse") return `flex${suffix}-row-reverse`;
      if (v === "column-reverse") return `flex${suffix}-column-reverse`;
      return null;
    }

    // justify-content -> justify-content-*
    if (p === "justify-content") {
      const v = String(value).trim().toLowerCase();
      const suffix = breakpoint ? `-${breakpoint}` : '';

      if (v === "start" || v === "flex-start") return `justify-content${suffix}-start`;
      if (v === "center") return `justify-content${suffix}-center`;
      if (v === "end" || v === "flex-end") return `justify-content${suffix}-end`;
      if (v === "space-between") return `justify-content${suffix}-between`;
      if (v === "space-around") return `justify-content${suffix}-around`;
      if (v === "space-evenly") return `justify-content${suffix}-evenly`;
      return null;
    }

    // align-items -> align-items-*
    if (p === "align-items") {
      const v = String(value).trim().toLowerCase();
      const suffix = breakpoint ? `-${breakpoint}` : '';

      if (v === "start" || v === "flex-start") return `align-items${suffix}-start`;
      if (v === "center") return `align-items${suffix}-center`;
      if (v === "end" || v === "flex-end") return `align-items${suffix}-end`;
      if (v === "baseline") return `align-items${suffix}-baseline`;
      if (v === "stretch") return `align-items${suffix}-stretch`;
      return null;
    }

    // align-self -> align-self-*
    if (p === "align-self") {
      const v = String(value).trim().toLowerCase();
      const suffix = breakpoint ? `-${breakpoint}` : '';

      if (v === "start" || v === "flex-start") return `align-self${suffix}-start`;
      if (v === "center") return `align-self${suffix}-center`;
      if (v === "end" || v === "flex-end") return `align-self${suffix}-end`;
      if (v === "baseline") return `align-self${suffix}-baseline`;
      if (v === "stretch") return `align-self${suffix}-stretch`;
      return null;
    }

    // flex-wrap -> flex-*
    if (p === "flex-wrap") {
      const v = String(value).trim().toLowerCase();
      const suffix = breakpoint ? `-${breakpoint}` : '';

      if (v === "wrap") return `flex${suffix}-wrap`;
      if (v === "nowrap") return `flex${suffix}-nowrap`;
      if (v === "wrap-reverse") return `flex${suffix}-wrap-reverse`;
      return null;
    }

    // flex-grow -> flex-grow-*
    if (p === "flex-grow") {
      const v = String(value).trim();
      if (v === "0") return "flex-grow-0";
      if (v === "1") return "flex-grow-1";
      return null;
    }

    // flex-shrink -> flex-shrink-*
    if (p === "flex-shrink") {
      const v = String(value).trim();
      if (v === "0") return "flex-shrink-0";
      if (v === "1") return "flex-shrink-1";
      return null;
    }

    // order -> order-*
    if (p === "order") {
      const v = String(value).trim();
      const suffix = breakpoint ? `-${breakpoint}` : '';

      if (v === "-1") return `order${suffix}-first`;
      if (v >= "0" && v <= "5") return `order${suffix}-${v}`;
      if (v === "999" || v === "9999") return `order${suffix}-last`;
      return null;
    }

    // gap -> gap-*
    if (p === "gap") {
      const rem = toRem(value);
      if (rem != null) {
        const suffix = breakpoint ? `-${breakpoint}` : '';
        const scale = nearestScale(rem);
        return `gap${suffix}-${scale}`;
      }
      return null;
    }

    // row-gap -> row-gap-*
    if (p === "row-gap") {
      const rem = toRem(value);
      if (rem != null) {
        const suffix = breakpoint ? `-${breakpoint}` : '';
        const scale = nearestScale(rem);
        return `row-gap${suffix}-${scale}`;
      }
      return null;
    }

    // column-gap -> column-gap-*
    if (p === "column-gap") {
      const rem = toRem(value);
      if (rem != null) {
        const suffix = breakpoint ? `-${breakpoint}` : '';
        const scale = nearestScale(rem);
        return `column-gap${suffix}-${scale}`;
      }
      return null;
    }

    // border -> border-*
    if (p === "border") {
      const v = String(value).trim().toLowerCase();
      if (v === "none" || v === "0") return "border-0";
      if (v.includes("1px") || v.includes("thin")) return "border";
      return null;
    }

    // border-top -> border-top
    if (p === "border-top") {
      const v = String(value).trim().toLowerCase();
      if (v === "none" || v === "0") return "border-top-0";
      if (v.includes("1px") || v.includes("thin")) return "border-top";
      return null;
    }

    // border-end -> border-end
    if (p === "border-right" || p === "border-inline-end") {
      const v = String(value).trim().toLowerCase();
      if (v === "none" || v === "0") return "border-end-0";
      if (v.includes("1px") || v.includes("thin")) return "border-end";
      return null;
    }

    // border-bottom -> border-bottom
    if (p === "border-bottom") {
      const v = String(value).trim().toLowerCase();
      if (v === "none" || v === "0") return "border-bottom-0";
      if (v.includes("1px") || v.includes("thin")) return "border-bottom";
      return null;
    }

    // border-start -> border-start
    if (p === "border-left" || p === "border-inline-start") {
      const v = String(value).trim().toLowerCase();
      if (v === "none" || v === "0") return "border-start-0";
      if (v.includes("1px") || v.includes("thin")) return "border-start";
      return null;
    }

    // border-width -> border-*
    if (p === "border-width") {
      const v = String(value).trim().toLowerCase();
      if (v === "1px" || v === "thin") return "border-1";
      if (v === "2px") return "border-2";
      if (v === "3px") return "border-3";
      if (v === "4px") return "border-4";
      if (v === "5px") return "border-5";
      return null;
    }

    // border-color -> border-*
    if (p === "border-color") {
      const v = String(value).trim().toLowerCase();

      // Bootstrap color mappings
      if (v === "#0d6efd" || v === "blue") return "border-primary";
      if (v === "#6c757d" || v === "gray") return "border-secondary";
      if (v === "#198754" || v === "green") return "border-success";
      if (v === "#0dcaf0" || v === "cyan") return "border-info";
      if (v === "#ffc107" || v === "yellow") return "border-warning";
      if (v === "#dc3545" || v === "red") return "border-danger";
      if (v === "#f8f9fa" || v === "lightgray") return "border-light";
      if (v === "#212529" || v === "darkgray") return "border-dark";
      if (v === "#fff" || v === "#ffffff" || v === "white") return "border-white";
      return null;
    }

    // box-shadow -> shadow-*
    if (p === "box-shadow") {
      const v = String(value).trim().toLowerCase();
      if (v === "none") return "shadow-none";
      if (v.includes("0 1px 2px") || v.includes("small")) return "shadow-sm";
      if (v.includes("0 4px 6px") || v.includes("0 .125rem .25rem")) return "shadow";
      if (v.includes("0 8px 16px") || v.includes("0 .5rem 1rem")) return "shadow-lg";
      return null;
    }

    // z-index -> z-*
    if (p === "z-index") {
      const v = String(value).trim();
      if (v === "-1") return "z-n1";
      if (v === "0") return "z-0";
      if (v === "1") return "z-1";
      if (v === "2") return "z-2";
      if (v === "3") return "z-3";
      if (v === "1000") return "z-1000";
      if (v === "1020") return "z-1020";
      if (v === "1030") return "z-1030";
      if (v === "1040") return "z-1040";
      if (v === "1050") return "z-1050";
      if (v === "1060") return "z-1060";
      if (v === "1070") return "z-1070";
      if (v === "1080") return "z-1080";
      return null;
    }

    // opacity -> opacity-*
    if (p === "opacity") {
      const v = parseFloat(value);
      if (v === 0) return "opacity-0";
      if (v === 0.25) return "opacity-25";
      if (v === 0.5) return "opacity-50";
      if (v === 0.75) return "opacity-75";
      if (v === 1) return "opacity-100";
      return null;
    }

    // visibility -> visible/invisible
    if (p === "visibility") {
      const v = String(value).trim().toLowerCase();
      if (v === "visible") return "visible";
      if (v === "hidden") return "invisible";
      return null;
    }

    // float -> float-*
    if (p === "float") {
      const v = String(value).trim().toLowerCase();
      const suffix = breakpoint ? `-${breakpoint}` : '';

      if (v === "left" || v === "start") return `float${suffix}-start`;
      if (v === "right" || v === "end") return `float${suffix}-end`;
      if (v === "none") return `float${suffix}-none`;
      return null;
    }

    // clear -> clearfix
    if (p === "clear") {
      const v = String(value).trim().toLowerCase();
      if (v === "both" || v === "left" || v === "right") return "clearfix";
      return null;
    }

    // vertical-align -> align-*
    if (p === "vertical-align") {
      const v = String(value).trim().toLowerCase();
      if (v === "baseline") return "align-baseline";
      if (v === "top") return "align-top";
      if (v === "middle") return "align-middle";
      if (v === "bottom") return "align-bottom";
      if (v === "text-top") return "align-text-top";
      if (v === "text-bottom") return "align-text-bottom";
      return null;
    }

    // object-fit -> object-fit-*
    if (p === "object-fit") {
      const v = String(value).trim().toLowerCase();
      if (v === "contain") return "object-fit-contain";
      if (v === "cover") return "object-fit-cover";
      if (v === "fill") return "object-fit-fill";
      if (v === "scale-down") return "object-fit-scale";
      if (v === "none") return "object-fit-none";
      return null;
    }

    // white-space -> text-*
    if (p === "white-space") {
      const v = String(value).trim().toLowerCase();
      if (v === "nowrap") return "text-nowrap";
      if (v === "pre") return "text-pre";
      if (v === "pre-wrap") return "text-wrap";
      return null;
    }

    // word-break -> text-break
    if (p === "word-break") {
      const v = String(value).trim().toLowerCase();
      if (v === "break-all" || v === "break-word") return "text-break";
      return null;
    }

    // word-wrap -> text-break (according to Bootstrap docs, both properties are supported)
    if (p === "word-wrap") {
      const v = String(value).trim().toLowerCase();
      if (v === "break-word") return "text-break";
      return null;
    }

    // cursor -> cursor-pointer
    if (p === "cursor") {
      const v = String(value).trim().toLowerCase();
      if (v === "pointer") return "cursor-pointer";
      return null;
    }

    // pointer-events -> pe-*
    if (p === "pointer-events") {
      const v = String(value).trim().toLowerCase();
      if (v === "none") return "pe-none";
      if (v === "auto") return "pe-auto";
      return null;
    }

    // user-select -> user-select-*
    if (p === "user-select") {
      const v = String(value).trim().toLowerCase();
      if (v === "none") return "user-select-none";
      if (v === "all") return "user-select-all";
      if (v === "auto") return "user-select-auto";
      return null;
    }
  }

  return null;
}

/**
 * Process media query rules and extract responsive classes
 */
export function processMediaQuery(mediaQuery, rules, htmlContent = null) {
  const breakpoint = parseMediaQuery(mediaQuery);
  if (!breakpoint) return null;

  const responsiveClasses = [];

  rules.forEach(rule => {
    rule.walkDecls(decl => {
      const cls = mapDeclToBs(decl.prop, decl.value, breakpoint, rule.selector, htmlContent);
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
