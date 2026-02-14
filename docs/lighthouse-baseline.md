# Lighthouse Performance Baseline

Initial Lighthouse CI audit conducted on 2026-01-14.

## Baseline Scores

| Category       | Score | Target |
| -------------- | ----- | ------ |
| Performance    | 77    | 90+    |
| Accessibility  | 75    | 100    |
| Best Practices | 56    | 100    |
| SEO            | 100   | 100    |

## Core Web Vitals

| Metric                         | Value | Target  | Status |
| ------------------------------ | ----- | ------- | ------ |
| First Contentful Paint (FCP)   | 284ms | <2000ms | PASS   |
| Largest Contentful Paint (LCP) | 608ms | <2500ms | PASS   |
| Total Blocking Time (TBT)      | 0ms   | <300ms  | PASS   |
| Cumulative Layout Shift (CLS)  | 0.60  | <0.1    | FAIL   |
| Speed Index                    | 293ms | <3000ms | PASS   |

## Key Issues to Address

### Accessibility (75/100)

- ARIA required children: Elements with ARIA roles missing required child
  elements
- Link names: Some links do not have discernible names
- Select elements: Missing associated label elements
- Target size: Touch targets do not have sufficient size or spacing

### Best Practices (56/100)

- Browser console errors logged
- Inspector issues detected
- Third-party cookies usage
- Unminified JavaScript
- Unused JavaScript (3 items)

### Performance (77/100)

- Cumulative Layout Shift (CLS): 0.60 - significantly above 0.1 threshold
- LCP lazy loaded: LCP image is lazily loaded (should be eager)
- Render-blocking resources: 3 resources blocking render
- Text compression not enabled
- Inefficient cache policy on static assets

## Report Links

- Public Report:
  https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1768394740182-89849.report.html

## Test Configuration

```javascript
// lighthouserc.cjs
{
  collect: {
    url: ["http://localhost:4321/"],
    numberOfRuns: 3,
    settings: {
      preset: "desktop"
    }
  }
}
```

## Next Steps

1. Fix CLS issues (highest priority - impacts Core Web Vitals)
   - Add explicit width/height to images
   - Ensure LCP image is not lazy-loaded

2. Improve Accessibility
   - Add ARIA labels and proper element relationships
   - Ensure all interactive elements have accessible names
   - Increase touch target sizes

3. Optimize Best Practices
   - Fix console errors
   - Remove or defer unused JavaScript
   - Minify remaining JavaScript bundles

4. Performance Optimizations
   - Enable text compression (gzip/brotli)
   - Implement efficient cache headers
   - Reduce render-blocking resources

## Running Lighthouse Audits

```bash
# Full audit with assertions
bun run lighthouse

# Collect only (without assertions)
bun run lighthouse:collect
```
