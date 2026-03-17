import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';

// GET - Get all sent emails for debugging
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

    const userId = String(payload.sub);
    
    // Get all sent emails with detailed info
    const emails = await sentEmails.find({ userId }).sort({ sentAt: -1 }).limit(50).toArray();

    console.log('Debug: Found emails:', emails.length);
    emails.forEach(email => {
      console.log(`- ${email.subject} to ${email.to} | Opened: ${email.opened} | Opens: ${email.openCount} | Clicks: ${email.clickCount}`);
    });

    return NextResponse.json({ emails });

  } catch (err: any) {
    console.error('Debug emails error:', err.message);
    return NextResponse.json({ error: 'Failed to get debug data', details: err.message }, { status: 500 });
  }
}
