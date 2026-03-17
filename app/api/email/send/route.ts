import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
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

    const body = await req.json();
    const { to, subject, body: emailBody } = body;

    if (!to || !subject || !emailBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user info from database
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const users = db.collection('users');

    const user = await users.findOne({ _id: new (require('mongodb').ObjectId)(payload.sub) });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate tracking ID
    const trackingId = `trk_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    // Use production URL for tracking (localhost won't work when email is opened elsewhere)
    const appUrl = process.env.NEXT_PUBLIC_PROD_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    console.log('App URL for tracking:', appUrl);
    const trackingPixel = `<img src="${appUrl}/api/track?t=${trackingId}" width="1" height="1" style="display:none" />`;

    // Add promotion link with user's website from profile
    const senderName = user.profile?.projectName || user.name || user.email.split('@')[0];
    const senderWebsite = user.profile?.projectUrl;

    const signatureHtml = senderWebsite
      ? `<div style="margin-top:24px;padding-top:20px;border-top:2px solid #e5e7eb">
           <p style="margin:0;font-size:14px;color:#1f2937"><strong>Best regards,</strong></p>
           <p style="margin:4px 0 0 0;font-size:14px;color:#1f2937"><strong>${senderName}</strong></p>
           <p style="margin:4px 0 0 0;font-size:13px;color:#6b7280"><a href="${senderWebsite}" style="color:#6366f1;text-decoration:none" target="_blank">${senderWebsite}</a></p>
           ${user.profile?.projectDescription ? `<p style="margin:8px 0 0 0;font-size:12px;color:#9ca3af">${user.profile.projectDescription.substring(0, 100)}...</p>` : ''}
         </div>`
      : `<div style="margin-top:24px;padding-top:20px;border-top:2px solid #e5e7eb">
           <p style="margin:0;font-size:14px;color:#1f2937"><strong>Best regards,</strong></p>
           <p style="margin:4px 0 0 0;font-size:14px;color:#1f2937"><strong>${senderName}</strong></p>
         </div>`;

    // Create professional HTML email with proper styling
    const fullBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.8; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 0; }
    .email-wrapper { background-color: #f9fafb; padding: 40px 20px; }
    .email-container { max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden; }
    .email-header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 40px; text-align: center; }
    .email-header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
    .email-body { padding: 40px; }
    .email-body p { margin: 16px 0; font-size: 15px; color: #374151; }
    .cta-button { display: inline-block; margin: 24px 0; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }
    .signature { margin-top: 32px; padding-top: 24px; border-top: 2px solid #e5e7eb; }
    .signature p { margin: 4px 0; font-size: 14px; color: #6b7280; }
    .footer { background-color: #f3f4f6; padding: 24px 40px; text-align: center; font-size: 12px; color: #9ca3af; }
    @media only screen and (max-width: 600px) {
      .email-body { padding: 24px !important; }
      .email-header { padding: 24px !important; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <h1>${subject.replace(/"/g, '&quot;')}</h1>
      </div>
      <div class="email-body">
        ${emailBody
          .replace(/\n\n\n+/g, '\n\n')
          .split('\n\n')
          .map(p => {
            // Wrap URLs in tracking links
            const trackedP = p.replace(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi, (url) => {
              const encodedUrl = encodeURIComponent(url);
              return `<a href="${appUrl}/api/track?t=${trackingId}&u=${encodedUrl}" style="color:#6366f1;text-decoration:none" target="_blank">${url}</a>`;
            });
            return `<p>${trackedP}</p>`;
          })
          .join('')
        }
        ${senderWebsite ? `<div style="text-align:center"><a href="${appUrl}/api/track?t=${trackingId}&u=${encodeURIComponent(senderWebsite)}" class="cta-button" target="_blank">Visit Our Website</a></div>` : ''}
        ${signatureHtml}
        <div style="text-align:center;margin-top:24px">
          <img src="${appUrl}/api/track?t=${trackingId}" width="1" height="1" style="display:none;border:0;height:1px;width:1px" alt="" />
        </div>
      </div>
      <div class="footer">
        <p style="margin:0">This email was sent from ${senderName}. If you no longer wish to receive these emails, you can reply to unsubscribe.</p>
      </div>
    </div>
  </div>
  ${trackingPixel}
</body>
</html>
    `.trim();

    // Create Brevo SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST,
      port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    // Verify transporter configuration
    await transporter.verify();
    console.log('Brevo SMTP connection verified');

    console.log('Sending email to:', to);
    console.log('Subject:', subject);

    // Get sender info from environment
    const smtpSenderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@clipvo.site';
    const smtpSenderName = process.env.BREVO_SENDER_NAME || 'ClipVo';

    // Send email via Brevo
    const info = await transporter.sendMail({
      from: `"${smtpSenderName}" <${smtpSenderEmail}>`,
      to: to,
      subject: subject,
      html: fullBody,
      headers: {
        'X-Tracking-ID': trackingId,
        'X-User-ID': String(user._id),
      }
    });

    console.log('Email sent:', info.messageId);
    console.log('Tracking ID:', trackingId);
    console.log('User ID:', user._id);
    console.log('User ID type:', typeof user._id);

    // Save to sent emails collection
    const sentEmails = db.collection('sent_emails');
    const insertResult = await sentEmails.insertOne({
      userId: String(user._id), // Ensure string format for consistent querying
      userEmail: user.email,
      to,
      subject,
      body: emailBody,
      fullBody: fullBody,
      trackingId,
      messageId: info.messageId,
      status: 'sent',
      opened: false,
      openCount: 0,
      clickCount: 0,
      sentAt: new Date(),
      openedAt: null,
      lastClickedAt: null
    });

    console.log('Saved to DB with ID:', insertResult.insertedId);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully!'
    });

  } catch (err: any) {
    console.error('Send email error:', err.message);
    console.error('Error details:', err);

    // Handle SMTP authentication errors
    if (err.code === 'EAUTH') {
      return NextResponse.json({
        error: 'Email service authentication failed. Please check SMTP credentials.',
        action: 'check_smtp_credentials'
      }, { status: 401 });
    }

    // Handle connection errors
    if (err.code === 'ECONNECTION' || err.code === 'ESOCKET') {
      return NextResponse.json({
        error: 'Could not connect to email service. Please try again.',
        action: 'retry'
      }, { status: 503 });
    }

    return NextResponse.json({
      error: 'Failed to send email',
      details: err.message
    }, { status: 500 });
  }
}
