# JavaScript Migration Guide

## Overview

This document describes the JavaScript functionality migrated from the legacy Webflow site to TypeScript modules for Astro.

## Script Loading Strategy

### `client:load` vs `client:idle` Directives

For Astro components that use JavaScript, use these directives:

| Script/Feature       | Directive        | Reason                                                |
| -------------------- | ---------------- | ----------------------------------------------------- |
| Clerk Auth           | `client:load`    | Critical for protected routes - must load immediately |
| Protected Path Check | inline script    | Runs before hydration to prevent flash                |
| GTM/GA Analytics     | `client:idle`    | Non-blocking, can wait                                |
| Mautic Tracking      | `client:idle`    | Marketing, can wait                                   |
| Loading Buttons      | `client:visible` | Only needed when button is visible                    |
| UTM Handling         | `client:load`    | Should capture params immediately                     |
| CEP Auto-fill        | `client:visible` | Only for checkout forms                               |
| Finsweet CMS         | async script     | External, non-blocking                                |

### Loading Order

1. **Immediate (inline)**: Protected path enforcement, Webflow modifiers
2. **`client:load`**: Auth, UTM capture
3. **`client:idle`**: Analytics, tracking
4. **`client:visible`**: Form handlers, UI interactions

## Modules

### `/scripts/auth.ts`

Handles all Clerk authentication functionality.

**Key Functions:**

- `initAuth()` - Initialize auth on page load
- `userIsPaidCustomer()` - Check if user is a paid member
- `enforceProtectedPath()` - Redirect non-paid users from /jng/\*
- `logout()` - Clear all auth data and redirect
- `getUserFromCookie()` - Get current user data

**Usage in Astro:**

```astro
---
import { AuthProvider } from '../components/AuthProvider.astro';
---
<head>
  <AuthProvider />
</head>
```

### `/scripts/tracking.ts`

Handles analytics and marketing tracking.

**Key Functions:**

- `initTracking()` - Initialize all tracking
- `trackEvent(name, params)` - Track custom GA event
- `mauticTrack(action, data)` - Send data to Mautic
- `addUTMToLinks()` - Add UTM source to outbound links

**Usage in Astro:**

```astro
---
import AnalyticsHead from '../components/AnalyticsHead.astro';
import MauticTracking from '../components/MauticTracking.astro';
---
<head>
  <AnalyticsHead />
</head>
<body>
  ...
  <MauticTracking />
</body>
```

### `/scripts/api.ts`

Handles API configuration and requests.

**Key Functions:**

- `getAPIUrl()` - Get environment-appropriate API URL
- `apiGet/apiPost/apiPut/apiDelete()` - HTTP helpers
- `fetchAddressByCEP(cep)` - ViaCEP integration
- `setupCEPAutoFill()` - Auto-fill checkout forms

**Environment Variables:**

```env
PUBLIC_API_URL=https://jobnagringa.pay.nova.money/api/v1
PUBLIC_USE_STAGING=false
```

### `/scripts/utils.ts`

Common utility functions.

**Key Functions:**

- `handleLoadingButton(button)` - Show loading state
- `setupPlaceholdersFromPH()` - Webflow compatibility
- `isValidEmail/isValidBrazilianPhone()` - Validation
- `getQueryParam/setQueryParam()` - URL helpers

## Components

### `<AuthProvider />`

Add to `<head>` on all pages. Handles:

- Clerk SDK loading
- User session persistence
- Protected path enforcement
- Community content gating

**Props:**

- `publishableKey` - Clerk key (default from env)
- `enforceProtection` - Enable route protection (default: true)

### `<AnalyticsHead />`

Add to `<head>` for analytics. Loads:

- Google Analytics
- Google Tag Manager
- Ahrefs

**Props:**

- `gtmId`, `gaId`, `ahrefsKey` - Override defaults
- `disabled` - Disable in development

### `<AnalyticsBody />`

Add after `<body>` opening tag. Contains:

- GTM noscript fallback

### `<MauticTracking />`

Add before `</body>`. Handles:

- Page view tracking
- Form submission tracking
- User identification

### `<ClientScripts />`

Add before `</body>`. Loads:

- jQuery (required by Webflow)
- webflow.js
- Finsweet attributes
- Custom script initialization

**Props:**

- `includeFinsweet` - Load CMS attributes (default: true)
- `includeSlater` - Load Slater scripts (default: false)

## Protected Paths

The following paths require paid customer status:

- `/jng/*` (member dashboard, courses, etc.)

Non-paid users are redirected to `/` (home page).

## External Scripts

| Script              | Source                    | Purpose              |
| ------------------- | ------------------------- | -------------------- |
| jQuery 3.5.1        | Cloudfront                | Webflow dependency   |
| webflow.js          | Local                     | Webflow interactions |
| Finsweet CMS Load   | jsDelivr                  | Dynamic CMS loading  |
| Finsweet CMS Filter | jsDelivr                  | CMS filtering        |
| Clerk JS SDK        | clerk.jobnagringa.com.br  | Authentication       |
| Mautic              | mautic.jobnagringa.com.br | Marketing automation |
| GTM                 | googletagmanager.com      | Tag management       |
| GA4                 | googletagmanager.com      | Analytics            |
| Ahrefs              | analytics.ahrefs.com      | SEO analytics        |

## Migration Notes

### What Changed

1. **Minified inline scripts** -> TypeScript modules with types
2. **jQuery-dependent code** -> Vanilla JS/TypeScript
3. **Global variables** -> Module exports
4. **Scattered scripts** -> Organized components

### What Stayed the Same

1. Cookie format and names (for compatibility)
2. Protected path logic
3. Community content gating
4. API endpoints
5. Tracking IDs

### Breaking Changes

None - all functionality is preserved. The cookie format is unchanged so existing logged-in users will remain logged in.

## Environment Variables

```env
# Clerk
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
PUBLIC_CLERK_DOMAIN=https://clerk.jobnagringa.com.br

# Analytics
PUBLIC_GTM_ID=GTM-58XVRQZ
PUBLIC_GA_ID=G-DNCKG4JJ77
PUBLIC_AHREFS_KEY=0IynPqzGcpJ1FaTQBiSG9g

# Mautic
PUBLIC_MAUTIC_URL=https://mautic.jobnagringa.com.br/mtc.js

# API
PUBLIC_API_URL=https://jobnagringa.pay.nova.money/api/v1
PUBLIC_USE_STAGING=false

# Development
PUBLIC_ENABLE_ANALYTICS=false
```
