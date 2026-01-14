/**
 * Tracking Module
 *
 * Handles analytics and tracking integrations:
 * - Google Analytics / GTM
 * - Mautic marketing automation
 * - Ahrefs analytics
 * - UTM parameter handling
 *
 * @requires Google Tag Manager loaded via script tag
 * @requires Mautic tracking script loaded
 */

// ============================================================================
// Types
// ============================================================================

export interface MauticTrackingData {
  email?: string;
  firstname?: string;
  [key: string]: string | undefined;
}

export interface GTMEvent {
  event: string;
  [key: string]: unknown;
}

export interface MemberstackMember {
  id?: string;
  auth?: {
    email?: string;
  };
  customFields?: {
    "first-name"?: string;
    [key: string]: string | undefined;
  };
}

declare global {
  interface Window {
    dataLayer: GTMEvent[];
    mt: (action: string, type: string, data?: MauticTrackingData) => void;
    MauticTrackingObject?: string;
  }
}

// ============================================================================
// Constants
// ============================================================================

export const GTM_ID = "GTM-58XVRQZ";
export const GA_ID = "G-DNCKG4JJ77";
export const MAUTIC_URL = "https://mautic.jobnagringa.com.br/mtc.js";
export const AHREFS_KEY = "0IynPqzGcpJ1FaTQBiSG9g";

/** Default UTM source for outbound links */
export const DEFAULT_UTM_SOURCE = "jobnagringa";

// ============================================================================
// Google Analytics / GTM
// ============================================================================

/**
 * Initializes Google Analytics dataLayer
 */
export function initDataLayer(): void {
  window.dataLayer = window.dataLayer || [];
}

/**
 * Sends event to Google Analytics via gtag
 */
export function gtag(...args: unknown[]): void {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args as unknown as GTMEvent);
}

/**
 * Tracks a page view in GA
 */
export function trackPageView(pagePath?: string): void {
  gtag("config", GA_ID, {
    page_path: pagePath || window.location.pathname,
  });
}

/**
 * Tracks a custom event in GA
 */
export function trackEvent(
  eventName: string,
  parameters?: Record<string, unknown>,
): void {
  gtag("event", eventName, parameters);
}

/**
 * Pushes event to GTM dataLayer
 */
export function pushToDataLayer(event: GTMEvent): void {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

// ============================================================================
// Mautic Tracking
// ============================================================================

/**
 * Sends data to Mautic tracking
 */
export function mauticTrack(
  action: "pageview" | "formsubmit" | "event",
  data?: MauticTrackingData,
): void {
  if (typeof window.mt === "function") {
    window.mt("send", action, data);
  }
}

/**
 * Gets member data from Memberstack localStorage
 */
function getMemberstackMember(): MemberstackMember | null {
  try {
    const memberData = localStorage.getItem("_ms-mem");
    if (!memberData) return null;
    return JSON.parse(memberData) as MemberstackMember;
  } catch {
    return null;
  }
}

/**
 * Sends Mautic pageview with user email if available
 */
export function sendMauticPageview(): void {
  try {
    const member = getMemberstackMember();

    if (member?.id) {
      const email = member.auth?.email || "";
      const firstname = member.customFields?.["first-name"] || "";

      mauticTrack("pageview", { email, firstname });
      return;
    }
  } catch (error) {
    console.error("Error reading member metadata:", error);
  }

  // Send anonymous pageview
  mauticTrack("pageview");
}

/**
 * Handles form submission tracking for Mautic
 */
export function handleFormSubmitTracking(form: HTMLFormElement): void {
  try {
    const emailField = form.querySelector<HTMLInputElement>(
      'input[type="email"]',
    );

    if (emailField?.value) {
      mauticTrack("formsubmit", { email: emailField.value });
    }
  } catch (error) {
    console.error("Error handling form submission:", error);
  }
}

/**
 * Initializes Mautic tracking
 */
export function initMautic(): void {
  // Set up Mautic tracking object
  window.MauticTrackingObject = "mt";

  window.mt =
    window.mt ||
    function (...args: unknown[]) {
      (window.mt as unknown as { q: unknown[] }).q =
        (window.mt as unknown as { q: unknown[] }).q || [];
      (window.mt as unknown as { q: unknown[] }).q.push(args);
    };

  // Load Mautic script
  const script = document.createElement("script");
  script.async = true;
  script.src = MAUTIC_URL;
  document.head.appendChild(script);

  // Initialize tracking on DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    sendMauticPageview();

    // Track form submissions
    document.body.addEventListener("submit", (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName.toLowerCase() === "form") {
        handleFormSubmitTracking(target as HTMLFormElement);
      }
    });
  });
}

// ============================================================================
// UTM Parameter Handling
// ============================================================================

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

/**
 * Parses UTM parameters from current URL
 */
export function getUTMParams(): UTMParams {
  const params = new URLSearchParams(window.location.search);

  return {
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
    utm_term: params.get("utm_term") || undefined,
    utm_content: params.get("utm_content") || undefined,
  };
}

/**
 * Stores UTM parameters in session storage for later use
 */
export function storeUTMParams(): void {
  const utmParams = getUTMParams();

  // Only store if we have at least one UTM param
  if (Object.values(utmParams).some(Boolean)) {
    try {
      sessionStorage.setItem("utm_params", JSON.stringify(utmParams));
    } catch {
      // Session storage might be unavailable
    }
  }
}

/**
 * Retrieves stored UTM parameters
 */
export function getStoredUTMParams(): UTMParams | null {
  try {
    const stored = sessionStorage.getItem("utm_params");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Adds UTM source to links marked with [utm] attribute
 * This ensures outbound job links are tracked
 */
export function addUTMToLinks(source: string = DEFAULT_UTM_SOURCE): void {
  const links = document.querySelectorAll<HTMLAnchorElement>("a[utm]");

  for (const link of links) {
    const href = link.getAttribute("href");
    if (!href) continue;

    try {
      const url = new URL(href, window.location.origin);

      if (!url.searchParams.has("utm_source")) {
        url.searchParams.set("utm_source", source);
        link.setAttribute("href", url.toString());
      }
    } catch {
      // Invalid URL, skip
    }
  }
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initializes all tracking functionality
 */
export function initTracking(): void {
  // Initialize dataLayer first
  initDataLayer();

  // Store incoming UTM parameters
  storeUTMParams();

  // Initialize Mautic
  initMautic();

  // Add UTM to outbound links on DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    addUTMToLinks();
  });
}
