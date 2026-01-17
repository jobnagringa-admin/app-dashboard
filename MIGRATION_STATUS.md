# Astro Migration Status

## Completed Tasks

✅ **Project Structure**: Created Astro project structure in `src/`
- `src/layouts/` - BaseLayout component
- `src/components/` - Navigation components (PublicNavbar, CommunityNavbar)
- `src/pages/` - All migrated pages
- `src/scripts/` - TypeScript modules (auth.ts, logout.ts)
- `src/styles/` - CSS files (webflow.css, global.css)

✅ **Assets Migration**: All assets copied from `src-legacy/cdn-assets/` to `public/cdn-assets/`

✅ **Pages Migration**: All 85 pages migrated
- 11 main pages in `src/pages/jng/`
- 9 module pages in `src/pages/jng/modulo/`
- 65 lesson pages in `src/pages/jng/aulas/`

✅ **Components Created**:
- `BaseLayout.astro` - Common layout with head/body structure
- `PublicNavbar.astro` - Public navigation
- `CommunityNavbar.astro` - Community navigation

✅ **Scripts Extracted**:
- `src/scripts/auth.ts` - Clerk authentication utilities
- `src/scripts/logout.ts` - Logout functionality

✅ **Visual Testing Setup**:
- `tests/visual/main-pages.spec.ts` - Tests for 11 main pages
- `tests/visual/module-pages.spec.ts` - Tests for 9 module pages
- `tests/visual/lesson-pages.spec.ts` - Tests for sample lesson pages

✅ **Comparison Tools**:
- `scripts/serve-legacy.js` - Serves legacy HTML files on port 4322
- `scripts/compare-pages.js` - Helper script for side-by-side comparison

## Known Issues to Fix During Visual Comparison

1. **general_style duplication**: Some pages may have duplicate `general_style` divs (BaseLayout already includes it)
   - Fix: Remove duplicate `general_style` divs from migrated pages during visual comparison

2. **Asset paths**: All paths updated from `../cdn-assets/` to `/cdn-assets/`
   - Verify: Check that all images, CSS, and JS files load correctly

3. **Navigation links**: All internal links updated to Astro routes
   - Verify: Test navigation between pages

4. **Script execution**: Some inline scripts moved to TypeScript modules
   - Verify: Test authentication, logout, and form functionality

## Next Steps

1. **Start Astro dev server**: `npm run dev`
2. **Start legacy server**: `node scripts/serve-legacy.js` (runs on port 4322)
3. **Run visual tests**: `npm run visual:test`
4. **Compare pages**: Use browser to compare legacy (port 4322) vs Astro (port 4321)
5. **Fix visual differences**: Adjust CSS/structure to match pixel-perfect
6. **Re-test**: Run visual tests again until all pages match

## Testing Commands

```bash
# Start Astro dev server
npm run dev

# In another terminal, start legacy server
node scripts/serve-legacy.js

# Run visual regression tests
npm run visual:test

# Update baseline screenshots (after fixing issues)
npm run visual:update
```

## File Structure

```
src/
├── layouts/
│   └── BaseLayout.astro
├── components/
│   ├── PublicNavbar.astro
│   └── CommunityNavbar.astro
├── pages/
│   └── jng/
│       ├── *.astro (11 main pages)
│       ├── modulo/
│       │   └── *.astro (9 module pages)
│       └── aulas/
│           └── *.astro (65 lesson pages)
├── scripts/
│   ├── auth.ts
│   └── logout.ts
└── styles/
    ├── webflow.css
    └── global.css

public/
└── cdn-assets/ (all migrated assets)

tests/
└── visual/
    ├── main-pages.spec.ts
    ├── module-pages.spec.ts
    └── lesson-pages.spec.ts
```
