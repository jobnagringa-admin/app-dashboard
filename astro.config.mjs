// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  site: "https://jobnagringa.com.br",

  // Output mode - server with adapter for SSR pages
  output: "server",

  // Node.js adapter for SSR pages
  adapter: node({
    mode: "standalone",
  }),

  // Build configuration
  build: {
    // Assets folder name
    assets: "_assets",
    // Inline small assets
    inlineStylesheets: "auto",
  },

  // Development server configuration
  server: {
    port: 4321,
    host: true,
  },

  // Vite configuration
  vite: {
    css: {
      preprocessorOptions: {
        // Add any CSS preprocessor options here
      },
    },
    build: {
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
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
  redirects: {
    // Add redirects here as needed
    // '/old-path': '/new-path',
  },
});
