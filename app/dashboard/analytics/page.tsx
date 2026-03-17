"use client";

import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    sent: 0,
    opened: 0,
    openRate: 0,
    totalOpens: 0,
    clicked: 0,
    clickRate: 0,
    totalClicks: 0
  });
  const [recentEmails, setRecentEmails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    // Refresh analytics every 5 seconds for real-time updates
    const interval = setInterval(loadAnalytics, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      setStats(data.stats || {});
      setRecentEmails(data.recentEmails || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: 32, color: 'var(--muted)', textAlign: 'center' }}>
        Loading analytics...
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

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: var(--bg1);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 24px;
        }

        .stat-value {
          font-size: 36px;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: var(--muted);
        }

        .email-item {
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 8px;
        }

        .email-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .email-subject {
          font-size: 14px;
          font-weight: 600;
          color: 'var(--white)'
        }

        .email-recipient {
          font-size: 13px;
          color: 'var(--muted)'
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-opened {
          background: rgba(74, 222, 128, 0.1);
          color: #4ade80;
          border: 1px solid rgba(74, 222, 128, 0.3);
        }

        .status-sent {
          background: rgba(96, 165, 250, 0.1);
          color: #60a5fa;
          border: 1px solid rgba(96, 165, 250, 0.3);
        }

        .status-not-opened {
          background: rgba(248, 113, 113, 0.1);
          color: #f87171;
          border: 1px solid rgba(248, 113, 113, 0.3);
        }
      `}</style>

      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--white)' }}>
            📊 Analytics
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>
            Track your email performance
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.sent}</div>
            <div className="stat-label">Emails Sent</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.opened}</div>
            <div className="stat-label">Emails Opened</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.openRate}%</div>
            <div className="stat-label">Open Rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalOpens}</div>
            <div className="stat-label">Total Opens</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.clicked}</div>
            <div className="stat-label">Link Clicks</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.clickRate}%</div>
            <div className="stat-label">Click Rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalClicks}</div>
            <div className="stat-label">Total Clicks</div>
          </div>
        </div>

        <div className="stat-card">
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--white)', marginBottom: 16 }}>
            Recent Emails
          </h3>
          {recentEmails.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
              No emails sent yet
            </div>
          ) : (
            recentEmails.map((email) => (
              <div key={email._id} className="email-item">
                <div className="email-header">
                  <div>
                    <div className="email-subject">{email.subject}</div>
                    <div className="email-recipient">To: {email.to}</div>
                  </div>
                  <span className={`status-badge ${email.opened ? 'status-opened' : email.status === 'sent' ? 'status-sent' : 'status-not-opened'}`}>
                    {email.opened ? 'Opened' : email.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Sent {new Date(email.sentAt).toLocaleString()}
                </div>
                {email.opened && (
                  <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 4 }}>
                    📩 Opened {new Date(email.openedAt).toLocaleString()} • {email.openCount} {email.openCount === 1 ? 'time' : 'times'}
                  </div>
                )}
                {email.clickCount > 0 && (
                  <div style={{ fontSize: 12, color: '#60a5fa', marginTop: 4 }}>
                    🔗 {email.clickCount} link {email.clickCount === 1 ? 'click' : 'clicks'} detected
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
