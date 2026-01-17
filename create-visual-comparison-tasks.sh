#!/bin/bash
# Script to create visual comparison tasks for all pages

EPIC_ID="legacy-nko"
BD_CMD="bd create"

# Function to create a task with detailed description
create_task() {
    local title="$1"
    local description="$2"
    local legacy_path="$3"
    local new_path="$4"
    
    local full_description="## Overview
${description}

## Legacy Page Location
\`${legacy_path}\`

## New Astro Page Location  
\`${new_path}\`

## Task Objectives
1. **Setup Static Server**: Start a static file server for the legacy site from \`src-legacy/\` directory
   - Recommended: Use \`python3 -m http.server 8000\` or \`npx serve src-legacy\`
   - Ensure legacy site is accessible at \`http://localhost:8000\`

2. **Setup New Site**: Ensure Astro dev server is running
   - Run \`npm run dev\` or \`astro dev\`
   - New site should be accessible at \`http://localhost:4321\` (or configured port)

3. **Visual Comparison Setup**: Configure Playwright for side-by-side comparison
   - Create test file in \`tests/visual/comparison/\` directory
   - Use Playwright's screenshot capabilities to capture both pages
   - Compare at multiple viewport sizes: mobile (375px), tablet (768px), desktop (1280px), desktop-wide (1920px)

4. **Visual Comparison Process**:
   - Navigate to legacy page: \`http://localhost:8000/${legacy_path#src-legacy/}\`
   - Navigate to new page: \`http://localhost:4321/${new_path#src/pages/}\` (adjust route as needed)
   - Capture screenshots of both pages at each viewport size
   - Use visual diff tools or manual inspection to identify discrepancies
   - Document all visual differences found

5. **Correction Process**:
   - For each discrepancy found:
     - Identify the root cause (CSS, HTML structure, component implementation)
     - Apply corrections to match the original design exactly
     - Ensure all Astro best practices are maintained:
       - Use Astro components (\`src/components/\`)
       - Follow established layout patterns (\`src/layouts/\`)
       - Maintain proper TypeScript types
       - Use responsive image components (\`Picture.astro\`, \`ResponsiveImage.astro\`)
       - Follow CSS organization in \`src/styles/\`
   - Test corrections at all viewport sizes
   - Verify functionality remains intact

6. **Verification**:
   - Run visual regression tests: \`npm run test:visual\`
   - Ensure no regressions in other pages
   - Verify accessibility: Run Lighthouse accessibility audit
   - Check responsive behavior across all breakpoints
   - Validate HTML structure and semantic correctness

## Key Files to Review
- Legacy HTML: \`${legacy_path}\`
- New Astro Page: \`${new_path}\`
- Related Components: Check \`src/components/\` for reusable components
- Layout Files: \`src/layouts/BaseLayout.astro\`, \`src/layouts/LandingLayout.astro\`, \`src/layouts/DashboardLayout.astro\`
- Styles: \`src/styles/\` directory
- Playwright Config: \`playwright.config.ts\`

## Best Practices to Maintain
- **Component Reusability**: Extract repeated patterns into Astro components
- **Performance**: Use Astro's image optimization features
- **Accessibility**: Maintain WCAG 2.1 AA compliance
- **SEO**: Ensure proper meta tags and semantic HTML
- **Type Safety**: Use TypeScript interfaces for props and data
- **Code Organization**: Follow existing project structure
- **Responsive Design**: Ensure mobile-first approach
- **CSS Organization**: Use established CSS architecture (critical/base.css, webflow styles)

## Testing Checklist
- [ ] Legacy page loads correctly on static server
- [ ] New page loads correctly on Astro dev server
- [ ] Visual comparison completed at all viewport sizes
- [ ] All discrepancies documented
- [ ] All corrections applied
- [ ] Visual regression tests pass
- [ ] No console errors
- [ ] Accessibility audit passes
- [ ] Responsive behavior verified
- [ ] Cross-browser testing (if applicable)

## Notes
- Maintain pixel-perfect accuracy while applying modern Astro patterns
- If legacy page uses Webflow CMS, ensure data structure matches
- Check for any dynamic content that needs API integration
- Verify all interactive elements (forms, buttons, links) work correctly
- Ensure proper error handling for missing data"

    $BD_CMD "$title" -t task -p 2 --parent "$EPIC_ID" --description "$full_description" --json
}

# Root Level Pages
create_task \
    "Visual Comparison: Homepage (index)" \
    "Compare and correct the homepage design to match the original exactly. This is the main landing page with hero section, job search form, and job board listings." \
    "src-legacy/index.html" \
    "src/pages/index.astro"

create_task \
    "Visual Comparison: Blog Listing Page" \
    "Compare and correct the blog listing page design. Includes blog post grid, featured post section, filter buttons, and newsletter section." \
    "src-legacy/blog.html" \
    "src/pages/blog.astro"

create_task \
    "Visual Comparison: Login Page" \
    "Compare and correct the login page design. Should redirect to Clerk sign-in but maintain visual consistency." \
    "src-legacy/log-in.html" \
    "src/pages/log-in.astro"

create_task \
    "Visual Comparison: Sign Up Page" \
    "Compare and correct the sign-up page design. Should redirect to Clerk sign-up but maintain visual consistency." \
    "src-legacy/sign-up.html" \
    "src/pages/sign-up.astro"

create_task \
    "Visual Comparison: Subscription Page (assine)" \
    "Compare and correct the subscription/plan selection page design. Includes plan cards, pricing, and subscription options." \
    "src-legacy/assine.html" \
    "src/pages/assine.astro"

create_task \
    "Visual Comparison: Checkout Page" \
    "Compare and correct the checkout page design. Includes payment form, order summary, and checkout flow." \
    "src-legacy/checkout.html" \
    "src/pages/checkout.astro"

create_task \
    "Visual Comparison: Init Checkout Page" \
    "Compare and correct the checkout initialization page design." \
    "src-legacy/init-checkout.html" \
    "src/pages/init-checkout.astro"

create_task \
    "Visual Comparison: PayPal Checkout Page" \
    "Compare and correct the PayPal-specific checkout page design." \
    "src-legacy/paypal-checkout.html" \
    "src/pages/paypal-checkout.astro"

create_task \
    "Visual Comparison: Order Confirmation Page" \
    "Compare and correct the order confirmation page design. Shows successful order completion." \
    "src-legacy/order-confirmation.html" \
    "src/pages/order-confirmation.astro"

create_task \
    "Visual Comparison: Search Results Page" \
    "Compare and correct the search results page design. Includes search form, results list, and filters." \
    "src-legacy/search.html" \
    "src/pages/search.astro"

create_task \
    "Visual Comparison: User Account Page" \
    "Compare and correct the user account management page design." \
    "src-legacy/user-account.html" \
    "src/pages/user-account.astro"

create_task \
    "Visual Comparison: Reset Password Page" \
    "Compare and correct the password reset page design." \
    "src-legacy/reset-password.html" \
    "src/pages/reset-password.astro"

create_task \
    "Visual Comparison: Update Password Page" \
    "Compare and correct the password update page design." \
    "src-legacy/update-password.html" \
    "src/pages/update-password.astro"

create_task \
    "Visual Comparison: Access Denied Page" \
    "Compare and correct the access denied/401 page design." \
    "src-legacy/access-denied.html" \
    "src/pages/access-denied.astro"

create_task \
    "Visual Comparison: 401 Unauthorized Page" \
    "Compare and correct the 401 unauthorized page design." \
    "src-legacy/401.html" \
    "src/pages/401.astro"

create_task \
    "Visual Comparison: 404 Not Found Page" \
    "Compare and correct the 404 not found page design." \
    "src-legacy/404.html" \
    "src/pages/404.astro"

create_task \
    "Visual Comparison: Brazilian Only Jobs Page" \
    "Compare and correct the Brazilian-only jobs filter page design." \
    "src-legacy/br-only.html" \
    "src/pages/br-only.astro"

create_task \
    "Visual Comparison: Privacy Policy Page (politicas)" \
    "Compare and correct the privacy policy page design." \
    "src-legacy/politicas.html" \
    "src/pages/politicas.astro"

create_task \
    "Visual Comparison: Partnerships Page (parcerias)" \
    "Compare and correct the partnerships page design." \
    "src-legacy/parcerias.html" \
    "src/pages/parcerias.astro"

create_task \
    "Visual Comparison: Ebook Landing Page" \
    "Compare and correct the ebook landing page design." \
    "src-legacy/ebook.html" \
    "src/pages/ebook.astro"

create_task \
    "Visual Comparison: Hotmart Affiliate Page" \
    "Compare and correct the Hotmart affiliate page design." \
    "src-legacy/afiliado-hotmart.html" \
    "src/pages/afiliado-hotmart.astro"

# Detail Pages (Dynamic Routes)
create_task \
    "Visual Comparison: Blog Post Detail Page" \
    "Compare and correct the blog post detail page design. This is a dynamic route that handles individual blog posts. Test with multiple blog post slugs to ensure consistency." \
    "src-legacy/detail_post.html" \
    "src/pages/blog/[slug].astro"

create_task \
    "Visual Comparison: Job Detail Page" \
    "Compare and correct the job detail page design. Dynamic route for individual job listings." \
    "src-legacy/detail_jobs.html" \
    "src/pages/jobs/[slug].astro"

create_task \
    "Visual Comparison: Job Category Detail Page" \
    "Compare and correct the job category detail page design." \
    "src-legacy/detail_job-category.html" \
    "src/pages/job-category/[slug].astro"

create_task \
    "Visual Comparison: Job Board Detail Page" \
    "Compare and correct the job board detail page design." \
    "src-legacy/detail_job-boards.html" \
    "src/pages/job-boards/[slug].astro"

create_task \
    "Visual Comparison: Category Detail Page" \
    "Compare and correct the category detail page design." \
    "src-legacy/detail_category.html" \
    "src/pages/category/[slug].astro"

create_task \
    "Visual Comparison: Product Detail Page" \
    "Compare and correct the product detail page design." \
    "src-legacy/detail_product.html" \
    "src/pages/product/[slug].astro"

create_task \
    "Visual Comparison: SKU Detail Page" \
    "Compare and correct the SKU detail page design." \
    "src-legacy/detail_sku.html" \
    "src/pages/sku/[slug].astro"

create_task \
    "Visual Comparison: Author Detail Page" \
    "Compare and correct the author detail page design." \
    "src-legacy/detail_author.html" \
    "src/pages/author/[slug].astro"

create_task \
    "Visual Comparison: People Detail Page" \
    "Compare and correct the people detail page design." \
    "src-legacy/detail_people.html" \
    "src/pages/people/[slug].astro"

create_task \
    "Visual Comparison: Partners Detail Page" \
    "Compare and correct the partners detail page design." \
    "src-legacy/detail_partners.html" \
    "src/pages/partners/[slug].astro"

create_task \
    "Visual Comparison: Affiliate Detail Page" \
    "Compare and correct the affiliate detail page design." \
    "src-legacy/detail_afiliado.html" \
    "src/pages/afiliado/[slug].astro"

create_task \
    "Visual Comparison: Video Detail Page" \
    "Compare and correct the video detail page design." \
    "src-legacy/detail_videos.html" \
    "src/pages/videos/[slug].astro"

create_task \
    "Visual Comparison: Lesson Detail Page (aulas)" \
    "Compare and correct the lesson detail page design." \
    "src-legacy/detail_aulas.html" \
    "src/pages/aulas/[slug].astro"

create_task \
    "Visual Comparison: Module Detail Page (modulo)" \
    "Compare and correct the module detail page design." \
    "src-legacy/detail_modulo.html" \
    "src/pages/modulo/[slug].astro"

create_task \
    "Visual Comparison: Event Detail Page (eventos)" \
    "Compare and correct the event detail page design." \
    "src-legacy/detail_eventos.html" \
    "src/pages/eventos/[slug].astro"

create_task \
    "Visual Comparison: Q&A Detail Page" \
    "Compare and correct the Q&A detail page design." \
    "src-legacy/detail_qa.html" \
    "src/pages/qa/[slug].astro"

create_task \
    "Visual Comparison: Q&A Tags Detail Page" \
    "Compare and correct the Q&A tags detail page design." \
    "src-legacy/detail_qa-tags.html" \
    "src/pages/qa-tags/[slug].astro"

create_task \
    "Visual Comparison: Resume Review Detail Page" \
    "Compare and correct the resume review detail page design." \
    "src-legacy/detail_resume-review.html" \
    "src/pages/resume-review/[slug].astro"

create_task \
    "Visual Comparison: ChatGPT Detail Page" \
    "Compare and correct the ChatGPT detail page design." \
    "src-legacy/detail_chatgpt.html" \
    "src/pages/chatgpt/[slug].astro"

create_task \
    "Visual Comparison: Hub Link Detail Page" \
    "Compare and correct the hub link detail page design." \
    "src-legacy/detail_hub-link.html" \
    "src/pages/hub-link/[slug].astro"

# JNG Pages
create_task \
    "Visual Comparison: JNG Community Page" \
    "Compare and correct the JNG community page design. Protected route requiring authentication." \
    "src-legacy/jng/community.html" \
    "src/pages/jng/community.astro"

create_task \
    "Visual Comparison: JNG Companies Hiring Page" \
    "Compare and correct the JNG companies hiring page design. Protected route." \
    "src-legacy/jng/companies-hiring.html" \
    "src/pages/jng/companies-hiring.astro"

create_task \
    "Visual Comparison: JNG Course Page" \
    "Compare and correct the JNG course page design. Protected route." \
    "src-legacy/jng/course.html" \
    "src/pages/jng/course.astro"

create_task \
    "Visual Comparison: JNG Interview Q&A Page" \
    "Compare and correct the JNG interview Q&A page design. Protected route." \
    "src-legacy/jng/interview-q-a.html" \
    "src/pages/jng/interview-q-a.astro"

create_task \
    "Visual Comparison: JNG Job Search Page" \
    "Compare and correct the JNG job search page design. Protected route." \
    "src-legacy/jng/job-search.html" \
    "src/pages/jng/job-search.astro"

create_task \
    "Visual Comparison: JNG Jobs BRs Only Page" \
    "Compare and correct the JNG jobs BRs only page design. Protected route." \
    "src-legacy/jng/jobs-brs-only.html" \
    "src/pages/jng/jobs-brs-only.astro"

create_task \
    "Visual Comparison: JNG Jobs with Vista Sponsors Page" \
    "Compare and correct the JNG jobs with Vista sponsors page design. Protected route." \
    "src-legacy/jng/jobs-with-vista-sponsors.html" \
    "src/pages/jng/jobs-with-vista-sponsors.astro"

create_task \
    "Visual Comparison: JNG Jobs Listing Page" \
    "Compare and correct the JNG jobs listing page design. Protected route." \
    "src-legacy/jng/jobs.html" \
    "src/pages/jng/jobs.astro"

create_task \
    "Visual Comparison: JNG Member Dashboard Page" \
    "Compare and correct the JNG member dashboard page design. Protected route with user-specific content." \
    "src-legacy/jng/member-dashboard.html" \
    "src/pages/jng/member-dashboard.astro"

create_task \
    "Visual Comparison: JNG My Account Page" \
    "Compare and correct the JNG my account page design. Protected route." \
    "src-legacy/jng/my-account.html" \
    "src/pages/jng/my-account.astro"

create_task \
    "Visual Comparison: JNG Onboarding Page" \
    "Compare and correct the JNG onboarding page design. Protected route." \
    "src-legacy/jng/onboarding.html" \
    "src/pages/jng/onboarding.astro"

create_task \
    "Visual Comparison: JNG Partners Page" \
    "Compare and correct the JNG partners page design. Protected route." \
    "src-legacy/jng/partners.html" \
    "src/pages/jng/partners.astro"

create_task \
    "Visual Comparison: JNG Resume Generator Page" \
    "Compare and correct the JNG resume generator page design. Protected route." \
    "src-legacy/jng/resume-generator.html" \
    "src/pages/jng/resume-generator.astro"

# Other Subdirectory Pages
create_task \
    "Visual Comparison: Basic Dashboard Page" \
    "Compare and correct the basic dashboard page design." \
    "src-legacy/basic/dashboard.html" \
    "src/pages/basic/dashboard.astro"

create_task \
    "Visual Comparison: Landing Page - Assine Basic" \
    "Compare and correct the landing page for basic subscription design." \
    "src-legacy/lp/assine-basic.html" \
    "src/pages/lp/assine-basic.astro"

create_task \
    "Visual Comparison: Landing Page - Workshop Busca de Vagas" \
    "Compare and correct the workshop landing page design." \
    "src-legacy/lp/workshop-busca-de-vagas.html" \
    "src/pages/lp/workshop-busca-de-vagas.astro"

create_task \
    "Visual Comparison: Members ChatGPT Page" \
    "Compare and correct the members ChatGPT page design. Protected route." \
    "src-legacy/members/chatgpt.html" \
    "src/pages/members/chatgpt.astro"

create_task \
    "Visual Comparison: Payment Success Page" \
    "Compare and correct the payment success page design." \
    "src-legacy/payment/success.html" \
    "src/pages/payment/success.astro"

create_task \
    "Visual Comparison: Products - Job Hunting Page" \
    "Compare and correct the job hunting product page design." \
    "src-legacy/products/jobhunting.html" \
    "src/pages/products/jobhunting.astro"

create_task \
    "Visual Comparison: Products - Networking Page" \
    "Compare and correct the networking product page design." \
    "src-legacy/products/networking.html" \
    "src/pages/products/networking.astro"

create_task \
    "Visual Comparison: Products - Personal Branding Page" \
    "Compare and correct the personal branding product page design." \
    "src-legacy/products/personal-branding.html" \
    "src/pages/products/personal-branding.astro"

echo "All tasks created successfully!"
