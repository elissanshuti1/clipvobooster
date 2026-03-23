import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET - Track email link clicks ONLY
// Note: We do NOT track email opens (Gmail auto-loads images)
// We only track when users CLICK links (100% human action)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const trackingId = url.searchParams.get('t');
    const clickUrl = url.searchParams.get('u');

    console.log('=== CLICK TRACKING REQUEST ===');
    console.log('Tracking ID:', trackingId);
    console.log('Click URL:', clickUrl);

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const sentEmails = db.collection('sent_emails');
    const notifications = db.collection('notifications');
    const emailClicks = db.collection('email_clicks');

    // Must have both tracking ID and click URL
    if (!trackingId || !clickUrl) {
      console.log('Missing tracking ID or click URL');
      return new NextResponse('', { status: 404 });
    }

    const email = await sentEmails.findOne({ trackingId });
    console.log('Found email:', email ? 'YES' : 'NO');

    if (!email) {
      console.log('Email not found with trackingId:', trackingId);
      return new NextResponse('', { status: 404 });
    }

    // Record the click
    await emailClicks.insertOne({
      emailId: email._id,
      userId: email.userId,
      trackingId,
      url: clickUrl,
      clickedAt: new Date(),
      userAgent: req.headers.get('user-agent')
    });

    // Update email: increment click count
    const updateResult = await sentEmails.updateOne(
      { trackingId },
      {
        $inc: { clickCount: 1 },
        $set: { lastClickedAt: new Date() }
      }
    );
    console.log('Click update result:', updateResult.modifiedCount);

    // Create notification for sender
    await notifications.insertOne({
      userId: email.userId,
      type: 'email_clicked',
      title: 'Link Clicked',
      message: `${email.to} clicked a link in your email "${email.subject}"`,
      emailId: email._id,
      read: false,
      createdAt: new Date()
    });
    console.log('Click notification created');

    // Redirect to the actual URL
    return NextResponse.redirect(clickUrl);

  } catch (err: any) {
    console.error('Track error:', err.message);
    console.error('Track error stack:', err.stack);
    return new NextResponse('', { status: 500 });
  }
}
