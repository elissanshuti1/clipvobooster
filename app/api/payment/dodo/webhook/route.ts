import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// POST - Handle Dodo webhook notifications
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const checkouts = db.collection('checkouts');
    const users = db.collection('users');

    console.log('Dodo webhook received:', body.type);

    switch (body.type) {
      case 'checkout.completed': {
        const { data } = body;
        const checkoutId = data.client_reference_id;

        if (checkoutId) {
          const checkout = await checkouts.findOne({ checkoutId });

          if (checkout && checkout.status !== 'completed') {
            // Update checkout status
            await checkouts.updateOne(
              { checkoutId },
              { $set: { status: 'completed', completedAt: new Date(), webhookData: body } }
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
                    checkoutId: checkoutId,
                    verifiedByWebhook: true
                  },
                  updatedAt: new Date()
                }
              }
            );

            console.log(`Subscription activated for user ${checkout.userId}, plan: ${checkout.plan}`);
          }
        }
        break;
      }

      case 'checkout.failed': {
        const { data } = body;
        const checkoutId = data.client_reference_id;

        if (checkoutId) {
          await checkouts.updateOne(
            { checkoutId },
            { $set: { status: 'failed', failedAt: new Date(), webhookData: body } }
          );
          console.log(`Checkout failed: ${checkoutId}`);
        }
        break;
      }

      case 'checkout.expired': {
        const { data } = body;
        const checkoutId = data.client_reference_id;

        if (checkoutId) {
          await checkouts.updateOne(
            { checkoutId },
            { $set: { status: 'expired', expiredAt: new Date(), webhookData: body } }
          );
          console.log(`Checkout expired: ${checkoutId}`);
        }
        break;
      }

      default:
        console.log('Unhandled webhook event type:', body.type);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
