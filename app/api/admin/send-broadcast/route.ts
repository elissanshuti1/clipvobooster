import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import nodemailer from 'nodemailer';

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
    const { subject, body: emailBody, type, sendToAll, userIds } = body;

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const users = db.collection('users');
    const emailStats = db.collection('admin_email_stats');
    const adminEmailLog = db.collection('admin_email_log');

    // Get recipients
    let recipients;
    if (sendToAll) {
      recipients = await users.find({ isSuspended: { $ne: true } }).toArray();
    } else {
      recipients = await users.find({ 
        _id: { $in: userIds.map(id => new require('mongodb').ObjectId(id)) }
      }).toArray();
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients found' }, { status: 400 });
    }

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const stat = await emailStats.findOne({ date: { $gte: today } });
    const sentToday = stat?.count || 0;
    const dailyLimit = 100;

    if (sentToday + recipients.length > dailyLimit) {
      return NextResponse.json({ 
        error: 'Daily limit exceeded',
        remaining: dailyLimit - sentToday
      }, { status: 400 });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST,
      port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    // Send emails
    let sentCount = 0;
    for (const recipient of recipients) {
      try {
        await transporter.sendMail({
          from: `"${process.env.BREVO_SENDER_NAME || 'ClipVo'}" <${process.env.BREVO_SENDER_EMAIL || 'noreply@clipvo.site'}>`,
          to: recipient.email,
          subject: subject,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">ClipVoBooster</h1>
              </div>
              <div style="padding: 32px; background: #ffffff; color: #1f2937;">
                <p style="font-size: 16px; line-height: 1.6;">Hi ${recipient.name || 'there'},</p>
                <div style="line-height: 1.8; color: #374151;">
                  ${emailBody.replace(/\n/g, '<br>')}
                </div>
                <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #e5e7eb;">
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">Best regards,</p>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #1f2937;"><strong>The ClipVoBooster Team</strong></p>
                </div>
              </div>
              <div style="background: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
                <p style="margin: 0;">© 2024 ClipVoBooster. All rights reserved.</p>
              </div>
            </div>
          `
        });
        sentCount++;
      } catch (emailError) {
        console.error(`Failed to send to ${recipient.email}:`, emailError);
      }
    }

    // Update daily count
    await emailStats.updateOne(
      { date: { $gte: today } },
      { 
        $inc: { count: sentCount },
        $setOnInsert: { date: today, count: sentCount }
      },
      { upsert: true }
    );

    // Log the broadcast
    await adminEmailLog.insertOne({
      adminId: payload.sub,
      subject,
      type,
      recipientCount: recipients.length,
      sentCount,
      sendToAll,
      timestamp: new Date()
    });

    return NextResponse.json({ 
      success: true, 
      sentCount,
      totalRecipients: recipients.length
    });

  } catch (error: any) {
    console.error('Broadcast email error:', error.message);
    return NextResponse.json(
      { error: 'Failed to send broadcast email' },
      { status: 500 }
    );
  }
}
