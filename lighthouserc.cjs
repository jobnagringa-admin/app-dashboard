/**
 * Lighthouse CI Configuration
 *
 * Performance targets:
 * - Lighthouse Performance: > 90
 * - LCP: < 2.5s
 * - FID/INP: < 100ms
 * - CLS: < 0.1
 * - JavaScript: < 100 KB initial load
 * - CSS: < 50 KB initial load (critical path)
 *
 * Current baseline (Jan 2026 - Updated):
 * - Performance: 100 (all pages)
 * - Accessibility: 88-93 (homepage 88%, others 91-93%)
 * - Best Practices: 56 (third-party cookies, console errors)
 * - SEO: 100 (all pages)
 * - CLS: 0.000 (excellent)
 * - LCP: ~540ms average (excellent)
 * - TBT: 0ms (excellent)
 *
 * Page categories:
 * - Public: Homepage, Blog, Assine (subscription)
 * - Marketing: Parcerias, Ebook
 * - Members: /jng/* pages (auth-protected, tested separately)
 *
 * @see https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md
 */

module.exports = {
  ci: {
    collect: {
      // For SSR Astro apps, we need to start the server first
      startServerCommand: "node ./dist/server/entry.mjs",
      startServerReadyPattern: "Listening on",
      startServerReadyTimeout: 30000,

      // URLs to test - critical pages for performance monitoring
      // Note: /jng/* pages require auth but we can test the initial load
      url: [
        "http://localhost:4321/",           // Homepage (most critical)
        "http://localhost:4321/blog",       // Blog listing page
        "http://localhost:4321/assine",     // Subscription/conversion page
        "http://localhost:4321/parcerias",  // Partnerships page
        "http://localhost:4321/jng/jobs",   // Jobs listing (member area)
        "http://localhost:4321/ebook",      // Marketing page
        "http://localhost:4321/politicas",  // Policies page (simple content)
      ],

      // Number of runs per URL for more accurate results
      numberOfRuns: 3,

      // Chrome flags for headless mode (required for CI/WSL environments)
      chromePath: process.env.CHROME_PATH,
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
        // Skip audits that require network access
        skipAudits: ["uses-http2"],
      },
    },

    assert: {
      // Custom assertions based on baseline measurements
      // All assertions set to "warn" to not block CI until targets are met
      // As scores improve, change to "error" to enforce standards
      assertions: {
        // Category score targets (all warnings for now)
        // Target: Performance=90+, Accessibility=100, Best Practices=100, SEO=100
        "categories:performance": ["warn", { minScore: 0.9 }],
        "categories:accessibility": ["warn", { minScore: 1.0 }],
        "categories:best-practices": ["warn", { minScore: 1.0 }],
        "categories:seo": ["warn", { minScore: 1.0 }],

        // Core Web Vitals thresholds (Google's "good" thresholds)
        "first-contentful-paint": ["warn", { maxNumericValue: 1800 }],  // Target: < 1.8s
        "largest-contentful-paint": ["warn", { maxNumericValue: 2500 }], // Target: < 2.5s
        "interactive": ["warn", { maxNumericValue: 3500 }],              // Target: < 3.5s
        "speed-index": ["warn", { maxNumericValue: 3000 }],              // Target: < 3s
        "total-blocking-time": ["warn", { maxNumericValue: 200 }],       // Target: < 200ms (stricter for INP)
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.1 }],   // Target: < 0.1

        // Resource size budgets
        "resource-summary:script:size": ["warn", { maxNumericValue: 102400 }],  // 100 KB JS
        "resource-summary:stylesheet:size": ["warn", { maxNumericValue: 153600 }], // 150 KB CSS total
        "resource-summary:document:size": ["warn", { maxNumericValue: 51200 }],  // 50 KB HTML
        "resource-summary:total:size": ["warn", { maxNumericValue: 1048576 }],   // 1 MB total

        // Common issues to monitor
        "uses-responsive-images": "warn",
        "uses-optimized-images": "warn",
        "uses-text-compression": "warn",
        "render-blocking-resources": "warn",
        "efficient-animated-content": "warn",
        "uses-rel-preconnect": "warn",
        // Note: "uses-rel-preload" was deprecated in Lighthouse 10+ and removed

        // Image optimization assertions
        "modern-image-formats": "warn",
        "offscreen-images": "warn",

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

      // Performance budgets - stricter than assertions for proactive monitoring
      budgets: [
        {
          path: "/*",
          resourceSizes: [
            { resourceType: "script", budget: 100 },      // 100 KB JS
            { resourceType: "stylesheet", budget: 50 },   // 50 KB critical CSS
            { resourceType: "image", budget: 500 },       // 500 KB images per page
            { resourceType: "font", budget: 100 },        // 100 KB fonts
            { resourceType: "document", budget: 50 },     // 50 KB HTML
            { resourceType: "total", budget: 1000 },      // 1 MB total
          ],
          resourceCounts: [
            { resourceType: "script", budget: 10 },       // Max 10 JS files
            { resourceType: "stylesheet", budget: 5 },    // Max 5 CSS files
            { resourceType: "image", budget: 25 },        // Max 25 images
            { resourceType: "third-party", budget: 10 },  // Max 10 third-party requests
          ],
          timings: [
            { metric: "first-contentful-paint", budget: 1800 },
            { metric: "largest-contentful-paint", budget: 2500 },
            { metric: "interactive", budget: 3500 },
            { metric: "cumulative-layout-shift", budget: 0.1 },
            { metric: "total-blocking-time", budget: 200 },
          ],
        },
      ],
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
