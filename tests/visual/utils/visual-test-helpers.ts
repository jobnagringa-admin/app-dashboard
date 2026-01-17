import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Visual Test Helpers
 *
 * Utilities for consistent visual regression testing across all pages.
 */

/**
 * Common selectors for dynamic content that should be masked/ignored
 */
export const DYNAMIC_CONTENT_SELECTORS = {
  // Time-based content
  timestamps: '[data-testid="timestamp"], .timestamp, time',
  // Dynamic counts/numbers
  counters: '[data-testid="count"], .job-count, .counter',
  // Loading states
  loaders: '.loading, .skeleton, [data-loading]',
  // User-specific content
  userContent: '[data-testid="user-name"], .user-avatar',
  // Ads and third-party widgets
  thirdParty: 'iframe, .ad-container, [data-ad]',
  // Finsweet CMS dynamic content
  cmsContent: '[fs-cmsload-element], .w-dyn-bind-empty',
};

/**
 * Regions to mask during visual comparison (for dynamic content)
 */
export const MASK_REGIONS = [
  // Job counts that change frequently
  { selector: '.text-color-primary:has-text("vagas")' },
  // Date/time displays
  { selector: 'time, [datetime]' },
  // Loading placeholders
  { selector: '.w-dyn-empty' },
];

/**
 * Wait for page to be fully loaded and stable
 */
export async function waitForPageStable(page: Page): Promise<void> {
  // Wait for DOM content to load (more reliable than networkidle)
  await page.waitForLoadState('domcontentloaded');

  // Wait for any animations to complete
  await page.waitForTimeout(1000);

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);

  // Wait for visible images to load (with timeout)
  await page
    .waitForFunction(
      () => {
        const images = Array.from(document.images).filter((img) => {
          const rect = img.getBoundingClientRect();
          return rect.top < window.innerHeight && rect.bottom > 0;
        });
        return images.every((img) => img.complete || img.naturalWidth > 0);
      },
      { timeout: 5000 }
    )
    .catch(() => {
      // Continue even if some images don't load
    });
}

/**
 * Disable all animations and transitions for consistent screenshots
 */
export async function disableAnimations(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        scroll-behavior: auto !important;
      }
    `,
  });
}

/**
 * Hide dynamic content that changes between runs
 */
export async function hideDynamicContent(page: Page): Promise<void> {
  const selectors = Object.values(DYNAMIC_CONTENT_SELECTORS).join(', ');

  await page.addStyleTag({
    content: `
      ${selectors} {
        visibility: hidden !important;
      }
    `,
  });
}

/**
 * Prepare page for visual screenshot
 */
export async function prepareForScreenshot(page: Page): Promise<void> {
  await waitForPageStable(page);
  await disableAnimations(page);
}

/**
 * Take a full-page screenshot with consistent settings
 */
export async function takeFullPageScreenshot(
  page: Page,
  name: string,
  options: {
    mask?: { selector: string }[];
    hideDynamic?: boolean;
  } = {}
): Promise<void> {
  await prepareForScreenshot(page);

  if (options.hideDynamic) {
    await hideDynamicContent(page);
  }

  const maskLocators = options.mask?.map((m) => page.locator(m.selector)) || [];

  await expect(page).toHaveScreenshot(`${name}.png`, {
    fullPage: true,
    mask: maskLocators,
    animations: 'disabled',
  });
}

/**
 * Take an above-the-fold screenshot (viewport only)
 */
export async function takeViewportScreenshot(
  page: Page,
  name: string,
  options: {
    mask?: { selector: string }[];
  } = {}
): Promise<void> {
  await prepareForScreenshot(page);

  const maskLocators = options.mask?.map((m) => page.locator(m.selector)) || [];

  await expect(page).toHaveScreenshot(`${name}-viewport.png`, {
    fullPage: false,
    mask: maskLocators,
    animations: 'disabled',
  });
}

/**
 * Screenshot a specific component/section
 */
export async function takeComponentScreenshot(
  page: Page,
  selector: string,
  name: string
): Promise<void> {
  await prepareForScreenshot(page);

  const element = page.locator(selector);
  await expect(element).toBeVisible();
  await expect(element).toHaveScreenshot(`${name}.png`, {
    animations: 'disabled',
  });
}

/**
 * Test responsive behavior by taking screenshots at key breakpoints
 */
export interface ViewportConfig {
  name: string;
  width: number;
  height: number;
}

export const VIEWPORTS: ViewportConfig[] = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'mobile-large', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'desktop-medium', width: 1440, height: 900 },
  { name: 'desktop-wide', width: 1920, height: 1080 },
];

/**
 * Navigate to page and wait for stable state
 */
export async function navigateAndWait(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await waitForPageStable(page);
}

/**
 * Scroll to bottom of page to trigger lazy-loaded content
 */
export async function scrollToLoadAll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 500;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 100);
    });
  });

  // Wait for any lazy-loaded content
  await page.waitForTimeout(1000);
}
