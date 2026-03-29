import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const subscriptionId = searchParams.get("subscription_id");
  const customerId = searchParams.get("customer_id");
  const checkoutId = searchParams.get("checkout_id");

  console.log("🎉 Payment Success Callback:", {
    status,
    subscriptionId: subscriptionId || "MISSING",
    customerId: customerId || "MISSING",
    checkoutId: checkoutId || "MISSING",
  });

  // Check if we have valid subscription_id (not "undefined" string)
  if (
    status !== "success" ||
    !subscriptionId ||
    subscriptionId === "undefined"
  ) {
    console.log("❌ Payment failed - invalid status or no subscription ID");
    return NextResponse.redirect(new URL("/plans?payment=failed", request.url));
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    const users = db.collection("users");
    const checkouts = db.collection("checkouts");

    // Find checkout record
    let checkout = null;
    if (checkoutId) {
      checkout = await checkouts.findOne({ checkoutId });
      console.log("📋 Checkout found:", checkout ? "YES" : "NO");
      if (checkout) {
        console.log("  - Plan:", checkout.plan);
        console.log("  - Email:", checkout.email);
      }
    }

    // If no checkoutId, try to find by subscription_id
    if (!checkout && subscriptionId) {
      checkout = await checkouts.findOne({ subscriptionId });
      console.log(
        "📋 Checkout found by subscriptionId:",
        checkout ? "YES" : "NO",
      );
    }

    if (!checkout) {
      await client.close();
      console.log("❌ Checkout not found");
      return NextResponse.redirect(
        new URL("/plans?payment=failed", request.url),
      );
    }

    // Find user by email from checkout
    const user = await users.findOne({ email: checkout.email });
    console.log("👤 User found:", user ? "YES" : "NO");

    if (!user) {
      await client.close();
      console.log("❌ User not found for email:", checkout.email);
      return NextResponse.redirect(
        new URL("/plans?payment=failed", request.url),
      );
    }

    // Update checkout status
    const updateResult = await checkouts.updateOne(
      { checkoutId },
      {
        $set: {
          status: "completed",
          subscriptionId: subscriptionId || "unknown",
          customerId: customerId || "unknown",
          completedAt: new Date(),
        },
      },
    );
    console.log("✅ Checkout updated:", updateResult.modifiedCount, "document");

    // Get plan details
    const planName =
      checkout.planDetails?.name || checkout.plan || "Subscription";
    const planPrice = checkout.planDetails?.price || 0;
    const planInterval = checkout.planDetails?.interval || "month";

    // Update user's subscription
    const userUpdateResult = await users.updateOne(
      { email: checkout.email },
      {
        $set: {
          subscription: {
            plan: checkout.plan,
            planName: planName,
            price: planPrice,
            interval: planInterval,
            status: "active",
            subscriptionId: subscriptionId || "unknown",
            customerId: customerId || "unknown",
            checkoutId: checkoutId || "unknown",
            startDate: new Date(),
          },
        },
      },
    );
    console.log(
      "✅ User subscription updated:",
      userUpdateResult.modifiedCount,
      "document",
    );

    await client.close();

    // Redirect directly to dashboard with cookie update
    const dashboardUrl = new URL("/dashboard/overview", request.url);

    const response = NextResponse.redirect(dashboardUrl);

    // Update the has_subscription cookie to true
    const maxAge = 30 * 24 * 60 * 60; // 30 days
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

    response.cookies.set("has_subscription", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: maxAge,
      sameSite: "lax",
    });

    console.log("✅ Cookie updated: has_subscription=true");
    console.log("✅ Redirecting directly to dashboard");

    return response;
  } catch (error) {
    console.error("❌ Paddle success callback error:", error);
    return NextResponse.redirect(new URL("/plans?payment=failed", request.url));
  }
}
