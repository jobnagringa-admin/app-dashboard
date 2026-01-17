#!/usr/bin/env node
/**
 * Lighthouse Baseline Report Generator
 *
 * Generates a baseline performance report from existing Lighthouse CI results.
 * This script reads the assertion results and creates a summary for tracking.
 *
 * Usage:
 *   bun run scripts/lighthouse-baseline.js
 *
 * Output:
 *   - Console summary of current performance metrics
 *   - JSON baseline file for comparison
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const lhciDir = join(projectRoot, '.lighthouseci');

/**
 * Parse Lighthouse report JSON files
 */
function parseReports() {
  if (!existsSync(lhciDir)) {
    console.error('Error: .lighthouseci directory not found.');
    console.error('Run "bun run lighthouse" first to generate reports.');
    process.exit(1);
  }

  const files = readdirSync(lhciDir).filter(f => f.match(/^lhr-\d+\.json$/));

  if (files.length === 0) {
    console.error('Error: No Lighthouse report files found.');
    console.error('Run "bun run lighthouse" first to generate reports.');
    process.exit(1);
  }

  const reports = files.map(file => {
    const content = readFileSync(join(lhciDir, file), 'utf8');
    return JSON.parse(content);
  });

  return reports;
}

/**
 * Extract category scores from reports
 */
function extractCategoryScores(reports) {
  const scoresByUrl = {};

  reports.forEach(report => {
    const url = report.finalUrl || report.requestedUrl;
    const urlPath = new URL(url).pathname;

    if (!scoresByUrl[urlPath]) {
      scoresByUrl[urlPath] = {
        performance: [],
        accessibility: [],
        'best-practices': [],
        seo: [],
      };
    }

    Object.entries(report.categories).forEach(([key, category]) => {
      if (scoresByUrl[urlPath][key]) {
        scoresByUrl[urlPath][key].push(Math.round(category.score * 100));
      }
    });
  });

  return scoresByUrl;
}

/**
 * Extract Core Web Vitals from reports
 */
function extractCoreWebVitals(reports) {
  const vitalsByUrl = {};

  reports.forEach(report => {
    const url = report.finalUrl || report.requestedUrl;
    const urlPath = new URL(url).pathname;

    if (!vitalsByUrl[urlPath]) {
      vitalsByUrl[urlPath] = {
        fcp: [],
        lcp: [],
        cls: [],
        tbt: [],
        si: [],
      };
    }

    const audits = report.audits;

    if (audits['first-contentful-paint']) {
      vitalsByUrl[urlPath].fcp.push(audits['first-contentful-paint'].numericValue);
    }
    if (audits['largest-contentful-paint']) {
      vitalsByUrl[urlPath].lcp.push(audits['largest-contentful-paint'].numericValue);
    }
    if (audits['cumulative-layout-shift']) {
      vitalsByUrl[urlPath].cls.push(audits['cumulative-layout-shift'].numericValue);
    }
    if (audits['total-blocking-time']) {
      vitalsByUrl[urlPath].tbt.push(audits['total-blocking-time'].numericValue);
    }
    if (audits['speed-index']) {
      vitalsByUrl[urlPath].si.push(audits['speed-index'].numericValue);
    }
  });

  return vitalsByUrl;
}

/**
 * Calculate average from array of numbers
 */
