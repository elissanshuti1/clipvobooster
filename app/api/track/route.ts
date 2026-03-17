import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET - Track email open (1-pixel tracking image) or click
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const trackingId = url.searchParams.get('t');
    const clickUrl = url.searchParams.get('u'); // For click tracking
    
    console.log('=== TRACKING REQUEST ===');
    console.log('Tracking ID:', trackingId);
    console.log('Click URL:', clickUrl);
    
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const sentEmails = db.collection('sent_emails');
    const notifications = db.collection('notifications');
    const emailClicks = db.collection('email_clicks');

    // Handle click tracking - redirect to actual URL
    if (clickUrl && trackingId) {
      console.log('Processing CLICK tracking...');
      
      // Record the click
      const email = await sentEmails.findOne({ trackingId });
      console.log('Found email:', email ? 'YES' : 'NO');
      
      if (email) {
        await emailClicks.insertOne({
          emailId: email._id,
          userId: email.userId,
          trackingId,
          url: clickUrl,
          clickedAt: new Date()
        });

        // Update email click count
        const updateResult = await sentEmails.updateOne(
          { trackingId },
          {
            $inc: { clickCount: 1 },
            $set: { lastClickedAt: new Date() }
          }
        );
        console.log('Click update result:', updateResult.modifiedCount);

        // Create notification for sender
        const recipientEmail = email.to;
        await notifications.insertOne({
          userId: email.userId,
          type: 'email_clicked',
          title: 'Link Clicked',
          message: `${recipientEmail} clicked a link in your email "${email.subject}"`,
          emailId: email._id,
          read: false,
          createdAt: new Date()
        });
        console.log('Click notification created');
      }

      // Redirect to the actual URL
      return NextResponse.redirect(clickUrl);
    }

    // Handle open tracking
    if (!trackingId) {
      console.log('No tracking ID provided');
      return new NextResponse('', { status: 404 });
    }

    console.log('Processing OPEN tracking...');
    
    // Get email details before updating
    const email = await sentEmails.findOne({ trackingId });
    console.log('Found email for open tracking:', email ? 'YES' : 'NO');
    
    if (!email) {
      console.log('Email not found with trackingId:', trackingId);
      return new NextResponse('', { status: 404 });
    }

    const wasAlreadyOpened = email.opened;
    
    // Update email open status
    const updateResult = await sentEmails.updateOne(
      { trackingId },
      {
        $set: {
          opened: true,
          openedAt: new Date()
        },
        $inc: { openCount: 1 }
      }
    );
    console.log('Open update result:', updateResult.modifiedCount);

    // Create notification only if this is the first open
    if (!wasAlreadyOpened) {
      await notifications.insertOne({
        userId: email.userId,
        type: 'email_opened',
        title: 'Email Opened',
        message: `${email.to} opened your email "${email.subject}"`,
        emailId: email._id,
        read: false,
        createdAt: new Date()
      });
      console.log('Open notification created');
    }

    // Return 1x1 transparent PNG
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

    console.log('Tracking pixel returned');
    return new NextResponse(png, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (err: any) {
    console.error('Track error:', err.message);
    console.error('Track error stack:', err.stack);
    return new NextResponse('', { status: 500 });
  }
}
