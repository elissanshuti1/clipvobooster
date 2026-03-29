"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

declare global {
  interface Window {
    Paddle?: any;
  }
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const checkoutId = searchParams.get("checkoutId");
  const priceId = searchParams.get("priceId");
  const plan = searchParams.get("plan");
  const customerEmail = searchParams.get("email");

  const clientToken = "test_14360885662003008ab180a517a";

  useEffect(() => {
    console.log("🔍 Checkout params:", {
      checkoutId,
      priceId,
      plan,
      customerEmail,
    });

    if (!checkoutId || !priceId || !plan) {
      setError("Invalid checkout parameters");
      return;
    }

    // Load Paddle script dynamically
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => {
      console.log("✅ Paddle script loaded");
      setIsLoaded(true);
    };
    script.onerror = () => {
      console.error("❌ Paddle script failed to load");
      setError("Failed to load payment system. Please refresh.");
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !window.Paddle) return;

    console.log("🚀 Initializing Paddle...");

    window.Paddle.Environment.set("sandbox");

    window.Paddle.Initialize({
      token: clientToken,
      eventCallback: (data: any) => {
        console.log("📡 Paddle event:", data.name);
        console.log("📦 Event data:", JSON.stringify(data.data, null, 2));

        if (data.name === "checkout.completed") {
          console.log("✅ Payment completed!");
          const subscriptionId = data.data?.subscription_id || data.data?.id;
          const customerId = data.data?.customer_id || data.data?.customer?.id;

          console.log("📋 Subscription ID:", subscriptionId);
          console.log("📋 Customer ID:", customerId);

          if (!subscriptionId) {
            setError(
              "Payment completed but no subscription ID. Contact support with checkout ID: " +
                checkoutId,
            );
            return;
          }

          const redirectUrl = `/api/payment/paddle/success?status=success&subscription_id=${subscriptionId}&customer_id=${customerId || ""}&checkout_id=${checkoutId}`;
          console.log("🔗 Redirecting to:", redirectUrl);
          window.location.href = redirectUrl;
        }

        if (data.name === "checkout.closed") {
          router.push("/plans?payment=cancelled");
        }

        if (data.error) {
          setError("Payment error: " + (data.error.message || "Unknown error"));
        }
      },
    });

    // Open checkout
    setTimeout(() => {
      console.log("⏳ Opening checkout...");
      window.Paddle.Checkout.open({
        settings: {
          displayMode: "overlay",
          theme: "dark",
          allowLogout: false,
          locale: "en",
          successUrl: `${window.location.origin}/api/payment/paddle/success?status=success&checkout_id=${checkoutId}`,
        },
        items: [
          {
            price_id: priceId,
            quantity: 1,
          },
        ],
        ...(customerEmail ? { customer: { email: customerEmail } } : {}),
      });
      console.log("✅ Checkout opened");
    }, 300);
  }, [isLoaded, priceId, checkoutId, customerEmail, router]);

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#08090d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "24px",
          padding: "24px",
        }}
      >
        <h1 style={{ color: "#f87171", fontSize: "24px" }}>Error</h1>
        <p style={{ color: "#8b95a5", maxWidth: "400px", textAlign: "center" }}>
          {error}
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
          <button
            onClick={() => router.push("/plans")}
            style={{
              padding: "12px 24px",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#08090d",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center", color: "#dde1e9" }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid rgba(255,255,255,0.1)",
            borderTop: "3px solid #6366f1",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 24px",
          }}
        />
        <p style={{ color: "#8b95a5", fontSize: "16px" }}>
          Opening secure checkout...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

export default function PaddleCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#08090d",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid rgba(255,255,255,0.1)",
              borderTop: "3px solid #6366f1",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
