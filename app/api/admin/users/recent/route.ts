import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: Request) {
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

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const users = db.collection('users');

    // Get recent users (last 10 signups)
    const recentUsers = await users.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json(recentUsers.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
      isSuspended: u.isSuspended
    })));

  } catch (error: any) {
    console.error('Admin users error:', error.message);
    return NextResponse.json(
      { error: 'Failed to load users' },
      { status: 500 }
    );
  }
}
