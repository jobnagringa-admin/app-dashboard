# Visual Comparison Guide

## Quick Start

1. **Start both servers** (in separate terminals):
   ```bash
   # Terminal 1: Astro dev server
   npm run dev
   
   # Terminal 2: Legacy server
   node scripts/serve-legacy.js
   ```

2. **Run visual comparison**:
   ```bash
   # Compare all pages
   node scripts/visual-compare.js
   
   # Compare specific page
   node scripts/visual-compare.js index
   ```

3. **Check results**: Screenshots saved in `tests/__comparisons__/`

## Manual Comparison Checklist

### Page Structure
- [ ] HTML structure matches (same div hierarchy)
- [ ] Navigation bars render correctly
- [ ] Footer renders correctly (if present)
- [ ] No duplicate elements

### Styling
- [ ] Colors match exactly
- [ ] Fonts load and render correctly
- [ ] Spacing/padding matches
- [ ] Layout matches at all breakpoints
- [ ] Images display correctly
- [ ] No CSS conflicts

### Functionality
- [ ] Links work correctly
- [ ] Forms render correctly
- [ ] Interactive elements work
- [ ] No JavaScript errors in console

## Known Issues Fixed

✅ **Duplicate general_style divs**: Removed from all migrated pages (BaseLayout already includes it)

## Common Issues to Check

1. **Asset paths**: Verify all `/cdn-assets/` paths resolve correctly
2. **CSS specificity**: Check if any styles are being overridden
3. **Font loading**: Ensure WebFont loads correctly
4. **Viewport meta**: Check mobile rendering
5. **Script execution**: Verify Webflow scripts load

## Comparison Viewports

- Desktop: 1280x800
- Mobile: 375x667

## Fixing Differences

1. **Identify the difference**: Use browser DevTools to inspect
2. **Check CSS**: Compare computed styles between legacy and Astro
3. **Check HTML structure**: Ensure same DOM structure
4. **Fix in Astro**: Update component/layout as needed
5. **Re-test**: Run comparison again

## Pages to Compare

### Main Pages (11)
- index
- course
- jobs
- jobs-brs-only
- jobs-with-vista-sponsors
- job-search
- member-dashboard
- community
- partners
- companies-hiring
- resume-generator

### Module Pages (9)
- intro
- linkedin
- dev-interviews
- contabilidade
- negociacao
- empresas
- conteudo
- networking
- entrevista

### Lesson Pages (65)
- All pages in `src/pages/jng/aulas/`
