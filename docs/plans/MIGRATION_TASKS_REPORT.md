# Astro Migration Tasks Report

## Summary

Successfully created **1 Epic** and **15 Tasks** in the beads backlog for
migrating the project from HTML/CSS/JavaScript to Astro framework.

## Epic Created

**EPIC: Migrate Project from HTML/CSS/JS to Astro Framework**

Complete migration of the entire project from static HTML/CSS/JavaScript to
Astro framework while maintaining pixel-perfect layout fidelity and all existing
functionality.

## Tasks Created

### Task 1: Project Setup and Astro Initialization

**Status**: Open | **Priority**: P2

Initialize a new Astro project with proper configuration, TypeScript support,
and project structure that mirrors the current HTML structure.

**Includes**:

- Installing Astro CLI
- Configuring astro.config.mjs
- Setting up TypeScript
- Creating directory structure
- Migrating static assets
- Setting up environment variables

**Key Files**:

- `astro.config.mjs` (new)
- `tsconfig.json` (new)
- `package.json` (update)
- `.env.example` (new)
- Directory structure (new)

---

### Task 2: Extract and Migrate CSS Files

**Status**: Open | **Priority**: P2

Migrate all CSS files to Astro-compatible format, maintaining exact styling and
organization.

**Includes**:

- Migrating normalize.css
- Migrating webflow.css
- Migrating jobnagringa.webflow.css
- Extracting inline styles
- Creating global styles entry point
- Setting up CSS in Astro layout

**Key Files**:

- `src/styles/normalize.css` (migrated)
- `src/styles/webflow.css` (migrated)
- `src/styles/jobnagringa.webflow.css` (migrated)
- `src/styles/inline-extracted.css` (new)
- `src/styles/global.css` (new)

---

### Task 3: Extract Reusable Components

**Status**: Open | **Priority**: P2

Identify and extract common HTML patterns into reusable Astro components.

**Includes**:

- Navigation component
- Footer component
- Job Card component
- Button component
- Form components (Input, Select, Checkbox)
- Layout components (BaseLayout, PageLayout, DashboardLayout)
- Head component

**Key Files**:

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

---

### Task 4: Migrate JavaScript Functionality

**Status**: Open | **Priority**: P2

Extract and refactor all JavaScript code into Astro-compatible modules and
client-side scripts.

**Includes**:

- Clerk authentication scripts
- UTM tracking
- Loading button handler
- Protected paths logic
- Mautic tracking
- API configuration
- Slater integration
- Webflow.js functionality
- Client script loader component

**Key Files**:

- `src/utils/clerk.ts`
- `src/scripts/utm-tracking.ts`
- `src/scripts/loading-button.ts`
- `src/utils/protected-paths.ts`
- `src/scripts/mautic.ts`
- `src/utils/api.ts`
- `src/scripts/slater.ts`
- `src/scripts/webflow.ts`
- `src/components/Scripts.astro`

---

### Task 5: Migrate Third-Party Integrations

**Status**: Open | **Priority**: P2

Migrate all third-party scripts and integrations to Astro-compatible format.

**Includes**:

- Google Analytics & Tag Manager
- Clerk Authentication
- Finsweet CMS Load & Filter
- Mautic Tracking
- Slater Integration
- Ahrefs Analytics
- jQuery migration
- Webflow.js

**Key Files**:

- `src/components/Scripts.astro`
- `src/middleware.ts`
- Update all page components

---

### Task 6: Migrate Main Pages (Root Level)

**Status**: Open | **Priority**: P2

Migrate all root-level HTML pages to Astro pages, maintaining exact layout and
functionality.

**Pages to Migrate** (21 total):

1. index.html → `src/pages/index.astro`
2. blog.html → `src/pages/blog.astro`
3. log-in.html → `src/pages/log-in.astro`
4. sign-up.html → `src/pages/sign-up.astro`
5. assine.html → `src/pages/assine.astro`
6. checkout.html → `src/pages/checkout.astro`
7. init-checkout.html → `src/pages/init-checkout.astro`
8. paypal-checkout.html → `src/pages/paypal-checkout.astro`
9. order-confirmation.html → `src/pages/order-confirmation.astro`
10. search.html → `src/pages/search.astro`
11. user-account.html → `src/pages/user-account.astro`
12. reset-password.html → `src/pages/reset-password.astro`
13. update-password.html → `src/pages/update-password.astro`
14. access-denied.html → `src/pages/access-denied.astro`
15. 401.html → `src/pages/401.astro`
16. 404.html → `src/pages/404.astro`
17. br-only.html → `src/pages/br-only.astro`
18. politicas.html → `src/pages/politicas.astro`
19. parcerias.html → `src/pages/parcerias.astro`
20. ebook.html → `src/pages/ebook.astro`
21. afiliado-hotmart.html → `src/pages/afiliado-hotmart.astro`

