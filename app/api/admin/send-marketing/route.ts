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
    let { subject, body: emailBody, ctaText, type, sendToAll, userIds, targetPlan } = body;

    // Safety: parse subject/body if they come as JSON string
    if (typeof subject === 'string') {
      try {
        const parsed = JSON.parse(subject);
        if (typeof parsed === 'object') {
          subject = parsed.subject || subject;
        }
      } catch {}
    }
    if (typeof emailBody === 'string') {
      try {
        const parsed = JSON.parse(emailBody);
        if (typeof parsed === 'object' && parsed.body) {
          emailBody = parsed.body;
          subject = parsed.subject || subject;
          ctaText = parsed.cta || ctaText;
        }
      } catch {}
    }

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

      // Clean the body text
    const cleanBody = personalizedBody
      .replace(/^{[^}]*}/g, '')  // Remove any leading JSON
      .replace(/}$/g, '')
      .trim();

    // Convert plain newlines to HTML
    const bodyHtml = cleanBody.split('\n').map(line => line.trim()).filter(Boolean).map(line => `<p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #333333;">${line}</p>`).join('');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background: #f0f0f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f0f0f0;">
    <tr>
      <td align="center" style="padding: 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 4px;">
          <tr>
            <td style="padding: 16px 24px; border-bottom: 1px solid #f0f0f0;">
              <span style="font-size: 16px; font-weight: bold; color: #222222;">ClipVoBooster</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px;">
              <div style="font-size: 14px; color: #333333; line-height: 1.6;">
${bodyHtml}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 24px 24px;">
              <a href="${clickUrl}" style="display: inline-block; padding: 10px 20px; background: #222222; color: #ffffff; text-decoration: none; font-size: 14px; border-radius: 4px;">
                ${ctaText || 'View'}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 24px; background: #fafafa; border-top: 1px solid #f0f0f0;">
              <p style="margin: 0; font-size: 11px; color: #888888;">
                You received this email because you're a ClipVoBooster user.<br>
                <a href="${appUrl}" style="color: #555555;">Visit website</a> &nbsp;|&nbsp; 
                <a href="${appUrl}/unsubscribe" style="color: #555555;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <img src="${openUrl}" alt="" width="1" height="1" style="display: block; opacity: 0;" />
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