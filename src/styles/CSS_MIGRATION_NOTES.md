# CSS Migration Notes - JobnaGringa

## Migration Date: 2026-01-14

## Overview

This document describes the CSS architecture extracted from the legacy Webflow
project and the migration approach for Astro.

## Original CSS Files

| File                      | Lines      | Size        | Purpose                          |
| ------------------------- | ---------- | ----------- | -------------------------------- |
| `normalize.css`           | 355        | 7.7 KB      | CSS reset (normalize.css v3.0.3) |
| `webflow.css`             | 1,790      | 38.5 KB     | Webflow framework styles         |
| `jobnagringa.webflow.css` | 11,632     | 230 KB      | Custom project styles            |
| **Total**                 | **13,777** | **~276 KB** |                                  |

## CSS Architecture Analysis

### 1. CSS Custom Properties (Design Tokens)

The project uses a comprehensive set of CSS variables in `:root`:

**Color System:**

- Blues palette: `--blues--blue-05` through `--blues--blue-90`
- Neutrals palette: `--neutrals--neutral-100-white` through
  `--neutrals--neutral-800`
- Brand colors: `--brand--primary` (references `--blues--blue-60`)
- Background colors: `--backgrounds--light-secondary`,
  `--backgrounds--dark-blue`, `--backgrounds--dark-modal`
- Border colors: `--borders--border-light`, `--borders--border-regular`,
  `--borders--border-primary`

**Spacing/Sizing:**

- Border radius scale: `--border-radius--radius-small` (0.5rem) through
  `--border-radius--radius-huge` (3rem)

**Typography:**

- Heading font: Anton
- Body font: Inter, sans-serif
- Button font: Anton

**Dark Mode Support:**

- Full dark mode token set with `-dark` suffix variants

### 2. Component Categories

**Navigation:**

- `.navbar--blue--primary` - Fixed blue header
- `.navbar_*` - Navigation subcomponents
- `.w-nav-*` - Webflow navigation classes

**Buttons:**

- `.w-button` - Webflow base button
- `.button` - Custom primary button
- `.button-ghost` - Outline button
- `.button-icon` - Icon-only button
- E-commerce buttons (`.w-commerce-*`)

**Forms:**

- `.w-input`, `.w-select` - Webflow form elements
- `.input_field` - Custom input styling
- `.w-checkbox`, `.w-radio` - Form controls
- `.job-search_select` - Job search filters

**Cards:**

- `.card` - Base card component
- `.dashboard-card*` - Dashboard card variants
- `.lesson-card*` - Course lesson cards
- `.job-card*` - Job listing cards
- `.user-card*` - User profile cards

**Layout:**

- `.w-container`, `.w-row`, `.w-col-*` - Webflow grid system
- `.w-layout-grid` - CSS Grid layout
- `.dashboard_*` - Dashboard layout components

**Footer:**

- `.footer_section` - Footer container
- `.footer_*` - Footer subcomponents

### 3. Webflow-Specific Classes (Require Special Handling)

**Dynamic Content:**

- `.w-dyn-*` - Dynamic list/collection classes
- `.w-condition-invisible` - Conditional visibility

**Interactions:**

- `.w--current` - Current page/state indicator
- `.w--open` - Open state for dropdowns/modals
- `.w--redirected-*` - Form redirect states

**Commerce:**

- `.w-commerce-*` - E-commerce component styles (checkout, cart, etc.)

**Lightbox:**

- `.w-lightbox-*` - Image lightbox styles

**Slider:**

- `.w-slider-*` - Slider/carousel styles

### 4. Inline Styles Found

249 `<style>` tags were found across 64 HTML files. Common inline styles
include:

- Custom scrollbar styling
- Form validation states (`.error`, `.success`, `.hide`)
- Select dropdown arrow customization
- Acronym display styling

### 5. Responsive Breakpoints

| Breakpoint       | Max Width | Description         |
| ---------------- | --------- | ------------------- |
| Desktop          | -         | Default styles      |
| Tablet           | 991px     | Medium screens      |
| Mobile Landscape | 767px     | Small screens       |
| Mobile Portrait  | 479px     | Extra small screens |

## New CSS Structure

