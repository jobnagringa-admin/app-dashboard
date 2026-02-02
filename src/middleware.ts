import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/astro/server';
import type { APIContext } from 'astro';

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/assine(.*)',
  '/api/webhooks(.*)',
]);

// Dashboard URL for paid customers
const DASHBOARD_URL = 'https://dash.jobnagringa.com.br';

// Sign-in URL with redirect back to dashboard
const SIGN_IN_URL = `https://accounts.jobnagringa.com.br/sign-in?redirect_url=${encodeURIComponent(DASHBOARD_URL)}`;

// Subscription redirect URL for non-paid users
const SUBSCRIPTION_URL = 'https://jobnagringa.com.br/assine';

// Check if running on localhost
const isLocalhost = (request: Request): boolean => {
  const url = new URL(request.url);
  const hostname = url.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
};

// Check if user has valid paid subscription by fetching user data from Clerk API
const checkIsPaidCustomer = async (
  context: APIContext,
  userId: string
): Promise<boolean> => {
  try {
    console.log('[Middleware] Fetching user data for:', userId);

    const user = await clerkClient(context).users.getUser(userId);
    const publicMetadata = user.publicMetadata as Record<string, unknown> | undefined;

    console.log('[Middleware] User publicMetadata:', JSON.stringify(publicMetadata, null, 2));

    if (!publicMetadata) {
      console.log('[Middleware] No public metadata found');
      return false;
    }

    const isPaidValue = publicMetadata.isPaidCustomer ?? publicMetadata.is_paid_customer;
    console.log('[Middleware] isPaidCustomer value:', isPaidValue, '| type:', typeof isPaidValue);

    // Handle different value types: boolean true, string "true", or number 1
    let result = false;
    if (typeof isPaidValue === 'boolean') result = isPaidValue;
    else if (typeof isPaidValue === 'string') result = isPaidValue.toLowerCase() === 'true';
    else if (typeof isPaidValue === 'number') result = isPaidValue === 1;

    console.log('[Middleware] Final isPaidCustomer result:', result);
    return result;
  } catch (error) {
    console.error('[Middleware] Error fetching user data:', error);
    return false;
  }
};

// Check if the request is coming from the dashboard subdomain
const isDashboardSubdomain = (request: Request): boolean => {
  const url = new URL(request.url);
  return url.hostname === 'dash.jobnagringa.com.br';
};

export const onRequest = clerkMiddleware(async (auth, context) => {
  // Allow all access on localhost without authentication
  if (isLocalhost(context.request)) {
    return;
  }

  // Allow public routes without authentication
  if (isPublicRoute(context.request)) {
    return;
  }

  const authData = auth();
  const { userId } = authData;

  // If not logged in, redirect to accounts sign-in with redirect back to dashboard
  if (!userId) {
    return context.redirect(SIGN_IN_URL);
  }

  // Check if user has valid paid subscription by fetching from Clerk API
  const isPaidCustomer = await checkIsPaidCustomer(context as unknown as APIContext, userId);

  if (isPaidCustomer) {
    // Paid customer - if not on dashboard subdomain, redirect to dashboard
    if (!isDashboardSubdomain(context.request)) {
      return context.redirect(DASHBOARD_URL);
    }
    // Already on dashboard - allow access
    return;
  }

  // User is not a paid customer - redirect to subscription page
  return context.redirect(SUBSCRIPTION_URL);
});
