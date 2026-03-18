import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// POST - Handle Dodo webhook notifications
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('🔔 Dodo webhook received:', body.type);
    
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const users = db.collection('users');

    // Handle all payment/subscription events
    if (body.type === 'payment.succeeded' || 
        body.type === 'subscription.active' || 
        body.type === 'subscription.updated' ||
        body.type === 'subscription.renewed') {
      
      const email = body.data?.customer?.email || body.data?.email;
      const subscriptionId = body.data?.id || body.data?.subscription_id;
      
      console.log('Processing:', { email, subscriptionId });
      
      if (!email) {
        return NextResponse.json({ received: true, error: 'No email' });
      }
      
      const user = await users.findOne({ email });
      if (!user) {
        return NextResponse.json({ received: true, error: 'User not found' });
      }
      
      // Find checkout or create subscription directly
      const checkout = await db.collection('checkouts').findOne(
        { userId: String(user._id) },
        { sort: { createdAt: -1 } }
      );
      
      await users.updateOne(
        { _id: user._id },
        {
          $set: {
            subscription: checkout ? {
              plan: checkout.plan,
              planName: checkout.planDetails.name,
              price: checkout.planDetails.price,
              interval: checkout.planDetails.interval,
              status: 'active',
              startDate: new Date(),
              checkoutId: checkout.checkoutId,
              subscriptionId: subscriptionId
            } : {
              plan: 'lifetime',
              planName: 'Lifetime',
              price: 60,
              interval: 'one-time',
              status: 'active',
              startDate: new Date(),
              subscriptionId: subscriptionId
            },
            updatedAt: new Date()
          }
        }
      );
      
      console.log('✅ Subscription activated for:', email);
      return NextResponse.json({ received: true, success: true });
    }
    
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'webhook is working' });
}
// rebuild trigger
