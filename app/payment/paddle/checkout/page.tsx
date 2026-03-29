"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useCallback } from "react";
import Script from "next/script";

declare global {
  interface Window {
    Paddle?: any;
  }
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPaddleLoaded, setIsPaddleLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const checkoutId = searchParams.get("checkoutId");
  const productId = searchParams.get("productId");
  const plan = searchParams.get("plan");

  const clientToken = "test_14360885662003008ab180a517a";

  // Log parameters for debugging
  useEffect(() => {
    console.log("🔍 Checkout params:", { checkoutId, productId, plan });
  }, [checkoutId, productId, plan]);

  const initializePaddle = useCallback(() => {
    if (!window.Paddle || isInitializing) {
      console.log("⚠️ Paddle not ready or already initializing");
      return;
    }

    setIsInitializing(true);

    try {
      console.log("🚀 Initializing Paddle...");

      // Set sandbox environment
      window.Paddle.Environment.set("sandbox");

      // Initialize Paddle
      window.Paddle.Initialize({
        token: clientToken,
        eventCallback: (data: any) => {
          console.log("📡 Paddle event:", data);

          if (data.name === "checkout.completed") {
            console.log("✅ Checkout completed!");
            const subscriptionId = data.data.subscription_id;
            const customerId = data.data.customer_id;

            window.location.href = `/api/payment/paddle/success?status=success&subscription_id=${subscriptionId}&customer_id=${customerId}&checkout_id=${checkoutId}`;
          }

          if (data.name === "checkout.closed") {
            console.log("❌ Checkout closed");
            router.push("/plans?payment=cancelled");
          }

          if (data.name === "error") {
            console.error("❌ Paddle error:", data);
            setError("Payment error occurred. Please try again.");
          }
        },
      });

      console.log("✅ Paddle initialized, opening checkout...");

      // Open checkout after a short delay
      setTimeout(() => {
        try {
          console.log("🛒 Opening checkout with productId:", productId);

          window.Paddle.Checkout.open({
            items: [{ priceId: productId, quantity: 1 }],
            checkout: {
              settings: {
                displayMode: "overlay",
                theme: "dark",
                allowLogout: false,
                locale: "en",
                successUrl: `${window.location.origin}/api/payment/paddle/success?status=success&checkout_id=${checkoutId}`,
              },
            },
          });

          console.log("✅ Checkout opened successfully");
        } catch (openError) {
          console.error("❌ Failed to open checkout:", openError);
          setError("Failed to open checkout. Please try again.");
        }
      }, 500);
    } catch (initError) {
      console.error("❌ Failed to initialize Paddle:", initError);
      setError("Failed to initialize payment. Please refresh the page.");
    }
  }, [productId, checkoutId, router, isInitializing]);

  useEffect(() => {
    if (!checkoutId || !productId || !plan) {
      setError("Invalid checkout parameters");
      return;
    }

    // Initialize Paddle once it's loaded
    if (isPaddleLoaded && window.Paddle && !isInitializing) {
      initializePaddle();
    }
  }, [
    isPaddleLoaded,
    checkoutId,
    productId,
    plan,
    isInitializing,
    initializePaddle,
  ]);

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
        }}
      >
        <h1 style={{ color: "#f87171", fontSize: "24px" }}>Checkout Error</h1>
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
              fontSize: "15px",
              fontWeight: "600",
            }}
          >
            Try Again
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
              fontSize: "15px",
              fontWeight: "600",
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
      <div
        style={{
          textAlign: "center",
          color: "#dde1e9",
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
            margin: "0 auto 24px",
          }}
        />
        <p style={{ color: "#8b95a5", fontSize: "16px" }}>
          Opening secure checkout...
        </p>
        <p style={{ color: "#5a6373", fontSize: "13px", marginTop: "8px" }}>
          Please wait while we prepare your payment
        </p>
        <style>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default function PaddleCheckoutPage() {
  return (
    <>
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log("✅ Paddle script loaded");
        }}
        onError={() => {
          console.error("❌ Failed to load Paddle script");
        }}
      />
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
            <style>{`
              @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
          </div>
        }
      >
        <CheckoutContent />
      </Suspense>
    </>
  );
}
