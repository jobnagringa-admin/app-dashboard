/**
 * Clerk Authentication Module
 *
 * Handles all Clerk-based authentication functionality including:
 * - User session management via cookies
 * - Paid customer verification
 * - Protected route enforcement
 * - User data persistence
 *
 * @requires Clerk JS SDK loaded via script tag
 */

// ============================================================================
// Types
// ============================================================================

export interface UserData {
  firstName: string | null;
  phoneNumber: string | null;
  email: string | null;
  publicMetadata: UserMetadata;
}

export interface UserMetadata {
  isPaidCustomer?: boolean;
  [key: string]: unknown;
}

export interface ClerkUser {
  firstName?: string | null;
  fullName?: string | null;
  username?: string | null;
  primaryEmailAddress?: { emailAddress: string } | null;
  emailAddresses?: Array<{ emailAddress: string }>;
  primaryPhoneNumber?: { phoneNumber: string } | null;
  phoneNumbers?: Array<{ phoneNumber: string }>;
  publicMetadata?: UserMetadata;
}

export interface CookieOptions {
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

// ============================================================================
// Constants
// ============================================================================

export const COOKIE_NAME = 'user';
export const LOCAL_STORAGE_KEY = 'user';
export const COOKIE_TTL = 86400; // 24 hours in seconds
export const DOMAIN_SUFFIX = '.jobnagringa.com.br';
export const ACCOUNTS_URL = 'https://accounts.jobnagringa.com.br';

/** Protected paths that require paid customer status */
export const PROTECTED_PATHS = ['/jng'];

/** Redirect path when user is not authorized */
export const HOME_REDIRECT_PATH = '/';

// ============================================================================
// Cookie Utilities
// ============================================================================

/**
 * Sets a cookie with the specified options
 */
export function setCookie(
  name: string,
  value: string,
  maxAge: number,
  options: CookieOptions = {}
): void {
  const parts: string[] = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    'path=/',
    `max-age=${maxAge}`,
  ];

  if (options.domain) {
    parts.push(`domain=${options.domain}`);
  }
  if (options.secure) {
    parts.push('secure');
  }
  if (options.sameSite) {
    parts.push(`samesite=${options.sameSite}`);
  }

  document.cookie = parts.join('; ');
}

/**
 * Retrieves and parses user data from cookie
 */
export function getUserFromCookie(): UserData | null {
  try {
    const cookies = document.cookie ? document.cookie.split(';') : [];
    let cookieValue: string | null = null;

    for (const cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith(`${COOKIE_NAME}=`)) {
        cookieValue = trimmed;
        break;
      }
    }

    if (!cookieValue) return null;

    const encodedValue = cookieValue.split('=')[1] || '';
    const decodedValue = decodeURIComponent(encodedValue);

    if (!decodedValue) return null;

    return JSON.parse(decodedValue) as UserData;
  } catch {
    return null;
  }
}

/**
 * Clears all authentication cookies
 */
