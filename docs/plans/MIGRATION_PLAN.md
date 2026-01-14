# Astro Migration Plan - Complete Task Breakdown

## Epic: Migrate Project from HTML/CSS/JS to Astro Framework

**Description**: Complete migration of the entire project from static HTML/CSS/JavaScript to Astro framework while maintaining pixel-perfect layout fidelity and all existing functionality.

---

## Task 1: Project Setup and Astro Initialization

### Description

Initialize a new Astro project with proper configuration, TypeScript support, and project structure that mirrors the current HTML structure.

### Detailed Steps

1. **Install Astro CLI and create new project**
   - Run `npm create astro@latest` in project root
   - Choose TypeScript template
   - Configure with recommended settings
   - Location: Root directory

2. **Configure Astro config file** (`astro.config.mjs`)
   - Set output mode (likely `hybrid` for SSG + SSR)
   - Configure base URL for production
   - Set site URL
   - Configure build options
   - Add integrations: `@astrojs/tailwind` (if using Tailwind), `@astrojs/sitemap`
   - File: `astro.config.mjs`

3. **Set up TypeScript configuration**
   - Configure `tsconfig.json` with strict mode
   - Set up path aliases for imports (`@/components`, `@/layouts`, etc.)
   - File: `tsconfig.json`

4. **Create directory structure**
   - `src/pages/` - For all page routes (replaces HTML files)
   - `src/components/` - For reusable components
   - `src/layouts/` - For page layouts
   - `src/styles/` - For global CSS
   - `src/utils/` - For utility functions
   - `src/scripts/` - For client-side JavaScript
   - `public/` - For static assets (images, fonts, etc.)

5. **Migrate static assets**
   - Copy `src/images/` to `public/images/`
   - Copy `src/videos/` to `public/videos/`
   - Copy `src/documents/` to `public/documents/`
   - Update all asset paths in migrated files

6. **Set up environment variables**
   - Create `.env.example` with all required variables
   - Document API URLs, Clerk keys, analytics IDs
   - File: `.env.example`, `.env`

### Files to Create/Modify

- `astro.config.mjs` (new)
- `tsconfig.json` (new)
- `package.json` (update)
- `.env.example` (new)
- Directory structure (new)

### Best Practices

- Use Astro's file-based routing
- Keep component structure modular
- Use Astro's `<script>` tags for client-side code
- Leverage Astro's built-in optimizations

---

## Task 2: Extract and Migrate CSS Files

### Description

Migrate all CSS files to Astro-compatible format, maintaining exact styling and organization.

### Detailed Steps

1. **Migrate normalize.css**
   - Copy `src/css/normalize.css` to `src/styles/normalize.css`
   - Import in main layout or global styles
   - File: `src/styles/normalize.css`

2. **Migrate webflow.css**
   - Copy `src/css/webflow.css` to `src/styles/webflow.css`
   - This contains Webflow-specific styles and icons
   - Maintain exact class names and structure
   - File: `src/styles/webflow.css`

3. **Migrate jobnagringa.webflow.css**
   - Copy `src/css/jobnagringa.webflow.css` to `src/styles/jobnagringa.webflow.css`
   - This is the main custom stylesheet
   - Verify all CSS variables are preserved
   - File: `src/styles/jobnagringa.webflow.css`

4. **Extract inline styles from HTML files**
   - Find all `<style>` tags in HTML files
   - Extract to appropriate CSS files or component-scoped styles
   - Common inline styles found:
     - Scrollbar styling (`.general_style w-embed`)
     - Form validation styles (`.hide`, `.error`, `.success`, `.error-message`)
     - Select field styling
     - Acronym styling
   - Create `src/styles/inline-extracted.css` for shared inline styles

5. **Create global styles entry point**
   - Create `src/styles/global.css` that imports all CSS files
   - Import order: normalize.css → webflow.css → jobnagringa.webflow.css → inline-extracted.css
   - File: `src/styles/global.css`

6. **Set up CSS in Astro layout**
   - Import global CSS in main layout component
   - Use Astro's `<style>` tag for component-scoped styles where appropriate
   - File: `src/layouts/BaseLayout.astro`

### Files to Create/Modify

- `src/styles/normalize.css` (migrated)
- `src/styles/webflow.css` (migrated)
- `src/styles/jobnagringa.webflow.css` (migrated)
- `src/styles/inline-extracted.css` (new, extracted from HTML)
- `src/styles/global.css` (new)

### Best Practices

- Maintain exact CSS class names for compatibility
- Use CSS variables where possible
- Consider CSS modules for component-scoped styles
- Test visual fidelity after migration

---

## Task 3: Extract Reusable Components

### Description

Identify and extract common HTML patterns into reusable Astro components.

