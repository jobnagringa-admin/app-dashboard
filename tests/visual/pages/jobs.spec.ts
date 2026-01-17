import { test, expect } from '@playwright/test';
import { prepareForScreenshot, navigateAndWait } from '../utils/visual-test-helpers';

/**
 * Job Listing Pages Visual Regression Tests
 *
 * Tests the job listing pages including:
 * - Main jobs page (/jng/jobs)
 * - BRs only jobs page (/jng/jobs-brs-only)
 * - Jobs with Vista sponsors (/jng/jobs-with-vista-sponsors)
 *
 * Covers job cards, filters, pagination, and sidebar elements.
 */

test.describe('Jobs Page Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await navigateAndWait(page, '/jng/jobs');
  });

  test('full page screenshot', async ({ page }) => {
    await prepareForScreenshot(page);

    // Mask dynamic content (job counts, loading states, CMS content)
    const maskLocators = [
      page.locator('.text-color-primary').filter({ hasText: /vagas/ }),
      page.locator('.w-dyn-empty'),
      page.locator('.w-dyn-bind-empty'),
      page.locator('[fs-cmsload-element]'),
      page.locator('.job-card_collection-list p'),
    ];

    await expect(page).toHaveScreenshot('jobs-full.png', {
      fullPage: true,
      mask: maskLocators,
      animations: 'disabled',
    });
  });

  test('above the fold', async ({ page }) => {
    await prepareForScreenshot(page);

    await expect(page).toHaveScreenshot('jobs-hero.png', {
      fullPage: false,
      mask: [page.locator('.text-color-primary').filter({ hasText: /vagas/ })],
      animations: 'disabled',
    });
  });

  test('dashboard header', async ({ page }) => {
    await prepareForScreenshot(page);

    const header = page.locator('.dashboard-header_wrapper');
    if (await header.isVisible()) {
      await expect(header).toHaveScreenshot('jobs-header.png', {
        animations: 'disabled',
      });
    }
  });

  test('job filters section', async ({ page }) => {
    await prepareForScreenshot(page);

    const filters = page.locator('.job-filters, .filter-section, [class*="filter"]').first();
    if (await filters.isVisible()) {
      await expect(filters).toHaveScreenshot('jobs-filters.png', {
        animations: 'disabled',
      });
    }
  });

  test('job card structure', async ({ page }) => {
    await prepareForScreenshot(page);

    const jobCard = page.locator('.job-card, .job_card, [class*="job-card"]').first();
    if (await jobCard.isVisible()) {
      await expect(jobCard).toHaveScreenshot('jobs-card.png', {
        animations: 'disabled',
        mask: [page.locator('.w-dyn-bind-empty')],
      });
    }
  });

  test('jobs grid layout', async ({ page }) => {
    await prepareForScreenshot(page);

    const jobsGrid = page.locator('.jobs-grid, .job_collection-list, [class*="jobs-list"]').first();
    if (await jobsGrid.isVisible()) {
      await expect(jobsGrid).toHaveScreenshot('jobs-grid.png', {
        animations: 'disabled',
        mask: [
          page.locator('.w-dyn-empty'),
          page.locator('.w-dyn-bind-empty'),
        ],
      });
    }
  });

  test('sidebar section', async ({ page }) => {
    await prepareForScreenshot(page);

    const sidebar = page.locator('.job-board_sidebar, .sidebar, [class*="sidebar"]').first();
    if (await sidebar.isVisible()) {
      await expect(sidebar).toHaveScreenshot('jobs-sidebar.png', {
        animations: 'disabled',
      });
    }
  });

  test('pagination controls', async ({ page }) => {
    await prepareForScreenshot(page);

    const pagination = page.locator('.pagination, [class*="pagination"]').first();
    if (await pagination.isVisible()) {
      await expect(pagination).toHaveScreenshot('jobs-pagination.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('Jobs BRs Only Page Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await navigateAndWait(page, '/jng/jobs-brs-only');
  });

  test('full page screenshot', async ({ page }) => {
    await prepareForScreenshot(page);

    const maskLocators = [
      page.locator('.text-color-primary').filter({ hasText: /vagas/ }),
      page.locator('.w-dyn-empty'),
      page.locator('.w-dyn-bind-empty'),
      page.locator('[fs-cmsload-element]'),
    ];

    await expect(page).toHaveScreenshot('jobs-brs-only-full.png', {
      fullPage: true,
      mask: maskLocators,
      animations: 'disabled',
    });
  });

  test('above the fold', async ({ page }) => {
    await prepareForScreenshot(page);

    await expect(page).toHaveScreenshot('jobs-brs-only-hero.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });

  test('page header', async ({ page }) => {
    await prepareForScreenshot(page);

    const header = page.locator('.dashboard-header_wrapper, .page-header').first();
    if (await header.isVisible()) {
      await expect(header).toHaveScreenshot('jobs-brs-only-header.png', {
        animations: 'disabled',
      });
    }
  });

  test('job listing area', async ({ page }) => {
    await prepareForScreenshot(page);

    const listingArea = page.locator('.main-tab_container-content, .job-listing').first();
    if (await listingArea.isVisible()) {
      await expect(listingArea).toHaveScreenshot('jobs-brs-only-listing.png', {
        animations: 'disabled',
        mask: [page.locator('.w-dyn-empty')],
      });
    }
  });
});

test.describe('Jobs Vista Sponsors Page Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await navigateAndWait(page, '/jng/jobs-with-vista-sponsors');
  });

  test('full page screenshot', async ({ page }) => {
    await prepareForScreenshot(page);

    const maskLocators = [
      page.locator('.text-color-primary').filter({ hasText: /vagas/ }),
      page.locator('.w-dyn-empty'),
      page.locator('.w-dyn-bind-empty'),
      page.locator('[fs-cmsload-element]'),
    ];

    await expect(page).toHaveScreenshot('jobs-vista-full.png', {
      fullPage: true,
      mask: maskLocators,
      animations: 'disabled',
    });
  });

  test('above the fold', async ({ page }) => {
    await prepareForScreenshot(page);

    await expect(page).toHaveScreenshot('jobs-vista-hero.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });
});

test.describe('Jobs Page Interactions', () => {
  test('job card hover state', async ({ page }) => {
    await navigateAndWait(page, '/jng/jobs');
    await prepareForScreenshot(page);

    const jobCard = page.locator('.job-card, .job_card, [class*="job-card"]').first();
    if (await jobCard.isVisible()) {
      await jobCard.hover();
      await expect(jobCard).toHaveScreenshot('jobs-card-hover.png', {
        animations: 'disabled',
      });
    }
  });

  test('filter interaction', async ({ page }) => {
    await navigateAndWait(page, '/jng/jobs');
    await prepareForScreenshot(page);

    const filterSelect = page.locator('select, .filter-dropdown').first();
    if (await filterSelect.isVisible()) {
      await expect(filterSelect).toHaveScreenshot('jobs-filter-select.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('Jobs Page Responsive', () => {
  test('full page responsive', async ({ page }, testInfo) => {
    await navigateAndWait(page, '/jng/jobs');
    await prepareForScreenshot(page);

    await expect(page).toHaveScreenshot(`jobs-responsive-${testInfo.project.name}.png`, {
      fullPage: true,
      animations: 'disabled',
      mask: [
        page.locator('.text-color-primary').filter({ hasText: /vagas/ }),
        page.locator('.w-dyn-empty'),
        page.locator('[fs-cmsload-element]'),
      ],
    });
  });

  test('job grid responsive', async ({ page }, testInfo) => {
    await navigateAndWait(page, '/jng/jobs');
    await prepareForScreenshot(page);

    const grid = page.locator('.jobs-grid, .job_collection-list, [class*="jobs-list"]').first();
    if (await grid.isVisible()) {
      await grid.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await expect(grid).toHaveScreenshot(`jobs-grid-${testInfo.project.name}.png`, {
        animations: 'disabled',
        mask: [page.locator('.w-dyn-empty')],
      });
    }
  });
});
