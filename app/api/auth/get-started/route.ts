import { NextResponse } from 'next/server';

// GET - Auto-create user session and redirect to pricing
export async function GET(req: Request) {
  try {
    const cookie = (req as any).headers.get('cookie') || '';
    const m = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('token='));
    const token = m ? m.split('=')[1] : null;
    
    // If user already has token, redirect to pricing
    if (token) {
      return NextResponse.redirect(new URL('/pricing', req.url));
    }
    
    // No token - redirect to Google OAuth
    return NextResponse.redirect(new URL('/api/auth/google', req.url));
  } catch (err: any) {
    console.error('Get Started error:', err);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}
