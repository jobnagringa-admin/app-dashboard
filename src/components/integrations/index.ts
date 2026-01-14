/**
 * Third-Party Integrations Index
 *
 * Export all integration components for easy importing.
 *
 * Usage in Astro layouts:
 *
 * ```astro
 * ---
 * import {
 *   Analytics,
 *   AnalyticsBody,
 *   ClerkProvider,
 *   MauticTracker,
 *   WebflowScripts,
 *   WebflowBody
 * } from '@/components/integrations';
 * ---
 * ```
 *
 * Note: Astro components must be imported directly from .astro files.
 * This file serves as documentation and type hints.
 */

// Re-export paths for convenience
export const INTEGRATION_PATHS = {
  // Authentication
  ClerkProvider: "./ClerkProvider.astro",

  // Analytics (head scripts)
  Analytics: "./Analytics.astro",

  // Analytics (body scripts)
  AnalyticsBody: "./AnalyticsBody.astro",

  // Marketing Automation
  MauticTracker: "./MauticTracker.astro",

  // Live Chat
  ChatwootWidget: "./ChatwootWidget.astro",

  // Webflow Runtime (head scripts)
  WebflowScripts: "./WebflowScripts.astro",

  // Webflow Runtime (body scripts)
  WebflowBody: "./WebflowBody.astro",

  // CMS Features
  FinsweetCMS: "./FinsweetCMS.astro",

  // Custom JavaScript
  SlaterApp: "./SlaterApp.astro",

  // Payments
  PaymentProviders: "./PaymentProviders.astro",

  // Address Lookup
  ViaCepLookup: "./ViaCepLookup.astro",

  // Content Protection
  ContentGating: "./ContentGating.astro",
} as const;

/**
 * Integration categories for documentation
 */
export const INTEGRATION_CATEGORIES = {
  authentication: ["ClerkProvider", "ContentGating"],
  analytics: ["Analytics", "AnalyticsBody", "MauticTracker"],
  chat: ["ChatwootWidget"],
  webflow: ["WebflowScripts", "WebflowBody", "FinsweetCMS", "SlaterApp"],
  payments: ["PaymentProviders"],
  utilities: ["ViaCepLookup"],
} as const;

/**
 * Required environment variables for each integration
 */
export const REQUIRED_ENV_VARS = {
  ClerkProvider: [
    "PUBLIC_CLERK_PUBLISHABLE_KEY",
    "PUBLIC_CLERK_DOMAIN",
    "PUBLIC_CLERK_ACCOUNTS_URL",
  ],
  Analytics: [
    "PUBLIC_GA4_MEASUREMENT_ID",
    "PUBLIC_GTM_CONTAINER_ID",
    "PUBLIC_AHREFS_KEY",
  ],
  AnalyticsBody: ["PUBLIC_GTM_CONTAINER_ID", "PUBLIC_AHREFS_KEY"],
  MauticTracker: ["PUBLIC_MAUTIC_URL"],
  ChatwootWidget: ["PUBLIC_CHATWOOT_URL", "PUBLIC_CHATWOOT_TOKEN"],
  PaymentProviders: [
    "PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "PUBLIC_NOVA_MONEY_API_URL",
    "STRIPE_SECRET_KEY",
  ],
  SlaterApp: ["PUBLIC_SLATER_PROJECT_ID", "PUBLIC_SLATER_SCRIPT_ID"],
} as const;
