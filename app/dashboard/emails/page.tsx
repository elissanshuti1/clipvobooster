"use client";

import { useEffect, useState } from "react";

interface SentEmail {
  _id: string;
  to: string;
  subject: string;
  status: string;
  sentAt: string;
  opened: boolean;
  openCount: number;
  clickCount: number;
  trackingId: string;
}

export default function SentEmailsPage() {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/emails")
      .then((res) => res.json())
      .then((data) => {
        if (data.emails) {
          setEmails(data.emails);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch emails:", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08090d] text-white flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading sent emails...</div>
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

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: var(--bg1);
          border: 1px solid var(--line);
          border-radius: 14px;
        }

        .empty-state-icon {
          font-size: 64px;
          margin-bottom: 20px;
          opacity: 0.3;
        }

        .email-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .email-card {
          background: var(--bg1);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.2s;
        }

        .email-card:hover {
          border-color: var(--line2);
          background: var(--bg2);
        }

        .email-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          gap: 16px;
        }

        .email-subject {
          font-size: 16px;
          font-weight: 600;
          color: var(--white);
          margin: 0 0 8px 0;
        }

        .email-to {
          font-size: 13px;
          color: var(--muted);
          margin: 0;
        }

        .email-meta {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }

        .email-stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--dim);
          padding: 4px 10px;
          background: var(--bg2);
          border-radius: 100px;
          border: 1px solid var(--line);
        }

        .email-stat.opened {
          color: #4ade80;
          background: rgba(74, 222, 128, 0.1);
          border-color: rgba(74, 222, 128, 0.3);
        }

        .email-stat.clicked {
          color: #60a5fa;
          background: rgba(96, 165, 250, 0.1);
          border-color: rgba(96, 165, 250, 0.3);
        }

        .email-time {
          font-size: 12px;
          color: var(--muted);
          margin-left: auto;
        }

        .status-badge {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 100px;
          background: rgba(74, 222, 128, 0.1);
          color: #4ade80;
          border: 1px solid rgba(74, 222, 128, 0.3);
        }
      `}</style>

      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--white)' }}>
            📧 Sent Emails
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>
            Track all your sent emails
          </p>
        </div>

        {emails.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📧</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
              No emails sent yet
            </div>
            <div style={{ fontSize: 14, color: 'var(--muted)' }}>
              Compose your first email to see it here
            </div>
          </div>
        ) : (
          <div className="email-list">
            {emails.map((email) => (
              <div key={email._id} className="email-card">
                <div className="email-header">
                  <div style={{ flex: 1 }}>
                    <h3 className="email-subject">{email.subject}</h3>
                    <p className="email-to">To: {email.to}</p>
                  </div>
                  <span className="status-badge">Sent</span>
                </div>
                <div className="email-meta">
                  <span className={`email-stat ${email.opened ? 'opened' : ''}`}>
                    {email.opened ? '👁️' : '📤'}
                    {email.opened ? `Opened ${email.openCount}x` : 'Not opened'}
                  </span>
                  {email.clickCount > 0 && (
                    <span className="email-stat clicked">
                      🖱️ Clicked {email.clickCount}x
                    </span>
                  )}
                  <span className="email-time">
                    {new Date(email.sentAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
