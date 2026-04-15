"use client";

import { useEffect, useState } from "react";
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

  const handlePurchase = async (plan: string) => {
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
      if (!res.ok) throw new Error(data.error || "Failed to create checkout");
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error("Purchase error:", err);
      alert(err.message || "Failed to start checkout. Please try again.");
      setIsProcessing(null);
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) return name.split(" ")[0].charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return "U";
  };

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
    <>
      <style>{`
        :root {
          --bg: #08090d; --bg1: #0e1018; --bg2: #12151f; --bg3: #181c27;
          --line: rgba(255,255,255,0.07); --line2: rgba(255,255,255,0.13);
          --text: #dde1e9; --muted: #5a6373; --dim: #8b95a5; --white: #ffffff;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .plans-page { min-height: 100vh; background: var(--bg); color: var(--text); position: relative; }
        .plans-header {
          position: fixed; top: 0; left: 0; right: 0;
          display: flex; justify-content: space-between; align-items: center;
          padding: 20px 32px; z-index: 100;
          background: rgba(8, 9, 13, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--line);
        }
        .user-info { display: flex; align-items: center; gap: 12px; }
        .user-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 600; color: white;
        }
        .user-email { color: var(--text); font-size: 14px; font-weight: 500; }
        .logout-btn {
          padding: 10px 20px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.15);
          background: transparent; color: var(--dim);
          cursor: pointer; font-size: 14px; font-weight: 500;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          border-color: #f87171; color: #f87171;
          background: rgba(248, 113, 113, 0.1);
        }
        .plans-wrap { max-width: 1200px; margin: 0 auto; padding: 120px 24px 80px; }
        .plans-header-text { text-align: center; margin-bottom: 64px; }
        .plans-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(42px, 5vw, 64px);
          font-weight: 400; line-height: 1.1;
          letter-spacing: -0.035em;
          color: var(--white); margin-bottom: 16px;
        }
        .plans-subtitle {
          font-size: 17px; font-weight: 300;
          color: var(--muted); max-width: 500px;
          margin: 0 auto; line-height: 1.75;
        }
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px; margin-top: 64px;
        }
        @media (min-width: 960px) {
          .plans-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .plans-card {
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 20px; padding: 40px;
          transition: all 0.3s ease; position: relative;
        }
        .plans-card:hover {
          border-color: var(--line2);
          transform: translateY(-4px);
        }
        .plans-card.featured {
          border-color: rgba(99, 102, 241, 0.3);
          background: linear-gradient(135deg, var(--bg2), rgba(99, 102, 241, 0.05));
          border-width: 2px;
        }
        .plans-badge {
          position: absolute; top: -12px; left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white; padding: 4px 16px; border-radius: 100px;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.05em; text-transform: uppercase;
        }
        .plans-name {
          font-family: 'Instrument Serif', serif;
          font-size: 28px; font-weight: 400;
          color: var(--white); margin-bottom: 8px;
        }
        .plans-price {
          font-size: 48px; font-weight: 700;
          color: var(--white); margin: 24px 0;
          display: flex; align-items: baseline; gap: 4px;
        }
        .plans-price span {
          font-size: 16px; font-weight: 400;
          color: var(--muted);
        }
        .plans-desc {
          font-size: 14px; color: var(--muted);
          line-height: 1.7; margin-bottom: 32px;
        }
        .plans-features {
          list-style: none; padding: 0; margin: 0 0 32px 0;
        }
        .plans-features li {
          font-size: 14px; color: var(--text);
          padding: 12px 0; display: flex;
          align-items: center; gap: 12px;
          border-bottom: 1px solid var(--line);
        }
        .plans-features li:last-child { border-bottom: none; }
        .check-icon { flex-shrink: 0; }
        .plans-btn {
          display: inline-flex; align-items: center;
          justify-content: center; gap: 12px;
          width: 100%; padding: 16px; border-radius: 12px;
          font-size: 15px; font-weight: 600;
          text-decoration: none; transition: all 0.2s;
          border: none; cursor: pointer;
        }
        .plans-btn.primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
        }
        .plans-btn.primary:hover {
          opacity: 0.9; transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
        }
        .plans-btn.primary:disabled {
          opacity: 0.7; cursor: not-allowed;
          transform: none; box-shadow: none;
        }
        .alert-box {
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.3);
          border-radius: 16px;
          padding: 20px 24px;
          margin-bottom: 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .alert-box-title {
          color: #f87171;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .alert-box-desc {
          color: #8b95a5;
          font-size: 14px;
        }
      `}</style>

      <div className="plans-page">
        <header className="plans-header">
          <div className="user-info">
            <div className="user-avatar">
              {getInitials(user?.name, user?.email)}
            </div>
            <div className="user-email">{user?.email}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <div className="plans-wrap">
          <div className="plans-header-text">
            <h1 className="plans-title">Choose Your Plan</h1>
            <p className="plans-subtitle">
              Upgrade to unlock all features and access your dashboard.
            </p>
          </div>

          {user && !subscription && (
            <div className="alert-box">
              <div>
                <div className="alert-box-title">
                  📋 You're on the Free Plan
                </div>
                <div className="alert-box-desc">
                  Upgrade to unlock all features and access your dashboard.
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  padding: "10px 18px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "transparent",
                  color: "#cbd5e1",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#f87171";
                  e.currentTarget.style.color = "#f87171";
                  e.currentTarget.style.background = "rgba(248, 113, 113, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                  e.currentTarget.style.color = "#cbd5e1";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Logout
              </button>
            </div>
          )}

          <div className="plans-grid">
            {/* Free Trial */}
            <div className="plans-card featured">
              <div className="plans-badge">🔥 Try Free for 3 Days</div>
              <h3 className="plans-name">Free Trial</h3>
              <div
                className="plans-price"
                style={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 2,
                }}
              >
                <span
                  style={{ fontSize: 48, fontWeight: 700, color: "#4ade80" }}
                >
                  FREE
                </span>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 400,
                    color: "var(--muted)",
                  }}
                >
                  Then $15/month after
                </span>
              </div>
              <p className="plans-desc">
                Start free for 3 days, then $15/month. Cancel anytime.
              </p>
              <ul className="plans-features">
                <li>
                  <CheckIcon />
                  300 emails/month
                </li>
                <li>
                  <CheckIcon />
                  100 AI-discovered leads/month
                </li>
                <li>
                  <CheckIcon />
                  AI email writing
                </li>
                <li>
                  <CheckIcon />5 email templates
                </li>
                <li>
                  <CheckIcon />
                  Email support
                </li>
                <li>
                  <CheckIcon />
                  30-day lead storage
                </li>
                <li>
                  <CheckIcon />
                  Basic analytics
                </li>
                <li>
                  <CheckIcon />1 team member
                </li>
              </ul>
              <button
                className="plans-btn primary"
                onClick={() => handlePurchase("free-trial")}
                disabled={!!subscription || isProcessing === "free-trial"}
              >
                {isProcessing === "free-trial" ? (
                  <>
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTop: "2px solid white",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowIcon />
                    Start Free Trial
                  </>
                )}
              </button>
            </div>

            {/* Starter */}
            <div className="plans-card">
              <h3 className="plans-name">Starter</h3>
              <div className="plans-price">
                $15<span>/month</span>
              </div>
              <p className="plans-desc">
                For solopreneurs finding their first customers.
              </p>
              <ul className="plans-features">
                <li>
                  <CheckIcon />
                  300 emails/month
                </li>
                <li>
                  <CheckIcon />
                  100 AI-discovered leads/month
                </li>
                <li>
                  <CheckIcon />
                  AI email writing
                </li>
                <li>
                  <CheckIcon />5 email templates
                </li>
                <li>
                  <CheckIcon />
                  Email support
                </li>
                <li>
                  <CheckIcon />
                  30-day lead storage
                </li>
                <li>
                  <CheckIcon />
                  Basic analytics
                </li>
                <li>
                  <CheckIcon />1 team member
                </li>
              </ul>
              <button
                className="plans-btn primary"
                onClick={() => handlePurchase("starter")}
                disabled={!!subscription || isProcessing === "starter"}
              >
                {isProcessing === "starter" ? (
                  <>
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTop: "2px solid white",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowIcon />
                    Get Started
                  </>
                )}
              </button>
            </div>

            {/* Professional */}
            <div className="plans-card featured">
              <div className="plans-badge">Most Popular</div>
              <h3 className="plans-name">Professional</h3>
              <div className="plans-price">
                $29<span>/month</span>
              </div>
              <p className="plans-desc">
                For growing businesses serious about sales.
              </p>
              <ul className="plans-features">
                <li>
                  <CheckIcon />
                  Everything in Starter
                </li>
                <li>
                  <CheckIcon />
                  1,000 emails/month
                </li>
                <li>
                  <CheckIcon />
                  500 AI-discovered leads/month
                </li>
                <li>
                  <CheckIcon />
                  Unlimited templates
                </li>
                <li>
                  <CheckIcon />
                  Priority chat support
                </li>
                <li>
                  <CheckIcon />
                  90-day lead storage
                </li>
                <li>
                  <CheckIcon />
                  Advanced analytics
                </li>
                <li>
                  <CheckIcon />3 team members
                </li>
              </ul>
              <button
                className="plans-btn primary"
                onClick={() => handlePurchase("professional")}
                disabled={!!subscription || isProcessing === "professional"}
              >
                {isProcessing === "professional" ? (
                  <>
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTop: "2px solid white",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowIcon />
                    Get Started
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function CheckIcon() {
  return (
    <svg
      className="check-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#4ade80"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ArrowIcon() {
  return (
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
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