```
src/styles/
├── index.css              # Main entry point
├── global.css             # Design tokens, resets, base styles
├── utilities.css          # Utility classes, grid system
├── webflow/               # Original Webflow CSS (preserved)
│   ├── normalize.css
│   ├── webflow.css
│   └── jobnagringa.webflow.css
└── components/            # Modular component styles
    ├── navbar.css
    ├── buttons.css
    ├── forms.css
    ├── cards.css
    └── footer.css
```

## Migration Strategy

### Phase 1: Visual Parity (Current)

- Use original Webflow CSS files unchanged
- Ensures 100% visual compatibility
- No risk of breaking existing designs

### Phase 2: Gradual Modularization

1. Test modular CSS against original
2. Replace imports one at a time
3. Verify each component visually
4. Remove deprecated Webflow-specific styles

### Phase 3: Tailwind Integration (Optional)

Many Webflow utility patterns map to Tailwind:

- `.w-col-*` -> Tailwind grid classes
- `.w-hidden-*` -> Tailwind responsive hidden
- Spacing/sizing via CSS variables -> Tailwind config

## Tailwind Compatibility Assessment

**Good candidates for Tailwind:**

- Grid/column system (`.w-col-*`)
- Display utilities (`.w-hidden`, `.w-block`)
- Spacing patterns

**Keep as custom CSS:**

- Complex component styles
- Webflow-specific interaction states
- E-commerce components
- Animation/transition styles

## Font Dependencies

External fonts loaded via Google Fonts:

- Inter (weights: 100-900, normal & italic)

Webflow icon font:

- `webflow-icons` (embedded base64 in webflow.css)

## Recommendations

1. **Keep original CSS initially** - Use `src/styles/webflow/` files for Phase 1
2. **Test thoroughly** - Before switching to modular CSS
3. **Document exceptions** - Note any components that need Webflow classes
4. **Consider Tailwind** - For new components, use Tailwind utilities
5. **Preserve CSS variables** - The design token system is well-structured

---

## CSS Optimization Results (2026-01-14)

### Optimizations Implemented

1. **PurgeCSS Integration**
   - Configured in `postcss.config.mjs`
   - Removes unused CSS classes during production build
   - Preserves all Webflow patterns via safelist (^w-, ^fs-, ^is-, ^has-, etc.)

2. **CSS Minification (cssnano)**
   - Minifies output CSS
   - Preserves CSS variables and @font-face rules
   - Removes duplicate rules and optimizes selectors

3. **Critical CSS Extraction**
   - Created `src/styles/critical/base.css` with above-the-fold styles
   - Inlined in HTML head via Astro's raw import
   - Includes: CSS variables, base reset, navigation, hero, buttons, containers

4. **CSS Code Splitting (Vite)**
   - Enabled via `cssCodeSplit: true` in astro.config.mjs
   - Webflow styles bundled into `webflow` chunk
   - Component styles bundled into `components` chunk

### Size Reduction Results

| Metric           | Before       | After         | Savings      |
|------------------|--------------|---------------|--------------|
| Total CSS Source | 297,930 bytes| -             | -            |
| Built CSS Output | -            | 138,797 bytes | 159,133 bytes|
| Reduction        | -            | -             | **53.4%**    |

### Configuration Files

- `postcss.config.mjs` - PurgeCSS + cssnano configuration
- `astro.config.mjs` - Vite CSS code splitting settings
- `src/styles/critical/base.css` - Critical above-the-fold CSS
- `src/styles/index.css` - Main CSS entry point (processed by PostCSS)

### How CSS is Loaded

1. **Critical CSS** - Inlined in `<head>` via `Head.astro` component
2. **Main CSS** - Imported in `BaseLayout.astro` via `import '../styles/index.css'`
3. **PostCSS** - Processes imports, runs PurgeCSS, minifies with cssnano
4. **Output** - Single bundled CSS file at `/_assets/css/[name]-[hash].css`

### Safelist Patterns (Classes Preserved)

```javascript
// Regex patterns that are never removed:
/^w-/        // All Webflow utility classes
/^fs-/       // Finsweet attributes
/^is-/       // Animation/state classes
/^has-/      // Has-state classes
/^cl-/       // Clerk auth classes
/^hide-/     // Visibility utilities
/^show-/     // Visibility utilities
```

### Notes

- The `public/styles/` folder contains raw CSS that gets copied to dist without processing
- The processed CSS is in `dist/client/_assets/css/`
- Pages reference the processed CSS from _assets, not public/styles
- Additional optimization possible by tightening safelist rules (test carefully)
