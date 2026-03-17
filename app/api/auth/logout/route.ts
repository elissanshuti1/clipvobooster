import { NextResponse } from 'next/server';

export async function POST() {
  const resp = NextResponse.json({ success: true });
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  
  // Clear cookie with proper attributes
  resp.headers.set('Set-Cookie', `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure}`);
  
  return resp;
}
