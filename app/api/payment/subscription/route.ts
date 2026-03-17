import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';

// GET - Get current user's subscription status
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
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const users = db.collection('users');

    const user = await users.findOne(
      { _id: new (require('mongodb').ObjectId)(payload.sub) },
      { projection: { subscription: 1, email: 1 } }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      hasSubscription: !!user.subscription,
      subscription: user.subscription || null,
      email: user.email
    });
  } catch (err: any) {
    console.error('Get subscription error:', err);
    return NextResponse.json({ error: 'Failed to get subscription', details: err.message }, { status: 500 });
  }
}
