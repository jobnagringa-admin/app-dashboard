# Astro Performance Optimization & Code Organization - Task Report

**Generated:** 2026-01-14  
**Epic ID:** `legacy-a10`  
**Status:** All tasks created and ready for implementation

---

## Epic Overview

**EPIC: Astro Performance Optimization & Code Organization** (`legacy-a10`)

**Priority:** P1 (High)  
**Status:** Open

**Description:** Apply Astro best practices for extreme performance optimization
while maintaining pixel-perfect visual parity with the original layout. This
epic focuses on code organization, performance optimization, visual regression
testing, and comprehensive monitoring.

**Key Requirements:**

- ✅ ABSOLUTE PERFECTION in layout preservation - no visual changes allowed
- ✅ Apply all Astro best practices for performance
- ✅ Break code into small, reusable components
- ✅ Implement visual regression testing
- ✅ Optimize CSS, images, and asset loading
- ✅ Maintain perfect visual parity with original pages

---

## Tasks Created

### Task 1: Component Extraction and Organization (`legacy-a10.1`)

**Priority:** P1 | **Status:** Open

**Objective:** Extract reusable components from pages and organize them into a
modular structure. Identify duplicate code patterns, create small reusable
components, and ensure pixel-perfect visual parity.

**Key Activities:**

- Review all 84+ pages in `src/pages/`
- Extract common patterns (Hero sections, CTAs, Partner grids, Search forms,
  etc.)
- Create small, focused components following Astro best practices
- Use TypeScript interfaces for props
- Document components with JSDoc comments
- Verify visual parity with `src-legacy/` files

**Components to Extract:**

1. JobCard component (enhance existing)
2. Hero sections (multiple variations)
3. CTA sections (sidebar CTAs, banner CTAs)
4. Partner/logo grids
5. Search forms
6. Breadcrumbs
7. Pagination components
8. Social share buttons
9. Author cards
10. Related content sections

**Files Affected:**

- `src/components/` (new components)
- `src/pages/` (refactor to use components)
- `src/styles/components/` (component styles)

---

### Task 2: CSS Optimization and Code Splitting (`legacy-a10.2`)

**Priority:** P1 | **Status:** Open

**Objective:** Optimize CSS loading by implementing code splitting, removing
unused CSS, and ensuring each page only loads the CSS it needs. Maintain perfect
visual parity.

**Current State:**

- Total CSS: ~276 KB (normalize.css + webflow.css + jobnagringa.webflow.css)
- All CSS loaded on every page
- Many page-specific styles loaded globally

**Optimization Strategy:**

1. Audit CSS usage (PurgeCSS, uncss)
2. Implement CSS code splitting per page/component
3. Inline critical CSS (above-the-fold)
4. Defer non-critical CSS
5. Remove unused CSS
6. Optimize CSS delivery (minify, compress)

**Performance Targets:**

- Reduce initial CSS load by 50-70%
- Critical CSS < 14 KB
- Total CSS per page < 100 KB
- CSS load time < 200ms

**Files Affected:**

- `src/styles/index.css`
- `src/layouts/BaseLayout.astro`
- `src/layouts/LandingLayout.astro`
- `src/layouts/DashboardLayout.astro`
- Individual page files

---

### Task 3: Image Optimization and Modern Formats (`legacy-a10.3`)

**Priority:** P1 | **Status:** Open

**Objective:** Optimize all 140+ images using Astro's Image component, implement
responsive images, lazy loading, and modern formats (WebP, AVIF) while
maintaining perfect visual quality.

**Current State:**

- 140+ image files in `public/images/`
- Some responsive variants exist (p-500, p-800, p-1080) but inconsistent
- Images not optimized

**Optimization Strategy:**

1. Install Astro Image integration
2. Convert to modern formats (WebP, AVIF)
3. Implement responsive images (srcset, sizes)
4. Lazy load below-the-fold images
5. Preload critical images (LCP)
6. Optimize SVGs
7. Compress images without quality loss

**Performance Targets:**

- Reduce image file sizes by 60-80%
- LCP image < 2.5s load time
- All images use modern formats
- Proper srcset for responsive images
- Lazy loading for below-the-fold

**Files Affected:**

- All page files with `<img>` tags
- Component files (Navbar, Footer, JobCard, etc.)
- Layout files with background images

---

