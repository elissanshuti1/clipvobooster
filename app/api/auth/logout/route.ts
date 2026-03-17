import { NextResponse } from 'next/server';

export async function POST() {
  const resp = NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  // clear cookie
  resp.headers.set('Set-Cookie', `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure}`);
  return resp;
}
