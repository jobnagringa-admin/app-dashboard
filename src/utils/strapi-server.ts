/**
 * Strapi CMS Server-Side Utilities
 * 
 * This file contains server-side specific functions for fetching
 * Strapi content in Astro pages and components.
 */

import { getStrapiClient } from './strapi';
import {
  buildStrapiQuery,
  flattenStrapiResponse,
  flattenStrapiCollection,
  extractStrapiData,
} from './strapi-helpers';
import type {
  StrapiQueryParams,
  StrapiEntity,
  StrapiCollectionResponse,
  StrapiSingleResponse,
  FlattenedStrapiEntity,
} from '../types/strapi';

/**
 * Generic server-side fetch function for Strapi content
 * 
 * @deprecated Use fetchStrapiCollection or fetchStrapiSingle instead
 * @param contentType - Content type name (e.g., 'posts', 'pages')
 * @param queryParams - Query parameters
 * @returns Strapi response (single or collection)
 */
export async function fetchStrapiContent<T = Record<string, unknown>>(
  contentType: string,
  queryParams: StrapiQueryParams = {}
): Promise<StrapiSingleResponse<T> | StrapiCollectionResponse<T>> {
  // Delegate to fetchStrapiCollection for consistency
  const collection = await fetchStrapiCollection<T>(contentType, queryParams);
  return {
    data: collection.data as any,
    meta: collection.meta,
  } as StrapiCollectionResponse<T>;
}

/**
 * Fetch a collection of Strapi entries
 * 
 * @param contentType - Content type name
 * @param queryParams - Query parameters
 * @returns Collection response with flattened data
 */
export async function fetchStrapiCollection<T = Record<string, unknown>>(
  contentType: string,
  queryParams: StrapiQueryParams = {}
): Promise<{
  data: FlattenedStrapiEntity<T>[];
  meta: StrapiCollectionResponse<T>['meta'];
}> {
  try {
    const strapi = getStrapiClient();
    const collection = strapi.collection(contentType);
    const response = await collection.find(queryParams as any);

    // Strapi client returns flat documents, transform to our format
    const flattened = response.data.map((doc: any) => ({
      id: doc.id || parseInt(doc.documentId) || 0,
      documentId: doc.documentId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      publishedAt: doc.publishedAt || null,
      ...doc,
    })) as FlattenedStrapiEntity<T>[];

    return {
      data: flattened,
      meta: response.meta as any,
    };
  } catch (error) {
    console.error(`Error fetching Strapi collection (${contentType}):`, error);
    // Return empty array on error for graceful degradation
    return {
      data: [],
      meta: {
        pagination: {
          page: 1,
          pageSize: 0,
          pageCount: 0,
          total: 0,
        },
      },
    };
  }
}

/**
 * Fetch a single Strapi entry by ID
 * 
 * @param contentType - Content type name
 * @param id - Entry ID
 * @param queryParams - Additional query parameters
 * @returns Single entity response with flattened data
 */
export async function fetchStrapiSingle<T = Record<string, unknown>>(
  contentType: string,
  id: number | string,
  queryParams: Omit<StrapiQueryParams, 'filters'> = {}
): Promise<FlattenedStrapiEntity<T> | null> {
  try {
    const strapi = getStrapiClient();
    const collection = strapi.collection(contentType);
    const response = await collection.findOne(String(id), queryParams as any);

    // Transform response to our format
    const transformed = {
      id: response.data.id || parseInt(response.data.documentId) || 0,
      documentId: response.data.documentId,
      ...response.data,
    };

    return transformed as FlattenedStrapiEntity<T>;
  } catch (error) {
    console.error(
      `Error fetching Strapi single entry (${contentType}/${id}):`,
      error
    );
    return null;
  }
}

/**
 * Fetch a single Strapi entry by slug
 * 
 * @param contentType - Content type name
 * @param slug - Entry slug
 * @param queryParams - Additional query parameters
 * @returns Single entity response with flattened data or null
 */
export async function fetchStrapiBySlug<T = Record<string, unknown>>(
  contentType: string,
  slug: string,
  queryParams: Omit<StrapiQueryParams, 'filters'> = {}
): Promise<FlattenedStrapiEntity<T> | null> {
  try {
    const query = buildStrapiQuery({
      ...queryParams,
      filters: {
        slug: {
          $eq: slug,
        },
      },
    });

    const response = await fetchStrapiContent<T>(contentType, query);
    const data = extractStrapiData(response);

    // If it's a collection, get the first item
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return null;
      }
      return flattenStrapiResponse(data[0]);
    }

    // If it's a single entity
    return flattenStrapiResponse(data);
  } catch (error) {
    console.error(
      `Error fetching Strapi entry by slug (${contentType}/${slug}):`,
      error
    );
    return null;
  }
}

/**
 * Fetch all entries with pagination handling
 * 
 * Automatically handles pagination to fetch all entries across multiple pages
 * 
 * @param contentType - Content type name
 * @param queryParams - Query parameters
 * @param maxPages - Maximum number of pages to fetch (default: 100)
 * @returns All entries flattened
 */
export async function fetchAllStrapiEntries<T = Record<string, unknown>>(
  contentType: string,
  queryParams: StrapiQueryParams = {},
  maxPages = 100
): Promise<FlattenedStrapiEntity<T>[]> {
  try {
    const allEntries: FlattenedStrapiEntity<T>[] = [];
    let currentPage = 1;
    let hasMore = true;

    while (hasMore && currentPage <= maxPages) {
      const query = buildStrapiQuery({
        ...queryParams,
        pagination: {
          page: currentPage,
          pageSize: queryParams.pagination?.pageSize || 100,
        },
      });

      const response = await fetchStrapiCollection<T>(contentType, query);

      allEntries.push(...response.data);

      const pagination = response.meta?.pagination;
      if (pagination) {
        hasMore = currentPage < pagination.pageCount;
        currentPage++;
      } else {
        hasMore = false;
      }
    }

    return allEntries;
  } catch (error) {
    console.error(
      `Error fetching all Strapi entries (${contentType}):`,
      error
    );
    return [];
  }
}