### Detailed Steps

1. **Create Navigation Component**
   - Extract navbar from `index.html` (lines 116-165)
   - Create `src/components/Navbar.astro`
   - Make it accept props for current page
   - Handle mobile menu functionality
   - File: `src/components/Navbar.astro`

2. **Create Footer Component**
   - Extract footer from `index.html` (lines 454-552)
   - Create `src/components/Footer.astro`
   - Include social links, footer grid, scripts
   - File: `src/components/Footer.astro`

3. **Create Job Card Component**
   - Extract job card HTML structure
   - Create `src/components/JobCard.astro`
   - Accept props: title, company, location, level, etc.
   - Handle Brazilian flag indicator
   - File: `src/components/JobCard.astro`

4. **Create Button Component**
   - Extract button styles and structure
   - Create `src/components/Button.astro`
   - Support variants: primary, secondary, secondary-light, etc.
   - File: `src/components/Button.astro`

5. **Create Form Components**
   - Extract form input fields
   - Create `src/components/Input.astro`
   - Create `src/components/Select.astro`
   - Create `src/components/Checkbox.astro`
   - Handle validation styling
   - Files: `src/components/Input.astro`, `src/components/Select.astro`, `src/components/Checkbox.astro`

6. **Create Layout Components**
   - Create `src/layouts/BaseLayout.astro` - Main layout with head, navbar, footer
   - Create `src/layouts/PageLayout.astro` - For content pages
   - Create `src/layouts/DashboardLayout.astro` - For dashboard pages
   - Files: `src/layouts/BaseLayout.astro`, `src/layouts/PageLayout.astro`, `src/layouts/DashboardLayout.astro`

7. **Create Head Component**
   - Extract `<head>` section common elements
   - Create `src/components/Head.astro`
   - Accept props: title, description, ogImage, etc.
   - Include meta tags, fonts, analytics scripts
   - File: `src/components/Head.astro`

### Files to Create

- `src/components/Navbar.astro`
- `src/components/Footer.astro`
- `src/components/JobCard.astro`
- `src/components/Button.astro`
- `src/components/Input.astro`
- `src/components/Select.astro`
- `src/components/Checkbox.astro`
- `src/components/Head.astro`
- `src/layouts/BaseLayout.astro`
- `src/layouts/PageLayout.astro`
- `src/layouts/DashboardLayout.astro`

### Best Practices

- Use Astro's component props for dynamic content
- Keep components focused and reusable
- Use TypeScript interfaces for props
- Maintain exact HTML structure for pixel-perfect rendering

---

## Task 4: Migrate JavaScript Functionality

### Description

Extract and refactor all JavaScript code into Astro-compatible modules and client-side scripts.

### Detailed Steps

1. **Migrate Clerk Authentication Scripts**
   - Extract Clerk initialization and user management
   - Create `src/scripts/clerk.ts` or `src/utils/clerk.ts`
   - Functions to migrate:
     - `setCookie()`, `persistUserData()`, `getUserFromCookie()`
     - `userShouldBeLoggedIn()`, `userIsPaidCustomer()`
     - `populateFirstNameFromUser()`, `handleCommunityContent()`
   - Convert to TypeScript with proper types
   - File: `src/utils/clerk.ts`

2. **Migrate UTM Tracking Script**
   - Extract UTM source tracking from footer scripts
   - Create `src/scripts/utm-tracking.ts`
   - Function: Add `utm_source=jobnagringa` to links with `[utm]` attribute
   - File: `src/scripts/utm-tracking.ts`

3. **Migrate Loading Button Handler**
   - Extract `handleLoadingButton()` function
   - Create `src/scripts/loading-button.ts`
   - Handle buttons with `loading-feedback="true"` attribute
   - File: `src/scripts/loading-button.ts`

4. **Migrate Protected Paths Logic**
   - Extract protected paths checking logic
   - Create `src/utils/protected-paths.ts`
   - Handle `/jng` path protection
   - Can be server-side middleware in Astro
   - File: `src/utils/protected-paths.ts` or middleware

5. **Migrate Mautic Tracking**
   - Extract Mautic initialization and form tracking
   - Create `src/scripts/mautic.ts`
   - Handle pageview and formsubmit events
   - File: `src/scripts/mautic.ts`

6. **Migrate API Configuration**
   - Extract `API_URL` constant
   - Move to environment variables
   - Create `src/utils/api.ts` for API utilities
   - File: `src/utils/api.ts`

7. **Migrate Slater Integration**
   - Extract Slater home-search script loader
   - Create `src/scripts/slater.ts`
   - Handle conditional loading based on hostname
   - File: `src/scripts/slater.ts`

