#!/usr/bin/env node
/**
 * Lighthouse Score History Tracker
 *
 * Maintains a history of Lighthouse scores over time for trend analysis.
 * Stores data in .lighthouseci/history.json
 *
 * Usage:
 *   bun run scripts/lighthouse-history.js [--add|--show|--export]
 *
 * Commands:
 *   --add     Add current results to history (after running lighthouse)
 *   --show    Display score trends over time
 *   --export  Export history to CSV for external analysis
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const lhciDir = join(projectRoot, '.lighthouseci');
const historyPath = join(lhciDir, 'history.json');
const budgetPath = join(projectRoot, 'budget.json');

/**
 * Load or initialize history
 */
function loadHistory() {
  if (existsSync(historyPath)) {
    return JSON.parse(readFileSync(historyPath, 'utf8'));
  }
  return {
    version: '1.0.0',
    entries: [],
    config: {
      maxEntries: 100,
      retentionDays: 90,
    },
  };
}

/**
 * Save history
 */
function saveHistory(history) {
  if (!existsSync(lhciDir)) {
    mkdirSync(lhciDir, { recursive: true });
  }
  writeFileSync(historyPath, JSON.stringify(history, null, 2));
}

/**
 * Get git info synchronously
 */
function getGitInfo() {
  try {
    return {
      commit: execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim(),
      branch: execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim(),
      message: execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim().split('\n')[0],
    };
  } catch {
    return { commit: 'unknown', branch: 'unknown', message: '' };
  }
}

/**
 * Add current results to history
 */
function addToHistory() {
  if (!existsSync(budgetPath)) {
    console.error('Error: budget.json not found.');
    console.error('Run "bun run lighthouse:baseline" first.');
    process.exit(1);
  }

  const budget = JSON.parse(readFileSync(budgetPath, 'utf8'));
  const history = loadHistory();

  // Get git info if available
  const gitInfo = getGitInfo();

  // Calculate overall averages
  const pages = Object.entries(budget.pages);
  const avgScores = {
    performance: 0,
    accessibility: 0,
    'best-practices': 0,
    seo: 0,
  };
  const avgVitals = {
    lcp: 0,
    fcp: 0,
    cls: 0,
    tbt: 0,
    si: 0,
  };

  pages.forEach(([, data]) => {
    Object.entries(data.categories).forEach(([key, val]) => {
      if (avgScores[key] !== undefined) {
        avgScores[key] += val.average;
      }
    });
    Object.entries(data.vitals).forEach(([key, val]) => {
      if (avgVitals[key] !== undefined) {
        avgVitals[key] += val.average;
      }
    });
  });

  const pageCount = pages.length;
  Object.keys(avgScores).forEach((key) => {
    avgScores[key] = Math.round(avgScores[key] / pageCount);
  });
  Object.keys(avgVitals).forEach((key) => {
    avgVitals[key] = avgVitals[key] / pageCount;
  });

  const entry = {
    id: Date.now(),
    timestamp: budget.timestamp || new Date().toISOString(),
    git: gitInfo,
    averages: {
      categories: avgScores,
      vitals: avgVitals,
    },
    pages: budget.pages,
    assertions: budget.assertions || { passed: 0, warnings: 0, errors: 0 },
  };

  history.entries.push(entry);

  // Trim old entries
  const cutoff = Date.now() - history.config.retentionDays * 24 * 60 * 60 * 1000;
  history.entries = history.entries.filter((e) => e.id > cutoff).slice(-history.config.maxEntries);

  saveHistory(history);
  console.log(`Added entry ${entry.id} to history.`);
  console.log(`Total entries: ${history.entries.length}`);

  return entry;
}

/**
 * Show score trends
 */