---

### Task 7: Migrate Detail Pages

**Status**: Open | **Priority**: P2

Migrate all detail pages (detail\_\*.html) to Astro dynamic routes.

**Pages to Migrate** (20 total):

1. detail_post.html → `src/pages/blog/[slug].astro`
2. detail_jobs.html → `src/pages/detail/jobs/[id].astro`
3. detail_job-category.html → `src/pages/detail/job-category/[slug].astro`
4. detail_job-boards.html → `src/pages/detail/job-boards/[slug].astro`
5. detail_category.html → `src/pages/detail/category/[slug].astro`
6. detail_product.html → `src/pages/detail/product/[slug].astro`
7. detail_sku.html → `src/pages/detail/sku/[id].astro`
8. detail_author.html → `src/pages/detail/author/[slug].astro`
9. detail_people.html → `src/pages/detail/people/[slug].astro`
10. detail_partners.html → `src/pages/detail/partners/[slug].astro`
11. detail_afiliado.html → `src/pages/detail/afiliado/[slug].astro`
12. detail_videos.html → `src/pages/detail/videos/[id].astro`
13. detail_aulas.html → `src/pages/detail/aulas/[slug].astro`
14. detail_modulo.html → `src/pages/detail/modulo/[slug].astro`
15. detail_eventos.html → `src/pages/detail/eventos/[slug].astro`
16. detail_qa.html → `src/pages/detail/qa/[id].astro`
17. detail_qa-tags.html → `src/pages/detail/qa-tags/[tag].astro`
18. detail_resume-review.html → `src/pages/detail/resume-review/[id].astro`
19. detail_chatgpt.html → `src/pages/detail/chatgpt/[id].astro`
20. detail_hub-link.html → `src/pages/detail/hub-link/[id].astro`

---

### Task 8: Migrate JNG Subdirectory Pages

**Status**: Open | **Priority**: P2

Migrate all pages from src/jng/ directory to Astro routes under /jng path. All
routes are protected and require authentication.

**Pages to Migrate** (13 total):

1. jng/jobs.html → `src/pages/jng/jobs.astro`
2. jng/jobs-brs-only.html → `src/pages/jng/jobs-brs-only.astro`
3. jng/jobs-with-vista-sponsors.html →
   `src/pages/jng/jobs-with-vista-sponsors.astro`
4. jng/member-dashboard.html → `src/pages/jng/member-dashboard.astro`
5. jng/my-account.html → `src/pages/jng/my-account.astro`
6. jng/onboarding.html → `src/pages/jng/onboarding.astro`
7. jng/partners.html → `src/pages/jng/partners.astro`
8. jng/community.html → `src/pages/jng/community.astro`
9. jng/job-search.html → `src/pages/jng/job-search.astro`
10. jng/resume-generator.html → `src/pages/jng/resume-generator.astro`
11. jng/interview-q-a.html → `src/pages/jng/interview-q-a.astro`
12. jng/course.html → `src/pages/jng/course.astro`
13. jng/companies-hiring.html → `src/pages/jng/companies-hiring.astro`

---

### Task 9: Migrate Other Subdirectory Pages

**Status**: Open | **Priority**: P2

Migrate pages from basic/, lp/, members/, payment/, products/ directories.

**Pages to Migrate** (8 total):

1. basic/dashboard.html → `src/pages/basic/dashboard.astro`
2. lp/assine-basic.html → `src/pages/lp/assine-basic.astro`
3. lp/workshop-busca-de-vagas.html →
   `src/pages/lp/workshop-busca-de-vagas.astro`
4. members/chatgpt.html → `src/pages/members/chatgpt.astro`
5. payment/success.html → `src/pages/payment/success.astro`
6. products/jobhunting.html → `src/pages/products/jobhunting.astro`
7. products/networking.html → `src/pages/products/networking.astro`
8. products/personal-branding.html →
   `src/pages/products/personal-branding.astro`

