"use client";

import { useState } from "react";
import Link from "next/link";

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch (err) {
      setSubmitStatus("error");
    }

    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <style>{`
        :root {
          --bg: #08090d; --bg1: #0e1018; --bg2: #12151f; --bg3: #181c27;
          --line: rgba(255,255,255,0.07); --line2: rgba(255,255,255,0.13);
          --text: #dde1e9; --muted: #5a6373; --dim: #8b95a5; --white: #ffffff;
        }
        .support-page {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          padding: 120px 24px 80px;
        }
        .support-wrap {
          max-width: 900px;
          margin: 0 auto;
        }
        .support-header {
          text-align: center;
          margin-bottom: 64px;
        }
        .support-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(36px, 4vw, 48px);
          font-weight: 400;
          color: var(--white);
          margin-bottom: 16px;
        }
        .support-subtitle {
          font-size: 16px;
          color: var(--muted);
          line-height: 1.7;
          max-width: 500px;
          margin: 0 auto;
        }
        .support-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-bottom: 64px;
        }
        .support-card {
          background: var(--bg1);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 32px;
        }
        .support-card-icon {
          width: 48;
          height: 48;
          background: rgba(99, 102, 241, 0.1);
          border-radius: 12px;
          display: grid;
          place-items: center;
          margin-bottom: 20px;
        }
        .support-card-title {
          font-family: 'Instrument Serif', serif;
          font-size: 22px;
          color: var(--white);
          margin-bottom: 12px;
        }
        .support-card-desc {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.7;
          margin-bottom: 16px;
        }
        .support-card-link {
          font-size: 14px;
          color: #6366f1;
          text-decoration: none;
          font-weight: 500;
        }
        .support-card-link:hover {
          text-decoration: underline;
        }
        .support-info {
          background: var(--bg1);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 40px;
          margin-bottom: 64px;
        }
        .support-info-title {
          font-family: 'Instrument Serif', serif;
          font-size: 24px;
          color: var(--white);
          margin-bottom: 24px;
        }
        .support-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
        }
        .support-info-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .support-info-label {
          font-size: 13px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .support-info-value {
          font-size: 15px;
          color: var(--text);
          font-weight: 400;
        }
        .support-info-value a {
          color: #6366f1;
          text-decoration: none;
        }
        .support-info-value a:hover {
          text-decoration: underline;
        }
        .faq-section {
          margin-bottom: 64px;
        }
        .faq-title {
          font-family: 'Instrument Serif', serif;
          font-size: 28px;
          color: var(--white);
          margin-bottom: 32px;
          text-align: center;
        }
        .faq-grid {
          display: grid;
          gap: 16px;
        }
        .faq-item {
          background: var(--bg1);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 24px;
        }
        .faq-question {
          font-size: 15px;
          font-weight: 600;
          color: var(--white);
          margin-bottom: 12px;
        }
        .faq-answer {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.7;
        }
        .contact-form {
          background: var(--bg1);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 40px;
        }
        .contact-form-title {
          font-family: 'Instrument Serif', serif;
          font-size: 24px;
          color: var(--white);
          margin-bottom: 12px;
        }
        .contact-form-desc {
          font-size: 14px;
          color: var(--muted);
          margin-bottom: 32px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-label {
          display: block;
          font-size: 13px;
          color: var(--dim);
          margin-bottom: 8px;
          font-weight: 500;
        }
        .form-input,
        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 10px;
          color: var(--text);
          font-size: 14px;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #6366f1;
        }
        .form-textarea {
          min-height: 140px;
          resize: vertical;
        }
        .form-submit {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
          font-family: inherit;
        }
        .form-submit:hover:not(:disabled) {
          opacity: 0.9;
        }
        .form-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .form-success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          text-align: center;
        }
        .form-success-title {
          font-size: 15px;
          font-weight: 600;
          color: #10b981;
          margin-bottom: 8px;
        }
        .form-success-desc {
          font-size: 14px;
          color: var(--muted);
        }
        .form-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          text-align: center;
        }
        .form-error-title {
          font-size: 15px;
          font-weight: 600;
          color: #ef4444;
          margin-bottom: 8px;
        }
        .form-error-desc {
          font-size: 14px;
          color: var(--muted);
        }
        @media (max-width: 768px) {
          .support-grid {
            grid-template-columns: 1fr;
          }
          .support-page {
            padding: 100px 16px 60px;
          }
          .contact-form {
            padding: 24px;
          }
        }
      `}</style>

      <div className="support-page">
        <div className="support-wrap">
          {/* Header */}
          <div className="support-header">
            <h1 className="support-title">How can we help?</h1>
            <p className="support-subtitle">
              Get in touch with our support team. We're here to help you succeed with ClipVoBooster.
            </p>
          </div>

          {/* Support Options Cards */}
          <div className="support-grid">
            <div className="support-card">
              <div className="support-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h3 className="support-card-title">Email Support</h3>
              <p className="support-card-desc">
                Send us an email and we'll get back to you within 24 hours.
              </p>
              <a href="mailto:trivora00@gmail.com" className="support-card-link">trivora00@gmail.com →</a>
            </div>

            <div className="support-card">
              <div className="support-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="support-card-title">Contact Form</h3>
              <p className="support-card-desc">
                Fill out the form below and we'll respond as soon as possible.
              </p>
              <a href="#contact-form" className="support-card-link">Open form →</a>
            </div>
          </div>

          {/* Support Info */}
          <div className="support-info">
            <h2 className="support-info-title">Support Information</h2>
            <div className="support-info-grid">
              <div className="support-info-item">
                <span className="support-info-label">Support Hours</span>
                <span className="support-info-value">Monday - Friday, 9AM - 6PM EAT</span>
              </div>
              <div className="support-info-item">
                <span className="support-info-label">Response Time</span>
                <span className="support-info-value">Within 24 hours</span>
              </div>
              <div className="support-info-item">
                <span className="support-info-label">Email</span>
                <span className="support-info-value"><a href="mailto:trivora00@gmail.com">trivora00@gmail.com</a></span>
              </div>
              <div className="support-info-item">
                <span className="support-info-label">Billing</span>
                <span className="support-info-value"><a href="mailto:trivora00@gmail.com">trivora00@gmail.com</a></span>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="faq-section">
            <h2 className="faq-title">Frequently Asked Questions</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <p className="faq-question">How do I reset my password?</p>
                <p className="faq-answer">Go to the login page and click "Forgot Password". We'll send you a link to reset your password via email.</p>
              </div>
              <div className="faq-item">
                <p className="faq-question">Can I upgrade or downgrade my plan?</p>
                <p className="faq-answer">Yes! You can upgrade your plan at any time from your dashboard. Downgrades take effect at the end of your billing cycle.</p>
              </div>
              <div className="faq-item">
                <p className="faq-question">How do I cancel my subscription?</p>
                <p className="faq-answer">You can cancel anytime by emailing us at trivora00@gmail.com or from your dashboard settings. Your subscription remains active until the end of the billing period.</p>
              </div>
              <div className="faq-item">
                <p className="faq-question">What is your refund policy?</p>
                <p className="faq-answer">We offer a 14-day money-back guarantee for Professional Plan subscriptions. For Lifetime Plan purchases, refunds are available within 7 days. See our Refund Policy for details.</p>
              </div>
              <div className="faq-item">
                <p className="faq-question">Do you offer discounts for nonprofits or education?</p>
                <p className="faq-answer">Yes! We offer special pricing for nonprofits and educational institutions. Contact us at trivora00@gmail.com to learn more.</p>
              </div>
              <div className="faq-item">
                <p className="faq-question">How can I export my data?</p>
                <p className="faq-answer">You can export your contacts and campaign data from your dashboard. Go to Settings → Export Data to download your information in CSV format.</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div id="contact-form" className="contact-form">
            <h2 className="contact-form-title">Send us a message</h2>
            <p className="contact-form-desc">
              Fill out the form below and we'll get back to you within 24 hours.
            </p>

            {submitStatus === "success" && (
              <div className="form-success">
                <p className="form-success-title">✅ Message sent!</p>
                <p className="form-success-desc">We'll get back to you within 24 hours.</p>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="form-error">
                <p className="form-error-title">Something went wrong</p>
                <p className="form-error-desc">Please try again or email us directly at trivora00@gmail.com</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="form-input"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="How can we help?"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  className="form-textarea"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us more about your question..."
                />
              </div>

              <button type="submit" className="form-submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
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
