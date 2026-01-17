#!/usr/bin/env node
/**
 * Lighthouse Score Comparison Tool
 *
 * Compares current Lighthouse scores against baseline or previous runs.
 * Generates detailed regression/improvement reports.
 *
 * Usage:
 *   bun run scripts/lighthouse-compare.js [options]
 *
 * Options:
 *   --baseline    Compare against budget.json baseline
 *   --previous    Compare against previous history entry
 *   --threshold N Set regression threshold percentage (default: 5)
 *   --json        Output as JSON
 *   --ci          CI mode - exit with code 1 on regressions
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
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    baseline: args.includes('--baseline'),
    previous: args.includes('--previous'),
    json: args.includes('--json'),
    ci: args.includes('--ci'),
    threshold: (() => {
      const idx = args.indexOf('--threshold');
      return idx !== -1 && args[idx + 1] ? parseInt(args[idx + 1], 10) : 5;
    })(),
  };
}

/**
 * Load current Lighthouse reports from lhr-*.json files or budget.json
 */
function loadCurrentReports() {
  const files = existsSync(lhciDir)
    ? readdirSync(lhciDir).filter(f => f.match(/^lhr-\d+\.json$/))
    : [];

  // If lhr files exist, parse them
  if (files.length > 0) {
    const reports = files.map(file => {
      const content = readFileSync(join(lhciDir, file), 'utf8');
      return JSON.parse(content);
    });

    // Aggregate by URL
    const byUrl = {};
    reports.forEach(report => {
      const url = new URL(report.finalUrl || report.requestedUrl).pathname;
      if (!byUrl[url]) {
        byUrl[url] = {
          categories: {},
          vitals: {},
        };
      }

      // Categories
      Object.entries(report.categories).forEach(([key, cat]) => {
        if (!byUrl[url].categories[key]) {
          byUrl[url].categories[key] = [];
        }
        byUrl[url].categories[key].push(Math.round(cat.score * 100));
      });

      // Vitals
      const audits = report.audits;
      const vitalMap = {
        'first-contentful-paint': 'fcp',
        'largest-contentful-paint': 'lcp',
        'cumulative-layout-shift': 'cls',
        'total-blocking-time': 'tbt',
        'speed-index': 'si',
      };

      Object.entries(vitalMap).forEach(([audit, vital]) => {
        if (audits[audit]) {
          if (!byUrl[url].vitals[vital]) {
            byUrl[url].vitals[vital] = [];
          }
          byUrl[url].vitals[vital].push(audits[audit].numericValue);
        }
      });
    });

    // Calculate averages
    const result = {};
    Object.entries(byUrl).forEach(([url, data]) => {
      result[url] = {
        categories: {},
        vitals: {},
      };

      Object.entries(data.categories).forEach(([key, values]) => {
        result[url].categories[key] = Math.round(
          values.reduce((a, b) => a + b, 0) / values.length
        );
      });

      Object.entries(data.vitals).forEach(([key, values]) => {
        result[url].vitals[key] =
          values.reduce((a, b) => a + b, 0) / values.length;
      });
    });

    return result;
  }

  // Fall back to budget.json (current baseline)
  const budgetPath = join(projectRoot, 'budget.json');
  if (existsSync(budgetPath)) {
    const budget = JSON.parse(readFileSync(budgetPath, 'utf8'));
    const result = {};

    Object.entries(budget.pages).forEach(([url, data]) => {
      result[url] = {
        categories: {},
        vitals: {},
      };

      Object.entries(data.categories).forEach(([key, val]) => {
        result[url].categories[key] = val.average;
      });

      Object.entries(data.vitals).forEach(([key, val]) => {
        result[url].vitals[key] = val.average;
      });
    });

    return result;
  }

  return null;
}

/**
 * Load baseline from budget.json
 */
