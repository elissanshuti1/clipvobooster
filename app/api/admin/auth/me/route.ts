import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const cookie = (req as any).headers.get('cookie') || '';
    const m = cookie.split(';').map((s: string) => s.trim()).find((s: string) => s.startsWith('admin_token='));
    const token = m ? m.split('=')[1] : null;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload || !payload.isAdmin) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      admin: {
        id: payload.sub,
        username: payload.username,
        name: payload.name,
        role: payload.role
      }
    });

  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
