/**
 * Astro Content Collections Schema Configuration
 *
 * This file defines the Zod schemas for all CMS collections that were
 * previously managed by Webflow CMS with Finsweet Attributes.
 *
 * Collections identified from legacy HTML analysis:
 * - jobs: Job listings with filtering by category, location, level
 * - jobCategories: Job category taxonomy
 * - posts: Blog posts with author and rich content
 * - partners: Partner/sponsor profiles
 * - courses: Course modules and lessons
 * - lessons: Individual lessons within courses
 * - videos: Video content
 * - qa: Interview Q&A content
 * - qaTags: Q&A category tags
 * - resumeReviews: Resume review content
 * - products: Products (Networking, Personal Branding, Job Hunting)
 * - affiliates: Affiliate program content
 *
 * Migration Notes:
 * - Webflow w-dyn-* attributes are replaced with Astro getCollection()
 * - Finsweet CMS Load/Filter replaced with native filtering functions
 * - Rich text fields use Astro's built-in markdown processing
 */

import { z, defineCollection } from 'astro:content';

/**
 * Jobs Collection
 *
 * Source: jobs.html, br-only.html, jobs-with-vista-sponsors.html
 * Finsweet fields: position, categories, location, level, detail, search-category
 */
const jobsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    // Core fields
    position: z.string().describe('Job title/position'),
    company: z.string().optional().describe('Company name'),
    companyLogo: z.string().optional().describe('Company logo URL'),

    // Categorization (used for filtering)
    categories: z.array(z.string()).default([]).describe('Job categories/fields'),
    searchCategory: z.string().optional().describe('Search category for filtering'),

    // Location
    location: z.string().optional().describe('Work location'),
    workFrom: z.string().optional().describe('Remote/hybrid/onsite'),

    // Experience level
    level: z.string().optional().describe('Experience level (Junior, Mid, Senior)'),

    // Content
    detail: z.string().optional().describe('Job description (rich text)'),

    // Targeting
    openForBrazilians: z.boolean().default(false).describe('Open for Brazilian applicants'),
    sponsorsVisa: z.boolean().default(false).describe('Company sponsors visa'),

    // Links
    applyUrl: z.string().url().optional().describe('Application URL'),
    slug: z.string().describe('URL slug'),

    // Metadata
    publishedAt: z.coerce.date().optional(),
    featured: z.boolean().default(false),
  }),
});

/**
 * Job Categories Collection
 *
 * Source: Footer collection list, index.html category badges
 * Used for job filtering and navigation
 */
const jobCategoriesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string().describe('Category name'),
    slug: z.string().describe('URL slug'),
    icon: z.string().optional().describe('Category icon'),
    description: z.string().optional(),
    jobCount: z.number().default(0).describe('Number of jobs in category'),
  }),
});

/**
 * Blog Posts Collection
 *
 * Source: blog.html, detail_post.html
 * Fields: heading, subheading, author_thumb, rich-text, tags
 */
const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // Core content
    title: z.string().describe('Post title (lp-header_heading)'),
    subheading: z.string().optional().describe('Post subtitle (blog_subheading)'),
    excerpt: z.string().optional().describe('Short excerpt for listing'),

    // Author info
    author: z.object({
      name: z.string(),
      avatar: z.string().optional().describe('author_thumb image URL'),
      bio: z.string().optional(),
    }).optional(),

    // Categorization
    tags: z.array(z.string()).default([]).describe('Post tags/categories'),

    // Media
    featuredImage: z.string().optional(),

    // Metadata
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    slug: z.string(),

    // Access control
    memberOnly: z.boolean().default(false).describe('Requires paid membership'),
  }),
});

/**
 * Partners Collection
 *
 * Source: partners.html, detail_partners.html
 * Fields: thumbnail, heading, subheading, rich-text
 */
const partnersCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string().describe('Partner name (lp-header_heading)'),
    description: z.string().optional().describe('Partner description (blog_subheading)'),
    logo: z.string().optional().describe('Partner logo (card_image-thumbnail)'),

    // Rich content
    content: z.string().optional().describe('Partner details (blog_rich-text)'),

    // Links
    website: z.string().url().optional(),
    slug: z.string(),

    // Display
    featured: z.boolean().default(false),
  }),
});

/**
 * Courses Collection
 *
 * Source: detail_aulas.html, detail_modulo.html
 * Contains course modules with lessons
 */
const coursesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string().describe('Course title'),
    description: z.string().optional(),

    // Instructor
    instructor: z.object({
      name: z.string(),
      avatar: z.string().optional().describe('user-card__thumbnail'),
      bio: z.string().optional(),
    }).optional(),

    // Structure
    moduleCount: z.number().default(0),
    lessonCount: z.number().default(0),

    // Media
    thumbnail: z.string().optional(),
    previewVideo: z.string().optional(),

    // Access
    memberOnly: z.boolean().default(true),
    slug: z.string(),
  }),
});

/**
 * Lessons Collection
 *
 * Source: detail_aulas.html, detail_chatgpt.html
 * Fields: title, video, rich-text, author
 */
const lessonsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().describe('Lesson title (single-lesson_title)'),
    description: z.string().optional(),

    // Course relationship
    courseId: z.string().describe('Parent course ID'),
    moduleId: z.string().optional().describe('Parent module ID'),
    order: z.number().default(0).describe('Lesson order in module'),

    // Instructor
    instructor: z.object({
      name: z.string(),
      avatar: z.string().optional().describe('user-card__thumbnail'),
    }).optional(),

    // Media
    videoUrl: z.string().optional().describe('Video URL (course_video)'),
    duration: z.number().optional().describe('Duration in minutes'),

    // Content
    content: z.string().optional().describe('Lesson content (lesson_rich-text)'),

    // Next steps
    nextLesson: z.object({
      title: z.string(),
      description: z.string().optional(),
    }).optional().describe('heading-style-3 + p section'),

    // Access
    memberOnly: z.boolean().default(true),
    slug: z.string(),
  }),
});

/**
 * Videos Collection
 *
 * Source: detail_videos.html
 */
const videosCollection = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string().describe('Video title (heading-style-h3)'),
    description: z.string().optional(),
    videoUrl: z.string().describe('Video embed URL (video-card_wrapper)'),
    thumbnail: z.string().optional(),
    duration: z.number().optional().describe('Duration in minutes'),

    // Categorization
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),

    // Access
    memberOnly: z.boolean().default(true),
    slug: z.string(),

    publishedAt: z.coerce.date().optional(),
  }),
});

/**
 * Q&A Collection (Interview Questions)
 *
 * Source: interview-q-a.html, detail_qa.html, detail_qa-tags.html
 * Finsweet fields: title, tag, level
 */
const qaCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().describe('Question title (card-title-medium)'),
    question: z.string().describe('Full question text'),
    answer: z.string().describe('Answer content (qa_answer-content rich text)'),

    // Categorization (used for filtering)
    tag: z.string().optional().describe('Primary tag (fs-cmsfilter-field="tag")'),
    tags: z.array(z.string()).default([]).describe('All related tags'),
    level: z.string().optional().describe('Difficulty level (fs-cmsfilter-field="level")'),

    // Access
    memberOnly: z.boolean().default(true),
    slug: z.string(),
  }),
});

/**
 * Q&A Tags Collection
 *
 * Source: detail_qa-tags.html tag groups
 */
const qaTagsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    questionCount: z.number().default(0),
    color: z.string().optional().describe('Badge color class'),
  }),
});

/**
 * Resume Reviews Collection
 *
 * Source: detail_resume-review.html
 */
const resumeReviewsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().describe('Review title (heading-style-h3)'),
    content: z.string().describe('Review content (resume_richtext)'),

    // Author
    reviewee: z.string().optional().describe('Person whose resume is reviewed'),
    reviewer: z.string().optional(),

    // Access
    memberOnly: z.boolean().default(true),
    slug: z.string(),

    publishedAt: z.coerce.date().optional(),
  }),
});

/**
 * Products Collection
 *
 * Source: products/networking.html, personal-branding.html, jobhunting.html
 */
const productsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().describe('Product title (heading-style-h2)'),
    subtitle: z.string().optional(),
    description: z.string().optional(),

    // Content
    content: z.string().describe('Product details (lesson_rich-text)'),

    // Media
    thumbnail: z.string().optional(),
    heroImage: z.string().optional(),

    // Pricing
    price: z.number().optional(),
    currency: z.string().default('BRL'),

    // Links
    purchaseUrl: z.string().url().optional(),
    slug: z.string(),

    // Status
    featured: z.boolean().default(false),
    available: z.boolean().default(true),
  }),
});

/**
 * Affiliates Collection
 *
 * Source: detail_afiliado.html
 */
const affiliatesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    description: z.string().optional(),
    logo: z.string().optional().describe('afiliados_head-image'),

    // Links
    affiliateUrl: z.string().url().optional(),
    slug: z.string(),

    // Commission
    commissionRate: z.number().optional(),
    commissionType: z.enum(['percentage', 'fixed']).default('percentage'),

    featured: z.boolean().default(false),
  }),
});

/**
 * Dashboard Cards Collection
 *
 * Source: basic/dashboard.html
 * Generic cards displayed on member dashboard
 */
const dashboardCardsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string().describe('Card title (dashboard-card_title)'),
    description: z.string().optional().describe('Card description (text-size-tiny)'),
    thumbnail: z.string().optional().describe('Card thumbnail (dashboard-card_thumbnail)'),

    // Categorization (used for filtering)
    categories: z.array(z.string()).default([]).describe('fs-cmsfilter-field="categories"'),

    // Link
    href: z.string().optional(),

    // Display
    order: z.number().default(0),
    featured: z.boolean().default(false),
  }),
});

/**
 * Export all collections
 */
export const collections = {
  jobs: jobsCollection,
  jobCategories: jobCategoriesCollection,
  posts: postsCollection,
  partners: partnersCollection,
  courses: coursesCollection,
  lessons: lessonsCollection,
  videos: videosCollection,
  qa: qaCollection,
  qaTags: qaTagsCollection,
  resumeReviews: resumeReviewsCollection,
  products: productsCollection,
  affiliates: affiliatesCollection,
  dashboardCards: dashboardCardsCollection,
};
