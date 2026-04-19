import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const campaignId = url.searchParams.get('c');
    const trackingId = url.searchParams.get('t');

    if (!campaignId || !trackingId) {
      return new NextResponse(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'), {
        headers: { 'Content-Type': 'image/gif' },
      });
    }

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const tracking = db.collection('admin_email_tracking');

    // Update opens count for the campaign
    await tracking.updateOne(
      { campaignId },
      { 
        $inc: { opens: 1 },
        $set: { lastOpenedAt: new Date() }
      }
    );

    console.log('Open tracked:', campaignId, trackingId);

    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'public, max-age=0',
      },
    });
  } catch (error) {
    console.error('Open tracking error:', error);
    return new NextResponse(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'), {
      headers: { 'Content-Type': 'image/gif' },
    });
  }
}