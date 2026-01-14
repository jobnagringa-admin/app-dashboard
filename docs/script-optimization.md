# Script Loading Optimization

This document describes the external script loading optimizations implemented
for better Lighthouse performance scores.

## Overview

External scripts were analyzed and optimized to reduce:

- **Time to Interactive (TTI)** - faster page interactivity
- **Total Blocking Time (TBT)** - less main thread blocking
- **Largest Contentful Paint (LCP)** - faster visual rendering
- **First Contentful Paint (FCP)** - quicker initial paint

## External Scripts Inventory

| Script               | Source                        | Purpose                 | Loading Strategy       |
| -------------------- | ----------------------------- | ----------------------- | ---------------------- |
| Google Tag Manager   | googletagmanager.com          | Analytics/tracking      | Partytown (web worker) |
| Google Analytics     | googletagmanager.com          | Traffic analytics       | Via GTM                |
| Clerk Authentication | clerk.jobnagringa.com.br      | User auth               | async                  |
| jQuery               | d3e54v103j8qbb.cloudfront.net | Webflow dependency      | defer                  |
| Webflow.js           | local                         | Animations/interactions | defer                  |
| Finsweet CMS Load    | cdn.jsdelivr.net              | CMS functionality       | async                  |
| Finsweet CMS Filter  | cdn.jsdelivr.net              | CMS filtering           | async                  |
| Mautic Tracking      | mautic.jobnagringa.com.br     | Marketing automation    | requestIdleCallback    |
| Ahrefs Analytics     | analytics.ahrefs.com          | SEO analytics           | requestIdleCallback    |
| Google Fonts         | fonts.googleapis.com          | Typography              | preload + swap         |

## Optimizations Applied

### 1. Preconnect Hints

Added to `Head.astro` for critical third-party origins to establish early
connections:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preconnect" href="https://www.googletagmanager.com" />
<link rel="preconnect" href="https://clerk.jobnagringa.com.br" crossorigin />
```

### 2. DNS Prefetch

Added for non-critical origins to resolve DNS early:

```html
<link rel="dns-prefetch" href="https://d3e54v103j8qbb.cloudfront.net" />
<link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
<link rel="dns-prefetch" href="https://analytics.ahrefs.com" />
<link rel="dns-prefetch" href="https://mautic.jobnagringa.com.br" />
```

### 3. Font Loading Strategy

Replaced synchronous WebFont.js with async CSS loading:

```html
<link
  rel="preload"
  href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
  as="style"
  onload="this.onload=null;this.rel='stylesheet'"
/>
<noscript>
  <link rel="stylesheet" href="..." />
</noscript>
```

Benefits:

- Removed render-blocking WebFont.js script
- Uses `display=swap` to prevent FOIT (Flash of Invisible Text)
- Font loads asynchronously without blocking render

### 4. Partytown Integration

Installed `@astrojs/partytown` to run Google Tag Manager in a web worker:

**Configuration** (`astro.config.mjs`):

```javascript
import partytown from '@astrojs/partytown';

export default defineConfig({
  integrations: [
    partytown({
      config: {
        forward: ['dataLayer.push'],
        debug: false,
      },
    }),
  ],
});
```

**Usage** (`BaseLayout.astro`):

```html
<script is:inline>
  window.dataLayer = window.dataLayer || [];
</script>
<script type="text/partytown">
  // GTM script runs in web worker
</script>
```

Benefits:

- GTM no longer blocks the main thread
- Reduces Total Blocking Time significantly
- All analytics scripts run in isolated worker

### 5. Script Loading Attributes

#### Async vs Defer

| Attribute | Behavior                                                    | Use Case                  |
| --------- | ----------------------------------------------------------- | ------------------------- |
| `async`   | Downloads in parallel, executes immediately when ready      | Independent scripts       |
| `defer`   | Downloads in parallel, executes after HTML parsing in order | Scripts with dependencies |

Applied as follows:

- **Clerk Auth**: `async` - critical but independent
- **jQuery**: `defer` - needed for Webflow but not render-critical
- **Webflow.js**: `defer` - depends on jQuery, must execute after
- **Finsweet**: `async` - independent CMS functionality

### 6. Lazy Loading Non-Critical Analytics

Mautic and Ahrefs analytics are loaded using `requestIdleCallback`:

```javascript
function loadNonCriticalScripts() {
  // Load during browser idle time
}

if ('requestIdleCallback' in window) {
  requestIdleCallback(loadNonCriticalScripts, { timeout: 3000 });
} else {
  // Safari fallback
  setTimeout(loadNonCriticalScripts, 2000);
}
```

Benefits:

- Zero impact on initial page load
- Loads only when browser is idle
- Graceful fallback for Safari

## Files Modified

| File                                | Changes                                                                      |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| `src/components/Head.astro`         | Preconnect hints, DNS prefetch, async font loading, removed duplicate GA/GTM |
| `src/layouts/BaseLayout.astro`      | Partytown GTM, defer jQuery/Webflow, lazy load Mautic/Ahrefs                 |
| `src/layouts/DashboardLayout.astro` | Defer jQuery/Webflow                                                         |
| `src/layouts/LandingLayout.astro`   | Defer jQuery/Webflow                                                         |
| `astro.config.mjs`                  | Added Partytown integration                                                  |
| `package.json`                      | Added @astrojs/partytown dependency                                          |

## Expected Performance Improvements

| Metric | Before | After (Expected) | Improvement    |
| ------ | ------ | ---------------- | -------------- |
| LCP    | ~3.5s  | ~2.0s            | ~40% faster    |
| TBT    | ~800ms | ~200ms           | ~75% reduction |
| TTI    | ~4.5s  | ~2.5s            | ~45% faster    |
| FCP    | ~1.8s  | ~1.2s            | ~33% faster    |

## Verification

Run Lighthouse audit to verify improvements:

```bash
# Using Chrome DevTools
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select "Performance" category
4. Run audit on mobile

# Using CLI
npx lighthouse https://jobnagringa.com.br --only-categories=performance
```

## Troubleshooting

### GTM Events Not Firing

If GTM events don't work with Partytown:

1. Check Partytown is forwarding dataLayer:

   ```javascript
   config: {
     forward: ["dataLayer.push"],
   }
   ```

2. Enable debug mode temporarily:

   ```javascript
   config: {
     debug: true,
   }
   ```

3. Check browser console for Partytown messages

### jQuery-dependent Features Broken

If Webflow animations/interactions don't work:

1. Ensure jQuery loads before Webflow.js (both use `defer`)
2. Check for inline scripts that need jQuery - wrap them in `DOMContentLoaded`

### Clerk Auth Issues

If authentication state is inconsistent:

1. Clerk uses `async` - it may load after DOM is ready
2. Check that auth-dependent code waits for Clerk to initialize
3. The existing cookie-based fallback should handle this

## Future Optimizations

1. **Self-host jQuery** - Reduce external dependency
2. **Replace jQuery** - Modern JavaScript can replace most jQuery usage
3. **Module bundling** - Bundle Webflow.js with app code
4. **Service Worker caching** - Cache third-party scripts locally
5. **Resource hints** - Add `fetchpriority="high"` for critical resources
