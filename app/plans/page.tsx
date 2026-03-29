"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function PlansClient() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(
    null,
  );
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setSubscription(data.subscription || null);
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (err) {
      window.location.href = "/";
    }
  };

  const handlePurchase = useCallback(
    async (plan: string) => {
      if (!user) {
        window.location.href = "/login?redirect=/plans";
        return;
      }

      if (subscription) {
        alert("You already have an active subscription.");
        return;
      }

      setIsProcessing(plan);
      try {
        const res = await fetch("/api/payment/paddle/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to create checkout");
        }

        window.location.href = data.checkoutUrl;
      } catch (err: any) {
        console.error("Purchase error:", err);
        alert(err.message || "Failed to start checkout. Please try again.");
        setIsProcessing(null);
      }
    },
    [user, subscription],
  );

  if (isLoading) {
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
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#08090d" }}>
      <Header user={user} onLogout={handleLogout} />
      <main style={{ paddingTop: "120px", paddingBottom: "80px" }}>
        <div
          style={{
            textAlign: "center",
            marginBottom: "64px",
            padding: "0 24px",
          }}
        >
          <h1
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(42px, 5vw, 64px)",
              fontWeight: 400,
              color: "#ffffff",
              marginBottom: "16px",
            }}
          >
            Choose Your Plan
          </h1>
          <p
            style={{
              fontSize: "17px",
              fontWeight: 300,
              color: "#8b95a5",
              maxWidth: "500px",
              margin: "0 auto",
              lineHeight: 1.75,
            }}
          >
            Upgrade to unlock all features and access your dashboard.
          </p>
        </div>

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
            padding: "0 24px",
          }}
        >
          <PlanCard
            name="Starter"
            price="$15"
            interval="/month"
            description="For solopreneurs finding their first customers."
            features={[
              "Unlimited AI Generation",
              "Real-time Email Tracking",
              "Basic Analytics",
            ]}
            onSelect={() => handlePurchase("starter")}
            isProcessing={isProcessing === "starter"}
          />
          <PlanCard
            name="Professional"
            price="$29"
            interval="/month"
            description="For growing businesses scaling their outreach."
            features={[
              "Everything in Starter",
              "500 Emails/Month",
              "Advanced Analytics",
              "Priority Support",
            ]}
            isFeatured
            onSelect={() => handlePurchase("professional")}
            isProcessing={isProcessing === "professional"}
          />
          <PlanCard
            name="Business"
            price="$99"
            interval="/month"
            description="For teams managing large-scale campaigns."
            features={[
              "Everything in Professional",
              "Unlimited Emails",
              "Team Collaboration",
              "Dedicated Support",
            ]}
            onSelect={() => handlePurchase("business")}
            isProcessing={isProcessing === "business"}
          />
        </div>
      </main>
    </div>
  );
}

function Header({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        padding: "20px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 100,
        background: "rgba(8, 9, 13, 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: "600",
            color: "white",
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase() ||
            user?.email?.charAt(0)?.toUpperCase() ||
            "U"}
        </div>
        <div style={{ color: "#dde1e9", fontSize: "14px", fontWeight: "500" }}>
          {user?.email}
        </div>
      </div>
      <button
        onClick={onLogout}
        style={{
          padding: "10px 20px",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.15)",
          background: "transparent",
          color: "#cbd5e1",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "500",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#f87171";
          e.currentTarget.style.color = "#f87171";
          e.currentTarget.style.background = "rgba(248, 113, 113, 0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
          e.currentTarget.style.color = "#cbd5e1";
          e.currentTarget.style.background = "transparent";
        }}
      >
        Logout
      </button>
    </header>
  );
}

function PlanCard({
  name,
  price,
  interval,
  description,
  features,
  isFeatured,
  onSelect,
  isProcessing,
}: {
  name: string;
  price: string;
  interval: string;
  description: string;
  features: string[];
  isFeatured?: boolean;
  onSelect: () => void;
  isProcessing: boolean;
}) {
  return (
    <div
      style={{
        background: isFeatured
          ? "linear-gradient(135deg, #12151f, rgba(99, 102, 241, 0.05))"
          : "#12151f",
        border: isFeatured
          ? "2px solid rgba(99, 102, 241, 0.3)"
          : "1px solid rgba(255,255,255,0.07)",
        borderRadius: "20px",
        padding: "40px",
        transition: "all 0.3s ease",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = isFeatured
          ? "rgba(99, 102, 241, 0.5)"
          : "rgba(255,255,255,0.13)";
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isFeatured
          ? "rgba(99, 102, 241, 0.3)"
          : "rgba(255,255,255,0.07)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {isFeatured && (
        <div
          style={{
            position: "absolute",
            top: "-12px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "white",
            padding: "4px 16px",
            borderRadius: "100px",
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Most Popular
        </div>
      )}
      <h3
        style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "28px",
          fontWeight: 400,
          color: "#ffffff",
          marginBottom: "8px",
        }}
      >
        {name}
      </h3>
      <div
        style={{
          fontSize: "48px",
          fontWeight: 700,
          color: "#ffffff",
          margin: "24px 0",
          display: "flex",
          alignItems: "baseline",
          gap: "4px",
        }}
      >
        {price}
        <span style={{ fontSize: "16px", fontWeight: 400, color: "#8b95a5" }}>
          {interval}
        </span>
      </div>
      <p
        style={{
          fontSize: "14px",
          color: "#8b95a5",
          lineHeight: 1.7,
          marginBottom: "32px",
        }}
      >
        {description}
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0" }}>
        {features.map((feature, i) => (
          <li
            key={i}
            style={{
              fontSize: "14px",
              color: "#dde1e9",
              padding: "12px 0",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4ade80"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <button
        onClick={onSelect}
        disabled={isProcessing}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          width: "100%",
          padding: "16px",
          borderRadius: "12px",
          fontSize: "15px",
          fontWeight: 600,
          border: "none",
          cursor: isProcessing ? "not-allowed" : "pointer",
          background: isProcessing
            ? "rgba(99, 102, 241, 0.5)"
            : "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "white",
          transition: "all 0.2s",
          opacity: isProcessing ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isProcessing) {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 8px 24px rgba(99, 102, 241, 0.3)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {isProcessing ? "Processing..." : "Get Started"}
        {!isProcessing && (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        )}
      </button>
    </div>
  );
}
