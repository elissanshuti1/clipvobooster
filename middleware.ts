import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const token = req.cookies.get('token');

  // If user is logged in and trying to access login/signup, redirect to dashboard
  if (token && (url.pathname === '/login' || url.pathname === '/signup')) {
    url.pathname = '/dashboard/overview';
    return NextResponse.redirect(url);
  }

  // If user is NOT logged in and trying to access dashboard, redirect to login
  if (!token && url.pathname.startsWith('/dashboard')) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If user is NOT logged in and trying to access pricing, allow it
  // (they need to see pricing to know what to buy)

  // If user is NOT logged in and trying to access payment routes, redirect to login
  if (!token && url.pathname.startsWith('/api/payment')) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup', '/pricing', '/api/payment/:path*'],
};
