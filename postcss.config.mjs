/**
 * PostCSS Configuration - JobnaGringa Astro Migration
 *
 * This configuration enables CSS optimization for production builds:
 * - PurgeCSS: Removes unused CSS classes (targets 69% reduction / ~150KB savings)
 * - cssnano: Minifies and optimizes CSS output
 *
 * The configuration preserves all Webflow-specific classes and dynamic patterns.
 */

import purgecssModule from '@fullhuman/postcss-purgecss';
import cssnanoModule from 'cssnano';

// Handle both default and named exports
const purgecss = purgecssModule.default || purgecssModule;
const cssnano = cssnanoModule.default || cssnanoModule;

const isProduction = process.env.NODE_ENV === 'production';

export default {
  plugins: [
    // PurgeCSS - only in production to avoid dev performance impact
    isProduction &&
      purgecss({
        // Content sources to scan for CSS class usage
        content: [
          './src/**/*.astro',
          './src/**/*.html',
          './src/**/*.tsx',
          './src/**/*.ts',
          './src/**/*.jsx',
          './src/**/*.js',
          './public/**/*.html',
        ],

        // Default extractor for CSS class names
        defaultExtractor: (content) => {
          // Match all CSS class patterns including:
          // - Standard classes: .my-class
          // - BEM classes: .block__element--modifier
          // - Webflow classes: .w-* patterns
          // - Dynamic classes in templates
          const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
          const innerMatches = content.match(/[^<>"'`\s.#][\w-]*/g) || [];
          return broadMatches.concat(innerMatches);
        },

        // Safelist - patterns to NEVER remove
        safelist: {
          // Exact class names to keep
          standard: [
            'html',
            'body',
            // Webflow CMS dynamic classes
            'w-dyn-item',
            'w-dyn-items',
            'w-dyn-list',
            'w-dyn-empty',
            'w-dyn-hide',
            'w-dyn-bind-empty',
            // Webflow state classes
            'w--current',
            'w--open',
            'w--tab-active',
            'w--redirected-checked',
            'w--redirected-focus',
            // Finsweet CMS Filter states
            'fs-cmsfilter_active',
            'fs-cmsload_loading',
            // Common dynamic states
            'is-active',
            'is-open',
            'is-visible',
            'is-hidden',
            'is-loading',
            'is-error',
            'is-success',
            'is-current',
            'is-disabled',
            'is-selected',
            // Dark mode classes
            'dark',
            'light',
          ],
          // Regex patterns - keep all classes matching these patterns
          deep: [
            // All Webflow utility classes
            /^w-/,
            // All layout classes
            /^w-layout-/,
            // Form states
            /^w-form-/,
            // Slider/tabs components
            /^w-slider/,
            /^w-tab/,
            // Dropdown components
            /^w-dropdown/,
            // Navigation
            /^w-nav/,
            // Dynamic content (CMS)
            /^w-dyn/,
            // Rich text elements
            /^w-richtext/,
            // Responsive visibility classes
            /^hide-/,
            /^show-/,
            // Finsweet attributes
            /^fs-/,
            // Data attribute selectors (for JS interactions)
            /^\[data-/,
            // Animation states
            /^is-/,
            /^has-/,
            // Clerk auth states
            /^cl-/,
          ],
          // Keep classes with these patterns in children
          greedy: [
            // Keep all descendants of these patterns
            /^w-richtext/,
          ],
        },

        // Blocklist - patterns to always remove (if any)
        blocklist: [],

        // Additional options
        fontFace: false, // Keep all @font-face rules
        keyframes: false, // Keep all @keyframes
        variables: false, // Keep all CSS variables
      }),

    // cssnano - CSS minification (production only)
    isProduction &&
      cssnano({
        preset: [
          'default',
          {
            // Preserve CSS variable names
            cssDeclarationSorter: false,
            // Don't merge @font-face rules
            mergeLonghand: false,
            // Preserve comments with licenses
            discardComments: {
              removeAll: false,
              removeAllButFirst: true,
            },
          },
        ],
      }),
  ].filter(Boolean),
};
