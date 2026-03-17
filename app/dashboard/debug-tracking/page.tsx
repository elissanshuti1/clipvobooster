"use client";

import { useEffect, useState } from "react";

export default function DebugTrackingPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [clicks, setClicks] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000); // Refresh every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      addLog('Fetching data from database...');
      
      const [emailsRes, analyticsRes, notificationsRes] = await Promise.all([
        fetch('/api/debug/emails'),
        fetch('/api/analytics'),
        fetch('/api/notifications')
      ]);

      const emailsData = await emailsRes.json();
      const analyticsData = await analyticsRes.json();
      const notificationsData = await notificationsRes.json();

      setEmails(emailsData.emails || []);
      setClicks(analyticsData.stats ? [analyticsData.stats] : []);
      setNotifications(notificationsData.notifications || []);
      
      addLog(`Found ${emailsData.emails?.length || 0} emails, ${analyticsData.stats?.sent || 0} sent`);
    } catch (err: any) {
      addLog(`Error: ${err.message}`);
    }
  };

  const testTracking = async (trackingId: string) => {
    addLog(`Testing tracking pixel: ${trackingId}`);
    try {
      const res = await fetch(`/api/track?t=${trackingId}`);
      addLog(`Tracking response status: ${res.status}`);
      loadData();
    } catch (err: any) {
      addLog(`Tracking test error: ${err.message}`);
    }
  };

  return (
    <>
      <style>{`
        :root {
          --bg: #08090d; --bg1: #0e1018; --bg2: #12151f; --bg3: #181c27;
          --line: rgba(255,255,255,0.07); --line2: rgba(255,255,255,0.13);
          --text: #dde1e9; --muted: #5a6373; --dim: #8b95a5; --white: #ffffff;
        }
        .card {
          background: var(--bg1);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .log-terminal {
          background: #000;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 16px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #4ade80;
          max-height: 200px;
          overflow-y: auto;
        }
        .email-item {
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 600;
        }
        .status-opened { background: rgba(74, 222, 128, 0.2); color: #4ade80; }
        .status-sent { background: rgba(96, 165, 250, 0.2); color: #60a5fa; }
        .status-not-opened { background: rgba(248, 113, 113, 0.2); color: #f87171; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--white)', marginBottom: 8 }}>
          🔍 Debug Tracking
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
          Real-time database and tracking diagnostics
        </p>

        {/* Live Logs */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--white)', marginBottom: 12 }}>
            📝 Live Logs
          </h2>
          <div className="log-terminal">
            {logs.length === 0 ? (
              <div>Waiting for logs...</div>
            ) : (
              logs.slice(-20).map((log, i) => (
                <div key={i}>{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Sent Emails */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--white)', marginBottom: 16 }}>
            📧 Sent Emails in Database
          </h2>
          {emails.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
              No emails found in database
            </div>
          ) : (
            emails.map((email) => (
              <div key={email._id} className="email-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)' }}>
                      {email.subject}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                      To: {email.to}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 4 }}>
                      Tracking ID: {email.trackingId}
                    </div>
                  </div>
                  <span className={`status-badge ${email.opened ? 'status-opened' : 'status-sent'}`}>
                    {email.opened ? `Opened ${email.openCount}x` : 'Not Opened'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: 13 }}>
                  <div>
                    <span style={{ color: 'var(--muted)' }}>Sent:</span>
                    <span style={{ color: 'var(--white)', marginLeft: 4 }}>
                      {new Date(email.sentAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)' }}>Opens:</span>
                    <span style={{ color: 'var(--white)', marginLeft: 4 }}>{email.openCount || 0}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)' }}>Clicks:</span>
                    <span style={{ color: 'var(--white)', marginLeft: 4 }}>{email.clickCount || 0}</span>
                  </div>
                </div>
                <button
                  onClick={() => testTracking(email.trackingId)}
                  style={{
                    marginTop: 12,
                    padding: '8px 16px',
                    background: 'var(--bg3)',
                    border: '1px solid var(--line)',
                    borderRadius: 6,
                    color: 'var(--text)',
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  🧪 Test Tracking Pixel
                </button>
              </div>
            ))
          )}
        </div>

        {/* Recent Notifications */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--white)', marginBottom: 16 }}>
            🔔 Recent Notifications
          </h2>
          {notifications.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
              No notifications yet
            </div>
          ) : (
            notifications.slice(0, 10).map((notif: any) => (
              <div key={notif._id} style={{
                padding: 12,
                background: notif.read ? 'transparent' : 'var(--bg2)',
                borderRadius: 8,
                marginBottom: 8,
                borderLeft: notif.read ? 'none' : '3px solid #6366f1'
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--white)' }}>
                  {notif.type === 'email_opened' ? '📩' : notif.type === 'email_clicked' ? '🔗' : '🔔'} {notif.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                  {notif.message}
                </div>
                <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4 }}>
                  {new Date(notif.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
