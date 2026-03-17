import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';

// POST - Create Dodo payment checkout session
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
    const { plan } = body;

    if (!plan || !['starter', 'professional', 'lifetime'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const users = db.collection('users');

    const user = await users.findOne({ _id: new (require('mongodb').ObjectId)(payload.sub) });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get Dodo configuration
    const isTestMode = process.env.DODO_MODE !== 'live';
    const baseUrl = isTestMode ? 'https://test.checkout.dodopayments.com' : 'https://checkout.dodopayments.com';
    
    // Get product ID based on plan and mode
    let productId: string;
    let planDetails: { name: string; price: number; interval: string };

    if (plan === 'starter') {
      productId = isTestMode 
        ? process.env.DODO_STARTER_PRODUCT_ID_TEST! 
        : process.env.DODO_STARTER_PRODUCT_ID_LIVE!;
      planDetails = { name: 'Starter', price: 15, interval: 'month' };
    } else if (plan === 'professional') {
      productId = isTestMode 
        ? process.env.DODO_PROFESSIONAL_PRODUCT_ID_TEST! 
        : process.env.DODO_PROFESSIONAL_PRODUCT_ID_LIVE!;
      planDetails = { name: 'Professional', price: 29, interval: 'month' };
    } else {
      productId = isTestMode 
        ? process.env.DODO_LIFETIME_PRODUCT_ID_TEST! 
        : process.env.DODO_LIFETIME_PRODUCT_ID_LIVE!;
      planDetails = { name: 'Lifetime', price: 60, interval: 'one-time' };
    }

    if (!productId) {
      return NextResponse.json({ error: 'Product not configured' }, { status: 500 });
    }

    // Generate unique checkout ID for tracking
    const checkoutId = `chk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Store checkout session in database
    const checkouts = db.collection('checkouts');
    await checkouts.insertOne({
      checkoutId,
      userId: String(payload.sub),
      userEmail: user.email,
      plan,
      planDetails,
      productId,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    });

    // Build redirect URL with quantity and redirect parameters
    const redirectUrl = process.env.DODO_REDIRECT_URL_SUCCESS || `${process.env.NEXT_PUBLIC_PROD_URL}/payment/success`;
    const checkoutUrl = `${baseUrl}/buy/${productId}?quantity=1&redirect_url=${encodeURIComponent(redirectUrl)}&client_reference_id=${checkoutId}`;

    return NextResponse.json({
      checkoutId,
      checkoutUrl,
      plan: planDetails,
      message: 'Checkout session created'
    });
  } catch (err: any) {
    console.error('Create checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session', details: err.message }, { status: 500 });
  }
}
