# Visual Comparison & Fixes Summary

## Status

✅ **Comparison Tools Created**:

- `scripts/visual-compare.js` - Automated screenshot comparison
- `VISUAL_COMPARISON_GUIDE.md` - Manual comparison guide

✅ **Known Issues Identified**:

- Duplicate `general_style` divs in migrated pages (BaseLayout already includes
  it)

## Quick Start for Visual Comparison

1. **Start servers**:

   ```bash
   # Terminal 1
   npm run dev

   # Terminal 2
   node scripts/serve-legacy.js
   ```

2. **Run comparison**:

   ```bash
   node scripts/visual-compare.js
   ```

3. **Check results**: `tests/__comparisons__/`

## Fixing Duplicate general_style

The `general_style` div appears in both BaseLayout and migrated pages. To fix:

```bash
# Remove from all pages
find src/pages/jng -name "*.astro" -exec sed -i '/<div class="general_style/,/<\/div>/d' {} \;
```

**Note**: This needs careful testing as sed might remove too much. Better
approach:

1. Open each page
2. Find `<div class="general_style w-embed">`
3. Remove until matching `</div>` after `</style>`

## Next Steps

1. Run visual comparison to identify all differences
2. Fix structural issues (duplicate divs, missing elements)
3. Fix CSS issues (spacing, colors, fonts)
4. Verify at all viewport sizes
5. Re-run comparison until pixel-perfect

## Common Issues to Check

- **Asset paths**: All `/cdn-assets/` paths should work
- **CSS loading**: Webflow CSS should load correctly
- **Font loading**: WebFont should load Inter font
- **Script execution**: Webflow scripts should execute
- **Navigation**: Links should work correctly
- **Responsive**: Check mobile/tablet/desktop views
