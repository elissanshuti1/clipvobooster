import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// POST - Handle Dodo webhook notifications
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('🔔 Dodo webhook received:', body.type);
    console.log('📦 Webhook data:', JSON.stringify(body, null, 2));
    
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const checkouts = db.collection('checkouts');
    const users = db.collection('users');

    // Handle payment and subscription events
    switch (body.type) {
      case 'payment.succeeded':
      case 'subscription.active':
      case 'subscription.updated':
      case 'subscription.renewed': {
        console.log('💳 Processing payment/subscription event...');
        
        const { data } = body;
        const subscriptionId = data.id || data.subscription_id;
        const email = data.customer?.email || data.email;
        const status = data.status || 'active';
        
        console.log('Subscription ID:', subscriptionId);
        console.log('Email:', email);
        console.log('Status:', status);
        
        if (!email) {
          console.log('❌ No email in webhook data');
          return NextResponse.json({ received: true, error: 'No email' });
        }
        
        // Find user by email
        const user = await users.findOne({ email });
        if (!user) {
          console.log('❌ User not found for email:', email);
          return NextResponse.json({ received: true, error: 'User not found' });
        }
        
        console.log('✅ User found:', user._id);
        
        // Find recent checkout for this user
        const checkout = await checkouts.findOne(
          { userId: String(user._id), status: { $in: ['pending', 'completed'] } },
          { sort: { createdAt: -1 } }
        );
        
        if (!checkout) {
          console.log('⚠️ No checkout found, creating subscription from webhook data');
          // Create subscription directly from webhook
          await users.updateOne(
            { _id: user._id },
            {
              $set: {
                subscription: {
                  plan: 'lifetime', // Default to lifetime if no checkout
                  planName: 'Lifetime',
                  price: 60,
                  interval: 'one-time',
                  status: 'active',
                  startDate: new Date(),
                  subscriptionId: subscriptionId,
                  verifiedByWebhook: true
                },
                updatedAt: new Date()
              }
            }
          );
          console.log('✅ Subscription created from webhook for user:', user._id);
        } else {
          console.log('✅ Checkout found:', checkout.checkoutId);
          
          // Update checkout status
          await checkouts.updateOne(
            { _id: checkout._id },
            {
              $set: {
                status: 'completed',
                completedAt: new Date(),
                subscriptionId: subscriptionId,
                webhookData: body
              }
            }
          );
          
          // Update user's subscription
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
                  verifiedByWebhook: true
                },
                updatedAt: new Date()
              }
            }
          );
          
          console.log('✅ Subscription activated for user:', user._id, 'Plan:', checkout.plan);
        }
        
        return NextResponse.json({ received: true, success: true });
      }

      case 'checkout.completed': {
        const { data } = body;
        const checkoutId = data.client_reference_id;

        if (checkoutId) {
          const checkout = await checkouts.findOne({ checkoutId });

          if (checkout && checkout.status !== 'completed') {
            await checkouts.updateOne(
              { checkoutId },
              { $set: { status: 'completed', completedAt: new Date(), webhookData: body } }
            );

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
                    checkoutId: checkoutId,
                    verifiedByWebhook: true
                  },
                  updatedAt: new Date()
                }
              }
            );

            console.log(`✅ Subscription activated for user ${checkout.userId}, plan: ${checkout.plan}`);
          }
        }
        return NextResponse.json({ received: true });
      }

      case 'checkout.failed': {
        const { data } = body;
        const checkoutId = data.client_reference_id;

        if (checkoutId) {
          await checkouts.updateOne(
            { checkoutId },
            { $set: { status: 'failed', failedAt: new Date(), webhookData: body } }
          );
          console.log(`❌ Checkout failed: ${checkoutId}`);
        }
        return NextResponse.json({ received: true });
      }

      case 'checkout.expired': {
        const { data } = body;
        const checkoutId = data.client_reference_id;

        if (checkoutId) {
          await checkouts.updateOne(
            { checkoutId },
            { $set: { status: 'expired', expiredAt: new Date(), webhookData: body } }
          );
          console.log(`⏰ Checkout expired: ${checkoutId}`);
        }
        return NextResponse.json({ received: true });
      }

      default:
        console.log('ℹ️ Unhandled webhook event type:', body.type);
        return NextResponse.json({ received: true, note: 'Event type not handled' });
    }
  } catch (err: any) {
    console.error('❌ Webhook error:', err);
    console.error('Stack:', err.stack);
    return NextResponse.json({ error: 'Webhook processing failed', details: err.message }, { status: 500 });
  }
}
// rebuild trigger
