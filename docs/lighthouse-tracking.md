# Lighthouse Score Tracking and Reporting System

This document describes the Lighthouse score tracking and reporting system for
the jobnagringa-astro project.

## Overview

The system provides:

- **Score History Tracking**: Track Lighthouse scores over time
- **Baseline Comparison**: Compare current scores against established baselines
- **Trend Analysis**: Visualize performance trends
- **CI/CD Integration**: Automated reporting in pull requests
- **Regression Detection**: Catch performance regressions before merge

## Current Performance Status

Based on the latest baseline (January 2026):

| Category       | Score | Target | Status |
| -------------- | ----- | ------ | ------ |
| Performance    | 100   | 90+    | PASS   |
| Accessibility  | 88-93 | 100    | WARN   |
| Best Practices | 56    | 100    | WARN   |
| SEO            | 100   | 100    | PASS   |

### Core Web Vitals (All Pages Average)

| Metric | Value  | Target  | Rating |
| ------ | ------ | ------- | ------ |
| LCP    | ~540ms | <2500ms | GOOD   |
| FCP    | ~310ms | <1800ms | GOOD   |
| CLS    | 0.000  | <0.1    | GOOD   |
| TBT    | 0ms    | <200ms  | GOOD   |
| SI     | ~340ms | <3000ms | GOOD   |

## Available Commands

### Basic Commands

```bash
# Run full Lighthouse CI audit
bun run lighthouse

# Generate baseline from current results
bun run lighthouse:baseline

# Run full pipeline (audit + baseline + history)
bun run lighthouse:full
```

### History Tracking

```bash
# Show score trends over time
bun run lighthouse:history:show

# Add current results to history
bun run lighthouse:history:add

# Export history to CSV
bun run lighthouse:history:export
```

### Comparison Reports

```bash
# Compare against baseline
bun run lighthouse:compare:baseline

# Compare against previous run
bun run lighthouse:compare:previous

# CI mode (fails on regressions)
bun run lighthouse:compare:ci
```

## Key Files

| File                                  | Purpose                                   |
| ------------------------------------- | ----------------------------------------- |
| `lighthouserc.cjs`                    | Lighthouse CI configuration               |
| `budget.json`                         | Current baseline scores                   |
| `.lighthouseci/history.json`          | Score history over time                   |
| `.lighthouseci/assertion-results.json`| Latest assertion results                  |
| `.lighthouseci/comparison-report.json`| Latest comparison report                  |
| `.lighthouseci/links.json`            | Links to hosted reports                   |
| `scripts/lighthouse-baseline.js`      | Baseline generator script                 |
| `scripts/lighthouse-history.js`       | History tracking script                   |
| `scripts/lighthouse-compare.js`       | Comparison tool                           |

## Configuration

### Score Thresholds (lighthouserc.cjs)

```javascript
assertions: {
  // Category targets
  "categories:performance": ["warn", { minScore: 0.9 }],
  "categories:accessibility": ["warn", { minScore: 1.0 }],
  "categories:best-practices": ["warn", { minScore: 1.0 }],
  "categories:seo": ["warn", { minScore: 1.0 }],

  // Core Web Vitals
  "largest-contentful-paint": ["warn", { maxNumericValue: 2500 }],
  "total-blocking-time": ["warn", { maxNumericValue: 200 }],
  "cumulative-layout-shift": ["warn", { maxNumericValue: 0.1 }],
}
```

### Resource Budgets

```javascript
budgets: [
  {
    path: "/*",
    resourceSizes: [
      { resourceType: "script", budget: 100 },      // 100 KB JS
      { resourceType: "stylesheet", budget: 50 },   // 50 KB CSS
      { resourceType: "image", budget: 500 },       // 500 KB images
      { resourceType: "total", budget: 1000 },      // 1 MB total
    ],
  },
]
```

## CI/CD Integration

The GitHub Actions workflow (`.github/workflows/lighthouse-ci.yml`) runs
automatically on:

- Push to master/main branches
- Pull requests to master/main
- Manual trigger (workflow_dispatch)

