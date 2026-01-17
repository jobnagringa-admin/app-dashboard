// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import compressor from "astro-compressor";

// Content Security Policy - allows necessary third-party resources
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://d3e54v103j8qbb.cloudfront.net https://cdn.jsdelivr.net https://mautic.jobnagringa.com.br https://analytics.ahrefs.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https: http:",
  "connect-src 'self' https://www.googletagmanager.com https://mautic.jobnagringa.com.br https://analytics.ahrefs.com https://*.google-analytics.com http://localhost:1337",
  "frame-src 'self' https://www.googletagmanager.com https://accounts.jobnagringa.com.br",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://accounts.jobnagringa.com.br",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests"
].join('; ');

// Security headers for all responses
const securityHeaders = {
  "Content-Security-Policy": cspDirectives,
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
};

// Cache control headers for static assets
// These should be applied at the server/CDN level (Nginx, Vercel, etc.)
// Listed here for documentation purposes
const cacheHeaders = {
  // Fonts - immutable, long cache (1 year)
  fonts: "public, max-age=31536000, immutable",
  // CSS/JS with hash - long cache (1 year, immutable since hashed)
  hashedAssets: "public, max-age=31536000, immutable",
  // Images - long cache (30 days)
  images: "public, max-age=2592000",
  // HTML - short cache, must revalidate
  html: "public, max-age=0, must-revalidate",
};
void cacheHeaders;

// https://astro.build/config
export default defineConfig({
  // Integrations
  integrations: [
    partytown({
      // Configuration for Partytown - runs third-party scripts in web worker
      // This eliminates main thread blocking from GTM, analytics, etc.
      config: {
        // Forward calls that need main thread access
        forward: [
          "dataLayer.push", // GTM dataLayer
          "mt", // Mautic tracking function
          "gtag", // Google Analytics gtag (if used)
        ],
        // Debug mode - enable in development for troubleshooting
        debug: process.env.NODE_ENV === "development",
      },
    }),
    // Sitemap generation - excludes member-only and utility pages
    sitemap({
      filter: (page) => {
        // Exclude member-only pages
        // Note: Pages previously under /jng/ are now at root level
        // Exclude checkout/payment pages
        if (page.includes('/checkout')) return false;
        if (page.includes('/paypal-checkout')) return false;
        if (page.includes('/init-checkout')) return false;
        if (page.includes('/order-confirmation')) return false;
        // Exclude utility pages
        if (page.includes('/401')) return false;
        if (page.includes('/access-denied')) return false;
        if (page.includes('/user-account')) return false;
        if (page.includes('/search')) return false;
        return true;
      },
    }),
    // Gzip/Brotli compression - MUST be last in integrations array
    compressor({
      gzip: true,
      brotli: true,
    }),
  ],

  site: "https://jobnagringa.com.br",

  // Output mode - server with adapter for SSR pages
  output: "server",

  // Node.js adapter for SSR pages
  adapter: node({
    mode: "standalone",
  }),

  // Image optimization configuration
  image: {
    // Enable image optimization service
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        // Limit image size for performance
        limitInputPixels: false,
      },
    },
    // Remote image domains (for external images)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.jobnagringa.com.br",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.githubusercontent.com",
      },
    ],
  },

  // Build configuration
  build: {
    // Assets folder name
    assets: "_assets",
    // Inline small assets (smaller than 4KB) - reduces requests for critical CSS
    inlineStylesheets: "auto",
    // Split client-side scripts for better caching
    format: "file",
  },

  // Development server configuration
  server: {
    port: 4321,
    host: true,
    headers: securityHeaders,
  },

  // Vite configuration
  vite: {
    css: {
      // PostCSS is auto-configured via postcss.config.cjs
      // PurgeCSS removes unused CSS in production (~69% reduction)
      // cssnano minifies the output
      devSourcemap: true,
    },
    build: {
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      // CSS code splitting - each page gets its own CSS bundle
      cssCodeSplit: true,
      // Minify output for production
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.log in production
          drop_debugger: true,
        },
      },
      // Rollup options for better code splitting
      rollupOptions: {
        output: {
          // Manual chunks for better caching
          manualChunks: (id) => {
            // Split Webflow CSS into its own chunk
            if (id.includes("webflow")) {
              return "webflow";
            }
            // Split component CSS
            if (id.includes("/components/")) {
              return "components";
            }
            // Vendor chunks for third-party code
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },
          // Asset file naming for cache busting
          assetFileNames: (assetInfo) => {
            const assetName =
              assetInfo.name ||
              assetInfo.originalFileName ||
              "";
            // CSS files get content hash for cache busting
            if (assetName.endsWith(".css")) {
              return "_assets/css/[name]-[hash][extname]";
            }
            // Fonts get their own folder with immutable cache
            if (/\.(woff2?|ttf|eot|otf)$/.test(assetName)) {
              return "_assets/fonts/[name]-[hash][extname]";
            }
            // Images get their own folder
            if (/\.(png|jpe?g|gif|svg|webp|avif|ico)$/i.test(assetName)) {
              return "_assets/images/[name]-[hash][extname]";
            }
            return "_assets/[name]-[hash][extname]";
          },
          // JS file naming for better caching
          chunkFileNames: "_assets/js/[name]-[hash].js",
          entryFileNames: "_assets/js/[name]-[hash].js",
        },
      },
    },
    server: {
      // Security headers for Vite dev server
      headers: securityHeaders,
    },
    // Optimize dependencies pre-bundling
    optimizeDeps: {
      // No dependencies to pre-bundle currently
    },
  },

  // Prefetch configuration for better performance
  prefetch: {
    prefetchAll: true,
  },

  // Experimental features
  experimental: {
    // Enable client prerender for faster navigation
    clientPrerender: true,
  },

  // i18n configuration for pt-BR
  i18n: {
    defaultLocale: "pt-br",
    locales: ["pt-br", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  // Redirects for legacy URLs if needed
  redirects: {},
});
