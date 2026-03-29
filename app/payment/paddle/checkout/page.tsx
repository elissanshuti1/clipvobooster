"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
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

  const checkoutId = searchParams.get("checkoutId");
  const productId = searchParams.get("productId");
  const plan = searchParams.get("plan");

  const clientToken = "test_14360885662003008ab180a517a";

  useEffect(() => {
    if (!checkoutId || !productId || !plan) {
      setError("Invalid checkout parameters");
      return;
    }

    // Initialize Paddle once it's loaded
    if (isPaddleLoaded && window.Paddle) {
      initializePaddle();
    }
  }, [isPaddleLoaded, checkoutId, productId, plan, router]);

  const initializePaddle = () => {
    if (!window.Paddle) return;

    window.Paddle.Environment.set("sandbox");

    window.Paddle.Initialize({
      token: clientToken,
      eventCallback: (data: any) => {
        console.log("Paddle event:", data);

        if (data.name === "checkout.completed") {
          const subscriptionId = data.data.subscription_id;
          const customerId = data.data.customer_id;

          window.location.href = `/api/payment/paddle/success?status=success&subscription_id=${subscriptionId}&customer_id=${customerId}&checkout_id=${checkoutId}`;
        }

        if (data.name === "checkout.closed") {
          router.push("/plans?payment=cancelled");
        }
      },
    });

    // Open checkout after initialization
    setTimeout(() => {
      window.Paddle?.Checkout?.open({
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
    }, 800);
  };

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
        <p style={{ color: "#8b95a5" }}>{error}</p>
        <button
          onClick={() => router.push("/plans")}
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
          Back to Plans
        </button>
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
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Paddle script loaded");
        }}
        onError={() => {
          console.error("Failed to load Paddle");
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
