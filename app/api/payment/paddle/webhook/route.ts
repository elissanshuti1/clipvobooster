import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";

/**
 * Paddle Webhook Handler
 *
 * This endpoint receives events from Paddle (configured in Paddle Dashboard > Notifications).
 *
 * Key events we handle:
 * - subscription.updated: When subscription changes (e.g., trial → active payment)
 * - subscription.canceled: When subscription is canceled
 *
 * For Free Trial:
 * When Paddle charges the card after the 3-day trial succeeds, it sends
 * subscription.updated. We detect this and change plan from "free-trial" to "starter".
 *
 * For All Plans:
 * When a subscription is canceled or past_due, we remove it so the user loses access.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log(
      "📡 Paddle Webhook received:",
      body.event_type || "unknown event",
    );
    console.log(
      "📦 Event data:",
      JSON.stringify(body.data, null, 2).substring(0, 500),
    );

    const eventType = body.event_type || "";

    if (!eventType) {
      console.log("⚠️ Webhook received but no event type found");
      return NextResponse.json({ received: true });
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    const users = db.collection("users");

    // ── subscription.updated ──
    if (eventType === "subscription.updated") {
      const subscription = body.data;
      const subscriptionId = subscription?.subscription_id || subscription?.id;
      const status = subscription?.status;

      console.log("🔄 Subscription updated:", {
        subscriptionId,
        status,
      });

      if (!subscriptionId) {
        await client.close();
        return NextResponse.json({ received: true });
      }

      // Find user by subscription ID
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

      // If user is on free-trial and subscription is now active (trial payment succeeded)
      if (user.subscription?.plan === "free-trial" && status === "active") {
        console.log(
          "🎉 Trial payment succeeded! Converting free-trial → starter",
        );

        await users.updateOne(
          { email: user.email },
          {
            $set: {
              "subscription.plan": "starter",
              "subscription.planName": "Starter",
              "subscription.trialConvertedAt": new Date(),
            },
          },
        );

        console.log("✅ User converted to Starter:", user.email);
      }

      // If subscription was canceled or past_due, remove access
      if (
        status === "canceled" ||
        status === "past_due" ||
        status === "deleted"
      ) {
        console.log("⚠️ Subscription canceled/past_due:", user.email);

        await users.updateOne(
          { email: user.email },
          {
            $set: {
              subscription: null,
            },
          },
        );

        console.log("✅ Subscription removed from user:", user.email);
      }
    }

    // ── subscription.canceled ──
    if (eventType === "subscription.canceled") {
      const subscription = body.data;
      const subscriptionId = subscription?.subscription_id || subscription?.id;

      console.log("❌ Subscription canceled:", subscriptionId);

      if (subscriptionId) {
        const user = await users.findOne({
          "subscription.subscriptionId": subscriptionId,
        });

        if (user) {
          await users.updateOne(
            { email: user.email },
            { $set: { subscription: null } },
          );
          console.log("✅ Subscription removed for:", user.email);
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

// Paddle may also send GET requests for verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Paddle webhook endpoint is active" });
}
