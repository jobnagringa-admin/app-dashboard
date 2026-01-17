import { test, expect } from '@playwright/test';
import { prepareForScreenshot, navigateAndWait } from '../utils/visual-test-helpers';

/**
 * Homepage Visual Regression Tests
 *
 * Tests the main landing page at multiple viewports.
 * Covers hero section, job search, partners section, and CTA sidebar.
 */

test.describe('Homepage Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await navigateAndWait(page, '/');
  });

  test('full page screenshot', async ({ page }) => {
    await prepareForScreenshot(page);

    // Mask dynamic content (job counts, loading states)
    const maskLocators = [
      page.locator('.text-color-primary').filter({ hasText: /vagas/ }),
      page.locator('.w-dyn-empty'),
      page.locator('.job-card_collection-list p'),
    ];

    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      mask: maskLocators,
      animations: 'disabled',
    });
  });

  test('hero section', async ({ page }) => {
    await prepareForScreenshot(page);

    // Screenshot just the hero/above-fold area
    await expect(page).toHaveScreenshot('homepage-hero.png', {
      fullPage: false,
      mask: [page.locator('.text-color-primary').filter({ hasText: /vagas/ })],
      animations: 'disabled',
    });
  });

  test('job search form', async ({ page }) => {
    await prepareForScreenshot(page);

    const searchSection = page.locator('.section_job-search');
    await expect(searchSection).toBeVisible();
    await expect(searchSection).toHaveScreenshot('homepage-job-search.png', {
      animations: 'disabled',
    });
  });

  test('partners section', async ({ page }) => {
    await prepareForScreenshot(page);

    const partnersSection = page.locator('.section_home-partners');
    await expect(partnersSection).toBeVisible();
    await expect(partnersSection).toHaveScreenshot('homepage-partners.png', {
      animations: 'disabled',
    });
  });

  test('sidebar CTA', async ({ page }) => {
    await prepareForScreenshot(page);

    const sidebarCTA = page.locator('.job-board_sidebar');
    await expect(sidebarCTA).toBeVisible();
    await expect(sidebarCTA).toHaveScreenshot('homepage-sidebar-cta.png', {
      animations: 'disabled',
    });
  });

  test('navigation bar', async ({ page }) => {
    await prepareForScreenshot(page);

    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible();
    await expect(navbar).toHaveScreenshot('homepage-navbar.png', {
      animations: 'disabled',
    });
  });

  test('footer', async ({ page }) => {
    await prepareForScreenshot(page);

    const footer = page.locator('footer.footer_section').first();
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await expect(footer).toHaveScreenshot('homepage-footer.png', {
      animations: 'disabled',
    });
  });
});

test.describe('Homepage Interactions', () => {
  test('job search input focus state', async ({ page }) => {
    await navigateAndWait(page, '/');
    await prepareForScreenshot(page);

    const searchInput = page.locator('.job-search_input');
    await searchInput.focus();

    await expect(searchInput).toHaveScreenshot('homepage-search-focused.png', {
      animations: 'disabled',
    });
  });

  test('job level select element', async ({ page }) => {
    await navigateAndWait(page, '/');
    await prepareForScreenshot(page);

    // Screenshot the select element in its default state
    // Note: Native select dropdowns can't be reliably screenshot when open
    const selectDropdown = page.locator('.job-search_select.input_select');
    await expect(selectDropdown).toBeVisible();
    await expect(selectDropdown).toHaveScreenshot('homepage-level-select.png', {
      animations: 'disabled',
    });
  });
});
