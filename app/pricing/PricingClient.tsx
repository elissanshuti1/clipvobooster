"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

export default function PricingClient() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "ClipVoBooster",
    "description": "AI-powered email marketing platform",
    "brand": {
      "@type": "Brand",
      "name": "ClipVoBooster"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Starter Plan",
        "price": "15.00",
        "priceCurrency": "USD",
        "priceValidUntil": new Date(new Date().getFullYear() + 1, 0, 1).toISOString().split('T')[0],
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "Professional Plan",
        "price": "29.00",
        "priceCurrency": "USD",
        "priceValidUntil": new Date(new Date().getFullYear() + 1, 0, 1).toISOString().split('T')[0],
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "Lifetime Plan",
        "price": "60.00",
        "priceCurrency": "USD",
        "priceValidUntil": new Date(new Date().getFullYear() + 1, 0, 1).toISOString().split('T')[0],
        "availability": "https://schema.org/InStock"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150"
    }
  };

  useEffect(() => {
    const initPricing = async () => {
      try {
        console.log('🔄 Pricing page: Initializing...');

        const [userData] = await Promise.all([
          fetch("/api/auth/me").then(r => {
            console.log('📡 /api/auth/me response:', r.status);
            return r.ok ? r.json() : null;
          })
        ]);

        if (userData) {
          setUser(userData);
          console.log('✅ Pricing page: User loaded:', userData.name, userData.email);
        } else {
          console.log('⚠️ Pricing page: No user data (not logged in)');
        }

        // No subscription check - pricing page is just informational
        setIsLoading(false);
        console.log('✅ Pricing page: Loading complete');
      } catch (err) {
        console.error('❌ Pricing init error:', err);
        setIsLoading(false);
      }
    };

    initPricing();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      window.location.href = '/';
    } catch (err) {
      console.error('Logout failed:', err);
      window.location.href = '/';
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const firstName = name.split(' ')[0];
      return firstName.charAt(0).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const handlePurchase = async (plan: string) => {
    if (!user) {
      // Redirect to login first, then come back to pricing
      window.location.href = '/login?redirect=/pricing';
      return;
    }

    if (subscription) {
      alert('You already have an active subscription.');
      return;
    }

    setIsProcessing(plan);
    try {
      const res = await fetch('/api/payment/dodo/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      // Redirect to Dodo checkout
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error('Purchase error:', err);
      alert(err.message || 'Failed to start checkout. Please try again.');
      setIsProcessing(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#08090d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid rgba(255,255,255,0.1)',
          borderTop: '3px solid #6366f1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Script
        id="pricing-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        strategy="afterInteractive"
      />
      <style>{`
        :root {
          --bg: #08090d; --bg1: #0e1018; --bg2: #12151f; --bg3: #181c27;
          --line: rgba(255,255,255,0.07); --line2: rgba(255,255,255,0.13);
          --text: #dde1e9; --muted: #5a6373; --dim: #8b95a5; --white: #ffffff;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        .pricing-page {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          position: relative;
        }

        .pricing-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 120px 24px 80px;
        }

        /* Back Button */
        .back-btn {
          position: fixed;
          top: 24px;
          left: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 10px;
          color: var(--muted);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          z-index: 100;
        }
        .back-btn:hover {
          border-color: #f87171;
          color: #f87171;
          background: rgba(248, 113, 113, 0.1);
        }

        /* Header */
        .pricing-header {
          text-align: center;
          margin-bottom: 64px;
        }
        .pricing-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(42px, 5vw, 64px);
          font-weight: 400;
          line-height: 1.1;
          letter-spacing: -0.035em;
          color: var(--white);
          margin-bottom: 16px;
        }
        .pricing-subtitle {
          font-size: 17px;
          font-weight: 300;
          color: var(--muted);
          max-width: 500px;
          margin: 0 auto;
          line-height: 1.75;
        }

        /* Pricing Cards */
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          margin-top: 64px;
        }
        .pricing-card {
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 40px;
          transition: all 0.3s ease;
          position: relative;
        }
        .pricing-card:hover {
          border-color: var(--line2);
          transform: translateY(-4px);
        }
        .pricing-card.featured {
          border-color: rgba(99, 102, 241, 0.3);
          background: linear-gradient(135deg, var(--bg2), rgba(99, 102, 241, 0.05));
          border-width: 2px;
        }
        .pricing-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          padding: 4px 16px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-family: 'DM Sans', sans-serif;
        }
        .pricing-name {
          font-family: 'Instrument Serif', serif;
          font-size: 28px;
          font-weight: 400;
          color: var(--white);
          margin-bottom: 8px;
        }
        .pricing-price {
          font-size: 48px;
          font-weight: 700;
          color: var(--white);
          margin: 24px 0;
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .pricing-price span {
          font-size: 16px;
          font-weight: 400;
          color: var(--muted);
        }
        .pricing-desc {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.7;
          margin-bottom: 32px;
        }
        .pricing-features {
          list-style: none;
          padding: 0;
          margin: 0 0 32px 0;
        }
        .pricing-features li {
          font-size: 14px;
          color: var(--text);
          padding: 12px 0;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--line);
        }
        .pricing-features li:last-child {
          border-bottom: none;
        }
        .check-icon {
          flex-shrink: 0;
        }
        .pricing-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        .pricing-btn.primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
        }
        .pricing-btn.primary:hover {
          opacity: 0.9;
          transform: scale(1.02);
          box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3);
        }
        .pricing-btn.primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        .pricing-btn.secondary {
          background: var(--bg3);
          color: var(--text);
          border: 1px solid var(--line);
        }
        .pricing-btn.secondary:hover {
          background: var(--bg2);
          border-color: var(--line2);
        }

        /* Current Plan Badge */
        .current-plan-badge {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 16px;
          display: inline-block;
        }

        /* Alert Box */
        .alert-box {
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 32px;
          text-align: center;
        }
        .alert-box-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--white);
          margin-bottom: 8px;
        }
        .alert-box-desc {
          font-size: 14px;
          color: var(--muted);
        }

        @media (max-width: 920px) {
          .pricing-grid {
            grid-template-columns: 1fr;
          }
          .pricing-wrap {
            padding: 100px 16px 60px;
          }
          .back-btn {
            top: 16px;
            left: 16px;
          }
        }
      `}</style>

      <div className="pricing-page">
        <div className="pricing-wrap">
          {/* Top Bar - User Profile or Back Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(255,255,255,0.08)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 600, color: 'white' }}>
                    {getInitials(user.name, user.email)}
                  </div>
                  <div>
                    <div style={{ color: '#ffffff', fontSize: 14, fontWeight: 600 }}>{user.name || user.email?.split('@')[0]}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12 }}>{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#cbd5e1', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
                  className="hover:text-white hover:border-white/40"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div />
            )}

            <button className="back-btn" onClick={handleLogout}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              {user ? 'Logout' : 'Back'}
            </button>
          </div>

          {/* Header */}
          <div className="pricing-header">
            <h1 className="pricing-title">
              Invest in Growth,<br />Not Features.
            </h1>
            <p className="pricing-subtitle">
              Choose the plan that fits your business. All plans include unlimited AI generation and real-time tracking.
            </p>
          </div>

          {/* Current Subscription Alert - Just informational, no redirect */}
          {subscription && (
            <div className="alert-box">
              <div className="alert-box-title">✅ You have an active {subscription.planName} plan</div>
              <div className="alert-box-desc">
                {subscription.interval === 'one-time'
                  ? 'Lifetime access'
                  : `$${subscription.price}/${subscription.interval}`}
                {subscription.startDate && ` • Started ${new Date(subscription.startDate).toLocaleDateString()}`}
              </div>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="pricing-grid">
            {/* Starter Plan */}
            <div className="pricing-card">
              <h3 className="pricing-name">Starter</h3>
              <div className="pricing-price">
                $15
                <span>/month</span>
              </div>
              <p className="pricing-desc">Perfect for solopreneurs just getting started with email marketing.</p>
              <ul className="pricing-features">
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  100 emails/month
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Unlimited AI generation
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Open & click tracking
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Basic analytics
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Professional email delivery
                </li>
              </ul>
              {subscription?.plan === 'starter' ? (
                <div className="current-plan-badge">Current Plan</div>
              ) : (
                <button
                  className="pricing-btn primary"
                  onClick={() => handlePurchase('starter')}
                  disabled={!!subscription || isProcessing === 'starter'}
                >
                  {isProcessing === 'starter' ? (
                    <>
                      <div style={{
                        width: 16,
                        height: 16,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      Get Started
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Pro Plan */}
            <div className="pricing-card featured">
              <div className="pricing-badge">Most Popular</div>
              <h3 className="pricing-name">Professional</h3>
              <div className="pricing-price">
                $29
                <span>/month</span>
              </div>
              <p className="pricing-desc">For growing businesses that need more emails and advanced features.</p>
              <ul className="pricing-features">
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  500 emails/month
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Everything in Starter
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Advanced analytics
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Custom templates
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Priority support
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Remove branding
                </li>
              </ul>
              {subscription?.plan === 'professional' ? (
                <div className="current-plan-badge">Current Plan</div>
              ) : (
                <button
                  className="pricing-btn primary"
                  onClick={() => handlePurchase('professional')}
                  disabled={!!subscription || isProcessing === 'professional'}
                >
                  {isProcessing === 'professional' ? (
                    <>
                      <div style={{
                        width: 16,
                        height: 16,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      Get Started
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Lifetime Plan */}
            <div className="pricing-card">
              <h3 className="pricing-name">Lifetime</h3>
              <div className="pricing-price">
                $60
                <span>/one-time</span>
              </div>
              <p className="pricing-desc">Pay once, use forever. All features, high-volume access. No monthly fees.</p>
              <ul className="pricing-features">
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Send personalized emails to contacts
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  All Pro features
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Lifetime access
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Early adopter perks
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  VIP support
                </li>
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Pay once, own forever
                </li>
              </ul>
              {subscription?.plan === 'lifetime' ? (
                <div className="current-plan-badge">Current Plan</div>
              ) : (
                <button
                  className="pricing-btn primary"
                  onClick={() => handlePurchase('lifetime')}
                  disabled={!!subscription || isProcessing === 'lifetime'}
                >
                  {isProcessing === 'lifetime' ? (
                    <>
                      <div style={{
                        width: 16,
                        height: 16,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      Get Lifetime Access
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
