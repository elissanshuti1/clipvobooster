import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET - Handle Dodo payment callback after redirect
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const checkoutId = searchParams.get('client_reference_id');
    const status = searchParams.get('status');

    if (!checkoutId) {
      return NextResponse.redirect(new URL('/pricing?error=invalid_checkout', process.env.NEXT_PUBLIC_PROD_URL));
    }

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const checkouts = db.collection('checkouts');
    const users = db.collection('users');

    // Find the checkout session
    const checkout = await checkouts.findOne({ checkoutId });

    if (!checkout) {
      return NextResponse.redirect(new URL('/pricing?error=checkout_not_found', process.env.NEXT_PUBLIC_PROD_URL));
    }

    // Check if checkout has expired
    if (checkout.expiresAt && new Date(checkout.expiresAt) < new Date()) {
      await checkouts.updateOne({ checkoutId }, { $set: { status: 'expired' } });
      return NextResponse.redirect(new URL('/pricing?error=checkout_expired', process.env.NEXT_PUBLIC_PROD_URL));
    }

    // Dodo redirects with status=success or status=failure
    if (status === 'success') {
      // Update checkout status
      await checkouts.updateOne(
        { checkoutId },
        { $set: { status: 'completed', completedAt: new Date() } }
      );

      // Update user's subscription
      await users.updateOne(
        { _id: new (require('mongodb').ObjectId)(checkout.userId) },
        { 
          $set: { 
            subscription: {
              plan: checkout.plan,
              planName: checkout.planDetails.name,
              price: checkout.planDetails.price,
              interval: checkout.planDetails.interval,
              status: 'active',
              startDate: new Date(),
              checkoutId: checkoutId
            },
            updatedAt: new Date()
          } 
        }
      );

      // Redirect to success page with token
      const successUrl = `/payment/success?checkout_id=${checkoutId}&plan=${checkout.plan}`;
      return NextResponse.redirect(new URL(successUrl, process.env.NEXT_PUBLIC_PROD_URL));
    } else {
      // Payment failed or was cancelled
      await checkouts.updateOne({ checkoutId }, { $set: { status: 'failed' } });
      return NextResponse.redirect(new URL('/pricing?error=payment_failed', process.env.NEXT_PUBLIC_PROD_URL));
    }
  } catch (err: any) {
    console.error('Dodo callback error:', err);
    return NextResponse.redirect(new URL('/pricing?error=server_error', process.env.NEXT_PUBLIC_PROD_URL));
  }
}
