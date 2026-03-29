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
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const checkoutId = searchParams.get("checkoutId");
  const productId = searchParams.get("productId");
  const plan = searchParams.get("plan");

  const clientToken = "test_14360885662003008ab180a517a";

  const addDebug = (msg: string) => {
    console.log(msg);
    setDebugInfo((prev) => [...prev, msg]);
  };

  useEffect(() => {
    addDebug("🔍 Checkout page loaded");
    addDebug(
      `📋 Params: checkoutId=${checkoutId}, productId=${productId}, plan=${plan}`,
    );

    if (!checkoutId || !productId || !plan) {
      setError("Invalid checkout parameters");
      return;
    }

    // Wait for Paddle to load
    const checkPaddle = setInterval(() => {
      if (window.Paddle) {
        clearInterval(checkPaddle);
        addDebug("✅ Paddle loaded");
        initializeCheckout();
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!window.Paddle) {
        clearInterval(checkPaddle);
        setError("Paddle failed to load. Please refresh the page.");
      }
    }, 10000);

    return () => clearInterval(checkPaddle);
  }, []);

  const initializeCheckout = () => {
    try {
      addDebug("🚀 Initializing Paddle...");

      window.Paddle.Environment.set("sandbox");
      addDebug("✅ Environment set to sandbox");

      window.Paddle.Initialize({
        token: clientToken,
        eventCallback: (data: any) => {
          addDebug(`📡 Event: ${data.name}`);

          if (data.name === "checkout.completed") {
            addDebug("✅ Payment completed!");
            const subId = data.data.subscription_id;
            const custId = data.data.customer_id;
            window.location.href = `/api/payment/paddle/success?status=success&subscription_id=${subId}&customer_id=${custId}&checkout_id=${checkoutId}`;
          }

          if (data.name === "checkout.closed") {
            addDebug("❌ Checkout closed");
            router.push("/plans?payment=cancelled");
          }

          if (data.name === "error") {
            addDebug(`❌ Error: ${JSON.stringify(data)}`);
            setError("Payment error occurred");
          }
        },
      });

      addDebug("⏳ Opening checkout...");

      setTimeout(() => {
        try {
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
          addDebug("✅ Checkout opened successfully");
        } catch (openErr: any) {
          addDebug(`❌ Failed to open checkout: ${openErr.message}`);
          setError(`Failed to open checkout: ${openErr.message}`);
        }
      }, 500);
    } catch (err: any) {
      addDebug(`❌ Initialization error: ${err.message}`);
      setError(`Failed to initialize: ${err.message}`);
    }
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
          padding: "24px",
        }}
      >
        <h1 style={{ color: "#f87171", fontSize: "24px" }}>Checkout Error</h1>
        <p style={{ color: "#8b95a5", textAlign: "center", maxWidth: "400px" }}>
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
        {debugInfo.length > 0 && (
          <details
            style={{ marginTop: "24px", maxWidth: "500px", width: "100%" }}
          >
            <summary
              style={{ cursor: "pointer", color: "#5a6373", fontSize: "13px" }}
            >
              Debug Info (click to expand)
            </summary>
            <div
              style={{
                marginTop: "12px",
                background: "#0e1018",
                padding: "16px",
                borderRadius: "8px",
                fontSize: "11px",
                fontFamily: "monospace",
                color: "#8b95a5",
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              {debugInfo.map((log, i) => (
                <div key={i} style={{ padding: "2px 0" }}>
                  {log}
                </div>
              ))}
            </div>
          </details>
        )}
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
        <p style={{ color: "#5a6373", fontSize: "13px", marginTop: "8px" }}>
          Please wait
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
        onLoad={() => console.log("✅ Paddle script loaded")}
        onError={(e) => console.error("❌ Paddle script failed to load", e)}
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
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        }
      >
        <CheckoutContent />
      </Suspense>
    </>
  );
}