8. **Migrate Webflow.js Functionality**
   - Review `src/js/webflow.js` for Webflow-specific functionality
   - Determine if still needed or can be replaced
   - If needed, migrate to `src/scripts/webflow.ts`
   - File: `src/scripts/webflow.ts` (if needed)

9. **Create Client Script Loader Component**
   - Create `src/components/Scripts.astro` component
   - Load all third-party scripts (Google Analytics, GTM, Clerk, etc.)
   - Use Astro's `<script>` tags with proper attributes
   - File: `src/components/Scripts.astro`

### Files to Create/Modify

- `src/utils/clerk.ts` (new)
- `src/scripts/utm-tracking.ts` (new)
- `src/scripts/loading-button.ts` (new)
- `src/utils/protected-paths.ts` (new)
- `src/scripts/mautic.ts` (new)
- `src/utils/api.ts` (new)
- `src/scripts/slater.ts` (new)
- `src/scripts/webflow.ts` (new, if needed)
- `src/components/Scripts.astro` (new)

### Best Practices

- Use TypeScript for type safety
- Keep client-side scripts in `<script>` tags with `is:inline` or `client:load`
- Use Astro's `define:vars` for passing server data to client scripts
- Organize utilities vs scripts (utils = pure functions, scripts = DOM manipulation)

---

## Task 5: Migrate Third-Party Integrations

### Description

Migrate all third-party scripts and integrations to Astro-compatible format.

### Detailed Steps

1. **Google Analytics & Tag Manager**
   - Migrate GTM script to `src/components/Scripts.astro`
   - Migrate gtag configuration
   - Use Astro's `<script>` tags
   - Maintain GTM ID: `GTM-58XVRQZ`
   - Maintain GA ID: `G-DNCKG4JJ77`
   - File: `src/components/Scripts.astro`

2. **Clerk Authentication**
   - Migrate Clerk script loading
   - Clerk publishable key: `pk_live_Y2xlcmsuam9ibmFncmluZ2EuY29tLmJyJA`
   - Clerk domain: `clerk.jobnagringa.com.br`
   - Integrate with Astro middleware for protected routes
   - File: `src/components/Scripts.astro`, `src/middleware.ts`

3. **Finsweet CMS Load & Filter**
   - Migrate CMS Load script: `@finsweet/attributes-cmsload@1/cmsload.js`
   - Migrate CMS Filter script: `@finsweet/attributes-cmsfilter@1/cmsfilter.js`
   - These handle Webflow CMS functionality
   - May need to replace with Astro's data fetching
   - File: `src/components/Scripts.astro` or replace with Astro data fetching

4. **Mautic Tracking**
   - Migrate Mautic script loading
   - Mautic URL: `https://mautic.jobnagringa.com.br/mtc.js`
   - Handle pageview and formsubmit events
   - File: `src/scripts/mautic.ts`

5. **Slater Integration**
   - Migrate Slater script loader
   - Handle conditional loading (webflow.io vs production)
   - Script URL: `https://slater.app/8634/22027.js`
   - File: `src/scripts/slater.ts`

6. **Ahrefs Analytics**
   - Migrate Ahrefs script
   - Key: `0IynPqzGcpJ1FaTQBiSG9g`
   - File: `src/components/Scripts.astro`

7. **jQuery Migration**
   - Current: jQuery 3.5.1 from CloudFront
   - Consider removing jQuery if not heavily used
   - If needed, migrate to npm package or CDN
   - File: `src/components/Scripts.astro` or remove

8. **Webflow.js**
   - Review Webflow.js usage
   - May be needed for Webflow CMS interactions
   - File: `src/scripts/webflow.ts` (if needed)

### Files to Create/Modify

- `src/components/Scripts.astro` (new)
- `src/middleware.ts` (new, for Clerk)
- Update all page components to use Scripts component

### Best Practices

- Load scripts in correct order
- Use `defer` or `async` where appropriate
- Consider using Astro integrations for common services
- Minimize third-party script loading

---

## Task 6: Migrate Main Pages (Root Level)

### Description

Migrate all root-level HTML pages to Astro pages, maintaining exact layout and functionality.

### Detailed Steps

1. **Migrate index.html**
   - Create `src/pages/index.astro`
   - Migrate hero section, job search form, job board
   - Integrate with BaseLayout
   - Maintain all Webflow CMS attributes initially
   - File: `src/pages/index.astro`

2. **Migrate blog.html**
   - Create `src/pages/blog.astro`
   - Migrate blog listing page
   - Handle blog post data (may need CMS integration)
   - File: `src/pages/blog.astro`

3. **Migrate log-in.html**
   - Create `src/pages/log-in.astro`
   - Redirect to Clerk sign-in
   - File: `src/pages/log-in.astro`

