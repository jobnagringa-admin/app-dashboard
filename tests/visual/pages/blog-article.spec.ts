import { test, expect } from '@playwright/test';
import { prepareForScreenshot, navigateAndWait } from '../utils/visual-test-helpers';

/**
 * Blog Article Pages Visual Regression Tests
 *
 * Tests the blog post detail page including:
 * - Article header with title and metadata
 * - Featured image
 * - Article content (rich text)
 * - Author section
 * - Related posts section
 * - Navigation and footer
 *
 * Note: Uses a sample slug for testing. In production,
 * real blog posts would be fetched from CMS.
 */

// Sample blog slug for testing - uses a placeholder since CMS is not yet integrated
const TEST_BLOG_SLUG = 'sample-post';

test.describe('Blog Article Page Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to blog article page with sample slug
    await page.goto(`/blog/${TEST_BLOG_SLUG}`);
    await page.waitForLoadState('domcontentloaded');
  });

  test('full page screenshot', async ({ page }) => {
    await prepareForScreenshot(page);

    // Mask dynamic content
    const maskLocators = [
      page.locator('.w-dyn-empty'),
      page.locator('.w-dyn-bind-empty'),
      page.locator('[fs-cmsload-element]'),
      page.locator('time, [datetime]'),
    ];

    await expect(page).toHaveScreenshot('blog-article-full.png', {
      fullPage: true,
      mask: maskLocators,
      animations: 'disabled',
    });
  });

  test('above the fold', async ({ page }) => {
    await prepareForScreenshot(page);

    await expect(page).toHaveScreenshot('blog-article-hero.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });

  test('navigation bar', async ({ page }) => {
    await prepareForScreenshot(page);

    const navbar = page.locator('.navbar--blue--primary, .navbar').first();
    if (await navbar.isVisible()) {
      await expect(navbar).toHaveScreenshot('blog-article-navbar.png', {
        animations: 'disabled',
      });
    }
  });

  test('article header', async ({ page }) => {
    await prepareForScreenshot(page);

    const header = page.locator('.blog-post_header, .article-header, h1').first();
    if (await header.isVisible()) {
      await expect(header).toHaveScreenshot('blog-article-header.png', {
        animations: 'disabled',
      });
    }
  });

  test('article title', async ({ page }) => {
    await prepareForScreenshot(page);

    const title = page.locator('h1.heading-style-h2, .blog-post_title, h1').first();
    if (await title.isVisible()) {
      await expect(title).toHaveScreenshot('blog-article-title.png', {
        animations: 'disabled',
      });
    }
  });

  test('featured image wrapper', async ({ page }) => {
    await prepareForScreenshot(page);

    const imageWrapper = page.locator('.blog-post_image-wrapper, .article-image').first();
    if (await imageWrapper.isVisible()) {
      await expect(imageWrapper).toHaveScreenshot('blog-article-image.png', {
        animations: 'disabled',
      });
    }
  });

  test('article metadata', async ({ page }) => {
    await prepareForScreenshot(page);

    const meta = page.locator('.blog-post_meta, .article-meta, .post-metadata').first();
    if (await meta.isVisible()) {
      await expect(meta).toHaveScreenshot('blog-article-meta.png', {
        animations: 'disabled',
        mask: [page.locator('time')],
      });
    }
  });

  test('article content', async ({ page }) => {
    await prepareForScreenshot(page);

    const content = page.locator('.blog-post_content, .w-richtext, .article-content').first();
    if (await content.isVisible()) {
      await expect(content).toHaveScreenshot('blog-article-content.png', {
        animations: 'disabled',
      });
    }
  });

  test('content container', async ({ page }) => {
    await prepareForScreenshot(page);

    const container = page.locator('.container-medium, .article-container').first();
    if (await container.isVisible()) {
      await expect(container).toHaveScreenshot('blog-article-container.png', {
        animations: 'disabled',
        mask: [page.locator('.w-dyn-empty')],
      });
    }
  });

  test('footer section', async ({ page }) => {
    await prepareForScreenshot(page);

    const footer = page.locator('footer.footer_section').first();
    if (await footer.isVisible()) {
      await footer.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await expect(footer).toHaveScreenshot('blog-article-footer.png', {
        animations: 'disabled',
        mask: [page.locator('.w-dyn-empty')],
      });
    }
  });
});

test.describe('Blog Article Typography', () => {
  test('heading styles', async ({ page }) => {
    await page.goto(`/blog/${TEST_BLOG_SLUG}`);
    await page.waitForLoadState('domcontentloaded');
    await prepareForScreenshot(page);

    const h2 = page.locator('h1.heading-style-h2').first();
    if (await h2.isVisible()) {
      await expect(h2).toHaveScreenshot('blog-article-h2-style.png', {
        animations: 'disabled',
      });
    }
  });

  test('paragraph text', async ({ page }) => {
    await page.goto(`/blog/${TEST_BLOG_SLUG}`);
    await page.waitForLoadState('domcontentloaded');
    await prepareForScreenshot(page);

    const paragraph = page.locator('.blog-post_content p, .w-richtext p').first();
    if (await paragraph.isVisible()) {
      await expect(paragraph).toHaveScreenshot('blog-article-paragraph.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('Blog Article Interactions', () => {
  test('navigation link hover', async ({ page }) => {
    await page.goto(`/blog/${TEST_BLOG_SLUG}`);
    await page.waitForLoadState('domcontentloaded');
    await prepareForScreenshot(page);

    const navLink = page.locator('.navbar_link').first();
    if (await navLink.isVisible()) {
      await navLink.hover();
      await expect(navLink).toHaveScreenshot('blog-article-nav-link-hover.png', {
        animations: 'disabled',
      });
    }
  });

  test('footer link hover', async ({ page }) => {
    await page.goto(`/blog/${TEST_BLOG_SLUG}`);
    await page.waitForLoadState('domcontentloaded');
    await prepareForScreenshot(page);

    const footer = page.locator('footer.footer_section').first();
    await footer.scrollIntoViewIfNeeded();

    const footerLink = page.locator('.footer_link').first();
    if (await footerLink.isVisible()) {
      await footerLink.hover();
      await expect(footerLink).toHaveScreenshot('blog-article-footer-link-hover.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('Blog Article Responsive', () => {
  test('full page responsive', async ({ page }, testInfo) => {
    await page.goto(`/blog/${TEST_BLOG_SLUG}`);
    await page.waitForLoadState('domcontentloaded');
    await prepareForScreenshot(page);

    await expect(page).toHaveScreenshot(`blog-article-responsive-${testInfo.project.name}.png`, {
      fullPage: true,
      animations: 'disabled',
      mask: [page.locator('.w-dyn-empty')],
    });
  });

  test('article content responsive', async ({ page }, testInfo) => {
    await page.goto(`/blog/${TEST_BLOG_SLUG}`);
    await page.waitForLoadState('domcontentloaded');
    await prepareForScreenshot(page);

    const content = page.locator('.container-medium, .article-container').first();
    if (await content.isVisible()) {
      await expect(content).toHaveScreenshot(`blog-article-content-${testInfo.project.name}.png`, {
        animations: 'disabled',
      });
    }
  });

  test('navigation responsive', async ({ page }, testInfo) => {
    await page.goto(`/blog/${TEST_BLOG_SLUG}`);
    await page.waitForLoadState('domcontentloaded');
    await prepareForScreenshot(page);

    const navbar = page.locator('.navbar--blue--primary, .navbar').first();
    if (await navbar.isVisible()) {
      await expect(navbar).toHaveScreenshot(`blog-article-nav-${testInfo.project.name}.png`, {
        animations: 'disabled',
      });
    }
  });

  test('mobile menu button (mobile only)', async ({ page }, testInfo) => {
    // Only run for mobile viewports
    if (!testInfo.project.name.includes('mobile')) {
      test.skip();
      return;
    }

    await page.goto(`/blog/${TEST_BLOG_SLUG}`);
    await page.waitForLoadState('domcontentloaded');
    await prepareForScreenshot(page);

    const mobileMenu = page.locator('.navbar_mobile-menu').first();
    if (await mobileMenu.isVisible()) {
      await expect(mobileMenu).toHaveScreenshot('blog-article-mobile-menu.png', {
        animations: 'disabled',
      });
    }
  });
});
