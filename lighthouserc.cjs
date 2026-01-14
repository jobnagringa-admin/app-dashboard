/**
 * Lighthouse CI Configuration
 * @see https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md
 */

module.exports = {
  ci: {
    collect: {
      // For SSR Astro apps, we need to start the server first
      startServerCommand: "node ./dist/server/entry.mjs",
      startServerReadyPattern: "Listening on",
      startServerReadyTimeout: 30000,

      // URLs to test
      url: ["http://localhost:4321/"],

      // Number of runs per URL for more accurate results
      numberOfRuns: 3,

      // Chrome flags for headless mode (required for CI/WSL environments)
      chromePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
      chromeFlags: [
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-software-rasterizer",
        // Use a controlled user data directory for easier cleanup
        `--user-data-dir=${process.env.LIGHTHOUSE_USER_DATA_DIR || "/tmp/lighthouse-user-data"}`,
      ],

      // Chrome settings
      settings: {
        // Use desktop preset for consistent results
        preset: "desktop",
        // Throttling settings (use default for realistic mobile simulation)
        // throttlingMethod: 'devtools',
      },
    },

    assert: {
      // Custom assertions based on baseline measurements
      // All assertions set to "warn" to not block CI until targets are met
      // As scores improve, change to "error" to enforce standards
      assertions: {
        // Category score targets (all warnings for now)
        // Baseline: Performance=77, Accessibility=75, Best Practices=56, SEO=100
        "categories:performance": ["warn", { minScore: 0.9 }],
        "categories:accessibility": ["warn", { minScore: 1.0 }],
        "categories:best-practices": ["warn", { minScore: 1.0 }],
        "categories:seo": ["warn", { minScore: 1.0 }],

        // Core Web Vitals thresholds
        "first-contentful-paint": ["warn", { maxNumericValue: 2000 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 2500 }],
        "interactive": ["warn", { maxNumericValue: 3500 }],
        "speed-index": ["warn", { maxNumericValue: 3000 }],
        "total-blocking-time": ["warn", { maxNumericValue: 300 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.1 }],

        // Common issues to monitor
        "uses-responsive-images": "warn",
        "uses-optimized-images": "warn",
        "uses-text-compression": "warn",
        "render-blocking-resources": "warn",

        // Disable noisy recommended preset assertions
        // These will be addressed incrementally
        "aria-required-children": "warn",
        "link-name": "warn",
        "select-name": "warn",
        "target-size": "warn",
        "errors-in-console": "warn",
        "inspector-issues": "warn",
        "third-party-cookies": "warn",
        "unminified-javascript": "warn",
        "unused-javascript": "warn",
        "unsized-images": "warn",
        "lcp-lazy-loaded": "warn",
        "lcp-discovery-insight": "warn",
        "cls-culprits-insight": "warn",
        "document-latency-insight": "warn",
        "network-dependency-tree-insight": "warn",
      },
    },

    upload: {
      // Use temporary public storage for now
      // Later can be configured to use Lighthouse CI Server or other storage
      target: "temporary-public-storage",

      // GitHub status check settings (optional, for CI integration)
      // githubToken: process.env.GITHUB_TOKEN,
      // githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN,
    },
  },
};
