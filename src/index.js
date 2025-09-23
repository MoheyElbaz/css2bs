import postcss from "postcss";
import safeParser from "postcss-safe-parser";
import fs from "node:fs";
import path from "node:path";
import { mapDeclToBs, processMediaQuery } from "./mappers.js";

function extractClassTokens(selector) {
  // Remove attribute selectors and pseudo parts
  const withoutAttrs = selector.replace(/\[[^\]]*\]/g, "");
  const withoutPseudos = withoutAttrs.replace(/:{1,2}[A-Za-z0-9_-]+(\([^)]*\))?/g, "");
  const matches = withoutPseudos.match(/\.[A-Za-z0-9_-]+/g) || [];
  return matches.map(s => s.slice(1));
}

// Bootstrap component classes that should not have spacing utilities added
const bootstrapComponentClasses = new Set([
  'btn', 'btn-primary', 'btn-secondary', 'btn-success', 'btn-danger', 'btn-warning', 'btn-info', 'btn-light', 'btn-dark',
  'btn-outline-primary', 'btn-outline-secondary', 'btn-outline-success', 'btn-outline-danger', 'btn-outline-warning', 'btn-outline-info', 'btn-outline-light', 'btn-outline-dark',
  'btn-sm', 'btn-lg', 'btn-block',
  'dropdown', 'dropdown-toggle', 'dropdown-menu', 'dropdown-item', 'dropdown-divider',
  'navbar', 'navbar-nav', 'navbar-brand', 'navbar-toggler', 'navbar-collapse',
  'nav', 'nav-link', 'nav-item', 'nav-tabs', 'nav-pills',
  'card', 'card-header', 'card-body', 'card-footer', 'card-title', 'card-text',
  'modal', 'modal-dialog', 'modal-content', 'modal-header', 'modal-body', 'modal-footer',
  'form-control', 'form-label', 'form-text', 'form-check', 'form-check-input', 'form-check-label',
  'badge', 'bg-primary', 'bg-secondary', 'bg-success', 'bg-danger', 'bg-warning', 'bg-info', 'bg-light', 'bg-dark',
  'alert', 'alert-primary', 'alert-secondary', 'alert-success', 'alert-danger', 'alert-warning', 'alert-info', 'alert-light', 'alert-dark',
  'list-group', 'list-group-item',
  'table', 'table-striped', 'table-bordered', 'table-hover',
  'container', 'container-fluid', 'row', 'col', 'col-1', 'col-2', 'col-3', 'col-4', 'col-5', 'col-6', 'col-7', 'col-8', 'col-9', 'col-10', 'col-11', 'col-12',
  'd-flex', 'd-inline', 'd-block', 'd-none', 'd-grid', 'd-table', 'd-table-cell', 'd-table-row',
  'justify-content-start', 'justify-content-end', 'justify-content-center', 'justify-content-between', 'justify-content-around', 'justify-content-evenly',
  'align-items-start', 'align-items-end', 'align-items-center', 'align-items-baseline', 'align-items-stretch',
  'text-start', 'text-end', 'text-center', 'text-nowrap', 'text-truncate',
  'text-primary', 'text-secondary', 'text-success', 'text-danger', 'text-warning', 'text-info', 'text-light', 'text-dark', 'text-muted', 'text-white',
  'bg-primary', 'bg-secondary', 'bg-success', 'bg-danger', 'bg-warning', 'bg-info', 'bg-light', 'bg-dark', 'bg-white', 'bg-transparent',
  'border', 'border-0', 'border-top', 'border-end', 'border-bottom', 'border-start',
  'rounded', 'rounded-0', 'rounded-1', 'rounded-2', 'rounded-3', 'rounded-circle', 'rounded-pill',
  'shadow', 'shadow-sm', 'shadow-lg', 'shadow-none',
  'position-static', 'position-relative', 'position-absolute', 'position-fixed', 'position-sticky',
  'top-0', 'top-50', 'top-100', 'start-0', 'start-50', 'start-100', 'bottom-0', 'bottom-50', 'bottom-100', 'end-0', 'end-50', 'end-100',
  'translate-middle', 'translate-middle-x', 'translate-middle-y',
  'w-25', 'w-50', 'w-75', 'w-100', 'w-auto', 'mw-100', 'min-vw-100', 'vw-100',
  'h-25', 'h-50', 'h-75', 'h-100', 'h-auto', 'mh-100', 'min-vh-100', 'vh-100',
  'flex-row', 'flex-column', 'flex-row-reverse', 'flex-column-reverse',
  'flex-wrap', 'flex-nowrap', 'flex-wrap-reverse',
  'justify-content-start', 'justify-content-end', 'justify-content-center', 'justify-content-between', 'justify-content-around', 'justify-content-evenly',
  'align-content-start', 'align-content-end', 'align-content-center', 'align-content-between', 'align-content-around', 'align-content-stretch',
  'align-self-auto', 'align-self-start', 'align-self-end', 'align-self-center', 'align-self-baseline', 'align-self-stretch',
  'order-first', 'order-0', 'order-1', 'order-2', 'order-3', 'order-4', 'order-5', 'order-last',
  'g-0', 'g-1', 'g-2', 'g-3', 'g-4', 'g-5',
  'gx-0', 'gx-1', 'gx-2', 'gx-3', 'gx-4', 'gx-5',
  'gy-0', 'gy-1', 'gy-2', 'gy-3', 'gy-4', 'gy-5',
  'm-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-auto',
  'mt-0', 'mt-1', 'mt-2', 'mt-3', 'mt-4', 'mt-5', 'mt-auto',
  'me-0', 'me-1', 'me-2', 'me-3', 'me-4', 'me-5', 'me-auto',
  'mb-0', 'mb-1', 'mb-2', 'mb-3', 'mb-4', 'mb-5', 'mb-auto',
  'ms-0', 'ms-1', 'ms-2', 'ms-3', 'ms-4', 'ms-5', 'ms-auto',
  'mx-0', 'mx-1', 'mx-2', 'mx-3', 'mx-4', 'mx-5', 'mx-auto',
  'my-0', 'my-1', 'my-2', 'my-3', 'my-4', 'my-5', 'my-auto',
  'p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-5',
  'pt-0', 'pt-1', 'pt-2', 'pt-3', 'pt-4', 'pt-5',
  'pe-0', 'pe-1', 'pe-2', 'pe-3', 'pe-4', 'pe-5',
  'pb-0', 'pb-1', 'pb-2', 'pb-3', 'pb-4', 'pb-5',
  'ps-0', 'ps-1', 'ps-2', 'ps-3', 'ps-4', 'ps-5',
  'px-0', 'px-1', 'px-2', 'px-3', 'px-4', 'px-5',
  'py-0', 'py-1', 'py-2', 'py-3', 'py-4', 'py-5',
  'fs-1', 'fs-2', 'fs-3', 'fs-4', 'fs-5', 'fs-6',
  'fw-light', 'fw-normal', 'fw-bold', 'fw-bolder', 'fw-lighter',
  'fst-italic', 'fst-normal',
  'lh-1', 'lh-sm', 'lh-base', 'lh-lg',
  'text-decoration-none', 'text-decoration-underline', 'text-decoration-line-through',
  'text-uppercase', 'text-lowercase', 'text-capitalize',
  'user-select-all', 'user-select-auto', 'user-select-none',
  'pe-none', 'pe-auto',
  'overflow-auto', 'overflow-hidden', 'overflow-visible', 'overflow-scroll',
  'd-print-block', 'd-print-flex', 'd-print-inline', 'd-print-inline-block', 'd-print-inline-flex', 'd-print-none', 'd-print-table', 'd-print-table-cell', 'd-print-table-row'
]);

