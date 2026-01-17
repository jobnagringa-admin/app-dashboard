/**
 * Strapi CMS Client Utilities
 * 
 * This file provides centralized Strapi client instances for both
 * server-side and client-side usage.
 */

import { strapi } from '@strapi/client';
import type { StrapiClient, Config } from '@strapi/client';
import type { StrapiImage } from '../types/strapi';

/**
 * Get Strapi API URL from environment variables
 */
export function getStrapiURL(): string {
  return import.meta.env.STRAPI_URL || 'http://localhost:1337';
}

/**
 * Get Strapi API prefix from environment variables
 */
export function getStrapiAPIPrefix(): string {
  return import.meta.env.STRAPI_API_PREFIX || '/api';
}

/**
 * Get Strapi API token from environment variables
 */
export function getStrapiToken(): string | undefined {
  return import.meta.env.STRAPI_TOKEN;
}

/**
 * Get configured Strapi client instance for server-side use
 * 
 * @returns Configured Strapi client instance
 */
export function getStrapiClient(): StrapiClient {
  const baseURL = getStrapiURL();
  const token = getStrapiToken();
  const prefix = getStrapiAPIPrefix();

  // Construct full base URL with prefix
  const fullBaseURL = `${baseURL}${prefix}`;

  const config: Config = {
    baseURL: fullBaseURL,
  };

  if (token) {
    config.auth = token;
  }

  return strapi(config);
}

/**
 * Get configured Strapi client instance for browser/client-side use
 * 
 * Note: For client-side usage, consider whether you want to expose
 * the API token. If not, use public endpoints or implement a proxy.
 * 
 * @returns Configured Strapi client instance
 */
export function getStrapiClientBrowser(): StrapiClient {
  // For client-side, we might want different configuration
  // For now, using the same config but this can be customized
  return getStrapiClient();
}

/**
 * Transform Strapi image object to full URL
 * 
 * Handles both relative and absolute URLs from Strapi
 * 
 * @param image - Strapi image object or string URL
 * @returns Full image URL
 */
export function getStrapiImageURL(
  image: StrapiImage | string | null | undefined
): string {
  if (!image) {
    return '';
  }

  // If it's already a string URL
  if (typeof image === 'string') {
    // If it's already absolute, return as-is
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    // If relative, prepend Strapi URL
    const baseUrl = getStrapiURL();
    return `${baseUrl}${image}`;
  }

  // If it's a StrapiImage object
  if (image.url) {
    // If URL is absolute, return as-is
    if (image.url.startsWith('http://') || image.url.startsWith('https://')) {
      return image.url;
    }
    // If relative, prepend Strapi URL
    const baseUrl = getStrapiURL();
    return `${baseUrl}${image.url}`;
  }

  return '';
}

/**
 * Get Strapi image URL with format/size specification
 * 
 * @param image - Strapi image object
 * @param format - Image format (thumbnail, small, medium, large)
 * @returns Image URL for specified format or original
 */
export function getStrapiImageURLWithFormat(
  image: StrapiImage | null | undefined,
  format?: 'thumbnail' | 'small' | 'medium' | 'large'
): string {
  if (!image) {
    return '';
  }

  // If format is specified and exists in formats
  if (format && image.formats?.[format]) {
    const formatImage = image.formats[format];
    if (formatImage?.url) {
      if (
        formatImage.url.startsWith('http://') ||
        formatImage.url.startsWith('https://')
      ) {
        return formatImage.url;
      }
      const baseUrl = getStrapiURL();
      return `${baseUrl}${formatImage.url}`;
    }
  }

  // Fallback to original image
  return getStrapiImageURL(image);
}
