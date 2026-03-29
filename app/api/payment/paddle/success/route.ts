import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const subscriptionId = searchParams.get('subscription_id');
  const customerId = searchParams.get('customer_id');
  const checkoutId = searchParams.get('checkout_id');

  // Redirect to pricing page with error if payment failed
  if (status !== 'success' || !subscriptionId) {
    return NextResponse.redirect(
      new URL('/pricing?payment=failed', request.url)
    );
  }

  try {
    // Connect to MongoDB
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    const users = db.collection('users');
    const checkouts = db.collection('checkouts');

    // Find checkout record
    let checkout;
    if (checkoutId) {
      checkout = await checkouts.findOne({ checkoutId });
    }

    if (!checkout) {
      await client.close();
      return NextResponse.redirect(
        new URL('/pricing?payment=failed', request.url)
      );
    }

    // Find user by email from checkout
    const user = await users.findOne({ email: checkout.email });

    if (!user) {
      await client.close();
      return NextResponse.redirect(
        new URL('/pricing?payment=failed', request.url)
      );
    }

    // Update checkout status
    await checkouts.updateOne(
      { checkoutId },
      {
        $set: {
          status: 'completed',
          subscriptionId,
          customerId,
          completedAt: new Date(),
        },
      }
    );

    // Update user's subscription
    await users.updateOne(
      { email: checkout.email },
      {
        $set: {
          subscription: {
            plan: checkout.plan,
            planName: checkout.planDetails?.name || 'Subscription',
            price: checkout.planDetails?.price || 0,
            interval: checkout.planDetails?.interval || 'month',
            status: 'active',
            subscriptionId,
            customerId,
            checkoutId,
            startDate: new Date(),
          },
        },
      }
    );

    await client.close();

    // Redirect to success page with subscription info
    const successUrl = new URL('/payment/success', request.url);
    successUrl.searchParams.set('subscription_id', subscriptionId);
    successUrl.searchParams.set('plan', checkout.plan);
    successUrl.searchParams.set('planName', checkout.planDetails?.name || 'Subscription');

    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error('Paddle success callback error:', error);
    return NextResponse.redirect(
      new URL('/pricing?payment=failed', request.url)
    );
  }
}
