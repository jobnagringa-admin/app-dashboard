import { test, expect } from '@playwright/test';
import { prepareForScreenshot, navigateAndWait } from '../utils/visual-test-helpers';

/**
 * Partnerships (Parcerias) Page Visual Regression Tests
 *
 * Tests the partnership page layout including:
 * - Hero section
 * - Partner logos grid
 * - Benefits section
 * - CTA section
 */

test.describe('Parcerias Page Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await navigateAndWait(page, '/parcerias');
  });

  test('full page screenshot', async ({ page }) => {
    await prepareForScreenshot(page);

    await expect(page).toHaveScreenshot('parcerias-full.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('above the fold', async ({ page }) => {
    await prepareForScreenshot(page);

    await expect(page).toHaveScreenshot('parcerias-hero.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });

  test('hero section', async ({ page }) => {
    await prepareForScreenshot(page);

    const hero = page.locator('.parcerias_hero');
    await expect(hero).toBeVisible();
    await expect(hero).toHaveScreenshot('parcerias-hero-section.png', {
      animations: 'disabled',
    });
  });

  test('current partners section', async ({ page }) => {
    await prepareForScreenshot(page);

    const partnersSection = page.locator('.parcerias_current');
    await expect(partnersSection).toBeVisible();
    await expect(partnersSection).toHaveScreenshot('parcerias-partners.png', {
      animations: 'disabled',
    });
  });

  test('partners grid layout', async ({ page }) => {
    await prepareForScreenshot(page);

    const partnersGrid = page.locator('.partners_grid');
    await expect(partnersGrid).toBeVisible();
    await expect(partnersGrid).toHaveScreenshot('parcerias-grid.png', {
      animations: 'disabled',
    });
  });

  test('individual partner card', async ({ page }) => {
    await prepareForScreenshot(page);

    const partnerCard = page.locator('.partner_card').first();
    await expect(partnerCard).toBeVisible();
    await expect(partnerCard).toHaveScreenshot('parcerias-card.png', {
      animations: 'disabled',
    });
  });

  test('benefits section', async ({ page }) => {
    await prepareForScreenshot(page);

    const benefitsSection = page.locator('.parcerias_benefits');
    await expect(benefitsSection).toBeVisible();
    await expect(benefitsSection).toHaveScreenshot('parcerias-benefits.png', {
      animations: 'disabled',
    });
  });

  test('benefits grid', async ({ page }) => {
    await prepareForScreenshot(page);

    const benefitsGrid = page.locator('.benefits_grid');
    await expect(benefitsGrid).toBeVisible();
    await expect(benefitsGrid).toHaveScreenshot('parcerias-benefits-grid.png', {
      animations: 'disabled',
    });
  });

  test('individual benefit card', async ({ page }) => {
    await prepareForScreenshot(page);

    const benefitCard = page.locator('.benefit_card').first();
    await expect(benefitCard).toBeVisible();
    await expect(benefitCard).toHaveScreenshot('parcerias-benefit-card.png', {
      animations: 'disabled',
    });
  });

  test('CTA section', async ({ page }) => {
    await prepareForScreenshot(page);

    const ctaSection = page.locator('.parcerias_cta');
    await expect(ctaSection).toBeVisible();
    await expect(ctaSection).toHaveScreenshot('parcerias-cta.png', {
      animations: 'disabled',
    });
  });
});

test.describe('Parcerias Interactions', () => {
  test('CTA button hover state', async ({ page }) => {
    await navigateAndWait(page, '/parcerias');
    await prepareForScreenshot(page);

    const ctaButton = page.locator('.parcerias_cta .button');
    await ctaButton.hover();

    await expect(ctaButton).toHaveScreenshot('parcerias-cta-button-hover.png', {
      animations: 'disabled',
    });
  });
});