function walkBladeFiles(dir) {
  const results = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(current)) {
        if (entry === "node_modules" || entry.startsWith(".")) continue;
        stack.push(path.join(current, entry));
      }
    } else if (stat.isFile()) {
      if (current.endsWith(".blade.php") || current.endsWith(".php") || current.endsWith(".blade.html")) {
        results.push(current);
      }
    }
  }
  return results;
}

/**
 * Clean up conflicting responsive classes
 */
function cleanConflictingClasses(classes) {
  const tokens = classes.split(/\s+/).filter(Boolean);
  const cleaned = [];

  // Group classes by type and breakpoint
  const classGroups = {
    display: { regular: [], sm: [], md: [], lg: [], xl: [], xxl: [] },
    fs: { regular: [], sm: [], md: [], lg: [], xl: [], xxl: [] }
  };

  // Separate font-related classes from other classes
  const otherClasses = [];

  for (const token of tokens) {
    if (token.includes('display-')) {
      if (token.startsWith('sm-')) classGroups.display.sm.push(token);
      else if (token.startsWith('md-')) classGroups.display.md.push(token);
      else if (token.startsWith('lg-')) classGroups.display.lg.push(token);
      else if (token.startsWith('xl-')) classGroups.display.xl.push(token);
      else if (token.startsWith('xxl-')) classGroups.display.xxl.push(token);
      else classGroups.display.regular.push(token);
    } else if (token.includes('fs-')) {
      if (token.startsWith('sm-')) classGroups.fs.sm.push(token);
      else if (token.startsWith('md-')) classGroups.fs.md.push(token);
      else if (token.startsWith('lg-')) classGroups.fs.lg.push(token);
      else if (token.startsWith('xl-')) classGroups.fs.xl.push(token);
      else if (token.startsWith('xxl-')) classGroups.fs.xxl.push(token);
      else classGroups.fs.regular.push(token);
    } else {
      otherClasses.push(token);
    }
  }

  // Check if we have any display classes at all
  const hasAnyDisplayClasses = Object.values(classGroups.display).some(arr => arr.length > 0);
  const hasAnyFsClasses = Object.values(classGroups.fs).some(arr => arr.length > 0);

  // If we have both display and fs classes, prefer display and remove all fs classes
  if (hasAnyDisplayClasses && hasAnyFsClasses) {
    // Only add display classes, ignore fs classes
    const breakpoints = ['regular', 'sm', 'md', 'lg', 'xl', 'xxl'];
    for (const breakpoint of breakpoints) {
      cleaned.push(...classGroups.display[breakpoint]);
    }
  } else if (hasAnyDisplayClasses) {
    // Only display classes - choose the largest size for each breakpoint
    const breakpoints = ['regular', 'sm', 'md', 'lg', 'xl', 'xxl'];
    for (const breakpoint of breakpoints) {
      const displayClasses = classGroups.display[breakpoint];
      if (displayClasses.length > 0) {
        // Choose the largest display class (display-1 is largest)
        const sortedClasses = displayClasses.sort((a, b) => {
          const aNum = parseInt(a.match(/display-(\d+)/)?.[1] || '0');
          const bNum = parseInt(b.match(/display-(\d+)/)?.[1] || '0');
          return aNum - bNum; // Smaller number = larger display
        });
        cleaned.push(sortedClasses[0]); // Take the largest (smallest number)
      }
    }
  } else if (hasAnyFsClasses) {
    // Only fs classes
    const breakpoints = ['regular', 'sm', 'md', 'lg', 'xl', 'xxl'];
    for (const breakpoint of breakpoints) {
      cleaned.push(...classGroups.fs[breakpoint]);
    }
  }

  // Add all other classes
  cleaned.push(...otherClasses);

  // Remove duplicates and return
  const uniqueClasses = [...new Set(cleaned)];
  return uniqueClasses.join(' ');
}

