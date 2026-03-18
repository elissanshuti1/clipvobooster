"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <>
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
        .about-card {
          background: var(--bg1);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 32px;
          margin: 24px 0;
        }
        .about-card-title {
          font-family: 'Instrument Serif', serif;
          font-size: 20px;
          color: var(--white);
          margin-bottom: 12px;
        }
        .about-card-text {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.7;
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
        .about-link {
          color: #6366f1;
          text-decoration: none;
        }
        .about-link:hover {
          text-decoration: underline;
        }
        .mission-box {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05));
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 16px;
          padding: 32px;
          margin: 32px 0;
        }
        .mission-box-title {
          font-family: 'Instrument Serif', serif;
          font-size: 22px;
          color: var(--white);
          margin-bottom: 12px;
        }
        .mission-box-text {
          font-size: 15px;
          color: var(--muted);
          line-height: 1.8;
        }
        @media (max-width: 768px) {
          .about-page {
            padding: 100px 16px 60px;
          }
          .about-card {
            padding: 24px;
          }
        }
      `}</style>

      <div className="about-page">
        <div className="about-wrap">
          {/* Header */}
          <div className="about-header">
            <h1 className="about-title">About ClipVoBooster</h1>
            <p className="about-subtitle">
              Empowering creators and businesses with AI-powered email marketing tools.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="mission-box">
            <h2 className="mission-box-title">Our Mission</h2>
            <p className="mission-box-text">
              At ClipVoBooster, we believe every creator and business deserves access to powerful, 
              affordable email marketing tools. Our mission is to democratize email marketing by 
              combining AI-powered content generation with intuitive design, making it easy for 
              anyone to create professional campaigns that drive real results.
            </p>
          </div>

          {/* What We Do */}
          <div className="about-section">
            <h2 className="about-heading">What We Do</h2>
            <p className="about-text">
              ClipVoBooster is an AI-powered email marketing platform designed for creators, 
              solopreneurs, and small businesses. We help you create, send, and track professional 
              email campaigns that actually get opened, read, and clicked.
            </p>
            <p className="about-text">
              Our platform combines advanced AI technology with real-time analytics to help you:
            </p>
            <ul className="about-list">
              <li>Generate high-converting email content with AI assistance</li>
              <li>Build and manage your contact lists effortlessly</li>
              <li>Track opens, clicks, and engagement in real-time</li>
              <li>Create beautiful emails without any design skills</li>
              <li>Automate your email marketing workflows</li>
            </ul>
          </div>

          {/* Our Story */}
          <div className="about-section">
            <h2 className="about-heading">Our Story</h2>
            <p className="about-text">
              ClipVoBooster was founded by the ClipVoBooster Team with a simple goal: make email 
              marketing accessible to everyone. We saw creators and small businesses struggling 
              with expensive, complicated email tools that required hours of setup and learning.
            </p>
            <p className="about-text">
              We built ClipVoBooster to change that. By leveraging modern AI technology and focusing 
              on simplicity, we've created a platform that anyone can use—no marketing degree required.
            </p>
          </div>

          {/* Business & Billing */}
          <div className="about-section">
            <h2 className="about-heading">Business & Billing</h2>
            <div className="about-card">
              <h3 className="about-card-title">Company Information</h3>
              <p className="about-card-text">
                <strong>Company:</strong> ClipVoBooster<br />
                <strong>Email:</strong> <a href="mailto:trivora00@gmail.com" className="about-link">trivora00@gmail.com</a><br />
                <strong>Support:</strong> <Link href="/support" className="about-link">Visit Support Center</Link>
              </p>
            </div>
            <p className="about-text">
              Payments for premium subscriptions are securely processed by our payment partners. 
              All major credit cards are accepted, and transactions are protected with 
              bank-level security.
            </p>
            <p className="about-text">
              Our legal pages (Terms of Service, Privacy Policy, and Refund Policy) are 
              published and accessible from the navigation menu for transparency and 
              verification purposes.
            </p>
          </div>

          {/* Contact */}
          <div className="about-section">
            <h2 className="about-heading">Get in Touch</h2>
            <p className="about-text">
              Have questions? We're here to help! Our support team is available 
              Monday through Friday, 9AM - 6PM EAT.
            </p>
            <div className="about-card">
              <h3 className="about-card-title">Contact Information</h3>
              <p className="about-card-text">
                <strong>General Inquiries:</strong> <a href="mailto:trivora00@gmail.com" className="about-link">trivora00@gmail.com</a><br />
                <strong>Billing Support:</strong> <a href="mailto:trivora00@gmail.com" className="about-link">trivora00@gmail.com</a><br />
                <strong>Support Center:</strong> <Link href="/support" className="about-link">Visit Support</Link>
              </p>
            </div>
            <p className="about-text">
              We typically respond to all inquiries within 24 hours during business days.
            </p>
          </div>

          {/* Back to Home */}
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link href="/" style={{ color: "#6366f1", textDecoration: "none", fontSize: 14 }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
