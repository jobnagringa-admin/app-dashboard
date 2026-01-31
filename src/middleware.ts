import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/assine(.*)',
  '/api/webhooks(.*)',
]);

// Subscription redirect URL
const SUBSCRIPTION_URL = 'https://jobnagringa.com.br/assine';

export const onRequest = clerkMiddleware((auth, context) => {
  // Allow public routes without authentication
  if (isPublicRoute(context.request)) {
    return;
  }

  const authData = auth();
  const { userId, sessionClaims } = authData;

  // If not logged in, redirect to sign-in
  if (!userId) {
    return authData.redirectToSignIn();
  }

  // Check if user has isPaidCustomer in their public metadata
  // Clerk stores public_metadata in sessionClaims under publicMetadata key
  const publicMetadata = sessionClaims?.publicMetadata as { isPaidCustomer?: boolean } | undefined;
  const isPaidCustomer = publicMetadata?.isPaidCustomer === true;

  // If user is not a paid customer, redirect to subscription page
  if (!isPaidCustomer) {
    return context.redirect(SUBSCRIPTION_URL);
  }

  // User is authenticated and is a paid customer - allow access
});
