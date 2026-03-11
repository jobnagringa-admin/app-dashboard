import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Visual regression tests for main pages
 * Compares Astro pages with legacy HTML pages
 */

const mainPages = [
  { name: 'index', path: '/' },
  { name: 'course', path: '/course' },
  { name: 'partners', path: '/partners' },
  { name: 'onboarding', path: '/onboarding' },
  { name: 'profile', path: '/profile' },
];

async function openPageForScreenshot(testPage: Page, path: string) {
  await testPage.goto(path, { waitUntil: 'domcontentloaded' });
  await testPage.waitForTimeout(1000);
}

test.describe('Main Pages Visual Regression', () => {
  for (const page of mainPages) {
    test(`${page.name} - desktop`, async ({ page: testPage }) => {
      await openPageForScreenshot(testPage, page.path);

      const screenshot = await testPage.screenshot({ fullPage: true });
      expect(screenshot).toMatchSnapshot(`${page.name}-desktop.png`);
    });

    test(`${page.name} - mobile`, async ({ page: testPage }) => {
      await testPage.setViewportSize({ width: 375, height: 667 });
      await openPageForScreenshot(testPage, page.path);

      const screenshot = await testPage.screenshot({ fullPage: true });
      expect(screenshot).toMatchSnapshot(`${page.name}-mobile.png`);
    });
  }
});