4. **Migrate sign-up.html**
   - Create `src/pages/sign-up.astro`
   - Redirect to Clerk sign-up
   - File: `src/pages/sign-up.astro`

5. **Migrate assine.html**
   - Create `src/pages/assine.astro`
   - Subscription/plan selection page
   - File: `src/pages/assine.astro`

6. **Migrate checkout.html**
   - Create `src/pages/checkout.astro`
   - Payment checkout page
   - Integrate with payment API
   - File: `src/pages/checkout.astro`

7. **Migrate init-checkout.html**
   - Create `src/pages/init-checkout.astro`
   - Checkout initialization page
   - File: `src/pages/init-checkout.astro`

8. **Migrate paypal-checkout.html**
   - Create `src/pages/paypal-checkout.astro`
   - PayPal-specific checkout
   - File: `src/pages/paypal-checkout.astro`

9. **Migrate order-confirmation.html**
   - Create `src/pages/order-confirmation.astro`
   - Order confirmation page
   - File: `src/pages/order-confirmation.astro`

10. **Migrate search.html**
    - Create `src/pages/search.astro`
    - Search results page
    - File: `src/pages/search.astro`

11. **Migrate user-account.html**
    - Create `src/pages/user-account.astro`
    - User account management page
    - File: `src/pages/user-account.astro`

12. **Migrate reset-password.html**
    - Create `src/pages/reset-password.astro`
    - Password reset page
    - File: `src/pages/reset-password.astro`

13. **Migrate update-password.html**
    - Create `src/pages/update-password.astro`
    - Password update page
    - File: `src/pages/update-password.astro`

14. **Migrate access-denied.html**
    - Create `src/pages/access-denied.astro`
    - Access denied/401 page
    - File: `src/pages/access-denied.astro`

15. **Migrate 401.html**
    - Create `src/pages/401.astro`
    - Unauthorized page
    - File: `src/pages/401.astro`

16. **Migrate 404.html**
    - Create `src/pages/404.astro`
    - Not found page
    - File: `src/pages/404.astro`

17. **Migrate br-only.html**
    - Create `src/pages/br-only.astro`
    - Brazilian-only jobs filter page
    - File: `src/pages/br-only.astro`

18. **Migrate politicas.html**
    - Create `src/pages/politicas.astro`
    - Privacy policy page
    - File: `src/pages/politicas.astro`

19. **Migrate parcerias.html**
    - Create `src/pages/parcerias.astro`
    - Partnerships page
    - File: `src/pages/parcerias.astro`

20. **Migrate ebook.html**
    - Create `src/pages/ebook.astro`
    - Ebook landing page
    - File: `src/pages/ebook.astro`

21. **Migrate afiliado-hotmart.html**
    - Create `src/pages/afiliado-hotmart.astro`
    - Hotmart affiliate page
    - File: `src/pages/afiliado-hotmart.astro`

### Files to Create

All files in `src/pages/` directory:

- `index.astro`
- `blog.astro`
- `log-in.astro`
- `sign-up.astro`
- `assine.astro`
- `checkout.astro`
- `init-checkout.astro`
- `paypal-checkout.astro`
- `order-confirmation.astro`
- `search.astro`
- `user-account.astro`
- `reset-password.astro`
- `update-password.astro`
- `access-denied.astro`
- `401.astro`
- `404.astro`
- `br-only.astro`
- `politicas.astro`
- `parcerias.astro`
- `ebook.astro`
- `afiliado-hotmart.astro`

### Best Practices

- Use BaseLayout for consistent structure
- Maintain exact HTML structure for pixel-perfect rendering
- Extract repeated patterns into components
- Use Astro's data fetching for dynamic content

---

## Task 7: Migrate Detail Pages

### Description

Migrate all detail pages (detail\_\*.html) to Astro dynamic routes.

### Detailed Steps

1. **Migrate detail_post.html**
   - Create `src/pages/detail/post/[slug].astro` or `src/pages/blog/[slug].astro`
   - Dynamic route for blog posts
   - File: `src/pages/blog/[slug].astro`

2. **Migrate detail_jobs.html**
   - Create `src/pages/detail/jobs/[id].astro`
   - Dynamic route for job listings
   - File: `src/pages/detail/jobs/[id].astro`

3. **Migrate detail_job-category.html**
   - Create `src/pages/detail/job-category/[slug].astro`
   - Dynamic route for job categories
   - File: `src/pages/detail/job-category/[slug].astro`

4. **Migrate detail_job-boards.html**
   - Create `src/pages/detail/job-boards/[slug].astro`
   - Dynamic route for job boards
   - File: `src/pages/detail/job-boards/[slug].astro`

5. **Migrate detail_category.html**
   - Create `src/pages/detail/category/[slug].astro`
   - Dynamic route for categories
   - File: `src/pages/detail/category/[slug].astro`

