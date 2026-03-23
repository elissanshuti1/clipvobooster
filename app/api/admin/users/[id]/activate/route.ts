import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    // Verify admin authentication
    const cookie = (req as any).headers.get('cookie') || '';
    const m = cookie.split(';').map((s: string) => s.trim()).find((s: string) => s.startsWith('admin_token='));
    const token = m ? m.split('=')[1] : null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from URL
    const url = new URL(req.url);
    const userId = url.pathname.split('/').slice(-2)[0];

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const users = db.collection('users');

    // Activate user
    await users.updateOne(
      { _id: new require('mongodb').ObjectId(userId) },
      { $set: { isSuspended: false, activatedAt: new Date() } }
    );

    return NextResponse.json({ success: true, message: 'User activated' });

  } catch (error: any) {
    console.error('Admin activate user error:', error.message);
    return NextResponse.json(
      { error: 'Failed to activate user' },
      { status: 500 }
    );
  }
}
