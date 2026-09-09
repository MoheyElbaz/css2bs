# CSS2BS - Convert CSS to Bootstrap 5.3 Utilities

[![npm version](https://badge.fury.io/js/css2bs.svg)](https://badge.fury.io/js/css2bs)
[![Downloads](https://img.shields.io/npm/dt/css2bs.svg)](https://www.npmjs.com/package/css2bs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive CLI tool that automatically converts CSS properties to Bootstrap 5.3 utility classes and updates your Blade templates accordingly. Convert margin, padding, typography, positioning, flexbox, colors, and more!

## 🚀 Features

- **Comprehensive CSS Support**: Converts 100+ CSS properties to Bootstrap 5.3 utilities
- **Smart Conservative Removal**: Preserves layout-critical properties while removing mappable ones
- **Bootstrap 5.3 Responsive Support**: Full responsive breakpoint support (sm, md, lg, xl, xxl)
- **Typography System**: Complete font-size, weight, style, alignment, and decoration mapping
- **Layout & Positioning**: Position, flexbox, gap, display, and alignment utilities
- **Sizing & Spacing**: Width, height, margin, padding with rem/px/percentage support
- **Visual Properties**: Colors, backgrounds, borders, shadows, and opacity
- **Interactive Elements**: Cursor, pointer-events, and user-select utilities
- **Blade Template Updates**: Automatically appends Bootstrap classes to existing elements
- **Intelligent CSS Cleanup**: Removes only safely convertible CSS while preserving critical layout
- **Component Protection**: Never modifies Bootstrap component classes
- **Conflict Resolution**: Smart deduplication and class optimization

## 📦 Installation

css2bs is a **development tool** — a one-off codemod you run against a project, not
something your application imports. Nothing it installs belongs in a production bundle.

Most of the time you do not need to install it at all:

```bash
npx css2bs <cssFile> <bladeDir>
```

If you will run it repeatedly on the same project, add it as a **dev dependency** so it
stays out of `dependencies`:

```bash
npm install --save-dev css2bs
```

Or install it globally if you use it across several projects:

```bash
npm install -g css2bs
```

## 🎯 Usage

### Basic Usage

```bash
css2bs path/to/styles.css path/to/resources/views
```

Run without a flag in a terminal and it shows what would change, then asks:

```
  3 Blade files and 1 CSS file would change.

    1  Preview only — show the changes, write nothing
    2  Create a git branch, then apply
    3  Apply to the working tree

  Choose [1]:
```

Or pick the mode up front:

| flag | what it does |
| --- | --- |
| `--dry-run` | print the changes, write nothing |
| `--branch` | create a `css2bs/<timestamp>` branch, then apply there |
| `--write` | apply to the working tree |

With no flag and no terminal — a pipe, or CI — it previews and exits. A script that
did not ask for file edits does not get them.

### What it does

1. **Scans Blade files** to find existing class tokens
2. **Analyzes CSS file** for spacing and line-height properties
3. **Maps CSS to Bootstrap utilities** using Bootstrap 5 spacing scale
4. **Updates Blade templates** by appending Bootstrap classes
5. **Cleans CSS file** by removing converted rules

Steps 4 and 5 edit your files in place. That is the point of the tool, but it is why
preview is the default and why `--branch` exists.

### Example Transformation

**Before:**
```css
.hero-section {
    position: relative;
    display: flex;
    justify-content: center;  
    align-items: center;
    margin: 2rem auto;
    padding: 1.5rem;
    font-size: 1.25rem;
    font-weight: 600;
    text-align: center;
    text-decoration: underline;
    background-color: #f8f9fa;
    border-radius: 0.5rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    z-index: 10;
}

@media (min-width: 768px) {
    .hero-section {
        font-size: 2rem;
        padding: 3rem;
        text-align: left;
    }
}
```

```html
<div class="hero-section">Welcome to our site</div>
```

**After:**
```css
.hero-section {
    position: relative;  /* Preserved - layout critical */
    z-index: 10;        /* Preserved - no Bootstrap equivalent */
}
```

```html
<div class="hero-section position-relative bg-light rounded-3 shadow-sm d-flex justify-content-center align-items-center mx-auto my-4 p-4 fs-3 fw-semibold text-center text-decoration-underline md-fs-1 md-p-5 md-text-start">Welcome to our site</div>
```

## 🎨 Supported CSS Properties

### 📏 Spacing & Sizing
- **Margin**: `margin`, `margin-top/right/bottom/left`, shorthand support
- **Padding**: `padding`, `padding-top/right/bottom/left`, shorthand support  
- **Width/Height**: `width`, `height`, `max-width`, `min-height` (percentages & viewport units)
- **Gap**: `gap`, `row-gap`, `column-gap` (flexbox & grid)

### 🎯 Typography & Text
- **Font Properties**: `font-size` → `fs-*`/`display-*`, `font-weight` → `fw-*`, `font-style` → `fst-*`, `font-family` → `font-monospace`
- **Text Alignment**: `text-align` → `text-start/center/end` (responsive support)
- **Text Decoration**: `text-decoration` → `text-decoration-underline/line-through/none`
- **Text Transform**: `text-transform` → `text-uppercase/lowercase/capitalize`
- **Line Height**: `line-height` → `lh-1/sm/base/lg`
- **Word Wrapping**: `white-space` → `text-wrap/nowrap`, `word-wrap`/`word-break` → `text-break`

### 📐 Layout & Positioning
- **Position**: `position` → `position-static/relative/absolute/fixed/sticky`
- **Coordinates**: `top/right/bottom/left` → `top-*/end-*/bottom-*/start-*` (0, 50%, 100%)
- **Transform**: `transform` → `translate-middle/translate-middle-x/translate-middle-y`
- **Display**: `display` → `d-block/inline/flex/grid/none` etc.
- **Flexbox**: `flex-direction/wrap/grow/shrink`, `justify-content`, `align-items/content/self`
- **Overflow**: `overflow` → `overflow-auto/hidden/scroll/visible`

### 🎨 Visual Properties
- **Colors**: `color`, `background-color` → Bootstrap color utilities (when exact matches)
- **Borders**: `border`, `border-width/style/color`, individual sides, `border-radius`
- **Shadows**: `box-shadow` → `shadow-sm/lg/none` (common Bootstrap shadows)
- **Opacity**: `opacity` → `opacity-25/50/75/100`
- **Z-Index**: `z-index` → `z-n1/0/1/2/3` (Bootstrap 5.3 values)

### 🖱️ Interactive & Behavior
- **Cursor**: `cursor` → `cursor-pointer`
- **Pointer Events**: `pointer-events` → `pe-none/auto`
- **User Select**: `user-select` → `user-select-all/auto/none`
- **Object Fit**: `object-fit` → `object-fit-contain/cover/fill/scale/none`
- **Vertical Align**: `vertical-align` → `align-top/middle/bottom/baseline/text-top`

### 📱 Responsive Support
All supported utilities work with Bootstrap's responsive breakpoints:
- `@media (min-width: 576px)` → `sm-*` classes
- `@media (min-width: 768px)` → `md-*` classes  
- `@media (min-width: 992px)` → `lg-*` classes
- `@media (min-width: 1200px)` → `xl-*` classes
- `@media (min-width: 1400px)` → `xxl-*` classes

### 📐 Units Supported
- **Length**: `px` (16px base), `rem`, `em`, `vh`, `vw`
- **Percentage**: `%` for widths, heights, positions
- **Keywords**: `auto`, `none`, `inherit`, `initial`
- **Flex Values**: Numeric flex-grow/shrink values

## 🔧 Bootstrap 5.3 Mapping

The tool maps CSS values to Bootstrap 5.3 spacing scale:

### Base Spacing Scale

| CSS Value | Bootstrap Class | Rem Equivalent |
|-----------|----------------|----------------|
| `0` | `m-0`, `p-0` | 0 |
| `0.25rem` | `m-1`, `p-1` | 0.25rem |
| `0.5rem` | `m-2`, `p-2` | 0.5rem |
| `1rem` | `m-3`, `p-3` | 1rem |
| `1.5rem` | `m-4`, `p-4` | 1.5rem |
| `3rem` | `m-5`, `p-5` | 3rem |

### Responsive Breakpoints

| Media Query | Bootstrap Breakpoint | Class Prefix |
|-------------|---------------------|--------------|
| `@media (min-width: 576px)` | `sm` | `sm-*` |
| `@media (min-width: 768px)` | `md` | `md-*` |
| `@media (min-width: 992px)` | `lg` | `lg-*` |
| `@media (min-width: 1200px)` | `xl` | `xl-*` |
| `@media (min-width: 1400px)` | `xxl` | `xxl-*` |

### Font Size Mapping

| CSS Value | Bootstrap Class | Rem Equivalent |
|-----------|----------------|----------------|
| `0.875rem` or smaller | `fs-6` | 14px |
| `1rem` | `fs-5` | 16px |
| `1.125rem` | `fs-4` | 18px |
| `1.25rem` | `fs-3` | 20px |
| `1.5rem` | `fs-2` | 24px |
| `2rem` | `fs-1` | 32px |

### Display Utilities (Large Font Sizes)

| CSS Value | Bootstrap Class | Rem Equivalent |
|-----------|----------------|----------------|
| `2.5rem+` | `display-1` | 40px+ |
| `2rem+` | `display-2` | 32px+ |
| `1.75rem+` | `display-3` | 28px+ |
| `1.5rem+` | `display-4` | 24px+ |
| `1.25rem+` | `display-5` | 20px+ |
| `1.125rem+` | `display-6` | 18px+ |

### Line Height Mapping

| CSS Value | Bootstrap Class |
|-----------|----------------|
| `1` | `lh-1` |
| `1.25` | `lh-sm` |
| `1.5` | `lh-base` |
| `2` | `lh-lg` |

### Font Weight Mapping

| CSS Value | Bootstrap Class |
|-----------|----------------|
| `100-300` | `fw-lighter` |
| `400-500` | `fw-normal` |
| `600-800` | `fw-bold` |
| `900` | `fw-bolder` |

## 🛡️ Safety

### Your own classes are never removed

Bootstrap's `fs-*` and `display-*` utilities are matched with anchored patterns, so a
class of your own that merely contains one of those fragments — `user-prefs-panel`,
`sidebar-display-toggle` — is left alone. Class order is preserved and generated
utilities are appended at the end, so diffs stay readable.

### Nothing is written until you choose

Preview is the default. `--branch` puts the edits on a fresh git branch and refuses if
the working tree is dirty, so `git checkout -` undoes everything.

### Conservative CSS Removal
The tool uses intelligent logic to preserve layout-critical properties:

```css
.complex-component {
    /* PRESERVED - Layout critical */
    position: absolute;
    z-index: 999;
    transform: rotate(45deg);
    
    /* CONVERTED - Have Bootstrap equivalents */
    display: flex;          → d-flex
    margin: 1rem;          → m-3  
    padding: 0.5rem;       → p-2
    font-weight: 600;      → fw-semibold
    text-align: center;    → text-center
}
```

### Bootstrap Component Protection
Automatically skips Bootstrap component classes to prevent conflicts:

```html
<!-- These classes are NEVER modified -->
<button class="btn btn-primary dropdown-toggle">Click me</button>
<div class="navbar navbar-expand-lg">Navigation</div>
<ul class="dropdown-menu">Menu items</ul>
```

### Smart Class Management
- **Deduplication**: Removes duplicate utility classes
- **Conflict Resolution**: Handles conflicting font-size vs display classes  
- **Responsive Optimization**: Properly orders responsive breakpoints
- **Existing Class Preservation**: Never removes user's original classes

## 📁 File Structure

```
css2bs/
├── bin/
│   └── cli.js          # CLI entry point
├── src/
│   ├── index.js        # Main processing logic
│   └── mappers.js      # CSS to Bootstrap mapping
├── package.json
└── README.md
```

## 🔍 How It Works

1. **Class Discovery**: Scans all Blade files to extract existing class tokens
2. **CSS Analysis**: Parses CSS file using PostCSS to find spacing properties
3. **Mapping**: Converts CSS values to Bootstrap utility classes
4. **Template Updates**: Appends Bootstrap classes to matching elements
5. **CSS Cleanup**: Removes converted CSS rules and empty selectors

## 📊 Output Example

```bash
$ css2bs public/css/main.css resources/views

Updated files: 12
 • /resources/views/about.blade.php
 • /resources/views/contact.blade.php  
 • /resources/views/home.blade.php
 • /resources/views/services.blade.php
 • /resources/views/layout/header.blade.php
 • /resources/views/layout/footer.blade.php
 • /resources/views/layout/master.blade.php
 • /resources/views/components/hero.blade.php
 • /resources/views/components/card.blade.php

Class mappings:
  hero-section => bg-light d-flex justify-content-center align-items-center mx-auto my-4 p-4 fs-3 fw-semibold text-center text-decoration-underline position-relative rounded-3 shadow-sm md-fs-1 md-p-5 md-text-start
  card-component => bg-white border border-1 d-block mx-3 p-3 rounded-2 shadow-sm
  navigation-item => d-inline-block fw-medium me-3 text-decoration-none
  footer-links => d-flex flex-column gap-2 list-unstyled m-0 p-0
  section-title => fs-2 fw-bold mb-4 text-center lg-fs-1 lg-text-start
  
Removed declarations: 127, removed empty rules: 38
CSS lines reduced: -412 (2166 -> 1754)

🎉 Successfully converted 67 CSS properties to 89 Bootstrap utility classes!
   💾 Reduced CSS file size by 19%
   🚀 Enhanced responsive design with breakpoint utilities
   🛡️ Preserved 23 layout-critical properties
```

## ⚙️ Configuration

### Supported File Types
- `.blade.php` files
- `.php` files  
- `.blade.html` files

### CSS Selector Support
- Simple class selectors: `.my-class`
- Multiple classes: `.class1.class2`
- Pseudo-selectors: `.class:hover` (pseudo part ignored)
- Descendant selectors: `.parent .child`

## ⚠️ Intelligent Limitations

### What Gets Converted
✅ **100+ CSS properties** with direct Bootstrap 5.3 utility equivalents  
✅ **Responsive breakpoints** for all supported utilities  
✅ **Standard CSS values** that map to Bootstrap's design system  
✅ **Class selectors** found in your Blade templates

### What Gets Preserved  
🛡️ **Layout-critical properties**: `position`, `z-index`, `transform` (complex), `animation`  
🛡️ **Custom values**: Pixel widths, custom colors, complex gradients  
🛡️ **Bootstrap components**: `.btn`, `.navbar`, `.dropdown-*` etc.  
🛡️ **Complex selectors**: Pseudo-elements (`::before`), attribute selectors  
🛡️ **CSS not in templates**: Only processes classes that exist in Blade files

### Current Limitations
- **Text-align responsive**: Minor issue with media query breakpoint mapping  
- **Custom CSS properties**: `var(--custom)` values are preserved as-is
- **Advanced selectors**: Complex combinators (`>`, `+`, `~`) processed conservatively
- **Vendor prefixes**: `-webkit-`, `-moz-` properties are not converted

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/MoheyElbaz/css2bs/issues) page
2. Create a new issue with detailed information
3. Include your CSS and Blade file examples

## 🔄 Version History

### **v0.1.0** - Complete Bootstrap 5.3 Utility System  
🎉 **Initial Release**: Comprehensive CSS-to-Bootstrap conversion tool

**🚀 New Features:**
- **100+ CSS Properties**: Complete coverage of Bootstrap 5.3 utility system
- **Layout & Positioning**: Position, flexbox, gap, display, alignment utilities  
- **Visual Properties**: Colors, borders, shadows, opacity, z-index mapping
- **Interactive Elements**: Cursor, pointer-events, user-select, object-fit
- **Conservative CSS Removal**: Intelligent preservation of layout-critical properties
- **Enhanced Typography**: Font-family, word-wrapping, vertical-align support

**🛡️ Safety Improvements:**
- Smart layout-critical property detection (`position`, `z-index`, `transform`)
- Advanced conflict resolution and class deduplication
- Enhanced Bootstrap component protection
- Conservative approach: only removes CSS when safe

**🔧 Technical Enhancements:**
- Improved media query processing for responsive utilities
- Better CSS parser error handling
- Enhanced class instance tracking for safer removal
- Optimized memory usage for large projects

**🔮 Future Releases:**
- **v0.2.0** - Enhanced responsive breakpoint handling
- **v0.3.0** - Additional CSS property support  
- **v1.0.0** - Stable API with comprehensive testing

## 🎯 Perfect For

- **Laravel Projects**: Seamless Blade template integration
- **Bootstrap 5.3 Migration**: Convert existing CSS to modern utility-first approach  
- **Design System Cleanup**: Reduce custom CSS while maintaining design integrity
- **Performance Optimization**: Smaller CSS files, better caching with utility classes
- **Team Consistency**: Standardize on Bootstrap's proven design system
- **Responsive Enhancement**: Automatic responsive breakpoint conversion

## 🚀 Getting Started

1. **Install the tool**: `npm install -g css2bs`
2. **Backup your files**: Always backup CSS and templates before conversion
3. **Run conversion**: `css2bs path/to/styles.css path/to/views`
4. **Review changes**: Check the output and test your application
5. **Iterate**: Re-run on updated CSS as your project evolves

---

**🎨 Made with ❤️ for Laravel developers who love Bootstrap 5.3 utilities**

*Transform your CSS into maintainable, responsive, utility-first classes!*