6. **Migrate detail_product.html**
   - Create `src/pages/detail/product/[slug].astro`
   - Dynamic route for products
   - File: `src/pages/detail/product/[slug].astro`

7. **Migrate detail_sku.html**
   - Create `src/pages/detail/sku/[id].astro`
   - Dynamic route for SKUs
   - File: `src/pages/detail/sku/[id].astro`

8. **Migrate detail_author.html**
   - Create `src/pages/detail/author/[slug].astro`
   - Dynamic route for authors
   - File: `src/pages/detail/author/[slug].astro`

9. **Migrate detail_people.html**
   - Create `src/pages/detail/people/[slug].astro`
   - Dynamic route for people profiles
   - File: `src/pages/detail/people/[slug].astro`

10. **Migrate detail_partners.html**
    - Create `src/pages/detail/partners/[slug].astro`
    - Dynamic route for partners
    - File: `src/pages/detail/partners/[slug].astro`

11. **Migrate detail_afiliado.html**
    - Create `src/pages/detail/afiliado/[slug].astro`
    - Dynamic route for affiliates
    - File: `src/pages/detail/afiliado/[slug].astro`

12. **Migrate detail_videos.html**
    - Create `src/pages/detail/videos/[id].astro`
    - Dynamic route for videos
    - File: `src/pages/detail/videos/[id].astro`

13. **Migrate detail_aulas.html**
    - Create `src/pages/detail/aulas/[slug].astro`
    - Dynamic route for lessons
    - File: `src/pages/detail/aulas/[slug].astro`

14. **Migrate detail_modulo.html**
    - Create `src/pages/detail/modulo/[slug].astro`
    - Dynamic route for modules
    - File: `src/pages/detail/modulo/[slug].astro`

15. **Migrate detail_eventos.html**
    - Create `src/pages/detail/eventos/[slug].astro`
    - Dynamic route for events
    - File: `src/pages/detail/eventos/[slug].astro`

16. **Migrate detail_qa.html**
    - Create `src/pages/detail/qa/[id].astro`
    - Dynamic route for Q&A
    - File: `src/pages/detail/qa/[id].astro`

17. **Migrate detail_qa-tags.html**
    - Create `src/pages/detail/qa-tags/[tag].astro`
    - Dynamic route for Q&A tags
    - File: `src/pages/detail/qa-tags/[tag].astro`

18. **Migrate detail_resume-review.html**
    - Create `src/pages/detail/resume-review/[id].astro`
    - Dynamic route for resume reviews
    - File: `src/pages/detail/resume-review/[id].astro`

19. **Migrate detail_chatgpt.html**
    - Create `src/pages/detail/chatgpt/[id].astro`
    - Dynamic route for ChatGPT content
    - File: `src/pages/detail/chatgpt/[id].astro`

20. **Migrate detail_hub-link.html**
    - Create `src/pages/detail/hub-link/[id].astro`
    - Dynamic route for hub links
    - File: `src/pages/detail/hub-link/[id].astro`

### Files to Create

All dynamic route files in `src/pages/detail/` directory structure

### Best Practices

- Use Astro's dynamic routes with `[param]` syntax
- Implement `getStaticPaths()` for SSG or use SSR
- Fetch data in component's frontmatter
- Handle 404 cases for invalid slugs/IDs

---

## Task 8: Migrate JNG Subdirectory Pages

### Description

Migrate all pages from `src/jng/` directory to Astro routes under `/jng` path.

### Detailed Steps

1. **Migrate jng/jobs.html**
   - Create `src/pages/jng/jobs.astro`
   - Maintain `/jng/jobs` route
   - Protected route (requires authentication)
   - File: `src/pages/jng/jobs.astro`

2. **Migrate jng/jobs-brs-only.html**
   - Create `src/pages/jng/jobs-brs-only.astro`
   - Maintain `/jng/jobs-brs-only` route
   - File: `src/pages/jng/jobs-brs-only.astro`

3. **Migrate jng/jobs-with-vista-sponsors.html**
   - Create `src/pages/jng/jobs-with-vista-sponsors.astro`
   - Maintain `/jng/jobs-with-vista-sponsors` route
   - File: `src/pages/jng/jobs-with-vista-sponsors.astro`

4. **Migrate jng/member-dashboard.html**
   - Create `src/pages/jng/member-dashboard.astro`
   - Maintain `/jng/member-dashboard` route
   - Protected route
   - File: `src/pages/jng/member-dashboard.astro`

5. **Migrate jng/my-account.html**
   - Create `src/pages/jng/my-account.astro`
   - Maintain `/jng/my-account` route
   - Protected route
   - File: `src/pages/jng/my-account.astro`

