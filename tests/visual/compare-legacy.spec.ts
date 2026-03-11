import { test, expect } from '@playwright/test';
import { existsSync } from 'fs';

/**
 * Visual comparison tests between legacy HTML and Astro pages
 * Compares pixel-perfect matching
 */

const mainPages = [
  { name: 'index', legacyPath: '/jng/index.html', astroPath: '/jng/index' },
  { name: 'course', legacyPath: '/jng/course.html', astroPath: '/jng/course' },
  { name: 'jobs', legacyPath: '/jng/jobs.html', astroPath: '/jng/jobs' },
];

const LEGACY_BASE_URL = process.env.LEGACY_BASE_URL || 'http://jng-legacy-fixtures.localhost:1355';
const ASTRO_BASE_URL = process.env.APP_BASE_URL || 'http://jng-legacy-preview.localhost:1355';
const hasLegacyFixtures = existsSync('src-legacy');

test.describe('Legacy vs Astro Visual Comparison', () => {
  test.skip(!hasLegacyFixtures, 'Legacy comparison fixtures are not available in this workspace.');

  for (const page of mainPages) {
    test(`${page.name} - desktop comparison`, async ({ page: testPage }) => {
      // Navigate to legacy version
      await testPage.goto(`${LEGACY_BASE_URL}${page.legacyPath}`);
      await testPage.waitForLoadState('networkidle');
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for any animations

      const legacyScreenshot = await testPage.screenshot({ fullPage: true });

      // Navigate to Astro version
      await testPage.goto(`${ASTRO_BASE_URL}${page.astroPath.replace('/jng', '')}`);
      await testPage.waitForLoadState('networkidle');
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for any animations

      const astroScreenshot = await testPage.screenshot({ fullPage: true });

      // Compare screenshots
      expect(legacyScreenshot).toMatchSnapshot(`${page.name}-legacy-desktop.png`);
      expect(astroScreenshot).toMatchSnapshot(`${page.name}-astro-desktop.png`);
    });

    test(`${page.name} - mobile comparison`, async ({ page: testPage }) => {
      await testPage.setViewportSize({ width: 375, height: 667 });

      // Navigate to legacy version
      await testPage.goto(`${LEGACY_BASE_URL}${page.legacyPath}`);
      await testPage.waitForLoadState('networkidle');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const legacyScreenshot = await testPage.screenshot({ fullPage: true });

      // Navigate to Astro version
      await testPage.goto(`${ASTRO_BASE_URL}${page.astroPath.replace('/jng', '')}`);
      await testPage.waitForLoadState('networkidle');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const astroScreenshot = await testPage.screenshot({ fullPage: true });

      // Compare screenshots
      expect(legacyScreenshot).toMatchSnapshot(`${page.name}-legacy-mobile.png`);
      expect(astroScreenshot).toMatchSnapshot(`${page.name}-astro-mobile.png`);
    });
  }
});