### Task 4: Asset Loading Optimization (`legacy-a10.4`)

**Priority:** P1 | **Status:** Open

**Objective:** Optimize loading of JavaScript, fonts, and other assets using
Astro's best practices: code splitting, preloading, prefetching, and resource
hints.

**Current Scripts to Optimize:**

- Clerk authentication (clerk.browser.js)
- Google Analytics (gtag.js)
- Google Tag Manager (gtm.js)
- Mautic tracking (mtc.js)
- Webflow scripts (webflow.js, jQuery)
- Finsweet CMS attributes
- Ahrefs Analytics

**Optimization Strategy:**

1. Use Astro client directives (client:load, client:idle, client:visible)
2. Code split JavaScript per page/component
3. Defer non-critical scripts
4. Optimize font loading (font-display: swap, preload)
5. Use resource hints (preconnect, dns-prefetch, preload, prefetch)
6. Optimize bundle sizes

**Performance Targets:**

- JavaScript bundle < 100 KB initial load
- Fonts load < 1s
- No render-blocking resources
- FCP < 1.8s
- LCP < 2.5s
- TTI < 3.8s

**Files Affected:**

- `src/layouts/BaseLayout.astro`
- `src/components/Head.astro`
- `src/components/ClientScripts.astro`
- Individual page files
- `astro.config.mjs`

---

### Task 5: Visual Regression Testing Setup (`legacy-a10.5`)

**Priority:** P1 | **Status:** Open

**Objective:** Set up comprehensive visual regression testing to ensure
pixel-perfect layout preservation throughout the optimization process. This is
CRITICAL for maintaining visual perfection.

**Testing Strategy:**

1. Choose testing tool (Playwright recommended)
2. Set up baseline screenshots (from `src-legacy/` or current pages)
3. Create test suite for all 84+ pages
4. Test multiple viewports (mobile, tablet, desktop)
5. Test different states (logged in, logged out)
6. Implement comparison logic with configurable thresholds
7. Integrate with CI/CD pipeline

**Viewports to Test:**

- Mobile: 375x667 (iPhone SE)
- Tablet: 768x1024 (iPad)
- Desktop: 1920x1080
- Large Desktop: 2560x1440

**Implementation:**

- Install Playwright: `npm install -D @playwright/test`
- Create `tests/visual/` directory
- Write test scripts for each page
- Configure CI/CD integration
- Document testing process

**Files to Create:**

- `tests/visual/` (test directory)
- `playwright.config.ts`
- `.github/workflows/visual-tests.yml`
- `tests/visual/pages/*.spec.ts`
- `tests/visual/components/*.spec.ts`

---

### Task 6: Performance Monitoring and Metrics (`legacy-a10.6`)

**Priority:** P1 | **Status:** Open

**Objective:** Implement comprehensive performance monitoring, establish
performance budgets, and create dashboards to track Core Web Vitals and other
performance metrics.

**Core Web Vitals Targets:**

- LCP (Largest Contentful Paint): < 2.5s
- FID/INP (Interaction to Next Paint): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- FCP (First Contentful Paint): < 1.8s
- TTI (Time to Interactive): < 3.8s

**Performance Budgets:**

- JavaScript: < 100 KB initial load
- CSS: < 50 KB initial load
- Images: < 500 KB total per page
- Total page weight: < 1 MB
- Lighthouse score: > 90

**Implementation:**

1. Set up Lighthouse CI
2. Configure performance budgets
3. Add RUM tracking (Google Analytics Web Vitals)
4. Create performance dashboard
5. Set up alerts for performance degradation
6. Track scores over time

**Files to Create/Modify:**

- `.lighthouserc.js` (Lighthouse CI config)
- `.github/workflows/performance.yml`
- `src/scripts/performance.ts` (RUM tracking)
- `docs/performance-budgets.md`
- `scripts/analyze-bundle.js`

---

### Task 7: Code Organization and Best Practices (`legacy-a10.7`)

**Priority:** P1 | **Status:** Open

**Objective:** Refactor code organization to follow Astro best practices: proper
file structure, consistent naming conventions, TypeScript strict mode, and clean
code principles.

**Improvements:**

1. **File Structure:**
   - Organize components by feature/domain
   - Group related components together
   - Use consistent naming conventions

2. **TypeScript Improvements:**
   - Enable strict mode in `tsconfig.json`
   - Add proper type definitions
   - Use interfaces for component props
   - Remove `any` types
   - Add JSDoc comments

