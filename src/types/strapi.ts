/**
 * Strapi CMS TypeScript Type Definitions
 * 
 * This file contains TypeScript interfaces for Strapi API responses,
 * including collections, single entities, pagination, and common fields.
 */

/**
 * Base Strapi entity attributes
 */
export interface StrapiEntityAttributes {
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

/**
 * Strapi image/media type
 */
export interface StrapiImage {
  id: number;
  documentId?: string;
  name: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string | null;
  provider: string;
  provider_metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Strapi image format
 */
export interface StrapiImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  path?: string | null;
  url: string;
}

/**
 * Strapi component type
 */
export interface StrapiComponent<T = Record<string, unknown>> {
  id: number;
  documentId?: string;
  __component: string;
  [key: string]: unknown;
}

/**
 * Strapi single entity response structure
 */
export interface StrapiEntity<T = Record<string, unknown>> {
  id: number;
  documentId?: string;
  attributes: T & StrapiEntityAttributes;
}

/**
 * Strapi pagination metadata
 */
export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

/**
 * Strapi response metadata
 */
export interface StrapiMeta {
  pagination?: StrapiPagination;
}

/**
 * Generic Strapi response wrapper for single entities
 */
export interface StrapiSingleResponse<T = Record<string, unknown>> {
  data: StrapiEntity<T>;
  meta?: StrapiMeta;
}

/**
 * Generic Strapi response wrapper for collections
 */
export interface StrapiCollectionResponse<T = Record<string, unknown>> {
  data: StrapiEntity<T>[];
  meta: StrapiMeta & {
    pagination?: StrapiPagination;
  };
}

/**
 * Generic Strapi response (can be single or collection)
 */
export type StrapiResponse<T = Record<string, unknown>> =
  | StrapiSingleResponse<T>
  | StrapiCollectionResponse<T>;

/**
 * Strapi query parameters
 */
export interface StrapiQueryParams {
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
}

/**
 * Flattened Strapi entity (after transformation)
 */
export interface FlattenedStrapiEntity<T = Record<string, unknown>> {
  id: number;
  documentId?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
} & T;
