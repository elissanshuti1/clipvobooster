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
    
    const users = db.collection('users');
    const sentEmails = db.collection('sent_emails');
    const emailClicks = db.collection('email_clicks');
    const pageViews = db.collection('page_views');

    // Get counts
    const totalUsers = await users.countDocuments();
    
    // Active users (last 7 days)
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

    // Email stats
    const totalEmails = await sentEmails.countDocuments();
    const totalClicks = await emailClicks.countDocuments();
    const avgEmailsPerUser = totalUsers > 0 ? totalEmails / totalUsers : 0;
    const clickThroughRate = totalEmails > 0 ? (totalClicks / totalEmails) * 100 : 0;

    // Returning users
    const returningUsers = await users.countDocuments({
      lastLogin: { $exists: true, $ne: null }
    });

    // User growth (simplified)
    const lastWeekUsers = await users.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    const userGrowth = totalUsers > 0 ? ((lastWeekUsers / totalUsers) * 100).toFixed(1) : 0;

    // Popular pages
    const popularPages = await pageViews.aggregate([
      { $group: { _id: '$path', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 }
    ]).toArray();

    return NextResponse.json({
      totalUsers,
      activeUsers,
      newUsersToday,
      totalEmails,
      totalClicks,
      avgEmailsPerUser,
      clickThroughRate,
      returningUsers,
      userGrowth: parseFloat(userGrowth),
      popularFeatures: [
        'Email Composition',
        'Contact Management',
        'Analytics Dashboard',
        'Email Templates'
      ],
      popularPages: popularPages.map((p: any) => ({
        path: p._id,
        views: p.views
      }))
    });

  } catch (error: any) {
    console.error('Insights data error:', error.message);
    return NextResponse.json(
      { error: 'Failed to load insights data' },
      { status: 500 }
    );
  }
}
