"use client";

import Link from "next/link";

export default function FeaturesClient() {
  return (
    <>
      <style>{`
        :root {
          --bg: #08090d; --bg1: #0e1018; --bg2: #12151f; --bg3: #181c27;
          --line: rgba(255,255,255,0.07); --line2: rgba(255,255,255,0.13);
          --text: #dde1e9; --muted: #5a6373; --dim: #8b95a5; --white: #ffffff;
        }
        .features-page {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          padding: 120px 24px 80px;
        }
        .features-wrap {
          max-width: 1120px;
          margin: 0 auto;
        }
        .features-header {
          text-align: center;
          margin-bottom: 80px;
        }
        .features-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.11em;
          text-transform: uppercase;
          color: var(--muted);
          border: 1px solid var(--line2);
          padding: 6px 16px;
          border-radius: 100px;
          margin-bottom: 24px;
        }
        .features-badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--dim);
        }
        .features-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(42px, 5vw, 64px);
          font-weight: 400;
          line-height: 1.1;
          letter-spacing: -0.035em;
          color: var(--white);
          margin-bottom: 16px;
        }
        .features-subtitle {
          font-size: 17px;
          font-weight: 300;
          color: var(--muted);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.75;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 24px;
          margin-bottom: 80px;
        }
        .feature-card {
          background: var(--bg1);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 40px;
          transition: all 0.3s ease;
        }
        .feature-card:hover {
          border-color: var(--line2);
          transform: translateY(-4px);
          background: var(--bg2);
        }
        .feature-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          background: var(--bg3);
          border: 1px solid var(--line);
          display: grid;
          place-items: center;
          font-size: 24px;
          margin-bottom: 24px;
        }
        .feature-title {
          font-family: 'Instrument Serif', serif;
          font-size: 24px;
          font-weight: 400;
          color: var(--white);
          letter-spacing: -0.02em;
          margin-bottom: 12px;
        }
        .feature-desc {
          font-size: 15px;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.8;
          margin-bottom: 20px;
        }
        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .feature-list li {
          font-size: 14px;
          color: var(--text);
          padding: 8px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .feature-list li::before {
          content: "✓";
          color: #4ade80;
          font-weight: bold;
        }
        .cta-section {
          background: linear-gradient(135deg, var(--bg1), var(--bg2));
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 60px 40px;
          text-align: center;
        }
        .cta-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 400;
          color: var(--white);
          margin-bottom: 16px;
        }
        .cta-text {
          font-size: 16px;
          font-weight: 300;
          color: var(--muted);
          max-width: 500px;
          margin: 0 auto 32px;
          line-height: 1.7;
        }
        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }
        .cta-button:hover {
          opacity: 0.9;
          transform: scale(1.02);
          box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3);
        }
        @media (max-width: 768px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
          .features-page {
            padding: 100px 16px 60px;
          }
        }
      `}</style>

      <div className="features-page">
        <div className="features-wrap">
          {/* Header */}
          <div className="features-header">
            <div className="features-badge">
              <span className="features-badge-dot" />
              Platform Features
            </div>
            <h1 className="features-title">
              Everything you need for<br />successful email marketing
            </h1>
            <p className="features-subtitle">
              Powerful features to help you create, send, and track professional emails that convert prospects into customers.
            </p>
          </div>

          {/* Features Grid */}
          <div className="features-grid">
            {/* AI Email Generation */}
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h2 className="feature-title">AI Email Generation</h2>
              <p className="feature-desc">
                Our AI writes professional, detailed business letters that get read and responded to. No more staring at a blank page.
              </p>
              <ul className="feature-list">
                <li>200+ word professional emails</li>
                <li>Personalized content</li>
                <li>Multiple tone options</li>
                <li>Auto-includes your website</li>
              </ul>
            </div>

            {/* Real-time Tracking */}
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h2 className="feature-title">Real-time Tracking</h2>
              <p className="feature-desc">
                Know the moment someone opens your email or clicks your links. Get instant notifications for every interaction.
              </p>
              <ul className="feature-list">
                <li>Open tracking</li>
                <li>Click tracking</li>
                <li>Instant notifications</li>
                <li>Activity timeline</li>
              </ul>
            </div>

            {/* Beautiful Design */}
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h2 className="feature-title">Beautiful Email Design</h2>
              <p className="feature-desc">
                Every email features a professional layout with gradient headers, styled content, and your branded signature.
              </p>
              <ul className="feature-list">
                <li>Professional HTML templates</li>
                <li>Gradient headers</li>
                <li>CTA buttons</li>
                <li>Mobile responsive</li>
              </ul>
            </div>

            {/* Professional Email Delivery */}
            <div className="feature-card">
              <div className="feature-icon">📧</div>
              <h2 className="feature-title">Professional Email Delivery</h2>
              <p className="feature-desc">
                Send emails with professional delivery. High deliverability rates and reliable infrastructure.
              </p>
              <ul className="feature-list">
                <li>Professional SMTP service</li>
                <li>High deliverability</li>
                <li>Reliable infrastructure</li>
                <li>Fast delivery</li>
              </ul>
            </div>

            {/* Analytics Dashboard */}
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h2 className="feature-title">Analytics Dashboard</h2>
              <p className="feature-desc">
                Comprehensive analytics showing open rates, click rates, and engagement metrics for all your email campaigns.
              </p>
              <ul className="feature-list">
                <li>Open rate statistics</li>
                <li>Click-through rates</li>
                <li>Recent email activity</li>
                <li>Performance insights</li>
              </ul>
            </div>

            {/* Contact Management */}
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h2 className="feature-title">Contact Management</h2>
              <p className="feature-desc">
                Organize your contacts and leads in one place. Easy to add, manage, and reach out to your entire network.
              </p>
              <ul className="feature-list">
                <li>Import contacts</li>
                <li>Organize by groups</li>
                <li>Track interactions</li>
                <li>Quick access</li>
              </ul>
            </div>
          </div>

          {/* CTA Section */}
          <div className="cta-section">
            <h2 className="cta-title">
              Ready to transform your email marketing?
            </h2>
            <p className="cta-text">
              Join thousands of businesses using ClipVoBooster to send better emails and convert more prospects.
            </p>
            <Link href="/api/auth/google" className="cta-button">
              Start Sending Free
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