function loadBaseline() {
  const budgetPath = join(projectRoot, 'budget.json');
  if (!existsSync(budgetPath)) {
    return null;
  }

  const budget = JSON.parse(readFileSync(budgetPath, 'utf8'));
  const result = {};

  Object.entries(budget.pages).forEach(([url, data]) => {
    result[url] = {
      categories: {},
      vitals: {},
    };

    Object.entries(data.categories).forEach(([key, val]) => {
      result[url].categories[key] = val.average;
    });

    Object.entries(data.vitals).forEach(([key, val]) => {
      result[url].vitals[key] = val.average;
    });
  });

  return result;
}

/**
 * Load previous entry from history
 */
function loadPrevious() {
  const historyPath = join(lhciDir, 'history.json');
  if (!existsSync(historyPath)) {
    return null;
  }

  const history = JSON.parse(readFileSync(historyPath, 'utf8'));
  if (history.entries.length < 2) {
    return null;
  }

  // Get second-to-last entry
  const prev = history.entries[history.entries.length - 2];
  const result = {};

  Object.entries(prev.pages).forEach(([url, data]) => {
    result[url] = {
      categories: {},
      vitals: {},
    };

    Object.entries(data.categories).forEach(([key, val]) => {
      result[url].categories[key] = val.average;
    });

    Object.entries(data.vitals).forEach(([key, val]) => {
      result[url].vitals[key] = val.average;
    });
  });

  return result;
}

/**
 * Compare two datasets
 */
function compare(current, reference, threshold) {
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      improved: 0,
      regressed: 0,
      unchanged: 0,
    },
    regressions: [],
    improvements: [],
    pages: {},
  };

  const allUrls = new Set([...Object.keys(current), ...Object.keys(reference)]);

  allUrls.forEach(url => {
    const curr = current[url];
    const ref = reference[url];

    if (!curr || !ref) {
      return;
    }

    results.pages[url] = {
      categories: {},
      vitals: {},
    };

    // Compare categories
    Object.entries(curr.categories).forEach(([key, currVal]) => {
      const refVal = ref.categories[key];
      if (refVal === undefined) return;

      const diff = currVal - refVal;
      const status =
        diff < -threshold ? 'regressed' : diff > threshold ? 'improved' : 'unchanged';

      results.pages[url].categories[key] = {
        current: currVal,
        reference: refVal,
        diff,
        status,
      };

      if (status === 'regressed') {
        results.summary.regressed++;
        results.regressions.push({
          url,
          metric: key,
          type: 'category',
          current: currVal,
          reference: refVal,
          diff,
        });
      } else if (status === 'improved') {
        results.summary.improved++;
        results.improvements.push({
          url,
          metric: key,
          type: 'category',
          current: currVal,
          reference: refVal,
          diff,
        });
      } else {
        results.summary.unchanged++;
      }
    });

    // Compare vitals (inverted - lower is better)
    const vitalThresholds = {
      lcp: 250, // 250ms threshold
      fcp: 150,
      cls: 0.01,
      tbt: 50,
      si: 300,
    };

    Object.entries(curr.vitals).forEach(([key, currVal]) => {
      const refVal = ref.vitals[key];
      if (refVal === undefined) return;

      const th = vitalThresholds[key] || threshold;
      const diff = currVal - refVal;
      // For vitals, higher is worse
      const status =
        diff > th ? 'regressed' : diff < -th ? 'improved' : 'unchanged';

      results.pages[url].vitals[key] = {
        current: currVal,
        reference: refVal,
        diff,
        status,
      };

      if (status === 'regressed') {
        results.regressions.push({
          url,
          metric: key,
          type: 'vital',
          current: currVal,
          reference: refVal,
          diff,
        });
      } else if (status === 'improved') {
        results.improvements.push({
          url,
          metric: key,
          type: 'vital',
          current: currVal,
          reference: refVal,
          diff,
        });
      }
    });
  });

  return results;
}

/**
 * Format comparison results for console output
 */
