import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';

// Plan limits
const PLAN_LIMITS = {
  free: { leads: 0, emails: 0 },
  starter: { leads: 100, emails: 300 },
  professional: { leads: 500, emails: 1000 },
  business: { leads: 2000, emails: 5000 },
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
        usageResetDate: 1,
        subscription: 1 
      }}
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get plan from subscription
    const plan = user.subscription?.plan || 'free';
    const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;

    // Check if usage should be reset (30 days have passed)
    const now = new Date();
    const resetDate = user.usageResetDate ? new Date(user.usageResetDate) : now;
    
    if (now >= resetDate) {
      // Reset usage
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
      
      return NextResponse.json({
        plan,
        leads: { used: 0, limit: limits.leads },
        emails: { used: 0, limit: limits.emails },
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }

    return NextResponse.json({
      plan,
      leads: { used: user.leadsFoundThisMonth || 0, limit: limits.leads },
      emails: { used: user.emailsSentThisMonth || 0, limit: limits.emails },
      resetDate: user.usageResetDate,
    });

  } catch (err: any) {
    console.error('Get usage error:', err.message);
    return NextResponse.json({ error: 'Failed to get usage', details: err.message }, { status: 500 });
  }
}
