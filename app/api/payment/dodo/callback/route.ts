import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET - Handle Dodo payment callback after redirect
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Dodo may pass different parameters - handle both formats
    let checkoutId = searchParams.get('client_reference_id') || searchParams.get('checkout_id');
    const status = searchParams.get('status');
    const subscriptionId = searchParams.get('subscription_id');
    const email = searchParams.get('email');

    console.log('Dodo callback received:', { checkoutId, status, subscriptionId, email });

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const users = db.collection('users');
    const checkouts = db.collection('checkouts');

    // If we have subscription_id and status=active, payment was successful
    if (subscriptionId && status === 'active') {
      console.log('Payment confirmed by Dodo - subscription_id:', subscriptionId);

      // Find user by email from Dodo callback
      if (email) {
        const user = await users.findOne({ email });
        if (user) {
          // Find recent checkout for this user to get plan details
          const checkout = await checkouts.findOne(
            { userId: String(user._id), status: { $in: ['pending', 'completed'] } },
            { sort: { createdAt: -1 } }
          );

          if (checkout) {
            // Update checkout status
            await checkouts.updateOne(
              { _id: checkout._id },
              { 
                $set: { 
                  status: 'completed', 
                  completedAt: new Date(),
                  subscriptionId: subscriptionId,
                  dodoEmail: email
                } 
              }
            );

            // Update user's subscription - THIS IS THE KEY FIX
            await users.updateOne(
              { _id: user._id },
              {
                $set: {
                  subscription: {
                    plan: checkout.plan,
                    planName: checkout.planDetails.name,
                    price: checkout.planDetails.price,
                    interval: checkout.planDetails.interval,
                    status: 'active',
                    startDate: new Date(),
                    checkoutId: checkout.checkoutId,
                    subscriptionId: subscriptionId,
                    verifiedByWebhook: false
                  },
                  updatedAt: new Date()
                }
              }
            );

            console.log(`Subscription activated for user ${user._id}, plan: ${checkout.plan}`);
            console.log('Subscription data saved:', {
              plan: checkout.plan,
              planName: checkout.planDetails.name,
              status: 'active',
              checkoutId: checkout.checkoutId
            });

            // Redirect to success page - use localhost in development
            const baseUrl = process.env.NODE_ENV === 'production' 
              ? process.env.NEXT_PUBLIC_PROD_URL 
              : 'http://localhost:3000';
            const redirectUrl = `${baseUrl}/payment/success?checkout_id=${checkout.checkoutId}&plan=${checkout.plan}&status=success`;
            console.log('Redirecting to:', redirectUrl);
            return NextResponse.redirect(new URL(redirectUrl));
          } else {
            // No checkout found, but we have a valid subscription from Dodo
            // Create a default subscription based on what Dodo sent
            await users.updateOne(
              { _id: user._id },
              {
                $set: {
                  subscription: {
                    plan: 'lifetime',
                    planName: 'Lifetime',
                    price: 60,
                    interval: 'one-time',
                    status: 'active',
                    startDate: new Date(),
                    subscriptionId: subscriptionId,
                    verifiedByDodoDirect: true
                  },
                  updatedAt: new Date()
                }
              }
            );

            console.log(`Subscription created from Dodo direct redirect for user ${user._id}`);
            return NextResponse.redirect(new URL('/payment/success?status=success', process.env.NEXT_PUBLIC_PROD_URL));
          }
        } else {
          console.error('User not found for email:', email);
          return NextResponse.redirect(new URL('/pricing?error=user_not_found', process.env.NEXT_PUBLIC_PROD_URL));
        }
      } else {
        console.error('No email provided by Dodo');
        return NextResponse.redirect(new URL('/pricing?error=no_email', process.env.NEXT_PUBLIC_PROD_URL));
      }
    }

    if (!checkoutId) {
      return NextResponse.redirect(new URL('/pricing?error=invalid_checkout', process.env.NEXT_PUBLIC_PROD_URL));
    }

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

      console.log(`Subscription activated via success status for user ${checkout.userId}`);

      // Redirect to success page
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
