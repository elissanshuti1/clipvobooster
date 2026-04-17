import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';

// New Plan limits
export const PLAN_LIMITS = {
  'free-trial': { leads: 100, emails: 50, dailyEmails: 20, templates: 3 },
  starter: { leads: 300, emails: 300, dailyEmails: 50, templates: 10 },
  professional: { leads: 500, emails: 1000, dailyEmails: 200, templates: 999 },
};

export async function GET(req: Request) {
  try {
    const cookie = (req as any).headers.get('cookie') || '';
    const m = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('token='));
    const token = m ? m.split('=')[1] : null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const users = db.collection('users');

    const user = await users.findOne(
      { _id: new (require('mongodb').ObjectId)(payload.sub) },
      { projection: { 
        leadsFoundThisMonth: 1, 
        emailsSentThisMonth: 1, 
        emailsSentToday: 1,
        usageResetDate: 1,
        lastEmailResetDate: 1,
        subscription: 1,
        isBlocked: 1
      }}
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get plan from subscription
    const plan = user.subscription?.plan || 'free-trial';
    const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS['free-trial'];

    // Check if monthly usage should be reset
    const now = new Date();
    const resetDate = user.usageResetDate ? new Date(user.usageResetDate) : now;
    
    // Check if daily email count should be reset
    const lastEmailReset = user.lastEmailResetDate ? new Date(user.lastEmailResetDate) : null;
    const isNewDay = lastEmailReset && now.getDate() !== lastEmailReset.getDate();
    
    if (now >= resetDate) {
      await users.updateOne(
        { _id: new (require('mongodb').ObjectId)(payload.sub) },
        { 
          $set: { 
            leadsFoundThisMonth: 0, 
            emailsSentThisMonth: 0,
            usageResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          } 
        }
      );
    }

    // Reset daily email count if it's a new day
    if (isNewDay || !user.emailsSentToday) {
      await users.updateOne(
        { _id: new (require('mongodb').ObjectId)(payload.sub) },
        { 
          $set: { 
            emailsSentToday: 0,
            lastEmailResetDate: new Date()
          } 
        }
      );
      user.emailsSentToday = 0;
    }
    
    return NextResponse.json({
      plan,
      isBlocked: user.isBlocked || false,
      leads: { used: user.leadsFoundThisMonth || 0, limit: limits.leads },
      emails: { used: user.emailsSentThisMonth || 0, limit: limits.emails },
      dailyEmails: { used: user.emailsSentToday || 0, limit: limits.dailyEmails },
      templates: { limit: limits.templates },
      resetDate: user.usageResetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

  } catch (err: any) {
    console.error('Get usage error:', err.message);
    return NextResponse.json({ error: 'Failed to get usage', details: err.message }, { status: 500 });
  }
}