export function clearAuthCookies(): void {
  const cookies = document.cookie.split('; ');

  for (const cookie of cookies) {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;

    // Clear cookie on current domain
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;

    // Clear cookie on parent domain
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=${window.location.hostname};path=/`;
  }
}

// ============================================================================
// User Data Management
// ============================================================================

/**
 * Persists Clerk user data to cookie and localStorage
 */
export function persistUserData(clerkUser: ClerkUser): void {
  // Also expose on window for legacy compatibility
  (window as unknown as { user: ClerkUser }).user = clerkUser;

  // Save to localStorage
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clerkUser));
  } catch {
    // localStorage might be unavailable
  }

  // Extract email
  let email: string | null = null;
  if (clerkUser.primaryEmailAddress?.emailAddress) {
    email = clerkUser.primaryEmailAddress.emailAddress;
  } else if (clerkUser.emailAddresses?.length) {
    email = clerkUser.emailAddresses[0]?.emailAddress || null;
  }

  // Extract phone
  let phoneNumber: string | null = null;
  if (clerkUser.primaryPhoneNumber?.phoneNumber) {
    phoneNumber = clerkUser.primaryPhoneNumber.phoneNumber;
  } else if (clerkUser.phoneNumbers?.length) {
    phoneNumber = clerkUser.phoneNumbers[0]?.phoneNumber || null;
  }

  // Create cookie data
  const userData: UserData = {
    firstName: clerkUser.firstName || null,
    phoneNumber,
    email,
    publicMetadata: clerkUser.publicMetadata || {},
  };

  // Determine cookie options
  const isSecure = window.location.protocol === 'https:';
  const hostname = window.location.hostname;
  const domain = hostname.endsWith(DOMAIN_SUFFIX) ? DOMAIN_SUFFIX : undefined;

  setCookie(COOKIE_NAME, JSON.stringify(userData), COOKIE_TTL, {
    secure: isSecure,
    sameSite: 'Strict',
    domain,
  });
}

/**
 * Gets the user's first name from cookie data
 */
export function getUserFirstName(): string | null {
  const user = getUserFromCookie();
  if (!user) return null;

  const firstName = user.firstName?.trim();
  if (firstName) return firstName;

  return null;
}

// ============================================================================
// Authorization Checks
// ============================================================================

/**
 * Checks if the current user is a paid customer
 */
export function userIsPaidCustomer(): boolean {
  try {
    const user = getUserFromCookie();
    return user?.publicMetadata?.isPaidCustomer === true;
  } catch {
    return false;
  }
}

/**
 * Checks if current path is protected
 */
export function isProtectedPath(pathname: string = window.location.pathname): boolean {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path));
}

/**
 * Enforces login requirement - redirects to sign-in if not logged in
 */
export function requireLogin(): void {
  const user = getUserFromCookie();

  if (!user) {
    const redirectUrl = encodeURIComponent(window.location.href);
    window.location.href = `${ACCOUNTS_URL}/sign-in?redirect_url=${redirectUrl}`;
    return;
  }

  if (import.meta.env.DEV) {
    console.log('User logged in with email:', user.email);
  }
}

/**
 * Enforces paid customer requirement for protected paths
 * Hides page and redirects if not authorized
 */
export function enforceProtectedPath(): void {
  const pathname = window.location.pathname;

  // Only check protected paths
  if (!isProtectedPath(pathname)) return;

  // Hide page initially to prevent flash
  const style = document.createElement('style');
  style.textContent = 'html { visibility: hidden !important; }';
  document.head.appendChild(style);

  const redirect = () => {
    window.location.replace(HOME_REDIRECT_PATH);
  };

  // Check authorization
  if (!userIsPaidCustomer()) {
    redirect();
    return;
  }

  // Authorized - show page
  document.documentElement.style.visibility = 'visible';
  style.remove();
}

// ============================================================================
// DOM Utilities
// ============================================================================

/**
 * Populates elements with user's first name
 * Targets elements with data-ms-member="first-name" attribute
 */
export function populateFirstNameFromUser(): void {
  const user = getUserFromCookie();
  if (!user) return;

  let firstName = '';

  if (user.firstName?.trim()) {
    firstName = user.firstName.trim();
  }

  if (!firstName) return;

  const elements = document.querySelectorAll<HTMLElement>('[data-ms-member="first-name"]');

  for (const el of elements) {
    if ('value' in el) {
      (el as HTMLInputElement).value = firstName;
    } else {
      el.textContent = firstName;
    }
  }
}

/**
 * Handles community content visibility based on paid status
 * Removes elements that shouldn't be visible to current user
 */
export function handleCommunityContent(): void {
  const isPaid = userIsPaidCustomer();
  const selectorToRemove = isPaid
    ? '[data-ms-content="!community"]'
    : '[data-ms-content="community"]';

  const elements = document.querySelectorAll(selectorToRemove);

  for (const el of elements) {
    el.remove();
  }
}

// ============================================================================
// Clerk Integration
// ============================================================================

declare global {
  interface Window {
    Clerk?: {
      load: () => Promise<void>;
      user?: ClerkUser;
    };
  }
}

/**
 * Initializes Clerk and syncs user data
 */
export async function initClerk(): Promise<void> {
  const clerk = window.Clerk;

  if (!clerk?.load) return;

  try {
    await clerk.load();

    if (clerk.user) {
      persistUserData(clerk.user);
    }
  } catch {
    // Fallback: try to get user after delay
    setTimeout(() => {
      if (window.Clerk?.user) {
        persistUserData(window.Clerk.user);
      }
    }, 1000);
  }
}

// ============================================================================
// Logout Functionality
// ============================================================================

/**
 * Clears all site data and performs logout
 */
export async function logout(): Promise<void> {
  // Clear cache storage
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }

  // Unregister service workers
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((reg) => reg.unregister()));
  }

  // Clear storage
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {
    // Ignore storage errors
  }

  // Clear cookies
  clearAuthCookies();

  // Clear IndexedDB
  if ('indexedDB' in window && indexedDB.databases) {
    const databases = await indexedDB.databases();
    for (const db of databases) {
      if (db.name) {
        indexedDB.deleteDatabase(db.name);
      }
    }
  }

  // Redirect to home
  window.location.href = HOME_REDIRECT_PATH;
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Main initialization function - call on page load
 */
export function initAuth(): void {
  // Initialize Clerk on window load
  window.addEventListener('load', initClerk);

  // Run DOM functions when ready
  const runDomFunctions = () => {
    populateFirstNameFromUser();
    handleCommunityContent();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runDomFunctions);
  } else {
    runDomFunctions();
  }

  // Also run on load for safety
  window.addEventListener('load', runDomFunctions);
}
