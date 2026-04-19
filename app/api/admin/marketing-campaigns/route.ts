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
    const campaigns = db.collection('admin_marketing_emails');
    const tracking = db.collection('admin_email_tracking');

    const allCampaigns = await campaigns.find({}).sort({ createdAt: -1 }).limit(50).toArray();
    
    const campaignsWithStats = await Promise.all(allCampaigns.map(async (campaign: any) => {
      const campaignId = campaign._id.toString();
      
      const trackingStats = await tracking.findOne({ campaignId });
      
      return {
        ...campaign,
        _id: campaignId,
        opens: trackingStats?.opens || 0,
        clicks: trackingStats?.clicks || 0,
        openedEmails: trackingStats?.openedEmails || [],
        clickedEmails: trackingStats?.clickedEmails || []
      };
    }));

    return NextResponse.json({ campaigns: campaignsWithStats });

  } catch (error: any) {
    console.error('Get campaigns error:', error.message);
    return NextResponse.json(
      { error: 'Failed to get campaigns' },
      { status: 500 }
    );
  }
}