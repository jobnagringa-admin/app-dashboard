# CMS Migration Guide: Webflow to Astro

This guide documents the migration strategy from Webflow CMS with Finsweet Attributes to Astro Content Collections.

## Table of Contents

1. [Overview](#overview)
2. [Collections Inventory](#collections-inventory)
3. [Finsweet Replacement Strategy](#finsweet-replacement-strategy)
4. [Field Mappings](#field-mappings)
5. [Implementation Steps](#implementation-steps)
6. [Recommended Headless CMS Options](#recommended-headless-cms-options)

---

## Overview

### Current Stack (Legacy)
- **CMS**: Webflow CMS
- **Dynamic Content**: `w-dyn-*` attributes
- **Enhanced Features**: Finsweet Attributes
  - CMS Load: Pagination, infinite scroll, animations
  - CMS Filter: Real-time filtering without page reload

### Target Stack (Astro)
- **CMS**: Astro Content Collections (with optional headless CMS backend)
- **Dynamic Content**: `getCollection()` API
- **Filtering**: Native TypeScript filter functions

---

## Collections Inventory

### 1. Jobs Collection
**Source Files**: `jobs.html`, `br-only.html`, `jobs-with-vista-sponsors.html`

| Field | Webflow Class/Attribute | Finsweet Filter | Schema Field |
|-------|-------------------------|-----------------|--------------|
| Position | `job-card_info-detail.is-title` | `fs-cmsfilter-field="position"` | `position` |
| Company Logo | `job-card_info-thumbnail` | - | `companyLogo` |
| Categories | `job-card_info-detail` | `fs-cmsfilter-field="categories"` | `categories` |
| Location | `job-card_info-detail` | `fs-cmsfilter-field="location"` | `location` |
| Level | `job-card_info-detail` | `fs-cmsfilter-field="level"` | `level` |
| Description | `job-card_detail.w-richtext` | `fs-cmsfilter-field="detail"` | `detail` |
| Search Category | - | `fs-cmsfilter-field="search-category"` | `searchCategory` |

**Finsweet Config**:
```html
fs-cmsload-mode="pagination"
fs-cmsfilter-element="list"
fs-cmsload-element="list"
```

### 2. Job Categories
**Source Files**: Footer sections, `index.html` badges

| Field | Webflow Pattern | Schema Field |
|-------|-----------------|--------------|
| Name | `footer_link` text | `name` |
| Slug | Link href | `slug` |

### 3. Blog Posts
**Source Files**: `blog.html`, `detail_post.html`

| Field | Webflow Class | Schema Field |
|-------|---------------|--------------|
| Title | `lp-header_heading.w-dyn-bind-empty` | `title` |
| Subheading | `blog_subheading.w-dyn-bind-empty` | `subheading` |
| Author Avatar | `author_thumb.w-dyn-bind-empty` | `author.avatar` |
| Content | `blog_rich-text.w-dyn-bind-empty.w-richtext` | (markdown body) |
| Date | `text-size-small.text-color-grey` | `publishedAt` |
| Excerpt | `text-size-small.w-dyn-bind-empty` | `excerpt` |
| Tags | `badge_wrapper.is-blue` | `tags` |

### 4. Partners
**Source Files**: `partners.html`, `detail_partners.html`

| Field | Webflow Class | Schema Field |
|-------|---------------|--------------|
| Name | `lp-header_heading.w-dyn-bind-empty` | `name` |
| Description | `blog_subheading.is-large.w-dyn-bind-empty` | `description` |
| Logo | `card_image-thumbnail.w-dyn-bind-empty` | `logo` |
| Content | `blog_rich-text.w-dyn-bind-empty.w-richtext` | (markdown body) |

### 5. Courses & Lessons
**Source Files**: `detail_aulas.html`, `detail_modulo.html`, `detail_chatgpt.html`

**Courses**:
| Field | Webflow Class | Schema Field |
|-------|---------------|--------------|
| Title | heading elements | `title` |
| Instructor Name | text element | `instructor.name` |
| Instructor Avatar | `user-card__thumbnail.is-small` | `instructor.avatar` |

**Lessons**:
| Field | Webflow Class | Schema Field |
|-------|---------------|--------------|
| Title | `single-lesson_title.w-dyn-bind-empty` | `title` |
| Video | `course_video.w-dyn-bind-empty.w-video` | `videoUrl` |
| Content | `lesson_rich-text.w-dyn-bind-empty.w-richtext` | (markdown body) |
| Instructor | `user-card__thumbnail`, text | `instructor` |
| Next Lesson | `heading-style-3`, `p` | `nextLesson` |

### 6. Videos
**Source Files**: `detail_videos.html`

| Field | Webflow Class | Schema Field |
|-------|---------------|--------------|
| Title | `heading-style-h3.w-dyn-bind-empty` | `title` |
| Video | `video-card_wrapper.w-dyn-bind-empty.w-video` | `videoUrl` |
| Description | `.w-dyn-bind-empty` | `description` |

### 7. Q&A (Interview Questions)
**Source Files**: `interview-q-a.html`, `detail_qa.html`, `detail_qa-tags.html`

| Field | Webflow Class/Attribute | Finsweet Filter | Schema Field |
|-------|-------------------------|-----------------|--------------|
| Title | `card-title-medium.w-dyn-bind-empty` | `fs-cmsfilter-field="title"` | `title` |
| Tag | `badge_wrapper.is-blue` | `fs-cmsfilter-field="tag"` | `tag` |
| Level | `badge_wrapper.is-blue` | `fs-cmsfilter-field="level"` | `level` |
| Answer | `qa_answer-content.w-dyn-bind-empty.w-richtext` | - | `answer` |

**Finsweet Config**:
```html
fs-cmsload-animation="fade"
fs-cmsload-element="list"
fs-cmsload-mode="infinite"
fs-cmsload-duration="200"
fs-cmsfilter-element="list"
```

### 8. Resume Reviews
**Source Files**: `detail_resume-review.html`

| Field | Webflow Class | Schema Field |
|-------|---------------|--------------|
| Title | `heading-style-h3.w-dyn-bind-empty` | `title` |
| Content | `resume_richtext.w-dyn-bind-empty.w-richtext` | (markdown body) |

### 9. Products
**Source Files**: `products/networking.html`, `personal-branding.html`, `jobhunting.html`

| Field | Webflow Class | Schema Field |
|-------|---------------|--------------|
| Title | `heading-style-h2.w-dyn-bind-empty` | `title` |
| Subtitle | `.w-dyn-bind-empty` | `subtitle` |
| Description | `.w-dyn-bind-empty` | `description` |
| Content | `lesson_rich-text.w-dyn-bind-empty.w-richtext` | (markdown body) |

### 10. Dashboard Cards
**Source Files**: `basic/dashboard.html`, `jng/member-dashboard.html`

| Field | Webflow Class/Attribute | Finsweet Filter | Schema Field |
|-------|-------------------------|-----------------|--------------|
| Title | `dashboard-card_title.w-dyn-bind-empty` | - | `title` |
| Description | `text-size-tiny.w-dyn-bind-empty` | - | `description` |
| Thumbnail | `dashboard-card_thumbnail.w-dyn-bind-empty` | - | `thumbnail` |
| Categories | - | `fs-cmsfilter-field="categories"` | `categories` |

---

## Finsweet Replacement Strategy

### CMS Load Replacements

| Finsweet Attribute | Astro Replacement | Implementation |
|--------------------|-------------------|----------------|
| `fs-cmsload-element="list"` | `getCollection()` | Native Astro API |
| `fs-cmsload-mode="pagination"` | `paginate()` helper | See `cms.ts` |
| `fs-cmsload-mode="infinite"` | `infiniteScroll()` helper | Client-side with cursor |
| `fs-cmsload-animation="fade"` | CSS transitions | Astro View Transitions or custom CSS |
| `fs-cmsload-duration="200"` | CSS `transition-duration` | `200ms` |

### CMS Filter Replacements

| Finsweet Attribute | Astro Replacement | Implementation |
|--------------------|-------------------|----------------|
| `fs-cmsfilter-element="list"` | Filter function | TypeScript `filter()` |
| `fs-cmsfilter-element="filters"` | Form component | Astro component with JS |
| `fs-cmsfilter-element="empty"` | Conditional render | `{items.length === 0 && ...}` |
| `fs-cmsfilter-field="position"` | `filters.position` | Field-specific filter |
| `fs-cmsfilter-field="*"` | `fullTextSearch()` | Search across all fields |
| `fs-cmsfilter-field="position, category, detail"` | Multi-field search | Combined field search |

### Example Migration

**Before (Webflow + Finsweet)**:
```html
<div fs-cmsfilter-element="filters" class="job-search_form w-form">
  <input fs-cmsfilter-field="position, category, detail" type="text">
  <select fs-cmsfilter-field="location">...</select>
  <select fs-cmsfilter-field="level">...</select>
</div>
<div
  fs-cmsload-mode="pagination"
  fs-cmsfilter-element="list"
  fs-cmsload-element="list"
  class="job-card_collection-list w-dyn-items">
  <div class="w-dyn-item">
    <div fs-cmsfilter-field="position" class="job-card_info-detail is-title w-dyn-bind-empty"></div>
    <div fs-cmsfilter-field="categories" class="job-card_info-detail w-dyn-bind-empty"></div>
  </div>
</div>
<div fs-cmsfilter-element="empty" class="job-search_empty w-dyn-empty">
  No items found.
</div>
```

**After (Astro)**:
```astro
---
import { getJobs } from '@/lib/cms';

const url = new URL(Astro.request.url);
const filters = {
  search: url.searchParams.get('q') || undefined,
  location: url.searchParams.get('location') || undefined,
  level: url.searchParams.get('level') || undefined,
};
const page = parseInt(url.searchParams.get('page') || '1');

const { items: jobs, hasNextPage, hasPrevPage, totalPages } = await getJobs(
  filters,
  { page, pageSize: 10 }
);
---

<form class="job-search_form" method="GET">
  <input name="q" type="text" placeholder="Search jobs..." value={filters.search}>
  <select name="location">...</select>
  <select name="level">...</select>
  <button type="submit">Filter</button>
</form>

{jobs.length > 0 ? (
  <div class="job-card_collection-list">
    {jobs.map((job) => (
      <div class="job-card">
        <div class="job-card_info-detail is-title">{job.data.position}</div>
        <div class="job-card_info-detail">{job.data.categories.join(', ')}</div>
      </div>
    ))}
  </div>
) : (
  <div class="job-search_empty">
    No items found.
  </div>
)}

{/* Pagination */}
<nav class="job-board_pagination">
  {hasPrevPage && <a href={`?page=${page - 1}`}>Previous</a>}
  {hasNextPage && <a href={`?page=${page + 1}`}>Next</a>}
</nav>
```

---

## Field Mappings

### w-dyn-* Attribute Mappings

| Webflow Attribute | Purpose | Astro Equivalent |
|-------------------|---------|------------------|
| `w-dyn-list` | Collection list wrapper | `{#each}` or `.map()` |
| `w-dyn-items` | Collection items container | Array iteration |
| `w-dyn-item` | Single collection item | Individual item render |
| `w-dyn-bind-empty` | Field placeholder | Direct field binding |
| `w-dyn-empty` | Empty state | Conditional render |

### Membership Content Gating

**Before (Memberstack-style)**:
```html
<div data-ms-content="community">Paid members only</div>
<div data-ms-content="!community">Free content</div>
```

**After (Astro with Clerk)**:
```astro
---
import { filterByMembership } from '@/lib/cms';
const isPaidMember = Astro.locals.user?.publicMetadata?.isPaidCustomer === true;
---

{isPaidMember && <div>Paid members only</div>}
{!isPaidMember && <div>Free content</div>}
```

---

## Implementation Steps

### Phase 1: Schema Definition (Complete)
1. [x] Analyze all HTML files for CMS patterns
2. [x] Document all collections and their fields
3. [x] Create Zod schemas in `src/content/config.ts`
4. [x] Create utility functions in `src/lib/cms.ts`

### Phase 2: Data Migration
1. [ ] Choose a data source strategy:
   - Option A: Static JSON files in `src/content/`
   - Option B: Headless CMS (see recommendations below)
   - Option C: Database with API routes
2. [ ] Export existing Webflow CMS data
3. [ ] Transform data to match Astro schemas
4. [ ] Import data into chosen data source

### Phase 3: Component Migration
1. [ ] Create Astro components for each collection item
2. [ ] Implement filter components with form handling
3. [ ] Add pagination components
4. [ ] Implement client-side filtering (if needed for real-time)

### Phase 4: Page Migration
1. [ ] Update each page to use `getCollection()` API
2. [ ] Replace Finsweet attributes with Astro logic
3. [ ] Test all filter combinations
4. [ ] Verify pagination works correctly

### Phase 5: Testing & Optimization
1. [ ] Test membership content gating
2. [ ] Verify SEO (meta tags, canonical URLs)
3. [ ] Performance optimization (pagination limits, caching)
4. [ ] Accessibility testing

---

## Recommended Headless CMS Options

### For This Project

Given the existing Webflow background and content structure, here are the recommended options:

#### 1. **Sanity.io** (Recommended)
- **Pros**:
  - Flexible schema matching current collections
  - Real-time preview
  - Excellent TypeScript support
  - Free tier available
  - GROQ query language similar to filtering needs
- **Cons**: Learning curve for GROQ
- **Migration**: Easy export/import from Webflow

#### 2. **Contentful**
- **Pros**:
  - Mature platform
  - Good localization (for Portuguese content)
  - GraphQL API
- **Cons**:
  - More expensive at scale
  - More rigid content modeling

#### 3. **Strapi** (Self-hosted)
- **Pros**:
  - Open source
  - Full control
  - REST & GraphQL
- **Cons**:
  - Requires hosting infrastructure
  - More maintenance

#### 4. **Static JSON Files** (Simplest for POC)
- **Pros**:
  - No external dependencies
  - Version controlled with code
  - Zero cost
- **Cons**:
  - Manual updates
  - No admin interface

### Implementation with Static Files

For initial migration, use static JSON files:

```
src/content/
  jobs/
    job-1.json
    job-2.json
  posts/
    post-1.md (with frontmatter)
  partners/
    partner-1.json
```

The schemas in `config.ts` will validate all data on build.

---

## Quick Reference

### Import CMS Utilities
```typescript
import {
  getJobs,
  getPosts,
  getPartners,
  paginate,
  filterByMembership
} from '@/lib/cms';
```

### Common Patterns

**Get paginated jobs**:
```typescript
const { items, hasNextPage } = await getJobs({ level: 'Senior' }, { page: 1, pageSize: 10 });
```

**Filter Q&A by tag**:
```typescript
const { items } = await getQAByTag('ux-design');
```

**Full-text search**:
```typescript
const { items } = await getJobs({ search: 'software engineer' });
```

**Membership filtering**:
```typescript
const allPosts = await getCollection('posts');
const visiblePosts = filterByMembership(allPosts, isPaidMember);
```
