"use client";

import Link from "next/link";

export default function RefundPage() {
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
            <h1 className="legal-title">Refund & Cancellation Policy</h1>
            <p className="legal-updated">Last updated: March 17, 2026</p>
          </div>

          <div className="legal-content">
            <div className="legal-section">
              <h2 className="legal-heading">1. Overview</h2>
              <p className="legal-text">
                At ClipVoBooster, we want you to be completely satisfied with our service. This Refund & Cancellation Policy explains your rights and our procedures regarding refunds and cancellations.
              </p>
              <p className="legal-text">
                By using our service, you agree to this refund policy.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">2. Free Plan</h2>
              <p className="legal-text">
                Our Free Plan is available at no cost and includes:
              </p>
              <ul className="legal-list">
                <li>Unlimited AI email generation</li>
                <li>Basic email sending features</li>
                <li>Open and click tracking</li>
                <li>Basic analytics</li>
              </ul>
              <p className="legal-text">
                No payment is required for the Free Plan, and no refunds are applicable.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">3. Paid Subscription Plans</h2>
              
              <h3 style={{ fontSize: 18, color: 'var(--white)', marginTop: 24, marginBottom: 12 }}>3.1 Professional Plan ($29/month)</h3>
              <p className="legal-text">
                The Professional Plan is billed monthly. You can cancel at any time, and your subscription will remain active until the end of the current billing period.
              </p>

              <h3 style={{ fontSize: 18, color: 'var(--white)', marginTop: 24, marginBottom: 12 }}>3.2 Lifetime Plan ($60 one-time)</h3>
              <p className="legal-text">
                The Lifetime Plan is a one-time payment for unlimited access to all features. This is a non-recurring charge.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">4. Refund Eligibility</h2>
              <p className="legal-text">
                We offer refunds under the following conditions:
              </p>
              
              <h3 style={{ fontSize: 18, color: 'var(--white)', marginTop: 24, marginBottom: 12 }}>4.1 14-Day Money-Back Guarantee</h3>
              <p className="legal-text">
                For Professional Plan subscriptions, we offer a 14-day money-back guarantee from the date of purchase. If you're not satisfied with the service, contact us within 14 days for a full refund.
              </p>

              <h3 style={{ fontSize: 18, color: 'var(--white)', marginTop: 24, marginBottom: 12 }}>4.2 Lifetime Plan Refunds</h3>
              <p className="legal-text">
                Lifetime Plan purchases are eligible for refunds within 7 days of purchase, provided:
              </p>
              <ul className="legal-list">
                <li>The service has not been heavily used (less than 100 emails sent)</li>
                <li>No violation of Terms of Service has occurred</li>
                <li>The refund request is made within 7 days of purchase</li>
              </ul>

              <h3 style={{ fontSize: 18, color: 'var(--white)', marginTop: 24, marginBottom: 12 }}>4.3 Service Issues</h3>
              <p className="legal-text">
                If you experience technical issues that prevent you from using the service, we will:
              </p>
              <ul className="legal-list">
                <li>Attempt to resolve the issue within 48 hours</li>
                <li>Provide a prorated refund if the issue cannot be resolved</li>
                <li>Offer account credits as an alternative</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">5. Non-Refundable Situations</h2>
              <p className="legal-text">
                Refunds will not be provided in the following cases:
              </p>
              <ul className="legal-list">
                <li>Change of mind after 14 days (Professional Plan) or 7 days (Lifetime Plan)</li>
                <li>Violation of our Terms of Service</li>
                <li>Account suspension due to spam or abuse</li>
                <li>Failure to use the service (unused features or credits)</li>
                <li>Partial usage of a billing period</li>
                <li>Promotional or discounted plans (unless required by law)</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">6. How to Request a Refund</h2>
              <p className="legal-text">
                To request a refund, follow these steps:
              </p>
              <ol style={{ paddingLeft: 24, color: 'var(--text)', lineHeight: 1.8 }}>
                <li>Email us at support@clipvo.site</li>
                <li>Include your account email and order details</li>
                <li>Explain the reason for your refund request</li>
                <li>Our team will respond within 2-3 business days</li>
              </ol>
              <p className="legal-text">
                Approved refunds will be processed to your original payment method within 5-10 business days.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">7. Cancellation Policy</h2>
              
              <h3 style={{ fontSize: 18, color: 'var(--white)', marginTop: 24, marginBottom: 12 }}>7.1 Professional Plan Cancellation</h3>
              <p className="legal-text">
                You can cancel your Professional Plan subscription at any time:
              </p>
              <ul className="legal-list">
                <li>Go to Dashboard → Settings → Subscription</li>
                <li>Click "Cancel Subscription"</li>
                <li>Your account will remain active until the end of the billing period</li>
                <li>You will not be charged for subsequent periods</li>
                <li>No partial refunds for unused days</li>
              </ul>

              <h3 style={{ fontSize: 18, color: 'var(--white)', marginTop: 24, marginBottom: 12 }}>7.2 Account Deletion</h3>
              <p className="legal-text">
                You can delete your account at any time:
              </p>
              <ul className="legal-list">
                <li>Contact support@clipvo.site</li>
                <li>We will delete your data within 30 days</li>
                <li>Cancellation is immediate and irreversible</li>
                <li>No refunds for deleted accounts (subject to refund policy above)</li>
              </ul>

              <h3 style={{ fontSize: 18, color: 'var(--white)', marginTop: 24, marginBottom: 12 }}>7.3 Lifetime Plan</h3>
              <p className="legal-text">
                The Lifetime Plan does not require cancellation as it is a one-time purchase with no recurring charges.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">8. Billing Information</h2>
              <p className="legal-text">
                All payments are processed securely through our payment processor. We accept:
              </p>
              <ul className="legal-list">
                <li>Credit cards (Visa, MasterCard, American Express)</li>
                <li>Debit cards</li>
                <li>Digital wallets (where available)</li>
              </ul>
              <p className="legal-text">
                Billing occurs:
              </p>
              <ul className="legal-list">
                <li><strong>Professional Plan:</strong> Monthly on the same date as initial subscription</li>
                <li><strong>Lifetime Plan:</strong> One-time charge at purchase</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">9. Price Changes</h2>
              <p className="legal-text">
                We reserve the right to change our pricing at any time. Price changes will:
              </p>
              <ul className="legal-list">
                <li>Be communicated 30 days in advance</li>
                <li>Not affect existing subscriptions until renewal</li>
                <li>Allow you to cancel before the new price takes effect</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">10. Taxes</h2>
              <p className="legal-text">
                Prices may not include applicable taxes (VAT, GST, sales tax). Taxes will be calculated and added at checkout based on your location.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">11. Disputes</h2>
              <p className="legal-text">
                If you have a billing dispute:
              </p>
              <ul className="legal-list">
                <li>Contact us first at support@clipvo.site</li>
                <li>We will investigate and respond within 5 business days</li>
                <li>If unresolved, you may contact your payment provider</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">12. Modifications to This Policy</h2>
              <p className="legal-text">
                We may update this Refund & Cancellation Policy at any time. Changes will be:
              </p>
              <ul className="legal-list">
                <li>Posted on this page</li>
                <li>Effective immediately upon posting</li>
                <li>Applicable to purchases made after the update</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">13. Contact Information</h2>
              <p className="legal-text">
                For questions about refunds, cancellations, or billing, contact us at:
              </p>
              <p className="legal-text">
                Email: support@clipvo.site
              </p>
              <p className="legal-text">
                We respond to all refund requests within 2-3 business days.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-heading">14. Legal Requirements</h2>
              <p className="legal-text">
                This policy complies with:
              </p>
              <ul className="legal-list">
                <li>Consumer Rights Act (UK/EU)</li>
                <li>FTC regulations (United States)</li>
                <li>Applicable local consumer protection laws</li>
              </ul>
              <p className="legal-text">
                If any provision of this policy is found to be unenforceable, the remaining provisions will remain in full effect.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
