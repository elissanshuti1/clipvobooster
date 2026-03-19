"use client";

import Link from "next/link";
import Script from "next/script";

export default function AboutClient() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ClipVoBooster",
    "url": "https://clipvo.site",
    "logo": "https://clipvo.site/favicon.png",
    "description": "AI-powered email marketing platform that helps businesses create, send, and track professional emails.",
    "foundingDate": "2025",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Kigali",
      "addressCountry": "Rwanda"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "trivora00@gmail.com",
      "contactType": "customer service"
    },
    "sameAs": [
      "https://twitter.com/clipvobooster"
    ]
  };

  return (
    <>
      <Script
        id="organization-schema"
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
        .about-page {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          padding: 120px 24px 80px;
        }
        .about-wrap {
          max-width: 800px;
          margin: 0 auto;
        }
        .about-header {
          margin-bottom: 48px;
        }
        .about-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(36px, 4vw, 48px);
          font-weight: 400;
          color: var(--white);
          margin-bottom: 16px;
        }
        .about-subtitle {
          font-size: 16px;
          color: var(--muted);
          line-height: 1.7;
        }
        .about-section {
          margin-bottom: 40px;
        }
        .about-section:last-child {
          margin-bottom: 0;
        }
        .about-heading {
          font-family: 'Instrument Serif', serif;
          font-size: 24px;
          font-weight: 400;
          color: var(--white);
          margin-bottom: 16px;
        }
        .about-text {
          font-size: 15px;
          line-height: 1.8;
          color: var(--text);
          margin-bottom: 16px;
        }
        .about-text:last-child {
          margin-bottom: 0;
        }
        .about-list {
          list-style: disc;
          padding-left: 24px;
          margin: 16px 0;
        }
        .about-list li {
          font-size: 15px;
          line-height: 1.8;
          color: var(--text);
          margin-bottom: 8px;
        }
        .about-cta {
          background: var(--bg1);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 40px;
          text-align: center;
          margin-top: 48px;
        }
        .about-cta-title {
          font-family: 'Instrument Serif', serif;
          font-size: 28px;
          color: var(--white);
          margin-bottom: 12px;
        }
        .about-cta-text {
          font-size: 15px;
          color: var(--muted);
          margin-bottom: 24px;
        }
        .about-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
        }
        .about-cta-btn:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }
        @media (max-width: 768px) {
          .about-page {
            padding: 100px 16px 60px;
          }
        }
      `}</style>

      <div className="about-page">
        <div className="about-wrap">
          <div className="about-header">
            <h1 className="about-title">About ClipVoBooster</h1>
            <p className="about-subtitle">
              We're on a mission to make professional email marketing accessible to everyone.
            </p>
          </div>

          <div className="about-section">
            <h2 className="about-heading">Our Story</h2>
            <p className="about-text">
              ClipVoBooster was born from a simple idea: businesses of all sizes deserve access to powerful email marketing tools without the complexity and high costs.
            </p>
            <p className="about-text">
              Based in Kigali, Rwanda, we're building a global platform that helps solopreneurs, small businesses, and enterprises connect with their audience through intelligent, AI-powered email campaigns.
            </p>
          </div>

          <div className="about-section">
            <h2 className="about-heading">What We Do</h2>
            <p className="about-text">
              We provide an all-in-one email marketing platform that combines artificial intelligence with intuitive design. Our tool helps you:
            </p>
            <ul className="about-list">
              <li>Write professional emails using AI</li>
              <li>Send campaigns through your Gmail account</li>
              <li>Track opens, clicks, and engagement in real-time</li>
              <li>Manage contacts and organize your audience</li>
              <li>Analyze performance with detailed analytics</li>
            </ul>
          </div>

          <div className="about-section">
            <h2 className="about-heading">Our Values</h2>
            <p className="about-text">
              <strong>Simplicity:</strong> We believe powerful tools should be easy to use. No steep learning curves or complicated setups.
            </p>
            <p className="about-text">
              <strong>Transparency:</strong> Clear pricing, honest communication, and no hidden fees. What you see is what you get.
            </p>
            <p className="about-text">
              <strong>Innovation:</strong> We continuously improve our AI and add features that matter to our users.
            </p>
            <p className="about-text">
              <strong>Accessibility:</strong> Quality email marketing should be affordable for businesses of all sizes.
            </p>
          </div>

          <div className="about-section">
            <h2 className="about-heading">Contact Us</h2>
            <p className="about-text">
              Have questions or feedback? We'd love to hear from you.
            </p>
            <p className="about-text">
              <strong>Email:</strong> <a href="mailto:trivora00@gmail.com" style={{ color: '#6366f1', textDecoration: 'none' }}>trivora00@gmail.com</a><br />
              <strong>Support:</strong> <Link href="/support" style={{ color: '#6366f1', textDecoration: 'none' }}>Visit Support Center</Link>
            </p>
          </div>

          <div className="about-cta">
            <h2 className="about-cta-title">Ready to Get Started?</h2>
            <p className="about-cta-text">
              Join thousands of businesses using ClipVoBooster to send better emails.
            </p>
            <Link href="/api/auth/google" className="about-cta-btn">
              Start Free Today
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