6. **Migrate jng/onboarding.html**
   - Create `src/pages/jng/onboarding.astro`
   - Maintain `/jng/onboarding` route
   - File: `src/pages/jng/onboarding.astro`

7. **Migrate jng/partners.html**
   - Create `src/pages/jng/partners.astro`
   - Maintain `/jng/partners` route
   - File: `src/pages/jng/partners.astro`

8. **Migrate jng/community.html**
   - Create `src/pages/jng/community.astro`
   - Maintain `/jng/community` route
   - Protected route
   - File: `src/pages/jng/community.astro`

9. **Migrate jng/job-search.html**
   - Create `src/pages/jng/job-search.astro`
   - Maintain `/jng/job-search` route
   - File: `src/pages/jng/job-search.astro`

10. **Migrate jng/resume-generator.html**
    - Create `src/pages/jng/resume-generator.astro`
    - Maintain `/jng/resume-generator` route
    - File: `src/pages/jng/resume-generator.astro`

11. **Migrate jng/interview-q-a.html**
    - Create `src/pages/jng/interview-q-a.astro`
    - Maintain `/jng/interview-q-a` route
    - File: `src/pages/jng/interview-q-a.astro`

12. **Migrate jng/course.html**
    - Create `src/pages/jng/course.astro`
    - Maintain `/jng/course` route
    - File: `src/pages/jng/course.astro`

13. **Migrate jng/companies-hiring.html**
    - Create `src/pages/jng/companies-hiring.astro`
    - Maintain `/jng/companies-hiring` route
    - File: `src/pages/jng/companies-hiring.astro`

### Files to Create

All files in `src/pages/jng/` directory

### Best Practices

- Implement middleware for `/jng/*` route protection
- Use Clerk authentication checks
- Maintain exact route structure
- Handle authentication redirects

---

## Task 9: Migrate Other Subdirectory Pages

### Description

Migrate pages from `basic/`, `lp/`, `members/`, `payment/`, `products/` directories.

### Detailed Steps

1. **Migrate basic/dashboard.html**
   - Create `src/pages/basic/dashboard.astro`
   - Maintain `/basic/dashboard` route
   - File: `src/pages/basic/dashboard.astro`

2. **Migrate lp/assine-basic.html**
   - Create `src/pages/lp/assine-basic.astro`
   - Maintain `/lp/assine-basic` route
   - Landing page for basic subscription
   - File: `src/pages/lp/assine-basic.astro`

3. **Migrate lp/workshop-busca-de-vagas.html**
   - Create `src/pages/lp/workshop-busca-de-vagas.astro`
   - Maintain `/lp/workshop-busca-de-vagas` route
   - Landing page for workshop
   - File: `src/pages/lp/workshop-busca-de-vagas.astro`

4. **Migrate members/chatgpt.html**
   - Create `src/pages/members/chatgpt.astro`
   - Maintain `/members/chatgpt` route
   - Protected route
   - File: `src/pages/members/chatgpt.astro`

5. **Migrate payment/success.html**
   - Create `src/pages/payment/success.astro`
   - Maintain `/payment/success` route
   - Payment success page
   - File: `src/pages/payment/success.astro`

6. **Migrate products/jobhunting.html**
   - Create `src/pages/products/jobhunting.astro`
   - Maintain `/products/jobhunting` route
   - Product page
   - File: `src/pages/products/jobhunting.astro`

7. **Migrate products/networking.html**
   - Create `src/pages/products/networking.astro`
   - Maintain `/products/networking` route
   - Product page
   - File: `src/pages/products/networking.astro`

8. **Migrate products/personal-branding.html**
   - Create `src/pages/products/personal-branding.astro`
   - Maintain `/products/personal-branding` route
   - Product page
   - File: `src/pages/products/personal-branding.astro`

### Files to Create

All files in respective `src/pages/` subdirectories

### Best Practices

- Maintain exact route structure
- Use appropriate layouts
- Handle protected routes

---

## Task 10: Handle Webflow CMS Integration

### Description

Replace Webflow CMS functionality (fs-cmsload, fs-cmsfilter) with Astro data fetching.

### Detailed Steps

1. **Identify CMS Usage**
   - Find all `fs-cmsload` attributes
   - Find all `fs-cmsfilter` attributes
   - Document data sources and structures
   - Files: All HTML files with CMS attributes

2. **Set up Data Fetching**
   - Determine CMS source (Webflow CMS API, headless CMS, or static data)
   - Create `src/utils/cms.ts` for CMS utilities
   - Set up API client if using Webflow CMS API
   - File: `src/utils/cms.ts`

3. **Replace CMS Load**
   - Replace `fs-cmsload-element="list"` with Astro data fetching
   - Use `getStaticPaths()` for dynamic routes
   - Fetch data in component frontmatter
   - Files: All pages using CMS load

