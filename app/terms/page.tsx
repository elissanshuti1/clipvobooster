"use client";

import Link from "next/link";

export default function TermsPage() {
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
            <h1 className="legal-title">Terms of Service</h1>
            <p className="legal-updated">Last updated: March 17, 2026</p>
          </div>

          <div className="legal-content">
            <div className="legal-section">
              <h2 className="legal-heading">1. Agreement to Terms</h2>
              <p className="legal-text">
                By accessing or using ClipVoBooster ("the Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">2. Description of Service</h2>
              <p className="legal-text">
                ClipVoBooster is an AI-powered email marketing platform that helps businesses create, send, and track professional emails. The service includes:
              </p>
              <ul className="legal-list">
                <li>AI-generated email content creation</li>
                <li>Email sending via Gmail integration</li>
                <li>Real-time email tracking (opens and clicks)</li>
                <li>Analytics and reporting dashboard</li>
                <li>Contact management</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">3. User Accounts</h2>
              <p className="legal-text">
                To use the Service, you must create an account by connecting your Google account. You are responsible for:
              </p>
              <ul className="legal-list">
                <li>Maintaining the security of your account</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
              </ul>
              <p className="legal-text">
                We reserve the right to terminate accounts at our discretion for violations of these terms.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">4. Acceptable Use</h2>
              <p className="legal-text">
                You agree not to use the Service to:
              </p>
              <ul className="legal-list">
                <li>Send spam, unsolicited commercial emails, or bulk messages</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on others' intellectual property rights</li>
                <li>Transmit harmful, offensive, or malicious content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use the service for fraudulent or deceptive purposes</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">5. Email Compliance</h2>
              <p className="legal-text">
                You are responsible for ensuring your emails comply with all applicable laws, including:
              </p>
              <ul className="legal-list">
                <li>CAN-SPAM Act (United States)</li>
                <li>GDPR (European Union)</li>
                <li>CASL (Canada)</li>
                <li>Other applicable anti-spam and privacy laws</li>
              </ul>
              <p className="legal-text">
                This includes obtaining proper consent, providing opt-out mechanisms, and including accurate sender information.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">6. Payment and Billing</h2>
              <p className="legal-text">
                The Service offers both free and paid plans. For paid subscriptions:
              </p>
              <ul className="legal-list">
                <li>Fees are billed in advance on a monthly or one-time basis</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>We reserve the right to change pricing with 30 days notice</li>
                <li>You must provide accurate and complete payment information</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">7. Intellectual Property</h2>
              <p className="legal-text">
                The Service and its original content, features, and functionality are owned by ClipVoBooster and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
              <p className="legal-text">
                You retain ownership of content you create using the Service, but grant us a license to use, store, and process that content to provide the Service.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">8. Disclaimer of Warranties</h2>
              <p className="legal-text">
                The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that:
              </p>
              <ul className="legal-list">
                <li>The Service will be uninterrupted, secure, or error-free</li>
                <li>Defects will be corrected</li>
                <li>The Service will meet your requirements</li>
                <li>Email delivery rates or open rates are guaranteed</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">9. Limitation of Liability</h2>
              <p className="legal-text">
                To the maximum extent permitted by law, ClipVoBooster shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including:
              </p>
              <ul className="legal-list">
                <li>Loss of profits, data, or business opportunities</li>
                <li>Email delivery failures or delays</li>
                <li>Account suspensions by third-party providers</li>
                <li>Any damages arising from your use of the Service</li>
              </ul>
              <p className="legal-text">
                Our total liability shall not exceed the amount you paid for the Service in the 12 months preceding the claim.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">10. Termination</h2>
              <p className="legal-text">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">11. Changes to Terms</h2>
              <p className="legal-text">
                We reserve the right to modify these terms at any time. We will notify users of material changes via email or through the Service. Your continued use of the Service after changes constitutes acceptance of the new terms.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">12. Governing Law and Jurisdiction</h2>
              <p className="legal-text">
                These Terms shall be governed by and construed in accordance with the laws of the Republic of Rwanda, without regard to conflict of law provisions.
              </p>
              <p className="legal-text">
                Any disputes arising out of or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the courts located in Kigali, Rwanda.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">13. Dispute Resolution</h2>
              <p className="legal-text">
                Before filing any legal action, you agree to first attempt to resolve disputes by contacting us at trivora00@gmail.com. We will attempt to resolve the dispute informally within 30 days of receiving notice.
              </p>
              <p className="legal-text">
                If informal resolution fails, disputes shall be resolved through binding arbitration in accordance with the arbitration rules of the Rwanda Arbitration Center. The arbitration shall be conducted in English, and the decision shall be final and binding.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">14. Class Action Waiver</h2>
              <p className="legal-text">
                You agree to resolve any dispute on an individual basis and waive any right to participate in class actions, class arbitrations, or representative actions against ClipVoBooster.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">15. Contact Information</h2>
              <p className="legal-text">
                For questions about these Terms of Service, please contact us at:
              </p>
              <p className="legal-text">
                <strong>Company:</strong> ClipVoBooster<br />
                <strong>Email:</strong> <a href="mailto:trivora00@gmail.com" style={{ color: '#6366f1', textDecoration: 'none' }}>trivora00@gmail.com</a><br />
                <strong>Support:</strong> <Link href="/support" style={{ color: '#6366f1', textDecoration: 'none' }}>Visit Support Center</Link>
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">13. Contact Information</h2>
              <p className="legal-text">
                For questions about these Terms of Service, please contact us at:
              </p>
              <p className="legal-text">
                Email: trivora00@gmail.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
