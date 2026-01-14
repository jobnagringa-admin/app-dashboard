/**
 * CMS Data Fetching Utilities
 *
 * This module provides utility functions for fetching and filtering CMS data,
 * replacing Finsweet Attributes functionality with native Astro/TypeScript code.
 *
 * Migration Reference:
 * - fs-cmsload-element="list" -> getCollection()
 * - fs-cmsfilter-element="list" -> filter() functions
 * - fs-cmsload-mode="pagination" -> paginate() helper
 * - fs-cmsload-mode="infinite" -> cursor-based pagination
 * - fs-cmsfilter-field="*" -> full-text search
 *
 * Note: These are placeholder implementations. Replace with actual data source
 * (headless CMS API, database, or static JSON files) during migration.
 */

import { getCollection, type CollectionEntry } from 'astro:content';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  cursor?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextCursor?: string;
}

export interface JobFilters {
  position?: string;
  categories?: string[];
  location?: string;
  level?: string;
  searchCategory?: string;
  openForBrazilians?: boolean;
  sponsorsVisa?: boolean;
  search?: string;
}

export interface QAFilters {
  title?: string;
  tag?: string;
  level?: string;
  search?: string;
}

export interface PostFilters {
  tags?: string[];
  author?: string;
  search?: string;
}

// ============================================================================
// GENERIC PAGINATION HELPER
// ============================================================================

/**
 * Paginate an array of items
 * Replaces: fs-cmsload-mode="pagination"
 */
export function paginate<T>(items: T[], options: PaginationOptions = {}): PaginatedResult<T> {
  const { page = 1, pageSize = 10 } = options;
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    items: items.slice(startIndex, endIndex),
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Infinite scroll pagination with cursor
 * Replaces: fs-cmsload-mode="infinite"
 */
export function infiniteScroll<T extends { id?: string; slug?: string }>(
  items: T[],
  options: PaginationOptions = {}
): PaginatedResult<T> {
  const { pageSize = 10, cursor } = options;
  let startIndex = 0;

  if (cursor) {
    const cursorIndex = items.findIndex((item) => (item.id || item.slug) === cursor);
    startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
  }

  const slicedItems = items.slice(startIndex, startIndex + pageSize);
  const lastItem = slicedItems[slicedItems.length - 1];

  return {
    items: slicedItems,
    total: items.length,
    page: Math.floor(startIndex / pageSize) + 1,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize),
    hasNextPage: startIndex + pageSize < items.length,
    hasPrevPage: startIndex > 0,
    nextCursor: lastItem ? lastItem.id || lastItem.slug : undefined,
  };
}

// ============================================================================
// FULL-TEXT SEARCH
// ============================================================================

/**
 * Simple full-text search across object fields
 * Replaces: fs-cmsfilter-field="*"
 */
export function fullTextSearch<T extends Record<string, unknown>>(
  items: T[],
  query: string,
  searchFields?: (keyof T)[]
): T[] {
  if (!query.trim()) return items;

  const normalizedQuery = query.toLowerCase().trim();
  const terms = normalizedQuery.split(/\s+/);

  return items.filter((item) => {
    const fieldsToSearch = searchFields || (Object.keys(item) as (keyof T)[]);
    const searchableText = fieldsToSearch
      .map((field) => {
        const value = item[field];
        if (typeof value === 'string') return value;
        if (Array.isArray(value)) return value.join(' ');
        return '';
      })
      .join(' ')
      .toLowerCase();

    return terms.every((term) => searchableText.includes(term));
  });
}

// ============================================================================
// JOBS COLLECTION
// ============================================================================

/**
 * Get all jobs with optional filtering
 * Replaces: fs-cmsfilter-element="list" on job listings
 *
 * Finsweet field mappings:
 * - fs-cmsfilter-field="position" -> filters.position
 * - fs-cmsfilter-field="categories" -> filters.categories
 * - fs-cmsfilter-field="location" -> filters.location
 * - fs-cmsfilter-field="level" -> filters.level
 * - fs-cmsfilter-field="search-category" -> filters.searchCategory
 * - fs-cmsfilter-field="position, category, detail" -> filters.search
 */