4. **Replace CMS Filter**
   - Replace `fs-cmsfilter-element="filters"` with client-side filtering
   - Create `src/scripts/job-filter.ts` for job filtering
   - Or use server-side filtering with query parameters
   - Files: `src/pages/index.astro`, search pages

5. **Handle CMS Collections**
   - Jobs collection → `src/data/jobs.ts` or API
   - Blog posts collection → `src/data/posts.ts` or API
   - Categories collection → `src/data/categories.ts` or API
   - Partners collection → `src/data/partners.ts` or API
   - Files: `src/data/*.ts`

6. **Implement Pagination**
   - Replace Webflow pagination with Astro pagination
   - Use `getStaticPaths()` with pagination
   - Or implement client-side pagination
   - Files: List pages

### Files to Create/Modify

- `src/utils/cms.ts` (new)
- `src/scripts/job-filter.ts` (new)
- `src/data/jobs.ts` (new, if using static data)
- `src/data/posts.ts` (new, if using static data)
- `src/data/categories.ts` (new, if using static data)
- `src/data/partners.ts` (new, if using static data)
- Update all pages using CMS functionality

### Best Practices

- Use Astro's built-in data fetching
- Consider SSG vs SSR based on data update frequency
- Implement proper error handling
- Cache API responses appropriately

---

## Task 11: Implement Authentication & Protected Routes

### Description

Set up Clerk authentication integration with Astro middleware for protected routes.

### Detailed Steps

1. **Install Clerk Astro Integration**
   - Install `@clerk/astro` package
   - Configure Clerk in `astro.config.mjs`
   - Set up environment variables
   - Files: `package.json`, `astro.config.mjs`, `.env`

2. **Create Authentication Middleware**
   - Create `src/middleware.ts`
   - Implement route protection for `/jng/*` paths
   - Handle authentication checks
   - Redirect to sign-in if not authenticated
   - File: `src/middleware.ts`

3. **Create Auth Utilities**
   - Create `src/utils/auth.ts`
   - Functions: `getUser()`, `requireAuth()`, `isPaidCustomer()`
   - Integrate with Clerk
   - File: `src/utils/auth.ts`

4. **Update Protected Pages**
   - Add authentication checks to protected pages
   - Use `getUser()` in page frontmatter
   - Redirect if not authenticated
   - Files: All `/jng/*` pages, protected pages

5. **Handle User Data**
   - Migrate cookie-based user data to Clerk session
   - Update `populateFirstNameFromUser()` logic
   - Update `handleCommunityContent()` logic
   - Files: `src/utils/auth.ts`, components

6. **Implement Role-Based Access**
   - Check `isPaidCustomer` from Clerk metadata
   - Show/hide content based on subscription status
   - Files: Components, pages

### Files to Create/Modify

- `src/middleware.ts` (new)
- `src/utils/auth.ts` (new)
- `astro.config.mjs` (update)
- All protected pages (update)

### Best Practices

- Use Astro middleware for route protection
- Leverage Clerk's built-in authentication
- Handle edge cases (expired sessions, etc.)
- Maintain backward compatibility with existing auth flow

---

## Task 12: Testing & Visual Verification

### Description

Comprehensive testing to ensure pixel-perfect layout fidelity and functionality preservation.

### Detailed Steps

1. **Visual Regression Testing Setup**
   - Set up visual regression testing tool (e.g., Percy, Chromatic, or Playwright)
   - Create baseline screenshots of all pages
   - File: Test configuration files

2. **Page-by-Page Visual Comparison**
   - Compare each migrated page with original HTML
   - Check: Layout, spacing, fonts, colors, images
   - Document any discrepancies
   - Files: Test reports

3. **Functionality Testing**
   - Test all forms (sign-up, login, checkout, etc.)
   - Test navigation and links
   - Test job search and filtering
   - Test authentication flows
   - Test protected routes
   - Files: Test files

4. **Cross-Browser Testing**
   - Test in Chrome, Firefox, Safari, Edge
   - Test mobile responsiveness
   - Test tablet layouts
   - Files: Test reports

5. **Performance Testing**
   - Compare page load times
   - Check Lighthouse scores
   - Optimize if needed
   - Files: Performance reports

6. **Accessibility Testing**
   - Run accessibility audits
   - Fix any issues
   - Files: Accessibility reports

### Files to Create

- Test configuration files
- Test scripts
- Test reports

### Best Practices

- Automated testing where possible
- Manual visual inspection for critical pages
- Document all issues found
- Fix issues before deployment

---

## Task 13: Build Configuration & Optimization

### Description

Configure Astro build settings, optimizations, and production-ready configuration.

