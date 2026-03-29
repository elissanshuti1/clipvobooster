import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";
import cookie from "cookie";

const MONGODB_URI = process.env.MONGODB_URI || "";
const JWT_SECRET = process.env.JWT_SECRET || "";

// Get price ID based on plan
function getPriceId(plan: string): string {
  switch (plan) {
    case "starter":
      return process.env.PADDLE_PRICE_ID_STARTER || "";
    case "professional":
      return process.env.PADDLE_PRICE_ID_PROFESSIONAL || "";
    case "business":
      return process.env.PADDLE_PRICE_ID_BUSINESS || "";
    default:
      return process.env.PADDLE_PRICE_ID_STARTER || "";
  }
}

// Get product ID based on plan
function getProductId(plan: string): string {
  switch (plan) {
    case "starter":
      return process.env.PADDLE_PRODUCT_ID_STARTER || "";
    case "professional":
      return process.env.PADDLE_PRODUCT_ID_PROFESSIONAL || "";
    case "business":
      return process.env.PADDLE_PRODUCT_ID_BUSINESS || "";
    default:
      return process.env.PADDLE_PRODUCT_ID_STARTER || "";
  }
}

// Get plan details
function getPlanDetails(plan: string): {
  name: string;
  price: number;
  interval: string;
} {
  switch (plan) {
    case "starter":
      return { name: "Starter", price: 15, interval: "month" };
    case "professional":
      return { name: "Professional", price: 29, interval: "month" };
    case "business":
      return { name: "Business", price: 49, interval: "month" };
    default:
      return { name: "Starter", price: 15, interval: "month" };
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Paddle Create Checkout - Starting...");
    console.log("📋 Env vars check:");
    console.log(
      "  - PADDLE_PRICE_ID_STARTER:",
      process.env.PADDLE_PRICE_ID_STARTER || "❌ NOT SET",
    );
    console.log(
      "  - PADDLE_PRICE_ID_PROFESSIONAL:",
      process.env.PADDLE_PRICE_ID_PROFESSIONAL || "❌ NOT SET",
    );
    console.log(
      "  - PADDLE_PRICE_ID_BUSINESS:",
      process.env.PADDLE_PRICE_ID_BUSINESS || "❌ NOT SET",
    );

    const cookies = cookie.parse(request.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { email: string; sub: string };
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid token. Please log in again." },
        { status: 401 },
      );
    }

    const { plan } = await request.json();
    console.log("📦 Plan requested:", plan);

    if (!plan || !["starter", "professional", "business"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 },
      );
    }

    const priceId = getPriceId(plan);
    const productId = getProductId(plan);
    const planDetails = getPlanDetails(plan);

    console.log("🏷️  Price ID for", plan, ":", priceId);
    console.log("🏷️  Product ID for", plan, ":", productId);

    if (!priceId) {
      console.error("❌ Price ID is empty for plan:", plan);
      return NextResponse.json(
        { error: "Product/Price ID not configured for this plan" },
        { status: 500 },
      );
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    const users = db.collection("users");
    const checkouts = db.collection("checkouts");

    const user = await users.findOne({ email: decoded.email });

    if (!user) {
      await client.close();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.subscription && user.subscription.status === "active") {
      await client.close();
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 },
      );
    }

    const checkoutId = `chk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const checkoutData = {
      checkoutId,
      userId: user._id,
      email: user.email,
      plan,
      planDetails,
      priceId,
      productId,
      status: "pending",
      createdAt: new Date(),
    };

    await checkouts.insertOne(checkoutData);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const checkoutUrl = `${baseUrl}/payment/paddle/checkout?checkoutId=${checkoutId}&priceId=${priceId}&plan=${plan}&email=${encodeURIComponent(user.email)}`;

    await client.close();

    return NextResponse.json({
      checkoutUrl,
      checkoutId,
      priceId,
      plan,
      planDetails,
    });
  } catch (error) {
    console.error("Paddle checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
