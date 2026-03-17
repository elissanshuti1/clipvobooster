import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';

export async function GET(req: Request) {
  try {
    // Verify user is logged in
    const cookie = (req as any).headers.get('cookie') || '';
    const m = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('token='));
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

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const sentEmails = db.collection('sent_emails');

    // Get all sent emails for this user
    const emails = await sentEmails
      .find({ userId: String(payload.sub) })
      .sort({ sentAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ emails });

  } catch (err: any) {
    console.error('Get sent emails error:', err.message);
    return NextResponse.json({
      error: 'Failed to fetch sent emails',
      details: err.message
    }, { status: 500 });
  }
}
