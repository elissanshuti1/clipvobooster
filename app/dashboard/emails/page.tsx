"use client";

export default function SentEmailsPage() {
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

        <div className="empty-state">
          <div className="empty-state-icon">📧</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
            No emails sent yet
          </div>
          <div style={{ fontSize: 14, color: 'var(--muted)' }}>
            Compose your first email to see it here
          </div>
        </div>
      </div>
    </>
  );
}
