import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';

// GET - Get analytics data
export async function GET(req: Request) {
  try {
    const cookie = (req as any).headers.get('cookie') || '';
    const m = cookie.split(';').map((s: string) => s.trim()).find((s: string) => s.startsWith('token='));
    const token = m ? m.split('=')[1] : null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const sentEmails = db.collection('sent_emails');
    const emailClicks = db.collection('email_clicks');

    const userId = String(payload.sub); // Ensure string format
    console.log('Analytics request for userId:', userId);

    // Get all sent emails
    const allEmails = await sentEmails.find({ userId }).toArray();
    console.log('Found emails:', allEmails.length);

    // Get click data
    const allClicks = await emailClicks.find({ userId }).toArray();
    const uniqueClicks = new Set(allClicks.map(c => c.emailId.toString())).size;

    const stats = {
      sent: allEmails.length,
      opened: allEmails.filter(e => e.opened).length,
      openRate: allEmails.length > 0 ? Math.round((allEmails.filter(e => e.opened).length / allEmails.length) * 100) : 0,
      totalOpens: allEmails.reduce((sum, e) => sum + (e.openCount || 0), 0),
      clicked: uniqueClicks,
      clickRate: allEmails.length > 0 ? Math.round((uniqueClicks / allEmails.length) * 100) : 0,
      totalClicks: allClicks.length
    };

    console.log('Analytics stats:', stats);

    // Get recent emails with click data
    const recentEmails = allEmails
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
      .slice(0, 20)
      .map(e => ({
        _id: e._id,
        to: e.to,
        subject: e.subject,
        status: e.status,
        opened: e.opened,
        openedAt: e.openedAt,
        openCount: e.openCount,
        clickCount: e.clickCount || 0,
        lastClickedAt: e.lastClickedAt,
        sentAt: e.sentAt
      }));

    return NextResponse.json({ stats, recentEmails });

  } catch (err: any) {
    console.error('Get analytics error:', err.message);
    console.error('Get analytics error stack:', err.stack);
    return NextResponse.json({ error: 'Failed to get analytics', details: err.message }, { status: 500 });
  }
}
