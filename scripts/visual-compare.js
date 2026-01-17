#!/usr/bin/env node
/**
 * Visual comparison script
 * Compares legacy HTML pages with Astro pages
 * Usage: node scripts/visual-compare.js [page-name]
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const LEGACY_PORT = 4322;
const ASTRO_PORT = 4321;

const pages = [
  { name: 'index', legacyPath: '/jng/index.html', astroPath: '/jng/index' },
  { name: 'course', legacyPath: '/jng/course.html', astroPath: '/jng/course' },
  { name: 'jobs', legacyPath: '/jng/jobs.html', astroPath: '/jng/jobs' },
];

async function comparePage(pageInfo, viewport = { width: 1280, height: 800 }) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();

  const outputDir = path.join(process.cwd(), 'tests', '__comparisons__');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\nComparing ${pageInfo.name} (${viewport.width}x${viewport.height})...`);

  try {
    // Legacy page
    console.log(`  Loading legacy: http://localhost:${LEGACY_PORT}${pageInfo.legacyPath}`);
    await page.goto(`http://localhost:${LEGACY_PORT}${pageInfo.legacyPath}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await page.waitForTimeout(2000); // Wait for animations

    const legacyFile = path.join(outputDir, `${pageInfo.name}-legacy-${viewport.width}.png`);
    await page.screenshot({ path: legacyFile, fullPage: true });
    console.log(`  ✓ Legacy screenshot: ${legacyFile}`);

    // Astro page
    console.log(`  Loading Astro: http://localhost:${ASTRO_PORT}${pageInfo.astroPath}`);
    await page.goto(`http://localhost:${ASTRO_PORT}${pageInfo.astroPath}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await page.waitForTimeout(2000); // Wait for animations

    const astroFile = path.join(outputDir, `${pageInfo.name}-astro-${viewport.width}.png`);
    await page.screenshot({ path: astroFile, fullPage: true });
    console.log(`  ✓ Astro screenshot: ${astroFile}`);

    // Compare visually (basic check)
    const legacyBuffer = fs.readFileSync(legacyFile);
    const astroBuffer = fs.readFileSync(astroFile);

    if (legacyBuffer.equals(astroBuffer)) {
      console.log(`  ✅ Perfect match!`);
    } else {
      console.log(`  ⚠️  Differences detected - check screenshots`);
    }
  } catch (error) {
    console.error(`  ❌ Error comparing ${pageInfo.name}:`, error.message);
  }

  await browser.close();
}

async function main() {
  const pageName = process.argv[2];
  const pagesToCompare = pageName ? pages.filter((p) => p.name === pageName) : pages;

  if (pagesToCompare.length === 0) {
    console.error(
      `Page "${pageName}" not found. Available pages: ${pages.map((p) => p.name).join(', ')}`
    );
    process.exit(1);
  }

  console.log('Starting visual comparison...');
  console.log(`Legacy server: http://localhost:${LEGACY_PORT}`);
  console.log(`Astro server: http://localhost:${ASTRO_PORT}`);

  // Desktop comparison
  for (const pageInfo of pagesToCompare) {
    await comparePage(pageInfo, { width: 1280, height: 800 });
  }

  // Mobile comparison
  for (const pageInfo of pagesToCompare) {
    await comparePage(pageInfo, { width: 375, height: 667 });
  }

  console.log('\n✓ Comparison complete!');
  console.log(`Check screenshots in: tests/__comparisons__/`);
}

main().catch(console.error);
