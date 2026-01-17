import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Visual comparison tests between legacy HTML and Astro pages
 * Compares pixel-perfect matching
 */

const mainPages = [
  { name: 'index', legacyPath: '/jng/index.html', astroPath: '/jng/index' },
  { name: 'course', legacyPath: '/jng/course.html', astroPath: '/jng/course' },
  { name: 'jobs', legacyPath: '/jng/jobs.html', astroPath: '/jng/jobs' },
];

const LEGACY_PORT = 4322;
const ASTRO_PORT = 4321;

test.describe('Legacy vs Astro Visual Comparison', () => {
  test.beforeAll(async () => {
    // Start legacy server in background
    try {
      await execAsync(`node scripts/serve-legacy.js > /tmp/legacy-server.log 2>&1 &`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for server to start
    } catch (error) {
      console.warn('Legacy server may already be running:', error);
    }
  });

  for (const page of mainPages) {
    test(`${page.name} - desktop comparison`, async ({ page: testPage }) => {
      // Navigate to legacy version
      await testPage.goto(`http://localhost:${LEGACY_PORT}${page.legacyPath}`);
      await testPage.waitForLoadState('networkidle');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for any animations
      
      const legacyScreenshot = await testPage.screenshot({ fullPage: true });
      
      // Navigate to Astro version
      await testPage.goto(`http://localhost:${ASTRO_PORT}${page.astroPath}`);
      await testPage.waitForLoadState('networkidle');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for any animations
      
      const astroScreenshot = await testPage.screenshot({ fullPage: true });
      
      // Compare screenshots
      expect(legacyScreenshot).toMatchSnapshot(`${page.name}-legacy-desktop.png`);
      expect(astroScreenshot).toMatchSnapshot(`${page.name}-astro-desktop.png`);
      
      // Pixel comparison
      const diff = await testPage.compareScreenshots(legacyScreenshot, astroScreenshot);
      expect(diff).toBeLessThan(0.01); // Less than 1% difference
    });

    test(`${page.name} - mobile comparison`, async ({ page: testPage }) => {
      testPage.setViewportSize({ width: 375, height: 667 });
      
      // Navigate to legacy version
      await testPage.goto(`http://localhost:${LEGACY_PORT}${page.legacyPath}`);
      await testPage.waitForLoadState('networkidle');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const legacyScreenshot = await testPage.screenshot({ fullPage: true });
      
      // Navigate to Astro version
      await testPage.goto(`http://localhost:${ASTRO_PORT}${page.astroPath}`);
      await testPage.waitForLoadState('networkidle');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const astroScreenshot = await testPage.screenshot({ fullPage: true });
      
      // Compare screenshots
      expect(legacyScreenshot).toMatchSnapshot(`${page.name}-legacy-mobile.png`);
      expect(astroScreenshot).toMatchSnapshot(`${page.name}-astro-mobile.png`);
      
      // Pixel comparison
      const diff = await testPage.compareScreenshots(legacyScreenshot, astroScreenshot);
      expect(diff).toBeLessThan(0.01); // Less than 1% difference
    });
  }
});