export async function getJobs(
  filters: JobFilters = {},
  pagination?: PaginationOptions
): Promise<PaginatedResult<CollectionEntry<'jobs'>>> {
  let jobs = await getCollection('jobs');

  // Apply filters
  if (filters.position) {
    const search = filters.position.toLowerCase();
    jobs = jobs.filter((job) => job.data.position.toLowerCase().includes(search));
  }

  if (filters.categories?.length) {
    jobs = jobs.filter((job) =>
      filters.categories!.some((cat) => job.data.categories.includes(cat))
    );
  }

  if (filters.location) {
    const search = filters.location.toLowerCase();
    jobs = jobs.filter((job) => job.data.location?.toLowerCase().includes(search));
  }

  if (filters.level) {
    jobs = jobs.filter((job) => job.data.level === filters.level);
  }

  if (filters.searchCategory) {
    jobs = jobs.filter((job) => job.data.searchCategory === filters.searchCategory);
  }

  if (filters.openForBrazilians !== undefined) {
    jobs = jobs.filter((job) => job.data.openForBrazilians === filters.openForBrazilians);
  }

  if (filters.sponsorsVisa !== undefined) {
    jobs = jobs.filter((job) => job.data.sponsorsVisa === filters.sponsorsVisa);
  }

  // Full-text search across position, categories, and detail
  if (filters.search) {
    jobs = fullTextSearch(
      jobs.map((j) => ({ ...j.data, _entry: j })),
      filters.search,
      ['position', 'categories', 'detail'] as any
    ).map((item) => (item as any)._entry);
  }

  // Sort by featured first, then by date
  jobs.sort((a, b) => {
    if (a.data.featured && !b.data.featured) return -1;
    if (!a.data.featured && b.data.featured) return 1;
    const dateA = a.data.publishedAt?.getTime() || 0;
    const dateB = b.data.publishedAt?.getTime() || 0;
    return dateB - dateA;
  });

  return paginate(jobs, pagination);
}

/**
 * Get a single job by slug
 */
export async function getJobBySlug(slug: string): Promise<CollectionEntry<'jobs'> | undefined> {
  const jobs = await getCollection('jobs');
  return jobs.find((job) => job.data.slug === slug);
}

/**
 * Get job categories with job counts
 */
export async function getJobCategories(): Promise<CollectionEntry<'jobCategories'>[]> {
  const categories = await getCollection('jobCategories');
  const jobs = await getCollection('jobs');

  // Update job counts
  return categories.map((category) => ({
    ...category,
    data: {
      ...category.data,
      jobCount: jobs.filter((job) => job.data.categories.includes(category.data.slug)).length,
    },
  }));
}

/**
 * Get jobs by category slug
 */
export async function getJobsByCategory(
  categorySlug: string,
  pagination?: PaginationOptions
): Promise<PaginatedResult<CollectionEntry<'jobs'>>> {
  return getJobs({ categories: [categorySlug] }, pagination);
}

// ============================================================================
// BLOG POSTS COLLECTION
// ============================================================================

/**
 * Get all blog posts with optional filtering
 */
export async function getPosts(
  filters: PostFilters = {},
  pagination?: PaginationOptions
): Promise<PaginatedResult<CollectionEntry<'posts'>>> {
  let posts = await getCollection('posts');

  if (filters.tags?.length) {
    posts = posts.filter((post) => filters.tags!.some((tag) => post.data.tags.includes(tag)));
  }

  if (filters.author) {
    posts = posts.filter((post) => post.data.author?.name === filters.author);
  }

  if (filters.search) {
    posts = fullTextSearch(
      posts.map((p) => ({ ...p.data, _entry: p })),
      filters.search,
      ['title', 'subheading', 'tags'] as any
    ).map((item) => (item as any)._entry);
  }

  // Sort by date descending
  posts.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());

  return paginate(posts, pagination);
}

