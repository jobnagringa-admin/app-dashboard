/**
 * Utility Functions
 *
 * Common utility functions used across the application:
 * - Loading button handlers
 * - Form utilities
 * - DOM helpers
 * - Webflow compatibility
 */

// ============================================================================
// Types
// ============================================================================

export interface LoadingButtonOptions {
  loadingText?: string;
  timeout?: number;
  onComplete?: () => void;
}

// ============================================================================
// Constants
// ============================================================================

/** Default loading button text (Portuguese) */
export const DEFAULT_LOADING_TEXT = "Carregando...";

/** Default loading timeout in milliseconds */
export const DEFAULT_LOADING_TIMEOUT = 2000;

// ============================================================================
// Loading Button Handlers
// ============================================================================

/**
 * Handles loading state for a button
 * Shows loading text and disables button during operation
 */
export function handleLoadingButton(
  button: HTMLButtonElement,
  options: LoadingButtonOptions = {},
): void {
  const {
    loadingText = DEFAULT_LOADING_TEXT,
    timeout = DEFAULT_LOADING_TIMEOUT,
    onComplete,
  } = options;

  const originalText = button.innerText;
  button.innerText = loadingText;
  button.disabled = true;

  setTimeout(() => {
    button.innerText = originalText;
    button.disabled = false;
    onComplete?.();
  }, timeout);
}

/**
 * Sets up loading button handlers for all buttons with loading-feedback attribute
 */
export function setupLoadingButtons(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>(
    '[loading-feedback="true"]',
  );

  for (const button of buttons) {
    button.addEventListener("click", () => {
      handleLoadingButton(button);
    });
  }
}

// ============================================================================
// Form Utilities
// ============================================================================

/**
 * Sets placeholder from 'ph' attribute on all inputs
 * This is a Webflow compatibility feature
 */
export function setupPlaceholdersFromPH(): void {
  const inputs = document.querySelectorAll<HTMLInputElement>("input[ph]");

  for (const input of inputs) {
    const phValue = input.getAttribute("ph");
    if (phValue) {
      input.placeholder = phValue;
    }
  }
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates Brazilian phone number format
 */
export function isValidBrazilianPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, "");
  return cleanPhone.length === 10 || cleanPhone.length === 11;
}

/**
 * Formats phone number to Brazilian format
 */
export function formatBrazilianPhone(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.length === 10) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
  }

  if (cleanPhone.length === 11) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`;
  }

  return phone;
}

// ============================================================================
// DOM Utilities
// ============================================================================

/**
 * Safely removes elements matching a selector
 */
export function removeElements(selector: string): void {
  const elements = document.querySelectorAll(selector);
  for (const el of elements) {
    el.remove();
  }
}

/**
 * Shows an element by removing display:none
 */
export function showElement(element: HTMLElement): void {
  element.style.display = "";
}

/**
 * Hides an element with display:none
 */
export function hideElement(element: HTMLElement): void {
  element.style.display = "none";
}

/**
 * Toggles a class on an element
 */
export function toggleClass(
  element: HTMLElement,
  className: string,
  force?: boolean,
): void {
  element.classList.toggle(className, force);
}

/**
 * Adds error styling to a form field
 */
export function setFieldError(field: HTMLElement, hasError: boolean): void {
  toggleClass(field, "error", hasError);
}

/**
 * Adds success styling to a form field
 */
export function setFieldSuccess(field: HTMLElement, hasSuccess: boolean): void {
  toggleClass(field, "success", hasSuccess);
}

// ============================================================================
// Webflow Compatibility
// ============================================================================

/**
 * Adds Webflow-specific class modifiers
 * Adds 'w-mod-js' for JavaScript detection
 * Adds 'w-mod-touch' for touch device detection
 */
export function initWebflowModifiers(): void {
  const html = document.documentElement;

  // Add JS modifier
  html.className += " w-mod-js";

  // Add touch modifier if applicable
  if (
    "ontouchstart" in window ||
    (window as unknown as { DocumentTouch?: unknown }).DocumentTouch
  ) {
    html.className += " w-mod-touch";
  }
}

// ============================================================================
// Scroll Utilities
// ============================================================================

/**
 * Smoothly scrolls to an element
 */
export function scrollToElement(element: HTMLElement, offset = 0): void {
  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

/**
 * Scrolls to top of page
 */
export function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ============================================================================
// URL Utilities
// ============================================================================

/**
 * Gets a query parameter from URL
 */
export function getQueryParam(name: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Updates a query parameter in URL without reload
 */
export function setQueryParam(name: string, value: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set(name, value);
  window.history.replaceState({}, "", url.toString());
}

/**
 * Removes a query parameter from URL without reload
 */
export function removeQueryParam(name: string): void {
  const url = new URL(window.location.href);
  url.searchParams.delete(name);
  window.history.replaceState({}, "", url.toString());
}

// ============================================================================
// Storage Utilities
// ============================================================================

/**
 * Safely gets item from localStorage
 */
export function getFromStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

/**
 * Safely sets item in localStorage
 */
export function setInStorage(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Removes item from localStorage
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore errors
  }
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initializes all utility features
 */
export function initUtils(): void {
  // Initialize Webflow modifiers immediately
  initWebflowModifiers();

  // Set up DOM-dependent features when ready
  document.addEventListener("DOMContentLoaded", () => {
    setupLoadingButtons();
    setupPlaceholdersFromPH();
  });
}
