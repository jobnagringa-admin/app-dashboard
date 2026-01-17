import { test, expect } from '@playwright/test';
import { prepareForScreenshot, navigateAndWait } from '../utils/visual-test-helpers';

/**
 * Common Components Visual Regression Tests
 *
 * Tests shared components that appear across multiple pages:
 * - Navigation bar (various states)
 * - Footer
 * - Buttons and form elements
 * - Cards and badges
 */

test.describe('Navigation Component', () => {
  test('desktop navigation bar', async ({ page }) => {
    await navigateAndWait(page, '/');
    await prepareForScreenshot(page);

    const nav = page.locator('nav, .navbar').first();
    await expect(nav).toBeVisible();
    await expect(nav).toHaveScreenshot('nav-desktop.png', {
      animations: 'disabled',
    });
  });

  test('navigation logo', async ({ page }) => {
    await navigateAndWait(page, '/');
    await prepareForScreenshot(page);

    const logo = page.locator('.nav_logo, .navbar-brand, [class*="logo"]').first();
    if (await logo.isVisible()) {
      await expect(logo).toHaveScreenshot('nav-logo.png', {
        animations: 'disabled',
      });
    }
  });

  test('navigation links', async ({ page }) => {
    await navigateAndWait(page, '/');
    await prepareForScreenshot(page);

    const navLinks = page.locator('.nav_menu, .navbar-nav, [class*="nav-links"]').first();
    if (await navLinks.isVisible()) {
      await expect(navLinks).toHaveScreenshot('nav-links.png', {
        animations: 'disabled',
      });
    }
  });

  test('navigation CTA buttons', async ({ page }) => {
    await navigateAndWait(page, '/');
    await prepareForScreenshot(page);

    const navCTA = page.locator('.nav_button-wrapper, .navbar-cta').first();
    if (await navCTA.isVisible()) {
      await expect(navCTA).toHaveScreenshot('nav-cta.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('Footer Component', () => {
  test('full footer', async ({ page }) => {
    await navigateAndWait(page, '/');
    await prepareForScreenshot(page);

    const footer = page.locator('footer.footer_section').first();
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await expect(footer).toHaveScreenshot('footer-full.png', {
      animations: 'disabled',
    });
  });

  test('footer on blog page', async ({ page }) => {
    await navigateAndWait(page, '/blog');
    await prepareForScreenshot(page);

    const footer = page.locator('footer.footer_section').first();
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await expect(footer).toHaveScreenshot('footer-blog.png', {
      animations: 'disabled',
    });
  });

  test('footer on parcerias page', async ({ page }) => {
    await navigateAndWait(page, '/parcerias');
    await prepareForScreenshot(page);

    const footer = page.locator('footer.footer_section').first();
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await expect(footer).toHaveScreenshot('footer-parcerias.png', {
      animations: 'disabled',
    });
  });
});

test.describe('Button Components', () => {
  test('primary button', async ({ page }) => {
    await navigateAndWait(page, '/');
    await prepareForScreenshot(page);

    const primaryButton = page.locator('.button.w-button, .button:not(.is-secondary)').first();
    if (await primaryButton.isVisible()) {
      await expect(primaryButton).toHaveScreenshot('button-primary.png', {
        animations: 'disabled',
      });
    }
  });

  test('secondary button', async ({ page }) => {
    await navigateAndWait(page, '/');
    await prepareForScreenshot(page);

    const secondaryButton = page.locator('.button.is-secondary').first();
    if (await secondaryButton.isVisible()) {
      await expect(secondaryButton).toHaveScreenshot('button-secondary.png', {
        animations: 'disabled',
      });
    }
  });

  test('button hover states', async ({ page }) => {
    await navigateAndWait(page, '/');
    await prepareForScreenshot(page);

    const button = page.locator('.button.w-button').first();
    if (await button.isVisible()) {
      await button.hover();
      await expect(button).toHaveScreenshot('button-hover.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('Form Components', () => {
  test('input field', async ({ page }) => {
    await navigateAndWait(page, '/');
    await prepareForScreenshot(page);

    const input = page.locator('input.w-input, .input_field').first();
    if (await input.isVisible()) {
      await expect(input).toHaveScreenshot('input-default.png', {
        animations: 'disabled',
      });
    }
  });

  test('input field focused', async ({ page }) => {
    await navigateAndWait(page, '/');
    await prepareForScreenshot(page);

    const input = page.locator('input.w-input, .input_field').first();
    if (await input.isVisible()) {
      await input.focus();
      await expect(input).toHaveScreenshot('input-focused.png', {
        animations: 'disabled',
      });
    }
  });

  test('select dropdown', async ({ page }) => {
    await navigateAndWait(page, '/');
    await prepareForScreenshot(page);

    const select = page.locator('select.w-select, .input_select').first();
    if (await select.isVisible()) {
      await expect(select).toHaveScreenshot('select-default.png', {
        animations: 'disabled',
      });
    }
  });

  test('checkbox component', async ({ page }) => {
    await navigateAndWait(page, '/');
    await prepareForScreenshot(page);

    const checkbox = page.locator('.w-checkbox, [type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await expect(checkbox).toHaveScreenshot('checkbox-default.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('Card Components', () => {
  test('sidebar CTA card', async ({ page }) => {
    await navigateAndWait(page, '/');
    await prepareForScreenshot(page);

    const ctaCard = page.locator('.sidebar-cta-primary').first();
    if (await ctaCard.isVisible()) {
      await expect(ctaCard).toHaveScreenshot('card-sidebar-cta.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('Typography', () => {
  test('heading styles on homepage', async ({ page }) => {
    await navigateAndWait(page, '/');
    await prepareForScreenshot(page);

    const h2 = page.locator('.heading-style-h2, h2').first();
    if (await h2.isVisible()) {
      await expect(h2).toHaveScreenshot('typography-h2.png', {
        animations: 'disabled',
      });
    }
  });

  test('heading styles on blog', async ({ page }) => {
    await navigateAndWait(page, '/blog');
    await prepareForScreenshot(page);

    const h1 = page.locator('.heading-style-h1, h1').first();
    if (await h1.isVisible()) {
      await expect(h1).toHaveScreenshot('typography-h1-blog.png', {
        animations: 'disabled',
      });
    }
  });
});
