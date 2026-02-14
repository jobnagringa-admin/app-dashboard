/**
 * Strapi CMS Helper Functions
 *
 * This file contains helper functions for building queries,
 * transforming data, and common Strapi operations.
 */

import type {
  StrapiQueryParams,
  StrapiEntity,
  FlattenedStrapiEntity,
  StrapiCollectionResponse,
  StrapiSingleResponse,
} from '../types/strapi';
import { getStrapiImageURL } from './strapi';

/**
 * Build Strapi query parameters object
 *
 * @param options - Query options
 * @returns Strapi query parameters object
 */
export function buildStrapiQuery(
  options: {
    filters?: Record<string, unknown>;
    populate?: string | string[] | Record<string, unknown>;
    sort?: string | string[];
    pagination?: {
      page?: number;
      pageSize?: number;
      start?: number;
      limit?: number;
    };
    fields?: string | string[];
    publicationState?: 'live' | 'preview';
    locale?: string;
  } = {}
): StrapiQueryParams {
  const query: StrapiQueryParams = {};

  if (options.filters) {
    query.filters = options.filters;
  }

  if (options.populate) {
    query.populate = options.populate;
  }

  if (options.sort) {
    query.sort = options.sort;
  }

  if (options.pagination) {
    query.pagination = options.pagination;
  }

  if (options.fields) {
    query.fields = options.fields;
  }

  if (options.publicationState) {
    query.publicationState = options.publicationState;
  }

  if (options.locale) {
    query.locale = options.locale;
  }

  return query;
}

/**
 * Build populate query for relations
 *
 * @param relations - Array of relation names or nested populate object
 * @returns Populate query parameter
 */
export function buildPopulateQuery(
  relations: string[] | Record<string, unknown> = ['*']
): string | string[] | Record<string, unknown> {
  if (Array.isArray(relations) && relations.length === 0) {
    return '*';
  }
  return relations;
}

/**
 * Transform Strapi date string to Date object or formatted string
 *
 * @param dateString - Strapi date string (ISO format)
 * @param format - Optional format string (not implemented, returns Date)
 * @returns Date object
 */
export function transformStrapiDate(dateString: string | null | undefined): Date | null {
  if (!dateString) {
    return null;
  }
  return new Date(dateString);
}

/**
 * Flatten Strapi response structure
 *
 * Transforms StrapiEntity structure to a flat object with
 * attributes merged at the top level
 *
 * @param entity - Strapi entity
 * @returns Flattened entity
 */
export function flattenStrapiResponse<T = Record<string, unknown>>(
  entity: StrapiEntity<T>
): FlattenedStrapiEntity<T> {
  const { id, documentId, attributes } = entity;

  return {
    id,
    documentId,
    ...attributes,
  } as FlattenedStrapiEntity<T>;
}

/**
 * Flatten a collection of Strapi entities
 *
 * @param entities - Array of Strapi entities
 * @returns Array of flattened entities
 */
export function flattenStrapiCollection<T = Record<string, unknown>>(
  entities: StrapiEntity<T>[]
): FlattenedStrapiEntity<T>[] {
  return entities.map(flattenStrapiResponse);
}

/**
 * Transform Strapi image objects in an entity to URLs
 *
 * Recursively processes an entity and converts StrapiImage objects to URLs
 *
 * @param data - Entity data (can be nested)
 * @returns Transformed data with image URLs
 */
export function transformStrapiImages(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(transformStrapiImages);
  }

  const obj = data as Record<string, unknown>;

  // Check if it's a StrapiImage (has url and formats properties)
  if (
    typeof obj.url === 'string' &&
    (obj.formats || obj.provider === 'local' || obj.provider === 'cloudinary')
  ) {
    return getStrapiImageURL(obj as { url: string });
  }

  // Recursively transform nested objects
  const transformed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    transformed[key] = transformStrapiImages(value);
  }

  return transformed;
}

/**
 * Extract data from Strapi response (handles both single and collection)
 *
 * @param response - Strapi response
 * @returns Extracted data (single entity or array)
 */
export function extractStrapiData<T = Record<string, unknown>>(
  response: StrapiSingleResponse<T> | StrapiCollectionResponse<T>
): StrapiEntity<T> | StrapiEntity<T>[] {
  return response.data;
}

/**
 * Get pagination info from Strapi collection response
 *
 * @param response - Strapi collection response
 * @returns Pagination metadata or null
 */
export function getStrapiPagination<T = Record<string, unknown>>(
  response: StrapiCollectionResponse<T>
) {
  return response.meta?.pagination || null;
}
