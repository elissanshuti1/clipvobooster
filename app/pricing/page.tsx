"use client";

import Link from "next/link";

export default function PricingPage() {
  return (
    <>
      <style>{`
        :root {
          --bg: #08090d; --bg1: #0e1018; --bg2: #12151f; --bg3: #181c27;
          --line: rgba(255,255,255,0.07); --line2: rgba(255,255,255,0.13);
          --text: #dde1e9; --muted: #5a6373; --dim: #8b95a5; --white: #ffffff;
        }
        .pricing-page {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          padding: 120px 24px 80px;
        }
        .pricing-wrap {
          max-width: 1120px;
          margin: 0 auto;
        }
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
        .pricing-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 1120px;
          margin: 0 auto 80px;
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
        .pricing-card-badge {
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
        .pricing-btn.secondary {
          background: var(--bg3);
          color: var(--text);
          border: 1px solid var(--line);
        }
        .pricing-btn.secondary:hover {
          background: var(--bg2);
          border-color: var(--line2);
        }
        @media (max-width: 920px) {
          .pricing-cards {
            grid-template-columns: 1fr;
          }
          .pricing-page {
            padding: 100px 16px 60px;
          }
        }
      `}</style>

      <div className="pricing-page">
        <div className="pricing-wrap">
          {/* Header */}
          <div className="pricing-header">
            <h1 className="pricing-title">
              Invest in Growth,<br />Not Features.
            </h1>
            <p className="pricing-subtitle">
              Choose the plan that fits your business. All plans include unlimited AI generation and real-time tracking.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="pricing-cards">
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
              <Link href="/api/auth/google" className="pricing-btn primary">
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="pricing-card featured">
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
              <Link href="/api/auth/google" className="pricing-btn primary">
                Get Started
              </Link>
            </div>

            {/* Lifetime Plan */}
            <div className="pricing-card">
              <h3 className="pricing-name">Lifetime</h3>
              <div className="pricing-price">
                $60
                <span style={{ fontSize: 16, color: 'var(--muted)' }}>/one-time</span>
              </div>
              <p className="pricing-desc">Pay once, use forever. All features, unlimited access. No monthly fees.</p>
              <ul className="pricing-features">
                <li>
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Unlimited emails
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
              <Link href="/api/auth/google" className="pricing-btn primary">
                Get Lifetime Access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
