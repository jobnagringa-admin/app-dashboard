import { defineConfig, devices } from '@playwright/test';

/**
 * Visual Regression Testing Configuration
 *
 * Supports six viewport sizes for comprehensive device coverage:
 * - Mobile: 375px (iPhone SE)
 * - Mobile Large: 390px (iPhone 14/15)
 * - Tablet: 768px (iPad)
 * - Desktop: 1280px (Standard desktop)
 * - Desktop Medium: 1440px (MacBook Pro)
 * - Desktop Wide: 1920px (Full HD)
 *
 * Commands:
 * - bun run visual:test - Run visual regression tests (all viewports)
 * - bun run visual:update - Update baseline screenshots
 * - bun run visual:test:mobile - Run mobile viewport only
 * - bun run visual:test:mobile-large - Run mobile-large viewport only
 * - bun run visual:test:tablet - Run tablet viewport only
 * - bun run visual:test:desktop - Run desktop viewport only
 * - bun run visual:test:desktop-medium - Run desktop-medium viewport only
 * - bun run visual:test:desktop-wide - Run desktop-wide viewport only
 * - bun run visual:test:all-mobile - Run all mobile viewports
 * - bun run visual:test:all-desktop - Run all desktop viewports
 * - bun run visual:baseline - Generate/update baseline screenshots
 * - bun run visual:report - Open HTML report
 */

export default defineConfig({
  testDir: './tests',
  snapshotDir: './tests/__snapshots__',
  outputDir: './tests/__results__',

  // Run tests in parallel for speed
  fullyParallel: true,

  // Retry failed tests (helps with flaky visual tests)
  retries: process.env.CI ? 2 : 1,

  // Limit workers in CI for consistent results
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [['html', { outputFolder: './tests/__reports__' }], ['list']],

  // Global settings
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',

    // Screenshot settings for visual comparison
    screenshot: 'only-on-failure',
  },

  // Define projects for different viewports
  projects: [
    // Mobile viewport (375px - iPhone SE)
    {
      name: 'mobile',
      testMatch: /visual\/.*\.spec\.ts/,
      use: {
        ...devices['iPhone SE'],
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },

    // Mobile viewport (390px - iPhone 14/15)
    {
      name: 'mobile-large',
      testMatch: /visual\/.*\.spec\.ts/,
      use: {
        ...devices['iPhone 14'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },

    // Tablet viewport (768px - iPad)
    {
      name: 'tablet',
      testMatch: /visual\/.*\.spec\.ts/,
      use: {
        ...devices['iPad (gen 7)'],
        viewport: { width: 768, height: 1024 },
        deviceScaleFactor: 2,
      },
    },

    // Desktop viewport (1280px)
    {
      name: 'desktop',
      testMatch: /visual\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
      },
    },

    // Medium desktop viewport (1440px - MacBook Pro)
    {
      name: 'desktop-medium',
      testMatch: /visual\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
      },
    },

    // Wide desktop viewport (1920px) - for full-width layouts
    {
      name: 'desktop-wide',
      testMatch: /visual\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
      },
    },
  ],

  // Web server configuration
  webServer: {
    command: 'bun run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Global timeout settings
  timeout: 30000,
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      threshold: 0.2,
      animations: 'disabled',
    },
  },
});
