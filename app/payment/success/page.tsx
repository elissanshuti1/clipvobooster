"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [subscriptionId, setSubscriptionId] = useState("");
  const [plan, setPlan] = useState("");
  const [planName, setPlanName] = useState("");

  useEffect(() => {
    const subId = searchParams.get("subscription_id");
    const planParam = searchParams.get("plan");
    const planNameParam = searchParams.get("planName");

    if (subId) setSubscriptionId(subId);
    if (planParam) setPlan(planParam);
    if (planNameParam) setPlanName(planNameParam);

    // Auto-redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      router.push("/dashboard/overview");
    }, 3000);

    return () => clearTimeout(timer);
  }, [searchParams, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#08090d",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          textAlign: "center",
          background: "#0e1018",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "24px",
          padding: "48px 32px",
        }}
      >
        {/* Success Icon */}
        <div
          style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 24px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "32px",
            color: "#ffffff",
            marginBottom: "12px",
          }}
        >
          Payment Successful!
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "16px",
            color: "#8b95a5",
            marginBottom: "32px",
            lineHeight: "1.6",
          }}
        >
          Thank you for your subscription. Your {planName || "plan"} has been
          activated.
        </p>

        {/* Subscription Details */}
        {subscriptionId && (
          <div
            style={{
              background: "#12151f",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "32px",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#5a6373",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Subscription ID
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#dde1e9",
                fontFamily: "monospace",
              }}
            >
              {subscriptionId}
            </p>
          </div>
        )}

        {/* Redirect Message */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              border: "2px solid rgba(255,255,255,0.1)",
              borderTop: "2px solid #6366f1",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p
            style={{
              fontSize: "14px",
              color: "#8b95a5",
            }}
          >
            Redirecting to dashboard...
          </p>
        </div>

        {/* Manual Link */}
        <Link
          href="/dashboard/overview"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "14px 28px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "white",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: "600",
            textDecoration: "none",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 8px 24px rgba(99, 102, 241, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Go to Dashboard
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>

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

export default function PaymentSuccessPage() {
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
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