/**
 * Get a single post by slug
 * Note: For content collections, slug is derived from the filename (entry.id)
 */
export async function getPostBySlug(slug: string): Promise<CollectionEntry<'posts'> | undefined> {
  const posts = await getCollection('posts');
  return posts.find((post) => post.id === slug);
}

// ============================================================================
// PARTNERS COLLECTION
// ============================================================================

/**
 * Get all partners
 */
export async function getPartners(
  pagination?: PaginationOptions
): Promise<PaginatedResult<CollectionEntry<'partners'>>> {
  const partners = await getCollection('partners');

  // Sort featured first
  partners.sort((a, b) => {
    if (a.data.featured && !b.data.featured) return -1;
    if (!a.data.featured && b.data.featured) return 1;
    return 0;
  });

  return paginate(partners, pagination);
}

/**
 * Get a single partner by slug
 * Note: For content collections, slug is derived from the filename (entry.id)
 */
export async function getPartnerBySlug(
  slug: string
): Promise<CollectionEntry<'partners'> | undefined> {
  const partners = await getCollection('partners');
  return partners.find((partner) => partner.id === slug);
}

// ============================================================================
// Q&A COLLECTION
// ============================================================================

/**
 * Get Q&A items with filtering
 * Replaces Finsweet filter on interview-q-a.html
 *
 * Finsweet field mappings:
 * - fs-cmsfilter-field="title" -> filters.title
 * - fs-cmsfilter-field="tag" -> filters.tag
 * - fs-cmsfilter-field="level" -> filters.level
 * - fs-cmsfilter-field="*" -> filters.search
 */
export async function getQAItems(
  filters: QAFilters = {},
  pagination?: PaginationOptions
): Promise<PaginatedResult<CollectionEntry<'qa'>>> {
  let items = await getCollection('qa');

  if (filters.title) {
    const search = filters.title.toLowerCase();
    items = items.filter((item) => item.data.title.toLowerCase().includes(search));
  }

  if (filters.tag) {
    items = items.filter(
      (item) => item.data.tag === filters.tag || item.data.tags.includes(filters.tag!)
    );
  }

  if (filters.level) {
    items = items.filter((item) => item.data.level === filters.level);
  }

  if (filters.search) {
    items = fullTextSearch(
      items.map((i) => ({ ...i.data, _entry: i })),
      filters.search
    ).map((item) => (item as any)._entry);
  }

  return paginate(items, pagination);
}

/**
 * Get Q&A by tag slug
 */
export async function getQAByTag(
  tagSlug: string,
  pagination?: PaginationOptions
): Promise<PaginatedResult<CollectionEntry<'qa'>>> {
  return getQAItems({ tag: tagSlug }, pagination);
}

/**
 * Get Q&A tags with question counts
 */
export async function getQATags(): Promise<CollectionEntry<'qaTags'>[]> {
  const tags = await getCollection('qaTags');
  const questions = await getCollection('qa');

  return tags.map((tag) => ({
    ...tag,
    data: {
      ...tag.data,
      questionCount: questions.filter(
        (q) => q.data.tag === tag.data.slug || q.data.tags.includes(tag.data.slug)
      ).length,
    },
  }));
}

// ============================================================================
// COURSES & LESSONS COLLECTION
// ============================================================================

/**
 * Get all courses
 */
export async function getCourses(
  pagination?: PaginationOptions
): Promise<PaginatedResult<CollectionEntry<'courses'>>> {
  const courses = await getCollection('courses');
  return paginate(courses, pagination);
}

/**
 * Get a course by slug with its lessons
 */
