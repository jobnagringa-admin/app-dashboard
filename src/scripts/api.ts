/**
 * API Client Configuration
 *
 * Handles API configuration and client setup for backend services:
 * - Nova Money payment API
 * - ViaCEP address lookup
 * - External service integrations
 */

// ============================================================================
// Types
// ============================================================================

export interface APIConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface APIResponse<T = unknown> {
  data: T;
  status: number;
  ok: boolean;
}

export interface APIError {
  message: string;
  status?: number;
  code?: string;
}

export interface ViaCEPAddress {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/** Production API URL */
export const API_URL_PROD = "https://jobnagringa.pay.nova.money/api/v1";

/** Staging API URL */
export const API_URL_STAGING =
  "https://jobnagringa.staging.pay.nova.money/api/v1";

/** ViaCEP API base URL */
export const VIACEP_URL = "https://viacep.com.br/ws";

/** Default request timeout in milliseconds */
export const DEFAULT_TIMEOUT = 30000;

// ============================================================================
// API URL Configuration
// ============================================================================

/**
 * Gets the appropriate API URL based on environment
 */
export function getAPIUrl(): string {
  // Check for environment variable
  if (import.meta.env.PUBLIC_API_URL) {
    return import.meta.env.PUBLIC_API_URL;
  }

  // Check for staging flag
  if (import.meta.env.PUBLIC_USE_STAGING === "true") {
    return API_URL_STAGING;
  }

  // Default to production
  return API_URL_PROD;
}

/**
 * Creates full API endpoint URL
 */
export function getAPIEndpoint(path: string): string {
  const baseUrl = getAPIUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

// ============================================================================
// Fetch Wrapper
// ============================================================================

/**
 * Makes an API request with error handling
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<APIResponse<T>> {
  const url = endpoint.startsWith("http") ? endpoint : getAPIEndpoint(endpoint);

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = (await response.json()) as T;

    return {
      data,
      status: response.status,
      ok: response.ok,
    };
  } catch (error) {
    clearTimeout(timeout);

    if (error instanceof Error && error.name === "AbortError") {
      throw { message: "Request timeout", code: "TIMEOUT" } as APIError;
    }

    throw {
      message: error instanceof Error ? error.message : "Unknown error",
      code: "NETWORK_ERROR",
    } as APIError;
  }
}

/**
 * Makes a GET request
 */
export async function apiGet<T = unknown>(
  endpoint: string,
  options?: RequestInit,
): Promise<APIResponse<T>> {
  return apiRequest<T>(endpoint, { ...options, method: "GET" });
}

/**
 * Makes a POST request
 */
export async function apiPost<T = unknown>(
  endpoint: string,
  body: unknown,
  options?: RequestInit,
): Promise<APIResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Makes a PUT request
 */
export async function apiPut<T = unknown>(
  endpoint: string,
  body: unknown,
  options?: RequestInit,
): Promise<APIResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * Makes a DELETE request
 */
export async function apiDelete<T = unknown>(
  endpoint: string,
  options?: RequestInit,
): Promise<APIResponse<T>> {
  return apiRequest<T>(endpoint, { ...options, method: "DELETE" });
}

// ============================================================================
// ViaCEP Integration
// ============================================================================

/**
 * Validates Brazilian CEP format
 */
export function isValidCEP(cep: string): boolean {
  const cleanCEP = cep.replace(/\D/g, "");
  return cleanCEP.length === 8;
}

/**
 * Fetches address data from ViaCEP API
 */
export async function fetchAddressByCEP(
  cep: string,
): Promise<ViaCEPAddress | null> {
  const cleanCEP = cep.replace(/\D/g, "");

  if (!isValidCEP(cleanCEP)) {
    return null;
  }

  try {
    const response = await fetch(`${VIACEP_URL}/${cleanCEP}/json/`);
    const data = (await response.json()) as ViaCEPAddress;

    if (data.erro) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Auto-fills address form fields based on CEP
 * Populates fields with IDs: endereco, bairro, cidade, uf
 */
export async function autoFillAddressFromCEP(cep: string): Promise<boolean> {
  const address = await fetchAddressByCEP(cep);

  if (!address) {
    return false;
  }

  const fields: Record<string, string> = {
    endereco: address.logradouro,
    bairro: address.bairro,
    cidade: address.localidade,
    uf: address.uf,
  };

  for (const [id, value] of Object.entries(fields)) {
    const element = document.getElementById(id) as HTMLInputElement | null;
    if (element) {
      element.value = value;
    }
  }

  return true;
}

/**
 * Sets up CEP auto-fill on blur event
 */
export function setupCEPAutoFill(): void {
  const cepInput = document.getElementById("cep") as HTMLInputElement | null;

  if (!cepInput) return;

  cepInput.addEventListener("blur", async () => {
    await autoFillAddressFromCEP(cepInput.value);
  });
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initializes API configuration
 * Exposes API_URL globally for legacy compatibility
 */
export function initAPI(): void {
  // Expose API_URL globally for legacy scripts
  (window as unknown as { API_URL: string }).API_URL = getAPIUrl();

  // Set up CEP auto-fill if we're on a checkout page
  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("cep")) {
      setupCEPAutoFill();
    }
  });
}