function formatResults(results, args) {
  if (args.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  console.log('Lighthouse Score Comparison Report');
  console.log('===================================\n');

  console.log(`Generated: ${results.timestamp}\n`);

  // Summary
  console.log('Summary:');
  console.log('--------');
  console.log(`  Improved:  ${results.summary.improved}`);
  console.log(`  Regressed: ${results.summary.regressed}`);
  console.log(`  Unchanged: ${results.summary.unchanged}`);
  console.log('');

  // Regressions (if any)
  if (results.regressions.length > 0) {
    console.log('REGRESSIONS (requires attention):');
    console.log('---------------------------------');
    results.regressions.forEach(r => {
      const formatValue = (v, type, metric) => {
        if (type === 'category') return `${v}%`;
        if (metric === 'cls') return v.toFixed(3);
        return `${Math.round(v)}ms`;
      };

      const curr = formatValue(r.current, r.type, r.metric);
      const ref = formatValue(r.reference, r.type, r.metric);
      const diff = r.type === 'category' ? `${r.diff}%` : formatValue(Math.abs(r.diff), r.type, r.metric);

      console.log(`  [${r.url}] ${r.metric}: ${ref} -> ${curr} (${r.diff > 0 ? '+' : ''}${diff})`);
    });
    console.log('');
  }

  // Improvements (if any)
  if (results.improvements.length > 0) {
    console.log('IMPROVEMENTS:');
    console.log('-------------');
    results.improvements.forEach(r => {
      const formatValue = (v, type, metric) => {
        if (type === 'category') return `${v}%`;
        if (metric === 'cls') return v.toFixed(3);
        return `${Math.round(v)}ms`;
      };

      const curr = formatValue(r.current, r.type, r.metric);
      const ref = formatValue(r.reference, r.type, r.metric);

      console.log(`  [${r.url}] ${r.metric}: ${ref} -> ${curr}`);
    });
    console.log('');
  }

  // Detailed by page
  console.log('Detailed Results by Page:');
  console.log('-------------------------');

  Object.entries(results.pages).forEach(([url, data]) => {
    console.log(`\n${url}:`);

    console.log('  Categories:');
    Object.entries(data.categories).forEach(([key, val]) => {
      const icon = val.status === 'improved' ? '+' : val.status === 'regressed' ? '-' : '=';
      const diffStr = val.diff !== 0 ? ` (${val.diff > 0 ? '+' : ''}${val.diff}%)` : '';
      console.log(`    [${icon}] ${key.padEnd(16)} ${val.current}%${diffStr}`);
    });

    console.log('  Vitals:');
    Object.entries(data.vitals).forEach(([key, val]) => {
      const icon = val.status === 'improved' ? '+' : val.status === 'regressed' ? '-' : '=';
      const format = v => (key === 'cls' ? v.toFixed(3) : `${Math.round(v)}ms`);
      console.log(`    [${icon}] ${key.toUpperCase().padEnd(5)} ${format(val.current)}`);
    });
  });

  console.log('\n');
}

// Main
async function main() {
  const args = parseArgs();

  // Load current results
  const current = loadCurrentReports();
  if (!current) {
    console.error('Error: No current Lighthouse reports found.');
    console.error('Run "bun run lighthouse" first.');
    process.exit(1);
  }

  // Load reference
  let reference;
  let refName;

  if (args.previous) {
    reference = loadPrevious();
    refName = 'previous run';
  } else {
    // Default to baseline
    reference = loadBaseline();
    refName = 'baseline';
  }

  if (!reference) {
    console.error(`Error: No ${refName} found for comparison.`);
    if (args.previous) {
      console.error('Run lighthouse at least twice and use --add to build history.');
    } else {
      console.error('Run "bun run lighthouse:baseline" to create a baseline.');
    }
    process.exit(1);
  }

  console.log(`Comparing current results against ${refName}...\n`);

  // Compare
  const results = compare(current, reference, args.threshold);

  // Output
  formatResults(results, args);

  // Save comparison report
  const reportPath = join(lhciDir, 'comparison-report.json');
  writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`Report saved to: ${reportPath}`);

  // CI mode - exit with error if regressions
  if (args.ci && results.regressions.length > 0) {
    console.error(`\nCI FAILURE: ${results.regressions.length} regression(s) detected.`);
    process.exit(1);
  }
}

main();
