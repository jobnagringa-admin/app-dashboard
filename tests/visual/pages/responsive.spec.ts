import { test, expect } from '@playwright/test';
import { prepareForScreenshot, navigateAndWait } from '../utils/visual-test-helpers';

/**
 * Responsive Layout Visual Regression Tests
 *
 * Tests critical pages at all viewport sizes to ensure
 * responsive design works correctly across devices.
 *
 * Note: These tests run across all configured projects (mobile, tablet, desktop, desktop-wide)
 * so each test will generate screenshots at each viewport.
 */

test.describe('Homepage Responsive', () => {
  test('full page responsive', async ({ page }, testInfo) => {
    await navigateAndWait(page, '/');
    await prepareForScreenshot(page);

    await expect(page).toHaveScreenshot(`homepage-responsive-${testInfo.project.name}.png`, {
      fullPage: true,
      animations: 'disabled',
      mask: [
        page.locator('.text-color-primary').filter({ hasText: /vagas/ }),
        page.locator('.w-dyn-empty'),
      ],
    });
  });

  test('hero section responsive', async ({ page }, testInfo) => {
    await navigateAndWait(page, '/');
    await prepareForScreenshot(page);

    await expect(page).toHaveScreenshot(`homepage-hero-${testInfo.project.name}.png`, {
      fullPage: false,
      animations: 'disabled',
    });
  });
});

test.describe('Blog Page Responsive', () => {
  test('full page responsive', async ({ page }, testInfo) => {
    await navigateAndWait(page, '/blog');
    await prepareForScreenshot(page);

    await expect(page).toHaveScreenshot(`blog-responsive-${testInfo.project.name}.png`, {
      fullPage: true,
      animations: 'disabled',
      mask: [page.locator('.w-dyn-empty'), page.locator('[fs-cmsload-element]')],
    });
  });

  test('blog grid responsive', async ({ page }, testInfo) => {
    await navigateAndWait(page, '/blog');
    await prepareForScreenshot(page);

    const grid = page.locator('.blog_grid').first();
    await grid.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await expect(grid).toHaveScreenshot(`blog-grid-${testInfo.project.name}.png`, {
      animations: 'disabled',
      mask: [page.locator('.w-dyn-empty')],
    });
  });
});

test.describe('Parcerias Page Responsive', () => {
  test('full page responsive', async ({ page }, testInfo) => {
    await navigateAndWait(page, '/parcerias');
    await prepareForScreenshot(page);

    await expect(page).toHaveScreenshot(`parcerias-responsive-${testInfo.project.name}.png`, {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('partners grid responsive', async ({ page }, testInfo) => {
    await navigateAndWait(page, '/parcerias');
    await prepareForScreenshot(page);

    const grid = page.locator('.partners_grid');
    if (await grid.isVisible()) {
      await expect(grid).toHaveScreenshot(`partners-grid-${testInfo.project.name}.png`, {
        animations: 'disabled',
      });
    }
  });

  test('benefits grid responsive', async ({ page }, testInfo) => {
    await navigateAndWait(page, '/parcerias');
    await prepareForScreenshot(page);

    const grid = page.locator('.benefits_grid');
    if (await grid.isVisible()) {
      await expect(grid).toHaveScreenshot(`benefits-grid-${testInfo.project.name}.png`, {
        animations: 'disabled',
      });
    }
  });
});

test.describe('Navigation Responsive', () => {
  test('navigation bar responsive', async ({ page }, testInfo) => {
    await navigateAndWait(page, '/');
    await prepareForScreenshot(page);

    const nav = page.locator('nav, .navbar').first();
    if (await nav.isVisible()) {
      await expect(nav).toHaveScreenshot(`nav-${testInfo.project.name}.png`, {
        animations: 'disabled',
      });
    }
  });

  test('mobile menu toggle (mobile only)', async ({ page }, testInfo) => {
    // Only run for mobile viewport
    if (!testInfo.project.name.includes('mobile')) {
      test.skip();
      return;
    }

    await navigateAndWait(page, '/');
    await prepareForScreenshot(page);

    const menuToggle = page.locator('.menu-button, .nav_menu-button, [class*="hamburger"]').first();
    if (await menuToggle.isVisible()) {
      await expect(menuToggle).toHaveScreenshot('nav-mobile-toggle.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('Footer Responsive', () => {
  test('footer responsive', async ({ page }, testInfo) => {
    await navigateAndWait(page, '/');
    await prepareForScreenshot(page);

    const footer = page.locator('footer.footer_section').first();
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await expect(footer).toHaveScreenshot(`footer-${testInfo.project.name}.png`, {
      animations: 'disabled',
    });
  });
});

test.describe('Form Elements Responsive', () => {
  test('job search form responsive', async ({ page }, testInfo) => {
    await navigateAndWait(page, '/');
    await prepareForScreenshot(page);

    const searchForm = page.locator('.job-search_form, .section_job-search').first();
    if (await searchForm.isVisible()) {
      await expect(searchForm).toHaveScreenshot(`job-search-${testInfo.project.name}.png`, {
        animations: 'disabled',
      });
    }
  });

  test('newsletter form responsive', async ({ page }, testInfo) => {
    await navigateAndWait(page, '/blog');
    await prepareForScreenshot(page);

    const newsletterForm = page.locator('.blog_newsletter-form, .blog_newsletter-inputs').first();
    if (await newsletterForm.isVisible()) {
      await expect(newsletterForm).toHaveScreenshot(`newsletter-${testInfo.project.name}.png`, {
        animations: 'disabled',
      });
    }
  });
});
