import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: Request, { params }: { params: Promise<{ campaignId: string; trackingId: string }> }) {
  try {
    const { campaignId, trackingId } = await params;
    const url = new URL(req.url);
    const target = url.searchParams.get('target') || process.env.NEXT_PUBLIC_APP_URL || 'https://clipvo.site';

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const tracking = db.collection('admin_email_tracking');

    try {
      await tracking.updateOne(
        { campaignId, trackingId },
        { 
          $inc: { clicks: 1 },
          $set: { lastClickedAt: new Date() },
          $addToSet: { clickedEmails: trackingId }
        },
        { upsert: true }
      );
    } catch (e) {
      console.error('Tracking error:', e);
    }

    return NextResponse.redirect(target);
  } catch (error) {
    return NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL || 'https://clipvo.site');
  }
}