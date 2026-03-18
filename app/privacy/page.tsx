"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <>
      <style>{`
        :root {
          --bg: #08090d; --bg1: #0e1018; --bg2: #12151f; --bg3: #181c27;
          --line: rgba(255,255,255,0.07); --line2: rgba(255,255,255,0.13);
          --text: #dde1e9; --muted: #5a6373; --dim: #8b95a5; --white: #ffffff;
        }
        .legal-page {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          padding: 120px 24px 80px;
        }
        .legal-wrap {
          max-width: 800px;
          margin: 0 auto;
        }
        .legal-header {
          margin-bottom: 64px;
        }
        .legal-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(36px, 4vw, 48px);
          font-weight: 400;
          color: var(--white);
          margin-bottom: 16px;
        }
        .legal-updated {
          font-size: 14px;
          color: var(--muted);
        }
        .legal-content {
          background: var(--bg1);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 40px;
        }
        .legal-section {
          margin-bottom: 40px;
        }
        .legal-section:last-child {
          margin-bottom: 0;
        }
        .legal-heading {
          font-family: 'Instrument Serif', serif;
          font-size: 24px;
          font-weight: 400;
          color: var(--white);
          margin-bottom: 16px;
        }
        .legal-text {
          font-size: 15px;
          line-height: 1.8;
          color: var(--text);
          margin-bottom: 16px;
        }
        .legal-text:last-child {
          margin-bottom: 0;
        }
        .legal-list {
          list-style: disc;
          padding-left: 24px;
          margin: 16px 0;
        }
        .legal-list li {
          font-size: 15px;
          line-height: 1.8;
          color: var(--text);
          margin-bottom: 8px;
        }
        @media (max-width: 768px) {
          .legal-content {
            padding: 24px;
          }
          .legal-page {
            padding: 100px 16px 60px;
          }
        }
      `}</style>

      <div className="legal-page">
        <div className="legal-wrap">
          <div className="legal-header">
            <h1 className="legal-title">Privacy Policy</h1>
            <p className="legal-updated">Last updated: March 17, 2026</p>
          </div>

          <div className="legal-content">
            <div className="legal-section">
              <h2 className="legal-heading">1. Introduction</h2>
              <p className="legal-text">
                ClipVoBooster ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our email marketing platform (the "Service").
              </p>
              <p className="legal-text">
                By using the Service, you consent to the data practices described in this policy.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">2. Data Controller</h2>
              <p className="legal-text">
                For purposes of applicable data protection laws (including the GDPR), the data controller is:
              </p>
              <div style={{ background: 'var(--bg2)', padding: '20px', borderRadius: '12px', margin: '16px 0' }}>
                <p className="legal-text" style={{ marginBottom: '8px' }}>
                  <strong>Company:</strong> ClipVoBooster
                </p>
                <p className="legal-text" style={{ marginBottom: '8px' }}>
                  <strong>Data Controller:</strong> ClipVoBooster Team
                </p>
                <p className="legal-text" style={{ marginBottom: '8px' }}>
                  <strong>Email:</strong> <a href="mailto:trivora00@gmail.com" style={{ color: '#6366f1', textDecoration: 'none' }}>trivora00@gmail.com</a>
                </p>
                <p className="legal-text" style={{ marginBottom: 0 }}>
                  <strong>Support:</strong> <Link href="/support" style={{ color: '#6366f1', textDecoration: 'none' }}>Visit Support Center</Link>
                </p>
              </div>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">3. Information We Collect</h2>

              <h3 style={{ fontSize: 18, color: 'var(--white)', marginTop: 24, marginBottom: 12 }}>3.1 Personal Information</h3>
              <p className="legal-text">
                When you create an account, we collect:
              </p>
              <ul className="legal-list">
                <li>Name and email address (from your Google account)</li>
                <li>Google account ID for authentication</li>
                <li>Profile information you choose to provide (company name, website, project description)</li>
                <li>Contact information for your email recipients</li>
              </ul>

              <h3 style={{ fontSize: 18, color: 'var(--white)', marginTop: 24, marginBottom: 12 }}>3.2 Usage Information</h3>
              <p className="legal-text">
                We automatically collect:
              </p>
              <ul className="legal-list">
                <li>Email sending activity and history</li>
                <li>Email open and click tracking data</li>
                <li>Analytics and performance metrics</li>
                <li>Device and browser information</li>
                <li>IP address and access timestamps</li>
              </ul>

              <h3 style={{ fontSize: 18, color: 'var(--white)', marginTop: 24, marginBottom: 12 }}>3.3 Gmail API Information</h3>
              <p className="legal-text">
                When you connect your Gmail account, we access:
              </p>
              <ul className="legal-list">
                <li>Your email address and basic profile information</li>
                <li>Permission to send emails on your behalf</li>
                <li>Gmail API tokens for authentication (stored securely)</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">4. How We Use Your Information</h2>
              <p className="legal-text">
                We use the information we collect to:
              </p>
              <ul className="legal-list">
                <li>Provide, maintain, and improve the Service</li>
                <li>Send emails through your Gmail account</li>
                <li>Track email performance (opens, clicks)</li>
                <li>Generate AI-powered email content</li>
                <li>Provide customer support</li>
                <li>Send service-related notifications</li>
                <li>Prevent fraud and abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">5. Information Sharing</h2>
              <p className="legal-text">
                We do not sell, trade, or rent your personal information to third parties. We may share information in the following situations:
              </p>
              <ul className="legal-list">
                <li><strong>Service Providers:</strong> With vendors who perform services on our behalf (hosting, analytics, customer support)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">6. Data Retention</h2>
              <p className="legal-text">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="legal-list">
                <li>Provide the Service to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
              </ul>
              <p className="legal-text">
                You can request deletion of your account and data at any time by contacting trivora00@gmail.com.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">7. Data Security</h2>
              <p className="legal-text">
                We implement appropriate technical and organizational measures to protect your information:
              </p>
              <ul className="legal-list">
                <li>Encryption in transit (HTTPS/TLS)</li>
                <li>Secure storage of authentication tokens</li>
                <li>Regular security assessments</li>
                <li>Access controls and authentication</li>
                <li>MongoDB Atlas with encryption at rest</li>
              </ul>
              <p className="legal-text">
                However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">8. Your Rights</h2>
              <p className="legal-text">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="legal-list">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your information</li>
                <li>Export your data in a portable format</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent for data processing</li>
              </ul>
              <p className="legal-text">
                To exercise these rights, contact us at trivora00@gmail.com.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">9. Cookies and Tracking</h2>
              <p className="legal-text">
                We use cookies and similar technologies to:
              </p>
              <ul className="legal-list">
                <li>Authenticate your session</li>
                <li>Remember your preferences</li>
                <li>Analyze usage patterns</li>
                <li>Improve the Service</li>
              </ul>
              <p className="legal-text">
                You can control cookies through your browser settings, but disabling cookies may limit your ability to use the Service.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">10. Third-Party Services</h2>
              <p className="legal-text">
                The Service integrates with third-party services that have their own privacy policies:
              </p>
              <ul className="legal-list">
                <li><strong>Google/Gmail:</strong> For authentication and email sending</li>
                <li><strong>MongoDB Atlas:</strong> For data storage</li>
                <li><strong>OpenRouter AI:</strong> For AI email generation</li>
                <li><strong>Vercel:</strong> For hosting</li>
              </ul>
              <p className="legal-text">
                We are not responsible for the privacy practices of these third parties.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">11. International Data Transfers</h2>
              <p className="legal-text">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place, such as Standard Contractual Clauses, to protect your data.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">12. Children's Privacy</h2>
              <p className="legal-text">
                The Service is not intended for children under 18 years of age. We do not knowingly collect personal information from children. If we discover that we have collected information from a child, we will delete it immediately.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">13. Changes to This Policy</h2>
              <p className="legal-text">
                We may update this Privacy Policy from time to time. We will notify you of material changes by:
              </p>
              <ul className="legal-list">
                <li>Posting the new policy on this page</li>
                <li>Updating the "Last updated" date</li>
                <li>Sending an email notification (for significant changes)</li>
              </ul>
              <p className="legal-text">
                Your continued use of the Service after changes constitutes acceptance of the updated policy.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">14. GDPR Compliance (EU Users)</h2>
              <p className="legal-text">
                For users in the European Economic Area, we process your data based on:
              </p>
              <ul className="legal-list">
                <li>Your consent</li>
                <li>Performance of our contract with you</li>
                <li>Legitimate business interests</li>
                <li>Legal obligations</li>
              </ul>
              <p className="legal-text">
                You have the right to lodge a complaint with your local data protection authority.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">15. CCPA Compliance (California Users)</h2>
              <p className="legal-text">
                California residents have the right to:
              </p>
              <ul className="legal-list">
                <li>Know what personal information is collected</li>
                <li>Know if personal information is sold or disclosed</li>
                <li>Opt-out of the sale of personal information</li>
                <li>Request deletion of personal information</li>
                <li>Non-discrimination for exercising privacy rights</li>
              </ul>
              <p className="legal-text">
                We do not sell your personal information.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">16. Contact Us</h2>
              <p className="legal-text">
                For questions about this Privacy Policy or our data practices, contact us at:
              </p>
              <div style={{ background: 'var(--bg2)', padding: '20px', borderRadius: '12px', margin: '16px 0' }}>
                <p className="legal-text" style={{ marginBottom: '8px' }}>
                  <strong>Company:</strong> ClipVoBooster
                </p>
                <p className="legal-text" style={{ marginBottom: '8px' }}>
                  <strong>Email:</strong> <a href="mailto:trivora00@gmail.com" style={{ color: '#6366f1', textDecoration: 'none' }}>trivora00@gmail.com</a>
                </p>
                <p className="legal-text" style={{ marginBottom: '8px' }}>
                  <strong>Support:</strong> <Link href="/support" style={{ color: '#6366f1', textDecoration: 'none' }}>Visit Support Center</Link>
                </p>
                <p className="legal-text" style={{ marginBottom: 0 }}>
                  <strong>Data Protection Officer:</strong> ClipVoBooster Team
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
