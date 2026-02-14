/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  // Clerk Authentication
  readonly PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  readonly CLERK_SECRET_KEY: string;
  readonly PUBLIC_CLERK_DOMAIN: string;
  readonly PUBLIC_CLERK_ACCOUNTS_URL: string;
  readonly PUBLIC_CLERK_SIGN_IN_URL: string;
  readonly PUBLIC_CLERK_SIGN_UP_URL: string;

  // Payment Providers
  readonly PUBLIC_NOVA_MONEY_API_URL: string;
  readonly PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
  readonly STRIPE_SECRET_KEY: string;

  // Analytics & Tracking
  readonly PUBLIC_GA4_MEASUREMENT_ID: string;
  readonly PUBLIC_GTM_CONTAINER_ID: string;
  readonly PUBLIC_MAUTIC_URL: string;
  readonly PUBLIC_AHREFS_KEY: string;

  // Chat & Support
  readonly PUBLIC_CHATWOOT_URL: string;
  readonly PUBLIC_CHATWOOT_TOKEN: string;

  // Webflow & CDN
  readonly PUBLIC_WEBFLOW_SITE_ID: string;
  readonly PUBLIC_SLATER_PROJECT_ID: string;
  readonly PUBLIC_SLATER_SCRIPT_ID: string;

  // Site Configuration
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_COOKIE_DOMAIN: string;

  // Feature Flags
  readonly PUBLIC_ENABLE_CHATWOOT: string;
  readonly PUBLIC_ENABLE_ANALYTICS: string;
  readonly PUBLIC_ENABLE_MAUTIC: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Clerk public metadata types
declare namespace Clerk {
  interface UserPublicMetadata {
    isPaidCustomer?: boolean;
  }
}