function showTrends() {
  const history = loadHistory();

  if (history.entries.length === 0) {
    console.log('No history entries found.');
    console.log(
      'Run "bun run lighthouse && bun run scripts/lighthouse-history.js --add" to add entries.'
    );
    return;
  }

  console.log('Lighthouse Score Trends');
  console.log('=======================\n');

  const entries = history.entries.slice(-10);
  const latest = entries[entries.length - 1];
  const previous = entries.length > 1 ? entries[entries.length - 2] : null;

  // Current scores
  console.log('Current Scores (latest run):');
  console.log('----------------------------');
  Object.entries(latest.averages.categories).forEach(([key, value]) => {
    const prevValue = previous?.averages?.categories?.[key];
    const diff = prevValue ? value - prevValue : 0;
    const diffStr = diff > 0 ? `(+${diff})` : diff < 0 ? `(${diff})` : '';
    console.log(`  ${key.padEnd(16)} ${value}% ${diffStr}`);
  });

  console.log('\nCore Web Vitals:');
  console.log('----------------');
  const formatVital = (key, value) => {
    if (key === 'cls') return value.toFixed(3);
    if (value >= 1000) return `${(value / 1000).toFixed(2)}s`;
    return `${Math.round(value)}ms`;
  };

  const vitalNames = {
    lcp: 'LCP',
    fcp: 'FCP',
    cls: 'CLS',
    tbt: 'TBT',
    si: 'SI',
  };

  Object.entries(latest.averages.vitals).forEach(([key, value]) => {
    const name = vitalNames[key] || key;
    console.log(`  ${name.padEnd(5)} ${formatVital(key, value)}`);
  });

  // Trend analysis
  if (entries.length >= 3) {
    console.log('\nTrend Analysis (last 10 runs):');
    console.log('------------------------------');

    Object.entries(latest.averages.categories).forEach(([key, _]) => {
      const values = entries.map((e) => e.averages.categories[key]);
      const first = values[0];
      const last = values[values.length - 1];
      const trend = last - first;
      const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

      let trendIcon = '-';
      if (trend > 2) trendIcon = 'UP';
      else if (trend < -2) trendIcon = 'DOWN';
      else trendIcon = 'STABLE';

      console.log(
        `  ${key.padEnd(16)} ${trendIcon.padEnd(8)} (avg: ${avg}%, range: ${Math.min(...values)}-${Math.max(...values)}%)`
      );
    });
  }

  // History table
  console.log('\nRecent History:');
  console.log('---------------');
  console.log(
    'Date'.padEnd(12) +
      'Perf'.padStart(6) +
      'A11y'.padStart(6) +
      'BP'.padStart(6) +
      'SEO'.padStart(6) +
      '  Commit'
  );
  console.log('-'.repeat(60));

  entries.forEach((entry) => {
    const date = new Date(entry.timestamp).toISOString().split('T')[0];
    const cats = entry.averages.categories;
    const commit = entry.git?.commit || 'unknown';
    console.log(
      date.padEnd(12) +
        String(cats.performance).padStart(6) +
        String(cats.accessibility).padStart(6) +
        String(cats['best-practices']).padStart(6) +
        String(cats.seo).padStart(6) +
        `  ${commit}`
    );
  });

  console.log('\n');
}

/**
 * Export history to CSV
 */
function exportToCsv() {
  const history = loadHistory();

  if (history.entries.length === 0) {
    console.log('No history entries to export.');
    return;
  }

  const csvPath = join(lhciDir, `lighthouse-history-${Date.now()}.csv`);

  const headers = [
    'timestamp',
    'commit',
    'branch',
    'performance',
    'accessibility',
    'best_practices',
    'seo',
    'lcp_ms',
    'fcp_ms',
    'cls',
    'tbt_ms',
    'si_ms',
    'warnings',
    'errors',
  ];

  const rows = history.entries.map((entry) => [
    entry.timestamp,
    entry.git?.commit || '',
    entry.git?.branch || '',
    entry.averages.categories.performance,
    entry.averages.categories.accessibility,
    entry.averages.categories['best-practices'],
    entry.averages.categories.seo,
    Math.round(entry.averages.vitals.lcp),
    Math.round(entry.averages.vitals.fcp),
    entry.averages.vitals.cls.toFixed(4),
    Math.round(entry.averages.vitals.tbt),
    Math.round(entry.averages.vitals.si),
    entry.assertions?.warnings || 0,
    entry.assertions?.errors || 0,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  writeFileSync(csvPath, csv);
  console.log(`Exported ${history.entries.length} entries to ${csvPath}`);
}

// Main
const args = process.argv.slice(2);
const command = args[0] || '--show';

switch (command) {
  case '--add':
  case 'add':
    addToHistory();
    break;
  case '--show':
  case 'show':
    showTrends();
    break;
  case '--export':
  case 'export':
    exportToCsv();
    break;
  default:
    console.log('Lighthouse History Tracker');
    console.log('');
    console.log('Usage:');
    console.log('  bun run scripts/lighthouse-history.js [command]');
    console.log('');
    console.log('Commands:');
    console.log('  --add      Add current results to history');
    console.log('  --show     Display score trends (default)');
    console.log('  --export   Export history to CSV');
}
