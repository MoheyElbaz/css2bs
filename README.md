# CSS2BS - Convert CSS to Bootstrap 5 Utilities

A powerful CLI tool that automatically converts CSS spacing and line-height properties to Bootstrap 5 utility classes and updates your Blade templates accordingly.

## 🚀 Features

- **Smart CSS Analysis**: Scans CSS files for margin, padding, and line-height properties
- **Bootstrap 5 Mapping**: Converts CSS values to equivalent Bootstrap utility classes
- **Blade Template Updates**: Automatically appends Bootstrap classes to existing class attributes
- **CSS Cleanup**: Removes redundant CSS rules after conversion
- **Conflict Prevention**: Avoids modifying Bootstrap component classes
- **Scoped Processing**: Only processes CSS selectors that match classes found in your Blade files

## 📦 Installation

```bash
npm install -g @local/css2bs
```

Or use locally in your project:

```bash
npm install @local/css2bs
npx css2bs <cssFile> <bladeDir>
```

## 🎯 Usage

### Basic Usage

```bash
css2bs path/to/styles.css path/to/resources/views
```

### What it does

1. **Scans Blade files** to find existing class tokens
2. **Analyzes CSS file** for spacing and line-height properties
3. **Maps CSS to Bootstrap utilities** using Bootstrap 5 spacing scale
4. **Updates Blade templates** by appending Bootstrap classes
5. **Cleans CSS file** by removing converted rules

### Example

**Before:**
```css
.hero-subtitle {
    margin: 0 auto 1rem;
    line-height: 1.5;
}
```

```html
<p class="hero-subtitle">Welcome to our site</p>
```

**After:**
```css
/* Rule removed from CSS */
```

```html
<p class="hero-subtitle mb-0 me-auto ms-auto mt-0 lh-base">Welcome to our site</p>
```

## 🎨 Supported CSS Properties

### Spacing Properties
- `margin` (all sides)
- `margin-top`, `margin-bottom`, `margin-left`, `margin-right`
- `margin-inline-start`, `margin-inline-end`
- `padding` (all sides)
- `padding-top`, `padding-bottom`, `padding-left`, `padding-right`
- `padding-inline-start`, `padding-inline-end`

### Line Height
- `line-height`

### Units Supported
- `px` (converted to rem using 16px base)
- `rem`
- `em` (treated as rem)
- `auto` (for margins)

## 🔧 Bootstrap 5 Mapping

The tool maps CSS values to Bootstrap 5 spacing scale:

| CSS Value | Bootstrap Class | Rem Equivalent |
|-----------|----------------|----------------|
| `0` | `m-0`, `p-0` | 0 |
| `0.25rem` | `m-1`, `p-1` | 0.25rem |
| `0.5rem` | `m-2`, `p-2` | 0.5rem |
| `1rem` | `m-3`, `p-3` | 1rem |
| `1.5rem` | `m-4`, `p-4` | 1.5rem |
| `3rem` | `m-5`, `p-5` | 3rem |

### Line Height Mapping

| CSS Value | Bootstrap Class |
|-----------|----------------|
| `1` | `lh-1` |
| `1.25` | `lh-sm` |
| `1.5` | `lh-base` |
| `2` | `lh-lg` |

## 🛡️ Safety Features

### Bootstrap Component Protection
The tool automatically skips Bootstrap component classes to prevent conflicts:

```html
<!-- These classes are protected from modification -->
<button class="btn btn-primary dropdown-toggle">Click me</button>
<div class="navbar-nav">
<ul class="dropdown-menu">
```

### Conflict Prevention
- Avoids duplicating existing Bootstrap classes
- Only appends new utility classes
- Preserves existing class structure

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

Updated files: 8
 • /path/to/about.blade.php
 • /path/to/contact.blade.php
 • /path/to/layout/footer.blade.php
 • /path/to/layout/landing.blade.php
 • /path/to/layout/master.blade.php
 • /path/to/privacy.blade.php
 • /path/to/refund.blade.php
 • /path/to/services.blade.php

Class mappings:
  hero-subtitle => mb-0 me-auto ms-auto mt-0 lh-base
  section-title => mb-2
  contact-card-icon => mb-0 me-auto ms-auto mt-0
  footer-links => mb-0 mb-2 me-0 ms-0 mt-0 pb-0 pe-0 ps-0 ps-2 pt-0

Removed declarations: 61, removed empty rules: 20
CSS lines reduced: -122 (2165 -> 2043)
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

## 🚫 Limitations

- Only processes spacing and line-height properties
- Requires existing class tokens in Blade files
- Skips Bootstrap component classes
- Does not handle complex CSS selectors with combinators

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the UNLICENSED license.

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/css2bs/issues) page
2. Create a new issue with detailed information
3. Include your CSS and Blade file examples

## 🔄 Version History

- **v0.1.0**: Initial release with basic CSS to Bootstrap conversion
- Support for margin, padding, and line-height properties
- Blade template integration
- CSS cleanup functionality

---

**Made with ❤️ for Laravel developers who love Bootstrap 5**
