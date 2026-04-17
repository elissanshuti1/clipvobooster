import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";

/**
 * Paddle Webhook Handler
 *
 * Handles:
 * - subscription.created: New subscription/trial started
 * - subscription.updated: Trial converted to paid, plan changes
 * - subscription.canceled: User cancelled
 * - subscription.past_due: Payment failed (card declined)
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("📡 Paddle Webhook received:", body.event_type || "unknown event");

    const eventType = body.event_type || "";

    if (!eventType) {
      return NextResponse.json({ received: true });
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    const users = db.collection("users");

    // ── subscription.created ──
    if (eventType === "subscription.created") {
      const subscription = body.data;
      const subscriptionId = subscription?.id;
      const status = subscription?.status;
      const planId = subscription?.items?.data?.[0]?.price?.id;
      
      console.log("🆕 Subscription created:", { subscriptionId, status, planId });

      if (subscriptionId) {
        // Find user by email in subscription
        const customData = subscription?.custom_data;
        const userEmail = customData?.email || subscription?.customer?.email;
        
        if (userEmail) {
          const user = await users.findOne({ email: userEmail });
          
          if (user) {
            // Determine plan based on price ID (you'll need to configure these in Paddle)
            let plan = "free-trial";
            let planName = "Free Trial";
            
            // Map price IDs to plans - you need to configure these in Paddle dashboard
            // For now, if it's a trial, keep as free-trial
            if (status === "trialing") {
              plan = "free-trial";
              planName = "Free Trial";
            } else if (status === "active") {
              plan = "starter";
              planName = "Starter";
            }

            await users.updateOne(
              { email: userEmail },
              { 
                $set: {
                  subscription: {
                    plan,
                    planName,
                    status,
                    subscriptionId,
                    checkoutId: subscription?.id,
                    customerId: subscription?.customer?.id,
                    startDate: new Date(),
                    trialEndsAt: subscription?.current_billing_period?.ends_at || null,
                    trialConvertedAt: null,
                  },
                  isBlocked: false,
                  trialUsed: plan === "free-trial" ? false : true,
                }
              }
            );
            
            console.log("✅ Subscription created for:", userEmail, "Plan:", plan);
          }
        }
      }
    }

    // ── subscription.updated ──
    if (eventType === "subscription.updated") {
      const subscription = body.data;
      const subscriptionId = subscription?.id;
      const status = subscription?.status;

      console.log("🔄 Subscription updated:", { subscriptionId, status });

      if (!subscriptionId) {
        await client.close();
        return NextResponse.json({ received: true });
      }

      const user = await users.findOne({
        "subscription.subscriptionId": subscriptionId,
      });

      if (!user) {
        console.log("👤 User not found for subscription:", subscriptionId);
        await client.close();
        return NextResponse.json({ received: true });
      }

      console.log("👤 Found user:", user.email);
      console.log("📋 Current plan:", user.subscription?.plan);

      // Trial converted to active (payment succeeded)
      if (user.subscription?.plan === "free-trial" && status === "active") {
        console.log("🎉 Trial payment succeeded! Converting free-trial → starter");

        await users.updateOne(
          { email: user.email },
          {
            $set: {
              "subscription.plan": "starter",
              "subscription.planName": "Starter",
              "subscription.status": "active",
              "subscription.trialConvertedAt": new Date(),
              isBlocked: false,
              trialUsed: true,
            },
          },
        );

        console.log("✅ User converted to Starter:", user.email);
      }

      // Payment failed (past_due)
      if (status === "past_due") {
        console.log("⚠️ Payment failed:", user.email);

        await users.updateOne(
          { email: user.email },
          {
            $set: {
              isBlocked: true,
              "subscription.status": "past_due",
              blockedReason: "Payment failed - card declined or insufficient funds",
              blockedAt: new Date(),
            },
          },
        );

        console.log("🚫 User blocked due to payment failure:", user.email);
      }

      // Subscription canceled or deleted
      if (status === "canceled" || status === "deleted") {
        console.log("❌ Subscription canceled/deleted:", user.email);

        await users.updateOne(
          { email: user.email },
          {
            $set: {
              subscription: null,
              isBlocked: true,
              blockedReason: "Subscription canceled",
              blockedAt: new Date(),
            },
          },
        );

        console.log("🚫 User blocked and subscription removed:", user.email);
      }
    }

    // ── subscription.canceled ──
    if (eventType === "subscription.canceled") {
      const subscription = body.data;
      const subscriptionId = subscription?.id;

      console.log("❌ Subscription canceled:", subscriptionId);

      if (subscriptionId) {
        const user = await users.findOne({
          "subscription.subscriptionId": subscriptionId,
        });

        if (user) {
          await users.updateOne(
            { email: user.email },
            { 
              $set: { 
                subscription: null,
                isBlocked: true,
                blockedReason: "Subscription canceled",
                blockedAt: new Date(),
              }
            },
          );
          console.log("🚫 Subscription removed for:", user.email);
        }
      }
    }

    await client.close();
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Paddle webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Paddle webhook endpoint is active" });
}
