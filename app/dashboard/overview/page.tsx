"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardOverview() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string; picture?: string } | null>(null);
  const [stats, setStats] = useState({ emailsSent: 0, contacts: 0, opens: 0, clicks: 0 });
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadStats = async () => {
    try {
      const [analyticsRes, contactsRes, subRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/contacts"),
        fetch("/api/payment/subscription")
      ]);

      const analyticsData = await analyticsRes.json();
      const contactsData = await contactsRes.json();
      const subData = await subRes.json();

      if (analyticsData?.stats) {
        setStats(s => ({
          ...s,
          emailsSent: analyticsData.stats.sent,
          opens: analyticsData.stats.opened,
          clicks: analyticsData.stats.clicked
        }));
      }
      if (contactsData) {
        setStats(s => ({ ...s, contacts: Array.isArray(contactsData) ? contactsData.length : 0 }));
      }
      if (subData && subData.hasSubscription) {
        setSubscription(subData.subscription);
      }
      return subData?.hasSubscription || false;
    } catch (err) {
      console.error('Failed to load stats:', err);
      return false;
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        console.log('🔄 Dashboard: Initializing...');
        
        // Fetch user data
        const userRes = await fetch("/api/auth/me", {
          cache: 'no-store'
        });
        console.log('📡 Dashboard: /api/auth/me response:', userRes.status);
        
        const userData = userRes.ok ? await userRes.json() : null;

        if (!userData) {
          console.log('❌ Dashboard: No user data, redirecting to login');
          router.push("/login");
          return;
        }

        setUser(userData);
        console.log('✅ Dashboard: User loaded:', userData.name, userData.email);

        // No subscription check - users can use the app freely
        setIsLoading(false);
        console.log('✅ Dashboard: Loading complete, showing dashboard');

        // Load stats
        await loadStats();

      } catch (err) {
        console.error('❌ Dashboard init error:', err);
        router.push("/login");
      }
    };
    
    initData();

    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, [router, refreshKey]);

  useEffect(() => {
    const handleEmailSent = () => {
      setRefreshKey(k => k + 1);
    };
    window.addEventListener('emailSent', handleEmailSent);
    return () => window.removeEventListener('emailSent', handleEmailSent);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
      window.location.href = '/login';
    }
  };

  const handlePurchase = async (plan: string) => {
    setIsLoading(true);
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

      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error('Purchase error:', err);
      alert(err.message || 'Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08090d] text-white flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  // Show pricing overlay if no subscription
  if (!subscription) {
    return (
      <>
        <style>{`
          :root {
            --bg: #08090d; --bg1: #0e1018; --bg2: #12151f; --bg3: #181c27;
            --line: rgba(255,255,255,0.07); --line2: rgba(255,255,255,0.13);
            --text: #dde1e9; --muted: #5a6373; --dim: #8b95a5; --white: #ffffff;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          
          .pricing-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(8, 9, 13, 0.92);
            backdrop-filter: blur(8px);
            z-index: 1000;
            overflow-y: auto;
            padding: 80px 24px 40px;
          }
          .pricing-content {
            max-width: 1120px;
            margin: 0 auto;
          }
          .pricing-header {
            text-align: center;
            margin-bottom: 48px;
          }
          .pricing-title {
            font-family: 'Instrument Serif', serif;
            font-size: clamp(32px, 5vw, 48px);
            font-weight: 400;
            color: var(--white);
            margin-bottom: 12px;
          }
          .pricing-subtitle {
            font-size: 16px;
            color: var(--muted);
          }
          .pricing-cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 40px;
          }
          .pricing-card {
            background: var(--bg2);
            border: 1px solid var(--line);
            border-radius: 16px;
            padding: 32px;
            transition: all 0.3s;
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
          .pricing-card-badge {
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 4px 12px;
            border-radius: 100px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .pricing-name {
            font-family: 'Instrument Serif', serif;
            font-size: 24px;
            color: var(--white);
            margin-bottom: 6px;
          }
          .pricing-price {
            font-size: 36px;
            font-weight: 700;
            color: var(--white);
            margin: 16px 0;
          }
          .pricing-price span {
            font-size: 14px;
            color: var(--muted);
          }
          .pricing-desc {
            font-size: 13px;
            color: var(--muted);
            margin-bottom: 24px;
          }
          .pricing-features {
            list-style: none;
            padding: 0;
            margin: 0 0 24px 0;
          }
          .pricing-features li {
            font-size: 13px;
            color: var(--text);
            padding: 8px 0;
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 1px solid var(--line);
          }
          .pricing-features li:last-child {
            border-bottom: none;
          }
          .pricing-btn {
            width: 100%;
            padding: 12px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          .pricing-btn.primary {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
          }
          .pricing-btn.primary:hover {
            opacity: 0.9;
            transform: scale(1.02);
          }
          .pricing-btn.primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .back-btn {
            position: fixed;
            top: 20px;
            left: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            background: var(--bg2);
            border: 1px solid var(--line);
            border-radius: 10px;
            color: var(--muted);
            font-size: 14px;
            cursor: pointer;
            z-index: 1001;
          }
          .back-btn:hover {
            border-color: #f87171;
            color: #f87171;
          }
          @media (max-width: 920px) {
            .pricing-cards {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

        <div className="pricing-overlay">
          <button className="back-btn" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back (Logout)
          </button>

          <div className="pricing-content">
            <div className="pricing-header">
              <h1 className="pricing-title">Choose Your Plan</h1>
              <p className="pricing-subtitle">Unlock full access to ClipVoBooster</p>
            </div>

            <div className="pricing-cards">
              {/* Starter */}
              <div className="pricing-card">
                <h3 className="pricing-name">Starter</h3>
                <div className="pricing-price">$15<span>/month</span></div>
                <p className="pricing-desc">Perfect for solopreneurs.</p>
                <ul className="pricing-features">
                  <li>✓ 100 emails/month</li>
                  <li>✓ AI generation</li>
                  <li>✓ Basic tracking</li>
                </ul>
                <button 
                  className="pricing-btn primary"
                  onClick={() => handlePurchase('starter')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Get Started'}
                </button>
              </div>

              {/* Professional */}
              <div className="pricing-card featured">
                <div className="pricing-card-badge">Most Popular</div>
                <h3 className="pricing-name">Professional</h3>
                <div className="pricing-price">$29<span>/month</span></div>
                <p className="pricing-desc">For growing businesses.</p>
                <ul className="pricing-features">
                  <li>✓ 500 emails/month</li>
                  <li>✓ Advanced analytics</li>
                  <li>✓ Priority support</li>
                  <li>✓ Remove branding</li>
                </ul>
                <button 
                  className="pricing-btn primary"
                  onClick={() => handlePurchase('professional')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Get Started'}
                </button>
              </div>

              {/* Lifetime */}
              <div className="pricing-card">
                <h3 className="pricing-name">Lifetime</h3>
                <div className="pricing-price">$60<span>/one-time</span></div>
                <p className="pricing-desc">Pay once, own forever.</p>
                <ul className="pricing-features">
                  <li>✓ Unlimited emails</li>
                  <li>✓ All Pro features</li>
                  <li>✓ Lifetime access</li>
                  <li>✓ VIP support</li>
                </ul>
                <button 
                  className="pricing-btn primary"
                  onClick={() => handlePurchase('lifetime')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Get Lifetime'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show dashboard if user has subscription
  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || "User";

  return (
    <>
      <style>{`
        :root {
          --bg: #08090d; --bg1: #0e1018; --bg2: #12151f; --bg3: #181c27;
          --line: rgba(255,255,255,0.07); --line2: rgba(255,255,255,0.13);
          --text: #dde1e9; --muted: #5a6373; --dim: #8b95a5; --white: #ffffff;
        }

        .welcome-card {
          background: var(--bg1);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 40px;
          margin-bottom: 24px;
        }

        .welcome-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 8px;
        }

        .welcome-subtitle {
          font-size: 14px;
          color: var(--muted);
          margin-bottom: 24px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 20px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: var(--muted);
        }

        .btn {
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
        }

        .btn-primary:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }

        .btn-secondary {
          background: var(--bg2);
          color: var(--text);
          border: 1px solid var(--line);
        }

        .btn-secondary:hover {
          background: var(--bg3);
        }

        .quick-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 24px;
        }

        .how-it-works {
          max-width: 600px;
          margin: 0 auto;
        }
      `}</style>

      <div>
        {/* Welcome Card */}
        <div className="welcome-card">
          <h1 className="welcome-title">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="welcome-subtitle">
            AI-powered email marketing. Write and send personalized emails instantly.
          </p>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.emailsSent}</div>
              <div className="stat-label">Emails Sent</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.opens}</div>
              <div className="stat-label">Emails Opened</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.clicks}</div>
              <div className="stat-label">Link Clicks</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.contacts}</div>
              <div className="stat-label">Contacts</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button
              className="btn btn-primary"
              onClick={() => router.push('/dashboard/compose')}
            >
              ✍️ Compose Email
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => router.push('/dashboard/contacts')}
            >
              👥 Add Contacts
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => router.push('/dashboard/analytics')}
            >
              📊 View Analytics
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="welcome-card">
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--white)', marginBottom: 20, textAlign: 'center' }}>
            How It Works
          </h2>
          <div className="how-it-works">
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'start' }}>
                <div style={{ fontSize: 24 }}>1️⃣</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)', marginBottom: 4 }}>Add Contacts</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Upload your customer email list</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'start' }}>
                <div style={{ fontSize: 24 }}>2️⃣</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)', marginBottom: 4 }}>AI Writes Emails</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Tell AI about your product and it writes personalized emails</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'start' }}>
                <div style={{ fontSize: 24 }}>3️⃣</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)', marginBottom: 4 }}>Send & Track</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Send emails and track opens and clicks</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
