import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import nodemailer from 'nodemailer';
import { ObjectId } from 'mongodb';

export async function POST(req: Request) {
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

    const body = await req.json();
    const { subject, body: emailBody, ctaText, type, sendToAll, userIds, targetPlan } = body;

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const users = db.collection('users');
    const marketingEmails = db.collection('admin_marketing_emails');
    const tracking = db.collection('admin_email_tracking');

    let query: any = { isSuspended: { $ne: true } };
    
    if (targetPlan && targetPlan !== 'all') {
      query['subscription.plan'] = targetPlan;
    }

    let recipients;
    if (sendToAll) {
      recipients = await users.find(query).toArray();
    } else if (userIds && userIds.length > 0) {
      recipients = await users.find({ 
        _id: { $in: userIds.map((id: string) => new ObjectId(id)) }
      }).toArray();
    } else {
      return NextResponse.json({ error: 'No recipients specified' }, { status: 400 });
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients found' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST,
      port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    const campaignId = new ObjectId().toString();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clipvo.site';

    let sentCount = 0;
    const recipientRecords: Array<{email: string; trackingId: string; status: string}> = [];

    for (const recipient of recipients) {
      const trackingId = new ObjectId().toString();
      const openUrl = `${appUrl}/track/open?c=${campaignId}&t=${trackingId}`;
      const clickUrl = `${appUrl}/track/click/${campaignId}/${trackingId}?target=${encodeURIComponent(appUrl)}`;
      
      const personalizedBody = emailBody
        .replace(/{name}/g, recipient.name || 'there')
        .replace(/{email}/g, recipient.email);

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
    <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">🚀 ClipVoBooster</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Find Customers on Reddit • Automate Your Outreach</p>
    </div>
    
    <div style="padding: 32px 24px;">
      <p style="font-size: 16px; color: #1f2937; line-height: 1.7; margin: 0 0 24px 0;">
        Hi ${recipient.name || 'there'},
      </p>
      
      <div style="font-size: 16px; color: #374151; line-height: 1.8; margin-bottom: 32px;">
        ${personalizedBody.replace(/\n/g, '<br>')}
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${clickUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;">
          ${ctaText || 'Get Started'} →
        </a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 24px;">
        Join thousands of founders using ClipVoBooster to grow their business
      </p>
    </div>
    
    <div style="background: #f3f4f6; padding: 24px; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
        © 2024 ClipVoBooster. All rights reserved.<br>
        <a href="${appUrl}/unsubscribe" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
      </p>
    </div>
    
    <img src="${openUrl}" alt="" style="display: block; width: 1px; height: 1px; opacity: 0;" />
  </div>
</body>
</html>`;

      try {
        await transporter.sendMail({
          from: `"ClipVoBooster" <${process.env.BREVO_SENDER_EMAIL || 'noreply@clipvo.site'}>`,
          to: recipient.email,
          subject: subject,
          html: htmlContent,
        });

        recipientRecords.push({
          email: recipient.email,
          trackingId,
          status: 'sent'
        });
        sentCount++;
      } catch (emailError) {
        console.error(`Failed to send to ${recipient.email}:`, emailError);
        recipientRecords.push({
          email: recipient.email,
          trackingId,
          status: 'failed'
        });
      }
    }

    await marketingEmails.insertOne({
      campaignId,
      adminId: payload.sub,
      subject,
      body: emailBody,
      ctaText: ctaText || 'Get Started',
      type: type || 'custom',
      targetPlan: targetPlan || 'all',
      sendToAll: sendToAll || false,
      recipientCount: recipients.length,
      sentCount,
      createdAt: new Date()
    });

    await tracking.insertOne({
      campaignId,
      recipients: recipientRecords,
      opens: 0,
      clicks: 0,
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      campaignId,
      sentCount,
      totalRecipients: recipients.length,
      type
    });

  } catch (error: any) {
    console.error('Send marketing email error:', error.message);
    return NextResponse.json(
      { error: 'Failed to send marketing email' },
      { status: 500 }
    );
  }
}