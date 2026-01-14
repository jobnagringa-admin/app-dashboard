# CSS Performance Optimization Report

**Project:** JobnaGringa Legacy (Astro Migration) **Date:** 2026-01-14
**Analyst:** Research Agent

---

## Executive Summary

The project currently loads **277KB of CSS** (uncompressed) across three main
files. The largest file, `jobnagringa.webflow.css` at 231KB, contains
significant optimization opportunities including:

- **529 potentially unused CSS classes** (69% of total class definitions)
- **163 lines of e-commerce CSS** that is not used
- **Duplicate rules** across multiple files
- **No CSS minification** in source files
- **Render-blocking CSS loading** without critical CSS extraction

**Estimated potential savings: 150-180KB (55-65%)** after full optimization.

---

## Current CSS File Analysis

### File Sizes (Uncompressed)

| File                      | Size         | Lines      | Purpose                    |
| ------------------------- | ------------ | ---------- | -------------------------- |
| `normalize.css`           | 7.8 KB       | 355        | Browser reset/normalize    |
| `webflow.css`             | 38.5 KB      | 1,796      | Webflow framework core     |
| `jobnagringa.webflow.css` | 231.4 KB     | 11,888     | Custom styles from Webflow |
| **Total**                 | **277.7 KB** | **14,039** |                            |

### After Gzip Compression (Estimated)

| File                      | Uncompressed | Gzipped (est.) |
| ------------------------- | ------------ | -------------- |
| `normalize.css`           | 7.8 KB       | ~2.1 KB        |
| `webflow.css`             | 38.5 KB      | ~8.5 KB        |
| `jobnagringa.webflow.css` | 231.4 KB     | ~32 KB         |
| **Total**                 | **277.7 KB** | **~42.6 KB**   |

---

## Identified Issues

### 1. Unused CSS Classes (HIGH PRIORITY)

**Finding:** 529 out of 765 CSS classes (69%) in `jobnagringa.webflow.css`
appear unused in the current Astro templates.

**Top categories of unused CSS:**

- E-commerce styles (`.w-commerce-*`) - 163 lines, 0 usages found
- Checkout/payment styles - Multiple classes unused
- Legacy page-specific styles - Many from migrated pages
- FlowUI component library variables - Unused CSS variables

**Sample of unused classes:**

```
- account_settings-wrapper
- affiliate-content
- afiliado-list
- billing-address-toggle
- blog_rich-text
- checkout-form
- w-commerce-commerceaddtocartform
- w-commerce-commercecheckout*
(and 520+ more)
```

**Estimated savings:** 120-150KB

### 2. Duplicate Rules Across Files (MEDIUM PRIORITY)

**Finding:** Multiple selectors are defined in both `webflow.css` and
`utilities.css`/`jobnagringa.webflow.css`:

| Selector               | Files with duplicates                               |
| ---------------------- | --------------------------------------------------- |
| `body`                 | normalize.css, webflow.css, global.css              |
| `html`                 | normalize.css, webflow.css, global.css              |
| `.w-layout-grid`       | webflow.css, utilities.css, jobnagringa.webflow.css |
| `.w-pagination-*`      | webflow.css, utilities.css, jobnagringa.webflow.css |
| `.w-dyn-*`             | webflow.css, utilities.css                          |
| `.w-col-*` grid system | webflow.css, utilities.css                          |
| `.w-container`         | webflow.css, utilities.css                          |

**Estimated savings:** 15-25KB

### 3. Unminified CSS (MEDIUM PRIORITY)

**Finding:** All CSS files are unminified with comments and formatting.

**Current characteristics:**

- Contains extensive whitespace
- Includes source comments
- No shorthand optimization
- No selector optimization

**Estimated savings with minification:** 20-30% reduction (~55KB)

### 4. Render-Blocking CSS (MEDIUM PRIORITY)

**Finding:** All CSS is loaded synchronously in the `<head>`:

```html
<link href="/css/normalize.css" rel="stylesheet" type="text/css" />
<link href="/css/webflow.css" rel="stylesheet" type="text/css" />
<link href="/css/jobnagringa.webflow.css" rel="stylesheet" type="text/css" />
```

**Impact:** Delays First Contentful Paint (FCP) and Largest Contentful Paint
(LCP).

### 5. Redundant CSS Variables (LOW PRIORITY)

**Finding:** The `:root` block contains many Webflow-generated variables with
`<deleted|variable-*>` suffixes that appear to be legacy/unused:

```css
--flowui-component-library-gray-200\<deleted\|variable-7bab5fb1\>: #e6eeff;
--ghost-white-3\<deleted\|variable-96b1d264\>: #e6eeff;
--light_border\<deleted\|variable-ce76c3d5\>: #bfc2ff;
```

**Estimated savings:** 2-3KB

### 6. Media Query Duplication (LOW PRIORITY)

**Finding:** Media query breakpoints are repeated across multiple sections:

```css
@media screen and (max-width: 991px) { ... } /* appears 3x */
@media screen and (max-width: 767px) { ... } /* appears 3x */
@media screen and (max-width: 479px) { ... } /* appears 3x */
```

