/**
 * Strapi CMS Client-Side Utilities
 *
 * This file contains client-side specific functions for fetching
 * Strapi content in browser components.
 *
 * Note: For client-side usage, ensure your Strapi API allows
 * public access or implement proper authentication.
 */

import { getStrapiClientBrowser, getStrapiURL } from './strapi';
import {
  buildStrapiQuery,
  flattenStrapiResponse,
  flattenStrapiCollection,
  extractStrapiData,
} from './strapi-helpers';
import type {
  StrapiQueryParams,
  StrapiCollectionResponse,
  StrapiSingleResponse,
  FlattenedStrapiEntity,
} from '../types/strapi';

/**
 * Simple in-memory cache for client-side requests
 */
const requestCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Clear the request cache
 */
export function clearStrapiCache(): void {
  requestCache.clear();
}

/**
 * Get cached data if available and not expired
 */
function getCachedData<T>(key: string): T | null {
  const cached = requestCache.get(key);
  if (!cached) {
    return null;
  }

  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL) {
    requestCache.delete(key);
    return null;
  }

  return cached.data as T;
}

/**
 * Set data in cache
 */
function setCachedData<T>(key: string, data: T): void {
  requestCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Generate cache key from content type and query params
 */
function getCacheKey(contentType: string, queryParams: StrapiQueryParams): string {
  return `${contentType}:${JSON.stringify(queryParams)}`;
}

/**
 * Generic client-side fetch function for Strapi content
 *
 * @param contentType - Content type name (e.g., 'posts', 'pages')
 * @param queryParams - Query parameters
 * @param useCache - Whether to use cache (default: true)
 * @returns Strapi response (single or collection)
 */
export async function fetchStrapiContentClient<T = Record<string, unknown>>(
  contentType: string,
  queryParams: StrapiQueryParams = {},
  useCache = true
): Promise<StrapiSingleResponse<T> | StrapiCollectionResponse<T>> {
  // Delegate to fetchStrapiCollectionClient for consistency
  const collection = await fetchStrapiCollectionClient<T>(contentType, queryParams, useCache);
  return {
    data: collection.data as any,
    meta: collection.meta,
  } as StrapiCollectionResponse<T>;
}

/**
 * Fetch a collection of Strapi entries (client-side)
 *
 * @param contentType - Content type name
 * @param queryParams - Query parameters
 * @param useCache - Whether to use cache (default: true)
 * @returns Collection response with flattened data
 */
export async function fetchStrapiCollectionClient<T = Record<string, unknown>>(
  contentType: string,
  queryParams: StrapiQueryParams = {},
  useCache = true
): Promise<{
  data: FlattenedStrapiEntity<T>[];
  meta: StrapiCollectionResponse<T>['meta'];
}> {
  const cacheKey = getCacheKey(contentType, queryParams);

  // Check cache first
  if (useCache) {
    const cached = getCachedData<{
      data: FlattenedStrapiEntity<T>[];
      meta: StrapiCollectionResponse<T>['meta'];
    }>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  try {
    const strapi = getStrapiClientBrowser();
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

    const result = {
      data: flattened,
      meta: response.meta as any,
    };

    // Cache the response
    if (useCache) {
      setCachedData(cacheKey, result);
    }

    return result;
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
 * Fetch a single Strapi entry by ID (client-side)
 *
 * @param contentType - Content type name
 * @param id - Entry ID
 * @param queryParams - Additional query parameters
 * @param useCache - Whether to use cache (default: true)
 * @returns Single entity response with flattened data
 */
export async function fetchStrapiSingleClient<T = Record<string, unknown>>(
  contentType: string,
  id: number | string,
  queryParams: Omit<StrapiQueryParams, 'filters'> = {},
  useCache = true
): Promise<FlattenedStrapiEntity<T> | null> {
  try {
    const strapi = getStrapiClientBrowser();
    const cacheKey = getCacheKey(`${contentType}/${id}`, queryParams);

    // Check cache first
    if (useCache) {
      const cached = getCachedData<FlattenedStrapiEntity<T>>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const collection = strapi.collection(contentType);
    const response = await collection.findOne(String(id), queryParams as any);

    // Transform response to our format
    const transformed = {
      id: response.data.id || parseInt(response.data.documentId) || 0,
      documentId: response.data.documentId,
      ...response.data,
    } as FlattenedStrapiEntity<T>;

    // Cache the response
    if (useCache) {
      setCachedData(cacheKey, transformed);
    }

    return transformed;
  } catch (error) {
    console.error(`Error fetching Strapi single entry (${contentType}/${id}):`, error);
    return null;
  }
}

/**
 * Fetch a single Strapi entry by slug (client-side)
 *
 * @param contentType - Content type name
 * @param slug - Entry slug
 * @param queryParams - Additional query parameters
 * @param useCache - Whether to use cache (default: true)
 * @returns Single entity response with flattened data or null
 */
export async function fetchStrapiBySlugClient<T = Record<string, unknown>>(
  contentType: string,
  slug: string,
  queryParams: Omit<StrapiQueryParams, 'filters'> = {},
  useCache = true
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

    const response = await fetchStrapiContentClient<T>(contentType, query, useCache);
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
    console.error(`Error fetching Strapi entry by slug (${contentType}/${slug}):`, error);
    return null;
  }
}

/**
 * Fetch Strapi content using native fetch API (for environments without Strapi client)
 *
 * This is useful for edge functions or when you want more control over the request
 *
 * @param endpoint - API endpoint (e.g., '/api/posts')
 * @param options - Fetch options
 * @returns Response data
 */
export async function fetchStrapiAPI<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getStrapiURL();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const token = import.meta.env.STRAPI_TOKEN;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching from Strapi API (${endpoint}):`, error);
    throw error;
  }
}
