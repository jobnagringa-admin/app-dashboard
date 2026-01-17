import { test, expect } from '@playwright/test';
import { prepareForScreenshot, navigateAndWait } from '../utils/visual-test-helpers';

/**
 * Subscribe Page (Assine) Visual Regression Tests
 *
 * Tests the subscription/pricing page including:
 * - Hero section with main value proposition
 * - Pricing cards/plans
 * - Features list
 * - Testimonials section
 * - FAQ section
 * - CTA sections
 */

test.describe('Subscribe Page Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await navigateAndWait(page, '/assine');
  });

  test('full page screenshot', async ({ page }) => {
    await prepareForScreenshot(page);

    await expect(page).toHaveScreenshot('subscribe-full.png', {
      fullPage: true,
      animations: 'disabled',
      mask: [page.locator('.w-dyn-empty')],
    });
  });

  test('above the fold', async ({ page }) => {
    await prepareForScreenshot(page);

    await expect(page).toHaveScreenshot('subscribe-hero.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });

  test('hero section', async ({ page }) => {
    await prepareForScreenshot(page);

    const hero = page.locator('.hero-section, .subscribe_hero, [class*="hero"]').first();
    if (await hero.isVisible()) {
      await expect(hero).toHaveScreenshot('subscribe-hero-section.png', {
        animations: 'disabled',
      });
    }
  });

  test('pricing section', async ({ page }) => {
    await prepareForScreenshot(page);

    const pricing = page.locator('.pricing-section, .subscribe_pricing, [class*="pricing"]').first();
    if (await pricing.isVisible()) {
      await expect(pricing).toHaveScreenshot('subscribe-pricing.png', {
        animations: 'disabled',
      });
    }
  });

  test('pricing card', async ({ page }) => {
    await prepareForScreenshot(page);

    const pricingCard = page.locator('.pricing-card, .plan-card, [class*="pricing-card"]').first();
    if (await pricingCard.isVisible()) {
      await expect(pricingCard).toHaveScreenshot('subscribe-pricing-card.png', {
        animations: 'disabled',
      });
    }
  });

  test('features section', async ({ page }) => {
    await prepareForScreenshot(page);

    const features = page.locator('.features-section, .subscribe_features, [class*="features"]').first();
    if (await features.isVisible()) {
      await expect(features).toHaveScreenshot('subscribe-features.png', {
        animations: 'disabled',
      });
    }
  });

  test('benefits grid', async ({ page }) => {
    await prepareForScreenshot(page);

    const benefits = page.locator('.benefits-grid, .subscribe_benefits, [class*="benefit"]').first();
    if (await benefits.isVisible()) {
      await expect(benefits).toHaveScreenshot('subscribe-benefits.png', {
        animations: 'disabled',
      });
    }
  });

  test('testimonials section', async ({ page }) => {
    await prepareForScreenshot(page);

    const testimonials = page.locator('.testimonials-section, .subscribe_testimonials, [class*="testimonial"]').first();
    if (await testimonials.isVisible()) {
      await expect(testimonials).toHaveScreenshot('subscribe-testimonials.png', {
        animations: 'disabled',
      });
    }
  });

  test('FAQ section', async ({ page }) => {
    await prepareForScreenshot(page);

    const faq = page.locator('.faq-section, .subscribe_faq, [class*="faq"]').first();
    if (await faq.isVisible()) {
      await expect(faq).toHaveScreenshot('subscribe-faq.png', {
        animations: 'disabled',
      });
    }
  });

  test('CTA section', async ({ page }) => {
    await prepareForScreenshot(page);

    const cta = page.locator('.cta-section, .subscribe_cta, [class*="cta"]').first();
    if (await cta.isVisible()) {
      await expect(cta).toHaveScreenshot('subscribe-cta.png', {
        animations: 'disabled',
      });
    }
  });

  test('social proof section', async ({ page }) => {
    await prepareForScreenshot(page);

    const socialProof = page.locator('.social-proof, .logos-section, [class*="partners"]').first();
    if (await socialProof.isVisible()) {
      await expect(socialProof).toHaveScreenshot('subscribe-social-proof.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('Subscribe Page Interactions', () => {
  test('pricing card hover state', async ({ page }) => {
    await navigateAndWait(page, '/assine');
    await prepareForScreenshot(page);

    const pricingCard = page.locator('.pricing-card, .plan-card, [class*="pricing-card"]').first();
    if (await pricingCard.isVisible()) {
      await pricingCard.hover();
      await expect(pricingCard).toHaveScreenshot('subscribe-pricing-card-hover.png', {
        animations: 'disabled',
      });
    }
  });

  test('CTA button hover state', async ({ page }) => {
    await navigateAndWait(page, '/assine');
    await prepareForScreenshot(page);

    const ctaButton = page.locator('.button.w-button, [class*="cta-button"]').first();
    if (await ctaButton.isVisible()) {
      await ctaButton.hover();
      await expect(ctaButton).toHaveScreenshot('subscribe-cta-button-hover.png', {
        animations: 'disabled',
      });
    }
  });

  test('FAQ accordion default state', async ({ page }) => {
    await navigateAndWait(page, '/assine');
    await prepareForScreenshot(page);

    const faqItem = page.locator('.faq-item, .accordion-item, [class*="faq-item"]').first();
    if (await faqItem.isVisible()) {
      await expect(faqItem).toHaveScreenshot('subscribe-faq-item-closed.png', {
        animations: 'disabled',
      });
    }
  });

  test('FAQ accordion expanded state', async ({ page }) => {
    await navigateAndWait(page, '/assine');
    await prepareForScreenshot(page);

    const faqTrigger = page.locator('.faq-trigger, .accordion-trigger, [class*="faq-question"]').first();
    if (await faqTrigger.isVisible()) {
      await faqTrigger.click();
      await page.waitForTimeout(300);

      const faqItem = page.locator('.faq-item, .accordion-item, [class*="faq-item"]').first();
      await expect(faqItem).toHaveScreenshot('subscribe-faq-item-expanded.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('Subscribe Page Responsive', () => {
  test('full page responsive', async ({ page }, testInfo) => {
    await navigateAndWait(page, '/assine');
    await prepareForScreenshot(page);

    await expect(page).toHaveScreenshot(`subscribe-responsive-${testInfo.project.name}.png`, {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('pricing cards responsive', async ({ page }, testInfo) => {
    await navigateAndWait(page, '/assine');
    await prepareForScreenshot(page);

    const pricing = page.locator('.pricing-section, .subscribe_pricing, [class*="pricing"]').first();
    if (await pricing.isVisible()) {
      await pricing.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await expect(pricing).toHaveScreenshot(`subscribe-pricing-${testInfo.project.name}.png`, {
        animations: 'disabled',
      });
    }
  });

  test('features grid responsive', async ({ page }, testInfo) => {
    await navigateAndWait(page, '/assine');
    await prepareForScreenshot(page);

    const features = page.locator('.features-section, .subscribe_features, [class*="features"]').first();
    if (await features.isVisible()) {
      await features.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await expect(features).toHaveScreenshot(`subscribe-features-${testInfo.project.name}.png`, {
        animations: 'disabled',
      });
    }
  });

  test('testimonials responsive', async ({ page }, testInfo) => {
    await navigateAndWait(page, '/assine');
    await prepareForScreenshot(page);

    const testimonials = page.locator('.testimonials-section, .subscribe_testimonials, [class*="testimonial"]').first();
    if (await testimonials.isVisible()) {
      await testimonials.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await expect(testimonials).toHaveScreenshot(`subscribe-testimonials-${testInfo.project.name}.png`, {
        animations: 'disabled',
      });
    }
  });
});