function appendBootstrapClassesInClassAttr(html, classToken, classesToAppend) {
  // Find class attributes; append classesToAppend if classToken present
  return html.replace(/class\s*=\s*(["'])([\s\S]*?)\1/g, (m, quote, classValue) => {
    const tokens = classValue.split(/\s+/).filter(Boolean);
    if (!tokens.includes(classToken)) return m; // untouched
    const appendTokens = classesToAppend.split(/\s+/).filter(Boolean);

    // Combine existing and new classes
    const allClasses = [...tokens, ...appendTokens].join(' ');

    // Clean up conflicting classes
    const cleanedClasses = cleanConflictingClasses(allClasses);

    return `class=${quote}${cleanedClasses}${quote}`;
  });
}

// Removed equivalents JSON generation as requested

/**
 * Convert CSS to Bootstrap utility classes for simple spacing/line-height.
 * Returns both a text mapping and a small HTML snippet example.
 */
export async function convertCssToBootstrap(cssText, { selector = "" } = {}) {
  const root = postcss().process(cssText, { parser: safeParser }).root;

  const rules = [];
  const mediaQueries = [];

  // Process regular rules
  root.walkRules(r => {
    if (selector && !r.selector.split(",").map(s => s.trim()).includes(selector)) return;
    const mapped = [];
    r.walkDecls(d => {
      const cls = mapDeclToBs(d.prop, d.value, null, r.selector);
      if (cls) mapped.push(cls);
    });
    if (mapped.length) {
      rules.push({ selector: r.selector, classes: Array.from(new Set(mapped)).sort() });
    }
  });

  // Process media queries
  root.walkAtRules('media', atRule => {
    const mediaQuery = atRule.params;
    const mediaRules = [];

    atRule.walkRules(rule => {
      if (selector && !rule.selector.split(",").map(s => s.trim()).includes(selector)) return;
      const mapped = [];
      rule.walkDecls(d => {
        const cls = mapDeclToBs(d.prop, d.value, null, rule.selector);
        if (cls) mapped.push(cls);
      });
      if (mapped.length) {
        mediaRules.push({ selector: rule.selector, classes: Array.from(new Set(mapped)).sort() });
      }
    });

    if (mediaRules.length > 0) {
      const mediaResult = processMediaQuery(mediaQuery, mediaRules);
      if (mediaResult) {
        mediaQueries.push({
          mediaQuery,
          breakpoint: mediaResult.breakpoint,
          rules: mediaRules
        });
      }
    }
  });

  // Build a simple text table
  const lines = [];
  for (const r of rules) {
    lines.push(`${r.selector}  =>  ${r.classes.join(" ")}`);
  }

  // Add media query rules
  for (const mq of mediaQueries) {
    lines.push(`\n/* ${mq.mediaQuery} */`);
    for (const r of mq.rules) {
      lines.push(`${r.selector}  =>  ${r.classes.join(" ")}`);
    }
  }

  const text = lines.join("\n");

  // Tiny HTML demo for the first rule (if selector provided, use that)
  const demo = rules[0];
  const html = demo
    ? `<!-- Example usage -->
<div class="${demo.classes.join(" ")}">Mapped from ${demo.selector}</div>`
    : "<!-- No mappable rules found -->";

  return { text, html, mediaQueries };
}

export async function applyCssToBladeFiles(cssText, bladeDirPath) {
  // First, scan all Blade files to find existing class tokens
  const files = walkBladeFiles(bladeDirPath);
  const existingClasses = new Set();

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    // Extract all class tokens from class attributes
    const matches = content.match(/class\s*=\s*["']([^"']*)["']/g) || [];
    for (const match of matches) {
      const classValue = match.match(/class\s*=\s*["']([^"']*)["']/)[1];
      const tokens = classValue.split(/\s+/).filter(Boolean);
      for (const token of tokens) {
        existingClasses.add(token);
      }
    }
  }

  const root = postcss().process(cssText, { parser: safeParser }).root;
  // Build mapping of class token -> bootstrap classes string
  const classTokenToBs = new Map();
  const processedInMediaQueries = new Set();

  // Process media queries first to track which selectors are handled responsively
  root.walkAtRules('media', atRule => {
    const mediaQuery = atRule.params;
    const mediaResult = processMediaQuery(mediaQuery, [atRule]);

    if (mediaResult) {
      atRule.walkRules(rule => {
        const selectors = rule.selector.split(",").map(s => s.trim());
        for (const sel of selectors) {
          const tokens = [];
          rule.walkDecls(d => {
            const cls = mapDeclToBs(d.prop, d.value, mediaResult.breakpoint, rule.selector);
            if (cls) tokens.push(cls);
          });
          if (!tokens.length) continue;
          const bsClasses = Array.from(new Set(tokens)).sort().join(" ");
          // For each class in the selector, append mappings (conservative: use the last class)
          const classTokens = extractClassTokens(sel);
          const target = classTokens[classTokens.length - 1];
          if (!target) continue;

          // Skip Bootstrap component classes
          if (bootstrapComponentClasses.has(target)) continue;

          // Only process if this class actually exists in Blade files
          if (!existingClasses.has(target)) continue;

          // Mark this selector as processed in media query
          processedInMediaQueries.add(sel);

          const prev = classTokenToBs.get(target) || new Set();
          for (const t of bsClasses.split(" ")) prev.add(t);
          classTokenToBs.set(target, prev);
        }
      });
    }
  });

  // Process regular rules, but skip selectors that were already processed in media queries
  root.walkRules(r => {
    const selectors = r.selector.split(",").map(s => s.trim());
    for (const sel of selectors) {
      // Skip if this selector was already processed in a media query
      if (processedInMediaQueries.has(sel)) continue;

      const tokens = [];
      r.walkDecls(d => {
        const cls = mapDeclToBs(d.prop, d.value, null, r.selector);
        if (cls) tokens.push(cls);
      });
      if (!tokens.length) continue;
      const bsClasses = Array.from(new Set(tokens)).sort().join(" ");
      // For each class in the selector, append mappings (conservative: use the last class)
      const classTokens = extractClassTokens(sel);
      const target = classTokens[classTokens.length - 1];
      if (!target) continue;

      // Skip Bootstrap component classes
      if (bootstrapComponentClasses.has(target)) continue;

      // Only process if this class actually exists in Blade files
      if (!existingClasses.has(target)) continue;

      const prev = classTokenToBs.get(target) || new Set();
      for (const t of bsClasses.split(" ")) prev.add(t);
      classTokenToBs.set(target, prev);
    }
  });

  if (classTokenToBs.size === 0) return { updatedFiles: [], map: {}, existingClasses };

  // Collapse sets to strings
  const finalMap = new Map();
  for (const [k, set] of classTokenToBs) finalMap.set(k, Array.from(set).sort().join(" "));

  const updatedFiles = [];
  for (const file of files) {
    const original = fs.readFileSync(file, "utf8");
    let updated = original;
    for (const [classToken, bs] of finalMap) {
      updated = appendBootstrapClassesInClassAttr(updated, classToken, bs);
    }
    if (updated !== original) {
      fs.writeFileSync(file, updated);
      updatedFiles.push(file);
    }
  }

  return { updatedFiles, map: Object.fromEntries(finalMap), existingClasses };
}