function average(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Format milliseconds to readable string
 */
function formatMs(ms) {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  return `${Math.round(ms)}ms`;
}

/**
 * Get rating for metric value
 */
function getRating(metric, value) {
  const thresholds = {
    fcp: { good: 1800, needsImprovement: 3000 },
    lcp: { good: 2500, needsImprovement: 4000 },
    cls: { good: 0.1, needsImprovement: 0.25 },
    tbt: { good: 200, needsImprovement: 600 },
    si: { good: 3000, needsImprovement: 5000 },
  };

  const t = thresholds[metric];
  if (!t) return '';

  if (value <= t.good) return 'GOOD';
  if (value <= t.needsImprovement) return 'NEEDS_IMPROVEMENT';
  return 'POOR';
}

/**
 * Generate baseline report
 */
function generateBaseline() {
  console.log('Lighthouse Baseline Report Generator');
  console.log('====================================\n');

  const reports = parseReports();
  console.log(`Found ${reports.length} Lighthouse report(s)\n`);

  const categoryScores = extractCategoryScores(reports);
  const coreWebVitals = extractCoreWebVitals(reports);

  const baseline = {
    timestamp: new Date().toISOString(),
    pages: {},
  };

  console.log('Category Scores by Page');
  console.log('-----------------------');

  Object.entries(categoryScores).forEach(([url, scores]) => {
    console.log(`\n${url}:`);

    baseline.pages[url] = {
      categories: {},
      vitals: {},
    };

    Object.entries(scores).forEach(([category, values]) => {
      const avg = Math.round(average(values));
      const min = Math.min(...values);
      const max = Math.max(...values);

      baseline.pages[url].categories[category] = {
        average: avg,
        min,
        max,
        runs: values.length,
      };

      const status = avg >= 90 ? 'PASS' : avg >= 50 ? 'WARN' : 'FAIL';
      console.log(`  ${category.padEnd(15)} ${avg.toString().padStart(3)}% (${min}-${max}) [${status}]`);
    });
  });

  console.log('\n\nCore Web Vitals by Page');
  console.log('-----------------------');

  Object.entries(coreWebVitals).forEach(([url, vitals]) => {
    console.log(`\n${url}:`);

    Object.entries(vitals).forEach(([metric, values]) => {
      if (values.length === 0) return;

      const avg = average(values);
      const rating = getRating(metric, avg);

      baseline.pages[url].vitals[metric] = {
        average: avg,
        min: Math.min(...values),
        max: Math.max(...values),
        runs: values.length,
        rating,
      };

      const formatted = metric === 'cls' ? avg.toFixed(3) : formatMs(avg);
      const names = {
        fcp: 'FCP (First Contentful Paint)',
        lcp: 'LCP (Largest Contentful Paint)',
        cls: 'CLS (Cumulative Layout Shift)',
        tbt: 'TBT (Total Blocking Time)',
        si: 'SI  (Speed Index)',
      };

      console.log(`  ${names[metric].padEnd(35)} ${formatted.padStart(8)} [${rating}]`);
    });
  });

  // Read assertion results if available
  const assertionPath = join(lhciDir, 'assertion-results.json');
  if (existsSync(assertionPath)) {
    const assertions = JSON.parse(readFileSync(assertionPath, 'utf8'));
    const warnings = assertions.filter(a => !a.passed && a.level === 'warn');
    const errors = assertions.filter(a => !a.passed && a.level === 'error');

    console.log('\n\nAssertion Summary');
    console.log('-----------------');
    console.log(`  Passed:   ${assertions.filter(a => a.passed).length}`);
    console.log(`  Warnings: ${warnings.length}`);
    console.log(`  Errors:   ${errors.length}`);

    if (warnings.length > 0) {
      console.log('\n  Top Warnings:');
      warnings.slice(0, 10).forEach(w => {
        const title = w.auditTitle || w.auditId;
        console.log(`    - ${title}: expected ${w.expected}, got ${w.actual}`);
      });
    }

    baseline.assertions = {
      passed: assertions.filter(a => a.passed).length,
      warnings: warnings.length,
      errors: errors.length,
    };
  }

  // Write baseline file
  const baselinePath = join(projectRoot, 'budget.json');
  writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));
  console.log(`\n\nBaseline saved to: ${baselinePath}`);

  // Summary
  console.log('\n\nPerformance Summary');
  console.log('===================');

  const allPerf = Object.values(categoryScores).flatMap(s => s.performance);
  const allAccess = Object.values(categoryScores).flatMap(s => s.accessibility);
  const allBp = Object.values(categoryScores).flatMap(s => s['best-practices']);
  const allSeo = Object.values(categoryScores).flatMap(s => s.seo);

  console.log(`\n  Overall Averages (${reports.length} reports):`);
  console.log(`    Performance:    ${Math.round(average(allPerf))}%`);
  console.log(`    Accessibility:  ${Math.round(average(allAccess))}%`);
  console.log(`    Best Practices: ${Math.round(average(allBp))}%`);
  console.log(`    SEO:            ${Math.round(average(allSeo))}%`);

  const allLcp = Object.values(coreWebVitals).flatMap(v => v.lcp);
  const allCls = Object.values(coreWebVitals).flatMap(v => v.cls);
  const allTbt = Object.values(coreWebVitals).flatMap(v => v.tbt);

  console.log(`\n  Core Web Vitals (averages):`);
  console.log(`    LCP: ${formatMs(average(allLcp))} [${getRating('lcp', average(allLcp))}]`);
  console.log(`    CLS: ${average(allCls).toFixed(3)} [${getRating('cls', average(allCls))}]`);
  console.log(`    TBT: ${formatMs(average(allTbt))} [${getRating('tbt', average(allTbt))}]`);

  console.log('\n');
}

// Run
generateBaseline();
