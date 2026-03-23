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
    const visits = db.collection('visits');

    // Get total visits
    const totalVisits = await visits.countDocuments();

    // Get unique visitors (by IP)
    const uniqueVisitors = await visits.distinct('ip');

    // Get visits by date (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentVisits = await visits.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          views: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$ip' }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    return NextResponse.json({
      totalVisits,
      uniqueVisitors: uniqueVisitors.length,
      recentVisits: recentVisits.map((v: any) => ({
        date: v._id,
        views: v.views,
        uniqueVisitors: v.uniqueVisitors.length
      }))
    });

  } catch (error: any) {
    console.error('Visits analytics error:', error.message);
    return NextResponse.json(
      { error: 'Failed to load visits analytics' },
      { status: 500 }
    );
  }
}