export async function getCourseWithLessons(courseSlug: string): Promise<{
  course: CollectionEntry<'courses'> | undefined;
  lessons: CollectionEntry<'lessons'>[];
}> {
  const courses = await getCollection('courses');
  const course = courses.find((c) => c.data.slug === courseSlug);

  if (!course) {
    return { course: undefined, lessons: [] };
  }

  const allLessons = await getCollection('lessons');
  const lessons = allLessons
    .filter((lesson) => lesson.data.courseId === course.id)
    .sort((a, b) => a.data.order - b.data.order);

  return { course, lessons };
}

/**
 * Get lessons by course ID
 */
export async function getLessonsByCourse(courseId: string): Promise<CollectionEntry<'lessons'>[]> {
  const lessons = await getCollection('lessons');
  return lessons
    .filter((lesson) => lesson.data.courseId === courseId)
    .sort((a, b) => a.data.order - b.data.order);
}

// ============================================================================
// VIDEOS COLLECTION
// ============================================================================

/**
 * Get all videos
 */
export async function getVideos(
  pagination?: PaginationOptions
): Promise<PaginatedResult<CollectionEntry<'videos'>>> {
  const videos = await getCollection('videos');

  // Sort by date
  videos.sort((a, b) => {
    const dateA = a.data.publishedAt?.getTime() || 0;
    const dateB = b.data.publishedAt?.getTime() || 0;
    return dateB - dateA;
  });

  return paginate(videos, pagination);
}

// ============================================================================
// PRODUCTS COLLECTION
// ============================================================================

/**
 * Get all products
 */
export async function getProducts(
  pagination?: PaginationOptions
): Promise<PaginatedResult<CollectionEntry<'products'>>> {
  const products = await getCollection('products');

  // Sort featured first, then available
  products.sort((a, b) => {
    if (a.data.featured && !b.data.featured) return -1;
    if (!a.data.featured && b.data.featured) return 1;
    if (a.data.available && !b.data.available) return -1;
    if (!a.data.available && b.data.available) return 1;
    return 0;
  });

  return paginate(products, pagination);
}

/**
 * Get a product by slug
 * Note: For content collections, slug is derived from the filename (entry.id)
 */
export async function getProductBySlug(
  slug: string
): Promise<CollectionEntry<'products'> | undefined> {
  const products = await getCollection('products');
  return products.find((product) => product.id === slug);
}

// ============================================================================
// DASHBOARD CARDS COLLECTION
// ============================================================================

/**
 * Get dashboard cards with optional category filtering
 * Replaces: fs-cmsfilter-field="categories" on dashboard
 */
export async function getDashboardCards(
  categories?: string[],
  pagination?: PaginationOptions
): Promise<PaginatedResult<CollectionEntry<'dashboardCards'>>> {
  let cards = await getCollection('dashboardCards');

  if (categories?.length) {
    cards = cards.filter((card) => categories.some((cat) => card.data.categories.includes(cat)));
  }

  // Sort by order, then featured
  cards.sort((a, b) => {
    if (a.data.featured && !b.data.featured) return -1;
    if (!a.data.featured && b.data.featured) return 1;
    return a.data.order - b.data.order;
  });

  return paginate(cards, pagination);
}

// ============================================================================
// MEMBERSHIP ACCESS HELPERS
// ============================================================================

/**
 * Filter collection items by membership access
 * Replaces: data-ms-content="community" / data-ms-content="!community"
 */
export function filterByMembership<T extends { data: { memberOnly?: boolean } }>(
  items: T[],
  isPaidMember: boolean
): T[] {
  if (isPaidMember) {
    // Paid members see everything
    return items;
  }
  // Non-paid members only see non-member-only content
  return items.filter((item) => !item.data.memberOnly);
}

/**
 * Check if content requires membership
 */
export function requiresMembership<T extends { data: { memberOnly?: boolean } }>(item: T): boolean {
  return item.data.memberOnly === true;
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

export { getCollection, type CollectionEntry } from 'astro:content';