export function removeMappedStyles(cssText, existingClasses) {
  const result = postcss().process(cssText, { parser: safeParser });
  const root = result.root;
  let removedDecls = 0;
  let removedRules = 0;

  // Process regular rules
  root.walkRules(r => {
    const selectors = r.selector.split(",").map(s => s.trim());
    // Only operate on rules that contain at least one class selector that exists in Blade files
    const hasRelevantClass = selectors.some(sel => {
      const classTokens = extractClassTokens(sel);
      return classTokens.some(token => existingClasses.has(token) && !bootstrapComponentClasses.has(token));
    });
    if (!hasRelevantClass) return;

    // Remove any declarations that map to Bootstrap utilities
    r.walkDecls(d => {
      // Do not remove text-decoration unless we explicitly appended a Bootstrap replacement.
      // For safety, skip removal of text-decoration here.
      if (String(d.prop).toLowerCase() === 'text-decoration') return;

      const mapped = mapDeclToBs(d.prop, d.value, null, r.selector);
      if (mapped) {
        d.remove();
        removedDecls += 1;
      }
    });

    // If rule is now empty, remove it
    if (r.nodes == null || r.nodes.length === 0) {
      r.remove();
      removedRules += 1;
    }
  });

  // Process media queries
  root.walkAtRules('media', atRule => {
    const mediaQuery = atRule.params;
    const mediaResult = processMediaQuery(mediaQuery, [atRule]);

    if (mediaResult) {
      atRule.walkRules(rule => {
        const selectors = rule.selector.split(",").map(s => s.trim());
        // Only operate on rules that contain at least one class selector that exists in Blade files
        const hasRelevantClass = selectors.some(sel => {
          const classTokens = extractClassTokens(sel);
          return classTokens.some(token => existingClasses.has(token) && !bootstrapComponentClasses.has(token));
        });
        if (!hasRelevantClass) return;

        // Remove any declarations that map to Bootstrap utilities
        rule.walkDecls(d => {
          // Do not remove text-decoration in responsive rules either unless replaced explicitly.
          if (String(d.prop).toLowerCase() === 'text-decoration') return;

          const mapped = mapDeclToBs(d.prop, d.value, mediaResult.breakpoint, rule.selector);
          if (mapped) {
            d.remove();
            removedDecls += 1;
          }
        });

        // If rule is now empty, remove it
        if (rule.nodes == null || rule.nodes.length === 0) {
          rule.remove();
          removedRules += 1;
        }
      });

      // If media query is now empty, remove it
      if (atRule.nodes == null || atRule.nodes.length === 0) {
        atRule.remove();
        removedRules += 1;
      }
    }
  });

  const originalLines = String(cssText).split(/\r?\n/).length;
  const newCss = root.toString();
  const newLines = String(newCss).split(/\r?\n/).length;

  return { css: newCss, removedDecls, removedRules, originalLines, newLines };
}
