import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/astro/server';
import type { APIContext } from 'astro';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/assine(.*)',
  '/api/webhooks(.*)',
]);

const SUBSCRIPTION_URL = 'https://jobnagringa.com.br/assine';

const checkIsPaidCustomer = async (context: APIContext, userId: string): Promise<boolean> => {
  try {
    const user = await clerkClient(context).users.getUser(userId);
    const publicMetadata = user.publicMetadata as Record<string, unknown> | undefined;

    if (!publicMetadata) {
      return false;
    }

    if (publicMetadata.isRefund === true) {
      return false;
    }

    return publicMetadata.isPaidCustomer === true;
  } catch (error) {
    console.error('[Middleware] Error checking paid status:', error);
    return false;
  }
};

export const onRequest = clerkMiddleware(async (auth, context, next) => {
  if (isPublicRoute(context.request)) {
    return next();
  }

  const { userId, redirectToSignIn } = auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const isPaid = await checkIsPaidCustomer(context as unknown as APIContext, userId);

  if (!isPaid) {
    return context.redirect(SUBSCRIPTION_URL);
  }

  return next();
});
