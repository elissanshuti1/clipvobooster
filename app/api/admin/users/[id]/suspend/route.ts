import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    // Verify admin authentication
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

    // Get user ID from URL
    const url = new URL(req.url);
    const userId = url.pathname.split('/').slice(-2)[0];

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const users = db.collection('users');

    // Find user
    const user = await users.findOne({ _id: new require('mongodb').ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Suspend user
    await users.updateOne(
      { _id: new require('mongodb').ObjectId(userId) },
      { $set: { isSuspended: true, suspendedAt: new Date(), suspendedBy: payload.sub } }
    );

    // Send notification email
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.BREVO_SMTP_HOST,
        port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.BREVO_SMTP_USER,
          pass: process.env.BREVO_SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"${process.env.BREVO_SENDER_NAME || 'ClipVo'}" <${process.env.BREVO_SENDER_EMAIL || 'noreply@clipvo.site'}>`,
        to: user.email,
        subject: 'Account Suspended - ClipVoBooster',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">Account Suspended</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Your ClipVoBooster account has been suspended by our administration team.
            </p>
            <p style="color: #4b5563; line-height: 1.6;">
              If you believe this is a mistake, please contact our support team at 
              <a href="mailto:support@clipvo.site" style="color: #6366f1;">support@clipvo.site</a>
            </p>
            <p style="color: #9ca3af; font-size: 14px; margin-top: 24px;">
              The ClipVoBooster Team
            </p>
          </div>
        `
      });
      console.log('Suspension notification sent to:', user.email);
    } catch (emailError) {
      console.error('Failed to send suspension email:', emailError);
    }

    return NextResponse.json({ success: true, message: 'User suspended' });

  } catch (error: any) {
    console.error('Admin suspend user error:', error.message);
    return NextResponse.json(
      { error: 'Failed to suspend user' },
      { status: 500 }
    );
  }
}
