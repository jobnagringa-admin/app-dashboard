import { test, expect } from '@playwright/test';

/**
 * Visual regression tests for main pages
 * Compares Astro pages with legacy HTML pages
 */

const mainPages = [
  { name: 'index', path: '/jng/index' },
  { name: 'course', path: '/jng/course' },
  { name: 'jobs', path: '/jng/jobs' },
  { name: 'jobs-brs-only', path: '/jng/jobs-brs-only' },
  { name: 'jobs-with-vista-sponsors', path: '/jng/jobs-with-vista-sponsors' },
  { name: 'job-search', path: '/jng/job-search' },
  { name: 'member-dashboard', path: '/jng/member-dashboard' },
  { name: 'community', path: '/jng/community' },
  { name: 'partners', path: '/jng/partners' },
  { name: 'companies-hiring', path: '/jng/companies-hiring' },
  { name: 'resume-generator', path: '/jng/resume-generator' },
];

test.describe('Main Pages Visual Regression', () => {
  for (const page of mainPages) {
    test(`${page.name} - desktop`, async ({ page: testPage }) => {
      // Navigate to Astro version
      await testPage.goto(`http://localhost:4321${page.path}`);
      await testPage.waitForLoadState('networkidle');

      // Take screenshot
      await expect(testPage).toHaveScreenshot(`${page.name}-desktop.png`, {
        fullPage: true,
      });
    });

    test(`${page.name} - mobile`, async ({ page: testPage }) => {
      testPage.setViewportSize({ width: 375, height: 667 });
      await testPage.goto(`http://localhost:4321${page.path}`);
      await testPage.waitForLoadState('networkidle');

      await expect(testPage).toHaveScreenshot(`${page.name}-mobile.png`, {
        fullPage: true,
      });
    });
  }
});
