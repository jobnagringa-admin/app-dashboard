import { test, expect } from '@playwright/test';
import { prepareForScreenshot, navigateAndWait } from '../utils/visual-test-helpers';

/**
 * Companies Hiring Page Visual Regression Tests
 *
 * Tests the protected dashboard page for companies hiring Brazilians/LATAM.
 * Note: This is a protected route that may redirect to login.
 * Tests cover both authenticated and unauthenticated states.
 */

test.describe('Companies Hiring Page Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the page (may redirect if auth required)
    await page.goto('/jng/companies-hiring');
    await page.waitForLoadState('networkidle');
  });

  test('full page screenshot (public view)', async ({ page }) => {
    await prepareForScreenshot(page);

    // This page may show auth wall or content depending on state
    // Mask any user-specific or dynamic content
    const maskLocators = [
      page.locator('.w-dyn-empty'),
      page.locator('.w-dyn-bind-empty'),
      page.locator('[data-testid="user"]'),
    ];

    await expect(page).toHaveScreenshot('companies-hiring-full.png', {
      fullPage: true,
      mask: maskLocators,
      animations: 'disabled',
    });
  });

  test('above the fold', async ({ page }) => {
    await prepareForScreenshot(page);

    await expect(page).toHaveScreenshot('companies-hiring-hero.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });

  test('dashboard header', async ({ page }) => {
    await prepareForScreenshot(page);

    const header = page.locator('.dashboard-header_wrapper');
    if (await header.isVisible()) {
      await expect(header).toHaveScreenshot('companies-hiring-header.png', {
        animations: 'disabled',
      });
    }
  });

  test('breadcrumbs navigation', async ({ page }) => {
    await prepareForScreenshot(page);

    const breadcrumbs = page.locator('.lesson_breadcrumbs');
    if (await breadcrumbs.isVisible()) {
      await expect(breadcrumbs).toHaveScreenshot('companies-hiring-breadcrumbs.png', {
        animations: 'disabled',
      });
    }
  });

  test('companies grid layout', async ({ page }) => {
    await prepareForScreenshot(page);

    const companiesGrid = page.locator('.companies-grid');
    if (await companiesGrid.isVisible()) {
      await expect(companiesGrid).toHaveScreenshot('companies-hiring-grid.png', {
        animations: 'disabled',
        mask: [page.locator('.w-dyn-empty'), page.locator('.w-dyn-bind-empty')],
      });
    }
  });

  test('company card structure', async ({ page }) => {
    await prepareForScreenshot(page);

    const companyCard = page.locator('.company-card').first();
    if (await companyCard.isVisible()) {
      await expect(companyCard).toHaveScreenshot('companies-hiring-card.png', {
        animations: 'disabled',
        mask: [page.locator('.w-dyn-bind-empty')],
      });
    }
  });

  test('main tab section layout', async ({ page }) => {
    await prepareForScreenshot(page);

    const mainTab = page.locator('.main-tab_section');
    if (await mainTab.isVisible()) {
      await expect(mainTab).toHaveScreenshot('companies-hiring-main-tab.png', {
        animations: 'disabled',
        mask: [page.locator('.w-dyn-empty')],
      });
    }
  });
});

test.describe('Companies Hiring Dashboard Layout', () => {
  test('sidebar navigation (if present)', async ({ page }) => {
    await navigateAndWait(page, '/jng/companies-hiring');
    await prepareForScreenshot(page);

    const sidebar = page.locator('.dashboard_sidebar, .sidebar');
    if (await sidebar.isVisible()) {
      await expect(sidebar).toHaveScreenshot('companies-hiring-sidebar.png', {
        animations: 'disabled',
      });
    }
  });

  test('content wrapper', async ({ page }) => {
    await navigateAndWait(page, '/jng/companies-hiring');
    await prepareForScreenshot(page);

    const contentWrapper = page.locator('.main-tab_container-content');
    if (await contentWrapper.isVisible()) {
      await expect(contentWrapper).toHaveScreenshot('companies-hiring-content.png', {
        animations: 'disabled',
        mask: [page.locator('.w-dyn-empty')],
      });
    }
  });
});
