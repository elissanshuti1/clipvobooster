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
    const pageViews = db.collection('page_views');

    // Get page views grouped by path
    const views = await pageViews.aggregate([
      {
        $group: {
          _id: '$path',
          views: { $sum: 1 }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]).toArray();

    return NextResponse.json(views.map(v => ({
      path: v._id,
      views: v.views
    })));

  } catch (error: any) {
    console.error('Admin page views error:', error.message);
    return NextResponse.json(
      { error: 'Failed to load page views' },
      { status: 500 }
    );
  }
}