3. **Component Organization:**
   - Small, focused components (single responsibility)
   - Composable components
   - Consistent prop naming
   - Proper component documentation

4. **Code Quality:**
   - Remove duplicate code
   - Extract common utilities
   - Use consistent formatting (Prettier)
   - Follow ESLint rules

5. **Import Organization:**
   - Group imports (Astro, components, utilities, types)
   - Use path aliases consistently
   - Remove unused imports
   - Sort imports consistently

**Files to Review/Refactor:**

- All `.astro` files (84+ pages, 20+ components)
- TypeScript files in `src/scripts/`
- Configuration files
- Utility functions

---

### Task 8: Build Optimization and Production Configuration (`legacy-a10.8`)

**Priority:** P1 | **Status:** Open

**Objective:** Optimize Astro build configuration for maximum performance:
enable all optimizations, configure caching, implement proper asset handling,
and ensure production builds are optimized.

**Current Configuration:**

- `output: "server"` (SSR mode)
- `adapter: node` (standalone)
- `build.assets: "_assets"`
- `build.inlineStylesheets: "auto"`
- `prefetch.prefetchAll: true`
- `experimental.clientPrerender: true`

**Optimizations to Add:**

1. Enable image optimization
2. Configure compression (gzip/brotli)
3. Optimize CSS handling
4. Configure proper caching headers
5. Enable build optimizations
6. Configure code splitting strategy

**Caching Strategy:**

- Static assets: `Cache-Control: max-age=31536000, immutable`
- HTML: `Cache-Control: max-age=3600, must-revalidate`
- API responses: `Cache-Control: max-age=300, stale-while-revalidate=86400`

**Performance Targets:**

- Build time: < 2 minutes
- Production bundle: Optimized sizes
- Asset optimization: All assets optimized
- Caching: Proper headers set
- Compression: Enabled

**Files to Modify:**

- `astro.config.mjs` (main config)
- `package.json` (build scripts)
- `.github/workflows/build.yml` (CI/CD)
- `public/_headers` (if using Netlify)
- `vercel.json` (if using Vercel)

---

## Summary

**Total Tasks Created:** 8 tasks + 1 epic

**Epic:** `legacy-a10` - Astro Performance Optimization & Code Organization

**Tasks:**

1. `legacy-a10.1` - Component Extraction and Organization
2. `legacy-a10.2` - CSS Optimization and Code Splitting
3. `legacy-a10.3` - Image Optimization and Modern Formats
4. `legacy-a10.4` - Asset Loading Optimization
5. `legacy-a10.5` - Visual Regression Testing Setup
6. `legacy-a10.6` - Performance Monitoring and Metrics
7. `legacy-a10.7` - Code Organization and Best Practices
8. `legacy-a10.8` - Build Optimization and Production Configuration

**All tasks are:**

- ✅ Created with detailed descriptions (PRD-level detail)
- ✅ Linked to the epic as parent
- ✅ Set to Priority 1 (High)
- ✅ Ready for implementation
- ✅ Include file paths, best practices, verification steps, and performance
  targets

---

## Next Steps

1. **Review Tasks:** Review each task description to understand scope and
   requirements
2. **Prioritize:** Determine order of implementation (recommended: start with
   Task 5 - Visual Regression Testing)
3. **Claim Work:** Use `bd update <task-id> --status in_progress` to claim tasks
4. **Implement:** Follow the detailed descriptions in each task
5. **Verify:** Use visual regression tests and performance monitoring to ensure
   quality
6. **Complete:** Use `bd close <task-id>` when tasks are complete

---

## Important Notes

⚠️ **CRITICAL REQUIREMENT:** All optimizations must maintain pixel-perfect
visual parity with the original layout. No visual changes are allowed.

✅ **Visual Regression Testing:** Task 5 (Visual Regression Testing) should be
set up FIRST to catch any regressions during optimization.

📊 **Performance Monitoring:** Task 6 (Performance Monitoring) should be set up
early to establish baselines and track improvements.

🔍 **Verification:** Each task includes detailed verification steps. Follow them
carefully to ensure quality.

---

**Report Generated:** 2026-01-14  
**Epic ID:** `legacy-a10`  
**Total Issues:** 9 (1 epic + 8 tasks)
