import { test, expect } from '@playwright/test';
import { prepareForScreenshot, navigateAndWait } from '../utils/visual-test-helpers';

/**
 * Blog Pages Visual Regression Tests
 *
 * Tests the blog listing page and blog article pages.
 * Covers featured posts, post grid, filters, and pagination.
 */

test.describe('Blog Listing Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateAndWait(page, '/blog');
  });

  test('full page screenshot', async ({ page }) => {
    await prepareForScreenshot(page);

    // Mask dynamic CMS content
    const maskLocators = [
      page.locator('.w-dyn-empty'),
      page.locator('.w-dyn-bind-empty'),
      page.locator('[fs-cmsload-element]'),
    ];

    await expect(page).toHaveScreenshot('blog-listing-full.png', {
      fullPage: true,
      mask: maskLocators,
      animations: 'disabled',
    });
  });

  test('above the fold', async ({ page }) => {
    await prepareForScreenshot(page);

    await expect(page).toHaveScreenshot('blog-listing-hero.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });

  test('blog header section', async ({ page }) => {
    await prepareForScreenshot(page);

    const header = page.locator('.blog_header');
    await expect(header).toBeVisible();
    await expect(header).toHaveScreenshot('blog-header.png', {
      animations: 'disabled',
    });
  });

  test('featured post section', async ({ page }) => {
    await prepareForScreenshot(page);

    const featured = page.locator('.blog_featured');
    await expect(featured).toBeVisible();
    await expect(featured).toHaveScreenshot('blog-featured.png', {
      animations: 'disabled',
      mask: [page.locator('.w-dyn-empty'), page.locator('.w-dyn-bind-empty')],
    });
  });

  test('filter buttons', async ({ page }) => {
    await prepareForScreenshot(page);

    const filters = page.locator('.blog_filters');
    await expect(filters).toBeVisible();
    await expect(filters).toHaveScreenshot('blog-filters.png', {
      animations: 'disabled',
    });
  });

  test('blog post grid', async ({ page }) => {
    await prepareForScreenshot(page);

    const grid = page.locator('.blog_grid');
    await expect(grid).toBeVisible();
    await expect(grid).toHaveScreenshot('blog-grid.png', {
      animations: 'disabled',
      mask: [page.locator('.w-dyn-empty')],
    });
  });

  test('pagination controls', async ({ page }) => {
    await prepareForScreenshot(page);

    const pagination = page.locator('.blog_pagination');
    await expect(pagination).toBeVisible();
    await expect(pagination).toHaveScreenshot('blog-pagination.png', {
      animations: 'disabled',
    });
  });

  test('newsletter section', async ({ page }) => {
    await prepareForScreenshot(page);

    const newsletter = page.locator('.blog_newsletter-section');
    await expect(newsletter).toBeVisible();
    await expect(newsletter).toHaveScreenshot('blog-newsletter.png', {
      animations: 'disabled',
    });
  });
});

test.describe('Blog Filter Interactions', () => {
  test('filter button hover state', async ({ page }) => {
    await navigateAndWait(page, '/blog');
    await prepareForScreenshot(page);

    const filterButton = page.locator('.blog_filter-button').first();
    await filterButton.hover();

    await expect(filterButton).toHaveScreenshot('blog-filter-hover.png', {
      animations: 'disabled',
    });
  });

  test('filter button active state', async ({ page }) => {
    await navigateAndWait(page, '/blog');
    await prepareForScreenshot(page);

    const activeFilter = page.locator('.blog_filter-button.is-active');
    await expect(activeFilter).toHaveScreenshot('blog-filter-active.png', {
      animations: 'disabled',
    });
  });
});

test.describe('Blog Card Interactions', () => {
  test('blog card hover state', async ({ page }) => {
    await navigateAndWait(page, '/blog');
    await prepareForScreenshot(page);

    const blogCard = page.locator('.blog_card').first();
    await blogCard.hover();

    await expect(blogCard).toHaveScreenshot('blog-card-hover.png', {
      animations: 'disabled',
    });
  });
});