### What Happens in CI

1. **Build**: Project is built using `bun run build`
2. **Lighthouse Audit**: Runs against 7 critical pages
3. **Generate Reports**: Creates baseline and comparison reports
4. **Track History**: Adds results to history
5. **PR Comment**: Posts summary comment on pull requests
6. **Artifacts**: Uploads reports for 30-day retention

### PR Comment Contents

- Report links for each tested page
- Summary of passed/warning/error assertions
- Performance regressions table (if any)
- Performance improvements list (if any)

## Interpreting Results

### Assertion Levels

- **error**: Blocks CI (currently not used)
- **warn**: Warning only, does not block CI

### Comparison Report

The comparison report shows:

- **Regressions**: Score decreases beyond threshold
- **Improvements**: Score increases beyond threshold
- **Unchanged**: Scores within threshold

Default thresholds:

- Categories: 5% change
- LCP/FCP/SI/TBT: 250ms change
- CLS: 0.01 change

## Fixing Score Regressions

### Performance Regressions

1. Check for new render-blocking resources
2. Verify images are properly optimized
3. Check for increased JavaScript bundle size
4. Review third-party scripts

### Accessibility Regressions

1. Check ARIA attributes on new elements
2. Verify form labels are associated
3. Check color contrast ratios
4. Verify touch target sizes

### Best Practices Regressions

1. Check for new console errors
2. Verify HTTPS usage
3. Check for deprecated APIs
4. Review security headers

### SEO Regressions

1. Verify meta tags are present
2. Check structured data validity
3. Verify canonical URLs
4. Check robots.txt and sitemap

## Runbook: Fixing Common Issues

### High CLS (Cumulative Layout Shift)

```html
<!-- Add explicit dimensions to images -->
<img src="image.jpg" width="800" height="600" alt="..." />

<!-- Or use CSS aspect-ratio -->
<style>
  .image-container {
    aspect-ratio: 16 / 9;
  }
</style>
```

### Slow LCP (Largest Contentful Paint)

```html
<!-- Preload LCP image -->
<link rel="preload" href="hero.jpg" as="image" />

<!-- Don't lazy load LCP image -->
<img src="hero.jpg" loading="eager" fetchpriority="high" />
```

### High TBT (Total Blocking Time)

```javascript
// Break up long tasks
requestIdleCallback(() => {
  // Non-critical work
});

// Defer non-critical scripts
<script defer src="analytics.js"></script>
```

### Missing Text Compression

```javascript
// In astro.config.mjs, enable compression
import compress from "astro-compressor";
export default defineConfig({
  integrations: [compress()],
});
```

## Best Practices

1. **Run locally before committing**: `bun run lighthouse:full`
2. **Review comparison reports**: Check for regressions
3. **Track trends**: Use `bun run lighthouse:history:show` regularly
4. **Export data**: Use CSV export for external analysis
5. **Set realistic targets**: Gradually increase thresholds as you improve

## Troubleshooting

### "No Lighthouse reports found"

```bash
# Build first
bun run build
# Then run lighthouse
bun run lighthouse
```

### "Chrome not found"

```bash
# Install Chrome/Chromium
# On Ubuntu:
sudo apt install chromium-browser
export CHROME_PATH=/usr/bin/chromium-browser
```

### WSL Issues

```bash
# Create temp directory for Chrome
export LIGHTHOUSE_USER_DATA_DIR=/tmp/lighthouse-user-data
```

### History Not Updating

```bash
# Ensure baseline exists first
bun run lighthouse:baseline
# Then add to history
bun run lighthouse:history:add
```

## Monitoring Dashboard

For detailed trend analysis, export history to CSV and import into your
preferred analysis tool:

```bash
bun run lighthouse:history:export
# Creates: .lighthouseci/lighthouse-history-{timestamp}.csv
```

CSV columns:

- timestamp, commit, branch
- performance, accessibility, best_practices, seo
- lcp_ms, fcp_ms, cls, tbt_ms, si_ms
- warnings, errors
