import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const token = req.cookies.get('token');

  // If user is logged in and trying to access login/signup, redirect to pricing or dashboard
  if (token && (url.pathname === '/login' || url.pathname === '/signup')) {
    // Check if user has subscription by looking at cookie (set after login)
    const hasSubscription = req.cookies.get('has_subscription');
    if (hasSubscription && hasSubscription.value === 'true') {
      url.pathname = '/dashboard/overview';
    } else {
      url.pathname = '/pricing';
    }
    return NextResponse.redirect(url);
  }

  // If user is NOT logged in and trying to access dashboard, redirect to login
  if (!token && url.pathname.startsWith('/dashboard')) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If user is logged in but doesn't have subscription and tries to access dashboard
  // Redirect to pricing page (except for pricing page itself and payment routes)
  if (token && url.pathname.startsWith('/dashboard')) {
    const hasSubscription = req.cookies.get('has_subscription');
    if (!hasSubscription || hasSubscription.value !== 'true') {
      // Allow access to pricing and payment routes
      if (!url.pathname.startsWith('/pricing') && !url.pathname.startsWith('/api/payment')) {
        url.pathname = '/pricing';
        return NextResponse.redirect(url);
      }
    }
  }

  // If user has subscription and tries to access pricing, redirect to dashboard
  if (token && url.pathname === '/pricing') {
    const hasSubscription = req.cookies.get('has_subscription');
    if (hasSubscription && hasSubscription.value === 'true') {
      url.pathname = '/dashboard/overview';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup', '/pricing'],
};
