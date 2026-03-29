import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';

// GET - Get leads count for dashboard overview
export async function GET(req: Request) {
  try {
    const cookie = (req as any).headers.get('cookie') || '';
    const m = cookie.split(';').map((s: string) => s.trim()).find((s: string) => s.startsWith('token='));
    const token = m ? m.split('=')[1] : null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const leads = db.collection('leads');

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count total leads and today's leads
    const totalLeads = await leads.countDocuments({ userId: String(payload.sub) });
    const todayLeads = await leads.countDocuments({ 
      userId: String(payload.sub),
      createdAt: { $gte: today }
    });

    return NextResponse.json({
      total: totalLeads,
      today: todayLeads
    });

  } catch (err: any) {
    console.error('Get leads count error:', err.message);
    return NextResponse.json({ error: 'Failed to get leads count', details: err.message }, { status: 500 });
  }
}
