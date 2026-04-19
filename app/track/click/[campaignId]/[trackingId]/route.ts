import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(req: Request, { params }: { params: Promise<{ campaignId: string; trackingId: string }> }) {
  try {
    const { campaignId, trackingId } = await params;
    const url = new URL(req.url);
    const target = url.searchParams.get('target') || process.env.NEXT_PUBLIC_APP_URL || 'https://clipvo.site';

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const tracking = db.collection('admin_email_tracking');

    // Update the clicks count for this campaign
    await tracking.updateOne(
      { campaignId },
      { 
        $inc: { clicks: 1 },
        $set: { lastClickedAt: new Date() }
      }
    );

    console.log('Click tracked:', campaignId, trackingId);

    return NextResponse.redirect(target);
  } catch (error) {
    console.error('Click tracking error:', error);
    return NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL || 'https://clipvo.site');
  }
}