---

### Task 10: Handle Webflow CMS Integration

**Status**: Open | **Priority**: P2

Replace Webflow CMS functionality (fs-cmsload, fs-cmsfilter) with Astro data
fetching.

**Includes**:

- Identifying CMS usage
- Setting up data fetching
- Replacing CMS Load
- Replacing CMS Filter
- Handling CMS collections (jobs, blog posts, categories, partners)
- Implementing pagination

**Key Files**:

- `src/utils/cms.ts`
- `src/scripts/job-filter.ts`
- `src/data/jobs.ts` (if using static data)
- `src/data/posts.ts` (if using static data)
- `src/data/categories.ts` (if using static data)
- `src/data/partners.ts` (if using static data)

---

### Task 11: Implement Authentication & Protected Routes

**Status**: Open | **Priority**: P2

Set up Clerk authentication integration with Astro middleware for protected
routes.

**Includes**:

- Installing Clerk Astro integration
- Creating authentication middleware
- Creating auth utilities
- Updating protected pages
- Handling user data
- Implementing role-based access

**Key Files**:

- `src/middleware.ts`
- `src/utils/auth.ts`
- `astro.config.mjs` (update)
- All protected pages (update)

---

### Task 12: Testing & Visual Verification

**Status**: Open | **Priority**: P2

Comprehensive testing to ensure pixel-perfect layout fidelity and functionality
preservation.

**Includes**:

- Visual regression testing setup
- Page-by-page visual comparison
- Functionality testing
- Cross-browser testing
- Performance testing
- Accessibility testing

---

### Task 13: Build Configuration & Optimization

**Status**: Open | **Priority**: P2

Configure Astro build settings, optimizations, and production-ready
configuration.

**Includes**:

- Configuring build settings
- Setting up image optimization
- Configuring sitemap
- Setting up RSS feed
- Configuring environment variables
- Optimizing CSS and JavaScript
- Setting up error pages

**Key Files**:

- `astro.config.mjs` (update)
- `.env.production` (new)
- `.env.staging` (new)
- `src/pages/rss.xml.ts` (new, if needed)
- `src/pages/500.astro` (new, if SSR)

---

### Task 14: Deployment Configuration

**Status**: Open | **Priority**: P2

Set up deployment configuration for the chosen hosting platform.

**Includes**:

- Choosing deployment platform
- Configuring deployment settings
- Setting up CI/CD
- Configuring redirects
- Setting up monitoring
- Documentation

**Key Files**:

- Platform-specific config files
- CI/CD configuration (`.github/workflows/*.yml`)
- Redirects file (`public/_redirects`)
- `DEPLOYMENT.md`

---

### Task 15: Documentation & Handoff

**Status**: Open | **Priority**: P2

Create comprehensive documentation for the migrated codebase.

**Includes**:

- Creating README.md
- Documenting component structure
- Documenting page structure
- Documenting utilities
- Migration notes
- API documentation

**Key Files**:

- `README.md` (update)
- `docs/COMPONENTS.md` (new)
- `docs/PAGES.md` (new)
- `docs/UTILITIES.md` (new)
- `docs/MIGRATION_NOTES.md` (new)
- `docs/API.md` (new)

---

## Statistics

- **Total Epics**: 1
- **Total Tasks**: 15
- **Total Pages to Migrate**: 64 HTML pages
- **CSS Files to Migrate**: 3 files
- **JavaScript Files to Refactor**: Multiple inline scripts + webflow.js
- **Components to Create**: ~15+ reusable components
- **Third-Party Integrations**: 8+ integrations

## Next Steps

1. Review all tasks in beads: `bd list`
2. View detailed task information: `bd show <task-id>`
3. Start working on tasks: `bd update <task-id> --status in_progress`
4. Reference detailed migration plan: `MIGRATION_PLAN.md`

## Notes

- All tasks are currently in "open" status
- All tasks have priority P2 (medium)
- Detailed step-by-step instructions are available in `MIGRATION_PLAN.md`
- Each task includes file paths, function names, and best practices
- The migration maintains pixel-perfect layout fidelity as a core requirement

---

**Generated**: $(date) **Migration Plan**: See `MIGRATION_PLAN.md` for complete
detailed breakdown
