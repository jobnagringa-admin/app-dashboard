/**
 * Scripts Index
 *
 * Main entry point for all client-side JavaScript functionality.
 * Re-exports all modules for convenient importing.
 *
 * @usage
 * ```typescript
 * // Import specific functions
 * import { initAuth, userIsPaidCustomer } from './scripts';
 *
 * // Or import everything
 * import * as scripts from './scripts';
 * ```
 */

// Authentication
export {
  // Types
  type UserData,
  type UserMetadata,
  type ClerkUser,
  type CookieOptions,

  // Constants
  COOKIE_NAME,
  LOCAL_STORAGE_KEY,
  COOKIE_TTL,
  DOMAIN_SUFFIX,
  ACCOUNTS_URL,
  PROTECTED_PATHS,
  HOME_REDIRECT_PATH,

  // Functions
  setCookie,
  getUserFromCookie,
  clearAuthCookies,
  persistUserData,
  getUserFirstName,
  userIsPaidCustomer,
  isProtectedPath,
  requireLogin,
  enforceProtectedPath,
  populateFirstNameFromUser,
  handleCommunityContent,
  initClerk,
  logout,
  initAuth,
} from './auth';

// Tracking
export {
  // Types
  type MauticTrackingData,
  type GTMEvent,
  type UTMParams,

  // Constants
  GTM_ID,
  GA_ID,
  MAUTIC_URL,
  AHREFS_KEY,
  DEFAULT_UTM_SOURCE,

  // Functions
  initDataLayer,
  gtag,
  trackPageView,
  trackEvent,
  pushToDataLayer,
  mauticTrack,
  sendMauticPageview,
  handleFormSubmitTracking,
  initMautic,
  getUTMParams,
  storeUTMParams,
  getStoredUTMParams,
  addUTMToLinks,
  initTracking,
} from './tracking';

// API
export {
  // Types
  type APIConfig,
  type APIResponse,
  type APIError,
  type ViaCEPAddress,

  // Constants
  API_URL_PROD,
  API_URL_STAGING,
  VIACEP_URL,
  DEFAULT_TIMEOUT,

  // Functions
  getAPIUrl,
  getAPIEndpoint,
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  isValidCEP,
  fetchAddressByCEP,
  autoFillAddressFromCEP,
  setupCEPAutoFill,
  initAPI,
} from './api';

// Utilities
export {
  // Types
  type LoadingButtonOptions,

  // Constants
  DEFAULT_LOADING_TEXT,
  DEFAULT_LOADING_TIMEOUT,

  // Functions
  handleLoadingButton,
  setupLoadingButtons,
  setupPlaceholdersFromPH,
  isValidEmail,
  isValidBrazilianPhone,
  formatBrazilianPhone,
  removeElements,
  showElement,
  hideElement,
  toggleClass,
  setFieldError,
  setFieldSuccess,
  initWebflowModifiers,
  scrollToElement,
  scrollToTop,
  getQueryParam,
  setQueryParam,
  removeQueryParam,
  getFromStorage,
  setInStorage,
  removeFromStorage,
  initUtils,
} from './utils';

// ============================================================================
// Combined Initialization
// ============================================================================

/**
 * Initializes all client-side scripts
 * Call this once in your main layout or entry point
 */
export function initAll(): void {
  // Import and initialize each module
  import('./utils').then(({ initUtils }) => initUtils());
  import('./auth').then(({ initAuth }) => initAuth());
  import('./tracking').then(({ initTracking }) => initTracking());
  import('./api').then(({ initAPI }) => initAPI());
}