### Detailed Steps

1. **Configure Build Settings**
   - Set output mode (hybrid recommended)
   - Configure adapter for deployment target
   - Set up build optimizations
   - File: `astro.config.mjs`

2. **Set up Image Optimization**
   - Configure `@astrojs/image` or use Astro's built-in image optimization
   - Optimize all images
   - Use responsive images
   - Files: `astro.config.mjs`, image components

3. **Configure Sitemap**
   - Set up `@astrojs/sitemap` integration
   - Generate sitemap for all pages
   - File: `astro.config.mjs`

4. **Set up RSS Feed** (if needed)
   - Create RSS feed for blog
   - File: `src/pages/rss.xml.ts`

5. **Configure Environment Variables**
   - Set up production environment variables
   - Configure staging environment
   - File: `.env.production`, `.env.staging`

6. **Optimize CSS**
   - Minify CSS in production
   - Remove unused CSS if possible
   - File: Build configuration

7. **Optimize JavaScript**
   - Code splitting
   - Tree shaking
   - Minification
   - File: Build configuration

8. **Set up Error Pages**
   - Custom 404 page
   - Custom 500 page (if SSR)
   - File: `src/pages/404.astro`, `src/pages/500.astro`

### Files to Create/Modify

- `astro.config.mjs` (update)
- `.env.production` (new)
- `.env.staging` (new)
- `src/pages/rss.xml.ts` (new, if needed)
- `src/pages/500.astro` (new, if SSR)

### Best Practices

- Use Astro's built-in optimizations
- Configure for your deployment target
- Test build locally before deploying
- Monitor bundle sizes

---

## Task 14: Deployment Configuration

### Description

Set up deployment configuration for the chosen hosting platform.

### Detailed Steps

1. **Choose Deployment Platform**
   - Options: Vercel, Netlify, Cloudflare Pages, etc.
   - Consider SSR requirements
   - File: Deployment documentation

2. **Configure Deployment Settings**
   - Set up build commands
   - Configure environment variables
   - Set up custom domains
   - Files: Platform-specific config files

3. **Set up CI/CD**
   - Configure GitHub Actions or similar
   - Set up automated deployments
   - Set up preview deployments
   - Files: `.github/workflows/*.yml`

4. **Configure Redirects**
   - Set up redirects from old HTML paths to new Astro routes
   - Handle legacy URLs
   - Files: `public/_redirects` or platform config

5. **Set up Monitoring**
   - Configure error tracking (Sentry, etc.)
   - Set up analytics
   - Files: Monitoring configuration

6. **Documentation**
   - Document deployment process
   - Document environment variables
   - Document rollback procedure
   - Files: `DEPLOYMENT.md`

### Files to Create

- Platform-specific config files
- CI/CD configuration
- Redirects file
- `DEPLOYMENT.md`

### Best Practices

- Use platform-specific adapters
- Set up staging environment
- Test deployment process
- Document everything

---

## Task 15: Documentation & Handoff

### Description

Create comprehensive documentation for the migrated codebase.

### Detailed Steps

1. **Create README.md**
   - Project overview
   - Setup instructions
   - Development workflow
   - File: `README.md`

2. **Document Component Structure**
   - Document all components
   - Document props and usage
   - File: `docs/COMPONENTS.md`

3. **Document Page Structure**
   - Document page routes
   - Document data fetching
   - File: `docs/PAGES.md`

4. **Document Utilities**
   - Document utility functions
   - Document scripts
   - File: `docs/UTILITIES.md`

5. **Migration Notes**
   - Document migration decisions
   - Document known issues
   - Document future improvements
   - File: `docs/MIGRATION_NOTES.md`

6. **API Documentation**
   - Document API integrations
   - Document environment variables
   - File: `docs/API.md`

### Files to Create

- `README.md` (update)
- `docs/COMPONENTS.md` (new)
- `docs/PAGES.md` (new)
- `docs/UTILITIES.md` (new)
- `docs/MIGRATION_NOTES.md` (new)
- `docs/API.md` (new)

### Best Practices

- Keep documentation up to date
- Include code examples
- Document edge cases
- Make it easy for new developers

---

## Summary

This migration plan covers:

- **15 major tasks** with detailed subtasks
- **64 HTML pages** to migrate
- **3 CSS files** to migrate
- **Multiple JavaScript functionalities** to refactor
- **Third-party integrations** to migrate
- **Authentication & protected routes** to implement
- **Testing & deployment** to configure

Each task includes:

- Detailed description
- Step-by-step instructions
- File paths and locations
- Best practices
- Function names and components

The migration should maintain **pixel-perfect fidelity** while modernizing the codebase with Astro's benefits: better performance, type safety, component reusability, and modern tooling.