Consolidating these could improve parsing performance and reduce file size.

---

## Recommendations

### Priority 1: Remove Unused E-commerce CSS (Quick Win)

**Action:** Remove all `.w-commerce-*` selectors if e-commerce is not used.

**Impact:**

- Remove ~163 lines
- Save ~8-10KB
- Zero risk if e-commerce features are not used

**How to verify:** Search templates for `w-commerce-`:

```bash
grep -r 'w-commerce-' src/ --include="*.astro"
# Result: 0 matches
```

### Priority 2: Enable CSS Minification in Build

**Action:** Configure Astro to minify CSS in production builds.

**astro.config.mjs:**

```javascript
export default defineConfig({
  vite: {
    build: {
      cssMinify: 'lightningcss', // or 'esbuild'
    },
  },
});
```

**Impact:** 20-30% size reduction with zero code changes.

### Priority 3: Extract Critical CSS

**Action:** Inline critical above-the-fold CSS and defer the rest.

**Implementation options:**

1. Use `@astrojs/partytown` for non-critical CSS
2. Use `critters` for automatic critical CSS extraction
3. Manually extract critical CSS for key pages

**Target critical CSS (~15KB max):**

- CSS variables
- Body/HTML base styles
- Navigation styles
- Hero section styles

### Priority 4: CSS Code Splitting

**Action:** Split CSS by route/component.

**Approach:**

```
/styles
  /critical.css      # Inline in <head> (~15KB)
  /webflow-core.css  # Defer load (~20KB)
  /components/       # Load per component
```

### Priority 5: PurgeCSS Integration

**Action:** Use PurgeCSS to automatically remove unused CSS.

**postcss.config.cjs:**

```javascript
module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: ['./src/**/*.astro', './src/**/*.html'],
      safelist: [
        /^w-/, // Webflow classes
        /^fs-/, // Finsweet classes
        /^is-/, // State classes
        'w-richtext', // Dynamic content
        /--active$/, // Active states
      ],
    }),
  ],
};
```

**Impact:** Could remove 150KB+ of unused CSS automatically.

### Priority 6: Consider Modern CSS Reset

**Action:** Replace `normalize.css` with a lighter alternative.

**Options:**

- [modern-normalize](https://github.com/sindresorhus/modern-normalize) (~1KB vs
  7.8KB)
- CSS Reset built into Tailwind/other frameworks
- Custom minimal reset

---

## Implementation Roadmap

### Phase 1: Quick Wins (Week 1)

- [x] Audit complete
- [ ] Enable CSS minification in Astro config
- [ ] Remove e-commerce CSS if unused
- [ ] Add preconnect hints (already done)

### Phase 2: Build Pipeline (Week 2-3)

- [ ] Integrate PurgeCSS
- [ ] Set up CSS code splitting
- [ ] Extract critical CSS for homepage

### Phase 3: Refactoring (Week 4+)

- [ ] Consolidate duplicate rules
- [ ] Remove unused CSS variables
- [ ] Migrate from `normalize.css` to modern reset
- [ ] Convert Webflow classes to BEM/utility classes

---

## Testing Checklist

Before implementing CSS changes, verify:

- [ ] Homepage renders correctly
- [ ] Navigation works on all viewports
- [ ] Forms display properly
- [ ] Blog posts render rich text correctly
- [ ] Job listings display properly
- [ ] Authentication flows work
- [ ] No console CSS errors

---

## Lighthouse Impact Estimate

| Metric         | Current (est.) | After Optimization (est.) |
| -------------- | -------------- | ------------------------- |
| Total CSS Size | 277KB          | ~80-100KB                 |
| Gzipped Size   | ~43KB          | ~15-20KB                  |
| FCP Impact     | +200-400ms     | -100-200ms                |
| LCP Impact     | +100-200ms     | -50-100ms                 |

---

## Appendix: Class Usage Analysis

### Most Frequently Defined Classes (Potential Optimization)

Classes defined multiple times (indicating responsive variants or states):

| Class                  | Definitions | Notes                                    |
| ---------------------- | ----------- | ---------------------------------------- |
| `.button`              | 31          | Multiple variants, states, media queries |
| `.input_field`         | 15          | Form styling across breakpoints          |
| `.sidebar-cta-primary` | 14          | Sidebar component                        |
| `.lesson-card_row`     | 10          | Course content cards                     |
| `.blog_rich-text`      | 10          | Blog content styling                     |
| `.badge_wrapper`       | 10          | Badge component                          |

### CSS Architecture Notes

The current CSS follows Webflow's export structure:

1. CSS Variables (`:root`) - Design tokens
2. Component classes - BEM-ish naming
3. Responsive overrides - Mobile-first approach
4. Utility classes - `.is-*` state modifiers

This structure is suitable for PurgeCSS as class names are predictable.

---

## References

- [Astro CSS Handling](https://docs.astro.build/en/guides/styling/)
- [PurgeCSS Documentation](https://purgecss.com/)
- [Web.dev CSS Best Practices](https://web.dev/learn/css/)
- [Critical CSS Tools](https://github.com/addyosmani/critical)
