"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardOverview() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string; picture?: string } | null>(null);
  const [stats, setStats] = useState({ emailsSent: 0, contacts: 0, clicks: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userProfile, setUserProfile] = useState<{ projectName?: string; projectDescription?: string } | null>(null);

  const loadStats = async () => {
    try {
      const [analyticsRes, contactsRes, profileRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/contacts"),
        fetch("/api/profile")
      ]);

      const analyticsData = await analyticsRes.json();
      const contactsData = await contactsRes.json();
      const profileData = await profileRes.json();

      if (analyticsData?.stats) {
        setStats(s => ({
          ...s,
          emailsSent: analyticsData.stats.sent,
          clicks: analyticsData.stats.clicked
        }));
      }
      if (contactsData) {
        setStats(s => ({ ...s, contacts: Array.isArray(contactsData) ? contactsData.length : 0 }));
      }
      if (profileData) {
        setUserProfile(profileData.profile || null);
      }
      return true;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08090d] text-white flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  // Show dashboard - no subscription required
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
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Upload your contact email list</div>
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
