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
    
    // Get collections
    const users = db.collection('users');
    const sentEmails = db.collection('sent_emails');
    const emailClicks = db.collection('email_clicks');
    const visits = db.collection('visits');
    const pageViews = db.collection('page_views');

    // Get counts
    const totalUsers = await users.countDocuments();
    const totalVisits = await visits.countDocuments();
    const totalEmailsSent = await sentEmails.countDocuments();
    const totalClicks = await emailClicks.countDocuments();

    // Active users (logged in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = await users.countDocuments({
      lastLogin: { $gte: sevenDaysAgo }
    });

    // New users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await users.countDocuments({
      createdAt: { $gte: today }
    });

    // Suspended users
    const suspendedUsers = await users.countDocuments({
      isSuspended: true
    });

    return NextResponse.json({
      totalUsers,
      totalVisits,
      totalEmailsSent,
      totalClicks,
      activeUsers,
      newUsersToday,
      suspendedUsers,
    });

  } catch (error: any) {
    console.error('Admin stats error:', error.message);
    return NextResponse.json(
      { error: 'Failed to load stats' },
      { status: 500 }
    );
  }
}
