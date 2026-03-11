import { chromium, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script to compare legacy and Astro pages side-by-side
 * Generates comparison reports
 */

const LEGACY_BASE_URL = process.env.LEGACY_BASE_URL || 'http://jng-legacy-fixtures.localhost:1355';
const ASTRO_BASE_URL = process.env.APP_BASE_URL || 'http://jng-legacy.localhost:1355';

const pages = [
  { name: 'index', legacyPath: '/jng/index.html', astroPath: '/jng/index' },
  { name: 'course', legacyPath: '/jng/course.html', astroPath: '/jng/course' },
  { name: 'jobs', legacyPath: '/jng/jobs.html', astroPath: '/jng/jobs' },
];

async function takeScreenshot(page: Page, url: string, filename: string) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // Wait for animations
  await page.screenshot({
    path: filename,
    fullPage: true,
  });
}

async function comparePages() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  const outputDir = path.join(process.cwd(), 'tests', '__comparisons__');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Starting visual comparison...\n');

  for (const pageInfo of pages) {
    console.log(`Comparing ${pageInfo.name}...`);

    const legacyFile = path.join(outputDir, `${pageInfo.name}-legacy.png`);
    const astroFile = path.join(outputDir, `${pageInfo.name}-astro.png`);
    // Take screenshots
    await takeScreenshot(page, `${LEGACY_BASE_URL}${pageInfo.legacyPath}`, legacyFile);
    await takeScreenshot(page, `${ASTRO_BASE_URL}${pageInfo.astroPath}`, astroFile);

    console.log(`  ✓ Legacy: ${legacyFile}`);
    console.log(`  ✓ Astro: ${astroFile}`);
  }

  await browser.close();
  console.log('\n✓ Comparison complete! Check tests/__comparisons__/');
}

comparePages().catch(console.error);
