import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
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
    const emailStats = db.collection('admin_email_stats');

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stat = await emailStats.findOne({ date: { $gte: today } });

    return NextResponse.json({
      sentToday: stat?.count || 0,
      dailyLimit: 100 // Default limit
    });

  } catch (error: any) {
    console.error('Email stats error:', error.message);
    return NextResponse.json(
      { error: 'Failed to load email stats' },
      { status: 500 }
    );
  }
}
