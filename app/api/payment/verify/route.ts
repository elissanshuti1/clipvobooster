import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';

// POST - Verify payment after redirect from Dodo
export async function POST(req: Request) {
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

    const body = await req.json();
    const { checkoutId, plan } = body;

    if (!checkoutId || !plan) {
      return NextResponse.json({ error: 'Missing checkout information' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const checkouts = db.collection('checkouts');
    const users = db.collection('users');

    // Find the checkout session
    const checkout = await checkouts.findOne({ checkoutId });

    if (!checkout) {
      return NextResponse.json({ error: 'Checkout not found', verified: false }, { status: 404 });
    }

    // Verify checkout belongs to current user
    if (checkout.userId !== String(payload.sub)) {
      return NextResponse.json({ error: 'Unauthorized', verified: false }, { status: 403 });
    }

    // Check checkout status
    if (checkout.status !== 'completed') {
      return NextResponse.json({ 
        error: 'Payment not completed', 
        verified: false,
        status: checkout.status
      }, { status: 400 });
    }

    // Verify plan matches
    if (checkout.plan !== plan) {
      return NextResponse.json({ error: 'Plan mismatch', verified: false }, { status: 400 });
    }

    // Get user's current subscription
    const user = await users.findOne(
      { _id: new (require('mongodb').ObjectId)(payload.sub) },
      { projection: { subscription: 1 } }
    );

    if (!user || !user.subscription) {
      return NextResponse.json({ error: 'Subscription not found', verified: false }, { status: 404 });
    }

    return NextResponse.json({
      verified: true,
      subscription: user.subscription,
      message: 'Payment verified successfully'
    });
  } catch (err: any) {
    console.error('Verify payment error:', err);
    return NextResponse.json({ error: 'Verification failed', details: err.message, verified: false }, { status: 500 });
  }
}
