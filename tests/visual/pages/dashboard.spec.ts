import { test, expect } from '@playwright/test';
import { prepareForScreenshot, navigateAndWait } from '../utils/visual-test-helpers';

/**
 * Dashboard Pages Visual Regression Tests
 *
 * Tests the member dashboard and related pages including:
 * - Member dashboard (/jng/member-dashboard)
 * - My account (/jng/my-account)
 * - Onboarding (/jng/onboarding)
 *
 * Note: These are protected routes that may require authentication.
 * Tests cover both authenticated view (if accessible) and auth wall states.
 */

test.describe('Member Dashboard Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard page (may show auth wall if not logged in)
    await page.goto('/jng/member-dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('full page screenshot', async ({ page }) => {
    await prepareForScreenshot(page);

    // Mask user-specific and dynamic content
    const maskLocators = [
      page.locator('[data-testid="user"]'),
      page.locator('.user-name, .user-avatar'),
      page.locator('.w-dyn-empty'),
      page.locator('.w-dyn-bind-empty'),
      page.locator('[fs-cmsload-element]'),
    ];

    await expect(page).toHaveScreenshot('member-dashboard-full.png', {
      fullPage: true,
      mask: maskLocators,
      animations: 'disabled',
    });
  });

  test('above the fold', async ({ page }) => {
    await prepareForScreenshot(page);

    await expect(page).toHaveScreenshot('member-dashboard-hero.png', {
      fullPage: false,
      animations: 'disabled',
      mask: [page.locator('.user-name, .user-avatar')],
    });
  });

  test('dashboard header', async ({ page }) => {
    await prepareForScreenshot(page);

    const header = page.locator('.dashboard-header_wrapper, .dashboard-header').first();
    if (await header.isVisible()) {
      await expect(header).toHaveScreenshot('member-dashboard-header.png', {
        animations: 'disabled',
        mask: [page.locator('.user-name')],
      });
    }
  });

  test('sidebar navigation', async ({ page }) => {
    await prepareForScreenshot(page);

    const sidebar = page.locator('.dashboard_sidebar, .sidebar, [class*="sidebar"]').first();
    if (await sidebar.isVisible()) {
      await expect(sidebar).toHaveScreenshot('member-dashboard-sidebar.png', {
        animations: 'disabled',
      });
    }
  });

  test('main content area', async ({ page }) => {
    await prepareForScreenshot(page);

    const mainContent = page.locator('.main-tab_container-content, .dashboard-content').first();
    if (await mainContent.isVisible()) {
      await expect(mainContent).toHaveScreenshot('member-dashboard-content.png', {
        animations: 'disabled',
        mask: [page.locator('.w-dyn-empty')],
      });
    }
  });

  test('quick links section', async ({ page }) => {
    await prepareForScreenshot(page);

    const quickLinks = page.locator('.quick-links, [class*="quick-link"]').first();
    if (await quickLinks.isVisible()) {
      await expect(quickLinks).toHaveScreenshot('member-dashboard-quicklinks.png', {
        animations: 'disabled',
      });
    }
  });

  test('breadcrumbs navigation', async ({ page }) => {
    await prepareForScreenshot(page);

    const breadcrumbs = page.locator('.lesson_breadcrumbs, .breadcrumb').first();
    if (await breadcrumbs.isVisible()) {
      await expect(breadcrumbs).toHaveScreenshot('member-dashboard-breadcrumbs.png', {
        animations: 'disabled',
      });
    }
  });

  test('tab navigation', async ({ page }) => {
    await prepareForScreenshot(page);

    const tabs = page.locator('.main-tab_section, .tab-navigation').first();
    if (await tabs.isVisible()) {
      await expect(tabs).toHaveScreenshot('member-dashboard-tabs.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('My Account Page Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/jng/my-account');
    await page.waitForLoadState('networkidle');
  });

  test('full page screenshot', async ({ page }) => {
    await prepareForScreenshot(page);

    const maskLocators = [
      page.locator('[data-testid="user"]'),
      page.locator('.user-name, .user-email'),
      page.locator('.w-dyn-empty'),
    ];

    await expect(page).toHaveScreenshot('my-account-full.png', {
      fullPage: true,
      mask: maskLocators,
      animations: 'disabled',
    });
  });

  test('above the fold', async ({ page }) => {
    await prepareForScreenshot(page);

    await expect(page).toHaveScreenshot('my-account-hero.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });

  test('account header section', async ({ page }) => {
    await prepareForScreenshot(page);

    const header = page.locator('.dashboard-header_wrapper, .account-header').first();
    if (await header.isVisible()) {
      await expect(header).toHaveScreenshot('my-account-header.png', {
        animations: 'disabled',
      });
    }
  });

  test('account form section', async ({ page }) => {
    await prepareForScreenshot(page);

    const form = page.locator('form, .account-form').first();
    if (await form.isVisible()) {
      await expect(form).toHaveScreenshot('my-account-form.png', {
        animations: 'disabled',
        mask: [page.locator('input[type="email"]'), page.locator('.user-email')],
      });
    }
  });
});

test.describe('Onboarding Page Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/jng/onboarding');
    await page.waitForLoadState('networkidle');
  });

  test('full page screenshot', async ({ page }) => {
    await prepareForScreenshot(page);

    await expect(page).toHaveScreenshot('onboarding-full.png', {
      fullPage: true,
      animations: 'disabled',
      mask: [page.locator('.w-dyn-empty')],
    });
  });

  test('above the fold', async ({ page }) => {
    await prepareForScreenshot(page);

    await expect(page).toHaveScreenshot('onboarding-hero.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });

  test('onboarding steps', async ({ page }) => {
    await prepareForScreenshot(page);

    const steps = page.locator('.onboarding-steps, [class*="step"]').first();
    if (await steps.isVisible()) {
      await expect(steps).toHaveScreenshot('onboarding-steps.png', {
        animations: 'disabled',
      });
    }
  });

  test('progress indicator', async ({ page }) => {
    await prepareForScreenshot(page);

    const progress = page.locator('.progress-indicator, .onboarding-progress').first();
    if (await progress.isVisible()) {
      await expect(progress).toHaveScreenshot('onboarding-progress.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('Dashboard Interactions', () => {
  test('sidebar link hover state', async ({ page }) => {
    await page.goto('/jng/member-dashboard');
    await page.waitForLoadState('networkidle');
    await prepareForScreenshot(page);

    const sidebarLink = page.locator('.sidebar-link, .nav-link').first();
    if (await sidebarLink.isVisible()) {
      await sidebarLink.hover();
      await expect(sidebarLink).toHaveScreenshot('dashboard-sidebar-link-hover.png', {
        animations: 'disabled',
      });
    }
  });

  test('tab button active state', async ({ page }) => {
    await page.goto('/jng/member-dashboard');
    await page.waitForLoadState('networkidle');
    await prepareForScreenshot(page);

    const activeTab = page.locator('.tab-button.is-active, .tab.active').first();
    if (await activeTab.isVisible()) {
      await expect(activeTab).toHaveScreenshot('dashboard-tab-active.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('Dashboard Responsive', () => {
  test('member dashboard responsive', async ({ page }, testInfo) => {
    await page.goto('/jng/member-dashboard');
    await page.waitForLoadState('networkidle');
    await prepareForScreenshot(page);

    await expect(page).toHaveScreenshot(`member-dashboard-responsive-${testInfo.project.name}.png`, {
      fullPage: true,
      animations: 'disabled',
      mask: [
        page.locator('.user-name'),
        page.locator('.w-dyn-empty'),
      ],
    });
  });

  test('sidebar responsive (desktop)', async ({ page }, testInfo) => {
    // Skip for mobile viewports where sidebar may be hidden
    if (testInfo.project.name.includes('mobile')) {
      test.skip();
      return;
    }

    await page.goto('/jng/member-dashboard');
    await page.waitForLoadState('networkidle');
    await prepareForScreenshot(page);

    const sidebar = page.locator('.dashboard_sidebar, .sidebar').first();
    if (await sidebar.isVisible()) {
      await expect(sidebar).toHaveScreenshot(`dashboard-sidebar-${testInfo.project.name}.png`, {
        animations: 'disabled',
      });
    }
  });

  test('my account responsive', async ({ page }, testInfo) => {
    await page.goto('/jng/my-account');
    await page.waitForLoadState('networkidle');
    await prepareForScreenshot(page);

    await expect(page).toHaveScreenshot(`my-account-responsive-${testInfo.project.name}.png`, {
      fullPage: true,
      animations: 'disabled',
      mask: [page.locator('.user-name, .user-email')],
    });
  });
});
